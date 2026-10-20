import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { inspectType, validateMedia } from "../src/lib/media";
describe("actual media processing", () => {
  it("decodes images, strips EXIF, and emits a bounded WebP", async () => {
    const input = await sharp({
      create: { width: 2400, height: 1400, channels: 3, background: "#ff4f9a" },
    })
      .jpeg()
      .withMetadata({
        exif: {
          IFD0: { Artist: "Private name", Copyright: "Private location" },
        },
      })
      .toBuffer();
    const result = await validateMedia(input);
    const meta = await sharp(result.bytes).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(2048);
    expect(meta.exif).toBeUndefined();
    expect(meta.xmp).toBeUndefined();
  });
  it.each([
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    "<!DOCTYPE html><h1>Not an image</h1>",
    "MZ executable bytes",
  ])("rejects disguised unsafe content", async (bytes) => {
    await expect(inspectType(Buffer.from(bytes))).rejects.toThrow("contents");
  });
  it("rejects oversized images based on bytes", async () => {
    const image = await sharp({
      create: { width: 5, height: 5, channels: 3, background: "#ff4f9a" },
    })
      .png()
      .toBuffer();
    const oversized = Buffer.alloc(11 * 1024 * 1024);
    image.copy(oversized);
    await expect(inspectType(oversized)).rejects.toThrow("10 MB");
  });
  it("transcodes a real short video and creates a metadata-free poster", async () => {
    const dir = await mkdtemp(join(tmpdir(), "sritedu-video-test-"));
    try {
      const path = join(dir, "sample.mp4");
      execFileSync("ffmpeg", [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=c=0xff4f9a:s=160x120:d=0.5",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-metadata",
        "location=+12.0+077.0/",
        path,
      ]);
      const result = await validateMedia(await readFile(path));
      expect(result.kind).toBe("video");
      expect(result.mime).toBe("video/mp4");
      expect(result.poster?.length).toBeGreaterThan(10);
      expect((await sharp(result.poster).metadata()).exif).toBeUndefined();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
