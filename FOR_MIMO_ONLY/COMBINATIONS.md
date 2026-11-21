# Mimo combinations

Generate an actual starter workspace for every subset of JavaScript, HTML, JSX, CSS, React, and React Router (all 64 combinations, including the empty starter):

```sh
node FOR_MIMO_ONLY/generate-combinations.mjs
```

This writes each combination to its own numbered folder under `FOR_MIMO_ONLY/combinations/`. Each folder has the source files for its selected topics plus a README. The generator is deterministic and can be run again to refresh the workspaces.
