
(function(){
  var themeRoot=document.documentElement;
  themeRoot.dataset.theme='light';
  try{localStorage.removeItem('portfolio-theme');}catch(error){}
  var reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var preloader=document.getElementById('preloader');
  if(preloader&&themeRoot.dataset.preloader!=='skip'){
    var preloaderStartedAt=Date.now();
    var loadingProgress=document.getElementById('loading-progress');
    var loadingProgressBar=document.getElementById('loading-progress-bar');
    var progress=0;
    var pageLoaded=false;
    var progressTimer=setInterval(function(){
      if(progress>=100){clearInterval(progressTimer);return;}
      progress=Math.min(pageLoaded?100:90,progress+1);
      loadingProgress.textContent=String(progress).padStart(2,'0');
      loadingProgressBar.style.width=progress+'%';
      preloader.setAttribute('aria-valuenow',String(progress));
      if(progress===100){
        clearInterval(progressTimer);
        setTimeout(function(){
          preloader.classList.add('is-done');
          setTimeout(function(){preloader.remove();},750);
        },Math.max(0,750-(Date.now()-preloaderStartedAt)));
      }
    },20);
    addEventListener('load',function(){
      pageLoaded=true;
    },{once:true});
  }
  function setupInterestVideoSound(){
    var video=document.querySelector('.gallery-video-wrap video, .interest-photo--portrait video');
    var button=document.querySelector('.gallery-video-sound, .interest-video-sound');
    if(!video||!button) return;
    video.volume=.45;
    button.addEventListener('click',function(){
      video.muted=!video.muted;
      button.setAttribute('aria-pressed',String(!video.muted));
      button.setAttribute('aria-label',video.muted?'Enable video sound':'Mute video sound');
      button.textContent=video.muted?'Enable sound':'Mute sound';
      var playback=video.play();
      if(playback&&typeof playback.catch==='function'){
        playback.catch(function(error){
          button.textContent='Playback unavailable';
          button.setAttribute('aria-label','Video playback failed');
          button.title=error.message;
        });
      }
    });
  }
  setupInterestVideoSound();

  function setupScrollReveals(){
    var elements=[].slice.call(document.querySelectorAll('.rv,.div'));
    if(!elements.length) return;
    if(reduceMotion||!('IntersectionObserver' in window)){
      elements.forEach(function(element){element.classList.add('in');});
      return;
    }
    document.body.classList.add('scroll-reveal-enabled');
    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    },{threshold:.15,rootMargin:'0px 0px -5% 0px'});
    elements.forEach(function(element){observer.observe(element);});
  }

  if(!document.getElementById('view-home')){
    setupScrollReveals();
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
    addEventListener('load',function(){requestAnimationFrame(function(){document.body.classList.add('loaded');});});
    return;
  }

  /* Mobile menu */
  var menu=document.getElementById('menu'), burger=document.querySelector('.burger');
  function openMenu(){ menu.classList.add('open'); menu.setAttribute('aria-hidden','false'); burger.setAttribute('aria-expanded','true'); document.body.classList.add('menu-open'); }
  function closeMenu(){ menu.classList.remove('open'); menu.setAttribute('aria-hidden','true'); burger.setAttribute('aria-expanded','false'); document.body.classList.remove('menu-open'); }
  document.addEventListener('click',function(e){ if(e.target.closest && e.target.closest('.burger')) openMenu(); });
  setupScrollReveals();
  menu.querySelector('.close').addEventListener('click',closeMenu);
  addEventListener('keydown',function(e){ if(e.key==='Escape') closeMenu(); });
  addEventListener('resize',function(){ if(innerWidth>900) closeMenu(); });

  /* Hero intro */
  addEventListener('load', function(){ requestAnimationFrame(function(){ document.body.classList.add('loaded'); }); });

  /* Active nav link */
  var navLinks=[].slice.call(document.querySelectorAll('.links a'));
  var secs=['work','about','experience','process','gallery','interests','contact'].map(function(id){return document.getElementById(id)}).filter(Boolean);
  function setActive(){
    var y=scrollY+innerHeight*.35, cur=null;
    secs.forEach(function(s){ if(s.offsetTop<=y) cur=s.id; });
    navLinks.forEach(function(a){ a.classList.toggle('on', a.getAttribute('href')==='#'+cur && a.textContent!=='Credentials'); });
    document.querySelectorAll('.ml').forEach(function(a){ a.classList.toggle('on', a.dataset.sec===(cur||'top')); });
  }

  var heroStage=document.querySelector('.stage');
  var heroWord=document.querySelector('.xbox span');
  if(heroWord&&!reduceMotion){
    var heroWords=['Process','Design','Strategy', 'Solutions'];
    var heroWordIndex=0;
    setInterval(function(){
      heroWord.classList.add('is-changing');
      setTimeout(function(){
        heroWordIndex=(heroWordIndex+1)%heroWords.length;
        heroWord.textContent=heroWords[heroWordIndex];
        heroWord.classList.remove('is-changing');
      },250);
    },3200);
  }
  function updateHeroCover(){
    if(!heroStage) return;
    var progress=Math.max(0,Math.min(1,-heroStage.getBoundingClientRect().top/heroStage.offsetHeight));
    heroStage.style.setProperty('--hero-bg-scale',(1.08+(1-progress)*.08).toFixed(3));
  }
  if(heroStage){
    if(!reduceMotion){
      heroStage.addEventListener('pointermove',function(e){
        if(e.pointerType!=='mouse') return;
        var rect=heroStage.getBoundingClientRect();
        var x=(e.clientX-rect.left)/rect.width-.5;
        var y=(e.clientY-rect.top)/rect.height-.5;
        heroStage.style.setProperty('--hero-bg-x',(x*-26).toFixed(1)+'px');
        heroStage.style.setProperty('--hero-bg-y',(y*-18).toFixed(1)+'px');
      });
      heroStage.addEventListener('pointerleave',function(){
        heroStage.style.setProperty('--hero-bg-x','0px');
        heroStage.style.setProperty('--hero-bg-y','0px');
      });
    }
    updateHeroCover();
  }

  document.addEventListener('click',function(e){
    var a=e.target.closest && e.target.closest('a[href^="#"]');
    if(!a) return;
    var href=a.getAttribute('href');
    if(href.length<2) return;
    var target=document.getElementById(href.slice(1));
    if(!target) return;
    e.preventDefault();
    closeMenu();
    window.scrollTo({top:target.getBoundingClientRect().top+window.scrollY,behavior:reduceMotion?'auto':'smooth'});
  });

  addEventListener('scroll',function(){ setActive(); updateHeroCover(); },{passive:true});
})();
