import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const STATE_FILE = path.resolve(DATA_DIR, 'app_state.json');

// Pastikan direktori data ada (aman jika filesystem read-only)
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('[Server] Could not create DATA_DIR on disk:', err);
}

// In-memory cache state
let currentState: any = null;

function deduplicateServerState(state: any) {
  if (!state || !state.outlets) return state;
  const uniqueOutlets: any = {};
  const uniqueData: any = {};
  const seenNames = new Map<string, string>();

  const keys = Object.keys(state.outlets).sort((a, b) => {
    const isAStandard = a === 'nusama' || a === 'nusa_indah';
    const isBStandard = b === 'nusama' || b === 'nusa_indah';
    if (isAStandard && !isBStandard) return -1;
    if (!isAStandard && isBStandard) return 1;
    return a.localeCompare(b);
  });

  for (const k of keys) {
    const outlet = state.outlets[k];
    if (!outlet || !outlet.name) continue;
    const norm = outlet.name.trim().toLowerCase();
    if (seenNames.has(norm)) {
      const primaryKey = seenNames.get(norm)!;
      if (state.data && state.data[k] && uniqueData[primaryKey]) {
        for (const shift of ['pagi', 'sore']) {
          if (
            state.data[k][shift]?.produkList?.length > 0 &&
            (!uniqueData[primaryKey][shift]?.produkList || uniqueData[primaryKey][shift].produkList.length === 0)
          ) {
            uniqueData[primaryKey][shift] = state.data[k][shift];
          }
        }
      }
    } else {
      seenNames.set(norm, k);
      uniqueOutlets[k] = { name: outlet.name.trim() };
      uniqueData[k] = state.data?.[k] || {
        activeShift: 'pagi',
        pagi: { modalAwal: 500000, cupAwal: 80, cupTerjualManual: null, cashAktual: 0, produkList: [], pengeluaranList: [], gratisList: [] },
        sore: { modalAwal: 500000, cupAwal: 80, cupTerjualManual: null, cashAktual: 0, produkList: [], pengeluaranList: [], gratisList: [] }
      };
    }
  }

  const OLD_DEMO_NAMES = new Set([
    'kopi susu gula aren',
    'kentang goreng original',
    'matcha latte ice',
    'toast cokelat keju',
    'americano ice',
    'roti bakar kaya butter',
    'cafe latte (normal)',
    'dimsum goreng keju',
    'choco almond',
  ]);

  for (const k of Object.keys(uniqueData)) {
    for (const shift of ['pagi', 'sore']) {
      if (uniqueData[k][shift]?.produkList) {
        uniqueData[k][shift].produkList = uniqueData[k][shift].produkList.filter(
          (p: any) => !OLD_DEMO_NAMES.has((p.nama || '').trim().toLowerCase())
        );
      }
    }
  }

  const validKeys = Object.keys(uniqueOutlets);
  let activeOutlet = state.activeOutlet;
  if (!uniqueOutlets[activeOutlet] && validKeys.length > 0) {
    activeOutlet = validKeys[0];
  }

  const masterProducts = state.masterProducts && state.masterProducts.length > 0 ? state.masterProducts : [];
  const outletStocks = state.outletStocks || {};

  return {
    ...state,
    activeOutlet,
    outlets: uniqueOutlets,
    data: uniqueData,
    businessConfig: state.businessConfig && state.businessConfig.businessName !== 'Kopi Nusantara & Kitchen' ? state.businessConfig : {
      businessName: 'Bintang Hokka Drink',
      tagline: 'Segar, Manis, Bikin Happy!',
      address: 'Jl. Merdeka No. 45',
      phone: '0812-3456-7890',
      logoUrl: '',
      footerText: 'Terima kasih atas kunjungan Anda! Simpan struk ini sebagai bukti pembayaran sah.',
    },
    masterProducts,
    outletStocks,
    adminPin: state.adminPin || 'admin123',
  };
}

// Muat state awal dari disk jika ada
try {
  if (fs.existsSync(STATE_FILE)) {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    currentState = deduplicateServerState(JSON.parse(raw));
    console.log('[Server] Loaded persisted state from disk');
  }
} catch (err) {
  console.error('[Server] Failed to read state file:', err);
}

