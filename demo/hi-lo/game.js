// --- Constants ---
const SUITS = ["S", "H", "D", "C"]; // Spades, Hearts, Diamonds, Clubs
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"]; // A是最小，K是最大
const HOUSE_EDGE = 0.01; // 1% house edge (adjust as needed)

// --- Game Settings ---
let soundEnabled = true;
let balance = 1000; // Starting balance
let totalWins = 0;
let totalLosses = 0;
let totalProfit = 0;
let bestWin = 0;

// --- DOM Elements ---
const hashedServerSeedEl = document.getElementById("hashed-server-seed");
const clientSeedInput = document.getElementById("client-seed");
const nonceEl = document.getElementById("nonce");
const startButton = document.getElementById("start-button");
const betButton = document.getElementById("start-bet-btn");
const lowerButton = document.getElementById("lower-button");
const higherButton = document.getElementById("higher-button");
const cashoutButton = document.getElementById("cashout-button");
const skipCardButton = document.getElementById("skip-card-btn");
const betAmountInput = document.getElementById("bet-amount");
const betAmountDisplay = document.getElementById("bet-amount-display");
const halfBetButton = document.getElementById("half-bet");
const doubleBetButton = document.getElementById("double-bet");
const guessControlsEl = document.querySelector(".guess-controls");
const resultMessageEl = document.getElementById("result-message");
const multiplierEl = document.getElementById("multiplier");
const nextPayoutEl = document.getElementById("next-payout");
const currentCardTextEl = document.getElementById("current-card-text");
const higherMultiplierEl = document.getElementById("higher-multiplier");
const lowerMultiplierEl = document.getElementById("lower-multiplier");
const higherProfitEl = document.getElementById("higher-profit");
const lowerProfitEl = document.getElementById("lower-profit");
const totalProfitEl = document.getElementById("total-profit");
const cardHistoryEl = document.querySelector(".card-history");
const pixiContainer = document.getElementById("pixi-canvas-container");
const verifySection = document.querySelector(".provably-fair-verify");
const fairnessToggle = document.querySelector(".fairness-toggle");
const verifyServerSeedEl = document.getElementById("verify-server-seed");
const verifyClientSeedEl = document.getElementById("verify-client-seed");
const verifyNonceEl = document.getElementById("verify-nonce");
const verifyCombinedSeedEl = document.getElementById("verify-combined-seed");
const verifyShuffledDeckEl = document.getElementById("verify-shuffled-deck");

// New elements
const balanceValueEl = document.getElementById("balance-value");
const probHigherEl = document.getElementById("prob-higher");
const probSameEl = document.getElementById("prob-same");
const probLowerEl = document.getElementById("prob-lower");
const soundToggle = document.getElementById("sound-toggle");
const resultOverlay = document.getElementById("result-overlay");
const resultIcon = document.getElementById("result-icon");
const resultText = document.getElementById("result-text");
const resultAmount = document.getElementById("result-amount");
const statWinsEl = document.getElementById("stat-wins");
const statLossesEl = document.getElementById("stat-losses");
const statProfitEl = document.getElementById("stat-profit");
const statBestWinEl = document.getElementById("stat-best-win");

// Auto bet elements
const manualTabEl = document.getElementById("manual-tab");
const autoTabEl = document.getElementById("auto-tab");
const autoBetSectionEl = document.getElementById("auto-bet-section");
const autoBetBtn = document.getElementById("auto-bet-btn");
const betBtnTextEl = document.getElementById("bet-btn-text");
const autoBtnTextEl = document.getElementById("auto-btn-text");
const autoBetCountInput = document.getElementById("auto-bet-count");
const autoStopWinInput = document.getElementById("auto-stop-win");
const autoStopLossInput = document.getElementById("auto-stop-loss");
const autoResetWinInput = document.getElementById("auto-reset-win");
const autoIncreaseLossInput = document.getElementById("auto-increase-loss");

// --- Game State ---
let serverSeed = "";
let hashedServerSeed = "";
let clientSeed = "";
let nonce = 0;
let deck = [];
let shuffledDeck = [];
let deckIndex = 0;
let currentMultiplier = 1.0;
let gameActive = false;
let currentCard = null;
let nextCard = null; // Keep track for animation
let betAmount = 0;
let gameHistory = [];
let skipCount = 0;

// Auto bet state
let autoBetMode = false;
let autoBetActive = false;
let autoBetCount = 0;
let autoBetCurrentRound = 0;
let originalBetAmount = 0;
let autoBetStrategy = 'random'; // 'random', 'high', 'low', 'pattern'

// --- Audio System ---
let audioContext;
try {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (AudioContextClass) {
    audioContext = new AudioContextClass();
  }
} catch (e) {
  console.warn('Web Audio API not supported');
}

