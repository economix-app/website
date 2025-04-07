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
    this.oldPets = [];
    this.globalMessages = [];
    this.account = {};
    this.marketItems = [];
    this.unreadMessages = 0;
    this.isChatFocused = true;
    this.typingUsers = [];
    this.onlineUsers = [];
    this.currentRoom = 'global';

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

// Notification System
const Notifications = {
  container: document.getElementById('notifications'),

  show({ type = 'normal', message, duration = 5000 }) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="close-btn">✖</button>
      <div class="progress-bar"></div>
    `;

    const closeBtn = notification.querySelector('.close-btn');
    const progressBar = notification.querySelector('.progress-bar');

    // Auto-close logic
    const timeout = setTimeout(() => notification.remove(), duration);
    let startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      progressBar.style.width = `${100 - (elapsed / duration) * 100}%`;
      if (elapsed >= duration) clearInterval(interval);
    }, 50);

    // Close button logic
    closeBtn.onclick = () => {
      clearTimeout(timeout);
      clearInterval(interval);
      notification.remove();
    };

    this.container.appendChild(notification);
  },
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
        return { error: await response.json().error || `API error: ${response.status} - ${response.statusText}`, success: false };
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
      Notifications.show({ type: 'error', message: `Login failed: ${error.message}. Report at GitHub/Discord if persistent.` });
    }
  },

  async register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    const data = await API.post('/api/register', { username, password });
    Notifications.show({ type: data.success ? 'success' : 'error', message: data.success ? 'Registration successful! Please login.' : `Registration failed: ${data.error || 'Unknown error'}` });
  },

  async setup2FA() {
    const data = await API.post('/api/setup_2fa');
    if (!data.success) {
      Notifications.show({ type: 'error', message: `Error setting up 2FA: ${data.error}` });
      return;
    }

    const blob = await (await fetch(`${API_BASE}/api/2fa_qrcode`, { headers: { 'Authorization': `Bearer ${state.token}` } })).blob();
    document.getElementById('2faQrCode').src = URL.createObjectURL(blob);
    document.getElementById('2faQrCode').style.display = 'block';
    UI.toggleVisibility('mainContent', 'none');
    UI.toggleVisibility('2faSetupPage');
  },

  async enable2FA() {
    const code = document.getElementById('2faCode').value;
    const data = await API.post('/api/verify_2fa', { token: code });
    if (data.success) {
      Notifications.show({ type: 'success', message: `2FA enabled! Backup code: ${backupCode}` });
      location.reload();
    } else {
      Notifications.show({ type: 'error', message: 'Failed to enable 2FA.' });
    }
  },

  async disable2FA() {
    const data = await API.post('/api/disable_2fa');
    if (data.success) {
      Notifications.show({ type: 'success', message: '2FA disabled!' });
      location.reload();
    } else {
      Notifications.show({ type: 'error', message: 'Failed to disable 2FA.' });
    }
  },

  async deleteAccount() {
    const confirmation = await Modal.prompt("Enter 'CONFIRM' to delete your account:");
    if (confirmation !== 'CONFIRM') return;

    const data = await API.post('/api/delete_account');
    if (data.success) {
      localStorage.removeItem('token');
      Notifications.show({ type: 'success', message: 'Account deleted successfully!' });
      location.reload();
    } else {
      Notifications.show({ type: 'error', message: 'Failed to delete account.' });
    }
  },

  async redeemCreatorCode() {
    const code = await Modal.prompt('Enter code:');
    if (!code) return;
    const data = await API.post('/api/redeem_creator_code', { code });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success
        ? `Creator code redeemed! Extra tokens: ${data.extra_tokens} | Extra pets: ${data.extra_pets}`
        : 'Error redeeming creator code.'
    });
  },

  async sendTokens() {
    const recipient = await Modal.prompt('Enter recipient:');
    if (!recipient) return;
    const amount = await Modal.prompt('Enter amount:');
    if (!amount) return;
    const data = await API.post('/api/send_tokens', { recipient, amount });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Tokens sent successfully!' : 'Error sending tokens.'
    });
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
      Sounds.error.play();
      localStorage.removeItem('token');
      location.reload();
      return;
    }

    this.updateAccountUI(data);
    state.items = data.items;
    state.oldPets = state.pets;
    state.pets = data.pets;
    state.account = data;

    if ((state.inventoryPage - 1) * ITEMS_PER_PAGE >= state.items.length) state.inventoryPage = 1;
    Inventory.render(Inventory.filter(state.items));
    Pets.render(state.pets);
  },

  updateAccountUI(data) {
    document.getElementById('tokens').textContent = data.tokens;
    document.getElementById('level').textContent = data.level;
    document.getElementById('expText').textContent = `${data.exp}/${expForLevel(data.level + 1)} EXP`;
    document.getElementById('usernameDisplay').innerHTML = `${data.plan === "proplus" ? "🌟" : (data.plan === "pro" ? "⭐️" : "")} <span id="usernameDisplayText">${data.username}</span>`;

    if (data.plan == "pro" || data.plan == "proplus") {
      document.getElementById('usernameDisplayText').classList.add('gold-text');
    }

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
      actions.appendChild(this.createButton('👨‍⚖️ Auction', 'btn-secondary', () => Auction.createAuction(item.id)));
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
    if (item.error) {
      Sounds.error.play();
      return await Modal.alert(`Error creating item: ${item.error}`);
    }
    Sounds.itemCreate.play();

    let itemDiv = document.createElement("DIV");

    let h2 = document.createElement("h2")

    const rarity = item.level.toLowerCase();
    h2.innerText += "New " + rarity + " item!";

    if (["rare", "epic", "legendary", "godlike"].includes(rarity)) {
      const colors = {
        rare: ['#0000ff', '#00ffff'],
        epic: ['#bd1fdd', '#ff00ff'],
        legendary: ['#ffa500', '#ffff00'],
        godlike: ['#ffff00', '#ffffff']
      };

      confetti({
        particleCount: 200,
        spread: rarity === 'godlike' ? 360 : 180,
        colors: colors[rarity],
        origin: { x: 0.5, y: 0 },
        shapes: ['circle', 'star']
      });

      if (rarity === 'godlike') {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 60,
            spread: 120,
            origin: { x: 0, y: 0.7 }
          });
          confetti({
            particleCount: 100,
            angle: 120,
            spread: 120,
            origin: { x: 1, y: 0.7 }
          });
        }, 250);
      }
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
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Item recycled successfully!' : 'Failed to recycle item.'
    });
    if (data.success) Auth.refreshAccount();
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
      const ownerPlan = item.ownerPlan || 'free'; // Assume 'free' if no plan info
      const ownerDisplay = ownerPlan === 'proplus' ? `🌟 <span class="gold-text">${item.owner}</span>` :
        ownerPlan === 'pro' ? `⭐️ <span class="gold-text">${item.owner}</span>` :
          item.owner;
      li.innerHTML = `
                <div class="item-header">
                    <span class="item-icon">${item.name.icon}</span>
                    <span class="item-name">${item.name.adjective} ${item.name.material} ${item.name.noun} ${item.name.suffix} #${item.name.number}</span>
                </div>
                <div class="item-details">
                    <span class="item-level">⚔️ ${item.rarity} ${item.level}</span>
                    <span class="item-price">💰 ${item.price} tokens</span>
                    <span class="item-seller">👤 ${ownerDisplay}</span>
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
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Item purchased successfully!' : 'Error purchasing item.'
    });
    if (data.success) {
      Auth.refreshAccount();
      this.refresh();
    }
  }
};

