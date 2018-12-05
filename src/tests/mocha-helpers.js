/**
 * Enables the mocha done parameter using async/await
 * @param {function(done: function): undefined} - your test function
 * @return {function} a new function receiving the done and passing it to your function
 * @throws {Error} when your function has not argument or your function is not an async one.
 */
function asyncDone(fn) {
  if (fn.length !== 1) {
    throw new Error('The function must receive a single done argument');
  }

  return (done) => {
    const promise = fn(done);

    if (!promise || !promise.then) {
      throw new Error('The function must return a promise');
    }
  };
}

module.exports = {
  asyncDone,
};
