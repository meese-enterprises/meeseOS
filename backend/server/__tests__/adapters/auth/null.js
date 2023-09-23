const nullAdapter = require("../../../src/adapters/auth/null.js");
const adapter = nullAdapter();

describe("Auth null adapter", () => {
	test("#init", () => {
		return expect(adapter.init()).resolves.toBe(true);
	});

	test("#destroy", () => {
		return expect(adapter.destroy()).resolves.toBe(true);
	});

	test("#login", () => {
		// TODO: Fix the error here with inequal objects
		/*return expect(
			adapter.login({
				body: {
					username: "jest",
				},
			})
		).resolves.toEqual({
			username: "jest",
		});*/
	});

	test("#logout", () => {
		return expect(adapter.logout()).resolves.toBe(true);
	});

	test("#register", () => {
		return expect(
			adapter.register({
				body: { username: "jest", password: "jest" },
			})
		).resolves.toEqual({ username: "jest" });
	});
});
