/*:
 * @target MZ
 * @plugindesc 標準メニューとキャンセル操作を無効化します。
 * @author マミタロス
 *
 * @help
 * Escキー、右クリック、スマホのキャンセル操作による
 * 標準メニュー表示を無効化します。
 */

(() => {
    "use strict";

    Scene_Map.prototype.isMenuEnabled = function() {
        return false;
    };

    Scene_Map.prototype.isMenuCalled = function() {
        return false;
    };
})();