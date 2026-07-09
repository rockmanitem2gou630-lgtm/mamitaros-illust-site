document.addEventListener("DOMContentLoaded", () => {
  const detailModal = document.getElementById("detailModal");
  const detailModalClose = document.getElementById("detailModalClose");
  const detailModalTitle = document.getElementById("detailModalTitle");
  const detailModalText = document.getElementById("detailModalText");
  const detailModalImages = document.getElementById("detailModalImages");

  const detailData = {
    "dq10-assets": {
      title: "ドラクエ10 勇者御一行 素材",
      text: "立ち絵・顔グラのサンプルです。。",
      images: [
        { src: "sample/dq10_sample.png", alt: "サンプル" },
      ]
    }
  };

  document.querySelectorAll(".detail-button").forEach(button => {
    button.addEventListener("click", () => {
      const item = detailData[button.dataset.detail];
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

  detailModalClose.addEventListener("click", () => {
    detailModal.classList.remove("show");
    document.body.classList.remove("modal-open");
  });

  detailModal.addEventListener("click", event => {
    if (event.target === detailModal) {
      detailModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    }
  });
});