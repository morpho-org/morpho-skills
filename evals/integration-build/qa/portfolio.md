# QA requirements: Portfolio

Taken from the acceptance lines and rules of Flow C (Portfolio) and the global rules in the integration brief. Each is checked against the source.

### C1-1. Totals equal the sum of the visible rows
Each total in the header is computed from the same row values the lists display.

### C1-2. Every chain appears without a chain picker
Positions are read across all supported chains for each product, and every page of each list is followed, so a position appears without the user choosing a chain.

### C1-3. All four products are listed
The view reads Vault V2 and Vault V1 positions for Earn, and Morpho Blue and Morpho Midnight positions for Borrow.

### C1-4. The attention strip matches the health bands
The strip lists positions in the warning, danger or liquidated bands using the same thresholds as the band colours in the Borrow list, plus Midnight loans within 7 days of maturity.

### C1-5. An empty wallet gets one empty state
A wallet with no positions shows a single empty state with links to the Earn and Borrow entry screens. It is distinct from loading and from a failed read.

### C1-6. Unpriced positions are excluded from totals and counted
A position whose token has no price is shown in token units, is left out of the USD totals, and the header says how many positions the totals exclude.

### C1-7. Rows render before totals
Rows render as their own data arrives. Totals show placeholders until every row has a USD value or is marked as excluded.

### C1-8. Net worth uses the stated formula
Net worth is total earning plus total collateral minus total borrowed plus claimable rewards, with Blue debt at its current value and Midnight debt at face value.

### C1-9. Blended rates are weighted
Blended net APY is weighted by balance and uses one averaging window for every vault. The blended borrow rate is weighted by debt, with Midnight at its fixed effective rate.

### C1-10. Earned to date combines interest and rewards
Earned to date is interest from the performance data plus rewards as cumulative amount plus pending.

### C1-11. Prices are fetched once per token and rates lazily
Token prices are requested once per distinct token across positions. Per-row rate and performance reads are made after the lists render.

### C1-12. Each row opens its detail
Each Earn and Borrow row opens a detail view of that position.

### GL-1. Every number has a unit and every rate a type
Amounts carry their token or currency. Rates carry their type and window, such as "variable, 6h avg" or "fixed until {date}".

### GL-2. Loading and unknown are distinct from zero
Loading values show placeholders, and unknown values show a dash. Neither shows as zero.
