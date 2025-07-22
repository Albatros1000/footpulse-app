import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase" // Declare the supabase variable

// Webhook appelé par n8n quand l'analyse est terminée
export async function POST(request: NextRequest) {
  try {
    const { playerId, analysis, videoUrl } = await request.json()

    // Sauvegarder en base de données (Supabase)
    const { data, error } = await supabase.from("video_analyses").insert({
      player_id: playerId,
      video_url: videoUrl,
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
      status: "completed",
      created_at: new Date().toISOString(),
    })

    if (error) throw error

    // Notifier le joueur (optionnel)
    await sendNotification(playerId, "Votre analyse vidéo est prête !")

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Erreur webhook:", error)
    return NextResponse.json({ error: "Erreur traitement webhook" }, { status: 500 })
  }
}

async function sendNotification(playerId: string, message: string) {
  // Implémentation notification (email, push, etc.)
  console.log(`Notification pour ${playerId}: ${message}`)
}
