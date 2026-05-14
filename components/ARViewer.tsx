import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { BRAND_ICONS, NAV_ITEMS } from '../constants';

// Internal types for the zones
interface Zone {
  id: string;
  label: string;
  angle: number;
  color: string;
  image: string;
  description: string;
}

const ZONES: Zone[] = [
  { 
    id: 'home', 
    label: 'Home', 
    angle: 45, 
    color: '#FFB7C5', 
    image: 'input_file_0.png',
    description: 'The entrance to the Beauty Pro experience.'
  },
  { 
    id: 'experts', 
    label: 'Experts', 
    angle: 70, 
    color: '#FFE5B4', 
    image: 'input_file_1.png',
    description: 'Consult with our animated IP masters.'
  },
  { 
    id: 'lab', 
    label: 'AI Lab', 
    angle: 90, 
    color: '#E0B0FF', 
    image: 'input_file_3.png',
    description: 'Advanced diagnosis and AI editor stations.'
  },
  { 
    id: 'sanctuary', 
    label: 'Sanctuary', 
    angle: 110, 
    color: '#B0E0E6', 
    image: 'input_file_2.png',
    description: 'A space for hygiene, rhythm, and zen.'
  },
  { 
    id: 'social', 
    label: 'Social', 
    angle: 135, 
    color: '#C1FFC1', 
    image: 'input_file_4.png',
    description: 'Connect and capture your beauty journey.'
  },
];

interface ARViewerProps {
  onNavigate?: (id: string) => void;
}

