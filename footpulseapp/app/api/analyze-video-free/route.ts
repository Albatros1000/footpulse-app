import { type NextRequest, NextResponse } from "next/server"

// Utilisation de Groq (GRATUIT) au lieu d'OpenAI
export async function POST(request: NextRequest) {
  try {
    const { videoUrl, playerInfo } = await request.json()

    // Analyse avec Groq (GRATUIT)
    const analysisResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`, // GRATUIT !
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile", // Modèle gratuit et performant
        messages: [
          {
            role: "system",
            content: `Tu es un expert en analyse de performance footballistique. 
            Analyse ce joueur et donne des scores de 0 à 100 pour :
            - Technique (contrôle, passes, tirs)
            - Vitesse (accélération, sprint)
            - Physique (endurance, force)
            - Mental (décision, concentration)
            - Tactique (positionnement)
            - Précision (passes réussies, tirs cadrés)
            
            Réponds UNIQUEMENT en JSON valide avec cette structure :
            {
              "globalScore": 75,
              "technique": 80,
              "vitesse": 70,
              "physique": 75,
              "mental": 85,
              "tactique": 78,
              "precision": 82,
              "strengths": ["Excellent contrôle de balle", "Vision du jeu"],
              "weaknesses": ["Vitesse à améliorer", "Tirs de loin"],
              "recommendations": ["Travailler la vitesse", "Améliorer les tirs"]
            }`,
          },
          {
            role: "user",
            content: `Analyse ce joueur ${playerInfo.position} de ${playerInfo.age} ans nommé ${playerInfo.name}. 
            Vidéo : ${videoUrl}
            
            Simule une analyse basée sur son poste et son âge.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    const groqResult = await analysisResponse.json()
    const analysis = JSON.parse(groqResult.choices[0].message.content)

    // Sauvegarder dans Supabase (GRATUIT)
    const { supabase } = await import("@/lib/supabase")
    await supabase.from("video_analyses").insert({
      player_id: playerInfo.id,
      video_url: videoUrl,
      ...analysis,
      status: "completed",
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      analysis,
      message: "Analyse gratuite terminée !",
    })
  } catch (error) {
    console.error("Erreur analyse gratuite:", error)
    return NextResponse.json({ error: "Erreur lors de l'analyse" }, { status: 500 })
  }
}
