import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  DemoWalkthroughProvider,
  DemoWalkthroughStudio,
  useDemoStudio,
} from "../src/demo-walkthrough";
import { installDemoBridge } from "../src/demo-walkthrough/bridge";
import { useDemoTarget } from "../src/demo-walkthrough/targets";
import { prepareReplaySnapshot } from "../src/demo-walkthrough/snapshot";
import {
  browserNavigation,
  browserPreferences,
  type StudioAdapter,
} from "../src/demo-walkthrough/adapter";
import type { Workflow, Recording } from "../src/demo-walkthrough/contracts";
const pages = ["welcome", "workspace", "review", "console"];
const workflow: Workflow = {
  id: "document-review",
  version: "1",
  defaultActor: "author",
  title: "Review a document",
  description:
    "Synthetic reference app. Four surfaces and three actor perspectives.",
  nodes: [
    {
      id: "welcome",
      label: "Discover the app",
      surface: "welcome",
      path: "/surface/welcome",
      actor: "author",
      expected: "Welcome visible",
    },
    {
      id: "workspace",
      label: "Prepare document",
      surface: "workspace",
      path: "/surface/workspace",
      actor: "author",
      expected: "Editor visible",
    },
    {
      id: "submit",
      label: "Submit document",
      surface: "workspace",
      path: "",
      actor: "author",
      expected: "Submit enabled",
    },
    {
      id: "submitted",
      label: "Submission received",
      surface: "workspace",
      path: "",
      actor: "author",
      expected: "Submitted visible",
    },
    {
      id: "review",
      label: "Review inbox",
      surface: "review",
      path: "/surface/review",
      actor: "reviewer",
      expected: "Review visible",
    },
    {
      id: "console",
      label: "Manage workspace",
      surface: "console",
      path: "/surface/console",
      actor: "owner",
      expected: "Console visible",
    },
  ],
  edges: [
    ["welcome", "workspace"],
    ["welcome", "review"],
    ["welcome", "console"],
    ["workspace", "submit"],
    ["submit", "submitted"],
    ["workspace", "submitted"],
  ],
  route: ["welcome", "workspace", "submit", "submitted", "review", "console"],
  chapters: [
    { label: "Author", steps: ["welcome", "workspace", "submit", "submitted"] },
    { label: "Review", steps: ["review"] },
    { label: "Owner", steps: ["console"] },
  ],
  branches: [
    { id: "all", label: "Entire walkthrough", steps: [] },
    {
      id: "authoring",
      label: "Prepare and submit",
      steps: ["workspace", "submit", "submitted"],
    },
    {
      id: "reviewing",
      label: "Review and manage",
      steps: ["review", "console"],
    },
  ],
};
const guides = Object.fromEntries(
  workflow.nodes.map((n) => [
    workflow.id + "/" + n.id,
    {
      target:
        n.id === "submit"
          ? "submit"
          : n.id === "submitted"
            ? "status"
            : "heading",
      caption: n.expected,
      action: n.id === "submit" ? ("click" as const) : ("inspect" as const),
    },
  ]),
);
installDemoBridge({
  parentOrigin: location.origin,
  enabled: async () => true,
  guides,
  authorize: (_key, c) => c.sample === "document-demo",
});
const adapter: StudioAdapter = {
  id: "document-demo",
  actors: [
    { id: "author", label: "Author" },
    { id: "reviewer", label: "Reviewer" },
    { id: "owner", label: "Workspace owner" },
  ],
  workflows: [workflow],
  surfaces: pages.map((id) => ({
    id,
    label: id,
    initialPath: "/surface/" + id,
    url: (p) => new URL(p, location.origin).href,
    origins: [location.origin],
  })),
  guide: (w, s) => guides[w + "/" + s],
  navigation: browserNavigation(),
  preferences: browserPreferences("document-demo"),
  store: {
    list: async () =>
      JSON.parse(localStorage.getItem("document-demo:runs") ?? "[]"),
    save: async (r) => {
      const old: Recording[] = JSON.parse(
        localStorage.getItem("document-demo:runs") ?? "[]",
      );
      localStorage.setItem(
        "document-demo:runs",
        JSON.stringify([r, ...old.filter((x) => x.id !== r.id)]),
      );
    },
  },
  plan: (w) => ({
    prepare: async () => ({ sample: "document-demo" }),
    steps: () =>
      w.route.map((id) => {
        const step = w.nodes.find((n) => n.id === id)!;
        return {
          step,
          path: step.path || undefined,
          key: w.id + "/" + id,
          guide: guides[w.id + "/" + id],
        };
      }),
  }),
  prepareSnapshot: (c) => prepareReplaySnapshot(c.html),
};
function Sample() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <main
      style={{
        fontFamily: "system-ui",
        padding: 40,
        background: "#fafafa",
        minHeight: "100vh",
        color: "#15251d",
      }}
    >
      <p>Paperwork · synthetic reference app</p>
      <h1 ref={useDemoTarget("heading")}>
        {location.pathname.split("/").at(-1)}
      </h1>
      <p>Review your document before sharing it with a colleague.</p>
      <textarea
        aria-label="Document"
        defaultValue="Synthetic document for a walkthrough"
        style={{
          display: "block",
          width: "80%",
          height: 160,
          marginBottom: 24,
        }}
      />
      <button
        ref={useDemoTarget("submit")}
        onClick={() => setSubmitted(true)}
        style={{ padding: 14 }}
      >
        Submit for review
      </button>
      {submitted && (
        <p ref={undefined} data-demo-target="status">
          Submitted for review
        </p>
      )}
    </main>
  );
}
function Studio() {
  const controller = useDemoStudio(adapter);
  return (
    <DemoWalkthroughProvider value={controller}>
      <DemoWalkthroughStudio />
    </DemoWalkthroughProvider>
  );
}
createRoot(document.getElementById("root")!).render(
  location.pathname.startsWith("/surface/") ? <Sample /> : <Studio />,
);
