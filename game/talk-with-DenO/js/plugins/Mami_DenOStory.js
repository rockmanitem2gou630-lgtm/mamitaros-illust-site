/*:
 * @target MZ
 * @plugindesc 電王会話作品用・ストーリー画面 Ver0.1
 * @author マミタロス
 *
 * @help
 * ストーリーのルート選択、
 * 話数選択画面を表示します。
 */

(() => {
    "use strict";

    const pluginName =
        "Mami_DenOStory";

    /*
     * ─────────────────────────────
     * 基本設定
     * ─────────────────────────────
     */

    const SCREEN_WIDTH = 1280;
    const SCREEN_HEIGHT = 720;

    /*
     * ルート選択カード。
     * 308×438で作ったパス画像を4枚横一列に並べる。
     * 1280×720内で余白を残しつつ大きく見せるため、
     * 表示上は288×410に縮小する。
     */
    const PANEL_WIDTH = 288;
    const PANEL_HEIGHT = 410;

    const ROUTE_CARD_GAP = 18;
    const ROUTE_CARD_TOP = 122;

    /*
     * ホバー時はカード画像だけをほんの少し拡大する。
     * 4枚の間隔を潰さない程度に控えめ。
     */
    const ROUTE_CARD_HOVER_SCALE = 1.025;
    const ROUTE_CARD_HOVER_LIFT = 3;

    /*
     * ルート選択画面に出す4ルートだけを固定。
     * StoryData側のおまけ項目は残したまま、
     * ここでは表示しない。
     */
    const MAIN_ROUTE_IDS = [
        "momo",
        "ura",
        "kin",
        "ryu"
    ];

    /*
     * img/pictures/ に置くパス画像。
     * ImageManager.loadPictureでは拡張子を書かない。
     */
    const ROUTE_CARD_STYLE = {
        momo: {
            image: "ui_story_pass_momo"
        },
        ura: {
            image: "ui_story_pass_ura"
        },
        kin: {
            image: "ui_story_pass_kin"
        },
        ryu: {
            image: "ui_story_pass_ryuta"
        }
    };

    /*
     * ルート選択画面専用背景。
     * img/pictures/bg_story_route_select.png
     */
    const ROUTE_SELECT_BACKGROUND =
        "bg_story_route_select";

    /*
     * ギャラリー入口・背景。
     * img/pictures/button_gallery.png
     * img/pictures/bg_gallery.png
     */
    const GALLERY_BUTTON_PICTURE =
        "button_gallery";

    const GALLERY_BACKGROUND =
        "bg_gallery";

    /*
     * ギャラリー進行状況リセット。
     *
     * 消去系の操作なので主張は弱め。
     * 素材そのものは正方形PNGで作ればOK。
     * JS側で48×48へ収めるので、
     * 128×128など大きめに描いても問題ない。
     *
     * 円形 / 角丸四角はPNGの透過形状で自由に作れる。
     */
    const GALLERY_RESET_BUTTON_PICTURE =
        "button_progress_reset";

    const GALLERY_RESET_BUTTON_SIZE = 48;

    /*
     * 右下フレーム内の空きスペースへ。
     * 48×48なので x=1228 なら、
     * おおよそ X=1204～1252 に収まる。
     */
    const GALLERY_RESET_BUTTON_POSITION = [
        1228,
        679
    ];

    /*
     * 汎用確認画面の「はい / いいえ」。
     * ストーリー中断確認と進行状況リセットで共用する。
     *
     * 画像サイズは180×58を想定。
     */
    const CONFIRM_YES_PICTURE =
        "ui_confirm_yes";

    const CONFIRM_NO_PICTURE =
        "ui_confirm_no";

    const CONFIRM_YES_POSITION = [
        520,
        409
    ];

    const CONFIRM_NO_POSITION = [
        760,
        409
    ];

    /*
     * 戻るボタンと左右対称の位置。
     */
    const GALLERY_BUTTON_POSITION = [
        SCREEN_WIDTH - 118,
        679
    ];

    /*
     * ─────────────────────────────
     * ギャラリー・キャラ絞り込みタブ
     * ─────────────────────────────
     *
     * 画像サイズ：
     *   170×46
     *
     * 通常 / 選択中の2枚を用意する。
     * ホバー差分は使わず、JS側で軽く拡大する。
     */
    const GALLERY_TAB_WIDTH = 170;
    const GALLERY_TAB_HEIGHT = 46;
    const GALLERY_TAB_GAP = 14;
    const GALLERY_TAB_CENTER_Y = 132;

    const GALLERY_TAB_IDS = [
        "all",
        "momo",
        "ura",
        "kin",
        "ryu"
    ];

    const GALLERY_TAB_PICTURES = {
        all: {
            normal: "gallery_tab_all",
            active: "gallery_tab_all_active"
        },
        momo: {
            normal: "gallery_tab_momo",
            active: "gallery_tab_momo_active"
        },
        ura: {
            normal: "gallery_tab_ura",
            active: "gallery_tab_ura_active"
        },
        kin: {
            normal: "gallery_tab_kin",
            active: "gallery_tab_kin_active"
        },
        ryu: {
            normal: "gallery_tab_ryu",
            active: "gallery_tab_ryu_active"
        }
    };


    /*
     * ─────────────────────────────
     * ギャラリー・サムネイル一覧
     * ─────────────────────────────
     *
     * まずは1画面ぶん、横4×縦2を描画する。
     * スクロールは次段階で追加する。
     *
     * 内側フレームの角がサムネへ少しかぶるデザインなので、
     * サムネイル群のさらに上へ
     * gallery_frame_overlay.png を重ねる。
     */
    const GALLERY_VIEW_X = 76;
    const GALLERY_VIEW_Y = 175;
    const GALLERY_VIEW_WIDTH = 1128;

    /*
     * 上端はタブを避けるため175のまま。
     * 下端だけフレームの裏まで伸ばす。
     *
     * 175 + 500 = 675
     *
     * gallery_frame_overlay がサムネより上にあるため、
     * 実際には下側フレームへ潜り込んだところで
     * 自然に隠れて見える。
     */
    const GALLERY_VIEW_HEIGHT = 500;

    const GALLERY_GRID_COLUMNS = 4;
    const GALLERY_GRID_ROWS = 2;
    const GALLERY_VISIBLE_LIMIT =
        GALLERY_GRID_COLUMNS *
        GALLERY_GRID_ROWS;

    const GALLERY_CARD_WIDTH = 260;
    const GALLERY_CARD_HEIGHT = 175;

    const GALLERY_THUMB_WIDTH = 250;
    const GALLERY_THUMB_HEIGHT = 141;
    /*
     * サムネイルはカード左上基準ではなく、
     * 260×175のフレーム中央へ配置する。
     *
     * 250×141の場合：
     *   X = (260 - 250) / 2 = 5
     *   Y = (175 - 141) / 2 = 17
     */
    const GALLERY_THUMB_X =
        (GALLERY_CARD_WIDTH -
            GALLERY_THUMB_WIDTH) / 2;

    const GALLERY_THUMB_Y =
        (GALLERY_CARD_HEIGHT -
            GALLERY_THUMB_HEIGHT) / 2;

    const GALLERY_CARD_GAP_X = 18;
    const GALLERY_CARD_GAP_Y = 22;

    /*
     * 1行目の位置は今までの4×2配置とほぼ同じ。
     * ALLで行数が増えても上端位置は変えない。
     */
    const GALLERY_GRID_PADDING_Y = 34;

    /*
     * 縦スクロール。
     */
    const GALLERY_SCROLL_SPEED = 2.5;
    const GALLERY_SCROLL_EASING = 0.22;

    /*
     * スマホ / タブレット用スワイプ。
     *
     * 指を置いただけのタップと、
     * スクロール目的のスワイプを区別するため、
     * 10px以上動いた時点でドラッグ扱いにする。
     *
     * スワイプ開始位置はサムネの上でもOK。
     */
    const GALLERY_TOUCH_DRAG_THRESHOLD = 10;

    /*
     * 右端のサムネへ被らないよう、
     * レールとつまみを描画領域の外側へ寄せる。
     * サムネ領域右端は X=1204。
     */
    const GALLERY_SCROLL_TRACK_X = 1200;
    const GALLERY_SCROLL_TRACK_Y = 180;
    const GALLERY_SCROLL_TRACK_WIDTH = 12;

    /*
     * 描画領域を下へ伸ばしたぶん、
     * スクロールレールも少し長くする。
     * 下端はフレームの裏へ入る。
     */
    const GALLERY_SCROLL_TRACK_HEIGHT = 470;

    const GALLERY_SCROLL_THUMB_WIDTH = 12;
    const GALLERY_SCROLL_THUMB_HEIGHT = 80;

    const GALLERY_SCROLL_TRACK_PICTURE =
        "gallery_scroll_track";

    const GALLERY_SCROLL_THUMB_PICTURE =
        "gallery_scroll_thumb";

    /*
     * ─────────────────────────────
     * ギャラリー・スチル閲覧
     * ─────────────────────────────
     *
     * 1枚目：
     *   サムネクリック → 軽くフェードイン
     *
     * 差分：
     *   現在画像255固定
     *   ＋次画像0→255のクロスフェード
     *
     * 最後：
     *   もう一度クリック → 軽くフェードアウトして閉じる
     *
     * 画面上には閉じるボタン等を一切置かない。
     */
    const GALLERY_VIEWER_FADE_FRAMES = 12;
    const GALLERY_VIEWER_CROSSFADE_FRAMES = 12;

    const GALLERY_CG_FRAME_PICTURE =
        "gallery_cg_frame";

    const GALLERY_CG_LOCKED_PICTURE =
        "gallery_cg_frame_locked";

    /*
     * 1280×720の透過PNG。
     * bg_gallery と同じ位置のフレーム部分だけを残す。
     * サムネの上、タブ・戻るボタンの下へ重ねる。
     */
    const GALLERY_FRAME_OVERLAY_PICTURE =
        "gallery_frame_overlay";

    let galleryCatalogCache = null;

    /*
     * ギャラリーの原寸CGはImageManagerの恒久キャッシュへ入れない。
     * iOSでは原寸CGが増えるほどGPU/画像メモリを圧迫するため、
     * サムネ生成・全画面表示の間だけ使う一時Bitmapとして読む。
     */
    function loadTransientGalleryPicture(
        filename
    ) {
        const pictureName =
            String(filename || "")
                .replace(/\.png$/i, "");

        const encodedName =
            Utils.encodeURI(
                pictureName
            );

        return Bitmap.load(
            `img/pictures/${encodedName}.png`
        );
    }

    const transientBitmapDestroyPending =
        new WeakSet();

    function destroyTransientGalleryBitmap(
        bitmap
    ) {
        if (
            !bitmap ||
            typeof bitmap.destroy !==
                "function" ||
            transientBitmapDestroyPending.has(
                bitmap
            )
        ) {
            return;
        }

        /*
         * 読み込み途中でdestroyすると、完了時に内部テクスチャが
         * 作り直されて居残る場合がある。完了後に破棄を予約する。
         */
        if (
            !bitmap.isReady() &&
            !bitmap.isError()
        ) {
            transientBitmapDestroyPending.add(
                bitmap
            );

            bitmap.addLoadListener(
                () => {
                    transientBitmapDestroyPending.delete(
                        bitmap
                    );
                    bitmap.destroy();
                }
            );

            return;
        }

        bitmap.destroy();
    }

    /*
     * 原寸CGを一斉にデコードするとスマホで瞬間的な負荷が
     * 大きくなるため、サムネ生成は最大2枚ずつ行う。
     */
    const GALLERY_THUMB_LOAD_LIMIT = 2;
    let galleryThumbnailLoadQueue = [];
    let galleryThumbnailLoadCount = 0;
    let galleryThumbnailLoadGeneration = 0;

    /*
     * ─────────────────────────────
     * 話数選択画面
     * ─────────────────────────────
     *
     * 背景と各ボタンは img/pictures/ から読み込む。
     * EPISODE 01 の英数字だけ専用フォントを使用する。
     */
    const EPISODE_FONT_FACE = "DenOEpisode";
    const EPISODE_FONT_FILE = "deno_episode.ttf";

    if (
        typeof FontManager !== "undefined" &&
        FontManager &&
        typeof FontManager.load === "function"
    ) {
        FontManager.load(
            EPISODE_FONT_FACE,
            EPISODE_FONT_FILE
        );
    }

    /*
     * 1280×720で作成した完成UIに合わせた
     * 話数ボタン中心座標。
     */
    const EPISODE_NODE_POSITIONS = [
        [596, 217],
        [699, 217],
        [802, 217],
        [905, 217],
        [1008, 217],
        [1111, 217],
        [596, 349],
        [699, 349],
        [802, 349],
        [905, 349],
        [1008, 349],
        [1111, 349]
    ];

    const EPISODE_BACK_POSITION = [118, 679];
    const EPISODE_START_POSITION = [1095, 658];

    /*
     * 選択中の発光枠がボタン中心と少しずれる素材なら、
     * ここだけ微調整すればよい。
     */
    const EPISODE_SELECTED_OFFSET_X = 0;
    const EPISODE_SELECTED_OFFSET_Y = 0;

    /*
     * 下部詳細パネルの文字表示領域。
     */
    const EPISODE_NUMBER_RECT = {
        x: 589,
        y: 478,
        width: 310,
        height: 48
    };

    const EPISODE_TITLE_RECT = {
        x: 607,
        y: 548,
        width: 565,
        height: 62
    };

    const EPISODE_BUTTON_HOVER_SCALE = 1.035;
    const EPISODE_BUTTON_PRESS_SCALE = 0.97;

    /*
     * ─────────────────────────────
     * Story UI プリロード
     * ─────────────────────────────
     *
     * ブラウザ版で初回表示時に画像が順番に出るのを防ぐため、
     * UI素材だけを先に ImageManager のキャッシュへ入れる。
     *
     * Boot時：
     *   ルート選択画面 + 話数選択背景 + 共通戻る
     *
     * Storyを開いた時：
     *   01～12駅ボタン + 選択枠 + 開始 + EXIT
     *
     * スチルや本編背景はここでは読まない。
     */

    const STORY_UI_BOOT_PRELOAD_PICTURES = [
        ROUTE_SELECT_BACKGROUND,
        GALLERY_BACKGROUND,
        GALLERY_BUTTON_PICTURE,
        GALLERY_RESET_BUTTON_PICTURE,
        CONFIRM_YES_PICTURE,
        CONFIRM_NO_PICTURE,
        "gallery_tab_all",
        "gallery_tab_all_active",
        "gallery_tab_momo",
        "gallery_tab_momo_active",
        "gallery_tab_ura",
        "gallery_tab_ura_active",
        "gallery_tab_kin",
        "gallery_tab_kin_active",
        "gallery_tab_ryu",
        "gallery_tab_ryu_active",
        GALLERY_CG_FRAME_PICTURE,
        GALLERY_CG_LOCKED_PICTURE,
        GALLERY_FRAME_OVERLAY_PICTURE,
        GALLERY_SCROLL_TRACK_PICTURE,
        GALLERY_SCROLL_THUMB_PICTURE,
        "ui_story_pass_momo",
        "ui_story_pass_ura",
        "ui_story_pass_kin",
        "ui_story_pass_ryuta",
        "bg_episode_select_momo",
        "bg_episode_select_ura",
        "bg_episode_select_kin",
        "bg_episode_select_ryu",
        "ui_episode_back"
    ];

    function makeStoryEpisodeUiPreloadPictures() {
        const pictures = [
            "btn_story_exit"
        ];

        for (const routeId of MAIN_ROUTE_IDS) {
            pictures.push(
                `ui_episode_start_${routeId}`,
                `ui_episode_selected_${routeId}`
            );

            for (let number = 1; number <= 12; number++) {
                pictures.push(
                    `ui_episode_${routeId}_${String(number).padStart(2, "0")}`
                );
            }
        }

        return pictures;
    }

    const STORY_UI_EPISODE_PRELOAD_PICTURES =
        makeStoryEpisodeUiPreloadPictures();

    function preloadStoryPictures(
        pictureNames
    ) {
        if (
            !Array.isArray(pictureNames) ||
            typeof ImageManager === "undefined" ||
            !ImageManager ||
            typeof ImageManager.loadPicture !== "function"
        ) {
            return;
        }

        for (const pictureName of pictureNames) {
            if (!pictureName) {
                continue;
            }

            ImageManager.loadPicture(
                String(pictureName)
            );
        }
    }

    function preloadStoryBootUi() {
        preloadStoryPictures(
            STORY_UI_BOOT_PRELOAD_PICTURES
        );
    }

    function preloadStoryEpisodeUi() {
        preloadStoryPictures(
            STORY_UI_EPISODE_PRELOAD_PICTURES
        );
    }

    /*
     * 起動中に、最初に見えるStory UIを先読み。
     * 元のloadSystemImagesを必ず呼んでから追加分を読む。
     */
    const _Scene_Boot_loadSystemImages_DenOStoryPreload =
        Scene_Boot.prototype.loadSystemImages;

    Scene_Boot.prototype.loadSystemImages =
        function() {
            _Scene_Boot_loadSystemImages_DenOStoryPreload
                .call(this);

            preloadStoryBootUi();
        };

    let storyActive = false;

    /*
     * ─────────────────────────────
     * Storyデバッグ開始位置
     * ─────────────────────────────
     *
     * StoryDataのpages内で、
     *
     * debugStart: true
     *
     * が付いたページがあれば、
     * そのページから再生を開始する。
     *
     * falseにすれば通常どおり
     * 必ず冒頭から再生する。
     */
    const STORY_DEBUG_START_ENABLED = true;

    /*
     * ─────────────────────────────
     * Storyスチル演出
     * ─────────────────────────────
     *
     * 差分同士は短めのクロスフェード。
     * 立ち絵 ⇄ スチルは、乙女ゲーム風に
     * ゆっくり黒を挟んで切り替える。
     */
    const STORY_STILL_CROSSFADE_FRAMES = 12;
    const STORY_STILL_BLACK_FADE_FRAMES = 30;
    const STORY_STILL_BLACK_HOLD_FRAMES = 6;

    /*
     * スチル演出の進行状態。
     * nullなら演出なし。
     */
    let storyStillTransitionState = null;

    /*
     * ─────────────────────────────
     * Story背景・時間経過トランジション
     * ─────────────────────────────
     *
     * storyBackground / storyBackgroundClear:
     *   場所移動。黒の裏で背景を交換する。
     *
     * storyBlackFade:
     *   背景を変えず、時間経過・場面区切りだけを
     *   黒フェードで表現する。
     *
     * 数値は「暗転開始から復帰までの総秒数」。
     */
    const STORY_SCENE_DEFAULT_SECONDS = 0.9;
    const STORY_SCENE_MIN_SECONDS = 0.1;

    let storySceneTransitionState = null;

    /*
     * ─────────────────────────────
     * UIを残す黒フェード
     * ─────────────────────────────
     *
     * 背景・スチル・立ち絵より前、
     * メッセージウィンドウ・ネームプレートより後ろ。
     *
     * StoryData:
     *   storyUiBlackFade: 1
     */
    let storyUiBlackFadeState = null;

    /*
     * ストーリー開始前の
     * ランダム憑依設定を保存する。
     */
    let previousRandomPossessionEnabled =
    null;
    /*
    * ストーリーを開く前の、
     * 通常会話側の憑依・立ち絵状態。
     */
    let previousTalkStateSnapshot =
    null;

    let storyPlaying = false;

    let currentEpisode = null;
    let currentPageIndex = 0;

    /*
     * 現在再生中の一話で使う原寸スチルだけを保持する。
     * 話数終了・中断時にMap内のBitmapをすべて破棄する。
     */
    let storyEpisodeStillBitmaps =
        new Map();

    let storyConfirmOpen = false;

    /*
     * ─────────────────────────────
     * ストーリー再生トランジション
     * ─────────────────────────────
     *
     * 話数開始／自然終了／EXIT終了の
     * 舞台転換を黒画面で完全に隠す。
     */
    const STORY_TRANSITION_FADE_FRAMES = 12;
    const STORY_TRANSITION_HOLD_FRAMES = 4;

    let storyTransitionPhase = "none";
    let storyTransitionCount = 0;
    let storyTransitionOnBlack = null;
    let storyTransitionOnComplete = null;
    let storyTransitionHoldUntil = null;

    function isStoryTransitioning() {
        return storyTransitionPhase !== "none";
    }

    function ensureStoryTransitionOverlay() {
        const scene =
            getScene();

        if (!scene) {
            return null;
        }

        let overlay =
            scene._denOStoryTransitionOverlay;

        if (!overlay) {
            overlay =
                new Sprite(
                    new Bitmap(
                        SCREEN_WIDTH,
                        SCREEN_HEIGHT
                    )
                );

            overlay.bitmap.fillRect(
                0,
                0,
                SCREEN_WIDTH,
                SCREEN_HEIGHT,
                "#000000"
            );

            overlay.opacity = 0;
            overlay.visible = false;

            scene._denOStoryTransitionOverlay =
                overlay;
        }

        /*
         * 既存SpriteでもaddChildし直して
         * 必ずScene_Map最前面へ持ってくる。
         */
        scene.addChild(
            overlay
        );

        return overlay;
    }

    function startStoryTransition(
        onBlack,
        onComplete = null,
        holdUntil = null
    ) {
        if (isStoryTransitioning()) {
            return false;
        }

        const overlay =
            ensureStoryTransitionOverlay();

        if (!overlay) {
            return false;
        }

        storyTransitionPhase =
            "fadeOut";

        storyTransitionCount = 0;

        storyTransitionOnBlack =
            typeof onBlack === "function"
                ? onBlack
                : null;

        storyTransitionOnComplete =
            typeof onComplete === "function"
                ? onComplete
                : null;

        storyTransitionHoldUntil =
            typeof holdUntil === "function"
                ? holdUntil
                : null;

        overlay.visible = true;
        overlay.opacity = 0;

        TouchInput.clear();
        Input.clear();

        return true;
    }

    function finishStoryTransition() {
        const scene =
            getScene();

        const overlay =
            scene
                ? scene
                    ._denOStoryTransitionOverlay
                : null;

        if (overlay) {
            overlay.opacity = 0;
            overlay.visible = false;
        }

        storyTransitionPhase = "none";
        storyTransitionCount = 0;
        storyTransitionOnBlack = null;
        storyTransitionHoldUntil = null;

        const onComplete =
            storyTransitionOnComplete;

        storyTransitionOnComplete =
            null;

        TouchInput.clear();
        Input.clear();

        if (onComplete) {
            onComplete();
        }
    }

    function updateStoryTransition() {
        if (!isStoryTransitioning()) {
            return;
        }

        const scene =
            getScene();

        const overlay =
            scene
                ? scene
                    ._denOStoryTransitionOverlay
                : null;

        if (!overlay) {
            finishStoryTransition();
            return;
        }

        if (
            storyTransitionPhase ===
            "fadeOut"
        ) {
            storyTransitionCount++;

            const rate =
                Math.min(
                    1,
                    storyTransitionCount /
                    Math.max(
                        1,
                        STORY_TRANSITION_FADE_FRAMES
                    )
                );

            overlay.opacity =
                Math.round(
                    255 * rate
                );

            if (rate >= 1) {
                overlay.opacity = 255;

                storyTransitionPhase =
                    "hold";

                storyTransitionCount = 0;

                const onBlack =
                    storyTransitionOnBlack;

                storyTransitionOnBlack =
                    null;

                if (onBlack) {
                    onBlack();
                }
            }

            return;
        }

        if (
            storyTransitionPhase ===
            "hold"
        ) {
            overlay.opacity = 255;

            /*
             * 話数開始時の背景など、
             * 黒の裏で画像ロードを待ちたい場合。
             */
            if (
                storyTransitionHoldUntil &&
                !storyTransitionHoldUntil()
            ) {
                return;
            }

            storyTransitionCount++;

            if (
                storyTransitionCount >=
                STORY_TRANSITION_HOLD_FRAMES
            ) {
                storyTransitionPhase =
                    "fadeIn";

                storyTransitionCount = 0;
            }

            return;
        }

        if (
            storyTransitionPhase ===
            "fadeIn"
        ) {
            storyTransitionCount++;

            const rate =
                Math.min(
                    1,
                    storyTransitionCount /
                    Math.max(
                        1,
                        STORY_TRANSITION_FADE_FRAMES
                    )
                );

            overlay.opacity =
                Math.round(
                    255 * (1 - rate)
                );

            if (rate >= 1) {
                finishStoryTransition();
            }
        }
    }

    /*
     * ─────────────────────────────
     * 汎用確認ボタン
     * ─────────────────────────────
     *
     * ui_confirm_yes.png / ui_confirm_no.png を共用する。
     * ストーリー中断・進行状況リセットなど、
     * 確認画面の種類に依存しない。
     */
    class Sprite_StoryConfirmButton
        extends Sprite_Clickable {

        constructor(
            pictureName,
            onClick,
            soundType = "ok"
        ) {
            super();

            this._clickHandler =
                onClick;

            this._soundType =
                soundType;

            this._hovered = false;

            /*
             * 汎用processTouch側で、
             * 確認画面中も反応してよいボタンとして識別する。
             */
            this._denOConfirmButton =
                true;

            this.anchor.set(
                0.5,
                0.5
            );

            this.bitmap =
                ImageManager.loadPicture(
                    String(
                        pictureName || ""
                    )
                );

            this.opacity = 248;
        }

        update() {
            /*
             * 重要：
             * Sprite_Clickable.update() 内でクリックが成立すると、
             * onClick → closeStoryConfirm() によって
             * このボタン自身がdestroyされる場合がある。
             *
             * destroy後は this.scale が null になるため、
             * super.update() の「後」でscaleへ触ると
             *
             *   Cannot read property 'scale' of null
             *
             * が発生する。
             *
             * そのため見た目の更新を先に済ませ、
             * クリック判定を行う super.update() は
             * 必ず最後に呼ぶ。
             */
            const targetScale =
                this.isPressed()
                    ? EPISODE_BUTTON_PRESS_SCALE
                    : this._hovered
                        ? EPISODE_BUTTON_HOVER_SCALE
                        : 1;

            this.scale.x +=
                (
                    targetScale -
                    this.scale.x
                ) * 0.24;

            this.scale.y +=
                (
                    targetScale -
                    this.scale.y
                ) * 0.24;

            const targetOpacity =
                this._hovered
                    ? 255
                    : 248;

            this.opacity +=
                (
                    targetOpacity -
                    this.opacity
                ) * 0.24;

            /*
             * クリック成立後にdestroyされても、
             * この行より後では自身へ触らない。
             */
            super.update();
        }

        onMouseEnter() {
            this._hovered = true;
        }

        onMouseExit() {
            this._hovered = false;
        }

        playClickSound() {
            if (
                this._soundType ===
                "cancel"
            ) {
                SoundManager.playCancel();
                return;
            }

            if (
                this._soundType ===
                "none"
            ) {
                return;
            }

            SoundManager.playOk();
        }

        onClick() {
            TouchInput.clear();

            if (
                typeof this._clickHandler !==
                "function"
            ) {
                return;
            }

            this.playClickSound();

            this._clickHandler();
        }
    }

/*
 * ─────────────────────────────
 * ストーリー再生中 EXIT
 * ─────────────────────────────
 */

function closeStoryConfirm() {
    const scene =
        getScene();

    if (!scene) {
        storyConfirmOpen = false;
        return;
    }

    if (scene._denOStoryConfirm) {
        scene.removeChild(
            scene._denOStoryConfirm
        );

        scene._denOStoryConfirm
            .destroy({
                children: true
            });

        scene._denOStoryConfirm =
            null;
    }

    storyConfirmOpen = false;

    TouchInput.clear();
    Input.clear();
}

/*
 * 旧関数名は内部互換用に残す。
 */
function closeStoryExitConfirm() {
    closeStoryConfirm();
}

/*
 * 汎用確認画面。
 *
 * message:
 *   文字列。\nで2行程度まで表示可能。
 *
 * onYes / onNo:
 *   処理内容は呼び出し側に任せる。
 *   「はい」で自動的に閉じないのは、
 *   ストーリー中断時に黒フェード完了まで
 *   確認画面を残す必要があるため。
 */
function openStoryConfirm(
    message,
    onYes,
    onNo = null,
    options = {}
) {
    if (storyConfirmOpen) {
        return false;
    }

    const scene =
        getScene();

    if (!scene) {
        return false;
    }

    if (
        options.pauseAuto &&
        window.MamiDenOAuto &&
        typeof window.MamiDenOAuto
            .setEnabled ===
            "function"
    ) {
        window.MamiDenOAuto
            .setEnabled(false);
    }

    storyConfirmOpen = true;

    const container =
        new Sprite();

    /*
     * 画面全体を暗くする。
     */
    const dimmer =
        new Sprite(
            new Bitmap(
                SCREEN_WIDTH,
                SCREEN_HEIGHT
            )
        );

    dimmer.bitmap.fillRect(
        0,
        0,
        SCREEN_WIDTH,
        SCREEN_HEIGHT,
        "rgba(0, 0, 0, 0.55)"
    );

    container.addChild(
        dimmer
    );

    /*
     * 確認文。
     * \nで最大2行を自然に中央配置する。
     */
    const textSprite =
        new Sprite(
            new Bitmap(
                760,
                120
            )
        );

    textSprite.x = 260;
    textSprite.y = 245;

    textSprite.bitmap.fontSize = 30;
    textSprite.bitmap.textColor =
        "#ffffff";

    textSprite.bitmap.outlineColor =
        "rgba(0, 0, 0, 0.95)";

    textSprite.bitmap.outlineWidth = 5;

    const lines =
        String(
            message || ""
        )
            .split("\n")
            .slice(
                0,
                2
            );

    const lineHeight = 42;

    const totalTextHeight =
        Math.max(
            1,
            lines.length
        ) *
        lineHeight;

    const startTextY =
        Math.round(
            (
                120 -
                totalTextHeight
            ) / 2
        );

    lines.forEach(
        (
            line,
            index
        ) => {
            textSprite.bitmap.drawText(
                line,
                0,
                startTextY +
                    index *
                    lineHeight,
                760,
                lineHeight,
                "center"
            );
        }
    );

    container.addChild(
        textSprite
    );

    /*
     * はい。
     */
    const yesButton =
        new Sprite_StoryConfirmButton(
            CONFIRM_YES_PICTURE,
            () => {
                if (
                    typeof onYes ===
                    "function"
                ) {
                    onYes();
                }
            },
            "ok"
        );

    yesButton.x =
        CONFIRM_YES_POSITION[0];

    yesButton.y =
        CONFIRM_YES_POSITION[1];

    container.addChild(
        yesButton
    );

    /*
     * いいえ。
     */
    const noButton =
        new Sprite_StoryConfirmButton(
            CONFIRM_NO_PICTURE,
            () => {
                if (
                    typeof onNo ===
                    "function"
                ) {
                    onNo();
                }
                else {
                    closeStoryConfirm();
                }
            },
            "cancel"
        );

    noButton.x =
        CONFIRM_NO_POSITION[0];

    noButton.y =
        CONFIRM_NO_POSITION[1];

    container.addChild(
        noButton
    );

    scene._denOStoryConfirm =
        container;

    /*
     * Scene_Map最前面。
     */
    scene.addChild(
        container
    );

    TouchInput.clear();
    Input.clear();

    return true;
}


function abortCurrentStoryEpisode() {
    const scene =
        getScene();

    if (
        !scene ||
        isStoryTransitioning()
    ) {
        return;
    }

    /*
     * AUTO停止。
     */
    if (
        window.MamiDenOAuto &&
        typeof window.MamiDenOAuto
            .setEnabled ===
            "function"
    ) {
        window.MamiDenOAuto
            .setEnabled(false);
    }

    /*
     * 「はい」を押した瞬間には
     * まだ画面を片付けない。
     *
     * 現在のストーリー画面ごと黒へ落とし、
     * 完全に黒くなってから裏で終了処理する。
     */
    startStoryTransition(
        () => {
            /*
             * 黒画面の裏で確認画面を閉じる。
             */
            closeStoryConfirm();

            /*
             * 残りのストーリー本文を破棄。
             */
            if ($gameMessage) {
                $gameMessage.clear();
            }

            /*
             * Window_Message本体は殺さず、
             * 次回使える閉じた待機状態へ戻す。
             */
            const messageWindow =
                scene._messageWindow;

            if (messageWindow) {
                messageWindow.pause = false;
                messageWindow._textState = null;
                messageWindow._waitCount = 0;

                messageWindow._showFast = false;
                messageWindow._lineShowFast = false;

                messageWindow.visible = true;
                messageWindow.openness = 0;

                if (messageWindow.contents) {
                    messageWindow.contents.clear();
                }
            }

            /*
             * ネームプレートも黒画面の裏で消す。
             */
            if (
                window.MamiDenOMessageUI &&
                typeof window.MamiDenOMessageUI
                    .hideNamePlate ===
                    "function"
            ) {
                window.MamiDenOMessageUI
                    .hideNamePlate();
            }

            storyPlaying = false;
            currentEpisode = null;
            currentPageIndex = 0;

            clearAllStoryVisuals();

            const storyScreen =
                scene._denOStoryScreen;

            if (storyScreen) {
                storyScreen._episodeWasBusy =
                    false;

                storyScreen.visible = true;

                storyScreen.showEpisodeList(
                    storyScreen._currentRoute
                );
            }

            TouchInput.clear();
            Input.clear();
        }
    );
}


function openStoryExitConfirm() {
    if (
        storyConfirmOpen ||
        !storyPlaying
    ) {
        return;
    }

    openStoryConfirm(
        "ストーリーを終了しますか？",
        () => {
            abortCurrentStoryEpisode();
        },
        () => {
            closeStoryConfirm();
        },
        {
            pauseAuto: true
        }
    );
}

class Sprite_StoryExitButton
    extends Sprite_Clickable {

    constructor() {
        super();

        /*
         * 画面上での表示サイズ。
         */
        this._width = 95;
        this._height = 40;

        this._hovered = false;

        /*
         * EXIT画像。
         * img/pictures/btn_story_exit.png
         */
        this.bitmap =
            ImageManager.loadPicture(
                "btn_story_exit"
            );

        /*
         * 拡縮しても中心から
         * ふわっと動くようにする。
         */
        this.anchor.set(
            0.5,
            0.5
        );

        /*
         位置。
         */
        this.x = 1203;
        this.y = 44;

        /*
         * 元画像サイズに関係なく、
         * 150×50へ合わせるための倍率。
         */
        this._baseScaleX = 1;
        this._baseScaleY = 1;

        const applyFit = () => {
            if (
                !this.bitmap ||
                this.bitmap.width <= 0 ||
                this.bitmap.height <= 0
            ) {
                return;
            }

            this._baseScaleX =
                this._width /
                this.bitmap.width;

            this._baseScaleY =
                this._height /
                this.bitmap.height;

            this.scale.set(
                this._baseScaleX,
                this._baseScaleY
            );
        };

        if (this.bitmap.isReady()) {
            applyFit();
        } else {
            this.bitmap.addLoadListener(
                applyFit
            );
        }

        this.visible = false;
    }

    update() {
        super.update();

        /*
         * ストーリー再生中だけ表示。
         */
        this.visible =
            storyPlaying &&
            !storyConfirmOpen;

        if (!this.visible) {
            return;
        }

        /*
         * HIDEボタンと同じ感じ。
         *
         * 通常      1.00
         * ホバー    1.05
         * 押下      0.96
         */
        const zoom =
            this.isPressed()
                ? 0.96
                : this._hovered
                    ? 1.05
                    : 1;

        const targetScaleX =
            this._baseScaleX *
            zoom;

        const targetScaleY =
            this._baseScaleY *
            zoom;

        /*
         * ふわっと追従。
         */
        this.scale.x +=
            (
                targetScaleX -
                this.scale.x
            ) * 0.20;

        this.scale.y +=
            (
                targetScaleY -
                this.scale.y
            ) * 0.20;
    }

    onMouseEnter() {
        this._hovered = true;
    }

    onMouseExit() {
        this._hovered = false;
    }

    onClick() {
        if (
            !this.visible ||
            storyConfirmOpen
        ) {
            return;
        }

        TouchInput.clear();
        Input.clear();

        openStoryExitConfirm();
    }
}
    /*
     * ─────────────────────────────
     * ルート選択カード
     * ─────────────────────────────
     *
     * 308×438で作成した完成済みパス画像を
     * そのままクリック可能なルートカードとして使う。
     */

    class Sprite_StoryRouteButton
        extends Sprite_Clickable {

        constructor(
            route,
            onClick
        ) {
            super();

            this._route = route;
            this._clickHandler =
                onClick;

            this._hovered = false;
            this._cardReady = false;
            this._cardBaseScale = 1;

            this._style =
                ROUTE_CARD_STYLE[
                    String(route.id || "")
                ] || {
                    image: ""
                };

            /*
             * 透明Bitmapをクリック判定用に持たせる。
             * 実際に見えるカード画像は子Sprite。
             * こうしておくとホバーで画像を拡大しても
             * クリック範囲は288×410のまま安定する。
             */
            this.bitmap =
                new Bitmap(
                    PANEL_WIDTH,
                    PANEL_HEIGHT
                );

            this._cardImage =
                new Sprite();

            this._cardImage.anchor.set(
                0.5,
                0.5
            );

            this._cardImage.x =
                PANEL_WIDTH / 2;

            this._cardImage.y =
                PANEL_HEIGHT / 2;

            this._cardImage.visible = false;

            this.addChild(
                this._cardImage
            );

            this.setupCardImage();
        }

        setupCardImage() {
            const pictureName =
                String(
                    this._style.image || ""
                );

            if (!pictureName) {
                return;
            }

            const bitmap =
                ImageManager.loadPicture(
                    pictureName
                );

            this._cardImage.bitmap = bitmap;

            const fit = () => {
                if (
                    !bitmap ||
                    bitmap.width <= 0 ||
                    bitmap.height <= 0
                ) {
                    return;
                }

                /*
                 * 元画像308×438の縦横比を絶対に崩さず、
                 * 288×410の枠内へ最大サイズで収める。
                 */
                this._cardBaseScale =
                    Math.min(
                        PANEL_WIDTH /
                            bitmap.width,
                        PANEL_HEIGHT /
                            bitmap.height
                    );

                this._cardImage.scale.set(
                    this._cardBaseScale,
                    this._cardBaseScale
                );

                this._cardImage.opacity = 245;
                this._cardImage.visible = true;
                this._cardReady = true;
            };

            if (bitmap.isReady()) {
                fit();
            }
            else {
                bitmap.addLoadListener(
                    fit
                );
            }
        }

        update() {
            super.update();

            if (
                !this._cardImage ||
                !this._cardReady
            ) {
                return;
            }

            const targetScale =
                this._cardBaseScale *
                (
                    this._hovered
                        ? ROUTE_CARD_HOVER_SCALE
                        : 1
                );

            const targetY =
                PANEL_HEIGHT / 2 -
                (
                    this._hovered
                        ? ROUTE_CARD_HOVER_LIFT
                        : 0
                );

            const targetOpacity =
                this._hovered
                    ? 255
                    : 245;

            /*
             * カーソルを乗せた時だけ、
             * パスが少し手前へ浮くように見せる。
             */
            this._cardImage.scale.x +=
                (
                    targetScale -
                    this._cardImage.scale.x
                ) * 0.22;

            this._cardImage.scale.y +=
                (
                    targetScale -
                    this._cardImage.scale.y
                ) * 0.22;

            this._cardImage.y +=
                (
                    targetY -
                    this._cardImage.y
                ) * 0.22;

            this._cardImage.opacity +=
                (
                    targetOpacity -
                    this._cardImage.opacity
                ) * 0.22;
        }

        onMouseEnter() {
            this._hovered = true;
        }

        onMouseExit() {
            this._hovered = false;
        }

        onClick() {
            TouchInput.clear();

            if (
                typeof this._clickHandler ===
                "function"
            ) {
                SoundManager.playOk();

                this._clickHandler(
                    this._route
                );
            }
        }
    }

    /*
     * ─────────────────────────────
     * 話数選択用・画像ボタン
     * ─────────────────────────────
     *
     * 完成済みPNGをそのままクリック可能にする。
     * ホバー差分画像は使わず、JS側で軽く拡大・増光する。
     */
    class Sprite_StoryImageButton
        extends Sprite_Clickable {

        constructor(
            pictureName,
            onClick,
            soundType = "ok",
            displayWidth = null,
            displayHeight = null,
            idleOpacity = 248
        ) {
            super();

            this._clickHandler = onClick;
            this._soundType = soundType;
            this._hovered = false;

            this._displayWidth =
                Number(displayWidth) > 0
                    ? Number(displayWidth)
                    : null;

            this._displayHeight =
                Number(displayHeight) > 0
                    ? Number(displayHeight)
                    : null;

            this._baseScaleX = 1;
            this._baseScaleY = 1;

            this._idleOpacity =
                Math.max(
                    0,
                    Math.min(
                        255,
                        Number(idleOpacity) || 0
                    )
                );

            this.anchor.set(0.5, 0.5);

            this.bitmap =
                ImageManager.loadPicture(
                    String(pictureName || "")
                );

            const applyDisplaySize = () => {
                if (
                    !this.bitmap ||
                    this.bitmap.width <= 0 ||
                    this.bitmap.height <= 0
                ) {
                    return;
                }

                this._baseScaleX =
                    this._displayWidth
                        ? this._displayWidth /
                            this.bitmap.width
                        : 1;

                this._baseScaleY =
                    this._displayHeight
                        ? this._displayHeight /
                            this.bitmap.height
                        : 1;

                this.scale.set(
                    this._baseScaleX,
                    this._baseScaleY
                );
            };

            if (this.bitmap.isReady()) {
                applyDisplaySize();
            }
            else {
                this.bitmap.addLoadListener(
                    applyDisplaySize
                );
            }

            this.opacity =
                this._idleOpacity;
        }

        update() {
            super.update();

            const zoom =
                this.isPressed()
                    ? EPISODE_BUTTON_PRESS_SCALE
                    : this._hovered
                        ? EPISODE_BUTTON_HOVER_SCALE
                        : 1;

            const targetScaleX =
                this._baseScaleX *
                zoom;

            const targetScaleY =
                this._baseScaleY *
                zoom;

            this.scale.x +=
                (
                    targetScaleX -
                    this.scale.x
                ) * 0.24;

            this.scale.y +=
                (
                    targetScaleY -
                    this.scale.y
                ) * 0.24;

            const targetOpacity =
                this._hovered
                    ? 255
                    : this._idleOpacity;

            this.opacity +=
                (
                    targetOpacity -
                    this.opacity
                ) * 0.24;
        }

        onMouseEnter() {
            this._hovered = true;
        }

        onMouseExit() {
            this._hovered = false;
        }

        playClickSound() {
            if (this._soundType === "cursor") {
                SoundManager.playCursor();
                return;
            }

            if (this._soundType === "cancel") {
                SoundManager.playCancel();
                return;
            }

            if (this._soundType === "none") {
                return;
            }

            SoundManager.playOk();
        }

        onClick() {
            TouchInput.clear();

            if (
                typeof this._clickHandler !==
                "function"
            ) {
                return;
            }

            this.playClickSound();
            this._clickHandler();
        }
    }

    /*
     * ─────────────────────────────
     * ギャラリー用・CG一覧生成
     * ─────────────────────────────
     *
     * StoryDataの storyStill を読み取り、
     *
     *   CG_momotaros_ep04_01.png
     *   CG_momotaros_ep04_02.png
     *   CG_momotaros_ep04_03.png
     *
     * を1つのCG枠
     *
     *   CG_momotaros_ep04
     *
     * としてまとめる。
     *
     * _01 が必ずサムネイル。
     */
    function collectStoryStillNames(
        value,
        output
    ) {
        if (!value) {
            return;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                collectStoryStillNames(
                    item,
                    output
                );
            }

            return;
        }

        if (
            typeof value !==
            "object"
        ) {
            return;
        }

        for (
            const key of
            Object.keys(value)
        ) {
            const child =
                value[key];

            if (
                key === "storyStill" &&
                typeof child === "string" &&
                child
            ) {
                output.push(
                    child
                );

                continue;
            }

            if (
                child &&
                (
                    Array.isArray(child) ||
                    typeof child ===
                        "object"
                )
            ) {
                collectStoryStillNames(
                    child,
                    output
                );
            }
        }
    }

    /*
     * ─────────────────────────────
     * 一話単位のストーリースチル先読み
     * ─────────────────────────────
     *
     * ImageManagerの全体キャッシュには入れず、
     * 現在の一話専用Mapでだけ保持する。
     * これにより物語中は即表示でき、終了後は確実に解放できる。
     */
    function getStoryStillMemoryKey(
        filename
    ) {
        return String(filename || "")
            .trim()
            .replace(/^.*[\\/]/, "")
            .replace(/\.png$/i, "")
            .toLowerCase();
    }

    function getStoryEpisodeStillBitmap(
        filename
    ) {
        const key =
            getStoryStillMemoryKey(
                filename
            );

        if (!key) {
            return null;
        }

        if (
            storyEpisodeStillBitmaps.has(
                key
            )
        ) {
            return storyEpisodeStillBitmaps.get(
                key
            );
        }

        const bitmap =
            loadTransientGalleryPicture(
                filename
            );

        bitmap.smooth = true;

        storyEpisodeStillBitmaps.set(
            key,
            bitmap
        );

        return bitmap;
    }

    function preloadStoryEpisodeStills(
        episode
    ) {
        releaseStoryEpisodeStills();

        const filenames = [];

        collectStoryStillNames(
            episode,
            filenames
        );

        for (
            const filename of
            new Set(filenames)
        ) {
            getStoryEpisodeStillBitmap(
                filename
            );
        }

        return Array.from(
            storyEpisodeStillBitmaps.values()
        );
    }

    function areStoryEpisodeStillsReady(
        bitmaps
    ) {
        return bitmaps.every(
            bitmap =>
                !bitmap ||
                bitmap.isReady() ||
                bitmap.isError()
        );
    }

    function releaseStoryEpisodeStills() {
        const bitmaps =
            new Set(
                storyEpisodeStillBitmaps.values()
            );

        storyEpisodeStillBitmaps.clear();

        for (const bitmap of bitmaps) {
            destroyTransientGalleryBitmap(
                bitmap
            );
        }
    }

    function normalizeGalleryStillName(
        filename
    ) {
        return String(
            filename || ""
        )
            .trim()
            .replace(/^.*[\\/]/, "");
    }

    function getGalleryStillGroupId(
        filename
    ) {
        return normalizeGalleryStillName(
            filename
        )
            .replace(/\.png$/i, "")
            .replace(
                /_\d{2}$/,
                ""
            );
    }

    function getGalleryStillVariantNumber(
        filename
    ) {
        const match =
            normalizeGalleryStillName(
                filename
            ).match(
                /_(\d{2})\.png$/i
            );

        return match
            ? Number(match[1])
            : 9999;
    }

    function makeGalleryCatalog() {
        if (galleryCatalogCache) {
            return galleryCatalogCache;
        }

        const data =
            window.MamiDenOStoryData;

        if (
            !data ||
            typeof data.getRoutes !==
                "function"
        ) {
            galleryCatalogCache = [];
            return galleryCatalogCache;
        }

        const allRoutes =
            data.getRoutes();

        const catalog = [];

        for (
            const routeId of
            MAIN_ROUTE_IDS
        ) {
            const route =
                allRoutes.find(
                    item =>
                        String(
                            item &&
                            item.id ||
                            ""
                        ) ===
                        routeId
                );

            if (!route) {
                continue;
            }

            const stillNames = [];

            collectStoryStillNames(
                route,
                stillNames
            );

            const groups =
                new Map();

            for (
                const filename of
                stillNames
            ) {
                const normalized =
                    normalizeGalleryStillName(
                        filename
                    );

                const groupId =
                    getGalleryStillGroupId(
                        normalized
                    );

                if (
                    !normalized ||
                    !groupId
                ) {
                    continue;
                }

                if (!groups.has(groupId)) {
                    groups.set(
                        groupId,
                        {
                            id: groupId,
                            character: routeId,
                            variants: []
                        }
                    );
                }

                const group =
                    groups.get(
                        groupId
                    );

                if (
                    !group.variants.includes(
                        normalized
                    )
                ) {
                    group.variants.push(
                        normalized
                    );
                }
            }

            for (
                const group of
                groups.values()
            ) {
                group.variants.sort(
                    (
                        a,
                        b
                    ) =>
                        getGalleryStillVariantNumber(
                            a
                        ) -
                        getGalleryStillVariantNumber(
                            b
                        )
                );

                const firstStill =
                    group.variants.find(
                        filename =>
                            /_01\.png$/i
                                .test(filename)
                    ) ||
                    group.variants[0] ||
                    "";

                group.thumbnail =
                    firstStill;

                catalog.push(
                    group
                );
            }
        }

        galleryCatalogCache =
            catalog;

        return galleryCatalogCache;
    }

    function isGalleryEntryUnlocked(
        entry,
        debugUnlockAll = false
    ) {
        if (
            !entry ||
            !entry.thumbnail
        ) {
            return false;
        }

        /*
         * デバッグ全開放は表示上だけ。
         * localStorageへは一切書き込まない。
         */
        if (debugUnlockAll) {
            return true;
        }

        if (
            !window.MamiDenOProgress ||
            typeof window.MamiDenOProgress
                .isStillUnlocked !==
                "function"
        ) {
            return false;
        }

        return !!window.MamiDenOProgress
            .isStillUnlocked(
                entry.thumbnail
            );
    }

    /*
     * ギャラリー閲覧では、
     * 実際に本編で見た差分だけを順番に表示する。
     * 未見差分は先回りして見せない。
     */
    function getUnlockedGalleryVariants(
        entry,
        debugUnlockAll = false
    ) {
        if (
            !entry ||
            !Array.isArray(
                entry.variants
            )
        ) {
            return [];
        }

        /*
         * デバッグ時だけ、
         * StoryDataに登録されている全差分を閲覧可能にする。
         * Progressには記録しない。
         */
        if (debugUnlockAll) {
            return entry.variants.slice();
        }

        if (
            !window.MamiDenOProgress ||
            typeof window.MamiDenOProgress
                .isStillUnlocked !==
                "function"
        ) {
            return [];
        }

        return entry.variants.filter(
            filename =>
                window.MamiDenOProgress
                    .isStillUnlocked(
                        filename
                    )
        );
    }

    function fitGalleryViewerSprite(
        sprite
    ) {
        if (
            !sprite ||
            !sprite.bitmap
        ) {
            return;
        }

        const bitmap =
            sprite.bitmap;

        const applyFit = () => {
            if (
                sprite.bitmap !== bitmap ||
                bitmap.width <= 0 ||
                bitmap.height <= 0
            ) {
                return;
            }

            /*
             * 全画面内へcontain。
             * 1280×720CGならそのまま全面表示。
             * 異なるサイズでも縦横比は絶対に崩さない。
             */
            const scale =
                Math.min(
                    SCREEN_WIDTH /
                        bitmap.width,
                    SCREEN_HEIGHT /
                        bitmap.height
                );

            sprite.anchor.set(
                0.5,
                0.5
            );

            sprite.x =
                SCREEN_WIDTH / 2;

            sprite.y =
                SCREEN_HEIGHT / 2;

            sprite.scale.set(
                scale,
                scale
            );
        };

        if (bitmap.isReady()) {
            applyFit();
        }
        else {
            bitmap.addLoadListener(
                applyFit
            );
        }
    }

    function fitGalleryFrameSprite(
        sprite,
        width,
        height
    ) {
        if (
            !sprite ||
            !sprite.bitmap
        ) {
            return;
        }

        const applyFit = () => {
            if (
                !sprite.bitmap ||
                sprite.bitmap.width <= 0 ||
                sprite.bitmap.height <= 0
            ) {
                return;
            }

            sprite.scale.set(
                width /
                    sprite.bitmap.width,
                height /
                    sprite.bitmap.height
            );
        };

        if (sprite.bitmap.isReady()) {
            applyFit();
        }
        else {
            sprite.bitmap.addLoadListener(
                applyFit
            );
        }
    }

    /*
     * ─────────────────────────────
     * 高品質サムネイル生成
     * ─────────────────────────────
     *
     * 元CGをSpriteのscaleだけで1280×720 → 250×141へ
     * 一気に縮小すると、細い線や髪・輪郭などが
     * チリチリ / モアレっぽく見えることがある。
     *
     * そこでギャラリー用だけ、
     * 読み込み時にCanvasへ高品質縮小した
     * 250×141のBitmapを1枚生成し、
     * その後はscale=1のまま表示する。
     *
     * ・縦横比は維持
     * ・中央基準でごく僅かにcrop
     * ・imageSmoothingQuality = "high"
     * ・大きな画像は段階縮小してエイリアシングを抑える
     */
    function drawHighQualityGalleryThumbnail(
        targetBitmap,
        sourceBitmap
    ) {
        if (
            !targetBitmap ||
            !sourceBitmap ||
            sourceBitmap.width <= 0 ||
            sourceBitmap.height <= 0
        ) {
            return;
        }

        const targetWidth =
            GALLERY_THUMB_WIDTH;

        const targetHeight =
            GALLERY_THUMB_HEIGHT;

        const targetRatio =
            targetWidth /
            targetHeight;

        const sourceRatio =
            sourceBitmap.width /
            sourceBitmap.height;

        let sx = 0;
        let sy = 0;
        let sw =
            sourceBitmap.width;
        let sh =
            sourceBitmap.height;

        /*
         * coverで中央crop。
         * 縦横を別倍率にしないので歪まない。
         */
        if (
            sourceRatio >
            targetRatio
        ) {
            sw =
                sourceBitmap.height *
                targetRatio;

            sx =
                (
                    sourceBitmap.width -
                    sw
                ) / 2;
        }
        else if (
            sourceRatio <
            targetRatio
        ) {
            sh =
                sourceBitmap.width /
                targetRatio;

            sy =
                (
                    sourceBitmap.height -
                    sh
                ) / 2;
        }

        /*
         * Bitmap.canvas はMZ側でCanvasを保証してくれる。
         * ブラウザ版 / NW.js版どちらでも使える。
         */
        const sourceCanvas =
            sourceBitmap.canvas;

        if (!sourceCanvas) {
            return;
        }

        /*
         * 最初はcrop範囲をそのまま扱い、
         * 半分ずつ段階的に縮小する。
         * 一発のbilinear縮小より細線が安定しやすい。
         */
        let currentSource =
            sourceCanvas;

        let currentSx = sx;
        let currentSy = sy;
        let currentWidth = sw;
        let currentHeight = sh;

        while (
            currentWidth >
                targetWidth * 2 ||
            currentHeight >
                targetHeight * 2
        ) {
            const nextWidth =
                Math.max(
                    targetWidth,
                    Math.round(
                        currentWidth / 2
                    )
                );

            const nextHeight =
                Math.max(
                    targetHeight,
                    Math.round(
                        currentHeight / 2
                    )
                );

            const tempCanvas =
                document.createElement(
                    "canvas"
                );

            tempCanvas.width =
                nextWidth;

            tempCanvas.height =
                nextHeight;

            const tempContext =
                tempCanvas.getContext(
                    "2d"
                );

            if (!tempContext) {
                break;
            }

            tempContext.imageSmoothingEnabled =
                true;

            if (
                "imageSmoothingQuality" in
                tempContext
            ) {
                tempContext.imageSmoothingQuality =
                    "high";
            }

            tempContext.drawImage(
                currentSource,
                currentSx,
                currentSy,
                currentWidth,
                currentHeight,
                0,
                0,
                nextWidth,
                nextHeight
            );

            currentSource =
                tempCanvas;

            currentSx = 0;
            currentSy = 0;
            currentWidth =
                nextWidth;

            currentHeight =
                nextHeight;
        }

        const context =
            targetBitmap.context;

        if (!context) {
            return;
        }

        context.clearRect(
            0,
            0,
            targetWidth,
            targetHeight
        );

        context.imageSmoothingEnabled =
            true;

        if (
            "imageSmoothingQuality" in
            context
        ) {
            context.imageSmoothingQuality =
                "high";
        }

        context.drawImage(
            currentSource,
            currentSx,
            currentSy,
            currentWidth,
            currentHeight,
            0,
            0,
            targetWidth,
            targetHeight
        );

        /*
         * Canvasへ直接描いたのでPIXIテクスチャへ反映。
         */
        if (targetBitmap.baseTexture) {
            targetBitmap.baseTexture.update();
        }
        else if (
            targetBitmap._baseTexture
        ) {
            targetBitmap._baseTexture.update();
        }
    }

    function createGalleryThumbnailSprite(
        filename
    ) {
        const thumbnailBitmap =
            new Bitmap(
                GALLERY_THUMB_WIDTH,
                GALLERY_THUMB_HEIGHT
            );

        /*
         * MZ側のBitmapも滑らか補間を明示。
         */
        thumbnailBitmap.smooth =
            true;

        const thumbnail =
            new Sprite(
                thumbnailBitmap
            );

        thumbnail.x =
            GALLERY_THUMB_X;

        thumbnail.y =
            GALLERY_THUMB_Y;

        enqueueGalleryThumbnailLoad(
            filename,
            thumbnailBitmap
        );

        return thumbnail;
    }

    function isGalleryThumbnailTargetAlive(
        bitmap
    ) {
        if (!bitmap) {
            return false;
        }

        const baseTexture =
            bitmap.baseTexture ||
            bitmap._baseTexture;

        return !baseTexture ||
            !baseTexture.destroyed;
    }

    function enqueueGalleryThumbnailLoad(
        filename,
        targetBitmap
    ) {
        galleryThumbnailLoadQueue.push({
            filename: filename,
            targetBitmap: targetBitmap,
            generation:
                galleryThumbnailLoadGeneration
        });

        processGalleryThumbnailLoadQueue();
    }

    function processGalleryThumbnailLoadQueue() {
        while (
            galleryThumbnailLoadCount <
                GALLERY_THUMB_LOAD_LIMIT &&
            galleryThumbnailLoadQueue.length > 0
        ) {
            const job =
                galleryThumbnailLoadQueue.shift();

            if (
                !job ||
                job.generation !==
                    galleryThumbnailLoadGeneration ||
                !isGalleryThumbnailTargetAlive(
                    job.targetBitmap
                )
            ) {
                continue;
            }

            galleryThumbnailLoadCount++;

            const sourceBitmap =
                loadTransientGalleryPicture(
                    job.filename
                );

            sourceBitmap.smooth = true;

            const finish = () => {
                if (
                    job.generation ===
                        galleryThumbnailLoadGeneration &&
                    isGalleryThumbnailTargetAlive(
                        job.targetBitmap
                    )
                ) {
                    drawHighQualityGalleryThumbnail(
                        job.targetBitmap,
                        sourceBitmap
                    );
                }

                /*
                 * 250×141へ転写し終えた原寸CGは即解放。
                 */
                destroyTransientGalleryBitmap(
                    sourceBitmap
                );

                galleryThumbnailLoadCount =
                    Math.max(
                        0,
                        galleryThumbnailLoadCount - 1
                    );

                processGalleryThumbnailLoadQueue();
            };

            if (sourceBitmap.isReady()) {
                finish();
            }
            else {
                sourceBitmap.addLoadListener(
                    finish
                );
            }
        }
    }

    function cancelPendingGalleryThumbnailLoads() {
        galleryThumbnailLoadGeneration++;
        galleryThumbnailLoadQueue = [];
    }

    class Sprite_GalleryThumbnailCard
        extends Sprite_Clickable {

        constructor(
            entry,
            unlocked,
            onClick = null,
            pointerGuard = null
        ) {
            super();

            this._entry = entry;
            this._unlocked =
                !!unlocked;

            this._clickHandler =
                onClick;

            /*
             * PIXIのmaskは見た目を切り抜くが、
             * RPGツクールMZのSprite_Clickable側の
             * クリック判定までは自動で切られない。
             *
             * スクロールで上へ隠れたカードが
             * タブの上に透明な当たり判定として残らないよう、
             * 「現在ポインタがギャラリー表示枠内か」を
             * 別途チェックする。
             */
            this._pointerGuard =
                pointerGuard;

            /*
             * 透明Bitmapをカード全体のクリック判定に使う。
             * 見た目は子Spriteのサムネ＋フレーム。
             */
            this.bitmap =
                new Bitmap(
                    GALLERY_CARD_WIDTH,
                    GALLERY_CARD_HEIGHT
                );

            if (this._unlocked) {
                this.createUnlockedCard();
            }
            else {
                this.createLockedCard();
            }
        }

        createUnlockedCard() {
            const thumbSprite =
                createGalleryThumbnailSprite(
                    this._entry.thumbnail
                );

            this.addChild(
                thumbSprite
            );

            /*
             * CG専用フレームは
             * 必ずサムネより上へ。
             * 内側の角が画像へかぶるデザインを
             * そのまま見せる。
             */
            const frame =
                new Sprite(
                    ImageManager.loadPicture(
                        GALLERY_CG_FRAME_PICTURE
                    )
                );

            fitGalleryFrameSprite(
                frame,
                GALLERY_CARD_WIDTH,
                GALLERY_CARD_HEIGHT
            );

            this.addChild(
                frame
            );
        }

        createLockedCard() {
            /*
             * LOCKED画像そのものはサムネと同じ250×141。
             *
             * 以前はカード全体260×175へ強制変形していたため、
             * 250×141 → 260×175 となり、
             * 縦だけ約1.24倍に伸びて見えていた。
             *
             * ここでは元画像の比率を保ったまま
             * サムネ領域250×141へ置く。
             */
            const locked =
                new Sprite(
                    ImageManager.loadPicture(
                        GALLERY_CG_LOCKED_PICTURE
                    )
                );

            locked.x =
                GALLERY_THUMB_X;

            locked.y =
                GALLERY_THUMB_Y;

            const fitLocked = () => {
                if (
                    !locked.bitmap ||
                    locked.bitmap.width <= 0 ||
                    locked.bitmap.height <= 0
                ) {
                    return;
                }

                const scale =
                    Math.min(
                        GALLERY_THUMB_WIDTH /
                            locked.bitmap.width,
                        GALLERY_THUMB_HEIGHT /
                            locked.bitmap.height
                    );

                locked.scale.set(
                    scale,
                    scale
                );

                const drawWidth =
                    locked.bitmap.width *
                    scale;

                const drawHeight =
                    locked.bitmap.height *
                    scale;

                locked.x =
                    GALLERY_THUMB_X +
                    (
                        GALLERY_THUMB_WIDTH -
                        drawWidth
                    ) / 2;

                locked.y =
                    GALLERY_THUMB_Y +
                    (
                        GALLERY_THUMB_HEIGHT -
                        drawHeight
                    ) / 2;
            };

            if (locked.bitmap.isReady()) {
                fitLocked();
            }
            else {
                locked.bitmap.addLoadListener(
                    fitLocked
                );
            }

            this.addChild(
                locked
            );

            /*
             * LOCKED状態でも通常と同じ外枠を上に重ねる。
             * フレームの内側の角が画像へかぶるデザインを維持。
             */
            const frame =
                new Sprite(
                    ImageManager.loadPicture(
                        GALLERY_CG_FRAME_PICTURE
                    )
                );

            fitGalleryFrameSprite(
                frame,
                GALLERY_CARD_WIDTH,
                GALLERY_CARD_HEIGHT
            );

            this.addChild(
                frame
            );
        }

        isClickEnabled() {
            if (!this._unlocked) {
                return false;
            }

            if (
                typeof this._pointerGuard ===
                    "function" &&
                !this._pointerGuard()
            ) {
                return false;
            }

            return super.isClickEnabled();
        }

        onClick() {
            if (
                !this._unlocked ||
                typeof this._clickHandler !==
                    "function"
            ) {
                return;
            }

            /*
             * 実際のビューア生成は
             * StoryScreen.update末尾へ預ける。
             * クリック中のSpriteツリー変更を避けるため。
             */
            this._clickHandler(
                this._entry
            );

            TouchInput.clear();
        }
    }

    /*
     * ─────────────────────────────
     * ギャラリー絞り込みタブ
     * ─────────────────────────────
     *
     * 通常画像 / active画像を切り替える。
     * ホバー差分画像は使わず、拡大だけJS側で行う。
     */
    class Sprite_GalleryTabButton
        extends Sprite_Clickable {

        constructor(
            tabId,
            onClick
        ) {
            super();

            this._tabId =
                String(tabId || "all");

            this._clickHandler =
                onClick;

            this._hovered = false;
            this._active = false;

            const pictures =
                GALLERY_TAB_PICTURES[
                    this._tabId
                ] ||
                GALLERY_TAB_PICTURES.all;

            this._normalBitmap =
                ImageManager.loadPicture(
                    pictures.normal
                );

            this._activeBitmap =
                ImageManager.loadPicture(
                    pictures.active
                );

            this.bitmap =
                this._normalBitmap;

            this.anchor.set(
                0.5,
                0.5
            );

            this.opacity = 248;
        }

        get tabId() {
            return this._tabId;
        }

        setActive(
            active
        ) {
            const nextActive =
                !!active;

            if (
                this._active ===
                nextActive
            ) {
                return;
            }

            this._active =
                nextActive;

            this.bitmap =
                this._active
                    ? this._activeBitmap
                    : this._normalBitmap;
        }

        update() {
            super.update();

            const targetScale =
                this.isPressed()
                    ? 0.97
                    : this._hovered
                        ? 1.035
                        : this._active
                            ? 1.01
                            : 1;

            this.scale.x +=
                (
                    targetScale -
                    this.scale.x
                ) * 0.24;

            this.scale.y +=
                (
                    targetScale -
                    this.scale.y
                ) * 0.24;

            const targetOpacity =
                (
                    this._hovered ||
                    this._active
                )
                    ? 255
                    : 248;

            this.opacity +=
                (
                    targetOpacity -
                    this.opacity
                ) * 0.24;
        }

        onMouseEnter() {
            this._hovered = true;
        }

        onMouseExit() {
            this._hovered = false;
        }

        onClick() {
            TouchInput.clear();

            if (
                typeof this._clickHandler !==
                "function"
            ) {
                return;
            }

            SoundManager.playCursor();

            this._clickHandler(
                this._tabId
            );
        }
    }

    class Sprite_StoryEpisodeButton
        extends Sprite_StoryImageButton {

        constructor(
            routeId,
            episodeIndex,
            episode,
            onClick
        ) {
            const episodeNumber =
                String(episodeIndex + 1)
                    .padStart(2, "0");

            super(
                `ui_episode_${routeId}_${episodeNumber}`,
                () => {
                    if (
                        typeof onClick ===
                        "function"
                    ) {
                        onClick(
                            episodeIndex,
                            episode
                        );
                    }
                },
                "cursor"
            );

            this._episode = episode;
            this._episodeIndex = episodeIndex;
        }
    }

    function stripEpisodeNumberFromTitle(
        title
    ) {
        const source =
            String(title || "");

        const stripped = source.replace(
            /^\s*第\s*[0-9０-９]+\s*話\s*[：:・\-–—]?\s*/u,
            ""
        );

        return stripped.trim() || source.trim();
    }

    function drawFittedText(
        bitmap,
        text,
        width,
        height,
        startSize,
        minSize,
        align = "left"
    ) {
        if (!bitmap) {
            return;
        }

        bitmap.fontSize = startSize;

        while (
            bitmap.fontSize > minSize &&
            bitmap.measureTextWidth(text) > width
        ) {
            bitmap.fontSize--;
        }

        bitmap.drawText(
            text,
            0,
            0,
            width,
            height,
            align
        );
    }

    /*
     * ─────────────────────────────
     * Storyデバッグ開始位置の解決
     * ─────────────────────────────
     *
     * pages内の debugStart: true を探し、
     * そのページより前をデバッグ時だけ省略する。
     *
     * Story専用の実憑依横取り
     * storyPossessionSteal は永続状態なので、
     * マーカーより前に発生していれば
     * 開始時憑依者へ引き継ぐ。
     *
     * pageParticipantsも、マーカー直前の
     * 最後の構成を初期participantsとして引き継ぐ。
     */
    function makeStoryDebugEpisode(
        episode
    ) {
        if (
            !STORY_DEBUG_START_ENABLED ||
            !episode ||
            !Array.isArray(episode.pages) ||
            episode.pages.length === 0
        ) {
            return episode;
        }

        const debugIndices = [];

        episode.pages.forEach(
            (page, index) => {
                if (
                    page &&
                    page.debugStart === true
                ) {
                    debugIndices.push(index);
                }
            }
        );

        if (debugIndices.length === 0) {
            return episode;
        }

        if (debugIndices.length > 1) {
            console.warn(
                `[${pluginName}] debugStart指定が複数あります。最初の1件を使用します。`,
                debugIndices
            );
        }

        const startIndex =
            debugIndices[0];

        /*
         * 冒頭なら切り詰める必要なし。
         */
        if (startIndex <= 0) {
            console.info(
                `[${pluginName}] Story debugStart: 1ページ目から開始`,
                episode.id || episode.title || ""
            );

            return episode;
        }

        /*
         * 元の開始時憑依者を基準に、
         * マーカー以前の実横取りだけ反映する。
         */
        let debugPossessedBy =
            String(
                episode.startPossessedBy ||
                ""
            );

        let debugParticipants =
            Array.isArray(episode.participants)
                ? episode.participants
                : null;

        /*
         * デバッグ開始位置より前で最後にいた背景も
         * 開始時背景として復元する。
         */
        let debugBackground =
            String(
                episode.startBackground ||
                ""
            );

        for (
            let index = 0;
            index < startIndex;
            index++
        ) {
            const page =
                episode.pages[index] || {};

            if (page.storyPossessionSteal) {
                debugPossessedBy =
                    String(
                        page.storyPossessionSteal ||
                        ""
                    );
            }

            if (
                Array.isArray(
                    page.pageParticipants
                )
            ) {
                debugParticipants =
                    page.pageParticipants;
            }

            if (page.storyBackground) {
                debugBackground =
                    String(
                        page.storyBackground ||
                        ""
                    );
            }
            else if (
                page.storyBackgroundClear ===
                true
            ) {
                debugBackground = "";
            }
        }

        const debugEpisode = {
            ...episode,
            pages:
                episode.pages.slice(
                    startIndex
                )
        };

        if (debugPossessedBy) {
            debugEpisode.startPossessedBy =
                debugPossessedBy;
        } else {
            delete debugEpisode
                .startPossessedBy;
        }

        if (debugParticipants) {
            debugEpisode.participants =
                debugParticipants;
        }

        if (debugBackground) {
            debugEpisode.startBackground =
                debugBackground;
        }
        else {
            delete debugEpisode
                .startBackground;
        }

        console.info(
            `[${pluginName}] Story debugStart: ${
                startIndex + 1
            }ページ目から開始`,
            episode.id || episode.title || ""
        );

        return debugEpisode;
    }

    /*
     * ─────────────────────────────
     * ストーリー画面本体
     * ─────────────────────────────
     */
    class Sprite_DenOStoryScreen
        extends Sprite {

        constructor() {
            super();

            this._currentRoute = null;
            this._contentSprites = [];

            this._episodeWasBusy = false;

            /*
             * ルートカード自身のクリック処理中に
             * そのカードを即destroyすると、
             * Sprite_Clickable / PIXI側が同フレーム内で
             * 破棄済みtransformへ触れることがある。
             *
             * 選択したルートは一旦ここへ預け、
             * 子Spriteのupdateが全部終わったあとに
             * 話数一覧へ切り替える。
             */
            this._pendingRouteSelection = null;
            this._pendingOpenGallery = false;
            this._pendingGalleryDebugUnlockAll = false;
            this._pendingReturnToRouteList = false;
            this._pendingCloseStory = false;

            /*
             * 話数選択画面で現在選んでいる駅。
             * 同じルートへ戻ってきた場合はその話数を維持する。
             */
            this._selectedEpisodeRouteId = "";
            this._selectedEpisodeIndex = 0;
            this._episodeSelectedOverlay = null;
            this._episodeNumberSprite = null;
            this._episodeTitleSprite = null;

            /*
             * ギャラリー絞り込み。
             * 画面を開いた時はALLから開始する。
             */
            this._galleryFilter = "all";

            /*
             * Shiftを押しながらGALLERYを開いた時だけtrue。
             * 保存データは変更しない一時的なデバッグ表示。
             */
            this._galleryDebugUnlockAll = false;

            this._galleryTabButtons = [];
            this._galleryThumbnailContainer = null;
            this._galleryClipMask = null;
            this._galleryFrameOverlay = null;

            this._galleryScrollY = 0;
            this._galleryScrollTargetY = 0;
            this._galleryMaxScroll = 0;
            this._galleryContentHeight = 0;
            this._galleryScrollTrack = null;
            this._galleryScrollThumb = null;

            /*
             * PC用スクロールバー操作。
             * つまみドラッグ＋レールクリックに使用。
             */
            this._galleryScrollbarDragging = false;
            this._galleryScrollbarDragOffsetY = 0;

            /*
             * スマホ用スワイプ状態。
             */
            this._galleryTouchActive = false;
            this._galleryTouchDragging = false;
            this._galleryTouchStartY = 0;
            this._galleryTouchLastY = 0;
            this._galleryTouchSuppressClickFrames = 0;

            /*
             * ギャラリーの戻るボタン。
             * サムネより上に見えていても、
             * 下側サムネのSprite_Clickableが先に入力を拾う場合があるため
             * サムネ側の当たり判定除外にも使う。
             */
            this._galleryBackButton = null;
            this._galleryResetButton = null;

            /*
             * ギャラリー全画面スチル閲覧。
             */
            this._galleryViewer = null;
            this._pendingGalleryViewerEntry = null;

            this.createBackground();
            this.showRouteList();
        }

        createBackground() {
            /*
             * まず完全不透明の単色を敷く。
             * 背景画像の読み込み前や話数選択画面では
             * これが安全な下地になる。
             */
            this._background =
                new Sprite(
                    new Bitmap(
                        SCREEN_WIDTH,
                        SCREEN_HEIGHT
                    )
                );

            this._background.bitmap
                .fillRect(
                    0,
                    0,
                    SCREEN_WIDTH,
                    SCREEN_HEIGHT,
                    "#101016"
                );

            this.addChild(
                this._background
            );

            /*
             * ルート選択専用の背景画像。
             * 元画像サイズが1280×720でなくても
             * 縦横比を崩さず画面いっぱいに cover する。
             */
            this._routeSelectBackground =
                new Sprite();

            this._routeSelectBackground
                .anchor.set(0.5, 0.5);

            this._routeSelectBackground.x =
                SCREEN_WIDTH / 2;

            this._routeSelectBackground.y =
                SCREEN_HEIGHT / 2;

            this._routeSelectBackground.visible =
                false;

            this.addChild(
                this._routeSelectBackground
            );

            const bitmap =
                ImageManager.loadPicture(
                    ROUTE_SELECT_BACKGROUND
                );

            this._routeSelectBackground.bitmap =
                bitmap;

            const fit = () => {
                if (
                    !bitmap ||
                    bitmap.width <= 0 ||
                    bitmap.height <= 0
                ) {
                    return;
                }

                const scale =
                    Math.max(
                        SCREEN_WIDTH /
                            bitmap.width,
                        SCREEN_HEIGHT /
                            bitmap.height
                    );

                this._routeSelectBackground
                    .scale.set(
                        scale,
                        scale
                    );
            };

            if (bitmap.isReady()) {
                fit();
            }
            else {
                bitmap.addLoadListener(
                    fit
                );
            }

            /*
             * ルートごとの話数選択背景。
             * 実際の画像は showEpisodeList() で差し替える。
             */
            this._episodeSelectBackground =
                new Sprite();

            this._episodeSelectBackground
                .anchor.set(0.5, 0.5);

            this._episodeSelectBackground.x =
                SCREEN_WIDTH / 2;

            this._episodeSelectBackground.y =
                SCREEN_HEIGHT / 2;

            this._episodeSelectBackground.visible =
                false;

            this.addChild(
                this._episodeSelectBackground
            );

            /*
             * ギャラリー専用背景。
             * ルート選択と同じく1280×720前提だが、
             * サイズが違っても画面いっぱいにcoverする。
             */
            this._galleryBackground =
                new Sprite();

            this._galleryBackground
                .anchor.set(0.5, 0.5);

            this._galleryBackground.x =
                SCREEN_WIDTH / 2;

            this._galleryBackground.y =
                SCREEN_HEIGHT / 2;

            this._galleryBackground.visible =
                false;

            this.addChild(
                this._galleryBackground
            );

            const galleryBitmap =
                ImageManager.loadPicture(
                    GALLERY_BACKGROUND
                );

            this._galleryBackground.bitmap =
                galleryBitmap;

            const fitGalleryBackground = () => {
                if (
                    !galleryBitmap ||
                    galleryBitmap.width <= 0 ||
                    galleryBitmap.height <= 0
                ) {
                    return;
                }

                const scale =
                    Math.max(
                        SCREEN_WIDTH /
                            galleryBitmap.width,
                        SCREEN_HEIGHT /
                            galleryBitmap.height
                    );

                this._galleryBackground
                    .scale.set(
                        scale,
                        scale
                    );
            };

            if (galleryBitmap.isReady()) {
                fitGalleryBackground();
            }
            else {
                galleryBitmap.addLoadListener(
                    fitGalleryBackground
                );
            }
        }

        setRouteSelectBackgroundVisible(
            visible
        ) {
            if (this._routeSelectBackground) {
                this._routeSelectBackground.visible =
                    !!visible;
            }
        }

        setEpisodeSelectBackground(
            routeId
        ) {
            const background =
                this._episodeSelectBackground;

            if (!background) {
                return;
            }

            const pictureName =
                `bg_episode_select_${routeId}`;

            /*
             * 別ルートへ切り替える瞬間、
             * 新しいBitmapのデコードが終わるまで
             * Spriteが直前のテクスチャを保持する場合がある。
             *
             * 先に非表示へ落としてから新しいBitmapを渡し、
             * 読み込み完了後にだけ表示することで、
             * モモ→ウラ等で前ルートが一瞬残るのを防ぐ。
             */
            background.visible = false;

            const bitmap =
                ImageManager.loadPicture(
                    pictureName
                );

            background.bitmap = bitmap;

            const reveal = () => {
                if (
                    background.bitmap !== bitmap ||
                    !bitmap ||
                    bitmap.width <= 0 ||
                    bitmap.height <= 0
                ) {
                    return;
                }

                const scale =
                    Math.max(
                        SCREEN_WIDTH / bitmap.width,
                        SCREEN_HEIGHT / bitmap.height
                    );

                background.scale.set(
                    scale,
                    scale
                );

                /*
                 * このBitmapがまだ現在の背景なら表示。
                 * 途中で別ルートへ移動していた場合は出さない。
                 */
                if (
                    background.bitmap === bitmap
                ) {
                    background.visible = true;
                }
            };

            if (bitmap.isReady()) {
                reveal();
            }
            else {
                bitmap.addLoadListener(
                    reveal
                );
            }
        }

        setEpisodeSelectBackgroundVisible(
            visible
        ) {
            if (this._episodeSelectBackground) {
                this._episodeSelectBackground.visible =
                    !!visible;
            }
        }

        setGalleryBackgroundVisible(
            visible
        ) {
            if (this._galleryBackground) {
                this._galleryBackground.visible =
                    !!visible;
            }
        }

        clearContent() {
            cancelPendingGalleryThumbnailLoads();

            if (this._galleryViewer) {
                this.disposeGalleryViewerBitmaps(
                    this._galleryViewer
                );
            }

            for (
                const sprite of
                this._contentSprites
            ) {
                this.removeChild(sprite);

                if (sprite.destroy) {
                    sprite.destroy();
                }
            }

            this._contentSprites = [];

            /*
             * 画面切替で全コンテンツを消した場合、
             * ビューア状態も必ず破棄する。
             */
            this._galleryViewer = null;
            this._pendingGalleryViewerEntry =
                null;
        }

        addContent(sprite) {
            this.addChild(sprite);

            this._contentSprites
                .push(sprite);
        }

        removeContent(
            sprite,
            destroy = true
        ) {
            if (!sprite) {
                return;
            }

            const index =
                this._contentSprites
                    .indexOf(sprite);

            if (index >= 0) {
                this._contentSprites
                    .splice(
                        index,
                        1
                    );
            }

            if (sprite.parent === this) {
                this.removeChild(
                    sprite
                );
            }

            if (
                destroy &&
                sprite.destroy
            ) {
                sprite.destroy({
                    children: true
                });
            }
        }

        createTitle(text) {
            const sprite =
                new Sprite(
                    new Bitmap(
                        SCREEN_WIDTH,
                        80
                    )
                );

            sprite.x = 0;
            sprite.y = 26;

            sprite.bitmap.fontSize = 34;
            sprite.bitmap.textColor =
                "#ffffff";

            sprite.bitmap.outlineColor =
                "rgba(0, 0, 0, 0.95)";

            sprite.bitmap.outlineWidth = 5;

            sprite.bitmap.drawText(
                text,
                0,
                0,
                SCREEN_WIDTH,
                70,
                "center"
            );

            this.addContent(sprite);
        }

        showRouteList() {
            this.clearContent();
            this._currentRoute = null;

            this.setEpisodeSelectBackgroundVisible(
                false
            );

            this.setGalleryBackgroundVisible(
                false
            );

            this.setRouteSelectBackgroundVisible(
                true
            );

            const data =
                window.MamiDenOStoryData;

            if (
                !data ||
                !data.getRoutes
            ) {
                return;
            }

            const allRoutes =
                data.getRoutes();

            /*
             * おまけはStoryDataに残したまま、
             * 現在は4人の本編ルートだけを表示する。
             */
            const routes =
                MAIN_ROUTE_IDS
                    .map(
                        routeId =>
                            allRoutes.find(
                                route =>
                                    String(
                                        route.id || ""
                                    ) === routeId
                            )
                    )
                    .filter(Boolean);

            const totalWidth =
                routes.length *
                    PANEL_WIDTH +
                Math.max(
                    0,
                    routes.length - 1
                ) * ROUTE_CARD_GAP;

            const startX =
                Math.round(
                    (
                        SCREEN_WIDTH -
                        totalWidth
                    ) / 2
                );

            routes.forEach(
                (route, index) => {
                    const button =
                        new Sprite_StoryRouteButton(
                            route,
                            selectedRoute => {
                                /*
                                 * クリックされたカードを
                                 * onClickの最中に破棄しない。
                                 * update末尾で安全に切り替える。
                                 */
                                this._pendingRouteSelection =
                                    selectedRoute;
                            }
                        );

                    button.x =
                        startX +
                        index * (
                            PANEL_WIDTH +
                            ROUTE_CARD_GAP
                        );

                    button.y =
                        ROUTE_CARD_TOP;

                    this.addContent(button);
                }
            );

            /*
             * 通常画面へ戻る。
             * 話数選択画面と同じ画像・同じ座標を使用する。
             */
            const backButton =
                new Sprite_StoryImageButton(
                    "ui_episode_back",
                    () => {
                        /*
                         * クリック中に親画面を即destroyしないよう、
                         * update末尾で安全に閉じる。
                         */
                        this._pendingCloseStory = true;
                    },
                    "cancel"
                );

            backButton.x =
                EPISODE_BACK_POSITION[0];

            backButton.y =
                EPISODE_BACK_POSITION[1];

            this.addContent(backButton);

            /*
             * ギャラリーを開く。
             * 戻るボタンと左右対称の右下へ配置する。
             *
             * クリック中にこの画面の子Spriteを即destroyしないよう、
             * 実際の切り替えはupdate末尾で行う。
             */
            const galleryButton =
                new Sprite_StoryImageButton(
                    GALLERY_BUTTON_PICTURE,
                    () => {
                        /*
                         * 公開ブラウザ版でも残す隠しデバッグ。
                         *
                         * Shiftを押しながらGALLERYをクリック：
                         *   その回だけ全CG・全差分を表示
                         *
                         * 通常クリック：
                         *   保存済み解放状況どおり
                         *
                         * 一時表示なのでlocalStorageは変更しない。
                         */
                        this._pendingGalleryDebugUnlockAll =
                            Input.isPressed(
                                "shift"
                            );

                        this._pendingOpenGallery = true;
                    },
                    "ok"
                );

            galleryButton.x =
                GALLERY_BUTTON_POSITION[0];

            galleryButton.y =
                GALLERY_BUTTON_POSITION[1];

            this.addContent(
                galleryButton
            );
        }

        showGallery(
            debugUnlockAll = false
        ) {
            this.clearContent();
            this._currentRoute = null;

            this._galleryDebugUnlockAll =
                !!debugUnlockAll;

            this.setRouteSelectBackgroundVisible(
                false
            );

            this.setEpisodeSelectBackgroundVisible(
                false
            );

            this.setGalleryBackgroundVisible(
                true
            );

            this._galleryFilter = "all";
            this._galleryTabButtons = [];
            this._galleryThumbnailContainer = null;
            this._galleryClipMask = null;
            this._galleryFrameOverlay = null;

            this._galleryScrollY = 0;
            this._galleryScrollTargetY = 0;
            this._galleryMaxScroll = 0;
            this._galleryContentHeight = 0;
            this._galleryScrollTrack = null;
            this._galleryScrollThumb = null;

            this._galleryScrollbarDragging = false;
            this._galleryScrollbarDragOffsetY = 0;

            this._galleryTouchActive = false;
            this._galleryTouchDragging = false;
            this._galleryTouchStartY = 0;
            this._galleryTouchLastY = 0;
            this._galleryTouchSuppressClickFrames = 0;

            this._galleryBackButton = null;
            this._galleryResetButton = null;

            this._galleryViewer = null;
            this._pendingGalleryViewerEntry = null;

            /*
             * レイヤー順：
             *
             * bg_gallery
             *   ↓
             * サムネイル
             *   ↓
             * gallery_frame_overlay
             *   ↓
             * タブ / 戻る
             *
             * 内側フレームの角が
             * サムネへ自然にかぶる。
             */
            this.createGalleryThumbnailLayer();

            this.createGalleryFrameOverlay();

            /*
             * フレームより上へスクロールバーを置く。
             * サムネだけがフレームの下を通る。
             */
            this.createGalleryScrollbar();

            this.createGalleryTabs();

            const backButton =
                new Sprite_StoryImageButton(
                    "ui_episode_back",
                    () => {
                        this._pendingReturnToRouteList = true;
                    },
                    "cancel"
                );

            backButton.x =
                EPISODE_BACK_POSITION[0];

            backButton.y =
                EPISODE_BACK_POSITION[1];

            this._galleryBackButton =
                backButton;

            this.addContent(
                backButton
            );

            /*
             * 進行状況リセット。
             * 「はい / いいえ」はストーリー中断確認と共通。
             */
            const resetButton =
                new Sprite_StoryImageButton(
                    GALLERY_RESET_BUTTON_PICTURE,
                    () => {
                        this.openGalleryProgressResetConfirm();
                    },
                    "ok",
                    GALLERY_RESET_BUTTON_SIZE,
                    GALLERY_RESET_BUTTON_SIZE,
                    210
                );

            resetButton.x =
                GALLERY_RESET_BUTTON_POSITION[0];

            resetButton.y =
                GALLERY_RESET_BUTTON_POSITION[1];

            this._galleryResetButton =
                resetButton;

            this.addContent(
                resetButton
            );
        }

        openGalleryProgressResetConfirm() {
            if (
                this._galleryViewer ||
                storyConfirmOpen
            ) {
                return;
            }

            openStoryConfirm(
                "進行状況をリセットしますか？\nこの操作は取り消せません。",
                () => {
                    let succeeded = false;

                    if (
                        window.MamiDenOProgress &&
                        typeof window.MamiDenOProgress
                            .reset ===
                            "function"
                    ) {
                        succeeded =
                            window.MamiDenOProgress
                                .reset() !==
                            false;
                    }

                    if (!succeeded) {
                        SoundManager.playBuzzer();
                        closeStoryConfirm();
                        return;
                    }

                    /*
                     * Shift+GALLERYの一時全開放中でも、
                     * リセット後は通常表示へ戻して
                     * 実際にLOCK状態になったことを確認できるようにする。
                     */
                    this._galleryDebugUnlockAll =
                        false;

                    this._galleryScrollY = 0;
                    this._galleryScrollTargetY = 0;

                    this.refreshGalleryThumbnails();

                    closeStoryConfirm();
                },
                () => {
                    closeStoryConfirm();
                }
            );
        }

        createGalleryThumbnailLayer() {
            const container =
                new Sprite(
                    new Bitmap(
                        SCREEN_WIDTH,
                        SCREEN_HEIGHT
                    )
                );

            container.bitmap.fillRect(
                0,
                0,
                SCREEN_WIDTH,
                SCREEN_HEIGHT,
                "#000000"
            );

            container.x =
                GALLERY_VIEW_X;

            container.y =
                GALLERY_VIEW_Y;

            this._galleryThumbnailContainer =
                container;

            this.addContent(
                container
            );

            /*
             * 今はまだスクロールさせないが、
             * 次段階でそのまま使えるよう
             * 先にクリッピング領域を作っておく。
             */
            const mask =
                new PIXI.Graphics();

            mask.beginFill(
                0xffffff
            );

            mask.drawRect(
                GALLERY_VIEW_X,
                GALLERY_VIEW_Y,
                GALLERY_VIEW_WIDTH,
                GALLERY_VIEW_HEIGHT
            );

            mask.endFill();

            this._galleryClipMask =
                mask;

            container.mask =
                mask;

            this.addContent(
                mask
            );

            this.refreshGalleryThumbnails();
        }

        clearGalleryThumbnailCards() {
            const container =
                this._galleryThumbnailContainer;

            cancelPendingGalleryThumbnailLoads();

            if (!container) {
                return;
            }

            const children =
                container.removeChildren();

            for (
                const child of
                children
            ) {
                if (
                    child &&
                    child.destroy
                ) {
                    child.destroy({
                        children: true
                    });
                }
            }
        }

        getFilteredGalleryEntries() {
            const catalog =
                makeGalleryCatalog();

            if (
                this._galleryFilter ===
                "all"
            ) {
                return catalog.slice();
            }

            return catalog.filter(
                entry =>
                    entry.character ===
                    this._galleryFilter
            );
        }

        refreshGalleryThumbnails() {
            const container =
                this._galleryThumbnailContainer;

            if (!container) {
                return;
            }

            this.clearGalleryThumbnailCards();

            const entries =
                this.getFilteredGalleryEntries();

            const rowCount =
                entries.length > 0
                    ? Math.ceil(
                        entries.length /
                        GALLERY_GRID_COLUMNS
                    )
                    : 0;

            const gridWidth =
                GALLERY_GRID_COLUMNS *
                    GALLERY_CARD_WIDTH +
                (
                    GALLERY_GRID_COLUMNS -
                    1
                ) *
                    GALLERY_CARD_GAP_X;

            const gridHeight =
                rowCount > 0
                    ? rowCount *
                        GALLERY_CARD_HEIGHT +
                        (
                            rowCount - 1
                        ) *
                            GALLERY_CARD_GAP_Y
                    : 0;

            const startX =
                Math.round(
                    (
                        GALLERY_VIEW_WIDTH -
                        gridWidth
                    ) / 2
                );

            /*
             * 行数が増えても1行目は固定。
             * ALLだけ下へ伸びていく。
             */
            const startY =
                GALLERY_GRID_PADDING_Y;

            entries.forEach(
                (
                    entry,
                    index
                ) => {
                    const column =
                        index %
                        GALLERY_GRID_COLUMNS;

                    const row =
                        Math.floor(
                            index /
                            GALLERY_GRID_COLUMNS
                        );

                    const unlocked =
                        isGalleryEntryUnlocked(
                            entry,
                            this._galleryDebugUnlockAll
                        );

                    const card =
                        new Sprite_GalleryThumbnailCard(
                            entry,
                            unlocked,
                            selectedEntry => {
                                if (
                                    !unlocked ||
                                    this._galleryViewer
                                ) {
                                    return;
                                }

                                /*
                                 * 子Spriteのクリック処理中には
                                 * まだビューアを生成しない。
                                 */
                                this._pendingGalleryViewerEntry =
                                    selectedEntry;
                            },
                            () =>
                                this.isPointerInsideGalleryThumbnailClickArea()
                        );

                    card.x =
                        startX +
                        column * (
                            GALLERY_CARD_WIDTH +
                            GALLERY_CARD_GAP_X
                        );

                    card.y =
                        startY +
                        row * (
                            GALLERY_CARD_HEIGHT +
                            GALLERY_CARD_GAP_Y
                        );

                    container.addChild(
                        card
                    );
                }
            );

            /*
             * 上下に同じ余白を持たせた高さ。
             */
            this._galleryContentHeight =
                rowCount > 0
                    ? GALLERY_GRID_PADDING_Y +
                        gridHeight +
                        GALLERY_GRID_PADDING_Y
                    : GALLERY_VIEW_HEIGHT;

            this._galleryMaxScroll =
                Math.max(
                    0,
                    this._galleryContentHeight -
                        GALLERY_VIEW_HEIGHT
                );

            this._galleryScrollTargetY =
                Math.min(
                    this._galleryScrollTargetY,
                    this._galleryMaxScroll
                );

            this._galleryScrollY =
                Math.min(
                    this._galleryScrollY,
                    this._galleryMaxScroll
                );

            this.applyGalleryScrollPosition();
            this.updateGalleryScrollbar();
        }

        applyGalleryScrollPosition() {
            const container =
                this._galleryThumbnailContainer;

            if (!container) {
                return;
            }

            container.x =
                GALLERY_VIEW_X;

            /*
             * 縮小画像を小数px位置へ置くと、
             * スクロール中にサンプリング位置が毎フレーム変わり
             * 細線がチリつくことがある。
             *
             * 内部スクロール値は小数のまま滑らかに計算し、
             * 実際の描画位置だけ1px単位へ丸める。
             */
            container.y =
                Math.round(
                    GALLERY_VIEW_Y -
                    this._galleryScrollY
                );
        }

        isPointerInsideGalleryView() {
            const x =
                Number(TouchInput.x || 0);

            const y =
                Number(TouchInput.y || 0);

            return (
                x >= GALLERY_VIEW_X &&
                x <=
                    GALLERY_VIEW_X +
                    GALLERY_VIEW_WIDTH &&
                y >= GALLERY_VIEW_Y &&
                y <=
                    GALLERY_VIEW_Y +
                    GALLERY_VIEW_HEIGHT
            );
        }

        /*
         * 見た目の描画領域と、
         * サムネをクリックしてよい領域は分ける。
         *
         * 下側はフレーム裏まで描画する一方、
         * 戻るボタンの上ではサムネを絶対に反応させない。
         */
        isPointerInsideGalleryThumbnailClickArea() {
            /*
             * スワイプと判定した指操作では、
             * 指を離した瞬間にサムネを開かない。
             */
            if (
                this._galleryScrollbarDragging ||
                this._galleryTouchDragging ||
                this._galleryTouchSuppressClickFrames > 0 ||
                this.isPointerInsideGalleryScrollbarArea()
            ) {
                return false;
            }

            if (
                !this.isPointerInsideGalleryView()
            ) {
                return false;
            }

            const protectedButtons = [
                this._galleryBackButton,
                this._galleryResetButton
            ];

            for (
                const button of
                protectedButtons
            ) {
                if (
                    button &&
                    button.visible &&
                    typeof button.isBeingTouched ===
                        "function" &&
                    button.isBeingTouched()
                ) {
                    return false;
                }
            }

            return true;
        }

        isPointerInsideGalleryScrollbarArea() {
            if (
                !this._galleryScrollTrack ||
                !this._galleryScrollTrack.visible ||
                this._galleryMaxScroll <= 0
            ) {
                return false;
            }

            const x =
                Number(
                    TouchInput.x || 0
                );

            const y =
                Number(
                    TouchInput.y || 0
                );

            return (
                x >=
                    GALLERY_SCROLL_TRACK_X &&
                x <=
                    GALLERY_SCROLL_TRACK_X +
                    GALLERY_SCROLL_TRACK_WIDTH &&
                y >=
                    GALLERY_SCROLL_TRACK_Y &&
                y <=
                    GALLERY_SCROLL_TRACK_Y +
                    GALLERY_SCROLL_TRACK_HEIGHT
            );
        }

        isPointerInsideGalleryScrollThumb() {
            const thumb =
                this._galleryScrollThumb;

            if (
                !thumb ||
                !thumb.visible ||
                this._galleryMaxScroll <= 0
            ) {
                return false;
            }

            const x =
                Number(
                    TouchInput.x || 0
                );

            const y =
                Number(
                    TouchInput.y || 0
                );

            return (
                x >= thumb.x &&
                x <=
                    thumb.x +
                    GALLERY_SCROLL_THUMB_WIDTH &&
                y >= thumb.y &&
                y <=
                    thumb.y +
                    GALLERY_SCROLL_THUMB_HEIGHT
            );
        }

        setGalleryScrollFromThumbTop(
            thumbTop
        ) {
            const movableHeight =
                Math.max(
                    0,
                    GALLERY_SCROLL_TRACK_HEIGHT -
                        GALLERY_SCROLL_THUMB_HEIGHT
                );

            if (
                movableHeight <= 0 ||
                this._galleryMaxScroll <= 0
            ) {
                return;
            }

            const clampedThumbTop =
                Math.max(
                    GALLERY_SCROLL_TRACK_Y,
                    Math.min(
                        GALLERY_SCROLL_TRACK_Y +
                            movableHeight,
                        Number(thumbTop) ||
                            GALLERY_SCROLL_TRACK_Y
                    )
                );

            const rate =
                (
                    clampedThumbTop -
                    GALLERY_SCROLL_TRACK_Y
                ) /
                movableHeight;

            this._galleryScrollY =
                this.clampGalleryScrollY(
                    this._galleryMaxScroll *
                        rate
                );

            /*
             * ドラッグ中は指/マウスへ直接追従。
             * 離した後にイージングでズレないよう
             * targetも同じ値へ揃える。
             */
            this._galleryScrollTargetY =
                this._galleryScrollY;

            this.applyGalleryScrollPosition();
            this.updateGalleryScrollbar();
        }

        updateGalleryScrollbarInputBeforeChildren() {
            if (
                storyConfirmOpen ||
                this._galleryViewer ||
                !this._galleryBackground ||
                !this._galleryBackground.visible ||
                this._galleryMaxScroll <= 0
            ) {
                this._galleryScrollbarDragging =
                    false;

                return false;
            }

            /*
             * つまみを押した場合：
             * つまみ内の掴んだ位置を維持したままドラッグ。
             *
             * レール部分を押した場合：
             * その位置へつまみ中央を移動して、
             * そのままドラッグ開始できる。
             */
            if (
                TouchInput.isTriggered() &&
                this.isPointerInsideGalleryScrollbarArea()
            ) {
                const pointerY =
                    Number(
                        TouchInput.y || 0
                    );

                if (
                    this.isPointerInsideGalleryScrollThumb()
                ) {
                    this._galleryScrollbarDragOffsetY =
                        pointerY -
                        this._galleryScrollThumb.y;
                }
                else {
                    this._galleryScrollbarDragOffsetY =
                        GALLERY_SCROLL_THUMB_HEIGHT /
                        2;

                    this.setGalleryScrollFromThumbTop(
                        pointerY -
                        this._galleryScrollbarDragOffsetY
                    );
                }

                this._galleryScrollbarDragging =
                    true;

                /*
                 * 右端の数pxはサムネ描画領域と重なるので、
                 * 背後カードの押下状態を必ず解除する。
                 */
                this.cancelGalleryThumbnailPresses();

                /*
                 * スクロールバー操作を始めたフレームは
                 * スワイプ開始として扱わない。
                 */
                this.resetGalleryTouchScrollState();
            }

            if (
                !this._galleryScrollbarDragging
            ) {
                return false;
            }

            if (TouchInput.isPressed()) {
                const pointerY =
                    Number(
                        TouchInput.y || 0
                    );

                this.setGalleryScrollFromThumbTop(
                    pointerY -
                    this._galleryScrollbarDragOffsetY
                );

                return true;
            }

            /*
             * マウス/指を離してドラッグ終了。
             * releaseを背後サムネのクリックにしない。
             */
            this._galleryScrollbarDragging =
                false;

            this._galleryTouchSuppressClickFrames =
                Math.max(
                    this._galleryTouchSuppressClickFrames,
                    2
                );

            this.cancelGalleryThumbnailPresses();

            return true;
        }

        clampGalleryScrollY(
            value
        ) {
            return Math.max(
                0,
                Math.min(
                    this._galleryMaxScroll,
                    Number(value) || 0
                )
            );
        }

        cancelGalleryThumbnailPresses() {
            const container =
                this._galleryThumbnailContainer;

            if (!container) {
                return;
            }

            /*
             * Sprite_Clickableはタッチ開始時に
             * _pressed=trueを持つ。
             *
             * そのままスワイプ後に指を離すと
             * onClickへ流れる可能性があるので、
             * ドラッグ判定になった瞬間に全カードの
             * 押下状態をキャンセルする。
             */
            for (
                const child of
                container.children
            ) {
                if (
                    child &&
                    child instanceof
                        Sprite_GalleryThumbnailCard
                ) {
                    child._pressed = false;
                }
            }
        }

        resetGalleryTouchScrollState() {
            this._galleryTouchActive = false;
            this._galleryTouchDragging = false;
            this._galleryTouchStartY = 0;
            this._galleryTouchLastY = 0;
        }

        updateGalleryTouchScrollBeforeChildren() {
            /*
             * 子Spriteのクリック処理より先に呼ぶ。
             *
             * これで、
             *   サムネ上で指を置く
             *   ↓
             *   そのまま上下へスワイプ
             *   ↓
             *   指を離す
             *
             * としてもサムネクリックにならない。
             */
            if (
                this._galleryScrollbarDragging ||
                storyConfirmOpen ||
                this._galleryViewer ||
                !this._galleryThumbnailContainer ||
                !this._galleryBackground ||
                !this._galleryBackground.visible ||
                this._galleryMaxScroll <= 0
            ) {
                this.resetGalleryTouchScrollState();
                return;
            }

            /*
             * スワイプ開始。
             * サムネの上からでも開始できる。
             */
            if (
                TouchInput.isTriggered() &&
                this.isPointerInsideGalleryView() &&
                !this.isPointerInsideGalleryScrollbarArea()
            ) {
                this._galleryTouchActive = true;
                this._galleryTouchDragging = false;

                this._galleryTouchStartY =
                    Number(
                        TouchInput.y || 0
                    );

                this._galleryTouchLastY =
                    this._galleryTouchStartY;
            }

            if (
                !this._galleryTouchActive
            ) {
                return;
            }

            const currentY =
                Number(
                    TouchInput.y || 0
                );

            /*
             * 指を置いたまま移動。
             */
            if (TouchInput.isPressed()) {
                const totalMove =
                    currentY -
                    this._galleryTouchStartY;

                if (
                    !this._galleryTouchDragging &&
                    Math.abs(totalMove) >=
                        GALLERY_TOUCH_DRAG_THRESHOLD
                ) {
                    this._galleryTouchDragging =
                        true;

                    /*
                     * ここから先は「タップ」ではなく
                     * 「スクロール」。
                     */
                    this.cancelGalleryThumbnailPresses();
                }

                if (
                    this._galleryTouchDragging
                ) {
                    const deltaY =
                        currentY -
                        this._galleryTouchLastY;

                    /*
                     * 指を上へ動かす：
                     *   deltaY < 0
                     *   → scrollYを増やす
                     *   → 下のCGが見える
                     *
                     * 指に一覧が付いてくる感覚にするため、
                     * タッチ中はイージングを挟まず直接追従。
                     */
                    this._galleryScrollY =
                        this.clampGalleryScrollY(
                            this._galleryScrollY -
                            deltaY
                        );

                    this._galleryScrollTargetY =
                        this._galleryScrollY;

                    this.applyGalleryScrollPosition();
                    this.updateGalleryScrollbar();
                }

                this._galleryTouchLastY =
                    currentY;

                return;
            }

            /*
             * 指を離した。
             */
            if (
                this._galleryTouchDragging
            ) {
                /*
                 * releaseフレーム＋次フレームだけ
                 * サムネクリックを禁止して、
                 * スワイプ終了をタップとして拾わせない。
                 */
                this._galleryTouchSuppressClickFrames =
                    2;

                this.cancelGalleryThumbnailPresses();
            }

            this.resetGalleryTouchScrollState();
        }

        updateGalleryTouchScrollAfterChildren() {
            if (
                this._galleryTouchSuppressClickFrames >
                0
            ) {
                this._galleryTouchSuppressClickFrames--;
            }
        }

        updateGalleryScroll() {
            if (
                storyConfirmOpen ||
                this._galleryViewer ||
                !this._galleryThumbnailContainer ||
                !this._galleryBackground ||
                !this._galleryBackground.visible
            ) {
                return;
            }

            if (
                this._galleryMaxScroll > 0 &&
                this.isPointerInsideGalleryView()
            ) {
                const wheelY =
                    Number(
                        TouchInput.wheelY || 0
                    );

                if (wheelY !== 0) {
                    this._galleryScrollTargetY +=
                        wheelY *
                        GALLERY_SCROLL_SPEED;

                    this._galleryScrollTargetY =
                        Math.max(
                            0,
                            Math.min(
                                this._galleryMaxScroll,
                                this._galleryScrollTargetY
                            )
                        );
                }
            }

            const difference =
                this._galleryScrollTargetY -
                this._galleryScrollY;

            if (
                Math.abs(difference) <
                0.1
            ) {
                this._galleryScrollY =
                    this._galleryScrollTargetY;
            }
            else {
                this._galleryScrollY +=
                    difference *
                    GALLERY_SCROLL_EASING;
            }

            this.applyGalleryScrollPosition();
            this.updateGalleryScrollbar();
        }

        createGalleryScrollbar() {
            const track =
                new Sprite(
                    ImageManager.loadPicture(
                        GALLERY_SCROLL_TRACK_PICTURE
                    )
                );

            track.x =
                GALLERY_SCROLL_TRACK_X;

            track.y =
                GALLERY_SCROLL_TRACK_Y;

            fitGalleryFrameSprite(
                track,
                GALLERY_SCROLL_TRACK_WIDTH,
                GALLERY_SCROLL_TRACK_HEIGHT
            );

            this._galleryScrollTrack =
                track;

            this.addContent(
                track
            );

            const thumb =
                new Sprite(
                    ImageManager.loadPicture(
                        GALLERY_SCROLL_THUMB_PICTURE
                    )
                );

            thumb.x =
                GALLERY_SCROLL_TRACK_X;

            thumb.y =
                GALLERY_SCROLL_TRACK_Y;

            fitGalleryFrameSprite(
                thumb,
                GALLERY_SCROLL_THUMB_WIDTH,
                GALLERY_SCROLL_THUMB_HEIGHT
            );

            this._galleryScrollThumb =
                thumb;

            this.addContent(
                thumb
            );

            this.updateGalleryScrollbar();
        }

        updateGalleryScrollbar() {
            const track =
                this._galleryScrollTrack;

            const thumb =
                this._galleryScrollThumb;

            if (
                !track ||
                !thumb
            ) {
                return;
            }

            const scrollable =
                this._galleryMaxScroll > 0;

            track.visible =
                scrollable;

            thumb.visible =
                scrollable;

            if (!scrollable) {
                return;
            }

            const movableHeight =
                Math.max(
                    0,
                    GALLERY_SCROLL_TRACK_HEIGHT -
                        GALLERY_SCROLL_THUMB_HEIGHT
                );

            const rate =
                this._galleryMaxScroll > 0
                    ? this._galleryScrollY /
                        this._galleryMaxScroll
                    : 0;

            thumb.x =
                GALLERY_SCROLL_TRACK_X;

            thumb.y =
                GALLERY_SCROLL_TRACK_Y +
                movableHeight *
                    Math.max(
                        0,
                        Math.min(
                            1,
                            rate
                        )
                    );
        }

        openGalleryStillViewer(
            entry
        ) {
            if (
                this._galleryViewer ||
                !entry
            ) {
                return false;
            }

            const variants =
                getUnlockedGalleryVariants(
                    entry,
                    this._galleryDebugUnlockAll
                );

            if (variants.length <= 0) {
                return false;
            }

            const container =
                new Sprite();

            /*
             * 表示用Spriteは現在画像と次画像の2枚だけ。
             * 全差分の先読み中だけLOADING...を表示する。
             */
            const current =
                new Sprite();

            const next =
                new Sprite();

            current.visible = false;
            current.opacity = 0;

            next.visible = false;
            next.opacity = 0;

            const loadingLabel =
                new Sprite(
                    new Bitmap(
                        SCREEN_WIDTH,
                        60
                    )
                );

            loadingLabel.y =
                Math.round(
                    SCREEN_HEIGHT / 2 - 30
                );

            loadingLabel.bitmap.fontSize = 24;
            loadingLabel.bitmap.textColor =
                "#ffffff";
            loadingLabel.bitmap.outlineColor =
                "rgba(0, 0, 0, 0.95)";
            loadingLabel.bitmap.outlineWidth = 4;

            loadingLabel.bitmap.drawText(
                "LOADING...",
                0,
                0,
                SCREEN_WIDTH,
                60,
                "center"
            );

            /*
             * 一瞬で読み終わる場合は文字を見せない。
             * 待ち時間が約0.3秒を超えた時だけ表示する。
             */
            loadingLabel.visible = false;

            container.addChild(
                current
            );

            container.addChild(
                next
            );

            container.addChild(
                loadingLabel
            );

            /*
             * addContentは末尾へaddChildするので、
             * ギャラリーUIすべての上へ表示される。
             */
            this.addContent(
                container
            );

            /*
             * サムネを押した時点で、解放済み差分を全部読む。
             * ImageManagerの恒久キャッシュには入れず、
             * ビューアを閉じるまでだけ保持する。
             */
            const bitmaps =
                variants.map(
                    filename =>
                        loadTransientGalleryPicture(
                            filename
                        )
                );

            for (const bitmap of bitmaps) {
                bitmap.smooth = true;
            }

            this._galleryViewer = {
                container: container,
                current: current,
                next: next,
                loadingLabel: loadingLabel,
                variants: variants,
                bitmaps: bitmaps,
                index: 0,

                phase: "waitAll",
                frame: 0,
                loadingWaitFrames: 0,

                bitmap: bitmaps[0]
            };

            /*
             * サムネクリックの残り入力を
             * ビューアへ持ち越さない。
             */
            TouchInput.clear();
            Input.clear();

            return true;
        }

        beginGalleryViewerNextVariant() {
            const state =
                this._galleryViewer;

            if (
                !state ||
                state.phase !== "idle"
            ) {
                return false;
            }

            const nextIndex =
                state.index + 1;

            if (
                nextIndex >=
                state.variants.length
            ) {
                return false;
            }

            const bitmap =
                state.bitmaps[
                    nextIndex
                ];

            state.next.bitmap =
                bitmap;

            state.next.visible =
                false;

            state.next.opacity = 0;

            state.bitmap =
                bitmap;

            state.phase =
                "waitCrossfade";

            state.frame = 0;

            return true;
        }

        beginGalleryViewerClose() {
            const state =
                this._galleryViewer;

            if (
                !state ||
                state.phase !== "idle"
            ) {
                return false;
            }

            state.phase =
                "fadeOut";

            state.frame = 0;

            return true;
        }

        advanceGalleryStillViewer() {
            const state =
                this._galleryViewer;

            if (
                !state ||
                state.phase !== "idle"
            ) {
                return;
            }

            if (
                state.index + 1 <
                state.variants.length
            ) {
                this.beginGalleryViewerNextVariant();
            }
            else {
                this.beginGalleryViewerClose();
            }
        }

        finishGalleryStillViewerClose() {
            const state =
                this._galleryViewer;

            if (!state) {
                return;
            }

            const container =
                state.container;

            this.disposeGalleryViewerBitmaps(
                state
            );

            this._galleryViewer =
                null;

            this.removeContent(
                container,
                true
            );

            TouchInput.clear();
            Input.clear();
        }

        disposeGalleryViewerBitmaps(
            state
        ) {
            if (!state) {
                return;
            }

            const bitmaps =
                new Set([
                    state.bitmap,
                    ...(
                        Array.isArray(
                            state.bitmaps
                        )
                            ? state.bitmaps
                            : []
                    ),
                    state.current &&
                        state.current.bitmap,
                    state.next &&
                        state.next.bitmap
                ]);

            if (state.current) {
                state.current.bitmap = null;
            }

            if (state.next) {
                state.next.bitmap = null;
            }

            state.bitmap = null;
            state.bitmaps = [];

            for (const bitmap of bitmaps) {
                destroyTransientGalleryBitmap(
                    bitmap
                );
            }
        }

        updateGalleryStillViewer() {
            const state =
                this._galleryViewer;

            if (!state) {
                return;
            }

            /*
             * ─────────────────────────────
             * 全差分の読み込み完了 → 1枚目を軽くフェードイン
             * ─────────────────────────────
             */
            if (
                state.phase ===
                "waitAll"
            ) {
                if (
                    !state.bitmap ||
                    !Array.isArray(
                        state.bitmaps
                    ) ||
                    !state.bitmaps.every(
                        bitmap =>
                            bitmap &&
                            bitmap.isReady()
                    )
                ) {
                    state.loadingWaitFrames =
                        Number(
                            state.loadingWaitFrames ||
                            0
                        ) + 1;

                    if (
                        state.loadingLabel &&
                        state.loadingWaitFrames >= 18
                    ) {
                        state.loadingLabel.visible =
                            true;
                    }

                    return;
                }

                if (state.loadingLabel) {
                    state.loadingLabel.visible =
                        false;
                }

                state.current.bitmap =
                    state.bitmap;

                fitGalleryViewerSprite(
                    state.current
                );

                state.current.visible =
                    true;

                state.current.opacity = 0;

                state.phase =
                    "fadeIn";

                state.frame = 0;

                return;
            }

            if (
                state.phase ===
                "fadeIn"
            ) {
                state.frame++;

                const rate =
                    Math.min(
                        1,
                        state.frame /
                            Math.max(
                                1,
                                GALLERY_VIEWER_FADE_FRAMES
                            )
                    );

                state.current.opacity =
                    Math.round(
                        255 * rate
                    );

                if (rate >= 1) {
                    state.current.opacity =
                        255;

                    state.phase =
                        "idle";

                    state.frame = 0;
                }

                return;
            }

            /*
             * ─────────────────────────────
             * 差分
             * ─────────────────────────────
             *
             * 下の現在画像は255固定。
             * 上の次画像だけ0→255。
             */
            if (
                state.phase ===
                "waitCrossfade"
            ) {
                if (
                    !state.bitmap ||
                    !state.bitmap.isReady()
                ) {
                    return;
                }

                fitGalleryViewerSprite(
                    state.next
                );

                state.current.opacity =
                    255;

                state.next.visible =
                    true;

                state.next.opacity = 0;

                state.phase =
                    "crossfade";

                state.frame = 0;

                return;
            }

            if (
                state.phase ===
                "crossfade"
            ) {
                state.frame++;

                const rate =
                    Math.min(
                        1,
                        state.frame /
                            Math.max(
                                1,
                                GALLERY_VIEWER_CROSSFADE_FRAMES
                            )
                    );

                state.current.opacity =
                    255;

                state.next.opacity =
                    Math.round(
                        255 * rate
                    );

                if (rate >= 1) {
                    /*
                     * 上画像が完全に255になった瞬間、
                     * 同じBitmapを土台へ渡して上側を消す。
                     * 見た目は一切変化しない。
                     */
                    state.current.bitmap =
                        state.next.bitmap;

                    state.current.visible =
                        true;

                    state.current.opacity =
                        255;

                    fitGalleryViewerSprite(
                        state.current
                    );

                    state.next.visible =
                        false;

                    state.next.opacity = 0;
                    state.next.bitmap = null;

                    state.index++;

                    state.bitmap = null;
                    state.phase = "idle";
                    state.frame = 0;
                }

                return;
            }

            /*
             * ─────────────────────────────
             * 最後のクリック → 軽いフェードアウト
             * ─────────────────────────────
             */
            if (
                state.phase ===
                "fadeOut"
            ) {
                state.frame++;

                const rate =
                    Math.min(
                        1,
                        state.frame /
                            Math.max(
                                1,
                                GALLERY_VIEWER_FADE_FRAMES
                            )
                    );

                state.current.opacity =
                    Math.round(
                        255 * (1 - rate)
                    );

                if (rate >= 1) {
                    this.finishGalleryStillViewerClose();
                }
            }
        }

        processGalleryStillViewerInput() {
            const state =
                this._galleryViewer;

            if (!state) {
                return false;
            }

            /*
             * ビューア表示中は、
             * 背後のタブ・戻る・サムネへ
             * クリックを絶対に通さない。
             *
             * StoryScreenのsuper.update()より先に
             * ここで入力を消費する。
             */
            if (TouchInput.isTriggered()) {
                if (
                    state.phase ===
                    "idle"
                ) {
                    this.advanceGalleryStillViewer();
                }

                TouchInput.clear();
                Input.clear();

                return true;
            }

            return false;
        }

        createGalleryFrameOverlay() {
            const overlay =
                new Sprite(
                    ImageManager.loadPicture(
                        GALLERY_FRAME_OVERLAY_PICTURE
                    )
                );

            overlay.anchor.set(
                0.5,
                0.5
            );

            overlay.x =
                SCREEN_WIDTH / 2;

            overlay.y =
                SCREEN_HEIGHT / 2;

            const applyFit = () => {
                if (
                    !overlay.bitmap ||
                    overlay.bitmap.width <= 0 ||
                    overlay.bitmap.height <= 0
                ) {
                    return;
                }

                const scale =
                    Math.max(
                        SCREEN_WIDTH /
                            overlay.bitmap.width,
                        SCREEN_HEIGHT /
                            overlay.bitmap.height
                    );

                overlay.scale.set(
                    scale,
                    scale
                );
            };

            if (overlay.bitmap.isReady()) {
                applyFit();
            }
            else {
                overlay.bitmap.addLoadListener(
                    applyFit
                );
            }

            this._galleryFrameOverlay =
                overlay;

            this.addContent(
                overlay
            );
        }

        createGalleryTabs() {
            this._galleryTabButtons = [];

            const tabCount =
                GALLERY_TAB_IDS.length;

            const totalWidth =
                tabCount *
                    GALLERY_TAB_WIDTH +
                Math.max(
                    0,
                    tabCount - 1
                ) *
                    GALLERY_TAB_GAP;

            const startCenterX =
                Math.round(
                    (
                        SCREEN_WIDTH -
                        totalWidth
                    ) / 2 +
                    GALLERY_TAB_WIDTH / 2
                );

            GALLERY_TAB_IDS.forEach(
                (
                    tabId,
                    index
                ) => {
                    const tab =
                        new Sprite_GalleryTabButton(
                            tabId,
                            selectedTabId => {
                                this.setGalleryFilter(
                                    selectedTabId
                                );
                            }
                        );

                    tab.x =
                        startCenterX +
                        index * (
                            GALLERY_TAB_WIDTH +
                            GALLERY_TAB_GAP
                        );

                    tab.y =
                        GALLERY_TAB_CENTER_Y;

                    this._galleryTabButtons.push(
                        tab
                    );

                    this.addContent(
                        tab
                    );
                }
            );

            this.refreshGalleryTabs();
        }

        setGalleryFilter(
            tabId
        ) {
            const nextFilter =
                GALLERY_TAB_IDS.includes(
                    String(tabId || "")
                )
                    ? String(tabId)
                    : "all";

            if (
                this._galleryFilter ===
                nextFilter
            ) {
                return;
            }

            this._galleryFilter =
                nextFilter;

            this._galleryScrollY = 0;
            this._galleryScrollTargetY = 0;

            this.refreshGalleryTabs();

            /*
             * 絞り込み変更で一覧を即更新し、
             * 必ず先頭へ戻す。
             */
            this.refreshGalleryThumbnails();
        }

        refreshGalleryTabs() {
            for (
                const tab of
                this._galleryTabButtons
            ) {
                if (
                    !tab ||
                    typeof tab.setActive !==
                        "function"
                ) {
                    continue;
                }

                tab.setActive(
                    tab.tabId ===
                        this._galleryFilter
                );
            }
        }

        showEpisodeList(route) {
            this.clearContent();

            this.setRouteSelectBackgroundVisible(
                false
            );

            this.setGalleryBackgroundVisible(
                false
            );

            const routeId =
                String(
                    route && route.id || ""
                );

            this.setEpisodeSelectBackground(
                routeId
            );

            this._currentRoute = route;

            const episodes =
                route &&
                Array.isArray(route.episodes)
                    ? route.episodes
                    : [];

            /*
             * 別ルートへ移動した時だけ01へ戻す。
             * 本編終了やEXITで同じルートへ戻った時は、
             * 直前に選んでいた話数を維持する。
             */
            if (
                this._selectedEpisodeRouteId !==
                routeId
            ) {
                this._selectedEpisodeRouteId =
                    routeId;

                this._selectedEpisodeIndex = 0;
            }

            if (episodes.length > 0) {
                this._selectedEpisodeIndex =
                    Math.max(
                        0,
                        Math.min(
                            this._selectedEpisodeIndex,
                            episodes.length - 1,
                            EPISODE_NODE_POSITIONS.length - 1
                        )
                    );
            }
            else {
                this._selectedEpisodeIndex = 0;
            }

            /*
             * 01～12の駅ボタン。
             */
            episodes
                .slice(
                    0,
                    EPISODE_NODE_POSITIONS.length
                )
                .forEach(
                    (episode, index) => {
                        const position =
                            EPISODE_NODE_POSITIONS[
                                index
                            ];

                        const button =
                            new Sprite_StoryEpisodeButton(
                                routeId,
                                index,
                                episode,
                                selectedIndex => {
                                    this.selectEpisodeIndex(
                                        selectedIndex
                                    );
                                }
                            );

                        button.x = position[0];
                        button.y = position[1];

                        this.addContent(button);
                    }
                );

            /*
             * 選択中の駅へ重ねる発光枠。
             */
            this._episodeSelectedOverlay =
                new Sprite(
                    ImageManager.loadPicture(
                        `ui_episode_selected_${routeId}`
                    )
                );

            this._episodeSelectedOverlay
                .anchor.set(0.5, 0.5);

            this.addContent(
                this._episodeSelectedOverlay
            );

            /*
             * EPISODE 01。
             */
            this._episodeNumberSprite =
                new Sprite(
                    new Bitmap(
                        EPISODE_NUMBER_RECT.width,
                        EPISODE_NUMBER_RECT.height
                    )
                );

            this._episodeNumberSprite.x =
                EPISODE_NUMBER_RECT.x;

            this._episodeNumberSprite.y =
                EPISODE_NUMBER_RECT.y;

            this.addContent(
                this._episodeNumberSprite
            );

            /*
             * StoryDataから読む各話タイトル。
             */
            this._episodeTitleSprite =
                new Sprite(
                    new Bitmap(
                        EPISODE_TITLE_RECT.width,
                        EPISODE_TITLE_RECT.height
                    )
                );

            this._episodeTitleSprite.x =
                EPISODE_TITLE_RECT.x;

            this._episodeTitleSprite.y =
                EPISODE_TITLE_RECT.y;

            this.addContent(
                this._episodeTitleSprite
            );

            /*
             * 戻る。
             */
            const backButton =
                new Sprite_StoryImageButton(
                    "ui_episode_back",
                    () => {
                        /*
                         * クリック中のSpriteをその場でdestroyせず、
                         * update末尾で安全にルート選択へ戻す。
                         */
                        this._pendingReturnToRouteList =
                            true;
                    },
                    "cancel"
                );

            backButton.x =
                EPISODE_BACK_POSITION[0];

            backButton.y =
                EPISODE_BACK_POSITION[1];

            this.addContent(backButton);

            /*
             * 開始。色はルート別画像。
             */
            const startButton =
                new Sprite_StoryImageButton(
                    `ui_episode_start_${routeId}`,
                    () => {
                        const episode =
                            episodes[
                                this._selectedEpisodeIndex
                            ];

                        if (!episode) {
                            SoundManager.playBuzzer();
                            return;
                        }

                        this.onEpisodeSelected(
                            episode
                        );
                    },
                    "none"
                );

            /*
             * onEpisodeSelected()側でOK音を鳴らすので、
             * ここでは二重再生しない。
             */
            startButton.x =
                EPISODE_START_POSITION[0];

            startButton.y =
                EPISODE_START_POSITION[1];

            this.addContent(startButton);

            this.refreshEpisodeSelection();
        }

        selectEpisodeIndex(
            index
        ) {
            const episodes =
                this._currentRoute &&
                Array.isArray(
                    this._currentRoute.episodes
                )
                    ? this._currentRoute.episodes
                    : [];

            if (
                index < 0 ||
                index >= episodes.length ||
                index >= EPISODE_NODE_POSITIONS.length
            ) {
                return;
            }

            this._selectedEpisodeIndex = index;
            this.refreshEpisodeSelection();
        }

        refreshEpisodeSelection() {
            const route =
                this._currentRoute;

            const episodes =
                route &&
                Array.isArray(route.episodes)
                    ? route.episodes
                    : [];

            const index =
                this._selectedEpisodeIndex;

            const episode =
                episodes[index];

            const position =
                EPISODE_NODE_POSITIONS[index];

            if (
                this._episodeSelectedOverlay &&
                position
            ) {
                this._episodeSelectedOverlay.x =
                    position[0] +
                    EPISODE_SELECTED_OFFSET_X;

                this._episodeSelectedOverlay.y =
                    position[1] +
                    EPISODE_SELECTED_OFFSET_Y;

                this._episodeSelectedOverlay.visible =
                    !!episode;
            }

            if (this._episodeNumberSprite) {
                const bitmap =
                    this._episodeNumberSprite.bitmap;

                bitmap.clear();
                bitmap.fontFace =
                    EPISODE_FONT_FACE;
                bitmap.textColor =
                    "#ffffff";
                bitmap.outlineColor =
                    "rgba(0, 0, 0, 0.92)";
                bitmap.outlineWidth = 2;
                bitmap.fontSize = 30;

                const episodeNumber =
                    String(index + 1)
                        .padStart(2, "0");

                bitmap.drawText(
                    `EPISODE ${episodeNumber}`,
                    0,
                    0,
                    EPISODE_NUMBER_RECT.width,
                    EPISODE_NUMBER_RECT.height,
                    "left"
                );
            }

            if (this._episodeTitleSprite) {
                const bitmap =
                    this._episodeTitleSprite.bitmap;

                bitmap.clear();

                if ($gameSystem) {
                    bitmap.fontFace =
                        $gameSystem.mainFontFace();
                }

                bitmap.textColor =
                    "#ffffff";
                bitmap.outlineColor =
                    "rgba(0, 0, 0, 0.92)";
                bitmap.outlineWidth = 4;

                const title =
                    episode
                        ? stripEpisodeNumberFromTitle(
                            episode.title
                        )
                        : "";

                drawFittedText(
                    bitmap,
                    title,
                    EPISODE_TITLE_RECT.width,
                    EPISODE_TITLE_RECT.height,
                    38,
                    24,
                    "left"
                );
            }
        }

        onEpisodeSelected(
    episode
) {
    if (
        !episode ||
        !episode.pages ||
        episode.pages.length === 0
    ) {
        SoundManager.playBuzzer();
        return;
    }

    SoundManager.playOk();

    this.startEpisode(
        episode
    );
}
startEpisode(
    episode
) {
    if (
        isStoryTransitioning() ||
        !window.MamiDenOTalk ||
        !window.MamiDenOTalk
            .playExternalTalk
    ) {
        if (!isStoryTransitioning()) {
            SoundManager.playBuzzer();
        }

        return;
    }

    const storyScreen =
        this;

    this._episodeWasBusy = false;

    /*
     * debugStartを含め、実際に再生するepisodeを
     * 黒フェード開始前に確定する。
     */
    const playbackEpisode =
        makeStoryDebugEpisode(
            episode
        );

    /*
     * この一話で使うstoryStillだけを、
     * 開始フェード中にまとめて先読みする。
     */
    const episodeStillBitmaps =
        preloadStoryEpisodeStills(
            playbackEpisode
        );

    /*
     * 話数そのものが外背景から始まる場合。
     * 例：第5話 startBackground: "background_town.png"
     *
     * 選択画面を暗くしている間から先読みし、
     * 完全な黒の裏で背景をセットする。
     */
    const startBackgroundName =
        String(
            playbackEpisode.startBackground ||
            ""
        );

    const startBackgroundBitmap =
        startBackgroundName
            ? ImageManager.loadPicture(
                startBackgroundName
                    .replace(/\.png$/i, "")
            )
            : null;

    /*
     * 選択画面はまだ消さない。
     *
     * まず現在の選択画面そのものを
     * 黒へフェードアウトし、
     * 完全に黒くなった裏で
     * ストーリー会話へ切り替える。
     */
    const transitionStarted =
        startStoryTransition(
            () => {
                storyScreen.visible =
                    false;

                storyScreen
                    ._episodeWasBusy =
                    false;

                storyPlaying = true;

                /*
                 * 話数開始時背景は、
                 * 既存の話数開始黒フェードの裏で適用する。
                 *
                 * startBackgroundがなければ食堂車のまま。
                 */
                if (
                    startBackgroundName &&
                    startBackgroundBitmap
                ) {
                    setStoryBackgroundBitmap(
                        startBackgroundBitmap
                    );
                }
                else {
                    clearStoryBackground();
                }

                currentEpisode =
                    playbackEpisode;

                const started =
                    window.MamiDenOTalk
                        .playExternalTalk(
                            playbackEpisode,
                            {
                                restoreAfter:
                                    false
                            }
                        );

                /*
                 * 再生開始に失敗した場合も、
                 * 黒画面の裏で選択画面へ戻す。
                 */
                if (!started) {
                    storyPlaying = false;
                    currentEpisode = null;

                    releaseStoryEpisodeStills();

                    storyScreen.visible =
                        true;

                    SoundManager.playBuzzer();
                }
            },
            null,
            () => {
                const backgroundReady =
                    !startBackgroundBitmap ||
                    startBackgroundBitmap
                        .isReady() ||
                    startBackgroundBitmap
                        .isError();

                return (
                    backgroundReady &&
                    areStoryEpisodeStillsReady(
                        episodeStillBitmaps
                    )
                );
            }
        );

    if (!transitionStarted) {
        releaseStoryEpisodeStills();
        SoundManager.playBuzzer();
    }
}
update() {
    /*
     * 全画面CGビューアは、
     * 背後UIより先に入力を受け取る。
     *
     * これによりCG上のどこをクリックしても
     * 下にある「戻る」やタブへ入力が抜けない。
     */
    this.updateGalleryStillViewer();

    this.processGalleryStillViewerInput();

    /*
     * PCのスクロールバー操作を最優先で判定。
     * つまみドラッグ / レールクリックを
     * スマホ用スワイプに奪わせない。
     */
    this.updateGalleryScrollbarInputBeforeChildren();

    /*
     * スマホのスワイプ判定は
     * サムネ等のSprite_Clickableより先に処理する。
     *
     * タップなら何もしないので通常クリックへ流れ、
     * 10px以上動いた時だけスクロールへ切り替わる。
     */
    this.updateGalleryTouchScrollBeforeChildren();

    /*
     * その後で通常の子Spriteを更新する。
     */
    super.update();

    /*
     * ギャラリー表示中だけ、
     * PCのホイール入力と滑らかな縦移動を処理する。
     */
    this.updateGalleryScroll();

    /*
     * スワイプ後の誤クリック防止カウンタ。
     */
    this.updateGalleryTouchScrollAfterChildren();

    /*
     * サムネクリックで予約されたCGビューアを、
     * クリック処理がすべて終わった後に生成する。
     */
    if (this._pendingGalleryViewerEntry) {
        const selectedEntry =
            this._pendingGalleryViewerEntry;

        this._pendingGalleryViewerEntry =
            null;

        if (
            this.openGalleryStillViewer(
                selectedEntry
            )
        ) {
            SoundManager.playOk();
        }

        return;
    }

    /*
     * そのフレームのクリック処理が終わったあとで
     * ルートカードを片付け、話数一覧へ切り替える。
     *
     * これで複合Spriteのルートカードを押した時に出る
     * "Cannot read property 'position' of null" を回避する。
     */
    if (this._pendingRouteSelection) {
        const selectedRoute =
            this._pendingRouteSelection;

        this._pendingRouteSelection = null;

        this.showEpisodeList(
            selectedRoute
        );

        return;
    }

    if (this._pendingOpenGallery) {
        const debugUnlockAll =
            this._pendingGalleryDebugUnlockAll;

        this._pendingOpenGallery = false;
        this._pendingGalleryDebugUnlockAll = false;

        this.showGallery(
            debugUnlockAll
        );

        return;
    }

    if (this._pendingReturnToRouteList) {
        this._pendingReturnToRouteList = false;
        this.showRouteList();
        return;
    }

    if (this._pendingCloseStory) {
        this._pendingCloseStory = false;
        window.MamiDenOStory.close();
    }
}
    }

    /*
     * ─────────────────────────────
     * 画面生成・削除
     * ─────────────────────────────
     */

    function getScene() {
        const scene =
            SceneManager._scene;

        if (
            !scene ||
            !(scene instanceof Scene_Map)
        ) {
            return null;
        }

        return scene;
    }
/*
 * ─────────────────────────────
 * ストーリー専用画像レイヤー
 * ─────────────────────────────
 */

function getStoryScene() {
    const scene =
        SceneManager._scene;

    if (
        !scene ||
        !(scene instanceof Scene_Map)
    ) {
        return null;
    }

    return scene;
}

function createStoryVisualLayers() {
    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._spriteset ||
        !scene._spriteset
            ._pictureContainer
    ) {
        return;
    }

    const spriteset =
        scene._spriteset;

    const pictureContainer =
        spriteset._pictureContainer;

    /*
     * ─────────────────────────────
     * ストーリー背景
     * ─────────────────────────────
     *
     * ピクチャコンテナ内の先頭寄りへ置く。
     *
     * 通常背景より前、
     * 立ち絵より後ろになる。
     */
    if (!scene._denOStoryBackground) {
        const background =
            new Sprite();

        background.x = 0;
        background.y = 0;
        background.visible = false;

        scene._denOStoryBackground =
            background;

        pictureContainer.addChildAt(
            background,
            Math.min(
                1,
                pictureContainer
                    .children.length
            )
        );
    }

/*
 * ─────────────────────────────
 * ストーリースチル
 * ─────────────────────────────
 *
 * 立ち絵より前、
 * WindowLayerより後ろ。
 */
if (!scene._denOStoryStill) {
    const still =
        new Sprite();

    still.x = 0;
    still.y = 0;
    still.visible = false;

    scene._denOStoryStill =
        still;

    const pictureContainerIndex =
        spriteset.getChildIndex(
            pictureContainer
        );

    spriteset.addChildAt(
        still,
        Math.min(
            pictureContainerIndex + 1,
            spriteset.children.length
        )
    );
}

/*
 * クロスフェード用の
 * 2枚目のスチル。
 *
 * 必ずcreateStoryVisualLayers()の
 * 内側で作る。
 */
if (!scene._denOStoryStillNext) {
    const stillNext =
        new Sprite();

    stillNext.x = 0;
    stillNext.y = 0;
    stillNext.visible = false;
    stillNext.opacity = 0;

    scene._denOStoryStillNext =
        stillNext;

    /*
     * 現在スチルのすぐ上へ置く。
     */
    const stillIndex =
        spriteset.getChildIndex(
            scene._denOStoryStill
        );

    spriteset.addChildAt(
        stillNext,
        Math.min(
            stillIndex + 1,
            spriteset.children.length
        )
    );
}
}
function fitStorySpriteToScreen(
    sprite
) {
    if (
        !sprite ||
        !sprite.bitmap ||
        !sprite.bitmap.isReady()
    ) {
        return;
    }

    const bitmapWidth =
        sprite.bitmap.width;

    const bitmapHeight =
        sprite.bitmap.height;

    if (
        bitmapWidth <= 0 ||
        bitmapHeight <= 0
    ) {
        return;
    }

    /*
     * 1920×1080などの高解像度スチルを、
     * 縦横比を崩さず画面いっぱいへ合わせる。
     *
     * 1280×720では約66.67％。
     * 表示キャンバス自体が拡大されれば、
     * 1920×1080相当までは原寸の情報量を活かせる。
     */
    const scale =
        Math.max(
            Graphics.width /
                bitmapWidth,
            Graphics.height /
                bitmapHeight
        );

    sprite.scale.x = scale;
    sprite.scale.y = scale;

    sprite.x =
        (
            Graphics.width -
            bitmapWidth * scale
        ) / 2;

    sprite.y =
        (
            Graphics.height -
            bitmapHeight * scale
        ) / 2;
}

