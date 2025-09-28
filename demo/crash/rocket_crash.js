document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('crash-graph');
    const ctx = canvas.getContext('2d');
    const effectsCanvas = document.getElementById('effects-layer');
    const effectsCtx = effectsCanvas.getContext('2d');

    const multiplierDisplay = document.querySelector('.multiplier-value');
    const roundTimer = document.getElementById('round-timer');
    const crashMessage = document.getElementById('crash-message');
    const actionButton = document.getElementById('action-button');
    const betAmountInput = document.getElementById('bet-amount');
    const autoCashoutInput = document.getElementById('auto-cashout');
    const balanceDisplay = document.getElementById('balance');
    const profitDisplay = document.getElementById('profit');
    const statusDisplay = document.getElementById('status-display');

    // Game state
    let balance = 1000;
    let totalProfit = 0;
    let currentBet = 0;
    let multiplier = 1.00;
    let crashPoint = 0;
    let gameState = 'waiting';
    let startTime;
    let animationFrameId;
    let countdownIntervalId;

    // Constants
    const BETTING_COUNTDOWN_MS = 5000;
    const POST_CRASH_DELAY_MS = 3000;
    const GROWTH_RATE = 0.12; // Increased for faster growth
    const HOUSE_EDGE = 0.03;

    // Canvas dimensions
    let viewWidth = 0;
    let viewHeight = 0;
    const PADDING = 30;
    const RIGHT_MARGIN = 60;

    // View scaling
    let currentViewYMax = 2.0;
    let currentViewXMax = 3.0;
    let targetViewYMax = 2.0;
    let targetViewXMax = 3.0;

    // Camera offset for infinite scrolling
    let cameraOffsetX = 0;
    let cameraOffsetY = 0;

    // Rocket state
    let rocketX = 0;
    let rocketY = 0;
    let rocketAngle = -Math.PI / 6;
    let rocketShake = 0;

    // Trail system
    let rocketTrail = [];
    const MAX_TRAIL_LENGTH = 150;

    // Particle systems
    let flameParticles = [];
    let sparkParticles = [];
    let smokeParticles = [];
    let explosionParticles = [];

    // Cashout markers to display on the graph
    let cashoutMarkers = [];

    // Enhanced rocket model
    class Rocket {
        constructor() {
            this.width = 40;
            this.height = 60;
            this.enginePulse = 0;
            this.windowGlow = 0;
            this.thrusterIntensity = 1;
        }

        update(dt) {
            this.enginePulse += dt * 10;
            this.windowGlow = 0.5 + Math.sin(this.enginePulse) * 0.3;
            this.thrusterIntensity = 0.8 + Math.random() * 0.4;
        }

        draw(ctx, x, y, angle) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            // Add shake effect
            const shakeX = (Math.random() - 0.5) * rocketShake;
            const shakeY = (Math.random() - 0.5) * rocketShake;
            ctx.translate(shakeX, shakeY);

            // Scale based on speed
            const scale = 1 + Math.min(0.2, multiplier * 0.01);
            ctx.scale(scale, scale);

            // Draw rocket shadow
            ctx.save();
            ctx.translate(3, 3);
            ctx.globalAlpha = 0.3;
            this.drawRocketBody(ctx, true);
            ctx.restore();

            // Draw main rocket body
            this.drawRocketBody(ctx, false);

            // Draw thruster effects
            this.drawThruster(ctx);

            ctx.restore();
        }

        drawRocketBody(ctx, isShadow = false) {
            // Rocket body gradient
            const bodyGradient = ctx.createLinearGradient(-15, 0, 15, 0);
            if (!isShadow) {
                bodyGradient.addColorStop(0, '#e74c3c');
                bodyGradient.addColorStop(0.3, '#c0392b');
                bodyGradient.addColorStop(0.7, '#e74c3c');
                bodyGradient.addColorStop(1, '#c0392b');
            } else {
                bodyGradient.addColorStop(0, '#000');
                bodyGradient.addColorStop(1, '#000');
            }

            // Main body
            ctx.fillStyle = bodyGradient;
            ctx.beginPath();
            ctx.moveTo(25, 0);  // Nose
            ctx.quadraticCurveTo(22, -8, 15, -10);  // Top curve
            ctx.lineTo(-10, -10);
            ctx.lineTo(-15, -15);  // Top fin
            ctx.lineTo(-12, -10);
            ctx.lineTo(-20, -8);  // Engine top
            ctx.lineTo(-20, 8);   // Engine bottom
            ctx.lineTo(-12, 10);
            ctx.lineTo(-15, 15);  // Bottom fin
            ctx.lineTo(-10, 10);
            ctx.lineTo(15, 10);
            ctx.quadraticCurveTo(22, 8, 25, 0);  // Bottom curve
            ctx.closePath();
            ctx.fill();

            if (!isShadow) {
                // Add metallic highlight
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Window
                ctx.fillStyle = `rgba(100, 200, 255, ${this.windowGlow})`;
                ctx.beginPath();
                ctx.arc(10, 0, 5, 0, Math.PI * 2);
                ctx.fill();

                // Window shine
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(11, -1, 2, 0, Math.PI * 2);
                ctx.fill();

                // Body details
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, -10);
                ctx.lineTo(0, 10);
                ctx.stroke();

                // Fins detail
                ctx.fillStyle = '#34495e';
                ctx.beginPath();
                ctx.moveTo(-12, -15);
                ctx.lineTo(-15, -15);
                ctx.lineTo(-14, -10);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(-12, 15);
                ctx.lineTo(-15, 15);
                ctx.lineTo(-14, 10);
                ctx.closePath();
                ctx.fill();
            }
        }

        drawThruster(ctx) {
            // Multiple flame layers for depth
            const flames = [
                { size: 1.2, color: 'rgba(255, 255, 255, 0.9)', blur: 10 },
                { size: 1.5, color: 'rgba(255, 200, 100, 0.8)', blur: 15 },
                { size: 1.8, color: 'rgba(255, 150, 50, 0.6)', blur: 20 },
                { size: 2.0, color: 'rgba(255, 100, 0, 0.4)', blur: 25 }
            ];

            flames.forEach(flame => {
                ctx.save();
                ctx.filter = `blur(${flame.blur}px)`;

                const flameLength = 20 * flame.size * this.thrusterIntensity;
                const flameWidth = 10 * flame.size;

                const gradient = ctx.createLinearGradient(-20, 0, -20 - flameLength, 0);
                gradient.addColorStop(0, flame.color);
                gradient.addColorStop(0.5, flame.color.replace(/[\d.]+\)/, '0.3)'));
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(-20, -flameWidth/2);
                ctx.quadraticCurveTo(
                    -20 - flameLength/2,
                    (Math.random() - 0.5) * flameWidth,
                    -20 - flameLength,
                    0
                );
                ctx.quadraticCurveTo(
                    -20 - flameLength/2,
                    (Math.random() - 0.5) * flameWidth,
                    -20,
                    flameWidth/2
                );
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            });
        }
    }

    const rocket = new Rocket();

    // Particle class
    class Particle {
        constructor(x, y, vx, vy, size, color, life) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.size = size;
            this.color = color;
            this.life = life;
            this.maxLife = life;
            this.gravity = 0;
            this.drag = 0.98;
        }

        update(dt) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vy += this.gravity * dt;
            this.vx *= this.drag;
            this.vy *= this.drag;
            this.life -= dt;
            return this.life > 0;
        }

        draw(ctx) {
            const alpha = Math.max(0, this.life / this.maxLife);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Flame particle class
    class FlameParticle extends Particle {
        constructor(x, y, angle) {
            const speed = 150 + Math.random() * 100;
            const spread = (Math.random() - 0.5) * 0.8;
            const dir = angle + Math.PI + spread;
            const colors = ['#ffffff', '#ffe0a0', '#ffa500', '#ff6b00'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            super(
                x, y,
                Math.cos(dir) * speed,
                Math.sin(dir) * speed,
                2 + Math.random() * 3,
                color,
                0.3 + Math.random() * 0.3
            );

            this.gravity = -50;
            this.drag = 0.95;
        }

        draw(ctx) {
            const alpha = Math.max(0, this.life / this.maxLife);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';

            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size
            );

            // Convert color to rgba properly
            let colorWithAlpha;
            if (this.color.startsWith('#')) {
                // Convert hex to rgba
                let hex = this.color.slice(1);

                // Handle 3-char hex codes
                if (hex.length === 3) {
                    hex = hex.split('').map(c => c + c).join('');
                }

                const r = parseInt(hex.substr(0, 2), 16) || 255;
                const g = parseInt(hex.substr(2, 2), 16) || 255;
                const b = parseInt(hex.substr(4, 2), 16) || 255;
                colorWithAlpha = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            } else {
                // Already a color name or rgb, just add alpha
                colorWithAlpha = this.color;
            }

            gradient.addColorStop(0, colorWithAlpha);
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * (1 + (1 - alpha) * 0.5), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Spark particle class
    class SparkParticle extends Particle {
        constructor(x, y, angle) {
            const speed = 200 + Math.random() * 200;
            const spread = (Math.random() - 0.5) * Math.PI;
            const dir = angle + Math.PI + spread;

            super(
                x, y,
                Math.cos(dir) * speed,
                Math.sin(dir) * speed,
                1 + Math.random() * 2,
                '#ffff00',
                0.5 + Math.random() * 0.5
            );

            this.gravity = 100;
            this.drag = 0.96;
            this.trail = [];
        }

        update(dt) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 5) this.trail.shift();
            return super.update(dt);
        }

        draw(ctx) {
            const alpha = Math.max(0, this.life / this.maxLife);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';

            // Draw trail
            if (this.trail.length > 1) {
                ctx.strokeStyle = `rgba(255, 200, 0, ${alpha * 0.5})`;
                ctx.lineWidth = this.size * 0.5;
                ctx.beginPath();
                ctx.moveTo(this.trail[0].x, this.trail[0].y);
                for (let i = 1; i < this.trail.length; i++) {
                    ctx.lineTo(this.trail[i].x, this.trail[i].y);
                }
                ctx.stroke();
            }

            // Draw spark
            ctx.fillStyle = `rgba(255, 255, 100, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    // Smoke particle class
    class SmokeParticle extends Particle {
        constructor(x, y, angle) {
            const speed = 30 + Math.random() * 50;
            const spread = (Math.random() - 0.5) * 1.5;
            const dir = angle + Math.PI + spread;

            super(
                x, y,
                Math.cos(dir) * speed,
                Math.sin(dir) * speed,
                5 + Math.random() * 10,
                'rgba(150, 150, 150, 0.4)',
                1 + Math.random()
            );

            this.gravity = -30;
            this.drag = 0.99;
            this.growth = 1.02;
        }

        update(dt) {
            this.size *= this.growth;
            return super.update(dt);
        }

        draw(ctx) {
            const alpha = Math.max(0, this.life / this.maxLife) * 0.3;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Initialize stars
    function createStars() {
        const starsContainer = document.getElementById('stars-container');
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.animationDuration = (2 + Math.random() * 2) + 's';
            starsContainer.appendChild(star);
        }
    }

    function updateBalance(amount) {
        balance = amount;
        balanceDisplay.textContent = balance.toFixed(2);
    }

    function updateProfit(amount) {
        totalProfit += amount;
        profitDisplay.textContent = (totalProfit >= 0 ? '+' : '') + totalProfit.toFixed(2);
        profitDisplay.className = 'value ' + (totalProfit >= 0 ? 'positive' : 'negative');
    }

    function generateCrashPoint() {
        const r = Math.random();
        if (r < 0.03) return 1.00;

        const raw = (1 - HOUSE_EDGE) / (1 - r);
        return Math.max(1.01, Number(raw.toFixed(2)));
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        viewWidth = rect.width;
        viewHeight = rect.height;

        canvas.width = viewWidth * dpr;
        canvas.height = viewHeight * dpr;
        effectsCanvas.width = viewWidth * dpr;
        effectsCanvas.height = viewHeight * dpr;

        ctx.scale(dpr, dpr);
        effectsCtx.scale(dpr, dpr);
    }

    function drawGrid() {
        ctx.save();

        const innerWidth = viewWidth - PADDING - RIGHT_MARGIN - PADDING;
        const innerHeight = viewHeight - 2 * PADDING;
        const left = PADDING;
        const right = PADDING + innerWidth;
        const bottom = viewHeight - PADDING;
        const top = PADDING;

        // Grid background with gradient
        const bgGradient = ctx.createLinearGradient(left, top, left, bottom);
        bgGradient.addColorStop(0, 'rgba(10, 15, 30, 0.7)');
        bgGradient.addColorStop(1, 'rgba(20, 25, 40, 0.5)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(left, top, innerWidth, innerHeight);

        // Dynamic grid lines based on scale
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;

        // Calculate grid density based on scale
        const xGridCount = Math.min(20, Math.max(5, Math.floor(currentViewXMax)));
        const yGridCount = 10;

        // Vertical lines with scrolling effect
        const elapsed = (Date.now() - startTime) / 1000;
        const scrollOffset = (elapsed % 1) * (innerWidth / xGridCount);

        for (let i = 0; i <= xGridCount + 1; i++) {
            const x = left + (innerWidth / xGridCount) * i - scrollOffset;
            if (x >= left && x <= right) {
                ctx.beginPath();
                ctx.moveTo(x, top);
                ctx.lineTo(x, bottom);
                ctx.stroke();
            }
        }

        // Horizontal lines (logarithmic scale for high multipliers)
        for (let i = 0; i <= yGridCount; i++) {
            const y = top + (innerHeight / yGridCount) * i;
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(left, bottom);
        ctx.lineTo(right, bottom);
        ctx.moveTo(left, bottom);
        ctx.lineTo(left, top);
        ctx.stroke();

        // Labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';

        // X-axis labels (scrolling world coordinates)
        const xStart = Math.max(0, elapsed - 3); // Start showing from 3 seconds ago
        for (let i = 0; i <= 5; i++) {
            const time = xStart + (elapsed > 3 ? (3 / 5) * i : (elapsed / 5) * i);
            const x = left + (innerWidth / 5) * i;
            const label = time < 10 ? time.toFixed(1) + 's' : time.toFixed(0) + 's';
            ctx.fillText(label, x - 10, bottom + 20);
        }

        // Y-axis labels (multiplier) - dynamic scale
        const yMax = currentViewYMax;
        for (let i = 1; i <= 5; i++) {
            const progress = i / 5;
            let mult;

            if (yMax < 10) {
                mult = 1 + (yMax - 1) * progress;
            } else {
                // Logarithmic scale for large multipliers
                mult = Math.exp(Math.log(yMax) * progress);
            }

            const y = bottom - (innerHeight / 5) * i;
            const label = mult < 100 ? mult.toFixed(1) + 'x' : mult.toFixed(0) + 'x';
            ctx.fillText(label, left - 35, y + 5);
        }

        ctx.restore();
    }

    function getPointAtTime(timeSec) {
        // Ensure we have valid dimensions
        if (!viewWidth || !viewHeight) {
            return { x: PADDING, y: viewHeight - PADDING, worldX: 0, worldY: 0 };
        }

        const innerWidth = Math.max(viewWidth - PADDING - RIGHT_MARGIN - PADDING, 10);
        const innerHeight = Math.max(viewHeight - 2 * PADDING, 10);

        const mult = Math.exp(GROWTH_RATE * timeSec);

        // Calculate the "true" world position (this grows infinitely)
        // The rocket follows a diagonal path: x increases linearly, y increases exponentially
        const worldX = timeSec * 80; // pixels per second horizontal speed
        const worldY = (mult - 1) * 50; // exponential vertical growth

        // Update camera offset to keep rocket visible
        // Camera follows the rocket but with boundaries to keep it on screen

        // X-axis: Keep rocket on the right side (75% of screen width)
        // This ensures rocket stays to the right of the multiplier display
        const rocketScreenXTarget = innerWidth * 0.75; // Target 75% of screen (well to the right)
        const maxCameraX = worldX - rocketScreenXTarget;

        // Smooth camera following for X - start scrolling earlier
        if (worldX > innerWidth * 0.75) {
            cameraOffsetX = maxCameraX;
        } else {
            // During initial flight, let rocket move from left to right
            cameraOffsetX = 0;
        }

        // Y-axis: Keep rocket in middle-upper area (40% from bottom)
        const rocketScreenYTarget = innerHeight * 0.4; // Target 40% from bottom (60% from top)
        const maxCameraY = worldY - rocketScreenYTarget;

        // Smooth camera following for Y
        if (worldY > innerHeight * 0.4) {
            cameraOffsetY = maxCameraY;
        } else {
            cameraOffsetY = 0;
        }

        // Convert world coordinates to screen coordinates
        const screenX = PADDING + worldX - cameraOffsetX;
        const screenY = (viewHeight - PADDING) - (worldY - cameraOffsetY);

        return { x: screenX, y: screenY, worldX: worldX, worldY: worldY };
    }

    function updateViewScale() {
        // Dynamic view scaling that follows the multiplier smoothly
        const elapsed = (Date.now() - startTime) / 1000;

        // Y-axis follows multiplier with some headroom
        if (multiplier < 2) {
            targetViewYMax = 2.5;
        } else if (multiplier < 5) {
            targetViewYMax = multiplier * 1.3;
        } else if (multiplier < 20) {
            targetViewYMax = multiplier * 1.2;
        } else if (multiplier < 100) {
            targetViewYMax = multiplier * 1.15;
        } else {
            targetViewYMax = multiplier * 1.1;
        }

        // X-axis represents time with scrolling effect
        targetViewXMax = Math.max(5, elapsed + 2);

        // Smooth transition with adaptive speed
        const smoothFactor = multiplier < 5 ? 0.15 : 0.1;
        currentViewYMax += (targetViewYMax - currentViewYMax) * smoothFactor;
        currentViewXMax += (targetViewXMax - currentViewXMax) * smoothFactor;

        // Ensure minimum values
        currentViewYMax = Math.max(currentViewYMax, 2);
        currentViewXMax = Math.max(currentViewXMax, 3);
    }

    function emitParticles() {
        const rocketBack = {
            x: rocketX - Math.cos(rocketAngle) * 20,
            y: rocketY - Math.sin(rocketAngle) * 20
        };

        // Emit flame particles
        for (let i = 0; i < 5; i++) {
            flameParticles.push(new FlameParticle(rocketBack.x, rocketBack.y, rocketAngle));
        }

        // Emit sparks occasionally
        if (Math.random() < 0.3) {
            sparkParticles.push(new SparkParticle(rocketBack.x, rocketBack.y, rocketAngle));
        }

        // Emit smoke
        if (Math.random() < 0.5) {
            smokeParticles.push(new SmokeParticle(rocketBack.x, rocketBack.y, rocketAngle));
        }
    }

    function updateParticles(dt) {
        flameParticles = flameParticles.filter(p => p.update(dt));
        sparkParticles = sparkParticles.filter(p => p.update(dt));
        smokeParticles = smokeParticles.filter(p => p.update(dt));
        explosionParticles = explosionParticles.filter(p => p.update(dt));
    }

    function drawParticles() {
        // Draw smoke first (behind everything)
        smokeParticles.forEach(p => p.draw(ctx));

        // Draw flames and sparks with additive blending
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        flameParticles.forEach(p => p.draw(ctx));
        sparkParticles.forEach(p => p.draw(ctx));
        ctx.restore();

        // Draw explosion particles
        explosionParticles.forEach(p => p.draw(ctx));
    }

    function drawTrail() {
        // Trail removed for cleaner look
        // Only keep trail data for rocket angle calculation
        return;
    }

    function addCashoutMarker(playerName, mult, timeSec) {
        // Get the position at the time of cashout
        const pos = getPointAtTime(timeSec);

        // Add marker with world coordinates
        cashoutMarkers.push({
            name: playerName,
            multiplier: mult,
            time: timeSec,
            worldX: pos.worldX || (timeSec * 80),
            worldY: pos.worldY || ((Math.exp(GROWTH_RATE * timeSec) - 1) * 50),
            opacity: 1.0,
            scale: 1.0,
            age: 0
        });

        // Keep only recent markers (max 20)
        if (cashoutMarkers.length > 20) {
            cashoutMarkers.shift();
        }
    }

    function drawCashoutMarkers() {
        ctx.save();

        cashoutMarkers.forEach((marker) => {
            // Convert world coordinates to screen coordinates using camera offset
            const screenX = PADDING + marker.worldX - cameraOffsetX;
            const screenY = (viewHeight - PADDING) - (marker.worldY - cameraOffsetY);

            // Only draw if marker is visible on screen
            if (screenX < 0 || screenX > viewWidth || screenY < 0 || screenY > viewHeight) {
                return;
            }

            ctx.globalAlpha = marker.opacity;

            // Draw marker circle
            const markerSize = 6 * marker.scale;
            ctx.fillStyle = '#2ecc71';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY, markerSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Draw player name and multiplier
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${10 * marker.scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4;
            ctx.textAlign = 'left';

            const textX = screenX + 12;
            const textY = screenY - 5;

            // Background for text
            const text = `${marker.name} @ ${marker.multiplier.toFixed(2)}x`;
            const textWidth = ctx.measureText(text).width;

            ctx.fillStyle = `rgba(39, 174, 96, ${marker.opacity * 0.9})`;
            ctx.fillRect(textX - 3, textY - 12, textWidth + 6, 18);

            // Draw text
            ctx.fillStyle = '#fff';
            ctx.fillText(text, textX, textY);

            // Add connection line
            ctx.strokeStyle = `rgba(46, 204, 113, ${marker.opacity * 0.5})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(screenX + markerSize, screenY);
            ctx.lineTo(textX - 3, textY - 3);
            ctx.stroke();
            ctx.setLineDash([]);
        });

        ctx.restore();
    }

    function updateCashoutMarkers(dt) {
        // Update marker animations
        cashoutMarkers = cashoutMarkers.filter(marker => {
            marker.age += dt;

            // Animate scale
            if (marker.age < 0.3) {
                marker.scale = 1.0 + (marker.age / 0.3) * 0.3;
            } else {
                marker.scale = 1.3 - (marker.age - 0.3) * 0.1;
                marker.scale = Math.max(1.0, marker.scale);
            }

            // Fade out old markers
            if (marker.age > 10) {
                marker.opacity = Math.max(0, 1.0 - ((marker.age - 10) / 5));
            }

            // Remove after 15 seconds
            return marker.age < 15;
        });
    }

    function createExplosion(x, y) {
        // Create explosion particles
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 * i) / 50;
            const speed = 100 + Math.random() * 200;
            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                3 + Math.random() * 5,
                `hsl(${Math.random() * 60}, 100%, 50%)`,
                0.5 + Math.random() * 0.5
            );
            particle.gravity = 50;
            explosionParticles.push(particle);
        }

        // Screen shake (reduced)
        rocketShake = 15;

        // NO WHITE FLASH - removed for cleaner experience

        // Show crash result notification
        showCrashNotification();
    }

    function showCrashNotification() {
        // Show crash multiplier
        crashMessage.textContent = `Crashed at ${crashPoint.toFixed(2)}x`;
        crashMessage.classList.add('show');

        // Show win/loss popup
        if (currentBet > 0) {
            // Player lost
            const lossAmount = currentBet;
            showResultPopup(false, crashPoint, lossAmount);
        } else {
            // Just watching, no bet
            setTimeout(() => {
                crashMessage.classList.remove('show');
            }, 2000);
        }
    }

    function showResultPopup(won, multiplierValue, amount) {
        // Create popup element
        const popup = document.createElement('div');
        popup.className = 'result-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${won ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : 'linear-gradient(135deg, #c0392b, #e74c3c)'};
            padding: 30px 50px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            z-index: 1000;
            text-align: center;
            animation: popupAppear 0.3s ease;
            color: white;
        `;

        const title = document.createElement('h2');
        title.style.cssText = 'margin: 0 0 15px 0; font-size: 2rem;';
        title.textContent = won ? '🎉 CASHED OUT!' : '💥 CRASHED!';

        const info = document.createElement('p');
        info.style.cssText = 'margin: 10px 0; font-size: 1.5rem; font-weight: bold;';
        info.textContent = `${multiplierValue.toFixed(2)}x`;

        const result = document.createElement('p');
        result.style.cssText = 'margin: 10px 0; font-size: 1.2rem;';
        if (won) {
            const profit = (amount * multiplierValue) - amount;
            result.textContent = `Won $${profit.toFixed(2)}`;
        } else {
            result.textContent = `Lost $${amount.toFixed(2)}`;
        }

        popup.appendChild(title);
        popup.appendChild(info);
        popup.appendChild(result);
        document.body.appendChild(popup);

        // Auto remove after 3 seconds
        setTimeout(() => {
            popup.style.animation = 'popupDisappear 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(popup);
            }, 300);
        }, 3000);
    }

    let lastFrameTime = 0;

    function gameLoop(timestamp) {
        if (!lastFrameTime) lastFrameTime = timestamp;
        const dt = Math.min(0.05, (timestamp - lastFrameTime) / 1000);
        lastFrameTime = timestamp;

        const now = Date.now();
        const elapsed = Math.max(0, (now - startTime) / 1000);

        // Update multiplier
        multiplier = Math.exp(GROWTH_RATE * elapsed);

        // Check for crash
        if (multiplier >= crashPoint) {
            multiplier = crashPoint;
            gameState = 'crashed';

            multiplierDisplay.textContent = `${crashPoint.toFixed(2)}x`;
            multiplierDisplay.classList.add('crashed');

            createExplosion(rocketX, rocketY);

            // Crash all remaining players
            crashAllPlayers();

            if (currentBet > 0) {
                statusDisplay.textContent = `Crashed! You lost $${currentBet.toFixed(2)}`;
                updateProfit(-currentBet);
                currentBet = 0;
            }

            actionButton.disabled = false;
            const btnText = actionButton.querySelector('.button-text');
            if (btnText) btnText.textContent = 'Place Bet';
            else actionButton.textContent = 'Place Bet';
            actionButton.classList.remove('cashout');
            betAmountInput.disabled = false;
            roundTimer.textContent = 'CRASHED';
            roundTimer.classList.remove('live');

            setTimeout(() => {
                startBettingPhase();
                // Generate new players after starting betting phase
                setTimeout(() => {
                    generateSimulatedPlayers();
                }, 500);
            }, POST_CRASH_DELAY_MS);
            cancelAnimationFrame(animationFrameId);
            return;
        }

        // Update display
        multiplierDisplay.textContent = `${multiplier.toFixed(2)}x`;

        // Auto cashout check
        const autoCashout = parseFloat(autoCashoutInput.value);
        if (!isNaN(autoCashout) && autoCashout > 1 && multiplier >= autoCashout && currentBet > 0) {
            cashOut();
        }

        // Update rocket position
        const currentTime = elapsed;
        const pos = getPointAtTime(currentTime);
        rocketX = pos.x;
        rocketY = pos.y;


        // Calculate rocket angle from world velocity (not screen velocity)
        if (elapsed > 0.01) {
            // Calculate velocity in world space
            const prevTime = Math.max(0, elapsed - 0.016); // Previous frame time
            const prevPos = getPointAtTime(prevTime);
            const currPos = getPointAtTime(elapsed);

            // Use world coordinates for angle calculation
            if (currPos.worldX !== undefined && prevPos.worldX !== undefined) {
                const worldVelX = currPos.worldX - prevPos.worldX;
                const worldVelY = currPos.worldY - prevPos.worldY;

                // Calculate angle from world velocity
                if (worldVelX > 0 || worldVelY > 0) {
                    rocketAngle = Math.atan2(-worldVelY, worldVelX); // Negative Y because screen Y is inverted
                }
            }
        }

        // Update trail
        rocketTrail.push({ x: rocketX, y: rocketY });
        if (rocketTrail.length > MAX_TRAIL_LENGTH) {
            rocketTrail.shift();
        }

        // Update particles
        emitParticles();
        updateParticles(dt);

        // Update rocket
        rocket.update(dt);

        // Update cashout markers
        updateCashoutMarkers(dt);

        // Update shake
        if (rocketShake > 0) {
            rocketShake *= 0.95;
        }

        // Update view scale
        updateViewScale();

        // Render
        ctx.clearRect(0, 0, viewWidth, viewHeight);
        effectsCtx.clearRect(0, 0, viewWidth, viewHeight);

        drawGrid();
        drawTrail();
        drawCashoutMarkers(); // Draw markers before particles
        drawParticles();
        rocket.draw(ctx, rocketX, rocketY, rocketAngle);

        if (currentBet > 0) {
            const buttonText = document.querySelector('.button-text');
            if (buttonText) {
                buttonText.textContent = `Cash Out @ ${multiplier.toFixed(2)}x ($${(currentBet * multiplier).toFixed(2)})`;
            }
        }

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function startGame() {
        gameState = 'in-progress';
        crashPoint = generateCrashPoint();
        startTime = Date.now();
        multiplier = 1.00;
        lastFrameTime = 0; // Reset frame time

        // Reset camera offsets for new game
        cameraOffsetX = 0;
        cameraOffsetY = 0;

        // Reset rocket state - start at bottom-left
        const startPos = getPointAtTime(0);
        rocketX = startPos.x;
        rocketY = startPos.y;
        rocketAngle = -Math.PI / 4; // 45 degree angle for diagonal flight
        rocketShake = 0;

        // Clear particles and trail
        rocketTrail = [];
        flameParticles = [];
        sparkParticles = [];
        smokeParticles = [];
        explosionParticles = [];
        cashoutMarkers = []; // Clear cashout markers for new game

        // Reset view
        currentViewYMax = 2.0;
        currentViewXMax = 3.0;
        targetViewYMax = 2.0;
        targetViewXMax = 3.0;

        // Update UI
        multiplierDisplay.classList.remove('crashed');
        crashMessage.classList.remove('show');
        statusDisplay.textContent = '';
        betAmountInput.disabled = true;
        autoCashoutInput.disabled = true;
        roundTimer.textContent = 'LIVE';
        roundTimer.classList.add('live');

        if (currentBet > 0) {
            actionButton.classList.add('cashout');
            actionButton.disabled = false;
        } else {
            actionButton.disabled = true;
        }

        resizeCanvas();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function cashOut() {
        if (gameState === 'in-progress' && currentBet > 0) {
            const winnings = currentBet * multiplier;
            const profit = winnings - currentBet;
            updateBalance(balance + winnings);
            updateProfit(profit);
            statusDisplay.textContent = `Cashed out @ ${multiplier.toFixed(2)}x! Won $${profit.toFixed(2)}`;

            // Add cashout marker on the graph
            const currentTime = (Date.now() - startTime) / 1000;
            addCashoutMarker('You', multiplier, currentTime);

            // Show win popup
            showResultPopup(true, multiplier, currentBet);

            currentBet = 0;
            actionButton.disabled = true;
            actionButton.classList.remove('cashout');
            const btnText = actionButton.querySelector('.button-text');
            if (btnText) btnText.textContent = 'Place Bet';
        }
    }

    function startBettingPhase() {
        gameState = 'waiting';
        multiplierDisplay.textContent = '1.00x';
        multiplierDisplay.classList.remove('crashed');
        crashMessage.classList.remove('show');
        roundTimer.classList.remove('live');

        // Reset camera for waiting phase
        cameraOffsetX = 0;
        cameraOffsetY = 0;

        // Ensure canvas is sized
        if (!viewWidth || !viewHeight) {
            resizeCanvas();
        }

        // Reset rocket to starting position for waiting state
        const startPos = getPointAtTime(0);
        rocketX = startPos.x;
        rocketY = startPos.y;
        rocketAngle = -Math.PI / 4; // 45 degree angle for diagonal flight
        rocketTrail = [];

        // Clear and redraw with rocket at starting position
        if (ctx && effectsCtx) {
            ctx.clearRect(0, 0, viewWidth, viewHeight);
            effectsCtx.clearRect(0, 0, viewWidth, viewHeight);
            drawGrid();
            rocket.draw(ctx, rocketX, rocketY, rocketAngle);
        }

        statusDisplay.textContent = 'Place your bet for the next round';
        actionButton.disabled = false;
        const btnTextEl = actionButton.querySelector('.button-text');
        if (btnTextEl) btnTextEl.textContent = 'Place Bet';
        else actionButton.textContent = 'Place Bet';
        actionButton.classList.remove('cashout');
        betAmountInput.disabled = false;
        autoCashoutInput.disabled = false;
        currentBet = 0;

        // Start countdown
        let timeLeft = BETTING_COUNTDOWN_MS;
        roundTimer.textContent = `Next: ${(timeLeft / 1000).toFixed(1)}s`;

        // Waiting animation
        let waitingAnimationId;
        const waitingAnimation = () => {
            if (gameState !== 'waiting') {
                cancelAnimationFrame(waitingAnimationId);
                return;
            }

            ctx.clearRect(0, 0, viewWidth, viewHeight);
            effectsCtx.clearRect(0, 0, viewWidth, viewHeight);
            drawGrid();

            // Add subtle idle animation
            const idleOffset = Math.sin(Date.now() * 0.001) * 2;
            rocket.enginePulse += 0.05;
            rocket.windowGlow = 0.3 + Math.sin(rocket.enginePulse) * 0.2;
            rocket.draw(ctx, rocketX, rocketY + idleOffset, rocketAngle);

            waitingAnimationId = requestAnimationFrame(waitingAnimation);
        };
        waitingAnimation();

        if (countdownIntervalId) clearInterval(countdownIntervalId);
        countdownIntervalId = setInterval(() => {
            timeLeft -= 100;
            if (timeLeft <= 0) {
                clearInterval(countdownIntervalId);
                cancelAnimationFrame(waitingAnimationId);
                startGame();
                return;
            }
            roundTimer.textContent = `Next: ${(timeLeft / 1000).toFixed(1)}s`;
        }, 100);
    }

    // Simulated players system
    class SimulatedPlayer {
        constructor(name) {
            this.name = name;
            this.bet = Math.floor(5 + Math.random() * 500);
            this.targetMultiplier = 1.5 + Math.random() * 8;
            this.cashedOut = false;
            this.profit = 0;
            this.element = null;
            this.crashed = false;
        }

        crash() {
            if (!this.cashedOut && !this.crashed) {
                this.crashed = true;
                this.profit = -this.bet;
                this.updateDisplay(true);
            }
        }

        createElement() {
            const div = document.createElement('div');
            div.className = 'player-item playing';
            div.innerHTML = `
                <div>
                    <div class="player-name">${this.name}</div>
                    <div class="player-bet">$${this.bet}</div>
                </div>
                <div class="player-status">
                    <div class="multiplier">Playing...</div>
                </div>
            `;
            this.element = div;
            return div;
        }

        updateDisplay(crashed = false) {
            if (!this.element) return;

            if (crashed) {
                this.element.classList.remove('playing');
                this.element.classList.add('crashed');
                const statusDiv = this.element.querySelector('.player-status');
                statusDiv.innerHTML = `
                    <div class="multiplier">Crashed</div>
                    <div class="profit negative">-$${Math.abs(this.profit).toFixed(2)}</div>
                `;
            } else if (this.cashedOut) {
                this.element.classList.remove('playing');
                this.element.classList.add('cashed-out');
                const statusDiv = this.element.querySelector('.player-status');
                statusDiv.innerHTML = `
                    <div class="multiplier">${multiplier.toFixed(2)}x</div>
                    <div class="profit positive">+$${this.profit.toFixed(2)}</div>
                `;

                // Add cashout animation
                const animation = document.createElement('div');
                animation.className = 'cashout-animation';
                animation.textContent = `+$${this.profit.toFixed(2)}`;
                animation.style.right = '20px';
                animation.style.top = '50%';
                this.element.style.position = 'relative';
                this.element.appendChild(animation);
                setTimeout(() => animation.remove(), 1500);
            }
        }
    }

    const playerNames = [
        'CryptoKing', 'MoonShot', 'DiamondHands', 'RocketMan', 'Lucky777',
        'ProGamer', 'BetMaster', 'CashKing', 'HighRoller', 'SafeBet'
    ];

    let simulatedPlayers = [];

    function generateSimulatedPlayers() {
        const playersList = document.getElementById('players-list');
        playersList.innerHTML = '';
        simulatedPlayers = [];

        const count = 3 + Math.floor(Math.random() * 7);
        const shuffledNames = [...playerNames].sort(() => Math.random() - 0.5);

        for (let i = 0; i < count && i < shuffledNames.length; i++) {
            const player = new SimulatedPlayer(shuffledNames[i]);
            simulatedPlayers.push(player);

            // Add with delay for animation effect
            setTimeout(() => {
                playersList.appendChild(player.createElement());
                updatePlayerStats();
            }, i * 200);
        }
    }

    function updateSimulatedPlayers() {
        if (gameState !== 'in-progress') return;

        simulatedPlayers.forEach(player => {
            if (!player.cashedOut && multiplier >= player.targetMultiplier) {
                player.cashedOut = true;
                player.profit = player.bet * multiplier - player.bet;
                player.updateDisplay();

                // Add cashout marker for this player
                const currentTime = (Date.now() - startTime) / 1000;
                addCashoutMarker(player.name, multiplier, currentTime);
            }
        });
        updatePlayerStats();
    }

    function crashAllPlayers() {
        simulatedPlayers.forEach(player => player.crash());
        updatePlayerStats();
    }

    function updatePlayerStats() {
        const playerCount = document.getElementById('player-count');
        const totalBets = document.getElementById('total-bets');

        playerCount.textContent = simulatedPlayers.length;
        const total = simulatedPlayers.reduce((sum, p) => sum + p.bet, 0);
        totalBets.textContent = total.toFixed(0);
    }

    // Touch/Click event handler
    function handleBetAction(e) {
        if (e) e.preventDefault(); // Prevent double-tap zoom on mobile

        if (gameState === 'waiting') {
            const bet = parseFloat(betAmountInput.value);
            if (bet > 0 && bet <= balance) {
                currentBet = bet;
                updateBalance(balance - bet);
                actionButton.disabled = true;
                statusDisplay.textContent = `Bet of $${bet.toFixed(2)} placed`;
            } else {
                statusDisplay.textContent = 'Invalid bet amount';
            }
        } else if (gameState === 'in-progress') {
            cashOut();
        }
    }

    // Event listeners - support both touch and click
    actionButton.addEventListener('click', handleBetAction);
    actionButton.addEventListener('touchend', handleBetAction);

    window.addEventListener('resize', resizeCanvas);

    // Add multiplier update during game
    setInterval(() => {
        if (gameState === 'in-progress') {
            updateSimulatedPlayers();
        }
    }, 100);

    // Initialize
    createStars();
    updateBalance(1000);
    resizeCanvas();

    // Start first round after delay
    setTimeout(() => {
        generateSimulatedPlayers();
        startBettingPhase();
    }, 1000);

    // Override not needed - handle in the crash event instead
});