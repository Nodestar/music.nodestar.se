# music.nodestar.se

Statisk onepager (SvelteKit + Tailwind + shadcn-svelte) som listar musikvisualiseringsdemos i ett grid.

## Utveckla

```sh
npm install
npm run dev
```

## Bygga (statiskt, kräver inte Node på servern)

```sh
npm run build
```

Resultatet hamnar i `build/` – ren HTML/CSS/JS. Kopiera mappen till valfri webbserver (nginx, Apache, S3 …).

## Lägga till en demo

1. Lägg demon som fristående statiska filer i `static/demos/<slug>/` (med en `index.html`).
2. Lägg en skärmdump i `static/demos/<slug>/screenshot.png` (16:9, t.ex. 1600×900).
3. Registrera demon i `src/lib/demos.ts`:

```ts
{
  slug: 'my-demo',
  title: 'Min demo',
  description: 'Kort beskrivning.',
  tags: ['webaudio', 'canvas'],
  date: '2026-08-27'
}
```

`href` och `image` kan sättas explicit om demon ligger någon annanstans.

Allt under `static/` kopieras oförändrat till `build/`, så demos kan byggas helt separat (t.ex. i en annan Claude-instans) utan att röra SvelteKit-koden.
