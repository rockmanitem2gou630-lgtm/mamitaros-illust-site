/*:
 * @target MZ
 * @plugindesc 電王会話作品用・UI一時非表示 Ver0.1
 * @author マミタロス
 *
 * @help
 * 右下のボタンから会話用UIを一時的に隠します。
 *
 * 使用画像：img/pictures/btn_ui_hide.png
 * 推奨サイズ：72 × 44 px
 *
 * UI非表示中は、画面クリック・決定・キャンセルで戻ります。
 * 復帰に使った入力では会話を進めません。
 * UIを隠す時はAUTOを停止します。
 * バックログ中とストーリー選択画面ではボタンを表示しません。
 *
 * このプラグインは以下より下に置いてください。
 * Mami_DenOTalk / Mami_DenOUI / Mami_DenOStory
 * Mami_DenOHistory / Mami_DenOAuto
 */

(() => {
    "use strict";

    const HIDE_BUTTON = {
        image: "btn_ui_hide",
        x: 1234,
        y: 688,
        hitWidth: 88,
        hitHeight: 60
    };

    const ANIMATION_FRAMES = 8;

    const STATE = {
        visible: "visible",
        hiding: "hiding",
        hidden: "hidden",
        showing: "showing"
    };

    const NAME_PLATES = {
        ryotaro: "name_ryotaro",
        momotaros: "name_momotaros",
        urataros: "name_urataros",
        kintaros: "name_kintaros",
        ryutaros: "name_ryutaros",
        mio: "name_mio"
    };

    let uiState = STATE.visible;
    let animationCount = 0;
    let targets = [];
    let hiddenNamePlate = null;

    function sceneMap() {
        const scene = SceneManager._scene;
        return scene instanceof Scene_Map ? scene : null;
    }

    function historyOpen() {
        return !!(
            window.MamiDenOHistory &&
            typeof MamiDenOHistory.isOpen === "function" &&
            MamiDenOHistory.isOpen()
        );
    }

    function storyActive() {
        return !!(
            window.MamiDenOStory &&
            typeof MamiDenOStory.isActive === "function" &&
            MamiDenOStory.isActive()
        );
    }

    function storyConversation() {
        if (!storyActive()) return false;
        const scene = sceneMap();
        const screen = scene ? scene._denOStoryScreen : null;
        return !!(screen && screen.visible === false);
    }

    function screenFading() {
        return !!(
            $gameScreen &&
            typeof $gameScreen.brightness === "function" &&
            $gameScreen.brightness() < 255
        );
    }

    function showHideButtonNow() {
        if (
            historyOpen() ||
            screenFading() ||
            SceneManager.isSceneChanging()
        ) {
            return false;
        }

        return storyActive() ? storyConversation() : true;
    }

    function uiBlocked() {
        return uiState !== STATE.visible;
    }

    function uiHidden() {
        return uiState === STATE.hidden;
    }

    function pointOnHideButton(x, y) {
        return (
            Math.abs(x - HIDE_BUTTON.x) <= HIDE_BUTTON.hitWidth / 2 &&
            Math.abs(y - HIDE_BUTTON.y) <= HIDE_BUTTON.hitHeight / 2
        );
    }

    function pointerOnHideButton() {
        const scene = sceneMap();
        const button = scene ? scene._mamiUiHideButton : null;

        return !!(
            button &&
            button.visible &&
            uiState === STATE.visible &&
            pointOnHideButton(TouchInput.x, TouchInput.y)
        );
    }

    function stopAuto() {
        if (
            window.MamiDenOAuto &&
            typeof MamiDenOAuto.setEnabled === "function"
        ) {
            MamiDenOAuto.setEnabled(false);
        }
    }

    function closeMenus(scene) {
        if (!scene) return;

        if (
            scene._characterChangeMenu &&
            typeof scene._characterChangeMenu.close === "function"
        ) {
            scene._characterChangeMenu.close();
        }

        if (
            scene._possessionMenu &&
            typeof scene._possessionMenu.close === "function"
        ) {
            scene._possessionMenu.close();
        }
    }

    function alphaOf(node) {
        return node && typeof node.alpha === "number" ? node.alpha : 1;
    }

    function boundsOf(node) {
        if (!node || typeof node.getBounds !== "function") return null;

        try {
            const b = node.getBounds();
            if (
                b &&
                Number.isFinite(b.x) &&
                Number.isFinite(b.y) &&
                Number.isFinite(b.width) &&
                Number.isFinite(b.height)
            ) {
                return b;
            }
        } catch (error) {
            /* 取得できない時は予備値を使う。 */
        }

        return null;
    }

    function offscreenOffset(node, direction) {
        const b = boundsOf(node);
        if (!b) return direction === "up" ? -120 : 160;

        return direction === "up"
            ? -(b.y + b.height + 16)
            : Graphics.height - b.y + 16;
    }

    function windowLayerOffset(scene) {
        const layer = scene ? scene._windowLayer : null;
        let top = Infinity;

        if (layer && Array.isArray(layer.children)) {
            for (const child of layer.children) {
                if (
                    !child ||
                    child.visible === false ||
                    alphaOf(child) <= 0 ||
                    (
                        typeof child.openness === "number" &&
                        child.openness <= 0
                    )
                ) {
                    continue;
                }

                if (typeof child.y === "number") {
                    top = Math.min(top, child.y);
                }
            }
        }

        if (Number.isFinite(top)) {
            return Graphics.height - top + 20;
        }

        const messageWindow = scene ? scene._messageWindow : null;
        return messageWindow && typeof messageWindow.y === "number"
            ? Graphics.height - messageWindow.y + 20
            : 260;
    }

    function targeted(node) {
        return targets.some(target => target.node === node);
    }

    function targetedAncestor(node) {
        let parent = node ? node.parent : null;

        while (parent) {
            if (targeted(parent)) return true;
            parent = parent.parent;
        }

        return false;
    }

    function addTarget(node, direction, forcedOffset = null) {
        if (!node || targeted(node) || targetedAncestor(node)) return;

        const offset = forcedOffset !== null
            ? forcedOffset
            : offscreenOffset(node, direction);

        targets.push({
            node,
            baseX: Number(node.x || 0),
            baseY: Number(node.y || 0),
            baseAlpha: alphaOf(node),
            hiddenX: Number(node.x || 0),
            hiddenY: Number(node.y || 0) + offset
        });
    }

    function findSpriteByBitmap(root, bitmap) {
        if (!root || !bitmap) return null;
        if (root.bitmap === bitmap) return root;
        if (!Array.isArray(root.children)) return null;

        for (const child of root.children) {
            const found = findSpriteByBitmap(child, bitmap);
            if (found) return found;
        }

        return null;
    }

    function addNamePlate(scene) {
        hiddenNamePlate = null;

        const messageWindow = scene ? scene._messageWindow : null;
        const speaker = String(
            messageWindow && messageWindow._mamiCurrentSpeakerId || ""
        );
        const plateFile = NAME_PLATES[speaker];

        if (!plateFile) return;

        const sprite = findSpriteByBitmap(
            scene,
            ImageManager.loadPicture(plateFile)
        );

        if (sprite) {
            if (!targetedAncestor(sprite)) addTarget(sprite, "down");
            return;
        }

        if (
            window.MamiDenOMessageUI &&
            typeof MamiDenOMessageUI.hideNamePlate === "function"
        ) {
            hiddenNamePlate = plateFile;
            MamiDenOMessageUI.hideNamePlate();
        }
    }

    function restoreNamePlate() {
        if (!hiddenNamePlate) return;

        const plateFile = hiddenNamePlate;
        hiddenNamePlate = null;

        if (!$gameMessage || !$gameMessage.isBusy()) return;

        if (
            window.MamiDenOMessageUI &&
            typeof MamiDenOMessageUI.showNamePlate === "function"
        ) {
            MamiDenOMessageUI.showNamePlate(plateFile);
        }
    }

    function collectTargets(scene) {
        targets = [];

        /*
         * 下側UIは、全員が同じ距離だけ下がるようにする。
         *
         * メッセージ枠とネームプレートはWindowLayerの外側にあり、
         * さらに各自のupdate()で毎フレーム定位置へ戻されるため、
         * 必ず個別の対象として登録する。
         */
        const bottomOffset =
            windowLayerOffset(scene);

        addTarget(
            scene._randomPossessionButton,
            "up"
        );

        addTarget(
            scene._DenOButtonContainer,
            "down",
            bottomOffset
        );

        /*
         * 本文、選択肢などのWindow類。
         */
        addTarget(
            scene._windowLayer,
            "down",
            bottomOffset
        );

        /*
         * 画像式メッセージUIの独立Sprite。
         */
        addTarget(
            scene._mamiMessageFrame,
            "down",
            bottomOffset
        );

        addTarget(
            scene._mamiNamePlate,
            "down",
            bottomOffset
        );

        /*
         * 文末の送りアニメーション。
         */
        addTarget(
            scene._mamiEndMarker,
            "down",
            bottomOffset
        );

        addTarget(
            scene._mamiAutoButton,
            "down",
            bottomOffset
        );

        addTarget(
            scene._dialogueHistoryButton,
            "down",
            bottomOffset
        );

        addTarget(
            scene._mamiUiHideButton,
            "down",
            bottomOffset
        );
    }

    function ease(value) {
        const t = Math.max(0, Math.min(1, value));
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function applyHiddenRate(value) {
        const t = Math.max(0, Math.min(1, value));

        for (const target of targets) {
            const node = target.node;
            if (!node) continue;

            node.x = target.baseX + (target.hiddenX - target.baseX) * t;
            node.y = target.baseY + (target.hiddenY - target.baseY) * t;
            node.alpha = target.baseAlpha * (1 - t);
        }
    }

    function finishHidden() {
        applyHiddenRate(1);
        uiState = STATE.hidden;
        animationCount = 0;

        const scene = sceneMap();
        if (scene && scene._mamiUiHideButton) {
            scene._mamiUiHideButton.visible = false;
        }

        TouchInput.clear();
        Input.clear();
    }

    function finishVisible() {
        applyHiddenRate(0);
        restoreNamePlate();

        uiState = STATE.visible;
        animationCount = 0;
        targets = [];

        TouchInput.clear();
        Input.clear();
    }

    function hideUi() {
        if (uiState !== STATE.visible || historyOpen()) return false;

        const scene = sceneMap();
        if (!scene) return false;

        stopAuto();
        closeMenus(scene);
        collectTargets(scene);

        uiState = STATE.hiding;
        animationCount = 0;

        TouchInput.clear();
        Input.clear();
        return true;
    }

    function showUi() {
        if (uiState !== STATE.hidden) return false;

        uiState = STATE.showing;
        animationCount = 0;

        const scene = sceneMap();
        if (scene && scene._mamiUiHideButton) {
            scene._mamiUiHideButton.visible = true;
        }

        TouchInput.clear();
        Input.clear();
        return true;
    }

    function forceShowUi() {
        if (uiState === STATE.visible) return;

        applyHiddenRate(0);
        restoreNamePlate();

        uiState = STATE.visible;
        animationCount = 0;
        targets = [];
    }

    function updateAnimation() {
        if (uiState !== STATE.hiding && uiState !== STATE.showing) return;

        animationCount++;

        const raw = Math.min(
            1,
            animationCount / Math.max(1, ANIMATION_FRAMES)
        );
        const rate = ease(raw);

        if (uiState === STATE.hiding) {
            applyHiddenRate(rate);
            if (raw >= 1) finishHidden();
        } else {
            applyHiddenRate(1 - rate);
            if (raw >= 1) finishVisible();
        }
    }

    function restoreTriggered() {
        return !!(
            TouchInput.isTriggered() ||
            Input.isTriggered("ok") ||
            Input.isTriggered("cancel")
        );
    }

    function updateRestoreInput() {
        if (!uiHidden() || !restoreTriggered()) return;

        showUi();
        TouchInput.clear();
        Input.clear();
    }

    class Sprite_DenOHideUiButton extends Sprite_Clickable {
        constructor() {
            super();

            this._hovered = false;
            this.bitmap = ImageManager.loadPicture(HIDE_BUTTON.image);

            this.anchor.set(0.5, 0.5);
            this.position.set(HIDE_BUTTON.x, HIDE_BUTTON.y);
            this.scale.set(1, 1);

            this.opacity = 255;
            this.visible = false;
        }

        hitTest(x, y) {
            return (
                Math.abs(x) <= HIDE_BUTTON.hitWidth / 2 &&
                Math.abs(y) <= HIDE_BUTTON.hitHeight / 2
            );
        }

        update() {
            super.update();

            if (uiState === STATE.visible) {
                this.visible = showHideButtonNow();
            } else if (uiState === STATE.hidden) {
                this.visible = false;
            } else {
                this.visible = true;
            }

            if (!this.visible) return;

            const targetScale = this.isPressed()
                ? 0.96
                : this._hovered
                    ? 1.06
                    : 1;

            this.scale.x += (targetScale - this.scale.x) * 0.20;
            this.scale.y += (targetScale - this.scale.y) * 0.20;
        }

        onMouseEnter() {
            this._hovered = true;
        }

        onMouseExit() {
            this._hovered = false;
        }

        onClick() {
            if (!this.visible || uiState !== STATE.visible) return;

            hideUi();
            TouchInput.clear();
            Input.clear();
        }
    }

    /* 非表示中は他のクリック可能Spriteを押させない。 */
    const _Sprite_Clickable_processTouch =
        Sprite_Clickable.prototype.processTouch;

    Sprite_Clickable.prototype.processTouch = function() {
        if (uiBlocked()) return;
        _Sprite_Clickable_processTouch.call(this);
    };

    /* 非表示中は文字描画もページ送りも停止する。 */
    const _Window_Message_updateWait =
        Window_Message.prototype.updateWait;

    Window_Message.prototype.updateWait = function() {
        return uiBlocked()
            ? true
            : _Window_Message_updateWait.call(this);
    };

    /* 格納ボタンを押したクリックで会話を進めない。 */
    const _Window_Message_isTriggered =
        Window_Message.prototype.isTriggered;

    Window_Message.prototype.isTriggered = function() {
        if (uiBlocked() || pointerOnHideButton()) return false;
        return _Window_Message_isTriggered.call(this);
    };

    const _Scene_Map_processMapTouch =
        Scene_Map.prototype.processMapTouch;

    Scene_Map.prototype.processMapTouch = function() {
        if (uiBlocked() || pointerOnHideButton()) return;
        _Scene_Map_processMapTouch.call(this);
    };

    const _Scene_Map_isMenuCalled =
        Scene_Map.prototype.isMenuCalled;

    Scene_Map.prototype.isMenuCalled = function() {
        return uiBlocked() ? false : _Scene_Map_isMenuCalled.call(this);
    };

    const _Scene_Map_update = Scene_Map.prototype.update;

    Scene_Map.prototype.update = function() {
        /*
         * 先に通常更新を完了させる。
         * メッセージ枠やネームプレートは、この中で定位置へ戻る。
         */
        _Scene_Map_update.call(this);

        /*
         * その後で退避座標を適用することで、
         * UI側の固定座標処理より必ず後勝ちする。
         */
        updateAnimation();

        /*
         * アニメ完了後も、独立Spriteは毎フレーム定位置へ戻ろうとする。
         * hidden中は退避位置を毎フレーム再適用して固定する。
         */
        if (uiState === STATE.hidden) {
            applyHiddenRate(1);
        }

        updateRestoreInput();
    };

    const _Scene_Boot_loadSystemImages =
        Scene_Boot.prototype.loadSystemImages;

    Scene_Boot.prototype.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);
        ImageManager.loadPicture(HIDE_BUTTON.image);
    };

    const _Scene_Map_createDisplayObjects =
        Scene_Map.prototype.createDisplayObjects;

    Scene_Map.prototype.createDisplayObjects = function() {
        _Scene_Map_createDisplayObjects.call(this);

        this._mamiUiHideButton = new Sprite_DenOHideUiButton();
        this.addChild(this._mamiUiHideButton);
    };

    const _Scene_Map_terminate = Scene_Map.prototype.terminate;

    Scene_Map.prototype.terminate = function() {
        forceShowUi();
        _Scene_Map_terminate.call(this);
    };

    window.MamiDenOHideUI = window.MamiDenOHideUI || {};
    MamiDenOHideUI.hide = hideUi;
    MamiDenOHideUI.show = showUi;
    MamiDenOHideUI.isHidden = uiHidden;
    MamiDenOHideUI.isAnimating = function() {
        return uiState === STATE.hiding || uiState === STATE.showing;
    };
})();