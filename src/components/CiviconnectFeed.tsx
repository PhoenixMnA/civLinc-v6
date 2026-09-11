import React, { useState } from 'react';
import { 
  MapPin, 
  ThumbsUp, 
  Flame, 
  CheckCircle2, 
  Layers, 
  Trash2, 
  Wrench, 
  Stethoscope, 
  Eye, 
  Camera,
  AlertTriangle,
  Building2,
  Sparkles,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CivicIssue, IssueCategory, MunicipalAssembly } from '../types';
import { civicStore } from '../services/store';
import { HeatmapMapView } from './HeatmapMapView';
import { IncidentDetailModal } from './IncidentDetailModal';

const truncateStr = (str: string, max = 25) => {
  if (!str) return '';
  return str.length > max ? `${str.slice(0, max - 3)}...` : str;
};

interface Props {
  issues: CivicIssue[];
  assemblies: MunicipalAssembly[];
  onOpenNewReport: () => void;
  onOpenResolutionProof: (issue: CivicIssue) => void;
  onOpenGhanaCardAuth: () => void;
}

export const CiviconnectFeed: React.FC<Props> = ({
  issues,
  assemblies,
  onOpenNewReport,
  onOpenResolutionProof,
  onOpenGhanaCardAuth
}) => {
  const currentUser = civicStore.getCurrentUser();
  const currentRole = civicStore.getCurrentRole();

  const locationMode = civicStore.getCitizenLocationMode();
  const citizenDistrictId = civicStore.getCitizenSelectedDistrictId();
  const citizenCoords = civicStore.getCitizenCoordinates();

  const [activeTab, setActiveTab] = useState<'feed' | 'heatmap' | 'solved'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<'all' | IssueCategory>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(citizenDistrictId || 'all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteIssue, setConfirmDeleteIssue] = useState<CivicIssue | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [selectedDetailIssue, setSelectedDetailIssue] = useState<CivicIssue | null>(null);

  // Sync with store location mode
  const handleToggleLocationMode = (mode: 'auto' | 'manual') => {
    civicStore.setCitizenLocationMode(mode);
    if (mode === 'auto') {
      setIsDetectingGps(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const detected = civicStore.setCitizenCoordinates({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
            if (detected) {
              setSelectedDistrict(detected.id);
            }
            setIsDetectingGps(false);
          },
          () => {
            // Default to AMA on fallback
            const fallback = civicStore.setCitizenCoordinates({ lat: 5.55602, lng: -0.20124 });
            if (fallback) setSelectedDistrict(fallback.id);
            setIsDetectingGps(false);
          },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
      } else {
        const fallback = civicStore.setCitizenCoordinates({ lat: 5.55602, lng: -0.20124 });
        if (fallback) setSelectedDistrict(fallback.id);
        setIsDetectingGps(false);
      }
    }
  };

  const handleManualDistrictSelect = (districtId: string) => {
    setSelectedDistrict(districtId);
    civicStore.setCitizenSelectedDistrictId(districtId);
  };

  const handleUpvote = (e: React.MouseEvent, issue: CivicIssue) => {
    e.stopPropagation();
    const citizenId = currentUser?.idNumber || 'anonymous-user';
    const isFirstTime = !issue.upvoterIds.includes(citizenId);

    if (isFirstTime) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { x, y },
        colors: ['#CE1126', '#FCD116', '#006B3F', '#ffffff']
      });
    }

    civicStore.upvoteIssue(issue.id);
  };

  const handleDeleteIssueClick = (e: React.MouseEvent, issue: CivicIssue) => {
    e.stopPropagation();
    setConfirmDeleteIssue(issue);
  };

  const handleConfirmDeleteIssue = async () => {
    if (!confirmDeleteIssue) return;
    const issueId = confirmDeleteIssue.id;
    setDeletingId(issueId);
    await civicStore.deleteIssue(issueId);
    setDeletingId(null);
    setConfirmDeleteIssue(null);
  };

  const filteredIssues = issues.filter((issue) => {
    if (activeTab === 'solved' && issue.status !== 'resolved') return false;
    if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;
    if (selectedDistrict !== 'all' && issue.districtId !== selectedDistrict) return false;
    return true;
  });

  const urgentCount = issues.filter((i) => i.priority === 'urgent' && i.status !== 'resolved').length;
  const solvedCount = issues.filter((i) => i.status === 'resolved').length;

  return (
    <div className="space-y-3 sm:space-y-4 w-full max-w-full">
      {/* Top Banner with Ghanaian Flag Theme */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-[#090b10] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Tricolor accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="h-full w-1/3 bg-[#CE1126]"></div>
          <div className="h-full w-1/3 bg-[#FCD116]"></div>
          <div className="h-full w-1/3 bg-[#006B3F]"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#CE1126]/15 text-[#CE1126] border border-[#CE1126]/30 flex items-center gap-1">
                <span>★</span> Civiconnect Feed
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold tracking-tight text-white">
              Civic Infrastructure Tracker
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={onOpenNewReport}
              className="w-full md:w-auto py-2 px-4 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] active:scale-[0.98] text-white text-xs font-bold transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>+ Snap Issue</span>
            </button>
          </div>
        </div>

        {/* Highlights Pill Bar (Miller's Law: 3 items) */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-[#CE1126] font-bold bg-[#CE1126]/10 px-2 py-0.5 rounded-lg border border-[#CE1126]/30 text-[10px] sm:text-[11px]">
            <Flame className="h-3 w-3 animate-pulse shrink-0" />
            <span>{urgentCount} Urgent</span>
          </div>
          <div className="flex items-center gap-1 text-[#006B3F] font-bold bg-[#006B3F]/10 px-2 py-0.5 rounded-lg border border-emerald-500/30 text-[10px] sm:text-[11px]">
            <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="text-emerald-400">{solvedCount} Solved</span>
          </div>
          <div className="text-gray-400 ml-auto hidden md:block text-[11px]">
            Quorum: <span className="text-[#FCD116] font-mono font-bold">20+ Upvotes = Fast-track</span>
          </div>
        </div>
      </div>

      {/* Main View Navigation (Feed vs Heatmap vs Solved Gallery) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#090b10] p-1.5 rounded-xl border border-white/10 w-full">
        <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'feed'
                ? 'bg-[#CE1126] text-white shadow-md shadow-red-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Feed ({issues.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'heatmap'
                ? 'bg-[#FCD116] text-black shadow-md shadow-amber-400/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Heatmap</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('solved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'solved'
                ? 'bg-[#006B3F] text-white shadow-md shadow-emerald-700/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            <span>Solved ({solvedCount})</span>
          </button>
        </div>

        {/* District Selector with Auto-Detect vs Manual Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
          {/* Location Mode Toggle Pills */}
          <div className="flex items-center bg-[#12151e] p-0.5 rounded-lg border border-white/10 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => handleToggleLocationMode('auto')}
              className={`px-2 py-1 rounded transition flex items-center gap-1 ${
                locationMode === 'auto'
                  ? 'bg-[#006B3F] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MapPin className={`h-3 w-3 ${isDetectingGps ? 'animate-bounce text-[#FCD116]' : ''}`} />
              <span>{isDetectingGps ? 'GPS...' : 'GPS Auto'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleToggleLocationMode('manual')}
              className={`px-2 py-1 rounded transition flex items-center gap-1 ${
                locationMode === 'manual'
                  ? 'bg-[#CE1126] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Building2 className="h-3 w-3" />
              <span>Manual</span>
            </button>
          </div>

          {/* District Dropdown Selector (Active or Manual override) */}
          <select
            value={selectedDistrict ?? 'all'}
            onChange={(e) => handleManualDistrictSelect(e.target.value)}
            disabled={locationMode === 'auto' && isDetectingGps}
            className={`w-full sm:w-auto px-2.5 py-1 text-xs bg-[#12151e] border rounded-lg text-gray-200 focus:outline-none transition ${
              locationMode === 'auto'
                ? 'border-emerald-500/40 text-emerald-300'
                : 'border-white/10 focus:border-[#FCD116]'
            }`}
          >
            <option value="all">All Districts ({assemblies.length})</option>
            {assemblies.map((asm) => (
              <option key={asm.id} value={asm.id}>
                {asm.code} - {truncateStr(asm.name, 22)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Filter Buttons */}
      {activeTab !== 'heatmap' && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 custom-scrollbar w-full">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#181c28] text-[#FCD116] border border-[#FCD116]/40 shadow-sm'
                : 'bg-[#090b10] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            All Categories
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('environmental')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              selectedCategory === 'environmental'
                ? 'bg-[#006B3F]/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-[#090b10] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Environmental
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('infrastructural')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              selectedCategory === 'infrastructural'
                ? 'bg-[#FCD116]/15 text-[#FCD116] border border-[#FCD116]/40'
                : 'bg-[#090b10] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            Infrastructural
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('medical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              selectedCategory === 'medical'
                ? 'bg-[#CE1126]/15 text-red-400 border border-red-500/40'
                : 'bg-[#090b10] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Medical
          </button>
        </div>
      )}

      {/* Content Rendering based on Tab */}
      {activeTab === 'heatmap' ? (
        <HeatmapMapView
          issues={issues}
          onSelectIssue={(issue) => {
            if (issue.status === 'resolved') {
              onOpenResolutionProof(issue);
            }
          }}
          onOpenNewReport={onOpenNewReport}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full">
          {filteredIssues.length === 0 ? (
            <div className="col-span-full p-8 sm:p-12 text-center rounded-2xl bg-[#090b10] border border-white/5">
              <Building2 className="h-10 w-10 text-gray-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-gray-300">No civic reports found in this filter</h4>
              <p className="text-xs text-gray-500 mt-1">Be the first to report an incident in this area.</p>
              <button
                type="button"
                onClick={onOpenNewReport}
                className="mt-4 px-4 py-2 bg-[#CE1126] hover:bg-[#b00f20] text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-600/30"
              >
                + Snap New Incident
              </button>
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const citizenId = currentUser?.idNumber || 'anonymous-user';
              const hasVoted = issue.upvoterIds.includes(citizenId);
              const isUrgent = issue.priority === 'urgent';
              const isResolved = issue.status === 'resolved';

              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedDetailIssue(issue)}
                  className={`flex flex-col justify-between rounded-xl bg-[#0e1118] border transition-all overflow-hidden shadow-lg hover:border-white/20 group w-full cursor-pointer hover:shadow-2xl active:scale-[0.99] ${
                    isUrgent
                      ? 'border-red-500/40 shadow-[0_0_20px_rgba(206,17,38,0.15)]'
                      : isResolved
                      ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(0,107,63,0.12)]'
                      : 'border-white/10'
                  }`}
                >
                  {/* Photo with Overlay Badges */}
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-[#050608]">
                    <img
                      src={issue.imageUrl}
                      alt={issue.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient shade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e1118] via-transparent to-black/60"></div>

                    {/* Top badging */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
                      <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md truncate max-w-[130px] ${
                        issue.category === 'environmental'
                          ? 'bg-[#006B3F]/30 text-emerald-300 border border-emerald-500/40'
                          : issue.category === 'infrastructural'
                          ? 'bg-[#FCD116]/25 text-[#FCD116] border border-[#FCD116]/40'
                          : 'bg-[#CE1126]/30 text-red-300 border border-[#CE1126]/40'
                      }`}>
                        {truncateStr(issue.subcategory, 16)}
                      </span>

                      {/* Status / Urgency pill */}
                      {isResolved ? (
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#006B3F] text-white border border-emerald-400/40 flex items-center gap-1 shadow-sm shrink-0">
                          <CheckCircle2 className="h-3 w-3 text-[#FCD116]" /> Solved
                        </span>
                      ) : isUrgent ? (
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#CE1126] text-white border border-red-500/50 flex items-center gap-1 shadow-sm animate-pulse shrink-0">
                          <Flame className="h-3 w-3 text-[#FCD116]" /> Urgent ({issue.upvotes})
                        </span>
                      ) : (
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/50 text-gray-300 border border-white/10 backdrop-blur-md shrink-0">
                          {issue.status === 'in_progress' ? '🚧 Dispatched' : '⏳ Triaged'}
                        </span>
                      )}
                    </div>

                    {/* District location stamp at bottom of image */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-xs text-white">
                      <span className="font-semibold flex items-center gap-1 truncate max-w-[180px] text-[11px]">
                        <MapPin className="h-3.5 w-3.5 text-[#FCD116] shrink-0" />
                        {truncateStr(issue.districtName, 22)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">
                        {new Date(issue.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1 group-hover:text-[#FCD116] transition-colors">
                        {truncateStr(issue.title, 40)}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {issue.description}
                      </p>

                      <div className="pt-0.5 text-[10px] text-gray-400 flex items-center gap-1 truncate">
                        <span>📍 {truncateStr(issue.address, 24)}</span>
                        {issue.landmark && <span>• {truncateStr(issue.landmark, 18)}</span>}
                      </div>
                    </div>

                    {/* Author & Verification strip */}
                    <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center space-x-1 truncate">
                        <span className="text-gray-300 font-medium truncate text-[11px]">{truncateStr(issue.authorName, 18)}</span>
                        <span className="text-[9px] text-gray-500 font-mono shrink-0">({issue.authorGhanaCardMasked})</span>
                      </div>

                      {issue.assignedDepartment && (
                        <span className="text-[10px] text-[#FCD116] font-medium truncate max-w-[120px] text-right">
                          {truncateStr(issue.assignedDepartment, 18)}
                        </span>
                      )}
                    </div>

                    {/* Action Bar (Full vertical stack on mobile, horizontal on sm) */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                      {/* Community Upvote Button */}
                      <button
                        type="button"
                        onClick={(e) => handleUpvote(e, issue)}
                        className={`w-full sm:w-auto py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
                          hasVoted
                            ? 'bg-[#CE1126] text-white shadow-md shadow-red-600/30'
                            : 'bg-[#12151e] hover:bg-[#181c28] text-gray-300 border border-white/10'
                        }`}
                      >
                        <ThumbsUp className={`h-3.5 w-3.5 ${hasVoted ? 'fill-white' : ''}`} />
                        <span className="truncate">
                          {hasVoted ? 'Ampa (Upvoted)' : 'I See This Too!'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                          hasVoted ? 'bg-black/30 text-white' : 'bg-white/10 text-gray-300'
                        }`}>
                          {issue.upvotes}
                        </span>
                      </button>

                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        {/* Resolution Proof Button */}
                        {isResolved && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenResolutionProof(issue);
                            }}
                            className="flex-1 sm:flex-none py-2 px-3 rounded-lg bg-[#006B3F] hover:bg-[#005230] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#FCD116]" />
                            <span>View Proof</span>
                          </button>
                        )}

                        {/* Delete Button (Citizen Author or Admin) */}
                        {(currentRole !== 'citizen' || issue.authorName === currentUser?.fullName) && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteIssueClick(e, issue)}
                            disabled={deletingId === issue.id}
                            title="Delete Report from Live DB"
                            className="p-2 rounded-lg bg-[#181c28] hover:bg-red-950/40 text-gray-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition text-xs flex items-center justify-center shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Incident Detail Overlay Modal */}
      <IncidentDetailModal
        issue={selectedDetailIssue}
        isOpen={!!selectedDetailIssue}
        onClose={() => setSelectedDetailIssue(null)}
        onOpenResolutionProof={onOpenResolutionProof}
      />

      {/* In-App Delete Issue Confirmation Modal */}
      {confirmDeleteIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-[#090b10] border border-red-500/40 shadow-2xl overflow-hidden">
            <div className="h-1.5 w-full bg-[#CE1126]"></div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Delete Incident Report</h3>
                  <p className="text-xs text-gray-400">Purge report from community live feed</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#12151e] border border-white/10 space-y-1.5 text-xs">
                <div className="text-white font-bold">{confirmDeleteIssue.title}</div>
                <div className="text-gray-400 line-clamp-2">{confirmDeleteIssue.description}</div>
                <div className="text-gray-500 text-[11px] pt-1">📍 {confirmDeleteIssue.address}</div>
              </div>

              <p className="text-xs text-red-300/90 bg-red-950/30 p-3 rounded-xl border border-red-500/20">
                Are you sure you want to permanently delete this civic incident report from the live database?
              </p>

              <div className="flex items-center space-x-3 pt-1">
                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={() => setConfirmDeleteIssue(null)}
                  className="w-1/3 py-2.5 px-4 rounded-xl bg-[#12151e] hover:bg-[#181c28] text-gray-300 font-semibold text-xs transition border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={handleConfirmDeleteIssue}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] text-white font-bold text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{deletingId ? 'Deleting...' : 'Yes, Delete Report'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
