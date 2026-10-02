// Web counterpart of UserInfoEntity + MartpRepository.fetchCurrentUserInfo().
// The app keeps the user in Room; here it lives in localStorage.

export interface UserInfo {
	id: string;
	username: string | null;
	email: string | null;
}

const STORAGE_KEY = 'user_info';

function newUser(): UserInfo {
	return { id: crypto.randomUUID(), username: null, email: null };
}

export function fetchCurrentUserInfo(): UserInfo {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) return JSON.parse(stored) as UserInfo;
		const user = newUser();
		localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
		return user;
	} catch {
		// Same fallback as the app: an unsaved, empty user.
		return newUser();
	}
}

// Counterpart of the DAO's `UPDATE user_info SET ... WHERE id = :id`.
function updateUser(id: string, changes: Partial<Omit<UserInfo, 'id'>>) {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return;
		const user = JSON.parse(stored) as UserInfo;
		if (user.id !== id) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...user, ...changes }));
	} catch {
		// Same as the app: a failed save is ignored.
	}
}

export function setUserName(username: string, userId: string) {
	updateUser(userId, { username });
}

export function setUserEmail(email: string, userId: string) {
	updateUser(userId, { email });
}
