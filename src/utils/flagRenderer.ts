import { Country } from '../types/game';

/**
 * Draws realistic cloth wave lighting highlights and shadows over a canvas area.
 * Simulates an authentic waving stadium silk flag.
 */
export function applyClothWaveLighting(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  timeSec: number
) {
  ctx.save();
  ctx.translate(x, y);

  const numFolds = 6;
  const foldWidth = w / numFolds;

  for (let i = 0; i < numFolds; i++) {
    const waveX = i * foldWidth;
    const phase = i * 0.85 + timeSec * 2.4;
    const waveOffset = Math.sin(phase) * 0.22;

    const foldGrad = ctx.createLinearGradient(waveX, 0, waveX + foldWidth, 0);
    if (waveOffset > 0) {
      foldGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
      foldGrad.addColorStop(0.5, `rgba(255, 255, 255, ${waveOffset * 0.45})`);
      foldGrad.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
    } else {
      foldGrad.addColorStop(0, 'rgba(0, 0, 0, 0.18)');
      foldGrad.addColorStop(0.5, `rgba(0, 0, 0, ${Math.abs(waveOffset) * 0.4})`);
      foldGrad.addColorStop(1, 'rgba(255, 255, 255, 0.06)');
    }

    ctx.fillStyle = foldGrad;
    ctx.fillRect(waveX, 0, foldWidth + 1, h);
  }

  // Soft diagonal sheen across the cloth
  const diagGrad = ctx.createLinearGradient(0, 0, w, h);
  diagGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  diagGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.06)');
  diagGrad.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
  ctx.fillStyle = diagGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}

/**
 * Draws an Ultra-Realistic 3D Countryball with expressive animated eyes,
 * authentic spherical flag texture, realistic drop shadow, and glass gloss!
 */
