# Instant Haus

Webbversion av Alexkids Max for Live-enhet *Instant Haus* (2011): fyra spår,
två banker, 96 fasta 16-stegsmönster, per spår swing, shift och
velocity-intervall. Samma motor och formspråk som House Machine och One Drop
Machine, plus fyra kit och MIDI-ut.

Publicerad på `/demos/instant-haus/`.

## Källan

`Instant Haus.amxd` ur **Max for Live Essentials** (följer med Live). Enheten är
en ren MIDI-effekt: den lyssnar på Lives transport och skickar noter till ett
drum rack. Ingen sequencer att rita i — varje spår har en enda **Pattern**-ratt
som byter mellan ett dussin färdiga figurer.

Mönstren är **inte** avlästa från skärmdumpar. En `.amxd` är ett litet binärt
huvud (`ampf` / `meta` / `ptch`) följt av Max-patchen som JSON. Från offset 48
går JSON:en att parsa rakt av. Mönsterbankerna ligger som `matrixctrl`-meddelanden
— trippletter `kolumn rad värde` — bakom ett `select`-objekt, en `message`-box per
rattposition, var och en föregången av `clear` via ett `t b b`. Att följa
patchkablarna ger alla 96 rutnät, notdefaults och parameterintervall exakt.

| Spår | Mönster/bank | Rader i matrisen | Röster |
|---|---|---|---|
| Kick | 12 | 2 (accent / ghost) | 1 |
| Snare | 12 | 2 | 1 |
| HiHats | 24 | 4 (CH accent/ghost, OH accent/ghost) | 2 |
| Perc | 12 | 2 | 1 |

Mönster **0** är tomt på alla spår — därför startar Perc där, precis som i
originalet.

## Parametrar (originalets värden)

| Parameter | Intervall | Default |
|---|---|---|
| Pattern | 0–11 (hihats 0–23) | 1, 1, 1, 0 |
| Note | 0–127 | 36 / 38 / 42 / 46 / 50 |
| Vel Hi | 0–127 | 100 |
| Vel Lo | 0–127 | 20 |
| Swing | 50–100 % | 50 |
| Shift | 0–25 ms | 0 |

Randomize-knapparna använder enhetens egna intervall, lästa ur
`p randomvel`, `p randomshift`, `p randomswing` och `p midi_pattern_selec`:

- **Patt** — `random 12` per spår, `random 24` för hihats
- **Swing** — `random 50 + 50`, alltså 50–99, på alla fyra
- **Shift** — `random 26` på snare, hihats och perc; **kicken lämnas i fred**
- **Vel** — kick/snare/perc: Hi = `random 27 + 100`, Lo = `random 100`.
  CH och OH: `random 127` på både Hi och Lo — därför blir hattarna vildare
- **Init** — tillbaka till `parameter_initial`-värdena ovan

## Swing och shift i rutnätet

Rutnätet är inte kvantiserat i visningen. Facket ligger kvar där 16-delen är,
men **blocket inuti glider åt höger** med spårets shift plus, på udda steg,
swing. Ett tunt streck i spårets färg markerar var noten skulle ha legat rakt,
och ett block som knuffas tillräckligt långt lägger sig delvis över grannen —
vilket är precis vad som händer i tiden.

```
noten i facket = shift_ms + (steg udda ? (swing/100 − 0.5) × 2 × 16-delens längd : 0)
```

Vid 124 BPM är en 16-del 121 ms, så:

| Swing | Förskjutning på udda steg |
|---|---|
| 50 % | 0 ms — rakt |
| 58 % | 19 ms |
| 66 % | 39 ms — triolshuffle |
| 75 % | 60 ms — halvvägs till nästa 16-del |
| 100 % | 121 ms — ovanpå nästa steg |

Det viktiga, och det som inte syns i Abletons panel: **swing rör bara udda
16-delar** — `e` och `a`. Ett mönster som ligger på `&`, som den vanliga
offbeat-hattlinjen (steg 2, 6, 10, 14) eller perc-mönster 3, står stilla hur
långt ratten än vrids. Sätt Perc till swing 80 % och ingenting händer; sätt
HiHats till mönster 17, som är en 16-delslinje, och varannan not glider.
Shift däremot flyttar allt i spåret.

Raden under rutnätet skriver ut resultatet i millisekunder vid aktuellt tempo.
`updateOffsets()` använder exakt samma aritmetik som `scheduleStep()`, så
rutnätet och ljudet är alltid överens.

## Skillnader mot originalet

- **Ingen Live.** Originalet ärver tempo och transport från värden; sidan har
  egen klocka och tempofader. Originalets swing skalades mot värdtempot på ett
  sätt som lämnade kvar lite shuffle även vid 50 % (`scale 0 127 0 (4000/bpm)`
  i `p swing_engine`). Här är 50 % rakt, 66 % triolshuffle.
- **Ett slag per cell.** Några källmönster sätter både accent- och ghostraden på
  samma steg, vilket i Max ger två noter. Rutnätet har en cell per steg, så de
  kollapsar till en accent.
- **Inget MIDI learn, ingen Assign Rack.** Originalets *MIDI to*-meny och
  *Rack*-knapp mappar inkommande noter till egna parametrar respektive till ett
  drum racks pads. Ingendera har något att peka på i en webbläsare.
- **Ljud och MIDI-ut** är tillägg. Originalet låter inte alls.

## Kit

Fyra kit, samma `KITS`-tabell som House Machine men trimmad till de fem röster
enheten driver (kick, snare, CH, OH, perc → tom). 707, 808, 909 och Simmons
SDS-V. **Drive** är samma parallella softclip på mastern.

## MIDI-ut

Web MIDI: `Enable` → portväljare → kanal (default 10, GM-trummor). Noterna är
spårets `Note`-fält, velocity är Vel Hi/Lo, note-off 40 ms senare. Tidsstämplar
räknas om från Web Audios `currentTime` till `performance.now()` med en offset
tagen när kontexten skapas, så MIDI och internt ljud ligger i fas.
Chromium-baserade webbläsare bara — Safari och Firefox saknar Web MIDI.

## Licens

Enhetens about-panel: *"This software is distributed under a CC
Attribution-NonCommercial 3.0 license." — Instant Haus, Alexkid 2011.*

[CC BY-NC 3.0](https://creativecommons.org/licenses/by-nc/3.0/) tillåter
uttryckligen adaptationer. Den här sidan är en adaptation och uppfyller de tre
villkoren:

1. **Icke-kommersiellt** — demosajt, ingen försäljning, inga annonser.
2. **Attribution** — titel, upphovsman och licenslänk i sidfoten och i
   Source-blocket på sidan, inte bara här.
3. **Märkt som bearbetning** — sidan säger uttryckligen vad som är Alexkids
   (mönsterdata, notdefaults, parameterintervall) och vad som inte är det
   (gränssnitt, sequencer, syntes).

Inget share-alike i BY-NC 3.0. Abletons UI-grafik och panelformspråk används
inte — CC-noten gäller Alexkids enhet, inte Abletons formgivning.

## Verifiering

Renderad headless i Chromium (Playwright) från `file://` utan konsolfel.
Testkörning med uppspelning igång: alla fem Randomize-knappar, Init, All
On/Off, bankbyte, kitbyte, cellredigering, tempoändring och swing/shift — inga
fel, och förskjutningarna i rutnätet stämmer mot schemaläggarens egen
uträkning. `screenshot.png` är
den renderingen i 1600×900. Typsnitten (Archivo Black, Anton, IBM Plex Sans,
IBM Plex Mono) ligger som base64 i toppen av `<style>`, kopierade från House
Machine.
