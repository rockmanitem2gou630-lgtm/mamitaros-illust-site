/*:
 * @target MZ
 * @plugindesc 電王会話作品用・複数話者対応ランダム会話 Ver0.1
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
 * @text 通常立ち絵画像
 * @type file
 * @dir img/pictures
 * @default portrait_ryotaro_base_ryotaro_normal
 * 
 * @param DefaultSpeaker
 * @text 話者未指定時のキャラクター
 * @type select
 * @option 野上良太郎
 * @value ryotaro
 * @option モモタロス
 * @value momotaros
 * @option 月城澪
 * @value mio
 * @default ryotaro
 *
 * @param ResetDelay
 * @text 通常表情へ戻る時間
 * @desc 会話終了後、通常表情へ戻るまでのフレーム数です。
 * @type number
 * @min 0
 * @default 15
 *
 * @param HistoryCount
 * @text 重複を避ける履歴数
 * @desc 直近何件の会話を抽選候補から外すか設定します。
 * @type number
 * @min 1
 * @default 3
 *
 * @command showTimeGreeting
 * @text 時間帯別の来訪挨拶
 * @desc 現在の時間帯に合った来訪挨拶を表示します。
 * 
 * @command randomTalk
 * @text ランダム会話
 * @desc 指定カテゴリに合う会話をひとつ抽選します。
 * 
 * @command setMainCharacter
 * @text メインキャラクター変更
 * @desc 通常時に中央へ表示するキャラクターを変更します。
 * 
 * @command startPossession
 * @text 憑依開始
 * @desc 指定したイマジンを良太郎へ憑依させます。
 *
 * @arg imagin
 * @text 憑依するイマジン
 * @type select
 * @option モモタロス
 * @value momotaros
 * @option ウラタロス
 * @value urataros
 * @option キンタロス
 * @value kintaros
 * @option リュウタロス
 * @value ryutaros
 * @default momotaros
 *
 * @arg outfit
 * @text 憑依後の服装
 * @type select
 * @option 良太郎の普段着
 * @value normal
 * @option イマジン好みの服装
 * @value imagin_preference
 * @default normal
 *
 * @command endPossession
 * @text 憑依解除
 * @desc 現在の憑依を解除し、良太郎へ戻します。
 * 
 * @command possessionEvent
 * @text 憑依イベント
 * @desc 現在の状態に応じて、憑依または解除の一連の会話を実行します。
 *
 * @arg speaker
 * @text キャラクター
 * @type select
 * @option 野上良太郎
 * @value ryotaro
 * @option モモタロス
 * @value momotaros
 * @option ウラタロス
 * @value urataros
 * @option キンタロス
 * @value kintaros
 * @option リュウタロス
 * @value ryutaros
 * @option ジーク
 * @value sieg
 * @default ryotaro
 *
 * @arg expression
 * @text 通常立ち絵画像
 * @type file
 * @dir img/pictures
 * @default portrait_ryotaro_base_ryotaro_normal
 *
 * @arg category
 * @text 会話カテゴリ
 * @type select
 * @option すべて
 * @value all
 * @option 雑談
 * @value normal
 * @option 季節
 * @value season
 * @option 本丸
 * @value honmaru
 * @option 時間帯
 * @value time
 * @default all
 *
 * @help
 * Ver5.0は、従来のカテゴリ構造を残しながら
 * tagsによる会話管理へ移行できる互換版です。
 *
 * 従来どおりtagsなしでも動作します。
 *
 * 条件付き会話も通常会話と同じ抽選箱へ入るため、
 * 条件を満たした会話だけが毎回優先され続けることはありません。
 */

