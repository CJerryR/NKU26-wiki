// Reference copy of the integrated home-ascr-story.js state table.
    var REC_Y = { x: 374.5, y: 199.6, s: 0.475, r: -50 };     // receptor in the membrane
    var DOCK_Y = { x: 355.8, y: 169.9, s: 0.475, r: -50 };    // ascr#18 bound to it
    var STF_L = { x: 595.1, y: 504.6 }, STF_R = { x: 789.2, y: 504.6 };
    var STATES = [
      /* 0 · slide 1: two signals, two kinds of nematode */
      { cam: [330, 40, 620, 660], set: {
        m3: { x: 425.8, y: 437.4, s: 0.9, o: 1, P: { x: 466.4, y: 198.5, s: 0.55 } }, m18: { x: 778.9, y: 451.7, s: 0.9, o: 1, P: { x: 779.8, y: 207.3, s: 0.55 } },
        lbl3: { x: 448, y: 296, o: 1, P: { x: 480, y: 102 } }, lbl18: { x: 812, y: 296, o: 1, P: { x: 800, y: 102 } },
        swap: { x: 630, y: 394, o: 1, P: { x: 640, y: 172, s: 0.55 } },
        wormF: { x: 168, y: 372, s: 1.05, o: 1, P: { x: 480, y: 300, s: 0.85 } }, wormP: { x: 1110, y: 372, s: 1.05, o: 1, P: { x: 800, y: 300, s: 0.85 } },
        lblF: { x: 168, y: 452, o: 1, P: { x: 480, y: 372 } }, lblP: { x: 1110, y: 452, o: 1, P: { x: 800, y: 372 } },
        barF: { x: 168, y: 540, o: 0, P: { x: 480, y: 462, s: 1.1 } }, barP: { x: 1110, y: 540, o: 0, P: { x: 800, y: 462, s: 1.1 } },
        barFi: { x: -120, sx: 0.001, o: 1 }, barPi: { x: -120, sx: 0.001, o: 1 },
        ratF: { x: 168, y: 592, o: 0, P: { x: 480, y: 520 } }, ratP: { x: 1110, y: 592, o: 0, P: { x: 800, y: 520 } },
        ask: { x: 630, y: 549, o: 0, P: { x: 640, y: 610 } },
        rec: { x: 300, y: 490, s: 0.92, o: 0 }, recD: { x: 300, y: 490, o: 0 }, recL: { x: 300, y: 490, o: 1 },
        pocket: { x: 322.7, y: 419.7, o: 1 }, mut: { x: 950, y: 296, o: 0 },
        fung: { x: 760, y: 330, s: 0.9, o: 0 }, scr: { x: 873, y: 362, s: 0.96, o: 0 },
        cell: { x: 647, y: 391, s: 0.9, o: 0 }, cellIn: { x: 640, y: 398.3, o: 1 }, bud: { x: 640, y: 398.3, o: 0 },
        nuc: { x: 685.1, y: 494.5, o: 1 }, dna: { x: 687.8, y: 504.6, o: 1 },
        prom: { x: 598, y: 504.6, o: 1 }, gene: { x: 731.9, y: 504.6, o: 1 },
        tf: mix(STF_L, { o: 1 }), tfP: { x: 12, y: -72.4, o: 0 },
        gB: { x: 492.9, y: 205.3, o: 0 }, ste20: { x: 540.9, y: 242.4, o: 0 }, mapk: { x: 674, y: 239.9, o: 0 },
        gG: { x: 662.8, y: 287, o: 0 },
        arc: { x: 567.7, y: 242, o: 0 }, sig: { x: 676, y: 300, o: 0 }, out: { x: 760, y: 440, o: 0 },
        glow: { x: 1100, y: 300, o: 0 }, lblBx: { x: 1100, y: 310, o: 0 },
        strip: { x: 260, y: 409, o: 0 }, spot: { x: 58, y: -4, o: 0 }, lblStrip: { x: 260, y: 470, o: 0 },
        box: { x: 560, y: 556, s: 0.72, o: 0 }, lblBox: { x: 560, y: 660, o: 0 },
        map: { x: 949, y: 220, s: 6, o: 0 }, ping: { x: 935, y: 250, o: 0 }
      } },
      /* 1 · the ratio */
      { cam: [330, 40, 620, 660], set: {
        barF: { o: 1, t: 420 }, barP: { o: 1, d: 120, t: 420 },
        barFi: { sx: 1, d: 220, t: 1100 }, barPi: { sx: 1, d: 360, t: 1100 },
        ratF: { o: 1, d: 950, t: 500 }, ratP: { o: 1, d: 1100, t: 500 }, ask: { o: 1, d: 1350, t: 600 }
      } },
      /* 2 · slide 2 (Morph): the molecules rise, the receptor and the fungus arrive */
      { cam: [0, 0, 1280, 720], set: {
        m3: { x: 275.7, y: 164.9, s: 0.62, t: 1100 }, m18: { x: 866.2, y: 174.8, s: 0.62, t: 1100 },
        lbl3: { x: 291, y: 66, t: 1100 }, lbl18: { x: 889, y: 66, t: 1100 },
        swap: HIDE, wormF: HIDE, wormP: HIDE, lblF: HIDE, lblP: HIDE, barF: HIDE, barP: HIDE, ratF: HIDE, ratP: HIDE, ask: HIDE,
        rec: { s: 1, o: 1, d: 300, t: 900 },
        // Reveal the upper layer only after the lower receptor has arrived.
        recD: { o: 1, d: 1200, t: 500 }, fung: { s: 1, o: 1, d: 450, t: 900 }
      } },
      /* 3 · PPT slide 1: ascr#3 slides into its pocket; 0.5 s in, the receptor's
         upper layer fades over 1 s, leaving the lower layer, the pocket and ascr#3 */
      { cam: [0, 0, 1280, 720], set: {
        fung: { o: 0, t: 500 },
        m3: { x: 322.7, y: 419.7, s: 1, via: [214, 330], t: 2000 },
        recD: { o: 0, d: 500, t: 1000 },
        lbl3: { o: 0, d: 200, t: 400 }
      } },
      /* 4 · clicks 4-6: the computer; the pocket flies to the screen and pulses */
      { cam: [0, 80, 1280, 640], set: {
        m3: { o: 0, t: 400 }, recD: { o: 1, t: 500 },
        scr: { s: 1, o: 1, t: 600 },
        pocket: { x: 950, y: 296, via: [640, 250], d: 400, t: 1400, fx: 'pulse', fxd: 1850 }
      } },
      /* 5 · clicks 7-8: the redesigned pocket goes back into the receptor */
      { cam: [0, 80, 1280, 640], set: {
        pocket: { o: 0, t: 350 },
        mut: { x: 322.7, y: 419.7, o: 1, via: [650, 470], d: 250, t: 1500, ot: 300 }
      } },
      /* 6 · ascr#18 docks into the redesigned pocket, the upper layer fades as in slide 1 */
      { cam: [0, 0, 1280, 720], set: {
        scr: { o: 0, t: 500 },
        m18: { x: 322.7, y: 419.7, s: 1, via: [600, 200], t: 2000 },
        lbl18: { o: 0, d: 200, t: 400 },
        recD: { o: 0, d: 500, t: 1000 }, recL: { o: 1 }
      } },
      /* 7 · slide 3 (Morph): the receptor shrinks to the corner, the yeast appears;
         ascr#18 waits outside, already at the size and angle it will bind with */
      { cam: [0, 0, 1080, 720], wcam: [110, 0, 1280, 720], set: {
        m18: { x: 104.1, y: 117, s: DOCK_Y.s, r: DOCK_Y.r, o: 1, from: { x: 104.1, y: 117, s: DOCK_Y.s, r: DOCK_Y.r, o: 0 }, d: 900, t: 500 },
        rec: { x: 230, y: 150, s: REC_Y.s, r: REC_Y.r, t: 1300 }, recD: { o: 1, t: 600 },
        cell: { s: 1, o: 1, d: 250, t: 1100 }
      } },
      /* 8 · into the membrane; Gpa1, Ste20 and the MAPK cascade wait underneath */
      { cam: [180, 60, 900, 660], wcam: [110, 0, 1280, 720], set: {
        rec: { x: REC_Y.x, y: REC_Y.y, t: 1200 },
        gB: { o: 1, d: 1000, t: 450 }, ste20: { o: 1, d: 1150, t: 450 }, mapk: { o: 1, d: 1300, t: 450 }
      } },
      /* 9 · ascr#18 binds (the upper layer fades), Gpa1 passes the signal to Ste20,
         Ste20 joins the MAPK cascade, and the phosphate p travels to the sTF */
      { cam: [180, 60, 900, 660], wcam: [110, 0, 1280, 720], set: {
        m18: { x: DOCK_Y.x, y: DOCK_Y.y, via: [200, 150], t: 1400 },
        recD: { o: 0, d: 400, t: 900 },
        gB: { fx: 'pulse', fxd: 1300 },
        arc: { o: 1, d: 1400, t: 400 },
        ste20: { x: 659, y: 199.2, d: 1500, t: 800 },
        mapk: { fx: 'pulse', fxd: 2300 },
        sig: { o: 1, d: 2400, t: 400 },
        gG: { x: 607.1, y: 429.5, o: 1, via: [700, 380], d: 2500, t: 1200, od: 2400, ot: 250 },
        tf: { fx: 'pulse', fxd: 3600 }
      } },
      /* 10 · the sTF, now carrying p, moves along the DNA; the pigment genes switch on */
      { cam: [180, 60, 1100, 660], wcam: [110, 0, 1280, 720], set: {
        gG: { o: 0, t: 150 }, tfP: { o: 1, t: 150 },
        tf: mix(STF_R, { d: 150, t: 1100, fx: 'pulse', fxd: 150 }),
        gene: { fx: 'pulse', fxd: 1300 },
        out: { o: 1, d: 1300, t: 600 },
        glow: { o: 1, d: 1700, t: 700 }, lblBx: { o: 1, d: 1800, t: 600 }
      } },
      /* 11 · slide 4 (Morph): the yeast shrinks and becomes the budding yeast; strip, kit and map */
      { cam: [100, 20, 1080, 690], set: {
        m18: HIDE, rec: HIDE,
        cell: { x: 290, y: 174, s: 0.34, t: 1300 },
        cellIn: { o: 0, d: 200, t: 900 }, nuc: { o: 0, d: 200, t: 700 }, bud: { o: 1, d: 200, t: 900 },
        dna: HIDE, prom: HIDE, gene: HIDE, tf: HIDE, gB: HIDE, ste20: HIDE, mapk: HIDE, gG: HIDE, sig: HIDE, arc: HIDE, out: HIDE, glow: HIDE, lblBx: HIDE,
        strip: { o: 1, d: 500, t: 600 }, lblStrip: { o: 1, d: 700, t: 500 },
        box: { o: 1, d: 700, t: 600 }, lblBox: { o: 1, d: 850, t: 500 },
        map: { o: 1, d: 900, t: 700 }
      } },
      /* 12 · clicks 1-4: onto the strip, into the kit, out to the fields */
      { cam: [100, 20, 1080, 690], set: {
        cell: { x: 314, y: 392, s: 0.12, o: 0, t: 1100, od: 600, ot: 500 },
        spot: { o: 1, d: 850, t: 450 },
        strip: { x: 548, y: 548, s: 0.42, o: 0, via: [470, 330], d: 1400, t: 1100, od: 2300, ot: 300 },
        lblStrip: { o: 0, d: 1200, t: 300 },
        box: { x: 935, y: 250, s: 0.16, o: 0, d: 2500, t: 1100, od: 3100, ot: 500, fx: 'pulse', fxd: 2300 },
        lblBox: { o: 0, d: 2400, t: 300 },
        map: { fx: 'pulse', fxd: 3400 },
        ping: { o: 1, d: 3300, t: 100, fx: 'ripple', fxd: 3420 }
      } },
      /* 13 · slide 5: the map takes Human Practices' place (computed in mapTarget) */
      { cam: [300, 60, 680, 620], set: {
        map: { dyn: true, t: 1300 }, ping: HIDE
      } }
    ];
