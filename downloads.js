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
        { src: "sample/dq10_sample.png", alt: "サンプル", className: "wide-sample", wide: true },
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
        src: "sample/haste_scythe_sample_3.png",
        alt: "こんな感じです"
      }
    ]
  },

  "tourabu_magicalwand": {
    title: "刀剣乱舞　マジカルステッキ",
    text: "刀剣乱舞公式グッズのマジカルステッキを参考に制作した、 イラスト制作補助用の3D素材です。",
    images: [
      {
        src: "sample/tourabu_magicalwand_sample.webp",
        alt: "イラスト使用例"
      },
    ]
   },

  "sb69-yasu-guitar": {
    title: "SHOW BY ROCK!! ヤスのギター",
    text: "ヤスのギター「八咫之鉄紺青鴉式」を参考に制作した、 イラスト制作補助用の3D素材です。",
    images: [
      {
        src: "images/originals/2023/10/20231018_sb69_yasu.webp",
        alt: "イラスト使用例"
      },
    ]
  },

  "pokemon_TeamYell_megaphone": {
    title: "SHOW BY ROCK!! ヤスのギター",
    text: "ポケモンのエール団のメガホンを参考に制作した、 イラスト制作補助用の3D素材です。",
    images: [
      {
        src: "images/originals/2023/10/pokemon_TeamYell_megaphone_sample.webp",
        alt: "イラスト使用例"
      },
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
        <figure class="detail-image-card ${image.wide ? "wide-card" : ""}">
          <img
           src="${image.src}"
           alt="${image.alt}"
           class="${image.wide ? "wide-image" : ""}">
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