/*:
 * @target MZ
 * @plugindesc 電王会話作品用・ストーリー画面 Ver0.1
 * @author マミタロス
 *
 * @help
 * ストーリーのルート選択、
 * 話数選択画面を表示します。
 */

(() => {
    "use strict";

    const pluginName =
        "Mami_DenOStory";

    /*
     * ─────────────────────────────
     * 基本設定
     * ─────────────────────────────
     */

    const SCREEN_WIDTH = 1280;
    const SCREEN_HEIGHT = 720;

    /*
     * ルート選択カード。
     * 308×438で作ったパス画像を4枚横一列に並べる。
     * 1280×720内で余白を残しつつ大きく見せるため、
     * 表示上は288×410に縮小する。
     */
    const PANEL_WIDTH = 288;
    const PANEL_HEIGHT = 410;

    const ROUTE_CARD_GAP = 18;
    const ROUTE_CARD_TOP = 122;

    /*
     * ホバー時はカード画像だけをほんの少し拡大する。
     * 4枚の間隔を潰さない程度に控えめ。
     */
    const ROUTE_CARD_HOVER_SCALE = 1.025;
    const ROUTE_CARD_HOVER_LIFT = 3;

    /*
     * ルート選択画面に出す4ルートだけを固定。
     * StoryData側のおまけ項目は残したまま、
     * ここでは表示しない。
     */
    const MAIN_ROUTE_IDS = [
        "momo",
        "ura",
        "kin",
        "ryu"
    ];

    /*
     * img/pictures/ に置くパス画像。
     * ImageManager.loadPictureでは拡張子を書かない。
     */
    const ROUTE_CARD_STYLE = {
        momo: {
            image: "ui_story_pass_momo"
        },
        ura: {
            image: "ui_story_pass_ura"
        },
        kin: {
            image: "ui_story_pass_kin"
        },
        ryu: {
            image: "ui_story_pass_ryuta"
        }
    };

    /*
     * ルート選択画面専用背景。
     * img/pictures/bg_story_route_select.png
     */
    const ROUTE_SELECT_BACKGROUND =
        "bg_story_route_select";

    /*
     * ─────────────────────────────
     * 話数選択画面
     * ─────────────────────────────
     *
     * 背景と各ボタンは img/pictures/ から読み込む。
     * EPISODE 01 の英数字だけ専用フォントを使用する。
     */
    const EPISODE_FONT_FACE = "DenOEpisode";
    const EPISODE_FONT_FILE = "deno_episode.ttf";

    if (
        typeof FontManager !== "undefined" &&
        FontManager &&
        typeof FontManager.load === "function"
    ) {
        FontManager.load(
            EPISODE_FONT_FACE,
            EPISODE_FONT_FILE
        );
    }

    /*
     * 1280×720で作成した完成UIに合わせた
     * 話数ボタン中心座標。
     */
    const EPISODE_NODE_POSITIONS = [
        [596, 217],
        [699, 217],
        [802, 217],
        [905, 217],
        [1008, 217],
        [1111, 217],
        [596, 349],
        [699, 349],
        [802, 349],
        [905, 349],
        [1008, 349],
        [1111, 349]
    ];

    const EPISODE_BACK_POSITION = [118, 679];
    const EPISODE_START_POSITION = [1095, 658];

    /*
     * 選択中の発光枠がボタン中心と少しずれる素材なら、
     * ここだけ微調整すればよい。
     */
    const EPISODE_SELECTED_OFFSET_X = 0;
    const EPISODE_SELECTED_OFFSET_Y = 0;

    /*
     * 下部詳細パネルの文字表示領域。
     */
    const EPISODE_NUMBER_RECT = {
        x: 589,
        y: 478,
        width: 310,
        height: 48
    };

    const EPISODE_TITLE_RECT = {
        x: 607,
        y: 548,
        width: 565,
        height: 62
    };

    const EPISODE_BUTTON_HOVER_SCALE = 1.035;
    const EPISODE_BUTTON_PRESS_SCALE = 0.97;

    /*
     * ─────────────────────────────
     * Story UI プリロード
     * ─────────────────────────────
     *
     * ブラウザ版で初回表示時に画像が順番に出るのを防ぐため、
     * UI素材だけを先に ImageManager のキャッシュへ入れる。
     *
     * Boot時：
     *   ルート選択画面 + 話数選択背景 + 共通戻る
     *
     * Storyを開いた時：
     *   01～12駅ボタン + 選択枠 + 開始 + EXIT
     *
     * スチルや本編背景はここでは読まない。
     */

    const STORY_UI_BOOT_PRELOAD_PICTURES = [
        ROUTE_SELECT_BACKGROUND,
        "ui_story_pass_momo",
        "ui_story_pass_ura",
        "ui_story_pass_kin",
        "ui_story_pass_ryuta",
        "bg_episode_select_momo",
        "bg_episode_select_ura",
        "bg_episode_select_kin",
        "bg_episode_select_ryu",
        "ui_episode_back"
    ];

    function makeStoryEpisodeUiPreloadPictures() {
        const pictures = [
            "btn_story_exit"
        ];

        for (const routeId of MAIN_ROUTE_IDS) {
            pictures.push(
                `ui_episode_start_${routeId}`,
                `ui_episode_selected_${routeId}`
            );

            for (let number = 1; number <= 12; number++) {
                pictures.push(
                    `ui_episode_${routeId}_${String(number).padStart(2, "0")}`
                );
            }
        }

        return pictures;
    }

    const STORY_UI_EPISODE_PRELOAD_PICTURES =
        makeStoryEpisodeUiPreloadPictures();

    function preloadStoryPictures(
        pictureNames
    ) {
        if (
            !Array.isArray(pictureNames) ||
            typeof ImageManager === "undefined" ||
            !ImageManager ||
            typeof ImageManager.loadPicture !== "function"
        ) {
            return;
        }

        for (const pictureName of pictureNames) {
            if (!pictureName) {
                continue;
            }

            ImageManager.loadPicture(
                String(pictureName)
            );
        }
    }

    function preloadStoryBootUi() {
        preloadStoryPictures(
            STORY_UI_BOOT_PRELOAD_PICTURES
        );
    }

    function preloadStoryEpisodeUi() {
        preloadStoryPictures(
            STORY_UI_EPISODE_PRELOAD_PICTURES
        );
    }

    /*
     * 起動中に、最初に見えるStory UIを先読み。
     * 元のloadSystemImagesを必ず呼んでから追加分を読む。
     */
    const _Scene_Boot_loadSystemImages_DenOStoryPreload =
        Scene_Boot.prototype.loadSystemImages;

    Scene_Boot.prototype.loadSystemImages =
        function() {
            _Scene_Boot_loadSystemImages_DenOStoryPreload
                .call(this);

            preloadStoryBootUi();
        };

    let storyActive = false;

    /*
     * ─────────────────────────────
     * Storyデバッグ開始位置
     * ─────────────────────────────
     *
     * StoryDataのpages内で、
     *
     * debugStart: true
     *
     * が付いたページがあれば、
     * そのページから再生を開始する。
     *
     * falseにすれば通常どおり
     * 必ず冒頭から再生する。
     */
    const STORY_DEBUG_START_ENABLED = true;

    /*
     * ─────────────────────────────
     * Storyスチル演出
     * ─────────────────────────────
     *
     * 差分同士は短めのクロスフェード。
     * 立ち絵 ⇄ スチルは、乙女ゲーム風に
     * ゆっくり黒を挟んで切り替える。
     */
    const STORY_STILL_CROSSFADE_FRAMES = 12;
    const STORY_STILL_BLACK_FADE_FRAMES = 30;
    const STORY_STILL_BLACK_HOLD_FRAMES = 6;

    /*
     * スチル演出の進行状態。
     * nullなら演出なし。
     */
    let storyStillTransitionState = null;

    /*
     * ─────────────────────────────
     * Story背景・時間経過トランジション
     * ─────────────────────────────
     *
     * storyBackground / storyBackgroundClear:
     *   場所移動。黒の裏で背景を交換する。
     *
     * storyBlackFade:
     *   背景を変えず、時間経過・場面区切りだけを
     *   黒フェードで表現する。
     *
     * 数値は「暗転開始から復帰までの総秒数」。
     */
    const STORY_SCENE_DEFAULT_SECONDS = 0.9;
    const STORY_SCENE_MIN_SECONDS = 0.1;

    let storySceneTransitionState = null;

    /*
     * ─────────────────────────────
     * UIを残す黒フェード
     * ─────────────────────────────
     *
     * 背景・スチル・立ち絵より前、
     * メッセージウィンドウ・ネームプレートより後ろ。
     *
     * StoryData:
     *   storyUiBlackFade: 1
     */
    let storyUiBlackFadeState = null;

    /*
     * ストーリー開始前の
     * ランダム憑依設定を保存する。
     */
    let previousRandomPossessionEnabled =
    null;
    /*
    * ストーリーを開く前の、
     * 通常会話側の憑依・立ち絵状態。
     */
    let previousTalkStateSnapshot =
    null;

    let storyPlaying = false;

    let currentEpisode = null;
    let currentPageIndex = 0;

    let storyExitConfirmOpen = false;

    /*
     * ─────────────────────────────
     * ストーリー再生トランジション
     * ─────────────────────────────
     *
     * 話数開始／自然終了／EXIT終了の
     * 舞台転換を黒画面で完全に隠す。
     */
    const STORY_TRANSITION_FADE_FRAMES = 12;
    const STORY_TRANSITION_HOLD_FRAMES = 4;

    let storyTransitionPhase = "none";
    let storyTransitionCount = 0;
    let storyTransitionOnBlack = null;
    let storyTransitionOnComplete = null;
    let storyTransitionHoldUntil = null;

    function isStoryTransitioning() {
        return storyTransitionPhase !== "none";
    }

    function ensureStoryTransitionOverlay() {
        const scene =
            getScene();

        if (!scene) {
            return null;
        }

        let overlay =
            scene._denOStoryTransitionOverlay;

        if (!overlay) {
            overlay =
                new Sprite(
                    new Bitmap(
                        SCREEN_WIDTH,
                        SCREEN_HEIGHT
                    )
                );

            overlay.bitmap.fillRect(
                0,
                0,
                SCREEN_WIDTH,
                SCREEN_HEIGHT,
                "#000000"
            );

            overlay.opacity = 0;
            overlay.visible = false;

            scene._denOStoryTransitionOverlay =
                overlay;
        }

        /*
         * 既存SpriteでもaddChildし直して
         * 必ずScene_Map最前面へ持ってくる。
         */
        scene.addChild(
            overlay
        );

        return overlay;
    }

    function startStoryTransition(
        onBlack,
        onComplete = null,
        holdUntil = null
    ) {
        if (isStoryTransitioning()) {
            return false;
        }

        const overlay =
            ensureStoryTransitionOverlay();

        if (!overlay) {
            return false;
        }

        storyTransitionPhase =
            "fadeOut";

        storyTransitionCount = 0;

        storyTransitionOnBlack =
            typeof onBlack === "function"
                ? onBlack
                : null;

        storyTransitionOnComplete =
            typeof onComplete === "function"
                ? onComplete
                : null;

        storyTransitionHoldUntil =
            typeof holdUntil === "function"
                ? holdUntil
                : null;

        overlay.visible = true;
        overlay.opacity = 0;

        TouchInput.clear();
        Input.clear();

        return true;
    }

    function finishStoryTransition() {
        const scene =
            getScene();

        const overlay =
            scene
                ? scene
                    ._denOStoryTransitionOverlay
                : null;

        if (overlay) {
            overlay.opacity = 0;
            overlay.visible = false;
        }

        storyTransitionPhase = "none";
        storyTransitionCount = 0;
        storyTransitionOnBlack = null;
        storyTransitionHoldUntil = null;

        const onComplete =
            storyTransitionOnComplete;

        storyTransitionOnComplete =
            null;

        TouchInput.clear();
        Input.clear();

        if (onComplete) {
            onComplete();
        }
    }

    function updateStoryTransition() {
        if (!isStoryTransitioning()) {
            return;
        }

        const scene =
            getScene();

        const overlay =
            scene
                ? scene
                    ._denOStoryTransitionOverlay
                : null;

        if (!overlay) {
            finishStoryTransition();
            return;
        }

        if (
            storyTransitionPhase ===
            "fadeOut"
        ) {
            storyTransitionCount++;

            const rate =
                Math.min(
                    1,
                    storyTransitionCount /
                    Math.max(
                        1,
                        STORY_TRANSITION_FADE_FRAMES
                    )
                );

            overlay.opacity =
                Math.round(
                    255 * rate
                );

            if (rate >= 1) {
                overlay.opacity = 255;

                storyTransitionPhase =
                    "hold";

                storyTransitionCount = 0;

                const onBlack =
                    storyTransitionOnBlack;

                storyTransitionOnBlack =
                    null;

                if (onBlack) {
                    onBlack();
                }
            }

            return;
        }

        if (
            storyTransitionPhase ===
            "hold"
        ) {
            overlay.opacity = 255;

            /*
             * 話数開始時の背景など、
             * 黒の裏で画像ロードを待ちたい場合。
             */
            if (
                storyTransitionHoldUntil &&
                !storyTransitionHoldUntil()
            ) {
                return;
            }

            storyTransitionCount++;

            if (
                storyTransitionCount >=
                STORY_TRANSITION_HOLD_FRAMES
            ) {
                storyTransitionPhase =
                    "fadeIn";

                storyTransitionCount = 0;
            }

            return;
        }

        if (
            storyTransitionPhase ===
            "fadeIn"
        ) {
            storyTransitionCount++;

            const rate =
                Math.min(
                    1,
                    storyTransitionCount /
                    Math.max(
                        1,
                        STORY_TRANSITION_FADE_FRAMES
                    )
                );

            overlay.opacity =
                Math.round(
                    255 * (1 - rate)
                );

            if (rate >= 1) {
                finishStoryTransition();
            }
        }
    }

    /*
     * ─────────────────────────────
     * 共通ボタン
     * ─────────────────────────────
     */

    class Sprite_StoryButton
        extends Sprite_Clickable {

        constructor(
            width,
            height,
            label,
            onClick
        ) {
            super();

            this._width = width;
            this._height = height;
            this._label = label;
            this._clickHandler =
                onClick;

            this._hovered = false;

            this.bitmap =
                new Bitmap(
                    width,
                    height
                );

            this.refresh();
        }

        refresh() {
            this.bitmap.clear();

            const background =
                this._hovered
                    ? "rgba(75, 65, 90, 0.98)"
                    : "rgba(25, 25, 32, 0.95)";

            this.bitmap.fillRect(
                0,
                0,
                this._width,
                this._height,
                background
            );

            /*
             * 外枠。
             */
            this.bitmap.strokeRect(
                1,
                1,
                this._width - 2,
                this._height - 2,
                "rgba(220, 205, 255, 0.9)",
                2
            );

            this.bitmap.fontSize = 25;
            this.bitmap.textColor =
                "#ffffff";

            this.bitmap.outlineColor =
                "rgba(0, 0, 0, 0.9)";

            this.bitmap.outlineWidth = 4;

            this.bitmap.drawText(
                this._label,
                12,
                0,
                this._width - 24,
                this._height,
                "center"
            );
        }

        onMouseEnter() {
            this._hovered = true;
            this.refresh();
        }

        onMouseExit() {
            this._hovered = false;
            this.refresh();
        }

        onClick() {
            TouchInput.clear();

            if (
                typeof this._clickHandler ===
                "function"
            ) {
                this._clickHandler();
            }
        }
    }
/*
 * ─────────────────────────────
 * ストーリー再生中 EXIT
 * ─────────────────────────────
 */

function closeStoryExitConfirm() {
    const scene =
        getScene();

    if (!scene) {
        return;
    }

    if (scene._denOStoryExitConfirm) {
        scene.removeChild(
            scene._denOStoryExitConfirm
        );

        scene._denOStoryExitConfirm
            .destroy({
                children: true
            });

        scene._denOStoryExitConfirm =
            null;
    }

    storyExitConfirmOpen = false;

    TouchInput.clear();
    Input.clear();
}


function abortCurrentStoryEpisode() {
    const scene =
        getScene();

    if (
        !scene ||
        isStoryTransitioning()
    ) {
        return;
    }

    /*
     * AUTO停止。
     */
    if (
        window.MamiDenOAuto &&
        typeof window.MamiDenOAuto
            .setEnabled ===
            "function"
    ) {
        window.MamiDenOAuto
            .setEnabled(false);
    }

    /*
     * 「はい」を押した瞬間には
     * まだ画面を片付けない。
     *
     * 現在のストーリー画面ごと黒へ落とし、
     * 完全に黒くなってから裏で終了処理する。
     */
    startStoryTransition(
        () => {
            /*
             * 黒画面の裏で確認画面を閉じる。
             */
            closeStoryExitConfirm();

            /*
             * 残りのストーリー本文を破棄。
             */
            if ($gameMessage) {
                $gameMessage.clear();
            }

            /*
             * Window_Message本体は殺さず、
             * 次回使える閉じた待機状態へ戻す。
             */
            const messageWindow =
                scene._messageWindow;

            if (messageWindow) {
                messageWindow.pause = false;
                messageWindow._textState = null;
                messageWindow._waitCount = 0;

                messageWindow._showFast = false;
                messageWindow._lineShowFast = false;

                messageWindow.visible = true;
                messageWindow.openness = 0;

                if (messageWindow.contents) {
                    messageWindow.contents.clear();
                }
            }

            /*
             * ネームプレートも黒画面の裏で消す。
             */
            if (
                window.MamiDenOMessageUI &&
                typeof window.MamiDenOMessageUI
                    .hideNamePlate ===
                    "function"
            ) {
                window.MamiDenOMessageUI
                    .hideNamePlate();
            }

            storyPlaying = false;
            currentEpisode = null;
            currentPageIndex = 0;

            clearAllStoryVisuals();

            const storyScreen =
                scene._denOStoryScreen;

            if (storyScreen) {
                storyScreen._episodeWasBusy =
                    false;

                storyScreen.visible = true;

                storyScreen.showEpisodeList(
                    storyScreen._currentRoute
                );
            }

            TouchInput.clear();
            Input.clear();
        }
    );
}


function openStoryExitConfirm() {
    if (
        storyExitConfirmOpen ||
        !storyPlaying
    ) {
        return;
    }

    const scene =
        getScene();

    if (!scene) {
        return;
    }

    /*
     * 確認中にAUTOで先へ進まないよう停止。
     */
    if (
        window.MamiDenOAuto &&
        typeof window.MamiDenOAuto
            .setEnabled ===
            "function"
    ) {
        window.MamiDenOAuto
            .setEnabled(false);
    }

    storyExitConfirmOpen = true;

    const container =
        new Sprite();

    /*
     * 画面全体を少し暗くする。
     */
    const dimmer =
        new Sprite(
            new Bitmap(
                SCREEN_WIDTH,
                SCREEN_HEIGHT
            )
        );

    dimmer.bitmap.fillRect(
        0,
        0,
        SCREEN_WIDTH,
        SCREEN_HEIGHT,
        "rgba(0, 0, 0, 0.55)"
    );

    container.addChild(
        dimmer
    );

    /*
     * 確認文。
     */
    const textSprite =
        new Sprite(
            new Bitmap(
                640,
                90
            )
        );

    textSprite.x = 320;
    textSprite.y = 260;

    textSprite.bitmap.fontSize = 30;
    textSprite.bitmap.textColor =
        "#ffffff";

    textSprite.bitmap.outlineColor =
        "rgba(0, 0, 0, 0.95)";

    textSprite.bitmap.outlineWidth = 5;

    textSprite.bitmap.drawText(
        "ストーリーを終了しますか？",
        0,
        0,
        640,
        90,
        "center"
    );

    container.addChild(
        textSprite
    );

    /*
     * はい。
     */
    const yesButton =
        new Sprite_StoryButton(
            180,
            58,
            "はい",
            () => {
                abortCurrentStoryEpisode();
            }
        );

    yesButton.x = 430;
    yesButton.y = 380;

    container.addChild(
        yesButton
    );

    /*
     * いいえ。
     */
    const noButton =
        new Sprite_StoryButton(
            180,
            58,
            "いいえ",
            () => {
                closeStoryExitConfirm();
            }
        );

    noButton.x = 670;
    noButton.y = 380;

    container.addChild(
        noButton
    );

    scene._denOStoryExitConfirm =
        container;

    scene.addChild(
        container
    );

    TouchInput.clear();
    Input.clear();
}
class Sprite_StoryExitButton
    extends Sprite_Clickable {

    constructor() {
        super();

        /*
         * 画面上での表示サイズ。
         */
        this._width = 95;
        this._height = 40;

        this._hovered = false;

        /*
         * EXIT画像。
         * img/pictures/btn_story_exit.png
         */
        this.bitmap =
            ImageManager.loadPicture(
                "btn_story_exit"
            );

        /*
         * 拡縮しても中心から
         * ふわっと動くようにする。
         */
        this.anchor.set(
            0.5,
            0.5
        );

        /*
         位置。
         */
        this.x = 1203;
        this.y = 44;

        /*
         * 元画像サイズに関係なく、
         * 150×50へ合わせるための倍率。
         */
        this._baseScaleX = 1;
        this._baseScaleY = 1;

        const applyFit = () => {
            if (
                !this.bitmap ||
                this.bitmap.width <= 0 ||
                this.bitmap.height <= 0
            ) {
                return;
            }

            this._baseScaleX =
                this._width /
                this.bitmap.width;

            this._baseScaleY =
                this._height /
                this.bitmap.height;

            this.scale.set(
                this._baseScaleX,
                this._baseScaleY
            );
        };

        if (this.bitmap.isReady()) {
            applyFit();
        } else {
            this.bitmap.addLoadListener(
                applyFit
            );
        }

        this.visible = false;
    }

    update() {
        super.update();

        /*
         * ストーリー再生中だけ表示。
         */
        this.visible =
            storyPlaying &&
            !storyExitConfirmOpen;

        if (!this.visible) {
            return;
        }

        /*
         * HIDEボタンと同じ感じ。
         *
         * 通常      1.00
         * ホバー    1.05
         * 押下      0.96
         */
        const zoom =
            this.isPressed()
                ? 0.96
                : this._hovered
                    ? 1.05
                    : 1;

        const targetScaleX =
            this._baseScaleX *
            zoom;

        const targetScaleY =
            this._baseScaleY *
            zoom;

        /*
         * ふわっと追従。
         */
        this.scale.x +=
            (
                targetScaleX -
                this.scale.x
            ) * 0.20;

        this.scale.y +=
            (
                targetScaleY -
                this.scale.y
            ) * 0.20;
    }

    onMouseEnter() {
        this._hovered = true;
    }

    onMouseExit() {
        this._hovered = false;
    }

    onClick() {
        if (
            !this.visible ||
            storyExitConfirmOpen
        ) {
            return;
        }

        TouchInput.clear();
        Input.clear();

        openStoryExitConfirm();
    }
}
    /*
     * ─────────────────────────────
     * ルート選択カード
     * ─────────────────────────────
     *
     * 308×438で作成した完成済みパス画像を
     * そのままクリック可能なルートカードとして使う。
     */

    class Sprite_StoryRouteButton
        extends Sprite_Clickable {

        constructor(
            route,
            onClick
        ) {
            super();

            this._route = route;
            this._clickHandler =
                onClick;

            this._hovered = false;
            this._cardReady = false;
            this._cardBaseScale = 1;

            this._style =
                ROUTE_CARD_STYLE[
                    String(route.id || "")
                ] || {
                    image: ""
                };

            /*
             * 透明Bitmapをクリック判定用に持たせる。
             * 実際に見えるカード画像は子Sprite。
             * こうしておくとホバーで画像を拡大しても
             * クリック範囲は288×410のまま安定する。
             */
            this.bitmap =
                new Bitmap(
                    PANEL_WIDTH,
                    PANEL_HEIGHT
                );

            this._cardImage =
                new Sprite();

            this._cardImage.anchor.set(
                0.5,
                0.5
            );

            this._cardImage.x =
                PANEL_WIDTH / 2;

            this._cardImage.y =
                PANEL_HEIGHT / 2;

            this._cardImage.visible = false;

            this.addChild(
                this._cardImage
            );

            this.setupCardImage();
        }

        setupCardImage() {
            const pictureName =
                String(
                    this._style.image || ""
                );

            if (!pictureName) {
                return;
            }

            const bitmap =
                ImageManager.loadPicture(
                    pictureName
                );

            this._cardImage.bitmap = bitmap;

            const fit = () => {
                if (
                    !bitmap ||
                    bitmap.width <= 0 ||
                    bitmap.height <= 0
                ) {
                    return;
                }

                /*
                 * 元画像308×438の縦横比を絶対に崩さず、
                 * 288×410の枠内へ最大サイズで収める。
                 */
                this._cardBaseScale =
                    Math.min(
                        PANEL_WIDTH /
                            bitmap.width,
                        PANEL_HEIGHT /
                            bitmap.height
                    );

                this._cardImage.scale.set(
                    this._cardBaseScale,
                    this._cardBaseScale
                );

                this._cardImage.opacity = 245;
                this._cardImage.visible = true;
                this._cardReady = true;
            };

            if (bitmap.isReady()) {
                fit();
            }
            else {
                bitmap.addLoadListener(
                    fit
                );
            }
        }

        update() {
            super.update();

            if (
                !this._cardImage ||
                !this._cardReady
            ) {
                return;
            }

            const targetScale =
                this._cardBaseScale *
                (
                    this._hovered
                        ? ROUTE_CARD_HOVER_SCALE
                        : 1
                );

            const targetY =
                PANEL_HEIGHT / 2 -
                (
                    this._hovered
                        ? ROUTE_CARD_HOVER_LIFT
                        : 0
                );

            const targetOpacity =
                this._hovered
                    ? 255
                    : 245;

            /*
             * カーソルを乗せた時だけ、
             * パスが少し手前へ浮くように見せる。
             */
            this._cardImage.scale.x +=
                (
                    targetScale -
                    this._cardImage.scale.x
                ) * 0.22;

            this._cardImage.scale.y +=
                (
                    targetScale -
                    this._cardImage.scale.y
                ) * 0.22;

            this._cardImage.y +=
                (
                    targetY -
                    this._cardImage.y
                ) * 0.22;

            this._cardImage.opacity +=
                (
                    targetOpacity -
                    this._cardImage.opacity
                ) * 0.22;
        }

        onMouseEnter() {
            this._hovered = true;
        }

        onMouseExit() {
            this._hovered = false;
        }

        onClick() {
            TouchInput.clear();

            if (
                typeof this._clickHandler ===
                "function"
            ) {
                SoundManager.playOk();

                this._clickHandler(
                    this._route
                );
            }
        }
    }

    /*
     * ─────────────────────────────
     * 話数選択用・画像ボタン
     * ─────────────────────────────
     *
     * 完成済みPNGをそのままクリック可能にする。
     * ホバー差分画像は使わず、JS側で軽く拡大・増光する。
     */
    class Sprite_StoryImageButton
        extends Sprite_Clickable {

        constructor(
            pictureName,
            onClick,
            soundType = "ok"
        ) {
            super();

            this._clickHandler = onClick;
            this._soundType = soundType;
            this._hovered = false;

            this.anchor.set(0.5, 0.5);

            this.bitmap =
                ImageManager.loadPicture(
                    String(pictureName || "")
                );

            this.opacity = 248;
        }

        update() {
            super.update();

            const targetScale =
                this.isPressed()
                    ? EPISODE_BUTTON_PRESS_SCALE
                    : this._hovered
                        ? EPISODE_BUTTON_HOVER_SCALE
                        : 1;

            this.scale.x +=
                (targetScale - this.scale.x) * 0.24;

            this.scale.y +=
                (targetScale - this.scale.y) * 0.24;

            const targetOpacity =
                this._hovered ? 255 : 248;

            this.opacity +=
                (targetOpacity - this.opacity) * 0.24;
        }

        onMouseEnter() {
            this._hovered = true;
        }

        onMouseExit() {
            this._hovered = false;
        }

        playClickSound() {
            if (this._soundType === "cursor") {
                SoundManager.playCursor();
                return;
            }

            if (this._soundType === "cancel") {
                SoundManager.playCancel();
                return;
            }

            if (this._soundType === "none") {
                return;
            }

            SoundManager.playOk();
        }

        onClick() {
            TouchInput.clear();

            if (
                typeof this._clickHandler !==
                "function"
            ) {
                return;
            }

            this.playClickSound();
            this._clickHandler();
        }
    }

    class Sprite_StoryEpisodeButton
        extends Sprite_StoryImageButton {

        constructor(
            routeId,
            episodeIndex,
            episode,
            onClick
        ) {
            const episodeNumber =
                String(episodeIndex + 1)
                    .padStart(2, "0");

            super(
                `ui_episode_${routeId}_${episodeNumber}`,
                () => {
                    if (
                        typeof onClick ===
                        "function"
                    ) {
                        onClick(
                            episodeIndex,
                            episode
                        );
                    }
                },
                "cursor"
            );

            this._episode = episode;
            this._episodeIndex = episodeIndex;
        }
    }

    function stripEpisodeNumberFromTitle(
        title
    ) {
        const source =
            String(title || "");

        const stripped = source.replace(
            /^\s*第\s*[0-9０-９]+\s*話\s*[：:・\-–—]?\s*/u,
            ""
        );

        return stripped.trim() || source.trim();
    }

    function drawFittedText(
        bitmap,
        text,
        width,
        height,
        startSize,
        minSize,
        align = "left"
    ) {
        if (!bitmap) {
            return;
        }

        bitmap.fontSize = startSize;

        while (
            bitmap.fontSize > minSize &&
            bitmap.measureTextWidth(text) > width
        ) {
            bitmap.fontSize--;
        }

        bitmap.drawText(
            text,
            0,
            0,
            width,
            height,
            align
        );
    }

    /*
     * ─────────────────────────────
     * Storyデバッグ開始位置の解決
     * ─────────────────────────────
     *
     * pages内の debugStart: true を探し、
     * そのページより前をデバッグ時だけ省略する。
     *
     * Story専用の実憑依横取り
     * storyPossessionSteal は永続状態なので、
     * マーカーより前に発生していれば
     * 開始時憑依者へ引き継ぐ。
     *
     * pageParticipantsも、マーカー直前の
     * 最後の構成を初期participantsとして引き継ぐ。
     */
    function makeStoryDebugEpisode(
        episode
    ) {
        if (
            !STORY_DEBUG_START_ENABLED ||
            !episode ||
            !Array.isArray(episode.pages) ||
            episode.pages.length === 0
        ) {
            return episode;
        }

        const debugIndices = [];

        episode.pages.forEach(
            (page, index) => {
                if (
                    page &&
                    page.debugStart === true
                ) {
                    debugIndices.push(index);
                }
            }
        );

        if (debugIndices.length === 0) {
            return episode;
        }

        if (debugIndices.length > 1) {
            console.warn(
                `[${pluginName}] debugStart指定が複数あります。最初の1件を使用します。`,
                debugIndices
            );
        }

        const startIndex =
            debugIndices[0];

        /*
         * 冒頭なら切り詰める必要なし。
         */
        if (startIndex <= 0) {
            console.info(
                `[${pluginName}] Story debugStart: 1ページ目から開始`,
                episode.id || episode.title || ""
            );

            return episode;
        }

        /*
         * 元の開始時憑依者を基準に、
         * マーカー以前の実横取りだけ反映する。
         */
        let debugPossessedBy =
            String(
                episode.startPossessedBy ||
                ""
            );

        let debugParticipants =
            Array.isArray(episode.participants)
                ? episode.participants
                : null;

        /*
         * デバッグ開始位置より前で最後にいた背景も
         * 開始時背景として復元する。
         */
        let debugBackground =
            String(
                episode.startBackground ||
                ""
            );

        for (
            let index = 0;
            index < startIndex;
            index++
        ) {
            const page =
                episode.pages[index] || {};

            if (page.storyPossessionSteal) {
                debugPossessedBy =
                    String(
                        page.storyPossessionSteal ||
                        ""
                    );
            }

            if (
                Array.isArray(
                    page.pageParticipants
                )
            ) {
                debugParticipants =
                    page.pageParticipants;
            }

            if (page.storyBackground) {
                debugBackground =
                    String(
                        page.storyBackground ||
                        ""
                    );
            }
            else if (
                page.storyBackgroundClear ===
                true
            ) {
                debugBackground = "";
            }
        }

        const debugEpisode = {
            ...episode,
            pages:
                episode.pages.slice(
                    startIndex
                )
        };

        if (debugPossessedBy) {
            debugEpisode.startPossessedBy =
                debugPossessedBy;
        } else {
            delete debugEpisode
                .startPossessedBy;
        }

        if (debugParticipants) {
            debugEpisode.participants =
                debugParticipants;
        }

        if (debugBackground) {
            debugEpisode.startBackground =
                debugBackground;
        }
        else {
            delete debugEpisode
                .startBackground;
        }

        console.info(
            `[${pluginName}] Story debugStart: ${
                startIndex + 1
            }ページ目から開始`,
            episode.id || episode.title || ""
        );

        return debugEpisode;
    }

    /*
     * ─────────────────────────────
     * ストーリー画面本体
     * ─────────────────────────────
     */
    class Sprite_DenOStoryScreen
        extends Sprite {

        constructor() {
            super();

            this._currentRoute = null;
            this._contentSprites = [];

            this._episodeWasBusy = false;

            /*
             * ルートカード自身のクリック処理中に
             * そのカードを即destroyすると、
             * Sprite_Clickable / PIXI側が同フレーム内で
             * 破棄済みtransformへ触れることがある。
             *
             * 選択したルートは一旦ここへ預け、
             * 子Spriteのupdateが全部終わったあとに
             * 話数一覧へ切り替える。
             */
            this._pendingRouteSelection = null;
            this._pendingReturnToRouteList = false;
            this._pendingCloseStory = false;

            /*
             * 話数選択画面で現在選んでいる駅。
             * 同じルートへ戻ってきた場合はその話数を維持する。
             */
            this._selectedEpisodeRouteId = "";
            this._selectedEpisodeIndex = 0;
            this._episodeSelectedOverlay = null;
            this._episodeNumberSprite = null;
            this._episodeTitleSprite = null;

            this.createBackground();
            this.showRouteList();
        }

        createBackground() {
            /*
             * まず完全不透明の単色を敷く。
             * 背景画像の読み込み前や話数選択画面では
             * これが安全な下地になる。
             */
            this._background =
                new Sprite(
                    new Bitmap(
                        SCREEN_WIDTH,
                        SCREEN_HEIGHT
                    )
                );

            this._background.bitmap
                .fillRect(
                    0,
                    0,
                    SCREEN_WIDTH,
                    SCREEN_HEIGHT,
                    "#101016"
                );

            this.addChild(
                this._background
            );

            /*
             * ルート選択専用の背景画像。
             * 元画像サイズが1280×720でなくても
             * 縦横比を崩さず画面いっぱいに cover する。
             */
            this._routeSelectBackground =
                new Sprite();

            this._routeSelectBackground
                .anchor.set(0.5, 0.5);

            this._routeSelectBackground.x =
                SCREEN_WIDTH / 2;

            this._routeSelectBackground.y =
                SCREEN_HEIGHT / 2;

            this._routeSelectBackground.visible =
                false;

            this.addChild(
                this._routeSelectBackground
            );

            const bitmap =
                ImageManager.loadPicture(
                    ROUTE_SELECT_BACKGROUND
                );

            this._routeSelectBackground.bitmap =
                bitmap;

            const fit = () => {
                if (
                    !bitmap ||
                    bitmap.width <= 0 ||
                    bitmap.height <= 0
                ) {
                    return;
                }

                const scale =
                    Math.max(
                        SCREEN_WIDTH /
                            bitmap.width,
                        SCREEN_HEIGHT /
                            bitmap.height
                    );

                this._routeSelectBackground
                    .scale.set(
                        scale,
                        scale
                    );
            };

            if (bitmap.isReady()) {
                fit();
            }
            else {
                bitmap.addLoadListener(
                    fit
                );
            }

            /*
             * ルートごとの話数選択背景。
             * 実際の画像は showEpisodeList() で差し替える。
             */
            this._episodeSelectBackground =
                new Sprite();

            this._episodeSelectBackground
                .anchor.set(0.5, 0.5);

            this._episodeSelectBackground.x =
                SCREEN_WIDTH / 2;

            this._episodeSelectBackground.y =
                SCREEN_HEIGHT / 2;

            this._episodeSelectBackground.visible =
                false;

            this.addChild(
                this._episodeSelectBackground
            );
        }

        setRouteSelectBackgroundVisible(
            visible
        ) {
            if (this._routeSelectBackground) {
                this._routeSelectBackground.visible =
                    !!visible;
            }
        }

        setEpisodeSelectBackground(
            routeId
        ) {
            const background =
                this._episodeSelectBackground;

            if (!background) {
                return;
            }

            const pictureName =
                `bg_episode_select_${routeId}`;

            /*
             * 別ルートへ切り替える瞬間、
             * 新しいBitmapのデコードが終わるまで
             * Spriteが直前のテクスチャを保持する場合がある。
             *
             * 先に非表示へ落としてから新しいBitmapを渡し、
             * 読み込み完了後にだけ表示することで、
             * モモ→ウラ等で前ルートが一瞬残るのを防ぐ。
             */
            background.visible = false;

            const bitmap =
                ImageManager.loadPicture(
                    pictureName
                );

            background.bitmap = bitmap;

            const reveal = () => {
                if (
                    background.bitmap !== bitmap ||
                    !bitmap ||
                    bitmap.width <= 0 ||
                    bitmap.height <= 0
                ) {
                    return;
                }

                const scale =
                    Math.max(
                        SCREEN_WIDTH / bitmap.width,
                        SCREEN_HEIGHT / bitmap.height
                    );

                background.scale.set(
                    scale,
                    scale
                );

                /*
                 * このBitmapがまだ現在の背景なら表示。
                 * 途中で別ルートへ移動していた場合は出さない。
                 */
                if (
                    background.bitmap === bitmap
                ) {
                    background.visible = true;
                }
            };

            if (bitmap.isReady()) {
                reveal();
            }
            else {
                bitmap.addLoadListener(
                    reveal
                );
            }
        }

        setEpisodeSelectBackgroundVisible(
            visible
        ) {
            if (this._episodeSelectBackground) {
                this._episodeSelectBackground.visible =
                    !!visible;
            }
        }

        clearContent() {
            for (
                const sprite of
                this._contentSprites
            ) {
                this.removeChild(sprite);

                if (sprite.destroy) {
                    sprite.destroy();
                }
            }

            this._contentSprites = [];
        }

        addContent(sprite) {
            this.addChild(sprite);

            this._contentSprites
                .push(sprite);
        }

        createTitle(text) {
            const sprite =
                new Sprite(
                    new Bitmap(
                        SCREEN_WIDTH,
                        80
                    )
                );

            sprite.x = 0;
            sprite.y = 26;

            sprite.bitmap.fontSize = 34;
            sprite.bitmap.textColor =
                "#ffffff";

            sprite.bitmap.outlineColor =
                "rgba(0, 0, 0, 0.95)";

            sprite.bitmap.outlineWidth = 5;

            sprite.bitmap.drawText(
                text,
                0,
                0,
                SCREEN_WIDTH,
                70,
                "center"
            );

            this.addContent(sprite);
        }

        showRouteList() {
            this.clearContent();
            this._currentRoute = null;

            this.setEpisodeSelectBackgroundVisible(
                false
            );

            this.setRouteSelectBackgroundVisible(
                true
            );

            const data =
                window.MamiDenOStoryData;

            if (
                !data ||
                !data.getRoutes
            ) {
                return;
            }

            const allRoutes =
                data.getRoutes();

            /*
             * おまけはStoryDataに残したまま、
             * 現在は4人の本編ルートだけを表示する。
             */
            const routes =
                MAIN_ROUTE_IDS
                    .map(
                        routeId =>
                            allRoutes.find(
                                route =>
                                    String(
                                        route.id || ""
                                    ) === routeId
                            )
                    )
                    .filter(Boolean);

            const totalWidth =
                routes.length *
                    PANEL_WIDTH +
                Math.max(
                    0,
                    routes.length - 1
                ) * ROUTE_CARD_GAP;

            const startX =
                Math.round(
                    (
                        SCREEN_WIDTH -
                        totalWidth
                    ) / 2
                );

            routes.forEach(
                (route, index) => {
                    const button =
                        new Sprite_StoryRouteButton(
                            route,
                            selectedRoute => {
                                /*
                                 * クリックされたカードを
                                 * onClickの最中に破棄しない。
                                 * update末尾で安全に切り替える。
                                 */
                                this._pendingRouteSelection =
                                    selectedRoute;
                            }
                        );

                    button.x =
                        startX +
                        index * (
                            PANEL_WIDTH +
                            ROUTE_CARD_GAP
                        );

                    button.y =
                        ROUTE_CARD_TOP;

                    this.addContent(button);
                }
            );

            /*
             * 通常画面へ戻る。
             * 話数選択画面と同じ画像・同じ座標を使用する。
             */
            const backButton =
                new Sprite_StoryImageButton(
                    "ui_episode_back",
                    () => {
                        /*
                         * クリック中に親画面を即destroyしないよう、
                         * update末尾で安全に閉じる。
                         */
                        this._pendingCloseStory = true;
                    },
                    "cancel"
                );

            backButton.x =
                EPISODE_BACK_POSITION[0];

            backButton.y =
                EPISODE_BACK_POSITION[1];

            this.addContent(backButton);
        }

        showEpisodeList(route) {
            this.clearContent();

            this.setRouteSelectBackgroundVisible(
                false
            );

            const routeId =
                String(
                    route && route.id || ""
                );

            this.setEpisodeSelectBackground(
                routeId
            );

            this._currentRoute = route;

            const episodes =
                route &&
                Array.isArray(route.episodes)
                    ? route.episodes
                    : [];

            /*
             * 別ルートへ移動した時だけ01へ戻す。
             * 本編終了やEXITで同じルートへ戻った時は、
             * 直前に選んでいた話数を維持する。
             */
            if (
                this._selectedEpisodeRouteId !==
                routeId
            ) {
                this._selectedEpisodeRouteId =
                    routeId;

                this._selectedEpisodeIndex = 0;
            }

            if (episodes.length > 0) {
                this._selectedEpisodeIndex =
                    Math.max(
                        0,
                        Math.min(
                            this._selectedEpisodeIndex,
                            episodes.length - 1,
                            EPISODE_NODE_POSITIONS.length - 1
                        )
                    );
            }
            else {
                this._selectedEpisodeIndex = 0;
            }

            /*
             * 01～12の駅ボタン。
             */
            episodes
                .slice(
                    0,
                    EPISODE_NODE_POSITIONS.length
                )
                .forEach(
                    (episode, index) => {
                        const position =
                            EPISODE_NODE_POSITIONS[
                                index
                            ];

                        const button =
                            new Sprite_StoryEpisodeButton(
                                routeId,
                                index,
                                episode,
                                selectedIndex => {
                                    this.selectEpisodeIndex(
                                        selectedIndex
                                    );
                                }
                            );

                        button.x = position[0];
                        button.y = position[1];

                        this.addContent(button);
                    }
                );

            /*
             * 選択中の駅へ重ねる発光枠。
             */
            this._episodeSelectedOverlay =
                new Sprite(
                    ImageManager.loadPicture(
                        `ui_episode_selected_${routeId}`
                    )
                );

            this._episodeSelectedOverlay
                .anchor.set(0.5, 0.5);

            this.addContent(
                this._episodeSelectedOverlay
            );

            /*
             * EPISODE 01。
             */
            this._episodeNumberSprite =
                new Sprite(
                    new Bitmap(
                        EPISODE_NUMBER_RECT.width,
                        EPISODE_NUMBER_RECT.height
                    )
                );

            this._episodeNumberSprite.x =
                EPISODE_NUMBER_RECT.x;

            this._episodeNumberSprite.y =
                EPISODE_NUMBER_RECT.y;

            this.addContent(
                this._episodeNumberSprite
            );

            /*
             * StoryDataから読む各話タイトル。
             */
            this._episodeTitleSprite =
                new Sprite(
                    new Bitmap(
                        EPISODE_TITLE_RECT.width,
                        EPISODE_TITLE_RECT.height
                    )
                );

            this._episodeTitleSprite.x =
                EPISODE_TITLE_RECT.x;

            this._episodeTitleSprite.y =
                EPISODE_TITLE_RECT.y;

            this.addContent(
                this._episodeTitleSprite
            );

            /*
             * 戻る。
             */
            const backButton =
                new Sprite_StoryImageButton(
                    "ui_episode_back",
                    () => {
                        /*
                         * クリック中のSpriteをその場でdestroyせず、
                         * update末尾で安全にルート選択へ戻す。
                         */
                        this._pendingReturnToRouteList =
                            true;
                    },
                    "cancel"
                );

            backButton.x =
                EPISODE_BACK_POSITION[0];

            backButton.y =
                EPISODE_BACK_POSITION[1];

            this.addContent(backButton);

            /*
             * 開始。色はルート別画像。
             */
            const startButton =
                new Sprite_StoryImageButton(
                    `ui_episode_start_${routeId}`,
                    () => {
                        const episode =
                            episodes[
                                this._selectedEpisodeIndex
                            ];

                        if (!episode) {
                            SoundManager.playBuzzer();
                            return;
                        }

                        this.onEpisodeSelected(
                            episode
                        );
                    },
                    "none"
                );

            /*
             * onEpisodeSelected()側でOK音を鳴らすので、
             * ここでは二重再生しない。
             */
            startButton.x =
                EPISODE_START_POSITION[0];

            startButton.y =
                EPISODE_START_POSITION[1];

            this.addContent(startButton);

            this.refreshEpisodeSelection();
        }

        selectEpisodeIndex(
            index
        ) {
            const episodes =
                this._currentRoute &&
                Array.isArray(
                    this._currentRoute.episodes
                )
                    ? this._currentRoute.episodes
                    : [];

            if (
                index < 0 ||
                index >= episodes.length ||
                index >= EPISODE_NODE_POSITIONS.length
            ) {
                return;
            }

            this._selectedEpisodeIndex = index;
            this.refreshEpisodeSelection();
        }

        refreshEpisodeSelection() {
            const route =
                this._currentRoute;

            const episodes =
                route &&
                Array.isArray(route.episodes)
                    ? route.episodes
                    : [];

            const index =
                this._selectedEpisodeIndex;

            const episode =
                episodes[index];

            const position =
                EPISODE_NODE_POSITIONS[index];

            if (
                this._episodeSelectedOverlay &&
                position
            ) {
                this._episodeSelectedOverlay.x =
                    position[0] +
                    EPISODE_SELECTED_OFFSET_X;

                this._episodeSelectedOverlay.y =
                    position[1] +
                    EPISODE_SELECTED_OFFSET_Y;

                this._episodeSelectedOverlay.visible =
                    !!episode;
            }

            if (this._episodeNumberSprite) {
                const bitmap =
                    this._episodeNumberSprite.bitmap;

                bitmap.clear();
                bitmap.fontFace =
                    EPISODE_FONT_FACE;
                bitmap.textColor =
                    "#ffffff";
                bitmap.outlineColor =
                    "rgba(0, 0, 0, 0.92)";
                bitmap.outlineWidth = 2;
                bitmap.fontSize = 30;

                const episodeNumber =
                    String(index + 1)
                        .padStart(2, "0");

                bitmap.drawText(
                    `EPISODE ${episodeNumber}`,
                    0,
                    0,
                    EPISODE_NUMBER_RECT.width,
                    EPISODE_NUMBER_RECT.height,
                    "left"
                );
            }

            if (this._episodeTitleSprite) {
                const bitmap =
                    this._episodeTitleSprite.bitmap;

                bitmap.clear();

                if ($gameSystem) {
                    bitmap.fontFace =
                        $gameSystem.mainFontFace();
                }

                bitmap.textColor =
                    "#ffffff";
                bitmap.outlineColor =
                    "rgba(0, 0, 0, 0.92)";
                bitmap.outlineWidth = 4;

                const title =
                    episode
                        ? stripEpisodeNumberFromTitle(
                            episode.title
                        )
                        : "";

                drawFittedText(
                    bitmap,
                    title,
                    EPISODE_TITLE_RECT.width,
                    EPISODE_TITLE_RECT.height,
                    38,
                    24,
                    "left"
                );
            }
        }

        onEpisodeSelected(
    episode
) {
    if (
        !episode ||
        !episode.pages ||
        episode.pages.length === 0
    ) {
        SoundManager.playBuzzer();
        return;
    }

    SoundManager.playOk();

    this.startEpisode(
        episode
    );
}
startEpisode(
    episode
) {
    if (
        isStoryTransitioning() ||
        !window.MamiDenOTalk ||
        !window.MamiDenOTalk
            .playExternalTalk
    ) {
        if (!isStoryTransitioning()) {
            SoundManager.playBuzzer();
        }

        return;
    }

    const storyScreen =
        this;

    this._episodeWasBusy = false;

    /*
     * debugStartを含め、実際に再生するepisodeを
     * 黒フェード開始前に確定する。
     */
    const playbackEpisode =
        makeStoryDebugEpisode(
            episode
        );

    /*
     * 話数そのものが外背景から始まる場合。
     * 例：第5話 startBackground: "background_town.png"
     *
     * 選択画面を暗くしている間から先読みし、
     * 完全な黒の裏で背景をセットする。
     */
    const startBackgroundName =
        String(
            playbackEpisode.startBackground ||
            ""
        );

    const startBackgroundBitmap =
        startBackgroundName
            ? ImageManager.loadPicture(
                startBackgroundName
                    .replace(/\.png$/i, "")
            )
            : null;

    /*
     * 選択画面はまだ消さない。
     *
     * まず現在の選択画面そのものを
     * 黒へフェードアウトし、
     * 完全に黒くなった裏で
     * ストーリー会話へ切り替える。
     */
    const transitionStarted =
        startStoryTransition(
            () => {
                storyScreen.visible =
                    false;

                storyScreen
                    ._episodeWasBusy =
                    false;

                storyPlaying = true;

                /*
                 * 話数開始時背景は、
                 * 既存の話数開始黒フェードの裏で適用する。
                 *
                 * startBackgroundがなければ食堂車のまま。
                 */
                if (
                    startBackgroundName &&
                    startBackgroundBitmap
                ) {
                    setStoryBackgroundBitmap(
                        startBackgroundBitmap
                    );
                }
                else {
                    clearStoryBackground();
                }

                currentEpisode =
                    playbackEpisode;

                const started =
                    window.MamiDenOTalk
                        .playExternalTalk(
                            playbackEpisode,
                            {
                                restoreAfter:
                                    false
                            }
                        );

                /*
                 * 再生開始に失敗した場合も、
                 * 黒画面の裏で選択画面へ戻す。
                 */
                if (!started) {
                    storyPlaying = false;
                    currentEpisode = null;

                    storyScreen.visible =
                        true;

                    SoundManager.playBuzzer();
                }
            },
            null,
            () => {
                if (!startBackgroundBitmap) {
                    return true;
                }

                return (
                    startBackgroundBitmap
                        .isReady() ||
                    startBackgroundBitmap
                        .isError()
                );
            }
        );

    if (!transitionStarted) {
        SoundManager.playBuzzer();
    }
}
update() {
    /*
     * 先に全子Spriteのクリック処理を完了させる。
     */
    super.update();

    /*
     * そのフレームのクリック処理が終わったあとで
     * ルートカードを片付け、話数一覧へ切り替える。
     *
     * これで複合Spriteのルートカードを押した時に出る
     * "Cannot read property 'position' of null" を回避する。
     */
    if (this._pendingRouteSelection) {
        const selectedRoute =
            this._pendingRouteSelection;

        this._pendingRouteSelection = null;

        this.showEpisodeList(
            selectedRoute
        );

        return;
    }

    if (this._pendingReturnToRouteList) {
        this._pendingReturnToRouteList = false;
        this.showRouteList();
        return;
    }

    if (this._pendingCloseStory) {
        this._pendingCloseStory = false;
        window.MamiDenOStory.close();
    }
}
    }

    /*
     * ─────────────────────────────
     * 画面生成・削除
     * ─────────────────────────────
     */

    function getScene() {
        const scene =
            SceneManager._scene;

        if (
            !scene ||
            !(scene instanceof Scene_Map)
        ) {
            return null;
        }

        return scene;
    }
/*
 * ─────────────────────────────
 * ストーリー専用画像レイヤー
 * ─────────────────────────────
 */

function getStoryScene() {
    const scene =
        SceneManager._scene;

    if (
        !scene ||
        !(scene instanceof Scene_Map)
    ) {
        return null;
    }

    return scene;
}

function createStoryVisualLayers() {
    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._spriteset ||
        !scene._spriteset
            ._pictureContainer
    ) {
        return;
    }

    const spriteset =
        scene._spriteset;

    const pictureContainer =
        spriteset._pictureContainer;

    /*
     * ─────────────────────────────
     * ストーリー背景
     * ─────────────────────────────
     *
     * ピクチャコンテナ内の先頭寄りへ置く。
     *
     * 通常背景より前、
     * 立ち絵より後ろになる。
     */
    if (!scene._denOStoryBackground) {
        const background =
            new Sprite();

        background.x = 0;
        background.y = 0;
        background.visible = false;

        scene._denOStoryBackground =
            background;

        pictureContainer.addChildAt(
            background,
            Math.min(
                1,
                pictureContainer
                    .children.length
            )
        );
    }

/*
 * ─────────────────────────────
 * ストーリースチル
 * ─────────────────────────────
 *
 * 立ち絵より前、
 * WindowLayerより後ろ。
 */
if (!scene._denOStoryStill) {
    const still =
        new Sprite();

    still.x = 0;
    still.y = 0;
    still.visible = false;

    scene._denOStoryStill =
        still;

    const pictureContainerIndex =
        spriteset.getChildIndex(
            pictureContainer
        );

    spriteset.addChildAt(
        still,
        Math.min(
            pictureContainerIndex + 1,
            spriteset.children.length
        )
    );
}

/*
 * クロスフェード用の
 * 2枚目のスチル。
 *
 * 必ずcreateStoryVisualLayers()の
 * 内側で作る。
 */
if (!scene._denOStoryStillNext) {
    const stillNext =
        new Sprite();

    stillNext.x = 0;
    stillNext.y = 0;
    stillNext.visible = false;
    stillNext.opacity = 0;

    scene._denOStoryStillNext =
        stillNext;

    /*
     * 現在スチルのすぐ上へ置く。
     */
    const stillIndex =
        spriteset.getChildIndex(
            scene._denOStoryStill
        );

    spriteset.addChildAt(
        stillNext,
        Math.min(
            stillIndex + 1,
            spriteset.children.length
        )
    );
}
}
function fitStorySpriteToScreen(
    sprite
) {
    if (
        !sprite ||
        !sprite.bitmap ||
        !sprite.bitmap.isReady()
    ) {
        return;
    }

    const bitmapWidth =
        sprite.bitmap.width;

    const bitmapHeight =
        sprite.bitmap.height;

    if (
        bitmapWidth <= 0 ||
        bitmapHeight <= 0
    ) {
        return;
    }

    /*
     * 1920×1080などの高解像度スチルを、
     * 縦横比を崩さず画面いっぱいへ合わせる。
     *
     * 1280×720では約66.67％。
     * 表示キャンバス自体が拡大されれば、
     * 1920×1080相当までは原寸の情報量を活かせる。
     */
    const scale =
        Math.max(
            Graphics.width /
                bitmapWidth,
            Graphics.height /
                bitmapHeight
        );

    sprite.scale.x = scale;
    sprite.scale.y = scale;

    sprite.x =
        (
            Graphics.width -
            bitmapWidth * scale
        ) / 2;

    sprite.y =
        (
            Graphics.height -
            bitmapHeight * scale
        ) / 2;
}

function setStorySpriteImage(
    sprite,
    filename
) {
    if (!sprite || !filename) {
        return;
    }

    const pictureName =
        String(filename)
            .replace(/\.png$/i, "");

    sprite.bitmap =
        ImageManager.loadPicture(
            pictureName
        );

    sprite.visible = true;
    sprite.opacity = 255;

    sprite.bitmap.addLoadListener(
        () => {
            fitStorySpriteToScreen(
                sprite
            );
        }
    );
}

function showStoryBackground(
    filename
) {
    createStoryVisualLayers();

    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._denOStoryBackground
    ) {
        return;
    }

    setStorySpriteImage(
        scene._denOStoryBackground,
        filename
    );
}

