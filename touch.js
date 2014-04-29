// ==UserScript==
// @name       Twitch touches pokemon
// @namespace  https://github.com/lostcoaster/twitch-touches-pokemon
// @author     lostcoaster
// @version    0.3
// @description  A tool adding a touch overlay onto the stream of twitchplayspokemon.

// this include string credits Twitch Plays Pokemon Chat Filter
// @include    /^https?://(www|beta)\.twitch\.tv\/twitchplayspokemon.*$/

// @updateURL  https://raw.githubusercontent.com/lostcoaster/twitch-touches-pokemon/master/touch.js
// ==/UserScript==

// for bookmarklet users : javascript:(function(){document.body.appendChild(document.createElement('script')).src='https://raw.githubusercontent.com/lostcoaster/twitch-touches-pokemon/master/touch.js';})();



var touch_pad = {
    parameters: {
        position_x: 0.357,
        position_y: 0.544,
        original_height: 434,
        bar_height: 30,
        ratio: 9 / 16
    },

    scale: 1,

    interval_handle: (window.touch_pad === undefined ? undefined : touch_pad.interval_handle),

    // reflect mouse event to coordinate output.
    coords: function (event) {
        return Math.floor((event.pageX - $(event.target).offset().left) / touch_pad.scale)
            + ',' +
            Math.floor((event.pageY - $(event.target).offset().top) / touch_pad.scale);
    },
    // adjust position of the box, parameters are relative position of top-left corner of the box within stream screen
    // 0 <= rx,ry <= 1
    position: function (rx, ry) {
        // base on the facts :
        // 1. image always fills vertically, but not horizontally ;
        // 2. the bar is 30px tall (constant), or 31px, whatever;
        // 3. source is 16:9;
        // 4. the REAL touch screen has a 256*192 resolution;
        var base = $('#player');
        var base_offset = base.offset();
        var real_height = base.height() - touch_pad.parameters.bar_height;
        touch_pad.scale = real_height / touch_pad.parameters.original_height;  // rough estimation
        var real_width = real_height / touch_pad.parameters.ratio;
        var left_margin = (base.width() - real_width) / 2;
        $('.touch_overlay').offset({
            top: Math.floor(base_offset.top + ry * real_height),
            left: Math.floor(base_offset.left + left_margin + rx * real_width)
        }).height(Math.floor(192 * touch_pad.scale)).width(Math.floor(256 * touch_pad.scale));
    },

    aim: function () {
        touch_pad.position(touch_pad.parameters.position_x, touch_pad.parameters.position_y); // rough estimation No.2
    },


    init: function () {
        if ($('.touch_overlay').length === 0) {

            $('#player').append('<div class="touch_overlay" style="cursor:crosshair;z-index:99"></div>');
            $('body').append('<style type="text/css">.touchborder{border:red solid;}</style>');


            $('.touch_overlay').unbind()
                .mouseup(function (event) {
                    $('textarea')
                        .val(touch_pad.coords(event))
                        .change();  // Thanks Meiguro(/u/Meiguro), you made me realize I haven't triggered the change event!
                    if ($('#enable-direct-send').is(':checked')) {
                        $('.send-chat-button button').click();
                    }

                });

            $('.chat-settings')
                .append($('<div class="chat-menu-header">Touch pad config</div>'))
                .append($('<div class="chat-menu-content"></div>')
                    .append($('<label>Show border</label>')
                        .prepend($('<input type="checkbox" checked>')
                            .change(function (event) {
                                $('.touch_overlay').toggleClass("touchborder", $(event.target).is(':checked'))
                            }).change())
                    )
                )
                .append($('<div class="chat-menu-content"><label><input id="enable-direct-send" type="checkbox">Send on clicking</label></div>'))
                .append($('<div class="chat-menu-content"></div>')
                    .append($('<button>Reposition Touchpad</button>').click(function () {
                        touch_pad.aim()
                    })));

        }

        //start running
        touch_pad.aim();

        if(touch_pad.interval_handle){
            console.log('Touchpad: found old handle, disabling.')
            clearInterval(touch_pad.interval_handle);
        }
        //update the size every 50 ms , thanks to Meiguro's idea!
        touch_pad.interval_handle = setInterval(touch_pad.aim, 50);
    }
};

// add the reaiming into settings menu. idea stolen from the chat-filter : http://redd.it/1y8ukl

touch_pad.init();