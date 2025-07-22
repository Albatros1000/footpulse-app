"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, Video, BarChart3, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface AnalysisResult {
  globalScore: number
  technique: number
  vitesse: number
  physique: number
  mental: number
  tactique: number
  precision: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export default function VideoUploadAnalyzer() {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "analyzing" | "completed" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file)
    setUploadStatus("uploading")
    setProgress(0)

    try {
      // 1. Upload vidéo vers Cloudinary/AWS
      const formData = new FormData()
      formData.append("video", file)

      const uploadResponse = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) throw new Error("Erreur upload")

      const { videoUrl } = await uploadResponse.json()
      setProgress(30)

      // 2. Lancer l'analyse IA
      setUploadStatus("analyzing")

      const analysisResponse = await fetch("/api/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl,
          playerInfo: {
            id: "player-123", // ID du joueur connecté
            name: "Thomas Martin",
            position: "Milieu offensif",
            age: 19,
            level: "Amateur",
          },
          analysisType: "complete",
        }),
      })

      if (!analysisResponse.ok) throw new Error("Erreur analyse")

      const { analysis } = await analysisResponse.json()
      setProgress(80)

      // 3. Synchroniser avec Softr/Webflow
      await fetch("/api/webflow-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: "player-123",
          action: "update_stats",
          data: analysis,
        }),
      })

      setProgress(100)
      setAnalysisResult(analysis)
      setUploadStatus("completed")
    } catch (error) {
      console.error("Erreur:", error)
      setUploadStatus("error")
    }
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case "uploading":
        return <Upload className="text-blue-500 animate-pulse" size={24} />
      case "analyzing":
        return <Loader2 className="text-footpulse-electric animate-spin" size={24} />
      case "completed":
        return <CheckCircle className="text-green-500" size={24} />
      case "error":
        return <AlertCircle className="text-red-500" size={24} />
      default:
        return <Video className="text-gray-400" size={24} />
    }
  }

  const getStatusText = () => {
    switch (uploadStatus) {
      case "uploading":
        return "Upload en cours..."
      case "analyzing":
        return "Analyse IA en cours..."
      case "completed":
        return "Analyse terminée !"
      case "error":
        return "Erreur lors du traitement"
      default:
        return "Prêt pour l'upload"
    }
  }

  return (
    <div className="space-y-6">
      {/* Zone d'upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Analyse vidéo IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {uploadStatus === "idle" ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Video className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-semibold mb-2">Uploadez votre vidéo de match</h3>
              <p className="text-gray-600 mb-4">Formats acceptés: MP4, MOV (max 500MB)</p>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload">
                <Button className="bg-footpulse-electric text-footpulse-dark hover:bg-blue-400">
                  Choisir une vidéo
                </Button>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{getStatusText()}</span>
                <Badge variant={uploadStatus === "completed" ? "default" : "secondary"}>
                  {uploadStatus === "completed" ? "Terminé" : "En cours"}
                </Badge>
              </div>

              {uploadStatus !== "completed" && uploadStatus !== "error" && (
                <Progress value={progress} className="h-2" />
              )}

              {selectedFile && (
                <div className="text-sm text-gray-600">
                  Fichier: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résultats d'analyse */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="text-footpulse-electric" size={20} />
              <span>Résultats de l'analyse</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score global */}
            <div className="text-center p-6 bg-gradient-to-r from-footpulse-dark to-blue-900 text-white rounded-lg">
              <div className="text-4xl font-bold mb-2">{analysisResult.globalScore}</div>
              <div className="text-footpulse-electric">Score Global</div>
            </div>

            {/* Statistiques détaillées */}
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(analysisResult)
                .filter(([key]) =>
                  ["technique", "vitesse", "physique", "mental", "tactique", "precision"].includes(key),
                )
                .map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="capitalize font-medium">{key}</span>
                      <span className="font-bold text-footpulse-electric">{value as number}</span>
                    </div>
                    <Progress value={value as number} className="h-2" />
                  </div>
                ))}
            </div>

            {/* Points forts et faibles */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-3">💪 Points forts</h4>
                <ul className="space-y-2">
                  {analysisResult.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="text-green-500 mt-0.5" size={16} />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-orange-600 mb-3">🎯 À améliorer</h4>
                <ul className="space-y-2">
                  {analysisResult.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertCircle className="text-orange-500 mt-0.5" size={16} />
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommandations */}
            <div>
              <h4 className="font-semibold text-footpulse-dark mb-3">📋 Recommandations</h4>
              <div className="space-y-2">
                {analysisResult.recommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button className="bg-footpulse-electric text-footpulse-dark hover:bg-blue-400">
                Voir le rapport complet
              </Button>
              <Button variant="outline">Partager l'analyse</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