function setStorySpriteImage(
    sprite,
    filename,
    preparedBitmap = null
) {
    if (!sprite || !filename) {
        return;
    }

    const pictureName =
        String(filename)
            .replace(/\.png$/i, "");

    sprite.bitmap =
        preparedBitmap ||
        ImageManager.loadPicture(
            pictureName
        );

    sprite.visible = true;
    sprite.opacity = 255;

    sprite.bitmap.addLoadListener(
        () => {
            fitStorySpriteToScreen(
                sprite
            );
        }
    );
}

function showStoryBackground(
    filename
) {
    createStoryVisualLayers();

    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._denOStoryBackground
    ) {
        return;
    }

    setStorySpriteImage(
        scene._denOStoryBackground,
        filename
    );
}

function clearStoryBackground() {
    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._denOStoryBackground
    ) {
        return;
    }

    scene._denOStoryBackground
        .visible = false;

    scene._denOStoryBackground
        .bitmap = null;
}

/*
 * すでにロード開始済みのBitmapを、
 * Story背景へそのまま渡す。
 */
function setStoryBackgroundBitmap(
    bitmap
) {
    createStoryVisualLayers();

    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._denOStoryBackground ||
        !bitmap
    ) {
        return false;
    }

    const background =
        scene._denOStoryBackground;

    background.bitmap = bitmap;
    background.visible = true;
    background.opacity = 255;

    bitmap.addLoadListener(
        () => {
            if (background.bitmap === bitmap) {
                fitStorySpriteToScreen(
                    background
                );
            }
        }
    );

    if (bitmap.isReady()) {
        fitStorySpriteToScreen(
            background
        );
    }

    return true;
}

