export type PortEntry = {
  port: number;
  protocol: string;
  service: string;
  description: string;
};

export type PortCategory = {
  id: string;
  title: string;
  entries: PortEntry[];
};

export const PORT_NUMBERS: PortCategory[] = [
  {
    id: "web",
    title: "Web & HTTP",
    entries: [
      { port: 80, protocol: "TCP", service: "HTTP", description: "Unencrypted web traffic." },
      { port: 443, protocol: "TCP", service: "HTTPS", description: "TLS-encrypted web traffic." },
      { port: 8080, protocol: "TCP", service: "HTTP alt", description: "Common alternate HTTP port for dev proxies." },
      { port: 8443, protocol: "TCP", service: "HTTPS alt", description: "Common alternate HTTPS port." },
      { port: 8000, protocol: "TCP", service: "HTTP dev", description: "Django, Python dev servers, etc." },
      { port: 3000, protocol: "TCP", service: "Node dev", description: "React, Next.js, Express dev default." },
    ],
  },
  {
    id: "mail",
    title: "Email",
    entries: [
      { port: 25, protocol: "TCP", service: "SMTP", description: "Mail transfer between servers." },
      { port: 465, protocol: "TCP", service: "SMTPS", description: "SMTP over TLS (legacy implicit)." },
      { port: 587, protocol: "TCP", service: "SMTP submission", description: "Client mail submission with STARTTLS." },
      { port: 110, protocol: "TCP", service: "POP3", description: "Retrieve mail (unencrypted)." },
      { port: 995, protocol: "TCP", service: "POP3S", description: "POP3 over TLS." },
      { port: 143, protocol: "TCP", service: "IMAP", description: "Mailbox sync (unencrypted)." },
      { port: 993, protocol: "TCP", service: "IMAPS", description: "IMAP over TLS." },
    ],
  },
  {
    id: "remote",
    title: "Remote access",
    entries: [
      { port: 22, protocol: "TCP", service: "SSH", description: "Secure shell and file transfer." },
      { port: 23, protocol: "TCP", service: "Telnet", description: "Unencrypted remote terminal (legacy)." },
      { port: 3389, protocol: "TCP", service: "RDP", description: "Windows Remote Desktop." },
      { port: 5900, protocol: "TCP", service: "VNC", description: "Virtual Network Computing display." },
    ],
  },
  {
    id: "file",
    title: "File transfer",
    entries: [
      { port: 21, protocol: "TCP", service: "FTP", description: "File Transfer Protocol control channel." },
      { port: 22, protocol: "TCP", service: "SFTP", description: "SSH file transfer (same port as SSH)." },
      { port: 69, protocol: "UDP", service: "TFTP", description: "Trivial FTP for boot/PXE." },
    ],
  },
  {
    id: "dns",
    title: "DNS & discovery",
    entries: [
      { port: 53, protocol: "TCP/UDP", service: "DNS", description: "Domain name resolution." },
      { port: 5353, protocol: "UDP", service: "mDNS", description: "Multicast DNS (Bonjour)." },
    ],
  },
  {
    id: "database",
    title: "Databases",
    entries: [
      { port: 3306, protocol: "TCP", service: "MySQL", description: "MySQL / MariaDB default." },
      { port: 5432, protocol: "TCP", service: "PostgreSQL", description: "PostgreSQL default." },
      { port: 27017, protocol: "TCP", service: "MongoDB", description: "MongoDB default." },
      { port: 6379, protocol: "TCP", service: "Redis", description: "Redis default." },
      { port: 1433, protocol: "TCP", service: "MSSQL", description: "Microsoft SQL Server." },
      { port: 1521, protocol: "TCP", service: "Oracle", description: "Oracle database listener." },
    ],
  },
  {
    id: "other",
    title: "Common services",
    entries: [
      { port: 1194, protocol: "UDP", service: "OpenVPN", description: "OpenVPN default." },
      { port: 1883, protocol: "TCP", service: "MQTT", description: "IoT messaging (unencrypted)." },
      { port: 5672, protocol: "TCP", service: "AMQP", description: "RabbitMQ default." },
      { port: 9200, protocol: "TCP", service: "Elasticsearch", description: "Elasticsearch HTTP API." },
      { port: 11211, protocol: "TCP", service: "Memcached", description: "Memcached default." },
    ],
  },
];

export function filterPortNumbers(
  query: string,
  categories: PortCategory[] = PORT_NUMBERS,
): PortCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return categories;
  return categories
    .map((cat) => ({
      ...cat,
      entries: cat.entries.filter((e) => {
        const hay = [
          String(e.port),
          e.protocol,
          e.service,
          e.description,
          cat.title,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      }),
    }))
    .filter((cat) => cat.entries.length > 0);
}

export function countPortEntries(categories: PortCategory[]): number {
  return categories.reduce((n, c) => n + c.entries.length, 0);
}

export function findPort(
  port: number,
  categories: PortCategory[] = PORT_NUMBERS,
): PortEntry | undefined {
  for (const cat of categories) {
    const hit = cat.entries.find((e) => e.port === port);
    if (hit) return hit;
  }
  return undefined;
}
