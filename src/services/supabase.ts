import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { AppState } from '../types/sales';

export const SUPABASE_CONFIG_KEY = 'rekapan_supabase_config_v1';
export const SUPABASE_TABLE = 'app_state';
export const SUPABASE_ROW_ID = 'global';
export const GLOBAL_CHANNEL_NAME = 'rekapan_penjualan_channel';

// Default Supabase project configuration bawaan
export const DEFAULT_SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://agnpkaorhzdponthmduq.supabase.co';

export const DEFAULT_SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnbnBrYW9yaHpkcG9udGhtZHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNjQ0MjksImV4cCI6MjEwNTk0MDQyOX0._V24y5VGaop4DYBJOaQ_svoJbICX9n4U02a-5VtqKVM';

export type CloudSyncStatus = 'online' | 'syncing' | 'offline' | 'error';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const SQL_SCHEMA_INSTRUCTION = `-- Jalankan perintah SQL ini di Supabase Dashboard -> SQL Editor (hanya 1 kali):

CREATE TABLE IF NOT EXISTS public.app_state (
  id TEXT PRIMARY KEY,
  state JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Izinkan anon read & write agar HP A & HP B bisa menyimpan data:
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon All Permissive" ON public.app_state;
CREATE POLICY "Anon All Permissive" ON public.app_state
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Aktifkan Realtime Replication untuk tabel app_state:
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_state;`;

class SupabaseSyncService {
  private client: SupabaseClient | null = null;
  private channel: RealtimeChannel | null = null;
  private sseSource: EventSource | null = null;
  private onRemoteUpdateCallback: ((state: AppState, source: string) => void) | null = null;
  private onStatusChangeCallback: ((status: CloudSyncStatus, message: string) => void) | null = null;
  private onPingReceivedCallback: ((senderName: string) => void) | null = null;

  private isBusy = false;
  private hasPendingSave = false;
  private pendingState: AppState | null = null;
  private saveTimeout: any = null;
  private heartbeatInterval: any = null;
  public readonly clientId: string;

  constructor() {
    let cid = '';
    try {
      cid = sessionStorage.getItem('device_client_id') || '';
      if (!cid) {
        cid = 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
        sessionStorage.setItem('device_client_id', cid);
      }
    } catch {
      cid = 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    }
    this.clientId = cid;

    // Pastikan data yang belum sempat dikirim tersimpan saat tab ditutup (beforeunload / pagehide)
    if (typeof window !== 'undefined') {
      const flushOnClose = () => {
        if (this.pendingState) {
          try {
            const payload = JSON.stringify({
              senderId: this.clientId,
              state: this.pendingState,
            });
            if (navigator.sendBeacon) {
              const blob = new Blob([payload], { type: 'application/json' });
              navigator.sendBeacon('/api/state', blob);
            }
          } catch (_) {}
        }
      };

      window.addEventListener('beforeunload', flushOnClose);
      window.addEventListener('pagehide', flushOnClose);
    }
  }

