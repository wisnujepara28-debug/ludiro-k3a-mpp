import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

const DB_FILE = path.resolve(process.cwd(), 'data/shipping_db.json');

interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  fullName: string;
  role: string;
  avatar: string;
  department: string;
}

interface Ship {
  id: string;
  name: string;
  imo: string;
  callSign: string;
  type: string;
  flag: string;
  yearBuilt: number;
  dwt: number;
  teuCapacity: number;
  lengthOverall: number;
  beam: number;
  draft: number;
  status: string;
  currentPort: string;
  destinationPort: string;
  speedKnots: number;
  fuelLevelPct: number;
  masterName: string;
  notes?: string;
}

interface Voyage {
  id: string;
  voyageNumber: string;
  shipId: string;
  shipName: string;
  portOfLoading: string;
  portOfDischarge: string;
  departureTime: string;
  estimatedArrival: string;
  status: string;
  capacityUsagePct: number;
  cargoTonnage: number;
  totalTeu: number;
  bunkerFuelMt: number;
  remarks?: string;
}

interface Cargo {
  id: string;
  blNumber: string;
  voyageId: string;
  voyageNumber: string;
  shipperName: string;
  consigneeName: string;
  commodityType: string;
  containerNumber: string;
  packageCount: number;
  packageUnit: string;
  grossWeightMt: number;
  volumeCbm: number;
  hazardous: boolean;
  customsStatus: string;
  status: string;
}

interface Crew {
  id: string;
  seafarerCode: string;
  fullName: string;
  rank: string;
  assignedShipId: string;
  assignedShipName: string;
  stcwCertificate: string;
  certificateExpiry: string;
  certStatus: string;
  contractEndDate: string;
  nationality: string;
  phone: string;
  emergencyContact: string;
}

interface ActivityLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
  userName: string;
}

interface DatabaseSchema {
  users: User[];
  ships: Ship[];
  voyages: Voyage[];
  cargo: Cargo[];
  crew: Crew[];
  activityLogs: ActivityLog[];
}

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      throw new Error(`Database file not found at ${DB_FILE}`);
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read database:', err);
    return { users: [], ships: [], voyages: [], cargo: [], crew: [], activityLogs: [] };
  }
}

function writeDb(data: DatabaseSchema): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database:', err);
    throw new Error('Database persistence write failure');
  }
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.end(JSON.stringify(data));
}

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e7) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Active sessions memory store
const activeSessions = new Map<string, { user: User; expiresAt: number }>();

// Real-time Server-Sent Events (SSE) Client Connections pool
const sseClients = new Set<ServerResponse>();

