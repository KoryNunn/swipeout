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