const gallery = document.getElementById("gallery");
const genreTagArea = document.getElementById("genreTagArea");
const workTagArea = document.getElementById("workTagArea");
const workTags = ["一枚絵", "漫画", "セリフ付き", "らくがき", "イメレス", "GIF", "その他", "夢絵"];
const dreamNotice = document.getElementById("dreamNotice");

const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalTags = document.getElementById("modalTags");
const modalComment = document.getElementById("modalComment");

const mangaModal = document.getElementById("mangaModal");
const mangaModalClose = document.getElementById("mangaModalClose");
const mangaModalTitle = document.getElementById("mangaModalTitle");
const mangaModalDate = document.getElementById("mangaModalDate");
const mangaModalTags = document.getElementById("mangaModalTags");
const mangaModalComment = document.getElementById("mangaModalComment");
const mangaPages = document.getElementById("mangaPages");
const mangaPrev = document.getElementById("mangaPrev");
const mangaNext = document.getElementById("mangaNext");
const mangaPageInfo = document.getElementById("mangaPageInfo");
const modalPrevArt = document.getElementById("modalPrevArt");
const modalNextArt = document.getElementById("modalNextArt");
const mangaPrevArt = document.getElementById("mangaPrevArt");
const mangaNextArt = document.getElementById("mangaNextArt");

const backToTop = document.getElementById("backToTop");

let currentArtList = [];
let currentArtIndex = 0;

let currentTag = "all";
let currentManga = null;
let currentPageIndex = 0;
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

function getSeparatedTags() {
  const genreTagSet = new Set();
  const workTagSet = new Set();

  getPublishedArtworks().forEach(art => {
    art.tags.forEach(tag => {
      if (workTags.includes(tag)) {
        workTagSet.add(tag);
      } else {
        genreTagSet.add(tag);
      }
    });

    if (art.type === "manga") {
      workTagSet.add("漫画");
    }

    if (art.dream === true) {
      workTagSet.add("夢絵");
    }
  });

  const genreTags = ["all", ...Array.from(genreTagSet)];

  const orderedWorkTags = workTags.filter(tag => {
    if (tag === "夢絵") {
      return getPublishedArtworks().some(art => art.dream === true);
    }

    return workTagSet.has(tag);
  });

  return {
    genreTags,
    workTags: orderedWorkTags
  };
}
document.addEventListener("keydown", event => {
  const isModalOpen = modal.classList.contains("show");
  const isMangaModalOpen = mangaModal.classList.contains("show");

  if (!isModalOpen && !isMangaModalOpen) return;

  if (event.key === "Escape") {
    if (isMangaModalOpen) {
      closeMangaModal();
    } else {
      closeModal();
    }
  }

  if (event.key === "ArrowLeft") {
    if (isMangaModalOpen) {
      nextMangaPages();
    } else if (isModalOpen) {
      openPrevArtwork();
    }
  }

  if (event.key === "ArrowRight") {
    if (isMangaModalOpen) {
      prevMangaPages();
    } else if (isModalOpen) {
      openNextArtwork();
    }
  }
});
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(event) {
  if (event.touches.length !== 1) return;

  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
  const isModalOpen = modal.classList.contains("show");
  const isMangaModalOpen = mangaModal.classList.contains("show");

  if (!isModalOpen && !isMangaModalOpen) return;
  if (event.changedTouches.length !== 1) return;

  const touchEndX = event.changedTouches[0].clientX;
  const touchEndY = event.changedTouches[0].clientY;

  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  if (Math.abs(diffX) < 70) return;
  if (Math.abs(diffY) > 60) return;

  if (diffX < 0) {
    openNextArtwork();
  } else {
    openPrevArtwork();
  }
}

modal.addEventListener("touchstart", handleTouchStart);
modal.addEventListener("touchend", handleTouchEnd);

mangaModal.addEventListener("touchstart", handleTouchStart);
mangaModal.addEventListener("touchend", handleTouchEnd);
function renderTagButtons() {
  const separatedTags = getSeparatedTags();

  genreTagArea.innerHTML = separatedTags.genreTags.map(tag => {
    const label = tag === "all" ? "全部" : tag;
    const activeClass = tag === currentTag ? "active" : "";

    return `<button class="tag-button ${activeClass}" data-tag="${tag}">${label}</button>`;
  }).join("");

  workTagArea.innerHTML = separatedTags.workTags.map(tag => {
    const activeClass = tag === currentTag ? "active" : "";

    return `<button class="tag-button ${activeClass}" data-tag="${tag}">${tag}</button>`;
  }).join("");

  document.querySelectorAll(".tag-button").forEach(button => {
    button.addEventListener("click", () => {
      currentTag = button.dataset.tag;
      viewMode = currentTag === "夢絵" ? "dream" : "normal";
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
  filtered = published.filter(art => {
    if (art.dream === true) return false;

    if (currentTag === "漫画") {
      return art.tags.includes("漫画") || art.type === "manga";
    }

    if (currentTag === "一枚絵") {
      return art.tags.includes("一枚絵");
    }

    return art.tags.includes(currentTag);
  });
}
  currentArtList = filtered;
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
        currentArtIndex = currentArtList.indexOf(art);

        openArtworkByIndex(currentArtIndex);
      });
    });
  });
}
function openArtworkByIndex(index) {
  const art = currentArtList[index];
  if (!art) return;

  currentArtIndex = index;

  modal.classList.remove("show");
  mangaModal.classList.remove("show");

  if (art.type === "manga") {
    openMangaModal(art);
  } else {
    openModal(art);
  }

  updateArtNavButtons();
  preloadAroundArtwork();
  function preloadImage(src) {
  if (!src) return;

  const img = new Image();
  img.src = src;
}

function preloadAroundArtwork() {
  const prevArt = currentArtList[currentArtIndex - 1];
  const nextArt = currentArtList[currentArtIndex + 1];

  [prevArt, nextArt].forEach(art => {
    if (!art) return;

    if (art.type === "manga" && art.pages) {
      preloadImage(art.thumb);
      preloadImage(art.pages[0]);
      preloadImage(art.pages[1]);
    } else {
      preloadImage(art.image);
    }
  });
}
}

