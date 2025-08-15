# Hotkeys Feature

A comprehensive keyboard shortcut system for KittenGames that works across all pages, including inside game iframes.

## Features

### 🎮 Game-Focused Design
- Works while playing games in iframes (same-origin games)
- Supports common gaming shortcuts like fullscreen toggle and escape
- Non-intrusive indicators and help system

### ⌨️ Customizable Shortcuts
- Create custom key combinations (single keys or multi-key combos)
- Assign actions to hotkeys from a library of built-in actions
- Add custom JavaScript actions for advanced users
- Enable/disable individual hotkeys

### 🔧 Built-in Actions
- **Navigation**: Redirect to URLs, go back/forward in history
- **Page Control**: Refresh page, toggle fullscreen
- **Game Control**: Escape from games, close/open tabs
- **Custom**: Execute custom JavaScript code

### 💾 Persistent Settings
- All hotkeys saved to localStorage
- Settings persist across browser sessions
- Import/export functionality (planned)

## Default Hotkeys

| Key Combination | Action | Description |
|---|---|---|
| `Escape` | Escape Game | Exit game and go back |
| `Alt + H` | Go Home | Navigate to homepage |
| `F5` | Refresh Page | Refresh current page |
| `F11` | Toggle Fullscreen | Enter/exit fullscreen mode |
| `Ctrl + ?` | Show Help | Display hotkeys help overlay |

## How It Works

### 1. Event Capture
The hotkeys system uses capture-phase event listeners to catch keystrokes before they reach other elements:

```typescript
document.addEventListener('keydown', handleKeyDown, { capture: true })
```

### 2. Cross-Frame Support
For same-origin game iframes, the system attempts to add event listeners directly to the iframe document:

```typescript
const iframeDoc = gameIframe.contentDocument || gameIframe.contentWindow.document
if (iframeDoc) {
  iframeDoc.addEventListener('keydown', handleKeyDown, { capture: true })
}
```

### 3. Key Normalization
Keys are normalized to handle different browser implementations:

```typescript
const keyMap = {
  ' ': 'Space',
  'Control': 'Ctrl',
  'Meta': 'Cmd'
}
```

### 4. Smart Context Detection
Hotkeys are disabled when typing in input fields:

```typescript
if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
  return // Don't trigger hotkeys
}
```

## Action Types

### 1. Redirect Actions
```typescript
{
  type: 'redirect',
  data: { url: '/games' } // Can be relative or absolute URLs
}
```

### 2. Browser Actions
```typescript
{
  type: 'back' | 'forward' | 'refresh' | 'fullscreen' | 'close-tab' | 'new-tab'
}
```

### 3. Game Actions
```typescript
{
  type: 'escape' // Special action for exiting games
}
```

### 4. Custom JavaScript
```typescript
{
  type: 'custom-js',
  data: { jsCode: 'console.log("Hello world!");' }
}
```

## Architecture

### Components

1. **HotkeysSettingsPanel**: Main settings UI with tabs for hotkeys and actions
2. **HotkeysManager**: Core event handling and action execution
3. **HotkeysHelpOverlay**: Help system with Ctrl+? shortcut
4. **HotkeysProvider**: React context for settings management

### Data Flow

```
User Input → HotkeysManager → Action Execution → Browser/App Response
     ↑                                ↓
     └── Settings (localStorage) ←────┘
```

### Settings Structure

```typescript
interface HotkeysSettings {
  enabled: boolean
  hotkeys: Hotkey[]
  actions: HotkeyAction[]
}

interface Hotkey {
  id: string
  keys: string[]
  action: HotkeyAction
  enabled: boolean
  description?: string
}

interface HotkeyAction {
  id: string
  name: string
  description: string
  type: 'redirect' | 'refresh' | 'back' | 'forward' | 'fullscreen' | 'escape' | 'close-tab' | 'new-tab' | 'custom-js'
  data?: {
    url?: string
    jsCode?: string
  }
}
```

## Security Considerations

### 1. Input Sanitization
- URLs are validated before redirect
- Custom JavaScript is executed in a controlled context

### 2. Cross-Origin Safety
- iframe access is attempted safely with try-catch
- Falls back gracefully for cross-origin frames

### 3. Context Awareness
- Hotkeys disabled in input fields to prevent interference
- Proper event capture to avoid conflicts

## Usage Examples

### Adding a Custom Hotkey

1. Go to Settings → Hotkeys
2. Click "Add Hotkey"
3. Press your desired key combination
4. Select an action from the dropdown
5. Add a description (optional)
6. Save

### Creating a Custom Action

1. Go to Settings → Hotkeys → Actions tab
2. Click "Add Action"
3. Fill in name and description
4. Choose action type
5. Add URL or JavaScript code if needed
6. Save

### Using in Games

1. Start any game
2. Hotkeys work automatically while playing
3. Press Ctrl+? to see available shortcuts
4. Use Escape to quickly exit games

## Browser Compatibility

- **Chrome/Edge**: Full support including iframe access
- **Firefox**: Full support including iframe access  
- **Safari**: Full support including iframe access
- **Mobile**: Limited support (no keyboard events)

## Troubleshooting

### Hotkeys Not Working in Games
- Check if the game is same-origin (most local games work)
- Ensure hotkeys are enabled in settings
- Try clicking the game area to focus it

### Custom JavaScript Not Executing
- Check browser console for errors
- Ensure JavaScript syntax is correct
- Avoid using restricted APIs

### Key Combinations Not Detected
- Some keys may be reserved by the browser
- Try different key combinations
- Check if other extensions are interfering

## Testing the Feature

### Quick Test Steps

1. **Access Settings**: Navigate to `/settings` and click on the "Hotkeys" tab
2. **Verify Default Hotkeys**: You should see 4 default hotkeys configured:
   - `Escape` → Escape Game
   - `Alt + H` → Go Home  
   - `F5` → Refresh Page
   - `F11` → Toggle Fullscreen

3. **Test Help System**: Press `Ctrl + ?` anywhere on the site to see the hotkeys help overlay

4. **Test in Games**: 
   - Go to `/apps` and click on any game
   - Press `Ctrl + ?` to see the help overlay
   - Try `Escape` to exit the game
   - Try `F11` to toggle fullscreen

5. **Create Custom Hotkey**:
   - Go to Settings → Hotkeys
   - Click "Add Hotkey"
   - Press a key combination like `Ctrl + G`
   - Select "Go to Games" action
   - Save and test

### Expected Behavior

- ✅ Hotkeys should work on all pages
- ✅ Help overlay appears with `Ctrl + ?`
- ✅ Hotkeys work inside games (for same-origin iframes)
- ✅ Settings persist after page refresh
- ✅ Input fields are ignored (hotkeys don't interfere with typing)

## Future Enhancements

- [ ] Import/export hotkey configurations
- [ ] Hotkey recording with visual feedback
- [ ] Per-game hotkey profiles
- [ ] Cloud sync across devices
- [ ] Advanced key sequence support
- [ ] Hotkey conflict detection
- [ ] Voice command integration