// Casino
const Casino = {
  async bet(choice) {
    function animateCoinFlip(result, won, betAmount, winnings) {
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
    }

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

    animateCoinFlip(data.result, data.won, betAmount, data.winnings);
    Auth.refreshAccount();
  },

  async rollDice() {
    function animateDiceRoll(result, won, betAmount, winnings) {
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
    animateDiceRoll(data.result, data.won, betAmount, data.winnings);
    Auth.refreshAccount(); // Update user's token display
  },

  async claimDailyFreeSpin() {
    const spinWheel = document.getElementById('spinWheel');
    const spinResult = document.getElementById('spinResult');
    spinWheel.style.display = 'block';
    spinResult.style.display = 'block';
    spinWheel.style.animation = 'spin 3s ease-in-out';
    spinResult.textContent = 'Spinning...';
    spinResult.style.display = 'block';

    const data = await API.post('/api/daily_free_spin');

    setTimeout(() => {
      spinWheel.style.animation = '';
      if (data.success) {
        spinResult.textContent = `You won ${data.reward} tokens!`;
        Auth.refreshAccount();
      } else {
        spinResult.textContent = `Error: ${data.error}`;
      }
      setTimeout(() => spinResult.style.display = 'none', 3000);
    }, 3000);
  },

  createSpinWheel() {
    const spinWheel = document.getElementById('spinWheel');
    spinWheel.style.width = '200px';
    spinWheel.style.height = '200px';
    spinWheel.style.border = '10px solid #ccc';
    spinWheel.style.borderRadius = '50%';
    spinWheel.style.position = 'relative';
    spinWheel.style.margin = '20px auto';

    const spinResult = document.getElementById('spinResult');
    spinResult.style.textAlign = 'center';
    spinResult.style.marginTop = '10px';
    spinResult.style.fontSize = '18px';
  }
};

Casino.createSpinWheel();

// Pet Management
const Pets = {
  async render() {
    if (JSON.stringify(state.pets) === JSON.stringify(state.oldPets)) return;

    const container = document.getElementById('petContainer');
    container.innerHTML = '';

    state.pets.forEach(pet => {
      const petCard = document.createElement('div');
      petCard.className = `pet-card ${pet.status} fade-in`;
      petCard.setAttribute('data-pet-id', pet.id);
      petCard.innerHTML = `
        <div class="pet-header">
          <span class="pet-name">${pet.name} ${pet.alive ? '' : '(Dead)'}</span>
          <span class="pet-type">${this.getTypeIcon(pet.name)}</span>
        </div>
        <div class="pet-status">
          <div class="status-bar hunger">
            <div class="status-fill" style="width: ${pet.hunger}%"></div>
            <span class="status-text">🍖 ${this.getHungerText(pet.hunger)}</span>
          </div>
          <div class="status-bar happiness">
            <div class="status-fill" style="width: ${pet.happiness}%"></div>
            <span class="status-text">❤️ ${this.getHappinessText(pet.happiness)}</span>
          </div>
        </div>
        <div class="pet-actions">
          <button class="btn btn-feed" onclick="Pets.feed('${pet.id}')">
            🍖 Feed (10 tokens)
          </button>
          <button class="btn btn-play" onclick="Pets.play('${pet.id}')">
            🎾 Play (Free)
          </button>
        </div>
        <div class="pet-level">
          Level ${pet.level} • ${pet.exp}/${expForLevel(pet.level + 1)} until next level
        </div>
        <div class="pet-benefits">
          +${pet.benefits.token_bonus} tokens per mine <br>
        </div>
      `;
      container.appendChild(petCard);
    });

    if (!state.pets.length) {
      container.innerHTML = `
        <div class="no-pets">
          <p>No pets yet! Adopt one below 🐾</p>
        </div>
      `;
    }
  },

  async buy() {
    if (!await Modal.confirm(`Adopt a pet for 100 tokens?`)) return;

    const data = await API.post('/api/buy_pet');
    if (data.success) {
      this.showAnimation('✨', 'New pet added!');
      Auth.refreshAccount();
    } else {
      Modal.alert(`Failed to adopt: ${data.error}`);
    }
  },

  async feed(petId) {
    const data = await API.post('/api/feed_pet', { pet_id: petId });
    if (data.success) {
      this.showAnimation('❤️', '+10 Happiness & +10 Hunger', petId);
      this.render();
      Auth.refreshAccount();
    }
  },

  async play(petId) {
    const data = await API.post('/api/play_with_pet', { pet_id: petId });
    if (data.success) {
      this.showAnimation('⚡', '+5 XP & +5 Happiness', petId);
      this.render();
    }
  },

  // Helper functions
  getTypeIcon(type) {
    return {
      Dragon: '🐉',
      Pheonix: '🦅',
      Raven: '🦅',
      Eagle: '🦅',
      Cheetah: '🐆',
      Lion: '🦁',
      Panther: '🐆',
      Tiger: '🐅',
      Wolf: '🐺',
      Bear: '🐻',
      Fox: '🦊',
      Cat: '🐱',
      Dog: '🐶',
      Hound: '🐕',
      Hawk: '🦅',
    }[type] || '❓';
  },

  getHungerText(percent) {
    if (percent > 75) return 'Stuffed!';
    if (percent > 50) return 'Content';
    if (percent > 25) return 'Peckish';
    return 'Hungry!';
  },

  getHappinessText(percent) {
    if (percent > 75) return 'Ecstatic!';
    if (percent > 50) return 'Happy';
    if (percent > 25) return 'Bored';
    return 'Depressed!';
  },

  showAnimation(emoji, text, petId) {
    const animDiv = document.createElement('div');
    animDiv.className = 'pet-animation';
    animDiv.innerHTML = `
      <span class="emoji">${emoji}</span>
      <span class="text">${text}</span>
    `;

    if (petId) {
      const petCard = document.querySelector(`[data-pet-id="${petId}"]`);
      petCard.appendChild(animDiv);
    } else {
      document.body.appendChild(animDiv);
    }

    setTimeout(() => animDiv.remove(), 2000);
  },

  async showHelp() {
    const helpText = `
      <h3>Pet Care Guide</h3>
      <p>Pets require food and playtime to stay happy and healthy.</p>
      <p>Feed your pet to increase its hunger and happiness.</p>
      <p>Play with your pet to increase its happiness and experience points.</p>
      <p>Leveling up your pet increases its stats and unlocks new abilities!</p>
    `;
    await Modal.alert(helpText);
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
    } else {
      Sounds.error.play();
      await Modal.alert(`Error sending message: ${data.error}`);
    }
  },

  async refresh() {
    const data = await API.get('/api/get_messages?room=' + state.currentRoom || 'global');
    if (!data.messages || data.messages.length === state.globalMessages.length) return;

    const container = document.getElementById('globalMessages');
    container.innerHTML = '';
    data.messages.forEach(msg => this.append(msg));
    state.globalMessages = data.messages;
  },

  switchRoom(roomName) {
    const userPlan = state.account.plan || 'free';
    const userType = state.account.type;
    if (roomName === 'exclusive' && !['pro', 'proplus'].includes(userPlan) && userType !== 'admin') {
      Modal.alert('Access denied: Exclusive chat is only for PRO, PRO+, and Admins.');
      return;
    }

    if (roomName === 'staff' && !['mod', 'admin'].includes(userType)) {
      Modal.alert('Access denied: Staff chat is only for Mods and Admins.');
      return;
    }

    else if (roomName !== 'global') {
      Modal.alert('Invalid room name. Please choose a valid room.');
    }

    state.currentRoom = roomName;
    this.refresh();
    Notifications.show({ type: 'success', message: `Switched to ${roomName} chat.` });
  },

  append(message) {
    const container = document.getElementById('globalMessages');
    const isOwn = message.username === state.account.username;
    const type = message.type || 'user';

    if (!state.isChatFocused) {
      state.unreadMessages++;
      Sounds.notification.play();
      document.querySelector('[data-tab="chat"]').classList.add('new-messages');
    }

    const messagePrefix = message.badges ? message.badges.join(' ') : '';

    const messageEl = document.createElement('div');
    messageEl.className = `message ${type} ${isOwn ? 'own-message' : ''}`;
    messageEl.innerHTML = `
            <div class="message-header">
                <span class="message-sender ${type}" title="${type.charAt(0).toUpperCase() + type.slice(1)}">
                    ${messagePrefix} <span class="${(message.username_colour === "gold") ? "gold-text" : ""}">${message.username}</span>
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
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Cooldown reset!' : 'Error resetting cooldown.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async editTokens(username = null) {
    const tokens = await Modal.prompt('Enter tokens:');
    if (!tokens) return;
    const data = await API.post('/api/edit_tokens', username ? { username, tokens: parseFloat(tokens) } : { tokens: parseFloat(tokens) });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Tokens edited!' : 'Error editing tokens.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async editExp(username = null) {
    const exp = await Modal.prompt('Enter exp:');
    if (!exp) return;
    const data = await API.post('/api/edit_exp', username ? { username, exp: parseFloat(exp) } : { exp: parseFloat(exp) });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Exp edited!' : 'Error editing exp.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async editLevel(username = null) {
    const level = await Modal.prompt('Enter level:');
    if (!level) return;
    const data = await API.post('/api/edit_level', username ? { username, level: parseFloat(level) } : { level: parseFloat(level) });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Level edited!' : 'Error editing level.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async editItem(itemId) {
    const newName = await Modal.prompt('Enter new name (blank for no change):');
    const newIcon = await Modal.prompt('Enter new icon (blank for no change):');
    const newRarity = await Modal.prompt('Enter new rarity (blank for no change):');
    const data = await API.post('/api/edit_item', { item_id: itemId, new_name: newName, new_icon: newIcon, new_rarity: newRarity });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Item edited!' : 'Error editing item.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async deleteItem(itemId) {
    if (!await Modal.confirm('Are you sure you want to delete this item?')) return;
    const data = await API.post('/api/delete_item', { item_id: itemId });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Item deleted!' : 'Error deleting item.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async addAdmin() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/add_admin', { username });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Admin added!' : 'Error adding admin.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async removeAdmin() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/remove_admin', { username });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Admin removed!' : 'Error removing admin.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async addMod() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/add_mod', { username });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Mod added!' : 'Error adding mod.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async removeMod() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/remove_mod', { username });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Mod removed!' : 'Error removing mod.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async addMedia() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/add_media', { username });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Media added!' : 'Error adding media.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async removeMedia() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/remove_media', { username });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Media removed!' : 'Error removing media.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async banUser() {
    const username = await Modal.prompt('Enter username to ban:');
    if (!username) return;
    const reason = await Modal.prompt('Enter reason for banning:');
    if (!reason) return;
    const length = await Modal.prompt('Enter ban length (e.g., 1h, 1d, perma):');
    if (!length) return;
    const data = await API.post('/api/ban_user', { username, reason, length });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'User banned!' : 'Error banning user.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async unbanUser() {
    const username = await Modal.prompt('Enter username to unban:');
    if (!username) return;
    const data = await API.post('/api/unban_user', { username });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'User unbanned!' : 'Error unbanning user.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async muteUser() {
    const username = await Modal.prompt('Enter username to mute:');
    if (!username) return;
    const length = await Modal.prompt('Enter mute length (e.g., 1h, 1d, perma):');
    if (!length) return;
    const data = await API.post('/api/mute_user', { username, length });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'User muted!' : 'Error muting user.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async unmuteUser() {
    const username = await Modal.prompt('Enter username to unmute:');
    if (!username) return;
    const data = await API.post('/api/unmute_user', { username });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'User unmuted!' : 'Error unmuting user.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async fineUser() {
    const username = await Modal.prompt('Enter username to fine:');
    if (!username) return;
    const amount = await Modal.prompt('Enter fine amount:');
    if (!amount) return;
    const data = await API.post('/api/fine_user', { username, amount: parseFloat(amount) });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'User fined!' : 'Error fining user.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async setBanner() {
    const banner = await Modal.prompt('Enter banner:');
    if (!banner) return;
    const data = await API.post('/api/set_banner', { banner });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Banner set!' : 'Error setting banner.'
    });
    if (data.success) this.refreshBanner();
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
      Modal.alert(container.innerHTML);
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
        const userPlan = user.plan || 'free'; // Assume 'free' if no plan info
        const userDisplay = userPlan === 'proplus' ? `🌟 <span class="gold-text">${user.username}</span>` :
          userPlan === 'pro' ? `⭐️ <span class="gold-text">${user.username}</span>` :
            user.username;
        div.innerHTML = `
  ${user.place <= 3 ? ['🥇', '🥈', '🥉'][user.place - 1] : '🏅'} 
  ${user.place}: ${userDisplay} 
  <span class="tokens-badge">${user.tokens} tokens</span>
`;
        leaderboard.appendChild(div);
      });
    }
  },

  async refreshStats() {
    const data = await API.get('/api/stats');

    function animateCounter(element, final) {
      let current = parseInt(element.textContent) || 0;
      const duration = 2000;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        element.textContent = Math.floor(progress * (final - current) + current);
        if (progress < 1) requestAnimationFrame(step);
      };
      let start;
      requestAnimationFrame(step);
    }

    if (data.stats) {
      const totalTokens = document.getElementById('totalTokens');
      const totalAccounts = document.getElementById('totalAccounts');
      const totalItems = document.getElementById('totalItems');

      animateCounter(totalTokens, data.stats.total_tokens);
      animateCounter(totalAccounts, data.stats.total_accounts);
      animateCounter(totalItems, data.stats.total_items);
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
      Modal.alert(container.innerHTML);
    }
  },

  async deleteUser() {
    const username = await Modal.prompt('Enter username to delete:');
    if (!username) return;
    const data = await API.post('/api/delete_user', { username });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'User deleted!' : 'Error deleting user.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async createCreatorCode() {
    const code = await Modal.prompt('Enter code:');
    if (!code) return;
    const extraTokens = parseInt(await Modal.prompt('Enter extra tokens:')) || 0;
    if (!extraTokens) return;
    const extraPets = parseInt(await Modal.prompt('Enter extra pets:')) || 0;
    if (!extraPets) return;

    const data = await API.post('/api/create_creator_code', { code, tokens: extraTokens, pets: extraPets });

    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Creator code created!' : 'Error creating creator code.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async deleteCreatorCode() {
    const code = await Modal.prompt('Enter code:');
    if (!code) return;
    if (!await Modal.confirm(`Are you sure you want to delete the creator code: ${code}?`)) return;
    const data = await API.post('/api/delete_creator_code', { code });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Creator code deleted!' : 'Error deleting creator code.'
    });
    if (data.success) Auth.refreshAccount();
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
      Notifications.show({
        type: 'normal',
        message: container.innerHTML,
        duration: 10000
      });
    }
  },

  async restorePet() {
    const petId = await Modal.prompt('Enter pet ID:');
    if (!petId) return;
    const data = await API.post('/api/restore_pet', { pet_id: petId });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Pet restored!' : 'Error restoring pet.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async deleteAuction(itemId) {
    const data = await API.post('/api/delete_auction', { item_id: itemId });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Auction deleted!' : 'Error deleting auction.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async fetchReports() {
    const data = await API.get('/api/reports');
    const reports = data.reports || [];
    const container = document.getElementById('reportsContainer');
    container.innerHTML = '';

    reports.forEach(report => {
      const reportDiv = document.createElement('div');
      reportDiv.className = 'report';
      reportDiv.innerHTML = `
        <p><strong>Reported User:</strong> ${report.username}</p>
        <p><strong>Comment:</strong> ${report.comment}</p>
        <p><strong>Submitted By:</strong> ${report.reportedBy}</p>
        <button class="btn btn-danger" onclick="Admin.handleReportAction('${report.id}', 'ban')">Ban</button>
        <button class="btn btn-danger" onclick="Admin.handleReportAction('${report.id}', 'mute')">Mute</button>
        <button class="btn btn-secondary" onclick="Admin.handleReportAction('${report.id}', 'cancel')">Cancel</button>
      `;

      container.appendChild(reportDiv);
    });
  },

  async handleReportAction(reportId, action) {
    let duration = null;
    let reason = null;

    if (action === 'ban' || action === 'mute') {
      duration = await Modal.prompt('Enter duration (e.g., 1h, 1d):');
      if (!duration) return;
    }
    if (action === 'ban') {
      reason = await Modal.prompt('Enter reason for ban:');
      if (!reason) return;
    }

    const response = await API.post('/api/handle_report', { reportId, action, duration, reason });
    if (response.success) {
      Notifications.show({ type: 'success', message: 'Action completed successfully!' });
      this.fetchReports();
    } else {
      Notifications.show({ type: 'error', message: response.error || 'Failed to complete action.' });
    }
  },

  async givePlan() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const plan = await Modal.prompt('Enter plan (pro/proplus):');
    if (!plan) return;
    const duration = await Modal.prompt('Enter duration (e.g., 1m, 1y):');
    if (!duration) return;
    const data = await API.post('/api/give_plan', { username, plan, duration });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Plan given!' : 'Error giving plan.'
    });
    if (data.success) Auth.refreshAccount();
  },

  async removePlan() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/remove_plan', { username });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Plan removed!' : 'Error removing plan.'
    });
    if (data.success) Auth.refreshAccount();
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

// Sound Effects
const Sounds = {
  itemCreate: new Audio('sounds/item-create.mp3'),
  error: new Audio('sounds/error.mp3'),
  success: new Audio('sounds/success.mp3'),
  notification: new Audio('sounds/notification.mp3'),
};

const TypingIndicator = {
  typingUsers: new Set(),

  startTyping(username) {
    this.typingUsers.add(username);
    this.updateIndicator();
  },

  stopTyping(username) {
    this.typingUsers.delete(username);
    this.updateIndicator();
  },

  updateIndicator() {
    const indicator = document.getElementById('typingIndicator');
    const typingArray = Array.from(this.typingUsers);
    const maxDisplay = 3;

    if (this.typingUsers.size > 0) {
      const displayedUsers = typingArray.slice(0, maxDisplay).join(', ');
      const othersCount = this.typingUsers.size - maxDisplay;
      indicator.textContent = othersCount > 0
        ? `${displayedUsers}, and ${othersCount} others are typing...`
        : `${displayedUsers} ${this.typingUsers.size > 1 ? 'are' : 'is'} typing...`;
      indicator.style.display = 'block';
    } else {
      indicator.style.display = 'none';
    }
  },
};

// Auction System
const Auction = {
  async fetchAuctions() {
    const data = await API.get('/api/auctions');
    this.render(data.auctions);
  },

  render(auctions) {
    const auctionList = document.getElementById('auctionList');
    auctionList.innerHTML = '';
    auctions.forEach(auction => {
      const li = document.createElement('li');
      const name = `${auction.itemName.adjective} ${auction.itemName.material} ${auction.itemName.noun} ${auction.itemName.suffix} #${auction.itemName.number}`;
      li.innerHTML = `
        ${name} (${auction.itemRarity.rarity} ${auction.itemRarity.level}) - Current Bid: ${auction.currentBid} tokens
        <button class="btn btn-primary" onclick="Auction.placeBid('${auction.itemId}')">Bid</button>
        ${(state.account.username === auction.owner || state.account.type === "admin") ? `<button class="btn btn-danger" onclick="Auction.stopAuction('${auction.itemId}')">Stop Auction</button>` : ''}
        ${(state.account.type === "admin") ? `<button class="btn btn-danger" onclick="Admin.deleteAuction('${auction.itemId}')">Delete Auction</button>` : ''}
      `;
      auctionList.appendChild(li);
    });
  },

  async createAuction(itemId) {
    const startingBid = await Modal.prompt('Enter starting bid:');
    const data = await API.post('/api/create_auction', { itemId, startingBid });
    if (data.success) {
      Notifications.show({
        type: 'success',
        message: 'Auction created successfully!',
        duration: 5000
      });
      Sounds.success.play();
    } else {
      Notifications.show({
        type: 'error',
        message: data.error || 'Failed to create auction.',
        duration: 5000
      });
      Sounds.error.play();
    }
    this.fetchAuctions();
  },

  async placeBid(itemId) {
    const bidAmount = await Modal.prompt('Enter your bid amount:');
    const response = await API.post('/api/place_bid', { itemId, bidAmount });
    if (response.success) {
      Notifications.show({
        type: 'success',
        message: 'Bid placed successfully!',
        duration: 5000
      });
      Sounds.success.play();
      this.fetchAuctions();
    } else {
      Notifications.show({
        type: 'error',
        message: response.error || 'Failed to place bid.',
        duration: 5000
      });
      Sounds.error.play();
    }
  },

  async stopAuction(itemId) {
    const response = await API.post('/api/stop_auction', { itemId });
    if (response.success) {
      Notifications.show({
        type: 'success',
        message: 'Auction stopped successfully!',
        duration: 5000
      });
      Sounds.success.play();
      this.fetchAuctions();
    } else {
      Notifications.show({
        type: 'error',
        message: response.error || 'Failed to stop auction.',
        duration: 5000
      });
      Sounds.error.play();
    }
  }
};

