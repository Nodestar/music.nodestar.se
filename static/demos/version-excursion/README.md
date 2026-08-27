# Version Excursion

Ett dubmixerbord, inte ett stegrutnät. Riddimen är redan programmerad — versionen
gör du vid bordet, genom att mut:a saker.

Publicerad på `/demos/version-excursion/`.

## Källan

Hela sidan är byggd ur Messian Dreads *Making Dub With Computers* på
[dubroom.org](https://www.dubroom.org/studio/tutorials-computerdub.htm) — en
tutorial i 37 kapitel från slutet av 90-talet. Kapitlen lästes ett och ett; det
som står i **text** gick att implementera, det som bara finns i **skärmdumpar**
gick inte (se längst ned).

Tutorialens egen tes styrde formen: riddimen programmeras **en gång**, sedan görs
versionen vid mixerbordet. Därför blev det här ett bord och inget rutnät.

## Vad som finns

- **Sex riddims** ur kapitel 5 och 15: Steppers, One Drop, Two Drop, Half Drop,
  Rub a Dub och en nyabinghi-grundad rytm
- **Tre trumkit**: Acoustic, Digital, Tape
- **Percussion** ur kapitel 21: kete, shaker, träblock, cowbell, tamburin, plus
  bjällror och vibraslap som engångsknappar
- **Fem fills** ur kapitel 18, som avfyras på nästa takt
- **Fem sätt att starta en dub** ur kapitel 31, som spelar sina egna mut-sekvenser
- **Nio kanaler**: fem instrument, fyra effektreturer (kapitel 24–26)

Riddim i a-moll → e-moll, två takter var (i grundtonarten). 140 BPM som standard, 110–190 möjligt.

- **Tonart**: väljaren *Key* transponerar bas, skank, orgel, horn och gitarr/clav
  till valfri molltonart (E–E♭). Trummorna påverkas inte.
- **Show**: knapparna *Bass*, *Skank*, *Horns* och *Gtr* lägger till respektive
  stämma som rad i mönstervyn under trummönstret, med ackordnamn per takt och
  tonnamn vid hover.
- Basen är en ren sinus med lite triangel, utan suboktav och resonant filter.

## Styrning

- `mellanslag` startar och stoppar
- `1`–`5` mut:ar kanalerna
- Varje kanal har rattarna **Echo**, **Verb** och **Space** (sänd till delay,
  reverb 1 respektive space echo). **All → Space** kastar in allt i space-ekot
  oavsett rattarna, som i kapitel 31.
- Fader 11 **är** ekot — delayn har noll feedback internt, repetitionerna kommer
  av att returen loopas tillbaka in. Drar du upp den för långt fastnar den,
  precis som ett riktigt bord.

## Vad som kommer varifrån

| Kapitel | Vad som implementerades |
|---|---|
| 4 | 140 BPM som standard, 110–190 som område. Han argumenterar uttryckligen mot att halvera till 70: "du överbelamrar sequencerns piano roll och tappar all överblick". |
| 5 | Fyra rytmer med **hans** taxonomi: steppers, one drop, **two drop**, **half drop**. Half drop = two drop utan bastrumman på trean. |
| 6 | Straight/swing-växeln. Han definierar swing som takten delad i 12 istället för 16. |
| 7–8 | Nyabinghi, med hans egen brasklapp: "It's very difficult, IF NOT IMPOSSIBLE, to program the Nyabingy Rhythm". Mönstret är märkt som "grundad på rytmen", inte som rytmen. |
| 15 | Rub a Dub-rutnätet, not för not. Andra hi-haten i varje par sänks i velocity, den sista öppnas. |
| 16 | Ackorden: "The A chord contains the A-C-E tones" och "the other chord the E-G-B tones" → Am och Em. Basregeln: på andra och fjärde slaget, använd en ton som finns i ackordet. E binder ihop dem. |
| 18 | Fem fills med hans taktnummer: roll (8), crash & cut (40), snare to 4 (64), hats out (79–80), crash (113). Plus hans regler: max fem breaks, aldrig samma crash två gånger, hi-haten får aldrig löpa genom ett break. |
| 19 | Skanken på **andra och fjärde slaget** — och orgelbubblan. |
| 20 | Blåsets säkerhetsregel: samma ackord på 2 och 4 som skanken. |
| 21 | Percussion: kete på 16-delar över två takter, ett fyra takter långt shaker/träblock/cowbell-mönster, träblocket "på två ställen i en takt, upprepat varannan takt". Tamburinen är inte utskriven någonstans, för han skriver inte ut den — han säger att den finns för att "enhance the Hi Hat pattern", så den härleds från hi-hat-raden. |
| 24–26 | Kanalindelningen och effektroutingen. |
| 31 | De fem sätten att starta en dub, A–E. |

## Två saker jag först gjorde fel

**Skanken låg på fel ställe.** Jag byggde den först på varje offbeat. Kapitel 19
säger uttryckligen "hitting a chord on every 2nd and 4th count of a bar/measure".
Vid 140 BPM *är* hans version den offbeat man hör — det ser bara fel ut nedskrivet.
Det hänger ihop med hans BPM-argument i kapitel 4.

**Ackordföljden var Am → G.** Den ska vara Am → Em, "2 by 2".

## Orgelbubblan

Det bästa i hela tutorialen, och en exakt uppskrift (kapitel 19):

1. ackord på slag 2 och 4
2. kopiera dem en åttondel **före**, och **transponera de kopiorna en oktav ned**
3. kopiera dem också en åttondel **efter**
4. sänk velocity på vänsterhanden

Resultatet är ett kluster kring vardera 2 och 4 med förslaget en oktav under.
Ligger på kanal 3 tillsammans med pianot.

## Effektkedjan

Hans princip: effekter är **kanaler**, inte returer. "Bypass the whole return
options. Rather treat the effect devices as instruments by giving them their own
input channel."

| Aux | Enhet | Retur | Detalj |
|---|---|---|---|
| 1 (post) | Delay → EQ | kanal 11 | **Feedback noll i enheten.** Repetitionerna kommer av att returen loopas tillbaka in — därför *är* fader 11 ekot. Delaytiden är **1/3 takt**, hans enda kvantitativa siffra i hela serien. |
| 2 (post) | Reverb 1, lång | kanal 12 | Mest på skanks och virvel. |
| 3 (post) | Space Echo | kanal 13 | Delay + reverb + EQ i en enhet. Vajande delaytid via LFO. |
| 4 (**pre**) | Reverb 2, kort | kanal 14 | Pre-fader, så att en kanal kan dras till noll och bara höras vått. |

I koden: `ConvolverNode` med genererade brusimpulser för reverben, `DelayNode` +
`BiquadFilter` för ekona, `DynamicsCompressor` som limiter sist. Delayns
återkopplingsgrind är hårt klampad (max 0,82) så bordet inte skenar.

## Trumkiten

Tre kit, som parameteruppsättningar snarare än samplingar. Alla trumröster går
genom en gemensam buss med `WaveShaper` + lågpass, och kitbytet ställer om både
bussen och varje rösts frekvenser och avklingningstider.

| Kit | Karaktär |
|---|---|
| Acoustic | Spelat kit, GM-uppsättningen tutorialen förutsätter på kanal 10 |
| Digital | Kort, stämt och tunt — dancehallboxen som kom med Sleng Teng |
| Tape | Mörkare, rundare, mättat: waveshaper på 0,55 och lågpass vid 6,8 kHz |

## Så byggdes filen

Sidan författades först som en Claude-artefakt (HTML utan `<html>`/`<head>`, som
artefaktvärden själv wrappar) och konverterades sedan till en fristående sida:

1. **Wrappad** i ett riktigt dokument med `<!doctype html>`, `lang`, `charset`,
   viewport, `description`, Open Graph och `theme-color` för båda temana.
2. **Typsnitten inbakade.** Google Fonts-länken byttes mot `@font-face` med woff2
   i base64, hämtade från `@fontsource`-paketen på npm (latin-subset, bara de
   vikter sidan använder). Gör sidan oberoende av externa värdar — och slipper
   GDPR-frågan om att besökarnas IP-adresser går till Google.
3. **Temaväxlare tillagd**, som cyklar System → Light → Dark och sparar valet i
   `localStorage` (nyckel `vx-theme`). CSS:en var redan skriven för alla tre
   lägena, så växlaren krävde inga stiländringar.
4. **Tillbakalänk** till `/`.

Skärmdumpen `screenshot.png` är en riktig rendering av sidan i 1600×900.

### Verifiering

Renderad headless i Chromium **med nätverket avstängt** och kontrollerad på:

- noll requests utanför `file://` och `data:`
- noll konsolfel och pageerrors
- att alla `@font-face` får status `loaded`
- klick genom alla sex riddims, tre kit, fem fills, fem intron, percussion,
  engångsknappar och temaväxlaren
- att `scrollWidth` inte överstiger `clientWidth` i både 1200 px och 390 px bredd

## Publicering

En enda fil, inga beroenden.

    static/demos/version-excursion/index.html  →  /demos/version-excursion/

~264 KB, mest typsnitt; gzippad runt 120 KB. `index.html` är självförsörjande och
går att redigera direkt.

## Webbläsarstöd

Web Audio API, inklusive `ConvolverNode` (reverben) och `WaveShaperNode`
(bandmättnaden i Tape-kitet). Chrome, Safari 16.4+, Firefox, Edge.

## Vad som inte gick att hämta

Verktyget för att hämta webbsidor vägrar bildinnehåll. Följande finns bara i
tutorialens skärmdumpar och kunde alltså inte återskapas:

- `computerdub0028.jpg` / `0030.jpg` — de exakta kete- och shakerrutnäten
  (percussionen följer hans beskrivna principer istället)
- `computerdub0010/0013/0014/0015.jpg` — innehållet i hans breaks
- kapitel 8:s nyabinghirutnät
- kapitel 20:s trombonmelodi

En sak till, värd att veta: **kapitel 15 motsäger sig själv.** Det utskrivna
rutnätet visar en bastrumma på trean, brödtexten bredvid nämner den inte. Sidan
följer rutnätet.

## Kit trim

Under bordet finns en trim-panel med en gain-fader (0–150 %) per trumröst — kick,
snare, rim, hattar, tom, kete, funde, kete 2, shaker, wood, cowbell, tamb. Varje
röst har en egen GainNode som matar drum-bussen **före** kitets waveshaper och
lågpass, så trimmen påverkar hur hårt Tape-kitet drivs; kanal 1:s fader och
sändningar ligger efter som förut.
