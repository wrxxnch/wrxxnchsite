import React, { useState } from 'react';
import { ShieldAlert, Trash2, Edit3, Image as ImageIcon, Video, Star, ExternalLink, Calendar, User, Eye, EyeOff } from 'lucide-react';
import { Post } from '../types';
import { getEmbedVideoUrl, isDirectVideoUrl } from '../utils/media';
import { playCyberSound } from '../utils/audio';

interface PostCardProps {
  post: Post;
  isAdmin: boolean;
  soundEnabled: boolean;
  onReadPost: (post: Post) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onOpenMediaModal: (url: string, type: 'image' | 'video', title?: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isAdmin,
  soundEnabled,
  onReadPost,
  onEditPost,
  onDeletePost,
  onOpenMediaModal
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const { isYoutube, embedUrl } = getEmbedVideoUrl(post.mediaUrl);
  const isDirectVideo = isDirectVideoUrl(post.mediaUrl);

  const isBlurred = Boolean(post.blurCover) && !isRevealed;
  const hasBlurText = Boolean(post.blurText && post.blurText.trim().length > 0);

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'DATA_SEC';

  return (
    <article 
      className={`group relative flex flex-col justify-between border transition-all duration-300 bg-[var(--dedsec-surface)]/90 backdrop-blur-sm overflow-hidden clip-cyber-corner ${
        post.highlighted
          ? 'border-[var(--dedsec-primary)] shadow-[0_0_20px_rgba(0,240,255,0.18)]'
          : 'border-[var(--dedsec-border)] hover:border-[var(--dedsec-primary)]/80 hover:shadow-[0_0_15px_rgba(0,240,255,0.1)]'
      }`}
    >
      {/* Corner Accent Decorator */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
        <div className={`absolute transform rotate-45 bg-[var(--dedsec-primary)] text-[8px] font-bold text-black text-center py-0.5 right-[-24px] top-[6px] w-[70px] ${
          post.highlighted ? 'bg-[var(--dedsec-accent)] text-white' : ''
        }`}>
          {post.highlighted ? 'PRIORITÁRIO' : 'FEED'}
        </div>
      </div>

      {/* Card Header */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] font-mono">
          
          {/* Category */}
          <span className="px-2 py-0.5 bg-black border border-[var(--dedsec-primary)] text-[var(--dedsec-primary)] font-bold">
            [{post.category || 'TRANSMISSÃO'}]
          </span>

          {/* Highlight Badge */}
          {post.highlighted && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[var(--dedsec-accent)]/20 border border-[var(--dedsec-accent)] text-[var(--dedsec-accent)] font-bold">
              <Star className="w-3 h-3 fill-current" />
              <span>DESTAQUE</span>
            </span>
          )}

          {/* Date */}
          <span className="flex items-center gap-1 text-gray-400 text-[10px] ml-auto">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => {
            playCyberSound('terminal', soundEnabled);
            onReadPost(post);
          }}
          className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-[var(--dedsec-primary)] transition-colors cursor-pointer line-clamp-2"
        >
          {post.title}
        </h3>
      </div>

      {/* Media Preview (If provided) */}
      {post.mediaUrl && post.mediaType !== 'none' && (
        <div className="relative w-full bg-black border-y border-gray-800 overflow-hidden">
          
          {/* Media Content with Blur support */}
          <div className={isBlurred ? 'filter blur-md scale-105 select-none pointer-events-none transition-all duration-500' : 'transition-all duration-500'}>
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
                <div 
                  onClick={() => !isBlurred && onOpenMediaModal(post.mediaUrl!, 'video', post.title)}
                  className="aspect-video w-full flex flex-col items-center justify-center bg-black/80 cursor-pointer group/vid"
                >
                  <Video className="w-10 h-10 text-[var(--dedsec-primary)] group-hover/vid:scale-110 transition-transform" />
                  <span className="text-xs font-mono text-gray-300 mt-2">Clique para Assistir Vídeo</span>
                </div>
              )
            ) : (
              <div 
                onClick={() => {
                  if (!isBlurred) {
                    playCyberSound('click', soundEnabled);
                    onOpenMediaModal(post.mediaUrl!, 'image', post.title);
                  }
                }}
                className="aspect-video w-full overflow-hidden cursor-pointer relative"
              >
                <img
                  src={post.mediaUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop';
                  }}
                />
                {!isBlurred && (
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 text-[10px] font-mono text-[var(--dedsec-primary)] border border-[var(--dedsec-primary)]/40 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>EXPANDIR</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Blur Overlay (Quando ativo) */}
          {post.blurCover && (
            <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-4 transition-all duration-300 ${
              isBlurred ? 'bg-black/50 backdrop-blur-[2px]' : 'pointer-events-none'
            }`}>
              {isBlurred ? (
                <div className="flex flex-col items-center gap-3 text-center pointer-events-auto">
                  {/* Se houver texto definido pelo usuário, renderiza o badge. Se estiver sem nada, não renderiza texto! */}
                  {hasBlurText && (
                    <div className="px-3.5 py-1.5 bg-black/90 border-2 border-[var(--dedsec-accent)] text-[var(--dedsec-accent)] font-mono font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(255,0,85,0.4)] flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[var(--dedsec-accent)] flex-shrink-0" />
                      <span className="uppercase">{post.blurText?.trim()}</span>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playCyberSound('click', soundEnabled);
                      setIsRevealed(true);
                    }}
                    className="px-3 py-1.5 bg-black/90 hover:bg-[var(--dedsec-primary)] text-gray-200 hover:text-black border border-gray-700 hover:border-[var(--dedsec-primary)] text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>REVELAR CAPA</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playCyberSound('click', soundEnabled);
                    setIsRevealed(false);
                  }}
                  title="Ocultar/Desfocar Capa"
                  className="absolute top-2 right-2 pointer-events-auto px-2 py-1 bg-black/80 hover:bg-black border border-gray-700 text-gray-400 hover:text-white text-[10px] font-mono flex items-center gap-1"
                >
                  <EyeOff className="w-3 h-3" />
                  <span>OCULTAR</span>
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* Snippet Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed font-sans mb-4">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag, i) => (
              <span 
                key={i} 
                className="text-[10px] font-mono px-1.5 py-0.5 bg-black/60 border border-gray-800 text-gray-400 group-hover:border-[var(--dedsec-primary)]/40 transition-colors"
              >
                #{tag.replace(/^#/, '')}
              </span>
            ))}
          </div>
        )}

        {/* Card Footer */}
        <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between gap-2 text-xs font-mono">
          
          {/* Author */}
          <div className="flex items-center gap-1.5 text-gray-400 truncate max-w-[180px]">
            <User className="w-3.5 h-3.5 text-[var(--dedsec-secondary)]" />
            <span className="truncate">
              {post.authorName || 'OPERADOR DEDSEC'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            
            {/* Admin Controls */}
            {isAdmin && (
              <>
                <button
                  onClick={() => {
                    playCyberSound('click', soundEnabled);
                    onEditPost(post);
                  }}
                  title="Editar Post"
                  className="p-1.5 text-gray-400 hover:text-[var(--dedsec-primary)] hover:bg-black border border-transparent hover:border-[var(--dedsec-primary)] transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    playCyberSound('deny', soundEnabled);
                    if (confirm(`Excluir a transmissão "${post.title}" permanentemente?`)) {
                      onDeletePost(post.id);
                    }
                  }}
                  title="Excluir Post"
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-black border border-transparent hover:border-red-600 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Read more button */}
            <button
              onClick={() => {
                playCyberSound('terminal', soundEnabled);
                onReadPost(post);
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-black border border-gray-700 text-gray-200 hover:border-[var(--dedsec-primary)] hover:text-[var(--dedsec-primary)] text-xs transition-colors"
            >
              <span>LER</span>
              <ExternalLink className="w-3 h-3" />
            </button>

          </div>

        </div>

      </div>

    </article>
  );
};
