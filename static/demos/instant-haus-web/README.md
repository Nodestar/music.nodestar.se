# Instant Haus Web

Webbversion av Alexkids Max for Live-enhet *Instant Haus* (2011): fyra spår,
två banker, 96 fasta 16-stegsmönster, per spår swing, shift och
velocity-intervall. Samma motor och formspråk som House Machine och One Drop
Machine, plus fyra kit och MIDI-ut.

Publicerad på `/demos/instant-haus-web/`.

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

Varje fält har ett par små **− / +** under sig, utöver att gå att skriva i:
ett steg per klick, tio med shift, och håll inne för repetition — en velocity
har 128 steg och ingen ska behöva klicka så många gånger. Mönsterrattens
stegknappar sitter kvar där de satt.

### Noter — GM eller OP-XY

Två notkartor, växlade med **Notes: GM / OP-XY** i konsolen bredvid Init:

| Röst | GM | | OP-XY | |
|---|---|---|---|---|
| Kick | 36 | C1 | 53 | F2 |
| Snare | 38 | D1 | 55 | G2 |
| HiHats CH | 42 | F#1 | 60 | C3 |
| HiHats OH | 46 | A#1 | 61 | C#3 |
| Perc | 50 | D2 | 67 | G3 |

**GM** är General MIDI-percussionkartan, vilket är exakt vad enheten själv
skickar och var ett Ableton drum rack börjar. **OP-XY** är vad en Teenage
Engineering-trumkit svarar på — F kick, G snare, C och C# hattar. Tonhöjderna
stämmer med hur OP-XY:s layout beskrivs i communityn; pad-numreringen är inte
dokumenterad ens i manualen, så sidan påstår ingenting om den.

Valet gör tre saker: laddar noterna direkt, bestämmer vad **Init** lägger
tillbaka, och bestämmer vilken trumma varje not *är* (se Kit nedan), vilket
i sin tur styr vad **Randomize › Note** rullar bland. Sidan startar på OP-XY;
valet sparas i `localStorage`. En preset lagrar sina egna noter *och* vilken
karta som var vald, så en återhämtning ställer tillbaka båda.

Randomize-knapparna använder enhetens egna intervall, lästa ur
`p randomvel`, `p randomshift`, `p randomswing` och `p midi_pattern_selec`:

- **Patt** — `random 12` per spår, `random 24` för hihats
- **Swing** — `random 50 + 50`, alltså 50–99, på alla fyra
- **Shift** — `random 26` på snare, hihats och perc; **kicken lämnas i fred**
- **Vel** — kick/snare/perc: Hi = `random 27 + 100`, Lo = `random 100`.
  CH och OH: `random 127` på både Hi och Lo — därför blir hattarna vildare
- **Note** — ingen motsvarighet i enheten. Rullar bland de noter som har en
  trumma i det valda kitet under den valda kartan (11 på 909:an, 16 på
  808:an), så en slumpning aldrig landar på en tom pad
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

## Paletten

Färgerna är lästa ur samma `.amxd` som mönstren — `bgcolor`, `textcolor`,
`activedialcolor` och deras släktingar i patcher-JSON:en — inte ögonmätta från
en skärmdump.

| Roll | Värde | Var i enheten |
|---|---|---|
| Signalfärg | `#47D6FF` | rattbåge, aktiv flik, LED, sifferfält |
| Panel | `#232529` | modulpanelerna |
| Djup panel | `#181E23` | Randomize-blocket, text på cyan |
| Linje | `#464B4F` | avdelarna mellan modulerna |
| Dämpad text | `#4C5766` | inaktiva etiketter |
| Sval ljusgrå | `#C0C8D6` | aktiv flikbakgrund |

Sidan kör Lives **ljusa skin** i ljust läge — sval grå (`#E3E6EA` /`#F1F3F5`)
i stället för sajtens varma betong, med enhetens `#181E23` och `#4C5766` som
ink och dämpad text — och enhetens **mörka chrome** i mörkt läge (`#1B1D21` /
`#232529` / `#181E23`, cyan `#47D6FF`).

