# One Drop Machine

Interaktiv referens över åtta grundläggande reggaetrummönster på ett 16-stegs
MIDI-rutnät. Varje mönster spelas upp med Web Audio, går att redigera i rutnätet,
och kommer med MIDI-notnummer, tempoområde, trummis och en skiva att lyssna på.

Publicerad på `/demos/one-drop-machine/`.

## Mönster

| # | Mönster | BPM | Swing |
|---|---|---|---|
| 1 | One Drop | 78 | 18% |
| 2 | Rockers | 74 | 10% |
| 3 | Steppers | 82 | 0% |
| 4 | Flying Cymbal | 80 | 12% |
| 5 | Rub-a-Dub | 66 | 22% |
| 6 | Nyabinghi | 70 | 26% |
| 7 | Ska Shuffle | 142 | 55% |
| 8 | Dub × 2-Step | 132 | 26% |

Nr 8 är en hybrid jag konstruerade för DKG-projektet (132 BPM, c-moll) — den är
**märkt som konstruerad** i gränssnittet så den inte hamnar bland de historiska.

## Research först, kod sen

Mönstren är inte gissade. Ordningen var sök → verifiera → bygg.

- **One drop**: bastrumma och virvel tillsammans på tredje slaget, etta lämnad
  tom, virveln oftast som cross-stick. Carlton Barrett (Bob Marley & The Wailers)
  tillskrivs den, men upphovet är omtvistat och tillskrivs även Aston Barrett och
  Winston Grennan.
- **Rockers**: "one drop med en stadig bastrumma på varje fjärdedel" (Sly Dunbar).
  16-delspushen in i trean är det som skiljer den från fyra-på-golvet.
  Definitionerna varierar mellan källor — det står i sidans egen text.
- **Steppers**: jämn bastrumma. Wikipedia säger på varje **åttondel**, de flesta
  trummisar säger fjärdedel. Sidan bygger fjärdedelsversionen och nämner den andra.
- **Flying cymbal**: Sly Dunbars öppna/stängda hi-hat, Cornell Campbells
  "Queen of the Minstrel" (1975).
- **Rub-a-dub**, **nyabinghi**, **ska** — samma metod.

En sak sökningen fångade som annars blivit pinsam: **Sly Dunbar dog 26 januari
2026, 73 år gammal.** Sidan skriver om honom i dåtid av det skälet.

Källor: Wikipedias *One drop rhythm*, Red Bull Music Academys genomgång av
flying cymbal, Soundbrenner om rockers, och dödsrunorna i Jamaica Observer och
Rolling Stone.

## Designval

- **Palett**: blek salviegrå / mörk olivsvart med mässing som accent. Varje
  trumröst har egen färg — informationsdesign, inte dekor: man ska kunna läsa
  vilken röst som ligger var utan att läsa etiketterna.
- **Typsnitt**: Anton (kondenserad affischgrotesk, rubriker) + IBM Plex Sans
  (brödtext) + IBM Plex Mono (rutnätsetiketter och siffror). Affisch möter
  studiomanual.
- **Droppmarkören**: en mässingsfärgad ▼ över den takt som bär mönstrets tyngd,
  plus en rad text under rutnätet som pekar ut den. Den flyttar sig med mönstret
  och försvinner för ska och 2-step, där ingen droppe finns.
- **Tape echo**: punkterad åttondels feedback-delay på virvel, cross-stick och
  skank, som en fader 0–100 % (standard 0). Reset nollar den. En enda
  utsvävning, resten hålls tyst.

## Skankljud

Väljare i konsolen: **Gitarr** (standard — fyra avstämda sågtänder genom
bandpass, snabbt anslag), **Piano** (triangel + oktavpartial, lågpass som
stänger, längre klang), **Orgel** (sinus med 2:a/3:e drawbar, platt envelope)
och **Clav** (smal puls genom highpass, torr och perkussiv). Samma Cm-chop på
samma steg — bara klangen byts.

## Gain per rad

