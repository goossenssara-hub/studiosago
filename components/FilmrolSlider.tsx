"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const images = [
  "/assets/foto1.jpg",
  "/assets/foto2.jpg",
  "/assets/foto3.jpg",
  "/assets/foto4.jpg",
  "/assets/foto5.jpg",
  "/assets/foto6.jpg",
];

export default function FilmrolSlider() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const allImages = [...images, ...images];

  function nextImage() {
    setSelectedIndex((current) =>
      current === null ? 0 : (current + 1) % images.length
    );
  }

  function previousImage() {
    setSelectedIndex((current) =>
      current === null ? 0 : (current - 1 + images.length) % images.length
    );
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowRight") nextImage();
      if (event.key === "ArrowLeft") previousImage();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <section className="filmrol-section">
        <div className="filmrol-wrapper">
          <div className="filmrol-track">
            {allImages.map((src, index) => (
              <button
                key={index}
                type="button"
                className="filmrol-frame"
                onClick={() => setSelectedIndex(index % images.length)}
              >
                <Image src={src} alt={`Sfeerbeeld ${index + 1}`} width={360} height={240} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedIndex !== null && (
        <div className="lightbox" onClick={() => setSelectedIndex(null)}>
          <button className="lightbox-close" onClick={() => setSelectedIndex(null)}>
            ✕
          </button>

          <button className="lightbox-arrow lightbox-arrow-left" onClick={(e) => {
            e.stopPropagation();
            previousImage();
          }}>
            ‹
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <Image src={images[selectedIndex]} alt="Vergrote foto" width={1600} height={1100} />
          </div>

          <button className="lightbox-arrow lightbox-arrow-right" onClick={(e) => {
            e.stopPropagation();
            nextImage();
          }}>
            ›
          </button>
        </div>
      )}
    </>
  );
}