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

const DummyTextGeneratorTool = dynamic(
  () =>
    import("@/tools/dummy-text-generator").then((m) => m.DummyTextGeneratorTool),
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

const GstSalesTaxCalculatorTool = dynamic(
  () =>
    import("@/tools/gst-sales-tax-calculator").then(
      (m) => m.GstSalesTaxCalculatorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const SipCalculatorTool = dynamic(
  () => import("@/tools/sip-calculator").then((m) => m.SipCalculatorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const BmiCalculatorTool = dynamic(
  () => import("@/tools/bmi-calculator").then((m) => m.BmiCalculatorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const GpaCalculatorTool = dynamic(
  () => import("@/tools/gpa-calculator").then((m) => m.GpaCalculatorTool),
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

const RegexExplainerTool = dynamic(
  () => import("@/tools/regex-explainer").then((m) => m.RegexExplainerTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const FindAndReplaceBatchTool = dynamic(
  () =>
    import("@/tools/find-and-replace-batch").then(
      (m) => m.FindAndReplaceBatchTool,
    ),
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

const ImageToBase64Tool = dynamic(
  () => import("@/tools/image-to-base64").then((m) => m.ImageToBase64Tool),
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

const MetaTagsPreviewTool = dynamic(
  () =>
    import("@/tools/meta-tags-preview").then((m) => m.MetaTagsPreviewTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CsvViewerTableTool = dynamic(
  () =>
    import("@/tools/csv-viewer-table").then((m) => m.CsvViewerTableTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const PasswordStrengthMeterTool = dynamic(
  () =>
    import("@/tools/password-strength-meter").then(
      (m) => m.PasswordStrengthMeterTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const MarkdownToHtmlTool = dynamic(
  () =>
    import("@/tools/markdown-to-html").then((m) => m.MarkdownToHtmlTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const JavascriptBeautifierTool = dynamic(
  () =>
    import("@/tools/javascript-beautifier").then(
      (m) => m.JavascriptBeautifierTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const JavascriptMinifierTool = dynamic(
  () =>
    import("@/tools/javascript-minifier").then(
      (m) => m.JavascriptMinifierTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const DateDifferenceCalculatorTool = dynamic(
  () =>
    import("@/tools/date-difference-calculator").then(
      (m) => m.DateDifferenceCalculatorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const RegexCheatsheetInteractiveTool = dynamic(
  () =>
    import("@/tools/regex-cheatsheet-interactive").then(
      (m) => m.RegexCheatsheetInteractiveTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const JsonMinifierTool = dynamic(
  () => import("@/tools/json-minifier").then((m) => m.JsonMinifierTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CssBoxShadowGeneratorTool = dynamic(
  () =>
    import("@/tools/css-box-shadow-generator").then(
      (m) => m.CssBoxShadowGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CssGradientGeneratorTool = dynamic(
  () =>
    import("@/tools/css-gradient-generator").then(
      (m) => m.CssGradientGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CsvToExcelClientSideTool = dynamic(
  () =>
    import("@/tools/csv-to-excel-client-side").then(
      (m) => m.CsvToExcelClientSideTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const ExcelToCsvTool = dynamic(
  () => import("@/tools/excel-to-csv").then((m) => m.ExcelToCsvTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const FakeCreditCardTool = dynamic(
  () => import("@/tools/fake-credit-card").then((m) => m.FakeCreditCardTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const OpenGraphMetaGeneratorTool = dynamic(
  () =>
    import("@/tools/open-graph-meta-generator").then(
      (m) => m.OpenGraphMetaGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const PasswordGeneratorTool = dynamic(
  () =>
    import("@/tools/password-generator").then((m) => m.PasswordGeneratorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const ColorPickerTool = dynamic(
  () => import("@/tools/color-picker").then((m) => m.ColorPickerTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const FakeUserJsonGeneratorTool = dynamic(
  () =>
    import("@/tools/fake-user-json-generator").then(
      (m) => m.FakeUserJsonGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const ReadmeGeneratorTool = dynamic(
  () =>
    import("@/tools/readme-generator").then((m) => m.ReadmeGeneratorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const ReadmeBadgesGeneratorTool = dynamic(
  () =>
    import("@/tools/readme-badges-generator").then(
      (m) => m.ReadmeBadgesGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const KeywordDensityCheckerTool = dynamic(
  () =>
    import("@/tools/keyword-density-checker").then(
      (m) => m.KeywordDensityCheckerTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const WordFrequencyCounterTool = dynamic(
  () =>
    import("@/tools/word-frequency-counter").then(
      (m) => m.WordFrequencyCounterTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const MarkdownTableGeneratorTool = dynamic(
  () =>
    import("@/tools/markdown-table-generator").then(
      (m) => m.MarkdownTableGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const HtmlTableGeneratorTool = dynamic(
  () =>
    import("@/tools/html-table-generator").then((m) => m.HtmlTableGeneratorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CsvToMarkdownTool = dynamic(
  () => import("@/tools/csv-to-markdown").then((m) => m.CsvToMarkdownTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const AccessiblePaletteGeneratorTool = dynamic(
  () =>
    import("@/tools/accessible-palette-generator").then(
      (m) => m.AccessiblePaletteGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const HexToHslTool = dynamic(
  () => import("@/tools/hex-to-hsl").then((m) => m.HexToHslTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CommitMessageHelperTool = dynamic(
  () =>
    import("@/tools/commit-message-helper").then(
      (m) => m.CommitMessageHelperTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const ConventionalCommitBuilderTool = dynamic(
  () =>
    import("@/tools/conventional-commit-builder").then(
      (m) => m.ConventionalCommitBuilderTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const JsonToMarkdownTableTool = dynamic(
  () =>
    import("@/tools/json-to-markdown-table").then(
      (m) => m.JsonToMarkdownTableTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const DnsRecordTypesCheatsheetTool = dynamic(
  () =>
    import("@/tools/dns-record-types-cheatsheet").then(
      (m) => m.DnsRecordTypesCheatsheetTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const PortNumberReferenceTool = dynamic(
  () =>
    import("@/tools/port-number-reference").then(
      (m) => m.PortNumberReferenceTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const UrlParserBuilderTool = dynamic(
  () =>
    import("@/tools/url-parser-builder").then((m) => m.UrlParserBuilderTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const UserAgentParserTool = dynamic(
  () =>
    import("@/tools/user-agent-parser").then((m) => m.UserAgentParserTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const SqlJoinVisualizerTool = dynamic(
  () =>
    import("@/tools/sql-join-visualizer").then((m) => m.SqlJoinVisualizerTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const RgbToHexTool = dynamic(
  () => import("@/tools/rgb-to-hex").then((m) => m.RgbToHexTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const PomodoroTimerTool = dynamic(
  () => import("@/tools/pomodoro-timer").then((m) => m.PomodoroTimerTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const FakeAddressGeneratorTool = dynamic(
  () =>
    import("@/tools/fake-address-generator").then(
      (m) => m.FakeAddressGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const FakeNameGeneratorTool = dynamic(
  () =>
    import("@/tools/fake-name-generator").then((m) => m.FakeNameGeneratorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const GitCheatSheetInteractiveTool = dynamic(
  () =>
    import("@/tools/git-cheat-sheet-interactive").then(
      (m) => m.GitCheatSheetInteractiveTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const GitCommandExplorerTool = dynamic(
  () =>
    import("@/tools/git-command-explorer").then(
      (m) => m.GitCommandExplorerTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const HtmlMinifierTool = dynamic(
  () => import("@/tools/html-minifier").then((m) => m.HtmlMinifierTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const AddSubtractDatesTool = dynamic(
  () =>
    import("@/tools/add-subtract-dates").then((m) => m.AddSubtractDatesTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const MeetingTimePlannerTool = dynamic(
  () =>
    import("@/tools/meeting-time-planner").then(
      (m) => m.MeetingTimePlannerTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const TimeDurationCalculatorTool = dynamic(
  () =>
    import("@/tools/time-duration-calculator").then(
      (m) => m.TimeDurationCalculatorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const WorldClockTool = dynamic(
  () => import("@/tools/world-clock").then((m) => m.WorldClockTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const HtmlEntityEncodeDecodeTool = dynamic(
  () =>
    import("@/tools/html-entity-encode-decode").then(
      (m) => m.HtmlEntityEncodeDecodeTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const Sha1Tool = dynamic(
  () => import("@/tools/sha-1-hash").then((m) => m.Sha1Tool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const FakeEmailGeneratorTool = dynamic(
  () =>
    import("@/tools/fake-email-generator").then(
      (m) => m.FakeEmailGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const LicenseTextGeneratorTool = dynamic(
  () =>
    import("@/tools/license-text-generator").then(
      (m) => m.LicenseTextGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const SitemapXmlGeneratorTool = dynamic(
  () =>
    import("@/tools/sitemap-xml-generator").then(
      (m) => m.SitemapXmlGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const HtaccessRedirectGeneratorTool = dynamic(
  () =>
    import("@/tools/htaccess-redirect-generator").then(
      (m) => m.HtaccessRedirectGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const RobotsTxtGeneratorTool = dynamic(
  () =>
    import("@/tools/robots-txt-generator").then(
      (m) => m.RobotsTxtGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const JsonToXmlTool = dynamic(
  () => import("@/tools/json-to-xml").then((m) => m.JsonToXmlTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const XmlToJsonTool = dynamic(
  () => import("@/tools/xml-to-json").then((m) => m.XmlToJsonTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const HttpStatusCodeReferenceTool = dynamic(
  () =>
    import("@/tools/http-status-code-reference").then(
      (m) => m.HttpStatusCodeReferenceTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const RemoveDuplicateLinesTool = dynamic(
  () =>
    import("@/tools/remove-duplicate-lines").then(
      (m) => m.RemoveDuplicateLinesTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const SortLinesTool = dynamic(
  () => import("@/tools/sort-lines").then((m) => m.SortLinesTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const XmlFormatterTool = dynamic(
  () => import("@/tools/xml-formatter").then((m) => m.XmlFormatterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const YamlFormatterTool = dynamic(
  () => import("@/tools/yaml-formatter").then((m) => m.YamlFormatterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CssFlexboxPlaygroundTool = dynamic(
  () =>
    import("@/tools/css-flexbox-playground").then(
      (m) => m.CssFlexboxPlaygroundTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CssGridPlaygroundTool = dynamic(
  () =>
    import("@/tools/css-grid-playground").then((m) => m.CssGridPlaygroundTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const PaletteFromImageTool = dynamic(
  () =>
    import("@/tools/palette-from-image").then((m) => m.PaletteFromImageTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const QrCodeReaderTool = dynamic(
  () => import("@/tools/qr-code-reader").then((m) => m.QrCodeReaderTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const WifiQrGeneratorTool = dynamic(
  () =>
    import("@/tools/wifi-qr-generator").then((m) => m.WifiQrGeneratorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const BusinessDaysCalculatorTool = dynamic(
  () =>
    import("@/tools/business-days-calculator").then(
      (m) => m.BusinessDaysCalculatorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const JsonToTypescriptInterfaceTool = dynamic(
  () =>
    import("@/tools/json-to-typescript-interface").then(
      (m) => m.JsonToTypescriptInterfaceTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const VcardQrGeneratorTool = dynamic(
  () =>
    import("@/tools/vcard-qr-generator").then((m) => m.VcardQrGeneratorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const GlassmorphismGeneratorTool = dynamic(
  () =>
    import("@/tools/glassmorphism-generator").then(
      (m) => m.GlassmorphismGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CsvToSqlInsertTool = dynamic(
  () =>
    import("@/tools/csv-to-sql-insert").then((m) => m.CsvToSqlInsertTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const SvgOptimizerTool = dynamic(
  () => import("@/tools/svg-optimizer").then((m) => m.SvgOptimizerTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CountdownTimerBuilderTool = dynamic(
  () =>
    import("@/tools/countdown-timer-builder").then(
      (m) => m.CountdownTimerBuilderTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const MermaidLiveEditorTool = dynamic(
  () =>
    import("@/tools/mermaid-live-editor").then((m) => m.MermaidLiveEditorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const FileChecksumTool = dynamic(
  () => import("@/tools/file-checksum").then((m) => m.FileChecksumTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const JwtDebuggerWithClaimsExplainTool = dynamic(
  () =>
    import("@/tools/jwt-debugger-with-claims-explain").then(
      (m) => m.JwtDebuggerWithClaimsExplainTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const PassphraseGeneratorTool = dynamic(
  () =>
    import("@/tools/passphrase-generator").then(
      (m) => m.PassphraseGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const DockerfileGeneratorTool = dynamic(
  () =>
    import("@/tools/dockerfile-generator").then(
      (m) => m.DockerfileGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const JsonDiffTool = dynamic(
  () => import("@/tools/json-diff").then((m) => m.JsonDiffTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const HtmlToMarkdownTool = dynamic(
  () =>
    import("@/tools/html-to-markdown").then((m) => m.HtmlToMarkdownTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const ReadingTimeEstimatorTool = dynamic(
  () =>
    import("@/tools/reading-time-estimator").then(
      (m) => m.ReadingTimeEstimatorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const ZeroWidthCharacterDetectorTool = dynamic(
  () =>
    import("@/tools/zero-width-character-detector").then(
      (m) => m.ZeroWidthCharacterDetectorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const InvisibleCharacterRemoverTool = dynamic(
  () =>
    import("@/tools/invisible-character-remover").then(
      (m) => m.InvisibleCharacterRemoverTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const LineCounterTool = dynamic(
  () => import("@/tools/line-counter").then((m) => m.LineCounterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CssBorderRadiusGeneratorTool = dynamic(
  () =>
    import("@/tools/css-border-radius-generator").then(
      (m) => m.CssBorderRadiusGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const CsvColumnSplitterTool = dynamic(
  () =>
    import("@/tools/csv-column-splitter").then((m) => m.CsvColumnSplitterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const GraphqlFormatterTool = dynamic(
  () =>
    import("@/tools/graphql-formatter").then((m) => m.GraphqlFormatterTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const SqlMinifierTool = dynamic(
  () => import("@/tools/sql-minifier").then((m) => m.SqlMinifierTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const ComplementaryColorFinderTool = dynamic(
  () =>
    import("@/tools/complementary-color-finder").then(
      (m) => m.ComplementaryColorFinderTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const WeekNumberCalculatorTool = dynamic(
  () =>
    import("@/tools/week-number-calculator").then(
      (m) => m.WeekNumberCalculatorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const Base64UrlSafeTool = dynamic(
  () => import("@/tools/base64-url-safe").then((m) => m.Base64UrlSafeTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const Sha512HashTool = dynamic(
  () => import("@/tools/sha-512-hash").then((m) => m.Sha512HashTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const TwitterCardMetaGeneratorTool = dynamic(
  () =>
    import("@/tools/twitter-card-meta-generator").then(
      (m) => m.TwitterCardMetaGeneratorTool,
    ),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const UuidBulkGeneratorTool = dynamic(
  () =>
    import("@/tools/uuid-bulk-generator").then((m) => m.UuidBulkGeneratorTool),
  { ssr: false, loading: () => <ToolEmptyState message="Loading tool…" /> },
);

const GitignoreBuilderTool = dynamic(
  () =>
    import("@/tools/gitignore-builder").then((m) => m.GitignoreBuilderTool),
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
  "dummy-text-generator": DummyTextGeneratorTool,
  "color-contrast-checker": ColorContrastTool,
  "hex-to-rgb": HexToRgbTool,
  "gitignore-generator": GitignoreGeneratorTool,
  "number-base-converter": NumberBaseConverterTool,
  "percentage-calculator": PercentageCalculatorTool,
  "tip-calculator": TipCalculatorTool,
  "emi-loan-calculator": EmiLoanCalculatorTool,
  "gst-sales-tax-calculator": GstSalesTaxCalculatorTool,
  "sip-calculator": SipCalculatorTool,
  "bmi-calculator": BmiCalculatorTool,
  "gpa-calculator": GpaCalculatorTool,
  "age-calculator": AgeCalculatorTool,
  "timezone-converter": TimezoneConverterTool,
  "regex-tester": RegexTesterTool,
  "regex-explainer": RegexExplainerTool,
  "find-and-replace-batch": FindAndReplaceBatchTool,
  "image-resizer": ImageResizerTool,
  "png-to-jpg": PngToJpgTool,
  "jpg-to-png": JpgToPngTool,
  "webp-converter": WebpConverterTool,
  "image-compressor": ImageCompressorTool,
  "image-to-base64": ImageToBase64Tool,
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
  "meta-tags-preview": MetaTagsPreviewTool,
  "csv-viewer-table": CsvViewerTableTool,
  "password-strength-meter": PasswordStrengthMeterTool,
  "markdown-to-html": MarkdownToHtmlTool,
  "javascript-beautifier": JavascriptBeautifierTool,
  "javascript-minifier": JavascriptMinifierTool,
  "date-difference-calculator": DateDifferenceCalculatorTool,
  "regex-cheatsheet-interactive": RegexCheatsheetInteractiveTool,
  "json-minifier": JsonMinifierTool,
  "css-box-shadow-generator": CssBoxShadowGeneratorTool,
  "css-gradient-generator": CssGradientGeneratorTool,
  "csv-to-excel-client-side": CsvToExcelClientSideTool,
  "excel-to-csv": ExcelToCsvTool,
  "fake-credit-card": FakeCreditCardTool,
  "open-graph-meta-generator": OpenGraphMetaGeneratorTool,
  "password-generator": PasswordGeneratorTool,
  "color-picker": ColorPickerTool,
  "fake-user-json-generator": FakeUserJsonGeneratorTool,
  "readme-generator": ReadmeGeneratorTool,
  "readme-badges-generator": ReadmeBadgesGeneratorTool,
  "keyword-density-checker": KeywordDensityCheckerTool,
  "word-frequency-counter": WordFrequencyCounterTool,
  "markdown-table-generator": MarkdownTableGeneratorTool,
  "html-table-generator": HtmlTableGeneratorTool,
  "csv-to-markdown": CsvToMarkdownTool,
  "accessible-palette-generator": AccessiblePaletteGeneratorTool,
  "hex-to-hsl": HexToHslTool,
  "commit-message-helper": CommitMessageHelperTool,
  "conventional-commit-builder": ConventionalCommitBuilderTool,
  "json-to-markdown-table": JsonToMarkdownTableTool,
  "dns-record-types-cheatsheet": DnsRecordTypesCheatsheetTool,
  "port-number-reference": PortNumberReferenceTool,
  "url-parser-builder": UrlParserBuilderTool,
  "user-agent-parser": UserAgentParserTool,
  "sql-join-visualizer": SqlJoinVisualizerTool,
  "rgb-to-hex": RgbToHexTool,
  "pomodoro-timer": PomodoroTimerTool,
  "fake-address-generator": FakeAddressGeneratorTool,
  "fake-name-generator": FakeNameGeneratorTool,
  "git-cheat-sheet-interactive": GitCheatSheetInteractiveTool,
  "git-command-explorer": GitCommandExplorerTool,
  "html-minifier": HtmlMinifierTool,
  "add-subtract-dates": AddSubtractDatesTool,
  "meeting-time-planner": MeetingTimePlannerTool,
  "time-duration-calculator": TimeDurationCalculatorTool,
  "world-clock": WorldClockTool,
  "html-entity-encode-decode": HtmlEntityEncodeDecodeTool,
  "sha-1-hash": Sha1Tool,
  "fake-email-generator": FakeEmailGeneratorTool,
  "license-text-generator": LicenseTextGeneratorTool,
  "sitemap-xml-generator": SitemapXmlGeneratorTool,
  "htaccess-redirect-generator": HtaccessRedirectGeneratorTool,
  "robots-txt-generator": RobotsTxtGeneratorTool,
  "json-to-xml": JsonToXmlTool,
  "xml-to-json": XmlToJsonTool,
  "http-status-code-reference": HttpStatusCodeReferenceTool,
  "remove-duplicate-lines": RemoveDuplicateLinesTool,
  "sort-lines": SortLinesTool,
  "xml-formatter": XmlFormatterTool,
  "yaml-formatter": YamlFormatterTool,
  "css-flexbox-playground": CssFlexboxPlaygroundTool,
  "css-grid-playground": CssGridPlaygroundTool,
  "palette-from-image": PaletteFromImageTool,
  "qr-code-reader": QrCodeReaderTool,
  "wifi-qr-generator": WifiQrGeneratorTool,
  "business-days-calculator": BusinessDaysCalculatorTool,
  "json-to-typescript-interface": JsonToTypescriptInterfaceTool,
  "vcard-qr-generator": VcardQrGeneratorTool,
  "glassmorphism-generator": GlassmorphismGeneratorTool,
  "csv-to-sql-insert": CsvToSqlInsertTool,
  "svg-optimizer": SvgOptimizerTool,
  "countdown-timer-builder": CountdownTimerBuilderTool,
  "mermaid-live-editor": MermaidLiveEditorTool,
  "file-checksum": FileChecksumTool,
  "jwt-debugger-with-claims-explain": JwtDebuggerWithClaimsExplainTool,
  "passphrase-generator": PassphraseGeneratorTool,
  "dockerfile-generator": DockerfileGeneratorTool,
  "json-diff": JsonDiffTool,
  "html-to-markdown": HtmlToMarkdownTool,
  "reading-time-estimator": ReadingTimeEstimatorTool,
  "zero-width-character-detector": ZeroWidthCharacterDetectorTool,
  "invisible-character-remover": InvisibleCharacterRemoverTool,
  "line-counter": LineCounterTool,
  "css-border-radius-generator": CssBorderRadiusGeneratorTool,
  "csv-column-splitter": CsvColumnSplitterTool,
  "graphql-formatter": GraphqlFormatterTool,
  "sql-minifier": SqlMinifierTool,
  "complementary-color-finder": ComplementaryColorFinderTool,
  "week-number-calculator": WeekNumberCalculatorTool,
  "base64-url-safe": Base64UrlSafeTool,
  "sha-512-hash": Sha512HashTool,
  "twitter-card-meta-generator": TwitterCardMetaGeneratorTool,
  "uuid-bulk-generator": UuidBulkGeneratorTool,
  "gitignore-builder": GitignoreBuilderTool,
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
