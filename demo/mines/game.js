// --- PixiJS Setup ---
const app = new PIXI.Application();
let gameContainerDiv = document.getElementById("game-container");

// Responsive game size
const GAME_WIDTH = Math.min(400, window.innerWidth - 40);
const GAME_HEIGHT = 450; // Extra space for info text

// 图像资源URL - 需要添加炸弹和钻石图像
const BOMB_URL = "https://cdn-icons-png.flaticon.com/512/2133/2133407.png";
const DIAMOND_URL = "https://cdn-icons-png.flaticon.com/512/4213/4213958.png";
let bombTexture, diamondTexture;

// Initialize Pixi App
async function initPixi() {
  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: 0x2a2a3e, // Dark background to match the theme
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  gameContainerDiv.appendChild(app.view); // Append canvas to the container div

  // Hide loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }

  // 加载图像资源
  try {
    await loadAssets();
  } catch (error) {
    console.error('Failed to load assets:', error);
    messageDiv.textContent = 'Failed to load game assets. Please refresh the page.';
    messageDiv.className = 'message-box error';
  }

  console.log("PixiJS Initialized");
}

// 加载游戏所需的资源
async function loadAssets() {
  try {
    // 加载炸弹和钻石图像
    bombTexture = await PIXI.Assets.load(BOMB_URL);
    diamondTexture = await PIXI.Assets.load(DIAMOND_URL);
  } catch (error) {
    console.error('Asset loading error:', error);
    // Fallback to creating colored circles if images fail to load
    bombTexture = createFallbackTexture(0xe74c3c); // Red
    diamondTexture = createFallbackTexture(0x1abc9c); // Teal
  }
}

// Create fallback texture when images fail to load
function createFallbackTexture(color) {
  const graphics = new PIXI.Graphics();
  graphics.circle(32, 32, 30);
  graphics.fill(color);
  return app.renderer.generateTexture(graphics);
}

// --- Game Constants ---
const GRID_SIZE = 5;
const TILE_GAP = 4; // Small gap between tiles
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

const COLOR_HIDDEN = 0xaaaaaa; // Grey
const COLOR_GEM = 0x1abc9c; // Teal/Green
const COLOR_MINE = 0xe74c3c; // Red
const COLOR_REVEALED_MINE = 0xc0392b; // Darker Red
const COLOR_REVEALED_GEM = 0x16a085; // Darker Teal

// --- Game State Variables ---
let numMines = 3;
let mineLocations = new Set(); // Set stores indices of mines
let revealedTiles = new Set(); // Set stores indices of revealed safe tiles
let tiles = []; // Array to hold Pixi Graphics objects for tiles
let tileSprites = []; // 存储图标精灵对象
let isGameOver = true; // Game starts in a 'not playing' state
let isGameStarted = false; // Tracks if a round is active
let currentMultiplier = 1.0;
let gemsFound = 0;

// --- Pixi Containers and Text ---
const gridContainer = new PIXI.Container();
const spriteContainer = new PIXI.Container(); // 用于存放炸弹和钻石精灵
const multiplierText = new PIXI.Text({
  text: "",
  style: { fontSize: 18, fill: 0x333333 },
});
const gemsFoundText = new PIXI.Text({
  text: "",
  style: { fontSize: 18, fill: 0x333333 },
});

// --- DOM Elements ---
const minesInput = document.getElementById("mines-input");
const startButton = document.getElementById("start-button");
const cashoutButton = document.getElementById("cashout-button");
const messageDiv = document.getElementById("message");

// --- Game Logic Functions ---

