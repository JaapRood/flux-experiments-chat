var ChatApp = require('./components/ChatApp.react'),
	Stores = require('./stores'),
	StoreNames = require('./store-names'),
	ThreadsActions = require('./action-creators/threads'),
	MessagesActions = require('./action-creators/messages'),
	Api = require('./utils/api'),
	ExampleData = require('./example-data');

// populate with debug data
ExampleData.init();

exports.name = 'chatapp';

exports.register = function(plugin, options, next) {

	plugin.register([
		Stores
	], function(err) {
		if (err) return next(err); // treat errors registering plugins as unrecoverable event

		plugin.after(function() {

			Api.getAllMessages(function(err, rawMessages) {
				if (err) return console.error(err);

				MessagesActions.receiveAll(plugin, rawMessages)

				var allThreads = plugin.stores(StoreNames.THREADS).getAll();
				var firstThread = allThreads.first();

				ThreadsActions.clickThread(plugin, firstThread.get('id'));
			});
		});

		// render the chat app
		plugin.results(function(report) {
			report('chat', ChatApp({
				bly: plugin
			}));
		});

		next();
	});
}