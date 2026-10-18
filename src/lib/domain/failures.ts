import type { Strings } from '#lib/strings.ts';

// Port of core/models/failures. A Failure is an error with a user friendly message,
// so views only show messages coming from this kind of error.
export abstract class Failure extends Error {
	constructor(
		originalExceptionMessage: string | null | undefined,
		readonly messageToBeDisplayedToUserId: keyof Strings
	) {
		super(originalExceptionMessage ?? undefined);
	}
}

export class LocationDisabledFailure extends Failure {
	constructor(originalExceptionMessage?: string | null) {
		super(originalExceptionMessage, 'location_permission_not_granted_failure_error');
	}
}

export class LocationPermissionNotGrantedFailure extends Failure {
	constructor(originalExceptionMessage?: string | null) {
		super(originalExceptionMessage, 'location_permission_not_granted_failure_error');
	}
}

export class MapboxApiErrorFailure extends Failure {
	constructor(originalExceptionMessage?: string | null) {
		super(originalExceptionMessage, 'error_downloading_location_image');
	}
}

export class NoInternetConnectionFailure extends Failure {
	constructor(originalExceptionMessage?: string | null) {
		super(originalExceptionMessage, 'no_internet_connection_failure_message');
	}
}

export class UnknownErrorFailure extends Failure {
	constructor(originalExceptionMessage?: string | null) {
		super(originalExceptionMessage, 'unknown_error_failure');
	}
}
