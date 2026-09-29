(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var menuToggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav');

  function closeMenu(){
    if(!menuToggle) return;
    menuToggle.setAttribute('aria-expanded','false');
    nav.classList.remove('open');
  }

  if(menuToggle){
    menuToggle.addEventListener('click',function(){
      var open=menuToggle.getAttribute('aria-expanded')!=='true';
      menuToggle.setAttribute('aria-expanded',String(open));
      nav.classList.toggle('open',open);
    });
    document.querySelectorAll('.links a').forEach(function(a){a.addEventListener('click',closeMenu);});
    addEventListener('keydown',function(e){if(e.key==='Escape') closeMenu();});
  }

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
  var secs=['work','about','experience','contact'].map(function(id){return document.getElementById(id)});
  function setActive(){
    var y=scrollY+innerHeight*.35, cur=null;
    secs.forEach(function(s){ if(s.offsetTop<=y) cur=s.id; });
    navLinks.forEach(function(a){ a.classList.toggle('on', a.getAttribute('href')==='#'+cur && a.textContent!=='Credentials'); });
  }

  /* Image parallax inside case-study frames */
  var pics=[].slice.call(document.querySelectorAll('.pic img'));
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
      if(e.ctrlKey||e.defaultPrevented) return;
      e.preventDefault();
      if(!raf){ cur=target=scrollY; }
      var dy=e.deltaMode===1?e.deltaY*32:e.deltaY;
      go(target+dy);
    },{passive:false});
    addEventListener('scroll',function(){ if(!raf){ cur=target=scrollY; } },{passive:true});
    addEventListener('keydown',function(){ if(raf){ cancelAnimationFrame(raf); raf=null; } });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=a.getAttribute('href'); if(id.length<2) return;
      var el=id==='#top'?document.body:document.querySelector(id); if(!el) return;
      e.preventDefault();
      var y=id==='#top'?0:el.getBoundingClientRect().top+scrollY;
      if(reduce){ scrollTo(0,y); return; }
      cur=scrollY; ease=.06; go(y);
      setTimeout(function(){ ease=.085; },1400);
    });
  });

  var tick=false;
  addEventListener('scroll',function(){
    if(tick) return; tick=true;
    requestAnimationFrame(function(){ setActive(); if(!reduce) parallax(); tick=false; });
  },{passive:true});
  setActive(); parallax();
})();
