//LayerAnimation.js
//Tom Marra 7/18/2012

$(document).ready(function(){
    //the div holding the image stack
    var container = $("#container");

    //gets all the layers in the actual image stack
    var img = $(".img");

    //sets valus for a bunch of stuff Dynamic so script can adapt to different sized stuff
    var IMG_WIDTH = img.width();
    var IMG_HEIGHT = img.height();

    //object sent to the transformation script
    var transform = [];

    //starting coordinates of image corners
    var oCords = {
        topLeft     : {x:0, y:0},
        topRight    : {x:0, y:0},
        bottomLeft  : {x:0, y:0},
        bottomRight : {x:0, y:0}
    };

    //mouse position
    var targetPoint = {x:0, y:0};

    //modifiers from sliders affects 3D intensity
    var xRes = 10;
    var yRes = 3;
    var zRes = 2;

    $('a.toggle').each(function(index){
        $(this).click(function(){
            $(this).toggleClass("down");
            $(".img").eq(-index -1).children().toggle();
        });
    });

    //For folders to work we need to convert the above to a function instead of dynamically pairing the event
    // $('a.layertoggle').each(function(index){
    //     $(this).click(function(){
    //         $(this).toggleClass("down");
    //         $(".img").eq(-index -1).children().toggle();
    //     });
    // });

    //funtion to be done to each layer
    $('.layerName').each(function(index){

        //onclick make selected and find matching layer and add/subtract marching ants
        $(this).click(function(){
            if($(this).hasClass("down")!== true){
                $('.layerName').each(function(index){
                    $(this).removeClass("down");
                    $(".img").eq(-index -1).children().removeClass("selected");
                });
            }
            $(this).toggleClass("down");
            $(".img").eq(-index -1).children().toggleClass("selected");
        });
    });

    //3D sliders
    $("#sliderx").slider({ max: 15, min: 5, value: 10, change: function(event, ui) {xRes = ui.value}});
    $("#slidery").slider({ max: 10,  min: 1, value: 3,  change: function(event, ui) {yRes = ui.value}});
    $("#sliderz").slider({ max: 10,  min: 1, value: 2,  change: function(event, ui) {zRes = ui.value}});


    //self explanitory
    function changeprice(str){
        $("#picepoint").html(str);
    };

    function changescript(str){
        $("#scriptpoint").html(str);
    };

    //sets proxy container(mouseover area) to the defined height and width at head of this doc
    $("#proxyContainer").css({width:IMG_WIDTH , height : IMG_HEIGHT});

    //The Magic lives here

    //Creates Transform object
    for(x=0; x < img.length; x++){
        transform[x] = new PerspectiveTransform(img[x], IMG_WIDTH, IMG_HEIGHT, true);
    }

    //sets initial values for the transform
    oCords.topLeft.x     = transform[0].topLeft.x
    oCords.topLeft.y     = transform[0].topLeft.y
    oCords.topRight.x    = transform[0].topRight.x
    oCords.topRight.y    = transform[0].topRight.y
    oCords.bottomLeft.x  = transform[0].bottomLeft.x
    oCords.bottomLeft.y  = transform[0].bottomLeft.y
    oCords.bottomRight.x = transform[0].bottomRight.x
    oCords.bottomRight.y = transform[0].bottomRight.y

    //records mousemovement relative to center of the proxy layer then sends coords to the transform function
    $("#proxyContainer").mousemove(function(e){
         targetPoint.x = (e.pageX - container.offset().left - IMG_WIDTH/2 );
         targetPoint.y = (e.pageY - container.offset().top - IMG_HEIGHT/2 ) *-1;
         transformer();
    });

    //sets each point in transform based on mouse position then uses the number of images to add an offset value to all corners equally to give the 3D effect each portion of the equation is modified by the restrictor vars from the sliders. It then invokes the update function in the transform script.(Magic)
    function transformer(){
        for(n=0; n < transform.length; n++){
                transform[n].topLeft.x     = oCords.topLeft.x     - targetPoint.y/yRes + (n*targetPoint.x/xRes)/zRes;
                transform[n].topLeft.y     = oCords.topLeft.y     + targetPoint.x/xRes + (n*targetPoint.y/yRes)/zRes;
                
                transform[n].topRight.x    = oCords.topRight.x    + targetPoint.y/yRes + (n*targetPoint.x/xRes)/zRes;
                transform[n].topRight.y    = oCords.topRight.y    - targetPoint.x/xRes + (n*targetPoint.y/yRes)/zRes;

                transform[n].bottomLeft.x  = oCords.bottomLeft.x  + targetPoint.y/yRes + (n*targetPoint.x/xRes)/zRes;
                transform[n].bottomLeft.y  = oCords.bottomLeft.y  - targetPoint.x/xRes + (n*targetPoint.y/yRes)/zRes;

                transform[n].bottomRight.x = oCords.bottomRight.x - targetPoint.y/yRes + (n*targetPoint.x/xRes)/zRes;
                transform[n].bottomRight.y = oCords.bottomRight.y + targetPoint.x/xRes + (n*targetPoint.y/yRes)/zRes;

                transform[n].update();    
        }
    };

    // Animation variables.
    var vars = $.extend($('<div>')[0], {
      positionx: 0,
      positiony: 0,
      
      // More properties are added dynamically in init().

      //// These are needed to make $(vars).animate(...) work.
      customAnimate: true,
      updated: true
    });

    // Hack the jQuery step function to allow animating object properties directly.
    var $_fx_step_default = $.fx.step._default;
    $.fx.step._default = function (fx) {
      if (!fx.elem.customAnimate) return $_fx_step_default(fx);
      fx.elem[fx.prop] = fx.now;
      fx.elem.updated = true;
    };

    // Move the camera to a new position (animated).
    function animatedFunct() {
        vars.positionx = targetPoint.x;
        vars.positiony = targetPoint.y;
      $(vars).animate({ positionx: 0 }, { duration: 500, easing: 'easeOutElastic', queue: false});
      $(vars).animate({ positiony: 0 }, { duration: 500, easing: 'easeOutElastic', queue: false});
    }

    setInterval(function () {

      if (!vars.updated) return;

      vars.updated = false;
      targetPoint.x = vars.positionx;
      targetPoint.y = vars.positiony;

      transformer();

    }, 30);
    //returns the transformed stack to normal on mouseout I wish I could animate this, but it's too many numbers
    $("#proxyContainer").mouseout(function(e){
        animatedFunct();
        //start animation

    });

});