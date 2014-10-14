var _ = require('lodash'),
	Immutable = require('immutable');

// Immutable mixin for React components to optimise rendering. Adapted from [mattsenior's `react-bacon-mori`][1] 
// experiment to work with Immutable.js instead of Mori. 
// 
// [1]: https://github.com/mattsenior/react-bacon-mori/



function hasChanged(current, next) {
	// check all own properties
	return _.some(current, function(currentValue, key) {
		var nextValue = next[key];

		// default to true if we're not dealing with an immutable sequence
		if (!(currentValue instanceof Immutable.Sequence) || !(nextValue instanceof Immutable.Sequence)) {


			// numbers and strings are immutable
			if (_.isNumber(currentValue) || _.isString(currentValue)) {
				return currentValue === nextValue;
			} 

			return true;
		}

		// check for equality
		return !Immutable.is(currentValue, nextValue);
	});
}


module.exports = {
	shouldComponentUpdate: function(nextProps, nextState) {
		// If both the props and state haven't changed, there is no need to update.
		return _.some([
			[this.props, nextProps],
			[this.state, nextState]
		], function(currentAndNext) {
			return hasChanged.apply(this, currentAndNext);
		});
	}
};