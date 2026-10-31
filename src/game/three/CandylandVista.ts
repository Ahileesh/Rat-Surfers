import * as THREE from 'three';
import { ProceduralTextures } from './ProceduralTextures';

export class CandylandVista {
  public group: THREE.Group;
  private clouds: THREE.Group[] = [];
  private lollipops: THREE.Group[] = [];
  private stars: THREE.Points | null = null;
  private animTime: number = 0;

  constructor() {
    this.group = new THREE.Group();
    const toonGradient = ProceduralTextures.getToonGradientMap();

    // 1. Distant Candyland Horizon Backdrop Sky Curtain (Magical Sunset Pastel Panorama)
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 1024;
    skyCanvas.height = 512;
    const sCtx = skyCanvas.getContext('2d')!;
    const grad = sCtx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#38bdf8');   // Dreamy cyan zenith
    grad.addColorStop(0.28, '#818cf8'); // Periwinkle twilight
    grad.addColorStop(0.55, '#f472b6'); // Cotton-candy rose pink
    grad.addColorStop(0.78, '#fb923c'); // Warm peach sunset glow
    grad.addColorStop(0.92, '#fde047'); // Honey amber horizon warmth
    grad.addColorStop(1, '#fef08a');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 1024, 512);

    const skyTex = new THREE.CanvasTexture(skyCanvas);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    const skyGeo = new THREE.PlaneGeometry(180, 75);
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, depthWrite: false });
    const skyBackdrop = new THREE.Mesh(skyGeo, skyMat);
    skyBackdrop.position.set(0, 24, 192);
    this.group.add(skyBackdrop);

    // 2. Twinkling Distant Sugar Stars in Upper Sky
    const starCount = 35;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let s = 0; s < starCount; s++) {
      starPositions[s * 3] = (Math.random() - 0.5) * 120;
      starPositions[s * 3 + 1] = 18 + Math.random() * 26;
      starPositions[s * 3 + 2] = 188;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      transparent: true,
      opacity: 0.85,
    });
    this.stars = new THREE.Points(starGeo, starMat);
    this.group.add(this.stars);

    // 3. Layer 1: Distant Sugar Mountain Ridge with White Frosting Caps
    const mountainData = [
      { x: -55, y: -2, z: 185, r: 16, h: 22, color: 0x818cf8 },
      { x: -26, y: -3, z: 187, r: 18, h: 26, color: 0xc084fc },
      { x: 4, y: -4, z: 188, r: 20, h: 24, color: 0xf472b6 },
      { x: 32, y: -3, z: 186, r: 17, h: 28, color: 0xa78bfa },
      { x: 58, y: -2, z: 184, r: 15, h: 21, color: 0x38bdf8 },
    ];

    mountainData.forEach(md => {
      const coneGeo = new THREE.ConeGeometry(md.r, md.h, 14);
      const coneMat = new THREE.MeshToonMaterial({
        color: md.color,
        gradientMap: toonGradient,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(md.x, md.y + md.h * 0.5, md.z);
      this.group.add(cone);

      // White vanilla frosting peak
      const capGeo = new THREE.ConeGeometry(md.r * 0.36, md.h * 0.36, 12);
      const capMat = new THREE.MeshToonMaterial({
        color: 0xffffff,
        gradientMap: toonGradient,
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(md.x, md.y + md.h * 0.82, md.z + 0.1);
      this.group.add(cap);
    });

    // 4. Layer 2: Gentle Rolling Gumdrop Hills (Soft pastel foreground horizon)
    const hillData = [
      { x: -46, y: -5, z: 178, scaleX: 24, scaleY: 9, scaleZ: 14, color: 0xf472b6 }, // Pink sugar hill
      { x: -20, y: -6, z: 180, scaleX: 22, scaleY: 8, scaleZ: 14, color: 0xfef08a }, // Honey cream hill
      { x: 6, y: -7, z: 182, scaleX: 26, scaleY: 8, scaleZ: 14, color: 0x6ee7b7 },  // Mint candy hill
      { x: 30, y: -6, z: 180, scaleX: 22, scaleY: 9, scaleZ: 14, color: 0xfb7185 },  // Strawberry hill
      { x: 52, y: -5, z: 178, scaleX: 24, scaleY: 9.5, scaleZ: 14, color: 0xc084fc }, // Lavender sugar hill
    ];

    hillData.forEach(hd => {
      const hillGeo = new THREE.SphereGeometry(1, 14, 10);
      const hillMat = new THREE.MeshToonMaterial({
        color: hd.color,
        gradientMap: toonGradient,
      });
      const hillMesh = new THREE.Mesh(hillGeo, hillMat);
      hillMesh.scale.set(hd.scaleX, hd.scaleY, hd.scaleZ);
      hillMesh.position.set(hd.x, hd.y, hd.z);
      this.group.add(hillMesh);
    });

    // 5. Far-away Whimsical Swirl Lollipop Trees (Spaced far apart on horizon sides)
    [-36, 36].forEach((lx, idx) => {
      const lolliGroup = new THREE.Group();
      lolliGroup.position.set(lx, 6, 174);

      // Sugar stick trunk
      const trunkGeo = new THREE.CylinderGeometry(0.5, 0.65, 14, 8);
      const trunkMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = -2;
      lolliGroup.add(trunk);

      // Swirl peppermint candy head
      const swirlGeo = new THREE.CylinderGeometry(4.4, 4.4, 0.85, 18);
      swirlGeo.rotateX(Math.PI / 2);
      const swirlMat = new THREE.MeshToonMaterial({
        color: idx === 0 ? 0xf43f5e : 0x0ea5e9,
        gradientMap: toonGradient,
      });
      const swirlMesh = new THREE.Mesh(swirlGeo, swirlMat);
      swirlMesh.name = 'swirlHead';
      swirlMesh.position.y = 5.5;
      lolliGroup.add(swirlMesh);

      this.lollipops.push(lolliGroup);
      this.group.add(lolliGroup);
    });

    // 6. Soft Puffy Marshmallow Clouds Floating in Distant Sky
    const cloudPositions = [
      { x: -38, y: 24, z: 184 },
      { x: 4, y: 28, z: 186 },
      { x: 44, y: 23, z: 183 },
    ];

    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });

    cloudPositions.forEach(cp => {
      const cloud = new THREE.Group();
      cloud.position.set(cp.x, cp.y, cp.z);

      const p1 = new THREE.Mesh(new THREE.SphereGeometry(3.5, 8, 8), cloudMat);
      cloud.add(p1);

      const p2 = new THREE.Mesh(new THREE.SphereGeometry(2.6, 8, 8), cloudMat);
      p2.position.set(-3.0, -0.4, 0);
      cloud.add(p2);

      const p3 = new THREE.Mesh(new THREE.SphereGeometry(2.8, 8, 8), cloudMat);
      p3.position.set(3.0, -0.3, 0);
      cloud.add(p3);

      this.clouds.push(cloud);
      this.group.add(cloud);
    });
  }

  public update(playerZ: number, dt: number) {
    this.animTime += dt;
    // Follow the player smoothly so the Candyland vista is always visible on the far horizon
    this.group.position.z = playerZ;

    // Gentle cloud drifting and bobbing
    this.clouds.forEach((cloud, i) => {
      cloud.position.x += Math.sin(this.animTime * 0.35 + i) * dt * 0.5;
      cloud.position.y += Math.cos(this.animTime * 0.5 + i) * dt * 0.15;
    });

    // Soft twinkling on sugar stars
    if (this.stars) {
      (this.stars.material as THREE.PointsMaterial).opacity = 0.7 + Math.sin(this.animTime * 2.5) * 0.25;
    }

    // Slow, serene rotation on distant swirl lollipops
    this.lollipops.forEach((lolli, i) => {
      const head = lolli.getObjectByName('swirlHead');
      if (head) {
        head.rotation.z += (i === 0 ? 1 : -1) * dt * 0.35;
      }
    });
  }
}
