import React, { useState } from 'react';
import {
  Shield,
  Building2,
  Lock,
  KeyRound,
  UserCheck,
  Smartphone,
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Fingerprint,
  MapPin,
  HelpCircle,
  Terminal,
  Radio,
  ArrowLeft
} from 'lucide-react';
import { civicStore } from '../services/store';
import { MunicipalAssembly } from '../types';
import { formatGhanaCard, formatGhanaPhone, formatGhanaPostGps } from '../utils/formatters';

interface Props {
  onAuthenticated: () => void;
  assemblies: MunicipalAssembly[];
}

export const LandingAuthView: React.FC<Props> = ({ onAuthenticated, assemblies }) => {
  // Primary Portal vs Stealth Gatekeeper Mode
  const [isStealthGatekeeper, setIsStealthGatekeeper] = useState(false);

  // Active Tab in Primary Portal
  const [activeTab, setActiveTab] = useState<'citizen' | 'staff'>('citizen');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Citizen form state
  const [citizenIdentifier, setCitizenIdentifier] = useState('');
  const [citizenPin, setCitizenPin] = useState('');
  const [citizenFullName, setCitizenFullName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenDigitalAddress, setCitizenDigitalAddress] = useState('');
  const [citizenDistrict, setCitizenDistrict] = useState(assemblies[0]?.name || 'Accra Metropolitan Assembly (AMA)');

  // Municipal Admin form state
  const [municipalId, setMunicipalId] = useState('');
  const [municipalPassword, setMunicipalPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Stealth Gatekeeper State
  const [stealthPasskey, setStealthPasskey] = useState('');
  const [stealthTargetRole, setStealthTargetRole] = useState<'municipal_admin' | 'super_admin'>('municipal_admin');
  const [stealthSelectedDistrictId, setStealthSelectedDistrictId] = useState(assemblies[0]?.id || 'asm-ama-01');

  // Status & loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick preset loader helper
  const handleQuickDemoCitizen = async (name: string, idNum: string, phone: string, district: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await civicStore.loginCitizenWithApi(idNum, '1234');
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage(`Welcome, ${res.user?.fullName || name}!`);
      setTimeout(() => onAuthenticated(), 400);
    } else {
      setErrorMessage(res.error || 'Authentication error');
    }
  };

  const handleQuickMunicipalLogin = (code: string, pass: string) => {
    setMunicipalId(code);
    setMunicipalPassword(pass);
    setErrorMessage(null);
  };

  // Submit Citizen Login
  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isRegisterMode) {
      if (!citizenIdentifier || !citizenFullName || !citizenPhone) {
        setErrorMessage('Please fill in your Ghana Card ID, Full Legal Name, and Phone Number.');
        return;
      }
      setIsLoading(true);
      const res = await civicStore.registerCitizenWithApi({
        idNumber: citizenIdentifier.toUpperCase().trim(),
        fullName: citizenFullName.trim(),
        phone: citizenPhone.trim(),
        digitalAddress: citizenDigitalAddress.trim() || 'GA-100-2026',
        district: citizenDistrict,
        pin: citizenPin || '1234'
      });
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage('Ghana Card verified! Profile registered successfully.');
        setTimeout(() => onAuthenticated(), 500);
      } else {
        setErrorMessage(res.error || 'Registration failed');
      }
    } else {
      if (!citizenIdentifier.trim()) {
        setErrorMessage('Please enter your Ghana Card Number (GHA-...) or Phone Number.');
        return;
      }
      setIsLoading(true);
      const res = await civicStore.loginCitizenWithApi(citizenIdentifier.trim(), citizenPin || '1234');
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage(`Authenticated as ${res.user?.fullName}!`);
        setTimeout(() => onAuthenticated(), 400);
      } else {
        setErrorMessage(res.error || 'Invalid credentials');
      }
    }
  };

  // Submit Municipal Admin Login
  const handleMunicipalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!municipalId.trim() || !municipalPassword.trim()) {
      setErrorMessage('Please enter your Municipal ID / Code and Password.');
      return;
    }

    setIsLoading(true);
    const res = await civicStore.loginMunicipalAdminWithApi(municipalId.trim(), municipalPassword.trim());
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(`Authenticated for ${res.assembly?.name || municipalId.toUpperCase()}!`);
      setTimeout(() => onAuthenticated(), 450);
    } else {
      setErrorMessage(res.error || 'Invalid Municipal credentials');
    }
  };

  // Submit Stealth Gatekeeper
  const handleStealthGatekeeperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!stealthPasskey.trim()) {
      setErrorMessage('Please enter the Ghost Door stealth security passkey.');
      return;
    }

    setIsLoading(true);
    const res = await civicStore.unlockGhostDoorGatekeeper(
      stealthPasskey.trim(),
      stealthTargetRole,
      stealthSelectedDistrictId
    );
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(`Stealth Gatekeeper Verified: ${stealthTargetRole === 'super_admin' ? 'Jubilee House Root' : 'Municipal Dispatcher'} Authorized!`);
      setTimeout(() => onAuthenticated(), 450);
    } else {
      setErrorMessage(res.error || 'Stealth Authorization Failed: Invalid security passcode.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col justify-center items-center p-3 sm:p-6 relative overflow-hidden">
      {/* Background Ghanaian Tricolor Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-xl z-10 space-y-4 sm:space-y-6 my-auto">
        {/* National Flag Header Bar */}
        <div className="text-center space-y-2">
          {/* Flag Tricolor with Black Star */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0e1118] border border-white/10 shadow-lg">
            <div className="flex h-3 w-8 rounded-sm overflow-hidden border border-black/40">
              <div className="w-1/3 bg-[#CE1126]" />
              <div className="w-1/3 bg-[#FCD116] flex items-center justify-center">
                <span className="text-[6px] text-black font-black leading-none">★</span>
              </div>
              <div className="w-1/3 bg-[#006B3F]" />
            </div>
            <span className="text-[11px] font-bold tracking-wider text-gray-300 uppercase">
              Republic of Ghana • Gov.gh Central Auth
            </span>
          </div>

          <h1 id="landing-auth-title" className="text-2xl sm:text-3xl font-black tracking-tight flex items-center justify-center">
            <span className="text-[#CE1126]">Civ</span>
            <span className="text-[#FCD116]">Linc</span>
            <span className="text-[#009E49] ml-2">GH</span>
          </h1>
        </div>

        {/* Tab Selection (Rendered when in Primary Central Portal Mode) */}
        {!isStealthGatekeeper && (
          <div className="bg-[#0e1118] p-1.5 rounded-2xl border border-white/10 flex items-center gap-1 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('citizen');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 sm:py-3 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === 'citizen'
                  ? 'bg-[#CE1126] text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserCheck className="h-4 w-4 shrink-0" />
              <span className="truncate">Citizen Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('staff');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 sm:py-3 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === 'staff'
                  ? 'bg-[#FCD116] text-black shadow-lg shadow-amber-400/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">Municipal Staff</span>
            </button>
          </div>
        )}

        {/* Card Body */}
        {isStealthGatekeeper ? (
          /* VIEW 1: STEALTH GHOST DOOR GATEKEEPER VIEW */
          <div className="bg-[#090b10] border border-amber-500/30 rounded-2xl p-5 sm:p-7 shadow-[0_0_40px_rgba(252,209,22,0.15)] space-y-5 relative">
            {/* Header with Back button */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FCD116]">
                  <Terminal className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span>Ghost Door Gatekeeper</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold uppercase">
                      Stealth Terminal
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400">Secure National MMDA Dispatch Protocol</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsStealthGatekeeper(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 hover:text-white border border-white/10 transition flex items-center gap-1.5 shrink-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Central Login</span>
              </button>
            </div>

            {/* Protocol Notice Box */}
            <div className="p-3 rounded-xl bg-[#12151e] border border-white/5 text-xs text-gray-300 space-y-1.5">
              <div className="flex items-center justify-between text-amber-400 font-mono text-[11px] font-bold">
                <span className="flex items-center gap-1">
                  <Terminal className="h-3.5 w-3.5" /> SECURE DISPATCH PROTOCOL
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Radio className="h-3 w-3 animate-pulse" /> GEOFENCED
                </span>
              </div>
            </div>

            {/* Error / Success feedback */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleStealthGatekeeperSubmit} className="space-y-4">
              {/* Role Choice */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Authorization Target Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStealthTargetRole('municipal_admin')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 text-center ${
                      stealthTargetRole === 'municipal_admin'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm'
                        : 'bg-[#12151e] border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>Municipal Engineer</span>
                    <span className="text-[10px] font-normal text-gray-400">MMDA Dispatch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStealthTargetRole('super_admin')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 text-center ${
                      stealthTargetRole === 'super_admin'
                        ? 'bg-red-600/15 border-red-600/40 text-red-400 shadow-sm'
                        : 'bg-[#12151e] border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>Super Administrator</span>
                    <span className="text-[10px] font-normal text-gray-400">Jubilee House Root</span>
                  </button>
                </div>
              </div>

              {/* District Selection if Municipal Admin */}
              {stealthTargetRole === 'municipal_admin' && (
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                    Assigned Municipal Assembly (MMDA)
                  </label>
                  <select
                    value={stealthSelectedDistrictId}
                    onChange={(e) => setStealthSelectedDistrictId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#12151e] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                  >
                    {assemblies.map((asm) => (
                      <option key={asm.id} value={asm.id}>
                        {asm.code} — {asm.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Passcode input */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Stealth Authorization Passkey
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3 text-amber-400" />
                  <input
                    type="password"
                    value={stealthPasskey}
                    onChange={(e) => setStealthPasskey(e.target.value)}
                    placeholder="Enter security key or passcode"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#12151e] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Quick Presets for Demo */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Stealth Demo Passkey Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setStealthPasskey('AMA-ADMIN-PASS');
                      setStealthTargetRole('municipal_admin');
                      setStealthSelectedDistrictId('asm-ama-01');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#12151e] hover:bg-white/10 text-[11px] font-mono text-amber-300 border border-white/5 transition"
                  >
                    AMA-ADMIN-PASS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStealthPasskey('KMA-ADMIN-PASS');
                      setStealthTargetRole('municipal_admin');
                      setStealthSelectedDistrictId('asm-kma-04');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#12151e] hover:bg-white/10 text-[11px] font-mono text-amber-300 border border-white/5 transition"
                  >
                    KMA-ADMIN-PASS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStealthPasskey('GHOST-DOOR-ROOT');
                      setStealthTargetRole('super_admin');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#12151e] hover:bg-white/10 text-[11px] font-mono text-red-400 border border-white/5 transition"
                  >
                    GHOST-DOOR-ROOT
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#FCD116] hover:bg-[#e0b80d] active:scale-[0.99] text-black text-xs font-black transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="animate-pulse">Authorizing Stealth Dispatch Access...</span>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Unlock Ghost Door Terminal</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* VIEW 2: PRIMARY UNIFIED CENTRAL PORTAL LOGIN (DEFAULT) */
          <div className="bg-[#090b10] border border-white/10 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5 relative">
            {/* Messages */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

          {/* TAB 1: CITIZEN PORTAL */}
          {activeTab === 'citizen' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {isRegisterMode ? 'New Ghana Card Citizen Registration' : 'Ghana Card Biometric Login'}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setErrorMessage(null);
                  }}
                  className="text-xs text-[#FCD116] hover:underline font-semibold shrink-0"
                >
                  {isRegisterMode ? 'Have an account? Login' : '+ Sign Up'}
                </button>
              </div>

              <form onSubmit={handleCitizenSubmit} className="space-y-3.5">
                {isRegisterMode && (
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Full Legal Name (as on Ghana Card)
                    </label>
                    <input
                      type="text"
                      value={citizenFullName}
                      onChange={(e) => setCitizenFullName(e.target.value)}
                      placeholder="e.g. Kwame Mensah"
                      required
                      className="w-full px-3.5 py-2.5 bg-[#12151e] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#CE1126]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Ghana Card ID Number (or Phone Number)
                  </label>
                  <div className="relative">
                    <CreditCard className="h-4 w-4 absolute left-3.5 top-3 text-gray-500" />
                    <input
                      type="text"
                      value={citizenIdentifier}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (isRegisterMode || val.toUpperCase().startsWith('GHA') || /^[0-9]/.test(val)) {
                          setCitizenIdentifier(formatGhanaCard(val));
                        } else {
                          setCitizenIdentifier(val);
                        }
                      }}
                      placeholder="GHA-728190342-1"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#12151e] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#CE1126] font-mono"
                    />
                  </div>
                </div>

                {isRegisterMode && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">Phone Number</label>
                      <div className="relative">
                        <Smartphone className="h-4 w-4 absolute left-3.5 top-3 text-gray-500" />
                        <input
                          type="tel"
                          value={citizenPhone}
                          onChange={(e) => setCitizenPhone(formatGhanaPhone(e.target.value))}
                          placeholder="+233 24 412 8901"
                          maxLength={16}
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 bg-[#12151e] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#CE1126] font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">Digital Address (GPS)</label>
                      <div className="relative">
                        <MapPin className="h-4 w-4 absolute left-3.5 top-3 text-gray-500" />
                        <input
                          type="text"
                          value={citizenDigitalAddress}
                          onChange={(e) => setCitizenDigitalAddress(formatGhanaPostGps(e.target.value))}
                          placeholder="e.g. GA-183-9023"
                          maxLength={12}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-[#12151e] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#CE1126] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isRegisterMode && (
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">Home Municipal District</label>
                    <select
                      value={citizenDistrict}
                      onChange={(e) => setCitizenDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#12151e] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#CE1126]"
                    >
                      {assemblies.map((asm) => (
                        <option key={asm.id} value={asm.name}>
                          {asm.code} - {asm.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    4-Digit Security PIN / Password
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3.5 top-3 text-gray-500" />
                    <input
                      type="password"
                      maxLength={8}
                      value={citizenPin}
                      onChange={(e) => setCitizenPin(e.target.value)}
                      placeholder="Default: 1234"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#12151e] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#CE1126]"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 block">Default demo pin is 1234</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] active:scale-[0.99] text-white text-xs font-extrabold transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Authenticating with NIA Database...</span>
                  ) : (
                    <>
                      <Fingerprint className="h-4 w-4" />
                      <span>{isRegisterMode ? 'Complete Registration & Enter' : 'Authenticate Ghana Card'}</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Preset Accounts for Defense Presentation */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                  Quick 1-Tap Citizen Demo Profiles:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDemoCitizen(
                        'Kwame Mensah',
                        'GHA-728190342-1',
                        '+233 24 412 8901',
                        'Accra Metropolitan Assembly (AMA)'
                      )
                    }
                    className="p-2.5 rounded-xl bg-[#12151e] hover:bg-[#181d2a] border border-white/5 text-left transition"
                  >
                    <div className="text-xs font-bold text-gray-200">Kwame Mensah</div>
                    <div className="text-[10px] text-gray-400">GHA-728190342-1 (AMA)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDemoCitizen(
                        'Efua Sutherland',
                        'GHA-849102934-9',
                        '+233 50 123 4567',
                        'Korle Klottey (KoKMA)'
                      )
                    }
                    className="p-2.5 rounded-xl bg-[#12151e] hover:bg-[#181d2a] border border-white/5 text-left transition"
                  >
                    <div className="text-xs font-bold text-gray-200">Efua Sutherland</div>
                    <div className="text-[10px] text-gray-400">GHA-849102934-9 (KoKMA)</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MUNICIPAL ASSEMBLY STAFF LOGIN */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-extrabold text-white">
                  Municipal Assembly Staff
                </h3>
              </div>

              <form onSubmit={handleMunicipalSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Municipal ID / Assembly Code (or Admin Email)
                  </label>
                  <div className="relative">
                    <Building2 className="h-4 w-4 absolute left-3.5 top-3 text-gray-500" />
                    <input
                      type="text"
                      value={municipalId}
                      onChange={(e) => setMunicipalId(e.target.value)}
                      placeholder="e.g. AMA, KoKMA, KMA, or AWMA"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#12151e] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FCD116]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Municipal Security Password
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3.5 top-3 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={municipalPassword}
                      onChange={(e) => setMunicipalPassword(e.target.value)}
                      placeholder="Enter municipal password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-[#12151e] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FCD116]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#FCD116] hover:bg-[#e0b80d] active:scale-[0.99] text-black text-xs font-black transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Validating Assembly Credentials...</span>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>Authenticate as Municipal Admin</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Assembly Quick-Fill Buttons */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                  Quick Municipal Demo Fill (Defense Testing):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickMunicipalLogin('AMA', 'AmaAdmin2026!')}
                    className="p-2 rounded-lg bg-[#12151e] hover:bg-[#181d2a] border border-white/5 text-left text-[11px]"
                  >
                    <div className="font-bold text-[#FCD116]">AMA (Accra)</div>
                    <div className="text-[9px] text-gray-400">AmaAdmin2026!</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickMunicipalLogin('KoKMA', 'KokmaAdmin2026!')}
                    className="p-2 rounded-lg bg-[#12151e] hover:bg-[#181d2a] border border-white/5 text-left text-[11px]"
                  >
                    <div className="font-bold text-[#FCD116]">KoKMA (Klottey)</div>
                    <div className="text-[9px] text-gray-400">KokmaAdmin2026!</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickMunicipalLogin('KMA', 'KmaAdmin2026!')}
                    className="p-2 rounded-lg bg-[#12151e] hover:bg-[#181d2a] border border-white/5 text-left text-[11px]"
                  >
                    <div className="font-bold text-[#FCD116]">KMA (Kumasi)</div>
                    <div className="text-[9px] text-gray-400">KmaAdmin2026!</div>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

        {/* Footer info */}
        <div className="text-center text-[11px] text-gray-500 space-y-1">
          <div>Powered by CivicLink Ghana Architecture • Ministry of Local Government & NIA</div>
        </div>
      </div>
    </div>
  );
};
