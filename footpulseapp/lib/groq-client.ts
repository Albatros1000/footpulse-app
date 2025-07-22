// Client Groq optimisé pour FootPulse
export class GroqAnalyzer {
  private apiKey: string
  private baseUrl = "https://api.groq.com/openai/v1"

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY!
    if (!this.apiKey) {
      throw new Error("GROQ_API_KEY is required")
    }
  }

  async analyzePlayer(playerData: {
    name: string
    position: string
    age: number
    club?: string
    videoUrl?: string
    videoDuration?: number
  }) {
    try {
      console.log("🤖 Analyse Groq en cours pour:", playerData.name)

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            {
              role: "system",
              content: this.getSystemPrompt(),
            },
            {
              role: "user",
              content: this.getUserPrompt(playerData),
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`)
      }

      const result = await response.json()
      const analysis = this.parseAnalysis(result.choices[0].message.content)

      if (!analysis) {
        console.log("⚠️ Parsing failed, using fallback analysis")
        return this.getFallbackAnalysis(playerData)
      }

      console.log("✅ Analyse Groq réussie")
      return analysis
    } catch (error) {
      console.error("❌ Erreur Groq:", error)
      return this.getFallbackAnalysis(playerData)
    }
  }

  private getSystemPrompt(): string {
    return `Tu es un scout professionnel de football avec 20 ans d'expérience.
    Tu analyses les joueurs selon 6 critères précis :

    TECHNIQUE (0-100) : Contrôle de balle, première touche, dribbles, gestes techniques
    VITESSE (0-100) : Accélération, vitesse de pointe, réactivité, vivacité
    PHYSIQUE (0-100) : Endurance, force, résistance, présence physique
    MENTAL (0-100) : Prise de décision, concentration, leadership, gestion stress
    TACTIQUE (0-100) : Positionnement, lecture du jeu, discipline tactique
    PRECISION (0-100) : Précision passes, tirs cadrés, centres, coups de pied arrêtés

    Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
    {
      "globalScore": 75,
      "technique": 80,
      "vitesse": 70,
      "physique": 75,
      "mental": 85,
      "tactique": 78,
      "precision": 82,
      "strengths": ["Point fort 1", "Point fort 2", "Point fort 3"],
      "weaknesses": ["Point faible 1", "Point faible 2"],
      "recommendations": ["Conseil 1", "Conseil 2", "Conseil 3"],
      "positionAnalysis": "Analyse spécifique au poste",
      "potential": "Évaluation du potentiel"
    }`
  }

  private getUserPrompt(playerData: any): string {
    return `Analyse ce joueur de football :

    PROFIL :
    - Nom : ${playerData.name}
    - Poste : ${playerData.position}
    - Âge : ${playerData.age} ans
    - Club : ${playerData.club || "Non spécifié"}
    - Durée vidéo : ${playerData.videoDuration || "Non spécifiée"}

    CONTEXTE D'ANALYSE :
    Basé sur son profil, son âge et son poste, fournis une analyse réaliste et constructive.
    
    CRITÈRES PAR POSTE :
    - Gardien : Réflexes, placement, relance, leadership
    - Défenseur : Marquage, duels, relance, anticipation
    - Milieu : Vision, passes, récupération, polyvalence
    - Attaquant : Finition, déplacements, vitesse, technique

    Sois précis et constructif dans tes recommandations. Adapte les scores selon l'âge et le niveau attendu.`
  }

  private parseAnalysis(content: string): any {
    try {
      // Nettoyer le contenu pour extraire le JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])

        // Validation des données
        if (this.validateAnalysis(parsed)) {
          return parsed
        }
      }
      throw new Error("JSON invalide ou incomplet")
    } catch (error) {
      console.error("Erreur parsing Groq:", error)
      return null
    }
  }

  private validateAnalysis(analysis: any): boolean {
    const requiredFields = [
      "globalScore",
      "technique",
      "vitesse",
      "physique",
      "mental",
      "tactique",
      "precision",
      "strengths",
      "weaknesses",
      "recommendations",
    ]

    return requiredFields.every((field) => analysis.hasOwnProperty(field))
  }

  private getFallbackAnalysis(playerData: any): any {
    console.log("🔄 Génération analyse de secours pour:", playerData.name)

    // Analyse de secours basée sur les données du joueur
    const positionScores = this.getPositionBaseScores(playerData.position)
    const ageModifier = this.getAgeModifier(playerData.age)

    return {
      globalScore: Math.round(positionScores.global * ageModifier),
      technique: Math.round(positionScores.technique * ageModifier),
      vitesse: Math.round(positionScores.vitesse * (playerData.age < 25 ? 1.1 : 0.9)),
      physique: Math.round(positionScores.physique * (playerData.age < 23 ? 1.2 : 0.8)),
      mental: Math.round(positionScores.mental * ageModifier),
      tactique: Math.round(positionScores.tactique * ageModifier),
      precision: Math.round(positionScores.precision * ageModifier),
      strengths: this.getPositionStrengths(playerData.position),
      weaknesses: this.getPositionWeaknesses(playerData.position),
      recommendations: this.getAgeRecommendations(playerData.age, playerData.position),
      positionAnalysis: `Analyse pour ${playerData.position} de ${playerData.age} ans. Profil adapté au poste avec des axes d'amélioration identifiés.`,
      potential: this.getPotentialAssessment(playerData.age),
    }
  }

  private getPositionBaseScores(position: string) {
    const scores: Record<string, any> = {
      Gardien: { global: 75, technique: 70, vitesse: 60, physique: 80, mental: 85, tactique: 75, precision: 90 },
      "Défenseur central": {
        global: 72,
        technique: 65,
        vitesse: 70,
        physique: 85,
        mental: 80,
        tactique: 85,
        precision: 75,
      },
      "Latéral droit": {
        global: 74,
        technique: 70,
        vitesse: 80,
        physique: 75,
        mental: 75,
        tactique: 80,
        precision: 78,
      },
      "Latéral gauche": {
        global: 74,
        technique: 70,
        vitesse: 80,
        physique: 75,
        mental: 75,
        tactique: 80,
        precision: 78,
      },
      "Milieu défensif": {
        global: 76,
        technique: 75,
        vitesse: 70,
        physique: 80,
        mental: 85,
        tactique: 90,
        precision: 80,
      },
      "Milieu central": {
        global: 78,
        technique: 85,
        vitesse: 75,
        physique: 75,
        mental: 85,
        tactique: 90,
        precision: 85,
      },
      "Milieu offensif": {
        global: 79,
        technique: 90,
        vitesse: 75,
        physique: 70,
        mental: 85,
        tactique: 85,
        precision: 88,
      },
      "Ailier droit": { global: 77, technique: 85, vitesse: 90, physique: 70, mental: 75, tactique: 75, precision: 80 },
      "Ailier gauche": {
        global: 77,
        technique: 85,
        vitesse: 90,
        physique: 70,
        mental: 75,
        tactique: 75,
        precision: 80,
      },
      Attaquant: { global: 76, technique: 80, vitesse: 85, physique: 75, mental: 80, tactique: 70, precision: 90 },
    }
    return scores[position] || scores["Milieu central"]
  }

  private getAgeModifier(age: number): number {
    if (age < 18) return 0.8
    if (age < 21) return 0.9
    if (age < 25) return 1.0
    if (age < 30) return 0.95
    return 0.85
  }

  private getPositionStrengths(position: string): string[] {
    const strengths: Record<string, string[]> = {
      Gardien: ["Réflexes excellents", "Bon placement", "Leadership naturel"],
      "Défenseur central": ["Solide dans les duels", "Bon jeu aérien", "Lecture du jeu"],
      "Milieu central": ["Vision du jeu", "Polyvalence", "Récupération de balle"],
      "Milieu offensif": ["Créativité", "Technique raffinée", "Passes décisives"],
      Attaquant: ["Sens du but", "Déplacements intelligents", "Finition précise"],
    }
    return strengths[position] || ["Technique solide", "Bonne mentalité", "Potentiel intéressant"]
  }

  private getPositionWeaknesses(position: string): string[] {
    const weaknesses: Record<string, string[]> = {
      Gardien: ["Jeu au pied à améliorer", "Sorties aériennes"],
      "Défenseur central": ["Vitesse limitée", "Jeu long à travailler"],
      "Milieu central": ["Finition à améliorer", "Intensité physique"],
      "Milieu offensif": ["Aspect défensif", "Régularité"],
      Attaquant: ["Jeu dos au but", "Participation au jeu"],
    }
    return weaknesses[position] || ["Régularité à améliorer", "Condition physique"]
  }

  private getAgeRecommendations(age: number, position: string): string[] {
    const base = [
      "Continuer le travail technique quotidien",
      "Améliorer la condition physique générale",
      "Développer l'intelligence tactique",
    ]

    if (age < 20) {
      base.push("Focus sur l'apprentissage et la progression")
    } else if (age < 25) {
      base.push("Rechercher plus de temps de jeu")
    } else {
      base.push("Capitaliser sur l'expérience acquise")
    }

    return base
  }

  private getPotentialAssessment(age: number): string {
    if (age < 18) return "Très prometteur - Potentiel énorme"
    if (age < 21) return "Très prometteur - Marge de progression importante"
    if (age < 25) return "Bon potentiel - Phase de développement"
    if (age < 28) return "Expérimenté - Pic de performance"
    return "Expérimenté - Sagesse du jeu"
  }

  // Test de connexion Groq
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [{ role: "user", content: "Test de connexion" }],
          max_tokens: 10,
        }),
      })

      if (response.ok) {
        return { success: true, message: "Connexion Groq réussie" }
      } else {
        return { success: false, message: `Erreur Groq: ${response.status}` }
      }
    } catch (error) {
      return { success: false, message: `Erreur Groq: ${error}` }
    }
  }
}

// Instance globale
export const groqAnalyzer = new GroqAnalyzer()
