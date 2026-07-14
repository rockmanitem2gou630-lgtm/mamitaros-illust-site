/*:
 * @target MZ
 * @plugindesc 則宗会話作品用・タグ対応ランダム会話 Ver5.0
 * @author GPT + マミタロス
 *
 * @param PictureId
 * @text 立ち絵ピクチャ番号
 * @type number
 * @min 1
 * @default 2
 *
 * @param PictureX
 * @text 立ち絵X座標
 * @type number
 * @default 640
 *
 * @param PictureY
 * @text 立ち絵Y座標
 * @type number
 * @default 360
 *
 * @param Scale
 * @text 立ち絵拡大率
 * @type number
 * @min 1
 * @default 100
 *
 * @param DefaultExpression
 * @text 通常表情画像
 * @type file
 * @dir img/pictures
 * @default norimune_normal
 *
 * @param ResetDelay
 * @text 通常表情へ戻る時間
 * @desc 会話終了後、通常表情へ戻るまでのフレーム数です。
 * @type number
 * @min 0
 * @default 15
 *
 * @param HistoryCount
 * @text 重複を避ける履歴数
 * @desc 直近何件の会話を抽選候補から外すか設定します。
 * @type number
 * @min 1
 * @default 3
 *
 * @command randomTalk
 * @text ランダム会話
 * @desc 指定カテゴリに合う会話をひとつ抽選します。
 *
 * @arg category
 * @text 会話カテゴリ
 * @type select
 * @option すべて
 * @value all
 * @option 雑談
 * @value normal
 * @option 季節
 * @value season
 * @option 本丸
 * @value honmaru
 * @option 時間帯
 * @value time
 * @default all
 *
 * @help
 * Ver5.0は、従来のカテゴリ構造を残しながら
 * tagsによる会話管理へ移行できる互換版です。
 *
 * 従来どおりtagsなしでも動作します。
 *
 * 使用例：
 *
 * {
 *     text: "今日は静かだねぇ。",
 *     tags: ["normal"],
 *     expression: "norimune_normal"
 * }
 *
 * {
 *     text: "春の風は気持ちがいいね。",
 *     tags: ["normal", "season", "spring"],
 *     season: "spring",
 *     expression: "norimune_smile"
 * }
 *
 * 条件付き会話も通常会話と同じ抽選箱へ入るため、
 * 条件を満たした会話だけが毎回優先され続けることはありません。
 */

