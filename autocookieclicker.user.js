// ==UserScript==
// @name          Automate CookieClicker
// @namespace     https://luzifer.io/
// @version       0.9.2
// @description   Automate everything!
// @author        Knut Ahlers <knut@ahlers.me>
// @source        https://github.com/Luzifer/automate-cookie-clicker
// @match         http://orteil.dashnet.org/cookieclicker/
// @require       https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @updateURL     https://raw.githubusercontent.com/Luzifer/automate-cookie-clicker/master/autocookieclicker.user.js
// @grant         GM_info
// @grant         GM_addStyle
// ==/UserScript==

var blockingUpgrades = [
  69, // Destructive upgrade: "One mind"
  85, // Revoke elders covenant
  333, // Milk selector
];
var purchaseSteps = 50;

function autoClick() {
  $('#bigCookie').click();
}

function executeAutoActions() {
  // Click all golden cookies
  $('.shimmer').click();

  // Look for upgrades being available
  let availableUpgrades = $('.upgrade.enabled').filter(upgradeFilter);
  if (availableUpgrades.length > 0) {
    debug(availableUpgrades.length + " upgrades available, buying now...");
    availableUpgrades.click();
    note('Purchased ' + availableUpgrades.length + ' upgrades for you.');
  }

  // Get the top enabled purchase to be made
  if ($('.product.unlocked.enabled').length > 0) {
    let topPurchase = $('.product.unlocked.enabled').last();
    let topPurchaseCount = 0;
    if (topPurchase.find('.owned').text() != "") {
      topPurchaseCount = parseInt(topPurchase.find('.owned').text());
    }
    if (topPurchaseCount < getMaxBuy()) {
      debug("Auto-Buying: " + topPurchase.find('.title:first').text());
      topPurchase.click();
      note('Purchased ' + topPurchase.find('.title:first').text() + ' for you.');
    }
  }
}

function checkCPS() {
  let cps = Game.cookiesPs;
  if (cps < 3000) {
    if (window.autoClicker == undefined) {
      window.autoClicker = window.setInterval(autoClick, 1);
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
  var topPurchaseCount = 0;
  var topPurchaseTextCount = $('#product14').find('.owned').text();
  if (topPurchaseTextCount != "") {
    topPurchaseCount = parseInt(topPurchaseTextCount);
  }

  return Math.max(Math.ceil((topPurchaseCount + 1) / purchaseSteps), 1) * purchaseSteps;
}

function note(msg, quick = true) {
  // Icon: img/icons.png 0-based indices
  Game.Note("Auto-CookieClicker", msg, [12, 0], quick);
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

  window.checkCPS = window.setInterval(checkCPS, 1000);

  // Enable automatic purchasing of upgrades / elements
  window.autoPurchase = window.setInterval(executeAutoActions, 500);

  window.setTimeout(function() {
    // Startup notification
    let version = GM_info.script.version;
    note('Version ' + version + ' loaded.');
  }, 1000);
})();
