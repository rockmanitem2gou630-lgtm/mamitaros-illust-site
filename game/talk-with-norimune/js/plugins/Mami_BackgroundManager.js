/*:
 * @target MZ
 * @plugindesc 時間帯背景のリアルタイム切替・クロスフェード Ver2.0
 * @author マミタロス
 *
 * @param MorningImage
 * @text 朝の背景
 * @type file
 * @dir img/pictures
 * @default background_morning
 *
 * @param DayImage
 * @text 昼の背景
 * @type file
 * @dir img/pictures
 * @default background_day
 *
 * @param EveningImage
 * @text 夕方の背景
 * @type file
 * @dir img/pictures
 * @default background_evening
 *
 * @param NightImage
 * @text 夜の背景
 * @type file
 * @dir img/pictures
 * @default background_night
 *
 * @param MidnightImage
 * @text 深夜の背景
 * @type file
 * @dir img/pictures
 * @default background_midnight
 *
 * @param BackgroundX
 * @text 背景X座標
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 *
 * @param BackgroundY
 * @text 背景Y座標
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 *
 * @param ScaleX
 * @text 横拡大率
 * @type number
 * @min 1
 * @default 100
 *
 * @param ScaleY
 * @text 縦拡大率
 * @type number
 * @min 1
 * @default 100
 *
 * @param Opacity
 * @text 最大不透明度
 * @type number
 * @min 0
 * @max 255
 * @default 255
 *
 * @param CrossFadeFrames
 * @text クロスフェード時間
 * @desc 60で約1秒です。
 * @type number
 * @min 1
 * @default 120
 *
 * @param CheckIntervalSeconds
 * @text 時刻確認間隔
 * @desc 現在の時間帯を再確認する間隔です。
 * @type number
 * @min 1
 * @default 5
 *
 * @param AutoRefresh
 * @text 時間帯変化を自動反映
 * @type boolean
 * @on 有効
 * @off 無効
 * @default true
 *
 * @command RefreshBackground
 * @text 背景を再判定
 * @desc 現在の時間帯を確認し、必要なら背景を切り替えます。
 *
 * @command ForceRefreshBackground
 * @text 背景を強制更新
 * @desc 時間帯が同じでも背景を読み直します。
 *
 * @command ShowBackground
 * @text 背景を表示
 *
 * @command HideBackground
 * @text 背景を非表示
 *
 * @help
 * Mami_TimeSystem.jsが必要です。
 *
 * 2枚の専用Spriteを使用し、現在の背景と次の背景を
 * 同時にフェードさせることでクロスフェードを行います。
 *
 * 背景は通常のピクチャより後ろに表示されるため、
 * 立ち絵ピクチャやボタンと重なりません。
 *
 * 自動実行イベントで背景ピクチャを表示する必要はありません。
 *
 * 推奨プラグイン順：
 *
 * Mami_TimeSystem
 * Mami_BackgroundManager
 * Mami_CharacterToneManager
 */

