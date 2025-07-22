import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

// Schéma pour l'analyse vidéo
const VideoAnalysisSchema = z.object({
  globalScore: z.number().min(0).max(100),
  technique: z.number().min(0).max(100),
  vitesse: z.number().min(0).max(100),
  physique: z.number().min(0).max(100),
  mental: z.number().min(0).max(100),
  tactique: z.number().min(0).max(100),
  precision: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  keyMoments: z.array(
    z.object({
      timestamp: z.string(),
      description: z.string(),
      type: z.enum(["positive", "negative", "neutral"]),
    }),
  ),
  positionAnalysis: z.string(),
  improvementAreas: z.array(z.string()),
})

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, playerInfo, analysisType } = await request.json()

    // Simulation d'extraction de frames vidéo (en réalité, vous utiliseriez FFmpeg ou une API vidéo)
    const videoFrames = await extractVideoFrames(videoUrl)

    // Analyse avec OpenAI Vision + GPT-4
    const { object: analysis } = await generateObject({
      model: openai("gpt-4o"),
      schema: VideoAnalysisSchema,
      messages: [
        {
          role: "system",
          content: `Tu es un expert en analyse de performance footballistique. 
          Analyse cette vidéo de match et fournis une évaluation détaillée du joueur.
          
          Critères d'évaluation :
          - Technique : Contrôle de balle, passes, tirs, dribbles
          - Vitesse : Accélération, vitesse de pointe, réactivité
          - Physique : Endurance, force, agilité
          - Mental : Prise de décision, concentration, leadership
          - Tactique : Positionnement, compréhension du jeu
          - Précision : Exactitude des passes, tirs cadrés
          
          Poste du joueur : ${playerInfo.position}
          Âge : ${playerInfo.age} ans
          Niveau : ${playerInfo.level || "Amateur"}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse cette vidéo de match du joueur ${playerInfo.name}. 
              Fournis des scores détaillés et des recommandations personnalisées.`,
            },
            ...videoFrames.map((frame) => ({
              type: "image_url" as const,
              image_url: { url: frame },
            })),
          ],
        },
      ],
    })

    // Sauvegarde en base de données (Supabase/Airtable pour Softr)
    await saveAnalysisToDatabase({
      playerId: playerInfo.id,
      videoUrl,
      analysis,
      createdAt: new Date().toISOString(),
    })

    // Webhook vers Softr pour mise à jour du dashboard
    await notifySoftrDashboard(playerInfo.id, analysis)

    return NextResponse.json({
      success: true,
      analysis,
      message: "Analyse vidéo terminée avec succès",
    })
  } catch (error) {
    console.error("Erreur analyse vidéo:", error)
    return NextResponse.json({ error: "Erreur lors de l'analyse vidéo" }, { status: 500 })
  }
}

// Fonction pour extraire les frames vidéo
async function extractVideoFrames(videoUrl: string): Promise<string[]> {
  // En production, utilisez FFmpeg ou une API comme Cloudinary
  // Ici on simule avec des timestamps clés
  const timestamps = ["00:30", "02:15", "05:45", "08:20", "12:10"]

  // Simulation - en réalité vous extrairiez les vraies frames
  return timestamps.map((ts) => `/api/video-frame?url=${encodeURIComponent(videoUrl)}&timestamp=${ts}`)
}

// Sauvegarde dans Airtable (compatible Softr)
async function saveAnalysisToDatabase(data: any) {
  const airtableResponse = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/VideoAnalyses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        PlayerId: data.playerId,
        VideoUrl: data.videoUrl,
        GlobalScore: data.analysis.globalScore,
        Technique: data.analysis.technique,
        Vitesse: data.analysis.vitesse,
        Physique: data.analysis.physique,
        Mental: data.analysis.mental,
        Tactique: data.analysis.tactique,
        Precision: data.analysis.precision,
        Strengths: data.analysis.strengths.join(", "),
        Weaknesses: data.analysis.weaknesses.join(", "),
        Recommendations: data.analysis.recommendations.join(", "),
        KeyMoments: JSON.stringify(data.analysis.keyMoments),
        CreatedAt: data.createdAt,
        Status: "Completed",
      },
    }),
  })

  return airtableResponse.json()
}

// Notification vers Softr Dashboard
async function notifySoftrDashboard(playerId: string, analysis: any) {
  // Webhook vers Softr ou mise à jour directe Airtable
  await fetch(process.env.SOFTR_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "video_analysis_complete",
      playerId,
      analysis,
      timestamp: new Date().toISOString(),
    }),
  })
}
