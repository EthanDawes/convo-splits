// place files you want to import through the `$lib` alias in this folder.

import { readable } from 'svelte/store';
import { getSessionInterlocutors, type Interlocutors } from '$lib/storage';

export function promiseStore<T>(initial: T, promise: Promise<T>) {
	return readable(initial, set => void promise.then(set));
}
