import { ModelProbeResult, LocalModelInfo } from '../types';

export async function probeLocalAndCloudModels(customEndpoint?: string): Promise<ModelProbeResult> {
  try {
    const res = await fetch('/api/local-models/probe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customEndpoint }),
    });

    if (!res.ok) {
      throw new Error(`Probe failed with status ${res.status}`);
    }

    const data: ModelProbeResult = await res.json();
    return data;
  } catch (err: any) {
    console.warn('Probe error:', err);
    return {
      ollama: { available: false, models: [], endpoint: 'http://localhost:11434', error: err.message },
      vllm: { available: false, models: [], endpoint: 'http://localhost:8000', error: err.message },
      lmstudio: { available: false, models: [], endpoint: 'http://localhost:1234', error: err.message },
      custom: { available: false, models: [], endpoint: customEndpoint || '', error: 'Unreachable' },
      geminiAvailable: true,
    };
  }
}

export function extractAvailableModelList(probe: ModelProbeResult): LocalModelInfo[] {
  const models: LocalModelInfo[] = [];

  // Cloud Gemini
  if (probe.geminiAvailable) {
    models.push({
      name: 'Gemini 3.7 Flash (Cloud Engine)',
      provider: 'gemini',
      size: 'Cloud Hyper-Scale',
      isAvailable: true,
      endpoint: '/api/agent/generate-3d',
      details: 'Fastest 3D Agent reasoning, Three.js script synthesis & multi-modal depth reasoning',
    });
  }

  // Ollama
  if (probe.ollama.available && probe.ollama.models.length > 0) {
    probe.ollama.models.forEach((m) => {
      models.push({
        name: `${m} (Ollama)`,
        provider: 'ollama',
        size: 'Local',
        isAvailable: true,
        endpoint: probe.ollama.endpoint,
        details: 'Ollama local inference server',
      });
    });
  } else {
    models.push({
      name: 'Ollama (localhost:11434)',
      provider: 'ollama',
      size: 'Offline',
      isAvailable: false,
      endpoint: 'http://localhost:11434',
      details: 'Start with: ollama serve',
    });
  }

  // vLLM
  if (probe.vllm.available && probe.vllm.models.length > 0) {
    probe.vllm.models.forEach((m) => {
      models.push({
        name: `${m} (vLLM)`,
        provider: 'vllm',
        size: 'Local / GPU',
        isAvailable: true,
        endpoint: probe.vllm.endpoint,
        details: 'vLLM high-throughput local engine',
      });
    });
  } else {
    models.push({
      name: 'vLLM (localhost:8000)',
      provider: 'vllm',
      size: 'Offline',
      isAvailable: false,
      endpoint: 'http://localhost:8000',
      details: 'Start with: python -m vllm.entrypoints.openai.api_server',
    });
  }

  // LM Studio
  if (probe.lmstudio.available && probe.lmstudio.models.length > 0) {
    probe.lmstudio.models.forEach((m) => {
      models.push({
        name: `${m} (LM Studio)`,
        provider: 'lmstudio',
        size: 'Local',
        isAvailable: true,
        endpoint: probe.lmstudio.endpoint,
        details: 'LM Studio OpenAI-compatible local server',
      });
    });
  } else {
    models.push({
      name: 'LM Studio (localhost:1234)',
      provider: 'lmstudio',
      size: 'Offline',
      isAvailable: false,
      endpoint: 'http://localhost:1234',
      details: 'Enable Local Server in LM Studio (port 1234)',
    });
  }

  return models;
}
