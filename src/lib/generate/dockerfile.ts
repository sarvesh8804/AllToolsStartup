export type DockerfileTemplate = {
  id: string;
  label: string;
  description: string;
  /** Default options when this template is selected. */
  defaults: DockerfileOptions;
};

export type DockerfileOptions = {
  templateId: string;
  /** Base image tag, e.g. 22-alpine */
  runtimeVersion: string;
  /** Container listen port */
  port: number;
  /** Working directory inside the image */
  workdir: string;
  /** App start command (shell form) */
  startCommand: string;
  /** Include a non-root USER */
  nonRootUser: boolean;
  /** Multi-stage build where the template supports it */
  multiStage: boolean;
};

export const DOCKERFILE_TEMPLATES: DockerfileTemplate[] = [
  {
    id: "node",
    label: "Node.js",
    description: "npm ci + production start",
    defaults: {
      templateId: "node",
      runtimeVersion: "22-alpine",
      port: 3000,
      workdir: "/app",
      startCommand: "node server.js",
      nonRootUser: true,
      multiStage: false,
    },
  },
  {
    id: "nextjs",
    label: "Next.js",
    description: "standalone output multi-stage",
    defaults: {
      templateId: "nextjs",
      runtimeVersion: "22-alpine",
      port: 3000,
      workdir: "/app",
      startCommand: "node server.js",
      nonRootUser: true,
      multiStage: true,
    },
  },
  {
    id: "python",
    label: "Python",
    description: "pip install + uvicorn/gunicorn-ready",
    defaults: {
      templateId: "python",
      runtimeVersion: "3.12-slim",
      port: 8000,
      workdir: "/app",
      startCommand: 'uvicorn main:app --host 0.0.0.0 --port 8000',
      nonRootUser: true,
      multiStage: false,
    },
  },
  {
    id: "go",
    label: "Go",
    description: "multi-stage static binary",
    defaults: {
      templateId: "go",
      runtimeVersion: "1.22",
      port: 8080,
      workdir: "/app",
      startCommand: "/app/server",
      nonRootUser: true,
      multiStage: true,
    },
  },
  {
    id: "static",
    label: "Static (nginx)",
    description: "Serve a built static site",
    defaults: {
      templateId: "static",
      runtimeVersion: "1.27-alpine",
      port: 80,
      workdir: "/usr/share/nginx/html",
      startCommand: "nginx -g 'daemon off;'",
      nonRootUser: false,
      multiStage: false,
    },
  },
];

export const DEFAULT_DOCKERFILE_OPTIONS: DockerfileOptions =
  DOCKERFILE_TEMPLATES[0]!.defaults;

function clampPort(port: number): number {
  const n = Math.floor(port);
  if (!Number.isFinite(n)) return 3000;
  return Math.max(1, Math.min(65535, n));
}

function userBlock(nonRoot: boolean): string {
  if (!nonRoot) return "";
  return `
RUN addgroup -S app && adduser -S app -G app
USER app
`.trimEnd();
}

function buildNode(opts: DockerfileOptions): string {
  const port = clampPort(opts.port);
  const ver = opts.runtimeVersion.trim() || "22-alpine";
  const workdir = opts.workdir.trim() || "/app";
  const start = opts.startCommand.trim() || "node server.js";

  if (opts.multiStage) {
    return `# syntax=docker/dockerfile:1
FROM node:${ver} AS deps
WORKDIR ${workdir}
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:${ver} AS build
WORKDIR ${workdir}
COPY --from=deps ${workdir}/node_modules ./node_modules
COPY . .
RUN npm run build
${opts.nonRootUser ? "RUN addgroup -S app && adduser -S app -G app\n" : ""}
FROM node:${ver} AS runner
WORKDIR ${workdir}
ENV NODE_ENV=production
COPY --from=build ${workdir} ./
${opts.nonRootUser ? "USER app\n" : ""}EXPOSE ${port}
CMD ${JSON.stringify(start.split(/\s+/))}
`;
  }

  return `# syntax=docker/dockerfile:1
FROM node:${ver}
WORKDIR ${workdir}
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY . .
${userBlock(opts.nonRootUser)}
ENV NODE_ENV=production
EXPOSE ${port}
CMD ${JSON.stringify(start.split(/\s+/))}
`;
}

function buildNextjs(opts: DockerfileOptions): string {
  const port = clampPort(opts.port);
  const ver = opts.runtimeVersion.trim() || "22-alpine";
  // Next standalone expects /app structure from output tracing
  return `# syntax=docker/dockerfile:1
# Requires next.config: output: 'standalone'
FROM node:${ver} AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:${ver} AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:${ver} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=${port}
${opts.nonRootUser ? "RUN addgroup -S app && adduser -S app -G app\n" : ""}COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
${opts.nonRootUser ? "USER app\n" : ""}EXPOSE ${port}
CMD ["node", "server.js"]
`;
}

function buildPython(opts: DockerfileOptions): string {
  const port = clampPort(opts.port);
  const ver = opts.runtimeVersion.trim() || "3.12-slim";
  const workdir = opts.workdir.trim() || "/app";
  const start = opts.startCommand.trim() || `uvicorn main:app --host 0.0.0.0 --port ${port}`;

  return `# syntax=docker/dockerfile:1
FROM python:${ver}
WORKDIR ${workdir}
ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
${opts.nonRootUser ? "RUN useradd -m appuser && chown -R appuser:appuser " + workdir + "\nUSER appuser\n" : ""}EXPOSE ${port}
CMD ${JSON.stringify(start.split(/\s+/))}
`;
}

function buildGo(opts: DockerfileOptions): string {
  const port = clampPort(opts.port);
  const ver = opts.runtimeVersion.trim() || "1.22";

  return `# syntax=docker/dockerfile:1
FROM golang:${ver}-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/server ./cmd/server

FROM alpine:3.20
WORKDIR /app
${opts.nonRootUser ? "RUN addgroup -S app && adduser -S app -G app\n" : ""}COPY --from=build /out/server /app/server
${opts.nonRootUser ? "USER app\n" : ""}EXPOSE ${port}
CMD ["/app/server"]
`;
}

function buildStatic(opts: DockerfileOptions): string {
  const ver = opts.runtimeVersion.trim() || "1.27-alpine";
  const port = clampPort(opts.port);
  return `# syntax=docker/dockerfile:1
FROM nginx:${ver}
COPY ./dist /usr/share/nginx/html
EXPOSE ${port}
CMD ["nginx", "-g", "daemon off;"]
`;
}

export function getDockerfileTemplate(
  id: string,
): DockerfileTemplate | undefined {
  return DOCKERFILE_TEMPLATES.find((t) => t.id === id);
}

/** Generate a Dockerfile string from a template + options. */
export function generateDockerfile(options: DockerfileOptions): string {
  const id = options.templateId;
  switch (id) {
    case "node":
      return buildNode(options).trimEnd() + "\n";
    case "nextjs":
      return buildNextjs(options).trimEnd() + "\n";
    case "python":
      return buildPython(options).trimEnd() + "\n";
    case "go":
      return buildGo(options).trimEnd() + "\n";
    case "static":
      return buildStatic(options).trimEnd() + "\n";
    default:
      return `# Unknown template: ${id}\n`;
  }
}
