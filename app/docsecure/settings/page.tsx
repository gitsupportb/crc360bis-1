"use client"

import { useState } from "react"
import { DocSecureDashboardLayout } from "@/components/docsecure/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Database, 
  Users, 
  FileText,
  Save,
  AlertTriangle,
  Check,
  Key,
  Mail,
  Globe
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function DocSecureSettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    organizationName: "BCP Securities Services",
    defaultLanguage: "fr",
    timezone: "Europe/Paris",
    
    // Security Settings
    twoFactorAuth: true,
    passwordExpiry: 90,
    maxFileSize: 10,
    allowedFileTypes: ["pdf", "docx", "xlsx", "pptx"],
    
    // Notification Settings
    emailNotifications: true,
    documentUploadNotifications: true,
    documentAccessNotifications: false,
    weeklyReports: true,
    
    // Storage Settings
    autoBackup: true,
    backupFrequency: "daily",
    retentionPeriod: 365,
    compressionEnabled: true
  })

  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos paramètres ont été mis à jour avec succès.",
    })
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <DocSecureDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              boxShadow: '0 8px 25px rgba(107, 114, 128, 0.3)'
            }}
          >
            <Settings className="h-6 w-6 text-white" />
            <h1 className="text-2xl font-bold text-white" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
              Paramètres & Configuration
            </h1>
          </div>
          <p className="text-gray-700 max-w-2xl mx-auto font-medium">
            Configurez votre plateforme DOC SECURE selon vos besoins
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Général
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Stockage
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Paramètres généraux
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Nom de l'organisation</Label>
                    <Input
                      id="orgName"
                      value={settings.organizationName}
                      onChange={(e) => updateSetting('organizationName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue par défaut</Label>
                    <Select value={settings.defaultLanguage} onValueChange={(value) => updateSetting('defaultLanguage', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Paris">Europe/Paris (UTC+1)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Paramètres de sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Authentification à deux facteurs</Label>
                      <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                    />
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="passwordExpiry">Expiration du mot de passe (jours)</Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        value={settings.passwordExpiry}
                        onChange={(e) => updateSetting('passwordExpiry', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxFileSize">Taille maximale des fichiers (MB)</Label>
                      <Input
                        id="maxFileSize"
                        type="number"
                        value={settings.maxFileSize}
                        onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Types de fichiers autorisés</Label>
                    <div className="flex flex-wrap gap-2">
                      {settings.allowedFileTypes.map((type) => (
                        <Badge key={type} variant="secondary">
                          .{type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-orange-900">Recommandations de sécurité</h3>
                      <ul className="text-sm text-orange-800 mt-2 space-y-1">
                        <li>• Activez l'authentification à deux facteurs</li>
                        <li>• Limitez la taille des fichiers pour éviter les attaques</li>
                        <li>• Révisez régulièrement les permissions utilisateurs</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Paramètres de notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Notifications par email</Label>
                      <p className="text-sm text-gray-500">Recevoir des notifications par email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Notifications de téléchargement</Label>
                      <p className="text-sm text-gray-500">Être notifié lors du téléchargement de documents</p>
                    </div>
                    <Switch
                      checked={settings.documentUploadNotifications}
                      onCheckedChange={(checked) => updateSetting('documentUploadNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Notifications d'accès aux documents</Label>
                      <p className="text-sm text-gray-500">Être notifié lors de l'accès aux documents</p>
                    </div>
                    <Switch
                      checked={settings.documentAccessNotifications}
                      onCheckedChange={(checked) => updateSetting('documentAccessNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Rapports hebdomadaires</Label>
                      <p className="text-sm text-gray-500">Recevoir un rapport d'activité chaque semaine</p>
                    </div>
                    <Switch
                      checked={settings.weeklyReports}
                      onCheckedChange={(checked) => updateSetting('weeklyReports', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Storage Settings */}
          <TabsContent value="storage">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Paramètres de stockage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Sauvegarde automatique</Label>
                    <p className="text-sm text-gray-500">Sauvegarder automatiquement les documents</p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="backupFreq">Fréquence de sauvegarde</Label>
                    <Select value={settings.backupFrequency} onValueChange={(value) => updateSetting('backupFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Toutes les heures</SelectItem>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retention">Période de rétention (jours)</Label>
                    <Input
                      id="retention"
                      type="number"
                      value={settings.retentionPeriod}
                      onChange={(e) => updateSetting('retentionPeriod', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Compression des fichiers</Label>
                    <p className="text-sm text-gray-500">Compresser les fichiers pour économiser l'espace</p>
                  </div>
                  <Switch
                    checked={settings.compressionEnabled}
                    onCheckedChange={(checked) => updateSetting('compressionEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestion des utilisateurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Gestion des utilisateurs</h3>
                  <p className="text-gray-500 mb-4">Cette fonctionnalité sera disponible dans une prochaine version.</p>
                  <Button variant="outline" disabled>
                    <User className="h-4 w-4 mr-2" />
                    Gérer les utilisateurs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder les paramètres
          </Button>
        </div>
      </div>
    </DocSecureDashboardLayout>
  )
}
