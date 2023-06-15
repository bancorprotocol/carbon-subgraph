import { PairCreated as PairCreatedEvent } from "./../../../generated/CarbonController/CarbonController";
import { findOrCreateToken, getPairID } from "./../../utils";
import { Pair } from "./../../../generated/schema";

export function handlePairCreated(event: PairCreatedEvent): void {
  let token0 = findOrCreateToken(event.params.token0, event.block.timestamp);
  let token1 = findOrCreateToken(event.params.token1, event.block.timestamp);
  let id = getPairID(token0.id, token1.id);

  let newPair = new Pair(id);
  newPair.token0 = token0.id;
  newPair.token1 = token1.id;
  newPair.createdAtTimestamp = event.block.timestamp;
  newPair.transactionHash = event.transaction.hash;
  newPair.blockNumber = event.block.number;
  newPair.save();
}
