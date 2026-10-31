/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CavernBiome, LANE_WIDTH } from '../../types/game';
import { ProceduralTextures } from './ProceduralTextures';

export interface CavernChunk {
  group: THREE.Group;
  z: number;
  biome: CavernBiome;
  cavernMesh: THREE.Mesh;
  crystals: THREE.Mesh[];
  crystalLights: THREE.PointLight[];
}

export class TunnelManager {
  public group: THREE.Group;
  private chunks: CavernChunk[] = [];
  private chunkLength: number = 24;
  private chunkCount: number = 12;
  private cavernRadius: number = 5.8;

  private cavernGeo: THREE.BufferGeometry;
  private groundGeo: THREE.PlaneGeometry;
  private groundMat: THREE.MeshToonMaterial;
  private toonGradient: THREE.CanvasTexture;

  private biomeMaterials: Map<CavernBiome, THREE.MeshToonMaterial> = new Map();
  private currentBiome: CavernBiome = 'CRYSTAL_CAVERN';
  private onBiomeChange?: (biome: CavernBiome) => void;

  private crystalGlowTime: number = 0;

  constructor(onBiomeChange?: (biome: CavernBiome) => void) {
    this.group = new THREE.Group();
    this.onBiomeChange = onBiomeChange;
    this.toonGradient = ProceduralTextures.getToonGradientMap();

    // 1. Natural Craggy Cavern Geometry (Displaced cylinder arch)
    const radialSegs = 22;
    const heightSegs = 6;
    const baseGeo = new THREE.CylinderGeometry(
      this.cavernRadius,
      this.cavernRadius,
      this.chunkLength,
      radialSegs,
      heightSegs,
      true,
      -Math.PI / 2,
      Math.PI
    );
    baseGeo.rotateX(Math.PI / 2);

    // Displace vertices with natural rock irregularity
    const pos = baseGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);

      // Noise displacement for natural cragged rock faces
      const noise =
        Math.sin(vx * 1.5 + vz * 0.8) * 0.4 +
        Math.cos(vy * 2.0 + vz * 1.2) * 0.35 +
        (Math.random() - 0.5) * 0.2;

