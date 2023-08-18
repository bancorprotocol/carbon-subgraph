import { BigInt } from "@graphprotocol/graph-ts";
import { getProtocol } from "./../../utils";
import { TradingFeePPMUpdated as TradingFeeEvent } from "./../../../generated/CarbonController/CarbonController";
import { Pair, TradingFee } from "./../../../generated/schema";

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

  let protocol = getProtocol();
  protocol.defaultTradingFeePPM = event.params.newFeePPM;
  protocol.save();

  const pairs = protocol.pairs;

  if (pairs == null) {
    return;
  }

  for (let i = 0; i < pairs.length; i++) {
    let pair = Pair.load(pairs[i]);

    if (pair != null) {
      pair._defaultFeePPM = event.params.newFeePPM;
      if (pair._customFeePPM == new BigInt(0)) {
        pair.tradingFeePPM = event.params.newFeePPM;
      }
      pair.save();
    }
  }
}
