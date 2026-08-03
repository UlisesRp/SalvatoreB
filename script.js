
(() => {
  const qs=(s,p=document)=>p.querySelector(s);
  const qsa=(s,p=document)=>[...p.querySelectorAll(s)];

  // Año
  qsa('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  // Header + progreso
  const header = qs('.site-header');
  const progress = qs('.reading-progress span');
  function onScroll(){
    if(header) header.classList.toggle('scrolled', window.scrollY > 24);
    const max = document.documentElement.scrollHeight - innerHeight;
    if(progress) progress.style.width = (max > 0 ? (scrollY/max)*100 : 0) + '%';
    qsa('[data-parallax]').forEach(el=>{
      const speed = Number(el.dataset.parallax || .015);
      const rect = el.getBoundingClientRect();
      const delta = (innerHeight/2 - (rect.top + rect.height/2))*speed;
      el.style.transform = `translate3d(0,${delta}px,0)`;
    });
  }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Menú móvil
  const toggle=qs('.menu-toggle'), nav=qs('.nav-links');
  if(toggle && nav){
    toggle.addEventListener('click',()=>{
      const open=toggle.getAttribute('aria-expanded')==='true';
      toggle.setAttribute('aria-expanded',String(!open));
      nav.classList.toggle('open',!open);
      document.body.classList.toggle('menu-open',!open);
    });
    qsa('a',nav).forEach(a=>a.addEventListener('click',()=>{
      toggle.setAttribute('aria-expanded','false'); nav.classList.remove('open'); document.body.classList.remove('menu-open');
    }));
  }

  // Reveal
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}
    });
  },{threshold:.12});
  qsa('.reveal').forEach(el=>io.observe(el));

  // Contadores
  const counters=qsa('[data-counter]');
  const cio=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el=e.target, target=Number(el.dataset.counter||0);
      const prefix=el.dataset.prefix||'', suffix=el.dataset.suffix||'';
      const start=performance.now(), duration=1100;
      const tick=now=>{
        const p=Math.min(1,(now-start)/duration);
        const eased=1-Math.pow(1-p,3);
        el.textContent=prefix+Math.round(target*eased)+suffix;
        if(p<1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick); cio.unobserve(el);
    });
  },{threshold:.5});
  counters.forEach(el=>cio.observe(el));

  // Projects browser
  const list=qs('#project-list');
  const data=window.SALVATORE_PROJECTS;
  if(list && Array.isArray(data)){
    let active='Todos';

    const displayTitle = (p) => p.title
      .replace(/\s*\((?:ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|mayo|201\d|202\d).*?\)\s*$/i,'')
      .replace('|',' · ');

    function render(){
      const items = active==='Todos' ? data : data.filter(p=>p.category===active);
      list.innerHTML=items.map(p=>`
        <article class="project-row reveal visible" id="project-${p.id}" data-project="${p.id}" tabindex="0">
          <div class="project-id">${String(p.id).padStart(2,'0')}</div>
          <div class="project-title"><h2>${displayTitle(p)}</h2><p>${p.company || ''} · ${p.role || ''}</p></div>
          <div class="project-cat">${p.category}</div>
          <div class="project-arrow">↗</div>
        </article>`).join('');
    }
    render();

    qsa('.filter').forEach(btn=>btn.addEventListener('click',()=>{
      qsa('.filter').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); active=btn.dataset.filter; render();
    }));

    list.addEventListener('click',e=>{
      const row=e.target.closest('[data-project]');
      if(row) openProject(Number(row.dataset.project));
    });
    list.addEventListener('keydown',e=>{
      if((e.key==='Enter'||e.key===' ') && e.target.closest('[data-project]')){
        e.preventDefault(); openProject(Number(e.target.closest('[data-project]').dataset.project));
      }
    });

    const modal=qs('#project-modal');
    function openProject(id){
      const p=data.find(x=>x.id===id); if(!p||!modal) return;
      qs('.modal-category',modal).textContent=p.category;
      qs('#modal-title',modal).textContent=displayTitle(p);
      qs('.modal-company',modal).textContent=[p.company,p.role].filter(Boolean).join(' · ');
      qs('.modal-context',modal).textContent=p.context||'—';
      qs('.modal-actions',modal).textContent=p.actions||'—';
      qs('.modal-results',modal).innerHTML=(p.results||[]).map(r=>`<li>${r}</li>`).join('')||'<li>Resultado documentado en el portafolio.</li>';
      qs('.modal-skills',modal).innerHTML=(p.skills||[]).map(s=>`<span>${s}</span>`).join('');
      modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
      qs('.modal-close',modal)?.focus();
    }
    function closeProject(){
      if(!modal) return; modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow='';
    }
    qsa('[data-close-modal]',modal).forEach(el=>el.addEventListener('click',closeProject));
    addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.classList.contains('open')) closeProject();});
  }

  // Formulario -> mailto
  const form=qs('#contact-form');
  if(form){
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const fd=new FormData(form);
      const name=fd.get('name')||'', email=fd.get('email')||'', message=fd.get('message')||'';
      const subject=encodeURIComponent(`Contacto desde Digital Salvatore — ${name}`);
      const body=encodeURIComponent(`Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}`);
      location.href=`mailto:salvador.bautista@datasystem.com.mx?subject=${subject}&body=${body}`;
    });
  }

  // Evitar que placeholders naveguen al inicio
  qsa('.placeholder-link').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
})();
