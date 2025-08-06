"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  PlusIcon, 
  RocketIcon, 
  EyeIcon, 
  MoreHorizontalIcon,
  FolderIcon,
  CodeIcon,
  GitBranchIcon,
  ClockIcon,
  TrendingUpIcon,
  UsersIcon,
  ZapIcon,
  BarChart3Icon,
  CalendarIcon,
  SettingsIcon,
  ExternalLinkIcon,
  DownloadIcon,
  ShareIcon,
  TrashIcon,
  EditIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  StarIcon,
  MessageSquareIcon,
  BrainIcon,
  DatabaseIcon,
  GlobeIcon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Project {
  id: string;
  name: string;
  description: string;
  framework: string;
  status: "building" | "deployed" | "draft" | "error";
  lastUpdated: Date;
  url?: string;
  thumbnail: string;
  collaborators: number;
  views: number;
}

export default function DashboardPage() {
  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "Todo App with Auth",
      description: "A modern todo application with user authentication and real-time sync",
      framework: "Next.js",
      status: "deployed",
      lastUpdated: new Date("2024-01-15"),
      url: "https://todo-app.vibe.dev",
      thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
      collaborators: 2,
      views: 1247
    },
    {
      id: "2",
      name: "E-commerce Dashboard",
      description: "Admin dashboard for managing products, orders, and analytics",
      framework: "React",
      status: "building",
      lastUpdated: new Date("2024-01-20"),
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      collaborators: 1,
      views: 0
    },
    {
      id: "3",
      name: "Landing Page Builder",
      description: "Drag-and-drop landing page builder with templates",
      framework: "Vue.js",
      status: "deployed",
      lastUpdated: new Date("2024-01-18"),
      url: "https://landing-builder.vibe.dev",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      collaborators: 3,
      views: 892
    },
    {
      id: "4",
      name: "Chat Application",
      description: "Real-time chat app with file sharing and video calls",
      framework: "Next.js",
      status: "draft",
      lastUpdated: new Date("2024-01-12"),
      thumbnail: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&h=300&fit=crop",
      collaborators: 1,
      views: 0
    }
  ]);

  const stats = [
    { label: "Total Projects", value: "12", change: "+3", icon: FolderIcon, color: "blue" },
    { label: "Active Deployments", value: "8", change: "+2", icon: RocketIcon, color: "green" },
    { label: "Total Views", value: "24.5K", change: "+12%", icon: EyeIcon, color: "purple" },
    { label: "Credits Used", value: "450", change: "-50", icon: ZapIcon, color: "orange" }
  ];

  const recentActivity = [
    { id: "1", type: "deploy", message: "Deployed Todo App with Auth", time: "2 hours ago", icon: RocketIcon },
    { id: "2", type: "build", message: "Started building E-commerce Dashboard", time: "4 hours ago", icon: CodeIcon },
    { id: "3", type: "share", message: "Shared Landing Page Builder", time: "1 day ago", icon: ShareIcon },
    { id: "4", type: "update", message: "Updated Chat Application design", time: "2 days ago", icon: EditIcon }
  ];

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "deployed": return "bg-green-100 text-green-800";
      case "building": return "bg-blue-100 text-blue-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "error": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Project["status"]) => {
    switch (status) {
      case "deployed": return <CheckCircleIcon className="w-4 h-4" />;
      case "building": return <PlayIcon className="w-4 h-4" />;
      case "draft": return <PauseIcon className="w-4 h-4" />;
      case "error": return <AlertCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your AI-generated applications</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Link href="/chat">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <BrainIcon className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <p className={`text-sm mt-1 ${
                        stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`p-3 rounded-2xl bg-${stat.color}-100`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FolderIcon className="w-5 h-5" />
                    <span>Recent Projects</span>
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="group"
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 group-hover:scale-105 border border-gray-200/50">
                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                          <Image
                            src={project.thumbnail}
                            alt={project.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-4 left-4 right-4 flex space-x-2">
                              <Button size="sm" className="flex-1">
                                <EyeIcon className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              <Button size="sm" variant="outline" className="bg-white/20 backdrop-blur-sm border-white/30">
                                <MoreHorizontalIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {project.name}
                            </h3>
                            <Badge className={`${getStatusColor(project.status)} flex items-center space-x-1`}>
                              {getStatusIcon(project.status)}
                              <span className="capitalize">{project.status}</span>
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {project.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center space-x-1">
                                <CodeIcon className="w-3 h-3" />
                                <span>{project.framework}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <UsersIcon className="w-3 h-3" />
                                <span>{project.collaborators}</span>
                              </span>
                              {project.views > 0 && (
                                <span className="flex items-center space-x-1">
                                  <EyeIcon className="w-3 h-3" />
                                  <span>{project.views.toLocaleString()}</span>
                                </span>
                              )}
                            </div>
                            <span>{project.lastUpdated.toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ZapIcon className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/chat">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <MessageSquareIcon className="w-4 h-4 mr-2" />
                    Start New Chat
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <GitBranchIcon className="w-4 h-4 mr-2" />
                  Import from GitHub
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DatabaseIcon className="w-4 h-4 mr-2" />
                  Connect Database
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <GlobeIcon className="w-4 h-4 mr-2" />
                  Custom Domain
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ClockIcon className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <activity.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3Icon className="w-5 h-5" />
                  <span>This Month</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Apps Generated</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Deployments</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Calls</span>
                    <span className="font-semibold">2.4K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Storage</span>
                    <span className="font-semibold">1.2 GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}