En avvikelse: `#47D6FF` bär inte text mot ljus botten (3,4:1). Ljusa lägets
`--acc` är därför `#0B7BA8`, två steg mörkare, vilket ger 4,3:1 — något bättre
än sajtens egna `#D2461B` på `#F2F0EB` (4,0:1). Den elektriska cyanen ligger
kvar som `--acc-soft` och är accentfärgen rakt av i mörkt läge. Knapptext på
accent styrs av `--on-acc`: vitt i ljust läge, enhetens `#181E23` i mörkt.

## Presets

Sexton platser, samma gester som originalets `preset`-objekt: **klick = hämta**,
**shift-klick = spara**. Alt-klick tömmer en plats — Max preset-objekt har
ingen väg att göra det, men en webbsida behöver en.

En preset fångar hela tillståndet: bank, mönster per spår (även egenredigerade
rutnät), noter, Vel Hi/Lo, swing, shift, mute, radnivåer, kit, tempo och drive.
Fyllda platser är accentfärgade, den senast hämtade har en ring.

Originalet sparar sina presets i enheten och därmed i Live-setet. Här ligger de
i `localStorage` under sidans egen origin — de överlever en omladdning men
lämnar aldrig webbläsaren. Om lagringen nekas fungerar de ändå, fast bara för
sessionen.

## Radnivåer

Varje röst går genom en egen `GainNode` före mastern, med en fader i
radetiketten (0–150 %, samma som House Machine). Den påverkar **bara ljudet** —
MIDI-velocityn som spåret skickar är fortfarande Vel Hi/Vel Lo. Init nollställer
fadrarna till 100.

## Hattarnas nivå

Två fel i den ärvda syntesen gjorde hattarna nästan ohörbara, båda hittade genom
att mäta utsignalen med en `AnalyserNode` i headless Chromium:

1. **909 och 808 fick sitt brus nedskalat med oscillatorbankens gain.** De sex
   fyrkantsvågorna delade bussgain `0.05` med bruset, så bruslagret låg 26 dB
   under vad det skulle. Banken har nu en egen gain och bruset går rakt in.
2. **808:ans högpass låg över hela dess oscillatorstack.** Bankens sex
   frekvenser ligger på 410–1683 Hz, filtret på 7000 Hz — rösten filtrerades
   i praktiken bort. Nu 1400 Hz.

Före: hattarna låg 22–35 dB under kicken i toppnivå beroende på kit. Efter:
7–13 dB, jämnt över alla fyra kit. Samma två fel finns i House Machine-demons
kit-tabell, som den ärvdes från.

## Skillnader mot originalet

- **Ingen Live.** Originalet ärver tempo och transport från värden; sidan har
  egen klocka och tempofader. Originalets swing skalades mot värdtempot på ett
  sätt som lämnade kvar lite shuffle även vid 50 % (`scale 0 127 0 (4000/bpm)`
  i `p swing_engine`). Här är 50 % rakt, 66 % triolshuffle.
- **Ett slag per cell.** Några källmönster sätter både accent- och ghostraden på
  samma steg, vilket i Max ger två noter. Rutnätet har en cell per steg, så de
  kollapsar till en accent.
- **Init nollställer även banken** till House, eftersom `genre` bär
  `parameter_initial: 0` i enheten.
- **Inget MIDI learn, ingen Assign Rack.** Originalets *MIDI to*-meny och
  *Rack*-knapp mappar inkommande noter till egna parametrar respektive till ett
  drum racks pads. Ingendera har något att peka på i en webbläsare.
- **Ljud och MIDI-ut** är tillägg. Originalet låter inte alls.

## Kit

Fyra kit — 707, 808, 909 och LinnDrum — med samma syntesrecept som House
Machine, men här har varje kit **alla trummor som originalmaskinen hade**, och
**noten väljer ljudet**. Spåren är bara bussar: Note-fältet skickas ut på MIDI
som förut, men slås också upp i den valda notkartan (`NOTE_MAPS[...].slots`)
till en generisk trumma — kick, snare, rimshot, clap, tre toms, tre hattar
(closed/pedal/open), crash, ride, cowbell, tamburin, claves, maracas, cabasa,
två congas — och den trumman spelas ur kitets tabell. Skriv 39 i Perc under GM
och spåret är en clap; 56 är en cowbell; 49 en crash.

