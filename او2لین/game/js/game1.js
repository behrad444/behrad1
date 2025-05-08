// تنظیمات بازی
const config = {
    width: window.innerWidth,
    height: window.innerHeight,
    playerSpeed: 5,
    enemySpawnRate: 60,
    starCount: 200,
    powerUpChance: 0.1,
    volume: 1,
    controls: 'both',
    graphics: 'medium'
};

// عناصر DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameContainer = document.getElementById('gameContainer');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const pauseScreen = document.getElementById('pauseScreen');
const howToPlayScreen = document.getElementById('howToPlayScreen');
const settingsScreen = document.getElementById('settingsScreen');
const creditsScreen = document.getElementById('creditsScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const mainMenuBtn = document.getElementById('mainMenuBtn');
const howToPlayBtn = document.getElementById('howToPlayBtn');
const closeHowToPlayBtn = document.getElementById('closeHowToPlayBtn');
const settingsBtn = document.getElementById('settingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const creditsBtn = document.getElementById('creditsBtn');
const closeCreditsBtn = document.getElementById('closeCreditsBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartFromPauseBtn = document.getElementById('restartFromPauseBtn');
const quitToMenuBtn = document.getElementById('quitToMenuBtn');
const pauseBtn = document.getElementById('pauseBtn');
const backBtn = document.getElementById('backBtn');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const healthElement = document.getElementById('healthValue');
const healthBarFill = document.getElementById('healthBarFill');
const finalScoreElement = document.getElementById('finalScore');
const upgradeMenu = document.getElementById('upgradeMenu');
const upgradeBtns = document.querySelectorAll('.upgrade-btn');
const soundVolume = document.getElementById('soundVolume');
const controlsType = document.getElementById('controlsType');
const graphicsQuality = document.getElementById('graphicsQuality');

// متغیرهای بازی
let gameRunning = false;
let gamePaused = false;
let score = 0;
let level = 1;
let playerHealth = 100;
let player = {
    x: config.width / 2,
    y: config.height / 2,
    width: 40,
    height: 60,
    speed: config.playerSpeed,
    color: '#0ff',
    bullets: [],
    lastShot: 0,
    fireRate: 300,
    upgrades: {
        speed: 1,
        fireRate: 1,
        shield: 0
    }
};

let enemies = [];
let stars = [];
let powerUps = [];
let explosions = [];
let keys = {};
let lastEnemySpawn = 0;
let animationId;
let levelUpScore = 1000;
let touchControls = false;
let touchX = 0;
let touchY = 0;

// صداهای بازی
const sounds = {
    shoot: createSound(500, 'square', 0.2, 0.02, 0.2),
    explosion: createSound(100, 'sawtooth', 0.5, 0.3, 0.5),
    hit: createSound(200, 'sine', 0.3, 0, 0.1),
    powerup: createSound(800, 'sine', 0.3, 0.5, 0.3),
    levelup: createSound([800, 1000], 'sine', 0.5, 0.7, 0.5),
    shield: createSound(600, 'sine', 0.2, 0.3, 0.2)
};

// ایجاد صدا با Web Audio API
function createSound(freq, type, vol, attack, release) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = type;
        if (Array.isArray(freq)) {
            oscillator.frequency.setValueAtTime(freq[0], audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(freq[1], audioCtx.currentTime + attack + release);
        } else {
            oscillator.frequency.value = freq;
        }
        
        gainNode.gain.value = 0;
        gainNode.gain.linearRampToValueAtTime(vol * config.volume, audioCtx.currentTime + attack);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + attack + release);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + attack + release + 0.1);
        
        return {
            play: function() {
                createSound(freq, type, vol, attack, release);
            }
        };
    } catch (e) {
        console.log('خطا در ایجاد صدا:', e);
        return { play: function() {} };
    }
}

// پخش صدا
function playSound(type) {
    if (sounds[type] && config.volume > 0) {
        sounds[type].play();
    }
}

