// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

// Define the output type
export type OutputType = { user: object; isLoggedIn: boolean };

// Define the load function
export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (user) {
		// Return the output object
		return { user, isLoggedIn: true };
	}
	// Return the output object
	return {
		user: undefined,
		isLoggedIn: false
	};
};
