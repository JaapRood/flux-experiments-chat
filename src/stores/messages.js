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
MessageStore.handlers[Actions.CREATE_MESSAGE] = 'createMessage';

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

	var newMessages = IMap.from(_.zip(
		messageIds,
		_.map(messages, function(message) {
			return IMap.from(MessagesUtils.convertRawMessage(message, currentThreadId));
		})
	));

	this.messages = this.messages.merge(newMessages);

	// Immutable.js gives us OrderedMaps, which might be a candidate to replace this?
	this.sortedByDate = Vector.from(this.messages.keySeq())
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

	this.emitChange();
};

MessageStore.prototype.openThread = function(threadID) {
	var messagesInThread = this.getAllForThread(threadID);

	this.messages = this.messages.withMutations(function(messages) {
		messagesInThread.forEach(function(message) {
			var newMessage = message.set('isRead', true);
			messages.set(message.get('id'), newMessage);
		});
	});

	this.emitChange();
};

MessageStore.prototype.createMessage = function(message) {
	this.messages = this.messages.set(message.get('id'), message);

	this.emitChange();
};

MessageStore.prototype.getAll = function() {
	return this.messages;
};

MessageStore.prototype.get = function(id) {
	return this.messages.get(id);
};

MessageStore.prototype.getAllForThread = function(threadID) {
	var messages = this.messages;

	return this.sortedByDate.map(function(messageId) {
		return messages.get(messageId);
		})
		.filter(function(message) {
			return message.get('threadID') === threadID;
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
