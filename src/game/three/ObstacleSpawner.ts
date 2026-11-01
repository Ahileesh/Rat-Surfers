import * as THREE from 'three';
import { LANE_WIDTH, Lane, ObstacleItem, ObstacleType } from '../../types/game';
import { ProceduralTextures } from './ProceduralTextures';

type PatternType =
  | 'SOLO_JUMP'
  | 'SOLO_SLIDE'
  | 'SOLO_ROADBLOCK'
  | 'JUMP_THEN_SLIDE'
  | 'SLIDE_THEN_JUMP'
  | 'CHICANE_DODGE'
  | 'PINCH_SLIDE'
  | 'PINCH_JUMP'
  | 'DOUBLE_LANE_JUMP'
  | 'DOUBLE_LANE_SLIDE'
  | 'RHYTHMIC_TRIPLE'
  | 'GAUNTLET_ACROBATIC'
  | 'BRIDGE_CHASM_JUMP'
  | 'SWINGING_LANTERN_GAUNTLET'
  | 'DOUBLE_ROADBLOCK'
  | 'ACROBATIC_TRIPLE'
  | 'POPCORN_PRESS';

export class ObstacleSpawner {
  public group: THREE.Group;
  private obstacles: ObstacleItem[] = [];
  private nextObstacleId: number = 1;
  private spawnZ: number = 38;
  private animClock: number = 0;

  // Cartoon Toon Materials for Kids
  private toonGradient: THREE.CanvasTexture;
  private hazardMat: THREE.MeshToonMaterial;
  private stopSignMat: THREE.MeshToonMaterial;
  private slideSignMat: THREE.MeshToonMaterial;
  private jumpSignMat: THREE.MeshToonMaterial;
  private chocoBarricadeMat: THREE.MeshToonMaterial;
  private cheeseHurdleMat: THREE.MeshToonMaterial;
  private candyCaneMat: THREE.MeshToonMaterial;
  private gumdropMat: THREE.MeshToonMaterial;
  private fondueLavaMat: THREE.MeshToonMaterial;
  private beaconGlowMat: THREE.MeshBasicMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.toonGradient = ProceduralTextures.getToonGradientMap();

    // Bright cartoon hazard stripes (Sunny Yellow + Jet Black)
    const hazardTex = ProceduralTextures.getHazardStripeTexture('#facc15', '#0f172a');
    this.hazardMat = new THREE.MeshToonMaterial({
      map: hazardTex,
      gradientMap: this.toonGradient,
    });

    // Kids Cartoon Action Signs
    this.stopSignMat = new THREE.MeshToonMaterial({
      map: ProceduralTextures.getWarningSignTexture('STOP'),
      gradientMap: this.toonGradient,
    });

    this.slideSignMat = new THREE.MeshToonMaterial({
      map: ProceduralTextures.getWarningSignTexture('SLIDE'),
      gradientMap: this.toonGradient,
    });

    this.jumpSignMat = new THREE.MeshToonMaterial({
      map: ProceduralTextures.getWarningSignTexture('JUMP'),
      gradientMap: this.toonGradient,
    });

    // Milk Chocolate Roadblock Barricade
    this.chocoBarricadeMat = new THREE.MeshToonMaterial({
      color: 0x78350f, // Sweet warm milk chocolate
      gradientMap: this.toonGradient,
    });

    // Giant Swiss Cheese Hurdle
    this.cheeseHurdleMat = new THREE.MeshToonMaterial({
      map: ProceduralTextures.getGiantCheeseWheelTexture(),
      gradientMap: this.toonGradient,
    });

    // Peppermint Candy Cane Arch
    this.candyCaneMat = new THREE.MeshToonMaterial({
      map: ProceduralTextures.getCandyCaneStripeTexture(),
      gradientMap: this.toonGradient,
    });

    // Bouncy Jelly Gumdrop
    this.gumdropMat = new THREE.MeshToonMaterial({
      color: 0x10b981, // Vibrant emerald jelly
      gradientMap: this.toonGradient,
    });

    // Molten Bubbling Fondue
    this.fondueLavaMat = new THREE.MeshToonMaterial({
      color: 0xf59e0b, // Warm cheese gold
      gradientMap: this.toonGradient,
    });

