(function () {
  'use strict';

  function addArcImages() {
    document.querySelectorAll('.brand-logo').forEach(function (logo) {
      var image = logo.querySelector('img.ymc-wordmark');
      if (!image) {
        image = document.createElement('img');
        image.className = 'ymc-wordmark';
        image.alt = 'YMC';
        image.width = 181;
        image.height = 60;
        logo.insertBefore(image, logo.firstChild);
      }
      image.src = '/assets/images/arc1.png';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addArcImages);
  } else {
    addArcImages();
  }
}());
