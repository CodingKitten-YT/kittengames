"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Header from "../../../../components/Header";
import { TVShow } from "../../../../types/tmdb";
import { getPosterUrl, getBackdropUrl } from "../../../../utils/tmdb";
import { Loader2, Star, Calendar, LayoutList, ChevronLeft, Play } from "lucide-react";
import axios from "axios";

interface Season {
  id: number;
  name: string;
  episode_count: number;
  season_number: number;
}

export default function ShowDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const [show, setShow] = useState<TVShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.themoviedb.org/3/tv/${slug}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_TOKEN}`,
              accept: "application/json",
            },
          }
        );
        setShow(response.data);
      } catch (error) {
        console.error("Error fetching show details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchShowDetails();
    }
  }, [slug]);

  const handleBackClick = () => {
    router.push("/movies");
  };

  const handlePlayClick = () => {
    setShowPlayer(true);
  };

  const getEmbedUrl = () => {
    return `https://player.embed-api.stream/?id=${slug}&s=${selectedSeason}&e=${selectedEpisode}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header currentPage="movies" />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-gray-400">Loading show details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header currentPage="movies" />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">TV Show not found</h1>
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
      {show.backdrop_path && (
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 bg-center bg-no-repeat bg-cover"
            style={{
              backgroundImage: `url(${getBackdropUrl(show.backdrop_path, "original")})`,
              backgroundPosition: "center 15%",
            }}
          >
            {/* Horizontal gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />

            {/* Bottom gradient for content readability */}
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
            {/* Show Info - Left Column */}
            <div className="lg:col-span-5 text-white">
              <div className="flex flex-col md:flex-row lg:flex-col gap-6 items-start">
                {/* Poster - Only visible on medium screens */}
                <div className="w-48 h-72 rounded-xl overflow-hidden shadow-2xl hidden md:block lg:hidden">
                  <Image
                    src={getPosterUrl(show.poster_path, "w500") || ""}
                    alt={show.name}
                    width={192}
                    height={288}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Show Info */}
                <div className="max-w-xl">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {show.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-lg font-medium">
                        {show.vote_average.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-lg">
                        {new Date(show.first_air_date).getFullYear()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <LayoutList className="w-5 h-5 text-gray-400" />
                      <span className="text-lg">
                        {show.number_of_seasons
                          ? `${show.number_of_seasons} Season${
                              show.number_of_seasons > 1 ? "s" : ""
                            }`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <p className="text-base text-gray-300 leading-relaxed mb-6">
                    {show.overview}
                  </p>

                  {/* Season/Episode Selector */}
                  <div className="mb-6 space-y-4">
                    <div className="flex gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Season
                        </label>
                        <select
                          value={selectedSeason}
                          onChange={(e) => setSelectedSeason(Number(e.target.value))}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        >
                          {Array.from({ length: show.number_of_seasons || 1 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              Season {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Episode
                        </label>
                        <select
                          value={selectedEpisode}
                          onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        >
                          {/* Default to 20 episodes per season - you could fetch actual episode count from API */}
                          {Array.from({ length: 20 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              Episode {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {!showPlayer && (
                      <button
                        onClick={handlePlayClick}
                        className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        <Play className="w-5 h-5" />
                        <span>Watch S{selectedSeason} E{selectedEpisode}</span>
                      </button>
                    )}
                  </div>

                  {/* Quick Details */}
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex">
                      <span className="w-32 text-gray-400">Original Name</span>
                      <span>{show.original_name}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-400">First Air Date</span>
                      <span>{show.first_air_date}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-400">Origin Country</span>
                      <span>{show.origin_country?.join(", ") || "N/A"}</span>
                    </div>
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
                    title={`${show.name} - Season ${selectedSeason} Episode ${selectedEpisode}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 ml-1" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Ready to Watch</h3>
                      <p className="text-gray-400 mb-4">
                        Season {selectedSeason}, Episode {selectedEpisode}
                      </p>
                      <button
                        onClick={handlePlayClick}
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Start Watching
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {showPlayer && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-gray-400 text-sm">
                    Now playing: Season {selectedSeason}, Episode {selectedEpisode}
                  </p>
                  <button
                    onClick={() => setShowPlayer(false)}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Change Episode
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