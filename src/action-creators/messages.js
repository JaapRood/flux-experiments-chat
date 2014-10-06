var Actions = require('app/actions'),
	Api = require('app/utils/api'),
	Stores = require('app/store-names'),
	MessagesUtils = require('app/utils/messages');

module.exports = {
	create: function(context, text, done) {
		var threadsStore = context.getStore(Stores.THREADS);

		var message = MessagesUtils.createByText(text, threadsStore.getCurrentID());

		context.dispatch(Actions.RECEIVE_RAW_MESSAGES, [message]);
		Api.createMessage(context, message);

		done();
	},

	receiveAll: function(context, rawMessages, done) {
		context.dispatch(Actions.RECEIVE_RAW_MESSAGES, rawMessages);

		done();
	},

	receiveCreatedMessage: function(context, createdMessage, done) {
		context.dispatch(Actions.RECEIVE_RAW_MESSAGE, [createdMessage]);

		done();
	}
};