// Constants
const ITEM_CREATE_COOLDOWN = 60; // 1 minute in seconds
const TOKEN_MINE_COOLDOWN = 180; // 3 minutes in seconds
const ITEMS_PER_PAGE = 5;
const API_BASE = 'https://api.economix.lol';
const CASINO_ANIMATION_DURATION = 2000;

// Utils
function expForLevel(level) {
  return Math.floor(25 * Math.pow(1.2, level - 1));
}

// State Management
class AppState {
  constructor() {
    this.inventoryPage = 1;
    this.marketPage = 1;
    this.token = localStorage.getItem('token') || null;
    this.items = [];
    this.pets = [];
    this.globalMessages = [];
    this.account = {};
    this.marketItems = [];
    this.unreadMessages = 0;
    this.isChatFocused = true;
    this.soundEnabled = true;

    // Inventory Filters
    this.inventoryFilters = {
      searchQuery: '',
      rarity: '',
      sale: 'all'
    };

    // Market Filters
    this.marketFilters = {
      searchQuery: '',
      rarity: '',
      priceMin: '',
      priceMax: '',
      seller: ''
    };

    this.messageSound = new Audio('notification.mp3');
  }
}

const state = new AppState();

// Modal Utilities
const Modal = {
  show(modal) {
    modal.style.display = 'block';
  },
  hide(modal) {
    modal.style.display = 'none';
  },
  getElements() {
    return {
      modal: document.getElementById('customModal'),
      message: document.getElementById('modalMessage'),
      inputContainer: document.getElementById('modalInputContainer'),
      input: document.getElementById('modalInput'),
      ok: document.getElementById('modalOk'),
      cancel: document.getElementById('modalCancel'),
      close: document.getElementById('modalClose')
    };
  },

  alert(message) {
    return new Promise(resolve => {
      const { modal, message: msgEl, inputContainer, ok, cancel, close } = this.getElements();
      msgEl.innerHTML = message;
      inputContainer.style.display = 'none';
      cancel.style.display = 'none';
      this.show(modal);

      const closeHandler = () => {
        this.hide(modal);
        resolve();
      };

      ok.onclick = closeHandler;
      close.onclick = closeHandler;
    });
  },

  prompt(message) {
    return new Promise(resolve => {
      const { modal, message: msgEl, inputContainer, input, ok, cancel, close } = this.getElements();
      msgEl.textContent = message;
      inputContainer.style.display = 'block';
      input.value = '';
      cancel.style.display = 'inline-block';
      this.show(modal);

      ok.onclick = () => {
        this.hide(modal);
        resolve(input.value);
      };
      cancel.onclick = close.onclick = () => {
        this.hide(modal);
        resolve(null);
      };
    });
  },

  confirm(message) {
    return new Promise(resolve => {
      const { modal, message: msgEl, inputContainer, ok, cancel, close } = this.getElements();
      msgEl.textContent = message;
      inputContainer.style.display = 'none';
      ok.style.display = 'inline-block';
      cancel.style.display = 'inline-block';
      this.show(modal);

      ok.onclick = () => {
        this.hide(modal);
        resolve(true);
      };
      cancel.onclick = close.onclick = () => {
        this.hide(modal);
        resolve(false);
      };
    });
  }
};

// UI Utilities
const UI = {
  switchTab(tabName) {
    const chatTab = document.querySelector('[data-tab="chat"]');
    state.isChatFocused = tabName === 'chat';
    if (state.isChatFocused) {
      state.unreadMessages = 0;
      chatTab.classList.remove('new-messages');
    }

    document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
  },

  toggleVisibility(elementId, display = 'block') {
    document.getElementById(elementId).style.display = display;
  },

  showAuthForms() {
    if (state.token) {
      UI.toggleVisibility('homepage', 'none');
      UI.toggleVisibility('mainContent');
      Auth.refreshAccount();
    } else {
      UI.toggleVisibility('homepage', 'none');
      UI.toggleVisibility('authForms');
    }
  },

  formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },

  setTheme(theme) {
    const availableThemes = ['light', 'dark', 'sepia', 'solarized', 'nord', 'dracula', 'monokai', 'gruvbox', 'oceanic', 'pastel', 'cyberpunk', 'tokyonight'];
    if (!availableThemes.includes(theme)) {
      theme = 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
      themeSelect.value = theme;
    }
  },

  initializeTheme() {
    let theme = localStorage.getItem('theme') || 'light';
    this.setTheme(theme);
  },
};

// API Utilities
const API = {
  async fetch(endpoint, options = {}) {
    try {
      const headers = {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      };
      const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

      if (!response.ok) {
        return {error: response?.error || `API error: ${response.status}`, success: false };
      }

      let json = await response.json();
      return { ...json, success: true };
    } catch (err) {
      return { error: err.message, success: false };
    }
  },

  async post(endpoint, data) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async get(endpoint) {
    return this.fetch(endpoint, { method: 'GET' });
  }
};

