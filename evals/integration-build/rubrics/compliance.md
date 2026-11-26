# Compliance

Truthful language, attribution and the protocol boundary, and legal acknowledgment. Each requirement is judged from user-facing text in the source: labels, tooltips, errors, empty states, notifications and page metadata.

### C1. Earn is named as Earn
Vault deposits are called "Earn" or "DeFi yield". User-facing text does not call them staking, delegation, validators, savings account or investment, and does not place a vault under a staking menu.

### C2. Rates are variable or indicative
Every yield and every variable borrow rate is described as variable or indicative. User-facing text never calls a rate or return guaranteed, risk-free, stable, secure or fixed, except a Midnight fixed borrow rate, which is called fixed.

### C3. Morpho is not a counterparty
User-facing text does not say or imply that Morpho lends, provides a loan, liquidates, seizes collateral, enforces repayment, pays yield or holds funds. Borrowing is described as opening a borrow position against collateral, and liquidation as permissionless or done by third parties.

### C4. Protocol terms, not regulated-finance terms
User-facing text uses vault, market, curator, user and TVL or total deposits. It does not use fund, investment product, asset manager, fund manager, managed, investor, client, assets under management, insured or custody for Morpho products.

### C5. Rewards are token incentives
Where rewards appear, they are described as token incentives from a program and are kept apart from interest. They are not called interest, dividends, bonus yield that is guaranteed, or a payment from Morpho.

### C6. Withdrawals are qualified by liquidity
Any statement about withdrawing or exiting says it depends on available liquidity. The app does not promise instant, anytime or guaranteed withdrawal without that condition.

### C7. Official Powered by Morpho attribution
The app shows Powered by Morpho on the screens where users act on Morpho functionality. It uses the official `powered-by-morpho` web component loaded from `https://brand.morpho.org/snippet.js`, or an official badge asset from the Morpho brand kit. A plain-text line, a redrawn logo or a custom lockup does not pass.

### C8. Interface and protocol stay distinct
The app states that the integrator operates the interface and that the user interacts with Morpho smart contracts. Nothing says or implies that Morpho operates, audits, endorses or guarantees this app. A disclaimer is reachable from the badge or next to it.

### C9. Disclaimer acknowledgment gates the first interaction
Before a user's first signature or transaction, the app shows a notice that names the integrator's Terms of Use and links Morpho's Disclaimer at `https://morpho.org/disclaimers/`, and requires an active acknowledgment that is not preselected. Every path that reaches a signature or transaction is behind this gate, including each product, each management action and reward claims.

### C10. Every intent carries the integration's origin tag
Each initial Actions API request sends a top-level `calldata_origin` that comes from configuration, is a four-byte hex value, and stops the app from starting or sending when it is missing or malformed. A sample or placeholder value hard-coded in source does not pass.
