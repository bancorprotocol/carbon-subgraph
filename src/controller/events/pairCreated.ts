import { BigInt } from "@graphprotocol/graph-ts";
import { PairCreated as PairCreatedEvent } from "./../../../generated/CarbonController/CarbonController";
import { findOrCreateToken, getPairID, getProtocol } from "./../../utils";
import { Pair } from "./../../../generated/schema";

export function handlePairCreated(event: PairCreatedEvent): void {
  const protocol = getProtocol();
  protocol.pairCount = protocol.pairCount.plus(BigInt.fromI32(1));
  protocol.save();

  let token0 = findOrCreateToken(event.params.token0, event.block.timestamp);
  let token1 = findOrCreateToken(event.params.token1, event.block.timestamp);
  let id = getPairID(token0.id, token1.id);

  let newPair = new Pair(id);
  newPair.protocol = protocol.id;
  newPair.token0 = token0.id;
  newPair.token1 = token1.id;
  newPair.tradingFeePPM = protocol.defaultTradingFeePPM;
  newPair._defaultFeePPM = protocol.defaultTradingFeePPM;
  newPair._customFeePPM = new BigInt(0);
  newPair.createdAtTimestamp = event.block.timestamp;
  newPair.transactionHash = event.transaction.hash;
  newPair.blockNumber = event.block.number;
  newPair.save();
}
