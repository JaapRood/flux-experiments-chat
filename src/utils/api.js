
// !!! Please Note !!!
// We are using localStorage as an example, but in a real-world scenario, this
// would involve XMLHttpRequest, or perhaps a newer client-server protocol.
// The function signatures below might be similar to what you would build, but
// the contents of the functions are just trying to simulate client-server
// communication and server-side processing.

module.exports = {

  getAllMessages: function(cb) {
    var MessagesActions = require('app/action-creators/messages');

    // simulate retrieving data from a database
    var rawMessages = JSON.parse(localStorage.getItem('messages'));



    cb(null, rawMessages);
  },

  createMessage: function(message, threadName, cb) {
    var MessagesActions = require('app/action-creators/messages');
    // simulate writing to a database
    var rawMessages = JSON.parse(localStorage.getItem('messages'));
    var timestamp = Date.now();
    var id = 'm_' + timestamp;
    var threadID = message.threadID || ('t_' + Date.now());
    var createdMessage = {
      id: id,
      threadID: threadID,
      threadName: threadName,
      authorName: message.authorName,
      text: message.text,
      timestamp: timestamp
    };
    rawMessages.push(createdMessage);
    localStorage.setItem('messages', JSON.stringify(rawMessages));

    // simulate success callback
    setTimeout(function() {
      cb(null, createdMessage);
      // context.executeAction(MessagesActions.receiveCreatedMessage, createdMessage, function() {});
    }, 0);
  }

};