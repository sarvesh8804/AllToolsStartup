export type DnsRecordEntry = {
  type: string;
  name: string;
  description: string;
  example: string;
};

export type DnsRecordCategory = {
  id: string;
  title: string;
  entries: DnsRecordEntry[];
};

export const DNS_RECORD_TYPES: DnsRecordCategory[] = [
  {
    id: "address",
    title: "Address records",
    entries: [
      {
        type: "A",
        name: "IPv4 address",
        description:
          "Maps a hostname to a 32-bit IPv4 address. The most common record for websites.",
        example: "example.com. 300 IN A 93.184.216.34",
      },
      {
        type: "AAAA",
        name: "IPv6 address",
        description:
          "Maps a hostname to a 128-bit IPv6 address. Used alongside A for dual-stack hosts.",
        example: "example.com. 300 IN AAAA 2606:2800:220:1:248:1893:25c8:1946",
      },
    ],
  },
  {
    id: "alias",
    title: "Aliases & names",
    entries: [
      {
        type: "CNAME",
        name: "Canonical name",
        description:
          "Aliases one hostname to another. Cannot coexist with other records on the same name.",
        example: "www.example.com. 300 IN CNAME example.com.",
      },
      {
        type: "PTR",
        name: "Pointer",
        description:
          "Reverse DNS — maps an IP address to a hostname. Used in in-addr.arpa zones.",
        example: "34.216.184.93.in-addr.arpa. IN PTR example.com.",
      },
    ],
  },
  {
    id: "mail",
    title: "Mail",
    entries: [
      {
        type: "MX",
        name: "Mail exchange",
        description:
          "Specifies mail servers for a domain with priority. Lower numbers are preferred.",
        example: "example.com. 3600 IN MX 10 mail.example.com.",
      },
      {
        type: "TXT",
        name: "Text",
        description:
          "Arbitrary text. Used for SPF, DKIM, DMARC, domain verification, and more.",
        example: 'example.com. 300 IN TXT "v=spf1 include:_spf.google.com ~all"',
      },
    ],
  },
  {
    id: "authority",
    title: "Authority & delegation",
    entries: [
      {
        type: "NS",
        name: "Name server",
        description:
          "Delegates a DNS zone to authoritative name servers for the domain.",
        example: "example.com. 86400 IN NS ns1.example.com.",
      },
      {
        type: "SOA",
        name: "Start of authority",
        description:
          "Authoritative information about a zone: primary NS, admin email, serial, timers.",
        example: "example.com. 3600 IN SOA ns1.example.com. hostmaster.example.com. 2024010101 7200 3600 1209600 300",
      },
    ],
  },
  {
    id: "service",
    title: "Service discovery",
    entries: [
      {
        type: "SRV",
        name: "Service locator",
        description:
          "Defines host and port for a service (e.g. _sip._tcp). Includes priority and weight.",
        example: "_xmpp-server._tcp.example.com. 300 IN SRV 10 5 5269 xmpp.example.com.",
      },
    ],
  },
  {
    id: "security",
    title: "Security & DNSSEC",
    entries: [
      {
        type: "CAA",
        name: "Certification authority authorization",
        description:
          "Specifies which CAs may issue TLS certificates for the domain.",
        example: 'example.com. 300 IN CAA 0 issue "letsencrypt.org"',
      },
      {
        type: "DNSKEY",
        name: "DNS public key",
        description: "DNSSEC public signing key for a zone.",
        example: "example.com. 3600 IN DNSKEY 256 3 13 (...)",
      },
      {
        type: "DS",
        name: "Delegation signer",
        description:
          "DNSSEC record in the parent zone that references a child zone DNSKEY.",
        example: "example.com. 3600 IN DS 2371 13 2 (...)",
      },
      {
        type: "RRSIG",
        name: "Resource record signature",
        description: "DNSSEC signature covering a set of resource records.",
        example: "example.com. 300 IN RRSIG A 13 2 300 (...)",
      },
    ],
  },
];

export function filterDnsRecords(
  query: string,
  categories: DnsRecordCategory[] = DNS_RECORD_TYPES,
): DnsRecordCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return categories;
  return categories
    .map((cat) => ({
      ...cat,
      entries: cat.entries.filter((e) => {
        const hay = [e.type, e.name, e.description, e.example, cat.title]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      }),
    }))
    .filter((cat) => cat.entries.length > 0);
}

export function countDnsRecordEntries(
  categories: DnsRecordCategory[],
): number {
  return categories.reduce((n, c) => n + c.entries.length, 0);
}

export function findDnsRecord(
  type: string,
  categories: DnsRecordCategory[] = DNS_RECORD_TYPES,
): DnsRecordEntry | undefined {
  const t = type.trim().toUpperCase();
  for (const cat of categories) {
    const hit = cat.entries.find((e) => e.type === t);
    if (hit) return hit;
  }
  return undefined;
}
