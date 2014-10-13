var React = require('react'),
	ChatApp = require('./components/ChatApp.react'),
	FluxContext = require('./lib/flux-context'),
	Stores = require('./stores'),
	StoresManager = require('./stores-manager'),
	StoreNames = require('./store-names'),
	ThreadsActions = require('./action-creators/threads'),
	Bly = require('app/lib/bly');

var ExampleData = require('./example-data'),
	Api = require('./utils/api');


var app = new Bly.App();

// register stores
var stores = new StoresManager(app, Stores);

// initial data and start
ExampleData.init();

app.start(); // not sure if we're going to really need this idea of starting the app

Api.getAllMessages(function(err, raw_messages) {
	if (err) return console.error(err);

	app.inject('RECEIVE_RAW_MESSAGES', raw_messages);
});

// as soon as the DOM is ready we'll start rendering the app
document.addEventListener('DOMContentLoaded', function() {
	app.render(function() {
		React.renderComponent(
			ChatApp({
				stores: stores.getAll(),
				intentTo: app.inject
			}),

			document.getElementById('react')
		);
	});
});

// var context = new FluxContext({
// 	stores: Stores
// });

// ExampleData.init();
// Api.getAllMessages(context.componentContext);

// // this should probably go else where, but we'll keep  it here for now

// var allThreads = context.dispatcher.getStore(StoreNames.THREADS).getAll();
// var firstThread = allThreads.first();
// context.componentContext.executeAction(ThreadsActions.clickThread, firstThread.get('id'));

// document.addEventListener('DOMContentLoaded', function() {

// 	React.renderComponent(
// 		ChatApp({
// 			app: context.componentContext
// 		}),
// 		document.getElementById('react')
// 	);

// });

// for debugging
window.React = React;
// window.app = context;