export function apiFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.delete("Authorization");
  headers.set("X-Requested-With", "XMLHttpRequest");

  return fetch(input, {
    ...init,
    credentials: "include",
    headers,
  });
}
