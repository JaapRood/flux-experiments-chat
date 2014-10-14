var React = require('react'),
	ChatApp = require('./components/ChatApp.react'),
	Stores = require('./stores'),
	StoresManager = require('./stores-manager'),
	StoreNames = require('./store-names'),
	ThreadsActions = require('./action-creators/threads'),
	MessagesActions = require('./action-creators/messages'),
	Bly = require('app/lib/bly');

var ExampleData = require('./example-data'),
	Api = require('./utils/api');


var app = new Bly.App();

// register stores (app should probably have a 'safe' place to attach properties to)
app.stores = new StoresManager(app, Stores);

// initial data and start
ExampleData.init();

app.start(); // not sure if we're going to really need this idea of starting the app

Api.getAllMessages(function(err, rawMessages) {
	if (err) return console.error(err);

	MessagesActions.receiveAll(app, rawMessages)

	var allThreads = app.stores.get(StoreNames.THREADS).getAll();
	var firstThread = allThreads.first();

	ThreadsActions.clickThread(app, firstThread.get('id'));
});


// as soon as the DOM is ready we'll start rendering the app
document.addEventListener('DOMContentLoaded', function() {
	app.render(function() {
		React.renderComponent(
			ChatApp({
				app: app
			}),

			document.getElementById('react')
		);
	});
});

// for debugging
window.React = React;
