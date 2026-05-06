
import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-pink-50 text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-bold text-pink-600">Something went wrong.</h1>
            <p className="text-gray-600">The application encountered an error. Please try refreshing the page.</p>
            <pre className="text-[10px] bg-white p-4 rounded-xl overflow-auto text-left border border-pink-100">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-pink-600 text-white rounded-full font-bold"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import { NAV_ITEMS, TUTORIALS, SPONGE_TIPS, APP_ASSETS, BRAND_ICONS } from './constants';
import Quiz from './components/Quiz';
import AIDiagnosis from './components/AIDiagnosis';
import CareAssistant from './components/CareAssistant';
import ImageEditor from './components/ImageEditor';
import RhythmTimer from './components/RhythmTimer';
import AIConsultant from './components/AIConsultant';
import HeartRateZen from './components/HeartRateZen';
import ARViewer from './components/ARViewer';
import CollectiveView from './components/CollectiveView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem('user_custom_avatar') || APP_ASSETS.defaultUser);

  useEffect(() => {
    const handleStorageChange = () => {
      setUserAvatar(localStorage.getItem('user_custom_avatar') || APP_ASSETS.defaultUser);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView onNavigate={setActiveTab} />;
      case 'experts':
        return <ExpertsSector />;
      case 'lab':
        return <LabSector />;
      case 'sanctuary':
        return <SanctuarySector />;
      case 'social':
        return <CollectiveView />;
      case 'studio':
        return <ARViewer onNavigate={setActiveTab} />;
      default:
        return <HomeView onNavigate={setActiveTab} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen pb-24 lg:pb-0 lg:pl-64 transition-all duration-500 overflow-x-hidden bg-white">
        {/* Sidebar Desktop */}
        <nav className="fixed left-0 top-0 bottom-0 w-64 bg-white/80 backdrop-blur-md border-r border-pink-100 hidden lg:flex flex-col p-8 z-50">
          <div className="brand text-3xl font-bold text-gray-900 mb-12 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3 overflow-hidden shrink-0">
              {BRAND_ICONS.Zap}
            </div>
            <span className="tracking-tighter">Beauty Pro</span>
          </div>
          <div className="space-y-1 flex-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  activeTab === item.id 
                  ? 'bg-pink-600 text-white shadow-xl shadow-pink-200 translate-x-1' 
                  : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                <span className={activeTab === item.id ? 'text-white' : 'text-pink-300'}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-screen w-full">
          <div className="mb-6 lg:hidden flex items-center justify-between">
            <div className="brand text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">B</div>
              Beauty Pro
            </div>
            <div className="w-10 h-10 rounded-full bg-white border-2 border-pink-50 shadow-sm overflow-hidden shrink-0">
              <img 
                src={userAvatar} 
                alt="User" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
          {renderContent()}
        </main>

        {/* Mobile Nav - Fixed 5 items */}
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-xl border-t border-pink-50 flex lg:hidden items-center justify-around px-2 pb-safe z-50">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 flex-1 py-2 ${
                activeTab === item.id ? 'text-pink-600 scale-105' : 'text-gray-400'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${activeTab === item.id ? 'bg-pink-100' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest leading-none text-center">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </ErrorBoundary>
  );
};

const HomeView: React.FC<{ onNavigate: (t: string) => void }> = ({ onNavigate }) => (
  <div className="space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <header className="relative h-[450px] md:h-[600px] rounded-[30px] md:rounded-[50px] overflow-hidden bg-gray-900 text-white flex flex-col justify-center p-6 md:p-16 shadow-xl md:shadow-3xl">
      <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-gray-900/40 to-pink-500/30 z-0" />
      <div 
        className="absolute right-0 top-0 bottom-0 w-full md:w-3/4 bg-cover bg-center opacity-40 md:opacity-70 mix-blend-luminosity z-0" 
        style={{ backgroundImage: `url(${APP_ASSETS.heroImage})` }}
      />
      
      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-500/20 backdrop-blur-md rounded-full text-pink-300 text-[8px] md:text-xs font-bold tracking-[0.2em] uppercase mb-8 border border-pink-500/30 shadow-xl">
          <span className="animate-pulse">{BRAND_ICONS.Sparkles}</span> Artistry Hub
        </div>
        <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold mb-6 md:mb-10 leading-[0.9] tracking-tighter">Master <br />The <span className="text-pink-400 italic font-serif">Perfect</span> <br />Blend.</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => onNavigate('experts')}
            className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 bg-pink-600 text-white rounded-2xl md:rounded-[30px] font-bold shadow-xl hover:bg-pink-700 transition-all active:scale-95 text-sm md:text-lg flex items-center justify-center gap-2"
          >
            {BRAND_ICONS.Experts} Speak to Artists
          </button>
          <button 
             onClick={() => {
                const quizSection = document.getElementById('matchmaker-section');
                quizSection?.scrollIntoView({ behavior: 'smooth' });
             }}
             className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 bg-white/10 backdrop-blur-xl text-white rounded-2xl md:rounded-[30px] font-bold border border-white/20 hover:bg-white/20 transition-all active:scale-95 text-sm md:text-lg"
          >
            Sponge Matchmaker
          </button>
        </div>
      </div>
    </header>

    {/* Integrated Selector/Matchmaker on Home Page */}
    <section id="matchmaker-section" className="py-12 border-t border-pink-50 scroll-mt-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-pink-500 font-bold text-xs tracking-widest uppercase mb-4">
          {BRAND_ICONS.Sparkles} Clinical Diagnosis
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">Matchmaker Quiz</h2>
        <p className="text-gray-500 max-w-xl mx-auto px-4 font-light">Find the perfect material and shape for your skin type in under 60 seconds.</p>
      </div>
      <Quiz />
    </section>

    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
      {SPONGE_TIPS.map((tip, i) => (
        <div key={i} className="group glass p-8 rounded-[30px] md:rounded-[40px] hover:shadow-xl transition-all duration-500 border border-pink-50/50">
          <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mb-6 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500 shadow-sm shrink-0">
            {BRAND_ICONS.Shield}
          </div>
          <h3 className="font-bold text-xl mb-2 text-gray-900">{tip.title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-light">{tip.text}</p>
        </div>
      ))}
    </section>
  </div>
);

// Experts Sector: Chat + Tutorials
const ExpertsSector: React.FC = () => {
  const [subTab, setSubTab] = useState('chat');
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex bg-gray-100 p-1 rounded-2xl w-full max-w-xs mx-auto sticky top-0 z-20 shadow-sm">
        <button onClick={() => setSubTab('chat')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${subTab === 'chat' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}>CONSULT</button>
        <button onClick={() => setSubTab('learn')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${subTab === 'learn' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}>LEARN</button>
      </div>
      {subTab === 'chat' ? <AIConsultant /> : <TutorialLibrary />}
    </div>
  );
};

// Lab Sector: AI Diagnosis + Editor
const LabSector: React.FC = () => {
  const [subTab, setSubTab] = useState('analyze');
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex bg-gray-100 p-1 rounded-2xl w-full max-w-xs mx-auto sticky top-0 z-20 shadow-sm">
        <button onClick={() => setSubTab('analyze')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${subTab === 'analyze' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}>DIAGNOSIS</button>
        <button onClick={() => setSubTab('edit')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${subTab === 'edit' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}>AI EDITOR</button>
      </div>
      {subTab === 'analyze' ? <AIDiagnosis /> : <ImageEditor />}
    </div>
  );
};

// Sanctuary Sector: Hygiene Tracker + Rhythm Timer + Membership
const SanctuarySector: React.FC = () => {
  const [subTab, setSubTab] = useState('zen'); // Default to the new zen feature
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex bg-gray-100 p-1 rounded-2xl w-full max-w-md mx-auto sticky top-0 z-20 shadow-sm">
        <button onClick={() => setSubTab('zen')} className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${subTab === 'zen' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}>ZEN PULSE</button>
        <button onClick={() => setSubTab('timer')} className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${subTab === 'timer' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}>RHYTHM TIMER</button>
        <button onClick={() => setSubTab('tracker')} className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${subTab === 'tracker' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}>HYGIENE</button>
        <button onClick={() => setSubTab('club')} className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${subTab === 'club' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}>CLUB</button>
      </div>
      
      {subTab === 'zen' && <HeartRateZen />}

      {subTab === 'timer' && (
        <div className="animate-in fade-in duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Foundation Rhythm</h2>
            <p className="text-gray-500 text-sm mt-2">Sync your bounce with pro-tempo lo-fi beats.</p>
          </div>
          <RhythmTimer />
        </div>
      )}
      
      {subTab === 'tracker' && <CareAssistant />}
      
      {subTab === 'club' && <SubscriptionView />}
    </div>
  );
};

const TutorialLibrary: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {TUTORIALS.map((t) => (
      <div key={t.id} className="group bg-white rounded-[30px] overflow-hidden shadow-lg border border-pink-50">
        <div className="relative h-48 overflow-hidden">
          <img src={t.videoUrl} className="w-full h-full object-cover" alt={t.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <span className="bg-pink-600 text-white text-[8px] font-bold uppercase px-2 py-1 rounded-full">{t.part}</span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 tracking-tight">{t.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-2">{t.description}</p>
        </div>
      </div>
    ))}
  </div>
);

const SubscriptionView: React.FC = () => (
  <div className="max-w-xl mx-auto space-y-6">
    <div className="bg-white p-8 rounded-[40px] shadow-xl border-2 border-pink-600 relative overflow-hidden text-center">
      <div className="absolute top-0 right-0 bg-pink-600 text-white text-[10px] font-bold px-4 py-1 rounded-bl-2xl">PRO CHOICE</div>
      <h3 className="text-2xl font-bold mb-4 text-gray-900">Refresh Club</h3>
      <p className="text-gray-500 text-sm mb-6">New clinical-grade tools delivered automatically.</p>
      <div className="flex items-baseline justify-center gap-2 mb-8">
        <span className="text-6xl font-bold text-gray-900">$29</span>
        <span className="text-gray-400 font-bold text-sm tracking-widest uppercase">/ Quarter</span>
      </div>
      <button className="w-full py-5 bg-pink-600 text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-transform">Secure Membership</button>
    </div>
  </div>
);

export default App;
