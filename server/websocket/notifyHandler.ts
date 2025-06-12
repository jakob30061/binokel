import { Peer } from "crossws"
import { errorHandling } from "./errorWrapper"
import prisma from "../lib/prisma";
import {getAIMove} from "../ai";

export interface NotifyPlayers {
  channel?: string,
  notifyPeer?: boolean,
  data: string
}

export const notifyPlayers = errorHandling(async (peer: Peer, data: NotifyPlayers[] | NotifyPlayers) => {
  const list = Array.isArray(data) ? data : [data];

  let ids: string[] = []

  list.forEach(el => {
    // Check for AI
    if (el.channel) 
      ids.push(el.channel?.slice(5)) 
  });

  const ai_ids = await prisma.user.findMany({
      where: {
        isAI: true,
        uuid: {
          in: ids
        }
      },
      select: {
        uuid: true
      }
  })

  const ai_uuids = ai_ids.map(e => e.uuid)

  list.forEach(el => {
    if(el.channel) {
      // AI 
      if (ai_uuids.includes(el.channel.slice(5))) {
        getAIMove(el.data)
        return
      }
        
      peer.publish(
        el.channel,
        el.data
      )
    }

    if(el.notifyPeer)
      peer.send(el.data);
  });
})
