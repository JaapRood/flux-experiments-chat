/**
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @jsx React.DOM
 */

var React = require('react');
var ReactFluxMixin = require('app/lib/react-flux-context-mixin');

var MessageComposer = require('./MessageComposer.react');
var MessageListItem = require('./MessageListItem.react');
var MessageStore = require('app/stores/messages');
var ThreadStore = require('app/stores/threads');

function getStateFromStores(context) {
  var messagesStore = context.getStore(MessageStore),
    threadsStore = context.getStore(ThreadStore);

  return {
    messages: messagesStore.getAllForCurrentThread(),
    thread: threadsStore.getCurrent()
 };
}

function getMessageListItem(message) {
  return (
    <MessageListItem
      key={message.id}
      message={message}
    />
  );
}

var MessageSection = React.createClass({

  mixins: [ReactFluxMixin],

  getInitialState: function() {
    return getStateFromStores(this.getAppContext());
  },

  componentDidMount: function() {
    this._scrollToBottom();
    this.getStore(MessageStore).addChangeListener(this._onChange);
    this.getStore(ThreadStore).addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    this.getStore(MessageStore).removeChangeListener(this._onChange);
    this.getStore(ThreadStore).removeChangeListener(this._onChange);
  },

  render: function() {
    var messageListItems = this.state.messages.map(getMessageListItem);
    return (
      <div className="message-section">
        <h3 className="message-thread-heading">{this.state.thread.get('name')}</h3>
        <ul className="message-list" ref="messageList">
          {messageListItems.toArray()}
        </ul>
        <MessageComposer />
      </div>
    );
  },

  componentDidUpdate: function() {
    this._scrollToBottom();
  },

  _scrollToBottom: function() {
    var ul = this.refs.messageList.getDOMNode();
    ul.scrollTop = ul.scrollHeight;
  },

  /**
   * Event handler for 'change' events coming from the MessageStore
   */
  _onChange: function() {
    this.setState(getStateFromStores(this.getAppContext()));
  }

});

module.exports = MessageSection;