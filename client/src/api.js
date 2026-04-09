// Keeping fetch logic in one place
function getAuthHeaders() {
  const token = localStorage.getItem("token");

  if (!token) {
    return {
      "Content-Type": "application/json",
    };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.message || "Request failed"
        : data || "Request failed";

    throw new Error(`Request failed (${res.status}): ${message}`);
  }

  return data;
}

export async function apiGet(path) {
  const res = await fetch(path);
  return handleResponse(res);
}

export async function apiPost(path, body, useAuth = false) {
  const res = await fetch(path, {
    method: "POST",
    headers: useAuth
      ? getAuthHeaders()
      : {
          "Content-Type": "application/json",
        },
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}