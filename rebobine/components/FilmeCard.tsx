'use client';

import { Filme } from '@/lib/types';
import Image from 'next/image';
import { useState } from 'react';

interface FilmeCardProps {
  filme: Filme;
  onClique?: (filme: Filme) => void;
  disponivel?: boolean;
}

export default function FilmeCard({ filme, onClique, disponivel = true }: FilmeCardProps) {
  const [hovering, setHovering] = useState(false);
  const getPosterUrl = (): string => {
    if (!filme.poster_path) return '/placeholder-poster.png';
    if (filme.poster_path.startsWith('http')) return filme.poster_path;
    return `https://image.tmdb.org/t/p/w500${filme.poster_path}`;
  };
  const posterUrl = getPosterUrl();

  return (
    <div
      className="relative group cursor-pointer h-full"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => onClique?.(filme)}
    >
      {/* Card Container */}
      <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg overflow-hidden shadow-subtle hover:shadow-product-hover transition-all duration-200">
        {/* Poster Image */}
        <div className="relative overflow-hidden aspect-[2/3] bg-surface-muted dark:bg-surface-dark-muted">
          <Image
            src={posterUrl}
            alt={filme.titulo}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Overlay em Hover - Fuchsia Tinted */}
          {hovering && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-between p-4 transition-all">
              {/* Rating */}
              <div className="flex justify-between items-start">
                <div>
                  {filme.nota_tmdb && (
                    <div className="flex items-center gap-1 bg-tertiary text-text-primary rounded-full px-2 py-1 w-fit">
                      <span className="text-xs font-bold">⭐</span>
                      <span className="text-xs font-bold">{filme.nota_tmdb.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                {!filme.ativo && (
                  <span className="bg-warning text-white text-xs font-bold px-2 py-1 rounded-xs">
                    Inativo
                  </span>
                )}
              </div>

              {/* Sinopse */}
              {filme.sinopse && (
                <div className="mb-4">
                  <p className="text-xs text-white/90 line-clamp-2 font-body leading-relaxed">
                    {filme.sinopse}
                  </p>
                </div>
              )}

              {/* Status Badge */}
              <div>
                <span
                  className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold text-white transition-colors ${
                    disponivel
                      ? 'bg-success/90 hover:bg-success'
                      : 'bg-error/90 hover:bg-error'
                  }`}
                >
                  {disponivel ? '✓ Disponível' : '✗ Alugado'}
                </span>
              </div>
            </div>
          )}

          {/* Badge Year - Top Right */}
          {filme.data_lancamento && (
            <div className="absolute top-3 right-3 bg-white/95 text-text-primary text-xs font-bold px-2.5 py-1 rounded-xs">
              {new Date(filme.data_lancamento).getFullYear()}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="text-body-sm font-body font-bold text-text-primary dark:text-text-dark-primary truncate mb-1.5">
            {filme.titulo}
          </h3>
          {filme.generos.length > 0 && (
            <p className="text-caption text-text-tertiary dark:text-text-dark-tertiary truncate">
              {filme.generos.slice(0, 2).join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
