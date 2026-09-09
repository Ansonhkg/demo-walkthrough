# Demo walkthrough

The standalone demo-walkthrough repository owns the canonical source. ReleaseFast and individual apps keep versioned copies. Consumers copy these files into their repositories; there are no symlinks, cross-repository imports, package registry or runtime dependencies beyond the host's React/React DOM. Version 0.2.1 moves ownership to the standalone repository without changing the Studio runtime.

```sh
node src/demo-walkthrough/sync.mjs /path/to/app/packages/demo-walkthrough
# Update a previously versioned copy; refuses local edits before writing:
node src/demo-walkthrough/sync.mjs /path/to/app/packages/demo-walkthrough
# Confirm the consumer matches the canonical source:
node src/demo-walkthrough/sync.mjs /path/to/app/packages/demo-walkthrough --check
```

## Provider integration

```tsx
import {DemoWalkthroughProvider, DemoWalkthroughStudio} from './demo-walkthrough';
function Demonstrations(){
  const controller = useProductDemoController();
  return <DemoWalkthroughProvider value={controller}>
    <DemoWalkthroughStudio />
  </DemoWalkthroughProvider>;
}
```

`contracts.ts` defines the controller port. This advanced integration supplies React state/setters, actors, journeys, named surfaces, chapters, branches, recording operations, frame URLs and capture preparation. The Studio owns the control placement, timeline, DAG, cursor, click pulse, spotlight, buffered iframe replay, subtitle placement and handoff UI. The controller owns authentication, storage, fixture creation, supported actions and outcome checks. It must keep its controller hook identity stable, stop timers on unmount and update loaded recordings after a run. This is a low-level controller contract, not yet a one-function recorder SDK.

Mount the Studio as the outer page, outside product navigation. Run it on any host route with the required app-origin permissions. Existing projects can supply selector-based target recipes. New controls may use `const target=useDemoTarget('post.publish')` with `<button ref={target}>Publish</button>`. Target IDs survive text/theme changes. `measureDemoTarget`, `observeDemoTarget` and `framePoint` provide coordinate hooks; keep frame origin/source/nonce and action allowlist validation in the app bridge. The framework never authorizes an action on behalf of an app.

`prepareSnapshot(capture)` must return sanitized, script-free HTML with a restrictive CSP and inline styles. It can mark the exact target `data-player-focus`. The bundled ReplayFrame keeps the previous document painted until the new one is ready, measures the displayed target and renders an external 50% mask. Only trusted app-owned capture pipelines are supported. Strip secrets before saving; permit asset origins explicitly; never allow script execution in replay. A highlight is guidance, not evidence of action completion.

React 19, TypeScript with DOM support and a CSS-capable bundler are required. Controls/icons are owned source; HeroUI is not required. Consumers should not modify framework files to customize journeys. Keep adapters outside this folder; review updates against version.json.
