import { UserResponse, User } from '../../types';

/**
 * A tiny module-level store that mirrors the live Firestore-backed `responses`
 * and `users` arrays from AppContext, so non-React modules (like the article
 * generator and routing utilities in `src/utils/routes.ts`) can read the
 * latest real data synchronously without needing every function signature
 * to thread `responses`/`users` through as parameters.
 *
 * AppContext calls `setLiveResponseData(...)` whenever its Firestore
 * subscription delivers new responses/users. Until the first real snapshot
 * arrives, both arrays are empty, and `getRealBrandStats` (in
 * realBrandStats.ts) correctly reports "insufficient data" rather than
 * guessing.
 */

let liveResponses: UserResponse[] = [];
let liveUsers: User[] = [];
let hasReceivedFirstSnapshot = false;

export function setLiveResponseData(responses: UserResponse[], users: User[]): void {
  liveResponses = responses;
  liveUsers = users;
  hasReceivedFirstSnapshot = true;
}

export function getLiveResponses(): UserResponse[] {
  return liveResponses;
}

export function getLiveUsers(): User[] {
  return liveUsers;
}

/** True once at least one real Firestore snapshot has been applied. */
export function hasLiveData(): boolean {
  return hasReceivedFirstSnapshot;
}
