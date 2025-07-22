import { NextResponse } from "next/server"
import { supabaseHelpers } from "@/lib/supabase"
import { groqAnalyzer } from "@/lib/groq-client"

export async function GET() {
  try {
    console.log("🧪 Test des connexions API...")

    // Test Supabase
    const supabaseTest = await supabaseHelpers.testConnection()
    console.log("Supabase:", supabaseTest)

    // Test Groq
    const groqTest = await groqAnalyzer.testConnection()
    console.log("Groq:", groqTest)

    return NextResponse.json({
      success: true,
      tests: {
        supabase: supabaseTest,
        groq: groqTest,
      },
      message: "Tests de connexion terminés",
    })
  } catch (error) {
    console.error("❌ Erreur test connexions:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
