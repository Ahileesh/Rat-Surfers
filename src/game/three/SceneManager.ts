/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CavernBiome,
  GameState,
  LANE_WIDTH,
  Lane,
  Mission,
  PlayerStats,
  PowerUpActive,
  PowerUpType,
  ToolUpgradeId,
} from '../../types/game';
import { audioSynth } from '../systems/AudioSynth';
import { InputManager } from '../systems/InputManager';
import { CatModel } from './CatModel';
import { CollectiblesManager } from './CollectiblesManager';
import { ObstacleSpawner } from './ObstacleSpawner';
import { ParticleSystem } from './ParticleSystem';
import { RatModel } from './RatModel';
import { TunnelManager } from './TunnelManager';
import { CandylandVista } from './CandylandVista';

const MISSION_POOL: Omit<Mission, 'id' | 'current' | 'completed'>[] = [
  { title: 'Cheese Feast', description: 'Collect 25 golden cheese', target: 25, reward: 50, type: 'CHEESE' },
  { title: 'Hurdle Hopper', description: 'Jump over 4 obstacles', target: 4, reward: 75, type: 'JUMP' },
  { title: 'Slide Master', description: 'Slide under 2 candy cane gates', target: 2, reward: 75, type: 'SLIDE' },
  { title: 'Distance Scurry', description: 'Dash past 300 meters', target: 300, reward: 100, type: 'DISTANCE' },
  { title: 'Power Snacker', description: 'Grab 2 Power-Ups', target: 2, reward: 60, type: 'POWERUP' },
];

