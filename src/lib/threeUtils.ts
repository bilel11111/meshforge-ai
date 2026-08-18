import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { MeshModifierOperation, PBRMaterialSettings } from '../types';

export interface ModelStats {
  vertices: number;
  triangles: number;
  dimensions: { x: number; y: number; z: number };
  boundingBox: { min: [number, number, number]; max: [number, number, number] };
  meshCount: number;
  materialsCount: number;
}

export function computeModelStats(object: THREE.Object3D): ModelStats {
  let vertices = 0;
  let triangles = 0;
  let meshCount = 0;
  const materials = new Set<string>();

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshCount++;
      const geometry = child.geometry;
      if (geometry) {
        if (geometry.attributes.position) {
          vertices += geometry.attributes.position.count;
        }
        if (geometry.index) {
          triangles += geometry.index.count / 3;
        } else if (geometry.attributes.position) {
          triangles += geometry.attributes.position.count / 3;
        }
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => materials.add(m.uuid));
        } else {
          materials.add(child.material.uuid);
        }
      }
    }
  });

  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);

  return {
    vertices,
    triangles: Math.round(triangles),
    dimensions: {
      x: Number(size.x.toFixed(2)),
      y: Number(size.y.toFixed(2)),
      z: Number(size.z.toFixed(2)),
    },
    boundingBox: {
      min: [Number(box.min.x.toFixed(2)), Number(box.min.y.toFixed(2)), Number(box.min.z.toFixed(2))],
      max: [Number(box.max.x.toFixed(2)), Number(box.max.y.toFixed(2)), Number(box.max.z.toFixed(2))],
    },
    meshCount,
    materialsCount: materials.size,
  };
}

export function centerAndScaleObject(object: THREE.Object3D, targetSize: number = 3.5): void {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  box.getCenter(center);
  
  // Center object
  object.position.sub(center);
  
  // Scale object nicely into viewing volume
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) {
    const scale = targetSize / maxDim;
    object.scale.multiplyScalar(scale);
  }
}

/**
 * Apply mathematical mesh deformers & algorithmic modifications
 */
export function applyMeshModifier(mesh: THREE.Mesh, op: MeshModifierOperation): void {
  const geometry = mesh.geometry;
  if (!geometry || !geometry.attributes.position) return;

  // Make geometry non-indexed if modifying per-vertex positions easily
  const posAttr = geometry.attributes.position;
  const positions = posAttr.array as Float32Array;
  const count = posAttr.count;

  const box = new THREE.Box3().setFromBufferAttribute(posAttr as THREE.BufferAttribute);
  const size = new THREE.Vector3();
  box.getSize(size);
  const min = box.min;
  const max = box.max;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    let x = positions[idx];
    let y = positions[idx + 1];
    let z = positions[idx + 2];

    if (op.type === 'twist') {
      const normalizedY = size.y > 0 ? (y - min.y) / size.y - 0.5 : 0;
      const angle = normalizedY * op.intensity * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      if (op.axis === 'y') {
        const nx = x * cosA - z * sinA;
        const nz = x * sinA + z * cosA;
        x = nx;
        z = nz;
      } else if (op.axis === 'z') {
        const nx = x * cosA - y * sinA;
        const ny = x * sinA + y * cosA;
        x = nx;
        y = ny;
      }
    } else if (op.type === 'taper') {
      const normalizedY = size.y > 0 ? (y - min.y) / size.y : 0;
      const scale = Math.max(0.05, 1.0 + (normalizedY - 0.5) * op.intensity);
      if (op.axis === 'y') {
        x *= scale;
        z *= scale;
      } else if (op.axis === 'z') {
        x *= scale;
        y *= scale;
      }
    } else if (op.type === 'bend') {
      const normalizedY = size.y > 0 ? (y - min.y) / size.y : 0;
      const bendAmount = Math.sin(normalizedY * Math.PI) * op.intensity * (size.x || 1);
      if (op.axis === 'x') {
        x += bendAmount;
      } else if (op.axis === 'z') {
        z += bendAmount;
      }
    } else if (op.type === 'noise') {
      const freq = 3.0;
      const nx = Math.sin(x * freq + y * freq) * Math.cos(z * freq);
      const ny = Math.cos(y * freq + z * freq) * Math.sin(x * freq);
      const nz = Math.sin(z * freq + x * freq) * Math.cos(y * freq);
      const amount = op.intensity * 0.15;
      x += nx * amount;
      y += ny * amount;
      z += nz * amount;
    } else if (op.type === 'spherify') {
      const len = Math.sqrt(x * x + y * y + z * z) || 1;
      const targetRadius = (size.x + size.y + size.z) / 6;
      const factor = Math.min(1, Math.max(0, op.intensity));
      x = x * (1 - factor) + (x / len) * targetRadius * factor;
      y = y * (1 - factor) + (y / len) * targetRadius * factor;
      z = z * (1 - factor) + (z / len) * targetRadius * factor;
    } else if (op.type === 'extrude-spikes') {
      // Periodic spike extrusion along position
      const phase = Math.sin(x * 10) * Math.cos(y * 10) * Math.sin(z * 10);
      if (phase > 0.4) {
        const spike = (phase - 0.4) * op.intensity * 0.4;
        const len = Math.sqrt(x * x + y * y + z * z) || 1;
        x += (x / len) * spike;
        y += (y / len) * spike;
        z += (z / len) * spike;
      }
    }

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
  }

  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
}

