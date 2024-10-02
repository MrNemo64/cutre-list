export function waitForResultWithTimeout(promise, timeout) {
  // Create a promise that rejects after a specified timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Timeout exceeded"));
    }, timeout);
  });

  // Use Promise.race to wait for either the original promise or the timeout
  return Promise.race([promise, timeoutPromise]);
}
