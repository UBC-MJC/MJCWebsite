# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: the recorder at the table.** A club member entering a game round by round on their phone, mid-game, while three other players wait. A wrong or skipped entry feeds everyone's Elo, so when needs conflict, this person's speed and error-proofing win.

Also served:
- Members checking the leaderboard, their own stats, and live games, mostly on phones.
- Prospective members landing on the home page, looking for the club room, Discord, Instagram, and how to start.
- Club execs on the admin pages: managing players and their qualification, chombos, seasons, and check-ins.

The audience is the club first. Events such as the Vancouver Riichi Open 2026 (`/vro2026`, now retired) get an occasional page; the site is not a regional platform.

## Product Purpose

The UBC Mahjong Club's own record of play. Members record games live at the table; the site turns those records into per-season Elo leaderboards, player statistics, and a browsable game history, alongside the club's practical information and study resources.

Success means ranked games get recorded completely and correctly, standings are trusted, and a newcomer can find the club and get started.

## Positioning

The club's source of truth for ranked play: games entered round by round at the table by qualified members, for both Riichi and Hong Kong rules, each with its own seasons, Elo, and leaderboard. Online clients and generic league trackers do not hold this club's sessions, members, or seasons.

## Operating Context

- Play happens in the club room (Room 3206B, The Nest, UBC Vancouver). Recording happens on phones at the table during play.
- Members check in when they arrive. A check-in expires after 4 hours, and recording a ranked game checks its four players in automatically. Admins can reset all check-ins.
- Seasons have a type: `RANKED`, `PLAY_OFF`, `TOURNEY`, or `CASUAL`. Anyone can record a casual game; the other types need a player qualified for that variant (`japaneseQualified` / `hongKongQualified`), set by admins.
- Announcements live on Discord and Instagram; rulesets and the terms and conditions live in Google Docs linked from the site.
- The site is maintained by student volunteers and changes land as small, independently reviewable PRs. `docs/ui-overhaul-plan.md` holds the current redesign sequence.

## Capabilities and Constraints

**Capabilities today:** game creation and round-by-round recording (Riichi and HK), live games, game logs, per-variant leaderboards, Riichi player statistics (no HK stats page yet), check-in, study resources, accounts with password reset, light/dark/system colour mode in Settings, and admin tools.

**Terminology:** "Riichi" (Japanese; `jp` in code) and "Hong Kong" (`hk` in code). Never mix the two variants' records, ratings, or rules. Seats are winds (East, South, West, North). Other terms: Elo, season, qualified, chombo, check-in.

**Constraints:**
- The recording flow must refuse an incomplete round rather than guess. The hand placeholders (`han: -2` for Riichi, `-1` for HK) exist so a round with no hand entered fails validation instead of becoming a silent default win.
- The stack stays as it is: React Router (framework mode), MUI v7 with Emotion, TanStack Query. Design values live in the MUI theme.
- Show only status that real data backs: no hardcoded "active" or "open" claims.
- The UI is English. Chinese is not a priority, though a few study resources link to Chinese editions.

**Open:** whether UBC or AMS rules constrain use of the UBC name and marks. Nothing has been raised so far, but this hasn't been confirmed either way.

## Brand Commitments

- Name: UBC Mahjong Club ("UBC Mahjong" as the short name). Domain: ubc.gg.
- The square MJC logo (`frontend/src/assets/MJC square.png`) is the current mark and nice to keep, but not binding.
- There is no established brand colour, typeface, or written voice. Future work may set them; nothing here preserves them.

## Evidence on Hand

- Real club data: recorded games, seasons, Elo histories, and leaderboards in the production database.
- Club facts on the home page: room location, Instagram (`ubcmahjongclub`), email (`ubcmahjongclub@gmail.com`), Discord invite, terms and conditions.
- Study resources: rulesets, Riichi books, cheat sheets, and WWYD collections (`frontend/src/resources/Resources.tsx`).
- Assets: the MJC logo, `frontend/src/assets/riichiStick.png`, and PWA icons in `frontend/public/`.
- Absent, so don't fabricate them: club photos, testimonials, member counts, press, and credited artwork. The hero illustration on the `ui-overhaul-integration` branch is generated and uncredited.

## Product Principles

1. **The record is the product.** A wrong entry is worse than a slow one. Flows refuse what they cannot verify.
2. **Built for the table.** Design recording for a phone, mid-game, with people waiting. When surfaces compete, the recorder's flow wins.
3. **Two rule sets, kept apart.** Riichi and Hong Kong each get their own seasons, ratings, and vocabulary.
4. **Claims come from data.** Every status, count, or badge on screen is backed by something the system knows.
5. **Club first.** Members and prospective members are the audience; events are occasional additions.

## Accessibility & Inclusion

No formal standard such as WCAG AA has been committed. Known needs: phone-first use at the table, and a working light and dark mode, since members choose either in Settings. The overhaul plan records contrast failures to fix (the 4th-place colour in dark mode, and a light-mode title gradient).
