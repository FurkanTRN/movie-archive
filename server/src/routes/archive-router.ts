import { Router } from "express";
import { requireAuth } from "../auth/auth-middleware.js";
import { archiveRepository } from "../database/archive-repository.js";
import { movieRepository } from "../database/movie-repository.js";
import { AppError } from "../middleware/error-handler.js";
import { tmdbClient } from "../tmdb/tmdb-client.js";
import { normalizeTmdbMovieDetail } from "../tmdb/tmdb-normalizers.js";
import { archiveCreateBodySchema, archiveIdParamsSchema, archiveQuerySchema, archiveUpdateBodySchema } from "../validation/archive-schemas.js";
import { parseWithSchema } from "../validation/parse-with-schema.js";

export const archiveRouter = Router();

archiveRouter.use(requireAuth);

archiveRouter.get("/", (request, response) => {
    const userId = request.session.user!.id;
    const { genre, limit, minRating, page, q: query, sort, year } = parseWithSchema(archiveQuerySchema, request.query);

    const result = archiveRepository.listArchiveEntries(userId, { genre, limit, minRating, page, query, sort, year });

    response.json({
        entries: result.entries,
        filters: result.filters,
        pagination: result.pagination,
    });
});

archiveRouter.post("/", async (request, response, next) => {
    try {
        const userId = request.session.user!.id;
        const { tmdbId, watchedAt, personalRating, notes } = parseWithSchema(archiveCreateBodySchema, request.body);

        let movieId = movieRepository.getMovieIdByTmdbId(tmdbId);

        if (!movieId) {
            const movieDetail = normalizeTmdbMovieDetail(await tmdbClient.getMovieDetails(tmdbId));
            movieId = movieRepository.upsertMovieFromTmdbDetail(movieDetail);
        }

        const existingEntryId = archiveRepository.findArchiveEntryIdByUserAndMovie(userId, movieId);

        if (existingEntryId) {
            throw new AppError("This movie is already in the archive", 409);
        }

        const archiveEntryId = archiveRepository.createArchiveEntry({
            movieId,
            notes,
            personalRating,
            userId,
            watchedAt,
        });

        const entry = archiveRepository.findArchiveEntryById(archiveEntryId, userId);

        response.status(201).json({
            entry,
        });
    } catch (error) {
        next(error);
    }
});

archiveRouter.patch("/:id", (request, response, next) => {
    try {
        const userId = request.session.user!.id;
        const { id: archiveEntryId } = parseWithSchema(archiveIdParamsSchema, request.params);
        const { watchedAt, personalRating, notes } = parseWithSchema(archiveUpdateBodySchema, request.body);

        const updated = archiveRepository.updateArchiveEntry(
            archiveEntryId,
            userId,
            watchedAt,
            personalRating,
            notes,
        );

        if (!updated) {
            throw new AppError("Archive entry not found", 404);
        }

        response.json({
            entry: archiveRepository.findArchiveEntryById(archiveEntryId, userId),
        });
    } catch (error) {
        next(error);
    }
});

archiveRouter.delete("/:id", (request, response, next) => {
    try {
        const userId = request.session.user!.id;
        const { id: archiveEntryId } = parseWithSchema(archiveIdParamsSchema, request.params);

        const deleted = archiveRepository.deleteArchiveEntry(archiveEntryId, userId);

        if (!deleted) {
            throw new AppError("Archive entry not found", 404);
        }

        response.status(204).send();
    } catch (error) {
        next(error);
    }
});