(() => {
    "use strict";

    const pluginName = "Mami_NorimuneTalk";
    const params = PluginManager.parameters(pluginName);

    const pictureId =
        Number(params.PictureId || 2);

    const pictureX =
        Number(params.PictureX || 640);

    const pictureY =
        Number(params.PictureY || 360);

    const scale =
        Number(params.Scale || 100);

    const defaultExpression =
        String(
            params.DefaultExpression ||
            "norimune_normal"
        );

    const resetDelayFrames =
        Number(params.ResetDelay || 15);

    const historyCount =
        Math.max(
            1,
            Number(params.HistoryCount || 3)
        );

    /*
     * ─────────────────────────────
     * 通常カテゴリ
     * ─────────────────────────────
     *
     * tagsは省略可能です。
     *
     * normal配列なら自動的にnormalタグ、
     * season配列ならseasonタグ、
     * honmaru配列ならhonmaruタグが付きます。
     */

    const TALK_DATA = {
        normal: [
            {
                text:
                    "今日は、ずいぶん静かな日だねぇ。",
                tags: ["normal"],
                excludeMonth: 12,
                excludeDate: [24, 25],
                expression: "norimune_normal"
            },
            {
                text:
                    "まあ、そう急ぐこともないさ。\n" +
                    "少し休んでいくといい。",
                tags: ["normal"],
                expression: "norimune_fan"
            },
            {
                text:
                    "お前さんは、ここへ来るのが好きなのかい。",
                tags: ["normal"],
                expression: "norimune_smile"
            },
            {
                text:
                    "今日は静かだねぇ。\n" +
                    "風の音がよく聞こえる。||" +
                    "こういう日は、何もしない時間も悪くない。",
                tags: ["normal"],
                excludeMonth: 12,
                excludeDate: [24, 25],
                expression: "norimune_smile"
            },
            {
                type: "commonEvent",
                commonEventId: 6,
                tags: ["normal", "choice"]
            },
            {
                text:
                    "今日は、少し肩に力が入っているようだねぇ。\n" +
                    "ここでまで、しゃんとしていなくてもいいんだよ。",
                tags: ["normal"],
                expression: "norimune_soft"
            },
            {
                text:
                    "何か話したそうな顔をしているね。\n" +
                    "うまく言葉にならなくても、僕は構わないよ。",
                tags: ["normal"],
                expression: "norimune_gentle"
            },
            {
                text:
                    "僕の顔に、何かついているのかい。||" +
                    "……そんなに見つめられると、さすがの僕も気になるねぇ。",
                tags: ["normal"],
                expression: "norimune_tease"
            },
            {
                pages: [
                    {
                        text:
                            "お前さんは、案外わかりやすい。",
                        expression: "norimune_tease"
                    },
                    {
                        text:
                            "うはは。\n" +
                            "何がとは言わないでおこうか。",
                        expression: "norimune_closed"
                    }
                ],
                tags: ["normal"]
            },
            {
                text:
                    "今日は何をして過ごしていたんだい。\n" +
                    "……そうか。よく励んだね。",
                tags: ["normal"],
                expression: "norimune_soft"
            },
            {
                text:
                    "疲れた時には、何もしない時間も要る。\n" +
                    "休むことまで、後回しにするんじゃないよ。",
                tags: ["normal"],
                expression: "norimune_serious"
            },
            {
                text:
                    "急いで答えを出さなくてもいいさ。\n" +
                    "考えているうちに、見えてくるものもある。",
                tags: ["normal"],
                expression: "norimune_think"
            },
            {
                pages: [
                    {
                        text:
                            "……ほう。\n" +
                            "今日はずいぶん機嫌がよさそうだ。",
                        expression: "norimune_surprised"
                    },
                    {
                        text:
                            "何かいいことでもあったのかい。",
                        expression: "norimune_smile"
                    }
                ],
                tags: ["normal"]
            },
            {
                text:
                    "お前さんが笑っているなら、何よりだ。\n" +
                    "理由まで聞くのは、野暮というものだろう。",
                tags: ["normal"],
                expression: "norimune_gentle"
            },
            {
                text:
                    "今日は、少し静かにしていたい気分かい。\n" +
                    "なら、無理に話さなくてもいい。",
                tags: ["normal"],
                expression: "norimune_soft"
            },
            {
                text:
                    "黙って同じ景色を眺めるのも、\n" +
                    "案外、悪くないものさ。",
                tags: ["normal"],
                expression: "norimune_far"
            },
            {
                text:
                    "お前さんは時々、妙なところで頑固だねぇ。||" +
                    "まあ、そういうところも嫌いではないけれど。",
                tags: ["normal"],
                expression: "norimune_troubled"
            },
            {
                pages: [
                    {
                        text:
                            "随分と難しい顔をしている。",
                        expression: "norimune_think"
                    },
                    {
                        text:
                            "僕に話せば解決するとは限らないが、\n" +
                            "ひとりで抱えるよりは軽くなるかもしれないよ。",
                        expression: "norimune_soft"
                    }
                ],
                tags: ["normal"]
            },
            {
                text:
                    "眠そうだねぇ。\n" +
                    "瞼と意地の張り合いなら、今日は瞼の勝ちにしておきなさい。",
                tags: ["normal"],
                expression: "norimune_troubled"
            },
            {
                text:
                    "何かを忘れている気がする？\n" +
                    "うはは。忘れていられるうちは、大事ではないのかもしれないね。",
                tags: ["normal"],
                expression: "norimune_fan"
            },
            {
                text:
                    "僕に会いに来た、という顔だねぇ。||" +
                    "違うのかい。\n" +
                    "それは少し残念だ。",
                tags: ["normal"],
                expression: "norimune_tease"
            },
            {
                pages: [
                    {
                        text:
                            "ここへ来る理由など、なくてもいいさ。",
                        expression: "norimune_normal"
                    },
                    {
                        text:
                            "お前さんが来たいと思った。\n" +
                            "それだけで充分だろう。",
                        expression: "norimune_gentle"
                    }
                ],
                tags: ["normal"]
            },
            {
                text:
                    "今日はもう、十分に働いたんじゃないかい。\n" +
                    "まだ足りないと言う者には、僕から小言を言っておこう。",
                tags: ["normal"],
                expression: "norimune_smile"
            },
            {
                text:
                    "失敗したことばかり、よく覚えているものだねぇ。\n" +
                    "うまくできたことも、同じくらい覚えておきなさい。",
                tags: ["normal"],
                expression: "norimune_serious"
            },
            {
                text:
                    "お前さんは、自分に厳しすぎるところがある。\n" +
                    "もう少し甘やかしても、罰は当たらないよ。",
                tags: ["normal"],
                expression: "norimune_soft"
            },
            {
                pages: [
                    {
                        text:
                            "僕の隣が、そんなに落ち着くのかい。",
                        expression: "norimune_tease"
                    },
                    {
                        text:
                            "……そうか。",
                        expression: "norimune_surprised"
                    },
                    {
                        text:
                            "なら、もう少しここにいるといい。",
                        expression: "norimune_gentle"
                    }
                ],
                tags: ["normal"]
            },
            {
                text:
                    "何も起こらない一日というのは、\n" +
                    "後になってみれば、なかなか得難いものだよ。",
                tags: ["normal"],
                expression: "norimune_far"
            },
            {
                text:
                    "お前さんといると、時が経つのを忘れるねぇ。||" +
                    "……いや。これは、僕らしくない言い方だったかな。",
                tags: ["normal"],
                expression: "norimune_troubled"
            },
            {
                pages: [
                    {
                        text:
                            "何か欲しいものはあるかい。",
                        expression: "norimune_normal"
                    },
                    {
                        text:
                            "僕に用意できるものなら、考えてみよう。",
                        expression: "norimune_smile"
                    },
                    {
                        text:
                            "ただし、何でもとは言っていないよ。",
                        expression: "norimune_tease"
                    }
                ],
                tags: ["normal"]
            },
            {
                text:
                    "うはは。そんな顔をしなくても、\n" +
                    "お前さんを追い返したりはしないさ。",
                tags: ["normal"],
                expression: "norimune_closed"
            },
            {
                text:
                    "最近、探し物が増えてしまってねぇ。\n" +
                    "探しているうちに、別のものを見つけるんだ。",
                tags: ["normal"],
                expression: "norimune_troubled"
            },
            {
                text:
                    "昔の話はいくらでもあるよ。\n" +
                    "ありすぎて、どこから話せばいいか迷ってしまうねぇ。",
                tags: ["normal"],
                expression: "norimune_think"
            },
            {
                text:
                    "年寄り扱いされることには慣れているさ。||" +
                    "……否定もしにくいからねぇ。",
                tags: ["normal"],
                expression: "norimune_closed"
            },
            {
                text:
                    "座ると立ちたくなくなる。\n" +
                    "これも経験というものかな。",
                tags: ["normal"],
                expression: "norimune_tease"
            },
            {
                text:
                    "茶を淹れようと思って立ったのに、\n" +
                    "何をしに来たのか忘れそうになることがある。",
                tags: ["normal"],
                expression: "norimune_troubled"
            },
            {
    text:
        "さっきまで扇子を探していたんだがねぇ。||" +
        "気づけば、ずっと手に持っていたよ。",
    tags: ["normal"],
    expression: "norimune_troubled"
},
{
    text:
        "座ったまま取れる場所に物を置いておくと便利だよ。||" +
        "そのうち、周りが物だらけになるけれどねぇ。",
    tags: ["normal"],
    expression: "norimune_tease"
},
{
    pages: [
        {
            text:
                "少し横になろうと思っていたんだ。",
            expression: "norimune_normal"
        },
        {
            text:
                "ほんの少しのつもりが、随分眠ってしまったらしい。",
            expression: "norimune_troubled"
        },
        {
            text:
                "うはは。年寄りには、よくあることさ。",
            expression: "norimune_closed"
        }
    ],
    tags: ["normal"]
},
{
    text:
        "茶を飲もうと思っていたのに、\n" +
        "湯を沸かしたところで満足してしまってねぇ。",
    tags: ["normal"],
    expression: "norimune_troubled"
},
{
    text:
        "僕の話が長い？||" +
        "まだ半分も話していないのだけれどねぇ。",
    tags: ["normal"],
    expression: "norimune_tease"
},
{
    text:
        "昔はもっと身軽だった気もするが……。||" +
        "昔がいつだったかは、聞かないでおくれ。",
    tags: ["normal"],
    expression: "norimune_closed"
},
{
    text:
        "また来てくれたんだねぇ。\n" +
        "うはは、今日は何を話そうか。",
    tags: ["normal"],
    expression: "norimune_smile"
},
{
    text:
        "お前さんが来る時間というのも、\n" +
        "少しずつ分かってきた気がするよ。",
    tags: ["normal"],
    expression: "norimune_tease"
},
{
    text:
        "話したいことがある日も、ない日もある。\n" +
        "それでいいんだよ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    pages: [
        {
            text:
                "今日は静かだねぇ。"
        },
        {
            text:
                "こうして誰かと同じ景色を眺めるだけの日も、悪くない。"
        }
    ],
    tags: ["normal"]
},
{
    text:
        "今日は、少し疲れた顔をしているように見える。\n" +
        "気のせいなら、それが一番だけれどねぇ。",
    tags: ["normal"],
    expression: "norimune_soft"
},
{
    text:
        "お前さんは、案外聞き上手なんだねぇ。\n" +
        "僕まで、つい話しすぎてしまう。",
    tags: ["normal"],
    expression: "norimune_closed"
},
{
    pages: [
        {
            text:
                "何も持ってこなくてもいい。"
        },
        {
            text:
                "こうして顔を見せてくれるだけで充分さ。"
        }
    ],
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "今日は少し長居をするのかい。||" +
        "うはは、僕は構わないよ。",
    tags: ["normal"],
    expression: "norimune_smile"
},
{
    text:
        "お前さんとは、何度話しても話題が尽きないねぇ。\n" +
        "不思議なものだ。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    pages: [
        {
            text:
                "今日は聞く側の気分かい。"
        },
        {
            text:
                "なら、昔話をひとつ……。"
        },
        {
            text:
                "……いや、長くなりそうだからやめておこうか。"
        }
    ],
    tags: ["normal"],
    expression: "norimune_tease"
},
        ],

        season: [
            {
                text:
                    "庭の花も、ずいぶん賑やかになったね。",
                tags: ["season"],
                expression: "norimune_smile"
            },
            {
                text:
                    "風の匂いが変わった。\n" +
                    "季節というものは、律儀だねぇ。",
                tags: ["season"],
                expression: "norimune_normal"
            },
                    {
            id: "summer_visitor_01",
            season: "summer",
            tags: ["season", "summer"],
            chance: 1,
            weight: 1,

            text:
                "暑い中、よく来てくれたねぇ。\n" +
                "まずは涼んでいくといい。",
            expression: "norimune_soft"
        },
        {
            id: "summer_wind_01",
            season: "summer",
            tags: ["season", "summer"],
            chance: 1,
            weight: 1,

            text:
                "夏の風は熱を含んでいるのに、\n" +
                "縁側を抜ける風だけは不思議と心地いい。",
            expression: "norimune_far"
        },
        {
            id: "summer_cicada_01",
            season: "summer",
            tags: ["season", "summer"],
            chance: 1,
            weight: 1,

            text:
                "蝉も元気に鳴いているねぇ。\n" +
                "あれだけ一生懸命だと、こちらまで夏だと実感するよ。",
            expression: "norimune_smile"
        },
        {
            id: "summer_shade_01",
            season: "summer",
            tags: ["season", "summer"],
            chance: 1,
            weight: 1,

            text:
                "日向ばかり歩いてきたんじゃないかい。\n" +
                "顔が少し熱そうだ。",
            expression: "norimune_soft"
        },
        {
            id: "summer_evening_01",
            season: "summer",
            time: "evening",
            tags: ["season", "summer", "time", "evening"],
            chance: 1,
            weight: 1,

            text:
                "日が落ちる頃になると、ようやく暑さも落ち着く。\n" +
                "夏はこの時間が一番好きだねぇ。",
            expression: "norimune_far"
        },
        {
            id: "summer_night_01",
            season: "summer",
            time: "night",
            tags: ["season", "summer", "time", "night"],
            chance: 1,
            weight: 1,

            text:
                "昼とは違う風が吹いている。\n" +
                "夏の夜も、案外悪くないものさ。",
            expression: "norimune_closed"
        },
        {
            id: "summer_thirst_01",
            season: "summer",
            tags: ["season", "summer"],
            chance: 1,
            weight: 1,

            text:
                "喉が渇く前に、水分は摂っておきなさい。\n" +
                "夏は、そういう油断を見逃してくれないからねぇ。",
            expression: "norimune_serious"
        },
        {
            id: "summer_cloud_01",
            season: "summer",
            tags: ["season", "summer"],
            chance: 1,
            weight: 1,

            text:
                "入道雲というものは見事だねぇ。\n" +
                "眺めているだけなら、だけれど。",
            expression: "norimune_think"
        },
        {
            id: "summer_visit_01",
            season: "summer",
            tags: ["season", "summer"],
            chance: 1,
            weight: 1,

            text:
                "暑い日ほど、人恋しくなるものなのかもしれないねぇ。||" +
                "……来てくれて、嬉しいよ。",
            expression: "norimune_gentle"
        },
        {
            id: "summer_tease_01",
            season: "summer",
            tags: ["season", "summer"],
            chance: 1,
            weight: 1,

            text:
                "そんなに暑そうな顔をして。\n" +
                "溶けてしまったら困るから、ちゃんと休んでいきなさい。",
            expression: "norimune_tease"
        },
                {
            id: "summer_morning_breeze",
            season: "summer",
            time: "morning",
            tags: ["season", "summer", "time", "morning"],
            chance: 1,
            weight: 1,

            text:
                "朝の風だけは、まだ少し涼しいねぇ。\n" +
                "夏も、この時間くらいは穏やかだ。",
            expression: "norimune_far"
        },
        {
            id: "summer_morning_cicada",
            season: "summer",
            time: "morning",
            tags: ["season", "summer", "time", "morning"],
            chance: 1,
            weight: 1,

            text:
                "蝉も鳴き始めたようだ。\n" +
                "夏は朝から賑やかだねぇ。",
            expression: "norimune_smile"
        },
        {
            id: "summer_day_shade",
            season: "summer",
            time: "day",
            tags: ["season", "summer", "time", "day"],
            chance: 1,
            weight: 1,

            text:
                "縁側の日陰は人気者だ。\n" +
                "今日は誰が先に場所を取るだろうねぇ。",
            expression: "norimune_tease"
        },
        {
            id: "summer_day_cloud",
            season: "summer",
            time: "day",
            tags: ["season", "summer", "time", "day"],
            chance: 1,
            weight: 1,

            text:
                "入道雲が高く育っている。\n" +
                "夕立が来るかもしれないねぇ。",
            expression: "norimune_think"
        },
        {
            id: "summer_day_green",
            season: "summer",
            time: "day",
            tags: ["season", "summer", "time", "day"],
            chance: 1,
            weight: 1,

            text:
                "庭の緑も、ずいぶん濃くなった。\n" +
                "夏は景色まで力強くなるものだ。",
            expression: "norimune_far"
        },
        {
            id: "summer_evening_wind",
            season: "summer",
            time: "evening",
            tags: ["season", "summer", "time", "evening"],
            chance: 1,
            weight: 1,

            text:
                "夕方になると、風まで優しくなる。\n" +
                "一日のご褒美みたいなものだねぇ。",
            expression: "norimune_gentle"
        },
        {
            id: "summer_evening_sky",
            season: "summer",
            time: "evening",
            tags: ["season", "summer", "time", "evening"],
            chance: 1,
            weight: 1,

            text:
                "夏の夕焼けは見事だ。\n" +
                "気づけば、つい眺めてしまうねぇ。",
            expression: "norimune_far"
        },
        {
            id: "summer_night_firefly",
            season: "summer",
            time: "night",
            tags: ["season", "summer", "time", "night"],
            chance: 1,
            weight: 1,

            text:
                "蛍でも飛んでいそうな夜だねぇ。\n" +
                "静かな夏の夜は、嫌いじゃない。",
            expression: "norimune_soft"
        },
        {
            id: "summer_night_stars",
            season: "summer",
            time: "night",
            tags: ["season", "summer", "time", "night"],
            chance: 1,
            weight: 1,

            text:
                "夏は星もよく見える。\n" +
                "たまには空を見上げるのも悪くないよ。",
            expression: "norimune_far"
        },
        {
            id: "summer_midnight_cool",
            season: "summer",
            time: "midnight",
            tags: ["season", "summer", "time", "midnight"],
            chance: 1,
            weight: 1,

            text:
                "昼間の暑さが嘘のようだ。\n" +
                "深夜の風は、少しだけ秋を思わせるねぇ。",
            expression: "norimune_think"
        },
        {
            id: "summer_rain",
            season: "summer",
            tags: ["season", "summer"],
            chance: 1,
            weight: 1,

            text:
                "夕立が来ると、暑さも少し和らぐ。\n" +
                "雨上がりの匂いは、夏ならではだねぇ。",
            expression: "norimune_soft"
        },
        {
            id: "summer_water",
            season: "summer",
            tags: ["season", "summer"],
            chance: 1,
            weight: 1,

            text:
                "井戸水で手を冷やすだけでも、ずいぶん違う。\n" +
                "昔ながらの知恵というものさ。",
            expression: "norimune_smile"
        },
        {
            id: "summer_wind_chime",
            season: "summer",
            tags: ["season", "summer"],
            chance: 1,
            weight: 1,

            text:
                "風鈴の音は、不思議だねぇ。\n" +
                "涼しくなった気がしてしまう。",
            expression: "norimune_closed"
        },
        {
            id: "summer_tea",
            season: "summer",
            tags: ["season", "summer"],
            chance: 1,
            weight: 1,

            text:
                "こんな日は、冷たい茶が美味い。\n" +
                "ゆっくり飲んでいくといい。",
            expression: "norimune_gentle"
        },
        {
            id: "summer_sun",
            season: "summer",
            tags: ["season", "summer"],
            chance: 1,
            weight: 1,

            text:
                "夏の日差しは手加減を知らない。\n" +
                "無茶だけはしないようにねぇ。",
            expression: "norimune_serious"
        },
        {
    text:
        "夏というのは、不思議だねぇ。\n" +
        "暑い暑いと言いながら、毎年ちゃんと恋しくなる。",
    tags: ["season", "summer"],
    season: "summer",
    expression: "norimune_far"
},
{
    text:
        "縁側で風を待つのも、夏の楽しみさ。\n" +
        "急いでも、風は急いでくれないからねぇ。",
    tags: ["season", "summer"],
    season: "summer",
    expression: "norimune_gentle"
},
{
    text:
        "風鈴というものは不思議だ。\n" +
        "音ひとつで、少し涼しくなった気がしてしまう。",
    tags: ["season", "summer"],
    season: "summer",
    expression: "norimune_closed"
},

        ],

        honmaru: [
            {
                text: "主なら、今は出掛けているよ。",
                tags: ["honmaru"],

                excludeConditions: [
                    {
                        time: [
                            "morning",
                            "night",
                            "midnight"
                        ]
                    }
                ],

    expression: "norimune_normal"
},
            {
                text:
                    "この本丸も、静かに見えて案外忙しい。",
                tags: ["honmaru"],
                expression: "norimune_fan"
            },
            {
                text:
                    "皆それぞれに過ごしているよ。\n" +
                    "僕も、この通りだ。",
                tags: ["honmaru"],
                expression: "norimune_smile",
                excludeConditions: [
                    {
                        time: [
                            "midnight"
                        ]
                    }
                ],
            },
                        {
                text:
                    "清光と安定が何やら騒いでいたよ。||" +
                    "……まあ、元気なのはいいことだ。",
                tags: ["honmaru"],
                expression: "norimune_closed"
            },
            {
                text:
                    "あの二振りは口こそ達者だが、\n" +
                    "根は素直なんだよ。",
                tags: ["honmaru"],
                expression: "norimune_gentle"
            },
            {
                text:
                    "堀川はよく働いてくれる。\n" +
                    "書類仕事まで楽しそうなのだから、助かるねぇ。",
                tags: ["honmaru"],
                expression: "norimune_smile"
            },
            {
                text:
                    "細かい仕事は苦手でねぇ。||" +
                    "だから堀川に任せている。\n" +
                    "餅は餅屋というやつさ。",
                tags: ["honmaru"],
                expression: "norimune_troubled"
            },
            {
                text:
                    "厨の方から、いい匂いがしているねぇ。\n" +
                    "今日は和泉守の当番らしい。",
                tags: ["honmaru"],
                expression: "norimune_soft",
                excludeConditions: [
                    {
                        time: [
                            "night",
                            "midnight"
                        ]
                    }
                ],
            },
            {
                text:
                    "和泉守は面倒見がいい。\n" +
                    "本人は照れて認めないだろうけれどねぇ。",
                tags: ["honmaru"],
                expression: "norimune_tease"
            },
            {
                text:
                    "長曽祢とは、よく杯を交わしているよ。\n" +
                    "気づけば夜も更けているものさ。",
                tags: ["honmaru"],
                expression: "norimune_far"
            },
            {
                text:
                    "長曽祢は何かと気が利く。\n" +
                    "僕もつい頼ってしまうねぇ。",
                tags: ["honmaru"],
                expression: "norimune_gentle"
            },
            {
                text:
                    "孫六とは、時折手合わせもするよ。||" +
                    "もっとも、遊びのようなものだけれど。",
                tags: ["honmaru"],
                expression: "norimune_smile"
            },
            {
                text:
                    "天才剣士の役を任されることが多くてねぇ。||" +
                    "うはは、なかなか忙しいものさ。",
                tags: ["honmaru"],
                expression: "norimune_closed"
            },
            {
                text:
                    "三日月とは、よく縁側で茶を飲む。||" +
                    "話が長くなるのは、お互い様だねぇ。",
                tags: ["honmaru"],
                expression: "norimune_smile"
            },
            {
                pages: [
                    {
                        text:
                            "三日月に主の話をしていたらね。",
                        expression: "norimune_far"
                    },
                    {
                        text:
                            "『はっはっは、それは結構なことだ』と笑われてしまったよ。",
                        expression: "norimune_closed"
                    }
                ],
                tags: ["honmaru"]
            },
            {
                text:
                    "本丸というものは面白い。\n" +
                    "静かな日ほど、誰かが何か企んでいるものだからねぇ。",
                tags: ["honmaru"],
                expression: "norimune_tease"
            },
            {
                text:
                    "今日は珍しく静かだと思ったら、\n" +
                    "皆それぞれ好きに過ごしているようだ。",
                tags: ["honmaru"],
                expression: "norimune_normal"
            },
            {
                text:
                    "ここへ来れば、誰かしらと顔を合わせる。\n" +
                    "それも本丸らしさ、というものだろう。",
                tags: ["honmaru"],
                expression: "norimune_gentle"
            },
            {
    text:
        "暑い日は、清光も安定も口だけは元気だねぇ。||" +
        "あれだけ言い合えるなら、今年の夏も心配はいらない。",
    tags: ["season", "summer", "honmaru"],
    season: "summer",
    expression: "norimune_closed"
},
{
    text:
        "和泉守が氷を多めに用意してくれていてねぇ。\n" +
        "暑い日ほど、あの気遣いが身に染みるよ。",
    tags: ["season", "summer", "honmaru"],
    season: "summer",
    expression: "norimune_soft"
},
{
    text:
        "堀川が書類を風で飛ばしてしまってねぇ。||" +
        "拾う方が大変だったらしい。",
    tags: ["season", "summer", "honmaru"],
    season: "summer",
    expression: "norimune_tease"
},
{
    text:
        "長曽祢が冷やした茶を持ってきてくれたよ。\n" +
        "気が利く男というのは、ありがたいものだねぇ。",
    tags: ["season", "summer", "honmaru"],
    season: "summer",
    expression: "norimune_gentle"
},
{
    text:
        "孫六が『暑いから今日は手合わせはなしだ』と言っていてねぇ。||" +
        "天才剣士役としては、少し残念だったよ。",
    tags: ["season", "summer", "honmaru"],
    season: "summer",
    expression: "norimune_tease"
},
{
    pages: [
        {
            text:
                "三日月と茶を飲んでいたんだ。",
            expression: "norimune_far"
        },
        {
            text:
                "話題はいつものように主のことさ。\n" +
                "あれも随分、楽しそうに聞いてくれるからねぇ。",
            expression: "norimune_gentle"
        }
    ],
    tags: ["season", "summer", "honmaru"],
    season: "summer"
},
{
    pages: [
        {
            text:
                "三日月と茶を飲んでいたんだ。",
            expression: "norimune_far"
        },
        {
            text:
                "話題はいつものように主のことさ。\n" +
                "あれも随分、楽しそうに聞いてくれるからねぇ。",
            expression: "norimune_gentle"
        }
    ],
    tags: ["season", "summer", "honmaru"],
    season: "summer"
},
{
    text:
        "清光と安定は、今日も好き勝手に言っていたよ。||" +
        "僕が聞いていないと思っているのかねぇ。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    pages: [
        {
            text:
                "安定に、少し休んだらどうだと言ったんだ。",
            expression: "norimune_normal"
        },
        {
            text:
                "そうしたら、僕にだけは言われたくないと返されてしまったよ。",
            expression: "norimune_closed"
        }
    ],
    tags: ["honmaru"]
},
{
    text:
        "清光はよく僕の身なりに口を出すねぇ。||" +
        "あれで案外、よく見ているんだよ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "安定も清光も、僕を年寄り扱いするくせに、\n" +
        "困った時にはこちらを見るんだ。||" +
        "うはは。かわいいものだろう。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    pages: [
        {
            text:
                "清光に、少しは若々しくしたらどうだと言われてねぇ。",
            expression: "norimune_troubled"
        },
        {
            text:
                "これ以上若返ったら、あれも困るだろうに。",
            expression: "norimune_tease"
        }
    ],
    tags: ["honmaru"]
},
{
    text:
        "堀川は、僕が頼む前に書類を整えてしまう。\n" +
        "実に頼もしいねぇ。",
    tags: ["honmaru"],
    expression: "norimune_smile"
},
{
    text:
        "細かな仕事は堀川に任せているよ。||" +
        "僕が手を出すより、よほど早くて確かだからねぇ。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    pages: [
        {
            text:
                "堀川に、少しくらい休んだらどうだと言ったんだ。",
            expression: "norimune_normal"
        },
        {
            text:
                "『これが楽しいんです』と笑われてしまってねぇ。",
            expression: "norimune_smile"
        },
        {
            text:
                "和泉守のこととなると、あれも随分と働き者になる。",
            expression: "norimune_tease"
        }
    ],
    tags: ["honmaru"]
},
{
    text:
        "僕の机が片づいている時は、\n" +
        "だいたい堀川が来たあとだと思っていい。",
    tags: ["honmaru"],
    expression: "norimune_troubled"
},
{
    text:
        "和泉守は、あれで随分と世話焼きだ。||" +
        "本人に言えば、きっと嫌な顔をするだろうけれどねぇ。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "厨から大きな声が聞こえたかい。||" +
        "和泉守が、誰かのつまみ食いを見つけたんだろう。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    pages: [
        {
            text:
                "和泉守に、今日は何が食べたいと聞かれてね。",
            expression: "norimune_normal"
        },
        {
            text:
                "何でもいいと答えたら、それが一番困ると言われてしまったよ。",
            expression: "norimune_troubled"
        }
    ],
    tags: ["honmaru"]
},
{
    text:
        "腹が減った者を放っておけないのが、和泉守の性分らしい。||" +
        "まったく、頼もしい厨番長だねぇ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "長曽祢には、何かと任せてしまっているよ。\n" +
        "あれがいると、本丸全体がよく回る。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "長曽祢は、僕が忘れた頃に確認へ来る。||" +
        "実に隙がないねぇ。",
    tags: ["honmaru"],
    expression: "norimune_troubled"
},
{
    pages: [
        {
            text:
                "昨夜も長曽祢と少し飲んでいてね。",
            expression: "norimune_far"
        },
        {
            text:
                "少しのつもりが長くなるのは、いつものことさ。",
            expression: "norimune_closed"
        }
    ],
    tags: ["honmaru"]
},
{
    text:
        "僕がのんびりしていられるのも、\n" +
        "長曽祢が目を配ってくれているからだよ。",
    tags: ["honmaru"],
    expression: "norimune_soft"
},
{
    text:
        "孫六は、蔵のこととなると随分と細かい。\n" +
        "僕には真似できそうもないねぇ。",
    tags: ["honmaru"],
    expression: "norimune_smile"
},
{
    pages: [
        {
            text:
                "孫六が、今日は斎藤一役の気分ではないと言っていてねぇ。",
            expression: "norimune_normal"
        },
        {
            text:
                "では誰をやるつもりなのかと聞いたら、\n" +
                "それは考えていなかったらしい。",
            expression: "norimune_closed"
        }
    ],
    tags: ["honmaru"]
},
{
    text:
        "手合わせでは、僕が天才剣士役で孫六が斎藤一役だ。||" +
        "いつの間にか、すっかり決まり事になってしまったよ。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "長曽祢と孫六と飲んでいると、\n" +
        "昔話が尽きなくてねぇ。||" +
        "話しているうちに、夜が明けそうになる。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    text:
        "三日月とは、何を話すでもなく茶を飲むこともある。||" +
        "あれくらいの歳になると、沈黙も話のうちなのさ。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    pages: [
        {
            text:
                "三日月に、また主の話かと笑われてしまってねぇ。",
            expression: "norimune_troubled"
        },
        {
            text:
                "僕としては、まだ話し始めたばかりだったのだけれど。",
            expression: "norimune_tease"
        }
    ],
    tags: ["honmaru"]
},
{
    text:
        "三日月は、人の話を聞いているのか分からない顔をしているだろう。||" +
        "あれで、案外よく覚えているんだよ。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "主の話をしていると、三日月はよく笑う。||" +
        "何がそんなに面白いのか、一度じっくり聞いてみたいものだ。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},

        ]
    };

    /*
     * ─────────────────────────────
     * 時間帯限定会話
     * ─────────────────────────────
     *
     * 従来形式のまま使用できます。
     * 自動的にtimeタグと時間帯タグが付きます。
     */

    const TIME_TALK_DATA = {
        morning: [
            {
                text:
                    "朝餉は済ませたのかい。\n" +
                    "空腹のままでは、頭も働かないよ。",
                tags: ["normal"],
                expression: "norimune_normal"
            },
            {
                text:
                    "朝露がまだ残っている。\n" +
                    "庭を歩くなら、足元に気をつけなさい。",
                tags: ["normal"],
                expression: "norimune_smile"
            },
                        {
                text:
                    "朝稽古も終わって、一息ついたところさ。\n" +
                    "朝の空気というものは、やはり気持ちがいいねぇ。",
                tags: ["normal"],
                expression: "norimune_far"
            },
            {
                text:
                    "皆、朝からよく身体を動かしていたよ。\n" +
                    "一日の始まりには、ちょうどいいらしい。",
                tags: ["honmaru"],
                expression: "norimune_smile"
            },
            {
                text:
                    "掃除を終えたばかりだからねぇ。\n" +
                    "今日は廊下も気持ちよく歩けるよ。",
                tags: ["honmaru"],
                expression: "norimune_soft"
            },
            {
                text:
                    "ちょうど朝餉を済ませたところなんだ。\n" +
                    "皆で囲む食卓というのは、賑やかでいいものだねぇ。",
                tags: ["honmaru"],
                expression: "norimune_gentle"
            },
            {
                text:
                    "朝は何かと忙しい時間だけれど、\n" +
                    "不思議と嫌いにはなれないねぇ。",
                tags: ["normal"],
                expression: "norimune_normal"
            },
            {
                text:
                    "早起きは得意かい。||" +
                    "僕は慣れてしまったからねぇ。\n" +
                    "もう身体が勝手に起きるんだよ。",
                tags: ["normal"],
                expression: "norimune_closed"
            },
            {
                text:
                    "朝の日差しは、どこか背中を押してくれる。\n" +
                    "今日も良い一日になるといいねぇ。",
                tags: ["normal"],
                expression: "norimune_gentle"
            },
            {
                text:
                    "今日は安定も清光も、朝から元気だったよ。||" +
                    "朝餉の席も、ずいぶん賑やかだった。",
                tags: ["honmaru"],
                expression: "norimune_troubled"
            },
            {
                text:
                    "和泉守は朝から厨で忙しそうだった。\n" +
                    "皆の腹を満たすのも、大仕事だからねぇ。",
                tags: ["honmaru"],
                expression: "norimune_soft"
            },
            {
                text:
                    "朝は皆の足音が本丸中に響く。\n" +
                    "静かなようで、一番活気のある時間かもしれないねぇ。",
                tags: ["honmaru"],
                expression: "norimune_far"
            },
            {
                pages: [
                    {
                        text:
                            "朝餉の時間になるとね。",
                        expression: "norimune_smile"
                    },
                    {
                        text:
                            "自然と皆が集まってくる。\n" +
                            "誰に言われるでもなく、そうなるのが面白い。",
                        expression: "norimune_gentle"
                    }
                ],
                tags: ["honmaru"]
            },
            {
                text:
                    "朝は頭も冴えている。\n" +
                    "考え事をするには、ちょうどいい時間さ。",
                tags: ["normal"],
                expression: "norimune_think"
            },
            {
                text:
                    "朝は自然と目が覚めるようになってしまってねぇ。\n" +
                    "寝坊というものを、ずいぶんしていない。",
                tags: ["normal"],
                expression: "norimune_troubled"
            },
            {
                text:
                    "朝の茶は格別だ。\n" +
                    "……いや、昼も夜も美味いのだけれどねぇ。",
                tags: ["normal"],
                expression: "norimune_closed"
            },
            {
    text:
        "朝の風だけは、まだ夏に遠慮しているようだ。\n" +
        "今のうちに、涼しさを楽しんでおこうか。",
    tags: ["season", "summer", "time", "morning"],
    season: "summer",
    time: "morning",
    expression: "norimune_far"
},
{
    text:
        "朝露も、もうすぐ消えてしまうねぇ。\n" +
        "夏の日差しは働き者だ。",
    tags: ["season", "summer", "time", "morning"],
    season: "summer",
    time: "morning",
    expression: "norimune_gentle"
},
{
    pages: [
        {
            text:
                "朝から来るとは、早起きなんだねぇ。"
        },
        {
            text:
                "僕も茶を淹れたところだ。"
        }
    ],
    tags: ["season", "summer", "time", "morning"],
    season: "summer",
    time: "morning",
    expression: "norimune_smile"
},
        ],

        day: [
            {
                text:
                    "日が高いねぇ。\n" +
                    "縁側にいると、少し眠くなる。",
                tags: ["normal"],
                expression: "norimune_smile"
            },
            {
                text:
                    "昼餉のあとは、皆いくらか静かになるものさ。",
                tags: ["normal"],
                expression: "norimune_normal"
            },
                        {
                text:
                    "遠征組は、もうとっくに出掛けているよ。\n" +
                    "帰ってくる頃には、また賑やかになるだろうねぇ。",
                tags: ["honmaru"],
                expression: "norimune_far"
            },
            {
                text:
                    "昼になると、本丸も少し落ち着く。\n" +
                    "静かな時間というのは、案外短いものさ。",
                tags: ["honmaru"],
                expression: "norimune_normal"
            },
            {
                text:
                    "皆それぞれ持ち場で励んでいるよ。\n" +
                    "誰も彼も、よく働くものだねぇ。",
                tags: ["honmaru"],
                expression: "norimune_smile"
            },
            {
                text:
                    "堀川なら、さっきも書類を抱えて歩いていたよ。||" +
                    "あれだけ楽しそうなら、任せた甲斐があるというものさ。",
                tags: ["honmaru"],
                expression: "norimune_closed"
            },
            {
                text:
                    "和泉守は、もう昼餉の支度を始めている頃かな。\n" +
                    "厨からいい匂いがしてきそうだ。",
                tags: ["honmaru"],
                expression: "norimune_soft"
            },
            {
                text:
                    "長曽祢は昼でも忙しそうでねぇ。\n" +
                    "本丸全体を見て回るのも、大変な役目だ。",
                tags: ["honmaru"],
                expression: "norimune_gentle"
            },
            {
                text:
                    "昼の日差しは容赦がないねぇ。\n" +
                    "縁側の陰がありがたく感じるよ。",
                tags: ["normal"],
                expression: "norimune_far"
            },
            {
                text:
                    "眠くなる時間かい。||" +
                    "うはは、それは皆同じさ。",
                tags: ["normal"],
                expression: "norimune_tease"
            },
            {
                text:
                    "少し休んでいくといい。\n" +
                    "慌ただしい中にも、息をつく時間は必要だからねぇ。",
                tags: ["normal"],
                expression: "norimune_soft"
            },
            {
                text:
                    "今頃、遠征先でも頑張っているだろう。\n" +
                    "無事に戻ってきてくれるのを待つのも、大切な役目さ。",
                tags: ["honmaru"],
                expression: "norimune_serious"
            },
            {
                pages: [
                    {
                        text:
                            "昼の本丸は静かだろう。",
                        expression: "norimune_far"
                    },
                    {
                        text:
                            "こうしてお前さんと話していると、\n" +
                            "時間までゆっくり流れているように思えるねぇ。",
                        expression: "norimune_gentle"
                    }
                ],
                tags: ["normal"]
            },
            {
                text:
                    "暑い日ほど、焦らず過ごすことだ。\n" +
                    "急いでも、涼しくはならないからねぇ。",
                tags: ["normal"],
                expression: "norimune_troubled"
            },
            {
                text:
                    "縁側に座っているとね。\n" +
                    "つい、うとうとしてしまいそうになる。",
                tags: ["normal"],
                expression: "norimune_troubled"
            },
            {
                text:
                    "若い頃なら落ち着かない時間だったんだろうけれど。\n" +
                    "今はこういう時間も悪くない。",
                tags: ["normal"],
                expression: "norimune_far"
            },
            {
    text:
        "今日は蝉の方が元気そうだ。\n" +
        "僕はもう、縁側から応援することにしたよ。",
    tags: ["season", "summer", "time", "day"],
    season: "summer",
    time: "day",
    expression: "norimune_closed"
},
{
    text:
        "こんな日は、何もしないのも立派な予定さ。\n" +
        "夏に無理は禁物だからねぇ。",
    tags: ["season", "summer", "time", "day"],
    season: "summer",
    time: "day",
    expression: "norimune_soft"
},
{
    text:
        "冷たい茶を淹れたんだ。\n" +
        "よければ、お前さんの分もあるよ。",
    tags: ["season", "summer", "time", "day"],
    season: "summer",
    time: "day",
    expression: "norimune_gentle"
},
        ],

        evening: [
            {
                text:
                    "西の空が、ずいぶん赤い。\n" +
                    "もうじき日が暮れるね。",
                tags: ["normal"],
                expression: "norimune_normal"
            },
            {
                text:
                    "夕餉の支度をする音が聞こえる。\n" +
                    "この時間の本丸は、少し賑やかだ。",
                tags: ["honmaru"],
                expression: "norimune_smile"
            },
                        {
                text:
                    "遠征組も、そろそろ戻る頃だねぇ。\n" +
                    "門の方が少し気になってきたよ。",
                tags: ["honmaru"],
                expression: "norimune_far"
            },
            {
                text:
                    "昼の静けさも、もう終わりだ。\n" +
                    "皆が戻れば、また本丸らしい賑わいになる。",
                tags: ["honmaru"],
                expression: "norimune_smile"
            },
            {
                text:
                    "夕餉の支度が始まったようだねぇ。\n" +
                    "厨から、いい匂いが流れてきている。",
                tags: ["honmaru"],
                expression: "norimune_soft"
            },
            {
                text:
                    "和泉守が厨に立つと、\n" +
                    "誰も彼も少し落ち着かなくなるねぇ。",
                tags: ["honmaru"],
                expression: "norimune_tease"
            },
            {
                pages: [
                    {
                        text:
                            "遠征から戻った者は、まず長曽祢のところへ顔を出す。",
                        expression: "norimune_normal"
                    },
                    {
                        text:
                            "報告を終えるまでが遠征だからねぇ。",
                        expression: "norimune_serious"
                    }
                ],
                tags: ["honmaru"]
            },
            {
                text:
                    "堀川も、そろそろ書類を片づけている頃かな。\n" +
                    "夕餉まで仕事を抱えさせるわけにもいかないからねぇ。",
                tags: ["honmaru"],
                expression: "norimune_gentle"
            },
            {
                text:
                    "西日が廊下の奥まで差し込んでいる。\n" +
                    "この時間の本丸は、昼より少し柔らかく見えるねぇ。",
                tags: ["normal"],
                expression: "norimune_far"
            },
            {
                text:
                    "夕方になると、一日が急に短く思える。\n" +
                    "まだ何もしていないような気さえするねぇ。",
                tags: ["normal"],
                expression: "norimune_think"
            },
            {
                text:
                    "今日も一日、よく励んだねぇ。\n" +
                    "ここから先は、少し肩の力を抜くといい。",
                tags: ["normal"],
                expression: "norimune_soft"
            },
            {
                text:
                    "日が落ちる前の風は、心地がいい。\n" +
                    "帰るには、少し惜しい時間だねぇ。",
                tags: ["normal"],
                expression: "norimune_gentle"
            },
            {
                pages: [
                    {
                        text:
                            "お前さんも、遠征組の帰りが気になるのかい。",
                        expression: "norimune_tease"
                    },
                    {
                        text:
                            "うはは。\n" +
                            "無事な顔を見るまでは、誰でもそうなるものさ。",
                        expression: "norimune_closed"
                    }
                ],
                tags: ["honmaru"]
            },
            {
                text:
                    "安定と清光が戻ってくる日は、\n" +
                    "門の外からでも分かることがあるよ。||" +
                    "静かに帰ってくる気が、あまりないらしい。",
                tags: ["honmaru"],
                expression: "norimune_troubled"
            },
            {
                text:
                    "遠征帰りは腹も減るだろう。\n" +
                    "和泉守も、いつもより多めに用意しているはずさ。",
                tags: ["honmaru"],
                expression: "norimune_smile"
            },
            {
                text:
                    "夕暮れは、待つには悪くない時間だ。\n" +
                    "空を見ていれば、案外すぐに帰ってくるよ。",
                tags: ["normal"],
                expression: "norimune_far"
            },
            {
                text:
                    "日が沈むのを見るたび、一日が早くなったものだと思うよ。\n" +
                    "年のせいかもしれないねぇ。",
                tags: ["normal"],
                expression: "norimune_closed"
            },
            {
                text:
                    "夕暮れになると茶が恋しくなる。\n" +
                    "……毎日飲んでいるのだけれど。",
                tags: ["normal"],
                expression: "norimune_tease"
            },
            {
    text:
        "日が傾くと、ようやく夏も大人しくなる。\n" +
        "ほっとする時間だねぇ。",
    tags: ["season", "summer", "time", "evening"],
    season: "summer",
    time: "evening",
    expression: "norimune_far"
},
{
    pages: [
        {
            text:
                "空が茜色になってきた。"
        },
        {
            text:
                "夏の夕暮れは、つい眺めてしまうねぇ。"
        }
    ],
    tags: ["season", "summer", "time", "evening"],
    season: "summer",
    expression: "norimune_soft"
},
{
    text:
        "夕立が来そうな空だ。\n" +
        "帰り道は、気をつけるんだよ。",
    tags: ["season", "summer", "time", "evening"],
    season: "summer",
    time: "evening",
    expression: "norimune_serious"
},
        ],

        night: [
            {
                text:
                    "夜風は冷える。\n" +
                    "あまり長く当たらない方がいい。",
                tags: ["normal"],
                expression: "norimune_normal"
            },
            {
                text:
                    "行灯の火というものは、\n" +
                    "眺めていると妙に落ち着くねぇ。",
                tags: ["normal"],
                expression: "norimune_fan"
            },
                        {
                text:
                    "夕餉も済んで、ようやく本丸が落ち着いてきたねぇ。\n" +
                    "昼とは違う静けさだ。",
                tags: ["honmaru"],
                expression: "norimune_far"
            },
            {
                text:
                    "皆、それぞれ部屋へ戻ったようだ。\n" +
                    "まだ廊下を歩く音は聞こえるけれどねぇ。",
                tags: ["honmaru"],
                expression: "norimune_normal"
            },
            {
                text:
                    "遠征組も無事に戻って、今夜はひと安心さ。\n" +
                    "顔を見れば、それで充分なこともある。",
                tags: ["honmaru"],
                expression: "norimune_gentle"
            },
            {
                text:
                    "清光と安定なら、まだ何か言い合っていたよ。||" +
                    "あれで仲がいいのだから、面白いものだねぇ。",
                tags: ["honmaru"],
                expression: "norimune_closed"
            },
            {
                text:
                    "和泉守も、ようやく厨から解放された頃かな。\n" +
                    "朝から晩まで、よく働くものさ。",
                tags: ["honmaru"],
                expression: "norimune_soft"
            },
            {
                text:
                    "堀川には、もう仕事を切り上げるよう言っておいたよ。||" +
                    "放っておくと、いつまでも続けそうだからねぇ。",
                tags: ["honmaru"],
                expression: "norimune_troubled"
            },
            {
                text:
                    "長曽祢と孫六は、今頃一杯やっているかもしれない。\n" +
                    "僕もあとで顔を出そうかな。",
                tags: ["honmaru"],
                expression: "norimune_smile"
            },
            {
                pages: [
                    {
                        text:
                            "三日月と夜の縁側で茶を飲むこともある。",
                        expression: "norimune_far"
                    },
                    {
                        text:
                            "話題は尽きないよ。\n" +
                            "主の話となれば、なおさらねぇ。",
                        expression: "norimune_tease"
                    }
                ],
                tags: ["honmaru"]
            },
            {
                text:
                    "夜風に当たりに来たのかい。\n" +
                    "冷えないうちに、戻るんだよ。",
                tags: ["normal"],
                expression: "norimune_soft"
            },
            {
                text:
                    "夜は、昼には聞こえなかった音までよく届く。\n" +
                    "虫の声も、遠くの足音もねぇ。",
                tags: ["normal"],
                expression: "norimune_far"
            },
            {
                text:
                    "眠るには、まだ少し早いかい。||" +
                    "なら、もうしばらく話していこう。",
                tags: ["normal"],
                expression: "norimune_gentle"
            },
            {
                text:
                    "今日あったことを、夜まで引きずる必要はないさ。\n" +
                    "明日のことは、明日の朝に考えればいい。",
                tags: ["normal"],
                expression: "norimune_serious"
            },
            {
                text:
                    "一日が終わる頃になって、\n" +
                    "ようやく気づくこともあるものだねぇ。",
                tags: ["normal"],
                expression: "norimune_think"
            },
            {
                text:
                    "夜更かしを勧めるつもりはないが、\n" +
                    "少しくらいなら、僕も付き合うよ。",
                tags: ["normal"],
                expression: "norimune_tease"
            },
                        {
                pages: [
                    {
                        text:
                            "もう帰るのかい。",
                        expression: "norimune_surprised"
                    },
                    {
                        text:
                            "……まだここにいる？\n" +
                            "うはは、あまり遅くならないようにね。",
                        expression: "norimune_soft"
                    }
                ],
                tags: ["normal"]
            },
            {
                text:
                    "夜は静かで好きだよ。\n" +
                    "賑やかなのも好きだが、静かな時間もまた贅沢だからねぇ。",
                tags: ["normal"],
                expression: "norimune_gentle"
            },
            {
                text:
                    "今日は何杯茶を飲んだかな。\n" +
                    "数えるのは途中でやめてしまったよ。",
                tags: ["normal"],
                expression: "norimune_smile"
            },
            {
    text:
        "昼間とは別の風が吹いている。\n" +
        "夏は夜になってからが本番だねぇ。",
    tags: ["season", "summer", "time", "night"],
    season: "summer",
    time: "night",
    expression: "norimune_closed"
},
{
    text:
        "虫の声が賑やかだ。\n" +
        "蝉から引き継いで、今度は夜組の出番らしい。",
    tags: ["season", "summer", "time", "night"],
    season: "summer",
    time: "night",
    expression: "norimune_smile"
},
{
    pages: [
        {
            text:
                "夜風は気持ちがいいねぇ。"
        },
        {
            text:
                "昼の暑さを忘れさせてくれる。"
        }
    ],
    tags: ["season", "summer", "time", "night"],
    season: "summer",
    expression: "norimune_far"
},
        ],

                midnight: [
            {
                text:
                    "さすがに皆、寝静まったようだね。",
                tags: ["normal"],
                expression: "norimune_normal"
            },
            {
                text:
                    "眠れないのなら、少しくらいは付き合うさ。",
                tags: ["normal"],
                expression: "norimune_smile"
            },
            {
                pages: [
                    {
                        text:
                            "夜更かしを咎めるつもりはないが、\n" +
                            "明日に響かないようにするんだよ。",
                        expression: "norimune_normal"
                    },
                    {
                        text:
                            "……僕もだろうって？\n" +
                            "うはは、それもそうだ。",
                        expression: "norimune_fan"
                    }
                ],
                tags: ["normal"]
            },
            {
                text:
                    "皆、もう寝静まったようだねぇ。\n" +
                    "本丸も、ずいぶん静かになった。",
                tags: ["honmaru"],
                expression: "norimune_far"
            },
            {
                text:
                    "この時間になると、廊下を歩く音ひとつでもよく響く。\n" +
                    "夜というものは不思議だねぇ。",
                tags: ["normal"],
                expression: "norimune_far"
            },
            {
                text:
                    "眠れない夜というのは、誰にでもある。\n" +
                    "そんな日くらいは、無理に眠ろうとしなくてもいいさ。",
                tags: ["normal"],
                expression: "norimune_soft"
            },
            {
                text:
                    "……おや。\n" +
                    "こんな時間に来るとは思わなかったよ。",
                tags: ["normal"],
                expression: "norimune_surprised"
            },
            {
                text:
                    "夜更かし仲間が増えてしまったねぇ。||" +
                    "まあ、今夜くらいは付き合おうか。",
                tags: ["normal"],
                expression: "norimune_closed"
            },
            {
                text:
                    "三日月なら、まだ起きているかもしれない。\n" +
                    "もっとも、会えばまた話し込んでしまうだろうけれど。",
                tags: ["honmaru"],
                expression: "norimune_smile"
            },
            {
                text:
                    "長曽祢たちの部屋から灯りが見えることもある。\n" +
                    "静かに杯を交わしているのかもしれないねぇ。",
                tags: ["honmaru"],
                expression: "norimune_far"
            },
            {
                text:
                    "昼間は賑やかな本丸も、\n" +
                    "夜更けになると別の場所のように感じる。",
                tags: ["honmaru"],
                expression: "norimune_think"
            },
            {
                pages: [
                    {
                        text:
                            "眠くはないのかい。",
                        expression: "norimune_gentle"
                    },
                    {
                        text:
                            "なら、少しだけ話し相手になろう。\n" +
                            "静かな夜も悪くないからねぇ。",
                        expression: "norimune_soft"
                    }
                ],
                tags: ["normal"]
            },
            {
                text:
                    "夜は考え事が増えるものだ。\n" +
                    "けれど答えは、案外朝になって見つかることも多い。",
                tags: ["normal"],
                expression: "norimune_serious"
            },
            {
                text:
                    "今は虫の声くらいしか聞こえない。\n" +
                    "こうして耳を澄ませる時間も、僕は好きだよ。",
                tags: ["normal"],
                expression: "norimune_far"
            },
            {
                text:
                    "うとうとしてきたかい。||" +
                    "それなら今日は、いい頃合いだ。",
                tags: ["normal"],
                expression: "norimune_gentle"
            },
            {
                text:
                    "眠れないからといって、自分を責めることはない。\n" +
                    "そんな夜もあるさ。",
                tags: ["normal"],
                expression: "norimune_soft"
            },
            {
                text:
                    "こんな時間に話し相手がいるとはねぇ。\n" +
                    "僕としては、少し得をした気分だ。",
                tags: ["normal"],
                expression: "norimune_troubled"
            },
            {
                pages: [
                    {
                        text:
                            "夜更けは秘密が増える時間だ。",
                        expression: "norimune_tease"
                    },
                    {
                        text:
                            "安心おし。\n" +
                            "お前さんがここへ来たことも、誰にも話しはしないよ。",
                        expression: "norimune_closed"
                    }
                ],
                tags: ["normal"]
            },
            {
                text:
                    "朝が来れば、また皆の声が聞こえてくる。\n" +
                    "静かな時間も、あと少しだけだねぇ。",
                tags: ["honmaru"],
                expression: "norimune_far"
            },
            {
                text:
                    "昔話でもしようかと思ったが……。\n" +
                    "話し始めると朝になってしまいそうだ。",
                tags: ["normal"],
                expression: "norimune_tease"
            },
            {
                text:
                    "年寄りは朝が早いと言うだろう。||" +
                    "……僕のことかい？\n" +
                    "うはは、それは秘密だ。",
                tags: ["normal"],
                expression: "norimune_closed"
            },
            {
    text:
        "少し涼しくなったからといって、\n" +
        "油断すると風邪を引くよ。",
    tags: ["season", "summer", "time", "midnight"],
    season: "summer",
    time: "midnight",
    expression: "norimune_soft"
},
{
    pages: [
        {
            text:
                "こんな時間まで起きているとは。"
        },
        {
            text:
                "眠れない夜なら、少し話していこうか。"
        }
    ],
    tags: ["season", "summer", "time", "midnight"],
    season: "summer",
    expression: "norimune_gentle"
},
            
        ]
    };

    /*
     * ─────────────────────────────
     * 訪問回数条件会話
     * ─────────────────────────────
     */

    const VISIT_TALK_DATA = [
        {
            id: "third_talk",
            count: 10,
            chance: 1,
            once: true,
            priority: 100,

            text: "今日はよく話すねぇ。",
            expression: "norimune_smile"
        },
        {
            id: "seventh_talk",
            count: 20,
            chance: 1,
            once: true,
            priority: 100,

            pages: [
                {
                    text:
                        "まだ帰る気はないらしい。",
                    expression: "norimune_normal"
                },
                {
                    text:
                        "まあ、僕は構わないけれどね。",
                    expression: "norimune_smile"
                }
            ]
        },
        {
            id: "long_stay_random",
            minCount: 30,
            maxCount: 40,
            chance: 0.25,
            once: true,
            priority: 50,

            text:
                "ずいぶん長居をしているねぇ。\n" +
                "居心地がいいのなら、何よりだ。",
            expression: "norimune_smile"
        },
        {
            id: "very_long_stay",
            minCount: 50,
            chance: 0.1,
            once: false,
            priority: 10,

            text:
                "お前さん、今日はここで暮らすつもりかい。",
            expression: "norimune_fan"
        }
    ];

    /*
     * ─────────────────────────────
     * 季節・特定日・複合条件会話
     * ─────────────────────────────
     *
     * これらも通常候補と同じ抽選箱へ入ります。
     *
     * weight:
     *   抽選箱へ同じ会話を何口入れるか。
     *   省略時は1。
     *
     * chance:
     *   候補へ入る確率。省略時は1。
     */

    const CONDITIONAL_TALK_DATA = [
        {
            id: "spring_general_01",
            season: "spring",
            tags: ["normal", "season", "spring"],
            chance: 1,
            weight: 1,
            once: false,

            text:
                "庭も、ずいぶん華やいできたねぇ。\n" +
                "春というものは、隠しておけないらしい。",
            expression: "norimune_smile"
        },
        {
            id: "summer_day_01",
            season: "summer",
            time: "day",
            tags: [
                "normal",
                "season",
                "time",
                "summer",
                "day"
            ],
            chance: 0.2,
            weight: 1,
            once: false,

            text:
                "日差しが強いねぇ。\n" +
                "あまり無理に外へ出ない方がいい。",
            expression: "norimune_fan"
        },
        {
            id: "winter_midnight_01",
            season: "winter",
            time: "midnight",
            tags: [
                "normal",
                "season",
                "time",
                "winter",
                "midnight"
            ],
            chance: 0.2,
            weight: 1,
            once: false,

            text:
                "こんな寒い夜更けまで起きているのかい。\n" +
                "身体を冷やさないようにね。",
            expression: "norimune_fan"
        },
        {
            id: "new_year_day",
            month: 1,
            date: 1,
            tags: [
                "normal",
                "season",
                "specialDate",
                "newyear"
            ],
            chance: 1,
            weight: 2,
            once: true,

            pages: [
                {
                    text:
                        "あけましておめでとう、お前さん。",
                    expression: "norimune_smile"
                },
                {
                    text:
                        "今年も、まあ気楽にやろうじゃないか。",
                    expression: "norimune_normal"
                }
            ]
        },
        {
            id: "tanabata",
            month: 7,
            date: 7,
            tags: [
                "normal",
                "season",
                "specialDate",
                "tanabata"
            ],
            chance: 1,
            weight: 2,
            once: true,

            text:
                "今夜は星を眺める者も多いだろうねぇ。\n" +
                "お前さんも、何か願うことがあるのかい。",
            expression: "norimune_smile"
        },
        {
            id: "year_end",
            month: 12,
            date: [29, 30, 31],
            tags: [
                "normal",
                "season",
                "specialDate",
                "yearEnd"
            ],
            chance: 1,
            weight: 2,
            once: true,

            text:
                "今年も、もう終わりか。\n" +
                "過ぎてしまえば早いものだねぇ。",
            expression: "norimune_normal"
        }
    ];

    /*
     * ─────────────────────────────
     * 内部状態
     * ─────────────────────────────
     */

    const talkHistory = [];
    const shownConditionalTalks = {};
    const shownVisitTalks = {};

    let visitTalkCount = 0;
    let resetRequested = false;
    let resetDelay = 0;

    /*
     * ─────────────────────────────
     * 時間・季節
     * ─────────────────────────────
     */

    function isTimeSystemReady() {
        return (
            window.MamiTimeSystem &&
            typeof MamiTimeSystem.getTimeZone ===
                "function"
        );
    }

    function getTimeZone() {
        if (!isTimeSystemReady()) {
            return "day";
        }

        return MamiTimeSystem.getTimeZone();
    }

    function getSeason() {
        if (
            window.MamiTimeSystem &&
            typeof MamiTimeSystem.getSeason ===
                "function"
        ) {
            return MamiTimeSystem.getSeason();
        }

        const month =
            new Date().getMonth() + 1;

        if (month >= 3 && month <= 5) {
            return "spring";
        }

        if (month >= 6 && month <= 8) {
            return "summer";
        }

        if (month >= 9 && month <= 11) {
            return "autumn";
        }

        return "winter";
    }

    function getDateInfo() {
        if (
            window.MamiTimeSystem &&
            typeof MamiTimeSystem.getDateInfo ===
                "function"
        ) {
            return MamiTimeSystem.getDateInfo();
        }

        const date = new Date();

        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            date: date.getDate(),
            day: date.getDay()
        };
    }

    /*
     * ─────────────────────────────
     * タグ
     * ─────────────────────────────
     */

    function normalizeArray(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return [];
        }

        return Array.isArray(value)
            ? value
            : [value];
    }

    function uniqueTags(tags) {
        return [
            ...new Set(
                tags
                    .filter(tag =>
                        tag !== undefined &&
                        tag !== null &&
                        tag !== ""
                    )
                    .map(tag => String(tag))
            )
        ];
    }

    function makeTalkTags(
        talk,
        automaticTags = []
    ) {
        return uniqueTags([
            ...automaticTags,
            ...normalizeArray(talk.tags)
        ]);
    }

    function hasTag(candidate, tag) {
        return candidate.tags.includes(
            String(tag)
        );
    }

    /*
     * ─────────────────────────────
     * 条件判定
     * ─────────────────────────────
     */

    function conditionIncludes(
        condition,
        currentValue
    ) {
        const values =
            normalizeArray(condition);

        if (values.length === 0) {
            return true;
        }

        return values.some(value =>
            String(value) ===
            String(currentValue)
        );
    }

    function isConditionalTalkAvailable(talk) {
        if (!talk || !talk.id) {
            return false;
        }

        if (
            talk.once === true &&
            shownConditionalTalks[talk.id]
        ) {
            return false;
        }

        const dateInfo = getDateInfo();

        if (
            !conditionIncludes(
                talk.season,
                getSeason()
            )
        ) {
            return false;
        }

        if (
            !conditionIncludes(
                talk.time,
                getTimeZone()
            )
        ) {
            return false;
        }

        if (
            !conditionIncludes(
                talk.month,
                dateInfo.month
            )
        ) {
            return false;
        }

        if (
            !conditionIncludes(
                talk.date,
                dateInfo.date
            )
        ) {
            return false;
        }

        if (
            !conditionIncludes(
                talk.dayOfWeek,
                dateInfo.day
            )
        ) {
            return false;
        }

        const chance =
            talk.chance !== undefined
                ? Math.max(
                    0,
                    Math.min(
                        1,
                        Number(talk.chance)
                    )
                )
                : 1;

        return Math.random() < chance;
    }

    function matchesConditionBlock(condition) {
    if (!condition) {
        return false;
    }

    const dateInfo = getDateInfo();
    const currentSeason = getSeason();
    const currentTime = getTimeZone();

    if (
        condition.season !== undefined &&
        !conditionIncludes(
            condition.season,
            currentSeason
        )
    ) {
        return false;
    }

    if (
        condition.time !== undefined &&
        !conditionIncludes(
            condition.time,
            currentTime
        )
    ) {
        return false;
    }

    if (
        condition.month !== undefined &&
        !conditionIncludes(
            condition.month,
            dateInfo.month
        )
    ) {
        return false;
    }

    if (
        condition.date !== undefined &&
        !conditionIncludes(
            condition.date,
            dateInfo.date
        )
    ) {
        return false;
    }

    if (
        condition.dayOfWeek !== undefined &&
        !conditionIncludes(
            condition.dayOfWeek,
            dateInfo.day
        )
    ) {
        return false;
    }

    return true;
}

