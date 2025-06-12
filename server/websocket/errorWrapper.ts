import type { Peer } from 'crossws';

export class GameError extends Error {
  constructor(
    message: string | WebsocketErrors,
    public action?: WebsocketTypes
  ) {
    super(String(message));
    this.name = 'GameError';
    // Fix the prototype chain when targeting ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandling<T>(
  handler: (peer: Peer, gameEvent: T) => Promise<void>,
) {
  return async (peer: Peer, gameEvent: T) => {
    try {
      await handler(peer, gameEvent);
    } catch (err: unknown) {
      let message = 'Unknown error';
      let action: string | undefined;
      console.log(err);
      
      if (err instanceof GameError) {
        message = err.message;
        action = err.action;
      } else if (err instanceof Error) {
        message = err.message;
      }

      const payload: Record<string, unknown> = {
        success: false,
        error: message,
        data: {},
      };
      if (action) payload.action = action;

      peer.send(payload);
    }
  };
}
