// ==UserScript==
// @name          Automate CookieClicker
// @namespace     https://luzifer.io/
// @version       0.18.1
// @description   Automate everything!
// @author        Knut Ahlers <knut@ahlers.me>
// @source        https://github.com/Luzifer/automate-cookie-clicker
// @match         http://orteil.dashnet.org/cookieclicker/
// @require       https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @updateURL     https://raw.githubusercontent.com/Luzifer/automate-cookie-clicker/master/autocookieclicker.user.js
// @icon          http://orteil.dashnet.org/cookieclicker/img/favicon.ico
// @grant         GM_info
// ==/UserScript==

/* global Game:galse, GM_info:false, $:false */

let blockingUpgrades = [
  69, // Destructive upgrade: "One mind"
  85, // Revoke elders covenant
  182, 183, 184, 185, 209, // Season switchers
  331, // Golden switch
  333, // Milk selector
  414, // Background selector
];
let purchaseSteps = 50;

function autoClick() {
  $('#bigCookie').click();
}

function executeAutoActions() {
  if (Game.T % (Game.fps * 0.5) !== 0) {
    // Game logic ticks very fast, only trigger every 0.5s
    return;
  }

  // Click all golden cookies
  $('.shimmer').click();

  // Get rid of wrinklers
  while (Game.wrinklers.filter(obj => obj.hp > 0 && obj.phase > 0).length > 0) {
    Game.PopRandomWrinkler();
  }

  // Harvest sugar lumps
  if ((new Date() - Game.lumpT) > Game.lumpRipeAge) {
    Game.harvestLumps(1);
  }

  // Look for upgrades being available
  let availableUpgrades = $('.upgrade.enabled').filter(upgradeFilter);
  if (availableUpgrades.length > 0) {
    availableUpgrades.click();
    note('Purchased ' + availableUpgrades.length + ' upgrades for you.');
  }

  // Get the top enabled purchase to be made
  let availableProducts = Game.ObjectsById.filter(obj => obj.price < Game.cookies && obj.amount < getMaxBuy());
  while (availableProducts.length > 0 && Game.buyMode === 1) { // buyMode 1 = buy, -1 = sell
    let product = availableProducts[availableProducts.length - 1];

    for (let buyAmount = getMaxBuy() - product.amount; buyAmount > 0; buyAmount--) {
      if (product.getSumPrice(buyAmount) <= Game.cookies) {
        product.buy(buyAmount);
        note('Purchased ' + buyAmount + ' ' + (buyAmount === 1 ? product.name : product.plural) + ' for you.');
        break;
      }
    }

    availableProducts = Game.ObjectsById.filter(obj => obj.price < Game.cookies && obj.amount < getMaxBuy());
  }

  manageDragon();
}

function controlAutoClicker() {
  let cps = Game.cookiesPs;
  if (cps < 3000 || hasActiveClickBuff()) {
    if (window.autoClicker === undefined) {
      window.autoClicker = window.setInterval(autoClick, 100);
    }
  } else {
    if (window.autoClicker !== undefined) {
      window.clearInterval(window.autoClicker);
      window.autoClicker = undefined;
    }
  }
}

function getMaxBuy() {
  let topPurchaseCount = Game.ObjectsById[Game.ObjectsN - 1].amount;

  return Math.max(Math.ceil((topPurchaseCount + 1) / purchaseSteps), 1) * purchaseSteps;
}

function hasActiveClickBuff() {
  let hasBuff = false;
  for (let key in Game.buffs) {
    if (Game.buffs[key].multClick) hasBuff = true;
  }
  return hasBuff;
}

function installHelper() {
  // Startup notification
  let version = GM_info.script.version;
  note('Version ' + version + ' loaded.');

  Game.customChecks.push(controlAutoClicker);
  Game.customLogic.push(executeAutoActions);
}

function manageDragon() {
  // Upgrade dragon if possible
  if (Game.dragonLevels[Game.dragonLevel].cost() && Game.dragonLevel < Game.dragonLevels.length - 1) {
    Game.UpgradeDragon();
  }

  // Choosing dragon aura is currently not possible :(
  // This will just open a select dialogue...
}

function note(msg, quick = true) {
  // Icon: img/icons.png 0-based indices
  Game.Notify('Auto-CookieClicker', msg, [12, 0], quick, true);
}

function upgradeFilter() {
  let onClickHandler = $(this).attr('onclick');
  if (onClickHandler == null) {
    return false;
  }
  let upgradeID = parseInt(onClickHandler.replace(/^.*\[([0-9]+)\].*$/, '$1'));
  return !blockingUpgrades.includes(upgradeID);
}

(function() {
  'use strict';

  window.setTimeout(installHelper, 1000);
})();
