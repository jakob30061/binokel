import type { Peer } from 'crossws';
import { errorHandling } from '../../errorWrapper';

export const handleUserDisconnect = errorHandling(async (
  peer: Peer,
  gameEvent: any
) => {

})