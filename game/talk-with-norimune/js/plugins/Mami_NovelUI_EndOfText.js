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
     * 実際に文字列が描画された直後に
     * 文末座標を保存します。
     *
     * 通常のタイプ表示と、
     * クリックによる高速表示の両方に対応します。
     */
    const _Window_Base_flushTextState =
        Window_Base.prototype.flushTextState;

    Window_Base.prototype.flushTextState =
        function(textState) {
            const hadText =
                this instanceof Window_Message &&
                textState &&
                typeof textState.buffer === "string" &&
                textState.buffer.length > 0;

            const characterY =
                textState ? textState.y : null;

            _Window_Base_flushTextState.call(
                this,
                textState
            );

            /*
             * flushTextState実行後のtextState.xが、
             * 実際に描画された文字列の右端です。
             */
            if (
                hadText &&
                Number.isFinite(textState.x) &&
                Number.isFinite(characterY)
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
     * 各ページの入力待ち開始時に
     * 文末座標を確定
     *
     * タイプ途中のクリック・タップで
     * 一気に全文表示された場合も、
     * そのページの最終位置へマーカーを移動します。
     */
    const _Window_Message_startPause =
        Window_Message.prototype.startPause;

    Window_Message.prototype.startPause =
        function() {

            /*
             * 座標はprocessCharacterで
             * 最後の文字を描画した時点ですでに保存済み。
             *
             * ここでは座標を上書きせず、
             * アニメーションだけ最初から再生します。
             */
            if (
                this._mamiHasEndPosition &&
                Number.isFinite(this._mamiEndX) &&
                Number.isFinite(this._mamiEndY)
            ) {
                this._mamiPageSerial =
                    Number(
                        this._mamiPageSerial || 0
                    ) + 1;
            }

            _Window_Message_startPause.call(
                this
            );
        };
    /*
     * タイプ中に全文表示した入力が、
     * そのまま次ページ送りに使われるのを防止
     */
    const _Window_Message_isTriggered =
        Window_Message.prototype.isTriggered;

    const _Window_Message_updateShowFast =
        Window_Message.prototype.updateShowFast;

    Window_Message.prototype.updateShowFast =
        function() {
            /*
             * 文字表示中にクリック・タップ・決定入力が
             * 行われたかを先に記録します。
             */
            const fastForwardTriggered =
                !!this._textState &&
                !this.pause &&
                _Window_Message_isTriggered.call(
                    this
                );

            _Window_Message_updateShowFast.call(
                this
            );

            /*
             * 全文表示に使った入力は、
             * 一度ボタンや指を離すまで
             * 次ページ送りには使用しません。
             */
            if (fastForwardTriggered) {
                this._mamiWaitInputRelease =
                    true;
            }
        };

    Window_Message.prototype.isTriggered =
        function() {
            if (this._mamiWaitInputRelease) {
                const stillPressed =
                    Input.isPressed("ok") ||
                    TouchInput.isPressed();

                /*
                 * 入力が離されたらロック解除。
                 * 解除したフレームでは進めず、
                 * 次の新しいクリックを待ちます。
                 */
                if (!stillPressed) {
                    this._mamiWaitInputRelease =
                        false;
                }

                return false;
            }

            return _Window_Message_isTriggered.call(
                this
            );
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