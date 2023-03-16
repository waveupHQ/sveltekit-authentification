<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div>
	<h1>Proteced Dashboard</h1>
	{data.isLoggedIn}
</div>
