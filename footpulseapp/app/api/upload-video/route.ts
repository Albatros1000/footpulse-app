import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const video = formData.get("video") as File
    const playerId = formData.get("playerId") as string

    if (!video) {
      return NextResponse.json({ error: "Aucune vidéo fournie" }, { status: 400 })
    }

    // 1. Upload vers Cloudinary ou Vercel Blob
    const videoUrl = await uploadToCloudinary(video)

    // 2. Déclencher n8n workflow
    const webhookResponse = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoUrl,
        playerId,
        playerName: formData.get("playerName"),
        position: formData.get("position"),
        timestamp: new Date().toISOString(),
      }),
    })

    const result = await webhookResponse.json()

    return NextResponse.json({
      success: true,
      videoUrl,
      analysisId: result.analysisId,
      message: "Vidéo uploadée, analyse en cours...",
    })
  } catch (error) {
    console.error("Erreur upload:", error)
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 })
  }
}

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET!)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`, {
    method: "POST",
    body: formData,
  })

  const result = await response.json()
  return result.secure_url
}
