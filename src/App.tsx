/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  Search, 
  Filter, 
  Terminal, 
  PlusCircle, 
  Key, 
  ShieldAlert, 
  Radio, 
  Tv, 
  Layers, 
  Share2,
  RefreshCw,
  Eye
} from 'lucide-react';
import { 
  auth, 
  OWNER_EMAIL, 
  subscribePosts, 
  subscribeSplashes, 
  subscribeAdmins, 
  subscribeSettings,
  logoutUser, 
  deletePost,
  DEFAULT_SETTINGS
} from './firebase';
import { Post, AdminUser, SplashItem, SiteSettings } from './types';
import { Navbar } from './components/Navbar';
import { DailySplashHero } from './components/DailySplashHero';
import { SplashesBar } from './components/SplashesBar';
import { PostCard } from './components/PostCard';
import { PostModal } from './components/PostModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { LoginModal } from './components/LoginModal';
import { MediaViewerModal } from './components/MediaViewerModal';
import { DedsecSkullIcon, DedsecBannerText } from './components/DedsecAscii';
import { playCyberSound } from './utils/audio';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Firestore Data state
  const [posts, setPosts] = useState<Post[]>([]);
  const [splashes, setSplashes] = useState<SplashItem[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [readingPost, setReadingPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [activeMedia, setActiveMedia] = useState<{ url: string; type: 'image' | 'video'; title?: string } | null>(null);

  // UI & Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Listen to Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore real-time collections
  useEffect(() => {
    const unsubPosts = subscribePosts(setPosts);
    const unsubSplashes = subscribeSplashes(setSplashes);
    const unsubAdmins = subscribeAdmins(setAdmins);
    const unsubSettings = subscribeSettings((s) => {
      setSettings(s);
      // Apply CSS variables
      if (s.primaryColor) document.documentElement.style.setProperty('--dedsec-primary', s.primaryColor);
      if (s.secondaryColor) document.documentElement.style.setProperty('--dedsec-secondary', s.secondaryColor);
      if (s.accentColor) document.documentElement.style.setProperty('--dedsec-accent', s.accentColor);
      if (s.backgroundColor) document.documentElement.style.setProperty('--dedsec-bg', s.backgroundColor);
      setScanlinesEnabled(s.enableScanlines);
      setSoundEnabled(s.enableSound);
    });

    return () => {
      unsubPosts();
      unsubSplashes();
      unsubAdmins();
      unsubSettings();
    };
  }, []);

  // Permissions check
  const isOwner = Boolean(
    user?.email && user.email.toLowerCase() === OWNER_EMAIL.toLowerCase()
  );

  const isAdmin = Boolean(
    isOwner || 
    (user?.email && admins.some(a => a.email.toLowerCase() === user.email?.toLowerCase()))
  );

  // Determine Daily Splash & Highlighted Splash
  const dailySplash = splashes.find(s => s.type === 'daily') || null;
  const highlightedSplash = splashes.find(s => s.highlighted) || null;

  // Dynamic categories extracted from posts, tags (#wardriving, etc.) and custom categories
  const dynamicCategories = React.useMemo(() => {
    const catSet = new Set<string>();
    
    // Categorias base padrão
    ['ctOS Breach', 'Intel Report', 'DedSec Manifesto', 'Zero-Day Exploit', 'San Francisco Telemetry'].forEach(c => catSet.add(c));
    
    // Categorias personalizadas salvas nas configurações
    if (settings.customCategories && Array.isArray(settings.customCategories)) {
      settings.customCategories.forEach(c => {
        if (c && c.trim()) catSet.add(c.trim());
      });
    }

    // Extrai categorias e tags registradas nos posts dinamicamente
    posts.forEach(p => {
      if (p.category && p.category.trim()) {
        catSet.add(p.category.trim());
      }
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(t => {
          const clean = t.trim();
          if (clean) {
            const formattedTag = clean.startsWith('#') ? clean : `#${clean}`;
            catSet.add(formattedTag);
          }
        });
      }
    });

    return ['ALL', ...Array.from(catSet)];
  }, [posts, settings.customCategories]);

  // Filtered posts
  const filteredPosts = posts.filter(post => {
    let matchesCategory = true;
    if (selectedCategory !== 'ALL') {
      if (selectedCategory.startsWith('#')) {
        const tagToFind = selectedCategory.slice(1).toLowerCase();
        matchesCategory = Boolean(
          (post.tags && post.tags.some(t => t.replace(/^#/, '').trim().toLowerCase() === tagToFind)) ||
          post.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          post.category?.toLowerCase() === tagToFind
        );
      } else {
        matchesCategory = Boolean(
          post.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          (post.tags && post.tags.some(t => t.replace(/^#/, '').trim().toLowerCase() === selectedCategory.toLowerCase()))
        );
      }
    }
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags && post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (post.category && post.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div 
      className="relative min-h-screen text-gray-200 selection:bg-[var(--dedsec-primary)] selection:text-black"
      style={{ backgroundColor: settings.backgroundColor || '#06090e' }}
    >
      {/* Dynamic Background Wallpaper */}
      {settings.wallpaperUrl && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center transition-all duration-700"
          style={{ 
            backgroundImage: `url(${settings.wallpaperUrl})`,
            opacity: (settings.wallpaperOpacity ?? 25) / 100,
            filter: `blur(${settings.wallpaperBlur ?? 2}px)`
          }}
        />
      )}

      {/* Cyber Matrix Grid */}
      {settings.enableGrid && (
        <div className="fixed inset-0 pointer-events-none z-0 cyber-grid" />
      )}

      {/* Optional CRT Scanlines */}
      {scanlinesEnabled && (
        <div className="fixed inset-0 pointer-events-none z-30 crt-scanlines" />
      )}

      {/* Main Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navigation Bar */}
        <Navbar
          user={user}
          isAdmin={isAdmin}
          isOwner={isOwner}
          soundEnabled={soundEnabled}
          scanlinesEnabled={scanlinesEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onToggleScanlines={() => setScanlinesEnabled(!scanlinesEnabled)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
          onLogout={logoutUser}
          postCount={posts.length}
          logoUrl={settings.logoUrl}
          siteTitle={settings.siteTitle}
        />

        {/* Hero Banner with DedSec Manifesto */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
          
          {/* Top Ticker / Header Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-[var(--dedsec-border)]">
            <div>
              <div className="flex items-center gap-2">
                <DedsecBannerText text={settings.siteTitle || "DEDSEC // SF_CELL"} />
              </div>
              <p className="text-xs font-mono text-gray-400 mt-1">
                {settings.subTitle || "ctOS 2.0 EXPOSED // WATCH DOGS NETWORK"}
              </p>
            </div>

            {/* Quick Action Button for Admin to Post */}
            {isAdmin ? (
              <button
                onClick={() => {
                  playCyberSound('terminal', soundEnabled);
                  setEditingPost(null);
                  setIsAdminPanelOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--dedsec-primary)] text-black font-display font-bold text-xs hover:bg-cyan-300 transition-all clip-cyber-badge shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>NOVA TRANSMISSÃO DEDSEC</span>
              </button>
            ) : (
              <div className="text-xs font-mono text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--dedsec-secondary)] animate-ping" />
                <span>CANAL PÚBLICO // SOMENTE LEITURA</span>
              </div>
            )}
          </div>

          {/* Section 1: Splash Relevante Primeiro do Dia & Mídia em Destaque na Página */}
          <DailySplashHero
            dailySplash={dailySplash}
            highlightedSplash={highlightedSplash}
            soundEnabled={soundEnabled}
            onOpenMediaModal={(url, type, title) => setActiveMedia({ url, type, title })}
            isAdmin={isAdmin}
            onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
          />

          {/* Section 2: Splashes Bar (Abas de Splash Relevante do Dia e Splashes Comuns) */}
          <SplashesBar
            splashes={splashes}
            soundEnabled={soundEnabled}
            onSelectSplash={(s) => {
              if (s.mediaUrl) {
                setActiveMedia({
                  url: s.mediaUrl,
                  type: s.mediaType === 'video' ? 'video' : 'image',
                  title: s.text
                });
              }
            }}
            onOpenMediaModal={(url, type, title) => setActiveMedia({ url, type, title })}
          />

          {/* Section 3: Filter & Search Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 border border-[var(--dedsec-border)] bg-[var(--dedsec-surface)]/60 backdrop-blur-sm">
            
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {dynamicCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    playCyberSound('click', soundEnabled);
                    setSelectedCategory(cat);
                  }}
                  className={`px-3 py-1 text-xs font-mono font-bold transition-all border ${
                    selectedCategory === cat
                      ? 'border-[var(--dedsec-primary)] bg-[var(--dedsec-primary)]/15 text-[var(--dedsec-primary)]'
                      : 'border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar transmissões..."
                className="w-full pl-8 pr-3 py-1.5 bg-black border border-gray-700 text-white font-mono text-xs focus:border-[var(--dedsec-primary)] focus:outline-none"
              />
            </div>

          </div>

          {/* Section 4: Posts Grid */}
          <div className="space-y-4">
            
            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
              <span>FEED DE TRANSMISSÕES // {filteredPosts.length} REGISTRADAS</span>
              {selectedCategory !== 'ALL' && (
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className="text-[var(--dedsec-primary)] hover:underline"
                >
                  Limpar Filtro
                </button>
              )}
            </div>

            {filteredPosts.length === 0 ? (
              <div className="py-16 px-6 text-center border-2 border-dashed border-gray-800 bg-black/40 clip-cyber-corner space-y-4">
                <div className="p-3 bg-black border border-[var(--dedsec-primary)] w-fit mx-auto text-[var(--dedsec-primary)]">
                  <DedsecSkullIcon className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    [ TRANSMISSÃO DEDSEC OFFLINE - NENHUM POST PUBLICADO ]
                  </h3>
                  <p className="text-xs font-mono text-gray-400 max-w-md mx-auto mt-2 leading-relaxed">
                    Nenhuma transmissão registrada no feed do Firestore no momento. Conecte-se com uma conta de administrador autorizada para transmitir novidades, vazamentos e comunicados.
                  </p>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  {isAdmin ? (
                    <button
                      onClick={() => {
                        playCyberSound('terminal', soundEnabled);
                        setIsAdminPanelOpen(true);
                      }}
                      className="px-4 py-2 bg-[var(--dedsec-primary)] text-black font-display font-bold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>PUBLICAR PRIMEIRA TRANSMISSÃO</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playCyberSound('click', soundEnabled);
                        setIsLoginModalOpen(true);
                      }}
                      className="px-4 py-2 bg-black border border-[var(--dedsec-secondary)] text-[var(--dedsec-secondary)] font-mono text-xs font-bold hover:bg-[var(--dedsec-secondary)] hover:text-black transition-colors flex items-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      <span>AUTENTICAR COM CONTA GOOGLE</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isAdmin={isAdmin}
                    soundEnabled={soundEnabled}
                    onReadPost={(p) => setReadingPost(p)}
                    onEditPost={(p) => {
                      setEditingPost(p);
                      setIsAdminPanelOpen(true);
                    }}
                    onDeletePost={async (postId) => {
                      await deletePost(postId);
                    }}
                    onOpenMediaModal={(url, type, title) => setActiveMedia({ url, type, title })}
                  />
                ))}
              </div>
            )}

          </div>

        </main>

        {/* Cyber Footer */}
        <footer className="mt-auto border-t border-[var(--dedsec-border)] bg-black/90 py-6 text-xs font-mono text-gray-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <DedsecSkullIcon className="w-5 h-5 text-[var(--dedsec-primary)]" />
              <div>
                <span className="text-white font-display font-bold">DEDSEC NETWORK</span>
                <span className="mx-2">•</span>
                <span>SAN FRANCISCO UNDERGROUND</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
              <span className="text-gray-400">HOST: FIRESTORE (snappy-cache-5f6jr)</span>
              <span>•</span>
              <span className="text-gray-400">ROOT IDENTITY: ENCRYPTED // ANONYMOUS</span>
              <span>•</span>
              <span className="text-[var(--dedsec-secondary)]">STATUS: ONLINE</span>
            </div>

            <div className="text-center md:text-right">
              <span className="text-[var(--dedsec-accent)]">ctOS 2.0 OVERRIDDEN</span>
            </div>

          </div>
        </footer>

      </div>

      {/* Read Post Modal */}
      <PostModal
        post={readingPost}
        onClose={() => setReadingPost(null)}
        soundEnabled={soundEnabled}
        onOpenMediaModal={(url, type, title) => setActiveMedia({ url, type, title })}
      />

      {/* Admin Panel Modal */}
      {isAdmin && isAdminPanelOpen && (
        <AdminPanelModal
          user={user}
          isAdmin={isAdmin}
          isOwner={isOwner}
          onClose={() => {
            setIsAdminPanelOpen(false);
            setEditingPost(null);
          }}
          posts={posts}
          splashes={splashes}
          admins={admins}
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings({ ...settings, ...newSettings })}
          soundEnabled={soundEnabled}
          editingPost={editingPost}
          onClearEditingPost={() => setEditingPost(null)}
        />
      )}

      {/* Google Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        soundEnabled={soundEnabled}
        onLoginSuccess={() => {
          playCyberSound('grant', soundEnabled);
        }}
      />

      {/* Fullscreen Media Viewer Modal */}
      <MediaViewerModal
        media={activeMedia}
        onClose={() => setActiveMedia(null)}
      />

    </div>
  );
}
