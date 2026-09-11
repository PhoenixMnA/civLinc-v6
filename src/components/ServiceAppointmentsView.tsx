import React, { useState, useEffect } from 'react';
import { 
  Car, 
  FileText, 
  Shield, 
  HeartPulse, 
  Calendar, 
  MapPin, 
  CheckSquare, 
  AlertCircle, 
  ChevronRight, 
  Sparkles, 
  Ticket as TicketIcon, 
  Info,
  Building2,
  Trash2
} from 'lucide-react';
import { ServiceAgency, AgencyBranch, AppointmentTicket, MunicipalAssembly } from '../types';
import { civicStore } from '../services/store';
import { LiveDigitalTicketView } from './LiveDigitalTicketView';
import { sounds } from '../services/soundEffects';
import { normalizeServiceAgency, truncateText } from '../utils/agencyHelpers';

interface Props {
  branches: AgencyBranch[];
  tickets: AppointmentTicket[];
  onOpenGhanaCardAuth: () => void;
}

const AGENCY_SERVICES = {
  DVLA: [
    { title: 'Driver License Renewal (Class B & C)', duration: '30 mins', fee: 'GH₵ 185.00' },
    { title: 'Vehicle Roadworthiness Inspection & Sticker', duration: '45 mins', fee: 'GH₵ 220.00' },
    { title: 'Learner Driver Theory & Biometric Exam', duration: '60 mins', fee: 'GH₵ 150.00' },
    { title: 'International Driving Permit (IDP)', duration: '20 mins', fee: 'GH₵ 350.00' }
  ],
  Passport: [
    { title: '32-Page Standard Biometric Passport', duration: '45 mins', fee: 'GH₵ 500.00' },
    { title: '48-Page Frequent Traveler Passport', duration: '45 mins', fee: 'GH₵ 700.00' },
    { title: 'Biometric Data Re-enrollment & Correction', duration: '30 mins', fee: 'GH₵ 200.00' },
    { title: 'Expedited VIP Priority Processing', duration: '20 mins', fee: 'GH₵ 900.00' }
  ],
  Police: [
    { title: 'Police Criminal Record Clearance Certificate', duration: '25 mins', fee: 'GH₵ 120.00' },
    { title: 'Official Crime / Break-in Incident Report Filing', duration: '40 mins', fee: 'Free / Official' },
    { title: 'Stolen Vehicle / Property Affidavit Verification', duration: '30 mins', fee: 'GH₵ 80.00' },
    { title: 'Firearms Licensing & Background Screening', duration: '50 mins', fee: 'GH₵ 400.00' }
  ],
  Health: [
    { title: 'NHIS Biometric Card Link & Renewal', duration: '15 mins', fee: 'GH₵ 30.00' },
    { title: 'Outpatient (OPD) Consultation & Triage', duration: '35 mins', fee: 'NHIS Covered' },
    { title: 'Specialist Polyclinic Appointment', duration: '45 mins', fee: 'NHIS / GH₵ 150.00' },
    { title: 'Maternal & Child Health Immunization', duration: '20 mins', fee: 'Free (GHS)' }
  ]
};

const AGENCY_CHECKLIST_TEMPLATES = {
  DVLA: [
    { id: 'dvla-1', label: 'Original Physical Ghana Card (NIA)', checked: false, requiredNote: 'Digital phone screenshots are not accepted by DVLA turnstiles.' },
    { id: 'dvla-2', label: 'Expired / Current Driver License Card', checked: false, requiredNote: 'Or Police Loss Report if card was misplaced.' },
    { id: 'dvla-3', label: 'Completed Form F-1 (Physical or Verified Online)', checked: false, requiredNote: 'Mandatory standard renewal application.' },
    { id: 'dvla-4', label: 'In-Date Eye Exam Certificate / Optometrist Token', checked: false, requiredNote: 'Available on-site or accredited eye clinic.' }
  ],
  Passport: [
    { id: 'pass-1', label: 'Original Physical Ghana Card & Valid NIA Record', checked: false, requiredNote: 'Strictly mandatory under National Passport Regulations.' },
    { id: 'pass-2', label: 'Original Birth Certificate (Certified by BDR Registry)', checked: false, requiredNote: 'Population register verification required.' },
    { id: 'pass-3', label: '2 Passport Size Color Photos (White Background, 35x45mm)', checked: false, requiredNote: 'Neutral expression, no colored eyeglasses.' },
    { id: 'pass-4', label: 'Ghana.gov Payment Invoice Slip', checked: false, requiredNote: 'Stamped or printed payment confirmation.' }
  ],
  Police: [
    { id: 'pol-1', label: 'Original Ghana Card (Physical)', checked: false, requiredNote: 'CID fingerprint and identity matching verification.' },
    { id: 'pol-2', label: '2 Recent Passport Size Photographs', checked: false, requiredNote: 'CID permanent registry filing.' },
    { id: 'pol-3', label: 'GhanaPost Digital Address Code (GA-XXX-XXXX)', checked: false, requiredNote: 'Residential address physical verification.' }
  ],
  Health: [
    { id: 'ghs-1', label: 'Original Ghana Card / NHIS Membership Card', checked: false, requiredNote: 'Universal health coverage biometric identifier.' },
    { id: 'ghs-2', label: 'Previous Medical Folder / Hospital Case Book', checked: false, requiredNote: 'Patient historical records.' },
    { id: 'ghs-3', label: 'Referral Letter (if booking specialist OPD)', checked: false, requiredNote: 'Signed by attending medical officer.' }
  ]
};