function clearStoryBackground() {
    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._denOStoryBackground
    ) {
        return;
    }

    scene._denOStoryBackground
        .visible = false;

    scene._denOStoryBackground
        .bitmap = null;
}

/*
 * すでにロード開始済みのBitmapを、
 * Story背景へそのまま渡す。
 */
function setStoryBackgroundBitmap(
    bitmap
) {
    createStoryVisualLayers();

    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._denOStoryBackground ||
        !bitmap
    ) {
        return false;
    }

    const background =
        scene._denOStoryBackground;

    background.bitmap = bitmap;
    background.visible = true;
    background.opacity = 255;

    bitmap.addLoadListener(
        () => {
            if (background.bitmap === bitmap) {
                fitStorySpriteToScreen(
                    background
                );
            }
        }
    );

    if (bitmap.isReady()) {
        fitStorySpriteToScreen(
            background
        );
    }

    return true;
}

/*
 * 背景変更・時間経過用の黒幕。
 * スチル用黒幕とは別管理にして、
 * 互いの状態を食い合わないようにする。
 */
function ensureStorySceneBlackOverlay() {
    const scene =
        getStoryScene();

    if (!scene) {
        return null;
    }

    let overlay =
        scene._denOStorySceneBlackOverlay;

    if (!overlay) {
        overlay =
            new Sprite(
                new Bitmap(
                    SCREEN_WIDTH,
                    SCREEN_HEIGHT
                )
            );

        overlay.bitmap.fillRect(
            0,
            0,
            SCREEN_WIDTH,
            SCREEN_HEIGHT,
            "#000000"
        );

        overlay.visible = false;
        overlay.opacity = 0;

        scene._denOStorySceneBlackOverlay =
            overlay;
    }

    /*
     * メッセージUIを含めて覆うため最前面。
     */
    scene.addChild(
        overlay
    );

    return overlay;
}

