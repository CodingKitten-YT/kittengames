# Save System Documentation

## Overview

The KittenGames save system allows users to backup and restore **all game data** for the entire site. This includes localStorage, cookies, and IndexedDB data for **all games** on the domain.

## Features

### � **Site-Wide Save/Load**
- Saves all localStorage, cookies, and IndexedDB for the entire domain
- One save file contains progress for **all games** on the site
- Load restores data for **all games** at once

### � **File Format**
- Files saved as `.kgsave` format
- Named as `allgames-{timestamp}.kgsave`
- Contains metadata and all site data

### 🔄 **Complete Data Replacement**
- Loading a save file completely replaces all localStorage, cookies, and IndexedDB
- Clears existing data before restoring saved data
- Automatically reloads the page after restore

## Technical Implementation

### Components

1. **SaveLoadModal** - UI for save/load operations
2. **hotkeys-helper.js** - Handles data extraction/restoration in games
3. **HotkeysManager** - Manages communication between parent and iframe

### Data Flow

```
User clicks Save → Modal opens → Game iframe extracts all site data → 
Data packaged into .kgsave file → File downloaded

User uploads .kgsave → Modal validates file → Game iframe restores all data → 
Page reloads with restored data
```

### File Structure

```json
{
  "metadata": {
    "scope": "allgames",
    "timestamp": 1692185400000,
    "date": "2023-08-16T10:30:00.000Z",
    "version": "1.0.0",
    "userAgent": "Mozilla/5.0...",
    "url": "https://site.com/play/game"
  },
  "gameData": {
    "localStorage": { /* all localStorage data */ },
    "cookies": { /* all cookies */ },
    "indexedDB": { /* all IndexedDB databases */ },
    "timestamp": 1692185400000,
    "userAgent": "Mozilla/5.0...",
    "url": "https://site.com/play/game"
  }
}
```

## Usage

### From Game Pages

1. **Click the Save button** in the compact header while playing any game
2. **Choose Save tab** in the modal
3. **Click Save** - downloads `allgames-{timestamp}.kgsave`

### Loading Saves

1. **Click the Save button** in the compact header
2. **Choose Load tab** in the modal  
3. **Upload a .kgsave file** - only accepts "allgames" scope files
4. **Data is restored** and page reloads automatically

## Benefits

### 🎮 **Universal Backup**
- One file backs up progress from all games
- No need for per-game saves
- Simplified user experience

### 🔒 **Complete Restoration**
- Preserves all game states exactly as they were
- Includes all storage mechanisms (localStorage, cookies, IndexedDB)
- Cross-game data compatibility

### 💻 **Browser Compatibility**
- Works in all modern browsers
- Handles different storage mechanisms gracefully
- Fallback strategies for unsupported features

## Technical Notes

### Storage Mechanisms

1. **localStorage** - Simple key-value storage, cleared and restored completely
2. **Cookies** - All site cookies extracted and restored with proper encoding  
3. **IndexedDB** - Complete database extraction including structure and data

### Security Considerations

- Save files contain all site data - treat as sensitive
- Validation ensures only compatible save files are loaded
- No external network requests during save/load operations

### Browser Limitations

- IndexedDB access requires same-origin policy compliance
- Some browsers may limit file download/upload operations
- Large save files may impact performance

## Error Handling

- **Invalid file format** - Clear error messages
- **Incompatible saves** - Checks for "allgames" scope
- **Storage errors** - Graceful fallbacks and user feedback
- **Timeout protection** - 10-second limits on operations

The save system provides a comprehensive backup solution for all game progress on the KittenGames site!
