
// V23 — guest-first entry: never open authentication automatically.
(function(){
  const auth = document.getElementById("accountModal");
  if (auth) auth.hidden = true;
})();




const account = document.getElementById("accountModal");
const authTitle = document.getElementById("authTitle");
const authEyebrow = document.getElementById("authEyebrow");
const authCopy = document.getElementById("authCopy");
const authSubmit = document.getElementById("authSubmit");
const authSwitch = document.getElementById("authSwitch");
const signupTab = document.getElementById("signupTab");
const signinTab = document.getElementById("signinTab");
const nameField = document.getElementById("nameField");
const confirmField = document.getElementById("confirmField");
const termsRow = document.getElementById("termsRow");
const authForm = document.getElementById("authForm");
const password = document.getElementById("authPassword");
const confirm = document.getElementById("authConfirm");
const passwordToggle = document.getElementById("passwordToggle");
const forgotPassword = document.getElementById("forgotPassword");
let authMode = "signup";

function setAuthMode(mode){
  authMode = mode;
  const signup = mode === "signup";

  authEyebrow.textContent = signup ? "JOIN VOID" : "WELCOME BACK";
  authTitle.textContent = signup ? "Create account." : "Sign in.";
  authCopy.textContent = signup
    ? "Create your independent creator account and start building your own page."
    : "Sign in to access your creator profile, products, orders and dashboard.";

  signupTab.classList.toggle("active", signup);
  signinTab.classList.toggle("active", !signup);

  nameField.hidden = !signup;
  confirmField.hidden = !signup;
  termsRow.hidden = !signup;
  forgotPassword.hidden = signup;

  authSubmit.textContent = signup ? "CREATE ACCOUNT" : "SIGN IN";
  authSwitch.textContent = signup ? "SIGN IN" : "CREATE ACCOUNT";

  password.autocomplete = signup ? "new-password" : "current-password";
  confirm.autocomplete = "new-password";
  passwordToggle.textContent = "SHOW";
  password.type = "password";
  confirm.type = "password";
}

function openAuth(mode){
  account.hidden = false;
  setAuthMode(mode);
  setTimeout(() => {
    const first = mode === "signup" ? document.getElementById("authUsername") : document.getElementById("authEmail");
    first?.focus();
  }, 40);
}

// Header account actions are finalized after restoring the current user below.
// Guest: CREATE ACCOUNT opens signup. Authenticated: @username opens the creator profile.
// SIGN IN opens login for guests; authenticated SIGN OUT clears the local prototype state.
function bindHeaderAccountActions(){
  const accountBtn = document.querySelector("[data-open-signup]");
  const authBtn = document.querySelector("[data-open-signin]");
  if(!accountBtn || !authBtn) return;

  const saved = localStorage.getItem("void_user");
  let user = null;
  try { user = saved ? JSON.parse(saved) : null; } catch { user = null; }

  accountBtn.onclick = (event) => {
    event.preventDefault();
    if(user?.username){
      location.href = `profile.html?u=${encodeURIComponent(user.username)}`;
    } else {
      openAuth("signup");
    }
  };

  authBtn.onclick = (event) => {
    event.preventDefault();
    if(user?.username){
      localStorage.removeItem("void_user");
      location.reload();
    } else {
      openAuth("signin");
    }
  };
}

signupTab?.addEventListener("click",()=>setAuthMode("signup"));
signinTab?.addEventListener("click",()=>setAuthMode("signin"));
authSwitch?.addEventListener("click",()=>setAuthMode(authMode==="signup"?"signin":"signup"));

document.querySelectorAll("[data-close-account]").forEach(el=>{
  el.addEventListener("click",()=>account.hidden=true);
});

passwordToggle?.addEventListener("click",()=>{
  const visible = password.type === "text";
  password.type = visible ? "password" : "text";
  confirm.type = visible ? "password" : "text";
  passwordToggle.textContent = visible ? "SHOW" : "HIDE";
});

forgotPassword?.addEventListener("click",()=>{
  alert("Prototype: password recovery will be connected to email authentication in the backend phase.");
});

