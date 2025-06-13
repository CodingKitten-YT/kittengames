"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2 } from "lucide-react"
import { getCurrentSettings, launchGame } from "./GameLaunchSettingsPanel"

interface Game {
  name: string
  url: string
}

// Cache for games data to avoid repeated API calls
let gamesCache: Game[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function GameFrame({ slug }: { slug: string }) {
  const [game, setGame] = useState<Game | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)

  // Memoize the game search to avoid unnecessary re-computations
  const findGameInCache = useMemo(() => {
    if (!gamesCache) return null;
    return gamesCache.find((g: Game) => 
      g.name.toLowerCase().replace(/\s+/g, "-") === slug
    );
  }, [slug]);

  useEffect(() => {
    async function fetchGame() {
      setIsLoading(true);
      
      // Check if we have cached data that's still fresh
      const now = Date.now();
      if (gamesCache && (now - cacheTimestamp) < CACHE_DURATION) {
        const cachedGame = findGameInCache;
        setGame(cachedGame || null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("https://raw.githubusercontent.com/CodingKitten-YT/KittenGames-gamelibrary/refs/heads/main/games.json");
        const games = await res.json();
        
        // Update cache
        gamesCache = games;
        cacheTimestamp = now;
        
        const foundGame = games.find((g: Game) => 
          g.name.toLowerCase().replace(/\s+/g, "-") === slug
        );
        setGame(foundGame || null);
      } catch (error) {
        console.error('Error fetching games:', error);
        setGame(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchGame();
  }, [slug, findGameInCache]);

  // Launch logic: if settings dictate about:blank or new tab, launch and return null
  useEffect(() => {
    if (game) {
      const settings = getCurrentSettings();
      if (settings.openMode === "about-blank" || settings.openMode === "new-tab") {
        launchGame(game.url, settings);
        setGame(null);
      }
    }
  }, [game]);

  useEffect(() => {
    const iframe = document.getElementById('game-iframe') as HTMLIFrameElement | null;
    if (iframe && !isLoading) {
      const settings = getCurrentSettings();
      iframe.setAttribute('tabindex', '0');
      if (settings.confirmClose) {
        window.onbeforeunload = () => "Are you sure you want to close the game?";
      } else {
        window.onbeforeunload = null;
      }
    }
  }, [isLoading]);

  // Listen for drag events from the header
  useEffect(() => {
    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);

    // Listen for custom events from the header
    window.addEventListener('header-drag-start', handleDragStart);
    window.addEventListener('header-drag-end', handleDragEnd);

    return () => {
      window.removeEventListener('header-drag-start', handleDragStart);
      window.removeEventListener('header-drag-end', handleDragEnd);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gray-900">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex justify-center items-center h-screen w-screen text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Game not found</h2>
          <p className="text-gray-400">The requested game could not be loaded.</p>
        </div>
      </div>
    );
  }

  // Only render iframe if not about:blank or new-tab
  return (
    <div className="fixed inset-0 w-full h-full bg-gray-900">
      {/* Dragging overlay - blocks iframe interactions during drag */}
      {isDragging && (
        <div className="absolute inset-0 z-40 bg-transparent pointer-events-auto" />
      )}
      
      <iframe
        id="game-iframe"
        src={game.url}
        title={game.name}
        className={`w-full h-full border-0 ${isDragging ? 'pointer-events-none' : ''}`}
        allowFullScreen={true}
        tabIndex={0}
        allow="keyboard; fullscreen"
        loading="eager"
      />
    </div>
  );
}
