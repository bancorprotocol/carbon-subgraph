import { PairCreated as PairCreatedEvent } from "./../../../generated/CarbonController/CarbonController";
import { findOrCreateToken, getPairID } from "./../../utils";
import { Event, Pair } from "./../../../generated/schema";
import { Bytes } from "@graphprotocol/graph-ts";

function addPairCreatedEvent(event: PairCreatedEvent): Bytes {
  let newEvent = new Event(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  newEvent.name = "PairCreated";
  newEvent.data = `{
    "token0": "${event.params.token0.toString()}",
    "token1": "${event.params.token1.toString()}"
  }`;
  newEvent.transactionHash = event.transaction.hash;
  newEvent.blockNumber = event.block.number;
  newEvent.blockTimestamp = event.block.timestamp;
  newEvent.save();

  return newEvent.id;
}

export function handlePairCreated(event: PairCreatedEvent): void {
  let token0 = findOrCreateToken(event.params.token0, event.block.timestamp);
  let token1 = findOrCreateToken(event.params.token1, event.block.timestamp);
  let id = getPairID(token0.id, token1.id);

  let newPair = new Pair(id);
  newPair.token0 = token0.id;
  newPair.token1 = token1.id;
  newPair.createdAtTimestamp = event.block.timestamp;
  newPair.events = [addPairCreatedEvent(event)];
  newPair.save();
}
