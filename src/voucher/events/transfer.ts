import { Order, Strategy } from "../../../generated/schema";
import { Transfer as TransferEvent } from "./../../../generated/CarbonVoucher/CarbonVoucher";
import { findOrCreateUser, NULL_ADDRESS } from "./../../utils";

export function handleTransfer(event: TransferEvent): void {
  let from = event.params.from.toHexString();
  if (from == NULL_ADDRESS) {
    // Mint event, ignore this transfer
    return;
  }

  let to = event.params.to;
  if (to.toHexString() == NULL_ADDRESS) {
    // Burn event, ignore this transfer
    return;
  }
  let owner = findOrCreateUser(to, event.block.timestamp).id;

  let id = event.params.tokenId.toString();
  let strategy = Strategy.load(id);
  if (strategy == null) {
    throw new Error("Cannot find strategy id: " + id);
  }

  strategy.owner = owner;
  strategy.save();

  let order0 = Order.load(strategy.order0);
  let order1 = Order.load(strategy.order1);
  if (order0 == null || order1 == null) {
    throw new Error("Cannot find order");
  }

  order0.owner = owner;
  order0.save();

  order1.owner = owner;
  order1.save();
}
