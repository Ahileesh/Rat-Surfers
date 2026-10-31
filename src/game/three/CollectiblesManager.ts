import * as THREE from 'three';
import { LANE_WIDTH, Lane, CollectibleItem, CollectibleType } from '../../types/game';
import { ProceduralTextures } from './ProceduralTextures';

export class CollectiblesManager {
  public group: THREE.Group;
  private items: CollectibleItem[] = [];
  private nextItemId: number = 1;
  private spawnZ: number = 18;
  private animTime: number = 0;
  private prevHasGliderWings: boolean = false;
  private lastPowerUpZ: number = -999;
  private lastPowerUpType?: CollectibleType;

  // Materials
  private toonGradient: THREE.CanvasTexture;
  private cheeseMat: THREE.MeshToonMaterial;
  private candyMat: THREE.MeshToonMaterial;
  private chocoMat: THREE.MeshToonMaterial;
  private foilMat: THREE.MeshToonMaterial;
  private speedMat: THREE.MeshToonMaterial;
  private magnetMat: THREE.MeshToonMaterial;
  private shieldMat: THREE.MeshToonMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.toonGradient = ProceduralTextures.getToonGradientMap();

    const cheeseTex = ProceduralTextures.getSwissCheeseRealistic();
    this.cheeseMat = new THREE.MeshToonMaterial({
      map: cheeseTex,
      gradientMap: this.toonGradient,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
    });

    const candyTex = ProceduralTextures.getCandyRealistic();
    this.candyMat = new THREE.MeshToonMaterial({
      map: candyTex,
      gradientMap: this.toonGradient,
      emissive: 0xe11d48,
      emissiveIntensity: 0.35,
    });

    const chocoTex = ProceduralTextures.getChocolateRealistic();
    this.chocoMat = new THREE.MeshToonMaterial({
      map: chocoTex,
      gradientMap: this.toonGradient,
      color: 0x5c2b14,
    });

    this.foilMat = new THREE.MeshToonMaterial({
      color: 0xfde047,
      gradientMap: this.toonGradient,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.4,
    });

    this.speedMat = new THREE.MeshToonMaterial({
      color: 0xfbbf24,
      gradientMap: this.toonGradient,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.4,
    });

    this.magnetMat = new THREE.MeshToonMaterial({
      color: 0xff0055,
      gradientMap: this.toonGradient,
      emissive: 0xff0044,
      emissiveIntensity: 1.2,
    });

