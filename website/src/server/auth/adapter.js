/*
 * For more information about authentication adapters, visit:
 * - https://manual.aaronmeese.com/tutorial/auth/
 * - https://manual.aaronmeese.com/guide/auth/
 * - https://manual.aaronmeese.com/development/
 */

const dotenvJSON = require("complex-dotenv-json");
const path = require("path");

const envFile = path.resolve(__dirname, ".env.json");
dotenvJSON({ path: envFile });

/**
 * JSON-based Auth adapter.
 * @param {Core} core MeeseOS Core instance reference
 * @param {Object} [options] Adapter options
 */
module.exports = (_core, _options) => ({
	init: () => true,

	destroy: () => true,

	login(req, _res) {
		const { username, password } = req.body;
		let groups = [];

		// TODO: Also make this dependent on the configuration
		if (username === "guest" && password === "guest") {
			// The guest user's credentials will be passed automatically
			// when the "Login as Guest" button is clicked
			groups = ["guest"];
		} else {
			// Validate the user against the 'database'
			try {
				const users = JSON.parse(process.env.meeseOS_users);
				const usernameExists = Object.prototype.hasOwnProperty.call(users, username);
				if (usernameExists) {
					const passwordCorrect = users[username].password === password;
					if (passwordCorrect) {
						groups = users[username].groups;
					}
				}
			} catch (e) {
				console.error("Error validating user against the database:", e);
			}
		}

		if (groups.length === 0) {
			// Default deny if no match
			return false;
		}

		return ({ username: req.body.username });
	},

	register(_req, _res) {
		throw new Error("Registration not available");
	},

	logout: (_req, _res) => true,
});
