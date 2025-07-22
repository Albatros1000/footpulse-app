import { type NextRequest, NextResponse } from "next/server"
import { GroqAnalyzer } from "@/lib/groq-client"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { playerData, videoFile } = await request.json()

    // Initialiser l'analyseur Groq
    const analyzer = new GroqAnalyzer()

    // Analyser le joueur
    const analysis = await analyzer.analyzePlayer({
      name: playerData.name,
      position: playerData.position,
      age: Number.parseInt(playerData.age),
      club: playerData.club || "Club amateur",
      videoUrl: videoFile?.name || "video-demo",
      videoDuration: videoFile?.duration,
    })

    if (!analysis) {
      throw new Error("Échec de l'analyse")
    }

    // Sauvegarder dans Supabase
    const { data: player, error: playerError } = await supabase
      .from("players")
      .upsert({
        name: playerData.name,
        email: playerData.email,
        position: playerData.position,
        age: Number.parseInt(playerData.age),
        club: playerData.club,
        global_score: analysis.globalScore,
      })
      .select()
      .single()

    if (playerError) throw playerError

    // Sauvegarder l'analyse
    const { data: analysisData, error: analysisError } = await supabase.from("video_analyses").insert({
      player_id: player.id,
      video_url: videoFile?.name || "demo-video",
      global_score: analysis.globalScore,
      technique: analysis.technique,
      vitesse: analysis.vitesse,
      physique: analysis.physique,
      mental: analysis.mental,
      tactique: analysis.tactique,
      precision: analysis.precision,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations,
      position_analysis: analysis.positionAnalysis,
      potential: analysis.potential,
      status: "completed",
    })

    if (analysisError) throw analysisError

    // Déclencher n8n workflow (optionnel)
    if (process.env.N8N_WEBHOOK_URL) {
      await fetch(process.env.N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "analysis_completed",
          playerId: player.id,
          analysis,
          timestamp: new Date().toISOString(),
        }),
      })
    }

    return NextResponse.json({
      success: true,
      playerId: player.id,
      analysis,
      message: "Analyse terminée avec succès !",
    })
  } catch (error) {
    console.error("Erreur analyse:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'analyse",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
