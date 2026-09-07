# OP-XY Song Loader

Publicerad på `/demos/op-xy-song-loader/`. Planen nedan skrevs först; allt utom
det som uttryckligen står som öppet är byggt.

En sida som tar en MIDI-fil, delar upp den i trummor, ackord, bas och melodi,
mappar delarna mot OP-XY:s åtta spår och dess trumnoter, och sedan gör tre
saker med resultatet: spelar upp det i webbläsaren, strömmar det live till
enheten över USB, eller sparar ut det som `.mid` per spår.

Kärnan är att man **släpper sin egen fil** på sidan. Den lämnar aldrig
webbläsaren — allt görs i JavaScript, ingen uppladdning, ingen server.


## Vad som finns

- **Flera filer åt gången.** Välj eller släpp hur många `.mid` som helst. Varje
  fil får en egen sektion på sidan med sina delar och sina överstyrningar, alla
  synliga samtidigt. Förhandslyssningen spelar **alla filer på en gång**, i
  transportens tempo, och varje sektion har en play/muted-knapp som slår
  igenom mitt under uppspelning. Filer av olika längd loopar var för sig och
  fasar mot varandra. Trumpanelen och exporten följer den fil som klickades
  senast. En trasig fil i högen rapporteras med namn utan att de andra kastas.
- **Parser.** SMF format 0/1, ticks per fjärdedel, running status. Format 0
  delas per kanal före analysen. SMPTE-division avvisas med besked i stället för
  att tolkas fel.
- **Partsdetektering.** Kanal 10, program change, medelpolyfoni, medeltonhöjd,
  stegvis rörelse och spårnamn poängsätts ihop. Gissningen visas med sitt skäl
  som tooltip, och varje spår har en rullgardin som kör över den.
- **Miniatyrrullar** per spår — tid åt sidan, tonhöjd uppåt, över spårets eget
  register. Snabbaste sättet att se att en "melodi" egentligen är en baslinje.
- **Trumplatser.** 24 platser, 53–76, med konventionen som utgångsläge och en
  väljare per trumma i filen. Sparas i localStorage. Trummor utan plats räknas
  och sägs ut i klartext i stället för att tyst försvinna.
- **Förhandslyssning** i Web Audio, egna röster per roll.
- **Web MIDI ut** — alla spår samtidigt, var och en på sin kanal, med klocka.
- **Export** av `.mid` per spår, redan ommappat.

Verifierat bland annat med rundgång: exportera trumspåret, släpp tillbaka
filen på sidan, och den läses som 64 noter i 4 takter, 112 BPM, register
F2–C#3 — alltså de ommappade OP-XY-platserna.

---

## Varför inte kända låtar

Det var den ursprungliga idén, och den går inte att publicera. En poplåts
**melodi och ackord är en egen upphovsrätt**, skild från inspelningen, och en
MIDI-transkription är ett bearbetat exemplar av kompositionen. Att bunta med
"Billie Jean" som exempelfil är samma sak som att lägga upp noterna.

De tidigare demona på sajten var rena av olika skäl: One Drop är traditionella
reggaemönster, House Machine hade Studio Brootles uttryckliga tillstånd, Instant
Haus är CC BY-NC. Det här hade blivit det första som inte var det.

Vägen runt gör dessutom demot bättre: **verktyget är poängen, inte låtlistan.**
Sidan är en laddare. Du släpper vad du vill på den — dina egna filer, filer du
har rätt till, vad som helst — och det stannar i din webbläsare.

### Medföljande exempel

Bara fria verk, och en fallgrop värd att känna till: **själva
MIDI-transkriptionen kan bära egen upphovsrätt som arrangemang**, även när
verket är fritt. Att ladda ner någons Bach-MIDI och bunta den löser alltså
ingenting. Exempelfilerna måste sekvenseras från grunden här.

En spänning att lösa: fritt material är i praktiken före ~1930, och där finns
inga trumspår. Förslag — 2–3 fria stycken plus 1–2 egna:

