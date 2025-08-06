"use client";

import { motion } from "framer-motion";
import { 
  TrendingUpIcon, 
  UsersIcon, 
  GlobeIcon, 
  ZapIcon,
  CodeIcon,
  RocketIcon,
  ClockIcon,
  CheckCircleIcon
} from "lucide-react";

const stats = [
  {
    value: "500K+",
    label: "Active Developers",
    description: "Building amazing apps worldwide",
    icon: UsersIcon,
    color: "from-blue-500 to-cyan-500"
  },
  {
    value: "10M+",
    label: "Apps Generated",
    description: "Production-ready applications",
    icon: RocketIcon,
    color: "from-purple-500 to-pink-500"
  },
  {
    value: "150+",
    label: "Countries",
    description: "Global developer community",
    icon: GlobeIcon,
    color: "from-green-500 to-emerald-500"
  },
  {
    value: "30s",
    label: "Avg Build Time",
    description: "From idea to working app",
    icon: ZapIcon,
    color: "from-yellow-500 to-orange-500"
  },
  {
    value: "99.9%",
    label: "Uptime",
    description: "Always available when you need it",
    icon: CheckCircleIcon,
    color: "from-teal-500 to-blue-500"
  },
  {
    value: "50+",
    label: "Tech Stacks",
    description: "Frameworks and libraries supported",
    icon: CodeIcon,
    color: "from-indigo-500 to-purple-500"
  }
];

const achievements = [
  { metric: "4.9/5", description: "Average user rating" },
  { metric: "98%", description: "Customer satisfaction" },
  { metric: "24/7", description: "Support availability" },
  { metric: "SOC 2", description: "Security compliance" }
];

export function StatsSection() {
  return (
    <div className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-blue-50/30"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
      
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
              Powering the future of development
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join hundreds of thousands of developers who are already building the next generation of applications with AI
            </p>
          </motion.div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 hover:shadow-2xl hover:border-gray-300 transition-all duration-300 group-hover:scale-105 text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                
                <div className="text-xl font-semibold text-gray-700 mb-2">
                  {stat.label}
                </div>
                
                <div className="text-gray-500">
                  {stat.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Achievement Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={achievement.metric} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {achievement.metric}
                </div>
                <div className="text-gray-300 text-sm">
                  {achievement.description}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Growth Chart Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Growing every day
            </h3>
            <p className="text-lg text-gray-600">
              Our community and platform continue to expand rapidly
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUpIcon className="w-10 h-10 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">+1,000</div>
              <div className="text-gray-600">New developers daily</div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <RocketIcon className="w-10 h-10 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">+10,000</div>
              <div className="text-gray-600">Apps deployed weekly</div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-10 h-10 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">2M+</div>
              <div className="text-gray-600">Hours saved monthly</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}