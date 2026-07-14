# Morpho Disclosures — First-Interaction Acknowledgment

Morpho is an immutable, permissionless, non-custodial protocol; the integrator provides the interface. A distinct acknowledgment moment keeps that line legible for users and regulators, and protects both sides. This is the one Integrator Blueprint item phrased as a requirement rather than a recommendation.

## The requirement

Before or upon an end user's **first interaction** with the Morpho protocol through the product, present a notice they must acknowledge, substantially in this form:

> "Accessing the Morpho Protocol through this app is governed by [Integrator]'s Terms of Use and Morpho's Disclaimer. By using it, you acknowledge that you have read and understood these terms and the risks involved."

Replace `[Integrator]` with the app's name; link "Terms of Use" to the integrator's terms and "Disclaimer" to **https://morpho.org/disclaimers**. No user should be able to deposit, withdraw, or otherwise interact with Morpho through the product before acknowledging.

## Implementation pattern

- **Trigger**: gate the first Morpho-touching action (typically the first tap on Deposit or the entry to the earn flow) — not app signup, where it becomes noise, and not after the transaction, where it's too late.
- **Acknowledgment**: an explicit affirmative action (checkbox + continue, or a dedicated "I understand" button). Pre-checked boxes and auto-dismissing banners don't count as acknowledgment.
- **Persistence**: record the acknowledgment (user id or wallet address, timestamp, notice version) server-side or in app storage so users see it once, and re-show it if the notice text materially changes.
- **Copy discipline**: keep the notice separate from marketing copy. It's a disclosure moment, not a promotional surface.

```tsx
// Sketch: gate the earn entry point
function EarnEntry({ user }) {
  const acknowledged = useDisclosureAck(user); // { version, at } | null
  if (!acknowledged) {
    return (
      <DisclosureGate
        text={NOTICE_TEXT} // the notice above, with links
        onAcknowledge={() => recordAck(user, NOTICE_VERSION)}
      />
    );
  }
  return <EarnFlow user={user} />;
}
```

## What morpho.org/disclaimers says (for support/legal context)

The canonical page (linked, not copied — it gets updated) states among other things that materials are informational only and not financial advice; that the Morpho Association does not control how the protocols are used once deployed and does not act as intermediary or counterparty; that it does not develop, operate, or control third-party interfaces; that interacting with blockchain protocols involves substantial risk borne by the user; and that the protocols are provided "as is" without warranties. Always link the live page rather than pasting its text into the app.
