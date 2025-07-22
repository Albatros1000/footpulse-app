"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Upload, ArrowLeft, ArrowRight, User, Video, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function PlayerRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    height: "",
    weight: "",
    position: "",
    strongFoot: "",
    jerseyNumber: "",
    currentClub: "",
    profilePhoto: null as File | null,
    matchVideo: null as File | null,
    videoUrl: "",
    experience: "",
    goals: "",
  })

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
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

  const handleSubmit = () => {
    // Ici on enverrait les données à l'API
    console.log("Données du formulaire:", formData)
    // Redirection vers le dashboard
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-footpulse-electric rounded-full flex items-center justify-center">
                <span className="text-footpulse-dark font-bold text-sm">FP</span>
              </div>
              <span className="text-xl font-bold text-footpulse-dark">FootPulse</span>
            </Link>
            <div className="text-sm text-gray-500">
              Étape {currentStep} sur {totalSteps}
            </div>
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
                <BarChart3 size={20} />
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-footpulse-dark">
                {currentStep === 1 && "Informations personnelles"}
                {currentStep === 2 && "Vidéo et profil sportif"}
                {currentStep === 3 && "Finalisation du profil"}
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

                  <div>
                    <Label htmlFor="profilePhoto">Photo de profil</Label>
                    <div className="mt-2 flex items-center justify-center w-full">
                      <label
                        htmlFor="profilePhoto"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="text-sm text-gray-500">Cliquez pour uploader une photo</p>
                        </div>
                        <input
                          id="profilePhoto"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChange("profilePhoto", e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 2: Vidéo et profil sportif */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="position">Poste *</Label>
                      <Select onValueChange={(value) => handleInputChange("position", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre poste" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gardien">Gardien de but</SelectItem>
                          <SelectItem value="defenseur-central">Défenseur central</SelectItem>
                          <SelectItem value="lateral-droit">Latéral droit</SelectItem>
                          <SelectItem value="lateral-gauche">Latéral gauche</SelectItem>
                          <SelectItem value="milieu-defensif">Milieu défensif</SelectItem>
                          <SelectItem value="milieu-central">Milieu central</SelectItem>
                          <SelectItem value="milieu-offensif">Milieu offensif</SelectItem>
                          <SelectItem value="ailier-droit">Ailier droit</SelectItem>
                          <SelectItem value="ailier-gauche">Ailier gauche</SelectItem>
                          <SelectItem value="attaquant">Attaquant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="strongFoot">Pied fort *</Label>
                      <Select onValueChange={(value) => handleInputChange("strongFoot", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pied fort" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="droit">Droit</SelectItem>
                          <SelectItem value="gauche">Gauche</SelectItem>
                          <SelectItem value="ambidextre">Ambidextre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jerseyNumber">Numéro de maillot</Label>
                      <Input
                        id="jerseyNumber"
                        value={formData.jerseyNumber}
                        onChange={(e) => handleInputChange("jerseyNumber", e.target.value)}
                        placeholder="10"
                      />
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
                  </div>

                  <div>
                    <Label>Vidéo de match *</Label>
                    <p className="text-sm text-gray-500 mb-2">Uploadez une vidéo de match ou collez un lien YouTube</p>

                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="matchVideo"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Video className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="text-sm text-gray-500">Cliquez pour uploader une vidéo</p>
                            <p className="text-xs text-gray-400">MP4, MOV jusqu'à 500MB</p>
                          </div>
                          <input
                            id="matchVideo"
                            type="file"
                            className="hidden"
                            accept="video/*"
                            onChange={(e) => handleFileChange("matchVideo", e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>

                      <div className="text-center text-gray-500">ou</div>

                      <div>
                        <Input
                          placeholder="https://youtube.com/watch?v=..."
                          value={formData.videoUrl}
                          onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 3: Finalisation */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="experience">Expérience footballistique</Label>
                    <Textarea
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => handleInputChange("experience", e.target.value)}
                      placeholder="Décrivez votre parcours footballistique, vos clubs précédents, vos réalisations..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="goals">Objectifs</Label>
                    <Textarea
                      id="goals"
                      value={formData.goals}
                      onChange={(e) => handleInputChange("goals", e.target.value)}
                      placeholder="Quels sont vos objectifs ? Quel type de club recherchez-vous ?"
                      rows={3}
                    />
                  </div>

                  <div className="bg-footpulse-electric/10 p-6 rounded-lg">
                    <h3 className="font-semibold text-footpulse-dark mb-2">🎯 Prochaines étapes</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Votre vidéo sera analysée par notre IA (24-48h)</li>
                      <li>• Vous recevrez un rapport détaillé de vos performances</li>
                      <li>• Votre profil sera visible par les clubs partenaires</li>
                      <li>• Vous pourrez accéder à votre dashboard personnalisé</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center bg-transparent"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Précédent
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    className="bg-footpulse-electric text-footpulse-dark hover:bg-blue-400 flex items-center"
                  >
                    Suivant
                    <ArrowRight className="ml-2" size={16} />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-footpulse-electric text-footpulse-dark hover:bg-blue-400 flex items-center"
                  >
                    Envoyer pour analyse IA
                    <ArrowRight className="ml-2" size={16} />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
