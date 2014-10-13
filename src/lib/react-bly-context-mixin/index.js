var createAppContextMixin = require('app/lib/react-app-context-mixin'),
	invariant = require('app/lib/bly/lib/invariant'),
	_ = require('lodash');

var mixin = createAppContextMixin(function(props) {
	invariant(props.app, "Can't find the Bly App to which this component belongs");

	return {
		app: props.app
	};
}, 'appContext');

mixin.stores = function() {
	var context = this.getAppContext();
	invariant(context.app, "Can't find the Bly App to which this component belongs");

	return context.app.stores;
};

mixin.getStore = function(name) {
	var stores = this.stores();
	invariant(stores, "Can't find the stores on the app");

	return stores.get(name);
};

mixin.intentTo = function(actionNameOrCreator) {
	var context = this.getAppContext(),
		app = context.app;

	if (_.isFunction(actionNameOrCreator)) {
		var args = _.toArray(arguments);
		args.unshift(app);

		actionNameOrCreator.apply(null, args);
	} else {
		app.inject.apply(app, arguments);
	}

	return;	
};

module.exports = mixin;