import React, { useState } from 'react';
import * as THREE from 'three';
import {
  Download,
  Box,
  FileBox,
  Sparkles,
  Camera,
  Code,
  Check,
  Loader2,
  Copy,
  Terminal,
  Layers,
  FileCode,
  Info,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { exportToGLB, exportToOBJ, exportToSTL, ModelStats } from '../lib/threeUtils';
import { generateBlenderPythonScript } from '../lib/blenderPythonExporter';
import { PBRMaterialSettings } from '../types';

interface ExportPanelProps {
  modelGroup: THREE.Group | null;
  currentModelTitle: string;
  materialSettings: PBRMaterialSettings;
  modelStats: ModelStats | null;
  onTakeSnapshot: () => void;
  isSnapshotProcessing: boolean;
  onShowToast: (msg: string) => void;
  activeCodeSnippet?: string;
}

type ExportType = 'glb' | 'obj' | 'stl' | 'blender-py' | 'snapshot' | 'three-js';

interface ExportState {
  type: ExportType | null;
  progress: number;
  stage: string;
  isComplete: boolean;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  modelGroup,
  currentModelTitle,
  materialSettings,
  modelStats,
  onTakeSnapshot,
  isSnapshotProcessing,
  onShowToast,
  activeCodeSnippet,
}) => {
  const [exportState, setExportState] = useState<ExportState>({
    type: null,
    progress: 0,
    stage: '',
    isComplete: false,
  });

  const [showBlenderCodeModal, setShowBlenderCodeModal] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);

  const cleanFileName = currentModelTitle.replace(/[^a-zA-Z0-9_-]/g, '_') || '3D_Model';

  // 1. Export GLB with Visual In-Button Progress
  const handleExportGLB = async () => {
    if (!modelGroup || exportState.type) return;

    setExportState({ type: 'glb', progress: 15, stage: 'Tessellating scene hierarchy...', isComplete: false });

    try {
      await new Promise((r) => setTimeout(r, 250));
      setExportState((s) => ({ ...s, progress: 45, stage: 'Compiling PBR materials & textures...' }));

      await new Promise((r) => setTimeout(r, 300));
      setExportState((s) => ({ ...s, progress: 75, stage: 'Serializing GLTF binary buffers...' }));

      const blob = await exportToGLB(modelGroup, `${cleanFileName}.glb`);

      setExportState((s) => ({ ...s, progress: 100, stage: 'GLB Package Ready!', isComplete: true }));

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cleanFileName}.glb`;
      a.click();
      URL.revokeObjectURL(url);

      onShowToast(`Exported ${cleanFileName}.glb successfully!`);
    } catch (e: any) {
      onShowToast('GLB export error: ' + e.message);
    } finally {
      setTimeout(() => {
        setExportState({ type: null, progress: 0, stage: '', isComplete: false });
      }, 1800);
    }
  };

  // 2. Export OBJ with Visual In-Button Progress
  const handleExportOBJ = async () => {
    if (!modelGroup || exportState.type) return;

    setExportState({ type: 'obj', progress: 20, stage: 'Extracting polygon vertices & UVs...', isComplete: false });

    try {
      await new Promise((r) => setTimeout(r, 200));
      setExportState((s) => ({ ...s, progress: 60, stage: 'Calculating normal face indices...' }));

      await new Promise((r) => setTimeout(r, 250));
      const blob = exportToOBJ(modelGroup, `${cleanFileName}.obj`);

      setExportState((s) => ({ ...s, progress: 100, stage: 'Wavefront OBJ Ready!', isComplete: true }));

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cleanFileName}.obj`;
      a.click();
      URL.revokeObjectURL(url);

      onShowToast(`Exported ${cleanFileName}.obj successfully!`);
    } catch (e: any) {
      onShowToast('OBJ export error: ' + e.message);
    } finally {
      setTimeout(() => {
        setExportState({ type: null, progress: 0, stage: '', isComplete: false });
      }, 1800);
    }
  };

  // 3. Export STL with Visual In-Button Progress
  const handleExportSTL = async () => {
    if (!modelGroup || exportState.type) return;

    setExportState({ type: 'stl', progress: 25, stage: 'Triangulating manifold geometry...', isComplete: false });

    try {
      await new Promise((r) => setTimeout(r, 250));
      setExportState((s) => ({ ...s, progress: 70, stage: 'Writing binary facet normal headers...' }));

      await new Promise((r) => setTimeout(r, 300));
      const blob = exportToSTL(modelGroup, true);

      setExportState((s) => ({ ...s, progress: 100, stage: '3D Print Ready STL!', isComplete: true }));

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cleanFileName}.stl`;
      a.click();
      URL.revokeObjectURL(url);

      onShowToast(`Exported ${cleanFileName}.stl successfully!`);
    } catch (e: any) {
      onShowToast('STL export error: ' + e.message);
    } finally {
      setTimeout(() => {
        setExportState({ type: null, progress: 0, stage: '', isComplete: false });
      }, 1800);
    }
  };

  // 4. Export Blender Python Script (.py)
  const handleExportBlenderPython = async () => {
    if (!modelGroup || exportState.type) return;

    setExportState({ type: 'blender-py', progress: 20, stage: 'Analyzing sub-mesh hierarchies...', isComplete: false });

    try {
      await new Promise((r) => setTimeout(r, 200));
      setExportState((s) => ({ ...s, progress: 55, stage: 'Generating bpy & Principled BSDF nodes...' }));

      await new Promise((r) => setTimeout(r, 250));
      setExportState((s) => ({ ...s, progress: 85, stage: 'Configuring 3-point studio lighting & camera...' }));

      const scriptContent = generateBlenderPythonScript(modelGroup, currentModelTitle, materialSettings);
      const blob = new Blob([scriptContent], { type: 'text/x-python;charset=utf-8' });

      setExportState((s) => ({ ...s, progress: 100, stage: 'Blender Python Script Ready!', isComplete: true }));

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cleanFileName}_blender.py`;
      a.click();
      URL.revokeObjectURL(url);

      onShowToast(`Exported ${cleanFileName}_blender.py for Blender 3.x/4.x!`);
    } catch (e: any) {
      onShowToast('Blender Python generation error: ' + e.message);
    } finally {
      setTimeout(() => {
        setExportState({ type: null, progress: 0, stage: '', isComplete: false });
      }, 1800);
    }
  };

  // 5. High-Res Viewport Snapshot
  const handleSnapshotClick = () => {
    if (exportState.type) return;
    setExportState({ type: 'snapshot', progress: 30, stage: 'Sampling WebGL color buffer...', isComplete: false });
    onTakeSnapshot();

    setTimeout(() => {
      setExportState((s) => ({ ...s, progress: 80, stage: 'Encoding lossless RGBA PNG...' }));
    }, 400);

    setTimeout(() => {
      setExportState((s) => ({ ...s, progress: 100, stage: 'Snapshot saved!', isComplete: true }));
      setTimeout(() => {
        setExportState({ type: null, progress: 0, stage: '', isComplete: false });
      }, 1500);
    }, 900);
  };

  // Copy Blender Python Code
  const handleCopyPythonScript = () => {
    if (!modelGroup) return;
    const script = generateBlenderPythonScript(modelGroup, currentModelTitle, materialSettings);
    navigator.clipboard.writeText(script);
    setCopiedPython(true);
    onShowToast('Blender Python script copied to clipboard!');
    setTimeout(() => setCopiedPython(false), 2000);
  };

  const blenderCodePreview = modelGroup
    ? generateBlenderPythonScript(modelGroup, currentModelTitle, materialSettings)
    : '# Generate a 3D model first';

  return (
    <div className="h-full flex flex-col p-5 bg-[#12161f] text-slate-200 overflow-y-auto font-sans select-none gap-5">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-3 border-b border-slate-800/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-white flex items-center gap-2">
                <span>Export & Bridge Studio</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-950/60 text-sky-300 border border-sky-800/60 font-mono">
                  Production Ready
                </span>
              </h2>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Export production 3D assets with live progress feedback, or generate native Blender Python scripts.
        </p>
      </div>

      {/* Model Spec Summary Card */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">{currentModelTitle}</div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>{modelStats ? `${modelStats.triangles.toLocaleString()} Polys` : '—'}</span>
              <span>•</span>
              <span>{modelStats ? `${modelStats.vertices.toLocaleString()} Verts` : '—'}</span>
              <span>•</span>
              <span>{modelStats ? `${modelStats.meshCount} Sub-meshes` : '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* EXPORT BUTTONS WITH IN-BUTTON PROGRESS INDICATORS */}
      <div className="flex flex-col gap-3">
        {/* 1. Blender Python Script (.py) */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-950/20 to-slate-900/90 p-4 transition-all">
          {/* Progress Overlay if this export is running */}
          {exportState.type === 'blender-py' && (
            <div
              className="absolute inset-0 bg-amber-500/15 pointer-events-none transition-all duration-300"
              style={{ width: `${exportState.progress}%` }}
            />
          )}

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                  <span>Blender Python Script (.py)</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-mono">
                    bpy Studio
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Automated script that generates the entire 3D model, PBR shaders & lights in Blender with 1-click
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-3.5 flex items-center gap-2 relative z-10">
            <button
              id="export-blender-python-btn"
              onClick={handleExportBlenderPython}
              disabled={!!exportState.type}
              className="flex-1 py-2.5 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {exportState.type === 'blender-py' ? (
                <>
                  {exportState.isComplete ? (
                    <Check className="w-4 h-4 text-emerald-950" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  )}
                  <span>{exportState.stage} ({exportState.progress}%)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download .py Script</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowBlenderCodeModal(true)}
              className="py-2.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all flex items-center gap-1.5"
              title="Inspect & Copy Python Code"
            >
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>Inspect</span>
            </button>

            <button
              onClick={handleCopyPythonScript}
              className="py-2.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all flex items-center gap-1.5"
              title="Copy to Clipboard"
            >
              {copiedPython ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Blender Python Instructions Pill */}
          <div className="mt-2.5 text-[11px] text-amber-200/80 bg-amber-950/40 p-2 rounded-lg border border-amber-800/40 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Open Blender → Scripting Tab → Click New → Paste & Press <b>Alt + P</b></span>
          </div>
        </div>

        {/* 2. GLTF Binary (.GLB) */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 hover:border-sky-500/60 bg-slate-900/80 p-4 transition-all">
          {exportState.type === 'glb' && (
            <div
              className="absolute inset-0 bg-sky-500/15 pointer-events-none transition-all duration-300"
              style={{ width: `${exportState.progress}%` }}
            />
          )}

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-200 text-sm">GLTF Binary (.GLB)</div>
                <div className="text-[11px] text-slate-400">Includes PBR shaders, procedural maps, and scene hierarchy</div>
              </div>
            </div>
            <span className="text-xs font-mono text-sky-400 bg-sky-950/60 px-2 py-1 rounded-md border border-sky-800/50">
              Universal
            </span>
          </div>

          <div className="mt-3 relative z-10">
            <button
              id="export-tab-glb-btn"
              onClick={handleExportGLB}
              disabled={!!exportState.type}
              className="w-full py-2.5 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-sky-500 text-slate-200 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {exportState.type === 'glb' ? (
                <>
                  {exportState.isComplete ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  )}
                  <span className="text-sky-300 font-mono">{exportState.stage} ({exportState.progress}%)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>Download .GLB File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Wavefront (.OBJ) */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 hover:border-indigo-500/60 bg-slate-900/80 p-4 transition-all">
          {exportState.type === 'obj' && (
            <div
              className="absolute inset-0 bg-indigo-500/15 pointer-events-none transition-all duration-300"
              style={{ width: `${exportState.progress}%` }}
            />
          )}

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <FileBox className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-200 text-sm">Wavefront (.OBJ)</div>
                <div className="text-[11px] text-slate-400">Pure vertex geometry, faces, and UV mapping coordinates</div>
              </div>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 px-2 py-1 rounded-md border border-indigo-800/50">
              Geometry
            </span>
          </div>

          <div className="mt-3 relative z-10">
            <button
              id="export-tab-obj-btn"
              onClick={handleExportOBJ}
              disabled={!!exportState.type}
              className="w-full py-2.5 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500 text-slate-200 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {exportState.type === 'obj' ? (
                <>
                  {exportState.isComplete ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  )}
                  <span className="text-indigo-300 font-mono">{exportState.stage} ({exportState.progress}%)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>Download .OBJ File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. Stereolithography (.STL) */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 hover:border-emerald-500/60 bg-slate-900/80 p-4 transition-all">
          {exportState.type === 'stl' && (
            <div
              className="absolute inset-0 bg-emerald-500/15 pointer-events-none transition-all duration-300"
              style={{ width: `${exportState.progress}%` }}
            />
          )}

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-200 text-sm">Stereolithography (.STL)</div>
                <div className="text-[11px] text-slate-400">Binary 3D print optimized watertight mesh surface</div>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-800/50">
              3D Print
            </span>
          </div>

          <div className="mt-3 relative z-10">
            <button
              id="export-tab-stl-btn"
              onClick={handleExportSTL}
              disabled={!!exportState.type}
              className="w-full py-2.5 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500 text-slate-200 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {exportState.type === 'stl' ? (
                <>
                  {exportState.isComplete ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  )}
                  <span className="text-emerald-300 font-mono">{exportState.stage} ({exportState.progress}%)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download .STL File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5. 4K / High-Res Viewport Snapshot */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 hover:border-pink-500/60 bg-slate-900/80 p-4 transition-all">
          {exportState.type === 'snapshot' && (
            <div
              className="absolute inset-0 bg-pink-500/15 pointer-events-none transition-all duration-300"
              style={{ width: `${exportState.progress}%` }}
            />
          )}

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-200 text-sm">High-Res Viewport Snapshot</div>
                <div className="text-[11px] text-slate-400">Lossless RGBA screen render capture (PNG)</div>
              </div>
            </div>
            <span className="text-xs font-mono text-pink-400 bg-pink-950/60 px-2 py-1 rounded-md border border-pink-800/50">
              PNG
            </span>
          </div>

          <div className="mt-3 relative z-10">
            <button
              id="export-tab-snapshot-btn"
              onClick={handleSnapshotClick}
              disabled={!!exportState.type || isSnapshotProcessing}
              className="w-full py-2.5 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-pink-500 text-slate-200 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {exportState.type === 'snapshot' || isSnapshotProcessing ? (
                <>
                  {exportState.isComplete ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                  )}
                  <span className="text-pink-300 font-mono">{exportState.stage || 'Rendering Viewport...'} ({exportState.progress || 50}%)</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-pink-400" />
                  <span>Capture Viewport Image</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* BLENDER PYTHON SCRIPT MODAL */}
      {showBlenderCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#161b26] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Blender Python Script (bpy)</h3>
                  <p className="text-[11px] text-slate-400">Complete executable script for Blender 3.x / 4.x</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPythonScript}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs flex items-center gap-1.5 transition-all"
                >
                  {copiedPython ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPython ? 'Copied!' : 'Copy Script'}</span>
                </button>
                <button
                  onClick={() => setShowBlenderCodeModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#0a0d14]">
              <pre className="text-xs font-mono text-amber-300/90 whitespace-pre leading-relaxed select-text">
                {blenderCodePreview}
              </pre>
            </div>

            {/* Modal Footer with quick instructions */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-900/70 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>Compatible with Blender EEVEE Next & Cycles engines</span>
              </span>
              <button
                onClick={handleExportBlenderPython}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .py</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