Varje röst går genom en egen GainNode-buss före mastern; fadern (0–150 %)
sitter i radetiketten bredvid namnet, namnet mutar. Reset återställer fadrarna
till 100 tillsammans med mönstret.

## Ljudarkitektur

Allt syntetiserat, inga samplingar:

| Röst | Metod |
|---|---|
| Kick | sinus 132 → 44 Hz på 0,1 s, exponentiell amplitudkurva |
| Snare | brus genom bandpass 1850 Hz + triangelvåg 186 Hz |
| Cross-stick | triangel 540 → 300 Hz + kort brusburst i bandpass 2600 Hz |
| Hi-hat | brus i highpass 8,2 kHz, 45 ms |
| Ride bell | sex fyrkantsvågor i oharmoniska förhållanden genom highpass — 808-metoden |
| Skank | fyra sågtandsvågor (Cm) genom bandpass, snabbt anslag |

Sekvenseringen är en lookahead-schemaläggare: `setInterval` var 25 ms som
schemalägger 120 ms framåt på `AudioContext`-klockan, med en separat
`requestAnimationFrame`-loop som ritar spelhuvudet från en kö. Enda sättet att få
stabil timing i webbläsare — `setTimeout` ensamt driver.

Swing är tidsförskjutning: åttondelsoffbeats skjuts `swing × 16-delslängd`
senare, 16-delar hälften så mycket. 67 % är full triolkänsla.

## Så byggdes filen

Sidan författades först som en Claude-artefakt (HTML utan `<html>`/`<head>`, som
artefaktvärden själv wrappar) och konverterades sedan till en fristående sida:

1. **Wrappad** i ett riktigt dokument med `<!doctype html>`, `lang`, `charset`,
   viewport, `description`, Open Graph och `theme-color` för båda temana.
2. **Typsnitten inbakade.** Google Fonts-länken byttes mot `@font-face` med woff2
   i base64, hämtade från `@fontsource`-paketen på npm (latin-subset, bara de
   vikter sidan använder). Gör sidan oberoende av externa värdar — och slipper
   GDPR-frågan om att besökarnas IP-adresser går till Google.
3. **Temaväxlare tillagd.** Artefaktvärden stämplar `data-theme` på `<html>`; på
   egen domän finns ingen sådan värd, så sidan fick en egen knapp som cyklar
   System → Light → Dark och sparar valet i `localStorage` (nyckel `odm-theme`).
   CSS:en var redan skriven för alla tre lägena, så växlaren krävde inga
   stiländringar.
4. **Tillbakalänk** till `/`.

Skärmdumpen `screenshot.png` är en riktig rendering av sidan i 1600×900, inte en
mockup.

### Verifiering

Renderad headless i Chromium **med nätverket avstängt** och kontrollerad på:

- noll requests utanför `file://` och `data:`
- noll konsolfel och pageerrors
- att alla `@font-face` får status `loaded`
- klick genom alla åtta mönster, uppspelning, cellredigering, radmutning, echo
- att `scrollWidth` inte överstiger `clientWidth` i både 1200 px och 390 px bredd

## Publicering

En enda fil. Inga byggsteg, inga beroenden, ingen serverkod.

    static/demos/one-drop-machine/index.html  →  /demos/one-drop-machine/

Fungerar lika bra från `file://` som från webbserver. ~197 KB, mest typsnitt;
med gzip eller brotli landar den runt 90 KB.

Vill du ändra något är `index.html` självförsörjande och går att redigera direkt —
typsnitten ligger som base64 i toppen av `<style>` och kan lämnas ifred.

## Webbläsarstöd

Web Audio API och `color-mix()` i CSS. Chrome, Safari 16.4+, Firefox, Edge.
Ljudet startar först vid klick — webbläsare tillåter inte annat.

## Relaterat

Samma mönsterdata finns som MIDI-filer för OP-XY:n (paketet `reggae-riddims-xy`,
levererat separat, inte i det här repot).