function resetStorySceneBlackOverlay() {
    const scene =
        getStoryScene();

    if (!scene) {
        return;
    }

    const overlay =
        scene._denOStorySceneBlackOverlay;

    if (!overlay) {
        return;
    }

    overlay.visible = false;
    overlay.opacity = 0;
}

function isStorySceneTransitioning() {
    return !!storySceneTransitionState;
}

/*
 * 秒数から、
 *
 * 25％：黒へ
 * 50％：黒を維持
 * 25％：黒から戻る
 *
 * のフレーム数を作る。
 * storyBlackFade: 2 なら合計約2秒。
 */
function makeStorySceneTiming(
    seconds
) {
    const value =
        Number(seconds);

    const normalizedSeconds =
        Number.isFinite(value) &&
        value > 0
            ? Math.max(
                STORY_SCENE_MIN_SECONDS,
                value
            )
            : STORY_SCENE_DEFAULT_SECONDS;

    const totalFrames =
        Math.max(
            3,
            Math.round(
                normalizedSeconds * 60
            )
        );

    const fadeFrames =
        Math.max(
            1,
            Math.floor(
                totalFrames * 0.25
            )
        );

    const holdFrames =
        Math.max(
            0,
            totalFrames -
                fadeFrames * 2
        );

    return {
        fadeFrames: fadeFrames,
        holdFrames: holdFrames
    };
}

