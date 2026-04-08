use soroban_sdk::{contract, contractimpl, Address, Env, Map, Vec, token, BytesN, String, Symbol, VecM};
use soroban_token_sdk::TokenClient;

// Contract state storage keys
const ADMIN: Symbol = Symbol::short(&[0x41, 0x44, 0x4D, 0x49, 0x4E]); // "ADMIN"
const ASSETS: Symbol = Symbol::short(&[0x41, 0x53, 0x53, 0x45, 0x54, 0x53]); // "ASSETS"
const TOKEN_BALANCES: Symbol = Symbol::short(&[0x42, 0x41, 0x4C, 0x41, 0x4E, 0x43, 0x45, 0x53]); // "BALANCES"
const USDC_TOKEN: Symbol = Symbol::short(&[0x55, 0x53, 0x44, 0x43]); // "USDC"
const TOTAL_SUPPLY: Symbol = Symbol::short(&[0x54, 0x4F, 0x54, 0x41, 0x4C]); // "TOTAL"

#[derive(Clone)]
#[contracttype]
pub struct Asset {
    pub id: BytesN<32>,
    pub name: String,
    pub location: String,
    pub total_value: u128,
    pub annual_yield_rate: u32, // in basis points (10000 = 100%)
    pub total_shares: u128,
    pub shares_sold: u128,
    pub price_per_share: u128, // in USDC (smallest unit)
    pub is_active: bool,
}

#[derive(Clone)]
#[contracttype]
pub struct Shareholding {
    pub owner: Address,
    pub asset_id: BytesN<32>,
    pub shares: u128,
    pub last_yield_claimed: u64, // timestamp
}

#[contract]
pub struct FractionalOwnershipContract;

