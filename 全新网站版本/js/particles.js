class SeasonalParticles {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.numParticles = 50;
    
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '-1';
    this.canvas.style.pointerEvents = 'none';
    
    this.currentSeason = 0;
    this.seasonNames = ['Spring', 'Summer', 'Autumn', 'Winter'];
    this.seasonChanging = false;
    this.changeProgress = 0;

    this.seasonConfig = [
      {
        color: '#8BC34A',
        size: 8,
        vxRange: [-1, 2],
        vyRange: [1, 3],
        shape: 'pixel_leaf',
        background: '#000000'
      },
      {
        color: '#4CAF50',
        size: 8,
        vxRange: [-2, 3],
        vyRange: [2, 4],
        shape: 'pixel_leaf',
        background: '#000000'
      },
      {
        color: '#FF9800',
        size: 8,
        vxRange: [-3, 2],
        vyRange: [3, 5],
        shape: 'pixel_leaf',
        background: '#000000'
      },
      {
        color: '#FFFFFF',
        size: 8,
        vxRange: [-2, 4],
        vyRange: [1, 2],
        shape: 'pixel_snowflake',
        background: '#1A237E'
      }
    ];

    this.restoreParticleState();
    this.init();
  }

  init() {
    this.resizeCanvas();
    if (this.particles.length === 0) {
      this.createParticles();
    }
    this.animate();
    this.setupEventListeners();
    this.startSeasonCycle();
    
    window.addEventListener('beforeunload', () => {
      this.saveParticleState();
    });
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    const config = this.seasonConfig[this.currentSeason];

    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * -this.canvas.height,
        size: config.size * (0.8 + Math.random() * 0.4),
        vx: config.vxRange[0] + Math.random() * (config.vxRange[1] - config.vxRange[0]),
        vy: config.vyRange[0] + Math.random() * (config.vyRange[1] - config.vyRange[0]),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        color: config.color,
        shape: config.shape,
        alpha: 0.7 + Math.random() * 0.3,
        swingAngle: Math.random() * Math.PI * 2,
        swingSpeed: 0.01 + Math.random() * 0.02
      });
    }
  }

  drawParticle(particle) {
    this.ctx.save();
    this.ctx.globalAlpha = particle.alpha;
    this.ctx.translate(particle.x, particle.y);
    this.ctx.rotate(particle.rotation);
    this.ctx.fillStyle = particle.color;

    if (particle.shape === 'pixel_leaf') {
      const s = particle.size / 4;
      this.ctx.fillRect(-s, -2*s, s, s);
      this.ctx.fillRect(0, -2*s, s, s);
      this.ctx.fillRect(-2*s, -s, s, s);
      this.ctx.fillRect(-s, -s, 2*s, 2*s);
      this.ctx.fillRect(s, -s, s, s);
      this.ctx.fillRect(-s, s, 2*s, s);
      this.ctx.fillRect(0, 2*s, s, s);
    } else if (particle.shape === 'pixel_snowflake') {
      const s = particle.size / 4;
      this.ctx.fillRect(-2*s, 0, 5*s, s);
      this.ctx.fillRect(0, -2*s, s, 5*s);
      this.ctx.fillRect(-s, -s, s, s);
      this.ctx.fillRect(s, -s, s, s);
      this.ctx.fillRect(-s, s, s, s);
      this.ctx.fillRect(s, s, s, s);
    }

    this.ctx.restore();
  }

  updateParticle(particle, isOldParticle = false) {
    particle.swingAngle += particle.swingSpeed;
    const swingOffset = Math.sin(particle.swingAngle) * 2;
    particle.x += particle.vx + swingOffset;
    particle.y += particle.vy;
    particle.rotation += particle.rotationSpeed;

    if (particle.y > this.canvas.height + particle.size) {
      particle.y = -particle.size;
      particle.x = Math.random() * this.canvas.width;
      const config = this.seasonConfig[this.currentSeason];
      particle.color = config.color;
      particle.shape = config.shape;
      particle.size = config.size * (0.8 + Math.random() * 0.4);
    }

    if (particle.x > this.canvas.width + particle.size) particle.x = -particle.size;
    if (particle.x < -particle.size) particle.x = this.canvas.width + particle.size;

    if (this.seasonChanging) {
      const progress = Math.min(this.changeProgress, 1);
      if (isOldParticle) {
        particle.alpha = 1 - progress;
      } else {
        particle.alpha = progress;
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.seasonChanging) {
      this.changeProgress += 0.01;
      if (this.changeProgress >= 1) {
        this.seasonChanging = false;
        this.oldParticles = null;
      }
    }

    if (this.oldParticles) {
      this.oldParticles.forEach(particle => {
        this.updateParticle(particle, true);
        this.drawParticle(particle);
      });
    }

    this.particles.forEach(particle => {
      this.updateParticle(particle);
      this.drawParticle(particle);
    });

    requestAnimationFrame(() => this.animate());
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  startSeasonCycle() {
    this.switchSeasonInterval = null;
    this.scheduleNextSeasonSwitch();
  }

  scheduleNextSeasonSwitch() {
    const minInterval = 18000;
    const maxInterval = 21000;
    const randomInterval = minInterval + Math.random() * (maxInterval - minInterval);
    
    this.switchSeasonInterval = setTimeout(() => {
      this.switchSeason();
      this.scheduleNextSeasonSwitch();
    }, randomInterval);
  }

  switchSeason() {
    this.seasonChanging = true;
    this.changeProgress = 0;
    this.oldParticles = [...this.particles];
    this.currentSeason = (this.currentSeason + 1) % 4;
    this.createParticles();
  }

  saveParticleState() {
    try {
      const state = {
        particles: this.particles.map(p => ({
          x: p.x,
          y: p.y,
          size: p.size,
          vx: p.vx,
          vy: p.vy,
          rotation: p.rotation,
          rotationSpeed: p.rotationSpeed,
          color: p.color,
          shape: p.shape,
          alpha: p.alpha,
          swingAngle: p.swingAngle,
          swingSpeed: p.swingSpeed
        })),
        currentSeason: this.currentSeason,
        seasonChanging: this.seasonChanging,
        changeProgress: this.changeProgress
      };
      sessionStorage.setItem('seasonalParticlesState', JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save particle state:', e);
    }
  }

  restoreParticleState() {
    try {
      const stateStr = sessionStorage.getItem('seasonalParticlesState');
      if (stateStr) {
        const state = JSON.parse(stateStr);
        this.particles = state.particles || [];
        this.currentSeason = state.currentSeason || 0;
        this.seasonChanging = state.seasonChanging || false;
        this.changeProgress = state.changeProgress || 0;
        sessionStorage.removeItem('seasonalParticlesState');
        return true;
      }
    } catch (e) {
      console.warn('Failed to restore particle state:', e);
    }
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SeasonalParticles('canvas');
});