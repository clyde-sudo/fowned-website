/**
 * Runs one of the site's browser scripts (js/*.js) in a Node vm with only the
 * DOM pieces it touches, so a test can see what the script actually sends
 * instead of grepping its source. Elements are plain objects; listeners are
 * recorded so a test can fire them.
 */
import { readFileSync } from "node:fs";
import vm from "node:vm";

export function fakeElement(props = {}) {
  const listeners = {};
  return {
    value: "",
    hidden: false,
    disabled: false,
    textContent: "",
    innerHTML: "",
    attrs: {},
    getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
    setAttribute(k, v) { this.attrs[k] = String(v); },
    addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
    fire(type, ev = {}) {
      for (const fn of listeners[type] || []) fn({ preventDefault() {}, target: this, ...ev });
    },
    querySelector: () => null,
    closest: () => null,
    ...props,
  };
}

export function runScript(file, { elements = {}, hostname = "fowned.live", pathname = "/", globals = {}, source } = {}) {
  const requests = [];
  const appended = [];
  const opened = [];
  const docListeners = {};
  const winListeners = {};
  const document = {
    referrer: "",
    getElementById: (id) => elements[id] || null,
    querySelectorAll: () => [],
    addEventListener(type, fn) { (docListeners[type] ||= []).push(fn); },
    createElement: (tag) => fakeElement({ tagName: tag.toUpperCase() }),
    head: { appendChild(n) { appended.push(n); return n; } },
    body: { appendChild(n) { appended.push(n); return n; } },
  };
  const fetch = (url, init = {}) => {
    requests.push({ url: String(url), init, body: init.body ? safeJson(init.body) : null });
    return Promise.resolve({ ok: true, status: 200, json: async () => ({ ok: true }) });
  };
  const window = {
    location: { hostname, pathname, search: "", protocol: "https:", origin: "https://" + hostname, href: "https://" + hostname + pathname },
    open: (...a) => { opened.push(a); return {}; },
    addEventListener(type, fn) { (winListeners[type] ||= []).push(fn); },
    ...globals,
  };
  const ctx = {
    window, document, fetch,
    location: window.location,
    navigator: {},
    sessionStorage: { getItem: () => null, setItem() {} },
    URL, URLSearchParams, Blob, JSON, Date, console, setTimeout, clearTimeout,
  };
  window.window = window;
  window.document = document;
  window.fetch = fetch;
  vm.createContext(ctx);
  // A global the page itself defines (window.FOWNED, window.gtag) must be
  // visible both as window.X and as bare X, as it is in a browser.
  Object.assign(ctx, globals);
  vm.runInContext(source ?? readFileSync(file, "utf8"), ctx, { filename: file });
  return {
    ctx, window, document, requests, appended, opened,
    fireDocument(type, ev) { for (const fn of docListeners[type] || []) fn(ev); },
    fireWindow(type, ev) { for (const fn of winListeners[type] || []) fn(ev); },
    flush: () => new Promise((r) => setTimeout(r, 0)),
  };
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return s; }
}
