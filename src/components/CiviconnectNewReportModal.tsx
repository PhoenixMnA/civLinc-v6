import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Camera, 
  MapPin, 
  ShieldCheck, 
  EyeOff, 
  AlertCircle, 
  Sparkles,
  Trash2,
  Wrench,
  Stethoscope,
  Building2,
  Compass,
  Search,
  CheckCircle2,
  Navigation,
  Image as ImageIcon,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { IssueCategory, IssueSubcategory, MunicipalAssembly } from '../types';
import { civicStore } from '../services/store';
import { sounds } from '../services/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORY_SUBCATEGORIES: Record<IssueCategory, IssueSubcategory[]> = {
  environmental: ['Open Gutters & Choked Drains', 'Illegal Waste Dump & Silt', 'Sewage Overflow', 'Public Sanitation'],
  infrastructural: ['Severe Road Pothole & Erosion', 'Non-functioning Street Lights', 'Broken Culvert / Bridge', 'Dangerous Electrical Pole'],
  medical: ['Hospital Clinic Queue Jam', 'Emergency Oxygen / Supply Stockout', 'Ambulance Bay Obstruction', 'Health Centre Infrastructure']
};

const truncateStr = (str: string, max = 25) => {
  return str.length > max ? `${str.slice(0, max - 3)}...` : str;
};