/*
 * 背景変更・時間経過用の黒幕。
 * スチル用黒幕とは別管理にして、
 * 互いの状態を食い合わないようにする。
 */
function ensureStorySceneBlackOverlay() {
    const scene =
        getStoryScene();

    if (!scene) {
        return null;
    }

    let overlay =
        scene._denOStorySceneBlackOverlay;

    if (!overlay) {
        overlay =
            new Sprite(
                new Bitmap(
                    SCREEN_WIDTH,
                    SCREEN_HEIGHT
                )
            );

        overlay.bitmap.fillRect(
            0,
            0,
            SCREEN_WIDTH,
            SCREEN_HEIGHT,
            "#000000"
        );

        overlay.visible = false;
        overlay.opacity = 0;

        scene._denOStorySceneBlackOverlay =
            overlay;
    }

    /*
     * メッセージUIを含めて覆うため最前面。
     */
    scene.addChild(
        overlay
    );

    return overlay;
}

function resetStorySceneBlackOverlay() {
    const scene =
        getStoryScene();

    if (!scene) {
        return;
    }

    const overlay =
        scene._denOStorySceneBlackOverlay;

    if (!overlay) {
        return;
    }

    overlay.visible = false;
    overlay.opacity = 0;
}

function isStorySceneTransitioning() {
    return !!storySceneTransitionState;
}

