/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ProceduralTextures } from './ProceduralTextures';

export class RatModel {
  public group: THREE.Group;
  private bodyMesh: THREE.Mesh;
  private headGroup: THREE.Group;
  private snoutMesh: THREE.Mesh;
  private noseMesh: THREE.Mesh;
  private leftEarGroup: THREE.Group;
  private rightEarGroup: THREE.Group;
  private leftFrontLeg: THREE.Group;
  private rightFrontLeg: THREE.Group;
  private leftBackLeg: THREE.Group;
  private rightBackLeg: THREE.Group;
  private leftFrontPaw: THREE.Mesh;
  private rightFrontPaw: THREE.Mesh;
  private leftBackPaw: THREE.Mesh;
  private rightBackPaw: THREE.Mesh;
  private tailSegments: THREE.Mesh[] = [];
  private whiskers: THREE.Line[] = [];
  private shieldBubble: THREE.Mesh;
  private speedGlow: THREE.PointLight;
  private heldCheeseMesh: THREE.Group;
  private wingsGroup: THREE.Group;
  private leftWing: THREE.Group;
  private rightWing: THREE.Group;

  private toonGradient: THREE.CanvasTexture;
  private furMaterial: THREE.MeshToonMaterial;
  private bellyMaterial: THREE.MeshToonMaterial;

  private runCycleTime: number = 0;
  private breathingTime: number = 0;
  private currentTailSwish: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.toonGradient = ProceduralTextures.getToonGradientMap();

    // 1. Cute Kid-Friendly Animated Cartoon Materials
    this.furMaterial = new THREE.MeshToonMaterial({
      color: 0xf59e0b, // Warm honey-cheddar cartoon coat
      gradientMap: this.toonGradient,
    });

    this.bellyMaterial = new THREE.MeshToonMaterial({
      color: 0xfef9c3, // Creamy soft marshmallow belly
      gradientMap: this.toonGradient,
    });

    const skinPinkMaterial = new THREE.MeshToonMaterial({
      color: 0xf472b6, // Rosy cute bubblegum pink
      gradientMap: this.toonGradient,
    });

    const eyeWhiteMaterial = new THREE.MeshToonMaterial({
      color: 0xffffff,
      gradientMap: this.toonGradient,
    });

    const eyeIrisMaterial = new THREE.MeshBasicMaterial({
      color: 0x0284c7, // Friendly sparkling sapphire blue cartoon eyes
    });

    const eyePupilMaterial = new THREE.MeshBasicMaterial({
      color: 0x09090b,
    });

    const pawWhiteMaterial = new THREE.MeshToonMaterial({
      color: 0xffffff, // Cute white cartoon paws
      gradientMap: this.toonGradient,
    });

    // 2. Chubby Cute Cartoon Torso
    const bodyGeo = new THREE.SphereGeometry(0.38, 16, 16);
    bodyGeo.scale(0.96, 0.95, 1.45);
    this.bodyMesh = new THREE.Mesh(bodyGeo, this.furMaterial);
    this.bodyMesh.position.set(0, 0.36, 0);
    this.bodyMesh.castShadow = true;
    this.group.add(this.bodyMesh);

    // Fluffy Creamy Tummy
    const bellyGeo = new THREE.SphereGeometry(0.34, 14, 14);
    bellyGeo.scale(0.85, 0.5, 1.25);
    const belly = new THREE.Mesh(bellyGeo, this.bellyMaterial);
    belly.position.set(0, -0.12, 0.08);
    this.bodyMesh.add(belly);

    // 3. Adorable Round Cartoon Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.44, 0.5);

    const skullGeo = new THREE.SphereGeometry(0.26, 16, 16);
    skullGeo.scale(1.05, 0.95, 1.05);
    const skull = new THREE.Mesh(skullGeo, this.furMaterial);
    this.headGroup.add(skull);

    // Chubby Cute Blushing Cheeks
    const cheekGeo = new THREE.SphereGeometry(0.12, 10, 10);
    const cheekMat = new THREE.MeshToonMaterial({ color: 0xf472b6, gradientMap: this.toonGradient });
    const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
    cheekL.position.set(0.19, -0.04, 0.18);
    this.headGroup.add(cheekL);

