import { BigInt } from "@graphprotocol/graph-ts";
import { TokensTraded as TokensTradedEvent } from "./../../../generated/CarbonController/CarbonController";
import { Trade } from "./../../../generated/schema";
import {
  findOrCreateToken,
  findOrCreateUser,
  getPairID,
  getProtocol
} from "./../../utils";

export function handleTokensTraded(event: TokensTradedEvent): void {
  const protocol = getProtocol();
  protocol.tradeCount = protocol.tradeCount.plus(BigInt.fromI32(1));
  protocol.save();

  let newTrade = new Trade(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  newTrade.trader = findOrCreateUser(
    event.params.trader,
    event.block.timestamp
  ).id;
  newTrade.sourceToken = findOrCreateToken(
    event.params.sourceToken,
    event.block.timestamp
  ).id;
  newTrade.targetToken = findOrCreateToken(
    event.params.targetToken,
    event.block.timestamp
  ).id;

  newTrade.pair = getPairID(event.params.sourceToken, event.params.targetToken);
  newTrade.sourceAmount = event.params.sourceAmount;
  newTrade.targetAmount = event.params.targetAmount;
  newTrade.tradingFeeAmount = event.params.tradingFeeAmount;
  newTrade.byTargetAmount = event.params.byTargetAmount;

  newTrade.createdAtTimestamp = event.block.timestamp;
  newTrade.transactionHash = event.transaction.hash;
  newTrade.blockNumber = event.block.number;

  newTrade.save();
}
