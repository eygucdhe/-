// Seasonal Particle Animation - Four Seasons Implementation
class SeasonalParticles {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.numParticles = 50; // 修复变量名不一致问题
    this.particleCount = 50; // 减少粒子数量
    
    // 设置canvas样式使其固定在背景，不影响页面内容布局
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '-1'; // 确保在内容下方
    this.canvas.style.pointerEvents = 'none'; // 允许鼠标事件穿透
    
    this.currentSeason = 0; // 0: Spring, 1: Summer, 2: Autumn, 3: Winter
    this.seasonNames = ['Spring', 'Summer', 'Autumn', 'Winter'];
    this.seasonChanging = false;
    this.changeProgress = 0;

    // Season configurations
    this.seasonConfig = [
      { // Spring - Green leaves
        color: '#8BC34A',
        size: 8,  // 像素风格尺寸调整
        vxRange: [-1, 2],
        vyRange: [1, 3],
        shape: 'pixel_leaf',  // 像素树叶
        background: '#000000'
      },
      { // Summer - Dark green leaves
        color: '#4CAF50',
        size: 8,  // 像素风格尺寸调整
        vxRange: [-2, 3],
        vyRange: [2, 4],
        shape: 'pixel_leaf',  // 像素树叶
        background: '#000000'
      },
      { // Autumn - Orange leaves
        color: '#FF9800',
        size: 8,  // 像素风格尺寸调整
        vxRange: [-3, 2],
        vyRange: [3, 5],
        shape: 'pixel_leaf',  // 像素树叶
        background: '#000000'
      },
      { // Winter - Snowflakes
        color: '#FFFFFF',
        size: 8,  // 像素风格尺寸调整
        vxRange: [-2, 4],
        vyRange: [1, 2],
        shape: 'pixel_snowflake',  // 像素雪花
        background: '#1A237E'
      }
    ];

    // 尝试恢复粒子状态
    this.restoreParticleState();
    
    this.init();
  }

  init() {
    this.resizeCanvas();
    // 如果没有恢复粒子状态，则创建新的粒子
    if (this.particles.length === 0) {
      this.createParticles();
    }
    this.animate();
    this.setupEventListeners();
    this.startSeasonCycle();
    
    // 添加页面卸载前保存粒子状态
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
      // 像素风格树叶 (3x3像素网格)
      const s = particle.size / 4; // 基础像素单元大小
      this.ctx.fillRect(-s, -2*s, s, s);
      this.ctx.fillRect(0, -2*s, s, s);
      this.ctx.fillRect(-2*s, -s, s, s);
      this.ctx.fillRect(-s, -s, 2*s, 2*s);
      this.ctx.fillRect(s, -s, s, s);
      this.ctx.fillRect(-s, s, 2*s, s);
      this.ctx.fillRect(0, 2*s, s, s);
    } else if (particle.shape === 'pixel_snowflake') {
      // 像素风格雪花 (3x3像素十字)
      const s = particle.size / 4; // 基础像素单元大小
      // 水平方向
      this.ctx.fillRect(-2*s, 0, 5*s, s);
      // 垂直方向
      this.ctx.fillRect(0, -2*s, s, 5*s);
      // 对角线
      this.ctx.fillRect(-s, -s, s, s);
      this.ctx.fillRect(s, -s, s, s);
      this.ctx.fillRect(-s, s, s, s);
      this.ctx.fillRect(s, s, s, s);
    }

    this.ctx.restore();
  }

  updateParticle(particle) {
    // Update swing motion
    particle.swingAngle += particle.swingSpeed;
    const swingOffset = Math.sin(particle.swingAngle) * 2;
    particle.x += particle.vx + swingOffset;
    particle.y += particle.vy;
    particle.rotation += particle.rotationSpeed;

    // Reset when particle goes below screen
    if (particle.y > this.canvas.height + particle.size) {
      particle.y = -particle.size;
      particle.x = Math.random() * this.canvas.width;
      // Apply current season properties when respawning
      const config = this.seasonConfig[this.currentSeason];
      particle.color = config.color;
      particle.shape = config.shape;
      particle.size = config.size * (0.8 + Math.random() * 0.4);
    }

    // Wrap around horizontal edges
    if (particle.x > this.canvas.width + particle.size) particle.x = -particle.size;
    if (particle.x < -particle.size) particle.x = this.canvas.width + particle.size;
  }

  switchSeason() {
    this.seasonChanging = true;
    this.changeProgress = 0;
    this.oldParticles = [...this.particles]; // 保存当前粒子
    this.currentSeason = (this.currentSeason + 1) % 4;
    this.createParticles(); // 创建新季节粒子
}

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 更新季节切换进度
    if (this.seasonChanging) {
        this.changeProgress += 0.01;
        if (this.changeProgress >= 1) {
            this.seasonChanging = false;
            this.oldParticles = null;
        }
    }

    // 渲染旧粒子（如果处于切换状态）
    if (this.oldParticles) {
        this.oldParticles.forEach(particle => {
            this.updateParticle(particle, true);
            this.drawParticle(particle);
        });
    }

    // 渲染新粒子
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
    // 移除原有的固定间隔定时器
    // this.seasonInterval = setInterval(() => this.switchSeason(), 10000);
    this.switchSeasonInterval = null;
    this.scheduleNextSeasonSwitch();
}

