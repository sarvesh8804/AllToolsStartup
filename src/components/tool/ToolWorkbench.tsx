"use client";

import dynamic from "next/dynamic";
import { ToolEmptyState } from "@/components/tool/ToolShell";

const JsonFormatterTool = dynamic(
  () =>
    import("@/tools/json-formatter").then((m) => m.JsonFormatterTool),
  {
    ssr: false,
    loading: () => <ToolEmptyState message="Loading tool…" />,
  },
);

const JsonValidatorTool = dynamic(
  () =>
    import("@/tools/json-validator").then((m) => m.JsonValidatorTool),
  {
    ssr: false,
    loading: () => <ToolEmptyState message="Loading tool…" />,
  },
);

const Base64Tool = dynamic(
  () => import("@/tools/base64-encode-decode").then((m) => m.Base64Tool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const UrlEncodeTool = dynamic(
  () => import("@/tools/url-encode-decode").then((m) => m.UrlEncodeTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const UuidGeneratorTool = dynamic(
  () => import("@/tools/uuid-v4-generator").then((m) => m.UuidGeneratorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const JwtDecoderTool = dynamic(
  () => import("@/tools/jwt-decoder").then((m) => m.JwtDecoderTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const Sha256Tool = dynamic(
  () => import("@/tools/sha-256-hash").then((m) => m.Sha256Tool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const Md5Tool = dynamic(
  () => import("@/tools/md5-hash-generator").then((m) => m.Md5Tool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CaseConverterTool = dynamic(
  () => import("@/tools/case-converter").then((m) => m.CaseConverterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const WordCounterTool = dynamic(
  () => import("@/tools/word-counter").then((m) => m.WordCounterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CharacterCounterTool = dynamic(
  () =>
    import("@/tools/character-counter").then((m) => m.CharacterCounterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const SlugGeneratorTool = dynamic(
  () => import("@/tools/slug-generator").then((m) => m.SlugGeneratorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const RandomPasswordTool = dynamic(
  () =>
    import("@/tools/random-password-generator").then(
      (m) => m.RandomPasswordTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const QrCodeGeneratorTool = dynamic(
  () =>
    import("@/tools/qr-code-generator").then((m) => m.QrCodeGeneratorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const UnixTimestampTool = dynamic(
  () =>
    import("@/tools/unix-timestamp-converter").then(
      (m) => m.UnixTimestampTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CronExplainerTool = dynamic(
  () =>
    import("@/tools/cron-expression-explainer").then(
      (m) => m.CronExplainerTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const TextDiffTool = dynamic(
  () => import("@/tools/text-diff").then((m) => m.TextDiffTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const MarkdownPreviewTool = dynamic(
  () =>
    import("@/tools/markdown-preview").then((m) => m.MarkdownPreviewTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const HtmlFormatterTool = dynamic(
  () => import("@/tools/html-formatter").then((m) => m.HtmlFormatterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CssFormatterTool = dynamic(
  () => import("@/tools/css-formatter").then((m) => m.CssFormatterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CssMinifierTool = dynamic(
  () => import("@/tools/css-minifier").then((m) => m.CssMinifierTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const SqlFormatterTool = dynamic(
  () => import("@/tools/sql-formatter").then((m) => m.SqlFormatterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const YamlToJsonTool = dynamic(
  () => import("@/tools/yaml-to-json").then((m) => m.YamlToJsonTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const JsonToYamlTool = dynamic(
  () => import("@/tools/json-to-yaml").then((m) => m.JsonToYamlTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CsvToJsonTool = dynamic(
  () => import("@/tools/csv-to-json").then((m) => m.CsvToJsonTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const JsonToCsvTool = dynamic(
  () => import("@/tools/json-to-csv").then((m) => m.JsonToCsvTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const LoremIpsumTool = dynamic(
  () =>
    import("@/tools/lorem-ipsum-generator").then((m) => m.LoremIpsumTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const ColorContrastTool = dynamic(
  () =>
    import("@/tools/color-contrast-checker").then((m) => m.ColorContrastTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const HexToRgbTool = dynamic(
  () => import("@/tools/hex-to-rgb").then((m) => m.HexToRgbTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const GitignoreGeneratorTool = dynamic(
  () =>
    import("@/tools/gitignore-generator").then(
      (m) => m.GitignoreGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const NumberBaseConverterTool = dynamic(
  () =>
    import("@/tools/number-base-converter").then(
      (m) => m.NumberBaseConverterTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const PercentageCalculatorTool = dynamic(
  () =>
    import("@/tools/percentage-calculator").then(
      (m) => m.PercentageCalculatorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const TipCalculatorTool = dynamic(
  () => import("@/tools/tip-calculator").then((m) => m.TipCalculatorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const EmiLoanCalculatorTool = dynamic(
  () =>
    import("@/tools/emi-loan-calculator").then(
      (m) => m.EmiLoanCalculatorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const AgeCalculatorTool = dynamic(
  () => import("@/tools/age-calculator").then((m) => m.AgeCalculatorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const TimezoneConverterTool = dynamic(
  () =>
    import("@/tools/timezone-converter").then(
      (m) => m.TimezoneConverterTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const RegexTesterTool = dynamic(
  () => import("@/tools/regex-tester").then((m) => m.RegexTesterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const ImageResizerTool = dynamic(
  () => import("@/tools/image-resizer").then((m) => m.ImageResizerTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const PngToJpgTool = dynamic(
  () => import("@/tools/png-to-jpg").then((m) => m.PngToJpgTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const JpgToPngTool = dynamic(
  () => import("@/tools/jpg-to-png").then((m) => m.JpgToPngTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const WebpConverterTool = dynamic(
  () => import("@/tools/webp-converter").then((m) => m.WebpConverterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const ImageCompressorTool = dynamic(
  () =>
    import("@/tools/image-compressor").then((m) => m.ImageCompressorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const ExifRemoverTool = dynamic(
  () => import("@/tools/exif-remover").then((m) => m.ExifRemoverTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const FaviconGeneratorTool = dynamic(
  () =>
    import("@/tools/favicon-generator-from-image").then(
      (m) => m.FaviconGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const ImagesToPdfTool = dynamic(
  () => import("@/tools/images-to-pdf").then((m) => m.ImagesToPdfTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const PdfMergeTool = dynamic(
  () => import("@/tools/pdf-merge").then((m) => m.PdfMergeTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const PdfSplitTool = dynamic(
  () => import("@/tools/pdf-split").then((m) => m.PdfSplitTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const PdfRotateTool = dynamic(
  () => import("@/tools/pdf-rotate").then((m) => m.PdfRotateTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const PdfToImagesTool = dynamic(
  () => import("@/tools/pdf-to-images").then((m) => m.PdfToImagesTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const LengthConverterTool = dynamic(
  () => import("@/tools/length-converter").then((m) => m.LengthConverterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const WeightConverterTool = dynamic(
  () => import("@/tools/weight-converter").then((m) => m.WeightConverterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const TemperatureConverterTool = dynamic(
  () =>
    import("@/tools/temperature-converter").then(
      (m) => m.TemperatureConverterTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const DataStorageConverterTool = dynamic(
  () =>
    import("@/tools/data-storage-converter").then(
      (m) => m.DataStorageConverterTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const REGISTRY = {
  "json-formatter": JsonFormatterTool,
  "json-validator": JsonValidatorTool,
  "base64-encode-decode": Base64Tool,
  "url-encode-decode": UrlEncodeTool,
  "uuid-v4-generator": UuidGeneratorTool,
  "jwt-decoder": JwtDecoderTool,
  "sha-256-hash": Sha256Tool,
  "md5-hash-generator": Md5Tool,
  "case-converter": CaseConverterTool,
  "word-counter": WordCounterTool,
  "character-counter": CharacterCounterTool,
  "slug-generator": SlugGeneratorTool,
  "random-password-generator": RandomPasswordTool,
  "qr-code-generator": QrCodeGeneratorTool,
  "unix-timestamp-converter": UnixTimestampTool,
  "cron-expression-explainer": CronExplainerTool,
  "text-diff": TextDiffTool,
  "markdown-preview": MarkdownPreviewTool,
  "html-formatter": HtmlFormatterTool,
  "css-formatter": CssFormatterTool,
  "css-minifier": CssMinifierTool,
  "sql-formatter": SqlFormatterTool,
  "yaml-to-json": YamlToJsonTool,
  "json-to-yaml": JsonToYamlTool,
  "csv-to-json": CsvToJsonTool,
  "json-to-csv": JsonToCsvTool,
  "lorem-ipsum-generator": LoremIpsumTool,
  "color-contrast-checker": ColorContrastTool,
  "hex-to-rgb": HexToRgbTool,
  "gitignore-generator": GitignoreGeneratorTool,
  "number-base-converter": NumberBaseConverterTool,
  "percentage-calculator": PercentageCalculatorTool,
  "tip-calculator": TipCalculatorTool,
  "emi-loan-calculator": EmiLoanCalculatorTool,
  "age-calculator": AgeCalculatorTool,
  "timezone-converter": TimezoneConverterTool,
  "regex-tester": RegexTesterTool,
  "image-resizer": ImageResizerTool,
  "png-to-jpg": PngToJpgTool,
  "jpg-to-png": JpgToPngTool,
  "webp-converter": WebpConverterTool,
  "image-compressor": ImageCompressorTool,
  "exif-remover": ExifRemoverTool,
  "favicon-generator-from-image": FaviconGeneratorTool,
  "images-to-pdf": ImagesToPdfTool,
  "pdf-merge": PdfMergeTool,
  "pdf-split": PdfSplitTool,
  "pdf-rotate": PdfRotateTool,
  "pdf-to-images": PdfToImagesTool,
  "length-converter": LengthConverterTool,
  "weight-converter": WeightConverterTool,
  "temperature-converter": TemperatureConverterTool,
  "data-storage-converter": DataStorageConverterTool,
} as const;

export function ToolWorkbench({ component }: { component?: string }) {
  if (!component || !(component in REGISTRY)) {
    return (
      <ToolEmptyState message="No interactive engine is registered for this tool yet." />
    );
  }

  const Tool = REGISTRY[component as keyof typeof REGISTRY];
  return <Tool />;
}