#[contractimpl]
impl FractionalOwnershipContract {
    /// Initialize the contract with admin address and USDC token address
    pub fn initialize(env: Env, admin: Address, usdc_token: Address) {
        if env.storage().instance().has(&ADMIN) {
            panic!("Contract already initialized");
        }
        
        admin.require_auth();
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&USDC_TOKEN, &usdc_token);
        env.storage().instance().set(&TOTAL_SUPPLY, &0u128);
    }

    /// Create a new asset token for fractional ownership
    pub fn create_asset_token(
        env: Env,
        admin: Address,
        asset_id: BytesN<30>,
        name: String,
        location: String,
        total_value: u128,
        annual_yield_rate: u32,
        total_shares: u128,
        price_per_share: u128,
    ) -> Asset {
        // Verify admin authorization
        let stored_admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        if stored_admin != admin {
            panic!("Only admin can create assets");
        }
        admin.require_auth();

        // Create asset
        let asset = Asset {
            id: asset_id.clone(),
            name,
            location,
            total_value,
            annual_yield_rate,
            total_shares,
            shares_sold: 0,
            price_per_share,
            is_active: true,
        };

        // Store asset
        let mut assets: Map<BytesN<30>, Asset> = env.storage().instance().get(&ASSETS).unwrap_or(Map::new(&env));
        assets.set(asset_id.clone(), asset.clone());
        env.storage().instance().set(&ASSETS, &assets);

        asset
    }

    /// Purchase shares of an asset using USDC
    pub fn purchase_shares(
        env: Env,
        investor: Address,
        asset_id: BytesN<30>,
        shares_to_buy: u128,
    ) {
        investor.require_auth();

        // Get asset
        let mut assets: Map<BytesN<30>, Asset> = env.storage().instance().get(&ASSETS).unwrap_or(Map::new(&env));
        let mut asset: Asset = assets.get(asset_id.clone()).unwrap_or_else(|| panic!("Asset not found"));

        if !asset.is_active {
            panic!("Asset is not active");
        }

        if asset.shares_sold + shares_to_buy > asset.total_shares {
            panic!("Not enough shares available");
        }

        // Calculate cost
        let cost = shares_to_buy.checked_mul(asset.price_per_share)
            .unwrap_or_else(|| panic!("Overflow in cost calculation"));

        // Transfer USDC from investor to contract
        let usdc_token: Address = env.storage().instance().get(&USDC_TOKEN).unwrap();
        let token_client = TokenClient::new(&env, &usdc_token);
        token_client.transfer(&investor, &env.current_contract_address(), &cost);

        // Update asset
        asset.shares_sold += shares_to_buy;
        assets.set(asset_id.clone(), asset.clone());
        env.storage().instance().set(&ASSETS, &assets);

        // Update investor's shareholding
        let shareholding_key = (investor.clone(), asset_id.clone());
        let mut holdings: Map<(Address, BytesN<30>), Shareholding> = env.storage().instance().get(&TOKEN_BALANCES).unwrap_or(Map::new(&env));
        
        let current_holding = holdings.get(shareholding_key.clone()).unwrap_or(Shareholding {
            owner: investor.clone(),
            asset_id: asset_id.clone(),
            shares: 0,
            last_yield_claimed: env.ledger().timestamp(),
        });

        let updated_holding = Shareholding {
            shares: current_holding.shares + shares_to_buy,
            last_yield_claimed: current_holding.last_yield_claimed,
            ..current_holding
        };

        holdings.set(shareholding_key, updated_holding);
        env.storage().instance().set(&TOKEN_BALANCES, &holdings);

        // Update total supply
        let mut total_supply: u128 = env.storage().instance().get(&TOTAL_SUPPLY).unwrap_or(0u128);
        total_supply += shares_to_buy;
        env.storage().instance().set(&TOTAL_SUPPLY, &total_supply);
    }

    /// Distribute yield to all token holders of an asset
    pub fn distribute_yield(
        env: Env,
        admin: Address,
        asset_id: BytesN<30>,
        total_yield_amount: u128,
    ) {
        // Verify admin authorization
        let stored_admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        if stored_admin != admin {
            panic!("Only admin can distribute yield");
        }
        admin.require_auth();

        // Get asset
        let assets: Map<BytesN<30>, Asset> = env.storage().instance().get(&ASSETS).unwrap_or(Map::new(&env));
        let asset: Asset = assets.get(asset_id.clone()).unwrap_or_else(|| panic!("Asset not found"));

        if asset.shares_sold == 0 {
            panic!("No shares sold for this asset");
        }

        // Transfer USDC from admin to contract
        let usdc_token: Address = env.storage().instance().get(&USDC_TOKEN).unwrap();
        let token_client = TokenClient::new(&env, &usdc_token);
        token_client.transfer(&admin, &env.current_contract_address(), &total_yield_amount);

        // Calculate yield per share
        let yield_per_share = total_yield_amount.checked_div(asset.shares_sold)
            .unwrap_or_else(|| panic!("Division by zero in yield calculation"));

        // Distribute to all holders
        let holdings: Map<(Address, BytesN<30>), Shareholding> = env.storage().instance().get(&TOKEN_BALANCES).unwrap_or(Map::new(&env));
        
        for ((owner, holding_asset_id), holding) in holdings.iter() {
            if holding_asset_id == asset_id {
                let yield_amount = holding.shares.checked_mul(yield_per_share)
                    .unwrap_or_else(|| panic!("Overflow in yield calculation"));
                
                if yield_amount > 0 {
                    token_client.transfer(&env.current_contract_address(), &owner, &yield_amount);
                }
            }
        }
    }

    /// Get asset information
    pub fn get_asset(env: Env, asset_id: BytesN<30>) -> Asset {
        let assets: Map<BytesN<30>, Asset> = env.storage().instance().get(&ASSETS).unwrap_or(Map::new(&env));
        assets.get(asset_id).unwrap_or_else(|| panic!("Asset not found"))
    }

    /// Get all assets
    pub fn get_all_assets(env: Env) -> Vec<Asset> {
        let assets: Map<BytesN<30>, Asset> = env.storage().instance().get(&ASSETS).unwrap_or(Map::new(&env));
        assets.values()
    }

    /// Get user's shareholdings
    pub fn get_user_shareholdings(env: Env, user: Address) -> Vec<Shareholding> {
        let holdings: Map<(Address, BytesN<30>), Shareholding> = env.storage().instance().get(&TOKEN_BALANCES).unwrap_or(Map::new(&env));
        let user_holdings: Vec<Shareholding> = Vec::new(&env);
        
        for ((owner, _), holding) in holdings.iter() {
            if owner == user {
                user_holdings.push_back(holding);
            }
        }
        
        user_holdings
    }

    /// Get total value of user's portfolio
    pub fn get_portfolio_value(env: Env, user: Address) -> u128 {
        let holdings: Map<(Address, BytesN<30>), Shareholding> = env.storage().instance().get(&TOKEN_BALANCES).unwrap_or(Map::new(&env));
        let assets: Map<BytesN<30>, Asset> = env.storage().instance().get(&ASSETS).unwrap_or(Map::new(&env));
        let mut total_value = 0u128;

        for ((owner, asset_id), holding) in holdings.iter() {
            if owner == user {
                if let Some(asset) = assets.get(asset_id) {
                    let holding_value = holding.shares.checked_mul(asset.price_per_share)
                        .unwrap_or_else(|| panic!("Overflow in portfolio calculation"));
                    total_value += holding_value;
                }
            }
        }

        total_value
    }
}
