# Trust and risk

Exposure transparency, rate and cost honesty, and position risk and safety. Each requirement is judged from what the source renders and how it computes it.

### T1. The vault or market is named throughout
The input, review and position views show the vault's own name or the market's loan and collateral pair, taken from the API. A generic label such as "Earn USDC", or a receipt-token symbol alone, does not pass.

### T2. The curator is named
Earn views name the vault's curator, taken from the API, with a logo or link where the API provides one. Hard-coded curator text does not pass.

### T3. The oracle is shown by address
Borrow views show the market's oracle as its address with a link to it, not only as a type or provider name.

### T4. Liquidity and its limits are shown
Earn views show total deposits and the amount withdrawable now. Borrow views show the liquidity available to borrow. When liquidity limits an amount, the app says how much is available instead of failing silently.

### T5. Every rate has its type and window beside it
Each rate on screen is labelled fixed or variable next to the number. Variable rates also state their averaging window, for example "variable, 6h avg", and a Midnight fixed rate states its maturity. The label follows the window that was actually used.

### T6. Rate components are split and named
A yield that includes rewards shows native yield and rewards as separate figures, with the reward token named. Borrow cost is shown apart from any reward. An integrator fee, if the app charges one, is shown as the integrator's own with gross against net amounts. A single blended figure with no breakdown does not pass.

### T7. LTV is always shown with LLTV
Wherever a borrow position's LTV appears, LLTV appears with it. Health factor or band and the liquidation price are shown on the input, the review and the position view.

### T8. Risk is projected before the user confirms
As the user types or drags, the app shows LTV and liquidation price before and after the action, and shows a warning before confirmation when the result enters the warning or danger band, when liquidity is low, or when a Midnight loan is near maturity.

### T9. Unknown is never shown as zero or safe
A missing price shows the token amount with a dash for USD, not `$0`. Loading states show placeholders, not zeros. A position with no debt shows "No debt", not an infinite health factor. When an input to a safety calculation is missing, the dependent values show as unknown and the actions that need them are disabled.

### T10. Liquidation, maturity and exit costs are stated plainly
Borrow views say that liquidation can happen without notice once LTV reaches LLTV and that debt grows over time. Midnight views show the maturity date or countdown, a matured state, and what can happen to debt unpaid at maturity. Earn exits that carry a penalty show that penalty in token terms before the user signs.
