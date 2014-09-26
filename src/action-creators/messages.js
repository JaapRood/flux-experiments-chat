var Actions = require('app/actions'),
	Api = require('app/utils/api');

module.exports = {
	create: function(context, text, done) {
		context.dispatch(Actions.CREATE_MESSAGE, payload);

		var message = context.getStore('messages').getCreatedMessageData(text);
		Api.createMessage(context, message);

		done();
	},

	receiveAll: function(context, rawMessages, done) {
		context.dispatch(Actions.RECEIVE_RAW_MESSAGES, rawMessages);

		done();
	},

	receiveCreatedMessage: function(context, createdMessage, done) {
		context.dispatch(Actions.RECEIVE_RAW_CREATED_MESSAGE, createdMessage);

		done();
	}
};