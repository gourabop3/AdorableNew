"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import VibeLogo from "@/vibe-logo.svg";
import { 
  TwitterIcon, 
  LinkedinIcon, 
  GithubIcon, 
  DiscordIcon,
  ArrowRightIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon
} from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Templates", href: "/templates" },
    { name: "Integrations", href: "/integrations" },
    { name: "API", href: "/api" },
    { name: "Changelog", href: "/changelog" }
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
    { name: "Partners", href: "/partners" },
    { name: "Contact", href: "/contact" }
  ],
  resources: [
    { name: "Documentation", href: "/docs" },
    { name: "Help Center", href: "/help" },
    { name: "Community", href: "/community" },
    { name: "Tutorials", href: "/tutorials" },
    { name: "Examples", href: "/examples" },
    { name: "Status", href: "/status" }
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR", href: "/gdpr" },
    { name: "Security", href: "/security" },
    { name: "Compliance", href: "/compliance" }
  ]
};

const socialLinks = [
  { name: "Twitter", href: "https://twitter.com/vibe", icon: TwitterIcon },
  { name: "LinkedIn", href: "https://linkedin.com/company/vibe", icon: LinkedinIcon },
  { name: "GitHub", href: "https://github.com/vibe", icon: GithubIcon },
  { name: "Discord", href: "https://discord.gg/vibe", icon: DiscordIcon }
];

export function ProfessionalFooter() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubscribing(true);
    
    // Simulate newsletter subscription
    setTimeout(() => {
      toast.success("Successfully subscribed to our newsletter!");
      setEmail("");
      setIsSubscribing(false);
    }, 1000);
  };

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      <div className="relative z-10">
        {/* Newsletter Section */}
        <div className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Stay ahead of the curve
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Get the latest updates on AI development tools, new features, and industry insights.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isSubscribing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                >
                  {isSubscribing ? "Subscribing..." : "Subscribe"}
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Image src={VibeLogo} alt="Vibe Logo" width={40} height={40} />
                <span className="text-2xl font-bold">Vibe</span>
                <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">AI</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-sm">
                Transform your ideas into fully functional applications with AI-powered development. 
                The future of software creation is here.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3 text-sm text-gray-400">
                  <MailIcon className="w-4 h-4" />
                  <span>hello@vibe.dev</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-400">
                  <PhoneIcon className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-400">
                  <MapPinIcon className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Resources</h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-gray-400">
                © 2024 Vibe AI, Inc. All rights reserved.
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span>Built with ❤️ for developers</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}