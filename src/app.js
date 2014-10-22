var React = require('react'),
	Bly = require('bly'),
	ChatApp = require('./chatapp');

var app = new Bly.App();

app.register([
	ChatApp
], function(err) {
	if (err) throw err; // treat errors registering plugins as unrecoverable event

	app.start();

	// as soon as the DOM is ready we'll start rendering the app
	document.addEventListener('DOMContentLoaded', function() {
		app.render(function(results) {
			React.renderComponent(
				results.chat,

				document.getElementById('react')
			);
		});
	});
});

// for debugging
window.React = React;