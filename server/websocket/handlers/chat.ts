import type { Peer } from 'crossws';
import { errorHandling } from '../errorWrapper';

export const handleChatMessage = errorHandling(async (
  peer: Peer,
  chatMessage: any
) => {

})