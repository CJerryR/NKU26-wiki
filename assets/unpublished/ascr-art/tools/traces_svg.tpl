      <svg class="as__svg" data-as-svg viewBox="0 0 1280 720" role="img" aria-labelledby="as-svg-title" focusable="false">
        <title id="as-svg-title">Schematic: from two ascarosides to a receptor, a yeast, a test strip and a map of China</title>
        <defs>
          <linearGradient id="as-mixF" x1="0" y1="0" x2="1" y2="0"><stop offset="0" class="as-stop3" /><stop offset=".56" class="as-stop3" /><stop offset=".8" class="as-stop18" /><stop offset="1" class="as-stop18" /></linearGradient>
          <linearGradient id="as-mixP" x1="0" y1="0" x2="1" y2="0"><stop offset="0" class="as-stop3" /><stop offset=".2" class="as-stop3" /><stop offset=".44" class="as-stop18" /><stop offset="1" class="as-stop18" /></linearGradient>
          <radialGradient id="as-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd84a" stop-opacity=".9" /><stop offset=".55" stop-color="#ffc21a" stop-opacity=".35" /><stop offset="1" stop-color="#ffc21a" stop-opacity="0" /></radialGradient>
          <clipPath id="as-barclip"><rect x="-120" y="-14" width="240" height="28" rx="14" /></clipPath>
          <marker id="as-tip" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1L8 5L1 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></marker>
          <!-- v8.6: the team's artwork (total_2.svg, Inkscape). Its gradients and markers, renamed ak-* -->
          {{DEFS}}
        </defs>

        <!-- ===== chapter 1: two signals, two kinds of nematode ===== -->
        <g data-o="wormF"><g data-art="worm-free"><path class="as-worm as-worm--free" d="M-100 18C-72 6-48 28-24 14C-5 4-12-30 10-34C30-38 30-6 15 4C3 12 20 28 45 18C64 11 80 18 100 8" /></g></g>
        <g data-o="wormP"><g data-art="worm-parasitic"><path class="as-worm as-worm--pp" d="M-92-40C-58-48-40-30-24-6C-10 16 8 34 36 36C58 38 76 30 94 34" /><path class="as-worm-stylet" d="M-92-40l-14-3" /></g></g>
        <text class="as-label" data-o="lblF" text-anchor="middle"><tspan x="0" dy="0">Free-living</tspan><tspan x="0" dy="1.15em">nematodes</tspan></text>
        <text class="as-label" data-o="lblP" text-anchor="middle"><tspan x="0" dy="0">Plant-parasitic</tspan><tspan x="0" dy="1.15em">nematodes</tspan></text>
        <g data-o="barF"><rect class="as-bar__track" x="-120" y="-14" width="240" height="28" rx="14" /><g clip-path="url(#as-barclip)"><g data-o="barFi"><rect x="0" y="-14" width="240" height="28" fill="url(#as-mixF)" /></g></g></g>
        <g data-o="barP"><rect class="as-bar__track" x="-120" y="-14" width="240" height="28" rx="14" /><g clip-path="url(#as-barclip)"><g data-o="barPi"><rect x="0" y="-14" width="240" height="28" fill="url(#as-mixP)" /></g></g></g>
        <text class="as-ratio" data-o="ratF" text-anchor="middle"><tspan class="as-ratio--3">ascr#3</tspan> &gt; <tspan class="as-ratio--18">ascr#18</tspan></text>
        <text class="as-ratio" data-o="ratP" text-anchor="middle"><tspan class="as-ratio--3">ascr#3</tspan> &lt; <tspan class="as-ratio--18">ascr#18</tspan></text>
        <g data-o="swap"><path class="as-swap" d="M-38-10H38M-38 10H38" marker-start="url(#as-tip)" marker-end="url(#as-tip)" /></g>
        <text class="as-q" data-o="ask" text-anchor="middle">Different ratio, different nematode?</text>

        <!-- ===== chapter 3/4: the yeast (PPT "Ste20-Gpa1-MAPK-p-sTF", slide 2), drawn first so the receptor sits on top.
             Every object is drawn round its own origin; the positions live in home-ascr-story.js. ===== -->
        <g data-o="cell">
          <g transform="translate(-647 -391)">
            <g data-o="cellIn"><g data-art="yeast-cell">{{cellIn}}</g></g>
            <g data-o="bud"><g data-art="yeast-budding">{{bud}}</g></g>
            <g data-o="nuc"><g data-art="yeast-nucleus">{{nuc}}</g></g>
            <g data-o="dna"><g data-art="dna">{{dna}}</g></g>
            <g data-o="prom"><g data-art="promoter">{{prom}}</g></g>
            <g data-o="gene"><g data-art="pigment-genes">{{gene}}</g></g>
            <g data-o="out"><path class="as-out" d="M0 0C64-6 150-50 226-120" /><path class="as-out-head" d="M206-134L240-132L226-100Z" /></g>
            <g data-o="arc"><path class="as-flow" d="M0 0C20-18 44-30 62-36" /><path class="as-flow-head" d="M53-44L70-38L57-25Z" /></g>
            <g data-o="sig"><path class="as-flow" d="M0 0C-6 40-26 82-50 106" /><path class="as-flow-head" d="M-52 92L-56 114L-36 106Z" /></g>
            <g data-o="gB"><g data-art="gpa1">{{gB}}</g><text class="as-tag" x="66" y="-36" text-anchor="middle">Gpa1</text></g>
            <g data-o="mapk"><g data-art="mapk-cascade">{{mapk}}</g><text class="as-tag" x="40" y="10">MAPK</text></g>
            <g data-o="ste20"><g data-art="ste20">{{ste20}}</g><text class="as-tag" x="0" y="-20" text-anchor="middle">Ste20</text></g>
            <g data-o="tf"><g data-art="stf">{{tf}}</g><g data-o="tfP"><g data-art="p-on-stf">{{tfP}}</g></g><text class="as-tag as-tag--ink" x="-48" y="-38" text-anchor="end">sTF</text></g>
            <g data-o="gG"><g data-art="p">{{gG}}</g></g>
          </g>
        </g>
        <g data-o="glow"><ellipse rx="140" ry="76" fill="url(#as-glow)" /></g>
        <text class="as-label as-label--gold" data-o="lblBx" text-anchor="middle">Betaxanthin</text>

        <!-- ===== chapter 2: fungus and computer (under the receptor, so the pocket shows on the screen) ===== -->
        <g data-o="fung"><g data-art="fungus">{{fung}}</g></g>
        <g data-o="scr"><g data-art="computer">
          <rect x="-169" y="-107" width="338" height="214" rx="14" class="as-scr__case" />
          <rect x="-153" y="-93" width="306" height="166" rx="6" class="as-scr__glass" />
          <path d="M-36 107L-46 128H46L36 107" class="as-scr__case" />
          <text class="as-code" x="-134" y="-58">PyMOL</text>
          <text class="as-code" x="-134" y="-24">&#8250; MD</text>
          <text class="as-code" x="-134" y="10">&#8250; docking&#8230;</text>
          <path class="as-code-line" d="M-134 40H-30M-134 56H-70" />
        </g></g>

        <!-- ===== chapter 2: the receptor, two layers (PPT slide 1). The lower layer stays; the
             upper one fades when an ascaroside comes in. The pockets sit between the two. ===== -->
        <g data-o="rec">
          <g transform="translate(-300 -490)">
            <g data-o="recL"><g data-art="receptor-lower">{{recL}}</g></g>
            <g data-o="pocket"><g data-art="receptor-ascr3">{{pocket}}</g></g>
            <g data-o="mut"><g data-art="receptor-ascr18">{{mut}}</g></g>
            <g data-o="recD"><g data-art="receptor-upper">{{recD}}</g></g>
          </g>
        </g>

        <!-- ===== molecules (top layer: they travel into the receptor). Origin = top of the ring's notch ===== -->
        <g data-o="m3"><g data-art="ascr3">{{m3}}</g></g>
        <g data-o="m18"><g data-art="ascr18">{{m18}}</g></g>
        <text class="as-mol as-mol--3" data-o="lbl3" text-anchor="middle">ascr#3</text>
        <text class="as-mol as-mol--18" data-o="lbl18" text-anchor="middle">ascr#18</text>

        <!-- ===== chapter 5: strip, kit and map ===== -->
        <g data-o="strip"><g data-art="test-strip"><path class="as-strip" d="M-118-26C-80-40-40-12 0-26S80-40 118-26V26C80 40 40 12 0 26S-80 40-118 26Z" /></g><g data-o="spot"><ellipse rx="24" ry="13" class="as-spot" /></g></g>
        <text class="as-note" data-o="lblStrip" text-anchor="middle">Freeze-dried test strip</text>
        <g data-o="box"><g data-art="kit">
          <path class="as-box__top" d="M-158-50L-108-98H158L108-50Z" /><path class="as-box__side" d="M108-50L158-98V50L108 98Z" /><rect class="as-box__front" x="-158" y="-50" width="266" height="148" />
          <text class="as-box__name" x="-25" y="34" text-anchor="middle">NemaKlear</text>
        </g></g>
        <text class="as-note" data-o="lblBox" text-anchor="middle">Packaged as a kit</text>
        <g data-o="map"><g data-art="china-map" data-as-map></g></g>
        <g data-o="ping" aria-hidden="true"><circle class="as-ping" r="14" /><circle class="as-ping" r="14" /><circle class="as-ping" r="14" /></g>
      </svg>
