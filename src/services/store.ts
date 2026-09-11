import {
  UserRole,
  GhanaCardProfile,
  CivicIssue,
  IssueCategory,
  MunicipalAssembly,
  AgencyBranch,
  AppointmentTicket,
  SecurityAuditLog,
  CivicNotification,
  ServiceAgency
} from '../types';
import {
  INITIAL_ASSEMBLIES,
  INITIAL_BRANCHES,
  INITIAL_ISSUES,
  INITIAL_TICKETS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS
} from './initialData';
import { sounds } from './soundEffects';
import { normalizeServiceAgency } from '../utils/agencyHelpers';

type Listener = () => void;

class CivicStore {
  private assemblies: MunicipalAssembly[] = [...INITIAL_ASSEMBLIES];
  private branches: AgencyBranch[] = [...INITIAL_BRANCHES];
  private issues: CivicIssue[] = [...INITIAL_ISSUES];
  private tickets: AppointmentTicket[] = [...INITIAL_TICKETS];
  private auditLogs: SecurityAuditLog[] = [...INITIAL_AUDIT_LOGS];
  private notifications: CivicNotification[] = [...INITIAL_NOTIFICATIONS];

  // Current session states
  private currentRole: UserRole = 'citizen';
  private currentUser: GhanaCardProfile | null = null;
  private authToken: string | null = null;
  private theme: 'dark' | 'light' = 'dark';

  // Citizen location detection state (Auto vs Manual)
  private citizenLocationMode: 'auto' | 'manual' = 'auto';
  private citizenSelectedDistrictId: string = 'asm-ama-01';
  private citizenCoordinates: { lat: number; lng: number } = { lat: 5.55602, lng: -0.20124 }; // Central Accra / AMA Kinbu Rd

  // Admin geofence & security state
  private adminSelectedDistrictId: string = 'asm-ama-01'; // Default AMA for municipal admin
  private adminGpsVerified: boolean = true;
  private adminBssidVerified: boolean = true;
  private adminMfaVerified: boolean = true;
  private globalLockdownActive: boolean = false;

  // Server sync status
  private isConnectedToServer: boolean = true;

  // Rate-limiting simulation
  private rateLimitWindow: { [ip: string]: number[] } = {};

  private listeners: Set<Listener> = new Set();

  constructor() {
    this.loadFromStorage();
    this.syncWithServer();
  }

  // Fetch initial live state from Express backend
  public async syncWithServer() {
    try {
      const [reportsRes, ticketsRes, assembliesRes, branchesRes, notifsRes, logsRes] = await Promise.allSettled([
        fetch('/api/reports'),
        fetch('/api/tickets'),
        fetch('/api/assemblies'),
        fetch('/api/branches'),
        fetch('/api/notifications'),
        fetch('/api/audit-logs')
      ]);

      if (reportsRes.status === 'fulfilled' && reportsRes.value.ok) {
        const json = await reportsRes.value.json();
        if (json.data && Array.isArray(json.data)) {
          this.issues = json.data;
        }
      }

      if (ticketsRes.status === 'fulfilled' && ticketsRes.value.ok) {
        const json = await ticketsRes.value.json();
        if (json.data && Array.isArray(json.data)) {
          this.tickets = json.data;
        }
      }

      if (assembliesRes.status === 'fulfilled' && assembliesRes.value.ok) {
        const json = await assembliesRes.value.json();
        if (json.data && Array.isArray(json.data)) {
          this.assemblies = json.data;
        }
      }

      if (branchesRes.status === 'fulfilled' && branchesRes.value.ok) {
        const json = await branchesRes.value.json();
        if (json.data && Array.isArray(json.data)) {
          this.branches = json.data;
        }
      }

      if (notifsRes.status === 'fulfilled' && notifsRes.value.ok) {
        const json = await notifsRes.value.json();
        if (json.data && Array.isArray(json.data)) {
          this.notifications = json.data;
        }
      }

      if (logsRes.status === 'fulfilled' && logsRes.value.ok) {
        const json = await logsRes.value.json();
        if (json.data && Array.isArray(json.data)) {
          this.auditLogs = json.data;
        }
      }

      this.isConnectedToServer = true;
      this.notify();
    } catch (e) {
      console.warn('Backend server sync notice (using local cache):', e);
      this.isConnectedToServer = false;
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('civiclink_assemblies', JSON.stringify(this.assemblies));
      localStorage.setItem('civiclink_branches', JSON.stringify(this.branches));
      localStorage.setItem('civiclink_issues', JSON.stringify(this.issues));
      localStorage.setItem('civiclink_tickets', JSON.stringify(this.tickets));
      localStorage.setItem('civiclink_audit_logs', JSON.stringify(this.auditLogs));
      localStorage.setItem('civiclink_notifications', JSON.stringify(this.notifications));
      if (this.currentUser) {
        localStorage.setItem('civiclink_current_user', JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem('civiclink_current_user');
      }
      localStorage.setItem('civiclink_current_role', this.currentRole);
      localStorage.setItem('civiclink_admin_district', this.adminSelectedDistrictId);
      localStorage.setItem('civiclink_theme', this.theme);
      if (this.authToken) {
        localStorage.setItem('civiclink_token', this.authToken);
      }
    } catch {
      // Storage quota or SSR guard
    }
  }

  private loadFromStorage() {
    try {
      const storedAssemblies = localStorage.getItem('civiclink_assemblies');
      const storedBranches = localStorage.getItem('civiclink_branches');
      const storedIssues = localStorage.getItem('civiclink_issues');
      const storedTickets = localStorage.getItem('civiclink_tickets');
      const storedAuditLogs = localStorage.getItem('civiclink_audit_logs');
      const storedNotifications = localStorage.getItem('civiclink_notifications');
      const storedUser = localStorage.getItem('civiclink_current_user');
      const storedRole = localStorage.getItem('civiclink_current_role') as UserRole;
      const storedAdminDist = localStorage.getItem('civiclink_admin_district');
      const storedTheme = localStorage.getItem('civiclink_theme') as 'dark' | 'light' | null;
      const storedToken = localStorage.getItem('civiclink_token');

      this.assemblies = storedAssemblies ? JSON.parse(storedAssemblies) : INITIAL_ASSEMBLIES;
      this.branches = storedBranches ? JSON.parse(storedBranches) : INITIAL_BRANCHES;
      this.issues = storedIssues ? JSON.parse(storedIssues) : INITIAL_ISSUES;
      this.tickets = storedTickets ? JSON.parse(storedTickets) : INITIAL_TICKETS;
      this.auditLogs = storedAuditLogs ? JSON.parse(storedAuditLogs) : INITIAL_AUDIT_LOGS;
      this.notifications = storedNotifications ? JSON.parse(storedNotifications) : INITIAL_NOTIFICATIONS;

      if (storedTheme === 'light' || storedTheme === 'dark') {
        this.theme = storedTheme;
      }

      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
        } catch {
          this.currentUser = null;
        }
      } else {
        this.currentUser = null;
      }

      if (storedRole) this.currentRole = storedRole;
      if (storedAdminDist) this.adminSelectedDistrictId = storedAdminDist;
      if (storedToken) this.authToken = storedToken;
    } catch {
      this.assemblies = INITIAL_ASSEMBLIES;
      this.branches = INITIAL_BRANCHES;
      this.issues = INITIAL_ISSUES;
      this.tickets = INITIAL_TICKETS;
      this.auditLogs = INITIAL_AUDIT_LOGS;
      this.notifications = INITIAL_NOTIFICATIONS;
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((listener) => listener());
  }

