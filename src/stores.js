var _ = require('lodash');

var stores = [
	require('./stores/threads'),
	require('./stores/unread-threads')
];

exports.register = function(plugin, options, next) {
	// stores can define themselves as a plugin
	plugin.register([
		require('./stores/messages')
	], function(err) {
		if (err) return next(err);
		// or we can help them do it

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
			
		next();
	});



}

exports.name = 'stores'