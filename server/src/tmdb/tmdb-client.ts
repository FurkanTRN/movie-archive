import { env } from "../config/env.js";
import { AppError } from "../middleware/error-handler.js";
import type { TmdbMovieDetail, TmdbSearchResponse } from "./tmdb-types.js";

const tmdbBaseUrl = "https://api.themoviedb.org/3";
const tmdbLanguage = "tr-TR";
const movieDetailCacheTtlMs = 1000 * 60 * 10;
const movieSearchCacheTtlMs = 1000 * 60 * 3;

interface CacheEntry<T> {
    expiresAt: number;
    value: T;
}

const movieDetailCache = new Map<number, CacheEntry<TmdbMovieDetail>>();
const movieSearchCache = new Map<string, CacheEntry<TmdbSearchResponse>>();

const createTmdbUrl = (pathname: string, params: Record<string, string>) => {
    const url = new URL(`${tmdbBaseUrl}${pathname}`);

    url.searchParams.set("api_key", env.tmdbApiKey);

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }

    return url;
};

const assertTmdbConfigured = () => {
    if (!env.tmdbApiKey) {
        throw new AppError("TMDB_API_KEY is not configured", 500);
    }
};

const getCachedValue = <T>(cache: Map<string | number, CacheEntry<T>>, key: string | number) => {
    const entry = cache.get(key);

    if (!entry) {
        return null;
    }

    if (entry.expiresAt <= Date.now()) {
        cache.delete(key);
        return null;
    }

    return entry.value;
};

const setCachedValue = <T>(cache: Map<string | number, CacheEntry<T>>, key: string | number, value: T, ttlMs: number) => {
    cache.set(key, {
        expiresAt: Date.now() + ttlMs,
        value,
    });
};

const fetchTmdb = async <T>(pathname: string, params: Record<string, string> = {}) => {
    assertTmdbConfigured();

    const response = await fetch(createTmdbUrl(pathname, params));

    if (!response.ok) {
        throw new AppError(`TMDb request failed with status ${response.status}`, 502);
    }

    return (await response.json()) as T;
};

export const tmdbClient = {
    getMovieDetails: async (tmdbId: number) => {
        const cached = getCachedValue(movieDetailCache, tmdbId);

        if (cached) {
            return cached;
        }

        const movie = await fetchTmdb<TmdbMovieDetail>(`/movie/${tmdbId}`, {
            append_to_response: "credits",
            language: tmdbLanguage,
        });

        setCachedValue(movieDetailCache, tmdbId, movie, movieDetailCacheTtlMs);

        return movie;
    },
    searchMovies: async (query: string) => {
        const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
        const cached = getCachedValue(movieSearchCache, normalizedQuery);

        if (cached) {
            return cached;
        }

        const result = await fetchTmdb<TmdbSearchResponse>("/search/movie", {
            include_adult: "false",
            language: tmdbLanguage,
            query,
        });

        setCachedValue(movieSearchCache, normalizedQuery, result, movieSearchCacheTtlMs);

        return result;
    },
};