    // Flashing Beacon Light
    this.beaconGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff0055,
    });
  }

  // 1. Kids Cartoon Construction Roadblock (STOP Barricade - Must Dodge)
  private createChocolateSlabWallMesh(): THREE.Group {
    const roadblockGroup = new THREE.Group();

    // Two heavy wooden sawhorse legs with bright hazard stripes
    const legGeo = new THREE.BoxGeometry(0.32, 1.4, 0.6);
    const legL = new THREE.Mesh(legGeo, this.hazardMat);
    legL.position.set(-1.0, 0.7, 0);
    legL.castShadow = true;
    roadblockGroup.add(legL);

    const legR = new THREE.Mesh(legGeo, this.hazardMat);
    legR.position.set(1.0, 0.7, 0);
    legR.castShadow = true;
    roadblockGroup.add(legR);

    // Thick chocolate blockade wall
    const wallGeo = new THREE.BoxGeometry(1.95, 2.2, 0.45);
    const wall = new THREE.Mesh(wallGeo, this.chocoBarricadeMat);
    wall.position.y = 1.15;
    wall.castShadow = true;
    roadblockGroup.add(wall);

    // Hazard-striped safety crossbar
    const beamGeo = new THREE.BoxGeometry(2.35, 0.4, 0.52);
    const beam = new THREE.Mesh(beamGeo, this.hazardMat);
    beam.position.set(0, 1.6, 0.02);
    beam.castShadow = true;
    roadblockGroup.add(beam);

    // Prominent "STOP / ROAD CLOSED" cartoon sign
    const signGeo = new THREE.PlaneGeometry(1.6, 0.8);
    const sign = new THREE.Mesh(signGeo, this.stopSignMat);
    sign.position.set(0, 1.05, 0.28);
    roadblockGroup.add(sign);

    // Two flashing cartoon siren beacons on top corners
    const beaconGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.24, 12);
    const beaconL = new THREE.Mesh(beaconGeo, this.beaconGlowMat);
    beaconL.position.set(-0.95, 2.35, 0);
    roadblockGroup.add(beaconL);

    const beaconR = new THREE.Mesh(beaconGeo, this.beaconGlowMat);
    beaconR.position.set(0.95, 2.35, 0);
    roadblockGroup.add(beaconR);

    return roadblockGroup;
  }

  // 2. Kids Cartoon Candy Cane Arch (SLIDE Gate - Must Slide Under!)
  private createCandyCaneGateMesh(): THREE.Group {
    const gateGroup = new THREE.Group();

    // Two candy-striped archway pillars
    const postGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.85, 12);
    const postL = new THREE.Mesh(postGeo, this.candyCaneMat);
    postL.position.set(-1.1, 0.92, 0);
    postL.castShadow = true;
    gateGroup.add(postL);

    const postR = new THREE.Mesh(postGeo, this.candyCaneMat);
    postR.position.set(1.1, 0.92, 0);
    postR.castShadow = true;
    gateGroup.add(postR);

    // Overhead candy crossbeam at height 1.6m
    const barGeo = new THREE.CylinderGeometry(0.16, 0.16, 2.4, 16);
    barGeo.rotateZ(Math.PI / 2);
    const bar = new THREE.Mesh(barGeo, this.candyCaneMat);
    bar.position.set(0, 1.6, 0);
    bar.castShadow = true;
    gateGroup.add(bar);

    // Glowing cartoon "SLIDE ⬇" banner
    const signGeo = new THREE.PlaneGeometry(1.6, 0.8);
    const sign = new THREE.Mesh(signGeo, this.slideSignMat);
    sign.position.set(0, 1.38, 0.12);
    gateGroup.add(sign);

    // Hanging cartoon candy fringe (leaves 0.85m clearance below for sliding)
    const fringeGeo = new THREE.ConeGeometry(0.1, 0.35, 8);
    fringeGeo.rotateX(Math.PI);
    const fringeMat = new THREE.MeshToonMaterial({ color: 0xec4899, gradientMap: this.toonGradient });
    [-0.6, -0.2, 0.2, 0.6].forEach(fx => {
      const f = new THREE.Mesh(fringeGeo, fringeMat);
      f.position.set(fx, 1.15, 0);
      gateGroup.add(f);
    });

    // Glowing cyan cartoon party lanterns on top of pillars
    const lanternGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const l1 = new THREE.Mesh(lanternGeo, lanternMat);
    l1.position.set(-1.1, 1.9, 0);
    gateGroup.add(l1);

    const l2 = new THREE.Mesh(lanternGeo, lanternMat);
    l2.position.set(1.1, 1.9, 0);
    gateGroup.add(l2);

    return gateGroup;
  }

  // 3. Kids Cartoon Cheese Hurdle (Low JUMP Hurdle - Easy to vault over!)
  private createGiantCheeseWheelMesh(): THREE.Group {
    const wheelGroup = new THREE.Group();

    // Sturdy yellow hazard hurdle rack
    const sawhorseGeo = new THREE.BoxGeometry(2.1, 0.2, 0.28);
    const sawhorse = new THREE.Mesh(sawhorseGeo, this.hazardMat);
    sawhorse.position.set(0, 0.25, 0);
    sawhorse.castShadow = true;
    wheelGroup.add(sawhorse);

    const legGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.55, 8);
    [-0.9, 0.9].forEach(lx => {
      const leg = new THREE.Mesh(legGeo, this.hazardMat);
      leg.position.set(lx, 0.28, 0);
      wheelGroup.add(leg);
    });

    // Balanced Swiss cheese hurdle bar across track (0.36m center, 0.58m total height)
    const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.8, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheel = new THREE.Mesh(wheelGeo, this.cheeseHurdleMat);
    wheel.position.y = 0.36;
    wheel.castShadow = true;
    wheel.receiveShadow = true;
    wheelGroup.add(wheel);

    // Glowing "JUMP ⬆" cartoon badge right above hurdle
    const signGeo = new THREE.PlaneGeometry(0.85, 0.32);
    const sign = new THREE.Mesh(signGeo, this.jumpSignMat);
    sign.position.set(0, 0.68, 0.22);
    wheelGroup.add(sign);

    // Cute green cartoon side flags
    const flagGeo = new THREE.ConeGeometry(0.12, 0.3, 3);
    flagGeo.rotateZ(Math.PI / 2);
    const flagMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const f1 = new THREE.Mesh(flagGeo, flagMat);
    f1.position.set(-0.95, 0.42, 0);
    wheelGroup.add(f1);

    const f2 = new THREE.Mesh(flagGeo, flagMat);
    f2.position.set(0.95, 0.42, 0);
    f2.rotation.z = -Math.PI / 2;
    wheelGroup.add(f2);

    return wheelGroup;
  }

  // 4. Kids Cartoon Gumdrop Boulder & Traffic Cones (Low Hurdle - Jump or Dodge)
  private createGumdropBoulderMesh(): THREE.Group {
    const gumdropGroup = new THREE.Group();

    // Cute rounded jelly gumdrop dome
    const dropGeo = new THREE.CylinderGeometry(0.42, 0.72, 0.42, 14);
    const drop = new THREE.Mesh(dropGeo, this.gumdropMat);
    drop.position.y = 0.21;
    drop.castShadow = true;
    gumdropGroup.add(drop);

    // Glowing sugar-crystal crown
    const crownGeo = new THREE.SphereGeometry(0.3, 10, 10);
    const crownMat = new THREE.MeshToonMaterial({ color: 0x34d399, gradientMap: this.toonGradient });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = 0.46;
    gumdropGroup.add(crown);

    // Two cute cartoon orange-and-white traffic cones on sides
    const coneGeo = new THREE.ConeGeometry(0.16, 0.5, 10);
    const coneMat = new THREE.MeshToonMaterial({ color: 0xf97316, gradientMap: this.toonGradient });
    const stripeGeo = new THREE.CylinderGeometry(0.1, 0.13, 0.14, 10);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    [-0.95, 0.95].forEach(cx => {
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(cx, 0.25, 0);
      gumdropGroup.add(cone);

      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(cx, 0.25, 0);
      gumdropGroup.add(stripe);
    });

    return gumdropGroup;
  }

  // 5. Kids Cartoon Fondue Lava Pit (Hot Molten Cheese Pool - Must Jump!)
  private createFonduePitMesh(): THREE.Group {
    const pitGroup = new THREE.Group();

    // Hot bubbling cheese pool
    const poolGeo = new THREE.BoxGeometry(2.3, 0.12, 3.2);
    const pool = new THREE.Mesh(poolGeo, this.fondueLavaMat);
    pool.position.y = 0.06;
    pool.receiveShadow = true;
    pitGroup.add(pool);

    // Striped cartoon caution guard rails on left and right sides
    const railGeo = new THREE.BoxGeometry(0.12, 0.4, 3.2);
    const railL = new THREE.Mesh(railGeo, this.hazardMat);
    railL.position.set(-1.12, 0.25, 0);
    pitGroup.add(railL);

    const railR = new THREE.Mesh(railGeo, this.hazardMat);
    railR.position.set(1.12, 0.25, 0);
    pitGroup.add(railR);

    // Four glowing amber warning cones at corners
    const pylonGeo = new THREE.ConeGeometry(0.16, 0.8, 8);
    const pylonMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    [-1.12, 1.12].forEach(px => {
      [-1.5, 1.5].forEach(pz => {
        const pylon = new THREE.Mesh(pylonGeo, pylonMat);
        pylon.position.set(px, 0.4, pz);
        pitGroup.add(pylon);
      });
    });

    return pitGroup;
  }

  // 6. Rickety Bridge Chasm Gap (Missing planks over dark chasm - Must Jump!)
  private createBridgeGapMesh(): THREE.Group {
    const bridgeGroup = new THREE.Group();

    // Dark empty void chasm pit
    const chasmGeo = new THREE.BoxGeometry(2.35, 0.2, 3.4);
    const chasmMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const chasm = new THREE.Mesh(chasmGeo, chasmMat);
    chasm.position.y = -0.05;
    bridgeGroup.add(chasm);

    // Broken, splintered wooden bridge plank ends on near and far sides
    const plankMat = new THREE.MeshToonMaterial({ color: 0x5c2b14, gradientMap: this.toonGradient });
    const brokenPlankGeo = new THREE.BoxGeometry(0.35, 0.14, 0.9);
    for (let p = -1.0; p <= 1.0; p += 0.42) {
      const nearPlank = new THREE.Mesh(brokenPlankGeo, plankMat);
      nearPlank.position.set(p + (Math.random() - 0.5) * 0.1, 0.08, -1.35 + Math.random() * 0.2);
      nearPlank.rotation.y = (Math.random() - 0.5) * 0.2;
      bridgeGroup.add(nearPlank);

      const farPlank = new THREE.Mesh(brokenPlankGeo, plankMat);
      farPlank.position.set(p + (Math.random() - 0.5) * 0.1, 0.08, 1.35 - Math.random() * 0.2);
      farPlank.rotation.y = (Math.random() - 0.5) * 0.2;
      bridgeGroup.add(farPlank);
    }

    // Heavy frayed hemp rope suspension side rails with warning hazard flags
    const ropeGeo = new THREE.CylinderGeometry(0.045, 0.045, 3.4, 8);
    ropeGeo.rotateX(Math.PI / 2);
    const ropeMat = new THREE.MeshToonMaterial({ color: 0xd97706, gradientMap: this.toonGradient });
    [-1.15, 1.15].forEach(rx => {
      const rope = new THREE.Mesh(ropeGeo, ropeMat);
      rope.position.set(rx, 0.35, 0);
      bridgeGroup.add(rope);

      // Warning hazard post
      const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8);
      [-1.6, 1.6].forEach(pz => {
        const post = new THREE.Mesh(postGeo, this.hazardMat);
        post.position.set(rx, 0.4, pz);
        bridgeGroup.add(post);
      });
    });

    // Red blinking bridge chasm warning cones
    const coneGeo = new THREE.ConeGeometry(0.18, 0.65, 8);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    [-1.0, 1.0].forEach(cx => {
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(cx, 0.32, -1.55);
      bridgeGroup.add(cone);
    });

    return bridgeGroup;
  }

  // 7. Swinging Mine Lantern Pendulum (Swings rhythmically across lanes)
  private createSwingingLanternMesh(): THREE.Group {
    const lanternGroup = new THREE.Group();

    // Sturdy wooden bridge support posts on left and right
    const postGeo = new THREE.BoxGeometry(0.24, 3.4, 0.3);
    const timberMat = new THREE.MeshToonMaterial({ color: 0x451a03, gradientMap: this.toonGradient });
    const postL = new THREE.Mesh(postGeo, timberMat);
    postL.position.set(-1.18, 1.7, 0);
    lanternGroup.add(postL);

    const postR = new THREE.Mesh(postGeo, timberMat);
    postR.position.set(1.18, 1.7, 0);
    lanternGroup.add(postR);

    // Cross beam connecting the arch at top
    const crossGeo = new THREE.BoxGeometry(2.6, 0.28, 0.35);
    const cross = new THREE.Mesh(crossGeo, this.hazardMat);
    cross.position.set(0, 3.25, 0);
    lanternGroup.add(cross);

    // Pendulum pivot group (animated swinging back and forth!)
    const pendulum = new THREE.Group();
    pendulum.name = 'lanternPendulum';
    pendulum.position.set(0, 3.2, 0);

    // Hanging iron chain / rod
    const rodGeo = new THREE.CylinderGeometry(0.035, 0.035, 2.0, 8);
    rodGeo.translate(0, -1.0, 0);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.8 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    pendulum.add(rod);

    // Heavy glowing brass lantern
    const lanternGeo = new THREE.BoxGeometry(0.48, 0.65, 0.48);
    const brassMat = new THREE.MeshToonMaterial({ color: 0xf59e0b, gradientMap: this.toonGradient });
    const lantern = new THREE.Mesh(lanternGeo, brassMat);
    lantern.position.set(0, -2.1, 0);
    pendulum.add(lantern);

    // Glowing core crystal
    const glowGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, -2.1, 0);
    pendulum.add(glow);

    lanternGroup.add(pendulum);
    return lanternGroup;
  }

  // 8. Interactive Popcorn Spring-Press Geyser (Pumps up and down with lively spring motion)
  private createPopcornGeyserMesh(): THREE.Group {
    const popperGroup = new THREE.Group();

    // Red circus popcorn popper kettle barrel
    const baseGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.38, 14);
    const baseMat = new THREE.MeshToonMaterial({ color: 0xef4444, gradientMap: this.toonGradient });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.19;
    base.castShadow = true;
    popperGroup.add(base);

    // Hazard rim
    const rimGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.08, 14);
    const rim = new THREE.Mesh(rimGeo, this.hazardMat);
    rim.position.y = 0.38;
    popperGroup.add(rim);

    // Spring-loaded popcorn piston that bounces up and down!
    const pistonGroup = new THREE.Group();
    pistonGroup.name = 'popperHead';
    pistonGroup.position.y = 0.36;

    const stemGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.38, 8);
    const stemMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    pistonGroup.add(stem);

    // Fluffy puffed buttery popcorn cluster
    const popcornGeo = new THREE.DodecahedronGeometry(0.36, 1);
    const popcornMat = new THREE.MeshToonMaterial({ color: 0xfef08a, gradientMap: this.toonGradient });
    const popcorn = new THREE.Mesh(popcornGeo, popcornMat);
    popcorn.position.y = 0.22;
    popcorn.castShadow = true;
    pistonGroup.add(popcorn);

    // Glowing butter beacon light
    const starGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.y = 0.52;
    pistonGroup.add(star);

    popperGroup.add(pistonGroup);

    return popperGroup;
  }

  // Dynamic Pattern-Based Spawning Engine
  public update(playerZ: number, speedMultiplier: number, dt: number, distanceRun: number = 0) {
    this.animClock += dt;
    const targetSpawnZ = playerZ + 150;

    while (this.spawnZ < targetSpawnZ) {
      this.spawnNextPattern(this.spawnZ, distanceRun, speedMultiplier);
    }

    // Blink beacon lights with cheerful cartoon rhythm
    const beaconFlash = Math.sin(this.animClock * 9) > 0;
    this.beaconGlowMat.color.setHex(beaconFlash ? 0xff0055 : 0x4a0418);

    // Rolling animation on cheese wheels & swinging lanterns
    this.obstacles.forEach(obs => {
      if (obs.type === 'GIANT_CHEESE_WHEEL' && obs.mesh && obs.mesh.children[2]) {
        obs.mesh.children[2].rotation.x += dt * 3.2;
      } else if (obs.type === 'SWINGING_BRIDGE_LANTERN' && obs.mesh) {
        const pendulum = obs.mesh.getObjectByName('lanternPendulum');
        if (pendulum) {
          pendulum.rotation.z = Math.sin(this.animClock * 3.2 + obs.id * 1.5) * 0.72;
        }
      } else if (obs.type === 'POPCORN_GEYSER_PRESS' && obs.mesh) {
        const popperHead = obs.mesh.getObjectByName('popperHead');
        if (popperHead) {
          popperHead.position.y = 0.32 + Math.abs(Math.sin(this.animClock * 4.5 + obs.id * 1.2)) * 0.22;
        }
      }
    });

    // Cleanup passed obstacles
    const despawnZ = playerZ - 20;
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      if (this.obstacles[i].z < despawnZ) {
        const removed = this.obstacles.splice(i, 1)[0];
        if (removed.mesh) {
          this.group.remove(removed.mesh);
        }
      }
    }
  }

  // Select dynamic pattern based on difficulty tier and game progression
  private spawnNextPattern(z: number, distance: number, speedMultiplier: number) {
    // Balanced, rhythmic obstacle cadence (neither too scarce nor too dense)
    let availablePatterns: PatternType[] = [];

    if (distance < 150) {
      // Early run: energetic mix of solo hurdles, slide arches, roadblocks, and light chicane
      availablePatterns = ['SOLO_JUMP', 'SOLO_SLIDE', 'SOLO_ROADBLOCK', 'CHICANE_DODGE', 'POPCORN_PRESS'];
    } else if (distance < 500) {
      // Mid run: rich continuous rhythm with double hurdles, double slide arches, and jump-slide combos
      availablePatterns = [
        'SOLO_ROADBLOCK',
        'SOLO_JUMP',
        'SOLO_SLIDE',
        'POPCORN_PRESS',
        'DOUBLE_LANE_JUMP',
        'DOUBLE_LANE_SLIDE',
        'JUMP_THEN_SLIDE',
        'SLIDE_THEN_JUMP',
        'CHICANE_DODGE',
      ];
    } else {
      // Advanced run: high-energy gauntlet with acrobatic bridge gaps, swinging lanterns, and double roadblocks
      availablePatterns = [
        'SOLO_ROADBLOCK',
        'SOLO_JUMP',
        'SOLO_SLIDE',
        'POPCORN_PRESS',
        'JUMP_THEN_SLIDE',
        'SLIDE_THEN_JUMP',
        'CHICANE_DODGE',
        'DOUBLE_LANE_JUMP',
        'DOUBLE_LANE_SLIDE',
        'PINCH_SLIDE',
        'PINCH_JUMP',
        'BRIDGE_CHASM_JUMP',
        'SWINGING_LANTERN_GAUNTLET',
        'DOUBLE_ROADBLOCK',
        'ACROBATIC_TRIPLE',
      ];
    }

    const selected = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    const patternLength = this.executePattern(selected, z);

    // Progressive difficulty spacing: spacing tightens slightly as distance increases (from ~22m down to ~13m)
    const distanceDifficultyReduction = Math.min(6.5, distance * 0.0025);
    const baseSpacing = Math.max(13, 22 - distanceDifficultyReduction - speedMultiplier * 1.5);
    this.spawnZ += patternLength + baseSpacing + Math.random() * 3.5;
  }

  private executePattern(pattern: PatternType, z: number): number {
    const lanes: Lane[] = [-1, 0, 1];
    const pickLane = () => lanes[Math.floor(Math.random() * lanes.length)];

    switch (pattern) {
      // 1. Single Low Hurdle: Vault over or dodge to either of 2 open lanes
      case 'SOLO_JUMP': {
        const lane = pickLane();
        this.spawnSingleObstacle('GIANT_CHEESE_WHEEL', lane, z);
        return 6;
      }

      case 'POPCORN_PRESS': {
        const lane = pickLane();
        this.spawnSingleObstacle('POPCORN_GEYSER_PRESS', lane, z);
        return 6;
      }

      // 2. Single Slide Gate: Slide under or dodge to either of 2 open lanes
      case 'SOLO_SLIDE': {
        const lane = pickLane();
        this.spawnSingleObstacle('CANDY_CANE_GATE', lane, z);
        return 6;
      }

      // 3. Single Roadblock: Easily dodge left or right into open lanes
      case 'SOLO_ROADBLOCK': {
        const lane = pickLane();
        this.spawnSingleObstacle('CHOCOLATE_SLAB_WALL', lane, z);
        return 6;
      }

      // 4. Hurdle then Slide: Low hurdle in lane A, followed 14m later by slide gate in lane B
      case 'JUMP_THEN_SLIDE': {
        const hurdleLane = pickLane();
        const otherLanes = lanes.filter(l => l !== hurdleLane);
        const slideLane = otherLanes[Math.floor(Math.random() * otherLanes.length)];
        this.spawnSingleObstacle('GIANT_CHEESE_WHEEL', hurdleLane, z);
        this.spawnSingleObstacle('CANDY_CANE_GATE', slideLane, z + 14);
        return 20;
      }

      // 5. Slide then Hurdle: Slide arch in lane A, followed 14m later by low hurdle in lane B
      case 'SLIDE_THEN_JUMP': {
        const slideLane = pickLane();
        const otherLanes = lanes.filter(l => l !== slideLane);
        const hurdleLane = otherLanes[Math.floor(Math.random() * otherLanes.length)];
        this.spawnSingleObstacle('CANDY_CANE_GATE', slideLane, z);
        this.spawnSingleObstacle('GIANT_CHEESE_WHEEL', hurdleLane, z + 14);
        return 20;
      }

      // 6. Balanced Chicane: Lane A blocked at z, Lane B blocked 15m later (clear dodge path)
      case 'CHICANE_DODGE': {
        const firstLane = pickLane();
        const secondLane = lanes.find(l => l !== firstLane)!;
        this.spawnSingleObstacle('CHOCOLATE_SLAB_WALL', firstLane, z);
        this.spawnSingleObstacle('CHOCOLATE_SLAB_WALL', secondLane, z + 15);
        return 21;
      }

      // 7. Pinch Slide: Walls on sides (lanes -1 & 1), slide gate in center lane 0 (or jump onto it)
      case 'PINCH_SLIDE': {
        this.spawnSingleObstacle('CHOCOLATE_SLAB_WALL', -1, z);
        this.spawnSingleObstacle('CANDY_CANE_GATE', 0, z);
        this.spawnSingleObstacle('CHOCOLATE_SLAB_WALL', 1, z);
        return 6;
      }

      // 8. Pinch Jump: Walls on sides (lanes -1 & 1), low hurdle in center lane 0
      case 'PINCH_JUMP': {
        this.spawnSingleObstacle('CHOCOLATE_SLAB_WALL', -1, z);
        this.spawnSingleObstacle('GIANT_CHEESE_WHEEL', 0, z);
        this.spawnSingleObstacle('CHOCOLATE_SLAB_WALL', 1, z);
        return 6;
      }

      // 9. Double Hurdles: 2 lanes have hurdles, 1 open lane or vault
      case 'DOUBLE_LANE_JUMP' as any: {
        const openLane = pickLane();
        lanes.filter(l => l !== openLane).forEach(l => {
          this.spawnSingleObstacle('GIANT_CHEESE_WHEEL', l, z);
        });
        return 6;
      }

      // 10. Double Slide Gates: 2 lanes have slide arches, 1 open lane or slide
      case 'DOUBLE_LANE_SLIDE' as any: {
        const openLane = pickLane();
        lanes.filter(l => l !== openLane).forEach(l => {
          this.spawnSingleObstacle('CANDY_CANE_GATE', l, z);
        });
        return 6;
      }

      case 'RHYTHMIC_TRIPLE': {
        const lane = pickLane();
        this.spawnSingleObstacle('GIANT_CHEESE_WHEEL', lane, z);
        return 6;
      }

      case 'GAUNTLET_ACROBATIC': {
        const lane = pickLane();
        this.spawnSingleObstacle('CANDY_CANE_GATE', lane, z);
        return 6;
      }

      // 11. Bridge Chasm Jump: Two lanes have missing bridge planks, forcing jump or lane switch
      case 'BRIDGE_CHASM_JUMP': {
        const openLane = pickLane();
        lanes.filter(l => l !== openLane).forEach(l => {
          this.spawnSingleObstacle('BRIDGE_GAP_JUMP', l, z);
        });
        return 8;
      }

      // 12. Swinging Lantern Gauntlet: Overhead pendulum lantern + hurdle 10m later
      case 'SWINGING_LANTERN_GAUNTLET': {
        const lane = pickLane();
        this.spawnSingleObstacle('SWINGING_BRIDGE_LANTERN', lane, z);
        const nextLane = lanes.filter(l => l !== lane)[0];
        this.spawnSingleObstacle('GIANT_CHEESE_WHEEL', nextLane, z + 12);
        return 18;
      }

      // 13. Double Roadblock: Two lanes blocked by chocolate wall, 1 clear lane to sprint through
      case 'DOUBLE_ROADBLOCK': {
        const openLane = pickLane();
        lanes.filter(l => l !== openLane).forEach(l => {
          this.spawnSingleObstacle('CHOCOLATE_SLAB_WALL', l, z);
        });
        return 8;
      }

      // 14. Acrobatic Triple: Leap hurdle -> slide under arch -> fast lane dodge
      case 'ACROBATIC_TRIPLE': {
        this.spawnSingleObstacle('GIANT_CHEESE_WHEEL', 0, z);
        this.spawnSingleObstacle('CANDY_CANE_GATE', 0, z + 11);
        this.spawnSingleObstacle('CHOCOLATE_SLAB_WALL', 0, z + 22);
        return 28;
      }

      default:
        this.spawnSingleObstacle('GIANT_CHEESE_WHEEL', 0, z);
        return 6;
    }
  }

  private spawnSingleObstacle(type: ObstacleType, lane: Lane, z: number) {
    let mesh: THREE.Group = this.createChocolateSlabWallMesh();
    let width = 2.0;
    let height = 2.2;
    let depth = 0.5;
    let canJumpOver = false;
    let canSlideUnder = false;

    switch (type) {
      case 'CHOCOLATE_SLAB_WALL':
        mesh = this.createChocolateSlabWallMesh();
        height = 2.2;
        width = 2.0;
        depth = 0.5;
        canJumpOver = false;
        canSlideUnder = false;
        break;

      case 'CANDY_CANE_GATE':
        mesh = this.createCandyCaneGateMesh();
        height = 1.8;
        width = 2.2;
        depth = 0.5;
        canJumpOver = false;
        canSlideUnder = true; // Slide under!
        break;

      case 'GIANT_CHEESE_WHEEL':
        mesh = this.createGiantCheeseWheelMesh();
        height = 0.58;
        width = 1.8;
        depth = 0.4;
        canJumpOver = true; // Friendly cartoon hurdle to vault over!
        canSlideUnder = false;
        break;

      case 'GUMDROP_BOULDER':
        mesh = this.createGumdropBoulderMesh();
        height = 0.54;
        width = 1.75;
        depth = 0.4;
        canJumpOver = true; // Bouncy emerald jelly boulder
        canSlideUnder = false;
        break;

      case 'MELTED_FONDUE_PIT':
        mesh = this.createFonduePitMesh();
        height = 0.15;
        width = 2.0;
        depth = 1.8;
        canJumpOver = true; // Jump over!
        canSlideUnder = false;
        break;

      case 'BRIDGE_GAP_JUMP':
        mesh = this.createBridgeGapMesh();
        height = 0.2;
        width = 2.1;
        depth = 2.2;
        canJumpOver = true; // Must jump over the broken bridge chasm!
        canSlideUnder = false;
        break;

      case 'SWINGING_BRIDGE_LANTERN':
        mesh = this.createSwingingLanternMesh();
        height = 2.2;
        width = 2.1;
        depth = 0.6;
        canJumpOver = false;
        canSlideUnder = true; // Can slide under or dodge swinging arc!
        break;

      case 'POPCORN_GEYSER_PRESS':
        mesh = this.createPopcornGeyserMesh();
        height = 0.55;
        width = 1.7;
        depth = 0.45;
        canJumpOver = true; // Interactive bouncy popper to vault over!
        canSlideUnder = false;
        break;
    }

    // Camera at -Z looking +Z: world +X is Screen LEFT, world -X is Screen RIGHT.
    // Negating lane ensures lane -1 is physically on the left of the screen, and +1 on the right.
    mesh.position.set(-lane * LANE_WIDTH, 0, z);
    this.group.add(mesh);

    const obs: ObstacleItem = {
      id: this.nextObstacleId++,
      type,
      lane,
      z,
      width,
      height,
      depth,
      y: 0,
      mesh,
      canJumpOver,
      canSlideUnder,
      passed: false,
    };

    this.obstacles.push(obs);
  }

  public getActiveObstacles(): ObstacleItem[] {
    return this.obstacles;
  }

  public getObstacles(): ObstacleItem[] {
    return this.obstacles;
  }

  public reset() {
    for (const obs of this.obstacles) {
      if (obs.mesh) this.group.remove(obs.mesh);
    }
    this.obstacles = [];
    this.spawnZ = 38;
  }
}