// تنظیم اندازه کانواس
function resizeCanvas() {
    config.width = window.innerWidth;
    config.height = window.innerHeight;
    canvas.width = config.width;
    canvas.height = config.height;
    
    if (gameRunning) {
        player.x = Math.min(player.x, config.width - player.width/2);
        player.y = Math.min(player.y, config.height - player.height/2);
    }
}

// ایجاد ستاره‌های پس‌زمینه
function createStars() {
    stars = [];
    const count = config.graphics === 'high' ? 300 : config.graphics === 'medium' ? 200 : 100;
    
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * config.width,
            y: Math.random() * config.height,
            size: Math.random() * (config.graphics === 'high' ? 4 : config.graphics === 'medium' ? 3 : 2) + 1,
            speed: Math.random() * (config.graphics === 'high' ? 3 : 2) + 1,
            alpha: Math.random() * 0.7 + 0.3,
            twinkle: Math.random() > 0.7
        });
    }
}

// رسم ستاره‌ها
function drawStars() {
    const now = Date.now();
    
    stars.forEach(star => {
        // ستاره‌های چشمک‌زن
        if (star.twinkle && config.graphics !== 'low') {
            star.alpha = 0.5 + Math.sin(now * 0.001 + star.x) * 0.4;
        }
        
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
        
        // حرکت ستاره‌ها
        star.y += star.speed;
        if (star.y > config.height) {
            star.y = 0;
            star.x = Math.random() * config.width;
        }
    });
}

// رسم بازیکن
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    
    // بدنه سفینه
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(0, -player.height/2);
    ctx.lineTo(player.width/2, player.height/2);
    ctx.lineTo(-player.width/2, player.height/2);
    ctx.closePath();
    ctx.fill();
    
    // جزئیات سفینه
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // موتور
    const engineSize = 10 + Math.random() * 5;
    ctx.fillStyle = `hsl(${30 + Math.random() * 20}, 100%, 50%)`;
    ctx.beginPath();
    ctx.moveTo(-player.width/4, player.height/2);
    ctx.lineTo(0, player.height/2 + engineSize);
    ctx.lineTo(player.width/4, player.height/2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // محافظ (اگر ارتقا یافته باشد)
    if (player.upgrades.shield > 0) {
        const shieldAlpha = 0.3 + player.upgrades.shield * 0.2;
        ctx.strokeStyle = `rgba(0, 255, 255, ${shieldAlpha})`;
        ctx.lineWidth = 2 + player.upgrades.shield;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.width + 10, 0, Math.PI * 2);
        ctx.stroke();
        
        if (config.graphics !== 'low') {
            ctx.fillStyle = `rgba(0, 255, 255, ${shieldAlpha * 0.3})`;
            ctx.fill();
        }
    }
}

// حرکت بازیکن
function movePlayer() {
    if (touchControls) {
        const dx = touchX - player.x;
        const dy = touchY - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
            player.x += dx * 0.1 * player.upgrades.speed;
            player.y += dy * 0.1 * player.upgrades.speed;
        }
    } else {
        if (keys['ArrowUp'] || keys['w']) {
            player.y -= player.speed * player.upgrades.speed;
        }
        if (keys['ArrowDown'] || keys['s']) {
            player.y += player.speed * player.upgrades.speed;
        }
        if (keys['ArrowLeft'] || keys['a']) {
            player.x -= player.speed * player.upgrades.speed;
        }
        if (keys['ArrowRight'] || keys['d']) {
            player.x += player.speed * player.upgrades.speed;
        }
    }
    
    // محدود کردن حرکت به داخل صفحه
    player.x = Math.max(player.width/2, Math.min(player.x, config.width - player.width/2));
    player.y = Math.max(player.height/2, Math.min(player.y, config.height - player.height/2));
}

// شلیک گلوله
function shoot() {
    const now = Date.now();
    if (now - player.lastShot > player.fireRate / player.upgrades.fireRate) {
        player.bullets.push({
            x: player.x,
            y: player.y - player.height/2,
            width: 3,
            height: 15,
            speed: 10,
            color: '#0ff'
        });
        player.lastShot = now;
        
        playSound('shoot');
    }
}