/*
 * 背景変更／背景クリア／純粋な時間経過を
 * ひとつの黒フェード機構で扱う。
 */
function startStorySceneTransition(
    options = {}
) {
    if (
        isStorySceneTransitioning() ||
        isStoryStillTransitioning() ||
        isStoryUiBlackFadeTransitioning()
    ) {
        return false;
    }

    const filename =
        String(
            options.filename ||
            ""
        );

    const clearBackground =
        options.clearBackground === true;

    const hasBackgroundAction =
        !!filename || clearBackground;

    const onBlack =
        typeof options.onBlack === "function"
            ? options.onBlack
            : null;

    /*
     * UIを残す黒幕を保持中なら、
     * 新しい黒フェードを重ねない。
     *
     * 今ある黒幕をそのまま目隠しとして使い、
     * 背景・立ち絵・環境光等を裏で切り替えたあと、
     * 同じ黒幕をフェードアウトして次の場面を見せる。
     */
    if (isStoryUiBlackHeld()) {
        const uiState =
            storyUiBlackFadeState;

        const overlay =
            uiState &&
            uiState.overlay
                ? uiState.overlay
                : ensureStoryUiBlackOverlay();

        if (!overlay) {
            return false;
        }

        const timing =
            makeStorySceneTiming(
                options.seconds
            );

        const pictureName =
            filename
                ? filename.replace(
                    /\.png$/i,
                    ""
                )
                : "";

        const bitmap =
            pictureName
                ? ImageManager.loadPicture(
                    pictureName
                )
                : null;

        /*
         * すでに完全な黒なので、
         * onBlack処理はここで即時実行できる。
         */
        if (onBlack) {
            onBlack();
        }

        /*
         * UI黒幕の管理を、
         * 通常の場面転換へ引き渡す。
         * 状態を二重に持たないので、
         * フェード同士が競合しない。
         */
        storyUiBlackFadeState =
            null;

        overlay.visible = true;
        overlay.opacity = 255;

        storySceneTransitionState = {
            phase:
                (
                    filename &&
                    bitmap &&
                    !bitmap.isReady() &&
                    !bitmap.isError()
                )
                    ? "waitBitmap"
                    : "hold",
            frame: 0,
            fadeFrames:
                timing.fadeFrames,
            holdFrames:
                timing.holdFrames,
            filename: filename,
            bitmap: bitmap,
            clearBackground:
                clearBackground,
            hasBackgroundAction:
                hasBackgroundAction,
            onBlack: null,
            onBlackDone: true,
            overlay: overlay,
            usesUiBlackOverlay: true
        };

        if (
            storySceneTransitionState
                .phase === "hold"
        ) {
            if (
                filename &&
                bitmap
            ) {
                setStoryBackgroundBitmap(
                    bitmap
                );
            }
            else if (
                clearBackground
            ) {
                clearStoryBackground();
            }
        }

        TouchInput.clear();
        Input.clear();

        return true;
    }

    /*
     * 話数開始・終了の黒フェード中なら、
     * 背景変更だけはその黒の裏で即時適用する。
     * 純粋な時間経過フェードは既存の黒で代用する。
     */
    if (isStoryTransitioning()) {
        /*
         * すでに黒画面の中にいるので、
         * 場面外で済ませたい処理も即時実行する。
         */
        if (onBlack) {
            onBlack();
        }

        if (filename) {
            showStoryBackground(
                filename
            );
        }
        else if (clearBackground) {
            clearStoryBackground();
        }

        return false;
    }

    const overlay =
        ensureStorySceneBlackOverlay();

    if (!overlay) {
        return false;
    }

    const timing =
        makeStorySceneTiming(
            options.seconds
        );

    const pictureName =
        filename
            ? filename.replace(
                /\.png$/i,
                ""
            )
            : "";

    const bitmap =
        pictureName
            ? ImageManager.loadPicture(
                pictureName
            )
            : null;

    overlay.visible = true;
    overlay.opacity = 0;

    storySceneTransitionState = {
        phase: "fadeToBlack",
        frame: 0,
        fadeFrames:
            timing.fadeFrames,
        holdFrames:
            timing.holdFrames,
        filename: filename,
        bitmap: bitmap,
        clearBackground:
            clearBackground,
        hasBackgroundAction:
            hasBackgroundAction,
        onBlack: onBlack,
        onBlackDone: false,
        overlay: overlay
    };

    TouchInput.clear();
    Input.clear();

    return true;
}