export const CiviconnectNewReportModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const currentUser = civicStore.getCurrentUser();
  const assemblies = civicStore.getAssemblies();

  // Determine user's home assembly or default to AMA Central
  const userHomeAssembly = assemblies.find(
    (a) => currentUser?.district && a.name.toLowerCase().includes(currentUser.district.toLowerCase())
  ) || assemblies[0];

  const [category, setCategory] = useState<IssueCategory>('environmental');
  const [subcategory, setSubcategory] = useState<IssueSubcategory>('Open Gutters & Choked Drains');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(userHomeAssembly.headquarters);
  const [landmark, setLandmark] = useState(`Near ${userHomeAssembly.code} Municipal Office`);
  const [latitude, setLatitude] = useState(userHomeAssembly.coordinates.lat);
  const [longitude, setLongitude] = useState(userHomeAssembly.coordinates.lng);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Native file input refs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Location Mode
  const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
  const [manualDistrictId, setManualDistrictId] = useState<string>(userHomeAssembly.id);
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsNotification, setGpsNotification] = useState<string | null>(null);

  const handleCategoryChange = (newCat: IssueCategory) => {
    setCategory(newCat);
    setSubcategory(CATEGORY_SUBCATEGORIES[newCat][0]);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Image file size must be under 10MB.');
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      setErrorMsg('');
      sounds.playVotePop();
    }
  };

  const handleAutoDetectGps = useCallback(() => {
    setIsDetectingGps(true);
    setGpsNotification('Requesting phone GPS hardware signal...');
    sounds.playScannerBeep();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy || 10);
          setLatitude(lat);
          setLongitude(lng);
          setGpsAccuracy(accuracy);

          // Update store coordinates
          civicStore.setCitizenCoordinates({ lat, lng });

          // Reverse geocoding to resolve street & area from real phone GPS
          let resolvedAddress = '';
          let locality = '';
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
              {
                headers: { 'Accept-Language': 'en' },
                signal: AbortSignal.timeout(4000)
              }
            );
            if (res.ok) {
              const data = await res.json();
              if (data && data.address) {
                const road = data.address.road || data.address.pedestrian || data.address.suburb || '';
                const cityOrTown = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state || '';
                if (road && cityOrTown) {
                  resolvedAddress = `${road}, ${cityOrTown}`;
                } else if (data.display_name) {
                  resolvedAddress = data.display_name.split(',').slice(0, 3).join(', ');
                }
                locality = data.address.suburb || data.address.neighbourhood || cityOrTown;
              }
            }
          } catch {
            // Geocode network fallback
          }

          const found = civicStore.findAssemblyByCoordinates(lat, lng);
          if (resolvedAddress) {
            setAddress(resolvedAddress);
          } else {
            setAddress(`Near ${found.headquarters}`);
          }

          if (locality) {
            setLandmark(`Near ${locality}`);
          } else {
            setLandmark(`Zone ${found.code}`);
          }

          setGpsNotification(`Phone GPS locked: ±${accuracy}m precision (${found.code})`);
          setIsDetectingGps(false);
          sounds.playQueueChime();
        },
        (err) => {
          let warn = 'Could not access phone location.';
          if (err.code === err.PERMISSION_DENIED) {
            warn = 'Location permission denied. Please allow location in browser/phone settings.';
          } else if (err.code === err.TIMEOUT) {
            warn = 'Phone GPS request timed out. Please retry with device location turned on.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            warn = 'Phone location is currently unavailable.';
          }
          setGpsNotification(warn);
          setIsDetectingGps(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0
        }
      );
    } else {
      setGpsNotification('Geolocation is not supported by your browser or device.');
      setIsDetectingGps(false);
    }
  }, [sounds]);

  useEffect(() => {
    if (isOpen && locationMode === 'auto') {
      handleAutoDetectGps();
    }
  }, [isOpen, locationMode, handleAutoDetectGps]);

  if (!isOpen) return null;

  const detectedAssembly = civicStore.findAssemblyByCoordinates(latitude, longitude) || assemblies[0];
  const activeTargetAssembly = locationMode === 'auto'
    ? detectedAssembly
    : (assemblies.find((a) => a.id === manualDistrictId) || assemblies[0]);

  const filteredAssemblies = assemblies.filter((a) => {
    if (!districtSearchQuery.trim()) return true;
    const q = districtSearchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      a.region.toLowerCase().includes(q)
    );
  });

  const handleSelectManualDistrict = (asm: MunicipalAssembly) => {
    setManualDistrictId(asm.id);
    setLatitude(asm.coordinates.lat);
    setLongitude(asm.coordinates.lng);
    setAddress(`${asm.headquarters}`);
    setLandmark(`Near ${asm.code} Office`);
    sounds.playVotePop();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please enter both title and description.');
      sounds.playSecurityAlert();
      return;
    }

    setIsSubmitting(true);
    await civicStore.createIssue({
      category,
      subcategory,
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=900&q=80',
      isAnonymous,
      coordinates: { lat: latitude, lng: longitude },
      address: address.trim() || `${activeTargetAssembly.headquarters}`,
      landmark: landmark.trim() || 'Central Junction',
      districtId: activeTargetAssembly.id
    });
    setIsSubmitting(false);

    sounds.playSuccessTone();
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#090b10] border border-white/10 shadow-2xl overflow-hidden">
        {/* Tricolor Header Bar */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-[#CE1126]"></div>
          <div className="h-full w-1/3 bg-[#FCD116]"></div>
          <div className="h-full w-1/3 bg-[#006B3F]"></div>
        </div>

        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#CE1126] text-white shrink-0 font-bold">
              ★
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Report Civic Issue</h3>
              <p className="text-[10px] text-gray-400">
                Routing to <span className="text-[#FCD116] font-bold">{activeTargetAssembly.code}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-5 space-y-3.5 max-h-[78vh] overflow-y-auto custom-scrollbar">
          {/* Category Selector (3 chunks) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1">Category</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleCategoryChange('environmental')}
                className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                  category === 'environmental'
                    ? 'bg-[#006B3F]/25 border-emerald-500 text-emerald-300'
                    : 'bg-[#12151e] border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Trash2 className="h-3 w-3 shrink-0" />
                <span className="truncate">Environment</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('infrastructural')}
                className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                  category === 'infrastructural'
                    ? 'bg-[#FCD116]/20 border-[#FCD116] text-[#FCD116]'
                    : 'bg-[#12151e] border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Wrench className="h-3 w-3 shrink-0" />
                <span className="truncate">Infra</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('medical')}
                className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                  category === 'medical'
                    ? 'bg-[#CE1126]/20 border-red-500 text-red-300'
                    : 'bg-[#12151e] border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Stethoscope className="h-3 w-3 shrink-0" />
                <span className="truncate">Health/OPD</span>
              </button>
            </div>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1">Subcategory</label>
            <select
              value={subcategory ?? ''}
              onChange={(e) => setSubcategory(e.target.value as IssueSubcategory)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FCD116]"
            >
              {CATEGORY_SUBCATEGORIES[category].map((sub, idx) => (
                <option key={idx} value={sub}>
                  {truncateStr(sub, 30)}
                </option>
              ))}
            </select>
          </div>

          {/* Title & Description */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Broken culvert causing flooding"
              value={title ?? ''}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FCD116]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1">Description</label>
            <textarea
              rows={2}
              required
              placeholder="Describe issue location & hazard details..."
              value={description ?? ''}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#FCD116]"
            />
          </div>

          {/* NATIVE CAMERA & GALLERY PHOTO UPLOADER */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1">
              Photo Evidence
            </label>

            {/* Hidden Native File Inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageFileChange}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {/* Action Buttons: Take Photo (Camera) + Upload from Gallery */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="py-2 px-3 rounded-xl bg-[#12151e] hover:bg-[#1a1e2b] border border-white/10 hover:border-amber-400/40 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Camera className="h-3.5 w-3.5 text-[#FCD116]" />
                <span>Take Photo</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="py-2 px-3 rounded-xl bg-[#12151e] hover:bg-[#1a1e2b] border border-white/10 hover:border-emerald-400/40 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>Upload Gallery</span>
              </button>
            </div>

            {/* Photo Preview or Empty Placeholder */}
            {imageUrl ? (
              <div className="relative h-32 w-full rounded-xl overflow-hidden border border-white/10 bg-[#050608]">
                <img src={imageUrl} alt="Evidence" className="h-full w-full object-cover" />
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="p-1 rounded-lg bg-black/80 text-red-400 hover:text-white border border-white/10 text-[10px]"
                    title="Remove Photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-[#FCD116]">
                  {latitude.toFixed(3)}°N, {longitude.toFixed(3)}°W
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-white/10 bg-[#090b10] text-center text-gray-400 text-[11px]">
                Tap above to snap with camera or pick from gallery
              </div>
            )}
          </div>

          {/* Location Mode (Auto GPS vs Manual) */}
          <div className="p-3 rounded-xl bg-[#12151e] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#FCD116]" /> District Routing
              </span>

              <div className="flex items-center bg-[#090b10] p-0.5 rounded-lg border border-white/10 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setLocationMode('auto');
                    sounds.playVotePop();
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition flex items-center gap-1 ${
                    locationMode === 'auto' ? 'bg-[#006B3F] text-white' : 'text-gray-400'
                  }`}
                >
                  <Navigation className="h-2.5 w-2.5" />
                  <span>GPS Auto</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLocationMode('manual');
                    sounds.playVotePop();
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition flex items-center gap-1 ${
                    locationMode === 'manual' ? 'bg-[#CE1126] text-white' : 'text-gray-400'
                  }`}
                >
                  <Building2 className="h-2.5 w-2.5" />
                  <span>Manual</span>
                </button>
              </div>
            </div>

            {locationMode === 'auto' ? (
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#090b10] border border-white/5 text-[11px]">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        isDetectingGps ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
                      }`}
                    />
                    <span className="font-bold text-emerald-400 truncate">{detectedAssembly.name}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>
                      {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°W
                    </span>
                    {gpsAccuracy && <span className="text-emerald-400/90 font-semibold">±{gpsAccuracy}m GPS</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoDetectGps}
                  disabled={isDetectingGps}
                  className="px-2.5 py-1.5 rounded bg-[#006B3F] hover:bg-[#008751] active:scale-95 text-white text-[10px] font-bold shrink-0 transition flex items-center gap-1 disabled:opacity-60"
                >
                  {isDetectingGps ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Locating...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-2.5 w-2.5" />
                      <span>Refresh GPS</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <select
                  value={manualDistrictId ?? ''}
                  onChange={(e) => {
                    const asm = assemblies.find((a) => a.id === e.target.value);
                    if (asm) handleSelectManualDistrict(asm);
                  }}
                  className="w-full px-2 py-1.5 bg-[#090b10] border border-white/10 rounded-lg text-xs text-white"
                >
                  {assemblies.map((asm) => (
                    <option key={asm.id} value={asm.id}>
                      {asm.code} - {truncateStr(asm.name, 25)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {gpsNotification && (
              <div
                className={`text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${
                  gpsNotification.includes('denied') ||
                  gpsNotification.includes('timed out') ||
                  gpsNotification.includes('unavailable')
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                }`}
              >
                <Compass className="h-3 w-3 shrink-0" />
                <span className="truncate">{gpsNotification}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                value={address ?? ''}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address"
                className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded-lg text-white text-[11px]"
              />
              <input
                type="text"
                value={landmark ?? ''}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Landmark"
                className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded-lg text-white text-[11px]"
              />
            </div>
          </div>

          {/* Anonymity Checkbox */}
          <div
            onClick={() => setIsAnonymous(!isAnonymous)}
            className="p-2.5 rounded-xl border border-white/10 bg-[#12151e] flex items-center justify-between cursor-pointer text-xs"
          >
            <div className="flex items-center space-x-2">
              {isAnonymous ? <EyeOff className="h-4 w-4 text-amber-400" /> : <ShieldCheck className="h-4 w-4 text-emerald-400" />}
              <span className="font-semibold text-white">
                {isAnonymous ? 'Post Anonymously' : `Verified Citizen: ${truncateStr(currentUser?.fullName || 'Citizen', 20)}`}
              </span>
            </div>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={() => {}}
              className="h-3.5 w-3.5 rounded text-[#CE1126]"
            />
          </div>

          {errorMsg && (
            <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit */}
          <div className="pt-1 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2 px-3 rounded-xl bg-[#12151e] text-gray-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 py-2 px-3 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#FCD116]" />
              <span>{isSubmitting ? 'Sending...' : `Submit to ${activeTargetAssembly.code}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

