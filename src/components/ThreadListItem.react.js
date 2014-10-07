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

var ThreadsActions = require('app/action-creators/threads');
var React = require('react');
var ReactFluxMixin = require('app/lib/react-flux-context-mixin');
var ImmutableMixin = require('app/lib/react-immutable-mixin');

var cx = require('react/lib/cx');

var ReactPropTypes = React.PropTypes;

var ThreadListItem = React.createClass({

  mixins: [ReactFluxMixin, ImmutableMixin],

  propTypes: {
    thread: ReactPropTypes.object,
    currentThreadID: ReactPropTypes.string
  },

  render: function() {
    var thread = this.props.thread;
    var lastMessage = thread.get('lastMessage');
    return (
      <li
        className={cx({
          'thread-list-item': true,
          'active': thread.get('id') === this.props.currentThreadID
        })}
        onClick={this._onClick}>
        <h5 className="thread-name">{thread.get('name')}</h5>
        <div className="thread-time">
          {lastMessage.get('date').toLocaleTimeString()}
        </div>
        <div className="thread-last-message">
          {lastMessage.get('text')}
        </div>
      </li>
    );
  },

  _onClick: function() {
    this.intentTo(ThreadsActions.clickThread, this.props.thread.get('id'));
  }

});

module.exports = ThreadListItem;
