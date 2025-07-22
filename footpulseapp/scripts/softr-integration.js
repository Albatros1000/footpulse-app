import { Chart } from "@/components/ui/chart"
// Script d'intégration Softr - À ajouter dans les Custom Code blocks
;(() => {
  // Configuration
  const API_BASE_URL = "https://your-footpulse-api.vercel.app/api"
  const AIRTABLE_BASE_ID = "your_airtable_base_id"

  // Fonction pour synchroniser les données avec l'API FootPulse
  async function syncWithFootPulseAPI(action, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/softr-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.softrUser?.token}`,
        },
        body: JSON.stringify({ action, data }),
      })

      return await response.json()
    } catch (error) {
      console.error("Erreur sync FootPulse:", error)
    }
  }

  // Mise à jour en temps réel des scores
  function updatePlayerScores() {
    const scoreElements = document.querySelectorAll("[data-player-score]")

    scoreElements.forEach(async (element) => {
      const playerId = element.getAttribute("data-player-id")

      try {
        const response = await fetch(`${API_BASE_URL}/player/${playerId}/stats`)
        const stats = await response.json()

        // Mise à jour du score global
        element.textContent = stats.globalScore

        // Animation du changement
        element.classList.add("score-updated")
        setTimeout(() => element.classList.remove("score-updated"), 1000)
      } catch (error) {
        console.error("Erreur récupération stats:", error)
      }
    })
  }

  // Gestion de l'upload vidéo dans Softr
  function initVideoUpload() {
    const uploadButtons = document.querySelectorAll("[data-video-upload]")

    uploadButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const playerId = button.getAttribute("data-player-id")
        const fileInput = document.createElement("input")
        fileInput.type = "file"
        fileInput.accept = "video/*"

        fileInput.onchange = async (e) => {
          const file = e.target.files[0]
          if (!file) return

          // Afficher le loader
          button.innerHTML = '<span class="loader"></span> Analyse en cours...'
          button.disabled = true

          try {
            // Upload et analyse
            const formData = new FormData()
            formData.append("video", file)
            formData.append("playerId", playerId)

            const response = await fetch(`${API_BASE_URL}/upload-and-analyze`, {
              method: "POST",
              body: formData,
            })

            const result = await response.json()

            if (result.success) {
              // Mise à jour de l'interface Softr
              await updateSoftrRecord(playerId, result.analysis)

              // Notification
              showNotification("Analyse terminée !", "success")

              // Recharger la page pour afficher les nouveaux résultats
              setTimeout(() => window.location.reload(), 2000)
            }
          } catch (error) {
            showNotification("Erreur lors de l'analyse", "error")
          } finally {
            button.innerHTML = "Analyser une vidéo"
            button.disabled = false
          }
        }

        fileInput.click()
      })
    })
  }

  // Mise à jour d'un enregistrement Softr/Airtable
  async function updateSoftrRecord(playerId, analysisData) {
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Players/${playerId}`

    await fetch(airtableUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          "Global Score": analysisData.globalScore,
          Technique: analysisData.technique,
          Vitesse: analysisData.vitesse,
          Physique: analysisData.physique,
          Mental: analysisData.mental,
          Tactique: analysisData.tactique,
          Precision: analysisData.precision,
          "Last Analysis": new Date().toISOString(),
          "Analysis Status": "Completed",
        },
      }),
    })
  }

  // Système de notifications
  function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 5000)
  }

  // Radar chart pour Softr
  function initRadarCharts() {
    const radarContainers = document.querySelectorAll("[data-radar-chart]")

    radarContainers.forEach(async (container) => {
      const playerId = container.getAttribute("data-player-id")

      try {
        const response = await fetch(`${API_BASE_URL}/player/${playerId}/stats`)
        const stats = await response.json()

        // Créer le radar chart avec Chart.js
        const canvas = document.createElement("canvas")
        container.appendChild(canvas)

        new Chart(canvas, {
          type: "radar",
          data: {
            labels: ["Technique", "Vitesse", "Physique", "Mental", "Tactique", "Précision"],
            datasets: [
              {
                label: "Performance",
                data: [stats.technique, stats.vitesse, stats.physique, stats.mental, stats.tactique, stats.precision],
                backgroundColor: "rgba(56, 189, 248, 0.2)",
                borderColor: "#38BDF8",
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              r: {
                beginAtZero: true,
                max: 100,
              },
            },
          },
        })
      } catch (error) {
        console.error("Erreur radar chart:", error)
      }
    })
  }

  // Initialisation au chargement de la page
  document.addEventListener("DOMContentLoaded", () => {
    initVideoUpload()
    updatePlayerScores()
    initRadarCharts()

    // Mise à jour périodique des scores
    setInterval(updatePlayerScores, 30000) // Toutes les 30 secondes
  })

  // CSS pour les animations
  const style = document.createElement("style")
  style.textContent = `
    .score-updated {
      animation: scoreUpdate 1s ease-in-out;
    }
    
    @keyframes scoreUpdate {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); color: #38BDF8; }
      100% { transform: scale(1); }
    }
    
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    }
    
    .notification-success {
      background: #10B981;
      color: white;
    }
    
    .notification-error {
      background: #EF4444;
      color: white;
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    
    .loader {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #38BDF8;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(style)
})()
