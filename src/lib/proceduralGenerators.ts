import * as THREE from 'three';
import { VisualStyle } from '../types';
import { centerAndScaleObject } from './threeUtils';

/**
 * Procedural 3D Generators Library
 * Synthesizes complex 3D meshes with hierarchies, materials, and parametric primitives.
 */

export interface DroneOptions {
  hasSearchlight?: boolean;
  searchlightColor?: string | number;
  searchlightIntensity?: number;
  volumetricBeam?: boolean;
  emissionGlow?: boolean;
  meshDetailLevel?: number;
}

/**
 * Creates the high-fidelity Sci-Fi Explorer Drone from the Forge UI specification
 */
export function createSciFiExplorerDrone(options: DroneOptions = {}): THREE.Group {
  const {
    hasSearchlight = true,
    searchlightColor = 0x38bdf8,
    searchlightIntensity = 2.5,
    volumetricBeam = true,
    emissionGlow = true,
  } = options;

  const root = new THREE.Group();
  root.name = 'Sci-Fi_Explorer_Drone_Root';

  // ----------------------------------------------------
  // 1. Drone_Frame_Mesh (Main Chassis, Cockpit, Legs, Claws)
  // ----------------------------------------------------
  const frameGroup = new THREE.Group();
  frameGroup.name = 'Drone_Frame_Mesh';

  // Materials
  const chassisAlloyMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db, // Light grey metallic alloy
    roughness: 0.35,
    metalness: 0.75,
    bumpScale: 0.05,
  });

  const darkPlateMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.45,
    metalness: 0.85,
  });

  const glassCanopyMat = new THREE.MeshPhysicalMaterial ? new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.5,
    thickness: 0.4,
    transparent: true,
    opacity: 0.45,
    reflectivity: 0.9,
  }) : new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.4,
  });

  const interiorMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.7,
    metalness: 0.3,
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.3,
    metalness: 0.9,
  });

  // A. Main Center Fuselage Body
  const fuselageGeo = new THREE.CylinderGeometry(0.75, 0.95, 1.2, 16);
  fuselageGeo.rotateZ(Math.PI / 2);
  fuselageGeo.scale(1.1, 0.8, 1.0);
  const fuselage = new THREE.Mesh(fuselageGeo, chassisAlloyMat);
  fuselage.position.set(0, 0.1, 0);
  fuselage.castShadow = true;
  fuselage.receiveShadow = true;
  frameGroup.add(fuselage);

  // Upper Armor Cowling
  const armorGeo = new THREE.BoxGeometry(1.4, 0.25, 1.3);
  const armor = new THREE.Mesh(armorGeo, darkPlateMat);
  armor.position.set(0, 0.5, -0.05);
  armor.castShadow = true;
  frameGroup.add(armor);

  // B. Spherical Cockpit Glass Canopy
  const cockpitGeo = new THREE.SphereGeometry(0.72, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.65);
  cockpitGeo.rotateX(-Math.PI * 0.1);
  const cockpitMesh = new THREE.Mesh(cockpitGeo, glassCanopyMat);
  cockpitMesh.position.set(0, 0.15, 0.45);
  cockpitMesh.castShadow = true;
  frameGroup.add(cockpitMesh);

  // Cockpit Interior Seat & Console
  const seatGroup = new THREE.Group();
  const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.4), interiorMat);
  const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.1), interiorMat);
  seatBack.position.set(0, 0.25, -0.15);
  seatBack.rotation.x = -0.15;
  const joystick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 8), darkPlateMat);
  joystick.position.set(0.12, 0.1, 0.1);
  const consoleDisplay = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.15, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 1.8 })
  );
  consoleDisplay.position.set(0, 0.2, 0.28);
  consoleDisplay.rotation.x = -0.4;
  seatGroup.add(seatBase, seatBack, joystick, consoleDisplay);
  seatGroup.position.set(0, 0.0, 0.4);
  frameGroup.add(seatGroup);

  // C. 4 Articulated Robotic Landing Legs
  const legPositions = [
    { x: -0.85, z: 0.75, angleY: Math.PI * 0.25 },
    { x: 0.85, z: 0.75, angleY: -Math.PI * 0.25 },
    { x: -0.9, z: -0.75, angleY: Math.PI * 0.75 },
    { x: 0.9, z: -0.75, angleY: -Math.PI * 0.75 },
  ];

  legPositions.forEach((pos, idx) => {
    const leg = new THREE.Group();
    leg.name = `Landing_Leg_${idx + 1}`;

    // Hip Joint Ball
    const hip = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), darkPlateMat);
    leg.add(hip);

    // Upper Thigh Strut
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.65, 10), chassisAlloyMat);
    thigh.position.set(0.2, -0.2, 0);
    thigh.rotation.z = -Math.PI * 0.28;
    thigh.castShadow = true;
    leg.add(thigh);

    // Knee Piston
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), darkPlateMat);
    knee.position.set(0.42, -0.42, 0);
    leg.add(knee);

    // Lower Shin Strut
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.75, 10), darkPlateMat);
    shin.position.set(0.58, -0.75, 0);
    shin.rotation.z = Math.PI * 0.15;
    shin.castShadow = true;
    leg.add(shin);

    // Foot Pad with 3 articulated claws
    const footGroup = new THREE.Group();
    const footPad = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.06, 8), darkPlateMat);
    footGroup.add(footPad);

    for (let c = 0; c < 3; c++) {
      const clawAngle = (c * Math.PI * 2) / 3;
      const claw = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.05), goldAccentMat);
      claw.position.set(Math.cos(clawAngle) * 0.16, -0.02, Math.sin(clawAngle) * 0.16);
      claw.rotation.y = clawAngle;
      footGroup.add(claw);
    }
    footGroup.position.set(0.68, -1.08, 0);
    leg.add(footGroup);

    leg.position.set(pos.x, -0.05, pos.z);
    leg.rotation.y = pos.angleY;
    frameGroup.add(leg);
  });

  // D. 2 Front Articulated Robotic Manipulator Arms
  for (const side of [-1, 1]) {
    const armGroup = new THREE.Group();
    armGroup.name = `Manipulator_Arm_${side > 0 ? 'R' : 'L'}`;

    const baseJoint = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), darkPlateMat);
    armGroup.add(baseJoint);

    const armUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8), chassisAlloyMat);
    armUpper.position.set(side * 0.08, -0.15, 0.15);
    armUpper.rotation.x = Math.PI * 0.25;
    armUpper.rotation.z = side * -Math.PI * 0.15;
    armGroup.add(armUpper);

    const wrist = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), goldAccentMat);
    wrist.position.set(side * 0.15, -0.32, 0.32);
    armGroup.add(wrist);

    // 3-Prong Gripper Claw
    const clawGroup = new THREE.Group();
    for (let f = 0; f < 3; f++) {
      const fAngle = (f * Math.PI * 2) / 3;
      const finger = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.03), darkPlateMat);
      finger.position.set(Math.cos(fAngle) * 0.05, 0.06, Math.sin(fAngle) * 0.05);
      finger.rotation.x = Math.PI * 0.15;
      clawGroup.add(finger);
    }
    clawGroup.position.copy(wrist.position);
    clawGroup.rotation.x = Math.PI * 0.5;
    armGroup.add(clawGroup);

    armGroup.position.set(side * 0.42, -0.2, 0.6);
    frameGroup.add(armGroup);
  }

  root.add(frameGroup);

  // ----------------------------------------------------
  // 2. Propeller_Assembly_Mesh (4 Outriggers + Ducted Fans)
  // ----------------------------------------------------
  const propellerAssembly = new THREE.Group();
  propellerAssembly.name = 'Propeller_Assembly_Mesh';

  const boomPositions = [
    { x: -1.4, y: 0.35, z: 1.15, angleY: Math.PI * 0.2 },
    { x: 1.4, y: 0.35, z: 1.15, angleY: -Math.PI * 0.2 },
    { x: -1.45, y: 0.45, z: -1.15, angleY: Math.PI * 0.8 },
    { x: 1.45, y: 0.45, z: -1.15, angleY: -Math.PI * 0.8 },
  ];

  boomPositions.forEach((pos, i) => {
    const nacellePod = new THREE.Group();
    nacellePod.name = `Ducted_Fan_Pod_${i + 1}`;

    // Structural Outrigger Boom
    const boomGeo = new THREE.BoxGeometry(0.14, 0.1, 1.2);
    const boom = new THREE.Mesh(boomGeo, chassisAlloyMat);
    boom.position.set(pos.x * 0.45, pos.y * 0.8, pos.z * 0.45);
    boom.lookAt(pos.x, pos.y, pos.z);
    propellerAssembly.add(boom);

    // Ducted Fan Shroud (Outer Cylinder/Cowling with Aerodynamic Lip)
    const shroudOuter = new THREE.CylinderGeometry(0.65, 0.62, 0.35, 24, 1, true);
    const shroudMat = new THREE.MeshStandardMaterial({
      color: 0x374151,
      roughness: 0.3,
      metalness: 0.85,
      side: THREE.DoubleSide,
    });
    const shroud = new THREE.Mesh(shroudOuter, shroudMat);
    shroud.castShadow = true;
    nacellePod.add(shroud);

    // Intake Lip Ring
    const lipGeo = new THREE.TorusGeometry(0.635, 0.04, 12, 32);
    lipGeo.rotateX(Math.PI / 2);
    const lipMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2, metalness: 0.9 });
    const lipTop = new THREE.Mesh(lipGeo, lipMat);
    lipTop.position.y = 0.175;
    const lipBottom = new THREE.Mesh(lipGeo, lipMat);
    lipBottom.position.y = -0.175;
    nacellePod.add(lipTop, lipBottom);

    // Inner Stator Struts
    for (let s = 0; s < 4; s++) {
      const sAngle = (s * Math.PI) / 2;
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.06), darkPlateMat);
      strut.rotation.y = sAngle;
      strut.position.y = -0.08;
      nacellePod.add(strut);
    }

    // Central Spinner Hub + 3 Aerodynamic Rotor Blades
    const rotorGroup = new THREE.Group();
    rotorGroup.name = `Rotor_Blades_${i + 1}`;

    const spinner = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.25, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.8 })
    );
    spinner.position.y = 0.05;
    rotorGroup.add(spinner);

    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.25,
      metalness: 0.6,
      bumpScale: 0.02,
    });

    for (let b = 0; b < 3; b++) {
      const bAngle = (b * Math.PI * 2) / 3;
      const bladeGeo = new THREE.BoxGeometry(0.55, 0.015, 0.1);
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(Math.cos(bAngle) * 0.3, 0.02, Math.sin(bAngle) * 0.3);
      blade.rotation.y = bAngle;
      blade.rotation.x = 0.18; // Aerodynamic pitch angle
      rotorGroup.add(blade);
    }

    nacellePod.add(rotorGroup);
    nacellePod.position.set(pos.x, pos.y, pos.z);
    propellerAssembly.add(nacellePod);
  });

  root.add(propellerAssembly);

  // ----------------------------------------------------
  // 3. Sensor_Dome_Texture (Top Optic Binocular Periscope)
  // ----------------------------------------------------
  const sensorDomeGroup = new THREE.Group();
  sensorDomeGroup.name = 'Sensor_Dome_Texture';

  const turretBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.38, 0.18, 16),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.3, metalness: 0.85 })
  );
  turretBase.position.set(0, 0.72, 0.3);
  sensorDomeGroup.add(turretBase);

  // Binocular Crossbar
  const crossbar = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.15, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.4, metalness: 0.7 })
  );
  crossbar.position.set(0, 0.84, 0.3);
  sensorDomeGroup.add(crossbar);

  // Dual Cyan Optic Lenses
  for (const side of [-1, 1]) {
    const lensHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.12, 16),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2, metalness: 0.9 })
    );
    lensHousing.rotateX(Math.PI / 2);
    lensHousing.position.set(side * 0.16, 0.84, 0.42);
    sensorDomeGroup.add(lensHousing);

    const opticLens = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 2.5,
        roughness: 0.1,
        metalness: 0.1,
      })
    );
    opticLens.rotateX(Math.PI / 2);
    opticLens.position.set(side * 0.16, 0.84, 0.48);
    sensorDomeGroup.add(opticLens);
  }

  root.add(sensorDomeGroup);

  // ----------------------------------------------------
  // 4. Chassis_Texture (Emission: Blue) & Volumetric Searchlight
  // ----------------------------------------------------
  const emissionGroup = new THREE.Group();
  emissionGroup.name = 'Chassis_Texture (Emission: Blue)';

  // Accent Blue Emission strips along fuselage
  const emissionStripMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: emissionGlow ? 2.8 : 0.4,
    roughness: 0.1,
  });

  for (const side of [-1, 1]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 1.1), emissionStripMat);
    strip.position.set(side * 0.72, 0.42, 0);
    emissionGroup.add(strip);
  }

  // Reactor Core Ring on Back
  const reactorRing = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 12, 24), emissionStripMat);
  reactorRing.position.set(0, 0.15, -0.65);
  emissionGroup.add(reactorRing);

  // DUAL VOLUMETRIC SEARCHLIGHT BEAMS (Blue-to-White Gradient Cone)
  if (hasSearchlight) {
    for (const side of [-1, 1]) {
      const lightHousingGroup = new THREE.Group();
      lightHousingGroup.name = `Searchlight_Emitter_${side > 0 ? 'R' : 'L'}`;

      // Lamp Bezel
      const lampBezel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.11, 0.2, 16),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.9 })
      );
      lampBezel.rotateX(Math.PI * 0.45);
      lightHousingGroup.add(lampBezel);

      // Glowing Lamp Lens
      const lampLens = new THREE.Mesh(
        new THREE.CircleGeometry(0.12, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      lampLens.position.set(0, -0.08, 0.09);
      lampLens.rotateX(-Math.PI * 0.55);
      lightHousingGroup.add(lampLens);

      // Volumetric Cone with Blue-to-White Soft Gradient
      if (volumetricBeam) {
        // Create procedural canvas gradient for soft volumetric cone alpha
        const beamCanvas = document.createElement('canvas');
        beamCanvas.width = 128;
        beamCanvas.height = 256;
        const bCtx = beamCanvas.getContext('2d')!;
        const grad = bCtx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.2, 'rgba(56, 189, 248, 0.6)');
        grad.addColorStop(0.7, 'rgba(2, 132, 199, 0.25)');
        grad.addColorStop(1, 'rgba(2, 132, 199, 0.0)');
        bCtx.fillStyle = grad;
        bCtx.fillRect(0, 0, 128, 256);

        const beamTexture = new THREE.CanvasTexture(beamCanvas);
        beamTexture.wrapS = THREE.ClampToEdgeWrapping;
        beamTexture.wrapT = THREE.ClampToEdgeWrapping;

        const coneGeo = new THREE.ConeGeometry(1.3, 3.8, 24, 1, true);
        coneGeo.rotateX(Math.PI);
        coneGeo.translate(0, -1.9, 0);

        const coneMat = new THREE.MeshBasicMaterial({
          color: searchlightColor,
          map: beamTexture,
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });

        const volumetricCone = new THREE.Mesh(coneGeo, coneMat);
        volumetricCone.name = 'Volumetric_Light_Beam';
        volumetricCone.rotation.x = Math.PI * 0.15;
        lightHousingGroup.add(volumetricCone);

        // Actual Three.js SpotLight for floor illumination
        const spotLight = new THREE.SpotLight(0xbae6fd, searchlightIntensity, 12, Math.PI * 0.28, 0.5, 1.2);
        spotLight.position.set(0, 0, 0);
        const targetObj = new THREE.Object3D();
        targetObj.position.set(0, -3.5, 2.0);
        lightHousingGroup.add(targetObj);
        spotLight.target = targetObj;
        spotLight.castShadow = true;
        lightHousingGroup.add(spotLight);
      }

      lightHousingGroup.position.set(side * 0.38, -0.3, 0.7);
      lightHousingGroup.rotation.x = Math.PI * 0.12;
      lightHousingGroup.rotation.y = side * -Math.PI * 0.05;
      emissionGroup.add(lightHousingGroup);
    }
  }

  root.add(emissionGroup);

  centerAndScaleObject(root, 3.4);
  return root;
}


