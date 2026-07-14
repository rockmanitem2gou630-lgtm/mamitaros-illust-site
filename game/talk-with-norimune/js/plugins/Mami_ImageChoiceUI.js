/*:
 * @target MZ
 * @plugindesc 画像式・可変幅選択肢UI＋選択後返答ウェイト Ver2.0
 * @author マミタロス
 *
 * @param NormalImage
 * @text 通常時の札画像
 * @type file
 * @dir img/pictures
 * @default choice_normal
 *
 * @param SelectedImage
 * @text 選択時の札画像
 * @type file
 * @dir img/pictures
 * @default choice_selected
 *
 * @param SliceLeft
 * @text 左端の固定幅
 * @desc 横3分割時に固定する左端の幅です。
 * @type number
 * @min 0
 * @default 32
 *
 * @param SliceRight
 * @text 右端の固定幅
 * @desc 横3分割時に固定する右端の幅です。
 * @type number
 * @min 0
 * @default 32
 *
 * @param ItemHeight
 * @text 選択肢の高さ
 * @type number
 * @min 1
 * @default 64
 *
 * @param ItemGap
 * @text 選択肢同士の間隔
 * @type number
 * @min 0
 * @default 12
 *
 * @param TextPadding
 * @text 文字左右の余白
 * @type number
 * @min 0
 * @default 48
 *
 * @param MinItemWidth
 * @text 選択肢の最小幅
 * @type number
 * @min 1
 * @default 220
 *
 * @param MaxItemWidth
 * @text 選択肢の最大幅
 * @desc 0で画面幅に合わせて自動設定します。
 * @type number
 * @min 0
 * @default 900
 *
 * @param FontSize
 * @text 文字サイズ
 * @type number
 * @min 1
 * @default 26
 *
 * @param TextColor
 * @text 通常時の文字色
 * @type string
 * @default #3b2d27
 *
 * @param SelectedTextColor
 * @text 選択時の文字色
 * @type string
 * @default #6a3f20
 *
 * @param TextOutlineColor
 * @text 文字の縁取り色
 * @type string
 * @default rgba(255,255,255,0.65)
 *
 * @param TextOutlineWidth
 * @text 文字の縁取り幅
 * @type number
 * @min 0
 * @default 3
 *
 * @param TextAlign
 * @text 文字揃え
 * @type select
 * @option 左
 * @value left
 * @option 中央
 * @value center
 * @option 右
 * @value right
 * @default center
 *
 * @param WindowX
 * @text 表示領域X座標
 * @desc -1で画面中央へ自動配置します。
 * @type number
 * @min -1
 * @default -1
 *
 * @param WindowWidth
 * @text 表示領域の幅
 * @desc 0で画面全幅を使用します。
 * @type number
 * @min 0
 * @default 0
 *
 * @param WindowY
 * @text 表示位置Y座標
 * @desc -1でメッセージウィンドウの上へ自動配置します。
 * @type number
 * @min -1
 * @default -1
 *
 * @param GapAboveMessage
 * @text メッセージ欄との間隔
 * @type number
 * @min 0
 * @default 18
 *
 * @param EntranceOffsetY
 * @text 表示開始時の移動量
 * @desc この距離だけ下から現れます。
 * @type number
 * @min 0
 * @default 12
 *
 * @param AnimationSpeed
 * @text 表示アニメ速度
 * @type number
 * @decimals 2
 * @min 0.01
 * @max 1.00
 * @default 0.22
 *
 * @param HoverScale
 * @text 選択中の拡大率
 * @desc 1.03で103％です。
 * @type number
 * @decimals 2
 * @min 1.00
 * @default 1.03
 *
 * @param CursorSound
 * @text 選択移動音
 * @type file
 * @dir audio/se
 * @default Cursor1
 *
 * @param CursorVolume
 * @text 選択移動音量
 * @type number
 * @min 0
 * @max 100
 * @default 60
 *
 * @param OkSound
 * @text 決定音
 * @type file
 * @dir audio/se
 * @default Decision1
 *
 * @param OkVolume
 * @text 決定音量
 * @type number
 * @min 0
 * @max 100
 * @default 70
 *
 * @param ChoiceResponseWait
 * @text 選択後の返答待機
 * @desc 選択肢が消えてから返答の文字が出るまでのフレーム数。60で約1秒です。
 * @type number
 * @min 0
 * @default 6
 *
 * @help
 * ツクール標準の選択肢分岐を維持したまま、
 * 選択肢を画像式の可変幅UIとして表示します。
 *
 * 決定後、選択肢は通常どおりすぐ消えます。
 * メッセージウィンドウは表示されたまま、
 * 次の返答文章だけ指定フレーム待ってから表示されます。
 *
 * イベント側へウェイトを置く必要はありません。
 *
 * 通常画像と選択画像は横3分割方式で描画します。
 *
 * ┌────┬────────┬────┐
 * │左端│  中央部分  │右端│
 * └────┴────────┴────┘
 *
 * 推奨プラグイン順：
 *
 * Mami_NorimuneMessageUI
 * Mami_MessageSound
 * Mami_ImageChoiceUI
 * Mami_EndOfTextAnimation
 */

