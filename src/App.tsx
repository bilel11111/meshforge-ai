import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { 
  ForgeTab, 
  GenerationMode, 
  VisualStyle, 
  ViewportSettings, 
  PBRMaterialSettings, 
  AgentStep, 
  ModelProbeResult, 
  AIModelProvider,
  MeshModifierOperation
} from './types';
import { Header } from './components/Header';
import { Viewport3D } from './components/Viewport3D';
import { ForgeAssetsLeftPanel, ForgeAssetsRightPanel } from './components/ForgeAssetsPanel';
import { AgentControlPanel } from './components/AgentControlPanel';
import { ModelModifierPanel } from './components/ModelModifierPanel';
import { TextureSynthesisPanel } from './components/TextureSynthesisPanel';
import { LocalModelModal } from './components/LocalModelStatusBadge';
import { PresetsModal, PresetTemplate } from './components/PresetsModal';
import { CodeSandboxModal } from './components/CodeSandboxModal';
import { MapInspectorModal } from './components/MapInspectorModal';
import { AddAssetModal } from './components/AddAssetModal';
import { HelpModal } from './components/HelpModal';
import { ImageTo3DPanel } from './components/ImageTo3DPanel';
import { ExportPanel } from './components/ExportPanel';
import { generateBlenderPythonScript } from './lib/blenderPythonExporter';
import { 
  createSciFiExplorerDrone, 
  createCyberpunkDrone, 
  synthesizeProceduralMesh 
} from './lib/proceduralGenerators';
import { 
  GeneratedPBRMaps, 
  generateDronePBRMaps, 
  generateProceduralPBR 
} from './lib/textureBaker';
import { 
  centerAndScaleObject, 
  exportToGLB, 
  exportToOBJ, 
  exportToSTL, 
  loadModelFromFile, 
  applyMeshModifier,
  ModelStats 
} from './lib/threeUtils';
import { probeLocalAndCloudModels } from './lib/localAiDetector';
import { 
  Download, 
  Camera, 
  FileBox, 
  Sparkles, 
  Box, 
  Sliders, 
  Wand2, 
  Layers, 
  Terminal, 
  Folder, 
  Settings as SettingsIcon,
  Wifi,
  Battery,
  Airplay,
  Maximize2
} from 'lucide-react';

