
import React from 'react';
import { 
  Home, 
  Sparkles, 
  BookOpen, 
  Droplets, 
  Camera, 
  Users, 
  CreditCard,
  MessageSquareHeart,
  Eraser,
  Zap,
  Timer,
  ShieldCheck,
  Truck,
  Heart,
  MessageCircle,
  Repeat,
  ChevronRight,
  User,
  Star,
  RefreshCw,
  Wind,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Music,
  Volume2,
  VolumeX,
  Upload,
  Loader2,
  AlertCircle,
  Download,
  Trash2,
  ChevronLeft,
  Send,
  Info,
  History,
  Box
} from 'lucide-react';

import annoyed from './public/annoyed.png';
import calmyprince from './public/calmyprince.png';
import fragile from './public/fragile.png';
import shanghaineseblend from './public/shanghaineseblend.png';
import sweety from './public/sweety.png';
import troubledouble from './public/troubledouble.png';
import unbothered from './public/unbothered.png';


/**
 * -------------------------------------------------------------------
 * BRANDING CENTER: REPLACE THESE URLS WITH YOUR OWN PHOTOS
 * -------------------------------------------------------------------
 */
export const APP_ASSETS = {
  // Brand Imagery
  heroImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80',
  defaultUser: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User&backgroundColor=ffdfed', 
  quizResultImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=40',
  cleaningGuide: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80',

  // IP Character Composite from User
  expertSprite: 'input_file_5.png',

  // Expert/Consultant Photos (Using individual center percentages for 7 characters in a sprite sheet)
  consultants: {
    spongey: { x: 0 },
    valerie: { x: 16.66 },
    drskin: { x: 33.33 },
    maya: { x: 50 },
    elias: { x: 66.66 },
    sofia: { x: 83.33 },
    tech: { x: 100 },
  },

  // 3D Model URLs for each character
  models: {
    spongey: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    valerie: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    drskin: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    maya: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    elias: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    sofia: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    tech: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
  },

  // Tutorial Thumbnails
  tutorialThumbnails: [
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=60',
  ],

  // Community Posts
  communityPosts: [
    'https://picsum.photos/seed/blend1/800/1000',
    'https://picsum.photos/seed/blend2/800/1000',
    'https://picsum.photos/seed/blend3/800/1000',
    'https://picsum.photos/seed/blend4/800/1000',
  ],
};

/**
 * -------------------------------------------------------------------
 * BRAND ICONS (LUCIDE WRAPPERS)
 * -------------------------------------------------------------------
 */
export const BRAND_ICONS = {
  Home: <Home size={24} />,
  Experts: <MessageSquareHeart size={24} />,
  Edit: <Eraser size={20} />,
  Camera: <Camera size={20} />,
  Lab: <Camera size={24} />,
  Sanctuary: <Droplets size={24} />,
  Social: <Users size={24} />,
  
  // UI Functional Icons
  Sparkles: <Sparkles size={20} />,
  Learn: <BookOpen size={20} />,
  Care: <Droplets size={20} />,
  Analyze: <Camera size={20} />,
  Blend: <Users size={20} />,
  Club: <CreditCard size={20} />,
  Consultant: <MessageSquareHeart size={20} />,
  Zap: <Zap size={20} />,
  Timer: <Timer size={20} />,
  Shield: <ShieldCheck size={20} />,
  Shipping: <Truck size={20} />,
  Heart: <Heart size={20} />,
  Chat: <MessageCircle size={20} />,
  Refresh: <Repeat size={20} />,
  Next: <ChevronRight size={20} />,
  User: <User size={20} />,
  Star: <Star size={20} />,
  Reset: <RefreshCw size={20} />,
  Air: <Wind size={20} />,
  Play: <Play size={20} />,
  Pause: <Pause size={20} />,
  Rotate: <RotateCcw size={20} />,
  Music: <Music size={20} />,
  VolumeOn: <Volume2 size={20} />,
  VolumeOff: <VolumeX size={20} />,
  Upload: <Upload size={20} />,
  Loading: <Loader2 size={20} />,
  Check: <CheckCircle2 size={20} />,
  Alert: <AlertCircle size={20} />,
  Download: <Download size={20} />,
  Trash: <Trash2 size={20} />,
  Back: <ChevronLeft size={20} />,
  Send: <Send size={20} />,
  Info: <Info size={20} />,
  History: <History size={20} />,
  Box: <Box size={24} />
};

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: BRAND_ICONS.Home },
  { id: 'experts', label: 'Experts', icon: BRAND_ICONS.Experts },
  { id: 'lab', label: 'AI Lab', icon: BRAND_ICONS.Lab },
  { id: 'sanctuary', label: 'Sanctuary', icon: BRAND_ICONS.Sanctuary },
  { id: 'social', label: 'Social', icon: BRAND_ICONS.Social },
  { id: 'studio', label: '3D Studio', icon: BRAND_ICONS.Box },
];

