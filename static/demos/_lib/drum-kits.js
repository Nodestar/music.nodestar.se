/* drum-kits.js — four stand-in drum machines, shared by the demos on this
   site (Instant Haus Web, OP-XY Song Loader). Not a package: a plain script
   that puts one object, `DrumKits`, on the window. Load it before the page's
   own script:

     <script src="../_lib/drum-kits.js"></script>

   What is here
   ------------
   KITS         707, 808, 909, LinnDrum: every drum a small parametric synth,
                as a table of parameters, plus a `sounds` list saying which
                drums the real machine had. A `sounds` entry may alias
                another drum (the 808 has one cymbal, so its ride is its
                crash).
   KIT_ORDER    the ids in the order a picker should show them.
   SOUND_NAMES  the generic drum ids with a label each.
   GM_SLOTS     General MIDI percussion note -> drum id, folded onto the
                drums these machines have (six toms become three, the
                cymbals crash or ride, bongos are congas, agogos a cowbell).
   OPXY_SLOTS   OP-XY factory-kit slot (note 53–76) -> drum id: two octaves
                from F, kick and snare with an alternate each, then the small
                percussion, the hats, the toms and the cymbals. The hats are
                at 62 and 63 and the ride at 69 — measured on the device.
                60 and 61 are left unnamed rather than guessed.
   soundIn(kit, id)
                the drum `id` resolves to on `kit`, following aliases, or
                null when the kit has no such drum — an empty pad.
   engine(audioContext)
                a player bound to one AudioContext. Its
                  play(kit, id, t, vel, dest)
                fires drum `id` of `kit` at time `t` (context seconds) with
                velocity `vel` in 0–1, into the AudioNode `dest`. Returns
                false for an empty pad. The hats are one voice, as on every
                one of these machines: a closed or pedal hit chokes an open
                hat still ringing, and a new open hat cuts off the last one.
                  reset()
                forgets a ringing open hat — call it when the transport stops.
*/
(function(root){
"use strict";

var KITS = {
  "707": { name:"707", label:"Roland TR-707 — 1985, PCM samples: short, crisp, slightly lo-fi. Fifteen sounds: kick, snare, three toms, rimshot, clap, tambourine, cowbell, two hats, crash, ride.",
    sounds:{kick:1,snare:1,rim:1,clap:1,tamb:1,cowbell:1,ch:1,ph:1,oh:1,ltom:1,mtom:1,htom:1,crash:1,ride:1},
    kick:{f0:150,f1:58,sw:0.05,dec:0.22,click:0.3,wave:"sine"},
    snare:{nf:2600,nq:0.8,ndec:0.13,tones:[[210,0.22,0.07],[400,0.1,0.05]]},
    clap:{bursts:3,gap:0.009,bp:1700,q:1.6,tail:0.1},
    rim:{f0:1100,f1:600,dec:0.03,nbp:3400},
    hat:{mode:"noise",hp:8500,ch:0.04,ph:0.03,oh:0.22,amp:0.30},
    tom:{wave:"sine",ratio:[1,0.55],dec:[0.28,0.24,0.2],base:[140,190,260],noise:0.12},
    crash:{base:300,dec:0.9,hp:3800,amp:0.36,noise:0.6},
    ride:{base:380,dec:0.7,hp:4500,amp:0.4},
    cowbell:{f:[587,845],dec:0.22,bp:2100,amp:0.32},
    tamb:{hp:6500,dec:0.13,bursts:3,gap:0.011,amp:0.28}
  },
  "808": { name:"808", label:"Roland TR-808 — 1980, analogue: long boomy kick, tonal snare, metallic hats. Sixteen sounds: kick, snare, three toms, three congas, rimshot, clap, cowbell, claves, maracas, two hats and one cymbal, which stands in for both crash and ride.",
    sounds:{kick:1,snare:1,rim:1,clap:1,cowbell:1,clave:1,maracas:1,ch:1,ph:1,oh:1,ltom:1,mtom:1,htom:1,conga_hi:1,conga_lo:1,crash:1,ride:"crash"},
    kick:{f0:110,f1:46,sw:0.03,dec:0.75,click:0.08,wave:"sine"},
    snare:{nf:1800,nq:0.5,ndec:0.18,tones:[[176,0.28,0.16],[238,0.18,0.12]]},
    clap:{bursts:4,gap:0.012,bp:1100,q:1.2,tail:0.2},
    rim:{f0:1700,f1:900,dec:0.025,nbp:4200},
    hat:{mode:"metal",hp:1400,ch:0.06,ph:0.045,oh:0.42,amp:0.34,base:205},
    tom:{wave:"sine",ratio:[1,0.62],dec:[0.5,0.42,0.34],base:[90,130,180],noise:0.05},
    conga:{hi:[400,0.14,0.94],lo:[220,0.22,0.94]},
    crash:{base:260,dec:1.3,hp:2800,amp:0.34,noise:0.45},
    cowbell:{f:[587,845],dec:0.3,bp:1800,amp:0.35},
    clave:{f:2500,dec:0.035,amp:0.45},
    maracas:{hp:5500,dec:0.045,att:0.006,amp:0.3}
  },
  "909": { name:"909", label:"Roland TR-909 — 1983, analogue kick and snare with sampled cymbals: the house kit. Eleven sounds: kick, snare, three toms, rimshot, clap, two hats, crash, ride.",
    sounds:{kick:1,snare:1,rim:1,clap:1,ch:1,ph:1,oh:1,ltom:1,mtom:1,htom:1,crash:1,ride:1},
    kick:{f0:170,f1:48,sw:0.09,dec:0.36,click:0.22,wave:"sine"},
    snare:{nf:2200,nq:0.6,ndec:0.19,tones:[[185,0.2,0.1],[330,0.12,0.1]]},
    clap:{bursts:4,gap:0.011,bp:1500,q:1.4,tail:0.16},
    rim:{f0:900,f1:420,dec:0.05,nbp:3200},
    hat:{mode:"mix",hp:7500,ch:0.05,ph:0.035,oh:0.32,amp:0.39,base:220},
    tom:{wave:"sine",ratio:[1,0.5],dec:[0.4,0.32,0.26],base:[150,210,300],noise:0.08},
    crash:{base:340,dec:1.1,hp:3400,amp:0.4,noise:0.7},
    ride:{base:420,dec:1.0,hp:3500,amp:0.45}
  },
  "linn": { name:"LinnDrum", label:"LinnDrum — 1982, Roger Linn’s LM-2: real drums sampled at 8 bits. Tight kick, a huge bright snare, dark gritty hats. Fifteen sounds: kick, snare, sidestick, clap, three toms, two congas, cabasa, tambourine, cowbell, two hats, crash, ride.",
    /* Samples, not circuits: the kick barely bends, the snare is mostly noise
       with a short body, and the hats are dark because 8 bits at 28 kHz are. */
    sounds:{kick:1,snare:1,rim:1,clap:1,cabasa:1,tamb:1,cowbell:1,ch:1,ph:1,oh:1,ltom:1,mtom:1,htom:1,conga_hi:1,conga_lo:1,crash:1,ride:1},
    kick:{f0:96,f1:52,sw:0.02,dec:0.30,click:0.30,wave:"sine"},
    snare:{nf:2000,nq:0.5,ndec:0.24,tones:[[188,0.24,0.09],[330,0.10,0.06]]},
    clap:{bursts:3,gap:0.013,bp:1300,q:1.0,tail:0.22},
    rim:{f0:1400,f1:700,dec:0.04,nbp:2900},
    hat:{mode:"noise",hp:6200,ch:0.045,ph:0.032,oh:0.30,amp:0.28},
    tom:{wave:"sine",ratio:[1.08,0.86],dec:[0.42,0.36,0.30],base:[130,180,250],noise:0.16},
    conga:{hi:[380,0.16,0.9],lo:[210,0.22,0.9]},
    crash:{base:290,dec:1.0,hp:3000,amp:0.36,noise:0.7},
    ride:{base:360,dec:0.9,hp:3200,amp:0.38},
    cowbell:{f:[540,810],dec:0.18,bp:1900,amp:0.3},
    tamb:{hp:5800,dec:0.16,bursts:3,gap:0.012,amp:0.26},
    cabasa:{hp:4200,dec:0.08,bursts:3,gap:0.007,amp:0.3}
  }
};
var KIT_ORDER = ["707","808","909","linn"];

var SOUND_NAMES = {
  kick:"Kick", snare:"Snare", rim:"Rimshot", clap:"Clap",
  ltom:"Low tom", mtom:"Mid tom", htom:"Hi tom",
  ch:"Closed hat", ph:"Pedal hat", oh:"Open hat",
  crash:"Crash", ride:"Ride", cowbell:"Cowbell", tamb:"Tambourine",
  clave:"Claves", maracas:"Maracas", cabasa:"Cabasa",
  conga_hi:"Hi conga", conga_lo:"Low conga"
};

/* Vibraslap, timbales, whistles, guiro and cuica have no counterpart on
   any of the kits, so they are not here. */
var GM_SLOTS = {35:"kick",36:"kick",37:"rim",38:"snare",39:"clap",40:"snare",
                41:"ltom",42:"ch",43:"ltom",44:"ph",45:"mtom",46:"oh",47:"mtom",
                48:"htom",49:"crash",50:"htom",51:"ride",52:"crash",53:"ride",
                54:"tamb",55:"crash",56:"cowbell",57:"crash",59:"ride",
                60:"conga_hi",61:"conga_lo",62:"conga_hi",63:"conga_hi",64:"conga_lo",
                67:"cowbell",68:"cowbell",69:"cabasa",70:"maracas",
                75:"clave",76:"clave",77:"clave"};
var OPXY_SLOTS = {53:"kick",54:"kick",55:"snare",56:"snare",57:"rim",58:"clap",
                  59:"tamb",62:"ch",63:"oh",64:"ph",
                  65:"ltom",66:"mtom",67:"htom",68:"crash",69:"ride",70:"clave",
                  71:"conga_lo",72:"conga_hi",73:"cabasa",74:"cowbell",75:"maracas"};

function soundIn(kit, id){
  if(!id) return null;
  var a = kit.sounds[id];
  if(typeof a === "string") id = a;
  return kit.sounds[id] ? id : null;
}

function engine(audio){
  var noiseBuf = null, openHat = null, dest = null, kit = null;

  function noise(){
    if(!noiseBuf){
      var len = audio.sampleRate * 2, b = audio.createBuffer(1, len, audio.sampleRate), d = b.getChannelData(0);
      for(var i=0;i<len;i++) d[i] = Math.random()*2-1;
      noiseBuf = b;
    }
    var s = audio.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s;
  }
  function env(g, t, peak, dec, att){
    att = att || 0.002;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t+att);
    g.gain.exponentialRampToValueAtTime(0.0001, t+att+dec);
  }
  function out(node){ node.connect(dest); }

  /* A burst of filtered noise: the building block of hats, claps, shakers. */
  function noiseHit(t, vel, type, freq, q, peak, dec, att){
    var s = noise(), f = audio.createBiquadFilter();
    f.type = type; f.frequency.value = freq; if(q) f.Q.value = q;
    var g = audio.createGain(); env(g, t, peak*vel, dec, att || 0.001);
    s.connect(f); f.connect(g); out(g); s.start(t); s.stop(t+dec+0.1);
  }
  function chokeHat(t){
    if(!openHat) return;
    var g = openHat.g.gain;
    if(openHat.end > t){
      if(g.cancelAndHoldAtTime) g.cancelAndHoldAtTime(t);
      else g.cancelScheduledValues(t);
      g.setTargetAtTime(0.0001, t, 0.004);
    }
    openHat = null;
  }
  function hatVoice(t, vel, dec, amp, open){
    var k = kit.hat, mix = audio.createGain(), i, o;
    var ratios=[2,3,4.16,5.43,6.79,8.21];
    /* The six squares need taming (they sum to +/-6); the noise does not. */
    if(k.mode!=="noise"){
      var ob = audio.createGain(); ob.gain.value = k.mode === "metal" ? 0.16 : 0.09;
      for(i=0;i<ratios.length;i++){
        o = audio.createOscillator(); o.type="square"; o.frequency.value = k.base*ratios[i];
        o.connect(ob); o.start(t); o.stop(t+dec+0.05);
      }
      ob.connect(mix);
    }
    if(k.mode!=="metal"){
      var s = noise(), ng = audio.createGain(); ng.gain.value = k.mode==="noise" ? 0.9 : 0.55;
      s.connect(ng); ng.connect(mix); s.start(t); s.stop(t+dec+0.05);
    }
    var f = audio.createBiquadFilter(); f.type="highpass"; f.frequency.value=k.hp;
    var bp = audio.createBiquadFilter(); bp.type="peaking"; bp.frequency.value=9000; bp.gain.value=4;
    var g = audio.createGain(); env(g, t, amp*vel, dec, 0.001);
    mix.connect(f); f.connect(bp); bp.connect(g); out(g);
    chokeHat(t);
    if(open) openHat = {g:g, end:t+dec+0.05};
  }
  function tomVoice(t, vel, idx){
    var k = kit.tom, base = k.base[idx], dec = k.dec[idx];
    var o = audio.createOscillator(); o.type=k.wave;
    o.frequency.setValueAtTime(base*k.ratio[0], t);
    o.frequency.exponentialRampToValueAtTime(base*k.ratio[1], t+dec*0.55);
    var g = audio.createGain(); env(g, t, 0.68*vel, dec, 0.003);
    o.connect(g); out(g); o.start(t); o.stop(t+dec+0.1);
    if(k.noise>0) noiseHit(t, vel, "bandpass", base*3, 0.8, k.noise, 0.04);
  }
  /* Congas are toms with less bend and a rounder body. [f, dec, f1 ratio]. */
  function congaVoice(t, vel, c){
    var o = audio.createOscillator(); o.type="sine";
    o.frequency.setValueAtTime(c[0]*1.12, t);
    o.frequency.exponentialRampToValueAtTime(c[0]*c[2], t+0.03);
    var g = audio.createGain(); env(g, t, 0.6*vel, c[1], 0.002);
    o.connect(g); out(g); o.start(t); o.stop(t+c[1]+0.1);
    noiseHit(t, vel, "bandpass", c[0]*4, 2, 0.08, 0.015);
  }
  /* Cymbals: an inharmonic bank of squares, plus a noise wash for the crash. */
  function cymVoice(t, vel, k, ratios){
    var mix = audio.createGain(), i, o; mix.gain.value = 0.22;
    for(i=0;i<ratios.length;i++){
      o = audio.createOscillator(); o.type="square"; o.frequency.value = k.base*ratios[i];
      o.connect(mix); o.start(t); o.stop(t+k.dec+0.1);
    }
    if(k.noise){
      var s = noise(), ng = audio.createGain(); ng.gain.value = k.noise*0.5;
      s.connect(ng); ng.connect(mix); s.start(t); s.stop(t+k.dec+0.1);
    }
    var f = audio.createBiquadFilter(); f.type="highpass"; f.frequency.value=k.hp;
    var g = audio.createGain(); env(g, t, k.amp*vel, k.dec, 0.001);
    mix.connect(f); f.connect(g); out(g);
  }
  /* Shaken things — tambourine, maracas, cabasa — are a few noise grains in
     a row through a high-pass; the spacing is what tells them apart. */
  function shakeVoice(t, vel, k){
    var n = k.bursts || 1, i;
    for(i=0;i<n;i++){
      var tt = t + i*(k.gap || 0), last = i === n-1;
      noiseHit(tt, vel, "highpass", k.hp, 0, k.amp*(last ? 1 : 0.6), last ? k.dec : 0.012, k.att || 0.001);
    }
  }

  function play(theKit, id, t, vel, target){
    id = soundIn(theKit, id);
    if(!id) return false;               /* empty pad: nothing to play */
    kit = theKit; dest = target;
    var g, o, s, f, i, k;
    if(id==="kick"){
      k = kit.kick;
      o = audio.createOscillator(); o.type=k.wave;
      o.frequency.setValueAtTime(k.f0, t);
      o.frequency.exponentialRampToValueAtTime(k.f1, t+k.sw);
      g = audio.createGain(); env(g, t, 0.9*vel, k.dec, 0.002);
      o.connect(g); out(g); o.start(t); o.stop(t+k.dec+0.15);
      if(k.click>0) noiseHit(t, vel, "highpass", 1200, 0, k.click, 0.012);
    } else if(id==="snare"){
      k = kit.snare;
      s = noise(); f = audio.createBiquadFilter(); f.type="bandpass"; f.frequency.value=k.nf; f.Q.value=k.nq;
      if(k.sweep){ f.frequency.setValueAtTime(k.nf*3, t); f.frequency.exponentialRampToValueAtTime(k.nf, t+0.12); }
      g = audio.createGain(); env(g, t, 0.45*vel, k.ndec);
      s.connect(f); f.connect(g); out(g); s.start(t); s.stop(t+k.ndec+0.1);
      for(i=0;i<k.tones.length;i++){
        var tn = k.tones[i];
        o = audio.createOscillator(); o.type="triangle"; o.frequency.setValueAtTime(tn[0]*1.3, t);
        o.frequency.exponentialRampToValueAtTime(tn[0], t+0.05);
        var g2 = audio.createGain(); env(g2, t, tn[1]*vel, tn[2]);
        o.connect(g2); out(g2); o.start(t); o.stop(t+tn[2]+0.1);
      }
    } else if(id==="clap"){
      k = kit.clap;
      for(i=0;i<k.bursts;i++){
        var last = i===k.bursts-1;
        noiseHit(t + i*k.gap, vel, "bandpass", k.bp, k.q, last?0.8:0.45, last?k.tail:0.012);
      }
    } else if(id==="rim"){
      k = kit.rim;
      o = audio.createOscillator(); o.type="triangle"; o.frequency.setValueAtTime(k.f0, t);
      o.frequency.exponentialRampToValueAtTime(k.f1, t+0.03);
      g = audio.createGain(); env(g, t, 0.5*vel, k.dec, 0.001);
      o.connect(g); out(g); o.start(t); o.stop(t+0.1);
      noiseHit(t, vel, "bandpass", k.nbp, 4, 0.3, 0.025);
    } else if(id==="ch"){
      hatVoice(t, vel, kit.hat.ch, kit.hat.amp);
    } else if(id==="ph"){
      hatVoice(t, vel, kit.hat.ph, kit.hat.amp*0.8);
    } else if(id==="oh"){
      hatVoice(t, vel, kit.hat.oh, kit.hat.amp*1.05, true);
    } else if(id==="ltom"){
      tomVoice(t, vel, 0);
    } else if(id==="mtom"){
      tomVoice(t, vel, 1);
    } else if(id==="htom"){
      tomVoice(t, vel, 2);
    } else if(id==="conga_hi"){
      congaVoice(t, vel, kit.conga.hi);
    } else if(id==="conga_lo"){
      congaVoice(t, vel, kit.conga.lo);
    } else if(id==="crash"){
      cymVoice(t, vel, kit.crash, [1,1.34,1.71,2.42,3.12,4.07,5.5]);
    } else if(id==="ride"){
      cymVoice(t, vel, kit.ride, [1,1.48,2.05,2.94,3.6,4.9]);
    } else if(id==="cowbell"){
      /* Two squares a fifth-and-a-bit apart into a band-pass: the 808 recipe. */
      k = kit.cowbell;
      var cb = audio.createGain(); cb.gain.value = 0.75;
      for(i=0;i<k.f.length;i++){
        o = audio.createOscillator(); o.type="square"; o.frequency.value = k.f[i];
        o.connect(cb); o.start(t); o.stop(t+k.dec+0.1);
      }
      f = audio.createBiquadFilter(); f.type="bandpass"; f.frequency.value=k.bp; f.Q.value=0.9;
      g = audio.createGain(); env(g, t, k.amp*vel, k.dec, 0.001);
      cb.connect(f); f.connect(g); out(g);
    } else if(id==="clave"){
      k = kit.clave;
      o = audio.createOscillator(); o.type="sine"; o.frequency.value = k.f;
      g = audio.createGain(); env(g, t, k.amp*vel, k.dec, 0.001);
      o.connect(g); out(g); o.start(t); o.stop(t+k.dec+0.05);
    } else if(id==="tamb" || id==="maracas" || id==="cabasa"){
      shakeVoice(t, vel, kit[id]);
    }
    return true;
  }
  function reset(){ openHat = null; }

  return {play:play, reset:reset};
}

root.DrumKits = {
  KITS:KITS, KIT_ORDER:KIT_ORDER, SOUND_NAMES:SOUND_NAMES,
  GM_SLOTS:GM_SLOTS, OPXY_SLOTS:OPXY_SLOTS,
  soundIn:soundIn, engine:engine
};
})(window);
