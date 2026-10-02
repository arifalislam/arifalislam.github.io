
(function(){
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
    addEventListener('load',function(){requestAnimationFrame(function(){document.body.classList.add('loaded');});});
    return;
  }

  /* Mobile menu */
  var menu=document.getElementById('menu'), burger=document.querySelector('.burger');
  function openMenu(){ menu.classList.add('open'); menu.setAttribute('aria-hidden','false'); burger.setAttribute('aria-expanded','true'); document.body.classList.add('menu-open'); }
  function closeMenu(){ menu.classList.remove('open'); menu.setAttribute('aria-hidden','true'); burger.setAttribute('aria-expanded','false'); document.body.classList.remove('menu-open'); }
  document.addEventListener('click',function(e){ if(e.target.closest && e.target.closest('.burger')) openMenu(); });
  setupTheme();
  menu.querySelector('.close').addEventListener('click',closeMenu);
  addEventListener('keydown',function(e){ if(e.key==='Escape') closeMenu(); });
  addEventListener('resize',function(){ if(innerWidth>900) closeMenu(); });

  /* Hero intro */
  addEventListener('load', function(){ requestAnimationFrame(function(){ document.body.classList.add('loaded'); }); });

  /* Active nav link */
  var navLinks=[].slice.call(document.querySelectorAll('.links a'));
  var secs=['work','about','experience','interests','contact'].map(function(id){return document.getElementById(id)});
  function setActive(){
    var y=scrollY+innerHeight*.35, cur=null;
    secs.forEach(function(s){ if(s.offsetTop<=y) cur=s.id; });
    navLinks.forEach(function(a){ a.classList.toggle('on', a.getAttribute('href')==='#'+cur && a.textContent!=='Credentials'); });
    document.querySelectorAll('.ml').forEach(function(a){ a.classList.toggle('on', a.dataset.sec===(cur||'top')); });
  }

  var heroStage=document.querySelector('.stage');
  function updateHeroCover(){
    if(!heroStage) return;
    var progress=Math.max(0,Math.min(1,-heroStage.getBoundingClientRect().top/heroStage.offsetHeight));
    heroStage.style.setProperty('--hero-bg-scale',(1+progress*.16).toFixed(3));
  }
  if(heroStage){
    heroStage.addEventListener('pointermove',function(e){
      if(e.pointerType!=='mouse') return;
      var rect=heroStage.getBoundingClientRect();
      var x=(e.clientX-rect.left)/rect.width-.5;
      var y=(e.clientY-rect.top)/rect.height-.5;
      heroStage.classList.add('is-hovered');
      heroStage.style.setProperty('--hero-bg-x',(x*-18).toFixed(1)+'px');
      heroStage.style.setProperty('--hero-bg-y',(y*-12).toFixed(1)+'px');
    });
    heroStage.addEventListener('pointerleave',function(){
      heroStage.classList.remove('is-hovered');
      heroStage.style.setProperty('--hero-bg-x','0px');
      heroStage.style.setProperty('--hero-bg-y','0px');
    });
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
    window.scrollTo({top:target.getBoundingClientRect().top+window.scrollY,behavior:'smooth'});
  });

  addEventListener('scroll',function(){ setActive(); updateHeroCover(); },{passive:true});
})();
