import React from 'react';
import { SessionRecord, PlanType } from '../types';

interface BrickWallProps {
  history: SessionRecord[];
  planType?: PlanType;
}

export default function BrickWall({ history, planType }: BrickWallProps) {
  // Generate a grid of empty slots + filled slots
  const totalSlots = 365; // A year view
  const filledCount = history.length;
  
  // Create an array representing the grid
  const grid = Array.from({ length: totalSlots }, (_, i) => {
    return i < filledCount ? history[i] : null;
  });

  const getBrickColor = (record: SessionRecord | null) => {
    if (!record) return 'bg-gray-800/30 border-transparent';
    
    // Slightly vary the color for organic texture
    const opacity = 0.7 + (Math.random() * 0.3);
    
    switch (record.plan) {
      case PlanType.FOUNDATION:
        return `bg-blue-500 border-blue-400/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]`;
      case PlanType.BUILDER:
        return `bg-emerald-500 border-emerald-400/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]`;
      case PlanType.VITALITY:
        return `bg-rose-500 border-rose-400/30 shadow-[0_0_10px_rgba(244,63,94,0.3)]`;
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 overflow-hidden">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(12px,1fr))] gap-1 md:gap-1.5 auto-rows-[20px]">
        {grid.map((record, index) => (
          <div
            key={index}
            className={`w-full h-3 md:h-5 rounded-sm border ${getBrickColor(record)} transition-all hover:scale-125 duration-300`}
            title={record ? `Completed: ${record.date}` : undefined}
          ></div>
        ))}
      </div>
      {history.length === 0 && (
        <div className="text-center py-10 text-gray-600 italic">
          No bricks yet. Start building your legacy today.
        </div>
      )}
    </div>
  );
}