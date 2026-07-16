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
    　* 選択肢会話の出現率
    　* 0.05 = 5%
    　*/
     const CHOICE_TALK_RATE = 0.05;

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
{
    text:
        "京という場所は、不思議だねぇ。||" +
        "今歩いても静かなものだが、昔は随分賑やかな若者たちがいたものさ。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    text:
        "天才というものは、案外気負っていない。||" +
        "肩の力が抜けている者ほど、恐ろしいものだよ。",
    tags: ["honmaru"],
    expression: "norimune_think"
},
{
    text:
        "ある左利きの剣士とは、妙な縁があってねぇ。||" +
        "今でも孫六と手合わせをしていると、時々思い出すよ。",
    tags: ["honmaru"],
    expression: "norimune_smile"
},
{
    text:
        "鬼と呼ばれるほど厳しい男だったがね。||" +
        "案外、情の深いところもあったよ。",
    tags: ["honmaru"],
    expression: "norimune_serious"
},
{
    text:
        "昔の話を始めると長くなる。||" +
        "茶が冷めるくらいにはねぇ。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "刀というものは、不思議だ。||" +
        "主は変わっても、思い出まで無くなるわけじゃないからねぇ。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    text:
        "昔、ある場所でよく見掛けた顔があってねぇ。||" +
        "今はその刀たちと、同じ本丸で茶を飲んでいる。人生というのは面白いものだ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "刀は振るう者によって、善にも悪にもなる。||" +
        "だからこそ、主を選べる今という時代は幸せなのかもしれないねぇ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "強い刀が良い刀とは限らない。||" +
        "最後まで折れずに役目を果たした刀も、立派なものさ。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    text:
        "戦を知っているからこそ、平穏を好む。||" +
        "それは臆病とは違うんだよ。",
    tags: ["normal"],
    expression: "norimune_serious"
},
{
    text:
        "刀は鞘に収まっている時が、一番役目を果たしていることもある。||" +
        "抜かずに済むなら、それに越したことはないからねぇ。",
    tags: ["normal"],
    expression: "norimune_closed"
},
{
    text:
        "研がれ続けるだけでは、刀も痩せてしまう。||" +
        "休む時間も、大切ということさ。",
    tags: ["normal"],
    expression: "norimune_soft"
},
{
    pages: [
        {
            text:
                "折れることだけが終わりじゃない。",
            expression: "norimune_far"
        },
        {
            text:
                "忘れられることも、刀には少し堪えるものでねぇ。",
            expression: "norimune_gentle"
        }
    ],
    tags: ["normal"]
},
{
    text:
        "名刀と呼ばれることは名誉だ。||" +
        "けれど、それだけで満たされるほど単純でもない。",
    tags: ["normal"],
    expression: "norimune_think"
},
{
    text:
        "長く在るというのは、失うものも増えるということだ。||" +
        "それでも、得るものの方が少し多いと信じたいねぇ。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    text:
        "昔を誇るのは悪くない。||" +
        "だが、今を疎かにしては本末転倒だからねぇ。",
    tags: ["normal"],
    expression: "norimune_smile"
},
{
    pages: [
        {
            text:
                "刀であることは、変えられない。",
            expression: "norimune_far"
        },
        {
            text:
                "だが、どう在るかは選べる。\n" +
                "僕は、今の暮らしを気に入っているよ。",
            expression: "norimune_gentle"
        }
    ],
    tags: ["normal"]
},
{
    text:
        "刀というものはねぇ。\n" +
        "持ち主が変わるたび、景色まで変わるものなんだ。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    text:
        "古い刀ほど、物持ちがいいと思われがちでねぇ。||" +
        "実際は、人の方が色々と忘れてしまうものさ。",
    tags: ["normal"],
    expression: "norimune_closed"
},
{
    text:
        "刀は声を持たない。||" +
        "だからこそ、持ち主が何を願って振るったのかは、よく覚えているよ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "主に呼ばれて返事をする。||" +
        "それだけのことが、案外嬉しいものなんだよ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "折れなかった刀にも、それぞれ理由がある。||" +
        "運だけでは片付けられないものさ。",
    tags: ["normal"],
    expression: "norimune_think"
},
{
    text:
        "名刀と呼ばれるのは悪い気分じゃない。||" +
        "期待されるなら、それに応えるまでさ。",
    tags: ["normal"],
    expression: "norimune_smile"
},
{
    pages: [
        {
            text:
                "刀には、それぞれ役目がある。",
            expression: "norimune_far"
        },
        {
            text:
                "斬ることだけじゃない。\n" +
                "守ることも、寄り添うこともねぇ。",
            expression: "norimune_gentle"
        }
    ],
    tags: ["normal"]
},
{
    type: "choice",
    id: "normal_feeling_01",

    text:
        "今日は、どんな気分なんだい。",

    expression: "norimune_normal",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "元気",

            pages: [
                {
                    text:
                        "それは何よりだ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "お前さんが元気なら、僕も少し嬉しいよ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "少し疲れた",

            pages: [
                {
                    text:
                        "そうかい。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "なら今日は、頑張るより休む方を選びなさい。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "よく分からない",

            pages: [
                {
                    text:
                        "うはは。そういう日もあるさ。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "名前をつけられない気持ちは、そのままにしておいてもいい。",
                    expression:
                        "norimune_far"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "normal_request_01",

    text:
        "僕に、何かしてほしいことはあるかい。",

    expression: "norimune_tease",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "話を聞いてほしい",

            pages: [
                {
                    text:
                        "もちろん。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "うまく話せなくても、急かしたりはしないよ。",
                    expression:
                        "norimune_soft"
                }
            ]
        },
        {
            text:
                "褒めてほしい",

            pages: [
                {
                    text:
                        "ほう。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "では、よく励んだお前さんへ、僕から花丸をやろう。",
                    expression:
                        "norimune_smile"
                }
            ]
        },
        {
            text:
                "そばにいてほしい",

            pages: [
                {
                    text:
                        "……それだけでいいのかい。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "なら、しばらくここにいよう。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    text:
        "昔を思い出すことはあるよ。||" +
        "だが、昔へ帰りたいとは思わない。",
    tags:["normal"],
    expression:"norimune_far"
},
{
    text:
        "若い者が前へ出るのは良いことだ。||" +
        "年寄りは、後ろから笑って見ているくらいでちょうどいい。",
    tags:["normal"],
    expression:"norimune_gentle"
},
{
    text:
        "面倒ごとは、昔ほど嫌いじゃない。||" +
        "ただ、昔ほど自分で抱えようとも思わなくなっただけさ。",
    tags:["normal"],
    expression:"norimune_closed"
},
{
    type: "choice",
    id: "oldman_tea_01",

    text:
        "さて、茶でも淹れようか。\n" +
        "何がいい。",

    expression: "norimune_closed",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "熱いお茶",

            pages: [
                {
                    text:
                        "うん。やはり落ち着くねぇ。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "急がず飲めば、それだけで良い時間になる。",
                    expression:
                        "norimune_far"
                }
            ]
        },
        {
            text:
                "冷たいお茶",

            pages: [
                {
                    text:
                        "それも悪くない。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "昔は贅沢だったんだけれどねぇ。",
                    expression:
                        "norimune_closed"
                }
            ]
        },
        {
            text:
                "則宗さんが選んで",

            pages: [
                {
                    text:
                        "おや、任された。",
                    expression:
                        "norimune_tease"
                },
                {
                    text:
                        "では今日は、僕のおすすめということで。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "oldman_age_01",

    text:
        "僕を年寄りだと思っている顔だねぇ。",

    expression: "norimune_tease",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "思ってる",

            pages: [
                {
                    text:
                        "正直でよろしい。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "否定はしないとも。",
                    expression:
                        "norimune_smile"
                }
            ]
        },
        {
            text:
                "まだ若い",

            pages: [
                {
                    text:
                        "うはは。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "その言葉は素直に受け取っておこうか。",
                    expression:
                        "norimune_tease"
                }
            ]
        },
        {
            text:
                "秘密",

            pages: [
                {
                    text:
                        "お前さんも、なかなか策士だねぇ。",
                    expression:
                        "norimune_closed"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "oldman_engawa_01",

    text:
        "縁側というのは、不思議な場所だ。\n" +
        "お前さんは何をする。",

    expression: "norimune_far",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "ぼーっとする",

            pages: [
                {
                    text:
                        "うん。それが一番贅沢かもしれない。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "茶を飲む",

            pages: [
                {
                    text:
                        "良い趣味だ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "三日月も呼べば、一日終わってしまいそうだけれどねぇ。",
                    expression:
                        "norimune_tease"
                }
            ]
        },
        {
            text:
                "昼寝",

            pages: [
                {
                    text:
                        "それも年寄りらしくて結構。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "……僕のことではないよ？",
                    expression:
                        "norimune_tease"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "oldman_time_01",

    text:
        "好きな時間帯はあるかい。",

    expression: "norimune_normal",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "朝",

            pages: [
                {
                    text:
                        "始まりの空気は悪くない。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "夜",

            pages: [
                {
                    text:
                        "静かだからかな。",
                    expression:
                        "norimune_far"
                },
                {
                    text:
                        "僕も夜は嫌いじゃないよ。",
                    expression:
                        "norimune_closed"
                }
            ]
        },
        {
            text:
                "今",

            pages: [
                {
                    text:
                        "……おや。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "その答えは、少し嬉しいねぇ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "oldman_story_01",

    text:
        "昔話でも聞くかい。",

    expression: "norimune_tease",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "聞きたい",

            pages: [
                {
                    text:
                        "では、長くなるよ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "途中で眠っても、起こしたりはしないさ。",
                    expression:
                        "norimune_closed"
                }
            ]
        },
        {
            text:
                "今日はやめておく",

            pages: [
                {
                    text:
                        "うん。それもいい。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "昔話は逃げないからねぇ。",
                    expression:
                        "norimune_far"
                }
            ]
        },
        {
            text:
                "短めで",

            pages: [
                {
                    text:
                        "……それが一番難しい注文だ。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "年寄りというものは、話し始めると長くなるものでねぇ。",
                    expression:
                        "norimune_tease"
                }
            ]
        }
    ]
},
{
    text:
        "週の始まりというだけで、身構えてしまう者もいるらしいねぇ。||" +
        "今日ひと日ぶんだけ考えれば充分さ。",
    tags: ["normal"],

    dayOfWeek: 1,

    expression: "norimune_gentle"
},
{
    text:
        "今週も、よく励んだねぇ。||" +
        "まだ何か残っていたとしても、ここまで来たことは変わらないよ。",
    tags: ["normal"],

    dayOfWeek: 5,

    expression: "norimune_soft"
},
{
    text:
        "今日は少し、肩の力が抜けているようだ。||" +
        "休める日なら、休むことを後回しにしないようにねぇ。",
    tags: ["normal"],

    dayOfWeek: [0, 6],

    expression: "norimune_gentle"
},
{
    type: "choice",
    id: "monday_feeling_01",

    text:
        "月曜日というものは、好きかい。",

    expression:
        "norimune_tease",

    tags: [
        "normal",
        "choice"
    ],

    dayOfWeek: 1,

    choices: [
        {
            text:
                "好き",

            pages: [
                {
                    text:
                        "ほう。頼もしいねぇ。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "始まりを楽しめるのは、なかなか良いことだ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "苦手",

            pages: [
                {
                    text:
                        "そうかい。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "では今日は、一週間ではなく今日だけを相手にしよう。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "何曜日でも同じ",

            pages: [
                {
                    text:
                        "うはは。\n" +
                        "年寄りに近い考え方だねぇ。",
                    expression:
                        "norimune_closed"
                }
            ]
        }
    ]
},
{
    text:
        "日曜日か。||" +
        "今日は少しくらい、急がない日があってもいいだろう。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_gentle"
},
{
    text:
        "一週間の終わりと思うか、始まりと思うか。||" +
        "日曜日というのは、見る向きで随分変わるねぇ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_think"
},
{
    text:
        "今日は、いつもより少し気が緩んでいる顔だねぇ。||" +
        "うはは。悪いことではないよ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_tease"
},
{
    text:
        "日曜日だからといって、何か特別なことをしなくてもいい。||" +
        "何もしなかった日も、ちゃんと一日だからねぇ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_soft"
},
{
    text:
        "休める時に休むというのも、案外難しいものだ。||" +
        "お前さんは、ちゃんとできているかい。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_gentle"
},
{
    text:
        "明日のことが、もう気になっているのかい。||" +
        "まだ今日は終わっていないよ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_tease"
},
{
    text:
        "日曜日は、少しだけ時間の流れが違って見える。||" +
        "本当に違うのか、こちらの気分なのかは分からないけれどねぇ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_far"
},
{
    pages: [
        {
            text:
                "今日は、何かしなければと焦っているのかい。",
            expression: "norimune_normal"
        },
        {
            text:
                "何もしないことを選ぶのも、立派な予定だよ。",
            expression: "norimune_gentle"
        }
    ],
    tags: ["normal"],
    dayOfWeek: 0
},
{
    text:
        "月曜日か。||" +
        "一週間すべてを、今日のうちに背負う必要はないよ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_gentle"
},
{
    text:
        "始まりの日というだけで、少し身構えてしまうものらしいねぇ。||" +
        "まずは今日ひと日だけを相手にすればいいさ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_soft"
},
{
    text:
        "月曜日が苦手なのかい。||" +
        "うはは。向こうも、お前さんを嫌ってはいないと思うよ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_tease"
},
{
    text:
        "新しい一週間だからといって、\n" +
        "新しい自分にならなくてもいいんだよ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_gentle"
},
{
    text:
        "週の初めから、随分と難しい顔をしているねぇ。||" +
        "先のことまで、まとめて考えてしまったのかな。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_think"
},
{
    text:
        "月曜日を越えれば、あとは少し気が楽になる。||" +
        "……そう思っておくのも、ひとつの知恵さ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_closed"
},
{
    pages: [
        {
            text:
                "今週も、うまくやらなければと思っているのかい。",
            expression: "norimune_normal"
        },
        {
            text:
                "うまくいかない日があっても、週はちゃんと進んでいくよ。",
            expression: "norimune_gentle"
        }
    ],
    tags: ["normal"],
    dayOfWeek: 1
},
{
    text:
        "火曜日か。||" +
        "月曜日を越えただけでも、少し気が楽になるものだねぇ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_gentle"
},
{
    text:
        "週の流れにも、少し慣れてきた頃かな。||" +
        "無理に勢いをつけなくても、そのままで進めばいいさ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_soft"
},
{
    text:
        "火曜日というのは、少し影が薄いねぇ。||" +
        "だが、目立たない日ほど穏やかに過ぎるものさ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_closed"
},
{
    text:
        "まだ週の初めだと思うかい。||" +
        "それとも、もう二日目だと思うかな。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_think"
},
{
    text:
        "昨日うまくいかなかったことを、まだ気にしているのかい。||" +
        "今日は昨日の続きであって、やり直しでもあるんだよ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_gentle"
},
{
    text:
        "火曜日まで来れば、一週間も少し形になってくる。||" +
        "先が見えない時ほど、一日ずつでいい。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_far"
},
{
    type: "choice",
    id: "tuesday_feeling_01",

    text:
        "火曜日は、どんな気分なんだい。",

    expression: "norimune_normal",

    tags: [
        "normal",
        "choice"
    ],

    dayOfWeek: 2,

    choices: [
        {
            text:
                "まだ週の前半でつらい",

            pages: [
                {
                    text:
                        "そうかい。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "では、先ではなく今日の終わりだけを目指そう。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "月曜日よりは楽",

            pages: [
                {
                    text:
                        "うん。それなら上出来だ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "少しずつ馴染んでいけば、それでいい。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "曜日を気にしていない",

            pages: [
                {
                    text:
                        "うはは。気楽でいいねぇ。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "曜日に名前がなくても、今日が今日であることは変わらないさ。",
                    expression:
                        "norimune_far"
                }
            ]
        }
    ]
},
{
    text:
        "水曜日か。||" +
        "週の真ん中まで来たねぇ。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_smile"
},
{
    text:
        "『まだ半分』と思うか、『もう半分』と思うか。||" +
        "同じ水曜日でも、随分違って見えるものさ。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_far"
},
{
    text:
        "ここまで来れば、今週の歩き方も見えてくる頃かな。||" +
        "焦らず、その調子でいけばいい。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_gentle"
},
{
    text:
        "水曜日は、不思議と目立たない曜日だねぇ。||" +
        "だからこそ、案外好きなんだ。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_closed"
},
{
    text:
        "今週も半ばだ。||" +
        "今日は少し、自分を労ってやってもいい頃合いだよ。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_soft"
},
{
    pages: [
        {
            text:
                "ここまで来たことは、ちゃんと褒めてもいい。",
            expression: "norimune_normal"
        },
        {
            text:
                "人は、終わったところより残りばかり数えてしまうからねぇ。",
            expression: "norimune_gentle"
        }
    ],
    tags: ["normal"],
    dayOfWeek: 3
},
{
    type: "choice",
    id: "wednesday_half_01",

    text:
        "水曜日だ。||" +
        "お前さんは、どう感じる。",

    expression: "norimune_normal",

    tags: [
        "normal",
        "choice"
    ],

    dayOfWeek: 3,

    choices: [
        {
            text:
                "まだ半分",

            pages: [
                {
                    text:
                        "そう思う日もあるさ。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "では今日は、半分まで来たことだけ考えてみよう。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "もう半分",

            pages: [
                {
                    text:
                        "うん。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "その見方なら、週も少し軽く見えるねぇ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "気にしていない",

            pages: [
                {
                    text:
                        "うはは。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "曜日に振り回されないのも、案外大事なことさ。",
                    expression:
                        "norimune_tease"
                }
            ]
        }
    ]
},
{
    text:
        "木曜日か。||" +
        "今週も、気づけばここまで来たねぇ。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_smile"
},
{
    text:
        "木曜日というのは、案外好きなんだ。||" +
        "慌ただしさも、少し落ち着いてくる頃だからねぇ。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_far"
},
{
    text:
        "あと少しと思うには少し早い。||" +
        "だからこそ、焦らず歩ける日でもある。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_gentle"
},
{
    text:
        "木曜日まで来ると、週の景色も少し変わって見えるねぇ。||" +
        "終わりが見えてくるからかな。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_closed"
},
{
    text:
        "ここまで来た自分より、まだ残っている日ばかり見ていないかい。||" +
        "歩いた分も、ちゃんと数えておきなさい。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_soft"
},
{
    pages: [
        {
            text:
                "木曜日というのは、不思議と静かな曜日だ。",
            expression: "norimune_far"
        },
        {
            text:
                "目立たない日ほど、穏やかでいいものさ。",
            expression: "norimune_gentle"
        }
    ],
    tags: ["normal"],
    dayOfWeek: 4
},
{
    type: "choice",
    id: "thursday_pace_01",

    text:
        "今週の歩幅は、どうだい。",

    expression: "norimune_normal",

    tags: [
        "normal",
        "choice"
    ],

    dayOfWeek: 4,

    choices: [
        {
            text:
                "順調",

            pages: [
                {
                    text:
                        "それは何より。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "その調子で、焦らず歩いていこう。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "少し疲れた",

            pages: [
                {
                    text:
                        "ここまで来たんだ。疲れるのも当然さ。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "今日は少し早めに休むといい。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "分からない",

            pages: [
                {
                    text:
                        "うはは。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "分からないくらい自然に歩けているなら、それも悪くないよ。",
                    expression:
                        "norimune_far"
                }
            ]
        }
    ]
},
{
    text:
        "金曜日か。||" +
        "今週も、随分ここまで歩いてきたねぇ。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_smile"
},
{
    text:
        "金曜日になると、少し表情が柔らかくなる者が多い。||" +
        "お前さんも、その一人かな。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_tease"
},
{
    text:
        "あと少しと思う日ほど、無理をしがちだ。||" +
        "最後まで、いつもの歩幅でいこう。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_gentle"
},
{
    text:
        "ここまで来たことを喜ぶのも、大事なことさ。||" +
        "終わるまで待つ必要はないよ。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_soft"
},
{
    text:
        "金曜日というだけで、少し嬉しそうな顔をする人もいる。||" +
        "うはは。見ていてこちらまで和むねぇ。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_closed"
},
{
    pages: [
        {
            text:
                "今週も、ここまでよく励んだ。",
            expression: "norimune_normal"
        },
        {
            text:
                "まだ終わっていなくても、その事実は変わらないよ。",
            expression: "norimune_gentle"
        }
    ],
    tags: ["normal"],
    dayOfWeek: 5
},
{
    type: "choice",
    id: "friday_finish_01",

    text:
        "今週のお前さんは、どうだった。",

    expression: "norimune_normal",

    tags: [
        "normal",
        "choice"
    ],

    dayOfWeek: 5,

    choices: [
        {
            text:
                "頑張った",

            pages: [
                {
                    text:
                        "うん。よく励んだ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "その頑張りは、お前さん自身が一番知っていていい。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "少し疲れた",

            pages: [
                {
                    text:
                        "それだけ歩いてきた証拠だ。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "今日は少し、自分を甘やかしておやり。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "まだ終わってない",

            pages: [
                {
                    text:
                        "そうだったねぇ。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "では、その続きを応援していよう。",
                    expression:
                        "norimune_smile"
                }
            ]
        }
    ]
},

     /*
    　* ↑「話す」コマンドここまで↑
    　* ↓「季節」コマンド↓
    　*/
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
{
    text:
        "季節は毎年巡るというのに、\n" +
        "同じ景色はひとつとしてないものだねぇ。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    text:
        "景色が変わるたび、皆も少しずつ表情が変わる。\n" +
        "それを見るのも、僕の楽しみなんだ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "暑い日もあれば、寒い日もある。\n" +
        "そう考えると、季節というものは案外気まぐれだねぇ。",
    tags: ["normal"],
    expression: "norimune_closed"
},
{
    pages: [
        {
            text:
                "季節の移ろいは早いねぇ。"
        },
        {
            text:
                "気づけば、またひとつ景色が変わっている。"
        }
    ],
    tags: ["normal"],
    expression: "norimune_far"
},
{
    text:
        "花を眺める日もあれば、月を眺める日もある。||" +
        "どちらも、急ぐ必要はない景色だ。",
    tags: ["normal"],
    expression: "norimune_soft"
},
{
    text:
        "季節の変わり目は、身体も驚くらしい。||" +
        "お前さんも、無理だけはしないようにねぇ。",
    tags: ["normal"],
    expression: "norimune_serious"
},
{
    text:
        "今年も、もうこんな季節かと思ったら、\n" +
        "案外そうでもなかったりする。||" +
        "季節より、僕の勘違いだったようだ。",
    tags: ["normal"],
    expression: "norimune_troubled"
},
{
    text:
        "どの季節にも、それぞれ良さがある。\n" +
        "だから僕は、嫌いな季節というものがないんだ。",
    tags: ["normal"],
    expression: "norimune_smile"
},
{
    text:
        "季節が巡るたび、同じ場所なのに違う顔を見せる。\n" +
        "本丸も、なかなか飽きさせてくれないよ。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    text:
        "景色は毎年変わる。\n" +
        "けれど、変わらずここへ来てくれる顔があるのは嬉しいものだねぇ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "景色というものは、毎日少しずつ変わっている。||" +
        "同じ場所でも、見飽きることはないねぇ。",
    tags: ["season"],
    expression: "norimune_far"
},
{
    text:
        "風にも、それぞれ癖があるらしい。||" +
        "耳を澄ませば、今日はどんな日かわかることもあるよ。",
    tags: ["season"],
    expression: "norimune_closed"
},
{
    text:
        "花も葉も空も、同じ姿ではいてくれない。||" +
        "だからこそ、眺める甲斐があるんだろうねぇ。",
    tags: ["season"],
    expression: "norimune_gentle"
},
{
    text:
        "季節が変わるたび、庭の歩き方まで少し変わる。\n" +
        "面白いものだねぇ。",
    tags: ["season"],
    expression: "norimune_smile"
},
{
    text:
        "今日は空を見上げたかい。||" +
        "忙しい日ほど、案外忘れてしまうものだからねぇ。",
    tags: ["season"],
    expression: "norimune_soft"
},
{
    text:
        "風景は急には変わらない。\n" +
        "気づけば、すっかり季節が移っているものさ。",
    tags: ["season"],
    expression: "norimune_far"
},
{
    text:
        "季節は待ってくれないが、急かしてくるわけでもない。||" +
        "実に気楽な付き合いだねぇ。",
    tags: ["season"],
    expression: "norimune_closed"
},
{
    text:
        "縁側に座っているだけで、一日違う景色が見られる。\n" +
        "贅沢というのは、案外そういうものかもしれない。",
    tags: ["season"],
    expression: "norimune_gentle"
},
{
    text:
        "庭の草木は、誰に言われるでもなく季節を知っている。||" +
        "見習いたいものだねぇ。",
    tags: ["season"],
    expression: "norimune_think"
},
{
    text:
        "何気ない景色ほど、あとになって思い出すものさ。\n" +
        "だから僕は、今日も庭を眺めている。",
    tags: ["season"],
    expression: "norimune_far"
},
{
    text:
        "今年も、この景色を見ることができた。||" +
        "それだけでも、悪くない一年だと思えるねぇ。",
    tags: ["season"],
    expression: "norimune_gentle"
},
{
    type: "choice",
    id: "season_weather_01",

    text:
        "今日の空は、どうだったかい。",

    expression: "norimune_far",

    tags: ["season"],

    choices: [
        {
            text: "よく晴れていた",

            pages: [
                {
                    text:
                        "それは何よりだ。",
                    expression: "norimune_smile"
                },
                {
                    text:
                        "晴れた空を見ていると、少し得をした気分になるねぇ。",
                    expression: "norimune_gentle"
                }
            ]
        },
        {
            text: "雨が降っていた",

            pages: [
                {
                    text:
                        "雨の日も、悪いことばかりではないよ。",
                    expression: "norimune_soft"
                },
                {
                    text:
                        "庭の草木は、随分嬉しそうにしているからねぇ。",
                    expression: "norimune_far"
                }
            ]
        },
        {
            text: "見ていなかった",

            pages: [
                {
                    text:
                        "うはは。忙しかったのかな。",
                    expression: "norimune_closed"
                },
                {
                    text:
                        "次に外へ出た時は、少しだけ見上げてごらん。",
                    expression: "norimune_gentle"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "season_favorite_01",

    text:
        "お前さんは、どんな季節が好きなんだい。",

    expression: "norimune_far",

    tags: [
        "season",
        "choice"
    ],

    choices: [
        {
            text:
                "暖かい季節",

            pages: [
                {
                    text:
                        "花も草木も、よく動く頃だねぇ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "お前さんには、明るい景色がよく似合いそうだ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "涼しい季節",

            pages: [
                {
                    text:
                        "風が心地よくなる頃か。",
                    expression:
                        "norimune_far"
                },
                {
                    text:
                        "縁側で茶を飲むには、実に良い季節だねぇ。",
                    expression:
                        "norimune_closed"
                }
            ]
        },
        {
            text:
                "どの季節も好き",

            pages: [
                {
                    text:
                        "うん。僕も似たようなものだ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "それぞれに良さがあるから、ひとつに決めるのは難しいねぇ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "season_view_01",

    text:
        "今の景色で、気に入っているものはあるかい。",

    expression: "norimune_normal",

    tags: [
        "season",
        "choice"
    ],

    choices: [
        {
            text:
                "空",

            pages: [
                {
                    text:
                        "空か。",
                    expression:
                        "norimune_far"
                },
                {
                    text:
                        "毎日違うのに、見上げればいつもそこにある。不思議なものだねぇ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "庭",

            pages: [
                {
                    text:
                        "庭は、季節の変化が一番よく見える。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "気づけば、昨日とは違う顔をしているものさ。",
                    expression:
                        "norimune_far"
                }
            ]
        },
        {
            text:
                "則宗さん",

            pages: [
                {
                    text:
                        "……景色の話をしていたはずだがねぇ。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "うはは。まあ、悪い気はしないよ。",
                    expression:
                        "norimune_tease"
                }
            ]
        }
    ]
},
     /*
    　* ↑「季節」コマンドここまで↑
    　* ↓「本丸」コマンド↓
    　*/

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
    excludeConditions: [
        {
            time: ["midnight"]
        }
    ],
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
{
    pages: [
        {
            text:
                "三郎が歌いながら歩いていたんだ。",
            expression: "norimune_closed"
        },
        {
            text:
                "包丁は拍手をしていて、清光と安定は笑っていてねぇ。",
            expression: "norimune_smile"
        },
        {
            text:
                "……平和というものは、案外ああいう光景なのかもしれない。",
            expression: "norimune_far"
        }
    ],
    tags: ["honmaru"],
},
{
    text:
        "賑やかな者もいれば、静かな者もいる。||" +
        "それで本丸というものは、ちょうど良くできているんだよ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "どこからか三郎の歌が聞こえてくるねぇ。||" +
        "姿が見えなくても、あれはすぐ分かる。",
    tags: ["honmaru"],
　　excludeConditions: [
        {
            time: ["midnight"]
        }
    ],
    expression: "norimune_closed"
},
{
    text:
        "今日は三郎も機嫌がいいらしい。\n" +
        "歌声が本丸中に響いているよ。",
    tags: ["honmaru"],
    excludeConditions: [
        {
            time: ["midnight"]
        }
    ],
    expression: "norimune_smile"
},
{
    pages: [
        {
            text:
                "包丁が、今日は妙に静かだったんだ。",
            expression: "norimune_normal"
        },
        {
            text:
                "……と思ったら、柱の陰からこちらを見ていてねぇ。\n" +
                "何を期待していたんだろうね。",
            expression: "norimune_tease"
        }
    ],
    tags: ["honmaru"]
},
{
    text:
        "包丁が僕らを見て、今日も手を合わせていたよ。||" +
        "……拝まれる側というのも、不思議なものだねぇ。",
    tags: ["honmaru"],
    expression: "norimune_troubled"
},
{
    text:
        "包丁が、また夫婦はいいものだと言っていてねぇ。||" +
        "ああも嬉しそうなら、好きに言わせておけばいいさ。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "包丁がまた『人妻だ！』と騒いでいてねぇ。||" +
        "あれで喜ぶのだから、好きにさせているよ。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "包丁は、僕と主を見るたび拝んでいくんだ。||" +
        "……まあ、害はないからねぇ。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    pages: [
        {
            text:
                "包丁に『もっと仲良くしてください！』と言われてね。",
            expression: "norimune_surprised"
        },
        {
            text:
                "うはは。\n" +
                "応援される夫婦というのも、不思議なものだ。",
            expression: "norimune_gentle"
        }
    ],
    tags: ["honmaru"]
},
{
    text:
        "どこからか歌が聞こえるねぇ。||" +
        "三郎だろう。",
    tags: ["honmaru"],

    excludeConditions: [
        {
            time: ["midnight"]
        }
    ],

    expression: "norimune_closed"
},
{
    text:
        "三郎とは、時々扇子を片手に話しているよ。||" +
        "静かに始まっても、向こうが静かに終わらなくてねぇ。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "長曽祢たちと飲んでいると、どこからともなく三郎の歌が聞こえてくる。||" +
        "夏の風物詩みたいなものさ。",
    tags: ["honmaru", "summer"],
    season: "summer",
    expression: "norimune_far"
},
{
    pages: [
        {
            text:
                "今の清光や安定を見ているとね。",
            expression: "norimune_far"
        },
        {
            text:
                "思い出す顔が、いくつかある。",
            expression: "norimune_gentle"
        },
        {
            text:
                "……それだけの話さ。",
            expression: "norimune_closed"
        }
    ],
    tags: ["honmaru"]
},
{
    text:
        "畑仕事かい。||" +
        "……草は抜いても抜いても生えてくる。\n" +
        "実に元気だねぇ。",
    tags: ["honmaru"],
    expression: "norimune_troubled"
},
{
    text:
        "畑は嫌いではないよ。||" +
        "好きでもないけれどねぇ。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "土に好かれていない気がするんだ。||" +
        "僕が触ると、皆どこか元気がなくなる。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "馬というものは賢いねぇ。\n" +
        "撫でているだけでも、退屈しない。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "馬当番の日は悪くない。\n" +
        "あの子たちは、よく話を聞いてくれるからねぇ。",
    tags: ["honmaru"],
    expression: "norimune_smile"
},
{
    pages: [
        {
            text:
                "今日も馬が寄ってきてくれてね。",
            expression: "norimune_gentle"
        },
        {
            text:
                "……いや、おやつ目当てだったのかもしれないが。",
            expression: "norimune_closed"
        }
    ],
    tags: ["honmaru"]
},
{
    text:
        "孫六との手合わせは気楽でいい。||" +
        "今日は誰の役をやるんだと言われる前に、もう決まっているからねぇ。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "天才剣士役も、ずいぶん板についてしまったよ。||" +
        "孫六が相手だと、自然とそうなる。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "若い子との手合わせかい。||" +
        "まずは思い切り打ち込ませることにしている。",
    tags: ["honmaru"],
    expression: "norimune_normal"
},
{
    pages: [
        {
            text:
                "『説明はしないんですか』と聞かれてね。",
            expression: "norimune_surprised"
        },
        {
            text:
                "するよ。\n" +
                "ただ、先に身体で覚えた方が早いだけさ。",
            expression: "norimune_gentle"
        }
    ],
    tags: ["honmaru"]
},
{
    text:
        "『もう一度』と言えば、皆ちゃんと向かってくる。||" +
        "教える側としては、それで充分なんだ。",
    tags: ["honmaru"],
    expression: "norimune_serious"
},
{
    pages: [
        {
            text:
                "説明が面倒だから、先に打ち込ませる訳じゃないよ。",
            expression: "norimune_closed"
        },
        {
            text:
                "……本当だとも。",
            expression: "norimune_tease"
        }
    ],
    tags: ["honmaru"]
},
{
    text:
        "近くを通るだけで、『今日は調子がいいな』と分かる刀もいてねぇ。||" +
        "刀同士というのは、不思議なものさ。",
    tags: ["honmaru"],
    expression: "norimune_smile"
},
{
    text:
        "誰かが手入れを受けたあとは、空気まで軽くなる気がする。||" +
        "気のせいだと言われても、僕はそう思うんだ。",
    tags: ["honmaru"],
    expression: "norimune_soft"
},
{
    text:
        "刀には、それぞれ歩んできた時代がある。||" +
        "違う時代を生きた者同士が、こうして茶を飲んでいるのも面白い話だねぇ。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    text:
        "どれほど名の知れた刀でも、今は皆同じ本丸の仲間さ。||" +
        "肩書きを持ち込むには、少し賑やかすぎるねぇ。",
    tags: ["honmaru"],
    expression: "norimune_smile"
},
{
    text:
        "主が笑っている本丸はいい。\n" +
        "刀まで肩の力が抜けるからねぇ。",
    tags: ["honmaru"],
    expression: "norimune_soft"
},
{
    text:
        "今は皆、刀としてではなく仲間として笑っている。||" +
        "僕はそんな本丸が好きだよ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    type: "choice",
    id: "honmaru_someone_01",

    text:
        "今日は本丸で、誰かと話したのかい。",

    expression:
        "norimune_normal",

    tags: [
        "honmaru",
        "choice"
    ],

    choices: [
        {
            text:
                "清光と安定",

            pages: [
                {
                    text:
                        "あの二振りか。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "随分と賑やかだっただろう。\n" +
                        "まあ、元気なら何よりだ。",
                    expression:
                        "norimune_closed"
                }
            ]
        },
        {
            text:
                "堀川国広",

            pages: [
                {
                    text:
                        "堀川には、僕も随分助けられているよ。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "もっとも、和泉守の話をしている時が一番楽しそうだけれどねぇ。",
                    expression:
                        "norimune_tease"
                }
            ]
        },
        {
            text:
                "誰とも話していない",

            pages: [
                {
                    text:
                        "そうかい。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "なら今日は、僕が話し相手になろう。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "honmaru_help_01",

    text:
        "本丸で、手を貸すなら誰がいいと思う。",

    expression: "norimune_normal",

    tags: [
        "honmaru",
        "choice"
    ],

    choices: [
        {
            text:
                "堀川国広",

            pages: [
                {
                    text:
                        "堀川か。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "あれは頼めば喜んで働くが、働かせすぎないようにねぇ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "和泉守兼定",

            pages: [
                {
                    text:
                        "厨仕事なら、あれほど頼もしい男もいない。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "ただし、つまみ食いは見逃してくれないよ。",
                    expression:
                        "norimune_tease"
                }
            ]
        },
        {
            text:
                "長曽祢虎徹",

            pages: [
                {
                    text:
                        "堅実な選び方だ。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "長曽祢へ任せれば、気づかないうちに全部片づいているだろうねぇ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "honmaru_relax_01",

    text:
        "本丸でのんびりするなら、誰と過ごしたいんだい。",

    expression: "norimune_tease",

    tags: [
        "honmaru",
        "choice"
    ],

    choices: [
        {
            text:
                "清光と安定",

            pages: [
                {
                    text:
                        "のんびりできるかは、少し怪しいねぇ。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "だが、退屈はしないだろう。",
                    expression:
                        "norimune_smile"
                }
            ]
        },
        {
            text:
                "三日月宗近",

            pages: [
                {
                    text:
                        "縁側で茶でも飲むのかな。",
                    expression:
                        "norimune_far"
                },
                {
                    text:
                        "話が長くなっても、僕は知らないよ。",
                    expression:
                        "norimune_tease"
                }
            ]
        },
        {
            text:
                "則宗さん",

            pages: [
                {
                    text:
                        "僕を選ぶのかい。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "うはは。それなら、特等席を空けておこう。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    pages:[
        {
            text:
                "御前と呼ばれるたび、隠居なんだがねぇと思う。",
            expression:"norimune_closed"
        },
        {
            text:
                "……けれど、呼んでくれる者がいるうちは、それも悪くないか。",
            expression:"norimune_gentle"
        }
    ],
    tags:["honmaru"]
},
{
    pages: [
        {
            text:
                "御前と呼ばれることもある。"
        },
        {
            text:
                "隠居したつもりなんだがねぇ。"
        },
        {
            text:
                "どうも周りは、そうは思ってくれないらしい。"
        }
    ],
    tags:["honmaru"],
    expression:"norimune_tease"
},
{
    text:
        "長く在ると、色々なものへ興味が移る。||" +
        "今は、あの若者たちの話を聞くのが楽しくてねぇ。",
    tags:["honmaru"],
    expression:"norimune_gentle"
},
{
    pages:[
        {
            text:
                "隠居とは、肩書きを捨てることじゃない。"
        },
        {
            text:
                "少し肩の力を抜いて、生き方を変えることさ。"
        },
        {
            text:
                "だから僕は、今日も隠居を続けている。"
        }
    ],
    tags:["honmaru"],
    expression:"norimune_gentle"
},
{
    text:
        "遠征から戻った清光が、『これ土産！』と菓子を渡してきてねぇ。||" +
        "……半分、自分で食べていたけれど。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "安定は、何でもない顔をして世話を焼くんだ。||" +
        "ああいうところは、昔から変わらないねぇ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "清光も安定も、僕に遠慮というものがなくてねぇ。||" +
        "……うはは。それでいいと思っているよ。",
    tags: ["honmaru"],
    expression: "norimune_smile"
},
{
    text:
        "清光が悔しそうな顔をしていてねぇ。||" +
        "伸びる刀は、ああいう顔をするものさ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "あの二振りは、一振りだけ静かということがない。||" +
        "大抵、二振りまとめて賑やかだねぇ。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "遠征帰りの清光と安定は、まず互いに話し始める。||" +
        "報告より先に話が弾むあたり、仲が良い証拠だろうねぇ。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    text:
        "長曽祢に、『少し甘いんじゃないか』と言われてしまってねぇ。||" +
        "さて、誰のことだったかな。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "さっきまで扇子が見当たらなくてねぇ。||" +
        "犯人は、すぐ名乗り出てくれたよ。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    type: "choice",
    id: "honmaru_okitagumi_01",

    text:
        "今日は先に来たのは、どちらだったかな。",

    expression: "norimune_normal",

    tags: [
        "honmaru",
        "choice"
    ],

    choices: [
        {
            text:
                "加州清光",

            pages: [
                {
                    text:
                        "そうそう。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "安定は少し遅れて、『また先に行ったの？』なんて言っていたよ。",
                    expression:
                        "norimune_tease"
                }
            ]
        },
        {
            text:
                "大和守安定",

            pages: [
                {
                    text:
                        "うん。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "『今日は静かだな』と思ったら、あとから清光が飛び込んできた。",
                    expression:
                        "norimune_closed"
                }
            ]
        },
        {
            text:
                "二振り一緒",

            pages: [
                {
                    text:
                        "それが一番あの二振りらしい。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "賑やかさも二倍になるけれどねぇ。",
                    expression:
                        "norimune_tease"
                }
            ]
        }
    ]
},
{
    text:
        "清光も安定も、もう立派な刀だ。||" +
        "それでも、つい気に掛けてしまうのは……年寄りの悪い癖かな。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "週の終わりだからと、和泉守が夕餉を少し豪勢にするらしい。||" +
        "皆の顔には、もう知られていたけれどねぇ。",
    tags: ["honmaru"],

    dayOfWeek: 5,

    expression: "norimune_smile"
},
     /*
    　* ↑「本丸」コマンドここまで↑
    　* ↓時間限定会話↓
    　*/

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
{
    text:
        "朝は、まだ一日の形が決まっていない。||" +
        "そう思うと、少し気が楽になるねぇ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "起きたばかりの顔だねぇ。||" +
        "うはは。無理にしゃんとしなくてもいいよ。",
    tags: ["normal"],
    expression: "norimune_tease"
},
{
    text:
        "朝の空気は、少し刃に似ている。||" +
        "澄んでいて、触れると目が覚める。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    text:
        "昨日のことを、朝まで抱えてきたのかい。||" +
        "なら、ここで少し置いていくといい。",
    tags: ["normal"],
    expression: "norimune_soft"
},
{
    text:
        "朝は静かでいい。||" +
        "皆が動き出す前の、ほんの短い時間だけれどねぇ。",
    tags: ["normal"],
    expression: "norimune_closed"
},
{
    text:
        "清光と安定なら、朝から元気だったよ。||" +
        "口が動くうちは、まだ余裕があるということだろう。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "堀川は、朝からもう書類を整えていてねぇ。||" +
        "僕が手をつける前に片づいている。実に頼もしいよ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "和泉守は、朝餉の支度で随分忙しそうだった。||" +
        "あれで皆の顔色まで見ているのだから、大したものさ。",
    tags: ["honmaru"],
    expression: "norimune_smile"
},
{
    text:
        "長曽祢は、朝から本丸を一巡していたよ。||" +
        "僕よりよほど近侍らしく見える時があるねぇ。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "孫六に、朝稽古の相手を頼まれてねぇ。||" +
        "朝からあの役というのも、なかなか忙しいものだ。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "三日月は、朝から縁側で茶を飲んでいたよ。||" +
        "あれを見ると、こちらまで急ぐ気がなくなるねぇ。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    text:
        "包丁が朝からこちらを拝んでいてねぇ。||" +
        "何か御利益でもあると思っているのかな。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "三郎の歌声が、もう聞こえてきたよ。||" +
        "朝からよく声が出るものだねぇ。",
    tags: ["honmaru"],
    excludeConditions: [
        {
            time: ["midnight"]
        }
    ],
    expression: "norimune_closed"
},
{
    text:
        "朝の手入れは悪くない。||" +
        "刃も心も、曇りが少ない方が気持ちいいからねぇ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "朝稽古では、皆まだ余計な力が入っていない。||" +
        "そういう時ほど、その刀らしさがよく見えるものさ。",
    tags: ["normal"],
    expression: "norimune_think"
},
{
    text:
        "戦へ向かう朝も、こうして穏やかな朝も、空の色は変わらない。||" +
        "だからこそ、今の方を大切にしたいものだねぇ。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    text:
        "出陣前は、皆少しだけ静かになる。||" +
        "言葉にしなくても分かることが、刀同士にはあるからねぇ。",
    tags: ["honmaru"],
    expression: "norimune_serious"
},
{
    type: "choice",
    id: "morning_wake_01",

    text:
        "よく眠れたかい。",

    expression: "norimune_normal",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "よく眠れた",

            pages: [
                {
                    text:
                        "それは何よりだ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "朝の顔も、いつもより晴れて見えるよ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "あまり眠れなかった",

            pages: [
                {
                    text:
                        "そうかい。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "今日は、いつもより少しゆっくり動くといい。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "まだ眠い",

            pages: [
                {
                    text:
                        "うはは。正直でよろしい。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "朝餉まで、もう少しここにいるかい。",
                    expression:
                        "norimune_tease"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "morning_plan_01",

    text:
        "今日は、何から始めるつもりだい。",

    expression: "norimune_normal",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "まず仕事",

            pages: [
                {
                    text:
                        "感心だねぇ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "ただし、朝餉を抜くほど急ぐんじゃないよ。",
                    expression:
                        "norimune_serious"
                }
            ]
        },
        {
            text:
                "まず朝餉",

            pages: [
                {
                    text:
                        "うん。それがいい。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "腹が減っていては、良い考えも浮かばないからねぇ。",
                    expression:
                        "norimune_closed"
                }
            ]
        },
        {
            text:
                "まだ決めていない",

            pages: [
                {
                    text:
                        "それも悪くないさ。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "朝のうちは、迷う時間もまだ残っている。",
                    expression:
                        "norimune_far"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "morning_honmaru_01",

    text:
        "朝の本丸で、誰を見掛けたんだい。",

    expression: "norimune_normal",

    tags: [
        "honmaru",
        "choice"
    ],

    choices: [
        {
            text:
                "清光と安定",

            pages: [
                {
                    text:
                        "あの二振りなら、朝から賑やかだっただろう。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "元気でいてくれるなら、それでいいさ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "和泉守兼定",

            pages: [
                {
                    text:
                        "厨にいたかな。",
                    expression:
                        "norimune_think"
                },
                {
                    text:
                        "朝から皆の腹を預かるのは、なかなか骨が折れるものだ。",
                    expression:
                        "norimune_soft"
                }
            ]
        },
        {
            text:
                "三郎国宗",

            pages: [
                {
                    text:
                        "もう歌っていたかい。",
                    expression:
                        "norimune_tease"
                },
                {
                    text:
                        "うはは。あれも、本丸の目覚ましのようなものだねぇ。",
                    expression:
                        "norimune_closed"
                }
            ]
        },
        {
            text:
                "誰も見ていない",

            pages: [
                {
                    text:
                        "随分早起きだったんだねぇ。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "静かな本丸を独り占めできたのなら、少し得をしたね。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "morning_visit_01",

    text:
        "こんな朝早くから、僕に会いに来たのかい。",

    expression: "norimune_tease",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "会いたかった",

            pages: [
                {
                    text:
                        "……そうか。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "それなら、朝から随分嬉しいことを言ってくれる。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "たまたま通っただけ",

            pages: [
                {
                    text:
                        "うはは。そういうことにしておこうか。",
                    expression:
                        "norimune_closed"
                }
            ]
        },
        {
            text:
                "朝餉に呼びに来た",

            pages: [
                {
                    text:
                        "それは助かるよ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "話し込んで、また堀川に探されるところだった。",
                    expression:
                        "norimune_tease"
                }
            ]
        }
    ]
},
{
    text:
        "月曜の朝から、随分としゃんとしているねぇ。||" +
        "うはは。眠いなら、眠い顔をしていても構わないよ。",
    tags: ["normal"],

    dayOfWeek: 1,

    expression: "norimune_tease"
},
{
    text:
        "日曜の朝くらい、少し寝坊してもよかったんじゃないかい。||" +
        "もう起きてしまったなら、仕方がないけれどねぇ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_tease"
},
{
    text:
        "日曜日の朝は、少しだけ静かに始めたいものだねぇ。||" +
        "まずは茶でも飲もうか。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_gentle"
},
{
    text:
        "今日は何をするにも、まだ時間がある。||" +
        "そう思える朝は、悪くないねぇ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_smile"
},
{
    text:
        "月曜の朝から、ずいぶん早いねぇ。||" +
        "眠いなら、眠い顔のままでも構わないよ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_tease"
},
{
    text:
        "週の始まりは、どうにも足が重くなるらしい。||" +
        "まずは一歩でいい。二歩目は、そのあと考えよう。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_gentle"
},
{
    text:
        "月曜日だからと、朝から気合を入れすぎてはいないかい。||" +
        "一週間もあるんだ。力は残しておきなさい。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_soft"
},
{
    text:
        "月曜の朝は、茶も少し濃い方がいいかもしれないねぇ。||" +
        "気分の問題だろうけれど。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_closed"
},
{
    text:
        "火曜日か。||" +
        "月曜日を越えただけでも、少し気が楽になるものだねぇ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_gentle"
},
{
    text:
        "週の流れにも、少し慣れてきた頃かな。||" +
        "無理に勢いをつけなくても、そのままで進めばいいさ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_soft"
},
{
    text:
        "火曜日というのは、少し影が薄いねぇ。||" +
        "だが、目立たない日ほど穏やかに過ぎるものさ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_closed"
},
{
    text:
        "まだ週の初めだと思うかい。||" +
        "それとも、もう二日目だと思うかな。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_think"
},
{
    text:
        "昨日うまくいかなかったことを、まだ気にしているのかい。||" +
        "今日は昨日の続きであって、やり直しでもあるんだよ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_gentle"
},
{
    text:
        "火曜日まで来れば、一週間も少し形になってくる。||" +
        "先が見えない時ほど、一日ずつでいい。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_far"
},
{
    text:
        "水曜の朝だ。||" +
        "今日は少し肩の力を抜いて始めようか。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_gentle"
},
{
    text:
        "週の真ん中の朝は、少し眠たくなる頃でもある。||" +
        "茶でも飲んで、ゆっくり目を覚まそう。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_closed"
},
{
    text:
        "今日は水曜日。||" +
        "頑張る日というより、整える日かもしれないねぇ。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_far"
},
{
    text:
        "木曜の朝だねぇ。||" +
        "今週も、もう少しで一区切りだ。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_smile"
},
{
    text:
        "今日は、昨日より少し肩の力を抜いてもいい頃だよ。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_gentle"
},
{
    text:
        "木曜の朝は、不思議と空気が柔らかい。||" +
        "そう感じるのは、僕だけかな。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_far"
},
{
    text:
        "あと一息、と朝から考えなくてもいい。||" +
        "まずは今日を始めようじゃないか。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_soft"
},
{
    text:
        "金曜の朝だ。||" +
        "あと一日と思うより、今日を始めようじゃないか。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_gentle"
},
{
    text:
        "今日は少しだけ、足取りが軽そうだねぇ。||" +
        "気のせいなら、それでもいいさ。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_tease"
},
{
    text:
        "金曜日だからと、朝から力を使い切ってはいけないよ。||" +
        "最後まで残しておきなさい。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_soft"
},
     /*
    　* ↑朝の話ここまで↑
    　* ↓昼の話↓
    　*/
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
{
    text:
        "昼になると、時間まで少し緩むように感じるねぇ。||" +
        "急ぐ用がなければ、少しくらい足を止めてもいいだろう。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "日が高いねぇ。||" +
        "こんな時間に考え事を始めると、つい長くなってしまう。",
    tags: ["normal"],
    expression: "norimune_think"
},
{
    text:
        "昼の光は、何でもよく見せる。||" +
        "見たくないものまで、ということもあるけれどねぇ。",
    tags: ["normal"],
    expression: "norimune_closed"
},
{
    text:
        "少し眠そうだねぇ。||" +
        "無理に抗わなくても、昼寝という立派な手があるよ。",
    tags: ["normal"],
    expression: "norimune_tease"
},
{
    text:
        "昼餉は済ませたのかい。||" +
        "考え事は、腹を満たしてからにした方がいい。",
    tags: ["normal"],
    expression: "norimune_soft"
},
{
    text:
        "昼は、朝ほど慌ただしくもなく、夜ほど静かでもない。||" +
        "案外、過ごしやすい時間だねぇ。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    text:
        "遠征組なら、もうとっくに出ているよ。||" +
        "今頃は、それぞれの役目を果たしている頃だろうねぇ。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    text:
        "昼の本丸は、朝より少し静かだ。||" +
        "皆が持ち場に散っているからだろうねぇ。",
    tags: ["honmaru"],
    expression: "norimune_normal"
},
{
    text:
        "堀川は、昼になっても書類を抱えていたよ。||" +
        "楽しそうなのだから、止めるのも野暮かと思ってねぇ。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "和泉守は、昼餉が済んでも厨を離れないことがある。||" +
        "皆の腹具合まで気にしているんだろう。",
    tags: ["honmaru"],
    expression: "norimune_soft"
},
{
    text:
        "長曽祢は、昼も本丸中を見て回っているよ。||" +
        "あれだけ働けば、夜の酒も美味いだろうねぇ。",
    tags: ["honmaru"],
    expression: "norimune_smile"
},
{
    text:
        "孫六なら、蔵の方にいるんじゃないかな。||" +
        "昼から手合わせに誘えば、きっと嫌な顔をされるだろうねぇ。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "三日月は、縁側の一番涼しい場所を見つけるのが上手い。||" +
        "あれも長く生きた知恵というものかな。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    text:
        "包丁が、昼餉のあとの甘いものを探していてねぇ。||" +
        "人妻より先に、菓子へ辿り着いたようだ。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "三郎の歌声なら、さっきまで聞こえていたよ。||" +
        "今は昼餉でも食べているんじゃないかな。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "昼の手入れ部屋は、妙に落ち着くことがある。||" +
        "傷を負って戻った刀が、少しずつ元へ戻っていく場所だからねぇ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "遠征は、戦とは少し違う。||" +
        "けれど、戻る場所があることに変わりはないよ。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    text:
        "刀は、振るわれている時ばかりが役目ではない。||" +
        "こうして待つことも、立派な役目のひとつさ。",
    tags: ["normal"],
    expression: "norimune_serious"
},
{
    text:
        "出陣していない刀にも、できることはある。||" +
        "本丸を守るのも、戻る者を迎えるのもねぇ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    type: "choice",
    id: "day_lunch_01",

    text:
        "昼餉は、もう済ませたのかい。",

    expression: "norimune_normal",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "もう食べた",

            pages: [
                {
                    text:
                        "それは結構。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "なら、少しくらいゆっくりしていくといい。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "まだ食べていない",

            pages: [
                {
                    text:
                        "それはいけないねぇ。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "和泉守に見つかる前に、何か腹へ入れておいで。",
                    expression:
                        "norimune_tease"
                }
            ]
        },
        {
            text:
                "あまり食欲がない",

            pages: [
                {
                    text:
                        "そうかい。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "無理はしなくていいが、少しでも口にできるものを探そうか。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "day_sleepy_01",

    text:
        "眠そうだねぇ。どうするつもりだい。",

    expression: "norimune_tease",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "少し昼寝する",

            pages: [
                {
                    text:
                        "うん。それがいい。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "起きる頃には、頭も少し軽くなっているさ。",
                    expression:
                        "norimune_soft"
                }
            ]
        },
        {
            text:
                "まだ頑張る",

            pages: [
                {
                    text:
                        "感心ではあるけれど。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "倒れるまで頑張るのは、あまり賢いやり方ではないよ。",
                    expression:
                        "norimune_serious"
                }
            ]
        },
        {
            text:
                "則宗さんと話す",

            pages: [
                {
                    text:
                        "僕で眠気が覚めるのかい。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "うはは。それなら、もう少し付き合おう。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "day_honmaru_01",

    text:
        "昼の本丸で、気になる者でもいるのかい。",

    expression: "norimune_normal",

    tags: [
        "honmaru",
        "choice"
    ],

    choices: [
        {
            text:
                "遠征組",

            pages: [
                {
                    text:
                        "無事にやっているさ。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "帰ってくる頃には、また門の方が賑やかになるだろうねぇ。",
                    expression:
                        "norimune_far"
                }
            ]
        },
        {
            text:
                "堀川国広",

            pages: [
                {
                    text:
                        "今頃も、僕の代わりに細かな仕事を片づけているだろう。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "僕が苦手だからではないよ。適材適所というものさ。",
                    expression:
                        "norimune_tease"
                }
            ]
        },
        {
            text:
                "和泉守兼定",

            pages: [
                {
                    text:
                        "厨にいるんじゃないかな。",
                    expression:
                        "norimune_think"
                },
                {
                    text:
                        "あれは見た目より、ずっと皆のことをよく見ているからねぇ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "特にいない",

            pages: [
                {
                    text:
                        "それなら、僕のところで正解だったねぇ。",
                    expression:
                        "norimune_tease"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "day_stay_01",

    text:
        "昼のうちから、随分ゆっくりしているねぇ。",

    expression: "norimune_tease",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "ここが落ち着くから",

            pages: [
                {
                    text:
                        "そうかい。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "なら、無理に追い出す理由もないねぇ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "則宗さんがいるから",

            pages: [
                {
                    text:
                        "……僕がいるから？",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "昼から、なかなか嬉しいことを言ってくれる。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "たまたま",

            pages: [
                {
                    text:
                        "うはは。そういうことにしておこうか。",
                    expression:
                        "norimune_closed"
                }
            ]
        }
    ]
},
{
    text:
        "日曜の昼まで来ると、少し惜しくなってくる者もいるらしい。||" +
        "まだ半分は残っているのにねぇ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_closed"
},
{
    text:
        "今日は昼餉のあとも、急ぐ必要はなさそうだ。||" +
        "眠くなったなら、素直に眠るといいよ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_soft"
},
{
    text:
        "日曜日だからと、予定を詰め込みすぎてはいないかい。||" +
        "休む日まで忙しくしては、本末転倒だよ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_serious"
},
{
    text:
        "月曜日も、もう半分ほど過ぎた。||" +
        "始まってしまえば、案外早いものだねぇ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_smile"
},
{
    text:
        "朝から頑張りすぎた顔をしているよ。||" +
        "昼くらいは、少し息をつきなさい。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_soft"
},
{
    text:
        "月曜日の昼まで来れば、もう週の始まりには違いない。||" +
        "あとは一歩ずつ進めばいいさ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_gentle"
},
{
    text:
        "まだ月曜日だと思うか、もう月曜日の昼だと思うか。||" +
        "同じ時刻でも、随分違って見えるものだねぇ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_think"
},
{
    text:
        "火曜日も、もう半分ほど過ぎたねぇ。||" +
        "週の流れに乗れているなら、それで充分だ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_gentle"
},
{
    text:
        "少し集中が切れてきた顔だねぇ。||" +
        "二日目というのは、案外そういう頃合いなのかもしれない。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_tease"
},
{
    text:
        "火曜日の昼まで来れば、月曜日はもう遠い。||" +
        "そう思えば、少し得をした気分になるだろう。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_closed"
},
{
    text:
        "先の予定ばかり見ていると、今の時間を落としてしまう。||" +
        "昼餉くらいは、昼餉のことだけ考えるといい。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_soft"
},
{
    text:
        "水曜の昼まで来た。||" +
        "今週も、案外ここまで早かったねぇ。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_smile"
},
{
    text:
        "疲れは溜まっていないかい。||" +
        "週の真ん中ほど、気づきにくいものだからねぇ。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_soft"
},
{
    text:
        "今日は昼餉のあと、少しゆっくりしても罰は当たらないさ。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_gentle"
},
{
    text:
        "木曜日も昼になった。||" +
        "今日は少し、歩幅が落ち着いているように見えるねぇ。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_closed"
},
{
    text:
        "昼餉のあとくらいは、肩を回しておきなさい。||" +
        "疲れは、案外そういうところへ溜まるものだから。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_gentle"
},
{
    text:
        "木曜日は、頑張りすぎず歩くくらいがちょうどいい。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_soft"
},
{
    text:
        "金曜も昼になった。||" +
        "今週も、もうここまで来たねぇ。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_smile"
},
{
    text:
        "昼餉を食べたら、あと半日だ。||" +
        "焦るより、落ち着いていこう。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_gentle"
},
{
    text:
        "金曜日の昼は、不思議と空気まで軽く感じることがある。||" +
        "気分というものは面白いねぇ。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_far"
},
     /*
    　* ↑昼の話ここまで↑
    　* ↓夕方の話↓
    　*/
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
{
    text:
        "夕方というのは、不思議だねぇ。||" +
        "一日が終わるようでいて、まだ少し残っている。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    text:
        "西日が眩しいねぇ。||" +
        "昼とは違って、少し名残惜しそうな光だ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "今日やり残したことでもあるのかい。||" +
        "明日に回せるものなら、無理に今日へ詰め込まなくてもいいさ。",
    tags: ["normal"],
    expression: "norimune_soft"
},
{
    text:
        "夕暮れは、考え事に向いているようでねぇ。||" +
        "気づけば、ただ空を眺めているだけのことも多い。",
    tags: ["normal"],
    expression: "norimune_think"
},
{
    text:
        "一日が短く感じるのは、忙しかった証拠かもしれないねぇ。||" +
        "何もしていなかったように思えても、案外そうでもないものさ。",
    tags: ["normal"],
    expression: "norimune_closed"
},
{
    text:
        "日が落ちる前の風は、少しだけ優しい。||" +
        "今日もよく励んだと、そう言っているようだねぇ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "遠征組も、そろそろ戻る頃だねぇ。||" +
        "門の方が賑やかになるのも、もうすぐだろう。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    text:
        "遠征帰りの足音は、少し違って聞こえる。||" +
        "疲れていても、戻ってきた時の足取りには力があるものさ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "清光と安定が戻る日は、門を見る前に分かることがある。||" +
        "声が先に帰ってくるからねぇ。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "堀川は、夕餉までに書類を片づけようとしていたよ。||" +
        "和泉守に呼ばれる前に終えたいらしい。",
    tags: ["honmaru"],
    expression: "norimune_smile"
},
{
    text:
        "和泉守が厨に立つと、本丸の空気まで少し変わる。||" +
        "皆、夕餉の匂いには正直だからねぇ。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "長曽祢は、戻った者の報告を聞いている頃かな。||" +
        "夕餉の前まで、なかなか休めない男だよ。",
    tags: ["honmaru"],
    expression: "norimune_soft"
},
{
    text:
        "孫六は、蔵の戸締まりを確かめていたよ。||" +
        "ああいうところは、実に几帳面だねぇ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "三日月とは、夕暮れの縁側で茶を飲むこともある。||" +
        "話しているうちに、いつの間にか夜になってしまうよ。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    text:
        "包丁が、夕餉の前から厨の周りをうろうろしていてねぇ。||" +
        "人妻を探しているのか、菓子を探しているのか、僕にも分からない。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "三郎の歌が、夕暮れの廊下まで響いていたよ。||" +
        "あれだけ声が通るなら、帰ってきた者も迷わないだろうねぇ。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "出陣から戻った刀は、まず鞘に収まる。||" +
        "戻る場所があるというのは、それだけで有難いものだよ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "戦を終えたあとの静けさは、平穏とは少し違う。||" +
        "それでも、こうして日が暮れていくのは悪くないねぇ。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    text:
        "刀は、帰ってきた時にようやく力を抜ける。||" +
        "人も、案外同じなのかもしれないねぇ。",
    tags: ["normal"],
    expression: "norimune_soft"
},
{
    text:
        "手入れを終えた刀の気配は、少し軽い。||" +
        "言葉にしなくても、無事でよかったと思うものさ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    type: "choice",
    id: "evening_day_01",

    text:
        "今日は、どんな一日だったんだい。",

    expression: "norimune_normal",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "良い一日だった",

            pages: [
                {
                    text:
                        "それは何よりだ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "良かったことは、ちゃんと覚えておくといい。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "疲れた",

            pages: [
                {
                    text:
                        "そうかい。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "なら、ここから先は少し自分を甘やかしてもいいだろう。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "よく分からない",

            pages: [
                {
                    text:
                        "うはは。そういう日もある。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "答えを出すのは、明日でも遅くないさ。",
                    expression:
                        "norimune_far"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "evening_return_01",

    text:
        "遠征組の帰りが、気になるのかい。",

    expression: "norimune_tease",

    tags: [
        "honmaru",
        "choice"
    ],

    choices: [
        {
            text:
                "少し気になる",

            pages: [
                {
                    text:
                        "そうだろうねぇ。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "無事な顔を見るまでは、誰でも落ち着かないものさ。",
                    expression:
                        "norimune_soft"
                }
            ]
        },
        {
            text:
                "信じて待ってる",

            pages: [
                {
                    text:
                        "うん。それでいい。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "待ってくれる者がいるから、皆も帰ってこられる。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "則宗さんと待つ",

            pages: [
                {
                    text:
                        "僕と一緒にかい。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "それなら、門が開くまでここにいようか。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "evening_honmaru_01",

    text:
        "夕餉まで、どう過ごすつもりだい。",

    expression: "norimune_normal",

    tags: [
        "honmaru",
        "choice"
    ],

    choices: [
        {
            text:
                "厨を手伝う",

            pages: [
                {
                    text:
                        "それは和泉守が助かるだろう。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "ただし、勝手に味見ばかりして叱られないようにねぇ。",
                    expression:
                        "norimune_tease"
                }
            ]
        },
        {
            text:
                "遠征組を迎える",

            pages: [
                {
                    text:
                        "うん。それがいい。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "帰ってきた時に、知った顔があると安心するものだからねぇ。",
                    expression:
                        "norimune_soft"
                }
            ]
        },
        {
            text:
                "ここで則宗さんといる",

            pages: [
                {
                    text:
                        "僕と？",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "うはは。夕餉に呼ばれるまでなら、構わないよ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "evening_sky_01",

    text:
        "夕焼けを見に来たのかい。",

    expression: "norimune_far",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "そうだよ",

            pages: [
                {
                    text:
                        "それなら、良い場所を知っている。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "日が沈むまで、少し付き合おうか。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "則宗さんを見に来た",

            pages: [
                {
                    text:
                        "夕焼けより僕を？",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "うはは。随分と贅沢なことを言うねぇ。",
                    expression:
                        "norimune_tease"
                }
            ]
        },
        {
            text:
                "なんとなく来た",

            pages: [
                {
                    text:
                        "理由なんて、なくてもいいさ。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "せっかくだ。日が沈むまで、ここにいるといい。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    text:
        "日曜の夕方は、少しだけ名残惜しい顔をする者が多いねぇ。||" +
        "お前さんも、そうなのかい。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_tease"
},
{
    text:
        "明日を考えるには、まだ少し早い。||" +
        "日が沈むまでは、今日のままでいようじゃないか。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_gentle"
},
{
    text:
        "日曜日が終わるのではなく、今日という日が暮れるだけさ。||" +
        "あまり構えなくてもいいよ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_far"
},
{
    text:
        "月曜日も、もう夕方だ。||" +
        "今日は今日の分だけ、よく励んだねぇ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_gentle"
},
{
    text:
        "週の初めから、全部片づけようとしなくていい。||" +
        "明日へ渡すものがあっても、困りはしないよ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_soft"
},
{
    text:
        "月曜の夕暮れは、少し肩の力が抜けるねぇ。||" +
        "始まりの日を、ひとまず越えたからだろう。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_far"
},
{
    text:
        "今日できなかったことばかり、数えているのかい。||" +
        "ここまで来たことも、同じように数えておきなさい。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_serious"
},
{
    text:
        "火曜日も、もう夕方だ。||" +
        "昨日より少しだけ、週の中へ馴染んできたかな。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_gentle"
},
{
    text:
        "今日も一日、よく励んだねぇ。||" +
        "二日分をまとめて背負う必要はないよ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_soft"
},
{
    text:
        "火曜の夕暮れは、少し中途半端でいい。||" +
        "急いで答えを出さなくても、明日はまだ来るからねぇ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_far"
},
{
    text:
        "今日できたことを、ひとつくらい思い出しておきなさい。||" +
        "足りなかったことより、そちらの方が明日の役に立つよ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_serious"
},
{
    text:
        "今日も日が傾いてきた。||" +
        "水曜日を越えれば、週の景色も少し変わるねぇ。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_far"
},
{
    text:
        "真ん中の日というのは、不思議と区切りになる。||" +
        "今日はここまで、と決めるのも悪くないよ。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_gentle"
},
{
    text:
        "あと半分と思うより、半分歩いたと思う方が気が楽だ。||" +
        "僕はそうしているよ。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_closed"
},
{
    text:
        "木曜の夕暮れだ。||" +
        "今日も、ちゃんとここまで来たねぇ。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_gentle"
},
{
    text:
        "明日のことを考えるには、まだ少し早い。||" +
        "今日は今日で締めくくろう。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_far"
},
{
    text:
        "夕方になると、一日ぶん働いた顔になるねぇ。||" +
        "その顔は嫌いじゃないよ。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_smile"
},
{
    text:
        "金曜の夕暮れだ。||" +
        "今日も一日、お疲れさま。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_gentle"
},
{
    text:
        "夕方になると、今週を振り返る者も多い。||" +
        "今日は、良かったことから思い出してみようか。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_soft"
},
{
    text:
        "あと少しだねぇ。||" +
        "最後まで、慌てずいこうじゃないか。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_closed"
},
     /*
    　* ↑夕方の話ここまで↑
    　* ↓夜の話↓
    　*/
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
{
    text:
        "夜になると、一日の音が少しずつ遠ざかっていく。||" +
        "ようやく、自分の声が聞こえる時間だねぇ。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    text:
        "今日のことを、まだ考えているのかい。||" +
        "夜は何でも少し重く見える。結論は朝まで待ってもいいさ。",
    tags: ["normal"],
    expression: "norimune_soft"
},
{
    text:
        "行灯の明かりは、昼より人の顔を素直に見せるねぇ。||" +
        "お前さんも、少し気が抜けてきたようだ。",
    tags: ["normal"],
    expression: "norimune_tease"
},
{
    text:
        "眠る前くらいは、自分を責めるのをやめておきなさい。||" +
        "反省は、明るいところでした方が役に立つよ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "夜は静かでいい。||" +
        "言葉にしなくても、同じ場所にいるだけで済むからねぇ。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    text:
        "今日も一日、よく励んだねぇ。||" +
        "誰が見ていなくても、働いた身体はちゃんと覚えているものさ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "眠るにはまだ早い。けれど、何かを始めるには少し遅い。||" +
        "夜というのは、実に都合のいい時間だねぇ。",
    tags: ["normal"],
    expression: "norimune_closed"
},
{
    text:
        "夕餉も済んで、ようやく本丸が落ち着いたねぇ。||" +
        "昼とは違う、満ち足りた静けさだ。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    text:
        "清光と安定なら、まだ何やら言い合っていたよ。||" +
        "あれだけ元気なら、遠征の疲れも心配なさそうだ。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "堀川には、もう書類を置くよう言っておいた。||" +
        "放っておくと、和泉守に呼ばれるまで働きそうだからねぇ。",
    tags: ["honmaru"],
    expression: "norimune_troubled"
},
{
    text:
        "和泉守も、ようやく厨から出てきた頃かな。||" +
        "皆が食べ終わるまで落ち着かないとは、難儀な性分だねぇ。",
    tags: ["honmaru"],
    expression: "norimune_soft"
},
{
    text:
        "長曽祢とは、あとで一杯やる約束をしているんだ。||" +
        "孫六も来れば、また昔の話が長くなるだろうねぇ。",
    tags: ["honmaru"],
    expression: "norimune_smile"
},
{
    text:
        "孫六が、今夜は手合わせの続きをすると言っていてねぇ。||" +
        "酒が入る前にしておくべきだったかな。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "三日月とは、夜の縁側でもよく茶を飲む。||" +
        "主の話をしていると、茶が冷めるのも忘れてしまうよ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "包丁が、今夜も柱の陰からこちらを見ていてねぇ。||" +
        "喜ぶなら、もう少し主の近くへ座ってみようか。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "三郎の歌なら、さっきまで聞こえていたよ。||" +
        "静かになったと思ったら、曲の合間だったらしい。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "遠征組も皆戻った。手入れも済んだ。||" +
        "こうして人数を確かめ終えると、ようやく夜になった気がするねぇ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "戦から戻った夜は、鞘の内まで静かに感じる。||" +
        "無事に帰れたと、刀もようやく理解するのかもしれないねぇ。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    text:
        "手入れを受けたあとの夜は、よく眠れる。||" +
        "刀が眠るというのも、妙な話だけれどねぇ。",
    tags: ["normal"],
    expression: "norimune_closed"
},
{
    text:
        "刀は夜目が利くわけではない。||" +
        "だが、闇の中で向けられる殺気には、昔からよく馴染んでいてねぇ。",
    tags: ["normal"],
    expression: "norimune_serious"
},
{
    text:
        "本丸の夜番は、何も起きないのが一番だ。||" +
        "抜かれずに朝を迎える刀ほど、よく役目を果たしていることもある。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "昔は、夜が明けるまで鞘へ戻れないこともあった。||" +
        "今は主のそばで茶を飲んでいる。随分と良い身分になったものさ。",
    tags: ["normal"],
    expression: "norimune_smile"
},
{
    text:
        "夜の静けさを知っている刀ほど、戦場の音を忘れない。||" +
        "忘れないからこそ、今を穏やかに過ごせるのかもしれないねぇ。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    type: "choice",
    id: "night_day_end_01",

    text:
        "今日という日は、もう終わりにできそうかい。",

    expression: "norimune_normal",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "うん、もう休める",

            pages: [
                {
                    text:
                        "それは何よりだ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "では、今日のことは今日へ置いていきなさい。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "まだやることがある",

            pages: [
                {
                    text:
                        "そうかい。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "終わらせることより、明日に響かせないことを考えるんだよ。",
                    expression:
                        "norimune_serious"
                }
            ]
        },
        {
            text:
                "終わりにしたくない",

            pages: [
                {
                    text:
                        "何か名残惜しいことでもあったのかな。",
                    expression:
                        "norimune_think"
                },
                {
                    text:
                        "なら、もう少しくらい僕が付き合おう。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "night_sleep_01",

    text:
        "眠くなってきたんじゃないかい。",

    expression: "norimune_tease",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "もう眠い",

            pages: [
                {
                    text:
                        "うん。良い子だ。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "温かくして、ゆっくり休みなさい。",
                    expression:
                        "norimune_soft"
                }
            ]
        },
        {
            text:
                "まだ眠くない",

            pages: [
                {
                    text:
                        "そうかい。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "なら、夜更かしにならない程度に話していこうか。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "則宗さんが寝るまで起きてる",

            pages: [
                {
                    text:
                        "僕を待つつもりかい。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "うはは。それでは、どちらが先に折れるか分からないねぇ。",
                    expression:
                        "norimune_tease"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "night_honmaru_01",

    text:
        "今夜は、どこで過ごすつもりだい。",

    expression: "norimune_normal",

    tags: [
        "honmaru",
        "choice"
    ],

    choices: [
        {
            text:
                "自室へ戻る",

            pages: [
                {
                    text:
                        "うん。それがいい。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "廊下は冷えるから、足元に気をつけるんだよ。",
                    expression:
                        "norimune_soft"
                }
            ]
        },
        {
            text:
                "皆の様子を見て回る",

            pages: [
                {
                    text:
                        "主は働き者だねぇ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "けれど、皆が休めるのは主も休んでこそだよ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "ここにいる",

            pages: [
                {
                    text:
                        "僕のところにかい。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "構わないよ。茶なら、まだ残っている。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "night_visit_01",

    text:
        "こんな時間まで、僕のそばにいてくれるのかい。",

    expression: "norimune_tease",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "一緒にいたいから",

            pages: [
                {
                    text:
                        "……そうか。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "夜は長い。焦らず、ゆっくりしていくといい。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "ひとりで眠るのが寂しい",

            pages: [
                {
                    text:
                        "それは困ったねぇ。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "では、眠くなるまで僕が話し相手になろう。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "もう帰るところ",

            pages: [
                {
                    text:
                        "そうかい。",
                    expression:
                        "norimune_normal"
                },
                {
                    text:
                        "引き止めはしないが、少し残念ではあるねぇ。",
                    expression:
                        "norimune_tease"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "night_sword_01",

    text:
        "主は、刀が戦を恐れると思うかい。",

    expression: "norimune_think",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "恐れないと思う",

            pages: [
                {
                    text:
                        "うはは。随分と買ってくれるねぇ。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "だが、恐れを知らないことと、勇敢であることは違うものさ。",
                    expression:
                        "norimune_serious"
                }
            ]
        },
        {
            text:
                "少しは怖いと思う",

            pages: [
                {
                    text:
                        "そうだねぇ。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "失いたくないものが増えれば、刀にも恐れる理由はできる。",
                    expression:
                        "norimune_far"
                }
            ]
        },
        {
            text:
                "則宗さんはどうなの",

            pages: [
                {
                    text:
                        "僕かい。",
                    expression:
                        "norimune_surprised"
                },
               {
                   text:
                       "恐れることはあるよ。",
                   expression:
                       "norimune_far"
               },
               {
                   text:
                       "それでも、主の前では笑っていたいと思っている。",
                   expression:
                       "norimune_gentle"
               }
            ]
        }
    ]
},
{
    text:
        "日曜日の夜だからといって、明日の心配ばかりしなくてもいい。||" +
        "今夜の分まで、明日に渡してしまわないようにねぇ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_soft"
},
{
    text:
        "今日は、ちゃんと休めたかい。||" +
        "何かを成し遂げたかどうかは、聞いていないよ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_gentle"
},
{
    text:
        "明日の支度が済んだなら、あとは眠るだけだ。||" +
        "済んでいなくても、眠る時間は必要だけれどねぇ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_closed"
},
{
    type: "choice",
    id: "sunday_spend_01",

    text:
        "今日は、どんな日曜日だったんだい。",

    expression: "norimune_normal",

    tags: [
        "normal",
        "choice"
    ],

    dayOfWeek: 0,

    choices: [
        {
            text:
                "ゆっくりできた",

            pages: [
                {
                    text:
                        "それは何よりだ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "休めたというだけで、今日は充分だよ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "忙しかった",

            pages: [
                {
                    text:
                        "そうかい。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "曜日が休ませてくれるわけではないものねぇ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "何もしていない",

            pages: [
                {
                    text:
                        "うはは。いいじゃないか。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "何もしない時間を持てたなら、立派な過ごし方だよ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    text:
        "月曜日も、もう終わりに近い。||" +
        "まず一日、よく越えたねぇ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_gentle"
},
{
    text:
        "週の初めから、随分と疲れたのかい。||" +
        "先が長いからこそ、今夜はきちんと休みなさい。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_soft"
},
{
    text:
        "月曜日にできなかったことは、火曜日へ任せてもいい。||" +
        "曜日同士も、案外助け合っているものさ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_closed"
},
{
    text:
        "今日を反省するのは構わないが、\n" +
        "眠る前まで叱り続けることはないよ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_gentle"
},
{
    text:
        "火曜日も、そろそろ終わりだねぇ。||" +
        "目立たない一日でも、ちゃんと今日まで連れてきてくれた。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_gentle"
},
{
    text:
        "まだ週の前半だと考えると、少し疲れるかい。||" +
        "今夜は今夜の分だけ休めばいいさ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_soft"
},
{
    text:
        "火曜日に残したものは、水曜日へ渡しておけばいい。||" +
        "全部を抱えたまま眠ることはないよ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_closed"
},
{
    text:
        "今日も、うまくできなかったことを数えているのかい。||" +
        "二日目まで来たことも、忘れず数えておきなさい。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_gentle"
},
{
    text:
        "水曜日も終わりだねぇ。||" +
        "今週も折り返し、お疲れさま。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_gentle"
},
{
    text:
        "ここまで来れば、もう週の半分は終わった。||" +
        "残り半分も、同じように歩けばいいさ。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_soft"
},
{
    text:
        "今日は、自分を褒める日でもいいんじゃないかな。||" +
        "週の真ん中まで来たんだからねぇ。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_smile"
},
{
    text:
        "木曜日も終わりが近い。||" +
        "今週も、あと少しだねぇ。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_gentle"
},
{
    text:
        "あと少しと思うと、急ぎたくなるものだ。||" +
        "けれど今日まで急ぐ必要はないよ。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_soft"
},
{
    text:
        "木曜日を越えたなら、それだけでも充分だ。||" +
        "明日のことは、明日の自分へ任せよう。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_closed"
},
{
    text:
        "金曜日も終わりだ。||" +
        "今週も、よく歩いてきたねぇ。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_smile"
},
{
    text:
        "今夜くらいは、自分へ『お疲れさま』と言ってやるといい。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_gentle"
},
{
    text:
        "終わったことより、頑張ったことを思い出す夜にしたいねぇ。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_far"
},
{
    text:
        "今日は少し、肩の力が抜けている顔をしている。||" +
        "その顔も悪くないよ。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_soft"
},
     /*
    　* ↑夜の話ここまで↑
    　* ↓深夜の話↓
    　*/
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
{
    text:
        "随分と静かな夜だねぇ。\n" +
        "自分の息遣いまで、よく聞こえる。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    text:
        "こんな時間まで考え事かい。\n" +
        "夜更けに出した答えは、朝になると形が変わることもあるよ。",
    tags: ["normal"],
    expression: "norimune_soft"
},
{
    text:
        "眠れないことを、気に病む必要はないさ。\n" +
        "身体が眠る支度をしている間、少し待ってやればいい。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "夜更けは、些細なことまで大きく見える。\n" +
        "明るくなれば、案外小さなものかもしれないよ。",
    tags: ["normal"],
    expression: "norimune_think"
},
{
    text:
        "もう今日なのか、まだ昨日なのか。\n" +
        "この時間は、少し曖昧だねぇ。",
    tags: ["normal"],
    expression: "norimune_closed"
},
{
    text:
        "眠ろうと力を入れるほど、眠りは逃げていくものさ。\n" +
        "随分と気まぐれなお客だねぇ。",
    tags: ["normal"],
    expression: "norimune_tease"
},
{
    text:
        "声を潜めて話すと、何でも秘密らしく聞こえるねぇ。\n" +
        "大した話をしているわけでもないのに。",
    tags: ["normal"],
    expression: "norimune_closed"
},
{
    text:
        "お前さんが眠くなるまで、ここにいるよ。\n" +
        "年寄りは、夜が長いことにも慣れているからねぇ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "本丸も、ようやく寝静まったようだ。\n" +
        "昼間の賑わいが嘘のようだねぇ。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    text:
        "清光と安定の部屋も、さすがに静かになったよ。\n" +
        "眠っている時くらいは、喧嘩もしないらしい。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "堀川には、夜更けまで書類へ触れないよう言ってある。\n" +
        "それでも灯りが見えたら、和泉守を呼ぶことにしているよ。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "和泉守は、厨の火を確かめてから休むんだ。\n" +
        "あれで随分と慎重な男だからねぇ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "長曽祢と孫六の部屋に、まだ灯りが見えることがある。\n" +
        "静かに飲んでいるのか、昔話が長引いているのか。",
    tags: ["honmaru"],
    expression: "norimune_smile"
},
{
    text:
        "三日月なら、まだ起きているかもしれないねぇ。\n" +
        "あれと話し始めると、朝まで戻れなくなるけれど。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "包丁も、さすがに今頃は眠っているだろう。\n" +
        "柱の陰にいないか、一応確かめておこうか。",
    tags: ["honmaru"],
    expression: "norimune_closed"
},
{
    text:
        "三郎の歌も、今は聞こえない。\n" +
        "……眠っている時は静かな男なんだねぇ。",
    tags: ["honmaru"],
    expression: "norimune_tease"
},
{
    text:
        "夜番の足音が、廊下の向こうから聞こえる。\n" +
        "何も起こらない夜を守るのも、大切な務めさ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    text:
        "皆が眠っている間も、本丸は止まっているわけじゃない。\n" +
        "火の番も、夜番も、それぞれ静かに働いているよ。",
    tags: ["honmaru"],
    expression: "norimune_far"
},
{
    text:
        "夜襲を待った夜というのは、妙に長かったものさ。\n" +
        "今は、何も起きないまま朝を待てる。それで充分だよ。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    text:
        "刀は眠っていても、気配までは鈍らない。\n" +
        "長くそうしてきたから、身体が覚えているんだろうねぇ。",
    tags: ["normal"],
    expression: "norimune_serious"
},
{
    text:
        "鞘に収まったまま朝を迎えられる夜は、良い夜だ。\n" +
        "抜かれないことも、刀の幸せのひとつだからねぇ。",
    tags: ["normal"],
    expression: "norimune_gentle"
},
{
    text:
        "暗闇の中では、姿より気配の方がよく見える。\n" +
        "刀にとっては、昔から馴染み深い感覚さ。",
    tags: ["normal"],
    expression: "norimune_serious"
},
{
    pages: [
        {
            text:
                "長く在れば、眠れない夜も増える。",
            expression: "norimune_far"
        },
        {
            text:
                "けれど今は、朝を待つ相手がいる。\n" +
                "昔より、随分と気楽になったものだよ。",
            expression: "norimune_gentle"
        }
    ],
    tags: ["normal"]
},
{
    text:
        "主が眠っている間くらいは、刀が起きていてもいいだろう。\n" +
        "守られる側にも、休む時間は必要だからねぇ。",
    tags: ["honmaru"],
    expression: "norimune_gentle"
},
{
    type: "choice",
    id: "midnight_reason_01",

    text:
        "眠れない理由を、聞いてもいいかい。",

    expression: "norimune_normal",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "考え事をしていた",

            pages: [
                {
                    text:
                        "そうかい。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "今夜のうちに答えを出さなくてもいい。\n" +
                        "朝の自分にも、少し任せておやり。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "なんとなく眠れない",

            pages: [
                {
                    text:
                        "理由のない夜もあるさ。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "なら、理由を探す代わりに僕と話していこう。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "則宗さんに会いたかった",

            pages: [
                {
                    text:
                        "こんな夜更けに、僕へ会いに？",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "うはは。\n" +
                        "それでは追い返すわけにもいかないねぇ。",
                    expression:
                        "norimune_tease"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "midnight_stay_01",

    text:
        "眠くなるまで、どう過ごそうか。",

    expression: "norimune_normal",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "話を聞きたい",

            pages: [
                {
                    text:
                        "昔話なら、いくらでもあるよ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "ただし、眠るどころか朝になるかもしれないねぇ。",
                    expression:
                        "norimune_tease"
                }
            ]
        },
        {
            text:
                "静かに一緒にいたい",

            pages: [
                {
                    text:
                        "うん。それもいい。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "言葉がなくても、同じ夜を過ごすことはできるからねぇ。",
                    expression:
                        "norimune_far"
                }
            ]
        },
        {
            text:
                "眠るように努力する",

            pages: [
                {
                    text:
                        "努力することではない気もするがねぇ。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "まあ、目を閉じるところから始めてみようか。",
                    expression:
                        "norimune_soft"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "midnight_patrol_01",

    text:
        "少し本丸を見て回るつもりだが、お前さんはどうする。",

    expression: "norimune_normal",

    tags: [
        "honmaru",
        "choice"
    ],

    choices: [
        {
            text:
                "一緒に行く",

            pages: [
                {
                    text:
                        "付き合ってくれるのかい。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "では、足音を立てないようにねぇ。\n" +
                        "皆を起こしたら、僕らが叱られてしまう。",
                    expression:
                        "norimune_tease"
                }
            ]
        },
        {
            text:
                "ここで待ってる",

            pages: [
                {
                    text:
                        "うん。すぐ戻るよ。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "眠くなったら、待たずに休んで構わないからねぇ。",
                    expression:
                        "norimune_soft"
                }
            ]
        },
        {
            text:
                "もう休む",

            pages: [
                {
                    text:
                        "それが一番いい。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "あとのことは、起きている刀に任せておきなさい。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "midnight_sword_01",

    text:
        "刀も夢を見ると思うかい。",

    expression: "norimune_think",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "見ると思う",

            pages: [
                {
                    text:
                        "そうかい。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "なら僕らが覚えている景色も、夢として残っているのかもしれないねぇ。",
                    expression:
                        "norimune_far"
                }
            ]
        },
        {
            text:
                "見ないと思う",

            pages: [
                {
                    text:
                        "それも道理だ。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "刀は、人の夢を傍らで見てきたものだからねぇ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "則宗さんは見るの？",

            pages: [
                {
                    text:
                        "僕かい。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "時々、随分と古い景色を見るよ。",
                    expression:
                        "norimune_far"
                },
                {
                    text:
                        "けれど目が覚めれば、主のいる本丸だ。\n" +
                        "今のところ、それで困ってはいないねぇ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ]
},
{
    type: "choice",
    id: "midnight_bed_01",

    text:
        "そろそろ休んだ方がいいと思うが、まだ帰りたくないのかい。",

    expression: "norimune_tease",

    tags: [
        "normal",
        "choice"
    ],

    choices: [
        {
            text:
                "もう少し一緒にいたい",

            pages: [
                {
                    text:
                        "……そうか。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "では、眠気が勝つまでここにいるといい。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "ひとりになるのが寂しい",

            pages: [
                {
                    text:
                        "それなら、今夜は急いで帰ることもないさ。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "朝までとは言わないが、眠くなるまでは隣にいよう。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "もう帰る",

            pages: [
                {
                    text:
                        "うん。良い判断だ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "廊下は暗いから、足元に気をつけるんだよ。",
                    expression:
                        "norimune_soft"
                }
            ]
        }
    ]
},
{
    pages: [
        {
            text:
                "夜明けを待ちながら、刀を抱えていた若者もいた。",
            expression: "norimune_far"
        },
        {
            text:
                "何を思っていたのかは、今となっては分からない。",
            expression: "norimune_think"
        },
        {
            text:
                "ただ、朝が来ることだけは皆に平等だったよ。",
            expression: "norimune_gentle"
        }
    ],
    tags: ["normal"]
},
{
    text:
        "京の夜は、静かに見えて案外騒がしかった。\n" +
        "若い刀も、若い剣士も、皆よく眠れずにいたものさ。",
    tags: ["normal"],
    expression: "norimune_far"
},
{
    pages: [
        {
            text:
                "天才と呼ばれる者ほど、夜は静かだったりする。",
            expression: "norimune_think"
        },
        {
            text:
                "……いや。\n" +
                "昔、そんな剣士がいたというだけの話さ。",
            expression: "norimune_closed"
        }
    ],
    tags: ["normal"]
},
{
    text:
        "こんな時間まで起きているのかい。||" +
        "うはは。気持ちは分からなくもないよ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_tease"
},
{
    text:
        "日付が変われば、また新しい一週間だ。||" +
        "だからといって、今すぐ立派にならなくてもいいからねぇ。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_gentle"
},
{
    text:
        "明日のことは、目が覚めてから考えよう。||" +
        "夜更けの頭へ任せるには、少し荷が重い。",
    tags: ["normal"],
    dayOfWeek: 0,
    expression: "norimune_soft"
},
{
    text:
        "日付が変わって、月曜日になったようだねぇ。||" +
        "まだ始まったばかりだ。今から構えなくてもいいよ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_gentle"
},
{
    text:
        "月曜日になったからといって、\n" +
        "夜更けのうちから働き始める必要はないからねぇ。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_tease"
},
{
    text:
        "新しい一週間は、眠っている間にも始められる。||" +
        "今は安心して、朝へ任せておきなさい。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_soft"
},
{
    text:
        "月曜日の最初にすることが夜更かしとはねぇ。||" +
        "うはは。まあ、始まり方は人それぞれか。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_closed"
},
{
    text:
        "一週間のことを、もう考えているのかい。||" +
        "まずは朝まで眠る。それが最初の予定でいいだろう。",
    tags: ["normal"],
    dayOfWeek: 1,
    expression: "norimune_gentle"
},
{
    text:
        "日付が変わって、火曜日になったようだ。||" +
        "まだ何も始まっていないうちから、急ぐことはないよ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_gentle"
},
{
    text:
        "火曜日の最初にしては、随分と夜更かしだねぇ。||" +
        "うはは。まあ、朝まではまだ少しある。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_tease"
},
{
    text:
        "新しい一日が始まったからといって、\n" +
        "すぐに何かを始めなくてもいいんだよ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_soft"
},
{
    text:
        "火曜日のことは、目が覚めてから考えればいい。||" +
        "今のところは、眠ることだけで充分さ。",
    tags: ["normal"],
    dayOfWeek: 2,
    expression: "norimune_gentle"
},
{
    type: "choice",
    id: "tuesday_midnight_01",

    text:
        "火曜日になったばかりだが、もう眠れそうかい。",

    expression: "norimune_normal",

    tags: [
        "normal",
        "choice"
    ],

    dayOfWeek: 2,

    choices: [
        {
            text:
                "眠れそう",

            pages: [
                {
                    text:
                        "それは何よりだ。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "では、火曜日の続きは朝にしよう。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "まだ眠れない",

            pages: [
                {
                    text:
                        "そうかい。",
                    expression:
                        "norimune_soft"
                },
                {
                    text:
                        "なら、眠りが来るまで少し話していようか。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },
        {
            text:
                "曜日を忘れていた",

            pages: [
                {
                    text:
                        "うはは。僕が教えてしまったねぇ。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "忘れていられたなら、その方が気楽だったかもしれない。",
                    expression:
                        "norimune_tease"
                }
            ]
        }
    ]
},
{
    text:
        "日付が変わって、水曜日になったようだ。||" +
        "真ん中の日も、静かに始まったねぇ。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_far"
},
{
    text:
        "まだ水曜日になったばかりだ。||" +
        "折り返しは、朝になってから考えよう。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_tease"
},
{
    text:
        "真夜中に週の真ん中を迎えるというのも、不思議な気分だねぇ。",
    tags: ["normal"],
    dayOfWeek: 3,
    expression: "norimune_closed"
},
{
    text:
        "日付が変わって、木曜日になったようだ。||" +
        "静かな始まりというのも、悪くないねぇ。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_far"
},
{
    text:
        "木曜日になったばかりだ。||" +
        "あと少しなんて考えるのは、朝になってからでいい。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_tease"
},
{
    text:
        "木曜日の最初にすることが夜更かしとは。||" +
        "うはは。まずは眠ることから始めようか。",
    tags: ["normal"],
    dayOfWeek: 4,
    expression: "norimune_closed"
},
{
    text:
        "日付が変わって、金曜日になったようだ。||" +
        "まずは静かに始めようじゃないか。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_far"
},
{
    text:
        "金曜日になったばかりだ。||" +
        "あと少しなんて考えるには、まだ早いねぇ。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_tease"
},
{
    text:
        "金曜日の最初の予定は、まず眠ること。||" +
        "それくらいでちょうどいい。",
    tags: ["normal"],
    dayOfWeek: 5,
    expression: "norimune_gentle"
},
     /*
    　* ↑深夜の話ここまで↑
    　* ↓訪問回数条件会話↓
    　*/
            
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
     * 選択肢を選んだ直後の返答。
     *
     * 選択肢のコールバック内で直接文章を追加すると、
     * ツクール本体のメッセージ終了処理に消されるため、
     * 一度ここへ預けてから表示する。
     */
    let pendingChoiceResponse = null;

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
    const currentHour =
        new Date().getHours();

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

    if (
        condition.hour !== undefined &&
        !conditionIncludes(
            condition.hour,
            currentHour
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
    const currentHour =
        new Date().getHours();    

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
    if (
        talk.hour !== undefined &&
        !conditionIncludes(
            talk.hour,
            currentHour
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
    const timeZone =
        getTimeZone();

    const talks =
        TIME_TALK_DATA[timeZone];

    if (!talks) {
        return;
    }

    talks.forEach((talk, index) => {
        /*
         * 時間帯配列の会話にも、
         *
         * season
         * time
         * month
         * date
         * dayOfWeek
         * excludeConditions
         *
         * を適用する。
         */
        if (!isLegacyTalkAvailable(talk)) {
            return;
        }

        candidates.push({
            key:
                `time:${timeZone}:${index}`,

            source:
                "time",

            category:
                timeZone,

            index:
                index,

            talk:
                talk,

            tags:
                makeTalkTags(
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
        candidate => {

            /*
             * 本丸会話は
             * 季節コマンドでは除外。
             */
            if (
                hasTag(
                    candidate,
                    "honmaru"
                )
            ) {
                return false;
            }

            return (
                hasTag(
                    candidate,
                    "season"
                ) ||
                hasTag(
                    candidate,
                    getSeason()
                )
            );
        }
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

    /*
     * 時間帯会話も全部追加。
     */
    addTimeCandidates(
        candidates
    );

    /*
     * 条件付き会話
     */
    addConditionalCandidates(
        candidates
    );

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
     * JS内選択肢会話
     * ─────────────────────────────
     */

    function normalizeChoiceResponse(choice) {
        if (!choice) {
            return null;
        }

        /*
         * response: [
         *     { text: "...", expression: "..." }
         * ]
         *
         * の形式。
         */
        if (choice.response) {
            if (Array.isArray(choice.response)) {
                return {
                    pages: choice.response
                };
            }

            /*
             * response: {
             *     text: "...",
             *     expression: "..."
             * }
             *
             * の形式。
             */
            if (
                typeof choice.response ===
                "object"
            ) {
                return choice.response;
            }

            /*
             * response: "返答"
             *
             * の簡易形式。
             */
            return {
                text:
                    String(choice.response),

                expression:
                    choice.expression || ""
            };
        }

        /*
         * choices内に直接pagesを書く形式。
         */
        if (
            Array.isArray(choice.pages) &&
            choice.pages.length > 0
        ) {
            return {
                pages: choice.pages
            };
        }

        /*
         * reply: "返答"
         *
         * の簡易形式。
         */
        if (
            choice.reply !== undefined
        ) {
            return {
                text:
                    String(choice.reply),

                expression:
                    choice.expression || ""
            };
        }

        return null;
    }

    function enqueueChoiceTalk(talk) {
        const choices =
            Array.isArray(talk.choices)
                ? talk.choices
                : [];

        if (choices.length === 0) {
            console.warn(
                `[${pluginName}] 選択肢がありません。`,
                talk
            );

            enqueueTalkMessage(talk);
            requestExpressionReset();

            return;
        }

        /*
         * 選択肢を出す前の則宗さんの台詞。
         */
        if (
            talk.text ||
            (
                Array.isArray(talk.pages) &&
                talk.pages.length > 0
            )
        ) {
            enqueueTalkMessage(talk);
        } else if (talk.expression) {
            showExpression(
                talk.expression
            );
        }

        /*
         * labelがある場合はlabelを優先。
         *
         * labelがなければtextを
         * 選択肢の表示名として使う。
         */
        const choiceTexts =
            choices.map(choice =>
                String(
                    choice.label ??
                    choice.text ??
                    "……"
                )
            );

        /*
         * 最初に選択状態になる項目。
         *
         * 0 = 一番上
         * 1 = 二番目
         */
        const defaultType =
            Number.isFinite(
                Number(
                    talk.defaultChoice
                )
            )
                ? Number(
                    talk.defaultChoice
                )
                : 0;

        /*
         * キャンセル時の処理。
         *
         * -1 = キャンセル不可
         *  0 = 一番上を選んだ扱い
         *  1 = 二番目を選んだ扱い
         */
        const cancelType =
            Number.isFinite(
                Number(
                    talk.cancelChoice
                )
            )
                ? Number(
                    talk.cancelChoice
                )
                : -1;

        /*
         * 選択肢ウィンドウの位置。
         *
         * 0 = 左
         * 1 = 中央
         * 2 = 右
         */
        const positionType =
            Number.isFinite(
                Number(
                    talk.choicePosition
                )
            )
                ? Number(
                    talk.choicePosition
                )
                : 2;

        /*
         * 選択肢ウィンドウの背景。
         *
         * 0 = 通常
         * 1 = 暗くする
         * 2 = 透明
         */
        const background =
            Number.isFinite(
                Number(
                    talk.choiceBackground
                )
            )
                ? Number(
                    talk.choiceBackground
                )
                : 0;

        $gameMessage.setChoices(
            choiceTexts,
            defaultType,
            cancelType
        );

        $gameMessage
            .setChoicePositionType(
                positionType
            );

        $gameMessage
            .setChoiceBackground(
                background
            );

        $gameMessage.setChoiceCallback(
            selectedIndex => {
                const selectedChoice =
                    choices[selectedIndex];

                const response =
                    normalizeChoiceResponse(
                        selectedChoice
                    );

                /*
                 * ここではまだ表示しない。
                 *
                 * この直後にツクール側が
                 * 選択肢用メッセージを消去するため、
                 * 返答を一度保留しておく。
                 */
                pendingChoiceResponse =
                    response || null;
            }
        );
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
/*
 * 低確率で選択肢会話を優先する。
 */
const choiceCandidates =
    candidates.filter(
        candidate =>
            candidate.talk &&
            candidate.talk.type ===
                "choice"
    );

if (
    choiceCandidates.length > 0 &&
    Math.random() <
        CHOICE_TALK_RATE
) {
    const selectedChoice =
        choiceCandidates[
            Math.floor(
                Math.random() *
                choiceCandidates.length
            )
        ];

    enqueueChoiceTalk(
        selectedChoice.talk
    );

    rememberCandidate(
        selectedChoice
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

        if (type === "choice") {
            enqueueChoiceTalk(talk);
            return;
        }
        
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

            /*
             * 選択肢が完全に閉じたあとで、
             * 保留していた則宗さんの返答を表示する。
             */
            if (
                pendingChoiceResponse &&
                !$gameMessage.isBusy()
            ) {
                const response =
                    pendingChoiceResponse;

                /*
                 * 二重表示を防ぐため、
                 * 先に保留を解除する。
                 */
                pendingChoiceResponse = null;

                enqueueTalkMessage(
                    response
                );

                requestExpressionReset();

                return;
            }

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