(() => {
    "use strict";

    const pluginName = "Mami_BackgroundManager";
    const params = PluginManager.parameters(pluginName);

    function numberParam(name, defaultValue) {
        const value = params[name];

        if (value === undefined || value === "") {
            return defaultValue;
        }

        return Number(value);
    }

    const backgroundImages = {
        morning: String(
            params.MorningImage ||
            "background_morning"
        ),

        day: String(
            params.DayImage ||
            "background_day"
        ),

        evening: String(
            params.EveningImage ||
            "background_evening"
        ),

        night: String(
            params.NightImage ||
            "background_night"
        ),

        midnight: String(
            params.MidnightImage ||
            "background_midnight"
        )
    };

    const backgroundX =
        numberParam("BackgroundX", 0);

    const backgroundY =
        numberParam("BackgroundY", 0);

    const scaleX =
        numberParam("ScaleX", 100) / 100;

    const scaleY =
        numberParam("ScaleY", 100) / 100;

    const maximumOpacity =
        Math.max(
            0,
            Math.min(
                255,
                numberParam("Opacity", 255)
            )
        );

    const crossFadeFrames =
        Math.max(
            1,
            numberParam("CrossFadeFrames", 120)
        );

    const autoRefresh =
        String(
            params.AutoRefresh || "true"
        ) === "true";

    let backgroundVisible = true;
    let currentTimeZone = "";

    /*
     * 実時間で次回確認時刻を管理する。
     * 起動直後は短い間隔で再確認する。
     */
    let nextCheckTime = 0;
    let startupCheckCount = 0;

    /*
     * ─────────────────────────────
     * 時間帯取得
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
            console.warn(
                `[${pluginName}] Mami_TimeSystem.jsが見つかりません。`
            );

            return "day";
        }

        return MamiTimeSystem.getTimeZone();
    }

    function getBackgroundImage(timeZone) {
        return (
            backgroundImages[timeZone] ||
            backgroundImages.day
        );
    }

    /*
     * ─────────────────────────────
     * 背景Sprite
     * ─────────────────────────────
     */

    class Sprite_MamiTimeBackground extends Sprite {
        constructor() {
            super();

            this.x = backgroundX;
            this.y = backgroundY;

            this.scale.x = scaleX;
            this.scale.y = scaleY;

            this.opacity = 0;
            this.visible = true;

            this._targetOpacity = 0;
            this._fadeDuration = 0;
        }

        setImage(imageName) {
            if (!imageName) {
                this.bitmap = null;
                return;
            }

            this.bitmap =
                ImageManager.loadPicture(imageName);
        }

        setOpacityImmediately(value) {
            this.opacity = value;
            this._targetOpacity = value;
            this._fadeDuration = 0;
        }

        startFade(targetOpacity, duration) {
            this._targetOpacity =
                Math.max(
                    0,
                    Math.min(255, targetOpacity)
                );

            this._fadeDuration =
                Math.max(1, duration);
        }

        update() {
            super.update();

            if (this._fadeDuration <= 0) {
                return;
            }

            const difference =
                this._targetOpacity -
                this.opacity;

            this.opacity +=
                difference /
                this._fadeDuration;

            this._fadeDuration--;

            if (this._fadeDuration <= 0) {
                this.opacity =
                    this._targetOpacity;
            }
        }
    }

    /*
     * ─────────────────────────────
     * 背景管理コンテナ
     * ─────────────────────────────
     */

    class Sprite_MamiBackgroundContainer extends Sprite {
        constructor() {
            super();

            this._frontIndex = 0;
            this._transitioning = false;

            this._backgroundSprites = [
                new Sprite_MamiTimeBackground(),
                new Sprite_MamiTimeBackground()
            ];

            this.addChild(
                this._backgroundSprites[0]
            );

            this.addChild(
                this._backgroundSprites[1]
            );
        }

        get frontSprite() {
            return this._backgroundSprites[
                this._frontIndex
            ];
        }

        get backSprite() {
            return this._backgroundSprites[
                1 - this._frontIndex
            ];
        }

        showInitialBackground(imageName) {
            const front = this.frontSprite;
            const back = this.backSprite;

            front.setImage(imageName);
            front.setOpacityImmediately(
                backgroundVisible
                    ? maximumOpacity
                    : 0
            );

            back.setOpacityImmediately(0);

            this._transitioning = false;
        }

        crossFadeTo(imageName) {
            const oldFront = this.frontSprite;
            const newFront = this.backSprite;

            /*
             * 新背景を透明状態で準備
             */
            newFront.setImage(imageName);
            newFront.setOpacityImmediately(0);

            /*
             * 新背景を古い背景より手前へ
             */
            this.setChildIndex(
                newFront,
                this.children.length - 1
            );

            if (!backgroundVisible) {
                oldFront.setOpacityImmediately(0);
                newFront.setOpacityImmediately(0);

                this._frontIndex =
                    1 - this._frontIndex;

                return;
            }

            oldFront.startFade(
                0,
                crossFadeFrames
            );

            newFront.startFade(
                maximumOpacity,
                crossFadeFrames
            );

            this._frontIndex =
                1 - this._frontIndex;

            this._transitioning = true;
        }

        show() {
            backgroundVisible = true;

            this.frontSprite.startFade(
                maximumOpacity,
                Math.max(
                    1,
                    Math.floor(
                        crossFadeFrames / 2
                    )
                )
            );
        }

        hide() {
            backgroundVisible = false;

            for (
                const sprite of
                this._backgroundSprites
            ) {
                sprite.startFade(
                    0,
                    Math.max(
                        1,
                        Math.floor(
                            crossFadeFrames / 2
                        )
                    )
                );
            }
        }

        update() {
            super.update();

            if (!this._transitioning) {
                return;
            }

            const oldBackground =
                this.backSprite;

            if (
                this.frontSprite.opacity >=
                    maximumOpacity &&
                oldBackground.opacity <= 0
            ) {
                oldBackground.opacity = 0;
                this._transitioning = false;
            }
        }
    }

    /*
     * ─────────────────────────────
     * Spritesetへ背景レイヤー追加
     * ─────────────────────────────
     *
     * createPicturesより先に専用背景を追加するため、
     * 通常ピクチャはすべて背景より前に表示されます。
     */

    const _Spriteset_Base_createPictures =
        Spriteset_Base.prototype.createPictures;

    Spriteset_Base.prototype.createPictures = function() {
        this.createMamiTimeBackground();

        _Spriteset_Base_createPictures.call(this);
    };

    Spriteset_Base.prototype.createMamiTimeBackground =
        function() {
            if (this._mamiBackgroundContainer) {
                return;
            }

            this._mamiBackgroundContainer =
                new Sprite_MamiBackgroundContainer();

            this.addChild(
                this._mamiBackgroundContainer
            );
        };

    /*
     * ─────────────────────────────
     * 現在の背景管理オブジェクト取得
     * ─────────────────────────────
     */

    function getBackgroundContainer() {
        const scene =
            SceneManager._scene;

        if (
            !(scene instanceof Scene_Map) ||
            !scene._spriteset
        ) {
            return null;
        }

        return (
            scene._spriteset
                ._mamiBackgroundContainer ||
            null
        );
    }

    /*
     * ─────────────────────────────
     * 背景更新
     * ─────────────────────────────
     */

function refreshBackground(force = false) {
    const container =
        getBackgroundContainer();

    if (!container) {
        return;
    }

    const newTimeZone =
        getTimeZone();

    if (
        !force &&
        newTimeZone === currentTimeZone
    ) {
        return;
    }

    const imageName =
        getBackgroundImage(
            newTimeZone
        );

    /*
     * 初回表示か、時間帯変更かを記録
     */
    const isInitialDisplay =
        !currentTimeZone;

    if (isInitialDisplay) {
        container.showInitialBackground(
            imageName
        );
    } else {
        container.crossFadeTo(
            imageName
        );
    }

    currentTimeZone =
        newTimeZone;

    /*
     * 立ち絵などへ時間帯変更を通知。
     *
     * 初回表示は即時、
     * 時間帯変更は背景と同じフレーム数で変化。
     */
    window.dispatchEvent(
        new CustomEvent(
            "mamiTimeZoneChanged",
            {
                detail: {
                    timeZone:
                        newTimeZone,

                    duration:
                        isInitialDisplay
                            ? 0
                            : crossFadeFrames
                }
            }
        )
    );
}

    /*
     * ─────────────────────────────
     * マップ開始
     * ─────────────────────────────
     */

    const _Scene_Map_start =
        Scene_Map.prototype.start;

    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);

        currentTimeZone = "";

        /*
         * 起動直後は時刻境界をまたぐ可能性があるため、
         * 1秒ごとに数回確認する。
         */
        startupCheckCount = 5;
        nextCheckTime = Date.now();

        refreshBackground(true);
    };

    /*
     * ─────────────────────────────
     * リアルタイム時刻確認
     * ─────────────────────────────
     */

    const _Scene_Map_update =
    Scene_Map.prototype.update;

Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);

    if (!autoRefresh) {
        return;
    }

    const now = Date.now();

    if (now < nextCheckTime) {
        return;
    }

    refreshBackground(false);

    /*
     * 起動後5回は1秒間隔で確認。
     * その後はプラグイン設定の間隔へ戻す。
     *
     * 59分59秒に起動しても、次の1秒で新時間帯を拾える。
     */
    if (startupCheckCount > 0) {
        startupCheckCount--;
        nextCheckTime = now + 1000;
    } else {
        const intervalMilliseconds =
            Math.max(
                1000,
                numberParam(
                    "CheckIntervalSeconds",
                    5
                ) * 1000
            );

        nextCheckTime =
            now + intervalMilliseconds;
    }
};

    /*
     * ─────────────────────────────
     * プラグインコマンド
     * ─────────────────────────────
     */

    PluginManager.registerCommand(
        pluginName,
        "RefreshBackground",
        () => {
            refreshBackground(false);
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "ForceRefreshBackground",
        () => {
            refreshBackground(true);
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "ShowBackground",
        () => {
            const container =
                getBackgroundContainer();

            if (container) {
                container.show();
            }
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "HideBackground",
        () => {
            const container =
                getBackgroundContainer();

            if (container) {
                container.hide();
            }
        }
    );

    /*
     * ─────────────────────────────
     * 画像先読み
     * ─────────────────────────────
     */

    const _Scene_Boot_loadSystemImages =
        Scene_Boot.prototype.loadSystemImages;

    Scene_Boot.prototype.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);

        for (
            const imageName of
            Object.values(
                backgroundImages
            )
        ) {
            if (imageName) {
                ImageManager.loadPicture(
                    imageName
                );
            }
        }
    };
})();