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

const fs = require("fs-extra");
const url = require("url");
const sanitizeFilename = require("sanitize-filename");
const formidable = require("formidable");
const { Stream } = require("stream");

/**
 * A map of error codes.
 */
const errorCodes = {
	ENOENT: 404,
	EACCES: 401,
};

/**
 * Gets prefix of a VFS path.
 * @param {String} path
 * @returns {String}
 */
const getPrefix = (path) => String(path).split(":")[0];

/**
 * Sanitizes a path.
 * @param {String|Array} path
 * @returns {String}
 */
const sanitize = (path) => {
	// Handle an array of strings
	if (Array.isArray(path)) {
		return path.map((singlePath) => sanitize(singlePath));
	}

	// Handle a single string
	const [name, str] = (
		path.replace(/\/+/g, "/").match(/^([\w-_]+):+(.*)/) || []
	).slice(1);

	const sane = str
		.split("/")
		.map((s) => sanitizeFilename(s))
		.join("/")
		.replace(/\/+/g, "/");

	return name + ":" + sane;
};

/**
 * Gets the stream from an HTTP request.
 * @param {Request} req
 */
const streamFromRequest = (req) => {
	const isStream = req.files.upload instanceof Stream;
	if (isStream) return req.files.upload;

	const filePath = req.files.upload.filepath || req.files.upload.path;
	if (!filePath) {
		throw new Error("File path is empty or undefined.");
	}

	return fs.createReadStream(filePath);
};

/**
 * @param {Array} arr
 * @param {Array} compare
 * @param {Boolean} strict
 * @returns {Boolean}
 */
const validateAll = (arr, compare, strict = true) =>
	arr[strict ? "every" : "some"]((g) => compare.indexOf(g) !== -1);

/**
 * Validates array groups.
 *
 * @param {Array} groups
 * @param {Array} userGroups
 * @param {Boolean} strict
 * @returns {Boolean}
 */
const validateNamedGroups = (groups, userGroups, strict) => {
	const namedGroups = groups.filter((g) => typeof g === "string");

	return namedGroups.length
		? validateAll(namedGroups, userGroups, strict)
		: true;
};

/**
 * Validates map of groups based on method:[group,...]
 *
 * @param {Array} groups
 * @param {Array} userGroups
 * @param {String} method
 * @param {Boolean} strict
 * @returns {Boolean}
 */
const validateMethodGroups = (groups, userGroups, method, strict) => {
	const methodGroups = groups.find((g) =>
		typeof g === "string" ? false : method in g
	);

	return methodGroups
		? validateAll(methodGroups[method], userGroups, strict)
		: true;
};

/**
 * Validates groups.
 *
 * @param {Array} userGroups
 * @param {String} method
 * @param {Object} mountpoint
 * @param {Boolean} strict
 * @returns {Boolean}
 */
const validateGroups = (userGroups, method, mountpoint, strict) => {
	const groups = mountpoint.attributes.groups || [];
	if (groups.length) {
		const namedValid = validateNamedGroups(groups, userGroups, strict);
		const methodValid = validateMethodGroups(
			groups,
			userGroups,
			method,
			strict
		);

		return namedValid && methodValid;
	}

	return true;
};

/**
 * Checks permissions for given mountpoint.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {String} method
 * @param {Boolean} readOnly
 * @param {Boolean} strict
 */
const checkMountpointPermission = (req, res, method, readOnly, strict) => {
	const userGroups = req.session.user.groups;

	return ({ mount }) => {
		if (readOnly) {
			const { attributes, name } = mount;

			if (attributes.readOnly) {
				const failed = typeof readOnly === "function"
					? getPrefix(readOnly(req, res)) === name
					: readOnly;

				if (failed) {
					return Promise.reject(
						createError(403, `Mountpoint '${name}' is read-only`)
					);
				}
			}
		}

		if (validateGroups(userGroups, method, mount, strict)) {
			return Promise.resolve(true);
		}

		return Promise.reject(
			createError(
				403,
				`Permission was denied for '${method}' in '${mount.name}'`
			)
		);
	};
};

/**
 * Creates a new custom Error.
 * @param {Number} code
 * @param {String} message
 * @return {Error}
 */
const createError = (code, message) => {
	const error = new Error(message);
	error.code = code;
	return error;
};

/**
 * Resolves a mountpoint.
 * @param {Core} core MeeseOS Core instance reference
 * @returns {Object}
 */
const mountpointResolver = (core) =>
	async (path) => {
		const { adapters, mountpoints } = core.make("meeseOS/vfs");
		const prefix = getPrefix(path);
		const mount = mountpoints.find((m) => m.name === prefix);

		if (!mount) {
			throw createError(403, `Mountpoint not found for '${prefix}'`);
		}

		const adapter = await (mount.adapter
			? adapters[mount.adapter]
			: adapters.system);

		return Object.freeze({ mount, adapter });
	};

/**
 * Parses URL body.
 * @param {Request} req
 * @returns {Promise<Object>}
 */
const parseGet = (req) => {
	// skipcq: JS-0272
	const { query } = url.parse(req.url, true);

	return Promise.resolve({ fields: query, files: {} });
};

/**
 * Parses JSON body.
 * @param {Request} req
 * @returns {Object|Boolean}
 */
const parseJson = (req) => {
	const isJson = req.headers["content-type"] &&
		req.headers["content-type"].indexOf("application/json") !== -1;

	if (isJson) {
		return { fields: req.body, files: {} };
	}

	return false;
};

/**
 * Parses form body.
 *
 * @param {Request} req
 * @param {Number} config.maxFieldsSize
 * @param {Number} config.maxFileSize
 * @returns {Promise<any>}
 */
const parseFormData = (req, { maxFieldsSize, maxFileSize }) => {
	const form = formidable({
		multiples: true,
		maxFieldsSize,
		maxFileSize,
	});

	return new Promise((resolve, reject) => {
		form.parse(req, (err, fields, files) => {
			return err ? reject(err) : resolve({ fields, files });
		});
	});
};

/**
 * Middleware for handling HTTP requests.
 * @param {Object} config
 * @returns {Promise<any>}
 */
const parseFields = (config) =>
	(req, _res) => {
		if (["get", "head"].indexOf(req.method.toLowerCase()) !== -1) {
			return Promise.resolve(parseGet(req));
		}

		const json = parseJson(req);
		if (json) return Promise.resolve(json);

		return parseFormData(req, config);
	};

/**
 * A map of methods and their arguments.
 * Used for direct access via API.
 */
const methodArguments = {
	realpath: ["path"],
	exists: ["path"],
	stat: ["path"],
	readdir: ["path"],
	readfile: ["path"],
	writefile: ["path", (upload) => ({ upload })],
	mkdir: ["path"],
	unlink: ["path"],
	touch: ["path"],
	search: ["root", "pattern"],
	copy: ["from", "to"],
	rename: ["from", "to"],
	archive: ["selection"],
};

module.exports = {
	mountpointResolver,
	createError,
	checkMountpointPermission,
	validateGroups,
	streamFromRequest,
	sanitize,
	getPrefix,
	parseFields,
	errorCodes,
	methodArguments,
};
