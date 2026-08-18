import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Server, 
  Terminal, 
  Zap, 
  X
} from 'lucide-react';
import { ModelProbeResult, AIModelProvider } from '../types';

interface LocalModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  probeResult: ModelProbeResult | null;
  onRefreshProbe: (customEndpoint?: string) => Promise<void>;
  isProbing: boolean;
  selectedProvider: AIModelProvider;
  onSelectProvider: (provider: AIModelProvider) => void;
  selectedModelName: string;
  onSelectModelName: (name: string) => void;
}

export const LocalModelModal: React.FC<LocalModelModalProps> = ({
  isOpen,
  onClose,
  probeResult,
  onRefreshProbe,
  isProbing,
  selectedProvider,
  onSelectProvider,
  selectedModelName,
  onSelectModelName,
}) => {
  const [customEndpoint, setCustomEndpoint] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">AI Inference Engines & Local Model Prober</h3>
              <p className="text-xs text-slate-400">Auto-detected local LLMs (Ollama, vLLM, LM Studio) & Cloud AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Quick Rescan Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200">Local Port Scanner</span>
              <p className="text-[11px] text-slate-400">Probes localhost:11434 (Ollama), :8000 (vLLM), :1234 (LM Studio)</p>
            </div>
            <button
              id="btn-rescan-ports"
              onClick={() => onRefreshProbe(customEndpoint)}
              disabled={isProbing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
              <span>{isProbing ? 'Scanning...' : 'Re-Scan Ports'}</span>
            </button>
          </div>

          {/* Cloud Gemini Option */}
          <div
            onClick={() => {
              onSelectProvider('gemini');
              onSelectModelName('Gemini 3.7 Flash');
            }}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
              selectedProvider === 'gemini'
                ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Gemini 3.7 Flash Cloud Engine</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                    Online / Connected
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  High-speed autonomous 3D agent reasoning, complex Three.js geometry synthesis, and depth estimation.
                </p>
              </div>
            </div>
            <input
              type="radio"
              checked={selectedProvider === 'gemini'}
              onChange={() => {}}
              className="mt-1 accent-indigo-500"
            />
          </div>

          {/* Ollama Option */}
          <div
            onClick={() => {
              onSelectProvider('ollama');
              if (probeResult?.ollama.models.length) {
                onSelectModelName(probeResult.ollama.models[0]);
              }
            }}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
              selectedProvider === 'ollama'
                ? 'bg-emerald-950/30 border-emerald-500 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Ollama Local Engine (localhost:11434)</span>
                  {probeResult?.ollama.available ? (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Detected ({probeResult.ollama.models.length} models)</span>
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      <span>Not detected</span>
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Supports Llama 3, Mistral, DeepSeek-R1, Qwen 2.5 Coder, Gemma, and local GGUFs.
                </p>

                {probeResult?.ollama.available && probeResult.ollama.models.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Select Model:</span>
                    <select
                      value={selectedModelName}
                      onChange={(e) => onSelectModelName(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {probeResult.ollama.models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            <input
              type="radio"
              checked={selectedProvider === 'ollama'}
              onChange={() => {}}
              className="mt-1 accent-emerald-500"
            />
          </div>

          {/* vLLM / LM Studio Options */}
          <div className="grid grid-cols-2 gap-3">
            {/* vLLM */}
            <div
              onClick={() => {
                onSelectProvider('vllm');
                if (probeResult?.vllm.models.length) {
                  onSelectModelName(probeResult.vllm.models[0]);
                }
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedProvider === 'vllm'
                  ? 'bg-cyan-950/30 border-cyan-500'
                  : 'bg-slate-950/40 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white">vLLM (localhost:8000)</span>
                {probeResult?.vllm.available ? (
                  <span className="text-[10px] text-emerald-400">Online</span>
                ) : (
                  <span className="text-[10px] text-slate-500">Offline</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">High-throughput GPU inference</p>
            </div>

            {/* LM Studio */}
            <div
              onClick={() => {
                onSelectProvider('lmstudio');
                if (probeResult?.lmstudio.models.length) {
                  onSelectModelName(probeResult.lmstudio.models[0]);
                }
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedProvider === 'lmstudio'
                  ? 'bg-cyan-950/30 border-cyan-500'
                  : 'bg-slate-950/40 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white">LM Studio (localhost:1234)</span>
                {probeResult?.lmstudio.available ? (
                  <span className="text-[10px] text-emerald-400">Online</span>
                ) : (
                  <span className="text-[10px] text-slate-500">Offline</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Local OpenAI compatible server</p>
            </div>
          </div>

          {/* Custom URL Endpoint Input */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <label className="block font-semibold text-slate-300 mb-1">Custom Local / Remote AI Server Endpoint</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="http://localhost:11434 or http://192.168.1.50:8000"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              />
              <button
                onClick={() => onRefreshProbe(customEndpoint)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
              >
                Test
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>Tip: Run <code className="text-cyan-400">ollama run llama3.2</code> in your terminal</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
};
