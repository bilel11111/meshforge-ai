import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  Layers, 
  Cpu, 
  Radio, 
  Sliders, 
  Sparkles, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Wifi, 
  CheckCircle2, 
  Zap, 
  Eye, 
  Maximize2,
  Box,
  Image as ImageIcon,
  Activity,
  ArrowRight,
  Info
} from 'lucide-react';
import { GeneratedPBRMaps } from '../lib/textureBaker';

interface ForgeAssetsPanelProps {
  selectedNode: string;
  onSelectNode: (id: string) => void;
  agentModel: string;
  onChangeAgentModel?: (model: string) => void;
  currentGoal: string;
  commandPrompt: string;
  onCommandPromptChange: (val: string) => void;
  onUpdateModel: () => void;
  isUpdating: boolean;
  
  // 3D Properties
  meshDetailEnabled: boolean;
  onToggleMeshDetail: (val: boolean) => void;
  meshDetailValue: number;
  onChangeMeshDetail: (val: number) => void;

  textureResEnabled: boolean;
  onToggleTextureRes: (val: boolean) => void;
  textureResValue: string;
  onChangeTextureRes: (val: string) => void;

  uvLayout: string;
  onChangeUvLayout: (val: string) => void;

  // Local Discovery
  onOpenDiscoveryModal: () => void;

  // Generated Maps
  pbrMaps: GeneratedPBRMaps | null;
  activeMapFilter: string | null;
  onSelectMapFilter: (mapType: string) => void;
  onInspectMap: (mapUrl: string, title: string) => void;

  onAddNewAsset: () => void;
}

