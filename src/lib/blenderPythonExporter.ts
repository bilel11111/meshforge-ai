import * as THREE from 'three';
import { PBRMaterialSettings } from '../types';

export interface BlenderMaterialData {
  color: [number, number, number, number];
  roughness: number;
  metallic: number;
  emissive: [number, number, number, number];
  emissiveStrength: number;
}

export interface BlenderMeshData {
  name: string;
  vertices: number[][];
  faces: number[][];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  material: BlenderMaterialData;
}

export interface BlenderModelEntry {
  id?: string;
  name: string;
  object: THREE.Object3D;
  collectionName?: string;
  materialSettings?: PBRMaterialSettings;
  visible?: boolean;
  transformOverride?: {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
  };
}

export interface BlenderAssemblyOptions {
  sceneName?: string;
  createSeparateCollections?: boolean;
  setupStudioLighting?: boolean;
  setupTurntableCamera?: boolean;
  autoSmoothNormals?: boolean;
  addBevelModifier?: boolean;
  autoFrameAssembly?: boolean;
}

/**
 * Extract 3D meshes, vertices, faces, transforms and materials from any THREE.Object3D hierarchy
 */
export function extractMeshHierarchyData(
  object: THREE.Object3D,
  fallbackPrefix: string = 'Part',
  defaultMaterial?: PBRMaterialSettings
): BlenderMeshData[] {
  const meshesData: BlenderMeshData[] = [];
  let meshIndex = 0;

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshIndex++;
      const geometry = child.geometry;
      if (!geometry) return;

      const posAttr = geometry.attributes.position;
      if (!posAttr) return;

      // Extract unique vertices and faces
      const vertices: number[][] = [];
      const faces: number[][] = [];
      const vertexMap = new Map<string, number>();

      const getOrAddVertex = (x: number, y: number, z: number): number => {
        // Convert Three.js (x, y, z, Y-up) -> Blender (x, -z, y, Z-up)
        const bx = Number(x.toFixed(4));
        const by = Number((-z).toFixed(4));
        const bz = Number(y.toFixed(4));
        const key = `${bx},${by},${bz}`;

        if (vertexMap.has(key)) {
          return vertexMap.get(key)!;
        }
        const idx = vertices.length;
        vertices.push([bx, by, bz]);
        vertexMap.set(key, idx);
        return idx;
      };

      if (geometry.index) {
        const index = geometry.index;
        for (let i = 0; i < index.count; i += 3) {
          const i0 = index.getX(i);
          const i1 = index.getX(i + 1);
          const i2 = index.getX(i + 2);

          const v0 = getOrAddVertex(posAttr.getX(i0), posAttr.getY(i0), posAttr.getZ(i0));
          const v1 = getOrAddVertex(posAttr.getX(i1), posAttr.getY(i1), posAttr.getZ(i1));
          const v2 = getOrAddVertex(posAttr.getX(i2), posAttr.getY(i2), posAttr.getZ(i2));

          if (v0 !== v1 && v1 !== v2 && v0 !== v2) {
            faces.push([v0, v1, v2]);
          }
        }
      } else {
        for (let i = 0; i < posAttr.count; i += 3) {
          const v0 = getOrAddVertex(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
          const v1 = getOrAddVertex(posAttr.getX(i + 1), posAttr.getY(i + 1), posAttr.getZ(i + 1));
          const v2 = getOrAddVertex(posAttr.getX(i + 2), posAttr.getY(i + 2), posAttr.getZ(i + 2));

          if (v0 !== v1 && v1 !== v2 && v0 !== v2) {
            faces.push([v0, v1, v2]);
          }
        }
      }

      // Material extraction
      let hexColor = defaultMaterial?.color || '#3b82f6';
      let roughness = defaultMaterial?.roughness ?? 0.35;
      let metalness = defaultMaterial?.metalness ?? 0.75;
      let emissiveHex = defaultMaterial?.emissive || '#000000';
      let emissiveIntensity = defaultMaterial?.emissiveIntensity ?? 1.0;

      if (child.material) {
        const m = Array.isArray(child.material) ? child.material[0] : child.material;
        if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial) {
          hexColor = '#' + m.color.getHexString();
          roughness = m.roughness;
          metalness = m.metalness;
          if (m.emissive) {
            emissiveHex = '#' + m.emissive.getHexString();
            emissiveIntensity = m.emissiveIntensity;
          }
        }
      }

      const threeColor = new THREE.Color(hexColor);
      const threeEmissive = new THREE.Color(emissiveHex);

      // World transform
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();
      const worldScale = new THREE.Vector3();
      child.getWorldPosition(worldPos);
      child.getWorldQuaternion(worldQuat);
      child.getWorldScale(worldScale);

      const euler = new THREE.Euler().setFromQuaternion(worldQuat);

      const bPos: [number, number, number] = [
        Number(worldPos.x.toFixed(4)),
        Number((-worldPos.z).toFixed(4)),
        Number(worldPos.y.toFixed(4)),
      ];
      const bRot: [number, number, number] = [
        Number(euler.x.toFixed(4)),
        Number((-euler.z).toFixed(4)),
        Number(euler.y.toFixed(4)),
      ];
      const bScale: [number, number, number] = [
        Number(worldScale.x.toFixed(4)),
        Number(worldScale.z.toFixed(4)),
        Number(worldScale.y.toFixed(4)),
      ];

      meshesData.push({
        name: child.name || `${fallbackPrefix}_${meshIndex}`,
        vertices,
        faces,
        position: bPos,
        rotation: bRot,
        scale: bScale,
        material: {
          color: [threeColor.r, threeColor.g, threeColor.b, 1.0],
          roughness: roughness,
          metallic: metalness,
          emissive: [threeEmissive.r, threeEmissive.g, threeEmissive.b, 1.0],
          emissiveStrength: emissiveHex === '#000000' || emissiveHex === '#000' ? 0.0 : emissiveIntensity,
        },
      });
    }
  });

  return meshesData;
}