export function createCyberpunkDrone(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Cyberpunk_Recon_Drone';

  // 1. Central Core Fuselage
  const bodyGeo = new THREE.CylinderGeometry(0.8, 0.6, 0.4, 8);
  bodyGeo.rotateY(Math.PI / 8);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.85 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  root.add(body);

  // Top Dome Canopy
  const domeGeo = new THREE.SphereGeometry(0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const domeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.85 });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.y = 0.2;
  root.add(dome);

  // Glowing Core Reactor Ring
  const ringGeo = new THREE.TorusGeometry(0.65, 0.05, 16, 32);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.0, roughness: 0.2 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  root.add(ring);

  // 4 Rotor Booms & Thrusters
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const armGroup = new THREE.Group();

    // Carbon Arm Strut
    const armGeo = new THREE.BoxGeometry(0.12, 0.08, 1.4);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.7 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.z = 0.7;
    armGroup.add(arm);

    // Motor Nacelle Pod
    const nacelleGeo = new THREE.CylinderGeometry(0.25, 0.2, 0.3, 16);
    const nacelleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.25, metalness: 0.9 });
    const nacelle = new THREE.Mesh(nacelleGeo, nacelleMat);
    nacelle.position.z = 1.35;
    armGroup.add(nacelle);

    // Glowing Thruster Ring
    const thrusterGeo = new THREE.TorusGeometry(0.22, 0.04, 8, 24);
    thrusterGeo.rotateX(Math.PI / 2);
    const thrusterMat = new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xdb2777, emissiveIntensity: 2.5, roughness: 0.1 });
    const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    thruster.position.set(0, -0.15, 1.35);
    armGroup.add(thruster);

    // Rotor Blades (double blade)
    const bladeGroup = new THREE.Group();
    bladeGroup.name = `RotorBlade_${i}`;
    const bladeGeo = new THREE.BoxGeometry(0.9, 0.015, 0.08);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5, metalness: 0.5 });
    const blade1 = new THREE.Mesh(bladeGeo, bladeMat);
    bladeGroup.add(blade1);
    bladeGroup.position.set(0, 0.18, 1.35);
    armGroup.add(bladeGroup);

    armGroup.rotation.y = angle;
    root.add(armGroup);
  }

  // Sensor Optics Camera Gimbal Underneath
  const sensorGroup = new THREE.Group();
  const sensorHousing = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.2, metalness: 0.95 })
  );
  sensorGroup.add(sensorHousing);

  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 2.0 })
  );
  lens.rotateX(Math.PI / 2);
  lens.position.z = 0.18;
  sensorGroup.add(lens);

  sensorGroup.position.y = -0.28;
  root.add(sensorGroup);

  centerAndScaleObject(root, 3.2);
  return root;
}

