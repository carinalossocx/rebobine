'use client';

import { Filme } from '@/lib/types';
import { useEffect, useRef } from 'react';
import FilmeCard from './FilmeCard';

interface FilmesCarouselProps {
  titulo: string;
  filmes: Filme[];
  onFilmeClique?: (filme: Filme) => void;
}

export default function FilmesCarousel({
  titulo,
  filmes,
  onFilmeClique,
}: FilmesCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      const deltaHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (deltaHorizontal === 0) return;
      e.preventDefault();
      el.scrollLeft += deltaHorizontal;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  if (filmes.length === 0) return null;

  return (
    <section className="py-12 mb-8">
      <h2 className="text-subhead font-display font-bold text-text-primary dark:text-text-dark-primary mb-6">{titulo}</h2>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-2"
        >
          {filmes.map((filme) => (
            <div
              key={filme.id}
              className="flex-shrink-0 w-40 md:w-48 lg:w-56"
            >
              <FilmeCard
                filme={filme}
                onClique={onFilmeClique}
                disponivel={true}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
