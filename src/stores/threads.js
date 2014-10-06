var util = require('util'),
	BaseStore = require('dispatchr/utils/BaseStore'),
	Actions = require('app/actions'),
	stores = require('app/store-names'),
	Immutable = require('immutable'),
	MessagesUtils = require('app/utils/messages'),

	IMap = Immutable.Map,
	Vector = Immutable.Vector;

function ThreadsStore(dispatcher) {
	this.dispatchr = dispatcher;
	this.currentId = null;
	this.threads = IMap();
}

ThreadsStore.storeName = stores.THREADS;

ThreadsStore.handlers = {};
ThreadsStore.handlers[Actions.RECEIVE_MESSAGES] = 'receiveMessages';
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

ThreadsStore.prototype.receiveMessages = function(messages) {
	var store = this,
		dispatcher = this.dispatcher;

	messages = IMap.from(messages);

	var messagesByThread = messages.groupBy(function(message) {
		return message.threadID;
	});

	this.threads = messagesByThread.map(function(messagesInThread, threadID) {	
		var firstMessage = messagesInThread.first();

		function createThreadFromMessage(message) {
			return IMap({
				id: threadID,
				name: message.threadName,
				lastMessage: MessagesUtils.convertRawMessage(message)
			});
		}

		return messagesInThread.reduce(function(thread, message) {
			if (thread.lastMessage.date > message.date) {
				return thread;
			} else {
				return createThreadFromMessage(message);
			}
		}, createThreadFromMessage(firstMessage));
	});

	this.emitChange();
};

ThreadsStore.prototype.openThread = function(payload) {
	this.currentID = payload.threadID;
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
		var aDate = a.lastMessage.date,
			bDate = b.lastMessage.date;

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