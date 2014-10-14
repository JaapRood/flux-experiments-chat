var _ = require('lodash');
	invariant = require('app/lib/bly/lib/invariant');

var internals = {};

exports = module.exports = internals.StoresManager = function(app, stores) {

	this.get = this.get.bind(this);

	var getStore = this.get;

	// setup stores
	this.instances = _.map(stores, function(storeConstructor) {
		return new storeConstructor(getStore);
	});

	// index by name
	this.byName = _.indexBy(this.instances, function(store) {
		return store.constructor.storeName || _.uniqueId('store_');
	});

	// register their handlers
	this.handlerRefs = _.map(this.byName, function(store, name) {
		var handlers = store.constructor.handlers;

		return _.map(handlers, function(handler, actionName) {
			return app.action({
				name: actionName,
				handler: store[handler].bind(store),
				ref: name
			});
		});

	});
}

internals.StoresManager.prototype.get = function(name) {
	if (_.isFunction(name)) {
		// accept functions that have a 'storeName' attribute
		name = name.storeName;
	}

	invariant(name, "A name (string) or function with a 'storeName' property is required to get a store");

	var store = this.byName[name];

	if (!store) {
		throw new Error("Can't find store '"+ name +"'");
	}

	return store;
};

internals.StoresManager.prototype.getAll = function(name) {
	return this.byName;
};