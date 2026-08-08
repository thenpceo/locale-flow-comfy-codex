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

let activeMarket = 'mexico-city-es';
let activeStage = 'city';
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

function render() {
  renderGraph();
  renderInspector();
  stageButtons.forEach(button => {
    const active = button.dataset.stage === activeStage;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#viewer-status').textContent = `${markets[activeMarket].shortCity}: ${stages[activeStage].title}`;
}

stageButtons.forEach(button => button.addEventListener('click', () => {
  activeStage = button.dataset.stage;
  render();
}));

render();