(() => {
    "use strict";

    const pluginName = "Mami_DenOTalk";
    const params = PluginManager.parameters(pluginName);

    const pictureId =
        Number(params.PictureId || 2);

    const pictureX =
        Number(params.PictureX || 640);

    const pictureY =
        Number(params.PictureY || 360);

    const scale =
        Number(params.Scale || 100);

     const namePlatePictureId =
        Number(
            params.NamePlatePictureId ||
            20
        );

    const namePlateX =
        Number(
            params.NamePlateX ||
            180
        );

    const namePlateY =
        Number(
            params.NamePlateY ||
            520
        );

    const namePlateScale =
        Number(
            params.NamePlateScale ||
            100
        );

    const defaultSpeaker =
        String(
            params.DefaultSpeaker ||
            "ryotaro"
        );       

    const defaultExpression =
        String(
            params.DefaultExpression ||
            "portrait_ryotaro_base_ryotaro_normal"
        );

    const resetDelayFrames =
        Number(params.ResetDelay || 15);

    const historyCount =
        Math.max(
            1,
            Number(params.HistoryCount || 3)
        );
     /*
    　* 選択肢会話の出現率
    　* 0.05 = 5%
    　*/
     const CHOICE_TALK_RATE = 0.05;

    /*
     * ─────────────────────────────
     * キャラクター情報
     * ─────────────────────────────
     */

    const SPEAKER_DATA = {
        ryotaro: {
            namePlate:
                "name_ryotaro"
        },

        momotaros: {
            namePlate:
                "name_momotaros"
        },

        urataros: {
            namePlate:
                "name_urataros"
        },

        kintaros: {
            namePlate:
                "name_kintaros"
        },

        ryutaros: {
            namePlate:
                "name_ryutaros"
        },

        sieg: {
            namePlate:
                "name_sieg"
        },

        mio: {
            namePlate:
                "name_mio"
        }
    };     
    /*
 * キャラクターごとの通常立ち絵を返す。
 */
function getDefaultExpressionForSpeaker(
    speakerId
) {
    switch (
        String(speakerId || "")
    ) {
        case "momotaros":
            return (
                "portrait_momotaros_base_default_normal"
            );

        case "urataros":
            return (
                "portrait_urataros_base_default_normal"
            );

        case "kintaros":
            return (
                "portrait_kintaros_base_default_normal"
            );

        case "ryutaros":
            return (
                "portrait_ryutaros_base_default_normal"
            );

        case "sieg":
            return (
                "portrait_sieg_base_default_normal"
            );

        case "ryotaro":
        default:
            return (
                "portrait_ryotaro_base_ryotaro_normal"
            );
    }
}

/*
 * ─────────────────────────────
 * 立ち絵の距離演出
 * ─────────────────────────────
 *
 * 元画像の高さは1080px。
 *
 * normal:
 *   66.6667％表示で高さ720px
 *
 * close:
 *   100％表示で高さ1080px
 */
const PORTRAIT_DISTANCE_DATA = {
    normal: {
        scale: 66.6667,
        y: 360
    },

    close: {
        scale: 100,
        y: 470
    }
};

/*
 * 接近・後退にかける時間。
 *
 * 18フレームで約0.3秒。
 */
const PORTRAIT_DISTANCE_DURATION = 18;

/*
 * キャラクターごとの現在距離。
 *
 * 未登録ならnormal扱い。
 */
let currentPortraitDistance = {};

function getPortraitDistanceData(
    speakerId
) {
    const distance =
        currentPortraitDistance[
            String(speakerId || "")
        ] || "normal";

    return (
        PORTRAIT_DISTANCE_DATA[
            distance
        ] ||
        PORTRAIT_DISTANCE_DATA.normal
    );
}
/*
 * 現在の会話開始時に、
 * 特殊な距離へ移動したキャラクター。
 */
let activeTalkDistanceSpeakers = [];

/*
 * フェード式距離変更の進行状態。
 */
let portraitDistanceFadeStates = [];

/*
 * 立ち絵モーションの進行状態。
 */
let portraitMotionStates = [];

/*
 * 距離フェード終了後に、
 * 会話前の一人表示へ戻すか。
 */
let pendingRestoreAfterDistanceFade = false;

/*
 * ─────────────────────────────
 * 複数立ち絵スロット
 * ─────────────────────────────
 *
 * pictureIdを先頭として、
 * 最大5枚のピクチャ番号を使用する。
 *
 * 例：
 * PictureIdが2なら
 * 2～6番を立ち絵に使用。
 */

const MAX_PORTRAIT_COUNT = 5;

/*
 * ─────────────────────────────
 * 立ち絵色調
 * ─────────────────────────────
 */

const ACTIVE_PORTRAIT_TONE =
    [0, 0, 0, 0];

const INACTIVE_PORTRAIT_TONE =
    [-50, -50, -50, 0];

/*
 * 色調変化時間
 *
 * 0なら即時。
 */
const PORTRAIT_TONE_DURATION = 8;

/*
 * キャラクター登場時の
 * フェードイン時間。
 *
 * 60フレームで約1秒。
 * 10～12程度なら軽く自然。
 */
const PORTRAIT_FADE_DURATION = 10;
/*
 * 転倒後の復帰専用フェード時間。
 */
const PORTRAIT_RECOVER_FADE_DURATION = 18;

/*
 * 1280×720用の基準位置。
 *
 * 必要に応じて後から調整可能。
 */
const PORTRAIT_SLOT_X = {
    1: 130,
    2: 385,
    3: 640,
    4: 895,
    5: 1150
};

/*
 * 人数ごとに使用するスロット。
 *
 * 4人の場合は中央の3番を空ける。
 */
const PORTRAIT_LAYOUT = {
    1: [3],
    2: [2, 4],
    3: [2, 3, 4],
    4: [1, 2, 4, 5],
    5: [1, 2, 3, 4, 5]
};
/*
 * 3人表示専用のX座標。
 *
 * 通常の2・3・4番スロットより少し広げる。
 */
const PORTRAIT_THREE_PERSON_X = {
    2: 300,
    3: 640,
    4: 980
};
/*
 * 現在画面にいるキャラクターと、
 * 使用スロットの対応。
 */
let currentPortraitSlots = {};
/*
 * 現在表示中の立ち絵人数。
 *
 * 3人表示時の専用座標判定に使用する。
 */
let currentPortraitCount = 0;
/*
 * スロット番号から実際のX座標を取得する。
 *
 * 3人表示時だけ専用座標を使用する。
 */
function getPortraitSlotX(
    slotNumber
) {
    if (
        currentPortraitCount === 3 &&
        PORTRAIT_THREE_PERSON_X[
            slotNumber
        ] !== undefined
    ) {
        return (
            PORTRAIT_THREE_PERSON_X[
                slotNumber
            ]
        );
    }

    return (
        PORTRAIT_SLOT_X[
            slotNumber
        ]
    );
}
/*
 * ─────────────────────────────
 * 通常時の一対一表示
 * ─────────────────────────────
 */

/*
 * 現在選択されているメインキャラクター。
 *
 * 複数人会話の終了後は、
 * この状態へ戻す。
 */
let currentSoloPortrait = {
    speaker:
        defaultSpeaker,

    expression:
        defaultExpression
};
/*
 * ─────────────────────────────
 * 憑依状態
 * ─────────────────────────────
 */

let possessionState = {
    active: false,

    /*
     * 憑依されている人物。
     */
    host: "ryotaro",

    /*
     * 現在憑依しているイマジン。
     */
    imagin: null,

    /*
     * normal
     *     良太郎の普段着
     *
     * imagin_preference
     *     いずれかのイマジンが選んだ服
     */
    outfit: "normal",

    /*
     * 現在の服を選んだ人物。
     *
     * normalならryotaro。
     * イマジン好みなら、そのイマジンID。
     */
    outfitOwner: "ryotaro"
};
/*
 * 会話開始直前の一対一状態。
 *
 * 会話中に一時保存し、
 * 終了時に復元する。
 */
let returnSoloPortrait = null;

/*
 * 現在、複数人会話を表示中か。
 */
let isTemporaryGroupTalk = false;
let isRestoringSoloPortrait = false;
/*
 * ─────────────────────────────
 * 憑依状態
 * ─────────────────────────────
 *
 * active:
 *   現在、良太郎が憑依されているか。
 *
 * host:
 *   憑依されている人物。
 *   今のところ良太郎固定。
 *
 * imagin:
 *   憑依しているイマジン。
 *
 * outfit:
 *   現在の服装。
 *
 *   normal
 *     良太郎の通常服
 *
 *   imagin_preference
 *     イマジン好みの服
 */
/*
 * 交代会話終了後に、
 * メインへ設定するキャラクター。
 */
let pendingMainCharacterChange = null;
/*
 * 選択肢が閉じたあとに
 * 再生する憑依イベント会話。
 */
let pendingPossessionTalk = null;

/*
 * 憑依会話終了後に実行する処理。
 *
 * type:
 *   "start" 憑依開始
 *   "end"   憑依解除
 */
let pendingPossessionAction = null;
    /*
     * ─────────────────────────────
     * 通常カテゴリ
     * ─────────────────────────────
     *
     * tagsは省略可能です。
     *
     * normal配列なら自動的にnormalタグ、
     * season配列ならseasonタグ、
     * honmaru配列ならhonmaruタグが付きます。
     */

/*
 * 憑依解除演出のあとに再生する会話。
 */
let pendingPostReleaseTalk = null;  
/*
 * 憑依横取り後に再生する会話。
 *
 * 着替え会話とは別管理にする。
 */
let pendingPostStealTalk = null;

/*
 * 着替えに行った良太郎が
 * 戻ってくるまでの待機状態。
 */
let changeClothesReturnState = null;

const TALK_DATA = {
    normal: [       
{
    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal",
            text:
                "モモタロス、さっきからずっとこっちを見てるけど……どうかした？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "べ、別に見てねぇよ！"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "そう？　何か言いたそうな顔をしてたから。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "お前なぁ……俺の顔見て、そんな細けぇことまで分かんのかよ。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "うん。長い付き合いだからね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "……ふん。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal",
            text:
                "それで、本当はどうしたの？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "腹減ったんだよ！　何かねぇのか、何か！"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "やっぱり。さっきから食堂のほうばかり見てたもんね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "最初から分かってたんなら早く言えぇ！"
        }
    ],

    tags: ["normal", "test_multi_portrait"]
},
{
    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "モモ、今日はずいぶん機嫌がいいね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "へへっ、分かるか？"
        },
        {
            speaker: "mio",
            text:
                "うん。顔を見れば分かるよ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "お前まで良太郎みてぇなこと言うな！"
        }
    ],

    tags: [
        "normal",
        "test_momotaros_mio"
    ]
},
{
    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "良太郎くん、今日は何してたの？"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "今日はデンライナーの中を\n少し片づけてたんだ。"
        },
        {
            speaker: "mio",
            text:
                "みんなも手伝ってくれた？"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "うん……手伝ってくれた、\nということにしておこうかな。"
        },
        {
            speaker: "mio",
            text:
                "あんまり手伝ってくれなかったんだね。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "でも、賑やかで楽しかったよ。"
        }
    ],

    tags: [
        "normal",
        "ryotaro_mio"
    ]
},
{
    possessedBy: "momotaros",
    allowHostWhilePossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "ryotaro",
            text:
                "モモタロス、あまり暴れないでね。"
        },
        {
            speaker: "momotaros",
            text:
                "分かってるって！"
        }
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "……おい。\nさっきから俺の顔ばっか見てんじゃねぇ。"
        },
        {
            speaker: "mio",
            text:
                "見ちゃ駄目なの？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "駄目とは言ってねぇけどよ……。\nなんか落ち着かねぇんだよ！"
        },
        {
            speaker: "mio",
            text:
                "格好いいなって思ってただけ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "……だったら、まあ。\n好きなだけ見てろ。"
        }
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "モモ、その角って触ったら分かる？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "分かるに決まってんだろ！\n勝手に触んなよ！"
        },
        {
            speaker: "mio",
            text:
                "じゃあ、触っていい？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "……なんでちゃんと聞くんだよ。"
        },
        {
            speaker: "mio",
            text:
                "駄目？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "一回だけだからな。\n変な触り方すんじゃねぇぞ。"
        }
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "モモの手って、やっぱり大きいね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "そりゃお前の手がちっせぇんだよ。"
        },
        {
            speaker: "mio",
            text:
                "比べてみる？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "なんでそうなるんだよ。"
        },
        {
            speaker: "mio",
            text:
                "ほら。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "……指まで全然届いてねぇじゃねぇか。"
        },
        {
            speaker: "mio",
            text:
                "モモが大きいんだよ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "へへっ。\nまあな！"
        }
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "なあ、澪。\nお前、俺のこと怖くねぇのか？"
        },
        {
            speaker: "mio",
            text:
                "急にどうしたの？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "普通はもっとビビるだろ。\nこんな顔してんだからよ。"
        },
        {
            speaker: "mio",
            text:
                "モモはモモだから、別に怖くないよ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "……そういう言い方、ずりぃんだよ。"
        },
        {
            speaker: "mio",
            text:
                "何が？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "何でもねぇ！"
        }
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "モモって、力が強いのに\nちゃんと加減してくれるよね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "当たり前だろ！\nお前なんか本気で掴んだら壊れちまう。"
        },
        {
            speaker: "mio",
            text:
                "壊れ物みたいに言わないでよ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "似たようなもんだろ。\n細っこいし、ちっせぇし。"
        },
        {
            speaker: "mio",
            text:
                "でも、モモに抱きしめられるの好きだよ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "お、お前なぁ……！\n急にそういうこと言うんじゃねぇ！"
        }
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "imagin_form"
    ]
},
{
    possessedBy: "momotaros",

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "顔は良太郎くんなのに、\nちゃんとモモに見えるの不思議だね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "不思議でも何でもねぇ！\n中身が俺なんだから当然だろ！"
        },
        {
            speaker: "mio",
            text:
                "表情も立ち方も、全然違うもんね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "へへっ。\n見りゃすぐ分かるだろ？"
        },
        {
            speaker: "mio",
            text:
                "うん。間違えないよ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "……ならいい。"
        }
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "m_ryotaro"
    ]
},
{
    possessedBy: "momotaros",

    startDistances: {
        momotaros: "close"
    },

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "モモ、ちょっと近くない？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "そうか？\nいつもこんなもんだろ。"
        },
        {
            speaker: "mio",
            text:
                "普段より顔が近く感じる。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "そりゃこの身体が小せぇからだろ！"
        },
        {
            speaker: "mio",
            text:
                "モモ、照れてる？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "照れてねぇ！\nお前が変なこと言うからだ！"
        }
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "m_ryotaro"
    ]
},
{
    possessedBy: "momotaros",

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "その手、良太郎くんの手なんだよね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "なんだよ。\n触りてぇのか？"
        },
        {
            speaker: "mio",
            text:
                "モモが動かしてると思うと、\nちょっと不思議で。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "今は俺の手みてぇなもんだ。\nほら。"
        },
        {
            speaker: "mio",
            text:
                "握っていいの？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "俺から出してんだから、\nさっさと握れ！"
        }
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "m_ryotaro"
    ]
},
{
    possessedBy: "momotaros",

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "モモ、自分の顔を鏡で見た時って\nどんな感じなの？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "別にどうってことねぇよ。\n俺は俺だからな。"
        },
        {
            speaker: "mio",
            text:
                "良太郎くんの顔なのに？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "顔が誰のだろうが、\n俺が入ってりゃ俺の顔だ！"
        },
        {
            speaker: "mio",
            text:
                "そういうところ、モモらしいね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "当たり前だろ！"
        }
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "m_ryotaro"
    ]
},
{
    possessedBy: "momotaros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "momotaros",

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "どうだ、澪！\nこの服、キマってんだろ！"
        },
        {
            speaker: "mio",
            text:
                "うん、すごくモモっぽい。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "へへっ、分かってんじゃねぇか！"
        },
        {
            speaker: "mio",
            text:
                "でも良太郎くん、あとで困らない？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "細けぇこと気にすんな！\n今カッコよけりゃいいんだよ！"
        },
        {
            speaker: "ryotaro",
            text:
                "僕は気にするよ……。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "良太郎は黙ってろ！"
        }
    ],

    allowHostWhilePossessed: true,

    tags: [
        "normal",
        "momotaros_mio",
        "m_ryotaro",
        "imagin_preference"
    ]
},
{
    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile"
        }
    ],

    pages: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            motion: "tripFall",
            text:
                "澪さ……っ！"
        },
        {
            speaker: "mio",
            text:
                "良太郎くん、大丈夫！？"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            motion: "recover",
            text:
                "だ、大丈夫……。\n何もないところで転んだだけだから……。"
        },
    ],

    tags: [
        "test_trip_fall"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "モモって格好いいよね。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_shy",
            text:
                "えっ……。\nそ、そうかな……。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "なんでお前が照れてんだよ！！"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "えっ！？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "褒められたのは俺だろうが！"
        },
        {
            speaker: "mio",
            text:
                "でも、モモの見た目って良太郎くんのイメージからできてるんでしょ？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "……。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "そう言われると、ちょっと複雑かも。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "複雑にしてんじゃねぇ！！"
        }
    ],

    tags: [
        "normal",
        "ryotaro_momotaros_mio",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            text:
                "良太郎の真似してやる。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "『えっと……ごめんなさい……。』"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "そんなに謝ってないよ……。"
        },
        {
            speaker: "mio",
            text:
                "ちょっと似てる。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "だろ？"
        },
        {
            speaker: "ryotaro",
            text:
                "そこ喜ぶところなのかな……。"
        }
    ],

    tags:[
        "normal",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "モモって、赤が似合うよね。"
        },
        {
            speaker: "momotaros",
            text:
                "だろ！"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "うん。最初から赤かったしね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "そういう話じゃねぇ！！"
        }
    ],

    tags:[
        "normal",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "ryotaro",
            text:
                "モモタロス、今日は静かだね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "寝てた。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "そっか。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "『そっか』で終わらせんな！"
        }
    ],

    tags: [
        "normal",
        "ryotaro_momotaros"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            text:
                "お前、また転ぶんじゃねぇぞ。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "努力はしてるんだけどね……。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "努力でどうにかなる不運じゃねぇだろ！"
        }
    ],

    tags: [
        "normal",
        "ryotaro_momotaros"
    ]
},
{
    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "ウラタロスって、話を聞くの上手だよね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "そう？\n君が話しやすいだけじゃないかな。"
        },
        {
            speaker: "mio",
            text:
                "気付いたらいっぱい話しちゃってるんだ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "それなら成功かな。\n無理に聞き出した覚えはないし。"
        },
        {
            speaker: "mio",
            text:
                "なんだか安心する。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal",
            text:
                "ふふっ。\nそういう言葉には弱いんだよね、僕。"
        }
    ],

    tags: [
        "normal",
        "urataros_mio"
    ]
},
{
    participants: [
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "先輩って、待つの苦手だよね。"
        },
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry",
            text:
                "待ってられっか！"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "うん、知ってる。"
        }
    ]
},
{
    participants: [
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_normal",
            text:
                "お前、また笑ってやがるな。"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "先輩見てると飽きないから。"
        },
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry",
            text:
                "見世物じゃねぇ！"
        }
    ]
},
{
    participants: [
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_normal",
            text:
                "おい、暇だな。"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_normal",
            text:
                "暇って口にした瞬間、暇になるんだよ。"
        },
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry",
            text:
                "意味わかんねぇこと言うな！"
        }
    ]
},
{
    participants: [
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_normal",
            text:
                "お前、何考えてるかわかんねぇ時あるよな。"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "全部分かりやすかったら、つまらないでしょ？"
        },
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry",
            text:
                "回りくどいだけだ！"
        }
    ]
},
{
    participants: [
        {
            speaker: "ryotaro",
            expression: "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "ryotaro",
            expression: "portrait_ryotaro_base_ryotaro_normal",
            text:
                "ウラタロスって、\n結構話すよね。"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "話さないと退屈じゃない？"
        },
        {
            speaker: "ryotaro",
            expression: "portrait_ryotaro_base_ryotaro_smile",
            text:
                "それはそうかも。"
        }
    ]
},
{
    participants: [
        {
            speaker: "ryotaro",
            expression: "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "良太郎って、すぐ人を信じるよね。"
        },
        {
            speaker: "ryotaro",
            expression: "portrait_ryotaro_base_ryotaro_worried",
            text:
                "そうかな……？"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "うん。\nだから放っておけないんだ。"
        }
    ]
},
{
    participants: [
        {
            speaker: "ryotaro",
            expression: "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "ryotaro",
            expression: "portrait_ryotaro_base_ryotaro_worried",
            text:
                "ウラタロスって、\n何でも知ってるみたいに話すよね。"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "知らないこともあるよ？"
        },
        {
            speaker: "ryotaro",
            expression: "portrait_ryotaro_base_ryotaro_normal",
            text:
                "例えば？"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_normal",
            text:
                "……秘密。"
        },
        {
            speaker: "ryotaro",
            expression: "portrait_ryotaro_base_ryotaro_worried",
            text:
                "結局教えてくれないんだね……。"
        }
    ]
},
{
    participants: [
        {
            speaker: "ryotaro",
            expression: "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "ryotaro",
            expression: "portrait_ryotaro_base_ryotaro_worried",
            text:
                "たまに、ウラタロスが\n本気なのか冗談なのか分からなくなるよ。"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "それは秘密。"
        },
        {
            speaker: "ryotaro",
            expression: "portrait_ryotaro_base_ryotaro_worried",
            text:
                "また秘密なんだ……。"
        }
    ]
},
{
    participants: [
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "澪ちゃん、今日も可愛いね。"
        },
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry",
            text:
                "おい亀ぇ！！"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "なに、先輩。"
        },
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry",
            text:
                "人ん前でサラッと口説いてんじゃねぇ！！"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "褒めただけだよ？"
        },
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry",
            text:
                "それが口説いてんだろうが！！"
        }
    ]
},
{
    participants: [
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "澪ちゃん、僕と出掛けない？"
        },
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry",
            text:
                "勝手に誘ってんじゃねぇ！！"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_normal",
            text:
                "先輩には言ってないよ？"
        },
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry",
            text:
                "余計悪ぃわ！！"
        }
    ]
},
{
    participants: [
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry",
            text:
                "お前なぁ！\n澪にベタベタすんな！"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "嫉妬？"
        },
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry",
            text:
                "ちげぇ！！"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "即答だったね。"
        }
    ]
},
{
    participants: [
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "澪ちゃんの笑顔、素敵だね。"
        },
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry",
            text:
                "……。"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "先輩？"
        },
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry",
            text:
                "……お前なぁ。"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "うん。"
        },
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry",
            text:
                "そういうの、軽々しく言うんじゃねぇ！"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "本当にそう思ったから言っただけだけど？"
        },
        {
            speaker: "momotaros",
            expression: "portrait_momotaros_base_default_angry",
            text:
                "だからタチ悪ぃんだよ！！"
        }
    ]
},
{
    participants: [
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "澪ちゃん。"
        },
        {
            speaker: "mio",
            text:
                "なに？"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "今、暇だったりする？"
        },
        {
            speaker: "mio",
            text:
                "話すくらいなら。"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "それなら十分。"
        }
    ]
},
{
    participants: [
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "今日も綺麗だね。"
        },
        {
            speaker: "mio",
            text:
                "ありがとう。"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_normal",
            text:
                "……それだけ？"
        },
        {
            speaker: "mio",
            text:
                "他に何かあるの？"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "いや、ないけど。"
        }
    ]
},
{
    participants: [
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "もう少し近くで話さない？"
        },
        {
            speaker: "mio",
            text:
                "今でも聞こえてるけど。"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_normal",
            text:
                "そこは照れるところじゃない？"
        },
        {
            speaker: "mio",
            text:
                "なんで？"
        }
    ]
},
{
    participants: [
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "澪ちゃんってさ。"
        },
        {
            speaker: "mio",
            text:
                "うん。"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "結構、僕のタイプなんだよね。"
        },
        {
            speaker: "mio",
            text:
                "そうなんだ。"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "……さて、どうだろうね。"
        }
    ]
},
{
    participants: [
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_normal",
            text:
                "澪ちゃん。"
        },
        {
            speaker: "mio",
            text:
                "なに？"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "もし僕が本気だって言ったら、信じる？"
        },
        {
            speaker: "mio",
            text:
                "言い方次第かな。"
        },
        {
            speaker: "urataros",
            expression: "portrait_urataros_base_default_smile",
            text:
                "なるほど。\nじゃあ、まだ早いか。"
        }
    ]
},
{
participants: [
{
speaker: "urataros",
expression:
"portrait_urataros_base_default_smile"
},
{
speaker: "mio"
}
],

pages: [
    {
        speaker: "urataros",
        expression:
            "portrait_urataros_base_default_smile",
        text:
            "ねえ、澪ちゃん。\nちょっとこっち見て？"
    },
    {
        speaker: "mio",
        text:
            "なに？"
    },
    {
        speaker: "urataros",
        expression:
            "portrait_urataros_base_default_smile",
        distance: "close",
        text:
            "……うん。\nやっぱり近くで見るほうが可愛いね。"
    },
    {
        speaker: "mio",
        text:
            "それ言うために近づいたの？"
    },
    {
        speaker: "urataros",
        expression:
            "portrait_urataros_base_default_wrysmile",
        text:
            "ふふっ。\n警戒されちゃった？"
    },
    {
        speaker: "mio",
        text:
            "ウラタロスだからね。"
    },
    {
        speaker: "urataros",
        expression:
            "portrait_urataros_base_default_smile",
        text:
            "ひどいなぁ。\n僕はただ、君の顔がよく見たかっただけなのに。"
    }
],

tags: [
    "normal",
    "urataros_mio"
]

},
{
    possessedBy: "urataros",

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "ウラタロスって、良太郎くんの身体でも\n動き方が全然違うよね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "そう？\n僕としては普通にしてるだけなんだけど。"
        },
        {
            speaker: "mio",
            text:
                "立ってるだけでもウラタロスって分かる。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "それは褒められてるのかな。"
        },
        {
            speaker: "mio",
            text:
                "たぶん。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "じゃあ、褒められたことにしておこうかな♪"
        }
    ],

    tags: [
        "normal",
        "urataros_mio",
        "u_ryotaro"
    ]
},
{
    possessedBy: "urataros",

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "ウラタロス、鏡見て何してるの？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "ちょっと確認。"
        },
        {
            speaker: "mio",
            text:
                "何の？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "今日もちゃんと格好いいかなって。"
        },
        {
            speaker: "mio",
            text:
                "自分で確認するんだ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "大事でしょ？\n僕にも色々あるんだよ。"
        }
    ],

    tags: [
        "normal",
        "urataros_mio",
        "u_ryotaro"
    ]
},
{
    possessedBy: "urataros",
    allowHostWhilePossessed: true,

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "やっぱりこの顔、悪くないよね。"
        },
        {
            speaker: "ryotaro",
            text:
                "ウラタロス……。\n一応、それ僕の顔なんだけど……。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "だから褒めてるんじゃない。"
        },
        {
            speaker: "ryotaro",
            text:
                "そういう問題なのかな……。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "いいじゃない。\n減るものでもないし。"
        },
        {
            speaker: "ryotaro",
            text:
                "僕の顔だからね……？"
        }
    ],

    tags: [
        "normal",
        "urataros_ryotaro",
        "u_ryotaro"
    ]
},
{
    possessedBy: "urataros",

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "澪ちゃん、さっきから僕のこと見てない？"
        },
        {
            speaker: "mio",
            text:
                "見てたよ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_surprised",
            text:
                "……ずいぶん素直だね。"
        },
        {
            speaker: "mio",
            text:
                "だって本当に見てたし。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "じゃあ、もっと見てていいよ？"
        },
        {
            speaker: "mio",
            text:
                "いいの？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "君にならね♪"
        }
    ],

    tags: [
        "normal",
        "urataros_mio",
        "u_ryotaro"
    ]
},
{
    possessedBy: "urataros",

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "ウラタロスって、良太郎くんの姿でも\nちゃんと格好いいよね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_shy",
            text:
                "……そんなこと言われると、\n僕でも照れるなぁ。"
        },
        {
            speaker: "mio",
            text:
                "本当に照れてる？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_shy",
            text:
                "ひどいなぁ。\nこんなに照れてるのに。"
        },
        {
            speaker: "mio",
            text:
                "ウラタロスだからなぁ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "信用ないね、僕。"
        }
    ],

    tags: [
        "normal",
        "urataros_mio",
        "u_ryotaro"
    ]
},
{
    possessedBy: "urataros",

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "お前、その顔でニヤニヤすんな！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "いいじゃない。\n似合ってるでしょ？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "自分の顔みてぇに言うな！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "今は僕が使ってるんだから、\n似たようなものでしょ？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "似てねぇ！！"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros",
        "u_ryotaro"
    ]
},
{
    possessedBy: "urataros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "urataros",        

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "その服、やっぱりウラタロスっぽいね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "でしょ？\nせっかく着るなら、似合うものを選ばないとね。"
        },
        {
            speaker: "mio",
            text:
                "ちゃんと自分に似合うの分かってるんだ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "それくらいはね。\n見せ方って大事だから。"
        },
        {
            speaker: "mio",
            text:
                "誰に見せるの？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "今、僕を見てる人かな♪"
        }
    ],

    tags: [
        "normal",
        "urataros_mio",
        "u_ryotaro",
        "imagin_preference"
    ]
},
{
    possessedBy: "urataros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "urataros",

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "そのペンダント、綺麗だね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "気になる？"
        },
        {
            speaker: "mio",
            text:
                "うん。ちょっと見せて。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            distance: "close",
            text:
                "じゃあ、近くで見る？"
        },
        {
            speaker: "mio",
            text:
                "……近すぎない？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "ペンダントを見るんでしょ？"
        },
        {
            speaker: "mio",
            text:
                "絶対わざとだ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "さて、どうだろうね。"
        }
    ],

    tags: [
        "normal",
        "urataros_mio",
        "u_ryotaro",
        "imagin_preference"
    ]
},
{
    possessedBy: "urataros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "urataros",

    allowHostWhilePossessed: true,

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "うん。\nやっぱりこっちのほうが落ち着くな。"
        },
        {
            speaker: "ryotaro",
            text:
                "ウラタロスが落ち着いても、\n僕はちょっと落ち着かないんだけど……。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "そんなに悪くないでしょ？"
        },
        {
            speaker: "ryotaro",
            text:
                "悪いっていうか……。\n僕が着る服じゃない気がする。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "今は僕が着てるんだから問題ないよ。"
        },
        {
            speaker: "ryotaro",
            text:
                "身体は僕なんだけどな……。"
        }
    ],

    tags: [
        "normal",
        "urataros_ryotaro",
        "u_ryotaro",
        "imagin_preference"
    ]
},
{
    possessedBy: "urataros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "urataros",

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "服も眼鏡も、全部合わせて選んでるんだよね？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "もちろん。\n一つだけ良くても意味ないでしょ？"
        },
        {
            speaker: "mio",
            text:
                "結構こだわるんだね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "結構、は余計かな。"
        },
        {
            speaker: "mio",
            text:
                "すごくこだわるんだね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "うん。それなら正解♪"
        }
    ],

    tags: [
        "normal",
        "urataros_mio",
        "u_ryotaro",
        "imagin_preference"
    ]
},
{
    possessedBy: "urataros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "urataros",        

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "似合ってるよ、その服。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_shy",
            text:
                "……そんなに真っ直ぐ言われると、\nちょっと困るなぁ。"
        },
        {
            speaker: "mio",
            text:
                "珍しい。照れてる？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_shy",
            text:
                "そう見える？"
        },
        {
            speaker: "mio",
            text:
                "見える。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "じゃあ、そういうことにしておこうかな。"
        }
    ],

    tags: [
        "normal",
        "urataros_mio",
        "u_ryotaro",
        "imagin_preference"
    ]
},
{
    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "澪ちゃん、今日も可愛いね。"
        },
        {
            speaker: "mio",
            text:
                "ありがとう。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "うんうん。\n素直な子は好きだなぁ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "……おい、亀。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "なに、先輩？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "さっきから何ニヤニヤしてやがる。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "別に？\n先輩がいつ怒るかなって思ってただけ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "最初から俺で遊んでんじゃねぇ！！"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_mio"
    ]
},
{
    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "ねえ先輩。\n澪ちゃん、ちょっと借りてもいい？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "はぁ！？\nなんで俺に聞くんだよ！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "だって先輩に聞いたほうが早そうだから。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "澪は物じゃねぇ！！"
        },
        {
            speaker: "mio",
            text:
                "それはそう。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "ふふっ。\nそこはちゃんと否定するんだね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "何が言いてぇんだ亀ぇ！！"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_mio"
    ]
},
{
    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "先輩って分かりやすいよね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "あぁ？\n何がだよ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "澪ちゃんが誰かと話してると、\nすぐそっち見るでしょ？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "見てねぇよ！"
        },
        {
            speaker: "mio",
            text:
                "見てるよ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "お前まで乗っかんな！！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "ほら。\nそういうところ。"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_mio"
    ]
},
{
    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "先輩さぁ。"
        },
        {
            speaker: "momotaros",
            text:
                "なんだよ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "僕が澪ちゃんのこと、\n本気で好きだったらどうする？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "はぁ！？"
        },
        {
            speaker: "mio",
            text:
                "急に何の話？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "ほら、先輩の反応見てみたくて。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "俺で遊ぶために澪を使うな！！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "ちゃんと怒るところ、そこなんだ。"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_mio"
    ]
},
{
    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "ウラタロス、何か飲む？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "じゃあ、澪ちゃんと同じので。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "なんで同じのにすんだよ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "お揃いっていいでしょ？"
        },
        {
            speaker: "mio",
            text:
                "別に飲み物くらいなら。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "だってさ、先輩。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "いちいち俺に言うな！！"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_mio"
    ]
},
{
    possessedBy: "momotaros",

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "先輩って面白いよね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "あぁ？\n何がだよ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "顔は良太郎なのに、\n澪ちゃんのことになるとすぐ分かる。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "何が分かるってんだよ！！"
        },
        {
            speaker: "mio",
            text:
                "私にも分かるよ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "澪まで言うな！！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "ほら。\nやっぱり分かりやすい。"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_mio",
        "m_ryotaro"
    ]
},
{
    possessedBy: "momotaros",

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "モモ、顔赤くない？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "赤くねぇ！！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "へえ。\n良太郎の顔でもそんな顔するんだ、先輩。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "亀ぇ！！\n余計なこと言うんじゃねぇ！！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "僕、感想言っただけなんだけどなぁ。"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_mio",
        "m_ryotaro"
    ]
},
{
    possessedBy: "momotaros",

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "ねえ澪ちゃん。\n今の先輩と、いつもの先輩ならどっちが好み？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "おい！！\n変なこと聞くな！"
        },
        {
            speaker: "mio",
            text:
                "どっちもモモでしょ？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "そう来るんだ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "……だったら最初から聞くなよ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "先輩の反応が見たかっただけ♪"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "やっぱり俺で遊んでんじゃねぇか！！"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_mio",
        "m_ryotaro"
    ]
},
{
    possessedBy: "momotaros",

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "おい亀。\nさっきからニヤニヤすんな。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "先輩、その顔で睨んでも\nいつもほど怖くないよ？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "うるせぇ！！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "ほら。\n怒り方はいつも通りなのにね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "喧嘩売ってんのか！！"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros",
        "m_ryotaro"
    ]
},
{
    possessedBy: "momotaros",
    allowHostWhilePossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "先輩、良太郎の顔で\nそんなに怒らないでよ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "俺がどういう顔しようが勝手だろ！"
        },
        {
            speaker: "ryotaro",
            text:
                "僕としては、少し気になるかな……。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "良太郎まで言うな！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "本人から苦情きちゃったね、先輩。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "お前が煽るからだろうが！！"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_ryotaro",
        "m_ryotaro"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "おい亀！\nさっきから俺の真似すんな！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "してないよ。\n先輩の真似なんて難しくないし。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "それがムカつくっつってんだよ！！"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "二人とも、喧嘩しないでよ……。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "僕はしてないよ？\n先輩が勝手に怒ってるだけ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "てめぇ……！！"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "ほら、また……。"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_ryotaro"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "ねえ澪ちゃん。\n今度、僕と二人でどこか行かない？"
        },
        {
            speaker: "mio",
            text:
                "二人で？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "おい亀！！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "ほら。\nまだ何も言ってないのに釣れた。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "最初から俺を釣ってんじゃねぇ！！"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "ウラタロスも、わざと怒らせないでよ……。"
        },
        {
            speaker: "mio",
            text:
                "私、餌だったの？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "そんな言い方しないでよ。\n澪ちゃんを餌になんてしないって♪"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "じゃあ何なんだよ！！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "秘密。"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_ryotaro_mio"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "良太郎！\n今日は俺が行くからな！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "えー。\n僕でいいじゃない。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "よくねぇ！\n昨日お前だっただろうが！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "そうだったっけ？"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "あの……。\n僕の身体なんだけど……。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "分かってるって！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "もちろん分かってるよ。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "本当に分かってるのかな……。"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_ryotaro"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "良太郎くん、これありがとう。\n助かったよ。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "ううん。\n僕も役に立ててよかった。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "良太郎、澪ちゃんに褒めてもらえてよかったね。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_shy",
            text:
                "そ、そういう言い方しないでよ……。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "……なんだよ。"
        },
        {
            speaker: "mio",
            text:
                "モモ？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "なんでもねぇ！！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "先輩も褒めてほしいんじゃない？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "ちげぇ！！"
        },
        {
            speaker: "mio",
            text:
                "モモもいつも頼りにしてるよ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "……お、おう。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "よかったね、先輩。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "お前は黙ってろ！！"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_ryotaro_mio"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "先輩と澪ちゃんって、\nもう付き合ってるみたいだよね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "はぁ！？\n急に何言い出すんだ亀！！"
        },
        {
            speaker: "mio",
            text:
                "そう見える？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "見える見える。\n特に先輩がね♪"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "俺のどこ見て言ってんだ！！"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "……モモタロス、\n結構分かりやすいと思うよ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "良太郎まで乗っかるな！！"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_ryotaro_mio",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "モモ、これ食べる？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "おう！\nもらう！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "へえ。\n先輩には最初に聞くんだ。"
        },
        {
            speaker: "mio",
            text:
                "だってモモ、すぐお腹空いたって言うから。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "余計なこと言うな！"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "でも、ちゃんと覚えてもらえてよかったね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "……うるせぇ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "嬉しいんだね、先輩。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "黙れ亀ぇ！！"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_ryotaro_mio",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "先輩ってさ、\n澪ちゃんに話す時だけちょっと声違うよね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "違わねぇよ！！"
        },
        {
            speaker: "mio",
            text:
                "違うの？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "少しだけ優しくなる。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "なってねぇ！！"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "……僕も、ちょっとそう思う。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "だから良太郎まで言うなって！！"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_ryotaro_mio",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "澪ちゃんって、\n気付くといつも先輩の近くにいるよね。"
        },
        {
            speaker: "mio",
            text:
                "そうかな？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "変なこと気にすんな！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "先輩が一番気にしてるじゃない。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "気にしてねぇ！！"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "でも、自然にそうなってるなら\nいいんじゃないかな。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "……お前まで何なんだよ。"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_ryotaro_mio",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "先輩って、本当にすぐ怒るよね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "誰のせいだと思ってんだ！！"
        },
        {
            speaker: "mio",
            text:
                "でも、モモって怒ってても\nちゃんと周り見てるよ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "……澪？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "あれ。\n僕、先輩をからかってたはずなんだけど。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "澪さんには、ちゃんと分かってるんだね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "……もういい！\nこの話終わり！！"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_ryotaro_mio",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal",
            text:
                "ウラタロスって、\n人が嘘ついてるか分かるの？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "どうだろうね。\n分かる時もあるよ。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "……今の答えも嘘だったりする？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "さあ？"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "やっぱり分からないなぁ……。"
        }
    ],

    tags: [
        "normal",
        "ryotaro_urataros",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal",
            text:
                "僕って、そんなに騙しやすい？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "うん。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "即答なんだ……。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "でも、疑うことを知らないって\n悪いことばかりじゃないよ。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal",
            text:
                "……それ、褒めてる？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "もちろん♪"
        }
    ],

    tags: [
        "normal",
        "ryotaro_urataros",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal",
            text:
                "ウラタロスって、\nいつも余裕ありそうだよね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "そう見えるなら成功かな。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "成功？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "余裕がない顔なんて、\nあんまり見せたくないでしょ？"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal",
            text:
                "……ウラタロスでも、\nそういう時あるんだね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "さて、どうだろうね。"
        }
    ],

    tags: [
        "normal",
        "ryotaro_urataros",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "良太郎って、\n本当に誰にでも優しいよね。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "そうかな？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "うん。\nそのうち悪い人に利用されそう。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal",
            text:
                "……ウラタロスが言うと、\nちょっと説得力あるね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "それ、どういう意味？"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "そのままの意味。"
        }
    ],

    tags: [
        "normal",
        "ryotaro_urataros",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal",
            text:
                "ウラタロスって、\n僕と話してる時は少し違うよね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "違う？"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal",
            text:
                "うん。\nちょっとだけ普通に話してる感じがする。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "僕はいつも普通だけど？"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "そういうことにしておくよ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "ふふっ。\n良太郎も言うようになったね。"
        }
    ],

    tags: [
        "normal",
        "ryotaro_urataros",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal",
            text:
                "ウラタロスって、\nどうしてすぐ女の人に声かけるの？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "気になったから話しかける。\nそれだけだよ。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "毎回気になるの？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "良太郎、そこ掘り下げるんだ。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal",
            text:
                "ちょっと気になって。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "知らないほうがいいこともあるよ♪"
        }
    ],

    tags: [
        "normal",
        "ryotaro_urataros",
        "imagin_form"
    ]
},
{
    onlyWhenUnpossessed: true,

    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal",
            text:
                "ウラタロスって、\n本当に嫌な時は笑わなくなるよね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal",
            text:
                "……へえ。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_worried",
            text:
                "違った？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "いや。\n良太郎って、意外とよく見てるんだなって。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "一緒にいる時間、長いからね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "……そういうところ、ずるいよね。"
        }
    ],

    tags: [
        "normal",
        "ryotaro_urataros",
        "imagin_form"
    ]
},
{
    possessedBy: "momotaros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "urataros",

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "……やっぱ落ち着かねぇ。"
        },
        {
            speaker: "mio",
            text:
                "服？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "そうだよ！\nなんで俺が亀みてぇな格好してんだ！"
        },
        {
            speaker: "mio",
            text:
                "似合ってるよ？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "似合う似合わねぇの話じゃねぇ！"
        }
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "m_ryotaro",
        "cross_outfit"
    ]
},
{
    possessedBy: "momotaros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "urataros",

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "おい亀。\nなんでこんな服選んだんだよ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "似合うと思ったから。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "俺にじゃねぇだろ！！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "でも今着てるの、先輩だよ？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "だからムカつくんだよ！！"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros",
        "m_ryotaro",
        "cross_outfit"
    ]
},
{
    possessedBy: "momotaros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "urataros",

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "ったく、こんな服早く着替えてぇ。"
        },
        {
            speaker: "mio",
            text:
                "でも私は好きだよ、その格好。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "……。"
        },
        {
            speaker: "mio",
            text:
                "モモ？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "……別に、今すぐじゃなくてもいい。"
        }
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "m_ryotaro",
        "cross_outfit"
    ]
},
{
    possessedBy: "urataros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "momotaros",

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "ウラタロス、その服でも普通に似合うね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "そう？\n着る人が違えば見え方も変わるでしょ。"
        },
        {
            speaker: "mio",
            text:
                "モモが聞いたら怒りそう。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "聞かせてみる？"
        }
    ],

    tags: [
        "normal",
        "urataros_mio",
        "u_ryotaro",
        "cross_outfit"
    ]
},
{
    possessedBy: "urataros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "momotaros",

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "服はモモっぽいのに、\nちゃんとウラタロスに見えるね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "服だけで僕らしさまで消せないよ。"
        },
        {
            speaker: "mio",
            text:
                "自信あるね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "澪ちゃんがそう見てくれてるならね♪"
        }
    ],

    tags: [
        "normal",
        "urataros_mio",
        "u_ryotaro",
        "cross_outfit"
    ]
},
{
    possessedBy: "urataros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "momotaros",

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "先輩、どう？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "何がだよ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "この服。\n僕が着ても似合うでしょ？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "返せ！！"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "服は良太郎のだけどね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "そういう話じゃねぇ！！"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros",
        "u_ryotaro",
        "cross_outfit"
    ]
},
{
    possessedBy: "urataros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "momotaros",

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "なんか、モモが着てる時より……"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "より何だ！？"
        },
        {
            speaker: "mio",
            text:
                "……違って見える。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "澪ちゃん、今言い直したね？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "何言おうとしたんだ！！"
        },
        {
            speaker: "mio",
            text:
                "言わない。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_wrysmile",
            text:
                "ふふっ。\nそのほうが面白いかも。"
        }
    ],

    tags: [
        "normal",
        "momotaros_urataros_mio",
        "u_ryotaro",
        "cross_outfit"
    ]
},
{
    possessedBy: "momotaros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "momotaros",

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "……なあ、澪。"
        },
        {
            speaker: "mio",
            text:
                "なに？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            distance: "close",
            text:
                "こうしてっと、\nいつもより顔近ぇな。"
        },
        {
            speaker: "mio",
            text:
                "モモが近づいたんでしょ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "……まあ、そうだけどよ。"
        },
        {
            speaker: "mio",
            text:
                "嫌じゃないよ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "……そういうこと、\n簡単に言うんじゃねぇ。"
        }
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "m_ryotaro",
        "imagin_preference"
    ]
},
{
    possessedBy: "momotaros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "momotaros",

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "モモ？\nどうしたの？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            distance: "close",
            text:
                "……いや。"
        },
        {
            speaker: "mio",
            text:
                "何かついてる？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_worried",
            text:
                "そうじゃねぇ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "……今の俺の手、\n良太郎のだからな。"
        },
        {
            speaker: "mio",
            text:
                "うん。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "だから……まあ、いい。"
        },
        {
            speaker: "mio",
            text:
                "モモって、そういうところ真面目だよね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "うるせぇ！"
        }
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "m_ryotaro",
        "imagin_preference"
    ]
},
{
    possessedBy: "momotaros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "momotaros",

    startDistances: {
        momotaros: "close"
    },

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "……近ぇよ。"
        },
        {
            speaker: "mio",
            text:
                "モモがいつもより小さいから。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "この身体がだろ！\n俺が縮んだみてぇに言うな！"
        },
        {
            speaker: "mio",
            text:
                "でも、こうしてると\n目の高さ近いね。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "……。"
        },
        {
            speaker: "mio",
            text:
                "モモ？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "だから近ぇっつってんだろ……。"
        }
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "m_ryotaro",
        "imagin_preference"
    ]
},
{
    possessedBy: "momotaros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "momotaros",

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            distance: "close",
            text:
                "……。"
        },
        {
            speaker: "mio",
            text:
                "モモ？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "何でもねぇ。"
        },
        {
            speaker: "mio",
            text:
                "そう？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_worried",
            text:
                "……ったく。"
        },
        {
            speaker: "mio",
            text:
                "何？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            distance: "normal",
            text:
                "何でもねぇって言ってんだろ！"
        }      
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "m_ryotaro",
        "imagin_preference"
    ]
},
{
    possessedBy: "momotaros",

    possessionOutfit:
        "imagin_preference",

    possessionOutfitOwner:
        "momotaros",

    startDistances: {
        momotaros: "close"
    },

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "mio"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "……やっぱり不思議。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "何がだよ。"
        },
        {
            speaker: "mio",
            text:
                "触ると良太郎くんの顔なのに、\nちゃんとモモなんだなって。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "お、お前……！"
        },
        {
            speaker: "mio",
            text:
                "嫌だった？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "……嫌とは言ってねぇ。"
        },
        {
            speaker: "mio",
            text:
                "じゃあ、もう少し。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angryshy",
            text:
                "調子乗んな……。"
        }
    ],

    tags: [
        "normal",
        "momotaros_mio",
        "m_ryotaro",
        "imagin_preference"
    ]
},

    /*
     *↑通常会話追加ここまで↑
     */
    ],

    season: [],
    honmaru: [],
    time: []
};
    /*
     * ─────────────────────────────
     * 時間帯別の来訪挨拶
     * ─────────────────────────────
     *
     * ゲーム開始時に表示する挨拶。
     * 同じ時間帯に複数登録すると、
     * その中からランダムで選ばれる。
     */

    const GREETING_DATA = {
        morning: [
            {
                speaker: "ryotaro",

                expression:
                    "portrait_ryotaro_base_ryotaro_normal",

                text:
                    "おはよう、澪さん。\n今日は早いんだね。"
            },

            {
                speaker: "momotaros",

                expression:
                    "portrait_momotaros_base_default_normal",

                text:
                    "よう、澪！\n朝から元気そうじゃねぇか！"
            },
            {
    initialPossession: {
        imagin: "momotaros",
        outfit: "imagin_preference"
    },

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "よう、澪！\n朝から来るなんて気合い入ってんな！"
        },
        {
            speaker: "ryotaro",
            text:
                "モモタロス……。\n朝からその服なの？"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "朝だからこそキメんだろ！\n一日の始まりは格好からだ！"
        }
    ]
},
{
    speaker: "urataros",

    expression:
        "portrait_urataros_base_default_smile",

    text:
        "おはよう、澪ちゃん。\n朝から君に会えるなんて嬉しいな。"
},
{
    initialPossession: {
        imagin: "urataros",
        outfit: "imagin_preference"
    },

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "おはよう、澪ちゃん。\n朝一番に僕を選んでくれたの？"
        },
        {
            speaker: "ryotaro",
            text:
                "ウラタロスが先に出てただけだよね……。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "細かいことはいいじゃない。\n会えたことに変わりはないんだから。"
        }
    ]
},

        ],

        day: [
            {
                speaker: "ryotaro",

                expression:
                    "portrait_ryotaro_base_ryotaro_normal",

                text:
                    "こんにちは、澪さん。\nゆっくりしていってね。"
            },

            {
                speaker: "momotaros",

                expression:
                    "portrait_momotaros_base_default_normal",

                text:
                    "おっ、来たな澪！\n今日は何して遊ぶんだ？"
            },
            {
    initialPossession: {
        imagin: "momotaros",
        outfit: "imagin_preference"
    },

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "おっ、澪！\nちょうど暇してたところだ！"
        },
        {
            speaker: "ryotaro",
            text:
                "暇だからって、\n勝手に着替えないでよ……。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "いいじゃねぇか！\n昼間っからバッチリキマってんだろ？"
        }
    ]
},
{
    speaker: "urataros",

    expression:
        "portrait_urataros_base_default_smile",

    text:
        "こんにちは、澪ちゃん。\nちょうど退屈してたところなんだ。"
},
{
    initialPossession: {
        imagin: "urataros",
        outfit: "imagin_preference"
    },

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "やあ、澪ちゃん。\nいいところに来たね。"
        },
        {
            speaker: "ryotaro",
            text:
                "ウラタロス、僕の身体で\n何をするつもりなの……？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "ただ澪ちゃんと話すだけだよ。\n良太郎は心配性だなあ。"
        }
    ]
}
        ],

        evening: [
            {
                speaker: "ryotaro",

                expression:
                    "portrait_ryotaro_base_ryotaro_normal",

                text:
                    "こんばんは、澪さん。\n今日も一日お疲れさま。"
            },

            {
                speaker: "momotaros",

                expression:
                    "portrait_momotaros_base_default_normal",

                text:
                    "よう、澪。\nこんな時間まで何してたんだ？"
            },
            {
    initialPossession: {
        imagin: "momotaros",
        outfit: "imagin_preference"
    },

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "よう、澪！\n今日も一日お疲れさん！"
        },
        {
            speaker: "ryotaro",
            text:
                "モモタロスにそう言われると、\nなんだか不思議だね……。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "なんだよその言い方！\n俺だって労うくらいするっつーの！"
        }
    ]
},
{
    speaker: "urataros",

    expression:
        "portrait_urataros_base_default_smile",

    text:
        "おかえり、澪ちゃん。\n今日も一日お疲れさま。"
},
{
    initialPossession: {
        imagin: "urataros",
        outfit: "imagin_preference"
    },

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "おかえり、澪ちゃん。\n疲れてるなら、僕が癒してあげようか？"
        },
        {
            speaker: "ryotaro",
            text:
                "ウラタロス、その言い方は\nちょっと怪しいよ……。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "普通に労ってるだけなのに。\n信用がないなあ。"
        }
    ]
}
        ],

        night: [
            {
                speaker: "ryotaro",

                expression:
                    "portrait_ryotaro_base_ryotaro_normal",

                text:
                    "こんばんは、澪さん。\nまだ少し起きてるの？"
            },

            {
                speaker: "momotaros",

                expression:
                    "portrait_momotaros_base_default_normal",

                text:
                    "こんな時間に来るなんて、\nお前も物好きだな。"
                },
                {
        initialPossession: {
            imagin: "momotaros",
            outfit: "imagin_preference"
        },

        participants: [
            {
                speaker: "momotaros",
                expression:
                    "portrait_momotaros_base_default_normal"
            }
        ],

        pages: [
            {
                speaker: "momotaros",
                expression:
                    "portrait_momotaros_base_default_normal",
                text:
                    "よう、澪！\nまだ起きてたのか！"
            },
            {
                speaker: "ryotaro",
                text:
                    "モモタロス……。\nまた勝手に服まで変えたの？"
            },
            {
                speaker: "momotaros",
                expression:
                    "portrait_momotaros_base_default_normal",
                text:
                    "いいじゃねぇか！\nこっちのほうがキマってんだろ？"
            }
        ]
    },
    {
    speaker: "urataros",

    expression:
        "portrait_urataros_base_default_smile",

    text:
        "こんばんは、澪ちゃん。\n今夜はゆっくり話せそうだね。"
},
{
    initialPossession: {
        imagin: "urataros",
        outfit: "imagin_preference"
    },

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "こんばんは、澪ちゃん。\nこんな時間に僕に会いに来るなんて……。"
        },
        {
            speaker: "ryotaro",
            text:
                "ウラタロス、変な意味にしないでよ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "まだ何も言ってないよ？\n良太郎は想像力が豊かだね。"
        }
    ]
}
    
],

        midnight: [
            {
                speaker: "ryotaro",

                expression:
                    "portrait_ryotaro_base_ryotaro_normal",

                text:
                    "澪さん、まだ起きてたんだ。\n眠れないの？"
            },

            {
                speaker: "momotaros",

                expression:
                    "portrait_momotaros_base_default_normal",

                text:
                    "おい澪、もう夜中だぞ。\nちゃんと寝てんのか？"
            },
            
{
    initialPossession: {
        imagin: "momotaros",
        outfit: "imagin_preference"
    },

    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "おい澪、こんな時間まで何してんだ！\nもう夜中だぞ！"
        },
        {
            speaker: "ryotaro",
            text:
                "モモタロスも起きてるけどね……。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "俺はいいんだよ！\nお前はちゃんと寝ろ！"
        }
    ]
},
{
    speaker: "urataros",

    expression:
        "portrait_urataros_base_default_smile",

    text:
        "まだ起きてたんだ、澪ちゃん。\n眠れないなら少し付き合うよ。"
},
{
    initialPossession: {
        imagin: "urataros",
        outfit: "imagin_preference"
    },

    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile"
        }
    ],

    pages: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "こんばんは、澪ちゃん。\nこんな夜更けに二人きりだね。"
        },
        {
            speaker: "ryotaro",
            text:
                "僕もいるから、二人きりじゃないよ……。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "そうだったね。\n今だけ少し静かにしててくれる？"
        },
        {
            speaker: "ryotaro",
            text:
                "してないよ。"
        }
    ]
}
           
        ]
    };
    
    /*
 * ─────────────────────────────
 * メインキャラクター交代会話
 * ─────────────────────────────
 *
 * 優先順位：
 *
 * 1. 現在キャラ_to_次キャラ
 * 2. to_次キャラ
 * 3. default
 */
