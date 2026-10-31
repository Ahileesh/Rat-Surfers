import * as THREE from 'three';
import { ProceduralTextures } from './ProceduralTextures';

export class CatModel {
  public group: THREE.Group;
  private spineMesh: THREE.Mesh;
  private headGroup: THREE.Group;
  private leftFrontLeg: THREE.Group;
  private rightFrontLeg: THREE.Group;
  private leftBackLeg: THREE.Group;
  private rightBackLeg: THREE.Group;
  private leftPaw: THREE.Mesh;
  private rightPaw: THREE.Mesh;
  private lowerJaw: THREE.Group;
  private leftEar: THREE.Group;
  private rightEar: THREE.Group;
  private leftEyebrow: THREE.Mesh;
  private rightEyebrow: THREE.Mesh;
  private tailSegments: THREE.Mesh[] = [];

  private toonGradient: THREE.CanvasTexture;
  private furMaterial: THREE.MeshToonMaterial;

  private runCycleTime: number = 0;
  private tailWhipTime: number = 0;
  private isLunging: boolean = false;

  constructor() {
    this.group = new THREE.Group();
    this.toonGradient = ProceduralTextures.getToonGradientMap();

    // 1. Beautiful, Vibrant Kids Cartoon Materials (Sunny Ginger-Cream Tabby)
    this.furMaterial = new THREE.MeshToonMaterial({
      color: 0xf97316, // Warm sunny orange fur
      gradientMap: this.toonGradient,
    });

    const fluffyWhiteMaterial = new THREE.MeshToonMaterial({
      color: 0xffffff, // Fluffy marshmallow white bib, muzzle & paws
      gradientMap: this.toonGradient,
    });

    const softPinkMaterial = new THREE.MeshToonMaterial({
      color: 0xf472b6, // Rosy cute bubblegum pink (nose, inner ear, paw pads)
      gradientMap: this.toonGradient,
    });

    const eyeWhiteMaterial = new THREE.MeshToonMaterial({
      color: 0xffffff, // Crisp clean white cartoon sclera
      gradientMap: this.toonGradient,
    });

    const eyeIrisMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981, // Sparkling, gorgeous emerald cartoon eyes
    });

    const eyePupilMaterial = new THREE.MeshBasicMaterial({
      color: 0x0f172a, // Deep shiny cartoon pupil
    });

    const eyeSparkleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, // Luminous twinkle highlights (✨)
    });

    const mouthInteriorMaterial = new THREE.MeshBasicMaterial({
      color: 0xbe185d, // Cheerful deep rose interior
    });

    // 2. Sleek, Curvaceous Cartoon Torso
    const torsoGeo = new THREE.CapsuleGeometry(0.5, 1.4, 16, 16);
    torsoGeo.rotateX(Math.PI / 2);
    this.spineMesh = new THREE.Mesh(torsoGeo, this.furMaterial);
    this.spineMesh.position.set(0, 0.95, 0);
    this.spineMesh.castShadow = true;
    this.group.add(this.spineMesh);

    // Fluffy White Chest & Belly Bib
    const chestGeo = new THREE.SphereGeometry(0.48, 16, 16);
    chestGeo.scale(0.88, 1.15, 0.9);
    const chest = new THREE.Mesh(chestGeo, fluffyWhiteMaterial);
    chest.position.set(0, -0.06, 0.55);
    this.spineMesh.add(chest);

    // Decorative Ginger Tabby Back Stripes
    const stripeGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.12, 16, 1, true, -Math.PI / 2, Math.PI);
    stripeGeo.rotateZ(Math.PI / 2);
    const stripeMat = new THREE.MeshToonMaterial({
      color: 0xc2410c, // Rich amber tabby stripes
      gradientMap: this.toonGradient,
      side: THREE.DoubleSide,
    });
    [-0.3, 0.0, 0.3].forEach(sz => {
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(0, 0.02, sz);
      this.spineMesh.add(stripe);
    });

    // 3. Adorable, Huggable Cartoon Feline Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.25, 1.05);

    // Chubby Kitten Skull with soft rounded cheeks
    const skullGeo = new THREE.SphereGeometry(0.44, 18, 18);
    skullGeo.scale(1.12, 0.98, 1.05);
    const skull = new THREE.Mesh(skullGeo, this.furMaterial);
    skull.castShadow = true;
    this.headGroup.add(skull);

    // Puffy Pillowy White Whisker Pads (Left & Right Chubby Cheeks)
    const padGeo = new THREE.SphereGeometry(0.18, 14, 14);
    padGeo.scale(1.0, 0.85, 0.9);
    const padL = new THREE.Mesh(padGeo, fluffyWhiteMaterial);
    padL.position.set(0.14, -0.12, 0.42);
    this.headGroup.add(padL);

    const padR = new THREE.Mesh(padGeo, fluffyWhiteMaterial);
    padR.position.set(-0.14, -0.12, 0.42);
    this.headGroup.add(padR);

    // Tiny Glossy Pink Heart/Button Cat Nose
    const noseGeo = new THREE.SphereGeometry(0.075, 12, 12);
    noseGeo.scale(1.2, 0.8, 0.9);
    const nose = new THREE.Mesh(noseGeo, softPinkMaterial);
    nose.position.set(0, -0.06, 0.52);
    this.headGroup.add(nose);

    // Smiling Cartoon Lower Jaw with Cute Pink Tongue
    this.lowerJaw = new THREE.Group();
    this.lowerJaw.position.set(0, -0.22, 0.32);

    const jawGeo = new THREE.SphereGeometry(0.15, 12, 12);
    jawGeo.scale(0.9, 0.5, 1.0);
    const jawMesh = new THREE.Mesh(jawGeo, fluffyWhiteMaterial);
    jawMesh.position.set(0, 0, 0);
    this.lowerJaw.add(jawMesh);

    const tongueGeo = new THREE.SphereGeometry(0.09, 10, 10);
    tongueGeo.scale(0.85, 0.35, 1.2);
    const tongue = new THREE.Mesh(tongueGeo, mouthInteriorMaterial);
    tongue.position.set(0, 0.05, 0.04);
    this.lowerJaw.add(tongue);
    this.headGroup.add(this.lowerJaw);

    // 4. Large, Gorgeous Expressive Cartoon Eyes (Sparkling Emerald Anime/Pixar Style)
    const eyeScleraGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const eyeIrisGeo = new THREE.SphereGeometry(0.095, 14, 14);
    const eyePupilGeo = new THREE.SphereGeometry(0.065, 12, 12);
    const sparkleMainGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const sparkleSubGeo = new THREE.SphereGeometry(0.02, 6, 6);

    const makeGorgeousEye = (isLeft: boolean) => {
      const eyeRoot = new THREE.Group();

      // Clean bright white sclera
      const sclera = new THREE.Mesh(eyeScleraGeo, eyeWhiteMaterial);
      sclera.scale.set(0.92, 1.08, 0.7);
      eyeRoot.add(sclera);

      // Emerald iris
      const iris = new THREE.Mesh(eyeIrisGeo, eyeIrisMaterial);
      iris.position.set(0, 0, 0.06);
      iris.scale.set(0.9, 1.05, 0.7);
      eyeRoot.add(iris);

      // Shiny dark pupil
      const pupil = new THREE.Mesh(eyePupilGeo, eyePupilMaterial);
      pupil.position.set(0, 0, 0.09);
      pupil.scale.set(0.65, 0.95, 0.55);
      eyeRoot.add(pupil);

      // Cute double sparkle highlights (✨)
      const sp1 = new THREE.Mesh(sparkleMainGeo, eyeSparkleMaterial);
      sp1.position.set(0.035, 0.04, 0.12);
      eyeRoot.add(sp1);

      const sp2 = new THREE.Mesh(sparkleSubGeo, eyeSparkleMaterial);
      sp2.position.set(-0.025, -0.02, 0.12);
      eyeRoot.add(sp2);

      eyeRoot.position.set(isLeft ? 0.22 : -0.22, 0.12, 0.32);
      return eyeRoot;
    };

    this.headGroup.add(makeGorgeousEye(true));
    this.headGroup.add(makeGorgeousEye(false));

    // Playful Expressive Eyebrows
    const browGeo = new THREE.BoxGeometry(0.14, 0.035, 0.04);
    const browMat = new THREE.MeshBasicMaterial({ color: 0xc2410c });
    this.leftEyebrow = new THREE.Mesh(browGeo, browMat);
    this.leftEyebrow.position.set(0.22, 0.29, 0.38);
    this.leftEyebrow.rotation.z = -0.15;
    this.headGroup.add(this.leftEyebrow);

    this.rightEyebrow = new THREE.Mesh(browGeo, browMat);
    this.rightEyebrow.position.set(-0.22, 0.29, 0.38);
    this.rightEyebrow.rotation.z = 0.15;
    this.headGroup.add(this.rightEyebrow);

    // 5. Perky, Cute Triangular Ears with Pink Fluff
    const earOuterGeo = new THREE.ConeGeometry(0.2, 0.38, 4);
    earOuterGeo.rotateY(Math.PI / 4);
    const earInnerGeo = new THREE.ConeGeometry(0.14, 0.28, 4);
    earInnerGeo.rotateY(Math.PI / 4);

    const makeCatEar = (isLeft: boolean) => {
      const earGroup = new THREE.Group();
      const outer = new THREE.Mesh(earOuterGeo, this.furMaterial);
      const inner = new THREE.Mesh(earInnerGeo, softPinkMaterial);
      inner.position.z = 0.04;
      earGroup.add(outer);
      earGroup.add(inner);

      // Fluffy white tuft inside ear base
      const tuftGeo = new THREE.SphereGeometry(0.08, 8, 8);
      tuftGeo.scale(0.8, 0.6, 1.2);
      const tuft = new THREE.Mesh(tuftGeo, fluffyWhiteMaterial);
      tuft.position.set(0, -0.1, 0.06);
      earGroup.add(tuft);

      earGroup.position.set(isLeft ? 0.28 : -0.28, 0.46, 0.04);
      earGroup.rotation.set(-0.2, isLeft ? 0.28 : -0.28, isLeft ? -0.22 : 0.22);
      return earGroup;
    };
    this.leftEar = makeCatEar(true);
    this.rightEar = makeCatEar(false);
    this.headGroup.add(this.leftEar);
    this.headGroup.add(this.rightEar);

    // Graceful White Cartoon Whiskers
    const whiskerMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    [-0.04, 0.04].forEach(dy => {
      const wl = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.18, -0.1 + dy, 0.44),
        new THREE.Vector3(0.62, -0.06 + dy * 2.2, 0.38),
      ]);
      const wr = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.18, -0.1 + dy, 0.44),
        new THREE.Vector3(-0.62, -0.06 + dy * 2.2, 0.38),
      ]);
      this.headGroup.add(new THREE.Line(wl, whiskerMat));
      this.headGroup.add(new THREE.Line(wr, whiskerMat));
    });

    this.group.add(this.headGroup);

    // 6. Cute Cartoon Limbs with Marshmallow-White Mittens
    const makeCatLimb = (isBack: boolean) => {
      const limbRoot = new THREE.Group();
      const legGeo = new THREE.CapsuleGeometry(isBack ? 0.13 : 0.11, 0.48, 10, 10);
      const leg = new THREE.Mesh(legGeo, this.furMaterial);
      leg.position.y = -0.22;
      limbRoot.add(leg);

      // Fluffy rounded white mitten paw
      const pawGeo = new THREE.SphereGeometry(0.13, 12, 12);
      pawGeo.scale(1.1, 0.7, 1.25);
      const paw = new THREE.Mesh(pawGeo, fluffyWhiteMaterial);
      paw.position.set(0, -0.46, 0.06);
      limbRoot.add(paw);

      // Cute pink toe bean pads under front paws
      if (!isBack) {
        const beanGeo = new THREE.SphereGeometry(0.04, 8, 8);
        beanGeo.scale(1.0, 0.3, 1.0);
        const mainBean = new THREE.Mesh(beanGeo, softPinkMaterial);
        mainBean.position.set(0, -0.52, 0.04);
        limbRoot.add(mainBean);
      }

      return { limbRoot, paw };
    };

    const fl = makeCatLimb(false);
    this.leftFrontLeg = fl.limbRoot;
    this.leftPaw = fl.paw;
    this.leftFrontLeg.position.set(0.36, 0.72, 0.52);
    this.group.add(this.leftFrontLeg);

    const fr = makeCatLimb(false);
    this.rightFrontLeg = fr.limbRoot;
    this.rightPaw = fr.paw;
    this.rightFrontLeg.position.set(-0.36, 0.72, 0.52);
    this.group.add(this.rightFrontLeg);

    const bl = makeCatLimb(true);
    this.leftBackLeg = bl.limbRoot;
    this.leftBackLeg.position.set(0.40, 0.76, -0.54);
    this.group.add(this.leftBackLeg);

    const br = makeCatLimb(true);
    this.rightBackLeg = br.limbRoot;
    this.rightBackLeg.position.set(-0.40, 0.76, -0.54);
    this.group.add(this.rightBackLeg);

    // 7. Expressive Fluffy Cartoon Tail with White Tip
    let parentObj: THREE.Object3D = this.spineMesh;
    for (let i = 0; i < 9; i++) {
      const radius = 0.075 * (1 - i / 14);
      const segGeo = new THREE.CylinderGeometry(radius, radius * 0.9, 0.22, 10);
      segGeo.rotateX(Math.PI / 2);
      // Alternate orange body with plush white tail tip
      const mat = i >= 6 ? fluffyWhiteMaterial : this.furMaterial;
      const seg = new THREE.Mesh(segGeo, mat);
      seg.position.set(0, 0.14, -0.18);
      parentObj.add(seg);
      this.tailSegments.push(seg);
      parentObj = seg;
    }
  }

  public update(dt: number, speed: number, threatRatio: number, isLunging: boolean) {
    this.runCycleTime += dt * (speed * 0.92 + 5.5);
    this.tailWhipTime += dt * 8;
    this.isLunging = isLunging;

    if (isLunging) {
      // Playful comedic cartoon pounce leap!
      this.group.scale.set(1.05, 1.22, 1.32);
      this.headGroup.position.set(0, 1.45, 1.38);
      this.lowerJaw.rotation.x = 0.55; // Cute smiling open mouth!
      this.leftEar.rotation.set(-0.55, 0.35, -0.35);
      this.rightEar.rotation.set(-0.55, -0.35, 0.35);

      // Eyebrows raised in playful excitement
      this.leftEyebrow.position.y = 0.34;
      this.rightEyebrow.position.y = 0.34;

      // Paws reach forward comically
      this.leftFrontLeg.rotation.x = -1.15;
      this.rightFrontLeg.rotation.x = -1.15;
      this.leftBackLeg.rotation.x = 0.95;
      this.rightBackLeg.rotation.x = 0.95;
    } else {
      // Cheerful, bouncy cartoon gallop
      const bounce = Math.sin(this.runCycleTime * 2);
      this.group.scale.set(1.0 + bounce * 0.05, 1.0 - bounce * 0.07, 1.0 + bounce * 0.07);

      const spineArch = Math.sin(this.runCycleTime * 2) * 0.10;
      this.spineMesh.position.y = 0.95 + Math.abs(spineArch);
      this.spineMesh.rotation.x = spineArch * 0.45;

      this.headGroup.position.y = 1.25 + Math.sin(this.runCycleTime) * 0.05;
      this.headGroup.rotation.x = Math.sin(this.runCycleTime) * 0.07;

      // Cute playful smiling mouth bob
      this.lowerJaw.rotation.x = 0.06 + Math.sin(this.runCycleTime * 2) * 0.1 * threatRatio;

      // Ears tilt playfully based on chase intensity
      this.leftEar.rotation.x = -0.2 - threatRatio * 0.22;
      this.rightEar.rotation.x = -0.2 - threatRatio * 0.22;

      // Eyebrows bob playfully
      this.leftEyebrow.position.y = 0.29 + Math.sin(this.runCycleTime) * 0.015;
      this.rightEyebrow.position.y = 0.29 + Math.sin(this.runCycleTime) * 0.015;

      // High-energy cartoon stride
      const fStride = Math.sin(this.runCycleTime) * 1.05;
      const bStride = Math.sin(this.runCycleTime + Math.PI * 0.7) * 1.0;

      this.leftFrontLeg.rotation.x = fStride;
      this.rightFrontLeg.rotation.x = -fStride;
      this.leftBackLeg.rotation.x = bStride;
      this.rightBackLeg.rotation.x = -bStride;
    }

    // Playful cartoon tail swishing like an antenna
    this.tailSegments.forEach((seg, idx) => {
      const swish = Math.sin(this.tailWhipTime - idx * 0.45) * 0.42;
      seg.rotation.y = swish;
      seg.rotation.x = isLunging ? 0.35 : 0.18 + Math.sin(this.runCycleTime) * 0.15;
    });
  }

  public updateMenuStalking(dt: number) {
    this.tailWhipTime += dt * 3.5;
    this.runCycleTime += dt * 1.4;

    this.group.scale.set(1.0, 1.0, 1.0);

    // Stalking predator crouch: body low, stalking silently on the tracks
    const creep = Math.sin(this.runCycleTime);
    this.spineMesh.position.set(0, 0.68 + Math.abs(creep) * 0.03, 0);
    this.spineMesh.rotation.x = 0.12;

    // Head held low and forward, locked on the rat eating cheese
    this.headGroup.position.set(0, 0.88, 1.15);
    this.headGroup.rotation.set(-0.1, Math.sin(this.runCycleTime * 0.5) * 0.05, 0);

    // Curious, focused eyebrows & mouth
    this.leftEyebrow.position.y = 0.27;
    this.rightEyebrow.position.y = 0.27;
    this.lowerJaw.rotation.x = 0.04;

    // Ears perked forward tracking sounds
    this.leftEar.rotation.set(-0.1, 0.2, -0.15);
    this.rightEar.rotation.set(-0.1, -0.2, 0.15);

    // Slow, stealthy paws creeping
    this.leftFrontLeg.rotation.x = Math.sin(this.runCycleTime) * 0.35;
    this.rightFrontLeg.rotation.x = -Math.sin(this.runCycleTime) * 0.35;
    this.leftBackLeg.rotation.x = Math.sin(this.runCycleTime + 1.2) * 0.3;
    this.rightBackLeg.rotation.x = -Math.sin(this.runCycleTime + 1.2) * 0.3;

    // Tail tip swishing with stealthy hunting focus
    this.tailSegments.forEach((seg, idx) => {
      seg.rotation.y = Math.sin(this.tailWhipTime - idx * 0.5) * 0.35;
      seg.rotation.x = 0.08 + idx * 0.04;
    });
  }
}
