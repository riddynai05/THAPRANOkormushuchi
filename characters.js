/**
 * characters.js
 * High-Definition Procedural Vector Canvas Renderers for:
 * 1. MuscleBodybuilder (Player Character): Muscular frame, vascular bicep cut,
 *    striated chest, athletic fade, sweat wristbands, sneakers, fiery streak aura.
 * 2. BeardPanjabiGuy (Target Character): Traditional White Punjabi (Kurta) with gold buttons,
 *    Mandarin collar embroidery, flowing dynamic beard, flying prayer cap (tupi), flying slipper,
 *    slap marks, comical sweat beads, and dizzy star physics.
 */

// Polyfill roundRect for compatibility across all modern canvas contexts
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r = 0) {
    if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
    this.beginPath();
    this.moveTo(x + r.tl, y);
    this.lineTo(x + w - r.tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
    this.lineTo(x + w, y + h - r.br);
    this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
    this.lineTo(x + r.bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
    this.lineTo(x, y + r.tl);
    this.quadraticCurveTo(x, y, x + r.tl, y);
    this.closePath();
    return this;
  };
}

// ====================================================================
// 1. PLAYER: MUSCLE BODYBUILDER (ULTRA-POLISHED COMIC FIGHTER)
// ====================================================================

class MuscleBodybuilder {
  constructor(x, y) {
    this.baseX = x;
    this.baseY = y;
    this.x = x;
    this.y = y;

    // Animation states
    this.state = 'idle'; // 'idle', 'slap', 'tight-slap', 'punch', 'kick', 'ultimate'
    this.frame = 0;
    this.totalFrames = 1;
    this.breathTimer = 0;

    // Movement offsets for attacks
    this.offsetX = 0;
    this.offsetY = 0;
    this.armAngle = 0;
    this.fistScale = 1;
    this.kickProgress = 0;

    // Streak status passed from game engine
    this.streak = 0;
    this.auraTimer = 0;
  }

  update(dt) {
    this.breathTimer += dt * 3;
    this.auraTimer += dt * 5;

    if (this.state === 'idle') {
      this.offsetX = 0;
      this.offsetY = Math.sin(this.breathTimer) * 4;
      this.armAngle = Math.sin(this.breathTimer * 0.8) * 0.08;
    } else {
      this.frame += dt * 60; // 60 fps base
      const progress = Math.min(this.frame / this.totalFrames, 1);

      if (this.state === 'slap') {
        // Fast stinging slap arc
        if (progress < 0.28) {
          this.offsetX = -20 * (progress / 0.28);
          this.armAngle = -Math.PI * 0.45 * (progress / 0.28);
        } else if (progress < 0.48) {
          const strikeP = (progress - 0.28) / 0.2;
          this.offsetX = 55 * strikeP;
          this.armAngle = Math.PI * 0.65 * strikeP;
        } else {
          const retP = (progress - 0.48) / 0.52;
          this.offsetX = 55 * (1 - retP);
          this.armAngle = (Math.PI * 0.65) * (1 - retP);
        }
      } else if (this.state === 'tight-slap') {
        // Massive windup thunder slap
        if (progress < 0.38) {
          const p = progress / 0.38;
          this.offsetX = -45 * p;
          this.offsetY = 12 * p;
          this.armAngle = -Math.PI * 0.78 * p;
        } else if (progress < 0.62) {
          const strikeP = (progress - 0.38) / 0.24;
          this.offsetX = 100 * strikeP;
          this.offsetY = -15 * Math.sin(strikeP * Math.PI);
          this.armAngle = Math.PI * 0.95 * strikeP;
          this.fistScale = 1.4;
        } else {
          const retP = (progress - 0.62) / 0.38;
          this.offsetX = 100 * (1 - retP);
          this.offsetY = 0;
          this.armAngle = (Math.PI * 0.95) * (1 - retP);
          this.fistScale = 1;
        }
      } else if (this.state === 'punch') {
        // Straight muscular lunging gut punch
        if (progress < 0.22) {
          this.offsetX = -25 * (progress / 0.22);
          this.armAngle = -0.35;
        } else if (progress < 0.52) {
          const p = (progress - 0.22) / 0.3;
          this.offsetX = 90 * p;
          this.armAngle = 0.08;
          this.fistScale = 1.45;
        } else {
          const retP = (progress - 0.52) / 0.48;
          this.offsetX = 90 * (1 - retP);
          this.fistScale = 1;
        }
      } else if (this.state === 'kick') {
        // Roundhouse kick
        if (progress < 0.28) {
          this.kickProgress = progress / 0.28;
          this.offsetX = 25 * this.kickProgress;
        } else if (progress < 0.58) {
          this.kickProgress = 1;
          this.offsetX = 80;
        } else {
          const retP = (progress - 0.58) / 0.42;
          this.kickProgress = 1 - retP;
          this.offsetX = 80 * (1 - retP);
        }
      } else if (this.state === 'ultimate') {
        // Rapid flurries
        this.offsetX = 35 + Math.sin(this.frame * 2.2) * 25;
        this.armAngle = Math.sin(this.frame * 3.4) * Math.PI * 0.75;
        this.fistScale = 1.25 + Math.cos(this.frame * 2.2) * 0.25;
      }

      if (this.frame >= this.totalFrames) {
        this.resetToIdle();
      }
    }
  }

  triggerAction(actionName, durationFrames = 22) {
    this.state = actionName;
    this.frame = 0;
    this.totalFrames = durationFrames;
    this.fistScale = 1;
  }

  resetToIdle() {
    this.state = 'idle';
    this.frame = 0;
    this.totalFrames = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.armAngle = 0;
    this.fistScale = 1;
    this.kickProgress = 0;
  }

  render(ctx) {
    ctx.save();
    const curX = this.x + this.offsetX;
    const curY = this.y + this.offsetY;

    // Floor shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(this.baseX + 30 + (this.offsetX * 0.7), this.baseY + 185, 80, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // ==========================================
    // STREAK FIRE AURA (If streak >= 5)
    // ==========================================
    if (this.streak >= 5) {
      ctx.save();
      ctx.translate(curX, curY);
      const intensity = Math.min(this.streak / 15, 2.0);
      const flameCount = 10;
      for (let i = 0; i < flameCount; i++) {
        const angle = (i / flameCount) * Math.PI * 2 + this.auraTimer;
        const dist = 55 + Math.sin(this.auraTimer * 3 + i) * 15;
        const fx = Math.cos(angle) * (dist * 0.7);
        const fy = Math.sin(angle) * (dist * 1.3);
        const grad = ctx.createRadialGradient(fx, fy, 2, fx, fy, 25 * intensity);
        grad.addColorStop(0, this.streak >= 15 ? 'rgba(0, 210, 211, 0.8)' : 'rgba(254, 202, 87, 0.85)');
        grad.addColorStop(0.5, this.streak >= 15 ? 'rgba(255, 71, 87, 0.5)' : 'rgba(255, 107, 129, 0.5)');
        grad.addColorStop(1, 'rgba(255, 71, 87, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fx, fy, 28 * intensity, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.translate(curX, curY);

    // ==========================================
    // 1. LEGS & PANTS (Dark Navy Muscle Athletic Pants)
    // ==========================================
    const legColor = '#1f2a38';
    const legShade = '#141c26';
    const shoeColor = '#e74c3c';
    const shoeSole = '#ffffff';

    if (this.kickProgress > 0) {
      // Kicking Stance
      // Standing Leg (Back)
      ctx.fillStyle = legShade;
      ctx.beginPath();
      ctx.moveTo(-15, 60);
      ctx.lineTo(-32, 165);
      ctx.lineTo(-5, 165);
      ctx.lineTo(5, 60);
      ctx.closePath();
      ctx.fill();

      // Back Shoe
      ctx.fillStyle = shoeColor;
      ctx.beginPath();
      ctx.roundRect(-44, 160, 50, 24, 6);
      ctx.fill();
      ctx.fillStyle = shoeSole;
      ctx.fillRect(-44, 180, 50, 6);

      // Kicking Front Leg
      ctx.save();
      ctx.translate(22, 60);
      const kickRot = -0.4 - (this.kickProgress * 0.98);
      ctx.rotate(kickRot);

      ctx.fillStyle = legColor;
      // Muscular Thigh & Calf
      ctx.beginPath();
      ctx.roundRect(0, -20, 130, 40, 14);
      ctx.fill();

      // Sneaker
      ctx.fillStyle = shoeColor;
      ctx.beginPath();
      ctx.roundRect(120, -28, 48, 48, 8);
      ctx.fill();
      ctx.fillStyle = shoeSole;
      ctx.fillRect(158, -28, 10, 48);

      // Kick Speed Arc VFX
      if (this.kickProgress > 0.35) {
        ctx.strokeStyle = 'rgba(255, 234, 167, 0.7)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(70, 0, 105, 0.1, 1.4);
        ctx.stroke();
      }
      ctx.restore();
    } else {
      // Normal Athletic Stance
      // Left leg
      ctx.fillStyle = legShade;
      ctx.beginPath();
      ctx.moveTo(-25, 60);
      ctx.lineTo(-46, 165);
      ctx.lineTo(-15, 165);
      ctx.lineTo(-5, 60);
      ctx.closePath();
      ctx.fill();

      // Left shoe
      ctx.fillStyle = shoeColor;
      ctx.beginPath();
      ctx.roundRect(-56, 162, 50, 24, 6);
      ctx.fill();
      ctx.fillStyle = shoeSole;
      ctx.fillRect(-56, 180, 50, 6);

      // Right leg (muscular front leg)
      ctx.fillStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(0, 60);
      ctx.lineTo(-10, 165);
      ctx.lineTo(28, 165);
      ctx.lineTo(28, 60);
      ctx.closePath();
      ctx.fill();

      // Muscle highlights on quads
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, 72);
      ctx.lineTo(14, 140);
      ctx.stroke();

      // Right shoe
      ctx.fillStyle = shoeColor;
      ctx.beginPath();
      ctx.roundRect(-15, 162, 56, 24, 6);
      ctx.fill();
      ctx.fillStyle = shoeSole;
      ctx.fillRect(-15, 180, 56, 6);

      // Sneaker accents & laces
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(5, 166); ctx.lineTo(16, 166);
      ctx.moveTo(5, 172); ctx.lineTo(16, 172);
      ctx.stroke();
    }

    // ==========================================
    // 2. BACK ARM (Muscular Bicep)
    // ==========================================
    ctx.save();
    ctx.translate(-38, -45);
    ctx.fillStyle = '#b85e18'; // Deep shadow muscular skin
    ctx.beginPath();
    ctx.ellipse(-14, 20, 24, 40, -0.22, 0, Math.PI * 2);
    ctx.fill();
    // Clenched fist
    ctx.fillStyle = '#cf6d17';
    ctx.beginPath();
    ctx.arc(-16, 56, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ==========================================
    // 3. TORSO & TIGHT ATHLETIC TANK TOP
    // ==========================================
    // Skin under neck / traps
    ctx.fillStyle = '#d35400';
    ctx.beginPath();
    ctx.moveTo(-28, -62);
    ctx.lineTo(28, -62);
    ctx.lineTo(16, -38);
    ctx.lineTo(-16, -38);
    ctx.closePath();
    ctx.fill();

    // Massive Trapezius muscles
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.ellipse(-30, -60, 24, 18, -0.32, 0, Math.PI * 2);
    ctx.ellipse(30, -60, 24, 18, 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Fitted Crimson Athletic Shirt (V-Taper)
    const shirtGrad = ctx.createLinearGradient(-45, -55, 45, 65);
    shirtGrad.addColorStop(0, '#e74c3c');
    shirtGrad.addColorStop(0.5, '#c0392b');
    shirtGrad.addColorStop(1, '#962d22');
    ctx.fillStyle = shirtGrad;

    ctx.beginPath();
    ctx.moveTo(-48, -55);
    ctx.bezierCurveTo(-65, -28, -52, 28, -26, 62);
    ctx.lineTo(26, 62);
    ctx.bezierCurveTo(52, 28, 65, -28, 48, -55);
    ctx.closePath();
    ctx.fill();

    // Chest Pecs muscle cuts under tight shirt
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 3.5;
    // Left pec
    ctx.beginPath();
    ctx.arc(-19, -24, 21, 0.2, Math.PI * 0.88);
    ctx.stroke();
    // Right pec
    ctx.beginPath();
    ctx.arc(19, -24, 21, 0.12, Math.PI * 0.82);
    ctx.stroke();
    // Sternum line
    ctx.beginPath();
    ctx.moveTo(0, -46); ctx.lineTo(0, 8);
    ctx.stroke();

    // Six-pack ab cuts
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.moveTo(-18, 20); ctx.lineTo(18, 20);
    ctx.moveTo(-15, 38); ctx.lineTo(15, 38);
    ctx.moveTo(-12, 54); ctx.lineTo(12, 54);
    ctx.stroke();

    // Golden lion emblem on chest
    ctx.fillStyle = '#feca57';
    ctx.beginPath();
    ctx.arc(0, -18, 6, 0, Math.PI * 2);
    ctx.fill();

    // Belt / Waistband
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(-28, 58, 56, 8);
    ctx.fillStyle = '#f1c40f'; // Gold buckle
    ctx.fillRect(-7, 56, 14, 12);

    // ==========================================
    // 4. HEAD, MODERN FADE & INTENSE EXPRESSION
    // ==========================================
    ctx.save();
    ctx.translate(0, -82);

    // Muscular neck
    ctx.fillStyle = '#d35400';
    ctx.fillRect(-19, 10, 38, 20);

    // Strong Jawline Head
    ctx.beginPath();
    ctx.moveTo(-23, -16);
    ctx.lineTo(-25, 14);
    ctx.lineTo(-11, 26);
    ctx.lineTo(11, 26);
    ctx.lineTo(25, 14);
    ctx.lineTo(23, -16);
    ctx.closePath();
    ctx.fillStyle = '#f39c12';
    ctx.fill();

    // Skin highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(-8, 5, 16, 12);

    // Modern Undercut / Pompadour Hair
    ctx.fillStyle = '#1e1a18';
    ctx.beginPath();
    ctx.moveTo(-29, -13);
    ctx.quadraticCurveTo(-32, -42, -6, -46);
    ctx.quadraticCurveTo(26, -48, 32, -22);
    ctx.lineTo(25, -12);
    ctx.quadraticCurveTo(0, -26, -29, -13);
    ctx.closePath();
    ctx.fill();

    // Hair spike tips
    ctx.beginPath();
    ctx.moveTo(-12, -46); ctx.lineTo(16, -52); ctx.lineTo(12, -42);
    ctx.fill();

    // Eyebrows (Determined, sharply angled)
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.moveTo(-19, -5); ctx.lineTo(-4, 0); ctx.lineTo(-19, -2);
    ctx.moveTo(4, 0); ctx.lineTo(19, -5); ctx.lineTo(4, -2);
    ctx.stroke();

    // Eyes with fierce glint
    ctx.fillStyle = '#fff';
    ctx.fillRect(-17, 2, 9, 6);
    ctx.fillRect(8, 2, 9, 6);
    ctx.fillStyle = '#111';
    ctx.fillRect(-13, 3, 5, 5);
    ctx.fillRect(12, 3, 5, 5);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-12, 3, 2, 2);
    ctx.fillRect(13, 3, 2, 2);

    // Mouth / Smirk
    ctx.strokeStyle = '#3e1e07';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (this.state === 'slap' || this.state === 'tight-slap' || this.state === 'punch') {
      // Yelling power shout
      ctx.arc(0, 16, 9, 0, Math.PI);
      ctx.fillStyle = '#962d22';
      ctx.fill();
      ctx.stroke();
      // Teeth
      ctx.fillStyle = '#fff';
      ctx.fillRect(-6, 16, 12, 3);
    } else {
      // Confident hero smirk
      ctx.moveTo(-7, 16);
      ctx.quadraticCurveTo(2, 20, 14, 14);
      ctx.stroke();
    }
    ctx.restore();

    // ==========================================
    // 5. FRONT ATTACKING ARM & MASSIVE BICEP
    // ==========================================
    ctx.save();
    ctx.translate(36, -42);
    ctx.rotate(this.armAngle);

    // Shoulder cap / Deltoid
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 22, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Giant Bicep Peak
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.ellipse(26, 12, 30, 24, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Muscle vascularity / vein
    ctx.strokeStyle = 'rgba(192, 57, 43, 0.45)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(24, 10, 16, 0.25, Math.PI * 0.75);
    ctx.stroke();

    // Red Athletic Sweat Wristband
    ctx.translate(48, 16);
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.roundRect(14, -14, 16, 28, 4);
    ctx.fill();

    // Forearm
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.ellipse(26, 0, 28, 19, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hand / Palm / Fist
    ctx.translate(46, 0);
    ctx.scale(this.fistScale, this.fistScale);

    if (this.state === 'punch') {
      // Heavy punching fist
      ctx.fillStyle = '#d35400';
      ctx.beginPath();
      ctx.roundRect(0, -19, 40, 38, 10);
      ctx.fill();
      // Knuckles
      ctx.fillStyle = '#f39c12';
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.arc(36, -13 + (k * 8.5), 5.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Thumb
      ctx.beginPath();
      ctx.ellipse(15, 15, 13, 9, -0.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Wide open slap palm
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.roundRect(0, -19, 32, 38, 8);
      ctx.fill();

      // Slap fingers
      const fingerLen = this.state === 'tight-slap' ? 34 : 26;
      for (let f = 0; f < 4; f++) {
        ctx.beginPath();
        ctx.roundRect(26, -17 + (f * 8.5), fingerLen, 7.5, 3.5);
        ctx.fill();
      }
      // Thumb
      ctx.beginPath();
      ctx.roundRect(5, 15, 19, 10, 4);
      ctx.fill();

      // Golden wind shockwave aura on heavy slap
      if (this.state === 'tight-slap') {
        ctx.strokeStyle = 'rgba(254, 202, 87, 0.9)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(26, 0, 46, -Math.PI * 0.42, Math.PI * 0.42);
        ctx.stroke();
      }
    }

    ctx.restore();
    ctx.restore();
  }
}

// ====================================================================
// 2. TARGET: BEARD GUY IN WHITE PANJABI (KURTA)
// ====================================================================

class BeardPanjabiGuy {
  constructor(x, y) {
    this.baseX = x;
    this.baseY = y;
    this.x = x;
    this.y = y;

    // Wobble / Physics states
    this.headAngle = 0;
    this.bodyAngle = 0;
    this.beardAngle = 0;
    this.stumbleX = 0;
    this.stumbleY = 0;

    // Health / Dizziness
    this.dizziness = 0; // 0 to 100
    this.isDizzy = false;

    // Hit reaction animation
    this.hitTimer = 0;
    this.hitType = null;
    this.redCheek = 0;
    this.blinkTimer = 0;
    this.dizzyStarAngle = 0;

    // Flying Prayer Cap (Tupi) physics
    this.tupi = {
      isFlying: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rot: 0,
      rotSpeed: 0,
      groundY: 170
    };

    // Flying Slipper (Nagra) physics
    this.slipper = {
      isFlying: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rot: 0,
      rotSpeed: 0
    };

    // Sweat / Spit flying particles
    this.sweatDrops = [];
  }

  takeHit(hitType) {
    this.hitType = hitType;
    this.hitTimer = 0.48;

    // Spawn sweat / spit droplets on impact
    const dropCount = hitType === 'tight-slap' || hitType === 'kick' ? 12 : 6;
    for (let i = 0; i < dropCount; i++) {
      const angle = -Math.PI * 0.2 + (Math.random() * Math.PI * 0.9);
      const speed = 4 + Math.random() * 9;
      this.sweatDrops.push({
        x: -15 + Math.random() * 10,
        y: -65 + Math.random() * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        alpha: 1,
        life: 0.5 + Math.random() * 0.3
      });
    }

    if (hitType === 'slap') {
      this.headAngle = 0.38;
      this.bodyAngle = 0.14;
      this.beardAngle = 0.75;
      this.stumbleX = 38;
      this.redCheek = Math.min(this.redCheek + 38, 100);
      this.dizziness = Math.min(this.dizziness + 12, 100);
    } else if (hitType === 'tight-slap') {
      this.headAngle = 0.72;
      this.bodyAngle = 0.32;
      this.beardAngle = 1.45;
      this.stumbleX = 95;
      this.redCheek = 100;
      this.dizziness = Math.min(this.dizziness + 28, 100);

      // Launch the prayer cap flying into the air!
      if (!this.tupi.isFlying) {
        this.tupi.isFlying = true;
        this.tupi.x = 0;
        this.tupi.y = -95;
        this.tupi.vx = 6 + Math.random() * 5;
        this.tupi.vy = -14 - Math.random() * 4;
        this.tupi.rot = 0;
        this.tupi.rotSpeed = 0.35;
      }
    } else if (hitType === 'punch') {
      this.headAngle = -0.22;
      this.bodyAngle = -0.42; // bent double clutching stomach
      this.beardAngle = -0.45;
      this.stumbleX = 65;
      this.stumbleY = -12;
      this.dizziness = Math.min(this.dizziness + 22, 100);
    } else if (hitType === 'kick') {
      this.headAngle = 0.55;
      this.bodyAngle = 0.46;
      this.beardAngle = 1.1;
      this.stumbleX = 125;
      this.stumbleY = -42;
      this.dizziness = Math.min(this.dizziness + 34, 100);

      // Launch slipper flying!
      if (!this.slipper.isFlying) {
        this.slipper.isFlying = true;
        this.slipper.x = 20;
        this.slipper.y = 160;
        this.slipper.vx = 9 + Math.random() * 6;
        this.slipper.vy = -12 - Math.random() * 5;
        this.slipper.rot = 0;
        this.slipper.rotSpeed = 0.4;
      }
    }

    if (this.dizziness >= 100) {
      this.isDizzy = true;
    }
  }

  reset() {
    this.headAngle = 0;
    this.bodyAngle = 0;
    this.beardAngle = 0;
    this.stumbleX = 0;
    this.stumbleY = 0;
    this.dizziness = 0;
    this.isDizzy = false;
    this.redCheek = 0;
    this.hitTimer = 0;
    this.tupi.isFlying = false;
    this.slipper.isFlying = false;
    this.sweatDrops = [];
  }

  update(dt) {
    this.blinkTimer += dt;
    this.dizzyStarAngle += dt * 4.2;

    // Decay slap mark slowly
    if (this.redCheek > 0) {
      this.redCheek -= dt * 12;
      if (this.redCheek < 0) this.redCheek = 0;
    }

    // Update sweat droplets
    for (let i = this.sweatDrops.length - 1; i >= 0; i--) {
      const drop = this.sweatDrops[i];
      drop.x += drop.vx;
      drop.y += drop.vy;
      drop.vy += 0.4; // gravity
      drop.life -= dt;
      drop.alpha = Math.max(drop.life, 0);
      if (drop.life <= 0) {
        this.sweatDrops.splice(i, 1);
      }
    }

    // Update flying Tupi cap
    if (this.tupi.isFlying) {
      this.tupi.x += this.tupi.vx;
      this.tupi.y += this.tupi.vy;
      this.tupi.vy += 0.65; // gravity
      this.tupi.rot += this.tupi.rotSpeed;

      // Ground hit or fall off
      if (this.tupi.y > this.tupi.groundY) {
        this.tupi.y = this.tupi.groundY;
        this.tupi.vx *= 0.5;
        this.tupi.rotSpeed *= 0.3;
      }
    }

    // Update flying slipper
    if (this.slipper.isFlying) {
      this.slipper.x += this.slipper.vx;
      this.slipper.y += this.slipper.vy;
      this.slipper.vy += 0.75;
      this.slipper.rot += this.slipper.rotSpeed;
    }

    // Spring physics back to center
    if (this.hitTimer > 0) {
      this.hitTimer -= dt;
    } else {
      if (this.isDizzy) {
        const wobble = Math.sin(this.blinkTimer * 4.5);
        this.headAngle = wobble * 0.28;
        this.bodyAngle = wobble * 0.14;
        this.beardAngle = wobble * 0.4;
        this.stumbleX += (Math.cos(this.blinkTimer * 3.2) * 18 - this.stumbleX) * dt * 3;
        this.stumbleY += (0 - this.stumbleY) * dt * 5;

        this.dizziness -= dt * 5;
        if (this.dizziness <= 0) {
          this.dizziness = 0;
          this.isDizzy = false;
        }
      } else {
        // Natural return
        this.headAngle += (0 - this.headAngle) * dt * 8;
        this.bodyAngle += (0 - this.bodyAngle) * dt * 8;
        this.beardAngle += (0 - this.beardAngle) * dt * 7;
        this.stumbleX += (0 - this.stumbleX) * dt * 7;
        this.stumbleY += (0 - this.stumbleY) * dt * 9;

        // Idle nervous breathing
        this.stumbleY = Math.sin(this.blinkTimer * 2) * 3;

        if (this.dizziness > 0) {
          this.dizziness -= dt * 2;
        }
      }
    }

    this.x = this.baseX + this.stumbleX;
    this.y = this.baseY + this.stumbleY;
  }

  render(ctx) {
    ctx.save();

    // Floor shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.baseY + 185, 70, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(this.x, this.y);
    ctx.rotate(this.bodyAngle);

    // ==========================================
    // 1. WHITE PAJAMA & SLIPPERS
    // ==========================================
    ctx.fillStyle = '#eaedf1';
    ctx.beginPath();
    ctx.moveTo(-24, 70);
    ctx.lineTo(-34, 165);
    ctx.lineTo(-7, 165);
    ctx.lineTo(-2, 70);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(2, 70);
    ctx.lineTo(7, 165);
    ctx.lineTo(34, 165);
    ctx.lineTo(24, 70);
    ctx.closePath();
    ctx.fill();

    // Traditional leather Nagra slippers
    ctx.fillStyle = '#4e342e';
    // Left slipper
    ctx.beginPath();
    ctx.roundRect(-38, 162, 36, 18, 5);
    ctx.fill();

    // Right slipper (or missing if kicked off!)
    if (!this.slipper.isFlying) {
      ctx.beginPath();
      ctx.roundRect(8, 162, 36, 18, 5);
      ctx.fill();
    } else {
      // Bare foot with white sock
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.roundRect(10, 162, 28, 16, 4);
      ctx.fill();
    }

    // ==========================================
    // 2. WHITE SILK PUNJABI (KURTA)
    // ==========================================
    const panjabiWhite = '#fdfdfd';
    const panjabiFold = '#d8dbe0';

    // Left Arm in Punjabi Sleeve
    ctx.fillStyle = panjabiWhite;
    ctx.beginPath();
    ctx.moveTo(-36, -35);
    ctx.lineTo(-62, 25);
    ctx.lineTo(-44, 30);
    ctx.lineTo(-26, -20);
    ctx.closePath();
    ctx.fill();

    // Left Hand
    ctx.fillStyle = '#e5a772';
    ctx.beginPath();
    ctx.arc(-52, 35, 11, 0, Math.PI * 2);
    ctx.fill();

    // Punjabi Main Body
    const bodyGrad = ctx.createLinearGradient(-45, -45, 45, 95);
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(0.7, '#f4f5f8');
    bodyGrad.addColorStop(1, '#e3e6ed');
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.moveTo(-38, -44);
    ctx.lineTo(-46, 96);
    ctx.quadraticCurveTo(0, 108, 46, 96);
    ctx.lineTo(38, -44);
    ctx.closePath();
    ctx.fill();

    // Punjabi Fabric Fold Creases
    ctx.strokeStyle = panjabiFold;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-40, 25); ctx.lineTo(-44, 92);
    ctx.moveTo(40, 25); ctx.lineTo(44, 92);
    ctx.moveTo(-20, 40); ctx.quadraticCurveTo(0, 50, 20, 40);
    ctx.stroke();

    // Mandarin / Nehru Collar with Gold Thread Embroidery
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#d4af37'; // Golden trim
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-18, -58, 36, 15, 4);
    ctx.fill();
    ctx.stroke();

    // Front Placket / Button Strip
    ctx.fillStyle = '#f4f5f8';
    ctx.fillRect(-7, -43, 14, 62);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.strokeRect(-7, -43, 14, 62);

    // Golden Buttons
    ctx.fillStyle = '#d4af37';
    for (let b = 0; b < 4; b++) {
      ctx.beginPath();
      ctx.arc(0, -35 + (b * 14), 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Right Arm
    ctx.fillStyle = panjabiWhite;
    ctx.beginPath();
    ctx.moveTo(36, -35);
    ctx.lineTo(62, 25);
    ctx.lineTo(44, 30);
    ctx.lineTo(26, -20);
    ctx.closePath();
    ctx.fill();

    // Right Hand
    ctx.fillStyle = '#e5a772';
    ctx.beginPath();
    ctx.arc(52, 35, 11, 0, Math.PI * 2);
    ctx.fill();

    // ==========================================
    // 3. HEAD, EXPRESSIONS & FLYING TUPI
    // ==========================================
    ctx.save();
    ctx.translate(0, -72);
    ctx.rotate(this.headAngle);

    // Head base
    ctx.fillStyle = '#e5a772';
    ctx.beginPath();
    ctx.ellipse(0, 0, 23, 27, 0, 0, Math.PI * 2);
    ctx.fill();

    // Slap Handprint mark on cheek!
    if (this.redCheek > 0) {
      ctx.fillStyle = `rgba(235, 77, 75, ${this.redCheek / 100 * 0.9})`;
      ctx.beginPath();
      ctx.ellipse(-13, 2, 11, 9, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Handprint fingers on cheek
      ctx.strokeStyle = `rgba(180, 40, 30, ${this.redCheek / 100})`;
      ctx.lineWidth = 2.2;
      for (let f = 0; f < 4; f++) {
        ctx.beginPath();
        ctx.moveTo(-17 + (f * 3.2), -6);
        ctx.lineTo(-15 + (f * 3.2), 8);
        ctx.stroke();
      }
    }

    // Traditional Prayer Cap (Tupi) on head if not flying off!
    if (!this.tupi.isFlying) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-22, -26, 44, 16, { tl: 8, tr: 8, bl: 2, br: 2 });
      ctx.fill();
      ctx.stroke();
      // Tupi embroidery pattern
      ctx.fillStyle = '#d4af37';
      for (let t = -16; t <= 16; t += 8) {
        ctx.fillRect(t, -22, 4, 8);
      }
    } else {
      // Short grey hair when cap flies off
      ctx.fillStyle = '#4a4a4a';
      ctx.beginPath();
      ctx.arc(0, -12, 23, Math.PI, 0);
      ctx.fill();
    }

    // Eyes - Highly expressive
    if (this.isDizzy) {
      // Spiral dizzy eyes
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2.5;
      [-8, 8].forEach(eyeX => {
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 4; a += 0.2) {
          const r = a * 1.6;
          const x = eyeX + Math.cos(a + this.dizzyStarAngle) * r;
          const y = -4 + Math.sin(a + this.dizzyStarAngle) * r;
          if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
    } else if (this.hitTimer > 0) {
      // Hit reaction: shocked popping eyes or squeezed shut
      if (this.hitType === 'tight-slap' || this.hitType === 'kick') {
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 3.2;
        // X eyes
        ctx.beginPath();
        ctx.moveTo(-14, -8); ctx.lineTo(-6, -1);
        ctx.moveTo(-6, -8); ctx.lineTo(-14, -1);
        ctx.moveTo(6, -8); ctx.lineTo(14, -1);
        ctx.moveTo(14, -8); ctx.lineTo(6, -1);
        ctx.stroke();
      } else {
        // Shocked wide eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-8, -4, 6.5, 0, Math.PI * 2);
        ctx.arc(8, -4, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(-8, -4, 2.5, 0, Math.PI * 2);
        ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Nervous shifty eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-8, -4, 5.5, 0, Math.PI * 2);
      ctx.arc(8, -4, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      const lookOffset = Math.sin(this.blinkTimer * 3) * 1.5;
      ctx.arc(-8 + lookOffset, -4, 2.8, 0, Math.PI * 2);
      ctx.arc(8 + lookOffset, -4, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eyebrows
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    if (this.hitTimer > 0) {
      // Panicked raised eyebrows
      ctx.arc(-8, -12, 7, Math.PI * 1.1, Math.PI * 1.9);
      ctx.arc(8, -12, 7, Math.PI * 1.1, Math.PI * 1.9);
    } else {
      // Worried slanted brows
      ctx.moveTo(-14, -10); ctx.lineTo(-3, -7);
      ctx.moveTo(3, -7); ctx.lineTo(14, -10);
    }
    ctx.stroke();

    // Nose
    ctx.fillStyle = '#cf874d';
    ctx.beginPath();
    ctx.arc(0, 0, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    if (this.hitTimer > 0) {
      // Screaming O mouth
      ctx.ellipse(0, 11, 7, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      // Comic tooth showing
      ctx.fillStyle = '#fff';
      ctx.fillRect(-3, 6, 6, 4);
    } else {
      // Nervous tight mouth
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2.5;
      ctx.moveTo(-6, 9);
      ctx.quadraticCurveTo(0, 7, 6, 9);
      ctx.stroke();
    }

    // ==========================================
    // 4. THE LONG FLOWING BEARD (DYNAMIC LAYERS)
    // ==========================================
    ctx.save();
    ctx.translate(0, 9);
    ctx.rotate(this.beardAngle);

    // Multi-layered long flowing beard
    const beardGrad = ctx.createLinearGradient(0, 0, 0, 105);
    beardGrad.addColorStop(0, '#2d3436');
    beardGrad.addColorStop(0.6, '#3d4447');
    beardGrad.addColorStop(1, '#535c68');
    ctx.fillStyle = beardGrad;

    ctx.beginPath();
    ctx.moveTo(-18, -3);
    ctx.quadraticCurveTo(-24, 25, -20, 60);
    ctx.quadraticCurveTo(-10, 95, 0, 110);
    ctx.quadraticCurveTo(10, 95, 20, 60);
    ctx.quadraticCurveTo(24, 25, 18, -3);
    ctx.closePath();
    ctx.fill();

    // Moustache
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.moveTo(-16, 1);
    ctx.quadraticCurveTo(0, -4, 16, 1);
    ctx.quadraticCurveTo(0, 12, -16, 1);
    ctx.fill();

    // Silver beard strands
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-9, 15); ctx.quadraticCurveTo(-11, 55, -4, 92);
    ctx.moveTo(0, 18); ctx.quadraticCurveTo(0, 60, 0, 104);
    ctx.moveTo(9, 15); ctx.quadraticCurveTo(11, 55, 4, 92);
    ctx.stroke();

    ctx.restore(); // end beard
    ctx.restore(); // end head

    // ==========================================
    // 5. SWEAT DROPLETS & SPIT PARTICLES
    // ==========================================
    ctx.fillStyle = 'rgba(116, 185, 255, 0.9)';
    this.sweatDrops.forEach(drop => {
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // ==========================================
    // 6. FLYING TUPI CAP IN AIR
    // ==========================================
    if (this.tupi.isFlying) {
      ctx.save();
      ctx.translate(this.tupi.x, this.tupi.y);
      ctx.rotate(this.tupi.rot);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-20, -10, 40, 20, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // ==========================================
    // 7. FLYING SLIPPER (NAGRA) IN AIR
    // ==========================================
    if (this.slipper.isFlying) {
      ctx.save();
      ctx.translate(this.slipper.x, this.slipper.y);
      ctx.rotate(this.slipper.rot);
      ctx.fillStyle = '#4e342e';
      ctx.beginPath();
      ctx.roundRect(-18, -9, 36, 18, 5);
      ctx.fill();
      ctx.restore();
    }

    // ==========================================
    // 8. DIZZY ORBITING STARS & BIRDS
    // ==========================================
    if (this.isDizzy || this.dizziness > 60) {
      const starCount = 4;
      for (let s = 0; s < starCount; s++) {
        const starA = this.dizzyStarAngle + (s * (Math.PI * 2 / starCount));
        const starOrbitX = Math.cos(starA) * 50;
        const starOrbitY = -115 + Math.sin(starA) * 18;

        ctx.fillStyle = '#feca57';
        ctx.beginPath();
        for (let p = 0; p < 5; p++) {
          const a1 = (p * Math.PI * 2 / 5) - Math.PI / 2;
          const a2 = a1 + Math.PI / 5;
          const r1 = 9;
          const r2 = 4;
          const px1 = starOrbitX + Math.cos(a1) * r1;
          const py1 = starOrbitY + Math.sin(a1) * r1;
          const px2 = starOrbitX + Math.cos(a2) * r2;
          const py2 = starOrbitY + Math.sin(a2) * r2;
          if (p === 0) ctx.moveTo(px1, py1); else ctx.lineTo(px1, py1);
          ctx.lineTo(px2, py2);
        }
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
