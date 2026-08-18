import React from 'react';
import { X, HelpCircle, Sparkles, Command, MousePointer, Layers, Cpu } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-[#12161f] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#161c28]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-slate-200 text-sm">MeshForge AI Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 text-xs text-slate-300">
          <div className="flex flex-col gap-1.5">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5 text-sky-400" />
              <span>3D Viewport Controls</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11.5px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div>• Left-click + Drag: Orbit</div>
              <div>• Right-click + Drag: Pan</div>
              <div>• Scroll Wheel: Zoom in / out</div>
              <div>• Turntable: Toggle auto-spin</div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Local AI Engine Support</span>
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11.5px]">
              Forge automatically detects local Ollama, vLLM, and LM Studio server endpoints on your machine, enabling zero-latency offline 3D mesh generation and neural texture synthesis without sending data to external clouds.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>PBR Maps & Shader Pipeline</span>
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11.5px]">
              All 3D assets are baked with full PBR texture channels: Albedo (Base Color), Tangent Space Normal, Microfacet Roughness, Metallic Specluarity, and Blue-to-White Emission irradiance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
