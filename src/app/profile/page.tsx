"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  UserIcon, 
  SettingsIcon, 
  CreditCardIcon, 
  BellIcon, 
  ShieldIcon,
  KeyIcon,
  PaletteIcon,
  GlobeIcon,
  DownloadIcon,
  TrashIcon,
  LinkIcon,
  GitBranchIcon,
  DatabaseIcon,
  ZapIcon,
  EyeIcon,
  MessageSquareIcon,
  CodeIcon,
  RocketIcon,
  CrownIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ExternalLinkIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    company: "TechCorp",
    role: "Senior Developer",
    bio: "Full-stack developer passionate about AI and modern web technologies.",
    website: "https://johndoe.dev",
    github: "johndoe",
    twitter: "@johndoe"
  });

  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "en",
    timezone: "UTC",
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: true,
    weeklyDigest: true,
    autoSave: true,
    livePreview: true,
    codeCompletion: true,
    aiSuggestions: true
  });

  const [billing] = useState({
    plan: "Pro",
    credits: 450,
    nextBilling: "2024-02-15",
    amount: "$50/month"
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Profile updated successfully!");
      setIsLoading(false);
    }, 1000);
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Preferences saved!");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-lg text-gray-600">{profile.role} at {profile.company}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <CrownIcon className="w-3 h-3 mr-1" />
                    {billing.plan} Plan
                  </Badge>
                  <Badge variant="outline">
                    <ZapIcon className="w-3 h-3 mr-1" />
                    {billing.credits} Credits
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <ExternalLinkIcon className="w-4 h-4 mr-2" />
                View Public Profile
              </Button>
              <Button size="sm">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-white/80 backdrop-blur-sm border border-gray-200/50">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <CreditCardIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center space-x-2">
              <LinkIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <ShieldIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <BellIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserIcon className="w-5 h-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>
                  Update your personal information and public profile details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) => setProfile({...profile, company: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={profile.role}
                      onChange={(e) => setProfile({...profile, role: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={(e) => setProfile({...profile, website: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub Username</Label>
                    <Input
                      id="github"
                      value={profile.github}
                      onChange={(e) => setProfile({...profile, github: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PaletteIcon className="w-5 h-5" />
                    <span>Appearance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme">Theme</Label>
                    <select 
                      id="theme"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={preferences.theme}
                      onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="language">Language</Label>
                    <select 
                      id="language"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={preferences.language}
                      onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CodeIcon className="w-5 h-5" />
                    <span>Editor Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-save</Label>
                      <p className="text-sm text-gray-500">Automatically save changes</p>
                    </div>
                    <Switch
                      checked={preferences.autoSave}
                      onCheckedChange={(checked) => setPreferences({...preferences, autoSave: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Live Preview</Label>
                      <p className="text-sm text-gray-500">Real-time preview updates</p>
                    </div>
                    <Switch
                      checked={preferences.livePreview}
                      onCheckedChange={(checked) => setPreferences({...preferences, livePreview: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>AI Suggestions</Label>
                      <p className="text-sm text-gray-500">Enable AI-powered code suggestions</p>
                    </div>
                    <Switch
                      checked={preferences.aiSuggestions}
                      onCheckedChange={(checked) => setPreferences({...preferences, aiSuggestions: checked})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSavePreferences} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CrownIcon className="w-5 h-5" />
                    <span>Current Plan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">{billing.plan} Plan</div>
                      <div className="text-gray-500">{billing.amount}</div>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Credits Used</span>
                      <span>{1000 - billing.credits}/1000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" 
                        style={{width: `${((1000 - billing.credits) / 1000) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Next billing: {billing.nextBilling}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Apps Generated</span>
                    <span className="font-semibold">247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Deployments</span>
                    <span className="font-semibold">189</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Calls</span>
                    <span className="font-semibold">12,450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage Used</span>
                    <span className="font-semibold">2.4 GB</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex space-x-4">
              <Button>
                <CreditCardIcon className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
              <Button variant="outline">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GitBranchIcon className="w-5 h-5" />
                    <span>GitHub</span>
                  </CardTitle>
                  <CardDescription>
                    Sync your projects with GitHub repositories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span>Connected</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DatabaseIcon className="w-5 h-5" />
                    <span>Supabase</span>
                  </CardTitle>
                  <CardDescription>
                    Connect to your Supabase projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertCircleIcon className="w-5 h-5 text-yellow-500" />
                      <span>Not Connected</span>
                    </div>
                    <Button size="sm">
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <RocketIcon className="w-5 h-5" />
                    <span>Vercel</span>
                  </CardTitle>
                  <CardDescription>
                    Deploy your apps to Vercel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span>Connected</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquareIcon className="w-5 h-5" />
                    <span>Slack</span>
                  </CardTitle>
                  <CardDescription>
                    Get notifications in your Slack workspace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertCircleIcon className="w-5 h-5 text-yellow-500" />
                      <span>Not Connected</span>
                    </div>
                    <Button size="sm">
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <KeyIcon className="w-5 h-5" />
                  <span>Password & Authentication</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button>Change Password</Button>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage your API keys for external integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button>Generate New API Key</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BellIcon className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => setPreferences({...preferences, emailNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-500">Product updates and tips</p>
                  </div>
                  <Switch
                    checked={preferences.marketingEmails}
                    onCheckedChange={(checked) => setPreferences({...preferences, marketingEmails: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-gray-500">Summary of your activity</p>
                  </div>
                  <Switch
                    checked={preferences.weeklyDigest}
                    onCheckedChange={(checked) => setPreferences({...preferences, weeklyDigest: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}