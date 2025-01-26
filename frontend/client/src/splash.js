/**
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-Present, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @license Simplified BSD License
 */

import { createLettercrap } from "./loading-screen/lettercrap.js";
import loadingScreen from "./loading-screen/loading.html";

/**
 * Convert a template string into HTML DOM nodes
 * @param  {String} str The template string
 * @returns {Node} The template HTML
 */
const stringToHTML = (str) => {
	const parser = new DOMParser();
	const doc = parser.parseFromString(str, "text/html");
	return doc.body;
};

/**
 * Splash Screen UI
 */
export default class Splash {
	/**
	 * Create Splash.
	 * @param {Core} core MeeseOS Core instance reference
	 */
	constructor(core) {
		/**
		 * Core instance reference.
		 * @type {Core}
		 * @readonly
		 */
		this.core = core;

		/**
		 * Splash root element.
		 * @type {Element}
		 * @readonly
		 */
		this.$loading = document.createElement("div");
		this.$loading.className = "meeseOS-boot-splash";

		/**
		 * The transition time for `.loadingPage` in `styles/_loading.scss`.
		 * @idea https://stackoverflow.com/q/56523785/6456163
		 * @type {Number}
		 * @readonly
		 */
		this.pageTransitionTime = 1000;

		/**
		 * The time between quips, in milliseconds.
		 * @type {Number}
		 * @readonly
		 */
		this.timePerQuip = 1500;

		/**
		 * The array of quips to display.
		 * @type {String[]}
		 * @readonly
		 */
		this.quips = [
			"Contracting a wizard...",
			"Moving dragon from the mouth of the cave...",
			"Collecting all the loot...",
			"Divvying up dubloons...",
		];

		core.on("meeseOS/core:boot", () => this.show());
		core.on("meeseOS/splash:finished", () => this.destroy());
	}

	/**
	 * Initializes splash with listener for user interaction.
	 */
	init() {
		this.$loading?.appendChild(stringToHTML(loadingScreen));
		this.core.emit("meeseOS/splash:loaded");

		// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#specifying_this_using_bind
		this.start = this.start.bind(this);
		document.body.style.cursor = "pointer";
		document.body.addEventListener("click", this.start, false);
	}

	/**
	 * Starts splash screen functionality after user interaction.
	 */
	start() {
		this.core.emit("meeseOS/splash:started");
		document.body.removeEventListener("click", this.start);

		if (this.core.has("meeseOS/sounds")) {
			this.core.make("meeseOS/sounds").play("dial-up-modem");
		}

		document.getElementById("mouseNotMoved").style.display = "none";
		document.getElementById("mouseMoved").style.display = "block";
		document.body.style.cursor = "default";
		createLettercrap();

		const loadingBar = document.getElementById("loadingBar");
		for (let i = 1; i <= this.quips.length; i++) {
			setTimeout(() => {
				loadingBar.innerText = this.quips[i - 1];
				// IDEA: Attempt CSS animation here using the transition time variable
				loadingBar.style.width = (i / this.quips.length) * 100 + "%";
			}, this.timePerQuip * i);
		}

		// Fade out the loading screen after all the quips have been displayed
		window.setTimeout(() => {
			this.$loading.style.opacity = 0;

			setTimeout(() => {
				this.core.emit("meeseOS/splash:finished");
			}, this.pageTransitionTime);
		}, this.timePerQuip * (this.quips.length + 1));
	}

	/**
	 * Shows splash.
	 */
	show() {
		if (!this.$loading?.parentNode) {
			this.core.$root?.appendChild(this.$loading);
		}
	}

	/**
	 * Destroys splash.
	 */
	destroy() {
		if (this.$loading?.parentNode) {
			this.$loading.remove();
		}

		// *ENSURE* the splash screen is removed from the DOM
		const splash = document.querySelector(".meeseOS-boot-splash");
		if (splash) {
			splash.remove();
		}

		// Clear the reference to the splash element
		this.$loading = null;
	}
}