(() => {
    "use strict";

    const pluginName = "Mami_ImageChoiceUI";
    const params = PluginManager.parameters(pluginName);

    function numberParam(name, defaultValue) {
        const value = params[name];

        if (value === undefined || value === "") {
            return defaultValue;
        }

        return Number(value);
    }

    const normalImageName =
        String(params.NormalImage || "choice_normal");

    const selectedImageName =
        String(params.SelectedImage || "choice_selected");

    const sliceLeft =
        Math.max(0, numberParam("SliceLeft", 32));

    const sliceRight =
        Math.max(0, numberParam("SliceRight", 32));

    const itemHeight =
        Math.max(1, numberParam("ItemHeight", 64));

    const itemGap =
        Math.max(0, numberParam("ItemGap", 12));

    const textPadding =
        Math.max(0, numberParam("TextPadding", 48));

    const minItemWidth =
        Math.max(1, numberParam("MinItemWidth", 220));

    const configuredMaxItemWidth =
        Math.max(0, numberParam("MaxItemWidth", 900));

    const fontSize =
        Math.max(1, numberParam("FontSize", 26));

    const textColor =
        String(params.TextColor || "#3b2d27");

    const selectedTextColor =
        String(params.SelectedTextColor || "#6a3f20");

    const textOutlineColor =
        String(
            params.TextOutlineColor ||
            "rgba(255,255,255,0.65)"
        );

    const textOutlineWidth =
        Math.max(
            0,
            numberParam("TextOutlineWidth", 3)
        );

    const textAlign =
        String(params.TextAlign || "center");

    const configuredWindowX =
        numberParam("WindowX", -1);

    const configuredWindowWidth =
        Math.max(
            0,
            numberParam("WindowWidth", 0)
        );

    const configuredWindowY =
        numberParam("WindowY", -1);

    const gapAboveMessage =
        Math.max(
            0,
            numberParam("GapAboveMessage", 18)
        );

    const entranceOffsetY =
        Math.max(
            0,
            numberParam("EntranceOffsetY", 12)
        );

    const animationSpeed =
        Math.max(
            0.01,
            Math.min(
                1,
                numberParam("AnimationSpeed", 0.22)
            )
        );

    const hoverScale =
        Math.max(
            1,
            numberParam("HoverScale", 1.03)
        );

    const cursorSoundName =
        String(params.CursorSound || "Cursor1");

    const cursorVolume =
        Math.max(
            0,
            Math.min(
                100,
                numberParam("CursorVolume", 60)
            )
        );

    const okSoundName =
        String(params.OkSound || "Decision1");

    const okVolume =
        Math.max(
            0,
            Math.min(
                100,
                numberParam("OkVolume", 70)
            )
        );

    const choiceResponseWait =
        Math.max(
            0,
            numberParam("ChoiceResponseWait", 6)
        );

    /*
     * ─────────────────────────────
     * 画像先読み
     * ─────────────────────────────
     */

    const _Scene_Boot_loadSystemImages =
        Scene_Boot.prototype.loadSystemImages;

    Scene_Boot.prototype.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);

        if (normalImageName) {
            ImageManager.loadPicture(
                normalImageName
            );
        }

        if (selectedImageName) {
            ImageManager.loadPicture(
                selectedImageName
            );
        }

        if (cursorSoundName) {
            AudioManager.loadStaticSe({
                name: cursorSoundName,
                volume: cursorVolume,
                pitch: 100,
                pan: 0
            });
        }

        if (okSoundName) {
            AudioManager.loadStaticSe({
                name: okSoundName,
                volume: okVolume,
                pitch: 100,
                pan: 0
            });
        }
    };

    /*
     * ─────────────────────────────
     * 初期化
     * ─────────────────────────────
     */

    const _Window_ChoiceList_initialize =
        Window_ChoiceList.prototype.initialize;

    Window_ChoiceList.prototype.initialize =
        function(messageWindow) {
            _Window_ChoiceList_initialize.call(
                this,
                messageWindow
            );

            this._itemWidths = [];
            this._lastChoiceIndex = -1;

            this._baseY = this.y;
            this._displayY = this.y;
            this._targetDisplayY = this.y;

            this._displayOpacity = 0;
            this._targetDisplayOpacity = 255;

            this.opacity = 0;
            this.backOpacity = 0;
            this.cursorVisible = false;

            const normalBitmap =
                ImageManager.loadPicture(
                    normalImageName
                );

            const selectedBitmap =
                ImageManager.loadPicture(
                    selectedImageName
                );

            normalBitmap.addLoadListener(() => {
                if (this.contents) {
                    this.refresh();
                }
            });

            selectedBitmap.addLoadListener(() => {
                if (this.contents) {
                    this.refresh();
                }
            });
        };

    /*
     * ─────────────────────────────
     * フォント
     * ─────────────────────────────
     */

    const _Window_ChoiceList_resetFontSettings =
        Window_ChoiceList.prototype.resetFontSettings;

    Window_ChoiceList.prototype.resetFontSettings =
        function() {
            _Window_ChoiceList_resetFontSettings.call(
                this
            );

            if (!this.contents) {
                return;
            }

            this.contents.fontSize =
                fontSize;

            this.contents.textColor =
                textColor;

            this.contents.outlineColor =
                textOutlineColor;

            this.contents.outlineWidth =
                textOutlineWidth;
        };

    /*
     * ─────────────────────────────
     * 選択肢数・サイズ
     * ─────────────────────────────
     */

    Window_ChoiceList.prototype.choiceCount =
        function() {
            if (
                !$gameMessage ||
                typeof $gameMessage.choices !==
                    "function"
            ) {
                return 0;
            }

            return $gameMessage.choices().length;
        };

    Window_ChoiceList.prototype.itemHeight =
        function() {
            return itemHeight;
        };

    Window_ChoiceList.prototype.numVisibleRows =
        function() {
            return Math.max(
                1,
                this.choiceCount()
            );
        };

    Window_ChoiceList.prototype.maxCols =
        function() {
            return 1;
        };

    Window_ChoiceList.prototype.spacing =
        function() {
            return itemGap;
        };

    Window_ChoiceList.prototype.measureChoiceWidth =
        function(index) {
            const choices =
                $gameMessage &&
                typeof $gameMessage.choices ===
                    "function"
                    ? $gameMessage.choices()
                    : [];

            const text =
                choices[index] !== undefined
                    ? String(choices[index])
                    : "";

            this.resetFontSettings();

            let measuredWidth = 0;

            if (
                this.contents &&
                typeof this.textSizeEx ===
                    "function"
            ) {
                measuredWidth =
                    this.textSizeEx(text).width;
            } else if (this.contents) {
                measuredWidth =
                    this.contents.measureTextWidth(
                        text
                    );
            } else {
                measuredWidth =
                    text.length * fontSize;
            }

            const automaticMaximum =
                Math.max(
                    minItemWidth,
                    Graphics.boxWidth - 80
                );

            const maximumWidth =
                configuredMaxItemWidth > 0
                    ? Math.min(
                        configuredMaxItemWidth,
                        automaticMaximum
                    )
                    : automaticMaximum;

            return Math.max(
                minItemWidth,
                Math.min(
                    maximumWidth,
                    Math.ceil(
                        measuredWidth +
                        textPadding * 2
                    )
                )
            );
        };

    Window_ChoiceList.prototype.prepareItemWidths =
        function() {
            this._itemWidths = [];

            const choices =
                $gameMessage &&
                typeof $gameMessage.choices ===
                    "function"
                    ? $gameMessage.choices()
                    : [];

            for (
                let index = 0;
                index < choices.length;
                index++
            ) {
                this._itemWidths[index] =
                    this.measureChoiceWidth(
                        index
                    );
            }
        };

    Window_ChoiceList.prototype.itemRect =
        function(index) {
            const width =
                this._itemWidths[index] ||
                minItemWidth;

            const x =
                Math.floor(
                    (
                        this.innerWidth -
                        width
                    ) / 2
                );

            const y =
                index *
                (
                    itemHeight +
                    itemGap
                );

            return new Rectangle(
                x,
                y,
                width,
                itemHeight
            );
        };

    Window_ChoiceList.prototype.itemLineRect =
        function(index) {
            return this.itemRect(index);
        };

    /*
     * ─────────────────────────────
     * 配置
     * ─────────────────────────────
     */

    Window_ChoiceList.prototype.updatePlacement =
        function() {
            const count =
                Math.max(
                    1,
                    this.choiceCount()
                );

            const width =
                configuredWindowWidth > 0
                    ? Math.min(
                        configuredWindowWidth,
                        Graphics.boxWidth
                    )
                    : Graphics.boxWidth;

            const x =
                configuredWindowX >= 0
                    ? configuredWindowX
                    : Math.floor(
                        (
                            Graphics.boxWidth -
                            width
                        ) / 2
                    );

            const contentHeight =
                count * itemHeight +
                Math.max(
                    0,
                    count - 1
                ) * itemGap;

            const safetyMargin = 12;

            const height =
                Math.min(
                    Graphics.boxHeight,
                    contentHeight +
                    safetyMargin * 2
                );

            let y;

            if (configuredWindowY >= 0) {
                y = configuredWindowY;
            } else if (this._messageWindow) {
                y =
                    this._messageWindow.y -
                    height -
                    gapAboveMessage;
            } else {
                y =
                    Math.floor(
                        (
                            Graphics.boxHeight -
                            height
                        ) / 2
                    );
            }

            y =
                Math.max(
                    0,
                    Math.min(
                        y,
                        Graphics.boxHeight -
                        height
                    )
                );

            this.move(
                x,
                y,
                width,
                height
            );

            /*
             * 選択肢数確定後にcontentsを作り直し、
             * 初回一行スクロール問題を防ぎます。
             */
            this.createContents();

            this._baseY = y;

            this._displayY =
                y + entranceOffsetY;

            this._targetDisplayY = y;

            this.y = this._displayY;

            this._displayOpacity = 0;
            this._targetDisplayOpacity = 255;

            this.contentsOpacity = 0;
        };

    /*
     * ─────────────────────────────
     * 開始
     * ─────────────────────────────
     */

    Window_ChoiceList.prototype.start =
        function() {
            this.prepareItemWidths();
            this.updatePlacement();
            this.updateBackground();

            this.refresh();
            this.selectDefault();

            this._lastChoiceIndex =
                this.index();

            this.open();
            this.activate();
        };

    /*
     * ─────────────────────────────
     * 横3分割描画
     * ─────────────────────────────
     */

    Window_ChoiceList.prototype.drawThreeSlice =
        function(bitmap, rect) {
            if (
                !bitmap ||
                !bitmap.isReady()
            ) {
                this.contents.gradientFillRect(
                    rect.x,
                    rect.y,
                    rect.width,
                    rect.height,
                    "rgba(255,255,255,0.80)",
                    "rgba(232,220,196,0.80)",
                    false
                );

                return;
            }

            const sourceWidth =
                bitmap.width;

            const sourceHeight =
                bitmap.height;

            if (
                sourceWidth <= 0 ||
                sourceHeight <= 0
            ) {
                return;
            }

            const leftWidth =
                Math.min(
                    sliceLeft,
                    sourceWidth
                );

            const rightWidth =
                Math.min(
                    sliceRight,
                    sourceWidth -
                    leftWidth
                );

            const centerSourceWidth =
                Math.max(
                    1,
                    sourceWidth -
                    leftWidth -
                    rightWidth
                );

            const targetLeftWidth =
                Math.min(
                    leftWidth,
                    Math.floor(
                        rect.width / 2
                    )
                );

            const targetRightWidth =
                Math.min(
                    rightWidth,
                    Math.floor(
                        rect.width -
                        targetLeftWidth
                    )
                );

            const targetCenterWidth =
                Math.max(
                    0,
                    rect.width -
                    targetLeftWidth -
                    targetRightWidth
                );

            if (targetLeftWidth > 0) {
                this.contents.blt(
                    bitmap,
                    0,
                    0,
                    leftWidth,
                    sourceHeight,
                    rect.x,
                    rect.y,
                    targetLeftWidth,
                    rect.height
                );
            }

            if (targetCenterWidth > 0) {
                this.contents.blt(
                    bitmap,
                    leftWidth,
                    0,
                    centerSourceWidth,
                    sourceHeight,
                    rect.x +
                        targetLeftWidth,
                    rect.y,
                    targetCenterWidth,
                    rect.height
                );
            }

            if (targetRightWidth > 0) {
                this.contents.blt(
                    bitmap,
                    sourceWidth -
                        rightWidth,
                    0,
                    rightWidth,
                    sourceHeight,
                    rect.x +
                        rect.width -
                        targetRightWidth,
                    rect.y,
                    targetRightWidth,
                    rect.height
                );
            }
        };

    /*
     * ─────────────────────────────
     * 項目描画
     * ─────────────────────────────
     */

    Window_ChoiceList.prototype.drawItem =
        function(index) {
            const originalRect =
                this.itemRect(index);

            const selected =
                index === this.index();

            const itemScale =
                selected
                    ? hoverScale
                    : 1;

            const scaledWidth =
                Math.round(
                    originalRect.width *
                    itemScale
                );

            const scaledHeight =
                Math.round(
                    originalRect.height *
                    itemScale
                );

            const rect =
                new Rectangle(
                    originalRect.x -
                        Math.floor(
                            (
                                scaledWidth -
                                originalRect.width
                            ) / 2
                        ),
                    originalRect.y -
                        Math.floor(
                            (
                                scaledHeight -
                                originalRect.height
                            ) / 2
                        ),
                    scaledWidth,
                    scaledHeight
                );

            const bitmap =
                selected
                    ? ImageManager.loadPicture(
                        selectedImageName
                    )
                    : ImageManager.loadPicture(
                        normalImageName
                    );

            this.drawThreeSlice(
                bitmap,
                rect
            );

            this.resetFontSettings();

            this.contents.textColor =
                selected
                    ? selectedTextColor
                    : textColor;

            this.contents.outlineColor =
                textOutlineColor;

            this.contents.outlineWidth =
                textOutlineWidth;

            const textRect =
                new Rectangle(
                    rect.x +
                        textPadding,
                    rect.y,
                    Math.max(
                        1,
                        rect.width -
                        textPadding * 2
                    ),
                    rect.height
                );

            const text =
                this.commandName(index);

            this.drawTextExAligned(
                text,
                textRect,
                textAlign
            );
        };

    Window_ChoiceList.prototype.drawTextExAligned =
        function(text, rect, align) {
            const textWidth =
                typeof this.textSizeEx ===
                    "function"
                    ? this.textSizeEx(
                        text
                    ).width
                    : this.contents
                        .measureTextWidth(
                            text
                        );

            let x = rect.x;

            if (align === "center") {
                x =
                    rect.x +
                    Math.max(
                        0,
                        Math.floor(
                            (
                                rect.width -
                                textWidth
                            ) / 2
                        )
                    );
            } else if (
                align === "right"
            ) {
                x =
                    rect.x +
                    Math.max(
                        0,
                        rect.width -
                        textWidth
                    );
            }

            const y =
                rect.y +
                Math.floor(
                    (
                        rect.height -
                        this.lineHeight()
                    ) / 2
                );

            this.drawTextEx(
                text,
                x,
                y,
                rect.width
            );
        };

    /*
     * ─────────────────────────────
     * 標準カーソル非表示
     * ─────────────────────────────
     */

    Window_ChoiceList.prototype.refreshCursor =
        function() {
            this.setCursorRect(
                0,
                0,
                0,
                0
            );
        };

    /*
     * ─────────────────────────────
     * 選択変更
     * ─────────────────────────────
     */

    const _Window_ChoiceList_select =
        Window_ChoiceList.prototype.select;

    Window_ChoiceList.prototype.select =
        function(index) {
            const oldIndex =
                this.index();

            _Window_ChoiceList_select.call(
                this,
                index
            );

            if (
                oldIndex !==
                    this.index() &&
                this.contents
            ) {
                this.refresh();
            }
        };

    /*
     * ─────────────────────────────
     * 表示アニメーション
     * ─────────────────────────────
     */

    const _Window_ChoiceList_update =
        Window_ChoiceList.prototype.update;

    Window_ChoiceList.prototype.update =
        function() {
            _Window_ChoiceList_update.call(
                this
            );

            if (!this.visible) {
                return;
            }

            this._displayY +=
                (
                    this._targetDisplayY -
                    this._displayY
                ) * animationSpeed;

            this._displayOpacity +=
                (
                    this._targetDisplayOpacity -
                    this._displayOpacity
                ) * animationSpeed;

            this.y =
                Math.round(
                    this._displayY
                );

            this.contentsOpacity =
                Math.round(
                    this._displayOpacity
                );

            if (
                this.index() !==
                this._lastChoiceIndex
            ) {
                this._lastChoiceIndex =
                    this.index();

                this.refresh();
            }
        };

    /*
     * ─────────────────────────────
     * 音
     * ─────────────────────────────
     */

    Window_ChoiceList.prototype.playCursorSound =
        function() {
            if (!cursorSoundName) {
                return;
            }

            AudioManager.playSe({
                name: cursorSoundName,
                volume: cursorVolume,
                pitch: 100,
                pan: 0
            });
        };

    Window_ChoiceList.prototype.playOkSound =
        function() {
            if (!okSoundName) {
                return;
            }

            AudioManager.playSe({
                name: okSoundName,
                volume: okVolume,
                pitch: 100,
                pan: 0
            });
        };
