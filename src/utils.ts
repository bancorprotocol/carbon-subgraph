import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Protocol, Token, User } from "./../generated/schema";
import { ERC20Contract } from "./../generated/CarbonController/ERC20Contract";

export let NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export let ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export let CARBON_CONTROLLER_ADDRESS =
  "0xC537e898CD774e2dCBa3B14Ea6f34C93d5eA45e1";

function sortStringsAlphabetically(a: string, b: string): Array<string> {
  return a < b ? [a, b] : [b, a];
}

export function getPairID(token0: Bytes, token1: Bytes): string {
  let tokens = sortStringsAlphabetically(
    token0.toHexString().toLowerCase(),
    token1.toHexString().toLowerCase()
  );

  return tokens.join("-");
}

export function findOrCreateUser(id: Address, timestamp: BigInt): User {
  let user = User.load(id);

  if (user == null) {
    user = new User(id);
    user.createdAtTimestamp = timestamp;
    user.save();
  }

  return user;
}

function createEthToken(timestamp: BigInt): Token {
  let token = new Token(Address.fromString(ETH_ADDRESS));

  token.symbol = "ETH";
  token.name = "Ethereum";
  token.decimals = 18;
  token.createdAtTimestamp = timestamp;
  token.save();

  return token;
}

function createERC20Token(id: Address, timestamp: BigInt): Token {
  let contract = ERC20Contract.bind(id);
  let token = new Token(id);

  token.symbol = contract.symbol();
  token.name = contract.name();
  token.decimals = contract.decimals();
  token.createdAtTimestamp = timestamp;
  token.save();

  return token;
}

export function findOrCreateToken(id: Address, timestamp: BigInt): Token {
  let token = Token.load(id);

  if (token != null) {
    return token;
  }

  if (id == Address.fromString(ETH_ADDRESS)) {
    return createEthToken(timestamp);
  }

  return createERC20Token(id, timestamp);
}

export function getProtocol(): Protocol {
  let id = Address.fromString(CARBON_CONTROLLER_ADDRESS);
  let protocol = Protocol.load(id);

  if (protocol != null) {
    return protocol;
  }

  protocol = new Protocol(id);
  protocol.defaultTradingFeePPM = new BigInt(0);
  protocol.pairCount = new BigInt(0);
  protocol.strategyCount = new BigInt(0);
  protocol.strategyTotalCount = new BigInt(0);
  protocol.strategyDeletedCount = new BigInt(0);
  protocol.tradeCount = new BigInt(0);
  protocol.save();

  return protocol;
}
