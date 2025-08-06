"use client";

import { motion } from "framer-motion";
import { StarIcon, QuoteIcon } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    quote: "I absolutely LOVE your product! It is the single best thing that I experienced since I found ChatGPT! The value that you create with this is just over the top mind-blowing as it basically replaces or enhances a ton of SaaS-Solutions in an instant.",
    author: "Thomas K.",
    role: "Startup Founder",
    company: "TechFlow",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5
  },
  {
    quote: "Vibe is hands down the best tool I've ever used. It's like a super senior dev who shares his tricks with you. For the first time, I can build apps without the headache. It's so much fun to use and gets me results in a heartbeat. Love it!",
    author: "Karin M.",
    role: "Product Manager",
    company: "InnovateCorp",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 5
  },
  {
    quote: "I'm always amazed at how fast we can whip up a UI with Vibe. It gives me a solid base that I can easily tweak and build on. Plus, using it to integrate it with the backend is magical!",
    author: "Martin R.",
    role: "Lead Developer",
    company: "Platanus",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5
  },
  {
    quote: "Vibe empowers me to create frontends that surpass my own technical limitations. It allows me to swiftly develop prototypes to showcase to clients, without the need for generic templates or starting from scratch.",
    author: "Marius P.",
    role: "Freelancer",
    company: "Veloxforce",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 5
  },
  {
    quote: "Hi team, I just wanted to drop you a quick note to say how amazing Vibe is. I'm truly impressed by its quality, accuracy, speed, and how easy it is to use. It's a standout compared to anything else out there.",
    author: "Ray B.",
    role: "Software Engineer",
    company: "DevCorp",
    avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face",
    rating: 5
  },
  {
    quote: "I tried Vibe yesterday, and it was amazing. I had to build a showcase for our own AI model. One prompt was enough to get a solid UI, and after a few iterations it was connected to our API.",
    author: "Daniel S.",
    role: "AI Engineer",
    company: "AILabs",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    rating: 5
  }
];

const companies = [
  { name: "Vercel", logo: "https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png" },
  { name: "Next.js", logo: "https://nextjs.org/static/favicon/favicon-32x32.png" },
  { name: "Supabase", logo: "https://supabase.com/favicon/favicon-32x32.png" },
  { name: "GitHub", logo: "https://github.githubassets.com/favicons/favicon-32x32.png" },
  { name: "OpenAI", logo: "https://openai.com/favicon.ico" },
  { name: "Stripe", logo: "https://stripe.com/favicon.ico" }
];

export function TestimonialsSection() {
  return (
    <div className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] bg-repeat"></div>
      
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
              Loved by thousands of product creators
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what developers, founders, and product teams are saying about Vibe
            </p>
          </motion.div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 hover:shadow-2xl hover:border-gray-300 transition-all duration-300 group-hover:scale-105 h-full flex flex-col">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative mb-6 flex-1">
                  <QuoteIcon className="absolute -top-2 -left-2 w-8 h-8 text-blue-200" />
                  <p className="text-gray-700 leading-relaxed relative z-10 italic">
                    "{testimonial.quote}"
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Companies Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Trusted by teams at
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {companies.map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center space-x-3 group"
              >
                <div className="w-8 h-8 relative">
                  <Image
                    src={company.logo}
                    alt={company.name}
                    width={32}
                    height={32}
                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <span className="text-lg font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">
                  {company.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Proof Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 md:p-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">500K+</div>
              <div className="text-gray-600">Developers building</div>
              <div className="text-sm text-gray-500 mt-1">across 150+ countries</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">10M+</div>
              <div className="text-gray-600">Apps generated</div>
              <div className="text-sm text-gray-500 mt-1">and deployed worldwide</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">4.9/5</div>
              <div className="text-gray-600">Average rating</div>
              <div className="text-sm text-gray-500 mt-1">from 50,000+ reviews</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}