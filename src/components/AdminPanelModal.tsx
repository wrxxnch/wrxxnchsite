import React, { useState, useEffect } from 'react';
import { 
  X, 
  Terminal, 
  Send, 
  Users, 
  Palette, 
  Radio, 
  Trash2, 
  Edit3, 
  Check, 
  Image as ImageIcon, 
  Video, 
  Star, 
  Plus, 
  UserPlus, 
  Sparkles,
  Sliders,
  RefreshCw,
  Eye,
  Upload,
  ShieldAlert,
  Tag,
  ListFilter,
  FolderPlus
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Post, AdminUser, SplashItem, SiteSettings } from '../types';
import { PRESET_WALLPAPERS } from '../data/wallpapers';
import { 
  OWNER_EMAIL, 
  createPost, 
  updatePost, 
  deletePost, 
  createSplash, 
  updateSplash, 
  deleteSplash, 
  addAdminUser, 
  removeAdminUser, 
  saveSettings,
  importBulkSplashes 
} from '../firebase';
import { playCyberSound } from '../utils/audio';
import { DedsecSkullIcon } from './DedsecAscii';
import { DEDSEC_ASCII_PRESETS } from '../utils/asciiPresets';

interface AdminPanelModalProps {
  user: User | null;
  isAdmin: boolean;
  isOwner: boolean;
  onClose: () => void;
  posts: Post[];
  splashes: SplashItem[];
  admins: AdminUser[];
  settings: SiteSettings;
  onUpdateSettings: (newSettings: Partial<SiteSettings>) => void;
  soundEnabled: boolean;
  editingPost: Post | null;
  onClearEditingPost: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  user,
  isAdmin,
  isOwner,
  onClose,
  posts,
  splashes,
  admins,
  settings,
  onUpdateSettings,
  soundEnabled,
  editingPost,
  onClearEditingPost
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'splashes' | 'customization' | 'admins'>('posts');
  const [currentEditingPost, setCurrentEditingPost] = useState<Post | null>(editingPost);

