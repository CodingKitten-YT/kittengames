import React, { useEffect, useState } from 'react';
import { Palette, Loader2, EyeOff, Dices } from 'lucide-react';
import { GameCard } from './components/GameCard';
import { GameView } from './components/GameView';
import { SearchBar } from './components/SearchBar';
import { SettingsPopup } from './components/SettingsPopup';
import { CloakPopup } from './components/CloakPopup';
import { ClearCacheButton } from './components/ClearCacheButton';
import { useSettings } from './hooks/useSettings';
import { useCloaking } from './hooks/useCloaking';
import { useGameFilter } from './hooks/useGameFilter';
import { Logo } from './components/Logo';
import { Game } from './types/game';

function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCloakOpen, setIsCloakOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const { settings, updateSettings, loadCustomTheme, removeCustomTheme, customThemes } = useSettings();
  const { cloakSettings, updateCloak, removeCloak } = useCloaking();
  const { 
    searchQuery, 
    selectedType, 
    isPending, 
    handleSearch, 
    handleTypeChange, 
    filterGames 
  } = useGameFilter();

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/CodingKitten-YT/KittenGames-gamelibrary/main/games.json')
      .then(res => res.json())
      .then(data => {
        setGames(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading games:', err);
        setLoading(false);
      });
  }, []);

  const openRandomGame = () => {
    if (games.length > 0) {
      const randomIndex = Math.floor(Math.random() * games.length);
      const game = games[randomIndex];
      if (game.newtab) {
        window.open(game.url, '_blank');
      } else {
        setSelectedGame(game);
      }
    }
  };

  const handleGameClick = (game: Game) => {
    if (game.newtab) {
      window.open(game.url, '_blank');
    } else {
      setSelectedGame(game);
    }
  };

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => {
      setSelectedGame(null);
      setIsExiting(false);
    }, 300);
  };

  const filteredGames = filterGames(games);

  if (selectedGame) {
    return (
      <GameView
        name={selectedGame.name}
        url={selectedGame.url}
        onBack={handleBack}
        openRandomGame={openRandomGame} // Pass the function here
      />
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 bg-card p-4 shadow-lg z-10">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Logo />
              </div>
              <SearchBar 
                value={searchQuery} 
                onChange={handleSearch} 
                selectedType={selectedType}
                onTypeChange={handleTypeChange}
                isSearching={isPending} 
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={openRandomGame} // Trigger random game from homepage
                className="p-2 hover:bg-card-hover rounded-lg transition-all duration-300 
                         hover:scale-110 hover:shadow-lg group"
                aria-label="Random Game"
              >
                <Dices className="text-muted group-hover:text-primary transition-colors duration-300" 
                       size={20} />
              </button>
              <button
                onClick={() => setIsCloakOpen(true)}
                className="p-2 hover:bg-card-hover rounded-lg transition-all duration-300 
                         hover:scale-110 hover:shadow-lg group"
                aria-label="Cloak Settings"
              >
                <EyeOff className="text-muted group-hover:text-primary transition-colors duration-300" 
                        size={20} />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 hover:bg-card-hover rounded-lg transition-all duration-300 
                         hover:scale-110 hover:shadow-lg group"
                aria-label="Theme Settings"
              >
                <Palette className="text-muted group-hover:text-primary transition-colors duration-300" 
                         size={20} />
              </button>
              <ClearCacheButton />
            </div>
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-4rem)] overflow-y-auto hide-scrollbar">
        <div className="container mx-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 
                           gap-4 game-grid transition-opacity duration-300 ${isPending ? 'opacity-50' : ''}">
                {filteredGames.map((game, index) => (
                  <div
                    key={game.name}
                    className="transform transition-all duration-500"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      opacity: isPending ? 0.5 : 1,
                      transform: isPending ? 'scale(0.95)' : 'scale(1)'
                    }}
                  >
                    <GameCard
                      name={game.name}
                      image={game.image}
                      type={game.type}
                      newtab={game.newtab}
                      onClick={() => handleGameClick(game)}
                    />
                  </div>
                ))}
              </div>
              {filteredGames.length === 0 && (
                <div className="text-center text-muted mt-12 animate-fade-in">
                  <p className="text-lg">No games found matching your criteria</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <SettingsPopup 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        loadCustomTheme={loadCustomTheme}
        removeCustomTheme={removeCustomTheme}
        customThemes={customThemes}
      />

      <CloakPopup
        isOpen={isCloakOpen}
        onClose={() => setIsCloakOpen(false)}
        settings={cloakSettings}
        onUpdateCloak={updateCloak}
        onRemoveCloak={removeCloak}
        theme={settings.theme}
      />
    </div>
  );
}

export default App;
