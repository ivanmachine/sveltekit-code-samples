## sveltekit-code-samples

Tiny, curated SvelteKit repo meant to be reviewable in 3–5 minutes.

- **TypeScript domain module**: `src/lib/domain/deviceStatus.ts`
- **Svelte + Tailwind component**: `src/lib/components/DeviceStatusPanel.svelte`

### Local development (Yarn)

```bash
yarn
yarn dev
```

### Tests

```bash
yarn test
```

### Docker

```bash
docker build -t sveltekit-code-samples .
docker run --rm -p 4180:3000 sveltekit-code-samples
```