  // Post form state
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('ctOS Breach');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('DedSec, ctOS, Hacking');
  const [postMediaType, setPostMediaType] = useState<'none' | 'image' | 'video'>('none');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [postHighlighted, setPostHighlighted] = useState(false);
  const [postBlurCover, setPostBlurCover] = useState(false);
  const [postBlurText, setPostBlurText] = useState('');
  const [postFileName, setPostFileName] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postSuccessMsg, setPostSuccessMsg] = useState('');

  // Categories management state
  const [newCustomCategoryInput, setNewCustomCategoryInput] = useState('');
  const [customCatMsg, setCustomCatMsg] = useState('');
  const [wallpaperFileName, setWallpaperFileName] = useState('');

  // Splash form state
  const [splashText, setSplashText] = useState('');
  const [splashType, setSplashType] = useState<'daily' | 'common'>('daily');
  const [splashMediaType, setSplashMediaType] = useState<'none' | 'image' | 'video'>('none');
  const [splashMediaUrl, setSplashMediaUrl] = useState('');
  const [splashAsciiArt, setSplashAsciiArt] = useState('');
  const [splashHighlighted, setSplashHighlighted] = useState(true);
  const [editingSplashId, setEditingSplashId] = useState<string | null>(null);
  const [splashFilter, setSplashFilter] = useState<'all' | 'daily' | 'common'>('all');
  const [isSubmittingSplash, setIsSubmittingSplash] = useState(false);
  const [splashSuccessMsg, setSplashSuccessMsg] = useState('');

  // Bulk Splash textarea (separated by newline)
  const [bulkSplashText, setBulkSplashText] = useState('');
  const [bulkType, setBulkType] = useState<'daily' | 'common'>('common');
  const [bulkMediaUrl, setBulkMediaUrl] = useState('');
  const [bulkMediaType, setBulkMediaType] = useState<'none' | 'image' | 'video'>('image');
  const [isImportingBulk, setIsImportingBulk] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  // Customization state
  const [tempPrimary, setTempPrimary] = useState(settings.primaryColor);
  const [tempSecondary, setTempSecondary] = useState(settings.secondaryColor);
  const [tempAccent, setTempAccent] = useState(settings.accentColor);
  const [tempBg, setTempBg] = useState(settings.backgroundColor);
  const [tempWallpaperUrl, setTempWallpaperUrl] = useState(settings.wallpaperUrl);
  const [tempWallpaperOpacity, setTempWallpaperOpacity] = useState(settings.wallpaperOpacity);
  const [tempWallpaperBlur, setTempWallpaperBlur] = useState(settings.wallpaperBlur);
  const [tempLogoUrl, setTempLogoUrl] = useState(settings.logoUrl || '');
  const [logoFileName, setLogoFileName] = useState('');
  const [customizationSaved, setCustomizationSaved] = useState(false);

  const handleLogoFileUpload = (file: File) => {
    if (!file) return;
    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setTempLogoUrl(result);
        playCyberSound('click', soundEnabled);
      }
    };
    reader.readAsDataURL(file);
  };

  // Admins form state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [adminActionMsg, setAdminActionMsg] = useState('');
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  const handleStartEditPost = (p: Post) => {
    setCurrentEditingPost(p);
    setPostTitle(p.title);
    setPostCategory(p.category);
    setPostContent(p.content);
    setPostTags(p.tags ? p.tags.join(', ') : '');
    setPostMediaType(p.mediaType || 'none');
    setPostMediaUrl(p.mediaUrl || '');
    setPostHighlighted(Boolean(p.highlighted));
    setPostBlurCover(Boolean(p.blurCover));
    setPostBlurText(p.blurText || '');
    setPostFileName('');
  };

  // Sync editing post
  useEffect(() => {
    if (editingPost) {
      handleStartEditPost(editingPost);
      setActiveTab('posts');
    }
  }, [editingPost]);

  // Sync customization state with settings prop
  useEffect(() => {
    setTempLogoUrl(settings.logoUrl || '');
    setTempWallpaperUrl(settings.wallpaperUrl);
    setTempWallpaperOpacity(settings.wallpaperOpacity);
    setTempWallpaperBlur(settings.wallpaperBlur);
    setTempPrimary(settings.primaryColor);
    setTempSecondary(settings.secondaryColor);
    setTempAccent(settings.accentColor);
    setTempBg(settings.backgroundColor);
  }, [settings]);

  // Pre-fill bulk splash textarea from current splashes or settings
  useEffect(() => {
    if (splashes.length > 0) {
      const lines = splashes.map(s => s.text).join('\n');
      setBulkSplashText(lines);
    } else if (settings.tickerRawText) {
      setBulkSplashText(settings.tickerRawText);
    }
  }, [splashes, settings.tickerRawText]);

  // Handle Post Submit
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      alert('Preencha o título e o conteúdo da transmissão.');
      return;
    }

    setIsSubmittingPost(true);
    playCyberSound('terminal', soundEnabled);

    try {
      const tagsArray = postTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      if (currentEditingPost) {
        await updatePost(currentEditingPost.id, {
          title: postTitle.trim(),
          category: postCategory,
          content: postContent.trim(),
          tags: tagsArray,
          mediaType: postMediaType,
          mediaUrl: postMediaUrl.trim(),
          highlighted: postHighlighted,
          blurCover: postBlurCover,
          blurText: postBlurText.trim()
        });
        setPostSuccessMsg('Transmissão atualizada com sucesso no Firestore!');
        setCurrentEditingPost(null);
        onClearEditingPost();
      } else {
        await createPost({
          title: postTitle.trim(),
          category: postCategory,
          content: postContent.trim(),
          tags: tagsArray,
          mediaType: postMediaType,
          mediaUrl: postMediaUrl.trim(),
          highlighted: postHighlighted,
          blurCover: postBlurCover,
          blurText: postBlurText.trim(),
          authorEmail: user?.email || 'root@dedsec.network',
          authorName: isOwner ? 'ROOT_OPERATIVE' : (user?.displayName || 'OPERADOR DEDSEC'),
          createdAt: Date.now()
        });
        setPostSuccessMsg('Nova transmissão transmitida com sucesso para o Firestore!');
        
        // Reset form
        setPostTitle('');
        setPostContent('');
        setPostMediaUrl('');
        setPostFileName('');
        setPostHighlighted(false);
        setPostBlurCover(false);
        setPostBlurText('');
      }

      setTimeout(() => setPostSuccessMsg(''), 4000);
    } catch (err: unknown) {
      console.error(err);
      alert('Erro ao salvar transmissão no Firestore: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Handle Post File Upload (Image or Video)
  const handlePostFileUpload = (file: File) => {
    if (!file) return;
    setPostFileName(file.name);
    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPostMediaUrl(result);
        setPostMediaType(isVideo ? 'video' : 'image');
        playCyberSound('click', soundEnabled);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Wallpaper File Upload (Image)
  const handleWallpaperFileUpload = (file: File) => {
    if (!file) return;
    setWallpaperFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setTempWallpaperUrl(result);
        playCyberSound('click', soundEnabled);
      }
    };
    reader.readAsDataURL(file);
  };

  // Custom Categories Management
  const handleAddCustomCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCat = newCustomCategoryInput.trim();
    if (!cleanCat) return;

    const existingCustom = settings.customCategories || [];
    if (existingCustom.includes(cleanCat)) {
      alert('Esta categoria já existe na lista.');
      return;
    }

    const updated = [...existingCustom, cleanCat];
    try {
      await saveSettings({ customCategories: updated });
      onUpdateSettings({ customCategories: updated });
      setNewCustomCategoryInput('');
      setCustomCatMsg(`Categoria "${cleanCat}" adicionada com sucesso!`);
      setTimeout(() => setCustomCatMsg(''), 3500);
      playCyberSound('terminal', soundEnabled);
    } catch (err: unknown) {
      alert('Erro ao salvar categoria: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleRemoveCustomCategory = async (catToRemove: string) => {
    const existingCustom = settings.customCategories || [];
    const updated = existingCustom.filter(c => c !== catToRemove);
    try {
      await saveSettings({ customCategories: updated });
      onUpdateSettings({ customCategories: updated });
      setCustomCatMsg(`Categoria "${catToRemove}" removida.`);
      setTimeout(() => setCustomCatMsg(''), 3500);
      playCyberSound('deny', soundEnabled);
    } catch (err: unknown) {
      alert('Erro ao remover categoria: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Dynamic calculation of all categories and tags for display and selection
  const allAvailableCategories = React.useMemo(() => {
    const map = new Map<string, { count: number; source: 'preset' | 'post' | 'tag' | 'custom' }>();
    
    // Presets
    ['ctOS Breach', 'Intel Report', 'DedSec Manifesto', 'Zero-Day Exploit', 'San Francisco Telemetry', 'Security Analysis'].forEach(c => {
      map.set(c, { count: 0, source: 'preset' });
    });

    // Custom categories from settings
    if (settings.customCategories) {
      settings.customCategories.forEach(c => {
        if (!map.has(c)) {
          map.set(c, { count: 0, source: 'custom' });
        }
      });
    }

    // From posts (categories and tags)
    posts.forEach(p => {
      if (p.category) {
        const cat = p.category.trim();
        const existing = map.get(cat);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(cat, { count: 1, source: 'post' });
        }
      }

      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(t => {
          const raw = t.trim();
          if (raw) {
            const formatted = raw.startsWith('#') ? raw : `#${raw}`;
            const existing = map.get(formatted);
            if (existing) {
              existing.count += 1;
            } else {
              map.set(formatted, { count: 1, source: 'tag' });
            }
          }
        });
      }
    });

    return Array.from(map.entries()).map(([name, info]) => ({
      name,
      count: info.count,
      source: info.source
    }));
  }, [posts, settings.customCategories]);

  // Handle Splash Submit (Individual)
  const handleSaveSplash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!splashText.trim()) return;

    setIsSubmittingSplash(true);
    playCyberSound('terminal', soundEnabled);

    try {
      const today = new Date().toISOString().split('T')[0];

      if (editingSplashId) {
        await updateSplash(editingSplashId, {
          text: splashText.trim(),
          type: splashType,
          mediaType: splashMediaType,
          mediaUrl: splashMediaUrl.trim(),
          asciiArt: splashAsciiArt.trim(),
          highlighted: splashHighlighted
        });
        setSplashSuccessMsg('Splash atualizado no Firestore!');
        setEditingSplashId(null);
        setSplashAsciiArt('');
      } else {
        await createSplash({
          text: splashText.trim(),
          type: splashType,
          date: today,
          mediaType: splashMediaType,
          mediaUrl: splashMediaUrl.trim(),
          asciiArt: splashAsciiArt.trim(),
          highlighted: splashHighlighted,
          createdAt: Date.now()
        });
        setSplashSuccessMsg('Splash publicado com sucesso!');
        setSplashText('');
        setSplashMediaUrl('');
        setSplashAsciiArt('');
      }
      setTimeout(() => setSplashSuccessMsg(''), 3000);
    } catch (err: unknown) {
      console.error(err);
      alert('Erro ao salvar splash: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmittingSplash(false);
    }
  };

  // Handle Bulk Import of Splash Lines
  const handleBulkImport = async () => {
    if (!bulkSplashText.trim()) {
      alert('Insira ao menos uma linha de texto splash.');
      return;
    }

    setIsImportingBulk(true);
    playCyberSound('terminal', soundEnabled);

    try {
      const count = await importBulkSplashes(
        bulkSplashText, 
        bulkType, 
        bulkMediaUrl.trim(), 
        bulkMediaType
      );
      
      // Also update site_config raw text
      await saveSettings({ tickerRawText: bulkSplashText });

      setBulkSuccessMsg(`${count} textos splash sincronizados dinamicamente no Firestore!`);
      setTimeout(() => setBulkSuccessMsg(''), 4000);
    } catch (err: unknown) {
      console.error(err);
      alert('Erro na sincronização em massa: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsImportingBulk(false);
    }
  };

  // Handle Save Customization
  const handleSaveCustomization = async () => {
    playCyberSound('grant', soundEnabled);
    try {
      const updates: Partial<SiteSettings> = {
        primaryColor: tempPrimary,
        secondaryColor: tempSecondary,
        accentColor: tempAccent,
        backgroundColor: tempBg,
        wallpaperUrl: tempWallpaperUrl,
        wallpaperOpacity: tempWallpaperOpacity,
        wallpaperBlur: tempWallpaperBlur,
        logoUrl: tempLogoUrl,
        tickerRawText: bulkSplashText
      };

      await saveSettings(updates);
      onUpdateSettings(updates);

      // Apply to CSS variables immediately
      document.documentElement.style.setProperty('--dedsec-primary', tempPrimary);
      document.documentElement.style.setProperty('--dedsec-secondary', tempSecondary);
      document.documentElement.style.setProperty('--dedsec-accent', tempAccent);
      document.documentElement.style.setProperty('--dedsec-bg', tempBg);

      setCustomizationSaved(true);
      setTimeout(() => setCustomizationSaved(false), 3000);
    } catch (err: unknown) {
      console.error(err);
      alert('Erro ao salvar configurações no Firestore: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Handle Add Admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    setIsSubmittingAdmin(true);
    playCyberSound('terminal', soundEnabled);

    try {
      await addAdminUser(newAdminEmail.trim(), user?.email || OWNER_EMAIL, newAdminName.trim());
      setAdminActionMsg(`Admin ${newAdminEmail} adicionado com sucesso!`);
      setNewAdminEmail('');
      setNewAdminName('');
      setTimeout(() => setAdminActionMsg(''), 4000);
    } catch (err: unknown) {
      console.error(err);
      alert('Erro ao adicionar admin: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  // Handle Remove Admin
  const handleRemoveAdmin = async (email: string) => {
    if (email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      alert('A conta root (jeanpierreowner@gmail.com) é o proprietário permanente e não pode ser removida.');
      return;
    }

    if (!confirm(`Remover os privilégios de administrador para ${email}?`)) return;

    playCyberSound('deny', soundEnabled);
    try {
      await removeAdminUser(email);
      setAdminActionMsg(`Admin ${email} removido do Firestore.`);
      setTimeout(() => setAdminActionMsg(''), 4000);
    } catch (err: unknown) {
      console.error(err);
      alert('Erro ao remover admin: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const categories = [
    'ctOS Breach',
    'Intel Report',
    'DedSec Manifesto',
    'Zero-Day Exploit',
    'San Francisco Telemetry',
    'Security Analysis'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      
      <div className="relative w-full max-w-5xl my-6 border-2 border-[var(--dedsec-primary)] bg-[var(--dedsec-surface)] clip-cyber-corner shadow-[0_0_40px_rgba(0,240,255,0.25)] flex flex-col max-h-[90vh]">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-black">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[var(--dedsec-primary)]/20 border border-[var(--dedsec-primary)] text-[var(--dedsec-primary)]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-white tracking-wider">
                  DEDSEC // PAINEL ADMINISTRATIVO ROOT
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-[var(--dedsec-accent)]/20 text-[var(--dedsec-accent)] border border-[var(--dedsec-accent)] font-mono font-bold">
                  AUTENTICADO
                </span>
              </div>
              <p className="text-[11px] font-mono text-gray-400">
                OPERADOR: {isOwner ? 'ROOT_OPERATIVE' : (user?.displayName || 'OPERADOR_AUTORIZADO')} {isOwner ? '[ROOT OWNER - TOTAL ACCESS]' : '[ADMIN]'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCyberSound('click', soundEnabled);
              onClearEditingPost();
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center border-b border-gray-800 bg-black/50 px-4">
          
          {/* Tab 1: Posts */}
          <button
            onClick={() => {
              playCyberSound('click', soundEnabled);
              setActiveTab('posts');
            }}
            className={`flex items-center gap-2 px-4 py-3 font-mono text-xs font-bold border-b-2 transition-all ${
              activeTab === 'posts'
                ? 'border-[var(--dedsec-primary)] text-[var(--dedsec-primary)] bg-[var(--dedsec-primary)]/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>PUBLICAR POSTS ({posts.length})</span>
          </button>

          {/* Tab 2: Categorias & Tags */}
          <button
            onClick={() => {
              playCyberSound('click', soundEnabled);
              setActiveTab('categories');
            }}
            className={`flex items-center gap-2 px-4 py-3 font-mono text-xs font-bold border-b-2 transition-all ${
              activeTab === 'categories'
                ? 'border-[var(--dedsec-primary)] text-[var(--dedsec-primary)] bg-[var(--dedsec-primary)]/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>CATEGORIAS & TAGS ({allAvailableCategories.length})</span>
          </button>

          {/* Tab 3: Splashes & Destaques */}
          <button
            onClick={() => {
              playCyberSound('click', soundEnabled);
              setActiveTab('splashes');
            }}
            className={`flex items-center gap-2 px-4 py-3 font-mono text-xs font-bold border-b-2 transition-all ${
              activeTab === 'splashes'
                ? 'border-[var(--dedsec-accent)] text-[var(--dedsec-accent)] bg-[var(--dedsec-accent)]/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>SPLASHES & DESTAQUES ({splashes.length})</span>
          </button>

          {/* Tab 4: Wallpaper & Customização */}
          <button
            onClick={() => {
              playCyberSound('click', soundEnabled);
              setActiveTab('customization');
            }}
            className={`flex items-center gap-2 px-4 py-3 font-mono text-xs font-bold border-b-2 transition-all ${
              activeTab === 'customization'
                ? 'border-[var(--dedsec-secondary)] text-[var(--dedsec-secondary)] bg-[var(--dedsec-secondary)]/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>WALLPAPER & CORES</span>
          </button>

          {/* Tab 5: Gerenciar Admins */}
          <button
            onClick={() => {
              playCyberSound('click', soundEnabled);
              setActiveTab('admins');
            }}
            className={`flex items-center gap-2 px-4 py-3 font-mono text-xs font-bold border-b-2 transition-all ${
              activeTab === 'admins'
                ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>GERENCIAR ADMINS ({admins.length})</span>
          </button>

        </div>

        {/* Tab Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-6">

          {/* ===================== TAB 1: POSTS ===================== */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              
              {postSuccessMsg && (
                <div className="p-3 bg-green-950/60 border border-[var(--dedsec-secondary)] text-[var(--dedsec-secondary)] text-xs font-mono flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{postSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSavePost} className="space-y-4 border border-gray-800 bg-black/60 p-4 clip-cyber-corner">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-[var(--dedsec-primary)]" />
                    <span>{currentEditingPost ? 'EDITAR TRANSMISSÃO' : 'CRIAR NOVA TRANSMISSÃO // DEDSEC POST'}</span>
                  </h3>
                  {currentEditingPost && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentEditingPost(null);
                        onClearEditingPost();
                        setPostTitle('');
                        setPostContent('');
                        setPostMediaUrl('');
                      }}
                      className="text-xs font-mono text-gray-400 hover:text-white"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Title */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-mono text-gray-300">TÍTULO DA TRANSMISSÃO *</label>
                    <input
                      type="text"
                      required
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="Ex: Vazamento de Dados da Blume ctOS 2.0"
                      className="w-full px-3 py-2 bg-black border border-gray-700 text-white font-mono text-sm focus:border-[var(--dedsec-primary)] focus:outline-none"
                    />
                  </div>

                  {/* Category Selection / Custom Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-300">CATEGORIA</label>
                    <div className="space-y-1.5">
                      <select
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-gray-700 text-white font-mono text-xs focus:border-[var(--dedsec-primary)] focus:outline-none"
                      >
                        {allAvailableCategories
                          .filter(c => !c.name.startsWith('#'))
                          .map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name} {c.count > 0 ? `(${c.count})` : ''}
                            </option>
                          ))}
                        <option value="__custom__">+ Nova Categoria...</option>
                      </select>
                      {postCategory === '__custom__' && (
                        <input
                          type="text"
                          required
                          placeholder="Digite o nome da nova categoria"
                          onChange={(e) => setPostCategory(e.target.value)}
                          className="w-full px-2 py-1 bg-black border border-[var(--dedsec-primary)] text-white font-mono text-xs focus:outline-none"
                        />
                      )}
                    </div>
                  </div>

                </div>

                {/* Content */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-300">CONTEÚDO (MANIFESTO / INTEL / TEXTO) *</label>
                  <textarea
                    required
                    rows={5}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Escreva a mensagem que será transmitida na rede DedSec..."
                    className="w-full px-3 py-2 bg-black border border-gray-700 text-gray-200 font-sans text-sm focus:border-[var(--dedsec-primary)] focus:outline-none"
                  />
                </div>

                {/* Media Configuration with File Upload */}
                <div className="space-y-3 p-3 bg-black/80 border border-gray-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[var(--dedsec-primary)]" />
                      <span>MÍDIA DA TRANSMISSÃO (IMAGEM OU VÍDEO)</span>
                    </label>
                    {postMediaUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setPostMediaUrl('');
                          setPostMediaType('none');
                          setPostFileName('');
                        }}
                        className="text-[10px] font-mono text-red-400 hover:underline"
                      >
                        Limpar mídia selecionada
                      </button>
                    )}
                  </div>

                  {/* Input de Arquivo (Upload do Dispositivo) */}
                  <label className="cursor-pointer block p-3.5 border-2 border-dashed border-gray-700 hover:border-[var(--dedsec-primary)] bg-black/60 text-center transition-all group">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Upload className="w-5 h-5 text-[var(--dedsec-primary)] group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-mono text-white font-bold">
                        {postFileName ? `Arquivo Carregado: ${postFileName}` : 'Clique para Carregar Arquivo de Imagem ou Vídeo do Computador'}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        PNG, JPG, GIF, WebP, MP4, WebM (ou arraste e solte o arquivo aqui)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePostFileUpload(file);
                      }}
                    />
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-gray-400">TIPO DE MÍDIA</label>
                      <select
                        value={postMediaType}
                        onChange={(e) => setPostMediaType(e.target.value as 'none' | 'image' | 'video')}
                        className="w-full px-3 py-1.5 bg-black border border-gray-700 text-white font-mono text-xs focus:border-[var(--dedsec-primary)] focus:outline-none"
                      >
                        <option value="none">Nenhuma mídia</option>
                        <option value="image">Imagem</option>
                        <option value="video">Vídeo</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[11px] font-mono text-gray-400">OU INSIRA UMA URL DIRETA (YOUTUBE / WEB)</label>
                      <input
                        type="text"
                        disabled={postMediaType === 'none'}
                        value={postMediaUrl}
                        onChange={(e) => setPostMediaUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-1.5 bg-black border border-gray-700 text-white font-mono text-xs disabled:opacity-40 focus:border-[var(--dedsec-primary)] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Opção de Blur na Capa do Post com Texto Customizado */}
                <div className="p-3 bg-black/80 border border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postBlurCover}
                        onChange={(e) => setPostBlurCover(e.target.checked)}
                        className="w-4 h-4 accent-[var(--dedsec-accent)]"
                      />
                      <span className="text-xs font-mono text-white font-bold flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-[var(--dedsec-accent)]" />
                        <span>ATIVAR BLUR NA CAPA (DESFOQUE / CONTEÚDO SENSÍVEL)</span>
                      </span>
                    </label>
                  </div>

                  {postBlurCover && (
                    <div className="space-y-1.5 pl-6 border-l-2 border-[var(--dedsec-accent)]/50 pt-1">
                      <label className="text-xs font-mono text-gray-300">
                        TEXTO SOBREPOSTO NO BLUR (OPCIONAL)
                      </label>
                      <input
                        type="text"
                        value={postBlurText}
                        onChange={(e) => setPostBlurText(e.target.value)}
                        placeholder="Ex: CONTEÚDO CLASSIFICADO, ZERO-DAY, SPOILER..."
                        className="w-full px-3 py-1.5 bg-black border border-gray-700 text-white font-mono text-xs focus:border-[var(--dedsec-accent)] focus:outline-none"
                      />
                      <p className="text-[10px] font-mono text-gray-400">
                        * Se deixar sem nada (em branco), o texto será removido e a capa exibirá apenas o desfoque visual com o botão de revelação.
                      </p>
                    </div>
                  )}
                </div>

                {/* Tags & Highlight Toggle */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                  <div className="flex-1 w-full sm:max-w-md space-y-1">
                    <label className="text-xs font-mono text-gray-300 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[var(--dedsec-primary)]" />
                      <span>TAGS (SEPARADAS POR VÍRGULA)</span>
                    </label>
                    <input
                      type="text"
                      value={postTags}
                      onChange={(e) => setPostTags(e.target.value)}
                      placeholder="DedSec, #wardriving, SanFrancisco, ctOS"
                      className="w-full px-3 py-1.5 bg-black border border-gray-700 text-white font-mono text-xs focus:border-[var(--dedsec-primary)] focus:outline-none"
                    />
                    <p className="text-[10px] font-mono text-gray-400">
                      * Tags adicionadas aqui (ex: #wardriving) aparecem automaticamente como categorias nos filtros do feed!
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer mt-4 sm:mt-0 p-2 border border-gray-800 bg-black hover:border-[var(--dedsec-accent)] transition-colors">
                    <input
                      type="checkbox"
                      checked={postHighlighted}
                      onChange={(e) => setPostHighlighted(e.target.checked)}
                      className="w-4 h-4 accent-[var(--dedsec-accent)]"
                    />
                    <span className="text-xs font-mono text-white flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[var(--dedsec-accent)]" />
                      <span>Destacar transmissão no topo da página</span>
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingPost}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--dedsec-primary)] text-black font-display font-bold text-sm hover:bg-cyan-300 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{editingPost ? 'SALVAR ALTERAÇÕES NO FIRESTORE' : 'TRANSMITIR POST NO FIRESTORE'}</span>
                  </button>
                </div>
              </form>

              {/* Existing Posts Management */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                  TODAS AS TRANSMISSÕES PUBLICADAS NO FIRESTORE ({posts.length})
                </h4>

                {posts.length === 0 ? (
                  <div className="p-6 text-center text-xs font-mono text-gray-500 border border-dashed border-gray-800">
                    [ NENHUM POST PUBLICADO NO FIRESTORE AINDA ]
                  </div>
                ) : (
                  <div className="space-y-2">
                    {posts.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 border border-gray-800 bg-black/50 flex items-center justify-between gap-3 hover:border-gray-700"
                      >
                        <div className="flex-1 truncate">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-display font-bold text-white truncate">
                              {p.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black border border-gray-700 text-gray-400">
                              {p.category}
                            </span>
                            {p.highlighted && (
                              <span className="text-[10px] font-mono text-[var(--dedsec-accent)] font-bold">
                                [DESTAQUE]
                              </span>
                            )}
                            {p.blurCover && (
                              <span className="text-[10px] font-mono text-yellow-400 border border-yellow-400/40 px-1">
                                [BLUR]
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-mono text-gray-500 truncate mt-0.5">
                            Por: {p.authorName || 'OPERADOR DEDSEC'} • {new Date(p.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              playCyberSound('click', soundEnabled);
                              handleStartEditPost(p);
                            }}
                            className="p-1.5 text-gray-400 hover:text-[var(--dedsec-primary)] border border-gray-800 hover:border-[var(--dedsec-primary)]"
                            title="Editar Post"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              playCyberSound('deny', soundEnabled);
                              if (confirm(`Excluir permanentemente o post "${p.title}"?`)) {
                                await deletePost(p.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-400 border border-gray-800 hover:border-red-600"
                            title="Excluir Post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ===================== TAB 2: CATEGORIAS & TAGS ===================== */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              
              {customCatMsg && (
                <div className="p-3 bg-blue-950/60 border border-[var(--dedsec-primary)] text-[var(--dedsec-primary)] text-xs font-mono flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{customCatMsg}</span>
                </div>
              )}

              {/* Informative DedSec Banner */}
              <div className="p-4 bg-black/60 border border-[var(--dedsec-primary)]/40 clip-cyber-corner space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--dedsec-primary)]">
                  <Terminal className="w-4 h-4" />
                  <span>SISTEMA DINÂMICO DE FILTROS & TAXONOMIA DEDSEC</span>
                </div>
                <p className="text-xs font-mono text-gray-300 leading-relaxed">
                  As categorias no DedSec são geradas e integradas em tempo real. À medida que você publica transmissões ou insere tags com hashtag (ex: <span className="text-yellow-400 font-bold">#wardriving</span>, <span className="text-yellow-400 font-bold">#zeroday</span>, <span className="text-yellow-400 font-bold">#ctos</span>), o sistema as detecta e as adiciona automaticamente à barra de filtros do feed principal!
                </p>
              </div>

              {/* Add Custom Category Form */}
              <form onSubmit={handleAddCustomCategory} className="border border-gray-800 bg-black/60 p-4 clip-cyber-corner space-y-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-gray-800 pb-2">
                  <FolderPlus className="w-4 h-4 text-[var(--dedsec-primary)]" />
                  <span>CRIAR NOVA CATEGORIA FIXA NO SISTEMA</span>
                </h3>

                <p className="text-xs font-mono text-gray-400">
                  Adicione uma nova categoria personalizada que ficará permanentemente disponível nas opções de postagem e na barra de filtros.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={newCustomCategoryInput}
                      onChange={(e) => setNewCustomCategoryInput(e.target.value)}
                      placeholder="Ex: Operações Urbanas, Escuta Telefônica, #Wardriving..."
                      className="w-full px-3 py-2 bg-black border border-gray-700 text-white font-mono text-xs focus:border-[var(--dedsec-primary)] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--dedsec-primary)] text-black font-display font-bold text-xs hover:bg-cyan-300 transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ADICIONAR CATEGORIA</span>
                  </button>
                </div>
              </form>

              {/* Custom Categories List */}
              {settings.customCategories && settings.customCategories.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-yellow-400" />
                    <span>CATEGORIAS PERSONALIZADAS CADASTRADAS ({settings.customCategories.length})</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {settings.customCategories.map((cat) => (
                      <div
                        key={cat}
                        className="p-2.5 bg-black/50 border border-gray-800 flex items-center justify-between gap-2"
                      >
                        <span className="text-xs font-mono text-white font-bold truncate">
                          {cat}
                        </span>
                        <button
                          onClick={() => handleRemoveCustomCategory(cat)}
                          className="p-1 text-gray-500 hover:text-red-400 border border-transparent hover:border-red-900 transition-colors"
                          title="Remover categoria"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Dynamic Categories & Tags Overview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <ListFilter className="w-3.5 h-3.5 text-[var(--dedsec-primary)]" />
                    <span>TODAS AS CATEGORIAS E TAGS ATIVAS NO FEED ({allAvailableCategories.length})</span>
                  </h4>
                  <span className="text-[10px] font-mono text-gray-500">
                    Sincronizadas com o feed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {allAvailableCategories.map((item) => {
                    const isTag = item.name.startsWith('#');
                    return (
                      <div
                        key={item.name}
                        className={`p-3 border transition-colors ${
                          isTag 
                            ? 'border-yellow-500/40 bg-yellow-500/5' 
                            : item.source === 'custom'
                            ? 'border-[var(--dedsec-primary)]/40 bg-[var(--dedsec-primary)]/5'
                            : 'border-gray-800 bg-black/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-mono font-bold truncate ${isTag ? 'text-yellow-400' : 'text-white'}`}>
                            {item.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black border border-gray-800 text-gray-400">
                            {item.count} {item.count === 1 ? 'post' : 'posts'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-gray-500">
                          <span>
                            {isTag ? 'Tag Automática de Post' : item.source === 'custom' ? 'Categoria Custom' : 'Categoria Padrão'}
                          </span>
                          <span className="text-[9px] text-[var(--dedsec-primary)]">
                            FILTRO ATIVO
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ===================== TAB 3: SPLASHES & DESTAQUES ===================== */}
          {activeTab === 'splashes' && (
            <div className="space-y-6">
              
              {splashSuccessMsg && (
                <div className="p-3 bg-green-950/60 border border-[var(--dedsec-secondary)] text-[var(--dedsec-secondary)] text-xs font-mono flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{splashSuccessMsg}</span>
                </div>
              )}

              {/* Form 1: Add or Edit Individual Splash */}
              <form onSubmit={handleSaveSplash} className="border border-gray-800 bg-black/60 p-4 clip-cyber-corner space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[var(--dedsec-accent)]" />
                    <span>
                      {editingSplashId ? 'EDITAR SPLASH' : 'CRIAR SPLASH (COM DESTAQUE DE IMAGEM OU VÍDEO)'}
                    </span>
                  </h3>
                  {editingSplashId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSplashId(null);
                        setSplashText('');
                        setSplashMediaUrl('');
                      }}
                      className="text-xs font-mono text-gray-400 hover:text-white"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-300">
                    TEXTO DO SPLASH *
                  </label>
                  <input
                    type="text"
                    required
                    value={splashText}
                    onChange={(e) => setSplashText(e.target.value)}
                    placeholder="Ex: ctOS 2.0 REVERSE ENGAGED. PRIVACY IS AN ILLUSION."
                    className="w-full px-3 py-2 bg-black border border-gray-700 text-white font-mono text-sm focus:border-[var(--dedsec-accent)] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Splash Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-300">TIPO DE SPLASH</label>
                    <select
                      value={splashType}
                      onChange={(e) => setSplashType(e.target.value as 'daily' | 'common')}
                      className="w-full px-3 py-2 bg-black border border-gray-700 text-white font-mono text-xs focus:border-[var(--dedsec-accent)] focus:outline-none"
                    >
                      <option value="daily">Splash Relevante Primeiro do Dia (Topo em Destaque)</option>
                      <option value="common">Splash Comum (Linha / Ticker Feed)</option>
                    </select>
                  </div>

                  {/* Media Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-300">DESTACAR MÍDIA NA PÁGINA</label>
                    <select
                      value={splashMediaType}
                      onChange={(e) => setSplashMediaType(e.target.value as 'none' | 'image' | 'video')}
                      className="w-full px-3 py-2 bg-black border border-gray-700 text-white font-mono text-xs focus:border-[var(--dedsec-accent)] focus:outline-none"
                    >
                      <option value="none">Nenhuma mídia</option>
                      <option value="image">Imagem em Destaque</option>
                      <option value="video">Vídeo em Destaque (YouTube / MP4)</option>
                    </select>
                  </div>
                </div>

                {/* Media URL if chosen */}
                {splashMediaType !== 'none' && (
                  <div className="space-y-1 p-3 bg-black/80 border border-gray-800">
                    <label className="text-xs font-mono text-[var(--dedsec-primary)]">
                      URL DO VÍDEO OU IMAGEM PARA DESTACAR NA PÁGINA
                    </label>
                    <input
                      type="url"
                      value={splashMediaUrl}
                      onChange={(e) => setSplashMediaUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... ou https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 bg-black border border-gray-700 text-white font-mono text-xs focus:border-[var(--dedsec-primary)] focus:outline-none"
                    />
                  </div>
                )}

                {/* ASCII Art Field (Copiável no Splash) */}
                <div className="space-y-2 p-3 bg-black/80 border border-gray-800 clip-cyber-corner">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-mono text-[var(--dedsec-primary)] flex items-center gap-1.5 font-bold">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>ARTE ASCII COPIÁVEL NO SPLASH (OPCIONAL)</span>
                    </label>
                    {splashAsciiArt && (
                      <button
                        type="button"
                        onClick={() => setSplashAsciiArt('')}
                        className="text-[10px] font-mono text-red-400 hover:underline cursor-pointer"
                      >
                        [Limpar ASCII]
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] font-mono text-gray-400">
                    Insira uma arte em caracteres ASCII. Ela será exibida num terminal hacker no topo e terá um botão para qualquer usuário copiar com 1 clique!
                  </p>

                  {/* Presets rápidos de ASCII DedSec */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-gray-500 font-bold">MODELOS RÁPIDOS:</span>
                    {DEDSEC_ASCII_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSplashAsciiArt(p.art);
                          playCyberSound('click', soundEnabled);
                        }}
                        className="text-[10px] font-mono px-2 py-0.5 bg-black border border-gray-700 hover:border-[var(--dedsec-primary)] text-gray-300 hover:text-[var(--dedsec-primary)] transition-colors cursor-pointer"
                      >
                        + {p.name}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={6}
                    value={splashAsciiArt}
                    onChange={(e) => setSplashAsciiArt(e.target.value)}
                    placeholder="Cole ou crie sua arte em texto ASCII aqui..."
                    className="w-full px-3 py-2 bg-black border border-gray-700 text-[var(--dedsec-primary)] font-mono text-xs focus:border-[var(--dedsec-primary)] focus:outline-none leading-tight font-bold"
                  />

                  {splashAsciiArt && (
                    <div className="p-2.5 bg-black border border-[var(--dedsec-primary)]/40 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                        <span className="text-[var(--dedsec-primary)] font-bold flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          PRÉVIA DO TERMINAL COPIÁVEL DEDSEC:
                        </span>
                        <span>{splashAsciiArt.length} caracteres</span>
                      </div>
                      <pre className="font-mono text-[10px] text-[var(--dedsec-primary)] leading-tight overflow-x-auto whitespace-pre p-2 bg-black border border-gray-800 select-all font-bold">
                        {splashAsciiArt}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={splashHighlighted}
                      onChange={(e) => setSplashHighlighted(e.target.checked)}
                      className="w-4 h-4 accent-[var(--dedsec-accent)]"
                    />
                    <span className="text-xs font-mono text-white">
                      Marcar como destaque prioritário na página
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmittingSplash}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--dedsec-accent)] text-white font-display font-bold text-xs hover:bg-pink-600 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{editingSplashId ? 'SALVAR SPLASH' : 'PUBLICAR SPLASH NO FIRESTORE'}</span>
                  </button>
                </div>
              </form>

              {/* Dynamic Splash list (separated by newline) as requested in user prompt */}
              <div className="border border-gray-800 bg-black/60 p-4 clip-cyber-corner space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--dedsec-secondary)]" />
                    <span>TEXTOS SPLASH LISTADOS (SEPARADOS POR QUEBRA DE LINHA)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400">
                    CARREGAMENTO DINÂMICO NO PAINEL
                  </span>
                </div>

                <p className="text-xs font-mono text-gray-400">
                  Edite ou adicione várias frases de splash de uma só vez, uma por linha. Ao clicar em sincronizar, elas são salvas no Firestore e atualizadas na página.
                </p>

                <textarea
                  rows={6}
                  value={bulkSplashText}
                  onChange={(e) => setBulkSplashText(e.target.value)}
                  placeholder="Frase 1 de splash&#10;Frase 2 de splash&#10;Frase 3 de splash"
                  className="w-full px-3 py-2 bg-black border border-gray-700 text-gray-200 font-mono text-xs focus:border-[var(--dedsec-secondary)] focus:outline-none"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-gray-400">TIPO AO IMPORTAR</label>
                    <select
                      value={bulkType}
                      onChange={(e) => setBulkType(e.target.value as 'daily' | 'common')}
                      className="w-full px-2 py-1.5 bg-black border border-gray-700 text-white font-mono text-xs"
                    >
                      <option value="common">Splashes Comuns</option>
                      <option value="daily">Primeiro da Lista vira Splash Relevante</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono text-gray-400">
                      MÍDIA PARA DESTACAR NO PRIMEIRO ITEM (OPCIONAL)
                    </label>
                    <input
                      type="url"
                      value={bulkMediaUrl}
                      onChange={(e) => setBulkMediaUrl(e.target.value)}
                      placeholder="URL de imagem ou vídeo do YouTube para destacar na página"
                      className="w-full px-2 py-1.5 bg-black border border-gray-700 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                {bulkSuccessMsg && (
                  <div className="p-2 bg-green-950/60 border border-[var(--dedsec-secondary)] text-[var(--dedsec-secondary)] text-xs font-mono">
                    {bulkSuccessMsg}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={isImportingBulk}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--dedsec-secondary)] text-black font-display font-bold text-xs hover:bg-lime-400 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isImportingBulk ? 'animate-spin' : ''}`} />
                  <span>SINCRONIZAR TEXTOS SPLASH NO FIRESTORE</span>
                </button>
              </div>

              {/* Splashes Listing Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono text-gray-400 uppercase">
                    SPLASHES ATIVOS NO FIRESTORE ({splashes.length})
                  </h4>

                  <div className="flex items-center gap-1 text-xs font-mono">
                    <button
                      onClick={() => setSplashFilter('all')}
                      className={`px-2 py-1 border ${
                        splashFilter === 'all' ? 'border-[var(--dedsec-primary)] text-[var(--dedsec-primary)]' : 'border-gray-800 text-gray-400'
                      }`}
                    >
                      TODOS
                    </button>
                    <button
                      onClick={() => setSplashFilter('daily')}
                      className={`px-2 py-1 border ${
                        splashFilter === 'daily' ? 'border-[var(--dedsec-accent)] text-[var(--dedsec-accent)]' : 'border-gray-800 text-gray-400'
                      }`}
                    >
                      DO DIA
                    </button>
                    <button
                      onClick={() => setSplashFilter('common')}
                      className={`px-2 py-1 border ${
                        splashFilter === 'common' ? 'border-[var(--dedsec-secondary)] text-[var(--dedsec-secondary)]' : 'border-gray-800 text-gray-400'
                      }`}
                    >
                      COMUNS
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {splashes
                    .filter(s => splashFilter === 'all' || s.type === splashFilter)
                    .map((s) => (
                      <div
                        key={s.id}
                        className="p-3 border border-gray-800 bg-black/40 flex items-center justify-between gap-3 hover:border-gray-700 text-xs font-mono"
                      >
                        <div className="flex-1 truncate">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold border ${
                              s.type === 'daily'
                                ? 'border-[var(--dedsec-accent)] text-[var(--dedsec-accent)] bg-[var(--dedsec-accent)]/10'
                                : 'border-gray-700 text-gray-400'
                            }`}>
                              {s.type === 'daily' ? 'DO DIA' : 'COMUM'}
                            </span>
                            <span className="text-gray-200 truncate">{s.text}</span>
                          </div>

                          {s.mediaUrl && (
                            <div className="flex items-center gap-1 text-[10px] text-[var(--dedsec-primary)] mt-1">
                              {s.mediaType === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                              <span className="truncate max-w-sm">MÍDIA: {s.mediaUrl}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Toggle Highlight button */}
                          <button
                            onClick={async () => {
                              playCyberSound('click', soundEnabled);
                              await updateSplash(s.id, { highlighted: !s.highlighted });
                            }}
                            title={s.highlighted ? 'Remover Destaque da Página' : 'Destacar na Página'}
                            className={`p-1.5 border ${
                              s.highlighted
                                ? 'border-[var(--dedsec-accent)] text-[var(--dedsec-accent)] bg-[var(--dedsec-accent)]/20'
                                : 'border-gray-800 text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => {
                              playCyberSound('click', soundEnabled);
                              setEditingSplashId(s.id);
                              setSplashText(s.text);
                              setSplashType(s.type);
                              setSplashMediaType(s.mediaType || 'none');
                              setSplashMediaUrl(s.mediaUrl || '');
                              setSplashAsciiArt(s.asciiArt || '');
                              setSplashHighlighted(Boolean(s.highlighted));
                            }}
                            className="p-1.5 border border-gray-800 text-gray-400 hover:text-white"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={async () => {
                              playCyberSound('deny', soundEnabled);
                              if (confirm('Excluir este splash do Firestore?')) {
                                await deleteSplash(s.id);
                              }
                            }}
                            className="p-1.5 border border-gray-800 text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

              </div>

            </div>
          )}

          {/* ===================== TAB 3: WALLPAPER & CUSTOMIZAÇÃO ===================== */}
          {activeTab === 'customization' && (
            <div className="space-y-6">
              
              {customizationSaved && (
                <div className="p-3 bg-green-950/60 border border-[var(--dedsec-secondary)] text-[var(--dedsec-secondary)] text-xs font-mono flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Configurações visuais e cores salvas no Firestore!</span>
                </div>
              )}

              {/* Wallpaper Presets */}
              <div className="border border-gray-800 bg-black/60 p-4 clip-cyber-corner space-y-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[var(--dedsec-primary)]" />
                  <span>SELETOR DE WALLPAPER // TEMA WATCH DOGS 2</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRESET_WALLPAPERS.map((wp) => (
                    <div
                      key={wp.id}
                      onClick={() => {
                        playCyberSound('click', soundEnabled);
                        setTempWallpaperUrl(wp.url);
                      }}
                      className={`group relative aspect-video border cursor-pointer overflow-hidden transition-all ${
                        tempWallpaperUrl === wp.url
                          ? 'border-2 border-[var(--dedsec-primary)] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                          : 'border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <img
                        src={wp.url}
                        alt={wp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                        <span className="text-[10px] font-mono text-white font-bold truncate">
                          {wp.title}
                        </span>
                      </div>
                      {tempWallpaperUrl === wp.url && (
                        <div className="absolute top-1 right-1 bg-[var(--dedsec-primary)] text-black p-0.5 font-mono text-[9px] font-bold">
                          ATIVO
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Custom Wallpaper Upload or URL */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[var(--dedsec-primary)]" />
                    <span>CARREGAR ARQUIVO DE WALLPAPER OU INSERIR URL</span>
                  </label>

                  {/* Input de Arquivo (Upload de Imagem para Wallpaper) */}
                  <label className="cursor-pointer block p-3.5 border-2 border-dashed border-gray-700 hover:border-[var(--dedsec-primary)] bg-black/60 text-center transition-all group">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Upload className="w-5 h-5 text-[var(--dedsec-primary)] group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-mono text-white font-bold">
                        {wallpaperFileName ? `Arquivo Carregado: ${wallpaperFileName}` : 'Clique para Carregar Imagem de Wallpaper do Computador'}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        Selecione PNG, JPG, WebP ou GIF do seu dispositivo
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleWallpaperFileUpload(file);
                      }}
                    />
                  </label>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-gray-400">OU INSIRA UMA URL DIRETA DE IMAGEM</label>
                    <input
                      type="url"
                      value={tempWallpaperUrl}
                      onChange={(e) => setTempWallpaperUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-black border border-gray-700 text-white font-mono text-xs focus:border-[var(--dedsec-primary)] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Sliders: Opacity & Blur */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-gray-300">
                      <span>OPACIDADE DO WALLPAPER:</span>
                      <span className="text-[var(--dedsec-primary)] font-bold">{tempWallpaperOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={tempWallpaperOpacity}
                      onChange={(e) => setTempWallpaperOpacity(Number(e.target.value))}
                      className="w-full accent-[var(--dedsec-primary)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-gray-300">
                      <span>DESFOQUE (BLUR):</span>
                      <span className="text-[var(--dedsec-primary)] font-bold">{tempWallpaperBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      value={tempWallpaperBlur}
                      onChange={(e) => setTempWallpaperBlur(Number(e.target.value))}
                      className="w-full accent-[var(--dedsec-primary)]"
                    />
                  </div>
                </div>

              </div>

              {/* LOGOTIPO DEDSEC DO SITE (UPLOAD DE ARQUIVO OU URL) */}
              <div className="border border-gray-800 bg-black/60 p-4 clip-cyber-corner space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[var(--dedsec-primary)]" />
                    <span>LOGOTIPO DO SITE // IDENTIDADE DEDSEC</span>
                  </h3>
                  {tempLogoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempLogoUrl('');
                        setLogoFileName('');
                        playCyberSound('click', soundEnabled);
                      }}
                      className="text-xs font-mono text-red-400 hover:underline cursor-pointer"
                    >
                      [Restaurar Logo DedSec Padrão]
                    </button>
                  )}
                </div>

                <p className="text-xs font-mono text-gray-400">
                  Defina o logotipo oficial da célula DedSec exibido na barra superior de navegação. Você pode carregar um arquivo direto do computador (PNG transparente, SVG, JPG, WebP ou GIF) ou informar uma URL externa.
                </p>

                {/* Prévia do Logotipo */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-black/80 border border-gray-800">
                  <div className="flex flex-col items-center justify-center p-3 border border-[var(--dedsec-primary)] bg-black clip-cyber-badge min-w-[70px] min-h-[70px]">
                    {tempLogoUrl ? (
                      <img
                        src={tempLogoUrl}
                        alt="Preview Logo"
                        className="w-12 h-12 object-contain drop-shadow-[0_0_8px_var(--dedsec-primary)]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=200&auto=format&fit=crop';
                        }}
                      />
                    ) : (
                      <DedsecSkullIcon className="w-10 h-10 text-[var(--dedsec-primary)]" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">STATUS DO LOGOTIPO:</span>
                      <span className={tempLogoUrl ? 'text-[var(--dedsec-secondary)] font-bold' : 'text-[var(--dedsec-primary)] font-bold'}>
                        {tempLogoUrl ? 'LOGOTIPO PERSONALIZADO ATIVO' : 'ÍCONE PADRÃO DEDSEC SKULL VETORIAL'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {tempLogoUrl 
                        ? 'O logotipo selecionado substituirá o ícone padrão na barra de navegação superior.' 
                        : 'Atualmente exibindo o ícone oficial vetorial DedSec Skull.'}
                    </p>
                  </div>
                </div>

                {/* Input de Arquivo (Upload do Logo) */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[var(--dedsec-primary)]" />
                    <span>CARREGAR IMAGEM DO LOGOTIPO DO COMPUTADOR</span>
                  </label>

                  <label className="cursor-pointer block p-3.5 border-2 border-dashed border-gray-700 hover:border-[var(--dedsec-primary)] bg-black text-center transition-all group">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Upload className="w-5 h-5 text-[var(--dedsec-primary)] group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-mono text-white font-bold">
                        {logoFileName ? `Arquivo Carregado: ${logoFileName}` : 'Clique para Selecionar Imagem de Logo (PNG, SVG, JPG, WebP, GIF)'}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">
                        Recomendado: imagem quadrada ou com fundo transparente
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*,.svg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoFileUpload(file);
                      }}
                    />
                  </label>
                </div>

                {/* URL Direta do Logotipo */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-gray-400">OU INSIRA UMA URL DIRETA DE IMAGEM / SVG</label>
                  <input
                    type="url"
                    value={tempLogoUrl}
                    onChange={(e) => setTempLogoUrl(e.target.value)}
                    placeholder="https://exemplo.com/meu-logo.png ou https://.../logo.svg"
                    className="w-full px-3 py-2 bg-black border border-gray-700 text-white font-mono text-xs focus:border-[var(--dedsec-primary)] focus:outline-none"
                  />
                </div>

              </div>

              {/* Fundo da Página e Cores Primárias / Secundárias */}
              <div className="border border-gray-800 bg-black/60 p-4 clip-cyber-corner space-y-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[var(--dedsec-secondary)]" />
                  <span>FUNDO DA PÁGINA, COR PRIMÁRIA E SECUNDÁRIA</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Fundo da Página */}
                  <div className="space-y-2 p-3 border border-gray-800 bg-black">
                    <label className="text-xs font-mono text-gray-300 block">FUNDO DA PÁGINA</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={tempBg}
                        onChange={(e) => setTempBg(e.target.value)}
                        className="w-8 h-8 cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={tempBg}
                        onChange={(e) => setTempBg(e.target.value)}
                        className="w-full px-2 py-1 bg-black border border-gray-700 text-xs font-mono text-white"
                      />
                    </div>
                    <div className="flex gap-1 pt-1">
                      {['#06090e', '#000000', '#0c141f', '#101522'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setTempBg(c)}
                          style={{ backgroundColor: c }}
                          className="w-5 h-5 border border-gray-600 rounded-none hover:scale-110"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Cor Primária */}
                  <div className="space-y-2 p-3 border border-gray-800 bg-black">
                    <label className="text-xs font-mono text-gray-300 block">COR PRIMÁRIA (DEDSEC CYAN)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={tempPrimary}
                        onChange={(e) => setTempPrimary(e.target.value)}
                        className="w-8 h-8 cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={tempPrimary}
                        onChange={(e) => setTempPrimary(e.target.value)}
                        className="w-full px-2 py-1 bg-black border border-gray-700 text-xs font-mono text-white"
                      />
                    </div>
                    <div className="flex gap-1 pt-1">
                      {['#00f0ff', '#38bdf8', '#00e5ff', '#06b6d4'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setTempPrimary(c)}
                          style={{ backgroundColor: c }}
                          className="w-5 h-5 border border-gray-600 rounded-none hover:scale-110"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Cor Secundária */}
                  <div className="space-y-2 p-3 border border-gray-800 bg-black">
                    <label className="text-xs font-mono text-gray-300 block">COR SECUNDÁRIA (LIME / MATRIX)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={tempSecondary}
                        onChange={(e) => setTempSecondary(e.target.value)}
                        className="w-8 h-8 cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={tempSecondary}
                        onChange={(e) => setTempSecondary(e.target.value)}
                        className="w-full px-2 py-1 bg-black border border-gray-700 text-xs font-mono text-white"
                      />
                    </div>
                    <div className="flex gap-1 pt-1">
                      {['#00ff66', '#22c55e', '#10b981', '#ffea00'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setTempSecondary(c)}
                          style={{ backgroundColor: c }}
                          className="w-5 h-5 border border-gray-600 rounded-none hover:scale-110"
                        />
                      ))}
                    </div>
                  </div>

                </div>

                {/* Accent Color (Glitch Magenta / Pink) */}
                <div className="p-3 border border-gray-800 bg-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-mono text-gray-300 block">COR DE ALERTA / GLITCH (ACCENT)</label>
                    <p className="text-[10px] font-mono text-gray-500">Usado em badges e falhas DedSec</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={tempAccent}
                      onChange={(e) => setTempAccent(e.target.value)}
                      className="w-8 h-8 cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={tempAccent}
                      onChange={(e) => setTempAccent(e.target.value)}
                      className="w-28 px-2 py-1 bg-black border border-gray-700 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Save Customization Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveCustomization}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--dedsec-secondary)] text-black font-display font-bold text-xs hover:bg-lime-400 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>SALVAR TEMA & PALETA NO FIRESTORE</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ===================== TAB 4: GERENCIAR ADMINS ===================== */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              
              {adminActionMsg && (
                <div className="p-3 bg-blue-950/60 border border-[var(--dedsec-primary)] text-[var(--dedsec-primary)] text-xs font-mono flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{adminActionMsg}</span>
                </div>
              )}

              {/* Add Admin Form */}
              <form onSubmit={handleAddAdmin} className="border border-gray-800 bg-black/60 p-4 clip-cyber-corner space-y-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-gray-800 pb-2">
                  <UserPlus className="w-4 h-4 text-yellow-400" />
                  <span>ADICIONAR NOVA CONTA ADMINISTRADORA</span>
                </h3>

                <p className="text-xs font-mono text-gray-400">
                  Adicione o email Google de um novo administrador. Ele poderá fazer login com sua conta Google e acessar o painel de publicações e configurações.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-300">EMAIL GOOGLE DO NOVO ADMIN *</label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="agente@gmail.com"
                      className="w-full px-3 py-2 bg-black border border-gray-700 text-white font-mono text-xs focus:border-yellow-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-300">NOME / CODINOME (OPCIONAL)</label>
                    <input
                      type="text"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="Codinome do Operador"
                      className="w-full px-3 py-2 bg-black border border-gray-700 text-white font-mono text-xs focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingAdmin}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black font-display font-bold text-xs hover:bg-yellow-300 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>ADICIONAR ADMIN NO FIRESTORE</span>
                  </button>
                </div>
              </form>

              {/* Admins List */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono text-gray-400 uppercase">
                  CONTAS ADMINISTRADORAS REGISTRADAS ({admins.length})
                </h4>

                <div className="space-y-2">
                  {admins.map((adm) => {
                    const isRoot = adm.email.toLowerCase() === OWNER_EMAIL.toLowerCase();

                    return (
                      <div
                        key={adm.email}
                        className={`p-3 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono ${
                          isRoot
                            ? 'border-yellow-500/60 bg-yellow-500/5'
                            : 'border-gray-800 bg-black/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 border ${isRoot ? 'border-yellow-400 text-yellow-400' : 'border-gray-700 text-gray-400'}`}>
                            <Users className="w-4 h-4" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold">
                                {isRoot ? 'ROOT_OPERATIVE [IDENTIDADE ENCRIPTADA]' : adm.email}
                              </span>
                              {isRoot ? (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-400/20 text-yellow-400 border border-yellow-400">
                                  PROPRIETÁRIO ROOT (INVIOLÁVEL)
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-gray-800 text-gray-300 border border-gray-700">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              {adm.name && `Codinome: ${adm.name} • `}
                              {adm.addedAt ? `Registrado: ${new Date(adm.addedAt).toLocaleDateString()}` : 'Registrado pelo Sistema'}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div>
                          {isRoot ? (
                            <span className="text-[10px] font-mono text-gray-500 px-2 py-1 bg-black border border-gray-800">
                              PROTEGIDO
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRemoveAdmin(adm.email)}
                              title="Remover Permissões de Admin"
                              className="flex items-center gap-1 px-2.5 py-1 text-red-400 hover:text-white bg-black border border-red-900 hover:border-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>REMOVER</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Terminal Footer */}
        <div className="px-5 py-3 border-t border-gray-800 bg-black flex items-center justify-between text-xs font-mono text-gray-500">
          <span>FIREBASE FIRESTORE SYNC: ONLINE</span>
          <button
            onClick={() => {
              playCyberSound('click', soundEnabled);
              onClearEditingPost();
              onClose();
            }}
            className="px-3 py-1 bg-gray-900 border border-gray-700 text-gray-300 hover:text-white"
          >
            FECHAR TERMINAL
          </button>
        </div>

      </div>

    </div>
  );
};