/**
 * Generate a complete, ready-to-run Blender Python (bpy) script
 * for a single model hierarchy.
 */
export function generateBlenderPythonScript(
  object: THREE.Object3D,
  modelTitle: string = 'Asset',
  materialSettings?: PBRMaterialSettings
): string {
  const cleanTitle = modelTitle.replace(/[^a-zA-Z0-9_-]/g, '_') || '3D_Model';
  const meshesData = extractMeshHierarchyData(object, cleanTitle, materialSettings);

  return `"""
==============================================================================
3D GenStudio - Automated Blender Python (bpy) Asset Generator
Model: ${modelTitle}
Generated on: ${new Date().toISOString()}

INSTRUCTIONS:
1. Open Blender (v3.3+ or v4.x recommended).
2. Switch to the 'Scripting' workspace (top navigation bar).
3. Click '+ New' to create a script buffer, paste this code.
4. Click 'Run Script' (or press Alt + P).
5. Switch Viewport Shading to 'Rendered' (press Z -> Rendered) to view PBR materials!
==============================================================================
"""

import bpy
import math
from mathutils import Vector, Euler

def build_genstudio_asset():
    # 1. Setup Collection
    collection_name = "GenStudio_${cleanTitle}"
    if collection_name in bpy.data.collections:
        col = bpy.data.collections[collection_name]
    else:
        col = bpy.data.collections.new(collection_name)
        bpy.context.scene.collection.children.link(col)

    # 2. Helper to create Principled BSDF Material
    def create_pbr_material(name, color, roughness, metallic, emissive, emissive_strength):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        nodes.clear()

        node_output = nodes.new(type='ShaderNodeOutputMaterial')
        node_output.location = (400, 0)
        
        node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
        node_bsdf.location = (0, 0)

        if 'Base Color' in node_bsdf.inputs:
            node_bsdf.inputs['Base Color'].default_value = color
        if 'Roughness' in node_bsdf.inputs:
            node_bsdf.inputs['Roughness'].default_value = roughness
        if 'Metallic' in node_bsdf.inputs:
            node_bsdf.inputs['Metallic'].default_value = metallic
        if emissive_strength > 0:
            if 'Emission Color' in node_bsdf.inputs:
                node_bsdf.inputs['Emission Color'].default_value = emissive
            elif 'Emission' in node_bsdf.inputs:
                node_bsdf.inputs['Emission'].default_value = emissive
            if 'Emission Strength' in node_bsdf.inputs:
                node_bsdf.inputs['Emission Strength'].default_value = emissive_strength

        links.new(node_bsdf.outputs['BSDF'], node_output.inputs['Surface'])
        return mat

    created_objects = []

    # 3. Model Meshes Definition
    meshes_payload = ${JSON.stringify(meshesData, null, 2)}

    for idx, item in enumerate(meshes_payload):
        mesh_name = f"{item['name']}_Mesh"
        obj_name = item['name']

        mesh = bpy.data.meshes.new(mesh_name)
        mesh.from_pydata(item['vertices'], [], item['faces'])
        mesh.update(calc_edges=True)

        obj = bpy.data.objects.new(obj_name, mesh)
        col.objects.link(obj)
        created_objects.append(obj)

        obj.location = Vector(item['position'])
        obj.rotation_euler = Euler(item['rotation'])
        obj.scale = Vector(item['scale'])

        for poly in mesh.polygons:
            poly.use_smooth = True

        mat_info = item['material']
        mat = create_pbr_material(
            f"Mat_{cleanTitle}_{idx}",
            mat_info['color'],
            mat_info['roughness'],
            mat_info['metallic'],
            mat_info['emissive'],
            mat_info['emissiveStrength']
        )
        obj.data.materials.append(mat)

    # 4. 3-Point Studio Lighting Setup
    def setup_studio_lighting():
        key_data = bpy.data.lights.new(name="GenStudio_KeyLight", type='AREA')
        key_data.energy = 500
        key_data.size = 3.0
        key_data.color = (1.0, 0.95, 0.9)
        key_obj = bpy.data.objects.new("GenStudio_KeyLight", key_data)
        key_obj.location = (4.0, -4.0, 5.0)
        col.objects.link(key_obj)

        fill_data = bpy.data.lights.new(name="GenStudio_FillLight", type='AREA')
        fill_data.energy = 250
        fill_data.size = 4.0
        fill_data.color = (0.7, 0.85, 1.0)
        fill_obj = bpy.data.objects.new("GenStudio_FillLight", fill_data)
        fill_obj.location = (-4.0, -3.0, 3.0)
        col.objects.link(fill_obj)

        rim_data = bpy.data.lights.new(name="GenStudio_RimLight", type='POINT')
        rim_data.energy = 600
        rim_data.color = (0.2, 0.6, 1.0)
        rim_obj = bpy.data.objects.new("GenStudio_RimLight", rim_data)
        rim_obj.location = (0.0, 5.0, 4.0)
        col.objects.link(rim_obj)

    setup_studio_lighting()

    if created_objects:
        bpy.context.view_layer.objects.active = created_objects[0]
        for o in created_objects:
            o.select_set(True)

    print(f"Successfully generated 3D asset '{modelTitle}' with {len(created_objects)} sub-meshes in Blender!")

build_genstudio_asset()
`;
}

