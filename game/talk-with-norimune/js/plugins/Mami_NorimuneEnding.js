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
            const scene = SceneManager._scene;

            if (scene instanceof Scene_Map) {
                showEnding(scene);
            }
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
})();