const CHARACTER_CHANGE_TALK_DATA = {

    /*
     * 良太郎 → モモタロス
     */
    ryotaro_to_momotaros: [
        {
            participants: [
                {
                    speaker: "ryotaro",
                    expression:
                        "portrait_ryotaro_base_ryotaro_normal"
                },
                {
                    speaker: "momotaros",
                    expression:
                        "portrait_momotaros_base_default_normal"
                }
            ],

            pages: [
                {
                    speaker: "mio",
                    text:
                        "モモ、ちょっと来てくれる？"
                },
                {
                    speaker: "ryotaro",
                    expression:
                        "portrait_ryotaro_base_ryotaro_smile",
                    text:
                        "じゃあ、僕は少し向こうにいるね。"
                },
                {
                    speaker: "momotaros",
                    expression:
                        "portrait_momotaros_base_default_normal",
                    text:
                        "おう！　待たせたな、澪！"
                }
            ]
        }
    ],
    ryotaro_to_urataros: [
{
    participants: [
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "ウラタロス、少し話せる？"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "それじゃ、交代するね。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "お待たせ。\n今日は僕がお相手するよ。"
        }
    ]
}
],

    /*
     * モモタロス → 良太郎
     */
    momotaros_to_ryotaro: [
        {
            participants: [
                {
                    speaker: "momotaros",
                    expression:
                        "portrait_momotaros_base_default_normal"
                },
                {
                    speaker: "ryotaro",
                    expression:
                        "portrait_ryotaro_base_ryotaro_normal"
                }
            ],

            pages: [
                {
                    speaker: "mio",
                    text:
                        "良太郎くん、少しいい？"
                },
                {
                    speaker: "momotaros",
                    expression:
                        "portrait_momotaros_base_default_angry",
                    text:
                        "なんだよ、もう交代かよ。"
                },
                {
                    speaker: "ryotaro",
                    expression:
                        "portrait_ryotaro_base_ryotaro_smile",
                    text:
                        "モモタロス、そんな顔しないでよ。"
                },
                {
                    speaker: "momotaros",
                    expression:
                        "portrait_momotaros_base_default_angry",
                    text:
                        "してねぇ！"
                }
            ]
        }
    ],
    urataros_to_ryotaro: [
{
    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_normal"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "良太郎くん、お願い。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "はいはい。\n名残惜しいけど交代だね。"
        },
        {
            speaker: "ryotaro",
            expression:
                "portrait_ryotaro_base_ryotaro_smile",
            text:
                "ただいま。\n待たせちゃったかな？"
        }
    ]
}
],
momotaros_to_urataros: [
{
    participants: [
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "次はウラタロスと話したいな。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_angry",
            text:
                "ちっ、俺じゃ駄目かよ。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "拗ねないの、先輩。\nそれじゃ、僕に代わるね。"
        }
    ]
}
],
urataros_to_momotaros: [
{
    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "モモ、お願い。"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "了解。\n先輩、出番だよ。"
        },
        {
            speaker: "momotaros",
            expression:
                "portrait_momotaros_base_default_normal",
            text:
                "おう！\n待たせたな！"
        }
    ]
}
],

    /*
     * 良太郎がいる状態で、
     * もう一度良太郎を選んだ場合
     */
    ryotaro_to_ryotaro: [
        {
            participants: [
                {
                    speaker: "ryotaro",
                    expression:
                        "portrait_ryotaro_base_ryotaro_normal"
                }
            ],

            pages: [
                {
                    speaker: "mio",
                    text:
                        "良太郎くん、もう少し話してもいい？"
                },
                {
                    speaker: "ryotaro",
                    expression:
                        "portrait_ryotaro_base_ryotaro_smile",
                    text:
                        "うん。もちろんだよ。"
                }
            ]
        }
    ],

    /*
     * モモがいる状態で、
     * もう一度モモを選んだ場合
     */
    momotaros_to_momotaros: [
        {
            participants: [
                {
                    speaker: "momotaros",
                    expression:
                        "portrait_momotaros_base_default_normal"
                }
            ],

            pages: [
                {
                    speaker: "mio",
                    text:
                        "モモ、こっち来て。"
                },
                {
                    speaker: "momotaros",
                    expression:
                        "portrait_momotaros_base_default_angry",
                    text:
                        "俺ならもうここにいるだろうが！"
                }
            ]
        }
    ],
    urataros_to_urataros: [
{
    participants: [
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_normal"
        }
    ],

    pages: [
        {
            speaker: "mio",
            text:
                "ウラタロス、もう少し話そう？"
        },
        {
            speaker: "urataros",
            expression:
                "portrait_urataros_base_default_smile",
            text:
                "もちろん。\n君が帰るまで付き合うよ。"
        }
    ]
}
],

    /*
     * キャラ個別の汎用
     */
    to_momotaros: [
        {
            participants: [
                {
                    speaker: "momotaros",
                    expression:
                        "portrait_momotaros_base_default_normal"
                }
            ],

            pages: [
                {
                    speaker: "mio",
                    text:
                        "モモ、ちょっと来て。"
                },
                {
                    speaker: "momotaros",
                    expression:
                        "portrait_momotaros_base_default_normal",
                    text:
                        "おう、呼んだか？"
                }
            ]
        }
    ],

    to_ryotaro: [
        {
            participants: [
                {
                    speaker: "ryotaro",
                    expression:
                        "portrait_ryotaro_base_ryotaro_normal"
                }
            ],

            pages: [
                {
                    speaker: "mio",
                    text:
                        "良太郎くん、少しいい？"
                },
                {
                    speaker: "ryotaro",
                    expression:
                        "portrait_ryotaro_base_ryotaro_smile",
                    text:
                        "うん、どうしたの？"
                }
            ]
        }
    ],

    /*
     * 最後の保険
     */
    default: [
        {
            pages: [
                {
                    speaker: "mio",
                    text:
                        "ちょっと交代してもらってもいい？"
                }
            ]
        }
    ]
};
/*
 * ─────────────────────────────
 * 憑依イベント会話
 * ─────────────────────────────
 *
 * startFromRyotaro:
 *   良太郎が現在のメインキャラの場合。
 *
 * startFromImagin:
 *   憑依するイマジン本人が
 *   現在のメインキャラの場合。
 *
 * release:
 *   憑依解除前の会話。
 */
