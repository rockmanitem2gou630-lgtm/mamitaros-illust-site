/*:
 * @target MZ
 * @plugindesc タイトル画面を飛ばして、起動後すぐにニューゲームを開始します。
 * @author マミタロス
 *
 * @help
 * タイトル画面を表示せず、直接開始位置のマップへ移動します。
 * プラグイン管理で有効にしてください。
 */

(() => {
    "use strict";

    Scene_Boot.prototype.startNormalGame = function() {
        this.checkPlayerLocation();
        DataManager.setupNewGame();
        SceneManager.goto(Scene_Map);
    };
})();