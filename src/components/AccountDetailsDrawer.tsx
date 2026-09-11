import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Phone, 
  MapPin, 
  Building2, 
  LogOut, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Shield, 
  Edit3,
  CheckCircle2,
  User,
  Sparkles,
  Save
} from 'lucide-react';
import { GhanaCardProfile, UserRole } from '../types';
import { civicStore } from '../services/store';
import { sounds } from '../services/soundEffects';
import { formatGhanaCard, formatGhanaPostGps, formatGhanaPhone } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: GhanaCardProfile | null;
  currentRole: UserRole;
  theme: 'dark' | 'light';
  onToggleTheme: (theme: 'dark' | 'light') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onLogout: () => void;
}

export const AccountDetailsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  currentRole,
  theme,
  onToggleTheme,
  isMuted,
  onToggleMute,
  onLogout
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Editable fields local state
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.fullName || 'Kwame Mensah');

  const [isEditingIdNumber, setIsEditingIdNumber] = useState(false);
  const [idNumber, setIdNumber] = useState(currentUser?.idNumber || 'GHA-728190342-1');

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phone, setPhone] = useState(currentUser?.phone || '+233 24 412 8901');

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [digitalAddress, setDigitalAddress] = useState(currentUser?.digitalAddress || 'GA-183-9023');

  const [isEditingDistrict, setIsEditingDistrict] = useState(false);
  const [district, setDistrict] = useState(currentUser?.district || 'Accra Metropolitan Assembly (AMA)');

  // Sync state when currentUser updates
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || 'Kwame Mensah');
      setIdNumber(currentUser.idNumber || 'GHA-728190342-1');
      setPhone(currentUser.phone || '+233 24 412 8901');
      setDigitalAddress(currentUser.digitalAddress || 'GA-183-9023');
      setDistrict(currentUser.district || 'Accra Metropolitan Assembly (AMA)');
    } else {
      setFullName('Kwame Mensah');
      setIdNumber('GHA-728190342-1');
      setPhone('+233 24 412 8901');
      setDigitalAddress('GA-183-9023');
      setDistrict('Accra Metropolitan Assembly (AMA)');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    sounds.playVotePop();
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Save changes to global store
  const handleSaveField = (field: 'name' | 'id' | 'phone' | 'address' | 'district') => {
    const updates: Partial<GhanaCardProfile> = {};
    if (field === 'name') {
      updates.fullName = fullName.trim() || 'Anonymous Citizen';
      setIsEditingName(false);
    } else if (field === 'id') {
      updates.idNumber = idNumber.trim() || 'GHA-728190342-1';
      setIsEditingIdNumber(false);
    } else if (field === 'phone') {
      updates.phone = phone.trim() || '+233 24 412 8901';
      setIsEditingPhone(false);
    } else if (field === 'address') {
      updates.digitalAddress = digitalAddress.trim() || 'GA-183-9023';
      setIsEditingAddress(false);
    } else if (field === 'district') {
      updates.district = district.trim() || 'Accra Metropolitan Assembly (AMA)';
      setIsEditingDistrict(false);
    }

    civicStore.updateCurrentUser(updates);
    sounds.playSuccessTone();
  };

  const roleLabel = 
    currentRole === 'super_admin' 
      ? 'National Root Super Admin' 
      : currentRole === 'municipal_admin' 
      ? 'Municipal MMDA Staff' 
      : 'Verified Citizen (NIA)';

  const roleBadgeColor = 
    currentRole === 'super_admin' 
      ? 'bg-[#006B3F]/20 text-emerald-400 border-emerald-500/40' 
      : currentRole === 'municipal_admin' 
      ? 'bg-[#CE1126]/20 text-red-400 border-[#CE1126]/40' 
      : 'bg-[#FCD116]/15 text-[#FCD116] border-[#FCD116]/30';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fadeIn"
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-md bg-[#090b10] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)] h-full flex flex-col z-10 animate-slideLeft overflow-y-auto custom-scrollbar">
        {/* Ghana Flag Tricolor Accent Bar */}
        <div className="h-1.5 w-full flex shrink-0">
          <div className="h-full w-1/3 bg-[#CE1126]"></div>
          <div className="h-full w-1/3 bg-[#FCD116]"></div>
          <div className="h-full w-1/3 bg-[#006B3F]"></div>
        </div>

        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0a0d14]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-[#FCD116]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Account & Credentials
              </h2>
              <p className="text-[10px] text-gray-400 font-mono">
                National Identity Authority Verified Profile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#12151e] hover:bg-white/10 text-gray-400 hover:text-white transition border border-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-4 sm:p-5 space-y-5 flex-1">
          {/* Section 1: Citizen Profile Details Card */}
          <div className="rounded-2xl bg-[#0e1118] border border-white/10 p-4 space-y-4 shadow-xl">
            {/* User Avatar & Editable Full Username */}
            <div className="flex items-start space-x-3.5 pb-3 border-b border-white/5">
              <div className="relative h-14 w-14 rounded-2xl border-2 border-[#FCD116]/60 overflow-hidden bg-gradient-to-tr from-[#CE1126] to-[#006B3F] p-0.5 shrink-0 shadow-lg shadow-amber-500/20">
                {currentUser?.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={fullName}
                    className="h-full w-full object-cover rounded-[13px]"
                  />
                ) : (
                  <div className="h-full w-full rounded-[13px] bg-[#090b10] flex items-center justify-center text-base font-extrabold text-[#FCD116]">
                    {fullName ? fullName.slice(0, 2).toUpperCase() : 'GH'}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#090b10] flex items-center justify-center text-white text-[8px]">
                  ✓
                </div>
              </div>

              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      value={fullName ?? ''}
                      onChange={(e) => setFullName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveField('name')}
                      placeholder="Enter Full Username"
                      autoFocus
                      className="w-full text-xs sm:text-sm font-bold bg-[#12151e] border border-amber-500/50 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:ring-1 focus:ring-[#FCD116]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveField('name')}
                      className="p-1.5 bg-[#006B3F] hover:bg-[#005230] text-white rounded-lg transition shrink-0"
                      title="Save Name"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingName(true)}
                    className="group/name cursor-pointer flex items-center justify-between gap-1 hover:bg-white/5 p-1 rounded-lg transition"
                    title="Click to edit full username"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 font-medium block">Full Username</span>
                      <h3 className="text-sm sm:text-base font-extrabold text-white truncate group-hover/name:text-[#FCD116] transition-colors">
                        {fullName}
                      </h3>
                    </div>
                    <Edit3 className="h-3.5 w-3.5 text-gray-400 opacity-60 group-hover/name:opacity-100 group-hover/name:text-[#FCD116] shrink-0" />
                  </div>
                )}

                <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${roleBadgeColor}`}>
                  {roleLabel}
                </span>
              </div>
            </div>

            {/* Profile Interactive Fields List */}
            <div className="space-y-2.5 text-xs">
              {/* 1. Ghana Card Number (Mandatory + Masked Input) */}
              <div className="p-2.5 rounded-xl bg-[#12151e] border border-white/5 flex items-center justify-between group transition hover:border-amber-500/30">
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <CreditCard className="h-4 w-4 text-[#FCD116] shrink-0" />
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-[10px] text-gray-400 font-bold block flex items-center gap-1">
                      <span>Ghana Card Identity</span>
                      <span className="text-[9px] text-[#FCD116] font-normal font-mono">(GHA-XXXXXXXXX-X)</span>
                    </span>

                    {isEditingIdNumber ? (
                      <div className="flex items-center space-x-1.5 mt-1">
                        <input
                          type="text"
                          value={idNumber ?? ''}
                          onChange={(e) => setIdNumber(formatGhanaCard(e.target.value))}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveField('id')}
                          placeholder="GHA-728190342-1"
                          maxLength={16}
                          autoFocus
                          className="w-full text-xs font-mono font-bold bg-[#090b10] border border-amber-500/50 rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-[#FCD116]"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveField('id')}
                          className="p-1 bg-[#006B3F] hover:bg-[#005230] text-white rounded-lg transition"
                          title="Save Ghana Card"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setIsEditingIdNumber(true)}
                        className="cursor-pointer flex items-center justify-between gap-1 group/field"
                        title="Click to edit Ghana Card Number"
                      >
                        <span className="text-xs font-mono font-bold text-white truncate block group-hover/field:text-[#FCD116]">
                          {idNumber}
                        </span>
                        <Edit3 className="h-3 w-3 text-gray-400 opacity-50 group-hover/field:opacity-100 group-hover/field:text-[#FCD116]" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleCopy(idNumber, 'ghanaCard', e)}
                  title="Copy Ghana Card"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition shrink-0 ml-1"
                >
                  {copiedField === 'ghanaCard' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* 2. Phone Number (Mandatory + Masked Input) */}
              <div className="p-2.5 rounded-xl bg-[#12151e] border border-white/5 flex items-center justify-between group transition hover:border-amber-500/30">
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-[10px] text-gray-400 font-bold block flex items-center gap-1">
                      <span>Primary Phone Contact</span>
                      <span className="text-[9px] text-emerald-400 font-normal font-mono">(+233 XX XXX XXXX)</span>
                    </span>

                    {isEditingPhone ? (
                      <div className="flex items-center space-x-1.5 mt-1">
                        <input
                          type="tel"
                          value={phone ?? ''}
                          onChange={(e) => setPhone(formatGhanaPhone(e.target.value))}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveField('phone')}
                          placeholder="+233 24 412 8901"
                          maxLength={16}
                          autoFocus
                          className="w-full text-xs font-mono font-bold bg-[#090b10] border border-emerald-500/50 rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveField('phone')}
                          className="p-1 bg-[#006B3F] hover:bg-[#005230] text-white rounded-lg transition"
                          title="Save Phone"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setIsEditingPhone(true)}
                        className="cursor-pointer flex items-center justify-between gap-1 group/field"
                        title="Click to edit Phone Number"
                      >
                        <span className="text-xs font-mono font-bold text-white truncate block group-hover/field:text-emerald-300">
                          {phone}
                        </span>
                        <Edit3 className="h-3 w-3 text-gray-400 opacity-50 group-hover/field:opacity-100 group-hover/field:text-emerald-400" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleCopy(phone, 'phone', e)}
                  title="Copy Phone Number"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition shrink-0 ml-1"
                >
                  {copiedField === 'phone' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* 3. GhanaPost GPS Digital Address (Masked Input) */}
              <div className="p-2.5 rounded-xl bg-[#12151e] border border-white/5 flex items-center justify-between group transition hover:border-amber-500/30">
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <MapPin className="h-4 w-4 text-red-400 shrink-0" />
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-[10px] text-gray-400 font-bold block flex items-center gap-1">
                      <span>GhanaPost GPS Digital Address</span>
                      <span className="text-[9px] text-red-400 font-normal font-mono">(XX-XXX-XXXX)</span>
                    </span>

                    {isEditingAddress ? (
                      <div className="flex items-center space-x-1.5 mt-1">
                        <input
                          type="text"
                          value={digitalAddress ?? ''}
                          onChange={(e) => setDigitalAddress(formatGhanaPostGps(e.target.value))}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveField('address')}
                          placeholder="GA-183-9023"
                          maxLength={12}
                          autoFocus
                          className="w-full text-xs font-mono font-bold bg-[#090b10] border border-red-500/50 rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-red-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveField('address')}
                          className="p-1 bg-[#006B3F] hover:bg-[#005230] text-white rounded-lg transition"
                          title="Save Address"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setIsEditingAddress(true)}
                        className="cursor-pointer flex items-center justify-between gap-1 group/field"
                        title="Click to edit Digital Address"
                      >
                        <span className="text-xs font-mono font-bold text-white truncate block group-hover/field:text-red-300">
                          {digitalAddress}
                        </span>
                        <Edit3 className="h-3 w-3 text-gray-400 opacity-50 group-hover/field:opacity-100 group-hover/field:text-red-400" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleCopy(digitalAddress, 'address', e)}
                  title="Copy Digital Address"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition shrink-0 ml-1"
                >
                  {copiedField === 'address' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* 4. Registered MMDA District Assembly (Interactive) */}
              <div className="p-2.5 rounded-xl bg-[#12151e] border border-white/5 flex items-center justify-between group transition hover:border-amber-500/30">
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <Building2 className="h-4 w-4 text-[#FCD116] shrink-0" />
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-[10px] text-gray-400 font-bold block">Assigned MMDA Jurisdiction</span>

                    {isEditingDistrict ? (
                      <div className="flex items-center space-x-1.5 mt-1">
                        <input
                          type="text"
                          value={district ?? ''}
                          onChange={(e) => setDistrict(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveField('district')}
                          placeholder="Accra Metropolitan Assembly (AMA)"
                          autoFocus
                          className="w-full text-xs font-semibold bg-[#090b10] border border-amber-500/50 rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-[#FCD116]"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveField('district')}
                          className="p-1 bg-[#006B3F] hover:bg-[#005230] text-white rounded-lg transition"
                          title="Save District"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setIsEditingDistrict(true)}
                        className="cursor-pointer flex items-center justify-between gap-1 group/field"
                        title="Click to edit MMDA Jurisdiction"
                      >
                        <span className="text-xs font-semibold text-gray-200 truncate block group-hover/field:text-[#FCD116]">
                          {district}
                        </span>
                        <Edit3 className="h-3 w-3 text-gray-400 opacity-50 group-hover/field:opacity-100 group-hover/field:text-[#FCD116]" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleCopy(district, 'district', e)}
                  title="Copy MMDA Jurisdiction"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition shrink-0 ml-1"
                >
                  {copiedField === 'district' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Prominent Logout Action Button */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-red-600/15 hover:bg-[#CE1126] text-red-400 hover:text-white border border-red-500/30 hover:border-red-600 transition-all font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 group"
            >
              <LogOut className="h-4 w-4 text-red-400 group-hover:text-white transition-colors" />
              <span>Sign Out & End Authenticated Session</span>
            </button>
            <p className="text-[10px] text-gray-500 text-center">
              Terminating session locks application behind the Portal Login Screen.
            </p>
          </div>

          {/* Section 3: Settings & Appearance Controls */}
          <div className="rounded-2xl bg-[#0e1118] border border-white/10 p-4 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Settings & Preferences
              </h4>
              <span className="text-[10px] text-[#FCD116] font-mono font-bold">App v2.4</span>
            </div>

            {/* Dark / Light Mode Switcher */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-300 block">
                Interface Color Theme
              </label>

              <div className="grid grid-cols-2 gap-2 bg-[#12151e] p-1 rounded-xl border border-white/5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playVotePop();
                    onToggleTheme('dark');
                  }}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    theme === 'dark'
                      ? 'bg-[#090b10] text-[#FCD116] border border-amber-500/30 shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5 text-[#FCD116]" />
                  <span>Dark Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playVotePop();
                    onToggleTheme('light');
                  }}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    theme === 'light'
                      ? 'bg-[#FFFDF2] text-[#9E7400] border border-amber-500/40 shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5 text-[#FCD116]" />
                  <span>Light Mode</span>
                </button>
              </div>
            </div>

            {/* Audio Chime Effects Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#12151e] border border-white/5 text-xs">
              <div className="flex items-center space-x-2.5">
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-red-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-[#FCD116]" />
                )}
                <div>
                  <span className="font-bold text-gray-200 block text-[11px]">Audio Interaction Chimes</span>
                  <span className="text-[10px] text-gray-400">Scanner beeps, vote chimes, and alerts</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleMute}
                className={`px-3 py-1 rounded-lg font-bold text-[10px] transition ${
                  isMuted
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isMuted ? 'Muted' : 'Active'}
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 border-t border-white/10 bg-[#07090e] text-center text-[10px] text-gray-500">
          CivicLink Ghana • Republic of Ghana Public Service Core
        </div>
      </div>
    </div>
  );
};