export function drawCountryBall(
  ctx: CanvasRenderingContext2D,
  country: Country,
  x: number,
  y: number,
  radius: number,
  rotation: number,
  vx: number = 0,
  vy: number = 0,
  supercharged: boolean = false,
  isFrozen: boolean = false
) {
  ctx.save();

  // 1. Soft Drop Shadow cast onto the grid floor using hardware-accelerated radial gradients
  ctx.save();
  const shadowGrad = ctx.createRadialGradient(x + 2, y + radius * 0.85, 0, x + 2, y + radius * 0.85, radius * 0.9);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
  shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x + 2, y + radius * 0.85, radius * 0.9, radius * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Supercharged Aura
  if (supercharged) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius + 7, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.restore();
  }

  // 3. Outer Neon Accent Ring (or Frost Icy Ring if Frozen)
  ctx.beginPath();
  ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
  ctx.strokeStyle = isFrozen ? '#38bdf8' : country.accentColor || country.primaryColor;
  ctx.lineWidth = isFrozen ? 3.5 : 2.5;
  ctx.stroke();

  // 4. Circular Flag Sphere Clip
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.clip();

  // Rotate ball flag
  ctx.rotate(rotation);
  drawFlagPattern(ctx, country, -radius, -radius, radius * 2, radius * 2, 1.0);

  // 3D Spherical Volume Shading
  const sphereGrad = ctx.createRadialGradient(
    -radius * 0.35,
    -radius * 0.35,
    radius * 0.1,
    0,
    0,
    radius
  );
  if (isFrozen) {
    sphereGrad.addColorStop(0, 'rgba(224, 242, 254, 0.9)');
    sphereGrad.addColorStop(0.3, 'rgba(186, 230, 253, 0.5)');
    sphereGrad.addColorStop(0.7, 'rgba(14, 116, 144, 0.6)');
    sphereGrad.addColorStop(1, 'rgba(8, 51, 68, 0.85)');
  } else {
    sphereGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    sphereGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.12)');
    sphereGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.25)');
    sphereGrad.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
  }

  ctx.fillStyle = sphereGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // Exit ball clip

  // 5. Expressive Countryball Eyes (Iconic Polandball style!)
  // Eyes look towards velocity or wide/shivering if frozen
  const speed = Math.hypot(vx, vy);
  const lookDirX = speed > 0.1 ? (vx / speed) * radius * 0.22 : 0;
  const lookDirY = speed > 0.1 ? (vy / speed) * radius * 0.18 : 0;

  const eyeOffsetY = -radius * 0.12;
  const eyeSpacing = radius * 0.36;
  const eyeRadiusX = radius * 0.24;
  const eyeRadiusY = supercharged ? radius * 0.18 : isFrozen ? radius * 0.3 : radius * 0.26;

  // Left & Right Eyes
  [-1, 1].forEach((side) => {
    const eyeX = x + side * eyeSpacing + lookDirX;
    const eyeY = y + eyeOffsetY + lookDirY;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.lineWidth = 1.8;
    ctx.strokeStyle = isFrozen ? '#0284c7' : '#0f172a';
    ctx.stroke();

    // Pupil
    ctx.beginPath();
    const pupilX = eyeX + lookDirX * 0.5;
    const pupilY = eyeY + lookDirY * 0.5;
    ctx.arc(pupilX, pupilY, radius * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = isFrozen ? '#0369a1' : '#0f172a';
    ctx.fill();
    ctx.restore();
  });

  // 6. Specular Glass Shine on Ball Surface
  ctx.save();
  ctx.beginPath();
  ctx.arc(x - radius * 0.35, y - radius * 0.35, radius * 0.24, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.fill();
  ctx.restore();

  // 7. Ice Block Enclosure if Frozen
  if (isFrozen) {
    ctx.save();
    const boxSize = radius * 2.3;
    ctx.translate(x, y);

    // Icy translucent cube
    ctx.fillStyle = 'rgba(186, 230, 253, 0.38)';
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize, 6);
    ctx.fill();
    ctx.stroke();

    // Ice cracks
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-boxSize * 0.3, -boxSize * 0.35);
    ctx.lineTo(-boxSize * 0.05, -boxSize * 0.1);
    ctx.lineTo(-boxSize * 0.2, boxSize * 0.2);
    ctx.moveTo(boxSize * 0.1, -boxSize * 0.2);
    ctx.lineTo(boxSize * 0.3, 0);
    ctx.stroke();

    ctx.restore();

    // Frozen text tag
    ctx.save();
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#bae6fd';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 6;
    ctx.fillText('❄️ FROZEN', x, y + radius + 15);
    ctx.restore();
  }

  // 8. Country Tag Floating Above
  ctx.save();
  ctx.font = `bold ${Math.max(10, Math.round(radius * 0.85))}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000000';
  ctx.fillText(country.emoji, x + 1, y - radius - 11);
  ctx.fillText(country.emoji, x, y - radius - 12);
  ctx.restore();

  ctx.restore();
}

/**
 * Draws the authentic national flag graphic with high-fidelity emblems.
 */
export function drawFlagPattern(
  ctx: CanvasRenderingContext2D,
  country: Country,
  x: number,
  y: number,
  w: number,
  h: number,
  opacity: number = 1.0
) {
  ctx.save();
  ctx.globalAlpha = opacity;

  const stripes = country.stripeColors || [country.primaryColor, country.secondaryColor, country.accentColor];

  switch (country.flagType) {
    case 'vertical_3':
    case 'afghanistan': {
      const sw = w / 3;
      ctx.fillStyle = stripes[0];
      ctx.fillRect(x, y, sw, h);
      ctx.fillStyle = stripes[1];
      ctx.fillRect(x + sw, y, sw, h);
      ctx.fillStyle = stripes[2];
      ctx.fillRect(x + sw * 2, y, sw + 1, h);

      if (country.emblemText && w >= 14) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(9, Math.round(w * 0.34))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(country.emblemText, x + w / 2, y + h / 2);
      }
      break;
    }

    case 'israel': {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#0038b8';
      const stripeH = h * 0.16;
      ctx.fillRect(x, y + h * 0.1, w, stripeH);
      ctx.fillRect(x, y + h * 0.74, w, stripeH);

      // Star of David
      if (w >= 14) {
        ctx.fillStyle = '#0038b8';
        ctx.font = `bold ${Math.max(10, Math.round(w * 0.44))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✡', x + w / 2, y + h / 2);
      }
      break;
    }

    case 'india': {
      const sh = h / 3;
      ctx.fillStyle = '#ff9933';
      ctx.fillRect(x, y, w, sh);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y + sh, w, sh);
      ctx.fillStyle = '#138808';
      ctx.fillRect(x, y + sh * 2, w, sh + 1);

      // Ashoka Chakra wheel with spokes
      if (w >= 14) {
        const cx = x + w / 2;
        const cy = y + h / 2;
        const chakraR = Math.min(w, h) * 0.14;

        ctx.strokeStyle = '#000080';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, chakraR, 0, Math.PI * 2);
        ctx.stroke();

        for (let i = 0; i < 8; i++) {
          const ang = (Math.PI * 2 * i) / 8;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(ang) * chakraR, cy + Math.sin(ang) * chakraR);
          ctx.stroke();
        }
      }
      break;
    }

    case 'iran': {
      const sh = h / 3;
      ctx.fillStyle = '#239f40';
      ctx.fillRect(x, y, w, sh);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y + sh, w, sh);
      ctx.fillStyle = '#da0000';
      ctx.fillRect(x, y + sh * 2, w, sh + 1);

      if (w >= 14) {
        ctx.fillStyle = '#da0000';
        ctx.font = `bold ${Math.max(10, Math.round(w * 0.4))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☫', x + w / 2, y + h / 2);
      }
      break;
    }

    case 'japan': {
      ctx.fillStyle = stripes[0] || '#ffffff';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = stripes[1] || '#bc002d';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.32, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'horizontal_3': {
      const sh = h / 3;
      ctx.fillStyle = stripes[0];
      ctx.fillRect(x, y, w, sh);
      ctx.fillStyle = stripes[1];
      ctx.fillRect(x + sh, y, w, sh);
      ctx.fillStyle = stripes[2];
      ctx.fillRect(x + sh * 2, y, w, sh + 1);

      if (country.emblemText && w >= 14) {
        ctx.fillStyle = country.accentColor || '#ffffff';
        ctx.font = `bold ${Math.max(9, Math.round(w * 0.32))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(country.emblemText, x + w / 2, y + h / 2);
      }
      break;
    }

    default: {
      ctx.fillStyle = country.primaryColor;
      ctx.fillRect(x, y, w, h);

      if (stripes.length >= 2 && country.secondaryColor !== country.primaryColor) {
        ctx.fillStyle = country.secondaryColor;
        const sh = h * 0.35;
        ctx.fillRect(x, y + (h - sh) / 2, w, sh);
      }

      if (country.emblemText && w >= 14) {
        ctx.fillStyle = country.textColor;
        ctx.font = `bold ${Math.max(9, Math.round(w * 0.36))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(country.emblemText, x + w / 2, y + h / 2);
      }
      break;
    }
  }

  ctx.restore();
}

/**
 * Draws realistic flowing flag territory cell with texture and authentic flag colors.
 */
export function drawTerritoryCell(
  ctx: CanvasRenderingContext2D,
  country: Country,
  x: number,
  y: number,
  w: number,
  h: number,
  col: number,
  row: number,
  waveLight: number = 0
) {
  const stripes = country.stripeColors || [country.primaryColor, country.secondaryColor, country.accentColor];

  switch (country.flagType) {
    case 'vertical_3':
    case 'afghanistan': {
      const stripeIdx = col % 3;
      ctx.fillStyle = stripes[stripeIdx];
      ctx.fillRect(x, y, w, h);
      break;
    }

    case 'horizontal_3':
    case 'india':
    case 'iran': {
      const stripeIdx = row % 3;
      ctx.fillStyle = stripes[stripeIdx];
      ctx.fillRect(x, y, w, h);
      break;
    }

    case 'israel': {
      const isStripe = row % 5 === 1 || row % 5 === 3;
      ctx.fillStyle = isStripe ? '#0038b8' : '#ffffff';
      ctx.fillRect(x, y, w, h);
      break;
    }

    case 'japan': {
      const isRed = col % 6 >= 2 && col % 6 <= 4 && row % 6 >= 2 && row % 6 <= 4;
      ctx.fillStyle = isRed ? '#bc002d' : '#ffffff';
      ctx.fillRect(x, y, w, h);
      break;
    }

    default: {
      const isAccent = (col + row) % 4 === 0;
      ctx.fillStyle = isAccent && country.secondaryColor ? country.secondaryColor : country.primaryColor;
      ctx.fillRect(x, y, w, h);
      break;
    }
  }

  // Waving silk fabric light
  if (waveLight !== 0) {
    if (waveLight > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${waveLight})`;
    } else {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.abs(waveLight)})`;
    }
    ctx.fillRect(x, y, w, h);
  }
}

/**
 * Draws the realistic waving national flag in the background quadrant.
 */
export function drawSectorBackgroundFlag(
  ctx: CanvasRenderingContext2D,
  country: Country,
  x: number,
  y: number,
  w: number,
  h: number,
  timeSec: number
) {
  ctx.save();

  // 1. Draw flag base
  drawFlagPattern(ctx, country, x, y, w, h, 0.9);

  // 2. Apply waving cloth lighting folds over the flag
  applyClothWaveLighting(ctx, x, y, w, h, timeSec);

  // 3. Subtle dark vignette to emphasize territory borders
  const vignette = ctx.createRadialGradient(
    x + w / 2,
    y + h / 2,
    Math.min(w, h) * 0.15,
    x + w / 2,
    y + h / 2,
    Math.max(w, h) * 0.7
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.32)');
  ctx.fillStyle = vignette;
  ctx.fillRect(x, y, w, h);

  // 4. Large bold watermark in center
  ctx.font = `900 ${Math.max(22, Math.round(w * 0.09))}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillText(country.name.toUpperCase(), x + w / 2, y + h / 2);

  ctx.restore();
}

