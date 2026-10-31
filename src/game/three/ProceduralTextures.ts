/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CavernBiome } from '../../types/game';

export class ProceduralTextures {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  public static getToonGradientMap(): THREE.CanvasTexture {
    const key = 'toon_gradient_map_4step';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 1;
    const ctx = canvas.getContext('2d')!;

    // 4 stepped cartoon cel bands: shadow, dark tone, midtone, highlight
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(1, 0, 1, 1);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(2, 0, 1, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 0, 1, 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    this.cache.set(key, texture);
    return texture;
  }

  public static getHazardStripeTexture(colorA = '#fbbf24', colorB = '#090d16'): THREE.CanvasTexture {
    const key = `hazard_stripes_${colorA}_${colorB}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = colorA;
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = colorB;
    const stripeW = 32;
    for (let x = -256; x < 512; x += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + stripeW, 0);
      ctx.lineTo(x + stripeW + 256, 256);
      ctx.lineTo(x + 256, 256);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public static getWarningSignTexture(signType: 'DANGER' | 'STOP' | 'SLIDE' | 'JUMP'): THREE.CanvasTexture {
    const key = `warning_sign_${signType}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    if (signType === 'DANGER' || signType === 'STOP') {
      // Bold cartoon hazard road sign
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, 0, 256, 128);

      ctx.fillStyle = '#090d16';
      ctx.fillRect(8, 8, 240, 112);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.strokeRect(12, 12, 232, 104);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '900 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(signType === 'STOP' ? '⛔ ROAD CLOSED' : '⚠️ DANGER ⚠️', 128, 54);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(signType === 'STOP' ? 'BLOCKADE' : 'DO NOT ENTER', 128, 92);
    } else if (signType === 'SLIDE') {
      // Vibrant glowing cartoon slide instruction sign
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(0, 0, 256, 128);

      ctx.fillStyle = '#090d16';
      ctx.fillRect(6, 6, 244, 116);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SLIDE ⬇', 128, 56);

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('▼ DUCK UNDER ▼', 128, 94);
    } else {
      // Vibrant glowing cartoon jump instruction sign
      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, 0, 256, 128);

