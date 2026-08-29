const form = document.getElementById("search-form");
const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const swapBtn = document.getElementById("swap-btn");
const citiesList = document.getElementById("cities");
const examplesEl = document.getElementById("examples");
const emptyExamplesEl = document.getElementById("empty-examples");
const resultsSection = document.getElementById("results");
const resultsTitle = document.getElementById("results-title");
const cardsEl = document.getElementById("cards");
const emptySection = document.getElementById("empty");
const loadingSection = document.getElementById("loading");
const sortTabs = document.querySelectorAll(".sort-tab");

const MODE_LABEL = { bus: "Bus", train: "Train", flight: "Flight" };

let currentOptions = [];
let currentSort = "price";

function formatDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function buildExampleChips(container) {
  container.innerHTML = "";
  listSampleRoutes().forEach(({ from, to }) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "example-chip";
    chip.textContent = `${from} → ${to}`;
    chip.addEventListener("click", () => {
      fromInput.value = from;
      toInput.value = to;
      runSearch();
    });
    container.appendChild(chip);
  });
}

function populateCityDatalist() {
  const cities = new Set();
  listSampleRoutes().forEach(({ from, to }) => { cities.add(from); cities.add(to); });
  citiesList.innerHTML = "";
  cities.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    citiesList.appendChild(opt);
  });
}

function renderCards() {
  const sorted = [...currentOptions].sort((a, b) => a[currentSort] - b[currentSort]);
  cardsEl.innerHTML = "";
  sorted.forEach((opt) => {
    const card = document.createElement("div");
    card.className = `card ${opt.mode}`;
    card.innerHTML = `
      <div class="bar"></div>
      <div class="mode-label">${MODE_LABEL[opt.mode]}</div>
      <div class="card-body">
        <div class="operator">${opt.operator}</div>
        <div class="meta">
          <span class="price">₹${opt.price.toLocaleString("en-IN")}</span>
          <span>${formatDuration(opt.duration_min)}</span>
          <span>${opt.departure} → ${opt.arrival}</span>
        </div>
      </div>
      <a class="book-btn" href="${opt.link}" target="_blank" rel="noopener">Book karein →</a>
    `;
    cardsEl.appendChild(card);
  });
}

function showLoading() {
  resultsSection.hidden = true;
  emptySection.hidden = true;
  loadingSection.hidden = false;
}

function showResults(route) {
  loadingSection.hidden = true;
  emptySection.hidden = true;
  currentOptions = route.options;
  resultsTitle.textContent = `${route.from} → ${route.to}`;
  renderCards();
  resultsSection.hidden = false;
}

function showEmpty() {
  loadingSection.hidden = true;
  resultsSection.hidden = true;
  buildExampleChips(emptyExamplesEl);
  emptySection.hidden = false;
}

async function runSearch() {
  const from = fromInput.value.trim();
  const to = toInput.value.trim();
  if (!from || !to) return;
  showLoading();
  const route = await fetchRoute(from, to);
  if (route) showResults(route);
  else showEmpty();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  runSearch();
});

swapBtn.addEventListener("click", () => {
  const tmp = fromInput.value;
  fromInput.value = toInput.value;
  toInput.value = tmp;
});

sortTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    sortTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentSort = tab.dataset.sort;
    renderCards();
  });
});

populateCityDatalist();
buildExampleChips(examplesEl);
