/* ============================================================
   WebToWallStreet — field map
   ------------------------------------------------------------
   Draws the territory field from W2WS.DAYS, wires the dossier
   panel, and keeps every counter in sync with the progress store.

   Islands are generated, not drawn by hand: a seeded radial
   wobble gives each day a distinct blocky coastline, and the
   whole thing is snapped to a 16-unit cell grid so it stays
   pixel-native. Adding a day needs no new artwork.
   ============================================================ */

(function(){
  'use strict';

  var W = window.W2WS;
  if (!W || !W.DAYS) return;

  var DAYS = W.DAYS;
  var P    = W.progress;

  /* ---- field geometry ---- */
  var VB_W  = 1600;
  var COLS  = 3;
  var COL_X = [280, 800, 1320];
  var ROW_Y = 285;
  var ROW_H = 430;
  var RX    = 178;   /* half-width incl. wobble stays under half the column gap, */
  var RY    = 150;   /* so neighbouring territories never fuse into one landmass */
  var CELL  = 16;

  var rows  = Math.ceil(DAYS.length / COLS);
  /* the extra sea below the last row of plates is where the radar sits */
  var VB_H  = 706 + (rows - 1) * ROW_H;

  /* ---- tiny deterministic PRNG (mulberry32) ---- */
  function rng(a){
    return function(){
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function esc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
                    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* five-pointed star — marks a region's capstone section. Shape says
     "this one matters"; colour still says how far along it is. */
  function star(cx, cy, r){
    var pts = [], i, a, rr;
    for (i = 0; i < 10; i++){
      a  = -Math.PI / 2 + i * Math.PI / 5;
      rr = (i % 2 === 0) ? r : r * 0.44;
      pts.push((cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1));
    }
    return pts.join(' ');
  }

  /* octagon points, the shape used for every marker on this site */
  function oct(cx, cy, r){
    var k = r * 0.42;
    return [
      [cx-k,   cy-r  ], [cx+k,   cy-r  ], [cx+r,   cy-k  ], [cx+r,   cy+k  ],
      [cx+k,   cy+r  ], [cx-k,   cy+r  ], [cx-r,   cy+k  ], [cx-r,   cy-k  ]
    ].map(function(p){ return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
  }

  /* ------------------------------------------------------------
     Island generation
     ------------------------------------------------------------ */
  function buildIsland(cx, cy, seed){
    var r = rng(seed);
    var a1 = r() * 6.283, a2 = r() * 6.283, a3 = r() * 6.283;
    var w1 = 0.18 + r() * 0.09;
    var w2 = 0.10 + r() * 0.06;
    var w3 = 0.05 + r() * 0.05;

    function edgeAt(th){
      return 0.94 + w1*Math.sin(3*th + a1) + w2*Math.sin(5*th + a2) + w3*Math.sin(8*th + a3);
    }
    function inside(px, py){
      var dx = (px - cx) / RX, dy = (py - cy) / RY;
      var d = Math.sqrt(dx*dx + dy*dy);
      if (d < 0.05) return true;
      return d < edgeAt(Math.atan2(dy, dx));
    }

    /* rasterise onto the cell grid */
    var i0 = Math.floor((cx - RX * 1.3) / CELL), i1 = Math.ceil((cx + RX * 1.3) / CELL);
    var j0 = Math.floor((cy - RY * 1.3) / CELL), j1 = Math.ceil((cy + RY * 1.3) / CELL);

    var cells = {};
    for (var j = j0; j <= j1; j++){
      for (var i = i0; i <= i1; i++){
        if (inside(i*CELL + CELL/2, j*CELL + CELL/2)) cells[i + ':' + j] = 1;
      }
    }

    /* a cell is shore when it is missing a 4-neighbour */
    var shore = {};
    for (var k in cells){
      var p = k.split(':'), ci = +p[0], cj = +p[1];
      if (!cells[(ci-1)+':'+cj] || !cells[(ci+1)+':'+cj] ||
          !cells[ci+':'+(cj-1)] || !cells[ci+':'+(cj+1)]) shore[k] = 1;
    }

    /* merge each row into horizontal runs so we emit ~25 rects, not ~600 */
    function runs(set){
      var out = [], jj, ii, start;
      for (jj = j0; jj <= j1; jj++){
        start = null;
        for (ii = i0; ii <= i1 + 1; ii++){
          if (set[ii + ':' + jj]){
            if (start === null) start = ii;
          } else if (start !== null){
            out.push([start*CELL, jj*CELL, (ii-start)*CELL, CELL]);
            start = null;
          }
        }
      }
      return out;
    }

    function rects(list, cls){
      return list.map(function(r){
        return '<rect class="'+cls+'" x="'+r[0]+'" y="'+r[1]+'" width="'+r[2]+'" height="'+r[3]+'"/>';
      }).join('');
    }

    return {
      svg: rects(runs(cells), 'isl-land') + rects(runs(shore), 'isl-shore'),
      inside: inside
    };
  }

  /* ------------------------------------------------------------
     Layout — serpentine trail, overridable per day
     ------------------------------------------------------------ */
  function place(day, idx){
    if (typeof day.x === 'number' && typeof day.y === 'number'){
      return { x: day.x, y: day.y };
    }
    var row = Math.floor(idx / COLS);
    var col = idx % COLS;
    if (row % 2 === 1) col = COLS - 1 - col;          // snake back on odd rows
    var r = rng((day.seed || 1) + 977);
    return {
      x: COL_X[col] + (r() - 0.5) * 56,
      y: ROW_Y + row * ROW_H + (r() - 0.5) * 44
    };
  }

  /* ------------------------------------------------------------
     Build the whole SVG
     ------------------------------------------------------------ */
  var pos = DAYS.map(place);

  function seaGrid(){
    var out = '<g class="sea-grid" aria-hidden="true">', x, y;
    for (x = 0; x <= VB_W; x += 64) out += '<line x1="'+x+'" y1="0" x2="'+x+'" y2="'+VB_H+'"/>';
    for (y = 0; y <= VB_H; y += 64) out += '<line x1="0" y1="'+y+'" x2="'+VB_W+'" y2="'+y+'"/>';
    return out + '</g>';
  }

  function routes(){
    var out = '<g aria-hidden="true">', i, a, b, mx, my, nx, ny, len;
    for (i = 0; i < pos.length - 1; i++){
      a = pos[i]; b = pos[i+1];
      mx = (a.x + b.x) / 2; my = (a.y + b.y) / 2;
      nx = -(b.y - a.y); ny = b.x - a.x;
      len = Math.sqrt(nx*nx + ny*ny) || 1;
      out += '<path class="route" d="M '+a.x.toFixed(0)+' '+a.y.toFixed(0)+
             ' Q '+(mx + nx/len*70).toFixed(0)+' '+(my + ny/len*70).toFixed(0)+
             ' '+b.x.toFixed(0)+' '+b.y.toFixed(0)+'"/>';
    }
    return out + '</g>';
  }

  /* the web pattern struck through each day pin */
  function pinWeb(cx, cy, r){
    var out = '<g class="pin-web" aria-hidden="true">', i, th;
    for (i = 0; i < 8; i++){
      th = i * Math.PI / 4;
      out += '<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx + Math.cos(th)*r*0.86).toFixed(1)+
             '" y2="'+(cy + Math.sin(th)*r*0.86).toFixed(1)+'"/>';
    }
    return out + '<polygon points="' + oct(cx, cy, r * 0.5) + '"/></g>';
  }

  function territory(day, idx){
    var p    = pos[idx];
    var isl  = buildIsland(p.x, p.y, day.seed || (idx + 1) * 17);
    var st   = P.dayStats(day);
    var r    = rng((day.seed || 1) + 313);
    var n    = day.concepts.length;
    var i, th, rad, bx, by, tries;

    /* Concept blips, ringed inside the coastline. There is always exactly one
       blip per concept — a blip that lands under the day pin gets pushed
       outward rather than dropped, so the ring is never quietly short. */
    function nearPin(x, y){
      return Math.abs(x - p.x) < 78 && Math.abs(y - p.y) < 66;
    }

    var blips = '<g aria-hidden="true">';
    for (i = 0; i < n; i++){
      th  = (i / n) * 6.283 + (day.seed || 0) * 0.11;
      rad = 0.62 + r() * 0.16;

      for (tries = 0; tries < 10; tries++){
        bx = p.x + Math.cos(th) * RX * rad;
        by = p.y + Math.sin(th) * RY * rad;
        if (nearPin(bx, by))        { rad += 0.10; continue; }  /* out of the pin */
        if (!isl.inside(bx, by))    { rad -= 0.07; continue; }  /* back onto land */
        break;
      }
      if (nearPin(bx, by)){                    /* stubborn angle — go to the coast */
        rad = 0.88;
        bx = p.x + Math.cos(th) * RX * rad;
        by = p.y + Math.sin(th) * RY * rad;
      }

      /* the last section of a region is its capstone — draw it as a star */
      var isLast = (i === n - 1);
      var on     = P.has(day.id, day.concepts[i][0]) ? ' on' : '';
      var tag    = ' data-blip="' + day.id + '-' + day.concepts[i][0] + '"';

      blips += isLast
        ? '<polygon class="blip-star' + on + '"' + tag + ' points="' + star(bx, by, 12) + '"/>'
        : '<polygon class="blip-c'    + on + '"' + tag + ' points="' + oct(bx, by, 8.5) + '"/>';
    }
    blips += '</g>';

    /* label plate under the island */
    var pw = 310, ph = 86;
    var px = p.x - pw/2, py = p.y + RY + 16;
    var dayNo = day.day < 10 ? '0' + day.day : '' + day.day;

    var plate =
      '<g aria-hidden="true">' +
        '<polygon class="plate-bg" points="' +
          [ [px+10,py], [px+pw-10,py], [px+pw,py+10], [px+pw,py+ph-10],
            [px+pw-10,py+ph], [px+10,py+ph], [px,py+ph-10], [px,py+10] ]
          .map(function(q){ return q[0].toFixed(1)+','+q[1].toFixed(1); }).join(' ') + '"/>' +
        '<text class="plate-day"  x="'+p.x+'" y="'+(py+27)+'">DAY '+dayNo+'</text>' +
        '<text class="plate-sub"  x="'+p.x+'" y="'+(py+52)+'">'+esc(day.region)+'</text>' +
        '<text class="plate-cnt"  x="'+p.x+'" y="'+(py+75)+'">'+st.done+' / '+st.total+' SIGHTINGS</text>' +
      '</g>';

    /* completion flag on a finished region */
    var flag = st.state === 'done'
      ? '<g class="flag" aria-hidden="true">' +
          '<rect x="'+(p.x+34)+'" y="'+(p.y-74)+'" width="4" height="34"/>' +
          '<polygon points="'+(p.x+38)+','+(p.y-74)+' '+(p.x+72)+','+(p.y-64)+' '+(p.x+38)+','+(p.y-54)+'"/>' +
        '</g>'
      : '';

    return '<g class="terr s-'+st.state+'" data-day="'+day.id+'" role="button" tabindex="0" ' +
             'aria-label="'+esc('Day ' + day.day + ', ' + day.region + '. ' +
                                st.done + ' of ' + st.total + ' sightings logged. Open region dossier.')+'">' +
             isl.svg +
             blips +
             '<polygon class="halo" points="' + oct(p.x, p.y, 58) + '"/>' +
             '<polygon class="pin-body" points="' + oct(p.x, p.y, 46) + '"/>' +
             pinWeb(p.x, p.y, 46) +
             '<text class="pin-num" x="'+p.x+'" y="'+p.y+'" dy=".36em">'+dayNo+'</text>' +
             flag +
             plate +
           '</g>';
  }

  function hereRing(){
    var target = P.resumeDay(DAYS);
    var idx = DAYS.indexOf(target);
    if (idx < 0) return '';
    var st = P.dayStats(target);
    if (st.state === 'done') return '';
    return '<polygon class="here" points="' + oct(pos[idx].x, pos[idx].y, 68) + '" aria-hidden="true"/>';
  }

  function render(){
    var body = DAYS.map(territory).join('');
    return '<svg class="mapsvg" viewBox="0 0 '+VB_W+' '+VB_H+'" ' +
           'preserveAspectRatio="xMidYMid meet" role="group" ' +
           'aria-label="Field map. '+DAYS.length+' regions.">' +
           seaGrid() + routes() + body + hereRing() +
           '</svg>';
  }

  /* ------------------------------------------------------------
     Dossier panel
     ------------------------------------------------------------ */
  var scrim   = document.getElementById('scrim');
  var dossier = document.getElementById('dossier');
  var dosBody = document.getElementById('dosBody');
  var dosTtl  = document.getElementById('dosTitle');
  var dosEye  = document.getElementById('dosEyebrow');
  var dosFoot = document.getElementById('dosFoot');
  var lastFocus = null;
  var openDay = null;

  function dossierHTML(day){
    var st = P.dayStats(day);
    var rows = day.concepts.map(function(c, i){
      var on = P.has(day.id, c[0]);
      var no = i + 1 < 10 ? '0' + (i + 1) : '' + (i + 1);
      return '<li class="srow' + (on ? ' on' : '') + '" data-c="'+esc(c[0])+'">' +
               '<button class="stog" type="button" data-c="'+esc(c[0])+'" ' +
                 'aria-pressed="'+on+'" ' +
                 'aria-label="'+esc((on ? 'Unlog' : 'Log') + ' sighting: ' + c[1])+'">' +
                 (on ? '&#10003;' : '') +
               '</button>' +
               '<span class="s-txt">' +
                 '<span class="s-no">' + no + '</span>' +
                 '<span class="s-t">' + esc(c[1]) + '</span>' +
                 '<span class="s-s">' + esc(c[2]) + '</span>' +
               '</span>' +
               '<a class="s-go" href="'+esc(day.file)+'#'+esc(c[0])+'" ' +
                 'aria-label="'+esc('Read: ' + c[1])+'">&gt;</a>' +
             '</li>';
    }).join('');

    return '<p class="dos-lede">' + esc(day.lede) + '</p>' +
           '<div class="bar' + (st.state === 'part' ? ' part' : '') + '">' +
             '<i style="width:' + st.pct + '%"></i>' +
           '</div>' +
           '<p class="bar-lab"><b>' + st.done + ' / ' + st.total + '</b> sightings logged &middot; ' + st.pct + '%</p>' +
           '<div class="dos-actions">' +
             '<a class="btn sm" href="' + esc(day.file) + '">ENTER REGION</a>' +
             '<button class="btn sm ghost" type="button" data-all="1">MARK ALL</button>' +
             '<button class="btn sm ghost" type="button" data-all="0">CLEAR</button>' +
           '</div>' +
           '<p class="dos-h">SIGHTINGS IN THIS REGION</p>' +
           '<ul class="slist">' + rows + '</ul>';
  }

  function openDossier(dayId){
    var day = DAYS.filter(function(d){ return d.id === dayId; })[0];
    if (!day) return;
    openDay   = day;
    lastFocus = document.activeElement;

    dosEye.textContent = 'REGION ' + (day.day < 10 ? '0' + day.day : day.day) + ' — ' + day.region;
    dosTtl.textContent = day.title;
    dosBody.innerHTML  = dossierHTML(day);
    dosFoot.innerHTML  = '<a class="btn sm" href="' + esc(day.file) + '">START THIS DAY</a>' +
                         '<button class="btn sm ghost" type="button" id="dosCloseFoot">BACK TO MAP</button>';

    scrim.classList.add('open');
    dossier.classList.add('open');
    dossier.setAttribute('aria-hidden', 'false');
    dosBody.scrollTop = 0;
    document.getElementById('dosClose').focus();
    setHash(day.id);
  }

  function closeDossier(){
    openDay = null;
    scrim.classList.remove('open');
    dossier.classList.remove('open');
    dossier.setAttribute('aria-hidden', 'true');
    setHash('');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* map.html#d1 opens that region directly — shareable, and it survives
     a reload. replaceState rather than location.hash so the page never
     jumps to an element that happens to share the id. */
  function setHash(id){
    if (!window.history || !window.history.replaceState) return;
    try{
      window.history.replaceState(null, '', id ? '#' + id : window.location.pathname);
    }catch(e){ /* file:// in some browsers refuses replaceState — harmless */ }
  }

  /* ------------------------------------------------------------
     Sync — counters, radar, chips, and the map itself
     ------------------------------------------------------------ */
  var field    = document.getElementById('field');
  var counter  = document.getElementById('counter');
  var tick     = document.getElementById('tick');
  var regionbar= document.getElementById('regionbar');
  var radarG   = document.getElementById('radarBlips');

  function paintRadar(pct){
    if (!radarG) return;
    var spots = [[84,36],[36,84],[92,74],[42,40],[60,96],[96,54]];
    var lit = Math.round(pct / 100 * spots.length);
    radarG.innerHTML = spots.map(function(s, i){
      return '<circle class="blip' + (i < lit ? ' done' : '') +
             '" cx="'+s[0]+'" cy="'+s[1]+'" r="'+(3 + (i % 2) * 0.6)+'"/>';
    }).join('');
  }

  function paintChips(){
    if (!regionbar) return;
    regionbar.innerHTML = '<span class="rb-lab">REGIONS</span>' + DAYS.map(function(d){
      var st = P.dayStats(d);
      var no = d.day < 10 ? '0' + d.day : '' + d.day;
      return '<button class="rchip s-'+st.state+'" type="button" data-day="'+d.id+'">' +
               '<b>DAY '+no+'</b> ' + esc(d.region) +
               ' <u>' + st.done + '/' + st.total + '</u>' +
             '</button>';
    }).join('');
  }

  function paintTotals(){
    var t = P.totals(DAYS);
    if (counter){
      counter.innerHTML = t.unexplored + ' SIGHTING' + (t.unexplored === 1 ? '' : 'S') + ' UNEXPLORED' +
                          '<small>' + t.done + ' of ' + t.total + ' logged &middot; ' +
                          t.regions + ' of ' + DAYS.length + ' regions cleared</small>';
    }
    if (tick){
      tick.innerHTML = 'EXPLORED: <b>' + t.pct + '%</b> &nbsp;//&nbsp; UNEXPLORED: <i>' + t.unexplored + '</i>';
    }
    paintRadar(t.pct);
  }

  function repaint(){
    var sl = field ? field.scrollLeft : 0;
    var stp = field ? field.scrollTop : 0;
    if (field) field.innerHTML = render();
    if (field){ field.scrollLeft = sl; field.scrollTop = stp; }
    paintChips();
    paintTotals();
  }

  /* toast */
  var toastEl = document.getElementById('toast');
  var toastT  = null;
  function toast(msg){
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    if (toastT) clearTimeout(toastT);
    toastT = setTimeout(function(){ toastEl.classList.remove('show'); }, 1900);
  }

  /* ------------------------------------------------------------
     Wiring
     ------------------------------------------------------------ */
  repaint();

  /* open a dossier from the map */
  if (field){
    field.addEventListener('click', function(e){
      var g = e.target.closest ? e.target.closest('.terr') : null;
      if (g && !dragMoved) openDossier(g.getAttribute('data-day'));
    });
    field.addEventListener('keydown', function(e){
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      var g = e.target.closest ? e.target.closest('.terr') : null;
      if (!g) return;
      e.preventDefault();
      openDossier(g.getAttribute('data-day'));
    });
  }

  /* open a dossier from the region strip */
  if (regionbar){
    regionbar.addEventListener('click', function(e){
      var b = e.target.closest ? e.target.closest('.rchip') : null;
      if (b) openDossier(b.getAttribute('data-day'));
    });
  }

  /* toggles inside the dossier */
  if (dosBody){
    dosBody.addEventListener('click', function(e){
      if (!openDay) return;

      var all = e.target.closest ? e.target.closest('[data-all]') : null;
      if (all){
        var on = all.getAttribute('data-all') === '1';
        P.setDay(openDay, on);
        dosBody.innerHTML = dossierHTML(openDay);
        repaint();
        toast(on ? 'REGION LOGGED' : 'REGION CLEARED');
        return;
      }

      var t = e.target.closest ? e.target.closest('.stog') : null;
      if (!t) return;
      var cid = t.getAttribute('data-c');
      var now = P.toggle(openDay.id, cid);

      /* update just this row, then refresh the derived numbers */
      var row = t.closest('.srow');
      row.classList.toggle('on', now);
      t.innerHTML = now ? '&#10003;' : '';
      t.setAttribute('aria-pressed', String(now));

      var st = P.dayStats(openDay);
      var bar = dosBody.querySelector('.bar');
      bar.classList.toggle('part', st.state === 'part');
      bar.querySelector('i').style.width = st.pct + '%';
      dosBody.querySelector('.bar-lab').innerHTML =
        '<b>' + st.done + ' / ' + st.total + '</b> sightings logged &middot; ' + st.pct + '%';

      repaint();
      if (st.state === 'done') toast('REGION CLEARED — DAY ' + openDay.day);
    });
  }

  /* close paths */
  var closeBtn = document.getElementById('dosClose');
  if (closeBtn) closeBtn.addEventListener('click', closeDossier);
  if (scrim) scrim.addEventListener('click', closeDossier);
  if (dosFoot) dosFoot.addEventListener('click', function(e){
    if (e.target && e.target.id === 'dosCloseFoot') closeDossier();
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && dossier.classList.contains('open')) closeDossier();
  });

  /* reset */
  var resetBtn = document.getElementById('resetBtn');
  if (resetBtn){
    resetBtn.addEventListener('click', function(){
      if (!window.confirm('Clear all logged sightings? This cannot be undone.')) return;
      P.reset();
      if (dossier.classList.contains('open') && openDay){
        dosBody.innerHTML = dossierHTML(openDay);
      }
      repaint();
      toast('PROGRESS CLEARED');
    });
  }

  /* resume */
  var resumeBtn = document.getElementById('resumeBtn');
  if (resumeBtn){
    resumeBtn.addEventListener('click', function(){
      openDossier(P.resumeDay(DAYS).id);
    });
  }

  /* drag to pan the field (touch already scrolls natively) */
  var dragging = false, dragMoved = false, sx = 0, sy = 0, sl = 0, stp = 0;
  if (field){
    field.addEventListener('mousedown', function(e){
      if (e.button !== 0) return;
      dragging = true; dragMoved = false;
      sx = e.clientX; sy = e.clientY;
      sl = field.scrollLeft; stp = field.scrollTop;
      field.classList.add('dragging');
    });
    window.addEventListener('mousemove', function(e){
      if (!dragging) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved = true;
      field.scrollLeft = sl - dx;
      field.scrollTop  = stp - dy;
    });
    window.addEventListener('mouseup', function(){
      if (!dragging) return;
      dragging = false;
      field.classList.remove('dragging');
      setTimeout(function(){ dragMoved = false; }, 0);
    });
  }

  /* centre the field horizontally on first paint */
  if (field){
    field.scrollLeft = Math.max(0, (field.scrollWidth - field.clientWidth) / 2);
  }

  /* arriving on map.html#d1 opens that dossier straight away */
  var fromHash = (window.location.hash || '').replace('#', '');
  if (fromHash && DAYS.some(function(d){ return d.id === fromHash; })){
    openDossier(fromHash);
  }

  /* ---- ticker ---- */
  var tk = document.getElementById('tickerIn');
  if (tk && W.TICKER){
    var line = W.TICKER.map(function(s){ return '<span>' + esc(s) + '</span>'; }).join('');
    tk.innerHTML = line + line;   // duplicated so the -50% loop is seamless
  }

  /* ---- storage warning ---- */
  if (!P.persists()){
    var note = document.getElementById('persistNote');
    if (note) note.textContent = 'HEADS UP — THIS BROWSER IS BLOCKING STORAGE, SO PROGRESS WILL NOT BE SAVED.';
  }

})();
