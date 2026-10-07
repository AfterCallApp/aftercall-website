/* AfterCall GA4 website analytics
 * Replace GA_MEASUREMENT_ID with the live GA4 web stream Measurement ID (format: G-XXXXXXXXXX).
 * Tracks landing-page attribution automatically via GA4 and sends explicit download-click events
 * for App Store / Google Play CTA clicks.
 */
(function () {
  'use strict';

  var GA_MEASUREMENT_ID = 'G-6XJ9GXS1FT';
  var hasValidMeasurementId = /^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID) && !/REPLACE/i.test(GA_MEASUREMENT_ID);

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };

  if (hasValidMeasurementId) {
    var existingTag = document.querySelector('script[src*="googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID + '"]');

    if (!existingTag) {
      var gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
      document.head.appendChild(gtagScript);

      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: true,
        linker: { domains: ['aftercallapp.com'] }
      });
    }
  }

  function getDownloadPlatform(url) {
    if (!url) return null;
    if (url.indexOf('apps.apple.com') !== -1) return 'ios_app_store';
    if (url.indexOf('play.google.com') !== -1) return 'google_play';
    return null;
  }

  function getSectionLabel(el) {
    var section = el.closest('[id], section, header, footer, main');
    if (!section) return 'unknown';
    if (section.id) return section.id;
    if (section.tagName) return section.tagName.toLowerCase();
    return 'unknown';
  }

  function textFor(el) {
    return (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  }

  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;

    var href = link.href || '';
    var platform = getDownloadPlatform(href);
    if (!platform) return;

    var eventParams = {
      destination_platform: platform,
      link_url: href,
      link_domain: new URL(href, window.location.href).hostname,
      cta_text: textFor(link),
      cta_location: getSectionLabel(link),
      page_location: window.location.href,
      page_path: window.location.pathname,
      transport_type: 'beacon'
    };

    if (window.gtag && hasValidMeasurementId) {
      window.gtag('event', 'app_download_click', eventParams);
    }

    // Lightweight debug hook for QA before the GA ID is installed.
    window.__aftercallLastDownloadClick = eventParams;
  }, true);
})();