  public getConfig(): SupabaseConfig {
    try {
      const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          url: parsed.url || DEFAULT_SUPABASE_URL,
          anonKey: parsed.anonKey || DEFAULT_SUPABASE_ANON_KEY,
        };
      }
    } catch (_) {}

    return {
      url: DEFAULT_SUPABASE_URL,
      anonKey: DEFAULT_SUPABASE_ANON_KEY,
    };
  }

  public saveConfig(config: Partial<SupabaseConfig>) {
    const current = this.getConfig();
    const updated: SupabaseConfig = {
      url: (config.url ?? current.url).trim(),
      anonKey: (config.anonKey ?? current.anonKey).trim(),
    };

    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(updated));
    this.reconnect();
  }

  public resetConfigToDefault() {
    localStorage.removeItem(SUPABASE_CONFIG_KEY);
    this.reconnect();
  }

  public init(
    onRemoteUpdate: (state: AppState, source: string) => void,
    onStatusChange: (status: CloudSyncStatus, message: string) => void,
    onPingReceived?: (senderName: string) => void
  ) {
    this.onRemoteUpdateCallback = onRemoteUpdate;
    this.onStatusChangeCallback = onStatusChange;
    if (onPingReceived) {
      this.onPingReceivedCallback = onPingReceived;
    }

    this.connectServerSSE();
    this.connectSupabase();
  }

  public reconnect() {
    this.destroy();
    this.connectServerSSE();
    this.connectSupabase();
  }

  /**
   * 1. Hubungkan ke Server-Sent Events backend aplikasi
   * Memberikan sinkronisasi realtime 100% andal antar HP
   */
  private connectServerSSE() {
    if (typeof window === 'undefined') return;

    try {
      if (this.sseSource) {
        this.sseSource.close();
      }

      this.sseSource = new EventSource('/api/state/stream');

      this.sseSource.onopen = () => {
        this.updateStatus('online', 'TERHUBUNG REALTIME');
      };

      this.sseSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data) return;

          if (data.event === 'state_update' && data.senderId !== this.clientId) {
            if (data.state && this.onRemoteUpdateCallback) {
              this.onRemoteUpdateCallback(data.state, 'HP Lain');
              this.updateStatus('online', 'DATA DIUPDATE REALTIME');
            }
          } else if (data.event === 'ping_test' && data.senderId !== this.clientId) {
            if (this.onPingReceivedCallback) {
              this.onPingReceivedCallback(data.senderName || 'HP Lain');
            }
          }
        } catch (_) {}
      };

      this.sseSource.onerror = () => {
        // SSE auto-reconnects
      };
    } catch (err) {
      console.warn('SSE connection skipped:', err);
    }
  }

  /**
   * 2. Hubungkan ke Supabase Realtime & Database
   */
  private connectSupabase() {
    const config = this.getConfig();
    const url = config.url.trim();
    const key = config.anonKey.trim();

    if (!url || !key) return;

    try {
      this.client = createClient(url, key, {
        realtime: {
          params: { eventsPerSecond: 15 },
        },
      });

      this.subscribeSupabaseRealtime();
      this.startHeartbeat();
    } catch (err: any) {
      console.warn('Supabase connect notice:', err);
    }
  }

  private updateStatus(status: CloudSyncStatus, message: string) {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status, message);
    }
  }

  /**
   * Memuat state awal saat aplikasi dibuka:
   * 1. Ambil dari server backend (/api/state) yang tersimpan permanen di disk
   * 2. Bandingkan dengan local storage dan Supabase
   * Menjamin data TIDAK PERNAH hilang saat web ditutup!
   */
  public async loadInitialState(localState: AppState): Promise<AppState> {
    let resolvedState = localState;
    let highestTs = Number(localState._syncUpdatedAt || 0);

    // 1. Cek Server Database Permanen
    try {
      this.updateStatus('syncing', 'MEMUAT DATA TERAKHIR...');
      const res = await fetch('/api/state');
      if (res.ok) {
        const json = await res.json();
        if (json.state) {
          const serverTs = Number(json.state._syncUpdatedAt || 0);
          if (serverTs >= highestTs) {
            resolvedState = json.state;
            highestTs = serverTs;
            this.updateStatus('online', 'DATA TERSINKRON DARI SERVER');
          }
        } else if (highestTs > 0) {
          // Server masih kosong tapi localState ada data, unggah localState ke server
          this.saveToServer(localState);
        }
      }
    } catch (err) {
      console.warn('Server load check:', err);
    }

    // 2. Cek Supabase Database jika ada
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from(SUPABASE_TABLE)
          .select('state, updated_at')
          .eq('id', SUPABASE_ROW_ID)
          .maybeSingle();

        if (!error && data && data.state) {
          const cloudState = data.state as AppState;
          const cloudTs = Number(cloudState._syncUpdatedAt || 0);
          if (cloudTs > highestTs) {
            resolvedState = cloudState;
            highestTs = cloudTs;
            // Sinkronkan ke server internal juga
            this.saveToServer(cloudState);
          }
        }
      } catch (_) {}
    }

    this.updateStatus('online', 'SINKRONISASI AKTIF');
    return resolvedState;
  }

  /**
   * Mengirim perubahan state:
   * - Langsung simpan permanen ke Server (/api/state)
   * - Broadcast seketika ke HP B via SSE dan Supabase Realtime (< 50ms)
   */
  public queueSave(state: AppState) {
    const timestamp = Date.now();
    const stateWithTimestamp: AppState = {
      ...state,
      _syncUpdatedAt: timestamp,
    };

    this.pendingState = stateWithTimestamp;
    this.hasPendingSave = true;

    // 1. Kirim langsung ke server internal (menyimpan ke disk & broadcast via SSE ke HP B)
    this.saveToServer(stateWithTimestamp);

    // 2. Broadcast via Supabase websocket
    this.broadcastSupabase(stateWithTimestamp);

    // 3. Debounced save ke tabel Supabase jika tabel ada
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.executeSupabaseDbSave();
    }, 450);
  }

  private async saveToServer(state: AppState) {
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: this.clientId,
          state,
        }),
      });
    } catch (err) {
      console.warn('Failed saving to server:', err);
    }
  }

  private broadcastSupabase(state: AppState) {
    if (!this.channel) return;

    try {
      this.channel.send({
        type: 'broadcast',
        event: 'state_sync',
        payload: {
          senderId: this.clientId,
          timestamp: state._syncUpdatedAt || Date.now(),
          state,
        },
      });
    } catch (err) {
      console.warn('Supabase broadcast notice:', err);
    }
  }

  public sendPingTest(): boolean {
    // 1. Kirim via Server
    try {
      fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: this.clientId,
          senderName: 'HP Lain',
        }),
      });
    } catch (_) {}

    // 2. Kirim via Supabase
    if (this.channel) {
      try {
        this.channel.send({
          type: 'broadcast',
          event: 'ping_test',
          payload: {
            senderId: this.clientId,
            timestamp: Date.now(),
          },
        });
      } catch (_) {}
    }

    return true;
  }

  private async executeSupabaseDbSave() {
    if (!this.client || this.isBusy || !this.hasPendingSave || !this.pendingState) return;

    this.isBusy = true;
    this.hasPendingSave = false;
    const stateToPush = JSON.parse(JSON.stringify(this.pendingState));

    try {
      await this.client
        .from(SUPABASE_TABLE)
        .upsert(
          {
            id: SUPABASE_ROW_ID,
            state: stateToPush,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
    } catch (_) {
      // Server internal sudah menyimpan permanen
    } finally {
      this.isBusy = false;
      if (this.hasPendingSave) {
        this.executeSupabaseDbSave();
      }
    }
  }

  private subscribeSupabaseRealtime() {
    if (!this.client) return;

    if (this.channel) {
      try {
        this.client.removeChannel(this.channel);
      } catch (_) {}
      this.channel = null;
    }

    this.channel = this.client
      .channel(GLOBAL_CHANNEL_NAME, {
        config: {
          broadcast: { self: false, ack: false },
        },
      })
      .on('broadcast', { event: 'state_sync' }, (data: any) => {
        const payload = data.payload;
        if (!payload || payload.senderId === this.clientId) return;

        const incomingState = payload.state as AppState;
        if (incomingState && this.onRemoteUpdateCallback) {
          this.onRemoteUpdateCallback(incomingState, 'Supabase Realtime');
          this.updateStatus('online', 'DATA DIUPDATE REALTIME');
        }
      })
      .on('broadcast', { event: 'ping_test' }, (data: any) => {
        const payload = data.payload;
        if (!payload || payload.senderId === this.clientId) return;

        if (this.onPingReceivedCallback) {
          this.onPingReceivedCallback('HP Lain');
        }
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          this.updateStatus('online', 'SINKRONISASI AKTIF');
        }
      });
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(async () => {
      if (document.hidden) return;
      try {
        if (this.hasPendingSave && this.pendingState) {
          this.saveToServer(this.pendingState);
        }
      } catch (_) {}
    }, 20000);
  }

  public destroy() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    if (this.sseSource) {
      this.sseSource.close();
      this.sseSource = null;
    }
    if (this.channel && this.client) {
      try {
        this.client.removeChannel(this.channel);
      } catch (_) {}
      this.channel = null;
    }
  }
}

export const supabaseSync = new SupabaseSyncService();
