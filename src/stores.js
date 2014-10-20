var _ = require('lodash');

var stores = [
	require('./stores/threads'),
	require('./stores/unread-threads')
];

exports.register = function(plugin, options, next) {
	// create instance for every store
	var storeInstances = _.map(stores, function(storeConstructor) {
		return new storeConstructor(plugin.stores);
	});

	// index by name
	var storesByName = _.indexBy(storeInstances, function(store) {
		return store.constructor.storeName || _.uniqueId('store_');
	});

	// register handlers
	var actionHandlers = _.map(storesByName, function(store, name) {
		var handlers = store.constructor.handlers;

		return _.map(handlers, function(handler, actionName) {
			plugin.action({
				name: actionName,
				handler: store[handler].bind(store),
				ref: name
			});
		});
	});

	// make stores available to rest of the app
	plugin.stores(storesByName);


	// register the stores that register themselves
	plugin.register([
		require('./stores/messages')
	], next);
}

exports.name = 'stores'