/**
 * game.js
 * Main Arcade Game Controller
 * Features:
 * - Authentic Bangladeshi Room (বৈঠকখানা) with animated ceiling fan, window grill, banana tree view,
 *   Bangla calendar, fluorescent tube light, red RFL chair, and mosquito coil.
 * - Dynamic Crowd System:
 *   - Aggressive Mob Faction on left shouting "AROH DEN!", "MAAR SHALA RE!", "AAR EKTA DE!" with mobile phone recording.
 *   - Sympathizers Faction on right pleading "THAMEN!", "MOB KOIREN NA!", "AI MEA KI KORTASEN!".
 * - High-Stakes Streak System with timer decay, multiplier bonuses (up to 5x), and fire aura.
 * - Full audio integration, particle physics, combo counter, rage ultimate, and responsiveness.
 */

class SlapGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Logical dimensions
    this.width = 1100;
    this.height = 580;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Characters
    // Muscle bodybuilder on left
    this.player = new MuscleBodybuilder(350, 360);
    // Bearded Guy in White Punjabi on right
    this.target = new BeardPanjabiGuy(680, 360);

    // Game stats
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.rage = 0; // 0 to 100

    // Streak Engine
    this.streak = 0;
    this.maxStreak = 0;
    this.streakTimer = 0;
    this.streakDuration = 3.2; // seconds before streak decays
    this.streakMultiplier = 1.0;

    // Room Environment & Animated Props
    this.fanAngle = 0;
    this.smokeParticles = [];
    this.flashAlpha = 0; // Smartphone camera flashes

    // Crowd & Banter System
    this.crowdMembers = [
      // Left Mob Faction (Attackers / Phone streamers - grounded on floor)
      { id: 1, x: 95, groundY: 485, faction: 'mob', type: 'phone', name: 'Jamil', bob: 0, armAngle: -0.3, jumpY: 0 },
      { id: 2, x: 175, groundY: 500, faction: 'mob', type: 'fist', name: 'Kabir', bob: 1.2, armAngle: 0.2, jumpY: 0 },
      { id: 3, x: 50, groundY: 475, faction: 'mob', type: 'peep', name: 'Salam', bob: 2.1, armAngle: 0, jumpY: 0 },
      { id: 4, x: 245, groundY: 510, faction: 'mob', type: 'lungi', name: 'Rafiq', bob: 0.7, armAngle: 0.1, jumpY: 0 },

      // Right Sympathizers Faction (Defenders / Pleaders - grounded on floor)
      { id: 5, x: 840, groundY: 505, faction: 'symp', type: 'plead', name: 'Mawlana', bob: 0.4, armAngle: 0, jumpY: 0 },
      { id: 6, x: 925, groundY: 490, faction: 'symp', type: 'nervous', name: 'Huzur', bob: 1.8, armAngle: -0.2, jumpY: 0 },
      { id: 7, x: 1010, groundY: 480, faction: 'symp', type: 'worry', name: 'Zakir', bob: 2.6, armAngle: 0.1, jumpY: 0 }
    ];

    this.speechBubbles = [];
    this.idleBanterTimer = 2.0;

    // Screen Shake
    this.shakeIntensity = 0;
    this.shakeDecay = 0.9;

    // VFX collections
    this.particles = [];
    this.floatingTexts = [];
    this.comicEffects = [];

    // Game modes & settings
    this.arenaIndex = 0;
    this.arenas = [
      'BD Baithak (বৈঠকখানা)',
      'Tong Dokan (টংয়ের দোকান)',
      'Puran Dhaka (পুরান ঢাকা)',
      'Sadarghat (সদরঘাট লঞ্চ)'
    ];
    this.slowMo = false;
    this.isTimedMode = false;
    this.timeLeft = 30;
    this.timerInterval = null;

    // Ultimate sequence state
    this.isUltimateActive = false;
    this.ultimateHitsLeft = 0;
    this.ultimateTimer = 0;

    // UI Elements
    this.dom = {
      score: document.getElementById('score-display'),
      comboCard: document.getElementById('combo-card'),
      comboCount: document.getElementById('combo-count'),
      streakCard: document.getElementById('streak-card'),
      streakCount: document.getElementById('streak-count'),
      streakMult: document.getElementById('streak-mult'),
      streakFill: document.getElementById('streak-bar-fill'),
      dizzyFill: document.getElementById('dizzy-bar-fill'),
      dizzyPercent: document.getElementById('dizzy-percent'),
      rageFill: document.getElementById('rage-bar-fill'),
      ragePercent: document.getElementById('rage-percent'),
      comicBanner: document.getElementById('comic-banner'),
      btnSlap: document.getElementById('btn-slap'),
      btnTightSlap: document.getElementById('btn-tight-slap'),
      btnPunch: document.getElementById('btn-punch'),
      btnKick: document.getElementById('btn-kick'),
      btnUltimate: document.getElementById('btn-ultimate'),
      btnSound: document.getElementById('btn-sound'),
      btnTimerMode: document.getElementById('btn-timer-mode'),
      btnBg: document.getElementById('btn-bg'),
      btnSlowMo: document.getElementById('btn-slowmo'),
      btnFullscreen: document.getElementById('btn-fullscreen'),
      btnReset: document.getElementById('btn-reset'),
      timerDisplay: document.getElementById('timer-display'),
      timeLeftText: document.getElementById('time-left'),
      modeIndicator: document.getElementById('mode-indicator'),
      ultDesc: document.getElementById('ult-desc')
    };

    this.lastTime = performance.now();

    this.initEventListeners();
    this.gameLoop = this.gameLoop.bind(this);
    requestAnimationFrame(this.gameLoop);
  }

  initEventListeners() {
    // Unlock Audio Context on first touch or click for mobile Safari/Chrome
    const unlockAudio = () => {
      soundEngine.ensureContextRunning();
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('click', unlockAudio, { passive: true });

    // Touch & Click Helper for Action Buttons (Instant 0ms Mobile Tap)
    const bindTouchAction = (btn, action) => {
      if (!btn) return;
      const handler = (e) => {
        if (e.cancelable && e.type === 'touchstart') e.preventDefault();
        this.highlightButton(btn);
        this.executeAction(action);
      };
      btn.addEventListener('touchstart', handler, { passive: false });
      btn.addEventListener('click', handler);
    };

    bindTouchAction(this.dom.btnSlap, 'slap');
    bindTouchAction(this.dom.btnTightSlap, 'tight-slap');
    bindTouchAction(this.dom.btnPunch, 'punch');
    bindTouchAction(this.dom.btnKick, 'kick');
    bindTouchAction(this.dom.btnUltimate, 'ultimate');

    // Options
    this.dom.btnSound.addEventListener('click', () => {
      const isMuted = soundEngine.toggleMute();
      this.dom.btnSound.innerHTML = isMuted ? '🔇 <span class="btn-text">Sound: OFF</span>' : '🔊 <span class="btn-text">Sound: ON</span>';
    });

    this.dom.btnBg.addEventListener('click', () => {
      this.arenaIndex = (this.arenaIndex + 1) % this.arenas.length;
      const arenaName = this.arenas[this.arenaIndex].split(' ')[0];
      this.dom.btnBg.innerHTML = `🎨 <span class="btn-text">Arena: ${arenaName}</span>`;
    });

    this.dom.btnSlowMo.addEventListener('click', () => {
      this.slowMo = !this.slowMo;
      this.dom.btnSlowMo.innerHTML = this.slowMo ? '🐌 <span class="btn-text">Slow-Mo: ON</span>' : '🐌 <span class="btn-text">Slow-Mo: OFF</span>';
      this.dom.btnSlowMo.style.borderColor = this.slowMo ? '#2ed573' : 'rgba(255,255,255,0.2)';
    });

    // Fullscreen Toggle (Mobile & Desktop)
    if (this.dom.btnFullscreen) {
      this.dom.btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          const container = document.getElementById('game-container') || document.documentElement;
          if (container.requestFullscreen) {
            container.requestFullscreen().catch(() => {});
          } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
          }
          this.dom.btnFullscreen.innerHTML = '⛶ <span class="btn-text">Exit</span>';
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
          this.dom.btnFullscreen.innerHTML = '⛶ <span class="btn-text">Full</span>';
        }
      });

      document.addEventListener('fullscreenchange', () => {
        if (this.dom.btnFullscreen) {
          this.dom.btnFullscreen.innerHTML = document.fullscreenElement
            ? '⛶ <span class="btn-text">Exit</span>'
            : '⛶ <span class="btn-text">Full</span>';
        }
      });
    }

    this.dom.btnReset.addEventListener('click', () => this.resetGame());
    this.dom.btnTimerMode.addEventListener('click', () => this.toggleTimedMode());

    // Direct Canvas Touch & Click (Mobile Tap on Character or Crowd)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleCanvasPointerHit = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clickX = (clientX - rect.left) * scaleX;
      const clickY = (clientY - rect.top) * scaleY;

      if (clickX < 330) {
        // Tapped Left Mob Crowd
        const shouts = ['AROH DEN!', 'MAAR SHALA RE!', 'AAR EKTA DE!', 'LIVE CHHOLTESAY!'];
        const chosen = shouts[Math.floor(Math.random() * shouts.length)];
        this.triggerCrowdBubble('mob', chosen);
        soundEngine.playCrowdBanter(true);
      } else if (clickX > 780) {
        // Tapped Right Sympathizer Crowd
        const pleas = ['THAMEN!', 'MOB KOIREN NA!', 'AI MEA KI KORTASEN!', 'AIN HATE TULEN NA!'];
        const chosen = pleas[Math.floor(Math.random() * pleas.length)];
        this.triggerCrowdBubble('symp', chosen);
        soundEngine.playCrowdBanter(false);
      } else {
        // Tapped Fighting Area / Target Character!
        // Direct Tap Attack on screen!
        if (clickX >= 520) {
          // Tap on target character: alternating slap & tight-slap
          const move = Math.random() > 0.4 ? 'slap' : 'tight-slap';
          this.executeAction(move);
        } else {
          // Tap on player side: quick punch
          this.executeAction('punch');
        }
      }
    };

    this.canvas.addEventListener('click', (e) => {
      handleCanvasPointerHit(e.clientX, e.clientY);
    });

    // Touch Swipe Gestures on Mobile Canvas
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = performance.now();
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        const elapsed = performance.now() - touchStartTime;

        // Check if it's a fast swipe (gesture)
        if (elapsed < 350 && Math.abs(diffX) > 40) {
          // Horizontal Swipe -> Tight Slap!
          this.executeAction('tight-slap');
        } else if (elapsed < 350 && diffY > 40) {
          // Swipe Downward -> Punch!
          this.executeAction('punch');
        } else if (elapsed < 350 && diffY < -40) {
          // Swipe Upward -> High Roundhouse Kick!
          this.executeAction('kick');
        } else if (elapsed < 250 && Math.abs(diffX) < 15 && Math.abs(diffY) < 15) {
          // Clean quick tap on canvas
          handleCanvasPointerHit(touchEndX, touchEndY);
        }
      }
    }, { passive: true });

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      if (key === '1' || key === 'q') {
        this.highlightButton(this.dom.btnSlap);
        this.executeAction('slap');
      } else if (key === '2' || key === 'w') {
        this.highlightButton(this.dom.btnTightSlap);
        this.executeAction('tight-slap');
      } else if (key === '3' || key === 'e') {
        this.highlightButton(this.dom.btnPunch);
        this.executeAction('punch');
      } else if (key === '4' || key === 'r') {
        this.highlightButton(this.dom.btnKick);
        this.executeAction('kick');
      } else if (key === ' ' || key === 'spacebar') {
        e.preventDefault();
        if (this.rage >= 100 && !this.isUltimateActive) {
          this.highlightButton(this.dom.btnUltimate);
          this.executeAction('ultimate');
        }
      } else if (key === 'm') {
        this.dom.btnSound.click();
      } else if (key === 'escape') {
        this.resetGame();
      }
    });
  }

  highlightButton(btn) {
    if (!btn || btn.disabled) return;
    btn.classList.add('btn-pressed');
    setTimeout(() => btn.classList.remove('btn-pressed'), 120);
  }

  toggleTimedMode() {
    this.isTimedMode = !this.isTimedMode;
    if (this.isTimedMode) {
      this.timeLeft = 30;
      this.dom.timerDisplay.classList.remove('hidden');
      this.dom.btnTimerMode.innerText = '⏱️ Stop Challenge';
      this.dom.modeIndicator.innerText = '30S CHALLENGE';
      this.dom.modeIndicator.style.color = '#ff4757';
      this.resetGame();

      clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        this.timeLeft--;
        this.dom.timeLeftText.innerText = this.timeLeft;
        if (this.timeLeft <= 0) {
          clearInterval(this.timerInterval);
          this.endTimedMode();
        }
      }, 1000);
    } else {
      clearInterval(this.timerInterval);
      this.dom.timerDisplay.classList.add('hidden');
      this.dom.btnTimerMode.innerText = '⏱️ 30s Challenge';
      this.dom.modeIndicator.innerText = 'FREE PLAY';
      this.dom.modeIndicator.style.color = '#2ed573';
    }
  }

  endTimedMode() {
    this.isTimedMode = false;
    this.dom.btnTimerMode.innerText = '⏱️ 30s Challenge';
    this.dom.modeIndicator.innerText = 'GAME OVER';
    this.showComicBanner(`FINAL SCORE: ${this.score} (MAX STREAK: ${this.maxStreak})!`, 3000);
  }

  // ==========================================
  // ACTION EXECUTION & COMBAT LOGIC
  // ==========================================
  executeAction(actionType) {
    if (this.isUltimateActive && actionType !== 'ultimate') return;

    if (actionType === 'ultimate') {
      if (this.rage < 100 || this.isUltimateActive) return;
      this.startUltimateSequence();
      return;
    }

    // Trigger player strike animation
    const durations = {
      'slap': 16,
      'tight-slap': 26,
      'punch': 20,
      'kick': 28
    };

    this.player.triggerAction(actionType, durations[actionType] || 20);

    // Audio & Haptic Vibration effects
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        if (actionType === 'tight-slap') navigator.vibrate([20, 35, 20]);
        else if (actionType === 'kick') navigator.vibrate(40);
        else navigator.vibrate(22);
      } catch (err) {}
    }

    if (actionType === 'slap') {
      soundEngine.playSlap();
      this.shakeScreen(4);
      this.spawnImpactParticles(this.target.x - 20, this.target.y - 45, '#ff4757', 14);
      this.spawnComicText('SLAP!', this.target.x, this.target.y - 75, '#ff6b81');
    } else if (actionType === 'tight-slap') {
      soundEngine.playTightSlap();
      this.shakeScreen(15);
      this.flashAlpha = 0.5; // Flash effect
      this.spawnImpactParticles(this.target.x - 25, this.target.y - 50, '#feca57', 28);
      this.spawnComicText('THUNDER SLAP!', this.target.x, this.target.y - 90, '#feca57');
    } else if (actionType === 'punch') {
      soundEngine.playPunch();
      this.shakeScreen(9);
      this.spawnImpactParticles(this.target.x - 15, this.target.y + 10, '#ff9f43', 20);
      this.spawnComicText('POW!', this.target.x, this.target.y - 20, '#ff9f43');
    } else if (actionType === 'kick') {
      soundEngine.playKick();
      this.shakeScreen(14);
      this.spawnImpactParticles(this.target.x - 20, this.target.y + 40, '#00d2d3', 24);
      this.spawnComicText('KAPOW!', this.target.x, this.target.y - 80, '#00d2d3');
    }

    // Target recoil physics
    this.target.takeHit(actionType);

    // Points table
    const pointsMap = { 'slap': 10, 'tight-slap': 35, 'punch': 25, 'kick': 50 };
    this.registerHit(pointsMap[actionType] || 10);

    // Crowd dynamic reactions
    this.triggerCrowdHitReaction(actionType);
  }

  startUltimateSequence() {
    this.isUltimateActive = true;
    this.rage = 0;
    this.ultimateHitsLeft = 10;
    this.ultimateTimer = 0;
    this.player.triggerAction('ultimate', 120);
    this.showComicBanner('⚡ RAPID SLAP BARRAGE! ⚡', 1500);
    soundEngine.playUltimateRoar();
    this.updateHUD();
  }

  updateUltimate(dt) {
    if (!this.isUltimateActive) return;

    this.ultimateTimer += dt;
    if (this.ultimateTimer > 0.08 && this.ultimateHitsLeft > 0) {
      this.ultimateTimer = 0;
      this.ultimateHitsLeft--;

      soundEngine.playSlap();
      this.shakeScreen(7);
      this.target.takeHit('slap');
      this.spawnImpactParticles(
        this.target.x - 20 + (Math.random() * 40 - 20),
        this.target.y - 50 + (Math.random() * 40 - 20),
        Math.random() > 0.5 ? '#feca57' : '#ff4757',
        8
      );
      this.registerHit(35);
      this.triggerCrowdBubble('mob', Math.random() > 0.5 ? 'AROH DEN!' : 'MAAR SHALA RE!');

      if (this.ultimateHitsLeft === 0) {
        soundEngine.playTightSlap();
        this.shakeScreen(20);
        this.target.takeHit('tight-slap');
        this.spawnComicText('FINISHER!', this.target.x, this.target.y - 100, '#ff4757');
        this.registerHit(150);
        this.triggerCrowdBubble('symp', 'MOB KOIREN NA!');
        setTimeout(() => {
          this.isUltimateActive = false;
          this.player.resetToIdle();
        }, 400);
      }
    }
  }

  // ==========================================
  // STREAK & COMBO MANAGEMENT
  // ==========================================
  registerHit(pts) {
    // 1. Combo
    this.combo++;
    this.comboTimer = 2.5;

    // 2. Streak
    this.streak++;
    if (this.streak > this.maxStreak) this.maxStreak = this.streak;
    this.streakTimer = this.streakDuration;

    // Multiplier calculation based on streak
    if (this.streak >= 35) {
      this.streakMultiplier = 5.0;
    } else if (this.streak >= 20) {
      this.streakMultiplier = 3.0;
    } else if (this.streak >= 10) {
      this.streakMultiplier = 2.0;
    } else if (this.streak >= 5) {
      this.streakMultiplier = 1.5;
    } else {
      this.streakMultiplier = 1.0;
    }

    // Milestones
    if (this.streak === 5) {
      soundEngine.playStreakUp(1);
      this.spawnComicText('🔥 5X STREAK! ON FIRE!', this.player.x, this.player.y - 120, '#ff9f43');
      this.showComicBanner('🔥 5X STREAK: ON FIRE! (1.5x MULTI)', 800);
    } else if (this.streak === 10) {
      soundEngine.playStreakUp(2);
      this.spawnComicText('⚡ 10X RAGE STREAK!', this.player.x, this.player.y - 120, '#feca57');
      this.showComicBanner('⚡ 10X RAGE STREAK! (2.0x MULTI)', 900);
    } else if (this.streak === 20) {
      soundEngine.playStreakUp(3);
      this.spawnComicText('🌪️ 20X THAPRANO MONSTER!', this.player.x, this.player.y - 120, '#00d2d3');
      this.showComicBanner('🌪️ 20X MONSTER STREAK! (3.0x MULTI)', 1000);
    } else if (this.streak === 35) {
      soundEngine.playStreakUp(4);
      this.spawnComicText('👑 GODLIKE SLAPPER!', this.player.x, this.player.y - 120, '#ff4757');
      this.showComicBanner('👑 GODLIKE SLAPPER! (5.0x MULTI)', 1200);
    }

    this.player.streak = this.streak;

    // Calculate Final Points
    const comboBonus = 1 + Math.min(Math.floor(this.combo / 4) * 0.4, 2.0);
    const totalPts = Math.round(pts * comboBonus * this.streakMultiplier);
    this.score += totalPts;

    // Fill rage
    if (this.rage < 100) {
      this.rage = Math.min(this.rage + 8 + Math.floor(pts / 5), 100);
      if (this.rage === 100) {
        this.dom.btnUltimate.disabled = false;
        this.dom.ultDesc.innerText = 'READY! Press SPACE';
        soundEngine.playComboSound(5);
      }
    }

    this.spawnFloatingScore(`+${totalPts}`, this.target.x + 35, this.target.y - 40, this.streakMultiplier > 1);
    this.updateHUD();
  }

  shakeScreen(intensity) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  spawnImpactParticles(x, y, color, count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 10;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        radius: 3 + Math.random() * 5,
        color: color,
        alpha: 1,
        life: 0.4 + Math.random() * 0.3
      });
    }
  }

  spawnComicText(text, x, y, color = '#feca57') {
    this.comicEffects.push({
      text: text,
      x: x + (Math.random() * 30 - 15),
      y: y + (Math.random() * 20 - 10),
      scale: 0.5,
      maxScale: 1.3,
      alpha: 1,
      color: color,
      life: 0.55
    });
  }

  spawnFloatingScore(text, x, y, isCrit) {
    this.floatingTexts.push({
      text: text,
      x: x,
      y: y,
      vy: -2.6,
      alpha: 1,
      isCrit: isCrit,
      life: 0.72
    });
  }

  showComicBanner(text, duration = 800) {
    this.dom.comicBanner.innerText = text;
    this.dom.comicBanner.classList.add('show');
    clearTimeout(this.bannerTimeout);
    this.bannerTimeout = setTimeout(() => {
      this.dom.comicBanner.classList.remove('show');
    }, duration);
  }

  // ==========================================
  // CROWD DIALOGUE & REACTION ENGINE
  // ==========================================
  triggerCrowdHitReaction(actionType) {
    // Mob cheers enthusiastically
    const mobQuotes = ['AROH DEN!', 'MAAR SHALA RE!', 'AAR EKTA DE!', 'CHHARBI NA!', 'LIVE CHHALAISI!'];
    const chosenMob = mobQuotes[Math.floor(Math.random() * mobQuotes.length)];
    this.triggerCrowdBubble('mob', chosenMob);

    // Sympathizers plead frantically
    const sympQuotes = ['THAMEN!', 'MOB KOIREN NA!', 'AI MEA KI KORTASEN!', 'AIN HATE TULEN NA!'];
    const chosenSymp = sympQuotes[Math.floor(Math.random() * sympQuotes.length)];
    this.triggerCrowdBubble('symp', chosenSymp);

    // Characters jump / react
    this.crowdMembers.forEach(m => {
      if (m.faction === 'mob') {
        m.jumpY = -12 - Math.random() * 8; // jump with joy
      } else {
        m.jumpY = 6 + Math.random() * 6; // cringe down
      }
    });

    // Sound effect
    if (Math.random() > 0.4) {
      soundEngine.playCrowdBanter(true);
    }
  }

  triggerCrowdBubble(faction, text) {
    // Pick a crowd member of that faction
    const candidates = this.crowdMembers.filter(m => m.faction === faction);
    if (candidates.length === 0) return;
    const speaker = candidates[Math.floor(Math.random() * candidates.length)];

    this.speechBubbles.push({
      speakerX: speaker.x,
      speakerY: speaker.groundY,
      x: speaker.x,
      y: speaker.groundY - 145,
      text: text,
      faction: faction,
      scale: 0.2,
      alpha: 1,
      life: 1.4
    });
  }

  updateHUD() {
    this.dom.score.innerText = this.score.toLocaleString();
    this.dom.comboCount.innerText = this.combo;

    // Streak HUD
    this.dom.streakCount.innerText = this.streak;
    this.dom.streakMult.innerText = `${this.streakMultiplier.toFixed(1)}x MULTI`;
    const streakFillPct = this.streak > 0 ? (this.streakTimer / this.streakDuration) * 100 : 0;
    this.dom.streakFill.style.width = `${streakFillPct}%`;

    if (this.streak >= 5) {
      this.dom.streakCard.classList.add('active');
    } else {
      this.dom.streakCard.classList.remove('active');
    }

    // Combo card pulse
    if (this.combo > 1) {
      this.dom.comboCard.classList.add('pulse');
      setTimeout(() => this.dom.comboCard.classList.remove('pulse'), 120);
    }

    // Dizziness Bar
    const dizzyVal = Math.round(this.target.dizziness);
    this.dom.dizzyPercent.innerText = `${dizzyVal}%`;
    this.dom.dizzyFill.style.width = `${dizzyVal}%`;

    // Rage Bar
    const rageVal = Math.round(this.rage);
    this.dom.ragePercent.innerText = `${rageVal}%`;
    this.dom.rageFill.style.width = `${rageVal}%`;
    if (this.rage < 100) {
      this.dom.btnUltimate.disabled = true;
      this.dom.ultDesc.innerText = 'Fill Rage To Unlock';
    }
  }

  resetGame() {
    this.score = 0;
    this.combo = 0;
    this.streak = 0;
    this.streakMultiplier = 1.0;
    this.streakTimer = 0;
    this.rage = 0;
    this.particles = [];
    this.floatingTexts = [];
    this.comicEffects = [];
    this.speechBubbles = [];
    this.player.resetToIdle();
    this.player.streak = 0;
    this.target.reset();
    this.isUltimateActive = false;
    this.dom.btnUltimate.disabled = true;
    this.dom.ultDesc.innerText = 'Fill Rage To Unlock';
    this.updateHUD();
    this.showComicBanner('READY... FIGHT!', 800);
  }

  // ==========================================
  // ARENA 0: BANGLADESHI ROOM (বৈঠকখানা) & OTHERS
  // ==========================================
  drawArena(dt) {
    const ctx = this.ctx;
    const mode = this.arenaIndex;

    if (mode === 0) {
      // ==========================================
      // BANGLADESHI ROOM (BAITHAK KHANA)
      // ==========================================

      // 1. Upper Wall: Pistachio Mint Distemper Wall
      const wallGrad = ctx.createLinearGradient(0, 0, 0, 390);
      wallGrad.addColorStop(0, '#78a287');
      wallGrad.addColorStop(0.65, '#99c4aa');
      wallGrad.addColorStop(1, '#aed8be');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, this.width, 390);

      // Wall Dado Line (Plaster separation band)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 384, this.width, 6);
      ctx.fillStyle = '#4a755b';
      ctx.fillRect(0, 390, this.width, 10);

      // 2. Ceiling with wooden beams
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(0, 0, this.width, 32);
      ctx.fillStyle = '#1e272e';
      for (let b = 0; b < this.width; b += 140) {
        ctx.fillRect(b, 0, 18, 32);
      }

      // 3. Large Window with Wrought-Iron Grills (জানালা ও লোহার গ্রিল)
      const winX = 420;
      const winY = 60;
      const winW = 260;
      const winH = 200;

      // Outdoor scenery visible through window
      ctx.save();
      ctx.beginPath();
      ctx.rect(winX, winY, winW, winH);
      ctx.clip();

      // Outdoor sky & sun
      const skyGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH);
      skyGrad.addColorStop(0, '#74b9ff');
      skyGrad.addColorStop(1, '#dfe6e9');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(winX, winY, winW, winH);

      // Coconut palm tree fronds (নারকেল গাছ)
      ctx.strokeStyle = '#27ae60';
      ctx.lineWidth = 4;
      for (let i = 0; i < 6; i++) {
        const frondAngle = -0.6 + i * 0.25;
        ctx.beginPath();
        ctx.moveTo(winX + winW - 20, winY + 10);
        ctx.quadraticCurveTo(winX + winW - 90, winY + 40, winX + winW - 140, winY + 20 + i * 15);
        ctx.stroke();
      }

      // Lush green banana leaf (কলা গাছের পাতা)
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.ellipse(winX + 60, winY + 140, 50, 22, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Tin Roof house in distance (টিনের চাল)
      ctx.fillStyle = '#b2bec3';
      ctx.beginPath();
      ctx.moveTo(winX + 40, winY + 130);
      ctx.lineTo(winX + 180, winY + 110);
      ctx.lineTo(winX + 220, winY + 150);
      ctx.lineTo(winX + 20, winY + 160);
      ctx.closePath();
      ctx.fill();

      // Tiny cartoon pigeon on tin roof
      ctx.fillStyle = '#636e72';
      ctx.beginPath();
      ctx.arc(winX + 110, winY + 118, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Window Wooden Frame
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 10;
      ctx.strokeRect(winX, winY, winW, winH);

      // Authentic Bangladeshi Diamond / Lattice Iron Grills (গ্রিল)
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = 3;
      // Vertical grill bars
      for (let gx = winX + 20; gx < winX + winW; gx += 28) {
        ctx.beginPath();
        ctx.moveTo(gx, winY); ctx.lineTo(gx, winY + winH);
        ctx.stroke();
      }
      // Horizontal grill bars
      for (let gy = winY + 25; gy < winY + winH; gy += 35) {
        ctx.beginPath();
        ctx.moveTo(winX, gy); ctx.lineTo(winX + winW, gy);
        ctx.stroke();
      }

      // Window Curtain tied to the right side (পর্দা)
      ctx.fillStyle = '#e17055';
      ctx.beginPath();
      ctx.moveTo(winX + winW - 10, winY);
      ctx.lineTo(winX + winW - 45, winY);
      ctx.quadraticCurveTo(winX + winW - 20, winY + 90, winX + winW - 55, winY + winH);
      ctx.lineTo(winX + winW - 10, winY + winH);
      ctx.closePath();
      ctx.fill();
      // Curtain tie ribbon
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(winX + winW - 35, winY + 95, 25, 8);

      // 4. Bangla Wall Calendar (বাংলা ক্যালেন্ডার) on Left Wall
      const calX = 260;
      const calY = 65;
      // Red top binding bar
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(calX, calY, 70, 10);
      // Calendar paper body
      ctx.fillStyle = '#fffdfa';
      ctx.fillRect(calX, calY + 10, 70, 85);
      ctx.strokeStyle = '#bdc3c7';
      ctx.lineWidth = 1;
      ctx.strokeRect(calX, calY + 10, 70, 85);

      // Calendar Scenic Village Picture
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(calX + 5, calY + 15, 60, 32);
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.arc(calX + 35, calY + 30, 8, 0, Math.PI * 2);
      ctx.fill();

      // Calendar Bangla Header Text
      ctx.font = 'bold 8px Outfit, sans-serif';
      ctx.fillStyle = '#c0392b';
      ctx.textAlign = 'center';
      ctx.fillText('১৪৩১ বঙ্গাব্দ', calX + 35, calY + 56);
      // Date grid miniature lines
      ctx.fillStyle = '#7f8c8d';
      for (let r = 0; r < 4; r++) {
        ctx.fillRect(calX + 8, calY + 62 + r * 6, 54, 2);
      }

      // Hanging cord and nail
      ctx.strokeStyle = '#7f8c8d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(calX + 35, calY);
      ctx.lineTo(calX + 35, calY - 14);
      ctx.stroke();
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.arc(calX + 35, calY - 14, 3, 0, Math.PI * 2);
      ctx.fill();

      // 5. Fluorescent Wall Tube Light with Soft Ambient Glow
      const tubeX = 740;
      const tubeY = 48;
      // Fixture
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(tubeX, tubeY, 180, 8);
      // Glowing tube
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(tubeX + 8, tubeY + 2, 164, 4);
      // Soft cyan glare
      const tubeGrad = ctx.createRadialGradient(tubeX + 90, tubeY + 12, 10, tubeX + 90, tubeY + 12, 90);
      tubeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      tubeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = tubeGrad;
      ctx.fillRect(tubeX - 20, tubeY - 20, 220, 80);

      // 6. Bakelite Switchboard with Indicator Light & Wires
      const sbX = tubeX + 195;
      const sbY = tubeY + 30;
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(sbX, sbY, 32, 45);
      ctx.strokeStyle = '#2d1d17';
      ctx.lineWidth = 2;
      ctx.strokeRect(sbX, sbY, 32, 45);

      // Red LED indicator light
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(sbX + 8, sbY + 10, 3, 0, Math.PI * 2);
      ctx.fill();
      // White toggle switches
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(sbX + 16, sbY + 8, 8, 5);
      ctx.fillRect(sbX + 16, sbY + 18, 8, 5);
      ctx.fillRect(sbX + 16, sbY + 28, 8, 5);

      // Hanging black electrical wire to tube
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sbX, sbY + 8);
      ctx.quadraticCurveTo(sbX - 10, tubeY + 20, tubeX + 175, tubeY + 8);
      ctx.stroke();

      // 7. Slow Spinning Ceiling Fan (সিলিং ফ্যান)
      const fanX = 550;
      const fanY = 18;
      this.fanAngle += (dt || 0.016) * 7.5;

      // Downrod from ceiling
      ctx.strokeStyle = '#1e272e';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(fanX, 0); ctx.lineTo(fanX, fanY);
      ctx.stroke();

      // Motor Hub
      ctx.fillStyle = '#2f3542';
      ctx.beginPath();
      ctx.arc(fanX, fanY, 14, 0, Math.PI * 2);
      ctx.fill();

      // 3 Fan Blades spinning
      for (let b = 0; b < 3; b++) {
        const bladeA = this.fanAngle + (b * Math.PI * 2 / 3);
        const bx = fanX + Math.cos(bladeA) * 95;
        const by = fanY + Math.sin(bladeA) * 22; // perspective foreshortening
        ctx.strokeStyle = 'rgba(47, 53, 66, 0.85)';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(fanX, fanY);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      // 8. Polished Red-Oxide Floor (লাল পাকা মেঝে)
      const floorY = 400;
      const floorGrad = ctx.createLinearGradient(0, floorY, 0, this.height);
      floorGrad.addColorStop(0, '#852b2b');
      floorGrad.addColorStop(0.5, '#6a1d1d');
      floorGrad.addColorStop(1, '#4e1414');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, floorY, this.width, this.height - floorY);

      // Skirting border along floor
      ctx.fillStyle = '#4a1212';
      ctx.fillRect(0, floorY, this.width, 10);

      // Floor tiles subtle perspective lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 2;
      for (let tx = -150; tx < this.width + 300; tx += 130) {
        ctx.beginPath();
        ctx.moveTo(tx, floorY);
        ctx.lineTo(tx + (tx - 550) * 0.85, this.height);
        ctx.stroke();
      }

      // 9. Traditional Props in Background Corner
      // Red Plastic Chair (RFL Style) on far left
      const chairX = 40;
      const chairY = 320;
      ctx.fillStyle = '#e74c3c';
      // Backrest slats
      ctx.fillRect(chairX, chairY, 34, 46);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(chairX + 4, chairY + 6, 26, 34);
      // White towel/gamcha draped over chair
      ctx.fillStyle = '#f1f2f6';
      ctx.fillRect(chairX + 6, chairY + 2, 22, 14);
      // Chair legs
      ctx.fillStyle = '#962d22';
      ctx.fillRect(chairX + 2, chairY + 46, 5, 34);
      ctx.fillRect(chairX + 27, chairY + 46, 5, 34);

      // Mosquito Coil (কয়েল) on floor with curling smoke
      const coilX = 320;
      const coilY = 420;
      // Metal stand & green coil spiral
      ctx.strokeStyle = '#27ae60';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(coilX, coilY, 8, 0, Math.PI * 2);
      ctx.stroke();
      // Glowing red burning tip
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.arc(coilX + 7, coilY - 2, 2, 0, Math.PI * 2);
      ctx.fill();

      // Smoke particles rising
      if (Math.random() > 0.6) {
        this.smokeParticles.push({
          x: coilX + 7,
          y: coilY - 4,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.8 - Math.random() * 0.6,
          alpha: 0.6,
          radius: 2 + Math.random() * 3
        });
      }

      // Update & render smoke
      for (let s = this.smokeParticles.length - 1; s >= 0; s--) {
        const sm = this.smokeParticles[s];
        sm.x += sm.vx;
        sm.y += sm.vy;
        sm.alpha -= 0.015;
        sm.radius += 0.08;
        if (sm.alpha <= 0) {
          this.smokeParticles.splice(s, 1);
        } else {
          ctx.fillStyle = `rgba(220, 221, 225, ${sm.alpha})`;
          ctx.beginPath();
          ctx.arc(sm.x, sm.y, sm.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (mode === 1) {
      // ==========================================
      // 2. TONG ER DOKAN (চায়ের টং দোকান ও রিকশা)
      // ==========================================
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 390);
      skyGrad.addColorStop(0, '#0c1220');
      skyGrad.addColorStop(0.7, '#1b2a4a');
      skyGrad.addColorStop(1, '#2c3e6b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, 390);

      // Distant city street silhouettes and streetlights
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(40, 180, 120, 210);
      ctx.fillRect(180, 140, 100, 250);
      ctx.fillRect(820, 160, 140, 230);
      ctx.fillRect(980, 120, 110, 270);

      // Yellow glowing street lamps
      ctx.fillStyle = 'rgba(254, 202, 87, 0.6)';
      ctx.beginPath();
      ctx.arc(150, 190, 8, 0, Math.PI * 2);
      ctx.arc(880, 200, 8, 0, Math.PI * 2);
      ctx.fill();

      // Tangled Overhead Electric Wire Jungle (তারের জটলা)
      ctx.strokeStyle = '#05070a';
      ctx.lineWidth = 2;
      for (let w = 0; w < 5; w++) {
        ctx.beginPath();
        ctx.moveTo(0, 50 + w * 22);
        ctx.quadraticCurveTo(550, 95 + w * 28, this.width, 40 + w * 20);
        ctx.stroke();
      }

      // Colorful Traditional Bangladeshi Rickshaw in Background (রিকশা)
      const rX = 730;
      const rY = 240;
      // Rickshaw Hood (folded, vibrant yellow, green & red)
      ctx.fillStyle = '#eb4d4b';
      ctx.beginPath();
      ctx.arc(rX + 45, rY + 40, 35, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#f9ca24';
      ctx.fillRect(rX + 15, rY + 40, 60, 8);
      // Seat & Art board (রিকশা আর্ট)
      ctx.fillStyle = '#6ab04c';
      ctx.fillRect(rX + 20, rY + 48, 50, 35);
      ctx.fillStyle = '#f0932b';
      ctx.beginPath();
      ctx.ellipse(rX + 45, rY + 65, 14, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      // Rickshaw Frame & Giant Spoke Wheel
      ctx.strokeStyle = '#222f3e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(rX + 25, rY + 115, 28, 0, Math.PI * 2);
      ctx.stroke();
      for (let sp = 0; sp < 6; sp++) {
        const a = sp * Math.PI / 3;
        ctx.beginPath();
        ctx.moveTo(rX + 25, rY + 115);
        ctx.lineTo(rX + 25 + Math.cos(a) * 28, rY + 115 + Math.sin(a) * 28);
        ctx.stroke();
      }

      // Bamboo poles supporting tea stall
      ctx.fillStyle = '#b7791f';
      ctx.fillRect(290, 80, 14, 310);
      ctx.fillRect(810, 80, 14, 310);

      // Tong's Corrugated Tin Canopy Roof (টিনের চালা)
      ctx.fillStyle = '#718093';
      ctx.beginPath();
      ctx.moveTo(180, 75);
      ctx.lineTo(920, 65);
      ctx.lineTo(950, 95);
      ctx.lineTo(150, 105);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#2f3542';
      ctx.lineWidth = 3;
      for (let cr = 170; cr < 920; cr += 22) {
        ctx.beginPath();
        ctx.moveTo(cr, 75);
        ctx.lineTo(cr - 25, 105);
        ctx.stroke();
      }

      // Incandescent Yellow Tungsten Bulb hanging under tin roof
      const bulbX = 550;
      const bulbY = 125;
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bulbX, 75); ctx.lineTo(bulbX, bulbY); ctx.stroke();
      const bulbGrad = ctx.createRadialGradient(bulbX, bulbY, 5, bulbX, bulbY, 140);
      bulbGrad.addColorStop(0, 'rgba(254, 202, 87, 0.85)');
      bulbGrad.addColorStop(0.35, 'rgba(254, 202, 87, 0.25)');
      bulbGrad.addColorStop(1, 'rgba(254, 202, 87, 0)');
      ctx.fillStyle = bulbGrad;
      ctx.beginPath();
      ctx.arc(bulbX, bulbY, 140, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(bulbX, bulbY, 9, 0, Math.PI * 2);
      ctx.fill();

      // Hanging bunch of bananas (সবরি কলা কাঁদি)
      const bX = 330;
      const bY = 110;
      ctx.fillStyle = '#f5cd79';
      for (let bk = 0; bk < 7; bk++) {
        ctx.beginPath();
        ctx.ellipse(bX + (bk % 3) * 10, bY + Math.floor(bk / 3) * 14, 6, 14, 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Wooden Tea Stall Counter
      ctx.fillStyle = '#53351d';
      ctx.fillRect(190, 290, 240, 100);
      ctx.strokeStyle = '#382210';
      ctx.lineWidth = 4;
      ctx.strokeRect(190, 290, 240, 100);

      // Glass Biscuit Jars with Red Lids
      for (let j = 0; j < 3; j++) {
        const jx = 205 + j * 32;
        const jy = 252;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(jx, jy, 26, 38);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(jx, jy, 26, 38);
        ctx.fillStyle = '#d3a040';
        ctx.fillRect(jx + 4, jy + 10, 18, 24);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(jx - 2, jy - 5, 30, 6);
      }

      // Condensed Milk Cans (Danish / Star)
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(315, 260, 22, 30);
      ctx.fillStyle = '#d63031';
      ctx.fillRect(342, 260, 22, 30);

      // Large Aluminium Tea Kettle with Steam (কেটলি)
      const ktX = 380;
      const ktY = 250;
      ctx.fillStyle = '#dcdde1';
      ctx.beginPath();
      ctx.arc(ktX, ktY + 18, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(ktX + 16, ktY + 12);
      ctx.lineTo(ktX + 30, ktY + 2);
      ctx.lineTo(ktX + 26, ktY + 18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#2f3542';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ktX, ktY + 6, 14, Math.PI, 0);
      ctx.stroke();

      // Rising Steam
      const steamTime = performance.now() * 0.005;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      for (let st = 0; st < 4; st++) {
        const stY = ktY - 10 - (st * 16) - ((steamTime * 15) % 30);
        const stX = ktX + 32 + Math.sin(steamTime + st) * 8;
        ctx.beginPath();
        ctx.arc(stX, stY, 6 + st * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Asphalt Road Floor with Rain Puddle Reflections
      ctx.fillStyle = '#1e2430';
      ctx.fillRect(0, 390, this.width, this.height - 390);
      ctx.fillStyle = '#141821';
      ctx.fillRect(0, 390, this.width, 10);
      ctx.fillStyle = 'rgba(254, 202, 87, 0.12)';
      ctx.beginPath();
      ctx.ellipse(480, 460, 160, 35, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (mode === 2) {
      // ==========================================
      // 3. PURAN DHAKA ROOFTOP (পুরান ঢাকার ছাদ ও ঘুড়ি)
      // ==========================================
      const duskGrad = ctx.createLinearGradient(0, 0, 0, 380);
      duskGrad.addColorStop(0, '#5f27cd');
      duskGrad.addColorStop(0.4, '#ff6b6b');
      duskGrad.addColorStop(0.75, '#feca57');
      duskGrad.addColorStop(1, '#ff9f43');
      ctx.fillStyle = duskGrad;
      ctx.fillRect(0, 0, this.width, 380);

      // Distant Old Dhaka Mosques, Minarets & Dense Brick Buildings
      ctx.fillStyle = '#2c1e3d';
      ctx.fillRect(50, 210, 110, 180);
      ctx.fillRect(180, 170, 95, 220);
      ctx.fillRect(300, 240, 130, 150);
      ctx.fillRect(660, 190, 120, 200);
      ctx.fillRect(810, 150, 140, 240);
      ctx.fillRect(970, 210, 90, 180);

      // Minaret dome silhouette
      ctx.beginPath();
      ctx.arc(227, 160, 22, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(224, 130, 6, 30);

      // Flying Paper Kites in the sky (চিল ঘুড়ি, চোখদার ঘুড়ি)
      const kites = [
        { x: 190, y: 70, color: '#e74c3c', rot: 0.2 },
        { x: 380, y: 110, color: '#2ecc71', rot: -0.15 },
        { x: 580, y: 55, color: '#f1c40f', rot: 0.3 },
        { x: 790, y: 90, color: '#3498db', rot: -0.25 },
        { x: 920, y: 130, color: '#e056fd', rot: 0.1 }
      ];

      kites.forEach(k => {
        ctx.save();
        ctx.translate(k.x, k.y);
        ctx.rotate(k.rot);
        ctx.fillStyle = k.color;
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(18, 0);
        ctx.lineTo(0, 24);
        ctx.lineTo(-18, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -20); ctx.lineTo(0, 24);
        ctx.moveTo(-18, 0); ctx.lineTo(18, 0);
        ctx.stroke();
        ctx.strokeStyle = k.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 24);
        ctx.quadraticCurveTo(8, 38, -6, 52);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(k.x > 550 ? 250 : -200, 320);
        ctx.stroke();
        ctx.restore();
      });

      // Rooftop Clothesline with Drying Lungi & Saree
      ctx.strokeStyle = '#747d8c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 220); ctx.quadraticCurveTo(240, 245, 380, 225);
      ctx.stroke();
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(110, 230, 48, 70);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(110, 230, 48, 70);
      ctx.fillStyle = '#d63031';
      ctx.fillRect(180, 235, 75, 80);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(180, 305, 75, 10);

      // Black Gazi Water Tank on Rooftop (গাজী পানির ট্যাংক)
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.roundRect(890, 260, 65, 85, 12);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAZI TANK', 922, 305);

      // Wooden Spool for thread (নাটাই) on roof
      const natX = 740;
      const natY = 360;
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(natX, natY, 40, 10);
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.roundRect(natX + 8, natY - 8, 24, 26, 4);
      ctx.fill();

      // Old Dhaka Red Brick Parapet & Concrete Rooftop
      ctx.fillStyle = '#a04838';
      ctx.fillRect(0, 350, this.width, 45);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 2;
      for (let br = 0; br < this.width; br += 45) {
        ctx.strokeRect(br, 350, 45, 22);
        ctx.strokeRect(br - 22, 372, 45, 23);
      }

      // Concrete Rooftop Floor
      ctx.fillStyle = '#57606f';
      ctx.fillRect(0, 395, this.width, this.height - 395);
      ctx.strokeStyle = '#2f3542';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, 395); ctx.lineTo(this.width, 395); ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      for (let rx = -100; rx < this.width + 200; rx += 140) {
        ctx.beginPath();
        ctx.moveTo(rx, 395);
        ctx.lineTo(rx + (rx - 550) * 0.7, this.height);
        ctx.stroke();
      }
    } else {
      // ==========================================
      // 4. SADARGHAT LAUNCH GHAT (সদরঘাট লঞ্চ টার্মিনাল)
      // ==========================================
      const riverSky = ctx.createLinearGradient(0, 0, 0, 320);
      riverSky.addColorStop(0, '#2c3e50');
      riverSky.addColorStop(0.5, '#4b6584');
      riverSky.addColorStop(1, '#fed330');
      ctx.fillStyle = riverSky;
      ctx.fillRect(0, 0, this.width, 320);

      // Flowing Buriganga River Water with gentle waves
      const riverWater = ctx.createLinearGradient(0, 240, 0, 400);
      riverWater.addColorStop(0, '#2d98da');
      riverWater.addColorStop(0.5, '#3867d6');
      riverWater.addColorStop(1, '#1b2a47');
      ctx.fillStyle = riverWater;
      ctx.fillRect(0, 240, this.width, 160);

      // Water Hyacinth patches floating in river (কচুরিপানা)
      ctx.fillStyle = '#20bf6b';
      for (let hy = 0; hy < 6; hy++) {
        const hx = 60 + hy * 180 + Math.sin(performance.now() * 0.002 + hy) * 15;
        const hyY = 270 + (hy % 3) * 25;
        ctx.beginPath();
        ctx.ellipse(hx, hyY, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#a55eea';
        ctx.beginPath(); ctx.arc(hx, hyY - 4, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#20bf6b';
      }

      // Traditional Wooden Country Sampan / Dingi Boat (নৌকা)
      const boatX = 140;
      const boatY = 275;
      ctx.fillStyle = '#4b382a';
      ctx.beginPath();
      ctx.moveTo(boatX - 35, boatY);
      ctx.quadraticCurveTo(boatX, boatY + 16, boatX + 35, boatY);
      ctx.lineTo(boatX + 28, boatY - 4);
      ctx.quadraticCurveTo(boatX, boatY + 8, boatX - 28, boatY - 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2d3436';
      ctx.beginPath(); ctx.arc(boatX - 10, boatY - 14, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(boatX - 12, boatY - 9, 5, 12);
      ctx.strokeStyle = '#2d3436'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(boatX - 10, boatY - 6); ctx.lineTo(boatX - 28, boatY + 12); ctx.stroke();

      // Giant Triple-Decker Passenger Launch (এম.ভি. সোনার বাংলা)
      const lX = 520;
      const lY = 90;
      const lW = 520;

      // Launch Hull (Navy Blue & White)
      ctx.fillStyle = '#1e3799';
      ctx.beginPath();
      ctx.moveTo(lX, lY + 190);
      ctx.lineTo(lX + lW, lY + 190);
      ctx.lineTo(lX + lW - 30, lY + 260);
      ctx.quadraticCurveTo(lX + 200, lY + 270, lX + 40, lY + 250);
      ctx.closePath();
      ctx.fill();

      // Lower Deck with illuminated cabin windows
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(lX + 30, lY + 125, lW - 50, 65);
      ctx.fillStyle = '#f1c40f';
      for (let w = 0; w < 10; w++) {
        ctx.fillRect(lX + 50 + w * 42, lY + 140, 20, 16);
      }

      // Upper VIP Cabin Deck
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(lX + 70, lY + 70, lW - 130, 55);
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(lX + 70, lY + 125); ctx.lineTo(lX + lW - 60, lY + 125);
      ctx.stroke();
      ctx.fillStyle = '#f1c40f';
      for (let uw = 0; uw < 7; uw++) {
        ctx.fillRect(lX + 90 + uw * 46, lY + 85, 22, 18);
      }

      // Master Bridge & Smoke Funnel (চিমনী)
      ctx.fillStyle = '#eb2f06';
      ctx.fillRect(lX + 230, lY + 25, 34, 45);
      ctx.fillStyle = '#111';
      ctx.fillRect(lX + 226, lY + 20, 42, 8);

      // Launch Name in Bengali on the Bow
      ctx.font = 'bold 16px Bangers, cursive, sans-serif';
      ctx.fillStyle = '#f6b93b';
      ctx.textAlign = 'center';
      ctx.fillText('এম. ভি. সোনার বাংলা', lX + 160, lY + 225);

      // Bangladesh Flag (লাল-সবুজ পতাকা) fluttering on the launch mast!
      const flagX = lX + 320;
      const flagY = lY + 20;
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(flagX, flagY); ctx.lineTo(flagX, flagY + 50); ctx.stroke();
      ctx.fillStyle = '#006a4e';
      ctx.fillRect(flagX, flagY, 40, 24);
      ctx.fillStyle = '#f42a41';
      ctx.beginPath(); ctx.arc(flagX + 18, flagY + 12, 7, 0, Math.PI * 2); ctx.fill();

      // Sadarghat Floating Pontoon Pier (লঞ্চের পন্টুন)
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(0, 395, this.width, this.height - 395);
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 3;
      for (let pz = 0; pz < this.width; pz += 30) {
        ctx.beginPath(); ctx.moveTo(pz, 395); ctx.lineTo(pz, this.height); ctx.stroke();
      }

      // Mooring Rope & Bollard
      const bldX = 120;
      const bldY = 415;
      ctx.fillStyle = '#1a202c';
      ctx.beginPath(); ctx.arc(bldX, bldY, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(bldX - 10, bldY, 20, 22);
      ctx.strokeStyle = '#d6a858';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(bldX, bldY);
      ctx.quadraticCurveTo(lX - 60, 360, lX + 50, lY + 230);
      ctx.stroke();
    }

    // ==========================================
    // DRAW THE CROWD AROUND THEM
    // ==========================================
    this.drawCrowd(ctx, dt);
  }

  // ==========================================
  // CROWD RENDERING & ANIMATION
  // ==========================================
  drawCrowd(ctx, dt) {
    const time = performance.now() * 0.003;

    for (const m of this.crowdMembers) {
      // Jump physics: gravity pulls back down to ground level
      if (m.jumpY < 0) {
        m.jumpY += (dt || 0.016) * 45;
        if (m.jumpY > 0) m.jumpY = 0;
      } else if (m.jumpY > 0) {
        m.jumpY -= (dt || 0.016) * 35;
        if (m.jumpY < 0) m.jumpY = 0;
      }

      const footX = m.x;
      const footY = m.groundY;
      const bodyY = footY + m.jumpY;

      // 1. FLOOR SHADOW (Planted firmly on the ground surface)
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      const shadowFactor = Math.max(1 + m.jumpY * 0.03, 0.4);
      ctx.ellipse(footX, footY, 22 * shadowFactor, 7 * shadowFactor, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. DRAW CHARACTER STANDING FROM FEET UP
      ctx.save();
      ctx.translate(footX, bodyY);

      // Subtle breathing sway of upper torso only (feet stay planted!)
      const sway = Math.sin(time + m.bob) * 1.5;

      if (m.faction === 'mob') {
        // ==========================================
        // FACTION: AGGRESSIVE MOB (Left side onlookers)
        // ==========================================
        if (m.type === 'lungi') {
          // Lungi guy (Rafiq)
          // Leather chappals / bare feet on floor
          ctx.fillStyle = '#4a2810';
          ctx.beginPath();
          ctx.roundRect(-14, -6, 12, 6, 2);
          ctx.roundRect(2, -6, 12, 6, 2);
          ctx.fill();

          // Flowing Blue Checked Lungi down to ankles
          ctx.fillStyle = '#0984e3';
          ctx.beginPath();
          ctx.moveTo(-16, -55);
          ctx.lineTo(-18, -6);
          ctx.lineTo(18, -6);
          ctx.lineTo(16, -55);
          ctx.closePath();
          ctx.fill();

          // Lungi white check pattern
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-17, -22); ctx.lineTo(17, -22);
          ctx.moveTo(-17, -40); ctx.lineTo(17, -40);
          ctx.moveTo(-6, -55); ctx.lineTo(-6, -6);
          ctx.moveTo(6, -55); ctx.lineTo(6, -6);
          ctx.stroke();

          // Yellow casual t-shirt
          ctx.fillStyle = '#fdcb6e';
          ctx.beginPath();
          ctx.roundRect(-18, -98 + sway, 36, 46, 6);
          ctx.fill();
        } else {
          // Pants & Sneakers
          // Sneaker soles and shoes on floor
          ctx.fillStyle = '#e74c3c';
          ctx.beginPath();
          ctx.roundRect(-15, -7, 13, 7, 3);
          ctx.roundRect(2, -7, 13, 7, 3);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-15, -2, 13, 2);
          ctx.fillRect(2, -2, 13, 2);

          // Jeans / Trousers
          ctx.fillStyle = '#2d3436';
          ctx.beginPath();
          ctx.moveTo(-14, -58);
          ctx.lineTo(-15, -7);
          ctx.lineTo(-2, -7);
          ctx.lineTo(-2, -58);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(2, -58);
          ctx.lineTo(2, -7);
          ctx.lineTo(15, -7);
          ctx.lineTo(14, -58);
          ctx.closePath();
          ctx.fill();

          // Polo / Casual Shirt
          ctx.fillStyle = m.type === 'phone' ? '#d63031' : '#6c5ce7';
          ctx.beginPath();
          ctx.roundRect(-17, -98 + sway, 34, 42, 6);
          ctx.fill();
        }

        // Head & Neck
        const headY = -114 + sway;
        ctx.fillStyle = '#e5a772';
        ctx.beginPath();
        ctx.arc(0, headY, 15, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(0, headY - 5, 15, Math.PI, 0);
        ctx.fill();

        // Shouting Face
        ctx.fillStyle = '#111';
        ctx.fillRect(-6, headY - 2, 3, 3);
        ctx.fillRect(3, headY - 2, 3, 3);
        // Screaming mouth
        ctx.fillStyle = '#962d22';
        ctx.beginPath();
        ctx.ellipse(0, headY + 8, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Arms & Props
        if (m.type === 'phone') {
          // Holding up smartphone recording Facebook Live!
          ctx.fillStyle = '#e5a772';
          ctx.beginPath();
          ctx.roundRect(10, -112 + sway, 14, 8, 3);
          ctx.fill();

          // Black smartphone
          ctx.fillStyle = '#111';
          ctx.beginPath();
          ctx.roundRect(18, -130 + sway, 13, 26, 3);
          ctx.fill();

          // Glowing phone screen
          ctx.fillStyle = '#00cec9';
          ctx.fillRect(19, -128 + sway, 11, 22);

          // Red blinking recording dot "● LIVE"
          if (Math.sin(time * 6) > 0) {
            ctx.fillStyle = '#ff4757';
            ctx.beginPath();
            ctx.arc(24, -122 + sway, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (m.type === 'fist') {
          // Waving raised fist in air
          ctx.fillStyle = '#e5a772';
          ctx.beginPath();
          ctx.roundRect(12, -135 + sway, 12, 38, 4);
          ctx.fill();
          // Fist
          ctx.beginPath();
          ctx.arc(18, -138 + sway, 7.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // ==========================================
        // FACTION: SYMPATHIZERS (Right side defenders)
        // ==========================================
        // Leather Nagra sandals on ground
        ctx.fillStyle = '#4a2810';
        ctx.beginPath();
        ctx.roundRect(-15, -6, 13, 6, 2);
        ctx.roundRect(2, -6, 13, 6, 2);
        ctx.fill();

        // White traditional Pajama
        ctx.fillStyle = '#f1f2f6';
        ctx.beginPath();
        ctx.moveTo(-14, -58);
        ctx.lineTo(-14, -6);
        ctx.lineTo(-2, -6);
        ctx.lineTo(-2, -58);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(2, -58);
        ctx.lineTo(2, -6);
        ctx.lineTo(14, -6);
        ctx.lineTo(14, -58);
        ctx.closePath();
        ctx.fill();

        // Traditional Kurta / Punjabi reaching past knees
        ctx.fillStyle = m.type === 'plead' ? '#f5f6fa' : '#dcdde1';
        ctx.beginPath();
        ctx.moveTo(-18, -98 + sway);
        ctx.lineTo(-22, -28 + sway);
        ctx.lineTo(22, -28 + sway);
        ctx.lineTo(18, -98 + sway);
        ctx.closePath();
        ctx.fill();

        // Head & Neck
        const headY = -114 + sway;
        ctx.fillStyle = '#e0a96d';
        ctx.beginPath();
        ctx.arc(0, headY, 15, 0, Math.PI * 2);
        ctx.fill();

        // White Prayer Cap (Tupi)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-14, headY - 14, 28, 13, 4);
        ctx.fill();
        ctx.stroke();

        // Worried eyes & open mouth
        ctx.fillStyle = '#111';
        ctx.fillRect(-6, headY - 1, 3, 3);
        ctx.fillRect(3, headY - 1, 3, 3);
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.ellipse(0, headY + 8, 5, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Beard
        ctx.fillStyle = m.type === 'nervous' ? '#d35400' : '#4a4a4a';
        ctx.beginPath();
        ctx.moveTo(-12, headY + 5);
        ctx.quadraticCurveTo(0, headY + 22, 12, headY + 5);
        ctx.lineTo(0, headY + 24);
        ctx.closePath();
        ctx.fill();

        // Outstretched pleading hands ("THAMEN! MOB KOIREN NA!")
        ctx.fillStyle = '#e0a96d';
        ctx.beginPath();
        ctx.roundRect(-34, -88 + sway, 26, 9, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(-38, -97 + sway, 9, 18, 3);
        ctx.fill();
      }

      ctx.restore();
    }

    // ==========================================
    // DRAW SPEECH BUBBLES
    // ==========================================
    for (let b = this.speechBubbles.length - 1; b >= 0; b--) {
      const bubble = this.speechBubbles[b];
      bubble.y -= (dt || 0.016) * 18; // float upward
      if (bubble.scale < 1.0) bubble.scale += (dt || 0.016) * 6;
      bubble.life -= (dt || 0.016);
      bubble.alpha = Math.min(bubble.life * 1.5, 1);

      if (bubble.life <= 0) {
        this.speechBubbles.splice(b, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(bubble.alpha, 0);
      ctx.translate(bubble.x, bubble.y);
      ctx.scale(bubble.scale, bubble.scale);

      ctx.font = 'bold 18px Bangers, cursive, sans-serif';
      const textMetrics = ctx.measureText(bubble.text);
      const padX = 14;
      const bw = textMetrics.width + padX * 2;
      const bh = 34;

      // Comic Bubble Box
      const isMob = bubble.faction === 'mob';
      ctx.fillStyle = isMob ? '#feca57' : '#ff6b81';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 10);
      ctx.fill();
      ctx.stroke();

      // Bubble Pointer Tail downward
      ctx.beginPath();
      ctx.moveTo(-6, bh / 2 - 2);
      ctx.lineTo(0, bh / 2 + 10);
      ctx.lineTo(8, bh / 2 - 2);
      ctx.closePath();
      ctx.fillStyle = isMob ? '#feca57' : '#ff6b81';
      ctx.fill();
      ctx.stroke();

      // Text inside bubble
      ctx.fillStyle = isMob ? '#222f3e' : '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bubble.text, 0, 1);

      ctx.restore();
    }
  }

  // ==========================================
  // MAIN GAME LOOP
  // ==========================================
  gameLoop(timestamp) {
    try {
      const rawDt = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;
      const dt = Math.min(rawDt, 0.1);
      const effectiveDt = this.slowMo ? dt * 0.3 : dt;

      // Camera flash decay
      if (this.flashAlpha > 0) {
        this.flashAlpha -= dt * 2.5;
        if (this.flashAlpha < 0) this.flashAlpha = 0;
      }

      // 1. Combo & Streak Timer Decay
      if (this.combo > 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) {
          this.combo = 0;
          this.updateHUD();
        }
      }

      if (this.streak > 0) {
        this.streakTimer -= dt;
        if (this.streakTimer <= 0) {
          soundEngine.playStreakLost();
          this.spawnComicText('STREAK LOST!', this.player.x, this.player.y - 100, '#ff4757');
          this.streak = 0;
          this.streakMultiplier = 1.0;
          this.player.streak = 0;
          this.streakTimer = 0;
          this.updateHUD();
        } else {
          // Update streak bar in HUD continuously
          const fillPct = (this.streakTimer / this.streakDuration) * 100;
          this.dom.streakFill.style.width = `${fillPct}%`;
        }
      }

      // 2. Periodic Idle Banter from Crowd
      this.idleBanterTimer -= dt;
      if (this.idleBanterTimer <= 0) {
        this.idleBanterTimer = 2.5 + Math.random() * 2.5;
        if (Math.random() > 0.5) {
          const mobShouts = ['AROH DEN!', 'MAAR SHALA RE!', 'AAR EKTA DE!', 'VIDEO KOR!'];
          this.triggerCrowdBubble('mob', mobShouts[Math.floor(Math.random() * mobShouts.length)]);
        } else {
          const sympPleas = ['THAMEN!', 'MOB KOIREN NA!', 'AI MEA KI KORTASEN!'];
          this.triggerCrowdBubble('symp', sympPleas[Math.floor(Math.random() * sympPleas.length)]);
        }
      }

      // 3. Update Characters
      this.player.update(effectiveDt);
      this.target.update(effectiveDt);

      // 4. Update Ultimate Barrage
      this.updateUltimate(effectiveDt);

      // 5. Update Screen Shake
      if (this.shakeIntensity > 0) {
        this.shakeIntensity *= this.shakeDecay;
        if (this.shakeIntensity < 0.2) this.shakeIntensity = 0;
      }

      // 6. Update Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.alpha -= dt / p.life;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }

      // 7. Update Floating Scores
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const f = this.floatingTexts[i];
        f.y += f.vy;
        f.alpha -= dt / f.life;
        if (f.alpha <= 0) {
          this.floatingTexts.splice(i, 1);
        }
      }

      // 8. Update Comic Action Bubbles
      for (let i = this.comicEffects.length - 1; i >= 0; i--) {
        const c = this.comicEffects[i];
        if (c.scale < c.maxScale) {
          c.scale += dt * 6;
        }
        c.alpha -= dt / c.life;
        if (c.alpha <= 0) {
          this.comicEffects.splice(i, 1);
        }
      }

      // ==========================================
      // RENDER PASS
      // ==========================================
      const ctx = this.ctx;
      ctx.save();

      // Screen Shake Offset
      if (this.shakeIntensity > 0) {
        const sx = (Math.random() - 0.5) * this.shakeIntensity * 2;
        const sy = (Math.random() - 0.5) * this.shakeIntensity * 2;
        ctx.translate(sx, sy);
      }

      // Draw Arena Background & Crowd
      this.drawArena(effectiveDt);

      // Draw Characters
      this.player.render(ctx);
      this.target.render(ctx);

      // Draw Particles
      for (const p of this.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(p.alpha, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Comic Text Pops
      for (const c of this.comicEffects) {
        ctx.save();
        ctx.globalAlpha = Math.max(c.alpha, 0);
        ctx.translate(c.x, c.y);
        ctx.scale(c.scale, c.scale);
        ctx.font = '48px Bangers, cursive';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 6;
        ctx.strokeText(c.text, 0, 0);
        ctx.fillStyle = c.color;
        ctx.fillText(c.text, 0, 0);
        ctx.restore();
      }

      // Draw Floating Scores
      for (const f of this.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(f.alpha, 0);
        ctx.font = f.isCrit ? 'bold 32px Outfit, sans-serif' : '26px Outfit, sans-serif';
        ctx.fillStyle = f.isCrit ? '#feca57' : '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeText(f.text, f.x, f.y);
        ctx.fillText(f.text, f.x, f.y);
        ctx.restore();
      }

      // Camera flash effect
      if (this.flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
        ctx.fillRect(0, 0, this.width, this.height);
      }

      ctx.restore();
    } catch (err) {
      console.error('Frame loop error:', err);
    } finally {
      requestAnimationFrame(this.gameLoop);
    }
  }
}

// Start game once DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.slapGame = new SlapGame();
});
