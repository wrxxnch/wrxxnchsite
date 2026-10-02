import React, { useState } from 'react';
import { Smartphone, Monitor, Cpu, Maximize, RotateCcw, X, Tv, Volume2, VolumeX, Shield, Check } from 'lucide-react';
import { DeviceResolutionInfo } from '../hooks/useDeviceResolution';
import { playCyberSound } from '../utils/audio';

interface ResolutionTelemetryHudProps {
  device: DeviceResolutionInfo;
  soundEnabled: boolean;
  scanlinesEnabled: boolean;
  onToggleSound: () => void;
  onToggleScanlines: () => void;
  onOpenAdminPanel?: () => void;
  isAdmin?: boolean;
}

export const ResolutionTelemetryHud: React.FC<ResolutionTelemetryHudProps> = ({
  device,
  soundEnabled,
  scanlinesEnabled,
  onToggleSound,
  onToggleScanlines
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedRes, setCopiedRes] = useState(false);

  const handleCopyTelemetry = () => {
    const report = `[DEDSEC TELEMETRIA DE DISPOSITIVO]
Dispositivo: ${device.deviceLabel}
Plataforma Android: ${device.isAndroid ? 'SIM (Detectado)' : 'NÃO'}
Resolução Física: ${device.physicalWidth}x${device.physicalHeight}
Resolução Viewport: ${device.viewportWidth}x${device.viewportHeight}
Pixel Ratio (DPR): ${device.pixelRatio}x
Orientação: ${device.orientation.toUpperCase()}
Aspect Ratio: ${device.aspectRatio}
Suporte a Touch: ${device.isTouch ? 'SIM' : 'NÃO'}`;

    navigator.clipboard.writeText(report);
    playCyberSound('terminal', soundEnabled);
    setCopiedRes(true);
    setTimeout(() => setCopiedRes(false), 2500);
  };

  return (
    <>
      {/* HUD Telemetry Bar Strip (Ultra Responsive on Mobile / Android) */}
      <div className="w-full bg-black/90 border-b border-[var(--dedsec-border)]/70 px-2 sm:px-3 py-1 flex items-center justify-between gap-1.5 text-[10px] md:text-xs font-mono select-none overflow-hidden">
        
        {/* Left: Device & Resolution Detection Badge */}
        <button
          type="button"
          onClick={() => {
            playCyberSound('click', soundEnabled);
            setIsOpen(true);
          }}
          className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 border cursor-pointer transition-all flex-shrink-0 ${
            device.isAndroid
              ? 'border-emerald-500/70 bg-emerald-950/30 text-emerald-400 hover:border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
              : 'border-[var(--dedsec-primary)]/60 bg-[var(--dedsec-primary)]/10 text-[var(--dedsec-primary)] hover:border-[var(--dedsec-primary)]'
          }`}
          title="Clique para inspecionar telemetria de resolução e hardware"
        >
          {device.isAndroid ? (
            <Smartphone className="w-3 h-3 text-emerald-400 animate-pulse flex-shrink-0" />
          ) : device.isMobile ? (
            <Smartphone className="w-3 h-3 text-[var(--dedsec-primary)] flex-shrink-0" />
          ) : (
            <Monitor className="w-3 h-3 text-[var(--dedsec-primary)] flex-shrink-0" />
          )}

          <span className="font-bold tracking-wider hidden xs:inline">
            {device.isAndroid ? '[ANDROID DETECTADO]' : '[DISPOSITIVO]'}
          </span>
          <span className="font-bold tracking-wider xs:hidden">
            {device.isAndroid ? '[ANDROID]' : '[NODE]'}
          </span>
          <span className="text-gray-300">
            {device.physicalWidth}x{device.physicalHeight}
          </span>
          <span className="hidden sm:inline text-gray-500">|</span>
          <span className="hidden sm:inline text-gray-400">
            DPR: {device.pixelRatio}x ({device.orientation})
          </span>
        </button>

        {/* Right: VHS Status & Telemetry Summary */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-gray-400 flex-shrink-0">
          
          {/* Quick VHS indicator */}
          <button
            type="button"
            onClick={() => {
              playCyberSound('click', soundEnabled);
              onToggleScanlines();
            }}
            className={`flex items-center gap-1 px-1 sm:px-1.5 py-0.5 border text-[9px] transition-all cursor-pointer ${
              scanlinesEnabled 
                ? 'border-[var(--dedsec-secondary)] text-[var(--dedsec-secondary)] bg-[var(--dedsec-secondary)]/10' 
                : 'border-gray-800 text-gray-500 hover:text-gray-300'
            }`}
            title="Alternar filtro VHS / CRT"
          >
            <Tv className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="hidden sm:inline">VHS: {scanlinesEnabled ? 'ATIVO' : 'DESATIVADO (PADRÃO)'}</span>
            <span className="sm:hidden">VHS: {scanlinesEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Touch target hint */}
          {device.isTouch && (
            <span className="hidden md:flex items-center gap-1 text-[9px] text-yellow-400/90 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
              TOUCH OTIMIZADO
            </span>
          )}

          {/* Viewport size live badge */}
          <span className="text-[9px] sm:text-[10px] text-gray-400 font-mono hidden xs:inline">
            VP: <strong className="text-white">{device.viewportWidth}x{device.viewportHeight}</strong>
          </span>
        </div>

      </div>

      {/* Telemetry Inspection Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#080d14] border-2 border-[var(--dedsec-primary)] p-5 clip-cyber-corner shadow-[0_0_30px_rgba(0,240,255,0.25)] space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[var(--dedsec-primary)] animate-pulse" />
                <div>
                  <h3 className="font-display font-bold text-sm text-white tracking-wider">
                    TELEMETRIA DE RESOLUÇÃO // DEDSEC HUD
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400">
                    DIAGNÓSTICO EM TEMPO REAL DO CLIENTE
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playCyberSound('click', soundEnabled);
                  setIsOpen(false);
                }}
                className="p-1 border border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Android Detection Status Card */}
            <div className={`p-3.5 border ${
              device.isAndroid
                ? 'border-emerald-500/80 bg-emerald-950/30'
                : 'border-cyan-500/40 bg-cyan-950/20'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  {device.deviceLabel}
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-black border border-emerald-400 text-emerald-400">
                  {device.isAndroid ? 'SISTEMA ANDROID CONFIRMADO' : 'SISTEMA WEB ADAPTATIVO'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-gray-300">
                {device.isAndroid 
                  ? 'Layout responsivo otimizado para celulares e tablets Android com suporte a DPI alto, proporção de aspecto moderna e viewport visual adaptativo.'
                  : 'A interface adapta elementos, tipografia e espaçamentos dinamicamente conforme a resolução física e densidade de pixels do dispositivo.'}
              </p>
            </div>

            {/* Grid of detected metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              
              <div className="p-2.5 bg-black/60 border border-gray-800 space-y-1">
                <span className="text-[10px] text-gray-400 block">RESOLUÇÃO FÍSICA (TELA)</span>
                <span className="text-white font-bold text-sm block">
                  {device.physicalWidth} x {device.physicalHeight}
                </span>
                <span className="text-[10px] text-[var(--dedsec-primary)]">
                  Classificação: {device.resolutionLabel}
                </span>
              </div>

              <div className="p-2.5 bg-black/60 border border-gray-800 space-y-1">
                <span className="text-[10px] text-gray-400 block">RESOLUÇÃO VIEWPORT (CSS)</span>
                <span className="text-white font-bold text-sm block">
                  {device.viewportWidth} x {device.viewportHeight}
                </span>
                <span className="text-[10px] text-[var(--dedsec-secondary)]">
                  Aspecto: {device.aspectRatio}
                </span>
              </div>

              <div className="p-2.5 bg-black/60 border border-gray-800 space-y-1">
                <span className="text-[10px] text-gray-400 block">PIXEL DENSITY (DPR)</span>
                <span className="text-white font-bold text-sm block">
                  {device.pixelRatio}x
                </span>
                <span className="text-[10px] text-yellow-400">
                  {device.pixelRatio >= 2 ? 'Alta Definição (Retina / AMOLED)' : 'Padrão (1x)'}
                </span>
              </div>

              <div className="p-2.5 bg-black/60 border border-gray-800 space-y-1">
                <span className="text-[10px] text-gray-400 block">ORIENTAÇÃO & ENTRADA</span>
                <span className="text-white font-bold text-sm block">
                  {device.orientation.toUpperCase()}
                </span>
                <span className="text-[10px] text-purple-400">
                  Touch: {device.isTouch ? 'Ativo (Multitoque)' : 'Cursor / Mouse'}
                </span>
              </div>

            </div>

            {/* Quick Actions & Settings */}
            <div className="border border-gray-800 p-3 bg-black/40 space-y-2">
              <span className="text-[10px] font-mono text-gray-400 block">
                CONTROLES RÁPIDOS DE RENDERIZAÇÃO
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playCyberSound('click', soundEnabled);
                    onToggleScanlines();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono cursor-pointer transition-all ${
                    scanlinesEnabled
                      ? 'border-[var(--dedsec-secondary)] text-[var(--dedsec-secondary)] bg-[var(--dedsec-secondary)]/10'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Filtro VHS: {scanlinesEnabled ? 'LIGADO' : 'DESLIGADO (PADRÃO)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playCyberSound('click', !soundEnabled);
                    onToggleSound();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono cursor-pointer transition-all ${
                    soundEnabled
                      ? 'border-[var(--dedsec-primary)] text-[var(--dedsec-primary)] bg-[var(--dedsec-primary)]/10'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>Áudio Cyber: {soundEnabled ? 'ATIVO' : 'MUTADO'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyTelemetry}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-700 hover:border-[var(--dedsec-accent)] text-gray-300 hover:text-white text-xs font-mono cursor-pointer transition-all ml-auto"
                >
                  {copiedRes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Cpu className="w-3.5 h-3.5" />}
                  <span>{copiedRes ? 'COPIADO!' : 'COPIAR DIAGNÓSTICO'}</span>
                </button>
              </div>
            </div>

            {/* Footer close */}
            <div className="flex justify-end pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={() => {
                  playCyberSound('click', soundEnabled);
                  setIsOpen(false);
                }}
                className="px-4 py-1.5 bg-black border border-gray-700 hover:border-[var(--dedsec-primary)] text-gray-300 hover:text-white font-mono text-xs cursor-pointer transition-all"
              >
                FECHAR TELEMETRIA
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
