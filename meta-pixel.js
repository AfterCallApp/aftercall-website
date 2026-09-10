/* Meta Pixel for AfterCall website
 * Dataset / Pixel ID: 1393918442566153
 * Business: Aftercall App
 */
(function (f, b, e, v, n, t, s) {
  if (f.fbq) return;
  n = f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  t = b.createElement(e);
  t.async = true;
  t.src = v;
  s = b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t, s);
})(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', '1393918442566153');
fbq('track', 'PageView');

// Lightweight intent signals for ads optimization/audiences.
document.addEventListener('click', function (event) {
  var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
  if (!link || !window.fbq) return;

  var href = link.href || '';
  var label = (link.getAttribute('aria-label') || link.textContent || '').trim().slice(0, 100);

  if (/apps\.apple\.com|play\.google\.com/i.test(href)) {
    fbq('track', 'Lead', {
      content_name: 'app_store_click',
      content_category: /apps\.apple\.com/i.test(href) ? 'ios' : 'android'
    });
  } else if (/mailto:/i.test(href)) {
    fbq('trackCustom', 'ContactClick', { label: label });
  } else if (/\/start\b|start\.html/i.test(href)) {
    fbq('trackCustom', 'StartPageClick', { label: label });
  }
});
