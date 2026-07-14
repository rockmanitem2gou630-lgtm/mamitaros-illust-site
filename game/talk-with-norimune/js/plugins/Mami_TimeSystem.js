/*:
 * @target MZ
 * @plugindesc 時間帯管理システム Ver1.0
 * @author マミタロス
 *
 * @help
 * 現在のPC・スマホの時計から時間帯を取得します。
 *
 * 利用例
 *
 * MamiTimeSystem.getTimeZone()
 *
 * 戻り値
 * morning
 * day
 * evening
 * night
 * midnight
 *
 * MamiTimeSystem.getHour()
 *
 * 0～23
 *
 * MamiTimeSystem.getDateInfo()
 *
 * {
 *   year,
 *   month,
 *   date,
 *   day
 * }
 */

(() => {

"use strict";

window.MamiTimeSystem = {};

function now(){
    return new Date();
}

MamiTimeSystem.getHour = function(){

    return now().getHours();

};

MamiTimeSystem.getMinute = function(){

    return now().getMinutes();

};

MamiTimeSystem.getSecond = function(){

    return now().getSeconds();

};

MamiTimeSystem.getDateInfo = function(){

    const d = now();

    return {

        year:d.getFullYear(),
        month:d.getMonth()+1,
        date:d.getDate(),
        day:d.getDay()

    };

};

MamiTimeSystem.getTimeZone = function(){

    const hour=this.getHour();

    if(hour>=5 && hour<=10){

        return "morning";

    }

    if(hour>=11 && hour<=16){

        return "day";

    }

    if(hour>=17 && hour<=18){

        return "evening";

    }

    if(hour>=19 && hour<=23){

        return "night";

    }

    return "midnight";

};

MamiTimeSystem.isMorning=function(){

    return this.getTimeZone()==="morning";

};

MamiTimeSystem.isDay=function(){

    return this.getTimeZone()==="day";

};

MamiTimeSystem.isEvening=function(){

    return this.getTimeZone()==="evening";

};

MamiTimeSystem.isNight=function(){

    return this.getTimeZone()==="night";

};

MamiTimeSystem.isMidnight=function(){

    return this.getTimeZone()==="midnight";

};

})();