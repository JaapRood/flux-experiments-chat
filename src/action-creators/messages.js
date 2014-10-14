var Actions = require('app/actions'),
	Api = require('app/utils/api'),
	Stores = require('app/store-names'),
	MessagesUtils = require('app/utils/messages');

var MessagesActions = {
	create: function(app, text, done) {
		var threadsStore = app.stores.get(Stores.THREADS);

		var message = MessagesUtils.createByText(text, threadsStore.getCurrentID());

		Api.createMessage(message, null, function(err, message) {
			if (err) return console.error(err);

			MessagesActions.receiveCreatedMessage(app, message);
		});
	},

	receiveAll: function(app, rawMessages) {
		app.inject(Actions.RECEIVE_RAW_MESSAGES, rawMessages);
	},

	receiveCreatedMessage: function(app, createdMessage) {
		app.inject(Actions.RECEIVE_RAW_MESSAGES, [createdMessage]);
	}
};

module.exports = MessagesActions;