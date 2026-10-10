(function () {
  'use strict';

  // The mirrored shell calls these server-provided cookie hooks on window load.
  // Local consent is handled below, so keep the compatibility hooks inert.
  window.addCookies = window.addCookies || function () {};
  window.checkCookies = window.checkCookies || function () {};

  var consentKey = 'ibkr-local-cookie-consent';
  var cookieModal = document.getElementById('cookie-modal');
  var acceptButton = document.getElementById('btn_accept_cookies');
  var closeButton = document.getElementById('cookie-modal-close');
  var marketBanner = document.getElementById('bandaid');
  var consentAccepted = false;

  // The live banner normally waits for an YMC API response. The mirror already
  // includes its official static fallback, so expose that immediately offline.
  if (marketBanner) marketBanner.classList.remove('is-loading');

  function hideCookieModal() {
    if (!cookieModal) return;

    if (consentAccepted) document.body.classList.add('local-consent-accepted');
    cookieModal.classList.remove('show');
    cookieModal.classList.add('local-consent-hidden');
    cookieModal.setAttribute('aria-hidden', 'true');
    cookieModal.removeAttribute('aria-modal');
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
    document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
      backdrop.remove();
    });
  }

  function saveConsent(event) {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    consentAccepted = true;
    try {
      window.localStorage.setItem(consentKey, 'accepted');
    } catch (error) {
      // The page remains usable when storage is disabled.
    }
    hideCookieModal();
    window.setTimeout(hideCookieModal, 0);
  }

  if (acceptButton) acceptButton.addEventListener('click', saveConsent, true);
  if (closeButton) closeButton.addEventListener('click', hideCookieModal, true);

  try {
    if (window.localStorage.getItem(consentKey) === 'accepted') {
      consentAccepted = true;
      hideCookieModal();
    }
  } catch (error) {
    // Keep the upstream first-visit dialog when storage is unavailable.
  }

  document.querySelectorAll('.ibkr-header .navbar-bottom .nav-item.dropdown').forEach(function (item) {
    var trigger = item.querySelector(':scope > .nav-link');
    var menu = item.querySelector(':scope > .dropdown-menu');
    if (!trigger || !menu) return;

    item.addEventListener('focusin', function () {
      trigger.setAttribute('aria-expanded', 'true');
    });
    item.addEventListener('focusout', function (event) {
      if (!item.contains(event.relatedTarget)) {
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  function replaceInvestorRelations(scope) {
    if (!scope) return;
    scope.querySelectorAll('[data-external-link-disabled]').forEach(function (item) {
      if (!item.textContent.trim().startsWith('Investor Relations')) return;
      var link = document.createElement('a');
      Array.from(item.attributes).forEach(function (attribute) {
        if (attribute.name !== 'data-external-link-disabled') link.setAttribute(attribute.name, attribute.value);
      });
      link.href = '#';
      link.setAttribute('aria-disabled', 'true');
      link.addEventListener('click', function (event) {
        event.preventDefault();
      });
      link.innerHTML = item.innerHTML;
      item.replaceWith(link);
    });
  }

  function addTeamLink() {
    var path = window.location.pathname.replace(/\\/g, '/');
    var marker = path.indexOf('/_fron/');
    var tail = marker >= 0 ? path.slice(marker + 7) : '';
    var depth = Math.max(0, tail.split('/').length - 1);
    var localRoot = marker >= 0 ? path.slice(0, marker + 7) : '../'.repeat(depth);
    var teamHref = window.location.protocol === 'file:' ? (marker >= 0 ? 'file://' + localRoot : localRoot) + 'about/team/index.html' : '/about/team/';
    var desktopAbout = document.getElementById('nav-about-us');
    var desktopColumn = desktopAbout && desktopAbout.closest('.nav-item').querySelector('.dropdown-menu .col-6');
    if (desktopColumn && !desktopColumn.querySelector('[data-team-link]')) {
      var desktopLink = document.createElement('a');
      desktopLink.className = 'dropdown-item d-block';
      desktopLink.href = teamHref;
      desktopLink.setAttribute('data-team-link', '');
      desktopLink.innerHTML = 'Leadership &amp; Team<br><span class="label-subtitle d-block">Meet our leadership and board</span>';
      desktopColumn.appendChild(desktopLink);
    }

    function appendListLink(list, withSubtitle) {
      if (!list || list.querySelector('[data-team-link]')) return;
      var item = document.createElement('li');
      item.innerHTML = '<a data-team-link href="' + teamHref + '">Leadership &amp; Team' + (withSubtitle ? '<br><span class="label-subtitle">Meet our leadership and board</span>' : '') + '</a>';
      list.appendChild(item);
    }

    appendListLink(document.querySelector('#submenu-about ul'), true);
    var footerHeading = Array.from(document.querySelectorAll('#footerSiteLinks p')).find(function (heading) {
      return heading.textContent.trim() === 'About Us';
    });
    appendListLink(footerHeading && footerHeading.nextElementSibling, false);
  }

  replaceInvestorRelations(document.querySelector('#ibkr-header'));
  replaceInvestorRelations(document.querySelector('.menu-mobile'));
  replaceInvestorRelations(document.getElementById('footerSiteLinks'));
  addTeamLink();
})();
