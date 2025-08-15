export interface Game {
  name: string
  type: string
  cloud_save: boolean
  added: string
  thumbnail: string
  path: string
}

export interface ProcessedGame extends Game {
  image: string
  url: string
}

// Cache for games data to avoid repeated API calls
let gamesCache: Game[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Base URLs for game content
const GAME_BASE_URL = "/gf"
const GAMES_JSON_URL = "/gf/games.json"

/**
 * Process raw game data to add computed properties
 */
function processGame(game: Game): ProcessedGame {
  return {
    ...game,
    image: game.thumbnail,
    url: `${GAME_BASE_URL}/${game.path}/index.html`
  }
}

/**
 * Fetch all games from the JSON file
 */
export async function fetchGames(forceRefresh = false): Promise<ProcessedGame[]> {
  const now = Date.now()
  
  // Return cached data if it's still fresh and not forcing refresh
  if (!forceRefresh && gamesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return gamesCache.map(processGame)
  }

  try {
    const response = await fetch(GAMES_JSON_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.status} ${response.statusText}`)
    }
    
    const data: Game[] = await response.json()
    
    // Update cache
    gamesCache = data
    cacheTimestamp = now
    
    return data.map(processGame)
  } catch (error) {
    console.error('Error fetching games:', error)
    
    // Return cached data if available, even if stale
    if (gamesCache) {
      console.warn('Using stale cached data due to fetch error')
      return gamesCache.map(processGame)
    }
    
    throw error
  }
}

/**
 * Find a specific game by its path/slug
 */
export async function findGameBySlug(slug: string): Promise<ProcessedGame | null> {
  try {
    const games = await fetchGames()
    
    // First try to match by path directly
    let game = games.find(g => g.path === slug)
    
    // If not found, try to match by converting name to slug format (for ROT13 decoded names)
    if (!game) {
      game = games.find(g => 
        g.name.toLowerCase().replace(/\s+/g, "-") === slug ||
        g.path.toLowerCase() === slug.toLowerCase()
      )
    }
    
    return game || null
  } catch (error) {
    console.error('Error finding game by slug:', error)
    return null
  }
}

/**
 * Get games by category
 */
export async function getGamesByCategory(category: string): Promise<ProcessedGame[]> {
  try {
    const games = await fetchGames()
    
    if (category.toLowerCase() === 'all') {
      return games
    }
    
    return games.filter(game => 
      game.type.toLowerCase() === category.toLowerCase()
    )
  } catch (error) {
    console.error('Error getting games by category:', error)
    return []
  }
}

/**
 * Search games by name
 */
export async function searchGames(query: string): Promise<ProcessedGame[]> {
  try {
    const games = await fetchGames()
    const searchTerm = query.toLowerCase().trim()
    
    if (!searchTerm) {
      return games
    }
    
    return games.filter(game =>
      game.name.toLowerCase().includes(searchTerm) ||
      game.type.toLowerCase().includes(searchTerm)
    )
  } catch (error) {
    console.error('Error searching games:', error)
    return []
  }
}

/**
 * Get recently added games
 */
export async function getRecentGames(limit = 10): Promise<ProcessedGame[]> {
  try {
    const games = await fetchGames()
    
    // Sort by added date (newest first) and take the limit
    return games
      .sort((a, b) => new Date(b.added).getTime() - new Date(a.added).getTime())
      .slice(0, limit)
  } catch (error) {
    console.error('Error getting recent games:', error)
    return []
  }
}

/**
 * Get all unique game categories
 */
export async function getGameCategories(): Promise<string[]> {
  try {
    const games = await fetchGames()
    const categories = new Set(games.map(game => game.type))
    return ['All', ...Array.from(categories).sort()]
  } catch (error) {
    console.error('Error getting game categories:', error)
    return ['All']
  }
}

/**
 * Clear the games cache (useful for testing or forced refresh)
 */
export function clearGamesCache(): void {
  gamesCache = null
  cacheTimestamp = 0
}
