import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Check, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  ZoomIn, 
  ZoomOut, 
  Crop, 
  Maximize, 
  Minimize, 
  RefreshCw,
  Sparkles,
  Grid
} from 'lucide-react';
import { playCyberSound } from '../utils/audio';

export type AspectRatioType = 'free' | '1:1' | '16:9' | '4:3' | '21:9';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  initialAspectRatio?: AspectRatioType;
  soundEnabled?: boolean;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageUrl,
  title = 'RECORTAR IMAGEM // DEDSEC HUD STUDIO',
  subtitle = 'Ajuste a área de recorte, rotação e escala da imagem',
  initialAspectRatio = 'free',
  soundEnabled = true,
  onClose,
  onCropComplete
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(initialAspectRatio);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  // Viewport and crop rect in container coordinates (0 to 1 normalized)
  const [cropRect, setCropRect] = useState({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, initialRect: { x: 0, y: 0, width: 0, height: 0 } });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize or reset when modal opens or image changes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setAspectRatio(initialAspectRatio);
      setImgLoaded(false);
      setCropRect({ x: 0.05, y: 0.05, width: 0.9, height: 0.9 });
    }
  }, [isOpen, imageUrl, initialAspectRatio]);

  // Adjust cropRect when aspect ratio changes
  const applyAspectRatio = useCallback((ratio: AspectRatioType, currentRect = cropRect) => {
    if (ratio === 'free') return;
    let targetRatio = 1;
    if (ratio === '1:1') targetRatio = 1;
    else if (ratio === '16:9') targetRatio = 16 / 9;
    else if (ratio === '4:3') targetRatio = 4 / 3;
    else if (ratio === '21:9') targetRatio = 21 / 9;

    const container = containerRef.current;
    const containerAspect = container ? container.clientWidth / container.clientHeight : 1;
    const normalizedTargetAspect = targetRatio / containerAspect;

    let newWidth = currentRect.width;
    let newHeight = newWidth / normalizedTargetAspect;

    if (newHeight > 0.95) {
      newHeight = 0.9;
      newWidth = newHeight * normalizedTargetAspect;
    }
    if (newWidth > 0.95) {
      newWidth = 0.9;
      newHeight = newWidth / normalizedTargetAspect;
    }

    const newX = Math.max(0, Math.min(1 - newWidth, currentRect.x));
    const newY = Math.max(0, Math.min(1 - newHeight, currentRect.y));

    setCropRect({
      x: newX,
      y: newY,
      width: Math.min(newWidth, 1 - newX),
      height: Math.min(newHeight, 1 - newY)
    });
  }, [cropRect]);

  const handleRatioClick = (ratio: AspectRatioType) => {
    setAspectRatio(ratio);
    applyAspectRatio(ratio);
    playCyberSound('click', soundEnabled);
  };

  const handleRotate = (dir: 1 | -1) => {
    setRotation(prev => (prev + (dir * 90) + 360) % 360);
    playCyberSound('terminal', soundEnabled);
  };

  const handleFlip = () => {
    setFlipH(prev => !prev);
    playCyberSound('terminal', soundEnabled);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setCropRect({ x: 0.05, y: 0.05, width: 0.9, height: 0.9 });
    setAspectRatio('free');
    playCyberSound('click', soundEnabled);
  };

  // Mouse / Touch drag handlers for the crop box
  const onMouseDown = (e: React.MouseEvent, handle: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setActiveHandle(handle);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialRect: { ...cropRect }
    };
  };

  const onTouchStart = (e: React.TouchEvent, handle: string | null) => {
    if (e.touches.length !== 1) return;
    e.stopPropagation();
    setIsDragging(true);
    setActiveHandle(handle);
    dragStartRef.current = {
      mouseX: e.touches[0].clientX,
      mouseY: e.touches[0].clientY,
      initialRect: { ...cropRect }
    };
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const deltaX = (clientX - dragStartRef.current.mouseX) / rect.width;
      const deltaY = (clientY - dragStartRef.current.mouseY) / rect.height;
      const init = dragStartRef.current.initialRect;

      if (!activeHandle) {
        // Move entire box
        const newX = Math.max(0, Math.min(1 - init.width, init.x + deltaX));
        const newY = Math.max(0, Math.min(1 - init.height, init.y + deltaY));
        setCropRect(prev => ({ ...prev, x: newX, y: newY }));
      } else {
        // Resize handle
        let newX = init.x;
        let newY = init.y;
        let newW = init.width;
        let newH = init.height;

        if (activeHandle.includes('e')) newW = Math.max(0.1, Math.min(1 - init.x, init.width + deltaX));
        if (activeHandle.includes('s')) newH = Math.max(0.1, Math.min(1 - init.y, init.height + deltaY));
        if (activeHandle.includes('w')) {
          const maxLeft = init.x + init.width - 0.1;
          newX = Math.max(0, Math.min(maxLeft, init.x + deltaX));
          newW = init.width + (init.x - newX);
        }
        if (activeHandle.includes('n')) {
          const maxTop = init.y + init.height - 0.1;
          newY = Math.max(0, Math.min(maxTop, init.y + deltaY));
          newH = init.height + (init.y - newY);
        }

        // Maintain aspect ratio if fixed
        if (aspectRatio !== 'free') {
          let ratioVal = 1;
          if (aspectRatio === '1:1') ratioVal = 1;
          else if (aspectRatio === '16:9') ratioVal = 16 / 9;
          else if (aspectRatio === '4:3') ratioVal = 4 / 3;
          else if (aspectRatio === '21:9') ratioVal = 21 / 9;
          const containerAspect = rect.width / rect.height;
          const normalizedTargetAspect = ratioVal / containerAspect;
          newH = newW / normalizedTargetAspect;
          if (newY + newH > 1) {
            newH = 1 - newY;
            newW = newH * normalizedTargetAspect;
          }
        }

        setCropRect({
          x: Math.max(0, Math.min(1 - newW, newX)),
          y: Math.max(0, Math.min(1 - newH, newY)),
          width: Math.min(newW, 1),
          height: Math.min(newH, 1)
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleEnd = () => {
      setIsDragging(false);
      setActiveHandle(null);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, activeHandle, aspectRatio]);

  // Execute Canvas Cropping
  const handlePerformCrop = async () => {
    if (!imageRef.current || !containerRef.current) return;
    setIsProcessing(true);
    playCyberSound('terminal', soundEnabled);

    try {
      const img = imageRef.current;
      const container = containerRef.current;

      const containerRect = container.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();

      // Convert cropRect (normalized to container) into actual pixel coordinates relative to the rendered image
      const cropPxX = (cropRect.x * containerRect.width) - (imgRect.left - containerRect.left);
      const cropPxY = (cropRect.y * containerRect.height) - (imgRect.top - containerRect.top);
      const cropPxW = cropRect.width * containerRect.width;
      const cropPxH = cropRect.height * containerRect.height;

      // Scale factor between rendered image and natural image dimensions
      const scaleX = img.naturalWidth / imgRect.width;
      const scaleY = img.naturalHeight / imgRect.height;

      // Actual source bounding box
      let sourceX = cropPxX * scaleX;
      let sourceY = cropPxY * scaleY;
      let sourceW = cropPxW * scaleX;
      let sourceH = cropPxH * scaleY;

      // Clamp within natural bounds
      sourceX = Math.max(0, Math.min(img.naturalWidth - 1, sourceX));
      sourceY = Math.max(0, Math.min(img.naturalHeight - 1, sourceY));
      sourceW = Math.max(10, Math.min(img.naturalWidth - sourceX, sourceW));
      sourceH = Math.max(10, Math.min(img.naturalHeight - sourceY, sourceH));

      // Determine max dimension based on target to prevent exceeding Firestore 1MB document limit
      const isLogo = title.toLowerCase().includes('logo');
      const maxTargetWidth = isLogo ? 512 : 1920;
      const maxTargetHeight = isLogo ? 512 : 1080;

      let targetWidth = Math.round(sourceW);
      let targetHeight = Math.round(sourceH);

      if (targetWidth > maxTargetWidth || targetHeight > maxTargetHeight) {
        const ratio = Math.min(maxTargetWidth / targetWidth, maxTargetHeight / targetHeight);
        targetWidth = Math.max(1, Math.round(targetWidth * ratio));
        targetHeight = Math.max(1, Math.round(targetHeight * ratio));
      }

      // Create high-res offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Não foi possível inicializar o contexto 2D do Canvas.');

      // Handle transformation if rotated or flipped
      ctx.save();
      if (rotation !== 0 || flipH) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        if (flipH) ctx.scale(-1, 1);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw cropped slice
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        0,
        0,
        targetWidth,
        targetHeight
      );
      ctx.restore();

      // Output as clean compressed WebP (or PNG for logo with transparency)
      const outputMime = isLogo ? 'image/png' : 'image/webp';
      const outputQuality = isLogo ? 0.9 : 0.82;
      let croppedDataUrl = canvas.toDataURL(outputMime, outputQuality);
      if (croppedDataUrl.startsWith('data:image/png') && !isLogo) {
        croppedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
      }

      playCyberSound('grant', soundEnabled);
      onCropComplete(croppedDataUrl);
      onClose();
    } catch (err: unknown) {
      console.error('Crop error:', err);
      playCyberSound('deny', soundEnabled);
      alert('Erro ao recortar imagem: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  // Approximate pixel dimensions of current crop
  const estimatedW = naturalSize.width > 0 ? Math.round(cropRect.width * naturalSize.width) : 0;
  const estimatedH = naturalSize.height > 0 ? Math.round(cropRect.height * naturalSize.height) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl border-2 border-[var(--dedsec-primary)] bg-[var(--dedsec-surface)] clip-cyber-corner shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 p-3 sm:p-4 bg-black/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-black border border-[var(--dedsec-primary)] text-[var(--dedsec-primary)]">
              <Crop className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm tracking-wider text-white">
                {title}
              </h2>
              <p className="text-[11px] font-mono text-gray-400">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCyberSound('click', soundEnabled);
              onClose();
            }}
            className="p-1 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-black/95 border-b border-gray-800 text-xs font-mono shrink-0">
          
          {/* Aspect Ratio Buttons */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-gray-500 text-[10px] mr-1 hidden sm:inline">PROPORÇÃO:</span>
            {(['free', '1:1', '16:9', '4:3', '21:9'] as AspectRatioType[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => handleRatioClick(r)}
                className={`px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer border ${
                  aspectRatio === r
                    ? 'border-[var(--dedsec-primary)] bg-[var(--dedsec-primary)] text-black font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                    : 'border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 bg-black/60'
                }`}
              >
                {r === 'free' ? 'Livre' : r}
              </button>
            ))}
          </div>

          {/* Transform & Zoom Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleRotate(-1)}
              title="Girar 90° para a esquerda"
              className="p-1.5 bg-black border border-gray-800 hover:border-white text-gray-300 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleRotate(1)}
              title="Girar 90° para a direita"
              className="p-1.5 bg-black border border-gray-800 hover:border-white text-gray-300 hover:text-white cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleFlip}
              title="Espelhar horizontalmente"
              className={`p-1.5 border transition-all cursor-pointer ${
                flipH 
                  ? 'bg-[var(--dedsec-primary)] text-black border-[var(--dedsec-primary)]' 
                  : 'bg-black border-gray-800 hover:border-white text-gray-300 hover:text-white'
              }`}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-gray-800 mx-1 hidden sm:block" />

            {/* Zoom Slider */}
            <div className="flex items-center gap-1.5">
              <ZoomOut className="w-3 h-3 text-gray-500" />
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-20 sm:w-28 accent-[var(--dedsec-primary)] cursor-pointer h-1.5 bg-gray-800"
              />
              <ZoomIn className="w-3 h-3 text-gray-500" />
              <span className="text-[10px] text-gray-400 w-8">{Math.round(zoom * 100)}%</span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              title="Resetar enquadramento"
              className="text-[10px] font-mono text-gray-500 hover:text-yellow-400 ml-1 cursor-pointer"
            >
              Reset
            </button>
          </div>

        </div>

        {/* Viewport Workspace */}
        <div 
          ref={containerRef}
          className="relative flex-1 min-h-[320px] max-h-[58vh] bg-[#05080c] overflow-hidden select-none flex items-center justify-center border-y border-gray-900"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.04) 0%, transparent 80%),
              linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 20px 20px, 20px 20px'
          }}
        >
          {/* Target Image Rendered */}
          {imageUrl ? (
            <img
              ref={imageRef}
              src={imageUrl}
              crossOrigin="anonymous"
              alt="Crop target"
              onLoad={(e) => {
                const target = e.currentTarget;
                setNaturalSize({ width: target.naturalWidth, height: target.naturalHeight });
                setImgLoaded(true);
              }}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                maxHeight: '85%',
                maxWidth: '85%'
              }}
              className="object-contain pointer-events-none select-none drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
            />
          ) : (
            <div className="text-gray-500 font-mono text-xs">Nenhuma imagem carregada para recorte</div>
          )}

          {/* Dimmed backdrop outside crop area */}
          <div 
            className="absolute inset-0 bg-black/65 pointer-events-none"
            style={{
              clipPath: `polygon(
                0% 0%, 100% 0%, 100% 100%, 0% 100%,
                0% 0%,
                ${cropRect.x * 100}% ${cropRect.y * 100}%,
                ${cropRect.x * 100}% ${(cropRect.y + cropRect.height) * 100}%,
                ${(cropRect.x + cropRect.width) * 100}% ${(cropRect.y + cropRect.height) * 100}%,
                ${(cropRect.x + cropRect.width) * 100}% ${cropRect.y * 100}%,
                ${cropRect.x * 100}% ${cropRect.y * 100}%
              )`
            }}
          />

          {/* Interactive Crop Frame */}
          <div
            onMouseDown={(e) => onMouseDown(e, null)}
            onTouchStart={(e) => onTouchStart(e, null)}
            className="absolute border-2 border-[var(--dedsec-primary)] cursor-move select-none shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            style={{
              left: `${cropRect.x * 100}%`,
              top: `${cropRect.y * 100}%`,
              width: `${cropRect.width * 100}%`,
              height: `${cropRect.height * 100}%`
            }}
          >
            {/* Rule of Thirds Cyberpunk Grid */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-40">
              <div className="border-r border-b border-[var(--dedsec-primary)]/40" />
              <div className="border-r border-b border-[var(--dedsec-primary)]/40" />
              <div className="border-b border-[var(--dedsec-primary)]/40" />
              <div className="border-r border-b border-[var(--dedsec-primary)]/40" />
              <div className="border-r border-b border-[var(--dedsec-primary)]/40" />
              <div className="border-b border-[var(--dedsec-primary)]/40" />
              <div className="border-r border-[var(--dedsec-primary)]/40" />
              <div className="border-r border-[var(--dedsec-primary)]/40" />
              <div />
            </div>

            {/* Corner Cyber Brackets */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white pointer-events-none" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white pointer-events-none" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white pointer-events-none" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white pointer-events-none" />

            {/* Center reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-60">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-[var(--dedsec-primary)]" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--dedsec-primary)]" />
            </div>

            {/* Dimension Badge */}
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 border border-gray-700 text-[9px] font-mono text-[var(--dedsec-primary)] pointer-events-none">
              {estimatedW && estimatedH ? `${estimatedW} × ${estimatedH} px` : 'CROP HUD'}
            </div>

            {/* Resize Handles (8 Points) */}
            <div 
              onMouseDown={(e) => onMouseDown(e, 'nw')} 
              onTouchStart={(e) => onTouchStart(e, 'nw')}
              className="absolute -top-2 -left-2 w-4 h-4 bg-[var(--dedsec-primary)] border border-black cursor-nwse-resize" 
            />
            <div 
              onMouseDown={(e) => onMouseDown(e, 'ne')} 
              onTouchStart={(e) => onTouchStart(e, 'ne')}
              className="absolute -top-2 -right-2 w-4 h-4 bg-[var(--dedsec-primary)] border border-black cursor-nesw-resize" 
            />
            <div 
              onMouseDown={(e) => onMouseDown(e, 'sw')} 
              onTouchStart={(e) => onTouchStart(e, 'sw')}
              className="absolute -bottom-2 -left-2 w-4 h-4 bg-[var(--dedsec-primary)] border border-black cursor-nesw-resize" 
            />
            <div 
              onMouseDown={(e) => onMouseDown(e, 'se')} 
              onTouchStart={(e) => onTouchStart(e, 'se')}
              className="absolute -bottom-2 -right-2 w-4 h-4 bg-[var(--dedsec-primary)] border border-black cursor-nwse-resize" 
            />
            
            <div 
              onMouseDown={(e) => onMouseDown(e, 'n')} 
              onTouchStart={(e) => onTouchStart(e, 'n')}
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white/80 border border-black cursor-ns-resize" 
            />
            <div 
              onMouseDown={(e) => onMouseDown(e, 's')} 
              onTouchStart={(e) => onTouchStart(e, 's')}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white/80 border border-black cursor-ns-resize" 
            />
            <div 
              onMouseDown={(e) => onMouseDown(e, 'w')} 
              onTouchStart={(e) => onTouchStart(e, 'w')}
              className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-6 bg-white/80 border border-black cursor-ew-resize" 
            />
            <div 
              onMouseDown={(e) => onMouseDown(e, 'e')} 
              onTouchStart={(e) => onTouchStart(e, 'e')}
              className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-6 bg-white/80 border border-black cursor-ew-resize" 
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-black/95 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] font-mono text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--dedsec-primary)] animate-ping" />
            <span>ARRASTE A MOLDURA PARA POSICIONAR • USE AS BORDAS PARA REDIMENSIONAR</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playCyberSound('click', soundEnabled);
                onClose();
              }}
              className="px-4 py-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-mono text-xs cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={isProcessing || !imageUrl}
              onClick={handlePerformCrop}
              className="flex items-center gap-2 px-5 py-2 bg-[var(--dedsec-primary)] text-black font-display font-bold text-xs hover:bg-cyan-300 transition-all disabled:opacity-50 cursor-pointer clip-cyber-badge shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              <Crop className="w-4 h-4" />
              <span>{isProcessing ? 'RECORTANDO...' : 'RECORTAR & APLICAR'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
