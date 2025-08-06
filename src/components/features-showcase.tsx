"use client";

import { motion } from "framer-motion";
import { 
  ZapIcon, 
  EyeIcon, 
  CodeIcon, 
  PaletteIcon,
  DatabaseIcon,
  GitBranchIcon,
  ShieldIcon,
  GlobeIcon,
  MessageSquareIcon,
  SettingsIcon,
  UsersIcon,
  RocketIcon,
  BrainIcon,
  LayersIcon,
  RefreshCwIcon,
  CheckCircleIcon
} from "lucide-react";

const features = [
  {
    title: "Instant & Intuitive",
    description: "Live rendering, handles image input, has instant undo and lets you collaborate with branching. The AI fixes your bugs. One-click deploy when ready.",
    icon: ZapIcon,
    color: "from-yellow-400 to-orange-500",
    details: ["Live rendering", "Image input support", "Instant undo", "Auto bug fixing", "One-click deploy"]
  },
  {
    title: "Beautiful Design",
    description: "We believe your product should look good. Vibe follows best practice UI & UX principles to make sure every idea you bring to life is beautifully designed.",
    icon: PaletteIcon,
    color: "from-pink-400 to-purple-500",
    details: ["Modern UI patterns", "Responsive design", "Accessibility first", "Brand consistency", "Professional aesthetics"]
  },
  {
    title: "Support Any Backend",
    description: "Vibe has support for databases, API integrations and back-end functionality. Connect your own or use our Supabase connector.",
    icon: DatabaseIcon,
    color: "from-blue-400 to-cyan-500",
    details: ["Database integration", "API connections", "Supabase support", "Custom backends", "Real-time sync"]
  },
  {
    title: "Select & Edit",
    description: "The accuracy you need to make fine grained changes. With Select & Edit you click an element and describe what you want updated.",
    icon: SettingsIcon,
    color: "from-green-400 to-emerald-500",
    details: ["Click to select", "Natural language edits", "Precise modifications", "Context awareness", "Instant updates"]
  },
  {
    title: "GitHub Integration",
    description: "Connect Vibe to your GitHub account to automatically sync the code to your repository. Perfect for project hand offs and more advanced workflows.",
    icon: GitBranchIcon,
    color: "from-purple-400 to-indigo-500",
    details: ["Auto sync", "Version control", "Branch management", "Collaboration", "Code ownership"]
  },
  {
    title: "Live Preview",
    description: "See your changes in real-time with our live preview feature. Test on desktop and mobile simultaneously while you build.",
    icon: EyeIcon,
    color: "from-teal-400 to-blue-500",
    details: ["Real-time updates", "Multi-device preview", "Responsive testing", "Interactive elements", "Instant feedback"]
  }
];

const stats = [
  { value: "500K+", label: "Developers Building", icon: UsersIcon },
  { value: "10M+", label: "Apps Generated", icon: RocketIcon },
  { value: "99.9%", label: "Uptime", icon: CheckCircleIcon },
  { value: "30s", label: "Avg Generation Time", icon: ZapIcon }
];

export function FeaturesShowcase() {
  return (
    <div className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              A superhuman full-stack product engineer
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to transform ideas into production-ready applications. 
              No compromises on quality, speed, or functionality.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 hover:shadow-2xl hover:border-gray-300 transition-all duration-300 group-hover:scale-105 h-full">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by developers worldwide
            </h3>
            <p className="text-xl text-gray-300">
              Join the community that's building the future of software development
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Additional Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Built for modern workflows
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Seamlessly integrate with your existing tools and processes. From design to deployment, 
              we've got you covered with enterprise-grade features.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Enterprise Security</h4>
                  <p className="text-gray-600 text-sm">SOC 2 compliant with end-to-end encryption</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <RefreshCwIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Continuous Deployment</h4>
                  <p className="text-gray-600 text-sm">Automatic updates and rollback capabilities</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LayersIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Scalable Infrastructure</h4>
                  <p className="text-gray-600 text-sm">Auto-scaling to handle any traffic volume</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-gray-200/50">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-mono text-gray-600">npm install @vibe/cli</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-mono text-gray-600">vibe init my-app</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-mono text-gray-600">vibe deploy --production</span>
                </div>
                <div className="mt-6 p-4 bg-white/80 rounded-xl border border-gray-200/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <RocketIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Deployed successfully!</span>
                  </div>
                  <p className="text-xs text-gray-500">Your app is live at https://my-app.vibe.dev</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}