export function broadcastRealtimeEvent(event: string, payload: any) {
  const data = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
  for (const client of sseClients) {
    try {
      client.write(`event: ${event}\ndata: ${data}\n\n`);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

export async function handleMaritimeApi(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) {
  const url = req.url || '';
  if (!url.startsWith('/api/')) {
    return next();
  }

  const parsedUrl = new URL(url, 'http://localhost');
  const pathname = parsedUrl.pathname;
  const method = req.method || 'GET';

  try {
    // ---------------- REAL-TIME SERVER-SENT EVENTS (SSE) STREAM ----------------
    if (pathname === '/api/events' && method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });
      res.write(`data: ${JSON.stringify({ status: 'connected', time: new Date().toISOString() })}\n\n`);

      sseClients.add(res);

      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
    }

    // ---------------- AUTH ROUTES (BEBAS TANPA KETENTUAN) ----------------
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const { identifier, password } = body;

      // Bebas tanpa ada ketentuan: if empty, default to "admin"
      const cleanIdent = String(identifier || 'admin').trim();
      const cleanPass = String(password || '').trim();

      const db = readDb();
      let user = db.users.find(
        (u) =>
          u.username.toLowerCase() === cleanIdent.toLowerCase() ||
          u.email.toLowerCase() === cleanIdent.toLowerCase()
      );

      // If user does not exist yet, dynamically register them on the fly!
      if (!user) {
        const capitalized = cleanIdent.charAt(0).toUpperCase() + cleanIdent.slice(1);
        user = {
          id: `usr-${Date.now()}`,
          username: cleanIdent,
          email: `${cleanIdent.toLowerCase().replace(/\s+/g, '.')}@javaranusantara.co.id`,
          password: cleanPass || '123',
          fullName: `${capitalized} (Javara Nusantara Executive)`,
          role: 'Administrator Maritim',
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
          department: 'Operasional Maritim & Logistik',
        };
        db.users.push(user);
        writeDb(db);
      }

      // Generate session token
      const token = `token-${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const { password: _, ...userSafe } = user;
      activeSessions.set(token, {
        user: userSafe as User,
        expiresAt: Date.now() + 24 * 3600 * 1000,
      });

      // Log login
      db.activityLogs.unshift({
        id: `log-${Date.now()}`,
        action: 'LOGIN',
        entity: 'Auth',
        entityId: user.id,
        details: `${user.fullName} masuk ke sistem Javara Nusantara`,
        timestamp: new Date().toISOString(),
        userName: user.fullName,
      });
      writeDb(db);

      // Broadcast login event
      broadcastRealtimeEvent('activity_log', {
        action: 'LOGIN',
        userName: user.fullName,
        timestamp: new Date().toISOString(),
      });

      return sendJson(res, 200, {
        success: true,
        message: 'Login berhasil.',
        token,
        user: userSafe,
      });
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace(/^Bearer\s+/, '');
      if (token && activeSessions.has(token)) {
        const session = activeSessions.get(token)!;
        if (session.expiresAt > Date.now()) {
          return sendJson(res, 200, {
            success: true,
            user: session.user,
          });
        }
      }
      return sendJson(res, 401, {
        success: false,
        error: 'Sesi kedaluwarsa atau tidak terautentikasi.',
      });
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace(/^Bearer\s+/, '');
      if (token) {
        activeSessions.delete(token);
      }
      return sendJson(res, 200, { success: true, message: 'Berhasil keluar.' });
    }

    // ---------------- STATS & AUDIT LOGS ----------------
    if (pathname === '/api/stats' && method === 'GET') {
      const db = readDb();
      const totalShips = db.ships.length;
      const activeShips = db.ships.filter((s) => s.status === 'Underway' || s.status === 'Berthed').length;
      const underwayShips = db.ships.filter((s) => s.status === 'Underway').length;
      const drydockShips = db.ships.filter((s) => s.status === 'Drydock').length;
      const activeVoyages = db.voyages.filter((v) => v.status === 'In Progress').length;
      const scheduledVoyages = db.voyages.filter((v) => v.status === 'Scheduled').length;
      const totalCargoTonnage = db.cargo.reduce((sum, c) => sum + (c.grossWeightMt || 0), 0);
      const totalTeuInTransit = db.voyages
        .filter((v) => v.status === 'In Progress')
        .reduce((sum, v) => sum + (v.totalTeu || 0), 0);
      const totalCrew = db.crew.length;
      const expiringCerts = db.crew.filter((c) => c.certStatus === 'Expiring Soon' || c.certStatus === 'Expired').length;

      return sendJson(res, 200, {
        success: true,
        stats: {
          totalShips,
          activeShips,
          underwayShips,
          drydockShips,
          activeVoyages,
          scheduledVoyages,
          totalCargoTonnage: Math.round(totalCargoTonnage * 10) / 10,
          totalTeuInTransit,
          totalCrew,
          expiringCerts,
        },
      });
    }

    if (pathname === '/api/logs' && method === 'GET') {
      const db = readDb();
      return sendJson(res, 200, {
        success: true,
        logs: db.activityLogs.slice(0, 50),
      });
    }

    // ---------------- SHIPS CRUD ----------------
    if (pathname === '/api/ships') {
      const db = readDb();
      if (method === 'GET') {
        const q = parsedUrl.searchParams.get('q')?.toLowerCase() || '';
        const status = parsedUrl.searchParams.get('status') || '';
        const type = parsedUrl.searchParams.get('type') || '';

        let results = db.ships;
        if (q) {
          results = results.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.imo.toLowerCase().includes(q) ||
              s.callSign.toLowerCase().includes(q) ||
              s.currentPort.toLowerCase().includes(q)
          );
        }
        if (status && status !== 'ALL') {
          results = results.filter((s) => s.status === status);
        }
        if (type && type !== 'ALL') {
          results = results.filter((s) => s.type === type);
        }

        return sendJson(res, 200, { success: true, count: results.length, data: results });
      }

      if (method === 'POST') {
        const body = await parseBody(req);
        if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
          return sendJson(res, 400, { success: false, error: 'Nama kapal wajib diisi.' });
        }

        const newShip: Ship = {
          id: `vsl-${Date.now()}`,
          name: body.name.trim(),
          imo: (body.imo || `IMO ${Math.floor(9000000 + Math.random() * 999999)}`).trim().toUpperCase(),
          callSign: (body.callSign || 'YJVN').trim().toUpperCase(),
          type: body.type || 'Container Ship',
          flag: body.flag || 'Indonesia',
          yearBuilt: Number(body.yearBuilt) || new Date().getFullYear(),
          dwt: Number(body.dwt) || 25000,
          teuCapacity: Number(body.teuCapacity) || 0,
          lengthOverall: Number(body.lengthOverall) || 160,
          beam: Number(body.beam) || 24,
          draft: Number(body.draft) || 9.0,
          status: body.status || 'Berthed',
          currentPort: body.currentPort?.trim() || 'Tanjung Priok, Jakarta',
          destinationPort: body.destinationPort?.trim() || 'Tanjung Perak, Surabaya',
          speedKnots: Number(body.speedKnots) || 0.0,
          fuelLevelPct: Math.min(100, Math.max(0, Number(body.fuelLevelPct) || 85)),
          masterName: body.masterName?.trim() || 'Capt. Belum Ditugaskan',
          notes: body.notes?.trim() || '',
        };

        db.ships.unshift(newShip);
        db.activityLogs.unshift({
          id: `log-${Date.now()}`,
          action: 'CREATE',
          entity: 'Ship',
          entityId: newShip.id,
          details: `Kapal "${newShip.name}" (${newShip.imo}) berhasil didaftarkan ke armada Javara Nusantara`,
          timestamp: new Date().toISOString(),
          userName: body.userName || 'Admin Sistem',
        });
        writeDb(db);

        // Real-time broadcast to all connected clients
        broadcastRealtimeEvent('database_sync', { entity: 'ships', action: 'create', data: newShip });

        return sendJson(res, 201, {
          success: true,
          message: `Kapal "${newShip.name}" berhasil didaftarkan.`,
          data: newShip,
        });
      }
    }

    if (pathname.startsWith('/api/ships/')) {
      const id = pathname.replace('/api/ships/', '');
      const db = readDb();
      const index = db.ships.findIndex((s) => s.id === id);

      if (index === -1) {
        return sendJson(res, 404, { success: false, error: 'Data kapal tidak ditemukan.' });
      }

      if (method === 'GET') {
        return sendJson(res, 200, { success: true, data: db.ships[index] });
      }

      if (method === 'PUT') {
        const body = await parseBody(req);
        const existing = db.ships[index];
        const updated: Ship = {
          ...existing,
          name: body.name ? body.name.trim() : existing.name,
          imo: body.imo ? body.imo.trim().toUpperCase() : existing.imo,
          callSign: body.callSign ? body.callSign.trim().toUpperCase() : existing.callSign,
          type: body.type || existing.type,
          flag: body.flag || existing.flag,
          yearBuilt: body.yearBuilt ? Number(body.yearBuilt) : existing.yearBuilt,
          dwt: body.dwt !== undefined ? Number(body.dwt) : existing.dwt,
          teuCapacity: body.teuCapacity !== undefined ? Number(body.teuCapacity) : existing.teuCapacity,
          lengthOverall: body.lengthOverall !== undefined ? Number(body.lengthOverall) : existing.lengthOverall,
          beam: body.beam !== undefined ? Number(body.beam) : existing.beam,
          draft: body.draft !== undefined ? Number(body.draft) : existing.draft,
          status: body.status || existing.status,
          currentPort: body.currentPort !== undefined ? body.currentPort.trim() : existing.currentPort,
          destinationPort: body.destinationPort !== undefined ? body.destinationPort.trim() : existing.destinationPort,
          speedKnots: body.speedKnots !== undefined ? Number(body.speedKnots) : existing.speedKnots,
          fuelLevelPct: body.fuelLevelPct !== undefined ? Math.min(100, Math.max(0, Number(body.fuelLevelPct))) : existing.fuelLevelPct,
          masterName: body.masterName !== undefined ? body.masterName.trim() : existing.masterName,
          notes: body.notes !== undefined ? body.notes.trim() : existing.notes,
        };

        db.ships[index] = updated;

        if (existing.name !== updated.name) {
          db.voyages.forEach((v) => {
            if (v.shipId === updated.id) v.shipName = updated.name;
          });
          db.crew.forEach((c) => {
            if (c.assignedShipId === updated.id) c.assignedShipName = updated.name;
          });
        }

        db.activityLogs.unshift({
          id: `log-${Date.now()}`,
          action: 'UPDATE',
          entity: 'Ship',
          entityId: updated.id,
          details: `Perubahan data kapal "${updated.name}" disimpan.`,
          timestamp: new Date().toISOString(),
          userName: body.userName || 'Admin Sistem',
        });
        writeDb(db);

        // Real-time broadcast
        broadcastRealtimeEvent('database_sync', { entity: 'ships', action: 'update', data: updated });

        return sendJson(res, 200, {
          success: true,
          message: `Data kapal "${updated.name}" berhasil diperbarui.`,
          data: updated,
        });
      }

      if (method === 'DELETE') {
        const ship = db.ships[index];
        const hasActiveVoyage = db.voyages.some(
          (v) => v.shipId === ship.id && (v.status === 'In Progress' || v.status === 'Scheduled')
        );
        if (hasActiveVoyage) {
          return sendJson(res, 400, {
            success: false,
            error: `Tidak dapat menghapus kapal "${ship.name}" karena masih memiliki jadwal pelayaran aktif atau terjadwal. Harap selesaikan pelayaran terlebih dahulu.`,
          });
        }

        db.ships.splice(index, 1);
        db.activityLogs.unshift({
          id: `log-${Date.now()}`,
          action: 'DELETE',
          entity: 'Ship',
          entityId: ship.id,
          details: `Kapal "${ship.name}" telah dihapus dari armada.`,
          timestamp: new Date().toISOString(),
          userName: 'Admin Sistem',
        });
        writeDb(db);

        // Real-time broadcast
        broadcastRealtimeEvent('database_sync', { entity: 'ships', action: 'delete', id });

        return sendJson(res, 200, {
          success: true,
          message: `Kapal "${ship.name}" berhasil dihapus dari armada.`,
        });
      }
    }

    // ---------------- VOYAGES CRUD ----------------
    if (pathname === '/api/voyages') {
      const db = readDb();
      if (method === 'GET') {
        return sendJson(res, 200, { success: true, count: db.voyages.length, data: db.voyages });
      }

      if (method === 'POST') {
        const body = await parseBody(req);
        if (!body.voyageNumber) {
          return sendJson(res, 400, { success: false, error: 'Nomor pelayaran wajib diisi.' });
        }
        if (!body.shipId) {
          return sendJson(res, 400, { success: false, error: 'Kapal pelaksana wajib dipilih.' });
        }

        const ship = db.ships.find((s) => s.id === body.shipId);
        if (!ship) {
          return sendJson(res, 400, { success: false, error: 'Kapal yang dipilih tidak terdaftar.' });
        }

        const newVoyage: Voyage = {
          id: `vyg-${Date.now()}`,
          voyageNumber: body.voyageNumber.trim().toUpperCase(),
          shipId: ship.id,
          shipName: ship.name,
          portOfLoading: body.portOfLoading?.trim() || 'Tanjung Priok',
          portOfDischarge: body.portOfDischarge?.trim() || 'Tanjung Perak',
          departureTime: body.departureTime || new Date().toISOString(),
          estimatedArrival: body.estimatedArrival || new Date(Date.now() + 86400000).toISOString(),
          status: body.status || 'Scheduled',
          capacityUsagePct: Number(body.capacityUsagePct) || 85,
          cargoTonnage: Number(body.cargoTonnage) || 20000,
          totalTeu: Number(body.totalTeu) || 0,
          bunkerFuelMt: Number(body.bunkerFuelMt) || 300,
          remarks: body.remarks?.trim() || '',
        };

        db.voyages.unshift(newVoyage);
        db.activityLogs.unshift({
          id: `log-${Date.now()}`,
          action: 'CREATE',
          entity: 'Voyage',
          entityId: newVoyage.id,
          details: `Jadwal pelayaran ${newVoyage.voyageNumber} (${ship.name}) berhasil diterbitkan.`,
          timestamp: new Date().toISOString(),
          userName: body.userName || 'Admin Sistem',
        });
        writeDb(db);

        // Real-time broadcast
        broadcastRealtimeEvent('database_sync', { entity: 'voyages', action: 'create', data: newVoyage });

        return sendJson(res, 201, {
          success: true,
          message: `Jadwal pelayaran ${newVoyage.voyageNumber} berhasil dibuat.`,
          data: newVoyage,
        });
      }
    }

    if (pathname.startsWith('/api/voyages/')) {
      const id = pathname.replace('/api/voyages/', '');
      const db = readDb();
      const index = db.voyages.findIndex((v) => v.id === id);

      if (index === -1) {
        return sendJson(res, 404, { success: false, error: 'Jadwal pelayaran tidak ditemukan.' });
      }

      if (method === 'GET') {
        return sendJson(res, 200, { success: true, data: db.voyages[index] });
      }

      if (method === 'PUT') {
        const body = await parseBody(req);
        const existing = db.voyages[index];

        let shipName = existing.shipName;
        if (body.shipId && body.shipId !== existing.shipId) {
          const ship = db.ships.find((s) => s.id === body.shipId);
          if (ship) shipName = ship.name;
        }

        const updated: Voyage = {
          ...existing,
          voyageNumber: body.voyageNumber ? body.voyageNumber.trim().toUpperCase() : existing.voyageNumber,
          shipId: body.shipId || existing.shipId,
          shipName: shipName,
          portOfLoading: body.portOfLoading ? body.portOfLoading.trim() : existing.portOfLoading,
          portOfDischarge: body.portOfDischarge ? body.portOfDischarge.trim() : existing.portOfDischarge,
          departureTime: body.departureTime || existing.departureTime,
          estimatedArrival: body.estimatedArrival || existing.estimatedArrival,
          status: body.status || existing.status,
          capacityUsagePct: body.capacityUsagePct !== undefined ? Number(body.capacityUsagePct) : existing.capacityUsagePct,
          cargoTonnage: body.cargoTonnage !== undefined ? Number(body.cargoTonnage) : existing.cargoTonnage,
          totalTeu: body.totalTeu !== undefined ? Number(body.totalTeu) : existing.totalTeu,
          bunkerFuelMt: body.bunkerFuelMt !== undefined ? Number(body.bunkerFuelMt) : existing.bunkerFuelMt,
          remarks: body.remarks !== undefined ? body.remarks.trim() : existing.remarks,
        };

        db.voyages[index] = updated;
        db.activityLogs.unshift({
          id: `log-${Date.now()}`,
          action: 'UPDATE',
          entity: 'Voyage',
          entityId: updated.id,
          details: `Perubahan jadwal pelayaran ${updated.voyageNumber} tersimpan.`,
          timestamp: new Date().toISOString(),
          userName: body.userName || 'Admin Sistem',
        });
        writeDb(db);

        // Real-time broadcast
        broadcastRealtimeEvent('database_sync', { entity: 'voyages', action: 'update', data: updated });

        return sendJson(res, 200, {
          success: true,
          message: `Jadwal pelayaran ${updated.voyageNumber} berhasil diperbarui.`,
          data: updated,
        });
      }

      if (method === 'DELETE') {
        const voyage = db.voyages[index];
        db.voyages.splice(index, 1);
        db.activityLogs.unshift({
          id: `log-${Date.now()}`,
          action: 'DELETE',
          entity: 'Voyage',
          entityId: voyage.id,
          details: `Pelayaran ${voyage.voyageNumber} telah dihapus.`,
          timestamp: new Date().toISOString(),
          userName: 'Admin Sistem',
        });
        writeDb(db);

        // Real-time broadcast
        broadcastRealtimeEvent('database_sync', { entity: 'voyages', action: 'delete', id });

        return sendJson(res, 200, {
          success: true,
          message: `Jadwal pelayaran ${voyage.voyageNumber} berhasil dihapus.`,
        });
      }
    }

    // ---------------- CARGO & BILL OF LADING CRUD ----------------
    if (pathname === '/api/cargo') {
      const db = readDb();
      if (method === 'GET') {
        return sendJson(res, 200, { success: true, count: db.cargo.length, data: db.cargo });
      }

      if (method === 'POST') {
        const body = await parseBody(req);
        if (!body.blNumber || !body.shipperName) {
          return sendJson(res, 400, { success: false, error: 'Nomor B/L dan Pengirim wajib diisi.' });
        }

        let voyageNumber = body.voyageNumber || 'Umum';
        if (body.voyageId) {
          const v = db.voyages.find((x) => x.id === body.voyageId);
          if (v) voyageNumber = v.voyageNumber;
        }

        const newCargo: Cargo = {
          id: `crg-${Date.now()}`,
          blNumber: body.blNumber.trim().toUpperCase(),
          voyageId: body.voyageId || '',
          voyageNumber: voyageNumber,
          shipperName: body.shipperName.trim(),
          consigneeName: (body.consigneeName || 'Penerima Terdaftar').trim(),
          commodityType: (body.commodityType || 'Kargo Peti Kemas').trim(),
          containerNumber: (body.containerNumber || 'JVNU-102030-4').trim().toUpperCase(),
          packageCount: Number(body.packageCount) || 1,
          packageUnit: body.packageUnit?.trim() || 'Units',
          grossWeightMt: Number(body.grossWeightMt) || 10,
          volumeCbm: Number(body.volumeCbm) || 0,
          hazardous: Boolean(body.hazardous),
          customsStatus: body.customsStatus?.trim() || 'SPPB Clear',
          status: body.status || 'Loaded',
        };

        db.cargo.unshift(newCargo);
        db.activityLogs.unshift({
          id: `log-${Date.now()}`,
          action: 'CREATE',
          entity: 'Cargo',
          entityId: newCargo.id,
          details: `Kargo B/L ${newCargo.blNumber} (${newCargo.shipperName}) berhasil diterbitkan.`,
          timestamp: new Date().toISOString(),
          userName: body.userName || 'Admin Sistem',
        });
        writeDb(db);

        // Real-time broadcast
        broadcastRealtimeEvent('database_sync', { entity: 'cargo', action: 'create', data: newCargo });

        return sendJson(res, 201, {
          success: true,
          message: `Manifes kargo B/L ${newCargo.blNumber} berhasil dibuat.`,
          data: newCargo,
        });
      }
    }

    if (pathname.startsWith('/api/cargo/')) {
      const id = pathname.replace('/api/cargo/', '');
      const db = readDb();
      const index = db.cargo.findIndex((c) => c.id === id);

      if (index === -1) {
        return sendJson(res, 404, { success: false, error: 'Data kargo tidak ditemukan.' });
      }

      if (method === 'GET') {
        return sendJson(res, 200, { success: true, data: db.cargo[index] });
      }

      if (method === 'PUT') {
        const body = await parseBody(req);
        const existing = db.cargo[index];

        let voyageNumber = existing.voyageNumber;
        if (body.voyageId && body.voyageId !== existing.voyageId) {
          const v = db.voyages.find((x) => x.id === body.voyageId);
          if (v) voyageNumber = v.voyageNumber;
        }

        const updated: Cargo = {
          ...existing,
          blNumber: body.blNumber ? body.blNumber.trim().toUpperCase() : existing.blNumber,
          voyageId: body.voyageId !== undefined ? body.voyageId : existing.voyageId,
          voyageNumber: voyageNumber,
          shipperName: body.shipperName ? body.shipperName.trim() : existing.shipperName,
          consigneeName: body.consigneeName ? body.consigneeName.trim() : existing.consigneeName,
          commodityType: body.commodityType ? body.commodityType.trim() : existing.commodityType,
          containerNumber: body.containerNumber ? body.containerNumber.trim().toUpperCase() : existing.containerNumber,
          packageCount: body.packageCount !== undefined ? Number(body.packageCount) : existing.packageCount,
          packageUnit: body.packageUnit ? body.packageUnit.trim() : existing.packageUnit,
          grossWeightMt: body.grossWeightMt !== undefined ? Number(body.grossWeightMt) : existing.grossWeightMt,
          volumeCbm: body.volumeCbm !== undefined ? Number(body.volumeCbm) : existing.volumeCbm,
          hazardous: body.hazardous !== undefined ? Boolean(body.hazardous) : existing.hazardous,
          customsStatus: body.customsStatus ? body.customsStatus.trim() : existing.customsStatus,
          status: body.status || existing.status,
        };

        db.cargo[index] = updated;
        db.activityLogs.unshift({
          id: `log-${Date.now()}`,
          action: 'UPDATE',
          entity: 'Cargo',
          entityId: updated.id,
          details: `Status kargo B/L ${updated.blNumber} diperbarui.`,
          timestamp: new Date().toISOString(),
          userName: body.userName || 'Admin Sistem',
        });
        writeDb(db);

        // Real-time broadcast
        broadcastRealtimeEvent('database_sync', { entity: 'cargo', action: 'update', data: updated });

        return sendJson(res, 200, {
          success: true,
          message: `Data kargo B/L ${updated.blNumber} berhasil diperbarui.`,
          data: updated,
        });
      }

      if (method === 'DELETE') {
        const cargo = db.cargo[index];
        db.cargo.splice(index, 1);
        db.activityLogs.unshift({
          id: `log-${Date.now()}`,
          action: 'DELETE',
          entity: 'Cargo',
          entityId: cargo.id,
          details: `Manifes kargo B/L ${cargo.blNumber} telah dihapus.`,
          timestamp: new Date().toISOString(),
          userName: 'Admin Sistem',
        });
        writeDb(db);

        // Real-time broadcast
        broadcastRealtimeEvent('database_sync', { entity: 'cargo', action: 'delete', id });

        return sendJson(res, 200, {
          success: true,
          message: `Kargo B/L ${cargo.blNumber} berhasil dihapus.`,
        });
      }
    }

    // ---------------- CREW CRUD ----------------
    if (pathname === '/api/crew') {
      const db = readDb();
      if (method === 'GET') {
        return sendJson(res, 200, { success: true, count: db.crew.length, data: db.crew });
      }

      if (method === 'POST') {
        const body = await parseBody(req);
        if (!body.fullName) {
          return sendJson(res, 400, { success: false, error: 'Nama pelaut wajib diisi.' });
        }

        let assignedShipName = 'Standby Pool (Darat)';
        if (body.assignedShipId) {
          const s = db.ships.find((x) => x.id === body.assignedShipId);
          if (s) assignedShipName = s.name;
        }

        const expDate = new Date(body.certificateExpiry || '2028-12-31');
        const now = new Date();
        const diffMonths = (expDate.getTime() - now.getTime()) / (1000 * 3600 * 24 * 30);
        let certStatus = 'Valid';
        if (diffMonths <= 0) certStatus = 'Expired';
        else if (diffMonths <= 3) certStatus = 'Expiring Soon';

        const newCrew: Crew = {
          id: `crw-${Date.now()}`,
          seafarerCode: (body.seafarerCode || `SEA-JVN-${Math.floor(100000 + Math.random() * 900000)}`).trim().toUpperCase(),
          fullName: body.fullName.trim(),
          rank: body.rank?.trim() || 'Nakhoda (Master Mariner)',
          assignedShipId: body.assignedShipId || '',
          assignedShipName: assignedShipName,
          stcwCertificate: body.stcwCertificate?.trim() || 'STCW Manila Amendments Approved',
          certificateExpiry: body.certificateExpiry || '2028-12-31',
          certStatus: certStatus,
          contractEndDate: body.contractEndDate || '2027-12-31',
          nationality: body.nationality?.trim() || 'Indonesia',
          phone: body.phone?.trim() || '-',
          emergencyContact: body.emergencyContact?.trim() || '-',
        };

        db.crew.unshift(newCrew);
        db.activityLogs.unshift({
          id: `log-${Date.now()}`,
          action: 'CREATE',
          entity: 'Crew',
          entityId: newCrew.id,
          details: `Awak kapal ${newCrew.fullName} (${newCrew.rank}) terdaftar pada ${newCrew.assignedShipName}.`,
          timestamp: new Date().toISOString(),
          userName: body.userName || 'Admin Sistem',
        });
        writeDb(db);

        // Real-time broadcast
        broadcastRealtimeEvent('database_sync', { entity: 'crew', action: 'create', data: newCrew });

        return sendJson(res, 201, {
          success: true,
          message: `Awak kapal "${newCrew.fullName}" berhasil ditambahkan.`,
          data: newCrew,
        });
      }
    }

    if (pathname.startsWith('/api/crew/')) {
      const id = pathname.replace('/api/crew/', '');
      const db = readDb();
      const index = db.crew.findIndex((c) => c.id === id);

      if (index === -1) {
        return sendJson(res, 404, { success: false, error: 'Data awak kapal tidak ditemukan.' });
      }

      if (method === 'GET') {
        return sendJson(res, 200, { success: true, data: db.crew[index] });
      }

      if (method === 'PUT') {
        const body = await parseBody(req);
        const existing = db.crew[index];

        let assignedShipName = existing.assignedShipName;
        if (body.assignedShipId !== undefined) {
          if (!body.assignedShipId) {
            assignedShipName = 'Standby Pool (Darat)';
          } else {
            const s = db.ships.find((x) => x.id === body.assignedShipId);
            if (s) assignedShipName = s.name;
          }
        }

        const expDate = body.certificateExpiry ? new Date(body.certificateExpiry) : new Date(existing.certificateExpiry);
        const now = new Date();
        const diffMonths = (expDate.getTime() - now.getTime()) / (1000 * 3600 * 24 * 30);
        let certStatus = 'Valid';
        if (diffMonths <= 0) certStatus = 'Expired';
        else if (diffMonths <= 3) certStatus = 'Expiring Soon';

        const updated: Crew = {
          ...existing,
          seafarerCode: body.seafarerCode ? body.seafarerCode.trim().toUpperCase() : existing.seafarerCode,
          fullName: body.fullName ? body.fullName.trim() : existing.fullName,
          rank: body.rank || existing.rank,
          assignedShipId: body.assignedShipId !== undefined ? body.assignedShipId : existing.assignedShipId,
          assignedShipName: assignedShipName,
          stcwCertificate: body.stcwCertificate ? body.stcwCertificate.trim() : existing.stcwCertificate,
          certificateExpiry: body.certificateExpiry || existing.certificateExpiry,
          certStatus: certStatus,
          contractEndDate: body.contractEndDate || existing.contractEndDate,
          nationality: body.nationality ? body.nationality.trim() : existing.nationality,
          phone: body.phone ? body.phone.trim() : existing.phone,
          emergencyContact: body.emergencyContact ? body.emergencyContact.trim() : existing.emergencyContact,
        };

        db.crew[index] = updated;
        db.activityLogs.unshift({
          id: `log-${Date.now()}`,
          action: 'UPDATE',
          entity: 'Crew',
          entityId: updated.id,
          details: `Data awak kapal ${updated.fullName} diperbarui.`,
          timestamp: new Date().toISOString(),
          userName: body.userName || 'Admin Sistem',
        });
        writeDb(db);

        // Real-time broadcast
        broadcastRealtimeEvent('database_sync', { entity: 'crew', action: 'update', data: updated });

        return sendJson(res, 200, {
          success: true,
          message: `Data awak kapal "${updated.fullName}" berhasil diperbarui.`,
          data: updated,
        });
      }

      if (method === 'DELETE') {
        const member = db.crew[index];
        db.crew.splice(index, 1);
        db.activityLogs.unshift({
          id: `log-${Date.now()}`,
          action: 'DELETE',
          entity: 'Crew',
          entityId: member.id,
          details: `Awak kapal ${member.fullName} telah dihapus dari sistem.`,
          timestamp: new Date().toISOString(),
          userName: 'Admin Sistem',
        });
        writeDb(db);

        // Real-time broadcast
        broadcastRealtimeEvent('database_sync', { entity: 'crew', action: 'delete', id });

        return sendJson(res, 200, {
          success: true,
          message: `Awak kapal "${member.fullName}" berhasil dihapus.`,
        });
      }
    }

    return sendJson(res, 404, { success: false, error: 'Endpoint API tidak ditemukan.' });
  } catch (error: any) {
    console.error('API Error:', error);
    return sendJson(res, 500, {
      success: false,
      error: error?.message || 'Terjadi kesalahan internal server.',
    });
  }
}