    const cheekR = new THREE.Mesh(cheekGeo, cheekMat);
    cheekR.position.set(-0.19, -0.04, 0.18);
    this.headGroup.add(cheekR);

    // Cute Soft Cartoon Snout
    const snoutGeo = new THREE.ConeGeometry(0.17, 0.38, 14);
    snoutGeo.rotateX(Math.PI / 2);
    this.snoutMesh = new THREE.Mesh(snoutGeo, this.furMaterial);
    this.snoutMesh.position.set(0, -0.05, 0.26);
    this.headGroup.add(this.snoutMesh);

    // Pink Button Nose
    const noseGeo = new THREE.SphereGeometry(0.065, 12, 12);
    this.noseMesh = new THREE.Mesh(noseGeo, skinPinkMaterial);
    this.noseMesh.position.set(0, -0.03, 0.45);
    this.headGroup.add(this.noseMesh);

    // 4. Giant Expressive Disney-Style Cartoon Eyes
    const scleraGeo = new THREE.SphereGeometry(0.095, 14, 14);
    const irisGeo = new THREE.SphereGeometry(0.068, 12, 12);
    const pupilGeo = new THREE.SphereGeometry(0.045, 10, 10);
    const sparkleBigGeo = new THREE.SphereGeometry(0.024, 6, 6);
    const sparkleSmallGeo = new THREE.SphereGeometry(0.014, 6, 6);
    const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const makeEye = (isLeft: boolean) => {
      const eyeRoot = new THREE.Group();
      const sclera = new THREE.Mesh(scleraGeo, eyeWhiteMaterial);
      sclera.scale.set(0.85, 1.1, 0.75);
      eyeRoot.add(sclera);

      // Blue cartoon iris
      const iris = new THREE.Mesh(irisGeo, eyeIrisMaterial);
      iris.position.set(0, 0, 0.04);
      iris.scale.set(0.85, 1.05, 0.7);
      eyeRoot.add(iris);

      // Black pupil
      const pupil = new THREE.Mesh(pupilGeo, eyePupilMaterial);
      pupil.position.set(0, 0, 0.06);
      eyeRoot.add(pupil);

      // Cute double sparkle catchlights (✨)
      const sp1 = new THREE.Mesh(sparkleBigGeo, sparkleMat);
      sp1.position.set(0.022, 0.025, 0.08);
      eyeRoot.add(sp1);

      const sp2 = new THREE.Mesh(sparkleSmallGeo, sparkleMat);
      sp2.position.set(-0.02, -0.015, 0.08);
      eyeRoot.add(sp2);

      eyeRoot.position.set(isLeft ? 0.15 : -0.15, 0.1, 0.18);
      return eyeRoot;
    };

    this.headGroup.add(makeEye(true));
    this.headGroup.add(makeEye(false));

