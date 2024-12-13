import React from 'react';
import { ChevronLeft, Maximize2, ExternalLink, Dices } from 'lucide-react';

interface GameViewProps {
  name: string;
  url: string;
  onBack: () => void;
  openRandomGame: () => void; // Add openRandomGame prop
}

export function GameView({ name, url, onBack, openRandomGame }: GameViewProps) {
  const handleFullscreen = () => {
    const iframe = document.getElementById('game-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    }
  };

  const openInBlank = () => {
    const win = window.open('about:blank');
    if (win) {
      win.document.body.style.margin = '0';
      win.document.body.style.height = '100vh';
      const iframe = win.document.createElement('iframe');
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.margin = '0';
      iframe.src = url;
      win.document.body.appendChild(iframe);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in">
      <header className="bg-card p-4 flex items-center justify-between shadow-lg animate-slide-down">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground hover:text-primary 
                   transition-all duration-300 hover:scale-105 group"
        >
          <ChevronLeft size={24} className="transform transition-transform duration-300 
                                          group-hover:-translate-x-1" />
          <span className="font-medium">Back to Games</span>
        </button>
        <h1 className="text-xl font-bold animate-slide-up">{name}</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleFullscreen}
            className="p-2 hover:bg-card-hover rounded-lg transition-all duration-300 
                     hover:scale-110 hover:shadow-lg group"
            aria-label="Fullscreen"
          >
            <Maximize2 
              className="text-muted group-hover:text-primary transition-colors duration-300" 
              size={20} 
            />
          </button>
          <button
            onClick={openInBlank}
            className="p-2 hover:bg-card-hover rounded-lg transition-all duration-300 
                     hover:scale-110 hover:shadow-lg group"
            aria-label="Open in new tab"
          >
            <ExternalLink 
              className="text-muted group-hover:text-primary transition-colors duration-300" 
              size={20} 
            />
          </button>
          <button
            onClick={openRandomGame} // Add random game button here
            className="p-2 hover:bg-card-hover rounded-lg transition-all duration-300 
                     hover:scale-110 hover:shadow-lg group"
            aria-label="Random Game"
          >
            <Dices 
              className="text-muted group-hover:text-primary transition-colors duration-300" 
              size={20} 
            />
          </button>
        </div>
      </header>
      <main className="w-full h-[calc(100vh-64px)] animate-scale-in">
        <iframe
          id="game-iframe"
          src={url}
          className="w-full h-full"
          title={name}
          allowFullScreen
        />
      </main>
    </div>
  );
}
