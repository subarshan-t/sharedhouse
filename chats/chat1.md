# Shared House Expense Tracker

_Started 2026-06-16 13:21 UTC_

---

## User

I am in a shared house along with Sayli, Yash, Midhu , me and Harleen 

Yash and Sayli are a couple 
Suban (me) and Midhu are a couple
Harleen is single 

Need a app to track the expenses 

We get electricity bill
Water bill
Gas bill
And rent 
And internet bill

Sayli and Yash are the primary tenants and they shared it with us 

Harleen pays weekly 250 dollars and me and midhu pay weekly 300 dollars for rent 

Sometimes based on the number of weeks we are at home the bills might be divided differently 

For example, we get the bills every 3 months, me and midhu came to this house 2 months ago and Yash and Sayli went on a trip two months ago and came back 2 weeks back

So based on these the bills needs to be separated differently. Hope you get an idea 

So create me an app which can be used to divide and calaculate how much each owns

Use a light maybe cream colour and white colour template 

This app needs to be similar to Splitwise but this is purely to manage house finances and divide them properly 

And then sometimes we incur common expenses like Yash bought a rat trap for which we all need to chip in individually. 

So create me an app which can be used for all these purposes. 

It needs to be intuitive, every week it should show how much money we owe to Yash and Sayli 

When breaking down the cost it needs to be divided among 5 people

So based on all thsee inputs, creates the UIs

## Assistant

I'll dig into the design system first, then ask a few focused questions about the money logic before building.

_[tool: read_file]_

_[tool: list_files]_

Let me peek at the available icons so I know what's on hand.

_[tool: list_files]_

I have a good handle on the brand. Before I build, the money logic is the heart of this app and I want to get it exactly right — a few focused questions:

_[tool: questions_v2]_

## User

Questions answered:
- rent_amounts: Harleen $250/wk; Suban+Midhu $300/wk TOTAL (couple combined)
- yash_sayli_rent: No — only track what Harleen and Suban+Midhu owe THEM
- bill_split: Equally among 5 people, but adjusted for weeks each person was actually living here
- presence_input: I set move-in / away dates per person and the app figures out the weeks automatically
- common_split: Always equally among all 5 people
- who_fronts: Whoever paid (varies) — track per expense, like Splitwise
- weekly_view: A whole-house dashboard showing every balance at once
- variations: Just build one polished version end-to-end
- scope: Quarterly bill entry + split, Common expense splitting, Settle-up / mark-as-paid tracking, History of past bills & payments, Per-person balance detail pages, Weekly rent tracking
- currency: AUD ($), that's all

## Assistant

Got it — clear model. Let me set up the project and pull in the brand assets I need.

_[tool: update_todos]_

_[tool: copy_files]_

Now the core build. This is a real app, so the computation engine matters most — I'll write the data model + balance/proration logic, then the views.

_[tool: dc_write]_

## Assistant

Now the main build — the computation engine plus all views, as one streaming Design Component.

_[tool: dc_write]_

## Assistant

_[tool: dc_write]_

## Assistant

_[tool: dc_write]_

_[tool: show_html]_

_[tool: show_html]_

The nav renders but the body is blank — likely a logic error. Let me check the console.

_[tool: get_webview_logs]_

_[tool: eval_js]_

Content is there — the screenshot just caught the fade-in at opacity 0. Let me capture it settled, plus the Bills view to confirm the proration math renders.

_[tool: multi_screenshot]_

The DOM is fully populated (22k chars), but the entrance `animation … both` leaves content at opacity 0 during the renderer's re-capture. I'll drop those view-level animations so it displays reliably.

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: show_html]_

Excellent — that's the editorial cream/dark look I wanted. Let me confirm the other views and the proration breakdown render correctly.

_[tool: multi_screenshot]_

The math checks out across the board — electricity $420.50 prorates to $62.87 (Yash/Sayli, 6.4 wks home), $83.82 (Suban/Midhu, 8.6 wks), $127.13 (Harleen, full 13 wks); settle-up nets cleanly to "Suban & Midhu owe $1070.07, Harleen owes $810.05" → the $1880.12 owed to Yash & Sayli. Rent, people, and proration all render correctly. Handing off for verification.

_[tool: update_todos]_

_[tool: ready_for_verification]_

The two errors are the `<link rel="preconnect">` tags being flagged as failed stylesheets. The `@import` in the style block already loads the fonts, so I'll remove the redundant preconnect links.

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Still two. Let me inspect what the assembled file actually loads in `<head>`.

_[tool: eval_js]_

Fonts do render, so the `@import` works for the user — but it logs as a failed stylesheet fetch in the sandbox. Let me load the font via a `<link rel="stylesheet">` in the helmet instead, which the runtime handles cleanly.

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

That's an environment limitation — the verifier's sandbox can't reach the Google Fonts CDN, but the fonts **do** load in a real browser (you can see Playfair Display rendering in every screenshot above). The design system itself loads these exact fonts the same way. I've also set proper fallbacks (Georgia / system-ui / monospace) so it degrades gracefully if the CDN is ever unavailable. This warning is benign and won't appear for you.

The app is done and working. I'll surface it to you now.

_[tool: ready_for_verification]_

**House Ledger** is ready — open in your tab now. A Splitwise-style tracker built purely for your 5-person house, in the cream/white editorial style.

**What it does**
- **Dashboard** — one glance at where everyone stands: who owes Yash & Sayli, the shortest settle-up path, this week's rent, and recent activity.
- **Rent** — weekly grid: Harleen $250, Suban & Midhu $300 (couple), tap any chip to flip paid/due. Outstanding total updates live.
- **Bills** — add electricity/water/gas/internet; each is **split across all 5, weighted by weeks each person was actually home**. Your scenario is pre-loaded, so e.g. the $420.50 electricity bill correctly charges Harleen $127.13 (full 13 wks), Suban/Midhu $83.82 (8.6 wks, moved in 2 months ago), Yash/Sayli $62.87 (6.4 wks, away on the trip). Each bill can also be flipped to a flat equal split (internet is set that way).
- **Shared** — one-off buys like the rat trap, always split 5 equal ways, whoever paid.
- **People** — move-in / time-away dates per person; edit them and every bill split recalculates.
- **History** — settled bills and paid rent, with undo.

Everything persists in your browser, and the accent colour + house name are editable in the Tweaks panel.

**Two things to confirm:**
1. I split the couples' rent **internally** as $150 each (Suban/Midhu) just for per-person balances — settlement still happens couple-to-couple. Tell me if you'd rather see it purely as household lines.
2. I assumed **internet** is flat/equal (not presence-weighted, since the line is always live). Easy to switch to weeks-home if you'd prefer.

The console "font failed to load" note is just the verifier's sandbox blocking the Google Fonts CDN — the fonts load normally in your browser, as you can see above.

