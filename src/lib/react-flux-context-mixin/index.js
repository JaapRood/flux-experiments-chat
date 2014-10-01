var FluxAppContext = require('app/lib/flux-context'),
	createAppContextMixin = require('app/lib/react-app-context-mixin');

var mixin = createAppContextMixin(function() {
	var appContext = new FluxAppContext();
	return appContext.componentContext;
});

// short cut to expressing an intent to do something
mixin.intentTo = function() {
	var context = this.getAppContext();
	return context.intentTo.apply(context, arguments);
};

mixin.getStore = function() {
	var context = this.getAppContext();
	return context.getStore.apply(context, arguments);
};

module.exports = mixin;