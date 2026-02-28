// Keeping fetch logic in one place
// JWT headers to be added
export async function apiGet(path) {
  const res = await fetch(path);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }

  return res.json();
}