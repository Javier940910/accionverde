/* ── DB ───────────────────────────────────────────────────── */
const DB = {
  K: { users:'vpa_users', empresas:'vpa_emp', session:'vpa_sess', log:'vpa_log', retos:'vpa_retos', admins:'vpa_admins' },

  _get(k){ try{ return JSON.parse(localStorage.getItem(k)||'[]'); }catch{ return []; } },
  _set(k,v){ localStorage.setItem(k,JSON.stringify(v)); },
  _obj(k){ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch{ return null; } },

  init(){
    // seed admin
    if(!this._get(this.K.admins).length){
      this._set(this.K.admins,[{ id:'adm-1', username:'admin', password:'admin123', nombre:'Administrador Principal', role:'superadmin', createdAt:now() }]);
    }
    // seed demo user
    if(!this._get(this.K.users).length){
      const u={ id:'u-demo', nombre:'María García', email:'maria@correo.com', password:'1234', ciudad:'Bogotá', telefono:'300 123 4567', role:'usuario', status:'activo', puntos:2840, actividades:31, arboles:7, residuos:142, createdAt:now() };
      this._set(this.K.users,[u]);
    }
    // seed demo empresa
    if(!this._get(this.K.empresas).length){
      const e={ id:'e-demo', razonSocial:'EcoTech S.A.S.', nit:'900.123.456-7', email:'info@ecotech.com', password:'1234', sector:'Tecnología', ciudad:'Bogotá', telefono:'601 234 5678', website:'https://ecotech.co', role:'empresa', status:'activo', esgScore:87, esgE:91, esgS:84, esgG:78, proyectos:[
        { id:'p1', nombre:'Techo Solar Planta 1', responsable:'Ing. Ramírez', avance:73, desc:'Instalación de paneles fotovoltaicos', createdAt:now() },
        { id:'p2', nombre:'Jardín Corporativo',  responsable:'Dir. Ambiental', avance:100, desc:'Jardín nativo en sede principal', createdAt:now() },
        { id:'p3', nombre:'Cero Papel 2025',      responsable:'TI & Adm.', avance:60, desc:'Digitalización total de procesos', createdAt:now() },
      ], createdAt:now() };
      this._set(this.K.empresas,[e]);
    }
    // seed retos
    if(!this._get(this.K.retos).length){
      this._set(this.K.retos,[
        { id:'r1', titulo:'Semana sin plástico',   desc:'Evita plásticos de un solo uso durante 7 días.', puntos:300, dur:'7 días',  cat:'Consumo' },
        { id:'r2', titulo:'Huerta urbana',          desc:'Inicia tu propia huerta en casa o comunidad.',   puntos:500, dur:'30 días', cat:'Naturaleza' },
        { id:'r3', titulo:'Bicicleta al trabajo',   desc:'Usa la bicicleta para ir al trabajo 10 veces.',  puntos:200, dur:'1 mes',  cat:'Movilidad' },
        { id:'r4', titulo:'Compostaje en casa',     desc:'Aprende y aplica el compostaje de residuos.',    puntos:150, dur:'15 días', cat:'Residuos' },
        { id:'r5', titulo:'Ahorro de agua x30',     desc:'Reduce tu consumo de agua un 30% este mes.',     puntos:250, dur:'1 mes',  cat:'Agua' },
      ]);
    }
    // seed log
    if(!this._get(this.K.log).length){
      this.log('Sistema inicializado','sistema');
      this.log('Usuario demo creado: María García','usuario');
      this.log('Empresa demo creada: EcoTech S.A.S.','empresa');
    }
  },

  /* USERS */
  users(){ return this._get(this.K.users); },
  regUser(d){
    const list=this.users();
    if(list.find(u=>u.email===d.email)) return{ok:false,msg:'El correo ya está registrado.'};
    const u={ id:'u-'+Date.now(), nombre:d.nombre, email:d.email, password:d.password, ciudad:d.ciudad||'', telefono:d.telefono||'', role:'usuario', status:'pendiente', puntos:0, actividades:0, arboles:0, residuos:0, createdAt:now() };
    list.push(u); this._set(this.K.users,list);
    this.log('Nuevo usuario registrado: '+u.nombre,'usuario');
    return{ok:true,user:u};
  },
  loginUser(email,pw){ return this.users().find(u=>u.email===email&&u.password===pw)||null; },
  updUser(id,data){ const l=this.users(); const i=l.findIndex(u=>u.id===id); if(i<0)return; l[i]={...l[i],...data}; this._set(this.K.users,l); return l[i]; },
  delUser(id){ this._set(this.K.users,this.users().filter(u=>u.id!==id)); },

  /* EMPRESAS */
  empresas(){ return this._get(this.K.empresas); },
  regEmp(d){
    const list=this.empresas();
    if(list.find(e=>e.email===d.email||e.nit===d.nit)) return{ok:false,msg:'El NIT o correo ya está registrado.'};
    const e={ id:'e-'+Date.now(), razonSocial:d.razonSocial, nit:d.nit, email:d.email, password:d.password, sector:d.sector||'', ciudad:d.ciudad||'', telefono:d.telefono||'', website:d.website||'', role:'empresa', status:'pendiente', esgScore:0, esgE:0, esgS:0, esgG:0, proyectos:[], createdAt:now() };
    list.push(e); this._set(this.K.empresas,list);
    this.log('Nueva empresa registrada: '+e.razonSocial,'empresa');
    return{ok:true,empresa:e};
  },
  loginEmp(email,pw){ return this.empresas().find(e=>e.email===email&&e.password===pw)||null; },
  updEmp(id,data){ const l=this.empresas(); const i=l.findIndex(e=>e.id===id); if(i<0)return; l[i]={...l[i],...data}; this._set(this.K.empresas,l); return l[i]; },
  delEmp(id){ this._set(this.K.empresas,this.empresas().filter(e=>e.id!==id)); },

  /* ADMINS */
  admins(){ return this._get(this.K.admins); },
  loginAdmin(usr,pw){ return this.admins().find(a=>a.username===usr&&a.password===pw)||null; },
  addAdmin(d){ const l=this.admins(); if(l.find(a=>a.username===d.username))return{ok:false,msg:'Usuario ya existe.'}; l.push({id:'adm-'+Date.now(),...d,role:'admin',createdAt:now()}); this._set(this.K.admins,l); return{ok:true}; },
  delAdmin(id){ this._set(this.K.admins,this.admins().filter(a=>a.id!==id)); },

  /* SESSION */
  sess(){ return this._obj(this.K.session); },
  setSess(e){ localStorage.setItem(this.K.session,JSON.stringify(e)); },
  clearSess(){ localStorage.removeItem(this.K.session); },

  /* LOG */
  log(msg,tipo='sistema'){ const l=this._get(this.K.log); l.unshift({msg,tipo,t:now()}); if(l.length>200)l.pop(); this._set(this.K.log,l); },
  getLogs(){ return this._get(this.K.log); },

  /* RETOS */
  retos(){ return this._get(this.K.retos); },
  addReto(d){ const l=this.retos(); l.push({id:'r-'+Date.now(),...d}); this._set(this.K.retos,l); },
  delReto(id){ this._set(this.K.retos,this.retos().filter(r=>r.id!==id)); },

  /* STATS */
  stats(){
    const U=this.users(), E=this.empresas();
    return{
      users:U.length, usersActive:U.filter(u=>u.status==='activo').length, usersPending:U.filter(u=>u.status==='pendiente').length,
      emps:E.length,  empsActive:E.filter(e=>e.status==='activo').length,  empsPending:E.filter(e=>e.status==='pendiente').length,
      logs:this.getLogs().length, retos:this.retos().length,
    };
  }
};