/*
 * 秒数から、
 *
 * 25％：黒へ
 * 50％：黒を維持
 * 25％：黒から戻る
 *
 * のフレーム数を作る。
 * storyBlackFade: 2 なら合計約2秒。
 */
function makeStorySceneTiming(
    seconds
) {
    const value =
        Number(seconds);

    const normalizedSeconds =
        Number.isFinite(value) &&
        value > 0
            ? Math.max(
                STORY_SCENE_MIN_SECONDS,
                value
            )
            : STORY_SCENE_DEFAULT_SECONDS;

    const totalFrames =
        Math.max(
            3,
            Math.round(
                normalizedSeconds * 60
            )
        );

    const fadeFrames =
        Math.max(
            1,
            Math.floor(
                totalFrames * 0.25
            )
        );

    const holdFrames =
        Math.max(
            0,
            totalFrames -
                fadeFrames * 2
        );

    return {
        fadeFrames: fadeFrames,
        holdFrames: holdFrames
    };
}

/*
 * 背景変更／背景クリア／純粋な時間経過を
 * ひとつの黒フェード機構で扱う。
 */
function startStorySceneTransition(
    options = {}
) {
    if (
        isStorySceneTransitioning() ||
        isStoryStillTransitioning() ||
        isStoryUiBlackFadeTransitioning()
    ) {
        return false;
    }

    const filename =
        String(
            options.filename ||
            ""
        );

    const clearBackground =
        options.clearBackground === true;

    const hasBackgroundAction =
        !!filename || clearBackground;

    const onBlack =
        typeof options.onBlack === "function"
            ? options.onBlack
            : null;

    /*
     * UIを残す黒幕を保持中なら、
     * 新しい黒フェードを重ねない。
     *
     * 今ある黒幕をそのまま目隠しとして使い、
     * 背景・立ち絵・環境光等を裏で切り替えたあと、
     * 同じ黒幕をフェードアウトして次の場面を見せる。
     */
    if (isStoryUiBlackHeld()) {
        const uiState =
            storyUiBlackFadeState;

        const overlay =
            uiState &&
            uiState.overlay
                ? uiState.overlay
                : ensureStoryUiBlackOverlay();

        if (!overlay) {
            return false;
        }

        const timing =
            makeStorySceneTiming(
                options.seconds
            );

        const pictureName =
            filename
                ? filename.replace(
                    /\.png$/i,
                    ""
                )
                : "";

        const bitmap =
            pictureName
                ? ImageManager.loadPicture(
                    pictureName
                )
                : null;

        /*
         * すでに完全な黒なので、
         * onBlack処理はここで即時実行できる。
         */
        if (onBlack) {
            onBlack();
        }

        /*
         * UI黒幕の管理を、
         * 通常の場面転換へ引き渡す。
         * 状態を二重に持たないので、
         * フェード同士が競合しない。
         */
        storyUiBlackFadeState =
            null;

        overlay.visible = true;
        overlay.opacity = 255;

        storySceneTransitionState = {
            phase:
                (
                    filename &&
                    bitmap &&
                    !bitmap.isReady() &&
                    !bitmap.isError()
                )
                    ? "waitBitmap"
                    : "hold",
            frame: 0,
            fadeFrames:
                timing.fadeFrames,
            holdFrames:
                timing.holdFrames,
            filename: filename,
            bitmap: bitmap,
            clearBackground:
                clearBackground,
            hasBackgroundAction:
                hasBackgroundAction,
            onBlack: null,
            onBlackDone: true,
            overlay: overlay,
            usesUiBlackOverlay: true
        };

        if (
            storySceneTransitionState
                .phase === "hold"
        ) {
            if (
                filename &&
                bitmap
            ) {
                setStoryBackgroundBitmap(
                    bitmap
                );
            }
            else if (
                clearBackground
            ) {
                clearStoryBackground();
            }
        }

        TouchInput.clear();
        Input.clear();

        return true;
    }

    /*
     * 話数開始・終了の黒フェード中なら、
     * 背景変更だけはその黒の裏で即時適用する。
     * 純粋な時間経過フェードは既存の黒で代用する。
     */
    if (isStoryTransitioning()) {
        /*
         * すでに黒画面の中にいるので、
         * 場面外で済ませたい処理も即時実行する。
         */
        if (onBlack) {
            onBlack();
        }

        if (filename) {
            showStoryBackground(
                filename
            );
        }
        else if (clearBackground) {
            clearStoryBackground();
        }

        return false;
    }

    const overlay =
        ensureStorySceneBlackOverlay();

    if (!overlay) {
        return false;
    }

    const timing =
        makeStorySceneTiming(
            options.seconds
        );

    const pictureName =
        filename
            ? filename.replace(
                /\.png$/i,
                ""
            )
            : "";

    const bitmap =
        pictureName
            ? ImageManager.loadPicture(
                pictureName
            )
            : null;

    overlay.visible = true;
    overlay.opacity = 0;

    storySceneTransitionState = {
        phase: "fadeToBlack",
        frame: 0,
        fadeFrames:
            timing.fadeFrames,
        holdFrames:
            timing.holdFrames,
        filename: filename,
        bitmap: bitmap,
        clearBackground:
            clearBackground,
        hasBackgroundAction:
            hasBackgroundAction,
        onBlack: onBlack,
        onBlackDone: false,
        overlay: overlay
    };

    TouchInput.clear();
    Input.clear();

    return true;
}

