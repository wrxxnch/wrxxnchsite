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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--dedsec-border)] bg-[var(--dedsec-bg)]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => playCyberSound('click', soundEnabled)}
            className="relative p-1.5 bg-black border border-[var(--dedsec-primary)] clip-cyber-badge flex items-center justify-center text-[var(--dedsec-primary)] hover:text-[var(--dedsec-accent)] transition-colors min-w-[38px] min-h-[38px] cursor-pointer"
            title="DedSec Network Node"
          >
            {logoUrl && !logoLoadError ? (
              <img
                src={logoUrl}
                alt="DedSec Logo"
                className="w-7 h-7 object-contain drop-shadow-[0_0_8px_var(--dedsec-primary)]"
                onError={() => setLogoLoadError(true)}
              />
            ) : (
              <DedsecSkullIcon className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold tracking-wider text-base md:text-lg text-white">
                {siteTitle ? (
                  <span>{siteTitle}</span>
                ) : (
                  <>DED<span className="text-[var(--dedsec-primary)]">SEC</span></>
                )}
              </span>
              <span className="text-xs px-1.5 py-0.5 bg-[var(--dedsec-accent)]/20 border border-[var(--dedsec-accent)] text-[var(--dedsec-accent)] font-mono font-bold">
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

        {/* Telemetry Clock (Center) */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-gray-400 border border-[var(--dedsec-border)] px-3 py-1 bg-black/40">
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

        {/* Actions & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Sound Toggle */}
          <button
            onClick={() => {
              playCyberSound('click', !soundEnabled);
              onToggleSound();
            }}
            title={soundEnabled ? 'Silenciar Áudio Cibernético' : 'Ativar Efeitos Sonoros'}
            className={`p-2 border transition-colors ${
              soundEnabled
                ? 'border-[var(--dedsec-primary)] text-[var(--dedsec-primary)] bg-[var(--dedsec-primary)]/10'
                : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* CRT Scanlines Toggle */}
          <button
            onClick={() => {
              playCyberSound('click', soundEnabled);
              onToggleScanlines();
            }}
            title={scanlinesEnabled ? 'Desativar Scanlines CRT' : 'Ativar Scanlines CRT'}
            className={`p-2 border transition-colors ${
              scanlinesEnabled
                ? 'border-[var(--dedsec-secondary)] text-[var(--dedsec-secondary)] bg-[var(--dedsec-secondary)]/10'
                : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
            }`}
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Admin Panel Button (only if authorized) */}
          {isAdmin && (
            <button
              onClick={() => {
                playCyberSound('terminal', soundEnabled);
                onOpenAdminPanel();
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-black border border-[var(--dedsec-primary)] text-[var(--dedsec-primary)] font-mono text-xs font-bold hover:bg-[var(--dedsec-primary)] hover:text-black transition-colors shadow-[0_0_12px_rgba(0,240,255,0.25)]"
            >
              <Terminal className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">PAINEL</span> ADMIN
            </button>
          )}

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-2">
              <div 
                className="hidden lg:flex items-center gap-1.5 border border-gray-700 bg-black/60 px-2.5 py-1 text-xs font-mono"
                title={isOwner ? "ACESSO ROOT // PROTEGIDO" : "OPERADOR DEDSEC // AUTORIZADO"}
              >
                {isOwner ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-[var(--dedsec-accent)]" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-[var(--dedsec-secondary)]" />
                )}
                <span className="text-gray-300 max-w-[140px] truncate">
                  {isOwner ? 'ROOT_OPERATIVE' : (user.displayName || 'SF_OPERATIVE')}
                </span>
              </div>
              <button
                onClick={() => {
                  playCyberSound('deny', soundEnabled);
                  onLogout();
                }}
                title="Desconectar da rede DedSec"
                className="p-2 border border-red-800/80 text-red-400 hover:bg-red-950/40 hover:border-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                playCyberSound('click', soundEnabled);
                onOpenLogin();
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-black border border-[var(--dedsec-secondary)] text-[var(--dedsec-secondary)] hover:bg-[var(--dedsec-secondary)] hover:text-black font-mono text-xs font-bold transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              <span>LOGIN GOOGLE</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