function showStoryBackgroundTransition(
    filename,
    seconds = null,
    onBlack = null
) {
    if (!filename) {
        return false;
    }

    return startStorySceneTransition({
        filename: filename,
        seconds: seconds,
        onBlack: onBlack
    });
}

function clearStoryBackgroundTransition(
    seconds = null,
    onBlack = null
) {
    return startStorySceneTransition({
        clearBackground: true,
        seconds: seconds,
        onBlack: onBlack
    });
}

function startStoryBlackFade(
    seconds,
    onBlack = null
) {
    return startStorySceneTransition({
        seconds: seconds,
        onBlack: onBlack
    });
}

function updateStorySceneTransition() {
    const state =
        storySceneTransitionState;

    if (!state) {
        return;
    }

    const overlay =
        state.overlay;

    if (!overlay) {
        storySceneTransitionState = null;
        return;
    }

    if (state.phase === "fadeToBlack") {
        state.frame++;

        const rate =
            Math.min(
                1,
                state.frame /
                    Math.max(
                        1,
                        state.fadeFrames
                    )
            );

        overlay.visible = true;
        overlay.opacity =
            Math.round(
                255 * rate
            );

        if (rate >= 1) {
            overlay.opacity = 255;
            state.frame = 0;

            /*
             * 完全に黒くなった瞬間だけ実行。
             * 憑依解除など「場面外で済んだこと」を
             * 見せずに反映するためのフック。
             */
            if (
                !state.onBlackDone &&
                typeof state.onBlack ===
                    "function"
            ) {
                state.onBlackDone = true;
                state.onBlack();
            }

            if (
                state.filename &&
                state.bitmap &&
                !state.bitmap.isReady() &&
                !state.bitmap.isError()
            ) {
                state.phase = "waitBitmap";
            }
            else {
                if (
                    state.filename &&
                    state.bitmap
                ) {
                    setStoryBackgroundBitmap(
                        state.bitmap
                    );
                }
                else if (
                    state.clearBackground
                ) {
                    clearStoryBackground();
                }

                state.phase = "hold";
            }
        }

        return;
    }

    if (state.phase === "waitBitmap") {
        overlay.opacity = 255;

        if (
            state.bitmap &&
            !state.bitmap.isReady() &&
            !state.bitmap.isError()
        ) {
            return;
        }

        if (
            state.bitmap &&
            state.bitmap.isReady()
        ) {
            setStoryBackgroundBitmap(
                state.bitmap
            );
        }

        state.phase = "hold";
        state.frame = 0;
        return;
    }

    if (state.phase === "hold") {
        overlay.opacity = 255;
        state.frame++;

        if (
            state.frame >=
                state.holdFrames
        ) {
            state.phase = "fadeFromBlack";
            state.frame = 0;
        }

        return;
    }

    if (state.phase === "fadeFromBlack") {
        state.frame++;

        const rate =
            Math.min(
                1,
                state.frame /
                    Math.max(
                        1,
                        state.fadeFrames
                    )
            );

        overlay.opacity =
            Math.round(
                255 * (1 - rate)
            );

        if (rate >= 1) {
            overlay.opacity = 0;
            overlay.visible = false;

            storySceneTransitionState = null;

            TouchInput.clear();
            Input.clear();
        }
    }
}


