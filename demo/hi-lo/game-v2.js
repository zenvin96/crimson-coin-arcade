// Game Constants
const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const SUITS_SYMBOLS = {
    'spades': '♠',
    'hearts': '♥',
    'diamonds': '♦',
    'clubs': '♣'
};
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_VALUES = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
};

// Game State
let gameState = {
    serverSeed: '',
    hashedServerSeed: '',
    clientSeed: 'my-client-seed',
    nonce: 0,
    deck: [],
    currentCard: null,
    currentMultiplier: 1.0,
    betAmount: 0,
    gameActive: false,
    autoBetActive: false,
    autoBetMode: false,
    balance: 1000,
    history: []
};

// DOM Elements
const elements = {
    // Tabs
    manualTab: document.getElementById('manual-tab'),
    autoTab: document.getElementById('auto-tab'),

    // Inputs
    betAmount: document.getElementById('bet-amount'),
    betConversion: document.getElementById('bet-conversion'),
    clientSeed: document.getElementById('client-seed'),
    serverSeed: document.getElementById('server-seed'),
    nonce: document.getElementById('nonce'),

    // Buttons
    betBtn: document.getElementById('bet-btn'),
    autoBetBtn: document.getElementById('auto-bet-btn'),
    higherBtn: document.getElementById('higher-btn'),
    lowerBtn: document.getElementById('lower-btn'),
    skipBtn: document.getElementById('skip-btn'),
    skipCardBtn: document.getElementById('skip-card-btn'),
    cashoutBtn: document.getElementById('cashout-btn'),
    halfBet: document.getElementById('half-bet'),
    doubleBet: document.getElementById('double-bet'),
    fairnessBtn: document.getElementById('fairness-btn'),
    closeFairness: document.getElementById('close-fairness'),

    // Auto Settings
    autoSettings: document.getElementById('auto-settings'),
    autoBetCount: document.getElementById('auto-bet-count'),
    autoStopWin: document.getElementById('auto-stop-win'),
    autoStopLoss: document.getElementById('auto-stop-loss'),
    autoIncreaseLoss: document.getElementById('auto-increase-loss'),

    // Card Display
    cardsContainer: document.getElementById('cards-container'),
    currentCardWrapper: document.getElementById('current-card-wrapper'),
    currentCard: document.getElementById('current-card'),
    cardRank: document.getElementById('card-rank'),
    cardSuit: document.getElementById('card-suit'),
    cardStatus: document.getElementById('card-status'),

    // Probabilities
    higherProb: document.getElementById('higher-prob'),
    lowerProb: document.getElementById('lower-prob'),

    // Multipliers
    higherMultiplier: document.getElementById('higher-multiplier'),
    lowerMultiplier: document.getElementById('lower-multiplier'),
    currentMultiplier: document.getElementById('current-multiplier'),
    totalMultiplier: document.getElementById('total-multiplier'),
    cashoutMultiplier: document.getElementById('cashout-multiplier'),

    // Profits
    higherProfit: document.getElementById('higher-profit'),
    lowerProfit: document.getElementById('lower-profit'),
    currentProfit: document.getElementById('current-profit'),
    totalProfit: document.getElementById('total-profit'),

    // History
    cardHistory: document.getElementById('card-history'),

    // Modal
    fairnessModal: document.getElementById('fairness-modal')
};

// Initialize
function init() {
    setupEventListeners();
    generateNewSeed();
    updateUI();
}