/*
 * ─────────────────────────────
 * 選択肢決定後の返答待機
 * ─────────────────────────────
 */

let pendingChoiceResponseWait = 0;

/*
 * 選択肢を決定した瞬間に、
 * 次の返答へ渡す待機時間を保存します。
 */
const _Window_ChoiceList_processOk =
    Window_ChoiceList.prototype.processOk;

Window_ChoiceList.prototype.processOk =
    function() {
        if (this.isCurrentItemEnabled()) {
            pendingChoiceResponseWait =
                choiceResponseWait;

            /*
             * 決定音と次のタイプ音が重ならないよう、
             * 音側にも同じ待機を知らせます。
             */
            if (
                window.MamiMessageSound &&
                typeof MamiMessageSound
                    .delayTypeSound === "function"
            ) {
                MamiMessageSound.delayTypeSound(
                    choiceResponseWait
                );
            }
        }

        /*
         * 選択肢自体は普通に即決定・即消去。
         */
        _Window_ChoiceList_processOk.call(this);
    };

/*
 * 次の文章が始まる直前に、
 * 保存しておいた待機時間を受け取ります。
 */
const _Window_Message_startMessage =
    Window_Message.prototype.startMessage;

Window_Message.prototype.startMessage =
    function() {
        /*
         * 元のstartMessageより先に設定します。
         * 一文字だけ先に出る事故を防止。
         */
        this._mamiChoiceResponseWait =
            Math.max(
                0,
                Math.floor(
                    pendingChoiceResponseWait
                )
            );

        pendingChoiceResponseWait = 0;

        _Window_Message_startMessage.call(this);
    };
    /*
     * updateMessageだけを一時停止します。
     *
     * Window_Message全体のupdateは動くため、
     * ウィンドウ表示や他のUI処理は止まりません。
     */

    const _Window_Message_updateMessage =
    Window_Message.prototype.updateMessage;

Window_Message.prototype.updateMessage =
    function() {
        if (
            Number(
                this._mamiChoiceResponseWait || 0
            ) > 0
        ) {
            this._mamiChoiceResponseWait--;
            return true;
        }

        return _Window_Message_updateMessage.call(
            this
        );
    };
})();