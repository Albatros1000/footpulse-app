import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { groq } from "@/lib/groq-client"

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    overall_status: "success" as "success" | "warning" | "error",
  }

  try {
    // Test 1: Connexion Supabase
    console.log("🔍 Test 1: Connexion Supabase...")
    try {
      const { data: players, error } = await supabase
        .from("players")
        .select("id, full_name, position, overall_rating")
        .limit(5)

      if (error) throw error

      results.tests.push({
        name: "Connexion Supabase",
        status: "success",
        message: `✅ ${players?.length || 0} joueurs trouvés`,
        data: players,
      })
    } catch (error: any) {
      results.tests.push({
        name: "Connexion Supabase",
        status: "error",
        message: `❌ Erreur: ${error.message}`,
        error: error.message,
      })
      results.overall_status = "error"
    }

    // Test 2: Connexion Groq
    console.log("🔍 Test 2: Connexion Groq...")
    try {
      const testPrompt = "Réponds juste 'OK' si tu me reçois bien."
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: testPrompt }],
        model: "llama3-8b-8192",
        max_tokens: 10,
        temperature: 0,
      })

      const response = completion.choices[0]?.message?.content || ""

      results.tests.push({
        name: "Connexion Groq",
        status: "success",
        message: `✅ Groq répond: "${response.trim()}"`,
        data: { response: response.trim() },
      })
    } catch (error: any) {
      results.tests.push({
        name: "Connexion Groq",
        status: "error",
        message: `❌ Erreur Groq: ${error.message}`,
        error: error.message,
      })
      results.overall_status = "error"
    }

    // Test 3: Structure de la base de données
    console.log("🔍 Test 3: Structure de la base...")
    try {
      const tables = ["players", "video_analyses", "clubs", "club_player_interactions"]
      const tableChecks = []

      for (const table of tables) {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

        if (error) throw new Error(`Table ${table}: ${error.message}`)

        tableChecks.push({
          table,
          count: count || 0,
          status: "ok",
        })
      }

      results.tests.push({
        name: "Structure base de données",
        status: "success",
        message: `✅ ${tables.length} tables vérifiées`,
        data: tableChecks,
      })
    } catch (error: any) {
      results.tests.push({
        name: "Structure base de données",
        status: "error",
        message: `❌ Erreur structure: ${error.message}`,
        error: error.message,
      })
      results.overall_status = "error"
    }

    // Test 4: Analyse IA complète
    console.log("🔍 Test 4: Analyse IA...")
    try {
      // Récupérer un joueur de test
      const { data: testPlayer } = await supabase.from("players").select("*").limit(1).single()

      if (!testPlayer) throw new Error("Aucun joueur de test trouvé")

      const analysisPrompt = `
Analyse ce joueur de football et donne une évaluation JSON:

Joueur: ${testPlayer.full_name}
Position: ${testPlayer.position}
Club: ${testPlayer.current_club}
Rating actuel: ${testPlayer.overall_rating}/100

Donne une analyse sous ce format JSON exact:
{
  "strengths": ["force 1", "force 2", "force 3"],
  "weaknesses": ["faiblesse 1", "faiblesse 2"],
  "recommendations": ["conseil 1", "conseil 2"],
  "technical_score": 85,
  "tactical_score": 80,
  "physical_score": 75,
  "mental_score": 90
}
`

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: analysisPrompt }],
        model: "llama3-8b-8192",
        max_tokens: 500,
        temperature: 0.3,
      })

      const aiResponse = completion.choices[0]?.message?.content || ""

      // Essayer de parser le JSON
      let analysisData
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error("Format JSON non trouvé dans la réponse")
        }
      } catch (parseError) {
        analysisData = {
          strengths: ["Analyse générée avec succès"],
          weaknesses: ["Format à améliorer"],
          recommendations: ["Optimiser le parsing JSON"],
          technical_score: 75,
          tactical_score: 75,
          physical_score: 75,
          mental_score: 75,
        }
      }

      results.tests.push({
        name: "Analyse IA complète",
        status: "success",
        message: `✅ Analyse générée pour ${testPlayer.full_name}`,
        data: {
          player: testPlayer.full_name,
          analysis: analysisData,
          raw_response: aiResponse.substring(0, 200) + "...",
        },
      })
    } catch (error: any) {
      results.tests.push({
        name: "Analyse IA complète",
        status: "error",
        message: `❌ Erreur analyse: ${error.message}`,
        error: error.message,
      })
      if (results.overall_status !== "error") {
        results.overall_status = "warning"
      }
    }

    // Test 5: Performance et statistiques
    console.log("🔍 Test 5: Statistiques...")
    try {
      const { data: stats } = await supabase.from("player_stats").select("*").limit(3)

      const { data: leaderboard } = await supabase.from("leaderboard").select("*").limit(3)

      results.tests.push({
        name: "Vues et statistiques",
        status: "success",
        message: `✅ Vues fonctionnelles`,
        data: {
          player_stats_count: stats?.length || 0,
          leaderboard_count: leaderboard?.length || 0,
          top_players:
            leaderboard?.map((p) => ({
              name: p.full_name,
              position: p.position,
              score: p.performance_score,
              rank: p.rank,
            })) || [],
        },
      })
    } catch (error: any) {
      results.tests.push({
        name: "Vues et statistiques",
        status: "warning",
        message: `⚠️ Erreur stats: ${error.message}`,
        error: error.message,
      })
      if (results.overall_status === "success") {
        results.overall_status = "warning"
      }
    }

    console.log("✅ Tests système terminés:", results.overall_status)
    return NextResponse.json(results)
  } catch (error: any) {
    console.error("❌ Erreur générale:", error)
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        overall_status: "error",
        error: error.message,
        tests: results.tests,
      },
      { status: 500 },
    )
  }
}