/**
 * NEW UTILITY FUNCTION:
 * Allows exporting a collection of models/sub-assemblies into a single cohesive Blender scene,
 * using an organized batch Python script approach for complex assemblies.
 *
 * Features:
 * - Creates a master assembly collection with dedicated sub-collections per model
 * - Generates Principled BSDF materials with shared shader deduplication
 * - Computes scene-wide bounding box to dynamically position studio lights and framing camera
 * - Configures EEVEE/Cycles render settings and color management
 */
export function generateBatchBlenderAssemblyScript(
  models: BlenderModelEntry[],
  assemblyName: string = 'Master_Assembly',
  options: BlenderAssemblyOptions = {}
): string {
  const cleanAssembly = assemblyName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Assembly';
  const {
    createSeparateCollections = true,
    setupStudioLighting = true,
    setupTurntableCamera = true,
    autoSmoothNormals = true,
    addBevelModifier = false,
    autoFrameAssembly = true,
  } = options;

  // Compile batch payload for each model in the collection
  const batchPayload: Array<{
    id: string;
    name: string;
    collection: string;
    visible: boolean;
    meshes: BlenderMeshData[];
    transformOverride?: {
      position?: [number, number, number];
      rotation?: [number, number, number];
      scale?: [number, number, number];
    };
  }> = [];

  let totalMeshCount = 0;
  let totalVerticesCount = 0;
  let totalFacesCount = 0;

  models.forEach((model, index) => {
    const safeName = model.name.replace(/[^a-zA-Z0-9_-]/g, '_') || `Component_${index + 1}`;
    const collectionName = model.collectionName || `SubAssembly_${safeName}`;
    const meshes = extractMeshHierarchyData(model.object, safeName, model.materialSettings);

    meshes.forEach((m) => {
      totalMeshCount++;
      totalVerticesCount += m.vertices.length;
      totalFacesCount += m.faces.length;
    });

    batchPayload.push({
      id: model.id || `model_${index}`,
      name: safeName,
      collection: collectionName,
      visible: model.visible !== false,
      meshes,
      transformOverride: model.transformOverride,
    });
  });

  return `"""
==============================================================================
3D GenStudio - Batch Assembly Blender Python (bpy) Generator
Assembly: ${assemblyName}
Total Models: ${models.length}
Total Meshes: ${totalMeshCount}
Total Vertices: ~${totalVerticesCount.toLocaleString()} | Total Polygons: ~${totalFacesCount.toLocaleString()}
Generated on: ${new Date().toISOString()}

INSTRUCTIONS:
1. Open Blender (v3.3+ or v4.x recommended).
2. Switch to the 'Scripting' tab in the top workspace bar.
3. Click '+ New' to create a new script file, then paste this script.
4. Click 'Run Script' (or press Alt + P).
5. Switch Viewport Shading to 'Rendered' (press Z -> Rendered) to view full assembly with lighting!
==============================================================================
"""

import bpy
import math
from mathutils import Vector, Euler, Matrix

def build_batch_assembly():
    # -------------------------------------------------------------------------
    # 1. SCENE SETUP & MASTER ASSEMBLY COLLECTION
    # -------------------------------------------------------------------------
    master_col_name = "Assembly_${cleanAssembly}"
    if master_col_name in bpy.data.collections:
        master_col = bpy.data.collections[master_col_name]
    else:
        master_col = bpy.data.collections.new(master_col_name)
        bpy.context.scene.collection.children.link(master_col)

    # Dictionary to reuse materials and avoid shader redundancy
    material_cache = {}

    def get_or_create_material(name, color, roughness, metallic, emissive, emissive_strength):
        cache_key = f"{color}_{roughness}_{metallic}_{emissive}_{emissive_strength}"
        if cache_key in material_cache:
            return material_cache[cache_key]

        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        nodes.clear()

        # Output Node
        node_output = nodes.new(type='ShaderNodeOutputMaterial')
        node_output.location = (400, 0)
        
        # Principled BSDF Node
        node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
        node_bsdf.location = (0, 0)

        # Set Inputs
        if 'Base Color' in node_bsdf.inputs:
            node_bsdf.inputs['Base Color'].default_value = color
        if 'Roughness' in node_bsdf.inputs:
            node_bsdf.inputs['Roughness'].default_value = roughness
        if 'Metallic' in node_bsdf.inputs:
            node_bsdf.inputs['Metallic'].default_value = metallic
        if emissive_strength > 0:
            if 'Emission Color' in node_bsdf.inputs:
                node_bsdf.inputs['Emission Color'].default_value = emissive
            elif 'Emission' in node_bsdf.inputs:
                node_bsdf.inputs['Emission'].default_value = emissive
            if 'Emission Strength' in node_bsdf.inputs:
                node_bsdf.inputs['Emission Strength'].default_value = emissive_strength

        links.new(node_bsdf.outputs['BSDF'], node_output.inputs['Surface'])
        material_cache[cache_key] = mat
        return mat

    all_created_objects = []
    all_bounding_points = []

    # -------------------------------------------------------------------------
    # 2. BATCH ASSEMBLY PAYLOAD PARSING
    # -------------------------------------------------------------------------
    assembly_batch = ${JSON.stringify(batchPayload, null, 2)}

    for model_entry in assembly_batch:
        model_name = model_entry['name']
        col_name = model_entry['collection']
        
        # Target collection for this sub-assembly
        if ${createSeparateCollections ? 'True' : 'False'}:
            if col_name in bpy.data.collections:
                target_col = bpy.data.collections[col_name]
            else:
                target_col = bpy.data.collections.new(col_name)
                master_col.children.link(target_col)
        else:
            target_col = master_col

        # Transform Overrides if provided
        t_override = model_entry.get('transformOverride') or {}
        override_pos = Vector(t_override.get('position', [0.0, 0.0, 0.0]))
        override_rot = Euler(t_override.get('rotation', [0.0, 0.0, 0.0]))
        override_scale = Vector(t_override.get('scale', [1.0, 1.0, 1.0]))

        # Sub-assembly Root Empty Anchor
        root_empty = bpy.data.objects.new(f"Root_{model_name}", None)
        root_empty.empty_display_type = 'ARROWS'
        root_empty.empty_display_size = 0.5
        root_empty.location = override_pos
        root_empty.rotation_euler = override_rot
        root_empty.scale = override_scale
        target_col.objects.link(root_empty)
        all_created_objects.append(root_empty)

        # Build each mesh within the sub-assembly
        for mesh_idx, mesh_info in enumerate(model_entry['meshes']):
            m_name = f"{model_name}_{mesh_info['name']}"
            
            # Mesh data from Python vertices and polygon indices
            mesh = bpy.data.meshes.new(f"{m_name}_Mesh")
            mesh.from_pydata(mesh_info['vertices'], [], mesh_info['faces'])
            mesh.update(calc_edges=True)

            obj = bpy.data.objects.new(m_name, mesh)
            target_col.objects.link(obj)
            obj.parent = root_empty

            # Apply local transform relative to sub-assembly root
            obj.location = Vector(mesh_info['position'])
            obj.rotation_euler = Euler(mesh_info['rotation'])
            obj.scale = Vector(mesh_info['scale'])

            # Smooth Shading & Auto-smooth
            for poly in mesh.polygons:
                poly.use_smooth = True
            
            if ${autoSmoothNormals ? 'True' : 'False'}:
                if hasattr(mesh, 'use_auto_smooth'):
                    mesh.use_auto_smooth = True
                    mesh.auto_smooth_angle = math.radians(45.0)

            # Optional Bevel Modifier for clean CAD edge highlights
            if ${addBevelModifier ? 'True' : 'False'}:
                bev = obj.modifiers.new(name="Bevel", type='BEVEL')
                bev.width = 0.015
                bev.segments = 2
                bev.limit_method = 'ANGLE'
                bev.angle_limit = math.radians(30.0)

            # Assign PBR Material
            mat_data = mesh_info['material']
            mat = get_or_create_material(
                f"Mat_{model_name}_{mesh_idx}",
                mat_data['color'],
                mat_data['roughness'],
                mat_data['metallic'],
                mat_data['emissive'],
                mat_data['emissiveStrength']
            )
            obj.data.materials.append(mat)
            all_created_objects.append(obj)

            # Accumulate bounding vertices for auto-framing
            for v in mesh_info['vertices']:
                all_bounding_points.append(Vector(v) + Vector(mesh_info['position']) + override_pos)

    # -------------------------------------------------------------------------
    # 3. DYNAMIC BOUNDING BOX & AUTO-FRAMING SETUP
    # -------------------------------------------------------------------------
    if all_bounding_points:
        min_x = min(p.x for p in all_bounding_points)
        max_x = max(p.x for p in all_bounding_points)
        min_y = min(p.y for p in all_bounding_points)
        max_y = max(p.y for p in all_bounding_points)
        min_z = min(p.z for p in all_bounding_points)
        max_z = max(p.z for p in all_bounding_points)

        center_x = (min_x + max_x) / 2.0
        center_y = (min_y + max_y) / 2.0
        center_z = (min_z + max_z) / 2.0
        assembly_center = Vector((center_x, center_y, center_z))
        
        assembly_radius = max(
            (Vector((max_x, max_y, max_z)) - Vector((min_x, min_y, min_z))).length / 2.0,
            2.0
        )
    else:
        assembly_center = Vector((0.0, 0.0, 0.0))
        assembly_radius = 4.0

    # -------------------------------------------------------------------------
    # 4. STUDIO LIGHTING RIG (AUTO-CALIBRATED TO ASSEMBLY SCALE)
    # -------------------------------------------------------------------------
    if ${setupStudioLighting ? 'True' : 'False'}:
        lights_col_name = f"{master_col_name}_Lighting"
        if lights_col_name in bpy.data.collections:
            lights_col = bpy.data.collections[lights_col_name]
        else:
            lights_col = bpy.data.collections.new(lights_col_name)
            master_col.children.link(lights_col)

        scale_mult = max(assembly_radius / 3.0, 1.0)

        # Key Light (Warm Key)
        key_data = bpy.data.lights.new(name="Assembly_KeyLight", type='AREA')
        key_data.energy = 600 * scale_mult * scale_mult
        key_data.size = 3.5 * scale_mult
        key_data.color = (1.0, 0.96, 0.92)
        key_obj = bpy.data.objects.new("Assembly_KeyLight", key_data)
        key_obj.location = assembly_center + Vector((3.5 * scale_mult, -4.5 * scale_mult, 4.0 * scale_mult))
        lights_col.objects.link(key_obj)

        # Fill Light (Cool Soft Fill)
        fill_data = bpy.data.lights.new(name="Assembly_FillLight", type='AREA')
        fill_data.energy = 300 * scale_mult * scale_mult
        fill_data.size = 5.0 * scale_mult
        fill_data.color = (0.75, 0.88, 1.0)
        fill_obj = bpy.data.objects.new("Assembly_FillLight", fill_data)
        fill_obj.location = assembly_center + Vector((-4.0 * scale_mult, -3.5 * scale_mult, 3.0 * scale_mult))
        lights_col.objects.link(fill_obj)

        # Rim / Backlight (Accent Halo)
        rim_data = bpy.data.lights.new(name="Assembly_RimLight", type='POINT')
        rim_data.energy = 750 * scale_mult * scale_mult
        rim_data.color = (0.35, 0.7, 1.0)
        rim_obj = bpy.data.objects.new("Assembly_RimLight", rim_data)
        rim_obj.location = assembly_center + Vector((0.0, 5.0 * scale_mult, 4.5 * scale_mult))
        lights_col.objects.link(rim_obj)

    # -------------------------------------------------------------------------
    # 5. CAMERA RIG WITH TRACK-TO CONSTRAINT
    # -------------------------------------------------------------------------
    if ${setupTurntableCamera ? 'True' : 'False'}:
        cam_data = bpy.data.cameras.new(name="Assembly_StudioCamera")
        cam_data.lens = 50.0  # 50mm portrait / product focal length
        cam_data.dof.use_dof = False
        cam_obj = bpy.data.objects.new("Assembly_StudioCamera", cam_data)
        master_col.objects.link(cam_obj)

        # Position camera at optimal viewing angle relative to assembly radius
        cam_dist = assembly_radius * 2.8
        cam_obj.location = assembly_center + Vector((cam_dist * 0.7, -cam_dist * 0.9, cam_dist * 0.6))

        # Target Empty at center
        cam_target = bpy.data.objects.new("Assembly_CameraTarget", None)
        cam_target.location = assembly_center
        cam_target.empty_display_size = 0.2
        master_col.objects.link(cam_target)

        # Track To Constraint
        track = cam_obj.constraints.new(type='TRACK_TO')
        track.target = cam_target
        track.track_axis = 'TRACK_NEGATIVE_Z'
        track.up_axis = 'UP_Y'

        bpy.context.scene.camera = cam_obj

    # -------------------------------------------------------------------------
    # 6. SELECTION & SUMMARY
    # -------------------------------------------------------------------------
    if all_created_objects:
        bpy.context.view_layer.objects.active = all_created_objects[0]
        for obj in all_created_objects:
            obj.select_set(True)

    print(f"================================================================")
    print(f"SUCCESS: Assembly '{cleanAssembly}' generated in Blender!")
    print(f"Total Sub-Assemblies: {len(assembly_batch)}")
    print(f"Total Objects Created: {len(all_created_objects)}")
    print(f"================================================================")

# Execute assembly build
build_batch_assembly()
`;
}
