import React, { useState, useEffect } from 'react';
import { Sparkles, Grid3x3, Zap, BarChart3, GitBranch, Download, ChevronRight, Play, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Grid3x3,
      title: "Spreadsheet Interface",
      desc: "Edit your data like Excel. No code, just clicks."
    },
    {
      icon: Sparkles,
      title: "AI Assistant",
      desc: "Smart suggestions that you control. Apply or skip."
    },
    {
      icon: BarChart3,
      title: "Visual Insights",
      desc: "See before & after. Understand every change."
    },
    {
      icon: GitBranch,
      title: "Pipeline Tracking",
      desc: "Reproduce your workflow on any dataset."
    }
  ];

  const operations = [
    "Remove duplicates",
    "Handle missing values",
    "Encode categories",
    "Scale features",
    "Engineer new fields"
  ];

  return (
    <div className="bg-white text-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-gray-200">
        <div className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold">Clyra</span>
          </div>
          <div className="flex gap-8 items-center">
            <button className="text-sm text-gray-600 hover:text-black transition-colors">Features</button>
            <button className="text-sm text-gray-600 hover:text-black transition-colors">Pricing</button>
            <button className="text-sm text-gray-600 hover:text-black transition-colors">Docs</button>
            <Link to ='/signup'>
            <button className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm rounded-full transition-all">
              Try Clyra
            </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-20 max-w-6xl mx-auto text-center">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-semibold leading-tight tracking-tight">
            Data preprocessing.
            <br />
            <span className="text-gray-500">Reimagined.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
            Transform messy datasets into ML-ready perfection. No coding required.
          </p>

          <div className="flex gap-4 justify-center pt-6">
             <Link to ='/signup'>
            <button className="px-6 py-3 bg-black hover:bg-gray-800 text-white text-sm rounded-full transition-all font-medium">
              Get started
            </button>
            </Link>
            <button className="px-6 py-3 text-black border border-gray-300 hover:border-gray-400 text-sm rounded-full transition-all font-medium">
              Watch the film
            </button>
          </div>
        </div>

        {/* Hero Image/Demo */}
        <div className="mt-16 relative">
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-gray-50 border border-gray-200">
            <div className="p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Before</div>
                  <div className="bg-white rounded-xl p-5 space-y-3 border border-gray-200 shadow-sm">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-4 bg-red-100 rounded w-20"></div>
                        <div className="h-4 bg-gray-100 rounded flex-1"></div>
                        <div className="h-4 bg-gray-100 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">After</div>
                  <div className="bg-white rounded-xl p-5 space-y-3 border border-gray-200 shadow-sm">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-4 bg-black rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight 1 */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-black text-white text-xs font-medium rounded-full uppercase tracking-wide">
                Interface
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
                Spreadsheet simplicity.
                <br />
                <span className="text-gray-500">Enterprise power.</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Every operation at your fingertips. Point, click, and watch your data transform in real-time.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="space-y-4">
                {operations.map((op, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base">{op}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight 2 */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 shadow-xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">AI Suggestion</span>
                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 bg-black text-white rounded-full text-xs font-medium hover:bg-gray-800 transition-colors">
                      Apply
                    </button>
                    <button className="px-4 py-1.5 border border-gray-300 rounded-full text-xs font-medium hover:border-gray-400 transition-colors">
                      Skip
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Column "Age" has 25% missing values
                      </p>
                      <p className="font-medium">
                        Impute with median?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-block px-3 py-1 bg-black text-white text-xs font-medium rounded-full uppercase tracking-wide">
                AI Assistant
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
                AI suggests.
                <br />
                <span className="text-gray-500">You decide.</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Smart recommendations based on your data. Accept them with one click or continue with your own approach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Everything you need.
              <br />
              <span className="text-gray-500">Nothing you don't.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-black text-white rounded-3xl p-16 text-center space-y-12">
            <h2 className="text-4xl md:text-5xl font-semibold">
              Trusted by data teams.
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div>
                <div className="text-5xl font-semibold mb-2">10K+</div>
                <div className="text-gray-400">Datasets cleaned</div>
              </div>
              <div>
                <div className="text-5xl font-semibold mb-2">50K+</div>
                <div className="text-gray-400">Operations applied</div>
              </div>
              <div>
                <div className="text-5xl font-semibold mb-2">95%</div>
                <div className="text-gray-400">Time saved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600">
            Start cleaning your data in minutes. No credit card required.
          </p>
           <Link to ='/signup'>
          <button className="px-8 py-4 bg-black hover:bg-gray-800 text-white rounded-full transition-all font-medium text-lg">
            Try Clyra for free
          </button>
          </Link>
          <p className="text-sm text-gray-500">14-day free trial. Cancel anytime.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">Clyra</span>
          </div>
          <p className="text-sm text-gray-500">© 2024 Clyra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}