const markets = {
  'mexico-city-es': {
    city: 'CIUDAD DE MÉXICO',
    shortCity: 'MEXICO CITY',
    locale: 'CIUDAD DE MÉXICO · MÉXICO · es-MX',
    headline: 'CORRE LIBRE',
    skyline: 'CDMX-only whitelist · Torre Latinoamericana far left · continuous lower edge',
    casting: 'Casting brief: fictional contemporary CDMX runner · diverse urban casting · local review required',
    description: 'Torre Latinoamericana + Monumento a la Revolución. A new fictional runner, Spanish-Mexico draft copy, and city-specific silhouette remain linked to the strategist brief and human review.'
  },
  'sydney-en': {
    city: 'SYDNEY',
    shortCity: 'SYDNEY',
    locale: 'SYDNEY · AUSTRALIA · en-AU',
    headline: 'RUN FREE',
    skyline: 'Sydney-only whitelist · Opera House far left · continuous lower edge',
    casting: 'Casting brief: fictional contemporary Sydney runner · multicultural urban casting · local review required',
    description: 'Sydney Opera House + Harbour Bridge. A new fictional runner, Australian-English copy, and harbour silhouette are preserved as separate inspectable assets.'
  },
  'shanghai-zh': {
    city: '上海',
    shortCity: 'SHANGHAI',
    locale: '上海 · 中国 · zh-CN',
    headline: '自由奔跑',
    skyline: 'Shanghai-only whitelist · Shanghai Tower far left · continuous lower edge',
    casting: 'Casting brief: fictional contemporary Shanghai runner · cosmopolitan urban casting · local review required',
    description: 'Shanghai Tower + Oriental Pearl Tower. A new fictional runner, Simplified-Chinese copy, and Pudong silhouette remain editable through the final motion handoff.'
  }
};

const stages = {
  city: {
    index: '01 / 06',
    title: 'Generated city plate',
    path: id => `../assets/generated/${id}/city-plate.png`,
    note: 'The strategist erases the Seattle source skyline, closes the prompt to verified target-city landmarks, and reserves the far-left 3–22% for the signature silhouette before Comfy reinserts the crop.'
  },
  raw: {
    index: '02 / 06',
    title: 'Raw fictional runner',
    path: id => `../assets/generated/${id}/runner-raw.png`,
    note: 'A second Nano Banana Pro node generates a new fictional runner while preserving the supplied pose, crop, garment structure, and halftone treatment.'
  },
  mask: {
    index: '03 / 06',
    title: 'Foreground alpha mask',
    path: id => `../assets/processed/${id}-alpha-mask.png`,
    note: 'Recraft background removal returns a foreground mask. The workflow makes mask polarity explicit before exporting a transparent PNG.'
  },
  runner: {
    index: '04 / 06',
    title: 'Runner RGBA asset',
    path: id => `../assets/generated/${id}/runner-alpha.png`,
    note: 'The localized runner is preserved as an editable RGBA layer rather than flattened into the background.'
  },
  composite: {
    index: '05 / 06',
    title: 'Comfy validation composite',
    path: id => `../assets/generated/${id}/comfy-composite.png`,
    note: 'Comfy combines the localized runner and city plate to validate scale, silhouette, mask edges, and landmark visibility before typography.'
  },
  final: {
    index: '06 / 06',
    title: 'Agent-finished poster',
    path: id => `../exports/previews/${id}.png`,
    note: 'The agent reassembles the image layers, applies localized copy and Six Caps perimeter type, exports at native ratio, and writes the QA package.'
  }
};

const packageAssets = [
  { index: '01', title: 'City plate', owner: 'COMFY / NANO BANANA PRO', type: 'image', path: id => `../assets/generated/${id}/city-plate.png` },
  { index: '02', title: 'Raw fictional runner', owner: 'COMFY / NANO BANANA PRO', type: 'image', path: id => `../assets/generated/${id}/runner-raw.png` },
  { index: '03', title: 'Foreground alpha mask', owner: 'COMFY / RECRAFT', type: 'image', path: id => `../assets/processed/${id}-alpha-mask.png`, className: 'asset-card--mask' },
  { index: '04', title: 'Runner RGBA', owner: 'COMFY / RECRAFT', type: 'image', path: id => `../assets/generated/${id}/runner-alpha.png`, className: 'checker' },
  { index: '05', title: 'Validation composite', owner: 'COMFY / LAYER MERGE', type: 'image', path: id => `../assets/generated/${id}/comfy-composite.png` },
  { index: '06', title: 'Finished static poster', owner: 'CODEX / GRAPHIC DESIGN', type: 'image', path: id => `../exports/previews/${id}.png`, className: 'asset-card--hero' },
  { index: '07', title: 'Locked-plate warm-up', owner: 'COMFY / KLING 3.0 + BRIA', type: 'video', path: id => `../assets/generated/${id}/runner-warmup.mp4` },
  { index: '08', title: 'Motion foreground matte', owner: 'COMFY / FOREGROUND MATTE', type: 'video', path: id => `../assets/generated/${id}/runner-motion-alpha-preview.webm`, className: 'checker' },
  { index: '09', title: 'Final motion poster', owner: 'CODEX / HYPERFRAMES', type: 'video', path: id => `../videos/nrc-localized-motion-poster/renders/${id}-motion-poster.mp4`, className: 'asset-card--hero' },
  { index: '10', title: 'Strategist handoff', owner: 'COMFY / GEMINI JSON', type: 'manifest', path: id => `../assets/generated/${id}/handoff.json` }
];

let activeMarket = 'mexico-city-es';
let activeStage = 'city';
const marketTabs = [...document.querySelectorAll('[role="tab"]')];
const stageButtons = [...document.querySelectorAll('[data-stage]')];

