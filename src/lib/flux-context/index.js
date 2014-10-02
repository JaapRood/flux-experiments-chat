var createDispatcherType = require('dispatchr'),
	Router = require('routr'),
	_ = require('lodash');

/** 
 * The AppContext is what connects all of the app together as cohesive whole. 
 * An instance of the AppContext is the one thing all modules have access too
 * and behaves as some sort of mediator.
 */

function createAppContext() {
	var Dispatcher = createDispatcherType();

	function AppContext(options) {
		options = options || {};
		this.dispatcher = new Dispatcher(this);
		this.router = new Router(options.routes);
		this.actionContext = this.getActionContext();
		this.componentContext = this.getComponentContext();
		this.storeContext = this.getStoreContext();

		this.registerStores(options.stores || []);
	}

	// Register an array of stores to the context's dispatcher
	AppContext.prototype.registerStores = function(stores) {
		_.each(stores, function(store) {
			if (!Dispatcher.isRegistered(store)) {
				Dispatcher.registerStore(store);
			}
		});
	};

	// Get a version of the context as it's meant to be accesible for a component.
	// This is done so that it's a little bit harder to shoot yourself in the foot, 
	// but hey, if you want to it's still just Javascript
	AppContext.prototype.getComponentContext = function() {
		var context = this,
			dispatcher = this.dispatcher,
			router = this.router;

		return {
			executeAction: function(actionController, payload) {
				actionController(context.actionContext, payload, function(err) {
					if (err) {
						console.error(err);
					}
				});
			},
			getStore: dispatcher.getStore.bind(dispatcher),
			makePath: router.makePath.bind(router)
		};
	};

	// Get a version of the context as it's meant to be accesible for an action.
	// This is done so that it's a little bit harder to shoot yourself in the foot, 
	// but hey, if you want to it's still just Javascript
	AppContext.prototype.getActionContext = function() {
		var context = this,
			dispatcher = this.dispatcher,
			router = this.router;

		return {
			dispatch: dispatcher.dispatch.bind(dispatcher),
			executeAction: function(actionController, payload, done) {
				actionController(context.actionContext, payload, done);
			},
			getStore: dispatcher.getStore.bind(dispatcher),
			router: router,
			makePath: router.makePath.bind(router)
		};
	};


	// Get a version of the context as it's meant to be accesible for a store.
	// This is done so that it's a little bit harder to shoot yourself in the foot, 
	// but hey, if you want to it's still just Javascript
	AppContext.prototype.getStoreContext = function() {
		var dispatcher = this.dispatcher;

		return {
			dispatcher: dispatcher,
			getStore: dispatcher.getStore.bind(dispatcher)
		};
	};

		
	// Extract the state of the stores / dispatcher from the context so that we
	// can transport it and load it again elsewhere. Pretty great for the whole
	// server / client paradigm (dehydrating the context on the server makes
	// for a clever way to get all the app state straight into the client)
	AppContext.prototype.dehydrate = function() {
		return {
			dispatcher: this.dispatcher.dehydrate()
		};
	};

	// Set the state of the stores / dispatcher that has been provided from elsewhere,
	// in most cases a server, but it could be any kind of persistence.
	AppContext.prototype.rehydrate = function(context) {
		this.dispatcher.rehydrate(context.dispatcher || {});
	};

	return AppContext;
}


module.exports = function(options) {
	var AppContext = createAppContext();

	return new AppContext(options);
};