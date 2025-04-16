import { workspaces } from "./enums";

export const WORKSPACE: workspaces = workspaces.DEV;

// temporary email
export const EMAIL_PROVIDER = "@inboxkitten.com";

// auth 
export const EMAIL="globals1test@yopmail.com";
export const PASSWORD="Holaquehace123*";

// trading
// asset_type [Cryptocurrency, Forex, Synthetics, Stocks]
export const ASSET_TYPE="Cryptocurrency";
//pair - should exist within the asset type
export const PAIR="ETHUSD"
export const INVESTMENT=10
// time [1m, 2m, 3m, 5m, 10m, 15m, 30m, 45m] - recommended 1m
export const TIME="1m"
// typeOperation [buy, sell]
export const TYPE_OPERATION="buy" 