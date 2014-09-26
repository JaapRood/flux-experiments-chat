var Actions = require('app/actions');

module.exports = {
	clickThread: function(context, threadId, done) {
		context.dispatch(Actions.CLICK_THREAD, threadId);

		done();
	}	
};