function showStoryBackgroundTransition(
    filename,
    seconds = null,
    onBlack = null
) {
    if (!filename) {
        return false;
    }

    return startStorySceneTransition({
        filename: filename,
        seconds: seconds,
        onBlack: onBlack
    });
}

function clearStoryBackgroundTransition(
    seconds = null,
    onBlack = null
) {
    return startStorySceneTransition({
        clearBackground: true,
        seconds: seconds,
        onBlack: onBlack
    });
}

function startStoryBlackFade(
    seconds,
    onBlack = null
) {
    return startStorySceneTransition({
        seconds: seconds,
        onBlack: onBlack
    });
}

function updateStorySceneTransition() {
    const state =
        storySceneTransitionState;

    if (!state) {
        return;
    }

    const overlay =
        state.overlay;

    if (!overlay) {
        storySceneTransitionState = null;
        return;
    }

    if (state.phase === "fadeToBlack") {
        state.frame++;

        const rate =
            Math.min(
                1,
                state.frame /
                    Math.max(
                        1,
                        state.fadeFrames
                    )
            );

        overlay.visible = true;
        overlay.opacity =
            Math.round(
                255 * rate
            );

        if (rate >= 1) {
            overlay.opacity = 255;
            state.frame = 0;

            /*
             * 完全に黒くなった瞬間だけ実行。
             * 憑依解除など「場面外で済んだこと」を
             * 見せずに反映するためのフック。
             */
            if (
                !state.onBlackDone &&
                typeof state.onBlack ===
                    "function"
            ) {
                state.onBlackDone = true;
                state.onBlack();
            }

            if (
                state.filename &&
                state.bitmap &&
                !state.bitmap.isReady() &&
                !state.bitmap.isError()
            ) {
                state.phase = "waitBitmap";
            }
            else {
                if (
                    state.filename &&
                    state.bitmap
                ) {
                    setStoryBackgroundBitmap(
                        state.bitmap
                    );
                }
                else if (
                    state.clearBackground
                ) {
                    clearStoryBackground();
                }

                state.phase = "hold";
            }
        }

        return;
    }

    if (state.phase === "waitBitmap") {
        overlay.opacity = 255;

        if (
            state.bitmap &&
            !state.bitmap.isReady() &&
            !state.bitmap.isError()
        ) {
            return;
        }

        if (
            state.bitmap &&
            state.bitmap.isReady()
        ) {
            setStoryBackgroundBitmap(
                state.bitmap
            );
        }

        state.phase = "hold";
        state.frame = 0;
        return;
    }

    if (state.phase === "hold") {
        overlay.opacity = 255;
        state.frame++;

        if (
            state.frame >=
                state.holdFrames
        ) {
            state.phase = "fadeFromBlack";
            state.frame = 0;
        }

        return;
    }

    if (state.phase === "fadeFromBlack") {
        state.frame++;

        const rate =
            Math.min(
                1,
                state.frame /
                    Math.max(
                        1,
                        state.fadeFrames
                    )
            );

        overlay.opacity =
            Math.round(
                255 * (1 - rate)
            );

        if (rate >= 1) {
            overlay.opacity = 0;
            overlay.visible = false;

            storySceneTransitionState = null;

            TouchInput.clear();
            Input.clear();
        }
    }
}