// رسم گلوله‌ها
function drawBullets() {
    player.bullets.forEach((bullet, index) => {
        // جلوه ویژه برای گلوله‌ها
        if (config.graphics !== 'low') {
            const gradient = ctx.createLinearGradient(
                bullet.x - bullet.width/2, bullet.y,
                bullet.x - bullet.width/2, bullet.y + bullet.height
            );
            gradient.addColorStop(0, bullet.color);
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = bullet.color;
        }
        
        ctx.fillRect(bullet.x - bullet.width/2, bullet.y, bullet.width, bullet.height);
        
        // حرکت گلوله
        bullet.y -= bullet.speed;
        
        // حذف گلوله اگر از صفحه خارج شد
        if (bullet.y < 0) {
            player.bullets.splice(index, 1);
        }
    });
}

// ایجاد دشمن جدید
function spawnEnemy() {
    const now = Date.now();
    if (now - lastEnemySpawn > config.enemySpawnRate * 100 / level) {
        const size = Math.random() * 30 + 20;
        const type = Math.random() > 0.9 ? 'boss' : Math.random() > 0.6 ? 'shooter' : 'basic';
        
        enemies.push({
            x: Math.random() * (config.width - size) + size/2,
            y: -size,
            width: size,
            height: size,
            speed: Math.random() * 2 + 1 + level * 0.2,
            health: type === 'boss' ? 10 + level : type === 'shooter' ? 3 : 1,
            maxHealth: type === 'boss' ? 10 + level : type === 'shooter' ? 3 : 1,
            color: type === 'boss' ? '#f00' : type === 'shooter' ? '#ff0' : '#0f0',
            type: type,
            lastShot: 0,
            bullets: [],
            value: type === 'boss' ? 500 : type === 'shooter' ? 200 : 100,
            hitFlash: 0
        });
        
        lastEnemySpawn = now;
        
        // شانس ایجاد قدرت افزا
        if (Math.random() < config.powerUpChance) {
            spawnPowerUp();
        }
    }
}