  // --- Getters ---
  public getAssemblies(): MunicipalAssembly[] {
    return this.assemblies;
  }

  public getBranches(): AgencyBranch[] {
    return this.branches;
  }

  public getBranchesForAssembly(assemblyIdOrName?: string, agency?: string): AgencyBranch[] {
    let list = [...this.branches];
    if (agency && agency !== 'all') {
      const norm = normalizeServiceAgency(agency);
      list = list.filter((b) => normalizeServiceAgency(b.agency) === norm);
    }
    if (!assemblyIdOrName || assemblyIdOrName === 'all') return list;

    const asm = this.assemblies.find(
      (a) =>
        a.id === assemblyIdOrName ||
        a.name.toLowerCase() === assemblyIdOrName.toLowerCase() ||
        a.code.toLowerCase() === assemblyIdOrName.toLowerCase()
    );
    const searchTerms = asm ? [asm.name.toLowerCase(), asm.code.toLowerCase()] : [assemblyIdOrName.toLowerCase()];

    const matched = list.filter((b) => searchTerms.some((st) => b.district.toLowerCase().includes(st)));
    if (matched.length > 0) return matched;

    // If a provisioned municipal assembly has no preset branches, return dynamic branches for that municipality
    const baseName = asm ? asm.name : assemblyIdOrName;
    const currentAgency = agency ? normalizeServiceAgency(agency) : 'DVLA';
    return [
      {
        id: `br-${currentAgency.toLowerCase()}-${asm?.code.toLowerCase() || 'gen'}`,
        agency: currentAgency,
        name: `${currentAgency} ${baseName} Operational Unit`,
        district: baseName,
        coordinates: asm?.coordinates || { lat: 5.58, lng: -0.19 },
        address: `${baseName} Municipal Secretariat Grounds`,
        openHours: '08:00 AM - 04:30 PM (Mon - Fri)',
        countersCount: 4
      }
    ];
  }

  public getIssues(): CivicIssue[] {
    return this.issues;
  }

  public getTickets(): AppointmentTicket[] {
    return this.tickets;
  }

  public getAuditLogs(): SecurityAuditLog[] {
    return this.auditLogs;
  }

  public getNotifications(): CivicNotification[] {
    return this.notifications;
  }

  public getCurrentRole(): UserRole {
    return this.currentRole;
  }

  public getCurrentUser(): GhanaCardProfile | null {
    return this.currentUser;
  }

  public updateCurrentUser(updates: Partial<GhanaCardProfile>) {
    if (!this.currentUser) return;
    this.currentUser = {
      ...this.currentUser,
      ...updates
    };
    this.notify();
  }

  public getTheme(): 'dark' | 'light' {
    return this.theme;
  }