| Kit | Trummor | Saknar |
|---|---|---|
| 707 | kick, snare, 3 toms, rim, clap, tamburin, cowbell, CH/PH/OH, crash, ride | congas, claves, maracas, cabasa |
| 808 | kick, snare, 3 toms, 2 congas, rim, clap, cowbell, claves, maracas, CH/PH/OH, en cymbal | tamburin, cabasa, separat ride — cymbalen svarar på både crash- och ridenoten (`ride:"crash"`) |
| 909 | kick, snare, 3 toms, rim, clap, CH/PH/OH, crash, ride | allt småslagverk |
| LinnDrum | kick, snare, sidestick, clap, 3 toms, 2 congas, cabasa, tamburin, cowbell, CH/PH/OH, crash, ride | claves, maracas |

Pedalhatten är en kortare closed hat i alla fyra — ingen av maskinerna har
ett eget sample för den, men ett drum rack brukar ha padden.

**Hattarna chokar.** Closed, pedal och open hat är en enda röst, som på alla
fyra maskinerna: ett closed- eller pedalslag klipper en open hat som
fortfarande ringer, och en ny open hat klipper den förra. Det gäller oavsett
vilket spår som avfyrade hatten. Choken görs med `cancelAndHoldAtTime` på
open-hattens gain (fallback `cancelScheduledValues`) följt av en 4 ms
`setTargetAtTime` mot noll, på exakt den schemalagda tiden för det chokande
slaget, så den ligger i fas med swing och shift.

En not som kitet inte har någon trumma för är en **tom pad**: tyst, som i ett
drum rack. Noten skickas fortfarande på MIDI. Rutnätets notchip visas
genomstruket, och notkartans tabell skriver *no cowbell* i Sound-kolumnen.

**GM-kartan** (35–77) viker GM:s slagverkskarta ner på vad en trummaskin har:
sex toms blir tre, alla cymbaler är crash eller ride, bongos är congas,
agogo är cowbell. Vibraslap, timbales, visslor, guiro och cuica har ingen
motsvarighet på något av kiten och är tomma. **OP-XY-kartan** (53–73) följer
hur en TE-trumkit ligger över två oktaver från F: kick och snare med en
alternativ pad var, sedan rim, clap, tamburin, hattarna, shaker, cowbell,
toms, cymbaler, claves och congas. Padnumreringen är fortfarande inte
dokumenterad, så layouten ovanför C#3 är sidans egen.

Nya recept utöver House Machines: cymbaler är en oharmonisk bank fyrkantsvågor
plus en brussvans för crashen; cowbell är två fyrkantsvågor på 587 och 845 Hz
genom ett bandpass (808:ans recept); claves en 2,5 kHz-sinus på 35 ms;
tamburin, maracas och cabasa är tre bruskorn i rad genom ett högpass, där
avståndet mellan kornen är det som skiljer dem åt; congas är toms med mindre
böj. **Drive** är samma parallella softclip på mastern.

LinnDrum (Roger Linns LM-2, 1982) är inte syntes utan samplade riktiga trummor
i 8 bitar, vilket parametrarna speglar: kicken böjer knappt tonhöjd (96 → 52 Hz
på 20 ms), snaren är mest brus med kort kropp, och hattarna är mörkare än
909:ans eftersom 8 bitar i 28 kHz är det.

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
uträkning. Not→ljud: varje not 33–80 i båda kartorna på alla fyra kit avfyrad
utan konsolfel, och Randomize › Note 40 gånger per kit och karta landar bara
på noter som låter. Nivåer mätta med en `AnalyserNode` på destinationen:
kick −2, snare −8, hattar −9, cymbaler och clap inom ett tiotal dB därunder. `screenshot.png` är
den renderingen i 1600×900. Typsnitten (Archivo Black, Anton, IBM Plex Sans,
IBM Plex Mono) ligger som base64 i toppen av `<style>`, kopierade från House
Machine.