/*
 * ─────────────────────────────
 * UIを残す黒フェード
 * ─────────────────────────────
 *
 * レイヤー順：
 *   背景
 *   ↓
 *   立ち絵
 *   ↓
 *   スチル
 *   ↓
 *   この黒幕
 *   ↓
 *   WindowLayer
 *      ├ メッセージウィンドウ
 *      └ ネームプレート
 *
 * そのため、画面内の演出物だけ黒くなり、
 * UIはそのまま表示される。
 */
function ensureStoryUiBlackOverlay() {
    createStoryVisualLayers();

    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._spriteset
    ) {
        return null;
    }

    const spriteset =
        scene._spriteset;

    let overlay =
        scene._denOStoryUiBlackOverlay;

    if (!overlay) {
        overlay =
            new Sprite(
                new Bitmap(
                    SCREEN_WIDTH,
                    SCREEN_HEIGHT
                )
            );

        overlay.bitmap.fillRect(
            0,
            0,
            SCREEN_WIDTH,
            SCREEN_HEIGHT,
            "#000000"
        );

        overlay.visible = false;
        overlay.opacity = 0;

        scene._denOStoryUiBlackOverlay =
            overlay;
    }

    /*
     * スチルより1枚上へ置く。
     *
     * WindowLayerはScene_Map側の別レイヤーなので、
     * ここでspritesetの最前面寄りへ置いても
     * メッセージUIより前には出ない。
     */
    const layerCandidates = [
        scene._denOStoryStill,
        scene._denOStoryStillNext
    ].filter(
        sprite =>
            sprite &&
            sprite.parent === spriteset
    );

    let topIndex = -1;

    for (const sprite of layerCandidates) {
        topIndex =
            Math.max(
                topIndex,
                spriteset.getChildIndex(
                    sprite
                )
            );
    }

    if (topIndex < 0) {
        topIndex =
            spriteset.children.length - 1;
    }

    spriteset.addChildAt(
        overlay,
        Math.min(
            topIndex + 1,
            spriteset.children.length
        )
    );

    return overlay;
}

