// GA4 anonymizes IP addresses automatically — the legacy anonymize_ip flag is
// silently ignored by gtag.js and intentionally omitted. client_storage: 'none'
// suppresses the _ga cookie; the other two flags disable Google Signals and
// ad-personalization features.
window.dataLayer = window.dataLayer || [];
window.gtag = function gtag() {
  window.dataLayer.push(arguments);
};

window.gtag("js", new Date());
window.gtag("config", "G-BV6VFZR2YM", {
  client_storage: "none",
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
});
