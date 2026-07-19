/*:
 * @target MZ
 * @plugindesc 電王会話作品用・画像式メッセージUI Ver1.0
 * @author マミタロス
 *
 * @param WindowX
 * @text 文字ウィンドウX座標
 * @type number
 * @min 0
 * @default 80
 *
 * @param WindowY
 * @text 文字ウィンドウY座標
 * @type number
 * @min 0
 * @default 500
 *
 * @param WindowWidth
 * @text 文字ウィンドウ幅
 * @type number
 * @min 1
 * @default 1120
 *
 * @param WindowHeight
 * @text 文字ウィンドウ高さ
 * @type number
 * @min 1
 * @default 120
 *
 * @param Padding
 * @text 文字の内側余白
 * @type number
 * @min 0
 * @default 24
 *
 * @param TextStartX
 * @text 本文開始X補正
 * @desc 文字ウィンドウの内側を基準にした本文の開始位置です。
 * @type number
 * @min -1000
 * @max 1000
 * @default 10
 *
 * @param TextStartY
 * @text 本文開始Y補正
 * @desc 文字ウィンドウの内側を基準にした本文の開始位置です。
 * @type number
 * @min -1000
 * @max 1000
 * @default 38
 *
 * @param FontSize
 * @text 文字サイズ
 * @type number
 * @min 1
 * @default 28
 *
 * @param LineHeight
 * @text 1行の高さ
 * @desc 0の場合は文字サイズから自動計算します。
 * @type number
 * @min 0
 * @default 0
 *
 * @param TextColor
 * @text 文字色
 * @type string
 * @default #ffffff
 *
 * @param OutlineColor
 * @text 文字の縁取り色
 * @type string
 * @default rgba(0,0,0,0.75)
 *
 * @param OutlineWidth
 * @text 文字の縁取り幅
 * @type number
 * @min 0
 * @default 4
 *
 * @param FrameImage
 * @text メッセージ枠画像
 * @type file
 * @dir img/pictures
 * @default message_window
 *
 * @param FrameOffsetX
 * @text 枠画像X補正
 * @desc 文字ウィンドウ左上からの相対位置です。
 * @type number
 * @min -2000
 * @max 2000
 * @default -20
 *
 * @param FrameOffsetY
 * @text 枠画像Y補正
 * @desc 文字ウィンドウ左上からの相対位置です。
 * @type number
 * @min -2000
 * @max 2000
 * @default -15
 *
 * @param FrameScaleX
 * @text 枠画像横拡大率
 * @type number
 * @min 1
 * @default 100
 *
 * @param FrameScaleY
 * @text 枠画像縦拡大率
 * @type number
 * @min 1
 * @default 100
 *
 * @param FrameOpacity
 * @text 枠画像の不透明度
 * @type number
 * @min 0
 * @max 255
 * @default 255
 * 
 * @param NamePlateX
 * @text ネームプレートX座標
 * @type number
 * @default 180
 *
 * @param NamePlateY
 * @text ネームプレートY座標
 * @type number
 * @default 470
 *
 * @param NamePlateScale
 * @text ネームプレート拡大率
 * @type number
 * @min 1
 * @default 100
 *
 * @param NamePlateOpacity
 * @text ネームプレート不透明度
 * @type number
 * @min 0
 * @max 255
 * @default 255
 *
 * @param FollowWindowOpenness
 * @text 開閉状態へ追従
 * @desc ONの場合、標準ウィンドウの開閉に合わせて枠画像もフェードします。
 * @type boolean
 * @on 追従する
 * @off 常に同じ濃さ
 * @default true
 *
 * @param HideDuringFastForward
 * @text 高速送り中も表示
 * @desc OFF推奨です。通常はメッセージが開いている間ずっと表示します。
 * @type boolean
 * @on 高速送り中は隠す
 * @off 高速送り中も表示
 * @default false
 *
 * @help
 * 固定サイズの画像をメッセージウィンドウの背面へ表示します。
 *
 * 標準ウィンドウの背景と枠は透明になりますが、
 * 文章表示、選択肢、制御文字などの標準機能はそのまま利用できます。
 *
 * 使用画像：
 *
 * img/pictures/message_window.png
 *
 * 推奨画像サイズ：
 *
 * 1160 × 150px
 *
 * 初期設定では文字ウィンドウが、
 *
 * X：80
 * Y：500
 * 幅：1120
 * 高さ：120
 *
 * 枠画像はそこから、
 *
 * X：-20
 * Y：-15
 *
 * の位置へ表示されます。
 *
 * このプラグインは既存の
 * Mami_NorimuneMessageUI.js
 * を丸ごと置き換えて使用してください。
 */

