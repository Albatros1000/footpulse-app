"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Upload, BarChart3, Users, Star, ArrowRight, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Header */}
      <header className="bg-footpulse-dark text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-footpulse-electric rounded-full flex items-center justify-center">
                <span className="text-footpulse-dark font-bold text-sm">FP</span>
              </div>
              <span className="text-xl font-bold">FootPulse</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#fonctionnement" className="hover:text-footpulse-electric transition-colors">
                Fonctionnement
              </Link>
              <Link href="#clubs" className="hover:text-footpulse-electric transition-colors">
                Clubs
              </Link>
              <Link href="#contact" className="hover:text-footpulse-electric transition-colors">
                Contact
              </Link>
              <Button
                variant="outline"
                className="border-footpulse-electric text-footpulse-electric hover:bg-footpulse-electric hover:text-footpulse-dark bg-transparent"
              >
                Connexion
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
              <div className="flex flex-col space-y-4">
                <Link href="#fonctionnement" className="hover:text-footpulse-electric transition-colors">
                  Fonctionnement
                </Link>
                <Link href="#clubs" className="hover:text-footpulse-electric transition-colors">
                  Clubs
                </Link>
                <Link href="#contact" className="hover:text-footpulse-electric transition-colors">
                  Contact
                </Link>
                <Button
                  variant="outline"
                  className="border-footpulse-electric text-footpulse-electric hover:bg-footpulse-electric hover:text-footpulse-dark w-fit bg-transparent"
                >
                  Connexion
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-footpulse-dark via-footpulse-dark to-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-footpulse-electric text-footpulse-dark mb-6">
                ⚽ Nouvelle génération d'analyse football
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Révèle ton potentiel avec <span className="text-footpulse-electric">FootPulse</span>
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                Envoie tes vidéos de match, obtiens une analyse IA complète de tes performances et connecte-toi avec des
                clubs professionnels.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-footpulse-electric text-footpulse-dark hover:bg-blue-400 text-lg px-8"
                  >
                    Créer mon profil
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-footpulse-dark text-lg px-8 bg-transparent"
                >
                  <Play className="mr-2" size={20} />
                  Voir la démo
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-footpulse-electric to-blue-400 rounded-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HEROPULSE-min.jpg-MAwJeJdbuqOKKliCLbShAxriFwp4I5.jpeg"
                  alt="Joueur FootPulse en action dans le stade"
                  width={600}
                  height={400}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="fonctionnement" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-footpulse-dark mb-4">Comment ça marche ?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              3 étapes simples pour révolutionner ton parcours footballistique
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-footpulse-electric rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="text-footpulse-dark" size={32} />
                </div>
                <h3 className="text-xl font-bold text-footpulse-dark mb-4">1. Upload ta vidéo</h3>
                <p className="text-gray-600">
                  Envoie tes vidéos de match ou d'entraînement directement depuis ton téléphone ou ordinateur.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-footpulse-electric rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="text-footpulse-dark" size={32} />
                </div>
                <h3 className="text-xl font-bold text-footpulse-dark mb-4">2. Analyse IA</h3>
                <p className="text-gray-600">
                  Notre IA analyse tes performances : vitesse, précision, positionnement, technique et bien plus.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-footpulse-electric rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="text-footpulse-dark" size={32} />
                </div>
                <h3 className="text-xl font-bold text-footpulse-dark mb-4">3. Connecte-toi</h3>
                <p className="text-gray-600">
                  Les clubs et recruteurs accèdent à ton profil et peuvent te contacter directement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-footpulse-dark mb-4">Ils nous font confiance</h2>
            <p className="text-xl text-gray-600">
              Découvre les témoignages de joueurs et coachs qui utilisent FootPulse
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "FootPulse m'a permis d'identifier mes points faibles et de progresser rapidement. J'ai été contacté
                  par 3 clubs en 2 mois !"
                </p>
                <div className="flex items-center">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="Thomas"
                    width={40}
                    height={40}
                    className="rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold text-footpulse-dark">Thomas M.</p>
                    <p className="text-sm text-gray-500">Milieu offensif, 19 ans</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "En tant que coach, FootPulse me fait gagner un temps précieux dans l'analyse des performances de mes
                  joueurs."
                </p>
                <div className="flex items-center">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="Coach Martin"
                    width={40}
                    height={40}
                    className="rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold text-footpulse-dark">Coach Martin</p>
                    <p className="text-sm text-gray-500">Entraîneur U21</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "L'interface est intuitive et les analyses sont très détaillées. Parfait pour suivre ma progression !"
                </p>
                <div className="flex items-center">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="Sarah"
                    width={40}
                    height={40}
                    className="rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold text-footpulse-dark">Sarah L.</p>
                    <p className="text-sm text-gray-500">Défenseure, 22 ans</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-footpulse-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à révéler ton potentiel ?</h2>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Rejoins des milliers de joueurs qui utilisent déjà FootPulse pour améliorer leurs performances et se faire
            remarquer par les clubs.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-footpulse-electric text-footpulse-dark hover:bg-blue-400 text-lg px-12">
              Créer mon profil gratuitement
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-footpulse-electric rounded-full flex items-center justify-center">
                  <span className="text-footpulse-dark font-bold text-sm">FP</span>
                </div>
                <span className="text-xl font-bold">FootPulse</span>
              </div>
              <p className="text-gray-400">La plateforme d'analyse football nouvelle génération.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Centre d'aide
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Statut
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    RGPD
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FootPulse. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
