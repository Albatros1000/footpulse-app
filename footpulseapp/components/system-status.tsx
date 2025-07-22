"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertCircle, Play, Zap } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TestResult {
  name: string
  status: "success" | "error" | "warning"
  message: string
  data?: any
  error?: string
}

interface SystemTestResults {
  timestamp: string
  overall_status: "success" | "warning" | "error"
  tests: TestResult[]
  error?: string
}

export default function SystemStatus() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SystemTestResults | null>(null)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoResult, setDemoResult] = useState<any>(null)

  const runSystemTests = async () => {
    setIsLoading(true)
    setResults(null)

    try {
      const response = await fetch("/api/test-full-system")
      const data = await response.json()

      setResults(data)

      if (data.overall_status === "success") {
        toast({
          title: "✅ Tests réussis !",
          description: "Tous les systèmes fonctionnent correctement",
        })
      } else if (data.overall_status === "warning") {
        toast({
          title: "⚠️ Tests avec avertissements",
          description: "Certains systèmes ont des problèmes mineurs",
          variant: "destructive",
        })
      } else {
        toast({
          title: "❌ Tests échoués",
          description: "Des problèmes critiques ont été détectés",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur tests système:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'exécuter les tests système",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runDemoAnalysis = async () => {
    setDemoLoading(true)
    setDemoResult(null)

    try {
      const response = await fetch("/api/analyze-player-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerEmail: "kylian.mbappe@test.com", // Utilise Mbappé comme exemple
        }),
      })

      const data = await response.json()

      if (data.success) {
        setDemoResult(data)
        toast({
          title: "🤖 Analyse IA terminée !",
          description: `Analyse générée pour ${data.player.name}`,
        })
      } else {
        throw new Error(data.error || "Erreur inconnue")
      }
    } catch (error: any) {
      console.error("Erreur analyse démo:", error)
      toast({
        title: "Erreur analyse",
        description: error.message || "Impossible de générer l'analyse",
        variant: "destructive",
      })
    } finally {
      setDemoLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Succès</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Avertissement</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>
      default:
        return <Badge>Inconnu</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">🔧 Tests Système FootPulse</h1>
        <p className="text-muted-foreground">Vérifiez que tous les services fonctionnent correctement</p>

        <div className="flex gap-4 justify-center">
          <Button onClick={runSystemTests} disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tests en cours...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Lancer les tests système
              </>
            )}
          </Button>

          <Button onClick={runDemoAnalysis} disabled={demoLoading} variant="outline" size="lg">
            {demoLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Test analyse IA
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Résultats des tests système */}
      {results && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(results.overall_status)}
                Résultats des tests système
              </CardTitle>
              {getStatusBadge(results.overall_status)}
            </div>
            <CardDescription>Tests exécutés le {new Date(results.timestamp).toLocaleString("fr-FR")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.tests.map((test, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      {test.name}
                    </h3>
                    {getStatusBadge(test.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{test.message}</p>
                  {test.data && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Voir les détails</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    </details>
                  )}
                  {test.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-600">
                        <strong>Erreur:</strong> {test.error}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats de l'analyse démo */}
      {demoResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Analyse IA Démo - {demoResult.player.name}
            </CardTitle>
            <CardDescription>
              {demoResult.player.position} • {demoResult.player.club} • Rating: {demoResult.player.rating}/100
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Résumé */}
              <div>
                <h4 className="font-semibold mb-2">📋 Résumé</h4>
                <p className="text-sm text-muted-foreground">{demoResult.analysis.summary}</p>
              </div>

              {/* Scores */}
              <div>
                <h4 className="font-semibold mb-2">📊 Scores d'évaluation</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">{demoResult.analysis.technical_score}</div>
                    <div className="text-xs text-blue-600">Technique</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">{demoResult.analysis.tactical_score}</div>
                    <div className="text-xs text-green-600">Tactique</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded">
                    <div className="text-2xl font-bold text-orange-600">{demoResult.analysis.physical_score}</div>
                    <div className="text-xs text-orange-600">Physique</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="text-2xl font-bold text-purple-600">{demoResult.analysis.mental_score}</div>
                    <div className="text-xs text-purple-600">Mental</div>
                  </div>
                </div>
              </div>

              {/* Points forts et faibles */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">✅ Points forts</h4>
                  <ul className="text-sm space-y-1">
                    {demoResult.analysis.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600">⚠️ Points à améliorer</h4>
                  <ul className="text-sm space-y-1">
                    {demoResult.analysis.weaknesses.map((weakness: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommandations */}
              <div>
                <h4 className="font-semibold mb-2 text-blue-600">💡 Recommandations</h4>
                <ul className="text-sm space-y-1">
                  {demoResult.analysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Infos supplémentaires */}
              {demoResult.analysis.potential_rating && (
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Potentiel:</span> {demoResult.analysis.potential_rating}/100
                    </div>
                    <div>
                      <span className="font-semibold">Évolution valeur:</span>{" "}
                      {demoResult.analysis.market_value_evolution}
                    </div>
                    <div>
                      <span className="font-semibold">Style:</span> {demoResult.analysis.playing_style}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Tests système:</strong> Vérifie les connexions Supabase, Groq, la structure de la base de données
              et les fonctionnalités principales.
            </p>
            <p>
              <strong>Test analyse IA:</strong> Génère une analyse complète d'un joueur de test avec l'IA Groq.
            </p>
            <p>
              <strong>Si tout est vert ✅:</strong> Votre application est prête pour la production !
            </p>
            <p>
              <strong>Si des erreurs ❌:</strong> Vérifiez vos variables d'environnement et la configuration Supabase.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