// Authentication Handlers
const Auth = {
  async login(code) {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const body = { username, password, ...(code && (code.length === 6 ? { token: code } : { code })) };

    try {
      const data = await API.post('/api/login', body);
      if (data.code === '2fa-required') {
        const codeInput = await Modal.prompt('Enter 2FA code or Backup code:');
        if (codeInput) await this.login(codeInput);
        else location.reload();
        return;
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
        state.token = data.token;
        UI.toggleVisibility('authForms', 'none');
        UI.toggleVisibility('mainContent');
        await this.refreshAccount();
      }
    } catch (error) {
      await Modal.alert(`Login failed: ${error.message}. Report at GitHub/Discord if persistent.`);
    }
  },

  async register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    const data = await API.post('/api/register', { username, password });
    await Modal.alert(data.success ? 'Registration successful! Please login.' : `Registration failed: ${data.error || 'Unknown error'}`);
  },

  async setup2FA() {
    const data = await API.post('/api/setup_2fa');
    if (!data.success) return await Modal.alert(`Error setting up 2FA: ${data.error}`);

    const blob = await (await fetch(`${API_BASE}/api/2fa_qrcode`, { headers: { 'Authorization': `Bearer ${state.token}` } })).blob();
    document.getElementById('2faQrCode').src = URL.createObjectURL(blob);
    document.getElementById('2faQrCode').style.display = 'block';
    UI.toggleVisibility('mainContent', 'none');
    UI.toggleVisibility('2faSetupPage');
  },

  async enable2FA() {
    const code = document.getElementById('2faCode').value;
    const data = await API.post('/api/verify_2fa', { token: code });
    if (data.success) await Modal.alert(`2FA enabled! Backup code: ${backupCode}`).then(() => location.reload());
    else await Modal.alert('Failed to enable 2FA.');
  },

  async disable2FA() {
    const data = await API.post('/api/disable_2fa');
    if (data.success) await Modal.alert('2FA disabled!').then(() => location.reload());
    else await Modal.alert('Failed to disable 2FA.');
  },

  async deleteAccount() {
    const confirmation = await Modal.prompt("Enter 'CONFIRM' to delete your account:");
    if (confirmation !== 'CONFIRM') return;

    const data = await API.post('/api/delete_account');
    if (data.success) {
      localStorage.removeItem('token');
      location.reload();
    } else await Modal.alert('Failed to delete account.');
  },

  async redeemCreatorCode() {
    const code = await Modal.prompt('Enter code:');
    if (!code) return;
    const data = await API.post('/api/redeem_creator_code', { code });
    await Modal.alert(data.success ? `Creator code redeemed! Extra tokens: ${data.extra_tokens} | Extra pets: ${data.extra_pets}` : 'Error redeeming creator code.');
  },

  async sendTokens() {
    const recipient = await Modal.prompt('Enter recipient:');
    if (!recipient) return;
    const amount = await Modal.prompt('Enter amount:');
    if (!amount) return;
    const data = await API.post('/api/send_tokens', { recipient, amount });
    await Modal.alert(data.success ? `Sent tokens!` : `Error sending tokens.`);
  },

  async refreshAccount() {
    const data = await API.get('/api/account');

    if (data.banned) {
      UI.toggleVisibility('mainContent', 'none');
      UI.toggleVisibility('bannedPage');
      document.getElementById('banExpires').textContent = data.banned_until === 0 ? 'Permanent' : new Date(data.banned_until * 1000).toLocaleString();
      document.getElementById('banReason').textContent = data.banned_reason;
      return;
    }

    if (data.creator_code) {
      document.getElementById('creatorCodeMessage').textContent = data.creator_code;
      UI.toggleVisibility('creatorMessage');
    }

    if (data.error) {
      localStorage.removeItem('token');
      location.reload();
      return;
    }

    this.updateAccountUI(data);
    state.items = data.items;
    state.pets = data.pets;
    state.account = data;

    if ((state.inventoryPage - 1) * ITEMS_PER_PAGE >= state.items.length) state.inventoryPage = 1;
    Inventory.render(Inventory.filter(state.items));
    Pets.render(state.pets);
  },

  updateAccountUI(data) {
    document.getElementById('tokens').textContent = data.tokens;
    document.getElementById('level').textContent = data.level;
    document.getElementById('exp').textContent = data.exp;
    document.getElementById('usernameDisplay').textContent = data.username;

    const roleDisplay = document.getElementById('roleDisplay');
    const adminTab = document.getElementById('adminDashboardTabButton');
    const modTab = document.getElementById('modDashboardTabButton');
    const activeTab = document.querySelector('.tab.active').getAttribute('data-tab');

    if (data.type === 'admin') {
      roleDisplay.innerHTML = 'You are an <strong>Admin</strong>';
      adminTab.style.display = 'inline-block';
      modTab.style.display = 'none';
      if (activeTab === 'modDashboard') UI.switchTab('dashboard');
    } else if (data.type === 'mod') {
      roleDisplay.innerHTML = 'You are a <strong>Mod</strong>';
      modTab.style.display = 'inline-block';
      adminTab.style.display = 'none';
      if (['modDashboard'].includes(activeTab)) UI.switchTab('dashboard');
    } else {
      roleDisplay.innerHTML = 'You are a <strong>User</strong>';
      adminTab.style.display = 'none';
      modTab.style.display = 'none';
      if (['adminDashboard', 'modDashboard'].includes(activeTab)) UI.switchTab('dashboard');
    }

    this.updateCooldowns(data);
  },

  updateCooldowns(data) {
    const now = Date.now() / 1000;
    const itemRemaining = ITEM_CREATE_COOLDOWN - (now - data.last_item_time);
    document.getElementById('cooldown').innerHTML = itemRemaining > 0
      ? `Item creation cooldown: ${Math.ceil(itemRemaining)}s${data.type === 'admin' ? ' <a href="#" onclick="Admin.resetCooldown()">Skip?</a>' : ''}`
      : '';

    const mineRemaining = TOKEN_MINE_COOLDOWN - (now - data.last_mine_time);
    document.getElementById('mineCooldown').innerHTML = mineRemaining > 0
      ? `Mining cooldown: ${Math.ceil(mineRemaining)}s${data.type === 'admin' ? ' <a href="#" onclick="Admin.resetCooldown()">Skip?</a>' : ''}`
      : '';
  }
};

