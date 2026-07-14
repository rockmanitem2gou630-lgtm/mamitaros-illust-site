/*:
 * @target MZ
 * @plugindesc 現在の時間帯に合わせて来訪時の挨拶を表示します Ver1.0
 * @author マミタロス
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
 * @text 通通常表情へ戻る時間
 * @desc 挨拶終了後に通常表情へ戻るまでのフレーム数です。60で約1秒。
 * @type number
 * @min 0
 * @default 15
 *
 * @command ShowTimeGreeting
 * @text 時間帯別の挨拶を表示
 * @desc 現在の時間帯に合った挨拶をランダムで表示します。
 *
 * @help
 * Mami_TimeSystem.js が必要です。
 *
 * 現在のPC・スマホ時刻に応じて、
 * 朝・昼・夕方・夜・深夜の挨拶を表示します。
 *
 * 挨拶の内容は、このファイル内の GREETING_DATA に記述します。
 *
 * expression:
 * img/pictures内の画像ファイル名を、拡張子なしで指定します。
 *
 * 推奨プラグイン順：
 *
 * Mami_TimeSystem
 * Mami_BackgroundManager
 * Mami_CharacterToneManager
 * Mami_TimeGreeting
 */

(() => {
    "use strict";

    const pluginName = "Mami_TimeGreeting";
    const params = PluginManager.parameters(pluginName);

    const pictureId = Number(params.PictureId || 2);
    const pictureX = Number(params.PictureX || 640);
    const pictureY = Number(params.PictureY || 360);
    const scale = Number(params.Scale || 100);

    const defaultExpression = String(
        params.DefaultExpression || "norimune_normal"
    );

    const resetDelayFrames = Number(
        params.ResetDelay || 15
    );

    /*
     * ─────────────────────────────
     * 時間帯別の来訪挨拶
     * ─────────────────────────────
     *
     * 同じ時間帯に複数登録すると、
     * 起動するたびにランダムで選ばれます。
     */

    const GREETING_DATA = {
        morning: [
            {
                text: "おや、早いねぇ。\nもう目は覚めたのかい。",
                expression: "norimune_smile"
            },
            {
                text: "おはよう、お前さん。\n朝の空気は気持ちがいいね。",
                expression: "norimune_normal"
            }
        ],

        day: [
            {
                text: "おや、お客さんかい。\nまあ、ゆっくりしていくといい。",
                expression: "norimune_smile"
            },
            {
                text: "来たね、お前さん。\n今日は何を話そうか。",
                expression: "norimune_normal"
            }
        ],

        evening: [
            {
                text: "おや、こんな時分に。\n夕暮れを見に来たのかい。",
                expression: "norimune_smile"
            },
            {
                text: "日が暮れるねぇ。\n帰りが遅くならないようにしなさい。",
                expression: "norimune_fan"
            }
        ],

        night: [
            {
                text: "こんばんは、お前さん。\n夜風に当たりに来たのかい。",
                expression: "norimune_normal"
            },
            {
                text: "おや、まだ起きていたんだね。\n少しなら付き合おう。",
                expression: "norimune_smile"
            }
        ],

        midnight: [
            {
                text: "……お前さん。\nこんな夜更けに、どうしたんだい。",
                expression: "norimune_fan"
            },
            {
                text: "随分と遅い時間だねぇ。\n眠れないのかい。",
                expression: "norimune_normal"
            }
        ]
    };

    let resetRequested = false;
    let resetDelay = 0;

    function isTimeSystemReady() {
        return (
            window.MamiTimeSystem &&
            typeof MamiTimeSystem.getTimeZone === "function"
        );
    }

    function getTimeZone() {
        if (!isTimeSystemReady()) {
            console.warn(
                `[${pluginName}] Mami_TimeSystem.js が見つかりません。`
            );

            return "day";
        }

        return MamiTimeSystem.getTimeZone();
    }

    function showExpression(filename) {
        if (!filename) {
            return;
        }

        $gameScreen.showPicture(
            pictureId,
            filename,
            1, // 原点：中央
            pictureX,
            pictureY,
            scale,
            scale,
            255,
            0
        );
    }

    function selectGreeting(timeZone) {
        const greetings =
            GREETING_DATA[timeZone] || GREETING_DATA.day;

        if (!greetings || greetings.length === 0) {
            return null;
        }

        const index =
            Math.floor(Math.random() * greetings.length);

        return greetings[index];
    }

    function showTimeGreeting() {
        if ($gameMessage.isBusy()) {
            return;
        }

        const timeZone = getTimeZone();
        const greeting = selectGreeting(timeZone);

        if (!greeting) {
            console.warn(
                `[${pluginName}] 挨拶データがありません: ${timeZone}`
            );

            return;
        }

        showExpression(greeting.expression);

        const lines = String(greeting.text).split("\n");

        for (const line of lines) {
            $gameMessage.add(line);
        }

        resetRequested = true;
        resetDelay = resetDelayFrames;
    }

    PluginManager.registerCommand(
        pluginName,
        "ShowTimeGreeting",
        () => {
            showTimeGreeting();
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
 * 現在の季節を取得
 *
 * spring：春  3〜5月
 * summer：夏  6〜8月
 * autumn：秋  9〜11月
 * winter：冬  12〜2月
 */
MamiTimeSystem.getSeason = function() {
    const month = this.getDateInfo().month;

    if (month >= 3 && month <= 5) {
        return "spring";
    }

    if (month >= 6 && month <= 8) {
        return "summer";
    }

    if (month >= 9 && month <= 11) {
        return "autumn";
    }

    return "winter";
};

MamiTimeSystem.isSpring = function() {
    return this.getSeason() === "spring";
};

MamiTimeSystem.isSummer = function() {
    return this.getSeason() === "summer";
};

MamiTimeSystem.isAutumn = function() {
    return this.getSeason() === "autumn";
};

MamiTimeSystem.isWinter = function() {
    return this.getSeason() === "winter";
};

/*
 * 指定した月日か判定
 */
MamiTimeSystem.isDate = function(month, date) {
    const info = this.getDateInfo();

    return (
        info.month === Number(month) &&
        info.date === Number(date)
    );
};
})();