    this.shieldMat = new THREE.MeshToonMaterial({
      color: 0x00f5ff,
      gradientMap: this.toonGradient,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
    });
  }

  private createCheeseMesh(): THREE.Group {
    const group = new THREE.Group();

    // 3D Swiss Wedge
    const shape = new THREE.Shape();
    shape.moveTo(-0.28, -0.22);
    shape.lineTo(0.28, -0.22);
    shape.lineTo(0, 0.34);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.24,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mesh = new THREE.Mesh(geo, this.cheeseMat);
    mesh.position.z = -0.12;
    mesh.castShadow = true;
    group.add(mesh);

    return group;
  }

  private createCandyMesh(): THREE.Group {
    const group = new THREE.Group();

    // Peppermint swirl body
    const bodyGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.12, 16);
    bodyGeo.rotateX(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, this.candyMat);
    body.castShadow = true;
    group.add(body);

    // Cellophane ruffled twist wrappers on sides
    const wrapGeo = new THREE.ConeGeometry(0.16, 0.22, 8);
    wrapGeo.rotateZ(Math.PI / 2);

    const wrapL = new THREE.Mesh(wrapGeo, this.candyMat);
    wrapL.position.x = -0.32;
    group.add(wrapL);

    const wrapR = new THREE.Mesh(wrapGeo, this.candyMat);
    wrapR.position.x = 0.32;
    wrapR.rotation.z = Math.PI;
    group.add(wrapR);

    return group;
  }

  private createChocoMesh(): THREE.Group {
    const group = new THREE.Group();

    // Chocolate bar slab
    const geo = new THREE.BoxGeometry(0.52, 0.16, 0.36);
    const mesh = new THREE.Mesh(geo, this.chocoMat);
    mesh.castShadow = true;
    group.add(mesh);

    // Gold foil wrap peeling at the end
    const foilGeo = new THREE.BoxGeometry(0.54, 0.18, 0.14);
    const foil = new THREE.Mesh(foilGeo, this.foilMat);
    foil.position.z = -0.12;
    group.add(foil);

    return group;
  }

  private createSpeedCheddarMesh(): THREE.Group {
    const group = new THREE.Group();

    // Clean, iconic golden sprint rocket
    const rocketMat = new THREE.MeshToonMaterial({ color: 0xf59e0b, gradientMap: this.toonGradient });
    const redMat = new THREE.MeshToonMaterial({ color: 0xef4444, gradientMap: this.toonGradient });
    const cyanMat = new THREE.MeshToonMaterial({ color: 0x06b6d4, gradientMap: this.toonGradient });

    // Streamlined rocket fuselage
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.82, 16), rocketMat);
    body.position.y = 0.08;
    group.add(body);

    // Sleek crimson nosecone
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.44, 16), redMat);
    nose.position.y = 0.68;
    group.add(nose);

    // Glowing cyan porthole window
    const windowMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 14), cyanMat);
    windowMesh.rotation.x = Math.PI / 2;
    windowMesh.position.set(0, 0.22, 0.24);
    group.add(windowMesh);

    // 3 Sleek aerodynamic stabilizer fins
    const finGeo = new THREE.BoxGeometry(0.05, 0.3, 0.24);
    for (let f = 0; f < 3; f++) {
      const fin = new THREE.Mesh(finGeo, redMat);
      fin.rotation.y = (f * Math.PI * 2) / 3;
      fin.position.set(
        Math.cos((f * Math.PI * 2) / 3) * 0.26,
        -0.18,
        Math.sin((f * Math.PI * 2) / 3) * 0.26
      );
      group.add(fin);
    }

    // Rocket flame exhaust
    const flameGeo = new THREE.ConeGeometry(0.16, 0.45, 12);
    flameGeo.rotateX(Math.PI);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.name = 'rocketFlame';
    flame.position.set(0, -0.48, 0);
    group.add(flame);

    return group;
  }

  private createMagnetMesh(): THREE.Group {
    const group = new THREE.Group();

    // Classic vibrant cartoon horseshoe magnet in candy red
    const horseshoeGeo = new THREE.TorusGeometry(0.44, 0.13, 14, 24, Math.PI);
    const magnet = new THREE.Mesh(horseshoeGeo, this.magnetMat);
    magnet.rotation.z = Math.PI;
    magnet.position.y = 0.08;
    group.add(magnet);

    // Crisp metallic chrome pole tips
    const tipGeo = new THREE.BoxGeometry(0.26, 0.26, 0.26);
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.15,
      metalness: 0.85,
    });

    const tipL = new THREE.Mesh(tipGeo, silverMat);
    tipL.position.set(-0.44, 0.2, 0);
    group.add(tipL);

    const tipR = new THREE.Mesh(tipGeo, silverMat);
    tipR.position.set(0.44, 0.2, 0);
    group.add(tipR);

    // Glowing cyan magnetic energy arc
    const arcGeo = new THREE.TorusGeometry(0.44, 0.035, 8, 16, Math.PI);
    const arcMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const arc = new THREE.Mesh(arcGeo, arcMat);
    arc.position.y = 0.2;
    group.add(arc);

    return group;
  }

  private createShieldMesh(): THREE.Group {
    const group = new THREE.Group();

    // Translucent iridescent golden-azure shield bubble
    const bubbleGeo = new THREE.SphereGeometry(0.52, 20, 20);
    const bubbleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
    group.add(bubble);

    // Golden cheese emblem badge inside
    const crestGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.1, 6);
    const crestMat = new THREE.MeshToonMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      gradientMap: this.toonGradient,
    });
    const crest = new THREE.Mesh(crestGeo, crestMat);
    crest.rotation.x = Math.PI / 2;
    crest.position.y = 0.02;
    group.add(crest);

    // Mini cheese wedge emblem
    const cheeseCenter = this.createCheeseMesh();
    cheeseCenter.scale.set(0.4, 0.4, 0.4);
    cheeseCenter.position.set(0, 0.02, 0.06);
    group.add(cheeseCenter);

    return group;
  }

  private createWingsMesh(): THREE.Group {
    const group = new THREE.Group();

    // Golden feathered wings
    const wingMat = new THREE.MeshToonMaterial({
      color: 0xfde047,
      emissive: 0xd97706,
      emissiveIntensity: 0.65,
      gradientMap: this.toonGradient,
    });

    const create3DWing = (isLeft: boolean) => {
      const root = new THREE.Group();
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.quadraticCurveTo(0.26, 0.36, 0.82, 0.5);
      shape.quadraticCurveTo(0.92, 0.32, 0.72, 0.14);
      shape.quadraticCurveTo(0.88, 0.02, 0.64, -0.12);
      shape.quadraticCurveTo(0.38, -0.1, 0.08, -0.04);
      shape.closePath();

      const extrudeSettings = {
        depth: 0.1,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.025,
        bevelThickness: 0.025,
      };

      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.center();
      const mesh = new THREE.Mesh(geo, wingMat);
      if (!isLeft) mesh.scale.set(-1, 1, 1);
      mesh.position.set(isLeft ? 0.42 : -0.42, 0.05, 0);
      root.add(mesh);
      return root;
    };

    const leftWing = create3DWing(true);
    leftWing.name = 'flightWingL';
    group.add(leftWing);

    const rightWing = create3DWing(false);
    rightWing.name = 'flightWingR';
    group.add(rightWing);

    // Central golden cheese core
    const cheeseCore = this.createCheeseMesh();
    cheeseCore.scale.set(0.5, 0.5, 0.5);
    cheeseCore.position.set(0, 0.05, 0.02);
    group.add(cheeseCore);

    // Gentle radiant floating halo
    const haloGeo = new THREE.TorusGeometry(0.28, 0.035, 10, 24);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, 0.5, 0);
    group.add(halo);

    return group;
  }

  public update(
    playerZ: number,
    playerX: number,
    playerY: number,
    dt: number,
    hasMagnet: boolean,
    activeObstacles: any[] = [],
    hasGliderWings: boolean = false
  ) {
    const targetSpawnZ = playerZ + 140;

    this.animTime += dt * 3.5;

    while (this.spawnZ < targetSpawnZ) {
      this.spawnItemPattern(this.spawnZ, activeObstacles, hasGliderWings);
      this.spawnZ += 12 + Math.random() * 8;
    }

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.collected || !item.mesh) {
        if (item.mesh) this.group.remove(item.mesh);
        this.items.splice(i, 1);
        continue;
      }

      if (item.z < playerZ - 20) {
        this.group.remove(item.mesh);
        this.items.splice(i, 1);
        continue;
      }

      item.mesh.rotation.y += dt * 2.8;

      // Interactive 3D micro-animations on special power-up models
      const rocketFlame = item.mesh.getObjectByName('rocketFlame');
      if (rocketFlame) {
        rocketFlame.scale.y = 0.8 + Math.sin(this.animTime * 18 + item.id) * 0.35;
        rocketFlame.scale.x = 0.9 + Math.cos(this.animTime * 14 + item.id) * 0.2;
      }

      const flightWingL = item.mesh.getObjectByName('flightWingL');
      const flightWingR = item.mesh.getObjectByName('flightWingR');
      if (flightWingL && flightWingR) {
        const flap = Math.sin(this.animTime * 4 + item.id) * 0.45;
        flightWingL.rotation.y = flap;
        flightWingR.rotation.y = -flap;
      }

      const isTreat = item.type === 'CHEESE' || item.type === 'CANDY' || item.type === 'CHOCO';

      // Only the Horseshoe Magnet attracts treats (Glider Wings does NOT magnetize/pull items)
      const shouldPull = hasMagnet && isTreat;
      if (!shouldPull) {
        item.mesh.position.y = item.y + Math.sin(this.animTime + item.id * 1.4) * 0.08;
      }

      // Horseshoe Magnet pulls treats smoothly to the rat (never pulls power-up items)
      if (shouldPull) {
        const dx = playerX - item.mesh.position.x;
        const dy = (playerY + 0.35) - item.mesh.position.y;
        const dz = playerZ - item.mesh.position.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 160) {
          const dist = Math.sqrt(distSq);
          const pullSpeed = (1 - dist / 12.6) * 32 + 14;
          item.mesh.position.x += (dx / dist) * pullSpeed * dt;
          item.mesh.position.y += (dy / dist) * pullSpeed * dt;
          item.mesh.position.z += (dz / dist) * pullSpeed * dt;
          item.z = item.mesh.position.z;
        } else {
          item.mesh.position.y = item.y + Math.sin(this.animTime + item.id * 1.4) * 0.08;
        }
      }
    }

    // Exact synchronization for Glider Wings transition:
    if (hasGliderWings !== this.prevHasGliderWings) {
      this.prevHasGliderWings = hasGliderWings;
      if (!hasGliderWings) {
        // Landing back on ground:
        // 1. Lower any immediate items near the player to normal ground level
        for (let j = 0; j < this.items.length; j++) {
          const it = this.items[j];
          const isTr = it.type === 'CHEESE' || it.type === 'CANDY' || it.type === 'CHOCO';
          if (isTr && it.mesh) {
            it.y = 0.52;
            it.mesh.position.y = 0.52;
          }
        }
        // 2. Clear any far ahead aerial items so standard ground tracks and normal hurdle arcs spawn immediately
        for (let j = this.items.length - 1; j >= 0; j--) {
          const it = this.items[j];
          if (it.z > playerZ + 15) {
            if (it.mesh) this.group.remove(it.mesh);
            this.items.splice(j, 1);
          }
        }
        this.spawnZ = playerZ + 16;
      } else {
        // Elevate immediate treats during take-off
        for (let j = 0; j < this.items.length; j++) {
          const it = this.items[j];
          const isTr = it.type === 'CHEESE' || it.type === 'CANDY' || it.type === 'CHOCO';
          if (isTr && it.mesh) {
            it.y = 3.2;
            it.mesh.position.y = 3.2;
          }
        }
      }
    }
  }

  private spawnItemPattern(
    startZ: number,
    activeObstacles: any[] = [],
    hasGliderWings: boolean = false
  ) {
    const lanes: Lane[] = [-1, 0, 1];
    let lane = lanes[Math.floor(Math.random() * lanes.length)];
    const rand = Math.random();

    // 1. High-altitude treat line when flying with Glider Wings:
    // Arranged in a single, clean, straight runway line so treats are effortless and fun to collect!
    if (hasGliderWings) {
      const aerialCount = 5;
      for (let i = 0; i < aerialCount; i++) {
        const z = startZ + i * 2.2;
        const y = 3.2; // Perfectly matches rat flight altitude
        const mesh = this.createCheeseMesh();
        mesh.position.set(-lane * LANE_WIDTH, y, z); // Pure straight line in single lane!
        this.group.add(mesh);
        this.items.push({
          id: this.nextItemId++,
          type: 'CHEESE',
          lane,
          z,
          y,
          collected: false,
          mesh,
        });
      }
      return;
    }

    // 2. Power-ups: Guaranteed early special element within 28-36m, then reliable ~48-65m cadence!
    const isFirstPowerUp = this.lastPowerUpZ === -999;
    const distSinceLast = isFirstPowerUp ? startZ : (startZ - this.lastPowerUpZ);
    let shouldSpawnPowerUp = false;

    if (!hasGliderWings) {
      if (isFirstPowerUp && startZ >= 28) {
        shouldSpawnPowerUp = true;
      } else if (!isFirstPowerUp && distSinceLast >= 68) {
        shouldSpawnPowerUp = rand < 0.75;
      } else if (!isFirstPowerUp && distSinceLast >= 48) {
        shouldSpawnPowerUp = rand < 0.40;
      }
    }

    if (shouldSpawnPowerUp) {
      // Find lanes that are 100% clear of ANY obstacle within +/- 6.0m (no barriers, hurdles, gates, pits, or geysers!)
      const safeLanes = lanes.filter(l => {
        return !activeObstacles.some(obs => {
          if (obs.lane !== l) return false;
          const depth = obs.depth || 3.0;
          return Math.abs(obs.z - startZ) < (depth * 0.5 + 6.0);
        });
      });

      if (safeLanes.length === 0) {
        // If track is obstructed across all lanes at this exact spot, don't update lastPowerUpZ so next open segment spawns it
        return;
      }

      lane = safeLanes[Math.floor(Math.random() * safeLanes.length)];
      this.lastPowerUpZ = startZ;

      // Varied rotation: never spawn the same power-up twice in a row!
      const powerPool: CollectibleType[] = ['MAGNET', 'CHEESE_SHIELD', 'SPEED_CHEDDAR', 'GLIDER_WINGS'];
      const candidatePowers = powerPool.filter(p => p !== this.lastPowerUpType);
      const powerType = candidatePowers.length > 0
        ? candidatePowers[Math.floor(Math.random() * candidatePowers.length)]
        : powerPool[Math.floor(Math.random() * powerPool.length)];
      this.lastPowerUpType = powerType;

      let mesh: THREE.Group;
      if (powerType === 'SPEED_CHEDDAR') mesh = this.createSpeedCheddarMesh();
      else if (powerType === 'MAGNET') mesh = this.createMagnetMesh();
      else if (powerType === 'GLIDER_WINGS') mesh = this.createWingsMesh();
      else mesh = this.createShieldMesh();

      const y = 0.85;
      mesh.position.set(-lane * LANE_WIDTH, y, startZ);
      this.group.add(mesh);

      this.items.push({
        id: this.nextItemId++,
        type: powerType,
        lane,
        z: startZ,
        y,
        collected: false,
        mesh,
      });
      return;
    }

    // 3. Smart Treat Placement (ELIMINATES impossible trap items!)
    // If chosen lane has an impassable solid barricade, switch to a lane completely clear of solid blockades
    const nearbySolid = activeObstacles.find(
      obs => !obs.canJumpOver && !obs.canSlideUnder && Math.abs(obs.z - startZ) < 7.5 && obs.lane === lane
    );
    if (nearbySolid) {
      const openLanes = lanes.filter(l => {
        return !activeObstacles.some(
          obs => !obs.canJumpOver && !obs.canSlideUnder && obs.lane === l && Math.abs(obs.z - startZ) < 7.5
        );
      });
      if (openLanes.length > 0) {
        lane = openLanes[Math.floor(Math.random() * openLanes.length)];
      }
    }

    // Check if the lane contains a hurdle (requires jump) or a gate (requires slide)
    const nearbyHurdle = activeObstacles.find(
      obs => obs.canJumpOver && Math.abs(obs.z - (startZ + 4)) < 4.5 && obs.lane === lane
    );
    const nearbySlideGate = activeObstacles.find(
      obs => obs.canSlideUnder && Math.abs(obs.z - (startZ + 4)) < 4.5 && obs.lane === lane
    );

    const count = 4 + Math.floor(Math.random() * 3);
    // ONLY form a jump arc if there is an actual jump hurdle to vault over!
    const isArc = !!nearbyHurdle;
    const treatType: CollectibleType = rand < 0.48 ? 'CHEESE' : rand < 0.78 ? 'CANDY' : 'CHOCO';

    for (let i = 0; i < count; i++) {
      const z = startZ + i * 2.4;
      const progress = i / (count - 1);

      // Check if ANY obstacle overlaps this specific candy z in this lane!
      const overlappingObs = activeObstacles.find(
        obs => obs.lane === lane && Math.abs(obs.z - z) < (obs.depth * 0.5 + 2.2)
      );

      let y = hasGliderWings ? 3.2 : 0.52;

      if (!hasGliderWings) {
        if (overlappingObs) {
          if (overlappingObs.canJumpOver) {
            // Over jump hurdles, candy forms a clean jump vault arc at y = 1.30m!
            y = 1.30;
          } else if (overlappingObs.canSlideUnder) {
            // Under slide arches, candy is cleanly on the ground at y = 0.32m!
            y = 0.32;
          } else {
            // SOLID ROADBLOCK / BARRICADE / CHASM PIT / GEYSER:
            // STRICTLY SKIP: NEVER PLACE COINS INSIDE OR OVERLAPPING BARRIERS!
            continue;
          }
        } else if (isArc) {
          y = 0.52 + Math.sin(progress * Math.PI) * 0.78; // Peaks at y ~ 1.30m matching calibrated rat jump!
        } else if (nearbySlideGate) {
          y = 0.35; // Safe under slide arch
        }
      }

      let mesh: THREE.Group;
      if (treatType === 'CHEESE') mesh = this.createCheeseMesh();
      else if (treatType === 'CANDY') mesh = this.createCandyMesh();
      else mesh = this.createChocoMesh();

      mesh.position.set(-lane * LANE_WIDTH, y, z);
      this.group.add(mesh);

      this.items.push({
        id: this.nextItemId++,
        type: treatType,
        lane,
        z,
        y,
        collected: false,
        mesh,
      });
    }
  }

  public getActiveItems(): CollectibleItem[] {
    return this.items;
  }

  public collectItem(item: CollectibleItem) {
    item.collected = true;
    if (item.mesh) {
      this.group.remove(item.mesh);
    }
  }

  public reset() {
    this.items.forEach(it => {
      if (it.mesh) this.group.remove(it.mesh);
    });
    this.items = [];
    this.spawnZ = 20;
    this.prevHasGliderWings = false;
    this.lastPowerUpZ = -999;
    this.lastPowerUpType = undefined;
  }
}
