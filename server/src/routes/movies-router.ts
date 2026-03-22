import { Router } from "express";
import { requireAuth } from "../auth/auth-middleware.js";
import { tmdbClient } from "../tmdb/tmdb-client.js";
import { normalizeTmdbMovieDetail, normalizeTmdbSearchResult } from "../tmdb/tmdb-normalizers.js";
import { movieIdParamsSchema, movieSearchQuerySchema } from "../validation/movies-schemas.js";
import { parseWithSchema } from "../validation/parse-with-schema.js";

export const moviesRouter = Router();

moviesRouter.use(requireAuth);

moviesRouter.get("/search", async (request, response, next) => {
    try {
        const { q: query } = parseWithSchema(movieSearchQuerySchema, request.query);

        const result = await tmdbClient.searchMovies(query);

        response.json({
            page: result.page,
            results: result.results.map(normalizeTmdbSearchResult),
            totalPages: result.total_pages,
            totalResults: result.total_results,
        });
    } catch (error) {
        next(error);
    }
});

moviesRouter.get("/tmdb/:tmdbId", async (request, response, next) => {
    try {
        const { tmdbId } = parseWithSchema(movieIdParamsSchema, request.params);

        const movie = await tmdbClient.getMovieDetails(tmdbId);

        response.json({
            movie: normalizeTmdbMovieDetail(movie),
        });
    } catch (error) {
        next(error);
    }
});
