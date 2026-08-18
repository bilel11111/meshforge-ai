import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  ViewportSettings, 
  ViewportShading, 
  LightingPreset, 
  PBRMaterialSettings 
} from '../types';
import { 
  Rotate3d, 
  Grid, 
  Sun, 
  Eye, 
  Maximize2, 
  Sparkles, 
  Box, 
  Layers, 
  RefreshCcw, 
  Sliders, 
  Compass, 
  Focus
} from 'lucide-react';
import { computeModelStats, ModelStats } from '../lib/threeUtils';

interface Viewport3DProps {
  modelGroup: THREE.Group | null;
  viewportSettings: ViewportSettings;
  onUpdateViewportSettings: (settings: Partial<ViewportSettings>) => void;
  materialSettings: PBRMaterialSettings;
  onStatsComputed?: (stats: ModelStats) => void;
  screenshotTrigger?: number;
  onSnapshotReady?: (dataUrl: string) => void;
  referenceImageUrl?: string | null;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  modelGroup,
  viewportSettings,
  onUpdateViewportSettings,
  materialSettings,
  onStatsComputed,
  screenshotTrigger,
  onSnapshotReady,
  referenceImageUrl,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelHolderRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const bboxHelperRef = useRef<THREE.BoxHelper | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);

  const [stats, setStats] = useState<ModelStats | null>(null);
  const [showReferenceOverlay, setShowReferenceOverlay] = useState(false);
  const [referenceOpacity, setReferenceOpacity] = useState(0.85);
  const [pipPosition, setPipPosition] = useState<'bottom-right' | 'top-left' | 'overlay'>('bottom-right');

  // Setup Three.js scene once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(viewportSettings.backgroundColor || '#090d16');
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(viewportSettings.fov || 45, width / height, 0.1, 1000);
    camera.position.set(4, 3, 5);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and shadow maps
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    containerRef.current.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 20;
    controls.minDistance = 0.5;
    controlsRef.current = controls;

    // 5. Lights Group
    const lightsGroup = new THREE.Group();
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    // 6. Floor Shadow Receiver & Grid
    const grid = new THREE.GridHelper(10, 20, 0x4f46e5, 0x1e293b);
    grid.position.y = -1.5;
    scene.add(grid);
    gridHelperRef.current = grid;

    const shadowPlaneGeo = new THREE.PlaneGeometry(15, 15);
    shadowPlaneGeo.rotateX(-Math.PI / 2);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.position.y = -1.5;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 7. Model Holder
    const modelHolder = new THREE.Group();
    scene.add(modelHolder);
    modelHolderRef.current = modelHolder;

    // 8. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (modelHolderRef.current) {
        if (viewportSettings.autoRotate) {
          modelHolderRef.current.rotation.y += 0.004 * viewportSettings.rotationSpeed;
        }

        // Animate rotor blades
        modelHolderRef.current.traverse((child) => {
          if (child.name && (child.name.startsWith('Rotor_Blades') || child.name.startsWith('RotorBlade'))) {
            child.rotation.y += 0.35;
          }
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      if (newWidth > 0 && newHeight > 0 && cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = newWidth / newHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newWidth, newHeight);
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update Background color
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(viewportSettings.backgroundColor || '#090d16');
    }
  }, [viewportSettings.backgroundColor]);

  // Update Grid & Bounding Box visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = viewportSettings.showGrid;
    }
    if (bboxHelperRef.current) {
      bboxHelperRef.current.visible = viewportSettings.showBoundingBox;
    }
  }, [viewportSettings.showGrid, viewportSettings.showBoundingBox]);

  // Update Lighting Preset
  useEffect(() => {
    const lightsGroup = lightsGroupRef.current;
    if (!lightsGroup) return;

    // Clear previous lights
    while (lightsGroup.children.length > 0) {
      const l = lightsGroup.children[0];
      lightsGroup.remove(l);
    }

    const preset = viewportSettings.lighting;

    if (preset === 'studio-3point') {
      // Key Light
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
      keyLight.position.set(4, 5, 4);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0001;
      lightsGroup.add(keyLight);

      // Fill Light
      const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.2);
      fillLight.position.set(-4, 3, 2);
      lightsGroup.add(fillLight);

      // Rim Light
      const rimLight = new THREE.DirectionalLight(0xa5b4fc, 2.0);
      rimLight.position.set(0, 4, -5);
      lightsGroup.add(rimLight);

      // Ambient
      const ambient = new THREE.AmbientLight(0x1e293b, 0.8);
      lightsGroup.add(ambient);
    } else if (preset === 'cyberpunk-neon') {
      const cyanKey = new THREE.DirectionalLight(0x06b6d4, 3.0);
      cyanKey.position.set(4, 4, 3);
      cyanKey.castShadow = true;
      lightsGroup.add(cyanKey);

      const magentaRim = new THREE.DirectionalLight(0xec4899, 3.2);
      magentaRim.position.set(-4, 3, -4);
      lightsGroup.add(magentaRim);

      const ambient = new THREE.AmbientLight(0x0f172a, 1.2);
      lightsGroup.add(ambient);
    } else if (preset === 'sunset-golden') {
      const sun = new THREE.DirectionalLight(0xf59e0b, 3.5);
      sun.position.set(5, 3, 4);
      sun.castShadow = true;
      lightsGroup.add(sun);

      const skyFill = new THREE.DirectionalLight(0x38bdf8, 1.0);
      skyFill.position.set(-3, 4, -2);
      lightsGroup.add(skyFill);

      const ambient = new THREE.AmbientLight(0x451a03, 0.6);
      lightsGroup.add(ambient);
    } else if (preset === 'soft-dome') {
      const hemi = new THREE.HemisphereLight(0xffffff, 0x334155, 2.5);
      lightsGroup.add(hemi);
      const dir = new THREE.DirectionalLight(0xffffff, 1.0);
      dir.position.set(2, 6, 2);
      dir.castShadow = true;
      lightsGroup.add(dir);
    } else {
      const amb = new THREE.AmbientLight(0xffffff, 2.0);
      lightsGroup.add(amb);
      const dir = new THREE.DirectionalLight(0xffffff, 1.5);
      dir.position.set(3, 4, 3);
      lightsGroup.add(dir);
    }
  }, [viewportSettings.lighting]);

  // Update Model in Holder and apply shading
  useEffect(() => {
    const holder = modelHolderRef.current;
    const scene = sceneRef.current;
    if (!holder || !scene) return;

    // Clear old model & bounding box
    while (holder.children.length > 0) {
      const c = holder.children[0];
      holder.remove(c);
    }
    if (bboxHelperRef.current) {
      scene.remove(bboxHelperRef.current);
      bboxHelperRef.current = null;
    }

    if (modelGroup) {
      const clone = modelGroup.clone(true);
      holder.add(clone);

      // Compute statistics
      const computed = computeModelStats(clone);
      setStats(computed);
      if (onStatsComputed) {
        onStatsComputed(computed);
      }

      // Add Bounding Box Helper
      const bbox = new THREE.BoxHelper(clone, 0x38bdf8);
      bbox.visible = viewportSettings.showBoundingBox;
      scene.add(bbox);
      bboxHelperRef.current = bbox;

      // Apply Shading mode
      applyShadingMode(clone, viewportSettings.shading, materialSettings);
    } else {
      setStats(null);
    }
  }, [modelGroup, viewportSettings.shading, materialSettings]);

  // Helper apply shading modes
  const applyShadingMode = (
    root: THREE.Object3D,
    mode: ViewportShading,
    matSettings: PBRMaterialSettings
  ) => {
    root.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (mode === 'wireframe') {
          child.material = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            wireframe: true,
          });
        } else if (mode === 'normals') {
          child.material = new THREE.MeshNormalMaterial();
        } else if (mode === 'matcap-clay') {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xd4a373,
            roughness: 0.65,
            metalness: 0.1,
          });
        } else if (mode === 'depth') {
          child.material = new THREE.MeshDepthMaterial();
        } else if (mode === 'xray') {
          child.material = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            wireframe: true,
            transparent: true,
            opacity: 0.6,
          });
        } else if (mode === 'uv-grid') {
          // Checkerboard pattern
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const ctx = canvas.getContext('2d')!;
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#334155';
              ctx.fillRect(c * 16, r * 16, 16, 16);
            }
          }
          const texture = new THREE.CanvasTexture(canvas);
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(4, 4);
          child.material = new THREE.MeshBasicMaterial({ map: texture });
        } else {
          // Standard PBR
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(matSettings.color),
            roughness: matSettings.roughness,
            metalness: matSettings.metalness,
            emissive: new THREE.Color(matSettings.emissive),
            emissiveIntensity: matSettings.emissiveIntensity,
            wireframe: matSettings.wireframe,
          });
          child.material = mat;
        }
      }
    });
  };

  // Handle Snapshot screenshot
  useEffect(() => {
    if (screenshotTrigger && rendererRef.current && onSnapshotReady) {
      const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
      onSnapshotReady(dataUrl);
    }
  }, [screenshotTrigger, onSnapshotReady]);

  // Camera presets
  const setCameraView = (view: 'iso' | 'front' | 'top' | 'side') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const dist = 6;
    if (view === 'iso') {
      cameraRef.current.position.set(dist * 0.7, dist * 0.6, dist * 0.7);
    } else if (view === 'front') {
      cameraRef.current.position.set(0, 0, dist);
    } else if (view === 'top') {
      cameraRef.current.position.set(0, dist, 0.001);
    } else if (view === 'side') {
      cameraRef.current.position.set(dist, 0, 0);
    }
    controlsRef.current.target.set(0, 0, 0);
    cameraRef.current.lookAt(0, 0, 0);
    controlsRef.current.update();
  };

  return (
    <div className="relative w-full h-full bg-[#0a0d14] overflow-hidden select-none flex flex-col">
      {/* 3D Viewport Header Tag */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="font-semibold text-slate-200 text-xs px-2.5 py-1 rounded-md bg-[#161a24]/90 border border-slate-800/80 shadow-md backdrop-blur-sm">
          3D Viewport
        </span>
      </div>

      {/* 3D Canvas WebGL Container */}
      <div id="viewport-webgl-canvas" ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Top-Right View Controls HUD (Unified Single Bar) */}
      <div className="absolute top-3 right-3 z-10 flex flex-wrap items-center gap-2 bg-[#161a24]/90 backdrop-blur-md px-2 py-1.5 rounded-xl border border-slate-800/80 shadow-2xl">
        {/* Shading Selector */}
        <select
          id="select-viewport-shading"
          value={viewportSettings.shading}
          onChange={(e) => onUpdateViewportSettings({ shading: e.target.value as ViewportShading })}
          className="bg-slate-900/90 text-slate-300 text-[11px] font-medium px-2 py-1 rounded-lg border border-slate-700/60 focus:outline-none cursor-pointer"
        >
          <option value="pbr">PBR Shaded</option>
          <option value="wireframe">Wireframe</option>
          <option value="normals">Normals</option>
          <option value="matcap-clay">Clay / MatCap</option>
          <option value="uv-grid">UV Grid</option>
          <option value="xray">X-Ray</option>
        </select>

        {/* Auto Rotate Toggle */}
        <button
          id="btn-toggle-autorotate"
          onClick={() => onUpdateViewportSettings({ autoRotate: !viewportSettings.autoRotate })}
          className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
            viewportSettings.autoRotate
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Toggle Turntable Rotation"
        >
          <Rotate3d className={`w-3.5 h-3.5 ${viewportSettings.autoRotate ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Turntable</span>
        </button>

        {/* Grid Toggle */}
        <button
          id="btn-toggle-grid"
          onClick={() => onUpdateViewportSettings({ showGrid: !viewportSettings.showGrid })}
          className={`p-1.5 rounded-lg transition-colors ${
            viewportSettings.showGrid ? 'text-sky-400 bg-sky-500/15 border border-sky-500/30' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
          title="Toggle Floor Grid"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Reference Photo Toggle (if available) */}
        {referenceImageUrl && (
          <button
            id="btn-toggle-reference-photo"
            onClick={() => setShowReferenceOverlay(!showReferenceOverlay)}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${
              showReferenceOverlay
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm'
                : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/60'
            }`}
            title="Toggle Reference Photo PIP/Overlay"
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>Ref Photo</span>
          </button>
        )}

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        {/* Camera Views */}
        <div className="flex items-center gap-1">
          {(['iso', 'front', 'top', 'side'] as const).map((view) => (
            <button
              key={view}
              id={`btn-view-${view}`}
              onClick={() => setCameraView(view)}
              className="px-1.5 py-0.5 text-[10.5px] font-mono uppercase font-semibold rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Reference Photo Picture-in-Picture / Translucent Overlay HUD */}
      {showReferenceOverlay && referenceImageUrl && (
        <div className="absolute bottom-4 right-4 z-20 w-52 sm:w-64 bg-slate-900/95 backdrop-blur-md rounded-xl border border-purple-500/40 shadow-2xl p-2.5 flex flex-col gap-2 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Reference Photo PIP</span>
            </span>
            <button
              onClick={() => setShowReferenceOverlay(false)}
              className="text-[10px] text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-800 bg-black">
            <img
              src={referenceImageUrl}
              alt="Reference"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Compare 3D model with reference photo</span>
          </div>
        </div>
      )}

      {/* Floating Bottom-Left Model Stats HUD */}
      {stats && (
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-800/90 shadow-2xl text-[11px] text-slate-300">
          <div className="flex items-center justify-between gap-4 mb-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Focus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mesh Geometry HUD</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              3D Live
            </span>
          </div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 font-mono text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            <div>
              <span className="text-slate-500">Polys: </span>
              <span className="text-slate-200 font-semibold">{stats.triangles.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500">Verts: </span>
              <span className="text-slate-200 font-semibold">{stats.vertices.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500">Meshes: </span>
              <span className="text-slate-200 font-semibold">{stats.meshCount}</span>
            </div>
            <div className="col-span-3 text-slate-400">
              <span className="text-slate-500">Bounds (X,Y,Z): </span>
              <span className="text-cyan-300">{stats.dimensions.x}m × {stats.dimensions.y}m × {stats.dimensions.z}m</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
