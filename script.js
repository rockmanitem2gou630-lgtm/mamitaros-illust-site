const mangaModal = document.getElementById("mangaModal");
const mangaModalClose = document.getElementById("mangaModalClose");
const mangaModalTitle = document.getElementById("mangaModalTitle");
const mangaModalDate = document.getElementById("mangaModalDate");
const mangaModalTags = document.getElementById("mangaModalTags");
const mangaModalComment = document.getElementById("mangaModalComment");
const mangaPages = document.getElementById("mangaPages");
const gallery = document.getElementById("gallery");
const tagArea = document.getElementById("tagArea");
const dreamNotice = document.getElementById("dreamNotice");

const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalTags = document.getElementById("modalTags");
const modalComment = document.getElementById("modalComment");

let currentTag = "all";
let viewMode = "normal";

function formatMonth(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function getPublishedArtworks() {
  return artworks
    .filter(art => !art.draft)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getAllTags() {
  const tagSet = new Set();

  getPublishedArtworks()
    .filter(art => art.dream !== true)
    .forEach(art => {
      art.tags.forEach(tag => tagSet.add(tag));
    });

  return ["all", ...Array.from(tagSet), "dream"];
}

function renderTagButtons() {
  const tags = getAllTags();

  tagArea.innerHTML = tags.map(tag => {
    const label = tag === "all" ? "全部" : tag === "dream" ? "夢絵" : tag;
    const activeClass = tag === currentTag ? "active" : "";

    return `<button class="tag-button ${activeClass}" data-tag="${tag}">${label}</button>`;
  }).join("");

  document.querySelectorAll(".tag-button").forEach(button => {
    button.addEventListener("click", () => {
      currentTag = button.dataset.tag;
      viewMode = currentTag === "dream" ? "dream" : "normal";
      renderTagButtons();
      renderGallery();
    });
  });
}

function renderGallery() {
  gallery.innerHTML = "";
  dreamNotice.style.display = viewMode === "dream" ? "block" : "none";

  const published = getPublishedArtworks();

  let filtered;

if (viewMode === "dream") {
  filtered = published.filter(art => art.dream === true);
} else if (currentTag === "all") {
  filtered = published.filter(art => art.dream !== true);
} else {
  filtered = published.filter(art => art.dream !== true && art.tags.includes(currentTag));
}

  const groups = {};

  filtered.forEach(art => {
    const month = formatMonth(art.date);
    if (!groups[month]) groups[month] = [];
    groups[month].push(art);
  });

  Object.keys(groups).forEach(month => {
    const section = document.createElement("section");
    section.className = "month-section";

    section.innerHTML = `
      <h2 class="month-title">${month}</h2>
      <div class="art-grid">
        ${groups[month].map((art, index) => `
          <article class="art-card" data-month="${month}" data-index="${index}">
  ${art.type === "manga" ? `<div class="manga-badge">📖</div>` : ""}
  <img src="${art.thumb}" alt="${art.title}">
            <div class="art-info">
              <div class="art-title">${art.title}</div>
              <div class="art-date">${art.date}</div>
${art.type === "manga" && art.pages ? `<div class="art-page-count">📖 ${art.pages.length}P</div>` : ""}
              <div class="art-tags">
                ${art.tags.map(tag => `<span>${tag}</span>`).join("")}
              </div>
              ${art.comment ? `<p class="art-comment">${art.comment}</p>` : ""}
            </div>
          </article>
        `).join("")}
      </div>
    `;

    gallery.appendChild(section);

    section.querySelectorAll(".art-card").forEach(card => {
      card.addEventListener("click", () => {
        const monthName = card.dataset.month;
        const artIndex = Number(card.dataset.index);
        const art = groups[monthName][artIndex];

        if (art.type === "manga") {
  openMangaModal(art);
} else {
  openModal(art);
}
      });
    });
  });
}

function openModal(art) {
  modalImage.src = art.image;
  modalImage.alt = art.title;
  modalTitle.textContent = art.title;
  modalDate.textContent = art.date;
  modalTags.innerHTML = art.tags.map(tag => `<span>${tag}</span>`).join("");
  modalComment.textContent = art.comment || "";

  modal.classList.add("show");
}
function openMangaModal(art) {
  mangaModalTitle.textContent = art.title;
  mangaModalDate.textContent = art.date;
  mangaModalTags.innerHTML = art.tags.map(tag => `<span>${tag}</span>`).join("");
  mangaModalComment.textContent = art.comment || "";

  mangaPages.innerHTML = art.pages.map(page => `
    <img src="${page}" alt="${art.title}">
  `).join("");

  mangaModal.classList.add("show");
}

function closeMangaModal() {
  mangaModal.classList.remove("show");
}

mangaModalClose.addEventListener("click", closeMangaModal);

mangaModal.addEventListener("click", event => {
  if (event.target === mangaModal) {
    closeMangaModal();
  }
});
function closeModal() {
  modal.classList.remove("show");
}

modalClose.addEventListener("click", closeModal);

modal.addEventListener("click", event => {
  if (event.target === modal) {
    closeModal();
  }
});

renderTagButtons();
renderGallery();