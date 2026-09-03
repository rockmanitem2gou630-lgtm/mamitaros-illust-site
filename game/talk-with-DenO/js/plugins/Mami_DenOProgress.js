/*:
 * @target MZ
 * @plugindesc 電王会話作品用・ブラウザ進行度保存 Ver0.1
 * @author マミタロス
 *
 * @help
 * ストーリー既読・スチル解放情報を localStorage に保存します。
 *
 * このプラグイン単体では画面表示や解放タイミングの制御は行いません。
 * Mami_DenOStory.js / ギャラリーUI側から公開APIを呼び出して使用します。
 *
 * 推奨配置：
 *   Mami_DenOStoryData.js
 *   Mami_DenOProgress.js
 *   Mami_DenOStory.js
 *
 * 保存対象：
 * ・既読話数
 * ・実際に表示したスチル差分
 *
 * 進行度リセットでは、このプラグインが管理する進行度だけを削除します。
 * 音量など他の設定には触れません。
 */

(() => {
    "use strict";

    const STORAGE_KEY =
        "mamitaros_denliner_progress";

    const DATA_VERSION = 1;

    function makeDefaultData() {
        return {
            version: DATA_VERSION,
            readEpisodes: {},
            unlockedStills: {}
        };
    }

    let progressData = makeDefaultData();

    function canUseLocalStorage() {
        try {
            if (
                typeof localStorage === "undefined" ||
                !localStorage
            ) {
                return false;
            }

            const testKey =
                "__mamitaros_denliner_storage_test__";

            localStorage.setItem(
                testKey,
                "1"
            );

            localStorage.removeItem(
                testKey
            );

            return true;
        }
        catch (error) {
            console.warn(
                "[Mami_DenOProgress] localStorage unavailable.",
                error
            );

            return false;
        }
    }

    const storageAvailable =
        canUseLocalStorage();

    function normalizeEpisodeId(
        episodeId
    ) {
        return String(
            episodeId || ""
        ).trim();
    }

    function normalizeStillKey(
        filename
    ) {
        return String(
            filename || ""
        )
            .trim()
            .replace(/^.*[\\/]/, "")
            .replace(/\.png$/i, "");
    }

    /*
     * 例：
     * CG_momotaros_ep12_2_04
     *     ↓
     * CG_momotaros_ep12_2
     *
     * ギャラリーで「1枚のCG」として差分を束ねる時に使う。
     */
    function getStillGroupId(
        filename
    ) {
        return normalizeStillKey(
            filename
        ).replace(
            /_\d{2}$/,
            ""
        );
    }

    function sanitizeMap(
        source
    ) {
        if (
            !source ||
            typeof source !== "object" ||
            Array.isArray(source)
        ) {
            return {};
        }

        const output = {};

        for (
            const key of
            Object.keys(source)
        ) {
            if (source[key]) {
                output[String(key)] = true;
            }
        }

        return output;
    }

    function migrateData(
        source
    ) {
        const output =
            makeDefaultData();

        if (
            !source ||
            typeof source !== "object"
        ) {
            return output;
        }

        output.readEpisodes =
            sanitizeMap(
                source.readEpisodes
            );

        output.unlockedStills =
            sanitizeMap(
                source.unlockedStills
            );

        output.version =
            DATA_VERSION;

        return output;
    }

    function loadProgress() {
        if (!storageAvailable) {
            progressData =
                makeDefaultData();

            return;
        }

        try {
            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) {
                progressData =
                    makeDefaultData();

                return;
            }

            progressData =
                migrateData(
                    JSON.parse(raw)
                );
        }
        catch (error) {
            console.warn(
                "[Mami_DenOProgress] Failed to load progress.",
                error
            );

            progressData =
                makeDefaultData();
        }
    }

    function saveProgress() {
        if (!storageAvailable) {
            return false;
        }

        try {
            progressData.version =
                DATA_VERSION;

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    progressData
                )
            );

            return true;
        }
        catch (error) {
            console.warn(
                "[Mami_DenOProgress] Failed to save progress.",
                error
            );

            return false;
        }
    }

    function markEpisodeRead(
        episodeId
    ) {
        const key =
            normalizeEpisodeId(
                episodeId
            );

        if (!key) {
            return false;
        }

        if (
            progressData
                .readEpisodes[key]
        ) {
            return false;
        }

        progressData
            .readEpisodes[key] = true;

        saveProgress();

        return true;
    }

    function isEpisodeRead(
        episodeId
    ) {
        const key =
            normalizeEpisodeId(
                episodeId
            );

        return !!(
            key &&
            progressData
                .readEpisodes[key]
        );
    }

    function unlockStill(
        filename
    ) {
        const key =
            normalizeStillKey(
                filename
            );

        if (!key) {
            return false;
        }

        if (
            progressData
                .unlockedStills[key]
        ) {
            return false;
        }

        progressData
            .unlockedStills[key] = true;

        saveProgress();

        return true;
    }

    function unlockStills(
        filenames
    ) {
        if (!Array.isArray(filenames)) {
            return false;
        }

        let changed = false;

        for (
            const filename of
            filenames
        ) {
            const key =
                normalizeStillKey(
                    filename
                );

            if (
                !key ||
                progressData
                    .unlockedStills[key]
            ) {
                continue;
            }

            progressData
                .unlockedStills[key] =
                true;

            changed = true;
        }

        if (changed) {
            saveProgress();
        }

        return changed;
    }

    function isStillUnlocked(
        filename
    ) {
        const key =
            normalizeStillKey(
                filename
            );

        return !!(
            key &&
            progressData
                .unlockedStills[key]
        );
    }

    function getUnlockedStillKeys() {
        return Object.keys(
            progressData
                .unlockedStills
        );
    }

    function getUnlockedStillGroups() {
        const groups =
            new Set();

        for (
            const key of
            getUnlockedStillKeys()
        ) {
            const groupId =
                getStillGroupId(
                    key
                );

            if (groupId) {
                groups.add(
                    groupId
                );
            }
        }

        return Array.from(
            groups
        );
    }

    function isStillGroupUnlocked(
        groupId
    ) {
        const normalizedGroup =
            getStillGroupId(
                groupId
            );

        if (!normalizedGroup) {
            return false;
        }

        return getUnlockedStillKeys()
            .some(
                key =>
                    getStillGroupId(
                        key
                    ) ===
                    normalizedGroup
            );
    }

    function getDataCopy() {
        return JSON.parse(
            JSON.stringify(
                progressData
            )
        );
    }

    function resetProgress() {
        progressData =
            makeDefaultData();

        if (storageAvailable) {
            try {
                localStorage.removeItem(
                    STORAGE_KEY
                );
            }
            catch (error) {
                console.warn(
                    "[Mami_DenOProgress] Failed to reset progress.",
                    error
                );

                return false;
            }
        }

        return true;
    }

    /*
     * 起動時に保存済み進行度を読み込む。
     */
    loadProgress();

    window.MamiDenOProgress =
        window.MamiDenOProgress || {};

    window.MamiDenOProgress
        .markEpisodeRead =
        markEpisodeRead;

    window.MamiDenOProgress
        .isEpisodeRead =
        isEpisodeRead;

    window.MamiDenOProgress
        .unlockStill =
        unlockStill;

    window.MamiDenOProgress
        .unlockStills =
        unlockStills;

    window.MamiDenOProgress
        .isStillUnlocked =
        isStillUnlocked;

    window.MamiDenOProgress
        .isStillGroupUnlocked =
        isStillGroupUnlocked;

    window.MamiDenOProgress
        .getUnlockedStillKeys =
        getUnlockedStillKeys;

    window.MamiDenOProgress
        .getUnlockedStillGroups =
        getUnlockedStillGroups;

    window.MamiDenOProgress
        .normalizeStillKey =
        normalizeStillKey;

    window.MamiDenOProgress
        .getStillGroupId =
        getStillGroupId;

    window.MamiDenOProgress
        .getData =
        getDataCopy;

    window.MamiDenOProgress
        .save =
        saveProgress;

    window.MamiDenOProgress
        .reload =
        function() {
            loadProgress();
            return getDataCopy();
        };

    window.MamiDenOProgress
        .reset =
        resetProgress;

    window.MamiDenOProgress
        .isStorageAvailable =
        function() {
            return storageAvailable;
        };
})();
