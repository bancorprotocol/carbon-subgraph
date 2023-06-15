import { StrategyUpdated as StrategyUpdatedEvent } from "./../../../generated/CarbonController/CarbonController";
import { StrategyEvent, Order, Strategy } from "./../../../generated/schema";
import { Bytes } from "@graphprotocol/graph-ts";

export function handleStrategyUpdated(event: StrategyUpdatedEvent): void {
  let id = event.params.id.toString();

  let strategy = Strategy.load(id);
  if (strategy === null) {
    throw new Error("Cannot find strategy");
  }

  let order0 = Order.load(strategy.order0);
  let order1 = Order.load(strategy.order1);
  if (order0 == null || order1 == null) {
    throw new Error("Cannot find order");
  }

  order0.A = event.params.order0.A;
  order0.B = event.params.order0.B;
  order0.z = event.params.order0.z;
  order0.y = event.params.order0.y;
  order0.save();

  order1.A = event.params.order1.A;
  order1.B = event.params.order1.B;
  order1.z = event.params.order1.z;
  order1.y = event.params.order1.y;
  order1.save();

  strategy.updatedAtTimestamp = event.block.timestamp;
  strategy.events = strategy.events.concat([addStrategyUpdatedEvent(event)]);
  strategy.save();
}

function addStrategyUpdatedEvent(event: StrategyUpdatedEvent): Bytes {
  let newEvent = new StrategyEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  switch (event.params.reason) {
    case 0:
      newEvent.eventName = "StrategyUpdatedEdit";
      break;
    case 1:
      newEvent.eventName = "StrategyUpdatedTrade";
      break;
    default:
      newEvent.eventName = "StrategyUpdated";
  }

  newEvent.newOrder0_A = event.params.order0.A;
  newEvent.newOrder0_B = event.params.order0.B;
  newEvent.newOrder0_y = event.params.order0.y;
  newEvent.newOrder0_z = event.params.order0.z;

  newEvent.newOrder1_A = event.params.order1.A;
  newEvent.newOrder1_B = event.params.order1.B;
  newEvent.newOrder1_y = event.params.order1.y;
  newEvent.newOrder1_z = event.params.order1.z;

  newEvent.transactionHash = event.transaction.hash;
  newEvent.blockNumber = event.block.number;
  newEvent.blockTimestamp = event.block.timestamp;
  newEvent.save();

  return newEvent.id;
}
