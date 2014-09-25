var util = require('util'),
	BaseStore = require('dispatchr/utils/BaseStore'),
	_ = require('lodash');

/**
 * In the way this is implemented, you could make a point that you don't need this particular 
 * store as it doesn't hold any state itself but merely 'extends' the ThreadsStore. However,
 * the idea is to show that stores are allowed to, and should be able to, access other stores 
 * as well.
 */

function UnreadThreadsStore(dispatcher) {
	this.dispatcher = dispatcher;
}

UnreadThreadsStore.storeName = 'unread-threads';
UnreadThreadsStore.handlers = {};

util.inherits(UnreadThreadsStore, BaseStore);

// We don't really hold any state ourselves, so hydration is not that useful, but
// we'll make sure we adhere to the interface of stores
UnreadThreadsStore.prototype.dehydrate = function() { return {}; };
UnreadThreadsStore.prototype.rehydrate = function() {};

UnreadThreadsStore.prototype.getCount = function() {
	var threadsStore = this.dispatcher.getStore('threads');

	var unreadThreads = _.filter(threadsStore, function(thread) {
		return !thread.lastMessage.isRead;
	});

	return unreadThreads.length;
};


module.exports = UnreadThreadsStore;