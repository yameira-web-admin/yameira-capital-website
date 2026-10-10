(function () {
  'use strict';

  var languages = [
    { code: 'en', label: 'English', home: 'index.html', dir: 'ltr' },
    { code: 'ja', label: '日本語', home: 'ja/home.html', dir: 'ltr' },
    { code: 'ko', label: '한국어', home: 'ko/home.html', dir: 'ltr' },
    { code: 'ar', label: 'العربية', home: 'ar/home.html', dir: 'rtl' },
    { code: 'es', label: 'Español', home: 'es/home.html', dir: 'ltr' },
    { code: 'pt', label: 'Português', home: 'pt/home.html', dir: 'ltr' },
    { code: 'zh-cn', label: '中文简体', home: 'cn/home.html?lang=sc', dir: 'ltr' },
    { code: 'zh-tw', label: '中文繁體', home: 'cn/home7339.html?lang=tc', dir: 'ltr' },
    { code: 'vi', label: 'Tiếng Việt', home: 'vi/home.html', dir: 'ltr' }
  ];

  var script = document.currentScript;
  var rootUrl = script ? new URL('../', script.src) : new URL('/', window.location.href);
  var storageKey = 'ymc-site-language';

  function currentLanguage() {
    var relativePath = decodeURIComponent(window.location.pathname)
      .replace(decodeURIComponent(rootUrl.pathname), '')
      .replace(/^\/+/, '');
    var firstSegment = relativePath.split('/')[0].toLowerCase();

    if (firstSegment === 'cn') {
      return /(?:home7339|[?&]lang=tc)/i.test(relativePath + window.location.search) ? 'zh-tw' : 'zh-cn';
    }
    if (languages.some(function (language) { return language.code === firstSegment; })) {
      return firstSegment;
    }
    return 'en';
  }

  function languageUrl(language) {
    var relativePath = decodeURIComponent(window.location.pathname)
      .replace(decodeURIComponent(rootUrl.pathname), '')
      .replace(/^\/+/, '');
    var parts = relativePath.split('/');
    var sourceLanguage = currentLanguage();
    var sourcePrefix = sourceLanguage.indexOf('zh-') === 0 ? 'cn' : sourceLanguage;
    var targetPrefix = language.code.indexOf('zh-') === 0 ? 'cn' : language.code;

    if (/^home(?:7339)?\.html$/i.test(parts[parts.length - 1]) || relativePath === 'index.html' || relativePath === '') {
      return new URL(language.home, rootUrl).href;
    }

    if (parts[0] === sourcePrefix && parts.length > 1) {
      parts[0] = targetPrefix;
      if (language.code === 'zh-tw' && parts.slice(1).join('/') === 'home.html') {
        return new URL(language.home, rootUrl).href;
      }
      return new URL(parts.join('/') + window.location.search + window.location.hash, rootUrl).href;
    }

    if (sourceLanguage === 'en' && parts[0] === 'en' && language.code !== 'en') {
      parts[0] = targetPrefix;
      return new URL(parts.join('/') + window.location.search + window.location.hash, rootUrl).href;
    }

    return new URL(language.home, rootUrl).href;
  }

  function makeLink(language, className) {
    var link = document.createElement('a');
    link.href = languageUrl(language);
    link.className = className || '';
    link.target = '_self';
    link.lang = language.code;
    link.textContent = language.label;
    link.dataset.siteLanguage = language.code;
    link.addEventListener('click', function () {
      try { window.localStorage.setItem(storageKey, language.code); } catch (error) {}
    });
    return link;
  }

  document.querySelectorAll('[id="langselector"]').forEach(function (container) {
    container.replaceChildren();
    languages.forEach(function (language) {
      container.appendChild(makeLink(language, 'dropdown-item'));
    });
  });

  document.querySelectorAll('#submenu-language ul').forEach(function (list) {
    list.replaceChildren();
    languages.forEach(function (language) {
      var item = document.createElement('li');
      item.appendChild(makeLink(language, ''));
      list.appendChild(item);
    });
  });

  document.querySelectorAll('#nav-language').forEach(function (trigger) {
    var item = trigger.closest('.nav-item');
    var menu = item && item.querySelector('.dropdown-menu');
    if (!menu) return;

    trigger.removeAttribute('data-bs-toggle');
    trigger.removeAttribute('data-toggle');

    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      var isOpen = menu.classList.toggle('show');
      trigger.setAttribute('aria-expanded', String(isOpen));
    }, true);
  });

  document.addEventListener('click', function (event) {
    document.querySelectorAll('#nav-language').forEach(function (trigger) {
      var item = trigger.closest('.nav-item');
      var menu = item && item.querySelector('.dropdown-menu');
      if (item && menu && !item.contains(event.target)) {
        menu.classList.remove('show');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  var activeCode = currentLanguage();
  var activeLanguage = languages.find(function (language) { return language.code === activeCode; }) || languages[0];
  document.documentElement.lang = activeLanguage.code;
  document.documentElement.dir = activeLanguage.dir;

  if (activeCode !== 'en') {
    var activePrefix = activeCode.indexOf('zh-') === 0 ? 'cn' : activeCode;
    document.querySelectorAll('a[href]:not([data-site-language])').forEach(function (link) {
      var url;
      try { url = new URL(link.getAttribute('href'), document.baseURI); } catch (error) { return; }
      if (url.origin !== rootUrl.origin || url.pathname.indexOf(rootUrl.pathname) !== 0) return;

      var relativePath = decodeURIComponent(url.pathname)
        .replace(decodeURIComponent(rootUrl.pathname), '')
        .replace(/^\/+/, '');
      if (relativePath.indexOf('en/') === 0) {
        url.pathname = rootUrl.pathname + activePrefix + '/' + relativePath.slice(3);
        link.href = url.href;
      } else if (relativePath === 'index.html') {
        link.href = new URL(activeLanguage.home, rootUrl).href;
      }
    });
  }

  document.querySelectorAll('[data-site-language="' + activeCode + '"]').forEach(function (link) {
    link.setAttribute('aria-current', 'page');
  });
})();
