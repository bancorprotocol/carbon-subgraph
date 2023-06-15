import { TradingFeePPMUpdated as TradingFeePPMUpdatedEvent } from "./../../../generated/CarbonController/CarbonController";
import { TradingFeePPMUpdated } from "./../../../generated/schema";

export function handleTradingFeePPMUpdated(
  event: TradingFeePPMUpdatedEvent
): void {
  let entity = new TradingFeePPMUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.prevFeePPM = event.params.prevFeePPM;
  entity.newFeePPM = event.params.newFeePPM;

  entity.blockNumber = event.block.number;
  entity.createdAtTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
