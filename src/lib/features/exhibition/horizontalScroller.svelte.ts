// A sideways list of the exhibition (the hall's doors, a room's frames): which items are seen
// whole, which one is in the middle and how far it is scrolled. Items are the element's children.

export class HorizontalScroller {
	element = $state<HTMLElement>();
	/** Index of the first and last items seen whole. */
	first = $state(0);
	last = $state(0);
	/** Index of the item closest to the middle. */
	centered = $state(0);
	/** 0 to 1: how much of the list has been seen. */
	progress = $state(0);
	atStart = $state(true);
	atEnd = $state(true);

	update = () => {
		const element = this.element;
		if (!element) return;
		const { scrollLeft, clientWidth, scrollWidth } = element;
		const view = element.getBoundingClientRect();
		const middle = view.left + view.width / 2;
		let first = -1;
		let last = -1;
		let nearest = 0;
		let nearestDistance = Infinity;
		[...element.children].forEach((item, index) => {
			const box = item.getBoundingClientRect();
			if (box.left >= view.left - 1 && box.right <= view.right + 1) {
				if (first < 0) first = index;
				last = index;
			}
			const distance = Math.abs(box.left + box.width / 2 - middle);
			if (distance < nearestDistance) {
				nearest = index;
				nearestDistance = distance;
			}
		});
		// When no item fits whole (a frame wider than a phone), the middle one is the one seen.
		this.first = first < 0 ? nearest : first;
		this.last = last < 0 ? nearest : last;
		this.centered = nearest;
		this.progress = scrollWidth > 0 ? Math.min(1, (scrollLeft + clientWidth) / scrollWidth) : 1;
		this.atStart = scrollLeft <= 1;
		this.atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
	};

	/** Most of a screen forwards or backwards. */
	scrollPage = (direction: 1 | -1) => {
		const element = this.element;
		element?.scrollBy({ left: direction * element.clientWidth * 0.8, behavior: 'smooth' });
	};

	/** The next or previous item into the middle. */
	scrollItem = (direction: 1 | -1) => {
		const item = this.element?.children[this.centered + direction];
		item?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
	};

	/** Keeps the state in sync while the element is set; call from an `$effect`. */
	observe(): (() => void) | undefined {
		const element = this.element;
		if (!element) return;
		this.update();
		element.addEventListener('scroll', this.update, { passive: true });
		const resize = new ResizeObserver(this.update);
		resize.observe(element);
		return () => {
			element.removeEventListener('scroll', this.update);
			resize.disconnect();
		};
	}
}

/** The ← → keys walk the list, unless a modifier is held or someone handled them already. */
export function arrowKeyDirection(event: KeyboardEvent): 1 | -1 | null {
	if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return null;
	if (event.key === 'ArrowRight') return 1;
	if (event.key === 'ArrowLeft') return -1;
	return null;
}
