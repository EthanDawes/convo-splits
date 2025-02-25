// place files you want to import through the `$lib` alias in this folder.

import { writable } from 'svelte/store';

export function promiseStore<T>(initial: T, promise: Promise<T>) {
	return writable(initial, (set) => void promise.then(set));
}
