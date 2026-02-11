# team-builder

## Merge conflict quick fix (for `app.js`)
If GitHub says there are many conflicts in `app.js`, use this order:

1. Open conflict editor for `app.js`.
2. Choose **Accept incoming change** for the conflict chunks that include old duplicated blocks like `// app.js (dummy render only)`.
3. Keep only one clean script body (no `<<<<<<<`, `=======`, `>>>>>>>` markers).
4. Confirm these IDs remain consistent with `index.html`:
   - `undraftedList`, `teamsGrid`, `teamsEmpty`, `pickOrderList`, `statusText`
   - `playerCardTpl`, `teamCardTpl`
   - `playerModal`, `playerModalClose`, `playerModalSave`, `playerModalTitle`, `modalName`, `modalTier`
5. Save and run a syntax check:

```bash
node --check app.js
```

If that passes, conflicts are resolved correctly.