// Event Listeners
const initEventListeners = () => {
  // Tabs
  document.querySelectorAll('.tab').forEach(btn =>
    btn.addEventListener('click', () => UI.switchTab(btn.dataset.tab))
  );

  // Chat Typing
  const messageInput = document.getElementById('messageInput');
  let typingTimeout;

  messageInput.addEventListener('input', () => {
    clearTimeout(typingTimeout);
    API.post('/api/start_typing', { room: 'global' });
    typingTimeout = setTimeout(() => {
      API.post('/api/stop_typing', { room: 'global' });
    }, 3000);
  });

  // Inventory Actions
  document.getElementById('createItem').addEventListener('click', Inventory.create);
  document.getElementById('mineItem').addEventListener('click', async () => {
    const data = await API.post('/api/mine_tokens');
    if (data.error) {
      Sounds.error.play();
      Notifications.show({ type: 'error', message: `Error mining tokens: ${data.error}` });
    } else {
      Sounds.success.play();
      Notifications.show({ type: 'success', message: `Mined ${data.tokens} tokens!` });
      Auth.refreshAccount();
    }
  });

  document.getElementById('takeItem').addEventListener('click', async () => {
    const secret = await Modal.prompt('Enter secret:');
    if (!secret) return;
    const data = await API.post('/api/take_item', { item_secret: secret });
    Notifications.show({
      type: data.success ? 'success' : 'error',
      message: data.success ? 'Item taken!' : 'Error taking item.'
    });
    if (data.success) {
      Auth.refreshAccount();
      Market.refresh();
    }
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
    deleteUserAdmin: Admin.deleteUser,
    restorePetAdmin: Admin.restorePet,
    givePlanAdmin: Admin.givePlan,
    removePlanAdmin: Admin.removePlan,
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

  const emojiPicker = document.getElementById('emojiPicker');

  // Fetch emoji list from emojis.json
  fetch('/emojis.json')
    .then(response => response.json())
    .then(data => {
      data.forEach(emoji => {
        const span = document.createElement('span');
        span.textContent = emoji;
        span.onclick = () => {
          document.getElementById('messageInput').value += emoji;
          document.getElementById('messageInput').focus();
        };
        emojiPicker.appendChild(span);
      });
    })
    .catch(error => console.error('Error loading emojis:', error));

  document.getElementById('emojiToggle').addEventListener('click', function (e) {
    e.preventDefault();
    emojiPicker.classList.toggle('show');
  });

  // Report User Form Submission
  document.getElementById('reportUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reportUsername').value.trim();
    const comment = document.getElementById('reportComment').value.trim();

    if (!username || !comment) return;

    const response = await API.post('/api/report_user', { username, comment });
    if (response.success) {
      Notifications.show({ type: 'success', message: 'Report submitted successfully!' });
      document.getElementById('reportUserForm').reset();
    } else {
      Notifications.show({ type: 'error', message: response.error || 'Failed to submit report.' });
    }
  });

  document.getElementById('switchToGlobal').addEventListener('click', () => Chat.switchRoom('global'));
  document.getElementById('switchToExclusive').addEventListener('click', () => Chat.switchRoom('exclusive'));
  document.getElementById('switchToStaff').addEventListener('click', () => Chat.switchRoom('staff'));
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
    Auction.fetchAuctions();
    if (state.account.type === 'admin') Admin.fetchReports();
  }, 1000);

  initEventListeners();
};

init();

document.addEventListener("DOMContentLoaded", () => {
  // Animate main content fade-in
  anime({
    targets: "#mainContent",
    opacity: [0, 1],
    duration: 1000,
    easing: "easeInOutQuad",
    begin: () => {
      document.getElementById("mainContent").style.display = "block";
    },
  });

  // Button click animation
  document.querySelectorAll(".animated-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      anime({
        targets: btn,
        scale: [1, 1.2, 1],
        duration: 300,
        easing: "easeInOutQuad",
      });
    });
  });
});