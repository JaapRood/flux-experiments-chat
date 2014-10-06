var util = require('util'),
	BaseStore = require('dispatchr/utils/BaseStore'),
	Actions = require('app/actions'),
	Stores = require('app/store-names'),
	Immutable = require('immutable'),
	MessagesUtils = require('app/utils/messages'),
	_ = require('lodash'),

	IMap = Immutable.Map,
	Vector = Immutable.Vector;

function ThreadsStore(dispatcher) {
	this.dispatcher = dispatcher;
	this.currentId = null;
	this.threads = IMap();
}

ThreadsStore.storeName = Stores.THREADS;

ThreadsStore.handlers = {};
ThreadsStore.handlers[Actions.RECEIVE_RAW_MESSAGES] = 'receiveMessages';
ThreadsStore.handlers[Actions.CLICK_THREAD] = 'openThread';

util.inherits(ThreadsStore, BaseStore);

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

ThreadsStore.prototype.receiveMessages = function(rawMessages) {
	var store = this,
		dispatcher = this.dispatcher;

	var messagesStore = dispatcher.getStore(Stores.MESSAGES);

	dispatcher.waitFor(Stores.MESSAGES, function() {
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

		store.emitChange();
	});
};

ThreadsStore.prototype.openThread = function(threadID) {
	this.currentID = threadID;
	this.emitChange();
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