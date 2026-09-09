import { test } from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { prepareReplaySnapshot } from "../src/demo-walkthrough/snapshot";
import { framePoint } from "../src/demo-walkthrough/targets";
import { connectFrame, protocol } from "../src/demo-walkthrough/transport";
test("replay preserves exact target while stripping executable content and navigable links", () => {
  const win = new Window();
  Object.assign(globalThis, { DOMParser: win.DOMParser });
  const html = prepareReplaySnapshot(
    '<html><head><script>bad()</script></head><body><button data-player-focus onclick="bad()">Approve</button><a href="https://example.invalid">link</a><iframe src="https://example.invalid"></iframe></body></html>',
  );
  const doc = new win.DOMParser().parseFromString(html, "text/html");
  assert.equal(doc.querySelector("script,iframe,[onclick],[href]"), null);
  assert.equal(
    doc.querySelector("[data-player-focus]")?.textContent,
    "Approve",
  );
  assert.match(doc.querySelector("meta")!.content, /default-src 'none'/);
});
test("coordinate conversion accounts for iframe scaling", () => {
  const frame = {
    getBoundingClientRect: () => ({ x: 100, y: 50, width: 500, height: 300 }),
  } as HTMLIFrameElement;
  assert.deepEqual(
    framePoint(frame, { x: 400, y: 200 }, { width: 1000, height: 600 }),
    { x: 300, y: 150 },
  );
});
test("transport ignores wrong source, origin and nonce; cancellation rejects", async () => {
  const win = new Window();
  Object.assign(globalThis, { window: win });
  let request: any;
  const child = {
    postMessage: (m: any) => {
      request = m;
    },
  };
  const frame = { contentWindow: child } as unknown as HTMLIFrameElement;
  const abort = new AbortController();
  const result = connectFrame(
    {
      frame,
      origin: "https://example.invalid",
      nonce: "correct",
      signal: abort.signal,
      timeout: 1000,
    },
    "capture",
  );
  const send = (source: any, origin: string, nonce: string) =>
    win.dispatchEvent(
      new win.MessageEvent("message", {
        source,
        origin,
        data: {
          protocol,
          type: "captured",
          nonce,
          requestId: request.requestId,
          html: "synthetic",
        },
      }),
    );
  send(child, "https://wrong.invalid", "correct");
  send({}, "https://example.invalid", "correct");
  send(child, "https://example.invalid", "wrong");
  let settled = false;
  result.then(
    () => {
      settled = true;
    },
    () => {},
  );
  await Promise.resolve();
  assert.equal(settled, false);
  send(child, "https://example.invalid", "correct");
  assert.equal((await result).html, "synthetic");
  const pending = connectFrame(
    {
      frame,
      origin: "https://example.invalid",
      nonce: "correct",
      signal: abort.signal,
    },
    "capture",
  );
  abort.abort();
  await assert.rejects(pending, /stopped/);
});
