// @ts-check

let accordionElements = [...document.querySelectorAll('.accordian details')]

class Accordion {
	/**
	 * @param {HTMLDetailsElement} el
	 */
	constructor(el) {
		// Store the <details> element
		this.el = el;
		// Store the <summary> element
		this.summary = el.getElementsByTagName('summary')[0]
		if (!this.summary)
			return;

		// Store the <div class="content"> element
		const content = el.getElementsByClassName('accordianContent')[0]
		if (content instanceof HTMLElement)
			this.content = content

		// Store the animation object (so we can cancel it if needed)
		this.animation = null;
		// Store if the element is closing
		this.isClosing = false;
		// Store if the element is expanding
		this.isExpanding = false;
		// Detect user clicks on the summary element
		this.summary.addEventListener('click', (e) => this.onClick(e));
	}

	/**
	 * @param {MouseEvent} e
	 */
	onClick(e) {
		if (!this.summary)
			return;

		// Stop default behaviour from the browser
		e.preventDefault();
		// Add an overflow on the <details> to avoid content overflowing
		this.el.style.overflow = 'hidden';
		// Check if the element is being closed or is already closed
		if (this.isClosing || !this.el.open) {
			this.open();
		// Check if the element is being openned or is already open
		} else if (this.isExpanding || this.el.open) {
			this.shrink();
		}
	}

	shrink() {
		if (!this.summary)
			return;

		// Set the element as "being closed"
		this.isClosing = true;

		// Store the current height of the element
		const startHeight = `${this.el.offsetHeight}px`;
		// Calculate the height of the summary
		const endHeight = `${this.summary.offsetHeight}px`;
		
		// If there is already an animation running
		if (this.animation) {
			// Cancel the current animation
			this.animation.cancel();
		}
		
		// Start a WAAPI animation
		this.animation = this.el.animate({
			// Set the keyframes from the startHeight to endHeight
			height: [startHeight, endHeight]
		}, {
			duration: 200,
			easing: 'cubic-bezier(.4,0,.2,1)'
		});
		
		// When the animation is complete, call onAnimationFinish()
		this.animation.onfinish = () => this.onAnimationFinish(false);
		// If the animation is cancelled, isClosing variable is set to false
		this.animation.oncancel = () => this.isClosing = false;
	}

	open() {
		if (!this.summary)
			return;

		accordionEntries.filter(elem => elem.el.open).forEach(elem => elem.shrink())
		// Apply a fixed height on the element
		this.el.style.height = `${this.el.offsetHeight}px`;
		// Force the [open] attribute on the details element
		this.el.open = true;
		// Wait for the next frame to call the expand function
		window.requestAnimationFrame(() => this.expand());
	}

	expand() {
		if (!this.summary)
			return;

		// Set the element as "being expanding"
		this.isExpanding = true;
		// Get the current fixed height of the element
		const startHeight = `${this.el.offsetHeight}px`;
		// Calculate the open height of the element (summary height + content height)
		const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight}px`;
		
		// If there is already an animation running
		if (this.animation) {
			// Cancel the current animation
			this.animation.cancel();
		}
		
		// Start a WAAPI animation
		this.animation = this.el.animate({
			// Set the keyframes from the startHeight to endHeight
			height: [startHeight, endHeight]
		}, {
			duration: 200,
			easing: 'cubic-bezier(.4,0,.2,1)'
		});
		// When the animation is complete, call onAnimationFinish()
		this.animation.onfinish = () => this.onAnimationFinish(true);
		// If the animation is cancelled, isExpanding variable is set to false
		this.animation.oncancel = () => this.isExpanding = false;
	}
	
	/**
	 * @param {boolean} open
	 */
	onAnimationFinish(open) {
		if (!this.summary)
			return;

		// Set the open attribute based on the parameter
		this.el.open = open;
		// Clear the stored animation
		this.animation = null;
		// Reset isClosing & isExpanding
		this.isClosing = false;
		this.isExpanding = false;
		// Remove the overflow hidden and the fixed height
		this.el.style.removeProperty('height');
		this.el.style.removeProperty('overflow');
	}
}

let accordionEntries = accordionElements.map((/** @type {HTMLDetailsElement} */ el) => new Accordion(el))