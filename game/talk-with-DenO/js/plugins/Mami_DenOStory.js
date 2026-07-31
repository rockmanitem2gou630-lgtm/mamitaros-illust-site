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

    const PANEL_WIDTH = 260;
    const PANEL_HEIGHT = 120;

    const EPISODE_WIDTH = 520;
    const EPISODE_HEIGHT = 58;

    let storyActive = false;
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
     * ルート選択パネル
     * ─────────────────────────────
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

            this.bitmap =
                new Bitmap(
                    PANEL_WIDTH,
                    PANEL_HEIGHT
                );

            this.refresh();
        }

        refresh() {
            this.bitmap.clear();

            const background =
                this._hovered
                    ? "rgba(75, 65, 90, 0.98)"
                    : "rgba(22, 22, 29, 0.96)";

            this.bitmap.fillRect(
                0,
                0,
                PANEL_WIDTH,
                PANEL_HEIGHT,
                background
            );

            this.bitmap.strokeRect(
                1,
                1,
                PANEL_WIDTH - 2,
                PANEL_HEIGHT - 2,
                "rgba(220, 205, 255, 0.9)",
                2
            );

            this.bitmap.fontSize = 28;
            this.bitmap.textColor =
                "#ffffff";

            this.bitmap.outlineColor =
                "rgba(0, 0, 0, 0.9)";

            this.bitmap.outlineWidth = 4;

            this.bitmap.drawText(
                this._route.title,
                12,
                18,
                PANEL_WIDTH - 24,
                40,
                "center"
            );

            this.bitmap.fontSize = 17;
            this.bitmap.textColor =
                "#d6d0df";

            this.bitmap.drawText(
                this._route.subtitle || "",
                12,
                67,
                PANEL_WIDTH - 24,
                30,
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
                this._clickHandler(
                    this._route
                );
            }
        }
    }

    /*
     * ─────────────────────────────
     * 話数ボタン
     * ─────────────────────────────
     */

    class Sprite_StoryEpisodeButton
        extends Sprite_Clickable {

        constructor(
            episode,
            onClick
        ) {
            super();

            this._episode = episode;
            this._clickHandler =
                onClick;

            this._hovered = false;

            this.bitmap =
                new Bitmap(
                    EPISODE_WIDTH,
                    EPISODE_HEIGHT
                );

            this.refresh();
        }

        refresh() {
            this.bitmap.clear();

            const background =
                this._hovered
                    ? "rgba(75, 65, 90, 0.98)"
                    : "rgba(22, 22, 29, 0.96)";

            this.bitmap.fillRect(
                0,
                0,
                EPISODE_WIDTH,
                EPISODE_HEIGHT,
                background
            );

            this.bitmap.strokeRect(
                1,
                1,
                EPISODE_WIDTH - 2,
                EPISODE_HEIGHT - 2,
                "rgba(180, 170, 205, 0.9)",
                2
            );

            this.bitmap.fontSize = 21;
            this.bitmap.textColor =
                "#ffffff";

            this.bitmap.outlineColor =
                "rgba(0, 0, 0, 0.9)";

            this.bitmap.outlineWidth = 4;

            this.bitmap.drawText(
                this._episode.title,
                18,
                0,
                EPISODE_WIDTH - 36,
                EPISODE_HEIGHT,
                "left"
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
                this._clickHandler(
                    this._episode
                );
            }
        }
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

            this.createBackground();
            this.showRouteList();
        }

        createBackground() {
            /*
             * 完全不透明の背景。
             *
             * 通常画面の立ち絵や
             * 名前欄を裏側へ隠す。
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

            this.createTitle(
                "STORY"
            );

            const data =
                window.MamiDenOStoryData;

            if (
                !data ||
                !data.getRoutes
            ) {
                return;
            }

            const routes =
                data.getRoutes();

            const positions = [
                { x: 180, y: 145 },
                { x: 510, y: 145 },
                { x: 840, y: 145 },

                { x: 345, y: 315 },
                { x: 675, y: 315 }
            ];

            routes.forEach(
                (route, index) => {
                    const position =
                        positions[index];

                    if (!position) {
                        return;
                    }

                    const button =
                        new Sprite_StoryRouteButton(
                            route,
                            selectedRoute => {
                                this.showEpisodeList(
                                    selectedRoute
                                );
                            }
                        );

                    button.x = position.x;
                    button.y = position.y;

                    this.addContent(button);
                }
            );

            const closeButton =
                new Sprite_StoryButton(
                    190,
                    54,
                    "通常画面へ戻る",
                    () => {
                        window.MamiDenOStory
                            .close();
                    }
                );

            closeButton.x = 1040;
            closeButton.y = 635;

            this.addContent(closeButton);
        }

        showEpisodeList(route) {
            this.clearContent();

            this._currentRoute =
                route;

            this.createTitle(
                route.title
            );

            /*
             * 1ページ6話。
             *
             * 12話になったら、
             * 次の段階でページ切替を追加する。
             */
            const episodes =
                route.episodes.slice(0, 6);

            episodes.forEach(
                (episode, index) => {
                    const column =
                        index % 2;

                    const row =
                        Math.floor(
                            index / 2
                        );

                    const button =
                        new Sprite_StoryEpisodeButton(
                            episode,
                            selectedEpisode => {
                                this.onEpisodeSelected(
                                    selectedEpisode
                                );
                            }
                        );

                    button.x =
                        column === 0
                            ? 90
                            : 670;

                    button.y =
                        135 +
                        row * 82;

                    this.addContent(button);
                }
            );

            const backButton =
                new Sprite_StoryButton(
                    170,
                    54,
                    "ルート選択へ",
                    () => {
                        this.showRouteList();
                    }
                );

            backButton.x = 40;
            backButton.y = 635;

            this.addContent(backButton);

            const closeButton =
                new Sprite_StoryButton(
                    190,
                    54,
                    "通常画面へ戻る",
                    () => {
                        window.MamiDenOStory
                            .close();
                    }
                );

            closeButton.x = 1040;
            closeButton.y = 635;

            this.addContent(closeButton);
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
        !window.MamiDenOTalk ||
        !window.MamiDenOTalk
            .playExternalTalk
    ) {
        SoundManager.playBuzzer();
        return;
    }

    /*
     * ストーリー選択画面を
     * 一時的に隠す。
     *
     * 削除はしないので、
     * 終了後に再表示できる。
     */
    this.visible = false;
    this._episodeWasBusy = false;

    storyPlaying = true;
    currentEpisode = episode;

    const started =
        window.MamiDenOTalk
            .playExternalTalk(
                episode,
                {
                    restoreAfter: false
                }
            );

    if (!started) {
        this.visible = true;

        storyPlaying = false;
        currentEpisode = null;

        SoundManager.playBuzzer();
    }
}
update() {
    super.update();
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
     * ピクチャコンテナの中ではなく、
     * Spriteset内でその直後へ置く。
     *
     * これにより、
     *
     * 立ち絵より前
     * WindowLayerより後ろ
     *
     * になる。
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

    sprite.scale.x =
        Graphics.width /
        bitmapWidth;

    sprite.scale.y =
        Graphics.height /
        bitmapHeight;
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

function clearStoryStill() {
    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._denOStoryStill
    ) {
        return;
    }

    scene._denOStoryStill
        .visible = false;

    scene._denOStoryStill
        .bitmap = null;
}

