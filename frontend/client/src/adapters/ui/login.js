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

import { app, h } from "hyperapp";
import { EventEmitter } from "@meese-os/event-emitter";

/**
 * Creates the attributes for a given field
 * @param {Object} props
 * @param {HTMLElement} field
 * @param {Boolean} disabled
 * @returns {Object}
 */
const createAttributes = (props, field, disabled) => {
	disabled = disabled ? "disabled" : undefined;
	if (field.tagName === "input") {
		if (field.attributes.type !== "submit") {
			const autocomplete = field.attributes.autocomplete ?? true;
			return {
				autocapitalize: "off",
				autocomplete: autocomplete ? "new-" + field.attributes.name : "off",
				disabled,
				oncreate: (el) =>
					(el.value = props[field.attributes.name] ?? field.value ?? ""),
				...field.attributes,
			};
		}
	}

	return { disabled, ...field.attributes };
};

/**
 * Creates the fields for the login form
 * @param {Object} props
 * @param {HTMLElement[]} fields
 * @param {Boolean} disabled
 * @returns {Array}
 */
const createFields = (props, fields, disabled) => {
	const children = (field) => {
		if (field.tagName === "select" && field.choices) {
			return field.choices.map((c) =>
				h(
					"option",
					{
						current: c.current ? "current" : undefined,
						value: c.value,
					},
					c.label
				)
			);
		}

		return field.children || [];
	};

	return fields.map((field) =>
		h(
			"div",
			{
				class: "meeseOS-login-field meeseOS-login-field-" + field.tagName,
			},
			h(field.tagName, createAttributes(props, field, disabled), children(field))
		)
	);
};

/**
 * Creates the view for the login UI
 * @param {Object} options
 */
const createView = (options) => {
	const { src, position } = options.logo;

	const logo = () =>
		h("div", {
			class: "meeseOS-login-logo",
			"data-position": position,
			style: {
				backgroundImage: `url("${src}")`,
			},
		});

	const fields = (state) => {
		const result = createFields(state, options.fields, state.loading);

		if (src && position === "bottom") {
			result.push(logo());
		}

		if (options.stamp) {
			result.push(
				h(
					"div",
					{
						class: "meeseOS-login-stamp",
					},
					options.stamp
				)
			);
		}

		return result;
	};

	return (state, actions) => {
		const header = [];

		if (options.title) {
			header.push(
				h(
					"div",
					{
						class: "meeseOS-login-header",
					},
					h("span", {}, options.title)
				)
			);
		}

		if (src && ["top", "middle"].indexOf(position) !== -1) {
			const m = position === "top" ? "unshift" : "push";

			header[m](logo());
		}

		const createSide = (side) =>
			position === side
				? h("div", { "data-position": position }, logo())
				: null;

		const left = () => createSide("left");
		const right = () => createSide("right");
		const middle = () => h("div", { class: "meeseOS-login-content" }, children);

		const formFields = fields(state);

		const children = [
			...header,

			h(
				"div",
				{
					class: "meeseOS-login-error",
					style: { display: state.error ? "block" : "none" },
				},
				h("span", {}, state.error)
			),
			h(
				"form",
				{
					loading: false,
					method: "post",
					action: "#",
					autocomplete: "off",
					onsubmit: actions.submit,
				},
				formFields
			),
		];

		return h(
			"div",
			{
				class: "meeseOS-login",
				id: options.id,
				style: { display: state.hidden ? "none" : undefined },
			},
			[left(), middle(), right()].filter((el) => Boolean(el))
		);
	};
};

/**
 * Login UI Adapter
 * @param {Object} options
 * @param {*} login
 * @param {*} startHidden
 * @param {*} $container
 * @returns {EventEmitter}
 */
const create = (options, login, startHidden, $container) => {
	const ee = new EventEmitter("LoginUI");
	const view = createView(options);
	const a = app(
		{
			hidden: startHidden,
			...login,
		},
		{
			setLoading: (loading) => ({ loading }),
			setError: (error) => ({ error, hidden: false }),
			submit: (ev) => (state) => {
				ev.preventDefault();
				if (state.loading) return;

				let values = {};
				if (ev.submitter.id === "guest-login") {
					values = { username: "guest", password: "guest" };
				} else {
					values = Array.from(ev.target.elements)
						.filter((el) => el.type !== "submit")
						.reduce((o, el) => ({ ...o, [el.name]: el.value }), {});
				}

				ee.emit("login:post", values);
			},
		},
		view,
		$container
	);

	ee.on("login:start", () => a.setLoading(true));
	ee.on("login:stop", () => a.setLoading(false));
	ee.on("login:error", (msg) => a.setError(msg));

	return ee;
};

export default create;
