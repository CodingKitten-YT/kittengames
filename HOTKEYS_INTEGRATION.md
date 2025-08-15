# Hotkeys System Integration Summary

## How It Works

### 1. Parent Page (Main Site)
- **HotkeysManager** handles hotkeys for the main site
- Listens for keyboard events on the document
- Handles `postMessage` communication with game iframes
- Sends hotkey configuration to iframes when requested
- Executes actions when hotkeys are pressed (either from parent or iframe)

### 2. Game Iframes (hotkeys-helper.js)
- **hotkeys-helper.js** is included in each game's HTML file
- Requests hotkey configuration from parent on load
- Listens for keyboard events within the game iframe
- Matches pressed keys against configured hotkeys
- Sends hotkey signals to parent when matches are found
- Works for both same-origin and cross-origin games

### 3. Communication Flow

```
Parent Page ←→ Game Iframe
     ↓              ↓
HotkeysManager ←→ hotkeys-helper.js
     ↓              ↓
  Actions      postMessage
```

#### Message Types:
- `kittengames-hotkey-request`: Iframe requests config from parent
- `kittengames-hotkey-config`: Parent sends config to iframe
- `kittengames-hotkey`: Iframe sends hotkey match to parent

## Implementation Details

### Parent Page Integration
```typescript
// In HotkeysManager.tsx
const handleMessage = (event: MessageEvent) => {
  if (event.data.type === 'kittengames-hotkey-request') {
    // Send config to iframe
    iframe.contentWindow.postMessage({
      type: 'kittengames-hotkey-config',
      hotkeys: settings.hotkeys,
      enabled: settings.enabled
    }, '*')
  }
  
  if (event.data.type === 'kittengames-hotkey') {
    // Execute action from iframe hotkey
    executeAction(event.data.hotkey.action, router)
  }
}
```

### Game Integration
```html
<!-- In each game's HTML file -->
<script src="/hotkeys-helper.js"></script>
```

The helper script automatically:
- Requests configuration from parent
- Listens for key events
- Sends signals when hotkeys match

## Benefits

### 🎮 Seamless Game Experience
- Hotkeys work inside games without iframe restrictions
- No need to modify individual game code
- Works with both same-origin and cross-origin games

### ⌨️ Consistent Behavior
- Same hotkeys work across all pages
- Parent page handles all action execution
- Unified settings management

### 🔧 Easy Maintenance
- Single helper script for all games
- Centralized hotkey logic in parent
- Automatic configuration distribution

## Testing

1. **Parent Page**: Hotkeys work on main site pages
2. **Game Pages**: Hotkeys work inside game iframes
3. **Settings**: Configuration persists and updates both parent and games
4. **Help System**: `Ctrl+?` shows available hotkeys everywhere

## Current Game Integration Status

✅ All games now include `/hotkeys-helper.js`:
- clicker-game/index.html
- memory-match/index.html
- number-guess/index.html
- word-scramble/index.html

The system is now fully integrated and ready for testing!
