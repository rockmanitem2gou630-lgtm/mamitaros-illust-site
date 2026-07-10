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
  },

  "epic7-haste-assets": {
    title: "エピックセブン ヘイストの鎌",
    text: "ヘイストと赤月の貴族ヘイストの鎌を収録した、イラスト制作補助用の3D素材です。",
    images: [
      {
        src: "sample/haste_scythe_sample_1.png",
        alt: "イラスト使用例"
      },
      {
        src: "sample/haste_scythe_sample_2.png",
        alt: "モデルのみのスクショ"
      },
      {
        src: "sample/haste_scythe_sample_3.png",
        alt: "こんな感じです"
      }
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