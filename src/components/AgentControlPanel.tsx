import React, { useState } from 'react';
import { 
  Wand2, 
  Sparkles, 
  Cpu, 
  Sliders, 
  Play, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Terminal, 
  Lightbulb, 
  Layers,
  Palette
} from 'lucide-react';
import { VisualStyle, AIModelProvider, AgentStep, ModelProbeResult } from '../types';

interface AgentControlPanelProps {
  onGenerate: (prompt: string, style: VisualStyle) => Promise<void>;
  isGenerating: boolean;
  agentSteps: AgentStep[];
  selectedProvider: AIModelProvider;
  onSelectProvider: (provider: AIModelProvider) => void;
  selectedModelName: string;
  onSelectModelName: (name: string) => void;
  probeResult: ModelProbeResult | null;
  currentPrompt: string;
  setCurrentPrompt: (prompt: string) => void;
  currentStyle: VisualStyle;
  setCurrentStyle: (style: VisualStyle) => void;
  thoughtLog?: string;
}

export const AgentControlPanel: React.FC<AgentControlPanelProps> = ({
  onGenerate,
  isGenerating,
  agentSteps,
  selectedProvider,
  onSelectProvider,
  selectedModelName,
  onSelectModelName,
  probeResult,
  currentPrompt,
  setCurrentPrompt,
  currentStyle,
  setCurrentStyle,
  thoughtLog,
}) => {
  const [showThoughts, setShowThoughts] = useState(true);

  const styleOptions: { id: VisualStyle; label: string; icon: string }[] = [
    { id: 'scifi-hard-surface', label: 'Sci-Fi Hard-Surface', icon: '🤖' },
    { id: 'cyberpunk-neon', label: 'Cyberpunk Neon', icon: '🌆' },
    { id: 'pbr-realistic', label: 'Realistic PBR', icon: '💎' },
    { id: 'fantasy-rpg', label: 'Fantasy RPG Weapon', icon: '⚔️' },
    { id: 'architectural', label: 'Architectural Bio-Pavilion', icon: '🏛️' },
    { id: 'organic-sculpt', label: 'Organic Alien Creature', icon: '🐙' },
    { id: 'lowpoly-stylized', label: 'Stylized Low-Poly Game Asset', icon: '🏰' },
    { id: 'voxel-art', label: 'Voxel Art', icon: '🧱' },
  ];

  const quickPromptChips = [
    'Futuristic Quadcopter Recon Drone with glowing thruster rings',
    'Arcane Crystal Greatsword with floating elemental runes',
    'Cybernetic Titan Mecha Helmet with holographic visor',
    'Parametric Bio-Architecture Pavilion with spiral ribs',
    'Alien Torus Organic Sculpture with orbiting bio-spores',
    'Medieval Low-Poly Fortress Keep with corner watchtowers',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPrompt.trim() || isGenerating) return;
    onGenerate(currentPrompt, currentStyle);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 text-slate-200 overflow-y-auto border-r border-slate-800/80 p-4 sm:p-5">
      {/* Panel Title & Status */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-white">3D Autonomous Agent</h2>
            <p className="text-[11px] text-slate-400">Natural language 3D mesh synthesis</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
          Agent Active
        </span>
      </div>

      {/* Generation Form */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Prompt Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>3D Model Prompt</span>
            <span className="text-[11px] text-slate-500 font-normal">Describe geometry, materials & details</span>
          </label>
          <div className="relative">
            <textarea
              id="input-3d-prompt"
              rows={3}
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              placeholder="e.g. Cyberpunk autonomous battle drone with quad thrusters and laser sensor gimbal..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none shadow-inner"
            />
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>Inspiration Prompts:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPromptChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentPrompt(chip)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-left"
              >
                {chip.slice(0, 32)}...
              </button>
            ))}
          </div>
        </div>

        {/* Visual Style Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>Visual Aesthetic Style</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {styleOptions.map((opt) => {
              const isSelected = currentStyle === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCurrentStyle(opt.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          id="btn-generate-3d-model"
          type="submit"
          disabled={isGenerating || !currentPrompt.trim()}
          className="w-full py-3 px-4 rounded-xl font-semibold text-xs tracking-wide bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Agent Synthesizing 3D Geometry...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Synthesize 3D Model</span>
            </>
          )}
        </button>
      </form>

      {/* Agent Workflow Execution Step Monitor */}
      {agentSteps.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Agent Execution Pipeline</span>
            </h3>
            <button
              onClick={() => setShowThoughts(!showThoughts)}
              className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
            >
              {showThoughts ? 'Hide Reasoning' : 'Show Reasoning'}
            </button>
          </div>

          <div className="space-y-2.5">
            {agentSteps.map((step) => {
              const isRunning = step.status === 'running';
              const isCompleted = step.status === 'completed';
              const isFailed = step.status === 'failed';

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isRunning
                      ? 'bg-indigo-950/30 border-indigo-500/50 shadow-sm'
                      : isCompleted
                      ? 'bg-slate-950/60 border-slate-800/80'
                      : 'bg-slate-950/30 border-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {isRunning && <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />}
                      {step.status === 'pending' && <Clock className="w-3.5 h-3.5 text-slate-500" />}
                      {isFailed && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                      <span>{step.title}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {isRunning ? 'Processing...' : isCompleted ? '100%' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5.5">{step.description}</p>
                </div>
              );
            })}
          </div>

          {/* Thought Log Viewer */}
          {thoughtLog && showThoughts && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Agent Chain of Thought
              </div>
              <div className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                {thoughtLog}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
