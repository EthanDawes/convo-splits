<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	const searchOptions = new URLSearchParams(location.search);
	const people = searchOptions.get("people")!.split(",");
	const startTime = searchOptions.get("session") ?? new Date().toUTCString();

	let isLandscape = false;
	calcLandscape();

	function calcLandscape() {
		isLandscape = window.innerWidth > window.innerHeight;
	}

	onMount(() => {
		window.addEventListener("resize", calcLandscape);
	});

	onDestroy(() => {
		window.removeEventListener("resize", calcLandscape);
	})
</script>

<div class="flex gap-4 p-4 w-screen h-screen" class:flex-col={!isLandscape}>
	{#each people as person}
		<div class="border border-gray-300 rounded-lg p-4 shadow-md w-64 flex-1"
				 class:w-full={!isLandscape} class:h-full={isLandscape}>
			{person}
		</div>
	{/each}
</div>
