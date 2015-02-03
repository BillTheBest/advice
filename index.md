<div class="project-name">
Advice
</div>
<div class="intro">
<i>Based on the Advice <a href="https://github.com/twitter/flight/blob/master/lib/advice.js" target="_blank">functional mixin library</a> by <a href="https://twitter.com/angustweets" target="_blank">Angus Croll</a>.</i>
Advice makes it possible to to encapsulate behaviors on objects in the form of functional 'mixins' giving us composability and code reuse.
</div>

## Source ##

Read the annotated source [here](doc/advice.js.html)

## Usage ##

There are a number of ways of adding advice to an object. But first, one must add the advice API to a given object class.
```javascript
Advice.addAdvice(recipientOfAdvice);
```

A simple example of using Advice on a constructor might be adding logging functionality to views in your application.

Lets say MyApp.ButtonClass is the constructor used for button views in your application and have a clickHandler method that is called when clicked. You can then do the following using advice:
```javascript
Advice.addAdvice(MyApp.ButtonClass);
MyApp.ButtonClass.after({
	clickHandler: function() {
		console.log(this, ' was clicked');
	}
})
```
Now any time an instance of MyApp.Button is clicked it will log the event to the console. This is very useful in situations where you want to reuse a piece of common functionality across objects. 
Lets look at a more complex example using a **"mixin"** which is essentially a function that is called in the scope of the recipient.  Since the recipient already has advice loaded onto it, one just has to call the desired advice methods using *this*.

Here's a list of the available methods that are added onto an object using **.addAdvice(targetObject)**:

| Type      |  Behavior  |
| ------------ | ------------------------------------------------------------------------------------------- |
| before    | Adds on the supplied method to be called before the original method(s) run |
| after       |  Adds on the supplied method to be called after the original method(s) have run |
| clobber   |  Overwrites the original properties of an object |
| around    |  Adds on the supplied method instead of the super method, but passes a reference to the original method as the first argument followed by the arguments the method was called with |
| addToObj | Extends the keys of an object with the keys of the provided object |
| setDefaults | Adds properties (methods, objects, etc) to the constructor if they don't already exist |
| mixin | Pass an array of mixins that should be mixed in to the target object |

```	javascript
// Add advice to the views in our framework
Advice.addAdvice(MyApp.View);

// Define our logging mixin
var loggingMixin = function(options) {
	this.after({
		initialize: function() {
			logger.log('Initialized ' + this.name) // Log initialized view
		}
	})
};
var myViewClass1 = MyApp.View.extend({
	name: 'view1'
});
var myViewClass2 = MyApp.View.extend({
	name: 'view2'
});
// Apply the mixin to the desired views
myViewClass1.mixin(loggingMixin); // Add logging to myViewClass1

// Instantiate the views
var view1 = new myViewClass1(); // Logs "Initialized view1"
var view2 = new myViewClass2(); // Doesn't log anything

```

Lets take a more complex example using the Backbone framework.


```javascript
// add the mixin capability (may already be done for you)
Advice.addAdvice(Backbone.View)

// define a mixin
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


var Speaker = Backbone.View.extend({
	name: 'Bob White' // the set defaults won't override this
}).mixin([
	namer
], { // options passed in
	times: 3
});

var bob = new Speaker();
bob.speak();  // Hello Bob
              // for the 4th time

```

You can even call addToObj, clobber, setDefaults, after, before and around straight on the constructor rather than creating the mixin function:

```javascript
var ShoutName = Speaker.extend().around('getName', function(orig) {
	return orig().toUpperCase();
});
```

We can also setup a sort of pseudo inheritance between mixins, say we wanted the previous example to work on it's own we could do this:

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

Mixins will keep a record of what has been put on, so a mixin will only be applied once (this may cause issues if you'd like to re-apply a mixin with a different set of options).

notice that we're extending before the mixin to get the right prototype chain before mixing in.

Mixins can also be objects like this:

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

Be careful though, only mixins that were defined as functions are able to see if they have been applied before. To fix this you can return the object from a function:

```javascript
var myMixinFn = function() {
	return myMixin;
}
```

or even use the return method to pass in the options object:

```javascript
var myMixinFn = function(options) {
	return {
		setDefaults: {
			number: options.number
		}
	};
}
```