import { describe, expect, it } from 'vitest';
import { deriveDeviceStatus, type DeviceTelemetryRaw } from './deviceStatus';

describe('deriveDeviceStatus', () => {
	it('returns offline when lastSeenAt is older than threshold', () => {
		const now = new Date('2026-01-01T00:10:00.000Z');
		const raw: DeviceTelemetryRaw = {
			id: 'dev_1',
			lastSeenAt: new Date('2026-01-01T00:00:00.000Z')
		};

		const status = deriveDeviceStatus(raw, now);
		expect(status.severity).toBe('offline');
	});

	it('clamps invalid numbers / handles NaN safely', () => {
		const now = new Date('2026-01-01T00:00:10.000Z');
		const raw: DeviceTelemetryRaw = {
			id: 'dev_2',
			lastSeenAt: now,
			voltageV: -5,
			currentA: 'NaN',
			temperatureC: 999
		};

		const status = deriveDeviceStatus(raw, now);
		expect(status.metrics.voltageV).toBe(0);
		expect(status.metrics.currentA).toBeNull();
		expect(status.metrics.temperatureC).toBe(125);
		expect(status.metrics.powerW).toBeNull();
	});

	it('computes derived powerW when voltage & current exist', () => {
		const now = new Date('2026-01-01T00:00:00.000Z');
		const raw: DeviceTelemetryRaw = {
			id: 'dev_3',
			lastSeenAt: now,
			voltageV: 12,
			currentA: 2
		};

		const status = deriveDeviceStatus(raw, now);
		expect(status.metrics.powerW).toBe(24);
	});

	it('preserves null for missing values (no undefined)', () => {
		const now = new Date('2026-01-01T00:00:00.000Z');
		const raw: DeviceTelemetryRaw = {
			id: 'dev_4',
			lastSeenAt: now,
			voltageV: null,
			currentA: null,
			temperatureC: null,
			name: null
		};

		const status = deriveDeviceStatus(raw, now);

		expect(status.name).toBeNull();
		expect(status.metrics.voltageV).toBeNull();
		expect(status.metrics.currentA).toBeNull();
		expect(status.metrics.powerW).toBeNull();
		expect(status.metrics.temperatureC).toBeNull();

		// Spot-check that we didn't leak undefined anywhere in the output.
		expect(Object.values(status.metrics).some((v) => v === undefined)).toBe(false);
		expect((status as unknown as { name?: unknown }).name).not.toBeUndefined();
	});
});

