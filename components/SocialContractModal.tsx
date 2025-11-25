import React from 'react';
import { X, Copy, Download } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function SocialContractModal({ onClose }: Props) {
  const statusMessage = "I am currently in my Power Hour (60 mins of deep work). I will not be checking messages or calls until the hour is complete. Thank you for respecting my growth.";

  const handleCopy = () => {
    navigator.clipboard.writeText(statusMessage);
    alert("Copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-bold mb-2">The Social Contract</h2>
        <p className="text-gray-400 text-sm mb-6">
          "Tell your family... this is my time." Communicate boundaries clearly.
        </p>

        <div className="bg-black/50 p-4 rounded-lg border border-gray-800 mb-6">
          <p className="text-gray-300 font-mono text-sm leading-relaxed">
            "{statusMessage}"
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Copy size={18} /> Copy Text
          </button>
          <button 
            disabled
            className="flex items-center justify-center gap-2 bg-gray-800 text-gray-500 font-bold py-3 rounded-xl cursor-not-allowed border border-gray-700"
          >
            <Download size={18} /> Save Image
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-4">Image generation coming soon.</p>
      </div>
    </div>
  );
}