function updateArtNavButtons() {
  const isFirst = currentArtIndex <= 0;
  const isLast = currentArtIndex >= currentArtList.length - 1;

  modalPrevArt.disabled = isFirst;
  modalNextArt.disabled = isLast;
  mangaPrevArt.disabled = isFirst;
  mangaNextArt.disabled = isLast;
}

function openPrevArtwork() {
  if (currentArtIndex > 0) {
    openArtworkByIndex(currentArtIndex - 1);
  }
}

function openNextArtwork() {
  if (currentArtIndex < currentArtList.length - 1) {
    openArtworkByIndex(currentArtIndex + 1);
  }
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
  currentManga = art;
  currentPageIndex = 0;

  mangaModalTitle.textContent = art.title;
  mangaModalDate.textContent = art.date;
  mangaModalTags.innerHTML = art.tags.map(tag => `<span>${tag}</span>`).join("");
  mangaModalComment.textContent = art.comment || "";

  renderMangaPages();
  mangaModal.classList.add("show");
  
}
function renderMangaPages() {
  if (!currentManga) return;

  const keepScrollTop = mangaModal.scrollTop;
  const pages = currentManga.pages;
  const isMobile = window.matchMedia("(max-width: 700px)").matches;

  // スマホ：全ページを1Pずつ縦スクロール
  if (isMobile) {
    mangaPages.innerHTML = pages.map(page => `
      <img src="${page}" alt="${currentManga.title}">
    `).join("");

    mangaPageInfo.textContent = "";
    mangaPrev.disabled = true;
    mangaNext.disabled = true;

    requestAnimationFrame(() => {
      mangaModal.scrollTop = keepScrollTop;
    });
    preloadMangaAroundPages();
    function preloadMangaAroundPages() {
  if (!currentManga || !currentManga.pages) return;

  const pages = currentManga.pages;

  const preloadIndexes = [
    currentPageIndex - 2,
    currentPageIndex - 1,
    currentPageIndex + 2,
    currentPageIndex + 3
  ];

  preloadIndexes.forEach(index => {
    if (index >= 0 && index < pages.length) {
      preloadImage(pages[index]);
    }
  });
}

    return;
  }

  // PC：日本式見開き
  const leftPage = pages[currentPageIndex + 1];
  const rightPage = pages[currentPageIndex];

  mangaPages.innerHTML = `
    ${leftPage ? `<img src="${leftPage}" alt="${currentManga.title}">` : ""}
    ${rightPage ? `<img src="${rightPage}" alt="${currentManga.title}">` : ""}
  `;

  const rightNumber = currentPageIndex + 1;
  const leftNumber = Math.min(currentPageIndex + 2, pages.length);

  mangaPageInfo.textContent = `${leftNumber}-${rightNumber} / ${pages.length}P`;

  mangaPrev.disabled = currentPageIndex + 2 >= pages.length;
  mangaNext.disabled = currentPageIndex <= 0;

  requestAnimationFrame(() => {
    mangaModal.scrollTop = keepScrollTop;
  });
}

function nextMangaPages() {
  if (!currentManga) return;
  if (currentPageIndex + 2 < currentManga.pages.length) {
    currentPageIndex += 2;
    renderMangaPages();
  }
}

function prevMangaPages() {
  if (!currentManga) return;
  if (currentPageIndex - 2 >= 0) {
    currentPageIndex -= 2;
    renderMangaPages();
  }
}

function closeMangaModal() {
  mangaModal.classList.remove("show");
}

mangaNext.addEventListener("click", prevMangaPages);
mangaPrev.addEventListener("click", nextMangaPages);
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
modalPrevArt.addEventListener("click", openPrevArtwork);
modalNextArt.addEventListener("click", openNextArtwork);
mangaPrevArt.addEventListener("click", openPrevArtwork);
mangaNextArt.addEventListener("click", openNextArtwork);

modal.addEventListener("click", event => {
  if (event.target === modal) {
    closeModal();
  }
});
window.addEventListener("scroll", () => {
  if (window.scrollY > 600) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
renderTagButtons();
renderGallery();