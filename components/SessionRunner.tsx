
import React, { useState, useEffect, useRef } from 'react';
import { PlanType, SessionPhase, SessionRecord, PLAN_DETAILS, SessionMeta } from '../types';
import { Compass, Shield, History, ArrowRight, CheckCircle, AlertTriangle, Link as LinkIcon, Play, Pause, RotateCcw } from 'lucide-react';

interface SessionRunnerProps {
  plan: PlanType;
  onComplete: (record: SessionRecord) => void;
  onExit: () => void;
}

// Production Times (Seconds)
const DURATION_CALIBRATION = 180; // 3 mins
const DURATION_FOCUS = 52 * 60;   // 52 mins
const DURATION_REVIEW = 300;      // 5 mins

// Helper for formatted time
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * Reusable Countdown Timer Component
 */
const CountdownTimer = ({ 
  timeLeft, 
  isPaused, 
  onTogglePause, 
  onReset,
  phase 
}: { 
  timeLeft: number, 
  isPaused: boolean, 
  onTogglePause: () => void,
  onReset?: () => void,
  phase: SessionPhase
}) => {
  const isFocus = phase === 'FOCUS';
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <h1 className={`
          ${isFocus ? 'text-[7rem] md:text-[9rem]' : 'text-5xl md:text-7xl'} 
          font-bold tabular-nums leading-none tracking-tighter select-none font-mono transition-all duration-500
          ${isPaused ? 'opacity-30 blur-[2px]' : 'opacity-100 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]'}
        `}>
          {formatTime(timeLeft)}
        </h1>
        
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gold-500 font-bold tracking-[0.3em] text-sm md:text-xl uppercase animate-pulse bg-black/60 px-4 py-1 rounded backdrop-blur-sm border border-gold-500/20">
              PAUSED
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onTogglePause}
          className={`
            p-3 rounded-full transition-all duration-300 flex items-center justify-center
            ${isPaused 
              ? 'bg-white text-black hover:scale-110 shadow-lg shadow-white/10' 
              : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}
          `}
          title={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
        </button>
        
        {onReset && isPaused && (
          <button 
            onClick={onReset}
            className="p-3 rounded-full bg-gray-900 border border-gray-800 text-gray-500 hover:text-red-400 transition-colors"
            title="Reset Phase Timer"
          >
            <RotateCcw size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default function SessionRunner({ plan, onComplete, onExit }: SessionRunnerProps) {
  const [phase, setPhase] = useState<SessionPhase>('CALIBRATION');
  const [timeLeft, setTimeLeft] = useState(DURATION_CALIBRATION);
  const [isPaused, setIsPaused] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  
  // Core Form State
  const [goal, setGoal] = useState('');
  const [why, setWhy] = useState('');
  const [reflection, setReflection] = useState('');
  const [refinement, setRefinement] = useState('');

  // Meta State
  const [gratitudes, setGratitudes] = useState<string[]>(['', '', '']);
  const [externalLink, setExternalLink] = useState('');
  const [activityType, setActivityType] = useState<'MOVEMENT' | 'CONNECTION' | 'MEDITATION'>('MOVEMENT');
  const [interruptions, setInterruptions] = useState(0);

  useEffect(() => {
    // Timer Interval
    const interval = window.setInterval(() => {
      if (!isPaused && !showEmergencyModal && phase !== 'COMPLETED') {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handlePhaseComplete(phase);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isPaused, showEmergencyModal]);

  const handlePhaseComplete = (currentPhase: SessionPhase) => {
    if (currentPhase === 'CALIBRATION') {
      // Auto-advance if forms are filled? Usually better to wait for button
    } else if (currentPhase === 'FOCUS') {
       setPhase('REVIEW');
       setTimeLeft(DURATION_REVIEW);
       setIsPaused(false);
    } else if (currentPhase === 'REVIEW') {
       // Just stop
    }
  };

  const advancePhase = () => {
    if (phase === 'CALIBRATION') {
        if (!goal || !why) return alert("Direction before action. Fill out the compass.");
        if (plan === PlanType.FOUNDATION && gratitudes.some(g => !g.trim())) return alert("Gratitude is the foundation. Please list 3.");
        setPhase('FOCUS');
        setTimeLeft(DURATION_FOCUS);
        setIsPaused(false); 
    } else if (phase === 'FOCUS') {
        if (confirm("End the Iron Fence early? This is not recommended.")) {
            setPhase('REVIEW');
            setTimeLeft(DURATION_REVIEW);
            setIsPaused(false);
        }
    } else if (phase === 'REVIEW') {
        if (!reflection) return alert("Reflect to refine. Don't skip the mirror.");
        finishSession();
    }
  };

  const resetPhaseTimer = () => {
    if (!confirm("Reset the timer for this phase?")) return;
    if (phase === 'CALIBRATION') setTimeLeft(DURATION_CALIBRATION);
    if (phase === 'FOCUS') setTimeLeft(DURATION_FOCUS);
    if (phase === 'REVIEW') setTimeLeft(DURATION_REVIEW);
  };

  const handleEmergencyToggle = () => {
      setShowEmergencyModal(true);
  };

  const confirmEmergencyBreak = () => {
      setInterruptions(prev => prev + 1);
      setShowEmergencyModal(false);
      setIsPaused(true); 
  };

  const finishSession = () => {
    const meta: SessionMeta = {
        gratitudes: plan === PlanType.FOUNDATION ? gratitudes : undefined,
        externalLink: plan === PlanType.BUILDER ? externalLink : undefined,
        activityType: plan === PlanType.VITALITY ? activityType : undefined,
        interruptions
    };

    const record: SessionRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      completedAt: Date.now(),
      plan,
      goal,
      why,
      reflection,
      refinement,
      meta
    };
    onComplete(record);
  };

  // --- RENDERERS ---

  const renderCalibrationInputs = () => {
      switch(plan) {
          case PlanType.FOUNDATION:
              return (
                  <div className="space-y-4 bg-gray-900/50 p-6 rounded-xl border border-blue-900/30">
                      <h3 className="text-blue-400 font-bold uppercase text-xs tracking-wider mb-2">Morning Ritual Inputs</h3>
                      <p className="text-sm text-gray-400 mb-2">Write 3 things you are grateful for:</p>
                      {gratitudes.map((g, i) => (
                          <input 
                            key={i}
                            value={g}
                            onChange={e => {
                                const newG = [...gratitudes];
                                newG[i] = e.target.value;
                                setGratitudes(newG);
                            }}
                            placeholder={`Gratitude #${i+1}`}
                            className="w-full bg-black border border-gray-700 rounded-lg p-2 text-sm focus:border-blue-500 focus:outline-none"
                          />
                      ))}
                  </div>
              );
          case PlanType.BUILDER:
              return (
                  <div className="space-y-4 bg-gray-900/50 p-6 rounded-xl border border-emerald-900/30">
                      <h3 className="text-emerald-400 font-bold uppercase text-xs tracking-wider mb-2">Builder Tools</h3>
                      <div>
                          <label className="block text-sm text-gray-400 mb-1">Workspace Link (Optional)</label>
                          <div className="flex gap-2">
                            <input 
                                value={externalLink}
                                onChange={e => setExternalLink(e.target.value)}
                                placeholder="https://github.com/..."
                                className="w-full bg-black border border-gray-700 rounded-lg p-2 text-sm focus:border-emerald-500 focus:outline-none"
                            />
                            <LinkIcon size={16} className="text-gray-500 self-center" />
                          </div>
                      </div>
                  </div>
              );
          case PlanType.VITALITY:
               return (
                  <div className="space-y-4 bg-gray-900/50 p-6 rounded-xl border border-rose-900/30">
                      <h3 className="text-rose-400 font-bold uppercase text-xs tracking-wider mb-2">Vitality Focus</h3>
                      <div className="flex gap-2 mb-2">
                          {(['MOVEMENT', 'CONNECTION', 'MEDITATION'] as const).map(type => (
                              <button
                                key={type}
                                onClick={() => setActivityType(type)}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg border ${activityType === type ? 'bg-rose-500 text-white border-rose-500' : 'bg-black border-gray-700 text-gray-500'}`}
                              >
                                  {type}
                              </button>
                          ))}
                      </div>
                      <p className="text-xs text-gray-500">
                          {activityType === 'MOVEMENT' && "Focus on form and breath."}
                          {activityType === 'CONNECTION' && "Deep listening. No phones."}
                          {activityType === 'MEDITATION' && "Stillness leads to strength."}
                      </p>
                  </div>
               );
          default: return null;
      }
  }

  const renderCalibration = () => (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in pb-10">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-gray-800 rounded-full mb-4">
          <Compass className={`w-8 h-8 ${PLAN_DETAILS[plan].color}`} />
        </div>
        <h2 className="text-3xl font-bold">Phase 1: Calibration</h2>
        <p className="text-gray-400 mt-2">"Where am I going? Why does this matter?"</p>
      </div>

      <div className="flex justify-center py-4">
        <CountdownTimer 
          timeLeft={timeLeft} 
          isPaused={isPaused} 
          onTogglePause={() => setIsPaused(!isPaused)}
          onReset={resetPhaseTimer}
          phase={phase}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Target for this Hour</label>
          <input 
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., Write 500 words, Run 3 miles..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 focus:border-gold-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">The "Why" (Legacy Connection)</label>
          <textarea 
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="This matters because..."
            rows={2}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 focus:border-gold-500 focus:outline-none transition-colors"
          />
        </div>
        
        {renderCalibrationInputs()}
      </div>
      
      <div className="flex justify-end pt-4">
         <button 
           onClick={advancePhase}
           className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 group shadow-xl"
         >
           Enter Iron Fence <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
         </button>
      </div>
    </div>
  );

  const renderFocus = () => (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center relative py-12">
      
      {/* Emergency Modal Overlay */}
      {showEmergencyModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm rounded-xl p-4">
              <div className="bg-red-950/50 border border-red-500/50 p-8 rounded-2xl max-w-md text-center space-y-6">
                  <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
                  <h3 className="text-2xl font-bold text-white">Don't Trade Gold for Crumbs.</h3>
                  <p className="text-gray-300">
                      You are about to break the Iron Fence. Is this a genuine emergency, or just a distraction disguised as urgency?
                  </p>
                  <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setShowEmergencyModal(false)}
                        className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200"
                      >
                          Resume The Hour (Stay Strong)
                      </button>
                      <button 
                        onClick={confirmEmergencyBreak}
                        className="w-full py-3 bg-transparent border border-red-800 text-red-400 font-bold rounded-xl hover:bg-red-900/20"
                      >
                          It is an Emergency (Break Fence)
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="mb-12 space-y-8">
        <div className={`inline-flex items-center gap-2 ${PLAN_DETAILS[plan].color} transition-all duration-300 ${isPaused ? 'opacity-50' : 'opacity-100'}`}>
           <Shield className={!isPaused ? "animate-pulse" : ""} />
           <span className="font-bold tracking-widest text-sm uppercase">
               {isPaused ? "Iron Fence Paused" : "Iron Fence Active"}
           </span>
        </div>
        
        <CountdownTimer 
          timeLeft={timeLeft} 
          isPaused={isPaused} 
          onTogglePause={() => setIsPaused(!isPaused)}
          onReset={resetPhaseTimer}
          phase={phase}
        />

        <div className="space-y-4">
            <p className="text-3xl text-white font-medium max-w-2xl mx-auto leading-tight">
                "{goal}"
            </p>
            {externalLink && (
                <a 
                    href={externalLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                    <LinkIcon size={14} /> Open Work Environment
                </a>
            )}
            <p className="text-sm text-gray-500 max-w-md mx-auto italic">
               {isPaused ? "Session suspended. Stay in the zone." : "Deep concentration in progress. The world waits."}
            </p>
        </div>
      </div>

      <div className="mt-8">
        <button 
          onClick={handleEmergencyToggle}
          className="px-6 py-2 rounded-full border border-gray-800 text-gray-600 hover:text-red-400 hover:border-red-900/50 transition-colors font-medium flex items-center gap-2 text-xs"
        >
          <AlertTriangle size={14} />
          Emergency Override
        </button>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-xs text-gray-700 font-mono tracking-widest uppercase">Interruptions logged: {interruptions}</p>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in pb-10">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-gray-800 rounded-full mb-4">
          <History className={`w-8 h-8 ${PLAN_DETAILS[plan].color}`} />
        </div>
        <h2 className="text-3xl font-bold">Phase 3: Debrief</h2>
        <p className="text-gray-400 mt-2">"Reflect, Refine, Repeat."</p>
      </div>

      <div className="flex justify-center py-4">
        <CountdownTimer 
          timeLeft={timeLeft} 
          isPaused={isPaused} 
          onTogglePause={() => setIsPaused(!isPaused)}
          onReset={resetPhaseTimer}
          phase={phase}
        />
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
              {plan === PlanType.BUILDER ? "What tangible progress did you make?" : 
               plan === PlanType.VITALITY ? "How does your body/mind feel?" :
               "What did you learn or visualize?"}
          </label>
          <textarea 
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 focus:border-purple-500 focus:outline-none transition-colors"
            rows={4}
            placeholder="Insight before outcome..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Refine: What will you do differently tomorrow?</label>
          <textarea 
            value={refinement}
            onChange={(e) => setRefinement(e.target.value)}
            placeholder="Small tweak, big result..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 focus:border-purple-500 focus:outline-none transition-colors"
            rows={2}
          />
        </div>

        {interruptions > 0 && (
            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm leading-relaxed">
                    You had {interruptions} interruption(s). Tomorrow, double down on the Social Contract. Guard the hour at all costs.
                </p>
            </div>
        )}
      </div>
      
      <div className="flex justify-end pt-6">
        <button 
           onClick={advancePhase}
           className="bg-gold-500 text-black px-10 py-4 rounded-full font-bold hover:bg-gold-400 hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-gold-500/20"
         >
           Stack This Hour <CheckCircle size={22} />
         </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[85vh] flex flex-col px-4">
       <div className="mb-8 flex justify-between items-center border-b border-gray-800 pb-4 mt-4">
          <button onClick={onExit} className="text-sm text-gray-500 hover:text-white transition-colors font-medium">Quit Session</button>
          
          <div className="flex gap-4">
             <StepIndicator active={phase === 'CALIBRATION'} done={phase !== 'CALIBRATION'} label="Aim" color={PLAN_DETAILS[plan].bg.replace('bg-', '')} />
             <div className="w-6 md:w-10 h-px bg-gray-800 self-center"></div>
             <StepIndicator active={phase === 'FOCUS'} done={phase === 'REVIEW'} label="Act" color={PLAN_DETAILS[plan].bg.replace('bg-', '')} />
             <div className="w-6 md:w-10 h-px bg-gray-800 self-center"></div>
             <StepIndicator active={phase === 'REVIEW'} done={false} label="Reflect" color={PLAN_DETAILS[plan].bg.replace('bg-', '')} />
          </div>

          <div className={`text-xs font-bold ${PLAN_DETAILS[plan].color} uppercase tracking-widest hidden lg:block`}>
              {PLAN_DETAILS[plan].title}
          </div>
       </div>

       <div className="flex-1 flex flex-col justify-center relative max-w-4xl mx-auto w-full">
         {phase === 'CALIBRATION' && renderCalibration()}
         {phase === 'FOCUS' && renderFocus()}
         {phase === 'REVIEW' && renderReview()}
       </div>
    </div>
  );
}

const StepIndicator = ({ active, done, label, color }: { active: boolean, done: boolean, label: string, color: string }) => {
    const activeClass = active ? `bg-${color} scale-125 shadow-[0_0_15px_rgba(255,255,255,0.4)]` : '';
    const doneClass = done ? 'bg-gray-400' : 'bg-gray-800';
    
    return (
        <div className={`flex flex-col items-center gap-2 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${active ? activeClass : doneClass}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{label}</span>
        </div>
    );
};
