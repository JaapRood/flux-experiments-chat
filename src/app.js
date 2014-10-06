var React = require('react'),
	ChatApp = require('./components/ChatApp.react'),
	FluxContext = require('./lib/flux-context'),
	Stores = require('./stores'),
	StoreNames = require('./store-names'),
	ThreadsActions = require('./action-creators/threads');

var ExampleData = require('./example-data'),
	Api = require('./utils/api');


var context = new FluxContext({
	stores: Stores
});

ExampleData.init();
Api.getAllMessages(context.componentContext);

// this should probably go else where, but we'll keep  it here for now

var allThreads = context.dispatcher.getStore(StoreNames.THREADS).getAll();
var firstThread = allThreads.first();
context.componentContext.executeAction(ThreadsActions.clickThread, firstThread.get('id'));

document.addEventListener('DOMContentLoaded', function() {

	React.renderComponent(
		ChatApp({
			app: context.componentContext
		}),
		document.getElementById('react')
	);

});

// for React debug tools
window.React = React;