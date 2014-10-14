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