/*:
 * @target MZ
 * @plugindesc 時間帯に合わせて立ち絵の色調を自動変更します Ver1.1
 * @author マミタロス
 *
 * @param PictureId
 * @text 立ち絵ピクチャ番号
 * @type number
 * @min 1
 * @default 2
 *
 * @param MorningRed
 * @text 朝：赤
 * @type number
 * @min -255
 * @max 255
 * @default 18
 *
 * @param MorningGreen
 * @text 朝：緑
 * @type number
 * @min -255
 * @max 255
 * @default 10
 *
 * @param MorningBlue
 * @text 朝：青
 * @type number
 * @min -255
 * @max 255
 * @default -8
 *
 * @param MorningGray
 * @text 朝：灰色
 * @type number
 * @min 0
 * @max 255
 * @default 0
 *
 * @param DayRed
 * @text 昼：赤
 * @type number
 * @min -255
 * @max 255
 * @default 0
 *
 * @param DayGreen
 * @text 昼：緑
 * @type number
 * @min -255
 * @max 255
 * @default 0
 *
 * @param DayBlue
 * @text 昼：青
 * @type number
 * @min -255
 * @max 255
 * @default 0
 *
 * @param DayGray
 * @text 昼：灰色
 * @type number
 * @min 0
 * @max 255
 * @default 0
 *
 * @param EveningRed
 * @text 夕方：赤
 * @type number
 * @min -255
 * @max 255
 * @default 45
 *
 * @param EveningGreen
 * @text 夕方：緑
 * @type number
 * @min -255
 * @max 255
 * @default 10
 *
 * @param EveningBlue
 * @text 夕方：青
 * @type number
 * @min -255
 * @max 255
 * @default -20
 *
 * @param EveningGray
 * @text 夕方：灰色
 * @type number
 * @min 0
 * @max 255
 * @default 0
 *
 * @param NightRed
 * @text 夜：赤
 * @type number
 * @min -255
 * @max 255
 * @default -45
 *
 * @param NightGreen
 * @text 夜：緑
 * @type number
 * @min -255
 * @max 255
 * @default -35
 *
 * @param NightBlue
 * @text 夜：青
 * @type number
 * @min -255
 * @max 255
 * @default 20
 *
 * @param NightGray
 * @text 夜：灰色
 * @type number
 * @min 0
 * @max 255
 * @default 25
 *
 * @param MidnightRed
 * @text 深夜：赤
 * @type number
 * @min -255
 * @max 255
 * @default -70
 *
 * @param MidnightGreen
 * @text 深夜：緑
 * @type number
 * @min -255
 * @max 255
 * @default -55
 *
 * @param MidnightBlue
 * @text 深夜：青
 * @type number
 * @min -255
 * @max 255
 * @default 25
 *
 * @param MidnightGray
 * @text 深夜：灰色
 * @type number
 * @min 0
 * @max 255
 * @default 45
 *
 * @param FadeFrames
 * @text 時間帯変更時の変化時間
 * @desc 時間帯が変わった時に色調が切り替わる時間です。60で約1秒。
 * @type number
 * @min 0
 * @default 60
 *
 * @param CheckIntervalSeconds
 * @text 時間帯確認間隔
 * @desc 現在の時間帯を再確認する間隔です。
 * @type number
 * @min 1
 * @default 30
 *
 * @param AutoRefresh
 * @text 時間帯変化を自動反映
 * @type boolean
 * @on 有効
 * @off 無効
 * @default true
 *
 * @command RefreshTone
 * @text 色調を再判定
 * @desc 現在時刻を確認し、立ち絵の色調を更新します。
 *
 * @command ResetTone
 * @text 色調を初期化
 * @desc 立ち絵の色調を通常状態へ戻します。
 *
 * @help
 * Mami_TimeSystem.js が必要です。
 *
 * 時間帯に合わせ、指定したピクチャ番号の色調を変更します。
 *
 * 表情差分などで同じピクチャ番号へ新しい画像が表示された場合も、
 * 現在の時間帯に合った色調を自動的に適用し直します。
 *
 * 推奨プラグイン順：
 *
 * Mami_TimeSystem
 * Mami_BackgroundManager
 * Mami_CharacterToneManager
 * Mami_NorimuneMessageUI
 * Mami_NorimuneTalk
 *
 * 色調の各数値：
 *
 * 赤・緑・青：-255～255
 * 灰色：0～255
 *
 * 灰色を大きくすると彩度が低くなります。
 */

