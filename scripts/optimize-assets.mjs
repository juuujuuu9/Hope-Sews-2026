#!/usr/bin/env node
/**
 * Optimize source media for web delivery into public/.
 *
 * Usage:
 *   node scripts/optimize-assets.mjs <file-or-directory> [--out public/subdir]
 *   npm run optimize:asset -- media/img/photo.jpg
 *   npm run optimize:media
 */

import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";
import { optimize as optimizeSvg } from "svgo";

const execFileAsync = promisify(execFile);

const ROOT = path.resolve(import.meta.dirname, "..");
const MEDIA_DIR = path.join(ROOT, "media");
const PUBLIC_DIR = path.join(ROOT, "public");

const IMAGE_EXT = new Set([
	".jpg",
	".jpeg",
	".png",
	".webp",
	".tif",
	".tiff",
	".avif",
	".gif",
]);
const SVG_EXT = new Set([".svg"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".webm", ".m4v", ".mkv"]);
const FONT_EXT = new Set([".woff", ".woff2", ".ttf", ".otf"]);

const MAX_WIDTH = Number(process.env.OPTIMIZE_MAX_WIDTH) || 2560;
const WEBP_QUALITY = Number(process.env.OPTIMIZE_WEBP_QUALITY) || 82;
const AVIF_QUALITY = Number(process.env.OPTIMIZE_AVIF_QUALITY) || 65;
const VIDEO_CRF = process.env.OPTIMIZE_VIDEO_CRF || "23";

function formatBytes(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function fileSize(filePath) {
	const stat = await fs.stat(filePath);
	return stat.size;
}

function parseArgs(argv) {
	const positional = [];
	let outOverride = null;

	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === "--out" && argv[i + 1]) {
			outOverride = argv[++i];
			continue;
		}
		positional.push(argv[i]);
	}

	return { positional, outOverride };
}

function resolvePublicDest(srcPath, outOverride) {
	const absSrc = path.resolve(srcPath);

	if (outOverride) {
		const base = path.parse(absSrc).name;
		return path.join(ROOT, outOverride, base);
	}

	const relFromMedia = path.relative(MEDIA_DIR, absSrc);
	if (!relFromMedia.startsWith("..") && !path.isAbsolute(relFromMedia)) {
		const parsed = path.parse(relFromMedia);
		const folder = parsed.dir.replace(/^font\b/, "fonts");
		return path.join(PUBLIC_DIR, folder, parsed.name);
	}

	const parsed = path.parse(absSrc);
	return path.join(PUBLIC_DIR, "assets", parsed.name);
}

async function ensureDir(filePath) {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function optimizeRaster(srcPath, destBase) {
	await ensureDir(destBase + ".webp");

	const inputSize = await fileSize(srcPath);
	const meta = await sharp(srcPath).metadata();
	const width = meta.width ?? MAX_WIDTH;
	const targetWidth = Math.min(width, MAX_WIDTH);

	const basePipeline = sharp(srcPath)
		.rotate()
		.resize({ width: targetWidth, withoutEnlargement: true });

	const avifPath = `${destBase}.avif`;
	const webpPath = `${destBase}.webp`;

	await basePipeline
		.clone()
		.avif({ quality: AVIF_QUALITY, effort: 4 })
		.toFile(avifPath);

	await sharp(srcPath)
		.rotate()
		.resize({ width: targetWidth, withoutEnlargement: true })
		.webp({ quality: WEBP_QUALITY })
		.toFile(webpPath);

	const avifSize = await fileSize(avifPath);
	const webpSize = await fileSize(webpPath);

	return {
		type: "image",
		srcPath,
		outputs: [
			{ path: avifPath, size: avifSize },
			{ path: webpPath, size: webpSize },
		],
		inputSize,
	};
}

async function optimizeVector(srcPath, destPath) {
	const input = await fs.readFile(srcPath, "utf8");
	const inputSize = Buffer.byteLength(input, "utf8");
	const result = optimizeSvg(input, {
		path: srcPath,
		multipass: true,
		plugins: ["preset-default"],
	});

	await ensureDir(destPath);
	await fs.writeFile(destPath, result.data, "utf8");
	const outputSize = await fileSize(destPath);

	return {
		type: "svg",
		srcPath,
		outputs: [{ path: destPath, size: outputSize }],
		inputSize,
	};
}

async function hasFfmpeg() {
	try {
		await execFileAsync("ffmpeg", ["-version"]);
		return true;
	} catch {
		return false;
	}
}

async function optimizeVideo(srcPath, destBase) {
	if (!(await hasFfmpeg())) {
		throw new Error(
			"ffmpeg not found on PATH — install ffmpeg to optimize video",
		);
	}

	const mp4Path = `${destBase}.mp4`;
	const posterWebpPath = `${destBase}.poster.webp`;
	const posterAvifPath = `${destBase}.poster.avif`;
	const posterFramePath = `${destBase}.poster-frame.jpg`;

	await ensureDir(mp4Path);

	const inputSize = await fileSize(srcPath);

	await execFileAsync(
		"ffmpeg",
		[
			"-y",
			"-i",
			srcPath,
			"-an",
			"-c:v",
			"libx264",
			"-crf",
			VIDEO_CRF,
			"-preset",
			"slow",
			"-movflags",
			"+faststart",
			"-pix_fmt",
			"yuv420p",
			mp4Path,
		],
		{ stdio: "pipe" },
	);

	await execFileAsync(
		"ffmpeg",
		[
			"-y",
			"-ss",
			"00:00:01",
			"-i",
			srcPath,
			"-vframes",
			"1",
			"-vf",
			"scale='min(2560,iw)':-2",
			"-q:v",
			"2",
			posterFramePath,
		],
		{ stdio: "pipe" },
	);

	await sharp(posterFramePath)
		.webp({ quality: WEBP_QUALITY })
		.toFile(posterWebpPath);
	await sharp(posterFramePath)
		.avif({ quality: AVIF_QUALITY, effort: 4 })
		.toFile(posterAvifPath);
	await fs.unlink(posterFramePath);

	const mp4Size = await fileSize(mp4Path);
	const posterWebpSize = await fileSize(posterWebpPath);
	const posterAvifSize = await fileSize(posterAvifPath);

	return {
		type: "video",
		srcPath,
		outputs: [
			{ path: mp4Path, size: mp4Size },
			{ path: posterWebpPath, size: posterWebpSize },
			{ path: posterAvifPath, size: posterAvifSize },
		],
		inputSize,
	};
}

async function optimizeFont(srcPath, destPath) {
	const ext = path.extname(srcPath).toLowerCase();
	if (ext !== ".woff2") {
		const woff2Sibling = srcPath.replace(/\.(woff|ttf|otf)$/i, ".woff2");
		try {
			await fs.access(woff2Sibling);
			return {
				type: "font",
				srcPath,
				skipped: `woff2 sibling exists: ${woff2Sibling}`,
			};
		} catch {
			if (ext !== ".woff2") {
				return {
					type: "font",
					srcPath,
					skipped:
						"non-woff2 font — convert to woff2 externally or add a .woff2 source",
				};
			}
		}
	}

	await ensureDir(destPath);
	await fs.copyFile(srcPath, destPath.endsWith(".woff2") ? destPath : `${destPath}.woff2`);
	const out = destPath.endsWith(".woff2") ? destPath : `${destPath}.woff2`;
	const inputSize = await fileSize(srcPath);
	const outputSize = await fileSize(out);

	return {
		type: "font",
		srcPath,
		outputs: [{ path: out, size: outputSize }],
		inputSize,
	};
}

async function collectFiles(targetPath) {
	const abs = path.resolve(targetPath);
	const stat = await fs.stat(abs);

	if (stat.isFile()) {
		return [abs];
	}

	const files = [];
	async function walk(dir) {
		const entries = await fs.readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.name.startsWith(".")) continue;
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				await walk(full);
			} else {
				files.push(full);
			}
		}
	}

	await walk(abs);
	return files;
}