      pos.setX(i, vx + (vx / this.cavernRadius) * noise);
      pos.setY(i, vy + (vy / this.cavernRadius) * noise);
    }
    baseGeo.computeVertexNormals();
    this.cavernGeo = baseGeo;

    // 2. Natural Ground Path
    this.groundGeo = new THREE.PlaneGeometry(this.cavernRadius * 2, this.chunkLength, 8, 8);
    this.groundGeo.rotateX(-Math.PI / 2);
    // Subtle undulation on ground
    const gPos = this.groundGeo.attributes.position;
    for (let i = 0; i < gPos.count; i++) {
      const x = gPos.getX(i);
      if (Math.abs(x) > 3.6) {
        gPos.setY(i, 0.4 + Math.random() * 0.4); // rough banks on cavern edges
      }
    }
    this.groundGeo.computeVertexNormals();

    const groundTex = ProceduralTextures.getCavernGroundTexture();
    groundTex.repeat.set(1, 2);
    this.groundMat = new THREE.MeshToonMaterial({
      map: groundTex,
      gradientMap: this.toonGradient,
    });

    // 3. Biome Cavern Materials (Cartoon Toon Cel Shaded)
    const biomes: CavernBiome[] = ['CRYSTAL_CAVERN', 'CHEESE_GROTTO', 'CHOCO_CHASM', 'CANDY_MINES'];
    biomes.forEach(b => {
      const tex = ProceduralTextures.getRockyCavernTexture(b);
      tex.repeat.set(2, 2);
      const mat = new THREE.MeshToonMaterial({
        map: tex,
        gradientMap: this.toonGradient,
        side: THREE.BackSide,
      });
      this.biomeMaterials.set(b, mat);
    });

    // 4. Initialize Cavern Pool
    for (let i = 0; i < this.chunkCount; i++) {
      const z = i * this.chunkLength - 24;
      const chunk = this.createCavernChunk(z, i, 'CRYSTAL_CAVERN');
      this.chunks.push(chunk);
      this.group.add(chunk.group);
    }
  }

  private getBiomeForDistance(z: number): CavernBiome {
    const biomeLength = 260;
    const idx = Math.floor(Math.max(0, z) / biomeLength) % 4;
    const list: CavernBiome[] = ['CRYSTAL_CAVERN', 'CHEESE_GROTTO', 'CHOCO_CHASM', 'CANDY_MINES'];
    return list[idx];
  }

  private createCavernChunk(z: number, index: number, biome: CavernBiome): CavernChunk {
    const chunkGroup = new THREE.Group();
    chunkGroup.position.z = z;

    // Rocky arched vault
    const cavernMat = this.biomeMaterials.get(biome)!;
    const cavernMesh = new THREE.Mesh(this.cavernGeo, cavernMat);
    cavernMesh.position.y = 1.0;
    chunkGroup.add(cavernMesh);

    // Cavern earth floor
    const groundMesh = new THREE.Mesh(this.groundGeo, this.groundMat);
    groundMesh.position.y = 0;
    groundMesh.receiveShadow = true;
    chunkGroup.add(groundMesh);

    // Natural stone lane markers (glowing crystal pebbles guiding the 3 lanes)
    [-LANE_WIDTH, 0, LANE_WIDTH].forEach(lx => {
      const trailMat = new THREE.MeshBasicMaterial({
        color: biome === 'CHEESE_GROTTO' ? 0xf59e0b : 0x06b6d4,
        transparent: true,
        opacity: 0.35,
      });
      const trailGeo = new THREE.PlaneGeometry(0.3, this.chunkLength);
      trailGeo.rotateX(-Math.PI / 2);
      const trail = new THREE.Mesh(trailGeo, trailMat);
      trail.position.set(lx, 0.02, 0);
      chunkGroup.add(trail);
    });

    // Cavern side crystals and lights (ceiling kept clear and open)
    const crystals: THREE.Mesh[] = [];
    const crystalLights: THREE.PointLight[] = [];

    // Glowing Bioluminescent Crystal Clusters along cavern rock sides
    const crystalGeo = new THREE.ConeGeometry(0.24, 1.2, 5);
    const crystalColor =
      biome === 'CHEESE_GROTTO'
        ? 0xf59e0b
        : biome === 'CHOCO_CHASM'
        ? 0xec4899
        : biome === 'CANDY_MINES'
        ? 0xa855f7
        : 0x06b6d4;

    const crystalMat = new THREE.MeshStandardMaterial({
      color: crystalColor,
      roughness: 0.1,
      metalness: 0.9,
      emissive: crystalColor,
      emissiveIntensity: 0.9,
    });

    [-4.2, 4.2].forEach(sideX => {
      const clusterGroup = new THREE.Group();
      for (let c = 0; c < 4; c++) {
        const cr = new THREE.Mesh(crystalGeo, crystalMat);
        cr.position.set((Math.random() - 0.5) * 0.6, 0.4 + Math.random() * 0.4, (Math.random() - 0.5) * 0.6);
        cr.rotation.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5);
        clusterGroup.add(cr);
        crystals.push(cr);
      }
      clusterGroup.position.set(sideX, 0, (index % 2 === 0 ? 4 : -4));
      chunkGroup.add(clusterGroup);

      const light = new THREE.PointLight(crystalColor, 1.6, 12);
      light.position.set(sideX * 0.8, 1.5, clusterGroup.position.z);
      chunkGroup.add(light);
      crystalLights.push(light);
    });

    // Rickety Suspension Bridge Posts & Ropes along the track edges for Chasm Biome
    if (biome === 'CHOCO_CHASM') {
      const postGeo = new THREE.BoxGeometry(0.18, 1.4, 0.18);
      const ropeGeo = new THREE.CylinderGeometry(0.035, 0.035, this.chunkLength, 8);
      ropeGeo.rotateX(Math.PI / 2);
      const timberMat = new THREE.MeshToonMaterial({ color: 0x451a03, gradientMap: this.toonGradient });
      const ropeMat = new THREE.MeshToonMaterial({ color: 0xb45309, gradientMap: this.toonGradient });

      [-3.4, 3.4].forEach(edgeX => {
        // Continuous rope rail
        const rope = new THREE.Mesh(ropeGeo, ropeMat);
        rope.position.set(edgeX, 0.8, 0);
        chunkGroup.add(rope);

        // Wooden vertical bridge posts spaced every 6m
        for (let pz = -this.chunkLength / 2 + 2; pz < this.chunkLength / 2; pz += 6) {
          const post = new THREE.Mesh(postGeo, timberMat);
          post.position.set(edgeX, 0.7, pz);
          post.rotation.z = (edgeX > 0 ? 1 : -1) * 0.08;
          chunkGroup.add(post);
        }
      });
    }

    return {
      group: chunkGroup,
      z,
      biome,
      cavernMesh,
      crystals,
      crystalLights,
    };
  }

  public update(playerZ: number, dt: number) {
    this.crystalGlowTime += dt * 4;

    const targetBiome = this.getBiomeForDistance(playerZ);
    if (targetBiome !== this.currentBiome) {
      this.currentBiome = targetBiome;
      this.onBiomeChange?.(targetBiome);
    }

    // Crystal glow animation
    this.chunks.forEach(chunk => {
      chunk.crystalLights.forEach(light => {
        const pulse = 1.3 + Math.sin(this.crystalGlowTime + chunk.z * 0.2) * 0.35;
        light.intensity = pulse;
      });
    });

    // Chunk recycling
    const recycleThreshold = playerZ - 30;
    let maxZ = -Infinity;
    this.chunks.forEach(c => {
      if (c.z > maxZ) maxZ = c.z;
    });

    this.chunks.forEach(chunk => {
      if (chunk.z < recycleThreshold) {
        chunk.z = maxZ + this.chunkLength;
        chunk.group.position.z = chunk.z;
        maxZ = chunk.z;

        const newBiome = this.getBiomeForDistance(chunk.z);
        if (chunk.biome !== newBiome) {
          chunk.biome = newBiome;
          chunk.cavernMesh.material = this.biomeMaterials.get(newBiome)!;
        }
      }
    });
  }

  public getCurrentBiome(): CavernBiome {
    return this.currentBiome;
  }

  public reset() {
    this.currentBiome = 'CRYSTAL_CAVERN';
    for (let i = 0; i < this.chunks.length; i++) {
      const z = i * this.chunkLength - 24;
      this.chunks[i].z = z;
      this.chunks[i].group.position.z = z;
      this.chunks[i].biome = 'CRYSTAL_CAVERN';
      this.chunks[i].cavernMesh.material = this.biomeMaterials.get('CRYSTAL_CAVERN')!;
    }
  }
}
