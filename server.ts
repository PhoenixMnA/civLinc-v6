import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_ASSEMBLIES,
  INITIAL_BRANCHES,
  INITIAL_ISSUES,
  INITIAL_TICKETS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS
} from './src/services/initialData';
import {
  CivicIssue,
  AppointmentTicket,
  MunicipalAssembly,
  AgencyBranch,
  SecurityAuditLog,
  CivicNotification,
  GhanaCardProfile
} from './src/types';
import { normalizeServiceAgency } from './src/utils/agencyHelpers';

// In-Memory Database initialized with Ghanaian Civic datasets
let dbAssemblies: MunicipalAssembly[] = [...INITIAL_ASSEMBLIES];
let dbBranches: AgencyBranch[] = [...INITIAL_BRANCHES];
let dbIssues: CivicIssue[] = [...INITIAL_ISSUES];
let dbTickets: AppointmentTicket[] = [...INITIAL_TICKETS];
let dbAuditLogs: SecurityAuditLog[] = [...INITIAL_AUDIT_LOGS];
let dbNotifications: CivicNotification[] = [...INITIAL_NOTIFICATIONS];

// Registered Users in memory
let dbUsers: (GhanaCardProfile & { passwordHash?: string; pin?: string; role: 'citizen' | 'municipal_admin' | 'super_admin'; municipalityId?: string })[] = [
  {
    idNumber: 'GHA-728190342-1',
    fullName: 'Kwame Mensah',
    dateOfBirth: '1992-04-14',
    gender: 'MALE',
    digitalAddress: 'GA-183-9023',
    district: 'Accra Metropolitan Assembly (AMA)',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    phone: '+233 24 412 8901',
    pin: '1234',
    role: 'citizen'
  },
  {
    idNumber: 'GHA-849102934-9',
    fullName: 'Efua Sutherland',
    dateOfBirth: '1995-11-20',
    gender: 'FEMALE',
    digitalAddress: 'GA-294-8192',
    district: 'Korle Klottey Municipal Assembly (KoKMA)',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    phone: '+233 50 123 4567',
    pin: '1234',
    role: 'citizen'
  },
  {
    idNumber: 'GHA-000000001-0',
    fullName: 'Ing. Emmanuel Tetteh',
    dateOfBirth: '1984-06-15',
    gender: 'MALE',
    digitalAddress: 'GA-001-0001',
    district: 'Accra Metropolitan Assembly (AMA)',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    phone: '+233 20 000 0001',
    pin: '9999',
    role: 'municipal_admin',
    municipalityId: 'asm-ama-01'
  },
  {
    idNumber: 'GHA-ROOT-00000-1',
    fullName: 'Hon. National Director (Jubilee House)',
    dateOfBirth: '1975-03-06',
    gender: 'MALE',
    digitalAddress: 'GA-000-0001',
    district: 'National Secretariat (Jubilee House)',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    phone: '+233 30 200 0000',
    pin: '0000',
    role: 'super_admin'
  }
];

// Municipal Credentials mapping for Staff / Admin Authentication
interface MunicipalCredential {
  assemblyId: string;
  code: string;
  name: string;
  adminEmail: string;
  password: string;
  dceName: string;
}

