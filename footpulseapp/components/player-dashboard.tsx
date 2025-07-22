"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  BarChart3,
  Video,
  Users,
  TrendingUp,
  Award,
  Target,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Ruler,
  Weight,
  Play,
  Download,
  Share2,
  Heart,
} from "lucide-react"
import Image from "next/image"

export default function PlayerDashboard() {
  const [activeTab, setActiveTab] = useState("profil")

  // Données simulées du joueur
  const playerData = {
    name: "Thomas Martin",
    position: "Milieu offensif",
    age: 19,
    club: "FC Exemple",
    jerseyNumber: 10,
    globalScore: 78,
    email: "thomas.martin@email.com",
    phone: "+33 6 12 34 56 78",
    height: "175 cm",
    weight: "70 kg",
    strongFoot: "Droit",
    birthDate: "15/03/2005",
  }

  const stats = {
    technique: 82,
    vitesse: 75,
    physique: 68,
    mental: 85,
    tactique: 79,
    precision: 88,
  }

  const videos = [
    {
      id: 1,
      title: "Match vs FC Rival - 15/01/2024",
      duration: "12:34",
      score: 85,
      status: "Analysé",
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 2,
      title: "Entraînement technique - 10/01/2024",
      duration: "8:45",
      score: 79,
      status: "Analysé",
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 3,
      title: "Match amical - 05/01/2024",
      duration: "15:20",
      score: null,
      status: "En cours d'analyse",
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
  ]

  const clubs = [
    {
      id: 1,
      name: "Olympique Lyonnais",
      level: "Ligue 1",
      interest: "Élevé",
      status: "Intéressé",
      logo: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "FC Nantes",
      level: "Ligue 1",
      interest: "Moyen",
      status: "En observation",
      logo: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Stade Rennais",
      level: "Ligue 1",
      interest: "Faible",
      status: "Profil consulté",
      logo: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="/placeholder.svg?height=48&width=48" />
                <AvatarFallback>TM</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-footpulse-dark">{playerData.name}</h1>
                <p className="text-gray-600">
                  {playerData.position} • {playerData.club}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Score global</p>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-footpulse-electric">{playerData.globalScore}</div>
                  <div className="text-sm text-green-600">+3</div>
                </div>
              </div>
              <Button className="bg-footpulse-electric text-footpulse-dark hover:bg-blue-400">
                <Share2 className="mr-2" size={16} />
                Partager profil
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
            <TabsTrigger value="profil" className="flex items-center space-x-2">
              <User size={16} />
              <span>Profil</span>
            </TabsTrigger>
            <TabsTrigger value="statistiques" className="flex items-center space-x-2">
              <BarChart3 size={16} />
              <span>Statistiques</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center space-x-2">
              <Video size={16} />
              <span>Vidéos</span>
            </TabsTrigger>
            <TabsTrigger value="clubs" className="flex items-center space-x-2">
              <Users size={16} />
              <span>Clubs</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Profil */}
          <TabsContent value="profil" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Carte principale du joueur */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="text-footpulse-electric" size={20} />
                    <span>Informations personnelles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="text-gray-400" size={16} />
                        <span>{playerData.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="text-gray-400" size={16} />
                        <span>{playerData.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="text-gray-400" size={16} />
                        <span>
                          {playerData.birthDate} ({playerData.age} ans)
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="text-gray-400" size={16} />
                        <span>{playerData.club}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Ruler className="text-gray-400" size={16} />
                        <span>Taille: {playerData.height}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Weight className="text-gray-400" size={16} />
                        <span>Poids: {playerData.weight}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Target className="text-gray-400" size={16} />
                        <span>Pied fort: {playerData.strongFoot}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Award className="text-gray-400" size={16} />
                        <span>N° {playerData.jerseyNumber}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Carte FIFA-style */}
              <Card className="bg-gradient-to-br from-footpulse-dark to-blue-900 text-white">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="text-3xl font-bold">{playerData.globalScore}</div>
                    <Avatar className="w-20 h-20 mx-auto border-4 border-footpulse-electric">
                      <AvatarImage src="/placeholder.svg?height=80&width=80" />
                      <AvatarFallback>TM</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg">{playerData.name}</h3>
                      <p className="text-footpulse-electric">{playerData.position}</p>
                      <p className="text-sm opacity-75">{playerData.club}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="font-semibold">VIT</div>
                        <div>{stats.vitesse}</div>
                      </div>
                      <div>
                        <div className="font-semibold">TEC</div>
                        <div>{stats.technique}</div>
                      </div>
                      <div>
                        <div className="font-semibold">PHY</div>
                        <div>{stats.physique}</div>
                      </div>
                      <div>
                        <div className="font-semibold">MEN</div>
                        <div>{stats.mental}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Statistiques */}
          <TabsContent value="statistiques" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="text-footpulse-electric" size={20} />
                    <span>Radar des performances</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="capitalize font-medium">{key}</span>
                          <span className="font-bold text-footpulse-electric">{value}</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Évolution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="text-green-500" size={20} />
                    <span>Évolution récente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span>Score global</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 font-bold">+3</span>
                        <TrendingUp className="text-green-500" size={16} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span>Technique</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600 font-bold">+5</span>
                        <TrendingUp className="text-blue-500" size={16} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span>Vitesse</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-600 font-bold">+2</span>
                        <TrendingUp className="text-yellow-500" size={16} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Vidéos */}
          <TabsContent value="videos" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="relative">
                    <Image
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      width={300}
                      height={180}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Button size="sm" className="bg-white/90 text-footpulse-dark hover:bg-white">
                        <Play size={16} />
                      </Button>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-footpulse-electric text-footpulse-dark">
                      {video.duration}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{video.title}</h3>
                    <div className="flex items-center justify-between">
                      <Badge variant={video.status === "Analysé" ? "default" : "secondary"}>{video.status}</Badge>
                      {video.score && <div className="text-footpulse-electric font-bold">Score: {video.score}</div>}
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Download size={14} className="mr-1" />
                        Rapport
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Onglet Clubs */}
          <TabsContent value="clubs" className="space-y-6">
            <div className="grid gap-4">
              {clubs.map((club) => (
                <Card key={club.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Image
                          src={club.logo || "/placeholder.svg"}
                          alt={club.name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                        <div>
                          <h3 className="font-bold text-lg">{club.name}</h3>
                          <p className="text-gray-600">{club.level}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge
                          variant={
                            club.interest === "Élevé" ? "default" : club.interest === "Moyen" ? "secondary" : "outline"
                          }
                          className={
                            club.interest === "Élevé"
                              ? "bg-green-500"
                              : club.interest === "Moyen"
                                ? "bg-yellow-500"
                                : ""
                          }
                        >
                          Intérêt {club.interest.toLowerCase()}
                        </Badge>
                        <p className="text-sm text-gray-500">{club.status}</p>
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-footpulse-electric text-footpulse-dark hover:bg-blue-400">
                            Contacter
                          </Button>
                          <Button size="sm" variant="outline">
                            <Heart size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
