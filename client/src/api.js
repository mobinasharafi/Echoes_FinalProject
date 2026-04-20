// Keeps API requests and shared URL helpers in one place

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "";

function buildUrl(path) {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

function getAuthHeaders(isJson = true) {
  const token = localStorage.getItem("token");

  const headers = {};

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// Builds full file URLs safely for local use and later deployment
export function getFileUrl(filePath) {
  if (!filePath) {
    return "";
  }

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  return `${window.location.origin}${filePath}`;
}

async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.error || data.message || "Request failed"
        : data || "Request failed";

    throw new Error(message);
  }

  return data;
}

export async function apiGet(path, useAuth = false) {
  const res = await fetch(buildUrl(path), {
    headers: useAuth ? getAuthHeaders(false) : undefined,
  });

  return handleResponse(res);
}

export async function apiPost(path, body, useAuth = false) {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: useAuth
      ? getAuthHeaders(true)
      : {
          "Content-Type": "application/json",
        },
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function apiPatch(path, body, useAuth = false) {
  const res = await fetch(buildUrl(path), {
    method: "PATCH",
    headers: useAuth
      ? getAuthHeaders(true)
      : {
          "Content-Type": "application/json",
        },
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function apiDelete(path, useAuth = false) {
  const res = await fetch(buildUrl(path), {
    method: "DELETE",
    headers: useAuth ? getAuthHeaders(false) : undefined,
  });

  return handleResponse(res);
}

export async function copyText(text) {
  await navigator.clipboard.writeText(text);
}