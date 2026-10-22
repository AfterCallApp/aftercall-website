/* Meta Pixel for AfterCall website
 * Dataset / Pixel ID: 1393918442566153
 * Business: Aftercall App
 */
function aftercallMarketingAllowed() {
  if (navigator.globalPrivacyControl === true) return false;
  try {
    return JSON.parse(localStorage.getItem('aftercall_cookie_consent_v1') || '{}').marketing === true;
  } catch (error) {
    return false;
  }
}

function aftercallStartMeta() {
  if (!aftercallMarketingAllowed() || /^\/(ops(?:\/|$)|u(?:\/|$)|teams-dashboard(?:\.html)?\/?$)/.test(window.location.pathname)) return;
  if (window.aftercallMetaStarted) return;
  window.aftercallMetaStarted = true;
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

  window.fbq('consent', 'grant');
  window.fbq('init', '1393918442566153');
  window.fbq('track', 'PageView');
}

function aftercallMetaEvent() {
  if (aftercallMarketingAllowed() && window.aftercallMetaStarted && window.fbq) {
    window.fbq.apply(window, arguments);
  }
}

window.addEventListener('aftercall:consent', function () {
  if (aftercallMarketingAllowed()) aftercallStartMeta();
  else if (window.fbq) window.fbq('consent', 'revoke');
});
aftercallStartMeta();

var AFTERCALL_ATTR_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'gclid'
];

function aftercallGetAttribution() {
  var params = new URLSearchParams(window.location.search || '');
  var current = {};
  AFTERCALL_ATTR_KEYS.forEach(function (key) {
    var value = params.get(key);
    if (value) current[key] = value.slice(0, 180);
  });

  try {
    if (Object.keys(current).length) {
      current.landing_page = window.location.pathname || '/';
      current.captured_at = new Date().toISOString();
      sessionStorage.setItem('aftercall_last_attribution', JSON.stringify(current));
      if (!localStorage.getItem('aftercall_first_attribution')) {
        localStorage.setItem('aftercall_first_attribution', JSON.stringify(current));
      }
      localStorage.setItem('aftercall_last_attribution', JSON.stringify(current));
      return current;
    }

    return JSON.parse(
      sessionStorage.getItem('aftercall_last_attribution') ||
      localStorage.getItem('aftercall_last_attribution') ||
      localStorage.getItem('aftercall_first_attribution') ||
      '{}'
    );
  } catch (e) {
    return current;
  }
}

function aftercallTrackGa(eventName, payload) {
  try {
    if (navigator.globalPrivacyControl === true || JSON.parse(localStorage.getItem('aftercall_cookie_consent_v1') || '{}').analytics !== true) return;
  } catch (error) {
    return;
  }
  payload = payload || {};
  var attribution = aftercallGetAttribution();
  Object.keys(attribution).forEach(function (key) {
    if (payload[key] == null) payload[key] = attribution[key];
  });

  if (window.gtag) {
    window.gtag('event', eventName, payload);
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(Object.assign({ event: eventName }, payload));
}

function aftercallCampaignLabel(attribution) {
  attribution = attribution || aftercallGetAttribution();
  var parts = [
    attribution.utm_source || 'web',
    attribution.utm_medium || 'unknown',
    attribution.utm_campaign || 'uncampaign',
    attribution.utm_content || ''
  ].filter(Boolean);
  return parts.join('_').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 80);
}

function aftercallDecorateStoreUrl(rawUrl, store, attribution) {
  try {
    var url = new URL(rawUrl);
    if (store === 'ios') {
      url.searchParams.set('pt', '128774505');
      url.searchParams.set('mt', '8');
      var campaign = (attribution && (attribution.utm_campaign || attribution.utm_source)) || url.searchParams.get('ct') || 'website';
      url.searchParams.set('ct', campaign.slice(0, 30));
    }
    if (store === 'android') {
      var referrer = new URLSearchParams();
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) {
        if (attribution && attribution[key]) referrer.set(key, attribution[key]);
      });
      if (!referrer.toString()) referrer.set('utm_source', 'aftercall_website');
      if (!referrer.get('utm_medium')) referrer.set('utm_medium', 'web');
      url.searchParams.set('referrer', referrer.toString());
    }
    return url.toString();
  } catch (e) {
    return rawUrl;
  }
}

aftercallGetAttribution();

// Lightweight intent signals for ads optimization/audiences.
document.addEventListener('click', function (event) {
  var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
  if (!link) return;

  var href = link.href || '';
  var label = (link.getAttribute('aria-label') || link.textContent || '').trim().slice(0, 100);
  var attribution = aftercallGetAttribution();

  if (/apps\.apple\.com|play\.google\.com/i.test(href)) {
    var store = /apps\.apple\.com/i.test(href) ? 'ios' : 'android';
    var decoratedHref = aftercallDecorateStoreUrl(href, store, attribution);
    if (decoratedHref !== href) {
      link.href = decoratedHref;
      href = decoratedHref;
    }

    aftercallTrackGa('app_store_click', {
      store: store,
      link_url: href,
      link_text: label,
      content_name: 'app_store_click',
      content_category: store
    });

    aftercallMetaEvent('trackCustom', 'AppStoreClick', {
      content_name: 'app_store_click',
      content_category: store,
      label: label,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_content: attribution.utm_content
    });

    aftercallMetaEvent('track', 'Lead', {
      content_name: 'app_store_click',
      content_category: store
    });
  } else if (/mailto:/i.test(href)) {
    aftercallTrackGa('contact_click', {
      contact_type: 'email',
      link_url: href,
      link_text: label
    });
    aftercallMetaEvent('trackCustom', 'ContactClick', { label: label });
  } else if (/\/start\b|start\.html/i.test(href)) {
    aftercallTrackGa('start_page_click', {
      link_url: href,
      link_text: label
    });
    aftercallMetaEvent('trackCustom', 'StartPageClick', { label: label });
  }
});
