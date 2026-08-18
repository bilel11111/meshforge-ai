import React from 'react';
import { Sparkles, Box, Wand2, X, ChevronRight } from 'lucide-react';
import { VisualStyle } from '../types';

export interface PresetTemplate {
  title: string;
  category: string;
  prompt: string;
  style: VisualStyle;
  icon: string;
  tags: string[];
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    title: 'Sci-Fi Explorer Drone',
    category: 'Sci-Fi & Exploration',
    prompt: 'High-tech exploration rover drone with pressurized glass cockpit cabin, top binocular sensor dome, 4 ducted fan thrusters with rotating propellers, 4 articulated hydraulic spider landing legs, front manipulator claws, and localized volumetric blue searchlights with blue-to-white gradient',
    style: 'scifi-hard-surface',
    icon: '🛰️',
    tags: ['Explorer Drone', 'Ducted Fans', 'Volumetric Searchlight', 'PBR'],
  },
  {
    title: 'Cyberpunk Recon Drone',
    category: 'Sci-Fi & Vehicles',
    prompt: 'Futuristic Quadcopter Recon Drone with glowing thruster rings, sensor optics gimbal, and carbon fiber arm struts',
    style: 'cyberpunk-neon',
    icon: '🛸',
    tags: ['Drone', 'Cyberpunk', 'Vehicles'],
  },
  {
    title: 'Titan Mecha Helmet',
    category: 'Hard-Surface',
    prompt: 'Cybernetic Titan Mecha Helmet with holographic cyan visor, ear rebreather pods, and crest antenna fin',
    style: 'scifi-hard-surface',
    icon: '🤖',
    tags: ['Mecha', 'Helmet', 'Sci-Fi'],
  },
  {
    title: 'Arcane Crystal Greatsword',
    category: 'Fantasy & RPG',
    prompt: 'Arcane Aether Greatsword with glowing crystalline edge, inner energy filament, ornamental crossguard, and leather ribbon hilt',
    style: 'fantasy-rpg',
    icon: '⚔️',
    tags: ['Blade', 'Weapon', 'Fantasy'],
  },
  {
    title: 'Parametric Bio-Pavilion',
    category: 'Architecture',
    prompt: 'Parametric Bio-Architecture Pavilion with spiral ribs, glass canopy, and central glowing oculus platform',
    style: 'architectural',
    icon: '🏛️',
    tags: ['Pavilion', 'Architecture', 'Parametric'],
  },
  {
    title: 'Alien Organic Torus Sculpture',
    category: 'Organic Sculpting',
    prompt: 'Alien Organic Torus Sculpture with iridescent purple sheen and orbiting glowing bio-spores',
    style: 'organic-sculpt',
    icon: '🐙',
    tags: ['Sculpture', 'Organic', 'Creature'],
  },
  {
    title: 'Medieval Fortress Keep',
    category: 'Game Assets',
    prompt: 'Stylized Low-Poly Medieval Fortress Keep with 4 corner watchtowers, rock island base, and timber gate',
    style: 'lowpoly-stylized',
    icon: '🏰',
    tags: ['Castle', 'Low-Poly', 'Game Asset'],
  },
];

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetTemplate) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Curated 3D Model Presets & Inspiration</h3>
              <p className="text-xs text-slate-400">Select a ready-to-generate 3D asset architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {PRESET_TEMPLATES.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-indigo-500/60 hover:bg-slate-950/90 cursor-pointer transition-all flex flex-col justify-between group shadow-sm hover:shadow-indigo-500/10"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{preset.icon}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {preset.category}
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors mb-1">
                  {preset.title}
                </h4>
                <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                  {preset.prompt}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {preset.tags.map((tag) => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
