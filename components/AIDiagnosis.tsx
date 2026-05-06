
import React, { useState } from 'react';
import { analyzeMakeupResult } from '../services/geminiService';
import { DiagnosticReport } from '../types';
import { BRAND_ICONS } from '../constants';

const AIDiagnosis: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const result = await analyzeMakeupResult(base64);
      setReport(result);
    } catch (err) {
      alert("Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 px-2">
      <div className="bg-white rounded-[30px] p-6 md:p-8 shadow-xl text-center border border-pink-50">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">Today's Look AI</h2>
        <p className="text-gray-500 text-xs md:text-base mb-6 md:mb-8">Upload a selfie for pro blend feedback.</p>

        {!image ? (
          <label className="flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-pink-200 rounded-[20px] md:rounded-3xl cursor-pointer hover:bg-pink-50 transition-colors">
            <span className="text-pink-400 mb-3">{React.cloneElement(BRAND_ICONS.Upload as any, { size: 40 })}</span>
            <span className="text-gray-600 text-xs md:text-sm font-medium">Click to upload photo</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
          </label>
        ) : (
          <div className="space-y-4 md:space-y-6">
            <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-2xl shadow-md border-2 border-pink-50">
              <img src={image} alt="Selfie" className="w-full h-full object-cover" />
            </div>
            {!report && (
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-4 bg-pink-600 text-white rounded-xl font-bold shadow-lg hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {loading ? React.cloneElement(BRAND_ICONS.Loading as any, { className: "animate-spin" }) : "Analyze My Look"}
              </button>
            )}
            <button 
              onClick={() => { setImage(null); setReport(null); }}
              className="text-pink-600 text-xs md:text-sm font-semibold hover:underline"
            >
              Upload Different Photo
            </button>
          </div>
        )}
      </div>

      {report && (
        <div className="bg-white rounded-[30px] p-6 md:p-8 shadow-xl animate-in slide-in-from-bottom-4 duration-500 border border-pink-50">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="min-w-0">
              <h3 className="text-xl md:text-2xl font-bold truncate">Diagnostic Report</h3>
              <p className="text-gray-500 text-[10px] md:text-xs">Based on AI analysis</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-3xl md:text-5xl font-bold text-pink-600">{report.overallScore}</span>
              <span className="text-pink-300 font-bold text-xs md:text-lg">/100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
            {Object.entries(report.dimensions).map(([key, val]) => (
              <div key={key} className="p-3 md:p-4 bg-pink-50/50 rounded-xl md:rounded-2xl border border-pink-100">
                <div className="flex justify-between items-center mb-1.5 md:mb-2">
                  <span className="text-[8px] md:text-[10px] uppercase font-bold text-pink-600 tracking-wider truncate mr-1">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="shrink-0">
                    {(val as number) >= 80 ? React.cloneElement(BRAND_ICONS.Check as any, { size: 14, className: "text-green-500" }) : React.cloneElement(BRAND_ICONS.Alert as any, { size: 14, className: "text-amber-500" })}
                  </span>
                </div>
                <div className="w-full h-1 md:h-1.5 bg-pink-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-pink-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 md:p-6 rounded-2xl border-l-4 border-pink-500 shadow-sm">
            <h4 className="font-bold text-gray-800 text-sm md:text-base mb-1 md:mb-2">Expert Advice</h4>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-light">{report.advice}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDiagnosis;
