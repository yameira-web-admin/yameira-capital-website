(function () {
    'use strict';

    var disabledAttribute = 'data-external-link-disabled';
    var allowedAttribute = 'data-external-link-allowed';

    function isExternalWebLink(anchor) {
        var href = anchor.getAttribute('href');
        if (!href || !/^(?:https?:)?\/\//i.test(href.trim())) {
            return false;
        }

        try {
            return new URL(href, window.location.href).origin !== window.location.origin;
        } catch (error) {
            return true;
        }
    }

    function disableAnchor(anchor) {
        if (anchor.hasAttribute(allowedAttribute) || !isExternalWebLink(anchor)) {
            return;
        }

        anchor.setAttribute(disabledAttribute, '');
        anchor.setAttribute('aria-disabled', 'true');
        anchor.setAttribute('tabindex', '-1');
        anchor.removeAttribute('href');
        anchor.removeAttribute('target');
        anchor.removeAttribute('onclick');
    }

    function disableExternalLinks(root) {
        if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) {
            return;
        }

        if (root.matches && root.matches('a[href]')) {
            disableAnchor(root);
        }
        root.querySelectorAll('a[href]').forEach(disableAnchor);
    }

    function stopExternalNavigation(event) {
        var anchor = event.target.closest && event.target.closest('a');
        if (!anchor) {
            return;
        }

        if (anchor.hasAttribute(disabledAttribute) ||
            (isExternalWebLink(anchor) && !anchor.hasAttribute(allowedAttribute))) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    function removeUnsupportedAccountLinks() {
        var accountLabels = ['Open an Account', 'Finish an Application'];
        document.querySelectorAll('#footerSiteLinks .col-12').forEach(function (column) {
            var heading = column.querySelector(':scope > p');
            if (!heading || heading.textContent.trim() !== 'Account') return;

            column.querySelectorAll(':scope > ul:first-of-type > li').forEach(function (item) {
                if (accountLabels.indexOf(item.textContent.trim()) !== -1) item.remove();
            });
        });

        var unsupportedSupportPaths = [
            '/support/individuals',
            '/accounts/welcome-individuals',
            '/support/fund-my-account',
            '/support/reports-and-dates',
            '/support/institutions'
        ];

        var supportFundingCta = document.getElementById('mm-support-desktop');
        if (supportFundingCta) {
            var fundingPanel = supportFundingCta.closest('.col-3');
            if (fundingPanel) fundingPanel.remove();
        }

        var desktopSupportMenu = document.querySelector('#nav-support + .dropdown-menu');
        if (desktopSupportMenu) {
            var supportLinksColumn = desktopSupportMenu.querySelector('.row.h-100 > .col-9');
            if (supportLinksColumn) {
                supportLinksColumn.classList.remove('col-9');
                supportLinksColumn.classList.add('col-12');
            }
        }

        document.querySelectorAll('#nav-support + .dropdown-menu a[href], #submenu-support a[href], a[href*="fund-my-account"]').forEach(function (anchor) {
            var path = new URL(anchor.getAttribute('href'), window.location.href).pathname.toLowerCase();
            var isPublicInstitutionTool = /support-additional-tools/i.test(anchor.getAttribute('href'));
            if (!isPublicInstitutionTool && unsupportedSupportPaths.some(function (fragment) { return path.indexOf(fragment) !== -1; })) {
                var item = anchor.closest('li');
                (item || anchor).remove();
            }
        });

        var supportMenu = document.getElementById('submenu-support');
        if (supportMenu) {
            supportMenu.querySelectorAll('.submenu-title').forEach(function (heading) {
                if (/Support for (Individuals|Institutions)/i.test(heading.textContent)) heading.remove();
            });
        }
    }

    function removeUnsupportedPlatformLinks() {
        var platformPaths = [
            '/trading/ibkr-desktop',
            '/trading/ibkr-mobile',
            '/trading/client-portal',
            '/trading/tws'
        ];
        var installerPattern = /\.(?:exe|msi|dmg|pkg|apk)(?:[?#]|$)/i;

        document.querySelectorAll('a[href]').forEach(function (anchor) {
            var href = anchor.getAttribute('href');
            var path = new URL(href, window.location.href).pathname.toLowerCase();
            if (platformPaths.some(function (fragment) { return path.indexOf(fragment) !== -1; }) || installerPattern.test(href)) {
                var navigationItem = anchor.closest('.dropdown-menu li, .submenu li, #footerSiteLinks li');
                (navigationItem || anchor).remove();
            }
        });

        document.querySelectorAll('#footerSiteLinks .col-12').forEach(function (column) {
            column.querySelectorAll(':scope > p').forEach(function (heading) {
                if (heading.textContent.trim() !== 'Software & Downloads') return;
                var list = heading.nextElementSibling;
                if (list && list.tagName === 'UL') list.remove();
                heading.remove();
            });
        });
    }

    function suppressShowcasePopups() {
        var activePopups = document.querySelectorAll(
            '#modalNewsAtIBKR.show, #cookie-modal.show, #modal-privacy.show'
        );
        if (!activePopups.length) return;

        activePopups.forEach(function (popup) {
            popup.classList.remove('show');
            popup.setAttribute('aria-hidden', 'true');
            popup.removeAttribute('aria-modal');
        });
        document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
            backdrop.remove();
        });
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
    }

    if (/\/trading\/(?:ibkr-desktop|ibkr-mobile|client-portal|tws)(?:7abe)?\.html$/i.test(window.location.pathname)) {
        window.location.replace('/');
        return;
    }

    removeUnsupportedAccountLinks();
    removeUnsupportedPlatformLinks();
    suppressShowcasePopups();
    disableExternalLinks(document);

    new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(disableExternalLinks);
            if (mutation.type === 'attributes') {
                disableAnchor(mutation.target);
            }
        });
    }).observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['href']
    });

    new MutationObserver(suppressShowcasePopups).observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });

    ['click', 'auxclick'].forEach(function (eventName) {
        document.addEventListener(eventName, stopExternalNavigation, true);
    });
}());