export function createSciFiMechaHelmet(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Cybernetic_Titan_Helmet';

  // 1. Skull Plate Base
  const skullGeo = new THREE.SphereGeometry(1.2, 32, 24);
  skullGeo.scale(1.0, 1.15, 1.1);
  const skullMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.9 });
  const skull = new THREE.Mesh(skullGeo, skullMat);
  root.add(skull);

  // 2. Angular Visor Mask
  const visorGeo = new THREE.CylinderGeometry(0.85, 0.75, 0.6, 6, 1, false, -Math.PI * 0.45, Math.PI * 0.9);
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 1.5,
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9,
  });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 0.05, 0.55);
  root.add(visor);

  // 3. Side Aeration Ear Pods
  for (const side of [-1, 1]) {
    const earGroup = new THREE.Group();
    const podGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.25, 16);
    podGeo.rotateZ(Math.PI / 2);
    const podMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
    const pod = new THREE.Mesh(podGeo, podMat);
    earGroup.add(pod);

    // Glowing Vent Accents
    const ventGeo = new THREE.TorusGeometry(0.25, 0.03, 8, 16);
    ventGeo.rotateY(Math.PI / 2);
    const ventMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 1.8 });
    const vent = new THREE.Mesh(ventGeo, ventMat);
    vent.position.x = side * 0.14;
    earGroup.add(vent);

    earGroup.position.set(side * 1.18, 0, 0.1);
    root.add(earGroup);
  }

  // 4. Crest Antenna Fin
  const finGeo = new THREE.BoxGeometry(0.08, 0.5, 1.4);
  const finMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.3, metalness: 0.7 });
  const fin = new THREE.Mesh(finGeo, finMat);
  fin.position.set(0, 1.35, -0.1);
  fin.rotation.x = -0.2;
  root.add(fin);

  // 5. Chin Guard Rebreather
  const chinGeo = new THREE.BoxGeometry(0.6, 0.4, 0.5);
  const chinMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.6 });
  const chin = new THREE.Mesh(chinGeo, chinMat);
  chin.position.set(0, -0.7, 0.95);
  chin.rotation.x = 0.3;
  root.add(chin);

  centerAndScaleObject(root, 3.2);
  return root;
}

