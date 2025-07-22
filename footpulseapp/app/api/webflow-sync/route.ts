import { type NextRequest, NextResponse } from "next/server"

// Synchronisation avec Webflow CMS
export async function POST(request: NextRequest) {
  try {
    const { playerId, action, data } = await request.json()

    switch (action) {
      case "create_player_profile":
        return await createWebflowPlayerProfile(data)
      case "update_stats":
        return await updateWebflowStats(playerId, data)
      case "add_video_analysis":
        return await addWebflowVideoAnalysis(playerId, data)
      default:
        return NextResponse.json({ error: "Action non reconnue" }, { status: 400 })
    }
  } catch (error) {
    console.error("Erreur Webflow sync:", error)
    return NextResponse.json({ error: "Erreur synchronisation Webflow" }, { status: 500 })
  }
}

async function createWebflowPlayerProfile(playerData: any) {
  const webflowResponse = await fetch(
    `https://api.webflow.com/collections/${process.env.WEBFLOW_PLAYERS_COLLECTION_ID}/items`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
        "Content-Type": "application/json",
        "accept-version": "1.0.0",
      },
      body: JSON.stringify({
        fields: {
          name: playerData.name,
          slug: playerData.name.toLowerCase().replace(/\s+/g, "-"),
          position: playerData.position,
          age: playerData.age,
          club: playerData.club,
          "global-score": playerData.globalScore,
          "profile-photo": playerData.profilePhoto,
          technique: playerData.stats?.technique || 0,
          vitesse: playerData.stats?.vitesse || 0,
          physique: playerData.stats?.physique || 0,
          mental: playerData.stats?.mental || 0,
          tactique: playerData.stats?.tactique || 0,
          precision: playerData.stats?.precision || 0,
          availability: playerData.availability || "Disponible",
          location: playerData.location,
          _archived: false,
          _draft: false,
        },
      }),
    },
  )

  const result = await webflowResponse.json()

  // Publier le site Webflow
  await publishWebflowSite()

  return NextResponse.json({ success: true, webflowId: result._id })
}

async function updateWebflowStats(playerId: string, statsData: any) {
  // Récupérer l'ID Webflow du joueur depuis Airtable
  const webflowId = await getWebflowIdFromPlayer(playerId)

  const webflowResponse = await fetch(
    `https://api.webflow.com/collections/${process.env.WEBFLOW_PLAYERS_COLLECTION_ID}/items/${webflowId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
        "Content-Type": "application/json",
        "accept-version": "1.0.0",
      },
      body: JSON.stringify({
        fields: {
          "global-score": statsData.globalScore,
          technique: statsData.technique,
          vitesse: statsData.vitesse,
          physique: statsData.physique,
          mental: statsData.mental,
          tactique: statsData.tactique,
          precision: statsData.precision,
          "last-updated": new Date().toISOString(),
        },
      }),
    },
  )

  await publishWebflowSite()
  return NextResponse.json({ success: true })
}

async function publishWebflowSite() {
  await fetch(`https://api.webflow.com/sites/${process.env.WEBFLOW_SITE_ID}/publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
      "Content-Type": "application/json",
      "accept-version": "1.0.0",
    },
    body: JSON.stringify({
      domains: [process.env.WEBFLOW_DOMAIN],
    }),
  })
}

async function getWebflowIdFromPlayer(playerId: string) {
  // Récupération depuis Airtable
  const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Players/${playerId}`, {
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    },
  })
  const player = await response.json()
  return player.fields.WebflowId
}

async function addWebflowVideoAnalysis(playerId: string, videoData: any) {
  // Récupérer l'ID Webflow du joueur depuis Airtable
  const webflowId = await getWebflowIdFromPlayer(playerId)

  const webflowResponse = await fetch(
    `https://api.webflow.com/collections/${process.env.WEBFLOW_PLAYERS_COLLECTION_ID}/items/${webflowId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
        "Content-Type": "application/json",
        "accept-version": "1.0.0",
      },
      body: JSON.stringify({
        fields: {
          "video-analysis": videoData,
        },
      }),
    },
  )

  await publishWebflowSite()
  return NextResponse.json({ success: true })
}
