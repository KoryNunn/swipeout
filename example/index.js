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