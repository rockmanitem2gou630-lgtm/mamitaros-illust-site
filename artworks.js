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
    tags: ["ドラクエ", "セリフ付き"],
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
  },
  {
    title: "魔法少女☆則宗",
    date: "2026-04-13",
    thumb: "images/thumbnails/2026/04/20260413_touken_norimune_th.webp",
    image: "images/originals/2026/04/20260413_touken_norimune.webp",
    tags: ["刀剣乱舞", "一枚絵"],
    comment: "公式がなんか魔法少女のグッズ出したので",
    draft: false
  },
  {
    title: "魔法少女☆則宗三面図",
    date: "2026-04-16",
    thumb: "images/thumbnails/2026/04/20260416_touken_norimune_th.webp",
    image: "images/originals/2026/04/20260416_touken_norimune.webp",
    tags: ["刀剣乱舞", "その他"],
    comment: "せっかくだから俺はデザイン詳細を描くぜ",
    draft: false
  },
  {
    title: "魔法少女☆則宗詳細",
    date: "2026-04-17",
    thumb: "images/thumbnails/2026/04/20260417_touken_norimune_th.webp",
    image: "images/originals/2026/04/20260417_touken_norimune.webp",
    tags: ["刀剣乱舞", "その他"],
    comment: "声優ネタで遊び始める",
    draft: false
  },
  {
    title: "則さにらくがき",
    date: "2026-05-03",
    thumb: "images/thumbnails/2026/05/20260503_touken_norimune_th.webp",
    image: "images/originals/2026/05/20260503_touken_norimune.webp",
    tags: ["刀剣乱舞", "セリフ付き"],
    comment: "撫でられても尚色気が出てしまう",
    draft: false
  },
  {
    title: "則宗一騎打ち",
    date: "2026-05-06",
    thumb: "images/thumbnails/2026/05/20260506_touken_norimune_th.webp",
    image: "images/originals/2026/05/20260506_touken_norimune.webp",
    tags: ["刀剣乱舞", "セリフ付き"],
    comment: "何人の審神者がお守りに気づくだろう",
    draft: false
  },
  {
    title: "サリエリ",
    date: "2026-03-30",
    thumb: "images/thumbnails/2026/03/20260330_fate_salieri_th.webp",
    image: "images/originals/2026/03/20260330_fate_salieri.webp",
    tags: ["Fate", "一枚絵"],
    comment: "本物の楽譜使ってる拘り",
    draft: false
  },
  {
    title: "天塚先輩",
    date: "2026-03-30",
    thumb: "images/thumbnails/2026/03/20260329_fate_amatuka_th.webp",
    image: "images/originals/2026/03/20260329_fate_amatuka.webp",
    tags: ["Fate", "一枚絵"],
    comment: "イドミリしらで描いたってマ！？",
    draft: false
  },
  {
    title: "サリエリ先生実装周年絵",
    date: "2026-04-11",
    thumb: "images/thumbnails/2026/04/20260411_fate_salieri_th.webp",
    image: "images/originals/2026/04/20260411_fate_salieri.webp",
    tags: ["Fate", "一枚絵"],
    comment: "最推し……！いつもありがとうございます",
    draft: false
  },
  {
  title: "則さに",
  date: "2026-04-08",
  thumb: "images/thumbnails/2026/04/20260408_touken_norisani_th.webp",
  image: "images/originals/2026/04/20260408_touken_norisani.webp",
  tags: ["刀剣乱舞", "一枚絵"],
  comment: "春が似合う",
  dream: true,
  draft: false
  },
  {
  title: "手入れ",
  date: "2025-11-06",
  thumb: "images/thumbnails/2025/11/20251106_touken_norisani_th.webp",
  image: "images/originals/2025/11/20251106_touken_norisani.webp",
  tags: ["刀剣乱舞", "漫画"],
  comment: "審神者をからかうのが趣味",
  dream: true,
  draft: false
  },
  {
  title: "防衛連勝した時の話",
  date: "2025-10-29",
  thumb: "images/thumbnails/2025/10/20251029_epic7_reishu_th.webp",
  image: "images/originals/2025/10/20251029_epic7_reishu.webp",
  tags: ["Epic7", "漫画"],
  comment: "やばい薬じゃねーか",
  dream: true,
  draft: false
  },
  {
  title: "普通じゃない彼氏",
  date: "2026-03-22",
  thumb: "images/thumbnails/2026/03/20260322_epic7_reishu_th.webp",
  image: "images/originals/2026/03/20260322_epic7_reishu.webp",
  tags: ["Epic7", "漫画"],
  comment: "そういうとこやぞ！",
  dream: true,
  draft: false
  },
  {
  title: "則さにキスの日",
  date: "2026-05-22",
  thumb: "images/thumbnails/2026/05/20260522_touken_norisani_th.webp",
  image: "images/originals/2026/05/20260522_touken_norisani.webp",
  tags: ["刀剣乱舞", "一枚絵"],
  comment: "幸福",
  dream: true,
  draft: false
  },
  {
    title: "にっかり四面相",
    date: "2026-05-08",
    thumb: "images/thumbnails/2026/05/20260508_touken_nikkari_th.webp",
    image: "images/originals/2026/05/20260508_touken_nikkari.webp",
    tags: ["刀剣乱舞", "らくがき"],
    comment: "何やってんだお前えええええ！！！",
    draft: false
  },
  {
  title: "魔力供給",
  date: "2026-03-24",
  thumb: "images/thumbnails/2026/03/20260324_fate_salishu_th.webp",
  image: "images/originals/2026/03/20260324_fate_salishu.webp",
  tags: ["Fate", "漫画"],
  comment: "アヴェンジャー幸せになって",
  dream: true,
  draft: false
  },
  {
  title: "は組のよいこたち",
  date: "2026-03-26",
  thumb: "images/thumbnails/2026/03/20260326_nintama_doishu_th.webp",
  image: "images/originals/2026/03/20260326_nintama_doishu.webp",
  tags: ["忍たま", "漫画"],
  comment: "こういうのでいいんだよ",
  dream: true,
  draft: false
  },
  {
  title: "則さに微18",
  date: "2026-03-28",
  thumb: "images/thumbnails/2026/03/20260328_touken_norisani_th.webp",
  image: "images/originals/2026/03/20260328_touken_norisani.webp",
  tags: ["刀剣乱舞", "漫画"],
  comment: "これくらいでもR判定らしい",
  dream: true,
  draft: false
  },
  {
    title: "誕生日絵",
    date: "2026-06-11",
    thumb: "images/thumbnails/2026/06/20260611_touken_sekitoshi_th.webp",
    image: "images/originals/2026/06/20260611_touken_sekitoshi.webp",
    tags: ["刀剣乱舞", "Fate", "忍たま", "Epic7", "一枚絵"],
    comment: "四大推しと声優ネタ",
    draft: false
  },
  {
    title: "ハッチン",
    date: "2021-10-14",
    thumb: "images/thumbnails/2021/10/20211014_sb69_hati_th.webp",
    image: "images/originals/2021/10/20211014_sb69_hati.webp",
    tags: ["SB69", "一枚絵"],
    comment: "キャラソンイメージ",
    draft: false
  },
  {
    title: "眼力強めでいこうぜ",
    date: "2021-10-18",
    thumb: "images/thumbnails/2021/10/20211018_sb69_dokonjo_th.webp",
    image: "images/originals/2021/10/20211018_sb69_dokonjo.webp",
    tags: ["SB69", "一枚絵"],
    comment: "治安悪い",
    draft: false
  },
  {
    title: "ファッピーハロウィン",
    date: "2021-10-27",
    thumb: "images/thumbnails/2021/10/20211027_sb69_hati_th.webp",
    image: "images/originals/2021/10/20211027_sb69_hati.webp",
    tags: ["SB69", "一枚絵"],
    comment: "ハロウィン公式衣装組み合わせだったような",
    draft: false
  },
  {
    title: "クロウ",
    date: "2021-10-28",
    thumb: "images/thumbnails/2021/10/20211028_sb69_crow_th.webp",
    image: "images/originals/2021/10/20211028_sb69_crow.webp",
    tags: ["SB69", "一枚絵"],
    comment: "なんやかんや女児",
    draft: false
  },
  {
    title: "サンシーカーについて",
    date: "2024-05-25",
    thumb: "images/thumbnails/2024/05/20240525_FF14_rahahika_th.webp",
    image: "images/originals/2024/05/20240525_FF14_rahahika.webp",
    tags: ["FF14", "漫画"],
    comment: "あくまでも考察",
    draft: false
  },
  {
    title: "ミラプリを見せよう",
    date: "2024-05-30",
    thumb: "images/thumbnails/2024/05/20240530_FF14_kouhika_th.webp",
    image: "images/originals/2024/05/20240530_FF14_kouhika.webp",
    tags: ["FF14", "漫画"],
    comment: "公はおくゆかしい",
    draft: false
  },
  {
    title: "パパ活(本物)",
    date: "2021-11-19",
    thumb: "images/thumbnails/2021/11/20211119_dorakue_maouchan_th.webp",
    image: "images/originals/2021/11/20211119_dorakue_maouchan.webp",
    tags: ["ドラクエ", "漫画"],
    comment: "誤解されてもしゃーなし",
    draft: false
  },
  {
    title: "奴隷時代にありがちなこと",
    date: "2021-11-27",
    thumb: "images/thumbnails/2021/11/20211127_dorakue_shuhen_th.webp",
    image: "images/originals/2021/11/20211127_dorakue_shuhen.webp",
    tags: ["ドラクエ", "漫画"],
    comment: "考察だが",
    draft: false
  },
  {
    title: "バギを唱えた！",
    date: "2021-12-18",
    thumb: "images/thumbnails/2021/12/20211218_dorakue_shuhen_th.webp",
    image: "images/originals/2021/12/20211218_dorakue_shuhen.webp",
    tags: ["ドラクエ", "漫画"],
    comment: "こ、こら～！！",
    draft: false
  },
  {
    title: "ばたんきゅ～みこち",
    date: "2023-04-18",
    thumb: "images/thumbnails/2023/04/20230418_hololive_mikoti_th.webp",
    image: "images/originals/2023/04/20230418_hololive_mikoti.gif",
    tags: ["ホロライブ", "GIF", "ぷよぷよ"],
    comment: "負けちゃったにぇ",
    draft: false
  },
  {
    title: "ホイミを唱えた！",
    date: "2024-09-19",
    thumb: "images/thumbnails/2024/09/20240919_dorakue_hoimi_th.webp",
    image: "images/originals/2024/09/20240919_dorakue_hoimi.gif",
    tags: ["ドラクエ", "GIF"],
    comment: "ホイミスライムかわいいね",
    draft: false
  },
  {
    title: "プクリポの日",
    date: "2025-03-17",
    thumb: "images/thumbnails/2025/03/20250317_dorakue_puku_th.webp",
    image: "images/originals/2025/03/20250317_dorakue_puku.gif",
    tags: ["ドラクエ", "GIF"],
    comment: "うちのプクドレア集",
    draft: false
  },
  {
    title: "メスラ",
    date: "2024-08-19",
    thumb: "images/thumbnails/2024/08/20240819_FF14_mesura_th.webp",
    image: "images/originals/2024/08/20240819_FF14_mesura.webp",
    tags: ["FF14", "一枚絵"],
    comment: "お気に入りミラプリ",
    draft: false
  },
  {
    title: "クルル",
    date: "2024-08-21",
    thumb: "images/thumbnails/2024/08/20240821_FF14_kururu_th.webp",
    image: "images/originals/2024/08/20240821_FF14_kururu.webp",
    tags: ["FF14", "一枚絵"],
    comment: "新生祭の時のもの",
    draft: false
  },
  {
    title: "ララヴァルシャン",
    date: "2024-08-25",
    thumb: "images/thumbnails/2024/08/20240825_FF14_Varshahn_th.webp",
    image: "images/originals/2024/08/20240825_FF14_Varshahn.webp",
    tags: ["FF14", "漫画"],
    comment: "こういうのもできそう",
    draft: false
  },
  {
    title: "アリゼーとゼロ",
    date: "2024-08-30",
    thumb: "images/thumbnails/2024/08/20240830_FF14_arizero_th.webp",
    image: "images/originals/2024/08/20240830_FF14_arizero.webp",
    tags: ["FF14", "一枚絵"],
    comment: "コスタデルソルだよ",
    draft: false
  },
  {
    title: "ハニーB限界オタク",
    date: "2024-08-30",
    thumb: "images/thumbnails/2024/08/20240830_FF14_honeyb_th.webp",
    image: "images/originals/2024/08/20240830_FF14_honeyb.webp",
    tags: ["FF14", "漫画"],
    comment: "黄金のいいところ",
    draft: false
  },
  {
    title: "アルフィノは腹筋割れてません",
    date: "2024-08-31",
    thumb: "images/thumbnails/2024/08/20240831_FF14_Alphinaud_th.webp",
    image: "images/originals/2024/08/20240831_FF14_Alphinaud.webp",
    tags: ["FF14", "らくがき"],
    comment: "そうであれ！そうであれ！！",
    draft: false
  },
  {
    title: "アリゼーは腹筋割れてます",
    date: "2024-08-31",
    thumb: "images/thumbnails/2024/08/20240831_FF14_arize_th.webp",
    image: "images/originals/2024/08/20240831_FF14_arize.webp",
    tags: ["FF14", "漫画"],
    comment: "そうであれ！そうであれ！！",
    draft: false
  },
  {
    title: "リーンとアリゼー",
    date: "2024-09-02",
    thumb: "images/thumbnails/2024/09/20240902_FF14_rinarize_th.webp",
    image: "images/originals/2024/09/20240902_FF14_rinarize.webp",
    tags: ["FF14", "一枚絵"],
    comment: "ユールモアのキャバレー",
    draft: false
  },
  {
    title: "カフェインにハマった水晶公",
    date: "2024-09-02",
    thumb: "images/thumbnails/2024/09/20240902_FF14_suishoukou_th.webp",
    image: "images/originals/2024/09/20240902_FF14_suishoukou.webp",
    tags: ["FF14", "セリフ付き"],
    comment: "どうしてこうなった",
    draft: false
  },
  {
    title: "ピクトマンサーの業",
    date: "2024-09-09",
    thumb: "images/thumbnails/2024/09/20240909_FF14_shota_th.webp",
    image: "images/originals/2024/09/20240909_FF14_shota.webp",
    tags: ["FF14", "漫画"],
    comment: "へへへ……",
    draft: false
  },
  {
    title: "ファダニエル",
    date: "2024-09-09",
    thumb: "images/thumbnails/2024/09/20240910_FF14_Fandaniel_th.webp",
    image: "images/originals/2024/09/20240910_FF14_Fandaniel.webp",
    tags: ["FF14", "一枚絵"],
    comment: "とても推し",
    draft: false
  },
  {
  title: "先生ぬいたすかるらくがき",
  date: "2026-03-26",
  thumb: "images/thumbnails/2026/03/20260326_fate_salishu_th.webp",
  image: "images/originals/2026/03/20260326_fate_salishu.webp",
  tags: ["Fate", "らくがき"],
  comment: "小さいいのち",
  dream: true,
  draft: false
  },
  {
  title: "うちのマスターについて",
  date: "2026-04-12",
  thumb: "images/thumbnails/2026/04/20260412_fate_salishu_th.webp",
  image: "images/originals/2026/04/20260412_fate_salishu.webp",
  tags: ["Fate", "らくがき"],
  comment: "夢主は可愛い",
  dream: true,
  draft: false
  },
  {
  title: "関係が進展した則さにの話",
  type: "manga",
  date: "2026-06-12",
  thumb: "images/thumbnails/2026/06/20260612_touken_norisani_th.webp",
  pages: [
    "images/manga/2026/06/20260612_touken_norisani_01.webp",
    "images/manga/2026/06/20260612_touken_norisani_02.webp",
    "images/manga/2026/06/20260612_touken_norisani_03.webp",
    "images/manga/2026/06/20260612_touken_norisani_04.webp",
    "images/manga/2026/06/20260612_touken_norisani_05.webp",
    "images/manga/2026/06/20260612_touken_norisani_06.webp",
    "images/manga/2026/06/20260612_touken_norisani_07.webp",
    "images/manga/2026/06/20260612_touken_norisani_08.webp"
  ],
  tags: ["刀剣乱舞", "漫画"],
  comment: "初同人誌だった……",
  dream: true,
  draft: false
  },
  {
    title: "タチの悪いジジィ",
    date: "2026-05-12",
    thumb: "images/thumbnails/2026/05/20260512_touken_norimune_th.webp",
    image: "images/originals/2026/05/20260512_touken_norimune.webp",
    tags: ["刀剣乱舞", "漫画"],
    comment: "太刀だけに",
    draft: false
  },
  {
    title: "リリベット",
    date: "2022-05-20",
    thumb: "images/originals/2022/05/20220513_epic7_riri.webp",
    image: "images/originals/2022/05/20220513_epic7_riri.webp",
    tags: ["Epic7", "その他"],
    comment: "イラストコンペのもの。入賞○",
    draft: false
  },
  {
    title: "闇アンジェリカ",
    date: "2022-10-09",
    thumb: "images/originals/2022/10/20221009_epic7_anjerika.webp",
    image: "images/originals/2022/10/20221009_epic7_anjerika.webp",
    tags: ["Epic7", "その他"],
    comment: "イラストコンペのもの。入賞○",
    draft: false
  },
  {
    title: "アルキィ",
    date: "2022-10-09",
    thumb: "images/originals/2022/10/20221009_epic7_aru.webp",
    image: "images/originals/2022/10/20221009_epic7_aru.webp",
    tags: ["Epic7", "その他"],
    comment: "イラストコンペのもの。入賞○",
    draft: false
  },
  {
    title: "闇ヘイスト",
    date: "2022-10-09",
    thumb: "images/originals/2022/10/20221009_epic7_haste.webp",
    image: "images/originals/2022/10/20221009_epic7_haste.webp",
    tags: ["Epic7", "その他"],
    comment: "イラストコンペのもの。入賞○",
    draft: false
  },
  {
    title: "闇クラリッサ",
    date: "2022-10-09",
    thumb: "images/originals/2022/10/20221009_epic7_kura.webp",
    image: "images/originals/2022/10/20221009_epic7_kura.webp",
    tags: ["Epic7", "その他"],
    comment: "イラストコンペのもの。入賞○",
    draft: false
  },
  {
    title: "あやしいクルーク",
    date: "2021-07-05",
    thumb: "images/thumbnails/2021/07/20210705_puyopuyo_ayasama_th.webp",
    image: "images/originals/2021/07/20210705_puyopuyo_ayasama.webp",
    tags: ["ぷよぷよ", "一枚絵"],
    comment: "ぷよクエであや様揃った記念",
    draft: false
  },
  {
    title: "銀魂パロ1",
    date: "2021-06-21",
    thumb: "images/thumbnails/2021/06/20210621_puyopuyo_paro1_th.webp",
    image: "images/originals/2021/06/20210621_puyopuyo_paro1.webp",
    tags: ["ぷよぷよ", "一枚絵"],
    comment: "人気投票があったので",
    draft: false
  },
  {
    title: "銀魂パロ2",
    date: "2021-06-21",
    thumb: "images/thumbnails/2021/06/20210621_puyopuyo_paro2_th.webp",
    image: "images/originals/2021/06/20210621_puyopuyo_paro2.webp",
    tags: ["ぷよぷよ", "一枚絵"],
    comment: "人気投票があったので",
    draft: false
  },
  {
    title: "銀魂パロ3",
    date: "2021-06-21",
    thumb: "images/thumbnails/2021/06/20210621_puyopuyo_paro3_th.webp",
    image: "images/originals/2021/06/20210621_puyopuyo_paro3.webp",
    tags: ["ぷよぷよ", "一枚絵"],
    comment: "人気投票があったので",
    draft: false
  },
  {
    title: "銀魂パロ4",
    date: "2021-06-21",
    thumb: "images/thumbnails/2021/06/20210621_puyopuyo_paro4_th.webp",
    image: "images/originals/2021/06/20210621_puyopuyo_paro4.webp",
    tags: ["ぷよぷよ", "一枚絵"],
    comment: "人気投票があったので",
    draft: false
  },
  {
    title: "あや様誕生日",
    date: "2021-06-16",
    thumb: "images/thumbnails/2021/06/20210616_puyopuyo_ayasama_th.webp",
    image: "images/originals/2021/06/20210616_puyopuyo_ayasama.webp",
    tags: ["ぷよぷよ", "一枚絵"],
    comment: "最推しは気合入るで",
    draft: false
  },
  {
    title: "シグ誕生日",
    date: "2021-06-16",
    thumb: "images/thumbnails/2021/06/20210616_puyopuyo_sig_th.webp",
    image: "images/originals/2021/06/20210616_puyopuyo_sig.webp",
    tags: ["ぷよぷよ", "一枚絵"],
    comment: "シグも好きやで",
    draft: false
  },
  {
    title: "あんどうりんご",
    date: "2021-06-14",
    thumb: "images/thumbnails/2021/06/20210614_puyopuyo_ringo_th.webp",
    image: "images/originals/2021/06/20210614_puyopuyo_ringo.webp",
    tags: ["ぷよぷよ", "一枚絵"],
    comment: "カンペキです",
    draft: false
  },
  {
    title: "うたプリパロ",
    date: "2021-06-08",
    thumb: "images/thumbnails/2021/06/20210608_puyopuyo_utapuyo_th.webp",
    image: "images/originals/2021/06/20210608_puyopuyo_utapuyo.webp",
    tags: ["ぷよぷよ", "一枚絵"],
    comment: "今宵はほら二人で1000%LOVE",
    draft: false
  },
  {
    title: "ムシの日",
    date: "2021-06-04",
    thumb: "images/thumbnails/2021/06/20210604_puyopuyo_sig_th.webp",
    image: "images/originals/2021/06/20210604_puyopuyo_sig.webp",
    tags: ["ぷよぷよ", "一枚絵"],
    comment: "シグといえば",
    draft: false
  },
];