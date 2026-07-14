/*:
 * @target MZ
 * @plugindesc 各メッセージページの文末に送り用アニメーションを表示します Ver6.0
 * @author GPT + マミタロス
 *
 * @param Image
 * @text アニメーション画像
 * @type file
 * @dir img/pictures
 * @default message_sakura
 *
 * @param FrameWidth
 * @text 1コマの幅
 * @type number
 * @min 1
 * @default 57
 *
 * @param FrameHeight
 * @text 1コマの高さ
 * @type number
 * @min 1
 * @default 57
 *
 * @param FrameCount
 * @text コマ数
 * @type number
 * @min 1
 * @default 7
 *
 * @param AnimationSpeed
 * @text コマ送り間隔
 * @type number
 * @min 1
 * @default 10
 *
 * @param Horizontal
 * @text コマの並び方向
 * @type boolean
 * @on 横並び
 * @off 縦並び
 * @default true
 *
 * @param OffsetX
 * @text 文末からのX補正
 * @type number
 * @min -999
 * @max 999
 * @default 4
 *
 * @param OffsetY
 * @text 文末からのY補正
 * @type number
 * @min -999
 * @max 999
 * @default -10
 *
 * @param Scale
 * @text 表示倍率
 * @type number
 * @min 1
 * @default 100
 *
 * @param Opacity
 * @text 不透明度
 * @type number
 * @min 0
 * @max 255
 * @default 255
 *
 * @param Loop
 * @text ループ再生
 * @type boolean
 * @on ループする
 * @off 最終コマで停止
 * @default true
 *
 * @param Debug
 * @text デバッグ表示
 * @desc ONにするとF8コンソールへ取得座標を表示します。
 * @type boolean
 * @default false
 *
 * @help
 * 各メッセージページの文章表示が完了した時、
 * そのページで最後に描画された文字の右隣へ
 * アニメーションを表示します。
 *
 * 改ページすると一度消え、
 * 次のページの文末で再表示されます。
 */