function resetStoryUiBlackOverlay() {
    const scene =
        getStoryScene();

    if (!scene) {
        return;
    }

    const overlay =
        scene._denOStoryUiBlackOverlay;

    if (!overlay) {
        return;
    }

    overlay.visible = false;
    overlay.opacity = 0;
}

function isStoryUiBlackFadeTransitioning() {
    return !!(
        storyUiBlackFadeState &&
        storyUiBlackFadeState.phase !==
            "held"
    );
}

/*
 * 黒幕が完全に出たまま、
 * 会話を続けられる状態。
 */
function isStoryUiBlackHeld() {
    return !!(
        storyUiBlackFadeState &&
        storyUiBlackFadeState.phase ===
            "held" &&
        storyUiBlackFadeState.overlay &&
        storyUiBlackFadeState.overlay.visible &&
        storyUiBlackFadeState.overlay.opacity >=
            255
    );
}

/*
 * UI残し黒幕は、
 * 指定秒数そのものを
 * 「黒くなるまでの時間」として扱う。
 */
function makeStoryUiBlackFadeFrames(
    seconds
) {
    const value =
        Number(seconds);

    const normalizedSeconds =
        Number.isFinite(value) &&
        value > 0
            ? value
            : 0.5;

    return Math.max(
        1,
        Math.round(
            normalizedSeconds * 60
        )
    );
}

/*
 * UIを残したまま黒くし、
 * 完全に黒くなったらその状態を保持する。
 *
 * 黒くなった時点でWindow_Messageの待機を解除し、
 * 以降のメッセージを黒画面上で進められる。
 */
function startStoryUiBlackFade(
    seconds,
    onBlack = null
) {
    if (
        isStoryUiBlackFadeTransitioning() ||
        isStoryUiBlackHeld() ||
        isStorySceneTransitioning() ||
        isStoryStillTransitioning() ||
        isStoryTransitioning()
    ) {
        return false;
    }

    const overlay =
        ensureStoryUiBlackOverlay();

    if (!overlay) {
        return false;
    }

    overlay.visible = true;
    overlay.opacity = 0;

    storyUiBlackFadeState = {
        phase: "fadeToBlack",
        frame: 0,
        fadeFrames:
            makeStoryUiBlackFadeFrames(
                seconds
            ),
        onBlack:
            typeof onBlack === "function"
                ? onBlack
                : null,
        onBlackDone: false,
        overlay: overlay
    };

    TouchInput.clear();
    Input.clear();

    return true;
}

/*
 * 黒幕だけを解除する。
 *
 * 背景変更を伴わず、
 * 同じ場面へ戻りたい時に使う。
 */
function startStoryUiBlackFadeOut(
    seconds,
    onBlack = null
) {
    if (
        !isStoryUiBlackHeld() ||
        isStorySceneTransitioning() ||
        isStoryStillTransitioning() ||
        isStoryTransitioning()
    ) {
        return false;
    }

    const state =
        storyUiBlackFadeState;

    if (
        typeof onBlack === "function"
    ) {
        onBlack();
    }

    state.phase =
        "fadeFromBlack";
    state.frame = 0;
    state.fadeFrames =
        makeStoryUiBlackFadeFrames(
            seconds
        );

    TouchInput.clear();
    Input.clear();

    return true;
}

function updateStoryUiBlackFade() {
    const state =
        storyUiBlackFadeState;

    if (!state) {
        return;
    }

    const overlay =
        state.overlay;

    if (!overlay) {
        storyUiBlackFadeState =
            null;
        return;
    }

    if (
        state.phase ===
            "fadeToBlack"
    ) {
        state.frame++;

        const rate =
            Math.min(
                1,
                state.frame /
                    Math.max(
                        1,
                        state.fadeFrames
                    )
            );

        overlay.visible = true;
        overlay.opacity =
            Math.round(
                255 * rate
            );

        if (rate >= 1) {
            overlay.opacity = 255;

            /*
             * 完全に黒くなった瞬間だけ、
             * pageParticipantsや距離解除等を
             * 黒幕の裏で実行する。
             */
            if (
                !state.onBlackDone &&
                typeof state.onBlack ===
                    "function"
            ) {
                state.onBlackDone =
                    true;
                state.onBlack();
            }

            /*
             * ここからは「演出中」ではなく
             * 黒画面を保持しているだけ。
             *
             * Window_Messageの待機が解除され、
             * 黒画面のまま会話を続けられる。
             */
            state.phase = "held";

            TouchInput.clear();
            Input.clear();
        }

        return;
    }

    if (state.phase === "held") {
        overlay.visible = true;
        overlay.opacity = 255;
        return;
    }

    if (
        state.phase ===
            "fadeFromBlack"
    ) {
        state.frame++;

        const rate =
            Math.min(
                1,
                state.frame /
                    Math.max(
                        1,
                        state.fadeFrames
                    )
            );

        overlay.opacity =
            Math.round(
                255 * (1 - rate)
            );

        if (rate >= 1) {
            overlay.opacity = 0;
            overlay.visible = false;

            storyUiBlackFadeState =
                null;

            TouchInput.clear();
            Input.clear();
        }
    }
}

function clearStoryUiBlackFade() {
    storyUiBlackFadeState = null;
    resetStoryUiBlackOverlay();
}

function clearStorySceneTransition() {
    storySceneTransitionState = null;
    resetStorySceneBlackOverlay();
}

/*
 * Story本編で実際に表示したスチルを
 * ギャラリー解放情報として保存する。
 *
 * Progressプラグイン未導入時でも
 * Story本編だけはそのまま動く。
 */
function unlockStoryStillProgress(
    filename
) {
    if (
        !filename ||
        !window.MamiDenOProgress ||
        typeof window.MamiDenOProgress
            .unlockStill !== "function"
    ) {
        return;
    }

    window.MamiDenOProgress
        .unlockStill(filename);
}

function showStoryStill(
    filename
) {
    createStoryVisualLayers();

    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._denOStoryStill
    ) {
        return;
    }

    /*
     * 表示可能なStoryレイヤーが存在する時だけ
     * 解放済みとして記録する。
     */
    unlockStoryStillProgress(
        filename
    );

    setStorySpriteImage(
        scene._denOStoryStill,
        filename,
        getStoryEpisodeStillBitmap(
            filename
        )
    );
}
/*
 * スチル出入り専用の黒幕。
 *
 * 話数開始／終了用の黒幕とは分離する。
 * これにより、通常のStoryトランジションと
 * スチル演出が互いに状態を奪わない。
 */