/* ── UTILS ────────────────────────────────────────────────── */
function now(){ return new Date().toISOString(); }
function ago(iso){
  const s=(Date.now()-new Date(iso))/1000;
  if(s<60) return 'hace un momento';
  if(s<3600) return `hace ${Math.floor(s/60)} min`;
  if(s<86400) return `hace ${Math.floor(s/3600)} h`;
  return `hace ${Math.floor(s/86400)} días`;
}
function fmtDate(iso){ if(!iso)return'-'; return new Date(iso).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}); }
function initials(n=''){ return n.trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?'; }
function statusBadge(s){ return s==='activo'?'b-green':s==='pendiente'?'b-yellow':s==='suspendido'?'b-red':'b-blue'; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ── TOAST ───────────────────────────────────────────────── */
const T = {
  show(msg,type='info',ms=3400){
    const icons={ok:'✅',err:'❌',info:'ℹ️',warn:'⚠️'};
    const c=document.getElementById('toasts');
    if(!c)return;
    const el=document.createElement('div');
    el.className=`toast ${type}`;
    el.innerHTML=`<span>${icons[type]||'💬'}</span><span>${msg}</span>`;
    c.appendChild(el);
    setTimeout(()=>{ el.style.cssText='opacity:0;transition:opacity .35s'; setTimeout(()=>el.remove(),380); },ms);
  },
  ok:  (m,ms)=>T.show(m,'ok',ms),
  err: (m,ms)=>T.show(m,'err',ms),
  info:(m,ms)=>T.show(m,'info',ms),
  warn:(m,ms)=>T.show(m,'warn',ms),
};

/* ── MODAL ───────────────────────────────────────────────── */
const M = {
  open(id){ document.getElementById(id)?.classList.remove('hide'); },
  close(id){ document.getElementById(id)?.classList.add('hide'); },
  confirm(msg,fn){
    document.getElementById('c-msg').textContent=msg;
    const btn=document.getElementById('c-yes');
    const nb=btn.cloneNode(true); btn.replaceWith(nb);
    nb.onclick=()=>{ fn(); M.close('confirm-overlay'); };
    M.open('confirm-overlay');
  }
};

/* ── VALIDATE ───────────────────────────────────────────── */
const V = {
  req(f,msg='Requerido'){ const v=f.querySelector('input,select,textarea')?.value?.trim(); if(!v){this.bad(f,msg);return false;} this.ok(f);return true; },
  email(f){ const v=f.querySelector('input')?.value?.trim(); if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){this.bad(f,'Correo inválido');return false;} this.ok(f);return true; },
  min(f,n){ const v=f.querySelector('input')?.value?.trim()?.length||0; if(v<n){this.bad(f,`Mínimo ${n} caracteres`);return false;} this.ok(f);return true; },
  match(a,b){ const va=a.querySelector('input')?.value; const vb=b.querySelector('input')?.value; if(va!==vb){this.bad(b,'No coinciden');return false;} this.ok(b);return true; },
  bad(f,m){ f.classList.add('bad'); const e=f.querySelector('.err'); if(e)e.textContent=m; },
  ok(f){ f.classList.remove('bad'); },
  clear(form){ form.querySelectorAll('.field').forEach(f=>this.ok(f)); }
};

/* ── PROGRESS ANIMATE ───────────────────────────────────── */
function animProg(){
  setTimeout(()=>{
    document.querySelectorAll('.prog-fill[data-w]').forEach(b=>{ const w=b.dataset.w; b.style.width='0'; setTimeout(()=>b.style.width=w,60); });
  },120);
}

/* ── SIDEBAR MOBILE ─────────────────────────────────────── */
function initMobile(){
  document.querySelectorAll('.mob-tog').forEach(btn=>{
    btn.onclick=()=>{
      const s=document.getElementById(btn.dataset.sb);
      const o=document.getElementById(btn.dataset.sb+'-ov');
      s?.classList.toggle('open'); o?.classList.toggle('open');
    };
  });
  document.querySelectorAll('.sb-overlay').forEach(ov=>{
    ov.onclick=()=>{ ov.classList.remove('open'); document.querySelectorAll('.sidebar').forEach(s=>s.classList.remove('open')); };
  });
}

/* ── LEAVES ─────────────────────────────────────────────── */
function initLeaves(){
  const c=document.querySelector('.leaves'); if(!c)return;
  ['🍃','🌿','🍀','🌱','🌾'].forEach((e,i)=>{
    const s=document.createElement('span');
    s.className='leaf'; s.textContent=e;
    s.style.cssText=`left:${6+i*19}%;animation-duration:${12+i*3.5}s;animation-delay:-${i*3.2}s;`;
    c.appendChild(s);
  });
}

/* ── NAV ROUTING ────────────────────────────────────────── */
function initNav(group){
  document.querySelectorAll(`.nav-item[data-g="${group}"]`).forEach(item=>{
    item.onclick=()=>{
      document.querySelectorAll(`.nav-item[data-g="${group}"]`).forEach(n=>n.classList.remove('on'));
      item.classList.add('on');
      const panel=document.getElementById('tp-'+item.dataset.t);
      document.querySelectorAll(`[id^="tp-${group}"]`).forEach(p=>p.classList.remove('on'));
      if(panel){ panel.classList.add('on'); animProg(); }
    };
  });
}

/* ── TABLE FILTER ───────────────────────────────────────── */
function filterTbl(input,tbodyId){
  const q=input.value.toLowerCase();
  document.querySelectorAll(`#${tbodyId} tr`).forEach(r=>{ r.style.display=r.textContent.toLowerCase().includes(q)?'':'none'; });
}
