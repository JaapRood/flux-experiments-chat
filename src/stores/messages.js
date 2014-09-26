var util = require('util'),
	BaseStore = require('dispatchr/utils/BaseStore'),
	Actions = require('app/actions');

function MessageStore(dispatcher) {
	this.dispatcher = dispatcher;
	this.messages = {};
	this.sortedByDate = [];
}

MessageStore.storeName = 'messages';

MessageStore.handlers = {};
MessageStore.handlers[Actions.RECEIVE_MESSAGES] = 'receiveMessages';
MessageStore.handlers[Actions.CLICK_THREAD] = 'openThread';

util.inherits(MessageStore, BaseStore);

MessageStore.prototype.dehydrate = function() {};

MessageStore.prototype.rehydrate = function() {};

MessageStore.prototype.receiveMessages = function(messages) {};

MessageStore.prototype.openThread = function() {};

MessageStore.prototype.getAll = function() {};

MessageStore.prototype.get = function(id) {};

MessageStore.prototype.getAllForThread = function(threadId) {};

MessageStore.prototype.getAllForCurrentThread = function() {};


module.exports = MessageStore;