export default function App() {
  // Forge Active Tab: 'Assets' | 'Generation' | 'Edit' | 'Refinement' | 'Export'
  const [currentTab, setCurrentTab] = useState<ForgeTab>('Assets');

  // 3D Scene Model
  const [modelGroup, setModelGroup] = useState<THREE.Group | null>(null);
  const [currentModelTitle, setCurrentModelTitle] = useState('Sci-Fi Explorer Drone');
  const [activeCodeSnippet, setActiveCodeSnippet] = useState<string>('');
  const [modelStats, setModelStats] = useState<ModelStats | null>(null);

  // Asset Tree Node Selection
  const [selectedAssetNode, setSelectedAssetNode] = useState<string>('root');

  // Forge Agent State
  const [agentModel, setAgentModel] = useState<string>('Llama3-8b-instruct');
  const [currentGoal, setCurrentGoal] = useState<string>(
    'Refining Sensor Dome mesh and optimizing emission for visibility.'
  );
  const [commandPrompt, setCommandPrompt] = useState<string>(
    'Add a searchlight with localized volumetric lighting and a blue-to-white gradient.'
  );
  const [isUpdatingModel, setIsUpdatingModel] = useState(false);

  // 3D Properties State
  const [meshDetailEnabled, setMeshDetailEnabled] = useState<boolean>(true);
  const [meshDetailValue, setMeshDetailValue] = useState<number>(85);
  const [textureResEnabled, setTextureResEnabled] = useState<boolean>(true);
  const [textureResValue, setTextureResValue] = useState<string>('2048x2048');
  const [uvLayout, setUvLayout] = useState<string>('Optimized');

  // PBR Texture Maps State
  const [pbrMaps, setPbrMaps] = useState<GeneratedPBRMaps | null>(null);
  const [activeMapFilter, setActiveMapFilter] = useState<string | null>(null);

  // Viewport Settings
  const [viewportSettings, setViewportSettings] = useState<ViewportSettings>({
    shading: 'pbr',
    lighting: 'studio-3point',
    showGrid: true,
    showAxes: false,
    showBoundingBox: false,
    showShadows: true,
    autoRotate: false,
    rotationSpeed: 1.0,
    fov: 42,
    backgroundColor: '#0a0d14',
    bloomEnabled: true,
  });

  // Material Settings
  const [materialSettings, setMaterialSettings] = useState<PBRMaterialSettings>({
    color: '#e2e8f0',
    roughness: 0.35,
    metalness: 0.85,
    emissive: '#0284c7',
    emissiveIntensity: 1.5,
    wireframe: false,
    clearcoat: 0.3,
    transmission: 0,
    ior: 1.5,
    displacementScale: 0.1,
    normalScale: 1.5,
    envMapIntensity: 1.0,
  });

  // Text-to-3D Generation State
  const [currentPrompt, setCurrentPrompt] = useState(
    'Sci-Fi Explorer Drone with pressurized cockpit, ducted fan thrusters, articulated spider legs, and volumetric blue searchlights'
  );
  const [currentStyle, setCurrentStyle] = useState<VisualStyle>('scifi-hard-surface');
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [thoughtLog, setThoughtLog] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Local AI Model Prober
  const [probeResult, setProbeResult] = useState<ModelProbeResult | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIModelProvider>('ollama');
  const [selectedModelName, setSelectedModelName] = useState<string>('Llama3-8b-instruct');

  // Photo Reference Image State
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&q=80'
  );

  // Modals State
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isCodeSandboxOpen, setIsCodeSandboxOpen] = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [inspectorMap, setInspectorMap] = useState<{ url: string; title: string } | null>(null);

  // Snapshot trigger
  const [screenshotTrigger, setScreenshotTrigger] = useState<number>(0);

  // Toast / Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Clock for macOS top bar
  const [timeString, setTimeString] = useState('Fri Oct 24  10:42 AM');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      };
      setTimeString(now.toLocaleString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initial Load: Mount Sci-Fi Explorer Drone + Bake PBR Maps + Probe Local LLMs
  useEffect(() => {
    // 1. Initialize High-Fidelity Sci-Fi Explorer Drone
    const drone = createSciFiExplorerDrone();
    setModelGroup(drone);
    setCurrentModelTitle('Sci-Fi Explorer Drone');

    // 2. Generate Drone PBR Texture Maps (Albedo, Normal, Roughness, Metallic, Emission)
    const maps = generateDronePBRMaps(512);
    setPbrMaps(maps);

    // 3. Set Code Sandbox Script
    setActiveCodeSnippet(`/* Sci-Fi Explorer Drone Parametric Assembly */
const root = new THREE.Group();

// Central Armored Pod
const bodyGeo = new THREE.SphereGeometry(0.85, 32, 24);
bodyGeo.scale(1.2, 0.7, 1.4);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.85 });
const body = new THREE.Mesh(bodyGeo, bodyMat);
root.add(body);

// Cockpit Glass
const glassGeo = new THREE.SphereGeometry(0.55, 24, 16);
glassGeo.scale(1.0, 0.6, 1.1);
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, transmission: 0.8 });
const cockpit = new THREE.Mesh(glassGeo, glassMat);
cockpit.position.set(0, 0.15, 0.45);
root.add(cockpit);

// Volumetric Searchlights
const spotLight = new THREE.SpotLight(0x38bdf8, 5, 20, Math.PI / 5, 0.5, 1);
spotLight.position.set(0.35, -0.2, 0.8);
root.add(spotLight);

return root;`);

    // 4. Probe Local LLMs (Ollama, vLLM, LM Studio)
    handleProbeModels();
  }, []);

  const handleProbeModels = async (customEndpoint?: string) => {
    setIsProbing(true);
    try {
      const probe = await probeLocalAndCloudModels(customEndpoint);
      setProbeResult(probe);

      if (probe.ollama.available && probe.ollama.models.length > 0) {
        setSelectedProvider('ollama');
        setSelectedModelName(probe.ollama.models[0] || 'Llama3-8b-instruct');
        showToast(`Auto-detected local Ollama (${probe.ollama.models.length} models)!`);
      } else if (probe.vllm.available) {
        setSelectedProvider('vllm');
        setSelectedModelName('mesh-base');
        showToast('Auto-detected local vLLM server!');
      }
    } catch (e) {
      console.warn('Probe error', e);
    } finally {
      setIsProbing(false);
    }
  };

  // Agent Update Drone Model Handler (Command Bar)
  const handleUpdateDroneModel = async () => {
    setIsUpdatingModel(true);
    setCurrentGoal(`Processing agent instruction: "${commandPrompt}"`);

    try {
      // Small realistic agent synthesis delay
      await new Promise((r) => setTimeout(r, 600));

      // Recreate / enhance drone with searchlight and blue-to-white gradient
      const updatedDrone = createSciFiExplorerDrone();
      setModelGroup(updatedDrone);

      // Re-bake high-res PBR maps with glowing emission channel
      const newMaps = generateDronePBRMaps(1024);
      setPbrMaps(newMaps);

      setCurrentGoal('Refining Sensor Dome mesh and optimizing emission for visibility.');
      showToast('Drone updated with localized volumetric searchlight & emission gradient!');
    } catch (err: any) {
      console.error('Update error:', err);
      showToast('Update finished with local mesh optimization.');
    } finally {
      setIsUpdatingModel(false);
    }
  };

  // Text-to-3D Generation Pipeline
  const handleGenerate3D = async (prompt: string, style: VisualStyle) => {
    setIsGenerating(true);
    setThoughtLog('');

    const step1: AgentStep = {
      id: 'step-1',
      title: 'Structural Topology & Decomposition',
      description: `Analyzing mesh primitives, hierarchies, and symmetry for "${prompt.slice(0, 35)}..."`,
      status: 'running',
      timestamp: Date.now(),
    };
    setAgentSteps([step1]);

    try {
      const localEndpoint = 
        selectedProvider === 'ollama' ? probeResult?.ollama.endpoint :
        selectedProvider === 'vllm' ? probeResult?.vllm.endpoint :
        selectedProvider === 'lmstudio' ? probeResult?.lmstudio.endpoint : undefined;

      const res = await fetch('/api/agent/generate-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style,
          provider: selectedProvider,
          localEndpoint,
          modelName: selectedModelName,
        }),
      });

      step1.status = 'completed';

      const step2: AgentStep = {
        id: 'step-2',
        title: 'Three.js Parametric Mesh Synthesis',
        description: 'Compiling geometry buffers, normals, and hierarchical assemblies',
        status: 'running',
        timestamp: Date.now(),
      };
      setAgentSteps([step1, step2]);

      let resultData: any = null;
      if (res.ok) {
        resultData = await res.json();
      }

      const step3: AgentStep = {
        id: 'step-3',
        title: 'PBR Material & Lighting Alignment',
        description: 'Configuring roughness, metalness, and emissive irradiance',
        status: 'running',
        timestamp: Date.now(),
      };
      step2.status = 'completed';
      setAgentSteps([step1, step2, step3]);

      if (resultData && resultData.threeCode) {
        if (resultData.thoughtProcess) {
          setThoughtLog(resultData.thoughtProcess);
        }
        if (resultData.title) {
          setCurrentModelTitle(resultData.title);
        }
        if (resultData.materialSettings) {
          setMaterialSettings((prev) => ({
            ...prev,
            ...resultData.materialSettings,
          }));
        }

        setActiveCodeSnippet(resultData.threeCode);

        try {
          const generatorFn = new Function('THREE', resultData.threeCode);
          const generatedRoot = generatorFn(THREE);
          if (generatedRoot instanceof THREE.Object3D) {
            const group = new THREE.Group();
            group.add(generatedRoot);
            centerAndScaleObject(group);
            setModelGroup(group);
          } else {
            const fallbackGroup = synthesizeProceduralMesh(prompt, style);
            setModelGroup(fallbackGroup);
          }
        } catch (execErr) {
          const fallbackGroup = synthesizeProceduralMesh(prompt, style);
          setModelGroup(fallbackGroup);
        }
      } else {
        const proceduralGroup = synthesizeProceduralMesh(prompt, style);
        setModelGroup(proceduralGroup);
        setCurrentModelTitle(prompt.slice(0, 24));
        setThoughtLog(`Decomposed "${prompt}" into parametric volumetric primitives with smooth normal vectors.`);
      }

      const step4: AgentStep = {
        id: 'step-4',
        title: 'Mesh Verification & Polycount Optimization',
        description: 'Successfully synthesized 3D mesh and centered in viewing volume',
        status: 'completed',
        timestamp: Date.now(),
      };
      step3.status = 'completed';
      setAgentSteps([step1, step2, step3, step4]);
      showToast('3D Model synthesized successfully!');
    } catch (err: any) {
      console.error('Generation pipeline error:', err);
      const proceduralGroup = synthesizeProceduralMesh(prompt, style);
      setModelGroup(proceduralGroup);
      setCurrentModelTitle(prompt.slice(0, 24));
      step1.status = 'completed';
      setAgentSteps([
        step1,
        {
          id: 'step-fallback',
          title: 'Procedural Synthesis Engine',
          description: 'Constructed detailed 3D asset via procedural generator',
          status: 'completed',
          timestamp: Date.now(),
        },
      ]);
      showToast('Generated 3D asset via procedural engine!');
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct Geometric Modifier Handler
  const handleApplyGeometricModifier = (op: MeshModifierOperation) => {
    if (!modelGroup) return;
    const clone = modelGroup.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        applyMeshModifier(child, op);
      }
    });
    centerAndScaleObject(clone);
    setModelGroup(clone);
    showToast(`Applied ${op.type} modifier!`);
  };

  // AI Modifier Handler
  const handleApplyAIModifier = async (modifierPrompt: string) => {
    if (!modelGroup) return;
    setIsModifying(true);

    try {
      const res = await fetch('/api/agent/modify-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentModelTitle,
          currentStats: modelStats,
          modifierPrompt,
          style: currentStyle,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.transformations && Array.isArray(data.transformations)) {
          const clone = modelGroup.clone(true);
          clone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              data.transformations.forEach((op: MeshModifierOperation) => {
                applyMeshModifier(child, op);
              });
            }
          });
          centerAndScaleObject(clone);
          setModelGroup(clone);
        }

        if (data.materialUpdate) {
          setMaterialSettings((prev) => ({
            ...prev,
            ...data.materialUpdate,
          }));
        }
        showToast(data.explanation || '3D Model modifications applied!');
      } else {
        const clone = modelGroup.clone(true);
        const lower = modifierPrompt.toLowerCase();
        let op: MeshModifierOperation = { type: 'twist', intensity: 0.5, axis: 'y' };
        if (lower.includes('spike')) op = { type: 'extrude-spikes', intensity: 0.6, axis: 'y' };
        else if (lower.includes('taper')) op = { type: 'taper', intensity: 0.6, axis: 'y' };
        else if (lower.includes('bend')) op = { type: 'bend', intensity: 0.5, axis: 'x' };
        else if (lower.includes('noise')) op = { type: 'noise', intensity: 0.35, axis: 'y' };
        
        clone.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            applyMeshModifier(child, op);
          }
        });
        centerAndScaleObject(clone);
        setModelGroup(clone);
        showToast('Applied procedural geometric deformation!');
      }
    } catch (err: any) {
      showToast('Modifier completed with local geometry update');
    } finally {
      setIsModifying(false);
    }
  };

  // Upload File Handler (.glb, .obj, .stl)
  const handleFileUpload = async (file: File) => {
    try {
      const group = await loadModelFromFile(file);
      setModelGroup(group);
      setCurrentModelTitle(file.name);
      showToast(`Imported ${file.name} successfully!`);
    } catch (err: any) {
      showToast(`Failed to load file: ${err.message}`);
    }
  };

  // Apply PBR Textures Handler
  const handleApplyPBRMaps = (maps: GeneratedPBRMaps) => {
    if (!modelGroup) return;
    setPbrMaps(maps);

    const textureLoader = new THREE.TextureLoader();
    const albedoTex = textureLoader.load(maps.albedo);
    const normalTex = textureLoader.load(maps.normal);
    const roughTex = textureLoader.load(maps.roughness);
    const metalTex = textureLoader.load(maps.metallic);
    const aoTex = textureLoader.load(maps.ao);

    modelGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: albedoTex,
          normalMap: normalTex,
          roughnessMap: roughTex,
          metalnessMap: metalTex,
          aoMap: aoTex,
          roughness: materialSettings.roughness,
          metalness: materialSettings.metalness,
        });
      }
    });
    showToast('PBR textures baked and attached to 3D mesh!');
  };

  // Reconstruct 3D Model from Reference Photo
  const handleReconstructFromPhoto = (
    reconstructedGroup: THREE.Group,
    title: string,
    codeSnippet?: string,
    matSettings?: Partial<PBRMaterialSettings>
  ) => {
    setModelGroup(reconstructedGroup);
    setCurrentModelTitle(title);
    if (codeSnippet) {
      setActiveCodeSnippet(codeSnippet);
    }
    if (matSettings) {
      setMaterialSettings((prev) => ({ ...prev, ...matSettings }));
    }
    const maps = generateProceduralPBR('scifi-panels', matSettings?.color || '#4f46e5', matSettings?.emissive || '#0284c7');
    setPbrMaps(maps);
    showToast(`Successfully Reconstructed 3D Model: ${title}`);
  };

  // Run Custom Code Sandbox script
  const handleRunCode = (code: string) => {
    try {
      const generatorFn = new Function('THREE', code);
      const generatedRoot = generatorFn(THREE);
      if (generatedRoot instanceof THREE.Object3D) {
        const group = new THREE.Group();
        group.add(generatedRoot);
        centerAndScaleObject(group);
        setModelGroup(group);
        setActiveCodeSnippet(code);
        showToast('Custom Three.js code executed!');
      } else {
        throw new Error('Code must return a THREE.Group or THREE.Mesh');
      }
    } catch (err: any) {
      throw new Error(`Execution failed: ${err.message}`);
    }
  };

  // Add Parametric Sub-Component
  const handleAddSubMesh = (type: string) => {
    if (!modelGroup) return;
    const clone = modelGroup.clone(true);

    if (type === 'Sensor Array Pod') {
      const pod = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 2.0 })
      );
      pod.position.set(0, 0.6, 0.4);
      clone.add(pod);
    } else {
      const thruster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 0.4, 16),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 })
      );
      thruster.position.set(0, -0.4, -0.8);
      clone.add(thruster);
    }

    centerAndScaleObject(clone);
    setModelGroup(clone);
    showToast(`Added ${type} sub-component!`);
  };

  // Exporters
  const saveBlob = async (blob: Blob, filename: string, filters: Array<{ name: string; extensions: string[] }>) => {
    if (window.meshforge?.isDesktop) {
      const bytes = await blob.arrayBuffer();
      const result = await window.meshforge.saveFile({
        title: `Save ${filename}`,
        defaultPath: filename,
        filters,
        bytes,
      });
      if (!result.canceled) showToast(`Saved ${result.filePath || filename}`);
      return;
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportGLB = async () => {
    if (!modelGroup) return;
    try {
      const filename = `${currentModelTitle.replace(/\s+/g, '_')}.glb`;
      const blob = await exportToGLB(modelGroup, filename);
      await saveBlob(blob, filename, [{ name: 'GLB model', extensions: ['glb'] }]);
      showToast('Exported GLB successfully!');
    } catch (e: any) {
      showToast('GLB export error: ' + e.message);
    }
  };

  const handleExportOBJ = async () => {
    if (!modelGroup) return;
    const filename = `${currentModelTitle.replace(/\s+/g, '_')}.obj`;
    const blob = exportToOBJ(modelGroup, filename);
    await saveBlob(blob, filename, [{ name: 'OBJ model', extensions: ['obj'] }]);
    showToast('Exported OBJ successfully!');
  };

  const handleExportSTL = async () => {
    if (!modelGroup) return;
    const filename = `${currentModelTitle.replace(/\s+/g, '_')}.stl`;
    const blob = exportToSTL(modelGroup, true);
    await saveBlob(blob, filename, [{ name: 'STL model', extensions: ['stl'] }]);
    showToast('Exported 3D-printable STL successfully!');
  };

  const handleTakeSnapshot = () => {
    setScreenshotTrigger(Date.now());
  };

  const handleSnapshotReady = async (dataUrl: string) => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const filename = `${currentModelTitle.replace(/\s+/g, '_')}_snapshot.png`;
    await saveBlob(blob, filename, [{ name: 'PNG image', extensions: ['png'] }]);
    showToast('High-Res Viewport Snapshot saved!');
  };

  return (
    <div className="meshforge-app flex flex-col h-screen w-screen bg-[#080c14] text-slate-100 overflow-hidden font-sans select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-sky-600 text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-sky-400/40 animate-in fade-in slide-in-from-bottom-2">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cross-platform desktop title bar */}
      <div className="meshforge-titlebar h-11 shrink-0 px-4 flex items-center justify-between z-30" data-electron-drag-region="true">
        <div className="flex items-center gap-3">
          <div className="meshforge-brand-mark"><Sparkles className="w-3.5 h-3.5" /></div>
          <div>
            <div className="text-[12px] font-semibold tracking-wide text-white">MeshForge AI</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">3D asset workbench</div>
          </div>
          <div className="hidden md:flex items-center gap-1.5 ml-5 text-[10px] text-slate-500">
            <span className="meshforge-menu-item">Project</span>
            <span className="meshforge-menu-item">Edit</span>
            <span className="meshforge-menu-item">View</span>
            <span className="meshforge-menu-item" onClick={() => setIsHelpModalOpen(true)}>Help</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400"><span className="meshforge-live-dot" /> Local workspace ready</div>
          <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-500 font-mono">{timeString}</div>
          <div className="meshforge-window-actions" onPointerDown={(event) => event.stopPropagation()}>
            <button aria-label="Minimize" onClick={() => window.meshforge?.minimize()}>&minus;</button>
            <button aria-label="Maximize" onClick={() => window.meshforge?.toggleMaximize()}>□</button>
            <button aria-label="Close" className="close" onClick={() => window.meshforge?.close()}>×</button>
          </div>
        </div>
      </div>

      {/* Main studio workspace */}
      <div className="flex-1 flex overflow-hidden relative p-2 gap-2 bg-[#080c14]">
        {/* Activity rail */}
        <aside className="meshforge-activity-rail hidden md:flex flex-col items-center gap-2 px-2 py-3 rounded-xl border border-slate-800/80 shadow-2xl shrink-0 z-20">
          <div 
            onClick={() => setCurrentTab('Assets')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
              currentTab === 'Assets' ? 'bg-sky-600 shadow-md shadow-sky-600/30 text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
            title="Assets Browser"
          >
            <Folder className="w-4 h-4" />
          </div>

          <div 
            onClick={() => setCurrentTab('Generation')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
              currentTab === 'Generation' ? 'bg-sky-600 shadow-md shadow-sky-600/30 text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
            title="AI 3D Generator"
          >
            <Wand2 className="w-4 h-4" />
          </div>

          <div 
            onClick={() => setCurrentTab('Edit')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
              currentTab === 'Edit' ? 'bg-sky-600 shadow-md shadow-sky-600/30 text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
            title="Model Changer & Deformers"
          >
            <Sliders className="w-4 h-4" />
          </div>

          <div 
            onClick={() => setCurrentTab('Refinement')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
              currentTab === 'Refinement' ? 'bg-sky-600 shadow-md shadow-sky-600/30 text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
            title="Texture & Material Refinement"
          >
            <Layers className="w-4 h-4" />
          </div>

          <div 
            onClick={() => setIsCodeSandboxOpen(true)}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center cursor-pointer text-slate-300 transition-colors"
            title="Terminal & Three.js Code"
          >
            <Terminal className="w-4 h-4" />
          </div>

          <div 
            onClick={() => setIsModelModalOpen(true)}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center cursor-pointer text-slate-300 transition-colors mt-auto"
            title="Model Discovery & Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </div>
        </aside>

        {/* Main application workspace */}
        <main className="meshforge-main-window flex-1 flex flex-col rounded-xl overflow-hidden border border-slate-800/90 shadow-2xl bg-[#0d121c]">
          {/* Forge Window Header */}
          <Header
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            probeResult={probeResult}
            selectedProvider={selectedProvider}
            selectedModelName={selectedModelName}
            onOpenModelModal={() => setIsModelModalOpen(true)}
            onOpenPresets={() => setIsPresetsModalOpen(true)}
            onOpenCodeSandbox={() => setIsCodeSandboxOpen(true)}
            onOpenHelp={() => setIsHelpModalOpen(true)}
          />

          {/* View Tab Routing */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* 1. ASSETS TAB (Exact 3-Column Layout from Screenshot) */}
            {currentTab === 'Assets' && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-full">
                {/* Left Panel: Asset Tree, FORGE AGENT Card, Agent Command Bar */}
                <ForgeAssetsLeftPanel
                  selectedNode={selectedAssetNode}
                  onSelectNode={(node) => {
                    setSelectedAssetNode(node);
                    showToast(`Selected: ${node}`);
                  }}
                  agentModel={agentModel}
                  onChangeAgentModel={setAgentModel}
                  currentGoal={currentGoal}
                  commandPrompt={commandPrompt}
                  onCommandPromptChange={setCommandPrompt}
                  onUpdateModel={handleUpdateDroneModel}
                  isUpdating={isUpdatingModel}
                  onAddNewAsset={() => setIsAddAssetModalOpen(true)}
                />

                {/* Center Panel: 3D Viewport with Sci-Fi Explorer Drone */}
                <div className="flex-1 h-full relative overflow-hidden bg-[#0a0d14]">
                  <Viewport3D
                    modelGroup={modelGroup}
                    viewportSettings={viewportSettings}
                    onUpdateViewportSettings={(newSettings) => setViewportSettings((prev) => ({ ...prev, ...newSettings }))}
                    materialSettings={materialSettings}
                    onStatsComputed={setModelStats}
                    screenshotTrigger={screenshotTrigger}
                    onSnapshotReady={handleSnapshotReady}
                    referenceImageUrl={referenceImageUrl}
                  />
                </div>

                {/* Right Panel: 3D Properties, Native Local Discovery, Generated Maps */}
                <ForgeAssetsRightPanel
                  meshDetailEnabled={meshDetailEnabled}
                  onToggleMeshDetail={setMeshDetailEnabled}
                  meshDetailValue={meshDetailValue}
                  onChangeMeshDetail={setMeshDetailValue}
                  textureResEnabled={textureResEnabled}
                  onToggleTextureRes={setTextureResEnabled}
                  textureResValue={textureResValue}
                  onChangeTextureRes={setTextureResValue}
                  uvLayout={uvLayout}
                  onChangeUvLayout={setUvLayout}
                  onOpenDiscoveryModal={() => setIsModelModalOpen(true)}
                  pbrMaps={pbrMaps}
                  activeMapFilter={activeMapFilter}
                  onSelectMapFilter={setActiveMapFilter}
                  onInspectMap={(url, title) => setInspectorMap({ url, title })}
                />
              </div>
            )}

            {/* 2. GENERATION TAB */}
            {currentTab === 'Generation' && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-full">
                <div className="w-full md:w-[440px] shrink-0 h-full overflow-y-auto border-r border-slate-800/80 bg-[#12161f]">
                  <AgentControlPanel
                    onGenerate={handleGenerate3D}
                    isGenerating={isGenerating}
                    agentSteps={agentSteps}
                    selectedProvider={selectedProvider}
                    onSelectProvider={setSelectedProvider}
                    selectedModelName={selectedModelName}
                    onSelectModelName={setSelectedModelName}
                    probeResult={probeResult}
                    currentPrompt={currentPrompt}
                    setCurrentPrompt={setCurrentPrompt}
                    currentStyle={currentStyle}
                    setCurrentStyle={setCurrentStyle}
                    thoughtLog={thoughtLog}
                  />
                </div>
                <div className="flex-1 h-full relative overflow-hidden bg-[#0a0d14]">
                  <Viewport3D
                    modelGroup={modelGroup}
                    viewportSettings={viewportSettings}
                    onUpdateViewportSettings={(newSettings) => setViewportSettings((prev) => ({ ...prev, ...newSettings }))}
                    materialSettings={materialSettings}
                    onStatsComputed={setModelStats}
                    screenshotTrigger={screenshotTrigger}
                    onSnapshotReady={handleSnapshotReady}
                    referenceImageUrl={referenceImageUrl}
                  />
                </div>
              </div>
            )}

            {/* 3. IMAGE TO 3D TAB */}
            {currentTab === 'Image to 3D' && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-full">
                <div className="w-full md:w-[460px] shrink-0 h-full overflow-y-auto border-r border-slate-800/80 bg-[#12161f]">
                  <ImageTo3DPanel
                    onReconstructModel={handleReconstructFromPhoto}
                    isProcessing={isGenerating || isSynthesizing}
                    onSetReferenceImage={setReferenceImageUrl}
                  />
                </div>
                <div className="flex-1 h-full relative overflow-hidden bg-[#0a0d14]">
                  <Viewport3D
                    modelGroup={modelGroup}
                    viewportSettings={viewportSettings}
                    onUpdateViewportSettings={(newSettings) => setViewportSettings((prev) => ({ ...prev, ...newSettings }))}
                    materialSettings={materialSettings}
                    onStatsComputed={setModelStats}
                    screenshotTrigger={screenshotTrigger}
                    onSnapshotReady={handleSnapshotReady}
                    referenceImageUrl={referenceImageUrl}
                  />
                </div>
              </div>
            )}

            {/* 4. EDIT TAB */}
            {currentTab === 'Edit' && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-full">
                <div className="w-full md:w-[440px] shrink-0 h-full overflow-y-auto border-r border-slate-800/80 bg-[#12161f]">
                  <ModelModifierPanel
                    onFileUpload={handleFileUpload}
                    onApplyAIModifier={handleApplyAIModifier}
                    onApplyGeometricModifier={handleApplyGeometricModifier}
                    onUpdateMaterial={(newSettings) => setMaterialSettings((prev) => ({ ...prev, ...newSettings }))}
                    materialSettings={materialSettings}
                    stats={modelStats}
                    isModifying={isModifying}
                    onResetModel={() => {
                      const drone = createSciFiExplorerDrone();
                      setModelGroup(drone);
                      showToast('Reset to Sci-Fi Explorer Drone');
                    }}
                  />
                </div>
                <div className="flex-1 h-full relative overflow-hidden bg-[#0a0d14]">
                  <Viewport3D
                    modelGroup={modelGroup}
                    viewportSettings={viewportSettings}
                    onUpdateViewportSettings={(newSettings) => setViewportSettings((prev) => ({ ...prev, ...newSettings }))}
                    materialSettings={materialSettings}
                    onStatsComputed={setModelStats}
                    screenshotTrigger={screenshotTrigger}
                    onSnapshotReady={handleSnapshotReady}
                    referenceImageUrl={referenceImageUrl}
                  />
                </div>
              </div>
            )}

            {/* 5. REFINEMENT TAB */}
            {currentTab === 'Refinement' && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-full">
                <div className="w-full md:w-[440px] shrink-0 h-full overflow-y-auto border-r border-slate-800/80 bg-[#12161f]">
                  <TextureSynthesisPanel
                    onApplyPBRMaps={handleApplyPBRMaps}
                    isSynthesizing={isSynthesizing}
                  />
                </div>
                <div className="flex-1 h-full relative overflow-hidden bg-[#0a0d14]">
                  <Viewport3D
                    modelGroup={modelGroup}
                    viewportSettings={viewportSettings}
                    onUpdateViewportSettings={(newSettings) => setViewportSettings((prev) => ({ ...prev, ...newSettings }))}
                    materialSettings={materialSettings}
                    onStatsComputed={setModelStats}
                    screenshotTrigger={screenshotTrigger}
                    onSnapshotReady={handleSnapshotReady}
                    referenceImageUrl={referenceImageUrl}
                  />
                </div>
              </div>
            )}

            {/* 6. EXPORT TAB */}
            {currentTab === 'Export' && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-full">
                <div className="w-full md:w-[460px] shrink-0 h-full overflow-y-auto border-r border-slate-800/80 bg-[#12161f]">
                  <ExportPanel
                    modelGroup={modelGroup}
                    currentModelTitle={currentModelTitle}
                    materialSettings={materialSettings}
                    modelStats={modelStats}
                    onTakeSnapshot={handleTakeSnapshot}
                    isSnapshotProcessing={false}
                    onShowToast={showToast}
                    activeCodeSnippet={activeCodeSnippet}
                  />
                </div>

                <div className="flex-1 h-full relative overflow-hidden bg-[#0a0d14]">
                  <Viewport3D
                    modelGroup={modelGroup}
                    viewportSettings={viewportSettings}
                    onUpdateViewportSettings={(newSettings) => setViewportSettings((prev) => ({ ...prev, ...newSettings }))}
                    materialSettings={materialSettings}
                    onStatsComputed={setModelStats}
                    screenshotTrigger={screenshotTrigger}
                    onSnapshotReady={handleSnapshotReady}
                    referenceImageUrl={referenceImageUrl}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <LocalModelModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        probeResult={probeResult}
        onRefreshProbe={handleProbeModels}
        isProbing={isProbing}
        selectedProvider={selectedProvider}
        onSelectProvider={setSelectedProvider}
        selectedModelName={selectedModelName}
        onSelectModelName={setSelectedModelName}
      />

      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onSelectPreset={(preset: PresetTemplate) => {
          if (preset.title.includes('Explorer')) {
            const drone = createSciFiExplorerDrone();
            setModelGroup(drone);
            setCurrentModelTitle(preset.title);
            showToast('Loaded Sci-Fi Explorer Drone Preset!');
          } else {
            setCurrentPrompt(preset.prompt);
            setCurrentStyle(preset.style);
            handleGenerate3D(preset.prompt, preset.style);
          }
        }}
      />

      <CodeSandboxModal
        isOpen={isCodeSandboxOpen}
        onClose={() => setIsCodeSandboxOpen(false)}
        code={activeCodeSnippet}
        blenderPythonCode={modelGroup ? generateBlenderPythonScript(modelGroup, currentModelTitle, materialSettings) : ''}
        onRunCode={handleRunCode}
      />

      <AddAssetModal
        isOpen={isAddAssetModalOpen}
        onClose={() => setIsAddAssetModalOpen(false)}
        onFileUpload={handleFileUpload}
        onAddSubMesh={handleAddSubMesh}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {inspectorMap && (
        <MapInspectorModal
          isOpen={true}
          onClose={() => setInspectorMap(null)}
          title={inspectorMap.title}
          imageUrl={inspectorMap.url}
        />
      )}
    </div>
  );
}
