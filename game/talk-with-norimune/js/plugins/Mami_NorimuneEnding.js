/*:
 * @target MZ
 * @plugindesc 則宗さん会話作品用の退室・再訪画面 Ver2.1
 * @author マミタロス
 *
 * @param ButtonImage
 * @text 再訪ボタン画像
 * @type file
 * @dir img/pictures
 * @default btn_revisit
 *
 * @param ButtonX
 * @text 再訪ボタンX座標
 * @type number
 * @default 640
 *
 * @param ButtonY
 * @text 再訪ボタンY座標
 * @type number
 * @default 430
 *
 * @param Message
 * @text 終了画面の文章
 * @type string
 * @default また、いつでも。
 *
 * @param FontSize
 * @text 文章の文字サイズ
 * @type number
 * @min 1
 * @default 30
 *
 * @param FadeSpeed
 * @text 暗転速度
 * @desc 数字が大きいほど速く暗転します。
 * @type number
 * @min 1
 * @max 255
 * @default 10
 *
 * @param RevisitCommonEvent
 * @text 再訪時コモンイベント
 * @desc 再訪ボタンを押した後に実行するコモンイベント番号です。
 * @type common_event
 * @default 5
 *
 * @command ShowEnding
 * @text 退室画面を表示
 * @desc 現在の画面の上へ退室画面を表示します。
 * 
 * @command UnlockNorimuneInput
 * @text 則宗タッチ判定を再開
 * @desc 退室・再訪イベント後に、則宗さんへのクリックとタップを再開します。
 *
 *
 * @help
 * ページの再読み込みは行いません。
 *
 * 現在の本丸画面を裏に残したまま黒い画面を重ね、
 * 再訪時には黒い画面だけを取り除きます。
 *
 * そのため、背景画像の再読み込みによるちらつきや、
 * マップ画面が一瞬見える現象を防げます。
 */

