// ==UserScript==
// @name          Automate CookieClicker
// @namespace     https://luzifer.io/
// @version       0.7.4
// @description   Automate everything!
// @author        Knut Ahlers <knut@ahlers.me>
// @source        https://github.com/Luzifer/automate-cookie-clicker
// @match         http://orteil.dashnet.org/cookieclicker/
// @require       https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr.min.js
// @updateURL     https://raw.githubusercontent.com/Luzifer/automate-cookie-clicker/master/autocookieclicker.user.js
// @grant         GM_info
// @grant         GM_addStyle
// ==/UserScript==

GM_addStyle('@import url("https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/css/toastr.min.css");');

var blockingUpgrades = [
  69, // Destructive upgrade: "One mind"
  333, // Milk selector
];
var purchaseSteps = 50;

function autoClick() {
  $('#bigCookie').click();
}

function executeAutoActions() {
  // Look for upgrades being available
  let availableUpgrades = $('.upgrade.enabled').filter(upgradeFilter);
  if (availableUpgrades.length > 0) {
    debug(availableUpgrades.length + " upgrades available, buying now...");
    availableUpgrades.click();
    toastr.info('Purchased ' + availableUpgrades.length + ' upgrades for you.');
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
      toastr.info('Purchased ' + topPurchase.find('.title:first').text() + ' for you.');
    }
  }
}

function checkCPS() {
  let cps = parseInt($('#cookies').children('div').text().split(': ')[1]);
  if (cps == 0) {
    if (window.autoClicker == undefined) {
      window.autoClicker = window.setInterval(autoClick, 1);
    }
  } else if (cps > 3000) {
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

(function() {
  'use strict';

  // Set options for toastr
  toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "2000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  };

  window.checkCPS = window.setInterval(checkCPS, 1000);

  // Enable automatic purchasing of upgrades / elements
  window.autoPurchase = window.setInterval(executeAutoActions, 500);

  // Startup notification
  let version = GM_info.script.version;
  toastr.info('Auto-CookieClicker ' + version + ' loaded.');
})();

function upgradeFilter(idx) {
  var onClickHandler = $(this).attr('onclick');
  if (onClickHandler == null) {
    return false;
  }
  var upgradeID = parseInt(onClickHandler.replace(/^.*\[([0-9]+)\].*$/, "$1"));
  return !blockingUpgrades.includes(upgradeID);
}
