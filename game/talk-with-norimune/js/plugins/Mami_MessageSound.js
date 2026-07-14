/*:
 * @target MZ
 * @plugindesc メッセージ文字送り音・ページ送り音 Ver2.0
 * @author マミタロス
 *
 * @param EnableTypeSound
 * @text 文字送り音を使う
 * @type boolean
 * @on 使用する
 * @off 使用しない
 * @default true
 *
 * @param TypeSounds
 * @text 文字送りSE
 * @desc 複数の場合は半角カンマ区切り。拡張子は不要です。
 * @type string
 * @default mami_type_01,mami_type_02,mami_type_03
 *
 * @param TypeVolume
 * @text 文字送り音量
 * @type number
 * @min 0
 * @max 100
 * @default 20
 *
 * @param TypePitch
 * @text 文字送り基本ピッチ
 * @type number
 * @min 50
 * @max 150
 * @default 100
 *
 * @param TypePitchRandom
 * @text 文字送りピッチ変動
 * @desc 4なら基本ピッチから±4で揺れます。
 * @type number
 * @min 0
 * @max 50
 * @default 4
 *
 * @param TypePan
 * @text 文字送り定位
 * @type number
 * @min -100
 * @max 100
 * @default 0
 *
 * @param CharactersPerSound
 * @text 何文字ごとに鳴らすか
 * @type number
 * @min 1
 * @default 2
 *
 * @param MinimumIntervalFrames
 * @text 文字音の最低間隔
 * @desc 前回のタイプ音から最低何フレーム空けるか。
 * @type number
 * @min 0
 * @default 2
 *
 * @param DelayAfterAdvanceFrames
 * @text ページ送り後の音休止
 * @desc ページ送りや選択肢決定後、タイプ音を休止するフレーム数。
 * @type number
 * @min 0
 * @default 3
 *
 * @param IgnoredCharacters
 * @text 鳴らさない文字
 * @desc ここに含まれる文字は文字数にも数えません。
 * @type string
 * @default 　 、。！？!?…‥・「」『』（）()【】［］[]〈〉《》,.：:；;〜～
 *
 * @param IgnoreFastForward
 * @text 高速送り中は鳴らさない
 * @type boolean
 * @on 鳴らさない
 * @off 鳴らす
 * @default true
 *
 * @param EnablePageSound
 * @text ページ送り音を使う
 * @type boolean
 * @on 使用する
 * @off 使用しない
 * @default true
 *
 * @param PageSounds
 * @text ページ送りSE
 * @desc 複数の場合は半角カンマ区切り。拡張子は不要です。
 * @type string
 * @default mami_page_01,mami_page_02
 *
 * @param PageVolume
 * @text ページ送り音量
 * @type number
 * @min 0
 * @max 100
 * @default 45
 *
 * @param PagePitch
 * @text ページ送り基本ピッチ
 * @type number
 * @min 50
 * @max 150
 * @default 100
 *
 * @param PagePitchRandom
 * @text ページ送りピッチ変動
 * @type number
 * @min 0
 * @max 50
 * @default 2
 *
 * @param PagePan
 * @text ページ送り定位
 * @type number
 * @min -100
 * @max 100
 * @default 0
 * 
 * @param PageAdvanceWait
 * @text ページ送り待機フレーム
 * @type number
 * @min 0
 * @default 3
 *
 * @command EnableTypeSound
 * @text 文字送り音を有効化
 *
 * @command DisableTypeSound
 * @text 文字送り音を無効化
 *
 * @command EnablePageSound
 * @text ページ送り音を有効化
 *
 * @command DisablePageSound
 * @text ページ送り音を無効化
 *
 * @help
 * メッセージ表示中に文字送りSEを再生します。
 *
 * ページ送りSEは、入力待ちになった瞬間ではなく、
 * プレイヤーがクリック・決定入力をした瞬間に鳴ります。
 *
 * ページ送り直後は、指定フレームだけタイプ音を休止します。
 * 文章そのものは止めないため、表示テンポは変わりません。
 *
 * 音声ファイルは audio/se に入れてください。
 *
 * 例：
 * audio/se/mami_type_01.ogg
 * audio/se/mami_page_01.ogg
 *
 * プラグイン設定では拡張子を書きません。
 *
 * 推奨順：
 *
 * Mami_NorimuneMessageUI
 * Mami_MessageSound
 * Mami_EndOfTextAnimation
 * Mami_ImageChoiceUI
 */

