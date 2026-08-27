# House Machine

Fem housetrummönster på ett spelbart 16-stegs rutnät med Web Audio, spelbara
genom fyra olika kit. Samma
motor och formspråk som One Drop Machine, men med en annan palett (betonggrå
med 909-orange) och ett house-kit i stället för reggae.

Publicerad på `/demos/house-machine/`.

## Källan

Studio Brootles artikel [House Drum Patterns](https://www.studiobrootle.com/house-drum-patterns/):
fem mönster byggda i Ableton Live med de medföljande Core-kiten, alla i 126 BPM.
Artikeln delar ut MIDI-klippen fritt ("download the midi files… edit them,
change them"), så stegen här är **inte** avlästa från skärmdumpar utan parsade
direkt ur `.mid`-filerna med ett litet Python-skript (PPQ 96, en 16-del = 24
ticks, velocity < 50 = ghost-slag).

| # | Mönster | Kit | Takter | Swing |
|---|---|---|---|---|
| 1 | Simple 707 | 707 Core | 1 | 25 |
| 2 | Swung 909 | 909 Core | 1 | 25 |
| 3 | Weird Punchy Banger | Ichor | 1 | 0 |
| 4 | Jazz Sampled | Battu (live-samplat) | 2 | 25 |
| 5 | 606 Core Trax | 606 Core | 1 | 0 |

"Swing 25" motsvarar artikelns *MPC 16 Swing-75 @ 25 %*: varannan 16-del
fördröjs med 12,5 % av en 16-del. Sidans swing-ratt gör exakt det.

## Notnummer

Klippen är skrivna för Abletons drum racks, där pad C1 = not 36 och padsen
klättrar kromatiskt. Sidan visar de nummer som faktiskt ligger i filerna med
närmaste GM-namn: 36 kick, 40 snare, 39 clap, 37 rim, 42 closed hat, 44 pedal
hat, 46 open hat, 41 low tom, 45 mid tom, 48/50 hi tom, 51 ride. På en maskin
med ett spår per röst spelar numret ingen roll — det är stegpositionerna som
överförs.

## Skillnader mot One Drop Machine

- **Variabel längd.** Jazz-mönstret är två takter; rutnätet byggs om till 32
  kolumner med en tjockare avdelare vid takt 2. Rutnätet scrollar i sidled på
  smala skärmar, sidan gör det inte.
- **Drive**-fader i stället för tape echo: en WaveShaper-softclip (parallell,
  pre-gain 2,6 ×, kurva k = 6) på mastern, som ersättning för Overdrive/Drum
  Buss som artikeln lägger på 909:an, den konstiga och 606:an.
- **Kit-väljare** — se nedan.
- **Gain per rad.** Varje röst går genom en egen GainNode-buss innan mastern;
  faderen (0–150 %) sitter i radetiketten bredvid namnet. Reset nollställer
  fadrarna till 100, Drive till 0 och mönstret till originalet.
- **Elva röster** i stället för åtta: två hi-hat-rader (closed + pedal) plus
  tre tomar, för att klippen använder dem.

## Kit

Fyra kit, valda i konsolen. Varje röst är en liten parametrisk synt och ett kit
är bara en parametertabell (`KITS` i skriptet), så att lägga till ett femte är
ett tiotal rader.

| Kit | Karaktär |
|---|---|
| 707 | PCM-samplat 1985: kort, krispigt, lite lo-fi. Brushattar, snabb kick. |
| 808 | Analogt 1980: lång bumlig kick (110 → 46 Hz, 0,75 s), tonal snare, metalliska hattar, lång cymbal. |
| 909 | Analog kick/snare + samplade cymbaler: housekitet. Standard. |
| Simmons | SDS-V 1981, överraskningen: pitch-svepta "pyoow"-tomar (2,6 × ner till 0,55 ×), bruslastad snare med filtersvep, triangelkick med hårt klick. |

**Drive** är en fader (0–100 %, standard 0) som blandar in en parallell
softclip på mastern.

## Ljud

Allt syntetiserat: 909-artad kick (sinus 170 → 48 Hz + brusklick), snare
(bandpassat brus + två triangeltoner), clap (fyra brusbursts 11 ms isär),
rim, hattar (sex fyrkantsvågor + brus genom highpass, 808-metoden), tomar
(sinus-drops i tre tonhöjder) och en ride (oharmonisk stack, 1 s).

Sekvenseraren är samma lookahead-schemaläggare som i One Drop Machine.

## Verifiering

Renderad headless i Chromium (Playwrights cachade `chrome-headless-shell`)
från `file://` utan konsolfel; `screenshot.png` är den renderingen i 1600×900.
Typsnitten (Anton, IBM Plex Sans, IBM Plex Mono) ligger som base64 i toppen av
`<style>`, kopierade från One Drop Machine.
