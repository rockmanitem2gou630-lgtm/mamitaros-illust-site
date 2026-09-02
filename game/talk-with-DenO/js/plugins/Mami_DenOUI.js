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
const MENU_UI = {
    panelImage: "menu_console_panel",

    possessionItemImage:
        "menu_item_possess",
    possessionItemHoverImage:
        "menu_item_possess_hover",

    characterChangeItemImage:
        "menu_item_change",
    characterChangeItemHoverImage:
        "menu_item_change_hover",

    /*
     * 現在の余白調整値。
     * Xは負数でもOK。
     */
    panelPaddingX: -5,
    panelPaddingY: 5,

    /*
     * タップ判定は広いまま、
     * ボタン画像だけ少し内側へ収める。
     */
    itemWidth: 280,
    itemHeight: 54,
    itemGap: 6,
    itemVisualInsetX: 12,
    itemVisualInsetY: 3,

    panelSliceX: 26,
    panelSliceY: 26,

    textLeft: 40,
    textRight: 30,
    fontSize: 22
};

const POSSESSION_MENU_COLORS = {
    normal: "#ff6a6a",
    hover: "#ffc0c0"
};

const CHARACTER_CHANGE_MENU_COLORS = {
    normal: "#ffd95a",
    hover: "#fff0a8"
};
    let manuallyEnabled = true;
    let buttonsVisible = true;
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
function calcMenuHeight(itemCount) {
    if (itemCount <= 0) {
        return 0;
    }

    return (
        MENU_UI.panelPaddingY * 2 +
        itemCount * MENU_UI.itemHeight +
        (itemCount - 1) * MENU_UI.itemGap
    );
}

function calcMenuItemY(index) {
    return (
        MENU_UI.panelPaddingY +
        index * (
            MENU_UI.itemHeight +
            MENU_UI.itemGap
        )
    );
}

/*
 * 画像を指定サイズへ合わせる。
 *
 * 子スプライトだけを拡大縮小するため、
 * 文字やタップ判定は元サイズのまま保てる。
 */
function fitSpriteToSize(
    sprite,
    width,
    height
) {
    if (!sprite || !sprite.bitmap) {
        return;
    }

    const applyScale = function() {
        if (
            sprite.bitmap.width <= 0 ||
            sprite.bitmap.height <= 0
        ) {
            return;
        }

        sprite.scale.x =
            width / sprite.bitmap.width;

        sprite.scale.y =
            height / sprite.bitmap.height;
    };

    if (sprite.bitmap.isReady()) {
        applyScale();
    } else {
        sprite.bitmap.addLoadListener(
            applyScale
        );
    }
}

/*
 * 背景パネルを9分割で描画する。
 *
 * 項目が1個でも5個でも、
 * 四隅とフレームの太さを保ったまま
 * 中央部分だけ伸縮する。
 */
