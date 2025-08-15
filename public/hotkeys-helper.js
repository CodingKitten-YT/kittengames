/**
 * KittenGames Hotkeys Helper Script
 * 
 * This script enables hotkey functionality inside game iframes by:
 * 1. Listening for keyboard events within the iframe
 * 2. Communicating with the parent window via postMessage
 * 3. Handling both same-origin and cross-origin scenarios
 * 
 * Usage: Include this script in the head of each game's HTML:
 * <script src="/hotkeys-helper.js"></script>
 */

(function() {

    'use strict';
    // --- CONFIG ---
    const HOTKEYS_MESSAGE_PREFIX = 'kittengames-hotkey';
    const DEBUG = false;
    let hotkeys = [];
    let enabled = true;
    // --- UTILS ---
    function log(...args) { if (DEBUG) console.log('[Hotkeys Helper]', ...args); }
    function normalizeKey(key) {
        const keyMap = { ' ': 'Space', 'Control': 'Ctrl', 'Meta': 'Cmd' };
        return keyMap[key] || key;
    }
    function keysMatch(hotkeyKeys, pressedKeys) {
        if (hotkeyKeys.length !== pressedKeys.length) return false;
        const normHotkey = hotkeyKeys.map(normalizeKey).sort();
        const normPressed = pressedKeys.map(normalizeKey).sort();
        return normHotkey.every((k, i) => k === normPressed[i]);
    }
    function isInIframe() { return window !== window.top; }
    // --- HOTKEY DETECTION ---
    let pressedKeys = new Set();
    let keySequence = [];
    function handleKeyDown(event) {
        if (!enabled || !hotkeys.length) return;
        const target = event.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        const key = normalizeKey(event.key);
        pressedKeys.add(key);
        keySequence = Array.from(pressedKeys);
        // Find matching hotkey
        const match = hotkeys.find(h => h.enabled && keysMatch(h.keys, keySequence));
        if (match) {
            event.preventDefault();
            event.stopPropagation();
            // Send signal to parent
            window.parent.postMessage({ type: HOTKEYS_MESSAGE_PREFIX, hotkey: match }, '*');
            pressedKeys.clear();
            keySequence = [];
        }
    }
    function handleKeyUp(event) {
        const key = normalizeKey(event.key);
        pressedKeys.delete(key);
        if (pressedKeys.size === 0) keySequence = [];
    }
    function handleBlur() { pressedKeys.clear(); keySequence = []; }
    // --- PARENT COMMUNICATION ---
    function handleParentMessage(event) {
        if (!event.data || typeof event.data !== 'object') return;
        if (event.data.type === HOTKEYS_MESSAGE_PREFIX + '-config') {
            hotkeys = event.data.hotkeys || [];
            enabled = event.data.enabled !== false;
            log('Received hotkeys config from parent:', hotkeys);
        }
    }
    // Request config from parent on load
    function requestConfig() {
        if (isInIframe()) {
            window.parent.postMessage({ type: HOTKEYS_MESSAGE_PREFIX + '-request' }, '*');
        }
    }
    // --- INIT ---
    function init() {
        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('keyup', handleKeyUp, true);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('message', handleParentMessage);
        if (document.body) document.body.setAttribute('tabindex', '0');
        requestConfig();
        log('Hotkeys helper initialized');
    }
    function cleanup() {
        document.removeEventListener('keydown', handleKeyDown, true);
        document.removeEventListener('keyup', handleKeyUp, true);
        window.removeEventListener('blur', handleBlur);
        window.removeEventListener('message', handleParentMessage);
        log('Hotkeys helper cleaned up');
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    window.addEventListener('beforeunload', cleanup);
    if (DEBUG) {
        window.hotkeysHelper = {
            getHotkeys: () => hotkeys,
            pressedKeys: () => Array.from(pressedKeys),
            keySequence: () => keySequence.slice(),
            isInIframe: isInIframe,
            version: '1.1.0'
        };
    }
})();