const POSSESSION_EVENT_DATA = {
    momotaros: {
        /*
         * 良太郎がメインの時に、
         * モモタロスが憑依する。
         */
        startFromRyotaro: [
            {
                participants: [
                    {
                        speaker: "ryotaro",
                        expression:
                            "portrait_ryotaro_base_ryotaro_normal"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal"
                    }
                ],

                pages: [
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal",
                        text:
                            "おっ、良太郎。\nちょうどいいところにいたな！"
                    },
                    {
                        speaker: "ryotaro",
                        expression:
                            "portrait_ryotaro_base_ryotaro_worried",
                        text:
                            "え？　モモタロス、何……？"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal",
                        text:
                            "決まってんだろ！\n今日は俺が行く！"
                    },
                    {
                        speaker: "ryotaro",
                        expression:
                            "portrait_ryotaro_base_ryotaro_worried",
                        text:
                            "ちょ、ちょっと待って！\n僕はまだ何も……！"
                    }
                ]
            }
        ],

        /*
         * モモタロス本人がメインの時に、
         * 良太郎へ憑依する。
         */
        startFromImagin: [
            {
                participants: [
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal"
                    },
                    {
                        speaker: "ryotaro",
                        expression:
                            "portrait_ryotaro_base_ryotaro_normal"
                    }
                ],

                pages: [
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal",
                        text:
                            "よし、良太郎！\nちょっと身体借りるぜ！"
                    },
                    {
                        speaker: "ryotaro",
                        expression:
                            "portrait_ryotaro_base_ryotaro_worried",
                        text:
                            "えっ、今から！？"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal",
                        text:
                            "おう！　行くぞ！"
                    },
                    {
                        speaker: "ryotaro",
                        expression:
                            "portrait_ryotaro_base_ryotaro_worried",
                        text:
                            "待って、せめて心の準備を……！"
                    }
                ]
            }
        ],

        /*
         * 良太郎の服を着ている時の解除。
         */
        release: [
            {
                participants: [
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal"
                    }
                ],

                pages: [
                    {
                        speaker: "ryotaro",
                        text:
                            "……モモタロス。"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal",
                        text:
                            "ん？　なんだよ。"
                    },
                    {
                        speaker: "ryotaro",
                        text:
                            "そろそろ……\n返してくれないかな。"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_angry",
                        text:
                            "もうかよ。\n仕方ねぇなぁ。"
                    }
                ]
            }
        ],

        /*
         * モモタロス好みの服を
         * 着ている時の解除。
         */
        releaseImaginPreference: [
            {
                participants: [
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal"
                    }
                ],

                pages: [
                    {
                        speaker: "ryotaro",
                        text:
                            "……モモタロス。\nそろそろ返して。"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_angry",
                        text:
                            "なんだよ、もう終わりかよ。"
                    },
                    {
                        speaker: "ryotaro",
                        text:
                            "それに、この服のままじゃ\n僕は落ち着かないよ……。"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal",
                        text:
                            "へいへい。\n返しゃいいんだろ、返しゃ！"
                    }
                ]
            }
        ]
    },

    urataros: {
        /*
         * 良太郎がメインの時に、
         * ウラタロスが憑依する。
         */
        startFromRyotaro: [
            {
                participants: [
                    {
                        speaker: "ryotaro",
                        expression:
                            "portrait_ryotaro_base_ryotaro_normal"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile"
                    }
                ],

                pages: [
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "良太郎、ちょっと代わってくれる？"
                    },
                    {
                        speaker: "ryotaro",
                        expression:
                            "portrait_ryotaro_base_ryotaro_worried",
                        text:
                            "えっ……。\n何をするつもり？"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "大したことじゃないよ。\n澪ちゃんと少し話したいだけ。"
                    },
                    {
                        speaker: "ryotaro",
                        expression:
                            "portrait_ryotaro_base_ryotaro_worried",
                        text:
                            "それなら、そのまま話せばいいよね……？"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "この姿より、君の姿のほうが\n話しやすいこともあるんだよ。"
                    },
                    {
                        speaker: "ryotaro",
                        expression:
                            "portrait_ryotaro_base_ryotaro_worried",
                        text:
                            "それ、僕にとっては\n全然安心できない説明だよ……。"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "大丈夫、大丈夫。\nすぐ返すから。"
                    },
                    {
                        speaker: "ryotaro",
                        expression:
                            "portrait_ryotaro_base_ryotaro_worried",
                        text:
                            "ウラタロスの『すぐ』は\n信用できな……"
                    }
                ]
            }
        ],

        /*
         * ウラタロス本人がメインの時に、
         * 良太郎へ憑依する。
         */
        startFromImagin: [
            {
                participants: [
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile"
                    },
                    {
                        speaker: "ryotaro",
                        expression:
                            "portrait_ryotaro_base_ryotaro_normal"
                    }
                ],

                pages: [
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "良太郎、少し身体を借りるよ。"
                    },
                    {
                        speaker: "ryotaro",
                        expression:
                            "portrait_ryotaro_base_ryotaro_worried",
                        text:
                            "えっ、待って。\nどうして急に……？"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "澪ちゃんが来てるんだから、\n少しくらいいいだろ？"
                    },
                    {
                        speaker: "ryotaro",
                        expression:
                            "portrait_ryotaro_base_ryotaro_worried",
                        text:
                            "それ、理由になってないよ……！"
                    }
                ]
            }
        ],

        /*
         * 良太郎の服を着ている時の解除。
         */
        release: [
            {
                participants: [
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_normal"
                    }
                ],

                pages: [
                    {
                        speaker: "ryotaro",
                        text:
                            "……ウラタロス。"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_normal",
                        text:
                            "どうしたの、良太郎。"
                    },
                    {
                        speaker: "ryotaro",
                        text:
                            "そろそろ……\n返してくれないかな。"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "もう少しくらいいいじゃない。\nせっかく澪ちゃんと話してたのに。"
                    },
                    {
                        speaker: "ryotaro",
                        text:
                            "駄目だよ……。"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "はいはい。\nそれじゃ、続きはまた今度ね。"
                    }
                ]
            }
        ],

        /*
         * ウラタロス好みの服を
         * 着ている時の解除。
         */
        releaseImaginPreference: [
            {
                participants: [
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_normal"
                    }
                ],

                pages: [
                    {
                        speaker: "ryotaro",
                        text:
                            "……ウラタロス。\nそろそろ返して。"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "もう？\nまだ話し足りないんだけどな。"
                    },
                    {
                        speaker: "ryotaro",
                        text:
                            "それに、その服のまま返されても\n困るよ……。"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_normal",
                        text:
                            "似合ってるんだから、\nそのままでもいいと思うけど。"
                    },
                    {
                        speaker: "ryotaro",
                        text:
                            "よくないよ。"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "分かったよ。\n着替えるところまで責任を持つから。"
                    }
                ]
            }
        ]
    }
};

const FORCE_RELEASE_TALK_DATA = {
    momotaros: [
        {
            participants: [
                {
                    speaker: "momotaros",
                    expression:
                        "portrait_momotaros_base_default_normal"
                }
            ],

            pages: [
                {
                    speaker: "ryotaro",
                    text:
                        "……モモタロス。"
                },
                {
                    speaker: "momotaros",
                    expression:
                        "portrait_momotaros_base_default_normal",
                    text:
                        "ん？"
                },
                {
                    speaker: "ryotaro",
                    text:
                        "僕が話すから……\n一回代わって。"
                },
                {
                    speaker: "momotaros",
                    expression:
                        "portrait_momotaros_base_default_angry",
                    text:
                        "へいへい。\n分かったよ。"
                }
            ]
        }
    ],

    urataros: [
        {
            participants: [
                {
                    speaker: "urataros",
                    expression:
                        "portrait_urataros_base_default_normal"
                }
            ],

            pages: [
                {
                    speaker: "ryotaro",
                    text:
                        "……ウラタロス。"
                },
                {
                    speaker: "urataros",
                    expression:
                        "portrait_urataros_base_default_normal",
                    text:
                        "何かな、良太郎。"
                },
                {
                    speaker: "ryotaro",
                    text:
                        "澪さんが僕を呼んでるから……\n一回代わって。"
                },
                {
                    speaker: "urataros",
                    expression:
                        "portrait_urataros_base_default_smile",
                    text:
                        "はいはい。\nご指名なら仕方ないね。"
                }
            ]
        }
    ]
};
/*
 * ─────────────────────────────
 * 憑依横取り会話
 * ─────────────────────────────
 *
 * キー：
 *   現在の憑依者_to_横取りするイマジン
 *
 * 服装キー：
 *   ryotaro
 *       良太郎の普段着
 *
 *   momotaros
 *       モモタロス好みの服
 *
 *   urataros
 *       ウラタロス好みの服
 */
const POSSESSION_STEAL_TALK_DATA = {
    urataros_to_momotaros: {
        /*
         * U良太郎・良太郎服
         * ↓
         * M良太郎・良太郎服
         */
        ryotaro: [
            {
                participants: [
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile"
                    },
                    {
                        speaker: "momotaros",
                       expression:
                            "portrait_momotaros_base_default_normal"
                    }
                ],

                pages: [
                    {
                        speaker: "momotaros",
                        text:
                            "おい亀！\nいつまで入ってやがる！"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "先輩、急に何？\n今いいところなんだけど。"
                    },
                    {
                        speaker: "momotaros",
                        text:
                            "知るか！\n次は俺の番だ！"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_normal",
                        text:
                            "順番なんて決めてたっけ？"
                    },
                    {
                        speaker: "momotaros",
                        text:
                            "今決めた！\nさっさと代われ！"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "はいはい。\n乱暴だなあ、先輩は。"
                    }
                ]
            }
        ],

        /*
         * U良太郎・ウラ服
         * ↓
         * M良太郎・ウラ服
         */
        urataros: [
            {
                participants: [
                  {
                      speaker: "urataros",
                      expression:
                          "portrait_urataros_base_default_smile"
                  },
                  {
                      speaker: "momotaros",
                      expression:
                          "portrait_momotaros_base_default_normal"
                  }
              ],

                pages: [
                    {
                        speaker: "momotaros",
                        text:
                            "おい亀！\nそこ代われ！"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "また急だね、先輩。"
                    },
                    {
                        speaker: "momotaros",
                        text:
                            "いいから代われっつってんだ！"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "分かったよ。\nじゃあ、このままどうぞ。"
                    },
                    {
                        speaker: "momotaros",
                        text:
                            "あ？　このままって……"
                    }
                ]
            },
            {
                /*
                 * 横取り後の画像は、
                 * M良太郎＋ウラ服へ自動変換される。
                 */
                participants: [
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile"
                    }
                ],

                pages: [
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_angry",
                        text:
                            "なんだこのチャラチャラした服は！？"
                    },
                    {
                        speaker: "urataros",
                        text:
                            "似合ってるよ、先輩。"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_angry",
                        text:
                            "褒めてんじゃねぇ！\n首元がスースーすんだよ！"
                    },
                    {
                        speaker: "urataros",
                        text:
                            "そのくらい開いてるほうが、\n格好よく見えるんじゃない？"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_angry",
                        text:
                            "男なら革だろ、革！"
                    }
                ]
            }
        ],

        /*
         * ウラから横取り返したが、
         * 服は元々モモのもの。
         */
        momotaros: [
            {
                participants: [
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal"
                    }
                ],

                pages: [
                    {
                        speaker: "momotaros",
                        text:
                            "おい亀！\nそれ俺の服だろうが！"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "服だけじゃなくて、\n身体も良太郎のだけどね。"
                    },
                    {
                        speaker: "momotaros",
                        text:
                            "細けぇことはいい！\n返せ！"
                    }
                ]
            },
            {
                participants: [
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile"
                    }
                ],

                pages: [
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal",
                        text:
                            "へへっ、やっぱこれだよな！"
                    },
                    {
                        speaker: "urataros",
                        text:
                            "服を取り返したかっただけ？"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_angry",
                        text:
                            "ちげぇ！\nついでだ、ついで！"
                    }
                ]
            }
        ]
    },

    momotaros_to_urataros: {
        /*
         * M良太郎・良太郎服
         * ↓
         * U良太郎・良太郎服
         */
        ryotaro: [
            {
                participants: [
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile"
                    }
                ],

                pages: [
                    {
                        speaker: "urataros",
                        text:
                            "先輩、そろそろ代わってよ。"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_angry",
                        text:
                            "ああ！？\n今俺が話してんだろうが！"
                    },
                    {
                        speaker: "urataros",
                        text:
                            "少しくらいいいじゃない。\n独り占めはよくないよ？"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_angry",
                        text:
                            "勝手に入ってくんな、亀ぇ！"
                    }
                ]
            }
        ],

        /*
         * M良太郎・モモ服
         * ↓
         * U良太郎・モモ服
         */
        momotaros: [
            {
                participants: [
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile"
                    }
                ],

                pages: [
                    {
                        speaker: "urataros",
                        text:
                            "先輩、ちょっと代わるよ。"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_angry",
                        text:
                            "おい、待て亀！\n今いいところだろうが！"
                    },
                    {
                        speaker: "urataros",
                        text:
                            "だからこそ、かな。"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_angry",
                        text:
                            "どういう意味だコラ！"
                    }
                ]
            },
            {
                participants: [
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal"
                    }
                ],

                pages: [
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_normal",
                        text:
                            "うわ……重いね、この上着。"
                    },
                    {
                        speaker: "momotaros",
                        text:
                            "重くねぇ！\n革の良さが分かってねぇな！"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "それに、この鎖……。\n先輩らしいと言えば先輩らしいけど。"
                    },
                    {
                        speaker: "momotaros",
                        text:
                            "文句あんなら脱げ！"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "でも、澪ちゃんには\n意外と好評かもしれないよ？"
                    },
                    {
                        speaker: "momotaros",
                        text:
                            "勝手に俺の服で口説くんじゃねぇ！"
                    }
                ]
            }
        ],

        /*
         * モモから横取り返したが、
         * 服は元々ウラのもの。
         */
        urataros: [
            {
                participants: [
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile"
                    }
                ],

                pages: [
                    {
                        speaker: "urataros",
                        text:
                            "先輩、その服返してもらうね。"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_angry",
                        text:
                            "俺だって好きで着てんじゃねぇ！"
                    },
                    {
                        speaker: "urataros",
                        text:
                            "じゃあ遠慮なく。"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_angry",
                        text:
                            "身体ごと持ってくなぁ！"
                    }
                ]
            },
            {
                participants: [
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile"
                    },
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal"
                    }
                ],

                pages: [
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "うん。\nやっぱりこれが落ち着くね。"
                    },
                    {
                        speaker: "momotaros",
                        text:
                            "どこがだ！\n首元開きすぎだろ！"
                    },
                    {
                        speaker: "urataros",
                        expression:
                            "portrait_urataros_base_default_smile",
                        text:
                            "先輩には少し早かったかな。"
                    },
                    {
                        speaker: "momotaros",
                        text:
                            "何がだコラァ！"
                    }
                ]
            }
        ]
    }
};
    /*
     * ─────────────────────────────
     * 時間帯限定会話
     * ─────────────────────────────
     *
     * 従来形式のまま使用できます。
     * 自動的にtimeタグと時間帯タグが付きます。
     */

    const TIME_TALK_DATA = {
        morning: [

     /*
    　* ↑朝の話ここまで↑
    　*/
        ],

        day: [

     /*
    　* ↑昼の話ここまで↑
    　*/
        ],

        evening: [

     /*
    　* ↑夕方の話ここまで↑
    　*/    
        ],

        night: [

     /*
    　* ↑夜の話ここまで↑
    　*/    
        ],    

        midnight: [

     /*
    　* ↑深夜の話ここまで↑
    　*/    
        ],        
    };

    /*
     * ─────────────────────────────
     * 訪問回数条件会話
     * ─────────────────────────────
     */

const VISIT_TALK_DATA = [
];
    /*
     * ─────────────────────────────
     * 季節・特定日・複合条件会話
     * ─────────────────────────────
     *
     * これらも通常候補と同じ抽選箱へ入ります。
     *
     * weight:
     *   抽選箱へ同じ会話を何口入れるか。
     *   省略時は1。
     *
     * chance:
     *   候補へ入る確率。省略時は1。
     */

const CONDITIONAL_TALK_DATA = [
];    

    /*
     * ─────────────────────────────
     * 内部状態
     * ─────────────────────────────
     */

    const talkHistory = [];
    const shownConditionalTalks = {};
    const shownVisitTalks = {};

let visitTalkCount = 0;
let resetRequested = false;
let resetDelay = 0;
let resetPortraitOnEnd = true;

    /*
     * 選択肢を選んだ直後の返答。
     *
     * 選択肢のコールバック内で直接文章を追加すると、
     * ツクール本体のメッセージ終了処理に消されるため、
     * 一度ここへ預けてから表示する。
     */
    let pendingChoiceResponse = null;

    /*
 * ─────────────────────────────
 * 憑依・解除演出
 * ─────────────────────────────
 */

let possessionEffectState = null;

    /*
     * ─────────────────────────────
     * 時間・季節
     * ─────────────────────────────
     */

    function isTimeSystemReady() {
        return (
            window.MamiTimeSystem &&
            typeof MamiTimeSystem.getTimeZone ===
                "function"
        );
    }

    function getTimeZone() {
        if (!isTimeSystemReady()) {
            return "day";
        }

        return MamiTimeSystem.getTimeZone();
    }
/*
 * モモ好みの服から戻った良太郎。
 *
 * 着替えに行くため、
 * 立ち絵は表示しない。
 */
function makeChangeClothesTalk() {
    return {
        keepPortraitHidden: true,

        participants: [
            {
                speaker: "mio"
            }
        ],

        pages: [
            {
                speaker: "ryotaro",
                text:
                    "ご、ごめんね。\n僕、ちょっと着替えてくる……。"
            }
        ]
    };
}
/*
 * 着替えを終えて戻ってきた良太郎。
 */
function makeReturnFromChangingTalk() {
    return {
        participants: [
            {
                speaker: "ryotaro",
                expression:
                    "portrait_ryotaro_base_ryotaro_normal"
            }
        ],

        pages: [
            {
                speaker: "ryotaro",
                expression:
                    "portrait_ryotaro_base_ryotaro_smile",
                text:
                    "お待たせ、澪さん。\nもう大丈夫だよ。"
            }
        ]
    };
}
/*
 * 現在再生中の立ち絵なし会話が、
 * 着替えイベントかどうか。
 */
let isChangeClothesTalkActive = false;
    /*
     * 現在の時間帯に合う挨拶を
     * ランダムでひとつ選ぶ。
     */
    function selectTimeGreeting() {
        const timeZone =
            getTimeZone();

        const greetings =
            GREETING_DATA[timeZone] ||
            GREETING_DATA.day ||
            [];

        if (greetings.length === 0) {
            return null;
        }

        const index =
            Math.floor(
                Math.random() *
                greetings.length
            );

        return greetings[index];
    }

    function getSeason() {
        if (
            window.MamiTimeSystem &&
            typeof MamiTimeSystem.getSeason ===
                "function"
        ) {
            return MamiTimeSystem.getSeason();
        }

        const month =
            new Date().getMonth() + 1;

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
    }

    function getDateInfo() {
        if (
            window.MamiTimeSystem &&
            typeof MamiTimeSystem.getDateInfo ===
                "function"
        ) {
            return MamiTimeSystem.getDateInfo();
        }

        const date = new Date();

        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            date: date.getDate(),
            day: date.getDay()
        };
    }

    /*
     * ─────────────────────────────
     * タグ
     * ─────────────────────────────
     */

    function normalizeArray(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return [];
        }

        return Array.isArray(value)
            ? value
            : [value];
    }

    function uniqueTags(tags) {
        return [
            ...new Set(
                tags
                    .filter(tag =>
                        tag !== undefined &&
                        tag !== null &&
                        tag !== ""
                    )
                    .map(tag => String(tag))
            )
        ];
    }

    function makeTalkTags(
        talk,
        automaticTags = []
    ) {
        return uniqueTags([
            ...automaticTags,
            ...normalizeArray(talk.tags)
        ]);
    }

    function hasTag(candidate, tag) {
        return candidate.tags.includes(
            String(tag)
        );
    }

    /*
     * ─────────────────────────────
     * 条件判定
     * ─────────────────────────────
     */

    function conditionIncludes(
        condition,
        currentValue
    ) {
        const values =
            normalizeArray(condition);

        if (values.length === 0) {
            return true;
        }

        return values.some(value =>
            String(value) ===
            String(currentValue)
        );
    }

    function isConditionalTalkAvailable(talk) {
        if (!talk || !talk.id) {
            return false;
        }

        if (
            talk.once === true &&
            shownConditionalTalks[talk.id]
        ) {
            return false;
        }

        const dateInfo = getDateInfo();

        if (
            !conditionIncludes(
                talk.season,
                getSeason()
            )
        ) {
            return false;
        }

        if (
            !conditionIncludes(
                talk.time,
                getTimeZone()
            )
        ) {
            return false;
        }

        if (
            !conditionIncludes(
                talk.month,
                dateInfo.month
            )
        ) {
            return false;
        }

        if (
            !conditionIncludes(
                talk.date,
                dateInfo.date
            )
        ) {
            return false;
        }

        if (
            !conditionIncludes(
                talk.dayOfWeek,
                dateInfo.day
            )
        ) {
            return false;
        }

        const chance =
            talk.chance !== undefined
                ? Math.max(
                    0,
                    Math.min(
                        1,
                        Number(talk.chance)
                    )
                )
                : 1;

        return Math.random() < chance;
    }

    function matchesConditionBlock(condition) {
    if (!condition) {
        return false;
    }

    const dateInfo = getDateInfo();
    const currentSeason = getSeason();
    const currentTime = getTimeZone();
    const currentHour =
        new Date().getHours();

    if (
        condition.season !== undefined &&
        !conditionIncludes(
            condition.season,
            currentSeason
        )
    ) {
        return false;
    }

    if (
        condition.time !== undefined &&
        !conditionIncludes(
            condition.time,
            currentTime
        )
    ) {
        return false;
    }

    if (
        condition.month !== undefined &&
        !conditionIncludes(
            condition.month,
            dateInfo.month
        )
    ) {
        return false;
    }

    if (
        condition.date !== undefined &&
        !conditionIncludes(
            condition.date,
            dateInfo.date
        )
    ) {
        return false;
    }

    if (
        condition.dayOfWeek !== undefined &&
        !conditionIncludes(
            condition.dayOfWeek,
            dateInfo.day
        )
    ) {
        return false;
    }

    if (
        condition.hour !== undefined &&
        !conditionIncludes(
            condition.hour,
            currentHour
        )
    ) {
        return false;
    }

    return true;
}

function isTalkExcluded(talk) {
    if (!talk) {
        return false;
    }

    const dateInfo = getDateInfo();

    /*
     * 旧形式の除外指定。
     *
     * 例：
     * excludeMonth: 12,
     * excludeDate: [24, 25]
     *
     * この場合は12月24日と25日に除外する。
     */
    if (
        talk.excludeMonth !== undefined &&
        conditionIncludes(
            talk.excludeMonth,
            dateInfo.month
        )
    ) {
        if (
            talk.excludeDate === undefined ||
            conditionIncludes(
                talk.excludeDate,
                dateInfo.date
            )
        ) {
            return true;
        }
    }

    const excludeConditions =
        Array.isArray(talk.excludeConditions)
            ? talk.excludeConditions
            : [];

    return excludeConditions.some(
        condition =>
            matchesConditionBlock(condition)
    );
}

/*
 * TALK_DATA内に直接書かれた、
 *
 * season
 * time
 * month
 * date
 * dayOfWeek
 *
 * を会話の出現条件として判定する。
 */
