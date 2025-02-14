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

const { ServiceProvider } = require("@meese-os/common");
const Auth = require("../auth.js");

/**
 * MeeseOS Auth Service Provider
 */
class AuthServiceProvider extends ServiceProvider {
	/**
	 * Create new instance.
	 * @param {Core} core MeeseOS Core instance reference
	 * @param {Object} [options={}] Arguments
	 */
	constructor(core, options = {}) {
		super(core, options);

		this.auth = new Auth(core, options);
	}

	/**
	 * A list of services this provider depends on.
	 * @returns {String[]}
	 */
	depends() {
		return ["meeseOS/token-factory"];
	}

	/**
	 * Initializes auth.
	 * @returns {Promise<undefined>}
	 */
	async init() {
		// eslint-disable-next-line no-unused-vars
		const { route, routeAuthenticated } = this.core.make("meeseOS/express");

		route("post", "/register", (req, res) => this.auth.register(req, res));
		route("post", "/login", (req, res) => this.auth.login(req, res));
		// TODO: fix the issue of this not working when `routeAuthenticated` is used
		route("post", "/logout", (req, res) => this.auth.logout(req, res));

		await this.auth.init();
	}

	/**
	 * Destroys instance.
	 */
	destroy() {
		this.auth.destroy();
		super.destroy();
	}
}

module.exports = AuthServiceProvider;
