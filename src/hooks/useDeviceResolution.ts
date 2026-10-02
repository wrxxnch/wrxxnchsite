import { useState, useEffect } from 'react';

export interface DeviceResolutionInfo {
  isAndroid: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
  viewportWidth: number;
  viewportHeight: number;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  physicalWidth: number;
  physicalHeight: number;
  resolutionLabel: string;
  deviceLabel: string;
  androidVersion: string | null;
  aspectRatio: string;
}

export function useDeviceResolution(): DeviceResolutionInfo {
  const getDeviceInfo = (): DeviceResolutionInfo => {
    if (typeof window === 'undefined') {
      return {
        isAndroid: false,
        isMobile: false,
        isTablet: false,
        isTouch: false,
        orientation: 'portrait',
        viewportWidth: 1280,
        viewportHeight: 720,
        screenWidth: 1920,
        screenHeight: 1080,
        pixelRatio: 1,
        physicalWidth: 1920,
        physicalHeight: 1080,
        resolutionLabel: '1920x1080 (FHD)',
        deviceLabel: 'Desktop Terminal',
        androidVersion: null,
        aspectRatio: '16:9'
      };
    }

    const ua = navigator.userAgent || '';
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const sw = window.screen.width || vw;
    const sh = window.screen.height || vh;
    const dpr = Math.round((window.devicePixelRatio || 1) * 100) / 100;

    const physicalWidth = Math.round(sw * dpr);
    const physicalHeight = Math.round(sh * dpr);

    const orientation: 'portrait' | 'landscape' = vw <= vh ? 'portrait' : 'landscape';
    const isTablet = (isAndroid || isIOS || isTouch) && Math.min(vw, vh) >= 600 && Math.max(vw, vh) >= 900;
    const isMobile = (isAndroid || isIOS || isTouch || vw < 768) && !isTablet;

    // Detect Android OS Version if available
    let androidVersion: string | null = null;
    const androidMatch = ua.match(/Android\s([0-9.]+)/i);
    if (androidMatch && androidMatch[1]) {
      androidVersion = `Android ${androidMatch[1]}`;
    }

    // Resolution classification
    let resolutionLabel = `${physicalWidth}x${physicalHeight}`;
    if (physicalWidth >= 3840 || physicalHeight >= 3840) {
      resolutionLabel += ' (4K UHD)';
    } else if (physicalWidth >= 2560 || physicalHeight >= 2560) {
      resolutionLabel += ' (QHD/2K)';
    } else if (physicalWidth >= 1920 || physicalHeight >= 1920) {
      resolutionLabel += ' (FHD)';
    } else if (physicalWidth >= 1280 || physicalHeight >= 1280) {
      resolutionLabel += ' (HD+)';
    } else {
      resolutionLabel += ' (SD)';
    }

    // Device Label
    let deviceLabel = 'Terminal Desktop';
    if (isAndroid) {
      deviceLabel = androidVersion ? `Dispositivo ${androidVersion}` : 'Dispositivo Android';
    } else if (isTablet) {
      deviceLabel = 'Dispositivo Tablet';
    } else if (isMobile) {
      deviceLabel = 'Dispositivo Mobile';
    }

    // Aspect Ratio approximation
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(Math.round(vw), Math.round(vh));
    const arW = Math.round(vw / divisor);
    const arH = Math.round(vh / divisor);
    const aspectRatio = (arW <= 21 && arH <= 21) ? `${arW}:${arH}` : `${(vw / vh).toFixed(2)}:1`;

    return {
      isAndroid,
      isMobile,
      isTablet,
      isTouch: Boolean(isTouch),
      orientation,
      viewportWidth: vw,
      viewportHeight: vh,
      screenWidth: sw,
      screenHeight: sh,
      pixelRatio: dpr,
      physicalWidth,
      physicalHeight,
      resolutionLabel,
      deviceLabel,
      androidVersion,
      aspectRatio
    };
  };

  const [deviceInfo, setDeviceInfo] = useState<DeviceResolutionInfo>(getDeviceInfo);

  useEffect(() => {
    const handleResize = () => {
      const info = getDeviceInfo();
      setDeviceInfo(info);

      // Set CSS dynamic viewport variables for seamless Android mobile height
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty('--dpr', `${window.devicePixelRatio || 1}`);

      // Add responsive helper classes to html
      if (info.isAndroid) {
        document.documentElement.classList.add('is-android');
      } else {
        document.documentElement.classList.remove('is-android');
      }

      if (info.isMobile) {
        document.documentElement.classList.add('is-mobile');
      } else {
        document.documentElement.classList.remove('is-mobile');
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Support visualViewport resize (especially when virtual keyboard opens/closes on Android)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return deviceInfo;
}
