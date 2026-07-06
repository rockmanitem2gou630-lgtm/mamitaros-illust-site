const artworks = [
  {
    title: "サンプル作品 1",
    date: "2026-07-06",
    image: "https://placehold.co/600x800?text=Art+1",
    tags: ["電王", "イラスト"]
  },
  {
    title: "サンプル作品 2",
    date: "2026-06-28",
    image: "https://placehold.co/600x600?text=Art+2",
    tags: ["刀剣乱舞", "SD"]
  },
  {
    title: "サンプル作品 3",
    date: "2026-05-10",
    image: "https://placehold.co/600x750?text=Art+3",
    tags: ["一次創作", "カラー"]
  }
];

const gallery = document.getElementById("gallery");
const buttons = document.querySelectorAll(".tag-button");

function formatMonth(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function renderGallery(filterTag = "all") {
  gallery.innerHTML = "";

  const filtered = filterTag === "all"
    ? artworks
    : artworks.filter(art => art.tags.includes(filterTag));

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
            </div>
          </article>
        `).join("")}
      </div>
    `;

    gallery.appendChild(section);
  });
}

buttons.forEach(button => {
  button.addEventListener("click", () => {
    buttons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    renderGallery(button.dataset.tag);
  });
});

renderGallery();