export class SceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private isSoftwareGl: boolean = false;
  private frameId: number = 0;
  private clock: THREE.Clock;

  // World subsystems
  private tunnelManager: TunnelManager;
  private ratModel: RatModel;
  private catModel: CatModel;
  private obstacleSpawner: ObstacleSpawner;
  private collectiblesManager: CollectiblesManager;
  private particleSystem: ParticleSystem;
  private candylandVista: CandylandVista;
  private inputManager: InputManager;
  private graffitiWallMesh!: THREE.Group;

  // Lighting
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.HemisphereLight;
  private ratFollowLight: THREE.PointLight;

  // Gameplay State
  private gameState: GameState = 'MENU';
  private targetLane: Lane = 0;
  private currentLaneX: number = 0;
  private ratY: number = 0;
  private ratZ: number = 0;
  private jumpVelocity: number = 0;
  private isJumping: boolean = false;
  private isSliding: boolean = false;
  private wantsSlideOnLanding: boolean = false;
  private slideTimer: number = 0;
  private stumbleTimer: number = 0;
  private invulnerableTimer: number = 0;

  // Cat State
  private catDistance: number = 10.5;
  private minCatDistance: number = 2.6;
  private maxCatDistance: number = 14.0;
  private catX: number = 0;
  private isCatPouncing: boolean = false;

  // Speed & Progression (Comfortable Subway Surfers pacing)
  private baseSpeed: number = 13.0;
  private currentSpeed: number = 13.0;
  private distanceRun: number = 0;
  private score: number = 0;
  private cheeseCount: number = 0;
  private candyCount: number = 0;
  private chocoCount: number = 0;
  private scoreMultiplier: number = 1;
  private currentBiome: CavernBiome = 'CRYSTAL_CAVERN';

  // Fever Rush & Mission System
  private feverCharge: number = 0;
  private feverTimer: number = 0;
  private missionPoolIndex: number = 0;
  private currentMission: Mission = {
    id: 'm1',
    title: 'Hurdle Hopper',
    description: 'Jump over 4 obstacles',
    target: 4,
    current: 0,
    reward: 75,
    completed: false,
    type: 'JUMP',
  };
  private sprayAudioCooldown: number = 0;

  // Active Power-ups
  private activePowerUps: Map<PowerUpType, PowerUpActive> = new Map();

  // Lane debounce & Tool upgrades
  private lastLaneChangeTime: number = 0;
  private toolLevels: Record<ToolUpgradeId, number> = {
    magnet: 1,
    spring_shoes: 1,
    shield: 1,
    multiplier: 1,
    rocket: 1,
    radar: 1,
    distractor: 1,
    vault: 1,
    wings: 1,
    clover: 1,
    fever_spark: 1,
  };

  // Camera Shake & Hitstop
  private cameraShakeIntensity: number = 0;
  private hitstopTimer: number = 0;

  // Callbacks
  private onStatsUpdate?: (stats: PlayerStats, activeBuffs: PowerUpActive[]) => void;
  private onStateChange?: (state: GameState, finalStats?: PlayerStats) => void;
  private onBiomeBanner?: (biome: CavernBiome) => void;

  constructor(
    container: HTMLElement,
    inputManager: InputManager,
    onStatsUpdate?: (stats: PlayerStats, activeBuffs: PowerUpActive[]) => void,
    onStateChange?: (state: GameState, finalStats?: PlayerStats) => void,
    onBiomeBanner?: (biome: CavernBiome) => void
  ) {
    this.container = container;
    this.inputManager = inputManager;
    this.onStatsUpdate = onStatsUpdate;
    this.onStateChange = onStateChange;
    this.onBiomeBanner = onBiomeBanner;
    this.clock = new THREE.Clock();

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    const width = container.clientWidth || window.innerWidth || 800;
    const height = container.clientHeight || window.innerHeight || 600;
    const aspect = height > 0 ? width / height : 1.0;

    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Bright Light Cartoon Atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbae6fd);
    this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.005);

    // 4. Camera
    this.camera = new THREE.PerspectiveCamera(
      62,
      aspect,
      0.1,
      240
    );
    this.camera.position.set(0, 3.2, -6.5);
    this.camera.lookAt(0, 1.2, 8.0);

    // 5. Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 6. Vibrant Cartoon Animated Lighting Rig
    this.keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    this.keyLight.position.set(6, 16, 8);
    if (!this.isSoftwareGl) {
      this.keyLight.castShadow = true;
      this.keyLight.shadow.mapSize.width = 1024;
      this.keyLight.shadow.mapSize.height = 1024;
      this.keyLight.shadow.camera.near = 0.5;
      this.keyLight.shadow.camera.far = 40;
      this.keyLight.shadow.camera.left = -10;
      this.keyLight.shadow.camera.right = 10;
      this.keyLight.shadow.camera.top = 10;
      this.keyLight.shadow.camera.bottom = -10;
      this.keyLight.shadow.bias = -0.0005;
    }
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.HemisphereLight(0x67e8f9, 0x1e1b4b, 1.25);
    this.scene.add(this.fillLight);

    this.ratFollowLight = new THREE.PointLight(0xfef08a, 2.0, 14);
    this.ratFollowLight.position.set(0, 2.2, 0);
    this.scene.add(this.ratFollowLight);

    // 7. Initialize Game Entities
    this.tunnelManager = new TunnelManager(newBiome => {
      this.currentBiome = newBiome;
      this.updateBiomeAtmosphere(newBiome);
      this.onBiomeBanner?.(newBiome);
    });
    this.scene.add(this.tunnelManager.group);

    this.ratModel = new RatModel();
    this.scene.add(this.ratModel.group);

    this.catModel = new CatModel();
    this.scene.add(this.catModel.group);

    this.obstacleSpawner = new ObstacleSpawner();
    this.scene.add(this.obstacleSpawner.group);

    this.collectiblesManager = new CollectiblesManager();
    this.scene.add(this.collectiblesManager.group);

    this.particleSystem = new ParticleSystem();
    this.scene.add(this.particleSystem.points);

    this.candylandVista = new CandylandVista();
    this.scene.add(this.candylandVista.group);

    // Subway Surfers opening graffiti wall
    this.graffitiWallMesh = this.createSubwayGraffitiWall();
    this.scene.add(this.graffitiWallMesh);

    // 8. Event Listeners
    window.addEventListener('resize', this.handleResize);

    // Start render loop
    this.clock.start();
    this.startLoop();
  }

  private createSubwayGraffitiWall(): THREE.Group {
    const wallGroup = new THREE.Group();

    // 1. Train Car Body
    const bodyGeo = new THREE.BoxGeometry(4.4, 2.7, 0.45);

    // Canvas texture with real Subway Surfers graffiti!
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Subway train cart metal gradient
    const trainGrad = ctx.createLinearGradient(0, 0, 0, 512);
    trainGrad.addColorStop(0, '#0284c7'); // Ocean blue train top
    trainGrad.addColorStop(0.48, '#0ea5e9');
    trainGrad.addColorStop(0.68, '#f8fafc'); // White train stripe
    trainGrad.addColorStop(0.85, '#64748b');
    trainGrad.addColorStop(1, '#1e293b'); // Dark undercarriage
    ctx.fillStyle = trainGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Caution stripes at bottom
    for (let x = 0; x < 1024; x += 55) {
      ctx.beginPath();
      ctx.moveTo(x, 460);
      ctx.lineTo(x + 28, 460);
      ctx.lineTo(x + 12, 512);
      ctx.lineTo(x - 16, 512);
      ctx.closePath();
      ctx.fillStyle = '#facc15';
      ctx.fill();
    }

    // Street Art Subway Graffiti sprayed by Pip!
    // Shadow
    ctx.font = '900 84px sans-serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillText('CHEESE CREW', 144, 234);

    // Neon Green spray letters
    ctx.fillStyle = '#22c55e';
    ctx.fillText('CHEESE CREW', 140, 230);

    // Hot Pink spray outlines & highlights
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#f43f5e';
    ctx.strokeText('CHEESE CREW', 140, 230);

    // Funny cartoon cat face with silly crossed-out whiskers drawn by Pip
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#facc15'; // Yellow spray
    ctx.beginPath();
    ctx.arc(840, 210, 55, 0, Math.PI * 2);
    ctx.stroke();

    // Cat ears
    ctx.beginPath();
    ctx.moveTo(795, 175);
    ctx.lineTo(815, 125);
    ctx.lineTo(845, 165);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(855, 165);
    ctx.lineTo(885, 125);
    ctx.lineTo(895, 175);
    ctx.stroke();

    // Silly X eyes
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(818, 195); ctx.lineTo(838, 215);
    ctx.moveTo(838, 195); ctx.lineTo(818, 215);
    ctx.moveTo(858, 195); ctx.lineTo(878, 215);
    ctx.moveTo(878, 195); ctx.lineTo(858, 215);
    ctx.stroke();

    // Funny tongue sticking out
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(848, 238, 16, 0, Math.PI);
    ctx.fill();

    // Neon spray paint drips
    ctx.fillStyle = '#22c55e';
    [210, 330, 470, 610].forEach(dx => {
      ctx.beginPath();
      ctx.arc(dx, 275, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(dx - 3, 235, 6, 40);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const bodyMat = new THREE.MeshToonMaterial({ map: tex });
    const wallMesh = new THREE.Mesh(bodyGeo, bodyMat);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    wallGroup.add(wallMesh);

    // Train roof curve
    const roofGeo = new THREE.CylinderGeometry(0.25, 0.25, 4.4, 16);
    roofGeo.rotateZ(Math.PI / 2);
    const roofMat = new THREE.MeshToonMaterial({ color: 0x334155 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 1.35, 0);
    wallGroup.add(roof);

    wallGroup.position.set(0, 1.35, 2.3);
    return wallGroup;
  }

  private advanceToNextMission() {
    this.missionPoolIndex = (this.missionPoolIndex + 1) % MISSION_POOL.length;
    const template = MISSION_POOL[this.missionPoolIndex];
    this.currentMission = {
      id: `m_${Date.now()}`,
      title: template.title,
      description: template.description,
      target: template.target,
      current: 0,
      reward: template.reward,
      completed: false,
      type: template.type,
    };
  }

  private recordMissionProgress(type: Mission['type'], delta: number) {
    if (!this.currentMission || this.currentMission.completed) return;
    if (this.currentMission.type === type) {
      if (type === 'DISTANCE') {
        this.currentMission.current = delta;
      } else {
        this.currentMission.current += delta;
      }
      if (this.currentMission.current >= this.currentMission.target) {
        this.currentMission.completed = true;
        this.cheeseCount += this.currentMission.reward;
        audioSynth.playMissionComplete();
        setTimeout(() => {
          this.advanceToNextMission();
        }, 3200);
      }
    }
  }

  private handleResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth || 800;
    const height = this.container.clientHeight || window.innerHeight || 600;
    const aspect = height > 0 ? width / height : 1.0;
    this.camera.aspect = aspect;

    // Mobile-first portrait adaptation: widen FOV on narrow screens so all 3 lanes are clearly visible
    if (aspect < 1.0) {
      this.camera.fov = 72;
    } else {
      this.camera.fov = 62;
    }
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private updateBiomeAtmosphere(biome: CavernBiome) {
    switch (biome) {
      case 'CHEESE_GROTTO':
        this.keyLight.color.setHex(0xfef08a);
        this.fillLight.color.setHex(0xfacc15);
        (this.scene.fog as THREE.FogExp2).color.setHex(0xfde047);
        this.scene.background = new THREE.Color(0xfef9c3);
        break;
      case 'CHOCO_CHASM':
        this.keyLight.color.setHex(0xfbcfe8);
        this.fillLight.color.setHex(0xf472b6);
        (this.scene.fog as THREE.FogExp2).color.setHex(0xf472b6);
        this.scene.background = new THREE.Color(0xfce7f3);
        break;
      case 'CANDY_MINES':
        this.keyLight.color.setHex(0xfbcfe8);
        this.fillLight.color.setHex(0xc084fc);
        (this.scene.fog as THREE.FogExp2).color.setHex(0xc084fc);
        this.scene.background = new THREE.Color(0xf3e8ff);
        break;
      default: // CRYSTAL_CAVERN
        this.keyLight.color.setHex(0xfffbeb);
        this.fillLight.color.setHex(0x38bdf8);
        (this.scene.fog as THREE.FogExp2).color.setHex(0x7dd3fc);
        this.scene.background = new THREE.Color(0xbae6fd);
        break;
    }
  }

  public setGameState(state: GameState) {
    this.gameState = state;
    if (state === 'PLAYING') {
      audioSynth.resume();
    }
    this.onStateChange?.(state, this.getStats());
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public startGame() {
    this.resetRun();
    this.setGameState('PLAYING');
    this.graffitiWallMesh.visible = false;
    audioSynth.playStartChase();
    // Startle cartoon hop as Pip spots the stalking cat and bursts into sprint
    this.isJumping = true;
    this.jumpVelocity = 8.5;
  }

  public setRatSkin(furColor: number, bellyColor: number) {
    this.ratModel.setSkin(furColor, bellyColor);
  }

  public setToolUpgrades(levels: Partial<Record<ToolUpgradeId, number>>) {
    this.toolLevels = { ...this.toolLevels, ...levels };
  }

  public resetRun() {
    this.targetLane = 0;
    this.currentLaneX = 0;
    this.ratY = 0;
    this.ratZ = 0;
    this.jumpVelocity = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.wantsSlideOnLanding = false;
    this.slideTimer = 0;
    this.stumbleTimer = 0;
    this.invulnerableTimer = 0;

    this.feverCharge = 0;
    this.feverTimer = 0;
    this.advanceToNextMission();

    const catBuffer = 5.0 * ((this.toolLevels.distractor - 1) / (this.toolLevels.distractor + 8));
    this.catDistance = 10.5 + catBuffer;
    this.catX = 0;
    this.isCatPouncing = false;

    this.currentSpeed = this.baseSpeed;
    this.distanceRun = 0;
    this.score = 0;
    this.cheeseCount = 0;
    this.candyCount = 0;
    this.chocoCount = 0;
    this.scoreMultiplier = 1 + (this.toolLevels.multiplier - 1) * 0.05;
    this.currentBiome = 'CRYSTAL_CAVERN';
    this.updateBiomeAtmosphere('CRYSTAL_CAVERN');

    this.activePowerUps.clear();
    this.feverCharge = 0;
    this.feverTimer = 0;

    this.cameraShakeIntensity = 0;
    this.hitstopTimer = 0;

    this.tunnelManager.reset();
    this.obstacleSpawner.reset();
    this.collectiblesManager.reset();
    this.particleSystem.reset();
    this.candylandVista.update(0, 0);

    this.ratModel.group.position.set(0, 0, 0);
    this.catModel.group.position.set(0, 0, -this.catDistance);
  }

  private startLoop() {
    const tick = () => {
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05);

      if (this.hitstopTimer > 0) {
        this.hitstopTimer -= dt;
      } else {
        this.updateGame(dt);
      }

      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 40);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updateGame(dt: number) {
    this.handleInput();

    if (this.gameState === 'PLAYING') {
      const hasSpeedCheddar = this.activePowerUps.has('SPEED_CHEDDAR');
      const isFever = this.feverTimer > 0;
      if (isFever) {
        this.feverTimer -= dt;
      }

      // Running speed is steady and comfortable; ONLY accelerates when collecting an explicit SPEED_CHEDDAR booster!
      const targetSpeed = hasSpeedCheddar ? this.baseSpeed * 1.35 : this.baseSpeed;

      this.currentSpeed = THREE.MathUtils.damp(this.currentSpeed, targetSpeed, 4, dt);
      const moveDelta = this.currentSpeed * dt;
      this.ratZ += moveDelta;
      this.distanceRun += moveDelta;

      const effectiveMultiplier = (isFever ? 2 : 1) * this.scoreMultiplier;
      this.score += Math.round(moveDelta * effectiveMultiplier);

      this.recordMissionProgress('DISTANCE', Math.floor(this.distanceRun));

      if (!this.isJumping && !this.isSliding) {
        audioSynth.playFootstep();
      }

      this.updatePowerUps(dt);
      this.updateRatPhysics(dt);
      this.updateCatDynamics(dt, hasSpeedCheddar);
      this.checkCollisions();

      this.tunnelManager.update(this.ratZ, dt);
      this.candylandVista.update(this.ratZ, dt);
      this.obstacleSpawner.update(this.ratZ, this.currentSpeed / this.baseSpeed, dt);

      // ONLY when Magnet power-up is active does the rat have magnetic attraction (never in base run/fever)
      const hasMagnet = this.activePowerUps.has('MAGNET');
      const hasGliderWings = this.activePowerUps.has('GLIDER_WINGS');
      this.collectiblesManager.update(
        this.ratZ,
        this.currentLaneX,
        this.ratY,
        dt,
        hasMagnet,
        this.obstacleSpawner.getActiveObstacles(),
        hasGliderWings
      );

      if (hasSpeedCheddar || isFever) {
        this.particleSystem.emitSpeedTrail(this.ratModel.group.position);
      }
      if (hasGliderWings) {
        this.particleSystem.emitWingsTrail(this.ratModel.group.position);
      }

      this.onStatsUpdate?.(this.getStats(), Array.from(this.activePowerUps.values()));
    } else if (this.gameState === 'MENU') {
      const time = this.clock.getElapsedTime();
      this.graffitiWallMesh.visible = true;

      // 1. Pip the rat shakes spray can and paints graffiti on subway train wall (Subway Surfers opening!)
      this.ratModel.group.position.set(0, 0, 0);
      this.ratModel.updateMenuIdle(dt);

      if (this.ratModel.isSprayingNow) {
        const nozzlePos = this.ratModel.getSprayNozzleWorldPos();
        this.particleSystem.emitSprayPaint(nozzlePos, Math.random() > 0.4 ? 0x22c55e : 0xf43f5e);
        this.sprayAudioCooldown -= dt;
        if (this.sprayAudioCooldown <= 0) {
          audioSynth.playSprayCan();
          this.sprayAudioCooldown = 0.22;
        }
      } else {
        this.sprayAudioCooldown = 0;
      }

      // 2. Shadow the cat stealthily stalking behind on silent paws!
      const catSneakZ = -6.8 + Math.sin(time * 0.8) * 0.35;
      this.catModel.group.position.set(0, 0, catSneakZ);
      this.catModel.updateMenuStalking(dt);

      // 3. Ambient cavern atmosphere
      this.tunnelManager.update(0, dt);
      this.candylandVista.update(0, dt);
    } else if (this.gameState === 'GAMEOVER') {
      this.catModel.update(dt, 4, 1.0, true);
    }

    this.particleSystem.update(dt);

    if (this.gameState === 'PLAYING') {
      const hasGliderWings = this.activePowerUps.has('GLIDER_WINGS');
      this.ratModel.update(
        dt,
        this.currentSpeed,
        this.isJumping,
        this.isSliding,
        this.activePowerUps.has('CHEESE_SHIELD'),
        this.activePowerUps.has('SPEED_CHEDDAR') || this.feverTimer > 0,
        hasGliderWings
      );

      const threatRatio = THREE.MathUtils.clamp(
        1 - (this.catDistance - this.minCatDistance) / (this.maxCatDistance - this.minCatDistance),
        0,
        1
      );
      this.catModel.update(dt, this.currentSpeed, threatRatio, this.isCatPouncing);
    }

    this.updateCamera(dt);
  }

  private handleInput() {
    let action = this.inputManager.popAction();
    while (action) {
      if (this.gameState === 'MENU' && action === 'START') {
        this.startGame();
      } else if (this.gameState === 'PLAYING') {
        switch (action) {
          case 'LEFT': {
            const now = performance.now();
            if (now - this.lastLaneChangeTime >= 115 && this.targetLane > -1) {
              this.targetLane = (this.targetLane - 1) as Lane;
              this.lastLaneChangeTime = now;
            }
            break;
          }
          case 'RIGHT': {
            const now = performance.now();
            if (now - this.lastLaneChangeTime >= 115 && this.targetLane < 1) {
              this.targetLane = (this.targetLane + 1) as Lane;
              this.lastLaneChangeTime = now;
            }
            break;
          }
          case 'JUMP':
            if (!this.isJumping && !this.isSliding) {
              this.isJumping = true;
              // Calibrated jump arc that peaks at ~1.40m to perfectly capture the cheese jump arc
              const springBoost = 1.2 * ((this.toolLevels.spring_shoes - 1) / (this.toolLevels.spring_shoes + 8));
              this.jumpVelocity = 9.2 + springBoost;
              audioSynth.playJump();
            }
            break;
          case 'SLIDE':
            // Downward control: Mid-air fast-fall superhero slam!
            if (this.isJumping || this.ratY > 0) {
              this.jumpVelocity = -36; // Instant superhero slam to ground
              this.wantsSlideOnLanding = true;
            }
            this.isSliding = true;
            this.slideTimer = 0.85; // Clean duration to slide under any barrier
            audioSynth.playSlide();
            this.particleSystem.emitGroundSlideDust(this.ratModel.group.position);
            break;
          case 'PAUSE':
            this.setGameState('PAUSED');
            break;
        }
      } else if (this.gameState === 'PAUSED' && action === 'PAUSE') {
        this.setGameState('PLAYING');
      } else if (this.gameState === 'GAMEOVER' && action === 'START') {
        this.startGame();
      }
      action = this.inputManager.popAction();
    }
  }

  private updateRatPhysics(dt: number) {
    // 1. Horizontal lane damping
    // Camera is placed at -Z looking along +Z: world +X is visually Screen LEFT, and world -X is Screen RIGHT.
    // Negating lane ensures Lane -1 is Left on screen and Lane +1 is Right on screen.
    const targetX = -this.targetLane * LANE_WIDTH;
    const prevLaneX = this.currentLaneX;
    this.currentLaneX = THREE.MathUtils.damp(this.currentLaneX, targetX, 16, dt);
    const laneDelta = this.currentLaneX - prevLaneX;
    this.ratModel.group.rotation.z = -laneDelta * 1.6;

    // 2. Vertical jump / fall / wings flight physics
    const hasGliderWings = this.activePowerUps.has('GLIDER_WINGS');
    if (hasGliderWings) {
      // Smoothly soar into the sky at elevation 3.2m matching aerial treats!
      this.ratY = THREE.MathUtils.damp(this.ratY, 3.2, 8, dt);
      this.jumpVelocity = 0;
      this.isJumping = false;
      if (Math.random() < 0.35) {
        this.particleSystem.emitBurst(this.ratModel.group.position, 0xfacc15, 2, 1);
      }
    } else if (this.isJumping || this.ratY > 0) {
      this.ratY += this.jumpVelocity * dt;
      this.jumpVelocity -= 30 * dt;

      if (this.ratY <= 0) {
        this.ratY = 0;
        this.isJumping = false;
        // Check if landed from a superhero fast fall
        if (this.jumpVelocity < -16 || this.wantsSlideOnLanding) {
          audioSynth.playGroundSlam();
          this.particleSystem.emitSlamRing(this.ratModel.group.position);
          this.isSliding = true;
          this.slideTimer = 0.85;
        }
        this.wantsSlideOnLanding = false;
        this.jumpVelocity = 0;
      }
    }

    // 3. Slide & stumble timers
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (Math.random() < 0.35) {
        this.particleSystem.emitGroundSlideDust(this.ratModel.group.position);
      }
      if (this.slideTimer <= 0) this.isSliding = false;
    }
    if (this.stumbleTimer > 0) this.stumbleTimer -= dt;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;

    // Apply position
    this.ratModel.group.position.set(this.currentLaneX, this.ratY, this.ratZ);
    this.ratFollowLight.position.set(this.currentLaneX, this.ratY + 1.8, this.ratZ + 1);

    this.keyLight.position.set(this.currentLaneX + 8, 15, this.ratZ + 10);
    this.keyLight.target.position.set(this.currentLaneX, this.ratY, this.ratZ);
    this.keyLight.target.updateMatrixWorld();
  }

  private updateCatDynamics(dt: number, hasSpeedCheddar: boolean) {
    if (hasSpeedCheddar) {
      this.catDistance = THREE.MathUtils.damp(this.catDistance, this.maxCatDistance, 3, dt);
    } else if (this.stumbleTimer > 0) {
      this.catDistance -= 3.6 * dt;
    } else {
      this.catDistance = Math.min(this.maxCatDistance, this.catDistance + 0.45 * dt);
    }

    const threatRatio = 1 - (this.catDistance - this.minCatDistance) / (this.maxCatDistance - this.minCatDistance);
    if (threatRatio > 0.6) {
      audioSynth.playCatSnarl(threatRatio);
    }

    if (this.catDistance <= this.minCatDistance && !this.isCatPouncing) {
      this.triggerGameOver();
      return;
    }

    this.catX = THREE.MathUtils.damp(this.catX, this.currentLaneX, 8, dt);
    const catZ = this.ratZ - this.catDistance;
    this.catModel.group.position.set(this.catX, 0, catZ);
  }

  private updatePowerUps(dt: number) {
    this.activePowerUps.forEach((buff, type) => {
      buff.remaining -= dt;
      if (buff.remaining <= 0) {
        this.activePowerUps.delete(type);
        if (type === 'SPEED_CHEDDAR') {
          this.scoreMultiplier = 1;
        }
      }
    });
  }

  private checkCollisions() {
    const hasSpeedCheddar = this.activePowerUps.has('SPEED_CHEDDAR') || this.feverTimer > 0;
    const obstacles = this.obstacleSpawner.getActiveObstacles();

    const ratBounds = {
      minX: this.currentLaneX - 0.24,
      maxX: this.currentLaneX + 0.24,
      minY: this.ratY,
      maxY: this.ratY + (this.isSliding ? 0.32 : 0.82),
      minZ: this.ratZ - 0.20,
      maxZ: this.ratZ + 0.20,
    };

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (obs.passed) continue;

      const obsX = obs.mesh ? obs.mesh.position.x : -obs.lane * LANE_WIDTH;
      // Forgiving obstacle hitboxes: 0.85 scale prevents phantom scrape when dodging between lanes
      const obsMinX = obsX - (obs.width * 0.42);
      const obsMaxX = obsX + (obs.width * 0.42);
      const obsMinZ = obs.z - (obs.depth * 0.42);
      const obsMaxZ = obs.z + (obs.depth * 0.42);

      if (ratBounds.maxZ >= obsMinZ && ratBounds.minZ <= obsMaxZ) {
        if (ratBounds.maxX >= obsMinX && ratBounds.minX <= obsMaxX) {
          // If flying high with Glider Wings (> 1.8m altitude), soar right over ground obstacles!
          const hasGliderWings = this.activePowerUps.has('GLIDER_WINGS');
          if (hasGliderWings && this.ratY > 1.8) {
            obs.passed = true;
            continue;
          }

          let hit = true;

          // Check if player cleared obstacle via jump or slide (Subway Surfers feel)
          if (obs.canJumpOver && (this.isJumping || this.ratY > 0.08)) {
            hit = false;
            obs.passed = true;
            this.recordMissionProgress('JUMP', 1);
          } else if (obs.canSlideUnder && (this.isSliding || this.slideTimer > 0)) {
            hit = false;
            obs.passed = true;
            this.recordMissionProgress('SLIDE', 1);
          }

          if (hit) {
            obs.passed = true;
            this.handleObstacleHit(obs, hasSpeedCheddar);
          }
        }
      } else if (this.ratZ > obsMaxZ) {
        obs.passed = true;
      }
    }

    // Collectibles collision (touch collection; magnetic collection ONLY when Magnet power-up was hit & is active)
    const items = this.collectiblesManager.getActiveItems();
    const hasMagnet = this.activePowerUps.has('MAGNET');
    const isGliding = this.activePowerUps.has('GLIDER_WINGS');

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.collected || !item.mesh) continue;

      const dx = Math.abs(this.currentLaneX - item.mesh.position.x);
      const dy = Math.abs((this.ratY + 0.35) - item.mesh.position.y);
      const dz = Math.abs(this.ratZ - item.mesh.position.z);

      const isTreat = item.type === 'CHEESE' || item.type === 'CANDY' || item.type === 'CHOCO';
      const magnetApplies = hasMagnet && isTreat;

      // When jumping, widen the collection envelope so the rat effortlessly sweeps up every treat in the arc
      const inAir = this.ratY > 0.12;
      const canReachHeight = magnetApplies || (inAir ? dy < 1.35 : dy < 0.78);

      const maxDx = magnetApplies ? 1.35 : (inAir ? 0.78 : 0.65);
      const maxDz = magnetApplies ? 1.55 : (inAir ? 1.25 : 0.95);

      if (dx < maxDx && dz < maxDz && canReachHeight) {
        this.collectiblesManager.collectItem(item);
        this.handleItemCollect(item.type, item.mesh.position);
      }
    }
  }

  private handleObstacleHit(obs: any, hasSpeedCheddar: boolean) {
    if (hasSpeedCheddar) {
      audioSynth.playStumble();
      this.particleSystem.emitBurst(obs.mesh.position, 0xf59e0b, 26, 6);
      this.obstacleSpawner.group.remove(obs.mesh);
      return;
    }

    if (this.invulnerableTimer > 0) return;

    if (this.activePowerUps.has('CHEESE_SHIELD')) {
      this.activePowerUps.delete('CHEESE_SHIELD');
      audioSynth.playShieldDeflect();
      this.particleSystem.emitBurst(this.ratModel.group.position, 0x38bdf8, 20, 5);
      this.invulnerableTimer = 1.0;
      return;
    }

    this.stumbleTimer = 1.2;
    this.invulnerableTimer = 1.4;
    this.catDistance = Math.max(this.minCatDistance + 0.6, this.catDistance - 4.2);
    this.cameraShakeIntensity = 0.5;
    this.hitstopTimer = 0.05;
    this.ratModel.triggerStumble();
    audioSynth.playStumble();
    audioSynth.playCatSnarl(0.9);
    this.particleSystem.emitBurst(this.ratModel.group.position, 0xef4444, 16, 4);

    if (this.catDistance <= this.minCatDistance + 0.8) {
      this.triggerGameOver();
    }
  }

  private handleItemCollect(type: string, position: THREE.Vector3) {
    switch (type) {
      case 'CHEESE':
        this.cheeseCount++;
        this.score += 25 * this.scoreMultiplier;
        this.recordMissionProgress('CHEESE', this.cheeseCount);
        audioSynth.playCollect('CHEESE');
        this.particleSystem.emitBurst(position, 0xfbbf24, 12, 3);

        // Fever Meter charge
        if (this.feverTimer <= 0) {
          this.feverCharge++;
          if (this.feverCharge >= 10) {
            this.feverCharge = 0;
            this.feverTimer = 6.0;
            audioSynth.playFeverRush();
          }
        }
        break;
      case 'CANDY':
        this.candyCount++;
        this.score += 35 * this.scoreMultiplier;
        audioSynth.playCollect('CANDY');
        this.particleSystem.emitBurst(position, 0xec4899, 12, 3);
        break;
      case 'CHOCO':
        this.chocoCount++;
        this.score += 50 * this.scoreMultiplier;
        audioSynth.playCollect('CHOCO');
        this.particleSystem.emitBurst(position, 0x78350f, 12, 3);
        break;
      case 'SPEED_CHEDDAR':
        this.activePowerUps.set('SPEED_CHEDDAR', {
          type: 'SPEED_CHEDDAR',
          duration: 7.0,
          remaining: 7.0,
        });
        this.scoreMultiplier = 3;
        this.recordMissionProgress('POWERUP', 1);
        audioSynth.playPowerUp();
        this.particleSystem.emitBurst(position, 0xf59e0b, 28, 6);
        break;
      case 'MAGNET': {
        const magnetDur = 8.5 + 12.0 * ((this.toolLevels.magnet - 1) / (this.toolLevels.magnet + 10));
        this.activePowerUps.set('MAGNET', {
          type: 'MAGNET',
          duration: magnetDur,
          remaining: magnetDur,
        });
        this.recordMissionProgress('POWERUP', 1);
        audioSynth.playPowerUp();
        this.particleSystem.emitBurst(position, 0xef4444, 20, 5);
        break;
      }
      case 'CHEESE_SHIELD': {
        const shieldDur = 14.0 + 16.0 * ((this.toolLevels.shield - 1) / (this.toolLevels.shield + 12));
        this.activePowerUps.set('CHEESE_SHIELD', {
          type: 'CHEESE_SHIELD',
          duration: shieldDur,
          remaining: shieldDur,
        });
        this.recordMissionProgress('POWERUP', 1);
        audioSynth.playPowerUp();
        this.particleSystem.emitBurst(position, 0x38bdf8, 20, 5);
        break;
      }
      case 'GLIDER_WINGS': {
        const wingsDur = 10.0 + 12.0 * ((this.toolLevels.wings - 1) / (this.toolLevels.wings + 10));
        this.activePowerUps.set('GLIDER_WINGS', {
          type: 'GLIDER_WINGS',
          duration: wingsDur,
          remaining: wingsDur,
        });
        this.recordMissionProgress('POWERUP', 1);
        audioSynth.playGliderTakeoff();
        this.particleSystem.emitBurst(position, 0xfacc15, 28, 6);
        break;
      }
    }
  }

  private triggerGameOver() {
    this.isCatPouncing = true;
    this.setGameState('GAMEOVER');
    audioSynth.playCatPounce();
    audioSynth.playGameOver();
    this.cameraShakeIntensity = 0.8;
  }

  private updateCamera(dt: number) {
    const isPortrait = this.container.clientWidth < this.container.clientHeight;

    if (this.gameState === 'PLAYING') {
      const hasSpeedCheddar = this.activePowerUps.has('SPEED_CHEDDAR') || this.feverTimer > 0;
      const baseFov = isPortrait ? 74 : 62;
      const targetFOV = hasSpeedCheddar ? baseFov + 12 : baseFov;
      this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFOV, 4, dt);
      this.camera.updateProjectionMatrix();

      const targetCamX = this.currentLaneX * 0.65;
      const targetCamY = isPortrait ? 3.4 + this.ratY * 0.5 : 2.8 + this.ratY * 0.55;
      const targetCamZ = isPortrait ? this.ratZ - 7.2 : this.ratZ - 6.0;

      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 12, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 12, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 18, dt);

      if (this.cameraShakeIntensity > 0) {
        this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeIntensity;
        this.camera.position.y += (Math.random() - 0.5) * this.cameraShakeIntensity;
        this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - dt * 2.5);
      }

      this.camera.lookAt(this.currentLaneX * 0.35, this.ratY + 1.1, this.ratZ + (isPortrait ? 8.2 : 7.5));
    } else if (this.gameState === 'MENU') {
      const time = this.clock.getElapsedTime();
      const camX = Math.sin(time * 0.35) * (isPortrait ? 0.9 : 1.8);
      const camY = isPortrait ? 2.3 : 1.9;
      const camZ = isPortrait ? -5.8 : -4.8;
      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(0, 0.45, 0.6);
    } else if (this.gameState === 'GAMEOVER') {
      this.camera.position.set(this.currentLaneX + 1.5, this.ratY + 1.2, this.ratZ - 1.8);
      this.camera.lookAt(this.currentLaneX, this.ratY + 0.6, this.ratZ);
    }
  }

  public getStats(): PlayerStats {
    const biomeLen = 260;
    const progress = (this.distanceRun % biomeLen) / biomeLen;
    return {
      score: this.score,
      distance: Math.floor(this.distanceRun),
      cheeseCount: this.cheeseCount,
      candyCount: this.candyCount,
      chocoCount: this.chocoCount,
      multiplier: (this.feverTimer > 0 ? 2 : 1) * this.scoreMultiplier,
      catDistance: Math.max(2.6, Math.min(14, parseFloat(this.catDistance.toFixed(1)))),
      currentBiome: this.currentBiome,
      biomeProgress: progress,
      feverCharge: this.feverCharge,
      isFeverActive: this.feverTimer > 0,
      activeMission: this.currentMission,
    };
  }

  public destroy() {
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
  }
}
