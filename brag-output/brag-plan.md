# /brag plan: Explain My Code

## Answers
- **What it is:** a free web studio. You paste code in any language and it's explained in Simple English: a summary, a line-by-line breakdown, the logic, bugs with fixes, concepts and expected output.
- **Who it's for:** beginners, and anyone looking at code they didn't write.
- **What sets it apart:** zero jargon (the prompt says "explain it to a 10-year-old"), a bug scanner that suggests a fix, no login, no code retained, and an offline fallback engine.
- **Funniest real line:** the line-by-line output for `print(f"Result: {result}")`: *"Attempts to print the result, but this line will never be reached due to the preceding crash."*
- **Visual hook:** the site's own headline starts as code glyphs and resolves into "Understand Any Code in **Simple English**".
- **Real UI shown:** the landing hero with the live GradientWaves WebGL shader, then the workspace flow. Pick the "Division Bug" preset, click Explain This Code, see the loading state, the results, the Line by Line tab and the Bugs tab. Every UI frame is a DOM snapshot of the running app (`next start`), animated as a pure function of time.
- **Tone:** `default`: punchy, playful, clean, with soft transitions.
- **Share caption:** "Paste any code, get it back in Simple English, including the bug that's about to crash it."

## Angle
Code is noise until someone translates it. The headline decodes from code glyphs into English. The camera then pulls back to reveal the real site, and the product does its job on a real crashing snippet.

## Hook
0–3s: the real `<h1>` alone on the site's `#0c0418` background. Its characters scramble in as code glyphs (`{}()=>;/`) and resolve left to right into "Understand Any Code in Simple English", with the real cyan→violet→pink gradient on "Simple English". The music is minor and filtered (confusion).

## Highlights
1. **It's a real site** (pull-back at the drop): the waves bloom and the chip, copy, buttons, metrics and nav with the logo stagger in.
2. **Paste any code. Hit Explain.** The cursor picks "⚠️ Python: Division Bug", clicks Explain This Code, the real loading state shows, then the results.
3. **Every line, in Simple English.** The Line by Line rows reveal, and row 5's "this line will never be reached" is highlighted.
4. **Finds the bug. Hands you the fix.** The Bugs tab shows the ERROR / Line 3 card and its Proposed Solution.

## Punchline / outro
Logo, **Explain My Code**, "Free forever tier. No login required." (real CTA copy), and an `explainmycode.dev` pill. The music resolves ii → V → I into F major.

## Visual identity
- Background `#0c0418` plus the GradientWaves shader (horizon `#5227FF`, waves `#FF9FFC`, crest `#FFFFFF`).
- Gradient `#38bdf8 → #a78bfa → #f472b6`.
- Inter (sans) and Geist Mono (code). White `btn-primary` with a cyan glow. Neon `{◆}` logo.

## Storyboard (30 fps, 160 BPM half-time, beat = 0.375 s, total 22.5 s)
| # | Time | Scene | Notes |
|---|---|---|---|
| 1 | 0.00–3.00 | Hook: headline decodes | Chars appear 0–0.5 s and resolve by 1.1 s; slow push-in. Dm9 → Bbmaj7 intro with a riser. |
| 2 | 3.00–5.80 | Reveal: pull back to the landing hero | Drop on F at 3.0 s; waves bloom; elements stagger in. Cursor enters at 4.9 s and clicks "Launch Studio Free" at 5.625 s. |
| 3 | 5.80–9.75 | Workspace: preset → Explain → results | Window rises over the dimmed waves. Clicks at 6.75 s and 7.875 s, loading, results at 8.625 s. Caption "Paste any code. Hit Explain." |
| 4 | 9.75–14.625 | Line by Line | Tab click; rows reveal; zoom; row 5 highlight at 11.25 s. Caption "Every line, in Simple English." |
| 5 | 14.625–17.70 | Bugs | Tab click; zoom on the bug card; ERROR glow at 15.0 s; fix glow at 15.75 s. Caption "Finds the bug. Hands you the fix." |
| 6 | 17.70–22.50 | Outro | Window drops away; logo, name, tagline and URL stagger in from 18.0 s; hold. Gm7 → C → Fmaj9 resolution. |

Sum: 3.0 + 2.8 + 3.95 + 4.875 + 3.075 + 4.8 = 22.5 s.
