import axios from 'axios';
import { TMDBResponse } from '../types/tmdb';

const TMDB_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p';

const tmdbAxios = axios.create({
  baseURL: TMDB_URL,
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_TOKEN}`,
    accept: 'application/json',
  },
});

export const getPopularMovies = async (page: number = 1): Promise<TMDBResponse> => {
  const response = await tmdbAxios.get('/movie/popular', {
    params: {
      language: 'en-US',
      page,
    },
  });
  return response.data;
};

export const getPopularTVShows = async (page: number = 1): Promise<TMDBResponse> => {
  const response = await tmdbAxios.get('/tv/popular', {
    params: {
      language: 'en-US',
      page,
    },
  });
  return response.data;
};

export const getTrendingAll = async (timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse> => {
  const response = await tmdbAxios.get(`/trending/all/${timeWindow}`, {
    params: {
      language: 'en-US',
    },
  });
  return response.data;
};

export const searchMovies = async (query: string): Promise<TMDBResponse> => {
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&page=1`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_TOKEN}`,
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to search movies');
  }

  return response.json();
};

export const searchTVShows = async (query: string): Promise<TMDBResponse> => {
  const url = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&page=1`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_TOKEN}`,
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to search TV shows');
  }

  return response.json();
};

export const getPosterUrl = (path: string | null, size: 'w342' | 'w500' | 'w780' | 'original' = 'w500') => {
  return path ? `${TMDB_IMAGE_URL}/${size}${path}` : null;
};

export const getBackdropUrl = (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') => {
  return path ? `${TMDB_IMAGE_URL}/${size}${path}` : null;
};