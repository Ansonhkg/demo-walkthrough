# Demo Walkthrough

An experimental, reusable presentation studio for exploring a product through different actors and journeys. It can cover landing pages, signed-in apps and administration screens in one player.

The shared UI owns actor and workflow selection, playback controls, the timeline, branching DAG, subtitles, cursor animation, click feedback, spotlight and buffered snapshot replay. Your app supplies a provider adapter for its workflows, recordings, permissions and actions.

## Use it in your app

Clone this repository, then copy the versioned module into your project:

```sh
node src/demo-walkthrough/sync.mjs /path/to/app/packages/demo-walkthrough
node src/demo-walkthrough/sync.mjs /path/to/app/packages/demo-walkthrough --check
```

Commit the copied files in your app. There is no npm package, symlink or cross-repository runtime import. The host needs React 19, React DOM, TypeScript and a CSS-capable bundler. This repository's development dependencies are only for validating the source.

```tsx
import {DemoWalkthroughProvider, DemoWalkthroughStudio} from './packages/demo-walkthrough';

export function Demonstrations() {
  const controller = useProductDemoController(); // Implement in your app.
  return <DemoWalkthroughProvider value={controller}>
    <DemoWalkthroughStudio />
  </DemoWalkthroughProvider>;
}
```

See [integration requirements](src/demo-walkthrough/README.md) and the [controller contract](src/demo-walkthrough/contracts.ts). Mount the player outside your app navigation. Keep adapters outside the copied directory.

## Source ownership

This repository is the source of truth. ReleaseFast can showcase and distribute its committed copy, and apps consume their own committed copies. Changes originate here, then the sync command updates consumers. Local modifications are rejected rather than silently overwritten. No other repository is needed to build a consuming app.

## Development

```sh
npm ci
npm run check
```

Source lives in `src/demo-walkthrough`. Run `npm run manifest` after reviewed source changes and bump `version.json` when issuing an update. Check and sync each consumer before declaring it up to date.

## Current scope

This is an experiment, not a finished autonomous recorder SDK. The provider is a low-level controller contract. Apps still implement capture sanitization, actor sessions, storage authorization, permitted actions and outcome checks. Recorded highlights are guidance, not proof that a workflow succeeded. This extraction includes no real-user recordings, credentials or application backend.

[Prior validation and its limits](src/demo-walkthrough/VERIFICATION.md).
