import {Address, BigInt, Bytes} from "@graphprotocol/graph-ts";
import { Token, User } from "./../generated/schema";
import { ERC20Contract } from "./../generated/CarbonVoucher/ERC20Contract";

function sortStringsAlphabetically(a: string, b: string): Array<string> {
  return a < b ? [a, b] : [b, a];
}

// TODO - this is temporary and needs to be replaced with a permanent solution
export function getPairID(token0: Bytes, token1: Bytes): string {
  let tokens = sortStringsAlphabetically(
    token0.toHexString().toLowerCase(),
    token1.toHexString().toLowerCase()
  );
  return tokens.join("-");
}

export let NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export let ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

export function findOrCreateUser(id: Address, timestamp: BigInt): User {
  let user = User.load(id);
  if (user == null) {
    user = new User(id);
    user.createdAtTimestamp = timestamp;
    user.save();
  }
  return user;
}

export function findOrCreateToken(id: Address, timestamp: BigInt): Token {
  let token = Token.load(id);
  if (token == null) {
    // TODO handle ETH properly
    if (id == Address.fromString(ETH_ADDRESS)) {
      token = new Token(id);
      token.symbol = "ETH";
      token.name = "Ethereum";
      token.decimals = 18;
      token.createdAtTimestamp = timestamp;
      token.save();
      return token;
    }

    let contract = ERC20Contract.bind(id);
    token = new Token(id);

    let symbolCallResult = contract.try_symbol();
    if (symbolCallResult.reverted) {
      // TODO handle reverted calls properly
      token.symbol = "not found";
    } else {
      token.symbol = symbolCallResult.value;
    }

    let nameCallResult = contract.try_name();
    if (nameCallResult.reverted) {
      // TODO handle reverted calls properly
      token.name = "not found";
    } else {
      token.name = nameCallResult.value;
    }

    let decimalsCallResult = contract.try_decimals();
    if (decimalsCallResult.reverted) {
      // TODO handle reverted calls properly
      token.decimals = -1;
    } else {
      token.decimals = decimalsCallResult.value;
    }

    token.createdAtTimestamp = timestamp;
    token.save();
  }
  return token;
}
