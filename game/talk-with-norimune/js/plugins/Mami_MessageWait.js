/*:
 * @target MZ
 * @plugindesc 選択肢後の返答開始ウェイト Ver1.0
 * @author マミタロス
 *
 * @param ChoiceMessageWait
 * @text 選択肢後待機
 * @type number
 * @default 6
 *
 * @help
 * 選択肢のあと最初の文章だけ
 * 指定フレーム待ってから表示します。
 */

(() => {

"use strict";

const pluginName =
document.currentScript.src.match(/([^\/]+)\.js$/)[1];

const params =
PluginManager.parameters(pluginName);

const waitFrames =
Number(params.ChoiceMessageWait || 6);

let pendingWait = 0;

/*
 * 選択肢決定時
 */
const _Window_ChoiceList_callOkHandler =
Window_ChoiceList.prototype.callOkHandler;

Window_ChoiceList.prototype.callOkHandler =
function(){

    pendingWait = waitFrames;

    _Window_ChoiceList_callOkHandler.call(this);

};

/*
 * 次の文章開始
 */
const _Window_Message_startMessage =
Window_Message.prototype.startMessage;

Window_Message.prototype.startMessage =
function(){

    _Window_Message_startMessage.call(this);

    this._mamiMessageWait =
        pendingWait;

    pendingWait = 0;

};

/*
 * 待機
 */
const _Window_Message_update =
Window_Message.prototype.update;

Window_Message.prototype.update =
function(){

    if(
        this._mamiMessageWait > 0
    ){

        this._mamiMessageWait--;

        return;

    }

    _Window_Message_update.call(this);

};

})();