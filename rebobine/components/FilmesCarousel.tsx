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
    <section className="py-12 mb-8">
      <h2 className="text-subhead font-display font-bold text-text-primary mb-6">{titulo}</h2>

      <div className="relative group">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white shadow-medium hover:shadow-large text-primary rounded-full flex items-center justify-center transition-all duration-200 hover:text-primary-hover md:opacity-0 md:group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <span className="text-xl font-bold">‹</span>
          </button>
        )}

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-2"
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

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white shadow-medium hover:shadow-large text-primary rounded-full flex items-center justify-center transition-all duration-200 hover:text-primary-hover md:opacity-0 md:group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <span className="text-xl font-bold">›</span>
          </button>
        )}
      </div>
    </section>
  );
}
