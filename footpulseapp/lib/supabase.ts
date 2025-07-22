import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types pour TypeScript
export interface Player {
  id: string
  name: string
  email: string
  phone?: string
  position: string
  age: number
  height?: number
  weight?: number
  club?: string
  strong_foot?: string
  jersey_number?: string
  experience?: string
  global_score?: number
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface VideoAnalysis {
  id: string
  player_id: string
  video_url?: string
  global_score: number
  technique: number
  vitesse: number
  physique: number
  mental: number
  tactique: number
  precision: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  position_analysis?: string
  potential?: string
  status: "pending" | "processing" | "completed" | "error"
  created_at: string
}

export interface Club {
  id: string
  name: string
  email: string
  level?: string
  region?: string
  description?: string
  logo_url?: string
  created_at: string
}

export interface ClubPlayerInteraction {
  id: string
  club_id: string
  player_id: string
  type: "view" | "interest" | "contact" | "offer"
  message?: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
}

// Fonctions utilitaires pour Supabase
export const supabaseHelpers = {
  // Test de connexion
  async testConnection() {
    try {
      const { data, error } = await supabase.from("players").select("count").limit(1)
      if (error) throw error
      return { success: true, message: "Connexion Supabase réussie" }
    } catch (error) {
      return { success: false, message: `Erreur Supabase: ${error}` }
    }
  },

  // Créer un joueur
  async createPlayer(playerData: Omit<Player, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("players").insert([playerData]).select().single()

    if (error) throw error
    return data
  },

  // Récupérer un joueur par email
  async getPlayerByEmail(email: string) {
    const { data, error } = await supabase.from("players").select("*").eq("email", email).single()

    if (error && error.code !== "PGRST116") throw error
    return data
  },

  // Créer une analyse vidéo
  async createVideoAnalysis(analysisData: Omit<VideoAnalysis, "id" | "created_at">) {
    const { data, error } = await supabase.from("video_analyses").insert([analysisData]).select().single()

    if (error) throw error
    return data
  },

  // Récupérer les analyses d'un joueur
  async getPlayerAnalyses(playerId: string) {
    const { data, error } = await supabase
      .from("video_analyses")
      .select("*")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  // Mettre à jour le score global d'un joueur
  async updatePlayerScore(playerId: string, globalScore: number) {
    const { data, error } = await supabase
      .from("players")
      .update({ global_score: globalScore, updated_at: new Date().toISOString() })
      .eq("id", playerId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Récupérer le leaderboard
  async getLeaderboard(limit = 10) {
    const { data, error } = await supabase
      .from("players")
      .select("name, position, age, club, global_score")
      .not("global_score", "is", null)
      .gt("global_score", 0)
      .order("global_score", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },
}
