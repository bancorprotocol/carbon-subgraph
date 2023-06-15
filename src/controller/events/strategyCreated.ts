import { StrategyCreated as StrategyCreatedEvent } from "./../../../generated/CarbonController/CarbonController";
import { Event, Order, Strategy } from "./../../../generated/schema";
import { findOrCreateToken, findOrCreateUser, getPairID } from "./../../utils";
import { Bytes } from "@graphprotocol/graph-ts";

function addStrategyCreatedEvent(event: StrategyCreatedEvent): Bytes {
  let newEvent = new Event(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  newEvent.name = "StrategyCreated";
  newEvent.data = `{
    "id": "${event.params.id.toString()}",
    "owner": "${event.params.owner.toString()}",
    "token0": "${event.params.token0.toString()}",
    "token1": "${event.params.token1.toString()}",
    "order0": {
        "A": "${event.params.order0.A.toString()}",
        "B": "${event.params.order0.B.toString()}",
        "z": "${event.params.order0.z.toString()}",
        "y": "${event.params.order0.y.toString()}"
    },
    "order1": {
        "A": "${event.params.order1.A.toString()}",
        "B": "${event.params.order1.B.toString()}",
        "z": "${event.params.order1.z.toString()}",
        "y": "${event.params.order1.y.toString()}"
    }
  }`;
  newEvent.transactionHash = event.transaction.hash;
  newEvent.blockNumber = event.block.number;
  newEvent.blockTimestamp = event.block.timestamp;
  newEvent.save();

  return newEvent.id;
}

export function handleStrategyCreated(event: StrategyCreatedEvent): void {
  let id = event.params.id.toString();
  let owner = findOrCreateUser(event.params.owner, event.block.timestamp);
  let token0 = findOrCreateToken(event.params.token0, event.block.timestamp);
  let token1 = findOrCreateToken(event.params.token1, event.block.timestamp);
  let order0 = event.params.order0;
  let order1 = event.params.order1;
  let pairId = getPairID(token0.id, token1.id);

  let newStrategy = new Strategy(id);
  let newOrder0 = new Order(`${id}-0`);
  let newOrder1 = new Order(`${id}-1`);

  newOrder0.type = "order0";
  newOrder0.strategy = id;
  newOrder0.owner = owner.id;
  newOrder0.pair = pairId;
  newOrder0.inputToken = token1.id;
  newOrder0.outputToken = token0.id;
  newOrder0.A = order0.A;
  newOrder0.B = order0.B;
  newOrder0.z = order0.z;
  newOrder0.y = order0.y;
  newOrder0.save();

  newOrder1.type = "order1";
  newOrder1.strategy = id;
  newOrder1.owner = owner.id;
  newOrder1.pair = pairId;
  newOrder1.inputToken = token0.id;
  newOrder1.outputToken = token1.id;
  newOrder1.A = order1.A;
  newOrder1.B = order1.B;
  newOrder1.z = order1.z;
  newOrder1.y = order1.y;
  newOrder1.save();

  newStrategy.owner = owner.id;
  newStrategy.pair = pairId;
  newStrategy.token0 = token0.id;
  newStrategy.token1 = token1.id;
  newStrategy.order0 = newOrder0.id;
  newStrategy.order1 = newOrder1.id;
  newStrategy.createdAtTimestamp = event.block.timestamp;
  newStrategy.events = [addStrategyCreatedEvent(event)];
  newStrategy.save();
}
