const artworks = [
  {
    title: "一文字則宗",
    date: "2026-06-25",
    thumb: "images/thumbnails/2026/06/20260625_touken_norimune_th.webp",
    image: "images/originals/2026/06/20260625_touken_norimune.webp",
    tags: ["刀剣乱舞", "一枚絵"],
    comment: "なんとなくネップリしたやつ",
    draft: false
  },
  {
    title: "大和守安定",
    date: "2026-06-26",
    thumb: "images/thumbnails/2026/06/20260626_touken_yasusada_th.webp",
    image: "images/originals/2026/06/20260626_touken_yasusada.webp",
    tags: ["刀剣乱舞", "一枚絵"],
    comment: "梅雨と紫陽花と安定は合う",
    draft: false
  },
  {
    title: "「邪魔するよ」",
    date: "2026-06-22",
    thumb: "images/thumbnails/2026/06/20260622_touken_norimune_th.webp",
    image: "images/originals/2026/06/20260622_touken_norimune.webp",
    tags: ["刀剣乱舞", "一枚絵"],
    comment: "己の作業環境",
    draft: false
  },
  {
    title: "「そろそろ俺の時間、ちょうだい？」",
    date: "2026-07-04",
    thumb: "images/thumbnails/2026/07/20260704_touken_kiyomitu_th.webp",
    image: "images/originals/2026/07/20260704_touken_kiyomitu.webp",
    tags: ["刀剣乱舞", "一枚絵"],
    comment: "ひょっこり清光かわいいね",
    draft: false
  },
  {
    title: "「ボクと乱れちゃう？」",
    date: "2026-06-28",
    thumb: "images/thumbnails/2026/06/20260628_touken_midare_th.webp",
    image: "images/originals/2026/06/20260628_touken_midare.webp",
    tags: ["刀剣乱舞", "一枚絵"],
    comment: "企画に参加した時の乱ちゃん",
    draft: false
  },
  {
    title: "「いいよね」",
    date: "2026-07-05",
    thumb: "images/thumbnails/2026/07/20260705_deno_ryuta_th.webp",
    image: "images/originals/2026/07/20260705_deno_ryuta.webp",
    tags: ["電王", "一枚絵"],
    comment: "答えは聞いてない！",
    draft: false
  },
  {
    title: "おはよう、清光",
    date: "2026-06-15",
    thumb: "images/thumbnails/2026/06/20260615_touken_kiyomitu_th.webp",
    image: "images/originals/2026/06/20260615_touken_kiyomitu.webp",
    tags: ["刀剣乱舞", "セリフ付き"],
    comment: "朝の夢女子用",
    draft: false
  },
  {
    title: "チャンピオンの　一文字則宗が　勝負を　しかけてきた！",
    date: "2026-06-18",
    thumb: "images/thumbnails/2026/06/20260618_touken_norimune_th.webp",
    image: "images/originals/2026/06/20260618_touken_norimune.webp",
    tags: ["刀剣乱舞", "一枚絵"],
    comment: "勝てる気はしない",
    draft: false
  },
  {
    title: "清光と　安定が　勝負を　しかけてきた！",
    date: "2026-06-20",
    thumb: "images/thumbnails/2026/06/20260620_touken_kiyomituyasusada_th.webp",
    image: "images/originals/2026/06/20260620_touken_kiyomituyasusada.webp",
    tags: ["刀剣乱舞", "一枚絵"],
    comment: "コンテスト勢とバトル勢",
    draft: false
  },
  {
    title: "ワンドロ則宗",
    date: "2026-05-30",
    thumb: "images/thumbnails/2026/05/20260530_touken_norimune_th.webp",
    image: "images/originals/2026/05/20260530_touken_norimune.webp",
    tags: ["刀剣乱舞", "らくがき"],
    comment: "自撮りからせっせと描いた",
    draft: false
  },
  {
    title: "らくがき則宗",
    date: "2026-05-26",
    thumb: "images/thumbnails/2026/05/20260526_touken_norimune_th.webp",
    image: "images/originals/2026/05/20260526_touken_norimune.webp",
    tags: ["刀剣乱舞", "らくがき"],
    comment: "あんま考えず描いた",
    draft: false
  },
  {
    title: "どうしてこんなことに……",
    date: "2026-05-14",
    thumb: "images/thumbnails/2026/05/20260514_touken_hatisukaurasima_th.webp",
    image: "images/originals/2026/05/20260514_touken_hatisukaurasima.webp",
    tags: ["刀剣乱舞", "らくがき"],
    comment: "狂った刀剣男士スロットの悲惨な結果",
    draft: false
  },
  {
    title: "ベロニカ",
    date: "2021-12-27",
    thumb: "images/thumbnails/2021/12/20211227_dorakue_beronika_th.webp",
    image: "images/originals/2021/12/20211227_dorakue_beronika.webp",
    tags: ["ドラクエ", "一枚絵"],
    comment: "まれいたその誕生日に",
    draft: false
  },
  {
    title: "ヘンリー",
    date: "2021-11-25",
    thumb: "images/thumbnails/2021/11/20211125_dorakue_henry_th.webp",
    image: "images/originals/2021/11/20211125_dorakue_henry.webp",
    tags: ["ドラクエ", "一枚絵"],
    comment: "ヘンリーきゅんきゅんきゅい！",
    draft: false
  },
  {
    title: "ユシュカの正装、女子が着たらヤバいんじゃないか説",
    date: "2021-11-21",
    thumb: "images/thumbnails/2021/11/20211121_dorakue_maouchan_th.webp",
    image: "images/originals/2021/11/20211121_dorakue_maouchan.webp",
    tags: ["ドラクエ", "一枚絵"],
    comment: "ユシュカの女……！",
    draft: false
  },
    {
    title: "デスマス大魔王ちゃん",
    date: "2021-12-27",
    thumb: "images/thumbnails/2021/12/20211227_dorakue_maouchan_th.webp",
    image: "images/originals/2021/12/20211227_dorakue_maouchan.webp",
    tags: ["ドラクエ", "一枚絵"],
    comment: "お気に入りドレアだった",
    draft: false
  },
  {
    title: "ラピス",
    date: "2021-11-29",
    thumb: "images/thumbnails/2021/11/20211129_dorakue_rapisu_th.webp",
    image: "images/originals/2021/11/20211129_dorakue_rapisu.webp",
    tags: ["ドラクエ", "らくがき"],
    comment: "とりあえずサクッと描きたかった",
    draft: false
  },
  {
    title: "アイドルヘンリーきゅん",
    date: "2021-11-21",
    thumb: "images/thumbnails/2021/12/20211202_dorakue_henry_th.webp",
    image: "images/originals/2021/12/20211202_dorakue_henry.webp",
    tags: ["ドラクエ", "一枚絵"],
    comment: "ああそうさ主ヘンだよ！",
    draft: false
  },
  {
    title: "ルイズ構文ヘンリー",
    date: "2021-12-31",
    thumb: "images/thumbnails/2021/12/20211231_dorakue_henry_th.webp",
    image: "images/originals/2021/12/20211231_dorakue_henry.webp",
    tags: ["ドラクエ", "らくがき"],
    comment: "かわいいねぇ",
    draft: false
  },
  {
    title: "素晴らしき天空の花嫁の髪型",
    date: "2021-12-28",
    thumb: "images/thumbnails/2021/12/20211228_dorakue_henry_th.webp",
    image: "images/originals/2021/12/20211228_dorakue_henry.webp",
    tags: ["ドラクエ", "イメレス"],
    comment: "結婚してる(断定)",
    draft: false
  },
  {
    title: "シンジ",
    date: "2022-06-04",
    thumb: "images/thumbnails/2022/06/20220604_pokemon_sinji_th.webp",
    image: "images/originals/2022/06/20220604_pokemon_sinji.webp",
    tags: ["ポケモン", "らくがき"],
    comment: "再登場嬉しかったんや",
    draft: false
  },
  {
    title: "ヘイスト",
    date: "2022-06-22",
    thumb: "images/thumbnails/2022/06/20220622_e7_haste_th.webp",
    image: "images/originals/2022/06/20220622_e7_haste.webp",
    tags: ["Epic7", "一枚絵"],
    comment: "闇も火も好き",
    draft: false
  },
  {
    title: "グレン",
    date: "2022-06-17",
    thumb: "images/thumbnails/2022/06/20220617_e7_glen_th.webp",
    image: "images/originals/2022/06/20220617_e7_glen.webp",
    tags: ["Epic7", "一枚絵"],
    comment: "今でもうちじゃ戦闘力1位",
    draft: false
  },
  {
    title: "シド主",
    date: "2023-03-10",
    thumb: "images/thumbnails/2023/03/20230310_dorakue_sidoshu_th.webp",
    image: "images/originals/2023/03/20230310_dorakue_sidoshu.webp",
    tags: ["ドラクエ", "一枚絵"],
    comment: "シド―きゅんしゅき",
    draft: false
  },
  {
    title: "エルシオンラピス",
    date: "2023-03-17",
    thumb: "images/thumbnails/2023/03/20230317_dorakue_rapisu_th.webp",
    image: "images/originals/2023/03/20230317_dorakue_rapisu.webp",
    tags: ["ドラクエ", "一枚絵"],
    comment: "学園繋がり",
    draft: false
  },
  {
    title: "白銀ノエル",
    date: "2023-03-23",
    thumb: "images/thumbnails/2023/03/20230323_hololive_noel_th.webp",
    image: "images/originals/2023/03/20230323_hololive_noel.webp",
    tags: ["ホロライブ", "一枚絵"],
    comment: "ゆるふわ女子好き推し",
    draft: false
  },
  {
    title: "戌神ころね",
    date: "2023-03-30",
    thumb: "images/thumbnails/2023/03/20230330_hololive_korone_th.webp",
    image: "images/originals/2023/03/20230330_hololive_korone.webp",
    tags: ["ホロライブ", "一枚絵"],
    comment: "おあよ",
    draft: false
  },
  {
    title: "さくらみこ",
    date: "2023-04-07",
    thumb: "images/thumbnails/2023/04/20230407_hololive_mikoti_th.webp",
    image: "images/originals/2023/04/20230407_hololive_mikoti.webp",
    tags: ["ホロライブ", "一枚絵"],
    comment: "ハートオンラインが出た時の",
    draft: false
  },
  {
    title: "雪花ラミィ",
    date: "2023-04-13",
    thumb: "images/thumbnails/2023/04/20230413_hololive_lamy_th.webp",
    image: "images/originals/2023/04/20230413_hololive_lamy.webp",
    tags: ["ホロライブ", "一枚絵"],
    comment: "やめなー",
    draft: false
  },
  {
    title: "勇者ぺこーら",
    date: "2023-04-21",
    thumb: "images/thumbnails/2023/04/20230421_hololive_pekora_th.webp",
    image: "images/originals/2023/04/20230421_hololive_pekora.webp",
    tags: ["ホロライブ", "一枚絵"],
    comment: "ぺこーらがドラクエ4やってた時",
    draft: false
  },
  {
    title: "ぷよテト大会ぺこーらすいちゃん",
    date: "2023-04-11",
    thumb: "images/thumbnails/2023/04/20230411_hololive_pekorasuichan_th.webp",
    image: "images/originals/2023/04/20230411_hololive_pekorasuichan.webp",
    tags: ["ホロライブ", "一枚絵", "ぷよぷよ"],
    comment: "ぷよもホロも好き",
    draft: false
  },
  {
    title: "みこちとさかな王子",
    date: "2023-04-16",
    thumb: "images/thumbnails/2023/04/20230416_hololive_mikoti_th.webp",
    image: "images/originals/2023/04/20230416_hololive_mikoti.webp",
    tags: ["ホロライブ", "一枚絵", "ぷよぷよ"],
    comment: "みこちと王子合いすぎだよな",
    draft: false
  },
  {
    title: "船長とあや様",
    date: "2023-04-18",
    thumb: "images/thumbnails/2023/04/20230418_hololive_marine_th.webp",
    image: "images/originals/2023/04/20230418_hololive_marine.webp",
    tags: ["ホロライブ", "一枚絵", "ぷよぷよ"],
    comment: "推しが推しを使って優勝したんや",
    draft: false
  },
  {
    title: "蒸気都市のシグ",
    date: "2023-07-15",
    thumb: "images/thumbnails/2023/07/20230715_puyopuyo_sig_th.webp",
    image: "images/originals/2023/07/20230715_puyopuyo_sig.webp",
    tags: ["ぷよぷよ", "一枚絵"],
    comment: "シグアンソロに参加した時のもの",
    draft: false
  },
  {
    title: "キティシグ",
    date: "2023-07-21",
    thumb: "images/thumbnails/2023/07/20230721_puyopuyo_sig_th.webp",
    image: "images/originals/2023/07/20230721_puyopuyo_sig.webp",
    tags: ["ぷよぷよ", "一枚絵"],
    comment: "シグアンソロに参加した時のもの",
    draft: false
  },
  {
    title: "大魔王ちゃんのぱふぱふ",
    date: "2025-04-03",
    thumb: "images/thumbnails/2025/04/20250403_dorakue_maouchan_th.webp",
    image: "images/originals/2025/04/20250403_dorakue_maouchan.webp",
    tags: ["ドラクエ", "セリフ付き"],
    comment: "うちの子は大きい",
    draft: false
  },
  {
    title: "最強アイドルルルカ様",
    date: "2023-11-09",
    thumb: "images/thumbnails/2023/11/20231109_epic7_ruruka_th.webp",
    image: "images/originals/2023/11/20231109_epic7_ruruka.webp",
    tags: ["Epic7", "一枚絵"],
    comment: "声優繋がり",
    draft: false
  },
  {
    title: "ユシュカ",
    date: "2023-10-18",
    thumb: "images/thumbnails/2023/10/20231018_dorakue_yushuka_th.webp",
    image: "images/originals/2023/10/20231018_dorakue_yushuka.webp",
    tags: ["ドラクエ", "一枚絵"],
    comment: "いとけんの誕生日に",
    draft: false
  },
  {
    title: "ヤス",
    date: "2023-10-18",
    thumb: "images/thumbnails/2023/10/20231018_sb69_yasu_th.webp",
    image: "images/originals/2023/10/20231018_sb69_yasu.webp",
    tags: ["SB69", "一枚絵"],
    comment: "いとけんの誕生日に",
    draft: false
  },
  {
    title: "素晴らしき魔王の嫁の髪型",
    date: "2024-05-14",
    thumb: "images/thumbnails/2024/05/20240514_dorakue_maouchan_th.webp",
    image: "images/originals/2024/05/20240514_dorakue_maouchan.webp",
    tags: ["ドラクエ", "イメレス"],
    comment: "ユシュカしか言ってない",
    draft: false
  },
  {
    title: "ファラザード大魔王ちゃん",
    date: "2024-09-22",
    thumb: "images/thumbnails/2024/09/20240922_dorakue_maouchan_th.webp",
    image: "images/originals/2024/09/20240922_dorakue_maouchan.webp",
    tags: ["ドラクエ", "一枚絵"],
    comment: "さり気ないユシュ主",
    draft: false
  },
  {
    title: "大魔王ちゃんのお成り",
    date: "2024-09-13",
    thumb: "images/thumbnails/2024/09/20240913_dorakue_maouchan_th.webp",
    image: "images/originals/2024/09/20240913_dorakue_maouchan.webp",
    tags: ["ドラクエ", "一枚絵"],
    comment: "一応ベルヴァインの森",
    draft: false
  },
  {
    title: "タクト実装大魔王ちゃん",
    date: "2024-09-29",
    thumb: "images/thumbnails/2024/09/20240929_dorakue_maouchan_th.webp",
    image: "images/originals/2024/09/20240929_dorakue_maouchan.webp",
    tags: ["ドラクエ", "その他"],
    comment: "描くしかないだろ！",
    draft: false
  },
  {
    title: "CC妄想アイテールきゅん",
    date: "2022-06-24",
    thumb: "images/thumbnails/2022/06/20220624_epic7_aither_th.webp",
    image: "images/originals/2022/06/20220624_epic7_aither.webp",
    tags: ["Epic7", "その他"],
    comment: "マジで実装してくれ",
    draft: false
  },
  {
    title: "地雷系ラピス、リンベリィ",
    date: "2024-10-17",
    thumb: "images/thumbnails/2024/10/20241017_dorakue_rapisurinberi_th.webp",
    image: "images/originals/2024/10/20241017_dorakue_rapisurinberi.webp",
    tags: ["ドラクエ", "一枚絵"],
    comment: "己が持ってる服と小物着せた",
    draft: false
  },
  {
    title: "熱血シドーくん",
    date: "2025-04-03",
    thumb: "images/thumbnails/2025/04/20250403_dorakue_sido_th.webp",
    image: "images/originals/2025/04/20250403_dorakue_sido.webp",
    tags: ["ドラクエ", "一枚絵"],
    comment: "10でシドー様が指導されてたので",
    draft: false
  },
  {
    title: "ぷよ風大魔王ちゃん",
    date: "2025-04-07",
    thumb: "images/thumbnails/2025/04/20250407_dorakue_maouchan_th.webp",
    image: "images/originals/2025/04/20250407_dorakue_maouchan.webp",
    tags: ["ドラクエ", "一枚絵", "ぷよぷよ"],
    comment: "ぷよ風はいつだって得意",
    draft: false
  },
  {
    title: "うちの本丸関係性",
    date: "2026-03-28",
    thumb: "images/thumbnails/2026/03/20260328_touken_okitagumi_th.webp",
    image: "images/originals/2026/03/20260328_touken_okitagumi.webp",
    tags: ["刀剣乱舞", "その他"],
    comment: "孫のようなもの",
    draft: false
  },
  {
    title: "一文字則宗",
    date: "2026-04-02",
    thumb: "images/thumbnails/2026/04/20260402_touken_norimune_th.webp",
    image: "images/originals/2026/04/20260402_touken_norimune.webp",
    tags: ["刀剣乱舞", "一枚絵"],
    comment: "最推し",
    draft: false
  },
  {
    title: "則宗さん照れ顔イメレス",
    date: "2026-05-08",
    thumb: "images/thumbnails/2026/05/20260508_touken_norimune_th.webp",
    image: "images/originals/2026/05/20260508_touken_norimune.webp",
    tags: ["刀剣乱舞", "イメレス"],
    comment: "うちの国宝がここまで崩れるのは稀",
    draft: false
  },
  {
    title: "メイド則宗",
    date: "2026-05-10",
    thumb: "images/thumbnails/2026/05/20260510_touken_norimune_th.webp",
    image: "images/originals/2026/05/20260510_touken_norimune.webp",
    tags: ["刀剣乱舞", "一枚絵"],
    comment: "メイドの日のもの",
    draft: false
  }
];