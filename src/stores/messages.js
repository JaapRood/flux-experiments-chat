var util = require('util'),
	BaseStore = require('dispatchr/utils/BaseStore'),
	Actions = require('app/actions'),
	MessagesUtils = require('app/utils/messages'),
	Stores = require('app/store-names'),
	Immutable = require('immutable'),
	_ = require('lodash'),

	IMap = Immutable.Map,
	Vector = Immutable.Vector;


function MessageStore(dispatcher) {
	this.dispatcher = dispatcher;
	this.messages = IMap();
	this.sortedByDate = Vector();
}

MessageStore.storeName = Stores.MESSAGES;

MessageStore.handlers = {};
MessageStore.handlers[Actions.RECEIVE_RAW_MESSAGES] = 'receiveMessages';
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

	var messageIds = _.pluck(messages, 'id');

	this.messages = IMap.from(_.zip(
		messageIds,
		_.map(messages, function(message) {
			return IMap.from(MessagesUtils.convertRawMessage(message, currentThreadId));
		})
	));

	// Immutable.js gives us OrderedMaps, which might be a candidate to replace this?
	this.sortedByDate = Vector.from(messageIds)
		.sort(function(a, b) {
			var dateA = store.messages.getIn([a, 'date']),
				dateB = store.messages.getIn([b, 'date']);

			if (dateA < dateB) {
				return -1;
			} else if (dateA > dateB) {
				return 1;
			} else {
				return 0;
			}
		});

	console.log('received messages in messages store');

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
	var threadsStore = this.dispatcher.getStore(Stores.THREADS);

	return threadsStore.getCurrentID();
};


module.exports = MessageStore;
