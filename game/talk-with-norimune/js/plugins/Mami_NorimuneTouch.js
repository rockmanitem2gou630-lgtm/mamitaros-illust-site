/*:
 * @target MZ
 * @plugindesc 則宗さん立ち絵・部位別タップ会話 Ver2.0
 * @author マミタロス
 *
 * @param PictureId
 * @text 立ち絵ピクチャ番号
 * @type number
 * @min 1
 * @default 2
 *
 * @param MaskImage
 * @text 部位判定マスク画像
 * @type file
 * @dir img/pictures
 * @default norimune_touch_mask
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
 * @desc 部位ごとに、直近何件の会話を抽選候補から外すか設定します。
 * @type number
 * @min 0
 * @default 3
 *
 * @param ColorTolerance
 * @text 色判定の許容値
 * @desc マスク画像の色ずれをどこまで許容するか。
 * @type number
 * @min 0
 * @max 100
 * @default 10
 *
 * @param CooldownFrames
 * @text 連続タップ防止時間
 * @desc 反応後、次にタップできるまでのフレーム数です。
 * @type number
 * @min 0
 * @default 15
 *
 * @command EnableTouch
 * @text タップ反応を有効化
 *
 * @command DisableTouch
 * @text タップ反応を無効化
 *
 * @help
 * ピクチャ番号2番などで表示された則宗さんを、
 * 部位ごとにタップできるようにします。
 *
 * 会話はこのJS内の TOUCH_TALK_DATA に記述します。
 *
 * 対応形式：
 *
 * {
 *     text: "台詞",
 *     expression: "norimune_smile"
 * }
 *
 * {
 *     text: "一頁目||二頁目",
 *     expression: "norimune_smile"
 * }
 *
 * {
 *     pages: [
 *         {
 *             text: "一頁目",
 *             expression: "norimune_normal"
 *         },
 *         {
 *             text: "二頁目",
 *             expression: "norimune_smile"
 *         }
 *     ]
 * }
 *
 * 時間帯指定：
 *
 * time: "morning"
 *
 * time: ["night", "midnight"]
 *
 * 使用できる時間帯：
 * morning / day / evening / night / midnight
 *
 * 季節指定：
 *
 * season: "spring"
 *
 * season: ["autumn", "winter"]
 *
 * 使用できる季節：
 * spring / summer / autumn / winter
 *
 * timeとseasonを両方書いた場合は、
 * 両方の条件を満たす時だけ候補になります。
 *
 * マスク画像の色：
 *
 * 赤     #FF0000　頭・髪
 * 緑     #00FF00　顔
 * 青     #0000FF　扇子
 * 黄     #FFFF00　手
 * 紫     #FF00FF　胸元・胴
 * 水色   #00FFFF　袖・羽織
 * 白     #FFFFFF　その他
 * 透明              無反応
 *
 * Mami_NorimuneTalk.jsより下に配置してください。
 *
 * @requiredAssets img/pictures/norimune_touch_mask
 */

