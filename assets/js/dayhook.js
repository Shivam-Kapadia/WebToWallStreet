/* ============================================================
   WebToWallStreet — day-page hook
   ------------------------------------------------------------
   Connects an individual day file to the field map without
   touching that file's own CSS. Drop these four lines into any
   day page, just before </body>:

     <div id="w2wsDone" data-day="d0"></div>
     <script src="assets/js/curriculum.js"></script>
     <script src="assets/js/progress.js"></script>
     <script src="assets/js/dayhook.js"></script>

   data-day must match an id in curriculum.js. Everything else —
   the back link in the top bar, the styles, the completion
   panel — this script builds for itself.
   ============================================================ */

(function(){
  'use strict';

  var W = window.W2WS;
  if (!W || !W.DAYS || !W.progress) return;

  var host = document.getElementById('w2wsDone');
  var dayId = host ? host.getAttribute('data-day') : null;
  var day = null;
  var i;
  for (i = 0; i < W.DAYS.length; i++){
    if (W.DAYS[i].id === dayId) { day = W.DAYS[i]; break; }
  }

  var P = W.progress;

  /* ---- styles, scoped by prefix so nothing here collides ---- */
  var css =
    '.w2b{margin-left:auto;flex:none;font-family:"Press Start 2P",monospace;font-size:8px;' +
      'letter-spacing:1px;text-decoration:none;color:#5CE1E6;background:#0B2049;' +
      'border:2px solid #1B3F7A;padding:8px 10px;line-height:1.4;' +
      'transition:background .12s,border-color .12s,color .12s}' +
    '.w2b:hover,.w2b:focus-visible{background:#153B7C;border-color:#5CE1E6;color:#fff;outline:none}' +

    '.w2done{margin:52px 0 0;background:#0F2551;border:3px solid #1B3F7A;' +
      'box-shadow:4px 4px 0 0 rgba(0,0,0,.4);padding:22px 20px}' +
    '.w2done.on{border-color:#4FBF52}' +
    '.w2h{font-family:"Press Start 2P",monospace;font-size:11px;letter-spacing:1px;' +
      'color:#F2C46A;margin:0 0 12px;line-height:1.6}' +
    '.w2done.on .w2h{color:#4FBF52}' +
    '.w2bar{height:20px;background:#04122C;border:2px solid #1B3F7A;overflow:hidden;margin:0 0 8px}' +
    '.w2bar i{display:block;height:100%;width:0;background:#F2C46A;transition:width .2s steps(6,end)}' +
    '.w2done.on .w2bar i{background:#4FBF52}' +
    '.w2lab{font-family:"VT323",monospace;font-size:19px;letter-spacing:1.5px;' +
      'text-transform:uppercase;color:#7D9BD1;margin:0 0 18px}' +
    '.w2lab b{color:#D8E6FF;font-weight:400}' +
    '.w2p{font-family:"Space Grotesk",system-ui,sans-serif;font-size:16px;color:#7D9BD1;' +
      'margin:0 0 18px;line-height:1.7}' +
    '.w2row{display:flex;gap:10px;flex-wrap:wrap}' +
    '.w2btn{display:inline-block;cursor:pointer;font-family:"Press Start 2P",monospace;' +
      'font-size:9px;letter-spacing:1px;text-decoration:none;text-align:center;' +
      'color:#050E24;background:#5CE1E6;border:3px solid #5CE1E6;padding:13px 15px;' +
      'box-shadow:3px 3px 0 0 rgba(0,0,0,.4);' +
      'transition:transform .12s steps(2),background .12s,box-shadow .12s}' +
    '.w2btn:hover,.w2btn:focus-visible{background:#8CF3F7;border-color:#8CF3F7;' +
      'transform:translate(-2px,-2px);box-shadow:5px 5px 0 0 rgba(0,0,0,.4);outline:none}' +
    '.w2btn.g{color:#5CE1E6;background:transparent;border-color:#1B3F7A}' +
    '.w2btn.g:hover,.w2btn.g:focus-visible{background:#153B7C;border-color:#5CE1E6;color:#fff}' +
    /* Mobile. The second half raises the day page's OWN controls to the 44px
       touch floor (DESIGN.md §7). Injected from here rather than edited into
       three separate stylesheets — this <style> lands after theirs in <head>,
       so equal-specificity rules win on source order. */
    '@media(max-width:640px){' +
      '.w2row{flex-direction:column}' +
      '.w2btn{width:100%;padding:15px 12px;min-height:44px}' +
      '.w2h{font-size:10px}' +
      '.w2b{min-height:44px;display:inline-flex;align-items:center}' +

      'a[href="#map"],a.totop{' +
        'min-height:44px;display:inline-flex;align-items:center;padding:6px 10px;' +
      '}' +
      '.ctrl input[type=range]{height:44px}' +
      '.console button,.dbtns button,.drow button,.opt{min-height:44px}' +
      '.marker{min-height:44px}' +
    '}' +
    '@media (prefers-reduced-motion: reduce){.w2btn,.w2bar i{transition:none}' +
      '.w2btn:hover,.w2btn:focus-visible{transform:none}}';

  var st = document.createElement('style');
  st.appendChild(document.createTextNode(css));
  document.head.appendChild(st);

  /* ---- back link into whichever top bar this page uses ---- */
  var bar = document.querySelector('.topbar-in') || document.querySelector('.topbar');
  if (bar){
    var a = document.createElement('a');
    a.className = 'w2b';
    a.href = 'map.html';
    a.innerHTML = '&lt; FIELD MAP';
    bar.appendChild(a);
  }

  if (!host || !day) return;

  /* ---- completion panel ---- */
  function paint(){
    var s = P.dayStats(day);
    var no = day.day < 10 ? '0' + day.day : '' + day.day;
    var cleared = s.state === 'done';

    host.className = 'w2done' + (cleared ? ' on' : '');
    host.innerHTML =
      '<p class="w2h">' +
        (cleared ? 'REGION ' + no + ' CLEARED' : 'LOG THIS REGION') +
      '</p>' +
      '<div class="w2bar"><i style="width:' + s.pct + '%"></i></div>' +
      '<p class="w2lab"><b>' + s.done + ' / ' + s.total + '</b> sightings logged &middot; ' + s.pct + '%</p>' +
      '<p class="w2p">' +
        (cleared
          ? 'Every sighting in ' + day.region.toLowerCase() + ' is logged. It will show green on the field map. Reading it again is not the same as saying it out loud &mdash; go do that next.'
          : 'Finished reading? Mark the region explored and it turns green on the field map. You can also tick sightings off one at a time from the map dossier.') +
      '</p>' +
      '<div class="w2row">' +
        (cleared
          ? '<button class="w2btn g" type="button" data-act="clear">UNMARK REGION</button>'
          : '<button class="w2btn" type="button" data-act="done">MARK REGION EXPLORED</button>') +
        '<a class="w2btn g" href="map.html">&lt; BACK TO FIELD MAP</a>' +
      '</div>';
  }

  host.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b) return;
    P.setDay(day, b.getAttribute('data-act') === 'done');
    paint();
  });

  paint();

})();
