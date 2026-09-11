export type UserRole = 'citizen' | 'municipal_admin' | 'super_admin';

export type IssueCategory = 'environmental' | 'infrastructural' | 'medical';

export type IssueSubcategory = string;

export interface GhanaCardProfile {
  idNumber: string; // e.g. GHA-728190342-1
  fullName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  digitalAddress: string; // e.g. GA-183-9023
  district: string;
  photoUrl: string;
  isVerified: boolean;
  phone: string;
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  subcategory: string;
  districtId: string;
  districtName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  landmark: string;
  imageUrl: string;
  isAnonymous: boolean;
  authorName: string;
  authorGhanaCardMasked: string;
  upvotes: number;
  upvoterIds: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
  assignedDepartment?: string;
  resolutionProof?: {
    resolvedAt: string;
    afterImageUrl: string;
    engineerName: string;
    engineerTitle: string;
    workDetails: string;
    materialsCostGHS: number;
    officialStampId: string;
  };
}

export type ServiceAgency = 'DVLA' | 'Passport' | 'Police' | 'Health';

export interface AgencyBranch {
  id: string;
  agency: ServiceAgency;
  name: string;
  district: string;
  districtId?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  openHours: string;
  countersCount: number;
  activeCounters?: number;
  capacityPerHour?: number;
  phone?: string;
  bssidWhitelist?: string[];
}

export interface AppointmentTicket {
  id: string;
  ticketNumber: string; // e.g. DVLA-045
  serviceAgency: ServiceAgency;
  serviceType: string;
  branchId: string;
  branchName: string;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  ghanaCardNumber: string;
  appointmentDate: string;
  timeSlot: string;
  requiredChecklist: {
    id: string;
    label: string;
    checked: boolean;
    requiredNote: string;
  }[];
  status: 'booked' | 'checked_in' | 'called' | 'serving' | 'completed' | 'rescheduled' | 'cancelled';
  isGeofenceActivated: boolean;
  simulatedDistanceKm: number;
  currentServingTicket: string;
  assignedCounter?: string;
  etaMinutes: number;
  notes?: string;
  rescheduleReason?: string;
  rescheduledTime?: string;
  createdAt: string;
}

export interface ServicePricingConfig {
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

export interface MunicipalAssembly {
  id: string;
  name: string;
  code: string;
  region: string;
  headquarters: string;
  dceName: string;
  adminEmail: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radiusKm: number;
  activeIssuesCount: number;
  resolvedIssuesCount: number;
  allowedBssids: string[];
  allowedIpSubnet: string;
  servicePricing?: ServicePricingConfig;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  eventType: 
    | 'AUTH_SUCCESS'
    | 'AUTH_FAILURE_GEOFENCE'
    | 'AUTH_FAILURE_MFA'
    | 'RATE_LIMIT_EXCEEDED'
    | 'PRIVILEGE_ESCALATION'
    | 'TICKET_STATUS_OVERRIDE'
    | 'RESOLUTION_SIGNED'
    | 'ASSEMBLY_PROVISIONED'
    | 'GLOBAL_LOCK_TOGGLED';
  userId: string;
  userRole: UserRole | 'anonymous';
  ipAddress: string;
  locationVerified: boolean;
  bssid: string;
  details: string;
  severity: 'info' | 'warn' | 'critical';
}

export interface CivicNotification {
  id: string;
  title: string;
  message: string;
  type: 'queue_update' | 'ticket_called' | 'issue_escalated' | 'issue_resolved' | 'rescheduled' | 'security_alert';
  timestamp: string;
  read: boolean;
  ticketId?: string;
  issueId?: string;
}
