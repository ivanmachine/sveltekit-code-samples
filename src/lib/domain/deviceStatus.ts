/**
 * Device status derivation sample.
 *
 * This file demonstrates: defensive input normalization, small pure helpers,
 * strongly typed UI-ready view models, and predictable control flow.
 */
export type DeviceTelemetryRaw = {
	/** Stable device identifier from upstream. */
	id: string;
	/** Human-friendly name (optional / may be missing upstream). */
	name?: string | null;
	/**
	 * Last time the device was seen.
	 * Upstream may send an ISO string, epoch ms, or (rarely) a Date.
	 */
	lastSeenAt?: string | number | Date | null;
	/** Volts. */
	voltageV?: number | string | null;
	/** Amps. */
	currentA?: number | string | null;
	/** Celsius. */
	temperatureC?: number | string | null;
};

export type DeviceStatusSeverity = 'ok' | 'warning' | 'error' | 'offline';

export type DeviceStatus = {
	id: string;
	name: string | null;
	lastSeenAt: Date | null;
	lastSeenMsAgo: number | null;
	severity: DeviceStatusSeverity;
	metrics: {
		voltageV: number | null;
		currentA: number | null;
		powerW: number | null;
		temperatureC: number | null;
	};
};

const OFFLINE_AFTER_MS = 5 * 60_000;

export function deriveDeviceStatus(raw: DeviceTelemetryRaw, now = new Date()): DeviceStatus {
	const name = normalizeName(raw.name);

	const lastSeenAt = normalizeDate(raw.lastSeenAt);
	const lastSeenMsAgo = lastSeenAt ? msSince(lastSeenAt, now) : null;

	const voltageV = normalizeNumber(raw.voltageV, { min: 0, max: 60, decimals: 2 });
	const currentA = normalizeNumber(raw.currentA, { min: 0, max: 200, decimals: 2 });
	const temperatureC = normalizeNumber(raw.temperatureC, { min: -40, max: 125, decimals: 1 });

	const powerW =
		voltageV !== null && currentA !== null ? round(clamp(voltageV * currentA, 0, 12_000), 1) : null;

	const severity = deriveSeverity({
		lastSeenMsAgo,
		voltageV,
		temperatureC
	});

	return {
		id: raw.id,
		name,
		lastSeenAt,
		lastSeenMsAgo,
		severity,
		metrics: {
			voltageV,
			currentA,
			powerW,
			temperatureC
		}
	};
}

function deriveSeverity(input: {
	lastSeenMsAgo: number | null;
	voltageV: number | null;
	temperatureC: number | null;
}): DeviceStatusSeverity {
	// If we can't determine recency, treat it as offline.
	if (input.lastSeenMsAgo === null || input.lastSeenMsAgo > OFFLINE_AFTER_MS) return 'offline';

	if (input.temperatureC !== null && input.temperatureC >= 85) return 'error';
	if (input.voltageV !== null && input.voltageV < 10.5) return 'error';

	if (input.temperatureC !== null && input.temperatureC >= 70) return 'warning';
	if (input.voltageV !== null && input.voltageV < 11.5) return 'warning';

	return 'ok';
}

function normalizeName(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function normalizeDate(value: unknown): Date | null {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
	}

	if (typeof value === 'string' || typeof value === 'number') {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? null : d;
	}

	return null;
}

function normalizeNumber(
	value: unknown,
	opts: { min: number; max: number; decimals: number }
): number | null {
	const n = parseFiniteNumber(value);
	if (n === null) return null;
	return round(clamp(n, opts.min, opts.max), opts.decimals);
}

function parseFiniteNumber(value: unknown): number | null {
	if (isFiniteNumber(value)) return value;
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (trimmed.length === 0) return null;
		const n = Number(trimmed);
		return isFiniteNumber(n) ? n : null;
	}
	return null;
}

export function isFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

export function clamp(value: number, min: number, max: number): number {
	if (min > max) return value;
	return Math.min(max, Math.max(min, value));
}

export function round(value: number, decimals = 0): number {
	const safeDecimals = clamp(decimals, 0, 6);
	const factor = 10 ** safeDecimals;
	return Math.round(value * factor) / factor;
}

export function msSince(date: Date, now: Date): number {
	return Math.max(0, now.getTime() - date.getTime());
}

