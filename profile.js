const creators = {
  xgdxtcom: {
    name: "@xgdxtcom", initials: "XG", type: "PRODUCER / BEATMAKER",
    geniusVerified: true,
    geniusBio: "Boguslavskii Anton — underground voronezh producer.",
    geniusSongs: [
      ["HOODPAINSTAR", "huzzy b"],
      ["DIFFERENT", "HOFMANNITA & JDFLAG"],
      ["MAVERIK", "JDFLAG"],
      ["ОТЕЦ (DAD)", "GENE (STYLE)"],
      ["Безобразие (Outrage)", "mar3arty & Sertyevseven"],
      ["ЧЁРНЫЕ ПОЛОСЫ (BLACK LINES)", "ИНТЕРНЕТИК (INNERNETIK)"],
      ["I AM HATER", "BLVNCO"],
      ["Ты не сможешь понять меня (YУВАТАМ)", "sexluger"],
      ["ПЫТАЛСЯ ЗАВЯЗАТЬ", "—"],
      ["Mental", "—"]
    ],
    geniusUrl: "https://genius.com/artists/Xgcom",
    photo: "assets/xgdxtcom-profile.jpg",
    bio: "Independent producer building beats, textures and sound for artists.",
    stats: [["47", "BEATS"], ["12", "KITS"], ["59", "PRODUCTS"]],
    info: [
      ["ALIAS / CREDIT", "xengoocult", "Public music credits under the xengoocult name appear in indexed music listings."],
      ["PRODUCTION CREDIT", "HOLODEN — WORVEY", "A 2024 listing credits Holoden as produced by xengoocult & dawgy."],
      ["SOUND KIT", "DURAG STASH KIT", "A Pdbeats & Xengoocult kit is publicly listed with 100+ sounds, including 808s, claps, FX, hi-hats, kicks, loops, MIDI and presets."],
      ["PUBLIC PROFILE", "INDEPENDENT CREATOR", "No reliable public biographical details were found beyond music/production credits, so no private or unverified personal information is added here."]
    ],
    products: [
      ["NO TRUST", "BEAT", "153 BPM", "$30+", "audio/no-trust-153.mp3"],
      ["MASTER CARD", "BEAT", "156 BPM", "$30+", "audio/master-card-156.mp3"],
      ["FOLLOW U", "BEAT", "200 BPM", "$30+", "audio/follow-u-200.mp3"],
      ["МИШКАДЖЕКС", "BEAT", "143 BPM", "$30+", "audio/mishkajex-143.mp3"],
      ["300726", "BEAT", "140 BPM", "$30+", "audio/300726-140.mp3"]
    ]
  },
  producer02: {
    name: "@producer02", initials: "02", type: "PRODUCER",
    bio: "Dark melodic production and modern trap instrumentals.",
    stats: [["18", "BEATS"], ["4", "KITS"], ["22", "PRODUCTS"]],
    products: [["DARK MATTER", "BEAT", "140 BPM", "$25+"], ["NIGHT SHIFT", "BEAT", "148 BPM", "$25+"]]
  },
  soundlab: {
    name: "@soundlab", initials: "SL", type: "SOUND DESIGNER",
    bio: "Drums, one-shots and loop packs for independent artists.",
    stats: [["8", "KITS"], ["21", "LOOPS"], ["29", "PRODUCTS"]],
    products: [["VOID DRUMS 01", "SOUND KIT", "184 FILES", "$20"], ["VOID LOOPS 01", "LOOPS", "WAV", "$15"]]
  },
  m4rko: {
    name: "@m4rko", initials: "M4", type: "PRODUCER / ARTIST",
    bio: "Late-night loops and atmospheric production.",
    stats: [["14", "BEATS"], ["7", "LOOPS"], ["21", "PRODUCTS"]],
    products: [["AFTER HOURS", "LOOPS", "WAV", "$15"], ["4AM", "BEAT", "142 BPM", "$30+"]]
  }
};

const params = new URLSearchParams(location.search);
const key = (params.get("u") || params.get("creator") || "xgdxtcom").replace(/^@/, "").toLowerCase();
const creator = creators[key] || creators.xgdxtcom;

document.title = `VOID — ${creator.name}`;
const avatarFallback = document.getElementById("profileAvatar");
const avatarImage = document.getElementById("profileAvatarImage");
if (creator.photo && avatarImage) {
  avatarImage.src = creator.photo;
  avatarImage.alt = `${creator.name} profile photo`;
  avatarImage.hidden = false;
  avatarFallback.setAttribute("aria-label", `${creator.name} profile photo`);
} else if (avatarImage) {
  avatarImage.hidden = true;
  avatarFallback.textContent = creator.initials;
}
document.getElementById("profileType").textContent = creator.type;
document.getElementById("profileName").textContent = creator.name;
document.getElementById("profileBio").textContent = creator.bio;
const geniusRoot = document.getElementById("geniusInfo");
if (geniusRoot && creator.geniusVerified) {
  geniusRoot.innerHTML = `
    <div class="genius-head">
      <div>
        <span class="genius-badge">✓ VERIFIED ARTIST</span>
        <h3>Genius profile</h3>
        <p>${creator.geniusBio}</p>
      </div>
      <a class="text-link" href="${creator.geniusUrl}" target="_blank" rel="noopener">VIEW ON GENIUS ↗</a>
    </div>
    <div class="genius-songs">
      ${creator.geniusSongs.map(([title, artist]) => `<div class="genius-song"><strong>${title}</strong><span>${artist}</span></div>`).join("")}
    </div>
  `;
} else if (geniusRoot) {
  geniusRoot.closest(".genius-section")?.remove();
}

document.getElementById("profileStats").innerHTML = creator.stats.map(([value,label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join("");
document.getElementById("profileProducts").innerHTML = creator.products.map(([title,type,meta,price,audio]) => `
  <article class="product-card profile-product-card">
    <div class="product-art">${title.replace(/\s+/, "<br>")}<span class="latest-time">${meta}</span></div>
    <div class="product-meta"><span>${type}</span><span>${meta}</span></div>
    <h3>${title}</h3><p>by <b>${creator.name}</b></p>
    <div class="product-bottom"><strong>${price}</strong><button type="button" data-preview-audio="${audio}">PREVIEW</button></div>
  </article>
`).join("");

document.querySelectorAll("[data-preview-audio]").forEach((button)=>{
  button.addEventListener("click",()=>{
    const src=button.dataset.previewAudio;
    let player=document.getElementById("profileAudioPreview");
    if(!player){
      player=document.createElement("audio");
      player.id="profileAudioPreview";
      player.controls=true;
      player.style.cssText="position:fixed;left:18px;right:18px;bottom:18px;z-index:50;width:calc(100% - 36px);filter:invert(1);";
      document.body.appendChild(player);
    }
    if(player.src.endsWith(src) && !player.paused){ player.pause(); button.textContent="PREVIEW"; return; }
    document.querySelectorAll("[data-preview-audio]").forEach(b=>b.textContent="PREVIEW");
    player.src=src;
    player.play().catch(()=>{});
    button.textContent="PLAYING";
  });
});

// Match the marketplace's subtle page transition.
document.documentElement.classList.add("page-ready");
requestAnimationFrame(() => document.body.classList.add("page-entered"));

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link || link.target === "_blank" || link.origin !== location.origin) return;
  const url = new URL(link.href);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (url.pathname === location.pathname && url.hash) return;
  event.preventDefault();
  document.body.classList.remove("page-entered");
  document.body.classList.add("page-leaving");
  setTimeout(() => location.href = link.href, 180);
});