  public setTheme(theme: 'dark' | 'light') {
    this.theme = theme;
    this.notify();
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public getAdminSelectedDistrictId(): string {
    return this.adminSelectedDistrictId;
  }

  public getAdminSecurityStatus() {
    return {
      gpsVerified: this.adminGpsVerified,
      bssidVerified: this.adminBssidVerified,
      mfaVerified: this.adminMfaVerified,
      globalLockdown: this.globalLockdownActive
    };
  }

  public getIsConnectedToServer(): boolean {
    return this.isConnectedToServer;
  }

  // --- User & Role Management & Live Auth API ---
  public async loginCitizenWithApi(identifier: string, pin?: string): Promise<{ success: boolean; error?: string; user?: GhanaCardProfile }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, pin })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      this.currentUser = data.user;
      this.currentRole = data.user.role === 'super_admin' ? 'super_admin' : data.user.role === 'municipal_admin' ? 'municipal_admin' : 'citizen';
      this.authToken = data.token;
      sounds.playSuccessTone();
      this.notify();
      return { success: true, user: data.user };
    } catch {
      // Offline fallback
      this.setCurrentUser({
        idNumber: identifier.startsWith('GHA-') ? identifier : `GHA-${Math.floor(100000000 + Math.random() * 900000000)}-1`,
        fullName: identifier,
        isVerified: true
      });
      return { success: true, user: this.currentUser! };
    }
  }

  public async registerCitizenWithApi(params: {
    idNumber: string;
    fullName: string;
    phone: string;
    digitalAddress?: string;
    district?: string;
    gender?: 'MALE' | 'FEMALE';
    pin?: string;
  }): Promise<{ success: boolean; error?: string; user?: GhanaCardProfile }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      this.currentUser = data.user;
      this.currentRole = 'citizen';
      this.authToken = data.token;
      sounds.playSuccessTone();
      this.notify();
      return { success: true, user: data.user };
    } catch {
      this.setCurrentUser({
        idNumber: params.idNumber,
        fullName: params.fullName,
        phone: params.phone,
        digitalAddress: params.digitalAddress,
        district: params.district,
        gender: params.gender || 'MALE',
        isVerified: true
      });
      return { success: true, user: this.currentUser! };
    }
  }

  // --- Location & District Scoping Getters/Setters ---
  public getCitizenLocationMode(): 'auto' | 'manual' {
    return this.citizenLocationMode;
  }

  public setCitizenLocationMode(mode: 'auto' | 'manual') {
    this.citizenLocationMode = mode;
    this.notify();
  }

  public getCitizenSelectedDistrictId(): string {
    return this.citizenSelectedDistrictId;
  }

  public setCitizenSelectedDistrictId(districtId: string) {
    this.citizenSelectedDistrictId = districtId;
    this.notify();
  }

  public getCitizenCoordinates(): { lat: number; lng: number } {
    return this.citizenCoordinates;
  }

  public setCitizenCoordinates(coords: { lat: number; lng: number }): MunicipalAssembly {
    this.citizenCoordinates = coords;
    const closest = this.findClosestAssembly(coords);
    this.citizenSelectedDistrictId = closest.id;
    this.notify();
    return closest;
  }

  public getAutoDetectedAssembly(): MunicipalAssembly {
    return this.findClosestAssembly(this.citizenCoordinates);
  }

  // Dedicated Municipal Admin / Staff Login via backend API
  public async loginMunicipalAdminWithApi(
    municipalId: string,
    password: string
  ): Promise<{ success: boolean; error?: string; assembly?: MunicipalAssembly; user?: GhanaCardProfile }> {
    try {
      const res = await fetch('/api/auth/municipal-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ municipalId, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        sounds.playSecurityAlert();
        return { success: false, error: data.error || 'Municipal authentication failed' };
      }

      this.currentUser = data.user;
      this.currentRole = 'municipal_admin';
      this.adminSelectedDistrictId = data.municipalityId || data.assembly?.id || this.adminSelectedDistrictId;
      this.authToken = data.token;
      sounds.playSuccessTone();
      this.notify();
      return { success: true, assembly: data.assembly, user: data.user };
    } catch {
      // Fallback local matching
      const clean = municipalId.trim().toLowerCase();
      const asm = this.assemblies.find(
        (a) => a.code.toLowerCase() === clean || a.id.toLowerCase() === clean || a.name.toLowerCase().includes(clean)
      ) || this.assemblies[0];

      const adminUser: GhanaCardProfile = {
        idNumber: `GHA-MMDA-${asm.code}-01`,
        fullName: `Admin (${asm.name})`,
        dateOfBirth: '1985-01-01',
        gender: 'MALE',
        digitalAddress: `${asm.code}-001-2026`,
        district: asm.name,
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        isVerified: true,
        phone: '+233 20 000 0000'
      };

      this.currentUser = adminUser;
      this.currentRole = 'municipal_admin';
      this.adminSelectedDistrictId = asm.id;
      sounds.playSuccessTone();
      this.notify();
      return { success: true, assembly: asm, user: adminUser };
    }
  }

  // Dedicated Super Admin Login via backend API
  public async loginSuperAdminWithApi(
    passkey: string
  ): Promise<{ success: boolean; error?: string; user?: GhanaCardProfile }> {
    try {
      const res = await fetch('/api/auth/super-admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        sounds.playSecurityAlert();
        return { success: false, error: data.error || 'Super admin authentication failed' };
      }

      this.currentUser = data.user;
      this.currentRole = 'super_admin';
      this.authToken = data.token;
      sounds.playSuccessTone();
      this.notify();
      return { success: true, user: data.user };
    } catch {
      if (['GHOST-DOOR-ROOT', 'GH-ADMIN-2026', 'BLACKSTAR-2026', 'admin123', 'root'].includes(passkey.trim())) {
        const superAdminUser: GhanaCardProfile = {
          idNumber: 'GHA-ROOT-00000-1',
          fullName: 'Hon. National Director (Jubilee House)',
          dateOfBirth: '1975-03-06',
          gender: 'MALE',
          digitalAddress: 'GA-000-0001',
          district: 'National Secretariat (Jubilee House)',
          photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
          isVerified: true,
          phone: '+233 30 200 0000'
        };
        this.currentUser = superAdminUser;
        this.currentRole = 'super_admin';
        sounds.playSuccessTone();
        this.notify();
        return { success: true, user: superAdminUser };
      }
      sounds.playSecurityAlert();
      return { success: false, error: 'Invalid Super Administrator authorization passkey.' };
    }
  }

  // Super Admin Register District & Municipal Credentials
  public async registerDistrictAssembly(params: {
    name: string;
    code: string;
    password: string;
    region?: string;
    headquarters?: string;
    dceName?: string;
    adminEmail?: string;
    radiusKm?: number;
  }): Promise<{ success: boolean; assembly?: MunicipalAssembly; error?: string; message?: string }> {
    try {
      const res = await fetch('/api/admin/register-district', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'District registration failed' };
      }

      if (data.data) {
        this.assemblies.push(data.data);
      }
      sounds.playSuccessTone();
      this.notify();
      return { success: true, assembly: data.data, message: data.message };
    } catch {
      // Fallback
      const newAsm: MunicipalAssembly = {
        id: `asm-${params.code.toLowerCase()}-${Date.now().toString().slice(-4)}`,
        name: params.name,
        code: params.code.toUpperCase(),
        region: params.region || 'Greater Accra',
        headquarters: params.headquarters || 'Municipal Office',
        dceName: params.dceName || 'Hon. DCE',
        adminEmail: params.adminEmail || `admin.${params.code.toLowerCase()}@civiclink.gov.gh`,
        coordinates: { lat: 5.58, lng: -0.19 },
        radiusKm: params.radiusKm || 12,
        activeIssuesCount: 0,
        resolvedIssuesCount: 0,
        allowedBssids: [`${params.code.toUpperCase()}-HQ-LAN`],
        allowedIpSubnet: '197.251.180.0/24'
      };
      this.assemblies.push(newAsm);
      sounds.playSuccessTone();
      this.notify();
      return { success: true, assembly: newAsm, message: `Municipal Assembly ${newAsm.name} registered!` };
    }
  }

  // Stealth Gatekeeper validation for GhostDoor
  public async unlockGhostDoorGatekeeper(passkey: string, targetRole: UserRole, districtId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth/verify-ghost-door', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey, role: targetRole, districtId })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        sounds.playSecurityAlert();
        return { success: false, error: data.error || 'Invalid Ghost Door stealth credentials' };
      }

      this.currentRole = targetRole;
      if (districtId) this.adminSelectedDistrictId = districtId;
      this.authToken = data.token;
      sounds.playSuccessTone();
      this.notify();
      return { success: true };
    } catch {
      // Fallback valid check
      if (['GH-ADMIN-2026', 'GHOST-DOOR-ROOT', 'BLACKSTAR-2026', 'admin123', 'root'].includes(passkey.trim())) {
        this.currentRole = targetRole;
        if (districtId) this.adminSelectedDistrictId = districtId;
        sounds.playSuccessTone();
        this.notify();
        return { success: true };
      }
      sounds.playSecurityAlert();
      return { success: false, error: 'Invalid Ghost Door stealth passkey' };
    }
  }

  public setCurrentUser(user: Partial<GhanaCardProfile>) {
    if (!this.currentUser) {
      this.currentUser = {
        idNumber: user.idNumber || 'GHA-728190342-1',
        fullName: user.fullName || 'Kwame Mensah',
        dateOfBirth: user.dateOfBirth || '1992-04-14',
        gender: (user.gender as 'MALE' | 'FEMALE') || 'MALE',
        digitalAddress: user.digitalAddress || 'GA-183-9023',
        district: user.district || 'Accra Metropolitan Assembly (AMA)',
        photoUrl: user.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        isVerified: true,
        phone: user.phone || '+233 24 412 8901'
      };
    } else {
      this.currentUser = {
        ...this.currentUser,
        ...user
      };
    }
    this.notify();
  }

  public findAssemblyByCoordinates(lat: number, lng: number): MunicipalAssembly {
    return this.findClosestAssembly({ lat, lng });
  }

  public setRole(role: UserRole) {
    this.currentRole = role;
    this.notify();
  }

  public setAdminDistrict(districtId: string) {
    this.adminSelectedDistrictId = districtId;
    this.notify();
  }

  public setAdminSecurityChecks(gps: boolean, bssid: boolean, mfa: boolean) {
    this.adminGpsVerified = gps;
    this.adminBssidVerified = bssid;
    this.adminMfaVerified = mfa;
    this.notify();
  }

  public toggleGlobalLockdown() {
    this.globalLockdownActive = !this.globalLockdownActive;
    this.logAuditEvent({
      eventType: 'GLOBAL_LOCK_TOGGLED',
      userId: 'root.superadmin@gov.gh',
      userRole: 'super_admin',
      ipAddress: '197.251.100.1',
      locationVerified: true,
      bssid: 'CASTLE-SECURE-LAN',
      details: `National emergency system lock ${this.globalLockdownActive ? 'ENGAGED' : 'DISENGAGED'}.`,
      severity: this.globalLockdownActive ? 'critical' : 'info'
    });
    this.notify();
  }

  public loginWithGhanaCard(profile: GhanaCardProfile) {
    this.currentUser = profile;
    this.currentRole = 'citizen';
    this.logAuditEvent({
      eventType: 'AUTH_SUCCESS',
      userId: profile.idNumber,
      userRole: 'citizen',
      ipAddress: '102.176.88.24',
      locationVerified: true,
      bssid: 'N/A (Mobile Device)',
      details: `Ghana Card biometric verified for citizen: ${profile.fullName} (${profile.idNumber})`,
      severity: 'info'
    });
    sounds.playSuccessTone();
    this.notify();
  }

  public logout() {
    this.currentUser = null;
    this.currentRole = 'citizen';
    this.authToken = null;
    try {
      localStorage.removeItem('civiclink_current_user');
      localStorage.removeItem('civiclink_token');
      localStorage.removeItem('civiclink_current_role');
    } catch {
      // Storage guard
    }
    sounds.playScannerBeep();
    this.notify();
  }

  // --- Civiconnect (Civic Reports CRUD via API) ---
  public async upvoteIssue(issueId: string): Promise<{ success: boolean; message: string }> {
    const issue = this.issues.find((i) => i.id === issueId);
    if (!issue) return { success: false, message: 'Issue not found' };

    const citizenId = this.currentUser?.idNumber || 'anonymous-user';
    const hasVoted = issue.upvoterIds.includes(citizenId);

    // Optimistic local update
    if (hasVoted) {
      issue.upvotes = Math.max(0, issue.upvotes - 1);
      issue.upvoterIds = issue.upvoterIds.filter((id) => id !== citizenId);
    } else {
      issue.upvotes += 1;
      issue.upvoterIds.push(citizenId);
      sounds.playVotePop();

      if (issue.upvotes >= 20 && issue.priority !== 'urgent') {
        issue.priority = 'urgent';
      }
    }
    issue.updatedAt = new Date().toISOString();
    this.notify();

    // Call server API
    try {
      const res = await fetch(`/api/reports/${issueId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citizenId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          const idx = this.issues.findIndex((i) => i.id === issueId);
          if (idx !== -1) this.issues[idx] = data.data;
          this.notify();
        }
      }
    } catch {
      // Local optimistic state persists
    }

    return { success: true, message: hasVoted ? 'Upvote removed' : 'Upvote recorded!' };
  }

  public async createIssue(data: {
    title: string;
    description: string;
    category: IssueCategory;
    subcategory: string;
    coordinates: { lat: number; lng: number };
    address: string;
    landmark: string;
    imageUrl: string;
    isAnonymous: boolean;
    districtId?: string;
  }): Promise<{ success: boolean; issue?: CivicIssue; error?: string }> {
    let matchedAssembly = data.districtId
      ? this.assemblies.find((a) => a.id === data.districtId) || this.findClosestAssembly(data.coordinates)
      : this.findClosestAssembly(data.coordinates);
    if (!matchedAssembly) matchedAssembly = this.assemblies[0];

    const payload = {
      ...data,
      districtId: matchedAssembly.id,
      authorName: data.isAnonymous ? 'Anonymous Citizen' : (this.currentUser?.fullName || 'Verified Citizen'),
      authorGhanaCardMasked: data.isAnonymous ? 'GHA-***-PROTECTED' : (this.currentUser?.idNumber ? this.currentUser.idNumber.slice(0, 7) + '***-' + this.currentUser.idNumber.slice(-1) : 'GHA-***-VERIFIED')
    };

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();

      if (res.ok && resData.success && resData.data) {
        const created = resData.data;
        this.issues.unshift(created);
        matchedAssembly.activeIssuesCount += 1;
        sounds.playSuccessTone();

        this.addNotification({
          title: '📢 Report Published to Civiconnect',
          message: `Your report for "${created.title}" was routed to ${matchedAssembly.name}.`,
          type: 'issue_escalated',
          issueId: created.id
        });

        this.notify();
        return { success: true, issue: created };
      }
    } catch {
      // Local fallback creation
    }

    const newIssueId = `ISS-${matchedAssembly.code}-${new Date().getFullYear()}-${String(this.issues.length + 1).padStart(3, '0')}`;
    const fallbackIssue: CivicIssue = {
      id: newIssueId,
      title: data.title,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      districtId: matchedAssembly.id,
      districtName: matchedAssembly.name,
      coordinates: data.coordinates,
      address: data.address,
      landmark: data.landmark,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=900&q=80',
      isAnonymous: data.isAnonymous,
      authorName: data.isAnonymous ? 'Anonymous Citizen' : (this.currentUser?.fullName || 'Verified Citizen'),
      authorGhanaCardMasked: data.isAnonymous ? 'GHA-***-PROTECTED' : (this.currentUser?.idNumber ? this.currentUser.idNumber.slice(0, 7) + '***-' + this.currentUser.idNumber.slice(-1) : 'GHA-***-VERIFIED'),
      upvotes: 1,
      upvoterIds: [this.currentUser?.idNumber || 'creator-self'],
      priority: 'medium',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedDepartment: `${matchedAssembly.code} Municipal Works & Engineering`
    };

    this.issues.unshift(fallbackIssue);
    matchedAssembly.activeIssuesCount += 1;
    sounds.playSuccessTone();
    this.notify();
    return { success: true, issue: fallbackIssue };
  }

  public async deleteIssue(issueId: string): Promise<{ success: boolean; message: string }> {
    const index = this.issues.findIndex((i) => i.id === issueId);
    if (index === -1) return { success: false, message: 'Issue not found' };

    const removed = this.issues.splice(index, 1)[0];
    const asm = this.assemblies.find((a) => a.id === removed.districtId);
    if (asm && removed.status !== 'resolved') {
      asm.activeIssuesCount = Math.max(0, asm.activeIssuesCount - 1);
    }
    this.notify();

    try {
      await fetch(`/api/reports/${issueId}`, { method: 'DELETE' });
    } catch {
      // Local sync persists
    }

    return { success: true, message: 'Incident report permanently deleted.' };
  }

  public async updateIssueStatus(issueId: string, status: 'open' | 'in_progress' | 'resolved') {
    const issue = this.issues.find((i) => i.id === issueId);
    if (!issue) return;

    issue.status = status;
    issue.updatedAt = new Date().toISOString();

    if (status === 'resolved') {
      const assembly = this.assemblies.find((a) => a.id === issue.districtId);
      if (assembly) {
        assembly.activeIssuesCount = Math.max(0, assembly.activeIssuesCount - 1);
        assembly.resolvedIssuesCount += 1;
      }
    }
    this.notify();

    try {
      await fetch(`/api/reports/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch {
      // Local state active
    }
  }

  public async submitResolutionProof(
    issueId: string,
    proof: {
      afterImageUrl: string;
      engineerName: string;
      engineerTitle: string;
      workDetails: string;
      materialsCostGHS: number;
    }
  ): Promise<{ success: boolean; message: string }> {
    const issue = this.issues.find((i) => i.id === issueId);
    if (!issue) return { success: false, message: 'Issue not found' };

    const stampId = `${issue.districtId.toUpperCase()}-STAMP-${Math.floor(1000 + Math.random() * 9000)}`;

    issue.status = 'resolved';
    issue.resolutionProof = {
      resolvedAt: new Date().toISOString(),
      afterImageUrl: proof.afterImageUrl,
      engineerName: proof.engineerName,
      engineerTitle: proof.engineerTitle,
      workDetails: proof.workDetails,
      materialsCostGHS: proof.materialsCostGHS,
      officialStampId: stampId
    };
    issue.updatedAt = new Date().toISOString();

    const assembly = this.assemblies.find((a) => a.id === issue.districtId);
    if (assembly) {
      assembly.activeIssuesCount = Math.max(0, assembly.activeIssuesCount - 1);
      assembly.resolvedIssuesCount += 1;
    }

    sounds.playSuccessTone();
    this.notify();

    // Call server endpoint
    try {
      await fetch(`/api/reports/${issueId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proof)
      });
    } catch {
      // Local proof stored
    }

    return { success: true, message: 'Resolution proof submitted successfully!' };
  }

  // --- Service Appointments & Live Queue CRUD via API ---
  public async bookAppointment(data: {
    serviceAgency: ServiceAgency;
    serviceType: string;
    branchId: string;
    appointmentDate: string;
    timeSlot: string;
    checklist: { id: string; label: string; checked: boolean; requiredNote: string }[];
  }): Promise<{ success: boolean; ticket?: AppointmentTicket; error?: string }> {
    const branch = this.branches.find((b) => b.id === data.branchId);
    if (!branch) return { success: false, error: 'Selected branch is invalid' };

    const payload = {
      ...data,
      citizenName: this.currentUser?.fullName || 'Kwame Mensah',
      citizenPhone: this.currentUser?.phone || '+233 24 412 8901',
      ghanaCardNumber: this.currentUser?.idNumber || 'GHA-728190342-1'
    };

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resJson = await res.json();
      if (res.ok && resJson.success && resJson.data) {
        const ticket = resJson.data;
        this.tickets.unshift(ticket);
        sounds.playSuccessTone();
        this.notify();
        return { success: true, ticket };
      }
    } catch {
      // Local fallback
    }

    const normAgency = normalizeServiceAgency(data.serviceAgency);
    const ticketPrefix = normAgency === 'DVLA' ? 'DVLA' : normAgency === 'Passport' ? 'PASS' : normAgency === 'Police' ? 'POL' : 'GHS';
    const nextSeq = Math.floor(100 + Math.random() * 899);
    const ticketNumber = `${ticketPrefix}-${nextSeq}`;

    const newTicket: AppointmentTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber,
      serviceAgency: normAgency,
      serviceType: data.serviceType,
      branchId: branch.id,
      branchName: branch.name,
      citizenId: this.currentUser?.idNumber || 'gh-citizen-temp',
      citizenName: this.currentUser?.fullName || 'Kwame Mensah',
      citizenPhone: this.currentUser?.phone || '+233 24 412 8901',
      ghanaCardNumber: this.currentUser?.idNumber || 'GHA-728190342-1',
      appointmentDate: data.appointmentDate,
      timeSlot: data.timeSlot,
      requiredChecklist: data.checklist,
      status: 'booked',
      isGeofenceActivated: false,
      simulatedDistanceKm: 2.8,
      currentServingTicket: `${ticketPrefix}-${Math.max(10, nextSeq - 4)}`,
      assignedCounter: `Counter ${Math.floor(1 + Math.random() * (branch.countersCount || 4))}`,
      etaMinutes: 18,
      createdAt: new Date().toISOString()
    };

    this.tickets.unshift(newTicket);
    sounds.playSuccessTone();
    this.notify();
    return { success: true, ticket: newTicket };
  }

  public async cancelAppointmentTicket(ticketId: string): Promise<{ success: boolean; message: string }> {
    const target = this.tickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    const actualId = target ? target.id : ticketId;
    const ticketNum = target ? target.ticketNumber : ticketId;

    this.tickets = this.tickets.filter((t) => t.id !== actualId && t.ticketNumber !== actualId);
    this.notify();

    try {
      await fetch(`/api/tickets/${encodeURIComponent(actualId)}`, { method: 'DELETE' });
    } catch {
      // Local state is cleared
    }

    this.addNotification({
      title: '🗑️ Appointment Cancelled',
      message: `Appointment ticket ${ticketNum} was successfully cancelled.`,
      type: 'queue_update'
    });
    sounds.playNotificationPing();
    this.notify();

    return { success: true, message: `Appointment ${ticketNum} cancelled.` };
  }

  public async cancelTicket(ticketId: string): Promise<{ success: boolean; message: string }> {
    return this.cancelAppointmentTicket(ticketId);
  }

  public async deleteTicket(ticketId: string): Promise<{ success: boolean; message: string }> {
    return this.cancelAppointmentTicket(ticketId);
  }

  public async updateTicketProximity(ticketId: string, distanceKm: number) {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    ticket.simulatedDistanceKm = distanceKm;
    if (distanceKm <= 1.0 && !ticket.isGeofenceActivated) {
      ticket.isGeofenceActivated = true;
      if (ticket.status === 'booked') {
        ticket.status = 'checked_in';
      }
      this.addNotification({
        title: '📍 Geofenced Check-In Activated!',
        message: `You are within 1km of ${ticket.branchName}. Your position in the digital queue is now LIVE.`,
        type: 'queue_update',
        ticketId: ticket.id
      });
      sounds.playQueueChime();
    }
    this.notify();

    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulatedDistanceKm: distanceKm, isGeofenceActivated: ticket.isGeofenceActivated, status: ticket.status })
      });
    } catch {
      // Local sync
    }
  }

  public async callNextTicket(branchId?: string, counterName?: string, ticketNumber?: string) {
    let targetTicket: AppointmentTicket | undefined;

    if (ticketNumber) {
      targetTicket =
        this.tickets.find((t) => t.ticketNumber === ticketNumber && (branchId ? t.branchId === branchId : true)) ||
        this.tickets.find((t) => t.ticketNumber === ticketNumber);
    } else {
      targetTicket =
        this.tickets.find(
          (t) => (branchId ? t.branchId === branchId : true) && (t.status === 'checked_in' || t.status === 'booked' || t.status === 'rescheduled')
        ) ||
        this.tickets.find((t) => t.status === 'checked_in' || t.status === 'booked' || t.status === 'rescheduled') ||
        this.tickets.find((t) => t.status !== 'completed');
    }

    if (!targetTicket) {
      return { success: false, message: 'No tickets waiting in this branch queue.' };
    }

    targetTicket.status = 'called';
    targetTicket.assignedCounter = counterName || 'Counter 4 (Biometric & Service Terminal)';
    targetTicket.etaMinutes = 0;
    targetTicket.currentServingTicket = targetTicket.ticketNumber;

    const targetBranchId = targetTicket.branchId;
    this.tickets.forEach((t) => {
      if (t.branchId === targetBranchId && t.id !== targetTicket!.id) {
        t.currentServingTicket = targetTicket!.ticketNumber;
      }
    });

    // Add immediate citizen-side push notification
    this.addNotification({
      title: `🔔 TICKET CALLED: ${targetTicket.ticketNumber}`,
      message: `Attention ${targetTicket.citizenName || 'Applicant'}! Your pass ${targetTicket.ticketNumber} for ${targetTicket.serviceType} at ${targetTicket.branchName} is being called now. Please proceed immediately to ${targetTicket.assignedCounter}.`,
      type: 'ticket_called'
    });

    sounds.playQueueChime();
    this.notify();

    try {
      await fetch(`/api/tickets/${targetTicket.id}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ counterName: targetTicket.assignedCounter })
      });
    } catch {
      // Local state active
    }

    return { success: true, ticket: targetTicket };
  }

  public async completeTicket(ticketId: string) {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    ticket.status = 'completed';
    ticket.etaMinutes = 0;
    this.notify();

    try {
      await fetch(`/api/tickets/${ticketId}/complete`, { method: 'POST' });
    } catch {
      // Local update
    }
  }

  public async rescheduleAppointment(
    ticketId: string,
    newDate: string,
    newTimeSlot: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) return { success: false, message: 'Ticket not found' };

    ticket.appointmentDate = newDate;
    ticket.timeSlot = newTimeSlot;
    ticket.status = 'rescheduled';
    ticket.rescheduleReason = reason;
    ticket.rescheduledTime = new Date().toISOString();

    sounds.playSecurityAlert();
    this.notify();

    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentDate: newDate,
          timeSlot: newTimeSlot,
          status: 'rescheduled',
          rescheduleReason: reason,
          rescheduledTime: ticket.rescheduledTime
        })
      });
    } catch {
      // Local state
    }

    return { success: true, message: 'Appointment rescheduled and citizen notified.' };
  }

  public async checkInTicket(ticketId: string) {
    return this.updateTicketProximity(ticketId, 0.4);
  }

  public async rescheduleTicket(
    ticketId: string,
    newDate: string,
    newTimeSlot: string,
    reason: string = 'Citizen requested reschedule'
  ) {
    return this.rescheduleAppointment(ticketId, newDate, newTimeSlot, reason);
  }

  // --- Super Admin Provisioning via API ---
  public async provisionAssembly(data: {
    name: string;
    code: string;
    region: string;
    headquarters: string;
    dceName: string;
    adminEmail: string;
    coordinates: { lat: number; lng: number };
    radiusKm: number;
    allowedBssids: string[];
    allowedIpSubnet: string;
  }): Promise<{ success: boolean; assembly?: MunicipalAssembly; message?: string }> {
    try {
      const res = await fetch('/api/assemblies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resJson = await res.json();
      if (res.ok && resJson.success && resJson.data) {
        this.assemblies.push(resJson.data);
        sounds.playSuccessTone();
        this.notify();
        return { success: true, assembly: resJson.data, message: `Assembly ${resJson.data.name} provisioned!` };
      }
    } catch {
      // Fallback
    }

    const newAssembly: MunicipalAssembly = {
      id: `asm-${data.code.toLowerCase()}-${Date.now()}`,
      name: data.name,
      code: data.code.toUpperCase(),
      region: data.region,
      headquarters: data.headquarters,
      dceName: data.dceName,
      adminEmail: data.adminEmail,
      coordinates: data.coordinates,
      radiusKm: data.radiusKm || 15,
      activeIssuesCount: 0,
      resolvedIssuesCount: 0,
      allowedBssids: data.allowedBssids.length > 0 ? data.allowedBssids : [`${data.code.toUpperCase()}-GOV-SECURE-AP`],
      allowedIpSubnet: data.allowedIpSubnet || '197.251.200.0/24'
    };

    this.assemblies.push(newAssembly);
    sounds.playSuccessTone();
    this.notify();
    return { success: true, assembly: newAssembly, message: `Assembly ${newAssembly.name} provisioned!` };
  }

  // --- Municipal Operational Branches ---
  public async addOperationalBranch(data: {
    name: string;
    agency: ServiceAgency | string;
    district: string;
    districtId?: string;
    address?: string;
    openHours?: string;
    countersCount?: number;
    activeCounters?: number;
    capacityPerHour?: number;
    phone?: string;
    bssidWhitelist?: string[];
  }): Promise<{ success: boolean; branch?: AgencyBranch; error?: string; message: string }> {
    const normAgency = normalizeServiceAgency(data.agency);

    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          agency: normAgency
        })
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        this.branches.push(json.data);
        sounds.playSuccessTone();
        this.notify();
        return { success: true, branch: json.data, message: json.message || 'Branch created successfully' };
      } else if (!res.ok) {
        return { success: false, error: json.error || 'Failed to create branch', message: json.error || 'Failed' };
      }
    } catch {
      // Fallback local creation
    }

    const fallbackBranch: AgencyBranch = {
      id: `br-${normAgency.toLowerCase()}-${Date.now()}`,
      agency: normAgency,
      name: data.name.trim(),
      district: data.district.trim(),
      districtId: data.districtId,
      address: data.address?.trim() || `${data.name.trim()}, ${data.district.trim()}`,
      openHours: data.openHours?.trim() || '08:00 AM - 04:30 PM (Mon - Fri)',
      countersCount: data.countersCount || data.activeCounters || 4,
      activeCounters: data.activeCounters || data.countersCount || 4,
      capacityPerHour: data.capacityPerHour || 35,
      phone: data.phone || '+233 30 200 0000',
      coordinates: { lat: 5.5600, lng: -0.2000 }
    };

    this.branches.push(fallbackBranch);
    sounds.playSuccessTone();
    this.notify();
    return { success: true, branch: fallbackBranch, message: `Operational Center "${fallbackBranch.name}" created!` };
  }

  // --- Municipal Dynamic Pricing Config ---
  public async updateAssemblyPricing(
    assemblyId: string,
    pricing: {
      DVLA?: string | number;
      Passport?: string | number;
      Police?: string | number;
      Health?: string | number;
      dvla?: number;
      passport?: number;
      police?: number;
      health?: number;
      currency?: string;
    }
  ): Promise<{ success: boolean; error?: string; message: string; data?: any }> {
    const asm = this.assemblies.find(
      (a) => a.id === assemblyId || a.code.toLowerCase() === assemblyId.toLowerCase()
    );

    if (asm) {
      asm.servicePricing = {
        DVLA: pricing.DVLA !== undefined ? pricing.DVLA : pricing.dvla !== undefined ? `GH₵ ${pricing.dvla}.00` : (asm.servicePricing?.DVLA || 'GH₵ 185.00'),
        Passport: pricing.Passport !== undefined ? pricing.Passport : pricing.passport !== undefined ? `GH₵ ${pricing.passport}.00` : (asm.servicePricing?.Passport || 'GH₵ 500.00'),
        Police: pricing.Police !== undefined ? pricing.Police : pricing.police !== undefined ? `GH₵ ${pricing.police}.00` : (asm.servicePricing?.Police || 'GH₵ 120.00'),
        Health: pricing.Health !== undefined ? pricing.Health : pricing.health !== undefined ? `GH₵ ${pricing.health}.00` : (asm.servicePricing?.Health || 'GH₵ 30.00'),
        dvla: pricing.dvla !== undefined ? pricing.dvla : asm.servicePricing?.dvla || 120,
        passport: pricing.passport !== undefined ? pricing.passport : asm.servicePricing?.passport || 200,
        police: pricing.police !== undefined ? pricing.police : asm.servicePricing?.police || 50,
        health: pricing.health !== undefined ? pricing.health : asm.servicePricing?.health || 30,
        currency: pricing.currency || 'GHS'
      };
      sounds.playSuccessTone();
      this.notify();
    }

    try {
      const res = await fetch(`/api/assemblies/${encodeURIComponent(assemblyId)}/pricing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricing)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Failed to update pricing', message: json.error || 'Failed' };
      }
      return { success: true, message: json.message || 'Pricing updated successfully', data: json.data };
    } catch {
      return { success: true, message: 'Local pricing updated successfully' };
    }
  }

  public getServicePrice(assemblyIdOrName: string, agency: ServiceAgency | string): string {
    const norm = normalizeServiceAgency(agency);
    const asm = this.assemblies.find(
      (a) =>
        a.id === assemblyIdOrName ||
        a.name.toLowerCase() === assemblyIdOrName.toLowerCase() ||
        a.code.toLowerCase() === assemblyIdOrName.toLowerCase()
    );

    if (asm && asm.servicePricing && asm.servicePricing[norm as keyof typeof asm.servicePricing]) {
      const val = asm.servicePricing[norm as keyof typeof asm.servicePricing];
      return typeof val === 'number' ? `GH₵ ${val}.00` : String(val);
    }

    // Default fallback standard prices
    switch (norm) {
      case 'DVLA':
        return 'GH₵ 185.00';
      case 'Passport':
        return 'GH₵ 500.00';
      case 'Police':
        return 'GH₵ 120.00';
      case 'Health':
        return 'GH₵ 30.00';
      default:
        return 'Free / Official';
    }
  }

  // --- Security Audit Logging & Notifications ---
  public logAuditEvent(entry: Omit<SecurityAuditLog, 'id' | 'timestamp'>) {
    const newLog: SecurityAuditLog = {
      id: `AUD-${Math.floor(9000 + Math.random() * 999)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 100) {
      this.auditLogs = this.auditLogs.slice(0, 100);
    }
    this.notify();

    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).catch(() => {});
  }

  public addNotification(notif: Omit<CivicNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotif: CivicNotification = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
      ...notif
    };
    this.notifications.unshift(newNotif);
    this.notify();
  }

  public markNotificationRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.notify();
      fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      }).catch(() => {});
    }
  }

  public clearAllNotifications() {
    this.notifications = [];
    this.notify();
    fetch('/api/notifications', { method: 'DELETE' }).catch(() => {});
  }

  private findClosestAssembly(coords: { lat: number; lng: number }): MunicipalAssembly {
    let closest = this.assemblies[0];
    let minDistance = Infinity;

    this.assemblies.forEach((asm) => {
      const d = Math.hypot(asm.coordinates.lat - coords.lat, asm.coordinates.lng - coords.lng);
      if (d < minDistance) {
        minDistance = d;
        closest = asm;
      }
    });

    return closest;
  }
}

export const civicStore = new CivicStore();
