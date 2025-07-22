import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { groq } from "@/lib/groq-client"

export async function POST(request: NextRequest) {
  try {
    const { playerEmail } = await request.json()

    if (!playerEmail) {
      return NextResponse.json({ error: "Email du joueur requis" }, { status: 400 })
    }

    console.log(`🔍 Analyse démo pour: ${playerEmail}`)

    // 1. Récupérer le joueur
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("email", playerEmail)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: "Joueur non trouvé" }, { status: 404 })
    }

    // 2. Générer l'analyse IA
    const analysisPrompt = `
Tu es un expert en analyse de joueurs de football. Analyse ce joueur et donne une évaluation détaillée.

JOUEUR À ANALYSER:
- Nom: ${player.full_name}
- Position: ${player.position}
- Âge: ${new Date().getFullYear() - new Date(player.date_of_birth).getFullYear()} ans
- Nationalité: ${player.nationality}
- Club actuel: ${player.current_club}
- Pied fort: ${player.preferred_foot}
- Taille: ${player.height}cm, Poids: ${player.weight}kg
- Rating actuel: ${player.overall_rating}/100

STATISTIQUES ACTUELLES:
- Vitesse: ${player.pace}/100
- Tir: ${player.shooting}/100
- Passes: ${player.passing}/100
- Dribble: ${player.dribbling}/100
- Défense: ${player.defending}/100
- Physique: ${player.physical}/100

INSTRUCTIONS:
Donne une analyse complète sous ce format JSON EXACT (sans texte avant ou après):

{
  "summary": "Résumé de l'analyse en 2-3 phrases",
  "strengths": ["Point fort 1", "Point fort 2", "Point fort 3"],
  "weaknesses": ["Faiblesse 1", "Faiblesse 2"],
  "recommendations": ["Conseil d'amélioration 1", "Conseil d'amélioration 2", "Conseil d'amélioration 3"],
  "technical_score": 85,
  "tactical_score": 80,
  "physical_score": 75,
  "mental_score": 90,
  "potential_rating": 88,
  "market_value_evolution": "stable",
  "best_position": "${player.position}",
  "playing_style": "Description du style de jeu",
  "comparison": "Joueur similaire connu"
}

Assure-toi que les scores sont cohérents avec les statistiques actuelles et réalistes pour ce niveau de joueur.
`

    console.log("🤖 Génération de l'analyse IA...")

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Tu es un analyste football expert. Réponds uniquement en JSON valide, sans texte supplémentaire.",
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      model: "llama3-8b-8192",
      max_tokens: 800,
      temperature: 0.4,
    })

    const aiResponse = completion.choices[0]?.message?.content || ""
    console.log("🤖 Réponse IA reçue:", aiResponse.substring(0, 100) + "...")

    // 3. Parser la réponse JSON
    let analysisData
    try {
      // Nettoyer la réponse et extraire le JSON
      const cleanResponse = aiResponse.trim()
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("JSON non trouvé dans la réponse")
      }

      // Validation des champs requis
      const requiredFields = ["summary", "strengths", "weaknesses", "recommendations"]
      for (const field of requiredFields) {
        if (!analysisData[field]) {
          throw new Error(`Champ manquant: ${field}`)
        }
      }
    } catch (parseError) {
      console.error("❌ Erreur parsing JSON:", parseError)

      // Fallback avec analyse basique
      analysisData = {
        summary: `Analyse de ${player.full_name}, ${player.position} de ${player.current_club}. Joueur avec un potentiel intéressant.`,
        strengths: [
          player.pace > 80 ? "Vitesse excellente" : "Technique solide",
          player.shooting > 80 ? "Finition précise" : "Vision de jeu",
          player.dribbling > 80 ? "Dribble efficace" : "Jeu collectif",
        ],
        weaknesses: [
          player.physical < 70 ? "Renforcement physique nécessaire" : "Constance à améliorer",
          "Expérience en compétitions internationales",
        ],
        recommendations: [
          "Travail spécifique sur les points faibles identifiés",
          "Développement de la polyvalence tactique",
          "Renforcement mental et leadership",
        ],
        technical_score: Math.min(95, Math.max(60, player.overall_rating + Math.floor(Math.random() * 10) - 5)),
        tactical_score: Math.min(95, Math.max(60, player.overall_rating + Math.floor(Math.random() * 10) - 5)),
        physical_score: Math.min(95, Math.max(60, player.physical + Math.floor(Math.random() * 10) - 5)),
        mental_score: Math.min(95, Math.max(60, player.overall_rating + Math.floor(Math.random() * 10) - 5)),
        potential_rating: Math.min(99, player.overall_rating + Math.floor(Math.random() * 8) + 2),
        market_value_evolution: player.overall_rating > 85 ? "hausse" : "stable",
        best_position: player.position,
        playing_style: `Style de jeu adapté à la position de ${player.position}`,
        comparison: "Profil unique avec ses propres caractéristiques",
      }
    }

    // 4. Sauvegarder l'analyse
    const { data: savedAnalysis, error: saveError } = await supabase
      .from("video_analyses")
      .insert({
        player_id: player.id,
        video_url: "https://demo-analysis.footpulse.com",
        video_title: `Analyse démo - ${player.full_name}`,
        analysis_type: "general",
        ai_analysis: analysisData,
        strengths: analysisData.strengths,
        weaknesses: analysisData.weaknesses,
        recommendations: analysisData.recommendations,
        technical_score: analysisData.technical_score,
        tactical_score: analysisData.tactical_score,
        physical_score: analysisData.physical_score,
        mental_score: analysisData.mental_score,
        analysis_duration: 120,
        confidence_level: 0.87,
        status: "completed",
        processed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (saveError) {
      console.error("❌ Erreur sauvegarde:", saveError)
      // Continue même si la sauvegarde échoue
    }

    console.log("✅ Analyse terminée avec succès")

    return NextResponse.json({
      success: true,
      player: {
        id: player.id,
        name: player.full_name,
        position: player.position,
        club: player.current_club,
        rating: player.overall_rating,
      },
      analysis: analysisData,
      analysis_id: savedAnalysis?.id,
      generated_at: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Erreur analyse démo:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