(() => {
    "use strict";

    const pluginName = "Mami_CharacterToneManager";
    const params = PluginManager.parameters(pluginName);

    const pictureId = Number(params.PictureId || 2);

    function numberParam(name, defaultValue) {
        const value = params[name];

        if (value === undefined || value === "") {
            return defaultValue;
        }

        return Number(value);
    }

    const tones = {
        morning: [
            numberParam("MorningRed", 18),
            numberParam("MorningGreen", 10),
            numberParam("MorningBlue", -8),
            numberParam("MorningGray", 0)
        ],

        day: [
            numberParam("DayRed", 0),
            numberParam("DayGreen", 0),
            numberParam("DayBlue", 0),
            numberParam("DayGray", 0)
        ],

        evening: [
            numberParam("EveningRed", 45),
            numberParam("EveningGreen", 10),
            numberParam("EveningBlue", -20),
            numberParam("EveningGray", 0)
        ],

        night: [
            numberParam("NightRed", -45),
            numberParam("NightGreen", -35),
            numberParam("NightBlue", 20),
            numberParam("NightGray", 25)
        ],

        midnight: [
            numberParam("MidnightRed", -70),
            numberParam("MidnightGreen", -55),
            numberParam("MidnightBlue", 25),
            numberParam("MidnightGray", 45)
        ]
    };

    const fadeFrames =
        Math.max(0, numberParam("FadeFrames", 60));

    const checkIntervalFrames =
        Math.max(
            1,
            numberParam("CheckIntervalSeconds", 30)
        ) * 60;

    const autoRefresh =
        String(params.AutoRefresh || "true") === "true";

    let currentTimeZone = "";
    let checkCounter = 0;

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

    function getTone(timeZone) {
        return tones[timeZone] || tones.day;
    }

    function applyTone(duration) {
        if (!$gameScreen) {
            return;
        }

        const picture = $gameScreen.picture(pictureId);

        if (!picture) {
            return;
        }

        const timeZone = getTimeZone();
        const tone = getTone(timeZone);

        $gameScreen.tintPicture(
            pictureId,
            tone.slice(),
            Math.max(0, duration)
        );
    }
function applyToneForTimeZone(
    timeZone,
    duration
) {
    if (!$gameScreen) {
        return;
    }

    const picture =
        $gameScreen.picture(
            pictureId
        );

    if (!picture) {
        return;
    }

    const tone =
        getTone(timeZone);

    $gameScreen.tintPicture(
        pictureId,
        tone.slice(),
        Math.max(0, duration)
    );

    currentTimeZone =
        timeZone;
}
    function refreshTone(force, duration) {
        const timeZone = getTimeZone();

        if (!force && timeZone === currentTimeZone) {
            return;
        }

        currentTimeZone = timeZone;
        applyTone(duration);
    }

    function resetTone() {
        if (!$gameScreen) {
            return;
        }

        const picture = $gameScreen.picture(pictureId);

        if (!picture) {
            return;
        }

        $gameScreen.tintPicture(
            pictureId,
            [0, 0, 0, 0],
            fadeFrames
        );
    }

    /*
     * 立ち絵が表示・差し替えされた直後にも、
     * 現在の時間帯の色調を即時適用する。
     *
     * これにより表情差分へ切り替えた瞬間、
     * 色調が昼の状態へ戻る現象を防ぎます。
     */

    const _Game_Screen_showPicture =
        Game_Screen.prototype.showPicture;

    Game_Screen.prototype.showPicture = function(
        id,
        name,
        origin,
        x,
        y,
        scaleX,
        scaleY,
        opacity,
        blendMode
    ) {
        _Game_Screen_showPicture.call(
            this,
            id,
            name,
            origin,
            x,
            y,
            scaleX,
            scaleY,
            opacity,
            blendMode
        );

        if (Number(id) === pictureId) {
            const timeZone = getTimeZone();
            const tone = getTone(timeZone);

            this.tintPicture(
                pictureId,
                tone.slice(),
                0
            );
        }
    };

    /*
     * マップ開始時に色調を適用
     */

    const _Scene_Map_start =
        Scene_Map.prototype.start;

    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);

        checkCounter = 0;
        currentTimeZone = "";
        refreshTone(true, 0);
    };

    /*
     * 時間帯が変わったか定期的に確認
     */

    const _Scene_Map_update =
        Scene_Map.prototype.update;

    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);

        if (!autoRefresh) {
            return;
        }

        checkCounter++;

        if (checkCounter >= checkIntervalFrames) {
            checkCounter = 0;
            refreshTone(false, fadeFrames);
        }
    };

    PluginManager.registerCommand(
        pluginName,
        "RefreshTone",
        () => {
            refreshTone(true, fadeFrames);
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "ResetTone",
        () => {
            resetTone();
        }
    );
    /*
 * 背景管理プラグインからの
 * 時間帯変更通知を受信。
 *
 * 背景とまったく同じタイミング・長さで
 * 立ち絵の色調を変更します。
 */
window.addEventListener(
    "mamiTimeZoneChanged",
    event => {
        const detail =
            event.detail || {};

        const timeZone =
            String(
                detail.timeZone ||
                getTimeZone()
            );

        const duration =
            Number(
                detail.duration ?? fadeFrames
            );

        applyToneForTimeZone(
            timeZone,
            duration
        );
    }
);
})();