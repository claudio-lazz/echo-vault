type JsonResult<T = unknown> = {
  status: number;
  json: T;
};

async function postJson<T = unknown>(url: string, body?: unknown): Promise<JsonResult<T>> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json: json as T };
}

async function getJson<T = unknown>(url: string): Promise<JsonResult<T>> {
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json: json as T };
}

export { postJson, getJson };
