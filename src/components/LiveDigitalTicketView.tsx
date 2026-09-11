import React, { useState } from 'react';
import { 
  Ticket, 
  Radio, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Navigation, 
  Sparkles,
  Printer,
  Trash2,
  CalendarDays,
  MapPin,
  X
} from 'lucide-react';
import { AppointmentTicket } from '../types';
import { civicStore } from '../services/store';
import { sounds } from '../services/soundEffects';
import { truncateText } from '../utils/agencyHelpers';

interface Props {
  ticket: AppointmentTicket;
  onTicketDeleted?: (ticketId: string) => void;
}

export const LiveDigitalTicketView: React.FC<Props> = ({ ticket, onTicketDeleted }) => {
  const [simulatedKm, setSimulatedKm] = useState<number>(ticket?.simulatedDistanceKm ?? 0.8);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [newDate, setNewDate] = useState(ticket?.appointmentDate || '2026-08-20');
  const [newTime, setNewTime] = useState(ticket?.timeSlot || '10:30 AM - 11:15 AM');
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (ticket) {
      setSimulatedKm(ticket.simulatedDistanceKm ?? 0.8);
      setNewDate(ticket.appointmentDate || '2026-08-20');
      setNewTime(ticket.timeSlot || '10:30 AM - 11:15 AM');
    }
  }, [ticket?.id, ticket?.simulatedDistanceKm, ticket?.appointmentDate, ticket?.timeSlot]);

  const handleDistanceChange = (newDistance: number) => {
    setSimulatedKm(newDistance);
    civicStore.updateTicketProximity(ticket.id, newDistance);
  };

  const handleManualCheckIn = async () => {
    setIsProcessing(true);
    await civicStore.checkInTicket(ticket.id);
    setIsProcessing(false);
  };

  const handleConfirmReschedule = async () => {
    setIsProcessing(true);
    await civicStore.rescheduleTicket(ticket.id, newDate, newTime, 'Citizen requested schedule shift.');
    setIsProcessing(false);
    setIsRescheduling(false);
  };

  const handleConfirmCancelTicket = async () => {
    setIsProcessing(true);
    const ticketId = ticket.id;
    await civicStore.cancelTicket(ticketId);
    sounds.playNotificationPing();
    setIsProcessing(false);
    setIsConfirmingDelete(false);
    onTicketDeleted?.(ticketId);
  };

  const handlePrintTicket = () => {
    sounds.playScannerBeep();
    window.print();
  };

  const isCalled = ticket.status === 'called';
  const isCheckedIn = ticket.isGeofenceActivated || ticket.status === 'checked_in' || isCalled;
  const isRescheduled = ticket.status === 'rescheduled';

  return (
    <div className="space-y-4 w-full max-w-full">
      {/* Rescheduled Notice Banner */}
      {isRescheduled && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-[#FCD116]/40 text-[#FCD116] shadow-lg">
          <div className="flex items-center space-x-2 font-bold text-xs mb-1">
            <AlertTriangle className="h-4 w-4 text-[#FCD116]" />
            Appointment Rescheduled by Agency
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            {ticket.rescheduleReason || 'Operational maintenance. Time shifted automatically.'}
          </p>
          <div className="mt-2 text-[11px] text-[#FCD116] font-mono">
            New Time Slot: {ticket.appointmentDate} ({ticket.timeSlot})
          </div>
        </div>
      )}

      {/* Digital Ticket Card */}
      <div className="rounded-2xl bg-[#090b10] border border-white/10 shadow-2xl overflow-hidden relative">
        {/* Tricolor top border */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-[#CE1126]"></div>
          <div className="h-full w-1/3 bg-[#FCD116]"></div>
          <div className="h-full w-1/3 bg-[#006B3F]"></div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Main Ticket Number Display */}
          <div className="rounded-2xl bg-gradient-to-br from-[#12151e] to-[#090b10] p-4 sm:p-6 border border-white/10 text-center shadow-inner relative overflow-hidden">
            <div className="absolute top-2 right-3 text-[#FCD116] text-xl opacity-30 select-none">★</div>
            <span className="text-[10px] uppercase tracking-widest text-[#FCD116] font-bold">
              Official Digital Pass
            </span>
            <div
              id="digital-pass-ticket-number"
              className="text-3xl xs:text-4xl sm:text-5xl font-black text-[#d9d9d9] border border-[#15151e] rounded-lg font-mono my-2 tracking-tighter break-all"
            >
              {ticket.ticketNumber}
            </div>
            <div className="text-xs font-bold text-[#FCD116]">
              {ticket.serviceType}
            </div>
          </div>

          {/* Live Queue Counter Progress */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#12151e] border border-white/10 space-y-3">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-xs">
              <span className="text-gray-400 font-medium">Now Serving at Counters:</span>
              <span className="font-mono font-bold text-[#FCD116] text-xs sm:text-sm bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30 w-fit">
                {ticket.currentServingTicket}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 sm:p-3 rounded-xl bg-[#090b10] border border-white/5 text-center">
                <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest">Est. Wait</div>
                <div className="text-xs sm:text-sm font-bold text-white font-mono mt-0.5">
                  {ticket.etaMinutes === 0 ? 'Calling' : `~ ${ticket.etaMinutes}m`}
                </div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-[#090b10] border border-white/5 text-center">
                <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest">Counter</div>
                <div className="text-xs sm:text-sm font-bold text-[#FCD116] font-mono mt-0.5 truncate">
                  {ticket.assignedCounter || 'Counter 4'}
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Details Matrix */}
          <div className="space-y-2 text-xs">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between py-1.5 border-b border-white/5 gap-0.5">
              <span className="text-gray-400">Citizen Name</span>
              <span className="text-white font-semibold">{ticket.citizenName}</span>
            </div>
            <div className="flex flex-col xs:flex-row xs:items-center justify-between py-1.5 border-b border-white/5 gap-0.5">
              <span className="text-gray-400">Ghana Card PIN</span>
              <span className="text-[#FCD116] font-mono font-bold">{ticket.ghanaCardNumber}</span>
            </div>
            <div className="flex flex-col xs:flex-row xs:items-center justify-between py-1.5 border-b border-white/5 gap-0.5">
              <span className="text-gray-400">Operational Centre</span>
              <span className="text-gray-200 font-medium xs:text-right max-w-full xs:max-w-[220px] truncate">{ticket.branchName}</span>
            </div>
            <div className="flex flex-col xs:flex-row xs:items-center justify-between py-1.5 border-b border-white/5 gap-0.5">
              <span className="text-gray-400">Appointment Slot</span>
              <span className="text-gray-200 font-mono font-medium">{ticket.appointmentDate} • {ticket.timeSlot}</span>
            </div>
          </div>

          {/* Geofenced Arrival Status & Proximity Simulator */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#12151e] border border-white/10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Navigation className={`h-4 w-4 shrink-0 ${isCheckedIn ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className="text-xs font-bold text-white">Geofenced Check-In (&lt; 1.0 km)</span>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                isCheckedIn
                  ? 'bg-[#006B3F] text-white border border-emerald-500/40'
                  : 'bg-amber-500/15 text-[#FCD116] border border-amber-500/30'
              }`}>
                {isCheckedIn ? '✓ Activated' : 'En Route (> 1km)'}
              </span>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              {isCheckedIn
                ? 'You are within the 1km operational zone. Your digital queue position is active and will be called over speaker chimes.'
                : 'Turnstile check-in unlocks automatically when your GPS is detected within 1km of the agency branch.'}
            </p>

            {/* Proximity Simulation Interactive Slider */}
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400 font-medium">Simulate Proximity Distance:</span>
                <span className="font-mono font-bold text-[#FCD116]">{simulatedKm.toFixed(2)} km</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="4.0"
                step="0.1"
                value={simulatedKm}
                onChange={(e) => handleDistanceChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#090b10] rounded-lg appearance-none cursor-pointer accent-[#FCD116]"
              />
              <div className="flex justify-between text-[9px] sm:text-[10px] text-gray-400 font-mono">
                <span>0.1km</span>
                <span className="text-[#FCD116] font-bold">1.0km (Threshold)</span>
                <span>4.0km</span>
              </div>
            </div>

            {/* Manual Check-in Button */}
            {!isCheckedIn && (
              <button
                type="button"
                onClick={handleManualCheckIn}
                disabled={isProcessing}
                className="w-full py-2 px-3 rounded-lg bg-[#006B3F] hover:bg-[#005230] text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Simulate Immediate Geofence Check-in</span>
              </button>
            )}
          </div>

          {/* Ticket Management Actions (Reschedule, Cancel/Delete, Print) */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsRescheduling(true)}
              className="p-2.5 rounded-xl bg-[#12151e] hover:bg-[#181c28] border border-white/10 text-gray-200 hover:text-white text-xs font-bold flex flex-col items-center justify-center gap-1 transition"
            >
              <CalendarDays className="h-4 w-4 text-[#FCD116]" />
              <span className="text-[10px]">Reschedule</span>
            </button>

            <button
              type="button"
              onClick={handlePrintTicket}
              className="p-2.5 rounded-xl bg-[#12151e] hover:bg-[#181c28] border border-white/10 text-gray-200 hover:text-white text-xs font-bold flex flex-col items-center justify-center gap-1 transition"
            >
              <Printer className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px]">Print Pass</span>
            </button>

            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              disabled={isProcessing}
              className="p-2.5 rounded-xl bg-[#12151e] hover:bg-red-950/40 border border-white/10 hover:border-red-500/30 text-gray-200 hover:text-red-400 text-xs font-bold flex flex-col items-center justify-center gap-1 transition"
            >
              <Trash2 className="h-4 w-4 text-red-400" />
              <span className="text-[10px]">Cancel Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {isRescheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#090b10] border border-amber-500/30 shadow-2xl overflow-hidden">
            <div className="h-1.5 w-full flex">
              <div className="h-full w-1/3 bg-[#CE1126]"></div>
              <div className="h-full w-1/3 bg-[#FCD116]"></div>
              <div className="h-full w-1/3 bg-[#006B3F]"></div>
            </div>

            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FCD116] shrink-0">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Reschedule Appointment</h3>
                  <p className="text-[11px] text-gray-400">{ticket.ticketNumber} ({ticket.serviceAgency})</p>
                </div>
              </div>
              <button
                onClick={() => setIsRescheduling(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">New Appointment Date</label>
                <input
                  type="date"
                  value={newDate ?? ''}
                  min="2026-08-20"
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#FCD116]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">New Time Slot</label>
                <select
                  value={newTime ?? ''}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#FCD116]"
                >
                  <option value="08:30 AM - 09:15 AM">08:30 AM - 09:15 AM</option>
                  <option value="10:30 AM - 11:15 AM">10:30 AM - 11:15 AM</option>
                  <option value="11:45 AM - 12:30 PM">11:45 AM - 12:30 PM</option>
                  <option value="01:30 PM - 02:15 PM">01:30 PM - 02:15 PM</option>
                  <option value="02:45 PM - 03:30 PM">02:45 PM - 03:30 PM</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRescheduling(false)}
                  className="w-1/3 py-2.5 px-3 rounded-xl bg-[#12151e] hover:bg-[#181c28] text-gray-300 font-bold text-xs transition border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReschedule}
                  disabled={isProcessing}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] text-white font-bold text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Updating...' : 'Confirm Reschedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Citizen Cancel Ticket Confirmation Modal */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#090b10] border border-red-500/40 shadow-2xl overflow-hidden">
            <div className="h-1.5 w-full bg-[#CE1126]"></div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cancel Appointment Pass</h3>
                  <p className="text-xs text-gray-400">Ticket #{ticket.ticketNumber}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#12151e] border border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Service:</span>
                  <span className="text-white font-medium truncate max-w-[200px]">{ticket.serviceType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Center:</span>
                  <span className="text-gray-200">{ticket.branchName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Date & Slot:</span>
                  <span className="font-mono text-[#FCD116]">{ticket.appointmentDate} • {ticket.timeSlot}</span>
                </div>
              </div>

              <p className="text-xs text-gray-300">
                Are you sure you want to cancel your appointment? Your slot and place in the live digital queue will be released back to the municipal assembly.
              </p>

              <div className="flex items-center space-x-3 pt-1">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setIsConfirmingDelete(false)}
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-[#12151e] hover:bg-[#181c28] text-gray-300 font-semibold text-xs transition border border-white/10"
                >
                  Keep Pass
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmCancelTicket}
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] text-white font-bold text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isProcessing ? 'Cancelling...' : 'Yes, Cancel Pass'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
