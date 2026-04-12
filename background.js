class ClassicalNoise {
  constructor(randomSeed) {
    if (randomSeed === undefined) randomSeed = Math;
    this.grad3 = [
      [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
      [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
      [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ];
    this.p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(randomSeed.random() * 256);
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(a, b, t) {
    return a + t * (b - a);
  }

  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    const A  = this.perm[X] + Y;
    const AA = this.perm[A] + Z;
    const AB = this.perm[A + 1] + Z;
    const B  = this.perm[X + 1] + Y;
    const BA = this.perm[B] + Z;
    const BB = this.perm[B + 1] + Z;

    return this.lerp(
      this.lerp(
        this.lerp(this.grad(this.perm[AA], x, y, z), this.grad(this.perm[BA], x - 1, y, z), u),
        this.lerp(this.grad(this.perm[AB], x, y - 1, z), this.grad(this.perm[BB], x - 1, y - 1, z), u),
        v
      ),
      this.lerp(
        this.lerp(this.grad(this.perm[AA + 1], x, y, z - 1), this.grad(this.perm[BA + 1], x - 1, y, z - 1), u),
        this.lerp(this.grad(this.perm[AB + 1], x, y - 1, z - 1), this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1), u),
        v
      ),
      w
    );
  }
}

(function () {
  const canvas = document.getElementById('backgroundCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const perlin = new ClassicalNoise();
  const variation = 0.0025;
  const amp = 300;
  const variators = [];
  const maxLines = navigator.userAgent.toLowerCase().includes('firefox') ? 25 : 40;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let startY = 0;

  for (let i = 0, u = 0; i < maxLines; i++, u += 0.02) {
    variators[i] = u;
  }

  function resizeCanvas() {
    canvasWidth = document.documentElement.clientWidth;
    canvasHeight = document.documentElement.clientHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    startY = canvasHeight / 2;
  }

  function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.shadowColor = 'rgb(0, 195, 255)';
    ctx.shadowBlur = 0;

    for (let i = 0; i < maxLines; i++) {
      ctx.beginPath();
      ctx.moveTo(0, startY);
      let y = 0;

      for (let x = 0; x <= canvasWidth; x++) {
        y = perlin.noise(x * variation + variators[i], x * variation, 0);
        ctx.lineTo(x, startY + amp * y);
      }

      const alpha = Math.min(Math.abs(y) + 0.05, 0.05) * 2;
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.stroke();
      ctx.closePath();
      variators[i] += 0.005;
    }
  }

  function animate() {
    draw();
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(animate);
})();
