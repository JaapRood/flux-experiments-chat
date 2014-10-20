var util = require('util'),
	Actions = require('app/actions'),
	MessagesUtils = require('app/utils/messages'),
	Stores = require('app/store-names'),
	Immutable = require('immutable'),
	_ = require('lodash'),

	IMap = Immutable.Map,
	Vector = Immutable.Vector;

function MessageStore(getStore) {
	this.getStore = getStore;
	this.messages = IMap();
	this.sortedByDate = Vector();
}

MessageStore.storeName = Stores.MESSAGES;

exports = module.exports = MessageStore;

exports.pluginName = MessageStore.storeName;
exports.register = function(plugin, options, next) {
	var store = new MessageStore(plugin.stores);

	// make ourselves available using our name
	plugin.stores(MessageStore.storeName, store);


	// register for actions
	plugin.action({
		name: Actions.RECEIVE_RAW_MESSAGES,
		ref: MessageStore.storeName,
		handler: function(waitFor, messages) {
			store.receiveMessages(messages);
		}
	});

	plugin.action({
		name: Actions.CLICK_THREAD,
		ref: MessageStore.storeName,
		handler: function(waitFor, threadID) {
			store.openThread(threadID);
		}
	});

	plugin.action({
		name: Actions.CREATE_MESSAGE,
		ref: MessageStore.storeName,
		handler: function(waitFor, message) {
			store.createMessage(message);
		}
	});

	next();
};


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
};

MessageStore.prototype.openThread = function(threadID) {
	var messagesInThread = this.getAllForThread(threadID);

	this.messages = this.messages.withMutations(function(messages) {
		messagesInThread.forEach(function(message) {
			var newMessage = message.set('isRead', true);
			messages.set(message.get('id'), newMessage);
		});
	});
};

MessageStore.prototype.createMessage = function(message) {
	this.messages = this.messages.set(message.get('id'), message);
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
	var threadsStore = this.getStore(Stores.THREADS);

	return threadsStore.getCurrentID();
};

