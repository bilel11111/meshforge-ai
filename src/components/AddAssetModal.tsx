import React, { useRef } from 'react';
import { X, Upload, Box, Plus, Sparkles, FolderPlus } from 'lucide-react';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (file: File) => void;
  onAddSubMesh: (type: string) => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onFileUpload,
  onAddSubMesh,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#12161f] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#161c28]">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-slate-200 text-sm">Add 3D Asset or Sub-Mesh</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Option 1: File Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-all text-center"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".glb,.gltf,.obj,.stl"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-slate-200">Import 3D Model File</div>
            <div className="text-[11px] text-slate-400">Supports .GLB, .GLTF, .OBJ, .STL</div>
          </div>

          {/* Option 2: Quick Sub-Components */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Add Parametric Sub-Component
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onAddSubMesh('Sensor Array Pod');
                  onClose();
                }}
                className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left flex items-center gap-2.5 transition-colors"
              >
                <Box className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-medium text-slate-200">Sensor Array Pod</div>
                  <div className="text-[10px] text-slate-400">Optical sensor gimbal</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onAddSubMesh('Auxiliary Thruster');
                  onClose();
                }}
                className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left flex items-center gap-2.5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-medium text-slate-200">Auxiliary Thruster</div>
                  <div className="text-[10px] text-slate-400">Vector exhaust nozzle</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