function ensureStoryStillBlackOverlay() {
    const scene =
        getStoryScene();

    if (!scene) {
        return null;
    }

    let overlay =
        scene._denOStoryStillBlackOverlay;

    if (!overlay) {
        overlay =
            new Sprite(
                new Bitmap(
                    SCREEN_WIDTH,
                    SCREEN_HEIGHT
                )
            );

        overlay.bitmap.fillRect(
            0,
            0,
            SCREEN_WIDTH,
            SCREEN_HEIGHT,
            "#000000"
        );

        overlay.visible = false;
        overlay.opacity = 0;

        scene._denOStoryStillBlackOverlay =
            overlay;
    }

    /*
     * メッセージUIも含めて完全に黒くするため、
     * Scene_Mapの最前面へ置く。
     */
    scene.addChild(
        overlay
    );

    return overlay;
}

function resetStoryStillBlackOverlay() {
    const scene =
        getStoryScene();

    if (!scene) {
        return;
    }

    const overlay =
        scene._denOStoryStillBlackOverlay;

    if (!overlay) {
        return;
    }

    overlay.opacity = 0;
    overlay.visible = false;
}

/*
 * 現在スチルと差分用スチルだけを消す。
 * 演出状態そのものは触らない。
 */
function clearStoryStillSprites() {
    const scene =
        getStoryScene();

    if (!scene) {
        return;
    }

    const stills = [
        scene._denOStoryStill,
        scene._denOStoryStillNext
    ];

    stills.forEach(
        still => {
            if (!still) {
                return;
            }

            still.visible = false;
            still.opacity = 255;
            still.bitmap = null;
        }
    );
}

function isStoryStillTransitioning() {
    return !!storyStillTransitionState;
}

/*
 * Storyスチルを表示する。
 *
 * 初回：
 *   立ち絵 → 黒 → スチル
 *
 * 2枚目以降：
 *   現在スチル → 差分クロスフェード
 *
 * 戻り値trueなら演出を開始した。
 */
function showStoryStillTransition(
    filename
) {
    if (
        !filename ||
        isStoryStillTransitioning()
    ) {
        return false;
    }

    createStoryVisualLayers();

    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._denOStoryStill ||
        !scene._denOStoryStillNext
    ) {
        return false;
    }

    /*
     * Story本編でこの差分を表示しようとした時点で
     * ギャラリー解放情報へ保存する。
     *
     * 同じ差分を何度見てもProgress側で重複保存されない。
     */
    unlockStoryStillProgress(
        filename
    );

    const bitmap =
        getStoryEpisodeStillBitmap(
            filename
        );

    const current =
        scene._denOStoryStill;

    /*
     * 初回スチル。
     * 完全な黒になるまでCGは表示しない。
     */
    if (
        !current.visible ||
        !current.bitmap
    ) {
        const overlay =
            ensureStoryStillBlackOverlay();

        if (!overlay) {
            return false;
        }

        overlay.visible = true;
        overlay.opacity = 0;

        storyStillTransitionState = {
            type: "enter",
            phase: "fadeToBlack",
            frame: 0,
            bitmap: bitmap,
            current: current,
            overlay: overlay
        };

        TouchInput.clear();
        Input.clear();

        return true;
    }

    /*
     * 差分切り替え。
     *
     * _denOStoryStillは常に土台、
     * _denOStoryStillNextは常に上側として使う。
     * Sprite参照を入れ替えないので、
     * 2回目以降も必ず同じ方向へ重なる。
     */
    const next =
        scene._denOStoryStillNext;

    next.bitmap = bitmap;
    next.visible = false;
    next.opacity = 0;

    bitmap.addLoadListener(
        () => {
            if (next.bitmap === bitmap) {
                fitStorySpriteToScreen(
                    next
                );
            }
        }
    );

    storyStillTransitionState = {
        type: "crossfade",
        phase: "waitBitmap",
        frame: 0,
        bitmap: bitmap,
        current: current,
        next: next
    };

    TouchInput.clear();
    Input.clear();

    return true;
}

/*
 * Storyスチルを閉じる。
 *
 * スチル → 黒 → 立ち絵
 */
function hideStoryStillTransition() {
    if (isStoryStillTransitioning()) {
        return false;
    }

    const scene =
        getStoryScene();

    if (
        !scene ||
        !scene._denOStoryStill
    ) {
        return false;
    }

    const current =
        scene._denOStoryStill;

    if (
        !current.visible ||
        !current.bitmap
    ) {
        return false;
    }

    const overlay =
        ensureStoryStillBlackOverlay();

    if (!overlay) {
        return false;
    }

    overlay.visible = true;
    overlay.opacity = 0;

    storyStillTransitionState = {
        type: "exit",
        phase: "fadeToBlack",
        frame: 0,
        current: current,
        overlay: overlay
    };

    TouchInput.clear();
    Input.clear();

    return true;
}

/*
 * 毎フレームのスチル演出更新。
 */
function updateStoryStillTransition() {
    const state =
        storyStillTransitionState;

    if (!state) {
        return;
    }

    /*
     * ─────────────────────────────
     * 差分クロスフェード
     * ─────────────────────────────
     */
    if (state.type === "crossfade") {
        if (state.phase === "waitBitmap") {
            if (
                !state.bitmap ||
                !state.bitmap.isReady()
            ) {
                return;
            }

            fitStorySpriteToScreen(
                state.next
            );

            state.next.visible = true;
            state.next.opacity = 0;

            state.phase = "fade";
            state.frame = 0;

            return;
        }

        if (state.phase === "fade") {
            state.frame++;

            const rate =
                Math.min(
                    1,
                    state.frame /
                        Math.max(
                            1,
                            STORY_STILL_CROSSFADE_FRAMES
                        )
                );

            /*
             * 土台は最後まで100％。
             * 上の差分だけを浮かび上がらせる。
             * 下の立ち絵は透けない。
             */
            state.current.opacity = 255;
            state.next.opacity =
                Math.round(
                    255 * rate
                );

            if (rate >= 1) {
                /*
                 * 同じ画像を土台へ渡してから
                 * 上側を消す。
                 * 見た目は一切変わらないので
                 * 瞬間的な立ち絵露出も起きない。
                 */
                state.current.bitmap =
                    state.next.bitmap;

                state.current.visible = true;
                state.current.opacity = 255;

                fitStorySpriteToScreen(
                    state.current
                );

                state.next.visible = false;
                state.next.opacity = 0;
                state.next.bitmap = null;

                storyStillTransitionState =
                    null;
            }
        }

        return;
    }

    /*
     * ─────────────────────────────
     * 立ち絵 ⇄ スチルの黒フェード
     * ─────────────────────────────
     */
    const overlay =
        state.overlay;

    if (!overlay) {
        storyStillTransitionState = null;
        return;
    }

    if (state.phase === "fadeToBlack") {
        state.frame++;

        const rate =
            Math.min(
                1,
                state.frame /
                    Math.max(
                        1,
                        STORY_STILL_BLACK_FADE_FRAMES
                    )
            );

        overlay.visible = true;
        overlay.opacity =
            Math.round(
                255 * rate
            );

        if (rate >= 1) {
            overlay.opacity = 255;
            state.frame = 0;

            if (state.type === "enter") {
                state.phase = "waitBitmap";
            }
            else {
                /*
                 * 完全な黒の裏でCGを撤去。
                 */
                clearStoryStillSprites();
                state.phase = "hold";
            }
        }

        return;
    }

    if (state.phase === "waitBitmap") {
        if (
            !state.bitmap ||
            !state.bitmap.isReady()
        ) {
            /*
             * 読み込みが遅い場合は
             * 黒のまま待つ。
             */
            overlay.opacity = 255;
            return;
        }

        state.current.bitmap =
            state.bitmap;

        state.current.visible = true;
        state.current.opacity = 255;

        fitStorySpriteToScreen(
            state.current
        );

        state.phase = "hold";
        state.frame = 0;

        return;
    }

    if (state.phase === "hold") {
        overlay.opacity = 255;
        state.frame++;

        if (
            state.frame >=
                STORY_STILL_BLACK_HOLD_FRAMES
        ) {
            state.phase = "fadeFromBlack";
            state.frame = 0;
        }

        return;
    }

    if (state.phase === "fadeFromBlack") {
        state.frame++;

        const rate =
            Math.min(
                1,
                state.frame /
                    Math.max(
                        1,
                        STORY_STILL_BLACK_FADE_FRAMES
                    )
            );

        overlay.opacity =
            Math.round(
                255 * (1 - rate)
            );

        if (rate >= 1) {
            overlay.opacity = 0;
            overlay.visible = false;

            storyStillTransitionState =
                null;

            TouchInput.clear();
            Input.clear();
        }
    }
}

/*
 * 強制終了・話数終了用。
 * スチル演出も含めて即座に完全クリアする。
 */
function clearStoryStill() {
    storyStillTransitionState = null;

    clearStoryStillSprites();
    resetStoryStillBlackOverlay();
}

function clearAllStoryVisuals() {
    clearStorySceneTransition();
    clearStoryUiBlackFade();
    clearStoryBackground();
    clearStoryStill();
    releaseStoryEpisodeStills();
}
/*
 * ─────────────────────────────
 * ストーリー会話終了監視
 * ─────────────────────────────
 */
function updateStoryEpisodePlayback() {
    if (
        !storyPlaying ||
        isStoryTransitioning() ||
        isStorySceneTransitioning() ||
        isStoryUiBlackFadeTransitioning() ||
        isStoryStillTransitioning()
    ) {
        return;
    }

    const scene =
        getScene();

    if (
        !scene ||
        !scene._denOStoryScreen
    ) {
        return;
    }

    const storyScreen =
        scene._denOStoryScreen;

    /*
     * 会話が始まったことを記録。
     */
    if (
        $gameMessage &&
        $gameMessage.isBusy()
    ) {
        storyScreen._episodeWasBusy =
            true;

        return;
    }

    /*
     * 一度会話が始まったあと、
     * メッセージが終了したら
     * 黒フェードで話数一覧へ戻す。
     */
    if (
        !storyScreen._episodeWasBusy
    ) {
        return;
    }

    storyScreen._episodeWasBusy =
        false;

    startStoryTransition(
        () => {
            storyPlaying = false;
            currentEpisode = null;
            currentPageIndex = 0;

            /*
             * ストーリー側の画像を
             * 黒画面の裏で片付ける。
             */
            clearAllStoryVisuals();

            storyScreen.visible = true;

            storyScreen.showEpisodeList(
                storyScreen._currentRoute
            );

            TouchInput.clear();
            Input.clear();
        }
    );
}
    function openStoryScreen() {
        if (storyActive) {
            return;
        }

        /*
         * ルート選択中の数秒を使って、
         * 次の話数選択UIをバックグラウンドで先読みする。
         */
        preloadStoryEpisodeUi();

        if (
            $gameMessage &&
            $gameMessage.isBusy()
        ) {
            return;
        }

        const scene =
            getScene();

        if (!scene) {
            return;
        }

        storyActive = true;
        createStoryVisualLayers();
        clearAllStoryVisuals();
/*
 * 通常モードの憑依状態を保存して、
 * ストーリー用に未憑依へリセットする。
 */
if (
    window.MamiDenOTalk &&
    window.MamiDenOTalk
        .createStoryStateSnapshot &&
    window.MamiDenOTalk
        .resetPossessionForStory
) {
    previousTalkStateSnapshot =
        window.MamiDenOTalk
            .createStoryStateSnapshot();

    window.MamiDenOTalk
        .resetPossessionForStory();
}
        /*
 * ストーリー中は
 * メッセージUIを下へ移動する。
 */
if (
    window.MamiDenOMessageUI &&
    window.MamiDenOMessageUI
        .setStoryMode
) {
    window.MamiDenOMessageUI
        .setStoryMode(true);
}

/*
 * ランダム憑依スイッチを
 * 完全に非表示にする。
 */
if (
    scene._randomPossessionButton
) {
    scene._randomPossessionButton
        .visible = false;
}
        /*
 * ランダム憑依乱入を停止する。
 *
 * ストーリーを閉じた時に戻せるよう、
 * 開始前の設定を保存しておく。
 */
if (
    window.MamiDenOTalk &&
    window.MamiDenOTalk
        .isRandomPossessionEnabled &&
    window.MamiDenOTalk
        .setRandomPossessionEnabled
) {
    previousRandomPossessionEnabled =
        window.MamiDenOTalk
            .isRandomPossessionEnabled();

    window.MamiDenOTalk
        .setRandomPossessionEnabled(
            false
        );
}

        /*
         * 通常UIを隠す。
         */
        if (
            window.MamiDenOUI &&
            window.MamiDenOUI
                .hideButtons
        ) {
            window.MamiDenOUI
                .hideButtons();
        }

        /*
         * ストーリー画面を生成。
         */
        scene._denOStoryScreen =
            new Sprite_DenOStoryScreen();

        /*
         * Scene_Mapの最前面へ追加。
         */
        scene.addChild(
            scene._denOStoryScreen
        );
/*
 * 再生中EXITボタン。
 */
scene._denOStoryExitButton =
    new Sprite_StoryExitButton();

scene.addChild(
    scene._denOStoryExitButton
);
        TouchInput.clear();
    }

    function closeStoryScreen() {
    if (!storyActive) {
        return;
    }

    const scene =
        getScene();

    clearAllStoryVisuals();

    if (
        scene &&
        scene._denOStoryScreen
    ) {
            scene.removeChild(
                scene._denOStoryScreen
            );

            scene._denOStoryScreen
                .destroy({
                    children: true
                });

            scene._denOStoryScreen =
                null;
        }

        storyActive = false;
        /*
 * ストーリー中の憑依状態を破棄し、
 * 通常モード開始前の状態へ戻す。
 */
if (
    previousTalkStateSnapshot &&
    window.MamiDenOTalk &&
    window.MamiDenOTalk
        .restoreStoryStateSnapshot
) {
    window.MamiDenOTalk
        .restoreStoryStateSnapshot(
            previousTalkStateSnapshot
        );
}

previousTalkStateSnapshot =
    null;
       /*
 * メッセージUIを
 * 通常位置へ戻す。
 */
if (
    window.MamiDenOMessageUI &&
    window.MamiDenOMessageUI
        .setStoryMode
) {
    window.MamiDenOMessageUI
        .setStoryMode(false);
}

/*
 * ストーリー開始前の
 * ランダム憑依設定へ先に戻す。
 */
if (
    previousRandomPossessionEnabled !==
        null &&
    window.MamiDenOTalk &&
    window.MamiDenOTalk
        .setRandomPossessionEnabled
) {
    window.MamiDenOTalk
        .setRandomPossessionEnabled(
            previousRandomPossessionEnabled
        );
}

/*
 * 状態を戻したあとで、
 * ボタンを再表示して画像も同期する。
 */
if (
    scene &&
    scene._randomPossessionButton
) {
    scene._randomPossessionButton
        .visible = true;

    if (
        scene._randomPossessionButton
            .refresh
    ) {
        scene._randomPossessionButton
            .refresh();
    }
}

previousRandomPossessionEnabled =
    null;
        /*
         * 通常UIを戻す。
         */
                if (
            window.MamiDenOUI &&
            window.MamiDenOUI
                .showButtons
        ) {
            window.MamiDenOUI
                .showButtons();
        }

        /*
         * EXITボタンを削除。
         */
        if (
            scene &&
            scene._denOStoryExitButton
        ) {
            scene.removeChild(
                scene._denOStoryExitButton
            );

            scene._denOStoryExitButton
                .destroy({
                    children: true
                });

            scene._denOStoryExitButton =
                null;
        }

        /*
         * EXIT確認画面が残っていたら削除。
         */
        closeStoryConfirm();

        storyConfirmOpen = false;

        TouchInput.clear();
        Input.clear();
    }

/*
 * 現在のタップ位置が
 * ストーリーEXITボタン上か判定。
 */
function isTouchOnStoryExitButton() {
    if (!storyPlaying) {
        return false;
    }

    const scene =
        getScene();

    if (
        !scene ||
        !scene._denOStoryExitButton ||
        !scene._denOStoryExitButton.visible
    ) {
        return false;
    }

    const button =
        scene._denOStoryExitButton;

    const x =
        TouchInput.x;

    const y =
        TouchInput.y;

    const halfWidth =
    button._width / 2;

const halfHeight =
    button._height / 2;

return (
    x >= button.x - halfWidth &&
    x <= button.x + halfWidth &&
    y >= button.y - halfHeight &&
    y <= button.y + halfHeight
);
}


/*
 * EXIT関連の操作は、
 * 背後のメッセージ送りに使わせない。
 */
/*
 * 黒フェード中は、
 * 覆いの下にあるボタン類も反応させない。
 */
const _Sprite_Clickable_processTouch_StoryTransition =
    Sprite_Clickable.prototype.processTouch;

Sprite_Clickable.prototype.processTouch =
    function() {
        if (
            isStoryTransitioning() ||
            isStorySceneTransitioning() ||
            isStoryStillTransitioning()
        ) {
            return;
        }

        /*
         * 汎用確認画面が開いている間は、
         * はい / いいえ以外のクリックを遮断する。
         * ギャラリーのサムネや戻るボタンへの
         * クリック貫通もここで止める。
         */
        if (
            storyConfirmOpen &&
            !this._denOConfirmButton
        ) {
            return;
        }

        _Sprite_Clickable_processTouch_StoryTransition
            .call(this);
    };

const _Window_Message_isTriggered_StoryExit =
    Window_Message.prototype.isTriggered;

Window_Message.prototype.isTriggered =
    function() {
        /*
         * 黒フェード中は
         * 背後のメッセージを送らない。
         */
        if (
            isStoryTransitioning() ||
            isStorySceneTransitioning() ||
            isStoryStillTransitioning()
        ) {
            return false;
        }

        /*
         * 確認画面を開いている間。
         */
        if (storyConfirmOpen) {
            return false;
        }

        /*
         * EXITボタンそのものを
         * 押した瞬間も止める。
         */
        if (isTouchOnStoryExitButton()) {
            return false;
        }

        return _Window_Message_isTriggered_StoryExit
            .call(this);
    };  
    /*
 * ストーリー選択画面が非表示中でも、
 * マップ側で会話終了を監視する。
 */
const _Scene_Map_update_Story =
    Scene_Map.prototype.update;

Scene_Map.prototype.update =
    function() {
        _Scene_Map_update_Story.call(
            this
        );

        /*
         * 通常更新の後で最前面の黒幕を動かす。
         */
        updateStoryStillTransition();

        updateStorySceneTransition();

        updateStoryUiBlackFade();

        updateStoryTransition();

        updateStoryEpisodePlayback();
    };
    /*
     * マップを離れた場合に
     * 状態を残さない。
     */
    const _Scene_Map_terminate =
        Scene_Map.prototype.terminate;

    Scene_Map.prototype.terminate =
        function() {
            storyActive = false;

            storyTransitionPhase =
                "none";

            storyTransitionCount = 0;
            storyTransitionOnBlack = null;
            storyTransitionOnComplete =
                null;
            storyTransitionHoldUntil = null;

            clearStorySceneTransition();

            clearStoryUiBlackFade();

            storyStillTransitionState = null;
            resetStoryStillBlackOverlay();
            releaseStoryEpisodeStills();

            _Scene_Map_terminate.call(
                this
            );
        };

    /*
     * ─────────────────────────────
     * 外部公開
     * ─────────────────────────────
     */

    window.MamiDenOStory =
        window.MamiDenOStory || {};

    window.MamiDenOStory.open =
        function() {
            openStoryScreen();
        };

    window.MamiDenOStory.close =
        function() {
            closeStoryScreen();
        };

    window.MamiDenOStory.isActive =
        function() {
            return storyActive;
        };

    window.MamiDenOStory.isTransitioning =
        function() {
            return isStoryTransitioning();
        };
        window.MamiDenOStory.showBackground =
    function(filename) {
        showStoryBackground(
            filename
        );
    };

window.MamiDenOStory.clearBackground =
    function() {
        clearStoryBackground();
    };

window.MamiDenOStory
    .showBackgroundTransition =
    function(
        filename,
        seconds = null,
        onBlack = null
    ) {
        return showStoryBackgroundTransition(
            filename,
            seconds,
            onBlack
        );
    };

window.MamiDenOStory
    .clearBackgroundTransition =
    function(
        seconds = null,
        onBlack = null
    ) {
        return clearStoryBackgroundTransition(
            seconds,
            onBlack
        );
    };

window.MamiDenOStory
    .startBlackFade =
    function(
        seconds,
        onBlack = null
    ) {
        return startStoryBlackFade(
            seconds,
            onBlack
        );
    };

/*
 * メッセージウィンドウ・ネームプレートを残す
 * UI背面の黒フェード。
 */
window.MamiDenOStory
    .startUiBlackFade =
    function(
        seconds,
        onBlack = null
    ) {
        return startStoryUiBlackFade(
            seconds,
            onBlack
        );
    };

window.MamiDenOStory
    .startUiBlackFadeOut =
    function(
        seconds,
        onBlack = null
    ) {
        return startStoryUiBlackFadeOut(
            seconds,
            onBlack
        );
    };

window.MamiDenOStory
    .isUiBlackFadeTransitioning =
    function() {
        return isStoryUiBlackFadeTransitioning();
    };

window.MamiDenOStory
    .isUiBlackHeld =
    function() {
        return isStoryUiBlackHeld();
    };

window.MamiDenOStory
    .isSceneTransitioning =
    function() {
        return (
            isStorySceneTransitioning() ||
            isStoryUiBlackFadeTransitioning()
        );
    };

window.MamiDenOStory.showStill =
    function(filename) {
        showStoryStill(
            filename
        );
    };
window.MamiDenOStory
    .showStillTransition =
    function(filename) {
        return showStoryStillTransition(
            filename
        );
    };

window.MamiDenOStory
    .hideStillTransition =
    function() {
        return hideStoryStillTransition();
    };

window.MamiDenOStory
    .isStillTransitioning =
    function() {
        return isStoryStillTransitioning();
    };

window.MamiDenOStory.clearStill =
    function() {
        clearStoryStill();
    };

window.MamiDenOStory
    .clearVisuals =
    function() {
        clearAllStoryVisuals();
    };
})();
