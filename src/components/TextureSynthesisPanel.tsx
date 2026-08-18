import React, { useState } from 'react';
import { 
  Palette, 
  Sparkles, 
  Layers, 
  Download, 
  Check, 
  Wand2, 
  Cpu, 
  Image as ImageIcon,
  Zap
} from 'lucide-react';
import { 
  GeneratedPBRMaps, 
  generateProceduralPBR, 
  TexturePattern 
} from '../lib/textureBaker';

interface TextureSynthesisPanelProps {
  onApplyPBRMaps: (maps: GeneratedPBRMaps) => void;
  isSynthesizing: boolean;
}

export const TextureSynthesisPanel: React.FC<TextureSynthesisPanelProps> = ({
  onApplyPBRMaps,
  isSynthesizing,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<TexturePattern>('scifi-panels');
  const [baseColor, setBaseColor] = useState('#1e293b');
  const [secondaryColor, setSecondaryColor] = useState('#06b6d4');
  const [roughness, setRoughness] = useState(0.35);
  const [metalness, setMetalness] = useState(0.8);
  const [generatedMaps, setGeneratedMaps] = useState<GeneratedPBRMaps | null>(() => {
    return generateProceduralPBR('scifi-panels', '#1e293b', '#06b6d4', 0.35, 0.8);
  });

  const patterns: { id: TexturePattern; label: string; icon: string }[] = [
    { id: 'scifi-panels', label: 'Sci-Fi Plating', icon: '🤖' },
    { id: 'hex-armor', label: 'Hexagon Armor', icon: '🛡️' },
    { id: 'carbon-fiber', label: 'Carbon Fiber', icon: '🏎️' },
    { id: 'circuit-board', label: 'Cyber Circuit', icon: '⚡' },
    { id: 'brushed-metal', label: 'Brushed Steel', icon: '⚙️' },
    { id: 'cyber-grid', label: 'Neon Cyber Grid', icon: '🌐' },
    { id: 'weathered-stone', label: 'Ancient Stone', icon: '🗿' },
    { id: 'hammered-gold', label: 'Hammered Gold', icon: '👑' },
  ];

  const handleGenerate = () => {
    const maps = generateProceduralPBR(
      selectedPattern,
      baseColor,
      secondaryColor,
      roughness,
      metalness,
      512
    );
    setGeneratedMaps(maps);
    onApplyPBRMaps(maps);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 text-slate-200 overflow-y-auto border-r border-slate-800/80 p-4 sm:p-5">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-white">Texture Synthesis Studio</h2>
            <p className="text-[11px] text-slate-400">Diffusion & procedural PBR map baker</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-mono">
          512×512 PBR
        </span>
      </div>

      {/* Pattern Selector */}
      <div className="mt-4">
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Procedural Texture Architecture
        </label>
        <div className="grid grid-cols-2 gap-2">
          {patterns.map((p) => {
            const isSelected = selectedPattern === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPattern(p.id);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-pink-600/20 border-pink-500 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="text-base">{p.icon}</span>
                <span className="truncate">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Palette Controls */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
            />
            <input
              type="text"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Accent Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
            />
            <input
              type="text"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="mt-4 space-y-3 text-xs">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-300">Surface Roughness</span>
            <span className="font-mono text-slate-400">{roughness.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={roughness}
            onChange={(e) => setRoughness(parseFloat(e.target.value))}
            className="w-full accent-pink-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-300">Specular Metalness</span>
            <span className="font-mono text-slate-400">{metalness.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={metalness}
            onChange={(e) => setMetalness(parseFloat(e.target.value))}
            className="w-full accent-pink-500"
          />
        </div>
      </div>

      {/* Generate & Apply Button */}
      <button
        id="btn-bake-pbr-textures"
        onClick={handleGenerate}
        disabled={isSynthesizing}
        className="mt-4 w-full py-3 px-4 rounded-xl font-semibold text-xs tracking-wide bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Zap className="w-4 h-4" />
        <span>Bake & Apply PBR Maps to 3D Model</span>
      </button>

      {/* Generated PBR Maps Gallery */}
      {generatedMaps && (
        <div className="mt-6 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-pink-400" />
            <span>Synthesized PBR Texture Channels</span>
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {/* Albedo */}
            <div className="p-1.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <img
                src={generatedMaps.albedo}
                alt="Albedo Map"
                className="w-full aspect-square object-cover rounded-lg border border-slate-800/80 mb-1"
              />
              <span className="text-[10px] font-mono text-slate-400">Albedo / Base</span>
            </div>

            {/* Normal Map */}
            <div className="p-1.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <img
                src={generatedMaps.normal}
                alt="Sobel Normal Map"
                className="w-full aspect-square object-cover rounded-lg border border-slate-800/80 mb-1"
              />
              <span className="text-[10px] font-mono text-slate-400">Sobel Normal</span>
            </div>

            {/* Roughness Map */}
            <div className="p-1.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <img
                src={generatedMaps.roughness}
                alt="Roughness Map"
                className="w-full aspect-square object-cover rounded-lg border border-slate-800/80 mb-1"
              />
              <span className="text-[10px] font-mono text-slate-400">Roughness</span>
            </div>

            {/* Metallic Map */}
            <div className="p-1.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <img
                src={generatedMaps.metallic}
                alt="Metallic Map"
                className="w-full aspect-square object-cover rounded-lg border border-slate-800/80 mb-1"
              />
              <span className="text-[10px] font-mono text-slate-400">Metallic</span>
            </div>

            {/* Height / Displacement */}
            <div className="p-1.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <img
                src={generatedMaps.displacement}
                alt="Displacement Map"
                className="w-full aspect-square object-cover rounded-lg border border-slate-800/80 mb-1"
              />
              <span className="text-[10px] font-mono text-slate-400">Displacement</span>
            </div>

            {/* Ambient Occlusion */}
            <div className="p-1.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <img
                src={generatedMaps.ao}
                alt="AO Map"
                className="w-full aspect-square object-cover rounded-lg border border-slate-800/80 mb-1"
              />
              <span className="text-[10px] font-mono text-slate-400">Amb. Occlusion</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
