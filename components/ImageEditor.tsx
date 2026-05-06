
import React, { useState } from 'react';
import { editMakeupImage } from '../services/geminiService';
import { Wand2, Loader2, Download, Trash2, Camera } from 'lucide-react';

const ImageEditor: React.FC = () => {
  const [source, setSource] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSource(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!source || !prompt) return;
    setLoading(true);
    try {
      const base64 = source.split(',')[1];
      const edited = await editMakeupImage(base64, prompt);
      setResult(edited);
    } catch (err) {
      alert("Failed to edit image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Wand2 className="text-pink-500" /> AI Creative Lab
        </h2>
        <p className="text-gray-500 mb-8">Use text commands to edit your makeup photos instantly.</p>

        {!source ? (
          <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 transition-all">
            <Camera className="w-12 h-12 text-gray-300 mb-4" />
            <span className="text-gray-600">Drop a photo here or click to browse</span>
            <input type="file" className="hidden" onChange={handleFile} />
          </label>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-gray-400">Original</span>
              <img src={source} className="w-full h-64 object-cover rounded-2xl" alt="Original" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-gray-400">Result</span>
              {result ? (
                <img src={result} className="w-full h-64 object-cover rounded-2xl border-2 border-pink-500" alt="Edited" />
              ) : (
                <div className="w-full h-64 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 italic">
                  Waiting for magic...
                </div>
              )}
            </div>
          </div>
        )}

        {source && (
          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Try "Add a soft glow", "Change background to a spa setting", or "Apply a pink lip tint"'
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-pink-400 outline-none h-24 resize-none"
            />
            <div className="flex gap-4">
              <button
                onClick={handleEdit}
                disabled={loading || !prompt}
                className="flex-1 py-4 bg-pink-600 text-white rounded-2xl font-bold shadow-lg hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Wand2 size={20} /> Generate Magic</>}
              </button>
              <button 
                onClick={() => { setSource(null); setResult(null); setPrompt(''); }}
                className="p-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200"
              >
                <Trash2 size={24} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Add retro vibes', 'Make it brighter', 'Fix blemishes', 'Smooth skin'].map((p) => (
          <button
            key={p}
            onClick={() => setPrompt(p)}
            className="p-3 bg-pink-50 text-pink-600 text-xs font-bold rounded-xl border border-pink-100 hover:bg-pink-100 transition-colors"
          >
            "{p}"
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageEditor;
