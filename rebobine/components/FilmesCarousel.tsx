'use client';

import { Filme } from '@/lib/types';
import { useRef, useState, useEffect } from 'react';
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const element = scrollRef.current;
    element?.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      element?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (filmes.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-4">{titulo}</h2>

      <div className="relative group">
        {/* Botão Esquerda */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center transition md:opacity-0 md:group-hover:opacity-100"
          >
            ‹
          </button>
        )}

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollBehavior: 'smooth' }}
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

        {/* Botão Direita */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center transition md:opacity-0 md:group-hover:opacity-100"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