/**
 * Apply material settings to all meshes in an object hierarchy
 */
export function applyMaterialToHierarchy(
  object: THREE.Object3D,
  materialSettings: PBRMaterialSettings,
  textures?: {
    albedo?: THREE.Texture;
    normal?: THREE.Texture;
    roughness?: THREE.Texture;
    metallic?: THREE.Texture;
    displacement?: THREE.Texture;
    ao?: THREE.Texture;
  }
): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(materialSettings.color),
        roughness: materialSettings.roughness,
        metalness: materialSettings.metalness,
        emissive: new THREE.Color(materialSettings.emissive),
        emissiveIntensity: materialSettings.emissiveIntensity,
        wireframe: materialSettings.wireframe,
        envMapIntensity: materialSettings.envMapIntensity,
      });

      if (textures) {
        if (textures.albedo) mat.map = textures.albedo;
        if (textures.normal) {
          mat.normalMap = textures.normal;
          mat.normalScale = new THREE.Vector2(materialSettings.normalScale, materialSettings.normalScale);
        }
        if (textures.roughness) mat.roughnessMap = textures.roughness;
        if (textures.metallic) mat.metalnessMap = textures.metallic;
        if (textures.ao) mat.aoMap = textures.ao;
      }

      mat.needsUpdate = true;
      child.material = mat;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

/**
 * Exporters for GLB, OBJ, STL
 */
export async function exportToGLB(object: THREE.Object3D, fileName: string = 'model.glb'): Promise<Blob> {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      object,
      (gltf) => {
        const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
        resolve(blob);
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}

export function exportToOBJ(object: THREE.Object3D, fileName: string = 'model.obj'): Blob {
  const exporter = new OBJExporter();
  const result = exporter.parse(object);
  return new Blob([result], { type: 'text/plain' });
}

export function exportToSTL(object: THREE.Object3D, binary: boolean = true): Blob {
  const exporter = new STLExporter();
  const result = exporter.parse(object, { binary });
  return new Blob([result as BlobPart], { type: binary ? 'application/octet-stream' : 'text/plain' });
}

/**
 * File Loaders for Drag & Drop / Upload
 */
export async function loadModelFromFile(file: File): Promise<THREE.Group> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();

  return new Promise((resolve, reject) => {
    if (extension === 'glb' || extension === 'gltf') {
      const loader = new GLTFLoader();
      loader.parse(
        arrayBuffer,
        '',
        (gltf) => {
          const group = new THREE.Group();
          group.add(gltf.scene);
          centerAndScaleObject(group);
          resolve(group);
        },
        (error) => reject(error)
      );
    } else if (extension === 'obj') {
      const text = new TextDecoder().decode(arrayBuffer);
      const loader = new OBJLoader();
      const obj = loader.parse(text);
      const group = new THREE.Group();
      group.add(obj);
      centerAndScaleObject(group);
      resolve(group);
    } else if (extension === 'stl') {
      const loader = new STLLoader();
      const geometry = loader.parse(arrayBuffer);
      geometry.computeVertexNormals();
      const material = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        roughness: 0.35,
        metalness: 0.5,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const group = new THREE.Group();
      group.add(mesh);
      centerAndScaleObject(group);
      resolve(group);
    } else {
      reject(new Error(`Unsupported 3D file format: .${extension}`));
    }
  });
}