export const ServiceAppointmentsView: React.FC<Props> = ({ branches, tickets, onOpenGhanaCardAuth }) => {
  const currentUser = civicStore.getCurrentUser();
  const assemblies: MunicipalAssembly[] = civicStore.getAssemblies();

  const [selectedAgency, setSelectedAgency] = useState<ServiceAgency>('DVLA');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('all');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('br-dvla-37');
  const [selectedService, setSelectedService] = useState(AGENCY_SERVICES.DVLA[0].title);
  const [appointmentDate, setAppointmentDate] = useState('2026-08-20');
  const [timeSlot, setTimeSlot] = useState('10:30 AM - 11:15 AM');

  // Booking Flow State
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [checklistItems, setChecklistItems] = useState(AGENCY_CHECKLIST_TEMPLATES.DVLA);
  const [bookingError, setBookingError] = useState('');
  const [selectedViewingTicket, setSelectedViewingTicket] = useState<AppointmentTicket | null>(
    tickets[0] || null
  );
  const [deletingCitizenTicket, setDeletingCitizenTicket] = useState<AppointmentTicket | null>(null);
  const [isDeletingCitizenTicket, setIsDeletingCitizenTicket] = useState(false);

  const handleConfirmDeleteCitizenTicket = async () => {
    if (!deletingCitizenTicket) return;
    setIsDeletingCitizenTicket(true);
    const id = deletingCitizenTicket.id;
    await civicStore.cancelTicket(id);
    sounds.playNotificationPing();
    if (selectedViewingTicket?.id === id) {
      const remaining = tickets.filter((t) => t.id !== id);
      setSelectedViewingTicket(remaining[0] || null);
    }
    setIsDeletingCitizenTicket(false);
    setDeletingCitizenTicket(null);
  };

  // Dynamic branch list calculated based on normalized agency and selected district/municipality
  const availableBranches = React.useMemo(() => {
    return civicStore.getBranchesForAssembly(selectedDistrictId, selectedAgency);
  }, [selectedDistrictId, selectedAgency, branches]);

  const currentBranch = availableBranches.find((b) => b.id === selectedBranchId) || availableBranches[0] || branches[0];

  // Auto-sync branch selection when agency or district changes
  useEffect(() => {
    if (availableBranches.length > 0) {
      if (!availableBranches.some((b) => b.id === selectedBranchId)) {
        setSelectedBranchId(availableBranches[0].id);
      }
    }
  }, [availableBranches, selectedBranchId]);

  // Keep viewing ticket in sync if tickets change or when a ticket is called
  useEffect(() => {
    const calledTicket = tickets.find((t) => t.status === 'called');
    if (calledTicket) {
      setSelectedViewingTicket(calledTicket);
    } else if (selectedViewingTicket) {
      const stillExists = tickets.find((t) => t.id === selectedViewingTicket.id);
      if (!stillExists) {
        setSelectedViewingTicket(tickets[0] || null);
      } else {
        setSelectedViewingTicket(stillExists);
      }
    } else if (tickets.length > 0) {
      setSelectedViewingTicket(tickets[0]);
    }
  }, [tickets]);

  const handleAgencyChange = (agency: ServiceAgency) => {
    const norm = normalizeServiceAgency(agency);
    setSelectedAgency(norm);
    const branchList = civicStore.getBranchesForAssembly(selectedDistrictId, norm);
    if (branchList.length > 0) {
      setSelectedBranchId(branchList[0].id);
    }
    setSelectedService(AGENCY_SERVICES[norm][0].title);
    setChecklistItems(AGENCY_CHECKLIST_TEMPLATES[norm].map((item) => ({ ...item, checked: false })));
  };

  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    const branchList = civicStore.getBranchesForAssembly(distId, selectedAgency);
    if (branchList.length > 0) {
      setSelectedBranchId(branchList[0].id);
    }
  };

  const handleOpenChecklist = () => {
    setBookingError('');
    setChecklistItems(AGENCY_CHECKLIST_TEMPLATES[selectedAgency].map((item) => ({ ...item, checked: false })));
    setIsChecklistModalOpen(true);
  };

  const handleToggleChecklistItem = (itemId: string) => {
    sounds.playScannerBeep();
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleConfirmBooking = async () => {
    setBookingError('');
    const allChecked = checklistItems.every((item) => item.checked);
    if (!allChecked) {
      setBookingError('You must check off every required physical document before confirming your slot.');
      sounds.playSecurityAlert();
      return;
    }

    const branchToUse = currentBranch || availableBranches[0] || branches[0];
    const result = await civicStore.bookAppointment({
      serviceAgency: selectedAgency,
      serviceType: selectedService,
      branchId: branchToUse.id,
      appointmentDate,
      timeSlot,
      checklist: checklistItems
    });

    if (result.success && result.ticket) {
      setIsChecklistModalOpen(false);
      setSelectedViewingTicket(result.ticket);
      sounds.playSuccessTone();
    } else {
      setBookingError(result.error || 'Failed to book appointment');
    }
  };

  const activeTickets = tickets.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      {/* Module Header Banner with Ghanaian Flag Styling */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#090b10] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Tricolor top border */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="h-full w-1/3 bg-[#CE1126]"></div>
          <div className="h-full w-1/3 bg-[#FCD116]"></div>
          <div className="h-full w-1/3 bg-[#006B3F]"></div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 pt-1">
          <div className="flex items-center space-x-2">
            <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#12151e] border border-white/10 text-left md:text-right shadow-inner w-full md:w-auto">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Active Queue Tickets</div>
              <div className="text-base sm:text-lg font-bold text-[#FCD116] font-mono">{activeTickets.length} Scheduled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Booking & Agencies; Right = Active Live Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-full">
        {/* Left Side: Agency Selector & Wizard (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-5 w-full max-w-full">
          {/* Agency Navigation Tabs - 2x2 grid on mobile, 4 cols on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 w-full">
            <button
              type="button"
              onClick={() => handleAgencyChange('DVLA')}
              className={`p-3 sm:p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 sm:gap-2 transition w-full ${
                selectedAgency === 'DVLA'
                  ? 'bg-amber-500/15 border-[#FCD116] text-[#FCD116] shadow-md shadow-amber-400/10'
                  : 'bg-[#090b10] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              <Car className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs font-bold">DVLA</span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 text-center truncate w-full">Driver & Vehicle</span>
            </button>

            <button
              type="button"
              onClick={() => handleAgencyChange('Passport')}
              className={`p-3 sm:p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 sm:gap-2 transition w-full ${
                selectedAgency === 'Passport'
                  ? 'bg-red-600/15 border-[#CE1126] text-red-400 shadow-md shadow-red-600/10'
                  : 'bg-[#090b10] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs font-bold">Passport</span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 text-center truncate w-full">PAC Centers</span>
            </button>

            <button
              type="button"
              onClick={() => handleAgencyChange('Police')}
              className={`p-3 sm:p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 sm:gap-2 transition w-full ${
                selectedAgency === 'Police'
                  ? 'bg-blue-600/15 border-blue-500 text-blue-400 shadow-md shadow-blue-600/10'
                  : 'bg-[#090b10] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs font-bold">Police</span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 text-center truncate w-full">Ghana Police</span>
            </button>

            <button
              type="button"
              onClick={() => handleAgencyChange('Health')}
              className={`p-3 sm:p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 sm:gap-2 transition w-full ${
                selectedAgency === 'Health'
                  ? 'bg-[#006B3F]/25 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-700/10'
                  : 'bg-[#090b10] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs font-bold">Health</span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 text-center truncate w-full">Ghana Health / OPD</span>
            </button>
          </div>

          {/* Booking Config Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b10] border border-white/10 space-y-4 shadow-xl w-full max-w-full">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#FCD116]" />
              Schedule In-Person Appointment ({selectedAgency})
            </h3>

            {/* Select Service */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                Service Required
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AGENCY_SERVICES[selectedAgency].map((svc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedService(svc.title)}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      selectedService === svc.title
                        ? 'bg-amber-500/15 border-[#FCD116] text-[#FCD116] font-bold shadow-sm'
                        : 'bg-[#12151e] border-white/10 text-gray-300 hover:border-white/20'
                    }`}
                  >
                    <div className="truncate">{svc.title}</div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1.5">
                      <span>⏱ {svc.duration}</span>
                      <span className="font-mono text-[#FCD116] font-bold">{svc.fee}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Municipality Filter & Dynamic Operational Centre Dropdown */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* District / Assembly Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-[#FCD116]" />
                    <span>Filter by Municipality</span>
                  </label>
                  <select
                    value={selectedDistrictId}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FCD116]"
                  >
                    <option value="all">★ All Greater Accra & Regional Municipalities</option>
                    {assemblies.map((asm) => (
                      <option key={asm.id} value={asm.id}>
                        {truncateText(asm.name, 35)} ({asm.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Operational Centre Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#FCD116]" />
                    <span>Operational Centre / Branch</span>
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FCD116]"
                  >
                    {availableBranches.map((br) => (
                      <option key={br.id} value={br.id}>
                        {truncateText(br.name, 30)} ({truncateText(br.district, 18)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {currentBranch && (
                <div className="p-3 rounded-xl bg-[#12151e] border border-white/5 flex items-start space-x-2 text-[11px] text-gray-400">
                  <MapPin className="h-3.5 w-3.5 text-[#FCD116] shrink-0 mt-0.5" />
                  <div className="w-full truncate">
                    <span className="text-gray-200 font-medium">{currentBranch.name} — {currentBranch.address}</span>
                    <div className="text-gray-400 mt-0.5">Hours: {currentBranch.openHours} • {currentBranch.countersCount} active service counters</div>
                  </div>
                </div>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={appointmentDate}
                  min="2026-08-20"
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#FCD116]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Select Time Window</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#FCD116]"
                >
                  <option value="08:30 AM - 09:15 AM">08:30 AM - 09:15 AM</option>
                  <option value="10:30 AM - 11:15 AM">10:30 AM - 11:15 AM</option>
                  <option value="11:45 AM - 12:30 PM">11:45 AM - 12:30 PM</option>
                  <option value="01:30 PM - 02:15 PM">01:30 PM - 02:15 PM</option>
                  <option value="02:45 PM - 03:30 PM">02:45 PM - 03:30 PM</option>
                </select>
              </div>
            </div>

            {/* Book Trigger Button */}
            <button
              type="button"
              onClick={handleOpenChecklist}
              className="w-full py-3 px-4 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] active:scale-[0.98] text-white font-bold text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              <span>Proceed to Mandatory Pre-Check Checklist</span>
            </button>
          </div>

          {/* User's Ticket List */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#FCD116]">
              Your Scheduled Tickets ({tickets.length})
            </h4>
            <div className="space-y-2">
              {tickets.map((tkt) => {
                const isSelected = selectedViewingTicket?.id === tkt.id;
                const isCalled = tkt.status === 'called';
                const isRescheduled = tkt.status === 'rescheduled';

                return (
                  <div
                    key={tkt.id}
                    onClick={() => setSelectedViewingTicket(tkt)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-[#12151e] border-[#FCD116] shadow-md shadow-amber-400/10'
                        : 'bg-[#090b10] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isCalled
                          ? 'bg-[#CE1126] text-white animate-bounce'
                          : isRescheduled
                          ? 'bg-amber-500/20 text-[#FCD116] border border-amber-500/30'
                          : 'bg-[#12151e] text-[#FCD116] border border-white/10'
                      }`}>
                        {tkt.ticketNumber.slice(0, 4)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-white font-mono">{tkt.ticketNumber}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                            isCalled
                              ? 'bg-[#CE1126] text-white'
                              : isRescheduled
                              ? 'bg-amber-500/20 text-[#FCD116] border border-amber-500/30'
                              : tkt.status === 'checked_in'
                              ? 'bg-[#006B3F] text-white border border-emerald-500/30'
                              : 'bg-white/10 text-gray-300'
                          }`}>
                            {isCalled ? '🔔 CALLING' : isRescheduled ? '⚠️ RESCHEDULED' : tkt.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-300 line-clamp-1">{truncateText(tkt.serviceType, 30)}</div>
                        <div className="text-[10px] text-gray-400">{truncateText(tkt.branchName, 22)} • {tkt.appointmentDate}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingCitizenTicket(tkt);
                      }}
                      className="p-2 rounded-lg bg-[#12151e] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition self-end xs:self-center border border-white/5 hover:border-red-500/30"
                      title="Cancel / Delete appointment ticket"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Live Digital Ticket Counter & Geofenced Activation */}
        <div className="lg:col-span-5 w-full max-w-full">
          {selectedViewingTicket ? (
            <LiveDigitalTicketView 
              ticket={selectedViewingTicket} 
              onTicketDeleted={(deletedId) => {
                const remaining = tickets.filter((t) => t.id !== deletedId);
                setSelectedViewingTicket(remaining[0] || null);
              }}
            />
          ) : (
            <div className="p-6 sm:p-8 text-center rounded-2xl bg-[#090b10] border border-white/10">
              <TicketIcon className="h-10 w-10 text-gray-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-gray-300">No Ticket Selected</h4>
              <p className="text-xs text-gray-500 mt-1">Book an appointment or select an existing ticket to view live queue status.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Pre-Check Checklist Modal */}
      {isChecklistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#090b10] border border-white/10 shadow-2xl overflow-hidden">
            {/* Ghana flag ribbon */}
            <div className="h-1.5 w-full flex">
              <div className="h-full w-1/3 bg-[#CE1126]"></div>
              <div className="h-full w-1/3 bg-[#FCD116]"></div>
              <div className="h-full w-1/3 bg-[#006B3F]"></div>
            </div>

            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#FCD116] shrink-0">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Mandatory Pre-Check Checklist</h3>
                  <p className="text-xs text-gray-400">{selectedAgency} Physical Document Verification</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 max-h-[65vh] sm:max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-[#FCD116] flex items-start space-x-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Under Ghanaian Public Service Regulations, appointments are only confirmed after you verify possession of all required physical documents.
                </span>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklistItem(item.id)}
                    className={`p-3 sm:p-3.5 rounded-xl border transition cursor-pointer flex items-start space-x-3 ${
                      item.checked
                        ? 'bg-[#006B3F]/20 border-emerald-500/50 text-emerald-200'
                        : 'bg-[#12151e] border-white/10 text-gray-300 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => {}}
                      className="mt-0.5 h-4 w-4 rounded border-gray-700 text-[#006B3F] focus:ring-0 shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white">{item.label}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{item.requiredNote}</div>
                    </div>
                  </div>
                ))}
              </div>

              {bookingError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{bookingError}</span>
                </div>
              )}
            </div>

            <div className="p-3.5 sm:p-4 border-t border-white/10 bg-[#090b10] flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setIsChecklistModalOpen(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-[#12151e] hover:bg-[#181c28] text-gray-300 font-bold text-xs transition border border-white/10 text-center"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmBooking}
                className="w-full sm:w-auto py-2.5 px-4 sm:px-5 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] active:scale-[0.98] text-white font-bold text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 text-center"
              >
                <CheckSquare className="h-4 w-4 shrink-0" />
                <span>Confirm Verified Booking</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Citizen Cancel Ticket Confirmation Modal */}
      {deletingCitizenTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-[#090b10] border border-red-500/40 shadow-2xl overflow-hidden">
            <div className="h-1.5 w-full bg-[#CE1126]"></div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cancel Appointment Pass</h3>
                  <p className="text-xs text-gray-400">Ticket #{deletingCitizenTicket.ticketNumber}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#12151e] border border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Service:</span>
                  <span className="text-white font-medium truncate max-w-[200px]">{deletingCitizenTicket.serviceType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Center:</span>
                  <span className="text-gray-200">{deletingCitizenTicket.branchName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Date & Slot:</span>
                  <span className="font-mono text-[#FCD116]">{deletingCitizenTicket.appointmentDate} • {deletingCitizenTicket.timeSlot}</span>
                </div>
              </div>

              <p className="text-xs text-gray-300">
                Are you sure you want to cancel your appointment? Your slot and place in the live digital queue will be released back to the municipal assembly.
              </p>

              <div className="flex items-center space-x-3 pt-1">
                <button
                  type="button"
                  disabled={isDeletingCitizenTicket}
                  onClick={() => setDeletingCitizenTicket(null)}
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-[#12151e] hover:bg-[#181c28] text-gray-300 font-semibold text-xs transition border border-white/10"
                >
                  Keep Pass
                </button>
                <button
                  type="button"
                  disabled={isDeletingCitizenTicket}
                  onClick={handleConfirmDeleteCitizenTicket}
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] text-white font-bold text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isDeletingCitizenTicket ? 'Cancelling...' : 'Yes, Cancel Pass'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