function playSound(type) {
  if (!soundEnabled || !audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  const now = audioContext.currentTime;

  switch (type) {
    case 'bet':
      oscillator.frequency.setValueAtTime(400, now);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
      break;

    case 'win':
      oscillator.frequency.setValueAtTime(523, now);
      oscillator.frequency.exponentialRampToValueAtTime(659, now + 0.1);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.2);
      break;

    case 'loss':
      oscillator.frequency.setValueAtTime(200, now);
      oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
      break;

    case 'cashout':
      for (let i = 0; i < 3; i++) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(440 + i * 100, now + i * 0.1);
        gain.gain.setValueAtTime(0.1, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.1);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.1);
      }
      break;

    case 'click':
      oscillator.frequency.setValueAtTime(800, now);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      oscillator.start(now);
      oscillator.stop(now + 0.05);
      break;
  }
}

// --- PixiJS Setup ---
let app;
async function initPixiJS() {
  // 确保容器有正确的尺寸
  const containerWidth = pixiContainer.clientWidth || 180;
  const containerHeight = pixiContainer.clientHeight || 220;

  app = new PIXI.Application({
    width: containerWidth,
    height: containerHeight,
    backgroundColor: 0x131b2b, // Match CSS background
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  pixiContainer.appendChild(app.view);
  app.view.id = "game-canvas"; // Add ID for CSS styling if needed

  cardContainer = new PIXI.Container();
  app.stage.addChild(cardContainer);
}

// Resize listener for Pixi canvas
window.addEventListener("resize", () => {
  if (app && app.renderer) {
    app.renderer.resize(pixiContainer.clientWidth, pixiContainer.clientHeight);
    // 重新定位卡片元素
    if (cardContainer && cardContainer.children.length > 0) {
      // 垂直居中所有卡片
      cardContainer.children.forEach((card) => {
        card.y = (app.renderer.height - CARD_HEIGHT) / 2;
      });
    }
  }
});

let cardContainer;
const CARD_WIDTH = 100;
const CARD_HEIGHT = 140;
const CARD_PADDING = 20;

function getCardCenterX() {
  return app.renderer.width / 2 - CARD_WIDTH / 2;
}

// --- Provably Fair Functions ---

function generateServerSeed() {
  // Generate a random hex string (e.g., 32 chars)
  const array = new Uint8Array(16); // 16 bytes = 32 hex chars
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

function sha256(message) {
  return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
}

// Seeded shuffle function using HMAC-SHA256 for determinism
function seededShuffle(items, seedString) {
  const deck = [...items]; // Clone the array
  const deckSize = deck.length;
  let N = deckSize - 1;

  for (let i = N; i > 0; i--) {
    // Use HMAC-SHA256 to generate pseudo-random bytes based on seed + index
    const hmac = CryptoJS.HmacSHA256(i.toString(), seedString).toString(
      CryptoJS.enc.Hex
    );

    // Extract bytes and convert to a number for the swap index
    // Use first few bytes (e.g., 4 bytes = 8 hex chars = 32 bits)
    const randomBytes = hmac.substring(0, 8);
    const randomInt = parseInt(randomBytes, 16);

    // Get index j within the remaining range [0, i]
    const j = randomInt % (i + 1);

    // Swap elements
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// --- Card Functions ---

function createDeck() {
  const newDeck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      newDeck.push(rank + suit);
    }
  }
  return newDeck;
}

function getCardValue(card) {
  if (!card) return 0;
  const rank = card.slice(0, -1);
  if (/\d/.test(rank)) return parseInt(rank);
  if (rank === "T") return 10;
  if (rank === "J") return 11;
  if (rank === "Q") return 12;
  if (rank === "K") return 13;
  if (rank === "A") return 1; // Ace low (修改为Ace是最小)
  return 0;
}

function getCardSymbol(card) {
  if (!card) return "";
  const rank = card.slice(0, -1);
  if (rank === "T") return "10";
  return rank;
}

function getSuitSymbol(card) {
  if (!card) return "";
  const suit = card.slice(-1);
  return { S: "♠", H: "♥", D: "♦", C: "♣" }[suit];
}

function getSuitColor(card) {
  if (!card) return 0x000000;
  const suit = card.slice(-1);
  return suit === "H" || suit === "D" ? 0xff0000 : 0x000000;
}

function compareCards(card1, card2) {
  const value1 = getCardValue(card1);
  const value2 = getCardValue(card2);
  if (value2 > value1) return "higher";
  if (value2 < value1) return "lower";
  return "same"; // 修改为"same"而不是"equal"，以便与按钮文本匹配
}

// Calculates payout multiplier based on probabilities
function calculateMultiplier(currentCardValue) {
  // 在无限牌组模式下，我们应该考虑每个牌值的概率是相等的
  // 每种牌值(A到K)都有4张牌(4种花色)，总共13种牌值

  // 假设有13种牌值，每种牌值有相同概率
  let higherCount = 0;
  let lowerCount = 0;
  let sameCount = 0;

  // 计算高于、低于和相同的牌值数量
  for (let i = 1; i <= 13; i++) {
    if (i > currentCardValue) higherCount++;
    else if (i < currentCardValue) lowerCount++;
    else sameCount++;
  }

  // 在无限牌组中，每种牌值的概率相同
  const totalValues = 13;
  const winProbHigher = higherCount / totalValues;
  const winProbLower = lowerCount / totalValues;
  const winProbSame = sameCount / totalValues;
  const winProbHigherOrSame = winProbHigher + winProbSame;
  const winProbLowerOrSame = winProbLower + winProbSame;

  // Multiplier = (1 - House Edge) / Probability of Winning
  const multiplierHigherOrSame =
    winProbHigherOrSame > 0 ? (1 - HOUSE_EDGE) / winProbHigherOrSame : 0;
  const multiplierLowerOrSame =
    winProbLowerOrSame > 0 ? (1 - HOUSE_EDGE) / winProbLowerOrSame : 0;

  return {
    higher: parseFloat(multiplierHigherOrSame.toFixed(4)),
    lower: parseFloat(multiplierLowerOrSame.toFixed(4)),
    winProbHigher: winProbHigherOrSame,
    winProbLower: winProbLowerOrSame,
    winProbSame: winProbSame,
  };
}

// Update probability display
function updateProbabilityDisplay(currentCardValue) {
  if (!currentCardValue) {
    probHigherEl.textContent = "46.15%";
    probSameEl.textContent = "7.69%";
    probLowerEl.textContent = "46.15%";
    return;
  }

  let higherCount = 0;
  let lowerCount = 0;
  let sameCount = 0;

  for (let i = 1; i <= 13; i++) {
    if (i > currentCardValue) higherCount++;
    else if (i < currentCardValue) lowerCount++;
    else sameCount++;
  }

  const totalValues = 13;
  const probHigher = ((higherCount / totalValues) * 100).toFixed(2);
  const probLower = ((lowerCount / totalValues) * 100).toFixed(2);
  const probSame = ((sameCount / totalValues) * 100).toFixed(2);

  probHigherEl.textContent = `${probHigher}%`;
  probSameEl.textContent = `${probSame}%`;
  probLowerEl.textContent = `${probLower}%`;
}

// --- PixiJS Drawing Functions ---

function createCardGraphics(cardString, x, y) {
  const card = new PIXI.Container();
  card.position.set(x, y);

  const graphics = new PIXI.Graphics();
  // Card background
  graphics.beginFill(0xffffff); // White background
  graphics.lineStyle(2, 0x333333, 1); // 更粗的边框
  graphics.drawRoundedRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 8); // 更圆的边角
  graphics.endFill();
  card.addChild(graphics);

  // Card Text (Rank and Suit)
  const rank = getCardSymbol(cardString);
  const suitSymbol = getSuitSymbol(cardString);
  const suitColor = getSuitColor(cardString); // Red or Black

  const textStyle = new PIXI.TextStyle({
    fontFamily: "Arial, sans-serif",
    fontSize: 40,
    fontWeight: "bold",
    fill: suitColor,
  });

  const cardText = new PIXI.Text(`${rank}`, textStyle);
  cardText.anchor.set(0.5);
  cardText.x = CARD_WIDTH / 2;
  cardText.y = CARD_HEIGHT / 2 - 10;
  card.addChild(cardText);

  const suitStyle = new PIXI.TextStyle({
    fontFamily: "Arial, sans-serif",
    fontSize: 40,
    fontWeight: "bold",
    fill: suitColor,
  });

  const suitText = new PIXI.Text(suitSymbol, suitStyle);
  suitText.anchor.set(0.5);
  suitText.x = CARD_WIDTH / 2;
  suitText.y = CARD_HEIGHT / 2 + 30;
  card.addChild(suitText);

  // 左上角和右下角的小文本
  const smallTextStyle = new PIXI.TextStyle({
    fontFamily: "Arial, sans-serif",
    fontSize: 14,
    fontWeight: "bold",
    fill: suitColor,
  });

  const topLeftText = new PIXI.Text(`${rank}${suitSymbol}`, smallTextStyle);
  topLeftText.position.set(5, 5);
  card.addChild(topLeftText);

  const bottomRightText = new PIXI.Text(`${rank}${suitSymbol}`, smallTextStyle);
  bottomRightText.anchor.set(1, 1);
  bottomRightText.scale.x *= -1; // Flip text for bottom right effect
  bottomRightText.scale.y *= -1;
  bottomRightText.position.set(CARD_WIDTH - 5, CARD_HEIGHT - 5);
  card.addChild(bottomRightText);

  // 添加红色边框突出显示
  const highlightGraphics = new PIXI.Graphics();
  highlightGraphics.lineStyle(3, 0xff3547, 1);
  highlightGraphics.drawRoundedRect(
    -3,
    -3,
    CARD_WIDTH + 6,
    CARD_HEIGHT + 6,
    10
  );
  card.addChild(highlightGraphics);
  highlightGraphics.visible = false;
  card.highlight = highlightGraphics;

  card.alpha = 0; // Start invisible for fade-in
  cardContainer.addChild(card);
  return card;
}

function createCardBackGraphics(x, y) {
  const card = new PIXI.Container();
  card.position.set(x, y);

  const graphics = new PIXI.Graphics();
  // Card back design
  graphics.beginFill(0x1e2738); // Dark blue back
  graphics.lineStyle(2, 0x2c3952, 1);
  graphics.drawRoundedRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 8);
  graphics.endFill();

  // 改进的卡片背面图案
  graphics.beginFill(0x2c3952, 0.5);
  graphics.drawRoundedRect(5, 5, CARD_WIDTH - 10, CARD_HEIGHT - 10, 5);
  graphics.endFill();

  // 添加交叉图案
  graphics.lineStyle(2, 0x5086fa, 0.8);
  for (let i = 0; i < 5; i++) {
    graphics.moveTo(10, 10 + i * 20);
    graphics.lineTo(CARD_WIDTH - 10, 10 + i * 20);
  }
  for (let i = 0; i < 3; i++) {
    graphics.moveTo(10 + i * 25, 10);
    graphics.lineTo(10 + i * 25, CARD_HEIGHT - 10);
  }

  card.addChild(graphics);
  card.alpha = 0;
  cardContainer.addChild(card);
  return card;
}

// 改进的卡片动画
function animateCardIntro(cardGraphics, delay = 0) {
  cardGraphics.alpha = 0;
  cardGraphics.scale.set(0.9, 0.9);
  gsap.to(cardGraphics, {
    alpha: 1,
    scale: 1,
    duration: 0.4,
    delay: delay,
    ease: "back.out(1.2)",
  });
}

// 改进的卡片翻转动画
function animateCardReveal(oldCardBack, newCardFront) {
  // 使用GSAP实现更流畅的翻转效果
  gsap.to(oldCardBack.scale, {
    x: 0.1,
    duration: 0.3,
    onComplete: () => {
      oldCardBack.alpha = 0;
      newCardFront.scale.x = 0.1;
      newCardFront.alpha = 1;
      gsap.to(newCardFront.scale, {
        x: 1,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    },
  });
}

// 添加历史卡牌到显示区域
function addCardToHistory(card, result, multiplier) {
  // 创建历史记录对象
  const historyItem = { card, result, multiplier };
  gameHistory.push(historyItem);

  // 创建DOM元素显示历史卡牌
  const historyCardEl = document.createElement("div");
  historyCardEl.className = "history-card";

  const resultClass =
    result === "win" ? "history-win" : result === "loss" ? "history-loss" : "";

  const resultText =
    result === "win"
      ? "WIN"
      : result === "loss"
      ? "LOSS"
      : result === "start"
      ? "START"
      : result === "skip"
      ? "SKIP"
      : "";

  historyCardEl.innerHTML = `
    ${
      resultText
        ? `<div class="history-card-result ${resultClass}">${resultText}</div>`
        : ""
    }
    <div class="history-card-symbol">
      ${getCardSymbol(card)}${getSuitSymbol(card)}
    </div>
    <div class="history-card-multiplier">${multiplier}</div>
  `;

  // 添加到历史区域
  cardHistoryEl.prepend(historyCardEl);

  // 只保留最新的10张卡牌
  if (cardHistoryEl.children.length > 10) {
    cardHistoryEl.removeChild(cardHistoryEl.lastChild);
  }
}

// Update balance display
function updateBalance() {
  balanceValueEl.textContent = `$${balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// Update statistics
function updateStatistics() {
  statWinsEl.textContent = totalWins;
  statLossesEl.textContent = totalLosses;
  statProfitEl.textContent = `$${totalProfit.toFixed(2)}`;
  statBestWinEl.textContent = `${bestWin.toFixed(2)}x`;
}

// Show result overlay
function showResultOverlay(isWin, amount) {
  if (isWin) {
    resultIcon.innerHTML = '<i class="fas fa-trophy"></i>';
    resultIcon.className = 'result-icon win';
    resultText.textContent = 'WIN!';
    resultText.style.color = '#44cc11';
    resultAmount.textContent = `+$${amount.toFixed(2)}`;
  } else {
    resultIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
    resultIcon.className = 'result-icon loss';
    resultText.textContent = 'LOSS';
    resultText.style.color = '#ff3547';
    resultAmount.textContent = `-$${amount.toFixed(2)}`;
  }

  resultOverlay.classList.add('show');

  setTimeout(() => {
    resultOverlay.classList.remove('show');
  }, 2000);
}

// --- Game Logic Functions ---

function setupNewGame() {
  serverSeed = generateServerSeed();
  hashedServerSeed = sha256(serverSeed);
  hashedServerSeedEl.textContent = hashedServerSeed;
  clientSeed = clientSeedInput.value;
  nonce = 0;
  deckIndex = 0;
  currentMultiplier = 1.0;
  gameActive = false;
  currentCard = null;
  nextCard = null;
  gameHistory = [];
  skipCount = 0;

  deck = createDeck();
  const seedString = `${serverSeed}-${clientSeed}-${nonce}`;
  shuffledDeck = seededShuffle(deck, seedString);

  // Reset UI
  nonceEl.textContent = nonce;
  multiplierEl.textContent = "1.00";
  nextPayoutEl.textContent = "-";
  currentCardTextEl.textContent = "-";
  resultMessageEl.textContent = "";
  startButton.disabled = false;
  guessControlsEl.style.display = "none";
  verifySection.style.display = "none"; // Hide verification section
  clientSeedInput.disabled = false;

  // 清空历史区域
  cardHistoryEl.innerHTML = "";

  // Clear PixiJS stage
  if (cardContainer) {
    cardContainer.removeChildren();
  }

  // 设置投注金额
  updateBetAmount(0.0);
  updateProbabilityDisplay(null);

  // 重置盈利显示
  higherProfitEl.textContent = "0.00000000";
  lowerProfitEl.textContent = "0.00000000";
  totalProfitEl.textContent = "0.00000000";

  // Update balance
  updateBalance();
  updateStatistics();
}

function startGame() {
  if (gameActive) return;

  // 检查投注金额
  betAmount = parseFloat(betAmountInput.value);
  if (isNaN(betAmount) || betAmount <= 0) {
    alert("请输入有效的投注金额!");
    return;
  }

  if (betAmount > balance) {
    alert("余额不足!");
    return;
  }

  // Deduct bet from balance
  balance -= betAmount;
  updateBalance();

  playSound('bet');

  // Get potentially updated client seed
  clientSeed = clientSeedInput.value || "default-client-seed"; // Use default if empty
  clientSeedInput.disabled = true;
  nonce = 0; // Reset nonce for the initial shuffle

  // 无限牌组模式下，我们只需随机选择一张牌作为初始牌
  const seedString = `${serverSeed}-${clientSeed}-${nonce}`;
  shuffledDeck = seededShuffle(createDeck(), seedString);
  deckIndex = 0;

  currentCard = shuffledDeck[deckIndex];

  // Update UI
  gameActive = true;
  currentMultiplier = 1.0;
  multiplierEl.textContent = currentMultiplier.toFixed(2);
  currentCardTextEl.textContent = currentCard;
  betButton.textContent = "已下注";
  betButton.disabled = true;
  betAmountInput.disabled = true;
  halfBetButton.disabled = true;
  doubleBetButton.disabled = true;

  // Disable quick bet buttons
  document.querySelectorAll('.quick-bet-btn').forEach(btn => {
    btn.disabled = true;
  });

  guessControlsEl.style.display = "flex";
  cashoutButton.disabled = true; // Can't cash out immediately
  nonceEl.textContent = nonce; // Nonce is 0 for the first card reveal

  // Update verification section (only shown at end, but prepare data)
  verifyClientSeedEl.textContent = clientSeed;
  verifyNonceEl.textContent = "0"; // Initial shuffle nonce
  verifyCombinedSeedEl.textContent = seedString;
  verifyShuffledDeckEl.textContent = JSON.stringify(shuffledDeck, null, 2);

  // Update probability display
  updateProbabilityDisplay(getCardValue(currentCard));

  // PixiJS display
  if (cardContainer) {
    cardContainer.removeChildren(); // Clear previous cards
    const currentCardGfx = createCardGraphics(
      currentCard,
      getCardCenterX(),
      (app.renderer.height - CARD_HEIGHT) / 2
    );
    currentCardGfx.highlight.visible = true; // 高亮当前卡片
    animateCardIntro(currentCardGfx);

    // 添加到历史记录
    addCardToHistory(currentCard, "start", "1.00");
  }

  // Calculate and display potential next payout
  updateNextPayout();
}

function makeGuess(guess) {
  if (!gameActive) return;

  // 在无限牌组模式下，我们生成一个新的随机牌
  nonce++;
  nonceEl.textContent = nonce;

  // 使用新的nonce生成下一张牌
  const seedString = `${serverSeed}-${clientSeed}-${nonce}`;
  const nextCardIndex = parseInt(sha256(seedString).substring(0, 8), 16) % 52;
  nextCard = deck[nextCardIndex];

  const comparisonResult = compareCards(currentCard, nextCard);

  // 声明卡片图形变量
  let nextCardGfx = null;
  let cardBackGfx = null;

  // Display the next card visually (reveal animation)
  if (cardContainer && app) {
    // 先移除高亮
    cardContainer.children.forEach((card) => {
      if (card.highlight) card.highlight.visible = false;
    });

    nextCardGfx = createCardGraphics(
      nextCard,
      getCardCenterX(),
      (app.renderer.height - CARD_HEIGHT) / 2
    );
    // Optionally show a card back first then reveal
    cardBackGfx = createCardBackGraphics(
      getCardCenterX(),
      (app.renderer.height - CARD_HEIGHT) / 2
    );
    animateCardIntro(cardBackGfx); // Fade in back first

    // Reveal animation after a short delay
    setTimeout(() => {
      animateCardReveal(cardBackGfx, nextCardGfx);
      nextCardGfx.highlight.visible = true; // 高亮新的当前卡片
    }, 300); // Delay before reveal
  }

  // 根据Stake规则，"Higher"意味着"Higher or Same"，"Lower"意味着"Lower or Same"
  const isWin =
    (guess === "higher" &&
      (comparisonResult === "higher" || comparisonResult === "same")) ||
    (guess === "lower" &&
      (comparisonResult === "lower" || comparisonResult === "same"));

  if (!isWin) {
    // 错误的猜测
    resultMessageEl.textContent = `错误! 牌是 ${nextCard} (${comparisonResult}). 游戏结束.`;
    currentCardTextEl.textContent = `${currentCard} -> ${nextCard}`;
    // 添加到历史记录
    addCardToHistory(nextCard, "loss", "0.00");

    totalLosses++;
    totalProfit -= betAmount;
    updateStatistics();

    playSound('loss');
    showResultOverlay(false, betAmount);

    endGame(false); // 输了
  } else {
    // 正确的猜测
    // 计算基于当前牌值的赔率
    const multipliers = calculateMultiplier(getCardValue(currentCard));

    const wonMultiplier =
      guess === "higher" ? multipliers.higher : multipliers.lower;
    currentMultiplier *= wonMultiplier;

    resultMessageEl.textContent = `正确! 牌是 ${nextCard}. 乘数: ${currentMultiplier.toFixed(
      2
    )}x`;
    multiplierEl.textContent = currentMultiplier.toFixed(2);
    currentCard = nextCard;
    currentCardTextEl.textContent = currentCard; // 更新文本显示
    cashoutButton.disabled = false; // 在第一次正确猜测后启用兑现

    playSound('win');

    // 添加到历史记录
    addCardToHistory(nextCard, "win", wonMultiplier.toFixed(2));

    // Update probability display for new card
    updateProbabilityDisplay(getCardValue(currentCard));

    // 计算并显示潜在的下一次支付
    updateNextPayout();
  }
}

function updateNextPayout() {
  // 在无限牌组模式下，基于当前牌计算赔率
  const multipliers = calculateMultiplier(getCardValue(currentCard));

  // 更新乘数显示
  higherMultiplierEl.textContent = multipliers.higher.toFixed(2);
  lowerMultiplierEl.textContent = multipliers.lower.toFixed(2);

  // 更新潜在盈利显示
  const higherProfit = betAmount * multipliers.higher * currentMultiplier;
  const lowerProfit = betAmount * multipliers.lower * currentMultiplier;
  const totalProfit = betAmount * currentMultiplier;

  higherProfitEl.textContent = higherProfit.toFixed(8);
  lowerProfitEl.textContent = lowerProfit.toFixed(8);
  totalProfitEl.textContent = totalProfit.toFixed(8);

  // 同时更新旧UI元素
  nextPayoutEl.innerHTML = `低: ${(
    currentMultiplier * multipliers.lower
  ).toFixed(2)}x (P:${(multipliers.winProbLower * 100).toFixed(1)}%) | 高: ${(
    currentMultiplier * multipliers.higher
  ).toFixed(2)}x (P:${(multipliers.winProbHigher * 100).toFixed(1)}%)`;
}

function cashOut() {
  if (!gameActive || deckIndex === 0) return; // Can't cash out if game not active or no wins yet

  const winAmount = betAmount * currentMultiplier;
  balance += winAmount;
  totalWins++;
  totalProfit += (winAmount - betAmount);

  if (currentMultiplier > bestWin) {
    bestWin = currentMultiplier;
  }

  updateBalance();
  updateStatistics();

  resultMessageEl.textContent = `Cashed Out! Final Multiplier: ${currentMultiplier.toFixed(
    2
  )}x`;

  playSound('cashout');
  showResultOverlay(true, winAmount - betAmount);

  endGame(true); // Won (by cashing out)
}

function endGame(isWin) {
  gameActive = false;
  startButton.disabled = false;
  betButton.textContent = "BET";
  betButton.disabled = false;
  betAmountInput.disabled = false;
  halfBetButton.disabled = false;
  doubleBetButton.disabled = false;

  // Enable quick bet buttons
  document.querySelectorAll('.quick-bet-btn').forEach(btn => {
    btn.disabled = false;
  });

  guessControlsEl.style.display = "none";
  clientSeedInput.disabled = false; // Allow changing seed for next game

  if (!isWin) {
    multiplierEl.textContent = "LOST";
    nextPayoutEl.textContent = "-";
    // Maybe add a visual loss indication in PixiJS
  }

  // Show verification details
  verifyServerSeedEl.textContent = serverSeed; // Reveal unhashed seed
  verifySection.style.display = "block";

  // Optionally reset Pixi stage slightly later or animate out
  // setTimeout(() => { cardContainer.removeChildren(); }, 2000);
}

// --- UI Helper Functions ---
function updateBetAmount(amount) {
  betAmount = parseFloat(amount);
  betAmountInput.value = betAmount.toFixed(8);
  betAmountDisplay.textContent = `$${betAmount.toFixed(2)}`;

  // 当输入金额变化时更新利润预测
  if (currentCard) {
    updateNextPayout();
  }
}

function skipCard() {
  if (!gameActive) return;

  playSound('click');

  skipCount++;

  // 在无限牌组模式下，我们只是生成一个新的随机牌
  nonce++;
  nonceEl.textContent = nonce;

  // 使用新的nonce生成下一张牌
  const seedString = `${serverSeed}-${clientSeed}-${nonce}`;
  const nextCardIndex = parseInt(sha256(seedString).substring(0, 8), 16) % 52;
  currentCard = deck[nextCardIndex];
  currentCardTextEl.textContent = currentCard;

  // 更新UI
  if (cardContainer) {
    cardContainer.removeChildren();
    const currentCardGfx = createCardGraphics(
      currentCard,
      getCardCenterX(),
      (app.renderer.height - CARD_HEIGHT) / 2
    );
    currentCardGfx.highlight.visible = true;
    animateCardIntro(currentCardGfx);

    // 添加到历史记录，标记为skip
    addCardToHistory(currentCard, "skip", `${currentMultiplier.toFixed(2)}x`);
  }

  // Update probability display
  updateProbabilityDisplay(getCardValue(currentCard));

  // 更新赔率
  updateNextPayout();
}

// Auto Bet Functions
function startAutoBet() {
  if (!autoBetMode || autoBetActive) return;

  autoBetActive = true;
  autoBetCurrentRound = 0;
  autoBetCount = parseInt(autoBetCountInput.value) || 10;
  originalBetAmount = betAmount;

  autoBtnTextEl.textContent = 'STOP AUTO';
  autoBetBtn.style.background = 'linear-gradient(135deg, #ff3547, #ff4d5d)';

  // Start first bet
  executeAutoBet();
}

function stopAutoBet() {
  autoBetActive = false;
  autoBtnTextEl.textContent = 'START AUTO';
  autoBetBtn.style.background = 'linear-gradient(135deg, #44cc11, #5ce61d)';

  // If game is active, allow manual control
  if (gameActive) {
    // Re-enable manual controls
    lowerButton.disabled = false;
    higherButton.disabled = false;
  }
}

function executeAutoBet() {
  if (!autoBetActive || autoBetCurrentRound >= autoBetCount) {
    stopAutoBet();
    return;
  }

  if (!gameActive) {
    // Start new game
    startGame();
    if (!gameActive) {
      stopAutoBet();
      return;
    }

    // Wait and make auto decision
    setTimeout(() => makeAutoBetDecision(), 1000);
  } else {
    makeAutoBetDecision();
  }
}

function makeAutoBetDecision() {
  if (!autoBetActive || !gameActive) return;

  const cardValue = getCardValue(currentCard);
  let decision;

  // Simple strategy based on card value
  if (cardValue <= 3) {
    decision = 'higher'; // Very low card, likely to be higher
  } else if (cardValue >= 11) {
    decision = 'lower'; // Very high card, likely to be lower
  } else if (cardValue === 7) {
    // Middle card, 50/50 chance - random or based on pattern
    decision = Math.random() < 0.5 ? 'higher' : 'lower';
  } else if (cardValue < 7) {
    decision = Math.random() < 0.65 ? 'higher' : 'lower'; // Slight bias to higher
  } else {
    decision = Math.random() < 0.65 ? 'lower' : 'higher'; // Slight bias to lower
  }

  // Simulate decision delay
  setTimeout(() => {
    makeGuess(decision);

    // Check if game ended
    setTimeout(() => {
      if (!gameActive) {
        autoBetCurrentRound++;

        // Check stop conditions
        const lastHistory = gameHistory[gameHistory.length - 1];
        if (lastHistory) {
          if (lastHistory.result === 'win' && autoStopWinInput.checked) {
            stopAutoBet();
            return;
          }
          if (lastHistory.result === 'loss') {
            if (autoStopLossInput.checked) {
              stopAutoBet();
              return;
            }
            // Increase bet on loss
            const increasePercent = parseFloat(autoIncreaseLossInput.value) || 0;
            if (increasePercent > 0) {
              betAmount = betAmount * (1 + increasePercent / 100);
              updateBetAmount(betAmount);
            }
          } else if (lastHistory.result === 'win' && autoResetWinInput.checked) {
            // Reset to original bet
            betAmount = originalBetAmount;
            updateBetAmount(betAmount);
          }
        }

        // Continue with next bet
        setTimeout(() => executeAutoBet(), 500);
      } else {
        // Continue playing current round
        setTimeout(() => makeAutoBetDecision(), 800);
      }
    }, 500);
  }, 500 + Math.random() * 500); // Random delay for more natural play
}

// --- Event Listeners ---
// 原始游戏按钮
startButton.addEventListener("click", startGame);
// 新UI按钮
betButton.addEventListener("click", () => {
  if (!autoBetMode) {
    startGame();
  }
});
autoBetBtn.addEventListener("click", () => {
  if (autoBetActive) {
    stopAutoBet();
  } else {
    startAutoBet();
  }
});
lowerButton.addEventListener("click", () => {
  if (!autoBetActive) makeGuess("lower");
});
higherButton.addEventListener("click", () => {
  if (!autoBetActive) makeGuess("higher");
});
cashoutButton.addEventListener("click", () => {
  if (!autoBetActive) {
    cashOut();
  } else {
    // In auto mode, cashout ends auto betting
    cashOut();
    stopAutoBet();
  }
});
skipCardButton.addEventListener("click", skipCard);

// 投注金额控制
halfBetButton.addEventListener("click", () => {
  updateBetAmount(betAmount / 2);
});

doubleBetButton.addEventListener("click", () => {
  updateBetAmount(betAmount * 2);
});

betAmountInput.addEventListener("input", function () {
  const value = parseFloat(this.value);
  if (!isNaN(value)) {
    betAmount = value;
    betAmountDisplay.textContent = `$${value.toFixed(2)}`;
    updateNextPayout();
  }
});

// Quick bet buttons
document.querySelectorAll('.quick-bet-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const amount = this.dataset.amount;
    if (amount) {
      updateBetAmount(parseFloat(amount));
    }
  });
});

// Max bet button
document.getElementById('max-bet').addEventListener('click', () => {
  updateBetAmount(balance);
});

// Sound toggle
soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggle.classList.toggle('muted', !soundEnabled);
  soundToggle.querySelector('i').className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
  playSound('click');
});

// Fairness toggle
fairnessToggle.addEventListener("click", () => {
  if (verifySection.style.display === "none") {
    verifySection.style.display = "block";
    fairnessToggle.querySelector("i").className = "fas fa-angle-up";
  } else {
    verifySection.style.display = "none";
    fairnessToggle.querySelector("i").className = "fas fa-angle-down";
  }
});

// Mode tabs
manualTabEl.addEventListener('click', () => {
  if (!manualTabEl.classList.contains('active')) {
    manualTabEl.classList.add('active');
    autoTabEl.classList.remove('active');
    autoBetMode = false;
    autoBetSectionEl.style.display = 'none';
    betButton.style.display = 'block';
    autoBetBtn.style.display = 'none';

    // Stop auto bet if active
    if (autoBetActive) {
      stopAutoBet();
    }
  }
});

autoTabEl.addEventListener('click', () => {
  if (!autoTabEl.classList.contains('active')) {
    autoTabEl.classList.add('active');
    manualTabEl.classList.remove('active');
    autoBetMode = true;
    autoBetSectionEl.style.display = 'block';
    betButton.style.display = 'none';
    autoBetBtn.style.display = 'block';
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return; // Don't trigger when typing

  if (gameActive && !autoBetActive) {
    switch(e.key.toLowerCase()) {
      case 'h':
        if (!higherButton.disabled) {
          higherButton.click();
        }
        break;
      case 'l':
        if (!lowerButton.disabled) {
          lowerButton.click();
        }
        break;
      case 'c':
        if (!cashoutButton.disabled) {
          cashoutButton.click();
        }
        break;
      case 's':
        if (!skipCardButton.disabled) {
          skipCardButton.click();
        }
        break;
    }
  } else if (!gameActive && !autoBetMode) {
    if (e.key === ' ') {
      e.preventDefault();
      if (!betButton.disabled) {
        betButton.click();
      }
    }
  }
});

// --- Initial Setup ---
window.onload = async () => {
  // 先初始化PixiJS
  await initPixiJS();

  // 然后设置游戏
  setupNewGame();

  // Install GSAP if you plan to use it for animations
  // You can load it via CDN in your HTML or bundle it
  if (typeof gsap === "undefined") {
    console.warn("GSAP not found. Animations will be basic.");
    // Define dummy gsap functions if not present to avoid errors
    window.gsap = {
      to: (target, vars) => {
        for (const prop in vars) {
          if (prop === "duration" || prop === "delay" || prop === "onComplete")
            continue;
          target[prop] = vars[prop]; // Basic direct assignment
        }
        if (vars.onComplete)
          setTimeout(vars.onComplete, (vars.delay || 0) * 1000);
      },
    };
  }
};