#!/usr/bin/env python3
"""Skriver exempellåten "Loader Demo" för OP-XY Song Loader som en SMF.

Låten är skriven för sidan, inte lånad: 16 takter i 124 BPM (fyra
OP-XY-patterns om fyra takter), A-moll, fyra spår som var och en ska
träffa rätt roll i sidans gissning — trummor på kanal 10, bas lågt och
enstämmigt, ackord fyrstämmiga, lead i mellanregistret med stegvis rörelse.

    python3 scripts/op-xy-demo-song.py            # skriver base64 till stdout
    python3 scripts/op-xy-demo-song.py out.mid    # skriver också en .mid

Base64-strängen klistras in som EX_DATA.groove i
static/demos/op-xy-song-loader/index.html.
"""
import base64, struct, sys

PPQ = 480
BPM = 124
BARS = 16
BAR = PPQ * 4
Q, E, S = PPQ, PPQ // 2, PPQ // 4          # fjärdedel, åttondel, sextondel

def vlq(n):
    out = [n & 0x7F]
    n >>= 7
    while n:
        out.insert(0, (n & 0x7F) | 0x80)
        n >>= 7
    return bytes(out)

def track(events, name, program=None, channel=0):
    """events: list of (tick, note, velocity, duration) -> MTrk bytes."""
    msgs = [(0, b"\xFF\x03" + vlq(len(name)) + name.encode())]
    if program is not None:
        msgs.append((0, bytes([0xC0 | channel, program])))
    for t, n, v, d in events:
        msgs.append((t, bytes([0x90 | channel, n, v])))
        msgs.append((t + d, bytes([0x80 | channel, n, 0])))
    # stabil ordning: samma tick -> note off före note on
    msgs.sort(key=lambda m: (m[0], 0 if m[1][0] & 0xF0 == 0x80 else 1))
    body, last = b"", 0
    for t, m in msgs:
        body += vlq(t - last) + m
        last = t
    body += vlq(0) + b"\xFF\x2F\x00"
    return b"MTrk" + struct.pack(">I", len(body)) + body

def tempo_track():
    us = round(60_000_000 / BPM)
    body = b"\x00\xFF\x03" + vlq(11) + b"Loader Demo"
    body += b"\x00\xFF\x51\x03" + us.to_bytes(3, "big")
    body += b"\x00\xFF\x58\x04\x04\x02\x18\x08"
    body += b"\x00\xFF\x2F\x00"
    return b"MTrk" + struct.pack(">I", len(body)) + body

def bar(b):            # tick där takt b (0-baserad) börjar
    return b * BAR

# ---------------------------------------------------------------- trummor
KICK, RIM, SNARE, CLAP = 36, 37, 38, 39
LTOM, MTOM, HTOM = 43, 47, 50
CH, PH, OH, CRASH, RIDE = 42, 44, 46, 49, 51

def drums():
    ev = []
    def hit(t, n, v, d=S):
        ev.append((t, n, v, d))
    for b in range(BARS):
        t0 = bar(b)
        last_of_four = b % 4 == 3
        heavy = b >= 12
        # kick på varje slag; från takt 13 dubblas den på "och" före ettan
        for q in range(4):
            hit(t0 + q * Q, KICK, 118 if q in (0, 2) else 110, E)
        if heavy or last_of_four:
            hit(t0 + 3 * Q + E, KICK, 96, S)
        # backbeat: clap och virvel ovanpå varandra på 2 och 4
        for q in (1, 3):
            hit(t0 + q * Q, CLAP, 112, E)
            hit(t0 + q * Q, SNARE, 84, E)
        # spökslag på rimshot, "a" av 2 och 4, varannan takt
        if b % 2 == 1:
            hit(t0 + 1 * Q + 3 * S, RIM, 52)
            hit(t0 + 3 * Q + 3 * S, RIM, 58)
        # hattar: stängd på varje sextondel utom där den öppna ligger,
        # öppen på varje "och", pedal på "e" i tyngre takter
        for s16 in range(16):
            t = t0 + s16 * S
            pos = s16 % 4
            if pos == 2:
                hit(t, OH, 92 if s16 in (6, 14) else 80, E)
            elif pos == 0:
                hit(t, CH, 70)
            elif pos == 1:
                hit(t, PH if heavy else CH, 46)
            else:
                hit(t, CH, 62)
        # ride från takt 9, på åttondelarna
        if b >= 8:
            for e8 in range(8):
                hit(t0 + e8 * E, RIDE, 64 if e8 % 2 == 0 else 48, E)
        # crash på ettan i takt 1, 9 och 13
        if b in (0, 8, 12):
            hit(t0, CRASH, 108, Q)
    # tom-fill sista slaget i takt 8, och ett helt slag + i takt 16
    t = bar(7) + 3 * Q
    for i, n in enumerate([HTOM, HTOM, MTOM, LTOM]):
        hit(t + i * S, n, 90 + i * 6)
    t = bar(15) + 2 * Q
    for i, n in enumerate([HTOM, HTOM, MTOM, MTOM, LTOM, LTOM, LTOM, KICK]):
        hit(t + i * S, n, 84 + i * 5)
    # takt 16: hattarna får vika för fillet på sista halvan
    ev = [e for e in ev if not (e[0] >= bar(15) + 2 * Q and e[1] in (CH, PH, OH, RIDE))]
    return ev