/*
 * ─────────────────────────────
 * UIを残す黒フェード
 * ─────────────────────────────
 *
 * レイヤー順：
 *   背景
 *   ↓
 *   立ち絵
 *   ↓
 *   スチル
 *   ↓
 *   この黒幕
 *   ↓
 *   WindowLayer
 *      ├ メッセージウィンドウ
 *      └ ネームプレート
 *
 * そのため、画面内の演出物だけ黒くなり、
 * UIはそのまま表示される。
 */
function ensureStoryUiBlackOverlay() {
    createStoryVisualLayers();

    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._spriteset
    ) {
        return null;
    }

    const spriteset =
        scene._spriteset;

    let overlay =
        scene._denOStoryUiBlackOverlay;

    if (!overlay) {
        overlay =
            new Sprite(
                new Bitmap(
                    SCREEN_WIDTH,
                    SCREEN_HEIGHT
                )
            );

        overlay.bitmap.fillRect(
            0,
            0,
            SCREEN_WIDTH,
            SCREEN_HEIGHT,
            "#000000"
        );

        overlay.visible = false;
        overlay.opacity = 0;

        scene._denOStoryUiBlackOverlay =
            overlay;
    }

    /*
     * スチルより1枚上へ置く。
     *
     * WindowLayerはScene_Map側の別レイヤーなので、
     * ここでspritesetの最前面寄りへ置いても
     * メッセージUIより前には出ない。
     */
    const layerCandidates = [
        scene._denOStoryStill,
        scene._denOStoryStillNext
    ].filter(
        sprite =>
            sprite &&
            sprite.parent === spriteset
    );

    let topIndex = -1;

    for (const sprite of layerCandidates) {
        topIndex =
            Math.max(
                topIndex,
                spriteset.getChildIndex(
                    sprite
                )
            );
    }

    if (topIndex < 0) {
        topIndex =
            spriteset.children.length - 1;
    }

    spriteset.addChildAt(
        overlay,
        Math.min(
            topIndex + 1,
            spriteset.children.length
        )
    );

    return overlay;
}

function resetStoryUiBlackOverlay() {
    const scene =
        getStoryScene();

    if (!scene) {
        return;
    }

    const overlay =
        scene._denOStoryUiBlackOverlay;

    if (!overlay) {
        return;
    }

    overlay.visible = false;
    overlay.opacity = 0;
}

function isStoryUiBlackFadeTransitioning() {
    return !!(
        storyUiBlackFadeState &&
        storyUiBlackFadeState.phase !==
            "held"
    );
}

/*
 * 黒幕が完全に出たまま、
 * 会話を続けられる状態。
 */
function isStoryUiBlackHeld() {
    return !!(
        storyUiBlackFadeState &&
        storyUiBlackFadeState.phase ===
            "held" &&
        storyUiBlackFadeState.overlay &&
        storyUiBlackFadeState.overlay.visible &&
        storyUiBlackFadeState.overlay.opacity >=
            255
    );
}

/*
 * UI残し黒幕は、
 * 指定秒数そのものを
 * 「黒くなるまでの時間」として扱う。
 */
function makeStoryUiBlackFadeFrames(
    seconds
) {
    const value =
        Number(seconds);

    const normalizedSeconds =
        Number.isFinite(value) &&
        value > 0
            ? value
            : 0.5;

    return Math.max(
        1,
        Math.round(
            normalizedSeconds * 60
        )
    );
}

/*
 * UIを残したまま黒くし、
 * 完全に黒くなったらその状態を保持する。
 *
 * 黒くなった時点でWindow_Messageの待機を解除し、
 * 以降のメッセージを黒画面上で進められる。
 */
function startStoryUiBlackFade(
    seconds,
    onBlack = null
) {
    if (
        isStoryUiBlackFadeTransitioning() ||
        isStoryUiBlackHeld() ||
        isStorySceneTransitioning() ||
        isStoryStillTransitioning() ||
        isStoryTransitioning()
    ) {
        return false;
    }

    const overlay =
        ensureStoryUiBlackOverlay();

    if (!overlay) {
        return false;
    }

    overlay.visible = true;
    overlay.opacity = 0;

    storyUiBlackFadeState = {
        phase: "fadeToBlack",
        frame: 0,
        fadeFrames:
            makeStoryUiBlackFadeFrames(
                seconds
            ),
        onBlack:
            typeof onBlack === "function"
                ? onBlack
                : null,
        onBlackDone: false,
        overlay: overlay
    };

    TouchInput.clear();
    Input.clear();

    return true;
}

/*
 * 黒幕だけを解除する。
 *
 * 背景変更を伴わず、
 * 同じ場面へ戻りたい時に使う。
 */
function startStoryUiBlackFadeOut(
    seconds,
    onBlack = null
) {
    if (
        !isStoryUiBlackHeld() ||
        isStorySceneTransitioning() ||
        isStoryStillTransitioning() ||
        isStoryTransitioning()
    ) {
        return false;
    }

    const state =
        storyUiBlackFadeState;

    if (
        typeof onBlack === "function"
    ) {
        onBlack();
    }

    state.phase =
        "fadeFromBlack";
    state.frame = 0;
    state.fadeFrames =
        makeStoryUiBlackFadeFrames(
            seconds
        );

    TouchInput.clear();
    Input.clear();

    return true;
}

