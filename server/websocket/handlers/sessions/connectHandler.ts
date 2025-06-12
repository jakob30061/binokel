import { Peer } from "crossws";
import { errorHandling } from "../../errorWrapper";

export const handleUserConnect = errorHandling(async (
  peer: Peer,
  gameEvent: any
) => {
  peer.send({ user: "server", message: `Welcome ${peer}!` });
  peer.publish("chat", { user: "server", message: `${peer} joined!` });
  peer.subscribe("chat");
})