var React = require('react');
var ChatApp = require('./components/ChatApp.react');

document.addEventListener('DOMContentLoaded', function() {

	React.renderComponent(
		ChatApp({}),
		document.getElementById('react')
	);

});