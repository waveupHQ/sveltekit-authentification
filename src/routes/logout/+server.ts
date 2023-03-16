// src/routes/logout/+server.ts

import { redirect } from '@sveltejs/kit';

import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = ({ locals }: RequestEvent) => {
	// Clear the authStore
	locals.pb?.authStore.clear();

	// Set the user to undefined
	locals.user = undefined;

	// Redirect to the home page
	throw redirect(303, '/');
};