const ARViewer: React.FC<ARViewerProps> = ({ onNavigate }) => {
  const [interactionState, setInteractionState] = useState<'idle' | 'pressing' | 'dragging' | 'captured' | 'releasing'>('idle');
  const [pressure, setPressure] = useState(0); 
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isInSpatialScene, setIsInSpatialScene] = useState(false);
  const [proximityNode, setProximityNode] = useState<string | null>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spatial Parallax Motion Values
  const tiltX = useSpring(0, { damping: 20, stiffness: 60 });
  const tiltY = useSpring(0, { damping: 20, stiffness: 60 });

  const springConfig = { damping: 15, stiffness: 100, mass: 0.8 };
  const spongeX = useSpring(mouseX, springConfig);
  const spongeY = useSpring(mouseY, springConfig);
  
  const scale = useSpring(1, springConfig);
  const squashX = useSpring(1, springConfig);
  const squashY = useSpring(1, springConfig);

  const containerRef = useRef<HTMLDivElement>(null);
  
  const [customImages, setCustomImages] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('beauty_pro_studio_images');
    return saved ? JSON.parse(saved) : {};
  });

  const activeZoneImage = selectedZone ? (customImages[selectedZone.id] || selectedZone.image) : 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedZone) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newCustomImages = { ...customImages, [selectedZone.id]: base64 };
        setCustomImages(newCustomImages);
        localStorage.setItem('beauty_pro_studio_images', JSON.stringify(newCustomImages));
      };
      reader.readAsDataURL(file);
    }
  };

  // Audio Refs for ASMR
  const squeezeAudio = useRef<HTMLAudioElement | null>(null);
  const releaseAudio = useRef<HTMLAudioElement | null>(null);
  const attractAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Squeeze ASMR (Satisfying spongy squish)
    squeezeAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3');
    squeezeAudio.current.volume = 0.5;
    
    // Release ASMR (Soft release)
    releaseAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    releaseAudio.current.volume = 0.3;

    // Attraction sound
    attractAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2550/2550-preview.mp3'); 
    attractAudio.current.volume = 0.1;

    // Device Orientation Handler (Spatial Scene)
    const handleOrientation = (e: DeviceOrientationEvent) => {
        if ((!isTransitioning && !isInSpatialScene) || !e.beta || !e.gamma) return;
        // Map beta (-180 to 180) and gamma (-90 to 90) to subtle tilts
        const b = (e.beta - 45) / 45; // Assume 45deg holding angle for home
        const g = e.gamma / 45;
        tiltX.set(Math.max(-1, Math.min(1, g)) * 30);
        tiltY.set(Math.max(-1, Math.min(1, b)) * 30);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      // Stop all sounds on unmount
      squeezeAudio.current?.pause();
      releaseAudio.current?.pause();
      attractAudio.current?.pause();
    };
  }, [isTransitioning, isInSpatialScene, tiltX, tiltY]);

  const playSqueezeSound = () => {
    if (squeezeAudio.current) {
      squeezeAudio.current.currentTime = 0;
      squeezeAudio.current.play().catch(() => {});
    }
  };

  const playReleaseSound = () => {
    if (releaseAudio.current) {
      releaseAudio.current.currentTime = 0;
      releaseAudio.current.play().catch(() => {});
    }
  };

  const playAttractSound = () => {
    if (attractAudio.current) {
        attractAudio.current.currentTime = 0;
        attractAudio.current.play().catch(() => {});
    }
  };

  // Soft body deformation logic
  useEffect(() => {
    if (interactionState === 'pressing') {
      scale.set(0.92 + (1 - pressure) * 0.08);
      squashX.set(1.1);
      squashY.set(0.85);
    } else if (interactionState === 'dragging') {
      scale.set(1.05);
    } else {
      scale.set(1);
      squashX.set(1);
      squashY.set(1);
    }
  }, [interactionState, pressure, scale, squashX, squashY]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isTransitioning || isInSpatialScene) return;
    setInteractionState('pressing');
    setPressure(0.3);
    playSqueezeSound();
    
    window.navigator?.vibrate?.(10);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isTransitioning || isInSpatialScene) {
        // Spatial Parallax for Mouse in Place C
        tiltX.set((e.clientX / window.innerWidth - 0.5) * 60);
        tiltY.set((e.clientY / window.innerHeight - 0.5) * 60);
        return;
    }

    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const x = (e.clientX - bounds.left - bounds.width / 2);
    const y = (e.clientY - bounds.top - bounds.height / 2);

    // If not transitioning, handle sponge interaction
    if (interactionState === 'pressing' || interactionState === 'dragging') {
        if (Math.abs(x) > 10 || Math.abs(y) > 10) {
            setInteractionState('dragging');
        }

        // Magnetic Attraction Logic
        let nearestNode: string | null = null;
        let minDistance = 150; 

        ZONES.forEach((zone) => {
            const radius = 170; 
            const nodeX = Math.cos(zone.angle * (Math.PI / 180)) * radius;
            const nodeY = 80 + Math.sin(zone.angle * (Math.PI / 180)) * radius;

            const dx = x - nodeX;
            const dy = y - nodeY;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < minDistance) {
                nearestNode = zone.id;
                minDistance = dist;
            }
        });

        if (nearestNode && nearestNode !== proximityNode) {
            playAttractSound();
            window.navigator?.vibrate?.(5);
        }
        setProximityNode(nearestNode);

        let finalX = x;
        let finalY = y;

        if (nearestNode) {
            const zone = ZONES.find(z => z.id === nearestNode)!;
            const radius = 170;
            const nodeX = Math.cos(zone.angle * (Math.PI / 180)) * radius;
            const nodeY = 80 + Math.sin(zone.angle * (Math.PI / 180)) * radius;
            
            finalX = x * 0.6 + nodeX * 0.4;
            finalY = y * 0.6 + nodeY * 0.4;

            const dSpongeNode = Math.sqrt((finalX - nodeX)**2 + (finalY - nodeY)**2);
            if (dSpongeNode < 45) {
               handleZoneCapture(zone);
               return;
            }
        }

        mouseX.set(finalX);
        mouseY.set(finalY);
        
        const dist = Math.sqrt(finalX*finalX + finalY*finalY);
        const stretchAmount = 1 + dist / 500;
        squashX.set(stretchAmount);
        squashY.set(1 / (stretchAmount * 0.9));
    }
  };

  const handleZoneCapture = (zone: Zone) => {
    setSelectedZone(zone);
    setIsTransitioning(true);
    setInteractionState('releasing');
    
    // Animate sponge merging into node
    const radius = 170;
    const nodeX = Math.cos(zone.angle * (Math.PI / 180)) * radius;
    const nodeY = 80 + Math.sin(zone.angle * (Math.PI / 180)) * radius;
    
    mouseX.set(nodeX);
    mouseY.set(nodeY);
    scale.set(0.5);
    
    // Reset parallax values for entry
    tiltX.set(0);
    tiltY.set(0);

    // Speed up the materialization process
    setTimeout(() => {
      setIsTransitioning(false);
      setIsInSpatialScene(true);
    }, 3000); 
  };

  const handlePointerUp = () => {
    if (isTransitioning || isInSpatialScene) return;
    if (interactionState !== 'idle') {
      playReleaseSound();
    }
    setInteractionState('idle');
    setPressure(0);
    
    mouseX.set(0);
    mouseY.set(0);
    setProximityNode(null);
  };

  const returnToStudio = () => {
      setIsInSpatialScene(false);
      setSelectedZone(null);
      mouseX.set(0);
      mouseY.set(0);
      scale.set(1);
      setInteractionState('idle');
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[800px] flex items-center justify-center overflow-hidden bg-white rounded-[60px] cursor-pointer touch-none select-none border border-pink-50 shadow-inner"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
        {/* Soft Ambient Background */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
            <motion.div 
                animate={{ 
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-100 blur-[150px] rounded-full"
            />
            <motion.div 
                animate={{ 
                    x: [0, -40, 0],
                    y: [0, 60, 0],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-50 blur-[180px] rounded-full"
            />
        </div>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
            
            {/* Header */}
            <div className={`absolute top-12 text-center transition-all duration-700 ${(isTransitioning || isInSpatialScene) ? 'opacity-0 scale-95' : 'opacity-100 scroll-m-0'}`}>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-2">3D Studio</h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-[8px] font-bold uppercase tracking-widest border border-pink-100">
                    {BRAND_ICONS.Sparkles} Elastic Navigation Hub
                </div>
            </div>

            {/* Immersive Transition Overlay (Place C) */}
            <AnimatePresence>
                {(isTransitioning || isInSpatialScene) && selectedZone && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black"
                    >
                        <motion.div 
                            initial={{ scale: 1.8, opacity: 0, rotate: -2 }}
                            animate={{ scale: 1.1, opacity: 1, rotate: 0 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            style={{ x: tiltX, y: tiltY }}
                            className="absolute inset-[-30%] overflow-hidden"
                        >
                            <motion.img 
                                src={activeZoneImage} 
                                alt={selectedZone.label} 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80';
                                }}
                                style={{ x: tiltX, y: tiltY, scale: 1.4 }}
                                className="w-full h-full object-cover brightness-110 contrast-110"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80" />
                            <div className="absolute inset-0 bg-pink-900/5 mix-blend-overlay" />
                        </motion.div>
                        
                        <div className="relative z-10 text-center text-white px-8">
                            {isTransitioning && (
                                <>
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2, type: "spring", damping: 12 }}
                                        className="mb-4 inline-block p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20"
                                    >
                                        {NAV_ITEMS.find(n => n.id === selectedZone.id)?.icon}
                                    </motion.div>
                                    <motion.h3 
                                        initial={{ y: 20, opacity: 0, letterSpacing: "0.5em" }}
                                        animate={{ y: 0, opacity: 1, letterSpacing: "0.1em" }}
                                        transition={{ delay: 0.4, duration: 1 }}
                                        className="text-6xl md:text-9xl font-bold tracking-tight italic font-serif"
                                    >
                                        {selectedZone.label}
                                    </motion.h3>
                                    <motion.p 
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className="text-xl md:text-2xl mt-6 max-w-xl font-light opacity-60 tracking-widest mx-auto px-12 py-2 border-y border-white/10"
                                    >
                                        {selectedZone.description}
                                    </motion.p>
                                    
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                                        className="mt-16 text-[10px] font-bold uppercase tracking-[0.8em]"
                                    >
                                        Materializing Space
                                    </motion.div>
                                </>
                            )}

                            {isInSpatialScene && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="mb-12">
                                        <h3 className="text-4xl md:text-6xl font-serif italic mb-4 tracking-tight">{selectedZone.label} Space</h3>
                                        <div className="h-0.5 w-24 bg-pink-500 mx-auto" />
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={returnToStudio}
                                            className="px-10 py-5 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 text-white font-bold uppercase tracking-[0.4em] text-[10px] hover:bg-white/20 transition-all flex items-center gap-4"
                                        >
                                            Return to Studio
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Radial Fan Hub (Directly Underneath) */}
            <div className={`absolute bottom-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full transition-all duration-700 ${isTransitioning ? 'opacity-0 scale-150 blur-xl' : 'opacity-100'}`}>
                {ZONES.map((zone) => {
                    const isProximity = proximityNode === zone.id;
                    const radius = 170;
                    const x = Math.cos(zone.angle * (Math.PI / 180)) * radius;
                    const y = 80 + Math.sin(zone.angle * (Math.PI / 180)) * radius;

                    return (
                        <motion.div 
                            key={zone.id}
                            style={{ 
                                x, 
                                y,
                                left: '50%',
                                top: '50%',
                                position: 'absolute'
                            }}
                            className="flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                        >
                            <motion.div 
                                animate={{ 
                                    scale: isProximity ? 1.6 : interactionState !== 'idle' ? 1.2 : 1,
                                    opacity: interactionState !== 'idle' ? 1 : 0.4
                                }}
                                className="relative"
                            >
                                <div 
                                    className="w-14 h-14 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-all duration-500 overflow-hidden"
                                    style={{ 
                                        backgroundColor: isProximity ? zone.color : 'rgba(255,255,255,0.7)',
                                        borderColor: isProximity ? 'white' : 'rgba(255,255,255,0.3)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <img 
                                        src={customImages[zone.id] || zone.image}
                                        alt=""
                                        className={`w-full h-full object-cover transition-all duration-500 ${isProximity ? 'scale-110 brightness-110' : 'scale-100 opacity-60'}`}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80';
                                        }}
                                        referrerPolicy="no-referrer"
                                    />
                                    {!isProximity && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span 
                                                className="text-lg transition-transform duration-500"
                                                style={{ color: zone.color }}
                                            >
                                                {NAV_ITEMS.find(n => n.id === zone.id)?.icon}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                {isProximity && (
                                    <motion.div 
                                        animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.2 }}
                                        className="absolute inset-0 rounded-full blur-xl"
                                        style={{ backgroundColor: zone.color }}
                                    />
                                )}
                            </motion.div>
                            
                            <motion.span 
                                animate={{ 
                                    opacity: isProximity ? 1 : interactionState !== 'idle' ? 0.6 : 0,
                                    y: isProximity ? 5 : 0
                                }}
                                className="mt-4 text-[9px] font-bold uppercase tracking-widest text-pink-600 drop-shadow-sm whitespace-nowrap"
                            >
                                {zone.label}
                            </motion.span>
                        </motion.div>
                    )
                })}
            </div>

            {/* The Squeezable Sponge */}
            <motion.div
                style={{
                    x: spongeX,
                    y: spongeY,
                    scale,
                    scaleX: squashX,
                    scaleY: squashY,
                }}
                className={`relative z-20 transition-opacity duration-500 ${isTransitioning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <div className="relative w-56 h-72">
                    {/* Shadow */}
                    <motion.div 
                        animate={{ 
                            scale: interactionState === 'pressing' ? 1.2 : interactionState === 'dragging' ? 0.8 : 1,
                            opacity: interactionState === 'idle' ? 0.1 : 0.2,
                            y: interactionState === 'dragging' ? 40 : 0
                        }}
                        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-10 bg-pink-900/20 blur-2xl rounded-full -z-10"
                    />

                    {/* Squeezable Body (SVG) */}
                    <svg viewBox="0 0 200 260" className="w-full h-full drop-shadow-xl overflow-visible">
                        <defs>
                            <linearGradient id="spongeColor" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#FFB7C5" />
                                <stop offset="60%" stopColor="#FFC0CB" />
                                <stop offset="100%" stopColor="#FFE5D9" />
                            </linearGradient>
                            <filter id="beautyGlow">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        <motion.path
                            d="M100 0 C40 0, 0 100, 0 180 C0 230, 40 260, 100 260 C160 260, 200 230, 200 180 C200 100, 160 0, 100 0"
                            fill="url(#spongeColor)"
                            style={{ filter: 'url(#beautyGlow)' }}
                            animate={{
                                d: interactionState === 'pressing' 
                                    ? "M100 10 C50 10, 10 110, 10 180 C10 220, 50 250, 100 250 C150 250, 190 220, 190 180 C190 110, 150 10, 100 10" 
                                    : "M100 0 C40 0, 0 100, 0 180 C0 230, 40 260, 100 260 C160 260, 200 230, 200 180 C200 100, 160 0, 100 0"
                            }}
                            transition={{ type: "spring", stiffness: 100, damping: 10 }}
                        />
                        <ellipse cx="70" cy="60" rx="20" ry="40" fill="white" fillOpacity="0.3" filter="blur(8px)" />
                    </svg>

                    {/* Interaction Feedback */}
                    {interactionState === 'pressing' && (
                        <motion.div 
                            initial={{ scale: 0, opacity: 0.5 }}
                            animate={{ scale: 2, opacity: 0 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/30 rounded-full blur-xl pointer-events-none"
                        />
                    )}
                </div>
            </motion.div>
        </div>

        {/* Floating Instruction */}
        <motion.div 
            animate={{ 
                opacity: interactionState === 'idle' && !isTransitioning ? 1 : 0, 
                y: interactionState === 'idle' ? 0 : 20 
            }}
            className="absolute bottom-40 text-center pointer-events-none z-30"
        >
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-2">Drag to navigate popup sections</p>
        </motion.div>
    </div>
  );
};

export default ARViewer;
