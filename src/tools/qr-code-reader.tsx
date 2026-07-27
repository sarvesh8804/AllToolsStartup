"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { decodeQrFromImageData } from "@/lib/qr/decode";
import { isRasterImageFile } from "@/lib/image/format";
import { loadImageBitmap, drawImageToCanvas } from "@/lib/image/canvas";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type Mode = "file" | "camera";

export function QrCodeReaderTool() {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<Mode>("file");
  const [result, setResult] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "qr-code-reader", family: "tools" });
    }
  }, [started]);

  const stopCamera = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
    setScanning(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const onDecoded = useCallback(
    (text: string) => {
      setResult(text);
      setError(null);
      track({
        name: "tool_complete",
        tool: "qr-code-reader",
        family: "tools",
      });
    },
    [],
  );

  const decodeFile = useCallback(
    async (file: File) => {
      markStart();
      if (!isRasterImageFile(file)) {
        setError("Choose a PNG, JPEG, WebP, GIF, or BMP image.");
        return;
      }
      setError(null);
      try {
        const img = await loadImageBitmap(file);
        const maxSide = 800;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = drawImageToCanvas(img.bitmap, { width: w, height: h });
        const ctx = canvas.getContext("2d");
        img.bitmap.close();
        if (!ctx) throw new Error("Could not get canvas 2D context.");
        const imageData = ctx.getImageData(0, 0, w, h);
        const decoded = decodeQrFromImageData(imageData);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(file);
        });
        if (decoded.ok) onDecoded(decoded.text);
        else {
          setResult("");
          setError(decoded.error);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to read image.");
      }
    },
    [markStart, onDecoded],
  );

  const startCamera = async () => {
    markStart();
    setError(null);
    setResult("");
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Video element missing.");
      video.srcObject = stream;
      await video.play();
      setCameraOn(true);
      setScanning(true);

      const tick = () => {
        const v = videoRef.current;
        const canvas = canvasRef.current;
        if (!v || !canvas || v.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        const w = v.videoWidth;
        const h = v.videoHeight;
        if (!w || !h) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(v, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const decoded = decodeQrFromImageData(imageData);
        if (decoded.ok) {
          onDecoded(decoded.text);
          setScanning(false);
          stopCamera();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Camera access denied or unavailable.",
      );
      stopCamera();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["file", "From file"],
            ["camera", "Camera"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              markStart();
              if (id === "file") stopCamera();
              setMode(id);
              setError(null);
            }}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition",
              mode === id
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <ToolErrorState message={error} /> : null}

      {mode === "file" ? (
        <div
          className={cn(
            "rounded-xl border border-dashed px-4 py-8 text-center transition",
            dragOver
              ? "border-[var(--accent)] bg-[var(--accent)]/10"
              : "border-[var(--border)] bg-[var(--surface)]",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void decodeFile(f);
          }}
        >
          <p className="text-sm text-[var(--muted)]">
            Drop a QR image, or choose a file. Decoding runs locally.
          </p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-3 rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
          >
            Choose image
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void decodeFile(f);
              e.target.value = "";
            }}
          />
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="QR preview"
              className="mx-auto mt-4 max-h-56 rounded-lg border border-[var(--border)] object-contain"
            />
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-black">
            <video
              ref={videoRef}
              className="mx-auto max-h-80 w-full object-contain"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex flex-wrap gap-2">
            {!cameraOn ? (
              <button
                type="button"
                onClick={() => void startCamera()}
                className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
              >
                Start camera
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
              >
                Stop camera
              </button>
            )}
            {scanning ? (
              <p className="self-center text-sm text-[var(--muted)]">
                Point at a QR code…
              </p>
            ) : null}
          </div>
        </div>
      )}

      {result ? (
        <div>
          <EditorPaneHeader label="Decoded text" getText={() => result} />
          <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
            {result}
          </pre>
          <div className="mt-2">
            <CopyButton getText={() => result} label="Copy result" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
