# Flux experiment: Chat

## Warning: extremely unstable. This is me experimenting, and most likely, proving myself wrong, naive and foolish a lot.

This is an experiment in implementing a Flux architecture. Having used it in a couple of projects and learning as I go, I thought it would be a good idea to have a place to reduce all the ideas. Facebook's example `flux-chat` app seemed like the perfect candidate: it's an tiny little chat app that seems to cover most problems I've faced in developing UI's and is, for me, a better indicator than something like TodoMVC.

## Design goals

**Making it easier to create great UI's and app experiences for the end user, and keeping it that way through the course of the project**. That's the most important thing; if I can't imagine how something would actually benefit the end user I probably won't put it in. This doesn't mean that these benefits can sometimes be quite indirect. For example, if something just greatly simplifies the developing experience on my side, that'll make it easier for me to be creative, try different things, pay attention to details, feel happy about my project. All of which I believe in the end contribute to the quality of the final product.

Especially the **keeping it that way** is important, as that's where I see a lot of approaches go down the drain. If in any way possible I highly favour approaches that will make my codebase grow linearly relative to the complexity of the app. There are plenty of frameworks / architectures out there that are very clean and easy to start off with, but as soon as you step outside the bounds of it, doing anything becomes very complex. It should be relatively easily to get started, but more importantly, it should be easy to keep going.

### More specific techniques

Some ideas on how to achieve the above and improve on Facebook's example:

- **Environment agnostic / isomorphic**. A fancy way of saying that I want to be able to run my app on the server as well as in the browser. Enabling server-side rendering of the same code that runs on the client side is really exciting: it dramatically improves first page loads, opens single page apps to be used on public facing sites, all without introducing big amounts of complexity. 

- **Immutable state**. The amounts of time I've lost stepping through apps only to find out that somewhere some object was mutated and by doing so, put the entire app in an unpredicted state. *Mutating state over time is the hardest thing about making apps work well*, so anything we can do to make it harder for ourselves to shoot ourselves in the foot, the better. It's also great that it makes the 'shouldComponentUpdate' method for components really easy, making it easy to only render what should be re-rendered without a big observable mess.