function updateStoryUiBlackFade() {
    const state =
        storyUiBlackFadeState;

    if (!state) {
        return;
    }

    const overlay =
        state.overlay;

    if (!overlay) {
        storyUiBlackFadeState =
            null;
        return;
    }

    if (
        state.phase ===
            "fadeToBlack"
    ) {
        state.frame++;

        const rate =
            Math.min(
                1,
                state.frame /
                    Math.max(
                        1,
                        state.fadeFrames
                    )
            );

        overlay.visible = true;
        overlay.opacity =
            Math.round(
                255 * rate
            );

        if (rate >= 1) {
            overlay.opacity = 255;

            /*
             * 完全に黒くなった瞬間だけ、
             * pageParticipantsや距離解除等を
             * 黒幕の裏で実行する。
             */
            if (
                !state.onBlackDone &&
                typeof state.onBlack ===
                    "function"
            ) {
                state.onBlackDone =
                    true;
                state.onBlack();
            }

            /*
             * ここからは「演出中」ではなく
             * 黒画面を保持しているだけ。
             *
             * Window_Messageの待機が解除され、
             * 黒画面のまま会話を続けられる。
             */
            state.phase = "held";

            TouchInput.clear();
            Input.clear();
        }

        return;
    }

    if (state.phase === "held") {
        overlay.visible = true;
        overlay.opacity = 255;
        return;
    }

    if (
        state.phase ===
            "fadeFromBlack"
    ) {
        state.frame++;

        const rate =
            Math.min(
                1,
                state.frame /
                    Math.max(
                        1,
                        state.fadeFrames
                    )
            );

        overlay.opacity =
            Math.round(
                255 * (1 - rate)
            );

        if (rate >= 1) {
            overlay.opacity = 0;
            overlay.visible = false;

            storyUiBlackFadeState =
                null;

            TouchInput.clear();
            Input.clear();
        }
    }
}

function clearStoryUiBlackFade() {
    storyUiBlackFadeState = null;
    resetStoryUiBlackOverlay();
}

function clearStorySceneTransition() {
    storySceneTransitionState = null;
    resetStorySceneBlackOverlay();
}

function showStoryStill(
    filename
) {
    createStoryVisualLayers();

    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._denOStoryStill
    ) {
        return;
    }

    setStorySpriteImage(
        scene._denOStoryStill,
        filename
    );
}
/*
 * スチル出入り専用の黒幕。
 *
 * 話数開始／終了用の黒幕とは分離する。
 * これにより、通常のStoryトランジションと
 * スチル演出が互いに状態を奪わない。
 */
function ensureStoryStillBlackOverlay() {
    const scene =
        getStoryScene();

    if (!scene) {
        return null;
    }

    let overlay =
        scene._denOStoryStillBlackOverlay;

    if (!overlay) {
        overlay =
            new Sprite(
                new Bitmap(
                    SCREEN_WIDTH,
                    SCREEN_HEIGHT
                )
            );

        overlay.bitmap.fillRect(
            0,
            0,
            SCREEN_WIDTH,
            SCREEN_HEIGHT,
            "#000000"
        );

        overlay.visible = false;
        overlay.opacity = 0;

        scene._denOStoryStillBlackOverlay =
            overlay;
    }

    /*
     * メッセージUIも含めて完全に黒くするため、
     * Scene_Mapの最前面へ置く。
     */
    scene.addChild(
        overlay
    );

    return overlay;
}

function resetStoryStillBlackOverlay() {
    const scene =
        getStoryScene();

    if (!scene) {
        return;
    }

    const overlay =
        scene._denOStoryStillBlackOverlay;

    if (!overlay) {
        return;
    }

    overlay.opacity = 0;
    overlay.visible = false;
}

/*
 * 現在スチルと差分用スチルだけを消す。
 * 演出状態そのものは触らない。
 */
function clearStoryStillSprites() {
    const scene =
        getStoryScene();

    if (!scene) {
        return;
    }

    const stills = [
        scene._denOStoryStill,
        scene._denOStoryStillNext
    ];

    stills.forEach(
        still => {
            if (!still) {
                return;
            }

            still.visible = false;
            still.opacity = 255;
            still.bitmap = null;
        }
    );
}

function isStoryStillTransitioning() {
    return !!storyStillTransitionState;
}

/*
 * Storyスチルを表示する。
 *
 * 初回：
 *   立ち絵 → 黒 → スチル
 *
 * 2枚目以降：
 *   現在スチル → 差分クロスフェード
 *
 * 戻り値trueなら演出を開始した。
 */
function showStoryStillTransition(
    filename
) {
    if (
        !filename ||
        isStoryStillTransitioning()
    ) {
        return false;
    }

    createStoryVisualLayers();

    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._denOStoryStill ||
        !scene._denOStoryStillNext
    ) {
        return false;
    }

    const pictureName =
        String(filename)
            .replace(/\.png$/i, "");

    const bitmap =
        ImageManager.loadPicture(
            pictureName
        );

    const current =
        scene._denOStoryStill;

    /*
     * 初回スチル。
     * 完全な黒になるまでCGは表示しない。
     */
    if (
        !current.visible ||
        !current.bitmap
    ) {
        const overlay =
            ensureStoryStillBlackOverlay();

        if (!overlay) {
            return false;
        }

        overlay.visible = true;
        overlay.opacity = 0;

        storyStillTransitionState = {
            type: "enter",
            phase: "fadeToBlack",
            frame: 0,
            bitmap: bitmap,
            current: current,
            overlay: overlay
        };

        TouchInput.clear();
        Input.clear();

        return true;
    }

    /*
     * 差分切り替え。
     *
     * _denOStoryStillは常に土台、
     * _denOStoryStillNextは常に上側として使う。
     * Sprite参照を入れ替えないので、
     * 2回目以降も必ず同じ方向へ重なる。
     */
    const next =
        scene._denOStoryStillNext;

    next.bitmap = bitmap;
    next.visible = false;
    next.opacity = 0;

    bitmap.addLoadListener(
        () => {
            if (next.bitmap === bitmap) {
                fitStorySpriteToScreen(
                    next
                );
            }
        }
    );

    storyStillTransitionState = {
        type: "crossfade",
        phase: "waitBitmap",
        frame: 0,
        bitmap: bitmap,
        current: current,
        next: next
    };

    TouchInput.clear();
    Input.clear();

    return true;
}

/*
 * Storyスチルを閉じる。
 *
 * スチル → 黒 → 立ち絵
 */
function hideStoryStillTransition() {
    if (isStoryStillTransitioning()) {
        return false;
    }

    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._denOStoryStill
    ) {
        return false;
    }

    const current =
        scene._denOStoryStill;

    if (
        !current.visible ||
        !current.bitmap
    ) {
        return false;
    }

    const overlay =
        ensureStoryStillBlackOverlay();

    if (!overlay) {
        return false;
    }

    overlay.visible = true;
    overlay.opacity = 0;

    storyStillTransitionState = {
        type: "exit",
        phase: "fadeToBlack",
        frame: 0,
        current: current,
        overlay: overlay
    };

    TouchInput.clear();
    Input.clear();

    return true;
}

/*
 * 毎フレームのスチル演出更新。
 */
function updateStoryStillTransition() {
    const state =
        storyStillTransitionState;

    if (!state) {
        return;
    }

    /*
     * ─────────────────────────────
     * 差分クロスフェード
     * ─────────────────────────────
     */
    if (state.type === "crossfade") {
        if (state.phase === "waitBitmap") {
            if (
                !state.bitmap ||
                !state.bitmap.isReady()
            ) {
                return;
            }

            fitStorySpriteToScreen(
                state.next
            );

            state.next.visible = true;
            state.next.opacity = 0;

            state.phase = "fade";
            state.frame = 0;

            return;
        }

        if (state.phase === "fade") {
            state.frame++;

            const rate =
                Math.min(
                    1,
                    state.frame /
                        Math.max(
                            1,
                            STORY_STILL_CROSSFADE_FRAMES
                        )
                );

            /*
             * 土台は最後まで100％。
             * 上の差分だけを浮かび上がらせる。
             * 下の立ち絵は透けない。
             */
            state.current.opacity = 255;
            state.next.opacity =
                Math.round(
                    255 * rate
                );

            if (rate >= 1) {
                /*
                 * 同じ画像を土台へ渡してから
                 * 上側を消す。
                 * 見た目は一切変わらないので
                 * 瞬間的な立ち絵露出も起きない。
                 */
                state.current.bitmap =
                    state.next.bitmap;

                state.current.visible = true;
                state.current.opacity = 255;

                fitStorySpriteToScreen(
                    state.current
                );

                state.next.visible = false;
                state.next.opacity = 0;
                state.next.bitmap = null;

                storyStillTransitionState =
                    null;
            }
        }

        return;
    }

    /*
     * ─────────────────────────────
     * 立ち絵 ⇄ スチルの黒フェード
     * ─────────────────────────────
     */
    const overlay =
        state.overlay;

    if (!overlay) {
        storyStillTransitionState = null;
        return;
    }

    if (state.phase === "fadeToBlack") {
        state.frame++;

        const rate =
            Math.min(
                1,
                state.frame /
                    Math.max(
                        1,
                        STORY_STILL_BLACK_FADE_FRAMES
                    )
            );

        overlay.visible = true;
        overlay.opacity =
            Math.round(
                255 * rate
            );

        if (rate >= 1) {
            overlay.opacity = 255;
            state.frame = 0;

            if (state.type === "enter") {
                state.phase = "waitBitmap";
            }
            else {
                /*
                 * 完全な黒の裏でCGを撤去。
                 */
                clearStoryStillSprites();
                state.phase = "hold";
            }
        }

        return;
    }

    if (state.phase === "waitBitmap") {
        if (
            !state.bitmap ||
            !state.bitmap.isReady()
        ) {
            /*
             * 読み込みが遅い場合は
             * 黒のまま待つ。
             */
            overlay.opacity = 255;
            return;
        }

        state.current.bitmap =
            state.bitmap;

        state.current.visible = true;
        state.current.opacity = 255;

        fitStorySpriteToScreen(
            state.current
        );

        state.phase = "hold";
        state.frame = 0;

        return;
    }

    if (state.phase === "hold") {
        overlay.opacity = 255;
        state.frame++;

        if (
            state.frame >=
                STORY_STILL_BLACK_HOLD_FRAMES
        ) {
            state.phase = "fadeFromBlack";
            state.frame = 0;
        }

        return;
    }

    if (state.phase === "fadeFromBlack") {
        state.frame++;

        const rate =
            Math.min(
                1,
                state.frame /
                    Math.max(
                        1,
                        STORY_STILL_BLACK_FADE_FRAMES
                    )
            );

        overlay.opacity =
            Math.round(
                255 * (1 - rate)
            );

        if (rate >= 1) {
            overlay.opacity = 0;
            overlay.visible = false;

            storyStillTransitionState =
                null;

            TouchInput.clear();
            Input.clear();
        }
    }
}

/*
 * 強制終了・話数終了用。
 * スチル演出も含めて即座に完全クリアする。
 */
function clearStoryStill() {
    storyStillTransitionState = null;

    clearStoryStillSprites();
    resetStoryStillBlackOverlay();
}

function clearAllStoryVisuals() {
    clearStorySceneTransition();
    clearStoryUiBlackFade();
    clearStoryBackground();
    clearStoryStill();
}
/*
 * ─────────────────────────────
 * ストーリー会話終了監視
 * ─────────────────────────────
 */
