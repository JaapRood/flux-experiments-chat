var Actions = require('app/actions');

module.exports = {
	clickThread: function(app, threadId) {
		app.inject(Actions.CLICK_THREAD, threadId);
	}	
};