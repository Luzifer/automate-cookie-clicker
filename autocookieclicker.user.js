// ==UserScript==
// @name          Automate CookieClicker
// @namespace     https://luzifer.io/
// @version       0.3.0
// @description   Automate everything!
// @author        Knut Ahlers <knut@ahlers.me>
// @match         http://orteil.dashnet.org/cookieclicker/
// @require       https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr.min.js
// @updateURL     https://gist.github.com/Luzifer/706ea5db3e0a65f1dd142d7afa3aecb0/raw/autocookieclicker.user.js
// @grant         GM_info
// @grant         GM_addStyle
// ==/UserScript==

GM_addStyle('@import url("https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/css/toastr.min.css");');

function autoClick() {
  $('#bigCookie').click();
}

function autoPurchaseUpgrades() {
  // Set buying amount to 10 per purchase
  $('#storeBulk10').click();

  // Look for upgrades being available
  let availableUpgrades = $('#upgrades > .upgrade.enabled');
  if (availableUpgrades.length > 0) {
    debug(availableUpgrades.length + " upgrades available, buying now...");
    availableUpgrades.click();
    toastr.info('Purchased ' + availableUpgrades.length + ' upgrades for you.');
  }

  // Get the top enabled purchase to be made
  let topPurchase = $('.product.unlocked').last();
  if (topPurchase.hasClass('enabled')) {
    debug("Auto-Buying: " + topPurchase.find('.title').text());
    topPurchase.click();
    toastr.info('Purchased ' + topPurchase.find('.title').text() + ' for you.');
  } else {
    debug("Not enough money to buy top purchase: " + topPurchase.find('.title').text() + " (need " + topPurchase.find('.price').text() + " cookies)");
  }
}

function debug(msg) {
  console.log("[AutoCookieClicker] " + msg);
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

  let cps = parseInt($('#cookies').children('div').text().split(': ')[1]);
  if (cps == 0) {
    window.autoClicker = window.setInterval(autoClick, 1);
  }

  // Enable automatic purchasing of upgrades / elements
  window.autoPurchase = window.setInterval(autoPurchaseUpgrades, 10000);

  // Startup notification
  let version = GM_info.script.version;
  toastr.info('Auto-CookieClicker ' + version + ' loaded.');
})();