function createNineSlicePanel(
    imageName,
    width,
    height
) {
    const output =
        new Bitmap(
            width,
            height
        );

    const sprite =
        new Sprite(output);

    const source =
        ImageManager.loadPicture(
            imageName
        );

    const redraw = function() {
        output.clear();

        const sourceWidth =
            source.width;

        const sourceHeight =
            source.height;

        if (
            sourceWidth <= 0 ||
            sourceHeight <= 0
        ) {
            return;
        }

        const sourceLeft =
            Math.max(
                1,
                Math.floor(
                    sourceWidth * 0.16
                )
            );

        const sourceRight =
            sourceLeft;

        const sourceTop =
            Math.max(
                1,
                Math.floor(
                    sourceHeight * 0.12
                )
            );

        const sourceBottom =
            sourceTop;

        const targetLeft =
            Math.min(
                MENU_UI.panelSliceX,
                Math.floor(width / 2)
            );

        const targetRight =
            targetLeft;

        const targetTop =
            Math.min(
                MENU_UI.panelSliceY,
                Math.floor(height / 2)
            );

        const targetBottom =
            targetTop;

        const sourceCenterWidth =
            Math.max(
                1,
                sourceWidth -
                    sourceLeft -
                    sourceRight
            );

        const sourceCenterHeight =
            Math.max(
                1,
                sourceHeight -
                    sourceTop -
                    sourceBottom
            );

        const targetCenterWidth =
            Math.max(
                1,
                width -
                    targetLeft -
                    targetRight
            );

        const targetCenterHeight =
            Math.max(
                1,
                height -
                    targetTop -
                    targetBottom
            );

        const blt = function(
            sx,
            sy,
            sw,
            sh,
            dx,
            dy,
            dw,
            dh
        ) {
            output.blt(
                source,
                sx,
                sy,
                sw,
                sh,
                dx,
                dy,
                dw,
                dh
            );
        };

        /*
         * 上段。
         */
        blt(
            0,
            0,
            sourceLeft,
            sourceTop,
            0,
            0,
            targetLeft,
            targetTop
        );

        blt(
            sourceLeft,
            0,
            sourceCenterWidth,
            sourceTop,
            targetLeft,
            0,
            targetCenterWidth,
            targetTop
        );

        blt(
            sourceWidth - sourceRight,
            0,
            sourceRight,
            sourceTop,
            width - targetRight,
            0,
            targetRight,
            targetTop
        );

        /*
         * 中段。
         */
        blt(
            0,
            sourceTop,
            sourceLeft,
            sourceCenterHeight,
            0,
            targetTop,
            targetLeft,
            targetCenterHeight
        );

        blt(
            sourceLeft,
            sourceTop,
            sourceCenterWidth,
            sourceCenterHeight,
            targetLeft,
            targetTop,
            targetCenterWidth,
            targetCenterHeight
        );

        blt(
            sourceWidth - sourceRight,
            sourceTop,
            sourceRight,
            sourceCenterHeight,
            width - targetRight,
            targetTop,
            targetRight,
            targetCenterHeight
        );

        /*
         * 下段。
         */
        blt(
            0,
            sourceHeight - sourceBottom,
            sourceLeft,
            sourceBottom,
            0,
            height - targetBottom,
            targetLeft,
            targetBottom
        );

        blt(
            sourceLeft,
            sourceHeight - sourceBottom,
            sourceCenterWidth,
            sourceBottom,
            targetLeft,
            height - targetBottom,
            targetCenterWidth,
            targetBottom
        );

        blt(
            sourceWidth - sourceRight,
            sourceHeight - sourceBottom,
            sourceRight,
            sourceBottom,
            width - targetRight,
            height - targetBottom,
            targetRight,
            targetBottom
        );
    };

    if (source.isReady()) {
        redraw();
    } else {
        source.addLoadListener(
            redraw
        );
    }

    return sprite;
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

        this.x =
            MENU_UI.panelPaddingX;

        this.y =
            calcMenuItemY(index);

        /*
         * 通常画像とホバー画像を両方保持。
         */
        this._normalBitmap =
            ImageManager.loadPicture(
                MENU_UI
                    .characterChangeItemImage
            );

        this._hoverBitmap =
            ImageManager.loadPicture(
                MENU_UI
                    .characterChangeItemHoverImage
            );

        /*
         * 画像部分。
         */
        this._background =
            new Sprite(
                this._normalBitmap
            );

        this._background.x =
            MENU_UI.itemVisualInsetX;

        this._background.y =
            MENU_UI.itemVisualInsetY;

        this.updateBackgroundBitmap();

        this.addChild(
            this._background
        );

        /*
         * 文字部分。
         */
        this._overlay =
            new Sprite(
                new Bitmap(
                    MENU_UI.itemWidth,
                    MENU_UI.itemHeight
                )
            );

        this.addChild(
            this._overlay
        );

        this.refresh();
    }

    hitTest(
        x,
        y
    ) {
        return (
            x >= 0 &&
            y >= 0 &&
            x < MENU_UI.itemWidth &&
            y < MENU_UI.itemHeight
        );
    }

    updateBackgroundBitmap() {
        this._background.bitmap =
            this._hovered
                ? this._hoverBitmap
                : this._normalBitmap;

        fitSpriteToSize(
            this._background,
            MENU_UI.itemWidth -
                MENU_UI.itemVisualInsetX * 2,
            MENU_UI.itemHeight -
                MENU_UI.itemVisualInsetY * 2
        );
    }

    refresh() {
        this.updateBackgroundBitmap();

        const overlay =
            this._overlay.bitmap;

        overlay.clear();

        const accentColor =
            this._hovered
                ? this._parentMenu
                    .getHoverAccentColor()
                : this._parentMenu
                    .getAccentColor();

        overlay.fontSize =
            MENU_UI.fontSize;

        overlay.textColor =
            "#ffffff";

        overlay.outlineColor =
            "rgba(0, 0, 0, 0.95)";

        overlay.outlineWidth = 4;

        overlay.drawText(
            this._item.label,
            MENU_UI.textLeft,
            0,
            MENU_UI.itemWidth -
                MENU_UI.textLeft -
                MENU_UI.textRight,
            MENU_UI.itemHeight,
            "left"
        );

        /*
         * 右端の小さな選択マーク。
         */
        overlay.fontSize = 20;
        overlay.textColor =
            accentColor;
        overlay.outlineWidth = 3;

        overlay.drawText(
            "＞",
            MENU_UI.itemWidth - 50,
            0,
            18,
            MENU_UI.itemHeight,
            "center"
        );

        /*
         * 画像側で通常/ホバー差を出すので、
         * 不透明度は固定。
         */
        this._background.opacity = 255;
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

        this._menuWidth =
            MENU_UI.itemWidth +
            MENU_UI.panelPaddingX * 2;

        this._menuHeight =
            calcMenuHeight(
                CHARACTER_CHANGE_ITEMS.length
            );

        const buttonData =
            BUTTON_DATA.find(
                data =>
                    data.id ===
                    "characterChange"
            );

        const centerX =
            buttonData
                ? buttonData.x
                : 760;

        this.x =
            Math.round(
                centerX -
                this._menuWidth / 2
            );

        /*
         * 下端を下ボタンの少し上へ揃える。
         */
        this._baseY =
            635 -
            this._menuHeight;

        this.y =
            this._baseY;

        this._animationDuration = 6;
        this._animationCount = 0;
        this._animationType = null;

        this._pendingAction = null;

        this.visible = false;
        this._openedThisFrame = false;

        this.createBackground();
        this.createItems();
    }

    createBackground() {
        this._background =
            createNineSlicePanel(
                MENU_UI.panelImage,
                this._menuWidth,
                this._menuHeight
            );

        this.addChild(
            this._background
        );
    }

    createItems() {
        this._items = [];

        CHARACTER_CHANGE_ITEMS
            .forEach(
                (
                    item,
                    index
                ) => {
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

        this.y =
            this._baseY + 12;

        this.opacity = 0;
    }

    cancelPendingActionAndClose() {
        this._pendingAction = null;
        this._openedThisFrame = false;

        this.close();
    }

    close() {
        if (
            !this.visible ||
            this._animationType ===
                "close"
        ) {
            return;
        }

        this._animationType = "close";
        this._animationCount = 0;
    }

    canSelectItem() {
        return (
            this.visible &&
            this._animationType !==
                "close" &&
            !this._pendingAction
        );
    }

    closeWithAction(action) {
        if (!this.canSelectItem()) {
            return;
        }

        this._pendingAction =
            action;

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

    getAccentColor() {
        return (
            CHARACTER_CHANGE_MENU_COLORS
                .normal
        );
    }

    getHoverAccentColor() {
        return (
            CHARACTER_CHANGE_MENU_COLORS
                .hover
        );
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

        ImageManager.loadPicture(
            MENU_UI.panelImage
        );

        ImageManager.loadPicture(
            MENU_UI.possessionItemImage
        );

        ImageManager.loadPicture(
            MENU_UI.possessionItemHoverImage
        );

        ImageManager.loadPicture(
            MENU_UI.characterChangeItemImage
        );

        ImageManager.loadPicture(
            MENU_UI.characterChangeItemHoverImage
        );
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

        this._menuWidth =
            MENU_UI.itemWidth +
            MENU_UI.panelPaddingX * 2;

        const buttonData =
            BUTTON_DATA.find(
                data =>
                    data.id ===
                    "possess"
            );

        const centerX =
            buttonData
                ? buttonData.x
                : 520;

        this.x =
            Math.round(
                centerX -
                this._menuWidth / 2
            );

        this._baseY = 395;
        this.y = this._baseY;

        this._menuHeight = 0;

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
            this._animationType !==
                "close" &&
            !this._pendingAction
        );
    }

    closeWithAction(action) {
        if (!this.canSelectItem()) {
            return;
        }

        this._pendingAction =
            action;

        TouchInput.clear();

        this.close();
    }

    cancelPendingActionAndClose() {
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
         * 本人の憑依項目だけ。
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

        if (itemData.length === 0) {
            return false;
        }

        this._menuHeight =
            calcMenuHeight(
                itemData.length
            );

        this._background =
            createNineSlicePanel(
                MENU_UI.panelImage,
                this._menuWidth,
                this._menuHeight
            );

        this.addChild(
            this._background
        );

        itemData.forEach(
            (
                item,
                index
            ) => {
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
            635 -
            this._menuHeight;

        this.y =
            this._baseY;

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
            this._animationType ===
                "close"
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

    getAccentColor() {
        return (
            POSSESSION_MENU_COLORS
                .normal
        );
    }

    getHoverAccentColor() {
        return (
            POSSESSION_MENU_COLORS
                .hover
        );
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

        this.x =
            MENU_UI.panelPaddingX;

        this.y =
            calcMenuItemY(index);

        /*
         * 通常画像とホバー画像を両方保持。
         */
        this._normalBitmap =
            ImageManager.loadPicture(
                MENU_UI
                    .possessionItemImage
            );

        this._hoverBitmap =
            ImageManager.loadPicture(
                MENU_UI
                    .possessionItemHoverImage
            );

        /*
         * 画像部分。
         */
        this._background =
            new Sprite(
                this._normalBitmap
            );

        this._background.x =
            MENU_UI.itemVisualInsetX;

        this._background.y =
            MENU_UI.itemVisualInsetY;

        this.updateBackgroundBitmap();

        this.addChild(
            this._background
        );

        /*
         * 文字部分。
         */
        this._overlay =
            new Sprite(
                new Bitmap(
                    MENU_UI.itemWidth,
                    MENU_UI.itemHeight
                )
            );

        this.addChild(
            this._overlay
        );

        this.refresh();
    }

    hitTest(
        x,
        y
    ) {
        return (
            x >= 0 &&
            y >= 0 &&
            x < MENU_UI.itemWidth &&
            y < MENU_UI.itemHeight
        );
    }

    updateBackgroundBitmap() {
        this._background.bitmap =
            this._hovered
                ? this._hoverBitmap
                : this._normalBitmap;

        fitSpriteToSize(
            this._background,
            MENU_UI.itemWidth -
                MENU_UI.itemVisualInsetX * 2,
            MENU_UI.itemHeight -
                MENU_UI.itemVisualInsetY * 2
        );
    }

    refresh() {
        this.updateBackgroundBitmap();

        const overlay =
            this._overlay.bitmap;

        overlay.clear();

        const accentColor =
            this._hovered
                ? this._parentMenu
                    .getHoverAccentColor()
                : this._parentMenu
                    .getAccentColor();

        overlay.fontSize =
            MENU_UI.fontSize;

        overlay.textColor =
            "#ffffff";

        overlay.outlineColor =
            "rgba(0, 0, 0, 0.95)";

        overlay.outlineWidth = 4;

        overlay.drawText(
            this._item.label,
            MENU_UI.textLeft,
            0,
            MENU_UI.itemWidth -
                MENU_UI.textLeft -
                MENU_UI.textRight,
            MENU_UI.itemHeight,
            "left"
        );

        /*
         * 右端の小さな選択マーク。
         */
        overlay.fontSize = 20;
        overlay.textColor =
            accentColor;
        overlay.outlineWidth = 3;

        overlay.drawText(
            "＞",
            MENU_UI.itemWidth - 50,
            0,
            18,
            MENU_UI.itemHeight,
            "center"
        );

        /*
         * 画像側で通常/ホバー差を出すので、
         * 不透明度は固定。
         */
        this._background.opacity = 255;
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
})();