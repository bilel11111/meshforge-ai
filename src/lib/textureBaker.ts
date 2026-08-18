/**
 * Procedural PBR Texture Generator & Baker
 * Synthesizes Albedo, Normal, Roughness, Metallic, AO, and Displacement maps.
 */

export interface GeneratedPBRMaps {
  albedo: string;
  normal: string;
  roughness: string;
  metallic: string;
  displacement: string;
  ao: string;
  emission: string;
}

export type TexturePattern = 
  | 'scifi-panels'
  | 'carbon-fiber'
  | 'brushed-metal'
  | 'weathered-stone'
  | 'circuit-board'
  | 'hex-armor'
  | 'organic-skin'
  | 'wood-grain'
  | 'cyber-grid'
  | 'hammered-gold'
  | 'rough-concrete';

export function generateProceduralPBR(
  pattern: TexturePattern,
  baseColor: string = '#4f46e5',
  secondaryColor: string = '#06b6d4',
  roughnessVal: number = 0.4,
  metalnessVal: number = 0.6,
  resolution: number = 512
): GeneratedPBRMaps {
  const width = resolution;
  const height = resolution;

  // 1. Create Canvas for Height/Displacement
  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = width;
  heightCanvas.height = height;
  const heightCtx = heightCanvas.getContext('2d')!;
  const heightImgData = heightCtx.createImageData(width, height);
  const hData = heightImgData.data;

  // 2. Create Canvas for Albedo
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = width;
  albedoCanvas.height = height;
  const albedoCtx = albedoCanvas.getContext('2d')!;
  const albedoImgData = albedoCtx.createImageData(width, height);
  const aData = albedoImgData.data;

  // 3. Create Canvas for Roughness
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const roughCtx = roughCanvas.getContext('2d')!;
  const roughImgData = roughCtx.createImageData(width, height);
  const rData = roughImgData.data;

  // 4. Create Canvas for Metallic
  const metalCanvas = document.createElement('canvas');
  metalCanvas.width = width;
  metalCanvas.height = height;
  const metalCtx = metalCanvas.getContext('2d')!;
  const metalImgData = metalCtx.createImageData(width, height);
  const mData = metalImgData.data;

  // Helper parse hex
  const parseHex = (hex: string) => {
    const c = hex.replace('#', '');
    const num = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const c1 = parseHex(baseColor);
  const c2 = parseHex(secondaryColor);

  // Simple pseudo-random hash for noise
  const hash = (x: number, y: number) => {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  };

  // Generate pixels based on pattern
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const u = x / width;
      const v = y / height;

      let h = 0.5;
      let blend = 0;
      let roughMod = roughnessVal;
      let metalMod = metalnessVal;

      switch (pattern) {
        case 'scifi-panels': {
          const gridX = Math.floor(u * 8);
          const gridY = Math.floor(v * 8);
          const border = (u * 8 - gridX < 0.04) || (v * 8 - gridY < 0.04);
          const bolt = (Math.hypot((u * 8 - gridX) - 0.1, (v * 8 - gridY) - 0.1) < 0.04) ||
                       (Math.hypot((u * 8 - gridX) - 0.9, (v * 8 - gridY) - 0.9) < 0.04);
          
          if (border) {
            h = 0.1;
            blend = 0.9;
            roughMod = 0.8;
            metalMod = 0.2;
          } else if (bolt) {
            h = 0.9;
            blend = 0.3;
            roughMod = 0.2;
            metalMod = 0.9;
          } else {
            const panelNoise = hash(gridX, gridY);
            h = 0.5 + (panelNoise * 0.15);
            blend = panelNoise * 0.4;
            roughMod = roughnessVal + (hash(x, y) * 0.1 - 0.05);
            metalMod = metalnessVal;
          }
          break;
        }

        case 'hex-armor': {
          const hx = u * 16;
          const hy = v * 16 * 1.1547;
          const row = Math.floor(hy);
          const col = Math.floor(hx + (row % 2 === 1 ? 0.5 : 0));
          const fx = (hx + (row % 2 === 1 ? 0.5 : 0)) - col - 0.5;
          const fy = hy - row - 0.5;
          const dist = Math.sqrt(fx * fx + fy * fy);
          const isBorder = dist > 0.42;

          if (isBorder) {
            h = 0.15;
            blend = 0.85;
            roughMod = 0.7;
            metalMod = 0.3;
          } else {
            h = 0.8 - dist * 0.5;
            blend = (1 - dist);
            roughMod = roughnessVal * 0.8;
            metalMod = metalnessVal * 1.1;
          }
          break;
        }

        case 'carbon-fiber': {
          const cellX = Math.floor(u * 32);
          const cellY = Math.floor(v * 32);
          const isLight = (cellX + cellY) % 2 === 0;
          const innerNoise = (x % 4) / 4;
          h = isLight ? 0.6 + innerNoise * 0.2 : 0.3 + innerNoise * 0.2;
          blend = isLight ? 0.2 : 0.8;
          roughMod = 0.15 + (isLight ? 0.1 : 0.0);
          metalMod = 0.1;
          break;
        }

        case 'brushed-metal': {
          const streak = Math.sin(y * 0.5) * 0.2 + hash(0, y) * 0.3 + hash(x * 0.05, y) * 0.1;
          h = 0.5 + streak * 0.25;
          blend = Math.abs(streak);
          roughMod = 0.25 + streak * 0.15;
          metalMod = 0.95;
          break;
        }

        case 'weathered-stone': {
          const n1 = hash(Math.floor(x / 4), Math.floor(y / 4));
          const n2 = hash(Math.floor(x / 16), Math.floor(y / 16));
          const crack = (Math.abs(Math.sin(u * 20 + n1 * 4) + Math.cos(v * 20 + n2 * 4)) < 0.15);
          if (crack) {
            h = 0.1;
            blend = 0.9;
            roughMod = 0.95;
            metalMod = 0.05;
          } else {
            h = 0.4 + n1 * 0.3 + n2 * 0.2;
            blend = n1 * 0.6;
            roughMod = 0.75 + n2 * 0.2;
            metalMod = 0.05;
          }
          break;
        }

        case 'circuit-board': {
          const gx = Math.floor(u * 20);
          const gy = Math.floor(v * 20);
          const isLine = (x % 16 < 2 && hash(gx, 0) > 0.4) || (y % 16 < 2 && hash(0, gy) > 0.4);
          const isNode = Math.hypot((u * 20 - gx) - 0.5, (v * 20 - gy) - 0.5) < 0.2 && hash(gx, gy) > 0.5;

          if (isNode) {
            h = 0.9;
            blend = 0.95;
            roughMod = 0.15;
            metalMod = 0.95;
          } else if (isLine) {
            h = 0.7;
            blend = 0.7;
            roughMod = 0.2;
            metalMod = 0.9;
          } else {
            h = 0.3;
            blend = 0.05;
            roughMod = 0.6;
            metalMod = 0.1;
          }
          break;
        }

        case 'cyber-grid': {
          const lineX = (u * 16) % 1;
          const lineY = (v * 16) % 1;
          const onGrid = lineX < 0.06 || lineY < 0.06;
          if (onGrid) {
            h = 0.95;
            blend = 1.0;
            roughMod = 0.1;
            metalMod = 0.8;
          } else {
            h = 0.2;
            blend = 0.0;
            roughMod = 0.4;
            metalMod = 0.7;
          }
          break;
        }

        case 'hammered-gold': {
          const cell = hash(Math.floor(x / 12), Math.floor(y / 12));
          const cx = (x % 12) - 6;
          const cy = (y % 12) - 6;
          const dist = Math.sqrt(cx * cx + cy * cy) / 6;
          h = 0.7 - dist * 0.3 + cell * 0.2;
          blend = dist * 0.5;
          roughMod = 0.2 + dist * 0.25;
          metalMod = 0.95;
          break;
        }

        default: {
          const n = hash(Math.floor(x / 8), Math.floor(y / 8));
          h = 0.5 + n * 0.3;
          blend = n * 0.5;
          roughMod = roughnessVal;
          metalMod = metalnessVal;
        }
      }

      // Clamp values
      h = Math.max(0, Math.min(1, h));
      blend = Math.max(0, Math.min(1, blend));
      roughMod = Math.max(0, Math.min(1, roughMod));
      metalMod = Math.max(0, Math.min(1, metalMod));

      // Height
      const hByte = Math.floor(h * 255);
      hData[idx] = hByte;
      hData[idx + 1] = hByte;
      hData[idx + 2] = hByte;
      hData[idx + 3] = 255;

      // Albedo
      aData[idx] = Math.floor(c1.r * (1 - blend) + c2.r * blend);
      aData[idx + 1] = Math.floor(c1.g * (1 - blend) + c2.g * blend);
      aData[idx + 2] = Math.floor(c1.b * (1 - blend) + c2.b * blend);
      aData[idx + 3] = 255;

      // Roughness
      const rByte = Math.floor(roughMod * 255);
      rData[idx] = rByte;
      rData[idx + 1] = rByte;
      rData[idx + 2] = rByte;
      rData[idx + 3] = 255;

      // Metallic
      const mByte = Math.floor(metalMod * 255);
      mData[idx] = mByte;
      mData[idx + 1] = mByte;
      mData[idx + 2] = mByte;
      mData[idx + 3] = 255;
    }
  }

  heightCtx.putImageData(heightImgData, 0, 0);
  albedoCtx.putImageData(albedoImgData, 0, 0);
  roughCtx.putImageData(roughImgData, 0, 0);
  metalCtx.putImageData(metalImgData, 0, 0);

  // 5. Generate Sobel Normal Map from Height Map
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = width;
  normalCanvas.height = height;
  const normalCtx = normalCanvas.getContext('2d')!;
  const normalImgData = normalCtx.createImageData(width, height);
  const nData = normalImgData.data;

  const strength = 4.0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const xLeft = (x - 1 + width) % width;
      const xRight = (x + 1) % width;
      const yTop = (y - 1 + height) % height;
      const yBottom = (y + 1) % height;

      const getH = (px: number, py: number) => hData[(py * width + px) * 4] / 255.0;

      // Sobel kernel filter
      const tl = getH(xLeft, yTop);
      const l = getH(xLeft, y);
      const bl = getH(xLeft, yBottom);
      const t = getH(x, yTop);
      const b = getH(x, yBottom);
      const tr = getH(xRight, yTop);
      const r = getH(xRight, y);
      const br = getH(xRight, yBottom);

      const dx = (tr + 2 * r + br) - (tl + 2 * l + bl);
      const dy = (bl + 2 * b + br) - (tl + 2 * t + tr);
      const dz = 1.0 / strength;

      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const nx = -dx / len;
      const ny = -dy / len;
      const nz = dz / len;

      const idx = (y * width + x) * 4;
      nData[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
      nData[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      nData[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      nData[idx + 3] = 255;
    }
  }
  normalCtx.putImageData(normalImgData, 0, 0);

  // 6. Generate Ambient Occlusion map (inverted cavity from height)
  const aoCanvas = document.createElement('canvas');
  aoCanvas.width = width;
  aoCanvas.height = height;
  const aoCtx = aoCanvas.getContext('2d')!;
  const aoImgData = aoCtx.createImageData(width, height);
  const aoData = aoImgData.data;

  for (let i = 0; i < hData.length; i += 4) {
    const rawH = hData[i] / 255;
    const aoVal = Math.floor((0.4 + rawH * 0.6) * 255);
    aoData[i] = aoVal;
    aoData[i + 1] = aoVal;
    aoData[i + 2] = aoVal;
    aoData[i + 3] = 255;
  }
  aoCtx.putImageData(aoImgData, 0, 0);

  // 7. Generate Emission Map (Deep Dark with Glowing Cyan/Blue Panel Accents)
  const emissionCanvas = document.createElement('canvas');
  emissionCanvas.width = width;
  emissionCanvas.height = height;
  const emissionCtx = emissionCanvas.getContext('2d')!;
  const emissionImgData = emissionCtx.createImageData(width, height);
  const eData = emissionImgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const u = x / width;
      const v = y / height;

      // Glow on circuit traces or seams
      const lineX = (u * 16) % 1;
      const lineY = (v * 16) % 1;
      const isGlowNode = (Math.hypot(lineX - 0.5, lineY - 0.5) < 0.15 && hash(Math.floor(u * 16), Math.floor(v * 16)) > 0.6) ||
                         (lineX < 0.05 && hash(Math.floor(u * 16), 0) > 0.7);

      if (isGlowNode) {
        eData[idx] = 56; // 0x38
        eData[idx + 1] = 189; // 0xbd
        eData[idx + 2] = 248; // 0xf8
        eData[idx + 3] = 255;
      } else {
        eData[idx] = 5;
        eData[idx + 1] = 10;
        eData[idx + 2] = 20;
        eData[idx + 3] = 255;
      }
    }
  }
  emissionCtx.putImageData(emissionImgData, 0, 0);

  return {
    albedo: albedoCanvas.toDataURL('image/png'),
    normal: normalCanvas.toDataURL('image/png'),
    roughness: roughCanvas.toDataURL('image/png'),
    metallic: metalCanvas.toDataURL('image/png'),
    displacement: heightCanvas.toDataURL('image/png'),
    ao: aoCanvas.toDataURL('image/png'),
    emission: emissionCanvas.toDataURL('image/png'),
  };
}

/**
 * Generates the specific high-craft PBR Texture Maps for the Sci-Fi Explorer Drone
 */
export function generateDronePBRMaps(resolution: number = 512): GeneratedPBRMaps {
  return generateProceduralPBR('scifi-panels', '#cbd5e1', '#0284c7', 0.35, 0.8, resolution);
}
