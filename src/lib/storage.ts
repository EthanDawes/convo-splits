// Mapping of speaker name to seconds spoken
export type Interlocutors = Record<string, number>;

export interface Session {
	// ISO datetime string
	date: string,
	// Length of yap sesh in seconds
	duration: number,
	// Since people can speak simultaneously, this can be greater than `duration`
	interlocutors: Interlocutors,
}

const interlocutorsKey = "interlocutors";
const sessionsKey = "sessions"

export function getPeople(): Interlocutors {
	return JSON.parse(localStorage.getItem(interlocutorsKey) ?? "{}");
}

export function save(people: Interlocutors): void;
export function save(session: Session): void;
export function save(thing: Interlocutors | Session) {
	if ("interlocutors" in thing) {
		const sessions = getAllSessions();
		sessions.push(thing as Session);
		localStorage.setItem(sessionsKey, JSON.stringify(sessions));
	} else {
		localStorage.setItem(interlocutorsKey, JSON.stringify(thing));
	}
}

export function getAllSessions(): Session[] {
	return JSON.parse(localStorage.getItem(sessionsKey) ?? "[]");
}

export function getSessionsWith(person: string) {
	return getAllSessions().filter(session => person in session.interlocutors);
}
