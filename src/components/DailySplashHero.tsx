import React, { useState } from 'react';
import { Radio, Sparkles, Video, Image as ImageIcon, Terminal, Copy, Check, Shuffle, RotateCcw, Maximize2, Play } from 'lucide-react';
import { SplashItem } from '../types';
import { getEmbedVideoUrl, isDirectVideoUrl } from '../utils/media';
import { playCyberSound } from '../utils/audio';

interface DailySplashHeroProps {
  dailySplash: SplashItem | null;
  highlightedSplash: SplashItem | null;
  splashes?: SplashItem[];
  soundEnabled: boolean;
  onOpenMediaModal: (url: string, type: 'image' | 'video', title?: string) => void;
  isAdmin: boolean;
  onOpenAdminPanel: () => void;
}

export const DailySplashHero: React.FC<DailySplashHeroProps> = ({
  dailySplash,
  highlightedSplash,
  splashes = [],
  soundEnabled,
  onOpenMediaModal,
  isAdmin,
  onOpenAdminPanel
}) => {
  const [copiedAscii, setCopiedAscii] = useState(false);
  const [adminRandomSplashIndex, setAdminRandomSplashIndex] = useState<number | null>(null);

  // Determine active splash: admin override random splash > daily splash > highlighted splash > first available splash
  const isRandomActive = adminRandomSplashIndex !== null && splashes && splashes.length > 0 && adminRandomSplashIndex < splashes.length;
  const activeSplash = isRandomActive 
    ? splashes[adminRandomSplashIndex!] 
    : (dailySplash || highlightedSplash || (splashes.length > 0 ? splashes[0] : null));

  const mediaUrl = activeSplash?.mediaUrl;
  const mediaType = activeSplash?.mediaType || (mediaUrl ? 'image' : 'none');

  const { isYoutube, embedUrl } = getEmbedVideoUrl(mediaUrl);
  const isDirectVideo = isDirectVideoUrl(mediaUrl);

  const handleCopyAscii = (textToCopy: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    playCyberSound('terminal', soundEnabled);
    setCopiedAscii(true);
    setTimeout(() => setCopiedAscii(false), 2500);
  };

  const handleNextRandomSplash = () => {
    if (!splashes || splashes.length === 0) return;
    playCyberSound('glitch', soundEnabled);

    if (splashes.length === 1) {
      setAdminRandomSplashIndex(0);
      return;
    }

    // Pick a random index different from current
    let nextIdx = Math.floor(Math.random() * splashes.length);
    if (adminRandomSplashIndex !== null && nextIdx === adminRandomSplashIndex) {
      nextIdx = (nextIdx + 1) % splashes.length;
    }
    setAdminRandomSplashIndex(nextIdx);
  };

  const handleResetToDaily = () => {
    playCyberSound('click', soundEnabled);
    setAdminRandomSplashIndex(null);
  };

  return (
    <section className="relative w-full border border-[var(--dedsec-border)] bg-[var(--dedsec-surface)]/80 backdrop-blur-sm clip-cyber-corner p-4 sm:p-6 mb-8 overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* Cyber Corner Decals */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-[var(--dedsec-primary)]" />
      <div className="absolute top-0 right-0 w-2 h-2 bg-[var(--dedsec-accent)]" />
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-[var(--dedsec-secondary)]" />
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left: Broadcast Text & Meta */}
        <div className="flex-1 space-y-3 w-full">
          
          {/* Status Bar with Admin Next Random Splash Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--dedsec-accent)]/20 border border-[var(--dedsec-accent)] text-[var(--dedsec-accent)] font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>{isRandomActive ? 'TESTE ADMIN // SPLASH SORTEADO' : 'SPLASH RELEVANTE DO DIA'}</span>
              </span>

              {activeSplash?.date && (
                <span className="px-2 py-0.5 bg-black/60 border border-gray-700 text-gray-300">
                  DATE: {activeSplash.date}
                </span>
              )}

              {mediaUrl && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--dedsec-primary)]/10 border border-[var(--dedsec-primary)] text-[var(--dedsec-primary)]">
                  {mediaType === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                  <span>MÍDIA EM DESTAQUE NA PÁGINA</span>
                </span>
              )}
            </div>

            {/* Admin Random Splash Button */}
            {isAdmin && splashes && splashes.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleNextRandomSplash}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-black/80 hover:bg-[var(--dedsec-primary)] hover:text-black text-[var(--dedsec-primary)] border border-[var(--dedsec-primary)] font-mono text-xs font-bold transition-all clip-cyber-badge cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  title="Sortear e visualizar o próximo splash aleatório cadastrado"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>PRÓXIMO SPLASH ALEATÓRIO ({splashes.length})</span>
                </button>

                {isRandomActive && (
                  <button
                    type="button"
                    onClick={handleResetToDaily}
                    className="flex items-center gap-1 px-2 py-1 bg-black/60 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-700 text-xs font-mono transition-colors cursor-pointer"
                    title="Voltar ao splash original do dia"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>VOLTAR AO DO DIA</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Main Splash Content: Text and/or ASCII Art */}
          {activeSplash ? (
            <div className="space-y-3 pt-1">
              
              {/* Text is only rendered if provided; not mandatory when ASCII is present */}
              {activeSplash.text && activeSplash.text.trim() && (
                <p className="font-display font-bold text-lg sm:text-xl md:text-2xl text-white tracking-wide leading-snug">
                  &ldquo;{activeSplash.text.trim()}&rdquo;
                </p>
              )}

              <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                <span className="text-[var(--dedsec-secondary)]">#</span>
                <span>
                  {activeSplash.asciiArt && !activeSplash.text?.trim()
                    ? 'TRANSMISSÃO VISUAL ASCII DEDSEC // CANAL 01'
                    : 'TRANSMISSÃO CRIPTOGRAFADA DEDSEC // CANAL 01'}
                </span>
                {activeSplash.type && (
                  <span className="px-1.5 py-0.5 bg-black/70 border border-gray-800 text-[10px] uppercase text-gray-400">
                    MODO: {activeSplash.type}
                  </span>
                )}
              </div>

              {/* Arte ASCII no Splash - Aparece aqui com destaque supremo e botão de cópia */}
              {activeSplash.asciiArt && activeSplash.asciiArt.trim() && (
                <div className="mt-2 p-3.5 bg-black/95 border-2 border-[var(--dedsec-primary)]/70 clip-cyber-corner space-y-2.5 group shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <div className="flex flex-wrap items-center justify-between border-b border-gray-800 pb-2 gap-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--dedsec-primary)]">
                      <Terminal className="w-4 h-4 animate-pulse text-[var(--dedsec-primary)]" />
                      <span className="font-bold tracking-wider">TERMINAL VISUAL // ARTE ASCII DEDSEC</span>
                      <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">
                        [{activeSplash.asciiArt.split('\n').length} linhas]
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyAscii(activeSplash.asciiArt!)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-[var(--dedsec-primary)] text-black hover:bg-cyan-300 transition-all clip-cyber-badge cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                      title="Copiar arte ASCII completa para a área de transferência"
                    >
                      {copiedAscii ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>ARTE COPIADA COM SUCESSO!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPIAR ARTE ASCII</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Visualização limpa da arte ASCII */}
                  <pre className="font-mono text-[10px] sm:text-xs text-[var(--dedsec-primary)] leading-tight overflow-x-auto p-3 bg-black/90 border border-gray-800/90 select-all hover:border-[var(--dedsec-primary)]/60 transition-colors font-bold whitespace-pre block max-h-72">
                    {activeSplash.asciiArt}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-display font-semibold text-base sm:text-lg text-gray-300">
                Nenhum splash relevante publicado para hoje.
              </p>
              {isAdmin ? (
                <button
                  onClick={() => {
                    playCyberSound('terminal', soundEnabled);
                    onOpenAdminPanel();
                  }}
                  className="text-xs font-mono text-[var(--dedsec-primary)] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Publicar Splash Relevante com Imagem, Vídeo ou Arte ASCII no Painel Admin →</span>
                </button>
              ) : (
                <p className="text-xs font-mono text-gray-500">
                  Aguardando sinal do operador DedSec.
                </p>
              )}
            </div>
          )}

        </div>

        {/* Right: Highlighted Media Display on Page */}
        {mediaUrl && (
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="relative border-2 border-[var(--dedsec-primary)] bg-black p-1 group shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              
              {/* Media Tag HUD */}
              <div className="absolute top-2 left-2 z-10 bg-black/80 px-2 py-0.5 border border-white/20 text-[10px] font-mono text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>{mediaType === 'video' ? 'ctOS VIDEO STREAM' : 'ctOS SURVEILLANCE STILL'}</span>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => {
                  playCyberSound('click', soundEnabled);
                  onOpenMediaModal(mediaUrl, mediaType === 'video' ? 'video' : 'image', activeSplash?.text);
                }}
                title="Expandir Mídia"
                className="absolute top-2 right-2 z-10 p-1.5 bg-black/80 border border-white/30 text-white hover:border-[var(--dedsec-primary)] hover:text-[var(--dedsec-primary)] transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Video or Image Renderer */}
              {mediaType === 'video' ? (
                isYoutube ? (
                  <div className="aspect-video w-full relative">
                    <iframe
                      src={embedUrl}
                      title="Vídeo em Destaque"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : isDirectVideo ? (
                  <div className="aspect-video w-full relative bg-black flex items-center justify-center">
                    <video
                      src={embedUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full relative bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
                    <Video className="w-8 h-8 text-[var(--dedsec-primary)] mb-2 animate-bounce" />
                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--dedsec-primary)] underline hover:text-white"
                    >
                      Acessar Feed de Vídeo Externo
                    </a>
                  </div>
                )
              ) : (
                <div 
                  className="aspect-video w-full relative overflow-hidden cursor-pointer"
                  onClick={() => {
                    playCyberSound('click', soundEnabled);
                    onOpenMediaModal(mediaUrl, 'image', activeSplash?.text);
                  }}
                >
                  <img
                    src={mediaUrl}
                    alt="Destaque da Página"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-xs font-mono text-[var(--dedsec-primary)]">
                      CLIQUE PARA AMPLIAR [DEDSEC OPTICAL]
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom HUD Bar */}
              <div className="px-2 py-1 bg-black text-[9px] font-mono text-gray-400 flex justify-between border-t border-gray-800">
                <span>TARGET: SF_METRO_FEED</span>
                <span className="text-[var(--dedsec-secondary)]">DECRYPTED 100%</span>
              </div>

            </div>
          </div>
        )}

      </div>

    </section>
  );
};
