import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

const P5Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(document.createElement('div'));

  useEffect(() => {
    const sketch = (p: p5) => {
      const PETALS = 3;
      const CLUSTERING = 4;
      const COLOR_VARIATION = 0.005;
      const COUNTOUR_REGULARITY = 1;
      const SEGMENTS = 400;
      const colors = ["#b4368f", "#33151e", "#434f83", "#ef99dc", "#421430"].map(c => p.color(c));

      let centerX: number, centerY: number;

      p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent(containerRef.current);
        p.background(255);
        p.strokeWeight(4);
        centerX = p.width / 2;
        centerY = p.height / 2;
      };

      p.draw = () => {
        const cPct = (p.noise(p.frameCount * COLOR_VARIATION) + 1) % 1;
        const c = lerpColors(cPct, colors, p);
        c.setAlpha(Math.max(100 - p.frameCount / 3, 10));
        p.stroke(c);

        const radius = (p.frameCount * 100) / (p.frameCount + 200);
        const time = p.frameCount / 300;

        p.noFill();
        p.beginShape();
        for (let i = 0; i <= SEGMENTS; i++) {
          const pct = i / SEGMENTS;
          const angle = pct * p.TWO_PI + p.HALF_PI;
          const cosAngle = p.cos(angle) * COUNTOUR_REGULARITY;
          const sinAngle = p.sin(angle) * COUNTOUR_REGULARITY;
          const noiseValue = p.noise(sinAngle, cosAngle, p.frameCount / 100) * 4;
          const r = (1 - Math.pow(Math.abs(p.sin(pct * p.PI * PETALS)), CLUSTERING) + 0.5) * radius * noiseValue;
          const point = pointForIndex(pct + 0.25, centerX, centerY, time, p.frameCount / 10, 0.5, r, p);
          p.vertex(point.x, point.y);
        }
        p.endShape();
      };

      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
        centerX = p.width / 2;
        centerY = p.height / 2;
      };

      // Utility function for circular noise
      function pointForIndex(
        pct: number,
        x: number,
        y: number,
        time: number,
        intensity: number,
        NOISE_SCALE: number,
        INNER_RADIUS: number,
        p: p5
      ) {
        const angle = pct * p.TWO_PI;
        const cosAngle = p.cos(angle);
        const sinAngle = p.sin(angle);
        const noiseValue = p.noise(NOISE_SCALE * cosAngle + NOISE_SCALE, NOISE_SCALE * sinAngle + NOISE_SCALE, time);
        const radius = INNER_RADIUS + intensity * (noiseValue - 0.2);
        return {
          x: radius * cosAngle + x,
          y: radius * sinAngle + y,
        };
      }

      // Utility function to lerp between colors
      function lerpColors(t: number, colors: p5.Color[], p: p5): p5.Color {
        const i = Math.floor(t * (colors.length - 1));
        if (i < 0) return colors[0];
        if (i >= colors.length - 1) return colors[colors.length - 1];

        const percent = (t - i / (colors.length - 1)) * (colors.length - 1);
        return p.color(
          p.red(colors[i]) + percent * (p.red(colors[i + 1]) - p.red(colors[i])),
          p.green(colors[i]) + percent * (p.green(colors[i + 1]) - p.green(colors[i])),
          p.blue(colors[i]) + percent * (p.blue(colors[i + 1]) - p.blue(colors[i]))
        );
      }
    };

    const p5Instance = new p5(sketch);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return <div ref={containerRef} />;
};

export default P5Canvas;