function clearAllStoryVisuals() {
    clearStoryBackground();
    clearStoryStill();
}
/*
 * ─────────────────────────────
 * ストーリー会話終了監視
 * ─────────────────────────────
 */
function updateStoryEpisodePlayback() {
    if (!storyPlaying) {
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
     * 話数一覧へ戻す。
     */
    if (
        !storyScreen._episodeWasBusy
    ) {
        return;
    }

    storyScreen._episodeWasBusy =
        false;

    storyPlaying = false;
    currentEpisode = null;

    clearAllStoryVisuals();

    storyScreen.visible = true;

    storyScreen.showEpisodeList(
        storyScreen._currentRoute
    );

    TouchInput.clear();
}
    function openStoryScreen() {
        if (storyActive) {
            return;
        }

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
 * ランダム憑依スイッチを
 * 再表示する。
 */
if (
    scene &&
    scene._randomPossessionButton
) {
    scene._randomPossessionButton
        .visible = true;

    /*
     * ON/OFF画像を現在設定に合わせる。
     */
    if (
        scene._randomPossessionButton
            .refresh
    ) {
        scene._randomPossessionButton
            .refresh();
    }
} 
/*
 * ストーリー開始前の
 * ランダム憑依設定へ戻す。
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

        TouchInput.clear();
    }
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

window.MamiDenOStory.showStill =
    function(filename) {
        showStoryStill(
            filename
        );
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