let dbMunicipalCredentials: MunicipalCredential[] = [
  {
    assemblyId: 'asm-ama-01',
    code: 'AMA',
    name: 'Accra Metropolitan Assembly',
    adminEmail: 'admin.ama@civiclink.gov.gh',
    password: 'AmaAdmin2026!',
    dceName: 'Hon. Elizabeth K.T. Sackey'
  },
  {
    assemblyId: 'asm-kokma-02',
    code: 'KoKMA',
    name: 'Korle Klottey Municipal Assembly',
    adminEmail: 'admin.kokma@civiclink.gov.gh',
    password: 'KokmaAdmin2026!',
    dceName: 'Hon. Nii Adjei Tawiah'
  },
  {
    assemblyId: 'asm-kma-01',
    code: 'KMA',
    name: 'Kumasi Metropolitan Assembly',
    adminEmail: 'admin.kma@civiclink.gov.gh',
    password: 'KmaAdmin2026!',
    dceName: 'Hon. Samuel Pyne'
  },
  {
    assemblyId: 'asm-tma-01',
    code: 'TMA',
    name: 'Tema Metropolitan Assembly',
    adminEmail: 'admin.tma@civiclink.gov.gh',
    password: 'TmaAdmin2026!',
    dceName: 'Hon. Yohane Amarh Ashitey'
  },
  {
    assemblyId: 'asm-tama-01',
    code: 'TaMA',
    name: 'Tamale Metropolitan Assembly',
    adminEmail: 'admin.tama@civiclink.gov.gh',
    password: 'TamaAdmin2026!',
    dceName: 'Hon. Sule Salifu'
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log API requests
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API ${req.method}] ${req.path}`);
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'CivicLink Ghana & Ghost Door API',
      timestamp: new Date().toISOString(),
      counts: {
        issues: dbIssues.length,
        tickets: dbTickets.length,
        assemblies: dbAssemblies.length,
        branches: dbBranches.length
      }
    });
  });

  // ==========================================
  // AUTHENTICATION ENDPOINTS (CITIZEN & ADMIN)
  // ==========================================

  // Citizen / Admin Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { identifier, pin, phone, idNumber } = req.body;
    const lookupKey = (identifier || phone || idNumber || '').trim().toLowerCase();

    const user = dbUsers.find(
      (u) =>
        u.idNumber.toLowerCase() === lookupKey ||
        u.phone.replace(/\s+/g, '').includes(lookupKey.replace(/\s+/g, '')) ||
        u.fullName.toLowerCase().includes(lookupKey)
    );

    if (!user) {
      // Auto-provision a verified Ghana Card user profile if not found for seamless mobile defense demo
      const newUser: GhanaCardProfile & { role: 'citizen' } = {
        idNumber: identifier && identifier.startsWith('GHA-') ? identifier : `GHA-${Math.floor(100000000 + Math.random() * 900000000)}-${Math.floor(1 + Math.random() * 9)}`,
        fullName: identifier && !identifier.startsWith('GHA-') ? identifier : 'Verified Citizen',
        dateOfBirth: '1996-05-12',
        gender: 'MALE',
        digitalAddress: 'GA-482-1920',
        district: 'Accra Metropolitan Assembly (AMA)',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        isVerified: true,
        phone: phone || '+233 24 000 1234',
        role: 'citizen'
      };
      dbUsers.push(newUser);

      return res.json({
        success: true,
        message: 'Ghana Card authenticated and session registered.',
        user: newUser,
        token: `token_gh_${Date.now()}`
      });
    }

    // Optional PIN verification check (accept standard PINs)
    if (pin && user.pin && user.pin !== pin && pin !== '1234' && pin !== '9999' && pin !== '0000') {
      return res.status(401).json({ success: false, error: 'Invalid Ghana Card PIN.' });
    }

    res.json({
      success: true,
      message: 'Login successful.',
      user,
      token: `token_gh_${Date.now()}`
    });
  });

  // Citizen Signup / Registration
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { idNumber, fullName, phone, digitalAddress, district, dateOfBirth, gender, pin } = req.body;

    if (!idNumber || !fullName || !phone) {
      return res.status(400).json({ success: false, error: 'Ghana Card ID, Full Legal Name, and Phone are required.' });
    }

    const existing = dbUsers.find((u) => u.idNumber === idNumber);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Ghana Card ID already registered in the National Registry.' });
    }

    const newUser = {
      idNumber: idNumber.toUpperCase().startsWith('GHA-') ? idNumber.toUpperCase() : `GHA-${idNumber.toUpperCase()}`,
      fullName,
      phone,
      digitalAddress: digitalAddress || 'GA-100-2026',
      district: district || 'Accra Metropolitan Assembly (AMA)',
      dateOfBirth: dateOfBirth || '1998-01-01',
      gender: gender || 'MALE',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
      pin: pin || '1234',
      role: 'citizen' as const
    };

    dbUsers.push(newUser);

    // Audit log
    dbAuditLogs.unshift({
      id: `AUD-${Math.floor(9000 + Math.random() * 999)}`,
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_SUCCESS',
      userId: newUser.idNumber,
      userRole: 'citizen',
      ipAddress: req.ip || '102.176.88.24',
      locationVerified: true,
      bssid: 'CITIZEN-PORTAL',
      details: `New citizen registration: ${newUser.fullName} (${newUser.idNumber})`,
      severity: 'info'
    });

    res.status(201).json({
      success: true,
      message: 'Citizen profile successfully registered with NIA credentials.',
      user: newUser,
      token: `token_gh_${Date.now()}`
    });
  });

  // Dedicated Municipal Admin / Staff Login (by Municipal ID / Code + Password)
  app.post('/api/auth/municipal-login', (req: Request, res: Response) => {
    const { municipalId, password } = req.body;
    const lookup = (municipalId || '').trim().toLowerCase();

    if (!lookup || !password) {
      return res.status(400).json({ success: false, error: 'Municipal ID / Code and Password are required.' });
    }

    // Match credential by code, assemblyId, or adminEmail
    const cred = dbMunicipalCredentials.find(
      (c) =>
        c.code.toLowerCase() === lookup ||
        c.assemblyId.toLowerCase() === lookup ||
        c.adminEmail.toLowerCase() === lookup ||
        c.name.toLowerCase().includes(lookup)
    );

    const matchedAssembly = cred
      ? dbAssemblies.find((a) => a.id === cred.assemblyId) || dbAssemblies.find((a) => a.code.toLowerCase() === cred.code.toLowerCase())
      : dbAssemblies.find(
          (a) =>
            a.code.toLowerCase() === lookup ||
            a.id.toLowerCase() === lookup ||
            a.name.toLowerCase().includes(lookup) ||
            a.adminEmail.toLowerCase() === lookup
        );

    // Accept exact password or presentation universal master keys
    const validPasswords = cred
      ? [cred.password, 'admin123', 'GH-ADMIN-2026', `${cred.code}Admin2026!`, `${cred.code}2026`]
      : ['admin123', 'GH-ADMIN-2026', 'BLACKSTAR-2026'];

    if (!cred && !matchedAssembly) {
      return res.status(404).json({
        success: false,
        error: `Municipal Assembly with identifier "${municipalId}" was not found in the national registry.`
      });
    }

    if (!validPasswords.includes(password.trim())) {
      dbAuditLogs.unshift({
        id: `AUD-${Math.floor(9000 + Math.random() * 999)}`,
        timestamp: new Date().toISOString(),
        eventType: 'AUTH_FAILURE_MFA',
        userId: cred?.adminEmail || lookup,
        userRole: 'municipal_admin',
        ipAddress: req.ip || '197.251.100.1',
        locationVerified: false,
        bssid: 'UNVERIFIED-NETWORK',
        details: `Failed municipal admin password attempt for assembly "${cred?.name || lookup}".`,
        severity: 'warn'
      });
      return res.status(401).json({ success: false, error: 'Invalid Municipal Assembly password.' });
    }

    const assembly = matchedAssembly || dbAssemblies[0];
    const adminUser: GhanaCardProfile & { role: 'municipal_admin'; municipalityId: string } = {
      idNumber: `GHA-MMDA-${assembly.code}-01`,
      fullName: `Eng. Officer (${assembly.code} Works)`,
      dateOfBirth: '1985-08-12',
      gender: 'MALE',
      digitalAddress: `${assembly.code}-001-2026`,
      district: assembly.name,
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
      phone: '+233 20 555 0100',
      role: 'municipal_admin',
      municipalityId: assembly.id
    };

    // Log success in audit
    dbAuditLogs.unshift({
      id: `AUD-${Math.floor(9000 + Math.random() * 999)}`,
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_SUCCESS',
      userId: cred?.adminEmail || `admin.${assembly.code.toLowerCase()}@civiclink.gov.gh`,
      userRole: 'municipal_admin',
      ipAddress: req.ip || '197.251.134.42',
      locationVerified: true,
      bssid: assembly.allowedBssids[0] || 'AMA-HQ-WIFI-01',
      details: `Municipal Admin authenticated successfully for tenant assembly [${assembly.name}]. RLS active.`,
      severity: 'info'
    });

    res.json({
      success: true,
      message: `Authenticated as Municipal Administrator for ${assembly.name}.`,
      role: 'municipal_admin',
      municipalityId: assembly.id,
      assembly,
      user: adminUser,
      token: `token_mmda_${assembly.code}_${Date.now()}`
    });
  });

  // Dedicated Super Admin Login (Jubilee House Root)
  app.post('/api/auth/super-admin-login', (req: Request, res: Response) => {
    const { passkey, username, password } = req.body;
    const input = (passkey || password || '').trim();

    const validPasskeys = ['GHOST-DOOR-ROOT', 'GH-ADMIN-2026', 'BLACKSTAR-2026', 'admin123', 'root', 'JubileeHouse2026!'];

    if (!validPasskeys.includes(input)) {
      dbAuditLogs.unshift({
        id: `AUD-${Math.floor(9000 + Math.random() * 999)}`,
        timestamp: new Date().toISOString(),
        eventType: 'AUTH_FAILURE_MFA',
        userId: username || 'ROOT_ATTEMPT',
        userRole: 'super_admin',
        ipAddress: req.ip || '197.251.100.1',
        locationVerified: false,
        bssid: 'EXTERNAL-ACCESS',
        details: `Failed Super Admin authentication attempt.`,
        severity: 'critical'
      });
      return res.status(401).json({ success: false, error: 'Invalid Super Administrator authorization passkey.' });
    }

    const superAdminUser: GhanaCardProfile & { role: 'super_admin' } = {
      idNumber: 'GHA-ROOT-00000-1',
      fullName: 'Hon. National Director (Jubilee House)',
      dateOfBirth: '1975-03-06',
      gender: 'MALE',
      digitalAddress: 'GA-000-0001',
      district: 'National Secretariat (Jubilee House)',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
      phone: '+233 30 200 0000',
      role: 'super_admin'
    };

    dbAuditLogs.unshift({
      id: `AUD-${Math.floor(9000 + Math.random() * 999)}`,
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_SUCCESS',
      userId: 'root.superadmin@gov.gh',
      userRole: 'super_admin',
      ipAddress: req.ip || '197.251.134.42',
      locationVerified: true,
      bssid: 'CASTLE-SECURE-LAN',
      details: 'Root Super Administrator logged in with full tenant override privileges.',
      severity: 'info'
    });

    res.json({
      success: true,
      message: 'Super Administrator authenticated with national root privileges.',
      role: 'super_admin',
      user: superAdminUser,
      token: `token_root_${Date.now()}`
    });
  });

  // Super Admin: Register New District / Municipal Assembly with Credentials
  app.post('/api/admin/register-district', (req: Request, res: Response) => {
    const {
      name,
      code,
      password,
      region,
      headquarters,
      dceName,
      adminEmail,
      coordinates,
      radiusKm,
      allowedBssids,
      allowedIpSubnet
    } = req.body;

    if (!name || !code || !password) {
      return res.status(400).json({
        success: false,
        error: 'Municipal Name, Municipal ID / Code, and Secure Password are required.'
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const existingAsm = dbAssemblies.find((a) => a.code.toUpperCase() === cleanCode);
    if (existingAsm) {
      return res.status(409).json({
        success: false,
        error: `A Municipal Assembly with ID/Code "${cleanCode}" is already registered.`
      });
    }

    const assemblyId = `asm-${cleanCode.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const email = adminEmail ? adminEmail.trim() : `admin.${cleanCode.toLowerCase()}@civiclink.gov.gh`;
    const dce = dceName ? dceName.trim() : 'Hon. District Chief Executive';

    const newAssembly: MunicipalAssembly = {
      id: assemblyId,
      name: name.trim(),
      code: cleanCode,
      region: region || 'Greater Accra',
      headquarters: headquarters || 'Municipal Assembly Office',
      dceName: dce,
      adminEmail: email,
      coordinates: coordinates || { lat: 5.5800 + Math.random() * 0.1, lng: -0.1900 + Math.random() * 0.1 },
      radiusKm: Number(radiusKm) || 12,
      activeIssuesCount: 0,
      resolvedIssuesCount: 0,
      allowedBssids: allowedBssids || [`${cleanCode}-HQ-SECURE-LAN`],
      allowedIpSubnet: allowedIpSubnet || '197.251.180.0/24'
    };

    // Store in Assemblies array
    dbAssemblies.push(newAssembly);

    // Store in Municipal Credentials array for immediate login
    dbMunicipalCredentials.push({
      assemblyId: newAssembly.id,
      code: cleanCode,
      name: newAssembly.name,
      adminEmail: email,
      password: password.trim(),
      dceName: dce
    });

    // Create user record in dbUsers
    dbUsers.push({
      idNumber: `GHA-MMDA-${cleanCode}-01`,
      fullName: `Admin (${newAssembly.name})`,
      dateOfBirth: '1985-01-01',
      gender: 'MALE',
      digitalAddress: `${cleanCode}-001-2026`,
      district: newAssembly.name,
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
      phone: '+233 20 000 0000',
      pin: '9999',
      role: 'municipal_admin',
      municipalityId: newAssembly.id
    });

    dbAuditLogs.unshift({
      id: `AUD-${Math.floor(9000 + Math.random() * 999)}`,
      timestamp: new Date().toISOString(),
      eventType: 'ASSEMBLY_PROVISIONED',
      userId: 'root.superadmin@gov.gh',
      userRole: 'super_admin',
      ipAddress: req.ip || '197.251.100.1',
      locationVerified: true,
      bssid: 'CASTLE-SECURE-LAN',
      details: `New Municipal Assembly registered: ${newAssembly.name} (${newAssembly.code}). Credentials initialized for login.`,
      severity: 'info'
    });

    res.status(201).json({
      success: true,
      message: `Municipal Assembly "${newAssembly.name}" (${newAssembly.code}) has been successfully created and registered for staff authentication.`,
      data: newAssembly,
      credentials: {
        code: newAssembly.code,
        adminEmail: email,
        assemblyId: newAssembly.id
      }
    });
  });

  // Hidden Gatekeeper Verification for GhostDoor Admin
  app.post('/api/auth/verify-ghost-door', (req: Request, res: Response) => {
    const { passkey, role, districtId, gpsCoord, bssid } = req.body;

    // Gatekeeper secret passcodes for final year presentation
    const validPasskeys = ['GH-ADMIN-2026', 'GHOST-DOOR-ROOT', 'BLACKSTAR-2026', 'admin123', 'root'];

    if (!validPasskeys.includes((passkey || '').trim())) {
      dbAuditLogs.unshift({
        id: `AUD-${Math.floor(9000 + Math.random() * 999)}`,
        timestamp: new Date().toISOString(),
        eventType: 'AUTH_FAILURE_MFA',
        userId: 'UNAUTHORIZED_ATTEMPT',
        userRole: 'anonymous',
        ipAddress: req.ip || '197.251.100.1',
        locationVerified: false,
        bssid: bssid || 'UNSECURED_WIFI',
        details: `Failed Ghost Door admin passcode attempt: "${passkey}". Stealth lock active.`,
        severity: 'critical'
      });
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Invalid Ghost Door stealth credential.'
      });
    }

    const assignedRole = role === 'super_admin' ? 'super_admin' : 'municipal_admin';

    dbAuditLogs.unshift({
      id: `AUD-${Math.floor(9000 + Math.random() * 999)}`,
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_SUCCESS',
      userId: assignedRole === 'super_admin' ? 'root.superadmin@gov.gh' : `admin.${(districtId || 'ama').toLowerCase()}@civiclink.gov.gh`,
      userRole: assignedRole,
      ipAddress: req.ip || '197.251.134.42',
      locationVerified: true,
      bssid: bssid || 'AMA-HQ-WIFI-01',
      details: `Ghost Door stealth gateway unlocked for role [${assignedRole.toUpperCase()}]. Assembly: ${districtId || 'AMA'}.`,
      severity: 'info'
    });

    res.json({
      success: true,
      message: 'Ghost Door security credentials authenticated.',
      role: assignedRole,
      districtId: districtId || 'asm-ama-01',
      token: `ghost_token_${Date.now()}`
    });
  });

  // ==========================================
  // CIVICONNECT INCIDENT REPORTS (CRUD)
  // ==========================================

  // READ all reports (with optional query filter by category / district / status)
  app.get('/api/reports', (req: Request, res: Response) => {
    const { category, districtId, status, search } = req.query;

    let filtered = [...dbIssues];

    if (category && category !== 'all') {
      filtered = filtered.filter((i) => i.category === category);
    }
    if (districtId && districtId !== 'all') {
      filtered = filtered.filter((i) => i.districtId === districtId);
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((i) => i.status === status);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.address.toLowerCase().includes(q) ||
          i.districtName.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  });

  // READ single report
  app.get('/api/reports/:id', (req: Request, res: Response) => {
    const report = dbIssues.find((i) => i.id === req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Civic report not found.' });
    }
    res.json({ success: true, data: report });
  });

  // CREATE new report (POST)
  app.post('/api/reports', (req: Request, res: Response) => {
    const {
      title,
      description,
      category,
      subcategory,
      districtId,
      coordinates,
      address,
      landmark,
      imageUrl,
      isAnonymous,
      authorName,
      authorGhanaCardMasked
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, error: 'Title, description, and category are required.' });
    }

    // Match assembly
    const matchedAssembly = dbAssemblies.find((a) => a.id === districtId) || dbAssemblies[0];
    const newId = `ISS-${matchedAssembly.code}-${new Date().getFullYear()}-${String(dbIssues.length + 1).padStart(3, '0')}`;

    const newReport: CivicIssue = {
      id: newId,
      title,
      description,
      category,
      subcategory: subcategory || 'Civic Infrastructure Concern',
      districtId: matchedAssembly.id,
      districtName: matchedAssembly.name,
      coordinates: coordinates || { lat: matchedAssembly.coordinates.lat, lng: matchedAssembly.coordinates.lng },
      address: address || `${matchedAssembly.headquarters}, Ghana`,
      landmark: landmark || 'Prominent Junction',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=900&q=80',
      isAnonymous: Boolean(isAnonymous),
      authorName: isAnonymous ? 'Anonymous Citizen' : (authorName || 'Verified Citizen'),
      authorGhanaCardMasked: isAnonymous ? 'GHA-***-PROTECTED' : (authorGhanaCardMasked || 'GHA-728190***-1'),
      upvotes: 1,
      upvoterIds: ['citizen-creator-initial'],
      priority: 'medium',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedDepartment: `${matchedAssembly.code} Municipal Works & Engineering`
    };

    dbIssues.unshift(newReport);
    matchedAssembly.activeIssuesCount += 1;

    // Send notification
    dbNotifications.unshift({
      id: `notif-${Date.now()}`,
      title: '📢 New Civic Incident Published',
      message: `Report "${newReport.title.slice(0, 40)}..." published to ${matchedAssembly.name}.`,
      type: 'issue_escalated',
      timestamp: 'Just now',
      read: false,
      issueId: newReport.id
    });

    res.status(201).json({
      success: true,
      message: 'Civic report created and dispatched to municipal authorities.',
      data: newReport
    });
  });

  // UPDATE report (PATCH / PUT)
  app.patch('/api/reports/:id', (req: Request, res: Response) => {
    const index = dbIssues.findIndex((i) => i.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Civic report not found.' });
    }

    const current = dbIssues[index];
    const updated = {
      ...current,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // If status changed to resolved, update assembly counters
    if (current.status !== 'resolved' && updated.status === 'resolved') {
      const asm = dbAssemblies.find((a) => a.id === updated.districtId);
      if (asm) {
        asm.activeIssuesCount = Math.max(0, asm.activeIssuesCount - 1);
        asm.resolvedIssuesCount += 1;
      }
    }

    dbIssues[index] = updated;

    res.json({
      success: true,
      message: 'Civic report updated successfully.',
      data: updated
    });
  });

  // UPVOTE / CANCEL UPVOTE on report
  app.post('/api/reports/:id/upvote', (req: Request, res: Response) => {
    const report = dbIssues.find((i) => i.id === req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Civic report not found.' });
    }

    const { citizenId } = req.body;
    const voter = citizenId || 'gh-citizen-active';
    const hasVoted = report.upvoterIds.includes(voter);

    if (hasVoted) {
      report.upvotes = Math.max(0, report.upvotes - 1);
      report.upvoterIds = report.upvoterIds.filter((id) => id !== voter);
    } else {
      report.upvotes += 1;
      report.upvoterIds.push(voter);

      // Auto-escalation threshold check
      if (report.upvotes >= 20 && report.priority !== 'urgent') {
        report.priority = 'urgent';
        dbNotifications.unshift({
          id: `notif-esc-${Date.now()}`,
          title: `🚨 Urgent Escalation: ${report.title.slice(0, 36)}...`,
          message: `Civic report exceeded 20+ citizen upvotes. Auto-escalated to URGENT priority.`,
          type: 'issue_escalated',
          timestamp: 'Just now',
          read: false,
          issueId: report.id
        });
      }
    }

    report.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      hasVoted: !hasVoted,
      upvotes: report.upvotes,
      priority: report.priority,
      data: report
    });
  });

  // SUBMIT RESOLUTION PROOF
  app.post('/api/reports/:id/resolve', (req: Request, res: Response) => {
    const report = dbIssues.find((i) => i.id === req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Civic report not found.' });
    }

    const { afterImageUrl, engineerName, engineerTitle, workDetails, materialsCostGHS } = req.body;
    const stampId = `${report.districtId.toUpperCase()}-STAMP-${Math.floor(1000 + Math.random() * 9000)}`;

    report.status = 'resolved';
    report.resolutionProof = {
      resolvedAt: new Date().toISOString(),
      afterImageUrl: afterImageUrl || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80',
      engineerName: engineerName || 'Ing. Emmanuel Tetteh',
      engineerTitle: engineerTitle || 'Municipal Works Engineer',
      workDetails: workDetails || 'Completed corrective works under Municipal Assembly quality standards.',
      materialsCostGHS: Number(materialsCostGHS) || 12500,
      officialStampId: stampId
    };
    report.updatedAt = new Date().toISOString();

    const asm = dbAssemblies.find((a) => a.id === report.districtId);
    if (asm) {
      asm.activeIssuesCount = Math.max(0, asm.activeIssuesCount - 1);
      asm.resolvedIssuesCount += 1;
    }

    dbAuditLogs.unshift({
      id: `AUD-${Math.floor(9000 + Math.random() * 999)}`,
      timestamp: new Date().toISOString(),
      eventType: 'RESOLUTION_SIGNED',
      userId: engineerName || 'Municipal Engineer',
      userRole: 'municipal_admin',
      ipAddress: req.ip || '197.251.134.42',
      locationVerified: true,
      bssid: 'AMA-HQ-WIFI-01',
      details: `Resolution proof verified and signed for report ${report.id}. Stamp: ${stampId}`,
      severity: 'info'
    });

    res.json({
      success: true,
      message: 'Resolution proof submitted and signed on public ledger.',
      data: report
    });
  });

  // DELETE report (Admin or Author)
  app.delete('/api/reports/:id', (req: Request, res: Response) => {
    const index = dbIssues.findIndex((i) => i.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Civic report not found.' });
    }

    const removed = dbIssues.splice(index, 1)[0];
    const asm = dbAssemblies.find((a) => a.id === removed.districtId);
    if (asm && removed.status !== 'resolved') {
      asm.activeIssuesCount = Math.max(0, asm.activeIssuesCount - 1);
    }

    res.json({
      success: true,
      message: `Report ${req.params.id} has been permanently deleted from the database.`,
      data: removed
    });
  });

  // ==========================================
  // QUEUE APPOINTMENT TICKETS (CRUD)
  // ==========================================

  // READ all tickets (with agency, district, or citizen filter)
  app.get('/api/tickets', (req: Request, res: Response) => {
    const { agency, citizenId, branchId, status, district } = req.query;

    let filtered = [...dbTickets];
    if (agency && agency !== 'all') {
      const targetNorm = normalizeServiceAgency(String(agency));
      filtered = filtered.filter((t) => normalizeServiceAgency(t.serviceAgency) === targetNorm);
    }
    if (citizenId) {
      filtered = filtered.filter((t) => t.citizenId === citizenId || t.ghanaCardNumber === citizenId);
    }
    if (branchId && branchId !== 'all') {
      filtered = filtered.filter((t) => t.branchId === branchId);
    }
    if (district && district !== 'all') {
      const distQuery = String(district).toLowerCase();
      filtered = filtered.filter((t) => {
        const branch = dbBranches.find((b) => b.id === t.branchId);
        return branch ? branch.district.toLowerCase().includes(distQuery) : true;
      });
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((t) => t.status === status);
    }

    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  });

  // READ single ticket
  app.get('/api/tickets/:id', (req: Request, res: Response) => {
    const ticket = dbTickets.find((t) => t.id === req.params.id || t.ticketNumber === req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Appointment ticket not found.' });
    }
    res.json({ success: true, data: ticket });
  });

  // CREATE / BOOK new appointment ticket (POST)
  app.post('/api/tickets', (req: Request, res: Response) => {
    const {
      serviceAgency,
      serviceType,
      branchId,
      appointmentDate,
      timeSlot,
      checklist,
      citizenName,
      citizenPhone,
      ghanaCardNumber
    } = req.body;

    if (!serviceAgency || !serviceType || !branchId || !appointmentDate || !timeSlot) {
      return res.status(400).json({ success: false, error: 'Missing required appointment parameters.' });
    }

    const normAgency = normalizeServiceAgency(serviceAgency);
    const branch = dbBranches.find((b) => b.id === branchId) || dbBranches.find((b) => normalizeServiceAgency(b.agency) === normAgency) || dbBranches[0];

    const prefix = normAgency === 'DVLA' ? 'DVLA' : normAgency === 'Passport' ? 'PASS' : normAgency === 'Police' ? 'POL' : 'GHS';
    const nextSeq = Math.floor(100 + Math.random() * 899);
    const ticketNumber = `${prefix}-${nextSeq}`;

    const newTicket: AppointmentTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber,
      serviceAgency: normAgency,
      serviceType,
      branchId: branch.id,
      branchName: branch.name,
      citizenId: ghanaCardNumber || 'gh-citizen-active',
      citizenName: citizenName || 'Kwame Mensah',
      citizenPhone: citizenPhone || '+233 24 412 8901',
      ghanaCardNumber: ghanaCardNumber || 'GHA-728190342-1',
      appointmentDate,
      timeSlot,
      requiredChecklist: checklist || [
        { id: 'c1', label: 'Original Ghana Card (Physical)', checked: true, requiredNote: 'Mandatory verification' },
        { id: 'c2', label: 'Agency Required Documents', checked: true, requiredNote: 'Official stamped copies' }
      ],
      status: 'booked',
      isGeofenceActivated: false,
      simulatedDistanceKm: 2.8,
      currentServingTicket: `${prefix}-${Math.max(10, nextSeq - 4)}`,
      assignedCounter: `Counter ${Math.floor(1 + Math.random() * (branch.countersCount || 4))}`,
      etaMinutes: 18,
      createdAt: new Date().toISOString()
    };

    dbTickets.unshift(newTicket);

    dbNotifications.unshift({
      id: `notif-tkt-${Date.now()}`,
      title: `🎫 Appointment Booked: ${ticketNumber}`,
      message: `Your ${normAgency} appointment at ${branch.name} is confirmed for ${appointmentDate} (${timeSlot}).`,
      type: 'queue_update',
      timestamp: 'Just now',
      read: false,
      ticketId: newTicket.id
    });

    res.status(201).json({
      success: true,
      message: 'Queue appointment ticket successfully booked.',
      data: newTicket
    });
  });

  // UPDATE / PATCH ticket (Reschedule, Geofence checkin, Counter override)
  app.patch('/api/tickets/:id', (req: Request, res: Response) => {
    const index = dbTickets.findIndex((t) => t.id === req.params.id || t.ticketNumber === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Appointment ticket not found.' });
    }

    const current = dbTickets[index];
    const updated = {
      ...current,
      ...req.body
    };

    dbTickets[index] = updated;

    res.json({
      success: true,
      message: 'Ticket details updated.',
      data: updated
    });
  });

  // CALL ticket to Counter (Admin / Dispatcher action)
  app.post('/api/tickets/:id/call', (req: Request, res: Response) => {
    const ticket = dbTickets.find((t) => t.id === req.params.id || t.ticketNumber === req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found.' });
    }

    const { counterName } = req.body;
    ticket.status = 'called';
    ticket.assignedCounter = counterName || 'Counter 1';
    ticket.etaMinutes = 0;
    ticket.currentServingTicket = ticket.ticketNumber;

    // Update fellow tickets at same branch
    dbTickets.forEach((t) => {
      if (t.branchId === ticket.branchId && t.id !== ticket.id) {
        t.currentServingTicket = ticket.ticketNumber;
      }
    });

    dbNotifications.unshift({
      id: `notif-call-${Date.now()}`,
      title: `🔔 TICKET CALLED: ${ticket.ticketNumber}`,
      message: `Attention ${ticket.citizenName}! Please proceed to ${ticket.assignedCounter} immediately.`,
      type: 'ticket_called',
      timestamp: 'Just now',
      read: false,
      ticketId: ticket.id
    });

    res.json({
      success: true,
      message: `Ticket ${ticket.ticketNumber} called to ${ticket.assignedCounter}.`,
      data: ticket
    });
  });

  // COMPLETE ticket
  app.post('/api/tickets/:id/complete', (req: Request, res: Response) => {
    const ticket = dbTickets.find((t) => t.id === req.params.id || t.ticketNumber === req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found.' });
    }

    ticket.status = 'completed';
    ticket.etaMinutes = 0;

    res.json({
      success: true,
      message: `Ticket ${ticket.ticketNumber} marked as completed.`,
      data: ticket
    });
  });

  // DELETE ticket (Cancel appointment)
  app.delete('/api/tickets/:id', (req: Request, res: Response) => {
    const index = dbTickets.findIndex((t) => t.id === req.params.id || t.ticketNumber === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Appointment ticket not found.' });
    }

    const removed = dbTickets.splice(index, 1)[0];

    res.json({
      success: true,
      message: `Appointment ${removed.ticketNumber} was successfully cancelled and deleted.`,
      data: removed
    });
  });

  // ==========================================
  // AGENCIES & MUNICIPAL ASSEMBLIES
  // ==========================================

  app.get('/api/branches', (_req: Request, res: Response) => {
    res.json({ success: true, data: dbBranches });
  });

  // Create New Operational Branch / Service Center (Municipal Admin)
  app.post('/api/branches', (req: Request, res: Response) => {
    const { name, agency, district, address, openHours, countersCount, coordinates } = req.body;

    if (!name || !district) {
      return res.status(400).json({ success: false, error: 'Branch Name and District are required.' });
    }

    const normAgency = normalizeServiceAgency(agency || 'DVLA');

    const newBranch: AgencyBranch = {
      id: `br-${normAgency.toLowerCase()}-${Date.now()}`,
      agency: normAgency,
      name: name.trim(),
      district: district.trim(),
      address: address?.trim() || `${name.trim()}, ${district.trim()}`,
      openHours: openHours?.trim() || '08:00 AM - 04:30 PM (Mon - Fri)',
      countersCount: Number(countersCount) || 4,
      coordinates: coordinates || { lat: 5.5600, lng: -0.2000 }
    };

    dbBranches.push(newBranch);

    dbAuditLogs.unshift({
      id: `AUD-${Math.floor(9000 + Math.random() * 999)}`,
      timestamp: new Date().toISOString(),
      eventType: 'RESOLUTION_SIGNED',
      userId: 'municipal.admin@civiclink.gov.gh',
      userRole: 'municipal_admin',
      ipAddress: req.ip || '197.251.134.1',
      locationVerified: true,
      bssid: 'AMA-OPS-WIFI',
      details: `Created new operational branch: ${newBranch.name} (${newBranch.agency}) in ${newBranch.district}.`,
      severity: 'info'
    });

    res.status(201).json({
      success: true,
      message: `Operational Center "${newBranch.name}" created successfully.`,
      data: newBranch
    });
  });

  app.get('/api/assemblies', (_req: Request, res: Response) => {
    res.json({ success: true, data: dbAssemblies });
  });

  // Dynamic Service Pricing for Assembly
  app.get('/api/assemblies/:id/pricing', (req: Request, res: Response) => {
    const asm = dbAssemblies.find((a) => a.id === req.params.id || a.code.toLowerCase() === req.params.id.toLowerCase());
    if (!asm) {
      return res.status(404).json({ success: false, error: 'Assembly not found' });
    }
    res.json({
      success: true,
      data: asm.servicePricing || {
        DVLA: 'GH₵ 185.00',
        Passport: 'GH₵ 500.00',
        Police: 'GH₵ 120.00',
        Health: 'GH₵ 30.00'
      }
    });
  });

  app.patch('/api/assemblies/:id/pricing', (req: Request, res: Response) => {
    const asm = dbAssemblies.find((a) => a.id === req.params.id || a.code.toLowerCase() === req.params.id.toLowerCase());
    if (!asm) {
      return res.status(404).json({ success: false, error: 'Assembly not found' });
    }

    const { DVLA, Passport, Police, Health } = req.body;
    asm.servicePricing = {
      DVLA: DVLA !== undefined ? String(DVLA) : (asm.servicePricing?.DVLA || 'GH₵ 185.00'),
      Passport: Passport !== undefined ? String(Passport) : (asm.servicePricing?.Passport || 'GH₵ 500.00'),
      Police: Police !== undefined ? String(Police) : (asm.servicePricing?.Police || 'GH₵ 120.00'),
      Health: Health !== undefined ? String(Health) : (asm.servicePricing?.Health || 'GH₵ 30.00')
    };

    dbAuditLogs.unshift({
      id: `AUD-${Math.floor(9000 + Math.random() * 999)}`,
      timestamp: new Date().toISOString(),
      eventType: 'PRIVILEGE_ESCALATION',
      userId: asm.adminEmail || 'admin@civiclink.gov.gh',
      userRole: 'municipal_admin',
      ipAddress: req.ip || '197.251.134.1',
      locationVerified: true,
      bssid: asm.allowedBssids[0] || 'HQ-WIFI',
      details: `Updated dynamic service pricing rates for ${asm.name}: DVLA (${asm.servicePricing.DVLA}), Passport (${asm.servicePricing.Passport}), Police (${asm.servicePricing.Police}), Health (${asm.servicePricing.Health}).`,
      severity: 'info'
    });

    res.json({
      success: true,
      message: `Dynamic service pricing updated for ${asm.name}.`,
      data: asm.servicePricing,
      assembly: asm
    });
  });

  app.post('/api/assemblies', (req: Request, res: Response) => {
    const { name, code, region, headquarters, dceName, adminEmail, coordinates, radiusKm, allowedBssids, allowedIpSubnet } = req.body;

    if (!name || !code || !dceName) {
      return res.status(400).json({ success: false, error: 'Assembly Name, Code, and DCE Name are required.' });
    }

    const newAssembly: MunicipalAssembly = {
      id: `asm-${code.toLowerCase()}-${Date.now()}`,
      name,
      code: code.toUpperCase(),
      region: region || 'Greater Accra',
      headquarters: headquarters || 'Municipal Office',
      dceName,
      adminEmail: adminEmail || `admin.${code.toLowerCase()}@civiclink.gov.gh`,
      coordinates: coordinates || { lat: 5.6037, lng: -0.187 },
      radiusKm: Number(radiusKm) || 12,
      activeIssuesCount: 0,
      resolvedIssuesCount: 0,
      allowedBssids: allowedBssids || [`${code.toUpperCase()}-GOV-WIFI`],
      allowedIpSubnet: allowedIpSubnet || '197.251.200.0/24'
    };

    dbAssemblies.push(newAssembly);

    dbAuditLogs.unshift({
      id: `AUD-${Math.floor(9000 + Math.random() * 999)}`,
      timestamp: new Date().toISOString(),
      eventType: 'ASSEMBLY_PROVISIONED',
      userId: 'root.superadmin@gov.gh',
      userRole: 'super_admin',
      ipAddress: req.ip || '197.251.100.1',
      locationVerified: true,
      bssid: 'CASTLE-SECURE-LAN',
      details: `Provisioned new municipal tenant: ${newAssembly.name} (${newAssembly.code}). DCE: ${newAssembly.dceName}.`,
      severity: 'info'
    });

    res.status(201).json({
      success: true,
      message: `Municipal Assembly ${newAssembly.name} successfully provisioned.`,
      data: newAssembly
    });
  });

  // ==========================================
  // AUDIT LOGS & NOTIFICATIONS
  // ==========================================

  app.get('/api/audit-logs', (_req: Request, res: Response) => {
    res.json({ success: true, data: dbAuditLogs });
  });

  app.post('/api/audit-logs', (req: Request, res: Response) => {
    const newLog: SecurityAuditLog = {
      id: `AUD-${Math.floor(9000 + Math.random() * 999)}`,
      timestamp: new Date().toISOString(),
      ...req.body
    };
    dbAuditLogs.unshift(newLog);
    if (dbAuditLogs.length > 150) dbAuditLogs.pop();
    res.status(201).json({ success: true, data: newLog });
  });

  app.get('/api/notifications', (_req: Request, res: Response) => {
    res.json({ success: true, data: dbNotifications });
  });

  app.post('/api/notifications/mark-read', (req: Request, res: Response) => {
    const { id } = req.body;
    if (id) {
      const notif = dbNotifications.find((n) => n.id === id);
      if (notif) notif.read = true;
    } else {
      dbNotifications.forEach((n) => (n.read = true));
    }
    res.json({ success: true });
  });

  app.delete('/api/notifications', (_req: Request, res: Response) => {
    dbNotifications = [];
    res.json({ success: true, message: 'All notifications cleared.' });
  });

  // ==========================================
  // VITE DEV MIDDLEWARE / STATIC FILE SERVING
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CivicLink Ghana Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
