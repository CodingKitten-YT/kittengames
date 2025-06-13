import React from 'react';
import Image from 'next/image';
import { Star, Calendar, Play, Film, Tv } from 'lucide-react';
import { Movie, TVShow } from '../types/tmdb';
import { getPosterUrl } from '../utils/tmdb';

interface MovieCardProps {
  item: Movie | TVShow;
  onClick?: () => void;
}

const isMovie = (item: Movie | TVShow): item is Movie => {
  return 'title' in item;
};

export default function MovieCard({ item, onClick }: MovieCardProps) {
  const title = isMovie(item) ? item.title : item.name;
  const releaseDate = isMovie(item) ? item.release_date : item.first_air_date;
  const posterUrl = getPosterUrl(item.poster_path, 'w500');
  const itemType = isMovie(item) ? 'movie' : 'series';

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).getFullYear().toString();
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  return (
    <div 
      className="group relative bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ease-out cursor-pointer hover:scale-[1.02] hover:-translate-y-2 hover:border-gray-600/60"
      onClick={onClick}
    >
      {/* Type Badge */}
      <div className="absolute top-3 left-3 z-20">
        <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md border transition-all duration-300 ${
          itemType === 'movie' 
            ? 'bg-blue-500/20 text-blue-300 border-blue-400/30 group-hover:bg-blue-500/30' 
            : 'bg-purple-500/20 text-purple-300 border-purple-400/30 group-hover:bg-purple-500/30'
        }`}>
          {itemType === 'movie' ? (
            <>
              <Film className="w-3 h-3" />
              <span>Movie</span>
            </>
          ) : (
            <>
              <Tv className="w-3 h-3" />
              <span>Series</span>
            </>
          )}
        </div>
      </div>

      {/* Rating Badge */}
      <div className="absolute top-3 right-3 z-20">
        <div className="flex items-center space-x-1 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-white border border-gray-600/40 group-hover:bg-black/80 transition-all duration-300">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span>{formatRating(item.vote_average)}</span>
        </div>
      </div>

      <div className="relative aspect-[2/3] overflow-hidden">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110 group-hover:contrast-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <Play className="w-12 h-12 text-gray-500" />
          </div>
        )}
        
        {/* Enhanced overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out" />
        
        {/* Hover content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 opacity-80" />
                <span className="font-medium">{formatDate(releaseDate)}</span>
              </div>
            </div>
            <p className="text-gray-200 text-xs leading-relaxed line-clamp-3 opacity-90">
              {item.overview || 'No description available.'}
            </p>
          </div>
        </div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-out" />
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-white font-semibold text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-gray-100 transition-colors duration-300">
          {title}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
          <span className="font-medium">{formatDate(releaseDate)}</span>
          <div className="flex items-center space-x-1 opacity-80">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{formatRating(item.vote_average)}</span>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute inset-0 rounded-xl blur-xl -z-10 ${
          itemType === 'movie' ? 'bg-blue-500/10' : 'bg-purple-500/10'
        }`} />
      </div>
    </div>
  );
}