import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Coins, 
  UserCheck, 
  Building2, 
  SplitSquareHorizontal
} from 'lucide-react';
import { CivicIssue } from '../types';

interface Props {
  issue: CivicIssue | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ResolutionProofModal: React.FC<Props> = ({ issue, isOpen, onClose }) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  if (!isOpen || !issue || !issue.resolutionProof) return null;

  const proof = issue.resolutionProof;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090b10] border border-white/10 shadow-2xl overflow-hidden">
        {/* Ghana Flag top border */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-[#CE1126]"></div>
          <div className="h-full w-1/3 bg-[#FCD116]"></div>
          <div className="h-full w-1/3 bg-[#006B3F]"></div>
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#006B3F]/20 border border-emerald-500/40 text-emerald-400 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">Verified Resolution Proof</h3>
                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/15 text-[#FCD116] border border-amber-500/30 font-bold uppercase">
                  MMDA Certified
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400">{issue.id} • {issue.districtName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Split Before/After Image Comparison Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-red-400 font-bold uppercase tracking-wider text-[9px] sm:text-[10px] flex items-center gap-1">
                ◀ BEFORE (CITIZEN REPORT)
              </span>
              <span className="text-gray-400 font-mono text-[10px] sm:text-[11px]">
                Drag divider ↔
              </span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[9px] sm:text-[10px] flex items-center gap-1">
                AFTER (OFFICIAL FIX) ▶
              </span>
            </div>

            <div className="relative h-56 sm:h-72 w-full rounded-xl overflow-hidden border border-white/10 select-none bg-[#050608]">
              {/* After Image (Full background) */}
              <img
                src={proof.afterImageUrl}
                alt="After Fix"
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Before Image (Clipped by slider position) */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={issue.imageUrl}
                  alt="Before Report"
                  className="absolute inset-y-0 left-0 h-full w-full max-w-none object-cover"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Slider Divider Bar */}
              <div
                className="absolute inset-y-0 w-1 bg-[#FCD116] shadow-[0_0_15px_rgba(252,209,22,0.8)] cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="h-7 w-7 sm:h-8 sm:w-8 -ml-3 sm:-ml-3.5 rounded-full bg-[#090b10] border-2 border-[#FCD116] shadow-xl flex items-center justify-center text-[#FCD116] text-[10px] font-bold">
                  ↔
                </div>
              </div>

              {/* Interactive Range Input overlay */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition ?? 50}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />
            </div>
          </div>

          {/* Issue & Resolution Scope */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#12151e] border border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#FCD116]">
              Engineering Work Scope & Materials Ledger
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {proof.workDetails}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-2.5 rounded-lg bg-[#090b10] border border-white/5">
                <div className="text-[9px] text-gray-400 uppercase tracking-widest">Sign-Off Engineer</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">{proof.engineerName}</div>
                <div className="text-[10px] text-gray-400 truncate">{proof.engineerTitle}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090b10] border border-white/5">
                <div className="text-[9px] text-gray-400 uppercase tracking-widest">Materials Cost</div>
                <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                  GH₵ {proof.materialsCostGHS.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-gray-400">Public Audit Ledger</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090b10] border border-white/5">
                <div className="text-[9px] text-gray-400 uppercase tracking-widest">Official Stamp</div>
                <div className="text-xs font-mono font-bold text-[#FCD116] mt-0.5 truncate">
                  {proof.officialStampId}
                </div>
                <div className="text-[10px] text-gray-400">
                  {new Date(proof.resolvedAt).toLocaleDateString('en-GB')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#090b10] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">Cryptographically sealed under National Auditor General Guidelines</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-2 px-4 rounded-xl bg-[#006B3F] hover:bg-[#005230] text-white font-bold text-xs shadow-lg transition text-center"
          >
            Close Proof
          </button>
        </div>
      </div>
    </div>
  );
};
