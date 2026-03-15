import { useState } from 'react';
import { Play } from 'lucide-react';
import packageJson from '../../package.json';

interface StartupScreenProps {
  onStart: () => void;
}

export function StartupScreen({ onStart }: StartupScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleStart = () => {
    setIsFadingOut(true);
    setTimeout(() => {
        setIsVisible(false);
        onStart();
    }, 500); // Wait for fade out animation
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-between items-center bg-slate-950 text-white p-6 transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
        {/* Top Space for vertical centering balance */}
        <div className="flex-1" />
        
        {/* Main Content */}
        <div className="flex flex-col items-center justify-center max-w-sm text-center w-full animate-fade-in-up">
            <div className="w-32 h-32 mb-8 shadow-[0_0_50px_rgba(34,197,94,0.3)] rounded-[2rem] overflow-hidden rotate-3 animate-float border-2 border-slate-800">
                <img src="/pwa-512x512.png" alt="FairPlay Coach Logo" className="w-full h-full object-cover" />
            </div>
            
            <h1 className="text-4xl font-black mb-4 tracking-tight bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
                FairPlay Coach
            </h1>
            
            <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-xs mx-auto">
                Manage your team's substitutions easily and ensure everyone gets fair playing time.
            </p>

            <button
                onClick={handleStart}
                className="w-full max-w-[200px] bg-green-500 hover:bg-green-400 text-black font-bold py-4 px-8 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2 transition-all active:scale-95 group"
            >
                Start App
                <Play className="w-5 h-5 fill-current group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

        {/* Bottom Credits */}
        <div className="flex-1 flex flex-col justify-end w-full pb-8 animate-fade-in delay-300">
            <div className="text-center space-y-1">
                <p className="text-sm font-medium text-slate-500">v{packageJson.version}</p>
                <div className="h-px w-12 bg-slate-800 mx-auto my-3" />
                <p className="text-xs font-semibold text-slate-600 tracking-widest uppercase">
                    Developed by Thor F
                </p>
            </div>
        </div>
    </div>
  );
}