(() => {
    "use strict";

    const pluginName = "Mami_DenOMessageUI";
    const params = PluginManager.parameters(pluginName);

    function numberParam(name, defaultValue) {
        const value = params[name];

        if (value === undefined || value === "") {
            return defaultValue;
        }

        return Number(value);
    }

    const windowX =
        numberParam("WindowX", 80);

    const windowY =
        numberParam("WindowY", 500);

    const windowWidth =
        numberParam("WindowWidth", 1120);

    const windowHeight =
        numberParam("WindowHeight", 120);
    const textStartX =
        numberParam(
            "TextStartX",
            10
        );

    const textStartY =
        numberParam(
            "TextStartY",
            38
        );    

    const padding =
        numberParam("Padding", 24);

    const fontSize =
        numberParam("FontSize", 28);

    const customLineHeight =
        numberParam("LineHeight", 0);

    const textColor =
        String(params.TextColor || "#ffffff");

    const outlineColor =
        String(
            params.OutlineColor ||
            "rgba(0,0,0,0.75)"
        );

    const outlineWidth =
        numberParam("OutlineWidth", 4);

    const frameImageName =
        String(params.FrameImage || "message_window");

    const frameOffsetX =
        numberParam("FrameOffsetX", -20);

    const frameOffsetY =
        numberParam("FrameOffsetY", -15);

    const frameScaleX =
        numberParam("FrameScaleX", 100) / 100;

    const frameScaleY =
        numberParam("FrameScaleY", 100) / 100;

    const frameOpacity =
        Math.max(
            0,
            Math.min(
                255,
                numberParam("FrameOpacity", 255)
            )
        );
    const namePlateX =
    numberParam(
        "NamePlateX",
        180
    );

    const namePlateY =
        numberParam(
            "NamePlateY",
            495
        );

    const namePlateScale =
        numberParam(
            "NamePlateScale",
            100
        ) / 100;

    const namePlateOpacity =
        Math.max(
            0,
            Math.min(
                255,
                numberParam(
                    "NamePlateOpacity",
                    255
                )
            )
        );    

    const followWindowOpenness =
        String(
            params.FollowWindowOpenness || "true"
        ) === "true";

    const hideDuringFastForward =
        String(
            params.HideDuringFastForward || "false"
        ) === "true";

    /*
     * ─────────────────────────────
     * メッセージウィンドウ本体
     * ─────────────────────────────
     */

    const _Window_Message_initialize =
        Window_Message.prototype.initialize;

    Window_Message.prototype.initialize = function(rect) {
        const customRect = new Rectangle(
            windowX,
            windowY,
            windowWidth,
            windowHeight
        );

        _Window_Message_initialize.call(
            this,
            customRect
        );

        this.padding = padding;

        /*
         * 標準背景と標準枠を透明化。
         * contentsOpacityは文字表示用なので残します。
         */
        this.opacity = 0;
        this.backOpacity = 0;
        this.contentsOpacity = 255;
    };

    /*
     * 位置を常に固定
     */

    Window_Message.prototype.updatePlacement = function() {
        this.x = windowX;
        this.y = windowY;

        if (
            this.width !== windowWidth ||
            this.height !== windowHeight
        ) {
            this.move(
                windowX,
                windowY,
                windowWidth,
                windowHeight
            );

            this.createContents();
        }
    };

    /*
     * フォント設定
     */

    const _Window_Message_resetFontSettings =
        Window_Message.prototype.resetFontSettings;

    Window_Message.prototype.resetFontSettings = function() {
        _Window_Message_resetFontSettings.call(this);

        if (!this.contents) {
            return;
        }

        this.contents.fontSize = fontSize;
        this.contents.textColor = textColor;
        this.contents.outlineColor = outlineColor;
        this.contents.outlineWidth = outlineWidth;
    };

    /*
     * 行の高さ
     */

    const _Window_Message_lineHeight =
        Window_Message.prototype.lineHeight;

    Window_Message.prototype.lineHeight = function() {
        if (customLineHeight > 0) {
            return customLineHeight;
        }

        return Math.max(
            _Window_Message_lineHeight.call(this),
            fontSize + 8
        );
    };
/*
 * ─────────────────────────────
 * 本文の開始位置を固定
 * ─────────────────────────────
 */

/*
 * ─────────────────────────────
 * 本文の開始位置を固定
 * 顔グラフィック用の空白を無効化
 * ─────────────────────────────
 */

/*
 * ページ開始時・改行時のX座標。
 *
 * ツクール標準では顔グラフィックが設定されていると
 * ここへ顔グラ用の幅が自動加算されるため、
 * 電王会話作品では常に指定位置へ固定する。
 */
Window_Message.prototype.newLineX =
    function(textState) {
        return textStartX;
    };

const _Window_Message_newPage =
    Window_Message.prototype.newPage;

Window_Message.prototype.newPage =
    function(textState) {
        /*
         * 先にツクール標準のページ開始処理を行う。
         */
        _Window_Message_newPage.call(
            this,
            textState
        );

        /*
         * 顔グラフィック用の自動余白を消す。
         *
         * xだけでなくstartXも変更しないと、
         * 改行時に元の位置へ戻されてしまう。
         */
        textState.startX =
            textStartX;

        textState.x =
            textStartX;

        /*
         * 一部の文章処理との互換用。
         */
        textState.left =
            textStartX;

        textState.y =
            textStartY;
    };
    /*
     * ─────────────────────────────
     * 枠画像用Sprite
     * ─────────────────────────────
     */

    class Sprite_MamiMessageFrame extends Sprite {
        constructor(messageWindow) {
            super();

            this._messageWindow = messageWindow;

            this.bitmap =
                ImageManager.loadPicture(frameImageName);

            this.anchor.x = 0;
            this.anchor.y = 0;

            this.scale.x = frameScaleX;
            this.scale.y = frameScaleY;

            this.opacity = 0;
            this.visible = false;

            this.updatePosition();
        }

        update() {
            super.update();

            this.updatePosition();
            this.updateVisibility();
        }

        updatePosition() {
            const messageWindow =
                this._messageWindow;

            if (!messageWindow) {
                return;
            }

            this.x =
                messageWindow.x +
                frameOffsetX;

            this.y =
                messageWindow.y +
                frameOffsetY;
        }

        updateVisibility() {
            const messageWindow =
                this._messageWindow;

            if (!messageWindow) {
                this.visible = false;
                return;
            }

            const isWindowVisible =
                messageWindow.visible &&
                messageWindow.openness > 0;

            const isFastForwarding =
                hideDuringFastForward &&
                Input.isPressed("ok");

            this.visible =
                isWindowVisible &&
                !isFastForwarding;

            if (!this.visible) {
                this.opacity = 0;
                return;
            }

            if (followWindowOpenness) {
                this.opacity =
                    Math.round(
                        frameOpacity *
                        (
                            messageWindow.openness /
                            255
                        )
                    );
            } else {
                this.opacity = frameOpacity;
            }
        }
    }
/*
 * ─────────────────────────────
 * ネームプレート用Sprite
 * ─────────────────────────────
 */

class Sprite_MamiNamePlate extends Sprite {
    constructor(messageWindow) {
        super();

        this._messageWindow =
            messageWindow;

        this._requestedVisible =
            false;

        this.anchor.x = 0.5;
        this.anchor.y = 0.5;

        this.x = namePlateX;
        this.y = namePlateY;

        this.scale.x =
            namePlateScale;

        this.scale.y =
            namePlateScale;

        this.opacity = 0;
        this.visible = false;
    }

    update() {
        super.update();

        this.updatePosition();
        this.updateVisibility();
    }

    updatePosition() {
        this.x = namePlateX;
        this.y = namePlateY;

        this.scale.x =
            namePlateScale;

        this.scale.y =
            namePlateScale;
    }

    updateVisibility() {
        const messageWindow =
            this._messageWindow;

        if (!messageWindow) {
            this.visible = false;
            this.opacity = 0;
            return;
        }

        const windowIsOpen =
            messageWindow.visible &&
            messageWindow.openness > 0;

        this.visible =
            this._requestedVisible &&
            windowIsOpen;

        if (!this.visible) {
            this.opacity = 0;
            return;
        }

        if (followWindowOpenness) {
            this.opacity =
                Math.round(
                    namePlateOpacity *
                    (
                        messageWindow.openness /
                        255
                    )
                );
        } else {
            this.opacity =
                namePlateOpacity;
        }
    }

    showPlate(filename) {
        if (!filename) {
            this.hidePlate();
            return;
        }

        this.bitmap =
            ImageManager.loadPicture(
                filename
            );

        this._requestedVisible =
            true;
    }

    hidePlate() {
        this._requestedVisible =
            false;

        this.visible = false;
        this.opacity = 0;
    }
}
    /*
     * ─────────────────────────────
     * Scene_Messageへ枠画像を追加
     * ─────────────────────────────
     */

    const _Scene_Message_createMessageWindow =
        Scene_Message.prototype.createMessageWindow;

Scene_Message.prototype.createMessageWindow =
    function() {
        _Scene_Message_createMessageWindow.call(this);

        /*
         * この順番で追加することで、
         *
         * メッセージ枠
         * ↓
         * ネームプレート
         * ↓
         * 本文ウィンドウ
         *
         * の重なり順になる。
         */
        this.createMamiMessageFrame();
        this.createMamiNamePlate();
    };
Scene_Message.prototype.createMamiNamePlate =
    function() {
        if (
            !this._messageWindow ||
            this._mamiNamePlate
        ) {
            return;
        }

        const sprite =
            new Sprite_MamiNamePlate(
                this._messageWindow
            );

        this._mamiNamePlate =
            sprite;

        /*
         * WindowLayerの直前へ追加。
         *
         * 先に追加済みのメッセージ枠より手前、
         * 本文ウィンドウより奥になる。
         */
        if (this._windowLayer) {
            const windowLayerIndex =
                this.getChildIndex(
                    this._windowLayer
                );

            this.addChildAt(
                sprite,
                Math.max(
                    0,
                    windowLayerIndex
                )
            );
        } else {
            this.addChild(sprite);
        }
    };
    Scene_Message.prototype.createMamiMessageFrame =
        function() {
            if (
                !this._messageWindow ||
                this._mamiMessageFrame
            ) {
                return;
            }

            const sprite =
                new Sprite_MamiMessageFrame(
                    this._messageWindow
                );

            this._mamiMessageFrame = sprite;

            /*
             * WindowLayerより直前へ追加。
             *
             * 背景・立ち絵より手前、
             * メッセージ本文や選択肢より奥になります。
             */
            if (this._windowLayer) {
                const windowLayerIndex =
                    this.getChildIndex(
                        this._windowLayer
                    );

                this.addChildAt(
                    sprite,
                    Math.max(
                        0,
                        windowLayerIndex
                    )
                );
            } else {
                this.addChild(sprite);
            }
        };

    /*
     * Scene終了時に後片付け
     */

    const _Scene_Message_terminate =
        Scene_Message.prototype.terminate;

    Scene_Message.prototype.terminate = function() {
        if (this._mamiMessageFrame) {
            if (this._mamiMessageFrame.parent) {
                this._mamiMessageFrame.parent.removeChild(
                    this._mamiMessageFrame
                );
            }

            this._mamiMessageFrame.destroy({
                children: true,
                texture: false,
                baseTexture: false
            });

            this._mamiMessageFrame = null;
        }
if (this._mamiNamePlate) {
    if (
        this._mamiNamePlate.parent
    ) {
        this
            ._mamiNamePlate
            .parent
            .removeChild(
                this._mamiNamePlate
            );
    }

    this._mamiNamePlate.destroy({
        children: true,
        texture: false,
        baseTexture: false
    });

    this._mamiNamePlate = null;
}
        _Scene_Message_terminate.call(this);
    };

    /*
     * 枠画像を先読み
     */

    const _Scene_Boot_loadSystemImages =
        Scene_Boot.prototype.loadSystemImages;

    Scene_Boot.prototype.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);

        if (frameImageName) {
            ImageManager.loadPicture(
                frameImageName
            );
        }
    };
/*
 * ─────────────────────────────
 * 外部呼び出し用
 * ─────────────────────────────
 */

window.MamiDenOMessageUI = {
    showNamePlate(filename) {
        const scene =
            SceneManager._scene;

        if (
            !scene ||
            !scene._mamiNamePlate
        ) {
            return false;
        }

        scene
            ._mamiNamePlate
            .showPlate(filename);

        return true;
    },

    hideNamePlate() {
        const scene =
            SceneManager._scene;

        if (
            !scene ||
            !scene._mamiNamePlate
        ) {
            return false;
        }

        scene
            ._mamiNamePlate
            .hidePlate();

        return true;
    }
};
})();