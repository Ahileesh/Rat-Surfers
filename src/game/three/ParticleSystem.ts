import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  public points: THREE.Points;
  private maxParticles: number = 250;
  private particles: Particle[] = [];
  private positions: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  private geometry: THREE.BufferGeometry;

  constructor() {
    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    // Particle sprite using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.8)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.35,
      map: texture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geometry, material);
  }

  public emitBurst(pos: THREE.Vector3, colorHex: number, count: number = 18, speed: number = 4) {
    const col = new THREE.Color(colorHex);
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * speed,
        (Math.random() * 0.8 + 0.2) * speed,
        (Math.random() - 0.5) * speed
      );

      this.particles.push({
        position: pos.clone(),
        velocity: vel,
        color: col.clone(),
        size: 0.2 + Math.random() * 0.25,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.35,
      });
    }
  }

  public emitSpeedTrail(pos: THREE.Vector3) {
    if (this.particles.length >= this.maxParticles) return;
    const col = new THREE.Color(Math.random() > 0.4 ? 0xf59e0b : 0xfef08a);
    this.particles.push({
      position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.2, 0.1, -0.2)),
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, -4),
      color: col,
      size: 0.2,
      life: 0,
      maxLife: 0.25,
    });
  }

  public emitWingsTrail(pos: THREE.Vector3) {
    if (this.particles.length >= this.maxParticles) return;
    // Sparkling pastel rainbow candy stars & celestial gold dust
    const palette = [0x38bdf8, 0xf472b6, 0xfacc15, 0x4ade80, 0xc084fc, 0xffffff];
    const colHex = palette[Math.floor(Math.random() * palette.length)];
    const col = new THREE.Color(colHex);
    this.particles.push({
      position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, 0.35 + (Math.random() - 0.5) * 0.3, -0.4)),
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.8, -0.4 + (Math.random() - 0.5) * 0.6, -3.5),
      color: col,
      size: 0.32 + Math.random() * 0.18,
      life: 0,
      maxLife: 0.45,
    });
  }

  public emitSprayPaint(pos: THREE.Vector3, colorHex: number) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }
    const col = new THREE.Color(colorHex);
    // Spray cone forward along +Z towards graffiti wall
    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 0.45,
      (Math.random() - 0.5) * 0.4,
      1.8 + Math.random() * 0.8
    );
    this.particles.push({
      position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, 0.05)),
      velocity: vel,
      color: col,
      size: 0.12 + Math.random() * 0.1,
      life: 0,
      maxLife: 0.28 + Math.random() * 0.15,
    });
  }

  public emitGroundSlideDust(pos: THREE.Vector3) {
    if (this.particles.length >= this.maxParticles) return;
    const col = new THREE.Color(0xfef08a);
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.35, 0.04, -0.2)),
        velocity: new THREE.Vector3((Math.random() - 0.5) * 1.5, Math.random() * 0.6 + 0.2, -3.5),
        color: col,
        size: 0.16 + Math.random() * 0.15,
        life: 0,
        maxLife: 0.3,
      });
    }
  }

  public emitSlamRing(pos: THREE.Vector3) {
    const col = new THREE.Color(0xffffff);
    for (let i = 0; i < 14; i++) {
      if (this.particles.length >= this.maxParticles) this.particles.shift();
      const angle = (i / 14) * Math.PI * 2;
      const speed = 3.5;
      this.particles.push({
        position: pos.clone().add(new THREE.Vector3(0, 0.05, 0)),
        velocity: new THREE.Vector3(Math.cos(angle) * speed, 0.4, Math.sin(angle) * speed),
        color: col.clone(),
        size: 0.22,
        life: 0,
        maxLife: 0.28,
      });
    }
  }

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.position.addScaledVector(p.velocity, dt);
      p.velocity.y -= 9.8 * dt * 0.5; // mild gravity
    }

    // Populate buffers
    for (let i = 0; i < this.maxParticles; i++) {
      if (i < this.particles.length) {
        const p = this.particles[i];
        const alpha = 1 - p.life / p.maxLife;

        this.positions[i * 3] = p.position.x;
        this.positions[i * 3 + 1] = p.position.y;
        this.positions[i * 3 + 2] = p.position.z;

        this.colors[i * 3] = p.color.r * alpha;
        this.colors[i * 3 + 1] = p.color.g * alpha;
        this.colors[i * 3 + 2] = p.color.b * alpha;

        this.sizes[i] = p.size * alpha;
      } else {
        this.positions[i * 3] = 0;
        this.positions[i * 3 + 1] = -1000;
        this.positions[i * 3 + 2] = 0;
        this.sizes[i] = 0;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
  }

  public reset() {
    this.particles = [];
  }
}