function createGrid() {
  gridContainer.removeChildren(); // Clear previous grid if any
  spriteContainer.removeChildren(); // 清除之前的精灵
  tiles = []; // Reset tiles array
  tileSprites = []; // 重置精灵数组

  const totalTileWidth = TILE_SIZE * GRID_SIZE + TILE_GAP * (GRID_SIZE - 1);
  const startX = (GAME_WIDTH - totalTileWidth) / 2; // Center the grid

  for (let i = 0; i < TOTAL_TILES; i++) {
    const tile = new PIXI.Graphics();
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;

    // 计算实际方块的宽度和高度（扣除间隙）
    const actualTileWidth = TILE_SIZE - TILE_GAP;
    const actualTileHeight = TILE_SIZE - TILE_GAP;

    tile.rect(0, 0, actualTileWidth, actualTileHeight);
    tile.fill(COLOR_HIDDEN);

    tile.x = startX + col * TILE_SIZE;
    tile.y = row * TILE_SIZE + 50; // Add some top margin within canvas

    // 初始状态下，方块不可点击
    tile.eventMode = "none"; // 默认禁用交互，直到游戏开始
    tile.cursor = "default";
    tile.gridIndex = i; // Store index on the tile object

    tile.on("pointerdown", () => handleTileClick(i));

    // 为每个方格创建一个空的精灵占位符（确保居中）
    const sprite = new PIXI.Sprite();
    sprite.visible = false; // 默认隐藏
    sprite.x = tile.x + actualTileWidth / 2; // 正确居中
    sprite.y = tile.y + actualTileHeight / 2; // 正确居中
    sprite.anchor.set(0.5); // 设置锚点为中心
    sprite.scale.set(0.01); // 初始大小非常小，用于动画效果

    gridContainer.addChild(tile);
    spriteContainer.addChild(sprite);
    tiles.push(tile);
    tileSprites.push(sprite);
  }
  app.stage.addChild(gridContainer);
  app.stage.addChild(spriteContainer);
}

function setupUI() {
  multiplierText.x = 20;
  multiplierText.y = 15;
  gemsFoundText.x = GAME_WIDTH - 120; // Adjust position as needed
  gemsFoundText.y = 15;

  app.stage.addChild(multiplierText);
  app.stage.addChild(gemsFoundText);
  updateUIText(); // Initial text update
}

function updateUIText() {
  if (isGameStarted && !isGameOver) {
    multiplierText.text = `Multiplier: ${currentMultiplier.toFixed(2)}x`;
    gemsFoundText.text = `Gems: ${gemsFound}`;
  } else if (isGameOver && isGameStarted) {
    // Game just ended
    multiplierText.text = `Multiplier: ${currentMultiplier.toFixed(2)}x`; // Show final multiplier
    gemsFoundText.text = `Gems: ${gemsFound}`;
  } else {
    multiplierText.text = "";
    gemsFoundText.text = "";
  }
}

function startGame() {
  numMines = parseInt(minesInput.value);
  if (isNaN(numMines) || numMines < 1 || numMines > 24) {
    messageDiv.textContent = `Please enter a valid number of mines (1-24).`;
    messageDiv.className = 'message-box warning';
    return;
  }

  // Reset game state
  isGameOver = false;
  isGameStarted = true;
  mineLocations.clear();
  revealedTiles.clear();
  currentMultiplier = 1.0;
  gemsFound = 0;

  // Place mines randomly
  while (mineLocations.size < numMines) {
    const randomIndex = Math.floor(Math.random() * TOTAL_TILES);
    mineLocations.add(randomIndex);
  }
  console.log("Mines placed at indices:", Array.from(mineLocations)); // For debugging

  // Reset visual appearance of tiles
  // 添加游戏开始动画
  tiles.forEach((tile, index) => {
    tile.tint = 0xffffff; // Reset tint if used
    tile.fill(COLOR_HIDDEN);
    tile.eventMode = "static"; // 现在启用交互
    tile.cursor = "pointer";

    // 波纹动画效果
    tile.alpha = 0;
    gsap.to(tile, {
      alpha: 1,
      delay: index * 0.02,
      duration: 0.3,
      ease: "power2.out"
    });
  });

  // 重置所有精灵
  tileSprites.forEach((sprite) => {
    sprite.visible = false;
    sprite.scale.set(0.01);
    sprite.alpha = 1;
    sprite.texture = null;
  });

  // Update UI
  messageDiv.textContent = "Game Started! Click a tile.";
  messageDiv.className = 'message-box'; // Reset to default class
  startButton.disabled = true;
  cashoutButton.disabled = true; // Can't cash out before finding a gem
  minesInput.disabled = true;
  updateUIText();
}

