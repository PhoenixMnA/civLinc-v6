import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Key, 
  MapPin, 
  Wifi, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Radio, 
  Volume2, 
  Calendar, 
  Building2, 
  Plus, 
  FileCheck2, 
  BarChart3,
  Search,
  UserCheck,
  Trash2,
  Car,
  FileText,
  Shield,
  HeartPulse,
  DollarSign,
  Coins,
  Settings,
  Sparkles,
  Clock,
  Phone,
  ArrowRight,
  Camera,
  Image as ImageIcon,
  Check,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { 
  UserRole, 
  CivicIssue, 
  AppointmentTicket, 
  MunicipalAssembly, 
  SecurityAuditLog, 
  AgencyBranch 
} from '../types';
import { civicStore } from '../services/store';
import { sounds } from '../services/soundEffects';
import { normalizeServiceAgency, truncateText } from '../utils/agencyHelpers';

interface Props {
  issues: CivicIssue[];
  assemblies: MunicipalAssembly[];
  tickets: AppointmentTicket[];
  branches: AgencyBranch[];
  auditLogs: SecurityAuditLog[];
  onOpenResolutionProof: (issue: CivicIssue) => void;
}

export const GhostDoorAdminPortal: React.FC<Props> = ({
  issues,
  assemblies,
  tickets,
  branches,
  auditLogs,
  onOpenResolutionProof
}) => {
  const currentRole = civicStore.getCurrentRole();
  const selectedDistrictId = civicStore.getAdminSelectedDistrictId();
  const currentAssembly = assemblies.find((a) => a.id === selectedDistrictId) || assemblies[0];
  const securityStatus = civicStore.getAdminSecurityStatus();

  // Admin tabs
  const [adminTab, setAdminTab] = useState<'dispatch' | 'queue_tower' | 'analytics' | 'operations' | 'super_provision'>('dispatch');

  // Queue Tower Agency & Branch Filter State
  const [selectedAdminAgency, setSelectedAdminAgency] = useState<'all' | 'DVLA' | 'Passport' | 'Police' | 'Health'>('all');
  const [selectedAdminBranchId, setSelectedAdminBranchId] = useState<string>('all');
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'checked_in' | 'called' | 'booked' | 'rescheduled' | 'completed'>('all');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  // Resolution modal state
  const [resolvingIssue, setResolvingIssue] = useState<CivicIssue | null>(null);
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [engineerName, setEngineerName] = useState('Ing. Emmanuel Tetteh');
  const [engineerTitle, setEngineerTitle] = useState('Lead Municipal Works Engineer, AMA');
  const [materialsCost, setMaterialsCost] = useState('12500');
  const [afterImage, setAfterImage] = useState('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80');
  const adminCameraInputRef = useRef<HTMLInputElement>(null);
  const adminGalleryInputRef = useRef<HTMLInputElement>(null);

  const handleAdminImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAfterImage(url);
      sounds.playVotePop();
    }
  };

  // Reschedule modal state
  const [reschedulingTicket, setReschedulingTicket] = useState<AppointmentTicket | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-08-20');
  const [rescheduleSlot, setRescheduleSlot] = useState('02:00 PM - 02:45 PM');
  const [rescheduleReason, setRescheduleReason] = useState('Emergency server upgrade and power maintenance at Operational Center.');

  // Delete modal state
  const [deletingTicket, setDeletingTicket] = useState<AppointmentTicket | null>(null);
  const [isDeletingTicket, setIsDeletingTicket] = useState(false);

  // Provisioning form state (Super Admin)
  const [provName, setProvName] = useState('Ayawaso West Municipal Assembly');
  const [provCode, setProvCode] = useState('AWMA');
  const [provPassword, setProvPassword] = useState('AyawasoAdmin2026!');
  const [provRegion, setProvRegion] = useState('Greater Accra Region');
  const [provHQ, setProvHQ] = useState('Dzorwulu, Accra');
  const [provDCE, setProvDCE] = useState('Hon. Sandra Owusu-Ahinkorah');
  const [provEmail, setProvEmail] = useState('admin.awma@civiclink.gov.gh');
  const [provLat, setProvLat] = useState('5.6310');
  const [provLng, setProvLng] = useState('-0.1870');
  const [provBssid, setProvBssid] = useState('AWMA-HQ-SECURE-LAN');
  const [provSubnet, setProvSubnet] = useState('197.251.180.0/24');
  const [provisionSuccessMsg, setProvisionSuccessMsg] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState<{ code: string; pass: string; email: string; name: string } | null>(null);

  // New Operational Branch creation form state
  const [newBranchAgency, setNewBranchAgency] = useState<'DVLA' | 'Passport Office' | 'Ghana Police' | 'Health'>('Ghana Police');
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newBranchContact, setNewBranchContact] = useState('');
  const [newBranchCapacity, setNewBranchCapacity] = useState('40');
  const [newBranchCounters, setNewBranchCounters] = useState('4');
  const [newBranchOpen, setNewBranchOpen] = useState('08:00');
  const [newBranchClose, setNewBranchClose] = useState('17:00');
  const [branchSuccessMsg, setBranchSuccessMsg] = useState('');
  const [branchErrorMsg, setBranchErrorMsg] = useState('');
  const [isAddingBranch, setIsAddingBranch] = useState(false);

  // Filter issues strictly by District Assembly (Row-Level Security)
  const districtIssues = issues.filter((i) => i.districtId === currentAssembly.id);
  const todoIssues = districtIssues.filter((i) => i.status === 'open');
  const inProgressIssues = districtIssues.filter((i) => i.status === 'in_progress');
  const resolvedIssues = districtIssues.filter((i) => i.status === 'resolved');

  // District branches across all 4 agencies
  const districtBranches = civicStore.getBranchesForAssembly(currentAssembly.id);
  const activeBranch = districtBranches.find((b) => b.id === selectedAdminBranchId) || districtBranches[0] || branches[0];

  // Comprehensive multi-agency tickets filter with case-insensitive normalization
  const branchTickets = tickets.filter((t) => {
    // 1. Agency filter (DVLA, Passport, Police, Health, all)
    if (selectedAdminAgency !== 'all') {
      const normAgency = normalizeServiceAgency(selectedAdminAgency);
      if (normalizeServiceAgency(t.serviceAgency) !== normAgency) return false;
    }

    // 2. Specific branch filter
    if (selectedAdminBranchId !== 'all') {
      if (t.branchId !== selectedAdminBranchId) return false;
    } else {
      // If 'all', match any branch within this municipality or district
      if (currentRole !== 'super_admin') {
        const branchObj = branches.find((b) => b.id === t.branchId);
        const matchesDistrict = 
          districtBranches.some((db) => db.id === t.branchId) ||
          (branchObj && (
            (branchObj.districtId && branchObj.districtId === currentAssembly.id) ||
            branchObj.district.toLowerCase().includes(currentAssembly.name.toLowerCase()) ||
            branchObj.district.toLowerCase().includes(currentAssembly.code.toLowerCase())
          )) ||
          (t.branchName && (
            t.branchName.toLowerCase().includes(currentAssembly.code.toLowerCase()) ||
            t.branchName.toLowerCase().includes(currentAssembly.name.toLowerCase())
          ));
        if (!matchesDistrict) return false;
      }
    }

    return true;
  });

  const handleRoleSwitch = (newRole: UserRole) => {
    civicStore.setRole(newRole);
    sounds.playScannerBeep();
    if (newRole === 'super_admin') {
      setAdminTab('super_provision');
    } else {
      setAdminTab('dispatch');
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    civicStore.setAdminDistrict(e.target.value);
    sounds.playScannerBeep();
  };

  const handleMoveIssue = (issueId: string, newStatus: 'open' | 'in_progress' | 'resolved') => {
    if (newStatus === 'resolved') {
      const target = issues.find((i) => i.id === issueId);
      if (target) {
        setResolvingIssue(target);
      }
    } else {
      civicStore.updateIssueStatus(issueId, newStatus);
      sounds.playSuccessTone();
    }
  };

  const handleSubmitResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIssue) return;

    civicStore.submitResolutionProof(resolvingIssue.id, {
      afterImageUrl: afterImage,
      engineerName: engineerName.trim(),
      engineerTitle: engineerTitle.trim(),
      workDetails: resolutionDetails.trim() || 'Completed civil engineering repairs and site sanitization.',
      materialsCostGHS: parseFloat(materialsCost) || 12500
    });

    setResolvingIssue(null);
    setResolutionDetails('');
  };

  const handleCallTicket = (ticketNumber?: string) => {
    if (ticketNumber) {
      const target = tickets.find((t) => t.ticketNumber === ticketNumber);
      if (target) {
        civicStore.callNextTicket(target.branchId || activeBranch.id, 'Counter 4 (Biometric & Service Terminal)', target.ticketNumber);
        return;
      }
    }

    const nextWaiting =
      branchTickets.find((t) => t.status === 'checked_in' || t.status === 'booked' || t.status === 'rescheduled') ||
      tickets.find(
        (t) =>
          (t.branchId === activeBranch.id || selectedAdminBranchId === 'all') &&
          (t.status === 'checked_in' || t.status === 'booked' || t.status === 'rescheduled')
      ) ||
      tickets.find((t) => t.status === 'checked_in' || t.status === 'booked' || t.status === 'rescheduled') ||
      branchTickets[0] ||
      tickets[0];

    if (nextWaiting) {
      civicStore.callNextTicket(nextWaiting.branchId || activeBranch.id, 'Counter 4 (Biometric & Service Terminal)', nextWaiting.ticketNumber);
    } else {
      civicStore.callNextTicket(activeBranch.id, 'Counter 4 (Biometric & Service Terminal)');
    }
  };

  const handleCompleteTicket = (ticketId: string) => {
    civicStore.completeTicket(ticketId);
    sounds.playSuccessTone();
  };

  const handleDeleteTicket = (ticket: AppointmentTicket) => {
    setDeletingTicket(ticket);
  };

  const handleConfirmDeleteTicket = async () => {
    if (!deletingTicket) return;
    setIsDeletingTicket(true);
    try {
      await civicStore.cancelTicket(deletingTicket.id);
      sounds.playNotificationPing();
      setDeletingTicket(null);
    } catch (err) {
      console.error('Error deleting ticket:', err);
    } finally {
      setIsDeletingTicket(false);
    }
  };

  const handleSubmitReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingTicket) return;

    civicStore.rescheduleAppointment(
      reschedulingTicket.id,
      rescheduleDate,
      rescheduleSlot,
      rescheduleReason
    );

    setReschedulingTicket(null);
  };

  const handleProvisionAssembly = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionSuccessMsg('');
    setCreatedCredentials(null);

    const res = await civicStore.registerDistrictAssembly({
      name: provName.trim(),
      code: provCode.trim().toUpperCase(),
      password: provPassword.trim(),
      region: provRegion.trim(),
      headquarters: provHQ.trim(),
      dceName: provDCE.trim(),
      adminEmail: provEmail.trim()
    });

    if (res.success) {
      setProvisionSuccessMsg(`✓ Municipal Assembly "${provName}" (${provCode.toUpperCase()}) registered in live database.`);
      setCreatedCredentials({
        code: provCode.trim().toUpperCase(),
        pass: provPassword.trim(),
        email: provEmail.trim(),
        name: provName.trim()
      });
      setProvName('');
      setProvCode('');
      setProvPassword('');
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setBranchSuccessMsg('');
    setBranchErrorMsg('');

    if (!newBranchName.trim() || !newBranchAddress.trim()) {
      setBranchErrorMsg('Branch name and physical address are required.');
      return;
    }

    setIsAddingBranch(true);
    const res = await civicStore.addOperationalBranch({
      name: newBranchName.trim(),
      agency: newBranchAgency,
      districtId: currentAssembly.id,
      address: newBranchAddress.trim(),
      district: `${currentAssembly.name} (${currentAssembly.code})`,
      phone: newBranchContact.trim() || '+233 30 200 0000',
      openHours: `${newBranchOpen} - ${newBranchClose}`,
      capacityPerHour: Number(newBranchCapacity) || 30,
      activeCounters: Number(newBranchCounters) || 4,
      bssidWhitelist: [`${currentAssembly.code}-BRANCH-WIFI`]
    });
    setIsAddingBranch(false);

    if (res.success) {
      setBranchSuccessMsg(`✓ Successfully registered "${newBranchName}" under ${currentAssembly.code} (${newBranchAgency})!`);
      setNewBranchName('');
      setNewBranchAddress('');
      setNewBranchContact('');
      sounds.playSuccessTone();
    } else {
      setBranchErrorMsg(res.error || 'Failed to create operational branch.');
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Ghost Door Header Banner - Ghanaian National Flag Aesthetic */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#090b10] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Tricolor top border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="h-full w-1/3 bg-[#CE1126]"></div>
          <div className="h-full w-1/3 bg-[#FCD116]"></div>
          <div className="h-full w-1/3 bg-[#006B3F]"></div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 pt-1">
          {/* Dynamic Role Switcher & MMDA Scoping */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 bg-[#12151e] p-3 rounded-xl border border-white/10 w-full md:w-auto">
            <div>
              <label id="administrative-panel-label" className="block text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-1">ADMINISTRATIVE PANEL</label>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('municipal_admin')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg transition text-center ${
                    currentRole === 'municipal_admin'
                      ? 'bg-[#006B3F] text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Municipal Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('super_admin')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg transition text-center ${
                    currentRole === 'super_admin'
                      ? 'bg-[#CE1126] text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Add District
                </button>
              </div>
            </div>

            {currentRole === 'municipal_admin' && (
              <div className="w-full sm:w-auto">
                <label className="block text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-1">Tenant Assembly (RLS)</label>
                <select
                  value={selectedDistrictId}
                  onChange={handleDistrictChange}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#090b10] border border-white/10 rounded-lg text-white font-medium focus:outline-none focus:border-[#FCD116]"
                >
                  {assemblies.map((asm) => (
                    <option key={asm.id} value={asm.id}>
                      {asm.code} - {asm.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Assembly Reference Bar */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="text-[10px] sm:text-[11px] text-gray-400 font-mono">
            District Code: <span className="text-white font-bold">{currentAssembly.code}</span> ({currentAssembly.region})
          </div>
        </div>
      </div>

      {/* Admin Content Area */}
      <>
        {/* Admin Navigation Bar (Municipal Admin Tabs) */}
        {currentRole === 'municipal_admin' && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-xl bg-[#090b10] border border-white/10 w-full">
            <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setAdminTab('dispatch')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                    adminTab === 'dispatch'
                      ? 'bg-[#006B3F] text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Dispatch ({districtIssues.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab('queue_tower')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                    adminTab === 'queue_tower'
                      ? 'bg-[#006B3F] text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Radio className="h-4 w-4" />
                  <span>Queue Tower ({branchTickets.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab('analytics')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                    adminTab === 'analytics'
                      ? 'bg-[#006B3F] text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab('operations')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                    adminTab === 'operations'
                      ? 'bg-[#006B3F] text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Operational Centers ({districtBranches.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: Civiconnect Dispatch Board */}
          {adminTab === 'dispatch' && (
            <div className="w-full max-w-full">
              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                {/* Column 1: To-Do */}
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#FCD116]">
                      To-Do ({todoIssues.length})
                    </h3>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {todoIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="rounded-xl border border-white/10 bg-[#12151e] p-4 shadow-lg hover:border-white/20 transition space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            issue.priority === 'urgent'
                              ? 'text-red-300 bg-red-600/20 border border-red-500/40'
                              : 'text-gray-400 bg-white/5'
                          }`}>
                            {issue.priority === 'urgent' ? 'Urgent' : 'Open'}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            {issue.id}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-white leading-snug">{issue.title}</p>
                        <p className="text-xs text-gray-400 line-clamp-2">{issue.description}</p>

                        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                            📍 {issue.landmark || issue.districtName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMoveIssue(issue.id, 'in_progress')}
                            className="text-[10px] font-bold uppercase tracking-wider text-[#FCD116] hover:underline"
                          >
                            Dispatch Crew →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: In Progress */}
                <div className="flex flex-col space-y-3 md:border-x md:border-white/10 md:px-3">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                      In Progress ({inProgressIssues.length})
                    </h3>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {inProgressIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="rounded-xl border border-emerald-500/30 bg-[#12151e] p-4 shadow-sm space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase text-emerald-300 px-2 py-0.5 bg-[#006B3F]/30 rounded">
                            Assigned
                          </span>
                          <span className="text-xs text-gray-400 font-mono">{issue.id}</span>
                        </div>

                        <p className="text-sm font-semibold text-white leading-snug">{issue.title}</p>
                        <p className="text-xs text-gray-400 line-clamp-2">{issue.description}</p>

                        <div className="mt-3 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-[#006B3F] animate-pulse"></div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleMoveIssue(issue.id, 'open')}
                            className="text-[10px] text-gray-400 hover:text-white"
                          >
                            ← Revert
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveIssue(issue.id, 'resolved')}
                            className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300"
                          >
                            Upload Proof →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: Resolved */}
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Resolved ({resolvedIssues.length})
                    </h3>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {resolvedIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="rounded-xl border border-white/10 bg-[#12151e] p-4 opacity-80 hover:opacity-100 transition space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase text-emerald-300 px-2 py-0.5 bg-[#006B3F]/30 rounded">
                            ✓ Solved
                          </span>
                          <span className="text-xs text-gray-400 font-mono">{issue.id}</span>
                        </div>

                        <p className="text-sm font-semibold text-white leading-snug">{issue.title}</p>
                        
                        {issue.resolutionProof && (
                          <p className="text-[10px] text-[#FCD116] font-mono">
                            Stamp: {issue.resolutionProof.officialStampId} • GH₵ {issue.resolutionProof.materialsCostGHS.toLocaleString()}
                          </p>
                        )}

                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 truncate max-w-[100px]">
                            {issue.resolutionProof?.engineerName || 'Ing. Tetteh'}
                          </span>
                          <button
                            type="button"
                            onClick={() => onOpenResolutionProof(issue)}
                            className="text-[10px] font-bold uppercase tracking-wider text-[#FCD116] hover:underline"
                          >
                            View Proof
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Queue Tower Detailed View */}
          {adminTab === 'queue_tower' && (
            <div className="space-y-6 w-full max-w-full">
              {/* Agency Tabs & Branch Filter Controls */}
              <div className="p-4 rounded-2xl bg-[#090b10] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSelectedAdminAgency('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      selectedAdminAgency === 'all'
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'bg-[#12151e] text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    All Agencies ({tickets.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAdminAgency('DVLA')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      selectedAdminAgency === 'DVLA'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'bg-[#12151e] text-amber-300/80 hover:text-amber-300 hover:bg-amber-500/10'
                    }`}
                  >
                    <Car className="h-3.5 w-3.5" />
                    DVLA ({tickets.filter((t) => normalizeServiceAgency(t.serviceAgency) === 'DVLA').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAdminAgency('Passport')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      selectedAdminAgency === 'Passport'
                        ? 'bg-blue-600 text-white font-black shadow-md'
                        : 'bg-[#12151e] text-blue-300/80 hover:text-blue-300 hover:bg-blue-600/10'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Passport ({tickets.filter((t) => normalizeServiceAgency(t.serviceAgency) === 'Passport').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAdminAgency('Police')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      selectedAdminAgency === 'Police'
                        ? 'bg-red-600 text-white font-black shadow-md'
                        : 'bg-[#12151e] text-red-300/80 hover:text-red-300 hover:bg-red-600/10'
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Ghana Police ({tickets.filter((t) => normalizeServiceAgency(t.serviceAgency) === 'Police').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAdminAgency('Health')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      selectedAdminAgency === 'Health'
                        ? 'bg-emerald-600 text-white font-black shadow-md'
                        : 'bg-[#12151e] text-emerald-300/80 hover:text-emerald-300 hover:bg-emerald-600/10'
                    }`}
                  >
                    <HeartPulse className="h-3.5 w-3.5" />
                    Health ({tickets.filter((t) => normalizeServiceAgency(t.serviceAgency) === 'Health').length})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Operational Center:
                  </label>
                  <select
                    value={selectedAdminBranchId}
                    onChange={(e) => setSelectedAdminBranchId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#12151e] border border-white/10 text-xs font-bold text-gray-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">All District Centers ({districtBranches.length})</option>
                    {districtBranches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {truncateText(b.name, 35)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Top Controls: Next Applicant & Station Counters & Quick Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Column 1: Next in line + Chime */}
                <div className="p-5 rounded-2xl bg-[#090b10] border border-white/10 shadow-xl flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Radio className="h-4 w-4 text-[#FCD116] animate-pulse" />
                      Queue Tower Audio Controls
                    </h3>
                    <span className="text-xs font-mono text-gray-400">{truncateText(activeBranch.name, 20)}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#12151e] border border-white/10 text-center space-y-2">
                    <div className="text-[11px] text-gray-400 font-medium">Broadcast Public Station Chime</div>
                    <button
                      type="button"
                      onClick={() => handleCallTicket()}
                      className="w-full py-3.5 px-5 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] active:scale-[0.98] text-white font-bold text-xs sm:text-sm transition shadow-xl shadow-red-600/30 flex items-center justify-center gap-2"
                    >
                      <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                      <span>CALL NEXT TICKET (CHIME)</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-gray-400 flex items-center justify-between font-mono">
                    <span>Target Counter:</span>
                    <span className="text-emerald-400 font-bold">Counter 4 (Terminal A)</span>
                  </div>
                </div>

                {/* Column 2: Station Counter Status */}
                <div className="p-5 rounded-2xl bg-[#090b10] border border-white/10 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-emerald-400" />
                      Station Counter Terminals
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      LIVE MONITOR
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: activeBranch.countersCount || 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#12151e] border border-white/10 text-xs flex items-center justify-between"
                      >
                        <span className="font-bold text-gray-300">Counter {idx + 1}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#006B3F]/30 text-emerald-300 border border-emerald-500/30">
                          ONLINE
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-gray-400 font-mono pt-1 border-t border-white/5 flex items-center justify-between">
                    <span>Capacity: ~{activeBranch.capacityPerHour || 40} applicants/hr</span>
                    <span className="text-gray-300">Biometrics: READY</span>
                  </div>
                </div>

                {/* Column 3: Quick Metrics */}
                <div className="p-5 rounded-2xl bg-[#090b10] border border-white/10 shadow-xl flex flex-col justify-between space-y-2">
                  <div className="text-xs font-bold text-gray-200">Digital Queue Breakdown</div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-[#12151e] border border-white/10">
                      <div className="text-[10px] uppercase font-bold text-emerald-400">Waiting</div>
                      <div className="text-lg font-mono font-black text-white">
                        {branchTickets.filter((t) => t.status === 'checked_in').length}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-[#12151e] border border-white/10">
                      <div className="text-[10px] uppercase font-bold text-red-400">Serving / Called</div>
                      <div className="text-lg font-mono font-black text-white">
                        {branchTickets.filter((t) => t.status === 'called' || t.status === 'serving').length}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-[#12151e] border border-white/10">
                      <div className="text-[10px] uppercase font-bold text-sky-400">Booked</div>
                      <div className="text-lg font-mono font-black text-white">
                        {branchTickets.filter((t) => t.status === 'booked').length}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-[#12151e] border border-white/10">
                      <div className="text-[10px] uppercase font-bold text-[#FCD116]">Completed</div>
                      <div className="text-lg font-mono font-black text-white">
                        {branchTickets.filter((t) => t.status === 'completed').length}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-400 font-mono text-center">
                    Total District Passes: <strong className="text-white">{branchTickets.length}</strong>
                  </div>
                </div>
              </div>

              {/* Queue Tickets Management Section */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#090b10] border border-white/10 shadow-2xl space-y-5">
                {/* Search and Filters Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Radio className="h-4 w-4 text-emerald-400" />
                      <span>Queueing Tickets Management</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-mono text-xs">
                        {branchTickets.length}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      View applicant passes, announce counter calls, reschedule dates, or complete service verifications.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      placeholder="Search ticket #, name, phone..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FCD116]"
                    />
                    {ticketSearch && (
                      <button
                        type="button"
                        onClick={() => setTicketSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setTicketStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                      ticketStatusFilter === 'all'
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'bg-[#12151e] text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    All Statuses ({branchTickets.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTicketStatusFilter('checked_in')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                      ticketStatusFilter === 'checked_in'
                        ? 'bg-[#006B3F] text-white shadow-md'
                        : 'bg-[#12151e] text-emerald-400 hover:bg-[#006B3F]/20'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Waiting / Checked-In ({branchTickets.filter((t) => t.status === 'checked_in').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTicketStatusFilter('called')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                      ticketStatusFilter === 'called'
                        ? 'bg-[#CE1126] text-white shadow-md'
                        : 'bg-[#12151e] text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    Called / Serving ({branchTickets.filter((t) => t.status === 'called' || t.status === 'serving').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTicketStatusFilter('booked')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                      ticketStatusFilter === 'booked'
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'bg-[#12151e] text-sky-400 hover:bg-sky-500/20'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Booked ({branchTickets.filter((t) => t.status === 'booked').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTicketStatusFilter('rescheduled')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                      ticketStatusFilter === 'rescheduled'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'bg-[#12151e] text-amber-400 hover:bg-amber-500/20'
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Rescheduled ({branchTickets.filter((t) => t.status === 'rescheduled').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTicketStatusFilter('completed')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                      ticketStatusFilter === 'completed'
                        ? 'bg-gray-700 text-white shadow-md'
                        : 'bg-[#12151e] text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Completed ({branchTickets.filter((t) => t.status === 'completed').length})
                  </button>
                </div>

                {/* Ticket Cards List */}
                {(() => {
                  const visibleTickets = branchTickets.filter((t) => {
                    // Status filter
                    if (ticketStatusFilter === 'checked_in' && t.status !== 'checked_in') return false;
                    if (ticketStatusFilter === 'called' && t.status !== 'called' && t.status !== 'serving') return false;
                    if (ticketStatusFilter === 'booked' && t.status !== 'booked') return false;
                    if (ticketStatusFilter === 'rescheduled' && t.status !== 'rescheduled') return false;
                    if (ticketStatusFilter === 'completed' && t.status !== 'completed') return false;

                    // Search filter
                    if (ticketSearch.trim()) {
                      const q = ticketSearch.toLowerCase();
                      const matchNumber = t.ticketNumber?.toLowerCase().includes(q);
                      const matchName = t.citizenName?.toLowerCase().includes(q);
                      const matchPhone = t.citizenPhone?.toLowerCase().includes(q);
                      const matchCard = t.ghanaCardNumber?.toLowerCase().includes(q);
                      const matchService = t.serviceType?.toLowerCase().includes(q);
                      const matchBranch = t.branchName?.toLowerCase().includes(q);
                      if (!matchNumber && !matchName && !matchPhone && !matchCard && !matchService && !matchBranch) {
                        return false;
                      }
                    }
                    return true;
                  });

                  if (visibleTickets.length === 0) {
                    return (
                      <div className="p-8 sm:p-12 text-center rounded-2xl bg-[#12151e] border border-white/10 space-y-3">
                        <Radio className="h-8 w-8 text-gray-500 mx-auto" />
                        <h4 className="text-sm font-bold text-gray-200">No Tickets Matching Filters</h4>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto">
                          There are currently no tickets matching your search query or selected status.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setTicketSearch('');
                            setTicketStatusFilter('all');
                            setSelectedAdminAgency('all');
                            setSelectedAdminBranchId('all');
                          }}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
                        >
                          Reset Filters
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3.5">
                      {visibleTickets.map((ticket) => {
                        const normAgency = normalizeServiceAgency(ticket.serviceAgency);
                        const isExpanded = expandedTicketId === ticket.id;
                        const verifiedDocsCount = ticket.requiredChecklist?.filter((c) => c.checked).length || 0;
                        const totalDocsCount = ticket.requiredChecklist?.length || 0;

                        return (
                          <div
                            key={ticket.id}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                              ticket.status === 'called' || ticket.status === 'serving'
                                ? 'bg-gradient-to-r from-red-950/30 via-[#12151e] to-[#090b10] border-red-500/50 shadow-xl'
                                : ticket.status === 'checked_in'
                                ? 'bg-[#12151e] border-emerald-500/30 hover:border-emerald-500/60'
                                : 'bg-[#12151e] border-white/10 hover:border-white/20'
                            }`}
                          >
                            {/* Card Top: Agency Badge, Ticket Number, Status Tag, ETA */}
                            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-white/10 pb-3">
                              <div className="flex items-center gap-2.5">
                                {/* Agency Icon & Badge */}
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 ${
                                    normAgency === 'DVLA'
                                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                      : normAgency === 'Passport'
                                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                                      : normAgency === 'Police'
                                      ? 'bg-red-600/20 text-red-400 border border-red-500/40'
                                      : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                                  }`}
                                >
                                  {normAgency === 'DVLA' && <Car className="h-3.5 w-3.5" />}
                                  {normAgency === 'Passport' && <FileText className="h-3.5 w-3.5" />}
                                  {normAgency === 'Police' && <Shield className="h-3.5 w-3.5" />}
                                  {normAgency === 'Health' && <HeartPulse className="h-3.5 w-3.5" />}
                                  <span>{ticket.serviceAgency}</span>
                                </span>

                                {/* Ticket Number */}
                                <span className="font-mono text-base sm:text-lg font-black text-white tracking-wider">
                                  {ticket.ticketNumber}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Live Status Badge */}
                                {ticket.status === 'called' || ticket.status === 'serving' ? (
                                  <span className="px-3 py-1 rounded-full bg-red-600/30 border border-red-500 text-red-300 font-bold text-xs flex items-center gap-1.5 animate-pulse">
                                    <Volume2 className="h-3.5 w-3.5" />
                                    <span>CALLING: {ticket.assignedCounter || 'Counter 4'}</span>
                                  </span>
                                ) : ticket.status === 'checked_in' ? (
                                  <span className="px-2.5 py-1 rounded-full bg-[#006B3F]/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>Waiting (Checked-In)</span>
                                  </span>
                                ) : ticket.status === 'booked' ? (
                                  <span className="px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold text-xs flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Booked / Scheduled</span>
                                  </span>
                                ) : ticket.status === 'rescheduled' ? (
                                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Rescheduled</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full bg-gray-700/40 border border-gray-600 text-gray-300 font-bold text-xs flex items-center gap-1.5">
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Completed</span>
                                  </span>
                                )}

                                <span className="text-[11px] font-mono text-gray-400">
                                  Est. Wait: <strong className="text-white">{ticket.etaMinutes || 0}m</strong>
                                </span>
                              </div>
                            </div>

                            {/* Card Body: Details & Actions */}
                            <div className="pt-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              {/* Information column */}
                              <div className="space-y-2 flex-1">
                                <h4 className="text-sm sm:text-base font-bold text-white">
                                  {ticket.serviceType}
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                  {/* Citizen */}
                                  <div className="flex items-center gap-1.5 text-gray-300">
                                    <UserCheck className="h-3.5 w-3.5 text-[#FCD116] shrink-0" />
                                    <span className="font-semibold">{ticket.citizenName}</span>
                                  </div>

                                  {/* Phone */}
                                  <div className="flex items-center gap-1.5 text-gray-400 font-mono">
                                    <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    <span>{ticket.citizenPhone}</span>
                                  </div>

                                  {/* Ghana Card */}
                                  <div className="text-gray-400 font-mono text-[11px]">
                                    Card: <span className="text-gray-200">{ticket.ghanaCardNumber}</span>
                                  </div>

                                  {/* Branch */}
                                  <div className="flex items-center gap-1.5 text-gray-400">
                                    <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    <span className="truncate">{ticket.branchName}</span>
                                  </div>

                                  {/* Date and slot */}
                                  <div className="flex items-center gap-1.5 text-gray-300 font-mono">
                                    <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                    <span>{ticket.appointmentDate} • {ticket.timeSlot}</span>
                                  </div>

                                  {/* Geofence Distance */}
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <MapPin className={`h-3.5 w-3.5 shrink-0 ${ticket.isGeofenceActivated ? 'text-emerald-400' : 'text-gray-400'}`} />
                                    <span className={ticket.isGeofenceActivated ? 'text-emerald-300 font-medium' : 'text-gray-400 font-mono'}>
                                      {ticket.isGeofenceActivated ? 'Within Geofence (Active)' : `${ticket.simulatedDistanceKm || 2.5} km away`}
                                    </span>
                                  </div>
                                </div>

                                {/* Reschedule alert banner if applicable */}
                                {ticket.rescheduleReason && (
                                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                                    <div>
                                      <strong>Rescheduled Notice:</strong> {ticket.rescheduleReason}
                                    </div>
                                  </div>
                                )}

                                {/* Expandable Documents Checklist */}
                                {totalDocsCount > 0 && (
                                  <div className="pt-1">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                                      className="text-[11px] font-bold text-gray-400 hover:text-white flex items-center gap-1.5 transition"
                                    >
                                      <span>
                                        Checklist: {verifiedDocsCount}/{totalDocsCount} Requirements Ready
                                      </span>
                                      {isExpanded ? (
                                        <ChevronUp className="h-3.5 w-3.5" />
                                      ) : (
                                        <ChevronDown className="h-3.5 w-3.5" />
                                      )}
                                    </button>

                                    {isExpanded && (
                                      <div className="mt-2 p-3 rounded-xl bg-[#090b10] border border-white/10 space-y-1.5">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                          Applicant Submitted Requirements
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                          {ticket.requiredChecklist.map((chk) => (
                                            <div
                                              key={chk.id}
                                              className="p-2 rounded-lg bg-[#12151e] border border-white/5 flex items-start gap-2 text-xs"
                                            >
                                              <div className="h-4 w-4 rounded bg-[#006B3F]/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="h-2.5 w-2.5" />
                                              </div>
                                              <div>
                                                <div className="text-gray-200 font-medium">{chk.label}</div>
                                                <div className="text-[10px] text-gray-500">{chk.requiredNote}</div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons Toolbar */}
                              <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
                                {/* 1. CALL TICKET */}
                                <button
                                  type="button"
                                  onClick={() => handleCallTicket(ticket.ticketNumber)}
                                  className="flex-1 lg:flex-initial py-2.5 px-3.5 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] active:scale-95 text-white font-bold text-xs transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-1.5 whitespace-nowrap"
                                  title="Announce chime and call applicant to counter"
                                >
                                  <Volume2 className="h-3.5 w-3.5 shrink-0" />
                                  <span>{ticket.status === 'called' ? 'Re-Chime' : 'Call Ticket'}</span>
                                </button>

                                {/* 2. RESCHEDULE */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReschedulingTicket(ticket);
                                    setRescheduleDate(ticket.appointmentDate || '2026-08-20');
                                    setRescheduleSlot(ticket.timeSlot || '02:00 PM - 02:45 PM');
                                    setRescheduleReason(ticket.rescheduleReason || 'Administrative reschedule by Municipal Operations.');
                                  }}
                                  className="flex-1 lg:flex-initial py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap"
                                  title="Reschedule appointment date/time slot"
                                >
                                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                                  <span>Reschedule</span>
                                </button>

                                {/* 3. MARK COMPLETED */}
                                <button
                                  type="button"
                                  onClick={() => handleCompleteTicket(ticket.id)}
                                  disabled={ticket.status === 'completed'}
                                  className="flex-1 lg:flex-initial py-2.5 px-3 rounded-xl bg-[#006B3F]/20 hover:bg-[#006B3F]/35 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                                  title="Mark service completed"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                  <span>{ticket.status === 'completed' ? 'Completed' : 'Complete'}</span>
                                </button>

                                {/* 4. DELETE / PURGE */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTicket(ticket)}
                                  className="py-2.5 px-2.5 rounded-xl bg-[#12151e] hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-gray-400 hover:text-red-400 font-bold text-xs transition active:scale-95 flex items-center justify-center shrink-0"
                                  title="Delete and purge ticket from database"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 3: Analytics Dashboard */}
          {adminTab === 'analytics' && (
            <div className="space-y-6 w-full max-w-full">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#090b10] border border-white/10 shadow-lg">
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Average Resolution Time</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">2.4 Days</div>
                  <div className="text-[11px] text-gray-400 mt-1">Down from 8.6 days before Civiconnect</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#090b10] border border-white/10 shadow-lg">
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total Community Upvotes</div>
                  <div className="text-2xl font-black text-[#FCD116] font-mono mt-1">118 Votes</div>
                  <div className="text-[11px] text-gray-400 mt-1">Quorum threshold active for urgency</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#090b10] border border-white/10 shadow-lg">
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Queue Throughput Rate</div>
                  <div className="text-2xl font-black text-white font-mono mt-1">94.2%</div>
                  <div className="text-[11px] text-gray-400 mt-1">Average counter wait: 8 mins</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3B: Municipal Operations Management */}
          {adminTab === 'operations' && (
            <div className="space-y-6 w-full max-w-full">
              {/* Header banner */}
              <div className="p-5 rounded-2xl bg-[#090b10] border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 font-mono">
                      {currentAssembly.code} • {currentAssembly.region}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
                    Operational Centers & Facilities
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400 font-mono">
                    Active Centers: <strong className="text-white">{districtBranches.length}</strong>
                  </span>
                </div>
              </div>

              {/* Add New Operational Branch / Service Center Form */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#090b10] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center space-x-3 border-b border-white/10 pb-3">
                  <div className="h-9 w-9 rounded-xl bg-[#006B3F]/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Register New Operational Branch</h4>
                    <p className="text-[11px] text-gray-400">
                      Create a verified physical center mapped to {currentAssembly.code}
                    </p>
                  </div>
                </div>

                {branchSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{branchSuccessMsg}</span>
                  </div>
                )}

                {branchErrorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{branchErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCreateBranch} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Statutory Agency
                      </label>
                      <select
                        value={newBranchAgency}
                        onChange={(e) => setNewBranchAgency(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:border-[#FCD116]"
                      >
                        <option value="DVLA">Driver & Vehicle Licensing (DVLA)</option>
                        <option value="Passport Office">Passport Office (MFA)</option>
                        <option value="Ghana Police">Ghana Police Service (GPS)</option>
                        <option value="Health">Ghana Health Service (GHS)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Operational Branch Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        placeholder="e.g. Airport Police Command Station"
                        className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FCD116]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Physical Address / Landmark
                    </label>
                    <input
                      type="text"
                      required
                      value={newBranchAddress}
                      onChange={(e) => setNewBranchAddress(e.target.value)}
                      placeholder="e.g. Airport Residential Area, near Kotoka Terminal 3"
                      className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FCD116]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={newBranchContact}
                        onChange={(e) => setNewBranchContact(e.target.value)}
                        placeholder="e.g. +233 30 277 4123"
                        className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white placeholder-gray-500 font-mono focus:outline-none focus:border-[#FCD116]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Capacity / Hour
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="200"
                        value={newBranchCapacity}
                        onChange={(e) => setNewBranchCapacity(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#FCD116]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Active Counters
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newBranchCounters}
                        onChange={(e) => setNewBranchCounters(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#FCD116]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Opening Time
                      </label>
                      <input
                        type="time"
                        value={newBranchOpen}
                        onChange={(e) => setNewBranchOpen(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#FCD116]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Closing Time
                      </label>
                      <input
                        type="time"
                        value={newBranchClose}
                        onChange={(e) => setNewBranchClose(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#FCD116]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAddingBranch}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#006B3F] hover:bg-[#005230] text-white font-bold text-xs transition shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2"
                  >
                    {isAddingBranch ? (
                      <span className="animate-pulse">Saving Operational Branch...</span>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Register Operational Center</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* District Active Operational Centers Display */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#090b10] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#FCD116]" />
                      Active Operational Centers for {currentAssembly.name} ({districtBranches.length})
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Live branches mapped to this Municipal Assembly available in citizen queue booking
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {districtBranches.map((branch) => {
                    const norm = normalizeServiceAgency(branch.agency);
                    return (
                      <div
                        key={branch.id}
                        className="p-4 rounded-xl bg-[#12151e] border border-white/10 hover:border-white/20 transition space-y-2.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                              norm === 'DVLA'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : norm === 'Passport'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : norm === 'Police'
                                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {branch.agency}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            {branch.activeCounters} Counters Active
                          </span>
                        </div>

                        <div>
                          <div className="text-xs font-bold text-white leading-snug">{branch.name}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0 text-gray-500" />
                            <span className="truncate">{branch.address}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-500" /> {branch.openHours}
                          </span>
                          <span className="text-[#FCD116]">
                            Cap: {branch.capacityPerHour}/hr
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Super Admin MMDA Provisioning */}
          {adminTab === 'super_provision' && (
            <div className="p-4 sm:p-6 rounded-2xl bg-[#090b10] border border-white/10 space-y-6 shadow-xl w-full max-w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 mt-1">
                    <Building2 className="h-5 w-5 text-[#CE1126]" />
                    Register New District/Municipal Assembly
                  </h3>
                </div>
              </div>

              {provisionSuccessMsg && (
                <div className="p-4 rounded-xl bg-[#006B3F]/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{provisionSuccessMsg}</span>
                  </div>
                  {createdCredentials && (
                    <div className="p-3 rounded-lg bg-[#050608] border border-emerald-500/30 text-xs text-gray-300 space-y-1 font-mono">
                      <div className="text-[11px] text-[#FCD116] font-bold uppercase">Immediate Staff Login Credentials:</div>
                      <div>Municipal ID / Code: <span className="text-white font-bold">{createdCredentials.code}</span></div>
                      <div>Password: <span className="text-white font-bold">{createdCredentials.pass}</span></div>
                      <div>Admin Email: <span className="text-white">{createdCredentials.email}</span></div>
                      <div className="text-[10px] text-gray-400 font-sans mt-1">
                        ★ Municipal Officers can now go to the Staff Login portal and authenticate immediately using these credentials.
                      </div>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleProvisionAssembly} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Municipal Assembly Name <span className="text-[#CE1126]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={provName}
                      onChange={(e) => setProvName(e.target.value)}
                      placeholder="e.g. Ayawaso West Municipal Assembly"
                      className="w-full px-3 py-2.5 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FCD116]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Municipal ID / Code <span className="text-[#CE1126]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={provCode}
                      onChange={(e) => setProvCode(e.target.value.toUpperCase())}
                      placeholder="e.g. AWMA"
                      className="w-full px-3 py-2.5 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#FCD116]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Municipal Admin Password <span className="text-[#CE1126]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={provPassword}
                      onChange={(e) => setProvPassword(e.target.value)}
                      placeholder="e.g. AyawasoAdmin2026!"
                      className="w-full px-3 py-2.5 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#FCD116]"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Staff will use this password to sign into this municipality.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Administrative Region <span className="text-[#CE1126]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={provRegion}
                      onChange={(e) => setProvRegion(e.target.value)}
                      placeholder="e.g. Greater Accra Region"
                      className="w-full px-3 py-2.5 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FCD116]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Headquarters Location</label>
                    <input
                      type="text"
                      required
                      value={provHQ}
                      onChange={(e) => setProvHQ(e.target.value)}
                      placeholder="e.g. Dzorwulu, Accra"
                      className="w-full px-3 py-2.5 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FCD116]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">District Chief Executive (DCE)</label>
                    <input
                      type="text"
                      required
                      value={provDCE}
                      onChange={(e) => setProvDCE(e.target.value)}
                      placeholder="e.g. Hon. Sandra Owusu-Ahinkorah"
                      className="w-full px-3 py-2.5 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FCD116]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Official Admin Email</label>
                    <input
                      type="email"
                      required
                      value={provEmail}
                      onChange={(e) => setProvEmail(e.target.value)}
                      placeholder="e.g. admin.awma@civiclink.gov.gh"
                      className="w-full px-3 py-2.5 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#FCD116]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] active:scale-[0.99] text-white font-bold text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Register District & Generate Credentials</span>
                </button>
              </form>
            </div>
          )}
        </>

      {/* Photo Resolution Proof Uploader Modal */}
      {resolvingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#090b10] border border-white/10 shadow-2xl overflow-hidden">
            <div className="h-1.5 w-full flex">
              <div className="h-full w-1/3 bg-[#CE1126]"></div>
              <div className="h-full w-1/3 bg-[#FCD116]"></div>
              <div className="h-full w-1/3 bg-[#006B3F]"></div>
            </div>

            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-[#006B3F]/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Sign Off Resolution Proof</h3>
                  <p className="text-[10px] text-gray-400">{resolvingIssue.id} • {truncateText(resolvingIssue.districtName, 25)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResolvingIssue(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitResolution} className="p-4 sm:p-5 space-y-3.5 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Issue</label>
                <div className="text-xs text-gray-200 font-semibold bg-[#12151e] p-2 rounded-xl border border-white/10">
                  {truncateText(resolvingIssue.title, 45)}
                </div>
              </div>

              {/* Native Camera and Gallery upload for Proof of Work */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  After-Fix Photo Evidence
                </label>

                <input
                  ref={adminCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleAdminImageFile}
                  className="hidden"
                />
                <input
                  ref={adminGalleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAdminImageFile}
                  className="hidden"
                />

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => adminCameraInputRef.current?.click()}
                    className="py-2 px-3 rounded-xl bg-[#12151e] hover:bg-[#1a1e2b] border border-white/10 hover:border-emerald-400/40 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Camera className="h-3.5 w-3.5 text-[#FCD116]" />
                    <span>Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => adminGalleryInputRef.current?.click()}
                    className="py-2 px-3 rounded-xl bg-[#12151e] hover:bg-[#1a1e2b] border border-white/10 hover:border-emerald-400/40 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Upload Gallery</span>
                  </button>
                </div>

                {afterImage ? (
                  <div className="h-28 w-full rounded-xl overflow-hidden border border-white/10 bg-[#050608] relative">
                    <img src={afterImage} alt="After preview" className="h-full w-full object-cover" />
                    <div className="absolute top-1.5 right-1.5">
                      <button
                        type="button"
                        onClick={() => setAfterImage('')}
                        className="p-1 rounded-lg bg-black/80 text-red-400 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-white/10 bg-[#090b10] text-center text-gray-400 text-[11px]">
                    Capture or select verified resolution photo
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Engineer</label>
                  <input
                    type="text"
                    required
                    value={engineerName}
                    onChange={(e) => setEngineerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FCD116]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Title / Unit</label>
                  <input
                    type="text"
                    required
                    value={engineerTitle}
                    onChange={(e) => setEngineerTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FCD116]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Work Description</label>
                <textarea
                  rows={2}
                  required
                  value={resolutionDetails}
                  onChange={(e) => setResolutionDetails(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white resize-none focus:outline-none focus:border-[#FCD116]"
                  placeholder="Completed drainage clearance and concrete culvert reinforcing..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Materials Cost (GH₵)</label>
                <input
                  type="number"
                  required
                  value={materialsCost}
                  onChange={(e) => setMaterialsCost(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#FCD116]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setResolvingIssue(null)}
                  className="w-1/3 py-2 px-3 rounded-xl bg-[#12151e] hover:bg-[#181c28] text-gray-300 font-bold text-xs transition border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 px-3 rounded-xl bg-[#006B3F] hover:bg-[#005230] text-white font-bold text-xs transition shadow-lg flex items-center justify-center gap-1.5"
                >
                  <FileCheck2 className="h-4 w-4" />
                  <span>Certify & Publish Proof</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* One-Click Rescheduler Modal */}
      {reschedulingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#090b10] border border-white/10 shadow-2xl overflow-hidden">
            <div className="h-1.5 w-full flex">
              <div className="h-full w-1/3 bg-[#CE1126]"></div>
              <div className="h-full w-1/3 bg-[#FCD116]"></div>
              <div className="h-full w-1/3 bg-[#006B3F]"></div>
            </div>

            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#FCD116]">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reschedule Ticket</h3>
                  <p className="text-xs text-gray-400">{reschedulingTicket.ticketNumber} • {reschedulingTicket.citizenName}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitReschedule} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">New Time Slot</label>
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono"
                >
                  <option value="09:00 AM - 09:45 AM">09:00 AM - 09:45 AM</option>
                  <option value="11:30 AM - 12:15 PM">11:30 AM - 12:15 PM</option>
                  <option value="02:00 PM - 02:45 PM">02:00 PM - 02:45 PM</option>
                  <option value="03:30 PM - 04:15 PM">03:30 PM - 04:15 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Reason for Reschedule</label>
                <textarea
                  rows={3}
                  required
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white resize-none"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingTicket(null)}
                  className="w-1/3 py-2.5 px-4 rounded-xl bg-[#12151e] hover:bg-[#181c28] text-gray-300 font-semibold text-xs transition border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] text-white font-bold text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Shift Time & Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {deletingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#090b10] border border-red-500/40 shadow-2xl overflow-hidden">
            <div className="h-1.5 w-full bg-[#CE1126]"></div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Delete Queue Ticket</h3>
                  <p className="text-xs text-gray-400">Permanently purge ticket from municipal queue</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#12151e] border border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Ticket Number:</span>
                  <span className="font-mono font-bold text-white">{deletingTicket.ticketNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Citizen:</span>
                  <span className="font-medium text-gray-200">{deletingTicket.citizenName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Service:</span>
                  <span className="text-gray-300 truncate max-w-[200px]">{deletingTicket.serviceType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Scheduled For:</span>
                  <span className="font-mono text-gray-300">{deletingTicket.appointmentDate} • {deletingTicket.timeSlot}</span>
                </div>
              </div>

              <p className="text-xs text-red-300/90 bg-red-950/30 p-3 rounded-xl border border-red-500/20">
                Are you sure you want to remove this ticket? This action cannot be undone and will cancel the citizen&apos;s queue pass.
              </p>

              <div className="flex items-center space-x-3 pt-1">
                <button
                  type="button"
                  disabled={isDeletingTicket}
                  onClick={() => setDeletingTicket(null)}
                  className="w-1/3 py-2.5 px-4 rounded-xl bg-[#12151e] hover:bg-[#181c28] text-gray-300 font-semibold text-xs transition border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingTicket}
                  onClick={handleConfirmDeleteTicket}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] text-white font-bold text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isDeletingTicket ? 'Deleting...' : 'Yes, Delete Ticket'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
