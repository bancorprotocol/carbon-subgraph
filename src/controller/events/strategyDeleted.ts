import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { StrategyDeleted as StrategyDeletedEvent } from "./../../../generated/CarbonController/CarbonController";
import { Event, Order, Strategy } from "./../../../generated/schema";

function addStrategyDeleteEvent(event: StrategyDeletedEvent): Bytes {
  let newEvent = new Event(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  newEvent.name = "StrategyDeleted";
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

export function handleStrategyDeleted(event: StrategyDeletedEvent): void {
  let id = event.params.id.toString();

  let strategy = Strategy.load(id);
  if (strategy === null) {
    throw new Error("Cannot find strategy");
  }

  strategy.deletedAtTimestamp = event.block.timestamp;
  strategy.events = strategy.events.concat([addStrategyDeleteEvent(event)]);
  strategy.save();

  const order0 = Order.load(strategy.order0);
  const order1 = Order.load(strategy.order1);
  if (order0 === null || order1 === null) {
    throw new Error("Cannot find order");
  }

  order0.A = new BigInt(0);
  order0.B = new BigInt(0);
  order0.y = new BigInt(0);
  order0.z = new BigInt(0);
  order0.save();

  order1.A = new BigInt(0);
  order1.B = new BigInt(0);
  order1.y = new BigInt(0);
  order1.z = new BigInt(0);
  order1.save();
}