function handleTileClick(index) {
  // 确保游戏已经开始
  if (!isGameStarted || isGameOver) {
    return; // 如果游戏未开始或已结束，忽略点击
  }

  // 检查是否已经揭示过该方块
  if (revealedTiles.has(index)) {
    return; // Already revealed as gem
  }

  // 检查该方块是否在游戏结束时已被揭示为地雷
  const tileSprite = tileSprites[index];
  if (tileSprite && tileSprite.visible) {
    return; // Already revealed
  }

  const tile = tiles[index];
  const sprite = tileSprites[index];

  // 计算方块内部可用空间（考虑内边距）
  const actualTileWidth = TILE_SIZE - TILE_GAP;
  const iconSize =
    Math.min(actualTileWidth - ICON_PADDING * 2) / bombTexture.width;

  if (mineLocations.has(index)) {
    // Clicked on a mine!
    tile.fill(COLOR_MINE);

    // 显示炸弹图像并添加动画效果
    sprite.texture = bombTexture;
    sprite.visible = true;

    // 添加震动效果到整个游戏画面
    const shakeTimeline = gsap.timeline();
    shakeTimeline.to(gridContainer, {
      x: "+=10",
      duration: 0.05,
      yoyo: true,
      repeat: 5,
      ease: "power2.inOut"
    });
    shakeTimeline.to(gridContainer, {
      x: 0,
      duration: 0.1
    });

    // 添加爆炸动画效果 - 从小变大并旋转
    const explodeAnimation = gsap.timeline();
    explodeAnimation.to(sprite.scale, {
      x: iconSize * 0.8,
      y: iconSize * 0.8,
      duration: 0.2,
      ease: "back.out(2)",
    });
    explodeAnimation.to(
      sprite,
      {
        rotation: Math.PI * 0.25,
        duration: 0.15,
        ease: "power2.out"
      },
      "-=0.1"
    );
    explodeAnimation.to(
      tile,
      {
        alpha: 0.9,
        duration: 0.3
      },
      "-=0.15"
    );

    gameOver(false); // Player lost
  } else {
    // Clicked on a gem!
    tile.fill(COLOR_GEM);
    revealedTiles.add(index);
    gemsFound++;
    tile.eventMode = "none"; // Disable interaction for this revealed tile
    tile.cursor = "default";

    // 显示钻石图像并添加动画效果
    sprite.texture = diamondTexture;
    sprite.visible = true;

    // 添加发光效果到方块
    const glowTimeline = gsap.timeline();
    glowTimeline.to(tile, {
      tint: 0x00ff00,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });

    // 添加动画效果 - 钻石出现动画
    const gemAnimation = gsap.timeline();
    gemAnimation.fromTo(
      sprite.scale,
      { x: 0, y: 0 },
      {
        x: iconSize * 0.65,
        y: iconSize * 0.65,
        duration: 0.5,
        ease: "elastic.out(1.5, 0.5)",
      }
    );

    // 添加旋转和光亮效果
    gemAnimation.to(
      sprite,
      {
        rotation: Math.PI * 2,
        alpha: 1,
        duration: 0.6,
        ease: "power2.out"
      },
      "-=0.4"
    );

    // 添加粒子效果提示（可选的视觉增强）
    createSparkleEffect(sprite.x, sprite.y);

    // More accurate multiplier calculation based on Stake's formula
    // Multiplier = 0.99 * (25 / (25 - mines)) * (1 / probability_of_safe_tile)
    const remainingTiles = TOTAL_TILES - revealedTiles.size;
    const remainingSafeTiles = (TOTAL_TILES - numMines) - revealedTiles.size;

    if (remainingTiles > 0 && remainingSafeTiles >= 0) {
      // Calculate probability of hitting a safe tile
      const probabilityOfSafe = remainingSafeTiles / remainingTiles;

      // Calculate new multiplier based on gems found
      const houseEdge = 0.99; // 1% house edge
      const riskFactor = TOTAL_TILES / (TOTAL_TILES - numMines);

      // Cumulative multiplier calculation
      if (gemsFound === 1) {
        currentMultiplier = houseEdge * riskFactor;
      } else {
        const incrementalMultiplier = houseEdge / probabilityOfSafe;
        currentMultiplier *= incrementalMultiplier;
      }
    }

    // Enable cashout
    cashoutButton.disabled = false;

    // Check for win (all non-mine tiles revealed)
    if (revealedTiles.size === TOTAL_TILES - numMines) {
      messageDiv.className = 'message-box success';
      gameOver(true); // Player won by revealing all gems
    } else {
      updateUIText(); // Update display
      messageDiv.textContent = `Gem found! ${gemsFound} gems collected. Multiplier: ${currentMultiplier.toFixed(2)}x`;
      messageDiv.className = 'message-box';
    }
  }
}

function cashOut() {
  if (!isGameOver && gemsFound > 0) {
    gameOver(true); // Consider cashing out a "win" for this round
  }
}

