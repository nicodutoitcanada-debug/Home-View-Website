# Emergency startup recovery candidate (issue #1)

## Scope and frozen baseline
Based on main commit e2b9ca4dfcd07dfe2eeef19c10bba05e9d55c397 (index blob dc0c3d3003f4677a8e0d808774f8bc0e94150072).
Read issue #1 including its correction; it has no comments at inspection.
The local editor's two-map settings do not identify the uploaded Arcware package. No Unreal assets, Arcware settings, SDK version, FPS settings, backups or other features are changed.

## Evidence and limits
Confirmed in source: e2b9ca4 introduced an automatic load:homeViewDemo command after 3.5 seconds of decoded video without Game:Loaded. It can reload a direct-house package. Its fallback also requires a load command to have been sent, coupling recovery to that unsafe guess. The prior frame check accepts cumulative frameCount>=2 even after playback freezes and permits an absent video track.
Suspected: this can contribute to restart freezes or a loader obscuring an otherwise usable stream. There is no live frame/data-channel capture proving it caused the reported outage.
History checked: 9fbc187 (index blob df5bd56d5aef52fa2b29559ca5dc16b39929312d) retains the original Loaded -> load:homeViewDemo -> HomeViewLevelLoaded sequence and has no rescue. 750eca5 removes the mobile 27 FPS reveal gate. b66ffa7 and fd79e99 change performance-test-12.html, not production index.html. 860ca62 changes performance-test-11.html only. None is represented as a user-verified known-good deployment; that exact version still needs owner confirmation.

## Candidate behavior
- Preserve the original single load request on Game:Loaded, including duplicate-message suppression.
- Preserve explicit LOAD HOME on the existing session.
- Remove the timer's speculative level-load command. With no startup signal and no load pending, sustained live nonblack video may use the existing reveal path after 3.5 seconds; no new session or reload.
- If Game:Loaded was received, continue waiting for HomeViewLevelLoaded; do not automatically reveal a known loading map just because it has video. Explicit SHOW LIVE VIDEO remains available.
- Reject missing/ended/muted tracks, disconnected peers, paused video and stale frame counters. Permit advancing media-time fallback on browsers without frame counters/callbacks. Retain black-frame rejection when canvas readback works; when unavailable, only live progression is evidence.
- Register the response callback immediately after obtaining the existing SDK application, before optional tuning. A message emitted inside the SDK constructor may still be missed.
- All reveal/monitor callbacks retain session-end/teardown guards. SDK configuration and 30 FPS ceiling are unchanged.

A visible frame cannot prove the house map is loaded. For a missed loading-map signal, the fallback may reveal the loading scene; the owner can inspect it and explicitly LOAD HOME. This is preferable to silently reloading an unknown map. A total absence of advancing frames cannot be repaired by this patch.

## Offline validation
Run from repository root:
`node --experimental-vm-modules --test startup-recovery.test.mjs`
The harness parses every executable inline script and executes the actual production startup functions in a mocked DOM with deterministic time, media tracks, counters, pixel samples, peer states and response callbacks. No HTML page, SDK module, credentials or cloud endpoint is loaded; network calls throw.
Candidate: 12/12 pass. Covers both handshakes, duplicate Loaded, late Loaded, missed-ready/live-video, black/no-track/stale frames, browser counter fallback, disconnect, manual end, listener order and 30 FPS/one SDK constructor static checks.
These are mocked/static checks, not a browser/WebRTC test or proof of a playable deployed stream. No paid sessions launched. Existing customization/dashboard/login/saving code is outside the patch and not end-to-end retested.

## Diagnostic decision tree (owner-authorized validation only)
1. Confirm the Arcware deployment's exact package/startup map and UE process health. A local PIE success does not establish packaged success.
2. Check WebRTC peer/ICE connection and attached live video track. Failed/no track indicates package/session/signalling/transport trouble; UI reveal alone cannot fix it.
3. Check framesDecoded or playback counters over time and track state, not a single nonzero count. No advance means stalled delivery/decoder; inspect server render/encode diagnostics.
4. Advancing black frames mean the renderer/package/camera may be blank. Advancing nonblack frames mean usable picture is reaching the browser, but do not prove it is the house.
5. Inspect window.homeViewStartupVideoStatus(): lastGameMessage, loadRequested, picture, hasFrames, uiRevealed. Loaded -> exactly one load request -> HomeViewLevelLoaded is the original workflow. A direct-ready package requires no load request. No signals with advancing video may mean an early missed callback.
6. If usable house video is confirmed but the loader persists, inspect introOverlay, hvsStageRevealCurtain and homeViewUI.is-ready. This is the frontend presentation branch; if frames are absent it is not.

## Three-step owner verification (not performed)
1. Review the draft diff. Before authorizing any deployment/session, identify the exact deployed package and a known-good frontend revision. Do not change Game Default Map based on this PR.
2. Only after explicit approval, deploy the candidate to the intended review target and use ONE authorized session. Confirm the expected handshake and advancing video; verify the house visibly opens and movement works. Do not retry/reconnect/create another session automatically.
3. In that same session check façade/customization menus and screenshot flow; end explicitly. Record startup signals/status and whether the loader was covering real house video. If no frames, investigate the package rather than repeatedly editing reveal logic.

## Rollback
Before merge: close the draft PR; main and live deployment are untouched.
After an explicitly approved merge/deployment: create a new revert commit for the candidate commit and redeploy only with owner approval. Do not reset/force-push main or restore an old whole repository.
The frozen main SHA above is an exact pre-candidate rollback reference, NOT a proven working version. Do not roll back all unrelated features to an older commit. Local Unreal backups and assets are unaffected.
