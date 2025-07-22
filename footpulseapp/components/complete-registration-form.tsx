"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, User, Video, BarChart3, CheckCircle, Loader2, Zap } from "lucide-react"

export default function CompleteRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    // Étape 1 - Infos personnelles
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    height: "",
    weight: "",

    // Étape 2 - Profil sportif
    position: "",
    strongFoot: "",
    jerseyNumber: "",
    currentClub: "",
    experience: "",

    // Étape 3 - Vidéo
    videoFile: null as File | null,
    videoUrl: "",
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, videoFile: file }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAnalysis = async () => {
    setIsAnalyzing(true)
    setCurrentStep(4) // Aller à l'étape d'analyse

    try {
      const response = await fetch("/api/analyze-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerData: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            position: formData.position,
            age: new Date().getFullYear() - new Date(formData.birthDate).getFullYear(),
            club: formData.currentClub,
            phone: formData.phone,
            height: formData.height,
            weight: formData.weight,
            strongFoot: formData.strongFoot,
            jerseyNumber: formData.jerseyNumber,
            experience: formData.experience,
          },
          videoFile: formData.videoFile
            ? {
                name: formData.videoFile.name,
                size: formData.videoFile.size,
                duration: 120, // Simulation
              }
            : null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setAnalysisResult(result.analysis)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de l'analyse. Veuillez réessayer.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-footpulse-electric rounded-full flex items-center justify-center">
                <span className="text-footpulse-dark font-bold text-sm">FP</span>
              </div>
              <span className="text-xl font-bold text-footpulse-dark">FootPulse</span>
            </div>
            <Badge className="bg-green-500">
              <Zap className="mr-1" size={14} />
              100% Gratuit
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-footpulse-dark">Progression</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? "bg-footpulse-electric text-white" : "bg-gray-200 text-gray-500"}`}
              >
                <User size={20} />
              </div>
              <div className={`w-12 h-1 ${currentStep > 1 ? "bg-footpulse-electric" : "bg-gray-200"}`} />
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? "bg-footpulse-electric text-white" : "bg-gray-200 text-gray-500"}`}
              >
                <Video size={20} />
              </div>
              <div className={`w-12 h-1 ${currentStep > 2 ? "bg-footpulse-electric" : "bg-gray-200"}`} />
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? "bg-footpulse-electric text-white" : "bg-gray-200 text-gray-500"}`}
              >
                <Upload size={20} />
              </div>
              <div className={`w-12 h-1 ${currentStep > 3 ? "bg-footpulse-electric" : "bg-gray-200"}`} />
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 4 ? "bg-footpulse-electric text-white" : "bg-gray-200 text-gray-500"}`}
              >
                <BarChart3 size={20} />
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-footpulse-dark">
                {currentStep === 1 && "Informations personnelles"}
                {currentStep === 2 && "Profil sportif"}
                {currentStep === 3 && "Vidéo de match"}
                {currentStep === 4 && "Analyse IA en cours"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Étape 1: Informations personnelles */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="birthDate">Date de naissance *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">Taille (cm)</Label>
                      <Input
                        id="height"
                        value={formData.height}
                        onChange={(e) => handleInputChange("height", e.target.value)}
                        placeholder="175"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Poids (kg)</Label>
                      <Input
                        id="weight"
                        value={formData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        placeholder="70"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 2: Profil sportif */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="position">Poste principal *</Label>
                    <Select onValueChange={(value) => handleInputChange("position", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre poste" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gardien">Gardien de but</SelectItem>
                        <SelectItem value="Défenseur central">Défenseur central</SelectItem>
                        <SelectItem value="Latéral droit">Latéral droit</SelectItem>
                        <SelectItem value="Latéral gauche">Latéral gauche</SelectItem>
                        <SelectItem value="Milieu défensif">Milieu défensif</SelectItem>
                        <SelectItem value="Milieu central">Milieu central</SelectItem>
                        <SelectItem value="Milieu offensif">Milieu offensif</SelectItem>
                        <SelectItem value="Ailier droit">Ailier droit</SelectItem>
                        <SelectItem value="Ailier gauche">Ailier gauche</SelectItem>
                        <SelectItem value="Attaquant">Attaquant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="strongFoot">Pied fort *</Label>
                      <Select onValueChange={(value) => handleInputChange("strongFoot", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pied fort" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Droit">Droit</SelectItem>
                          <SelectItem value="Gauche">Gauche</SelectItem>
                          <SelectItem value="Ambidextre">Ambidextre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="jerseyNumber">Numéro de maillot</Label>
                      <Input
                        id="jerseyNumber"
                        value={formData.jerseyNumber}
                        onChange={(e) => handleInputChange("jerseyNumber", e.target.value)}
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="currentClub">Club actuel</Label>
                    <Input
                      id="currentClub"
                      value={formData.currentClub}
                      onChange={(e) => handleInputChange("currentClub", e.target.value)}
                      placeholder="Nom de votre club"
                    />
                  </div>

                  <div>
                    <Label htmlFor="experience">Années d'expérience</Label>
                    <Select onValueChange={(value) => handleInputChange("experience", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Votre expérience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Débutant">Débutant (0-2 ans)</SelectItem>
                        <SelectItem value="Amateur">Amateur (3-5 ans)</SelectItem>
                        <SelectItem value="Confirmé">Confirmé (6-10 ans)</SelectItem>
                        <SelectItem value="Expert">Expert (10+ ans)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Étape 3: Upload vidéo */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label>Vidéo de match (optionnel)</Label>
                    <p className="text-sm text-gray-500 mb-4">
                      L'analyse IA fonctionne même sans vidéo, basée sur votre profil
                    </p>

                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="videoUpload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="text-sm text-gray-500">
                            {formData.videoFile ? formData.videoFile.name : "Cliquez pour uploader (optionnel)"}
                          </p>
                          <p className="text-xs text-gray-400">MP4, MOV jusqu'à 100MB</p>
                        </div>
                        <input
                          id="videoUpload"
                          type="file"
                          className="hidden"
                          accept="video/*"
                          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>

                    <div className="text-center text-gray-500 my-4">ou</div>

                    <div>
                      <Input
                        placeholder="https://youtube.com/watch?v=... (optionnel)"
                        value={formData.videoUrl}
                        onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-700 mb-2">🎯 Analyse IA Gratuite</h3>
                    <ul className="text-sm text-green-600 space-y-1">
                      <li>✅ Analyse basée sur votre profil et poste</li>
                      <li>✅ Scores détaillés sur 6 critères</li>
                      <li>✅ Recommandations personnalisées</li>
                      <li>✅ Évaluation du potentiel</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Étape 4: Analyse */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {isAnalyzing ? (
                    <div className="text-center space-y-4">
                      <Loader2 className="w-12 h-12 animate-spin text-footpulse-electric mx-auto" />
                      <h3 className="text-lg font-semibold">Analyse IA en cours...</h3>
                      <p className="text-gray-600">Notre IA analyse votre profil footballistique</p>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">⚡ Powered by Groq - Analyse ultra-rapide et gratuite</p>
                      </div>
                    </div>
                  ) : analysisResult ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-green-700">Analyse terminée !</h3>
                      </div>

                      {/* Score global */}
                      <div className="text-center p-6 bg-gradient-to-r from-footpulse-dark to-blue-900 text-white rounded-lg">
                        <div className="text-4xl font-bold mb-2">{analysisResult.globalScore}</div>
                        <div className="text-footpulse-electric">Score Global</div>
                        <div className="text-sm opacity-75 mt-2">{analysisResult.potential}</div>
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

                      {/* Points forts et recommandations */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-green-600 mb-3">💪 Points forts</h4>
                          <ul className="space-y-2">
                            {analysisResult.strengths?.map((strength: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="text-green-500 mt-0.5" size={16} />
                                <span className="text-sm">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-blue-600 mb-3">🎯 Recommandations</h4>
                          <ul className="space-y-2">
                            {analysisResult.recommendations?.map((rec: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2">
                                <BarChart3 className="text-blue-500 mt-0.5" size={16} />
                                <span className="text-sm">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Analyse de poste */}
                      {analysisResult.positionAnalysis && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">📋 Analyse spécifique au poste</h4>
                          <p className="text-sm text-gray-700">{analysisResult.positionAnalysis}</p>
                        </div>
                      )}

                      <div className="flex space-x-4">
                        <Button className="flex-1 bg-footpulse-electric text-footpulse-dark hover:bg-blue-400">
                          Accéder au Dashboard
                        </Button>
                        <Button variant="outline" className="flex-1 bg-transparent">
                          Partager le profil
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="bg-transparent">
                    Précédent
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      onClick={nextStep}
                      className="bg-footpulse-electric text-footpulse-dark hover:bg-blue-400"
                      disabled={
                        (currentStep === 1 &&
                          (!formData.firstName || !formData.lastName || !formData.email || !formData.birthDate)) ||
                        (currentStep === 2 && !formData.position)
                      }
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAnalysis}
                      className="bg-green-500 hover:bg-green-600 text-white"
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" size={16} />
                          Analyse en cours...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2" size={16} />
                          Lancer l'analyse IA gratuite
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
