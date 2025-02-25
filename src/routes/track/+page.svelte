<script lang="ts">
	import { getDatedSession, save, type SpeakerDurations } from '$lib/storage';
	import { promiseStore } from '$lib';

	const searchOptions = new URLSearchParams(location.search);
	const people = searchOptions.get("people")!.split(",");

	if (!searchOptions.get("session")) {
		searchOptions.set("session", String(new Date().getTime()));
		history.replaceState(null, "", "?" + searchOptions.toString());
	}
	const startTime = parseInt(searchOptions.get("session")!);

	const session = promiseStore(null, getDatedSession(startTime).then(session => {
		populateMissingSpeakerDurations(session.speakerDurations);
		return session;
	}));


	// Mapping of person to timestamp (ms since epoch) they started speaking contiguously
	const speakingSince = populateMissingSpeakerDurations();

	let isLandscape = false;
	calcLandscape();

	function populateMissingSpeakerDurations(dst: SpeakerDurations = {}) {
		people.forEach(person => !(person in dst) && (dst[person] = 0));
		return dst;
	}

	/* Modifies the `isLandscape` state variable based on window aspect ratio */
	function calcLandscape() {
		isLandscape = window.innerWidth > window.innerHeight;
	}

	function handleSpeakerBegin(person: string) {
		speakingSince[person] = new Date().getTime();
	}

	function handleSpeakerEnd(person: string) {
		if (!$session) return;
		$session.speakerDurations[person] += (new Date().getTime() - speakingSince[person]) / 1000;
		speakingSince[person] = 0;
		save($session);
	}

	/** User tried to click the name */
	function handleMouseDown() {
		alert("Please use a touchscreen or keyboard number from 1 (leftmost name) to 9 (rightmost name)");
	}

	/** Converts seconds to a mm:ss string */
	function formatDuration(seconds: number) {
		const MIN = 60;
		const mins = Math.floor(seconds / MIN);
		const secs = String(Math.floor(seconds % MIN)).padStart(2, '0');
		return mins + ':' + secs;
	}
</script>

<div class="flex gap-4 p-4 w-screen h-screen" class:flex-col={!isLandscape}>
	{#each people as person}
		<div class="border border-gray-300 rounded-lg p-4 shadow-md w-64 flex-1"
				 class:w-full={!isLandscape} class:h-full={isLandscape} class:bg-gray-300={speakingSince[person]}
				 on:touchstart|preventDefault={handleSpeakerBegin.bind(null, person)}
				 on:mousedown={handleMouseDown}
				 on:touchend|preventDefault={handleSpeakerEnd.bind(null, person)}
				 role="button">
			<strong>{person}</strong>
			{#if $session != null}
				<em>{formatDuration($session.speakerDurations[person])}</em>
			{/if}
		</div>
	{/each}
</div>

<svelte:window on:resize={calcLandscape} />
<svelte:document on:contextmenu|preventDefault={() => {}} />
