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
   Kod som flera demos delar ligger i `static/demos/_lib/` och laddas med en vanlig
   `<script src="../_lib/…">`:

   - `drum-kits.js` – de fyra trummaskinerna (707, 808, 909, LinnDrum) som
     Instant Haus Web och OP-XY Song Loader spelar med.
   - `riddims.js` + `riddims/` – åtta reggaeriddims i c-moll som MIDI-filer,
     registrerade på `window.MidiLibraries`. En sida som vill erbjuda dem
     bygger en väljare av den arrayen och hämtar vald fil med `fetch`.
     Fler bibliotek läggs till genom att pusha på samma array.

   Mappar med `_` först är inte demos och registreras inte.
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

## Publicera (FTP)

```sh
cp .env.deploy.example .env.deploy   # fyll i host/user/pass/dir – filen är gitignorad
brew install lftp
npm run deploy:dry                   # visar vad som skulle laddas upp/raderas
npm run deploy                       # bygger och speglar build/ till servern
```

`scripts/deploy.sh` använder `lftp mirror --reverse --delete`, dvs. servern blir en exakt kopia av `build/` inom `FTP_DIR`.
