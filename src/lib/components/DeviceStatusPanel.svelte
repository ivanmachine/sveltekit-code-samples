<script lang="ts">
  import type { DeviceStatus } from "$lib/domain/deviceStatus";

  export let status: DeviceStatus;

  const panelClass = "rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200";
  const titleClass = "text-lg font-semibold leading-tight text-slate-900";
  const mutedClass = "text-sm text-slate-600";

  const badgeBase =
    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset";

  const severityStyles: Record<
    DeviceStatus["severity"],
    { label: string; className: string }
  > = {
    ok: {
      label: "OK",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
    warning: {
      label: "Warning",
      className: "bg-amber-50 text-amber-800 ring-amber-200",
    },
    error: {
      label: "Error",
      className: "bg-rose-50 text-rose-700 ring-rose-200",
    },
    offline: {
      label: "Offline",
      className: "bg-slate-100 text-slate-700 ring-slate-200",
    },
  };

  const metricCardClass = "rounded-lg bg-white p-3 ring-1 ring-slate-200";

  function formatRelative(msAgo: number | null): string {
    if (msAgo === null) return "—";

    const seconds = Math.floor(msAgo / 1000);
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function formatNumber(value: number): string {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  type MetricItem = {
    label: string;
    value: number | null;
    unit: string;
  };

  $: metrics = [
    { label: "Voltage", value: status.metrics.voltageV, unit: "V" },
    { label: "Current", value: status.metrics.currentA, unit: "A" },
    { label: "Power", value: status.metrics.powerW, unit: "W" },
    { label: "Temp", value: status.metrics.temperatureC, unit: "°C" },
  ].filter((m): m is MetricItem & { value: number } => m.value !== null);
</script>

<section class={panelClass} aria-label="Device status panel">
  <div class="flex items-start justify-between gap-4">
    <div class="min-w-0">
      <p class={titleClass}>{status.name ?? "Unnamed device"}</p>
      <p class={`${mutedClass} mt-1`}>
        ID <span class="font-mono text-slate-700">{status.id}</span>
      </p>
    </div>

    <span class={`${badgeBase} ${severityStyles[status.severity].className}`}>
      {severityStyles[status.severity].label}
    </span>
  </div>

  <div class="mt-4 grid gap-3 sm:grid-cols-2">
    {#if metrics.length === 0}
      <p class={mutedClass}>No metrics available.</p>
    {:else}
      {#each metrics as m (m.label)}
        <div class={metricCardClass}>
          <p class="text-xs font-medium text-slate-500">{m.label}</p>
          <p class="mt-1 text-lg font-semibold text-slate-900">
            {formatNumber(m.value)}
            <span class="ml-1 text-sm font-medium text-slate-500">{m.unit}</span
            >
          </p>
        </div>
      {/each}
    {/if}
  </div>

  <div class="mt-4 flex items-center justify-between gap-3">
    <p class={mutedClass}>Last seen</p>
    <p class="text-sm font-medium text-slate-900">
      {formatRelative(status.lastSeenMsAgo)}
    </p>
  </div>
</section>