async function startServer() {
  const app = express();

  // Support command-line --port flag (e.g. from dev runner) or PORT environment variable
  let portArg: number | null = null;
  const portIdx = process.argv.indexOf('--port');
  if (portIdx !== -1 && process.argv[portIdx + 1]) {
    const parsed = Number(process.argv[portIdx + 1]);
    if (!isNaN(parsed) && parsed > 0) {
      portArg = parsed;
    }
  }
  const PORT = portArg || Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoints for Cloud Run startup/liveness probes
  app.get(['/health', '/_health', '/healthz'], (req, res) => {
    res.status(200).send('OK');
  });

  // SSE client pool untuk realtime sync antar HP (HP A <-> HP B)
  const sseClients = new Set<express.Response>();

  // GET /api/state - Ambil state terbaru yang tersimpan permanen
  app.get('/api/state', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      success: true,
      state: currentState,
    });
  });

  // POST /api/state - Simpan state baru dari HP A, simpan permanen ke disk, dan broadcast ke HP B
  app.post('/api/state', (req, res) => {
    const { state, senderId } = req.body;
    if (!state) {
      return res.status(400).json({ error: 'State is required' });
    }

    // Merge cerdas: Pembaruan Outlet Nusama tidak akan menimpa Outlet Nusa Indah
    if (currentState && currentState.data && state.data) {
      currentState = deduplicateServerState({
        ...currentState,
        ...state,
        outlets: {
          ...(currentState.outlets || {}),
          ...(state.outlets || {}),
        },
        data: {
          ...(currentState.data || {}),
          ...(state.data || {}),
        },
        masterProducts: state.masterProducts || currentState.masterProducts || undefined,
        businessConfig: state.businessConfig || currentState.businessConfig || undefined,
        outletStocks: {
          ...(currentState.outletStocks || {}),
          ...(state.outletStocks || {}),
        },
        adminPin: state.adminPin || currentState.adminPin || 'admin123',
        _syncUpdatedAt: Date.now(),
      });
    } else {
      currentState = deduplicateServerState(state);
    }

    // Simpan ke disk secara asinkron
    fs.writeFile(STATE_FILE, JSON.stringify(currentState, null, 2), (err) => {
      if (err) {
        console.error('[Server] Error saving state to disk:', err);
      }
    });

    // Broadcast ke seluruh HP dan browser lain yang sedang aktif
    const message = JSON.stringify({
      event: 'state_update',
      senderId,
      timestamp: Date.now(),
      state: currentState,
    });

    for (const client of sseClients) {
      try {
        client.write(`data: ${message}\n\n`);
      } catch (_) {
        sseClients.delete(client);
      }
    }

    res.json({ success: true, savedAt: Date.now() });
  });

  // GET /api/state/stream - Server-Sent Events untuk realtime sync instan
  app.get('/api/state/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.add(res);

    // Kirim state saat ini jika ada
    if (currentState) {
      res.write(
        `data: ${JSON.stringify({
          event: 'state_init',
          timestamp: Date.now(),
          state: currentState,
        })}\n\n`
      );
    }

    // Ping heartbeat setiap 15 detik agar koneksi tetap hidup di HP
    const heartbeat = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch (_) {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // POST /api/ping - Kirim sinyal test ping antar perangkat
  app.post('/api/ping', (req, res) => {
    const { senderId, senderName } = req.body;
    const message = JSON.stringify({
      event: 'ping_test',
      senderId,
      senderName: senderName || 'HP Lain',
      timestamp: Date.now(),
    });

    for (const client of sseClients) {
      try {
        client.write(`data: ${message}\n\n`);
      } catch (_) {
        sseClients.delete(client);
      }
    }

    res.json({ success: true });
  });

  // Integrasi Vite middlewares di dev atau serving static dist di production
  const distDir = path.resolve(__dirname, 'dist');
  const distIndex = path.resolve(distDir, 'index.html');
  const hasDist = fs.existsSync(distIndex);
  const isExplicitDev = process.env.npm_lifecycle_event === 'dev' || process.env.VITE_DEV === 'true';
  const isProd = process.env.NODE_ENV === 'production' || (!isExplicitDev && hasDist);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      if (fs.existsSync(distIndex)) {
        res.sendFile(distIndex);
      } else {
        res.status(404).send('Not Found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Rekapan Penjualan running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start:', err);
});
