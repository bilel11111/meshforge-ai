export type AIModelProvider = 'gemini' | 'ollama' | 'vllm' | 'lmstudio' | 'localai' | 'custom';

export interface LocalModelInfo {
  name: string;
  provider: AIModelProvider;
  size?: string;
  quantization?: string;
  isAvailable: boolean;
  endpoint: string;
  details?: string;
}

export interface ModelProbeResult {
  ollama: { available: boolean; models: string[]; endpoint: string; error?: string };
  vllm: { available: boolean; models: string[]; endpoint: string; error?: string };
  lmstudio: { available: boolean; models: string[]; endpoint: string; error?: string };
  custom: { available: boolean; models: string[]; endpoint: string; error?: string };
  geminiAvailable: boolean;
}

export type ForgeTab = 'Assets' | 'Generation' | 'Image to 3D' | 'Edit' | 'Refinement' | 'Export';

export interface ImageTo3DConfig {
  precisionMode: 'parametric-assembly' | 'photometric-relief' | 'voxel-contour';
  detailLevel: 'balanced' | 'high' | 'ultra';
  symmetry: 'bilateral-x' | 'radial' | 'none';
  style: VisualStyle;
  displacementScale: number;
  gridResolution: number;
  preserveFeatures: boolean;
  extractPBR: boolean;
  userPromptNotes?: string;
}

export interface ImageTo3DVisionAnalysis {
  detectedSubject: string;
  symmetryType: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  emissiveColor?: string;
  dominantMaterials: string[];
  keyFeatures: string[];
}

export interface ImageTo3DResult {
  title: string;
  objectCategory?: string;
  visionAnalysis?: ImageTo3DVisionAnalysis;
  polyCountEstimate?: number;
  depthExtrusionScale?: number;
  colorPalette?: string[];
  materialSettings?: Partial<PBRMaterialSettings>;
  threeCode?: string;
}

export type GenerationMode = 'text-to-3d' | 'modify-3d' | 'image-to-3d' | 'texture-synthesis' | 'code-sandbox';

export type VisualStyle = 
  | 'pbr-realistic'
  | 'scifi-hard-surface'
  | 'lowpoly-stylized'
  | 'cyberpunk-neon'
  | 'organic-sculpt'
  | 'voxel-art'
  | 'architectural'
  | 'fantasy-rpg'
  | 'industrial-cad';

export type ViewportShading = 
  | 'pbr'
  | 'wireframe'
  | 'wireframe-overlay'
  | 'normals'
  | 'matcap-clay'
  | 'depth'
  | 'xray'
  | 'uv-grid';

export type LightingPreset = 
  | 'studio-3point'
  | 'cyberpunk-neon'
  | 'sunset-golden'
  | 'soft-dome'
  | 'high-contrast'
  | 'clean-flat';

export interface PBRMaterialSettings {
  color: string;
  roughness: number;
  metalness: number;
  emissive: string;
  emissiveIntensity: number;
  wireframe: boolean;
  clearcoat: number;
  transmission: number;
  ior: number;
  displacementScale: number;
  normalScale: number;
  envMapIntensity: number;
  albedoMapUrl?: string;
  normalMapUrl?: string;
  roughnessMapUrl?: string;
  metallicMapUrl?: string;
  displacementMapUrl?: string;
  aoMapUrl?: string;
}

export interface AgentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: number;
  logs?: string[];
  data?: any;
}

export interface GenerationHistoryItem {
  id: string;
  title: string;
  prompt: string;
  mode: GenerationMode;
  style: VisualStyle;
  polyCount: number;
  vertexCount: number;
  timestamp: number;
  thumbnailUrl?: string;
  codeSnippet?: string;
  materialSettings?: PBRMaterialSettings;
}

export interface MeshModifierOperation {
  type: 'twist' | 'taper' | 'bend' | 'noise' | 'subdivide' | 'decimate' | 'spherify' | 'extrude-spikes' | 'boolean-cut' | 'bevel';
  intensity: number;
  axis: 'x' | 'y' | 'z';
  smoothness?: number;
}

export interface ViewportSettings {
  shading: ViewportShading;
  lighting: LightingPreset;
  showGrid: boolean;
  showAxes: boolean;
  showBoundingBox: boolean;
  showShadows: boolean;
  autoRotate: boolean;
  rotationSpeed: number;
  fov: number;
  backgroundColor: string;
  bloomEnabled: boolean;
}