function isLegacyTalkAvailable(talk) {
    if (!talk || isTalkExcluded(talk)) {
        return false;
    }

    const dateInfo = getDateInfo();
    const currentHour =
        new Date().getHours();    

    if (
        talk.season !== undefined &&
        !conditionIncludes(
            talk.season,
            getSeason()
        )
    ) {
        return false;
    }

    if (
        talk.time !== undefined &&
        !conditionIncludes(
            talk.time,
            getTimeZone()
        )
    ) {
        return false;
    }

    if (
        talk.month !== undefined &&
        !conditionIncludes(
            talk.month,
            dateInfo.month
        )
    ) {
        return false;
    }

    if (
        talk.date !== undefined &&
        !conditionIncludes(
            talk.date,
            dateInfo.date
        )
    ) {
        return false;
    }

    if (
        talk.dayOfWeek !== undefined &&
        !conditionIncludes(
            talk.dayOfWeek,
            dateInfo.day
        )
    ) {
        return false;
    }
    if (
        talk.hour !== undefined &&
        !conditionIncludes(
            talk.hour,
            currentHour
        )
    ) {
        return false;
    }
    return true;
}

    /*
     * ─────────────────────────────
     * 候補作成
     * ─────────────────────────────
     */

    function addLegacyCategoryCandidates(
    candidates,
    categoryName
) {
    const talks =
        TALK_DATA[categoryName];

    if (!talks) {
        return;
    }

    talks.forEach((talk, index) => {
        /*
         * 話す・季節・本丸のどのボタンから呼ばれても、
         * ここで共通して除外条件を判定する。
         */
        if (!isLegacyTalkAvailable(talk)) {
            return;
        }

        candidates.push({
            key:
                `legacy:${categoryName}:${index}`,
            source: "legacy",
            category: categoryName,
            index: index,
            talk: talk,
            tags: makeTalkTags(
                talk,
                [categoryName]
            )
        });
    });
}

    function addTimeCandidates(candidates) {
    const timeZone =
        getTimeZone();

    const talks =
        TIME_TALK_DATA[timeZone];

    if (!talks) {
        return;
    }

    talks.forEach((talk, index) => {
        /*
         * 時間帯配列の会話にも、
         *
         * season
         * time
         * month
         * date
         * dayOfWeek
         * excludeConditions
         *
         * を適用する。
         */
        if (!isLegacyTalkAvailable(talk)) {
            return;
        }

        candidates.push({
            key:
                `time:${timeZone}:${index}`,

            source:
                "time",

            category:
                timeZone,

            index:
                index,

            talk:
                talk,

            tags:
                makeTalkTags(
                    talk,
                    [
                        "time",
                        timeZone
                    ]
                )
        });
    });
}

    function addConditionalCandidates(
        candidates
    ) {
        CONDITIONAL_TALK_DATA.forEach(
            (talk, index) => {
                if (
                    !isConditionalTalkAvailable(
                        talk
                    )
                ) {
                    return;
                }

                const weight =
                    Math.max(
                        1,
                        Math.floor(
                            Number(
                                talk.weight || 1
                            )
                        )
                    );

                const automaticTags = [
                    "conditional"
                ];

                normalizeArray(
                    talk.season
                ).forEach(value => {
                    automaticTags.push(
                        "season",
                        value
                    );
                });

                normalizeArray(
                    talk.time
                ).forEach(value => {
                    automaticTags.push(
                        "time",
                        value
                    );
                });

                if (
                    talk.month !== undefined ||
                    talk.date !== undefined
                ) {
                    automaticTags.push(
                        "specialDate"
                    );
                }

                const candidate = {
                    key:
                        `conditional:${talk.id}`,
                    source: "conditional",
                    category: "conditional",
                    index: index,
                    talk: talk,
                    tags: makeTalkTags(
                        talk,
                        automaticTags
                    )
                };

                for (
                    let count = 0;
                    count < weight;
                    count++
                ) {
                    candidates.push(candidate);
                }
            }
        );
    }

    /*
     * ボタンカテゴリに応じて候補を絞る
     */

    function filterCandidatesByCategory(
        candidates,
        category
    ) {
        switch (category) {
case "season":
    return candidates.filter(
        candidate => {

            /*
             * 本丸会話は
             * 季節コマンドでは除外。
             */
            if (
                hasTag(
                    candidate,
                    "honmaru"
                )
            ) {
                return false;
            }

            return (
                hasTag(
                    candidate,
                    "season"
                ) ||
                hasTag(
                    candidate,
                    getSeason()
                )
            );
        }
    );

            case "honmaru":
                return candidates.filter(
                    candidate =>
                        hasTag(
                            candidate,
                            "honmaru"
                        )
                );

            case "time":
                return candidates.filter(
                    candidate =>
                        hasTag(
                            candidate,
                            "time"
                        ) ||
                        hasTag(
                            candidate,
                            getTimeZone()
                        )
                );

            case "normal":
                return candidates.filter(
                    candidate =>
                        hasTag(
                            candidate,
                            "normal"
                        )
                );

            case "all":
            default:
                return candidates;
        }
    }

function makeTalkCandidates(
    category
) {
    const candidates = [];

    addLegacyCategoryCandidates(
        candidates,
        "normal"
    );

    addLegacyCategoryCandidates(
        candidates,
        "season"
    );

    addLegacyCategoryCandidates(
        candidates,
        "honmaru"
    );

    /*
     * 時間帯会話も追加する。
     */
    addTimeCandidates(
        candidates
    );

    /*
     * 条件付き会話も追加する。
     */
    addConditionalCandidates(
        candidates
    );

    /*
     * 憑依状態に合わない会話を、
     * すべての候補から一括で除外する。
     */
    const availableCandidates =
    candidates.filter(
        candidate => {
            const talk =
                candidate.talk;

            /*
             * 憑依状態に合わない会話を除外。
             */
            if (
                !isTalkAvailableForPossession(
                    talk
                )
            ) {
                return false;
            }

            /*
             * 現在のメインキャラが
             * 参加していない会話を除外。
             */
            if (
                !isTalkAvailableForMainCharacter(
                    talk
                )
            ) {
                return false;
            }

            return true;
        }
    );

return filterCandidatesByCategory(
    availableCandidates,
    category
);
}

    /*
     * ─────────────────────────────
     * 履歴
     * ─────────────────────────────
     */

    function filterRecentHistory(candidates) {
        if (candidates.length <= 1) {
            return candidates;
        }

        const uniqueKeys = [
            ...new Set(
                candidates.map(
                    candidate =>
                        candidate.key
                )
            )
        ];

        const excludeCount =
            Math.min(
                historyCount,
                Math.max(
                    0,
                    uniqueKeys.length - 1
                )
            );

        const recentKeys =
            talkHistory.slice(
                -excludeCount
            );

        const filtered =
            candidates.filter(
                candidate =>
                    !recentKeys.includes(
                        candidate.key
                    )
            );

        if (filtered.length > 0) {
            return filtered;
        }

        const lastKey =
            talkHistory[
                talkHistory.length - 1
            ];

        const fallback =
            candidates.filter(
                candidate =>
                    candidate.key !==
                    lastKey
            );

        return fallback.length > 0
            ? fallback
            : candidates;
    }

    function rememberCandidate(candidate) {
        talkHistory.push(candidate.key);

        while (
            talkHistory.length >
            historyCount
        ) {
            talkHistory.shift();
        }

        if (
            candidate.source ===
                "conditional" &&
            candidate.talk.once === true
        ) {
            shownConditionalTalks[
                candidate.talk.id
            ] = true;
        }
    }

    /*
     * ─────────────────────────────
     * 訪問回数会話
     * ─────────────────────────────
     */

    function getVisitTalk() {
        visitTalkCount++;

        const matched =
            VISIT_TALK_DATA.filter(
                talk => {
                    if (
                        !talk ||
                        !talk.id
                    ) {
                        return false;
                    }

                    if (
                        talk.once !== false &&
                        shownVisitTalks[
                            talk.id
                        ]
                    ) {
                        return false;
                    }

                    if (
                        talk.count !==
                            undefined &&
                        visitTalkCount !==
                            Number(talk.count)
                    ) {
                        return false;
                    }

                    if (
                        talk.minCount !==
                            undefined &&
                        visitTalkCount <
                            Number(
                                talk.minCount
                            )
                    ) {
                        return false;
                    }

                    if (
                        talk.maxCount !==
                            undefined &&
                        visitTalkCount >
                            Number(
                                talk.maxCount
                            )
                    ) {
                        return false;
                    }

                    const chance =
                        talk.chance !==
                        undefined
                            ? Math.max(
                                0,
                                Math.min(
                                    1,
                                    Number(
                                        talk.chance
                                    )
                                )
                            )
                            : 1;

                    return (
                        Math.random() <
                        chance
                    );
                }
            );

        if (matched.length === 0) {
            return null;
        }

        const highestPriority =
            Math.max(
                ...matched.map(
                    talk =>
                        Number(
                            talk.priority ||
                                0
                        )
                )
            );

        const highest =
            matched.filter(
                talk =>
                    Number(
                        talk.priority || 0
                    ) ===
                    highestPriority
            );

        const selected =
            highest[
                Math.floor(
                    Math.random() *
                    highest.length
                )
            ];

        if (selected.once !== false) {
            shownVisitTalks[
                selected.id
            ] = true;
        }

        return selected;
    }

    /*
     * ─────────────────────────────
     * 立ち絵・表情
     * ─────────────────────────────
     */

    function getSpeakerData(
        speakerId
    ) {
        const id =
            String(
                speakerId ||
                defaultSpeaker
            );

        return (
            SPEAKER_DATA[id] ||
            SPEAKER_DATA[
                defaultSpeaker
            ] ||
            null
        );
    }
/*
 * ─────────────────────────────
 * 表示用キャラクターID
 * ─────────────────────────────
 *
 * 会話上のキャラと、
 * 実際に表示する立ち絵を分ける。
 */
function getDisplaySpeaker(
    speakerId
) {
    /*
     * 憑依中なら、
     * イマジン本人ではなく
     * M良太郎を表示する。
     */
    if (
        possessionState.active &&
        speakerId ===
            possessionState.imagin
    ) {
        switch (speakerId) {

            case "momotaros":
                return "m_ryotaro";

            case "urataros":
                return "u_ryotaro";

            case "kintaros":
                return "k_ryotaro";

            case "ryutaros":
                return "r_ryotaro";
        }
    }

    return speakerId;
}
/*
 * 表示する画像名を取得する。
 *
 * 憑依中だけ
 * M良太郎の画像へ置き換える。
 */
function getDisplayExpression(
    speakerId,
    expression
) {
    if (!possessionState.active) {
        return expression;
    }

    if (
        speakerId !==
        possessionState.imagin
    ) {
        return expression;
    }

    const imaginId =
        String(
            possessionState.imagin || ""
        );

    /*
     * 良太郎の普段着。
     */
    const outfitOwner =
        possessionState.outfit === "normal"
            ? "ryotaro"
            : String(
                possessionState.outfitOwner ||
                imaginId
            );

    /*
     * イマジン本人の立ち絵名の接頭辞。
     *
     * 例：
     * portrait_momotaros_base_default
     */
    const sourcePrefix =
        `portrait_${imaginId}_base_default`;

    /*
     * 憑依後の画像名の接頭辞。
     *
     * 例：
     * portrait_ryotaro_momotaros_urataros
     *
     * 中身：モモタロス
     * 服　：ウラタロス
     */
    const displayPrefix =
        `portrait_ryotaro_${imaginId}_${outfitOwner}`;

    return String(expression).replace(
        sourcePrefix,
        displayPrefix
    );
}

/*
 * 指定した話者のネームプレートを表示する。
 */
function showNamePlate(
    speakerId
) {
    const speaker =
        getSpeakerData(
            speakerId
        );

    if (
        !speaker ||
        !speaker.namePlate
    ) {
        eraseNamePlate();
        return;
    }

    if (
        window.MamiDenOMessageUI &&
        typeof MamiDenOMessageUI
            .showNamePlate ===
            "function"
    ) {
        MamiDenOMessageUI
            .showNamePlate(
                speaker.namePlate
            );
    }
}

function eraseNamePlate() {
    if (
        window.MamiDenOMessageUI &&
        typeof MamiDenOMessageUI
            .hideNamePlate ===
            "function"
    ) {
        MamiDenOMessageUI
            .hideNamePlate();
    }
}

function eraseNamePlate() {
    if (
        window.MamiDenOMessageUI &&
        typeof MamiDenOMessageUI
            .hideNamePlate ===
            "function"
    ) {
        MamiDenOMessageUI
            .hideNamePlate();
    }
}
    
/*
 * 指定スロットのピクチャ番号を返す。
 *
 * slotNumber：
 * 1～5
 */
function getPortraitPictureId(
    slotNumber
) {
    return (
        pictureId +
        Number(slotNumber) -
        1
    );
}

/*
 * 指定スロットへ立ち絵を表示する。
 *
 * 新しく登場する場合だけ、
 * 透明な状態から軽くフェードインする。
 *
 * すでに同じスロットに立ち絵がある場合は、
 * 表情変更として即座に差し替える。
 */
function showPortraitInSlot(
    slotNumber,
    filename,
    speakerId
) {
    if (
    !filename ||
    getPortraitSlotX(
        slotNumber
    ) === undefined
) {
    return;
}
    /*
 * 転倒・復帰演出中のキャラクターは、
 * 通常の立ち絵表示処理で上書きしない。
 */
if (speakerId) {
    const protectedMotionState =
        portraitMotionStates.find(
            state =>
                state.speakerId ===
                    speakerId &&
                (
                    state.phase === "fallen" ||
                    state.phase === "recoverLoading" ||
                    state.phase === "recoverReady" ||
                    state.phase === "fadeIn"
                )
        );

    if (protectedMotionState) {
        return;
    }
}

    const targetPictureId =
        getPortraitPictureId(
            slotNumber
        );

    const distanceData =
        getPortraitDistanceData(
            speakerId
        );

    const currentPicture =
        $gameScreen.picture(
            targetPictureId
        );

    /*
     * 同じ画像がすでに表示されているなら、
     * 表示し直さない。
     *
     * 距離変更は専用関数で行う。
     */
    if (
        currentPicture &&
        typeof currentPicture.name ===
            "function" &&
        currentPicture.name() ===
            filename
    ) {
        return;
    }

    /*
     * すでにその場所にキャラがいる場合。
     * 表情だけ差し替える。
     */
    if (currentPicture) {
        $gameScreen.showPicture(
            targetPictureId,
            filename,
            1,
            getPortraitSlotX(
    slotNumber
),
            distanceData.y,
            distanceData.scale,
            distanceData.scale,
            255,
            0
        );

        return;
    }

    /*
     * 新規登場時。
     * 透明度0からフェードイン。
     */
    $gameScreen.showPicture(
        targetPictureId,
        filename,
        1,
        getPortraitSlotX(
    slotNumber
),
        distanceData.y,
        distanceData.scale,
        distanceData.scale,
        0,
        0
    );

    $gameScreen.movePicture(
        targetPictureId,
        1,
        getPortraitSlotX(
    slotNumber
),
        distanceData.y,
        distanceData.scale,
        distanceData.scale,
        255,
        0,
        PORTRAIT_FADE_DURATION
    );
}
/*
 * 指定スロットの色調変更
 */
function tintPortraitSlot(
    slotNumber,
    tone
) {
    $gameScreen.tintPicture(
        getPortraitPictureId(
            slotNumber
        ),
        tone,
        PORTRAIT_TONE_DURATION
    );
}
/*
 * 全員を暗くする
 */
function darkenAllPortraits() {
    for (
        let slotNumber = 1;
        slotNumber <=
        MAX_PORTRAIT_COUNT;
        slotNumber++
    ) {
        tintPortraitSlot(
            slotNumber,
            INACTIVE_PORTRAIT_TONE
        );
    }
}
/*
 * 指定キャラクターの立ち絵を、
 * 他の立ち絵より手前へ移動する。
 *
 * ピクチャそのものは変更せず、
 * Sprite_Pictureの描画順だけ変更する。
 *
 * ウィンドウUIより前には出ない。
 */
function bringPortraitToFront(
    speakerId
) {
    const id =
        String(speakerId || "");

    const slotNumber =
        currentPortraitSlots[id];

    if (!slotNumber) {
        return;
    }

    const targetPictureId =
        getPortraitPictureId(
            slotNumber
        );

    const scene =
        SceneManager._scene;

    if (
        !scene ||
        !scene._spriteset ||
        !scene._spriteset._pictureContainer
    ) {
        return;
    }

    const container =
        scene._spriteset._pictureContainer;

    const sprite =
        container.children.find(
            child =>
                child &&
                child._pictureId ===
                    targetPictureId
        );

    if (!sprite) {
        return;
    }

    /*
     * 同じpictureContainer内の
     * 一番手前へ移動する。
     *
     * UIのWindowLayerは別なので、
     * メッセージウィンドウより
     * 前には出ない。
     */
    container.addChild(
        sprite
    );
}

/*
 * 話者だけ明るくする
 */
function highlightSpeaker(
    speakerId
) {
    const id =
        String(speakerId || "");

    const slotNumber =
        currentPortraitSlots[id];

    /*
     * 現在画面に存在する
     * 立ち絵スロット。
     */
    const visibleSlots =
        Object.values(
            currentPortraitSlots
        ).filter(
            value =>
                Number(value) > 0
        );

    /*
     * 澪が話している場合。
     *
     * 一対一なら相手は明るいまま。
     * 複数人なら全員暗くする。
     */
    if (id === "mio") {
        if (
            visibleSlots.length >= 2
        ) {
            darkenAllPortraits();
        } else if (
            visibleSlots.length === 1
        ) {
            tintPortraitSlot(
                visibleSlots[0],
                ACTIVE_PORTRAIT_TONE
            );
        }

        return;
    }

    /*
     * 憑依中の良太郎の内声など、
     * 画面に立ち絵を持たない話者。
     */
    if (!slotNumber) {
        return;
    }

    /*
     * 通常の立ち絵キャラクター。
     */
    darkenAllPortraits();

    tintPortraitSlot(
        slotNumber,
        ACTIVE_PORTRAIT_TONE
    );

    /*
     * 話者を立ち絵同士の最前面へ。
     */
    bringPortraitToFront(
        id
    );
}
/*
 * すべての立ち絵を消す。
 */
function eraseAllPortraits() {

    portraitDistanceFadeStates = [];

    pendingRestoreAfterDistanceFade =
        false;

    for (
        let slotNumber = 1;
        slotNumber <=
            MAX_PORTRAIT_COUNT;
        slotNumber++
    ) {
        $gameScreen.erasePicture(
            getPortraitPictureId(
                slotNumber
            )
        );
    }

    currentPortraitSlots = {};
    currentPortraitCount = 0;
}
/*
 * 指定キャラクターの立ち絵モーションを開始する。
 */
function playPortraitMotion(
    speakerId,
    motionName
) {
    const speaker =
        String(speakerId || "");

    const motion =
        String(motionName || "");

    const slotNumber =
        currentPortraitSlots[
            speaker
        ];

    if (!slotNumber) {
        return;
    }

    const targetPictureId =
        getPortraitPictureId(
            slotNumber
        );

    const picture =
        $gameScreen.picture(
            targetPictureId
        );

    if (!picture) {
        return;
    }

    /*
 * recoverは、
 * 既存のfallen状態を使って復帰する。
 *
 * 先に状態を削除してはいけない。
 */
if (motion === "recover") {
    startRecoverMotion(
        speaker
    );

    return;
}

/*
 * 新しいモーションを始める時だけ、
 * 同じキャラの古い状態を削除する。
 */
portraitMotionStates =
    portraitMotionStates.filter(
        state =>
            state.speakerId !== speaker
    );

switch (motion) {
    case "tripFall":
        startTripFallMotion(
            speaker,
            slotNumber,
            targetPictureId,
            picture
        );
        break;
}
/*
 * 転倒して画面外にいるキャラの
 * 復帰準備を開始する。
 */
}
function startRecoverMotion(
    speakerId
) {
    const state =
        portraitMotionStates.find(
            motionState =>
                motionState.speakerId ===
                    speakerId &&
                motionState.phase ===
                    "fallen"
        );

    if (!state) {
        return;
    }

    /*
     * 表情変更を伴わない場合にも備えて、
     * 復帰画像を読み込む。
     */
    if (!state.recoverBitmap) {
        state.recoverBitmap =
            ImageManager.loadPicture(
                state.filename
            );
    }

    /*
     * まだここでは表示しない。
     *
     * updatePortraitMotions側で
     * 画像の読込完了を待つ。
     */
    state.phase =
        "recoverLoading";

    state.wait = 0;
}
/*
 * 何もない場所で転び、
 * 画面下へ落ちるモーション。
 */
function startTripFallMotion(
    speakerId,
    slotNumber,
    pictureId,
    picture
) {
    const state = {
        speakerId:
            speakerId,

        slotNumber:
            slotNumber,

        pictureId:
            pictureId,

        filename:
            picture.name(),

        baseX:
            picture.x(),

        baseY:
            picture.y(),

        scaleX:
            picture.scaleX(),

        scaleY:
            picture.scaleY(),

        blendMode:
            picture.blendMode(),

        phase:
            "stumble",

        wait:
            3
    };

    portraitMotionStates.push(
        state
    );

    /*
     * 転ぶ直前に、
     * 一瞬だけ前へつんのめる。
     */
    $gameScreen.movePicture(
        pictureId,
        1,
        state.baseX + 12,
        state.baseY - 8,
        state.scaleX,
        state.scaleY,
        255,
        state.blendMode,
        3
    );
}
/*
 * 立ち絵モーションを毎フレーム進行する。
 */
