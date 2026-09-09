// Trusted app adapters supply sanitized snapshots with inline CSS/data assets.
// Defense in depth: replay has no scripts, network, forms or navigable links.
export function guidedSnapshot(html: string, selector?: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc
    .querySelectorAll("script,iframe,object,embed,base,meta[http-equiv],link")
    .forEach((n) => n.remove());
  doc.querySelectorAll("*").forEach((el) => {
    for (const a of [...el.attributes])
      if (
        a.name.startsWith("on") ||
        ["srcdoc", "action", "formaction", "href", "target"].includes(a.name)
      )
        el.removeAttribute(a.name);
  });
  doc
    .querySelectorAll("[data-player-focus]")
    .forEach((n) => n.removeAttribute("data-player-focus"));
  if (selector) {
    try {
      doc.querySelector(selector)?.setAttribute("data-player-focus", "true");
    } catch {
      /* Missing/invalid targets receive no invented highlight. */
    }
  }
  const policy = doc.createElement("meta");
  policy.httpEquiv = "Content-Security-Policy";
  policy.content =
    "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; form-action 'none'";
  doc.head.prepend(policy);
  const style = doc.createElement("style");
  style.textContent =
    '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}[style*="--visual-viewport"]{--visual-viewport-height:100dvh!important;--visual-viewport-width:100vw!important}body{top:0!important}';
  doc.head.append(style);
  return doc.documentElement.outerHTML;
}
