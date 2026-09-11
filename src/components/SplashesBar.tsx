import React, { useState } from 'react';
import { Radio, MessageSquareCode, Image as ImageIcon, Video, Star, ChevronRight, Terminal, Copy, Check } from 'lucide-react';
import { SplashItem } from '../types';
import { playCyberSound } from '../utils/audio';

interface SplashesBarProps {
  splashes: SplashItem[];
  soundEnabled: boolean;
  onSelectSplash: (splash: SplashItem) => void;
  onOpenMediaModal: (url: string, type: 'image' | 'video', title?: string) => void;
}

export const SplashesBar: React.FC<SplashesBarProps> = ({
  splashes,
  soundEnabled,
  onSelectSplash,
  onOpenMediaModal
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'common'>('daily');
  const [expandedAsciiId, setExpandedAsciiId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const dailySplashes = splashes.filter(s => s.type === 'daily');
  const commonSplashes = splashes.filter(s => s.type === 'common');

  const currentList = activeTab === 'daily' ? dailySplashes : commonSplashes;

  const handleCopySplashAscii = (e: React.MouseEvent, id: string, art: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(art);
    playCyberSound('terminal', soundEnabled);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full border border-[var(--dedsec-border)] bg-black/70 backdrop-blur-sm mb-8">
      
      {/* Tabs Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--dedsec-border)] px-4 py-2 bg-[var(--dedsec-surface)]/60">
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Tab: Splash Relevante Primeiro do Dia */}
          <button
            onClick={() => {
              playCyberSound('click', soundEnabled);
              setActiveTab('daily');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold transition-all border ${
              activeTab === 'daily'
                ? 'border-[var(--dedsec-accent)] bg-[var(--dedsec-accent)]/15 text-[var(--dedsec-accent)] shadow-[0_0_10px_rgba(255,0,85,0.2)]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${activeTab === 'daily' ? 'animate-pulse' : ''}`} />
            <span>SPLASH RELEVANTE DO DIA</span>
            <span className="ml-1 text-[10px] px-1 bg-black/60 rounded">
              {dailySplashes.length}
            </span>
          </button>

          {/* Tab: Splashes Comuns */}
          <button
            onClick={() => {
              playCyberSound('click', soundEnabled);
              setActiveTab('common');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold transition-all border ${
              activeTab === 'common'
                ? 'border-[var(--dedsec-primary)] bg-[var(--dedsec-primary)]/15 text-[var(--dedsec-primary)] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <MessageSquareCode className="w-3.5 h-3.5" />
            <span>SPLASHES COMUNS</span>
            <span className="ml-1 text-[10px] px-1 bg-black/60 rounded">
              {commonSplashes.length}
            </span>
          </button>

        </div>

        <div className="text-[10px] font-mono text-gray-500 hidden md:block">
          CANAL DEDSEC FEED // {currentList.length} ITENS TRANSMITIDOS
        </div>
      </div>

      {/* Tab Content / List */}
      <div className="p-3 sm:p-4 max-h-64 overflow-y-auto space-y-2">
        {currentList.length === 0 ? (
          <div className="text-center py-6 text-xs font-mono text-gray-500 border border-dashed border-gray-800">
            [ NENHUM SPLASH NESTA CATEGORIA ]
          </div>
        ) : (
          currentList.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`border transition-all flex flex-col ${
                item.highlighted
                  ? 'border-[var(--dedsec-primary)]/60 bg-[var(--dedsec-primary)]/5 hover:bg-[var(--dedsec-primary)]/10'
                  : 'border-gray-800 bg-black/40 hover:border-gray-600 hover:bg-black/70'
              }`}
            >
              <div 
                onClick={() => {
                  playCyberSound('terminal', soundEnabled);
                  onSelectSplash(item);
                }}
                className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 font-bold">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <div>
                    <p className="text-sm font-display font-medium text-gray-200 group-hover:text-white transition-colors">
                      {item.text && item.text.trim() ? item.text : (item.asciiArt ? '[TRANSMISSÃO DE ARTE ASCII DEDSEC]' : '[SPLASH SEM TEXTO]')}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-gray-400">
                      <span>{item.date || 'DATA_SEC'}</span>
                      {item.highlighted && (
                        <span className="text-[var(--dedsec-accent)] flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          DESTAQUE
                        </span>
                      )}
                      {item.asciiArt && (
                        <span className="px-1 py-0.5 bg-[var(--dedsec-primary)]/15 border border-[var(--dedsec-primary)] text-[var(--dedsec-primary)] font-bold text-[9px]">
                          ARTE ASCII
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Media & ASCII Tag Controls */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {item.asciiArt && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playCyberSound('click', soundEnabled);
                        setExpandedAsciiId(expandedAsciiId === item.id ? null : item.id);
                      }}
                      className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 bg-black border border-[var(--dedsec-primary)] text-[var(--dedsec-primary)] hover:bg-[var(--dedsec-primary)] hover:text-black transition-colors"
                      title="Exibir e copiar arte ASCII"
                    >
                      <Terminal className="w-3 h-3" />
                      <span>{expandedAsciiId === item.id ? 'FECHAR ASCII' : 'VER ASCII'}</span>
                    </button>
                  )}

                  {item.mediaUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playCyberSound('click', soundEnabled);
                        onOpenMediaModal(
                          item.mediaUrl!,
                          item.mediaType === 'video' ? 'video' : 'image',
                          item.text
                        );
                      }}
                      className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 bg-black border border-[var(--dedsec-secondary)] text-[var(--dedsec-secondary)] hover:bg-[var(--dedsec-secondary)] hover:text-black transition-colors"
                    >
                      {item.mediaType === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                      <span>VER MÍDIA</span>
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[var(--dedsec-primary)] transition-colors" />
                </div>
              </div>

              {/* Expandable ASCII Art Drawer */}
              {item.asciiArt && expandedAsciiId === item.id && (
                <div className="px-3 pb-3 pt-2 border-t border-gray-800 bg-black/95 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[var(--dedsec-primary)] flex items-center gap-1 font-bold">
                      <Terminal className="w-3 h-3" />
                      ARTE ASCII COPIÁVEL DEDSEC
                    </span>
                    <button
                      onClick={(e) => handleCopySplashAscii(e, item.id, item.asciiArt!)}
                      className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 bg-[var(--dedsec-primary)] text-black font-bold hover:bg-cyan-300 transition-colors cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>COPIADO!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>COPIAR ARTE ASCII</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="font-mono text-[10px] text-[var(--dedsec-primary)] leading-tight overflow-x-auto p-2 bg-black border border-gray-800 select-all font-bold whitespace-pre">
                    {item.asciiArt}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
