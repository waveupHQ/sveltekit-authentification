# How to setup an Authentication & User Management on SvelteKit using pocketbase

Here's a step-by-step guide for building an authentication and user management system using SvelteKit 1.0 and Tailwind CSS 3.0 with Pocketbase as the backend:

## 1. Create a new SvelteKit project with `npm init svelte@next` or `pnpm create svelte@next` .

## 2. Set up Tailwind CSS by following the instructions in their [documentation](https://tailwindcss.com/docs/guides/sveltekit).

## 3. Create a new Pocketbase app and enable Github as an OAuth provider by following the instructions

### 3.1 Here are the instructions to create a Github OAuth application

- Go to https://github.com/settings/applications/new in your browser and create a new application called "authy" with a homepage of `http://localhost:5173/` and a callback URL of `http://localhost:5173/auth/callback`.

- Click "Register application".

- In your project directory, create a `.env` file and add the client ID from the Github page to the `.env` file as `CLIENT_ID`. Then click "Generate a new client secret" on Github OAuth application and copy the secret and add it to the `.env` file as `CLIENT_SECRET`. Add also the PocketBase `url`.

```
 CLIENT_ID=XXXXXXX
 CLIENT_SECRET=XXXXXXXXXX
 POCKETBASE_URL="http://localhost:8090"
```

- Save and close your `.env` file.

  ### 3.2 set up the Auth provider on PocketBase.

- Go to http://localhost:8090/\_/ or where you hosted your pocketbase backend
- Go to Settings > Auth providers
- Click on Github and check Enable
- Copy the Application ID (from Github application) to the CLIENT ID
- Copy the secret to CLIENT SECRET

Now we have Github as an OAuth provider enabled on PocketBase let’s start coding on SvelteKit.

## 4. Install the necessary dependencies:

```
pnpm install pocketbase
```

## 5. Create a new file called `src/hooks.server.ts` and add the following code:

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
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
```

The `handle` function is an asynchronous function that acts as middleware between each of our requests. It sets `event.locals.pb` to a new instance of `PocketBase` with `POCKETBASE_URL` as its argument. It then loads the store data from the request cookie string using `event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '')`.

The function then tries to refresh the authentication and token if it is valid and set the user in the locals object. If it is not valid, it clears the authentication store. Finally, it sets the `set-cookie` header with the exported cookie from `event.locals.pb.authStore.exportToCookie({ secure: isProd, sameSite: 'Lax' })` and returns the response.

> The SameSite attribute accepts three values: Lax, strict, None
> Here `Lax`, Cookies are not sent on normal cross-site subrequests (for example to load images or frames into a third party site), but are sent when a user is navigating to the origin site (i.e., when following a link).

Then if you are using Typescript go to your app.d.ts file and make it look like this:

```ts
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Error {}
	// interface Locals {}
	type PocketBase = import('pocketbase').default;

	interface Locals {
		pb?: PocketBase;
		user?: Record<string, T>;
	}
	// interface PageData {}
	// interface Platform {}
}
```

## 6. Create the login route

```typescript
//src/routes/login/+page.server.ts

import type { PageServerLoad } from './$types';

// Define the output type
export type OutputType = { authProviderRedirect: string; authProviderState: string };

// Define the load function
export const load: PageServerLoad<OutputType> = async ({ locals, url }) => {
	// Get all the auth providers
	const authMethods = await locals.pb?.collection('users').listAuthMethods();
	if (!authMethods) {
		return {
			authProviderRedirect: '',
			authProviderState: ''
		};
	}

	// Get the first auth provider (Github)
	const redirectURL = `${url.origin}/auth/callback`;
	const githubAuthProvider = authMethods.authProviders[0];

	// Set the auth provider redirect URL and state
	const authProviderRedirect = `${githubAuthProvider.authUrl}${redirectURL}`;
	const state = githubAuthProvider.state;

	// Return the auth provider redirect URL and state
	return {
		authProviderRedirect: authProviderRedirect,
		authProviderState: state
	};
};
```

This code sets up the login page. It defines the `OutputType` type which has two properties: `authProviderRedirect` and `authProviderState`. It also defines the `load` function that gets all the authentication providers using `locals.pb?.collection('users').listAuthMethods()`. If there are no authentication providers, it returns an object with empty strings for `authProviderRedirect` and `authProviderState`.

If there are authentication providers, it sets the `redirectURL` to `${url.origin}/auth/callback` and gets the first authentication provider (Github) using `authMethods.authProviders[0]`. It then sets the `authProviderRedirect` to `${githubAuthProvider.authUrl}${redirectURL}` and the `state` to `githubAuthProvider.state`. Finally, it returns an object with `authProviderRedirect` and `authProviderState`.

Now, what is returned from this `src/routes/login/+page.server.ts` can be accessed by the Svelte page. Let’s see how we can do this.

```typescript
// src/routes/login/+page.svelte.

