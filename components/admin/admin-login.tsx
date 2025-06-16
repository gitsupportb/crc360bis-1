"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Shield, Lock, User, Eye, EyeOff, Settings } from "lucide-react"

interface AdminLoginProps {
  onLoginSuccess: (user: { username: string; role: string }) => void
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      toast({
        title: "Champs requis",
        description: "Veuillez saisir votre nom d'utilisateur et mot de passe.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Use same credentials as DOC Secure admin
      if (username === "admin" && password === "BCP2Sadmin") {
        // Simulate successful login
        const user = {
          username: "admin",
          role: "administrator"
        };

        // Store session in localStorage as fallback
        localStorage.setItem('admin-session', 'authenticated');
        localStorage.setItem('admin-user', JSON.stringify(user));

        toast({
          title: "Connexion réussie",
          description: `Bienvenue dans le portail d'administration, ${user.username}!`,
        })
        onLoginSuccess(user)
        return;
      }

      // Try API authentication first
      try {
        const response = await fetch('/api/admin/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        })

        if (response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const result = await response.json()

            if (result.success) {
              toast({
                title: "Connexion réussie",
                description: `Bienvenue dans le portail d'administration, ${result.user.username}!`,
              })
              onLoginSuccess(result.user)
              return;
            }
          }
        }
      } catch (apiError) {
        console.warn('API authentication failed, using fallback:', apiError);
      }

      // If we reach here, credentials are invalid
      toast({
        title: "Erreur de connexion",
        description: "Nom d'utilisateur ou mot de passe incorrect.",
        variant: "destructive",
      })

    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Erreur de connexion",
        description: "Une erreur est survenue lors de la connexion.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
    }}>
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full" style={{
                background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)'
              }}>
                <Settings className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              BCP2S ADMIN PORTAL
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Portail d'administration centralisé
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Nom d'utilisateur
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Entrez votre nom d'utilisateur"
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl font-medium transition-all duration-300"
                    style={{
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                    }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl font-medium transition-all duration-300"
                    style={{
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                    }}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 hover:bg-gray-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-white font-bold rounded-xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                  boxShadow: '0 6px 20px rgba(255, 107, 53, 0.3)'
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connexion en cours...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Se connecter
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Portail d'administration</span>
              </div>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Accès aux outils d'administration Email et DOC Secure</li>
                <li>• Session sécurisée avec expiration automatique</li>
                <li>• Toutes les actions sont enregistrées</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
