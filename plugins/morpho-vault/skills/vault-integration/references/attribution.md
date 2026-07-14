# Powered by Morpho — Attribution

The badge tells users the app is the interface and Morpho is the protocol. Surface it on the screens where users interact with Morpho functionality: deposit flow, review step, post-deposit view, product-detail screen.

## Web component (preferred)

The official embed, verbatim from https://brand.morpho.org:

```html
<script
  src="https://morpho.org/snippet.v1.js"
  integrity="sha384-o5vctdoI4K119T6AU2kFx3S1utrEqZdzkZwcW39c6p97FLU1fqqG0heM5xLbiYip"
  crossorigin="anonymous"
></script>

<powered-by-morpho
  theme="dark"
  placement="center"
></powered-by-morpho>
```

- `placement`: `center`, `bottom-left`, `bottom-right`, `top-left`, `top-right`.
- `theme`: `dark` is the documented value. Match the badge to the surface — dark badge on dark UI. If you need a light variant, check https://brand.morpho.org for the current attribute value rather than guessing.
- The SRI `integrity` hash is pinned to the current published script. **Verify it against brand.morpho.org at build time** — if Morpho republishes the script, a stale hash makes the browser silently block the badge. If you'd rather not manage SRI rotation, omitting the `integrity` attribute trades that risk for supply-chain trust in morpho.org; say so in code review.

Prefer the web component over static images: it's self-updating and Morpho's brand site only exposes static badge SVGs under build-hashed `/_next/static/` paths that break on every site rebuild — never hardcode those URLs.

## React / SSR note

`<powered-by-morpho>` is a custom element. In React, render it as-is in JSX (React 19 supports custom elements natively; earlier versions pass attributes fine for this element since it only takes strings). For SSR frameworks, load the script client-side (`next/script` with `strategy="afterInteractive"` or equivalent) since the element registers itself in the browser.

## Nearby disclaimer

Make Morpho's short disclaimer reachable from the badge — a link to https://morpho.org/disclaimers next to or behind the badge (tooltip, info icon, or the review-screen fine print). See [disclosures.md](disclosures.md) for the acknowledgment gate, which is a separate, stronger requirement.

## If the badge doesn't fit

If neither the web component nor a static badge works for a surface (native mobile, email, print), don't rebuild or restyle the mark — contact Morpho's integration team so they can extend the asset pack. Custom redraws of the logo are the failure mode here.
