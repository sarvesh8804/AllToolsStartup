export type HttpStatusEntry = {
  code: number;
  name: string;
  description: string;
};

export type HttpStatusCategory = {
  id: string;
  title: string;
  range: string;
  entries: HttpStatusEntry[];
};

export const HTTP_STATUS_CODES: HttpStatusCategory[] = [
  {
    id: "1xx",
    title: "Informational",
    range: "1xx",
    entries: [
      {
        code: 100,
        name: "Continue",
        description:
          "The server received the request headers and the client may send the body.",
      },
      {
        code: 101,
        name: "Switching Protocols",
        description:
          "The server is switching protocols as requested by the client (e.g. Upgrade).",
      },
      {
        code: 102,
        name: "Processing",
        description:
          "WebDAV: the server accepted the request but has not finished processing it.",
      },
      {
        code: 103,
        name: "Early Hints",
        description:
          "Hints that the client can start preloading resources while the response is prepared.",
      },
    ],
  },
  {
    id: "2xx",
    title: "Success",
    range: "2xx",
    entries: [
      {
        code: 200,
        name: "OK",
        description: "The request succeeded. The response body depends on the method.",
      },
      {
        code: 201,
        name: "Created",
        description:
          "A new resource was created. Often returned after POST or PUT.",
      },
      {
        code: 202,
        name: "Accepted",
        description:
          "The request was accepted for processing but may not be complete yet.",
      },
      {
        code: 203,
        name: "Non-Authoritative Information",
        description:
          "The response was transformed by a proxy; the origin status may differ.",
      },
      {
        code: 204,
        name: "No Content",
        description:
          "Success with no response body. Common for DELETE or empty PUT updates.",
      },
      {
        code: 205,
        name: "Reset Content",
        description:
          "Ask the client to reset the document view (e.g. clear a form).",
      },
      {
        code: 206,
        name: "Partial Content",
        description:
          "Partial response for a Range request (e.g. resumable downloads).",
      },
      {
        code: 207,
        name: "Multi-Status",
        description:
          "WebDAV: multiple status codes for different parts of the request.",
      },
      {
        code: 208,
        name: "Already Reported",
        description:
          "WebDAV: members were already enumerated and will not be repeated.",
      },
      {
        code: 226,
        name: "IM Used",
        description:
          "The server fulfilled a GET with instance-manipulation (RFC 3229).",
      },
    ],
  },
  {
    id: "3xx",
    title: "Redirection",
    range: "3xx",
    entries: [
      {
        code: 300,
        name: "Multiple Choices",
        description:
          "Multiple representations are available; the client or agent should choose.",
      },
      {
        code: 301,
        name: "Moved Permanently",
        description:
          "The resource has a new permanent URI. Clients should update bookmarks.",
      },
      {
        code: 302,
        name: "Found",
        description:
          "Temporary redirect. Historically used like 303; prefer 307/308 when precise.",
      },
      {
        code: 303,
        name: "See Other",
        description:
          "Retrieve the resource with a GET at another URI (post-redirect-get).",
      },
      {
        code: 304,
        name: "Not Modified",
        description:
          "Cached representation is still valid; no body is returned.",
      },
      {
        code: 307,
        name: "Temporary Redirect",
        description:
          "Temporary redirect that preserves the original request method.",
      },
      {
        code: 308,
        name: "Permanent Redirect",
        description:
          "Permanent redirect that preserves the original request method.",
      },
    ],
  },
  {
    id: "4xx",
    title: "Client Error",
    range: "4xx",
    entries: [
      {
        code: 400,
        name: "Bad Request",
        description:
          "The server cannot process the request due to a client error (malformed syntax).",
      },
      {
        code: 401,
        name: "Unauthorized",
        description:
          "Authentication is required or failed. Often paired with WWW-Authenticate.",
      },
      {
        code: 402,
        name: "Payment Required",
        description: "Reserved for future use; rarely implemented.",
      },
      {
        code: 403,
        name: "Forbidden",
        description:
          "The server understood the request but refuses to authorize it.",
      },
      {
        code: 404,
        name: "Not Found",
        description: "No resource matches the request URI.",
      },
      {
        code: 405,
        name: "Method Not Allowed",
        description:
          "The method is not supported for this resource. Check Allow header.",
      },
      {
        code: 406,
        name: "Not Acceptable",
        description:
          "No representation matches the Accept* headers from the client.",
      },
      {
        code: 407,
        name: "Proxy Authentication Required",
        description: "Authenticate with a proxy before the request can proceed.",
      },
      {
        code: 408,
        name: "Request Timeout",
        description:
          "The server timed out waiting for the complete request.",
      },
      {
        code: 409,
        name: "Conflict",
        description:
          "The request conflicts with the current state of the resource.",
      },
      {
        code: 410,
        name: "Gone",
        description:
          "The resource is permanently unavailable and has no forwarding address.",
      },
      {
        code: 411,
        name: "Length Required",
        description: "Content-Length is required and was not provided.",
      },
      {
        code: 412,
        name: "Precondition Failed",
        description:
          "A precondition in the request headers evaluated to false.",
      },
      {
        code: 413,
        name: "Content Too Large",
        description: "The request body is larger than the server is willing to process.",
      },
      {
        code: 414,
        name: "URI Too Long",
        description: "The request URI is longer than the server will accept.",
      },
      {
        code: 415,
        name: "Unsupported Media Type",
        description:
          "The payload format is not supported for this method/resource.",
      },
      {
        code: 416,
        name: "Range Not Satisfiable",
        description:
          "The requested Range cannot be satisfied for the current resource.",
      },
      {
        code: 417,
        name: "Expectation Failed",
        description:
          "The expectation given in the Expect header could not be met.",
      },
      {
        code: 418,
        name: "I'm a teapot",
        description:
          "April Fools’ joke (HTCPCP). Sometimes used humorously; not a real protocol status.",
      },
      {
        code: 421,
        name: "Misdirected Request",
        description:
          "The request was directed at a server that cannot produce a response.",
      },
      {
        code: 422,
        name: "Unprocessable Content",
        description:
          "Well-formed request, but semantic errors prevent processing (common in APIs/WebDAV).",
      },
      {
        code: 423,
        name: "Locked",
        description: "WebDAV: the resource is locked.",
      },
      {
        code: 424,
        name: "Failed Dependency",
        description:
          "WebDAV: the request failed because a dependent request failed.",
      },
      {
        code: 425,
        name: "Too Early",
        description:
          "The server is unwilling to risk processing a request that might be replayed.",
      },
      {
        code: 426,
        name: "Upgrade Required",
        description:
          "The client should switch to a different protocol (see Upgrade header).",
      },
      {
        code: 428,
        name: "Precondition Required",
        description:
          "The origin requires the request to be conditional (e.g. If-Match).",
      },
      {
        code: 429,
        name: "Too Many Requests",
        description:
          "Rate limit exceeded. Often includes Retry-After.",
      },
      {
        code: 431,
        name: "Request Header Fields Too Large",
        description:
          "Header fields are too large for the server to process.",
      },
      {
        code: 451,
        name: "Unavailable For Legal Reasons",
        description:
          "Access denied for legal reasons (e.g. censorship, court order).",
      },
    ],
  },
  {
    id: "5xx",
    title: "Server Error",
    range: "5xx",
    entries: [
      {
        code: 500,
        name: "Internal Server Error",
        description:
          "Unexpected condition prevented the server from fulfilling the request.",
      },
      {
        code: 501,
        name: "Not Implemented",
        description:
          "The server does not support the functionality required to fulfill the request.",
      },
      {
        code: 502,
        name: "Bad Gateway",
        description:
          "A gateway or proxy received an invalid response from an upstream server.",
      },
      {
        code: 503,
        name: "Service Unavailable",
        description:
          "Temporary overload or maintenance. Often includes Retry-After.",
      },
      {
        code: 504,
        name: "Gateway Timeout",
        description:
          "A gateway or proxy did not receive a timely response from upstream.",
      },
      {
        code: 505,
        name: "HTTP Version Not Supported",
        description:
          "The server does not support the HTTP version used in the request.",
      },
      {
        code: 506,
        name: "Variant Also Negotiates",
        description:
          "Server configuration error in content negotiation (RFC 2295).",
      },
      {
        code: 507,
        name: "Insufficient Storage",
        description:
          "WebDAV: the server cannot store the representation needed to complete the request.",
      },
      {
        code: 508,
        name: "Loop Detected",
        description: "WebDAV: an infinite loop was detected while processing.",
      },
      {
        code: 510,
        name: "Not Extended",
        description:
          "Further extensions to the request are required (RFC 2774).",
      },
      {
        code: 511,
        name: "Network Authentication Required",
        description:
          "Client must authenticate to gain network access (captive portal).",
      },
    ],
  },
];

export function filterHttpStatusCodes(
  query: string,
  categories: HttpStatusCategory[] = HTTP_STATUS_CODES,
): HttpStatusCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return categories;
  return categories
    .map((cat) => ({
      ...cat,
      entries: cat.entries.filter((e) => {
        const hay = [String(e.code), e.name, e.description, cat.title, cat.range]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      }),
    }))
    .filter((cat) => cat.entries.length > 0);
}

export function countHttpStatusEntries(categories: HttpStatusCategory[]): number {
  return categories.reduce((n, c) => n + c.entries.length, 0);
}

export function findHttpStatus(
  code: number,
  categories: HttpStatusCategory[] = HTTP_STATUS_CODES,
): HttpStatusEntry | undefined {
  for (const cat of categories) {
    const hit = cat.entries.find((e) => e.code === code);
    if (hit) return hit;
  }
  return undefined;
}
