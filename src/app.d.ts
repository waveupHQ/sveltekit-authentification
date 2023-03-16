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