// Inventory Management
const Inventory = {
  filter(items) {
    const { searchQuery, rarity, sale } = state.inventoryFilters;
    return items.filter(item => {
      const fullName = `${item.name.adjective} ${item.name.material} ${item.name.noun} ${item.name.suffix} #${item.name.number}`.toLowerCase();
      return fullName.includes(searchQuery) &&
        (!rarity || item.level === rarity) &&
        (sale === 'all' || (sale === 'forsale' ? item.for_sale : !item.for_sale));
    });
  },

  applyFilters() {
    const oldFilters = { ...state.inventoryFilters };
    state.inventoryFilters.searchQuery = document.getElementById('inventorySearch').value.toLowerCase();
    state.inventoryFilters.rarity = document.getElementById('inventoryRarityFilter').value;
    state.inventoryFilters.sale = document.getElementById('inventorySaleFilter').value;

    if (JSON.stringify(oldFilters) !== JSON.stringify(state.inventoryFilters)) state.inventoryPage = 1;
    this.render(this.filter(state.items));
  },

  render(filteredItems) {
    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = '';
    const start = (state.inventoryPage - 1) * ITEMS_PER_PAGE;
    const pagedItems = filteredItems.slice(start, start + ITEMS_PER_PAGE);

    pagedItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'item-entry';
      li.innerHTML = `
                <span class="item-info">
                    ${item.name.icon} ${item.name.adjective} ${item.name.material} ${item.name.noun} ${item.name.suffix} #${item.name.number}
                    <span class="item-meta">(${item.rarity} Lv.${item.level})</span>
                    ${item.for_sale ? `<span class="sale-indicator">💰 Selling for ${item.price} tokens</span>` : ''}
                </span>
            `;

      const actions = document.createElement('div');
      actions.className = 'item-actions';
      actions.appendChild(this.createButton(item.for_sale ? '🚫 Cancel' : '💰 Sell', item.for_sale ? 'btn-warning' : 'btn-secondary', () => item.for_sale ? this.cancelSale(item.id) : this.sell(item.id)));
      actions.appendChild(this.createButton('🕵️ Secret', 'btn-danger', () => this.viewSecret(item.id)));
      actions.appendChild(this.createButton('♻️ Recycle (+5 tokens)', 'btn-primary', () => this.recycle(item.id)));

      if (state.account.type === 'admin') {
        actions.appendChild(this.createButton('✏️ Edit', 'btn-admin', () => Admin.editItem(item.id)));
        actions.appendChild(this.createButton('🗑️ Delete', 'btn-admin-danger', () => Admin.deleteItem(item.id)));
      }

      li.appendChild(actions);
      itemsList.appendChild(li);
    });

    this.renderPagination(filteredItems);
  },

  createButton(text, className, onClick) {
    const btn = document.createElement('button');
    btn.className = `btn ${className}`;
    btn.innerHTML = text;
    btn.onclick = onClick;
    return btn;
  },

  renderPagination(filteredItems) {
    const container = document.getElementById('inventoryPagination');
    container.innerHTML = '';
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    container.appendChild(this.createPaginationButton('◀ Previous', state.inventoryPage === 1, () => state.inventoryPage > 1 && (state.inventoryPage--, this.render(filteredItems))));
    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    pageInfo.innerHTML = `Page <strong>${state.inventoryPage}</strong> of <strong>${totalPages}</strong> (${filteredItems.length} items total)`;
    container.appendChild(pageInfo);
    container.appendChild(this.createPaginationButton('Next ▶', state.inventoryPage >= totalPages, () => state.inventoryPage < totalPages && (state.inventoryPage++, this.render(filteredItems))));
  },

  createPaginationButton(text, disabled, onClick) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-pagination';
    btn.innerHTML = text;
    btn.disabled = disabled;
    btn.onclick = onClick;
    return btn;
  },

  async create() {
    const item = await API.post('/api/create_item');
    if (item.error) return await Modal.alert(`Error creating item: ${item.error}`);

    const style = window.getComputedStyle(document.body);
    let itemDiv = document.createElement("DIV");
    let rarity = item.level

    let colors = ['#ffffff']

    let h2 = document.createElement("h2")
    h2.innerText += "New " + rarity + " item!";

    let significantlevels = ["rare", "epic", "legendary", "godlike"];
    if (significantlevels.includes(rarity.toLowerCase())) {
      let color = style.getPropertyValue('--' + rarity.toLowerCase());
      itemDiv.appendChild(h2)
      colors.push(color)

      confetti({
        particleCount: 200,
        angle: -90,
        spread: 180,
        origin: { x: 0.5, y: 0 },
        colors: colors
      });
    }

    itemDiv.appendChild(h2)

    let p = document.createElement("P")
    p.innerText = `${item.name.icon} ${item.name.adjective} ${item.name.material} ${item.name.noun} ${item.name.suffix} #${item.name.number}`
    itemDiv.appendChild(p)

    await Modal.alert(itemDiv.innerHTML).then(() => Auth.refreshAccount());
  },

  async sell(itemId) {
    const price = await Modal.prompt('Enter sale price (tokens):');
    if (!price) return;
    const data = await API.post('/api/sell_item', { item_id: itemId, price: parseInt(price) });
    await Modal.alert(data.success ? 'Item listed for sale!' : 'Error listing item.').then(() => {
      if (data.success) {
        Auth.refreshAccount();
        Market.refresh();
      }
    });
  },

  async cancelSale(itemId) {
    const data = await API.post('/api/sell_item', { item_id: itemId, price: 1 });
    await Modal.alert(data.success ? 'Sale cancelled!' : 'Error cancelling sale.').then(() => {
      if (data.success) {
        Auth.refreshAccount();
        Market.refresh();
      }
    });
  },

  viewSecret(itemId) {
    const item = state.items.find(i => i.id === itemId);
    Modal.alert(`Secret (do not share): ${item.item_secret}`);
  },

  async recycle(itemId) {
    if (!await Modal.confirm('Are you sure you want to recycle this item?')) return;

    const data = await API.post('/api/recycle_item', { item_id: itemId });
    await Modal.alert(data.success ? 'Recycled item!' : 'Failed to recycle item.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  }
};

// Market Management
const Market = {
  filter(items) {
    const { searchQuery, rarity, priceMin, priceMax, seller } = state.marketFilters;
    return items.filter(item => {
      const fullName = `${item.name.adjective} ${item.name.material} ${item.name.noun} ${item.name.suffix} #${item.name.number}`.toLowerCase();
      const min = priceMin ? Number(priceMin) : -Infinity;
      const max = priceMax ? Number(priceMax) : Infinity;
      return fullName.includes(searchQuery) &&
        (!rarity || item.level === rarity) &&
        item.price >= min && item.price <= max &&
        (!seller || item.owner.toLowerCase().includes(seller));
    });
  },

  applyFilters() {
    const oldFilters = { ...state.marketFilters };
    state.marketFilters.searchQuery = document.getElementById('marketSearch').value.toLowerCase();
    state.marketFilters.rarity = document.getElementById('marketRarityFilter').value;
    state.marketFilters.priceMin = document.getElementById('marketPriceMin').value;
    state.marketFilters.priceMax = document.getElementById('marketPriceMax').value;
    state.marketFilters.seller = document.getElementById('marketSellerFilter').value.toLowerCase();

    if (JSON.stringify(oldFilters) !== JSON.stringify(state.marketFilters)) state.marketPage = 1;
    this.render(this.filter(state.marketItems));
  },

  async refresh() {
    let rawData = await API.get('/api/market');

    if (!rawData.success) {
      console.error('Failed fetch inventory: ' + rawData.error);
      state.marketItems = [];
      return this.applyFilters();
    }

    state.marketItems = Object.values(rawData).filter(item => typeof item === 'object');
    this.applyFilters();
  },

  render(filteredItems) {
    const marketList = document.getElementById('marketList');
    marketList.innerHTML = '';
    const start = (state.marketPage - 1) * ITEMS_PER_PAGE;
    const pagedItems = filteredItems.slice(start, start + ITEMS_PER_PAGE);

    pagedItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'market-item';
      li.innerHTML = `
                <div class="item-header">
                    <span class="item-icon">${item.name.icon}</span>
                    <span class="item-name">${item.name.adjective} ${item.name.material} ${item.name.noun} ${item.name.suffix} #${item.name.number}</span>
                </div>
                <div class="item-details">
                    <span class="item-level">⚔️ ${item.rarity} ${item.level}</span>
                    <span class="item-price">💰 ${item.price} tokens</span>
                    <span class="item-seller">👤 ${item.owner}</span>
                </div>
            `;

      if (item.owner !== state.account.username) {
        const actions = document.createElement('div');
        actions.className = 'market-actions';
        actions.appendChild(Inventory.createButton('🛒 Purchase', 'btn-buy', () => this.buy(item.id)));
        li.appendChild(actions);
      }

      marketList.appendChild(li);
    });

    this.renderPagination(filteredItems);
  },

  renderPagination(filteredItems) {
    const container = document.getElementById('marketplacePagination');
    container.innerHTML = '';
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    container.appendChild(Inventory.createPaginationButton('◀ Previous', state.marketPage === 1, () => state.marketPage > 1 && (state.marketPage--, this.render(filteredItems))));
    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    pageInfo.innerHTML = `Page <strong>${state.marketPage}</strong> of <strong>${totalPages}</strong> (Showing ${filteredItems.length} listings)`;
    container.appendChild(pageInfo);
    container.appendChild(Inventory.createPaginationButton('Next ▶', state.marketPage >= totalPages, () => state.marketPage < totalPages && (state.marketPage++, this.render(filteredItems))));
  },

  async buy(itemId) {
    if (!await Modal.confirm('Are you sure you want to purchase this item?')) return;

    const data = await API.post('/api/buy_item', { item_id: itemId });
    if (data.success) await Modal.alert('Item purchased!').then(() => {
      Auth.refreshAccount();
      this.refresh();
    });
  }
};

