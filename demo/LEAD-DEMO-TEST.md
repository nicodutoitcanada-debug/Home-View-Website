# Home View Solutions — live buyer lead demo checklist

**Status (November 2, 2026):** Dashboard UI, protected Supabase buyer table, Edge Function, and game-to-lead hooks exist. The current build is a **demonstration** with fictional buyer data, not a production buyer intake service. Do not collect real customer contact details until authentication, consent, and abuse protection have been redesigned and tested.

## Connections already committed

- Game: [index.html](index.html) includes buyer login, Save Progress, End Session, and an opt-in SAVE & SHARE ONLINE section.
- Submission code: [hvs-leads.js](hvs-leads.js) includes the public Supabase **Home View Demo** URL, *not* a secret code.
- The Supabase Edge Function `hvs-submit-lead` accepts private demo-code-protected submissions.
- [dashboard.html](dashboard.html) and [dashboard-config.js](dashboard-config.js) use the Home View Demo project. The dashboard requires a separate Supabase **Home View Demo** login (not a CRM user account). The frontend can reuse a prior dashboard login session.
- The existing `hvs_buyer_leads` table has Row Level Security and a published Realtime changefeed.

**Keep the Home View Sales CRM database separate. Do not use CRM Supabase project credentials for this dashboard.**

## One-time testing-device setup (do not paste passwords or codes into GitHub)

