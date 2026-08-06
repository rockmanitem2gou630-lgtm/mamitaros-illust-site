/*:
 * @target MZ
 * @plugindesc 電王会話作品専用UI Ver2.0
 * @author マミタロス
 *
 * @param DisabledOpacity
 * @text 無効時の不透明度
 * @type number
 * @min 0
 * @max 255
 * @default 120
 *
 * @param HoverScale
 * @text ホバー時の拡大率
 * @desc 1.05で105％になります。
 * @type number
 * @decimals 2
 * @min 1.00
 * @default 1.05
 *
 * @param PressedScale
 * @text 押下時の拡大率
 * @desc 0.97で97％になります。
 * @type number
 * @decimals 2
 * @min 0.50
 * @max 1.00
 * @default 0.97
 *
 * @param AnimationSpeed
 * @text アニメーション速度
 * @type number
 * @decimals 2
 * @min 0.01
 * @max 1.00
 * @default 0.20
 *
 * @command EnableButtons
 * @text ボタンを有効化
 * @desc 手動でボタン操作を有効にします。
 *
 * @command DisableButtons
 * @text ボタンを無効化
 * @desc 手動でボタン操作を無効にします。
 *
 * @command ShowButtons
 * @text ボタンを表示
 *
 * @command HideButtons
 * @text ボタンを非表示
 *
 * @help
 * 電王会話作品用の専用ボタンUIです。
 *
 * ・会話中は自動的にボタン操作を無効化します。
 * ・会話終了後は自動的に再び操作できます。
 * ・ホバー時に少し拡大します。
 * ・押下中は少し沈みます。
 *
 * 使用画像：
 * img/pictures/btn_talk.png
 * img/pictures/btn_season.png
 * img/pictures/btn_honmaru.png
 * img/pictures/btn_leave.png
 *
 * ボタンはピクチャではなく専用Spriteとして表示されます。
 * ButtonPicture.jsは不要です。
 */