function gameOver(isWin) {
  isGameOver = true;
  isGameStarted = false; // 游戏结束标志
  cashoutButton.disabled = true;
  startButton.disabled = false;
  minesInput.disabled = false;

  // 创建用于动画的延迟序列
  const revealDelay = 0.05; // 每个图块动画之间的延迟

  // 计算合适的图标大小
  const actualTileWidth = TILE_SIZE - TILE_GAP;
  const iconSize =
    Math.min(actualTileWidth - ICON_PADDING * 2) / bombTexture.width;

  // Reveal all tiles
  tiles.forEach((tile, index) => {
    tile.eventMode = "none"; // Disable clicks on all tiles
    tile.cursor = "default";
    const sprite = tileSprites[index];

    // 如果这个精灵已经可见（已经点击过的），则跳过
    if (sprite.visible) return;

    // 为每个未显示的图块设置延迟显示动画
    const delay = index * revealDelay;

    if (mineLocations.has(index)) {
      // 这是一个炸弹
      tile.fill(COLOR_REVEALED_MINE);

      // 炸弹动画
      sprite.texture = bombTexture;
      sprite.visible = true;
      sprite.alpha = 0;

      gsap.to(sprite, {
        delay: delay,
        alpha: 1,
        duration: 0.2,
      });

      gsap.to(sprite.scale, {
        delay: delay,
        x: iconSize * 0.6, // 留出内边距
        y: iconSize * 0.6, // 留出内边距
        duration: 0.3,
        ease: "back.out",
      });
    } else if (!revealedTiles.has(index)) {
      // 未揭示的钻石
      tile.fill(COLOR_GEM);

      // 钻石动画
      sprite.texture = diamondTexture;
      sprite.visible = true;
      sprite.alpha = 0;

      gsap.to(sprite, {
        delay: delay,
        alpha: 0.7,
        duration: 0.2,
      });

      gsap.to(sprite.scale, {
        delay: delay,
        x: iconSize * 0.5, // 留出内边距
        y: iconSize * 0.5, // 留出内边距
        duration: 0.3,
        ease: "back.out",
      });
    }
  });

  if (isWin) {
    if (gemsFound === TOTAL_TILES - numMines) {
      messageDiv.textContent = `Perfect! Found all ${gemsFound} gems! Final multiplier: ${currentMultiplier.toFixed(
        2
      )}x`;
      messageDiv.className = 'message-box success';
    } else {
      messageDiv.textContent = `Cashed out! Found ${gemsFound} gems. Final multiplier: ${currentMultiplier.toFixed(
        2
      )}x`;
      messageDiv.className = 'message-box success';
    }
  } else {
    messageDiv.textContent = `Boom! You hit a mine. Game over.`;
    messageDiv.className = 'message-box error';
    currentMultiplier = 0; // Lose everything this round
  }
  updateUIText(); // Update display one last time
}

// --- Initialization ---
async function main() {
  try {
    await initPixi(); // Setup Pixi canvas

    createGrid(); // Create the initial grid visuals
    setupUI(); // Add text elements

    // Setup Event Listeners for HTML buttons
    startButton.addEventListener("click", startGame);
    cashoutButton.addEventListener("click", cashOut);

    // Add input validation
    minesInput.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      if (value > 24) {
        e.target.value = 24;
      } else if (value < 1 && e.target.value !== '') {
        e.target.value = 1;
      }
    });

    // Initial message
    messageDiv.textContent = "Set number of mines and press Start.";
  } catch (error) {
    console.error('Failed to initialize game:', error);
    messageDiv.textContent = 'Failed to initialize game. Please refresh the page.';
    messageDiv.className = 'message-box error';
  }
}

// Handle window resize
window.addEventListener('resize', () => {
  if (app.renderer) {
    const newWidth = Math.min(400, window.innerWidth - 40);
    if (newWidth !== GAME_WIDTH) {
      // Would need to recreate the game with new dimensions
      // For now, just log the change
      console.log('Window resized, game size would need update');
    }
  }
});

// Helper function to create sparkle effect
function createSparkleEffect(x, y) {
  const particleCount = 8;
  for (let i = 0; i < particleCount; i++) {
    const particle = new PIXI.Graphics();
    particle.circle(0, 0, 2);
    particle.fill(0xffd700); // Gold color
    particle.x = x;
    particle.y = y;
    spriteContainer.addChild(particle);

    // Animate particle
    const angle = (Math.PI * 2 * i) / particleCount;
    const distance = 30 + Math.random() * 20;

    gsap.to(particle, {
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance,
      alpha: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        spriteContainer.removeChild(particle);
      }
    });
  }
}

main(); // Run the initialization function