| Exempel | Verk | Visar |
|---|---|---|
| Joplin, *The Entertainer* (d. 1917) | fritt | melodi + stride-vänsterhand som ackord |
| Bach, tvåstämmig invention (d. 1750) | fritt | två melodistämmor, ingen ackordklump |
| Traditionell dansmelodi | fritt | melodi + enkel komp |
| Egen exempelgroove | skriven för sidan | trummor + bas + ackord, det enda som visar trumdelen |

Egna exempel märks tydligt som skrivna för sidan, inte som "kända låtar".

---

## Vad som faktiskt gäller för OP-XY

Kollat mot Teenage Engineerings guide och OP Forums, inte mot minnet. Det här
formar arkitekturen mer än något annat:

| Fråga | Svar | Konsekvens |
|---|---|---|
| Har spåren egna MIDI-kanaler? | Ja — projektinställningarna sätter MIDI-kanal på var och en av de 16 spåren | Kanalmappning är genomförbar |
| Kan enheten spela in inkommande MIDI? | Ja, men: `COM → M1 → MIDI`, `active track ch.` måste matcha, record+play armerat, **och sändaren måste skicka klocka** | Sidan måste skicka MIDI-klocka, inte bara noter |
| Kan man kopiera in `.mid`? | **Nej, inte dokumenterat.** MTP överför samples, presets och projekt — inga MIDI-filer. Mac kräver dessutom fieldkit-appen | Ett av de tre utdata funkar inte som tänkt (se nedan) |
| Trumlayout | F = kick, G = snare enligt communityn. Uppmätt på enheten: 53 F2 kick, 55 G2 snare, 62 D3 closed hat, 63 D#3 open hat, 69 A3 ride | Behöver en GM → OP-XY-översättning |

### Går det att byta aktivt spår via CC? Nej — och förmodligen behövs det inte

Den officiella CC-tabellen har inget för spårval. Den täcker:

| CC | Parameter | Kanal |
|---|---|---|
| 7 | spårvolym | 1–16 |
| 9 | spår mute | 1–16 |
| 10 | spår pan | 1–16 |
| 46 | spårparametrar | 1–16 |
| 80 | tempo | valfri |
| 81 | groove | valfri |
| 82 / 85 | scen (fördröjt / direkt) | valfri |
| 83 / 84 | föregående / nästa scen | valfri |
| 86 | projekt | valfri |
| 90 | EQ | 1–4 |

Scener och projekt går att byta utifrån. Spårval gör det inte. Guiden skriver
själv att enheten har "almost all of its controls pre-mapped as midi CCs" —
vilket är ett sätt att säga att några inte är det.

**Men två saker i dokumentationen pekar mot att frågan är fel ställd.**
Spår-CC:na ovan adresseras med **kanal 1–16**, alltså träffar de ett spår utan
att det är valt. Och projektinställningarna sätter en egen MIDI-kanal per spår.
`active track ch.` beskrivs som "the active track is the one currently
selected" — det låter som en bekvämlighetskanal som följer markeringen, för att
spela ett externt klaviatur in i det man råkar ha framme, inte som den enda
vägen in.

Om den läsningen stämmer skickar sidan helt enkelt varje del på **målspårets
egen kanal** och allt landar parallellt. Inget spårbyte behövs.

### Hårdvarutestet — kört, alla tre passerade

Kört på riktig enhet med `_midi-test.html` (untracked scratch-fil i den här mappen).

| Fråga | Utfall |
|---|---|
| 0. Adresserar en kanal ett spår utan att det är valt? | **Ja** |
| 1. Spelas två kanalers noter in samtidigt? | **Ja** |
| 2. Byter scen-CC:na scen? | **Ja** |

**Konsekvensen är hela designen.** Läsningen stämde: `active track ch.` är en
bekvämlighetskanal som följer markeringen, inte den enda vägen in. Spåren nås
på sina egna kanaler.

Live-läget blir alltså **en enda uppspelning av hela låten** — varje del på sitt
spårs kanal, klocka i botten, enheten armerad. Reservdesignen med ett spår i
taget och en skicka-knapp per del behövs inte och stryks härmed. Scen-CC:na blir
en bonus i stället för en nödlösning: låtens delar kan läggas i olika scener.

