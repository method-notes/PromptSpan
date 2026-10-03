"use strict";

// Paper Table 2, main-method rows. MAPE percentages averaged over seeds 42/43/44.
const results = [
  { model: "qwen3", load: "1x", replicas: 2, mean: 5.705, p50: 5.455, p95: 6.211, tail: 5.833 },
  { model: "qwen3", load: "1x", replicas: 3, mean: 4.751, p50: 4.777, p95: 5.483, tail: 5.130 },
  { model: "qwen3", load: "1x", replicas: 4, mean: 4.702, p50: 4.920, p95: 5.690, tail: 5.305 },
  { model: "qwen3", load: "1.5x", replicas: 2, mean: 13.337, p50: 13.687, p95: 14.006, tail: 13.847 },
  { model: "qwen3", load: "1.5x", replicas: 3, mean: 8.942, p50: 9.225, p95: 10.238, tail: 9.732 },
  { model: "qwen3", load: "1.5x", replicas: 4, mean: 7.796, p50: 7.576, p95: 9.916, tail: 8.746 },
  { model: "deepseek", load: "1x", replicas: 2, mean: 4.074, p50: 4.424, p95: 5.396, tail: 4.910 },
  { model: "deepseek", load: "1x", replicas: 3, mean: 3.456, p50: 3.454, p95: 5.263, tail: 4.358 },
  { model: "deepseek", load: "1x", replicas: 4, mean: 3.408, p50: 3.393, p95: 4.999, tail: 4.196 },
  { model: "deepseek", load: "1.5x", replicas: 2, mean: 13.650, p50: 14.484, p95: 14.184, tail: 14.334 },
  { model: "deepseek", load: "1.5x", replicas: 3, mean: 12.119, p50: 12.155, p95: 12.478, tail: 12.316 },
  { model: "deepseek", load: "1.5x", replicas: 4, mean: 8.974, p50: 8.795, p95: 10.250, tail: 9.523 },
  { model: "ministral", load: "1x", replicas: 2, mean: 3.305, p50: 2.514, p95: 5.157, tail: 3.835 },
  { model: "ministral", load: "1x", replicas: 3, mean: 2.975, p50: 1.975, p95: 4.939, tail: 3.457 },
  { model: "ministral", load: "1x", replicas: 4, mean: 3.173, p50: 1.995, p95: 5.333, tail: 3.664 },
  { model: "ministral", load: "1.5x", replicas: 2, mean: 7.961, p50: 8.808, p95: 9.093, tail: 8.950 },
  { model: "ministral", load: "1.5x", replicas: 3, mean: 5.657, p50: 5.857, p95: 8.552, tail: 7.204 },
  { model: "ministral", load: "1.5x", replicas: 4, mean: 5.144, p50: 4.944, p95: 8.336, tail: 6.640 }
];
const names = { qwen3: "Qwen3", deepseek: "DeepSeek", ministral: "Ministral" };
const tableBody = document.querySelector("#results-body");
const modelFilter = document.querySelector("#model-filter");
const loadButtons = [...document.querySelectorAll("[data-load]")];
let selectedLoad = "1x";

function renderResults() {
  const visible = results.filter(row => row.load === selectedLoad && (modelFilter.value === "all" || row.model === modelFilter.value));
  const fragment = document.createDocumentFragment();
  for (const row of visible) {
    const tr = document.createElement("tr");
    const family = document.createElement("td");
    family.className = "family-name";
    family.textContent = names[row.model];
    tr.append(family);
    const replicas = document.createElement("td");
    replicas.textContent = row.replicas;
    const unit = document.createElement("span");
    unit.className = "replica-unit";
    unit.textContent = "GPUs";
    replicas.append(unit);
    tr.append(replicas);
    for (const metric of ["mean", "p50", "p95", "tail"]) {
      const cell = document.createElement("td");
      if (metric === "tail") cell.className = "tail-value";
      cell.textContent = row[metric].toFixed(3);
      tr.append(cell);
    }
    fragment.append(tr);
  }
  tableBody.replaceChildren(fragment);
  document.querySelector("#result-count").textContent = `${visible.length} settings · ${selectedLoad.replace("x", "×")} load`;
  for (const button of loadButtons) button.setAttribute("aria-pressed", String(button.dataset.load === selectedLoad));
}
for (const button of loadButtons) {
  button.addEventListener("click", () => {
    selectedLoad = button.dataset.load;
    renderResults();
  });
}
modelFilter.addEventListener("change", renderResults);
renderResults();

const dialog = document.querySelector("#figure-dialog");
const dialogImage = document.querySelector("#dialog-image");
const closeButton = dialog.querySelector(".dialog-close");
let figureTrigger = null;
for (const trigger of document.querySelectorAll(".image-expand")) {
  trigger.addEventListener("click", () => {
    figureTrigger = trigger;
    document.querySelector("#dialog-title").textContent = trigger.dataset.title;
    dialogImage.src = trigger.dataset.image;
    dialogImage.alt = trigger.querySelector("img").alt;
    dialog.showModal();
    document.body.classList.add("dialog-open");
    closeButton.focus();
  });
}
closeButton.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  if (figureTrigger) figureTrigger.focus({ preventScroll: true });
});

const navigationLinks = [...document.querySelectorAll("nav a")];
const navigationSections = [...document.querySelectorAll("main section[id]:not(#top)")];
function updateNavigation() {
  const marker = window.scrollY + document.querySelector(".site-header").offsetHeight + 140;
  let activeHash = null;
  for (const section of navigationSections) {
    if (section.offsetTop <= marker) activeHash = `#${section.id}`;
  }
  for (const link of navigationLinks) {
    if (link.hash === activeHash) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}
window.addEventListener("scroll", updateNavigation, { passive: true });
window.addEventListener("resize", updateNavigation);
window.addEventListener("load", updateNavigation);
updateNavigation();
