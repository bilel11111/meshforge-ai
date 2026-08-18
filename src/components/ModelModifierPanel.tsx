import React, { useState, useRef } from 'react';
import { 
  Sliders, 
  UploadCloud, 
  Wand2, 
  Sparkles, 
  RotateCw, 
  Layers, 
  Activity, 
  RefreshCw, 
  Check, 
  FileBox, 
  Cpu, 
  Zap
} from 'lucide-react';
import { MeshModifierOperation, PBRMaterialSettings } from '../types';
import { ModelStats } from '../lib/threeUtils';

interface ModelModifierPanelProps {
  onFileUpload: (file: File) => Promise<void>;
  onApplyAIModifier: (prompt: string) => Promise<void>;
  onApplyGeometricModifier: (op: MeshModifierOperation) => void;
  onUpdateMaterial: (settings: Partial<PBRMaterialSettings>) => void;
  materialSettings: PBRMaterialSettings;
  stats: ModelStats | null;
  isModifying: boolean;
  onResetModel: () => void;
}

export const ModelModifierPanel: React.FC<ModelModifierPanelProps> = ({
  onFileUpload,
  onApplyAIModifier,
  onApplyGeometricModifier,
  onUpdateMaterial,
  materialSettings,
  stats,
  isModifying,
  onResetModel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modifierPrompt, setModifierPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'ai' | 'geometry' | 'material'>('ai');

  // Geometric modifier parameters
  const [twistIntensity, setTwistIntensity] = useState(0.5);
  const [taperIntensity, setTaperIntensity] = useState(0.4);
  const [bendIntensity, setBendIntensity] = useState(0.3);
  const [noiseIntensity, setNoiseIntensity] = useState(0.2);
  const [spherifyIntensity, setSpherifyIntensity] = useState(0.3);
  const [spikeIntensity, setSpikeIntensity] = useState(0.4);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await onFileUpload(e.target.files[0]);
    }
  };

  const quickModifierSuggestions = [
    'Add cyberpunk neon armor plates and glowing thrusters',
    'Weather with cracked ancient stone texture and erosion',
    'Deform into aerodynamic organic sci-fi vehicle',
    'Add crystalline energy spikes protruding from surface',
    'Smooth high-poly bevels and metallic gold inlays',
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900/90 text-slate-200 overflow-y-auto border-r border-slate-800/80 p-4 sm:p-5">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-white">3D Model Changer & Updater</h2>
            <p className="text-[11px] text-slate-400">Modify, deform, and enhance 3D geometry</p>
          </div>
        </div>
        <button
          id="btn-reset-mesh"
          onClick={onResetModel}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Reset Model"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Upload 3D File Section */}
      <div className="mt-4">
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Import Existing 3D Model
        </label>
        <div
          id="dropzone-3d-upload"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950/60 rounded-xl p-4 text-center cursor-pointer transition-all hover:bg-slate-950 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf,.obj,.stl"
            onChange={handleFileChange}
            className="hidden"
          />
          <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 mx-auto mb-1 transition-colors" />
          <p className="text-xs font-medium text-slate-300 group-hover:text-white">
            Drop .GLB, .OBJ, or .STL file here
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">or click to browse from device</p>
        </div>
      </div>

      {/* Tabs for Modifier Modes */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 mt-4">
        <button
          id="tab-ai-modifier"
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ai'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>AI Changer</span>
        </button>
        <button
          id="tab-geometry-modifier"
          onClick={() => setActiveTab('geometry')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'geometry'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Geometry FX</span>
        </button>
        <button
          id="tab-material-modifier"
          onClick={() => setActiveTab('material')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'material'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>PBR Shading</span>
        </button>
      </div>

      {/* TAB 1: AI Prompt Changer */}
      {activeTab === 'ai' && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Natural Language Model Modification</span>
              <span className="text-[10px] text-indigo-400 font-mono">Agentic Modifier</span>
            </label>
            <textarea
              id="input-modifier-prompt"
              rows={3}
              value={modifierPrompt}
              onChange={(e) => setModifierPrompt(e.target.value)}
              placeholder="e.g. Add aggressive cyber spikes, taper top by 20%, and give it emissive blue glow..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Quick Modifier suggestions */}
          <div className="space-y-1.5">
            <div className="text-[11px] text-slate-400 font-medium">Quick Modifier Ideas:</div>
            {quickModifierSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setModifierPrompt(suggestion)}
                className="w-full text-left text-[11px] p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{suggestion}</span>
              </button>
            ))}
          </div>

          <button
            id="btn-apply-ai-modification"
            disabled={isModifying || !modifierPrompt.trim()}
            onClick={() => onApplyAIModifier(modifierPrompt)}
            className="w-full py-3 px-4 rounded-xl font-semibold text-xs tracking-wide bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isModifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Applying AI 3D Modifications...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Apply AI 3D Changer</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB 2: Interactive Geometry FX Deformers */}
      {activeTab === 'geometry' && (
        <div className="mt-4 space-y-4 text-xs">
          {/* Twist Deformer */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Twist Vortex</span>
              <span className="font-mono text-cyan-400">{twistIntensity.toFixed(2)}x</span>
            </div>
            <input
              id="slider-twist"
              type="range"
              min="-1.5"
              max="1.5"
              step="0.05"
              value={twistIntensity}
              onChange={(e) => setTwistIntensity(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <button
              onClick={() => onApplyGeometricModifier({ type: 'twist', intensity: twistIntensity, axis: 'y' })}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-xs transition-colors"
            >
              Apply Twist
            </button>
          </div>

          {/* Taper Deformer */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Taper Scale</span>
              <span className="font-mono text-cyan-400">{taperIntensity.toFixed(2)}x</span>
            </div>
            <input
              id="slider-taper"
              type="range"
              min="-1.0"
              max="1.5"
              step="0.05"
              value={taperIntensity}
              onChange={(e) => setTaperIntensity(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <button
              onClick={() => onApplyGeometricModifier({ type: 'taper', intensity: taperIntensity, axis: 'y' })}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-xs transition-colors"
            >
              Apply Taper
            </button>
          </div>

          {/* Bend Deformer */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Bend Curvature</span>
              <span className="font-mono text-cyan-400">{bendIntensity.toFixed(2)}x</span>
            </div>
            <input
              id="slider-bend"
              type="range"
              min="-1.0"
              max="1.0"
              step="0.05"
              value={bendIntensity}
              onChange={(e) => setBendIntensity(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <button
              onClick={() => onApplyGeometricModifier({ type: 'bend', intensity: bendIntensity, axis: 'x' })}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-xs transition-colors"
            >
              Apply Bend
            </button>
          </div>

          {/* Surface Noise Displacer */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Procedural Surface Noise</span>
              <span className="font-mono text-cyan-400">{noiseIntensity.toFixed(2)}x</span>
            </div>
            <input
              id="slider-noise"
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={noiseIntensity}
              onChange={(e) => setNoiseIntensity(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <button
              onClick={() => onApplyGeometricModifier({ type: 'noise', intensity: noiseIntensity, axis: 'y' })}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-xs transition-colors"
            >
              Displace Noise
            </button>
          </div>

          {/* Extrude Spikes */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Extrude Spikes</span>
              <span className="font-mono text-cyan-400">{spikeIntensity.toFixed(2)}x</span>
            </div>
            <input
              id="slider-spikes"
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={spikeIntensity}
              onChange={(e) => setSpikeIntensity(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <button
              onClick={() => onApplyGeometricModifier({ type: 'extrude-spikes', intensity: spikeIntensity, axis: 'y' })}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-xs transition-colors"
            >
              Extrude Spikes
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PBR Material Editor */}
      {activeTab === 'material' && (
        <div className="mt-4 space-y-4 text-xs">
          {/* Base Color */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Base Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={materialSettings.color}
                onChange={(e) => onUpdateMaterial({ color: e.target.value })}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={materialSettings.color}
                onChange={(e) => onUpdateMaterial({ color: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Roughness */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-300 font-semibold">Roughness</span>
              <span className="font-mono text-slate-400">{materialSettings.roughness.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={materialSettings.roughness}
              onChange={(e) => onUpdateMaterial({ roughness: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Metalness */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-300 font-semibold">Metalness</span>
              <span className="font-mono text-slate-400">{materialSettings.metalness.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={materialSettings.metalness}
              onChange={(e) => onUpdateMaterial({ metalness: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Emissive Glow */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Emissive Glow Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={materialSettings.emissive}
                onChange={(e) => onUpdateMaterial({ emissive: e.target.value })}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={materialSettings.emissive}
                onChange={(e) => onUpdateMaterial({ emissive: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Emissive Intensity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-300 font-semibold">Glow Intensity</span>
              <span className="font-mono text-slate-400">{materialSettings.emissiveIntensity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={materialSettings.emissiveIntensity}
              onChange={(e) => onUpdateMaterial({ emissiveIntensity: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
