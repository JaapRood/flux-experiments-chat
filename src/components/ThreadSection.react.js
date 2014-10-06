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

var MessageStore = require('app/stores/messages');
var ThreadListItem = require('./ThreadListItem.react');
var ThreadStore = require('app/stores/threads');
var UnreadThreadStore = require('app/stores/unread-threads');

function getStateFromStores(context) {
  var threadsStore = context.getStore(ThreadStore),
    unreadThreadsStore = context.getStore(UnreadThreadStore);

  return {
    threads: threadsStore.getAllChrono(),
    currentThreadID: threadsStore.getCurrentID(),
    unreadCount: unreadThreadsStore.getCount()
  };
}

var ThreadSection = React.createClass({

  mixins: [ReactFluxMixin],

  getInitialState: function() {
    return getStateFromStores(this.getAppContext());
  },

  componentDidMount: function() {
    this.getStore(ThreadStore).addChangeListener(this._onChange);
    this.getStore(UnreadThreadStore).addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    this.getStore(ThreadStore).removeChangeListener(this._onChange);
    this.getStore(UnreadThreadStore).removeChangeListener(this._onChange);
  },

  render: function() {
    var threadListItems = this.state.threads.map(function(thread) {
      return (
        <ThreadListItem
          key={thread.id}
          thread={thread}
          currentThreadID={this.state.currentThreadID}
        />
      );
    }, this);
    var unread =
      this.state.unreadCount === 0 ?
      null :
      <span>Unread threads: {this.state.unreadCount}</span>;
    return (
      <div className="thread-section">
        <div className="thread-count">
          {unread}
        </div>
        <ul className="thread-list">
          {threadListItems.toArray()}
          </ul>
      </div>
    );
  },

  /**
   * Event handler for 'change' events coming from the stores
   */
  _onChange: function() {
    this.setState(getStateFromStores(this.getAppContext()));
  }

});

module.exports = ThreadSection;
