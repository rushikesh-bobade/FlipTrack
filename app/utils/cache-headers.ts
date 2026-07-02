export const CACHE_PUBLIC_PAGE = "public, s-maxage=3600, stale-while-revalidate=86400";

export const CACHE_LEGAL_PAGE = "public, s-maxage=86400, stale-while-revalidate=604800";

export const CACHE_PRIVATE_SHARED_DATA = "private, max-age=300, stale-while-revalidate=600";

export const CACHE_PRIVATE_NO_STORE = "private, no-store, no-cache, must-revalidate";
