import { useEffect, useRef } from "react";

export default function HeartCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = 560;
    const H = 560;

    const SIZE_STEPS = 100;

    function linspace(a, b, n) {
      const arr = [];
      for (let i = 0; i < n; i++) {
        arr.push(a + (b - a) * i / (n - 1));
      }
      return arr;
    }

    const aArr      = linspace(13,    13,    SIZE_STEPS);
    const bArr      = linspace(-5,   -3.3,   SIZE_STEPS);
    const cArr      = linspace(-2,   -2.4,   SIZE_STEPS);
    const dArr      = linspace(-1,   -0.16,  SIZE_STEPS);
    const scalexArr = linspace(1,     1.18,  SIZE_STEPS).map(v => v * 10);
    const scaleyArr = linspace(1,     1.36,  SIZE_STEPS).map(v => v * 10);

    function hsvToRgb(h, s, v) {
      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);
      let r, g, b;
      switch (i % 6) {
        case 0: r=v; g=t; b=p; break;
        case 1: r=q; g=v; b=p; break;
        case 2: r=p; g=v; b=t; break;
        case 3: r=p; g=q; b=v; break;
        case 4: r=t; g=p; b=v; break;
        case 5: r=v; g=p; b=q; break;
      }
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function rand(a, b) { return Math.random() * (b - a) + a; }
    function randn() { return (Math.random() + Math.random() + Math.random() - 1.5) * 1.2; }
    function randExp(scale) { return -Math.log(1 - Math.random()) * scale; }

    function makeTPoints(n) {
      const pts = [];
      const half = Math.floor(n / 2);
      for (let i = 0; i < half; i++) {
        pts.push(0.18 + (Math.PI - 0.36) * i / (half - 1));
      }
      for (let i = 0; i < half; i++) {
        pts.push(Math.PI + 0.18 + (Math.PI - 0.36) * i / (half - 1));
      }
      return pts;
    }

    const tList = makeTPoints(2000);

    const persistentParticles = [];
    for (let repeat = 0; repeat < 3; repeat++) {
      for (let ti = 0; ti < tList.length; ti++) {
        const t     = tList[ti];
        const off_s = -randExp(1.8);
        const size  = rand(1.5, 2.5);
        const [r, g, b] = hsvToRgb(0.95, rand(0.2, 0.7), 1);
        const alpha = Math.random();
        persistentParticles.push({ t, size, off_s, r, g, b, alpha });
      }
    }

    const glitterParticles = [];
    for (let repeat = 0; repeat < 3; repeat++) {
      for (let ti = 0; ti < tList.length; ti++) {
        const t     = tList[ti];
        const off_x = randn() * 2;
        const off_y = randn() * 2;
        const off_s = randn() * 1.5 - 1.8;
        const size  = rand(1.5, 2.5);
        const [r, g, b] = hsvToRgb(0.95, rand(0.5, 0.8), 1);
        const phi   = rand(0, 2 * Math.PI);
        glitterParticles.push({ t, size, off_x, off_y, off_s, r, g, b, phi });
      }
    }

    function getPersistentPos(p, i) {
      const t = p.t;
      let x = 16 * Math.pow(Math.sin(t), 3);
      x *= (scalexArr[i] + p.off_s);
      let y = aArr[i]*Math.cos(t) + bArr[i]*Math.cos(2*t) + cArr[i]*Math.cos(3*t) + dArr[i]*Math.cos(4*t);
      y *= (scaleyArr[i] + p.off_s);
      return [x + W/2, -y + H/2];
    }

    function getGlitterPos(p, i) {
      const t = p.t;
      let x = 16 * Math.pow(Math.sin(t), 3);
      x += p.off_x;
      x *= (scalexArr[i] + p.off_s);
      let y = aArr[i]*Math.cos(t) + bArr[i]*Math.cos(2*t) + cArr[i]*Math.cos(3*t) + dArr[i]*Math.cos(4*t);
      y += p.off_y;
      y *= (scaleyArr[i] + p.off_s);
      return [x + W/2, -y + H/2];
    }

    const bloomIndices  = linspace(0, SIZE_STEPS - 1, 40).map(v => Math.round(v));
    const shrinkIndices = linspace(SIZE_STEPS - 1, 0, 30).map(v => Math.round(v));
    const indices = [...bloomIndices, ...shrinkIndices];

    let frame = 0;
    let animId;

    function draw() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      const index = indices[frame % indices.length];
      const glitterIndex = index; // ← FIXED: was (SIZE_STEPS - 1 - index)

      for (let i = 0; i < persistentParticles.length; i++) {
        const p = persistentParticles[i];
        const [x, y] = getPersistentPos(p, index);
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.alpha.toFixed(2)})`;
        ctx.fill();
      }

      for (let i = 0; i < glitterParticles.length; i++) {
        const p = glitterParticles[i];
        const [x, y] = getGlitterPos(p, glitterIndex);
        const alpha = 0.5 * Math.cos(p.phi + frame / 5) + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${alpha.toFixed(2)})`;
        ctx.fill();
      }

      frame++;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);

  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={560}
      style={{ display: "block" }}
    />
  );
}