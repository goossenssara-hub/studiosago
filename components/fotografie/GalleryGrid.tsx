'use client';

import { useState } from 'react';
import type { GalleryPhoto, GalleryTheme } from '@/lib/fotografie/types';
import styles from './gallery.module.css';

export default function GalleryGrid({ photos, theme }: { photos: GalleryPhoto[]; theme: GalleryTheme }) {
  const [active, setActive] = useState<GalleryPhoto | null>(null);
  return <>
    <div className={styles.editorialGrid} style={{'--accent': theme.accent} as React.CSSProperties}>
      {photos.map((photo) => (
        <button key={photo.id} className={`${styles.photo} ${styles[photo.layout_size]}`} onClick={() => setActive(photo)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.signedUrl} alt={photo.alt_text || photo.original_name} loading="lazy" />
        </button>
      ))}
    </div>
    {active && <div className={styles.lightbox} role="dialog" aria-modal="true" onClick={() => setActive(null)}>
      <button className={styles.close} onClick={() => setActive(null)} aria-label="Sluiten">×</button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={active.signedUrl} alt={active.alt_text || active.original_name} />
    </div>}
  </>;
}
