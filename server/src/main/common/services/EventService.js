import { randomUUID } from "crypto";

/**
 * @typedef {object} StreamInfo
 * @property {number} userId
 * @property {number} tokenId
 * @property {import("express").Response} res
 * @property {number} currentEventId
 */

/**
 * @typedef {object} StreamEvent
 * @property {string} name
 * @property {*} data
 */

/**
 * @type {Map<import("crypto").UUID, StreamInfo}
 */
const streams = new Map();

/**
 * @param {number} userId
 * @param {number} tokenId
 * @param {import("express").Response} res
 */
export function startEventStream(userId, tokenId, res) {
  res.writeHead(200, {
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    "Access-Control-Allow-Origin": "*",
  });

  const streamId = randomUUID();

  streams.set(streamId, { userId, tokenId, res, currentEventId: 0 });

  res.on("close", () => closeEventStream(streamId));
  return streamId;
}

/**
 * @param {number} userId
 * @param {StreamEvent | Array<StreamEvent>} event
 */
export function sendEventToUser(userId, event) {
  sendEventToStreams(allUserStreams(userId), event);
}

/**
 * @param {number} tokenId
 * @param {StreamEvent | Array<StreamEvent>} event
 */
export function sendEventToToken(tokenId, event) {
  sendEventToStreams(allTokenStreams(tokenId), event);
}

/**
 * @param {import("crypto").UUID | Array<import("crypto").UUID>} streamIds
 * @param {StreamEvent | Array<StreamEvent>} events
 */
export function sendEventToStreams(streamIds, events) {
  if (!Array.isArray(streamIds)) streamIds = [streamIds];
  const recivingStreams = streamIds
    .map((streamId) => streams.get(streamId))
    .filter((stream) => !!stream);
  if (!Array.isArray(events)) events = [events];
  events.forEach((event) => {
    const data = JSON.stringify(event);
    recivingStreams.forEach((stream) => {
      stream.res.write(
        `id: ${++stream.currentEventId}\ndata: ${data}\n\n`
      );
      if(stream.currentEventId == 3) stream.res.end();
    });
  });
}

/**
 * @param {number} userId
 * @returns {Array<import("crypto").UUID>}
 */
export function allUserStreams(userId) {
  const userStreams = [];
  for (let [key, stream] of streams)
    if (stream.userId == userId) userStreams.push(key);
  return userStreams;
}

/**
 * @param {number} tokenId
 * @returns {Array<import("crypto").UUID>}
 */
export function allTokenStreams(tokenId) {
  const tokenStreams = [];
  for (let [key, stream] of streams)
    if (stream.tokenId == tokenId) tokenStreams.push(key);
  return tokenStreams;
}

/**
 * @param {import("crypto").UUID | Array<import("crypto").UUID>} streamIds
 */
export function closeEventStream(streamIds) {
  if (!Array.isArray(streamIds)) streamIds = [streamIds];
  streamIds.forEach((streamId) => {
    if (!streams.has(streamId)) return;
    const stream = streams.get(streamId);
    streams.delete(streamId);
    stream.res.end();
  });
}

export function closeAllTokenEventStreams(tokenId) {
  closeEventStream(allTokenStreams(tokenId));
}

export function closeAllUserEventStreams(userId) {
  closeEventStream(allUserStreams(userId));
}
