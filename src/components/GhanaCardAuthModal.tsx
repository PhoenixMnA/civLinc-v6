import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Scan, 
  CheckCircle2, 
  X, 
  CreditCard, 
  Fingerprint, 
  AlertCircle, 
  UserCheck,
  Lock,
  Phone,
  UserPlus,
  LogIn,
  MapPin,
  Calendar
} from 'lucide-react';
import { civicStore } from '../services/store';
import { sounds } from '../services/soundEffects';
import { formatGhanaCard, formatGhanaPhone, formatGhanaPostGps } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const GhanaCardAuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'nfc'>('login');
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('GHA-728190342-1');
  const [loginPin, setLoginPin] = useState('1234');
  
  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regIdNumber, setRegIdNumber] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDigitalAddress, setRegDigitalAddress] = useState('');
  const [regDistrict, setRegDistrict] = useState('Accra Metropolitan Assembly (AMA)');
  const [regGender, setRegGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [regPin, setRegPin] = useState('1234');

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setIsScanning(true);
    setErrorMsg('');
    setScanStep('Initializing Optical MRZ Scanner...');
    sounds.playScannerBeep();

    setTimeout(() => {
      setScanStep('Reading National Identification Authority (NIA) Biometric Hash...');
      sounds.playScannerBeep();
    }, 800);

    setTimeout(() => {
      setScanStep('Validating Digital Address (GhanaPostGPS: GA-183-9023)...');
      sounds.playScannerBeep();
    }, 1600);

    setTimeout(async () => {
      setIsScanning(false);
      setScanStep('Ghana Card Successfully Verified!');
      sounds.playSuccessTone();

      await civicStore.loginCitizenWithApi('GHA-728190342-1', '1234');

      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 700);
    }, 2400);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg('Please enter your Ghana Card ID (e.g. GHA-728190342-1) or Phone.');
      return;
    }

    setIsLoading(true);
    const result = await civicStore.loginCitizenWithApi(loginIdentifier.trim(), loginPin);
    setIsLoading(false);

    if (result.success) {
      setSuccessMsg('Authenticated with National Identity Authority!');
      if (onSuccess) onSuccess();
      setTimeout(() => onClose(), 600);
    } else {
      setErrorMsg(result.error || 'Authentication failed. Please check your credentials.');
      sounds.playSecurityAlert();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regFullName.trim() || !regIdNumber.trim() || !regPhone.trim()) {
      setErrorMsg('Full Name, Ghana Card ID, and Phone are required.');
      return;
    }

    setIsLoading(true);
    const result = await civicStore.registerCitizenWithApi({
      fullName: regFullName.trim(),
      idNumber: regIdNumber.trim().toUpperCase(),
      phone: regPhone.trim(),
      digitalAddress: regDigitalAddress.trim() || 'GA-100-2026',
      district: regDistrict,
      gender: regGender,
      pin: regPin || '1234'
    });
    setIsLoading(false);

    if (result.success) {
      setSuccessMsg('Citizen profile registered and verified!');
      if (onSuccess) onSuccess();
      setTimeout(() => onClose(), 600);
    } else {
      setErrorMsg(result.error || 'Registration failed.');
      sounds.playSecurityAlert();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-[#090b10] border border-amber-500/20 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Ghana Flag Header Ribbon */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-[#CE1126]"></div>
          <div className="h-full w-1/3 bg-[#FCD116]"></div>
          <div className="h-full w-1/3 bg-[#006B3F]"></div>
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#CE1126] via-[#FCD116] to-[#006B3F] p-[2px] shadow-lg shrink-0">
              <div className="h-full w-full bg-[#090b10] rounded-[10px] flex items-center justify-center">
                <span className="text-base text-[#FCD116] leading-none">★</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">Ghana Card Citizen Portal</h3>
              <p className="text-[11px] text-gray-400">National Identification Authority (NIA) Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 p-2 bg-[#12151e] border-b border-white/5 gap-1 text-center">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-[#CE1126] text-white shadow-md shadow-red-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-[#CE1126] text-white shadow-md shadow-red-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Register</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nfc')}
            className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'nfc'
                ? 'bg-[#006B3F] text-white shadow-md shadow-emerald-700/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Fingerprint className="h-3.5 w-3.5 text-[#FCD116]" />
            <span>NFC Tap</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1 uppercase tracking-wider">
                  Ghana Card PIN or Phone
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginIdentifier ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.toUpperCase().startsWith('GHA') || /^[0-9]/.test(val)) {
                        setLoginIdentifier(formatGhanaCard(val));
                      } else {
                        setLoginIdentifier(val);
                      }
                    }}
                    placeholder="GHA-728190342-1"
                    className="w-full px-3 py-2.5 pl-9 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-[#FCD116]"
                  />
                  <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1 uppercase tracking-wider">
                  Citizen PIN / Passcode
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPin ?? ''}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="Enter 4-digit PIN (default: 1234)"
                    className="w-full px-3 py-2.5 pl-9 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#FCD116]"
                  />
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] active:scale-[0.98] text-white font-bold text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>{isLoading ? 'Verifying Identity...' : 'Sign In with Ghana Card'}</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginIdentifier('GHA-728190342-1');
                    setLoginPin('1234');
                  }}
                  className="text-[11px] text-[#FCD116] hover:underline"
                >
                  Fill Sample Citizen (Kwame Mensah)
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={regFullName ?? ''}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Abena Serwaa Manso"
                  className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FCD116]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Ghana Card ID</label>
                  <input
                    type="text"
                    required
                    value={regIdNumber ?? ''}
                    onChange={(e) => setRegIdNumber(formatGhanaCard(e.target.value))}
                    placeholder="GHA-982103841-2"
                    maxLength={16}
                    className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-[#FCD116]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={regPhone ?? ''}
                    onChange={(e) => setRegPhone(formatGhanaPhone(e.target.value))}
                    placeholder="+233 24 555 1234"
                    maxLength={16}
                    className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FCD116] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Digital Address (GPS)</label>
                  <input
                    type="text"
                    value={regDigitalAddress ?? ''}
                    onChange={(e) => setRegDigitalAddress(formatGhanaPostGps(e.target.value))}
                    placeholder="GA-183-9023"
                    maxLength={12}
                    className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-[#FCD116]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Gender</label>
                  <select
                    value={regGender ?? 'MALE'}
                    onChange={(e) => setRegGender(e.target.value as 'MALE' | 'FEMALE')}
                    className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FCD116]"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Set Citizen 4-Digit PIN</label>
                <input
                  type="password"
                  value={regPin ?? ''}
                  onChange={(e) => setRegPin(e.target.value)}
                  placeholder="1234"
                  className="w-full px-3 py-2 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#FCD116]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#006B3F] hover:bg-[#005230] active:scale-[0.98] text-white font-bold text-xs transition shadow-lg shadow-emerald-800/30 flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>{isLoading ? 'Registering with NIA...' : 'Create Verified Citizen Account'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: NFC BIOMETRIC SCANNER */}
          {activeTab === 'nfc' && (
            <div className="relative rounded-2xl bg-[#12151e] border border-white/5 p-4 text-center overflow-hidden">
              {isScanning ? (
                <div className="py-6 space-y-3">
                  <div className="relative mx-auto h-20 w-32 rounded-xl border-2 border-dashed border-[#FCD116] flex items-center justify-center bg-amber-950/20">
                    <div className="absolute inset-x-0 h-1 bg-[#FCD116] shadow-[0_0_15px_rgba(252,209,22,1)] animate-bounce"></div>
                    <Scan className="h-8 w-8 text-[#FCD116] animate-pulse" />
                  </div>
                  <div className="text-xs font-mono text-[#FCD116] font-semibold">{scanStep}</div>
                  <div className="text-[10px] text-gray-500">National Biometric Identity Match</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-white/5">
                    <span className="flex items-center gap-1 font-mono text-[#FCD116] text-[11px]">
                      <Lock className="h-3 w-3" /> NIA TOKEN: 256-BIT
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#006B3F] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      ONLINE
                    </span>
                  </div>

                  <div className="py-2 flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-[#006B3F]/20 border border-emerald-500/40 flex items-center justify-center mb-2">
                      <CreditCard className="h-6 w-6 text-[#FCD116]" />
                    </div>
                    <div className="text-xs font-bold text-white">Direct NFC / Optical Biometric Reader</div>
                    <p className="text-[11px] text-gray-400 mt-0.5 max-w-xs mx-auto">
                      Simulate scanning the physical Ghana Card contactless smart-chip.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#006B3F] hover:bg-[#005230] text-white font-bold text-xs shadow-lg shadow-emerald-800/30 transition flex items-center justify-center gap-2"
                  >
                    <Fingerprint className="h-4 w-4 text-[#FCD116] shrink-0" />
                    <span>Simulate NFC Biometric Tap</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
