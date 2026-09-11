import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { getEmbedVideoUrl, isDirectVideoUrl } from '../utils/media';

interface MediaViewerModalProps {
  media: { url: string; type: 'image' | 'video'; title?: string } | null;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ media, onClose }) => {
  if (!media) return null;

  const { isYoutube, embedUrl } = getEmbedVideoUrl(media.url);
  const isDirectVideo = isDirectVideoUrl(media.url);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl w-full border-2 border-[var(--dedsec-primary)] bg-black p-2 clip-cyber-corner shadow-[0_0_50px_rgba(0,240,255,0.3)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 text-xs font-mono text-gray-300">
          <span className="text-[var(--dedsec-primary)] font-bold truncate max-w-md">
            {media.title || 'DEDSEC OPTICAL SURVEILLANCE FEED'}
          </span>
          <div className="flex items-center gap-3">
            <a
              href={media.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[var(--dedsec-secondary)] flex items-center gap-1"
            >
              <span>ORIGINAL</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white border border-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewer */}
        <div className="p-2 flex items-center justify-center min-h-[300px] max-h-[80vh]">
          {media.type === 'video' ? (
            isYoutube ? (
              <div className="aspect-video w-full">
                <iframe
                  src={embedUrl}
                  title="Vídeo Expandido"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ) : isDirectVideo ? (
              <video src={embedUrl} controls autoPlay className="max-h-[75vh] w-auto max-w-full" />
            ) : (
              <div className="p-10 text-center">
                <p className="text-white mb-4">Feed de Vídeo Externo</p>
                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[var(--dedsec-primary)] text-black font-bold font-mono text-xs"
                >
                  Abrir link em nova aba
                </a>
              </div>
            )
          ) : (
            <img
              src={media.url}
              alt={media.title || 'Visualização DedSec'}
              className="max-h-[75vh] w-auto max-w-full object-contain mx-auto"
            />
          )}
        </div>
      </div>
    </div>
  );
};
