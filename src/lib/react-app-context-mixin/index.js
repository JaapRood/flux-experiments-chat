var React = require('react'),
    cloneWithProps = require('react/lib/cloneWithProps');

/**
 * Create a mixin for React that will transport your definition of your app's
 * context over a prop of your choosing. 
 * @param  [function]     getNewAppContext  Function with signature `function(component) {}`
 *                                          that returns an instane of your app context. 
 *                                          Defaults to a function that returns an empty object.
 *
 * @param  [type]         prop              The property used to transport the context over
 *                                          either `this.context` or `this.props`. Defaults to 
 *                                          `app`
 * @return [object]                         A React component mixin
 */
function createMixin(getNewAppContext, prop) {
    if (!getNewAppContext) {
        // by default just a function that returns an empty object
        getNewAppContext = function(props) { return {}; };
    }

    // by default use the 'app' property for transport
    if (!prop) prop = 'app';


    var mixin = {
        getChildContext: function() {
            var context = {};
            context[prop] = this.getAppContext();

            return context;
        },

        getAppContext: function() {
            if (this.props[prop]) {
                return this.props[prop];
            } else if (this.context[prop]) {
                return this.context[prop];
            } else {
                return getNewAppContext(this.props);
            }
        },

        cloneWithContext: function(component, props) {
            if (!props) props = {};
            props[prop] = this.getAppContext();

            return cloneWithProps(component, props);
        },

        contextTypes: {},
        childContextTypes: {}
    };

    mixin.contextTypes[prop] = React.PropTypes.object;
    mixin.childContextTypes[prop] = React.PropTypes.object;

    return mixin;
}

module.exports = createMixin;