<script lang="ts">
  import DeviceStatusPanel from "$lib/components/DeviceStatusPanel.svelte";
  import {
    deriveDeviceStatus,
    type DeviceTelemetryRaw,
  } from "$lib/domain/deviceStatus";

  const sample: DeviceTelemetryRaw = {
    id: "dev_42",
    name: "Office sensor",
    lastSeenAt: new Date(Date.now() - 2 * 60_000),
    voltageV: "12.4",
    currentA: 1.35,
    temperatureC: 38.2,
  };

  const status = deriveDeviceStatus(sample);
</script>

<main class="mx-auto max-w-3xl p-6">
  <h1 class="text-2xl font-semibold text-slate-900">SvelteKit code sample</h1>
  <p class="mt-2 text-sm text-slate-600">
    A tiny domain module that derives a typed view model, plus a presentational
    Svelte + Tailwind component.
  </p>

  <div class="mt-6">
    <DeviceStatusPanel {status} />
  </div>
</main>