function isTalkExcluded(talk) {
    if (!talk) {
        return false;
    }

    const dateInfo = getDateInfo();

    /*
     * 旧形式の除外指定。
     *
     * 例：
     * excludeMonth: 12,
     * excludeDate: [24, 25]
     *
     * この場合は12月24日と25日に除外する。
     */
    if (
        talk.excludeMonth !== undefined &&
        conditionIncludes(
            talk.excludeMonth,
            dateInfo.month
        )
    ) {
        if (
            talk.excludeDate === undefined ||
            conditionIncludes(
                talk.excludeDate,
                dateInfo.date
            )
        ) {
            return true;
        }
    }

    const excludeConditions =
        Array.isArray(talk.excludeConditions)
            ? talk.excludeConditions
            : [];

    return excludeConditions.some(
        condition =>
            matchesConditionBlock(condition)
    );
}

/*
 * TALK_DATA内に直接書かれた、
 *
 * season
 * time
 * month
 * date
 * dayOfWeek
 *
 * を会話の出現条件として判定する。
 */
function isLegacyTalkAvailable(talk) {
    if (!talk || isTalkExcluded(talk)) {
        return false;
    }

    const dateInfo = getDateInfo();

    if (
        talk.season !== undefined &&
        !conditionIncludes(
            talk.season,
            getSeason()
        )
    ) {
        return false;
    }

    if (
        talk.time !== undefined &&
        !conditionIncludes(
            talk.time,
            getTimeZone()
        )
    ) {
        return false;
    }

    if (
        talk.month !== undefined &&
        !conditionIncludes(
            talk.month,
            dateInfo.month
        )
    ) {
        return false;
    }

    if (
        talk.date !== undefined &&
        !conditionIncludes(
            talk.date,
            dateInfo.date
        )
    ) {
        return false;
    }

    if (
        talk.dayOfWeek !== undefined &&
        !conditionIncludes(
            talk.dayOfWeek,
            dateInfo.day
        )
    ) {
        return false;
    }

    return true;
}

    /*
     * ─────────────────────────────
     * 候補作成
     * ─────────────────────────────
     */

    function addLegacyCategoryCandidates(
    candidates,
    categoryName
) {
    const talks =
        TALK_DATA[categoryName];

    if (!talks) {
        return;
    }

    talks.forEach((talk, index) => {
        /*
         * 話す・季節・本丸のどのボタンから呼ばれても、
         * ここで共通して除外条件を判定する。
         */
        if (!isLegacyTalkAvailable(talk)) {
            return;
        }

        candidates.push({
            key:
                `legacy:${categoryName}:${index}`,
            source: "legacy",
            category: categoryName,
            index: index,
            talk: talk,
            tags: makeTalkTags(
                talk,
                [categoryName]
            )
        });
    });
}

    function addTimeCandidates(candidates) {
        const timeZone = getTimeZone();
        const talks =
            TIME_TALK_DATA[timeZone];

        if (!talks) {
            return;
        }

        talks.forEach((talk, index) => {
            candidates.push({
                key:
                    `time:${timeZone}:${index}`,
                source: "time",
                category: timeZone,
                index: index,
                talk: talk,
                tags: makeTalkTags(
                    talk,
                    [
                        "time",
                        timeZone
                    ]
                )
            });
        });
    }

    function addConditionalCandidates(
        candidates
    ) {
        CONDITIONAL_TALK_DATA.forEach(
            (talk, index) => {
                if (
                    !isConditionalTalkAvailable(
                        talk
                    )
                ) {
                    return;
                }

                const weight =
                    Math.max(
                        1,
                        Math.floor(
                            Number(
                                talk.weight || 1
                            )
                        )
                    );

                const automaticTags = [
                    "conditional"
                ];

                normalizeArray(
                    talk.season
                ).forEach(value => {
                    automaticTags.push(
                        "season",
                        value
                    );
                });

                normalizeArray(
                    talk.time
                ).forEach(value => {
                    automaticTags.push(
                        "time",
                        value
                    );
                });

                if (
                    talk.month !== undefined ||
                    talk.date !== undefined
                ) {
                    automaticTags.push(
                        "specialDate"
                    );
                }

                const candidate = {
                    key:
                        `conditional:${talk.id}`,
                    source: "conditional",
                    category: "conditional",
                    index: index,
                    talk: talk,
                    tags: makeTalkTags(
                        talk,
                        automaticTags
                    )
                };

                for (
                    let count = 0;
                    count < weight;
                    count++
                ) {
                    candidates.push(candidate);
                }
            }
        );
    }

    /*
     * ボタンカテゴリに応じて候補を絞る
     */

    function filterCandidatesByCategory(
        candidates,
        category
    ) {
        switch (category) {
            case "season":
                return candidates.filter(
                    candidate =>
                        hasTag(
                            candidate,
                            "season"
                        ) ||
                        hasTag(
                            candidate,
                            getSeason()
                        )
                );

            case "honmaru":
                return candidates.filter(
                    candidate =>
                        hasTag(
                            candidate,
                            "honmaru"
                        )
                );

            case "time":
                return candidates.filter(
                    candidate =>
                        hasTag(
                            candidate,
                            "time"
                        ) ||
                        hasTag(
                            candidate,
                            getTimeZone()
                        )
                );

            case "normal":
                return candidates.filter(
                    candidate =>
                        hasTag(
                            candidate,
                            "normal"
                        )
                );

            case "all":
            default:
                return candidates;
        }
    }

    function makeTalkCandidates(category) {
        const candidates = [];

        /*
         * 「すべて」は既存カテゴリを全部混ぜる
         */
        if (
            category === "all" ||
            category === "normal"
        ) {
            addLegacyCategoryCandidates(
                candidates,
                "normal"
            );

            addLegacyCategoryCandidates(
                candidates,
                "season"
            );

            addLegacyCategoryCandidates(
                candidates,
                "honmaru"
            );

            addTimeCandidates(candidates);
            addConditionalCandidates(
                candidates
            );
        } else if (category === "season") {
            addLegacyCategoryCandidates(
                candidates,
                "season"
            );

            addConditionalCandidates(
                candidates
            );
        } else if (category === "honmaru") {
            addLegacyCategoryCandidates(
                candidates,
                "honmaru"
            );

            addConditionalCandidates(
                candidates
            );
        } else if (category === "time") {
            addTimeCandidates(candidates);
            addConditionalCandidates(
                candidates
            );
        }

        return filterCandidatesByCategory(
            candidates,
            category
        );
    }

    /*
     * ─────────────────────────────
     * 履歴
     * ─────────────────────────────
     */

    function filterRecentHistory(candidates) {
        if (candidates.length <= 1) {
            return candidates;
        }

        const uniqueKeys = [
            ...new Set(
                candidates.map(
                    candidate =>
                        candidate.key
                )
            )
        ];

        const excludeCount =
            Math.min(
                historyCount,
                Math.max(
                    0,
                    uniqueKeys.length - 1
                )
            );

        const recentKeys =
            talkHistory.slice(
                -excludeCount
            );

        const filtered =
            candidates.filter(
                candidate =>
                    !recentKeys.includes(
                        candidate.key
                    )
            );

        if (filtered.length > 0) {
            return filtered;
        }

        const lastKey =
            talkHistory[
                talkHistory.length - 1
            ];

        const fallback =
            candidates.filter(
                candidate =>
                    candidate.key !==
                    lastKey
            );

        return fallback.length > 0
            ? fallback
            : candidates;
    }

    function rememberCandidate(candidate) {
        talkHistory.push(candidate.key);

        while (
            talkHistory.length >
            historyCount
        ) {
            talkHistory.shift();
        }

        if (
            candidate.source ===
                "conditional" &&
            candidate.talk.once === true
        ) {
            shownConditionalTalks[
                candidate.talk.id
            ] = true;
        }
    }

    /*
     * ─────────────────────────────
     * 訪問回数会話
     * ─────────────────────────────
     */

    function getVisitTalk() {
        visitTalkCount++;

        const matched =
            VISIT_TALK_DATA.filter(
                talk => {
                    if (
                        !talk ||
                        !talk.id
                    ) {
                        return false;
                    }

                    if (
                        talk.once !== false &&
                        shownVisitTalks[
                            talk.id
                        ]
                    ) {
                        return false;
                    }

                    if (
                        talk.count !==
                            undefined &&
                        visitTalkCount !==
                            Number(talk.count)
                    ) {
                        return false;
                    }

                    if (
                        talk.minCount !==
                            undefined &&
                        visitTalkCount <
                            Number(
                                talk.minCount
                            )
                    ) {
                        return false;
                    }

                    if (
                        talk.maxCount !==
                            undefined &&
                        visitTalkCount >
                            Number(
                                talk.maxCount
                            )
                    ) {
                        return false;
                    }

                    const chance =
                        talk.chance !==
                        undefined
                            ? Math.max(
                                0,
                                Math.min(
                                    1,
                                    Number(
                                        talk.chance
                                    )
                                )
                            )
                            : 1;

                    return (
                        Math.random() <
                        chance
                    );
                }
            );

        if (matched.length === 0) {
            return null;
        }

        const highestPriority =
            Math.max(
                ...matched.map(
                    talk =>
                        Number(
                            talk.priority ||
                                0
                        )
                )
            );

        const highest =
            matched.filter(
                talk =>
                    Number(
                        talk.priority || 0
                    ) ===
                    highestPriority
            );

        const selected =
            highest[
                Math.floor(
                    Math.random() *
                    highest.length
                )
            ];

        if (selected.once !== false) {
            shownVisitTalks[
                selected.id
            ] = true;
        }

        return selected;
    }

    /*
     * ─────────────────────────────
     * 立ち絵・表情
     * ─────────────────────────────
     */

    function showExpression(filename) {
        if (!filename) {
            return;
        }

        $gameScreen.showPicture(
            pictureId,
            filename,
            1,
            pictureX,
            pictureY,
            scale,
            scale,
            255,
            0
        );
    }

    Window_Message.prototype
        .obtainMamiExpressionName =
        function(textState) {
            const startIndex =
                textState.index;

            if (
                textState.text[
                    startIndex
                ] !== "["
            ) {
                return "";
            }

            const endIndex =
                textState.text.indexOf(
                    "]",
                    startIndex
                );

            if (endIndex < 0) {
                return "";
            }

            const filename =
                textState.text.substring(
                    startIndex + 1,
                    endIndex
                );

            textState.index =
                endIndex + 1;

            return filename;
        };

    const _Window_Message_processEscapeCharacter =
        Window_Message.prototype
            .processEscapeCharacter;

    Window_Message.prototype
        .processEscapeCharacter =
        function(code, textState) {
            if (code === "MEXP") {
                const filename =
                    this.obtainMamiExpressionName(
                        textState
                    );

                if (filename) {
                    showExpression(filename);
                }

                return;
            }

            _Window_Message_processEscapeCharacter
                .call(
                    this,
                    code,
                    textState
                );
        };

    function requestExpressionReset() {
        resetRequested = true;
        resetDelay =
            resetDelayFrames;
    }

    /*
     * ─────────────────────────────
     * メッセージ登録
     * ─────────────────────────────
     */

    function enqueueTalkMessage(talk) {
        if (
            Array.isArray(talk.pages) &&
            talk.pages.length > 0
        ) {
            for (
                let pageIndex = 0;
                pageIndex <
                talk.pages.length;
                pageIndex++
            ) {
                const page =
                    talk.pages[pageIndex] ||
                    {};

                const expression =
                    String(
                        page.expression ||
                        ""
                    );

                const lines =
                    String(
                        page.text || ""
                    ).split("\n");

                if (lines.length === 0) {
                    lines.push("");
                }

                if (expression) {
                    lines[0] =
                        `\\MEXP[${expression}]` +
                        lines[0];
                }

                for (const line of lines) {
                    $gameMessage.add(line);
                }

                if (
                    pageIndex <
                    talk.pages.length - 1
                ) {
                    $gameMessage.newPage();
                }
            }

            return;
        }

        showExpression(
            talk.expression
        );

        const pages =
            String(
                talk.text || ""
            ).split("||");

        for (
            let pageIndex = 0;
            pageIndex < pages.length;
            pageIndex++
        ) {
            const lines =
                pages[pageIndex].split(
                    "\n"
                );

            for (const line of lines) {
                $gameMessage.add(line);
            }

            if (
                pageIndex <
                pages.length - 1
            ) {
                $gameMessage.newPage();
            }
        }
    }

    /*
     * ─────────────────────────────
     * 抽選
     * ─────────────────────────────
     */

    function showRandomTalk(category) {
        if ($gameMessage.isBusy()) {
            return;
        }

        /*
         * 訪問回数会話は
         * 「話す」系だけで判定
         */
        if (
            category === "all" ||
            category === "normal"
        ) {
            const visitTalk =
                getVisitTalk();

            if (visitTalk) {
                enqueueTalkMessage(
                    visitTalk
                );

                requestExpressionReset();
                return;
            }
        }

        let candidates =
            makeTalkCandidates(
                category
            );

        candidates =
            filterRecentHistory(
                candidates
            );

        if (
            candidates.length === 0
        ) {
            console.warn(
                `[${pluginName}] 抽選可能な会話がありません: ${category}`
            );

            return;
        }

        const selected =
            candidates[
                Math.floor(
                    Math.random() *
                    candidates.length
                )
            ];

        rememberCandidate(selected);

        const talk =
            selected.talk;

        const type =
            String(
                talk.type || "message"
            );

        if (
            type === "commonEvent"
        ) {
            const commonEventId =
                Number(
                    talk.commonEventId ||
                    0
                );

            if (
                commonEventId > 0
            ) {
                $gameTemp
                    .reserveCommonEvent(
                        commonEventId
                    );
            }

            return;
        }

        enqueueTalkMessage(talk);
        requestExpressionReset();
    }

    PluginManager.registerCommand(
        pluginName,
        "randomTalk",
        args => {
            showRandomTalk(
                String(
                    args.category ||
                    "all"
                )
            );
        }
    );

    /*
     * ─────────────────────────────
     * 通常表情へ復帰
     * ─────────────────────────────
     */

    const _Scene_Map_update =
        Scene_Map.prototype.update;

    Scene_Map.prototype.update =
        function() {
            _Scene_Map_update.call(
                this
            );

            if (!resetRequested) {
                return;
            }

            if (
                $gameMessage.isBusy()
            ) {
                return;
            }

            if (resetDelay > 0) {
                resetDelay--;
                return;
            }

            resetRequested = false;

            showExpression(
                defaultExpression
            );
        };

    /*
     * 外部確認用
     */
    window.MamiNorimuneTalk = {
        getVisitTalkCount() {
            return visitTalkCount;
        },

        resetVisitTalkCount() {
            visitTalkCount = 0;

            for (
                const key of
                Object.keys(
                    shownVisitTalks
                )
            ) {
                delete shownVisitTalks[
                    key
                ];
            }
        },

        clearHistory() {
            talkHistory.length = 0;
        }
    };
})();