1. Open the [live game](https://nicodutoitcanada-debug.github.io/Home-View-Demo-Test/).
2. Open the game login panel, create/sign in to a **fictional buyer** local profile.
3. In the buyer settings, choose **CONFIGURE LIVE LEADS**.
4. The project URL is prefilled. Leave it unchanged. When asked for the **private HVS demo access code**, enter the same value previously stored in the **Home View Demo** Supabase Edge Function secret `HVS_DEMO_ACCESS_CODE`. This configuration lives in this browser's local storage. It needs repeating on each testing phone/browser unless that browser already has it.
5. Enter a fictional buyer name and dummy email/phone. Check **Save this home to the online builder system**.
6. Choose **Please ask the builder to contact me** only when testing the optional Telegram alert. Marketing consent is separate.
7. Click **SAVE & SHARE ONLINE** or **SAVE PROGRESS** and wait for the status text **Saved to Supabase**. If the status says failed, the browser submission has *not* been confirmed.
8. In a second browser tab/device, open the [builder lead dashboard](https://nicodutoitcanada-debug.github.io/Home-View-Demo-Test/dashboard.html). Click **Connect live data** and sign in with the existing **Home View Demo** Supabase dashboard account. Its public URL and publishable key are prefilled. The new fictional lead should appear with selections and CAD prices.
9. Change a finish in the game, press **SAVE PROGRESS** again, and confirm the same buyer updates. Then use **END SESSION** and verify the lead remains; saving and ending should not create duplicate contact notifications for unchanged selections.
10. For a Telegram phone alert, a sales contact request must be checked **and** the Edge Function must have both `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` secrets configured. The bot must have received **Start** from the intended Telegram chat. Otherwise the database save can still succeed, but the notification will say "Telegram is not configured yet."

## Important caveats

- **Save Progress** always saves the buyer's local profile even if online saving is not enabled. A successful local save is not evidence of an online save.
- **End Session** queues the online request without awaiting it so the Arcware stream can shut down quickly. For the first demonstration, test SAVE & SHARE ONLINE while the session is active, and check **Saved to Supabase** before ending the session. End Session is intended as a best-effort repeat submission, not the sole guaranteed persistence step.
- The private demo code is not embedded in GitHub. Never publish that code, a Telegram bot token, or a Supabase service-role key. Shared-code intake is demonstration-only.
- Telegram setup remains separate from database saving. The dashboard already provides on-screen lead updates with Realtime plus a periodic refresh.
- A game streaming problem and a failed lead submission are separate issues; test the lead flow only once streaming itself is stable.
- Both desktop and mobile streaming must remain capped at **30 FPS**. No streaming settings were modified for this lead-generator work.


## Branded Home View phone app — November 3, 2026

The live dashboard now includes `dashboard.webmanifest`, `dashboard-sw.js`,
and `dashboard-push.js`. Existing `logo_2.png` is the temporary Home Screen
app icon and notification icon. It can be replaced by a custom square,
opaque PNG icon designed for Home View.

**Setup once on each authorized phone (no Telegram required):**

1. In Safari on iOS 16.4+, open the [live Builder Dashboard](https://nicodutoitcanada-debug.github.io/Home-View-Demo-Test/dashboard.html).
2. Tap Share → Add to Home Screen. Open the new Home View app from the Home Screen.
3. Log into **Home View Demo** Supabase dashboard account, not the separate CRM or game account.
4. Tap **Enable phone alerts** and allow notifications when iOS asks.
5. Tap **Send test alert**. The notification should show the Home View branding, and tapping it opens the dashboard.
6. Each additional recipient (such as Marie) needs their own Supabase Auth user, permission to read leads, and a row in `hvs_push_admins` before they can enable notifications.

**Live demonstration:** With online saving opted in, a fictional buyer's
SAVE & SHARE ONLINE or SAVE PROGRESS writes to Supabase; then
`hvs-push-deliver` notifies subscribed dashboard devices. Contact request
is indicated in the alert and the buyer's dashboard profile. Identical
saved configurations are deduplicated, so SAVE followed by END SESSION
should not spam the phone. For the first test, wait for “Saved to Supabase”
before ending the Arcware session.

**Server:** `hvs-push-subscribe` checks a signed-in dashboard user against
`hvs_push_admins`, creates the VAPID key pair on first registration,
and stores subscriptions and private signing keys in RLS-protected
server-only Supabase tables. `hvs-push-deliver` is called after the existing
`hvs-submit-lead` receiver confirms the lead was saved.
Neither Telegram tokens nor private signing keys are in public GitHub files.

This is still a **fictional-buyer demonstration**, not production-grade intake.
Web Push does not have per-message fees, but service usage is subject to
GitHub Pages and Supabase free-tier limits.

## Save-first session control — November 3, 2026

The original **END SESSION** button at the top of the game is now **SAVE**.
This uses the existing animated confirmation popup and keeps the original
Arcware session termination and error-reconnect logic.

- **Signed in:** SAVE persists the current design locally and submits it to
  Supabase; only after the response confirms online saving does the popup offer
  **END SESSION** or **KEEP EXPLORING**.
- **Not signed in:** SAVE asks the player to **LOG IN / CREATE** or **END WITHOUT
  SAVING**. The existing login/registration flows are retained. Guest selections
  are carried into the account when logging in via Save, and Save resumes after
  accepted login or account creation.
- **Online error or missing device code:** The popup says **ONLINE SAVE NOT
  CONFIRMED**, shows the error, and offers **RETRY SAVE** or **END WITHOUT ONLINE
  SAVE**; its close button returns to the running game.
- SAVE explicitly opts into the fictional-design submission. Ordinary saves do
  not require contact details, but a checked callback request requires email or
  phone. The marketing-consent choice is untouched.
- Existing End Session shutdown still sets `homeViewSessionIntentional`, disables
  SDK reconnect methods, sends `{end:'session'}`, and detaches the stream. The
  explicit new popup End choice skips a *second* online save if already confirmed
  (or deliberately declined) and resets the buyer's per-session lead ID. All
  pre-existing inactivity, startup-failure, and unexpected-disconnect paths
  retain their behavior.
- Network waits are bounded (12 seconds for saving, 6.5 seconds for optional
  phone push), so a stalled connection cannot keep the save popup busy forever.
- **Not verified in paid Arcware streaming yet.** JavaScript syntax was checked;
  perform the full save → dashboard → push → End Session walkthrough before
  presenting it to a builder.


## Buyer design restoration: separate file and branded loading cover (Nov 3, 2026)

The **restoration logic** now lives in `hvs-design-restore.js`, alongside
`index.html`. Keep both files next to each other in the local VS Code
frontend folder. The page includes a single
`<script src="hvs-design-restore.js" defer></script>` reference.

**Buyer data is not in index.html and not in the JS file.**
Existing buyer accounts and complete design profiles (finish values, property
choice, first-floor layout, cost overrides and budget) are saved in the browser
`localStorage` under `homeview_demo_accounts_cost_v1`. A confirmed online
SAVE also records the design snapshot and prices in Supabase. Replacing
`index.html` or `hvs-design-restore.js` does not erase browser storage for the
same domain and browser. However, `localhost`, the GitHub `github.io`
address, and `www.homeviewsolutions.com` each have **different** browser
storage. Do not expect prototype logins to transfer between those addresses.
Do not clear local browser data when testing a returning buyer.

**On successful login or account creation:**

1. The login closes as the existing session displays a new full-screen cover
   with the existing `LOADING_BG.mp4` and `loading intro.json`.
2. The frontend calculator and budget read the saved local buyer profile.
3. The saved Property One/Two choice, lounge/bedroom layout, and all known
   Level Variant finish keys are replayed to Unreal's existing UIInteraction
   receivers, **without** calling Arcware connect or reconnect. Commands wait
   for the first confirmed-ready streaming session.
4. The cover remains for **at least three seconds**, or longer while variant
   commands are sent. The MP4 fades first, followed by Lottie/text/cover.
   If Unreal rejects a send, the cover offers RETRY RESTORE and CONTINUE,
   rather than silently claiming the restore succeeded.
5. When a buyer started the flow with SAVE, the existing online-save confirmation
   is offered after the restoration completes.

**Unreal contract:** The game must continue accepting the existing
`{property:'one'|'two'}`, `{layout:'lounge'|'bedroom'}`, and
`{[finishKey]: finishValue}` messages. This frontend can confirm messages
entered the streaming transport, **not** that Unreal Level Variant Manager
finished executing them. Test in Unreal before any paid client presentation.
Do not introduce a new automatic Arcware session or change the 30 FPS cap.

**Cloud restore limitation:** The Supabase dashboard *stores* online buyer
configurations but the game's buyer accounts are still browser-local.
There is no secure cross-device buyer-authenticated readback flow yet. It
requires a separate authenticated API and server-side identity mapping
before real customers can resume on another device.

**When replacing index.html:** retain the one-line script inclusion and
the `hvsBeginSavedHomeRestore(...)` login bridge; otherwise the standalone JS
cannot be invoked. Keeping the persistence *data* in browser storage still
protects it from GitHub file replacements.

## Buyer authentication — November 3, 2026 (supersedes all demo-code instructions above)

**No shared browser access code.** Users select **BUYER LOGIN** and sign in with
their email address and password. New users enter a name, email and password
and confirm their email if Supabase requests it. The existing **ADMIN LOGIN**
tab remains a separate, local-only demonstration interface; admin credentials
do **not** substitute for buyer credentials when sending online saves.

- `hvs-buyer-auth.js` is the standalone frontend Supabase Auth REST client.
  `dashboard-config.js` contains ONLY the public project URL and publishable key.
  Do not put secret keys in GitHub or ask buyers for technical codes.
- `hvs-leads.js` submits confirmed saves using the buyer's Bearer token.
- Edge Function `hvs-submit-lead` validates the token with
  `supabase.auth.getUser(jwt)`; it writes `buyer_user_id` and prevents
  overwriting another buyer's lead. The `hvs-push-deliver` function checks
  token ownership of the saved lead before sending a branded push.
- RLS `hvs_buyer_self_read` limits buyer cloud retrieval to their own
  `buyer_user_id`. The existing builder dashboard owner policy remains.
- On sign-in, the game reads the latest saved profile from Supabase and
  restores it through `hvs-design-restore.js`. The local browser cache
  remains a convenience only. A customized unsaved guest session takes
  precedence when the buyer selected SAVE and then signed in.
- Original browser-only usernames/passwords have **not** been migrated into
  Supabase Auth; buyers must register a standard email account once.
- For email confirmations and password reset links, set **Authentication →
  URL Configuration → Site URL** in the HVS Supabase project to
  `https://www.homeviewsolutions.com/`; add this URL to allowed redirect
  URLs as necessary. This is a one-time HVS project setting, not a buyer
  requirement. This app currently does not trigger Arcware while visiting
  the main website.
- The HVS Supabase project is `jythgvjtulxivwmlicvi`, **not** the separate
  Sales CRM Supabase project. Never change the CRM project's auth settings
  for this buyer flow.

**Verification status:** JS parsed successfully and GitHub files were
committed; Supabase functions and RLS checked. A real email signup,
authenticated SAVE, dashboard view and mobile push should still be tested
with a buyer account before production. Free-tier built-in email sending
has provider rate/recipient restrictions and may need proper transactional
email for wider public deployment.
