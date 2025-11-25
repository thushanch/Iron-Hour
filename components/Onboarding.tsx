import React, { useState } from 'react';
import { PlanType, PLAN_DETAILS } from '../types';
import { Sunrise, Hammer, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (name: string, plan: PlanType) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  const icons = {
    [PlanType.FOUNDATION]: <Sunrise className="w-8 h-8 mb-4 text-blue-400" />,
    [PlanType.BUILDER]: <Hammer className="w-8 h-8 mb-4 text-emerald-400" />,
    [PlanType.VITALITY]: <Heart className="w-8 h-8 mb-4 text-rose-400" />,
  };

  const handleNext = () => {
    if (step === 1 && name.trim()) setStep(2);
    else if (step === 2 && selectedPlan) onComplete(name, selectedPlan);
  };

  return (
    <div className="min-h-screen bg-iron-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl w-full animate-fade-in-up">
        
        {step === 1 && (
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              One hour changes <span className="text-gold-500">everything</span>.
            </h1>
            <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
              Most people are busy, but few are growing. Take back your time. 
              Before we begin, what should we call you?
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="bg-transparent border-b-2 border-gray-700 text-3xl text-center w-full max-w-xs py-2 focus:border-gold-500 focus:outline-none transition-colors text-white placeholder-gray-600"
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
            <div className="pt-8">
              <button
                disabled={!name.trim()}
                onClick={handleNext}
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold text-lg rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
              >
                Begin the Transformation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-left">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold">Choose Your Ritual Track</h2>
              <p className="text-gray-400 mt-2">Where do you need to focus right now?</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {Object.values(PlanType).map((plan) => (
                <button
                  key={plan}
                  onClick={() => setSelectedPlan(plan)}
                  className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:-translate-y-1 ${
                    selectedPlan === plan 
                      ? `${PLAN_DETAILS[plan].border} bg-gray-900/50` 
                      : 'border-gray-800 bg-gray-900/20 hover:border-gray-600'
                  }`}
                >
                  {selectedPlan === plan && (
                    <div className="absolute top-4 right-4 text-gold-500">
                      <CheckCircle2 />
                    </div>
                  )}
                  {icons[plan]}
                  <h3 className="text-xl font-bold text-white mb-1">{PLAN_DETAILS[plan].title}</h3>
                  <p className={`text-sm font-medium mb-3 ${PLAN_DETAILS[plan].color.replace('text-', 'text-opacity-80 text-')}`}>
                    {PLAN_DETAILS[plan].subtitle}
                  </p>
                  <p className="text-sm text-gray-400 leading-snug">
                    {PLAN_DETAILS[plan].description}
                  </p>
                </button>
              ))}
            </div>

            <div className="pt-8 text-center">
              <button
                disabled={!selectedPlan}
                onClick={handleNext}
                className="px-10 py-4 bg-gold-500 text-black font-bold text-lg rounded-full shadow-lg shadow-gold-500/20 hover:bg-gold-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Commitment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}