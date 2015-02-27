# Demo

<div class="clear"></div>
<div class="left">
	Here's the output of the code example below
</div>
<iframe src="../resources/demos/demo1.html" class="demo-frame" style="display:inline-block; width: 400px; height: 400px;"></iframe>

<div class="clear"></div>

# Code

<div class="clear"></div>

We hook into the methods of the Date object and call our custom methods before and after `setSeconds` is called.  This allows the ability to add functionality on any existing methods.

*Obviously you should never apply advice to a Primitive, but you get the idea

<div class="left">

Add advice to the Date object, define our advice, running before and after `setSeconds` is called, then create a new date and call the `setSeconds` method

</div>

```javascript
  Advice.addAdvice(Date);

  Date.before({
      setSeconds:function(val){
          log('setSeconds() will be called, value will be set to ' + val);
      }
  }).after({
      setSeconds:function(val){
          log('setSeconds() was called, value was set to ' + val);
      }
  });

  var s = new Date();
  s.setSeconds(3);
```

<div class="clear"></div>

As you see in the output, our methods are called before and after the `setSeconds` method.

---

###Now, on to a more realistic example:

<div class="left">
Define the constructor and prototype for a base Animal class
</div>

```javascript
  var Animal = function(){
      this.initialize();
  };

  Animal.prototype = {
      type:"mammal",
      initialize:function(){
          log('A ' + this.type + ' has been brought into this world.');
      },
      speak:function(){
          log(this.type + ' has something to say.');
      }
  };
```
<div class="clear"></div>
<div class="left">
Add advice to the base Animal class, instantiate and call speak()
</div>
```javascript
    Advice.addAdvice(Animal);

    var animal = new Animal();//console: A mammal has been brought into this world.
    animal.speak();//console: mammal has something to say.
```
<div class="clear"></div>
<div class="left">
Now create a Cat class that is a subclass of Animal and apply some Advice methods:
</div>
```javascript
    var Cat = function(){
        Animal.apply(this,arguments);
    };

    Cat.prototype = _.create(Animal,{
        constructor:Cat,
        meow:function(){
            log("meow");
        }
    }).before({
        initialize:function(){
            this.type = "cat";
        }
    }).clobber({
        speak:function(){
            this.meow();
        }
    });
```

<div class="clear"></div>
<div class="left">
Instantiating the Cat class will call initialize before it's super and change the type, modifying the initialize log method
</div>
```javascript
   var cat = new Cat(); //console: A cat has been brought into this world
```

<div class="clear"></div>
<div class="left">
Calling the speak method will use the clobbered speak method on Cat and never call the super speak method. Cat.speak also calls an local method, meow.
</div>
```javascript
  cat.speak(); //console: meow
```