(() => {
    "use strict";

    const pluginName = "Mami_DenOUI";
    const params = PluginManager.parameters(pluginName);

    const disabledOpacity = Number(params.DisabledOpacity || 120);
    const hoverScale = Number(params.HoverScale || 1.05);
    const pressedScale = Number(params.PressedScale || 0.97);
    const animationSpeed = Number(params.AnimationSpeed || 0.20);

    /*
     * ─────────────────────────────
     * ボタン設定
     * ─────────────────────────────
     *
     * image:
     *   img/pictures内の画像名。拡張子不要。
     *
     * x / y:
     *   ボタン画像の中心座標。
     *
     * commonEventId:
     *   押した時に呼び出すコモンイベント番号。
     */

const BUTTON_DATA = [
    {
        id: "talk",
        image: "btn_talk",
        x: 280,
        y: 665,
        commonEventId: 1
    },
    {
        id: "possess",
        image: "btn_possess",
        x: 520,
        y: 665,
        action: "possession"
    },
    {
        id: "characterChange",
        image: "btn_character_change",
        x: 760,
        y: 665,
        action: "characterChange"
    },
    {
        id: "story",
        image: "btn_story",
        x: 1000,
        y: 665,
        action: "story"
    }
];

const CHARACTER_CHANGE_ITEMS = [
    {
        label: "良太郎",
        speaker: "ryotaro",
        expression:
            "portrait_ryotaro_base_ryotaro_normal"
    },
    {
        label: "モモタロス",
        speaker: "momotaros",
        expression:
            "portrait_momotaros_base_default_normal"
    },
    {
        label: "ウラタロス",
        speaker: "urataros",
        expression:
            "portrait_urataros_base_default_normal"
    },
    {
        label: "キンタロス",
        speaker: "kintaros",
        expression:
            "portrait_kintaros_base_default_normal"
    },
    {
        label: "リュウタロス",
        speaker: "ryutaros",
        expression:
            "portrait_ryutaros_base_default_normal"
    }
];

    let manuallyEnabled = true;
    let buttonsVisible = true;
    /*
 * ─────────────────────────────
 * ストーリーデバッグ公開設定
 * ─────────────────────────────
 *
 * テストプレイ中は自動で有効。
 *
 * ブラウザ上ではlocalStorageで
 * 手動切替できる。
 */
const STORY_DEBUG_STORAGE_KEY =
    "MamiDenOStoryDebug";

function isStoryDebugEnabled() {
    /*
     * RPGツクールからの
     * テストプレイ中。
     */
    if (
        Utils &&
        Utils.isOptionValid &&
        Utils.isOptionValid("test")
    ) {
        return true;
    }

    /*
     * ブラウザ作業環境での
     * 手動デバッグ設定。
     */
    try {
        return (
            localStorage.getItem(
                STORY_DEBUG_STORAGE_KEY
            ) === "1"
        );
    } catch (error) {
        return false;
    }
}

    function areButtonsEnabled() {
    if (!manuallyEnabled) {
        return false;
    }

    /*
     * Talkプラグイン側の
     * 独自演出中も操作禁止。
     */
    if (
        window.MamiDenOTalk &&
        window.MamiDenOTalk
            .isInteractionLocked &&
        window.MamiDenOTalk
            .isInteractionLocked()
    ) {
        return false;
    }

    /*
     * コモンイベント実行中も
     * 連続予約させない。
     */
    if (
        $gameMap &&
        $gameMap.isEventRunning()
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
        $gameTemp.isCommonEventReserved()
    ) {
        return false;
    }

    return true;
}

    class Sprite_DenOButton extends Sprite_Clickable {
        constructor(data) {
            super();

            this._buttonData = data;
            this._hovered = false;

            this.bitmap = ImageManager.loadPicture(data.image);

            this.anchor.x = 0.5;
            this.anchor.y = 0.5;

            this.x = data.x;
            this.y = data.y;

            this.scale.x = 1;
            this.scale.y = 1;
            this.opacity = 255;
        }

        update() {
            super.update();

            this.visible = buttonsVisible;

            const enabled = areButtonsEnabled();
            const targetOpacity = enabled ? 255 : disabledOpacity;

            let targetScale = 1;

            if (enabled && this.isPressed()) {
                targetScale = pressedScale;
            } else if (enabled && this._hovered) {
                targetScale = hoverScale;
            }

            this.opacity +=
                (targetOpacity - this.opacity) * animationSpeed;

            this.scale.x +=
                (targetScale - this.scale.x) * animationSpeed;

            this.scale.y +=
                (targetScale - this.scale.y) * animationSpeed;
        }

        isClickEnabled() {
            return areButtonsEnabled() && buttonsVisible;
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

    /*
     * 「話す」以外の下部ボタンを押したら、
     * AUTOを終了する。
     *
     * 対象：
     * ・憑依
     * ・交代
     * ・ストーリー
     */
    if (
        this._buttonData.id !==
            "talk" &&
        window.MamiDenOAuto &&
        typeof window.MamiDenOAuto
            .setEnabled ===
            "function"
    ) {
        window.MamiDenOAuto
            .setEnabled(false);
    }

    const scene =
        SceneManager._scene;

    /*
     * ─────────────────────────────
     * 交代ボタン
     * ─────────────────────────────
     */
    if (
        this._buttonData.action ===
        "characterChange"
    ) {
        if (scene) {
            /*
             * 憑依メニューが開いていたら閉じる。
             */
            if (
                scene._possessionMenu
            ) {
                scene._possessionMenu
                    .close();
            }

            /*
             * 交代メニューを開閉する。
             */
            if (
                scene._characterChangeMenu
            ) {
                scene._characterChangeMenu
                    .toggle();
            }
        }

        TouchInput.clear();
        return;
    }

    /*
     * ─────────────────────────────
     * 憑依ボタン
     * ─────────────────────────────
     */
    if (
        this._buttonData.action ===
        "possession"
    ) {
        if (scene) {
            /*
             * 交代メニューが開いていたら閉じる。
             */
            if (
                scene._characterChangeMenu
            ) {
                scene._characterChangeMenu
                    .close();
            }

            /*
             * 憑依メニューを開閉する。
             */
            if (
                scene._possessionMenu
            ) {
                scene._possessionMenu
                    .toggle();
            }
        }

        TouchInput.clear();
        return;
    }

/*
 * ─────────────────────────────
 * ストーリーボタン
 * ─────────────────────────────
 */
if (
    this._buttonData.action ===
    "story"
) {
    /*
     * 公開版ではボタンだけ残し、
     * 中身は開かない。
     */
    if (!isStoryDebugEnabled()) {
        TouchInput.clear();
        return;
    }

    /*
     * 開いているメニューを閉じる。
     */
    if (scene) {
        if (
            scene._characterChangeMenu
        ) {
            scene._characterChangeMenu
                .close();
        }

        if (
            scene._possessionMenu
        ) {
            scene._possessionMenu
                .close();
        }
    }

    TouchInput.clear();

    if (
        window.MamiDenOStory &&
        window.MamiDenOStory.open
    ) {
        window.MamiDenOStory.open();
    }

    return;
}

    /*
     * ─────────────────────────────
     * コモンイベントボタン
     * ─────────────────────────────
     */
    const commonEventId =
        Number(
            this._buttonData.commonEventId ||
            0
        );

    if (commonEventId > 0) {
        $gameTemp.reserveCommonEvent(
            commonEventId
        );
    }

    TouchInput.clear();
}
    }
/*
 * ─────────────────────────────
 * キャラクター交代メニュー項目
 * ─────────────────────────────
 */

class Sprite_CharacterChangeItem
    extends Sprite_Clickable {

    constructor(
        item,
        parentMenu,
        index
    ) {
        super();

        this._item = item;
        this._parentMenu = parentMenu;
        this._hovered = false;

        this.bitmap =
            new Bitmap(260, 48);

        this.x = 0;
        this.y = index * 48;

        this.refresh();
    }

    refresh() {
        this.bitmap.clear();

        const background =
            this._hovered
                ? "rgba(70, 55, 90, 0.95)"
                : "rgba(15, 15, 20, 0.92)";

        this.bitmap.fillRect(
            0,
            0,
            260,
            46,
            background
        );

        /*
         * 上下の境界線。
         */
        this.bitmap.fillRect(
            0,
            0,
            260,
            2,
            "rgba(210, 190, 255, 0.8)"
        );

        this.bitmap.fillRect(
            0,
            44,
            260,
            2,
            "rgba(100, 80, 140, 0.8)"
        );

        this.bitmap.fontSize = 23;
        this.bitmap.textColor = "#ffffff";
        this.bitmap.outlineColor =
            "rgba(0, 0, 0, 0.9)";
        this.bitmap.outlineWidth = 4;

        this.bitmap.drawText(
            this._item.label,
            16,
            0,
            228,
            46,
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
    if (
        !this._parentMenu
            .canSelectItem()
    ) {
        TouchInput.clear();
        return;
    }

    const item =
        this._item;

    /*
     * 会話処理はまだ呼ばず、
     * 閉じアニメ終了後に実行する。
     */
    this._parentMenu
        .closeWithAction(
            function() {
                if (
                    !window.MamiDenOTalk ||
                    !window.MamiDenOTalk
                        .changeMainCharacter
                ) {
                    return;
                }

                window.MamiDenOTalk
                    .changeMainCharacter(
                        item.speaker,
                        item.expression
                    );
            }
        );
}
}
/*
 * ─────────────────────────────
 * キャラクター交代メニュー
 * ─────────────────────────────
 */

class Sprite_CharacterChangeMenu
    extends Sprite {

    constructor() {
        super();

        /*
         * 右下の交代ボタンから
         * 上へ伸びる位置。
         */
        this.x = 635;
        this._baseY = 395;
        this.y = this._baseY;

        this._animationDuration = 6;
        this._animationCount = 0;
        this._animationType = null;

        this._pendingAction = null;

        this._menuWidth = 260;
        this._menuHeight =
            CHARACTER_CHANGE_ITEMS.length *
            48;

        this.visible = false;
        this._openedThisFrame = false;

        this.createBackground();
        this.createItems();
    }

    createBackground() {
        this._background =
            new Sprite(
                new Bitmap(
                    this._menuWidth,
                    this._menuHeight
                )
            );

        this._background.bitmap.fillRect(
            0,
            0,
            this._menuWidth,
            this._menuHeight,
            "rgba(0, 0, 0, 0.75)"
        );

        this.addChild(
            this._background
        );
    }

    createItems() {
        this._items = [];

        CHARACTER_CHANGE_ITEMS
            .forEach(
                (item, index) => {
                    const sprite =
                        new Sprite_CharacterChangeItem(
                            item,
                            this,
                            index
                        );

                    this.addChild(sprite);
                    this._items.push(sprite);
                }
            );
    }

    open() {
    if (!areButtonsEnabled()) {
        return;
    }

    this._pendingAction = null;

    this.visible = true;
    this._openedThisFrame = true;

    this._animationType = "open";
    this._animationCount = 0;

    /*
     * 少し下から開始。
     */
    this.y =
        this._baseY + 12;

    this.opacity = 0;
}
cancelPendingActionAndClose() {
    /*
     * 外部理由で閉じる場合は、
     * 閉じたあとに実行予定だった処理を破棄する。
     */
    this._pendingAction = null;
    this._openedThisFrame = false;

    this.close();
}
    close() {
    if (
        !this.visible ||
        this._animationType === "close"
    ) {
        return;
    }

    this._animationType = "close";
    this._animationCount = 0;
}
canSelectItem() {
    return (
        this.visible &&
        this._animationType !== "close" &&
        !this._pendingAction
    );
}

closeWithAction(action) {
    if (!this.canSelectItem()) {
        return;
    }

    this._pendingAction = action;

    TouchInput.clear();

    this.close();
}

    toggle() {
        if (this.visible) {
            this.close();
        } else {
            this.open();
        }
    }

    isPointerInside() {
        const x =
            TouchInput.x - this.x;

        const y =
            TouchInput.y - this.y;

        return (
            x >= 0 &&
            x < this._menuWidth &&
            y >= 0 &&
            y < this._menuHeight
        );
    }

    update() {
        super.update();

        this.updateAnimation();

        if (!this.visible) {
            return;
        }

        /*
         * UI全体が無効になったら閉じる。
         */
        if (
            !buttonsVisible ||
            !areButtonsEnabled()
        ) {
            this.close();
            return;
        }

        /*
         * 開いたフレームでは
         * 外クリック判定を行わない。
         */
        if (this._openedThisFrame) {
            this._openedThisFrame = false;
            return;
        }

        /*
         * メニュー外クリックで閉じる。
         */
        if (
            TouchInput.isTriggered() &&
            !this.isPointerInside()
        ) {
            this.close();
            TouchInput.clear();
        }
    }
    updateAnimation() {
    if (!this._animationType) {
        return;
    }

    this._animationCount++;

    const rate =
        Math.min(
            this._animationCount /
            this._animationDuration,
            1
        );

    if (
        this._animationType ===
        "open"
    ) {
        /*
         * 下から上へ。
         */
        this.y =
            this._baseY +
            12 * (1 - rate);

        this.opacity =
            Math.floor(
                255 * rate
            );

        if (rate >= 1) {
            this.y =
                this._baseY;

            this.opacity = 255;
            this._animationType = null;
        }

        return;
    }

    if (
        this._animationType ===
        "close"
    ) {
        /*
         * 上から下へ。
         */
        this.y =
            this._baseY +
            12 * rate;

        this.opacity =
            Math.floor(
                255 * (1 - rate)
            );

        if (rate >= 1) {
    this.visible = false;
    this.opacity = 255;
    this.y =
        this._baseY;

    this._animationType = null;
    this._openedThisFrame = false;

    /*
     * 完全に閉じてから、
     * 予約されていた会話を開始。
     */
    const action =
        this._pendingAction;

    this._pendingAction = null;

    TouchInput.clear();

    if (action) {
        action();
    }
}
    }
}
}
    function createDenOButtons(scene) {
        if (!scene._spriteset) {
            return;
        }

        if (scene._DenOButtonContainer) {
            scene._spriteset.removeChild(
                scene._DenOButtonContainer
            );
        }

        const container = new Sprite();
        scene._DenOButtonContainer = container;
        scene._denOButtons = [];

/*
 * 憑依メニュー。
 */
scene._possessionMenu =
    new Sprite_PossessionMenu();

container.addChild(
    scene._possessionMenu
);

/*
 * 交代メニュー。
 */
scene._characterChangeMenu =
    new Sprite_CharacterChangeMenu();

container.addChild(
    scene._characterChangeMenu
);

/*
 * 各ボタン。
 *
 * メニューより後に追加するため、
 * ボタンが手前に描画される。
 */
for (const data of BUTTON_DATA) {
    const button =
        new Sprite_DenOButton(data);

    container.addChild(button);
    scene._denOButtons.push(button);
}

        /*
         * Spritesetの末尾に追加。
         *
         * 背景・立ち絵より手前、
         * メッセージウィンドウより奥になります。
         */
        scene._spriteset.addChild(container);
    }

    /*
     * ボタン画像を先読み
     */
    const _Scene_Boot_loadSystemImages =
        Scene_Boot.prototype.loadSystemImages;

    Scene_Boot.prototype.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);

        for (const data of BUTTON_DATA) {
            ImageManager.loadPicture(data.image);
        }
    };

    /*
     * マップ画面生成時にボタンを作成
     */
    const _Scene_Map_createDisplayObjects =
        Scene_Map.prototype.createDisplayObjects;

    Scene_Map.prototype.createDisplayObjects = function() {
        _Scene_Map_createDisplayObjects.call(this);
        createDenOButtons(this);
    };

    PluginManager.registerCommand(
        pluginName,
        "EnableButtons",
        () => {
            manuallyEnabled = true;
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "DisableButtons",
        () => {
            manuallyEnabled = false;
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "ShowButtons",
        () => {
            buttonsVisible = true;
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "HideButtons",
        () => {
            buttonsVisible = false;
        }
    );
/*
 * ─────────────────────────────
 * 憑依メニュー
 * ─────────────────────────────
 */

class Sprite_PossessionMenu
    extends Sprite {

    constructor() {
        super();

        /*
         * 憑依ボタンの上。
         *
         * 交代メニューと同じ高さ。
         */
        this.x = 390;

        this._baseY = 395;
        this.y = this._baseY;

        this._menuWidth = 260;
        this._itemHeight = 48;

        this._animationDuration = 6;
        this._animationCount = 0;
        this._animationType = null;

        this._pendingAction = null;

        this._openedThisFrame = false;
        this._items = [];

        this.visible = false;
    }
    canSelectItem() {
    return (
        this.visible &&
        this._animationType !== "close" &&
        !this._pendingAction
    );
}

closeWithAction(action) {
    if (!this.canSelectItem()) {
        return;
    }

    this._pendingAction = action;

    TouchInput.clear();

    this.close();
}
cancelPendingActionAndClose() {
    /*
     * 外部理由で閉じる場合は、
     * 閉じたあとに実行予定だった処理を破棄する。
     */
    this._pendingAction = null;
    this._openedThisFrame = false;

    this.close();
}
    makeItemData() {
        if (
            !window.MamiDenOTalk ||
            !window.MamiDenOTalk
                .getPossessionState ||
            !window.MamiDenOTalk
                .getMainCharacter
        ) {
            return [];
        }

        const possession =
            window.MamiDenOTalk
                .getPossessionState();

        /*
         * 憑依中は解除だけ。
         */
        if (
            possession &&
            possession.active
        ) {
            return [
                {
                    label: "憑依を解く",
                    action: "release"
                }
            ];
        }

        const main =
            window.MamiDenOTalk
                .getMainCharacter();

        const speaker =
            String(
                main &&
                main.speaker ||
                "ryotaro"
            );

        /*
         * 良太郎なら4人から選択。
         */
        if (speaker === "ryotaro") {
            return [
                {
                    label: "モモタロス",
                    imagin: "momotaros"
                },
                {
                    label: "ウラタロス",
                    imagin: "urataros"
                },
                {
                    label: "キンタロス",
                    imagin: "kintaros"
                },
                {
                    label: "リュウタロス",
                    imagin: "ryutaros"
                }
            ];
        }

        const names = {
            momotaros: "モモタロス",
            urataros: "ウラタロス",
            kintaros: "キンタロス",
            ryutaros: "リュウタロス"
        };

        /*
         * イマジン本人なら、
         * その本人の憑依項目だけ。
         */
        if (names[speaker]) {
            return [
                {
                    label:
                        "良太郎に憑依する",
                    imagin:
                        speaker
                }
            ];
        }

        return [];
    }

    rebuild() {
        for (
            const sprite of this._items
        ) {
            this.removeChild(sprite);
            sprite.destroy();
        }

        this._items = [];

        if (this._background) {
            this.removeChild(
                this._background
            );

            this._background.destroy();
            this._background = null;
        }

        const itemData =
            this.makeItemData();

        this._menuHeight =
            itemData.length *
            this._itemHeight;

        if (itemData.length === 0) {
            return false;
        }

        this._background =
            new Sprite(
                new Bitmap(
                    this._menuWidth,
                    this._menuHeight
                )
            );

        this._background.bitmap.fillRect(
            0,
            0,
            this._menuWidth,
            this._menuHeight,
            "rgba(0, 0, 0, 0.75)"
        );

        this.addChild(
            this._background
        );

        itemData.forEach(
            (item, index) => {
                const sprite =
                    new Sprite_PossessionMenuItem(
                        item,
                        this,
                        index
                    );

                this.addChild(sprite);
                this._items.push(sprite);
            }
        );

        /*
         * 項目数が変わっても、
         * 下端の位置を揃える。
         */
        this._baseY =
            635 - this._menuHeight;

        this.y = this._baseY;

        return true;
    }

    open() {
        if (!areButtonsEnabled()) {
            return;
        }

        this._pendingAction = null;

        if (!this.rebuild()) {
            return;
        }

        this.visible = true;
        this._openedThisFrame = true;

        this._animationType = "open";
        this._animationCount = 0;

        this.y =
            this._baseY + 12;

        this.opacity = 0;
    }

    close() {
    if (
        !this.visible ||
        this._animationType === "close"
    ) {
        return;
    }

    this._animationType = "close";
    this._animationCount = 0;
}

    toggle() {
        if (this.visible) {
            this.close();
        } else {
            this.open();
        }
    }

    isPointerInside() {
        const x =
            TouchInput.x - this.x;

        const y =
            TouchInput.y - this.y;

        return (
            x >= 0 &&
            x < this._menuWidth &&
            y >= 0 &&
            y < this._menuHeight
        );
    }

    updateAnimation() {
        if (!this._animationType) {
            return;
        }

        this._animationCount++;

        const rate =
            Math.min(
                this._animationCount /
                this._animationDuration,
                1
            );

        if (
            this._animationType ===
            "open"
        ) {
            this.y =
                this._baseY +
                12 * (1 - rate);

            this.opacity =
                Math.floor(
                    255 * rate
                );

            if (rate >= 1) {
                this.y = this._baseY;
                this.opacity = 255;
                this._animationType = null;
            }

            return;
        }

        if (
            this._animationType ===
            "close"
        ) {
            this.y =
                this._baseY +
                12 * rate;

            this.opacity =
                Math.floor(
                    255 * (1 - rate)
                );

            if (rate >= 1) {
    this.visible = false;
    this.opacity = 255;
    this.y = this._baseY;

    this._animationType = null;
    this._openedThisFrame = false;

    const action =
        this._pendingAction;

    this._pendingAction = null;

    TouchInput.clear();

    if (action) {
        action();
    }
}
        }
    }

    update() {
        super.update();

        this.updateAnimation();

        if (!this.visible) {
            return;
        }

        if (
            !buttonsVisible ||
            !areButtonsEnabled()
        ) {
            this.close();
            return;
        }

        if (this._openedThisFrame) {
            this._openedThisFrame = false;
            return;
        }

        if (
            TouchInput.isTriggered() &&
            !this.isPointerInside()
        ) {
            this.close();
            TouchInput.clear();
        }
    }
}
    /*
 * ─────────────────────────────
 * 憑依メニュー項目
 * ─────────────────────────────
 */

class Sprite_PossessionMenuItem
    extends Sprite_Clickable {

    constructor(
        item,
        parentMenu,
        index
    ) {
        super();

        this._item = item;
        this._parentMenu = parentMenu;
        this._hovered = false;

        this.bitmap =
            new Bitmap(260, 48);

        this.x = 0;
        this.y = index * 48;

        this.refresh();
    }

    refresh() {
        this.bitmap.clear();

        const background =
            this._hovered
                ? "rgba(70, 55, 90, 0.95)"
                : "rgba(15, 15, 20, 0.92)";

        this.bitmap.fillRect(
            0,
            0,
            260,
            46,
            background
        );

        this.bitmap.fillRect(
            0,
            0,
            260,
            2,
            "rgba(210, 190, 255, 0.8)"
        );

        this.bitmap.fillRect(
            0,
            44,
            260,
            2,
            "rgba(100, 80, 140, 0.8)"
        );

        this.bitmap.fontSize = 23;
        this.bitmap.textColor = "#ffffff";
        this.bitmap.outlineColor =
            "rgba(0, 0, 0, 0.9)";
        this.bitmap.outlineWidth = 4;

        this.bitmap.drawText(
            this._item.label,
            16,
            0,
            228,
            46,
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
    if (
        !this._parentMenu
            .canSelectItem()
    ) {
        TouchInput.clear();
        return;
    }

    const item =
        this._item;

    this._parentMenu
        .closeWithAction(
            function() {
                if (
                    !window.MamiDenOTalk
                ) {
                    return;
                }

                /*
                 * 憑依解除。
                 */
                if (
                    item.action ===
                    "release"
                ) {
                    if (
                        window.MamiDenOTalk
                            .requestPossessionReleaseFromUi
                    ) {
                        window.MamiDenOTalk
                            .requestPossessionReleaseFromUi();
                    }

                    return;
                }

                /*
                 * 憑依開始。
                 */
                if (
                    window.MamiDenOTalk
                        .requestPossessionFromUi
                ) {
                    window.MamiDenOTalk
                        .requestPossessionFromUi(
                            item.imagin
                        );
                }
            }
        );
}
}
/*
 * ─────────────────────────────
 * 外部プラグイン用API
 * ─────────────────────────────
 */

window.MamiDenOUI =
    window.MamiDenOUI || {};

/*
 * 通常ボタンを表示する。
 */
window.MamiDenOUI.showButtons =
    function() {
        buttonsVisible = true;
    };

/*
 * 通常ボタンを非表示にする。
 */
window.MamiDenOUI.hideButtons =
    function() {
        buttonsVisible = false;

        const scene =
            SceneManager._scene;

        if (!scene) {
            return;
        }

        /*
         * 開いているサブメニューも閉じる。
         */
        if (
    scene._characterChangeMenu
) {
    if (
        typeof scene
            ._characterChangeMenu
            .cancelPendingActionAndClose ===
            "function"
    ) {
        scene._characterChangeMenu
            .cancelPendingActionAndClose();
    } else {
        scene._characterChangeMenu
            .close();
    }
}

if (
    scene._possessionMenu
) {
    if (
        typeof scene
            ._possessionMenu
            .cancelPendingActionAndClose ===
            "function"
    ) {
        scene._possessionMenu
            .cancelPendingActionAndClose();
    } else {
        scene._possessionMenu
            .close();
    }
}

TouchInput.clear();
Input.clear();
    };


/*
 * 通常ボタンの表示状態を取得。
 */
window.MamiDenOUI.areButtonsVisible =
    function() {
        return buttonsVisible;
    };
    /*
 * ─────────────────────────────
 * ストーリーデバッグ手動切替
 * ─────────────────────────────
 */
window.MamiDenOUI =
    window.MamiDenOUI || {};

window.MamiDenOUI
    .setStoryDebugEnabled =
    function(enabled) {
        try {
            localStorage.setItem(
                STORY_DEBUG_STORAGE_KEY,
                enabled ? "1" : "0"
            );
        } catch (error) {
            console.warn(
                "ストーリーデバッグ設定を保存できませんでした。",
                error
            );
        }

        return isStoryDebugEnabled();
    };

window.MamiDenOUI
    .isStoryDebugEnabled =
    function() {
        return isStoryDebugEnabled();
    };
})();