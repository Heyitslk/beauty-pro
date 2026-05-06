
import React, { useState, useRef, useEffect } from 'react';
import { CONSULTANTS, BRAND_ICONS, APP_ASSETS } from '../constants';
import { startConsultantChat, ai } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

interface Consultant {
  id: string;
  name: string;
  role: string;
  iconUrl: string | { x: number };
  instruction: string;
}

const AIConsultant: React.FC = () => {
  const [customIcons, setCustomIcons] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('custom_consultant_icons');
    return saved ? JSON.parse(saved) : {};
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingFor) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (uploadingFor === 'user_avatar') {
          setUserAvatar(base64);
          localStorage.setItem('user_custom_avatar', base64);
          window.dispatchEvent(new Event('storage'));
        } else {
          const newIcons = { ...customIcons, [uploadingFor]: base64 };
          setCustomIcons(newIcons);
          localStorage.setItem('custom_consultant_icons', JSON.stringify(newIcons));
        }
        setUploadingFor(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = (e: React.MouseEvent, charId: string) => {
    e.stopPropagation();
    setUploadingFor(charId);
    fileInputRef.current?.click();
  };
  const [userAvatar, setUserAvatar] = useState<string>(() => {
    const saved = localStorage.getItem('user_custom_avatar');
    return saved || APP_ASSETS.userAvatarUrl;
  });
  const [selectedChar, setSelectedChar] = useState<Consultant | null>(null);
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleChatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPendingImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCharSelect = (char: Consultant) => {
    const charWithIcon = { ...char, iconUrl: customIcons[char.id] || char.iconUrl };
    setSelectedChar(charWithIcon);
    const newChat = startConsultantChat(char.instruction);
    setChat(newChat);
    
    let greeting = `Hi! I'm ${char.name}. How can I assist you with your professional beauty goals today?`;
    if (char.id === 'spongey') greeting = `Hiya! I'm ${char.name}! Wanna play and talk about makeup? It's gonna be so much fun! ✨`;
    if (char.id === 'valerie') greeting = `Hello... I'm ${char.name}. I hope you're having a better day than I am... 🌸`;
    if (char.id === 'drskin') greeting = `What do you want? I'm ${char.name}, and I'm very busy. Make it quick. 🙄`;
    
    setMessages([{ 
      role: 'model', 
      text: greeting 
    }]);
  };

  const handleSend = async () => {
    if ((!input.trim() && !pendingImage) || isTyping) return;

    const userMessage = input.trim();
    const currentImage = pendingImage;
    
    setInput('');
    setPendingImage(null);
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: userMessage,
      image: currentImage || undefined
    }]);
    setIsTyping(true);

    try {
      // Prepare history for multi-modal support
      const history = messages.map(m => {
        const parts: any[] = [{ text: m.text }];
        if (m.image) {
          parts.unshift({
            inlineData: {
              mimeType: 'image/jpeg',
              data: m.image.split(',')[1]
            }
          });
        }
        return { role: m.role, parts };
      });

      const currentParts: any[] = [];
      if (currentImage) {
        currentParts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: currentImage.split(',')[1]
          }
        });
      }
      currentParts.push({ text: userMessage || "Analyze this image." });

      const response = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history,
          { role: 'user', parts: currentParts }
        ],
        config: {
          systemInstruction: selectedChar.instruction
        }
      });

      let fullText = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of response) {
        const c = chunk as GenerateContentResponse;
        fullText += c.text;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'model', text: fullText };
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I lost my connection for a moment. Could you try again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!selectedChar) {
    return (
      <div className="max-w-6xl mx-auto py-8 md:py-16 px-4 md:px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10 md:mb-20 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 text-gray-900 tracking-tighter">Artistry Concierge</h2>
          <p className="text-gray-500 text-base md:text-xl font-light mb-8">Select an expert to guide your professional beauty technique.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-8">
          {CONSULTANTS.map((char) => (
            <div
              key={char.id}
              className="flex flex-col items-center group relative"
            >
              <div className="relative w-24 h-24 md:w-36 md:h-36 mb-4 md:mb-6 shrink-0 transition-all duration-700">
                <div className="absolute inset-0 bg-pink-500 rounded-full blur-2xl opacity-0 group-hover:opacity-10 opacity-5 transition-opacity" />
                <button
                  onClick={() => handleCharSelect(char)}
                  className="w-full h-full rounded-full border-2 md:border-4 border-white shadow-xl overflow-hidden hover:border-pink-200 transition-all duration-700 bg-white relative z-10 hover:scale-105 active:scale-95"
                >
                  <div className="w-full h-full relative overflow-hidden bg-white">
                    <img 
                      src={customIcons[char.id] || (typeof char.iconUrl === 'string' ? char.iconUrl : APP_ASSETS.expertSprite)} 
                      alt={char.name} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + char.name;
                      }}
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: typeof char.iconUrl === 'string' ? 'center' : `${(char.iconUrl as any).x}% center`
                      }}
                       referrerPolicy="no-referrer"
                       className="absolute left-0 top-0"
                    />
                  </div>
                </button>
              </div>
              <h4 className="font-bold text-gray-900 text-sm md:text-lg group-hover:text-pink-600 transition-colors leading-none mb-1 md:mb-2 text-center">{char.name}</h4>
              <p className="text-[8px] md:text-[10px] uppercase font-bold text-gray-400 tracking-widest text-center">{char.role}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-12 border-t border-pink-50 flex flex-col items-center max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Your Personal Profile</h3>
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden bg-pink-50">
                <img src={userAvatar} alt="Your Profile" className="w-full h-full object-cover" />
              </div>
            </div>
            <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Your Profile Avatar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[30px] md:rounded-[50px] shadow-2xl overflow-hidden border border-pink-50 transition-all duration-500 animate-in zoom-in-95">
      {/* Header */}
      <div className="p-4 md:p-8 bg-pink-50/50 border-b border-pink-100 flex items-center gap-4 md:gap-6 backdrop-blur-xl">
        <button 
          onClick={() => setSelectedChar(null)}
          className="p-2 md:p-3 hover:bg-white rounded-xl md:rounded-2xl transition-all text-pink-600 shadow-sm shrink-0"
        >
          {React.cloneElement(BRAND_ICONS.Back as any, { size: 20 })}
        </button>
        <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[24px] overflow-hidden border-2 md:border-4 border-white shadow-md shrink-0 bg-white relative">
          <img 
            src={customIcons[selectedChar.id] || (typeof selectedChar.iconUrl === 'string' ? selectedChar.iconUrl : APP_ASSETS.expertSprite)} 
            alt={selectedChar.name} 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + selectedChar.name;
            }}
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: typeof selectedChar.iconUrl === 'string' ? 'center' : `${(selectedChar.iconUrl as any).x}% center`
            }}
            referrerPolicy="no-referrer"
            className="absolute left-0 top-0"
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-lg md:text-2xl text-gray-900 leading-none mb-0.5 md:mb-1 tracking-tight truncate">{selectedChar.name}</h3>
          <p className="text-[10px] md:text-sm text-pink-500 font-bold uppercase tracking-widest truncate">{selectedChar.role}</p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-pink-100 shrink-0">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
           <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Connected</span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-10 space-y-4 md:space-y-8 bg-gray-50/30 custom-scrollbar"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] md:max-w-[75%] flex items-end gap-3 md:gap-5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-2xl overflow-hidden shrink-0 border border-white shadow-sm bg-white">
                {m.role === 'user' ? (
                  <img src={userAvatar} alt="You" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full relative overflow-hidden">
                    <img 
                      src={customIcons[selectedChar.id] || (typeof selectedChar.iconUrl === 'string' ? selectedChar.iconUrl : APP_ASSETS.expertSprite)} 
                      alt={selectedChar.name} 
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: typeof selectedChar.iconUrl === 'string' ? 'center' : `${(selectedChar.iconUrl as any).x}% center`
                      }}
                      referrerPolicy="no-referrer"
                      className="absolute left-0 top-0"
                    />
                  </div>
                )}
              </div>
              <div className={`p-4 md:p-6 rounded-2xl md:rounded-[30px] text-sm md:text-base leading-relaxed shadow-md border ${
                m.role === 'user' 
                ? 'bg-gray-900 text-white rounded-br-none border-gray-800' 
                : 'bg-white text-gray-700 rounded-bl-none border-pink-50'
              }`}>
                {m.image && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-white/20 shadow-sm">
                    <img src={m.image} alt="Uploaded" className="max-w-full h-auto max-h-64 object-contain" />
                  </div>
                )}
                {m.text || (i === messages.length - 1 && isTyping && React.cloneElement(BRAND_ICONS.Loading as any, { size: 16, className: "animate-spin text-pink-400" }))}
              </div>
            </div>
          </div>
        ))}
        {isTyping && messages[messages.length-1]?.role === 'user' && (
          <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-end gap-3 md:gap-5">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-2xl overflow-hidden shrink-0 border border-white shadow-sm bg-white relative">
                <img 
                  src={typeof selectedChar.iconUrl === 'string' ? selectedChar.iconUrl : APP_ASSETS.expertSprite} 
                  alt={selectedChar.name} 
                  className="w-full h-full object-cover" 
                  style={{
                    objectPosition: typeof selectedChar.iconUrl === 'string' ? 'center' : `${(selectedChar.iconUrl as any).x}% center`
                  }}
                />
              </div>
              <div className="p-4 md:p-6 bg-white border border-pink-50 rounded-2xl md:rounded-[30px] rounded-bl-none shadow-md flex items-center justify-center min-w-[60px]">
                {React.cloneElement(BRAND_ICONS.Loading as any, { size: 20, className: "animate-spin text-pink-300" })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 md:p-8 bg-white border-t border-pink-50/50">
        <input 
          type="file" 
          ref={chatFileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleChatImageUpload} 
        />
        
        {pendingImage && (
          <div className="max-w-4xl mx-auto mb-4 relative inline-block">
            <img src={pendingImage} alt="Pending" className="h-20 w-20 object-cover rounded-xl border-2 border-pink-200 shadow-md" />
            <button 
              onClick={() => setPendingImage(null)}
              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg hover:bg-rose-600 transition-colors"
            >
              {React.cloneElement(BRAND_ICONS.Trash as any, { size: 12 })}
            </button>
          </div>
        )}

        <div className="relative flex items-center max-w-4xl mx-auto w-full gap-2 md:gap-4">
          <button 
            onClick={() => chatFileInputRef.current?.click()}
            className="p-4 md:p-6 bg-pink-50 text-pink-600 rounded-2xl md:rounded-[30px] hover:bg-pink-100 transition-all shadow-sm active:scale-95 flex items-center justify-center shrink-0"
            title="Upload picture for analysis"
          >
            {React.cloneElement(BRAND_ICONS.Analyze as any, { size: 20 })}
          </button>
          
          <div className="relative flex-1">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask ${selectedChar.name}...`}
              className="w-full p-4 md:p-6 pr-14 md:pr-20 bg-gray-50 border-none rounded-2xl md:rounded-[30px] focus:ring-4 focus:ring-pink-100 outline-none text-sm md:text-lg transition-all placeholder:text-gray-400 shadow-inner"
            />
            <button 
              onClick={handleSend}
              disabled={(!input.trim() && !pendingImage) || isTyping}
              className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-pink-600 text-white rounded-xl md:rounded-[24px] hover:bg-pink-700 disabled:opacity-30 transition-all shadow-lg active:scale-95 flex items-center justify-center shrink-0"
            >
              {React.cloneElement(BRAND_ICONS.Send as any, { size: 20 })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConsultant;
