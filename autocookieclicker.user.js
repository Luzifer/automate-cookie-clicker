// ==UserScript==
// @name          Automate CookieClicker
// @namespace     https://luzifer.io/
// @version       0.15.1
// @description   Automate everything!
// @author        Knut Ahlers <knut@ahlers.me>
// @source        https://github.com/Luzifer/automate-cookie-clicker
// @match         http://orteil.dashnet.org/cookieclicker/
// @require       https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @updateURL     https://raw.githubusercontent.com/Luzifer/automate-cookie-clicker/master/autocookieclicker.user.js
// @icon          http://orteil.dashnet.org/cookieclicker/img/favicon.ico
// @grant         GM_info
// @grant         GM_addStyle
// ==/UserScript==

var blockingUpgrades = [
  69, // Destructive upgrade: "One mind"
  85, // Revoke elders covenant
  331, // Golden switch
  333, // Milk selector
  414, // Background selector
];
var dragonAuras = [
  10, // Golden cookies may trigger a Dragonflight.
  15, // All cookie production multiplied by 2.
];
var purchaseSteps = 50;

function autoClick() {
  $('#bigCookie').click();
}

function executeAutoActions() {
  // Click all golden cookies
  $('.shimmer').click();

  // Harvest sugar lumps
  if ((new Date() - Game.lumpT) > Game.lumpRipeAge) {
    Game.harvestLumps(1);
  }

  // Look for upgrades being available
  let availableUpgrades = $('.upgrade.enabled').filter(upgradeFilter);
  if (availableUpgrades.length > 0) {
    debug(availableUpgrades.length + " upgrades available, buying now...");
    availableUpgrades.click();
    note('Purchased ' + availableUpgrades.length + ' upgrades for you.');
  }

  // Get the top enabled purchase to be made
  let availableProducts = $('.product.unlocked.enabled').filter(productFilter);
  if (availableProducts.length > 0 && Game.buyMode == 1) { // buyMode 1 = buy, -1 = sell
    let product = $(availableProducts[availableProducts.length - 1]);

    debug("Auto-Buying: " + product.find('.title:first').text());
    product.click();
    note('Purchased ' + product.find('.title:first').text() + ' for you.');
  }

  manageDragon();
}

function controlAutoClicker() {
  let cps = Game.cookiesPs;
  if (cps < 3000 || hasActiveClickBuff()) {
    if (window.autoClicker == undefined) {
      window.autoClicker = window.setInterval(autoClick, 100);
    }
  } else {
    if (window.autoClicker != undefined) {
      window.clearInterval(window.autoClicker);
      window.autoClicker = undefined;
    }
  }
}

function debug(msg) {
  console.log("[AutoCookieClicker] " + msg);
}

function getMaxBuy() {
  let topPurchaseCount = Game.ObjectsById[Game.ObjectsN - 1].amount;

  return Math.max(Math.ceil((topPurchaseCount + 1) / purchaseSteps), 1) * purchaseSteps;
}

function hasActiveClickBuff() {
  var hasBuff = false;
  for (key in Game.buffs) {
    if (Game.buffs[key].multClick) hasBuff = true;
  }
  return hasBuff;
}

function installHelper() {
  // Startup notification
  let version = GM_info.script.version;
  note('Version ' + version + ' loaded.');

  window.controlAutoClicker = window.setInterval(controlAutoClicker, 1000);

  // Enable automatic purchasing of upgrades / elements
  window.autoPurchase = window.setInterval(executeAutoActions, 500);
}

function manageDragon() {
  // Upgrade dragon if possible
  if (Game.dragonLevels[Game.dragonLevel].cost() && Game.dragonLevel < Game.dragonLevels.length - 1) {
    Game.UpgradeDragon()
  }

  // Select first dragon aura
  if (Game.dragonAura != dragonAuras[0] && Game.dragonLevel >= dragonAuras[0] + 4 && Game.SelectingDragonAura != dragonAura[0]) {
    Game.SetDragonAura(dragonAuras[0], 0);
  }

  // Select second dragon aura
  if (Game.dragonAura2 != dragonAuras[1] && Game.dragonLevel >= 22 && Game.SelectingDragonAura != dragonAura[1]) {
    Game.SetDragonAura(dragonAuras[1], 1);
  }
}

function note(msg, quick = true) {
  // Icon: img/icons.png 0-based indices
  Game.Notify("Auto-CookieClicker", msg, [12, 0], quick, true);
}

function productFilter(idx) {
  let owned = Game.ObjectsById[parseInt($(this).attr('id').replace(/^product/, ''))].amount;
  return owned < getMaxBuy();
}

function upgradeFilter(idx) {
  var onClickHandler = $(this).attr('onclick');
  if (onClickHandler == null) {
    return false;
  }
  var upgradeID = parseInt(onClickHandler.replace(/^.*\[([0-9]+)\].*$/, "$1"));
  return !blockingUpgrades.includes(upgradeID);
}

(function() {
  'use strict';

  window.setTimeout(installHelper, 1000);
})();
