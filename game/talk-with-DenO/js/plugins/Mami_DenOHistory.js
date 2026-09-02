/*:
 * @target MZ
 * @plugindesc 電王会話作品用・会話履歴 Ver0.1
 * @author マミタロス
 *
 * @help
 * Mami_DenOTalk が付ける \MWIN と \MSPK を読み取り、
 * 既存会話を編集せずに会話履歴を作ります。
 *
 * 使用画像：img/pictures/btn_history.png
 */

(() => {
    "use strict";

    const BUTTON = {
    image: "btn_history",
    x: 1165,
    y: 472,
    storyY: 520,
    hitWidth: 120,
    hitHeight: 70
};
/*
 * ─────────────────────────────
 * 履歴画面の画像設定
 * ─────────────────────────────
 */
const HISTORY_UI = {
    x: 160,
    y: 35,
    width: 960,
    height: 650,

    /*
     * 外枠から履歴内容までの余白。
     */
    contentInsetX: 34,
    contentInsetTop: 18,
    contentInsetBottom: 34,

    frameImage:
        "window_history_frame",

    entryImage:
        "window_history_entry",

    entryWidth: 860,
    entryHeight: 96,

entryOpacity: 255,

/*
 * 履歴全体の背面に敷く
 * 黒い半透明板。
 */
panelOpacity: 155
};

/*
 * 直近200ページ。
 * 増やす場合はここを変更。
 */
const MAX_PAGES = 200;

    const NAMES = {
        ryotaro: "野上良太郎",
        momotaros: "モモタロス",
        urataros: "ウラタロス",
        kintaros: "キンタロス",
        ryutaros: "リュウタロス",
        mio: "月城澪",
        naomi: "ナオミ",
        hana: "ハナ",
        owner: "オーナー",
        airi: "野上愛理",
        yuto: "桜井侑斗",
        deneb: "デネブ",
        sieg: "ジーク"
    };
/*
 * ─────────────────────────────
 * 履歴の話者カラー
 * ─────────────────────────────
 *
 * 名前だけを担当カラーにする。
 * 登録されていない人物は汎用グレー。
 */
const SPEAKER_NAME_COLORS = {
    /*
     * 良太郎は明るめのグレー。
     */
    ryotaro: "#b9bec9",

    /*
     * イマジン。
     */
    momotaros: "#ff6666",
    urataros: "#69a7ff",
    kintaros: "#e4c34f",
    ryutaros: "#b98aff",

    /*
     * 澪。
     */
    mio: "#f0a6c3",

    /*
     * おまけ登場組。
     */
    deneb: "#69c78a",
    sieg: "#eeeeF3"
};

/*
 * 担当色を持たない人物。
 *
 * 良太郎より少し濃いグレーだが、
 * 暗い背景にも沈まない明るさ。
 */
const DEFAULT_SPEAKER_NAME_COLOR =
    "#8f97a5";

/*
 * 内側の声の本文。
 *
 * 通常本文より少し控えめだが、
 * しっかり読める明るさ。
 */
const INNER_VOICE_TEXT_COLOR =
    "#c2c7d1";

function getSpeakerNameColor(
    speakerId
) {
    return (
        SPEAKER_NAME_COLORS[
            String(speakerId || "")
        ] ||
        DEFAULT_SPEAKER_NAME_COLOR
    );
}

    let history = [];
    let nextTopicId = 1;

    function nameOf(id) {
        id = String(id || "");

        return NAMES[id] || id;
    }
/*
 * 履歴の通常本文色。
 *
 * ColorManager.normalColor()には頼らず、
 * スマホで長時間動作しても変化しない
 * 固定色を使用する。
 */
const NORMAL_HISTORY_TEXT_COLOR =
    "#f2f2f2";
    /*
 * 履歴内の実際の発言数を数える。
 *
 * 話題区切り用の空白は
 * MAX_PAGESに含めない。
 */
function countHistoryMessages() {
    let count = 0;

    for (
        const entry of history
    ) {
        if (
            entry &&
            entry.type === "message"
        ) {
            count++;
        }
    }

    return count;
}
const NAME_PLATE_FILES = {
    ryotaro: "name_ryotaro",
    momotaros: "name_momotaros",
    urataros: "name_urataros",
    kintaros: "name_kintaros",
    ryutaros: "name_ryutaros",
    mio: "name_mio"
};

let currentSpeakerIdForUi = "";
/*
 * 履歴を開く前の
 * 通常UI表示状態を保存する。
 */
/*
 * 履歴を開く前のUI状態。
 *
 * nullはまだ保存していない状態。
 */
let savedNormalButtonsVisible = null;
let savedRandomButtonVisible = null;

/*
 * 二重に保存・復元しないための印。
 */
let controlsHiddenForHistory = false;
function setBehindTalkUiVisible(visible) {
    const scene =
        SceneManager._scene;

    if (!scene) {
        return;
    }

    /*
     * 元の会話ウィンドウ。
     *
     * close() / open() はせず、
     * visible だけ切り替える。
     * そのほうが表示中の状態を保てる。
     */
    const messageWindow =
        scene._messageWindow;

    if (messageWindow) {
        messageWindow.visible =
            visible;
    }

    /*
     * もし名前ボックスを使っているなら、
     * それも一緒に隠す。
     */
    const nameBoxWindow =
        scene._nameBoxWindow;

    if (nameBoxWindow) {
        nameBoxWindow.visible =
            visible;
    }

    /*
     * カスタムのネームプレート。
     */
    if (
        window.MamiDenOMessageUI
    ) {
        if (!visible) {
            if (
                typeof MamiDenOMessageUI
                    .hideNamePlate ===
                "function"
            ) {
                MamiDenOMessageUI
                    .hideNamePlate();
            }
        } else {
            const plateName =
                NAME_PLATE_FILES[
                    currentSpeakerIdForUi
                ];

            if (
                plateName &&
                typeof MamiDenOMessageUI
                    .showNamePlate ===
                "function"
            ) {
                MamiDenOMessageUI
                    .showNamePlate(
                        plateName
                    );
            }
        }
    }
}
/*
 * ─────────────────────────────
 * 履歴表示中の操作UI
 * ─────────────────────────────
 */
function hideControlUiForHistory() {
    /*
     * 二重実行すると、すでに隠れた状態を
     * 「元の状態」として保存してしまうので防ぐ。
     */
    if (controlsHiddenForHistory) {
        return;
    }

    controlsHiddenForHistory = true;

    /*
     * 下の4ボタン。
     */
    const denOUi =
        window.MamiDenOUI;

    if (
        denOUi &&
        typeof denOUi
            .areButtonsVisible ===
            "function"
    ) {
        savedNormalButtonsVisible =
            denOUi
                .areButtonsVisible();
    } else {
        savedNormalButtonsVisible =
            true;
    }

    if (
        denOUi &&
        typeof denOUi
            .hideButtons ===
            "function"
    ) {
        denOUi.hideButtons();
    }

    /*
     * 左上の憑依乱入許可ボタン。
     */
    const scene =
        SceneManager._scene;

    const randomButton =
        scene
            ? scene
                ._randomPossessionButton
            : null;

    if (randomButton) {
        savedRandomButtonVisible =
            randomButton.visible;

        randomButton.visible =
            false;
    } else {
        savedRandomButtonVisible =
            null;
    }
}

function restoreControlUiAfterHistory() {
    if (!controlsHiddenForHistory) {
        return;
    }

    /*
     * 下の4ボタンを元の状態へ戻す。
     */
    const denOUi =
        window.MamiDenOUI;

    if (denOUi) {
        if (
            savedNormalButtonsVisible ===
                true &&
            typeof denOUi
                .showButtons ===
                "function"
        ) {
            denOUi.showButtons();
        } else if (
            savedNormalButtonsVisible ===
                false &&
            typeof denOUi
                .hideButtons ===
                "function"
        ) {
            denOUi.hideButtons();
        }
    }

    /*
     * 左上の憑依乱入許可ボタンを戻す。
     */
    const scene =
        SceneManager._scene;

    const randomButton =
        scene
            ? scene
                ._randomPossessionButton
            : null;

    if (
        randomButton &&
        savedRandomButtonVisible !==
            null
    ) {
        randomButton.visible =
            savedRandomButtonVisible;
    }

    /*
     * 次回のために初期化。
     */
    savedNormalButtonsVisible =
        null;

    savedRandomButtonVisible =
        null;

    controlsHiddenForHistory =
        false;
}
/*
 * 区切り用の空白は無視する。
 */
function getLastHistoryMessage() {
    for (
        let index =
            history.length - 1;
        index >= 0;
        index--
    ) {
        const entry =
            history[index];

        if (
            entry &&
            entry.type === "message"
        ) {
            return entry;
        }
    }

    return null;
}

/*
 * 古い履歴を削除する。
 */
function trimHistory() {
    while (
        countHistoryMessages() >
        MAX_PAGES
    ) {
        history.shift();
    }

    /*
     * 削除の結果、
     * 履歴の先頭が区切りだけに
     * なった場合は取り除く。
     */
    while (
        history.length > 0 &&
        history[0] &&
        history[0].type ===
            "separator"
    ) {
        history.shift();
    }
}

function addHistory(page) {
    if (!page || !page.topicId) {
        return;
    }

    currentSpeakerIdForUi =
        String(page.speakerId || "");

    const lastMessage =
        getLastHistoryMessage();

    if (
        lastMessage &&
        lastMessage.topicId !==
            page.topicId
    ) {
        history.push({
            type: "separator"
        });
    }

    history.push({
        type: "message",
        topicId: page.topicId,
        speakerId: String(page.speakerId || ""),
        speakerName: nameOf(page.speakerId),
        text: String(page.text || ""),
        innerVoice: page.innerVoice === true,
        hideName: page.hideName === true
    });

    trimHistory();
}

    function ensureCapture(message) {
        if (!message._mamiLogQueue) {
            message._mamiLogQueue = [];
        }

        if (
            message._mamiLogTopicId ===
            undefined
        ) {
            message._mamiLogTopicId = 0;
        }

        if (
            message._mamiLogPending ===
            undefined
        ) {
            message._mamiLogPending = null;
        }
    }

    function stripControls(text) {
        return String(text || "")
            .replace(
                /\\M[A-Z]+\[[^\]]*\]/g,
                ""
            )
            .replace(
                /\\MDARK/g,
                ""
            );
    }

    function finishCapturedPage(
        message
    ) {
        ensureCapture(message);

        const page =
            message._mamiLogPending;

        if (!page) {
            return;
        }

        message._mamiLogQueue.push({
            topicId:
                page.topicId,

            speakerId:
                page.speakerId,

            innerVoice:
                page.innerVoice,

            hideName:
                page.hideName === true,

            text:
                page.lines.join("\n")
        });

        message._mamiLogPending = null;
    }

    function captureLine(
        message,
        text
    ) {
        ensureCapture(message);

        const source =
            String(text || "");

        const speaker =
            source.match(
                /\\MSPK\[([^\]]*)\]/
            );

        if (speaker) {
            finishCapturedPage(
                message
            );

            if (
                !message
                    ._mamiLogTopicId
            ) {
                message
                    ._mamiLogTopicId =
                    nextTopicId++;
            }

            const frame =
                source.match(
                    /\\MWIN\[([^\]]*)\]/
                );

            /*
             * MSPKは
             *   speakerId
             *   speakerId|noname
             * の両方を受け付ける。
             *
             * |noname はネームプレート非表示の印。
             * 履歴には内部指定を出さず、
             * 話者IDだけを保存する。
             */
            const speakerToken =
                String(
                    speaker[1] || ""
                );

            const speakerParts =
                speakerToken.split("|");

            const speakerId =
                String(
                    speakerParts.shift() || ""
                );

            const hideName =
                speakerParts.some(
                    flag =>
                        String(flag || "")
                            .toLowerCase() ===
                        "noname"
                );

            message._mamiLogPending = {
                topicId:
                    message
                        ._mamiLogTopicId,

                speakerId:
                    speakerId,

                innerVoice:
                    !!(
                        frame &&
                        frame[1] ===
                            "inner"
                    ),

                hideName:
                    hideName,

                lines: [
                    stripControls(
                        source
                    )
                ]
            };
        } else if (
            message._mamiLogPending
        ) {
            message
                ._mamiLogPending
                .lines
                .push(
                    stripControls(
                        source
                    )
                );
        }
    }

    /*
     * ─────────────────────────────
     * メッセージの自動採取
     * ─────────────────────────────
     */

    const _Game_Message_clear =
        Game_Message.prototype.clear;

    Game_Message.prototype.clear =
        function() {
            _Game_Message_clear
                .call(this);

            this._mamiLogQueue = [];
            this._mamiLogTopicId = 0;
            this._mamiLogPending = null;
        };

    const _Game_Message_add =
        Game_Message.prototype.add;

    Game_Message.prototype.add =
        function(text) {
            _Game_Message_add
                .call(
                    this,
                    text
                );

            captureLine(
                this,
                text
            );
        };

    const _Game_Message_newPage =
        Game_Message.prototype.newPage;

    Game_Message.prototype.newPage =
        function() {
            finishCapturedPage(
                this
            );

            _Game_Message_newPage
                .call(this);
        };

    const _Window_Message_startMessage =
        Window_Message.prototype
            .startMessage;

    Window_Message.prototype
        .startMessage =
        function() {
            finishCapturedPage(
                $gameMessage
            );

            _Window_Message_startMessage
                .call(this);
        };

    const _Window_Message_newPage =
        Window_Message.prototype.newPage;

    Window_Message.prototype.newPage =
        function(textState) {
            _Window_Message_newPage
                .call(
                    this,
                    textState
                );

            ensureCapture(
                $gameMessage
            );

            const page =
                $gameMessage
                    ._mamiLogQueue
                    .shift();

            /*
             * 実際にページ表示が
             * 始まった時だけ履歴へ入れる。
             */
            if (page) {
                addHistory(page);
            }
        };

    /*
     * ─────────────────────────────
     * 履歴UI共通処理
     * ─────────────────────────────
     */

    function currentHistoryWindow() {
        const scene =
            SceneManager._scene;

        return scene
            ? scene
                ._dialogueHistoryWindow
            : null;
    }

    function isHistoryOpen() {
        const historyWindow =
            currentHistoryWindow();

        return !!(
            historyWindow &&
            historyWindow
                .isHistoryOpen()
        );
    }
    function isStoryActive() {
    return !!(
        window.MamiDenOStory &&
        typeof window.MamiDenOStory
            .isActive ===
            "function" &&
        window.MamiDenOStory
            .isActive()
    );
}

