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
        commonEventId: 2
    },
    {
        id: "random",
        image: "btn_random",
        x: 760,
        y: 665,
        commonEventId: 3
    },
    {
        id: "leave",
        image: "btn_leave",
        x: 1000,
        y: 665,
        commonEventId: 4
        },

    /*
     * 仮のキャラクター変更ボタン
     */
    {
        id: "characterChange",
        image: "btn_character_change",
        x: 1170,
        y: 45,
        commonEventId: 5
    }
];

    let manuallyEnabled = true;
    let buttonsVisible = true;

    function areButtonsEnabled() {
        if (!manuallyEnabled) {
            return false;
        }

        if ($gameMessage && $gameMessage.isBusy()) {
            return false;
        }

        if ($gameTemp && $gameTemp.isCommonEventReserved()) {
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

            const commonEventId = this._buttonData.commonEventId;

            if (commonEventId > 0) {
                $gameTemp.reserveCommonEvent(commonEventId);
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

        for (const data of BUTTON_DATA) {
            const button = new Sprite_DenOButton(data);

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
})();