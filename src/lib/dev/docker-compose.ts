export type DockerRunService = {
  image: string;
  containerName?: string;
  command?: string[];
  ports: string[];
  environment: Record<string, string>;
  volumes: string[];
  restart?: string;
  detach: boolean;
};

export type DockerComposeResult =
  | { ok: true; yaml: string; service: DockerRunService }
  | { ok: false; error: string };

export const SAMPLE_DOCKER_RUN =
  'docker run -d --name forge-app -p 3000:3000 -e NODE_ENV=production -v ./data:/app/data forge/app:latest';

function tokenizeCommand(input: string): string[] {
  const tokens: string[] = [];
  let cur = "";
  let quote: "'" | '"' | null = null;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]!;
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (cur) {
        tokens.push(cur);
        cur = "";
      }
      continue;
    }
    cur += ch;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

/** Parse a docker run command into structured fields. */
export function parseDockerRun(input: string): DockerComposeResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste a docker run command." };
  }

  const tokens = tokenizeCommand(trimmed);
  if (tokens[0] !== "docker" || tokens[1] !== "run") {
    return { ok: false, error: 'Command must start with "docker run".' };
  }

  const service: DockerRunService = {
    image: "",
    ports: [],
    environment: {},
    volumes: [],
    detach: false,
  };

  let i = 2;
  while (i < tokens.length) {
    const token = tokens[i]!;
    if (token === "-d" || token === "--detach") {
      service.detach = true;
      i += 1;
      continue;
    }
    if (token === "--name") {
      service.containerName = tokens[i + 1];
      i += 2;
      continue;
    }
    if (token === "-p" || token === "--publish") {
      service.ports.push(tokens[i + 1] ?? "");
      i += 2;
      continue;
    }
    if (token === "-e" || token === "--env") {
      const pair = tokens[i + 1] ?? "";
      const eq = pair.indexOf("=");
      if (eq > 0) service.environment[pair.slice(0, eq)] = pair.slice(eq + 1);
      i += 2;
      continue;
    }
    if (token === "-v" || token === "--volume") {
      service.volumes.push(tokens[i + 1] ?? "");
      i += 2;
      continue;
    }
    if (token === "--restart") {
      service.restart = tokens[i + 1];
      i += 2;
      continue;
    }
    if (token.startsWith("-")) {
      return { ok: false, error: `Unsupported flag: ${token}` };
    }
    break;
  }

  if (i >= tokens.length) {
    return { ok: false, error: "Missing image name." };
  }

  service.image = tokens[i]!;
  service.command = tokens.slice(i + 1);
  return { ok: true, yaml: dockerRunToComposeYaml(service), service };
}

function yamlQuote(value: string): string {
  if (/[:#{}[\],&*?]|^\s|\s$/.test(value)) return JSON.stringify(value);
  return value;
}

/** Convert parsed docker run service to docker-compose YAML. */
export function dockerRunToComposeYaml(service: DockerRunService): string {
  const name = service.containerName || "app";
  const lines: string[] = [
    "services:",
    `  ${name}:`,
    `    image: ${yamlQuote(service.image)}`,
  ];

  if (service.containerName) {
    lines.push(`    container_name: ${yamlQuote(service.containerName)}`);
  }
  if (service.restart) {
    lines.push(`    restart: ${yamlQuote(service.restart)}`);
  }
  if (service.ports.length > 0) {
    lines.push("    ports:");
    for (const port of service.ports) lines.push(`      - "${port}"`);
  }
  if (Object.keys(service.environment).length > 0) {
    lines.push("    environment:");
    for (const [key, value] of Object.entries(service.environment)) {
      lines.push(`      ${key}: ${yamlQuote(value)}`);
    }
  }
  if (service.volumes.length > 0) {
    lines.push("    volumes:");
    for (const volume of service.volumes) lines.push(`      - ${yamlQuote(volume)}`);
  }
  if (service.command && service.command.length > 0) {
    lines.push("    command:");
    for (const part of service.command) {
      lines.push(`      - ${yamlQuote(part)}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

/** Parse docker run and return compose YAML. */
export function convertDockerRunToCompose(input: string): DockerComposeResult {
  return parseDockerRun(input);
}