(() => {
    "use strict";

    const match =
        document.currentScript.src.match(/([^\/]+)\.js$/);

    const pluginName =
        match ? match[1] : "Mami_EndOfTextAnimation";

    const params =
        PluginManager.parameters(pluginName);

    function numberParam(name, defaultValue) {
        const value = params[name];

        return value === undefined || value === ""
            ? defaultValue
            : Number(value);
    }

    const imageName =
        String(params.Image || "message_sakura");

    const frameWidth =
        Math.max(1, numberParam("FrameWidth", 57));

    const frameHeight =
        Math.max(1, numberParam("FrameHeight", 57));

    const frameCount =
        Math.max(1, numberParam("FrameCount", 7));

    const animationSpeed =
        Math.max(1, numberParam("AnimationSpeed", 10));

    const horizontal =
        String(params.Horizontal || "true") === "true";

    const offsetX =
        numberParam("OffsetX", 4);

    const offsetY =
        numberParam("OffsetY", -10);

    const markerScale =
        Math.max(
            0.01,
            numberParam("Scale", 100) / 100
        );

    const markerOpacity =
        Math.max(
            0,
            Math.min(
                255,
                numberParam("Opacity", 255)
            )
        );

    const loop =
        String(params.Loop || "true") === "true";

    const debug =
        String(params.Debug || "false") === "true";

    /*
     * ページ内の文末情報を初期化
     */
    Window_Message.prototype.clearMamiEndPosition =
        function() {
            this._mamiEndX = null;
            this._mamiEndY = null;
            this._mamiHasEndPosition = false;
            this._mamiPageSerial =
                Number(this._mamiPageSerial || 0) + 1;
        };

    /*
     * すべての文字処理が通るprocessCharacterを監視。
     *
     * 通常文字だけを判定し、
     * 描画後のXと描画前のYを保存します。
     */
    const _Window_Base_processCharacter =
        Window_Base.prototype.processCharacter;

    Window_Base.prototype.processCharacter = function(
        textState
    ) {
        const character =
            textState.text[textState.index];

        const characterY =
            textState.y;

        const isNormalCharacter =
            character !== "\n" &&
            character !== "\f" &&
            character !== "\x1b";

        _Window_Base_processCharacter.call(
            this,
            textState
        );

        if (
            this instanceof Window_Message &&
            isNormalCharacter
        ) {
            this._mamiEndX =
                textState.x;

            this._mamiEndY =
                characterY;

            this._mamiHasEndPosition =
                true;
        }
    };

    /*
     * メッセージ開始
     */
    const _Window_Message_startMessage =
        Window_Message.prototype.startMessage;

    Window_Message.prototype.startMessage = function() {
        this.clearMamiEndPosition();

        _Window_Message_startMessage.call(this);
    };

    /*
     * 改ページ
     */
    const _Window_Message_newPage =
        Window_Message.prototype.newPage;

    Window_Message.prototype.newPage = function(
        textState
    ) {
        this.clearMamiEndPosition();

        _Window_Message_newPage.call(
            this,
            textState
        );
    };

    /*
     * 送りアニメーション
     */
    class Sprite_MamiEndMarker extends Sprite {
        constructor(messageWindow) {
            super();

            this._messageWindow =
                messageWindow;

            this._frameIndex = 0;
            this._frameWait = 0;
            this._lastPageSerial = -1;

            this.bitmap =
                ImageManager.loadPicture(imageName);

            this.anchor.set(0, 0);
            this.scale.set(
                markerScale,
                markerScale
            );

            this.opacity =
                markerOpacity;

            this.visible =
                false;

            this.updateFrame();
        }

        update() {
            super.update();

            const window =
                this._messageWindow;

            if (!window) {
                this.visible = false;
                return;
            }

            const canShow =
                window.visible &&
                window.isOpen() &&
                window.pause &&
                window._mamiHasEndPosition &&
                Number.isFinite(window._mamiEndX) &&
                Number.isFinite(window._mamiEndY);

            if (!canShow) {
                this.visible = false;
                return;
            }

            const pageSerial =
                Number(window._mamiPageSerial || 0);

            if (
                this._lastPageSerial !==
                pageSerial
            ) {
                this._lastPageSerial =
                    pageSerial;

                this._frameIndex = 0;
                this._frameWait = 0;

                this.updateFrame();

                if (debug) {
                    console.log(
                        "[Mami End Marker]",
                        "X:",
                        window._mamiEndX,
                        "Y:",
                        window._mamiEndY,
                        "page:",
                        pageSerial
                    );
                }
            }

            /*
             * SpriteをScene側へ置くため、
             * ウィンドウ座標とpaddingを加算します。
             */
            this.x =
                window.x +
                window.padding +
                window._mamiEndX +
                offsetX;

            this.y =
                window.y +
                window.padding +
                window._mamiEndY +
                offsetY;

            this.visible = true;
            this.opacity = markerOpacity;

            this.updateAnimation();
        }

        updateAnimation() {
            if (
                !this.bitmap ||
                !this.bitmap.isReady()
            ) {
                return;
            }

            this._frameWait++;

            if (
                this._frameWait <
                animationSpeed
            ) {
                return;
            }

            this._frameWait = 0;

            if (loop) {
                this._frameIndex =
                    (
                        this._frameIndex + 1
                    ) % frameCount;
            } else if (
                this._frameIndex <
                frameCount - 1
            ) {
                this._frameIndex++;
            }

            this.updateFrame();
        }

        updateFrame() {
            if (horizontal) {
                this.setFrame(
                    this._frameIndex *
                        frameWidth,
                    0,
                    frameWidth,
                    frameHeight
                );
            } else {
                this.setFrame(
                    0,
                    this._frameIndex *
                        frameHeight,
                    frameWidth,
                    frameHeight
                );
            }
        }
    }

    /*
     * Scene_Messageへ追加
     */
    const _Scene_Message_createMessageWindow =
        Scene_Message.prototype.createMessageWindow;

    Scene_Message.prototype.createMessageWindow =
        function() {
            _Scene_Message_createMessageWindow.call(
                this
            );

            if (
                this._messageWindow &&
                !this._mamiEndMarker
            ) {
                this._mamiEndMarker =
                    new Sprite_MamiEndMarker(
                        this._messageWindow
                    );

                this.addChild(
                    this._mamiEndMarker
                );
            }
        };

    /*
     * メッセージ終了
     */
    const _Window_Message_terminateMessage =
        Window_Message.prototype.terminateMessage;

    Window_Message.prototype.terminateMessage =
        function() {
            this.clearMamiEndPosition();

            _Window_Message_terminateMessage.call(
                this
            );
        };

    /*
     * 後片付け
     */
    const _Scene_Message_terminate =
        Scene_Message.prototype.terminate;

    Scene_Message.prototype.terminate =
        function() {
            if (this._mamiEndMarker) {
                if (
                    this._mamiEndMarker.parent
                ) {
                    this._mamiEndMarker.parent.removeChild(
                        this._mamiEndMarker
                    );
                }

                this._mamiEndMarker.destroy({
                    children: true,
                    texture: false,
                    baseTexture: false
                });

                this._mamiEndMarker = null;
            }

            _Scene_Message_terminate.call(
                this
            );
        };

    /*
     * 画像先読み
     */
    const _Scene_Boot_loadSystemImages =
        Scene_Boot.prototype.loadSystemImages;

    Scene_Boot.prototype.loadSystemImages =
        function() {
            _Scene_Boot_loadSystemImages.call(
                this
            );

            ImageManager.loadPicture(
                imageName
            );
        };
})();