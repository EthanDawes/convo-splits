import Dexie, { type EntityTable } from 'dexie';

// Mapping of speaker name to seconds spoken within a session
export type Interlocutors = Record<string, PersonSession>;

export type Session = PersonSession[];

// A person speaking during a session (saved in database)
export interface PersonSession {
	id: number,
	name: string,
	// ISO datetime string, representing a yap sesh
	date: string,
	// Seconds speaking during a session
	duration: number,
}

const interlocutorsKey = "interlocutors";

export const db = new Dexie('ConvoSplitDatabase') as Dexie & {
	personSessions: EntityTable<
		PersonSession,
		'id' // primary key "id" (for the typings only)
	>;
};

// Schema declaration:
db.version(1).stores({
	personSession: '++id, name, date, duration',
});

export function toInterlocutors(session: Session) {
	const interlocutors: Interlocutors = {};
	session.forEach(speaker => interlocutors[speaker.name] = speaker);
	return interlocutors;
}

export function getPeople(): Interlocutors {
	return JSON.parse(localStorage.getItem(interlocutorsKey) ?? "{}");
}

export function save(personSession: PersonSession) {
	db.personSessions.put(personSession);
}

export function getSessionsWith(person: string) {
	return db.personSessions.where("name")
		.equals(person)
		.toArray();
}

/** Gets session with specified date. If nonexistent, returns blank session */
export function getSessionInterlocutors(date: string) {
	return db.personSessions.where("date")
		.equals(date)
		.toArray()
		.then(toInterlocutors)
}
