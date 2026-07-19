/*:
 * @target MZ
 * @plugindesc 電王会話作品用・放置台詞 Ver1.0
 * @author マミタロス
 *
 * @param FirstIdleSeconds
 * @text 最初の放置時間
 * @desc 最初の放置台詞が出るまでの秒数です。
 * @type number
 * @min 1
 * @default 30
 *
 * @param NextIdleMinSeconds
 * @text 2回目以降の最短時間
 * @desc 2回目以降の放置台詞が出るまでの最短秒数です。
 * @type number
 * @min 1
 * @default 45
 *
 * @param NextIdleMaxSeconds
 * @text 2回目以降の最長時間
 * @desc 2回目以降の放置台詞が出るまでの最長秒数です。
 * @type number
 * @min 1
 * @default 75
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
 * @default portrait_ryotaro_base_ryotaro_normal
 *
 * @param ResetDelay
 * @text 通常表情へ戻る時間
 * @desc 放置台詞終了後、通常表情へ戻るまでのフレーム数。60で約1秒です。
 * @type number
 * @min 0
 * @default 15
 *
 * @command EnableIdleTalk
 * @text 放置台詞を有効化
 *
 * @command DisableIdleTalk
 * @text 放置台詞を無効化
 *
 * @command ResetIdleTimer
 * @text 放置時間をリセット
 *
 * @help
 * 一定時間、マウス・タッチ・キー操作がない場合に、
 * 放置台詞をランダムで表示します。
 *
 * ・会話中は発生しません。
 * ・退室画面中は発生しません。
 * ・同じ台詞は連続しません。
 * ・ページを再読み込みすると履歴はリセットされます。
 *
 * 放置台詞は、このファイル内の IDLE_TALKS に記述してください。
 *
 * expression:
 * img/pictures内の画像名を、拡張子なしで指定します。
 * 空欄の場合は現在の立ち絵を変更しません。
 */

