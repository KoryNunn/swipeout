# swipeout

Basic swipeable interaction helper

## Usage

See the example folder for usage.

var swipeout = require('swipeout');

```
var destroy = swipeout(targetElement, function(type, event){

    type; -> 'drag' or 'rebound'

    event; -> {
        x: position x
        y: position y
        pause: function, pause momentum
        resume: function, resume momentum
        preventDefault: function, prevent default on the event.
    }

});

destroy; -> function, destroy the swipeout
```