authForm?.addEventListener("submit", async (event)=>{
  event.preventDefault();

  const email = document.getElementById("authEmail").value.trim();
  const pass = password.value;

  if(!email || !pass){
    alert("Please enter your email and password.");
    return;
  }

  if(authMode === "signup"){
    const username = document.getElementById("authUsername").value.trim();
    const conf = confirm.value;
    const terms = document.getElementById("authTerms").checked;

    if(!username || !conf){
      alert("Please fill in all required fields.");
      return;
    }
    if(pass !== conf){
      alert("Passwords do not match.");
      return;
    }
    if(!terms){
      alert("Please accept the Terms of Service and Creator Guidelines.");
      return;
    }

    try{
      const response = await fetch("/api/auth/register", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({username,email,password:pass})
      });
      const data = await response.json();
      if(!response.ok) throw new Error(data.error || "Registration failed.");

      localStorage.setItem("void_user", JSON.stringify(data.user));
      account.hidden = true;
      alert(`Account created. Welcome @${data.user.username}.`);
    }catch(error){
      alert(error.message);
    }
  }else{
    try{
      const response = await fetch("/api/auth/login", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password:pass})
      });
      const data = await response.json();
      if(!response.ok) throw new Error(data.error || "Sign in failed.");

      localStorage.setItem("void_user", JSON.stringify(data.user));
      account.hidden = true;
      alert(`Welcome back, @${data.user.username}.`);
    }catch(error){
      alert(error.message);
    }
  }
});

document.addEventListener("keydown",e=>{
  if(e.key==="Escape" && !account.hidden) account.hidden=true;
});

// Existing upload demo.
document.querySelectorAll(".upload-type-grid button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".upload-type-grid button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
  });
});
document.querySelector("[data-demo-upload]")?.addEventListener("click",()=>{
  alert("Prototype: next step will be the real creator upload flow.");
});

// V24 — restore the local user display. Real authentication should later use
// a secure HttpOnly session cookie issued by the backend.
(function(){
  const saved = localStorage.getItem("void_user");
  const signup = document.querySelector("[data-open-signup]");
  const signin = document.querySelector("[data-open-signin]");

  if(!saved){
    if(signup) signup.textContent = "CREATE ACCOUNT";
    if(signin) signin.textContent = "SIGN IN";
    bindHeaderAccountActions();
    return;
  }

  try{
    const user = JSON.parse(saved);
    if(!user?.username) throw new Error("Invalid saved user");
    if(signup) signup.textContent = "@" + user.username;
    if(signin) signin.textContent = "SIGN OUT";
  }catch{
    localStorage.removeItem("void_user");
    if(signup) signup.textContent = "CREATE ACCOUNT";
    if(signin) signin.textContent = "SIGN IN";
  }

  bindHeaderAccountActions();
})();

// V25 — smooth page entry/exit for the marketplace.
document.documentElement.classList.add("page-ready");
requestAnimationFrame(() => document.body.classList.add("page-entered"));

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link || link.target === "_blank" || link.origin !== location.origin) return;
  const url = new URL(link.href);
  if (url.pathname === location.pathname && url.hash) return;
  if (url.pathname === location.pathname && !url.search) return;
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  event.preventDefault();
  document.body.classList.remove("page-entered");
  document.body.classList.add("page-leaving");
  setTimeout(() => location.href = link.href, 180);
});

