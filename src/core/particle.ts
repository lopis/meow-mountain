import { on } from "./event";
import { easeInExpo } from "./util/util";

export interface Particle {
  from: { x: number, y: number },
  to: { x: number, y: number },
  size: number,
  color: string,
  duration: number,
  time: number,
}

export class ParticleEngine {
  particles: Particle[] = [];

  constructor(public ctx: CanvasRenderingContext2D) {
    on('particle', (particle: Particle) => {
      this.createParticle(particle.from, particle.to, particle.size, particle.color, particle.duration);
    });
  }

  createParticle(
    from: { x: number, y: number },
    to: { x: number, y: number },
    size: number,
    color: string,
    duration: number,
  ) {
    this.particles.push({ from, to, size, color, duration, time: 0 });
  }

  update(timeElapsed: number) {
    this.particles.forEach((particle) => {
      const phase = easeInExpo(Math.min(1, particle.time / particle.duration));
      const x = particle.from.x + (particle.to.x - particle.from.x) * phase;
      const y = particle.from.y + (particle.to.y - particle.from.y) * phase;
      this.ctx.fillStyle = particle.color;
      this.ctx.fillRect(
        x,
        y,
        particle.size,
        particle.size,
      );
      particle.time += timeElapsed;
    });
    this.particles = this.particles.filter(particle => particle.time < particle.duration);
  }
}
