import { StrategyUpdated as StrategyUpdatedEvent } from "./../../../generated/CarbonController/CarbonController";
import { Event, Order, Strategy } from "./../../../generated/schema";
import { Bytes } from "@graphprotocol/graph-ts";

function addStrategyUpdatedEvent(event: StrategyUpdatedEvent): Bytes {
  let newEvent = new Event(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  newEvent.name = "StrategyUpdated";
  newEvent.data = `{
    "id": "${event.params.id.toString()}",
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

export function handleStrategyUpdated(event: StrategyUpdatedEvent): void {
  let id = event.params.id.toString();
  let updatedOrder0 = event.params.order0;
  let updatedOrder1 = event.params.order1;

  let strategy = Strategy.load(id);
  if (strategy === null) {
    throw new Error("Cannot find strategy");
  }

  let order0 = Order.load(strategy.order0);
  let order1 = Order.load(strategy.order1);
  if (order0 == null || order1 == null) {
    throw new Error("Cannot find order");
  }

  order0.A = updatedOrder0.A;
  order0.B = updatedOrder0.B;
  order0.z = updatedOrder0.z;
  order0.y = updatedOrder0.y;
  order0.save();

  order1.A = updatedOrder1.A;
  order1.B = updatedOrder1.B;
  order1.z = updatedOrder1.z;
  order1.y = updatedOrder1.y;
  order1.save();

  strategy.updatedAtTimestamp = event.block.timestamp;
  strategy.events = strategy.events.concat([addStrategyUpdatedEvent(event)]);
  strategy.save();
}
