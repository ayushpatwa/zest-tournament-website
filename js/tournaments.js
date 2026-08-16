/**
 * ZEST TOURNAMENT - FREE FIRE TOURNAMENTS ENGINE
 * Manages Free Fire match schedules, formats, prize pools, and live registration.
 */

const TournamentsManager = (function () {
  const freeFireMatches = [
    {
      id: 'ff-cs-101',
      title: 'Free Fire MAX Clash Squad Championship 4v4',
      category: 'clash-squad',
      mode: 'Clash Squad (4v4)',
      map: 'Bermuda Remastered',
      prizePool: '₹2,500',
      firstPrize: '₹1,500',
      entryFee: '₹25',
      perKill: '₹10 / Kill',
      status: 'Live',
      slotsTotal: 16,
      slotsFilled: 13,
      schedule: 'Today at 08:30 PM',
      server: 'India (IND)',
      gunAttributes: 'OFF (Competitive)',
      badge: 'High Stakes'
    },
    {
      id: 'ff-br-102',
      title: 'Grand Battle Royale Squad War (50 Players)',
      category: 'battle-royale',
      mode: 'Battle Royale Squad',
      map: 'Purgatory',
      prizePool: '₹5,000',
      firstPrize: '₹3,000',
      entryFee: '₹30',
      perKill: '₹15 / Kill',
      status: 'Upcoming',
      slotsTotal: 48,
      slotsFilled: 39,
      schedule: 'Tonight at 09:45 PM',
      server: 'India (IND)',
      gunAttributes: 'OFF',
      badge: 'Mega Prize'
    },
    {
      id: 'ff-lw-103',
      title: 'Lone Wolf 1v1 Headshot Kings Showdown',
      category: 'lone-wolf',
      mode: 'Lone Wolf (1v1)',
      map: 'Iron Cage',
      prizePool: '₹1,000',
      firstPrize: '₹700',
      entryFee: '₹15',
      perKill: '₹50 / Headshot',
      status: 'Upcoming',
      slotsTotal: 32,
      slotsFilled: 28,
      schedule: 'Tomorrow at 05:00 PM',
      server: 'India (IND)',
      gunAttributes: 'OFF',
      badge: '1v1 Duel'
    },
    {
      id: 'ff-solo-104',
      title: 'Bermuda Solo Survival Cup (Daily Scrim)',
      category: 'battle-royale',
      mode: 'Solo Battle Royale',
      map: 'Bermuda',
      prizePool: '₹1,800',
      firstPrize: '₹1,000',
      entryFee: 'FREE ENTRY',
      perKill: '₹8 / Kill',
      status: 'Upcoming',
      slotsTotal: 48,
      slotsFilled: 46,
      schedule: 'Tomorrow at 07:00 PM',
      server: 'India (IND)',
      gunAttributes: 'OFF',
      badge: 'Free Entry'
    },
    {
      id: 'ff-duo-105',
      title: 'Kalahari Duo Rush - No Airdrop / Pro Rules',
      category: 'battle-royale',
      mode: 'Duo Battle Royale',
      map: 'Kalahari',
      prizePool: '₹3,200',
      firstPrize: '₹2,000',
      entryFee: '₹20',
      perKill: '₹12 / Kill',
      status: 'Upcoming',
      slotsTotal: 24,
      slotsFilled: 18,
      schedule: 'Tomorrow at 09:00 PM',
      server: 'India (IND)',
      gunAttributes: 'OFF',
      badge: 'Fast Paced'
    },
    {
      id: 'ff-cs-106',
      title: 'Clash Squad 4v4 Unlimited Gloo Wall Night',
      category: 'clash-squad',
      mode: 'Clash Squad 4v4',
      map: 'Alpine',
      prizePool: '₹2,000',
      firstPrize: '₹1,200',
      entryFee: '₹20',
      perKill: 'Booyah Only',
      status: 'Upcoming',
      slotsTotal: 16,
      slotsFilled: 8,
      schedule: 'Sunday at 08:00 PM',
      server: 'India (IND)',
      gunAttributes: 'OFF',
      badge: 'Fan Favorite'
    }
  ];

  let currentCategory = 'all';
  let searchQuery = '';

  function renderMatches() {
    const grid = document.getElementById('tournaments-grid');
    if (!grid) return;

    const filtered = freeFireMatches.filter(m => {
      const matchCat = (currentCategory === 'all' || m.category === currentCategory);
      const matchSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.mode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.map.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--bg-surface-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--color-primary-light);">No Free Fire matches found</h3>
          <p style="color: var(--text-secondary); margin-top: 8px;">Try selecting another category or clear your search term.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(m => {
      const fillPercentage = Math.round((m.slotsFilled / m.slotsTotal) * 100);
      const isFree = m.entryFee.toLowerCase().includes('free');
      const isLive = m.status === 'Live';

      return `
        <div class="tournament-card" data-id="${m.id}">
          <div class="card-header-banner">
            <span class="game-mode-tag">🔥 ${m.mode}</span>
            <span class="badge ${isLive ? 'badge-live' : 'badge-gold'}">${m.badge || m.status}</span>
          </div>
          <div class="card-body">
            <h3 class="match-title">${m.title}</h3>
            
            <div class="match-meta-grid">
              <div class="meta-box">
                <span class="meta-lbl">Total Prize Pool</span>
                <span class="meta-val prize">${m.prizePool}</span>
              </div>
              <div class="meta-box">
                <span class="meta-lbl">Entry Fee</span>
                <span class="meta-val ${isFree ? 'free' : 'entry-fee'}">${m.entryFee}</span>
              </div>
              <div class="meta-box">
                <span class="meta-lbl">Map</span>
                <span class="meta-val">${m.map}</span>
              </div>
              <div class="meta-box">
                <span class="meta-lbl">Per Kill Reward</span>
                <span class="meta-val text-fire">${m.perKill}</span>
              </div>
            </div>

            <div class="slots-wrapper">
              <div class="slots-header">
                <span class="slots-count">Slots: ${m.slotsFilled}/${m.slotsTotal} Registered</span>
                <span class="text-gold" style="font-weight: 700;">${fillPercentage}% Filled</span>
              </div>
              <div class="slots-progress-bar">
                <div class="slots-fill" style="width: ${fillPercentage}%;"></div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <span class="match-time-tag">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${m.schedule}
            </span>
            <button class="btn btn-primary btn-sm" onclick="TournamentsManager.openJoinModal('${m.id}')">
              Join in App
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function setupFilters() {
    const tabs = document.querySelectorAll('.filter-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.getAttribute('data-cat') || 'all';
        renderMatches();
      });
    });

    const searchInput = document.getElementById('match-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderMatches();
      });
    }
  }

  function openJoinModal(matchId) {
    const match = freeFireMatches.find(m => m.id === matchId);
    if (!match) return;

    const modalBody = document.getElementById('join-modal-body');
    const modal = document.getElementById('join-match-modal');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge badge-fire" style="margin-bottom: 10px;">${match.mode} &bull; ${match.map}</span>
        <h3 style="font-family: var(--font-heading); font-size: 1.6rem; margin-bottom: 8px;">${match.title}</h3>
        <p style="color: var(--text-secondary); font-size: 0.95rem;">Match Schedule: <strong style="color: #FFF;">${match.schedule}</strong></p>
      </div>

      <div style="background: rgba(9, 12, 18, 0.7); border-radius: var(--radius-md); padding: 18px; border: 1px solid var(--border-subtle); margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: var(--text-muted);">Prize Pool:</span>
          <strong style="color: var(--color-secondary); font-size: 1.1rem;">${match.prizePool}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: var(--text-muted);">1st Booyah Winner:</span>
          <strong style="color: var(--color-accent-green);">${match.firstPrize}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: var(--text-muted);">Per Kill Bounty:</span>
          <strong style="color: var(--color-primary-light);">${match.perKill}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: var(--text-muted);">Entry Fee:</span>
          <strong style="color: var(--color-accent-cyan);">${match.entryFee}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">Gun Attributes:</span>
          <strong style="color: #FFF;">${match.gunAttributes}</strong>
        </div>
      </div>

      <div style="padding: 16px; background: rgba(255, 184, 0, 0.08); border-radius: var(--radius-md); border-left: 4px solid var(--color-secondary); margin-bottom: 20px;">
        <h4 style="font-family: var(--font-heading); font-size: 1.05rem; color: var(--color-secondary); margin-bottom: 4px;">🎮 How to Join Custom Room</h4>
        <p style="font-size: 0.88rem; color: var(--text-secondary);">Room ID & Password will be revealed 15 minutes before match start exclusively inside the <strong>Zest Tournament App</strong>.</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button class="btn btn-primary btn-lg dynamic-app-download" style="width: 100%;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download Zest App to Register
        </button>
      </div>
    `;

    modal.classList.add('active');
  }

  return {
    init: function () {
      setupFilters();
      renderMatches();
    },
    openJoinModal
  };
})();

window.TournamentsManager = TournamentsManager;
