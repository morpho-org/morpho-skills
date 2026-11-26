# API usage

REST API best practice and the Actions API contract. Each requirement is judged from the code that reads data and prepares, verifies and sends transactions.

### A1. Protocol reads come from the REST APIs
Protocol data is read from Morpho's Core REST and Midnight REST routes. The app does not query the Morpho GraphQL API or a subgraph, does not import a `@morpho-org/*` SDK, and does not read protocol state through RPC contract calls. Wallet balances, allowances and receipts may use the wallet or RPC.

### A2. Transactions come from the Actions API, unchanged
Every protocol transaction is prepared by a POST to the Actions API. The app sends each returned call's `to`, `data` and `value` unchanged and in the returned order. It does not build protocol calldata itself. A Merkl reward claim sent to the Merkl Distributor is the one exception.

### A3. The API key stays on the server
The Morpho API key is read from an environment variable on the backend and sent as `x-api-key` only from there. It is not in browser code, not exposed through a public environment prefix such as `NEXT_PUBLIC_` or `VITE_`, not logged and not returned to the client.

### A4. The response proof is verified before anything is shown or sent
For every Actions response, the app verifies the `Morpho-Action-Proof` header before exposing typed data or calls. The check allows only ES256, selects the key by `kid` from `/.well-known/morpho-actions-jwks.json` on the same origin, requires the `typ`, issuer, audience and subject from the Actions documentation, rejects a proof older than 60 seconds, and compares the request and response body hashes and the decision with the exchange. A failed check shows and sends nothing.

### A5. Signature rounds and simulation gating follow the contract
On `signature_required`, the app signs each typed-data request and posts only `continuation` and `signatures` to the same endpoint, for at most three rounds, and does not sign with 60 seconds or less left before `expires_at`. It sends calls only when the status is `prepared` and `simulation.status` is `success`. A failed simulation sends nothing.

### A6. Scope is checked before the wallet acts
Before each signature and each send, the app checks that the response's `chain_id` and every typed-data `domain.chainId` match the selected chain, that the action's `account` is the connected wallet, and that `expires_at` has not passed.

### A7. Amounts are integers in base units
API amounts are parsed as `bigint` and stay integers through every calculation and payload. Decimals come from token metadata, not an assumed 18. Oracle prices use the 1e36 scale and LLTV the 1e18 scale. Floating-point numbers are used only to format values for display.

### A8. Routes, versions, selectors and pagination are correct
Requests use the documented selector formats: `{chain_id}:{address}` or `{chain_id}:{market_id}` for Core REST and Actions, and a bare market ID for Midnight REST. Vault V2 state and APY averages use their `/v1` routes. List reads follow the cursor until it is exhausted before totals or absence are concluded.

### A9. Rates are realized averages over one window
Variable rates come from the APY-average routes with an explicit lookback, six hours by default, not from an instantaneous rate. Reward APR is computed over the same window from Merkl's APR records, not taken from an opportunity's spot APR. A missing value for the chosen window shows as unavailable instead of silently using another window.

### A10. Failures and freshness are handled by meaning
Only HTTP 429 and 503 are retried, with bounded backoff that honours `Retry-After`; wallet transactions are never resent automatically. A 422 for insufficient liquidity is handled with the available amount. An unpriced token is not treated as zero. After a transaction, the app waits until `last_indexed_block` reaches the transaction's block before treating indexed data as current. Action responses are not cached or reused.