// Setup Event Listeners
function setupEventListeners() {
    // Tab switching
    elements.manualTab.addEventListener('click', () => switchMode('manual'));
    elements.autoTab.addEventListener('click', () => switchMode('auto'));

    // Betting
    elements.betBtn.addEventListener('click', startGame);
    elements.autoBetBtn.addEventListener('click', toggleAutoBet);
    elements.halfBet.addEventListener('click', () => adjustBet(0.5));
    elements.doubleBet.addEventListener('click', () => adjustBet(2));
    elements.betAmount.addEventListener('input', updateBetDisplay);

    // Game actions
    elements.higherBtn.addEventListener('click', () => makeGuess('higher'));
    elements.lowerBtn.addEventListener('click', () => makeGuess('lower'));
    elements.skipBtn.addEventListener('click', skipCard);
    elements.skipCardBtn.addEventListener('click', skipCard);
    elements.cashoutBtn.addEventListener('click', cashout);

    // Fairness
    elements.fairnessBtn.addEventListener('click', () => {
        elements.fairnessModal.classList.add('active');
    });
    elements.closeFairness.addEventListener('click', () => {
        elements.fairnessModal.classList.remove('active');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

// Switch between Manual and Auto mode
function switchMode(mode) {
    gameState.autoBetMode = mode === 'auto';

    if (mode === 'manual') {
        elements.manualTab.classList.add('active');
        elements.autoTab.classList.remove('active');
        elements.autoSettings.style.display = 'none';
        elements.betBtn.style.display = 'block';
        elements.autoBetBtn.style.display = 'none';

        // Stop auto bet if running
        if (gameState.autoBetActive) {
            stopAutoBet();
        }
    } else {
        elements.autoTab.classList.add('active');
        elements.manualTab.classList.remove('active');
        elements.autoSettings.style.display = 'block';
        elements.betBtn.style.display = 'none';
        elements.autoBetBtn.style.display = 'block';
    }
}

// Keyboard shortcuts
function handleKeyboard(e) {
    if (e.target.tagName === 'INPUT') return;

    if (gameState.gameActive && !gameState.autoBetActive) {
        switch(e.key.toLowerCase()) {
            case 'h':
                if (!elements.higherBtn.disabled) {
                    makeGuess('higher');
                }
                break;
            case 'l':
                if (!elements.lowerBtn.disabled) {
                    makeGuess('lower');
                }
                break;
            case 's':
                if (!elements.skipBtn.disabled) {
                    skipCard();
                }
                break;
            case 'c':
                if (!elements.cashoutBtn.disabled) {
                    cashout();
                }
                break;
        }
    } else if (!gameState.gameActive && !gameState.autoBetMode) {
        if (e.key === ' ') {
            e.preventDefault();
            startGame();
        }
    }
}

// Provably Fair Functions
function generateServerSeed() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function sha256(message) {
    return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
}

function generateNewSeed() {
    gameState.serverSeed = generateServerSeed();
    gameState.hashedServerSeed = sha256(gameState.serverSeed);
    elements.serverSeed.value = gameState.hashedServerSeed;
}

function seededShuffle(items, seedString) {
    const deck = [...items];
    for (let i = deck.length - 1; i > 0; i--) {
        const hmac = CryptoJS.HmacSHA256(i.toString(), seedString).toString(CryptoJS.enc.Hex);
        const randomBytes = hmac.substring(0, 8);
        const randomInt = parseInt(randomBytes, 16);
        const j = randomInt % (i + 1);
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Create deck
function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({ rank, suit });
        }
    }
    return deck;
}

// Get next card using provably fair system
function getNextCard() {
    gameState.nonce++;
    const seedString = `${gameState.serverSeed}-${gameState.clientSeed}-${gameState.nonce}`;
    const deck = createDeck();
    const shuffled = seededShuffle(deck, seedString);
    return shuffled[0];
}

// Calculate probabilities and multipliers
function calculateMultipliers(cardValue) {
    const totalCards = 13;
    let higherCount = 0;
    let lowerCount = 0;
    let sameCount = 1;

    for (let i = 1; i <= 13; i++) {
        if (i > cardValue) higherCount++;
        else if (i < cardValue) lowerCount++;
    }

    // Include same in both calculations (like Stake)
    const higherOrSameProb = (higherCount + sameCount) / totalCards;
    const lowerOrSameProb = (lowerCount + sameCount) / totalCards;

    // Calculate multipliers with house edge
    const houseEdge = 0.01;
    const higherMultiplier = higherOrSameProb > 0 ? (1 - houseEdge) / higherOrSameProb : 0;
    const lowerMultiplier = lowerOrSameProb > 0 ? (1 - houseEdge) / lowerOrSameProb : 0;

    return {
        higher: higherMultiplier,
        lower: lowerMultiplier,
        higherProb: higherOrSameProb * 100,
        lowerProb: lowerOrSameProb * 100
    };
}

// Betting functions
function adjustBet(multiplier) {
    const current = parseFloat(elements.betAmount.value) || 0;
    const newAmount = Math.max(0, current * multiplier);
    elements.betAmount.value = newAmount.toFixed(2);
    updateBetDisplay();
}

function updateBetDisplay() {
    const amount = parseFloat(elements.betAmount.value) || 0;
    gameState.betAmount = amount;

    // Update BTC conversion (simplified)
    const btcRate = 50000; // Example rate
    const btcAmount = amount / btcRate;
    elements.betConversion.textContent = btcAmount.toFixed(8) + ' BTC';

    updateProfitDisplays();
}

// Update profit displays
function updateProfitDisplays() {
    if (!gameState.currentCard) return;

    const cardValue = RANK_VALUES[gameState.currentCard.rank];
    const multipliers = calculateMultipliers(cardValue);

    const higherProfit = gameState.betAmount * multipliers.higher * gameState.currentMultiplier;
    const lowerProfit = gameState.betAmount * multipliers.lower * gameState.currentMultiplier;
    const currentProfit = gameState.betAmount * gameState.currentMultiplier;

    elements.higherProfit.textContent = higherProfit.toFixed(2);
    elements.lowerProfit.textContent = lowerProfit.toFixed(2);
    elements.currentProfit.textContent = currentProfit.toFixed(2);
    elements.totalProfit.textContent = currentProfit.toFixed(2);
}

// Start game
function startGame() {
    if (gameState.gameActive) return;

    const betAmount = parseFloat(elements.betAmount.value) || 0;
    if (betAmount <= 0) {
        alert('Please enter a valid bet amount');
        return;
    }

    if (betAmount > gameState.balance) {
        alert('Insufficient balance');
        return;
    }

    // Reset game state
    gameState.betAmount = betAmount;
    gameState.balance -= betAmount;
    gameState.currentMultiplier = 1.0;
    gameState.nonce = 0;
    gameState.history = [];
    gameState.gameActive = true;
    gameState.clientSeed = elements.clientSeed.value || 'my-client-seed';

    // Generate new seed for this game
    generateNewSeed();

    // Get first card
    gameState.currentCard = getNextCard();

    // Clear history
    elements.cardHistory.innerHTML = '';

    // Clear previous cards from display
    const prevCards = elements.cardsContainer.querySelectorAll('.prev-card');
    prevCards.forEach(card => card.remove());

    // Add start card to history
    addToHistory(gameState.currentCard, 'Start', '1.00×');

    // Update UI
    updateUI();
    showCard(gameState.currentCard);

    // Enable game controls
    elements.higherBtn.disabled = false;
    elements.lowerBtn.disabled = false;
    elements.skipBtn.disabled = false;
    elements.skipCardBtn.disabled = false;
    elements.cashoutBtn.disabled = true; // Can't cashout immediately
    elements.betBtn.disabled = true;
    elements.betAmount.disabled = true;
}

// Make a guess
function makeGuess(guess) {
    if (!gameState.gameActive) return;

    const prevCard = gameState.currentCard;
    const nextCard = getNextCard();

    const prevValue = RANK_VALUES[prevCard.rank];
    const nextValue = RANK_VALUES[nextCard.rank];

    let result;
    if (nextValue > prevValue) result = 'higher';
    else if (nextValue < prevValue) result = 'lower';
    else result = 'same';

    // Check if won (same counts as win for both)
    const won = (guess === 'higher' && (result === 'higher' || result === 'same')) ||
                (guess === 'lower' && (result === 'lower' || result === 'same'));

    if (won) {
        // Calculate multiplier for this round
        const multipliers = calculateMultipliers(prevValue);
        const roundMultiplier = guess === 'higher' ? multipliers.higher : multipliers.lower;
        gameState.currentMultiplier *= roundMultiplier;

        // Update current card
        gameState.currentCard = nextCard;

        // Add to history
        const guessIcon = guess === 'higher' ? '↑' : '↓';
        addToHistory(nextCard, guessIcon, roundMultiplier.toFixed(2) + '×');

        // Move current card to previous position
        moveToPreviousCard(prevCard);

        // Enable cashout after first win
        elements.cashoutBtn.disabled = false;

        // Update UI
        updateUI();
        showCard(nextCard, true); // Show new card with animation

        elements.cardStatus.textContent = `${result === 'same' ? 'Same!' : 'Correct!'} Multiplier: ${gameState.currentMultiplier.toFixed(2)}×`;
    } else {
        // Lost
        gameState.gameActive = false;

        // Add losing card to history
        addToHistory(nextCard, 'LOSS', '0.00×');

        // Move current card to previous position
        moveToPreviousCard(prevCard);

        // Show the losing card
        showCard(nextCard, true);

        elements.cardStatus.textContent = `Lost! The card was ${result}`;

        // End game
        endGame(false);
    }
}

// Skip card
function skipCard() {
    if (!gameState.gameActive) return;

    const prevCard = gameState.currentCard;
    const newCard = getNextCard();
    gameState.currentCard = newCard;

    // Add to history
    addToHistory(newCard, 'Skip', gameState.currentMultiplier.toFixed(2) + '×');

    // Move current card to previous position
    moveToPreviousCard(prevCard);

    // Update UI
    updateUI();
    showCard(newCard, true); // Show new card with animation

    elements.cardStatus.textContent = 'Card skipped';
}

// Cashout
function cashout() {
    if (!gameState.gameActive || gameState.currentMultiplier <= 1) return;

    const winAmount = gameState.betAmount * gameState.currentMultiplier;
    gameState.balance += winAmount;

    elements.cardStatus.textContent = `Cashed out! Won ${winAmount.toFixed(2)}`;

    endGame(true);
}

// End game
function endGame(won) {
    gameState.gameActive = false;

    // Disable game controls
    elements.higherBtn.disabled = true;
    elements.lowerBtn.disabled = true;
    elements.skipBtn.disabled = true;
    elements.skipCardBtn.disabled = true;
    elements.cashoutBtn.disabled = true;

    // Re-enable betting
    elements.betBtn.disabled = false;
    elements.betAmount.disabled = false;

    // Show server seed
    elements.serverSeed.value = gameState.serverSeed;
    elements.nonce.value = gameState.nonce;

    updateUI();
}

// Display functions
function showCard(card, isNewCard = false) {
    elements.cardRank.textContent = card.rank;
    elements.cardSuit.textContent = SUITS_SYMBOLS[card.suit];
    elements.cardSuit.className = `card-suit ${card.suit}`;

    // Add data attribute for corner display
    const cardFace = elements.currentCard.querySelector('.card-face');
    if (cardFace) {
        cardFace.setAttribute('data-rank', card.rank);
    }

    if (isNewCard) {
        // Add slide-in animation for new card
        elements.currentCardWrapper.classList.add('new-card');
        setTimeout(() => {
            elements.currentCardWrapper.classList.remove('new-card');
        }, 500);
    }

    // Add flip animation
    elements.currentCard.classList.add('flipped');
    setTimeout(() => {
        elements.currentCard.classList.remove('flipped');
    }, 10);
}

function moveToPreviousCard(card) {
    // Create a new previous card element
    const prevCardDiv = document.createElement('div');
    prevCardDiv.className = 'prev-card';
    prevCardDiv.innerHTML = `
        <div class="playing-card small">
            <div class="card-face" data-rank="${card.rank}">
                <span class="card-rank">${card.rank}</span>
                <span class="card-suit ${card.suit}">${SUITS_SYMBOLS[card.suit]}</span>
            </div>
        </div>
    `;

    // Insert before current card wrapper
    elements.cardsContainer.insertBefore(prevCardDiv, elements.currentCardWrapper);

    // Remove old previous cards if more than 2
    const prevCards = elements.cardsContainer.querySelectorAll('.prev-card');
    if (prevCards.length > 2) {
        prevCards[0].style.opacity = '0';
        prevCards[0].style.transform = 'translateX(-100px) scale(0.8)';
        setTimeout(() => {
            prevCards[0].remove();
        }, 300);
    }
}

// Add card to history
function addToHistory(card, result, multiplier) {
    const historyCard = document.createElement('div');
    historyCard.className = 'history-card';
    if (result === 'Start') historyCard.classList.add('start-card');

    let resultClass = '';
    let resultText = '';

    if (result === '↑' || result === '↓') {
        resultClass = 'win';
        resultText = 'WIN';
    } else if (result === 'LOSS') {
        resultClass = 'loss';
        resultText = 'LOSS';
    } else if (result === 'Skip') {
        resultText = 'SKIP';
    } else if (result === 'Start') {
        resultText = 'START';
    }

    historyCard.innerHTML = `
        ${resultText ? `<div class="result ${resultClass}">${resultText}</div>` : ''}
        <div class="card-value">${card.rank}</div>
        <div class="card-suit-small ${card.suit}">${SUITS_SYMBOLS[card.suit]}</div>
        <div class="multiplier">${multiplier}</div>
    `;

    // Add to the end (right side) of history
    elements.cardHistory.appendChild(historyCard);

    // Scroll to show the newest card
    elements.cardHistory.scrollLeft = elements.cardHistory.scrollWidth;

    // Keep only last 10 cards (remove from the beginning/left)
    while (elements.cardHistory.children.length > 10) {
        elements.cardHistory.removeChild(elements.cardHistory.firstChild);
    }
}

// Update UI
function updateUI() {
    if (gameState.currentCard) {
        const cardValue = RANK_VALUES[gameState.currentCard.rank];
        const multipliers = calculateMultipliers(cardValue);

        // Update probabilities
        elements.higherProb.textContent = multipliers.higherProb.toFixed(2) + '%';
        elements.lowerProb.textContent = multipliers.lowerProb.toFixed(2) + '%';

        // Update multipliers
        elements.higherMultiplier.textContent = multipliers.higher.toFixed(2) + '×';
        elements.lowerMultiplier.textContent = multipliers.lower.toFixed(2) + '×';
        elements.currentMultiplier.textContent = gameState.currentMultiplier.toFixed(2) + '×';
        elements.totalMultiplier.textContent = gameState.currentMultiplier.toFixed(2) + '×';
        elements.cashoutMultiplier.textContent = `(${gameState.currentMultiplier.toFixed(2)}×)`;

        // Update profits
        updateProfitDisplays();
    }
}

// Auto Bet Functions
let autoBetInterval;
let autoBetCount = 0;
let autoBetOriginalAmount = 0;

function toggleAutoBet() {
    if (gameState.autoBetActive) {
        stopAutoBet();
    } else {
        startAutoBet();
    }
}

function startAutoBet() {
    const betAmount = parseFloat(elements.betAmount.value) || 0;
    if (betAmount <= 0) {
        alert('Please enter a valid bet amount');
        return;
    }

    gameState.autoBetActive = true;
    autoBetCount = 0;
    autoBetOriginalAmount = betAmount;

    elements.autoBetBtn.textContent = 'STOP AUTO';
    elements.autoBetBtn.style.background = '#ff3838';

    runAutoBet();
}

function stopAutoBet() {
    gameState.autoBetActive = false;
    clearTimeout(autoBetInterval);

    elements.autoBetBtn.textContent = 'START AUTO';
    elements.autoBetBtn.style.background = '';

    if (gameState.gameActive) {
        // Re-enable manual controls
        elements.higherBtn.disabled = false;
        elements.lowerBtn.disabled = false;
    }
}

function runAutoBet() {
    if (!gameState.autoBetActive) return;

    const maxBets = parseInt(elements.autoBetCount.value) || 10;
    if (autoBetCount >= maxBets) {
        stopAutoBet();
        return;
    }

    if (!gameState.gameActive) {
        // Start new game
        startGame();
        autoBetCount++;
    }

    // Make automatic decision after delay
    autoBetInterval = setTimeout(() => {
        if (!gameState.gameActive || !gameState.autoBetActive) return;

        const cardValue = RANK_VALUES[gameState.currentCard.rank];
        let decision;

        // Simple strategy
        if (cardValue <= 4) {
            decision = 'higher';
        } else if (cardValue >= 10) {
            decision = 'lower';
        } else {
            // Middle cards - random or alternate
            decision = Math.random() < 0.5 ? 'higher' : 'lower';
        }

        makeGuess(decision);

        // Check if game ended
        setTimeout(() => {
            if (!gameState.gameActive) {
                // Check stop conditions
                const lastWon = gameState.currentMultiplier > 1;

                if (lastWon && elements.autoStopWin.checked) {
                    stopAutoBet();
                    return;
                }

                if (!lastWon) {
                    if (elements.autoStopLoss.checked) {
                        stopAutoBet();
                        return;
                    }

                    // Increase bet on loss
                    const increasePercent = parseFloat(elements.autoIncreaseLoss.value) || 0;
                    if (increasePercent > 0) {
                        const newAmount = gameState.betAmount * (1 + increasePercent / 100);
                        elements.betAmount.value = newAmount.toFixed(2);
                        updateBetDisplay();
                    }
                }

                // Continue with next round
                runAutoBet();
            } else {
                // Continue current game
                runAutoBet();
            }
        }, 500);
    }, 1000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);