function updatePortraitMotions() {
    if (
        portraitMotionStates.length === 0
    ) {
        return;
    }

    for (
        let index =
            portraitMotionStates.length - 1;
        index >= 0;
        index--
    ) {
        const state =
            portraitMotionStates[
                index
            ];

        state.wait--;

        if (state.wait > 0) {
            continue;
        }

        const picture =
            $gameScreen.picture(
                state.pictureId
            );

        if (!picture) {
            portraitMotionStates.splice(
                index,
                1
            );

            continue;
        }

        if (
            state.phase ===
            "stumble"
        ) {
    /*
     * 転倒音。
     */
    AudioManager.playSe({
        name: "Blow2",
        volume: 15,
        pitch: 100,
        pan: 0
    });

    /*
     * 軽い画面揺れ。
     *
     * power:
     *   揺れの強さ
     *
     * speed:
     *   揺れる速さ
     *
     * duration:
     *   継続フレーム
     */
    $gameScreen.startShake(
        3,
        6,
        10
    );
            /*
             * つんのめったあと、
             * 勢いよく画面下へ落ちる。
             */
            $gameScreen.movePicture(
                state.pictureId,
                1,
                state.baseX + 45,
                state.baseY + 900,
                state.scaleX,
                state.scaleY,
                255,
                state.blendMode,
                10
            );

            state.phase =
                "fall";

            state.wait = 10;

            continue;
        }

        if (
            state.phase ===
            "fall"
        ) {
            /*
             * 画面外へ落ちた状態で停止する。
             *
             * recoverモーションが来るまで
             * 自動では戻らない。
             */
            state.phase =
                "fallen";

            state.wait = 0;

            continue;
        }
        /*
 * 転倒後は、
 * recoverが呼ばれるまで
 * モーション状態を保持する。
 */
if (
    state.phase ===
    "fallen"
) {
    continue;
}
/*
 * 復帰用画像の読込待ち。
 *
 * 読み込みが完了するまでは、
 * 画面外に倒れたままにする。
 */
if (
    state.phase ===
    "recoverLoading"
) {
    if (
        state.recoverBitmap &&
        !state.recoverBitmap.isReady()
    ) {
        continue;
    }

    /*
     * 画像の準備ができてから、
     * 透明度0で元位置へ配置する。
     */
    $gameScreen.showPicture(
        state.pictureId,
        state.filename,
        1,
        state.baseX,
        state.baseY + 60,
        state.scaleX,
        state.scaleY,
        0,
        state.blendMode
    );

    state.phase =
        "recoverReady";

    /*
     * 透明状態を確実に
     * 1フレーム描画する。
     */
    state.wait = 1;

    continue;
}        
/*
 * 透明状態で元位置へ戻したあと、
 * 次のフレームからフェードイン。
 */
if (
    state.phase ===
    "recoverReady"
) {
    $gameScreen.movePicture(
    state.pictureId,
    1,
    state.baseX,
    state.baseY,
    state.scaleX,
    state.scaleY,
    255,
    state.blendMode,
    PORTRAIT_RECOVER_FADE_DURATION
);

state.phase =
    "fadeIn";

state.wait =
    PORTRAIT_RECOVER_FADE_DURATION;

    continue;
}
        /*
         * 復帰完了。
         */
        portraitMotionStates.splice(
            index,
            1
        );
    }
}
function movePortraitDistance(
    speakerId,
    distance
) {
    const id =
        String(speakerId || "");

    const slotNumber =
        currentPortraitSlots[id];

    if (!slotNumber) {
        return;
    }

    const distanceName =
        PORTRAIT_DISTANCE_DATA[
            distance
        ]
            ? distance
            : "normal";

    currentPortraitDistance[id] =
        distanceName;

    const distanceData =
        PORTRAIT_DISTANCE_DATA[
            distanceName
        ];

    $gameScreen.movePicture(
        getPortraitPictureId(
            slotNumber
        ),
        1,
        getPortraitSlotX(
    slotNumber
),
        distanceData.y,
        distanceData.scale,
        distanceData.scale,
        255,
        0,
        PORTRAIT_DISTANCE_DURATION
    );
}
function fadePortraitDistance(
    speakerId,
    distance
) {
    const id =
        String(speakerId || "");

    const slotNumber =
        currentPortraitSlots[id];

    if (!slotNumber) {
        return false;
    }

    const distanceName =
        PORTRAIT_DISTANCE_DATA[
            distance
        ]
            ? distance
            : "normal";

    const targetPictureId =
        getPortraitPictureId(
            slotNumber
        );

    const picture =
        $gameScreen.picture(
            targetPictureId
        );

    if (!picture) {
        return false;
    }

    /*
     * すでに目標距離なら何もしない。
     */
    const currentDistance =
        currentPortraitDistance[id] ||
        "normal";

    if (
        currentDistance ===
            distanceName &&
        !portraitDistanceFadeStates.some(
            state =>
                state.speakerId === id
        )
    ) {
        return false;
    }

    /*
     * 同じキャラの古い距離処理を削除。
     */
    /*
 * 同じキャラの古い距離処理を削除。
 */
portraitDistanceFadeStates =
    portraitDistanceFadeStates.filter(
        state =>
            state.speakerId !== id
    );

portraitDistanceFadeStates.push({
    speakerId:
        id,

    slotNumber:
        slotNumber,

    pictureId:
        targetPictureId,

    filename:
        picture.name(),

    distance:
        distanceName,

    phase:
        "fadeOut",

    wait:
        PORTRAIT_FADE_DURATION
});

    /*
     * 座標と拡大率は一切変えず、
     * 透明度だけ0へ下げる。
     */
    $gameScreen.movePicture(
        targetPictureId,
        1,
        picture.x(),
        picture.y(),
        picture.scaleX(),
        picture.scaleY(),
        0,
        picture.blendMode(),
        PORTRAIT_FADE_DURATION
    );

    return true;
}
function updatePortraitDistanceFade() {
    if (
        portraitDistanceFadeStates
            .length === 0
    ) {
        return;
    }

    for (
        let index =
            portraitDistanceFadeStates
                .length - 1;
        index >= 0;
        index--
    ) {
        const state =
            portraitDistanceFadeStates[
                index
            ];

        state.wait--;

        if (state.wait > 0) {
            continue;
        }
        /*
         * 倒れたまま待機中。
         */
        if (
            state.phase ===
            "fallen"
        ) {
            continue;
        }

        const distanceData =
            PORTRAIT_DISTANCE_DATA[
                state.distance
            ] ||
            PORTRAIT_DISTANCE_DATA.normal;

        const picture =
            $gameScreen.picture(
                state.pictureId
            );

        if (!picture) {
            portraitDistanceFadeStates
                .splice(
                    index,
                    1
                );

            continue;
        }

        if (
            state.phase ===
            "fadeOut"
        ) {
            /*
             * 完全に透明な状態で、
             * 座標と拡大率を即座に変更。
             */
            currentPortraitDistance[
                state.speakerId
            ] =
                state.distance;

            /*
 * 完全に透明な間に、
 * 新しい座標・サイズで画像を即時再表示する。
 *
 * opacityは0なので画面上では見えない。
 */
$gameScreen.showPicture(
    state.pictureId,
    state.filename,
    1,
    getPortraitSlotX(
        state.slotNumber
    ),
    distanceData.y,
    distanceData.scale,
    distanceData.scale,
    0,
    picture.blendMode()
);

            /*
             * 新しいサイズのまま、
             * 透明度だけ255へ戻す。
             */
            $gameScreen.movePicture(
                state.pictureId,
                1,
                getPortraitSlotX(
    state.slotNumber
),
                distanceData.y,
                distanceData.scale,
                distanceData.scale,
                255,
                picture.blendMode(),
                PORTRAIT_FADE_DURATION
            );

            state.phase =
                "fadeIn";

            state.wait =
                PORTRAIT_FADE_DURATION;

            continue;
        }

        /*
         * フェードイン完了。
         */
        portraitDistanceFadeStates.splice(
            index,
            1
        );
    }

    /*
     * 全員の距離フェードが終わったあと、
     * 保留していた通常立ち絵復元を実行。
     */
    if (
        portraitDistanceFadeStates
            .length === 0 &&
        pendingRestoreAfterDistanceFade
    ) {
        pendingRestoreAfterDistanceFade =
            false;

        restoreSoloPortrait();
    }
}
/*
 * participantsの1件を
 * 共通形式へ変換する。
 *
 * 文字列形式：
 * "momotaros"
 *
 * オブジェクト形式：
 * {
 *     speaker: "momotaros",
 *     expression: "画像名"
 * }
 */
function normalizeParticipant(
    participant
) {
    if (
        typeof participant ===
        "string"
    ) {
        return {
            speaker:
                participant,

            expression:
                ""
        };
    }

    if (
        participant &&
        typeof participant ===
            "object"
    ) {
        return {
            speaker:
                String(
                    participant.speaker ||
                    participant.id ||
                    ""
                ),

            expression:
                String(
                    participant.expression ||
                    ""
                )
        };
    }

    return {
        speaker: "",
        expression: ""
    };
}
/*
 * ─────────────────────────────
 * 憑依中の会話除外判定
 * ─────────────────────────────
 */

/*
 * 指定した話者が、
 * 会話データ内に含まれているか確認する。
 */
function talkIncludesSpeaker(
    talk,
    speakerId
) {
    if (!talk) {
        return false;
    }

    const target =
        String(speakerId || "");

    /*
     * participantsを確認する。
     */
    if (
        Array.isArray(
            talk.participants
        )
    ) {
        const found =
            talk.participants.some(
                participant => {
                    const normalized =
                        normalizeParticipant(
                            participant
                        );

                    return (
                        normalized.speaker ===
                        target
                    );
                }
            );

        if (found) {
            return true;
        }
    }

    /*
     * pages内の話者を確認する。
     */
    if (
        Array.isArray(
            talk.pages
        )
    ) {
        const found =
            talk.pages.some(
                page => {
                    if (!page) {
                        return false;
                    }

                    return (
                        String(
                            page.speaker ||
                            talk.speaker ||
                            defaultSpeaker
                        ) === target
                    );
                }
            );

        if (found) {
            return true;
        }
    }

    /*
     * text形式の話者を確認する。
     */
    return (
        String(
            talk.speaker || ""
        ) === target
    );
}

/*
 * 現在の憑依状態で、
 * 会話を使用できるか判定する。
 */
function isTalkAvailableForPossession(
    talk
) {
    if (!talk) {
        return false;
    }

    /*
     * 憑依中限定。
     */
    if (
        talk.onlyWhenPossessed === true &&
        !possessionState.active
    ) {
        return false;
    }

    /*
     * 未憑依時限定。
     *
     * イマジン本人の姿でしか
     * 成立しない会話などに使用する。
     */
    if (
        talk.onlyWhenUnpossessed === true &&
        possessionState.active
    ) {
        return false;
    }

    /*
     * 憑依中には出さない会話。
     */
    if (
        talk.excludeWhenPossessed === true &&
        possessionState.active
    ) {
        return false;
    }

    /*
     * 特定のイマジンが
     * 憑依している時だけ使用する。
     *
     * 例：
     * possessedBy: "momotaros"
     */
    if (
        talk.possessedBy !== undefined
    ) {
        if (!possessionState.active) {
            return false;
        }

        if (
            !conditionIncludes(
                talk.possessedBy,
                possessionState.imagin
            )
        ) {
            return false;
        }
    }

    /*
     * 特定の服装限定。
     *
     * 例：
     * possessionOutfit:
     *     "imagin_preference"
     */
    if (
        talk.possessionOutfit !== undefined
    ) {
        if (!possessionState.active) {
            return false;
        }

        if (
            !conditionIncludes(
                talk.possessionOutfit,
                possessionState.outfit
            )
        ) {
            return false;
        }
    }
    /*
 * 特定の服装所有者限定。
 *
 * 例：
 * possessionOutfitOwner:
 *     "momotaros"
 *
 * モモ服、ウラ服などを
 * 厳密に判定するために使用する。
 */
if (
    talk.possessionOutfitOwner !== undefined
) {
    if (!possessionState.active) {
        return false;
    }

    if (
        !conditionIncludes(
            talk.possessionOutfitOwner,
            possessionState.outfitOwner
        )
    ) {
        return false;
    }
}

    /*
     * 未憑依なら、
     *ここから下の憑依中除外判定は不要。
     */
    if (!possessionState.active) {
        return true;
    }

    /*
     * 憑依されている良太郎本人を含む
     * 通常会話は除外する。
     *
     * 憑依中でも良太郎の内側の声を
     *使いたい特殊会話では、
     * allowHostWhilePossessed: true
     * を指定する。
     */
    if (
        talk.allowHostWhilePossessed !==
            true &&
        talkIncludesSpeaker(
            talk,
            possessionState.host
        )
    ) {
        return false;
    }

    return true;
}
/*
 * 現在のメインキャラクターが
 * 会話に参加しているか判定する。
 */
function isTalkAvailableForMainCharacter(
    talk
) {
    if (!talk) {
        return false;
    }

    /*
     * メインキャラに関係なく
     * 使用したい特殊会話用。
     */
    if (
        talk.ignoreMainCharacter ===
        true
    ) {
        return true;
    }

    const mainSpeaker =
        String(
            currentSoloPortrait.speaker ||
            defaultSpeaker
        );

    return talkIncludesSpeaker(
        talk,
        mainSpeaker
    );
}
/*
 * 参加者全員を人数に応じて配置する。
 */
/*
 * 参加者全員を人数に応じて配置する。
 *
 * 現在と同じキャラが同じ位置にいる場合は、
 * 立ち絵を消さずに表情だけ更新する。
 *
 * 人数や配置が変わる場合だけ、
 * 一度消してフェードインさせる。
 */
function showParticipants(
    participants
) {
    const normalized =
        normalizeArray(
            participants
        )
            .map(
                normalizeParticipant
            )
            .filter(
                participant =>
                    participant.speaker &&
                    participant.speaker !==
                        "mio"
            )
            .slice(
                0,
                MAX_PORTRAIT_COUNT
            );

    if (
        normalized.length === 0
    ) {
        return;
    }

const layout =
    PORTRAIT_LAYOUT[
        normalized.length
    ] ||
    PORTRAIT_LAYOUT[5];

const sameLayout =
    normalized.length !== 3 &&
    normalized.every(
        (
            participant,
            index
        ) => {
            return (
                currentPortraitSlots[
                    participant.speaker
                ] ===
                layout[index]
            );
        }
    ) &&
    Object.keys(
        currentPortraitSlots
    ).length ===
    normalized.length;

if (!sameLayout) {
    /*
     * ここではまだ以前の人数情報のまま。
     *
     * まず以前の配置を完全に消す。
     */
    eraseAllPortraits();

    currentPortraitSlots = {};

    /*
     * 消し終わってから、
     * 新しい人数へ切り替える。
     */
    currentPortraitCount =
        normalized.length;

    normalized.forEach(
        (
            participant,
            index
        ) => {
            const slotNumber =
                layout[index];

            currentPortraitSlots[
                participant.speaker
            ] = slotNumber;

            if (
                participant.expression
            ) {
                showPortraitInSlot(
                    slotNumber,

                    getDisplayExpression(
                        participant.speaker,
                        participant.expression
                    ),

                    participant.speaker
                );
            }
        }
    );
    /*
 * 3人表示時は中央スロットを
 * 参加者2人目の立ち絵で明示的に確定する。
 *
 * 通常時のメインキャラクターが
 * スロット3へ残る／再表示される事故対策。
 */
if (
    normalized.length === 3
) {
    const centerParticipant =
        normalized[1];

    if (
        centerParticipant &&
        centerParticipant.expression
    ) {
        /*
         * 中央スロットを一度完全に消す。
         */
        $gameScreen.erasePicture(
            getPortraitPictureId(3)
        );

        /*
         * 中央担当を改めて3番へ表示。
         */
        showPortraitInSlot(
            3,

            getDisplayExpression(
                centerParticipant.speaker,
                centerParticipant.expression
            ),

            centerParticipant.speaker
        );

        /*
         * キャラ→スロット対応も
         * 念のため確定しておく。
         */
        currentPortraitSlots[
            centerParticipant.speaker
        ] = 3;
    }
}
} else {

    currentPortraitCount =
        normalized.length;

    /*
     * 配置が同じなら消さない。
     */
    normalized.forEach(
        participant => {
            if (
                !participant.expression
            ) {
                return;
            }

            const slotNumber =
                currentPortraitSlots[
                    participant.speaker
                ];

            showPortraitInSlot(
                slotNumber,

                getDisplayExpression(
                    participant.speaker,
                    participant.expression
                ),

                participant.speaker
            );
        }
    );
}

    /*
     * 先頭キャラクターを話者として明るくする。
     */
    highlightSpeaker(
        normalized[0].speaker
    );
}

/*
 * ─────────────────────────────
 * 一対一表示
 * ─────────────────────────────
 */

/*
 * 通常時のメインキャラクターを設定し、
 * 一人だけ表示する。
 *
 * saveStateがtrueなら、
 * 会話終了後に戻る状態として保存する。
 */
function showSoloPortrait(
    speakerId,
    expression,
    saveState = true
) {
    /*
     * 複数人会話中に、
     * 放置処理や外部処理などから
     * 一人表示が割り込むのを防ぐ。
     *
     * 正式な会話終了復元時だけ許可する。
     */
    if (
        isTemporaryGroupTalk &&
        !isRestoringSoloPortrait
    ) {
        return;
    }

    const speaker =
        String(
            speakerId ||
            defaultSpeaker
        );

    const filename =
        String(
            expression ||
            defaultExpression
        );

    if (saveState) {
        currentSoloPortrait = {
            speaker: speaker,
            expression: filename
        };
    }

    showParticipants([
        {
            speaker: speaker,
            expression: filename
        }
    ]);

    highlightSpeaker(
        speaker
    );
}

/*
 * 複数人会話の開始前に、
 * 現在の一対一状態を保存する。
 */
function saveSoloPortraitForReturn() {
    /*
     * 選択肢返答などで同じ会話が続いても、
     * 一時表示状態を保存し直さない。
     */
    if (isTemporaryGroupTalk) {
        return;
    }

    returnSoloPortrait = {
        speaker:
            currentSoloPortrait.speaker,

        expression:
            currentSoloPortrait.expression
    };

    isTemporaryGroupTalk = true;
}

/*
 * 会話開始前の一対一状態へ戻す。
 */
function restoreSoloPortrait() {
    const returnState =
        returnSoloPortrait ||
        currentSoloPortrait ||
        {
            speaker:
                defaultSpeaker,

            expression:
                defaultExpression
        };

    isRestoringSoloPortrait = true;

showSoloPortrait(
    returnState.speaker,
    returnState.expression,
    false
);

isRestoringSoloPortrait = false;

    currentSoloPortrait = {
        speaker:
            returnState.speaker,

        expression:
            returnState.expression
    };

    returnSoloPortrait = null;
    isTemporaryGroupTalk = false;
}
/*
 * 配列からランダムで1件選ぶ。
 */
function selectRandomTalkFromList(
    talkList
) {
    if (
        !Array.isArray(talkList) ||
        talkList.length === 0
    ) {
        return null;
    }

    return talkList[
        Math.floor(
            Math.random() *
            talkList.length
        )
    ];
}

/*
 * 現在キャラと次キャラに応じた
 * 交代会話を取得する。
 */
function getCharacterChangeTalk(
    currentSpeaker,
    nextSpeaker
) {
    const pairKey =
        `${currentSpeaker}_to_${nextSpeaker}`;

    /*
     * 1. 組み合わせ専用
     */
    const pairTalk =
        selectRandomTalkFromList(
            CHARACTER_CHANGE_TALK_DATA[
                pairKey
            ]
        );

    if (pairTalk) {
        return pairTalk;
    }

    /*
     * 2. 次キャラ用の汎用
     */
    const targetKey =
        `to_${nextSpeaker}`;

    const targetTalk =
        selectRandomTalkFromList(
            CHARACTER_CHANGE_TALK_DATA[
                targetKey
            ]
        );

    if (targetTalk) {
        return targetTalk;
    }

    /*
     * 3. 最終保険
     */
    return selectRandomTalkFromList(
        CHARACTER_CHANGE_TALK_DATA
            .default
    );
}
/*
 * 現在の服の持ち主を返す。
 */
function getCurrentPossessionOutfitOwner() {
    if (
        possessionState.outfit ===
        "normal"
    ) {
        return "ryotaro";
    }

    return String(
        possessionState.outfitOwner ||
        possessionState.imagin ||
        "ryotaro"
    );
}

/*
 * 憑依横取り会話を取得する。
 */
function getPossessionStealTalk(
    fromImagin,
    toImagin
) {
    const routeKey =
        `${fromImagin}_to_${toImagin}`;

    const routeData =
        POSSESSION_STEAL_TALK_DATA[
            routeKey
        ];

    if (!routeData) {
        return null;
    }

    const outfitOwner =
        getCurrentPossessionOutfitOwner();

    const talks =
        routeData[outfitOwner] ||
        routeData.ryotaro;

    if (
        !Array.isArray(talks) ||
        talks.length === 0
    ) {
        return null;
    }

    return {
        beforeTalk:
            talks[0] || null,

        afterTalk:
            talks[1] || null
    };
}
/*
 * 憑依中のイマジンから、
 * 別のイマジンが憑依を横取りする。
 */
function showPossessionStealEvent(
    nextImagin
) {
    if (
        !possessionState.active
    ) {
        return false;
    }

    const currentImagin =
        String(
            possessionState.imagin || ""
        );

    const targetImagin =
        String(nextImagin || "");

    if (
        !currentImagin ||
        !targetImagin ||
        currentImagin === targetImagin
    ) {
        return false;
    }

    const talkSet =
        getPossessionStealTalk(
            currentImagin,
            targetImagin
        );

    if (!talkSet) {
        console.warn(
            `[${pluginName}] 憑依横取り会話がありません: ` +
            `${currentImagin} -> ${targetImagin}`
        );

        return false;
    }

    /*
     * 暗転後に実行する横取り処理。
     *
     * outfitとoutfitOwnerは変更しない。
     */
    pendingPossessionAction = {
        type: "steal",
        imagin: targetImagin,

        afterTalk:
            talkSet.afterTalk || null
    };

    enqueueTalkMessage(
        talkSet.beforeTalk
    );

    requestExpressionReset();

    return true;
}
/*
 * 会話演出つきで、
 * メインキャラクターを交代する。
 */
function changeMainCharacter(
    speakerId,
    expression
) {
    if ($gameMessage.isBusy()) {
        return;
    }

    const nextSpeaker =
        String(
            speakerId ||
            defaultSpeaker
        );

    /*
     * 憑依中に良太郎を呼んだ場合。
     *
     * 現在の憑依を解除して、
     * 良太郎へ戻す。
     */
    if (
        possessionState.active &&
        nextSpeaker === "ryotaro"
    ) {
        showForceReleaseEvent();
        return;
    }

    /*
     * 憑依中に別のイマジンを呼んだ場合。
     *
     * 通常のメイン交代ではなく、
     * 憑依の横取りイベントにする。
     */
    if (
        possessionState.active &&
        nextSpeaker !==
            possessionState.imagin &&
        (
            nextSpeaker === "momotaros" ||
            nextSpeaker === "urataros"
        )
    ) {
        if (
            showPossessionStealEvent(
                nextSpeaker
            )
        ) {
            return;
        }
    }

    const nextExpression =
        String(
            expression ||
            defaultExpression
        );

    const currentSpeaker =
        String(
            currentSoloPortrait.speaker ||
            defaultSpeaker
        );

    const changeTalk =
        getCharacterChangeTalk(
            currentSpeaker,
            nextSpeaker
        );

    /*
     * 会話後に変更する対象を保存。
     */
    pendingMainCharacterChange = {
        speaker:
            nextSpeaker,

        expression:
            nextExpression
    };

    /*
     * 交代会話がある場合。
     */
    if (changeTalk) {
        enqueueTalkMessage(
            changeTalk
        );

        requestExpressionReset();

        return;
    }

    /*
     * 会話が一件もなければ、
     * 即座に交代する。
     */
    showSoloPortrait(
        nextSpeaker,
        nextExpression,
        true
    );

    pendingMainCharacterChange =
        null;
}
/*
 * ─────────────────────────────
 * 憑依イベント
 * ─────────────────────────────
 */

/*
 * 憑依ボタンから呼ばれる入口。
 */
