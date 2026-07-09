/*:
 * @target MZ
 * @plugindesc 選択肢とタイトル画面にアニメーションカーソルを表示します。
 * @author マミタロス
 *
 * @param ImageName
 * @text カーソル画像
 * @type file
 * @dir img/system
 * @default ChoiceCursor
 *
 * @param FrameWidth
 * @text 1コマの幅
 * @type number
 * @default 84
 *
 * @param FrameHeight
 * @text 1コマの高さ
 * @type number
 * @default 50
 *
 * @param Frames
 * @text コマ数
 * @type number
 * @default 8
 *
 * @param Speed
 * @text アニメ速度
 * @desc 数字が小さいほど速い
 * @type number
 * @default 8
 *
 * @param Scale
 * @text 拡大率
 * @type number
 * @decimals 2
 * @default 1.00
 *
 * @param HideDefaultCursor
 * @text 標準カーソルを隠す
 * @type boolean
 * @default true
 *
 * @param ChoiceOffsetX
 * @text 選択肢 X補正
 * @type number
 * @min -999
 * @default -35
 *
 * @param ChoiceOffsetY
 * @text 選択肢 Y補正
 * @type number
 * @min -999
 * @default 0
 *
 * @param TitleOffsetX
 * @text タイトル X補正
 * @type number
 * @min -999
 * @default -35
 *
 * @param TitleOffsetY
 * @text タイトル Y補正
 * @type number
 * @min -999
 * @default 0
 */

(() => {
  "use strict";

  const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];
  const p = PluginManager.parameters(pluginName);

  const imageName = String(p.ImageName || "ChoiceCursor");
  const frameWidth = Number(p.FrameWidth || 84);
  const frameHeight = Number(p.FrameHeight || 50);
  const frames = Number(p.Frames || 8);
  const speed = Math.max(1, Number(p.Speed || 8));
  const scale = Number(p.Scale || 1);
  const hideDefaultCursor = p.HideDefaultCursor === "true";

  const choiceOffsetX = Number(p.ChoiceOffsetX || -35);
  const choiceOffsetY = Number(p.ChoiceOffsetY || 0);
  const titleOffsetX = Number(p.TitleOffsetX || -35);
  const titleOffsetY = Number(p.TitleOffsetY || 0);

  function createAnimatedCursor(window, offsetX, offsetY) {
    const sprite = new Sprite();
    sprite.bitmap = ImageManager.loadSystem(imageName);
    sprite.anchor.set(0.5, 0.5);
    sprite.scale.set(scale, scale);
    sprite._frameIndex = 0;
    sprite._frameCount = 0;
    sprite._offsetX = offsetX;
    sprite._offsetY = offsetY;
    sprite.z = 999;
    window._mamiAnimatedCursor = sprite;
    window.addChild(sprite);
  }

  function updateAnimatedCursor(window) {
    const sprite = window._mamiAnimatedCursor;
    if (!sprite) return;

    const index = window.index();
    const active = window.visible && window.openness > 0 && index >= 0;

    sprite.visible = active;

    if (!active) return;

    const rect = window.itemRect(index);

    sprite.x = rect.x + sprite._offsetX;
    sprite.y = rect.y + rect.height / 2 + sprite._offsetY;

    sprite._frameCount++;
    if (sprite._frameCount >= speed) {
      sprite._frameCount = 0;
      sprite._frameIndex = (sprite._frameIndex + 1) % frames;
    }

    const sx = sprite._frameIndex * frameWidth;
    sprite.setFrame(sx, 0, frameWidth, frameHeight);

    if (hideDefaultCursor && window._cursorSprite) {
      window._cursorSprite.visible = false;
    }
  }

  function hideAnimatedCursor(window) {
    if (window._mamiAnimatedCursor) {
      window._mamiAnimatedCursor.visible = false;
    }
  }

  // 選択肢ウィンドウ
  const _Window_ChoiceList_initialize = Window_ChoiceList.prototype.initialize;
  Window_ChoiceList.prototype.initialize = function(rect) {
    _Window_ChoiceList_initialize.call(this, rect);
    createAnimatedCursor(this, choiceOffsetX, choiceOffsetY);
  };

  const _Window_ChoiceList_update = Window_ChoiceList.prototype.update;
  Window_ChoiceList.prototype.update = function() {
    _Window_ChoiceList_update.call(this);
    updateAnimatedCursor(this);
  };

  const _Window_ChoiceList_close = Window_ChoiceList.prototype.close;
  Window_ChoiceList.prototype.close = function() {
    _Window_ChoiceList_close.call(this);
    hideAnimatedCursor(this);
  };

  // タイトル画面
  const _Window_TitleCommand_initialize = Window_TitleCommand.prototype.initialize;
  Window_TitleCommand.prototype.initialize = function(rect) {
    _Window_TitleCommand_initialize.call(this, rect);
    createAnimatedCursor(this, titleOffsetX, titleOffsetY);
  };

  const _Window_TitleCommand_update = Window_TitleCommand.prototype.update;
  Window_TitleCommand.prototype.update = function() {
    _Window_TitleCommand_update.call(this);
    updateAnimatedCursor(this);
  };

  const _Window_TitleCommand_close = Window_TitleCommand.prototype.close;
  Window_TitleCommand.prototype.close = function() {
    _Window_TitleCommand_close.call(this);
    hideAnimatedCursor(this);
  };

})();