<script lang="ts">
	import { getPeople, save } from '$lib/storage';

	let people = getPeople();
	let selectedPeople: Record<string, boolean> = {};

	function newPerson() {
		const name = prompt("new person's name");
		if (!name) return;
		people[name] = 0;
		save(people);
	}

	function submitForm() {
		console.log("Selected people:", Object.keys(selectedPeople).filter(person => selectedPeople[person]));
	}
</script>

<div class="flex flex-wrap gap-4 p-4">
	{#each Object.entries(people) as [person, time]}
		<label class="border border-gray-300 rounded-lg p-4 shadow-md w-64 cursor-pointer">
			<input type="checkbox" bind:checked={selectedPeople[person]} class="hidden" />
			<h3 class="text-lg font-semibold">{person}</h3>
			<p class="text-sm text-gray-600">{time} min</p>
		</label>
	{/each}
	<button class="border border-gray-300 rounded-lg p-4 shadow-md w-64" on:click={newPerson}>
		<h3 class="text-lg font-semibold">+</h3>
	</button>
</div>

<button class="mt-4 ml-4 p-2 bg-blue-500 text-white rounded" on:click={submitForm}>Next</button>

<style>
	label:has(input:checked) {
      background-color: silver;
	}
</style>