// 添加缺失的季节切换调度方法
scheduleNextSeasonSwitch() {
    const minInterval = 18000; // 1.75分钟（毫秒）
    const maxInterval = 21000; // 2.25分钟（毫秒）
    const randomInterval = minInterval + Math.random() * (maxInterval - minInterval);
    
    this.switchSeasonInterval = setTimeout(() => {
        this.switchSeason();
        this.scheduleNextSeasonSwitch();
    }, randomInterval);
}

// 修改季节切换方法，实现平滑过渡
switchSeason() {
    this.seasonChanging = true;
    this.changeProgress = 0;
    this.oldParticles = [...this.particles]; // 保存当前粒子
    this.currentSeason = (this.currentSeason + 1) % 4;
    this.createParticles(); // 创建新季节粒子
}

// 更新粒子方法，添加过渡效果
updateParticle(particle, isOldParticle = false) {
    // Update swing motion
    particle.swingAngle += particle.swingSpeed;
    const swingOffset = Math.sin(particle.swingAngle) * 2;
    particle.x += particle.vx + swingOffset;
    particle.y += particle.vy;
    particle.rotation += particle.rotationSpeed;

    // Reset when particle goes below screen
    if (particle.y > this.canvas.height + particle.size) {
      particle.y = -particle.size;
      particle.x = Math.random() * this.canvas.width;
      // Apply current season properties when respawning
      const config = this.seasonConfig[this.currentSeason];
      particle.color = config.color;
      particle.shape = config.shape;
      particle.size = config.size * (0.8 + Math.random() * 0.4);
    }

    // Wrap around horizontal edges
    if (particle.x > this.canvas.width + particle.size) particle.x = -particle.size;
    if (particle.x < -particle.size) particle.x = this.canvas.width + particle.size;
    // 季节切换过渡效果
    if (this.seasonChanging) {
        const progress = Math.min(this.changeProgress, 1);
        if (isOldParticle) {
            // 旧粒子淡出
            particle.alpha = 1 - progress;
        } else {
            // 新粒子淡入
            particle.alpha = progress;
        }
    }
}

  // 保存粒子状态到sessionStorage
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

  // 从sessionStorage恢复粒子状态
  restoreParticleState() {
    try {
      const stateStr = sessionStorage.getItem('seasonalParticlesState');
      if (stateStr) {
        const state = JSON.parse(stateStr);
        this.particles = (state.particles || []).map(p => ({
          ...p,
          canvas: this.canvas,
          ctx: this.ctx
        }));
        this.currentSeason = state.currentSeason || 0;
        this.seasonChanging = state.seasonChanging || false;
        this.changeProgress = state.changeProgress || 0;
        // 清除已恢复的状态，避免重复恢复
        sessionStorage.removeItem('seasonalParticlesState');
        return true;
      }
    } catch (e) {
      console.warn('Failed to restore particle state:', e);
    }
    return false;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SeasonalParticles('canvas');
});