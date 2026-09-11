export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  mediaType: 'image' | 'video' | 'none';
  mediaUrl?: string;
  highlighted: boolean;
  blurCover?: boolean;
  blurText?: string;
  authorEmail: string;
  authorName: string;
  createdAt: number;
}

export interface AdminUser {
  email: string;
  role: 'owner' | 'admin';
  name?: string;
  addedAt: number;
  addedBy: string;
}

export interface SplashItem {
  id: string;
  text: string;
  type: 'daily' | 'common';
  date: string; // YYYY-MM-DD
  highlighted: boolean;
  mediaType?: 'image' | 'video' | 'none';
  mediaUrl?: string;
  asciiArt?: string;
  createdAt: number;
}

export interface SiteSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  activeWallpaperId: string;
  wallpaperUrl: string;
  wallpaperOpacity: number;
  wallpaperBlur: number;
  enableScanlines: boolean;
  enableGrid: boolean;
  enableSound: boolean;
  siteTitle: string;
  subTitle: string;
  tickerRawText: string;
  customCategories?: string[];
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
}

export interface WallpaperPreset {
  id: string;
  title: string;
  url: string;
  tag: string;
}
