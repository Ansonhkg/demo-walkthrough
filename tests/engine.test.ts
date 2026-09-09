import { test } from "node:test";
import assert from "node:assert/strict";
import {
  layout,
  workflowPlayback,
  recordingProgress,
} from "../src/demo-walkthrough/model";
import { runWalkthrough } from "../src/demo-walkthrough/runner";
import { validateRecording } from "../src/demo-walkthrough/validation";
import type { Workflow, Recording } from "../src/demo-walkthrough/contracts";
const workflow: Workflow = {
  id: "documents",
  version: "1",
  title: "Review a document",
  description: "Synthetic test",
  nodes: ["start", "write", "submit", "review", "approve", "archive"].map(
    (id, i) => ({
      id,
      label: id,
      surface: ["public", "desk", "review", "control"][i % 4],
      path: "/" + id,
      expected: id,
      actor: i < 3 ? "author" : "reviewer",
    }),
  ),
  edges: [
    ["start", "write"],
    ["start", "review"],
    ["start", "archive"],
    ["write", "submit"],
    ["review", "approve"],
    ["submit", "archive"],
    ["approve", "archive"],
  ],
  route: ["start", "write", "submit", "review", "approve", "archive"],
  chapters: [
    { label: "Author", steps: ["start", "write", "submit"] },
    { label: "Review", steps: ["review", "approve", "archive"] },
  ],
};
test("multiway and nested DAG with joins rejects cycles", () => {
  assert.equal(layout(workflow).length, 6);
  assert.throws(
    () =>
      layout({ ...workflow, edges: [...workflow.edges, ["archive", "start"]] }),
    /acyclic/,
  );
  assert.throws(
    () => layout({ ...workflow, edges: [["absent", "start"]] }),
    /Unknown/,
  );
});
test("recorder freezes definitions, captions and actual click cues across four surfaces", async () => {
  const saved: Recording[] = [];
  let selected = "";
  const controller = new AbortController();
  const run = await runWalkthrough({
    workflow,
    signal: controller.signal,
    timing: { settle: 0, after: 0, poll: 1 },
    prepare: () => {},
    select: (id) => {
      selected = id;
    },
    save: async (r) => {
      saved.push(structuredClone(r));
    },
    rpc: async (surface, type) =>
      type === "capture"
        ? {
            html: "<p>synthetic</p>",
            url: "https://example.invalid/" + selected,
            heading: selected,
            surface,
          }
        : { ok: true, url: "/" + selected },
    plan: {
      prepare: async () => ({ document: "sample" }),
      steps: () =>
        workflow.nodes.map((step) => ({
          step,
          key: step.id,
          path: step.path,
          guide: {
            caption: "Inspect " + step.id,
            action:
              step.id === "submit" ? ("click" as const) : ("inspect" as const),
          },
        })),
    },
  });
  assert.equal(run.outcome, "passed");
  assert.equal(run.captures.filter((c) => c.click).length, 1);
  assert.equal(run.captures.find((c) => c.click)?.stepId, "submit");
  assert.notEqual(run.definition, workflow);
  assert.equal(run.captures[0].guide?.caption, "Inspect start");
  assert.equal(recordingProgress(run, workflow).complete, true);
  assert.equal(
    recordingProgress({ ...run, outcome: undefined }, workflow).complete,
    false,
  );
  assert.ok(saved.some((r) => r.outcome === "running"));
  const policy = {
    workflows: [workflow],
    origins: () => ["https://example.invalid"],
  };
  assert.equal(validateRecording(run, policy), run);
  assert.throws(
    () =>
      validateRecording(
        {
          ...run,
          captures: [
            { ...run.captures[0], url: "https://unapproved.invalid/" },
          ],
        },
        policy,
      ),
    /Unsupported/,
  );
  const unordered = [
    run.captures[3],
    run.captures[1],
    run.captures[0],
    run.captures[1],
  ];
  assert.deepEqual(
    workflowPlayback(unordered, workflow).map((c) => c.stepId),
    ["start", "write", "write", "review"],
  );
});
test("abort and action failure save failed evidence and never claim completion", async () => {
  for (const stop of [true, false]) {
    const controller = new AbortController();
    const saved: Recording[] = [];
    await assert.rejects(
      runWalkthrough({
        workflow,
        signal: controller.signal,
        timing: { settle: 0, after: 0, poll: 1 },
        prepare: () => {
          if (stop) controller.abort();
        },
        select: () => {},
        save: async (r) => {
          saved.push(structuredClone(r));
        },
        rpc: async (_s, t) =>
          t === "capture"
            ? { html: "", url: "https://example.invalid/", heading: "" }
            : { ok: t !== "perform", error: "Denied" },
        plan: {
          prepare: async () => ({}),
          steps: () => [
            {
              step: workflow.nodes[0],
              guide: { caption: "Submit", action: "click" },
            },
          ],
        },
      }),
    );
    assert.equal(saved.at(-1)?.outcome, "failed");
    assert.ok(!saved.some((r) => r.outcome === "passed"));
  }
});
