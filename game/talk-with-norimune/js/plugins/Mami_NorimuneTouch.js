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
            }
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
            }
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
            }
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
            }
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
            }
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