    // 5. Big Friendly Round Mickey-Style Pink Ears
    const earOuterGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16);
    earOuterGeo.rotateX(Math.PI / 2);
    const earInnerGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.04, 16);
    earInnerGeo.rotateX(Math.PI / 2);

    const makeEar = (isLeft: boolean) => {
      const earGroup = new THREE.Group();
      const outer = new THREE.Mesh(earOuterGeo, this.furMaterial);
      const inner = new THREE.Mesh(earInnerGeo, skinPinkMaterial);
      earGroup.add(outer);
      earGroup.add(inner);
      earGroup.position.set(isLeft ? 0.22 : -0.22, 0.22, -0.04);
      earGroup.rotation.set(-0.2, isLeft ? 0.35 : -0.35, isLeft ? 0.2 : -0.2);
      return earGroup;
    };
    this.leftEarGroup = makeEar(true);
    this.rightEarGroup = makeEar(false);
    this.headGroup.add(this.leftEarGroup);
    this.headGroup.add(this.rightEarGroup);

    // Cute White Cartoon Whiskers
    const whiskerMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    [-0.03, 0.03].forEach(dy => {
      const wl = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.06, -0.04 + dy, 0.36),
        new THREE.Vector3(0.44, -0.02 + dy * 2, 0.34),
      ]);
      const wr = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.06, -0.04 + dy, 0.36),
        new THREE.Vector3(-0.44, -0.02 + dy * 2, 0.34),
      ]);
      const l1 = new THREE.Line(wl, whiskerMat);
      const l2 = new THREE.Line(wr, whiskerMat);
      this.headGroup.add(l1);
      this.headGroup.add(l2);
      this.whiskers.push(l1, l2);
    });

    this.group.add(this.headGroup);

    // 6. Cute Cartoon Limbs with White Paws
    const makeLimb = (isBack: boolean) => {
      const legRoot = new THREE.Group();
      const thighGeo = new THREE.CapsuleGeometry(isBack ? 0.09 : 0.07, 0.22, 8, 8);
      const thigh = new THREE.Mesh(thighGeo, this.furMaterial);
      thigh.position.y = -0.1;
      legRoot.add(thigh);

      // Cute rounded cartoon white paws
      const footGeo = new THREE.BoxGeometry(0.1, 0.05, 0.18);
      const foot = new THREE.Mesh(footGeo, pawWhiteMaterial);
      foot.position.set(0, -0.22, 0.04);
      legRoot.add(foot);
      return { legRoot, foot };
    };

    const fl = makeLimb(false);
    this.leftFrontLeg = fl.legRoot;
    this.leftFrontPaw = fl.foot;
    this.leftFrontLeg.position.set(0.24, 0.28, 0.28);
    this.group.add(this.leftFrontLeg);

    const fr = makeLimb(false);
    this.rightFrontLeg = fr.legRoot;
    this.rightFrontPaw = fr.foot;
    this.rightFrontLeg.position.set(-0.24, 0.28, 0.28);
    this.group.add(this.rightFrontLeg);

    const bl = makeLimb(true);
    this.leftBackLeg = bl.legRoot;
    this.leftBackPaw = bl.foot;
    this.leftBackLeg.position.set(0.26, 0.3, -0.28);
    this.group.add(this.leftBackLeg);

    const br = makeLimb(true);
    this.rightBackLeg = br.legRoot;
    this.rightBackPaw = br.foot;
    this.rightBackLeg.position.set(-0.26, 0.3, -0.28);
    this.group.add(this.rightBackLeg);

    // 7. Bouncy Pink Cartoon Tail
    let parentObj: THREE.Object3D = this.bodyMesh;
    for (let i = 0; i < 8; i++) {
      const radius = 0.04 * (1 - i / 10);
      const segGeo = new THREE.CylinderGeometry(radius, radius * 0.9, 0.16, 8);
      segGeo.rotateX(Math.PI / 2);
      const seg = new THREE.Mesh(segGeo, skinPinkMaterial);
      seg.position.set(0, 0.04, -0.14);
      parentObj.add(seg);
      this.tailSegments.push(seg);
      parentObj = seg;
    }

    // Shield Bubble Effect
    const shieldGeo = new THREE.SphereGeometry(0.95, 16, 16);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.38,
      wireframe: false,
    });
    this.shieldBubble = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldBubble.position.set(0, 0.36, 0);
    this.shieldBubble.visible = false;
    this.group.add(this.shieldBubble);

    this.speedGlow = new THREE.PointLight(0xf59e0b, 0, 6);
    this.speedGlow.position.set(0, 0.6, 0);
    this.group.add(this.speedGlow);

    // Celestial Cheese Glider Wings
    this.wingsGroup = new THREE.Group();
    this.wingsGroup.position.set(0, 0.45, -0.12);

    const wingMat = new THREE.MeshToonMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8,
      gradientMap: this.toonGradient,
      side: THREE.DoubleSide,
    });

    const featherMat = new THREE.MeshToonMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.5,
      gradientMap: this.toonGradient,
      side: THREE.DoubleSide,
    });

    const createSingleWing = (isLeft: boolean) => {
      const wingRoot = new THREE.Group();

      // Main golden flight wing
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.quadraticCurveTo(0.35, 0.45, 0.95, 0.62);
      shape.quadraticCurveTo(0.72, 0.18, 0.62, -0.18);
      shape.quadraticCurveTo(0.28, -0.12, 0, 0);

      const wingGeo = new THREE.ShapeGeometry(shape);
      const wingMesh = new THREE.Mesh(wingGeo, wingMat);
      if (!isLeft) wingMesh.scale.set(-1, 1, 1);
      wingRoot.add(wingMesh);

      // Inner feather trim layer
      const featherShape = new THREE.Shape();
      featherShape.moveTo(0.08, 0.05);
      featherShape.quadraticCurveTo(0.3, 0.35, 0.72, 0.48);
      featherShape.quadraticCurveTo(0.55, 0.12, 0.45, -0.1);
      featherShape.quadraticCurveTo(0.22, -0.05, 0.08, 0.05);

      const featherGeo = new THREE.ShapeGeometry(featherShape);
      const featherMesh = new THREE.Mesh(featherGeo, featherMat);
      featherMesh.position.z = 0.01;
      if (!isLeft) featherMesh.scale.set(-1, 1, 1);
      wingRoot.add(featherMesh);

      return wingRoot;
    };

    this.leftWing = createSingleWing(true);
    this.rightWing = createSingleWing(false);
    this.wingsGroup.add(this.leftWing);
    this.wingsGroup.add(this.rightWing);

    // Glowing golden cheese star emblem at wing mount center
    const starGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const starEmblem = new THREE.Mesh(starGeo, starMat);
    starEmblem.position.set(0, 0.02, 0.04);
    this.wingsGroup.add(starEmblem);

    this.wingsGroup.visible = false;
    this.group.add(this.wingsGroup);

    // 8. Delicious Swiss Cheese Snack held in paws for menu idle
    this.heldCheeseMesh = new THREE.Group();
    const cheeseShape = new THREE.Shape();
    cheeseShape.moveTo(-0.14, -0.1);
    cheeseShape.lineTo(0.14, -0.1);
    cheeseShape.lineTo(0, 0.16);
    cheeseShape.closePath();
    const cheeseExtrude = new THREE.ExtrudeGeometry(cheeseShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    const cheeseMat = new THREE.MeshToonMaterial({
      color: 0xfbbf24,
      gradientMap: this.toonGradient,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
    });
    const cMesh = new THREE.Mesh(cheeseExtrude, cheeseMat);
    cMesh.position.z = -0.06;
    this.heldCheeseMesh.add(cMesh);

    // Cute cheese holes
    const holeGeo = new THREE.SphereGeometry(0.028, 8, 8);
    const holeMat = new THREE.MeshToonMaterial({ color: 0xd97706, gradientMap: this.toonGradient });
    [[-0.05, -0.02, 0.06], [0.04, -0.04, 0.06], [0.0, 0.06, 0.06]].forEach(([hx, hy, hz]) => {
      const h = new THREE.Mesh(holeGeo, holeMat);
      h.position.set(hx, hy, hz);
      this.heldCheeseMesh.add(h);
    });

    // 8. Subway Surfers-style Street Art Spray Paint Can
    this.sprayCanMesh = new THREE.Group();
    const canGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.15, 12);
    const canMat = new THREE.MeshToonMaterial({ color: 0xef4444, gradientMap: this.toonGradient }); // Vibrant crimson spray can
    const canBody = new THREE.Mesh(canGeo, canMat);
    canBody.castShadow = true;
    this.sprayCanMesh.add(canBody);

    // Chrome rim & top dome
    const canTopGeo = new THREE.CylinderGeometry(0.038, 0.045, 0.025, 12);
    const chromeMat = new THREE.MeshToonMaterial({ color: 0xe2e8f0, gradientMap: this.toonGradient });
    const canTop = new THREE.Mesh(canTopGeo, chromeMat);
    canTop.position.y = 0.085;
    this.sprayCanMesh.add(canTop);

    // Spray nozzle button
    const nozzleGeo = new THREE.BoxGeometry(0.025, 0.035, 0.025);
    const nozzleMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: this.toonGradient });
    this.sprayNozzleMesh = new THREE.Mesh(nozzleGeo, nozzleMat);
    this.sprayNozzleMesh.position.set(0, 0.11, 0.015);
    this.sprayCanMesh.add(this.sprayNozzleMesh);

    // Can street art logo band
    const logoBandGeo = new THREE.CylinderGeometry(0.047, 0.047, 0.06, 12);
    const logoBandMat = new THREE.MeshToonMaterial({ color: 0xfacc15, gradientMap: this.toonGradient });
    const logoBand = new THREE.Mesh(logoBandGeo, logoBandMat);
    this.sprayCanMesh.add(logoBand);

    this.sprayCanMesh.position.set(0.24, 0.28, 0.36);
    this.sprayCanMesh.rotation.set(-0.3, 0.2, -0.2);
    this.sprayCanMesh.visible = false;
    this.group.add(this.sprayCanMesh);
  }

  public sprayCanMesh: THREE.Group;
  public sprayNozzleMesh: THREE.Mesh;
  public isSprayingNow: boolean = false;

  public getSprayNozzleWorldPos(): THREE.Vector3 {
    const pos = new THREE.Vector3();
    this.sprayNozzleMesh.getWorldPosition(pos);
    return pos;
  }

  public setSkin(furColor: number, bellyColor: number) {
    this.furMaterial.color.setHex(furColor);
    this.bellyMaterial.color.setHex(bellyColor);
  }

  public updateMenuIdle(dt: number) {
    this.breathingTime += dt * 8;
    this.heldCheeseMesh.visible = false;
    this.sprayCanMesh.visible = true;
    this.shieldBubble.visible = false;
    this.speedGlow.intensity = 0;

    this.group.scale.set(1.0, 1.0, 1.0);
    this.group.rotation.set(0, 0, 0);

    // Subway Surfers cycle: Pip shakes can (clack-clack), then sprays graffiti on the subway wall!
    const cycleTime = (this.breathingTime * 0.4) % 6.0; // 6-second loop
    const isShaking = cycleTime < 2.2;
    const isSpraying = cycleTime >= 2.2 && cycleTime < 5.0;
    this.isSprayingNow = isSpraying;

    if (isShaking) {
      // Shaking spray can vigorously up and down (rattling marble inside)
      const shakeOffset = Math.sin(this.breathingTime * 14) * 0.06;
      this.bodyMesh.position.set(0, 0.28, 0);
      this.bodyMesh.rotation.set(0.1, 0.15, 0);

      this.headGroup.position.set(0, 0.42, 0.4);
      this.headGroup.rotation.set(0, 0.15, 0);

      // Right paw clutching spray can shaking up and down
      this.rightFrontLeg.position.set(-0.24, 0.32 + shakeOffset, 0.32);
      this.rightFrontLeg.rotation.set(-1.1, -0.3, -0.2);
      this.sprayCanMesh.position.set(-0.24, 0.34 + shakeOffset, 0.42);
      this.sprayCanMesh.rotation.set(-0.2, 0.1, -0.15 + shakeOffset * 1.5);

      // Left paw resting happily
      this.leftFrontLeg.position.set(0.2, 0.24, 0.26);
      this.leftFrontLeg.rotation.set(-0.4, 0.2, 0.1);
    } else if (isSpraying) {
      // Aiming spray can forward towards the wall, spraying paint in rhythmic bursts
      const sprayWave = Math.sin(this.breathingTime * 3) * 0.12;
      this.bodyMesh.position.set(0, 0.29, 0.02);
      this.bodyMesh.rotation.set(0.05, 0.05, 0);

      this.headGroup.position.set(0, 0.43, 0.42);
      this.headGroup.rotation.set(-0.05, sprayWave * 0.5, 0);

      // Arm extended forward, nozzle pointing at graffiti wall
      this.rightFrontLeg.position.set(-0.18 + sprayWave, 0.36, 0.4);
      this.rightFrontLeg.rotation.set(-1.45, 0.1, 0);
      this.sprayCanMesh.position.set(-0.18 + sprayWave, 0.38, 0.52);
      this.sprayCanMesh.rotation.set(-0.15, 0, 0);

      // Index finger pressing down on the nozzle button
      this.sprayNozzleMesh.position.y = 0.095; // pressed down

      // Left paw gesturing like an urban artist admiring the piece
      this.leftFrontLeg.position.set(0.24, 0.26, 0.3);
      this.leftFrontLeg.rotation.set(-0.6, 0.4, 0.2);
    } else {
      // Proudly stepping back, nodding and admiring the graffiti
      this.bodyMesh.position.set(0, 0.27, -0.05);
      this.bodyMesh.rotation.set(-0.1, 0, 0);
      this.headGroup.position.set(0, 0.44, 0.38);
      this.headGroup.rotation.set(-0.2 + Math.sin(this.breathingTime * 2) * 0.08, 0, 0);

      this.sprayNozzleMesh.position.y = 0.11; // released
      this.sprayCanMesh.position.set(-0.24, 0.26, 0.32);
      this.sprayCanMesh.rotation.set(-0.4, -0.2, 0);

      this.rightFrontLeg.position.set(-0.22, 0.24, 0.26);
      this.rightFrontLeg.rotation.set(-0.5, -0.2, 0);
      this.leftFrontLeg.position.set(0.22, 0.24, 0.26);
      this.leftFrontLeg.rotation.set(-0.5, 0.2, 0);
    }

    // Hind legs steady on ground
    this.leftBackLeg.position.set(0.26, 0.18, -0.2);
    this.rightBackLeg.position.set(-0.26, 0.18, -0.2);
    this.leftBackLeg.rotation.set(0.3, 0.15, 0.1);
    this.rightBackLeg.rotation.set(0.3, -0.15, -0.1);

    // Snout & whiskers twitching
    this.noseMesh.position.y = -0.03 + Math.sin(this.breathingTime * 4) * 0.015;
    this.whiskers.forEach((w, i) => {
      w.rotation.z = Math.sin(this.breathingTime * 4 + i) * 0.1;
    });

    // Bouncy tail on floor
    this.tailSegments.forEach((seg, idx) => {
      seg.rotation.y = Math.sin(this.breathingTime * 1.5 - idx * 0.4) * 0.22;
      seg.rotation.x = 0.06 + idx * 0.02;
    });
  }

  public update(
    dt: number,
    speed: number,
    isJumping: boolean,
    isSliding: boolean,
    hasShield: boolean,
    hasSpeedBoost: boolean,
    hasGliderWings: boolean = false
  ) {
    this.heldCheeseMesh.visible = false;
    this.sprayCanMesh.visible = false;
    this.isSprayingNow = false;
    this.runCycleTime += dt * (speed * 0.95 + 6);
    this.breathingTime += dt * 10;
    this.currentTailSwish += dt * 8.5;

    this.shieldBubble.visible = hasShield;
    if (hasShield) {
      this.shieldBubble.rotation.y += dt * 3.5;
    }

    this.speedGlow.intensity = hasSpeedBoost ? 3.0 : 0;

    this.wingsGroup.visible = hasGliderWings;
    if (hasGliderWings) {
      const wingFlap = Math.sin(this.breathingTime * 1.5) * 0.42;
      this.leftWing.rotation.z = 0.25 + wingFlap;
      this.rightWing.rotation.z = -0.25 - wingFlap;
      this.leftWing.rotation.y = Math.cos(this.breathingTime * 1.5) * 0.18;
      this.rightWing.rotation.y = -Math.cos(this.breathingTime * 1.5) * 0.18;
    }

    // Snout & whisker twitching
    const twitch = Math.sin(this.breathingTime * 2.5) * 0.02;
    this.noseMesh.position.y = -0.03 + twitch;
    this.whiskers.forEach((w, i) => {
      w.rotation.z = Math.sin(this.breathingTime * 3 + i) * 0.08;
    });

    if (hasGliderWings) {
      // 🦅 Spectacular Superhero Soaring Pose with Rapid Flapping Golden Wings!
      const wingFlap = Math.sin(this.breathingTime * 1.8) * 0.62;
      this.leftWing.rotation.z = 0.35 + wingFlap;
      this.rightWing.rotation.z = -0.35 - wingFlap;
      this.leftWing.rotation.y = Math.cos(this.breathingTime * 1.8) * 0.25;
      this.rightWing.rotation.y = -Math.cos(this.breathingTime * 1.8) * 0.25;

      // Streamlined aerodynamic flight posture
      this.group.scale.set(1.02, 1.05, 1.15);
      this.bodyMesh.position.set(0, 0.34, 0);
      this.bodyMesh.rotation.x = -0.22; // Aerodynamic forward tilt

      // Head raised facing forward proudly
      this.headGroup.position.set(0, 0.44, 0.54);
      this.headGroup.rotation.x = 0.20;

      // Ears sleekly swept back in the jetstream
      this.leftEarGroup.rotation.set(-0.62, 0.22, 0.08);
      this.rightEarGroup.rotation.set(-0.62, -0.22, -0.08);

      // Paws stretched forward like Superman
      this.leftFrontLeg.position.set(0.22, 0.24, 0.44);
      this.rightFrontLeg.position.set(-0.22, 0.24, 0.44);
      this.leftFrontLeg.rotation.x = -1.25;
      this.rightFrontLeg.rotation.x = -1.25;
      this.leftFrontPaw.rotation.x = 0.25;
      this.rightFrontPaw.rotation.x = 0.25;

      // Back legs streamlined behind
      this.leftBackLeg.position.set(0.24, 0.22, -0.34);
      this.rightBackLeg.position.set(-0.24, 0.22, -0.34);
      this.leftBackLeg.rotation.x = 0.85;
      this.rightBackLeg.rotation.x = 0.85;
      this.leftBackPaw.rotation.x = -0.3;
      this.rightBackPaw.rotation.x = -0.3;

      // Tail trailing straight behind
      this.tailSegments.forEach((seg, idx) => {
        seg.rotation.x = -0.04;
        seg.rotation.y = Math.sin(this.currentTailSwish * 1.6 - idx * 0.3) * 0.14;
      });
    } else if (isSliding) {
      // Athletic, aerodynamic 3D cartoon runner slide (full plump volume, never squashed flat!)
      this.group.scale.set(1.0, 0.98, 1.02);
      this.bodyMesh.position.set(0, 0.22, 0.04);
      this.bodyMesh.rotation.x = -0.14; // Sleek sprinter crouch

      this.headGroup.position.set(0, 0.30, 0.44);
      this.headGroup.rotation.x = 0.04; // Alert forward gaze

      // Aerodynamic swept ears
      this.leftEarGroup.rotation.set(-0.52, 0.18, 0.06);
      this.rightEarGroup.rotation.set(-0.52, -0.18, -0.06);

      // Front paws reach forward skimming the track
      this.leftFrontLeg.position.set(0.2, 0.15, 0.34);
      this.rightFrontLeg.position.set(-0.2, 0.15, 0.34);
      this.leftFrontLeg.rotation.x = -0.95;
      this.rightFrontLeg.rotation.x = -0.95;
      this.leftFrontPaw.rotation.x = 0.2;
      this.rightFrontPaw.rotation.x = 0.2;

      // Hind legs tucked into dynamic slide
      this.leftBackLeg.position.set(0.23, 0.17, -0.25);
      this.rightBackLeg.position.set(-0.23, 0.17, -0.25);
      this.leftBackLeg.rotation.x = 0.65;
      this.rightBackLeg.rotation.x = 0.65;
      this.leftBackPaw.rotation.x = -0.2;
      this.rightBackPaw.rotation.x = -0.2;

      // Tail trails smoothly along track
      this.tailSegments.forEach((seg, idx) => {
        seg.rotation.x = -0.02;
        seg.rotation.y = Math.sin(this.currentTailSwish * 1.5 - idx * 0.3) * 0.12;
      });
    } else if (isJumping) {
      // Cheerful soaring cartoon leap
      this.group.scale.set(0.92, 1.15, 1.15);
      this.bodyMesh.position.set(0, 0.38, 0);
      this.bodyMesh.rotation.x = 0.08;
      this.headGroup.position.set(0, 0.48, 0.5);
      this.headGroup.rotation.x = -0.15;

      this.leftEarGroup.rotation.set(-0.45, 0.2, 0);
      this.rightEarGroup.rotation.set(-0.45, -0.2, 0);

      this.leftFrontLeg.position.set(0.24, 0.28, 0.28);
      this.rightFrontLeg.position.set(-0.24, 0.28, 0.28);
      this.leftFrontLeg.rotation.x = -0.85;
      this.rightFrontLeg.rotation.x = -0.85;
      this.leftBackLeg.position.set(0.26, 0.3, -0.28);
      this.rightBackLeg.position.set(-0.26, 0.3, -0.28);
      this.leftBackLeg.rotation.x = 0.75;
      this.rightBackLeg.rotation.x = 0.75;
    } else {
      // Joyful cartoon squash & stretch bounce running
      const bounce = Math.sin(this.runCycleTime * 2);
      this.group.scale.set(1.0 + bounce * 0.07, 1.0 - bounce * 0.08, 1.0 + bounce * 0.1);

      const spineFlex = Math.sin(this.runCycleTime * 2) * 0.08;
      this.bodyMesh.position.set(0, 0.36 + Math.abs(spineFlex), 0);
      this.bodyMesh.rotation.x = spineFlex * 0.6;

      this.headGroup.position.set(0, 0.44 + Math.sin(this.runCycleTime) * 0.04, 0.5);
      this.headGroup.rotation.x = Math.sin(this.runCycleTime) * 0.08;

      // Ears flap happily with wind
      const earFlap = Math.sin(this.runCycleTime) * 0.12;
      this.leftEarGroup.rotation.set(-0.2 + earFlap, 0.35, 0.2);
      this.rightEarGroup.rotation.set(-0.2 + earFlap, -0.35, -0.2);

      // Comedic cartoon leg cycle
      this.leftFrontLeg.position.set(0.24, 0.28, 0.28);
      this.rightFrontLeg.position.set(-0.24, 0.28, 0.28);
      this.leftBackLeg.position.set(0.26, 0.3, -0.28);
      this.rightBackLeg.position.set(-0.26, 0.3, -0.28);

      const fStride = Math.sin(this.runCycleTime) * 1.0;
      const bStride = Math.sin(this.runCycleTime + Math.PI * 0.65) * 0.95;

      this.leftFrontLeg.rotation.x = fStride;
      this.rightFrontLeg.rotation.x = -fStride;
      this.leftBackLeg.rotation.x = bStride;
      this.rightBackLeg.rotation.x = -bStride;

      this.leftFrontPaw.rotation.x = Math.max(-0.4, -fStride * 0.5);
      this.rightFrontPaw.rotation.x = Math.max(-0.4, fStride * 0.5);
      this.leftBackPaw.rotation.x = Math.max(-0.4, -bStride * 0.5);
      this.rightBackPaw.rotation.x = Math.max(-0.4, bStride * 0.5);
    }

    // Playful springy tail swish
    this.tailSegments.forEach((seg, idx) => {
      const wave = Math.sin(this.currentTailSwish - idx * 0.5) * 0.36;
      seg.rotation.y = wave;
      seg.rotation.x = isSliding ? 0.05 : -0.1 + Math.sin(this.runCycleTime) * 0.15;
    });
  }

  public triggerStumble() {
    this.group.rotation.z = (Math.random() - 0.5) * 0.55;
    this.group.rotation.x = -0.4;
    setTimeout(() => {
      this.group.rotation.set(0, 0, 0);
    }, 280);
  }
}
