import { redirect, type Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

import { POCKETBASE_URL } from '$env/static/private';

export const handle: Handle = async ({ event, resolve }) => {
	// Create a new PocketBase instance
	event.locals.pb = new PocketBase(POCKETBASE_URL);

	// Load the authStore from the cookie
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	try {
		// Check if the user is authenticated
		if (event.locals.pb.authStore.isValid) {
			// Refresh the user's authentication
			await event.locals.pb.collection('users').authRefresh();

			// Set the user in the locals object
			event.locals.user = structuredClone(event.locals.pb.authStore.model);
		}
	} catch (err) {
		// Clear the authStore if there is an error
		event.locals.pb.authStore.clear();
	}

	// Check if the user is logged on every request to '/dashboard/...'
	if (event.url.pathname.startsWith('/dashboard')) {
		if (!event.locals.user) {
			// Redirect to the login page if the user is not logged in
			throw redirect(303, '/login');
		}
	}

	// Resolve the request
	const response = await resolve(event);

	// Set the cookie
	const isProd = process.env.NODE_ENV === 'production' ? true : false;
	response.headers.set(
		'set-cookie',
		event.locals.pb.authStore.exportToCookie({ secure: isProd, sameSite: 'Lax' })
	);

	return response;
};
