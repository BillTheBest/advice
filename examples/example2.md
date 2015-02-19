# Demo

<div class="clear"></div>
<div class="left">
	In the demo, the first button has both the clicking and logging functionality.
	Whereas the second button has only the clicking functionality.
	In this way, we can use mixins to selectively add functionality.
</div>
<iframe src="../demos/demo2.html" class="demo-frame" style="display:inline-block;"></iframe>

<div class="clear"></div>

# Code

<div class="clear"></div>

A simple example of using Advice on a constructor might be adding logging functionality to a Backbone view.

Lets say we have 2 different button classes used for buttons in your application. We can then add on functionality selectively to them using mixins.


<div class="left">
Add advice to the views in our framework
</div>

```javascript
    Advice.addAdvice(Backbone.View);
```

<div class="left">
Define our click mixin
</div>

```javascript
  var clickMixin = function(options) {

        this.addToObj({
            events: {
                "click": "clickHandler"
            }
        });
        this.after({
            clickHandler: function() {
                alert(this.name + ' was clicked');
            }
        })
    };
```

<div class="clear"></div>
<div class="left">
Define our logging mixin
</div>

```javascript
 var loggingMixin = function(options) {
        this.after({
            clickHandler: function() {
                alert(this.name + ' was logged');
            }
        })
    };
```
<div class="clear"></div>

<div class="left">
Define the constructor for our first button type
</div>

```javascript
  var Buttons1 = Backbone.View.extend({
        tagName: 'button',
        name: 'Button 1',
        render: function() {
            this.$el.html(this.name);
            return this;
        }
    })
		.mixin([clickMixin, loggingMixin]);
```
<div class="clear"></div>
<div class="left">
Define the constructor for our second button type
</div>
```javascript
var Buttons2 = Backbone.View.extend({
        tagName: 'button',
        template: 'Button 2',
        name: 'Button 2',
        render: function() {
            this.$el.html(this.name);
            return this;
        }
    })
		.mixin(clickMixin);
```
<div class="clear"></div>
<div class="left">
Instantiate our buttons and add them to the page
</div>
```javascript
    var btn1 = new Buttons1();
    var btn2 = new Buttons2();

    $(document.body).append(btn1.render().el);
    $(document.body).append(btn2.render().el);
```