// Casino
const Casino = {
  async bet(choice) {
    const betAmount = parseFloat(document.getElementById('betAmount').value);
    if (!betAmount || betAmount <= 0) {
      await Modal.alert('Please enter a valid bet amount.');
      return;
    }

    const data = await API.post('/api/coin_flip', { bet_amount: betAmount, choice });
    if (!data.success) {
      await Modal.alert(`Error placing bet: ${data.error}`);
      return;
    }

    this.animateCoinFlip(data.result, data.won, betAmount, data.winnings);
    Auth.refreshAccount();
  },

  animateCoinFlip(result, won, betAmount, winnings) {
    const resultEl = document.getElementById('casinoResult');
    resultEl.textContent = 'Flipping coin...';
    resultEl.classList.add('flipping');

    setTimeout(() => {
      resultEl.classList.remove('flipping');
      resultEl.textContent = `Result: ${result.toUpperCase()}! You ${won ? 'won' : 'lost'}! ${won ? `Winnings: ${winnings} tokens` : `Lost: ${betAmount} tokens`}`;
      resultEl.classList.add(won ? 'won' : 'lost');
      if (won) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      setTimeout(() => resultEl.classList.remove(won ? 'won' : 'lost'), 3000);
    }, CASINO_ANIMATION_DURATION);
  },

  async rollDice() {
    const betAmount = parseFloat(document.getElementById('diceBetAmount').value);
    const selectedNumber = document.querySelector('input[name="dice-number"]:checked');

    // Validate input
    if (!selectedNumber) {
      await Modal.alert('Please select a number to bet on.');
      return;
    }
    const choice = parseInt(selectedNumber.value);
    if (!betAmount || betAmount <= 0) {
      await Modal.alert('Please enter a valid bet amount.');
      return;
    }

    // Send bet to backend
    const data = await API.post('/api/dice_roll', { bet_amount: betAmount, choice });
    if (!data.success) {
      await Modal.alert(`Error placing bet: ${data.error}`);
      return;
    }

    // Animate and display result
    this.animateDiceRoll(data.result, data.won, betAmount, data.winnings);
    Auth.refreshAccount(); // Update user's token display
  },

  animateDiceRoll(result, won, betAmount, winnings) {
    const resultEl = document.getElementById('diceResult');
    resultEl.textContent = 'Rolling dice...';

    setTimeout(() => {
      resultEl.textContent = `Result: ${result}! You ${won ? 'won' : 'lost'}! ${won ? `Winnings: ${winnings} tokens` : `Lost: ${betAmount} tokens`}`;
      if (won) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, CASINO_ANIMATION_DURATION);
  }
};

// Pet Management
const Pets = {
  render(pets) {
    const petsList = document.getElementById('pet-list');
    petsList.innerHTML = '';

    if (!pets.length || !pets[0].alive) {
      const li = document.createElement('li');
      li.className = 'pet-entry';
      const price = pets.length && !pets[0].alive ? pets[0].base_price * 2 : 100;
      li.innerHTML = `
                <div class="pet-entry-content">
                    <p>${pets.length ? 'Your pet has died!' : 'You have no pets.'}</p>
                    <button class="btn btn-primary" onclick="Pets.buy()">Buy a pet (${price} tokens)</button>
                </div>
            `;
      petsList.appendChild(li);
      return;
    }

    pets.forEach(pet => {
      const lastFed = new Date(pet.last_fed * 1000);
      const daysAgo = Math.floor((Date.now() - lastFed) / (1000 * 60 * 60 * 24));
      const li = document.createElement('li');
      li.className = 'pet-entry';
      li.innerHTML = `
                <div class="pet-entry-content">
                    <span class="pet-info">
                        <strong>${pet.name}</strong> - Level ${pet.level} (Exp: ${pet.exp}/${expForLevel(pet.level + 1)})<br>
                        Status: <span class="pet-status pet-status-${pet.health}">${pet.health.charAt(0).toUpperCase() + pet.health.slice(1)}</span><br>
                        <span class="feeding-status">Last fed: ${daysAgo === 0 ? 'today' : `${daysAgo} days ago`}</span><br>
                        <span class="pet-benefits">Bonus: +${pet.benefits.token_bonus} tokens per mine</span><br>
                        <button class="btn btn-primary" onclick="Pets.feed('${pet.id}')">Feed (10 tokens)</button>
                    </span>
                </div>
            `;
      petsList.appendChild(li);
    });
  },

  async buy() {
    const data = await API.post('/api/buy_pet');
    await Modal.alert(data.success ? `Pet bought: ${data.name}!` : `Failed to buy pet: ${data.error}`).then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async feed(petId) {
    const data = await API.post('/api/feed_pet', { pet_id: petId });
    await Modal.alert(data.success ? 'Pet fed!' : `Failed to feed pet: ${data.error}`).then(() => {
      if (data.success) Auth.refreshAccount();
    });
  }
};

const Company = {
  async refresh() {
    const data = await API.get('/api/get_company');
    this.render(data.company);
  },

  render(company) {
    const container = document.getElementById('companyDetails');
    container.innerHTML = '';

    if (!company) {
      container.innerHTML = `
              <p>You are not part of a company.</p>
              <button class="btn btn-primary" onclick="Company.create()">Create Company (500 tokens)</button>
          `;
      return;
    }

    const isOwner = company.owner === state.account.username;
    const workerCost = 50;
    const maxWorkers = 2 * company.members.length;
    const tokensPerHour = company.workers * 5;

    const now = Date.now() / 1000;
    const lastDist = company.last_distribution;
    const hoursSinceLastDist = (now - lastDist) / 3600;
    const formattedHours = 24 - Math.round(hoursSinceLastDist);

    container.innerHTML = `
          <h3>${company.name}</h3>
          <p><strong>Owner:</strong> ${company.owner}</p>
          <p><strong>Members (${company.members.length}/10):</strong> ${company.members.join(', ')}</p>
          <p><strong>Workers (${company.workers}/${maxWorkers}):</strong> Generating ${tokensPerHour} tokens/hr</p>
          <p><strong>Company Tokens:</strong> ${company.tokens} (Distributed in ${formattedHours} hours)</p>
          <p><strong>Last Distribution:</strong> ${new Date(company.last_distribution * 1000).toLocaleString()}</p>
      `;

    const actions = document.createElement('div');
    actions.className = 'actions';
    if (isOwner) {
      actions.innerHTML += `
              <button class="btn btn-primary" onclick="Company.invite('${company.id}')">Invite Member</button>
              <button class="btn btn-primary" ${company.workers >= maxWorkers ? 'disabled' : ''} onclick="Company.buyWorker('${company.id}')">Buy Worker (${workerCost} tokens)</button>
          `;
    } else {
      actions.innerHTML += `
      <button class="btn btn-primary" onclick="Company.leaveCompany()">Leave Company</button>
      `
    }
    container.appendChild(actions);
  },

  async create() {
    const name = await Modal.prompt('Enter company name:');
    if (!name) return;
    const data = await API.post('/api/create_company', { name });
    if (data.success) {
      await Modal.alert('Company created!');
      Auth.refreshAccount();
      this.refresh();
    } else {
      await Modal.alert(`Error: ${data.error}`);
    }
  },

  async invite(companyId) {
    const username = await Modal.prompt('Enter username to invite:');
    if (!username) return;
    const data = await API.post('/api/invite_to_company', { company_id: companyId, username });
    if (data.success) {
      await Modal.alert('User invited!');
      this.refresh();
    } else {
      await Modal.alert(`Error: ${data.error}`);
    }
  },

  async buyWorker(companyId) {
    const data = await API.post('/api/buy_worker', { company_id: companyId });
    if (data.success) {
      await Modal.alert('Worker purchased!');
      Auth.refreshAccount();
      this.refresh();
    } else {
      await Modal.alert(`Error: ${data.error}`);
    }
  },

  async leaveCompany() {
    if (!await Modal.confirm('Are you sure you want to leave your company?')) return;
    const data = await API.post('/api/leave_company');
    if (data.success) {
      await Modal.alert('Left company!');
    } else {
      await Modal.alert('Failed to leave company.');
    }
  }
};

// Chat Management
const Chat = {
  async send() {
    const message = document.getElementById('messageInput').value.trim();
    if (!message) return;

    document.getElementById('messageInput').value = '';

    const data = await API.post('/api/send_message', { message });
    if (data.success) {
      this.refresh();
    } else await Modal.alert(`Error sending message: ${data.error}`);
  },

  async refresh() {
    const data = await API.get('/api/get_messages?room=global');
    if (!data.messages || data.messages.length === state.globalMessages.length) return;

    const container = document.getElementById('globalMessages');
    container.innerHTML = '';
    data.messages.forEach(msg => this.append(msg));
    state.globalMessages = data.messages;
  },

  append(message) {
    const container = document.getElementById('globalMessages');
    const isOwn = message.username === state.account.username;
    const type = message.type || 'user';

    if (!state.isChatFocused) {
      state.unreadMessages++;
      if (state.soundEnabled) state.messageSound.play();
      document.querySelector('[data-tab="chat"]').classList.add('new-messages');
    }

    if (message.type === 'system') {
      messagePrefix = '⚙️';
    } else if (message.type === 'admin') {
      messagePrefix = '🛠️';
    } else if (message.type === 'mod') {
      messagePrefix = '🛡️';
    } else if (message.type === 'media') {
      messagePrefix = '🎥';
    } else if (message.type === 'msg') {
      messagePrefix = '💬';
    } else {
      messagePrefix = '';
    }

    const messageEl = document.createElement('div');
    messageEl.className = `message ${type} ${isOwn ? 'own-message' : ''}`;
    messageEl.innerHTML = `
            <div class="message-header">
                <span class="message-sender ${type}" title="${type.charAt(0).toUpperCase() + type.slice(1)}">
                    ${messagePrefix} ${message.username}
                </span>
                <span class="message-time">${UI.formatTime(message.timestamp)}</span>
            </div>
            <div class="message-content">${message.message}</div>
            ${(state.account.type === 'admin' || state.account.type === 'mod') ? `<button class="delete-message" onclick="Chat.delete('${message.id}')">🗑️</button>` : ''}
        `;
    container.appendChild(messageEl);
  },

  async delete(messageId) {
    const data = await API.post('/api/delete_message', { message_id: messageId });
    if (data.success) this.refresh();
    else await Modal.alert('Error deleting message.');
  }
};

// Admin/Mod Functions
const Admin = {
  async resetCooldown() {
    const data = await API.post('/api/reset_cooldowns');
    await Modal.alert(data.success ? 'Cooldown reset!' : 'Error resetting cooldown.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async editTokens(username = null) {
    const tokens = await Modal.prompt('Enter tokens:');
    if (!tokens) return;
    const data = await API.post('/api/edit_tokens', username ? { username, tokens: parseFloat(tokens) } : { tokens: parseFloat(tokens) });
    await Modal.alert(data.success ? 'Tokens edited!' : 'Error editing tokens.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async editExp(username = null) {
    const exp = await Modal.prompt('Enter exp:');
    if (!exp) return;
    const data = await API.post('/api/edit_exp', username ? { username, exp: parseFloat(exp) } : { exp: parseFloat(exp) });
    await Modal.alert(data.success ? 'Exp edited!' : 'Error editing exp.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async editLevel(username = null) {
    const level = await Modal.prompt('Enter level:');
    if (!level) return;
    const data = await API.post('/api/edit_level', username ? { username, level: parseFloat(level) } : { level: parseFloat(level) });
    await Modal.alert(data.success ? 'Level edited!' : 'Error editing level.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async editItem(itemId) {
    const newName = await Modal.prompt('Enter new name (blank for no change):');
    const newIcon = await Modal.prompt('Enter new icon (blank for no change):');
    const newRarity = await Modal.prompt('Enter new rarity (blank for no change):');
    const data = await API.post('/api/edit_item', { item_id: itemId, new_name: newName, new_icon: newIcon, new_rarity: newRarity });
    await Modal.alert(data.success ? 'Item edited!' : 'Error editing item.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async deleteItem(itemId) {
    if (!await Modal.confirm('Are you sure you want to delete this item?')) return;
    const data = await API.post('/api/delete_item', { item_id: itemId });
    await Modal.alert(data.success ? 'Item deleted!' : 'Error deleting item.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async addAdmin() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/add_admin', { username });
    await Modal.alert(data.success ? 'Admin added!' : 'Error adding admin.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async removeAdmin() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/remove_admin', { username });
    await Modal.alert(data.success ? 'Admin removed!' : 'Error removing admin.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async addMod() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/add_mod', { username });
    await Modal.alert(data.success ? 'Mod added!' : 'Error adding mod.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async removeMod() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/remove_mod', { username });
    await Modal.alert(data.success ? 'Mod removed!' : 'Error removing mod.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async addMedia() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/add_media', { username });
    await Modal.alert(data.success ? 'Media added!' : 'Error adding media.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async removeMedia() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/remove_media', { username });
    await Modal.alert(data.success ? 'Media removed!' : 'Error removing media.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async banUser() {
    const username = await Modal.prompt('Enter username to ban:');
    if (!username) return;
    const reason = await Modal.prompt('Enter reason for banning:');
    if (!reason) return;
    const length = await Modal.prompt('Enter ban length (e.g., 1h, 1d, perma):');
    if (!length) return;
    const data = await API.post('/api/ban_user', { username, reason, length });
    await Modal.alert(data.success ? 'User banned!' : 'Error banning user.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async unbanUser() {
    const username = await Modal.prompt('Enter username to unban:');
    if (!username) return;
    const data = await API.post('/api/unban_user', { username });
    await Modal.alert(data.success ? 'User unbanned!' : 'Error unbanning user.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async muteUser() {
    const username = await Modal.prompt('Enter username to mute:');
    if (!username) return;
    const length = await Modal.prompt('Enter mute length (e.g., 1h, 1d, perma):');
    if (!length) return;
    const data = await API.post('/api/mute_user', { username, length });
    await Modal.alert(data.success ? 'User muted!' : 'Error muting user.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async unmuteUser() {
    const username = await Modal.prompt('Enter username to unmute:');
    if (!username) return;
    const data = await API.post('/api/unmute_user', { username });
    await Modal.alert(data.success ? 'User unmuted!' : 'Error unmuting user.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async fineUser() {
    const username = await Modal.prompt('Enter username to fine:');
    if (!username) return;
    const amount = await Modal.prompt('Enter fine amount:');
    if (!amount) return;
    const data = await API.post('/api/fine_user', { username, amount: parseFloat(amount) });
    await Modal.alert(data.success ? 'User fined!' : 'Error fining user.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async setBanner() {
    const banner = await Modal.prompt('Enter banner:');
    if (!banner) return;
    const data = await API.post('/api/set_banner', { banner });
    await Modal.alert(data.success ? 'Banner set!' : 'Error setting banner.').then(() => {
      if (data.success) this.refreshBanner();
    });
  },

  async listUsers() {
    const data = await API.get('/api/users');
    if (data.usernames) {
      const container = document.createElement('div');
      data.usernames.forEach(username => {
        const p = document.createElement('p');
        p.innerText = username;
        container.appendChild(p);
      });
      await Modal.alert(container.innerHTML);
    }
  },

  async refreshBanner() {
    const data = await API.get('/api/get_banner');
    if (data.banner) {
      const bannerEl = document.getElementById('banner');
      bannerEl.style.display = 'block';
      bannerEl.innerHTML = data.banner.value;
    }
  },

  async refreshLeaderboard() {
    const data = await API.get('/api/leaderboard');
    if (data.leaderboard) {
      const leaderboard = document.getElementById('leaderboard');
      leaderboard.innerHTML = '';
      data.leaderboard.forEach(user => {
        const div = document.createElement('div');
        if (user.username === state.account.username) div.classList.add('highlight');
        div.innerHTML = `<b>${user.place}:</b> ${user.username} (${user.tokens} tokens)`;
        leaderboard.appendChild(div);
      });
    }
  },

  async refreshStats() {
    const data = await API.get('/api/stats');
    if (data.stats) {
      const totalTokens = document.getElementById('totalTokens');
      const totalAccounts = document.getElementById('totalAccounts');
      const totalItems = document.getElementById('totalItems');
      totalTokens.innerText = data.stats.total_tokens;
      totalAccounts.innerText = data.stats.total_accounts;
      totalItems.innerText = data.stats.total_items;
    }
  },

  async getBannedUsers() {
    const data = await API.get('/api/get_banned');
    if (data.banned_users) {
      const container = document.createElement('div');
      data.banned_users.forEach(username => {
        const p = document.createElement('p');
        p.innerText = username;
        container.appendChild(p);
      });
      await Modal.alert(container.innerHTML);
    }
  },

  async deleteUser() {
    const username = await Modal.prompt('Enter username to delete:');
    if (!username) return;
    const data = await API.post('/api/delete_user', { username });
    await Modal.alert(data.success ? 'User deleted!' : 'Error deleting user.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async createCreatorCode() {
    const code = await Modal.prompt('Enter code:');
    if (!code) return;
    const extraTokens = parseInt(await Modal.prompt('Enter extra tokens:')) || 0;
    if (!extraTokens) return;
    const extraPets = parseInt(await Modal.prompt('Enter extra pets:')) || 0;
    if (!extraPets) return;

    const data = await API.post('/api/create_creator_code', { code, tokens: extraTokens, pets: extraPets });

    await Modal.alert(data.success ? 'Creator code created!' : 'Error creating creator code.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async deleteCreatorCode() {
    const code = await Modal.prompt('Enter code:');
    if (!code) return;
    if (!await Modal.confirm(`Are you sure you want to delete the creator code: ${code}?`)) return;
    const data = await API.post('/api/delete_creator_code', { code });
    await Modal.alert(data.success ? 'Creator code deleted!' : 'Error deleting creator code.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async getCreatorCodes() {
    const data = await API.get('/api/get_creator_codes');
    if (data.creator_codes) {
      const container = document.createElement('div');
      data.creator_codes.forEach(code => {
        const p = document.createElement('p');
        p.innerText = `${code.code} (${code.tokens} tokens, ${code.pets} pets)`;
        container.appendChild(p);
      });
      await Modal.alert(container.innerHTML);
    }
  },

  async setCompanyTokens() {
    const company = await Modal.prompt('Enter company name:');
    if (!company) return;
    const tokens = await Modal.prompt('Enter tokens:');
    if (!tokens) return;
    const data = await API.post('/api/set_company_tokens', { company, tokens });
    await Modal.alert(data.success ? 'Company edited!' : 'Error editing company.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  }
};

const ServerStatus = {
  async checkServerOnline() {
    try {
      const response = await fetch(`${API_BASE}/api/ping`);
      return response.ok;
    } catch (error) {
      console.error('Error checking server status:', error);
      return false;
    }
  }
};



// Event Listeners
const initEventListeners = () => {
  // Tabs
  document.querySelectorAll('.tab').forEach(btn =>
    btn.addEventListener('click', () => UI.switchTab(btn.dataset.tab))
  );

  // Inventory Actions
  document.getElementById('createItem').addEventListener('click', Inventory.create);
  document.getElementById('mineItem').addEventListener('click', async () => {
    const data = await API.post('/api/mine_tokens');
    if (data.error) return Modal.alert(`Error mining tokens: ${data.error}`);
    await Modal.alert(`Mined ${data.tokens} tokens!`).then(Auth.refreshAccount);
  });
  document.getElementById('takeItem').addEventListener('click', async () => {
    const secret = await Modal.prompt('Enter secret:');
    if (!secret) return;
    const data = await API.post('/api/take_item', { item_secret: secret });
    await Modal.alert(data.success ? 'Item taken!' : 'Error taking item.').then(() => {
      if (data.success) {
        Auth.refreshAccount();
        Market.refresh();
      }
    });
  });

  // User Actions
  document.getElementById('sendTokens').addEventListener('click', Auth.sendTokens);
  document.getElementById('sendMessage').addEventListener('click', Chat.send);
  document.getElementById('messageInput').addEventListener('keyup', e => {
    if (e.key === 'Enter') Chat.send();
  });
  document.getElementById('themeSelect').addEventListener('change', e => UI.setTheme(e.target.value));
  document.getElementById('redeemCreatorCode').addEventListener('click', Auth.redeemCreatorCode);
  document.getElementById('deleteAccount').addEventListener('click', Auth.deleteAccount);
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    location.reload();
  });

  // Two-Factor Authentication (2FA)
  document.getElementById('setup2FA').addEventListener('click', Auth.setup2FA);
  document.getElementById('disable2FA').addEventListener('click', Auth.disable2FA);
  document.getElementById('2faSetupSubmit').addEventListener('click', Auth.enable2FA);
  document.getElementById('2faSetupCancel').addEventListener('click', () => location.reload());

  // Admin Dashboard
  const adminActions = {
    listUsersAdmin: Admin.listUsers,
    getBannedUsersAdmin: Admin.getBannedUsers,
    createCreatorCodeAdmin: Admin.createCreatorCode,
    deleteCreatorCodeAdmin: Admin.deleteCreatorCode,
    getCreatorCodesAdmin: Admin.getCreatorCodes,
    setBannerAdmin: Admin.setBanner,
    editTokensAdmin: Admin.editTokens,
    editCompanyTokensAdmin: Admin.setCompanyTokens,
    editExpAdmin: Admin.editExp,
    editLevelAdmin: Admin.editLevel,
    addAdminAdmin: Admin.addAdmin,
    removeAdminAdmin: Admin.removeAdmin,
    addModAdmin: Admin.addMod,
    removeModAdmin: Admin.removeMod,
    addMediaAdmin: Admin.addMedia,
    removeMediaAdmin: Admin.removeMedia,
    banUserAdmin: Admin.banUser,
    unbanUserAdmin: Admin.unbanUser,
    muteUserAdmin: Admin.muteUser,
    unmuteUserAdmin: Admin.unmuteUser,
    fineUserAdmin: Admin.fineUser,
    deleteUserAdmin: Admin.deleteUser
  };
  Object.keys(adminActions).forEach(id =>
    document.getElementById(id).addEventListener('click', adminActions[id])
  );

  // User-Specific Admin Edits
  const promptActions = {
    editExpForUserAdmin: Admin.editExp,
    editLevelForUserAdmin: Admin.editLevel,
    editTokensForUserAdmin: Admin.editTokens
  };
  Object.keys(promptActions).forEach(id => {
    document.getElementById(id).addEventListener('click', async () => {
      const username = await Modal.prompt('Enter username:');
      if (username) promptActions[id](username);
    });
  });

  // Mod Dashboard
  document.getElementById('listUsersMod').addEventListener('click', Admin.listUsers);
  document.getElementById('muteUserMod').addEventListener('click', Admin.muteUser);
  document.getElementById('unmuteUserMod').addEventListener('click', Admin.unmuteUser);

  // Casino
  document.getElementById('betHeads').addEventListener('click', () => Casino.bet('heads'));
  document.getElementById('betTails').addEventListener('click', () => Casino.bet('tails'));
  document.getElementById('rollDice').addEventListener('click', Casino.rollDice);
};


// Initialization
const init = async () => {
  UI.initializeTheme();

  // if (!await ServerStatus.checkServerOnline()) {
  //   window.location.href = 'unavailable.html';
  // }

  Admin.refreshStats();

  setInterval(() => {
    if (!state.token || document.getElementById('homepage').style.display === 'block') return;
    Admin.refreshStats();
    Admin.refreshBanner();
    Auth.refreshAccount();
    Chat.refresh();
    Admin.refreshLeaderboard();
    Market.refresh();
    Company.refresh();
  }, 1000);

  initEventListeners();
};

init();