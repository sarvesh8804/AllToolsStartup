import type { ToolFamily } from "@/types/tool";

export type HubContent = {
  /** Longer intro for the hub (shown under H1). */
  intro: string[];
  /** Optional “start here” tool slugs (must exist). */
  startHere: string[];
  faqs: { question: string; answer: string }[];
};

export const HUB_CONTENT: Record<ToolFamily, HubContent> = {
  tools: {
    intro: [
      "Forge Tools is a growing library of developer and productivity utilities — formatters, generators, encoders, counters, and more — that run in your browser.",
      "Use this hub to jump into JSON, text, hashing, JWT, regex, and similar jobs without creating an account or uploading files to a server.",
    ],
    startHere: [
      "json-formatter",
      "jwt-decoder",
      "regex-tester",
      "meta-tags-preview",
      "csv-viewer-table",
      "uuid-v4-generator",
      "base64-encode-decode",
    ],
    faqs: [
      {
        question: "Do these tools upload my data?",
        answer:
          "Shipped tools marked private process input locally in your browser. Nothing is sent to Forge servers for those jobs.",
      },
      {
        question: "Which developer tool should I start with?",
        answer:
          "JSON Formatter, JWT Decoder, Regex Tester, UUID Generator, and Base64 are the most common entry points.",
      },
      {
        question: "Are the tools free?",
        answer:
          "Yes. Core tools are free to use in the browser during the Forge MVP.",
      },
    ],
  },
  pdf: {
    intro: [
      "Merge, split, rotate, and convert PDFs without uploading documents to a third-party server. Forge PDF tools use client-side libraries so pages stay on your device.",
      "Start with PDF Merge for combining files, PDF Split for extracting pages, or Images to PDF when you need a quick multi-page document from photos.",
    ],
    startHere: ["pdf-merge", "pdf-split", "images-to-pdf", "pdf-to-images"],
    faqs: [
      {
        question: "Is PDF merge private?",
        answer:
          "Yes for Forge’s shipped PDF tools: files are processed in the browser with libraries like pdf-lib / PDF.js.",
      },
      {
        question: "Can I merge password-protected PDFs?",
        answer:
          "Encrypted PDFs are not supported yet. Remove the password first, then merge.",
      },
      {
        question: "What is the difference between Images to PDF and PDF to Images?",
        answer:
          "Images to PDF builds a PDF from photos. PDF to Images renders each page to PNG or JPEG.",
      },
    ],
  },
  image: {
    intro: [
      "Resize, compress, convert, and strip metadata from images entirely in your browser. Forge Image tools are built for privacy-sensitive photo and design workflows.",
      "Popular starting points: Image Resizer, Image Compressor, WebP Converter, and EXIF Remover.",
    ],
    startHere: [
      "image-resizer",
      "image-compressor",
      "webp-converter",
      "exif-remover",
      "favicon-generator-from-image",
    ],
    faqs: [
      {
        question: "Do you upload my photos?",
        answer:
          "No. Image tools use Canvas APIs (and related client libraries) so processing stays on your device.",
      },
      {
        question: "PNG, JPEG, or WebP?",
        answer:
          "Use PNG for lossless graphics, JPEG for photos, and WebP when you want smaller web-ready files.",
      },
      {
        question: "Does EXIF Remover delete GPS data?",
        answer:
          "Yes. Re-encoding via canvas drops EXIF and common metadata containers before you download.",
      },
    ],
  },
  calculators: {
    intro: [
      "Finance and everyday calculators for tips, percentages, EMI/loans, and more — fast, free, and private.",
      "Results update as you type. No spreadsheet required.",
    ],
    startHere: [
      "emi-loan-calculator",
      "sip-calculator",
      "gst-sales-tax-calculator",
      "bmi-calculator",
      "gpa-calculator",
      "percentage-calculator",
      "tip-calculator",
    ],
    faqs: [
      {
        question: "Are calculator results stored?",
        answer:
          "No. Inputs stay in your browser session and are not uploaded.",
      },
      {
        question: "Is the EMI calculator a bank quote?",
        answer:
          "It is an educational estimate using standard amortization math — not financial advice.",
      },
    ],
  },
  convert: {
    intro: [
      "Convert units, timestamps, timezones, number bases, and more without leaving the page.",
      "Length, weight, temperature, and data-storage converters sit alongside developer converters like Unix timestamps and cron explainers.",
    ],
    startHere: [
      "unix-timestamp-converter",
      "timezone-converter",
      "length-converter",
      "data-storage-converter",
      "number-base-converter",
    ],
    faqs: [
      {
        question: "Do unit converters use SI or imperial?",
        answer:
          "Both, where relevant. Data storage includes SI (KB/MB) and IEC (KiB/MiB) so labels stay unambiguous.",
      },
      {
        question: "Is timezone conversion DST-aware?",
        answer:
          "Yes. The Timezone Converter uses IANA zones via the browser Intl APIs.",
      },
    ],
  },
};
