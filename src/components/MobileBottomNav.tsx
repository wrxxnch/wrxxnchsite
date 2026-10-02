import React from 'react';
import { Home, Filter, Smartphone, Terminal, Key, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { playCyberSound } from '../utils/audio';
import { DeviceResolutionInfo } from '../hooks/useDeviceResolution';

interface MobileBottomNavProps {
  device: DeviceResolutionInfo;
  soundEnabled: boolean;
  isAdmin: boolean;
  user: unknown;
  onOpenLogin: () => void;
  onOpenAdminPanel: () => void;
  onScrollToFilters: () => void;
  onScrollToTop: () => void;
  onOpenResolutionDetails: () => void;
  postCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  device,
  soundEnabled,
  isAdmin,
  user,
  onOpenLogin,
  onOpenAdminPanel,
  onScrollToFilters,
  onScrollToTop,
  onOpenResolutionDetails,
  postCount
}) => {
  // Only display on mobile / tablet / Android viewports
  if (!device.isMobile && device.viewportWidth >= 768) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 border-t border-[var(--dedsec-border)]/80 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around sm:hidden">
      
      {/* Home / Feed */}
      <button
        type="button"
        onClick={() => {
          playCyberSound('click', soundEnabled);
          onScrollToTop();
        }}
        className="flex flex-col items-center justify-center p-1 text-gray-400 hover:text-[var(--dedsec-primary)] transition-colors cursor-pointer"
      >
        <Home className="w-4 h-4 text-[var(--dedsec-primary)]" />
        <span className="text-[9px] font-mono font-bold mt-0.5">FEED ({postCount})</span>
      </button>

      {/* Filters & Search */}
      <button
        type="button"
        onClick={() => {
          playCyberSound('click', soundEnabled);
          onScrollToFilters();
        }}
        className="flex flex-col items-center justify-center p-1 text-gray-400 hover:text-[var(--dedsec-secondary)] transition-colors cursor-pointer"
      >
        <Filter className="w-4 h-4 text-[var(--dedsec-secondary)]" />
        <span className="text-[9px] font-mono font-bold mt-0.5">FILTROS</span>
      </button>

      {/* Resolution & Android Telemetry */}
      <button
        type="button"
        onClick={() => {
          playCyberSound('terminal', soundEnabled);
          onOpenResolutionDetails();
        }}
        className={`flex flex-col items-center justify-center p-1 transition-colors cursor-pointer ${
          device.isAndroid ? 'text-emerald-400' : 'text-gray-300'
        }`}
      >
        <Smartphone className={`w-4 h-4 ${device.isAndroid ? 'text-emerald-400 animate-pulse' : 'text-gray-400'}`} />
        <span className="text-[8px] font-mono font-bold mt-0.5 truncate max-w-[65px]">
          {device.viewportWidth}x{device.viewportHeight}
        </span>
      </button>

      {/* Admin Panel or Wallpaper / Login */}
      {isAdmin ? (
        <button
          type="button"
          onClick={() => {
            playCyberSound('terminal', soundEnabled);
            onOpenAdminPanel();
          }}
          className="flex flex-col items-center justify-center p-1 text-[var(--dedsec-primary)] hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <Terminal className="w-4 h-4 text-[var(--dedsec-primary)] animate-pulse" />
          <span className="text-[9px] font-mono font-bold mt-0.5">ADMIN</span>
        </button>
      ) : user ? (
        <button
          type="button"
          onClick={() => {
            playCyberSound('click', soundEnabled);
            onOpenAdminPanel();
          }}
          className="flex flex-col items-center justify-center p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ImageIcon className="w-4 h-4 text-[var(--dedsec-accent)]" />
          <span className="text-[9px] font-mono font-bold mt-0.5">PERFIL</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            playCyberSound('click', soundEnabled);
            onOpenLogin();
          }}
          className="flex flex-col items-center justify-center p-1 text-[var(--dedsec-secondary)] hover:text-green-300 transition-colors cursor-pointer"
        >
          <Key className="w-4 h-4 text-[var(--dedsec-secondary)]" />
          <span className="text-[9px] font-mono font-bold mt-0.5">ENTRAR</span>
        </button>
      )}

    </nav>
  );
};
