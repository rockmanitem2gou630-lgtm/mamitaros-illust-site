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
 * 現在画面にいるキャラクターと、
 * 使用スロットの対応。
 */
let currentPortraitSlots = {};
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
     * 良太郎固定。
     * 将来他キャラへ憑依させたくなっても対応可能。
     */
    host: "ryotaro",

    /*
     * 憑依しているイマジン
     */
    imagin: null,

    /*
     * normal
     * imagin_outfit
     */
    outfit: "normal"
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
}
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

        release: [
            {
                /*
                 * 憑依中なので、
                 * モモの立ち絵画像は
                 * getDisplayExpression()によって
                 * M良太郎へ置き換わる。
                 */
                participants: [
                    {
                        speaker: "momotaros",
                        expression:
                            "portrait_momotaros_base_default_normal"
                    }
                ],

                pages: [
                    {
                        /*
                         * 良太郎は内側から話すため、
                         * participantsには入れない。
                         *
                         * ネームプレートだけ良太郎へ変わり、
                         * M良太郎の立ち絵はそのまま残る。
                         */
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
            },
        ],

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

    ]

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
    if (
        !possessionState.active
    ) {
        return expression;
    }

    if (
        speakerId !==
        possessionState.imagin
    ) {
        return expression;
    }

    /*
     * モモタロス
     */
    if (
        speakerId ===
        "momotaros"
    ) {
        if (
            possessionState.outfit ===
            "imagin_preference"
        ) {
            return expression.replace(
                "portrait_momotaros_base_default",
                "portrait_ryotaro_momotaros_momotaros"
            );
        }

        return expression.replace(
            "portrait_momotaros_base_default",
            "portrait_ryotaro_momotaros_ryotaro"
        );
    }

    return expression;
}
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
        !PORTRAIT_SLOT_X[
            slotNumber
        ]
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
            PORTRAIT_SLOT_X[
                slotNumber
            ],
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
        PORTRAIT_SLOT_X[
            slotNumber
        ],
        distanceData.y,
        distanceData.scale,
        distanceData.scale,
        0,
        0
    );

    $gameScreen.movePicture(
        targetPictureId,
        1,
        PORTRAIT_SLOT_X[
            slotNumber
        ],
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
     * 画面に表示されている
     * 立ち絵スロットを取得する。
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
     * 一対一なら、
     * 相手の立ち絵は明るいまま。
     *
     * 立ち絵キャラが二人以上なら、
     * 全員を暗くして
     * 画面外の澪が話者だと示す。
     */
    if (id === "mio") {
        if (visibleSlots.length >= 2) {
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
     * 澪以外でも、
     * 画面に立ち絵がない話者なら
     * 現在の明るさを維持する。
     */
    if (!slotNumber) {
        return;
    }

    /*
     * 通常の立ち絵キャラなら、
     * 全員を暗くしてから
     * 話者だけ明るくする。
     */
    darkenAllPortraits();

    tintPortraitSlot(
        slotNumber,
        ACTIVE_PORTRAIT_TONE
    );
}
/*
 * すべての立ち絵を消す。
 */
function eraseAllPortraits() {
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
        PORTRAIT_SLOT_X[
            slotNumber
        ],
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
    PORTRAIT_SLOT_X[
        state.slotNumber
    ],
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
                PORTRAIT_SLOT_X[
                    state.slotNumber
                ],
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

    /*
     * 今のキャラ配置と、
     * 次のキャラ配置が完全に同じか確認する。
     */
    const sameLayout =
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

    /*
     * 人数やキャラ位置が変わる場合だけ、
     * 一度すべて消して配置し直す。
     */
    if (!sameLayout) {
        eraseAllPortraits();

        currentPortraitSlots = {};

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
    } else {
        /*
         * 配置が同じなら消さない。
         *
         * 表情指定があるキャラだけ、
         * 現在のスロットで更新する。
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

    showSoloPortrait(
        returnState.speaker,
        returnState.expression,
        false
    );

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
if (
    possessionState.active &&
    nextSpeaker === "ryotaro"
) {
    showForceReleaseEvent();

    return;
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
    if (mainSpeaker === "momotaros") {
        showPossessionConfirmChoice(
            "momotaros"
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
 * 現在はモモのみ実装。
 */
function showPossessionTargetChoice() {
    $gameMessage.setChoices(
        [
            "モモタロス",
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
                    "momotaros",
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
        12
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
        12
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

        showSoloPortrait(
            action.imagin,
            getDefaultExpressionForSpeaker(
                action.imagin
            ),
            true
        );

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
                movePortraitDistance(
                    this._mamiCurrentSpeakerId ||
                        defaultSpeaker,
                    distance
                );
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
         * 完全に暗くなったところで
         * 立ち絵を切り替える。
         */
        if (
            effect.phase === "fadeOut"
        ) {
            applyPossessionEffectAction(
                effect.action
            );

            effect.phase =
                "colorFlash";

            effect.wait = 8;

            /*
             * 暗転中のまま、
             * 次のフェーズへ移る。
             */
            return;
        }

        /*
         * 暗転から戻し始めると同時に、
         * イマジン色の薄い光を出す。
         */
        if (
            effect.phase ===
                "colorFlash"
        ) {
            effect.phase =
                "fadeIn";

            effect.wait = 18;

            $gameScreen.startFadeIn(
                18
            );

            if (
                effect.action.type ===
                "start"
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
                /*
                 * 解除時は白っぽく、
                 * 色が抜ける印象にする。
                 */
                $gameScreen.startFlash(
                    [220, 220, 220, 80],
                    12
                );
            }

            return;
        }

        if (
    effect.phase === "fadeIn"
) {
    possessionEffectState =
        null;

    /*
     * モモ好みの服だった場合だけ、
     * 解除後に立ち絵なしの台詞を出す。
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
         * この会話後に良太郎の立ち絵を
         * 勝手に復元しない。
         */
        requestExpressionReset(
            false
        );
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
    };
})();