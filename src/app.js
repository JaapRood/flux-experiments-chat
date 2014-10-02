var React = require('react'),
	ChatApp = require('./components/ChatApp.react'),
	FluxContext = require('./lib/flux-context'),
	Stores = require('./stores');

var ExampleData = require('./example-data'),
	Api = require('./utils/api');


var context = new FluxContext({
	stores: Stores
});

ExampleData.init();
Api.getAllMessages(context.componentContext);


document.addEventListener('DOMContentLoaded', function() {

	React.renderComponent(
		ChatApp({
			app: context.componentContext
		}),
		document.getElementById('react')
	);

});