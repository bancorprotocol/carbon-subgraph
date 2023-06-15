import { TokensTraded as TokensTradedEvent } from "./../../../generated/CarbonController/CarbonController";
import { Event, Trade } from "./../../../generated/schema";
import { findOrCreateToken, findOrCreateUser, getPairID } from "./../../utils";
import { Bytes } from "@graphprotocol/graph-ts";

function addTokensTradedEvent(event: TokensTradedEvent): Bytes {
  let newEvent = new Event(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  newEvent.name = "TokensTraded";
  newEvent.data = `{
    "trader": "${event.params.trader.toString()}",
    "sourceToken": "${event.params.sourceToken.toString()}",
    "targetToken": "${event.params.targetToken.toString()}",
    "sourceAmount": "${event.params.sourceAmount.toString()}",
    "targetAmount": "${event.params.targetAmount.toString()}",
    "tradingFeeAmount": "${event.params.tradingFeeAmount.toString()}",
    "byTargetAmount": "${event.params.byTargetAmount.toString()}"
  }`;
  newEvent.transactionHash = event.transaction.hash;
  newEvent.blockNumber = event.block.number;
  newEvent.blockTimestamp = event.block.timestamp;
  newEvent.save();

  return newEvent.id;
}

export function handleTokensTraded(event: TokensTradedEvent): void {
  let newTrade = new Trade(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  newTrade.trader = findOrCreateUser(
    event.params.trader,
    event.block.timestamp
  ).id;
  newTrade.pair = getPairID(event.params.sourceToken, event.params.targetToken);
  newTrade.sourceToken = findOrCreateToken(
    event.params.sourceToken,
    event.block.timestamp
  ).id;
  newTrade.targetToken = findOrCreateToken(
    event.params.targetToken,
    event.block.timestamp
  ).id;
  newTrade.sourceAmount = event.params.sourceAmount;
  newTrade.targetAmount = event.params.targetAmount;
  newTrade.tradingFeeAmount = event.params.tradingFeeAmount;
  newTrade.byTargetAmount = event.params.byTargetAmount;
  newTrade.createdAtTimestamp = event.block.timestamp;
  newTrade.events = [addTokensTradedEvent(event)];
  newTrade.save();
}