function updateStoryEpisodePlayback() {
    if (
        !storyPlaying ||
        isStoryTransitioning() ||
        isStorySceneTransitioning() ||
        isStoryUiBlackFadeTransitioning() ||
        isStoryStillTransitioning()
    ) {
        return;
    }

    const scene =
        getScene();

    if (
        !scene ||
        !scene._denOStoryScreen
    ) {
        return;
    }

    const storyScreen =
        scene._denOStoryScreen;

    /*
     * 会話が始まったことを記録。
     */
    if (
        $gameMessage &&
        $gameMessage.isBusy()
    ) {
        storyScreen._episodeWasBusy =
            true;

        return;
    }

    /*
     * 一度会話が始まったあと、
     * メッセージが終了したら
     * 黒フェードで話数一覧へ戻す。
     */
    if (
        !storyScreen._episodeWasBusy
    ) {
        return;
    }

    storyScreen._episodeWasBusy =
        false;

    startStoryTransition(
        () => {
            storyPlaying = false;
            currentEpisode = null;
            currentPageIndex = 0;

            /*
             * ストーリー側の画像を
             * 黒画面の裏で片付ける。
             */
            clearAllStoryVisuals();

            storyScreen.visible = true;

            storyScreen.showEpisodeList(
                storyScreen._currentRoute
            );

            TouchInput.clear();
            Input.clear();
        }
    );
}
    function openStoryScreen() {
        if (storyActive) {
            return;
        }

        /*
         * ルート選択中の数秒を使って、
         * 次の話数選択UIをバックグラウンドで先読みする。
         */
        preloadStoryEpisodeUi();

        if (
            $gameMessage &&
            $gameMessage.isBusy()
        ) {
            return;
        }

        const scene =
            getScene();

        if (!scene) {
            return;
        }

        storyActive = true;
        createStoryVisualLayers();
        clearAllStoryVisuals();
/*
 * 通常モードの憑依状態を保存して、
 * ストーリー用に未憑依へリセットする。
 */
if (
    window.MamiDenOTalk &&
    window.MamiDenOTalk
        .createStoryStateSnapshot &&
    window.MamiDenOTalk
        .resetPossessionForStory
) {
    previousTalkStateSnapshot =
        window.MamiDenOTalk
            .createStoryStateSnapshot();

    window.MamiDenOTalk
        .resetPossessionForStory();
}
        /*
 * ストーリー中は
 * メッセージUIを下へ移動する。
 */
if (
    window.MamiDenOMessageUI &&
    window.MamiDenOMessageUI
        .setStoryMode
) {
    window.MamiDenOMessageUI
        .setStoryMode(true);
}

/*
 * ランダム憑依スイッチを
 * 完全に非表示にする。
 */
if (
    scene._randomPossessionButton
) {
    scene._randomPossessionButton
        .visible = false;
}
        /*
 * ランダム憑依乱入を停止する。
 *
 * ストーリーを閉じた時に戻せるよう、
 * 開始前の設定を保存しておく。
 */
if (
    window.MamiDenOTalk &&
    window.MamiDenOTalk
        .isRandomPossessionEnabled &&
    window.MamiDenOTalk
        .setRandomPossessionEnabled
) {
    previousRandomPossessionEnabled =
        window.MamiDenOTalk
            .isRandomPossessionEnabled();

    window.MamiDenOTalk
        .setRandomPossessionEnabled(
            false
        );
}

        /*
         * 通常UIを隠す。
         */
        if (
            window.MamiDenOUI &&
            window.MamiDenOUI
                .hideButtons
        ) {
            window.MamiDenOUI
                .hideButtons();
        }

        /*
         * ストーリー画面を生成。
         */
        scene._denOStoryScreen =
            new Sprite_DenOStoryScreen();

        /*
         * Scene_Mapの最前面へ追加。
         */
        scene.addChild(
            scene._denOStoryScreen
        );
/*
 * 再生中EXITボタン。
 */
scene._denOStoryExitButton =
    new Sprite_StoryExitButton();

scene.addChild(
    scene._denOStoryExitButton
);
        TouchInput.clear();
    }

    function closeStoryScreen() {
    if (!storyActive) {
        return;
    }

    const scene =
        getScene();

    clearAllStoryVisuals();

    if (
        scene &&
        scene._denOStoryScreen
    ) {
            scene.removeChild(
                scene._denOStoryScreen
            );

            scene._denOStoryScreen
                .destroy({
                    children: true
                });

            scene._denOStoryScreen =
                null;
        }

        storyActive = false;
        /*
 * ストーリー中の憑依状態を破棄し、
 * 通常モード開始前の状態へ戻す。
 */
if (
    previousTalkStateSnapshot &&
    window.MamiDenOTalk &&
    window.MamiDenOTalk
        .restoreStoryStateSnapshot
) {
    window.MamiDenOTalk
        .restoreStoryStateSnapshot(
            previousTalkStateSnapshot
        );
}

previousTalkStateSnapshot =
    null;
       /*
 * メッセージUIを
 * 通常位置へ戻す。
 */
if (
    window.MamiDenOMessageUI &&
    window.MamiDenOMessageUI
        .setStoryMode
) {
    window.MamiDenOMessageUI
        .setStoryMode(false);
}

/*
 * ストーリー開始前の
 * ランダム憑依設定へ先に戻す。
 */
if (
    previousRandomPossessionEnabled !==
        null &&
    window.MamiDenOTalk &&
    window.MamiDenOTalk
        .setRandomPossessionEnabled
) {
    window.MamiDenOTalk
        .setRandomPossessionEnabled(
            previousRandomPossessionEnabled
        );
}

/*
 * 状態を戻したあとで、
 * ボタンを再表示して画像も同期する。
 */
if (
    scene &&
    scene._randomPossessionButton
) {
    scene._randomPossessionButton
        .visible = true;

    if (
        scene._randomPossessionButton
            .refresh
    ) {
        scene._randomPossessionButton
            .refresh();
    }
}

previousRandomPossessionEnabled =
    null;
        /*
         * 通常UIを戻す。
         */
                if (
            window.MamiDenOUI &&
            window.MamiDenOUI
                .showButtons
        ) {
            window.MamiDenOUI
                .showButtons();
        }

        /*
         * EXITボタンを削除。
         */
        if (
            scene &&
            scene._denOStoryExitButton
        ) {
            scene.removeChild(
                scene._denOStoryExitButton
            );

            scene._denOStoryExitButton
                .destroy({
                    children: true
                });

            scene._denOStoryExitButton =
                null;
        }

        /*
         * EXIT確認画面が残っていたら削除。
         */
        closeStoryExitConfirm();

        storyExitConfirmOpen = false;

        TouchInput.clear();
        Input.clear();
    }

/*
 * 現在のタップ位置が
 * ストーリーEXITボタン上か判定。
 */
function isTouchOnStoryExitButton() {
    if (!storyPlaying) {
        return false;
    }

    const scene =
        getScene();

    if (
        !scene ||
        !scene._denOStoryExitButton ||
        !scene._denOStoryExitButton.visible
    ) {
        return false;
    }

    const button =
        scene._denOStoryExitButton;

    const x =
        TouchInput.x;

    const y =
        TouchInput.y;

    const halfWidth =
    button._width / 2;

const halfHeight =
    button._height / 2;

return (
    x >= button.x - halfWidth &&
    x <= button.x + halfWidth &&
    y >= button.y - halfHeight &&
    y <= button.y + halfHeight
);
}


/*
 * EXIT関連の操作は、
 * 背後のメッセージ送りに使わせない。
 */
/*
 * 黒フェード中は、
 * 覆いの下にあるボタン類も反応させない。
 */
const _Sprite_Clickable_processTouch_StoryTransition =
    Sprite_Clickable.prototype.processTouch;

Sprite_Clickable.prototype.processTouch =
    function() {
        if (
            isStoryTransitioning() ||
            isStorySceneTransitioning() ||
            isStoryStillTransitioning()
        ) {
            return;
        }

        _Sprite_Clickable_processTouch_StoryTransition
            .call(this);
    };

const _Window_Message_isTriggered_StoryExit =
    Window_Message.prototype.isTriggered;

Window_Message.prototype.isTriggered =
    function() {
        /*
         * 黒フェード中は
         * 背後のメッセージを送らない。
         */
        if (
            isStoryTransitioning() ||
            isStorySceneTransitioning() ||
            isStoryStillTransitioning()
        ) {
            return false;
        }

        /*
         * 確認画面を開いている間。
         */
        if (storyExitConfirmOpen) {
            return false;
        }

        /*
         * EXITボタンそのものを
         * 押した瞬間も止める。
         */
        if (isTouchOnStoryExitButton()) {
            return false;
        }

        return _Window_Message_isTriggered_StoryExit
            .call(this);
    };  
    /*
 * ストーリー選択画面が非表示中でも、
 * マップ側で会話終了を監視する。
 */
const _Scene_Map_update_Story =
    Scene_Map.prototype.update;

Scene_Map.prototype.update =
    function() {
        _Scene_Map_update_Story.call(
            this
        );

        /*
         * 通常更新の後で最前面の黒幕を動かす。
         */
        updateStoryStillTransition();

        updateStorySceneTransition();

        updateStoryUiBlackFade();

        updateStoryTransition();

        updateStoryEpisodePlayback();
    };
    /*
     * マップを離れた場合に
     * 状態を残さない。
     */
    const _Scene_Map_terminate =
        Scene_Map.prototype.terminate;

    Scene_Map.prototype.terminate =
        function() {
            storyActive = false;

            storyTransitionPhase =
                "none";

            storyTransitionCount = 0;
            storyTransitionOnBlack = null;
            storyTransitionOnComplete =
                null;
            storyTransitionHoldUntil = null;

            clearStorySceneTransition();

            clearStoryUiBlackFade();

            storyStillTransitionState = null;
            resetStoryStillBlackOverlay();

            _Scene_Map_terminate.call(
                this
            );
        };

    /*
     * ─────────────────────────────
     * 外部公開
     * ─────────────────────────────
     */

    window.MamiDenOStory =
        window.MamiDenOStory || {};

    window.MamiDenOStory.open =
        function() {
            openStoryScreen();
        };

    window.MamiDenOStory.close =
        function() {
            closeStoryScreen();
        };

    window.MamiDenOStory.isActive =
        function() {
            return storyActive;
        };

    window.MamiDenOStory.isTransitioning =
        function() {
            return isStoryTransitioning();
        };
        window.MamiDenOStory.showBackground =
    function(filename) {
        showStoryBackground(
            filename
        );
    };

window.MamiDenOStory.clearBackground =
    function() {
        clearStoryBackground();
    };

window.MamiDenOStory
    .showBackgroundTransition =
    function(
        filename,
        seconds = null,
        onBlack = null
    ) {
        return showStoryBackgroundTransition(
            filename,
            seconds,
            onBlack
        );
    };

window.MamiDenOStory
    .clearBackgroundTransition =
    function(
        seconds = null,
        onBlack = null
    ) {
        return clearStoryBackgroundTransition(
            seconds,
            onBlack
        );
    };

window.MamiDenOStory
    .startBlackFade =
    function(
        seconds,
        onBlack = null
    ) {
        return startStoryBlackFade(
            seconds,
            onBlack
        );
    };

/*
 * メッセージウィンドウ・ネームプレートを残す
 * UI背面の黒フェード。
 */
window.MamiDenOStory
    .startUiBlackFade =
    function(
        seconds,
        onBlack = null
    ) {
        return startStoryUiBlackFade(
            seconds,
            onBlack
        );
    };

window.MamiDenOStory
    .startUiBlackFadeOut =
    function(
        seconds,
        onBlack = null
    ) {
        return startStoryUiBlackFadeOut(
            seconds,
            onBlack
        );
    };

window.MamiDenOStory
    .isUiBlackFadeTransitioning =
    function() {
        return isStoryUiBlackFadeTransitioning();
    };

window.MamiDenOStory
    .isUiBlackHeld =
    function() {
        return isStoryUiBlackHeld();
    };

window.MamiDenOStory
    .isSceneTransitioning =
    function() {
        return (
            isStorySceneTransitioning() ||
            isStoryUiBlackFadeTransitioning()
        );
    };

window.MamiDenOStory.showStill =
    function(filename) {
        showStoryStill(
            filename
        );
    };
window.MamiDenOStory
    .showStillTransition =
    function(filename) {
        return showStoryStillTransition(
            filename
        );
    };

window.MamiDenOStory
    .hideStillTransition =
    function() {
        return hideStoryStillTransition();
    };

window.MamiDenOStory
    .isStillTransitioning =
    function() {
        return isStoryStillTransitioning();
    };

window.MamiDenOStory.clearStill =
    function() {
        clearStoryStill();
    };

window.MamiDenOStory
    .clearVisuals =
    function() {
        clearAllStoryVisuals();
    };
})();