      ctx.fillStyle = '#090d16';
      ctx.fillRect(6, 6, 244, 116);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('JUMP ⬆', 128, 56);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('▲ LEAP OVER ▲', 128, 94);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public static getRockyCavernTexture(biome: CavernBiome): THREE.CanvasTexture {
    const key = `light_cartoon_cavern_${biome}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Bright, cheerful, light cartoon palette for kids
    let baseColor = '#7dd3fc'; // Bright Sky/Mint
    let accentColor = '#38bdf8';
    let candyColor = '#fef08a';

    if (biome === 'CHEESE_GROTTO') {
      baseColor = '#fde047'; // Bright sunshine cheese yellow
      accentColor = '#facc15';
      candyColor = '#fb923c';
    } else if (biome === 'CHOCO_CHASM') {
      baseColor = '#f472b6'; // Sweet strawberry candy pink
      accentColor = '#ec4899';
      candyColor = '#b45309';
    } else if (biome === 'CANDY_MINES') {
      baseColor = '#c084fc'; // Light magical lavender
      accentColor = '#a855f7';
      candyColor = '#34d399';
    }

    // Base bright rock
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // Playful rounded cartoon candy stone blobs
    for (let i = 0; i < 180; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 16 + Math.random() * 38;

      ctx.fillStyle = Math.random() > 0.5 ? accentColor : 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sparkling cartoon sugar stars & sparkles
    ctx.fillStyle = candyColor;
    for (let s = 0; s < 45; s++) {
      const sx = Math.random() * 512;
      const sy = Math.random() * 512;
      const sz = 6 + Math.random() * 8;
      // 4-pointed cartoon star
      ctx.beginPath();
      ctx.moveTo(sx, sy - sz);
      ctx.lineTo(sx + sz * 0.3, sy - sz * 0.3);
      ctx.lineTo(sx + sz, sy);
      ctx.lineTo(sx + sz * 0.3, sy + sz * 0.3);
      ctx.lineTo(sx, sy + sz);
      ctx.lineTo(sx - sz * 0.3, sy + sz * 0.3);
      ctx.lineTo(sx - sz, sy);
      ctx.lineTo(sx - sz * 0.3, sy - sz * 0.3);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public static getCavernGroundTexture(): THREE.CanvasTexture {
    const key = 'light_cartoon_ground';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Clean, light pastel cobblestone ground
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 512, 512);

    // Cheerful pastel checker cobblestones
    const tileSize = 64;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(c * tileSize + 2, r * tileSize + 2, tileSize - 4, tileSize - 4);
        }
      }
    }

    // 3 Vibrant Colorful Subway Lanes with Candy Borders
    const laneX = [85, 256, 427];
    const laneColors = ['#0284c7', '#d97706', '#db2777'];

    laneX.forEach((lx, i) => {
      // Lane bed
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(lx - 60, 0, 120, 512);

      // Bright cartoon lane boundary dashes
      ctx.strokeStyle = laneColors[i];
      ctx.lineWidth = 6;
      ctx.setLineDash([24, 16]);
      ctx.beginPath();
      ctx.moveTo(lx - 58, 0);
      ctx.lineTo(lx - 58, 512);
      ctx.moveTo(lx + 58, 0);
      ctx.lineTo(lx + 58, 512);
      ctx.stroke();

      // Cheerful Cartoon Directional Arrows in lane center (▲ ▲ ▲)
      ctx.setLineDash([]);
      ctx.fillStyle = laneColors[i];
      for (let y = 40; y < 512; y += 120) {
        ctx.beginPath();
        ctx.moveTo(lx, y);
        ctx.lineTo(lx + 18, y + 26);
        ctx.lineTo(lx - 18, y + 26);
        ctx.closePath();
        ctx.fill();
      }
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public static getGiantCheeseWheelTexture(): THREE.CanvasTexture {
    const key = 'giant_cheese_wheel';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Golden Swiss cheese curd
    const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(0.85, '#d97706');
    grad.addColorStop(1, '#b45309'); // rustic wax rind rim
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Deep Swiss cheese eyes / holes
    const holes = [
      { x: 120, y: 140, r: 52 },
      { x: 380, y: 150, r: 68 },
      { x: 260, y: 310, r: 84 },
      { x: 120, y: 390, r: 44 },
      { x: 410, y: 380, r: 48 },
      { x: 250, y: 90, r: 36 },
    ];

    holes.forEach(h => {
      const hg = ctx.createRadialGradient(h.x - 8, h.y - 8, 4, h.x, h.y, h.r);
      hg.addColorStop(0, '#78350f');
      hg.addColorStop(0.7, '#92400e');
      hg.addColorStop(1, '#f59e0b');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      ctx.fill();

      // Golden highlight rim
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0.6 * Math.PI, 1.4 * Math.PI);
      ctx.stroke();
    });

    // Stamp mark: "GRAND SWISS 1889"
    ctx.font = 'bold 24px "Chakra Petch", sans-serif';
    ctx.fillStyle = 'rgba(120, 53, 15, 0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('★ ALPINE CHEDDAR ★', 256, 260);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public static getCandyCaneStripeTexture(): THREE.CanvasTexture {
    const key = 'candy_cane_stripe';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Crisp gloss white base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    // Diagonal cherry candy cane stripes
    ctx.fillStyle = '#e11d48';
    const stripeWidth = 36;
    for (let x = -256; x < 512; x += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + stripeWidth, 0);
      ctx.lineTo(x + stripeWidth + 256, 256);
      ctx.lineTo(x + 256, 256);
      ctx.closePath();
      ctx.fill();
    }

    // Fine green accent stripe
    ctx.fillStyle = '#10b981';
    for (let x = -256; x < 512; x += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(x - 8, 0);
      ctx.lineTo(x - 2, 0);
      ctx.lineTo(x - 2 + 256, 256);
      ctx.lineTo(x - 8 + 256, 256);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public static getChocolateSlabTexture(): THREE.CanvasTexture {
    const key = 'chocolate_slab_tex';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Rich dark cocoa
    ctx.fillStyle = '#261006';
    ctx.fillRect(0, 0, 256, 256);

    // 2x2 beveled cocoa blocks
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const x = c * 128 + 8;
        const y = r * 128 + 8;
        ctx.fillStyle = '#3a1b0d';
        ctx.fillRect(x, y, 112, 112);
        ctx.fillStyle = '#542612';
        ctx.fillRect(x + 4, y + 4, 104, 8);
        ctx.fillRect(x + 4, y + 4, 8, 104);
        ctx.fillStyle = '#1a0802';
        ctx.fillRect(x + 104, y + 4, 8, 104);
        ctx.fillRect(x + 4, y + 104, 104, 8);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public static getGumdropSugarTexture(): THREE.CanvasTexture {
    const key = 'gumdrop_sugar';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Translucent emerald / berry jelly
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, 0, 256, 256);

    // Crystalline sugar speckles
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(x, y, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public static getMeltingFondueTexture(): THREE.CanvasTexture {
    const key = 'melting_fondue';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Molten golden cheese
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, 256, 256);

    // Swirling fondue bubbles
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = 8 + Math.random() * 22;
      const bg = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, r);
      bg.addColorStop(0, '#fef08a');
      bg.addColorStop(0.7, '#d97706');
      bg.addColorStop(1, '#92400e');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public static getSwissCheeseRealistic(): THREE.CanvasTexture {
    const key = 'cheese_realistic';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const cheeseGrad = ctx.createRadialGradient(256, 256, 40, 256, 256, 320);
    cheeseGrad.addColorStop(0, '#fef08a');
    cheeseGrad.addColorStop(0.4, '#fde047');
    cheeseGrad.addColorStop(0.8, '#f59e0b');
    cheeseGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = cheeseGrad;
    ctx.fillRect(0, 0, 512, 512);

    const holes = [
      { x: 90, y: 110, r: 48 },
      { x: 340, y: 130, r: 64 },
      { x: 220, y: 280, r: 76 },
      { x: 410, y: 360, r: 42 },
      { x: 80, y: 400, r: 52 },
      { x: 420, y: 60, r: 32 },
    ];

    holes.forEach(h => {
      const hGrad = ctx.createRadialGradient(h.x - h.r * 0.25, h.y - h.r * 0.25, h.r * 0.1, h.x, h.y, h.r);
      hGrad.addColorStop(0, '#78350f');
      hGrad.addColorStop(0.6, '#92400e');
      hGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = hGrad;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(254, 240, 138, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(h.x + 1, h.y + 1, h.r, 0.6 * Math.PI, 1.4 * Math.PI);
      ctx.stroke();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public static getCandyRealistic(): THREE.CanvasTexture {
    const key = 'candy_realistic';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(256, 256, 250, (i * 2 * Math.PI) / 8, ((i * 2 + 1) * Math.PI) / 8);
      ctx.lineTo(256, 256);
      ctx.closePath();
      ctx.fill();
    }

    const gloss = ctx.createLinearGradient(0, 0, 512, 512);
    gloss.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    gloss.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
    gloss.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public static getChocolateRealistic(): THREE.CanvasTexture {
    const key = 'chocolate_realistic';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#2e1205';
    ctx.fillRect(0, 0, 512, 512);

    const cols = 2;
    const rows = 3;
    const bw = 512 / cols;
    const bh = 512 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * bw + 12;
        const y = r * bh + 12;
        const w = bw - 24;
        const h = bh - 24;

        ctx.fillStyle = '#451a03';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#6b2f0c';
        ctx.fillRect(x + 4, y + 4, w - 8, 6);
        ctx.fillRect(x + 4, y + 4, 6, h - 8);
        ctx.fillStyle = '#1a0802';
        ctx.fillRect(x + w - 10, y + 4, 6, h - 8);
        ctx.fillRect(x + 4, y + h - 10, w - 8, 6);
        ctx.fillStyle = '#381504';
        ctx.fillRect(x + 12, y + 12, w - 24, h - 24);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }
}