async function optimizeFile(srcPath, outOverride) {
	const ext = path.extname(srcPath).toLowerCase();
	const destBase = resolvePublicDest(srcPath, outOverride);

	if (IMAGE_EXT.has(ext)) {
		return optimizeRaster(srcPath, destBase);
	}
	if (SVG_EXT.has(ext)) {
		return optimizeVector(srcPath, `${destBase}.svg`);
	}
	if (VIDEO_EXT.has(ext)) {
		return optimizeVideo(srcPath, destBase);
	}
	if (FONT_EXT.has(ext)) {
		return optimizeFont(srcPath, destBase);
	}

	return { type: "unknown", srcPath, skipped: `unsupported extension ${ext}` };
}

function printResult(result) {
	if (result.skipped) {
		console.log(`⊘ ${result.srcPath}\n  ${result.skipped}`);
		return;
	}

	const saved = result.outputs.reduce((a, o) => a + o.size, 0);
	const ratio =
		result.inputSize > 0
			? ((1 - saved / result.inputSize) * 100).toFixed(0)
			: "0";

	console.log(`✓ ${path.relative(ROOT, result.srcPath)} (${result.type})`);
	console.log(`  source: ${formatBytes(result.inputSize)}`);
	for (const out of result.outputs) {
		console.log(
			`  → ${path.relative(ROOT, out.path)} (${formatBytes(out.size)})`,
		);
	}
	if (result.outputs.length > 1) {
		console.log(
			`  combined outputs: ${formatBytes(saved)} (${ratio}% vs source — formats differ)`,
		);
	}
}

async function main() {
	const { positional, outOverride } = parseArgs(process.argv.slice(2));

	if (positional.length === 0) {
		console.error(
			"Usage: node scripts/optimize-assets.mjs <file-or-dir> [--out public/subdir]",
		);
		process.exit(1);
	}

	const targets = positional.flatMap((p) =>
		path.isAbsolute(p) ? p : path.join(ROOT, p),
	);

	const files = (
		await Promise.all(targets.map((t) => collectFiles(t)))
	).flat();

	if (files.length === 0) {
		console.error("No files found to optimize.");
		process.exit(1);
	}

	console.log(`Optimizing ${files.length} file(s)…\n`);

	const results = [];
	for (const file of files) {
		try {
			const result = await optimizeFile(file, outOverride);
			results.push(result);
			printResult(result);
			console.log();
		} catch (err) {
			console.error(`✗ ${file}\n  ${err.message}\n`);
		}
	}

	const failed = results.filter((r) => r.skipped && r.type === "unknown").length;
	if (failed > 0) process.exit(2);
}

main();