### Trumkartan — det finns ingen, och det är inte en lucka

Trumpadsen skickar **not 53 till 76, kromatiskt sammanhängande. 24 platser.**

```
53 F2   54 F#2  55 G2   56 G#2  57 A2   58 A#2
59 B2   60 C3   61 C#3  62 D3   63 D#3  64 E3
65 F3   66 F#3  67 G3   68 G#3  69 A3   70 A#3
71 B3   72 C4   73 C#4  74 D4   75 D#4  76 E4
```

Mätningen och dokumentationen möts exakt. TE:s guide skriver att trumsamplern
"allows you to trigger **24 different one shot samples across the musical
keyboard**" — och 53–76 är precis 24 noter.

Samma guide avgör också frågan om vilket ljud som sitter var:

> "press a key to select it, it will light up and you can then record a sample to it"

**Det finns ingen förvald trumuppsättning.** En OP-XY-kit är 24 kromatiska
one-shot-platser, en sampling per tangent, och vad som ligger på var och en är
vad kitet man laddat lägger där. Att leta efter "OP-XY:s trumtabell" är att leta
efter något som inte finns — F kick, G snare, C# hi-hat är en **konvention i
TE:s fabrikskits**, inte en specifikation. Genomsökt: OP Forums, teopxy,
opxy-drum-tool, Kit Constructor, Vibe Coding-specen, Elektronauts. Ingen
dokumenterar en kanonisk tabell, för det går inte.

**Designkonsekvens, och den gör laddaren bättre.** Planens "GM → OP-XY-tabell"
kan inte vara en fast tabell. Den blir i stället:

- En **förvald konvention** — 53 kick, 55 snare, 62 closed hat, 63 open hat,
  69 ride, alltså de värden som är uppmätta på enheten. 60 och 61 lämnas
  onamngivna hellre än gissade
- Ovanpå det ett **rutnät med 24 platser** där varje GM-trumma i den laddade
  filen kan dras till den plats där ljudet faktiskt ligger i ditt kit
- Mappningen **sparas per kit** i localStorage, för den som byter kit byter
  också karta

Det tar också bort ett beroende: jag behövde inte veta vad som ligger på pad 14,
eftersom svaret ändå är olika för varje kit.

### Följdfel i Instant Haus Web

Det demot randomiserar noter inom **53–68** — ett intervall jag härledde från
antagandet om 16 pads. Med 24 platser täcker det bara två tredjedelar av kitet
och bör bli 53–76. Egen ändring i det repot, inte den här grenen.

---

## De tre utdata

### 1. Förhandslyssning i webbläsaren

Enklast och det som byggs först. Trummorna kan använda kit-tabellen från Instant
Haus rakt av; ackord och melodi behöver ett par enkla polyfoniska röster. Samma
lookahead-schemaläggare som de andra tre demona.

Det här är också sanningsvittnet: hör man uppdelningen stämma i webbläsaren vet
man att analysen är rätt innan något skickas till hårdvara.

### 2. Web MIDI live till OP-XY

Noter på valda kanaler **plus klocka**: `0xF8` 24 gånger per fjärdedel, `0xFA`
start, `0xFC` stop. Utan klockan spelar enheten inte in i takt — det var precis
det folk gick bet på i forumtråden.

Tidsstämplar räknas om från Web Audios `currentTime` till `performance.now()`
med en offset tagen när kontexten skapas, samma grepp som i Instant Haus Web.
Bara Chromium-baserade webbläsare; Safari och Firefox saknar Web MIDI.

Behöver en inräkning och en tydlig "armera enheten först"-instruktion på sidan,
för ordningen spelar roll.

### 3. Export av `.mid` per spår

**Inte för att kopiera in i OP-XY:n** — den tar inte emot MIDI-filer över MTP.
Det här är för din DAW, för arkivering, eller för att flytta vidare till något
annat. Sidan ska säga det rakt ut, annars är det en fälla.

