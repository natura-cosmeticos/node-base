const uuidV4 = require('uuid/V4');
const asyncHooks = require('async_hooks');

// Main storage object
let asyncHooksStorage = { entries: {} };

// Async Hooks list
let asyncHooksList = {};

// Async Hooks Entry class with automatic UUIDV4 ids
class AsyncHooksEntry {
  constructor(type) {
    this.id = uuidV4();
    this.type = type;
    this.context = new Map();
  }
}

// Check if a specifc Async Hook Resource already exists
function existAsyncHooksEntry(asyncId) {
  return (typeof asyncHooksStorage.entries[asyncId] !== 'undefined');
}

// Initialize a new Async Hook Resource
function init(asyncId, type, triggerAsyncId, resource) {
  if (existAsyncHooksEntry(triggerAsyncId)) {
    // Attach the asyncId context with the parent context
    asyncHooksStorage.entries[asyncId] = asyncHooksStorage.entries[triggerAsyncId];
  }
}

// When an asynchronous operation is initiated or completes a callback is called to
// notify the user - the before callback is called just before said callback is executed
function before(asyncId) {
  if (existAsyncHooksEntry(asyncId)) {
    asyncHooksList[asyncId] = asyncHooksStorage.currentEntry;
    asyncHooksStorage.currentEntry = asyncHooksStorage.entries[asyncId];
  }
}

// Called immediately after the callback specified in before is completed
function after(asyncId) {
  if (existAsyncHooksEntry(asyncId)) {
    asyncHooksStorage.currentEntry = asyncHooksList[asyncId];
  }
}

// Called after the resource corresponding to asyncId is destroyed
function destroy(asyncId) {
  if (existAsyncHooksEntry(asyncId)) {
    delete asyncHooksList[asyncId];
    delete asyncHooksStorage.entries[asyncId];
  }
}

// Enable the callbacks for a given AsyncHook instance
asyncHooksStorage.enable = () => asyncHooks.createHook({ init, before, after, destroy }).enable();

// Create new Entry into the asyncHooksStorage and link with the currentEntry property
asyncHooksStorage.newEntry = type => {
  asyncHooksStorage.currentEntry = new AsyncHooksEntry(type);
  asyncHooksStorage.entries[asyncHooks.executionAsyncId()] = asyncHooksStorage.currentEntry;
  return asyncHooksStorage.currentEntry;
};

// Get an asyncHookStorage entry or return undefined
asyncHooksStorage.getEntry = key => {
  return ((asyncHooksStorage.currentEntry && asyncHooksStorage.currentEntry.context) ? asyncHooksStorage.currentEntry.context.get(key) : undefined);
}

// Set a new asyncHookStorage entry
asyncHooksStorage.setEntry = (key, value) => {
  if (asyncHooksStorage.currentEntry && asyncHooksStorage.currentEntry.context) {
    asyncHooksStorage.currentEntry.context.set(key, value);
    return true;
  } else {
    return false;
  }
}

module.exports = asyncHooksStorage;