export function createCrystalBlade(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Arcane_Aether_Blade';

  // 1. Blade Core (Octahedron / Prism Extrusion)
  const bladeGeo = new THREE.ConeGeometry(0.35, 3.6, 4);
  bladeGeo.scale(0.35, 1.0, 1.2);
  bladeGeo.rotateY(Math.PI / 4);
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0x818cf8,
    emissive: 0x4f46e5,
    emissiveIntensity: 1.2,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.92,
  });
  const blade = new THREE.Mesh(bladeGeo, bladeMat);
  blade.position.y = 1.6;
  root.add(blade);

  // 2. Inner Energy Filament (Glowing Spine)
  const spineGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.2, 8);
  const spineMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 3.0 });
  const spine = new THREE.Mesh(spineGeo, spineMat);
  spine.position.y = 1.5;
  root.add(spine);

  // 3. Crossguard (Ornamental Gold / Dark Metal)
  const guardGeo = new THREE.BoxGeometry(1.6, 0.18, 0.35);
  const guardMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.9 });
  const guard = new THREE.Mesh(guardGeo, guardMat);
  guard.position.y = -0.2;
  root.add(guard);

  // Guard Gems
  for (const side of [-1, 1]) {
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12),
      new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xdb2777, emissiveIntensity: 2.0 })
    );
    gem.position.set(side * 0.75, -0.2, 0);
    root.add(gem);
  }

  // 4. Grip Hilt
  const hiltGeo = new THREE.CylinderGeometry(0.11, 0.1, 1.2, 12);
  const hiltMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.8, metalness: 0.2 });
  const hilt = new THREE.Mesh(hiltGeo, hiltMat);
  hilt.position.y = -0.85;
  root.add(hilt);

  // Leather Grip Ribbons
  for (let r = 0; r < 6; r++) {
    const ribbon = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.02, 6, 16),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 })
    );
    ribbon.rotateX(Math.PI / 2);
    ribbon.position.y = -0.4 - r * 0.15;
    root.add(ribbon);
  }

  // 5. Pommel Stone
  const pommelGeo = new THREE.DodecahedronGeometry(0.22);
  const pommelMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.95 });
  const pommel = new THREE.Mesh(pommelGeo, pommelMat);
  pommel.position.y = -1.55;
  root.add(pommel);

  centerAndScaleObject(root, 3.2);
  return root;
}

