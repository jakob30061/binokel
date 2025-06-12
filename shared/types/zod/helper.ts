import z from "zod";

/**
 * Request
 */
export function ReqBuilder<
  A extends WebsocketTypes,
  D extends z.ZodRawShape
>(
  action: A,
  extraData: D
) {
  return z.object({
    action: z.literal(action),
    data: z.object({
      playerUUID: z.string(),
      gamePin:    z.string().length(CONFIG.GAME_PIN_LENGTH),
    }).extend(extraData)
  });
}

/**
 * Response
 */
export function makeSocketResponse<
  A extends WebsocketTypes,
  T extends z.ZodTypeAny
>(
  action: A,
  data: T
) {
  return z.discriminatedUnion('success', [
    // Failure
    z.object({
      success: z.literal(false),
      action:  z.literal(action),
      error:   z.enum(WebsocketErrors)
    }),

    // Success
    z.object({
      success: z.literal(true),
      action: z.literal(action),
      data
    })
  ]);
}
