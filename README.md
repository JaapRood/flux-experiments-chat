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

