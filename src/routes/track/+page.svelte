<script lang="ts">
	import { getDatedSession, type Name, save, type SpeakerDurations } from '$lib/storage';
	import { promiseStore } from '$lib';

	const searchOptions = new URLSearchParams(location.search);
	const people: Name[] = searchOptions.get('people')!.split(',');

	if (!searchOptions.get('session')) {
		searchOptions.set('session', String(new Date().getTime()));
		history.replaceState(null, '', '?' + searchOptions.toString());
	}
	const startTime = parseInt(searchOptions.get('session')!);

	const session = promiseStore(
		null,
		getDatedSession(startTime).then((session) => {
			populateMissingSpeakerDurations(session.speakerDurations);
			session.interlocutors = Array.from(new Set([...session.interlocutors, ...people]));
			return session;
		})
	);

	// Mapping of person to timestamp (ms since epoch) they started speaking contiguously
	const speakingSince = populateMissingSpeakerDurations();

	let isLandscape = false;
	calcLandscape();

	function populateMissingSpeakerDurations(dst: SpeakerDurations = {}) {
		people.forEach((person) => !(person in dst) && (dst[person] = 0));
		return dst;
	}

	/* Modifies the `isLandscape` state variable based on window aspect ratio */
	function calcLandscape() {
		isLandscape = window.innerWidth > window.innerHeight;
	}

	function handleSpeakerBegin(person: Name) {
		// Prevent overriding from multiple firings of keydown event
		if (speakingSince[person]) return;

		speakingSince[person] = new Date().getTime();
	}

	function handleSpeakerEnd(person: Name) {
		// Ignore if session not yet loaded from db, or user pressed key out of range, resulting in undefined
		if (!$session || person == undefined) return;

		const now = new Date().getTime();
		$session.speakerDurations[person] += (now - speakingSince[person]) / 1000;
		speakingSince[person] = 0;
		$session.totalDuration = (now - $session.date) / 1000;
		save($session);
	}

	function keybindToPerson(ev: KeyboardEvent): Name {
		return people[Number(ev.key) - 1];
	}

	/** User tried to click the name */
	function handleMouseDown() {
		alert(
			'Please use a touchscreen or keyboard number from 1 (leftmost name) to 9 (rightmost name)'
		);
	}

	/** Converts seconds to a mm:ss string */
	function formatDuration(seconds: number) {
		const MIN = 60;
		const mins = Math.floor(seconds / MIN);
		const secs = String(Math.floor(seconds % MIN)).padStart(2, '0');
		return mins + ':' + secs;
	}
</script>

<div class="flex h-screen w-screen gap-4 p-4" class:flex-col={!isLandscape}>
	{#each people as person}
		<div
			class="w-64 flex-1 rounded-lg border border-gray-300 p-4 shadow-md"
			class:w-full={!isLandscape}
			class:h-full={isLandscape}
			class:bg-gray-300={speakingSince[person]}
			on:touchstart|preventDefault={handleSpeakerBegin.bind(null, person)}
			on:touchend|preventDefault={handleSpeakerEnd.bind(null, person)}
			on:mousedown|preventDefault={handleSpeakerBegin.bind(null, person)}
			on:mouseup|preventDefault={handleSpeakerEnd.bind(null, person)}
			on:mouseenter|preventDefault={(ev) => ev.buttons && handleSpeakerBegin(person)}
			on:mouseleave|preventDefault={(ev) => ev.buttons && handleSpeakerEnd(person)}
			role="button"
		>
			<strong>{person}</strong>
			{#if $session != null}
				<em>{formatDuration($session.speakerDurations[person])}</em>
			{/if}
		</div>
	{/each}
</div>

<svelte:window on:resize={calcLandscape} />
<svelte:document
	on:contextmenu|preventDefault={() => {}}
	on:keydown|preventDefault={(ev) => handleSpeakerBegin(keybindToPerson(ev))}
	on:keyup|preventDefault={(ev) => handleSpeakerEnd(keybindToPerson(ev))}
/>
