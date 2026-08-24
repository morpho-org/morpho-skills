# Morpho Glossary

A reference for the terms you will encounter across the Morpho protocols, apps, and ecosystem. Definitions are written for users; technical specifics live in the developer docs. Use these definitions verbatim where possible — they are worded to keep the legal and technical reality intact (what is custodied by whom, what is guaranteed, what a role actually controls).

## Morpho: the entities and the protocols

Several distinct things share the "Morpho" name. They are not interchangeable.

- **Morpho protocols** — The permissionless lending and borrowing infrastructure deployed onchain. The protocols are noncustodial: users interact directly with smart contracts and retain control of their assets, subject to protocol-defined mechanics.
- **Morpho DAO** — The decentralized organization composed of MORPHO governance token holders. The DAO votes on proposals affecting protocol parameters, treasury allocations, and other governance matters.
- **Morpho Association** — The French nonprofit entity supporting the DAO and stewarding the protocols.
- **Morpho Labs** — The US entity contributing to the development of the protocols and ecosystem.
- **MORPHO Token** — The governance token. Holding MORPHO grants participation rights in onchain governance. It does not represent equity in any legal entity and does not confer ownership rights over Morpho Labs, the Morpho Association, or the protocols themselves.
- **Morpho App** — `app.morpho.org`. One interface to the protocols, maintained by the Morpho Association. The protocols are permissionless, so other interfaces exist and may be built by anyone.
- **Morpho Curator App** — `curator.morpho.org`. An interface for curators to configure and operate vaults.

## Core protocol concepts

- **Morpho Markets** — Isolated, permissionless lending markets. Each market pairs one loan asset with one collateral asset, plus its own oracle, interest rate model, and liquidation parameters. Anyone can create a market; risk is contained to that market. Two market types exist:
  - **Variable Rate Markets** (Blue): interest rates float based on utilization.
  - **Fixed Rate Markets** (Midnight): fixed-term, fixed-rate borrowing and lending.
- **Morpho Vaults** — Smart contracts that allocate deposited assets across one or more Morpho Markets according to parameters configured by a curator. Depositors receive receipt tokens representing a proportional claim on the vault's assets. Yield is variable and originates from interest paid by borrowers in the underlying markets. Vaults are autonomous smart contracts. They are not regulated investment vehicles, and the Morpho Association does not custody, manage, or guarantee returns on assets deposited in them.
- **Receipt tokens (ERC-4626)** — Smart contract issued accounting units representing a proportional claim on the assets of a vault. When you deposit into a vault, you receive receipt tokens; when you withdraw, you redeem them.
- **Adapter** — A smart contract connecting a Vault V2 to an external protocol from which it may earn returns.
- **Public Allocator** — A smart contract that routes a vault's liquidity between markets on demand, within constraints set by the curator.
- **Bundlers** — Smart contracts that combine multiple onchain actions into a single atomic transaction (e.g., approve + deposit + borrow).
- **Multicall** — A function that executes multiple contract calls in a single transaction.
- **Flash Loans** — Uncollateralized loans that must be borrowed and repaid within the same transaction.

## Roles in a Vault

A vault has several onchain roles. None of them have custody of, or ownership over, depositors' assets.

- **Owner** — Holds the administrative authority to assign and change the other vault roles. The Owner does not control deposited assets or set risk parameters directly. One address per vault.
- **Curator** — The independent actor that configures the vault's risk parameters and allocation rules, which markets the vault can use, and within what limits. One address per vault. Curators are not employees or agents of Morpho; they operate independently.
- **Allocator** — Executes liquidity movements within the constraints the Curator has set. Allocators can route idle assets to enabled markets and pull them back to the vault. Multiple addresses can hold this role.
- **Sentinel (Guardian)** — A vault role with limited, predefined authority to trigger protective functions, for example, pausing certain actions in an emergency. Acts as a check on the Curator. Multiple addresses can hold this role.
- **Liquidator** — Any third party that calls the liquidation function on an undercollateralized borrow position. Liquidators repay part of the debt and receive a corresponding amount of collateral plus a bonus, according to the market's predefined rules. The role is permissionless: anyone can act as a liquidator.

## User actions

- **Borrow** — Open a borrow position by posting collateral in a Morpho Market.
- **Earn** — Deposit assets into a Morpho Vault to earn yield generated by borrowers in the underlying markets.
- **Reallocate** — A function allowing an Allocator to move vault assets between different markets, within the Curator's constraints.

## Risk and pricing

- **Health Factor** — A metric expressing how close a borrow position is to liquidation. Below 1.0, the position is eligible for liquidation.
- **LLTV (Liquidation Loan-to-Value)** — The maximum borrowing ratio a position can reach before becoming eligible for liquidation. Set per market.
- **LIF (Liquidation Incentive Factor)** — The bonus a liquidator receives for repaying an undercollateralized position. Set per market.
- **Liquidation** — An automated, protocol-defined mechanism through which a third party may repay part of an undercollateralized borrow position in exchange for a corresponding amount of collateral. Anyone can call the liquidation function; eligibility is determined entirely by onchain state and the market's rules.
- **Bad Debt** — The unrepayable portion of a loan, given current debt, collateral, and prices.
- **Oracle** — A third-party service providing price data used to value collateral and determine position health. Each market specifies its own oracle. The Morpho Association does not select oracles or take responsibility for their behavior.
- **IRM (Interest Rate Model)** — A contract that determines how interest rates respond to market conditions (typically utilization).
- **Slippage** — The difference between the expected price of a transaction and the price at which it actually executes.

## Vault internals

- **Supply Queue** — The order in which a vault deposits new funds across its enabled markets.
- **Withdraw Queue** — The order in which a vault pulls funds back from its markets when users withdraw.
- **Flow Caps** — Limits on how much liquidity can move in or out of a market via the Public Allocator.
- **Timelock** — A mandatory waiting period before sensitive administrative actions take effect, providing time for users to react.

## Yield, APY, and rewards

- **Yield** — The variable return that may accrue to users supplying assets to a Vault or Market. Yield is generated primarily from interest paid by borrowers in the underlying markets and varies with market conditions.
- **APY (Annual Percentage Yield)** — An annualized expression of the rate at which yield may accrue, based on current conditions. APY figures are indicative and change as conditions change.
- **Rewards** — Token-based incentives that may be distributed to participants according to the rules of a specific program. Rewards are not guaranteed, are not interest, and are not paid by the Morpho Association. Receiving rewards does not create equity, governance, or profit-participation rights unless a program explicitly specifies otherwise.
- **Merkl** — The system currently used for offchain computation and distribution of user rewards across Morpho programs.

## Protocol metrics

- **TVL (Total Value Locked)** — The aggregate value of digital assets held in a given set of Morpho smart contracts at a point in time. TVL is a descriptive onchain metric. It does not represent assets owned, managed, or custodied by the Morpho Association.
- **Assets** — The underlying tokens (e.g., USDC, WETH) that are deposited, borrowed, or used as collateral.
- **Active LTV** — Average LTV of active positions.

*For the canonical technical reference, see docs.morpho.org.*
