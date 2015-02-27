Here is a more complex example using Backbone. 
<div class="left">
Add the mixin capability (may already be done for you)
</div>

```javascript
Advice.addAdvice(Backbone.View)
```

<div class="left">
Be careful though, only mixins that were defined as functions are able to see if they have been applied before. To fix this you can return the object from a function:
</div>

```javascript
var myMixinFn = function() {
	return myMixin;
}
```

<div class="left">
Define a mixin called "namer".
</div>

```javascript
var namer = function(options) {
	// options an object that may be passed in

	// any functions under clobber will be replaced
	this.clobber({
		initialize: function() {
			this.spoke = options.times || 0;
		}
	});

	// these will only be set if there is no existing function
	this.setDefaults({
		name: 'frank',
		getName: function() {
			return this.name;
		},
		speak: function() {
			console.log('hello ' + this.getName());
		}
	});

	// first argument will be the original function - can also take an object of functions
	this.around('getName', function(orig) {
		return orig().split(' ')[0];
	});

	// can even extend objects - useful for adding events
	this.addToObj({
		events: {
			'greeted' :'speak'
		}
	});

	// first argument will be the original function - can also take an object of functions
	this.before('speak', function() {
		this.spoke++;
	});

	// first argument will be the original function - can also take an object of functions
	this.after('speak', function() {
		console.log('for the ' + this.spoke + 'th time');
	});

}
```

<div class="left">
Define our class 'Speaker' and add the namer mixin to it.
Instantiate 'bob', an instance of Speaker and make him speak.
Bob logs Hello Bob for the 4th time because we passed in
the number of times he had already spoken using our mixin.
</div>

```javascript
var Speaker = Backbone.View.extend({
	name: 'Bob White' // the set defaults won't override this
}).mixin([
	namer
], { // options passed in
	times: 3
});
var bob = new Speaker();
bob.speak();  // Hello Bob for the 4th time
```

<div class="left">
You can even call addToObj, clobber, setDefaults, after, before and around straight on the constructor rather than creating the mixin function:
</div>

```javascript
var ShoutName = Speaker.extend().around('getName', function(orig) {
	return orig().toUpperCase();
});
```

<div class="left">
We can also setup a sort of pseudo inheritance between mixins, say we wanted the previous example to work on it's own we could do this:
</div>

```javascript
var shouter = function(options) {

	// pull in any other mixins this one depends on
	this.mixin([
		namer
	], options);

	// now we can decorate
	this.around('getName', function(orig) {
		return orig().toUpperCase();
	});
}

var ShoutName = Backbone.View.extend().mixin([
	shouter
]);
```

<div class="left">
Mixins will keep a record of what has been put on, so a mixin will only be applied once (this may cause issues if you'd like to re-apply a mixin with a different set of options).

Notice that we're extending before the mixin to get the right prototype chain before mixing in.

Mixins can also be objects like this:
</div>

```javascript
var myMixin = {
	clobber: {
		clobbered: true;
	},
	addToObj: {
		events: {
			'click': 'onClick'
		}
	},
	after: {
		'render': function() {
			console.log('rendering done');
		}
	}
};
```

<div class="left">
Be careful though, only mixins that were defined as functions are able to see if they have been applied before. To fix this you can return the object from a function:
</div>

```javascript
var myMixinFn = function() {
	return myMixin;
}
```

<div class="left">
or even use the return method to pass in the options object:
</div>

```javascript
var myMixinFn = function(options) {
	return {
		setDefaults: {
			number: options.number
		}
	};
}
```