<script lang="ts">
    import { browser } from '$app/environment';
    import type { PageData } from './$types';

    // Define the data variable
    export let data: PageData;

    // Define the gotoAuthProvider function
    function gotoAuthProvider() {
        // Save the state in the cookie
        if (browser) {
            document.cookie = `state=${data?.authProviderState}`;
        }

        // Redirect the user to the OAuth login for Github
        window.location.href = data.authProviderRedirect || '';
    }

</script>

<button on:click={gotoAuthProvider}>Login with github</button>
```

This code creates a Svelte page that allows the user to login with Github. It defines the `data` variable which is of type `PageData`.

When the user clicks the button to go login with Github, the `gotoAuthProvider` function is called. It saves the state in the cookie using `document.cookie = `state=${data?.authProviderState}`;`. It then redirects the user to the OAuth login for github using `window.location.href = data.authProviderRedirect || '';`.

## 7. Create the callback logic to authenticate (and create an account if needed)

When Github authorizes or denies access, it sends a callback URL to notify our application. Create a new file, `src/routes/auth/callback.ts`, and add a GET handler to it. This callback usually should be called right after the provider login page redirect :

```typescript
// src/routes/auth/callback/+server.ts

import { redirect } from '@sveltejs/kit';
import type { RequestEvent, RequestHandler } from './$types';

// Define the GET request handler
export const GET: RequestHandler = async ({ locals, url, cookies }: RequestEvent) => {
	// Set the redirect URL and expected state
	const redirectURL = `${url.origin}/auth/callback`;
	const expectedState = cookies.get('state');

	// Get the state and code from the query parameters
	const query = new URLSearchParams(url.search);
	const state = query.get('state');
	const code = query.get('code');

	// Get the authentication providers
	const authMethods = await locals.pb?.collection('users').listAuthMethods();

	// If there are no authentication providers, redirect to the login page
	if (!authMethods?.authProviders) {
		console.log('authy providers');
		throw redirect(303, '/login');
	}

	// Get the first authentication provider
	const provider = authMethods.authProviders[0];

	// If there is no authentication provider, redirect to the login page
	if (!provider) {
		console.log('Provider not found');
		throw redirect(303, '/login');
	}

	// If the expected state does not match the state from the query parameters, redirect to the login page
	if (expectedState !== state) {
		console.log('state does not match expected', expectedState, state);
		throw redirect(303, '/login');
	}

	// Authenticate the user with OAuth2
	try {
		await locals.pb
			?.collection('users')
			.authWithOAuth2(provider.name, code || '', provider.codeVerifier, redirectURL);
	} catch (err) {
		console.log('Error logging in with 0Auth user', err);
	}

	// Redirect to the home page
	throw redirect(303, '/');
};
```

This code creates a server page that handles the authentication logic. It defines the `GET` request handler which is an asynchronous function that takes an object with `locals`, `url`, and `cookies` properties as its argument.

The function sets the `redirectURL` to `${url.origin}/auth/callback` and gets the `expectedState` from the cookie using `cookies.get('state')`. It then gets the `state` and `code` from the query parameters using `new URLSearchParams(url.search).get('state')` and `new URLSearchParams(url.search).get('code')`.

The function gets all the authentication providers using `await locals.pb?.collection('users').listAuthMethods();`. If there are no authentication providers, it redirects to the login page using `

The main authentication logic happens in the following code block:

```ts
await locals.pb
	?.collection('users')
	.authWithOAuth2(provider.name, code || '', provider.codeVerifier, redirectURL);
```

This code uses Pocketbase to handle authentication - it validates the query parameters sent to the redirect URI. If the user is not registered with the email used for authentication, Pocketbase creates a new user. If everything passes, the user is redirected to the home page with the `redirect(303, '/')` command. User login status is checked with `locals.pb.authStore.isValid`, and page data is passed to Svelte components/pages using the same pattern as seen in `+page.server.ts` & `+page.svelte`.

## Logout

Create a new file called `src/routes/logout/+server.ts` in this file we will create a get endpoint handler function. In this function, we want to set the user equal to null and redirect the request back to the login page.

```ts
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
```

## Protecting pages and endpoints

Now that you have authentication working with Github OAuth, you may want to protect some pages and endpoints(`/dashboard` here). For security you need to checks authentication on every request. The final `hooks.server.ts` look like that :

```typescript
// src/hooks.server.ts
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
```

In this example, we are protecting all pages that start with `/dashboard/*` in their path.

## Access to the `User` session data

This simple setup provides helpful methods to login and logout on user actions. In the following example, we check if the user is authenticated for the main index route. If we have session data, we’re able to display the user’s avatar and name. Otherwise, we can show a sign-in button.

```typescript
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
```

Now we can access to the user object on any page :

```ts
// src/routes/+page.svelte
// src/routes/foo/+page.svelte

<script lang="ts">
	export let data;
	$: ({ user, isLoggedIn } = data);
</script>

<h1 class="text-3xl font-bold underline text-red-400">Hello world!</h1>

{#if isLoggedIn}
	<h2>Welcome {user?.username}</h2>
	<a href="/logout">
		<button>Logout</button>
	</a>
{:else}
	<a href="/login">
		<button>Login using Github</button>
	</a>
{/if}

```
