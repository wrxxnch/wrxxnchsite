import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Shield, ShieldAlert, Volume2, VolumeX, Tv, LogOut, Key, Terminal } from 'lucide-react';
import { DedsecSkullIcon } from './DedsecAscii';
import { OWNER_EMAIL } from '../firebase';
import { playCyberSound } from '../utils/audio';

interface NavbarProps {
  user: User | null;
  isAdmin: boolean;
  isOwner: boolean;
  soundEnabled: boolean;
  scanlinesEnabled: boolean;
  onToggleSound: () => void;
  onToggleScanlines: () => void;
  onOpenLogin: () => void;
  onOpenAdminPanel: () => void;
  onLogout: () => void;
  postCount: number;
  logoUrl?: string;
  logoHue?: number;
  logoSaturation?: number;
  logoBrightness?: number;
  logoInvert?: boolean;
  logoFrameBg?: string;
  logoFrameBorderColor?: string;
  logoFrameGlow?: boolean;
  logoFrameEnabled?: boolean;
  logoSize?: number;
  siteTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isAdmin,
  isOwner,
  soundEnabled,
  scanlinesEnabled,
  onToggleSound,
  onToggleScanlines,
  onOpenLogin,
  onOpenAdminPanel,
  onLogout,
  postCount,
  logoUrl,
  logoHue = 0,
  logoSaturation = 100,
  logoBrightness = 100,
  logoInvert = false,
  logoFrameBg = '#000000',
  logoFrameBorderColor = 'var(--dedsec-primary)',
  logoFrameGlow = true,
  logoFrameEnabled = true,
  logoSize = 36,
  siteTitle
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [logoLoadError, setLogoLoadError] = useState(false);

