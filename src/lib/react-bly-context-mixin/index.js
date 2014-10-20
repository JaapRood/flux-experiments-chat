var createAppContextMixin = require('app/lib/react-app-context-mixin'),
	invariant = require('app/lib/bly/lib/invariant'),
	_ = require('lodash');

var mixin = createAppContextMixin(function(props) {
	invariant(props.app, "Can't find the Bly App to which this component belongs");

	return {
		app: props.app
	};
}, 'appContext');

mixin.stores = function(name) {
	var context = this.getAppContext();
	invariant(context.app, "Can't find the Bly App to which this component belongs");

	if (_.isFunction(name)) {
		// accept functions that have a 'storeName' attribute
		name = name.storeName;
	}

	invariant(_.isString(name), "Name of store (or function with 'storeName' prop) required to retrieve a store");

	return context.app.stores(name);
};

mixin.intentTo = function(actionNameOrCreator) {
	var context = this.getAppContext(),
		app = context.app,
		args = _.rest(_.toArray(arguments), 1); // get rid of the first argument

	if (_.isFunction(actionNameOrCreator)) {
		args.unshift(app);

		actionNameOrCreator.apply(null, args);
	} else {
		app.inject.apply(app, args);
	}

	return;	
};

module.exports = mixin;