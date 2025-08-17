/**
 * KittenGames Helper Script
 * 
 * This script enables:
 * 1. Hotkey functionality inside game iframes
 * 2. Save/Load game data functionality
 * 
 * Usage: Include this script in the head of each game's HTML:
 * <script src="/hotkeys-helper.js"></script>
 */

(function() {
    'use strict';
    // --- CONFIG ---
    const HOTKEYS_MESSAGE_PREFIX = 'kittengames-hotkey';
    const SAVE_MESSAGE_PREFIX = 'kittengames-save';
    const DEBUG = false;
    let hotkeys = [];
    let enabled = true;
    
    // --- UTILS ---
    function log(...args) { if (DEBUG) console.log('[Game Helper]', ...args); }
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
    
    // --- SAVE/LOAD FUNCTIONALITY ---
    
    // Extract all localStorage data
    function extractLocalStorage() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                data[key] = localStorage.getItem(key);
            }
        }
        return data;
    }
    
    // Extract all cookies
    function extractCookies() {
        const cookies = {};
        document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
                cookies[name] = decodeURIComponent(value);
            }
        });
        return cookies;
    }
    
    // Extract IndexedDB data
    async function extractIndexedDB() {
        return new Promise((resolve) => {
            const databases = {};
            
            if (!window.indexedDB) {
                resolve(databases);
                return;
            }
            
            // Get list of databases (if supported)
            if (indexedDB.databases) {
                indexedDB.databases().then(async (dbList) => {
                    for (const dbInfo of dbList) {
                        try {
                            const dbData = await extractSingleDatabase(dbInfo.name);
                            databases[dbInfo.name] = dbData;
                        } catch (error) {
                            log('Error extracting database:', dbInfo.name, error);
                        }
                    }
                    resolve(databases);
                }).catch(() => {
                    // Fallback: try common database names
                    tryCommonDatabaseNames().then(resolve);
                });
            } else {
                // Fallback for browsers that don't support databases()
                tryCommonDatabaseNames().then(resolve);
            }
        });
    }
    
    async function tryCommonDatabaseNames() {
        const commonNames = ['gamedb', 'game', 'save', 'data', 'storage'];
        const databases = {};
        
        for (const name of commonNames) {
            try {
                const dbData = await extractSingleDatabase(name);
                if (Object.keys(dbData).length > 0) {
                    databases[name] = dbData;
                }
            } catch (error) {
                // Database doesn't exist, continue
            }
        }
        
        return databases;
    }
    
    async function extractSingleDatabase(dbName) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = async () => {
                const db = request.result;
                const dbData = { version: db.version, stores: {} };
                
                try {
                    for (const storeName of db.objectStoreNames) {
                        const storeData = await extractObjectStore(db, storeName);
                        dbData.stores[storeName] = storeData;
                    }
                } catch (error) {
                    log('Error extracting stores from', dbName, error);
                }
                
                db.close();
                resolve(dbData);
            };
        });
    }
    
    async function extractObjectStore(db, storeName) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const storeInfo = {
                    keyPath: store.keyPath,
                    autoIncrement: store.autoIncrement,
                    indexNames: Array.from(store.indexNames),
                    data: request.result
                };
                resolve(storeInfo);
            };
        });
    }
    
    // Restore localStorage data
    function restoreLocalStorage(data) {
        // Clear existing localStorage
        localStorage.clear();
        
        // Restore saved data
        for (const [key, value] of Object.entries(data)) {
            localStorage.setItem(key, value);
        }
    }
    
    // Restore cookies
    function restoreCookies(cookies) {
        // Clear existing cookies
        document.cookie.split(';').forEach(cookie => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
        
        // Restore saved cookies
        for (const [name, value] of Object.entries(cookies)) {
            document.cookie = `${name}=${encodeURIComponent(value)};path=/`;
        }
    }
    
    // Restore IndexedDB data
    async function restoreIndexedDB(databases) {
        for (const [dbName, dbData] of Object.entries(databases)) {
            try {
                await restoreSingleDatabase(dbName, dbData);
            } catch (error) {
                log('Error restoring database:', dbName, error);
            }
        }
    }
    
    async function restoreSingleDatabase(dbName, dbData) {
        return new Promise((resolve, reject) => {
            // Delete existing database
            const deleteReq = indexedDB.deleteDatabase(dbName);
            
            deleteReq.onsuccess = () => {
                // Create new database
                const request = indexedDB.open(dbName, dbData.version);
                
                request.onerror = () => reject(request.error);
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    
                    // Create object stores
                    for (const [storeName, storeInfo] of Object.entries(dbData.stores)) {
                        const store = db.createObjectStore(storeName, {
                            keyPath: storeInfo.keyPath,
                            autoIncrement: storeInfo.autoIncrement
                        });
                        
                        // Create indexes (if any)
                        storeInfo.indexNames.forEach(indexName => {
                            // Note: We can't restore index details without more metadata
                            // This is a limitation - games should handle missing indexes gracefully
                        });
                    }
                };
                
                request.onsuccess = async () => {
                    const db = request.result;
                    
                    // Populate data
                    for (const [storeName, storeInfo] of Object.entries(dbData.stores)) {
                        const transaction = db.transaction([storeName], 'readwrite');
                        const store = transaction.objectStore(storeName);
                        
                        for (const item of storeInfo.data) {
                            store.add(item);
                        }
                    }
                    
                    db.close();
                    resolve();
                };
            };
            
            deleteReq.onerror = () => reject(deleteReq.error);
        });
    }
    
    // Extract all game data
    async function extractGameData() {
        log('Extracting game data...');
        
        const gameData = {
            localStorage: extractLocalStorage(),
            cookies: extractCookies(),
            indexedDB: await extractIndexedDB(),
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        log('Game data extracted:', gameData);
        return gameData;
    }
    
    // Restore all game data
    async function restoreGameData(gameData) {
        log('Restoring game data...');
        
        try {
            if (gameData.localStorage) {
                restoreLocalStorage(gameData.localStorage);
            }
            
            if (gameData.cookies) {
                restoreCookies(gameData.cookies);
            }
            
            if (gameData.indexedDB) {
                await restoreIndexedDB(gameData.indexedDB);
            }
            
            log('Game data restored successfully');
            
            // Reload the page to apply changes
            window.location.reload();
            
        } catch (error) {
            log('Error restoring game data:', error);
            throw error;
        }
    }
    
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
        
        // Handle hotkeys config
        if (event.data.type === HOTKEYS_MESSAGE_PREFIX + '-config') {
            hotkeys = event.data.hotkeys || [];
            enabled = event.data.enabled !== false;
            log('Received hotkeys config from parent:', hotkeys);
        }
        
        // Handle save request
        if (event.data.type === SAVE_MESSAGE_PREFIX + '-extract') {
            extractGameData().then(gameData => {
                window.parent.postMessage({
                    type: SAVE_MESSAGE_PREFIX + '-data',
                    gameData: gameData
                }, '*');
            }).catch(error => {
                window.parent.postMessage({
                    type: SAVE_MESSAGE_PREFIX + '-error',
                    error: error.message
                }, '*');
            });
        }
        
        // Handle load request
        if (event.data.type === SAVE_MESSAGE_PREFIX + '-restore' && event.data.gameData) {
            restoreGameData(event.data.gameData).catch(error => {
                window.parent.postMessage({
                    type: SAVE_MESSAGE_PREFIX + '-error',
                    error: error.message
                }, '*');
            });
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
        log('Game helper initialized');
    }
    function cleanup() {
        document.removeEventListener('keydown', handleKeyDown, true);
        document.removeEventListener('keyup', handleKeyUp, true);
        window.removeEventListener('blur', handleBlur);
        window.removeEventListener('message', handleParentMessage);
        log('Game helper cleaned up');
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    window.addEventListener('beforeunload', cleanup);
    if (DEBUG) {
        window.gameHelper = {
            getHotkeys: () => hotkeys,
            pressedKeys: () => Array.from(pressedKeys),
            keySequence: () => keySequence.slice(),
            extractGameData,
            restoreGameData,
            isInIframe: isInIframe,
            version: '2.0.0'
        };
    }
})();
