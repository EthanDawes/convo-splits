<script lang="ts">
	import { getDatedSession, save, type Session } from '$lib/storage';

	const searchOptions = new URLSearchParams(location.search);
	const people = searchOptions.get("people")!.split(",");
	const startTime = searchOptions.get("session") ?? new Date().toUTCString();

	const session: Session = getDatedSession(startTime);
	people.forEach(person => !(person in session.interlocutors) && (session.interlocutors[person] = 0));

	// Mapping of person to timestamp (ms since epoch) they started speaking contiguously
	const speakingSince = constructPersonMapping(0);

	let isLandscape = false;
	calcLandscape();

	function constructPersonMapping<T>(defaultVal: T) {
		return Object.fromEntries(people.map(person => [person, defaultVal]));
	}

	/* Modifies the `isLandscape` state variable based on window aspect ratio */
	function calcLandscape() {
		isLandscape = window.innerWidth > window.innerHeight;
	}

	function handleSpeakerBegin(person: string) {
		speakingSince[person] = new Date().getTime();
	}

	function handleSpeakerEnd(person: string) {
		session.interlocutors[person] += (new Date().getTime() - speakingSince[person]) / 1000;
		speakingSince[person] = 0;
		save(session);
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
				 on:touchend|preventDefault={handleSpeakerEnd.bind(null, person)}>
			<strong>{person}</strong>
			<em>{formatDuration(session.interlocutors[person])}</em>
		</div>
	{/each}
</div>

<svelte:window on:resize={calcLandscape} />
<svelte:document on:contextmenu|preventDefault={() => {}} />
