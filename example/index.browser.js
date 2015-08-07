(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var swipeout = require('../'),
    venfix = require('venfix'),
    translate = require('css-translate'),
    crel = require('crel');


function makeCard(){
    return crel('div', {class: 'card'},
        'Some card with text n stuff'
    );
};


function addCard(){
    var card = makeCard();

    var destroy = swipeout(card, function(type, event){

        if(type === 'drag'){
            event.preventDefault();

            if(event.x > (card.clientWidth * 0.5)){
                card.classList.remove('remove');
                card.classList.add('add');
            }else if(event.x < -(card.clientWidth * 0.5)){
                card.classList.remove('add');
                card.classList.add('remove');
            }else{
                card.classList.remove('remove');
                card.classList.remove('add');
            }
        }

        if(type === 'rebound'){

            if(Math.abs(event.x) > card.clientWidth * 0.5){
                card.classList.add('removed');
                destroy();
                setTimeout(function(){
                    card.remove();
                }, 300);
                addCard();
            }
        }

        card.style[venfix('transform')] = translate('3d', event.x, 0, 0);
    });

    crel(document.body, card);
}

window.onload = function(){
    addCard();
    addCard();
    addCard();
    addCard();
    addCard();
    addCard();
    addCard();
    addCard();
    addCard();
    addCard();
    addCard();
    addCard();
    addCard();
};
},{"../":2,"crel":3,"css-translate":5,"venfix":16}],2:[function(require,module,exports){
var interact = require('interact-js'),
    dirvector = require('dirvector'),
    doc = require('doc-js');

function eventsForTarget(target, events){

    function start(interaction){
        interaction.swipeoutTarget = target;
        events.start(interaction);
    }

    function drag(interaction){
        if(interaction.swipeoutTarget !== target){
            return;
        }

        events.drag(interaction);
    }

    function end(interaction){
        if(interaction.swipeoutTarget !== target){
            return;
        }

        events.end(interaction);
    }

    interact.on('start', target, start);

    interact.on('drag', document, drag);

    interact.on('end', document, end);

    interact.on('cancel', document, end);

    return function(){
        interact.removeListener('start', target, start);

        interact.removeListener('drag', document, drag);

        interact.removeListener('end', document, end);

        interact.removeListener('cancel', document, end);
    };
}

module.exports = function(target, settings, callback){
    if(typeof settings === 'function'){
        callback = settings;
        settings = {};
    }

    var position = {x: 0, y: 0},
        speed = 0,
        destroyed,
        destroyEvents,
        dragging,
        hasMomentum,
        paused,
        director;

    if(settings.director){
        director = settings.director;
    }else{
        director = dirvector(dirvector.horizontal, {
            getPosition: function(event){
                return {
                    x: event.clientX,
                    y: event.clientY
                };
            }
        });
    }

    var handler = function(){
        var args = arguments;
        requestAnimationFrame(function(){
            if(destroyed){
                return;
            }

            callback.apply(null, args);
        });
    };

    function destroy(){
        destroyed = true;
        destroyEvents && destroyEvents();
    }

    function emit(type, position, interaction){
        handler(type, {
            x: position.x,
            y: position.y,
            pause: function(){
                paused = true;
            },
            resume: function(){
                paused = false;
                momentum();
            },
            preventDefault: function(){
                interaction.preventDefault();
            }
        })
    }

    function momentum(){
        if(paused){
            return;
        }

        hasMomentum = true;
        speed += 0.1;

        position.x *= speed / 1.5;
        position.y *= speed / 1.5;

        speed *= 0.9;

        emit('rebound', position);

        if(Math.abs(position.x) < 0.5 && Math.abs(position.y < 0.5)){
            hasMomentum = false;
            return;
        }

        setTimeout(function(){
            momentum()
        }, 1000/60);
    }

    function start(interaction){
        if(destroyed){
            interact.removeListener('start', target, start);
            return;
        }
        dragging = true;
        interaction.swipeTarget = target;
        director.reset();
    }

    var drag = director(function(interaction){
        if(destroyed){
            interact.removeListener('drag', target, drag);
            return;
        }

        if(!dragging || interaction.swipeTarget !== target){
            return;
        }

        var move = interaction.getMoveDelta();

        position.x += move.x;
        position.y += move.y;

        speed = interaction.getSpeed() || 0;

        emit('drag', position, interaction);
    });

    function end(interaction){
        if(destroyed){
            interact.removeListener('end', target, end);
            return;
        }

        dragging = false;
        if(hasMomentum || !position.x && !position.y || interaction.swipeTarget !== target){
            return;
        }

        emit('rebound', position);
        momentum();
    }

    destroyEvents = eventsForTarget(target, {
        start: start,
        drag: drag,
        end: end
    });

    return destroy;
};
},{"dirvector":6,"doc-js":11,"interact-js":15}],3:[function(require,module,exports){
//Copyright (C) 2012 Kory Nunn

//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/*

    This code is not formatted for readability, but rather run-speed and to assist compilers.

    However, the code's intention should be transparent.

    *** IE SUPPORT ***

    If you require this library to work in IE7, add the following after declaring crel.

    var testDiv = document.createElement('div'),
        testLabel = document.createElement('label');

    testDiv.setAttribute('class', 'a');
    testDiv['className'] !== 'a' ? crel.attrMap['class'] = 'className':undefined;
    testDiv.setAttribute('name','a');
    testDiv['name'] !== 'a' ? crel.attrMap['name'] = function(element, value){
        element.id = value;
    }:undefined;


    testLabel.setAttribute('for', 'a');
    testLabel['htmlFor'] !== 'a' ? crel.attrMap['for'] = 'htmlFor':undefined;



*/

(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.crel = factory();
    }
}(this, function () {
    var fn = 'function',
        obj = 'object',
        nodeType = 'nodeType',
        textContent = 'textContent',
        setAttribute = 'setAttribute',
        attrMapString = 'attrMap',
        isNodeString = 'isNode',
        isElementString = 'isElement',
        d = typeof document === obj ? document : {},
        isType = function(a, type){
            return typeof a === type;
        },
        isNode = typeof Node === fn ? function (object) {
            return object instanceof Node;
        } :
        // in IE <= 8 Node is an object, obviously..
        function(object){
            return object &&
                isType(object, obj) &&
                (nodeType in object) &&
                isType(object.ownerDocument,obj);
        },
        isElement = function (object) {
            return crel[isNodeString](object) && object[nodeType] === 1;
        },
        isArray = function(a){
            return a instanceof Array;
        },
        appendChild = function(element, child) {
          if(!crel[isNodeString](child)){
              child = d.createTextNode(child);
          }
          element.appendChild(child);
        };


    function crel(){
        var args = arguments, //Note: assigned to a variable to assist compilers. Saves about 40 bytes in closure compiler. Has negligable effect on performance.
            element = args[0],
            child,
            settings = args[1],
            childIndex = 2,
            argumentsLength = args.length,
            attributeMap = crel[attrMapString];

        element = crel[isElementString](element) ? element : d.createElement(element);
        // shortcut
        if(argumentsLength === 1){
            return element;
        }

        if(!isType(settings,obj) || crel[isNodeString](settings) || isArray(settings)) {
            --childIndex;
            settings = null;
        }

        // shortcut if there is only one child that is a string
        if((argumentsLength - childIndex) === 1 && isType(args[childIndex], 'string') && element[textContent] !== undefined){
            element[textContent] = args[childIndex];
        }else{
            for(; childIndex < argumentsLength; ++childIndex){
                child = args[childIndex];

                if(child == null){
                    continue;
                }

                if (isArray(child)) {
                  for (var i=0; i < child.length; ++i) {
                    appendChild(element, child[i]);
                  }
                } else {
                  appendChild(element, child);
                }
            }
        }

        for(var key in settings){
            if(!attributeMap[key]){
                element[setAttribute](key, settings[key]);
            }else{
                var attr = attributeMap[key];
                if(typeof attr === fn){
                    attr(element, settings[key]);
                }else{
                    element[setAttribute](attr, settings[key]);
                }
            }
        }

        return element;
    }

    // Used for mapping one kind of attribute to the supported version of that in bad browsers.
    crel[attrMapString] = {};

    crel[isElementString] = isElement;

    crel[isNodeString] = isNode;

    return crel;
}));

},{}],4:[function(require,module,exports){
var parseRegex = /^(-?(?:\d+|\d+\.\d+|\.\d+))([^\.]*?)$/;

function parse(input){
    var valueParts = parseRegex.exec(input);

    if(!valueParts){
        return;
    }

    return {
        value: parseFloat(valueParts[1]),
        unit: valueParts[2]
    };
}

function addUnit(input, unit){
    var parsedInput = parse(input),
        parsedUnit = parse(unit);

    if(!parsedInput && parsedUnit){
        unit = input;
        parsedInput = parsedUnit;
    }

    if(!isNaN(unit)){
        unit = null;
    }

    if(!parsedInput){
        return input;
    }

    if(parsedInput.unit == null || parsedInput.unit == ''){
        parsedInput.unit = unit || 'px';
    }

    return parsedInput.value + parsedInput.unit;
};

module.exports = addUnit;
module.exports.parse = parse;
},{}],5:[function(require,module,exports){
var unitr = require('unitr'),
    types = {
        '3d': '3d',
        'x': 'X',
        'y': 'Y',
        'z': 'Z',
        '2d': '',
        '': ''
    };

module.exports = function(type, x, y, z){
    if(!isNaN(type)){
        z = y;
        y = x;
        x = type;
        type = null;
    }

    type = type && type.toLowerCase() || '';

    var args = [];

    x != null && args.push(unitr(x));
    y != null && args.push(unitr(y));
    z != null && args.push(unitr(z));

    return 'translate' +
        types[type] +
        '(' +
        args.join(',') +
        ')';
}
},{"unitr":4}],6:[function(require,module,exports){
var fromComponents = require('math-js/vectors/fromComponents');
var addVectors = require('math-js/vectors/add');

function dirvector(validator, settings){
    if(!settings){
        settings = {};
    }

    var valid,
        minMagnitude = settings.magnitude || 5,
        previousPosition,
        netVector;

    var getPosition = settings.getPosition || function(event){
        return {
            x: event.x != null ? event.x : event.pageX,
            y: event.y != null ? event.y : event.pageY
        };
    };

    var filter = function(handler){
        return function handleEvent(event){
            if(valid === false){
                return;
            }

            if(valid){
                return handler(event);
            }

            if(!previousPosition){
                previousPosition = getPosition(event);
                return;
            }

            var currentPosition = getPosition(event);

            netVector = addVectors(netVector, fromComponents(
                previousPosition.x - currentPosition.x,
                previousPosition.y - currentPosition.y
            ));

            previousPosition = currentPosition;

            if(minMagnitude > netVector.magnitude){
                return;
            }

            valid = validator(netVector);
            handleEvent(event);
        };
    };

    filter.reset = function(){
        previousPosition = null;
        netVector = {direction: 0, magnitude: 0};
        valid = null;
    };

    filter.reset();

    return filter;
};

dirvector.horizontal = function(vector){
    var quarterPI = Math.PI / 4,
        PI = Math.PI;


    return (
        (
            vector.direction < quarterPI &&
            vector.direction > -quarterPI
        ) ||
        (
            vector.direction > quarterPI*3 ||
            vector.direction < -quarterPI*3
        )
    );
};

dirvector.vertical = function(vector){
    return !dirvector.horizontal(vector);
};

module.exports = dirvector;
},{"math-js/vectors/add":7,"math-js/vectors/fromComponents":8}],7:[function(require,module,exports){
/**
    ## Vector addition - add two vectors expressed in polar notation ##

    add(vectorA - a polar vector, vectorB - another polar vector)

    returns {magnitude, direction expressed as an angle in radians}

    Real world example:

     - (2D) Adding two vectors to produce a third vector that describes the total magnitude and direction.

     - Can be used to apply two forces on one object to get a combined vector

        // returns a new vector that is the addition of the two passed vectors
        add(vector1, vector2);

*/

var fromComponents = require('./fromComponents'),
    toComponents = require('./toComponents');

module.exports = function(vectorA, vectorB) {
    var componentsA = toComponents(vectorA.magnitude, vectorA.direction),
        componentsB = toComponents(vectorB.magnitude, vectorB.direction);

    return fromComponents(componentsA.x + componentsB.x, componentsA.y + componentsB.y);
};

},{"./fromComponents":8,"./toComponents":9}],8:[function(require,module,exports){
/**
 ## Vector from Components ##

    fromComponents(x, y)

 returns {magnitude, direction expressed as an angle in radians}

 Real world example:

 - (2D) Convert vector components into their vector form

 */

module.exports = function(x, y) {
    var squared = Math.pow(x, 2) + Math.pow(y, 2);

    return {
        magnitude: Math.sqrt(squared),
        direction: Math.atan2(y, x)
    };
};
},{}],9:[function(require,module,exports){
/**
    ## Vector to Components ##

        toComponents(magnitude, direction expressed as an angle in radians)

    returns {x, y}

    Real world example:

    - (2D) convert an angle and a distance into a difference in x,y

*/

module.exports = function(magnitude, direction) {
    return {
      x: Math.cos(direction) * magnitude,
      y: Math.sin(direction) * magnitude
    };
};

},{}],10:[function(require,module,exports){
var doc = {
    document: typeof document !== 'undefined' ? document : null,
    setDocument: function(d){
        this.document = d;
    }
};

var arrayProto = [],
    isList = require('./isList'),
    getTargets = require('./getTargets')(doc.document),
    getTarget = require('./getTarget')(doc.document),
    space = ' ';


///[README.md]

function isIn(array, item){
    for(var i = 0; i < array.length; i++) {
        if(item === array[i]){
            return true;
        }
    }
}

/**

    ## .find

    finds elements that match the query within the scope of target

        //fluent
        doc(target).find(query);

        //legacy
        doc.find(target, query);
*/

function find(target, query){
    target = getTargets(target);
    if(query == null){
        return target;
    }

    if(isList(target)){
        var results = [];
        for (var i = 0; i < target.length; i++) {
            var subResults = doc.find(target[i], query);
            for(var j = 0; j < subResults.length; j++) {
                if(!isIn(results, subResults[j])){
                    results.push(subResults[j]);
                }
            }
        }
        return results;
    }

    return target ? target.querySelectorAll(query) : [];
}

/**

    ## .findOne

    finds the first element that matches the query within the scope of target

        //fluent
        doc(target).findOne(query);

        //legacy
        doc.findOne(target, query);
*/

function findOne(target, query){
    target = getTarget(target);
    if(query == null){
        return target;
    }

    if(isList(target)){
        var result;
        for (var i = 0; i < target.length; i++) {
            result = findOne(target[i], query);
            if(result){
                break;
            }
        }
        return result;
    }

    return target ? target.querySelector(query) : null;
}

/**

    ## .closest

    recurses up the DOM from the target node, checking if the current element matches the query

        //fluent
        doc(target).closest(query);

        //legacy
        doc.closest(target, query);
*/

function closest(target, query){
    target = getTarget(target);

    if(isList(target)){
        target = target[0];
    }

    while(
        target &&
        target.ownerDocument &&
        !is(target, query)
    ){
        target = target.parentNode;
    }

    return target === doc.document && target !== query ? null : target;
}

/**

    ## .is

    returns true if the target element matches the query

        //fluent
        doc(target).is(query);

        //legacy
        doc.is(target, query);
*/

function is(target, query){
    target = getTarget(target);

    if(isList(target)){
        target = target[0];
    }

    if(!target.ownerDocument || typeof query !== 'string'){
        return target === query;
    }

    if(target === query){
        return true;
    }

    var parentless = !target.parentNode;

    if(parentless){
        // Give the element a parent so that .querySelectorAll can be used
        document.createDocumentFragment().appendChild(target);
    }

    var result = arrayProto.indexOf.call(find(target.parentNode, query), target) >= 0;

    if(parentless){
        target.parentNode.removeChild(target);
    }

    return result;
}

/**

    ## .addClass

    adds classes to the target (space separated string or array)

        //fluent
        doc(target).addClass(query);

        //legacy
        doc.addClass(target, query);
*/

function addClass(target, classes){
    target = getTargets(target);

    if(isList(target)){
        for (var i = 0; i < target.length; i++) {
            addClass(target[i], classes);
        }
        return this;
    }
    if(!classes){
        return this;
    }

    var classes = Array.isArray(classes) ? classes : classes.split(space),
        currentClasses = target.classList ? null : target.className.split(space);

    for(var i = 0; i < classes.length; i++){
        var classToAdd = classes[i];
        if(!classToAdd || classToAdd === space){
            continue;
        }
        if(target.classList){
            target.classList.add(classToAdd);
        } else if(!currentClasses.indexOf(classToAdd)>=0){
            currentClasses.push(classToAdd);
        }
    }
    if(!target.classList){
        target.className = currentClasses.join(space);
    }
    return this;
}

/**

    ## .removeClass

    removes classes from the target (space separated string or array)

        //fluent
        doc(target).removeClass(query);

        //legacy
        doc.removeClass(target, query);
*/

function removeClass(target, classes){
    target = getTargets(target);

    if(isList(target)){
        for (var i = 0; i < target.length; i++) {
            removeClass(target[i], classes);
        }
        return this;
    }

    if(!classes){
        return this;
    }

    var classes = Array.isArray(classes) ? classes : classes.split(space),
        currentClasses = target.classList ? null : target.className.split(space);

    for(var i = 0; i < classes.length; i++){
        var classToRemove = classes[i];
        if(!classToRemove || classToRemove === space){
            continue;
        }
        if(target.classList){
            target.classList.remove(classToRemove);
            continue;
        }
        var removeIndex = currentClasses.indexOf(classToRemove);
        if(removeIndex >= 0){
            currentClasses.splice(removeIndex, 1);
        }
    }
    if(!target.classList){
        target.className = currentClasses.join(space);
    }
    return this;
}

function addEvent(settings){
    var target = getTarget(settings.target);
    if(target){
        target.addEventListener(settings.event, settings.callback, false);
    }else{
        console.warn('No elements matched the selector, so no events were bound.');
    }
}

/**

    ## .on

    binds a callback to a target when a DOM event is raised.

        //fluent
        doc(target/proxy).on(events, target[optional], callback);

    note: if a target is passed to the .on function, doc's target will be used as the proxy.

        //legacy
        doc.on(events, target, query, proxy[optional]);
*/

function on(events, target, callback, proxy){

    proxy = getTargets(proxy);

    if(!proxy){
        target = getTargets(target);
        // handles multiple targets
        if(isList(target)){
            var multiRemoveCallbacks = [];
            for (var i = 0; i < target.length; i++) {
                multiRemoveCallbacks.push(on(events, target[i], callback, proxy));
            }
            return function(){
                while(multiRemoveCallbacks.length){
                    multiRemoveCallbacks.pop();
                }
            };
        }
    }

    // handles multiple proxies
    // Already handles multiple proxies and targets,
    // because the target loop calls this loop.
    if(isList(proxy)){
        var multiRemoveCallbacks = [];
        for (var i = 0; i < proxy.length; i++) {
            multiRemoveCallbacks.push(on(events, target, callback, proxy[i]));
        }
        return function(){
            while(multiRemoveCallbacks.length){
                multiRemoveCallbacks.pop();
            }
        };
    }

    var removeCallbacks = [];

    if(typeof events === 'string'){
        events = events.split(space);
    }

    for(var i = 0; i < events.length; i++){
        var eventSettings = {};
        if(proxy){
            if(proxy === true){
                proxy = doc.document;
            }
            eventSettings.target = proxy;
            eventSettings.callback = function(event){
                var closestTarget = closest(event.target, target);
                if(closestTarget){
                    callback(event, closestTarget);
                }
            };
        }else{
            eventSettings.target = target;
            eventSettings.callback = callback;
        }

        eventSettings.event = events[i];

        addEvent(eventSettings);

        removeCallbacks.push(eventSettings);
    }

    return function(){
        while(removeCallbacks.length){
            var removeCallback = removeCallbacks.pop();
            getTarget(removeCallback.target).removeEventListener(removeCallback.event, removeCallback.callback);
        }
    }
}

/**

    ## .off

    removes events assigned to a target.

        //fluent
        doc(target/proxy).off(events, target[optional], callback);

    note: if a target is passed to the .on function, doc's target will be used as the proxy.

        //legacy
        doc.off(events, target, callback, proxy);
*/

function off(events, target, callback, proxy){
    if(isList(target)){
        for (var i = 0; i < target.length; i++) {
            off(events, target[i], callback, proxy);
        }
        return this;
    }
    if(proxy instanceof Array){
        for (var i = 0; i < proxy.length; i++) {
            off(events, target, callback, proxy[i]);
        }
        return this;
    }

    if(typeof events === 'string'){
        events = events.split(space);
    }

    if(typeof callback !== 'function'){
        proxy = callback;
        callback = null;
    }

    proxy = proxy ? getTarget(proxy) : doc.document;

    var targets = typeof target === 'string' ? find(target, proxy) : [target];

    for(var targetIndex = 0; targetIndex < targets.length; targetIndex++){
        var currentTarget = targets[targetIndex];

        for(var i = 0; i < events.length; i++){
            currentTarget.removeEventListener(events[i], callback);
        }
    }
    return this;
}

/**

    ## .append

    adds elements to a target

        //fluent
        doc(target).append(children);

        //legacy
        doc.append(target, children);
*/

function append(target, children){
    var target = getTarget(target),
        children = getTarget(children);

    if(isList(target)){
        target = target[0];
    }

    if(isList(children)){
        for (var i = 0; i < children.length; i++) {
            append(target, children[i]);
        }
        return;
    }

    target.appendChild(children);
}

/**

    ## .prepend

    adds elements to the front of a target

        //fluent
        doc(target).prepend(children);

        //legacy
        doc.prepend(target, children);
*/

function prepend(target, children){
    var target = getTarget(target),
        children = getTarget(children);

    if(isList(target)){
        target = target[0];
    }

    if(isList(children)){
        //reversed because otherwise the would get put in in the wrong order.
        for (var i = children.length -1; i; i--) {
            prepend(target, children[i]);
        }
        return;
    }

    target.insertBefore(children, target.firstChild);
}

/**

    ## .isVisible

    checks if an element or any of its parents display properties are set to 'none'

        //fluent
        doc(target).isVisible();

        //legacy
        doc.isVisible(target);
*/

function isVisible(target){
    var target = getTarget(target);
    if(!target){
        return;
    }
    if(isList(target)){
        var i = -1;

        while (target[i++] && isVisible(target[i])) {}
        return target.length >= i;
    }
    while(target.parentNode && target.style.display !== 'none'){
        target = target.parentNode;
    }

    return target === doc.document;
}

/**

    ## .indexOfElement

    returns the index of the element within it's parent element.

        //fluent
        doc(target).indexOfElement();

        //legacy
        doc.indexOfElement(target);

*/

function indexOfElement(target) {
    target = getTargets(target);
    if(!target){
        return;
    }

    if(isList(target)){
        target = target[0];
    }

    var i = -1;

    var parent = target.parentElement;

    if(!parent){
        return i;
    }

    while(parent.children[++i] !== target){}

    return i;
}


/**

    ## .ready

    call a callback when the document is ready.

    returns -1 if there is no parentElement on the target.

        //fluent
        doc().ready(callback);

        //legacy
        doc.ready(callback);
*/

function ready(callback){
    if(doc.document && doc.document.readyState === 'complete'){
        callback();
    }else if(window.attachEvent){
        document.attachEvent("onreadystatechange", callback);
        window.attachEvent("onLoad",callback);
    }else if(document.addEventListener){
        document.addEventListener("DOMContentLoaded",callback,false);
    }
}

doc.find = find;
doc.findOne = findOne;
doc.closest = closest;
doc.is = is;
doc.addClass = addClass;
doc.removeClass = removeClass;
doc.off = off;
doc.on = on;
doc.append = append;
doc.prepend = prepend;
doc.isVisible = isVisible;
doc.ready = ready;
doc.indexOfElement = indexOfElement;

module.exports = doc;
},{"./getTarget":12,"./getTargets":13,"./isList":14}],11:[function(require,module,exports){
var doc = require('./doc'),
    isList = require('./isList'),
    getTargets = require('./getTargets')(doc.document),
    flocProto = [];

function Floc(items){
    this.push.apply(this, items);
}
Floc.prototype = flocProto;
flocProto.constructor = Floc;

function floc(target){
    var instance = getTargets(target);

    if(!isList(instance)){
        if(instance){
            instance = [instance];
        }else{
            instance = [];
        }
    }
    return new Floc(instance);
}

var returnsSelf = 'addClass removeClass append prepend'.split(' ');

for(var key in doc){
    if(typeof doc[key] === 'function'){
        floc[key] = doc[key];
        flocProto[key] = (function(key){
            var instance = this;
            // This is also extremely dodgy and fast
            return function(a,b,c,d,e,f){
                var result = doc[key](this, a,b,c,d,e,f);

                if(result !== doc && isList(result)){
                    return floc(result);
                }
                if(returnsSelf.indexOf(key) >=0){
                    return instance;
                }
                return result;
            };
        }(key));
    }
}
flocProto.on = function(events, target, callback){
    var proxy = this;
    if(typeof target === 'function'){
        callback = target;
        target = this;
        proxy = null;
    }
    doc.on(events, target, callback, proxy);
    return this;
};

flocProto.off = function(events, target, callback){
    var reference = this;
    if(typeof target === 'function'){
        callback = target;
        target = this;
        reference = null;
    }
    doc.off(events, target, callback, reference);
    return this;
};

flocProto.ready = function(callback){
    doc.ready(callback);
    return this;
};

flocProto.addClass = function(className){
    doc.addClass(this, className);
    return this;
};

flocProto.removeClass = function(className){
    doc.removeClass(this, className);
    return this;
};

module.exports = floc;
},{"./doc":10,"./getTargets":13,"./isList":14}],12:[function(require,module,exports){
var singleId = /^#\w+$/;

module.exports = function(document){
    return function getTarget(target){
        if(typeof target === 'string'){
            if(singleId.exec(target)){
                return document.getElementById(target.slice(1));
            }
            return document.querySelector(target);
        }

        return target;
    };
};
},{}],13:[function(require,module,exports){

var singleClass = /^\.\w+$/,
    singleId = /^#\w+$/,
    singleTag = /^\w+$/;

module.exports = function(document){
    return function getTargets(target){
        if(typeof target === 'string'){
            if(singleId.exec(target)){
                // If you have more than 1 of the same id in your page,
                // thats your own stupid fault.
                return [document.getElementById(target.slice(1))];
            }
            if(singleTag.exec(target)){
                return document.getElementsByTagName(target);
            }
            if(singleClass.exec(target)){
                return document.getElementsByClassName(target.slice(1));
            }
            return document.querySelectorAll(target);
        }

        return target;
    };
};
},{}],14:[function(require,module,exports){
module.exports = function isList(object){
    return object != null && typeof object === 'object' && 'length' in object && !('nodeType' in object) && object.self != object; // in IE8, window.self is window, but it is not === window, but it is == window......... WTF!?
}
},{}],15:[function(require,module,exports){
var interactions = [],
    minMoveDistance = 5,
    interact,
    maximumMovesToPersist = 1000, // Should be plenty..
    propertiesToCopy = 'target,pageX,pageY,clientX,clientY,offsetX,offsetY,screenX,screenY,shiftKey,x,y'.split(','), // Stuff that will be on every interaction.
    d = typeof document !== 'undefined' ? document : null;

function Interact(){
    this._elements = [];
}
Interact.prototype.on = function(eventName, target, callback){
    if(!target){
        return;
    }
    target._interactEvents = target._interactEvents || {};
    target._interactEvents[eventName] = target._interactEvents[eventName] || []
    target._interactEvents[eventName].push({
        callback: callback,
        interact: this
    });

    return this;
};
Interact.prototype.emit = function(eventName, target, event, interaction){
    if(!target){
        return;
    }

    var interact = this,
        currentTarget = target;

    interaction.originalEvent = event;
    interaction.preventDefault = function(){
        event.preventDefault();
    }
    interaction.stopPropagation = function(){
        event.stopPropagation();
    }

    while(currentTarget){
        currentTarget._interactEvents &&
        currentTarget._interactEvents[eventName] &&
        currentTarget._interactEvents[eventName].forEach(function(listenerInfo){
            if(listenerInfo.interact === interact){
                listenerInfo.callback.call(interaction, interaction);
            }
        });
        currentTarget = currentTarget.parentNode;
    }

    return this;
};
Interact.prototype.off =
Interact.prototype.removeListener = function(eventName, target, callback){
    if(!target || !target._interactEvents || !target._interactEvents[eventName]){
        return;
    }
    var interactListeners = target._interactEvents[eventName],
        listenerInfo;
    for(var i = 0; i < interactListeners.length; i++) {
        listenerInfo = interactListeners[i];
        if(listenerInfo.interact === interact && listenerInfo.callback === callback){
            interactListeners.splice(i,1);
            i--;
        }
    }

    return this;
};
interact = new Interact();

    // For some reason touch browsers never change the event target during a touch.
    // This is, lets face it, fucking stupid.
function getActualTarget() {
    var scrollX = window.scrollX,
        scrollY = window.scrollY;

    // IE is stupid and doesn't support scrollX/Y
    if(scrollX === undefined){
        scrollX = d.body.scrollLeft;
        scrollY = d.body.scrollTop;
    }

    return d.elementFromPoint(this.pageX - window.scrollX, this.pageY - window.scrollY);
}

function getMoveDistance(x1,y1,x2,y2){
    var adj = Math.abs(x1 - x2),
        opp = Math.abs(y1 - y2);

    return Math.sqrt(Math.pow(adj,2) + Math.pow(opp,2));
}

function destroyInteraction(interaction){
    for(var i = 0; i < interactions.length; i++){
        if(interactions[i].identifier === interaction.identifier){
            interactions.splice(i,1);
        }
    }
}

function getInteraction(identifier){
    for(var i = 0; i < interactions.length; i++){
        if(interactions[i].identifier === identifier){
            return interactions[i];
        }
    }
}

function setInheritedData(interaction, data){
    for(var i = 0; i < propertiesToCopy.length; i++) {
        interaction[propertiesToCopy[i]] = data[propertiesToCopy[i]]
    }
}

function getAngle(deltaPoint){
    return Math.atan2(deltaPoint.x, -deltaPoint.y) * 180 / Math.PI;
}

function Interaction(event, interactionInfo){
    // If there is no event (eg: desktop) just make the identifier undefined
    if(!event){
        event = {};
    }
    // If there is no extra info about the interaction (eg: desktop) just use the event itself
    if(!interactionInfo){
        interactionInfo = event;
    }

    // If there is another interaction with the same ID, something went wrong.
    // KILL IT WITH FIRE!
    var oldInteraction = getInteraction(interactionInfo.identifier);
    oldInteraction && oldInteraction.destroy();

    this.identifier = interactionInfo.identifier;

    this.moves = [];

    interactions.push(this);
}

Interaction.prototype = {
    constructor: Interaction,
    getActualTarget: getActualTarget,
    destroy: function(){
        interact.on('destroy', this.target, this, this);
        destroyInteraction(this);
    },
    start: function(event, interactionInfo){
        // If there is no extra info about the interaction (eg: desktop) just use the event itself
        if(!interactionInfo){
            interactionInfo = event;
        }

        var lastStart = {
                time: new Date(),
                phase: 'start'
            };
        setInheritedData(lastStart, interactionInfo);
        this.lastStart = lastStart;

        setInheritedData(this, interactionInfo);

        this.phase = 'start';
        interact.emit('start', event.target, event, this);
        return this;
    },
    move: function(event, interactionInfo){
        // If there is no extra info about the interaction (eg: desktop) just use the event itself
        if(!interactionInfo){
            interactionInfo = event;
        }

        var currentTouch = {
                time: new Date(),
                phase: 'move'
            };

        setInheritedData(currentTouch, interactionInfo);

        // Update the interaction
        setInheritedData(this, interactionInfo);

        this.moves.push(currentTouch);

        // Memory saver, culls any moves that are over the maximum to keep.
        this.moves = this.moves.slice(-maximumMovesToPersist);

        var moveDelta = this.getMoveDelta(),
            angle = 0;
        if(moveDelta){
            angle = getAngle(moveDelta);
        }

        this.angle = currentTouch.angle = angle;

        this.phase = 'move';
        interact.emit('move', event.target, event, this);
        return this;
    },
    drag: function(event, interactionInfo){
        // If there is no extra info about the interaction (eg: desktop) just use the event itself
        if(!interactionInfo){
            interactionInfo = event;
        }

        var currentTouch = {
                time: new Date(),
                phase: 'drag'
            };

        setInheritedData(currentTouch, interactionInfo);

        // Update the interaction
        setInheritedData(this, interactionInfo);

        if(!this.moves){
            this.moves = [];
        }

        this.moves.push(currentTouch);

        // Memory saver, culls any moves that are over the maximum to keep.
        this.moves = this.moves.slice(-maximumMovesToPersist);

        if(!this.dragStarted && getMoveDistance(this.lastStart.pageX, this.lastStart.pageY, currentTouch.pageX, currentTouch.pageY) > minMoveDistance){
            this.dragStarted = true;
        }

        var moveDelta = this.getMoveDelta(),
            angle = 0;
        if(moveDelta){
            angle = getAngle(moveDelta);
        }

        this.angle = currentTouch.angle = angle;

        if(this.dragStarted){
            this.phase = 'drag';
            interact.emit('drag', event.target, event, this);
        }
        return this;
    },
    end: function(event, interactionInfo){
        if(!interactionInfo){
            interactionInfo = event;
        }

        // Update the interaction
        setInheritedData(this, interactionInfo);

        if(!this.moves){
            this.moves = [];
        }

        // Update the interaction
        setInheritedData(this, interactionInfo);

        this.phase = 'end';
        interact.emit('end', event.target, event, this);

        return this;
    },
    cancel: function(event, interactionInfo){
        if(!interactionInfo){
            interactionInfo = event;
        }

        // Update the interaction
        setInheritedData(this, interactionInfo);

        this.phase = 'cancel';
        interact.emit('cancel', event.target, event, this);

        return this;
    },
    getMoveDistance: function(){
        if(this.moves.length > 1){
            var current = this.moves[this.moves.length-1],
                previous = this.moves[this.moves.length-2];

            return getMoveDistance(current.pageX, current.pageY, previous.pageX, previous.pageY);
        }
    },
    getMoveDelta: function(){
        var current = this.moves[this.moves.length-1],
            previous = this.moves[this.moves.length-2] || this.lastStart;

        if(!current || !previous){
            return;
        }

        return {
            x: current.pageX - previous.pageX,
            y: current.pageY - previous.pageY
        };
    },
    getSpeed: function(){
        if(this.moves.length > 1){
            var current = this.moves[this.moves.length-1],
                previous = this.moves[this.moves.length-2];

            return this.getMoveDistance() / (current.time - previous.time);
        }
        return 0;
    },
    getCurrentAngle: function(blend){
        var phase = this.phase,
            currentPosition,
            lastAngle,
            i = this.moves.length-1,
            angle,
            firstAngle,
            angles = [],
            blendSteps = 20/(this.getSpeed()*2+1),
            stepsUsed = 1;

        if(this.moves && this.moves.length){

            currentPosition = this.moves[i];
            angle = firstAngle = currentPosition.angle;

            if(blend && this.moves.length > 1){
                while(
                    --i > 0 &&
                    this.moves.length - i < blendSteps &&
                    this.moves[i].phase === phase
                ){
                    lastAngle = this.moves[i].angle;
                    if(Math.abs(lastAngle - firstAngle) > 180){
                        angle -= lastAngle;
                    }else{
                        angle += lastAngle;
                    }
                    stepsUsed++;
                }
                angle = angle/stepsUsed;
            }
        }
        if(angle === Infinity){
            return firstAngle;
        }
        return angle;
    },
    getAllInteractions: function(){
        return interactions.slice();
    }
};

function start(event){
    var touch;

    for(var i = 0; i < event.changedTouches.length; i++){
        touch = event.changedTouches[i];
        new Interaction(event, event.changedTouches[i]).start(event, touch);
    }
}
function drag(event){
    var touch;

    for(var i = 0; i < event.changedTouches.length; i++){
        touch = event.changedTouches[i];
        getInteraction(touch.identifier).drag(event, touch);
    }
}
function end(event){
    var touch;

    for(var i = 0; i < event.changedTouches.length; i++){
        touch = event.changedTouches[i];
        getInteraction(touch.identifier).end(event, touch).destroy();
    }
}
function cancel(event){
    var touch;

    for(var i = 0; i < event.changedTouches.length; i++){
        touch = event.changedTouches[i];
        getInteraction(touch.identifier).cancel(event, touch).destroy();
    }
}

addEvent(d, 'touchstart', start);
addEvent(d, 'touchmove', drag);
addEvent(d, 'touchend', end);
addEvent(d, 'touchcancel', cancel);

var mouseIsDown = false;
addEvent(d, 'mousedown', function(event){
    mouseIsDown = true;

    if(!interactions.length){
        new Interaction(event);
    }

    var interaction = getInteraction();

    if(!interaction){
        return;
    }

    getInteraction().start(event);
});
addEvent(d, 'mousemove', function(event){
    if(!interactions.length){
        new Interaction(event);
    }

    var interaction = getInteraction();

    if(!interaction){
        return;
    }

    if(mouseIsDown){
        interaction.drag(event);
    }else{
        interaction.move(event);
    }
});
addEvent(d, 'mouseup', function(event){
    mouseIsDown = false;

    var interaction = getInteraction();

    if(!interaction){
        return;
    }

    interaction.end(event, null);
    interaction.destroy();
});

function addEvent(element, type, callback) {
    if(element == null){
        return;
    }

    if(element.addEventListener){
        element.addEventListener(type, callback);
    }
    else if(d.attachEvent){
        element.attachEvent("on"+ type, callback);
    }
}

module.exports = interact;
},{}],16:[function(require,module,exports){
var cache = {},
    bodyStyle = {};

if(typeof window !== 'undefined'){
    if(window.document.body){
        getBodyStyleProperties();
    }else{
        window.addEventListener('load', getBodyStyleProperties);
    }
}

function getBodyStyleProperties(){
    var shortcuts = {},
        items = document.defaultView.getComputedStyle(document.body);

    for(var i = 0; i < items.length; i++){
        bodyStyle[items[i]] = null;

        // This is kinda dodgy but it works.
        baseName = items[i].match(/^(\w+)-.*$/);
        if(baseName){
            if(shortcuts[baseName[1]]){
                bodyStyle[baseName[1]] = null;
            }else{
                shortcuts[baseName[1]] = true;
            }
        }
    }
}

function venfix(property, target){
    if(!target && cache[property]){
        return cache[property];
    }

    target = target || bodyStyle;

    var props = [];

    for(var key in target){
        cache[key] = key;
        props.push(key);
    }

    if(property in target){
        return property;
    }

    var propertyRegex = new RegExp('^(-(?:' + venfix.prefixes.join('|') + ')-)' + property + '(?:$|-)', 'i');

    for(var i = 0; i < props.length; i++) {
        var match = props[i].match(propertyRegex);
        if(match){
            var result = match[1] + property;
            if(target === bodyStyle){
                cache[property] = result
            }
            return result;
        }
    }

    return property;
}

// Add extensibility
venfix.prefixes = ['webkit', 'moz', 'ms', 'o'];

module.exports = venfix;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvaW8uanMvdjIuMy40L2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImV4YW1wbGUiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jcmVsL2NyZWwuanMiLCJub2RlX21vZHVsZXMvY3NzLXRyYW5zbGF0ZS9ub2RlX21vZHVsZXMvdW5pdHIvdW5pdHIuanMiLCJub2RlX21vZHVsZXMvY3NzLXRyYW5zbGF0ZS90cmFuc2xhdGUuanMiLCJub2RlX21vZHVsZXMvZGlydmVjdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RpcnZlY3Rvci9ub2RlX21vZHVsZXMvbWF0aC1qcy92ZWN0b3JzL2FkZC5qcyIsIm5vZGVfbW9kdWxlcy9kaXJ2ZWN0b3Ivbm9kZV9tb2R1bGVzL21hdGgtanMvdmVjdG9ycy9mcm9tQ29tcG9uZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9kaXJ2ZWN0b3Ivbm9kZV9tb2R1bGVzL21hdGgtanMvdmVjdG9ycy90b0NvbXBvbmVudHMuanMiLCJub2RlX21vZHVsZXMvZG9jLWpzL2RvYy5qcyIsIm5vZGVfbW9kdWxlcy9kb2MtanMvZmx1ZW50LmpzIiwibm9kZV9tb2R1bGVzL2RvYy1qcy9nZXRUYXJnZXQuanMiLCJub2RlX21vZHVsZXMvZG9jLWpzL2dldFRhcmdldHMuanMiLCJub2RlX21vZHVsZXMvZG9jLWpzL2lzTGlzdC5qcyIsIm5vZGVfbW9kdWxlcy9pbnRlcmFjdC1qcy9pbnRlcmFjdC5qcyIsIm5vZGVfbW9kdWxlcy92ZW5maXgvdmVuZml4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDemtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHN3aXBlb3V0ID0gcmVxdWlyZSgnLi4vJyksXG4gICAgdmVuZml4ID0gcmVxdWlyZSgndmVuZml4JyksXG4gICAgdHJhbnNsYXRlID0gcmVxdWlyZSgnY3NzLXRyYW5zbGF0ZScpLFxuICAgIGNyZWwgPSByZXF1aXJlKCdjcmVsJyk7XG5cblxuZnVuY3Rpb24gbWFrZUNhcmQoKXtcbiAgICByZXR1cm4gY3JlbCgnZGl2Jywge2NsYXNzOiAnY2FyZCd9LFxuICAgICAgICAnU29tZSBjYXJkIHdpdGggdGV4dCBuIHN0dWZmJ1xuICAgICk7XG59O1xuXG5cbmZ1bmN0aW9uIGFkZENhcmQoKXtcbiAgICB2YXIgY2FyZCA9IG1ha2VDYXJkKCk7XG5cbiAgICB2YXIgZGVzdHJveSA9IHN3aXBlb3V0KGNhcmQsIGZ1bmN0aW9uKHR5cGUsIGV2ZW50KXtcblxuICAgICAgICBpZih0eXBlID09PSAnZHJhZycpe1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgaWYoZXZlbnQueCA+IChjYXJkLmNsaWVudFdpZHRoICogMC41KSl7XG4gICAgICAgICAgICAgICAgY2FyZC5jbGFzc0xpc3QucmVtb3ZlKCdyZW1vdmUnKTtcbiAgICAgICAgICAgICAgICBjYXJkLmNsYXNzTGlzdC5hZGQoJ2FkZCcpO1xuICAgICAgICAgICAgfWVsc2UgaWYoZXZlbnQueCA8IC0oY2FyZC5jbGllbnRXaWR0aCAqIDAuNSkpe1xuICAgICAgICAgICAgICAgIGNhcmQuY2xhc3NMaXN0LnJlbW92ZSgnYWRkJyk7XG4gICAgICAgICAgICAgICAgY2FyZC5jbGFzc0xpc3QuYWRkKCdyZW1vdmUnKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNhcmQuY2xhc3NMaXN0LnJlbW92ZSgncmVtb3ZlJyk7XG4gICAgICAgICAgICAgICAgY2FyZC5jbGFzc0xpc3QucmVtb3ZlKCdhZGQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHR5cGUgPT09ICdyZWJvdW5kJyl7XG5cbiAgICAgICAgICAgIGlmKE1hdGguYWJzKGV2ZW50LngpID4gY2FyZC5jbGllbnRXaWR0aCAqIDAuNSl7XG4gICAgICAgICAgICAgICAgY2FyZC5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICAgICAgZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgY2FyZC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9LCAzMDApO1xuICAgICAgICAgICAgICAgIGFkZENhcmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNhcmQuc3R5bGVbdmVuZml4KCd0cmFuc2Zvcm0nKV0gPSB0cmFuc2xhdGUoJzNkJywgZXZlbnQueCwgMCwgMCk7XG4gICAgfSk7XG5cbiAgICBjcmVsKGRvY3VtZW50LmJvZHksIGNhcmQpO1xufVxuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICBhZGRDYXJkKCk7XG4gICAgYWRkQ2FyZCgpO1xuICAgIGFkZENhcmQoKTtcbiAgICBhZGRDYXJkKCk7XG4gICAgYWRkQ2FyZCgpO1xuICAgIGFkZENhcmQoKTtcbiAgICBhZGRDYXJkKCk7XG4gICAgYWRkQ2FyZCgpO1xuICAgIGFkZENhcmQoKTtcbiAgICBhZGRDYXJkKCk7XG4gICAgYWRkQ2FyZCgpO1xuICAgIGFkZENhcmQoKTtcbiAgICBhZGRDYXJkKCk7XG59OyIsInZhciBpbnRlcmFjdCA9IHJlcXVpcmUoJ2ludGVyYWN0LWpzJyksXG4gICAgZGlydmVjdG9yID0gcmVxdWlyZSgnZGlydmVjdG9yJyksXG4gICAgZG9jID0gcmVxdWlyZSgnZG9jLWpzJyk7XG5cbmZ1bmN0aW9uIGV2ZW50c0ZvclRhcmdldCh0YXJnZXQsIGV2ZW50cyl7XG5cbiAgICBmdW5jdGlvbiBzdGFydChpbnRlcmFjdGlvbil7XG4gICAgICAgIGludGVyYWN0aW9uLnN3aXBlb3V0VGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgICBldmVudHMuc3RhcnQoaW50ZXJhY3Rpb24pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYWcoaW50ZXJhY3Rpb24pe1xuICAgICAgICBpZihpbnRlcmFjdGlvbi5zd2lwZW91dFRhcmdldCAhPT0gdGFyZ2V0KXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGV2ZW50cy5kcmFnKGludGVyYWN0aW9uKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlbmQoaW50ZXJhY3Rpb24pe1xuICAgICAgICBpZihpbnRlcmFjdGlvbi5zd2lwZW91dFRhcmdldCAhPT0gdGFyZ2V0KXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGV2ZW50cy5lbmQoaW50ZXJhY3Rpb24pO1xuICAgIH1cblxuICAgIGludGVyYWN0Lm9uKCdzdGFydCcsIHRhcmdldCwgc3RhcnQpO1xuXG4gICAgaW50ZXJhY3Qub24oJ2RyYWcnLCBkb2N1bWVudCwgZHJhZyk7XG5cbiAgICBpbnRlcmFjdC5vbignZW5kJywgZG9jdW1lbnQsIGVuZCk7XG5cbiAgICBpbnRlcmFjdC5vbignY2FuY2VsJywgZG9jdW1lbnQsIGVuZCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgICAgaW50ZXJhY3QucmVtb3ZlTGlzdGVuZXIoJ3N0YXJ0JywgdGFyZ2V0LCBzdGFydCk7XG5cbiAgICAgICAgaW50ZXJhY3QucmVtb3ZlTGlzdGVuZXIoJ2RyYWcnLCBkb2N1bWVudCwgZHJhZyk7XG5cbiAgICAgICAgaW50ZXJhY3QucmVtb3ZlTGlzdGVuZXIoJ2VuZCcsIGRvY3VtZW50LCBlbmQpO1xuXG4gICAgICAgIGludGVyYWN0LnJlbW92ZUxpc3RlbmVyKCdjYW5jZWwnLCBkb2N1bWVudCwgZW5kKTtcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCwgc2V0dGluZ3MsIGNhbGxiYWNrKXtcbiAgICBpZih0eXBlb2Ygc2V0dGluZ3MgPT09ICdmdW5jdGlvbicpe1xuICAgICAgICBjYWxsYmFjayA9IHNldHRpbmdzO1xuICAgICAgICBzZXR0aW5ncyA9IHt9O1xuICAgIH1cblxuICAgIHZhciBwb3NpdGlvbiA9IHt4OiAwLCB5OiAwfSxcbiAgICAgICAgc3BlZWQgPSAwLFxuICAgICAgICBkZXN0cm95ZWQsXG4gICAgICAgIGRlc3Ryb3lFdmVudHMsXG4gICAgICAgIGRyYWdnaW5nLFxuICAgICAgICBoYXNNb21lbnR1bSxcbiAgICAgICAgcGF1c2VkLFxuICAgICAgICBkaXJlY3RvcjtcblxuICAgIGlmKHNldHRpbmdzLmRpcmVjdG9yKXtcbiAgICAgICAgZGlyZWN0b3IgPSBzZXR0aW5ncy5kaXJlY3RvcjtcbiAgICB9ZWxzZXtcbiAgICAgICAgZGlyZWN0b3IgPSBkaXJ2ZWN0b3IoZGlydmVjdG9yLmhvcml6b250YWwsIHtcbiAgICAgICAgICAgIGdldFBvc2l0aW9uOiBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgeDogZXZlbnQuY2xpZW50WCxcbiAgICAgICAgICAgICAgICAgICAgeTogZXZlbnQuY2xpZW50WVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBoYW5kbGVyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYoZGVzdHJveWVkKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZGVzdHJveSgpe1xuICAgICAgICBkZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICBkZXN0cm95RXZlbnRzICYmIGRlc3Ryb3lFdmVudHMoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlbWl0KHR5cGUsIHBvc2l0aW9uLCBpbnRlcmFjdGlvbil7XG4gICAgICAgIGhhbmRsZXIodHlwZSwge1xuICAgICAgICAgICAgeDogcG9zaXRpb24ueCxcbiAgICAgICAgICAgIHk6IHBvc2l0aW9uLnksXG4gICAgICAgICAgICBwYXVzZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBwYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3VtZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBwYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBtb21lbnR1bSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByZXZlbnREZWZhdWx0OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGludGVyYWN0aW9uLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbW9tZW50dW0oKXtcbiAgICAgICAgaWYocGF1c2VkKXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGhhc01vbWVudHVtID0gdHJ1ZTtcbiAgICAgICAgc3BlZWQgKz0gMC4xO1xuXG4gICAgICAgIHBvc2l0aW9uLnggKj0gc3BlZWQgLyAxLjU7XG4gICAgICAgIHBvc2l0aW9uLnkgKj0gc3BlZWQgLyAxLjU7XG5cbiAgICAgICAgc3BlZWQgKj0gMC45O1xuXG4gICAgICAgIGVtaXQoJ3JlYm91bmQnLCBwb3NpdGlvbik7XG5cbiAgICAgICAgaWYoTWF0aC5hYnMocG9zaXRpb24ueCkgPCAwLjUgJiYgTWF0aC5hYnMocG9zaXRpb24ueSA8IDAuNSkpe1xuICAgICAgICAgICAgaGFzTW9tZW50dW0gPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIG1vbWVudHVtKClcbiAgICAgICAgfSwgMTAwMC82MCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RhcnQoaW50ZXJhY3Rpb24pe1xuICAgICAgICBpZihkZXN0cm95ZWQpe1xuICAgICAgICAgICAgaW50ZXJhY3QucmVtb3ZlTGlzdGVuZXIoJ3N0YXJ0JywgdGFyZ2V0LCBzdGFydCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICBpbnRlcmFjdGlvbi5zd2lwZVRhcmdldCA9IHRhcmdldDtcbiAgICAgICAgZGlyZWN0b3IucmVzZXQoKTtcbiAgICB9XG5cbiAgICB2YXIgZHJhZyA9IGRpcmVjdG9yKGZ1bmN0aW9uKGludGVyYWN0aW9uKXtcbiAgICAgICAgaWYoZGVzdHJveWVkKXtcbiAgICAgICAgICAgIGludGVyYWN0LnJlbW92ZUxpc3RlbmVyKCdkcmFnJywgdGFyZ2V0LCBkcmFnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFkcmFnZ2luZyB8fCBpbnRlcmFjdGlvbi5zd2lwZVRhcmdldCAhPT0gdGFyZ2V0KXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBtb3ZlID0gaW50ZXJhY3Rpb24uZ2V0TW92ZURlbHRhKCk7XG5cbiAgICAgICAgcG9zaXRpb24ueCArPSBtb3ZlLng7XG4gICAgICAgIHBvc2l0aW9uLnkgKz0gbW92ZS55O1xuXG4gICAgICAgIHNwZWVkID0gaW50ZXJhY3Rpb24uZ2V0U3BlZWQoKSB8fCAwO1xuXG4gICAgICAgIGVtaXQoJ2RyYWcnLCBwb3NpdGlvbiwgaW50ZXJhY3Rpb24pO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZW5kKGludGVyYWN0aW9uKXtcbiAgICAgICAgaWYoZGVzdHJveWVkKXtcbiAgICAgICAgICAgIGludGVyYWN0LnJlbW92ZUxpc3RlbmVyKCdlbmQnLCB0YXJnZXQsIGVuZCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgICBpZihoYXNNb21lbnR1bSB8fCAhcG9zaXRpb24ueCAmJiAhcG9zaXRpb24ueSB8fCBpbnRlcmFjdGlvbi5zd2lwZVRhcmdldCAhPT0gdGFyZ2V0KXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVtaXQoJ3JlYm91bmQnLCBwb3NpdGlvbik7XG4gICAgICAgIG1vbWVudHVtKCk7XG4gICAgfVxuXG4gICAgZGVzdHJveUV2ZW50cyA9IGV2ZW50c0ZvclRhcmdldCh0YXJnZXQsIHtcbiAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICBkcmFnOiBkcmFnLFxuICAgICAgICBlbmQ6IGVuZFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGRlc3Ryb3k7XG59OyIsIi8vQ29weXJpZ2h0IChDKSAyMDEyIEtvcnkgTnVublxyXG5cclxuLy9QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG5cclxuLy9UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuXHJcbi8vVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXHJcblxyXG4vKlxyXG5cclxuICAgIFRoaXMgY29kZSBpcyBub3QgZm9ybWF0dGVkIGZvciByZWFkYWJpbGl0eSwgYnV0IHJhdGhlciBydW4tc3BlZWQgYW5kIHRvIGFzc2lzdCBjb21waWxlcnMuXHJcblxyXG4gICAgSG93ZXZlciwgdGhlIGNvZGUncyBpbnRlbnRpb24gc2hvdWxkIGJlIHRyYW5zcGFyZW50LlxyXG5cclxuICAgICoqKiBJRSBTVVBQT1JUICoqKlxyXG5cclxuICAgIElmIHlvdSByZXF1aXJlIHRoaXMgbGlicmFyeSB0byB3b3JrIGluIElFNywgYWRkIHRoZSBmb2xsb3dpbmcgYWZ0ZXIgZGVjbGFyaW5nIGNyZWwuXHJcblxyXG4gICAgdmFyIHRlc3REaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuICAgICAgICB0ZXN0TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xyXG5cclxuICAgIHRlc3REaXYuc2V0QXR0cmlidXRlKCdjbGFzcycsICdhJyk7XHJcbiAgICB0ZXN0RGl2WydjbGFzc05hbWUnXSAhPT0gJ2EnID8gY3JlbC5hdHRyTWFwWydjbGFzcyddID0gJ2NsYXNzTmFtZSc6dW5kZWZpbmVkO1xyXG4gICAgdGVzdERpdi5zZXRBdHRyaWJ1dGUoJ25hbWUnLCdhJyk7XHJcbiAgICB0ZXN0RGl2WyduYW1lJ10gIT09ICdhJyA/IGNyZWwuYXR0ck1hcFsnbmFtZSddID0gZnVuY3Rpb24oZWxlbWVudCwgdmFsdWUpe1xyXG4gICAgICAgIGVsZW1lbnQuaWQgPSB2YWx1ZTtcclxuICAgIH06dW5kZWZpbmVkO1xyXG5cclxuXHJcbiAgICB0ZXN0TGFiZWwuc2V0QXR0cmlidXRlKCdmb3InLCAnYScpO1xyXG4gICAgdGVzdExhYmVsWydodG1sRm9yJ10gIT09ICdhJyA/IGNyZWwuYXR0ck1hcFsnZm9yJ10gPSAnaHRtbEZvcic6dW5kZWZpbmVkO1xyXG5cclxuXHJcblxyXG4qL1xyXG5cclxuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XHJcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcm9vdC5jcmVsID0gZmFjdG9yeSgpO1xyXG4gICAgfVxyXG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBmbiA9ICdmdW5jdGlvbicsXHJcbiAgICAgICAgb2JqID0gJ29iamVjdCcsXHJcbiAgICAgICAgbm9kZVR5cGUgPSAnbm9kZVR5cGUnLFxyXG4gICAgICAgIHRleHRDb250ZW50ID0gJ3RleHRDb250ZW50JyxcclxuICAgICAgICBzZXRBdHRyaWJ1dGUgPSAnc2V0QXR0cmlidXRlJyxcclxuICAgICAgICBhdHRyTWFwU3RyaW5nID0gJ2F0dHJNYXAnLFxyXG4gICAgICAgIGlzTm9kZVN0cmluZyA9ICdpc05vZGUnLFxyXG4gICAgICAgIGlzRWxlbWVudFN0cmluZyA9ICdpc0VsZW1lbnQnLFxyXG4gICAgICAgIGQgPSB0eXBlb2YgZG9jdW1lbnQgPT09IG9iaiA/IGRvY3VtZW50IDoge30sXHJcbiAgICAgICAgaXNUeXBlID0gZnVuY3Rpb24oYSwgdHlwZSl7XHJcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgYSA9PT0gdHlwZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTm9kZSA9IHR5cGVvZiBOb2RlID09PSBmbiA/IGZ1bmN0aW9uIChvYmplY3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9iamVjdCBpbnN0YW5jZW9mIE5vZGU7XHJcbiAgICAgICAgfSA6XHJcbiAgICAgICAgLy8gaW4gSUUgPD0gOCBOb2RlIGlzIGFuIG9iamVjdCwgb2J2aW91c2x5Li5cclxuICAgICAgICBmdW5jdGlvbihvYmplY3Qpe1xyXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0ICYmXHJcbiAgICAgICAgICAgICAgICBpc1R5cGUob2JqZWN0LCBvYmopICYmXHJcbiAgICAgICAgICAgICAgICAobm9kZVR5cGUgaW4gb2JqZWN0KSAmJlxyXG4gICAgICAgICAgICAgICAgaXNUeXBlKG9iamVjdC5vd25lckRvY3VtZW50LG9iaik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc0VsZW1lbnQgPSBmdW5jdGlvbiAob2JqZWN0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjcmVsW2lzTm9kZVN0cmluZ10ob2JqZWN0KSAmJiBvYmplY3Rbbm9kZVR5cGVdID09PSAxO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNBcnJheSA9IGZ1bmN0aW9uKGEpe1xyXG4gICAgICAgICAgICByZXR1cm4gYSBpbnN0YW5jZW9mIEFycmF5O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYXBwZW5kQ2hpbGQgPSBmdW5jdGlvbihlbGVtZW50LCBjaGlsZCkge1xyXG4gICAgICAgICAgaWYoIWNyZWxbaXNOb2RlU3RyaW5nXShjaGlsZCkpe1xyXG4gICAgICAgICAgICAgIGNoaWxkID0gZC5jcmVhdGVUZXh0Tm9kZShjaGlsZCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGNoaWxkKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVsKCl7XHJcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsIC8vTm90ZTogYXNzaWduZWQgdG8gYSB2YXJpYWJsZSB0byBhc3Npc3QgY29tcGlsZXJzLiBTYXZlcyBhYm91dCA0MCBieXRlcyBpbiBjbG9zdXJlIGNvbXBpbGVyLiBIYXMgbmVnbGlnYWJsZSBlZmZlY3Qgb24gcGVyZm9ybWFuY2UuXHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBhcmdzWzBdLFxyXG4gICAgICAgICAgICBjaGlsZCxcclxuICAgICAgICAgICAgc2V0dGluZ3MgPSBhcmdzWzFdLFxyXG4gICAgICAgICAgICBjaGlsZEluZGV4ID0gMixcclxuICAgICAgICAgICAgYXJndW1lbnRzTGVuZ3RoID0gYXJncy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZU1hcCA9IGNyZWxbYXR0ck1hcFN0cmluZ107XHJcblxyXG4gICAgICAgIGVsZW1lbnQgPSBjcmVsW2lzRWxlbWVudFN0cmluZ10oZWxlbWVudCkgPyBlbGVtZW50IDogZC5jcmVhdGVFbGVtZW50KGVsZW1lbnQpO1xyXG4gICAgICAgIC8vIHNob3J0Y3V0XHJcbiAgICAgICAgaWYoYXJndW1lbnRzTGVuZ3RoID09PSAxKXtcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZighaXNUeXBlKHNldHRpbmdzLG9iaikgfHwgY3JlbFtpc05vZGVTdHJpbmddKHNldHRpbmdzKSB8fCBpc0FycmF5KHNldHRpbmdzKSkge1xyXG4gICAgICAgICAgICAtLWNoaWxkSW5kZXg7XHJcbiAgICAgICAgICAgIHNldHRpbmdzID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHNob3J0Y3V0IGlmIHRoZXJlIGlzIG9ubHkgb25lIGNoaWxkIHRoYXQgaXMgYSBzdHJpbmdcclxuICAgICAgICBpZigoYXJndW1lbnRzTGVuZ3RoIC0gY2hpbGRJbmRleCkgPT09IDEgJiYgaXNUeXBlKGFyZ3NbY2hpbGRJbmRleF0sICdzdHJpbmcnKSAmJiBlbGVtZW50W3RleHRDb250ZW50XSAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgZWxlbWVudFt0ZXh0Q29udGVudF0gPSBhcmdzW2NoaWxkSW5kZXhdO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBmb3IoOyBjaGlsZEluZGV4IDwgYXJndW1lbnRzTGVuZ3RoOyArK2NoaWxkSW5kZXgpe1xyXG4gICAgICAgICAgICAgICAgY2hpbGQgPSBhcmdzW2NoaWxkSW5kZXhdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKGNoaWxkID09IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc0FycmF5KGNoaWxkKSkge1xyXG4gICAgICAgICAgICAgICAgICBmb3IgKHZhciBpPTA7IGkgPCBjaGlsZC5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcGVuZENoaWxkKGVsZW1lbnQsIGNoaWxkW2ldKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgYXBwZW5kQ2hpbGQoZWxlbWVudCwgY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IodmFyIGtleSBpbiBzZXR0aW5ncyl7XHJcbiAgICAgICAgICAgIGlmKCFhdHRyaWJ1dGVNYXBba2V5XSl7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50W3NldEF0dHJpYnV0ZV0oa2V5LCBzZXR0aW5nc1trZXldKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB2YXIgYXR0ciA9IGF0dHJpYnV0ZU1hcFtrZXldO1xyXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIGF0dHIgPT09IGZuKXtcclxuICAgICAgICAgICAgICAgICAgICBhdHRyKGVsZW1lbnQsIHNldHRpbmdzW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudFtzZXRBdHRyaWJ1dGVdKGF0dHIsIHNldHRpbmdzW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVc2VkIGZvciBtYXBwaW5nIG9uZSBraW5kIG9mIGF0dHJpYnV0ZSB0byB0aGUgc3VwcG9ydGVkIHZlcnNpb24gb2YgdGhhdCBpbiBiYWQgYnJvd3NlcnMuXHJcbiAgICBjcmVsW2F0dHJNYXBTdHJpbmddID0ge307XHJcblxyXG4gICAgY3JlbFtpc0VsZW1lbnRTdHJpbmddID0gaXNFbGVtZW50O1xyXG5cclxuICAgIGNyZWxbaXNOb2RlU3RyaW5nXSA9IGlzTm9kZTtcclxuXHJcbiAgICByZXR1cm4gY3JlbDtcclxufSkpO1xyXG4iLCJ2YXIgcGFyc2VSZWdleCA9IC9eKC0/KD86XFxkK3xcXGQrXFwuXFxkK3xcXC5cXGQrKSkoW15cXC5dKj8pJC87XG5cbmZ1bmN0aW9uIHBhcnNlKGlucHV0KXtcbiAgICB2YXIgdmFsdWVQYXJ0cyA9IHBhcnNlUmVnZXguZXhlYyhpbnB1dCk7XG5cbiAgICBpZighdmFsdWVQYXJ0cyl7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogcGFyc2VGbG9hdCh2YWx1ZVBhcnRzWzFdKSxcbiAgICAgICAgdW5pdDogdmFsdWVQYXJ0c1syXVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGFkZFVuaXQoaW5wdXQsIHVuaXQpe1xuICAgIHZhciBwYXJzZWRJbnB1dCA9IHBhcnNlKGlucHV0KSxcbiAgICAgICAgcGFyc2VkVW5pdCA9IHBhcnNlKHVuaXQpO1xuXG4gICAgaWYoIXBhcnNlZElucHV0ICYmIHBhcnNlZFVuaXQpe1xuICAgICAgICB1bml0ID0gaW5wdXQ7XG4gICAgICAgIHBhcnNlZElucHV0ID0gcGFyc2VkVW5pdDtcbiAgICB9XG5cbiAgICBpZighaXNOYU4odW5pdCkpe1xuICAgICAgICB1bml0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZighcGFyc2VkSW5wdXQpe1xuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfVxuXG4gICAgaWYocGFyc2VkSW5wdXQudW5pdCA9PSBudWxsIHx8IHBhcnNlZElucHV0LnVuaXQgPT0gJycpe1xuICAgICAgICBwYXJzZWRJbnB1dC51bml0ID0gdW5pdCB8fCAncHgnO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJzZWRJbnB1dC52YWx1ZSArIHBhcnNlZElucHV0LnVuaXQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFkZFVuaXQ7XG5tb2R1bGUuZXhwb3J0cy5wYXJzZSA9IHBhcnNlOyIsInZhciB1bml0ciA9IHJlcXVpcmUoJ3VuaXRyJyksXG4gICAgdHlwZXMgPSB7XG4gICAgICAgICczZCc6ICczZCcsXG4gICAgICAgICd4JzogJ1gnLFxuICAgICAgICAneSc6ICdZJyxcbiAgICAgICAgJ3onOiAnWicsXG4gICAgICAgICcyZCc6ICcnLFxuICAgICAgICAnJzogJydcbiAgICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHR5cGUsIHgsIHksIHope1xuICAgIGlmKCFpc05hTih0eXBlKSl7XG4gICAgICAgIHogPSB5O1xuICAgICAgICB5ID0geDtcbiAgICAgICAgeCA9IHR5cGU7XG4gICAgICAgIHR5cGUgPSBudWxsO1xuICAgIH1cblxuICAgIHR5cGUgPSB0eXBlICYmIHR5cGUudG9Mb3dlckNhc2UoKSB8fCAnJztcblxuICAgIHZhciBhcmdzID0gW107XG5cbiAgICB4ICE9IG51bGwgJiYgYXJncy5wdXNoKHVuaXRyKHgpKTtcbiAgICB5ICE9IG51bGwgJiYgYXJncy5wdXNoKHVuaXRyKHkpKTtcbiAgICB6ICE9IG51bGwgJiYgYXJncy5wdXNoKHVuaXRyKHopKTtcblxuICAgIHJldHVybiAndHJhbnNsYXRlJyArXG4gICAgICAgIHR5cGVzW3R5cGVdICtcbiAgICAgICAgJygnICtcbiAgICAgICAgYXJncy5qb2luKCcsJykgK1xuICAgICAgICAnKSc7XG59IiwidmFyIGZyb21Db21wb25lbnRzID0gcmVxdWlyZSgnbWF0aC1qcy92ZWN0b3JzL2Zyb21Db21wb25lbnRzJyk7XG52YXIgYWRkVmVjdG9ycyA9IHJlcXVpcmUoJ21hdGgtanMvdmVjdG9ycy9hZGQnKTtcblxuZnVuY3Rpb24gZGlydmVjdG9yKHZhbGlkYXRvciwgc2V0dGluZ3Mpe1xuICAgIGlmKCFzZXR0aW5ncyl7XG4gICAgICAgIHNldHRpbmdzID0ge307XG4gICAgfVxuXG4gICAgdmFyIHZhbGlkLFxuICAgICAgICBtaW5NYWduaXR1ZGUgPSBzZXR0aW5ncy5tYWduaXR1ZGUgfHwgNSxcbiAgICAgICAgcHJldmlvdXNQb3NpdGlvbixcbiAgICAgICAgbmV0VmVjdG9yO1xuXG4gICAgdmFyIGdldFBvc2l0aW9uID0gc2V0dGluZ3MuZ2V0UG9zaXRpb24gfHwgZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogZXZlbnQueCAhPSBudWxsID8gZXZlbnQueCA6IGV2ZW50LnBhZ2VYLFxuICAgICAgICAgICAgeTogZXZlbnQueSAhPSBudWxsID8gZXZlbnQueSA6IGV2ZW50LnBhZ2VZXG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIHZhciBmaWx0ZXIgPSBmdW5jdGlvbihoYW5kbGVyKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGhhbmRsZUV2ZW50KGV2ZW50KXtcbiAgICAgICAgICAgIGlmKHZhbGlkID09PSBmYWxzZSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih2YWxpZCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXIoZXZlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZighcHJldmlvdXNQb3NpdGlvbil7XG4gICAgICAgICAgICAgICAgcHJldmlvdXNQb3NpdGlvbiA9IGdldFBvc2l0aW9uKGV2ZW50KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjdXJyZW50UG9zaXRpb24gPSBnZXRQb3NpdGlvbihldmVudCk7XG5cbiAgICAgICAgICAgIG5ldFZlY3RvciA9IGFkZFZlY3RvcnMobmV0VmVjdG9yLCBmcm9tQ29tcG9uZW50cyhcbiAgICAgICAgICAgICAgICBwcmV2aW91c1Bvc2l0aW9uLnggLSBjdXJyZW50UG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICBwcmV2aW91c1Bvc2l0aW9uLnkgLSBjdXJyZW50UG9zaXRpb24ueVxuICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgICAgIHByZXZpb3VzUG9zaXRpb24gPSBjdXJyZW50UG9zaXRpb247XG5cbiAgICAgICAgICAgIGlmKG1pbk1hZ25pdHVkZSA+IG5ldFZlY3Rvci5tYWduaXR1ZGUpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFsaWQgPSB2YWxpZGF0b3IobmV0VmVjdG9yKTtcbiAgICAgICAgICAgIGhhbmRsZUV2ZW50KGV2ZW50KTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgZmlsdGVyLnJlc2V0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcHJldmlvdXNQb3NpdGlvbiA9IG51bGw7XG4gICAgICAgIG5ldFZlY3RvciA9IHtkaXJlY3Rpb246IDAsIG1hZ25pdHVkZTogMH07XG4gICAgICAgIHZhbGlkID0gbnVsbDtcbiAgICB9O1xuXG4gICAgZmlsdGVyLnJlc2V0KCk7XG5cbiAgICByZXR1cm4gZmlsdGVyO1xufTtcblxuZGlydmVjdG9yLmhvcml6b250YWwgPSBmdW5jdGlvbih2ZWN0b3Ipe1xuICAgIHZhciBxdWFydGVyUEkgPSBNYXRoLlBJIC8gNCxcbiAgICAgICAgUEkgPSBNYXRoLlBJO1xuXG5cbiAgICByZXR1cm4gKFxuICAgICAgICAoXG4gICAgICAgICAgICB2ZWN0b3IuZGlyZWN0aW9uIDwgcXVhcnRlclBJICYmXG4gICAgICAgICAgICB2ZWN0b3IuZGlyZWN0aW9uID4gLXF1YXJ0ZXJQSVxuICAgICAgICApIHx8XG4gICAgICAgIChcbiAgICAgICAgICAgIHZlY3Rvci5kaXJlY3Rpb24gPiBxdWFydGVyUEkqMyB8fFxuICAgICAgICAgICAgdmVjdG9yLmRpcmVjdGlvbiA8IC1xdWFydGVyUEkqM1xuICAgICAgICApXG4gICAgKTtcbn07XG5cbmRpcnZlY3Rvci52ZXJ0aWNhbCA9IGZ1bmN0aW9uKHZlY3Rvcil7XG4gICAgcmV0dXJuICFkaXJ2ZWN0b3IuaG9yaXpvbnRhbCh2ZWN0b3IpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkaXJ2ZWN0b3I7IiwiLyoqXG4gICAgIyMgVmVjdG9yIGFkZGl0aW9uIC0gYWRkIHR3byB2ZWN0b3JzIGV4cHJlc3NlZCBpbiBwb2xhciBub3RhdGlvbiAjI1xuXG4gICAgYWRkKHZlY3RvckEgLSBhIHBvbGFyIHZlY3RvciwgdmVjdG9yQiAtIGFub3RoZXIgcG9sYXIgdmVjdG9yKVxuXG4gICAgcmV0dXJucyB7bWFnbml0dWRlLCBkaXJlY3Rpb24gZXhwcmVzc2VkIGFzIGFuIGFuZ2xlIGluIHJhZGlhbnN9XG5cbiAgICBSZWFsIHdvcmxkIGV4YW1wbGU6XG5cbiAgICAgLSAoMkQpIEFkZGluZyB0d28gdmVjdG9ycyB0byBwcm9kdWNlIGEgdGhpcmQgdmVjdG9yIHRoYXQgZGVzY3JpYmVzIHRoZSB0b3RhbCBtYWduaXR1ZGUgYW5kIGRpcmVjdGlvbi5cblxuICAgICAtIENhbiBiZSB1c2VkIHRvIGFwcGx5IHR3byBmb3JjZXMgb24gb25lIG9iamVjdCB0byBnZXQgYSBjb21iaW5lZCB2ZWN0b3JcblxuICAgICAgICAvLyByZXR1cm5zIGEgbmV3IHZlY3RvciB0aGF0IGlzIHRoZSBhZGRpdGlvbiBvZiB0aGUgdHdvIHBhc3NlZCB2ZWN0b3JzXG4gICAgICAgIGFkZCh2ZWN0b3IxLCB2ZWN0b3IyKTtcblxuKi9cblxudmFyIGZyb21Db21wb25lbnRzID0gcmVxdWlyZSgnLi9mcm9tQ29tcG9uZW50cycpLFxuICAgIHRvQ29tcG9uZW50cyA9IHJlcXVpcmUoJy4vdG9Db21wb25lbnRzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmVjdG9yQSwgdmVjdG9yQikge1xuICAgIHZhciBjb21wb25lbnRzQSA9IHRvQ29tcG9uZW50cyh2ZWN0b3JBLm1hZ25pdHVkZSwgdmVjdG9yQS5kaXJlY3Rpb24pLFxuICAgICAgICBjb21wb25lbnRzQiA9IHRvQ29tcG9uZW50cyh2ZWN0b3JCLm1hZ25pdHVkZSwgdmVjdG9yQi5kaXJlY3Rpb24pO1xuXG4gICAgcmV0dXJuIGZyb21Db21wb25lbnRzKGNvbXBvbmVudHNBLnggKyBjb21wb25lbnRzQi54LCBjb21wb25lbnRzQS55ICsgY29tcG9uZW50c0IueSk7XG59O1xuIiwiLyoqXG4gIyMgVmVjdG9yIGZyb20gQ29tcG9uZW50cyAjI1xuXG4gICAgZnJvbUNvbXBvbmVudHMoeCwgeSlcblxuIHJldHVybnMge21hZ25pdHVkZSwgZGlyZWN0aW9uIGV4cHJlc3NlZCBhcyBhbiBhbmdsZSBpbiByYWRpYW5zfVxuXG4gUmVhbCB3b3JsZCBleGFtcGxlOlxuXG4gLSAoMkQpIENvbnZlcnQgdmVjdG9yIGNvbXBvbmVudHMgaW50byB0aGVpciB2ZWN0b3IgZm9ybVxuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgdmFyIHNxdWFyZWQgPSBNYXRoLnBvdyh4LCAyKSArIE1hdGgucG93KHksIDIpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbWFnbml0dWRlOiBNYXRoLnNxcnQoc3F1YXJlZCksXG4gICAgICAgIGRpcmVjdGlvbjogTWF0aC5hdGFuMih5LCB4KVxuICAgIH07XG59OyIsIi8qKlxuICAgICMjIFZlY3RvciB0byBDb21wb25lbnRzICMjXG5cbiAgICAgICAgdG9Db21wb25lbnRzKG1hZ25pdHVkZSwgZGlyZWN0aW9uIGV4cHJlc3NlZCBhcyBhbiBhbmdsZSBpbiByYWRpYW5zKVxuXG4gICAgcmV0dXJucyB7eCwgeX1cblxuICAgIFJlYWwgd29ybGQgZXhhbXBsZTpcblxuICAgIC0gKDJEKSBjb252ZXJ0IGFuIGFuZ2xlIGFuZCBhIGRpc3RhbmNlIGludG8gYSBkaWZmZXJlbmNlIGluIHgseVxuXG4qL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1hZ25pdHVkZSwgZGlyZWN0aW9uKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IE1hdGguY29zKGRpcmVjdGlvbikgKiBtYWduaXR1ZGUsXG4gICAgICB5OiBNYXRoLnNpbihkaXJlY3Rpb24pICogbWFnbml0dWRlXG4gICAgfTtcbn07XG4iLCJ2YXIgZG9jID0ge1xyXG4gICAgZG9jdW1lbnQ6IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgPyBkb2N1bWVudCA6IG51bGwsXHJcbiAgICBzZXREb2N1bWVudDogZnVuY3Rpb24oZCl7XHJcbiAgICAgICAgdGhpcy5kb2N1bWVudCA9IGQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG52YXIgYXJyYXlQcm90byA9IFtdLFxyXG4gICAgaXNMaXN0ID0gcmVxdWlyZSgnLi9pc0xpc3QnKSxcclxuICAgIGdldFRhcmdldHMgPSByZXF1aXJlKCcuL2dldFRhcmdldHMnKShkb2MuZG9jdW1lbnQpLFxyXG4gICAgZ2V0VGFyZ2V0ID0gcmVxdWlyZSgnLi9nZXRUYXJnZXQnKShkb2MuZG9jdW1lbnQpLFxyXG4gICAgc3BhY2UgPSAnICc7XHJcblxyXG5cclxuLy8vW1JFQURNRS5tZF1cclxuXHJcbmZ1bmN0aW9uIGlzSW4oYXJyYXksIGl0ZW0pe1xyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYoaXRlbSA9PT0gYXJyYXlbaV0pe1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG5cclxuICAgICMjIC5maW5kXHJcblxyXG4gICAgZmluZHMgZWxlbWVudHMgdGhhdCBtYXRjaCB0aGUgcXVlcnkgd2l0aGluIHRoZSBzY29wZSBvZiB0YXJnZXRcclxuXHJcbiAgICAgICAgLy9mbHVlbnRcclxuICAgICAgICBkb2ModGFyZ2V0KS5maW5kKHF1ZXJ5KTtcclxuXHJcbiAgICAgICAgLy9sZWdhY3lcclxuICAgICAgICBkb2MuZmluZCh0YXJnZXQsIHF1ZXJ5KTtcclxuKi9cclxuXHJcbmZ1bmN0aW9uIGZpbmQodGFyZ2V0LCBxdWVyeSl7XHJcbiAgICB0YXJnZXQgPSBnZXRUYXJnZXRzKHRhcmdldCk7XHJcbiAgICBpZihxdWVyeSA9PSBudWxsKXtcclxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGlzTGlzdCh0YXJnZXQpKXtcclxuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFyZ2V0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBzdWJSZXN1bHRzID0gZG9jLmZpbmQodGFyZ2V0W2ldLCBxdWVyeSk7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBzdWJSZXN1bHRzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBpZighaXNJbihyZXN1bHRzLCBzdWJSZXN1bHRzW2pdKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHN1YlJlc3VsdHNbal0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YXJnZXQgPyB0YXJnZXQucXVlcnlTZWxlY3RvckFsbChxdWVyeSkgOiBbXTtcclxufVxyXG5cclxuLyoqXHJcblxyXG4gICAgIyMgLmZpbmRPbmVcclxuXHJcbiAgICBmaW5kcyB0aGUgZmlyc3QgZWxlbWVudCB0aGF0IG1hdGNoZXMgdGhlIHF1ZXJ5IHdpdGhpbiB0aGUgc2NvcGUgb2YgdGFyZ2V0XHJcblxyXG4gICAgICAgIC8vZmx1ZW50XHJcbiAgICAgICAgZG9jKHRhcmdldCkuZmluZE9uZShxdWVyeSk7XHJcblxyXG4gICAgICAgIC8vbGVnYWN5XHJcbiAgICAgICAgZG9jLmZpbmRPbmUodGFyZ2V0LCBxdWVyeSk7XHJcbiovXHJcblxyXG5mdW5jdGlvbiBmaW5kT25lKHRhcmdldCwgcXVlcnkpe1xyXG4gICAgdGFyZ2V0ID0gZ2V0VGFyZ2V0KHRhcmdldCk7XHJcbiAgICBpZihxdWVyeSA9PSBudWxsKXtcclxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGlzTGlzdCh0YXJnZXQpKXtcclxuICAgICAgICB2YXIgcmVzdWx0O1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFyZ2V0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZpbmRPbmUodGFyZ2V0W2ldLCBxdWVyeSk7XHJcbiAgICAgICAgICAgIGlmKHJlc3VsdCl7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YXJnZXQgPyB0YXJnZXQucXVlcnlTZWxlY3RvcihxdWVyeSkgOiBudWxsO1xyXG59XHJcblxyXG4vKipcclxuXHJcbiAgICAjIyAuY2xvc2VzdFxyXG5cclxuICAgIHJlY3Vyc2VzIHVwIHRoZSBET00gZnJvbSB0aGUgdGFyZ2V0IG5vZGUsIGNoZWNraW5nIGlmIHRoZSBjdXJyZW50IGVsZW1lbnQgbWF0Y2hlcyB0aGUgcXVlcnlcclxuXHJcbiAgICAgICAgLy9mbHVlbnRcclxuICAgICAgICBkb2ModGFyZ2V0KS5jbG9zZXN0KHF1ZXJ5KTtcclxuXHJcbiAgICAgICAgLy9sZWdhY3lcclxuICAgICAgICBkb2MuY2xvc2VzdCh0YXJnZXQsIHF1ZXJ5KTtcclxuKi9cclxuXHJcbmZ1bmN0aW9uIGNsb3Nlc3QodGFyZ2V0LCBxdWVyeSl7XHJcbiAgICB0YXJnZXQgPSBnZXRUYXJnZXQodGFyZ2V0KTtcclxuXHJcbiAgICBpZihpc0xpc3QodGFyZ2V0KSl7XHJcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0WzBdO1xyXG4gICAgfVxyXG5cclxuICAgIHdoaWxlKFxyXG4gICAgICAgIHRhcmdldCAmJlxyXG4gICAgICAgIHRhcmdldC5vd25lckRvY3VtZW50ICYmXHJcbiAgICAgICAgIWlzKHRhcmdldCwgcXVlcnkpXHJcbiAgICApe1xyXG4gICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YXJnZXQgPT09IGRvYy5kb2N1bWVudCAmJiB0YXJnZXQgIT09IHF1ZXJ5ID8gbnVsbCA6IHRhcmdldDtcclxufVxyXG5cclxuLyoqXHJcblxyXG4gICAgIyMgLmlzXHJcblxyXG4gICAgcmV0dXJucyB0cnVlIGlmIHRoZSB0YXJnZXQgZWxlbWVudCBtYXRjaGVzIHRoZSBxdWVyeVxyXG5cclxuICAgICAgICAvL2ZsdWVudFxyXG4gICAgICAgIGRvYyh0YXJnZXQpLmlzKHF1ZXJ5KTtcclxuXHJcbiAgICAgICAgLy9sZWdhY3lcclxuICAgICAgICBkb2MuaXModGFyZ2V0LCBxdWVyeSk7XHJcbiovXHJcblxyXG5mdW5jdGlvbiBpcyh0YXJnZXQsIHF1ZXJ5KXtcclxuICAgIHRhcmdldCA9IGdldFRhcmdldCh0YXJnZXQpO1xyXG5cclxuICAgIGlmKGlzTGlzdCh0YXJnZXQpKXtcclxuICAgICAgICB0YXJnZXQgPSB0YXJnZXRbMF07XHJcbiAgICB9XHJcblxyXG4gICAgaWYoIXRhcmdldC5vd25lckRvY3VtZW50IHx8IHR5cGVvZiBxdWVyeSAhPT0gJ3N0cmluZycpe1xyXG4gICAgICAgIHJldHVybiB0YXJnZXQgPT09IHF1ZXJ5O1xyXG4gICAgfVxyXG5cclxuICAgIGlmKHRhcmdldCA9PT0gcXVlcnkpe1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBwYXJlbnRsZXNzID0gIXRhcmdldC5wYXJlbnROb2RlO1xyXG5cclxuICAgIGlmKHBhcmVudGxlc3Mpe1xyXG4gICAgICAgIC8vIEdpdmUgdGhlIGVsZW1lbnQgYSBwYXJlbnQgc28gdGhhdCAucXVlcnlTZWxlY3RvckFsbCBjYW4gYmUgdXNlZFxyXG4gICAgICAgIGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKS5hcHBlbmRDaGlsZCh0YXJnZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciByZXN1bHQgPSBhcnJheVByb3RvLmluZGV4T2YuY2FsbChmaW5kKHRhcmdldC5wYXJlbnROb2RlLCBxdWVyeSksIHRhcmdldCkgPj0gMDtcclxuXHJcbiAgICBpZihwYXJlbnRsZXNzKXtcclxuICAgICAgICB0YXJnZXQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0YXJnZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG5cclxuICAgICMjIC5hZGRDbGFzc1xyXG5cclxuICAgIGFkZHMgY2xhc3NlcyB0byB0aGUgdGFyZ2V0IChzcGFjZSBzZXBhcmF0ZWQgc3RyaW5nIG9yIGFycmF5KVxyXG5cclxuICAgICAgICAvL2ZsdWVudFxyXG4gICAgICAgIGRvYyh0YXJnZXQpLmFkZENsYXNzKHF1ZXJ5KTtcclxuXHJcbiAgICAgICAgLy9sZWdhY3lcclxuICAgICAgICBkb2MuYWRkQ2xhc3ModGFyZ2V0LCBxdWVyeSk7XHJcbiovXHJcblxyXG5mdW5jdGlvbiBhZGRDbGFzcyh0YXJnZXQsIGNsYXNzZXMpe1xyXG4gICAgdGFyZ2V0ID0gZ2V0VGFyZ2V0cyh0YXJnZXQpO1xyXG5cclxuICAgIGlmKGlzTGlzdCh0YXJnZXQpKXtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRhcmdldC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBhZGRDbGFzcyh0YXJnZXRbaV0sIGNsYXNzZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGlmKCFjbGFzc2VzKXtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2xhc3NlcyA9IEFycmF5LmlzQXJyYXkoY2xhc3NlcykgPyBjbGFzc2VzIDogY2xhc3Nlcy5zcGxpdChzcGFjZSksXHJcbiAgICAgICAgY3VycmVudENsYXNzZXMgPSB0YXJnZXQuY2xhc3NMaXN0ID8gbnVsbCA6IHRhcmdldC5jbGFzc05hbWUuc3BsaXQoc3BhY2UpO1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICB2YXIgY2xhc3NUb0FkZCA9IGNsYXNzZXNbaV07XHJcbiAgICAgICAgaWYoIWNsYXNzVG9BZGQgfHwgY2xhc3NUb0FkZCA9PT0gc3BhY2Upe1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGFyZ2V0LmNsYXNzTGlzdCl7XHJcbiAgICAgICAgICAgIHRhcmdldC5jbGFzc0xpc3QuYWRkKGNsYXNzVG9BZGQpO1xyXG4gICAgICAgIH0gZWxzZSBpZighY3VycmVudENsYXNzZXMuaW5kZXhPZihjbGFzc1RvQWRkKT49MCl7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDbGFzc2VzLnB1c2goY2xhc3NUb0FkZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYoIXRhcmdldC5jbGFzc0xpc3Qpe1xyXG4gICAgICAgIHRhcmdldC5jbGFzc05hbWUgPSBjdXJyZW50Q2xhc3Nlcy5qb2luKHNwYWNlKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG4vKipcclxuXHJcbiAgICAjIyAucmVtb3ZlQ2xhc3NcclxuXHJcbiAgICByZW1vdmVzIGNsYXNzZXMgZnJvbSB0aGUgdGFyZ2V0IChzcGFjZSBzZXBhcmF0ZWQgc3RyaW5nIG9yIGFycmF5KVxyXG5cclxuICAgICAgICAvL2ZsdWVudFxyXG4gICAgICAgIGRvYyh0YXJnZXQpLnJlbW92ZUNsYXNzKHF1ZXJ5KTtcclxuXHJcbiAgICAgICAgLy9sZWdhY3lcclxuICAgICAgICBkb2MucmVtb3ZlQ2xhc3ModGFyZ2V0LCBxdWVyeSk7XHJcbiovXHJcblxyXG5mdW5jdGlvbiByZW1vdmVDbGFzcyh0YXJnZXQsIGNsYXNzZXMpe1xyXG4gICAgdGFyZ2V0ID0gZ2V0VGFyZ2V0cyh0YXJnZXQpO1xyXG5cclxuICAgIGlmKGlzTGlzdCh0YXJnZXQpKXtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRhcmdldC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICByZW1vdmVDbGFzcyh0YXJnZXRbaV0sIGNsYXNzZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBpZighY2xhc3Nlcyl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNsYXNzZXMgPSBBcnJheS5pc0FycmF5KGNsYXNzZXMpID8gY2xhc3NlcyA6IGNsYXNzZXMuc3BsaXQoc3BhY2UpLFxyXG4gICAgICAgIGN1cnJlbnRDbGFzc2VzID0gdGFyZ2V0LmNsYXNzTGlzdCA/IG51bGwgOiB0YXJnZXQuY2xhc3NOYW1lLnNwbGl0KHNwYWNlKTtcclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgdmFyIGNsYXNzVG9SZW1vdmUgPSBjbGFzc2VzW2ldO1xyXG4gICAgICAgIGlmKCFjbGFzc1RvUmVtb3ZlIHx8IGNsYXNzVG9SZW1vdmUgPT09IHNwYWNlKXtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRhcmdldC5jbGFzc0xpc3Qpe1xyXG4gICAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc1RvUmVtb3ZlKTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByZW1vdmVJbmRleCA9IGN1cnJlbnRDbGFzc2VzLmluZGV4T2YoY2xhc3NUb1JlbW92ZSk7XHJcbiAgICAgICAgaWYocmVtb3ZlSW5kZXggPj0gMCl7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDbGFzc2VzLnNwbGljZShyZW1vdmVJbmRleCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYoIXRhcmdldC5jbGFzc0xpc3Qpe1xyXG4gICAgICAgIHRhcmdldC5jbGFzc05hbWUgPSBjdXJyZW50Q2xhc3Nlcy5qb2luKHNwYWNlKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRFdmVudChzZXR0aW5ncyl7XHJcbiAgICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KHNldHRpbmdzLnRhcmdldCk7XHJcbiAgICBpZih0YXJnZXQpe1xyXG4gICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKHNldHRpbmdzLmV2ZW50LCBzZXR0aW5ncy5jYWxsYmFjaywgZmFsc2UpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdObyBlbGVtZW50cyBtYXRjaGVkIHRoZSBzZWxlY3Rvciwgc28gbm8gZXZlbnRzIHdlcmUgYm91bmQuJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG5cclxuICAgICMjIC5vblxyXG5cclxuICAgIGJpbmRzIGEgY2FsbGJhY2sgdG8gYSB0YXJnZXQgd2hlbiBhIERPTSBldmVudCBpcyByYWlzZWQuXHJcblxyXG4gICAgICAgIC8vZmx1ZW50XHJcbiAgICAgICAgZG9jKHRhcmdldC9wcm94eSkub24oZXZlbnRzLCB0YXJnZXRbb3B0aW9uYWxdLCBjYWxsYmFjayk7XHJcblxyXG4gICAgbm90ZTogaWYgYSB0YXJnZXQgaXMgcGFzc2VkIHRvIHRoZSAub24gZnVuY3Rpb24sIGRvYydzIHRhcmdldCB3aWxsIGJlIHVzZWQgYXMgdGhlIHByb3h5LlxyXG5cclxuICAgICAgICAvL2xlZ2FjeVxyXG4gICAgICAgIGRvYy5vbihldmVudHMsIHRhcmdldCwgcXVlcnksIHByb3h5W29wdGlvbmFsXSk7XHJcbiovXHJcblxyXG5mdW5jdGlvbiBvbihldmVudHMsIHRhcmdldCwgY2FsbGJhY2ssIHByb3h5KXtcclxuXHJcbiAgICBwcm94eSA9IGdldFRhcmdldHMocHJveHkpO1xyXG5cclxuICAgIGlmKCFwcm94eSl7XHJcbiAgICAgICAgdGFyZ2V0ID0gZ2V0VGFyZ2V0cyh0YXJnZXQpO1xyXG4gICAgICAgIC8vIGhhbmRsZXMgbXVsdGlwbGUgdGFyZ2V0c1xyXG4gICAgICAgIGlmKGlzTGlzdCh0YXJnZXQpKXtcclxuICAgICAgICAgICAgdmFyIG11bHRpUmVtb3ZlQ2FsbGJhY2tzID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFyZ2V0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBtdWx0aVJlbW92ZUNhbGxiYWNrcy5wdXNoKG9uKGV2ZW50cywgdGFyZ2V0W2ldLCBjYWxsYmFjaywgcHJveHkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHdoaWxlKG11bHRpUmVtb3ZlQ2FsbGJhY2tzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbXVsdGlSZW1vdmVDYWxsYmFja3MucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGhhbmRsZXMgbXVsdGlwbGUgcHJveGllc1xyXG4gICAgLy8gQWxyZWFkeSBoYW5kbGVzIG11bHRpcGxlIHByb3hpZXMgYW5kIHRhcmdldHMsXHJcbiAgICAvLyBiZWNhdXNlIHRoZSB0YXJnZXQgbG9vcCBjYWxscyB0aGlzIGxvb3AuXHJcbiAgICBpZihpc0xpc3QocHJveHkpKXtcclxuICAgICAgICB2YXIgbXVsdGlSZW1vdmVDYWxsYmFja3MgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3h5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIG11bHRpUmVtb3ZlQ2FsbGJhY2tzLnB1c2gob24oZXZlbnRzLCB0YXJnZXQsIGNhbGxiYWNrLCBwcm94eVtpXSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgd2hpbGUobXVsdGlSZW1vdmVDYWxsYmFja3MubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgIG11bHRpUmVtb3ZlQ2FsbGJhY2tzLnBvcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcmVtb3ZlQ2FsbGJhY2tzID0gW107XHJcblxyXG4gICAgaWYodHlwZW9mIGV2ZW50cyA9PT0gJ3N0cmluZycpe1xyXG4gICAgICAgIGV2ZW50cyA9IGV2ZW50cy5zcGxpdChzcGFjZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgdmFyIGV2ZW50U2V0dGluZ3MgPSB7fTtcclxuICAgICAgICBpZihwcm94eSl7XHJcbiAgICAgICAgICAgIGlmKHByb3h5ID09PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgIHByb3h5ID0gZG9jLmRvY3VtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGV2ZW50U2V0dGluZ3MudGFyZ2V0ID0gcHJveHk7XHJcbiAgICAgICAgICAgIGV2ZW50U2V0dGluZ3MuY2FsbGJhY2sgPSBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2xvc2VzdFRhcmdldCA9IGNsb3Nlc3QoZXZlbnQudGFyZ2V0LCB0YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgaWYoY2xvc2VzdFRhcmdldCl7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXZlbnQsIGNsb3Nlc3RUYXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBldmVudFNldHRpbmdzLnRhcmdldCA9IHRhcmdldDtcclxuICAgICAgICAgICAgZXZlbnRTZXR0aW5ncy5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZXZlbnRTZXR0aW5ncy5ldmVudCA9IGV2ZW50c1tpXTtcclxuXHJcbiAgICAgICAgYWRkRXZlbnQoZXZlbnRTZXR0aW5ncyk7XHJcblxyXG4gICAgICAgIHJlbW92ZUNhbGxiYWNrcy5wdXNoKGV2ZW50U2V0dGluZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHdoaWxlKHJlbW92ZUNhbGxiYWNrcy5sZW5ndGgpe1xyXG4gICAgICAgICAgICB2YXIgcmVtb3ZlQ2FsbGJhY2sgPSByZW1vdmVDYWxsYmFja3MucG9wKCk7XHJcbiAgICAgICAgICAgIGdldFRhcmdldChyZW1vdmVDYWxsYmFjay50YXJnZXQpLnJlbW92ZUV2ZW50TGlzdGVuZXIocmVtb3ZlQ2FsbGJhY2suZXZlbnQsIHJlbW92ZUNhbGxiYWNrLmNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG5cclxuICAgICMjIC5vZmZcclxuXHJcbiAgICByZW1vdmVzIGV2ZW50cyBhc3NpZ25lZCB0byBhIHRhcmdldC5cclxuXHJcbiAgICAgICAgLy9mbHVlbnRcclxuICAgICAgICBkb2ModGFyZ2V0L3Byb3h5KS5vZmYoZXZlbnRzLCB0YXJnZXRbb3B0aW9uYWxdLCBjYWxsYmFjayk7XHJcblxyXG4gICAgbm90ZTogaWYgYSB0YXJnZXQgaXMgcGFzc2VkIHRvIHRoZSAub24gZnVuY3Rpb24sIGRvYydzIHRhcmdldCB3aWxsIGJlIHVzZWQgYXMgdGhlIHByb3h5LlxyXG5cclxuICAgICAgICAvL2xlZ2FjeVxyXG4gICAgICAgIGRvYy5vZmYoZXZlbnRzLCB0YXJnZXQsIGNhbGxiYWNrLCBwcm94eSk7XHJcbiovXHJcblxyXG5mdW5jdGlvbiBvZmYoZXZlbnRzLCB0YXJnZXQsIGNhbGxiYWNrLCBwcm94eSl7XHJcbiAgICBpZihpc0xpc3QodGFyZ2V0KSl7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXJnZXQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgb2ZmKGV2ZW50cywgdGFyZ2V0W2ldLCBjYWxsYmFjaywgcHJveHkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGlmKHByb3h5IGluc3RhbmNlb2YgQXJyYXkpe1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJveHkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgb2ZmKGV2ZW50cywgdGFyZ2V0LCBjYWxsYmFjaywgcHJveHlbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBpZih0eXBlb2YgZXZlbnRzID09PSAnc3RyaW5nJyl7XHJcbiAgICAgICAgZXZlbnRzID0gZXZlbnRzLnNwbGl0KHNwYWNlKTtcclxuICAgIH1cclxuXHJcbiAgICBpZih0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpe1xyXG4gICAgICAgIHByb3h5ID0gY2FsbGJhY2s7XHJcbiAgICAgICAgY2FsbGJhY2sgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3h5ID0gcHJveHkgPyBnZXRUYXJnZXQocHJveHkpIDogZG9jLmRvY3VtZW50O1xyXG5cclxuICAgIHZhciB0YXJnZXRzID0gdHlwZW9mIHRhcmdldCA9PT0gJ3N0cmluZycgPyBmaW5kKHRhcmdldCwgcHJveHkpIDogW3RhcmdldF07XHJcblxyXG4gICAgZm9yKHZhciB0YXJnZXRJbmRleCA9IDA7IHRhcmdldEluZGV4IDwgdGFyZ2V0cy5sZW5ndGg7IHRhcmdldEluZGV4Kyspe1xyXG4gICAgICAgIHZhciBjdXJyZW50VGFyZ2V0ID0gdGFyZ2V0c1t0YXJnZXRJbmRleF07XHJcblxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBjdXJyZW50VGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRzW2ldLCBjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbi8qKlxyXG5cclxuICAgICMjIC5hcHBlbmRcclxuXHJcbiAgICBhZGRzIGVsZW1lbnRzIHRvIGEgdGFyZ2V0XHJcblxyXG4gICAgICAgIC8vZmx1ZW50XHJcbiAgICAgICAgZG9jKHRhcmdldCkuYXBwZW5kKGNoaWxkcmVuKTtcclxuXHJcbiAgICAgICAgLy9sZWdhY3lcclxuICAgICAgICBkb2MuYXBwZW5kKHRhcmdldCwgY2hpbGRyZW4pO1xyXG4qL1xyXG5cclxuZnVuY3Rpb24gYXBwZW5kKHRhcmdldCwgY2hpbGRyZW4pe1xyXG4gICAgdmFyIHRhcmdldCA9IGdldFRhcmdldCh0YXJnZXQpLFxyXG4gICAgICAgIGNoaWxkcmVuID0gZ2V0VGFyZ2V0KGNoaWxkcmVuKTtcclxuXHJcbiAgICBpZihpc0xpc3QodGFyZ2V0KSl7XHJcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0WzBdO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGlzTGlzdChjaGlsZHJlbikpe1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYXBwZW5kKHRhcmdldCwgY2hpbGRyZW5baV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKGNoaWxkcmVuKTtcclxufVxyXG5cclxuLyoqXHJcblxyXG4gICAgIyMgLnByZXBlbmRcclxuXHJcbiAgICBhZGRzIGVsZW1lbnRzIHRvIHRoZSBmcm9udCBvZiBhIHRhcmdldFxyXG5cclxuICAgICAgICAvL2ZsdWVudFxyXG4gICAgICAgIGRvYyh0YXJnZXQpLnByZXBlbmQoY2hpbGRyZW4pO1xyXG5cclxuICAgICAgICAvL2xlZ2FjeVxyXG4gICAgICAgIGRvYy5wcmVwZW5kKHRhcmdldCwgY2hpbGRyZW4pO1xyXG4qL1xyXG5cclxuZnVuY3Rpb24gcHJlcGVuZCh0YXJnZXQsIGNoaWxkcmVuKXtcclxuICAgIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQodGFyZ2V0KSxcclxuICAgICAgICBjaGlsZHJlbiA9IGdldFRhcmdldChjaGlsZHJlbik7XHJcblxyXG4gICAgaWYoaXNMaXN0KHRhcmdldCkpe1xyXG4gICAgICAgIHRhcmdldCA9IHRhcmdldFswXTtcclxuICAgIH1cclxuXHJcbiAgICBpZihpc0xpc3QoY2hpbGRyZW4pKXtcclxuICAgICAgICAvL3JldmVyc2VkIGJlY2F1c2Ugb3RoZXJ3aXNlIHRoZSB3b3VsZCBnZXQgcHV0IGluIGluIHRoZSB3cm9uZyBvcmRlci5cclxuICAgICAgICBmb3IgKHZhciBpID0gY2hpbGRyZW4ubGVuZ3RoIC0xOyBpOyBpLS0pIHtcclxuICAgICAgICAgICAgcHJlcGVuZCh0YXJnZXQsIGNoaWxkcmVuW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRhcmdldC5pbnNlcnRCZWZvcmUoY2hpbGRyZW4sIHRhcmdldC5maXJzdENoaWxkKTtcclxufVxyXG5cclxuLyoqXHJcblxyXG4gICAgIyMgLmlzVmlzaWJsZVxyXG5cclxuICAgIGNoZWNrcyBpZiBhbiBlbGVtZW50IG9yIGFueSBvZiBpdHMgcGFyZW50cyBkaXNwbGF5IHByb3BlcnRpZXMgYXJlIHNldCB0byAnbm9uZSdcclxuXHJcbiAgICAgICAgLy9mbHVlbnRcclxuICAgICAgICBkb2ModGFyZ2V0KS5pc1Zpc2libGUoKTtcclxuXHJcbiAgICAgICAgLy9sZWdhY3lcclxuICAgICAgICBkb2MuaXNWaXNpYmxlKHRhcmdldCk7XHJcbiovXHJcblxyXG5mdW5jdGlvbiBpc1Zpc2libGUodGFyZ2V0KXtcclxuICAgIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQodGFyZ2V0KTtcclxuICAgIGlmKCF0YXJnZXQpe1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmKGlzTGlzdCh0YXJnZXQpKXtcclxuICAgICAgICB2YXIgaSA9IC0xO1xyXG5cclxuICAgICAgICB3aGlsZSAodGFyZ2V0W2krK10gJiYgaXNWaXNpYmxlKHRhcmdldFtpXSkpIHt9XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldC5sZW5ndGggPj0gaTtcclxuICAgIH1cclxuICAgIHdoaWxlKHRhcmdldC5wYXJlbnROb2RlICYmIHRhcmdldC5zdHlsZS5kaXNwbGF5ICE9PSAnbm9uZScpe1xyXG4gICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YXJnZXQgPT09IGRvYy5kb2N1bWVudDtcclxufVxyXG5cclxuLyoqXHJcblxyXG4gICAgIyMgLmluZGV4T2ZFbGVtZW50XHJcblxyXG4gICAgcmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGVsZW1lbnQgd2l0aGluIGl0J3MgcGFyZW50IGVsZW1lbnQuXHJcblxyXG4gICAgICAgIC8vZmx1ZW50XHJcbiAgICAgICAgZG9jKHRhcmdldCkuaW5kZXhPZkVsZW1lbnQoKTtcclxuXHJcbiAgICAgICAgLy9sZWdhY3lcclxuICAgICAgICBkb2MuaW5kZXhPZkVsZW1lbnQodGFyZ2V0KTtcclxuXHJcbiovXHJcblxyXG5mdW5jdGlvbiBpbmRleE9mRWxlbWVudCh0YXJnZXQpIHtcclxuICAgIHRhcmdldCA9IGdldFRhcmdldHModGFyZ2V0KTtcclxuICAgIGlmKCF0YXJnZXQpe1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZihpc0xpc3QodGFyZ2V0KSl7XHJcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0WzBdO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBpID0gLTE7XHJcblxyXG4gICAgdmFyIHBhcmVudCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xyXG5cclxuICAgIGlmKCFwYXJlbnQpe1xyXG4gICAgICAgIHJldHVybiBpO1xyXG4gICAgfVxyXG5cclxuICAgIHdoaWxlKHBhcmVudC5jaGlsZHJlblsrK2ldICE9PSB0YXJnZXQpe31cclxuXHJcbiAgICByZXR1cm4gaTtcclxufVxyXG5cclxuXHJcbi8qKlxyXG5cclxuICAgICMjIC5yZWFkeVxyXG5cclxuICAgIGNhbGwgYSBjYWxsYmFjayB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeS5cclxuXHJcbiAgICByZXR1cm5zIC0xIGlmIHRoZXJlIGlzIG5vIHBhcmVudEVsZW1lbnQgb24gdGhlIHRhcmdldC5cclxuXHJcbiAgICAgICAgLy9mbHVlbnRcclxuICAgICAgICBkb2MoKS5yZWFkeShjYWxsYmFjayk7XHJcblxyXG4gICAgICAgIC8vbGVnYWN5XHJcbiAgICAgICAgZG9jLnJlYWR5KGNhbGxiYWNrKTtcclxuKi9cclxuXHJcbmZ1bmN0aW9uIHJlYWR5KGNhbGxiYWNrKXtcclxuICAgIGlmKGRvYy5kb2N1bWVudCAmJiBkb2MuZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyl7XHJcbiAgICAgICAgY2FsbGJhY2soKTtcclxuICAgIH1lbHNlIGlmKHdpbmRvdy5hdHRhY2hFdmVudCl7XHJcbiAgICAgICAgZG9jdW1lbnQuYXR0YWNoRXZlbnQoXCJvbnJlYWR5c3RhdGVjaGFuZ2VcIiwgY2FsbGJhY2spO1xyXG4gICAgICAgIHdpbmRvdy5hdHRhY2hFdmVudChcIm9uTG9hZFwiLGNhbGxiYWNrKTtcclxuICAgIH1lbHNlIGlmKGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpe1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsY2FsbGJhY2ssZmFsc2UpO1xyXG4gICAgfVxyXG59XHJcblxyXG5kb2MuZmluZCA9IGZpbmQ7XHJcbmRvYy5maW5kT25lID0gZmluZE9uZTtcclxuZG9jLmNsb3Nlc3QgPSBjbG9zZXN0O1xyXG5kb2MuaXMgPSBpcztcclxuZG9jLmFkZENsYXNzID0gYWRkQ2xhc3M7XHJcbmRvYy5yZW1vdmVDbGFzcyA9IHJlbW92ZUNsYXNzO1xyXG5kb2Mub2ZmID0gb2ZmO1xyXG5kb2Mub24gPSBvbjtcclxuZG9jLmFwcGVuZCA9IGFwcGVuZDtcclxuZG9jLnByZXBlbmQgPSBwcmVwZW5kO1xyXG5kb2MuaXNWaXNpYmxlID0gaXNWaXNpYmxlO1xyXG5kb2MucmVhZHkgPSByZWFkeTtcclxuZG9jLmluZGV4T2ZFbGVtZW50ID0gaW5kZXhPZkVsZW1lbnQ7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGRvYzsiLCJ2YXIgZG9jID0gcmVxdWlyZSgnLi9kb2MnKSxcclxuICAgIGlzTGlzdCA9IHJlcXVpcmUoJy4vaXNMaXN0JyksXHJcbiAgICBnZXRUYXJnZXRzID0gcmVxdWlyZSgnLi9nZXRUYXJnZXRzJykoZG9jLmRvY3VtZW50KSxcclxuICAgIGZsb2NQcm90byA9IFtdO1xyXG5cclxuZnVuY3Rpb24gRmxvYyhpdGVtcyl7XHJcbiAgICB0aGlzLnB1c2guYXBwbHkodGhpcywgaXRlbXMpO1xyXG59XHJcbkZsb2MucHJvdG90eXBlID0gZmxvY1Byb3RvO1xyXG5mbG9jUHJvdG8uY29uc3RydWN0b3IgPSBGbG9jO1xyXG5cclxuZnVuY3Rpb24gZmxvYyh0YXJnZXQpe1xyXG4gICAgdmFyIGluc3RhbmNlID0gZ2V0VGFyZ2V0cyh0YXJnZXQpO1xyXG5cclxuICAgIGlmKCFpc0xpc3QoaW5zdGFuY2UpKXtcclxuICAgICAgICBpZihpbnN0YW5jZSl7XHJcbiAgICAgICAgICAgIGluc3RhbmNlID0gW2luc3RhbmNlXTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgaW5zdGFuY2UgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IEZsb2MoaW5zdGFuY2UpO1xyXG59XHJcblxyXG52YXIgcmV0dXJuc1NlbGYgPSAnYWRkQ2xhc3MgcmVtb3ZlQ2xhc3MgYXBwZW5kIHByZXBlbmQnLnNwbGl0KCcgJyk7XHJcblxyXG5mb3IodmFyIGtleSBpbiBkb2Mpe1xyXG4gICAgaWYodHlwZW9mIGRvY1trZXldID09PSAnZnVuY3Rpb24nKXtcclxuICAgICAgICBmbG9jW2tleV0gPSBkb2Nba2V5XTtcclxuICAgICAgICBmbG9jUHJvdG9ba2V5XSA9IChmdW5jdGlvbihrZXkpe1xyXG4gICAgICAgICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgICAgICAvLyBUaGlzIGlzIGFsc28gZXh0cmVtZWx5IGRvZGd5IGFuZCBmYXN0XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihhLGIsYyxkLGUsZil7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gZG9jW2tleV0odGhpcywgYSxiLGMsZCxlLGYpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHJlc3VsdCAhPT0gZG9jICYmIGlzTGlzdChyZXN1bHQpKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmxvYyhyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYocmV0dXJuc1NlbGYuaW5kZXhPZihrZXkpID49MCl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KGtleSkpO1xyXG4gICAgfVxyXG59XHJcbmZsb2NQcm90by5vbiA9IGZ1bmN0aW9uKGV2ZW50cywgdGFyZ2V0LCBjYWxsYmFjayl7XHJcbiAgICB2YXIgcHJveHkgPSB0aGlzO1xyXG4gICAgaWYodHlwZW9mIHRhcmdldCA9PT0gJ2Z1bmN0aW9uJyl7XHJcbiAgICAgICAgY2FsbGJhY2sgPSB0YXJnZXQ7XHJcbiAgICAgICAgdGFyZ2V0ID0gdGhpcztcclxuICAgICAgICBwcm94eSA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBkb2Mub24oZXZlbnRzLCB0YXJnZXQsIGNhbGxiYWNrLCBwcm94eSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbmZsb2NQcm90by5vZmYgPSBmdW5jdGlvbihldmVudHMsIHRhcmdldCwgY2FsbGJhY2spe1xyXG4gICAgdmFyIHJlZmVyZW5jZSA9IHRoaXM7XHJcbiAgICBpZih0eXBlb2YgdGFyZ2V0ID09PSAnZnVuY3Rpb24nKXtcclxuICAgICAgICBjYWxsYmFjayA9IHRhcmdldDtcclxuICAgICAgICB0YXJnZXQgPSB0aGlzO1xyXG4gICAgICAgIHJlZmVyZW5jZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBkb2Mub2ZmKGV2ZW50cywgdGFyZ2V0LCBjYWxsYmFjaywgcmVmZXJlbmNlKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuZmxvY1Byb3RvLnJlYWR5ID0gZnVuY3Rpb24oY2FsbGJhY2spe1xyXG4gICAgZG9jLnJlYWR5KGNhbGxiYWNrKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuZmxvY1Byb3RvLmFkZENsYXNzID0gZnVuY3Rpb24oY2xhc3NOYW1lKXtcclxuICAgIGRvYy5hZGRDbGFzcyh0aGlzLCBjbGFzc05hbWUpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5mbG9jUHJvdG8ucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihjbGFzc05hbWUpe1xyXG4gICAgZG9jLnJlbW92ZUNsYXNzKHRoaXMsIGNsYXNzTmFtZSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZmxvYzsiLCJ2YXIgc2luZ2xlSWQgPSAvXiNcXHcrJC87XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZG9jdW1lbnQpe1xuICAgIHJldHVybiBmdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KXtcbiAgICAgICAgaWYodHlwZW9mIHRhcmdldCA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgaWYoc2luZ2xlSWQuZXhlYyh0YXJnZXQpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0LnNsaWNlKDEpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH07XG59OyIsIlxudmFyIHNpbmdsZUNsYXNzID0gL15cXC5cXHcrJC8sXG4gICAgc2luZ2xlSWQgPSAvXiNcXHcrJC8sXG4gICAgc2luZ2xlVGFnID0gL15cXHcrJC87XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZG9jdW1lbnQpe1xuICAgIHJldHVybiBmdW5jdGlvbiBnZXRUYXJnZXRzKHRhcmdldCl7XG4gICAgICAgIGlmKHR5cGVvZiB0YXJnZXQgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgIGlmKHNpbmdsZUlkLmV4ZWModGFyZ2V0KSl7XG4gICAgICAgICAgICAgICAgLy8gSWYgeW91IGhhdmUgbW9yZSB0aGFuIDEgb2YgdGhlIHNhbWUgaWQgaW4geW91ciBwYWdlLFxuICAgICAgICAgICAgICAgIC8vIHRoYXRzIHlvdXIgb3duIHN0dXBpZCBmYXVsdC5cbiAgICAgICAgICAgICAgICByZXR1cm4gW2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldC5zbGljZSgxKSldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoc2luZ2xlVGFnLmV4ZWModGFyZ2V0KSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKHRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihzaW5nbGVDbGFzcy5leGVjKHRhcmdldCkpe1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKHRhcmdldC5zbGljZSgxKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0YXJnZXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzTGlzdChvYmplY3Qpe1xyXG4gICAgcmV0dXJuIG9iamVjdCAhPSBudWxsICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmICdsZW5ndGgnIGluIG9iamVjdCAmJiAhKCdub2RlVHlwZScgaW4gb2JqZWN0KSAmJiBvYmplY3Quc2VsZiAhPSBvYmplY3Q7IC8vIGluIElFOCwgd2luZG93LnNlbGYgaXMgd2luZG93LCBidXQgaXQgaXMgbm90ID09PSB3aW5kb3csIGJ1dCBpdCBpcyA9PSB3aW5kb3cuLi4uLi4uLi4gV1RGIT9cclxufSIsInZhciBpbnRlcmFjdGlvbnMgPSBbXSxcclxuICAgIG1pbk1vdmVEaXN0YW5jZSA9IDUsXHJcbiAgICBpbnRlcmFjdCxcclxuICAgIG1heGltdW1Nb3Zlc1RvUGVyc2lzdCA9IDEwMDAsIC8vIFNob3VsZCBiZSBwbGVudHkuLlxyXG4gICAgcHJvcGVydGllc1RvQ29weSA9ICd0YXJnZXQscGFnZVgscGFnZVksY2xpZW50WCxjbGllbnRZLG9mZnNldFgsb2Zmc2V0WSxzY3JlZW5YLHNjcmVlblksc2hpZnRLZXkseCx5Jy5zcGxpdCgnLCcpLCAvLyBTdHVmZiB0aGF0IHdpbGwgYmUgb24gZXZlcnkgaW50ZXJhY3Rpb24uXHJcbiAgICBkID0gdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyA/IGRvY3VtZW50IDogbnVsbDtcclxuXHJcbmZ1bmN0aW9uIEludGVyYWN0KCl7XHJcbiAgICB0aGlzLl9lbGVtZW50cyA9IFtdO1xyXG59XHJcbkludGVyYWN0LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgdGFyZ2V0LCBjYWxsYmFjayl7XHJcbiAgICBpZighdGFyZ2V0KXtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0YXJnZXQuX2ludGVyYWN0RXZlbnRzID0gdGFyZ2V0Ll9pbnRlcmFjdEV2ZW50cyB8fCB7fTtcclxuICAgIHRhcmdldC5faW50ZXJhY3RFdmVudHNbZXZlbnROYW1lXSA9IHRhcmdldC5faW50ZXJhY3RFdmVudHNbZXZlbnROYW1lXSB8fCBbXVxyXG4gICAgdGFyZ2V0Ll9pbnRlcmFjdEV2ZW50c1tldmVudE5hbWVdLnB1c2goe1xyXG4gICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcclxuICAgICAgICBpbnRlcmFjdDogdGhpc1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcbkludGVyYWN0LnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnROYW1lLCB0YXJnZXQsIGV2ZW50LCBpbnRlcmFjdGlvbil7XHJcbiAgICBpZighdGFyZ2V0KXtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGludGVyYWN0ID0gdGhpcyxcclxuICAgICAgICBjdXJyZW50VGFyZ2V0ID0gdGFyZ2V0O1xyXG5cclxuICAgIGludGVyYWN0aW9uLm9yaWdpbmFsRXZlbnQgPSBldmVudDtcclxuICAgIGludGVyYWN0aW9uLnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gICAgaW50ZXJhY3Rpb24uc3RvcFByb3BhZ2F0aW9uID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICB3aGlsZShjdXJyZW50VGFyZ2V0KXtcclxuICAgICAgICBjdXJyZW50VGFyZ2V0Ll9pbnRlcmFjdEV2ZW50cyAmJlxyXG4gICAgICAgIGN1cnJlbnRUYXJnZXQuX2ludGVyYWN0RXZlbnRzW2V2ZW50TmFtZV0gJiZcclxuICAgICAgICBjdXJyZW50VGFyZ2V0Ll9pbnRlcmFjdEV2ZW50c1tldmVudE5hbWVdLmZvckVhY2goZnVuY3Rpb24obGlzdGVuZXJJbmZvKXtcclxuICAgICAgICAgICAgaWYobGlzdGVuZXJJbmZvLmludGVyYWN0ID09PSBpbnRlcmFjdCl7XHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lckluZm8uY2FsbGJhY2suY2FsbChpbnRlcmFjdGlvbiwgaW50ZXJhY3Rpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY3VycmVudFRhcmdldCA9IGN1cnJlbnRUYXJnZXQucGFyZW50Tm9kZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuSW50ZXJhY3QucHJvdG90eXBlLm9mZiA9XHJcbkludGVyYWN0LnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgdGFyZ2V0LCBjYWxsYmFjayl7XHJcbiAgICBpZighdGFyZ2V0IHx8ICF0YXJnZXQuX2ludGVyYWN0RXZlbnRzIHx8ICF0YXJnZXQuX2ludGVyYWN0RXZlbnRzW2V2ZW50TmFtZV0pe1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBpbnRlcmFjdExpc3RlbmVycyA9IHRhcmdldC5faW50ZXJhY3RFdmVudHNbZXZlbnROYW1lXSxcclxuICAgICAgICBsaXN0ZW5lckluZm87XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgaW50ZXJhY3RMaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsaXN0ZW5lckluZm8gPSBpbnRlcmFjdExpc3RlbmVyc1tpXTtcclxuICAgICAgICBpZihsaXN0ZW5lckluZm8uaW50ZXJhY3QgPT09IGludGVyYWN0ICYmIGxpc3RlbmVySW5mby5jYWxsYmFjayA9PT0gY2FsbGJhY2spe1xyXG4gICAgICAgICAgICBpbnRlcmFjdExpc3RlbmVycy5zcGxpY2UoaSwxKTtcclxuICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuaW50ZXJhY3QgPSBuZXcgSW50ZXJhY3QoKTtcclxuXHJcbiAgICAvLyBGb3Igc29tZSByZWFzb24gdG91Y2ggYnJvd3NlcnMgbmV2ZXIgY2hhbmdlIHRoZSBldmVudCB0YXJnZXQgZHVyaW5nIGEgdG91Y2guXHJcbiAgICAvLyBUaGlzIGlzLCBsZXRzIGZhY2UgaXQsIGZ1Y2tpbmcgc3R1cGlkLlxyXG5mdW5jdGlvbiBnZXRBY3R1YWxUYXJnZXQoKSB7XHJcbiAgICB2YXIgc2Nyb2xsWCA9IHdpbmRvdy5zY3JvbGxYLFxyXG4gICAgICAgIHNjcm9sbFkgPSB3aW5kb3cuc2Nyb2xsWTtcclxuXHJcbiAgICAvLyBJRSBpcyBzdHVwaWQgYW5kIGRvZXNuJ3Qgc3VwcG9ydCBzY3JvbGxYL1lcclxuICAgIGlmKHNjcm9sbFggPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgc2Nyb2xsWCA9IGQuYm9keS5zY3JvbGxMZWZ0O1xyXG4gICAgICAgIHNjcm9sbFkgPSBkLmJvZHkuc2Nyb2xsVG9wO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkLmVsZW1lbnRGcm9tUG9pbnQodGhpcy5wYWdlWCAtIHdpbmRvdy5zY3JvbGxYLCB0aGlzLnBhZ2VZIC0gd2luZG93LnNjcm9sbFkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRNb3ZlRGlzdGFuY2UoeDEseTEseDIseTIpe1xyXG4gICAgdmFyIGFkaiA9IE1hdGguYWJzKHgxIC0geDIpLFxyXG4gICAgICAgIG9wcCA9IE1hdGguYWJzKHkxIC0geTIpO1xyXG5cclxuICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coYWRqLDIpICsgTWF0aC5wb3cob3BwLDIpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGVzdHJveUludGVyYWN0aW9uKGludGVyYWN0aW9uKXtcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBpbnRlcmFjdGlvbnMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIGlmKGludGVyYWN0aW9uc1tpXS5pZGVudGlmaWVyID09PSBpbnRlcmFjdGlvbi5pZGVudGlmaWVyKXtcclxuICAgICAgICAgICAgaW50ZXJhY3Rpb25zLnNwbGljZShpLDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SW50ZXJhY3Rpb24oaWRlbnRpZmllcil7XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgaW50ZXJhY3Rpb25zLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICBpZihpbnRlcmFjdGlvbnNbaV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcil7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnRlcmFjdGlvbnNbaV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRJbmhlcml0ZWREYXRhKGludGVyYWN0aW9uLCBkYXRhKXtcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzVG9Db3B5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaW50ZXJhY3Rpb25bcHJvcGVydGllc1RvQ29weVtpXV0gPSBkYXRhW3Byb3BlcnRpZXNUb0NvcHlbaV1dXHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEFuZ2xlKGRlbHRhUG9pbnQpe1xyXG4gICAgcmV0dXJuIE1hdGguYXRhbjIoZGVsdGFQb2ludC54LCAtZGVsdGFQb2ludC55KSAqIDE4MCAvIE1hdGguUEk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEludGVyYWN0aW9uKGV2ZW50LCBpbnRlcmFjdGlvbkluZm8pe1xyXG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gZXZlbnQgKGVnOiBkZXNrdG9wKSBqdXN0IG1ha2UgdGhlIGlkZW50aWZpZXIgdW5kZWZpbmVkXHJcbiAgICBpZighZXZlbnQpe1xyXG4gICAgICAgIGV2ZW50ID0ge307XHJcbiAgICB9XHJcbiAgICAvLyBJZiB0aGVyZSBpcyBubyBleHRyYSBpbmZvIGFib3V0IHRoZSBpbnRlcmFjdGlvbiAoZWc6IGRlc2t0b3ApIGp1c3QgdXNlIHRoZSBldmVudCBpdHNlbGZcclxuICAgIGlmKCFpbnRlcmFjdGlvbkluZm8pe1xyXG4gICAgICAgIGludGVyYWN0aW9uSW5mbyA9IGV2ZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHRoZXJlIGlzIGFub3RoZXIgaW50ZXJhY3Rpb24gd2l0aCB0aGUgc2FtZSBJRCwgc29tZXRoaW5nIHdlbnQgd3JvbmcuXHJcbiAgICAvLyBLSUxMIElUIFdJVEggRklSRSFcclxuICAgIHZhciBvbGRJbnRlcmFjdGlvbiA9IGdldEludGVyYWN0aW9uKGludGVyYWN0aW9uSW5mby5pZGVudGlmaWVyKTtcclxuICAgIG9sZEludGVyYWN0aW9uICYmIG9sZEludGVyYWN0aW9uLmRlc3Ryb3koKTtcclxuXHJcbiAgICB0aGlzLmlkZW50aWZpZXIgPSBpbnRlcmFjdGlvbkluZm8uaWRlbnRpZmllcjtcclxuXHJcbiAgICB0aGlzLm1vdmVzID0gW107XHJcblxyXG4gICAgaW50ZXJhY3Rpb25zLnB1c2godGhpcyk7XHJcbn1cclxuXHJcbkludGVyYWN0aW9uLnByb3RvdHlwZSA9IHtcclxuICAgIGNvbnN0cnVjdG9yOiBJbnRlcmFjdGlvbixcclxuICAgIGdldEFjdHVhbFRhcmdldDogZ2V0QWN0dWFsVGFyZ2V0LFxyXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKXtcclxuICAgICAgICBpbnRlcmFjdC5vbignZGVzdHJveScsIHRoaXMudGFyZ2V0LCB0aGlzLCB0aGlzKTtcclxuICAgICAgICBkZXN0cm95SW50ZXJhY3Rpb24odGhpcyk7XHJcbiAgICB9LFxyXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKGV2ZW50LCBpbnRlcmFjdGlvbkluZm8pe1xyXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIGV4dHJhIGluZm8gYWJvdXQgdGhlIGludGVyYWN0aW9uIChlZzogZGVza3RvcCkganVzdCB1c2UgdGhlIGV2ZW50IGl0c2VsZlxyXG4gICAgICAgIGlmKCFpbnRlcmFjdGlvbkluZm8pe1xyXG4gICAgICAgICAgICBpbnRlcmFjdGlvbkluZm8gPSBldmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBsYXN0U3RhcnQgPSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgcGhhc2U6ICdzdGFydCdcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICBzZXRJbmhlcml0ZWREYXRhKGxhc3RTdGFydCwgaW50ZXJhY3Rpb25JbmZvKTtcclxuICAgICAgICB0aGlzLmxhc3RTdGFydCA9IGxhc3RTdGFydDtcclxuXHJcbiAgICAgICAgc2V0SW5oZXJpdGVkRGF0YSh0aGlzLCBpbnRlcmFjdGlvbkluZm8pO1xyXG5cclxuICAgICAgICB0aGlzLnBoYXNlID0gJ3N0YXJ0JztcclxuICAgICAgICBpbnRlcmFjdC5lbWl0KCdzdGFydCcsIGV2ZW50LnRhcmdldCwgZXZlbnQsIHRoaXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIG1vdmU6IGZ1bmN0aW9uKGV2ZW50LCBpbnRlcmFjdGlvbkluZm8pe1xyXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIGV4dHJhIGluZm8gYWJvdXQgdGhlIGludGVyYWN0aW9uIChlZzogZGVza3RvcCkganVzdCB1c2UgdGhlIGV2ZW50IGl0c2VsZlxyXG4gICAgICAgIGlmKCFpbnRlcmFjdGlvbkluZm8pe1xyXG4gICAgICAgICAgICBpbnRlcmFjdGlvbkluZm8gPSBldmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBjdXJyZW50VG91Y2ggPSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgcGhhc2U6ICdtb3ZlJ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZXRJbmhlcml0ZWREYXRhKGN1cnJlbnRUb3VjaCwgaW50ZXJhY3Rpb25JbmZvKTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBpbnRlcmFjdGlvblxyXG4gICAgICAgIHNldEluaGVyaXRlZERhdGEodGhpcywgaW50ZXJhY3Rpb25JbmZvKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb3Zlcy5wdXNoKGN1cnJlbnRUb3VjaCk7XHJcblxyXG4gICAgICAgIC8vIE1lbW9yeSBzYXZlciwgY3VsbHMgYW55IG1vdmVzIHRoYXQgYXJlIG92ZXIgdGhlIG1heGltdW0gdG8ga2VlcC5cclxuICAgICAgICB0aGlzLm1vdmVzID0gdGhpcy5tb3Zlcy5zbGljZSgtbWF4aW11bU1vdmVzVG9QZXJzaXN0KTtcclxuXHJcbiAgICAgICAgdmFyIG1vdmVEZWx0YSA9IHRoaXMuZ2V0TW92ZURlbHRhKCksXHJcbiAgICAgICAgICAgIGFuZ2xlID0gMDtcclxuICAgICAgICBpZihtb3ZlRGVsdGEpe1xyXG4gICAgICAgICAgICBhbmdsZSA9IGdldEFuZ2xlKG1vdmVEZWx0YSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFuZ2xlID0gY3VycmVudFRvdWNoLmFuZ2xlID0gYW5nbGU7XHJcblxyXG4gICAgICAgIHRoaXMucGhhc2UgPSAnbW92ZSc7XHJcbiAgICAgICAgaW50ZXJhY3QuZW1pdCgnbW92ZScsIGV2ZW50LnRhcmdldCwgZXZlbnQsIHRoaXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCBpbnRlcmFjdGlvbkluZm8pe1xyXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIGV4dHJhIGluZm8gYWJvdXQgdGhlIGludGVyYWN0aW9uIChlZzogZGVza3RvcCkganVzdCB1c2UgdGhlIGV2ZW50IGl0c2VsZlxyXG4gICAgICAgIGlmKCFpbnRlcmFjdGlvbkluZm8pe1xyXG4gICAgICAgICAgICBpbnRlcmFjdGlvbkluZm8gPSBldmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBjdXJyZW50VG91Y2ggPSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgcGhhc2U6ICdkcmFnJ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZXRJbmhlcml0ZWREYXRhKGN1cnJlbnRUb3VjaCwgaW50ZXJhY3Rpb25JbmZvKTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBpbnRlcmFjdGlvblxyXG4gICAgICAgIHNldEluaGVyaXRlZERhdGEodGhpcywgaW50ZXJhY3Rpb25JbmZvKTtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMubW92ZXMpe1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVzID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm1vdmVzLnB1c2goY3VycmVudFRvdWNoKTtcclxuXHJcbiAgICAgICAgLy8gTWVtb3J5IHNhdmVyLCBjdWxscyBhbnkgbW92ZXMgdGhhdCBhcmUgb3ZlciB0aGUgbWF4aW11bSB0byBrZWVwLlxyXG4gICAgICAgIHRoaXMubW92ZXMgPSB0aGlzLm1vdmVzLnNsaWNlKC1tYXhpbXVtTW92ZXNUb1BlcnNpc3QpO1xyXG5cclxuICAgICAgICBpZighdGhpcy5kcmFnU3RhcnRlZCAmJiBnZXRNb3ZlRGlzdGFuY2UodGhpcy5sYXN0U3RhcnQucGFnZVgsIHRoaXMubGFzdFN0YXJ0LnBhZ2VZLCBjdXJyZW50VG91Y2gucGFnZVgsIGN1cnJlbnRUb3VjaC5wYWdlWSkgPiBtaW5Nb3ZlRGlzdGFuY2Upe1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdTdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBtb3ZlRGVsdGEgPSB0aGlzLmdldE1vdmVEZWx0YSgpLFxyXG4gICAgICAgICAgICBhbmdsZSA9IDA7XHJcbiAgICAgICAgaWYobW92ZURlbHRhKXtcclxuICAgICAgICAgICAgYW5nbGUgPSBnZXRBbmdsZShtb3ZlRGVsdGEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5hbmdsZSA9IGN1cnJlbnRUb3VjaC5hbmdsZSA9IGFuZ2xlO1xyXG5cclxuICAgICAgICBpZih0aGlzLmRyYWdTdGFydGVkKXtcclxuICAgICAgICAgICAgdGhpcy5waGFzZSA9ICdkcmFnJztcclxuICAgICAgICAgICAgaW50ZXJhY3QuZW1pdCgnZHJhZycsIGV2ZW50LnRhcmdldCwgZXZlbnQsIHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBlbmQ6IGZ1bmN0aW9uKGV2ZW50LCBpbnRlcmFjdGlvbkluZm8pe1xyXG4gICAgICAgIGlmKCFpbnRlcmFjdGlvbkluZm8pe1xyXG4gICAgICAgICAgICBpbnRlcmFjdGlvbkluZm8gPSBldmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgaW50ZXJhY3Rpb25cclxuICAgICAgICBzZXRJbmhlcml0ZWREYXRhKHRoaXMsIGludGVyYWN0aW9uSW5mbyk7XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLm1vdmVzKXtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlcyA9IFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBpbnRlcmFjdGlvblxyXG4gICAgICAgIHNldEluaGVyaXRlZERhdGEodGhpcywgaW50ZXJhY3Rpb25JbmZvKTtcclxuXHJcbiAgICAgICAgdGhpcy5waGFzZSA9ICdlbmQnO1xyXG4gICAgICAgIGludGVyYWN0LmVtaXQoJ2VuZCcsIGV2ZW50LnRhcmdldCwgZXZlbnQsIHRoaXMpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBjYW5jZWw6IGZ1bmN0aW9uKGV2ZW50LCBpbnRlcmFjdGlvbkluZm8pe1xyXG4gICAgICAgIGlmKCFpbnRlcmFjdGlvbkluZm8pe1xyXG4gICAgICAgICAgICBpbnRlcmFjdGlvbkluZm8gPSBldmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgaW50ZXJhY3Rpb25cclxuICAgICAgICBzZXRJbmhlcml0ZWREYXRhKHRoaXMsIGludGVyYWN0aW9uSW5mbyk7XHJcblxyXG4gICAgICAgIHRoaXMucGhhc2UgPSAnY2FuY2VsJztcclxuICAgICAgICBpbnRlcmFjdC5lbWl0KCdjYW5jZWwnLCBldmVudC50YXJnZXQsIGV2ZW50LCB0aGlzKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgZ2V0TW92ZURpc3RhbmNlOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIGlmKHRoaXMubW92ZXMubGVuZ3RoID4gMSl7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5tb3Zlc1t0aGlzLm1vdmVzLmxlbmd0aC0xXSxcclxuICAgICAgICAgICAgICAgIHByZXZpb3VzID0gdGhpcy5tb3Zlc1t0aGlzLm1vdmVzLmxlbmd0aC0yXTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnZXRNb3ZlRGlzdGFuY2UoY3VycmVudC5wYWdlWCwgY3VycmVudC5wYWdlWSwgcHJldmlvdXMucGFnZVgsIHByZXZpb3VzLnBhZ2VZKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgZ2V0TW92ZURlbHRhOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5tb3Zlc1t0aGlzLm1vdmVzLmxlbmd0aC0xXSxcclxuICAgICAgICAgICAgcHJldmlvdXMgPSB0aGlzLm1vdmVzW3RoaXMubW92ZXMubGVuZ3RoLTJdIHx8IHRoaXMubGFzdFN0YXJ0O1xyXG5cclxuICAgICAgICBpZighY3VycmVudCB8fCAhcHJldmlvdXMpe1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OiBjdXJyZW50LnBhZ2VYIC0gcHJldmlvdXMucGFnZVgsXHJcbiAgICAgICAgICAgIHk6IGN1cnJlbnQucGFnZVkgLSBwcmV2aW91cy5wYWdlWVxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgZ2V0U3BlZWQ6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaWYodGhpcy5tb3Zlcy5sZW5ndGggPiAxKXtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLm1vdmVzW3RoaXMubW92ZXMubGVuZ3RoLTFdLFxyXG4gICAgICAgICAgICAgICAgcHJldmlvdXMgPSB0aGlzLm1vdmVzW3RoaXMubW92ZXMubGVuZ3RoLTJdO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TW92ZURpc3RhbmNlKCkgLyAoY3VycmVudC50aW1lIC0gcHJldmlvdXMudGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfSxcclxuICAgIGdldEN1cnJlbnRBbmdsZTogZnVuY3Rpb24oYmxlbmQpe1xyXG4gICAgICAgIHZhciBwaGFzZSA9IHRoaXMucGhhc2UsXHJcbiAgICAgICAgICAgIGN1cnJlbnRQb3NpdGlvbixcclxuICAgICAgICAgICAgbGFzdEFuZ2xlLFxyXG4gICAgICAgICAgICBpID0gdGhpcy5tb3Zlcy5sZW5ndGgtMSxcclxuICAgICAgICAgICAgYW5nbGUsXHJcbiAgICAgICAgICAgIGZpcnN0QW5nbGUsXHJcbiAgICAgICAgICAgIGFuZ2xlcyA9IFtdLFxyXG4gICAgICAgICAgICBibGVuZFN0ZXBzID0gMjAvKHRoaXMuZ2V0U3BlZWQoKSoyKzEpLFxyXG4gICAgICAgICAgICBzdGVwc1VzZWQgPSAxO1xyXG5cclxuICAgICAgICBpZih0aGlzLm1vdmVzICYmIHRoaXMubW92ZXMubGVuZ3RoKXtcclxuXHJcbiAgICAgICAgICAgIGN1cnJlbnRQb3NpdGlvbiA9IHRoaXMubW92ZXNbaV07XHJcbiAgICAgICAgICAgIGFuZ2xlID0gZmlyc3RBbmdsZSA9IGN1cnJlbnRQb3NpdGlvbi5hbmdsZTtcclxuXHJcbiAgICAgICAgICAgIGlmKGJsZW5kICYmIHRoaXMubW92ZXMubGVuZ3RoID4gMSl7XHJcbiAgICAgICAgICAgICAgICB3aGlsZShcclxuICAgICAgICAgICAgICAgICAgICAtLWkgPiAwICYmXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3Zlcy5sZW5ndGggLSBpIDwgYmxlbmRTdGVwcyAmJlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZXNbaV0ucGhhc2UgPT09IHBoYXNlXHJcbiAgICAgICAgICAgICAgICApe1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RBbmdsZSA9IHRoaXMubW92ZXNbaV0uYW5nbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoTWF0aC5hYnMobGFzdEFuZ2xlIC0gZmlyc3RBbmdsZSkgPiAxODApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmdsZSAtPSBsYXN0QW5nbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ2xlICs9IGxhc3RBbmdsZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc3RlcHNVc2VkKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhbmdsZSA9IGFuZ2xlL3N0ZXBzVXNlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihhbmdsZSA9PT0gSW5maW5pdHkpe1xyXG4gICAgICAgICAgICByZXR1cm4gZmlyc3RBbmdsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFuZ2xlO1xyXG4gICAgfSxcclxuICAgIGdldEFsbEludGVyYWN0aW9uczogZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gaW50ZXJhY3Rpb25zLnNsaWNlKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5mdW5jdGlvbiBzdGFydChldmVudCl7XHJcbiAgICB2YXIgdG91Y2g7XHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICB0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzW2ldO1xyXG4gICAgICAgIG5ldyBJbnRlcmFjdGlvbihldmVudCwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbaV0pLnN0YXJ0KGV2ZW50LCB0b3VjaCk7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gZHJhZyhldmVudCl7XHJcbiAgICB2YXIgdG91Y2g7XHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICB0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzW2ldO1xyXG4gICAgICAgIGdldEludGVyYWN0aW9uKHRvdWNoLmlkZW50aWZpZXIpLmRyYWcoZXZlbnQsIHRvdWNoKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBlbmQoZXZlbnQpe1xyXG4gICAgdmFyIHRvdWNoO1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBldmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgdG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1tpXTtcclxuICAgICAgICBnZXRJbnRlcmFjdGlvbih0b3VjaC5pZGVudGlmaWVyKS5lbmQoZXZlbnQsIHRvdWNoKS5kZXN0cm95KCk7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gY2FuY2VsKGV2ZW50KXtcclxuICAgIHZhciB0b3VjaDtcclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgZXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIHRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbaV07XHJcbiAgICAgICAgZ2V0SW50ZXJhY3Rpb24odG91Y2guaWRlbnRpZmllcikuY2FuY2VsKGV2ZW50LCB0b3VjaCkuZGVzdHJveSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5hZGRFdmVudChkLCAndG91Y2hzdGFydCcsIHN0YXJ0KTtcclxuYWRkRXZlbnQoZCwgJ3RvdWNobW92ZScsIGRyYWcpO1xyXG5hZGRFdmVudChkLCAndG91Y2hlbmQnLCBlbmQpO1xyXG5hZGRFdmVudChkLCAndG91Y2hjYW5jZWwnLCBjYW5jZWwpO1xyXG5cclxudmFyIG1vdXNlSXNEb3duID0gZmFsc2U7XHJcbmFkZEV2ZW50KGQsICdtb3VzZWRvd24nLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICBtb3VzZUlzRG93biA9IHRydWU7XHJcblxyXG4gICAgaWYoIWludGVyYWN0aW9ucy5sZW5ndGgpe1xyXG4gICAgICAgIG5ldyBJbnRlcmFjdGlvbihldmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGludGVyYWN0aW9uID0gZ2V0SW50ZXJhY3Rpb24oKTtcclxuXHJcbiAgICBpZighaW50ZXJhY3Rpb24pe1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBnZXRJbnRlcmFjdGlvbigpLnN0YXJ0KGV2ZW50KTtcclxufSk7XHJcbmFkZEV2ZW50KGQsICdtb3VzZW1vdmUnLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICBpZighaW50ZXJhY3Rpb25zLmxlbmd0aCl7XHJcbiAgICAgICAgbmV3IEludGVyYWN0aW9uKGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaW50ZXJhY3Rpb24gPSBnZXRJbnRlcmFjdGlvbigpO1xyXG5cclxuICAgIGlmKCFpbnRlcmFjdGlvbil7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKG1vdXNlSXNEb3duKXtcclxuICAgICAgICBpbnRlcmFjdGlvbi5kcmFnKGV2ZW50KTtcclxuICAgIH1lbHNle1xyXG4gICAgICAgIGludGVyYWN0aW9uLm1vdmUoZXZlbnQpO1xyXG4gICAgfVxyXG59KTtcclxuYWRkRXZlbnQoZCwgJ21vdXNldXAnLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICBtb3VzZUlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgIHZhciBpbnRlcmFjdGlvbiA9IGdldEludGVyYWN0aW9uKCk7XHJcblxyXG4gICAgaWYoIWludGVyYWN0aW9uKXtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJhY3Rpb24uZW5kKGV2ZW50LCBudWxsKTtcclxuICAgIGludGVyYWN0aW9uLmRlc3Ryb3koKTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBhZGRFdmVudChlbGVtZW50LCB0eXBlLCBjYWxsYmFjaykge1xyXG4gICAgaWYoZWxlbWVudCA9PSBudWxsKXtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYoZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKXtcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZihkLmF0dGFjaEV2ZW50KXtcclxuICAgICAgICBlbGVtZW50LmF0dGFjaEV2ZW50KFwib25cIisgdHlwZSwgY2FsbGJhY2spO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGludGVyYWN0OyIsInZhciBjYWNoZSA9IHt9LFxyXG4gICAgYm9keVN0eWxlID0ge307XHJcblxyXG5pZih0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyl7XHJcbiAgICBpZih3aW5kb3cuZG9jdW1lbnQuYm9keSl7XHJcbiAgICAgICAgZ2V0Qm9keVN0eWxlUHJvcGVydGllcygpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBnZXRCb2R5U3R5bGVQcm9wZXJ0aWVzKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Qm9keVN0eWxlUHJvcGVydGllcygpe1xyXG4gICAgdmFyIHNob3J0Y3V0cyA9IHt9LFxyXG4gICAgICAgIGl0ZW1zID0gZG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KTtcclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIGJvZHlTdHlsZVtpdGVtc1tpXV0gPSBudWxsO1xyXG5cclxuICAgICAgICAvLyBUaGlzIGlzIGtpbmRhIGRvZGd5IGJ1dCBpdCB3b3Jrcy5cclxuICAgICAgICBiYXNlTmFtZSA9IGl0ZW1zW2ldLm1hdGNoKC9eKFxcdyspLS4qJC8pO1xyXG4gICAgICAgIGlmKGJhc2VOYW1lKXtcclxuICAgICAgICAgICAgaWYoc2hvcnRjdXRzW2Jhc2VOYW1lWzFdXSl7XHJcbiAgICAgICAgICAgICAgICBib2R5U3R5bGVbYmFzZU5hbWVbMV1dID0gbnVsbDtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBzaG9ydGN1dHNbYmFzZU5hbWVbMV1dID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdmVuZml4KHByb3BlcnR5LCB0YXJnZXQpe1xyXG4gICAgaWYoIXRhcmdldCAmJiBjYWNoZVtwcm9wZXJ0eV0pe1xyXG4gICAgICAgIHJldHVybiBjYWNoZVtwcm9wZXJ0eV07XHJcbiAgICB9XHJcblxyXG4gICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IGJvZHlTdHlsZTtcclxuXHJcbiAgICB2YXIgcHJvcHMgPSBbXTtcclxuXHJcbiAgICBmb3IodmFyIGtleSBpbiB0YXJnZXQpe1xyXG4gICAgICAgIGNhY2hlW2tleV0gPSBrZXk7XHJcbiAgICAgICAgcHJvcHMucHVzaChrZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKHByb3BlcnR5IGluIHRhcmdldCl7XHJcbiAgICAgICAgcmV0dXJuIHByb3BlcnR5O1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBwcm9wZXJ0eVJlZ2V4ID0gbmV3IFJlZ0V4cCgnXigtKD86JyArIHZlbmZpeC5wcmVmaXhlcy5qb2luKCd8JykgKyAnKS0pJyArIHByb3BlcnR5ICsgJyg/OiR8LSknLCAnaScpO1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBtYXRjaCA9IHByb3BzW2ldLm1hdGNoKHByb3BlcnR5UmVnZXgpO1xyXG4gICAgICAgIGlmKG1hdGNoKXtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG1hdGNoWzFdICsgcHJvcGVydHk7XHJcbiAgICAgICAgICAgIGlmKHRhcmdldCA9PT0gYm9keVN0eWxlKXtcclxuICAgICAgICAgICAgICAgIGNhY2hlW3Byb3BlcnR5XSA9IHJlc3VsdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwcm9wZXJ0eTtcclxufVxyXG5cclxuLy8gQWRkIGV4dGVuc2liaWxpdHlcclxudmVuZml4LnByZWZpeGVzID0gWyd3ZWJraXQnLCAnbW96JywgJ21zJywgJ28nXTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmVuZml4OyJdfQ==