function currentHistoryButtonY() {
    return isStoryActive()
        ? BUTTON.storyY
        : BUTTON.y;
}

    function pointOnButton(
        x,
        y
    ) {
        return (
            Math.abs(
                x - BUTTON.x
            ) <=
                BUTTON.hitWidth / 2 &&
            Math.abs(
                y - currentHistoryButtonY()
            ) <=
                BUTTON.hitHeight / 2
        );
    }

function protectButtonTouch() {
    return (
        history.length > 0 &&
        (
            isHistoryOpen() ||
            (
                $gameMessage &&
                $gameMessage
                    .isBusy()
            )
        ) &&
        pointOnButton(
            TouchInput.x,
            TouchInput.y
        )
    );
}

/*
 * ─────────────────────────────
 * 仮の履歴ウィンドウ
 * ─────────────────────────────
 */
class Window_DialogueHistory
    extends Window_Selectable {

    constructor(rect) {
        super(rect);

        this._historyOpen =
            false;

        this.opacity = 0;
        this.backOpacity = 0;

        this._entryBitmap =
            ImageManager.loadPicture(
                HISTORY_UI.entryImage
            );

        this._entryBitmap
            .addLoadListener(
                () => {
                    if (
                        this._historyOpen
                    ) {
                        this.refresh();
                    }
                }
            );

        this.hide();
        this.deactivate();
    }

        isHistoryOpen() {
            return this._historyOpen;
        }

        maxItems() {
            return history.length;
        }

        itemHeight() {
            return 106;
        }
        /*
         * Window_Selectableが標準で描く
         * 項目ごとの黒い背景を消す。
         */
        drawItemBackground(index) {
        }
        /*
         * 選択カーソルは表示しない。
         * スワイプとホイールだけ使用。
         */
        isCursorMovable() {
            return false;
        }

        updateCursor() {
            this.setCursorRect(
                0,
                0,
                0,
                0
            );
        }

        processOk() {
        }

        processCancel() {
            this.closeHistory();
        }

        openHistory() {
            this._historyOpen =
                true;

            /*
             * 後ろのメッセージウィンドウ等を
             * 非表示にする既存処理。
             */
            setBehindTalkUiVisible(false);
            /*
             * 左上と下部の操作UIを隠す。
             */
            hideControlUiForHistory();
            /*
             * 履歴用の大枠画像を表示。
             */
            const scene =
                SceneManager._scene;

            if (
                scene &&
                scene._dialogueHistoryFrame
            ) {
                scene
                    ._dialogueHistoryFrame
                    .visible = true;
            }

            if (
                scene &&
                scene._dialogueHistoryPanel
            ) {
                scene
                    ._dialogueHistoryPanel
                    .visible = true;
            }  

            this.refresh();
            this.show();
            this.open();
            this.activate();

            this.scrollTo(
                0,
                this.maxScrollY()
            );

            TouchInput.clear();
            Input.clear();

        }

closeHistory() {
    this._historyOpen =
        false;

    setBehindTalkUiVisible(true);

    const scene =
        SceneManager._scene;

    if (
        scene &&
        scene._dialogueHistoryFrame
    ) {
        scene
            ._dialogueHistoryFrame
            .visible = false;
    }

    if (
        scene &&
        scene._dialogueHistoryPanel
    ) {
        scene
            ._dialogueHistoryPanel
            .visible = false;
    }

    this.deactivate();
    this.close();
    this.hide();

    /*
     * 履歴側を全部消したあとで、
     * 通常UIを復元する。
     */
    restoreControlUiAfterHistory();

    TouchInput.clear();
    Input.clear();
}

drawItem(index) {
    const page =
        history[index];

    if (!page) {
        return;
    }

    /*
     * 話題区切り用の空白枠。
     */
    if (
        page.type ===
        "separator"
    ) {
        return;
    }

    const rect =
        this.itemRect(index);

    /*
     * カード画像の表示サイズ。
     *
     * ウィンドウ内部より画像が大きい場合は、
     * 自動で内側へ収める。
     */
    const cardWidth =
        Math.min(
            HISTORY_UI.entryWidth,
            rect.width - 16
        );

    const cardHeight =
        HISTORY_UI.entryHeight;

    /*
     * カードを項目内の中央へ置く。
     */
    const cardX =
        rect.x +
        Math.floor(
            (
                rect.width -
                cardWidth
            ) / 2
        );

    const cardY =
        rect.y +
        Math.floor(
            (
                this.itemHeight() -
                cardHeight
            ) / 2
        );

    /*
     * 発言カード画像。
     */
    if (
        this._entryBitmap &&
        this._entryBitmap.isReady()
    ) {
        this.contents.paintOpacity =
            HISTORY_UI.entryOpacity;

        this.contents.blt(
            this._entryBitmap,
            0,
            0,
            this._entryBitmap.width,
            this._entryBitmap.height,
            cardX,
            cardY,
            cardWidth,
            cardHeight
        );

        this.contents.paintOpacity =
            255;
    } else {
        /*
         * 画像読み込み前の予備背景。
         */
        this.contents.fillRect(
            cardX,
            cardY,
            cardWidth,
            cardHeight,
            "rgba(15, 18, 24, 0.80)"
        );
    }

    /*
     * 左のメタル部分へ、
     * 話者カラーの細い光を重ねる。
     */
    const speakerColor =
        getSpeakerNameColor(
            page.speakerId
        );

    this.contents.fillRect(
        cardX + 27,
        cardY + 14,
        5,
        cardHeight - 28,
        speakerColor
    );

    /*
     * 話者名。
     *
     * カード左側の金属装飾を避けて、
     * 少し右から始める。
     */
    this.contents.fontSize =
        18;

    this.contents.fontBold =
        true;

    this.contents.outlineColor =
        "rgba(0, 0, 0, 0.95)";

    this.contents.outlineWidth =
        3;

    this.changeTextColor(
        speakerColor
    );

    if (!page.hideName) {
        this.drawText(
            page.speakerName +
                (
                    page.innerVoice
                        ? "（内側）"
                        : ""
                ),
            cardX + 70,
            cardY + 6,
            cardWidth - 94,
            "left"
        );
    }

    /*
     * 本文。
     */
    this.contents.fontBold =
        false;

    this.contents.fontSize =
        20;

    this.contents.outlineColor =
        "rgba(0, 0, 0, 0.80)";

    this.contents.outlineWidth =
        2;

/*
 * 長時間動作時も本文色が
 * ウィンドウスキンの状態に左右されないよう、
 * 履歴専用の固定色を使う。
 */
this.contents.paintOpacity = 255;

this.changeTextColor(
    page.innerVoice
        ? INNER_VOICE_TEXT_COLOR
        : NORMAL_HISTORY_TEXT_COLOR
);
    const lines =
        String(
            page.text || ""
        )
            .split("\n")
            .slice(
                0,
                2
            );

    lines.forEach(
        (
            line,
            lineIndex
        ) => {
            this.drawText(
                line,
                cardX + 82,
                cardY +
                    31 +
                    lineIndex * 22,
                cardWidth - 108,
                "left"
            );
        }
    );

    /*
     * 次の項目へ色設定を持ち越さない。
     */
    this.resetTextColor();

    this.contents.fontBold =
        false;

    this.contents.outlineWidth =
        3;
}
    }

    /*
     * ─────────────────────────────
     * 履歴ボタン
     * ─────────────────────────────
     */

    class Sprite_DialogueHistoryButton
        extends Sprite_Clickable {

        constructor() {
            super();

            this._mamiHistoryControl =
                true;

            this._hovered = false;

            this.bitmap =
                ImageManager
                    .loadPicture(
                        BUTTON.image
                    );

            this.anchor.set(
                0.5,
                0.5
            );

            this.position.set(
                BUTTON.x,
                currentHistoryButtonY()
            );

            this.visible = false;
        }

        /*
         * x・yはスプライト中心を0とした
         * ローカル座標で渡される。
         */
        hitTest(
            x,
            y
        ) {
            return (
                Math.abs(x) <=
                    BUTTON.hitWidth / 2 &&
                Math.abs(y) <=
                    BUTTON.hitHeight / 2
            );
        }

        update() {
            super.update();

            this.y =
                currentHistoryButtonY();

            this.visible =
                history.length > 0 &&
                (
                    (
                        $gameMessage &&
                        $gameMessage
                            .isBusy()
                    ) ||
                    isHistoryOpen()
                );

            if (!this.visible) {
                return;
            }

            const targetScale =
                this.isPressed()
                    ? 0.97
                    : (
                        this._hovered
                            ? 1.05
                            : 1
                    );

            this.scale.x +=
                (
                    targetScale -
                    this.scale.x
                ) *
                0.20;

            this.scale.y +=
                (
                    targetScale -
                    this.scale.y
                ) *
                0.20;
        }

        onMouseEnter() {
            this._hovered = true;
        }

        onMouseExit() {
            this._hovered = false;
        }

        onClick() {
            if (!this.visible) {
                return;
            }

            const historyWindow =
                currentHistoryWindow();

            if (!historyWindow) {
                return;
            }

            if (
                historyWindow
                    .isHistoryOpen()
            ) {
                historyWindow
                    .closeHistory();
            } else {
                historyWindow
                    .openHistory();
            }

            TouchInput.clear();
        }
    }

