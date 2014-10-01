var React = require('react'),
	ChatApp = require('./components/ChatApp.react'),
	FluxContext = require('./lib/flux-context'),
	Stores = require('./stores');

var context = new FluxContext({
	stores: Stores
});

document.addEventListener('DOMContentLoaded', function() {

	React.renderComponent(
		ChatApp({
			app: context.componentContext
		}),
		document.getElementById('react')
	);

});