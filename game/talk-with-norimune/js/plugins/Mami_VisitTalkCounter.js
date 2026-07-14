/*:
 * @target MZ
 * @plugindesc 訪問中の会話回数を数え、節目で専用台詞を表示します Ver1.0
 * @author GPT + マミタロス
 *
 * @param PictureId
 * @text 立ち絵ピクチャ番号
 * @type number
 * @min 1
 * @default 2
 *
 * @param PictureX
 * @text 立ち絵X座標
 * @type number
 * @default 640
 *
 * @param PictureY
 * @text 立ち絵Y座標
 * @type number
 * @default 360
 *
 * @param Scale
 * @text 立ち絵拡大率
 * @type number
 * @min 1
 * @default 100
 *
 * @param DefaultExpression
 * @text 通常表情画像
 * @type file
 * @dir img/pictures
 * @default norimune_normal
 *
 * @param ResetDelay
 * @text 通常表情へ戻る時間
 * @desc 専用台詞終了後、通常表情へ戻るまでのフレーム数です。
 * @type number
 * @min 0
 * @default 15
 *
 * @command CountTalk
 * @text 会話回数を1増やす
 * @desc 訪問中の会話回数を1増やし、節目台詞があれば表示します。
 *
 * @command ResetTalkCount
 * @text 会話回数をリセット
 *
 * @command ShowCurrentCount
 * @text 現在回数を変数へ代入
 *
 * @arg VariableId
 * @text 代入先変数
 * @type variable
 * @default 1
 *
 * @help
 * ページを閉じる、または再読み込みすると回数は0へ戻ります。
 * セーブデータには保存しません。
 *
 * 節目台詞は、このファイル内の MILESTONE_TALKS に記述します。
 *
 * CountTalk を「話す」ボタンのコモンイベント先頭へ置いてください。
 *
 * 例：
 *
 * 3回目
 * 7回目
 * 12回目
 *
 * のように、任意の回数へ専用台詞を登録できます。
 */

(() => {
    "use strict";

    const pluginName = "Mami_VisitTalkCounter";
    const params = PluginManager.parameters(pluginName);

    const pictureId =
        Number(params.PictureId || 2);

    const pictureX =
        Number(params.PictureX || 640);

    const pictureY =
        Number(params.PictureY || 360);

    const scale =
        Number(params.Scale || 100);

    const defaultExpression =
        String(params.DefaultExpression || "norimune_normal");

    const resetDelayFrames =
        Number(params.ResetDelay || 15);

    /*
     * ─────────────────────────────
     * 節目会話
     * ─────────────────────────────
     *
     * キーが会話回数です。
     *
     * text形式：
     * 1ページ、または || で複数ページ。
     *
     * pages形式：
     * ページごとに表情を変更できます。
     */

    const MILESTONE_TALKS = {
        3: {
            text: "今日はよく話すねぇ。",
            expression: "norimune_smile"
        },

        7: {
            pages: [
                {
                    text: "まだ帰る気はないらしい。",
                    expression: "norimune_fan"
                },
                {
                    text: "まあ、僕は構わないけれどね。",
                    expression: "norimune_smile"
                }
            ]
        },

        12: {
            text:
                "……お前さんも、なかなか物好きだ。||" +
                "それとも、よほど暇を持て余しているのかい。",
            expression: "norimune_fan"
        }
    };

    let talkCount = 0;
    let resetRequested = false;
    let resetDelay = 0;

    function showExpression(filename) {
        if (!filename) {
            return;
        }

        $gameScreen.showPicture(
            pictureId,
            filename,
            1,
            pictureX,
            pictureY,
            scale,
            scale,
            255,
            0
        );
    }

    /*
     * Mami_NorimuneTalkと同じ表情制御文字に対応
     */
    Window_Message.prototype.obtainMamiVisitExpressionName =
        function(textState) {
            const text = textState.text;
            const startIndex = textState.index;

            if (text[startIndex] !== "[") {
                return "";
            }

            const endIndex =
                text.indexOf("]", startIndex);

            if (endIndex < 0) {
                return "";
            }

            const filename =
                text.substring(
                    startIndex + 1,
                    endIndex
                );

            textState.index =
                endIndex + 1;

            return filename;
        };

    const _Window_Message_processEscapeCharacter =
        Window_Message.prototype.processEscapeCharacter;

    Window_Message.prototype.processEscapeCharacter =
        function(code, textState) {
            if (code === "MVEXP") {
                const filename =
                    this.obtainMamiVisitExpressionName(
                        textState
                    );

                if (filename) {
                    showExpression(filename);
                }

                return;
            }

            _Window_Message_processEscapeCharacter.call(
                this,
                code,
                textState
            );
        };

    function enqueueMilestoneTalk(talk) {
        if (
            Array.isArray(talk.pages) &&
            talk.pages.length > 0
        ) {
            for (
                let pageIndex = 0;
                pageIndex < talk.pages.length;
                pageIndex++
            ) {
                const page =
                    talk.pages[pageIndex] || {};

                const expression =
                    String(page.expression || "");

                const lines =
                    String(page.text || "").split("\n");

                if (lines.length === 0) {
                    lines.push("");
                }

                if (expression) {
                    lines[0] =
                        `\\MVEXP[${expression}]` +
                        lines[0];
                }

                for (const line of lines) {
                    $gameMessage.add(line);
                }

                if (
                    pageIndex <
                    talk.pages.length - 1
                ) {
                    $gameMessage.newPage();
                }
            }

            return;
        }

        showExpression(talk.expression);

        const pages =
            String(talk.text || "").split("||");

        for (
            let pageIndex = 0;
            pageIndex < pages.length;
            pageIndex++
        ) {
            const lines =
                pages[pageIndex].split("\n");

            for (const line of lines) {
                $gameMessage.add(line);
            }

            if (
                pageIndex <
                pages.length - 1
            ) {
                $gameMessage.newPage();
            }
        }
    }

    function countTalk() {
        talkCount++;

        const milestoneTalk =
            MILESTONE_TALKS[talkCount];

        if (!milestoneTalk) {
            return false;
        }

        if ($gameMessage.isBusy()) {
            return false;
        }

        enqueueMilestoneTalk(milestoneTalk);

        resetRequested = true;
        resetDelay = resetDelayFrames;

        return true;
    }

    PluginManager.registerCommand(
        pluginName,
        "CountTalk",
        () => {
            countTalk();
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "ResetTalkCount",
        () => {
            talkCount = 0;
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "ShowCurrentCount",
        args => {
            const variableId =
                Number(args.VariableId || 0);

            if (variableId > 0) {
                $gameVariables.setValue(
                    variableId,
                    talkCount
                );
            }
        }
    );

    const _Scene_Map_update =
        Scene_Map.prototype.update;

    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);

        if (!resetRequested) {
            return;
        }

        if ($gameMessage.isBusy()) {
            return;
        }

        if (resetDelay > 0) {
            resetDelay--;
            return;
        }

        resetRequested = false;
        showExpression(defaultExpression);
    };

    /*
     * 外部から現在回数を参照できるようにする
     */
    window.MamiVisitTalkCounter = {
        getCount() {
            return talkCount;
        },

        reset() {
            talkCount = 0;
        }
    };
})();