(() => {
    "use strict";

    const pluginName = "Mami_NorimuneTouch";
    const params = PluginManager.parameters(pluginName);

    const pictureId =
        Number(params.PictureId || 2);

    const maskImage =
        String(
            params.MaskImage ||
            "norimune_touch_mask"
        );

    const defaultExpression =
        String(
            params.DefaultExpression ||
            "norimune_normal"
        );

    const resetDelayFrames =
        Math.max(
            0,
            Number(params.ResetDelay || 15)
        );

    const historyCount =
        Math.max(
            0,
            Number(params.HistoryCount || 3)
        );

    const colorTolerance =
        Math.max(
            0,
            Number(params.ColorTolerance || 10)
        );

    const cooldownFrames =
        Math.max(
            0,
            Number(params.CooldownFrames || 15)
        );

    /*
     * ─────────────────────────────
     * 部位別タップ会話
     * ─────────────────────────────
     *
     * head   ：頭・髪
     * face   ：顔
     * fan    ：扇子
     * hand   ：手
     * body   ：胸元・胴
     * sleeve ：袖・羽織
     * other  ：その他
     *
     * この中へ会話を追加していきます。
     */

    const TOUCH_TALK_DATA = {
        head: [
            {
                text:
                    "おや。\n" +
                    "撫でてくれるのかい。",
                expression:
                    "norimune_smile"
            },
            {
                text:
                    "うはは。\n" +
                    "子ども扱いされる歳でもないのだけれどねぇ。",
                expression:
                    "norimune_closed"
            },
            {
                text:
                    "朝からずいぶん甘えたがりだねぇ。",
                time:
                    "morning",
                expression:
                    "norimune_tease"
            },      
{
    pages: [
        {
            text:
                "……そこまで丁寧に撫でられると、",
            expression:
                "norimune_surprised"
        },
        {
            text:
                "年寄りでも、少し照れてしまうよ。",
            expression:
                "norimune_gentle"
        }
    ]
},
{
    text:
        "髪が気になるのかい。||" +
        "乱れているなら、あとで直しておこう。",
    expression:
        "norimune_normal"
},
{
    text:
        "そんなに撫でなくても、\n" +
        "僕は逃げたりしないさ。",
    expression:
        "norimune_tease"
},
{
    text:
        "子どもをあやすような手つきだねぇ。||" +
        "まあ、悪い気はしないけれど。",
    expression:
        "norimune_closed"
},
{
    pages: [
        {
            text:
                "お前さんは、こういう時だけ大胆だ。",
            expression:
                "norimune_tease"
        },
        {
            text:
                "うはは。\n" +
                "覚えておくよ。",
            expression:
                "norimune_closed"
        }
    ]
},
{
    text:
        "撫でられる側というのも、\n" +
        "案外落ち着くものだねぇ。",
    expression:
        "norimune_soft"
},
{
    text:
        "今日は甘えたい気分なのかな。",
    expression:
        "norimune_gentle"
},
{
    text:
        "何も言わずに触れてくるとは、\n" +
        "お前さんも随分慣れたものだ。",
    expression:
        "norimune_tease"
},
{
    pages: [
        {
            text:
                "もう少し、こうしていたい？",
            expression:
                "norimune_normal"
        },
        {
            text:
                "……そうか。",
            expression:
                "norimune_surprised"
        },
        {
            text:
                "なら、好きにするといい。",
            expression:
                "norimune_gentle"
        }
    ]
},
{
    text:
        "僕の髪は、そんなに触り心地がいいのかい。",
    expression:
        "norimune_smile"
},
{
    text:
        "うはは。\n" +
        "撫でる方が満足そうな顔をしているねぇ。",
    expression:
        "norimune_closed"
},
{
    text:
        "あまり続けると、\n" +
        "次から僕の方から催促してしまうかもしれないよ。",
    expression:
        "norimune_tease"
},
{
    text:
        "触れ方に、その日の気分が出るものだねぇ。",
    expression:
        "norimune_think"
},
{
    pages: [
        {
            text:
                "今日は、少し手が優しい。",
            expression:
                "norimune_soft"
        },
        {
            text:
                "何かあったのかい。",
            expression:
                "norimune_gentle"
        }
    ]
},
{
    text:
        "朝から僕を撫でに来るとは、\n" +
        "随分と余裕があるねぇ。",
    time:
        "morning",
    expression:
        "norimune_tease"
},
{
    text:
        "朝の髪は、少し言うことを聞かなくてねぇ。",
    time:
        "morning",
    expression:
        "norimune_troubled"
},
{
    pages: [
        {
            text:
                "おはよう、お前さん。",
            expression:
                "norimune_smile"
        },
        {
            text:
                "挨拶の代わりに撫でていくとは、\n" +
                "お前さんらしいねぇ。",
            expression:
                "norimune_closed"
        }
    ],
    time:
        "morning"
},
{
    text:
        "昼間から年寄りを構って、\n" +
        "他にすることはないのかい。",
    time:
        "day",
    expression:
        "norimune_tease"
},
{
    text:
        "昼下がりに撫でられると、\n" +
        "眠くなってしまいそうだ。",
    time:
        "day",
    expression:
        "norimune_soft"
},
{
    pages: [
        {
            text:
                "手が止まったねぇ。",
            expression:
                "norimune_normal"
        },
        {
            text:
                "もう終わりかい。",
            expression:
                "norimune_tease"
        }
    ],
    time:
        "day"
},
{
    text:
        "夕暮れ時というのは、\n" +
        "人を少し素直にするらしい。",
    time:
        "evening",
    expression:
        "norimune_far"
},
{
    text:
        "日が落ちる前に、\n" +
        "ひと撫でしておこうということかな。",
    time:
        "evening",
    expression:
        "norimune_closed"
},
{
    pages: [
        {
            text:
                "夕方の風で、少し髪が乱れたか。",
            expression:
                "norimune_think"
        },
        {
            text:
                "直してくれるなら、任せよう。",
            expression:
                "norimune_gentle"
        }
    ],
    time:
        "evening"
},
{
    text:
        "夜になると、少し甘えたくなるのかい。",
    time:
        "night",
    expression:
        "norimune_tease"
},
{
    pages: [
        {
            text:
                "……夜は静かだねぇ。",
            expression:
                "norimune_far"
        },
        {
            text:
                "こうして触れられる音まで、\n" +
                "よく分かる。",
            expression:
                "norimune_gentle"
        }
    ],
    time:
        "night"
},
{
    text:
        "もう遅い時間だ。\n" +
        "撫で終えたら、少し休みなさい。",
    time:
        "night",
    expression:
        "norimune_soft"
},
{
    text:
        "こんな夜更けに、\n" +
        "僕の頭を撫でに来たのかい。",
    time:
        "midnight",
    expression:
        "norimune_surprised"
},
{
    pages: [
        {
            text:
                "眠れないのかな。",
            expression:
                "norimune_soft"
        },
        {
            text:
                "なら、しばらくこのままでいよう。",
            expression:
                "norimune_gentle"
        }
    ],
    time:
        "midnight"
},
{
    text:
        "深夜は、人の手も少し寂しがりになるらしいねぇ。",
    time:
        "midnight",
    expression:
        "norimune_far"
},
            {
                pages: [
                    {
                        text:
                            "……お前さん。",
                        expression:
                            "norimune_surprised"
                    },
                    {
                        text:
                            "こんな夜更けに撫でられるとは、\n" +
                            "思っていなかったよ。",
                        expression:
                            "norimune_gentle"
                    }
                ],
                time: [
                    "night",
                    "midnight"
                ]
            },
            {
                text:
                    "夏は髪に触れる方も暑かろう。||" +
                    "それでも続けるのかい。",
                season:
                    "summer",
                expression:
                    "norimune_tease"
            }
        ],

        face: [
            {
                text:
                    "……ずいぶん近いねぇ。",
                expression:
                    "norimune_surprised"
            },
            {
                pages: [
                    {
                        text:
                            "僕の顔に、何かついているのかい。",
                        expression:
                            "norimune_normal"
                    },
                    {
                        text:
                            "それとも、ただ触れてみたかっただけかな。",
                        expression:
                            "norimune_tease"
                    }
                ]
            },
            {
    text:
        "おや。\n" +
        "そんなところへ触れるとは、随分近いねぇ。",
    expression:
        "norimune_surprised"
},
{
    text:
        "僕の顔に、何か気になるものでもあったかい。",
    expression:
        "norimune_normal"
},
{
    pages: [
        {
            text:
                "……じっと見た上で、",
            expression:
                "norimune_think"
        },
        {
            text:
                "今度は触れて確かめるのかい。",
            expression:
                "norimune_tease"
        }
    ]
},
{
    text:
        "うはは。\n" +
        "触れる方が、少し緊張しているように見えるよ。",
    expression:
        "norimune_closed"
},
{
    text:
        "頬というものは、\n" +
        "触れられると案外くすぐったいねぇ。",
    expression:
        "norimune_smile"
},
{
    text:
        "そんなに近くで見なくても、\n" +
        "僕は急に消えたりしないさ。",
    expression:
        "norimune_gentle"
},
{
    pages: [
        {
            text:
                "何か言いたそうな顔だねぇ。",
            expression:
                "norimune_normal"
        },
        {
            text:
                "触れるだけで伝わると思ったのかい。",
            expression:
                "norimune_tease"
        }
    ]
},
{
    text:
        "随分と遠慮がなくなったものだ。||" +
        "まあ、嫌だとは言っていないけれどねぇ。",
    expression:
        "norimune_closed"
},
{
    text:
        "目元が気になるのかい。\n" +
        "年寄りの皺でも数えているのかな。",
    expression:
        "norimune_tease"
},
{
    text:
        "あまり顔ばかり触れられると、\n" +
        "僕もお前さんの顔を見たくなるねぇ。",
    expression:
        "norimune_gentle"
},
{
    pages: [
        {
            text:
                "……そこまで近づかれると、",
            expression:
                "norimune_surprised"
        },
        {
            text:
                "さすがの僕も、少し困るよ。",
            expression:
                "norimune_troubled"
        },
        {
            text:
                "少しだけ、だけれどねぇ。",
            expression:
                "norimune_tease"
        }
    ]
},
{
    text:
        "今日は、随分優しい触れ方をする。",
    expression:
        "norimune_soft"
},
{
    pages: [
        {
            text:
                "お前さんの手は、正直だねぇ。",
            expression:
                "norimune_think"
        },
        {
            text:
                "言葉より先に、気持ちが出ている。",
            expression:
                "norimune_gentle"
        }
    ]
},
{
    text:
        "そんなに見つめられては、\n" +
        "こちらも見つめ返したくなるよ。",
    expression:
        "norimune_tease"
},
{
    text:
        "うはは。\n" +
        "触れた後で照れるくらいなら、最初からしなければいいものを。",
    expression:
        "norimune_closed"
},
{
    pages: [
        {
            text:
                "頬に触れるというのは、",
            expression:
                "norimune_far"
        },
        {
            text:
                "随分と親しい者のすることだねぇ。",
            expression:
                "norimune_gentle"
        }
    ]
},
{
    text:
        "朝から顔を確かめに来たのかい。\n" +
        "ちゃんといつもの僕だよ。",
    time:
        "morning",
    expression:
        "norimune_smile"
},
{
    text:
        "朝はまだ、少し顔が眠そうに見えるかもしれないねぇ。",
    time:
        "morning",
    expression:
        "norimune_troubled"
},
{
    pages: [
        {
            text:
                "おはよう、お前さん。",
            expression:
                "norimune_smile"
        },
        {
            text:
                "挨拶より先に頬へ触れるとは、\n" +
                "変わった朝の作法だねぇ。",
            expression:
                "norimune_tease"
        }
    ],
    time:
        "morning"
},
{
    text:
        "昼間からそんなに近くへ来て、\n" +
        "随分と暇そうだねぇ。",
    time:
        "day",
    expression:
        "norimune_tease"
},
{
    text:
        "陽の下では、顔の細かなところまでよく見える。||" +
        "あまり観察しないでおくれ。",
    time:
        "day",
    expression:
        "norimune_troubled"
},
{
    pages: [
        {
            text:
                "昼下がりというのは、",
            expression:
                "norimune_far"
        },
        {
            text:
                "こうしてのんびり触れられるくらいが、ちょうどいいねぇ。",
            expression:
                "norimune_soft"
        }
    ],
    time:
        "day"
},
{
    text:
        "夕暮れの色が、僕の顔にも映っているのかい。",
    time:
        "evening",
    expression:
        "norimune_far"
},
{
    pages: [
        {
            text:
                "夕方は、ものの輪郭が柔らかく見える。",
            expression:
                "norimune_far"
        },
        {
            text:
                "お前さんまで、少し優しい顔をしているねぇ。",
            expression:
                "norimune_gentle"
        }
    ],
    time:
        "evening"
},
{
    text:
        "日が落ちる前に、顔を見ておきたかったのかな。",
    time:
        "evening",
    expression:
        "norimune_tease"
},
{
    text:
        "夜は暗いからねぇ。\n" +
        "触れて確かめたくなったのかい。",
    time:
        "night",
    expression:
        "norimune_tease"
},
{
    pages: [
        {
            text:
                "……夜にこれほど近づかれると、",
            expression:
                "norimune_surprised"
        },
        {
            text:
                "昼間とは少し違って感じるものだねぇ。",
            expression:
                "norimune_gentle"
        }
    ],
    time:
        "night"
},
{
    text:
        "静かな夜だ。\n" +
        "お前さんの指先まで、よく分かるよ。",
    time:
        "night",
    expression:
        "norimune_soft"
},
{
    text:
        "こんな夜更けに、僕の顔を見に来たのかい。",
    time:
        "midnight",
    expression:
        "norimune_surprised"
},
{
    pages: [
        {
            text:
                "眠れない顔をしているねぇ。",
            expression:
                "norimune_soft"
        },
        {
            text:
                "僕に触れて、少し落ち着いたかい。",
            expression:
                "norimune_gentle"
        }
    ],
    time:
        "midnight"
},
{
    text:
        "深夜は、距離の取り方まで曖昧になるらしい。||" +
        "……悪いことではないけれどねぇ。",
    time:
        "midnight",
    expression:
        "norimune_far"
},
            {
                text:
                    "夜目にも、僕の顔はよく見えるらしい。",
                time: [
                    "night",
                    "midnight"
                ],
                expression:
                    "norimune_closed"
            },
            {
                text:
                    "手が冷たいねぇ。\n" +
                    "外は随分寒かったのかい。",
                season:
                    "winter",
                expression:
                    "norimune_soft"
            }
        ],

        fan: [
            {
                text:
                    "これが気になるのかい。",
                expression:
                    "norimune_fan"
            },
            {
                text:
                    "扇子を取られてしまうと、\n" +
                    "少し落ち着かないねぇ。",
                expression:
                    "norimune_troubled"
            },
            {
                pages: [
                    {
                        text:
                            "ほれほれ。",
                        expression:
                            "norimune_fan"
                    },
                    {
                        text:
                            "扇子ばかり見ていないで、\n" +
                            "僕の方も見ておくれ。",
                        expression:
                            "norimune_tease"
                    }
                ]
            },
            {
                text:
                    "夏場は、これがなかなか手放せなくてねぇ。",
                season:
                    "summer",
                expression:
                    "norimune_closed"
            },
            {
    text:
        "おや。\n" +
        "これが気になるのかい。",
    expression:
        "norimune_fan"
},
{
    text:
        "随分と扇子がお気に入りだねぇ。||" +
        "僕ではなく、こちらに話しかけているのかな。",
    expression:
        "norimune_tease"
},
{
    text:
        "取り上げても構わないが、\n" +
        "代わりに何か貸しておくれ。",
    expression:
        "norimune_smile"
},
{
    pages: [
        {
            text:
                "ほれ。",
            expression:
                "norimune_fan"
        },
        {
            text:
                "そんなに見たいなら、\n" +
                "少しだけ貸してあげよう。",
            expression:
                "norimune_gentle"
        }
    ]
},
{
    text:
        "扇子というものは便利でねぇ。||" +
        "涼むだけじゃなく、色々隠せる。",
    expression:
        "norimune_closed"
},
{
    text:
        "うはは。\n" +
        "今日は随分、扇子に興味津々だ。",
    expression:
        "norimune_closed"
},
{
    pages: [
        {
            text:
                "扇子ばかり見ていると、",
            expression:
                "norimune_tease"
        },
        {
            text:
                "少し妬いてしまうかもしれないねぇ。",
            expression:
                "norimune_smile"
        }
    ]
},
{
    text:
        "この扇子も、長い付き合いでねぇ。||" +
        "僕の癖まで覚えてしまったかもしれない。",
    expression:
        "norimune_far"
},
{
    text:
        "扇子を持っていると、\n" +
        "つい手遊びしてしまうものなんだ。",
    expression:
        "norimune_think"
},
{
    text:
        "閉じたり開いたり。\n" +
        "年寄りは手が暇だと、何かしたくなるものでねぇ。",
    expression:
        "norimune_closed"
},
{
    pages: [
        {
            text:
                "……取るのかい。",
            expression:
                "norimune_surprised"
        },
        {
            text:
                "返してもらえないと、少し困るよ。",
            expression:
                "norimune_troubled"
        }
    ]
},
{
    text:
        "そのうち、お前さん専用の扇子でも用意しようか。",
    expression:
        "norimune_smile"
},
{
    text:
        "僕より扇子の方が触られている気がするねぇ。",
    expression:
        "norimune_tease"
},
{
    pages: [
        {
            text:
                "隠れている方が気になる？",
            expression:
                "norimune_fan"
        },
        {
            text:
                "人というのは、不思議なものだねぇ。",
            expression:
                "norimune_think"
        }
    ]
},
{
    text:
        "今日は風が気持ちいい。\n" +
        "扇子も少し働きがいがありそうだ。",
    time:
        "morning",
    expression:
        "norimune_fan"
},
{
    text:
        "朝から扇子を奪われるとは思わなかったよ。",
    time:
        "morning",
    expression:
        "norimune_tease"
},
{
    text:
        "昼はどうしても扇子の出番が増えるねぇ。",
    time:
        "day",
    expression:
        "norimune_fan"
},
{
    pages: [
        {
            text:
                "今日は暑いねぇ。",
            expression:
                "norimune_closed"
        },
        {
            text:
                "ほら、お前さんにも少し風を分けてあげよう。",
            expression:
                "norimune_gentle"
        }
    ],
    time:
        "day"
},
{
    text:
        "夕方になると、扇ぐ必要も少なくなる。",
    time:
        "evening",
    expression:
        "norimune_far"
},
{
    text:
        "夕風は、扇子よりよく働いてくれるねぇ。",
    time:
        "evening",
    expression:
        "norimune_soft"
},
{
    pages: [
        {
            text:
                "夜風というのは、",
            expression:
                "norimune_far"
        },
        {
            text:
                "扇子では真似できない心地よさがある。",
            expression:
                "norimune_gentle"
        }
    ],
    time:
        "night"
},
{
    text:
        "夜くらいは、扇子にも休んでもらおうか。",
    time:
        "night",
    expression:
        "norimune_closed"
},
{
    text:
        "こんな夜更けまで、\n" +
        "扇子を構う者がいるとはねぇ。",
    time:
        "midnight",
    expression:
        "norimune_surprised"
},
{
    pages: [
        {
            text:
                "眠れないのかな。",
            expression:
                "norimune_soft"
        },
        {
            text:
                "では、この扇子で少し涼しい夢でも送ろうか。",
            expression:
                "norimune_gentle"
        }
    ],
    time:
        "midnight"
},
{
    text:
        "夜更けは、扇子を動かす音までよく響く。",
    time:
        "midnight",
    expression:
        "norimune_far"
},
        ],

        hand: [
            {
                text:
                    "手を取りたいのかい。",
                expression:
                    "norimune_gentle"
            },
            {
                pages: [
                    {
                        text:
                            "おや。",
                        expression:
                            "norimune_surprised"
                    },
                    {
                        text:
                            "随分と自然に触れてくるようになったねぇ。",
                        expression:
                            "norimune_tease"
                    }
                ]
            },
            {
                text:
                    "冷えているね。\n" +
                    "少し、このままでいようか。",
                season:
                    "winter",
                expression:
                    "norimune_soft"
            },
            {
                text:
                    "眠れない時は、誰かの手があるだけでも違うものさ。",
                time:
                    "midnight",
                expression:
                    "norimune_gentle"
            },
            {
    text:
        "おや。\n" +
        "手に触れるとは、礼儀正しいねぇ。",
    expression:
        "norimune_smile"
},
{
    text:
        "僕の手に何か付いていたかい。",
    expression:
        "norimune_normal"
},
{
    text:
        "うはは。\n" +
        "そんなに確かめなくても、本物だよ。",
    expression:
        "norimune_closed"
},
{
    pages: [
        {
            text:
                "お前さんの手は、",
            expression:
                "norimune_think"
        },
        {
            text:
                "思っていたより温かいねぇ。",
            expression:
                "norimune_gentle"
        }
    ]
},
{
    text:
        "握手でもしたい気分だったのかな。",
    expression:
        "norimune_tease"
},
{
    text:
        "今日は随分、人懐っこいねぇ。",
    expression:
        "norimune_smile"
},
{
    text:
        "手というのは、不思議なものだ。||" +
        "言葉より先に気持ちが伝わることがある。",
    expression:
        "norimune_far"
},
{
    pages: [
        {
            text:
                "遠慮がなくなったというべきか、",
            expression:
                "norimune_tease"
        },
        {
            text:
                "慣れてくれたというべきか。",
            expression:
                "norimune_closed"
        }
    ]
},
{
    text:
        "ちゃんとここにいるよ。||" +
        "確かめに来たのかい。",
    expression:
        "norimune_gentle"
},
{
    text:
        "あまりつつくと、くすぐったいねぇ。",
    expression:
        "norimune_troubled"
},
{
    text:
        "朝から元気だねぇ。||" +
        "こちらまで目が覚めそうだ。",
    time:
        "morning",
    expression:
        "norimune_smile"
},
{
    pages: [
        {
            text:
                "おはよう。",
            expression:
                "norimune_smile"
        },
        {
            text:
                "今日もよろしく頼むよ。",
            expression:
                "norimune_gentle"
        }
    ],
    time:
        "morning"
},
{
    text:
        "昼間は皆忙しい時間だ。||" +
        "こうして一息つくのも悪くない。",
    time:
        "day",
    expression:
        "norimune_far"
},
{
    text:
        "日差しで少し手が温まっているねぇ。",
    time:
        "day",
    expression:
        "norimune_think"
},
{
    text:
        "夕方になると、少し疲れも出てくる頃かな。",
    time:
        "evening",
    expression:
        "norimune_soft"
},
{
    pages: [
        {
            text:
                "今日も一日お疲れさま。",
            expression:
                "norimune_soft"
        },
        {
            text:
                "休める時には、ちゃんと休むんだよ。",
            expression:
                "norimune_gentle"
        }
    ],
    time:
        "evening"
},
{
    text:
        "夜になると、人恋しくなるものだねぇ。",
    time:
        "night",
    expression:
        "norimune_far"
},
{
    text:
        "眠る前に顔を見に来てくれたのかな。",
    time:
        "night",
    expression:
        "norimune_gentle"
},
{
    pages: [
        {
            text:
                "こんな時間まで起きているとは。",
            expression:
                "norimune_troubled"
        },
        {
            text:
                "明日に響かないようにねぇ。",
            expression:
                "norimune_soft"
        }
    ],
    time:
        "midnight"
},
{
    text:
        "夜更かし仲間が増えてしまったねぇ。",
    time:
        "midnight",
    expression:
        "norimune_closed"
},
        ],

        body: [
            {
                text:
                    "おやおや。\n" +
                    "そこへ触れるとは大胆だねぇ。",
                expression:
                    "norimune_tease"
            },
            {
                text:
                    "何か気になるところでもあったかい。",
                expression:
                    "norimune_normal"
            },
            {
                pages: [
                    {
                        text:
                            "……お前さん。",
                        expression:
                            "norimune_surprised"
                    },
                    {
                        text:
                            "あまり年寄りを驚かせるものではないよ。",
                        expression:
                            "norimune_troubled"
                    }
                ]
            },
            {
    text:
        "おや。\n" +
        "随分近くまで来たねぇ。",
    expression:
        "norimune_surprised"
},
{
    text:
        "何か探し物でもしているのかい。",
    expression:
        "norimune_normal"
},
{
    text:
        "うはは。\n" +
        "そんなところをつついても、面白いものは出てこないよ。",
    expression:
        "norimune_closed"
},
{
    pages: [
        {
            text:
                "うん？",
            expression:
                "norimune_normal"
        },
        {
            text:
                "僕ではなく、布と話しているようなものだねぇ。",
            expression:
                "norimune_tease"
        }
    ]
},
{
    text:
        "今日は距離が近いねぇ。",
    expression:
        "norimune_gentle"
},
{
    text:
        "そこまで近づかれるとは思わなかったよ。",
    expression:
        "norimune_surprised"
},
{
    text:
        "僕が逃げるか試しているのかな。",
    expression:
        "norimune_tease"
},
{
    pages: [
        {
            text:
                "さて。",
            expression:
                "norimune_think"
        },
        {
            text:
                "触れて満足したかい。",
            expression:
                "norimune_closed"
        }
    ]
},
{
    text:
        "何か言いたそうな顔をしているねぇ。",
    expression:
        "norimune_far"
},
{
    text:
        "こうして立っているだけでも、案外退屈はしないものだ。",
    expression:
        "norimune_soft"
},
{
    text:
        "朝から元気だねぇ。||" +
        "今日も良い一日になりそうだ。",
    time:
        "morning",
    expression:
        "norimune_smile"
},
{
    text:
        "昼は人の出入りも多い時間だ。||" +
        "賑やかなのは嫌いじゃないよ。",
    time:
        "day",
    expression:
        "norimune_far"
},
{
    pages: [
        {
            text:
                "日が傾いてきたねぇ。",
            expression:
                "norimune_far"
        },
        {
            text:
                "少し肩の力を抜く頃合いかな。",
            expression:
                "norimune_soft"
        }
    ],
    time:
        "evening"
},
{
    text:
        "夜は静かでいい。||" +
        "話し相手がいるとなおさらねぇ。",
    time:
        "night",
    expression:
        "norimune_gentle"
},
{
    pages: [
        {
            text:
                "こんな時間まで起きているとは。",
            expression:
                "norimune_troubled"
        },
        {
            text:
                "眠くなったら無理はしないことだ。",
            expression:
                "norimune_soft"
        }
    ],
    time:
        "midnight"
},
{
    text:
        "夜更かしのお供くらいには、なれるかな。",
    time:
        "midnight",
    expression:
        "norimune_closed"
},
        ],

        sleeve: [
            {
                text:
                    "袖を引かなくても、\n" +
                    "どこかへ行ったりはしないよ。",
                expression:
                    "norimune_gentle"
            },
            {
                text:
                    "何か言いたいことがあるのかい。",
                expression:
                    "norimune_normal"
            },
            {
                text:
                    "うはは。\n" +
                    "随分かわいらしい呼び止め方だねぇ。",
                expression:
                    "norimune_closed"
            },
            {
                text:
                    "冬の布は、触れているだけでも暖かい。",
                season:
                    "winter",
                expression:
                    "norimune_soft"
            },
            {
    text:
        "おや。\n" +
        "袖を引かれるとは思わなかったよ。",
    expression:
        "norimune_surprised"
},
{
    text:
        "呼び止めたいことでもあったのかな。",
    expression:
        "norimune_gentle"
},
{
    text:
        "うはは。\n" +
        "ちゃんといるから、そんなに引っ張らなくても大丈夫さ。",
    expression:
        "norimune_closed"
},
{
    pages: [
        {
            text:
                "袖を引かれるというのは、",
            expression:
                "norimune_far"
        },
        {
            text:
                "案外かわいらしいものだねぇ。",
            expression:
                "norimune_smile"
        }
    ]
},
{
    text:
        "迷子になった子どもみたいだ。",
    expression:
        "norimune_tease"
},
{
    text:
        "どこかへ連れて行きたいのかい。",
    expression:
        "norimune_normal"
},
{
    text:
        "僕でよければ、もう少し付き合おう。",
    expression:
        "norimune_gentle"
},
{
    pages: [
        {
            text:
                "急ぐ話かな。",
            expression:
                "norimune_think"
        },
        {
            text:
                "それとも、ただ呼んでみただけ？",
            expression:
                "norimune_tease"
        }
    ]
},
{
    text:
        "袖というのは便利でねぇ。||" +
        "こうして呼び止めてもらえる。",
    expression:
        "norimune_closed"
},
{
    text:
        "朝から元気だねぇ。||" +
        "袖を引く力も十分だ。",
    time:
        "morning",
    expression:
        "norimune_smile"
},
{
    text:
        "昼は皆忙しい。||" +
        "少しくらい寄り道しても罰は当たらないさ。",
    time:
        "day",
    expression:
        "norimune_closed"
},
{
    pages: [
        {
            text:
                "夕方になると、",
            expression:
                "norimune_far"
        },
        {
            text:
                "人恋しくなる時間なのかもしれないねぇ。",
            expression:
                "norimune_gentle"
        }
    ],
    time:
        "evening"
},
{
    text:
        "夜に袖を引かれると、\n" +
        "何事かと思ってしまうよ。",
    time:
        "night",
    expression:
        "norimune_surprised"
},
{
    text:
        "眠れないなら、少し話でもしようか。",
    time:
        "night",
    expression:
        "norimune_soft"
},
{
    pages: [
        {
            text:
                "もう夜更けだ。",
            expression:
                "norimune_troubled"
        },
        {
            text:
                "袖を放す前に、今日はもう休むと約束しておくれ。",
            expression:
                "norimune_soft"
        }
    ],
    time:
        "midnight"
},
{
    text:
        "夜更かし仲間を増やす気はないんだけどねぇ。",
    time:
        "midnight",
    expression:
        "norimune_closed"
},
{
    text:
        "そんなに袖が気に入ったのかい。||" +
        "仕立てた者が喜びそうだ。",
    expression:
        "norimune_tease"
},
{
    pages: [
        {
            text:
                "布越しでも、",
            expression:
                "norimune_far"
        },
        {
            text:
                "人の温もりというのは伝わるものだ。",
            expression:
                "norimune_gentle"
        }
    ]
},
        ],

        other: [
            {
                text:
                    "おや。\n" +
                    "どうしたんだい。",
                expression:
                    "norimune_normal"
            },
            {
                text:
                    "そんなにつつかなくても、\n" +
                    "ちゃんとここにいるよ。",
                expression:
                    "norimune_smile"
            },
            {
                text:
                    "僕に構ってほしい、ということかな。",
                expression:
                    "norimune_tease"
            },
            {
    text:
        "おや。",
    expression:
        "norimune_smile"
},
{
    text:
        "うはは。\n" +
        "今日はよく触れられる日だねぇ。",
    expression:
        "norimune_closed"
},
{
    text:
        "どうしたんだい。",
    expression:
        "norimune_normal"
},
{
    text:
        "ちゃんとここにいるよ。",
    expression:
        "norimune_gentle"
},
{
    text:
        "何か用でもあったかい。",
    expression:
        "norimune_tease"
},
{
    text:
        "お前さんは、よく構ってくれるねぇ。",
    expression:
        "norimune_smile"
},
{
    pages: [
        {
            text:
                "呼ばれた気がしたよ。",
            expression:
                "norimune_surprised"
        },
        {
            text:
                "気のせいではなかったようだねぇ。",
            expression:
                "norimune_closed"
        }
    ]
},
{
    text:
        "そんなにつつくと、\n" +
        "そのうちこちらから返事をしてしまうよ。",
    expression:
        "norimune_tease"
},
{
    text:
        "うんうん。\n" +
        "ちゃんと反応しているとも。",
    expression:
        "norimune_closed"
},
{
    text:
        "僕は案外、話しかけられるのは好きでねぇ。",
    expression:
        "norimune_far"
},
{
    pages: [
        {
            text:
                "……おや。",
            expression:
                "norimune_surprised"
        },
        {
            text:
                "今日は随分と積極的だ。",
            expression:
                "norimune_gentle"
        }
    ]
},
{
    text:
        "お前さんが楽しそうなら、それで十分さ。",
    expression:
        "norimune_soft"
},
{
    text:
        "朝から元気だねぇ。",
    time:
        "morning",
    expression:
        "norimune_smile"
},
{
    text:
        "昼は賑やかでいいねぇ。",
    time:
        "day",
    expression:
        "norimune_closed"
},
{
    text:
        "夕方になると、少しのんびりしたくなる。",
    time:
        "evening",
    expression:
        "norimune_far"
},
{
    text:
        "夜は静かだから、\n" +
        "お前さんが来ると少し嬉しいねぇ。",
    time:
        "night",
    expression:
        "norimune_gentle"
},
{
    text:
        "こんな夜更けまで付き合ってくれるとは。",
    time:
        "midnight",
    expression:
        "norimune_soft"
},
{
    pages: [
        {
            text:
                "眠れないのかな。",
            expression:
                "norimune_troubled"
        },
        {
            text:
                "少し話したら、ちゃんと休むんだよ。",
            expression:
                "norimune_soft"
        }
    ],
    time:
        "midnight"
},
        ]
    };

    /*
     * ─────────────────────────────
     * マスク色設定
     * ─────────────────────────────
     */

    const PART_COLORS = [
        {
            part: "head",
            r: 255,
            g: 0,
            b: 0
        },
        {
            part: "face",
            r: 0,
            g: 255,
            b: 0
        },
        {
            part: "fan",
            r: 0,
            g: 0,
            b: 255
        },
        {
            part: "hand",
            r: 255,
            g: 255,
            b: 0
        },
        {
            part: "body",
            r: 255,
            g: 0,
            b: 255
        },
        {
            part: "sleeve",
            r: 0,
            g: 255,
            b: 255
        },
        {
            part: "other",
            r: 255,
            g: 255,
            b: 255
        }
    ];

    let touchEnabled = true;
    let cooldown = 0;

    let resetRequested = false;
    let resetDelay = 0;

    /*
     * 部位ごとに履歴を分けて保存。
     */
    const talkHistory = {
        head: [],
        face: [],
        fan: [],
        hand: [],
        body: [],
        sleeve: [],
        other: []
    };

    const maskBitmap =
        ImageManager.loadPicture(maskImage);

    /*
     * ─────────────────────────────
     * 現在時刻・季節
     * ─────────────────────────────
     */

    function getCurrentTimeZone() {
        if (
            window.MamiTimeSystem &&
            typeof MamiTimeSystem.getTimeZone ===
                "function"
        ) {
            return MamiTimeSystem.getTimeZone();
        }

        const hour =
            new Date().getHours();

        if (
            hour >= 5 &&
            hour <= 10
        ) {
            return "morning";
        }

        if (
            hour >= 11 &&
            hour <= 16
        ) {
            return "day";
        }

        if (
            hour >= 17 &&
            hour <= 18
        ) {
            return "evening";
        }

        if (
            hour >= 19 &&
            hour <= 23
        ) {
            return "night";
        }

        return "midnight";
    }

    function getCurrentSeason() {
        if (
            window.MamiTimeSystem &&
            typeof MamiTimeSystem.getSeason ===
                "function"
        ) {
            return MamiTimeSystem.getSeason();
        }

        const month =
            new Date().getMonth() + 1;

        if (
            month >= 3 &&
            month <= 5
        ) {
            return "spring";
        }

        if (
            month >= 6 &&
            month <= 8
        ) {
            return "summer";
        }

        if (
            month >= 9 &&
            month <= 11
        ) {
            return "autumn";
        }

        return "winter";
    }

    /*
     * 指定値が現在値と一致するか。
     *
     * conditionは文字列または配列。
     */
    function matchesValue(
        condition,
        currentValue
    ) {
        if (
            condition === undefined ||
            condition === null ||
            condition === ""
        ) {
            return true;
        }

        if (Array.isArray(condition)) {
            return condition.includes(
                currentValue
            );
        }

        return (
            String(condition) ===
            currentValue
        );
    }

    /*
     * 会話の時間・季節条件を判定。
     */
    function matchesTalkConditions(talk) {
        const currentTime =
            getCurrentTimeZone();

        const currentSeason =
            getCurrentSeason();

        if (
            !matchesValue(
                talk.time,
                currentTime
            )
        ) {
            return false;
        }

        if (
            !matchesValue(
                talk.season,
                currentSeason
            )
        ) {
            return false;
        }

        /*
         * chance省略時は必ず候補に入る。
         *
         * chance: 0.5
         * なら50％。
         */
        if (
            talk.chance !== undefined
        ) {
            const chance =
                Math.max(
                    0,
                    Math.min(
                        1,
                        Number(talk.chance)
                    )
                );

            if (
                Math.random() >= chance
            ) {
                return false;
            }
        }

        return true;
    }

    /*
     * ─────────────────────────────
     * 会話抽選
     * ─────────────────────────────
     */

    function makeTalkCandidates(part) {
        const source =
            TOUCH_TALK_DATA[part];

        if (
            !Array.isArray(source)
        ) {
            return [];
        }

        return source
            .map(
                (talk, index) => {
                    return {
                        talk: talk,
                        index: index,
                        key:
                            `${part}:${index}`
                    };
                }
            )
            .filter(
                candidate =>
                    matchesTalkConditions(
                        candidate.talk
                    )
            );
    }

    function filterRecentHistory(
        part,
        candidates
    ) {
        if (
            historyCount <= 0
        ) {
            return candidates;
        }

        const history =
            talkHistory[part] || [];

        const filtered =
            candidates.filter(
                candidate =>
                    !history.includes(
                        candidate.key
                    )
            );

        /*
         * 全候補が履歴入りした場合は、
         * 候補なしにせず履歴を無視する。
         */
        if (
            filtered.length === 0
        ) {
            return candidates;
        }

        return filtered;
    }

    function getTalkWeight(talk) {
        const weight =
            Number(
                talk.weight !== undefined
                    ? talk.weight
                    : 1
            );

        if (
            !Number.isFinite(weight)
        ) {
            return 1;
        }

        return Math.max(
            0,
            weight
        );
    }

    function selectWeightedCandidate(
        candidates
    ) {
        if (
            candidates.length === 0
        ) {
            return null;
        }

        const totalWeight =
            candidates.reduce(
                (total, candidate) => {
                    return (
                        total +
                        getTalkWeight(
                            candidate.talk
                        )
                    );
                },
                0
            );

        if (
            totalWeight <= 0
        ) {
            return candidates[
                Math.floor(
                    Math.random() *
                    candidates.length
                )
            ];
        }

        let value =
            Math.random() *
            totalWeight;

        for (
            const candidate of candidates
        ) {
            value -=
                getTalkWeight(
                    candidate.talk
                );

            if (value <= 0) {
                return candidate;
            }
        }

        return candidates[
            candidates.length - 1
        ];
    }

    function rememberTalk(
        part,
        candidate
    ) {
        if (
            historyCount <= 0 ||
            !candidate
        ) {
            return;
        }

        const history =
            talkHistory[part];

        history.push(
            candidate.key
        );

        while (
            history.length >
            historyCount
        ) {
            history.shift();
        }
    }

    function selectTouchTalk(part) {
        let candidates =
            makeTalkCandidates(part);

        if (
            candidates.length === 0
        ) {
            return null;
        }

        candidates =
            filterRecentHistory(
                part,
                candidates
            );

        const selected =
            selectWeightedCandidate(
                candidates
            );

        if (selected) {
            rememberTalk(
                part,
                selected
            );
        }

        return selected
            ? selected.talk
            : null;
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

        const picture =
            $gameScreen.picture(
                pictureId
            );

        /*
         * 現在のピクチャ位置・倍率を引き継ぐ。
         */
        if (picture) {
            $gameScreen.showPicture(
                pictureId,
                filename,
                picture.origin(),
                picture.x(),
                picture.y(),
                picture.scaleX(),
                picture.scaleY(),
                picture.opacity(),
                picture.blendMode()
            );

            return;
        }

        /*
         * 万が一立ち絵が未表示だった場合。
         */
        $gameScreen.showPicture(
            pictureId,
            filename,
            1,
            640,
            360,
            100,
            100,
            255,
            0
        );
    }

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
        if (!talk) {
            return;
        }

        /*
         * pages形式。
         *
         * 各ページの先頭に\MEXPを入れ、
         * ページごとに表情を変更する。
         */
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
                    talk.pages[
                        pageIndex
                    ] || {};

                const expression =
                    String(
                        page.expression ||
                        talk.expression ||
                        ""
                    );

                const lines =
                    String(
                        page.text || ""
                    ).split("\n");

                if (
                    lines.length === 0
                ) {
                    lines.push("");
                }

                if (expression) {
                    lines[0] =
                        `\\MEXP[${expression}]` +
                        lines[0];
                }

                for (
                    const line of lines
                ) {
                    $gameMessage.add(
                        line
                    );
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

        /*
         * text形式。
         *
         * expressionは会話開始時に変更。
         * ||でページを分割。
         */
        showExpression(
            talk.expression
        );

        const pages =
            String(
                talk.text || ""
            ).split("||");

        for (
            let pageIndex = 0;
            pageIndex <
            pages.length;
            pageIndex++
        ) {
            const lines =
                pages[
                    pageIndex
                ].split("\n");

            for (
                const line of lines
            ) {
                $gameMessage.add(
                    line
                );
            }

            if (
                pageIndex <
                pages.length - 1
            ) {
                $gameMessage.newPage();
            }
        }
    }

    function showTouchTalk(part) {
        const talk =
            selectTouchTalk(part);

        if (!talk) {
            console.warn(
                `[${pluginName}] 条件に合うタップ会話がありません: ${part}`
            );

            return false;
        }

        enqueueTalkMessage(talk);
        requestExpressionReset();

        return true;
    }

    /*
     * ─────────────────────────────
     * マスク判定
     * ─────────────────────────────
     */

    function findPictureSprite(scene) {
        if (
            !scene ||
            !scene._spriteset ||
            !scene._spriteset
                ._pictureContainer
        ) {
            return null;
        }

        const children =
            scene._spriteset
                ._pictureContainer
                .children;

        return (
            children.find(
                sprite => {
                    return (
                        sprite &&
                        sprite._pictureId ===
                            pictureId
                    );
                }
            ) || null
        );
    }

    function hexToRgb(hex) {
        if (!hex) {
            return null;
        }

        const value =
            String(hex)
                .replace("#", "")
                .trim();

        if (
            value.length !== 6
        ) {
            return null;
        }

        const number =
            Number.parseInt(
                value,
                16
            );

        if (
            Number.isNaN(number)
        ) {
            return null;
        }

        return {
            r:
                (number >> 16) &
                255,
            g:
                (number >> 8) &
                255,
            b:
                number & 255
        };
    }

    function isColorNear(
        rgb,
        target
    ) {
        return (
            Math.abs(
                rgb.r - target.r
            ) <= colorTolerance &&
            Math.abs(
                rgb.g - target.g
            ) <= colorTolerance &&
            Math.abs(
                rgb.b - target.b
            ) <= colorTolerance
        );
    }

    function getPartAt(
        maskX,
        maskY
    ) {
        if (
            !maskBitmap.isReady()
        ) {
            return null;
        }

        if (
            maskX < 0 ||
            maskY < 0 ||
            maskX >=
                maskBitmap.width ||
            maskY >=
                maskBitmap.height
        ) {
            return null;
        }

        const alpha =
            maskBitmap.getAlphaPixel(
                maskX,
                maskY
            );

        if (alpha <= 10) {
            return null;
        }

        const hex =
            maskBitmap.getPixel(
                maskX,
                maskY
            );

        const rgb =
            hexToRgb(hex);

        if (!rgb) {
            return null;
        }

        for (
            const data of PART_COLORS
        ) {
            if (
                isColorNear(
                    rgb,
                    data
                )
            ) {
                return data.part;
            }
        }

        return null;
    }

    function screenToBitmapPosition(
        sprite,
        screenX,
        screenY
    ) {
        if (
            !sprite ||
            !sprite.bitmap ||
            !sprite.bitmap.isReady()
        ) {
            return null;
        }

        const globalPoint =
            new Point(
                screenX,
                screenY
            );

        const localPoint =
            sprite.worldTransform
                .applyInverse(
                    globalPoint
                );

        const bitmapX =
            localPoint.x +
            sprite.anchor.x *
                sprite.bitmap.width;

        const bitmapY =
            localPoint.y +
            sprite.anchor.y *
                sprite.bitmap.height;

        if (
            bitmapX < 0 ||
            bitmapY < 0 ||
            bitmapX >=
                sprite.bitmap.width ||
            bitmapY >=
                sprite.bitmap.height
        ) {
            return null;
        }

        return {
            x: bitmapX,
            y: bitmapY
        };
    }

    function bitmapToMaskPosition(
        sprite,
        bitmapPosition
    ) {
        if (
            !sprite ||
            !sprite.bitmap ||
            !maskBitmap.isReady()
        ) {
            return null;
        }

        if (
            sprite.bitmap.width <= 0 ||
            sprite.bitmap.height <= 0
        ) {
            return null;
        }

        const maskX =
            Math.floor(
                bitmapPosition.x *
                maskBitmap.width /
                sprite.bitmap.width
            );

        const maskY =
            Math.floor(
                bitmapPosition.y *
                maskBitmap.height /
                sprite.bitmap.height
            );

        return {
            x: maskX,
            y: maskY
        };
    }

    /*
     * ─────────────────────────────
     * タップ処理
     * ─────────────────────────────
     */

    function canProcessTouch() {
        if (!touchEnabled) {
            return false;
        }

        if (cooldown > 0) {
            return false;
        }

        if (
            !$gameScreen.picture(
                pictureId
            )
        ) {
            return false;
        }

        if (
            $gameMessage &&
            $gameMessage.isBusy()
        ) {
            return false;
        }

        if (
            $gameTemp &&
            $gameTemp
                .isCommonEventReserved()
        ) {
            return false;
        }

        if (
            !maskBitmap.isReady()
        ) {
            return false;
        }

        return true;
    }

    function processTouch(scene) {
        if (
            !canProcessTouch()
        ) {
            return;
        }

        if (
            !TouchInput.isTriggered()
        ) {
            return;
        }

        const sprite =
            findPictureSprite(scene);

        if (
            !sprite ||
            !sprite.visible
        ) {
            return;
        }

        const bitmapPosition =
            screenToBitmapPosition(
                sprite,
                TouchInput.x,
                TouchInput.y
            );

        if (!bitmapPosition) {
            return;
        }

        const maskPosition =
            bitmapToMaskPosition(
                sprite,
                bitmapPosition
            );

        if (!maskPosition) {
            return;
        }

        const part =
            getPartAt(
                maskPosition.x,
                maskPosition.y
            );

        if (!part) {
            return;
        }

        if (
            showTouchTalk(part)
        ) {
            cooldown =
                cooldownFrames;
        }
    }

    /*
     * ─────────────────────────────
     * 起動時の画像先読み
     * ─────────────────────────────
     */

    const _Scene_Boot_loadSystemImages =
        Scene_Boot.prototype
            .loadSystemImages;

    Scene_Boot.prototype
        .loadSystemImages =
        function() {
            _Scene_Boot_loadSystemImages
                .call(this);

            ImageManager.loadPicture(
                maskImage
            );
        };

    /*
     * ─────────────────────────────
     * マップ更新
     * ─────────────────────────────
     */

    const _Scene_Map_update =
        Scene_Map.prototype.update;

    Scene_Map.prototype.update =
        function() {
            _Scene_Map_update.call(
                this
            );

            if (cooldown > 0) {
                cooldown--;
            }

            processTouch(this);

            /*
             * 会話終了後に通常表情へ戻す。
             */
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
     * ─────────────────────────────
     * プラグインコマンド
     * ─────────────────────────────
     */

    PluginManager.registerCommand(
        pluginName,
        "EnableTouch",
        () => {
            touchEnabled = true;
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "DisableTouch",
        () => {
            touchEnabled = false;
        }
    );
})();