
import React, { useState, useEffect, useRef } from 'react';
import { PlanType, SessionPhase, SessionRecord, PLAN_DETAILS, SessionMeta } from '../types';
import { Compass, Shield, History, ArrowRight, CheckCircle, AlertTriangle, Link as LinkIcon, Play, Pause } from 'lucide-react';

interface SessionRunnerProps {
  plan: PlanType;
  onComplete: (record: SessionRecord) => void;
  onExit: () => void;
}

// Production Times
const DURATION_CALIBRATION = 180; // 3 mins
const DURATION_FOCUS = 52 * 60;   // 52 mins
const DURATION_REVIEW = 300;      // 5 mins

// Helper for formatted time
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset timer on phase change
    if (phase === 'CALIBRATION') setTimeLeft(DURATION_CALIBRATION);
    if (phase === 'FOCUS') setTimeLeft(DURATION_FOCUS);
    if (phase === 'REVIEW') setTimeLeft(DURATION_REVIEW);

    const interval = window.setInterval(() => {
      // Timer runs if NOT paused AND NOT showing modal AND phase is not completed
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
    timerRef.current = interval;

    return () => clearInterval(interval);
  }, [phase]); // Dependency simplified as internal checks handle pause logic, but re-running effect on phase change is key

  const handlePhaseComplete = (currentPhase: SessionPhase) => {
    if (currentPhase === 'FOCUS') {
       // Play sound logic here
       setPhase('REVIEW');
       setIsPaused(false);
    }
  };

  const advancePhase = () => {
    if (phase === 'CALIBRATION') {
        if (!goal || !why) return alert("Direction before action. Fill out the compass.");
        if (plan === PlanType.FOUNDATION && gratitudes.some(g => !g.trim())) return alert("Gratitude is the foundation. Please list 3.");
        setPhase('FOCUS');
        setIsPaused(true); // Start FOCUS phase in paused state to allow "Start" action
    } else if (phase === 'FOCUS') {
        if (confirm("End the Iron Fence early? This is not recommended.")) {
            setPhase('REVIEW');
        }
    } else if (phase === 'REVIEW') {
        if (!reflection) return alert("Reflect to refine. Don't skip the mirror.");
        finishSession();
    }
  };

  const handleEmergencyToggle = () => {
      if (!showEmergencyModal) {
          setShowEmergencyModal(true); 
          // Note: showing modal effectively pauses the timer in the interval check
      } else {
          setShowEmergencyModal(false);
      }
  };

  const confirmEmergencyBreak = () => {
      setInterruptions(prev => prev + 1);
      setShowEmergencyModal(false);
      setIsPaused(true); // Manually pause after confirming break
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
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-gray-800 rounded-full mb-4">
          <Compass className={`w-8 h-8 ${PLAN_DETAILS[plan].color}`} />
        </div>
        <h2 className="text-3xl font-bold">Phase 1: Calibration</h2>
        <p className="text-gray-400 mt-2">"Where am I going? Why does this matter?"</p>
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
      
      <div className="flex justify-between items-center pt-4">
         <div className="text-sm font-mono text-gray-500">
           Time remaining: {formatTime(timeLeft)}
         </div>
         <button 
           onClick={advancePhase}
           className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
         >
           Enter Iron Fence <ArrowRight size={18} />
         </button>
      </div>
    </div>
  );

  const renderFocus = () => (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center relative">
      
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

      <div className="mb-8">
        <div className={`inline-flex items-center gap-2 ${PLAN_DETAILS[plan].color} mb-4 transition-all duration-300 ${isPaused ? 'opacity-50' : 'opacity-100'}`}>
           <Shield className={!isPaused ? "animate-pulse" : ""} />
           <span className="font-bold tracking-widest text-sm uppercase">
               {isPaused ? "Iron Fence Paused" : "Iron Fence Active"}
           </span>
        </div>
        
        <h1 className={`text-[6rem] md:text-[9rem] font-bold tabular-nums leading-none tracking-tighter select-none font-mono transition-opacity duration-300 ${isPaused ? 'opacity-50' : 'opacity-100'}`}>
          {formatTime(timeLeft)}
        </h1>
        
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="bg-black/40 px-6 py-2 rounded-xl backdrop-blur-sm border border-gold-500/30">
               <span className="text-gold-500 font-bold tracking-[0.2em] text-xl uppercase animate-pulse">
                 Paused
               </span>
             </div>
          </div>
        )}

        <div className="mt-8 space-y-2">
            <p className="text-2xl text-white font-medium max-w-2xl mx-auto leading-relaxed">
                "{goal}"
            </p>
            {externalLink && (
                <a 
                    href={externalLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 underline underline-offset-4 mt-2"
                >
                    <LinkIcon size={14} /> Open Work Environment
                </a>
            )}
            <p className="text-sm text-gray-500 max-w-md mx-auto italic mt-4">
               {isPaused ? "Session paused. Resume to build." : "Notifications Blocked. Single Tasking Only."}
            </p>
        </div>
      </div>

      <div className="flex gap-4 mt-8 items-center justify-center">
        {/* Play/Pause/Resume Controls */}
        {isPaused ? (
          <button 
            onClick={() => setIsPaused(false)}
            className="px-8 py-3 rounded-full bg-white text-black hover:bg-gray-200 transition-all font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105"
          >
            <Play size={20} fill="currentColor" />
            {timeLeft === DURATION_FOCUS ? 'Start' : 'Resume'}
          </button>
        ) : (
          <button 
            onClick={() => setIsPaused(true)}
            className="px-8 py-3 rounded-full bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 transition-all font-bold flex items-center gap-2"
          >
            <Pause size={20} fill="currentColor" />
            Pause
          </button>
        )}

        <div className="w-px h-8 bg-gray-800 mx-2"></div>

        <button 
          onClick={handleEmergencyToggle}
          className="px-6 py-3 rounded-full border border-gray-800 text-gray-500 hover:text-red-400 hover:border-red-900/50 transition-colors font-medium flex items-center gap-2 text-sm"
        >
          <AlertTriangle size={16} />
          Emergency Override
        </button>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-xs text-gray-600">Interruptions: {interruptions}</p>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-gray-800 rounded-full mb-4">
          <History className={`w-8 h-8 ${PLAN_DETAILS[plan].color}`} />
        </div>
        <h2 className="text-3xl font-bold">Phase 3: Debrief</h2>
        <p className="text-gray-400 mt-2">"Reflect, Refine, Repeat."</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
              {plan === PlanType.BUILDER ? "What tangible progress did you make?" : 
               plan === PlanType.VITALITY ? "How does your body/mind feel?" :
               "What did you learn or visualize?"}
          </label>
          <textarea 
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 focus:border-purple-500 focus:outline-none transition-colors"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Refine: What will you do differently tomorrow?</label>
          <textarea 
            value={refinement}
            onChange={(e) => setRefinement(e.target.value)}
            placeholder="Small tweak, big result..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 focus:border-purple-500 focus:outline-none transition-colors"
            rows={2}
          />
        </div>

        {interruptions > 0 && (
            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
                <p className="text-red-400 text-sm">
                    <AlertTriangle className="inline w-4 h-4 mr-2" />
                    You had {interruptions} interruption(s). Tomorrow, aim for zero. Guard the hour.
                </p>
            </div>
        )}
      </div>
      
      <div className="flex justify-between items-center pt-4">
        <div className="text-sm font-mono text-gray-500">
           Closing in: {formatTime(timeLeft)}
        </div>
        <button 
           onClick={advancePhase}
           className="bg-gold-500 text-black px-8 py-3 rounded-full font-bold hover:bg-gold-400 transition-colors flex items-center gap-2 shadow-lg shadow-gold-500/20"
         >
           Stack This Hour <CheckCircle size={18} />
         </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[85vh] flex flex-col">
       <div className="mb-6 flex justify-between items-center border-b border-gray-800 pb-4">
          <button onClick={onExit} className="text-sm text-gray-500 hover:text-white transition-colors">Quit Session</button>
          
          <div className="flex gap-4">
             <StepIndicator active={phase === 'CALIBRATION'} done={phase !== 'CALIBRATION'} label="1. Aim" color={PLAN_DETAILS[plan].bg.replace('bg-', '')} />
             <div className="w-8 h-px bg-gray-800 self-center"></div>
             <StepIndicator active={phase === 'FOCUS'} done={phase === 'REVIEW'} label="2. Act" color={PLAN_DETAILS[plan].bg.replace('bg-', '')} />
             <div className="w-8 h-px bg-gray-800 self-center"></div>
             <StepIndicator active={phase === 'REVIEW'} done={false} label="3. Reflect" color={PLAN_DETAILS[plan].bg.replace('bg-', '')} />
          </div>

          <div className={`text-sm font-bold ${PLAN_DETAILS[plan].color} uppercase tracking-widest hidden md:block`}>
              {PLAN_DETAILS[plan].title}
          </div>
       </div>

       <div className="flex-1 flex flex-col justify-center relative">
         {phase === 'CALIBRATION' && renderCalibration()}
         {phase === 'FOCUS' && renderFocus()}
         {phase === 'REVIEW' && renderReview()}
       </div>
    </div>
  );
}

const StepIndicator = ({ active, done, label, color }: { active: boolean, done: boolean, label: string, color: string }) => {
    // We map the tailwind color string to a hex for shadow if needed, but here simple bg classes work better
    // color comes in as 'blue-500' etc.
    const activeClass = active ? `bg-${color} scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]` : '';
    const doneClass = done ? 'bg-gray-400' : 'bg-gray-800';
    
    return (
        <div className={`flex flex-col items-center gap-2 ${active ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${active ? activeClass : doneClass}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </div>
    );
};
