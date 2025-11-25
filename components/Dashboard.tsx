import React, { useState } from 'react';
import { UserProfile, PLAN_DETAILS } from '../types';
import { Play, TrendingUp, Share2, Lock, BrickWall as WallIcon } from 'lucide-react';
import BrickWall from './BrickWall';
import SocialContractModal from './SocialContractModal';

interface DashboardProps {
  user: UserProfile;
  onStartSession: () => void;
}

export default function Dashboard({ user, onStartSession }: DashboardProps) {
  const [showSocialModal, setShowSocialModal] = useState(false);
  const planDetails = user.activePlan ? PLAN_DETAILS[user.activePlan] : PLAN_DETAILS.BUILDER;
  
  const totalHours = user.history.length;
  
  // Calculate streaks (simplified)
  const currentStreak = calculateStreak(user.history);

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 p-8 md:p-12">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 border border-gray-600 text-xs font-medium text-gray-300 mb-4">
              <span className={`w-2 h-2 rounded-full ${planDetails.bg}`}></span>
              Current Track: {planDetails.title}
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-2">
              Ready to build, {user.name}?
            </h1>
            <p className="text-gray-400 max-w-lg">
              "You don't need a new year. You need a new hour. Guard it like treasure."
            </p>
          </div>
          
          <button 
            onClick={onStartSession}
            className="group flex items-center gap-3 bg-white text-black px-8 py-5 rounded-2xl font-bold text-lg hover:bg-gold-400 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
              <Play size={14} fill="white" />
            </div>
            Start Power Hour
          </button>
        </div>
        
        {/* Background decorative texture */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl"></div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Total Hours Stacked" 
          value={totalHours.toString()} 
          icon={<WallIcon className="text-gray-400" />} 
        />
        <StatCard 
          label="Current Streak" 
          value={`${currentStreak} Days`} 
          icon={<TrendingUp className="text-green-400" />} 
        />
        <button 
          onClick={() => setShowSocialModal(true)}
          className="col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition-colors text-left flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-500 text-sm font-medium">Social Contract</span>
            <Share2 className="text-blue-400 group-hover:scale-110 transition-transform" size={20} />
          </div>
          <span className="text-sm text-gray-300">Generate "Do Not Disturb" Status</span>
        </button>
        
        {/* Monetization / Commitment Mock */}
        <div className="col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 border border-gold-900/30 rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:border-gold-500/50 transition-colors">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20">
                <Lock size={64} />
            </div>
            <div className="flex justify-between items-start mb-2">
            <span className="text-gold-500 text-sm font-medium">Commitment Contract</span>
          </div>
          <div className="text-sm text-gray-300 mt-2">
             Pledge $50 on your next streak. <br/>
             <span className="text-xs text-gray-500">(Feature locked)</span>
          </div>
        </div>
      </div>

      {/* Visualization: The Wall */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Structure</h2>
          <span className="text-sm text-gray-500">Each brick is 1 hour of focus</span>
        </div>
        <BrickWall history={user.history} planType={user.activePlan || undefined} />
      </section>

      {showSocialModal && <SocialContractModal onClose={() => setShowSocialModal(false)} />}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <span className="text-gray-500 text-sm font-medium">{label}</span>
        {icon}
      </div>
      <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
    </div>
  );
}

// Helper to calc consecutive days
function calculateStreak(history: any[]) {
    if (history.length === 0) return 0;
    // Simplified logic for demo purposes
    // In a real app, you'd sort by date and check difference < 24h
    let streak = 0;
    const sorted = [...history].sort((a,b) => b.completedAt - a.completedAt);
    const today = new Date().setHours(0,0,0,0);
    
    // Check if last entry was today or yesterday
    const lastDate = new Date(sorted[0].completedAt).setHours(0,0,0,0);
    if ((today - lastDate) > 86400000) return 0; // Streak broken

    streak = 1;
    for(let i = 0; i < sorted.length - 1; i++) {
        const curr = new Date(sorted[i].completedAt).setHours(0,0,0,0);
        const next = new Date(sorted[i+1].completedAt).setHours(0,0,0,0);
        if (curr - next === 86400000) {
            streak++;
        } else if (curr - next === 0) {
            continue; // same day multiple entries
        } else {
            break;
        }
    }
    return streak;
}