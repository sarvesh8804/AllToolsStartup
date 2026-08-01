export type UrlQueryParam = {
  key: string;
  value: string;
};

export type ParsedUrl = {
  href: string;
  protocol: string;
  username: string;
  password: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  host: string;
  queryParams: UrlQueryParam[];
};

export type UrlBuilderInput = {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  username: string;
  password: string;
};

export const DEFAULT_URL_BUILDER: UrlBuilderInput = {
  protocol: "https",
  hostname: "api.example.com",
  port: "",
  pathname: "/v1/users",
  search: "?page=1&limit=20",
  hash: "",
  username: "",
  password: "",
};

export const SAMPLE_URL =
  "https://user:pass@api.example.com:8443/v1/users?page=1&limit=20#profile";

function normalizeProtocol(value: string): string {
  const trimmed = value.trim().replace(/:$/, "");
  return trimmed || "https";
}

function parseQueryParams(search: string): UrlQueryParam[] {
  if (!search || search === "?") return [];
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const out: UrlQueryParam[] = [];
  params.forEach((value, key) => {
    out.push({ key, value });
  });
  return out;
}

function withScheme(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function parseUrlInput(
  input: string,
): { ok: true; value: ParsedUrl } | { ok: false; error: string } {
  const raw = input.trim();
  if (!raw) {
    return { ok: false, error: "Paste a URL to parse." };
  }

  try {
    const url = new URL(withScheme(raw));
    const search = url.search;
    return {
      ok: true,
      value: {
        href: url.href,
        protocol: url.protocol.replace(/:$/, ""),
        username: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname || "/",
        search,
        hash: url.hash,
        origin: url.origin,
        host: url.host,
        queryParams: parseQueryParams(search),
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid URL",
    };
  }
}

export function buildUrlFromParts(
  input: UrlBuilderInput,
): { ok: true; url: string; parsed: ParsedUrl } | { ok: false; error: string } {
  const protocol = normalizeProtocol(input.protocol);
  const hostname = input.hostname.trim();
  if (!hostname) {
    return { ok: false, error: "Hostname is required." };
  }

  const port = input.port.trim();
  const pathname = input.pathname.trim() || "/";
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  let search = input.search.trim();
  if (search && !search.startsWith("?")) {
    search = `?${search}`;
  }

  let hash = input.hash.trim();
  if (hash && !hash.startsWith("#")) {
    hash = `#${hash}`;
  }

  const username = input.username.trim();
  const password = input.password.trim();
  const auth =
    username || password
      ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
      : "";

  const portPart = port ? `:${port}` : "";

  const built = `${protocol}://${auth}${hostname}${portPart}${normalizedPath}${search}${hash}`;

  const parsed = parseUrlInput(built);
  if (!parsed.ok) return parsed;
  return { ok: true, url: parsed.value.href, parsed: parsed.value };
}