function startPossessionEvent() {
    if ($gameMessage.isBusy()) {
        return;
    }

    /*
     * すでに憑依中なら、
     * 解除確認を表示する。
     */
    if (possessionState.active) {
        showPossessionReleaseChoice();
        return;
    }

    const mainSpeaker =
        String(
            currentSoloPortrait.speaker ||
            defaultSpeaker
        );

    /*
     * 良太郎がメインなら、
     * 誰が憑依するかを選択する。
     */
    if (mainSpeaker === "ryotaro") {
        showPossessionTargetChoice();
        return;
    }

    /*
 * イマジン本人がメインなら、
 * 良太郎へ憑依するか確認する。
 */
if (
    mainSpeaker === "momotaros" ||
    mainSpeaker === "urataros"
) {
    showPossessionConfirmChoice(
        mainSpeaker
    );

    return;
}

    /*
     * まだ憑依処理がないキャラなら
     * 何もしない。
     */
    console.warn(
        `[${pluginName}] このキャラクターの憑依イベントは未登録です: ${mainSpeaker}`
    );
}

/*
 * 良太郎がメインの場合の、
 * 憑依するイマジン選択。
 *
 */
function showPossessionTargetChoice() {
    $gameMessage.setChoices(
        [
            "モモタロス",
            "ウラタロス",
            "やめる"
        ],
        0,
        2
    );

    $gameMessage.setChoicePositionType(
        2
    );

    $gameMessage.setChoiceBackground(
        0
    );

    $gameMessage.setChoiceCallback(
        selectedIndex => {
            if (selectedIndex === 0) {
                reservePossessionStartTalk(
                    "momotaros",
                    "startFromRyotaro"
                );

                return;
            }

            if (selectedIndex === 1) {
                reservePossessionStartTalk(
                    "urataros",
                    "startFromRyotaro"
                );
            }
        }
    );
}

/*
 * イマジン本人がメインの場合の、
 * 良太郎へ憑依するか確認。
 */
function showPossessionConfirmChoice(
    imaginId
) {
    $gameMessage.setChoices(
        [
            "良太郎に憑依する",
            "やめる"
        ],
        0,
        1
    );

    $gameMessage.setChoicePositionType(
        2
    );

    $gameMessage.setChoiceBackground(
        0
    );

    $gameMessage.setChoiceCallback(
        selectedIndex => {
            if (selectedIndex === 0) {
                reservePossessionStartTalk(
                    imaginId,
                    "startFromImagin"
                );
            }
        }
    );
}

/*
 * 憑依開始会話を予約する。
 *
 * 選択肢コールバック内で
 * 直接メッセージを追加すると
 * ツクール側に消されることがあるため、
 * 一度保留する。
 */
function reservePossessionStartTalk(
    imaginId,
    talkType
) {
    const data =
        POSSESSION_EVENT_DATA[
            imaginId
        ];

    if (!data) {
        console.warn(
            `[${pluginName}] 憑依会話データがありません: ${imaginId}`
        );

        return;
    }

    const talk =
        selectRandomTalkFromList(
            data[talkType]
        );

    if (!talk) {
        console.warn(
            `[${pluginName}] 憑依開始会話がありません: ${imaginId}/${talkType}`
        );

        return;
    }

    pendingPossessionTalk =
        talk;

    pendingPossessionAction = {
        type: "start",
        imagin:
            imaginId,
        outfit:
            "normal"
    };
}

/*
 * 憑依中にボタンを押した場合。
 */
function showPossessionReleaseChoice() {
    $gameMessage.setChoices(
        [
            "このままでいる",
            "憑依を解く"
        ],
        0,
        0
    );

    $gameMessage.setChoicePositionType(
        2
    );

    $gameMessage.setChoiceBackground(
        0
    );

    $gameMessage.setChoiceCallback(
        selectedIndex => {
            if (selectedIndex !== 1) {
                return;
            }

            reservePossessionReleaseTalk();
        }
    );
}

/*
 * 憑依解除会話を予約する。
 */
function reservePossessionReleaseTalk() {
    const imaginId =
        String(
            possessionState.imagin ||
            ""
        );

    const data =
        POSSESSION_EVENT_DATA[
            imaginId
        ];

    if (!data) {
        console.warn(
            `[${pluginName}] 憑依解除会話データがありません: ${imaginId}`
        );

        return;
    }

    const releaseTalkKey =
    possessionState.outfit ===
        "imagin_preference"
        ? "releaseImaginPreference"
        : "release";

const talk =
    selectRandomTalkFromList(
        data[releaseTalkKey]
    );

    if (!talk) {
        console.warn(
            `[${pluginName}] 憑依解除会話がありません: ${imaginId}`
        );

        return;
    }

    pendingPossessionTalk =
        talk;

    pendingPossessionAction = {
    type: "end",

    imagin:
        imaginId,

    /*
     * モモ好みの服だった場合は、
     * 解除後に良太郎を画面へ出さない。
     */
    leaveToChangeClothes:
        possessionState.outfit ===
        "imagin_preference"
};
}
/*
 * ─────────────────────────────
 * メインキャラ交代による強制憑依解除
 * ─────────────────────────────
 */
function showForceReleaseEvent() {
    if ($gameMessage.isBusy()) {
        return;
    }

    const imaginId =
        String(
            possessionState.imagin ||
            ""
        );

    /*
     * 状態を消す前に、
     * イマジン好みの服か記録する。
     */
    const leaveToChangeClothes =
        possessionState.outfit ===
        "imagin_preference";

    const talk =
        selectRandomTalkFromList(
            FORCE_RELEASE_TALK_DATA[
                imaginId
            ]
        );

    /*
     * 会話データがない場合でも、
     * 同じ解除演出を通す。
     */
    if (!talk) {
        console.warn(
            `[${pluginName}] 強制解除会話がありません: ${imaginId}`
        );

        pendingPossessionAction = {
            type: "end",

            imagin:
                imaginId,

            leaveToChangeClothes:
                leaveToChangeClothes
        };

        /*
         * 会話がないので、
         * そのまま解除演出を開始する。
         */
        executePendingPossessionAction();

        return;
    }

    /*
     * 会話終了後に解除する。
     */
    pendingPossessionAction = {
        type: "end",

        imagin:
            imaginId,

        leaveToChangeClothes:
            leaveToChangeClothes
    };

    enqueueTalkMessage(
        talk
    );

    requestExpressionReset();
}

/*
 * イマジンごとの薄いフラッシュ色。
 *
 * [赤, 緑, 青, 強さ]
 *
 * 強さを低めにして、
 * 目に刺さらない光にする。
 */
function getPossessionFlashColor(
    imaginId
) {
    switch (
        String(imaginId || "")
    ) {
        case "momotaros":
            return [180, 45, 45, 90];

        case "urataros":
            return [45, 90, 180, 85];

        case "kintaros":
            return [190, 155, 45, 85];

        case "ryutaros":
            return [135, 65, 180, 85];

        default:
            return [180, 180, 180, 70];
    }
}

/*
 * 憑依開始演出を予約する。
 */
function startPossessionVisualEffect(
    action
) {
    possessionEffectState = {
        phase: "fadeOut",
        wait: 12,
        action: action
    };

    /*
     * 画面全体を完全に暗くする。
     * 色調変更ではなく、
     * フェードで立ち絵交換を隠す。
     */
    $gameScreen.startFadeOut(
        18
    );
}

/*
 * 憑依解除演出を予約する。
 */
function startReleaseVisualEffect(
    action
) {
    possessionEffectState = {
        phase: "fadeOut",
        wait: 12,
        action: action
    };

    /*
     * 解除時も一度完全に暗くする。
     */
    $gameScreen.startFadeOut(
        8
    );
}

/*
 * 憑依会話終了後の処理。
 *
 * ここでは姿を即座に変えず、
 * 演出の開始だけを予約する。
 */
function executePendingPossessionAction() {
    if (!pendingPossessionAction) {
        return false;
    }

    const action =
        pendingPossessionAction;

    pendingPossessionAction =
        null;

    returnSoloPortrait = null;
    isTemporaryGroupTalk = false;

    if (action.type === "start") {
        startPossessionVisualEffect(
            action
        );

        return true;
    }
    if (action.type === "steal") {
    startPossessionVisualEffect(
        action
    );

    return true;
}

    if (action.type === "end") {
        startReleaseVisualEffect(
            action
        );

        return true;
    }

    return false;
}

/*
 * 暗転が完了した瞬間に、
 * 実際の憑依状態と立ち絵を変更する。
 */
function applyPossessionEffectAction(
    action
) {
    if (!action) {
        return;
    }

    if (action.type === "start") {
        possessionState.active =
            true;

        possessionState.host =
            "ryotaro";

        possessionState.imagin =
            String(action.imagin);

        possessionState.outfit =
            String(
                action.outfit ||
                "normal"
            );
            possessionState.outfitOwner =
    possessionState.outfit ===
    "imagin_preference"
        ? String(action.imagin)
        : "ryotaro";

        showSoloPortrait(
            action.imagin,
            getDefaultExpressionForSpeaker(
                action.imagin
            ),
            true
        );

        return;
    }
/*
 * 憑依横取り。
 *
 * 現在の服装と服の持ち主は
 * そのまま維持する。
 */
if (action.type === "steal") {
    possessionState.active =
        true;

    possessionState.host =
        "ryotaro";

    possessionState.imagin =
        String(action.imagin);

    /*
     * 横取り後、最終的に中央へ戻す
     * 一人表示状態だけ先に保存する。
     */
    currentSoloPortrait = {
        speaker:
            action.imagin,

        expression:
            getDefaultExpressionForSpeaker(
                action.imagin
            )
    };

    returnSoloPortrait = {
        speaker:
            action.imagin,

        expression:
            getDefaultExpressionForSpeaker(
                action.imagin
            )
    };

    /*
     * 横取り後の会話がある場合。
     *
     * 画面が完全に暗い今のうちに、
     * 会話参加者の立ち絵配置まで済ませる。
     *
     * これにより、明転した時点で
     * 横取り後の二人配置になっている。
     */
    if (action.afterTalk) {
    /*
     * 画面が完全に暗い今のうちに、
     * 横取り後会話の立ち絵だけ配置する。
     *
     * この時点では文章を登録しない。
     */
    prepareTalkPortraits(
        action.afterTalk
    );

    /*
     * 会話本体は、
     * フェードイン完了後まで保留する。
     */
    pendingPostStealTalk =
        action.afterTalk;
} else {
    showSoloPortrait(
        action.imagin,
        getDefaultExpressionForSpeaker(
            action.imagin
        ),
        true
    );
}

    return;
}
    if (action.type === "end") {
    possessionState.active =
        false;

    possessionState.host =
        "ryotaro";

    possessionState.imagin =
        null;

    possessionState.outfit =
        "normal";

    /*
     * イマジン好みの服だった場合。
     *
     * 良太郎は着替えに行くため、
     * 立ち絵を表示しない。
     */
    if (action.leaveToChangeClothes) {
        eraseAllPortraits();

        /*
         * 内部上のメインキャラは
         * 良太郎へ戻しておく。
         *
         * ただし立ち絵は出さない。
         */
        currentSoloPortrait = {
            speaker:
                "ryotaro",

            expression:
                getDefaultExpressionForSpeaker(
                    "ryotaro"
                )
        };

        returnSoloPortrait =
            null;

        isTemporaryGroupTalk =
            false;

        pendingPostReleaseTalk =
            makeChangeClothesTalk();

        return;
    }

    /*
     * 通常服なら、
     * いつもどおり良太郎を表示。
     */
    showSoloPortrait(
        "ryotaro",
        getDefaultExpressionForSpeaker(
            "ryotaro"
        ),
        true
    );
}
}
function showSpeakerExpression(
    speakerId,
    filename
) {
    if (!filename) {
        return;
    }

    const id =
        String(
            speakerId ||
            defaultSpeaker
        );
    /*
 * 転倒して画面外にいる間は、
 * 表情画像だけ更新して、
 * その場では表示しない。
 *
 * recover時に透明状態で配置してから
 * フェードインさせる。
 */
const fallenMotionState =
    portraitMotionStates.find(
        state =>
            state.speakerId === id &&
            (
                state.phase === "fallen" ||
                state.phase === "recoverReady"
            )
    );

if (fallenMotionState) {
    const displayFilename =
        getDisplayExpression(
            id,
            filename
        );

    /*
     * 復帰時に使う画像名を保存。
     */
    fallenMotionState.filename =
        displayFilename;

    /*
     * 画像を先に読み込んでおく。
     *
     * 読み込みが終わるまで、
     * 復帰フェードは開始しない。
     */
    fallenMotionState.recoverBitmap =
        ImageManager.loadPicture(
            displayFilename
        );

    return;
}   

    const slotNumber =
        currentPortraitSlots[id];

    /*
     * すでに画面にいる場合は、
     * そのキャラクターのスロットだけ変更。
     */
    if (slotNumber) {

    showPortraitInSlot(
    slotNumber,

    getDisplayExpression(
        speakerId,
        filename
    ),

    speakerId
);

    /*
     * 話者だけ明るくする
     */
    highlightSpeaker(
        speakerId
    );

    return;
}

    /*
     * participants未使用の旧形式では、
     * 1人表示として中央へ出す。
     */
    showParticipants([
        {
            speaker: id,
            expression: filename
        }
    ]);
}

/*
 * 旧コードとの互換用。
 *
 * 話者が分からない場合は、
 * デフォルト話者を中央へ出す。
 */
function showExpression(filename) {
    showSpeakerExpression(
        defaultSpeaker,
        filename
    );
}

/*
 * 初期状態の良太郎へ戻す。
 */
function showDefaultPortrait() {
    showSoloPortrait(
        defaultSpeaker,
        defaultExpression,
        true
    );
}
/*
 * 会話データから参加者を取得する。
 *
 * participantsが書かれていれば、
 * それを最優先する。
 *
 * 書かれていなければ、
 * pagesに登場する話者から自動生成する。
 */
function getTalkParticipants(talk) {
    if (!talk) {
        return [];
    }

    if (
        Array.isArray(
            talk.participants
        ) &&
        talk.participants.length > 0
    ) {
        return talk.participants;
    }

    const participants = [];
    const registeredSpeakers =
        new Set();

    /*
     * pages形式なら、
     * 各ページの話者を参加者として推測。
     */
    if (
        Array.isArray(
            talk.pages
        )
    ) {
        for (
            const page of
            talk.pages
        ) {
            if (!page) {
                continue;
            }

            const speaker =
                String(
                    page.speaker ||
                    talk.speaker ||
                    defaultSpeaker
                );

            if (
                registeredSpeakers.has(
                    speaker
                )
            ) {
                continue;
            }

            registeredSpeakers.add(
                speaker
            );

            participants.push({
                speaker: speaker,

                expression:
                    String(
                        page.expression ||
                        ""
                    )
            });
        }
    }

    /*
     * text形式や、
     * pagesから参加者を取得できなかった場合。
     */
    if (
        participants.length === 0
    ) {
        participants.push({
            speaker:
                String(
                    talk.speaker ||
                    defaultSpeaker
                ),

            expression:
                String(
                    talk.expression ||
                    ""
                )
        });
    }

    return participants;
}

    Window_Message.prototype
        .obtainMamiExpressionName =
        function(textState) {
            const startIndex =
                textState.index;

            if (
                textState.text[
                    startIndex
                ] !== "["
            ) {
                return "";
            }

            const endIndex =
                textState.text.indexOf(
                    "]",
                    startIndex
                );

            if (endIndex < 0) {
                return "";
            }

            const filename =
                textState.text.substring(
                    startIndex + 1,
                    endIndex
                );

            textState.index =
                endIndex + 1;

            return filename;
        };
            Window_Message.prototype
        .obtainMamiSpeakerId =
        function(textState) {
            const startIndex =
                textState.index;

            if (
                textState.text[
                    startIndex
                ] !== "["
            ) {
                return "";
            }

            const endIndex =
                textState.text.indexOf(
                    "]",
                    startIndex
                );

            if (endIndex < 0) {
                return "";
            }

            const speakerId =
                textState.text.substring(
                    startIndex + 1,
                    endIndex
                );

            textState.index =
                endIndex + 1;

            return speakerId;
        };
Window_Message.prototype
    .obtainMamiDistance =
function(textState) {
    const startIndex =
        textState.index;

    if (
        textState.text[
            startIndex
        ] !== "["
    ) {
        return "";
    }

    const endIndex =
        textState.text.indexOf(
            "]",
            startIndex
        );

    if (endIndex < 0) {
        return "";
    }

    const distance =
        textState.text.substring(
            startIndex + 1,
            endIndex
        );

    textState.index =
        endIndex + 1;

    return distance;
};
/*
 * \MMOT[tripFall]
 * の角括弧内を取得する。
 */
Window_Message.prototype
    .obtainMamiMotionName =
    function(textState) {
        const startIndex =
            textState.index;

        const endIndex =
            textState.text.indexOf(
                "]",
                startIndex
            );

        if (endIndex < 0) {
            return "";
        }

        const motionName =
            textState.text.substring(
                startIndex + 1,
                endIndex
            );

        textState.index =
            endIndex + 1;

        return motionName;
    };
    const _Window_Message_processEscapeCharacter =
        Window_Message.prototype
            .processEscapeCharacter;

Window_Message.prototype
    .processEscapeCharacter =
    function(code, textState) {
        /*
         * 表情変更
         */
        if (code === "MEXP") {
            const filename =
                this.obtainMamiExpressionName(
                    textState
                );

            if (filename) {
                showSpeakerExpression(
                    this._mamiCurrentSpeakerId ||
                        defaultSpeaker,
                    filename
                );
            }

            return;
        }

        /*
         * 話者変更
         */
        if (code === "MSPK") {
            const speakerId =
                this.obtainMamiSpeakerId(
                    textState
                );

            if (speakerId) {
    this._mamiCurrentSpeakerId =
        speakerId;

    showNamePlate(
        speakerId
    );

    /*
     * 話者が変わった時点で、
     * 立ち絵の明暗も更新する。
     */
    highlightSpeaker(
        speakerId
    );
}

            return;
        }

        /*
         * 立ち絵モーション
         */
        if (code === "MMOT") {
            const motionName =
                this.obtainMamiMotionName(
                    textState
                );

            if (motionName) {
                playPortraitMotion(
                    this._mamiCurrentSpeakerId ||
                        defaultSpeaker,
                    motionName
                );
            }

            return;
        }

/*
 * 立ち絵の距離変更
 */
if (code === "MDIST") {
    const distance =
        this.obtainMamiDistance(
            textState
        );

    if (distance) {
        const speakerId =
            this._mamiCurrentSpeakerId ||
            defaultSpeaker;

        const started =
            fadePortraitDistance(
                speakerId,
                distance
            );

        if (
    distance !== "normal"
) {
    if (
        !activeTalkDistanceSpeakers.includes(
            speakerId
        )
    ) {
        activeTalkDistanceSpeakers.push(
            speakerId
        );
    }
} else {
    /*
     * 会話中に自分で通常距離へ戻った場合は、
     * 会話終了時の自動距離復帰対象から外す。
     */
    activeTalkDistanceSpeakers =
        activeTalkDistanceSpeakers.filter(
            id =>
                id !== speakerId
        );
}

        /*
         * 実際に距離フェードが開始された場合だけ、
         * メッセージ描画を少し待たせる。
         *
         * フェード中に台詞が出始めてしまうのを防ぐ。
         */
        if (started) {
            this.startWait(
                PORTRAIT_FADE_DURATION * 2
            );
        }
    }

    return;
}

        /*
         * 独自コード以外は、
         * ツクール本体へ渡す。
         */
        _Window_Message_processEscapeCharacter
            .call(
                this,
                code,
                textState
            );
    };

function requestExpressionReset(
    resetPortrait = true
) {
    resetRequested = true;

    resetDelay =
        resetDelayFrames;

    resetPortraitOnEnd =
        resetPortrait;
}
/*
 * 会話本文を開始せず、
 * 参加者の立ち絵配置だけを準備する。
 *
 * 憑依横取りの暗転中に使用する。
 */