- **RESTful interfaces between parts of the app**. Each part of the app should only be worried about keeping their *own* state, in the same way a browser and a webserver would be. They should be composable, easily swapped out and communicate through means of representational state. Pete Hunt made [a way better argument](https://www.youtube.com/watch?v=IVvHPPcl2TM) than I ever could.

## Environment agnostic

Facebook's reference dispatcher implementation uses a singleton dispatcher, making it very hard to isolate apps per request on the server side. So instead for now we're going with Yahoo's Dispatchr, which is instance based. The instance lives on an 'app' context, which can be created for each single request. 

There are still heaps of improvements that could be made on it:

- Dispatchr does this weird thing where you have to pass a function to `waitFor`, even though all uses I've seen of it are synchronous. If you interpret the idea of Flux strictly, they should always be. Anything that happens later should be handled with separate actions.
- The app context is really rough and it's API needs work. Especially how the 'different' contexts depending on the part of app you are is weirdly done.
- Stores register with Dispatchr which actions they implement and it only broadcasts them to those stores. A departure from Facebook's idea (where the dispatcher just broadcasts to all) that could have some advantages, but these aren't really acted upon. For example: the dispatcher could throw errors early if stores are trying to register for actions that don't exist. But then maybe it should just have broadcast behaviour and the 'handler' subscriptions should be handled by the stores themselves.


## Immutable State

I've implemented the stores with `immutable` Map's and Vector's, however it's all very custom and I think there's generalising that can be done to create a nicer API. 

From a 'simple app' perspective, it would be great if we could create one big immutable Map for the entire state of the app, which we would then just pass straight in as a prop. Something like so (pseudo code):

```js
var state = app.getState();

React.renderComponent(App({ state: state }), el);
```

Such an approach would also open up the doors to stuff like using something like `Bacon.js` to manage state over time.

A first step in making that work is to see if we can create one root Map which holds references to the individual stores, using cursors to let the stores manage state locally while still making it back to the root object.


## A simple App object (Bly?)

Right now we're using AppContex, which is the glue between the pieces of the app. However, lot's of it tailored to the exact app, and to change any of it, you'll have to change the context. The idea of the app's components being RESTful got me thinking: with immutable models and React as a view layer, we *are* starting to look more like the server. So what if we provided a very minimalistic framework as they exist for HTTP servers like Hapi / Express (or others in other languages) and applied some of those same ideas to the client side with Flux. Instead of Requests, you'd have Actions, instead of registering for Routes, you register for action names. 

I've tried the Hapi framework in a couple of places now and am really impressed with how it gives you just all you need to do the basics well. It's pretty unopinionated (at least in my view) about how to build the rest of your server, which makes it a great little framework to build the rest of your application on. All it's concerned with is doing the few things that HTTP servers all do well, and extensively. 

What I like about Hapi that I think could be of great benefit:

- **How it does code organisation through it's plugins.** There is basically a `server` interface, which has some basics like `server.route()` to register a handler for a given route, `server.state()` to handle state, `server.log()` to do logging, among some other things. What is really impressive, though, is `server.register()`, which allows you to register a plugin. A plugin definition is a function with the signature of `function(plugin, options, next)`. The `plugin` argument has an interface almost completely the same to `server` with all the same methods described. The result is a really easy way to create units of code in your app and move them around.

- **How it validates the configuration you've made before the server is started**. It's all pretty declarative. Which makes that before the server starts, Hapi can halt that if it sees reason to. For example, it checks whether any of the routes are ambigious, which is a source of unwanted behaviour and subtle bugs (as the order in which the handlers are executed can start to matter). 


### What would that look like?

```js

// create an app
var app = Bly.createApp();

// register for an action
app.action({
	name: 'RECEIVE_RAW_MESSAGES',
	handler: function(action) {},
	validate: {
		payload: Joi.schema()
	}
});

// define how the app is to be rendered
app.render(function(state) {
	React.renderComponent(AppComponent({
		state: state,
		injectAction: app.inject
	}), document.documentElement);
});

// start the app
app.start(function(err) {
	if (err) { // if anything went wrong setting it all up
		return console.log(err);
	}

	// execute an action
	app.inject({
		name: 'RECEIVE_MESSAGES',
		payload: [message1, message2]
	});

});

```

The API above are the things I'm pretty certain about. The app itself will let you register for actions and includes a dispatcher of its own. The thing that I'm not sure about is how to add stores to the equation. We could do something like `app.state('messages', MessagesStore)`, but then maybe they should just be defined as plugins. I guess we'll just have to start building this thing and find out.

### Plugins

With having the basics up and running for Bly, the more I'm thinking we'd benefit from the Hapi plugin system, something that served as one of the initial reasons to try this kind of approach. I'm actually skeptical that this simple chat app really warrants it. The solution that we have right now where I've simply passed the app object to some constructors in order to clean up the app.js code doesn't have any great drawbacks on this scale.

However, at larger scales it will, and composing various bits of the app becomes harder [citation needed](). Providing a very basic and flexible plugin system in the same way Hapi does could make *growing* and *maturing* apps a lot better, which is something we aspire to do (see goals section).

How about something like the following

```js

// definition
var eating = {
	register: function(plugin, options, next) {
	
		plugin.action({
			name: 'eat',
			handler: function(waitFor, food) {}
		});

		plugin.render(function() {
			React.renderComponent(indicator({}), someOtherElement);
		});

		plugin.register(otherPlugin, function(err) {
			next();
		});
	}
};


// registration
var app = new Bly.App();

app.register(eating);

// passing options to register function

app.register({
	plugin: eating,
	options: {
		desert: 'puppies' // (ohnoes!)
	}
});

// arrays are welcome too
app.register([
	eating,
	drinking
]);

```

### First class store support

I'm wondering whether we'll benefit from proper support for the concept of Stores. So far what we've been doing is try and stay away from this. Because I believe maintaining state is one of the harder to solve problems, I don't think it's something we want to be opinionated about. However, at the same time, the idea of having some concept of a Store is core to the Flux architecture, no matter how it's implemented. 

What I seem to be running into is a limit in how to access stores from the rest of the app, no matter their interface. Could we assume that Stores are always objects with getters, which wraps the actual state it's representing? It does seem to be a real Flux thing where components query stores, and the state in the stores are per *domain*, not state per component. For that to work in the first place you do need an interface to query from, so I think we can assume that.

If so, we could probably facilitate *exposing* and getting access to stores. Could be pretty simple too, API wise.

```js

// getting
app.stores(); // map of all

app.stores('dinner'); // single

// setting
app.stores({ // set all
	dinner: dinnerStore,
	lunch: lunchStore
}); 

app.stores('dinner', dinnerStore);

```

#### Rendering in the plugins

With basic plugin registering support in, it's becoming more evident how plugins can really play the role of dividing the app into multiple logical units, not unlike they do in Hapi. Imagine this the chat app being just a part of the overall app we're building, perhaps like Intercom's messaging client. It would be greatly beneficial if we could just write the `ChatSection` plugin and use it anywhere else in the app where we might require the chat section to be available. 

The main question we face is how do we get the result of an action life cycle to flow back to the app's render method?

Perhaps we should be able to register callbacks to get the resulting state after it was updated through the action flowing through the system.

```js

app.results(function(report) {
	report('stores', storeManager);
});

// or instead of a side effect just return it

app.results(function() {
	return {
		stores: storeManager
	};
});

```
	
The render method could then look something like this

```js

app.render(function(results) {
	React.renderComponent(ChatApp({
		stores: results.stores
	}));
});

```

