import React, { useState } from 'react';
import { Code2, Play, Copy, Check, X, Terminal, AlertCircle, Download } from 'lucide-react';
import * as THREE from 'three';

interface CodeSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  blenderPythonCode?: string;
  onRunCode: (customCode: string) => void;
  onDownloadBlenderPy?: () => void;
}

export const CodeSandboxModal: React.FC<CodeSandboxModalProps> = ({
  isOpen,
  onClose,
  code,
  blenderPythonCode,
  onRunCode,
  onDownloadBlenderPy,
}) => {
  const [activeTab, setActiveTab] = useState<'three' | 'blender'>('three');
  const [editedCode, setEditedCode] = useState(code);
  const [editedPython, setEditedPython] = useState(blenderPythonCode || '');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync if code props change
  React.useEffect(() => {
    setEditedCode(code);
  }, [code]);

  React.useEffect(() => {
    if (blenderPythonCode) {
      setEditedPython(blenderPythonCode);
    }
  }, [blenderPythonCode]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy = activeTab === 'three' ? editedCode : editedPython;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    try {
      setErrorMsg(null);
      onRunCode(editedCode);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Execution error');
    }
  };

  const handleDownloadPython = () => {
    if (onDownloadBlenderPy) {
      onDownloadBlenderPy();
    } else {
      const blob = new Blob([editedPython], { type: 'text/x-python;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blender_3d_asset.py';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${activeTab === 'three' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
              {activeTab === 'three' ? <Code2 className="w-5 h-5" /> : <Terminal className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-white">
                  {activeTab === 'three' ? 'Three.js Procedural Code Sandbox' : 'Blender Python (bpy) Studio'}
                </h3>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${activeTab === 'three' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                  {activeTab === 'three' ? 'WebGL Live Engine' : 'Blender 3.x/4.x'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {activeTab === 'three'
                  ? 'Inspect, edit, and live-execute JavaScript mesh generators'
                  : 'Native Python script for Blender with geometry, Principled BSDF nodes & lighting'}
              </p>
            </div>
          </div>

          {/* Tab Switcher & Close */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab('three')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'three'
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Three.js (JS)
              </button>
              <button
                onClick={() => setActiveTab('blender')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'blender'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Blender (Python)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Editor Body */}
        <div className="p-4 flex-1 flex flex-col overflow-hidden bg-slate-950">
          <div className="flex items-center justify-between pb-2 text-[11px] text-slate-400 font-mono">
            <span>
              {activeTab === 'three'
                ? 'JavaScript (THREE context injected)'
                : 'Python (Blender bpy & bmesh modules)'}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Script'}</span>
            </button>
          </div>

          {activeTab === 'three' ? (
            <textarea
              value={editedCode}
              onChange={(e) => setEditedCode(e.target.value)}
              className="flex-1 w-full bg-slate-900/90 text-cyan-300 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none overflow-y-auto leading-relaxed shadow-inner"
              placeholder="// Enter custom Three.js code that returns a THREE.Group or THREE.Mesh..."
              rows={18}
            />
          ) : (
            <textarea
              value={editedPython}
              onChange={(e) => setEditedPython(e.target.value)}
              className="flex-1 w-full bg-slate-900/90 text-amber-300 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none overflow-y-auto leading-relaxed shadow-inner"
              placeholder="# Blender Python script..."
              rows={18}
            />
          )}

          {errorMsg && (
            <div className="mt-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            {activeTab === 'three'
              ? 'Function signature: function(THREE): THREE.Group'
              : 'Instructions: In Blender, Scripting Workspace → New → Paste → Alt + P'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-medium"
            >
              Close
            </button>
            {activeTab === 'three' ? (
              <button
                id="btn-run-sandbox-code"
                onClick={handleRun}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute in 3D Viewport</span>
              </button>
            ) : (
              <button
                onClick={handleDownloadPython}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .py Script</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
