const gallery = document.getElementById("gallery");
const tagArea = document.getElementById("tagArea");
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalTags = document.getElementById("modalTags");
const modalComment = document.getElementById("modalComment");
let currentTag = "all";

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

  getPublishedArtworks().forEach(art => {
    art.tags.forEach(tag => tagSet.add(tag));
  });

  return ["all", ...Array.from(tagSet)];
}

function renderTagButtons() {
  const tags = getAllTags();

  tagArea.innerHTML = tags.map(tag => {
    const label = tag === "all" ? "全部" : tag;
    const activeClass = tag === currentTag ? "active" : "";

    return `<button class="tag-button ${activeClass}" data-tag="${tag}">${label}</button>`;
  }).join("");

  document.querySelectorAll(".tag-button").forEach(button => {
    button.addEventListener("click", () => {
      currentTag = button.dataset.tag;
      renderTagButtons();
      renderGallery();
    });
  });
}

function renderGallery() {
  gallery.innerHTML = "";

  const published = getPublishedArtworks();

  const filtered = currentTag === "all"
    ? published
    : published.filter(art => art.tags.includes(currentTag));

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
        ${groups[month].map(art => `
          <article class="art-card">
            <img src="${art.image}" alt="${art.title}">
            <div class="art-info">
              <div class="art-title">${art.title}</div>
              <div class="art-date">${art.date}</div>
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
  });
}

renderTagButtons();
renderGallery();