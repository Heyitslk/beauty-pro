
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Plus, X, Send, Image as ImageIcon } from 'lucide-react';
import { APP_ASSETS } from '../constants';

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

interface Post {
  id: string;
  user: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  timestamp: number;
}

const CollectiveView: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('beauty_pro_social_posts');
    if (saved) return JSON.parse(saved);
    
    // Default posts
    return APP_ASSETS.communityPosts.map((img, i) => ({
      id: `default-${i}`,
      user: `beauty_artist_${i + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Artist${i + 5}`,
      image: img,
      caption: i === 0 ? "Obsessed with the new sapphire blender! 💙" : "Flawless finish achieved. #beautypro",
      likes: Math.floor(Math.random() * 100) + 20,
      comments: [
        { id: `c-${i}-1`, user: 'makeup_fan', text: 'Looks amazing!', timestamp: Date.now() }
      ],
      isLiked: false,
      timestamp: Date.now() - (i * 3600000)
    }));
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('beauty_pro_social_posts', JSON.stringify(posts));
  }, [posts]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = () => {
    if (!newImage) return;

    const newPost: Post = {
      id: Date.now().toString(),
      user: 'You',
      avatar: localStorage.getItem('user_custom_avatar') || APP_ASSETS.defaultUser,
      image: newImage,
      caption: newCaption,
      likes: 0,
      comments: [],
      isLiked: false,
      timestamp: Date.now()
    };

    setPosts([newPost, ...posts]);
    setNewCaption('');
    setNewImage(null);
    setIsModalOpen(false);
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId: string, text: string) => {
    if (!text.trim()) return;
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: Date.now().toString(),
            user: 'You',
            text: text,
            timestamp: Date.now()
          }]
        };
      }
      return post;
    }));
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-gray-900">Artist Collective</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-2xl font-bold hover:bg-pink-700 transition-all active:scale-95 shadow-xl shadow-pink-100"
        >
          <Plus size={20} /> <span className="hidden sm:inline">New Post</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onLike={() => handleLike(post.id)}
            onComment={(text) => handleAddComment(post.id, text)}
          />
        ))}
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-2xl font-bold tracking-tight">Create Artist Post</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-80 bg-pink-50 rounded-[30px] border-2 border-dashed border-pink-200 flex flex-col items-center justify-center cursor-pointer group hover:bg-pink-100/50 transition-all overflow-hidden"
                >
                  {newImage ? (
                    <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="p-6 bg-white rounded-3xl shadow-lg text-pink-600 mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon size={32} />
                      </div>
                      <p className="font-bold text-gray-500">Tap to upload your blend</p>
                      <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Supports JPG, PNG</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />

                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Caption</label>
                  <textarea 
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="Share your technique tips..."
                    className="w-full p-6 bg-gray-50 rounded-[25px] border-none focus:ring-4 focus:ring-pink-100 outline-none text-lg transition-all min-h-[120px] resize-none"
                  />
                </div>

                <button 
                  onClick={handleCreatePost}
                  disabled={!newImage}
                  className="w-full py-5 bg-pink-600 text-white rounded-[25px] font-bold text-lg shadow-xl shadow-pink-100 disabled:opacity-30 active:scale-95 transition-all"
                >
                  Post to Collective
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PostCard: React.FC<{ post: Post, onLike: () => void, onComment: (text: string) => void }> = ({ post, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  return (
    <div className="bg-white rounded-[40px] shadow-xl border border-pink-50 overflow-hidden group">
      {/* Header */}
      <div className="p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-pink-100 overflow-hidden border-2 border-white shadow-md">
          <img src={post.avatar} alt={post.user} className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 leading-tight">@{post.user}</h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Artist Pro</p>
        </div>
      </div>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={post.image} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms]" 
          alt="Post content" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Interaction Bar */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={onLike}
            className={`flex items-center gap-2 group transition-all duration-300 ${post.isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
          >
            <div className={`p-2.5 rounded-2xl transition-all ${post.isLiked ? 'bg-rose-50 scale-110 shadow-sm shadow-rose-100' : 'bg-gray-50'}`}>
              <Heart size={22} className={post.isLiked ? 'fill-current' : ''} />
            </div>
            <span className="font-bold text-sm tracking-tight">{post.likes}</span>
          </button>

          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-400 hover:text-pink-600 transition-all group"
          >
            <div className="p-2.5 bg-gray-50 rounded-2xl group-hover:bg-pink-50 group-hover:shadow-sm group-hover:shadow-pink-100 transition-all">
              <MessageCircle size={22} />
            </div>
            <span className="font-bold text-sm tracking-tight">{post.comments.length}</span>
          </button>
        </div>

        {/* Caption */}
        <div className="pl-1">
          <p className="text-gray-700 leading-relaxed text-sm md:text-base">
            <span className="font-bold mr-2">@{post.user}</span>
            {post.caption}
          </p>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-8 pt-6 border-t border-gray-50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="max-h-[200px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 text-sm">
                  <span className="font-bold text-gray-900 shrink-0">@{comment.user}</span>
                  <span className="text-gray-600 font-light">{comment.text}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-4 pt-2">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onComment(commentText);
                    setCommentText('');
                  }
                }}
                placeholder="Add a comment..."
                className="flex-1 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-pink-100 outline-none text-sm transition-all"
              />
              <button 
                onClick={() => {
                  onComment(commentText);
                  setCommentText('');
                }}
                disabled={!commentText.trim()}
                className="p-3.5 bg-pink-600 text-white rounded-2xl hover:bg-pink-700 disabled:opacity-30 transition-all active:scale-95 shadow-lg shadow-pink-100"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectiveView;