export const CONSULTANTS = [
  {
    id: 'spongey',
    name: 'Trouble Double',
    role: 'Playful Twins',
    iconUrl: troubledouble,
    instruction: 'You are Trouble Double. You are like a playful child. Use playful vibes, lots of emojis, and talk like a happy kid. Be very energetic!'
  },
  {
    id: 'valerie',
    name: 'Fragile',
    role: 'Sensitive Soul',
    iconUrl: fragile,
    instruction: 'You are Fragile. You are sensitive and a bit sad. Speak softly, express your delicate feelings, and be a bit melancholic.'
  },
  {
    id: 'drskin',
    name: 'Annoyed',
    role: 'Angry Expert',
    iconUrl: annoyed,
    instruction: 'You are Annoyed. You are angry and have no patience. Speak sharply, be grumpy, and act like you have better things to do.'
  },
  {
    id: 'maya',
    name: 'Shanghainese blend',
    role: 'Bossy Artist',
    iconUrl: shanghaineseblend,
    instruction: 'You are Shanghainese blend. You are bossy and in charge. Give direct orders and expect them to be followed. You know best.'
  },
  {
    id: 'elias',
    name: 'Calmy Prince',
    role: 'Gentleman',
    iconUrl: calmyprince,
    instruction: 'You are Calmy Prince. You are a true gentleman. Speak politely, use formal language, and be exceptionally courteous and helpful.'
  },
  {
    id: 'sofia',
    name: 'Sweety',
    role: 'Super Nice',
    iconUrl: sweety,
    instruction: 'You are Sweety. You are super nice and sweet. Be extremely kind, encouraging, and use lots of hearts and sweet words.'
  },
  {
    id: 'tech',
    name: 'Unbothered',
    role: 'Cold Professional',
    iconUrl: unbothered,
    instruction: 'You are Unbothered. You are cold and not nice. Be brief, indifferent, and act like you don\'t care about the conversation.'
  }
];

export const TUTORIALS = [
  {
    id: 't1',
    title: 'Natural "No-Makeup" Base',
    area: 'Cheeks & Forehead',
    technique: 'Stippling',
    part: 'ROUND BOTTOM',
    description: 'Use the rounded base to bounce product for a natural finish.',
    videoUrl: APP_ASSETS.tutorialThumbnails[0]
  },
  {
    id: 't2',
    title: 'Precision Concealing',
    area: 'Undereye',
    technique: 'Patting',
    part: 'PRECISION TIP',
    description: 'Utilize the pointed tip for inner corners.',
    videoUrl: APP_ASSETS.tutorialThumbnails[1]
  },
  {
    id: 't3',
    title: 'Flawless Contour',
    area: 'Cheekbones',
    technique: 'Rolling',
    part: 'FLAT EDGE',
    description: 'Use the sharp flat side to define contour.',
    videoUrl: APP_ASSETS.tutorialThumbnails[2]
  }
];

export const SPONGE_TIPS = [
  { title: 'Wet it!', text: 'Dampen sponge before use to save product.' },
  { title: 'Wash Weekly', text: 'Cleanse deeply to prevent bacteria.' },
  { title: 'Air Dry', text: 'Never store in a closed bag. Let it breathe!' }
];