export const ForgeAssetsLeftPanel: React.FC<{
  selectedNode: string;
  onSelectNode: (id: string) => void;
  agentModel: string;
  onChangeAgentModel?: (model: string) => void;
  currentGoal: string;
  commandPrompt: string;
  onCommandPromptChange: (val: string) => void;
  onUpdateModel: () => void;
  isUpdating: boolean;
  onAddNewAsset: () => void;
}> = ({
  selectedNode,
  onSelectNode,
  agentModel,
  onChangeAgentModel,
  currentGoal,
  commandPrompt,
  onCommandPromptChange,
  onUpdateModel,
  isUpdating,
  onAddNewAsset,
}) => {
  const [treeExpanded, setTreeExpanded] = useState({
    root: true,
    assets: true,
  });

  return (
    <aside className="w-80 shrink-0 flex flex-col gap-3 p-3 text-slate-200 text-xs overflow-y-auto border-r border-slate-800/80 bg-[#12161f]/95">
      {/* 1. Asset Tree */}
      <section className="flex flex-col bg-[#161c28]/90 rounded-xl border border-slate-800/80 p-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
          <span className="font-semibold text-slate-200 text-[13px] tracking-tight flex items-center gap-1.5">
            Asset Tree
          </span>
          <button
            id="forge-add-asset-btn"
            onClick={onAddNewAsset}
            className="w-5 h-5 rounded-md flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Add Sub-Component or Import Mesh"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tree Nodes */}
        <div className="flex flex-col gap-1 select-none font-mono text-[11.5px]">
          {/* Root */}
          <div
            onClick={() => onSelectNode('root')}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
              selectedNode === 'root'
                ? 'bg-slate-800 text-sky-400 font-medium border border-slate-700 shadow-inner'
                : 'hover:bg-slate-800/50 text-slate-300'
            }`}
          >
            <span 
              onClick={(e) => {
                e.stopPropagation();
                setTreeExpanded(p => ({ ...p, root: !p.root }));
              }}
              className="text-slate-500 hover:text-slate-300 p-0.5"
            >
              {treeExpanded.root ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </span>
            <span className="text-cyan-400">⚛</span>
            <span className="truncate">Sci-Fi_Explorer_Drone_Root</span>
          </div>

          {/* Subtree: Assets Folder */}
          {treeExpanded.root && (
            <div className="pl-4 flex flex-col gap-1 border-l border-slate-800/70 ml-3">
              <div
                onClick={() => onSelectNode('assets')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-colors ${
                  selectedNode === 'assets'
                    ? 'bg-slate-800/90 text-sky-300'
                    : 'hover:bg-slate-800/40 text-slate-400'
                }`}
              >
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    setTreeExpanded(p => ({ ...p, assets: !p.assets }));
                  }}
                  className="text-slate-500 hover:text-slate-300"
                >
                  {treeExpanded.assets ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </span>
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>Assets</span>
              </div>

              {/* Child Nodes */}
              {treeExpanded.assets && (
                <div className="pl-4 flex flex-col gap-0.5 border-l border-slate-800/60 ml-2">
                  <button
                    id="forge-tree-node-frame"
                    onClick={() => onSelectNode('Drone_Frame_Mesh')}
                    className={`flex items-center gap-2 px-2 py-1 rounded text-left transition-colors ${
                      selectedNode === 'Drone_Frame_Mesh'
                        ? 'bg-sky-950/70 text-sky-300 border border-sky-800/50'
                        : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-slate-500">◇</span>
                    <span className="truncate">Drone_Frame_Mesh</span>
                  </button>

                  <button
                    id="forge-tree-node-propeller"
                    onClick={() => onSelectNode('Propeller_Assembly_Mesh')}
                    className={`flex items-center gap-2 px-2 py-1 rounded text-left transition-colors ${
                      selectedNode === 'Propeller_Assembly_Mesh'
                        ? 'bg-sky-950/70 text-sky-300 border border-sky-800/50'
                        : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-slate-500">◇</span>
                    <span className="truncate">Propeller_Assembly_Mesh</span>
                  </button>

                  <button
                    id="forge-tree-node-sensor"
                    onClick={() => onSelectNode('Sensor_Dome_Texture')}
                    className={`flex items-center gap-2 px-2 py-1 rounded text-left transition-colors ${
                      selectedNode === 'Sensor_Dome_Texture'
                        ? 'bg-sky-950/70 text-sky-300 border border-sky-800/50'
                        : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-cyan-400 font-bold">▦</span>
                    <span className="truncate">Sensor_Dome_Texture</span>
                  </button>

                  <button
                    id="forge-tree-node-chassis-emission"
                    onClick={() => onSelectNode('Chassis_Texture (Emission: Blue)')}
                    className={`flex items-center gap-2 px-2 py-1 rounded text-left transition-colors ${
                      selectedNode === 'Chassis_Texture (Emission: Blue)'
                        ? 'bg-sky-950/70 text-sky-300 border border-sky-800/50'
                        : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-blue-400">🖼️</span>
                    <span className="truncate">Chassis_Texture (Emission: Blue)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. FORGE AGENT CARD */}
      <section className="flex flex-col bg-[#161c28]/90 rounded-xl border border-slate-800/80 p-3 shadow-sm gap-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/70">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold text-slate-200 text-[12px] tracking-tight">
              FORGE AGENT
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {agentModel}
          </span>
        </div>

        <div className="flex flex-col gap-2 font-mono text-[11px] leading-relaxed text-slate-300">
          <div className="flex items-start gap-1.5">
            <span className="text-emerald-400 mt-0.5 font-bold">●</span>
            <p className="text-slate-300">
              <span className="text-slate-400">Current Goal: </span>
              {currentGoal}
            </p>
          </div>

          <div className="flex flex-col gap-1 bg-slate-900/70 p-2 rounded-lg border border-slate-800/60">
            <div className="flex items-center gap-1 text-[10.5px] text-slate-400 font-sans font-medium">
              <span className="text-emerald-400 font-bold">●</span>
              <span>Local Services detected:</span>
            </div>
            <div className="pl-3 flex flex-col gap-0.5 text-[10.5px] text-slate-300">
              <div>• vLLM (Running, model: mesh-base)</div>
              <div>• Ollama (Running, model: texture-diffusion-v1)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Agent Command Bar */}
      <section className="flex flex-col bg-[#161c28]/90 rounded-xl border border-slate-800/80 p-3 shadow-sm gap-2.5 mt-auto">
        <span className="font-semibold text-slate-200 text-[12.5px] tracking-tight flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Agent Command Bar
        </span>

        <textarea
          id="forge-command-input"
          value={commandPrompt}
          onChange={(e) => onCommandPromptChange(e.target.value)}
          rows={3}
          placeholder="Describe prompt or 3D modification..."
          className="w-full bg-[#0d1117] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-700/80 focus:outline-none focus:border-sky-500 transition-colors resize-none placeholder:text-slate-500 font-sans"
        />

        <button
          id="forge-update-drone-btn"
          onClick={onUpdateModel}
          disabled={isUpdating}
          className="w-full py-2 px-3 rounded-lg font-medium text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          {isUpdating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span>Synthesizing Updates...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Update Drone Model</span>
            </>
          )}
        </button>
      </section>
    </aside>
  );
};

export const ForgeAssetsRightPanel: React.FC<{
  meshDetailEnabled: boolean;
  onToggleMeshDetail: (val: boolean) => void;
  meshDetailValue: number;
  onChangeMeshDetail: (val: number) => void;

  textureResEnabled: boolean;
  onToggleTextureRes: (val: boolean) => void;
  textureResValue: string;
  onChangeTextureRes: (val: string) => void;

  uvLayout: string;
  onChangeUvLayout: (val: string) => void;

  onOpenDiscoveryModal: () => void;

  pbrMaps: GeneratedPBRMaps | null;
  activeMapFilter: string | null;
  onSelectMapFilter: (mapType: string) => void;
  onInspectMap: (mapUrl: string, title: string) => void;
}> = ({
  meshDetailEnabled,
  onToggleMeshDetail,
  meshDetailValue,
  onChangeMeshDetail,
  textureResEnabled,
  onToggleTextureRes,
  textureResValue,
  onChangeTextureRes,
  uvLayout,
  onChangeUvLayout,
  onOpenDiscoveryModal,
  pbrMaps,
  activeMapFilter,
  onSelectMapFilter,
  onInspectMap,
}) => {
  return (
    <aside className="w-80 shrink-0 flex flex-col gap-3 p-3 text-slate-200 text-xs overflow-y-auto border-l border-slate-800/80 bg-[#12161f]/95">
      {/* 1. 3D Properties */}
      <section className="flex flex-col bg-[#161c28]/90 rounded-xl border border-slate-800/80 p-3 shadow-sm gap-3">
        <span className="font-semibold text-slate-200 text-[13px] tracking-tight pb-1.5 border-b border-slate-800/80 flex items-center justify-between">
          <span>3D Properties</span>
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
        </span>

        {/* Mesh Detail Switch & Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium text-[11.5px]">Mesh Detail</span>
            <button
              id="forge-toggle-mesh-detail"
              onClick={() => onToggleMeshDetail(!meshDetailEnabled)}
              className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                meshDetailEnabled ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                  meshDetailEnabled ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={meshDetailValue}
            onChange={(e) => onChangeMeshDetail(Number(e.target.value))}
            className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Texture Res Switch & Selector */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium text-[11.5px]">Texture Res ({textureResValue})</span>
            <button
              id="forge-toggle-texture-res"
              onClick={() => onToggleTextureRes(!textureResEnabled)}
              className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                textureResEnabled ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                  textureResEnabled ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {['512', '1024', '2048', '4096'].map((res) => {
              const resLabel = `${res}x${res}`;
              const isSelected = textureResValue.includes(res);
              return (
                <button
                  key={res}
                  onClick={() => onChangeTextureRes(resLabel)}
                  className={`py-1 rounded text-[10px] font-mono transition-colors ${
                    isSelected
                      ? 'bg-sky-600 text-white font-semibold'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400'
                  }`}
                >
                  {res}
                </button>
              );
            })}
          </div>
        </div>

        {/* UV Layout Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-300 font-medium text-[11.5px]">UV Layout Type</label>
          <div className="relative">
            <select
              id="forge-uv-layout-select"
              value={uvLayout}
              onChange={(e) => onChangeUvLayout(e.target.value)}
              className="w-full bg-[#0d1117] text-slate-200 text-xs py-1.5 px-2.5 rounded-lg border border-slate-700/80 focus:outline-none focus:border-sky-500 transition-colors appearance-none cursor-pointer pr-8"
            >
              <option value="Optimized">Optimized</option>
              <option value="Non-Overlapping">Non-Overlapping</option>
              <option value="Smart Atlas">Smart Atlas</option>
              <option value="UDIM Multi-Tile">UDIM Multi-Tile</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 2. Native Local Discovery */}
      <section className="flex flex-col bg-[#161c28]/90 rounded-xl border border-slate-800/80 p-3 shadow-sm gap-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
          <span className="font-semibold text-slate-200 text-[12.5px] tracking-tight flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            Native Local Discovery
          </span>
          <button
            onClick={onOpenDiscoveryModal}
            className="text-[10.5px] text-sky-400 hover:text-sky-300 transition-colors"
          >
            Configure
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {/* vLLM */}
          <div
            onClick={onOpenDiscoveryModal}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 cursor-pointer hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-slate-300 font-medium text-[11.5px]">vLLM - Mesh Engine</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">online</span>
          </div>

          {/* Ollama */}
          <div
            onClick={onOpenDiscoveryModal}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 cursor-pointer hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-slate-300 font-medium text-[11.5px]">Ollama - Texture Engine</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">online</span>
          </div>

          {/* Diffusers */}
          <div
            onClick={onOpenDiscoveryModal}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 cursor-pointer hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-slate-300 font-medium text-[11.5px]">Diffusers - Material Engine</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">online</span>
          </div>
        </div>
      </section>

      {/* 3. Generated Maps */}
      <section className="flex flex-col bg-[#161c28]/90 rounded-xl border border-slate-800/80 p-3 shadow-sm gap-2 mt-auto">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
          <span className="font-semibold text-slate-200 text-[12.5px] tracking-tight flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            Generated Maps
          </span>
          <span className="text-[10px] text-slate-500 font-mono">5 Channels</span>
        </div>

        {/* 5 Visual Texture Tiles */}
        <div className="grid grid-cols-3 gap-2">
          {/* Tile 1: Albedo */}
          <div
            onClick={() => pbrMaps && onInspectMap(pbrMaps.albedo, 'Albedo (Base Color)')}
            className="group relative flex flex-col items-center gap-1 p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-sky-500/80 cursor-pointer transition-all"
          >
            <div className="w-full aspect-square rounded bg-slate-800 overflow-hidden relative">
              {pbrMaps?.albedo ? (
                <img src={pbrMaps.albedo} alt="Albedo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="text-[10.5px] font-mono text-slate-300 truncate">Albedo</span>
          </div>

          {/* Tile 2: Normal */}
          <div
            onClick={() => pbrMaps && onInspectMap(pbrMaps.normal, 'Normal Map (Tangent)')}
            className="group relative flex flex-col items-center gap-1 p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-sky-500/80 cursor-pointer transition-all"
          >
            <div className="w-full aspect-square rounded bg-slate-800 overflow-hidden relative">
              {pbrMaps?.normal ? (
                <img src={pbrMaps.normal} alt="Normal" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="text-[10.5px] font-mono text-slate-300 truncate">Normal</span>
          </div>

          {/* Tile 3: Roughness */}
          <div
            onClick={() => pbrMaps && onInspectMap(pbrMaps.roughness, 'Roughness Map')}
            className="group relative flex flex-col items-center gap-1 p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-sky-500/80 cursor-pointer transition-all"
          >
            <div className="w-full aspect-square rounded bg-slate-800 overflow-hidden relative">
              {pbrMaps?.roughness ? (
                <img src={pbrMaps.roughness} alt="Roughness" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-400" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="text-[10.5px] font-mono text-slate-300 truncate">Roughness</span>
          </div>
        </div>

        {/* Row 2: Metallic & Emission */}
        <div className="grid grid-cols-2 gap-2">
          {/* Tile 4: Metallic */}
          <div
            onClick={() => pbrMaps && onInspectMap(pbrMaps.metallic, 'Metallic Map')}
            className="group relative flex flex-col items-center gap-1 p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-sky-500/80 cursor-pointer transition-all"
          >
            <div className="w-full aspect-[4/3] rounded bg-slate-800 overflow-hidden relative">
              {pbrMaps?.metallic ? (
                <img src={pbrMaps.metallic} alt="Metallic" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-500 to-zinc-800" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="text-[10.5px] font-mono text-slate-300 truncate">Metallic</span>
          </div>

          {/* Tile 5: Emission */}
          <div
            onClick={() => pbrMaps && onInspectMap(pbrMaps.emission || pbrMaps.albedo, 'Emission Map (Blue Glow)')}
            className="group relative flex flex-col items-center gap-1 p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-sky-500/80 cursor-pointer transition-all"
          >
            <div className="w-full aspect-[4/3] rounded bg-slate-800 overflow-hidden relative">
              {pbrMaps?.emission ? (
                <img src={pbrMaps.emission} alt="Emission" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-950 via-sky-950 to-cyan-800" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="text-[10.5px] font-mono text-slate-300 truncate">Emission</span>
          </div>
        </div>
      </section>
    </aside>
  );
};
