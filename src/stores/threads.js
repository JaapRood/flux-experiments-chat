var util = require('util'),
	BaseStore = require('dispatchr/utils/BaseStore');

function ThreadsStore(dispatcher) {
	this.dispatchr = dispatcher;
	this.currentId = null;
	this.threads = {};
}


ThreadsStore.storeName = 'threads';
ThreadsStore.handlers = {
	'RECEIVE_MESSAGES': 'receiveMessages',
	'OPEN_THREAD': 'openThread'
};

util.inherits(ThreadsStore, BaseStore);

ThreadsStore.prototype.dehrydate = function() {};

ThreadsStore.prototype.rehydrate = function() {};

ThreadsStore.prototype.receiveMessages = function() {};

ThreadsStore.prototype.openThread = function() {};

ThreadsStore.prototype.get = function(id) {};

ThreadsStore.prototype.getAll = function() {};

ThreadsStore.prototype.getAllChrono = function() {};

ThreadsStore.prototype.getCurrentID = function() {};

ThreadsStore.prototype.getCurrentThreadName = function() {};

ThreadsStore.prototype.getCurrent = function() {};

module.exports = ThreadsStore;