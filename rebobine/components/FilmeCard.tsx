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
  const posterUrl = filme.poster_path
    ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
    : '/placeholder-poster.png';

  return (
    <div
      className="relative group cursor-pointer h-full"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => onClique?.(filme)}
    >
      {/* Poster */}
      <div className="relative overflow-hidden rounded-lg bg-slate-800 aspect-[2/3] shadow-lg">
        <Image
          src={posterUrl}
          alt={filme.titulo}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay em Hover */}
        {hovering && (
          <div className="absolute inset-0 bg-black/80 flex flex-col justify-between p-4 transition-all">
            {/* Info Top */}
            <div>
              <p className="text-xs text-slate-300 mb-1">
                {filme.nota_tmdb ? `⭐ ${filme.nota_tmdb.toFixed(1)}` : 'Sem avaliações'}
              </p>
              <p className="text-xs text-slate-400">
                {filme.data_lancamento
                  ? new Date(filme.data_lancamento).getFullYear()
                  : 'Não informado'}
              </p>
            </div>

            {/* Sinopse */}
            <div className="mb-4">
              <p className="text-xs text-slate-300 line-clamp-3">
                {filme.sinopse || 'Sem sinopse'}
              </p>
            </div>

            {/* Status */}
            <div className="flex gap-2 text-xs">
              <span
                className={`px-2 py-1 rounded font-semibold ${
                  disponivel
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                }`}
              >
                {disponivel ? '● Disponível' : '● Alugado'}
              </span>
            </div>
          </div>
        )}

        {/* Badge se inativo */}
        {!filme.ativo && (
          <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded">
            Inativo
          </div>
        )}
      </div>

      {/* Título */}
      <div className="mt-2">
        <h3 className="text-sm font-semibold text-white truncate">{filme.titulo}</h3>
        {filme.generos.length > 0 && (
          <p className="text-xs text-slate-400 truncate">
            {filme.generos.slice(0, 2).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
