// ==UserScript==
// @name          Automate CookieClicker
// @namespace     https://luzifer.io/
// @version       0.19.1
// @description   Automate everything!
// @author        Knut Ahlers <knut@ahlers.me>
// @source        https://github.com/Luzifer/automate-cookie-clicker
// @match         http://orteil.dashnet.org/cookieclicker/
// @updateURL     https://raw.githubusercontent.com/Luzifer/automate-cookie-clicker/master/autocookieclicker.user.js
// @icon          http://orteil.dashnet.org/cookieclicker/img/favicon.ico
// @grant         GM_info
// ==/UserScript==

/* global Game:false, GM_info:false */

let blockingUpgrades = [
  69, // Destructive upgrade: "One mind"
];
let purchaseSteps = 50;

function autoClick() {
  Game.ClickCookie();
}

function executeAutoActions() {
  if (Game.T % (Game.fps * 0.5) !== 0) {
    // Game logic ticks very fast, only trigger every 0.5s
    return;
  }

  // Click all golden cookies
  Game.shimmers.forEach(obj => obj.pop());

  // Get rid of wrinklers
  while (Game.wrinklers.filter(obj => obj.hp > 0 && obj.phase > 0).length > 0) {
    Game.PopRandomWrinkler();
  }

  // Harvest sugar lumps
  if ((new Date() - Game.lumpT) > Game.lumpRipeAge) {
    Game.harvestLumps(1);
  }

  // Look for upgrades being available
  let availableUpgrades = Game.UpgradesInStore.filter(obj => obj.canBuy() && !blockingUpgrades.includes(obj.id));
  while (availableUpgrades.length > 0) {
    let upgrade = availableUpgrades[0];
    upgrade.buy();
    note(`Purchased upgrade ${upgrade.name} for you.`);

    availableUpgrades = Game.UpgradesInStore.filter(obj => obj.canBuy() && !blockingUpgrades.includes(obj.id));
  }

  // Get the top enabled purchase to be made
  let availableProducts = Game.ObjectsById.filter(obj => obj.price < Game.cookies && obj.amount < getMaxBuy());
  while (availableProducts.length > 0 && Game.buyMode === 1) { // buyMode 1 = buy, -1 = sell
    let product = availableProducts[availableProducts.length - 1];

    for (let buyAmount = getMaxBuy() - product.amount; buyAmount > 0; buyAmount--) {
      if (product.getSumPrice(buyAmount) <= Game.cookies) {
        product.buy(buyAmount);
        note(`Purchased ${buyAmount} ${buyAmount === 1 ? product.name : product.plural} for you.`);
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
  note(`Version ${version} loaded.`);

  // Do not click toggle upgrades
  blockingUpgrades = blockingUpgrades.concat(Game.UpgradesByPool['toggle'].map(obj => obj.id));

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

(() => window.setTimeout(installHelper, 1000))();
