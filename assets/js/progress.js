/* ============================================================
   WebToWallStreet — progress store
   ------------------------------------------------------------
   One key, one object, read once into memory. Every read after
   that is free; writes are debounced. A 40-node map doing 40
   sequential storage reads feels broken, so it never does that.

   DESIGN.md §7 forbids localStorage in *artifact* contexts, where
   it fails silently. This site is served as static files from
   GitHub Pages, where it is the right tool — but the wrapper
   still degrades to memory-only if storage is blocked (private
   mode, embedded webview, cookies disabled) so nothing throws.
   ============================================================ */

(function(){
  'use strict';

  window.W2WS = window.W2WS || {};

  var KEY = 'w2ws:progress:v1';
  var mem = null;      // in-memory copy, the source of truth while the page lives
  var ok  = true;      // does storage actually work
  var pending = null;  // debounce handle

  function blank(){ return { nodes:{}, updated:0 }; }

  function load(){
    if (mem) return mem;
    try{
      var raw = window.localStorage.getItem(KEY);
      mem = raw ? JSON.parse(raw) : blank();
      if (!mem || typeof mem !== 'object' || !mem.nodes) mem = blank();
    }catch(e){
      ok = false;
      mem = blank();
    }
    return mem;
  }

  function flush(){
    pending = null;
    if (!ok) return;
    try{
      window.localStorage.setItem(KEY, JSON.stringify(mem));
    }catch(e){
      ok = false;
    }
  }

  function save(){
    mem.updated = Date.now();
    if (pending) clearTimeout(pending);
    pending = setTimeout(flush, 180);
  }

  function key(dayId, conceptId){ return dayId + '-' + conceptId; }

  var P = {

    /* has this one concept been logged */
    has: function(dayId, conceptId){
      return !!load().nodes[key(dayId, conceptId)];
    },

    /* set explicitly; returns the new value */
    set: function(dayId, conceptId, on){
      var s = load(), k = key(dayId, conceptId);
      if (on) s.nodes[k] = 1; else delete s.nodes[k];
      save();
      return !!on;
    },

    toggle: function(dayId, conceptId){
      return P.set(dayId, conceptId, !P.has(dayId, conceptId));
    },

    /* every concept in a day at once */
    setDay: function(day, on){
      var s = load();
      day.concepts.forEach(function(c){
        var k = key(day.id, c[0]);
        if (on) s.nodes[k] = 1; else delete s.nodes[k];
      });
      save();
    },

    /* { done, total, pct, state } for one day */
    dayStats: function(day){
      var s = load(), done = 0;
      day.concepts.forEach(function(c){
        if (s.nodes[key(day.id, c[0])]) done++;
      });
      var total = day.concepts.length;
      return {
        done:  done,
        total: total,
        pct:   total ? Math.round(done / total * 100) : 0,
        state: done === 0 ? 'new' : (done === total ? 'done' : 'part')
      };
    },

    /* totals across the whole curriculum */
    totals: function(days){
      var done = 0, total = 0, regions = 0, started = 0;
      days.forEach(function(d){
        var st = P.dayStats(d);
        done  += st.done;
        total += st.total;
        if (st.state === 'done') regions++;
        if (st.state !== 'new')  started++;
      });
      return {
        done:       done,
        total:      total,
        unexplored: total - done,
        pct:        total ? Math.round(done / total * 100) : 0,
        regions:    regions,
        started:    started
      };
    },

    /* where to send someone who clicks RESUME: the first day that
       is started but unfinished, else the first untouched day,
       else the last day */
    resumeDay: function(days){
      var i, st;
      for (i = 0; i < days.length; i++){
        st = P.dayStats(days[i]);
        if (st.state === 'part') return days[i];
      }
      for (i = 0; i < days.length; i++){
        if (P.dayStats(days[i]).state === 'new') return days[i];
      }
      return days[days.length - 1];
    },

    reset: function(){
      mem = blank();
      save();
    },

    /* true when progress can actually persist */
    persists: function(){ load(); return ok; }
  };

  window.W2WS.progress = P;

})();
