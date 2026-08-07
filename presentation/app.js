const markets = {
  'paris-fr': {
    city: 'PARIS',
    locale: 'PARIS · FRANCE · fr-FR',
    headline: 'LIBRE DE COURIR',
    skyline: 'Paris-only whitelist · Eiffel Tower far left · continuous lower edge',
    casting: 'Casting brief: fictional French runner · North African heritage · local review required',
    description: 'Eiffel Tower + Montparnasse Tower. Casting brief: a fictional French runner of North African heritage. French draft copy awaiting local review.'
  },
  'london-en': {
    city: 'LONDON',
    locale: 'LONDON · UNITED KINGDOM · en-GB',
    headline: 'RUN FREE',
    skyline: 'London-only whitelist · Elizabeth Tower far left · continuous lower edge',
    casting: 'Casting brief: fictional British South Asian runner · local review required',
    description: 'Elizabeth Tower + London Eye. Casting brief: a fictional British South Asian runner. UK-English draft copy awaiting brand review.'
  },
  'tokyo-ja': {
    city: '東京',
    locale: '東京 · 日本 · ja-JP',
    headline: '街を駆けろ',
    skyline: 'Tokyo-only whitelist · Skytree far left · continuous lower edge',
    casting: 'Casting brief: fictional Japanese runner · local review required',
    description: 'Tokyo Skytree + Tokyo Tower. Casting brief: a fictional Japanese runner. Japanese draft copy awaiting native-speaker review.'
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

let activeMarket = 'paris-fr';
let activeStage = 'city';
const marketTabs = [...document.querySelectorAll('[role="tab"]')];
const stageButtons = [...document.querySelectorAll('[data-stage]')];

function setImage(selector, path, alt) {
  const image = document.querySelector(selector);
  if (!image) return;
  image.src = path;
  image.alt = alt;
}

function renderGraph() {
  const market = markets[activeMarket];
  document.querySelector('#graph-market-city').textContent = market.city;
  document.querySelector('#graph-city-input').textContent = market.city;
  document.querySelector('#graph-skyline-prompt').textContent = market.skyline;
  document.querySelector('#graph-casting-brief').textContent = market.casting;
  document.querySelector('#graph-headline').textContent = market.headline;
  setImage('#graph-city', `../assets/generated/${activeMarket}/city-plate.png`, `${market.city} localized city plate`);
  setImage('#graph-runner-raw', `../assets/generated/${activeMarket}/runner-raw.png`, `${market.city} raw fictional runner generation`);
  setImage('#graph-mask', `../assets/processed/${activeMarket}-alpha-mask.png`, `${market.city} runner foreground mask`);
  setImage('#graph-alpha', `../assets/generated/${activeMarket}/runner-alpha.png`, `${market.city} transparent runner asset`);
  setImage('#graph-composite', `../assets/generated/${activeMarket}/comfy-composite.png`, `${market.city} Comfy validation composite`);
  setImage('#graph-final', `../exports/previews/${activeMarket}.png`, `${market.city} final localized poster`);
}

function renderInspector() {
  const market = markets[activeMarket];
  const stage = stages[activeStage];
  const path = stage.path(activeMarket);
  setImage('#stage-image', path, `${market.city} ${stage.title.toLowerCase()}`);
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
  document.querySelector('#viewer-status').textContent = `${markets[activeMarket].city}: ${stages[activeStage].title}`;
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

render();
