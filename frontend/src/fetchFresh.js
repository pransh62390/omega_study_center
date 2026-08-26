export function withCacheBust(url) {
  const parsed = new URL(url, window.location.href);
  parsed.searchParams.set("_", String(Date.now()));
  return parsed.toString();
}

export function fetchFresh(url, options = {}) {
  return fetch(withCacheBust(url), {
    ...options,
    cache: "no-store",
  });
}
