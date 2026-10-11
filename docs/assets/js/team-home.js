(function () {
  'use strict';

  function renderTeamPage() {
    var root = document.getElementById('contents');
    var data = window.ymcTeam;
    if (!root || !data) return;

    var featured = data.leadership.find(function (person) { return person.featured; });
    var executives = data.leadership.filter(function (person) { return !person.featured; });
    var teamLead = data.board.find(function (person) { return person.featured; });
    var teamMembers = data.board.filter(function (person) { return !person.featured; });
    var focus = function (person) {
      return '<ul class="ymc-team-focus">' + person.focus.map(function (item) {
        return '<li>' + item + '</li>';
      }).join('') + '</ul>';
    };
    var textlessLeadership = ['Alex Morgan', 'Maya Chen', 'Adrian Cole', 'Elena Rossi'];
    var executiveCards = executives.map(function (person) {
      if (textlessLeadership.indexOf(person.name) !== -1) {
        return '<article class="ymc-team-card ymc-team-card--image-only"><div class="ymc-team-image"><img src="' + person.image + '" alt="Leadership portrait"></div><div class="ymc-team-card__body" aria-hidden="true"></div></article>';
      }
      return '<article class="ymc-team-card"><div class="ymc-team-image"><img src="' + person.image + '" alt="Portrait of ' + person.name + '"></div><div class="ymc-team-card__body"><p class="ymc-team-role">' + person.title + '</p><h3>' + person.name + '</h3><p class="ymc-team-bio">' + person.bio + '</p>' + focus(person) + '</div></article>';
    }).join('');
    var featuredLeadership = textlessLeadership.indexOf(featured.name) !== -1
      ? '<article class="ymc-featured ymc-featured--image-only"><div class="ymc-team-image"><img src="' + featured.image + '" alt="Leadership portrait"></div><div class="ymc-featured__body" aria-hidden="true"></div></article>'
      : '<article class="ymc-featured"><div class="ymc-team-image"><img src="' + featured.image + '" alt="Portrait of ' + featured.name + '"></div><div class="ymc-featured__body"><p class="ymc-team-role">' + featured.title + '</p><h3>' + featured.name + '</h3><p class="ymc-team-bio">' + featured.bio + '</p>' + focus(featured) + '</div></article>';
    var boardCards = teamMembers.map(function (person) {
      return '<article class="ymc-board-card"><div class="ymc-team-image"><img src="' + person.image + '" alt="Placeholder portrait for ' + person.name + '"></div><div class="ymc-board-card__body"><p class="ymc-team-role">' + person.title + '</p><h3>' + person.name + '</h3><p>' + person.bio + '</p></div></article>';
    }).join('');

    root.innerHTML = '<main class="ymc-team-page"><section class="ymc-team-hero financial-data-region"><canvas class="financial-data-background" aria-hidden="true"></canvas><div class="container"><div class="ymc-team-hero__copy"><p class="ymc-team-crumb">About Us / Our Team</p><p class="ymc-team-kicker">Our Team</p><h1>People Behind<br>Yameira Capital</h1><p class="ymc-team-lead">A multidisciplinary team combining investment experience, data intelligence and dependable technology to build for the long term.</p></div></div></section><section class="ymc-team-section"><div class="container"><header class="ymc-team-heading"><div><p class="ymc-team-kicker">Our Team</p><h2>Clear thinking.<br>Shared conviction.</h2></div><p>Our team brings together deep research, technology leadership and market experience across every part of the firm.</p></header>' + featuredLeadership + '<div class="ymc-executive-grid">' + executiveCards + '</div></div></section><section class="ymc-team-section ymc-team-section--board"><div class="container"><header class="ymc-team-heading"><div><p class="ymc-team-kicker">Team Expertise</p><h2>Independent perspective.<br>Long-term accountability.</h2></div><p>Four complementary disciplines strengthen our investment process, technology platform and responsible growth.</p></header><div class="ymc-board-grid">' + boardCards + '</div></div></section><section class="ymc-team-close"><div class="container"><p>Built on discipline. <span>Driven by insight. Designed for the long term.</span></p></div></section></main>';
    var boardSection = root.querySelector('.ymc-team-section--board');
    if (boardSection) {
      var boardHeading = boardSection.querySelector('.ymc-team-heading');
      if (boardHeading) {
        boardHeading.querySelector('.ymc-team-kicker').textContent = 'Our Team';
        boardHeading.querySelector('h2').innerHTML = 'Independent perspective.<br>Long-term accountability.';
        boardHeading.querySelector('p:last-child').textContent = 'Our multidisciplinary team combines data intelligence, research and technology leadership.';
      }
      var boardGrid = boardSection.querySelector('.ymc-board-grid');
      var lead = document.createElement('article');
      lead.className = 'ymc-featured ymc-featured--team';
      lead.innerHTML = '<div class="ymc-team-image"><img src="' + teamLead.image + '" alt="Portrait of ' + teamLead.name + '"></div><div class="ymc-featured__body"><p class="ymc-team-role">' + teamLead.title + '</p><h3>' + teamLead.name + '</h3><p class="ymc-team-bio">' + teamLead.bio + '</p>' + focus(teamLead) + '</div>';
      boardGrid.parentNode.insertBefore(lead, boardGrid);
    }
    var leadershipSection = root.querySelector('.ymc-team-section:not(.ymc-team-section--board)');
    if (leadershipSection) {
      leadershipSection.querySelector('.ymc-team-kicker').textContent = 'Leadership';
      leadershipSection.querySelector('h2').innerHTML = 'Purposeful leadership.<br>Measured decisions.';
      leadershipSection.querySelector('.ymc-team-heading > p').textContent = 'Our executive team brings together investment judgment, operational rigor and technology leadership across every part of the firm.';
    }
    root.querySelector('.ymc-team-crumb').textContent = 'About Us / Leadership & Team';
    root.querySelector('.ymc-team-hero .ymc-team-kicker').textContent = 'About Us';
    root.querySelector('.ymc-team-lead').textContent = 'Our people unite investment discipline, technological expertise and global market perspective to build a resilient institution for the long term.';

    var titleSection = document.createElement('section');
    titleSection.className = 'ymc-team-title page-title';
    titleSection.innerHTML = '<div class="container"><div class="row"><div class="col"><h1>Leadership &amp; Team</h1></div></div></div>';
    root.querySelector('.ymc-team-page').insertBefore(titleSection, root.querySelector('.ymc-team-hero'));

    document.querySelectorAll('a[href="about.html"], a[href="en/about/index.html"]').forEach(function (link) {
      if (!link.closest('#footer')) link.setAttribute('aria-current', 'page');
    });
    addTeamNavigation();
  }

  function addTeamNavigation() {
    var path = window.location.pathname.replace(/\\/g, '/');
    var marker = path.indexOf('/_fron/');
    var tail = marker >= 0 ? path.slice(marker + 7) : '';
    var depth = Math.max(0, tail.split('/').length - 1);
    var localRoot = marker >= 0 ? path.slice(0, marker + 7) : '../'.repeat(depth);
    var teamHref = window.location.protocol === 'file:' ? (marker >= 0 ? 'file://' + localRoot : localRoot) + 'about/team/index.html' : '/about/team/';
    function appendLink(list, className) {
      if (!list || list.querySelector('[data-team-link]')) return;
      var item = document.createElement('li');
      item.innerHTML = '<a class="' + className + '" data-team-link href="' + teamHref + '" aria-current="page">Leadership &amp; Team<span class="label-subtitle d-block">Meet our leadership and board</span></a>';
      list.appendChild(item);
    }

    var desktopAbout = document.querySelector('#nav-about-us');
    var desktopItem = desktopAbout && desktopAbout.closest('.nav-item');
    var desktopColumn = desktopItem && desktopItem.querySelector('.dropdown-menu .col-6');
    if (desktopColumn && !desktopColumn.querySelector('[data-team-link]')) {
      var desktopLink = document.createElement('a');
      desktopLink.className = 'dropdown-item d-block';
      desktopLink.href = teamHref;
      desktopLink.setAttribute('data-team-link', '');
      desktopLink.setAttribute('aria-current', 'page');
      desktopLink.innerHTML = 'Leadership &amp; Team<br><span class="label-subtitle d-block">Meet our leadership and board</span>';
      desktopColumn.appendChild(desktopLink);
    }
    appendLink(document.querySelector('#submenu-about ul'), '');

    var footerHeading = Array.prototype.find.call(document.querySelectorAll('#footerSiteLinks p'), function (heading) {
      return heading.textContent.trim() === 'About Us';
    });
    appendLink(footerHeading && footerHeading.nextElementSibling, '');
  }

  function fixBrandLogos() {
    var logoUrl = new URL('assets/images/arc1.png', document.baseURI).href;
    document.querySelectorAll('.brand-logo img, .footer img[src*="arc1.png"]').forEach(function (image) {
      image.src = logoUrl;
      image.removeAttribute('srcset');
    });
  }

  renderTeamPage();
  fixBrandLogos();
  window.addEventListener('load', fixBrandLogos);
})();
