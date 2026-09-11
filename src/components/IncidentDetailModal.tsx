import React from 'react';
import {
  X,
  MapPin,
  ThumbsUp,
  Flame,
  CheckCircle2,
  Calendar,
  User,
  Building2,
  Share2,
  Eye,
  ShieldCheck,
  Clock,
  Wrench,
  AlertTriangle,
  FileCheck,
  Banknote
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CivicIssue } from '../types';
import { civicStore } from '../services/store';

interface Props {
  issue: CivicIssue | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenResolutionProof: (issue: CivicIssue) => void;
}

export const IncidentDetailModal: React.FC<Props> = ({
  issue,
  isOpen,
  onClose,
  onOpenResolutionProof
}) => {
  if (!isOpen || !issue) return null;

  const currentUser = civicStore.getCurrentUser();
  const citizenId = currentUser?.idNumber || 'anonymous-user';
  const hasVoted = issue.upvoterIds.includes(citizenId);
  const isUrgent = issue.priority === 'urgent';
  const isResolved = issue.status === 'resolved';

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasVoted) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x, y },
        colors: ['#CE1126', '#FCD116', '#006B3F', '#ffffff']
      });
    }
    civicStore.upvoteIssue(issue.id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `CivicLink Report: ${issue.title}`,
        text: `Check out this civic issue in ${issue.districtName}: ${issue.description}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${issue.title} - ${issue.districtName} (Report ID: ${issue.id})`);
      alert('Report link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-[#0b0e14] border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Tricolor Accent Header */}
        <div className="h-1.5 w-full flex shrink-0">
          <div className="h-full w-1/3 bg-[#CE1126]"></div>
          <div className="h-full w-1/3 bg-[#FCD116]"></div>
          <div className="h-full w-1/3 bg-[#006B3F]"></div>
        </div>

        {/* Modal Top Bar */}
        <div className="p-3.5 sm:p-4 bg-[#0e111a] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-gray-300">
              ID: {issue.id}
            </span>
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              issue.category === 'environmental'
                ? 'bg-[#006B3F]/25 text-emerald-300 border border-emerald-500/40'
                : issue.category === 'infrastructural'
                ? 'bg-[#FCD116]/25 text-[#FCD116] border border-[#FCD116]/40'
                : 'bg-[#CE1126]/25 text-red-300 border border-[#CE1126]/40'
            }`}>
              {issue.category} • {issue.subcategory}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition shrink-0 ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-5 flex-1">
          {/* Full-Resolution Uploaded Picture */}
          <div className="relative rounded-2xl overflow-hidden bg-[#050608] border border-white/10 shadow-2xl aspect-video max-h-72">
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

            {/* Badges on Image */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#FCD116]" />
                {issue.districtName}
              </span>

              {isResolved ? (
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#006B3F] text-white border border-emerald-400/40 flex items-center gap-1.5 shadow-lg">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#FCD116]" /> Solved & Verified
                </span>
              ) : isUrgent ? (
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#CE1126] text-white border border-red-500/50 flex items-center gap-1.5 shadow-lg animate-pulse">
                  <Flame className="h-3.5 w-3.5 text-[#FCD116]" /> Urgent ({issue.upvotes} Votes)
                </span>
              ) : (
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/60 text-gray-300 border border-white/10 backdrop-blur-md">
                  {issue.status === 'in_progress' ? '🚧 Dispatched' : '⏳ Triaged'}
                </span>
              )}
            </div>

            {/* Date Time Stamp at bottom */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gray-300">
              <span className="font-mono text-[11px]">
                Reported: {new Date(issue.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="font-mono text-[11px] text-[#FCD116]">
                GPS: {issue.coordinates.lat.toFixed(4)}, {issue.coordinates.lng.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Incident Title & Full Description */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
              {issue.title}
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-[#12151e] p-3.5 rounded-xl border border-white/5">
              {issue.description}
            </p>
          </div>

          {/* Location & Landmark Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#12151e] border border-white/5 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                <MapPin className="h-3 w-3 text-red-400" /> Street Address & Landmark
              </span>
              <p className="text-gray-200 font-semibold">{issue.address}</p>
              {issue.landmark && (
                <p className="text-gray-400 text-[11px]">Near: {issue.landmark}</p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#12151e] border border-white/5 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                <User className="h-3 w-3 text-[#FCD116]" /> Verified Citizen Reporter
              </span>
              <p className="text-gray-200 font-semibold">{issue.authorName}</p>
              <p className="text-gray-400 text-[11px] font-mono">
                Ghana Card: {issue.authorGhanaCardMasked}
              </p>
            </div>
          </div>

          {/* Municipal Resolution Tracking Details Section */}
          <div className="rounded-2xl bg-[#0e121b] border border-white/10 p-4 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-[#FCD116]" />
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Municipal Resolution Tracking
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/5 text-gray-300 font-mono">
                {issue.districtName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#12151e] border border-white/5">
                <span className="text-[10px] text-gray-400 block font-bold">Assigned Unit</span>
                <span className="font-bold text-[#FCD116] block mt-0.5 truncate">
                  {issue.assignedDepartment || 'Municipal Works & Roads Unit'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#12151e] border border-white/5">
                <span className="text-[10px] text-gray-400 block font-bold">Current State</span>
                <span className={`font-bold block mt-0.5 capitalize ${
                  isResolved ? 'text-emerald-400' : issue.status === 'in_progress' ? 'text-amber-400' : 'text-blue-400'
                }`}>
                  {issue.status.replace('_', ' ')}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#12151e] border border-white/5">
                <span className="text-[10px] text-gray-400 block font-bold">Community Backing</span>
                <span className="font-bold text-white block mt-0.5 font-mono">
                  {issue.upvotes} Verified Citizen Upvotes
                </span>
              </div>
            </div>

            {/* If Solved: Show Official Resolution Proof Details */}
            {isResolved && issue.resolutionDetails && (
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <FileCheck className="h-4 w-4 text-emerald-400" />
                    Official Resolution Certificate Issued
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    {new Date(issue.resolutionDetails.resolvedAt).toLocaleDateString('en-GB')}
                  </span>
                </div>

                <p className="text-xs text-gray-300">
                  {issue.resolutionDetails.notes}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                  <span className="text-gray-300">
                    Sign-off: <strong className="text-white">{issue.resolutionDetails.engineerName}</strong> ({issue.resolutionDetails.engineerTitle})
                  </span>
                  {issue.resolutionDetails.cost && (
                    <span className="text-[#FCD116] font-mono font-bold flex items-center gap-1">
                      <Banknote className="h-3 w-3" />
                      Cost: GH₵ {issue.resolutionDetails.cost.toLocaleString()}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenResolutionProof(issue);
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-[#006B3F] hover:bg-[#005230] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-md"
                >
                  <Eye className="h-3.5 w-3.5 text-[#FCD116]" />
                  <span>Inspect Before/After High-Res Proof Photos</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-[#0e111a] border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="py-2.5 px-3.5 rounded-xl bg-[#12151e] hover:bg-[#181c28] text-gray-300 hover:text-white border border-white/10 transition text-xs font-bold flex items-center gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Share Report</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleUpvote}
              className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md ${
                hasVoted
                  ? 'bg-[#CE1126] text-white shadow-red-600/30'
                  : 'bg-[#12151e] hover:bg-[#181c28] text-[#FCD116] border border-amber-500/30'
              }`}
            >
              <ThumbsUp className={`h-4 w-4 ${hasVoted ? 'fill-white' : ''}`} />
              <span>{hasVoted ? 'Upvoted (Ampa)' : 'I See This Too!'}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-black/40 text-white font-mono ml-1">
                {issue.upvotes}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