// رسم دشمنان
function drawEnemies() {
    enemies.forEach((enemy, eIndex) => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        
        // جلوه چشمک زدن هنگام آسیب
        if (enemy.hitFlash > 0) {
            ctx.fillStyle = '#fff';
            enemy.hitFlash--;
        } else {
            ctx.fillStyle = enemy.color;
        }
        
        // بدنه دشمن
        ctx.beginPath();
        
        if (enemy.type === 'boss') {
            // دشمن بزرگ
            ctx.arc(0, 0, enemy.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // جزئیات
            ctx.fillStyle = '#f88';
            ctx.beginPath();
            ctx.arc(0, 0, enemy.width/3, 0, Math.PI * 2);
            ctx.fill();
            
            // چرخش برای جلوه ویژه
            if (config.graphics !== 'low') {
                ctx.rotate(Date.now() * 0.002);
                ctx.strokeStyle = '#f00';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, enemy.width/2.5, 0, Math.PI * 1.5);
                ctx.stroke();
            }
        } else if (enemy.type === 'shooter') {
            // دشمن تیرانداز
            ctx.moveTo(0, -enemy.height/2);
            ctx.lineTo(enemy.width/2, enemy.height/2);
            ctx.lineTo(-enemy.width/2, enemy.height/2);
            ctx.closePath();
            ctx.fill();
        } else {
            // دشمن معمولی
            ctx.moveTo(0, enemy.height/2);
            ctx.lineTo(enemy.width/2, -enemy.height/2);
            ctx.lineTo(-enemy.width/2, -enemy.height/2);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
        
        // حرکت دشمن
        enemy.y += enemy.speed;
        
        // شلیک دشمن تیرانداز
        if ((enemy.type === 'shooter' || enemy.type === 'boss') && !gamePaused) {
            const now = Date.now();
            if (now - enemy.lastShot > 1000 - level * 50) {
                enemy.bullets.push({
                    x: enemy.x,
                    y: enemy.y + enemy.height/2,
                    width: 5,
                    height: 15,
                    speed: 5 + level * 0.2,
                    color: '#f00'
                });
                enemy.lastShot = now;
            }
        }
        
        // رسم گلوله‌های دشمن
        enemy.bullets.forEach((bullet, bIndex) => {
            if (config.graphics !== 'low') {
                const gradient = ctx.createLinearGradient(
                    bullet.x - bullet.width/2, bullet.y,
                    bullet.x - bullet.width/2, bullet.y + bullet.height
                );
                gradient.addColorStop(0, bullet.color);
                gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = bullet.color;
            }
            
            ctx.fillRect(bullet.x - bullet.width/2, bullet.y, bullet.width, bullet.height);
            
            // حرکت گلوله دشمن
            if (!gamePaused) {
                bullet.y += bullet.speed;
            }
            
            // حذف گلوله اگر از صفحه خارج شد
            if (bullet.y > config.height) {
                enemy.bullets.splice(bIndex, 1);
            }
            
            // تشخیص برخورد گلوله دشمن با بازیکن
            if (
                bullet.x > player.x - player.width/2 &&
                bullet.x < player.x + player.width/2 &&
                bullet.y > player.y - player.height/2 &&
                bullet.y < player.y + player.height/2
            ) {
                takeDamage(10);
                enemy.bullets.splice(bIndex, 1);
                createExplosion(bullet.x, bullet.y, 20);
            }
        });
        
        // حذف دشمن اگر از صفحه خارج شد
        if (enemy.y > config.height + enemy.height) {
            enemies.splice(eIndex, 1);
        }
        
        // نوار سلامتی برای دشمنان بزرگ
        if ((enemy.type === 'boss' || enemy.type === 'shooter') && config.graphics !== 'low') {
            const healthWidth = enemy.width;
            const healthHeight = 5;
            const healthX = enemy.x - healthWidth/2;
            const healthY = enemy.y - enemy.height/2 - 10;
            
            ctx.fillStyle = '#300';
            ctx.fillRect(healthX, healthY, healthWidth, healthHeight);
            
            const healthPercent = enemy.health / enemy.maxHealth;
            const healthGradient = ctx.createLinearGradient(healthX, healthY, healthX + healthWidth, healthY);
            healthGradient.addColorStop(0, '#f00');
            healthGradient.addColorStop(0.5, '#ff0');
            healthGradient.addColorStop(1, '#0f0');
            ctx.fillStyle = healthGradient;
            ctx.fillRect(healthX, healthY, healthWidth * healthPercent, healthHeight);
            
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(healthX, healthY, healthWidth, healthHeight);
        }
    });
}

