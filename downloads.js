const detailData = {
  "dq10-assets": {
    title: "ドラクエ10 勇者御一行 素材",
    text: "立ち絵・顔グラ・歩行ドットのサンプルです。",
    images: [
      {
        src: "sample/dq10_stand_sample.png",
        alt: "立ち絵サンプル"
      },
      {
        src: "sample/dq10_face_sample.png",
        alt: "顔グラサンプル"
      },
      {
        src: "sample/dq10_sample.gif",
        alt: "歩行ドットサンプル"
      }
    ]
  }
};

const detailModal = document.getElementById("detailModal");
const detailModalClose = document.getElementById("detailModalClose");
const detailModalTitle = document.getElementById("detailModalTitle");
const detailModalText = document.getElementById("detailModalText");
const detailModalImages = document.getElementById("detailModalImages");

document.querySelectorAll(".detail-button").forEach(button => {
  button.addEventListener("click", () => {
    const id = button.dataset.detail;
    const item = detailData[id];

    if (!item) return;

    detailModalTitle.textContent = item.title;
    detailModalText.textContent = item.text;

    detailModalImages.innerHTML = item.images.map(image => `
      <figure class="detail-image-card">
        <img src="${image.src}" alt="${image.alt}">
        <figcaption>${image.alt}</figcaption>
      </figure>
    `).join("");

    detailModal.classList.add("show");
    document.body.classList.add("modal-open");
  });
});

function closeDetailModal() {
  detailModal.classList.remove("show");
  document.body.classList.remove("modal-open");
}

detailModalClose.addEventListener("click", closeDetailModal);

detailModal.addEventListener("click", event => {
  if (event.target === detailModal) {
    closeDetailModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && detailModal.classList.contains("show")) {
    closeDetailModal();
  }
});