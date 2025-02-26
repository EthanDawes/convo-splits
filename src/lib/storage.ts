import Dexie, { type EntityTable, type InsertType } from 'dexie';
import { readable } from 'svelte/store';

// Seconds elapsed
export type Duration = number;

// Person name
export type Name = string;

// Milliseconds since epoch
export type SessionDate = number;

// Mapping of speaker name to seconds spoken
export type SpeakerDurations = Record<Name, Duration>;

export interface Session {
	// IndexedDB id (autoincremented)
	id: number;
	// Date the session started
	date: SessionDate;
	// Length of yap sesh in seconds
	totalDuration: Duration;
	// All conversation participants (identical to keys of `speakerDurations`, useful for indexed search)
	interlocutors: Name[];
	// Since people can speak simultaneously, this can be greater than `duration`
	speakerDurations: SpeakerDurations;
}

const interlocutorsKey = 'interlocutors';

export const db = new Dexie('ConvoSplitDatabase') as Dexie & {
	sessions: EntityTable<
		Session,
		'id' // primary key "id" (for the typings only)
	>;
};

// Schema declaration:
db.version(1).stores({
	sessions: '++id, date, totalDuration, *interlocutors'
});

export function getPeople(): SpeakerDurations {
	return JSON.parse(localStorage.getItem(interlocutorsKey) ?? '{}');
}

type InsertSession = InsertType<Session, 'id'>;
export function save(people: SpeakerDurations): Promise<void>;
/** Saves or updates a session. If `id` unset, will create new entry then set it */
export function save(session: InsertSession): Promise<void>;
export async function save(thing: SpeakerDurations | InsertSession) {
	if ('interlocutors' in thing) {
		const id = await db.sessions.put(thing as InsertType<Session, 'id'>);
		thing.id = id;
	} else {
		localStorage.setItem(interlocutorsKey, JSON.stringify(thing));
	}
}

export const allSessions = readable<Session[]>([], (_set, update) => {
	db.sessions.each((session) => update((old) => [...old, session]));
});

export function getSessionsWith(person: Name) {
	return db.sessions.where('interlocutors').equals(person).toArray();
}

/** Gets session with specified date. If nonexistant, returns blank session */
export async function getDatedSession(date: SessionDate) {
	return (
		(await db.sessions.get({ date })) ??
		({
			interlocutors: [] as Name[],
			date: date,
			totalDuration: 0,
			speakerDurations: {} as SpeakerDurations
		} satisfies InsertSession)
	);
}
