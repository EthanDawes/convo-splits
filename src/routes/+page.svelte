<script lang="ts">
	import { getPeople, save } from '$lib/storage';
	import { goto } from '$app/navigation';

	let people = getPeople();
	let selectedPeople: Record<string, boolean> = {};

	function newPerson() {
		const name = prompt("new person's name");
		if (!name) return;
		people[name] = 0;
		save(people);
	}

	function submitForm() {
		// TODO: make selection order count?
		// TODO: make a derived store anchor href
		const people = Object.keys(selectedPeople)
			.filter((person) => selectedPeople[person])
			.join(',');
		goto(`/track?people=${people}`);
	}
</script>

<div class="flex flex-wrap gap-4 p-4">
	{#each Object.entries(people) as [person, time]}
		<label class="w-64 cursor-pointer rounded-lg border border-gray-300 p-4 shadow-md">
			<input type="checkbox" bind:checked={selectedPeople[person]} class="hidden" />
			<h3 class="text-lg font-semibold">{person}</h3>
			<p class="text-sm text-gray-600">{time} min</p>
		</label>
	{/each}
	<button class="w-64 rounded-lg border border-gray-300 p-4 shadow-md" on:click={newPerson}>
		<h3 class="text-lg font-semibold">+</h3>
	</button>
</div>

<button class="mt-4 ml-4 rounded bg-blue-500 p-2 text-white" on:click={submitForm}>Next</button>

<style>
	label:has(input:checked) {
		background-color: silver;
	}
</style>