// V27 — Actual / last-hour feed. Seeded with the creator's five uploaded beats and
// extended by any demo uploads saved by the upload flow. In production this should
// be backed by the server/database timestamps.
(function(){
  const root = document.getElementById('latestProducts');
  if(!root) return;

  const seedKey = 'voidLatestSeedV1';
  const seed = [
    {title:'NO TRUST', type:'BEAT', meta:'153 BPM', price:'$30+', creator:'@xgdxtcom', creatorUrl:'profile.html?u=xgdxtcom', audio:'audio/no-trust-153.mp3'},
    {title:'MASTER CARD', type:'BEAT', meta:'156 BPM', price:'$30+', creator:'@xgdxtcom', creatorUrl:'profile.html?u=xgdxtcom', audio:'audio/master-card-156.mp3'},
    {title:'FOLLOW U', type:'BEAT', meta:'200 BPM', price:'$30+', creator:'@xgdxtcom', creatorUrl:'profile.html?u=xgdxtcom', audio:'audio/follow-u-200.mp3'},
    {title:'МИШКАДЖЕКС', type:'BEAT', meta:'143 BPM', price:'$30+', creator:'@xgdxtcom', creatorUrl:'profile.html?u=xgdxtcom', audio:'audio/mishkajex-143.mp3'},
    {title:'300726', type:'BEAT', meta:'140 BPM', price:'$30+', creator:'@xgdxtcom', creatorUrl:'profile.html?u=xgdxtcom', audio:'audio/300726-140.mp3'}
  ];

  let stored = [];
  try { stored = JSON.parse(localStorage.getItem('voidLatestUploads') || '[]'); } catch(e) {}
  if(!localStorage.getItem(seedKey)){
    const now = Date.now();
    const seeded = seed.map((item,i)=>({...item, publishedAt: now - i*7*60*1000}));
    localStorage.setItem(seedKey,'1');
    stored = [...seeded, ...stored];
    localStorage.setItem('voidLatestUploads', JSON.stringify(stored));
  }

  const render = () => {
    let items=[];
    try { items=JSON.parse(localStorage.getItem('voidLatestUploads') || '[]'); } catch(e) { items=[]; }
    const cutoff=Date.now()-60*60*1000;
    items=items.filter(item=>Number(item.publishedAt)>cutoff).sort((a,b)=>Number(b.publishedAt)-Number(a.publishedAt));
    root.innerHTML = items.length ? items.map(item=>{
      const minutes=Math.max(0, Math.floor((Date.now()-Number(item.publishedAt))/60000));
      const when=minutes<1?'JUST NOW':`${minutes} MIN AGO`;
      return `<article class="product-card latest-product-card">\n        <div class="product-art">${String(item.title||'UNTITLED').replace(/\s+/, '<br>')}<span class="latest-time">${when}</span></div>\n        <div class="product-meta"><span>${item.type||'PRODUCT'}</span><span>${item.meta||''}</span></div>\n        <h3>${item.title||'Untitled product'}</h3><p>by <a href="${item.creatorUrl||'#'}"><b>${item.creator||'@creator'}</b></a></p>\n        <div class="product-bottom"><strong>${item.price||'CONTACT'}</strong><button type="button" data-latest-audio="${item.audio||''}">PREVIEW</button></div>\n      </article>`;
    }).join('') : '<div class="latest-empty">Nothing new in the last hour yet.</div>';

    root.querySelectorAll('[data-latest-audio]').forEach(btn=>btn.addEventListener('click',()=>{
      const src=btn.dataset.latestAudio; if(!src) return;
      let player=document.getElementById('latestAudioPreview');
      if(!player){
        player=document.createElement('audio'); player.id='latestAudioPreview'; player.controls=true;
        player.style.cssText='position:fixed;left:18px;right:18px;bottom:18px;z-index:50;width:calc(100% - 36px);filter:invert(1);';
        document.body.appendChild(player);
      }
      if(player.src.endsWith(src) && !player.paused){ player.pause(); btn.textContent='PREVIEW'; return; }
      root.querySelectorAll('[data-latest-audio]').forEach(b=>b.textContent='PREVIEW');
      player.src=src; player.play().catch(()=>{}); btn.textContent='PLAYING';
    }));
  };
  render();
  setInterval(render, 30000);

  window.VOID_PUBLISH_DEMO = function(item){
    const payload={...item,publishedAt:Date.now()};
    let current=[]; try{current=JSON.parse(localStorage.getItem('voidLatestUploads')||'[]')}catch(e){}
    current.unshift(payload); localStorage.setItem('voidLatestUploads',JSON.stringify(current.slice(0,100))); render();
  };
})();