function prepareTalkPortraits(
    talk
) {
    if (!talk) {
        return;
    }

    const participants =
        getTalkParticipants(
            talk
        );

    /*
     * 会話開始時の距離指定。
     */
    const startDistances =
        talk.startDistances &&
        typeof talk.startDistances ===
            "object"
            ? talk.startDistances
            : {};

    activeTalkDistanceSpeakers =
        Object.keys(
            startDistances
        );

    if (talk.keepPortraitHidden) {
        eraseAllPortraits();
        return;
    }

    /*
     * ここでは
     * saveSoloPortraitForReturn()を呼ばない。
     *
     * 横取り後に戻る中央表示状態は、
     * applyPossessionEffectAction()側で
     * すでに保存しているため。
     */
    showParticipants(
        participants
    );

    activeTalkDistanceSpeakers.forEach(
        speakerId => {
            fadePortraitDistance(
                speakerId,
                startDistances[
                    speakerId
                ]
            );
        }
    );
}
    /*
     * ─────────────────────────────
     * メッセージ登録
     * ─────────────────────────────
     */
     /*
      * この作品では標準顔グラフィックを使わないため、
      * 前のメッセージ設定が残っていても解除する。
      */
    function enqueueTalkMessage(talk) {
        
        $gameMessage.setFaceImage(
            "",
            0
        );

        const talkSpeaker =
            String(
                talk.speaker ||
                defaultSpeaker
            );
        /*
         * 会話開始時に参加者全員を配置する。
         */
        const participants =
    getTalkParticipants(
        talk
    );
    /*
 * 会話開始時の距離指定を取得する。
 *
 * 例：
 * startDistances: {
 *     momotaros: "close"
 * }
 */
const startDistances =
    talk.startDistances &&
    typeof talk.startDistances ===
        "object"
        ? talk.startDistances
        : {};

activeTalkDistanceSpeakers =
    Object.keys(
        startDistances
    );

/*
 * 会話前の一対一状態を保存する。
 *
 * 一人だけの通常会話でも、
 * 会話終了後には元のメインキャラへ戻れる。
 */
if (talk.keepPortraitHidden) {
    returnSoloPortrait = null;
    isTemporaryGroupTalk = false;

    eraseAllPortraits();
} else {
    saveSoloPortraitForReturn();

    showParticipants(
        participants
    );
    /*
 * すでに表示中のキャラも、
 * 会話開始時に滑らかに距離を変える。
 */
activeTalkDistanceSpeakers.forEach(
    speakerId => {
        fadePortraitDistance(
            speakerId,
            startDistances[
                speakerId
            ]
        );
    }
);
}  

        /*
         * pages形式
         */
        if (
            Array.isArray(
                talk.pages
            ) &&
            talk.pages.length > 0
        ) {
            for (
                let pageIndex = 0;
                pageIndex <
                talk.pages.length;
                pageIndex++
            ) {
                const page =
                    talk.pages[
                        pageIndex
                    ] || {};

                const speaker =
                    String(
                        page.speaker ||
                        talkSpeaker
                    );

                const expression =
                    String(
                        page.expression ||
                        ""
                    );

                const distance =
                    String(
                        page.distance ||
                        ""
                    );
                    const motion =
                        String(
                            page.motion ||
                            ""
                        );

                const lines =
                    String(
                        page.text || ""
                    ).split("\n");

                if (
                    lines.length === 0
                ) {
                    lines.push("");
                }

                /*
                 * ページ冒頭で、
                 * ネームプレートと表情を切り替える。
                 */
                let controlText =
                    `\\MSPK[${speaker}]`;

                if (distance) {
                    controlText +=
                        `\\MDIST[${distance}]`;
                }

                if (expression) {
                   controlText +=
                        `\\MEXP[${expression}]`;
                }

                /*
                 * 表情を変更したあとで、
                 * モーションを実行する。
                 */
                if (motion) {
                    controlText +=
                        `\\MMOT[${motion}]`;
                }

                lines[0] =
                    controlText +
                    lines[0];

                for (
                    const line of lines
                ) {
                    $gameMessage.add(
                        line
                    );
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

/*
 * text形式
 */
const expression =
    String(
        talk.expression ||
        ""
    );

const motion =
    String(
        talk.motion ||
        ""
    );

const distance =
    String(
        talk.distance ||
        ""
    );

const pages =
    String(
        talk.text || ""
    ).split("||");

for (
    let pageIndex = 0;
    pageIndex < pages.length;
    pageIndex++
) {
    const lines =
        pages[
            pageIndex
        ].split("\n");

    if (lines.length === 0) {
        lines.push("");
    }

    /*
     * text形式では、
     * 全ページ同じ話者・表情・動作を使う。
     */
    let controlText =
        `\\MSPK[${talkSpeaker}]`;

    if (motion) {
        controlText +=
            `\\MMOT[${motion}]`;
    }

    if (distance) {
        controlText +=
            `\\MDIST[${distance}]`;
    }

    if (expression) {
        controlText +=
            `\\MEXP[${expression}]`;
    }

    lines[0] =
        controlText +
        lines[0];

    for (
        const line of lines
    ) {
        $gameMessage.add(
            line
        );
    }

    if (
        pageIndex <
        pages.length - 1
    ) {
        $gameMessage.newPage();
    }
}
}
    /*
     * ─────────────────────────────
     * 来訪時の時間帯別挨拶
     * ─────────────────────────────
     */

    function showTimeGreeting() {
       const greeting =
    selectTimeGreeting();

if (!greeting) {
    return;
}

/*
 * enqueueTalkMessageより前に憑依状態を作る。
 */
if (greeting.initialPossession) {
    possessionState.active = true;
    possessionState.host = "ryotaro";

    possessionState.imagin =
        String(
            greeting.initialPossession.imagin ||
            "momotaros"
        );

    possessionState.outfit =
        String(
            greeting.initialPossession.outfit ||
            "normal"
        );
        possessionState.outfitOwner =
    possessionState.outfit ===
    "imagin_preference"
        ? possessionState.imagin
        : "ryotaro";
}

/*
 * そのあとメインキャラを決める。
 */
const greetingMainSpeaker =
    greeting.initialPossession
        ? possessionState.imagin
        : String(
            greeting.speaker ||
            defaultSpeaker
        );

const greetingMainExpression =
    greeting.initialPossession
        ? getDefaultExpressionForSpeaker(
            greetingMainSpeaker
        )
        : String(
            greeting.expression ||
            defaultExpression
        );

pendingMainCharacterChange = {
    speaker: greetingMainSpeaker,
    expression: greetingMainExpression
};

/*
 * 最後に会話を登録。
 */
enqueueTalkMessage(
    greeting
);

requestExpressionReset();
    }

    /*
     * ─────────────────────────────
     * JS内選択肢会話
     * ─────────────────────────────
     */

    function normalizeChoiceResponse(choice) {
        if (!choice) {
            return null;
        }

        /*
         * response: [
         *     { text: "...", expression: "..." }
         * ]
         *
         * の形式。
         */
        if (choice.response) {
            if (Array.isArray(choice.response)) {
                return {
                    pages: choice.response
                };
            }

            /*
             * response: {
             *     text: "...",
             *     expression: "..."
             * }
             *
             * の形式。
             */
            if (
                typeof choice.response ===
                "object"
            ) {
                return choice.response;
            }

            /*
             * response: "返答"
             *
             * の簡易形式。
             */
            return {
                text:
                    String(choice.response),

                speaker:
                    choice.speaker ||
                    defaultSpeaker,

                expression:
                    choice.expression || ""
            };
        }

        /*
         * choices内に直接pagesを書く形式。
         */
        if (
            Array.isArray(choice.pages) &&
            choice.pages.length > 0
        ) {
            return {
                pages: choice.pages
            };
        }

        /*
         * reply: "返答"
         *
         * の簡易形式。
         */
        if (
            choice.reply !== undefined
        ) {
            return {
                text:
                    String(choice.reply),

                speaker:
                    choice.speaker ||
                    defaultSpeaker,

                expression:
                    choice.expression || ""
            };
        }

        return null;
    }

    function enqueueChoiceTalk(talk) {
        const choices =
            Array.isArray(talk.choices)
                ? talk.choices
                : [];

        if (choices.length === 0) {
            console.warn(
                `[${pluginName}] 選択肢がありません。`,
                talk
            );

            enqueueTalkMessage(talk);
            requestExpressionReset();

            return;
        }

        /*
         * 選択肢を出す前の則宗さんの台詞。
         */
        if (
            talk.text ||
            (
                Array.isArray(talk.pages) &&
                talk.pages.length > 0
            )
        ) {
            enqueueTalkMessage(talk);
        } else if (talk.expression) {
            showExpression(
                talk.expression
            );
        }

        /*
         * labelがある場合はlabelを優先。
         *
         * labelがなければtextを
         * 選択肢の表示名として使う。
         */
        const choiceTexts =
            choices.map(choice =>
                String(
                    choice.label ??
                    choice.text ??
                    "……"
                )
            );

        /*
         * 最初に選択状態になる項目。
         *
         * 0 = 一番上
         * 1 = 二番目
         */
        const defaultType =
            Number.isFinite(
                Number(
                    talk.defaultChoice
                )
            )
                ? Number(
                    talk.defaultChoice
                )
                : 0;

        /*
         * キャンセル時の処理。
         *
         * -1 = キャンセル不可
         *  0 = 一番上を選んだ扱い
         *  1 = 二番目を選んだ扱い
         */
        const cancelType =
            Number.isFinite(
                Number(
                    talk.cancelChoice
                )
            )
                ? Number(
                    talk.cancelChoice
                )
                : -1;

        /*
         * 選択肢ウィンドウの位置。
         *
         * 0 = 左
         * 1 = 中央
         * 2 = 右
         */
        const positionType =
            Number.isFinite(
                Number(
                    talk.choicePosition
                )
            )
                ? Number(
                    talk.choicePosition
                )
                : 2;

        /*
         * 選択肢ウィンドウの背景。
         *
         * 0 = 通常
         * 1 = 暗くする
         * 2 = 透明
         */
        const background =
            Number.isFinite(
                Number(
                    talk.choiceBackground
                )
            )
                ? Number(
                    talk.choiceBackground
                )
                : 0;

        $gameMessage.setChoices(
            choiceTexts,
            defaultType,
            cancelType
        );

        $gameMessage
            .setChoicePositionType(
                positionType
            );

        $gameMessage
            .setChoiceBackground(
                background
            );

        $gameMessage.setChoiceCallback(
            selectedIndex => {
                const selectedChoice =
                    choices[selectedIndex];

                const response =
                    normalizeChoiceResponse(
                        selectedChoice
                    );

                /*
                 * ここではまだ表示しない。
                 *
                 * この直後にツクール側が
                 * 選択肢用メッセージを消去するため、
                 * 返答を一度保留しておく。
                 */
                pendingChoiceResponse =
                    response || null;
            }
        );
    }
    /*
     * ─────────────────────────────
     * 抽選
     * ─────────────────────────────
     */

    function showRandomTalk(category) {
        if ($gameMessage.isBusy()) {
            return;
        }

        /*
         * 訪問回数会話は
         * 「話す」系だけで判定
         */
        if (
            category === "all" ||
            category === "normal"
        ) {
            const visitTalk =
                getVisitTalk();

            if (visitTalk) {
                enqueueTalkMessage(
                    visitTalk
                );

                requestExpressionReset();
                return;
            }
        }

        let candidates =
            makeTalkCandidates(
                category
            );

        candidates =
            filterRecentHistory(
                candidates
            );

        if (
            candidates.length === 0
        ) {
            console.warn(
                `[${pluginName}] 抽選可能な会話がありません: ${category}`
            );

            return;
        }
/*
 * 低確率で選択肢会話を優先する。
 */
const choiceCandidates =
    candidates.filter(
        candidate =>
            candidate.talk &&
            candidate.talk.type ===
                "choice"
    );

if (
    choiceCandidates.length > 0 &&
    Math.random() <
        CHOICE_TALK_RATE
) {
    const selectedChoice =
        choiceCandidates[
            Math.floor(
                Math.random() *
                choiceCandidates.length
            )
        ];

    enqueueChoiceTalk(
        selectedChoice.talk
    );

    rememberCandidate(
        selectedChoice
    );

    return;
}
        const selected =
            candidates[
                Math.floor(
                    Math.random() *
                    candidates.length
                )
            ];

        rememberCandidate(selected);

        const talk =
            selected.talk;

        const type =
            String(
                talk.type || "message"
            );

        if (type === "choice") {
            enqueueChoiceTalk(talk);
            return;
        }
        
        if (
            type === "commonEvent"
        ) {
            const commonEventId =
                Number(
                    talk.commonEventId ||
                    0
                );

            if (
                commonEventId > 0
            ) {
                $gameTemp
                    .reserveCommonEvent(
                        commonEventId
                    );
            }

            return;
        }

        enqueueTalkMessage(talk);
        requestExpressionReset();
    }
    PluginManager.registerCommand(
        pluginName,
        "showTimeGreeting",
        () => {
            showTimeGreeting();
        }
    );

    PluginManager.registerCommand(
        pluginName,
        "randomTalk",
        args => {
            showRandomTalk(
                String(
                    args.category ||
                    "all"
                )
            );
        }
    );
PluginManager.registerCommand(
    pluginName,
    "setMainCharacter",
    args => {
        if ($gameMessage.isBusy()) {
            return;
        }

        const speakerId =
            String(
                args.speaker ||
                defaultSpeaker
            );

        const expression =
            String(
                args.expression ||
                defaultExpression
            );

        showSoloPortrait(
            speakerId,
            expression,
            true
        );

        /*
         * メイン変更時は
         * ネームプレートを表示しない。
         */
        eraseNamePlate();
    }
);
PluginManager.registerCommand(
    pluginName,
    "possessionEvent",
    () => {
        startPossessionEvent();
    }
);
/*
 * ─────────────────────────────
 * 憑依開始
 * ─────────────────────────────
 */
PluginManager.registerCommand(
    pluginName,
    "startPossession",
    args => {
        if ($gameMessage.isBusy()) {
            return;
        }

        const imaginId =
            String(
                args.imagin ||
                "momotaros"
            );

        const outfit =
            String(
                args.outfit ||
                "normal"
            );

        /*
         * 憑依状態を開始する。
         */
        MamiDenOTalk.startPossession(
            imaginId,
            outfit
        );

        /*
         * 会話上のメインキャラは
         * 憑依したイマジンへ変更する。
         *
         * 画像はgetDisplayExpression()で
         * M良太郎へ自動変換される。
         */
        MamiDenOTalk.setMainCharacter(
            imaginId,
            getDefaultExpressionForSpeaker(
                imaginId
            )
        );

        eraseNamePlate();
    }
);

/*
 * ─────────────────────────────
 * 憑依解除
 * ─────────────────────────────
 */
PluginManager.registerCommand(
    pluginName,
    "endPossession",
    () => {
        if ($gameMessage.isBusy()) {
            return;
        }

        /*
         * 先に憑依状態を解除する。
         *
         * 解除前に良太郎を表示すると、
         * 表示変換がまだM良太郎扱いに
         * なる可能性があるため。
         */
        MamiDenOTalk.endPossession();

        /*
         * メインキャラを良太郎へ戻す。
         */
        MamiDenOTalk.setMainCharacter(
            "ryotaro",
            "portrait_ryotaro_base_ryotaro_normal"
        );

        eraseNamePlate();
    }
);
    /*
     * ─────────────────────────────
     * 通常表情へ復帰
     * ─────────────────────────────
     */

    const _Scene_Map_update =
        Scene_Map.prototype.update;

    Scene_Map.prototype.update =
        function() {
            _Scene_Map_update.call(
                this
            );
            updatePortraitDistanceFade();
            updatePortraitMotions();
/*
 * 着替えに行った良太郎の帰還待ち。
 */
if (
    changeClothesReturnState &&
    !$gameMessage.isBusy()
) {
    changeClothesReturnState.wait--;

    if (
        changeClothesReturnState.wait <= 0
    ) {
        changeClothesReturnState =
            null;

        showSoloPortrait(
            "ryotaro",
            getDefaultExpressionForSpeaker(
                "ryotaro"
            ),
            true
        );

        enqueueTalkMessage(
            makeReturnFromChangingTalk()
        );

        requestExpressionReset(
            true
        );

        return;
    }
}            
/*
 * 憑依・解除演出を進行する。
 */
if (possessionEffectState) {
    possessionEffectState.wait--;

    if (
        possessionEffectState.wait <= 0
    ) {
        const effect =
            possessionEffectState;

        /*
         * フェードアウトが終わり、
         * 完全に暗くなったところ。
         */
        if (
            effect.phase === "fadeOut"
        ) {
            applyPossessionEffectAction(
                effect.action
            );

            /*
             * 真っ黒のまま少し待つ。
             */
            effect.phase =
                "blackWait";

            effect.wait = 30;

            return;
        }

        /*
         * 暗転維持後、明転を開始する。
         */
        if (
            effect.phase === "blackWait"
        ) {
            effect.phase =
                "fadeIn";

            effect.wait = 18;

            $gameScreen.startFadeIn(
                18
            );

            if (
                effect.action.type === "start" ||
                effect.action.type === "steal"
            ) {
                const flashColor =
                    getPossessionFlashColor(
                        effect.action.imagin
                    );

                $gameScreen.startFlash(
                    flashColor,
                    12
                );
            } else {
                $gameScreen.startFlash(
                    [220, 220, 220, 80],
                    12
                );
            }

            return;
        }

        /*
         * 明転が終わってから、
         * メッセージ開始まで少し待つ。
         */
if (
    effect.phase === "fadeIn"
) {
    /*
     * フェードイン完了後、
     * メッセージ開始まで少し待つ。
     */
    effect.phase =
        "messageWait";

    effect.wait = 8;

    return;
}

if (
    effect.phase === "messageWait"
) {
    possessionEffectState =
        null;

    /*
     * 憑依横取り後の会話。
     */
    if (
        pendingPostStealTalk &&
        !$gameMessage.isBusy()
    ) {
        const postStealTalk =
            pendingPostStealTalk;

        pendingPostStealTalk =
            null;

        enqueueTalkMessage(
            postStealTalk
        );

        /*
         * 会話終了後は、
         * 新しい憑依者の中央表示へ戻す。
         */
        requestExpressionReset(
            true
        );

        return;
    }

    /*
     * 専用服で憑依解除した後の、
     * 着替え会話。
     */
    if (
        pendingPostReleaseTalk &&
        !$gameMessage.isBusy()
    ) {
        const postTalk =
            pendingPostReleaseTalk;

        pendingPostReleaseTalk =
            null;

        isChangeClothesTalkActive =
            true;

        enqueueTalkMessage(
            postTalk
        );

        /*
         * 着替え中なので、
         * 会話後に立ち絵を復元しない。
         */
        requestExpressionReset(
            false
        );

        return;
    }

    return;
}

    }

    return;
}
           /*
 * 憑依用の選択肢が完全に閉じたあと、
 * 保留していた会話を開始する。
 */
if (
    pendingPossessionTalk &&
    !$gameMessage.isBusy()
) {
    const talk =
        pendingPossessionTalk;

    pendingPossessionTalk =
        null;

    enqueueTalkMessage(
        talk
    );

    /*
     * 会話終了後、
     * pendingPossessionActionを実行する。
     */
    requestExpressionReset();

    return;
}
            if (
                pendingChoiceResponse &&
                !$gameMessage.isBusy()
            ) {
                const response =
                    pendingChoiceResponse;

                /*
                 * 二重表示を防ぐため、
                 * 先に保留を解除する。
                 */
                pendingChoiceResponse = null;

                enqueueTalkMessage(
                    response
                );

                requestExpressionReset();

                return;
            }

            if (!resetRequested) {
                return;
            }

            if (
                $gameMessage.isBusy()
            ) {
                return;
            }

            if (resetDelay > 0) {
                resetDelay--;
                return;
            }

            resetRequested = false;

resetRequested = false;

eraseNamePlate();

/*
 * 憑依イベント終了待ちがある場合。
 *
 * 会話終了後に、
 * 憑依開始または解除を実行する。
 */
if (
    executePendingPossessionAction()
) {
    resetPortraitOnEnd = true;
    return;
}

/*
 * メイン交代待ちがある場合は、
 * 元のキャラへ戻さず、
 * 新しいメインキャラを表示する。
 */
if (pendingMainCharacterChange) {
    const nextCharacter =
        pendingMainCharacterChange;

    pendingMainCharacterChange =
        null;

    returnSoloPortrait = null;
    isTemporaryGroupTalk = false;

    showSoloPortrait(
        nextCharacter.speaker,
        nextCharacter.expression,
        true
    );
} else if (resetPortraitOnEnd) {
    /*
     * 特殊距離のキャラがいる場合は、
     * 先にフェードで通常距離へ戻す。
     *
     * restoreSoloPortrait()は、
     * フェード完了後に実行する。
     */
    if (
        activeTalkDistanceSpeakers
            .length > 0
    ) {
        pendingRestoreAfterDistanceFade =
            true;

        activeTalkDistanceSpeakers.forEach(
            speakerId => {
                fadePortraitDistance(
                    speakerId,
                    "normal"
                );
            }
        );
    } else {
        restoreSoloPortrait();
    }
} 
else {
    /*
     * 「着替えてくる」など、
     * 会話終了後も立ち絵を出さない特殊会話。
     */
    eraseAllPortraits();

    returnSoloPortrait = null;
    isTemporaryGroupTalk = false;

    /*
     * 良太郎が着替えに行った場合だけ、
     * 少し待ってから帰還会話を出す。
     */
    if (isChangeClothesTalkActive) {
        isChangeClothesTalkActive =
            false;

        changeClothesReturnState = {
            wait: 60
        };
    }
}
/*
 * 次の会話へ設定を引き継がない。
 */
resetPortraitOnEnd = true;
        };

    /*
     * 外部確認用
     */
    window.MamiDenOTalk = {
        showTimeGreeting() {
            showTimeGreeting();
        },

        getVisitTalkCount() {
            return visitTalkCount;
        },

        resetVisitTalkCount() {
            visitTalkCount = 0;

            for (
                const key of
                Object.keys(
                    shownVisitTalks
                )
            ) {
                delete shownVisitTalks[
                    key
                ];
            }
        },

        clearHistory() {
            talkHistory.length = 0;
        }
    };
/*
 * ─────────────────────────────
 * 外部呼び出し用
 * ─────────────────────────────
 */

window.MamiDenOTalk =
    window.MamiDenOTalk || {};

/*
 * 通常時の会話相手を変更する。
 */
window.MamiDenOTalk.setMainCharacter =
    function(
        speakerId,
        expression
    ) {
        showSoloPortrait(
            speakerId,
            expression,
            true
        );
    };
/*
 * 会話演出つきで
 * 通常時の会話相手を変更する。
 */
window.MamiDenOTalk.changeMainCharacter =
    function(
        speakerId,
        expression
    ) {
        changeMainCharacter(
            speakerId,
            expression
        );
    };
/*
 * 現在の通常会話相手を取得する。
 */
window.MamiDenOTalk.getMainCharacter =
    function() {
        return {
            speaker:
                currentSoloPortrait.speaker,

            expression:
                currentSoloPortrait.expression
        };
    };
    /*
 * ─────────────────────────────
 * 憑依状態・外部呼び出し用
 * ─────────────────────────────
 */

/*
 * 現在憑依中か返す。
 *
 * true  = 憑依中
 * false = 未憑依
 */
window.MamiDenOTalk.isPossessed =
    function() {
        return possessionState.active;
    };

/*
 * 現在の憑依状態を返す。
 */
window.MamiDenOTalk.getPossessionState =
    function() {
        return {
            active:
                possessionState.active,

            host:
                possessionState.host,

            imagin:
                possessionState.imagin,

            outfit:
                possessionState.outfit
        };
    };

/*
 * 憑依を開始する。
 *
 * imaginId:
 *   momotaros
 *   urataros
 *   kintaros
 *   ryutaros
 *
 * outfit:
 *   normal
 *   imagin_preference
 */
window.MamiDenOTalk.startPossession =
    function(
        imaginId,
        outfit = "normal"
    ) {
        possessionState.active = true;
        possessionState.host =
            "ryotaro";
        possessionState.imagin =
            String(imaginId || "");
        possessionState.outfit =
            String(outfit || "normal");
    };
/*
 * 放置台詞用の一時表情を表示する。
 *
 * currentSoloPortraitは変更しないため、
 * 通常のメインキャラクター設定は維持される。
 */
window.MamiDenOTalk.showIdleExpression =
    function(
        speakerId,
        expression
    ) {
        showSoloPortrait(
            speakerId,
            expression,
            false
        );

        showNamePlate(
            speakerId
        );
    };

/*
 * 放置台詞終了後、
 * 現在の通常立ち絵へ戻す。
 */
window.MamiDenOTalk.restoreIdlePortrait =
    function() {
        showSoloPortrait(
            currentSoloPortrait.speaker,
            currentSoloPortrait.expression,
            false
        );

        eraseNamePlate();
    };
/*
 * 憑依を解除する。
 */
window.MamiDenOTalk.endPossession =
    function() {
        possessionState.active = false;
        possessionState.host =
            "ryotaro";
        possessionState.imagin = null;
        possessionState.outfit =
            "normal";
            possessionState.outfitOwner =
    "ryotaro";
    };
})();