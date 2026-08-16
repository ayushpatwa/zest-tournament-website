/**
 * ZEST TOURNAMENT - FREE FIRE BRACKETS & LEADERBOARD
 */

const BracketsLeaderboard = (function () {
  const topPlayers = [
    { rank: 1, name: '⚡ Toxic_Sniper', uid: 'FF#90412891', kills: 142, booyahs: 24, earnings: '₹14,500' },
    { rank: 2, name: '🔥 Headshot_King_99', uid: 'FF#34281900', kills: 128, booyahs: 19, earnings: '₹11,200' },
    { rank: 3, name: '👑 Zest_Raistar', uid: 'FF#77189201', kills: 115, booyahs: 16, earnings: '₹9,800' },
    { rank: 4, name: '🎯 Bermuda_Predator', uid: 'FF#55019234', kills: 98, booyahs: 14, earnings: '₹7,400' },
    { rank: 5, name: '🛡️ GlooGod_Aman', uid: 'FF#12993847', kills: 92, booyahs: 11, earnings: '₹6,150' }
  ];

  function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-tbody');
    if (!tbody) return;

    tbody.innerHTML = topPlayers.map(p => {
      let rankClass = p.rank === 1 ? 'rank-1' : p.rank === 2 ? 'rank-2' : p.rank === 3 ? 'rank-3' : '';
      return `
        <tr>
          <td>
            <span class="rank-badge ${rankClass}">#${p.rank}</span>
          </td>
          <td>
            <div class="player-info-cell">
              <div class="player-avatar">${p.name.substring(2, 4).toUpperCase()}</div>
              <div>
                <strong style="color: #FFF; display: block;">${p.name}</strong>
                <span style="font-size: 0.8rem; color: var(--text-muted);">UID: ${p.uid}</span>
              </div>
            </div>
          </td>
          <td><strong style="color: var(--color-primary-light);">${p.kills}</strong></td>
          <td><strong style="color: var(--color-secondary);">${p.booyahs} 🏆</strong></td>
          <td><strong style="color: var(--color-accent-green); font-family: var(--font-heading); font-size: 1.1rem;">${p.earnings}</strong></td>
        </tr>
      `;
    }).join('');
  }

  return {
    init: function () {
      renderLeaderboard();
    }
  };
})();

window.BracketsLeaderboard = BracketsLeaderboard;