export function createParametricPavilion(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Parametric_Bio_Pavilion';

  const ribs = 18;
  const ribMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.4,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.65,
  });

  for (let i = 0; i < ribs; i++) {
    const t = i / ribs;
    const angle = t * Math.PI * 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(angle) * 1.8, 0, Math.sin(angle) * 1.8),
      new THREE.Vector3(Math.cos(angle + 0.3) * 1.4, 1.2 + Math.sin(t * Math.PI * 2) * 0.4, Math.sin(angle + 0.3) * 1.4),
      new THREE.Vector3(Math.cos(angle + 0.8) * 0.6, 2.4, Math.sin(angle + 0.8) * 0.6),
      new THREE.Vector3(0, 2.8, 0),
    ]);

    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.06, 8, false);
    const tubeMesh = new THREE.Mesh(tubeGeo, ribMat);
    root.add(tubeMesh);
  }

  // Central Oasis Platform & Light Core
  const baseGeo = new THREE.CylinderGeometry(2.0, 2.2, 0.2, 32);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.3 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -0.1;
  root.add(base);

  const coreOculus = new THREE.Mesh(
    new THREE.TorusGeometry(0.8, 0.08, 16, 32),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 2.2 })
  );
  coreOculus.rotateX(Math.PI / 2);
  coreOculus.position.y = 0.05;
  root.add(coreOculus);

  centerAndScaleObject(root, 3.2);
  return root;
}

