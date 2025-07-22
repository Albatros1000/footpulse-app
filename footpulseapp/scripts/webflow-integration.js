// Script d'intégration Webflow - À ajouter dans les Custom Code
window.FootPulseWebflow = (() => {
  const API_BASE_URL = "https://your-footpulse-api.vercel.app/api"

  // Initialisation des composants dynamiques
  function init() {
    initPlayerCards()
    initSearchFilters()
    initStatsAnimations()
    setupRealTimeUpdates()
  }

  // Animation des cartes joueurs
  function initPlayerCards() {
    const playerCards = document.querySelectorAll("[data-player-card]")

    playerCards.forEach((card) => {
      const playerId = card.getAttribute("data-player-id")

      // Hover effects
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-5px)"
        card.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)"
      })

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)"
        card.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)"
      })

      // Click pour voir le profil détaillé
      card.addEventListener("click", () => {
        showPlayerModal(playerId)
      })
    })
  }

  // Système de recherche et filtres
  function initSearchFilters() {
    const searchInput = document.querySelector("[data-search-players]")
    const positionFilter = document.querySelector("[data-filter-position]")
    const scoreFilter = document.querySelector("[data-filter-score]")

    if (searchInput) {
      searchInput.addEventListener("input", debounce(filterPlayers, 300))
    }

    if (positionFilter) {
      positionFilter.addEventListener("change", filterPlayers)
    }

    if (scoreFilter) {
      scoreFilter.addEventListener("change", filterPlayers)
    }
  }

  // Filtrage des joueurs
  function filterPlayers() {
    const searchTerm = document.querySelector("[data-search-players]")?.value.toLowerCase() || ""
    const selectedPosition = document.querySelector("[data-filter-position]")?.value || "all"
    const minScore = Number.parseInt(document.querySelector("[data-filter-score]")?.value) || 0

    const playerCards = document.querySelectorAll("[data-player-card]")

    playerCards.forEach((card) => {
      const playerName = card.querySelector("[data-player-name]")?.textContent.toLowerCase() || ""
      const playerPosition = card.getAttribute("data-player-position") || ""
      const playerScore = Number.parseInt(card.getAttribute("data-player-score")) || 0

      const matchesSearch = playerName.includes(searchTerm)
      const matchesPosition = selectedPosition === "all" || playerPosition === selectedPosition
      const matchesScore = playerScore >= minScore

      if (matchesSearch && matchesPosition && matchesScore) {
        card.style.display = "block"
        card.style.animation = "fadeIn 0.3s ease-in"
      } else {
        card.style.display = "none"
      }
    })

    // Mise à jour du compteur de résultats
    const visibleCards = document.querySelectorAll('[data-player-card][style*="display: block"]').length
    const resultCounter = document.querySelector("[data-results-count]")
    if (resultCounter) {
      resultCounter.textContent = `${visibleCards} joueur(s) trouvé(s)`
    }
  }

  // Animations des statistiques
  function initStatsAnimations() {
    const statBars = document.querySelectorAll("[data-stat-bar]")

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target
          const value = Number.parseInt(bar.getAttribute("data-stat-value"))

          // Animation de la barre
          bar.style.width = "0%"
          setTimeout(() => {
            bar.style.transition = "width 1s ease-out"
            bar.style.width = `${value}%`
          }, 100)

          // Animation du nombre
          animateNumber(bar.parentElement.querySelector("[data-stat-number]"), 0, value, 1000)
        }
      })
    })

    statBars.forEach((bar) => observer.observe(bar))
  }

  // Animation des nombres
  function animateNumber(element, start, end, duration) {
    if (!element) return

    const startTime = performance.now()

    function update(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      const current = Math.floor(start + (end - start) * progress)
      element.textContent = current

      if (progress < 1) {
        requestAnimationFrame(update)
      }
    }

    requestAnimationFrame(update)
  }

  // Modal de profil joueur
  function showPlayerModal(playerId) {
    // Créer la modal
    const modal = document.createElement("div")
    modal.className = "player-modal"
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h2>Profil Joueur</h2>
            <button onclick="this.closest('.player-modal').remove()">×</button>
          </div>
          <div class="modal-body">
            <div class="loading">Chargement...</div>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Charger les données du joueur
    loadPlayerData(playerId, modal.querySelector(".modal-body"))
  }

  // Chargement des données joueur
  async function loadPlayerData(playerId, container) {
    try {
      const response = await fetch(`${API_BASE_URL}/player/${playerId}`)
      const player = await response.json()

      container.innerHTML = `
        <div class="player-profile">
          <div class="player-header">
            <img src="${player.avatar}" alt="${player.name}" class="player-avatar">
            <div class="player-info">
              <h3>${player.name}</h3>
              <p>${player.position} • ${player.age} ans</p>
              <p>${player.club}</p>
            </div>
            <div class="player-score">
              <div class="score-value">${player.globalScore}</div>
              <div class="score-label">Score Global</div>
            </div>
          </div>
          
          <div class="player-stats">
            <h4>Statistiques</h4>
            <div class="stats-grid">
              ${Object.entries(player.stats)
                .map(
                  ([key, value]) => `
                <div class="stat-item">
                  <div class="stat-label">${key}</div>
                  <div class="stat-bar">
                    <div class="stat-fill" style="width: ${value}%"></div>
                  </div>
                  <div class="stat-value">${value}</div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
          
          <div class="player-videos">
            <h4>Dernières vidéos</h4>
            <div class="videos-grid">
              ${player.videos
                .map(
                  (video) => `
                <div class="video-item">
                  <img src="${video.thumbnail}" alt="${video.title}">
                  <div class="video-info">
                    <h5>${video.title}</h5>
                    <p>Score: ${video.score}</p>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn-primary" onclick="contactPlayer('${playerId}')">
              Contacter le joueur
            </button>
            <button class="btn-secondary" onclick="addToWishlist('${playerId}')">
              Ajouter à la wishlist
            </button>
          </div>
        </div>
      `
    } catch (error) {
      container.innerHTML = '<div class="error">Erreur lors du chargement du profil</div>'
    }
  }

  // Mises à jour en temps réel
  function setupRealTimeUpdates() {
    // WebSocket ou polling pour les mises à jour
    setInterval(async () => {
      const playerCards = document.querySelectorAll("[data-player-card]")

      for (const card of playerCards) {
        const playerId = card.getAttribute("data-player-id")

        try {
          const response = await fetch(`${API_BASE_URL}/player/${playerId}/quick-stats`)
          const stats = await response.json()

          // Mise à jour du score si changé
          const scoreElement = card.querySelector("[data-player-score]")
          if (scoreElement && scoreElement.textContent !== stats.globalScore.toString()) {
            scoreElement.textContent = stats.globalScore
            scoreElement.classList.add("score-updated")
            setTimeout(() => scoreElement.classList.remove("score-updated"), 1000)
          }
        } catch (error) {
          console.error("Erreur mise à jour:", error)
        }
      }
    }, 30000) // Toutes les 30 secondes
  }

  // Fonctions utilitaires
  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Actions globales
  window.contactPlayer = (playerId) => {
    // Logique de contact
    alert(`Contacter le joueur ${playerId}`)
  }

  window.addToWishlist = (playerId) => {
    // Logique wishlist
    alert(`Ajouté à la wishlist: ${playerId}`)
  }

  // CSS pour les composants
  const style = document.createElement("style")
  style.textContent = `
    .player-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10000;
    }
    
    .modal-overlay {
      background: rgba(0,0,0,0.8);
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .modal-content {
      background: white;
      border-radius: 12px;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      margin: 20px;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
    }
    
    .modal-header button {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
    }
    
    .player-profile {
      padding: 20px;
    }
    
    .player-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .player-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .player-score {
      text-align: center;
      margin-left: auto;
    }
    
    .score-value {
      font-size: 32px;
      font-weight: bold;
      color: #38BDF8;
    }
    
    .stats-grid {
      display: grid;
      gap: 15px;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .stat-label {
      width: 100px;
      font-weight: 500;
    }
    
    .stat-bar {
      flex: 1;
      height: 8px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .stat-fill {
      height: 100%;
      background: #38BDF8;
      transition: width 0.3s ease;
    }
    
    .videos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    
    .video-item {
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .video-item img {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }
    
    .video-info {
      padding: 10px;
    }
    
    .modal-actions {
      display: flex;
      gap: 15px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    
    .btn-primary {
      background: #38BDF8;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .btn-secondary {
      background: transparent;
      color: #38BDF8;
      border: 1px solid #38BDF8;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .score-updated {
      animation: scoreUpdate 1s ease-in-out;
    }
    
    @keyframes scoreUpdate {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); color: #38BDF8; }
      100% { transform: scale(1); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
  document.head.appendChild(style)

  return { init }
})()

// Initialisation automatique
document.addEventListener("DOMContentLoaded", () => {
  window.FootPulseWebflow.init()
})
