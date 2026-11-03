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