Att skriva SMF är oproblematiskt: `MThd`, en `MTrk` per spår, variabel längd på
delta-tider, tempo-meta `0x51`.

### Kvarvarande idé, om formatet visar sig knäckbart

Guiden nämner att man kan "skapa och ladda egna projektmallar med en dator över
MTP". Om projektformatet går att läsa vore **att skriva ett helt OP-XY-projekt**
det verkliga svaret — hela låten, färdig att öppna. Formatet är odokumenterat,
så det är ett sidospår att undersöka, inte något att lova.

---

## Arkitektur

### MIDI-parsning

Inget bibliotek. Standard MIDI File är litet nog att läsa själv:

- `MThd`: format 0/1/2, antal spår, division
- `MTrk` per spår, delta-tider i variabel längd
- Running status måste hanteras — halva filerna i naturen använder det
- Meta: tempo `0x51`, taktart `0x58`, spårnamn `0x03`, slut `0x2F`
- **Stöd ticks-per-quarter, inte SMPTE-division.** Sällsynt, och att avvisa
  det tydligt är bättre än att tolka det fel

Format 0 (allt i ett spår) måste delas per kanal innan analysen — annars ser
allt ut som ett enda spår.

### Klassificering — den intressanta delen

Att gissa vad ett spår är. Ingen enskild signal räcker; poängsätt flera:

| Signal | Säger |
|---|---|
| Kanal 10 | trummor, per GM-konvention. Starkaste signalen som finns |
| Program change | GM-familj: 1–8 piano, 33–40 bas, 81–88 lead, 89–96 pad |
| Medelpolyfoni | > ~2,5 samtidiga noter → ackord/pad; ~1,0 → melodi eller bas |
| Medeltonhöjd | låg + monofon → bas; mitten/hög + monofon → melodi |
| Intervallrörelse | stegvis → melodi; stora språng → bas eller ackordbrytning |
| Spårnamn | "Bass", "Drums", "Lead" — många filer har det, gratis signal |

Gissningen visas, och **varje spår har en väljare för att ändra den**. Automatik
som inte går att köra över är värdelös på riktiga filer.

### Mappning mot OP-XY

- Varje del tilldelas ett av de åtta spåren; kanalen sätts per spår i enheten
- Trummor behöver en **GM → OP-XY-percussiontabell**. Kick, snare, CH, OH och
  ride är uppmätta; clap, rim, tomar och crash följer samma layout uppåt
  klaviaturen och kan ändras per plats i rutnätet
- Noter utan motsvarighet måste **synas som bortkastade**, inte tyst försvinna
- Melodiska spår går igenom som de är, med en oktavförskjutning per spår

---

## Vad jag skulle bygga först

1. Parsern och en tabell över vad filen innehåller — spår, kanal, antal noter,
   polyfoni, register. Inget ljud. Släpp in en fil och se om läsningen stämmer.
2. Klassificeringen ovanpå, med manuell override.
3. Förhandslyssningen. Nu hörs det om det är rätt.
4. **Hårdvarutestet** ovan, innan live-läget byggs.
5. Live-läget, formad av vad testet visade.
6. `.mid`-exporten sist — den är minst intressant och lättast.

---

## Källor

- [OP–XY guide: project](https://teenage.engineering/guides/op-xy/project) — MIDI-kanal per spår, projektmallar över MTP
- [OP–XY guide: com](https://teenage.engineering/guides/op-xy/com) — MTP, fieldkit på Mac
- [OP–XY guide: midi reference](https://teenage.engineering/guides/op-xy/midi-references) — CC-tabell
- [OP Forums: can't record external midi input](https://op-forums.com/t/cant-record-external-midi-input-into-the-sequencer-wtf/29710) — inspelning fungerar, kräver kanal + klocka
- [OP Forums: OP-XY drum mappings](https://op-forums.com/t/op-xy-drum-mappings/28884) — F kick, G snare, C# hi-hat som konvention
- [OP–XY guide: sample](https://teenage.engineering/guides/op-xy/sample) — 24 one-shots över klaviaturen, ingen förvald uppsättning
