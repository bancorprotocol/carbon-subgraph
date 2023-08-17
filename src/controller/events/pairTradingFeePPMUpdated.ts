import { findOrCreateToken, getPairID } from "./../../utils";
import { PairTradingFeePPMUpdated as PairTradingFeeEvent } from "./../../../generated/CarbonController/CarbonController";
import { PairTradingFee } from "./../../../generated/schema";

export function handlePairTradingFeePPMUpdated(
  event: PairTradingFeeEvent
): void {
  let entity = new PairTradingFee(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  let token0 = findOrCreateToken(event.params.token0, event.block.timestamp);
  let token1 = findOrCreateToken(event.params.token1, event.block.timestamp);

  entity.pair = getPairID(token0.id, token1.id);
  entity.token0 = token0.id;
  entity.token1 = token1.id;

  entity.prevFeePPM = event.params.prevFeePPM;
  entity.newFeePPM = event.params.newFeePPM;

  entity.blockNumber = event.block.number;
  entity.createdAtTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
