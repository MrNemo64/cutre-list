import { randomUUID } from "crypto";
import { startEventStream, closeEventStream } from "../../common/services/EventService.js";

const requests = new Map();

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export function requestEvents(req, res) {
  const requestId = randomUUID();
  const userId = req.authUser.id;
  const tokenId = req.authToken.id;
  requests.set(requestId, { userId, tokenId });
  res.status(200).send(requestId);
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export function startEventStreamRequest(req, res) {
  const requestId = req.params.id;
  const requestValues = requests.get(requestId);
  if (!requestValues) return res.sendStatus(404);
  if(requestValues.streamId)
    closeEventStream(requestValues.streamId);
  const userId = requestValues.userId;
  const tokenId = requestValues.tokenId;
  const streamId = startEventStream(userId, tokenId, res);
  requestValues.streamId = streamId;
}