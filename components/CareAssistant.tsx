
import React, { useState } from 'react';
import { APP_ASSETS, BRAND_ICONS } from '../constants';

const CareAssistant: React.FC = () => {
  const [uses, setUses] = useState(3);

  const logUse = () => setUses((prev) => (prev >= 10 ? 0 : prev + 1));

  const washStatus = uses >= 7 ? 'DIRTY' : uses >= 4 ? 'FAIR' : 'CLEAN';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto px-1">
      <div className="text-center mb-10 md:mb-12">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tighter">Hygiene Tracker</h2>
        <p className="text-gray-500 text-sm md:text-lg font-light mt-2">Monitor tool sterility for clear, healthy skin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        <div className="space-y-6 md:space-y-10">
          <div className="bg-white rounded-[35px] md:rounded-[45px] p-6 md:p-10 shadow-xl border border-pink-50 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 md:p-10 opacity-5">
                {BRAND_ICONS.Care}
             </div>
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3">
              {BRAND_ICONS.Sparkles} Daily Usage Log
            </h2>
            <div className="flex items-end justify-between mb-8 md:mb-10">
              <div className="min-w-0">
                <p className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tighter">{uses}</p>
                <p className="text-gray-400 text-[10px] md:text-sm font-medium">Bounces since deep clean</p>
              </div>
              <div className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[8px] md:text-[10px] font-bold tracking-widest uppercase border-2 shrink-0 ${
                washStatus === 'CLEAN' ? 'border-green-100 bg-green-50 text-green-600' :
                washStatus === 'FAIR' ? 'border-amber-100 bg-amber-50 text-amber-600' : 'border-rose-100 bg-rose-50 text-rose-600'
              }`}>
                {washStatus}
              </div>
            </div>
            
            <div className="flex gap-1.5 md:gap-3 mb-8 md:mb-10 h-2 md:h-3">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-all duration-500 ${i < uses ? 'bg-pink-500 shadow-md' : 'bg-gray-100'}`} 
                />
              ))}
            </div>

            <button 
              onClick={logUse}
              className="w-full py-4 md:py-6 bg-gray-900 text-white rounded-2xl md:rounded-[30px] font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-95 text-sm md:text-lg"
            >
              Log Blending Session
            </button>
            
            {uses >= 7 && (
              <div className="mt-6 md:mt-10 bg-rose-50 border border-rose-100 p-5 md:p-8 rounded-[25px] md:rounded-[35px] flex items-start gap-4 animate-in zoom-in duration-300">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                  {BRAND_ICONS.Care}
                </div>
                <div className="min-w-0">
                  <p className="text-sm md:text-base text-rose-800 font-bold mb-0.5">Sanitize Immediately</p>
                  <p className="text-[10px] md:text-xs text-rose-600 leading-relaxed">High bacterial risk detected. Deep clean required before next application to prevent breakouts. 🫧</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-indigo-900 rounded-[35px] md:rounded-[45px] p-8 md:p-12 text-white shadow-xl relative overflow-hidden group">
            <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-pink-400">{BRAND_ICONS.Air}</span> Pro Drying Ritual
            </h3>
            <p className="text-gray-300 mb-8 leading-relaxed font-light text-sm md:text-lg">Hydrophilic materials act like sponges for mold if stored wet. Always allow 8+ hours of open airflow between logs.</p>
            <div className="flex gap-4">
              <div className="flex-1 p-4 bg-white/10 rounded-2xl border border-white/10 text-center">
                <p className="text-xl md:text-2xl font-bold">8h</p>
                <p className="text-[8px] md:text-[10px] uppercase font-bold text-indigo-300">Minimum Air</p>
              </div>
              <div className="flex-1 p-4 bg-white/10 rounded-2xl border border-white/10 text-center">
                <p className="text-xl md:text-2xl font-bold">UV</p>
                <p className="text-[8px] md:text-[10px] uppercase font-bold text-indigo-300">Safety Tier</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[35px] md:rounded-[45px] p-6 md:p-12 shadow-xl border border-pink-50">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 tracking-tight">The Lab Cleanse</h2>
          <div className="space-y-8 md:space-y-12">
            {[
              { step: 1, title: 'Pulse-Soak', text: 'Submerge fully. Pulse the core under lukewarm water until heavy.' },
              { step: 2, title: 'Sterilize', text: 'Apply clinical soap. Massage into areas with visible foundation deep-traps.' },
              { step: 3, title: 'Clarify', text: 'Rinse until the internal core water is 100% transparent and soap-free.' },
              { step: 4, title: 'Aerate', text: 'Press firmly in a sterile towel. Dry on a mesh stand—never on solid wood.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-5 md:gap-6 group">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-lg md:text-xl shrink-0 border border-pink-100 group-hover:bg-pink-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  {s.step}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-900 text-lg md:text-xl mb-1 md:mb-2">{s.title}</h4>
                  <p className="text-xs md:text-base text-gray-500 leading-relaxed font-light">{s.text}</p>
                </div>
              </div>
            ))}
            <div className="pt-6 md:pt-10 border-t border-gray-50 group">
              <div className="relative rounded-[25px] md:rounded-[35px] overflow-hidden shadow-lg h-48 md:h-64">
                <img src={APP_ASSETS.cleaningGuide} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Guide" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-white text-[10px] md:text-xs font-bold uppercase tracking-widest">Ritual Video Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareAssistant;