// ایجاد قدرت افزا
function spawnPowerUp() {
    const types = ['health', 'speed', 'fireRate', 'shield', 'score'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    powerUps.push({
        x: Math.random() * (config.width - 30) + 15,
        y: -30,
        width: 20,
        height: 20,
        speed: 2,
        type: type,
        color: type === 'health' ? '#f00' : 
               type === 'speed' ? '#0f0' : 
               type === 'fireRate' ? '#00f' : 
               type === 'shield' ? '#0ff' : '#ff0',
        rotation: 0
    });
}

// رسم قدرت‌افزاها
function drawPowerUps() {
    powerUps.forEach((powerUp, index) => {
        ctx.save();
        ctx.translate(powerUp.x, powerUp.y);
        
        // چرخش برای جلوه بهتر
        if (config.graphics !== 'low') {
            powerUp.rotation += 0.02;
            ctx.rotate(powerUp.rotation);
        }
        
        // بدنه قدرت‌افزا
        ctx.fillStyle = powerUp.color;
        ctx.beginPath();
        
        if (config.graphics === 'high') {
            // ستاره برای کیفیت بالا
            ctx.moveTo(0, -powerUp.width/2);
            for (let i = 1; i <= 5; i++) {
                const angle = i * Math.PI * 2 / 5 - Math.PI / 2;
                const radius = i % 2 === 0 ? powerUp.width/2 : powerUp.width/4;
                ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            }
            ctx.closePath();
        } else {
            // دایره ساده برای کیفیت پایین
            ctx.arc(0, 0, powerUp.width/2, 0, Math.PI * 2);
        }
        
        ctx.fill();
        
        // جزئیات
        if (config.graphics !== 'low') {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        ctx.restore();
        
        // حرکت قدرت‌افزا
        if (!gamePaused) {
            powerUp.y += powerUp.speed;
        }
        
        // تشخیص جمع‌آوری توسط بازیکن
        if (
            powerUp.x > player.x - player.width/2 &&
            powerUp.x < player.x + player.width/2 &&
            powerUp.y > player.y - player.height/2 &&
            powerUp.y < player.y + player.height/2
        ) {
            collectPowerUp(powerUp.type);
            powerUps.splice(index, 1);
            playSound('powerup');
        }
        
        // حذف اگر از صفحه خارج شد
        if (powerUp.y > config.height + powerUp.height) {
            powerUps.splice(index, 1);
        }
    });
}

// جمع‌آوری قدرت‌افزا
function collectPowerUp(type) {
    let message = '';
    
    switch(type) {
        case 'health':
            playerHealth = Math.min(100, playerHealth + 20);
            healthElement.textContent = playerHealth;
            healthBarFill.style.width = `${playerHealth}%`;
            message = `+20% سلامتی`;
            break;
        case 'speed':
            player.upgrades.speed += 0.2;
            message = `+20% سرعت`;
            break;
        case 'fireRate':
            player.upgrades.fireRate += 0.2;
            message = `+20% آتش`;
            break;
        case 'shield':
            player.upgrades.shield += 1;
            message = `+1 محافظ`;
            break;
        case 'score':
            score += 500;
            scoreElement.textContent = `امتیاز: ${score}`;
            message = `+500 امتیاز`;
            break;
    }
    
    // نمایش پیام قدرت‌افزا
    showMessage(message, player.x, player.y - 50, powerUps.find(p => p.type === type).color);
}

// نمایش پیام
function showMessage(text, x, y, color) {
    if (config.graphics === 'low') return;
    
    const message = {
        text: text,
        x: x,
        y: y,
        color: color || '#fff',
        alpha: 1,
        lifetime: 100
    };
    
    // رسم پیام
    function draw() {
        if (message.lifetime <= 0) return;
        
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = `${message.color.replace(')', `, ${message.alpha})`)}`;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 2;
        
        // متن با سایه
        ctx.strokeText(message.text, message.x, message.y);
        ctx.fillText(message.text, message.x, message.y);
        
        message.y -= 1;
        message.alpha -= 0.01;
        message.lifetime--;
        
        if (message.lifetime > 0) {
            requestAnimationFrame(draw);
        }
    }
    
    draw();
}

// ایجاد انفجار
function createExplosion(x, y, size) {
    if (config.graphics === 'low') return;
    
    explosions.push({
        x: x,
        y: y,
        size: size,
        particles: Array(config.graphics === 'high' ? 30 : 20).fill().map(() => ({
            x: 0,
            y: 0,
            speed: Math.random() * 5 + 2,
            angle: Math.random() * Math.PI * 2,
            size: Math.random() * 3 + 1,
            color: `hsl(${Math.random() * 60}, 100%, 50%)`,
            lifetime: Math.random() * 30 + 20
        })),
        createdAt: Date.now()
    });
    
    playSound('explosion');
}

// رسم انفجارها
function drawExplosions() {
    explosions.forEach((explosion, eIndex) => {
        // جلوه موج انفجار
        if (config.graphics === 'high' && Date.now() - explosion.createdAt < 200) {
            const progress = (Date.now() - explosion.createdAt) / 200;
            const radius = progress * explosion.size * 3;
            const alpha = 1 - progress;
            
            ctx.strokeStyle = `rgba(255, 165, 0, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        explosion.particles.forEach((particle, pIndex) => {
            ctx.fillStyle = particle.color;
            ctx.fillRect(
                explosion.x + particle.x - particle.size/2,
                explosion.y + particle.y - particle.size/2,
                particle.size,
                particle.size
            );
            
            // حرکت ذرات
            if (!gamePaused) {
                particle.x += Math.cos(particle.angle) * particle.speed;
                particle.y += Math.sin(particle.angle) * particle.speed;
                particle.lifetime--;
            }
            
            // حذف ذرات تمام شده
            if (particle.lifetime <= 0) {
                explosion.particles.splice(pIndex, 1);
            }
        });
        
        // حذف انفجار تمام شده
        if (explosion.particles.length === 0) {
            explosions.splice(eIndex, 1);
        }
    });
}

// تشخیص برخورد
function checkCollisions() {
    player.bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (
                bullet.x > enemy.x - enemy.width/2 &&
                bullet.x < enemy.x + enemy.width/2 &&
                bullet.y > enemy.y - enemy.height/2 &&
                bullet.y < enemy.y + enemy.height/2
            ) {
                // کاهش سلامتی دشمن
                enemy.health--;
                enemy.hitFlash = 3;
                
                // حذف گلوله
                player.bullets.splice(bIndex, 1);
                
                // ایجاد انفجار کوچک
                createExplosion(bullet.x, bullet.y, 10);
                
                // اگر دشمن مرد
                if (enemy.health <= 0) {
                    // افزایش امتیاز
                    score += enemy.value;
                    scoreElement.textContent = `امتیاز: ${score}`;
                    
                    // ایجاد انفجار بزرگ
                    createExplosion(enemy.x, enemy.y, enemy.width);
                    
                    // حذف دشمن
                    enemies.splice(eIndex, 1);
                    
                    // بررسی ارتقا سطح
                    checkLevelUp();
                }
                
                return;
            }
        });
    });
    
    // تشخیص برخورد بازیکن با دشمن
    enemies.forEach((enemy, eIndex) => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (player.width + enemy.width) / 2;
        
        if (distance < minDistance) {
            takeDamage(enemy.type === 'boss' ? 30 : enemy.type === 'shooter' ? 20 : 10);
            createExplosion(enemy.x, enemy.y, enemy.width);
            enemies.splice(eIndex, 1);
            
            // اگر دشمن بزرگ بود، امتیاز هم بده
            if (enemy.type === 'boss' || enemy.type === 'shooter') {
                score += enemy.value;
                scoreElement.textContent = `امتیاز: ${score}`;
                checkLevelUp();
            }
        }
    });
}

// دریافت آسیب
function takeDamage(amount) {
    if (player.upgrades.shield > 0) {
        player.upgrades.shield--;
        playSound('shield');
        showMessage('محافظ فعال!', player.x, player.y - 30, '#0ff');
        return;
    }
    
    playerHealth -= amount;
    healthElement.textContent = playerHealth;
    healthBarFill.style.width = `${playerHealth}%`;
    playSound('hit');
    
    // جلوه لرزش هنگام آسیب
    if (config.graphics !== 'low') {
        gameContainer.style.transform = 'translate(5px, 5px)';
        setTimeout(() => {
            gameContainer.style.transform = 'translate(0, 0)';
        }, 100);
    }
    
    // فلش قرمز هنگام آسیب
    canvas.style.boxShadow = '0 0 30px red';
    setTimeout(() => {
        canvas.style.boxShadow = 'none';
    }, 200);
    
    // بررسی پایان بازی
    if (playerHealth <= 0) {
        gameOver();
    }
}

// بررسی ارتقا سطح
function checkLevelUp() {
    if (score >= levelUpScore) {
        level++;
        levelUpScore += level * 1000;
        levelElement.textContent = `سطح: ${level}`;
        showMessage(`سطح ${level} رسیدی!`, config.width/2, 100, '#0ff');
        playSound('levelup');
        
        // نمایش منوی ارتقا
        showUpgradeMenu();
    }
}

// نمایش منوی ارتقا
function showUpgradeMenu() {
    upgradeMenu.style.display = 'flex';
    gameRunning = false;
    gamePaused = true;
}

// انتخاب ارتقا
function selectUpgrade(type) {
    switch(type) {
        case 'speed':
            player.upgrades.speed += 0.3;
            showMessage(`سرعت افزایش یافت!`, player.x, player.y - 30, '#0f0');
            break;
        case 'fireRate':
            player.upgrades.fireRate += 0.3;
            showMessage(`سرعت شلیک افزایش یافت!`, player.x, player.y - 30, '#00f');
            break;
        case 'shield':
            player.upgrades.shield += 1;
            showMessage(`محافظ جدید دریافت کردی!`, player.x, player.y - 30, '#0ff');
            break;
    }
    
    upgradeMenu.style.display = 'none';
    gameRunning = true;
    gamePaused = false;
    playSound('powerup');
    gameLoop();
}

// حلقه اصلی بازی
function gameLoop() {
    if (!gameRunning || gamePaused) return;
    
    ctx.clearRect(0, 0, config.width, config.height);
    
    drawStars();
    drawBullets();
    drawEnemies();
    drawPowerUps();
    drawExplosions();
    drawPlayer();
    
    movePlayer();
    spawnEnemy();
    checkCollisions();
    
    animationId = requestAnimationFrame(gameLoop);
}

// شروع بازی
function startGame() {
    score = 0;
    level = 1;
    playerHealth = 100;
    player = {
        x: config.width / 2,
        y: config.height / 2,
        width: 40,
        height: 60,
        speed: config.playerSpeed,
        color: '#0ff',
        bullets: [],
        lastShot: 0,
        fireRate: 300,
        upgrades: {
            speed: 1,
            fireRate: 1,
            shield: 0
        }
    };
    
    enemies = [];
    powerUps = [];
    explosions = [];
    levelUpScore = 1000;
    
    scoreElement.textContent = `امتیاز: ${score}`;
    levelElement.textContent = `سطح: ${level}`;
    healthElement.textContent = playerHealth;
    healthBarFill.style.width = `${playerHealth}%`;
    
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    pauseScreen.style.display = 'none';
    howToPlayScreen.style.display = 'none';
    settingsScreen.style.display = 'none';
    creditsScreen.style.display = 'none';
    upgradeMenu.style.display = 'none';
    pauseBtn.style.display = 'block';
    
    gameRunning = true;
    gamePaused = false;
    gameLoop();
}

// مکث بازی
function pauseGame() {
    if (!gameRunning) return;
    
    gamePaused = true;
    pauseScreen.style.display = 'flex';
    pauseBtn.style.display = 'none';
}

// ادامه بازی
function resumeGame() {
    gamePaused = false;
    pauseScreen.style.display = 'none';
    pauseBtn.style.display = 'block';
    gameLoop();
}

// پایان بازی
function gameOver() {
    gameRunning = false;
    gamePaused = false;
    cancelAnimationFrame(animationId);
    
    finalScoreElement.textContent = `امتیاز نهایی: ${score}`;
    gameOverScreen.style.display = 'flex';
    pauseBtn.style.display = 'none';
}

// بازگشت به منوی اصلی
function returnToMainMenu() {
    gameRunning = false;
    gamePaused = false;
    cancelAnimationFrame(animationId);
    
    startScreen.style.display = 'flex';
    gameOverScreen.style.display = 'none';
    pauseScreen.style.display = 'none';
    howToPlayScreen.style.display = 'none';
    settingsScreen.style.display = 'none';
    creditsScreen.style.display = 'none';
    upgradeMenu.style.display = 'none';
    pauseBtn.style.display = 'none';
}

// ذخیره تنظیمات
function saveSettings() {
    config.volume = parseFloat(soundVolume.value);
    config.controls = controlsType.value;
    config.graphics = graphicsQuality.value;
    
    // اعمال تنظیمات کنترل
    touchControls = config.controls === 'touch' || (config.controls === 'both' && 'ontouchstart' in window);
    
    // اعمال تنظیمات گرافیک
    createStars();
    
    // بستن صفحه تنظیمات
    settingsScreen.style.display = 'none';
    
    // نمایش پیام تأیید
    alert('تنظیمات با موفقیت ذخیره شد!');
}

// رویدادهای صفحه‌کلید
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // فاصله برای شلیک
    if (e.key === ' ' && gameRunning && !gamePaused) {
        shoot();
    }
    
    // P برای مکث
    if (e.key === 'p' && gameRunning) {
        if (gamePaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    }
    
    // ESC برای بازگشت
    if (e.key === 'Escape') {
        if (howToPlayScreen.style.display === 'flex') {
            howToPlayScreen.style.display = 'none';
        } else if (settingsScreen.style.display === 'flex') {
            settingsScreen.style.display = 'none';
        } else if (creditsScreen.style.display === 'flex') {
            creditsScreen.style.display = 'none';
        } else if (gameRunning && !gamePaused) {
            pauseGame();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// رویدادهای ماوس/لمس
canvas.addEventListener('mousedown', () => {
    if (gameRunning && !gamePaused) {
        shoot();
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameRunning && !gamePaused) {
        shoot();
    }
    
    // کنترل لمسی
    if (touchControls) {
        const touch = e.touches[0];
        touchX = touch.clientX;
        touchY = touch.clientY;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (touchControls) {
        const touch = e.touches[0];
        touchX = touch.clientX;
        touchY = touch.clientY;
    }
});

// دکمه‌های رابط کاربری
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
mainMenuBtn.addEventListener('click', returnToMainMenu);
howToPlayBtn.addEventListener('click', () => {
    howToPlayScreen.style.display = 'flex';
});
closeHowToPlayBtn.addEventListener('click', () => {
    howToPlayScreen.style.display = 'none';
});
settingsBtn.addEventListener('click', () => {
    // بارگذاری تنظیمات فعلی
    soundVolume.value = config.volume;
    controlsType.value = config.controls;
    graphicsQuality.value = config.graphics;
    
    settingsScreen.style.display = 'flex';
});
saveSettingsBtn.addEventListener('click', saveSettings);
closeSettingsBtn.addEventListener('click', () => {
    settingsScreen.style.display = 'none';
});
creditsBtn.addEventListener('click', () => {
    creditsScreen.style.display = 'flex';
});
closeCreditsBtn.addEventListener('click', () => {
    creditsScreen.style.display = 'none';
});
resumeBtn.addEventListener('click', resumeGame);
restartFromPauseBtn.addEventListener('click', startGame);
quitToMenuBtn.addEventListener('click', returnToMainMenu);
pauseBtn.addEventListener('click', pauseGame);
backBtn.addEventListener('click', () => {
    if (gameRunning) {
        if (gamePaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    } else {
        if (howToPlayScreen.style.display === 'flex') {
            howToPlayScreen.style.display = 'none';
        } else if (settingsScreen.style.display === 'flex') {
            settingsScreen.style.display = 'none';
        } else if (creditsScreen.style.display === 'flex') {
            creditsScreen.style.display = 'none';
        } else {
            returnToMainMenu();
        }
    }
});

// دکمه‌های ارتقا
upgradeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        selectUpgrade(btn.dataset.upgrade);
    });
});

// تنظیمات اولیه
resizeCanvas();
createStars();
window.addEventListener('resize', resizeCanvas);

// تشخیص کنترل لمسی
touchControls = config.controls === 'touch' || (config.controls === 'both' && 'ontouchstart' in window);