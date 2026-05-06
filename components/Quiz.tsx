
import React, { useState } from 'react';
import { SkinType, FinishType, QuizState, SpongeRecommendation } from '../types';
import { APP_ASSETS, BRAND_ICONS } from '../constants';

const Quiz: React.FC = () => {
  const [step, setStep] = useState(0);
  const [quiz, setQuiz] = useState<QuizState>({
    skinType: null,
    finish: null,
    formula: null,
    concern: null,
  });
  const [result, setResult] = useState<SpongeRecommendation | null>(null);

  const steps = [
    {
      title: "What's your skin type?",
      key: 'skinType',
      options: Object.values(SkinType),
    },
    {
      title: "Desired finish?",
      key: 'finish',
      options: Object.values(FinishType),
    },
    {
      title: "Favorite formula?",
      key: 'formula',
      options: ['Liquid', 'Cream', 'Stick', 'Powder'],
    },
    {
      title: "Main concern?",
      key: 'concern',
      options: ['Coverage', 'Longevity', 'Blendability', 'Precision'],
    }
  ];

  const handleSelect = (val: any) => {
    const updated = { ...quiz, [steps[step].key]: val };
    setQuiz(updated);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      generateResult(updated);
    }
  };

  const generateResult = (data: QuizState) => {
    let rec: SpongeRecommendation = {
      productName: 'Beautyblender Original',
      shape: 'Classic Teardrop',
      material: 'Exclusive Aqua-Activated Foam',
      reason: 'The classic pink sponge is best for all skin types and general makeup application.',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80'
    };

    if (data.skinType === SkinType.SENSITIVE) {
      rec = {
        productName: 'Beautyblender Pure',
        shape: 'Classic Teardrop (White)',
        material: 'Dye-Free Pure Foam',
        reason: 'Best for: sensitive skin / skincare application. This dye-free sponge ensures no irritation.',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80'
      };
    } else if (data.concern === 'Precision') {
      rec = {
        productName: 'Beautyblender Micro Mini',
        shape: 'Tiny Teardrop',
        material: 'Precision Focused Foam',
        reason: 'Best for: precision (under eyes, corners). Perfect for those hard-to-reach areas.',
        imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80'
      };
    } else if (data.finish === FinishType.MATTE || data.concern === 'Coverage') {
      rec = {
        productName: 'Beautyblender Pro',
        shape: 'Classic Teardrop (Pro Black)',
        material: 'High-Density Professional Foam',
        reason: 'Best for: full coverage / darker products / pro use. Great for a flawless heavy-duty finish.',
        imageUrl: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80'
      };
    } else if (data.finish === FinishType.NATURAL) {
      rec = {
        productName: 'Beautyblender Nude',
        shape: 'Classic Teardrop (Nude)',
        material: 'Skin-Tone Adaptive Foam',
        reason: 'Best for: natural, no-makeup look. Blends seamlessly with your skin tone.',
        imageUrl: 'https://images.unsplash.com/photo-1590439472477-009f456bb0fa?auto=format&fit=crop&q=80'
      };
    } else if (data.concern === 'Longevity') {
      rec = {
        productName: 'Beautyblender Sapphire',
        shape: 'Classic Teardrop (Blue)',
        material: 'Long-Wear Optimized Foam',
        reason: 'Best for: long-wear / more controlled application. Keeps your makeup in place all day.',
        imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80'
      };
    } else if (data.formula === 'Powder') {
      rec = {
        productName: 'Beautyblender Power Pocket Puff',
        shape: 'Double-Sided Teardrop Puff',
        material: 'Velour and Soft Plush',
        reason: 'For: setting powder / matte finish. The dual-sided tool helps you set and bake like a pro.',
        imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80'
      };
    }

    setResult(rec);
  };

  if (result) {
    return (
      <div className="bg-white rounded-[30px] md:rounded-[50px] p-6 md:p-12 shadow-xl animate-in zoom-in duration-500 text-center max-w-2xl mx-auto border border-pink-50 w-full overflow-hidden">
        <div className="inline-block p-3 md:p-4 bg-pink-100 text-pink-600 rounded-xl md:rounded-[20px] mb-6 md:mb-8 shadow-sm">
          {React.cloneElement(BRAND_ICONS.Star as any, { size: 24, className: "fill-current" })}
        </div>
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 tracking-tight">{result.productName}</h2>
        <p className="text-pink-500 font-bold uppercase tracking-widest text-[10px] mb-8">Professional Recommendation</p>
        
        <div className="relative w-56 h-56 md:w-72 md:h-72 mx-auto mb-8 md:mb-12 group shrink-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-200 to-rose-100 rounded-full blur-2xl opacity-30" />
          <img src={result.imageUrl} alt={result.productName} className="relative z-10 w-full h-full object-cover rounded-[30px] md:rounded-[40px] shadow-lg transform rotate-2 group-hover:rotate-0 transition-transform duration-700" />
        </div>

        <div className="space-y-4 md:space-y-6 text-left bg-pink-50/50 p-6 md:p-8 rounded-[25px] md:rounded-[35px] mb-8 md:mb-10 border border-pink-100/50">
          <div>
            <h4 className="font-bold text-pink-600 uppercase text-[8px] tracking-[0.15em] mb-0.5">Optimal Shape</h4>
            <p className="text-gray-900 font-semibold text-base md:text-lg truncate">{result.shape}</p>
          </div>
          <div>
            <h4 className="font-bold text-pink-600 uppercase text-[8px] tracking-[0.15em] mb-0.5">Ideal Material</h4>
            <p className="text-gray-900 font-semibold text-base md:text-lg truncate">{result.material}</p>
          </div>
          <p className="text-xs md:text-base text-gray-600 leading-relaxed font-light italic border-l-4 border-pink-400 pl-4 md:pl-6">
            "{result.reason}"
          </p>
        </div>

        <button 
          onClick={() => { setStep(0); setResult(null); }}
          className="flex items-center justify-center gap-2 w-full py-4 md:py-6 bg-pink-600 text-white rounded-xl md:rounded-[25px] font-bold shadow-lg hover:bg-pink-700 transition-all active:scale-95 text-sm md:text-base"
        >
          {React.cloneElement(BRAND_ICONS.Reset as any, { size: 18 })} Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-4 md:py-12 w-full px-2">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 shrink-0">Step {step + 1}</h2>
        <div className="flex-1 max-w-[150px] md:max-w-[200px] h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-50 ml-4">
          <div 
            className="h-full bg-pink-600 rounded-full transition-all duration-700" 
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-[30px] md:rounded-[40px] p-6 md:p-10 shadow-xl border border-pink-50">
        <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-6 md:mb-8 tracking-tight">{steps[step].title}</h3>
        <div className="space-y-3 md:space-y-4">
          {steps[step].options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className="group w-full flex justify-between items-center p-4 md:p-6 rounded-xl md:rounded-[25px] border-2 border-gray-50 hover:border-pink-300 hover:bg-pink-50 transition-all text-left"
            >
              <span className="font-semibold text-gray-700 group-hover:text-pink-600 text-sm md:text-base">{opt}</span>
              <div className="text-pink-200 group-hover:text-pink-400 shrink-0">
                {BRAND_ICONS.Next}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
