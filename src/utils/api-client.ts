const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
    body?: BodyInit | null | object;
    signal?: AbortSignal;
}

interface ApiErrorPayload {
    error?: {
        message?: string;
        statusCode?: number;
    };
}

export class ApiError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 500) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
    }
}

const buildUrl = (pathname: string) => {
    return pathname.startsWith("http") ? pathname : `${apiBaseUrl}${pathname}`;
};

export const apiRequest = async <T>(pathname: string, options: ApiRequestOptions = {}) => {
    const headers = new Headers(options.headers);
    let body = options.body;

    if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof URLSearchParams) && !(body instanceof Blob)) {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(body);
    }

    const response = await fetch(buildUrl(pathname), {
        ...options,
        body,
        credentials: "include",
        headers,
    });

    if (response.status === 204) {
        return undefined as T;
    }

    const contentType = response.headers.get("content-type");
    const payload = contentType?.includes("application/json") ? ((await response.json()) as T | ApiErrorPayload) : undefined;

    if (!response.ok) {
        const apiError = payload as ApiErrorPayload | undefined;
        throw new ApiError(apiError?.error?.message ?? "Request failed", apiError?.error?.statusCode ?? response.status);
    }

    return payload as T;
};
