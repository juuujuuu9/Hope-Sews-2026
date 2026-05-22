const SELECTOR = "[data-background-video]";

function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function playBackgroundVideo(video: HTMLVideoElement): void {
	if (prefersReducedMotion()) {
		video.pause();
		video.removeAttribute("autoplay");
		return;
	}

	video.defaultMuted = true;
	video.muted = true;
	video.setAttribute("muted", "");
	video.playsInline = true;
	video.controls = false;
	video.removeAttribute("controls");

	const playPromise = video.play();
	if (playPromise !== undefined) {
		playPromise.catch(() => {});
	}
}

function bindBackgroundVideo(video: HTMLVideoElement): void {
	if (video.dataset.backgroundVideoBound === "true") return;
	video.dataset.backgroundVideoBound = "true";

	playBackgroundVideo(video);

	for (const event of ["loadedmetadata", "canplay", "loadeddata"] as const) {
		video.addEventListener(event, () => playBackgroundVideo(video), {
			passive: true,
		});
	}

	document.addEventListener("visibilitychange", () => {
		if (!document.hidden) playBackgroundVideo(video);
	});

	window.addEventListener("pageshow", () => playBackgroundVideo(video));
}

function unlockOnFirstTouch(): void {
	for (const video of document.querySelectorAll<HTMLVideoElement>(SELECTOR)) {
		playBackgroundVideo(video);
	}
}

let touchUnlockBound = false;

function bindTouchUnlock(): void {
	if (touchUnlockBound) return;
	touchUnlockBound = true;
	document.addEventListener("touchstart", unlockOnFirstTouch, {
		capture: true,
		passive: true,
		once: true,
	});
}

export function initBackgroundVideos(): void {
	for (const video of document.querySelectorAll<HTMLVideoElement>(SELECTOR)) {
		bindBackgroundVideo(video);
	}
	bindTouchUnlock();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initBackgroundVideos, {
		once: true,
	});
} else {
	initBackgroundVideos();
}
