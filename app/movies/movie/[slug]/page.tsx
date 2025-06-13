"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Header from "../../../../components/Header";
import { Movie } from "../../../../types/tmdb";
import { getPosterUrl, getBackdropUrl } from "../../../../utils/tmdb";
import { Loader2, Star, Calendar, Clock, ChevronLeft, Play } from "lucide-react";
import axios from "axios";

interface MovieDetails extends Movie {
  runtime?: number;
  budget?: number;
  revenue?: number;
  genres?: Array<{ id: number; name: string }>;
  production_companies?: Array<{ id: number; name: string }>;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages?: Array<{ iso_639_1: string; name: string }>;
}

export default function MovieDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${slug}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_TOKEN}`,
              accept: "application/json",
            },
          }
        );
        setMovie(response.data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchMovieDetails();
    }
  }, [slug]);

  const handleBackClick = () => {
    router.push("/movies");
  };

  const handlePlayClick = () => {
    setShowPlayer(true);
  };

  const getEmbedUrl = () => {
    return `https://player.embed-api.stream/?id=${slug}&type=movie`;
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header currentPage="movies" />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-gray-400">Loading movie details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header currentPage="movies" />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
            <button
              onClick={() => router.push("/movies")}
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              Back to Movies
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 relative">
      {/* Full-screen backdrop image */}
      {movie.backdrop_path && (
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 bg-center bg-no-repeat bg-cover"
            style={{
              backgroundImage: `url(${getBackdropUrl(movie.backdrop_path, "original")})`,
              backgroundPosition: "center 15%",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
          </div>
        </div>
      )}

      {/* Content positioned above backdrop */}
      <div className="relative z-10">
        <Header currentPage="movies" />

        {/* Back Button */}
        <div className="container mx-auto px-4 pt-24 pb-4">
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Movies</span>
          </button>
        </div>

        {/* Main content section */}
        <section className="container mx-auto px-4 py-8 min-h-[calc(100vh-12rem)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Movie Info - Left Column */}
            <div className="lg:col-span-5 text-white">
              <div className="flex flex-col md:flex-row lg:flex-col gap-6 items-start">
                {/* Poster - Only visible on medium screens */}
                <div className="w-48 h-72 rounded-xl overflow-hidden shadow-2xl hidden md:block lg:hidden">
                  <Image
                    src={getPosterUrl(movie.poster_path, "w500") || ""}
                    alt={movie.title}
                    width={192}
                    height={288}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Movie Info */}
                <div className="max-w-xl">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {movie.title}
                  </h1>
                  
                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-lg font-medium">
                        {movie.vote_average.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-400">
                        ({movie.vote_count.toLocaleString()} votes)
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-lg">
                        {new Date(movie.release_date).getFullYear()}
                      </span>
                    </div>
                    {movie.runtime && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-lg">{formatRuntime(movie.runtime)}</span>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movie.genres.map((genre) => (
                        <span
                          key={genre.id}
                          className="px-3 py-1 bg-gray-800/60 border border-gray-700/50 rounded-full text-sm text-gray-300"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Overview */}
                  <p className="text-base text-gray-300 leading-relaxed mb-6">
                    {movie.overview}
                  </p>

                  {/* Play Button */}
                  {!showPlayer && (
                    <button
                      onClick={handlePlayClick}
                      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors mb-6 transform hover:scale-105"
                    >
                      <Play className="w-5 h-5" />
                      <span>Watch Movie</span>
                    </button>
                  )}

                  {/* Movie Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex">
                      <span className="w-32 text-gray-400">Original Title</span>
                      <span>{movie.original_title}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-400">Release Date</span>
                      <span>{new Date(movie.release_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-400">Language</span>
                      <span>{movie.original_language.toUpperCase()}</span>
                    </div>
                    {movie.budget && movie.budget > 0 && (
                      <div className="flex">
                        <span className="w-32 text-gray-400">Budget</span>
                        <span>{formatMoney(movie.budget)}</span>
                      </div>
                    )}
                    {movie.revenue && movie.revenue > 0 && (
                      <div className="flex">
                        <span className="w-32 text-gray-400">Revenue</span>
                        <span>{formatMoney(movie.revenue)}</span>
                      </div>
                    )}
                    {movie.production_countries && movie.production_countries.length > 0 && (
                      <div className="flex">
                        <span className="w-32 text-gray-400">Countries</span>
                        <span>{movie.production_countries.map(c => c.name).join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Video Player - Right Column */}
            <div className="lg:col-span-7">
              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                {showPlayer ? (
                  <iframe
                    src={getEmbedUrl()}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={movie.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 relative">
                    {/* Background poster with overlay */}
                    {movie.backdrop_path && (
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-20"
                        style={{
                          backgroundImage: `url(${getBackdropUrl(movie.backdrop_path, "w1280")})`,
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80" />
                    
                    {/* Play Button Content */}
                    <div className="relative z-10 text-center text-white">
                      <div className="w-20 h-20 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer transform hover:scale-110">
                        <Play className="w-8 h-8 ml-1" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Ready to Watch</h3>
                      <p className="text-gray-300 mb-1">{movie.title}</p>
                      {movie.runtime && (
                        <p className="text-gray-400 text-sm mb-4">{formatRuntime(movie.runtime)}</p>
                      )}
                      <button
                        onClick={handlePlayClick}
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors transform hover:scale-105"
                      >
                        Start Movie
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Player Controls */}
              {showPlayer && (
                <div className="flex justify-between items-center mt-4 text-gray-400 text-sm">
                  <div>
                    <p>Now playing: <span className="text-white">{movie.title}</span></p>
                    {movie.runtime && (
                      <p>{formatRuntime(movie.runtime)} • {new Date(movie.release_date).getFullYear()}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowPlayer(false)}
                    className="text-gray-400 hover:text-white transition-colors px-3 py-1 rounded bg-gray-800/50 hover:bg-gray-700/50"
                  >
                    Exit Player
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}