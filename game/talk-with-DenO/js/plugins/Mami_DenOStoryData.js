/*:
 * @target MZ
 * @plugindesc 電王会話作品用・ストーリーデータ Ver0.1
 * @author マミタロス
 *
 * @help
 * Mami_DenOStory.jsで使用する
 * ストーリーデータを管理します。
 */

(() => {
    "use strict";

    window.MamiDenOStoryData =
        window.MamiDenOStoryData || {};

    /*
     * ─────────────────────────────
     * ルート一覧
     * ─────────────────────────────
     *
     * id:
     *   プログラム内で使用するID。
     *
     * title:
     *   画面に表示する名前。
     *
     * subtitle:
     *   小さく表示する説明。
     *
     * episodes:
     *   各話データ。
     */

    const ROUTES = [
        {
            id: "momo",
            title: "モモタロス",
            subtitle: "メインストーリー",

            episodes: [
                {
    id: "momo_01",
    number: 1,
    title: "第1話　動作確認",
    description:
        "ストーリー再生機能の確認用。",

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
        background:
            "background_test",

        speaker: "mio",
        text:
            "背景変更のテストだよ。"
    },
    {
        speaker: "momotaros",
        expression:
            "portrait_momotaros_base_default_angry",
        text:
            "雑すぎて場所が分かんねぇ！"
    },
    {
        still:
            "CG_test",

        speaker: "mio",
        text:
            "今度はスチル。"
    },
    {
        speaker: "momotaros",
        text:
            "急に画面を占領すんな！"
    },
    {
        clearStill: true,

        speaker: "mio",
        text:
            "スチルを消すと、変更後の背景に戻るよ。"
    },
    {
        clearBackground: true,

        speaker: "momotaros",
        text:
            "背景を消すと、いつもの食堂車に戻る。"
    }
]
},
                {
                    id: "momo_02",
                    number: 2,
                    title: "第2話　準備中",
                    description:
                        "シナリオ準備中。"
                },
                {
                    id: "momo_03",
                    number: 3,
                    title: "第3話　準備中",
                    description:
                        "シナリオ準備中。"
                }
            ]
        },

        {
            id: "ura",
            title: "ウラタロス",
            subtitle: "アナザーストーリー",

            episodes: [
                {
                    id: "ura_01",
                    number: 1,
                    title: "第1話　はじまり",
                    description:
                        "ウラタロスと澪の物語。"
                },
                {
                    id: "ura_02",
                    number: 2,
                    title: "第2話　準備中",
                    description:
                        "シナリオ準備中。"
                }
            ]
        },

        {
            id: "kin",
            title: "キンタロス",
            subtitle: "アナザーストーリー",

            episodes: [
                {
                    id: "kin_01",
                    number: 1,
                    title: "第1話　はじまり",
                    description:
                        "キンタロスと澪の物語。"
                },
                {
                    id: "kin_02",
                    number: 2,
                    title: "第2話　準備中",
                    description:
                        "シナリオ準備中。"
                }
            ]
        },

        {
            id: "ryu",
            title: "リュウタロス",
            subtitle: "アナザーストーリー",

            episodes: [
                {
                    id: "ryu_01",
                    number: 1,
                    title: "第1話　はじまり",
                    description:
                        "リュウタロスと澪の物語。"
                },
                {
                    id: "ryu_02",
                    number: 2,
                    title: "第2話　準備中",
                    description:
                        "シナリオ準備中。"
                }
            ]
        },

        {
            id: "extra",
            title: "おまけ",
            subtitle: "ショートシナリオ",

            episodes: [
                {
                    id: "extra_01",
                    number: 1,
                    title: "おまけ　その1",
                    description:
                        "賑やかなデンライナーの日常。"
                }
            ]
        }
    ];

    /*
     * ルート一覧を取得。
     */
    window.MamiDenOStoryData
        .getRoutes =
        function() {
            return ROUTES;
        };

    /*
     * IDからルートを取得。
     */
    window.MamiDenOStoryData
        .getRoute =
        function(routeId) {
            return (
                ROUTES.find(
                    route =>
                        route.id ===
                        String(routeId)
                ) ||
                null
            );
        };

    /*
     * IDからエピソードを取得。
     */
    window.MamiDenOStoryData
        .getEpisode =
        function(
            routeId,
            episodeId
        ) {
            const route =
                window.MamiDenOStoryData
                    .getRoute(routeId);

            if (!route) {
                return null;
            }

            return (
                route.episodes.find(
                    episode =>
                        episode.id ===
                        String(episodeId)
                ) ||
                null
            );
        };
})();