(() => {
    "use strict";

    const pluginName = "Mami_NorimuneEnding";
    const params = PluginManager.parameters(pluginName);

    const buttonImage = String(
        params.ButtonImage || "btn_revisit"
    );

    const buttonX = Number(params.ButtonX || 640);
    const buttonY = Number(params.ButtonY || 430);
    const message = String(params.Message || "");
    const fontSize = Number(params.FontSize || 30);
    const fadeSpeed = Number(params.FadeSpeed || 10);
    const revisitCommonEventId = Number(
        params.RevisitCommonEvent || 5
    );
        /*
     * ─────────────────────────────
     * 退室時会話
     * ─────────────────────────────
     *
     * minCount / maxCount
     *     今回の訪問中に「話す」系を押した回数
     *
     * time
     *     morning / day / evening / night / midnight
     *
     * season
     *     spring / summer / autumn / winter
     *
     * dayOfWeek
     *     0 日曜 ～ 6 土曜
     *
     * weight
     *     数字が大きいほど選ばれやすい
     */

    const ENDING_TALK_DATA = [
        /*
         * ─────────────────────────
         * 会話回数
         * ─────────────────────────
         */

        {
            maxCount: 0,
            weight: 5,

            pages: [
                {
                    text:
                        "もう帰るのかい。",
                    expression:
                        "norimune_surprised"
                },
                {
                    text:
                        "うはは。顔を見せに来てくれただけでも、僕は嬉しいよ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },

        {
            minCount: 1,
            maxCount: 3,
            weight: 4,

            text:
                "今日は、少し顔を見に来てくれたというところかな。||" +
                "それでも充分さ。また気が向いた時においで。",

            expression:
                "norimune_gentle"
        },

        {
            minCount: 4,
            maxCount: 9,
            weight: 4,

            text:
                "今日は、なかなか良い話し相手だったよ。||" +
                "気をつけてお帰り。",

            expression:
                "norimune_smile"
        },

        {
            minCount: 10,
            maxCount: 19,
            weight: 5,

            pages: [
                {
                    text:
                        "随分と話したねぇ。",
                    expression:
                        "norimune_closed"
                },
                {
                    text:
                        "時間を忘れていたのは、僕も同じだけれど。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },

        {
            minCount: 20,
            maxCount: 39,
            weight: 6,

            pages: [
                {
                    text:
                        "ようやく帰る気になったのかい。",
                    expression:
                        "norimune_tease"
                },
                {
                    text:
                        "うはは。年寄りは暇だからねぇ。||" +
                        "また長居をしても構わないよ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },

        {
            minCount: 40,
            weight: 8,

            pages: [
                {
                    text:
                        "今日は、随分と長いこと一緒にいたねぇ。",
                    expression:
                        "norimune_far"
                },
                {
                    text:
                        "帰ったあと、少し静かに感じてしまいそうだ。",
                    expression:
                        "norimune_gentle"
                },
                {
                    text:
                        "……うはは。今のは忘れておくれ。",
                    expression:
                        "norimune_tease"
                }
            ]
        },

        /*
         * ─────────────────────────
         * 時間帯
         * ─────────────────────────
         */

        {
            time: "morning",
            weight: 3,

            text:
                "では、行っておいで。||" +
                "帰る頃には、また違う話ができるだろう。",

            expression:
                "norimune_gentle"
        },

        {
            time: "day",
            weight: 3,

            text:
                "まだ日は高い。||" +
                "このあとの時間も、無理なく過ごすんだよ。",

            expression:
                "norimune_soft"
        },

        {
            time: "evening",
            weight: 3,

            text:
                "日が暮れる前に帰るのかい。||" +
                "足元が暗くならないうちに、気をつけてお帰り。",

            expression:
                "norimune_gentle"
        },

        {
            time: "night",
            weight: 4,

            text:
                "もう帰るのかい。||" +
                "夜道には気をつけるんだよ。",

            expression:
                "norimune_soft"
        },

        {
            time: "midnight",
            weight: 5,

            pages: [
                {
                    text:
                        "ようやく休む気になったかな。",
                    expression:
                        "norimune_tease"
                },
                {
                    text:
                        "今度こそ、まっすぐ眠りに行くんだよ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        },

        /*
         * ─────────────────────────
         * 季節
         * ─────────────────────────
         */

        {
            season: "spring",
            weight: 2,

            text:
                "外へ出れば、春の風が迎えてくれるだろう。||" +
                "少しくらい遠回りして帰るのも悪くないねぇ。",

            expression:
                "norimune_gentle"
        },

        {
            season: "summer",
            weight: 2,

            text:
                "外はまだ暑いだろう。||" +
                "急がず、涼しいところを選んでお帰り。",

            expression:
                "norimune_soft"
        },

        {
            season: "autumn",
            weight: 2,

            text:
                "帰り道の風も、少し涼しくなっただろう。||" +
                "身体を冷やさないようにねぇ。",

            expression:
                "norimune_gentle"
        },

        {
            season: "winter",
            weight: 3,

            text:
                "外は冷えるよ。||" +
                "ちゃんと暖かくして帰りなさい。",

            expression:
                "norimune_soft"
        },

        /*
         * ─────────────────────────
         * 曜日限定の隠し会話
         * ─────────────────────────
         */

        {
            dayOfWeek: 0,
            weight: 1,

            text:
                "名残惜しい顔をしているねぇ。||" +
                "今日の残りまで、先の心配へ渡してしまわないように。",

            expression:
                "norimune_soft"
        },

        {
            dayOfWeek: 1,
            weight: 1,

            text:
                "今日は、もう充分に始められたんじゃないかな。||" +
                "続きは焦らず進めればいい。",

            expression:
                "norimune_gentle"
        },

        {
            dayOfWeek: 5,
            weight: 1,

            text:
                "ここまで、よく励んだねぇ。||" +
                "帰ったら少しくらい、自分を甘やかしておやり。",

            expression:
                "norimune_gentle"
        },

        /*
         * ─────────────────────────
         * 汎用
         * ─────────────────────────
         */

        {
            weight: 2,

            text:
                "それでは、また。||" +
                "次に来る時も、僕はここにいるよ。",

            expression:
                "norimune_gentle"
        },

        {
            weight: 2,

            text:
                "もう帰るのかい。||" +
                "うはは。引き止めはしないよ。またおいで。",

            expression:
                "norimune_tease"
        },

        {
            weight: 2,

            pages: [
                {
                    text:
                        "今日は来てくれてありがとう。",
                    expression:
                        "norimune_smile"
                },
                {
                    text:
                        "……長く生きているとねぇ。||" +
                        "言える時に言っておこうと思うようになるんだ。",
                    expression:
                        "norimune_gentle"
                }
            ]
        }
    ];
        /*
     * 退室会話の終了待ち。
     */
    let pendingEndingScene = null;
    let waitingEndingMessage = false;

        function getCurrentTalkCount() {
        if (
            window.MamiNorimuneTalk &&
            typeof window.MamiNorimuneTalk
                .getVisitTalkCount ===
                "function"
        ) {
            return Number(
                window.MamiNorimuneTalk
                    .getVisitTalkCount()
            ) || 0;
        }

        return 0;
    }

    function getCurrentTimeZone() {
        if (
            window.MamiTimeSystem &&
            typeof window.MamiTimeSystem
                .getTimeZone ===
                "function"
        ) {
            return window.MamiTimeSystem
                .getTimeZone();
        }

        const hour =
            new Date().getHours();

        if (hour >= 5 && hour <= 10) {
            return "morning";
        }

        if (hour >= 11 && hour <= 16) {
            return "day";
        }

        if (hour >= 17 && hour <= 18) {
            return "evening";
        }

        if (hour >= 19 && hour <= 23) {
            return "night";
        }

        return "midnight";
    }

    function getCurrentSeason() {
        if (
            window.MamiTimeSystem &&
            typeof window.MamiTimeSystem
                .getSeason ===
                "function"
        ) {
            return window.MamiTimeSystem
                .getSeason();
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

    function conditionIncludes(
        condition,
        currentValue
    ) {
        if (
            condition === undefined ||
            condition === null
        ) {
            return true;
        }

        const values =
            Array.isArray(condition)
                ? condition
                : [condition];

        return values.some(
            value =>
                String(value) ===
                String(currentValue)
        );
    }

        function matchesEndingTalk(
        talk,
        state
    ) {
        if (!talk) {
            return false;
        }

        if (
            talk.minCount !== undefined &&
            state.talkCount <
                Number(talk.minCount)
        ) {
            return false;
        }

        if (
            talk.maxCount !== undefined &&
            state.talkCount >
                Number(talk.maxCount)
        ) {
            return false;
        }

        if (
            !conditionIncludes(
                talk.time,
                state.time
            )
        ) {
            return false;
        }

        if (
            !conditionIncludes(
                talk.season,
                state.season
            )
        ) {
            return false;
        }

        if (
            !conditionIncludes(
                talk.dayOfWeek,
                state.dayOfWeek
            )
        ) {
            return false;
        }

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

            if (Math.random() >= chance) {
                return false;
            }
        }

        return true;
    }

    function selectWeightedTalk(
        talks
    ) {
        if (talks.length === 0) {
            return null;
        }

        const totalWeight =
            talks.reduce(
                (total, talk) =>
                    total +
                    Math.max(
                        0,
                        Number(
                            talk.weight || 1
                        )
                    ),
                0
            );

        if (totalWeight <= 0) {
            return talks[
                Math.floor(
                    Math.random() *
                    talks.length
                )
            ];
        }

        let value =
            Math.random() *
            totalWeight;

        for (const talk of talks) {
            value -= Math.max(
                0,
                Number(
                    talk.weight || 1
                )
            );

            if (value <= 0) {
                return talk;
            }
        }

        return talks[
            talks.length - 1
        ];
    }

    function selectEndingTalk() {
        const now =
            new Date();

        const state = {
            talkCount:
                getCurrentTalkCount(),

            time:
                getCurrentTimeZone(),

            season:
                getCurrentSeason(),

            dayOfWeek:
                now.getDay()
        };

        const candidates =
            ENDING_TALK_DATA.filter(
                talk =>
                    matchesEndingTalk(
                        talk,
                        state
                    )
            );

        return selectWeightedTalk(
            candidates
        );
    }

        function enqueueEndingTalk(talk) {
        if (!talk) {
            return;
        }

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

                const lines =
                    String(
                        page.text || ""
                    ).split("\n");

                if (lines.length === 0) {
                    lines.push("");
                }

                const expression =
                    String(
                        page.expression ||
                        talk.expression ||
                        ""
                    );

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

            if (
                pageIndex === 0 &&
                talk.expression
            ) {
                lines[0] =
                    `\\MEXP[${talk.expression}]` +
                    (lines[0] || "");
            }

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
     * 則宗さん本体へのクリック・タップを
     * 一時的に停止するための共通フラグ。
     *
     * true  = 入力停止中
     * false = 入力可能
     */
    window.MamiNorimuneInputLock =
        window.MamiNorimuneInputLock || false;

    class Sprite_RevisitButton extends Sprite_Clickable {
        constructor(endingLayer) {
            super();

            this._endingLayer = endingLayer;
            this._hovered = false;
            this._canClick = false;

            this.bitmap = ImageManager.loadPicture(buttonImage);
            this.anchor.set(0.5, 0.5);

            this.x = buttonX;
            this.y = buttonY;

            this.opacity = 0;
            this.scale.set(1, 1);
        }

        update() {
            super.update();

            if (!this._canClick) {
                return;
            }

            const targetScale = this._hovered ? 1.05 : 1.0;

            this.scale.x +=
                (targetScale - this.scale.x) * 0.2;

            this.scale.y +=
                (targetScale - this.scale.y) * 0.2;
        }

        isClickEnabled() {
            return this._canClick &&
                !this._endingLayer._closing;
        }

        onMouseEnter() {
            this._hovered = true;
        }

        onMouseExit() {
            this._hovered = false;
        }

        onClick() {
            if (!this.isClickEnabled()) {
                return;
            }

            this._endingLayer.startClosing();
        }
    }

    class Sprite_NorimuneEnding extends Sprite {
        constructor(scene) {
            super();

            this._scene = scene;
            this._opening = true;
            this._closing = false;
            this._phase = 0;

            this.createBackground();
            this.createMessage();
            this.createRevisitButton();
        }

        createBackground() {
            this._background = new Sprite(
                new Bitmap(Graphics.width, Graphics.height)
            );

            this._background.bitmap.fillAll("#000000");
            this._background.opacity = 0;

            this.addChild(this._background);
        }

        createMessage() {
            this._messageSprite = new Sprite(
                new Bitmap(Graphics.width, 100)
            );

            const bitmap = this._messageSprite.bitmap;

            bitmap.fontSize = fontSize;
            bitmap.textColor = "#ffffff";
            bitmap.outlineColor = "rgba(0, 0, 0, 0.6)";
            bitmap.outlineWidth = 4;

            bitmap.drawText(
                message,
                0,
                0,
                Graphics.width,
                100,
                "center"
            );

            this._messageSprite.y = 280;
            this._messageSprite.opacity = 0;

            this.addChild(this._messageSprite);
        }

        createRevisitButton() {
            this._revisitButton =
                new Sprite_RevisitButton(this);

            this.addChild(this._revisitButton);
        }

        update() {
            super.update();

            if (this._opening) {
                this.updateOpening();
            } else if (this._closing) {
                this.updateClosing();
            }
        }

        updateOpening() {
            if (this._phase === 0) {
                this._background.opacity = Math.min(
                    this._background.opacity + fadeSpeed,
                    255
                );

                if (this._background.opacity >= 255) {
                    this._phase = 1;
                }

                return;
            }

            if (this._phase === 1) {
                this._messageSprite.opacity = Math.min(
                    this._messageSprite.opacity + fadeSpeed,
                    255
                );

                if (this._messageSprite.opacity >= 255) {
                    this._phase = 2;
                }

                return;
            }

            if (this._phase === 2) {
                this._revisitButton.opacity = Math.min(
                    this._revisitButton.opacity + fadeSpeed,
                    255
                );

                if (this._revisitButton.opacity >= 255) {
                    this._opening = false;
                    this._revisitButton._canClick = true;
                }
            }
        }

        startClosing() {
            this._opening = false;
            this._closing = true;
            this._revisitButton._canClick = false;
            TouchInput.clear();
        }

        updateClosing() {
            this._messageSprite.opacity = Math.max(
                this._messageSprite.opacity - fadeSpeed,
                0
            );

            this._revisitButton.opacity = Math.max(
                this._revisitButton.opacity - fadeSpeed,
                0
            );

            this._background.opacity = Math.max(
                this._background.opacity - fadeSpeed,
                0
            );

            if (this._background.opacity <= 0) {
                this.finishClosing();
            }
        }

        finishClosing() {
            this._closing = false;

            if (
                this._scene &&
                this._scene._norimuneEndingLayer === this
            ) {
                this._scene._norimuneEndingLayer = null;
            }

            if (this.parent) {
                this.parent.removeChild(this);
            }

            this.destroy({
                children: true,
                texture: false,
                baseTexture: false
            });

            /*
             * ここから新しい訪問として扱う。
             */
            if (
                window.MamiNorimuneTalk &&
                typeof window.MamiNorimuneTalk
                    .resetVisitTalkCount ===
                    "function"
            ) {
                window.MamiNorimuneTalk
                    .resetVisitTalkCount();
            }

            if (revisitCommonEventId > 0) {
                $gameTemp.reserveCommonEvent(
                    revisitCommonEventId
                );
            }
            TouchInput.clear();
        }
    }

    function showEnding(scene) {
        if (scene._norimuneEndingLayer) {
            return;
        }

        /*
         * 退室画面を開いている間は、
         * 則宗さんへのタッチ判定を停止。
         */
        window.MamiNorimuneInputLock = true;

        const endingLayer =
            new Sprite_NorimuneEnding(scene);

        /*
         * Scene_Map本体へ追加するので、
         * メッセージウィンドウやボタンより手前に表示されます。
         */
        scene.addChild(endingLayer);
    }

    PluginManager.registerCommand(
        pluginName,
        "ShowEnding",
        () => {
            const scene =
                SceneManager._scene;

            if (
                !(scene instanceof Scene_Map)
            ) {
                return;
            }

            if (
                scene._norimuneEndingLayer ||
                waitingEndingMessage
            ) {
                return;
            }

            /*
             * 退室演出中は、
             * 則宗さんへの部位タップを停止。
             */
            PluginManager.callCommand(
                null,
                "Mami_NorimuneTouch",
                "DisableTouch",
                {}
            );

            const talk =
                selectEndingTalk();

            if (!talk) {
                showEnding(scene);
                return;
            }

            enqueueEndingTalk(talk);

            pendingEndingScene = scene;
            waitingEndingMessage = true;
        }
    );
    /*
     * 再訪イベントがすべて終わったあとに、
     * 則宗さんへの入力を再開する。
     */
    PluginManager.registerCommand(
        pluginName,
        "UnlockNorimuneInput",
        () => {
            TouchInput.clear();

            window.MamiNorimuneInputLock = false;
        }
    );

    const _Scene_Boot_loadSystemImages =
        Scene_Boot.prototype.loadSystemImages;

    Scene_Boot.prototype.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);
        ImageManager.loadPicture(buttonImage);
    };

    /*
     * 別れ際会話を読み終えたあと、
     * 退室画面を表示する。
     */
    const _Scene_Map_updateEnding =
        Scene_Map.prototype.update;

    Scene_Map.prototype.update =
        function() {
            _Scene_Map_updateEnding.call(
                this
            );

            if (!waitingEndingMessage) {
                return;
            }

            if ($gameMessage.isBusy()) {
                return;
            }

            waitingEndingMessage = false;

            const scene =
                pendingEndingScene;

            pendingEndingScene = null;

            if (
                scene instanceof Scene_Map
            ) {
                showEnding(scene);
            }
        };
})();