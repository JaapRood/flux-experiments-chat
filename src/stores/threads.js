var util = require('util'),
	Actions = require('app/actions'),
	Stores = require('app/store-names'),
	Immutable = require('immutable'),
	MessagesUtils = require('app/utils/messages'),
	_ = require('lodash'),

	IMap = Immutable.Map,
	Vector = Immutable.Vector;

function ThreadsStore(getStore) {
	this.getStore = getStore;
	this.currentId = null;
	this.threads = IMap();
}

ThreadsStore.storeName = Stores.THREADS;

ThreadsStore.handlers = {};
ThreadsStore.handlers[Actions.RECEIVE_RAW_MESSAGES] = 'receiveMessages';
ThreadsStore.handlers[Actions.CLICK_THREAD] = 'openThread';

// util.inherits(ThreadsStore, BaseStore);

ThreadsStore.prototype.dehrydate = function() {
	return {
		currentID: this.currentID,
		threads: this.threads.toJS()
	};
};

ThreadsStore.prototype.rehydrate = function(state) {
	this.currentID = state.currentID;
	this.threads = IMap.from(state.threads);
};

ThreadsStore.prototype.receiveMessages = function(waitFor, rawMessages) {
	var store = this,
		getStore = this.getStore;

	var messagesStore = getStore(Stores.MESSAGES);

	waitFor(Stores.MESSAGES);
	
	var messages = Vector.from(_.map(rawMessages, function(message) {
		return messagesStore.get(message.id);
	}));

	var messagesByThread = messages.groupBy(function(message) {
		return message.get('threadID');
	});

	store.threads = store.threads.merge(messagesByThread.map(function(messagesInThread, threadID) {	
		var firstMessage = messagesInThread.first();

		function createThreadFromMessage(message) {
			return IMap({
				id: threadID,
				name: message.get('threadName'),
				lastMessage: message
			});
		}

		return messagesInThread.reduce(function(thread, message) {
			if (thread.get('lastMessage').get('date') > message.get('date')) {
				return thread;
			} else {
				return createThreadFromMessage(message);
			}
		}, createThreadFromMessage(firstMessage));
	}));
};

ThreadsStore.prototype.openThread = function(waitFor, threadID) {
	this.currentID = threadID; // set current id

	this.threads = this.threads.updateIn([threadID, 'lastMessage'], function(lastMessage) {
		return lastMessage.set('isRead', true);
	});
};

ThreadsStore.prototype.get = function(id) {
	return this.threads.get(id);
};

ThreadsStore.prototype.getAll = function() {
	return this.threads;
};

ThreadsStore.prototype.getAllChrono = function() {
	var store = this;

	return this.threads.sort(function(a, b) {
		var aDate = a.getIn(['lastMessage', 'date']),
			bDate = b.getIn(['lastMessage', 'date']);

		if (aDate < bDate) {
			return -1;
		} else if (aDate > bDate) {
			return 1;
		} else {
			return 0;
		}
	});
};

ThreadsStore.prototype.getCurrentID = function() {
	return this.currentID;
};

ThreadsStore.prototype.getCurrentThreadName = function() {
	return this.getCurrent().get('name');
};

ThreadsStore.prototype.getCurrent = function() {
	return this.threads.get(this.getCurrentID());
};

module.exports = ThreadsStore;


// module.exports.register = function(plugin, options) {
// 	var threads = new ThreadsStore();

// 	plugin.action({
// 		name: Actions.RECEIVE_RAW_MESSAGES,

// 		handler: function(waitFor, threads) {
// 			waitFor(MessagesStore.name);
// 		},
// 		ref: ThreadsStore.name
// 	});
// };