  useEffect(() => {
    setLogoLoadError(false);
  }, [logoUrl]);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString('pt-BR', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const logoFilter = `hue-rotate(${logoHue}deg) saturate(${logoSaturation}%) brightness(${logoBrightness}%) ${logoInvert ? 'invert(100%)' : 'invert(0%)'}`;
  const frameBorder = logoFrameBorderColor || 'var(--dedsec-primary)';
  const frameBg = logoFrameBg || '#000000';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--dedsec-border)] bg-[var(--dedsec-bg)]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4 w-full">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
          <div 
            onClick={() => playCyberSound('click', soundEnabled)}
            className={`relative flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
              logoFrameEnabled 
                ? 'p-1 sm:p-1.5 clip-cyber-badge border overflow-hidden' 
                : 'p-0.5 bg-transparent border-0'
            }`}
            style={{
              background: logoFrameEnabled ? frameBg : 'transparent',
              borderColor: logoFrameEnabled ? frameBorder : 'transparent',
              boxShadow: (logoFrameEnabled && logoFrameGlow)
                ? `0 0 10px ${frameBorder}80, inset 0 0 8px ${frameBorder}30` 
                : 'none',
              minWidth: logoFrameEnabled ? `${Math.min(Math.max(logoSize + 6, 30), 44)}px` : `${Math.min(logoSize, 36)}px`,
              minHeight: logoFrameEnabled ? `${Math.min(Math.max(logoSize + 6, 30), 44)}px` : `${Math.min(logoSize, 36)}px`
            }}
            title={logoFrameEnabled ? "DedSec Network Node // Lâmina de Identidade" : "DedSec Network Node // Logo"}
          >
            {logoUrl && !logoLoadError ? (
              <img
                src={logoUrl}
                alt="DedSec Logo"
                className="object-contain transition-all max-h-7 sm:max-h-9 max-w-7 sm:max-w-9"
                style={{
                  width: `${logoSize}px`,
                  height: `${logoSize}px`,
                  filter: (logoFrameEnabled && logoFrameGlow)
                    ? `${logoFilter} drop-shadow(0 0 4px ${frameBorder})`
                    : logoFilter
                }}
                onError={() => setLogoLoadError(true)}
              />
            ) : (
              <div 
                style={{ 
                  filter: logoFilter,
                  width: `${Math.min(logoSize, 32)}px`,
                  height: `${Math.min(logoSize, 32)}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <DedsecSkullIcon 
                  className="transition-colors" 
                  style={{ 
                    color: frameBorder,
                    width: `${Math.min(Math.max(logoSize - 6, 16), 28)}px`,
                    height: `${Math.min(Math.max(logoSize - 6, 16), 28)}px`
                  }}
                />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-display font-bold tracking-wider text-sm sm:text-base md:text-lg text-white truncate block max-w-[110px] xs:max-w-[150px] sm:max-w-none">
                {siteTitle ? (
                  <span>{siteTitle}</span>
                ) : (
                  <>DED<span className="text-[var(--dedsec-primary)]">SEC</span></>
                )}
              </span>
              <span className="text-[9px] sm:text-xs px-1 sm:px-1.5 py-0.5 bg-[var(--dedsec-accent)]/20 border border-[var(--dedsec-accent)] text-[var(--dedsec-accent)] font-mono font-bold flex-shrink-0">
                SF_CELL
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--dedsec-secondary)] animate-ping" />
              <span>ctOS 2.0: COMPROMISED</span>
              <span>•</span>
              <span>{postCount} TRANSMISSÕES</span>
            </div>
          </div>
        </div>

        {/* Telemetry Clock (Center - Visible on Tablet and Desktop) */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4 text-xs font-mono text-gray-400 border border-[var(--dedsec-border)] px-3 py-1 bg-black/40 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--dedsec-primary)]">TIME:</span>
            <span className="text-white font-bold">{timeStr}</span>
          </div>
          <span className="text-gray-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--dedsec-secondary)]">BOTNET:</span>
            <span className="text-gray-200">ONLINE</span>
          </div>
          <span className="text-gray-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--dedsec-accent)]">ENC:</span>
            <span className="text-gray-200">RSA-4096</span>
          </div>
        </div>

        {/* Actions & Auth - Highly Responsive on Mobile / Android */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
          
          {/* Sound Toggle */}
          <button
            onClick={() => {
              playCyberSound('click', !soundEnabled);
              onToggleSound();
            }}
            title={soundEnabled ? 'Silenciar Áudio Cibernético' : 'Ativar Efeitos Sonoros'}
            className={`p-1.5 sm:p-2 border transition-colors flex-shrink-0 ${
              soundEnabled
                ? 'border-[var(--dedsec-primary)] text-[var(--dedsec-primary)] bg-[var(--dedsec-primary)]/10'
                : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* CRT Scanlines / VHS Toggle */}
          <button
            onClick={() => {
              playCyberSound('click', soundEnabled);
              onToggleScanlines();
            }}
            title={scanlinesEnabled ? 'Desativar Filtro VHS / CRT' : 'Ativar Filtro VHS / CRT'}
            className={`p-1.5 sm:p-2 border transition-colors flex-shrink-0 ${
              scanlinesEnabled
                ? 'border-[var(--dedsec-secondary)] text-[var(--dedsec-secondary)] bg-[var(--dedsec-secondary)]/10'
                : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Admin Panel Button (only if authorized) */}
          {isAdmin && (
            <button
              onClick={() => {
                playCyberSound('terminal', soundEnabled);
                onOpenAdminPanel();
              }}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-black border border-[var(--dedsec-primary)] text-[var(--dedsec-primary)] font-mono text-[11px] sm:text-xs font-bold hover:bg-[var(--dedsec-primary)] hover:text-black transition-colors shadow-[0_0_12px_rgba(0,240,255,0.25)] flex-shrink-0"
              title="Abrir Painel Administrativo DedSec"
            >
              <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
              <span className="hidden sm:inline">PAINEL </span>
              <span>ADMIN</span>
            </button>
          )}

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <div 
                className="flex items-center gap-1 border border-gray-700 bg-black/60 px-1.5 py-1 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-mono max-w-[85px] xs:max-w-[120px] sm:max-w-[140px]"
                title={isOwner ? "ACESSO ROOT // PROTEGIDO" : "OPERADOR DEDSEC // AUTORIZADO"}
              >
                {isOwner ? (
                  <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--dedsec-accent)] flex-shrink-0" />
                ) : (
                  <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--dedsec-secondary)] flex-shrink-0" />
                )}
                <span className="text-gray-300 truncate">
                  {isOwner ? 'ROOT' : (user.displayName?.split(' ')[0] || 'OPERADOR')}
                </span>
              </div>
              <button
                onClick={() => {
                  playCyberSound('deny', soundEnabled);
                  onLogout();
                }}
                title="Desconectar da rede DedSec"
                className="p-1.5 sm:p-2 border border-red-800/80 text-red-400 hover:bg-red-950/40 hover:border-red-600 transition-colors flex-shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                playCyberSound('click', soundEnabled);
                onOpenLogin();
              }}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-black border border-[var(--dedsec-secondary)] text-[var(--dedsec-secondary)] hover:bg-[var(--dedsec-secondary)] hover:text-black font-mono text-[11px] sm:text-xs font-bold transition-all flex-shrink-0"
              title="Entrar com conta Google no sistema DedSec"
            >
              <Key className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>ENTRAR</span>
              <span className="hidden sm:inline"> GOOGLE</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
