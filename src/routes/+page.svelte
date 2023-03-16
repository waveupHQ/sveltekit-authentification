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
