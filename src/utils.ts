import { Address, BigInt } from "@graphprotocol/graph-ts";
import { User } from "./../generated/schema";

function sortStringsAlphabetically(a: string, b: string): Array<string> {
  return a < b ? [a, b] : [b, a];
}

// TODO - this is temporary and needs to be replaced with a permanent solution
export function getPairID(token0: Address, token1: Address): string {
  let tokens = sortStringsAlphabetically(
    token0.toHexString().toLowerCase(),
    token1.toHexString().toLowerCase()
  );
  return tokens.join("-");
}

export let NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export function findOrCreateUser(id: Address, timestamp: BigInt): User {
  let user = User.load(id);
  if (user == null) {
    user = new User(id);
    user.createdAtTimestamp = timestamp;
    user.save();
  }
  return user;
}
