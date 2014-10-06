var util = require('util'),
	BaseStore = require('dispatchr/utils/BaseStore'),
	Actions = require('app/actions'),
	MessagesUtils = require('app/utils/messages'),
	Stores = require('app/store-names'),
	Immutable = require('immutable'),

	IMap = Immutable.Map,
	Vector = Immutable.Vector;


function MessageStore(dispatcher) {
	this.dispatcher = dispatcher;
	this.messages = IMap();
	this.sortedByDate = Vector();
}

MessageStore.storeName = Stores.MESSAGES;

MessageStore.handlers = {};
MessageStore.handlers[Actions.RECEIVE_MESSAGES] = 'receiveMessages';
MessageStore.handlers[Actions.CLICK_THREAD] = 'openThread';

util.inherits(MessageStore, BaseStore);

MessageStore.prototype.dehydrate = function() {
	return {
		messages: this.messages.toJS(),
		sortedByDate: this.sortedByDate.toJS()
	};
};

MessageStore.prototype.rehydrate = function(state) {
	this.messages = IMap.from(state.messages);
	this.sortedByDate = Vector.from(state.sortedByDate);
};

MessageStore.prototype.receiveMessages = function(messages) {
	var store = this;

	var currentThreadId = store.getCurrentThreadID();

	this.messages = this.messages.merge(
		IMap.from(messages).map(function(message) {
			return MessagesUtils.convertRawMessage(message, currentThreadId);
		})
	);

	// Immutable.js gives us OrderedMaps, which might be a candidate to replace this?
	this.sortedByDate = Vector.from(this.messages.keySeq())
		.sort(function(a, b) {
			var dateA = this.messages.getIn([a, 'date']),
				dateB = this.messages.getIn([b, 'date']);

			if (dateA < dateB) {
				return -1;
			} else if (dateA > dateB) {
				return 1;
			} else {
				return 0;
			}
		});

	this.emitChange();
};

MessageStore.prototype.openThread = function(payload) {
	var threadID = payload.threadID;

	var messagesInThread = this.messages.filter(function(message) {
		return message.threadID === threadID;
	});

	this.messages = this.messages.withMutations(function(messages) {
		messagesInThread.forEach(function(message, messageID) {
			var newMessage = message.set('isRead', true);
			messages.set(messageID, newMessage);
		});
	});

	this.emitChange();
};

MessageStore.prototype.getAll = function() {
	return this.messages;
};

MessageStore.prototype.get = function(id) {
	return this.messages.get(id);
};

MessageStore.prototype.getAllForThread = function(threadId) {
	var messages = this.messages;

	return this.sortedByDate.map(function(messageId) {
			return messages.get(messageId);
		})
		.filter(function(message) {
			return message.threadID === threadID;
		});
};

MessageStore.prototype.getAllForCurrentThread = function() {
	var currentThreadId = this.getCurrentThreadID();

	return this.getAllForThread(currentThreadId);
};

MessageStore.prototype.getCurrentThreadID = function() {
	var threadsStore = this.dispatch.getStore(stores.THREADS);

	return threadsStore.getCurrentID();
};


module.exports = MessageStore;
