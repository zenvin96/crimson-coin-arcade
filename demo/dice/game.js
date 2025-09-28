document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  // Manual Controls
  const betAmountInput = document.getElementById("betAmount");
  const profitOnWinInput = document.getElementById("profitOnWin");
  const betButton = document.getElementById("betButton");

  // Auto Controls
  const autoBetAmountInput = document.getElementById("autoBetAmount");
  const numberOfBetsInput = document.getElementById("numberOfBets");
  const onWinActionSelect = document.getElementById("onWinAction");
  const onWinValueInput = document.getElementById("onWinValue");
  const onLossActionSelect = document.getElementById("onLossAction");
  const onLossValueInput = document.getElementById("onLossValue");
  const stopOnProfitInput = document.getElementById("stopOnProfit");
  const stopOnLossInput = document.getElementById("stopOnLoss");
  const startAutoButton = document.getElementById("startAutoButton");
  const stopAutoButton = document.getElementById("stopAutoButton");

  // Tabs
  const manualTab = document.getElementById("manualTab");
  const autoTab = document.getElementById("autoTab");
  const manualControls = document.getElementById("manualControls");
  const autoControls = document.getElementById("autoControls");

  // Game Elements
  const sliderThumb = document.getElementById("sliderThumb");
  const winChanceDisplay = document.getElementById("winChanceDisplay");
  const multiplierDisplay = document.getElementById("multiplierDisplay");
  const rollToggleButton = document.getElementById("rollToggle");
  const rollTargetDisplay = document.getElementById("rollTargetDisplay");
  const resultDisplay = document.getElementById("resultDisplay");
  const diceContainer = document.getElementById("diceContainer");
  const historyBar = document.querySelector(".history-bar");
  const diceTemplate = document.getElementById("diceTemplate");
  const historyItemTemplate = document.getElementById("historyItemTemplate");
  const userBalanceElement = document.getElementById("userBalance");

  // --- Game State ---
  let betAmount = parseFloat(betAmountInput.value) || 0;
  let winChance = 49.5; // Default win chance
  let isRollOver = true; // Start with Roll Over
  let multiplier = 0;
  let rollTarget = 50.5; // Default roll target
  let sliderPosition = 50.5; // Default slider position (out of 100)
  let rollHistory = []; // Store recent rolls
  const maxHistoryItems = 10; // Maximum number of history items to display
  let currentDice = null; // 记录当前页面上的骰子元素
  let userBalance = 1000.0; // 初始余额1000 USD

  // 自动投注状态
  let isAutoBetting = false;
  let autoBetAmount = 0;
  let baseBetAmount = 0; // 基础投注金额
  let currentAutoBetCount = 0;
  let maxAutoBets = 10;
  let totalProfit = 0;
  let lastBetResult = null; // 'win' 或 'loss'
  let autoBetTimeout = null;
  let betSpeed = "normal"; // 投注速度: slow, normal, fast, turbo
  let speedValues = {
    slow: 2000,
    normal: 1000,
    fast: 300,
    turbo: 50,
  };

  // --- Game Logic Functions ---
  function updateSliderPosition(position) {
    // Clamp position between 0.5 and 99.5
    position = Math.max(0.5, Math.min(99.5, position));
    sliderPosition = position;

    // Update slider thumb position
    const percent = position / 100;
    sliderThumb.style.left = `${percent * 100}%`;

    // Update slider fill colors
    document.querySelector(".slider-fill-red").style.width = `${
      percent * 100
    }%`;
    document.querySelector(".slider-fill-green").style.width = `${
      (1 - percent) * 100
    }%`;

    // Update vertical line position
    document.querySelector(".vertical-line").style.left = `${percent * 100}%`;

    updateGameParameters();
  }

  function updateGameParameters() {
    if (isRollOver) {
      rollTarget = sliderPosition;
      winChance = 100 - sliderPosition;
    } else {
      rollTarget = sliderPosition;
      winChance = sliderPosition;
    }

    // Stake uses 5% house edge (0.95)
    multiplier = (100 / winChance) * 0.975;

    const profit = betAmount * (multiplier - 1);

    // Update UI
    rollTargetDisplay.textContent = rollTarget.toFixed(2);
    winChanceDisplay.textContent = winChance.toFixed(4);
    multiplierDisplay.textContent = multiplier.toFixed(4);
    profitOnWinInput.value = profit > 0 ? profit.toFixed(8) : "0.00000000";

    // 禁用投注按钮如果余额不足
    betButton.disabled = betAmount > userBalance;

    // 更新自动投注的状态
    checkAutoButtonState();
  }

  function updateBalance(amount) {
    userBalance += amount;
    userBalanceElement.textContent = userBalance.toFixed(2) + " USD";

    // 根据余额变化显示不同颜色
    if (amount > 0) {
      userBalanceElement.style.color = "#2ECC71"; // 绿色
    } else if (amount < 0) {
      userBalanceElement.style.color = "#E74C3C"; // 红色
    }

    // 一段时间后恢复正常颜色
    setTimeout(() => {
      userBalanceElement.style.color = "#2ECC71";
    }, 1000);

    // 禁用投注按钮如果余额不足
    betButton.disabled = betAmount > userBalance;

    // 更新自动投注的状态
    checkAutoButtonState();
  }

  function addToHistory(rollResult, isWin) {
    // Clone the history item template
    const historyItem = historyItemTemplate.content
      .cloneNode(true)
      .querySelector(".history-item");
    const historyValue = historyItem.querySelector(".history-value");

    // Set value and class based on win/loss
    historyValue.textContent = rollResult;
    historyItem.classList.add(isWin ? "win" : "loss");

    // Add highlight class for animation
    historyItem.classList.add("highlight");

    // Add to the beginning of history bar
    historyBar.prepend(historyItem);

    // Store in history array
    rollHistory.unshift({ result: rollResult, isWin });

    // Limit number of visible history items
    if (historyBar.children.length > maxHistoryItems) {
      historyBar.removeChild(historyBar.lastChild);
    }

    // Remove highlight after animation
    setTimeout(() => {
      historyItem.classList.remove("highlight");
    }, 1000);
  }

  function createDice(rollResult) {
    // 计算骰子在滑块上的最终位置
    const sliderTrack = document.querySelector(".slider-track");
    const sliderRect = sliderTrack.getBoundingClientRect();
    const containerRect = diceContainer.getBoundingClientRect();

    // Calculate final position (position on slider based on roll result)
    const percentPosition = parseFloat(rollResult) / 100;
    const finalLeft =
      sliderRect.width * percentPosition +
      (sliderRect.left - containerRect.left);
    const finalTop = sliderRect.top - containerRect.top - 50;

    // Determine if win or loss
    const isWin = isRollOver
      ? parseFloat(rollResult) > rollTarget
      : parseFloat(rollResult) < rollTarget;

    // 极速模式下减少动画效果
    const isTurboMode = isAutoBetting && betSpeed === "turbo";

    // 如果页面上已经有骰子，就更新它
    if (currentDice) {
      const diceValue = currentDice.querySelector(".dice-value");

      // 更新数值
      diceValue.textContent = rollResult;

      // 移除之前的输赢样式
      currentDice.classList.remove("win", "loss");

      // 添加当前的输赢样式
      currentDice.classList.add(isWin ? "win" : "loss");

      // 骰子动画滑动到新位置 (极速模式下无过渡动画)
      if (isTurboMode) {
        currentDice.style.transition = "none";
      } else {
        currentDice.style.transition = "left 0.5s ease, top 0.5s ease";
      }
      currentDice.style.left = `${finalLeft}px`;
      currentDice.style.top = `${finalTop}px`;
    } else {
      // 如果没有骰子，就创建一个新的
      const dice = diceTemplate.content.cloneNode(true).querySelector(".dice");
      const diceValue = dice.querySelector(".dice-value");

      // 设置初始位置
      dice.style.top = `${finalTop}px`;
      dice.style.left = `${finalLeft}px`;
      dice.style.transform = "translate(-50%, -50%)";

      // 设置数值
      diceValue.textContent = rollResult;

      // 添加输赢样式
      dice.classList.add(isWin ? "win" : "loss");

      // 添加到容器
      diceContainer.appendChild(dice);

      // 保存骰子引用
      currentDice = dice;

      // 极速模式下直接显示，否则使用淡入动画
      if (isTurboMode) {
        currentDice.classList.add("visible");
      } else {
        setTimeout(() => {
          currentDice.classList.add("visible");
        }, 100);
      }
    }

    // 计算赢/输的金额
    let profit = 0;
    let currentBetAmount = isAutoBetting ? autoBetAmount : betAmount;

    // 更新结果显示
    if (isWin) {
      // 计算赢得的金额
      const winAmount = currentBetAmount * multiplier;
      profit = winAmount - currentBetAmount;

      // 更新用户余额
      updateBalance(profit);

      lastBetResult = "win";
    } else {
      // 输钱
      profit = -currentBetAmount;
      updateBalance(profit);

      lastBetResult = "loss";
    }

    // 更新结果显示和历史记录
    updateResults(rollResult, isWin, Math.abs(profit));

    // 更新自动投注状态
    if (isAutoBetting) {
      totalProfit += profit;
      currentAutoBetCount++;

      // 检查是否需要停止自动投注
      const stopOnProfit = parseFloat(stopOnProfitInput.value) || 0;
      const stopOnLoss = parseFloat(stopOnLossInput.value) || 0;

      let shouldStop = false;

      // 检查停止条件
      if (stopOnProfit > 0 && totalProfit >= stopOnProfit) {
        resultDisplay.textContent += " | 达到目标盈利，自动投注停止";
        shouldStop = true;
      } else if (stopOnLoss > 0 && -totalProfit >= stopOnLoss) {
        resultDisplay.textContent += " | 达到亏损限制，自动投注停止";
        shouldStop = true;
      } else if (currentAutoBetCount >= maxAutoBets) {
        resultDisplay.textContent += " | 完成设定次数，自动投注停止";
        shouldStop = true;
      } else if (userBalance <= 0 || userBalance < autoBetAmount) {
        resultDisplay.textContent += " | 余额不足，自动投注停止";
        shouldStop = true;
      }

      if (shouldStop) {
        stopAutoBetting();
      } else {
        // 根据策略调整下一次投注金额
        adjustNextBetAmount();

        // 继续下一次自动投注
        autoBetTimeout = setTimeout(() => {
          placeBet(true);
        }, speedValues[betSpeed]);
      }
    } else {
      // 重新启用手动投注按钮
      betButton.disabled = betAmount > userBalance;
    }
  }

  function placeBet(isAuto = false) {
    let currentBetAmount = isAuto ? autoBetAmount : betAmount;

    if (currentBetAmount <= 0) {
      resultDisplay.textContent = "请输入有效的投注金额";
      return;
    }

    if (currentBetAmount > userBalance) {
      resultDisplay.textContent = "余额不足";
      resultDisplay.style.color = "#E74C3C";

      if (isAuto) {
        stopAutoBetting();
      }

      return;
    }

    // Disable buttons during animation
    if (!isAuto) {
      betButton.disabled = true;
    } else {
      startAutoButton.disabled = true;
      stopAutoButton.disabled = false;
    }

    resultDisplay.textContent = "投注中...";
    resultDisplay.style.color = "#eee";

    // 使用加密安全的随机数源生成结果
    // 创建一个32位的随机数组
    const array = new Uint32Array(1);
    // 用Web Crypto API填充
    window.crypto.getRandomValues(array);
    // 将32位整数转换为0-100之间的浮点数
    const rollResult = ((array[0] / 4294967295) * 100).toFixed(2);

    // Start dice animation
    setTimeout(() => {
      createDice(rollResult);
    }, 300);
  }

  function startAutoBetting() {
    if (isAutoBetting) return;

    // 获取自动投注参数
    autoBetAmount = parseFloat(autoBetAmountInput.value) || 0;
    baseBetAmount = autoBetAmount;
    maxAutoBets = parseInt(numberOfBetsInput.value) || 10;

    if (autoBetAmount <= 0) {
      resultDisplay.textContent = "请输入有效的投注金额";
      resultDisplay.style.color = "#E74C3C";
      return;
    }

    if (autoBetAmount > userBalance) {
      resultDisplay.textContent = "余额不足";
      resultDisplay.style.color = "#E74C3C";
      return;
    }

    // 重置自动投注状态
    isAutoBetting = true;
    currentAutoBetCount = 0;
    totalProfit = 0;
    lastBetResult = null;

    // 更新UI
    startAutoButton.disabled = true;
    stopAutoButton.disabled = false;

    // 开始第一次投注
    placeBet(true);
  }

  function stopAutoBetting() {
    if (!isAutoBetting) return;

    isAutoBetting = false;

    // 清除定时器
    if (autoBetTimeout) {
      clearTimeout(autoBetTimeout);
      autoBetTimeout = null;
    }

    // 更新UI
    startAutoButton.disabled = false;
    stopAutoButton.disabled = true;

    // 显示最终结果
    if (totalProfit !== 0) {
      const message =
        totalProfit > 0
          ? `自动投注完成，总盈利: +${totalProfit.toFixed(2)} USD`
          : `自动投注完成，总亏损: ${totalProfit.toFixed(2)} USD`;

      resultDisplay.textContent = message;
      resultDisplay.style.color = totalProfit > 0 ? "#2ECC71" : "#E74C3C";
    }
  }

  function adjustNextBetAmount() {
    // 获取自动投注策略
    const onWinAction = onWinActionSelect.value;
    const onWinValue = parseFloat(onWinValueInput.value) || 0;
    const onLossAction = onLossActionSelect.value;
    const onLossValue = parseFloat(onLossValueInput.value) || 0;

    if (lastBetResult === "win") {
      // 赢了之后的策略
      switch (onWinAction) {
        case "reset":
          autoBetAmount = baseBetAmount;
          break;
        case "increase":
          autoBetAmount = autoBetAmount * (1 + onWinValue / 100);
          break;
        case "decrease":
          autoBetAmount = autoBetAmount * (1 - onWinValue / 100);
          break;
      }
    } else if (lastBetResult === "loss") {
      // 输了之后的策略
      switch (onLossAction) {
        case "reset":
          autoBetAmount = baseBetAmount;
          break;
        case "increase":
          autoBetAmount = autoBetAmount * (1 + onLossValue / 100);
          break;
        case "decrease":
          autoBetAmount = autoBetAmount * (1 - onLossValue / 100);
          break;
      }
    }

    // 确保投注金额不会低于最小值或超过余额
    autoBetAmount = Math.max(0.00000001, Math.min(autoBetAmount, userBalance));
    autoBetAmountInput.value = autoBetAmount.toFixed(8);
  }

  function checkAutoButtonState() {
    // 检查是否可以开始自动投注
    const amount = parseFloat(autoBetAmountInput.value) || 0;
    startAutoButton.disabled =
      amount <= 0 || amount > userBalance || isAutoBetting;
  }

  function switchTab(tabId) {
    // 移除所有标签和控制区的active类
    [manualTab, autoTab].forEach((tab) => tab.classList.remove("active"));
    [manualControls, autoControls].forEach((control) =>
      control.classList.remove("active")
    );

    // 给选中的标签和控制区添加active类
    if (tabId === "manual") {
      manualTab.classList.add("active");
      manualControls.classList.add("active");
    } else if (tabId === "auto") {
      autoTab.classList.add("active");
      autoControls.classList.add("active");
    }
  }

  function toggleInputBasedOnSelect(selectElement, inputElement) {
    inputElement.disabled = selectElement.value === "reset";
  }

  function initializeGame() {
    // Set initial slider position
    updateSliderPosition(sliderPosition);

    // Initial roll mode
    const rollModeText = document.querySelector(".param-label:nth-child(1)");
    rollModeText.textContent = isRollOver ? "Roll Over" : "Roll Under";

    // Initial parameters
    updateGameParameters();

    // 显示初始余额
    userBalanceElement.textContent = userBalance.toFixed(2) + " USD";

    // 初始化自动投注的输入值
    autoBetAmountInput.value = betAmountInput.value;

    // 初始化选择框状态
    toggleInputBasedOnSelect(onWinActionSelect, onWinValueInput);
    toggleInputBasedOnSelect(onLossActionSelect, onLossValueInput);

    // Add some dummy history items
    const dummyResults = [
      { result: "75.91", isWin: true },
      { result: "44.09", isWin: false },
      { result: "24.72", isWin: false },
      { result: "89.19", isWin: true },
      { result: "79.59", isWin: true },
      { result: "61.30", isWin: true },
      { result: "99.57", isWin: true },
    ];

    dummyResults.forEach((item) => {
      const historyItem = historyItemTemplate.content
        .cloneNode(true)
        .querySelector(".history-item");
      const historyValue = historyItem.querySelector(".history-value");
      historyValue.textContent = item.result;
      historyItem.classList.add(item.isWin ? "win" : "loss");
      historyBar.appendChild(historyItem);
      rollHistory.push(item);
    });
  }

  // 简化极速模式中的视觉更新
  function updateResults(rollResult, isWin, profit) {
    // 更新结果显示
    const isTurboMode = isAutoBetting && betSpeed === "turbo";
    const currentBetAmount = isAutoBetting ? autoBetAmount : betAmount;

    if (isWin) {
      if (!isTurboMode || currentAutoBetCount % 10 === 0) {
        resultDisplay.textContent = `赢了! 投注: ${rollResult} (+${profit.toFixed(
          2
        )} USD)`;
      }
      resultDisplay.style.color = "#2ECC71";
    } else {
      if (!isTurboMode || currentAutoBetCount % 10 === 0) {
        resultDisplay.textContent = `输了! 投注: ${rollResult} (-${currentBetAmount.toFixed(
          2
        )} USD)`;
      }
      resultDisplay.style.color = "#E74C3C";
    }

    // 添加到历史记录
    addToHistory(rollResult, isWin);
  }

  // --- Event Listeners ---
  // Tab switching
  manualTab.addEventListener("click", () => switchTab("manual"));
  autoTab.addEventListener("click", () => switchTab("auto"));

  // Auto betting controls
  startAutoButton.addEventListener("click", startAutoBetting);
  stopAutoButton.addEventListener("click", stopAutoBetting);

  // Speed buttons
  const speedButtons = document.querySelectorAll(".speed-btn");
  speedButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // 移除所有按钮的active类
      speedButtons.forEach((b) => b.classList.remove("active"));
      // 添加当前按钮的active类
      btn.classList.add("active");
      // 设置速度
      betSpeed = btn.getAttribute("data-speed");
    });
  });

  // Strategy select controls
  onWinActionSelect.addEventListener("change", () =>
    toggleInputBasedOnSelect(onWinActionSelect, onWinValueInput)
  );
  onLossActionSelect.addEventListener("change", () =>
    toggleInputBasedOnSelect(onLossActionSelect, onLossValueInput)
  );

  // Update auto bet amount when manual amount changes
  betAmountInput.addEventListener("change", () => {
    autoBetAmountInput.value = betAmountInput.value;
    checkAutoButtonState();
  });

  // Auto bet amount change
  autoBetAmountInput.addEventListener("input", checkAutoButtonState);

  // Slider interaction
  const sliderTrack = document.querySelector(".slider-track");
  sliderTrack.addEventListener("click", (e) => {
    const rect = sliderTrack.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    updateSliderPosition(position);
  });

  // Make slider thumb draggable
  let isDragging = false;
  sliderThumb.addEventListener("mousedown", () => {
    isDragging = true;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const rect = sliderTrack.getBoundingClientRect();
      const position = ((e.clientX - rect.left) / rect.width) * 100;
      updateSliderPosition(position);
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Bet amount input
  betAmountInput.addEventListener("input", () => {
    betAmount = parseFloat(betAmountInput.value) || 0;
    updateGameParameters();
  });

  // Roll mode toggle
  rollToggleButton.addEventListener("click", () => {
    isRollOver = !isRollOver;
    const rollModeText = document.querySelector(".param-label:nth-child(1)");
    rollModeText.textContent = isRollOver ? "Roll Over" : "Roll Under";
    updateGameParameters();
  });

  // Quick bet buttons - Manual
  const quickBtns = document.querySelectorAll("#manualControls .quick-btn");
  quickBtns[0].addEventListener("click", () => {
    betAmount = betAmount / 2;
    betAmountInput.value = betAmount.toFixed(8);
    updateGameParameters();
  });

  quickBtns[1].addEventListener("click", () => {
    betAmount = betAmount * 2;
    betAmountInput.value = betAmount.toFixed(8);
    updateGameParameters();
  });

  // Quick bet buttons - Auto
  const autoQuickBtns = document.querySelectorAll("#autoControls .quick-btn");
  autoQuickBtns[0].addEventListener("click", () => {
    const amount = parseFloat(autoBetAmountInput.value) || 0;
    autoBetAmountInput.value = (amount / 2).toFixed(8);
    checkAutoButtonState();
  });

  autoQuickBtns[1].addEventListener("click", () => {
    const amount = parseFloat(autoBetAmountInput.value) || 0;
    autoBetAmountInput.value = (amount * 2).toFixed(8);
    checkAutoButtonState();
  });

  // Bet button
  betButton.addEventListener("click", () => placeBet(false));

  // --- Initialize ---
  initializeGame();
});
