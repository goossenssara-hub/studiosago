export type GalleryStatus = 'draft' | 'active' | 'expired' | 'archived';
export type DownloadMode = 'none' | 'individual' | 'favorites' | 'all' | 'individual_and_all';

export type GalleryTheme = {
  background: string;
  surface: string;
  text: string;
  accent: string;
  muted: string;
};

export type GalleryPhoto = {
  id: string;
  gallery_id: string;
  storage_path: string;
  original_name: string;
  position: number;
  layout_size: 'small' | 'medium' | 'wide' | 'large' | 'full';
  alt_text: string | null;
  signedUrl?: string;
};

export type PhotoGallery = {
  id: string;
  title: string;
  slug: string;
  client_name: string | null;
  shoot_date: string;
  location: string | null;
  shoot_type: string | null;
  story: string | null;
  welcome_message: string | null;
  status: GalleryStatus;
  expires_at: string | null;
  download_mode: DownloadMode;
  allow_web_download: boolean;
  allow_original_download: boolean;
  favorites_enabled: boolean;
  watermark_enabled: boolean;
  no_index: boolean;
  theme: GalleryTheme;
  photos?: GalleryPhoto[];
};
