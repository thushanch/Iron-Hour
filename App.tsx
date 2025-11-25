import React, { useState, useEffect } from 'react';
import { PlanType, UserProfile, SessionRecord } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import SessionRunner from './components/SessionRunner';
import { Layout } from './components/Layout';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<'ONBOARDING' | 'DASHBOARD' | 'SESSION'>('ONBOARDING');

  // Load user data from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('ironhour_user');
    if (savedData) {
      setUser(JSON.parse(savedData));
      setCurrentView('DASHBOARD');
    }
  }, []);

  const handlePlanSelection = (name: string, plan: PlanType) => {
    const newUser: UserProfile = {
      name,
      activePlan: plan,
      history: [],
      pledgeAmount: 0
    };
    setUser(newUser);
    localStorage.setItem('ironhour_user', JSON.stringify(newUser));
    setCurrentView('DASHBOARD');
  };

  const handleStartSession = () => {
    setCurrentView('SESSION');
  };

  const handleSessionComplete = (record: SessionRecord) => {
    if (!user) return;
    
    const updatedHistory = [record, ...user.history];
    const updatedUser = { ...user, history: updatedHistory };
    
    setUser(updatedUser);
    localStorage.setItem('ironhour_user', JSON.stringify(updatedUser));
    setCurrentView('DASHBOARD');
  };

  const handleExitSession = () => {
    setCurrentView('DASHBOARD');
  };

  const handleReset = () => {
    if(confirm("Are you sure? This will wipe your progress.")) {
        localStorage.removeItem('ironhour_user');
        setUser(null);
        setCurrentView('ONBOARDING');
    }
  };

  if (!user || currentView === 'ONBOARDING') {
    return <Onboarding onComplete={handlePlanSelection} />;
  }

  if (currentView === 'SESSION') {
    return (
      <SessionRunner 
        plan={user.activePlan!} 
        onComplete={handleSessionComplete} 
        onExit={handleExitSession}
      />
    );
  }

  return (
    <Layout onReset={handleReset}>
      <Dashboard 
        user={user} 
        onStartSession={handleStartSession} 
      />
    </Layout>
  );
}