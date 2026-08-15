/* ============================================================
   WebToWallStreet — landing page
   Reads the progress store so a returning student is met with
   RESUME rather than START, and sees how much ground they hold.
   ============================================================ */

(function(){
  'use strict';

  var W = window.W2WS;
  if (!W || !W.DAYS) return;

  var DAYS = W.DAYS;
  var t    = W.progress.totals(DAYS);

  /* ---- stat tiles ---- */
  var stats = document.getElementById('stats');
  if (stats){
    var tiles = [
      [DAYS.length,  DAYS.length === 1 ? 'Region' : 'Regions'],
      [t.total,      'Sightings'],
      [t.done,       'Logged'],
      [t.pct + '%',  'Explored']
    ];
    stats.innerHTML = tiles.map(function(x){
      return '<div class="stat"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>';
    }).join('');
  }

  /* ---- the button changes its mind once you have started ---- */
  var btn = document.getElementById('startBtn');
  if (btn && t.done > 0){
    btn.textContent = 'RESUME TRACKING';
  }

  /* ---- ticker ---- */
  var tk = document.getElementById('tickerIn');
  if (tk && W.TICKER){
    var line = W.TICKER.map(function(s){
      return '<span>' + String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</span>';
    }).join('');
    tk.innerHTML = line + line;   // duplicated so the -50% loop is seamless
  }

})();
