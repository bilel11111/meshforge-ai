import React from 'react';
import { 
  Menu, 
  HelpCircle, 
  Sparkles, 
  Code2, 
  Cpu, 
  Layers, 
  Sliders, 
  Wand2, 
  Palette, 
  Download,
  FolderOpen
} from 'lucide-react';
import { ForgeTab, ModelProbeResult, AIModelProvider } from '../types';

interface HeaderProps {
  currentTab: ForgeTab;
  onSelectTab: (tab: ForgeTab) => void;
  probeResult: ModelProbeResult | null;
  selectedProvider: AIModelProvider;
  selectedModelName: string;
  onOpenModelModal: () => void;
  onOpenPresets: () => void;
  onOpenCodeSandbox: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  probeResult,
  selectedProvider,
  selectedModelName,
  onOpenModelModal,
  onOpenPresets,
  onOpenCodeSandbox,
  onOpenHelp,
}) => {
  const tabs: ForgeTab[] = ['Assets', 'Generation', 'Image to 3D', 'Edit', 'Refinement', 'Export'];

  return (
    <header className="h-11 bg-[#161a24] border-b border-slate-800/90 flex items-center justify-between px-3 text-slate-200 select-none z-20">
      {/* Left: Window Controls + Title + Menu */}
      <div className="flex items-center gap-3">
        {/* macOS Traffic Lights */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] cursor-pointer hover:opacity-80 transition-opacity shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] cursor-pointer hover:opacity-80 transition-opacity shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] cursor-pointer hover:opacity-80 transition-opacity shadow-sm" />
        </div>

        {/* Menu Icon */}
        <button
          id="forge-main-menu-btn"
          onClick={onOpenPresets}
          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors ml-1"
          title="Templates & Presets"
        >
          <Menu className="w-3.5 h-3.5" />
        </button>

        {/* Forge Title */}
        <span className="font-semibold text-slate-200 text-xs tracking-wide">
          Forge
        </span>
      </div>

      {/* Center: Segmented Navigation Bar */}
      <nav className="flex items-center bg-[#0d1017] p-0.5 rounded-lg border border-slate-800/80 shadow-inner">
        {tabs.map((tab) => {
          const isActive = currentTab === tab;
          return (
            <button
              key={tab}
              id={`forge-tab-${tab.toLowerCase()}`}
              onClick={() => onSelectTab(tab)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                isActive
                  ? 'bg-[#212738] text-white shadow-sm font-semibold border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Model status badge */}
        <button
          id="forge-header-model-badge"
          onClick={onOpenModelModal}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 hover:border-slate-700 transition-colors font-mono"
          title="Local AI Inference Detection (Ollama / vLLM / LM Studio / Gemini)"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="truncate max-w-[110px]">{selectedModelName || 'Llama3-8b'}</span>
        </button>

        {/* Code Sandbox */}
        <button
          id="forge-header-code-btn"
          onClick={onOpenCodeSandbox}
          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Three.js Code Sandbox"
        >
          <Code2 className="w-3.5 h-3.5" />
        </button>

        {/* Presets */}
        <button
          id="forge-header-presets-btn"
          onClick={onOpenPresets}
          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="3D Model Presets"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </button>

        {/* Help */}
        <button
          id="forge-header-help-btn"
          onClick={onOpenHelp}
          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Help & Shortcuts"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