export function createOrganicAlienSculpture(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Alien_Organic_Torus';

  const knotGeo = new THREE.TorusKnotGeometry(1.2, 0.35, 128, 32, 3, 5);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    emissive: 0x6d28d9,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.8,
  });
  const mesh = new THREE.Mesh(knotGeo, mat);
  root.add(mesh);

  // Floating bio-spores orbiting
  for (let i = 0; i < 8; i++) {
    const spore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.12, 2),
      new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xdb2777, emissiveIntensity: 2.0 })
    );
    const theta = (i / 8) * Math.PI * 2;
    spore.position.set(Math.cos(theta) * 2.0, Math.sin(i * 1.5) * 0.8, Math.sin(theta) * 2.0);
    root.add(spore);
  }

  centerAndScaleObject(root, 3.2);
  return root;
}

export function createLowPolyCastle(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Stylized_Fortress_Keep';

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9, flatShading: true });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7, flatShading: true });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85, flatShading: true });
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9, flatShading: true });

  // Base Rock Island
  const rockGeo = new THREE.CylinderGeometry(2.2, 2.6, 0.6, 7);
  const rock = new THREE.Mesh(rockGeo, grassMat);
  rock.position.y = -0.3;
  root.add(rock);

  // Central Keep Tower
  const keepGeo = new THREE.BoxGeometry(1.2, 1.8, 1.2);
  const keep = new THREE.Mesh(keepGeo, stoneMat);
  keep.position.y = 0.9;
  root.add(keep);

  // Main Roof
  const mainRoofGeo = new THREE.ConeGeometry(1.1, 0.9, 4);
  mainRoofGeo.rotateY(Math.PI / 4);
  const mainRoof = new THREE.Mesh(mainRoofGeo, roofMat);
  mainRoof.position.y = 2.25;
  root.add(mainRoof);

  // 4 Corner Watchtowers
  const positions = [
    [-1.0, -1.0],
    [1.0, -1.0],
    [-1.0, 1.0],
    [1.0, 1.0],
  ];

  positions.forEach(([x, z]) => {
    const towerGeo = new THREE.CylinderGeometry(0.35, 0.4, 1.6, 8);
    const tower = new THREE.Mesh(towerGeo, stoneMat);
    tower.position.set(x, 0.8, z);
    root.add(tower);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.7, 8), roofMat);
    roof.position.set(x, 1.95, z);
    root.add(roof);
  });

  // Castle Gate
  const gateGeo = new THREE.BoxGeometry(0.4, 0.7, 0.1);
  const gate = new THREE.Mesh(gateGeo, woodMat);
  gate.position.set(0, 0.35, 0.62);
  root.add(gate);

  centerAndScaleObject(root, 3.2);
  return root;
}