/**
 * Draws the dynamic floating national emblem and flag banner over the center-of-mass
 * of a country's active conquered territory.
 */
export function drawTerritoryCenterEmblem(
  ctx: CanvasRenderingContext2D,
  country: Country,
  centerX: number,
  centerY: number,
  territoryPercentage: number
) {
  if (territoryPercentage < 2) return;

  ctx.save();
  ctx.translate(centerX, centerY);

  const scale = Math.min(1.5, Math.max(0.7, territoryPercentage / 25));
  const emblemSize = 30 * scale;

  // Soft circular shield behind emblem
  ctx.beginPath();
  ctx.arc(0, 0, emblemSize + 6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fill();
  ctx.strokeStyle = country.accentColor || country.primaryColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Flag emoji or national emblem
  ctx.font = `bold ${Math.round(emblemSize)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(country.emoji, 0, 0);

  // Label tag below
  ctx.font = `900 ${Math.max(10, Math.round(11 * scale))}px sans-serif`;
  // Double-draw clean outline shadow for speed
  ctx.fillStyle = '#000000';
  ctx.fillText(`${country.name.toUpperCase()} (${territoryPercentage.toFixed(0)}%)`, 1, emblemSize + 14);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${country.name.toUpperCase()} (${territoryPercentage.toFixed(0)}%)`, 0, emblemSize + 13);

  ctx.restore();
}
