import React from 'react';
import { X, Download, ZoomIn, Layers } from 'lucide-react';

interface MapInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageUrl: string;
}

export const MapInspectorModal: React.FC<MapInspectorModalProps> = ({
  isOpen,
  onClose,
  title,
  imageUrl,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${title.replace(/[\s\(\)]+/g, '_')}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#12161f] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#161c28]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-slate-200 text-sm">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save PNG</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Texture Viewer */}
        <div className="p-6 flex flex-col items-center justify-center bg-[#0d1017]">
          <div className="relative max-w-md w-full aspect-square rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl bg-checkerboard">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-contain"
            />
          </div>
          <p className="mt-3 text-slate-400 text-xs font-mono">
            Direct Tangent UV Surface Shader Channel (2048 × 2048 RGBA)
          </p>
        </div>
      </div>
    </div>
  );
};