(() => {
    "use strict";

    const pluginName =
        document.currentScript.src.match(/([^\/]+)\.js$/)?.[1] ||
        "Mami_MessageSound";

    const params =
        PluginManager.parameters(pluginName);

    function numberParam(name, defaultValue) {
        const value = params[name];

        if (value === undefined || value === "") {
            return defaultValue;
        }

        return Number(value);
    }

    function booleanParam(name, defaultValue) {
        const value = params[name];

        if (value === undefined || value === "") {
            return defaultValue;
        }

        return String(value) === "true";
    }

    function parseSoundNames(value) {
        return String(value || "")
            .split(",")
            .map(name => name.trim())
            .filter(name => name.length > 0);
    }

    const typeSoundNames =
        parseSoundNames(
            params.TypeSounds ||
            "mami_type_01,mami_type_02,mami_type_03"
        );

    const typeVolume =
        Math.max(
            0,
            Math.min(
                100,
                numberParam("TypeVolume", 20)
            )
        );

    const typePitch =
        Math.max(
            50,
            Math.min(
                150,
                numberParam("TypePitch", 100)
            )
        );

    const typePitchRandom =
        Math.max(
            0,
            numberParam("TypePitchRandom", 4)
        );

    const typePan =
        Math.max(
            -100,
            Math.min(
                100,
                numberParam("TypePan", 0)
            )
        );

    const charactersPerSound =
        Math.max(
            1,
            numberParam("CharactersPerSound", 2)
        );

    const minimumIntervalFrames =
        Math.max(
            0,
            numberParam("MinimumIntervalFrames", 2)
        );

    const delayAfterAdvanceFrames =
        Math.max(
            0,
            numberParam("DelayAfterAdvanceFrames", 3)
        );

    const ignoredCharacters =
        new Set(
            String(
                params.IgnoredCharacters ||
                "　 、。！？!?…‥・「」『』（）()【】［］[]〈〉《》,.：:；;〜～"
            ).split("")
        );

    const ignoreFastForward =
        booleanParam(
            "IgnoreFastForward",
            true
        );

    const pageSoundNames =
        parseSoundNames(
            params.PageSounds ||
            "mami_page_01,mami_page_02"
        );

    const pageVolume =
        Math.max(
            0,
            Math.min(
                100,
                numberParam("PageVolume", 45)
            )
        );

    const pagePitch =
        Math.max(
            50,
            Math.min(
                150,
                numberParam("PagePitch", 100)
            )
        );

    const pagePitchRandom =
        Math.max(
            0,
            numberParam("PagePitchRandom", 2)
        );

    const pagePan =
        Math.max(
            -100,
            Math.min(
                100,
                numberParam("PagePan", 0)
            )
        );

    let typeSoundEnabled =
        booleanParam(
            "EnableTypeSound",
            true
        );

    let pageSoundEnabled =
        booleanParam(
            "EnablePageSound",
            true
        );

const pageAdvanceWait =
    Math.max(
        0,
        numberParam(
            "PageAdvanceWait",
            3
        )
    );

    /*
     * ─────────────────────────────
     * 共通SE処理
     * ─────────────────────────────
     */

    function randomArrayItem(array) {
        if (!array || array.length === 0) {
            return "";
        }

        return array[
            Math.floor(
                Math.random() *
                array.length
            )
        ];
    }

    function randomPitch(
        basePitch,
        randomRange
    ) {
        if (randomRange <= 0) {
            return Math.round(basePitch);
        }

        const difference =
            Math.random() *
            randomRange *
            2 -
            randomRange;

        return Math.max(
            50,
            Math.min(
                150,
                Math.round(
                    basePitch +
                    difference
                )
            )
        );
    }

    function playRandomSe(
        names,
        volume,
        pitch,
        pitchRandom,
        pan
    ) {
        const name =
            randomArrayItem(names);

        if (!name) {
            return;
        }

        AudioManager.playSe({
            name: name,
            volume: volume,
            pitch: randomPitch(
                pitch,
                pitchRandom
            ),
            pan: pan
        });
    }

    /*
     * ─────────────────────────────
     * メッセージ状態
     * ─────────────────────────────
     */

    const _Window_Message_initialize =
        Window_Message.prototype.initialize;

    Window_Message.prototype.initialize =
        function(rect) {
            _Window_Message_initialize.call(
                this,
                rect
            );

            this.resetMamiMessageSoundState();
        };

    Window_Message.prototype
    .resetMamiMessageSoundState =
    function() {
        this._mamiSoundCharacterCount = 0;
        this._mamiSoundLastFrame = -999999;
        this._mamiTypeSoundDelay = 0;

        this._mamiAdvanceWait = 0;
        this._mamiPendingAdvance = false;
    };

    /*
     * 新しいメッセージ開始
     */

    const _Window_Message_startMessage =
        Window_Message.prototype.startMessage;

    Window_Message.prototype.startMessage =
        function() {
            this.resetMamiMessageSoundState();

            _Window_Message_startMessage.call(
                this
            );
        };

    /*
     * 改ページ時
     */

    const _Window_Message_newPage =
        Window_Message.prototype.newPage;

    Window_Message.prototype.newPage =
        function(textState) {
            this._mamiSoundCharacterCount = 0;

            _Window_Message_newPage.call(
                this,
                textState
            );
        };

    /*
     * 毎フレーム、タイプ音休止時間を減らす
     */

    const _Window_Message_update =
        Window_Message.prototype.update;

    Window_Message.prototype.update =
        function() {
            _Window_Message_update.call(this);

            if (this._mamiTypeSoundDelay > 0) {
                this._mamiTypeSoundDelay--;
            }
        };

    /*
     * ─────────────────────────────
     * 高速表示判定
     * ─────────────────────────────
     */

    Window_Message.prototype
        .isMamiMessageFastForwarding =
        function() {
            return Boolean(
                this._showFast ||
                this._lineShowFast ||
                Input.isPressed("control")
            );
        };

    Window_Message.prototype
        .shouldPlayMamiTypeSound =
        function(character) {
            if (!typeSoundEnabled) {
                return false;
            }

            if (this._mamiTypeSoundDelay > 0) {
                return false;
            }

            if (
                !character ||
                ignoredCharacters.has(character)
            ) {
                return false;
            }

            if (
                ignoreFastForward &&
                this.isMamiMessageFastForwarding()
            ) {
                return false;
            }

            return true;
        };

    /*
     * ─────────────────────────────
     * 文字送り音
     * ─────────────────────────────
     *
     * updateMessageの前後で文字位置を比較します。
     */

    const _Window_Message_updateMessage =
        Window_Message.prototype.updateMessage;

    Window_Message.prototype.updateMessage =
        function() {
            const textStateBefore =
                this._textState;

            const oldIndex =
                textStateBefore
                    ? textStateBefore.index
                    : -1;

            const oldText =
                textStateBefore
                    ? textStateBefore.text
                    : "";

            const result =
            
                _Window_Message_updateMessage.call(
                    this
                );

            if (
                oldIndex < 0 ||
                !oldText ||
                !this._textState
            ) {
                return result;
            }

            const newIndex =
                this._textState.index;

            if (newIndex <= oldIndex) {
                return result;
            }

            /*
             * 1フレーム中に複数文字進むこともあるため、
             * 進んだ範囲を順番に確認します。
             */
            for (
                let index = oldIndex;
                index < newIndex;
                index++
            ) {
                const character =
                    oldText[index];

                /*
                 * 制御文字の開始、改行、改ページは除外
                 */
                if (
                    !character ||
                    character === "\x1b" ||
                    character === "\\" ||
                    character === "\n" ||
                    character === "\f"
                ) {
                    continue;
                }

                if (
                    !this.shouldPlayMamiTypeSound(
                        character
                    )
                ) {
                    continue;
                }

                this._mamiSoundCharacterCount++;

                if (
                    this._mamiSoundCharacterCount <
                    charactersPerSound
                ) {
                    continue;
                }

                this._mamiSoundCharacterCount = 0;

                const currentFrame =
                    Graphics.frameCount;

                if (
                    currentFrame -
                    this._mamiSoundLastFrame <
                    minimumIntervalFrames
                ) {
                    continue;
                }

                this._mamiSoundLastFrame =
                    currentFrame;

                playRandomSe(
                    typeSoundNames,
                    typeVolume,
                    typePitch,
                    typePitchRandom,
                    typePan
                );

                /*
                 * 同一フレームに何度も重ねない。
                 */
                break;
            }

            return result;
        };

    /*
 * ─────────────────────────────
 * ページ送り音＋ページ開始待機
 * ─────────────────────────────
 */

const _Window_Message_updateInput =
    Window_Message.prototype.updateInput;

Window_Message.prototype.updateInput = function() {
    /*
     * 送り音を鳴らしたあとの待機中。
     * この間はツクール本来のページ送り処理を止めます。
     */
    if (this._mamiPendingAdvance) {
        if (this._mamiAdvanceWait > 0) {
            this._mamiAdvanceWait--;
            return true;
        }

        /*
         * 待機終了。
         * 入力待ちを解除して、次ページの描画へ進めます。
         */
        this._mamiPendingAdvance = false;
        this.pause = false;

        /*
         * 最終ページなら会話を終了。
         * 続きがある場合はupdateMessageが次ページを描画します。
         */
        if (!this._textState) {
            this.terminateMessage();
        }

        return true;
    }

    /*
     * 現在がページ送り待ちで、
     * 決定入力された瞬間だけ検知。
     */
    const advanceTriggered =
        this.pause &&
        (
            Input.isTriggered("ok") ||
            TouchInput.isTriggered()
        );

    if (advanceTriggered) {
        if (pageSoundEnabled) {
            playRandomSe(
                pageSoundNames,
                pageVolume,
                pagePitch,
                pagePitchRandom,
                pagePan
            );
        }

        /*
         * 次ページ冒頭のタイプ音も少し休止。
         */
        this.delayMamiTypeSound(
            Math.max(
                delayAfterAdvanceFrames,
                pageAdvanceWait
            )
        );

        this._mamiSoundCharacterCount = 0;

        /*
         * 待機が0なら、その場で通常の入力処理へ進む。
         */
        if (pageAdvanceWait <= 0) {
            return _Window_Message_updateInput.call(this);
        }

        /*
         * ページ送りをいったん保留。
         */
        this._mamiPendingAdvance = true;
        this._mamiAdvanceWait = pageAdvanceWait;

        return true;
    }

    return _Window_Message_updateInput.call(this);
};

    /*
     * ─────────────────────────────
     * タイプ音を一時休止
     * ─────────────────────────────
     */

    Window_Message.prototype.delayMamiTypeSound =
        function(frames) {
            this._mamiTypeSoundDelay =
                Math.max(
                    this._mamiTypeSoundDelay || 0,
                    Math.max(
                        0,
                        Number(frames || 0)
                    )
                );

            this._mamiSoundCharacterCount = 0;
        };

    /*
     * メッセージ終了
     */

    const _Window_Message_terminateMessage =
        Window_Message.prototype
            .terminateMessage;

    Window_Message.prototype.terminateMessage =
        function() {
            this.resetMamiMessageSoundState();

            _Window_Message_terminateMessage.call(
                this
            );
        };

    /*
     * ─────────────────────────────
     * 外部連携
     * ─────────────────────────────
     */

    window.MamiMessageSound = {
        delayTypeSound(
            frames = delayAfterAdvanceFrames
        ) {
            const scene =
                SceneManager._scene;

            const messageWindow =
                scene &&
                scene._messageWindow;

            if (
                !messageWindow ||
                typeof messageWindow
                    .delayMamiTypeSound !==
                    "function"
            ) {
                return;
            }

            messageWindow.delayMamiTypeSound(
                frames
            );
        },

        getDefaultDelayFrames() {
            return delayAfterAdvanceFrames;
        }
    };

    /*
     * ─────────────────────────────
     * プラグインコマンド
     * ─────────────────────────────
     */

    PluginManager.registerCommand(
        pluginName,
        "EnableTypeSound",
        () => {
            typeSoundEnabled = true;
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "DisableTypeSound",
        () => {
            typeSoundEnabled = false;
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "EnablePageSound",
        () => {
            pageSoundEnabled = true;
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "DisablePageSound",
        () => {
            pageSoundEnabled = false;
        }
    );

    /*
     * ─────────────────────────────
     * SE先読み
     * ─────────────────────────────
     */

    const _Scene_Boot_loadSystemImages =
        Scene_Boot.prototype.loadSystemImages;

    Scene_Boot.prototype.loadSystemImages =
        function() {
            _Scene_Boot_loadSystemImages.call(
                this
            );

            const names = [
                ...typeSoundNames,
                ...pageSoundNames
            ];

            const uniqueNames =
                [...new Set(names)];

            for (const name of uniqueNames) {
                if (!name) {
                    continue;
                }

                AudioManager.loadStaticSe({
                    name: name,
                    volume: 90,
                    pitch: 100,
                    pan: 0
                });
            }
        };
})();