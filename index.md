<div class="project-header">
    <div class="project-name">Advice</div>
    <div class="intro">
        Advice makes it possible to to encapsulate behaviors on objects in the form of functional 'mixins' giving us composability and code reuse.
        <i>It is based on the Advice <a href="https://github.com/twitter/flight/blob/master/lib/advice.js" target="_blank">functional mixin library</a>
                    by <a href="https://twitter.com/angustweets" target="_blank">Angus Croll</a>.</i>
    </div>
</div>

## Source ##

Read the annotated source <a href="advice.js.html" target="_blank">here</a>


<div class="clear"></div>
<div class="spacer"></div>

## Overview ##

Classical inheritance starts to become complicated when creating complex components, take this for example:

```
               ______BaseList________
              |          |           |
      GroupedList    ImageList    CarouselList
          |                |
    NestedItemList     CarouselImageList

```

This structure is rigid and highly dependent on parent logic. If you wanted to have a GroupedImageList (GroupedList + ImageList) you would have to re-arrange the hierarchy or duplicate code.  The same problem exists for the CarouselImageList, which must duplicate carousel functionality which in this structure could potentially be
a child of either ImageList or CarouselImageList, both choices resulting in code duplication.

Advice enables better separation of inherited functionality by enabling the extraction of shared code and incorporation via mixins instead of through inheritance. Using Advice, the previous component structure can be restructured as:

```
                _______________________ BaseList_________________________
               |          |             |                  |             |
      GroupedList         |         ImageList              |         CarouselList
(BaseList + groupMethods) |  (BaseList + imageMethods)     |    (BaseList + carouselMethods)
                          |                                |
                NestedItemList                         CarouselImageList
 (BaseList + groupMethods + nestedMethods)     (BaseList + carouselMethods + imageMethods)

```

With Advice, adding grouped, nested, carousel or image logic to any other list is as simple as applying the methods with mixins. Code is not duplicated and only affects the scope to which it is added.

## API ##

Here's a list of the available advice API methods that are added onto an object using **Advice.addAdvice(targetObject)**:

| Type      |  Behavior  |
| ------------ | ------------------------------------------------------------------------------------------- |
| before    | Adds the supplied method to be called before the original method(s) run |
| after       |  Adds the supplied method to be called after the original method(s) have run |
| clobber   |  Overwrites the original properties/methods of an object |
| around    |  Adds on the supplied method instead of the super method, but passes a reference to the original method as the first argument followed by the arguments the method was called with |
| addToObj | Extends the keys of an object with the keys of the provided object |
| setDefaults | Adds properties (methods, objects, etc) to the constructor if they don't already exist |
| mixin | Pass an array of mixins that should be mixed in to the target object |


## Usage ##
<div class="left">
There are a number of ways of adding advice to an object. But first, one must add the advice API to a given object class.
</div>

```javascript
Advice.addAdvice(recipientOfAdvice);
```

<div class="clear"></div>

## Examples ##
<a href="docs/basic.md.html">Basic example</a>
<div class="clear"></div>
<a href="docs/simple-backbone.md.html">Simple example with a Backbone app</a>
<div class="clear"></div>
<a href="docs/complex-backbone.md.html">Complex example with a Backbone app</a>
<div class="clear"></div>