/**
 * Generates 3D mesh from a 2D heightmap or depth map
 */
export function createMeshFromHeightmap(
  canvas: HTMLCanvasElement,
  displacementScale: number = 1.0,
  resolution: number = 64
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'DepthMap_3D_Extrusion';

  const ctx = canvas.getContext('2d');
  if (!ctx) return root;

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  const geometry = new THREE.PlaneGeometry(3.0, 3.0, resolution - 1, resolution - 1);
  geometry.rotateX(-Math.PI / 2);
  const posAttr = geometry.attributes.position;
  const positions = posAttr.array as Float32Array;

  for (let i = 0; i < posAttr.count; i++) {
    const u = (i % resolution) / (resolution - 1);
    const v = Math.floor(i / resolution) / (resolution - 1);

    const px = Math.floor(u * (canvas.width - 1));
    const py = Math.floor((1 - v) * (canvas.height - 1));
    const idx = (py * canvas.width + px) * 4;

    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;

    // Displace Y coordinate
    positions[i * 3 + 1] = brightness * displacementScale;
  }

  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.4,
    metalness: 0.3,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, mat);
  root.add(mesh);
  centerAndScaleObject(root, 3.2);
  return root;
}

/**
 * Dynamic Procedural Synthesizer by Keyword / Prompt
 */
export function synthesizeProceduralMesh(prompt: string, style: VisualStyle = 'scifi-hard-surface'): THREE.Group {
  const lower = prompt.toLowerCase();

  if (lower.includes('explorer') || lower.includes('sci-fi') || lower.includes('drone') || lower.includes('quadcopter') || lower.includes('uav')) {
    const hasSearchlight = !lower.includes('no searchlight');
    return createSciFiExplorerDrone({ hasSearchlight });
  }
  if (lower.includes('helmet') || lower.includes('mask') || lower.includes('head') || lower.includes('mecha')) {
    return createSciFiMechaHelmet();
  }
  if (lower.includes('sword') || lower.includes('blade') || lower.includes('weapon') || lower.includes('knife') || lower.includes('dagger')) {
    return createCrystalBlade();
  }
  if (lower.includes('pavilion') || lower.includes('building') || lower.includes('architecture') || lower.includes('dome')) {
    return createParametricPavilion();
  }
  if (lower.includes('sculpture') || lower.includes('alien') || lower.includes('torus') || lower.includes('organic') || lower.includes('creature')) {
    return createOrganicAlienSculpture();
  }
  if (lower.includes('castle') || lower.includes('tower') || lower.includes('fortress') || lower.includes('lowpoly') || lower.includes('game')) {
    return createLowPolyCastle();
  }

  // Default to high fidelity Sci-Fi Explorer Drone
  return createSciFiExplorerDrone();
}
