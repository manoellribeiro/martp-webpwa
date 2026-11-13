import { strings } from '#lib/strings.ts';

/**
 * Context.shareArtImage: the Web Share API with the PNG and share_art_message. Browsers
 * that can't share files download the PNG instead.
 */
export async function shareArtImage(image: Blob) {
	const file = new File([image], 'martp.png', { type: 'image/png' });
	const shareData: ShareData = { files: [file], text: strings.share_art_message };
	if (navigator.canShare?.(shareData)) {
		try {
			await navigator.share(shareData);
		} catch (e) {
			// AbortError: the user closed the share sheet.
			if (!(e instanceof DOMException && e.name === 'AbortError')) console.error(e);
		}
		return;
	}
	const link = document.createElement('a');
	link.href = URL.createObjectURL(image);
	link.download = file.name;
	link.click();
	setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
