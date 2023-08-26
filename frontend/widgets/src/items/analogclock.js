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
 * @licence Simplified BSD License
 */

// TODO: Implement parent class override function for update time to make
// the clock animation smooth if the other method does not work

import Widget from "../widget";

/**
 * Analog Clock Colors Options
 * @typedef {Object} AnalogClockColors
 * @property {String} [number="#000000"] Number color
 * @property {String} [hourHand="#000000"] Hour hand color
 * @property {String} [minuteHand="#000000"] Minute hand color
 * @property {String} [secondHand="#000000"] Second hand color
 */

/**
 * Analog Clock Widget Options
 * @typedef {Object} AnalogClockOptions
 * @property {String} [fontFamily="Monospace"] Font family
 * @property {AnalogClockColors} [colors] Clock colors
 * @property {String[]} [labels] Color labels
 */

export default class AnalogClockWidget extends Widget {
	/**
	 * Creates a new instance.
	 * @param {Core} core MeeseOS Core instance reference
	 * @param {AnalogClockOptions} [options] Instance options
	 */
	constructor(core, options) {
		/** The default starting size for this widget. */
		const startingSize = 250;

		/** The minimum dimension for this widget. */
		const minDimension = 150;

		super(
			core,
			options,
			{
				minDimension: {
					width: minDimension,
					height: minDimension,
				},
				dimension: {
					width: startingSize,
					height: startingSize,
				},
			},
			{
				fontFamily: "Monospace",
				colors: {
					"Number Color": "#000000",
					"Hour Hand Color": "#000000",
					"Minute Hand Color": "#000000",
					"Second Hand Color": "#000000",
				},
			}
		);

		this.$tmpCanvas = document.createElement("canvas");
		this.$tmpCanvas.width = startingSize;
		this.$tmpCanvas.height = startingSize;
		this.tmpContext = this.$tmpCanvas.getContext("2d");

		/**
		 * Indicates whether the clock has already been rendered at
		 * the specified size.
		 * @type {Boolean}
		 */
		this.firstRender = true;
	}

	compute() {
		const { width, height } = this.$canvas;
		const { $tmpCanvas } = this;

		$tmpCanvas.width = width;
		$tmpCanvas.height = height;
	}

	onResize() {
		this.compute();
		this.firstRender = true;
	}

	render({ context, width, height }) {
		// Translate to center of canvas initially
		if (this.firstRender) {
			context.translate(width / 2, height / 2);
			this.firstRender = false;
		}

		const size = Math.min(width, height);
		const radius = (size / 2) * 0.9;
		this.drawClock(context, radius);
	}

	getContextMenu() {
		return [
			{
				label: "Set Font",
				onclick: () => this.createFontDialog(),
			},
			{
				label: "Set Colors",
				onclick: () => this.createMultipleColorsDialog(),
			},
		];
	}

	createFontDialog() {
		this.core.make(
			"meeseOS/dialog",
			"font",
			{
				name: this.options.fontFamily,
				controls: ["name"],
			},
			(btn, value) => {
				if (btn === "ok") {
					this.options.fontFamily = value.name;
					this.compute();
					this.saveSettings();
				}
			}
		);
	}

	/**
	 * Creates a color dialog for all of the widget's properties.
	 */
	createMultipleColorsDialog() {
		this.core.make(
			"meeseOS/dialog",
			"multipleColors",
			{
				colors: this.options.colors,
				title: "Set Widget Colors",
			},
			(btn, value) => {
				if (btn === "ok") {
					this.options.colors = value;
					this.compute();
					this.saveSettings();
				}
			}
		);
	}

	/**
	 * Draws the clock widget to the canvas.
	 * @param {CanvasRenderingContext2D} context the canvas context
	 * @param {Number} radius the radius of the clock
	 * @private
	 */
	drawClock(ctx, radius) {
		this.drawFace(ctx, radius);
		this.drawNumbers(ctx, radius);
		this.drawTime(ctx, radius);
	}

	/**
	 * Draws the clock face to the canvas.
	 * @param {CanvasRenderingContext2D} context the canvas context
	 * @param {Number} radius the radius of the clock
	 * @private
	 */
	drawFace(ctx, radius) {
		// The background of the clock
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, 2 * Math.PI);
		ctx.fillStyle = "white";
		ctx.fill();

		// Styling for the border of the clock
		const circleRadius = radius * 0.95;
		const circleEnding = radius * 1.05;
		const gradient = ctx.createRadialGradient(
			0,
			0,
			circleRadius,
			0,
			0,
			circleEnding
		);
		gradient.addColorStop(0, "#333");
		gradient.addColorStop(0.5, "white");
		gradient.addColorStop(1, "#333");

		// Draw the border of the clock
		ctx.strokeStyle = gradient;
		ctx.lineWidth = radius * 0.1;
		ctx.stroke();

		// The center of the clock
		ctx.beginPath();
		ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
		ctx.fillStyle = "black";
		ctx.fill();
	}

	/**
	 * Draws the numbers to the canvas.
	 * @param {CanvasRenderingContext2D} context the canvas context
	 * @param {Number} radius the radius of the clock
	 * @private
	 */
	drawNumbers(ctx, radius) {
		const fontSize = radius * 0.15;
		ctx.fillStyle = this.options.colors["Number Color"];
		ctx.font = `${fontSize}px ${this.options.fontFamily}`;
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";

		for (let num = 1; num < 13; num++) {
			const ang = (num * Math.PI) / 6;
			ctx.rotate(ang);
			ctx.translate(0, -radius * 0.85);
			ctx.rotate(-ang);
			ctx.fillText(num.toString(), 0, 0);
			ctx.rotate(ang);
			ctx.translate(0, radius * 0.85);
			ctx.rotate(-ang);
		}
	}

	/**
	 * Draws the time hands to the canvas.
	 * @param {CanvasRenderingContext2D} context the canvas context
	 * @param {Number} radius the radius of the clock
	 * @private
	 */
	drawTime(ctx, radius) {
		const now = new Date();
		let hour = now.getHours() % 12;
		let minute = now.getMinutes();
		let second = now.getSeconds();

		// Hour hand
		ctx.strokeStyle = this.options.colors["Hour Hand Color"];
		hour =
			(hour * Math.PI) / 6 +
			(minute * Math.PI) / (6 * 60) +
			(second * Math.PI) / (360 * 60);
		this.drawHand(ctx, hour, radius * 0.5, radius * 0.07);

		// Minutes hand
		ctx.strokeStyle = this.options.colors["Minute Hand Color"];
		minute = (minute * Math.PI) / 30 + (second * Math.PI) / (30 * 60);
		this.drawHand(ctx, minute, radius * 0.8, radius * 0.07);

		// Second hand
		ctx.strokeStyle = this.options.colors["Second Hand Color"];
		second = (second * Math.PI) / 30;
		this.drawHand(ctx, second, radius * 0.9, radius * 0.02);
	}

	/**
	 * Draws a single specified hand to the canvas.
	 * @param {CanvasRenderingContext2D} context the canvas context
	 * @param {Number} radius the radius of the clock
	 * @private
	 */
	drawHand(ctx, pos, length, width) {
		// IDEA: Try to override the default widget behavior and get a
		// smooth animation like https://codepen.io/rkosak/pen/mwyRLK
		ctx.beginPath();
		ctx.lineWidth = width;
		ctx.lineCap = "round";
		ctx.moveTo(0, 0);
		ctx.rotate(pos);
		ctx.lineTo(0, -length);
		ctx.stroke();
		ctx.rotate(-pos);
	}

	static metadata() {
		return {
			...super.metadata(),
			title: "Analog Clock",
		};
	}
}
