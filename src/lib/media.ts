import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
export type ValidatedMedia = {
  bytes: Buffer;
  poster?: Buffer;
  kind: "image" | "video";
  mime: string;
};
export async function inspectType(bytes: Buffer) {
  const type = await fileTypeFromBuffer(bytes);
  if (
    !type ||
    ![
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
    ].includes(type.mime)
  )
    throw new Error(
      "This file’s contents are not a supported JPEG, PNG, WebP, MP4, or WebM.",
    );
  const kind = type.mime.startsWith("image/") ? "image" : "video";
  const limit = Number(
    kind === "image"
      ? process.env.MAX_IMAGE_MB || 10
      : process.env.MAX_VIDEO_MB || 50,
  );
  if (bytes.byteLength > limit * 1024 * 1024)
    throw new Error(
      `${kind === "image" ? "Images" : "Videos"} must be under ${limit} MB.`,
    );
  return { kind: kind as "image" | "video", mime: type.mime };
}
export async function validateMedia(bytes: Buffer): Promise<ValidatedMedia> {
  const type = await inspectType(bytes);
  if (process.env.MEDIA_SCAN_URL) {
    const result = await fetch(process.env.MEDIA_SCAN_URL, {
      method: "POST",
      body: new Uint8Array(bytes),
      headers: {
        "Content-Type": "application/octet-stream",
        Authorization: "Bearer " + (process.env.MEDIA_SCAN_TOKEN || ""),
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!result.ok || (await result.json()).clean !== true)
      throw new Error(
        "The file could not pass the configured security scan. Try another file.",
      );
  }
  if (type.kind === "image") {
    // Decode, enforce a pixel limit, orient, re-encode; metadata (including GPS) is not copied.
    const output = await sharp(bytes, {
      limitInputPixels: 40_000_000,
      animated: false,
    })
      .rotate()
      .resize({
        width: 2048,
        height: 2048,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 86 })
      .toBuffer();
    return { bytes: output, kind: "image", mime: "image/webp" };
  }
  const dir = await mkdtemp(join(tmpdir(), "sritedu-media-"));
  try {
    const input = join(dir, "input"),
      output = join(dir, "output.mp4"),
      posterFile = join(dir, "poster.png");
    await writeFile(input, bytes);
    const { stdout } = await exec(
      "ffprobe",
      [
        "-v",
        "error",
        "-protocol_whitelist",
        "file,pipe",
        "-show_format",
        "-show_streams",
        "-of",
        "json",
        input,
      ],
      { timeout: 15000, maxBuffer: 1024 * 1024 },
    );
    const meta = JSON.parse(stdout);
    const duration = Number(meta.format?.duration);
    if (
      !Number.isFinite(duration) ||
      duration <= 0 ||
      duration > 90 ||
      !meta.streams?.some(
        (s: { codec_type: string }) => s.codec_type === "video",
      )
    )
      throw new Error("Choose a playable video of 90 seconds or less.");
    await exec(
      "ffmpeg",
      [
        "-nostdin",
        "-v",
        "error",
        "-protocol_whitelist",
        "file,pipe",
        "-i",
        input,
        "-map",
        "0:v:0",
        "-map",
        "0:a:0?",
        "-map_metadata",
        "-1",
        "-map_chapters",
        "-1",
        "-vf",
        "scale=w=1280:h=1280:force_original_aspect_ratio=decrease:force_divisible_by=2",
        "-r",
        "30",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "25",
        "-maxrate",
        "4M",
        "-bufsize",
        "8M",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-movflags",
        "+faststart",
        "-t",
        "90",
        output,
      ],
      { timeout: 90000, maxBuffer: 1024 * 1024 },
    );
    await exec(
      "ffmpeg",
      [
        "-nostdin",
        "-v",
        "error",
        "-protocol_whitelist",
        "file,pipe",
        "-i",
        output,
        "-frames:v",
        "1",
        posterFile,
      ],
      { timeout: 15000, maxBuffer: 1024 * 1024 },
    );
    const out = await readFile(output);
    if (out.length > 50 * 1024 * 1024)
      throw new Error("The processed video exceeds 50 MB. Try a shorter clip.");
    const poster = await sharp(await readFile(posterFile))
      .resize({ width: 960, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    return { bytes: out, poster, kind: "video", mime: "video/mp4" };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
