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

<button on:click={gotoAuthProvider}>Login with Github</button>
