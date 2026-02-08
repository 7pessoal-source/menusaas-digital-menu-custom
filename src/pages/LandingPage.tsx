import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from "@/components/HeroSection";
import BeliefBreakSection from "@/components/BeliefBreakSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import BenefitsSection from "@/components/BenefitsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FinalCTASection from "@/components/FinalCTASection";
import Footer from "@/components/Footer";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartNow = () => {
    navigate('/auth');
  };

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              <span className="font-display text-xl text-foreground">Cardápio Digital</span>
            </div>
            <button 
              onClick={handleStartNow}
              className="btn-hero py-2 px-5 text-sm"
            >
              Começar agora
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection onStartNow={handleStartNow} />

      {/* Belief Break Section */}
      <BeliefBreakSection />

      {/* Problem Section */}
      <ProblemSection />

      {/* Solution Section */}
      <SolutionSection />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Final CTA Section */}
      <FinalCTASection onStartNow={handleStartNow} />

      {/* Footer */}
      <Footer />
    </main>
  );
};

export default LandingPage;
