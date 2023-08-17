import { TradingFeePPMUpdated as TradingFeeEvent } from "./../../../generated/CarbonController/CarbonController";
import { TradingFee } from "./../../../generated/schema";

export function handleTradingFeePPMUpdated(event: TradingFeeEvent): void {
  let entity = new TradingFee(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  entity.prevFeePPM = event.params.prevFeePPM;
  entity.newFeePPM = event.params.newFeePPM;

  entity.blockNumber = event.block.number;
  entity.createdAtTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
