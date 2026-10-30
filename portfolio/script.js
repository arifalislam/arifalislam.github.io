(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}

  /* nav border once scrolled */
  var nav=$('#nav');
  function ns(){nav.classList.toggle('is-stuck',window.scrollY>8)}
  window.addEventListener('scroll',ns,{passive:true}); ns();

  /* wordmark: letters rise in on load */
  var wm=$('#wordmark'), txt=wm.textContent;
  wm.textContent='';
  txt.split('').forEach(function(ch,i){
    var s=document.createElement('span'); s.setAttribute('aria-hidden','true');
    s.style.setProperty('--i',i); s.textContent=ch===' '?' ':ch; wm.appendChild(s);
  });

  /* nav highlights the section in view */
  var links=$$('.nav__links a[href^="#"]:not(.nav__cta)');
  if('IntersectionObserver' in window){
    var map={}; links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a});
    var spy=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        links.forEach(function(a){a.classList.remove('is-on')});
        var a=map[e.target.id]; if(a) a.classList.add('is-on');
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    ['work','capabilities','process','journal'].forEach(function(id){var el=document.getElementById(id); if(el) spy.observe(el)});
  }

  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(fine && !reduce){
    /* hero image: smooth, subtle movement opposite the pointer */
    var hero=$('.hero'), heroImg=$('.hero__photo > img');
    if(hero && heroImg){
      hero.addEventListener('pointermove',function(e){
        var r=hero.getBoundingClientRect();
        var x=((e.clientX-r.left)/r.width-.5)*18;
        var y=((e.clientY-r.top)/r.height-.5)*12;
        heroImg.style.setProperty('--hero-x',x.toFixed(2)+'px');
        heroImg.style.setProperty('--hero-y',y.toFixed(2)+'px');
      });
      hero.addEventListener('pointerleave',function(){
        heroImg.style.setProperty('--hero-x','0px');
        heroImg.style.setProperty('--hero-y','0px');
      });
    }

    /* magnetic buttons and project links */
    $$('.action,.circle').forEach(function(b){
      b.addEventListener('mousemove',function(e){
        var r=b.getBoundingClientRect(), k=b.classList.contains('circle')?.3:.14;
        b.style.transform='translate('+((e.clientX-r.left-r.width/2)*k).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*k).toFixed(1)+'px)';
      });
      b.addEventListener('mouseleave',function(){b.style.transform=''});
    });
    /* project cards: image drifts with the cursor and a View label follows it */
    var tip=$('#tip'), tx=0, ty=0, cx=0, cy=0, raf=0;
    function loop(){
      cx+=(tx-cx)*.2; cy+=(ty-cy)*.2;
      tip.style.transform='translate('+(cx+18).toFixed(1)+'px,'+(cy+18).toFixed(1)+'px)';
      raf=(Math.abs(tx-cx)>.3||Math.abs(ty-cy)>.3)?requestAnimationFrame(loop):0;
    }
    $$('.case').forEach(function(c){
      var bg=$('.bg',c);
      c.addEventListener('mouseenter',function(){tip.classList.add('on')});
      c.addEventListener('mouseleave',function(){tip.classList.remove('on');bg.style.setProperty('--tx',0);bg.style.setProperty('--ty',0)});
      c.addEventListener('mousemove',function(e){
        tx=e.clientX; ty=e.clientY; if(!raf) raf=requestAnimationFrame(loop);
        var r=c.getBoundingClientRect();
        bg.style.setProperty('--tx',(-((e.clientX-r.left)/r.width-.5)*22).toFixed(1));
        bg.style.setProperty('--ty',(-((e.clientY-r.top)/r.height-.5)*22).toFixed(1));
      });
    });
  }

  /* Oct 8 reveal system: lines, words, images, rules and the quote mark reveal as they enter */
  var rvTargets=[];
  if(!reduce && 'IntersectionObserver' in window){
    document.documentElement.classList.add('js');
    /* headings: each line slides up from a mask */
    $$('.h-xl,.cap-sec__intro h2,.big h2,.cta__title').forEach(function(h){
      var parts=h.innerHTML.split(/<br\s*\/?>/i);
      h.innerHTML=parts.map(function(t,k){return '<span class="ln2" style="--i:'+k+'"><span>'+t+'</span></span>'}).join('');
      rvTargets.push(h);
    });
    $$('.edit h2').forEach(function(h){$$('span',h).forEach(function(sp,k){var i2=$('i',sp); if(i2) i2.style.setProperty('--i',k)}); rvTargets.push(h)});
    /* quote: words slide up one after another */
    var qp=$('.quote__body blockquote p');
    if(qp){
      var words=qp.textContent.trim().split(/\s+/); qp.textContent='';
      words.forEach(function(w,k){var o=document.createElement('span'); o.className='qw'; o.style.setProperty('--w',k); var n=document.createElement('span'); n.textContent=w; o.appendChild(n); qp.appendChild(o); qp.appendChild(document.createTextNode(' '))});
      rvTargets.push(qp);
    }
    var qm=$('.quote__mark'); if(qm) rvTargets.push(qm);
    $$('.rule').forEach(function(r){rvTargets.push(r)});
    var ed=$('.edit'); if(ed) rvTargets.push(ed);
    /* image blocks clip open; their parent is watched because a clipped element is never "visible" */
    var hosts=new Map();
    $$('.case__img,.fig .ph,.color,.studio__img .ph,.art .ph').forEach(function(el,k){
      el.setAttribute('data-img','');
      var host=el.parentElement; if(!hosts.has(host)) hosts.set(host,[]); hosts.get(host).push(el);
    });
    var rio=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(!e.isIntersecting) return; e.target.classList.add('in'); rio.unobserve(e.target) });
    },{threshold:.15,rootMargin:'0px 0px -6% 0px'});
    rvTargets.forEach(function(t){rio.observe(t)});
    var hio=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(!e.isIntersecting) return; (hosts.get(e.target)||[]).forEach(function(t){t.classList.add('in')}); hio.unobserve(e.target) });
    },{threshold:.1,rootMargin:'0px 0px -6% 0px'});
    hosts.forEach(function(_,h){hio.observe(h)});

    /* nav hides while scrolling down and returns when scrolling up */
    var lastY=0;
    window.addEventListener('scroll',function(){
      var y=scrollY; nav.classList.toggle('hide',y>lastY && y>240); lastY=y;
    },{passive:true});
  }

  /* capability accordion */
  $$('.capl li').forEach(function(li){
    var b=$('button',li);
    b.addEventListener('click',function(){
      var open=li.classList.toggle('is-open');
      b.setAttribute('aria-expanded',open?'true':'false');
    });
  });

  /* stats count up once visible */
  if(!reduce && 'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return; io.unobserve(e.target);
        var el=e.target, to=+el.dataset.count, t0=performance.now();
        (function step(t){
          var p=Math.min(1,(t-t0)/1200), v=Math.round(to*(1-Math.pow(1-p,3)));
          el.textContent=(v<10?'0':'')+v;
          if(p<1) requestAnimationFrame(step);
        })(t0);
      });
    },{threshold:.6});
    $$('[data-count]').forEach(function(el){io.observe(el)});
  }

  /* copy email */
  var toast=$('#toast'), tt, copyTimer;
  function say(m){toast.textContent=m;toast.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('show')},2200)}
  function copy(){
    var mail=$('#mailAddr'), addr=mail.dataset.email||mail.textContent.trim();
    function copied(){
      clearTimeout(copyTimer);
      mail.textContent='Copied: '+addr;
      mail.classList.remove('is-copied');
      void mail.offsetWidth;
      mail.classList.add('is-copied');
      say('Copied: '+addr);
      copyTimer=setTimeout(function(){mail.textContent=addr;mail.classList.remove('is-copied')},2200);
    }
    function fb(){
      var r=document.createRange(); r.selectNodeContents(mail);
      var s=getSelection(); s.removeAllRanges(); s.addRange(r); say('Select and copy the address');
      try{if(document.execCommand('copy')) copied()}catch(e){}
    }
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(addr).then(copied,fb);
    } else fb();
  }
  $('#mailAddr').addEventListener('click',copy);
})();