# ---------------------------------------------------------------- harmonik
# i – VI – III – VII i A-moll, en takt var; sista fyra takterna byter VII mot v
A, F, C, G, E_ = 45, 41, 48, 43, 40          # basens grundtoner (A1 = 33 ligger under)
PROG = [A, F, C, G] * 3 + [A, F, C, E_]

def bass():
    ev = []
    for b in range(BARS):
        root = PROG[b] - 12                  # A1, F1, C2, G1, E1
        t0 = bar(b)
        # rullande åttondelar på grundtonen, oktaven upp på "a" av 2 och 4,
        # kvinten som upptakt in i nästa takt
        for e8 in range(8):
            t = t0 + e8 * E
            if e8 == 7 and b % 4 == 3:
                # takt 4/8/12/16: sista åttondelen leder över med en oktav upp
                ev.append((t, root + 12, 100, E - 20))
            elif e8 in (3, 7):
                ev.append((t, root + 12, 92, S))
                ev.append((t + S, root, 80, S))
            elif e8 == 6 and b % 2 == 1:
                ev.append((t, root + 7, 88, E))
            else:
                ev.append((t, root, 104 if e8 % 2 == 0 else 86, E - 20))
    return ev

CHORDS = {A: [57, 60, 64, 67], F: [57, 60, 65, 69], C: [55, 60, 64, 67], G: [55, 59, 62, 67], E_: [56, 59, 64, 67]}

def chords():
    ev = []
    for b in range(4, BARS):
        t0 = bar(b)
        notes = CHORDS[PROG[b]]
        # stabbar på "och" av 1 och 3 samt en kort push på "a" av 4 — kort,
        # så att den inte sticker in i nästa takt och gör låten 17 takter
        for off in (E, 2 * Q + E, 3 * Q + 3 * S):
            push = off == 3 * Q + 3 * S
            for n in notes:
                ev.append((t0 + off, n, 84 if push else 96, (S if push else E) - 40))
        # från takt 9 en liggande grund + kvint under, hela takten
        if b >= 8:
            for n in (notes[0] - 12, notes[0] - 5):
                ev.append((t0, n, 70, BAR - 30))
    return ev

def lead():
    ev = []
    # en fras om två takter, stegvis i A-moll, varieras per fyratakters-period
    phrase_a = [(0, 76, Q), (Q, 74, E), (Q + E, 72, E), (2 * Q, 74, Q + E), (3 * Q + E, 72, E),
                (BAR, 69, Q), (BAR + Q, 71, E), (BAR + Q + E, 72, E), (BAR + 2 * Q, 71, Q), (BAR + 3 * Q, 69, Q)]
    phrase_b = [(0, 76, E), (E, 77, E), (Q, 76, E), (Q + E, 74, E), (2 * Q, 72, Q), (3 * Q, 74, E), (3 * Q + E, 76, E),
                (BAR, 77, Q + E), (BAR + Q + E, 76, E), (BAR + 2 * Q, 74, E), (BAR + 2 * Q + E, 72, E), (BAR + 3 * Q, 71, Q)]
    for b in range(8, BARS, 2):
        t0 = bar(b)
        phrase = phrase_b if (b // 2) % 2 else phrase_a
        up = 12 if b >= 12 else 0
        for off, n, d in phrase:
            ev.append((t0 + off, n + up, 100 if off % Q == 0 else 84, d - 30))
    # sista takten: landa på grundtonen och håll
    ev.append((bar(15) + 2 * Q, 81, 108, 2 * Q))
    return ev

def smf():
    tracks = [tempo_track(),
              track(drums(), "Drums", channel=9),
              track(bass(), "Bass", program=38, channel=1),         # GM 39 Synth Bass 1
              track(chords(), "Chords", program=89, channel=2),     # GM 90 Pad 2 (warm)
              track(lead(), "Lead", program=80, channel=3)]         # GM 81 Lead 1 (square)
    head = b"MThd" + struct.pack(">IHHH", 6, 1, len(tracks), PPQ)
    return head + b"".join(tracks)

if __name__ == "__main__":
    data = smf()
    if len(sys.argv) > 1:
        open(sys.argv[1], "wb").write(data)
    sys.stdout.write(base64.b64encode(data).decode() + "\n")
