/*:
 * @target MZ
 * @plugindesc 電王会話作品用・AUTO送り Ver0.1
 * @author マミタロス
 *
 * @help
 * 会話を自動で送るAUTOボタンを追加します。
 *
 * 使用画像：
 * img/pictures/btn_auto_off.png
 * img/pictures/btn_auto_on.png
 *
 * btn_auto_off.png
 * btn_auto_on.png 
 *
 * このプラグインは、
 * Mami_DenOTalk / Mami_DenOUI /
 * Mami_DenOStory / Mami_DenOHistory
 * より下に置いてください。
 */

(() => {
    "use strict";

    const AUTO_BUTTON = {
    imageOff: "btn_auto_off",
    imageOn: "btn_auto_on",

    x: 1045,
    y: 472,

    hitWidth: 120,
    hitHeight: 70
};

    /*
     * 描画終了後、
     * 次ページへ進むまで。
     */
    const PAGE_WAIT_FRAMES = 30;

    /*
     * 会話終了後、
     * 次の「話す」まで。
     */
    const TALK_WAIT_FRAMES = 45;

    /*
     * 下の「話す」と同じ
     * コモンイベント。
     */
    const TALK_COMMON_EVENT_ID = 1;

    let autoEnabled = false;
    let messageWasBusy = false;
    let waitingForNextTalk = false;
    let nextTalkWait = 0;

    function isHistoryOpen() {
        return !!(
            window.MamiDenOHistory &&
            typeof window.MamiDenOHistory
                .isOpen ===
                "function" &&
            window.MamiDenOHistory
                .isOpen()
        );
    }

    function isStoryActive() {
        return !!(
            window.MamiDenOStory &&
            typeof window.MamiDenOStory
                .isActive ===
                "function" &&
            window.MamiDenOStory
                .isActive()
        );
    }

    function hasChoiceInput() {
        return !!(
            $gameMessage &&
            (
                $gameMessage.isChoice() ||
                $gameMessage.isNumberInput() ||
                $gameMessage.isItemChoice()
            )
        );
    }

    function isScreenFading() {
        return !!(
            $gameScreen &&
            typeof $gameScreen
                .brightness ===
                "function" &&
            $gameScreen.brightness() < 255
        );
    }

    /*
     * ページ送りを一時停止する条件。
     */
    function shouldPausePageAuto() {
        return !!(
            isHistoryOpen() ||
            hasChoiceInput() ||
            isScreenFading() ||
            SceneManager.isSceneChanging()
        );
    }

    /*
     * 次のランダム会話を
     * 開始できる状態か確認する。
     */
    function canStartNextRandomTalk() {
        if (
            !autoEnabled ||
            isHistoryOpen() ||
            isStoryActive() ||
            !$gameMessage ||
            $gameMessage.isBusy() ||
            isScreenFading() ||
            SceneManager.isSceneChanging()
        ) {
            return false;
        }

        if (
            $gameMap &&
            $gameMap.isEventRunning()
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
            window.MamiDenOTalk &&
            typeof window.MamiDenOTalk
                .isInteractionLocked ===
                "function" &&
            window.MamiDenOTalk
                .isInteractionLocked()
        ) {
            return false;
        }

        return true;
    }

    function refreshAutoButton() {
        const scene =
            SceneManager._scene;

        if (
            scene &&
            scene._mamiAutoButton &&
            typeof scene
                ._mamiAutoButton
                .refresh ===
                "function"
        ) {
            scene
                ._mamiAutoButton
                .refresh();
        }
    }

    function setAutoEnabled(enabled) {
        autoEnabled =
            !!enabled;

        /*
         * STOPした時点で、
         * 次の会話予約も取り消す。
         */
        if (!autoEnabled) {
            messageWasBusy =
                false;

            waitingForNextTalk =
                false;

            nextTalkWait = 0;
        }

        refreshAutoButton();

        return autoEnabled;
    }

    function toggleAuto() {
        return setAutoEnabled(
            !autoEnabled
        );
    }

    /*
     * ─────────────────────────────
     * AUTOボタン
     * ─────────────────────────────
     */
    class Sprite_DenOAutoButton
        extends Sprite_Clickable {

        constructor() {
            super();

            this._hovered =
                false;

            this._offBitmap =
                ImageManager.loadPicture(
                    AUTO_BUTTON.imageOff
                );

            this._onBitmap =
                ImageManager.loadPicture(
                    AUTO_BUTTON.imageOn
                );

            this.anchor.set(
                0.5,
                0.5
            );

            this.position.set(
                AUTO_BUTTON.x,
                AUTO_BUTTON.y
            );

            this.scale.set(
                1,
                1
            );

            this.opacity = 255;
            this.visible = false;

            this.refresh();
        }

        refresh() {
            /*
             * OFF中はAUTO画像。
             * ON中はSTOP画像。
             */
            this.bitmap =
                autoEnabled
                    ? this._onBitmap
                    : this._offBitmap;
        }

        hitTest(x, y) {
            return (
                Math.abs(x) <=
                    AUTO_BUTTON
                        .hitWidth / 2 &&
                Math.abs(y) <=
                    AUTO_BUTTON
                        .hitHeight / 2
            );
        }

        update() {
            super.update();

            /*
             * OFF中は会話中だけ表示。
             *
             * ON中は会話と会話の間も
             * 表示してSTOP可能にする。
             */
            /*
            * バックログボタンと同じく、
            * メッセージウィンドウ表示中だけ出す。
            *
            * AUTO中でも会話と会話の間は隠れるが、
            * AUTOそのものは継続する。
            */
           this.visible =
               !isHistoryOpen() &&
               !!(
                   $gameMessage &&
                   $gameMessage.isBusy()
               );

            if (!this.visible) {
                return;
            }

            const targetScale =
                this.isPressed()
                    ? 0.97
                    : this._hovered
                        ? 1.05
                        : 1;

            this.scale.x +=
                (
                    targetScale -
                    this.scale.x
                ) *
                0.20;

            this.scale.y +=
                (
                    targetScale -
                    this.scale.y
                ) *
                0.20;
        }

        onMouseEnter() {
            this._hovered =
                true;
        }

        onMouseExit() {
            this._hovered =
                false;
        }

        onClick() {
            if (!this.visible) {
                return;
            }

            toggleAuto();
            this.refresh();

            /*
             * このタップを
             * 会話送りにしない。
             */
            TouchInput.clear();
        }
    }

    function pointOnAutoButton(
        x,
        y
    ) {
        return (
            Math.abs(
                x - AUTO_BUTTON.x
            ) <=
                AUTO_BUTTON
                    .hitWidth / 2 &&
            Math.abs(
                y - AUTO_BUTTON.y
            ) <=
                AUTO_BUTTON
                    .hitHeight / 2
        );
    }

    function protectAutoButtonTouch() {
        const scene =
            SceneManager._scene;

        const button =
            scene
                ? scene
                    ._mamiAutoButton
                : null;

        return !!(
            button &&
            button.visible &&
            pointOnAutoButton(
                TouchInput.x,
                TouchInput.y
            )
        );
    }

    /*
     * ─────────────────────────────
     * メッセージ自動送り
     * ─────────────────────────────
     */
    function resetWindowAutoWait(
        messageWindow
    ) {
        messageWindow
            ._mamiAutoWaiting =
            false;

        messageWindow
            ._mamiAutoWait =
            PAGE_WAIT_FRAMES;
    }

    const _Window_Message_updateInput =
        Window_Message.prototype
            .updateInput;

    Window_Message.prototype
        .updateInput =
        function() {
            /*
             * AUTOを使わない場面は
             * 元の処理へ渡す。
             */
            if (
                !autoEnabled ||
                !this.pause ||
                shouldPausePageAuto() ||
                this.isAnySubWindowActive()
            ) {
                if (!this.pause) {
                    resetWindowAutoWait(
                        this
                    );
                }

                return _Window_Message_updateInput
                    .call(this);
            }

            /*
             * 手動送りは
             * AUTO待ちより優先する。
             */
            if (this.isTriggered()) {
                resetWindowAutoWait(
                    this
                );

                return _Window_Message_updateInput
                    .call(this);
            }

            if (
                !this
                    ._mamiAutoWaiting
            ) {
                this._mamiAutoWaiting =
                    true;

                this._mamiAutoWait =
                    PAGE_WAIT_FRAMES;
            }

            if (
                this._mamiAutoWait >
                0
            ) {
                this._mamiAutoWait--;
                return true;
            }

            /*
             * 標準のクリック送りと
             * 同じ状態へ進める。
             */
            this.pause = false;

            if (!this._textState) {
                this.terminateMessage();
            }

            resetWindowAutoWait(
                this
            );

            return true;
        };

    /*
     * AUTOボタンを押したタップで
     * 会話が進まないようにする。
     */
    const _Window_Message_isTriggered =
        Window_Message.prototype
            .isTriggered;

    Window_Message.prototype
        .isTriggered =
        function() {
            if (
                protectAutoButtonTouch() &&
                (
                    TouchInput
                        .isTriggered() ||
                    TouchInput
                        .isRepeated()
                )
            ) {
                return false;
            }

            return _Window_Message_isTriggered
                .call(this);
        };

    /*
     * ─────────────────────────────
     * ランダム会話の連続再生
     * ─────────────────────────────
     */
    function updateAutoTalkLoop() {
        if (
            !autoEnabled ||
            isHistoryOpen()
        ) {
            return;
        }

        const busy =
            !!(
                $gameMessage &&
                $gameMessage.isBusy()
            );

        if (busy) {
            messageWasBusy =
                true;

            waitingForNextTalk =
                false;

            nextTalkWait = 0;

            return;
        }

        /*
         * 直前まで会話中だったが、
         * 現在は終了している。
         */
        if (messageWasBusy) {
            messageWasBusy =
                false;

            /*
             * ストーリーでは
             * 次のランダム会話を始めない。
             *
             * 一話終了時にAUTOも終了。
             */
            if (isStoryActive()) {
                setAutoEnabled(
                    false
                );

                return;
            }

            waitingForNextTalk =
                true;

            nextTalkWait =
                TALK_WAIT_FRAMES;
        }

        if (!waitingForNextTalk) {
            return;
        }

        /*
         * 暗転、憑依演出、
         * コモンイベント終了待ち中は
         * カウントを止める。
         */
        if (
            !canStartNextRandomTalk()
        ) {
            return;
        }

        if (nextTalkWait > 0) {
            nextTalkWait--;
            return;
        }

        /*
         * 下の「話す」と同じ
         * コモンイベントを予約。
         */
        $gameTemp.reserveCommonEvent(
            TALK_COMMON_EVENT_ID
        );

        waitingForNextTalk =
            false;

        nextTalkWait = 0;
    }

    const _Scene_Map_update =
        Scene_Map.prototype.update;

    Scene_Map.prototype.update =
        function() {
            _Scene_Map_update
                .call(this);

            updateAutoTalkLoop();
        };

    /*
     * ─────────────────────────────
     * 画像先読み
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
                AUTO_BUTTON.imageOff
            );

            ImageManager.loadPicture(
                AUTO_BUTTON.imageOn
            );
        };

    /*
     * ─────────────────────────────
     * マップ画面へボタン追加
     * ─────────────────────────────
     */
    const _Scene_Map_createDisplayObjects =
        Scene_Map.prototype
            .createDisplayObjects;

    Scene_Map.prototype
        .createDisplayObjects =
        function() {
            _Scene_Map_createDisplayObjects
                .call(this);

            this._mamiAutoButton =
                new Sprite_DenOAutoButton();

            this.addChild(
                this._mamiAutoButton
            );
        };

    /*
     * マップを離れたら
     * AUTOを解除する。
     */
    const _Scene_Map_terminate =
        Scene_Map.prototype.terminate;

    Scene_Map.prototype.terminate =
        function() {
            setAutoEnabled(false);

            _Scene_Map_terminate
                .call(this);
        };

    /*
     * ─────────────────────────────
     * 外部確認用
     * ─────────────────────────────
     */
    window.MamiDenOAuto =
        window.MamiDenOAuto || {};

    window.MamiDenOAuto.isEnabled =
        function() {
            return autoEnabled;
        };

    window.MamiDenOAuto.setEnabled =
        function(enabled) {
            return setAutoEnabled(
                enabled
            );
        };

    window.MamiDenOAuto.toggle =
        function() {
            return toggleAuto();
        };
})();