function setImage(selector, path, alt) {
  const image = document.querySelector(selector);
  if (!image) return;
  image.src = path;
  image.alt = alt;
}

function setVideo(selector, path, label) {
  const video = document.querySelector(selector);
  if (!video) return;
  video.src = path;
  video.setAttribute('aria-label', label);
  video.load();
}

function renderGraph() {
  const market = markets[activeMarket];
  document.querySelector('#graph-market-city').textContent = market.city;
  document.querySelector('#graph-city-input').textContent = market.city;
  document.querySelector('#graph-skyline-prompt').textContent = market.skyline;
  document.querySelector('#graph-casting-brief').textContent = market.casting;
  document.querySelector('#graph-headline').textContent = market.headline;
  document.querySelector('#graph-motion-market').textContent = market.shortCity;
  setImage('#graph-city', `../assets/generated/${activeMarket}/city-plate.png`, `${market.shortCity} localized city plate`);
  setImage('#graph-runner-raw', `../assets/generated/${activeMarket}/runner-raw.png`, `${market.shortCity} raw fictional runner generation`);
  setImage('#graph-mask', `../assets/processed/${activeMarket}-alpha-mask.png`, `${market.shortCity} runner foreground mask`);
  setImage('#graph-alpha', `../assets/generated/${activeMarket}/runner-alpha.png`, `${market.shortCity} transparent runner asset`);
  setImage('#graph-composite', `../assets/generated/${activeMarket}/comfy-composite.png`, `${market.shortCity} Comfy validation composite`);
  setImage('#graph-final', `../exports/previews/${activeMarket}.png`, `${market.shortCity} final localized poster`);
  setImage('#graph-motion-source', `../assets/generated/${activeMarket}/runner-alpha.png`, `${market.shortCity} isolated fictional runner`);
  setImage('#graph-motion-composite', `../assets/generated/${activeMarket}/comfy-composite.png`, `${market.shortCity} moving foreground reference`);
  setImage('#graph-motion-city', `../assets/generated/${activeMarket}/city-plate.png`, `${market.shortCity} locked city plate`);
  setVideo('#graph-motion-video', `../assets/generated/${activeMarket}/runner-warmup.mp4`, `${market.shortCity} runner warm-up with locked poster background`);
}

function renderInspector() {
  const market = markets[activeMarket];
  const stage = stages[activeStage];
  const path = stage.path(activeMarket);
  setImage('#stage-image', path, `${market.shortCity} ${stage.title.toLowerCase()}`);
  document.querySelector('#stage-number').textContent = stage.index;
  document.querySelector('#stage-title').textContent = stage.title;
  document.querySelector('#market-locale').textContent = market.locale;
  document.querySelector('#market-headline').textContent = market.headline;
  document.querySelector('#market-description').textContent = market.description;
  document.querySelector('#stage-note').textContent = stage.note;
  document.querySelector('#stage-download').href = path;
}

function assetMedia(asset, market, path) {
  const label = `${market.shortCity} ${asset.title.toLowerCase()}`;
  if (asset.type === 'video') {
    return `<video src="${path}" controls muted loop playsinline preload="metadata" aria-label="${label}"></video>`;
  }
  if (asset.type === 'manifest') {
    return `<div class="manifest-keys" aria-label="${label}"><span>skyline_prompt</span><span>runner_prompt</span><span>locale</span><span>copy_direction</span><span>human_review</span></div>`;
  }
  return `<a href="${path}" target="_blank"><img src="${path}" loading="lazy" alt="${label}"></a>`;
}

function renderAssetPackages() {
  const container = document.querySelector('#locale-packages');
  if (!container) return;
  container.innerHTML = Object.entries(markets).map(([id, market], marketIndex) => {
    const cards = packageAssets.map(asset => {
      const path = asset.path(id);
      const action = asset.type === 'manifest' ? 'OPEN JSON ↗' : asset.type === 'video' ? 'DOWNLOAD VIDEO ↓' : 'DOWNLOAD PNG ↓';
      return `<article class="asset-card ${asset.className || ''}">
        <div class="asset-card__top"><span>${asset.index}</span><b>${asset.owner}</b></div>
        <div class="asset-card__media">${assetMedia(asset, market, path)}</div>
        <div class="asset-card__bottom"><strong>${asset.title}</strong><a href="${path}" ${asset.type === 'manifest' ? 'target="_blank"' : 'download'}>${action}</a></div>
      </article>`;
    }).join('');
    return `<section class="locale-package" aria-labelledby="package-${id}">
      <header class="package-heading"><span>0${marketIndex + 1} / 03</span><div><p>${market.locale}</p><h3 id="package-${id}">${market.city}</h3></div><b>10 TRACEABLE ASSETS</b></header>
      <div class="asset-grid">${cards}</div>
    </section>`;
  }).join('');
}

function render() {
  renderGraph();
  renderInspector();
  marketTabs.forEach(tab => {
    const active = tab.dataset.market === activeMarket;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  stageButtons.forEach(button => {
    const active = button.dataset.stage === activeStage;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#market-viewer').setAttribute('aria-labelledby', `market-tab-${activeMarket}`);
  document.querySelector('#viewer-status').textContent = `${markets[activeMarket].shortCity}: ${stages[activeStage].title}`;
}

marketTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    activeMarket = tab.dataset.market;
    render();
  });
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % marketTabs.length;
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + marketTabs.length) % marketTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = marketTabs.length - 1;
    activeMarket = marketTabs[next].dataset.market;
    render();
    marketTabs[next].focus();
  });
});

stageButtons.forEach(button => button.addEventListener('click', () => {
  activeStage = button.dataset.stage;
  render();
}));

renderAssetPackages();
render();
