"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Filter,
  Users,
  BarChart3,
  Video,
  Star,
  MapPin,
  Eye,
  MessageCircle,
  Download,
  TrendingUp,
} from "lucide-react"

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")

  // Données simulées des joueurs
  const players = [
    {
      id: 1,
      name: "Thomas Martin",
      age: 19,
      position: "Milieu offensif",
      club: "FC Exemple",
      score: 78,
      location: "Lyon, France",
      availability: "Disponible",
      lastActive: "Il y a 2 jours",
      videos: 3,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Sarah Dubois",
      age: 22,
      position: "Défenseure centrale",
      club: "AS Féminine",
      score: 82,
      location: "Paris, France",
      availability: "En négociation",
      lastActive: "Il y a 1 jour",
      videos: 5,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Kevin Rousseau",
      age: 20,
      position: "Attaquant",
      club: "Sporting Club",
      score: 85,
      location: "Marseille, France",
      availability: "Disponible",
      lastActive: "Il y a 3 heures",
      videos: 7,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "Lucas Moreau",
      age: 18,
      position: "Gardien",
      club: "Jeunes Talents FC",
      score: 76,
      location: "Toulouse, France",
      availability: "Disponible",
      lastActive: "Il y a 1 jour",
      videos: 2,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const stats = {
    totalPlayers: 1247,
    activeToday: 89,
    newThisWeek: 23,
    averageScore: 74,
  }

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.club.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPosition =
      positionFilter === "all" || player.position.toLowerCase().includes(positionFilter.toLowerCase())

    return matchesSearch && matchesPosition
  })

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header */}
      <header className="bg-footpulse-dark text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Admin</h1>
              <p className="text-footpulse-electric">Gestion des joueurs et recrutement</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-footpulse-electric text-footpulse-dark hover:bg-blue-400">
                <Download className="mr-2" size={16} />
                Exporter données
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total joueurs</p>
                  <p className="text-2xl font-bold text-footpulse-dark">{stats.totalPlayers}</p>
                </div>
                <Users className="text-footpulse-electric" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actifs aujourd'hui</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeToday}</p>
                </div>
                <TrendingUp className="text-green-500" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Nouveaux cette semaine</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.newThisWeek}</p>
                </div>
                <Star className="text-blue-500" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Score moyen</p>
                  <p className="text-2xl font-bold text-footpulse-electric">{stats.averageScore}</p>
                </div>
                <BarChart3 className="text-footpulse-electric" size={32} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="text-footpulse-electric" size={20} />
              <span>Recherche et filtres</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <Input
                  placeholder="Rechercher un joueur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Poste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les postes</SelectItem>
                  <SelectItem value="gardien">Gardien</SelectItem>
                  <SelectItem value="défenseur">Défenseur</SelectItem>
                  <SelectItem value="milieu">Milieu</SelectItem>
                  <SelectItem value="attaquant">Attaquant</SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  <SelectItem value="amateur">Amateur</SelectItem>
                  <SelectItem value="semi-pro">Semi-professionnel</SelectItem>
                  <SelectItem value="pro">Professionnel</SelectItem>
                </SelectContent>
              </Select>

              <Button className="bg-footpulse-electric text-footpulse-dark hover:bg-blue-400">Appliquer filtres</Button>
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="text-footpulse-electric" size={20} />
                <span>Liste des joueurs ({filteredPlayers.length})</span>
              </div>
              <Button variant="outline" size="sm">
                Vue grille
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPlayers.map((player) => (
                <div key={player.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={player.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {player.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-bold text-lg text-footpulse-dark">{player.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{player.age} ans</span>
                          <span>•</span>
                          <span>{player.position}</span>
                          <span>•</span>
                          <span>{player.club}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="text-gray-400" size={14} />
                          <span className="text-sm text-gray-500">{player.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Score</p>
                        <p className="text-xl font-bold text-footpulse-electric">{player.score}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-500">Vidéos</p>
                        <div className="flex items-center space-x-1">
                          <Video size={14} className="text-gray-400" />
                          <span className="font-semibold">{player.videos}</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <Badge
                          variant={player.availability === "Disponible" ? "default" : "secondary"}
                          className={player.availability === "Disponible" ? "bg-green-500" : ""}
                        >
                          {player.availability}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{player.lastActive}</p>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye size={14} className="mr-1" />
                          Voir profil
                        </Button>
                        <Button size="sm" className="bg-footpulse-electric text-footpulse-dark hover:bg-blue-400">
                          <MessageCircle size={14} className="mr-1" />
                          Contacter
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
