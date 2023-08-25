/**
 * MeeseOS - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2022-Present, Aaron Meese <aaron@meese.dev>
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
 * @author  Aaron Meese <aaron@meese.dev>
 * @licence Simplified BSD License
 */

/**
 * A mapping of the variable names to their relevant information.
 */
const matrixOptions = {
	rainColor: {
		label: "Rain Color",
		type: "color",
		defaultValue: "rgb(0, 255, 0)",
	},
	backgroundColor: {
		label: "Background Color",
		type: "color",
		defaultValue: "#000000",
	},
	rainbowMode: {
		label: "Rainbow Mode",
		type: "boolean",
		defaultValue: false,
	},
	speed: {
		label: "Delay between drops (ms)",
		type: "number",
		defaultValue: 40,
	},
};

/**
 * Used for keeping track of the currently running interval.
 * @link https://stackoverflow.com/a/16532222/6456163
 */
const matrixObject = {};

/** Unicode Russian characters split into an array. */
const russianCharacters =
	"\u0402\u040A\u040B\u0411\u0414\u0416\u041B\u0424\u0426\u0429\u042A\u042E\u042F\u0434\u0436\u0444\u0464\u0466\u0468\u046A\u0471\u0472\u047A\u0494\u0498\u049C\u04A0\u04A8\u04B4\u04FC\u04FE\u04C1\u0419\u0452\u0463\u046e\u0481".split(
		""
	);

/**
 * Creates a Matrix falling rain effect with Russian characters.
 * @param {HTMLDivElement} background The background element to add the canvas to
 * @param {Object} options The options to use for the effect
 * @link https://github.com/ajmeese7/matrix-wallpaper
 */
const matrix = (background, options) => {
	const defaults = Object.keys(matrixOptions).map((key) => ({
		[key]: matrixOptions[key].defaultValue,
	}));

	// Override the defaults with any user-provided options
	const settings = Object.assign({}, ...defaults, options);

	// Set the canvas width and height to the screen width and height;
	// NOTE: Disabling alpha here makes the rain the wrong size (too big), so don't :)
	const canvas = document.createElement("canvas");
	background.appendChild(canvas);
	const ctx = canvas.getContext("2d");

	// Set the canvas width and height to the screen width and height
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	canvas.classList += " matrix";

	// Define variables above the resize function
	const fontSizeValue = window
		.getComputedStyle(canvas, null)
		.getPropertyValue("font-size");
	const fontSize = parseFloat(fontSizeValue);
	canvas.style.fontSize = fontSize + 1 + "px";

	// Populate the drops array
	const num_columns = Math.round(canvas.width / fontSize);
	const drops = new Array(num_columns).fill(1);
	let previousLength = num_columns;

	/**
	 * Ensures that the canvas will always be the smallest possible size
	 * that covers the screen, so as to not slow down the client.
	 * @link https://stackoverflow.com/a/64981706/6456163
	 */
	function windowResize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const numRows = Math.round(canvas.height / fontSize);
		const newNumColumns = Math.round(canvas.width / fontSize);
		drops.length = newNumColumns;

		// If the new number of columns is less than the previous number,
		// we don't need to fill the array with new characters.
		if (newNumColumns > previousLength) {
			for (let i = previousLength; i < newNumColumns; i++) {
				// Only fill in the new columns with random characters at random rows
				const x = Math.floor(Math.random() * numRows);
				drops[i] = x;
			}
		}

		previousLength = newNumColumns;
	}

	window.addEventListener("resize", windowResize);

	// Useful helper functions for the rain effect
	const getRandomComponent = () => Math.floor(Math.random() * 256);
	const getRainbowColor = () =>
		`rgb(${getRandomComponent()}, ${getRandomComponent()}, ${getRandomComponent()})`;
	const getRussianCharacter = () =>
		russianCharacters[Math.floor(Math.random() * russianCharacters.length)];
	const dim = "rgba(0, 0, 0, 0.04)";

	/** Draws the rain effect on the canvas. */
	function draw() {
		// Makes the previous letters dim
		ctx.fillStyle = dim;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Prepare to draw the raindrops
		const textColor = settings.rainbowMode
			? getRainbowColor()
			: settings.rainColor;
		ctx.fillStyle = textColor;
		ctx.font = fontSize + "px arial";
		const backgroundColor = settings.backgroundColor;

		// Draw the raindrops
		for (let xCoord = 0; xCoord < drops.length; xCoord++) {
			ctx.fillStyle = backgroundColor;
			ctx.fillRect(
				xCoord * fontSize,
				drops[xCoord] * fontSize,
				fontSize,
				fontSize
			);
			ctx.fillStyle = textColor;

			const character = getRussianCharacter();
			ctx.fillText(character, xCoord * fontSize, drops[xCoord] * fontSize);

			// If the drop has gone below the canvas, potentially reset it and create a new drop
			if (drops[xCoord] * fontSize > canvas.height && Math.random() > 0.975) {
				drops[xCoord] = 0;
			}

			drops[xCoord]++;
		}
	}

	// Makes it start off fast (to cover the whole screen) then slow down
	const fastSpeed = 10;
	const timeForWholeScreen = (fastSpeed * window.innerHeight) / fontSize;

	// Clear out any possible previous intervals from previous settings
	clearInterval(matrixObject.interval);
	matrixObject.interval = setInterval(draw, fastSpeed);

	setTimeout(() => {
		// Clear the fast interval
		clearInterval(matrixObject.interval);

		// Change the interval to the user-defined speed
		matrixObject.interval = setInterval(draw, settings.speed);
	}, timeForWholeScreen);
};

/**
 * Destroys the Matrix effect.
 */
const destroy = () => {
	if (matrixObject.interval) {
		console.debug("Destroying Matrix effect");
		clearInterval(matrixObject.interval);
		matrixObject.interval = null;
	}
};

export default {
	label: "Matrix",
	effect: matrix,
	options: matrixOptions,
	destroy,
};
