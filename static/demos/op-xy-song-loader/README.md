# OP-XY Song Loader

**Arbetsnamn. Ingen kod skriven än — det här är planen.**

En sida som tar en MIDI-fil, delar upp den i trummor, ackord, bas och melodi,
mappar delarna mot OP-XY:s åtta spår och dess trumnoter, och sedan gör tre
saker med resultatet: spelar upp det i webbläsaren, strömmar det live till
enheten över USB, eller sparar ut det som `.mid` per spår.

Kärnan är att man **släpper sin egen fil** på sidan. Den lämnar aldrig
webbläsaren — allt görs i JavaScript, ingen uppladdning, ingen server.

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
| Trumlayout | F = kick, G = snare, C# = hi-hat enligt communityn. Dina arbetsnoter: 53 F2, 55 G2, 60 C3, 61 C#3, 67 G3 | Behöver en GM → OP-XY-översättning |

### Den öppna frågan som måste testas på hårdvara

Tråden om extern inspelning visar **ett** spår inspelat, styrt av `active track
ch.`. Om enheten spelar in alla åtta kanaler samtidigt eller bara det aktiva
spåret är avgörande för hela live-läget, och det står ingenstans.

**Test innan något byggs:** skicka noter på två kanaler samtidigt från valfri
DAW, armera inspelning, och se om båda spåren fylls. Faller det ut som ett spår
i taget blir live-läget "ett spår åt gången med spårväljare" i stället för
"hela låten på en gång" — fullt användbart, men en annan design.

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
- Trummor behöver en **GM → OP-XY-percussiontabell**. Vi har kick, snare, CH,
  OH och perc. Clap, rim, tomar, ride och crash saknas och måste bestämmas
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
- [OP Forums: OP-XY drum mappings](https://op-forums.com/t/op-xy-drum-mappings/28884) — F kick, G snare, C# hi-hat
