
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var themeRoot=document.documentElement;
  var themeMode=themeRoot.dataset.themeMode||'system';
  var themeQuery=matchMedia('(prefers-color-scheme: dark)');
  var themeButtons=[];
  function updateTheme(mode,save){
    themeMode=mode;
    var dark=mode==='dark'||(mode==='system'&&themeQuery.matches);
    themeRoot.dataset.themeMode=mode;
    themeRoot.dataset.theme=dark?'dark':'light';
    themeButtons.forEach(function(button){
      var label=mode==='system'?'SYSTEM':mode.toUpperCase();
      var shortLabel=mode==='system'?'SYS':mode==='light'?'LGT':'DRK';
      button.dataset.themeMode=mode;
      button.setAttribute('aria-label','Theme: '+(mode==='system'?'System default':label.charAt(0)+label.slice(1).toLowerCase()));
      button.title=button.getAttribute('aria-label');
      button.querySelector('.label .d').textContent=label;
      button.querySelector('.label .m').textContent=shortLabel;
    });
    if(save){try{localStorage.setItem('portfolio-theme',mode);}catch(error){}}
  }
  function setupTheme(){
    themeButtons=[].slice.call(document.querySelectorAll('.theme-toggle'));
    updateTheme(themeMode,false);
    document.addEventListener('click',function(e){
      var button=e.target.closest && e.target.closest('.theme-toggle');
      if(!button) return;
      var modes=['system','light','dark'];
      updateTheme(modes[(modes.indexOf(themeMode)+1)%modes.length],true);
    });
    if(themeQuery.addEventListener) themeQuery.addEventListener('change',function(){if(themeMode==='system') updateTheme('system',false);});
    else if(themeQuery.addListener) themeQuery.addListener(function(){if(themeMode==='system') updateTheme('system',false);});
  }

  if(!document.getElementById('view-home')){
    setupTheme();
    var standaloneMenu=document.getElementById('menu'), standaloneBurger=document.querySelector('.burger');
    function closeStandaloneMenu(){standaloneMenu.classList.remove('open');standaloneMenu.setAttribute('aria-hidden','true');standaloneBurger.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');}
    document.addEventListener('click',function(e){
      if(e.target.closest && e.target.closest('.burger')){
        standaloneMenu.classList.add('open');standaloneMenu.setAttribute('aria-hidden','false');standaloneBurger.setAttribute('aria-expanded','true');document.body.classList.add('menu-open');
      }else if(e.target.closest && e.target.closest('.ml')) closeStandaloneMenu();
    });
    standaloneMenu.querySelector('.close').addEventListener('click',closeStandaloneMenu);
    addEventListener('keydown',function(e){if(e.key==='Escape') closeStandaloneMenu();});
    addEventListener('resize',function(){if(innerWidth>900) closeStandaloneMenu();});
    var standaloneObserver=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        entry.target.classList.add('in');
        entry.target.querySelectorAll('.hl,.w').forEach(function(highlight){highlight.classList.add('in');});
        standaloneObserver.unobserve(entry.target);
      });
    },{threshold:.2,rootMargin:'0px 0px -6% 0px'});
    document.querySelectorAll('.rv,.div').forEach(function(element){standaloneObserver.observe(element);});
    addEventListener('load',function(){requestAnimationFrame(function(){document.body.classList.add('loaded');});});
    return;
  }

  /* Mobile menu */
  var menu=document.getElementById('menu'), burger=document.querySelector('.burger');
  function openMenu(){ menu.classList.add('open'); menu.setAttribute('aria-hidden','false'); burger.setAttribute('aria-expanded','true'); document.body.classList.add('menu-open'); }
  function closeMenu(){ menu.classList.remove('open'); menu.setAttribute('aria-hidden','true'); burger.setAttribute('aria-expanded','false'); document.body.classList.remove('menu-open'); }
  document.addEventListener('click',function(e){ if(e.target.closest && e.target.closest('.burger')) openMenu(); });
  var caseNav=document.getElementById('nav-case');
  caseNav.innerHTML=document.querySelector('#view-home .nav').innerHTML;
  caseNav.querySelector('.links a').classList.add('cur');
  setupTheme();
  menu.querySelector('.close').addEventListener('click',closeMenu);
  addEventListener('keydown',function(e){ if(e.key==='Escape') closeMenu(); });
  addEventListener('resize',function(){ if(innerWidth>900) closeMenu(); });

  /* Hero intro */
  addEventListener('load', function(){ requestAnimationFrame(function(){ document.body.classList.add('loaded'); }); });

  /* Reveal on scroll (also triggers highlight wipes / divider draws) */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('.hl,.w').forEach(function(h){ h.classList.add('in'); });
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(e.target);
    });
  },{threshold:.2,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.rv,.div').forEach(function(el,i){ io.observe(el); });
  document.querySelectorAll('.row').forEach(function(r,i){ r.style.setProperty('--d', (i*.08)+'s'); });

  function countUp(el){
    if(el.dataset.done) return; el.dataset.done=1;
    var to=+el.dataset.count, suf=el.dataset.suffix||'', t0=performance.now(), dur=1400;
    (function tick(t){
      var p=Math.min((t-t0)/dur,1), v=Math.round(to*(1-Math.pow(1-p,3)));
      el.textContent=v+(p<1?'':suf); if(p<1) requestAnimationFrame(tick);
    })(t0);
  }

  /* Active nav link */
  var navLinks=[].slice.call(document.querySelectorAll('.links a'));
  var secs=['work','about','experience','interests','contact'].map(function(id){return document.getElementById(id)});
  function setActive(){
    if(document.body.dataset.view==='case') return;
    var y=scrollY+innerHeight*.35, cur=null;
    secs.forEach(function(s){ if(s.offsetTop<=y) cur=s.id; });
    navLinks.forEach(function(a){ a.classList.toggle('on', a.getAttribute('href')==='#'+cur && a.textContent!=='Credentials'); });
    document.querySelectorAll('.ml').forEach(function(a){ a.classList.toggle('on', a.dataset.sec===(cur||'top')); });
  }

  /* Image parallax inside case-study frames */
  var heroStage=document.querySelector('.stage');
  var pics=[].slice.call(document.querySelectorAll('.pic img'));
  function updateHeroZoom(){
    if(!heroStage) return;
    var scale=1;
    if(!reduce && document.body.dataset.view!=='case'){
      var progress=Math.max(0,Math.min(1,-heroStage.getBoundingClientRect().top/heroStage.offsetHeight));
      scale=1.3-progress*.3;
    }
    heroStage.style.setProperty('--hero-bg-scale',scale.toFixed(3));
  }
  function parallax(){
    pics.forEach(function(img){
      var r=img.parentNode.getBoundingClientRect();
      var p=(r.top+r.height/2-innerHeight/2)/innerHeight;
      img.style.setProperty('--py',(Math.max(-1,Math.min(1,p))*-14).toFixed(1)+'px');
    });
  }

  /* Smooth scrolling (lerped wheel + eased anchor jumps) */
  var target=scrollY, cur=scrollY, raf=null, ease=.085;
  function maxY(){ return document.documentElement.scrollHeight-innerHeight; }
  function loop(){
    cur+=(target-cur)*ease;
    if(Math.abs(target-cur)<.4){ cur=target; scrollTo(0,cur); raf=null; return; }
    scrollTo(0,cur); raf=requestAnimationFrame(loop);
  }
  function go(y){ target=Math.max(0,Math.min(maxY(),y)); if(!raf) raf=requestAnimationFrame(loop); }
  if(!reduce){
    addEventListener('wheel',function(e){
      if(e.ctrlKey||e.defaultPrevented||document.body.classList.contains('menu-open')) return;
      e.preventDefault();
      if(!raf){ cur=target=scrollY; }
      var dy=e.deltaMode===1?e.deltaY*32:e.deltaY;
      go(target+dy);
    },{passive:false});
    addEventListener('scroll',function(){ if(!raf){ cur=target=scrollY; } },{passive:true});
    addEventListener('keydown',function(){ if(raf){ cancelAnimationFrame(raf); raf=null; } });
  }
  function scrollToId(id){
    var el=id==='#top'?document.body:document.querySelector(id); if(!el) return;
    var y=id==='#top'?0:el.getBoundingClientRect().top+scrollY;
    if(reduce){ scrollTo(0,y); return; }
    cur=scrollY; ease=.06; go(y);
    setTimeout(function(){ ease=.085; },1400);
  }

  /* Views: home <-> case study (hash router) */
  var homeV=document.getElementById('view-home'), caseV=document.getElementById('view-case');
  var solaraCase=document.querySelector('.solara-case');
  var homeTitle=document.title, pending=null, lastView=null;
  function route(){
    var caseRoute=location.hash.match(/^#\/case\/([^/]+)/);
    if(caseRoute&&caseRoute[1]==='jerp'){location.replace('jerp.html');return;}
    var view=caseRoute&&caseRoute[1]==='solara'?'case':'home';
    var routeId=view==='case'?'case:solara':'home';
    homeV.hidden=view==='case'; caseV.hidden=view!=='case';
    solaraCase.hidden=view!=='case';
    document.title=view==='case'?'Solara: Natural Living — Case Study':homeTitle;
    document.body.dataset.view=view;
    if(lastView!==null && lastView!==routeId){
      if(raf){ cancelAnimationFrame(raf); raf=null; }
      scrollTo(0,0); cur=target=0;
    }
    lastView=routeId;
    if(view==='home' && pending){ var id=pending; pending=null; requestAnimationFrame(function(){ scrollToId(id); }); }
    if(!reduce) parallax(); updateHeroZoom(); setActive();
  }
  addEventListener('hashchange',route);

  document.addEventListener('click',function(e){
    var a=e.target.closest && e.target.closest('a[href^="#"]'); if(!a) return;
    var id=a.getAttribute('href');
    if(id.indexOf('#/')===0){ closeMenu(); return; }
    if(id.length<2) return;
    e.preventDefault(); closeMenu();
    if(document.body.dataset.view==='case'){ pending=id; location.hash='#/'; return; }
    scrollToId(id);
  });

  var tick=false;
  addEventListener('scroll',function(){
    if(tick) return; tick=true;
    requestAnimationFrame(function(){ setActive(); if(!reduce) parallax(); updateHeroZoom(); tick=false; });
  },{passive:true});
  route();
})();
