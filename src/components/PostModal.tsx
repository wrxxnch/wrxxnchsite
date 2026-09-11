import React, { useState } from 'react';
import { X, Calendar, User, Star, Tag, Share2, Image as ImageIcon, Video, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { Post } from '../types';
import { getEmbedVideoUrl, isDirectVideoUrl } from '../utils/media';
import { playCyberSound } from '../utils/audio';

interface PostModalProps {
  post: Post | null;
  onClose: () => void;
  soundEnabled: boolean;
  onOpenMediaModal: (url: string, type: 'image' | 'video', title?: string) => void;
}

export const PostModal: React.FC<PostModalProps> = ({
  post,
  onClose,
  soundEnabled,
  onOpenMediaModal
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  if (!post) return null;

  const { isYoutube, embedUrl } = getEmbedVideoUrl(post.mediaUrl);
  const isDirectVideo = isDirectVideoUrl(post.mediaUrl);
  const isBlurred = Boolean(post.blurCover) && !isRevealed;
  const hasBlurText = Boolean(post.blurText && post.blurText.trim().length > 0);

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'DATA_SEC';

  const handleShare = () => {
    playCyberSound('click', soundEnabled);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Link da transmissão copiado para a área de transferência!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      
      <div className="relative w-full max-w-3xl my-8 border-2 border-[var(--dedsec-primary)] bg-[var(--dedsec-surface)] clip-cyber-corner shadow-[0_0_35px_rgba(0,240,255,0.25)]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-black/60">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[var(--dedsec-primary)] animate-ping" />
            <span className="text-[var(--dedsec-primary)] font-bold">TRANSMISSÃO_DEDSEC // ID: {post.id.slice(0, 8)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Compartilhar Link"
              className="p-1.5 text-gray-400 hover:text-[var(--dedsec-primary)] border border-gray-800 hover:border-[var(--dedsec-primary)] transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                playCyberSound('click', soundEnabled);
                onClose();
              }}
              className="p-1.5 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-400">
            <span className="px-2.5 py-1 bg-black border border-[var(--dedsec-primary)] text-[var(--dedsec-primary)] font-bold">
              [{post.category || 'TRANSMISSÃO'}]
            </span>

            {post.highlighted && (
              <span className="flex items-center gap-1 px-2 py-1 bg-[var(--dedsec-accent)]/20 border border-[var(--dedsec-accent)] text-[var(--dedsec-accent)] font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>DESTAQUE DA REDE</span>
              </span>
            )}

            <div className="flex items-center gap-1 text-gray-300">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-1 text-gray-300">
              <User className="w-3.5 h-3.5 text-[var(--dedsec-secondary)]" />
              <span>{post.authorName || 'OPERADOR DEDSEC'}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white leading-tight">
            {post.title}
          </h1>

          {/* Media Renderer */}
          {post.mediaUrl && post.mediaType !== 'none' && (
            <div className="relative border border-[var(--dedsec-border)] bg-black overflow-hidden">
              <div className={isBlurred ? 'filter blur-lg select-none pointer-events-none transition-all duration-500' : 'transition-all duration-500'}>
                {post.mediaType === 'video' ? (
                  isYoutube ? (
                    <div className="aspect-video w-full">
                      <iframe
                        src={embedUrl}
                        title={post.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : isDirectVideo ? (
                    <div className="aspect-video w-full flex items-center justify-center bg-black">
                      <video src={embedUrl} controls={!isBlurred} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <Video className="w-12 h-12 text-[var(--dedsec-primary)] mx-auto mb-2" />
                      <a
                        href={post.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-[var(--dedsec-primary)] underline"
                      >
                        Abrir Link do Vídeo em Nova Janela
                      </a>
                    </div>
                  )
                ) : (
                  <div 
                    className="cursor-pointer group relative"
                    onClick={() => {
                      if (!isBlurred) {
                        onOpenMediaModal(post.mediaUrl!, 'image', post.title);
                      }
                    }}
                  >
                    <img
                      src={post.mediaUrl}
                      alt={post.title}
                      className="w-full max-h-[450px] object-contain mx-auto bg-black"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop';
                      }}
                    />
                    {!isBlurred && (
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-xs font-mono text-[var(--dedsec-primary)] border border-gray-700 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Clique para modo tela cheia</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Blur Overlay no Modal */}
              {post.blurCover && (
                <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-6 transition-all duration-300 ${
                  isBlurred ? 'bg-black/60 backdrop-blur-[2px]' : 'pointer-events-none'
                }`}>
                  {isBlurred ? (
                    <div className="flex flex-col items-center gap-3 text-center pointer-events-auto">
                      {hasBlurText && (
                        <div className="px-4 py-2 bg-black/90 border-2 border-[var(--dedsec-accent)] text-[var(--dedsec-accent)] font-mono font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(255,0,85,0.4)] flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-[var(--dedsec-accent)]" />
                          <span className="uppercase">{post.blurText?.trim()}</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          playCyberSound('click', soundEnabled);
                          setIsRevealed(true);
                        }}
                        className="px-4 py-2 bg-black/90 hover:bg-[var(--dedsec-primary)] text-gray-200 hover:text-black border border-gray-700 hover:border-[var(--dedsec-primary)] text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                      >
                        <Eye className="w-4 h-4" />
                        <span>CLIQUE PARA REVELAR MÍDIA</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        playCyberSound('click', soundEnabled);
                        setIsRevealed(false);
                      }}
                      title="Ocultar/Desfocar Mídia"
                      className="absolute top-3 right-3 pointer-events-auto px-2.5 py-1 bg-black/80 hover:bg-black border border-gray-700 text-gray-400 hover:text-white text-xs font-mono flex items-center gap-1"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>OCULTAR</span>
                    </button>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Content */}
          <div className="text-gray-200 font-sans text-base leading-relaxed whitespace-pre-line border-l-2 border-[var(--dedsec-primary)]/40 pl-4 py-1">
            {post.content}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-800">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              {post.tags.map((tag, i) => (
                <span 
                  key={i} 
                  className="text-xs font-mono px-2 py-0.5 bg-black border border-gray-700 text-gray-300"
                >
                  #{tag.replace(/^#/, '')}
                </span>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-800 bg-black/60 text-xs font-mono text-gray-400">
          <span>ctOS ARCHIVE SECURE PROTOCOL</span>
          <button
            onClick={() => {
              playCyberSound('click', soundEnabled);
              onClose();
            }}
            className="px-4 py-1.5 bg-black border border-gray-600 text-white hover:border-[var(--dedsec-primary)] transition-colors"
          >
            FECHAR [ESC]
          </button>
        </div>

      </div>

    </div>
  );
};