function createHistoryUi(scene) {
    /*
     * ─────────────────────────────
     * 履歴の内容表示領域
     * ─────────────────────────────
     */
    const contentX =
        HISTORY_UI.x +
        HISTORY_UI.contentInsetX;

    const contentY =
        HISTORY_UI.y +
        HISTORY_UI.contentInsetTop;

    const contentWidth =
        HISTORY_UI.width -
        HISTORY_UI.contentInsetX * 2;

    const contentHeight =
        HISTORY_UI.height -
        HISTORY_UI.contentInsetTop -
        HISTORY_UI.contentInsetBottom;

/*
 * 左右へ2pxずつ広げ、
 * フレームとの微細な隙間を隠す。
 */
const panelOverflowX = 2;

const panelWidth =
    contentWidth +
    panelOverflowX * 2;

const panelX =
    contentX -
    panelOverflowX;
    /*
     * ─────────────────────────────
     * 履歴全体の黒い半透明板
     * ─────────────────────────────
     */
    const panelBitmap =
        new Bitmap(
            panelWidth,
            contentHeight
        );

    panelBitmap.fillRect(
        0,
        0,
        panelWidth,
        contentHeight,
        "#000000"
    );

    const panelSprite =
        new Sprite(
            panelBitmap
        );

    panelSprite.x =
        panelX;

    panelSprite.y =
        contentY;

    panelSprite.opacity =
        HISTORY_UI.panelOpacity;

    panelSprite.visible =
        false;

    scene._dialogueHistoryPanel =
        panelSprite;

    /*
     * 黒い板は履歴ウィンドウより後ろ。
     */
    if (
        scene._windowLayer
    ) {
        const windowLayerIndex =
            scene.getChildIndex(
                scene._windowLayer
            );

        scene.addChildAt(
            panelSprite,
            Math.max(
                0,
                windowLayerIndex
            )
        );
    } else {
        scene.addChild(
            panelSprite
        );
    }

    /*
     * ─────────────────────────────
     * 履歴画面の外枠
     * ─────────────────────────────
     */
    const frameSprite =
        new Sprite(
            ImageManager.loadPicture(
                HISTORY_UI.frameImage
            )
        );

    frameSprite.x =
        HISTORY_UI.x;

    frameSprite.y =
        HISTORY_UI.y;

    frameSprite.visible =
        false;

    /*
     * 元画像の大きさが違っても、
     * 指定サイズへ合わせる。
     */
    frameSprite.bitmap
        .addLoadListener(
            () => {
                if (
                    frameSprite.bitmap.width >
                    0
                ) {
                    frameSprite.scale.x =
                        HISTORY_UI.width /
                        frameSprite.bitmap.width;
                }

                if (
                    frameSprite.bitmap.height >
                    0
                ) {
                    frameSprite.scale.y =
                        HISTORY_UI.height /
                        frameSprite.bitmap.height;
                }
            }
        );

    scene._dialogueHistoryFrame =
        frameSprite;

    /*
     * ─────────────────────────────
     * カードと文字のスクロール領域
     * ─────────────────────────────
     */
    const rect =
        new Rectangle(
            contentX,
            contentY,
            contentWidth,
            contentHeight
        );

    scene._dialogueHistoryWindow =
        new Window_DialogueHistory(
            rect
        );

    /*
     * 黒い板より前へ。
     */
    scene.addWindow(
        scene
            ._dialogueHistoryWindow
    );

    /*
     * 外枠はカードと文字より前へ。
     *
     * カードの端が少しはみ出しても、
     * 金属枠で上から隠れる。
     */
    scene.addChild(
        frameSprite
    );

    /*
     * 履歴ボタンは最前面。
     */
    scene._dialogueHistoryButton =
        new Sprite_DialogueHistoryButton();

    scene.addChild(
        scene
            ._dialogueHistoryButton
    );
}
    /*
     * 履歴表示中は、
     * 背後の通常ボタンを押せなくする。
     */
    const _Sprite_Clickable_processTouch =
        Sprite_Clickable.prototype
            .processTouch;

    Sprite_Clickable.prototype
        .processTouch =
        function() {
            if (
                isHistoryOpen() &&
                !this
                    ._mamiHistoryControl
            ) {
                return;
            }

            _Sprite_Clickable_processTouch
                .call(this);
        };

    /*
     * 履歴を開いている間は
     * 会話進行を完全停止。
     */
    const _Window_Message_updateWait =
        Window_Message.prototype
            .updateWait;

    Window_Message.prototype
        .updateWait =
        function() {
            return isHistoryOpen()
                ? true
                : _Window_Message_updateWait
                    .call(this);
        };

    const _Window_Message_updateInput =
        Window_Message.prototype
            .updateInput;

    Window_Message.prototype
        .updateInput =
        function() {
            return isHistoryOpen()
                ? true
                : _Window_Message_updateInput
                    .call(this);
        };

    const _Window_Message_updateMessage =
        Window_Message.prototype
            .updateMessage;

    Window_Message.prototype
        .updateMessage =
        function() {
            /*
             * 履歴を開いている間だけ、
             * メッセージ描画を一時停止する。
             */
            if (isHistoryOpen()) {
                return false;
            }

            return _Window_Message_updateMessage
                .call(this);
        };

    const _Window_Message_isTriggered =
        Window_Message.prototype
            .isTriggered;

    Window_Message.prototype
        .isTriggered =
        function() {
            if (isHistoryOpen()) {
                return false;
            }

            /*
             * 履歴ボタンを押したタップを
             * 会話送りにしない。
             */
            if (
                protectButtonTouch() &&
                (
                    TouchInput
                        .isTriggered() ||
                    TouchInput
                        .isRepeated()
                )
            ) {
                return false;
            }

            return _Window_Message_isTriggered
                .call(this);
        };

    /*
     * 履歴中のメニュー・
     * マップタッチを止める。
     */
    const _Scene_Map_isMenuCalled =
        Scene_Map.prototype
            .isMenuCalled;

    Scene_Map.prototype
        .isMenuCalled =
        function() {
            return isHistoryOpen()
                ? false
                : _Scene_Map_isMenuCalled
                    .call(this);
        };

    const _Scene_Map_processMapTouch =
        Scene_Map.prototype
            .processMapTouch;

    Scene_Map.prototype
        .processMapTouch =
        function() {
            if (!isHistoryOpen()) {
                _Scene_Map_processMapTouch
                    .call(this);
            }
        };

    /*
     * ボタン画像を先読み。
     */
    const _Scene_Boot_loadSystemImages =
        Scene_Boot.prototype
            .loadSystemImages;

    Scene_Boot.prototype
    .loadSystemImages =
    function() {
        _Scene_Boot_loadSystemImages
            .call(this);

        ImageManager.loadPicture(
            BUTTON.image
        );

        ImageManager.loadPicture(
            HISTORY_UI.frameImage
        );

        ImageManager.loadPicture(
            HISTORY_UI.entryImage
        );
    };

    /*
     * マップ画面へ履歴UIを追加。
     */
    const _Scene_Map_createDisplayObjects =
        Scene_Map.prototype
            .createDisplayObjects;

    Scene_Map.prototype
        .createDisplayObjects =
        function() {
            _Scene_Map_createDisplayObjects
                .call(this);

            createHistoryUi(this);
        };

    /*
     * デバッグ確認用。
     */
    window.MamiDenOHistory = {
        getHistory() {
            return history.map(
                page => ({
                    ...page
                })
            );
        },

        clearHistory() {
            history = [];
        },

        isOpen() {
            return isHistoryOpen();
        }
    };
})();