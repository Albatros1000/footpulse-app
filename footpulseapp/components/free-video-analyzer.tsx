"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, Zap, CheckCircle, AlertCircle } from "lucide-react"

export default function FreeVideoAnalyzer() {
  const [status, setStatus] = useState<"idle" | "analyzing" | "completed" | "error">("idle")
  const [analysis, setAnalysis] = useState<any>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const handleFreeAnalysis = async () => {
    if (!videoFile) return

    setStatus("analyzing")

    try {
      // Simulation d'upload (en réalité, on analyserait les métadonnées)
      const formData = new FormData()
      formData.append("video", videoFile)

      // Analyse GRATUITE avec Groq
      const response = await fetch("/api/analyze-video-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: `simulated-${videoFile.name}`,
          playerInfo: {
            id: "demo-player",
            name: "Joueur Demo",
            position: "Milieu offensif",
            age: 20,
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        setAnalysis(result.analysis)
        setStatus("completed")
      } else {
        setStatus("error")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setStatus("error")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-700">
            <Zap className="text-green-500" size={20} />
            <span>Analyse IA GRATUITE</span>
            <Badge className="bg-green-500">100% Free</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-green-600">
              ✅ Powered by Groq (ultra-rapide)
              <br />✅ Analyse complète en 5 secondes
              <br />✅ Aucune limite d'utilisation
            </div>

            {status === "idle" && (
              <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto mb-4 text-green-500" size={48} />
                <h3 className="text-lg font-semibold mb-2">Upload ta vidéo de match</h3>
                <p className="text-gray-600 mb-4">Analyse IA gratuite et instantanée</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="free-video-upload"
                />
                <label htmlFor="free-video-upload">
                  <Button className="bg-green-500 hover:bg-green-600">Choisir une vidéo</Button>
                </label>
              </div>
            )}

            {videoFile && status === "idle" && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Fichier: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                </div>
                <Button onClick={handleFreeAnalysis} className="w-full bg-green-500 hover:bg-green-600">
                  <Zap className="mr-2" size={16} />
                  Analyser GRATUITEMENT
                </Button>
              </div>
            )}

            {status === "analyzing" && (
              <div className="text-center space-y-4">
                <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-green-600 font-medium">Analyse IA en cours... ⚡</p>
              </div>
            )}

            {status === "completed" && analysis && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle size={20} />
                  <span className="font-medium">Analyse terminée !</span>
                </div>

                {/* Score global */}
                <div className="text-center p-4 bg-green-100 rounded-lg">
                  <div className="text-3xl font-bold text-green-700">{analysis.globalScore}</div>
                  <div className="text-green-600">Score Global</div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(analysis)
                    .filter(([key]) =>
                      ["technique", "vitesse", "physique", "mental", "tactique", "precision"].includes(key),
                    )
                    .map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="capitalize text-sm font-medium">{key}</span>
                          <span className="text-green-600 font-bold">{value as number}</span>
                        </div>
                        <Progress value={value as number} className="h-2" />
                      </div>
                    ))}
                </div>

                {/* Points forts */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700">💪 Points forts</h4>
                  <ul className="space-y-1">
                    {analysis.strengths?.map((strength: string, index: number) => (
                      <li key={index} className="text-sm flex items-start space-x-2">
                        <CheckCircle className="text-green-500 mt-0.5" size={14} />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle size={20} />
                <span>Erreur lors de l'analyse. Réessayez.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
