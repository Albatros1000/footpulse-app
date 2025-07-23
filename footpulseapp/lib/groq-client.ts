import Groq from "groq-sdk"

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY est requis")
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export { groq }

// Classe principale pour l'analyse IA
export class GroqAnalyzer {
  private groq: Groq

  constructor() {
    this.groq = groq
  }

  // Test de connexion Groq
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: "user", content: 'Réponds juste "Connexion OK" pour tester.' }],
        model: "llama3-8b-8192",
        max_tokens: 10,
        temperature: 0,
      })

      const response = completion.choices[0]?.message?.content || ""
      return {
        success: response.toLowerCase().includes("ok") || response.toLowerCase().includes("connexion"),
        message: `Groq répond: "${response.trim()}"`,
      }
    } catch (error: any) {
      return { success: false, message: `Erreur Groq: ${error.message}` }
    }
  }

  // Analyser un joueur avec l'IA
  async analyzePlayer(playerData: {
    name: string
    position: string
    age: number
    club?: string
    currentRating?: number
  }) {
    const prompt = `
Tu es un scout professionnel de football avec 20 ans d'expérience. Analyse ce joueur:

PROFIL JOUEUR:
- Nom: ${playerData.name}
- Position: ${playerData.position}
- Âge: ${playerData.age} ans
- Club: ${playerData.club || "Non spécifié"}
- Rating actuel: ${playerData.currentRating || "Non évalué"}/100

MISSION:
Donne une analyse complète et réaliste sous ce format JSON exact:

{
  "globalScore": 85,
  "technique": 88,
  "vitesse": 82,
  "physique": 80,
  "mental": 87,
  "tactique": 84,
  "precision": 86,
  "strengths": ["Point fort 1", "Point fort 2", "Point fort 3"],
  "weaknesses": ["Faiblesse 1", "Faiblesse 2"],
  "recommendations": ["Conseil 1", "Conseil 2", "Conseil 3"],
  "positionAnalysis": "Analyse spécifique au poste",
  "potential": "Évaluation du potentiel",
  "summary": "Résumé de l'analyse en 2-3 phrases"
}

CRITÈRES:
- Scores entre 70-95 pour un joueur professionnel
- Cohérence avec l'âge et la position
- Analyse réaliste et constructive
- Recommandations concrètes

Réponds UNIQUEMENT en JSON valide.
`

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Tu es un scout professionnel. Réponds uniquement en JSON valide, sans texte supplémentaire.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama3-8b-8192",
        max_tokens: 1000,
        temperature: 0.6,
      })

      const response = completion.choices[0]?.message?.content || ""

      // Parser le JSON
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0])

          // Validation des données
          if (this.validateAnalysis(analysis)) {
            return analysis
          }
        }
        throw new Error("JSON invalide ou incomplet")
      } catch (parseError) {
        console.error("Erreur parsing JSON:", parseError)
        return this.getFallbackAnalysis(playerData)
      }
    } catch (error: any) {
      console.error("Erreur Groq:", error)
      return this.getFallbackAnalysis(playerData)
    }
  }

  // Validation de l'analyse
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

  // Analyse de secours si l'IA échoue
  private getFallbackAnalysis(playerData: any) {
    const baseScore = playerData.currentRating || 75
    const ageModifier = this.getAgeModifier(playerData.age)
    const positionScores = this.getPositionBaseScores(playerData.position)

    return {
      globalScore: Math.round(baseScore * ageModifier),
      technique: Math.round(positionScores.technique * ageModifier),
      vitesse: Math.round(positionScores.vitesse * ageModifier),
      physique: Math.round(positionScores.physique * ageModifier),
      mental: Math.round(positionScores.mental * ageModifier),
      tactique: Math.round(positionScores.tactique * ageModifier),
      precision: Math.round(positionScores.precision * ageModifier),
      strengths: this.getPositionStrengths(playerData.position),
      weaknesses: this.getPositionWeaknesses(playerData.position),
      recommendations: this.getAgeRecommendations(playerData.age),
      positionAnalysis: `Profil adapté au poste de ${playerData.position}`,
      potential: this.getPotentialAssessment(playerData.age),
      summary: `${playerData.name} présente un profil intéressant pour son poste de ${playerData.position}. À ${playerData.age} ans, il a encore une marge de progression.`,
    }
  }

  private getAgeModifier(age: number): number {
    if (age < 20) return 0.85
    if (age < 25) return 1.0
    if (age < 30) return 0.95
    return 0.85
  }

  private getPositionBaseScores(position: string) {
    const scores: Record<string, any> = {
      Attaquant: { technique: 85, vitesse: 88, physique: 80, mental: 82, tactique: 75, precision: 90 },
      "Milieu central": { technique: 88, vitesse: 75, physique: 82, mental: 90, tactique: 92, precision: 85 },
      "Milieu offensif": { technique: 92, vitesse: 80, physique: 75, mental: 88, tactique: 85, precision: 90 },
      "Défenseur central": { technique: 70, vitesse: 65, physique: 90, mental: 85, tactique: 88, precision: 75 },
      Latéral: { technique: 78, vitesse: 85, physique: 80, mental: 80, tactique: 82, precision: 80 },
      Gardien: { technique: 75, vitesse: 60, physique: 85, mental: 90, tactique: 80, precision: 95 },
    }
    return scores[position] || scores["Milieu central"]
  }

  private getPositionStrengths(position: string): string[] {
    const strengths: Record<string, string[]> = {
      Attaquant: ["Finition précise", "Déplacements intelligents", "Vitesse d'exécution"],
      "Milieu central": ["Vision du jeu", "Passes courtes", "Récupération de balle"],
      "Milieu offensif": ["Créativité", "Technique raffinée", "Passes décisives"],
      "Défenseur central": ["Duels aériens", "Anticipation", "Leadership défensif"],
      Latéral: ["Montées offensives", "Centres précis", "Polyvalence"],
      Gardien: ["Réflexes", "Placement", "Relance"],
    }
    return strengths[position] || ["Technique solide", "Bonne mentalité", "Polyvalence"]
  }

  private getPositionWeaknesses(position: string): string[] {
    const weaknesses: Record<string, string[]> = {
      Attaquant: ["Jeu collectif", "Défense sur corners"],
      "Milieu central": ["Vitesse pure", "Finition"],
      "Milieu offensif": ["Aspect défensif", "Intensité physique"],
      "Défenseur central": ["Vitesse", "Jeu long"],
      Latéral: ["Constance défensive", "Centres sous pression"],
      Gardien: ["Jeu au pied", "Sorties aériennes"],
    }
    return weaknesses[position] || ["Régularité", "Condition physique"]
  }

  private getAgeRecommendations(age: number): string[] {
    if (age < 20) {
      return ["Focus sur l'apprentissage", "Développement physique", "Expérience de jeu"]
    } else if (age < 25) {
      return ["Rechercher plus de temps de jeu", "Perfectionnement technique", "Leadership"]
    } else {
      return ["Capitaliser sur l'expérience", "Mentorat des jeunes", "Maintien de la forme"]
    }
  }

  private getPotentialAssessment(age: number): string {
    if (age < 18) return "Potentiel énorme - Futur crack"
    if (age < 21) return "Très prometteur - Marge importante"
    if (age < 25) return "Bon potentiel - Phase de développement"
    if (age < 28) return "Expérimenté - Pic de performance"
    return "Vétéran - Sagesse du jeu"
  }
}

// Instance globale exportée
export const groqAnalyzer = new GroqAnalyzer()

// Helper functions pour l'analyse IA (compatibilité)
export const groqAnalyzer_legacy = {
  // Test de connexion
  async testConnection() {
    return groqAnalyzer.testConnection()
  },

  // Analyser un joueur
  async analyzePlayer(playerData: {
    name: string
    position: string
    age: number
    club: string
  }) {
    return groqAnalyzer.analyzePlayer(playerData)
  },
}