(() => {
    "use strict";

    const pluginName = "Mami_DenOIdleTalk";
    const params = PluginManager.parameters(pluginName);

    const firstIdleSeconds =
        Number(params.FirstIdleSeconds || 30);

    const nextIdleMinSeconds =
        Number(params.NextIdleMinSeconds || 45);

    const nextIdleMaxSeconds =
        Number(params.NextIdleMaxSeconds || 75);

    const pictureId =
        Number(params.PictureId || 2);

    const pictureX =
        Number(params.PictureX || 640);

    const pictureY =
        Number(params.PictureY || 360);

    const scale =
        Number(params.Scale || 100);

    const defaultExpression =
        String(params.DefaultExpression || "portrait_ryotaro_base_ryotaro_normal");

    const resetDelayFrames =
        Number(params.ResetDelay || 15);

    /*
     * ─────────────────────────────
     * 放置台詞
     * ─────────────────────────────
     */

    const IDLE_TALK_DATA = {
    ryotaro: [
        // 良太郎用
        {
        text:
            "澪さん？\nどうかした？",
        expression:
            "portrait_ryotaro_base_ryotaro_normal"
    },
    {
        text:
            "眠くなっちゃったのかな……。",
        expression:
            "portrait_ryotaro_base_ryotaro_worried"
    },
    {
        text:
            "急がなくていいよ。\n僕はここにいるから。",
        expression:
            "portrait_ryotaro_base_ryotaro_smile"
    },
    {
        text:
            "静かだね。\nデンライナーじゃ、ちょっと珍しいかも。",
        expression:
            "portrait_ryotaro_base_ryotaro_smile"
    },
    {
        text:
            "考え事？\n邪魔しないほうがいいかな。",
        expression:
            "portrait_ryotaro_base_ryotaro_normal"
    },
    {
        text:
            "澪さん、疲れてない？\n少し休んでもいいんだよ。",
        expression:
            "portrait_ryotaro_base_ryotaro_worried"
    },
    {
        text:
            "……こうして黙ってるのも、\n僕は嫌いじゃないよ。",
        expression:
            "portrait_ryotaro_base_ryotaro_smile"
    },
    {
        text:
            "もしかして、僕の顔に\n何かついてる……？",
        expression:
            "portrait_ryotaro_base_ryotaro_worried"
    }
    ],

    momotaros: [
        // モモ用
        {
        text:
            "おい、澪！\n聞いてんのか？",
        expression:
            "portrait_momotaros_base_default_angry"
    },
    {
        text:
            "まさか寝てんじゃねぇだろうな。",
        expression:
            "portrait_momotaros_base_default_angry"
    },
    {
        text:
            "ったく……。\n俺を待たせるとはいい度胸だぜ。",
        expression:
            "portrait_momotaros_base_default_angry"
    },
    {
        text:
            "おい。\n黙って見てんじゃねぇよ。",
        expression:
            "portrait_momotaros_base_default_angryshy"
    },
    {
        text:
            "……まあ、別にいいけどよ。\n用ができたら呼べ。",
        expression:
            "portrait_momotaros_base_default_normal"
    },
    {
        text:
            "澪、腹減ってねぇか？\n俺は減った。",
        expression:
            "portrait_momotaros_base_default_normal"
    },
    {
        text:
            "暇なら何かしようぜ！\nじっとしてんのは性に合わねぇ！",
        expression:
            "portrait_momotaros_base_default_normal"
    },
    {
        text:
            "……なんだよ。\n俺といると落ち着くってか？",
        expression:
            "portrait_momotaros_base_default_angryshy"
    },
    {
        text:
            "寝るならちゃんと寝ろ。\nこんなとこで寝落ちすんなよ。",
        expression:
            "portrait_momotaros_base_default_angry"
    },
    {
        text:
            "澪ー！\n返事しろー！",
        expression:
            "portrait_momotaros_base_default_angry"
    }
]
};

    let idleEnabled = true;
    let idleFrames = 0;
    let targetIdleFrames = firstIdleSeconds * 60;

    let lastTalkIndex = -1;

    let resetExpressionRequested = false;
    let resetExpressionDelay = 0;

    /*
     * 次回の放置時間をランダムに決める
     */

    function makeNextIdleFrames() {
        const min = Math.min(
            nextIdleMinSeconds,
            nextIdleMaxSeconds
        );

        const max = Math.max(
            nextIdleMinSeconds,
            nextIdleMaxSeconds
        );

        const seconds =
            min + Math.random() * (max - min);

        return Math.round(seconds * 60);
    }

    /*
     * 操作があった時にタイマーをリセット
     */

    function resetIdleTimer() {
        idleFrames = 0;
    }

    /*
     * 放置台詞を発生できる状態か
     */

    function canShowIdleTalk(scene) {
        if (!idleEnabled) {
            return false;
        }

        if (!(scene instanceof Scene_Map)) {
            return false;
        }

        if (!$gameMessage) {
            return false;
        }

        if ($gameMessage.isBusy()) {
            return false;
        }

        if (
            $gameTemp &&
            $gameTemp.isCommonEventReserved()
        ) {
            return false;
        }

        /*
         * 退室・再訪画面が表示されている間は停止
         */
        if (scene._DenOEndingLayer) {
            return false;
        }

        return true;
    }

    /*
     * 立ち絵差分を表示
     */

    /*
 * 電王会話本体を通して、
 * 現在キャラクターの一時表情を表示する。
 */
function showExpression(
    speakerId,
    filename
) {
    if (
        !speakerId ||
        !filename
    ) {
        return;
    }

    if (
        !window.MamiDenOTalk ||
        typeof window.MamiDenOTalk
            .showIdleExpression !==
            "function"
    ) {
        return;
    }

    window.MamiDenOTalk
        .showIdleExpression(
            speakerId,
            filename
        );
}

/*
 * 放置台詞前の通常立ち絵へ戻す。
 */
function restoreExpression() {
    if (
        !window.MamiDenOTalk ||
        typeof window.MamiDenOTalk
            .restoreIdlePortrait !==
            "function"
    ) {
        return;
    }

    window.MamiDenOTalk
        .restoreIdlePortrait();
}

    /*
     * 同じ台詞が連続しないように抽選
     */

    function getCurrentIdleSpeaker() {
    /*
     * 会話本体がまだ利用できない場合は、
     * 良太郎を標準にする。
     */
    if (
        !window.MamiDenOTalk ||
        typeof window.MamiDenOTalk
            .getMainCharacter !==
            "function"
    ) {
        return "ryotaro";
    }

    /*
     * 憑依中なら、
     * 現在憑依しているイマジンを優先。
     *
     * M良太郎でもモモ用放置台詞を使う。
     */
    if (
        typeof window.MamiDenOTalk
            .getPossessionState ===
            "function"
    ) {
        const possession =
            window.MamiDenOTalk
                .getPossessionState();

        if (
            possession &&
            possession.active &&
            possession.imagin
        ) {
            return String(
                possession.imagin
            );
        }
    }

    /*
     * 未憑依なら、
     * 現在のメインキャラクターを使う。
     */
    const mainCharacter =
        window.MamiDenOTalk
            .getMainCharacter();

    return String(
        mainCharacter &&
        mainCharacter.speaker ||
        "ryotaro"
    );
}

/*
 * 同じ台詞が連続しないように抽選
 */
function selectIdleTalk() {
    const speakerId =
        getCurrentIdleSpeaker();

    const idleTalks =
        IDLE_TALK_DATA[
            speakerId
        ] || [];

    if (idleTalks.length === 0) {
        return null;
    }

    if (idleTalks.length === 1) {
    lastTalkIndex = 0;

    return {
        ...idleTalks[0],
        speaker:
            speakerId
    };
}

    const candidates = [];

    for (
        let index = 0;
        index < idleTalks.length;
        index++
    ) {
        if (index !== lastTalkIndex) {
            candidates.push(index);
        }
    }

    const selectedIndex =
        candidates[
            Math.floor(
                Math.random() *
                candidates.length
            )
        ];

    lastTalkIndex =
        selectedIndex;

    return {
    ...idleTalks[
        selectedIndex
    ],
    speaker:
        speakerId
};
}

/*
 * 放置台詞を表示
 */
function showIdleTalk() {
        const talk = selectIdleTalk();

        if (!talk) {
            return;
        }

        showExpression(
    talk.speaker,
    talk.expression
);

        const lines =
            String(talk.text).split("\n");

        for (const line of lines) {
            $gameMessage.add(line);
        }

        resetExpressionRequested = true;
        resetExpressionDelay = resetDelayFrames;

        idleFrames = 0;
        targetIdleFrames = makeNextIdleFrames();
    }

    /*
     * マウス移動を検知
     */

    if (TouchInput._onMouseMove) {
        const _TouchInput_onMouseMove =
            TouchInput._onMouseMove;

        TouchInput._onMouseMove = function(event) {
            _TouchInput_onMouseMove.call(this, event);
            resetIdleTimer();
        };
    }

    /*
     * クリック・タップを検知
     */

    if (TouchInput._onTrigger) {
        const _TouchInput_onTrigger =
            TouchInput._onTrigger;

        TouchInput._onTrigger = function(x, y) {
            _TouchInput_onTrigger.call(this, x, y);
            resetIdleTimer();
        };
    }

    /*
     * 右クリック・キャンセル操作を検知
     */

    if (TouchInput._onCancel) {
        const _TouchInput_onCancel =
            TouchInput._onCancel;

        TouchInput._onCancel = function(x, y) {
            _TouchInput_onCancel.call(this, x, y);
            resetIdleTimer();
        };
    }

    /*
     * キーボード操作を検知
     */

    if (Input._onKeyDown) {
        const _Input_onKeyDown =
            Input._onKeyDown;

        Input._onKeyDown = function(event) {
            _Input_onKeyDown.call(this, event);
            resetIdleTimer();
        };
    }

    /*
     * 毎フレーム更新
     */

    const _Scene_Map_update =
        Scene_Map.prototype.update;

    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);

        /*
         * 放置台詞後の通常表情復帰
         */
        if (resetExpressionRequested) {
            if ($gameMessage.isBusy()) {
                return;
            }

            if (resetExpressionDelay > 0) {
                resetExpressionDelay--;
                return;
            }

            resetExpressionRequested = false;

restoreExpression();

resetIdleTimer();
return;
        }

        /*
         * 会話中などはタイマーを進めない
         */
        if (!canShowIdleTalk(this)) {
            resetIdleTimer();
            return;
        }

        idleFrames++;

        if (idleFrames >= targetIdleFrames) {
            showIdleTalk();
        }
    };

    /*
     * プラグインコマンド
     */

    PluginManager.registerCommand(
        pluginName,
        "EnableIdleTalk",
        () => {
            idleEnabled = true;
            resetIdleTimer();
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "DisableIdleTalk",
        () => {
            idleEnabled = false;
            resetIdleTimer();
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "ResetIdleTimer",
        () => {
            resetIdleTimer();
        }
    );
})();