if (!this.rtl) rtl = {};
if (!this.rtl.ui) rtl.slider = {};

(function( $ ){

    rtl.slider = function(options){
        this.init(options);
    }

    rtl.slider.prototype = {
        options : {
            right : {
                pointer : '#right-slider',
                base : '#right-slider-base',
                value : new Array()
            },
            left : {
                pointer : '#left-slider',
                base : '#left-slider-base',
                value : new Array()
            },
            maxWidth : 600,
            minWidth : 50,
            color : '#5CE7FA'
        },

        getOptionVal : function(slider){
            var $optionTags = $(slider.base).children('option');
            $.each($optionTags, function(i, v){
               slider.value.push($(v).val());
            }); 
        },
        
        pointerBind : function(slider){
            that = this;
            $(slider.pointer).bind('touchmove', function(){
                that.pointerTransit(slider);
                return false;
            });
        },
        
        pointerTransit : function(slider){
            var or = this.options.right;
            var ol = this.options.left;
            var pointer = slider.pointer;
            var base = slider.base;
            var maxW = this.options.maxWidth;
            var minW= this.options.minWidth;
            var $optionTags = $(slider.value);
            var pX = window.event.changedTouches[0].pageX - ($(pointer).width()/2);
        
            //if there are two pointers, each pointer position is limited.
            if(or && ol){
                //left < right (right pointer limit)
                if(pointer == or.pointer){
                    if(pX < $(ol.pointer).position().left){
                        pX = $(ol.pointer).position().left;
                    }
                }
        
                //left < right (left pointer limit)
                if(pointer == ol.pointer){
                    if(pX > $(or.pointer).position().left){
                        pX = $(or.pointer).position().left;
                    }
                }
            }
        
            //max left and right
            if(pX > maxW){
                pX = maxW;
            }else if(pX < minW){
                pX = minW;
            }
        
            //move to next/prev point
            var marginWidth = (maxW - minW) / ($optionTags.length - 1);
            for(var i = 0; i < $optionTags.length; i++){
                if(pX < minW + marginWidth * ( i + 1 ) ){
                    pX = minW + marginWidth * i;
        
                    //decide select option value
                    $(base).val($optionTags[i]);
                    break;
                }
            }

            //move to new position
            $(pointer).css('-webkit-transform', 'translate3d('+ pX +'px, 0px, 0px)');
            this.colorLineTransit();
        },

        attachView : function(slider){
            var sliderId = slider.pointer.replace( /#/, '' ); 
            var pointer = '<div id="' + sliderId + '"></div>';
            var options = this.options;

            //create slider view
            var $sliderView = $('#slider-view');
            if($sliderView.size() == 0){
                $sliderView = $('<div id="slider-view"></div>');
                $sliderView.append('<hr id="slider-base-line">');
                $sliderView.append('<hr id="slider-color-line">');
            }

            //create pointer view
            var $pointerView = $('#pointer-view');
            if($pointerView.size() == 0){
                $pointerView = $('<div id="pointer-view"></div>');
                $sliderView.append($pointerView);
                $('body').append($sliderView);
            }

            //add pointer to pointer view
            $pointerView.append(pointer);
            
            //adjust slider line position 
            var $baseLine = $('#slider-base-line');
            var $colorLine = $('#slider-color-line');
            this.adjustHeight($pointerView, $colorLine);
            this.adjustHeight($pointerView, $baseLine);
            var lineWidth = options.maxWidth + options.minWidth * 2 - $('#left-slider').width()/2;
            $baseLine.css('width', lineWidth);
            $colorLine.css({
                'width' : lineWidth,
                'border-top' : '1px solid ' + options.color,
                'border-bottom' : '1px solid ' + options.color
            });

            //pointer transfer to left/right side
            if(sliderId.indexOf('left') > -1){
                $(slider.pointer).css({
                    '-webkit-transform' : 'translate3d('+ options.minWidth +'px, 0px, 0px)',
                    '-webkit-box-shadow' : '0px 0px 7px' + options.color
                });
            }else{
                $(slider.pointer).css({
                    '-webkit-transform' : 'translate3d('+ options.maxWidth +'px, 0px, 0px)',
                    '-webkit-box-shadow' : '0px 0px 7px' + options.color
                });
            }

            //add value below the slider
            var $valueView = $('#slider-value-view');
            if($valueView.size() == 0){
                $('body').append('<div id="slider-value-view"></div>');
                $valueView = $('#slider-value-view');
                var maxW = options.maxWidth;
                var minW= options.minWidth;
                var $optionTags = $(slider.value);
                
                for(var i = 0; i < $optionTags.length; i++){
                    $valueView.append('<span class="slider-value" >' +  $optionTags[i] + '</div>');
                }

                //calc margin
                var marginWidth = (maxW - minW) / ($optionTags.length - 1);
                var prvValueWidth = 0;
                var sliderWidth = $('#left-slider').width() / 2;
                $('.slider-value').each(function(i){
                    var valueWidth = $(this).width() / 2;
                    var diff = 0;
                    var marginLeft = 0;

                    if(sliderWidth > valueWidth){
                        diff = sliderWidth;
                    }else{
                        diff =  valueWidth;
                    }

                    if(prvValueWidth > 0){
                        diff += prvValueWidth;
                    }

                    if(i == 0){
                        marginLeft = 0 - diff;
                    }else{
                        marginLeft = marginWidth - diff;
                    }

                    $(this).css('margin-left', marginLeft);
                    prvValueWidth = valueWidth;
                });

                //adjust valueView position
                var dX = options.minWidth + sliderWidth * 2;
                var valWidth = $valueView.width() - dX;
                $valueView.css({
                    '-webkit-transform' : 'translate3d(' + dX + 'px, 0px, 0px)',
                    'width' : valWidth
                });
            }
        },

        adjustHeight : function(a, b){
                var dY = a.position().top - b.position().top + $('#left-slider').height() / 4;
                if (dY != 0 ){
                    b.css('-webkit-transform', 'translate3d(0px, ' + dY  + 'px, 0px)');
                }
        },

        colorLineTransit : function(){
            //adjust color line width
            var $colorLine = $('#slider-color-line');
            var $rightSlider = $('#right-slider');
            var $leftSlider = $('#left-slider');
            var btwPointer = $rightSlider.position().left - $leftSlider.position().left;
            $colorLine.css('margin-left', $leftSlider.position().left);
            $colorLine.css('width', btwPointer);
        },

        clearSlider : function(){
            if($('#slider-view').size() != 0){
                $('#slider-view').remove();
                $('#slider-value-view').remove();
                this.options.left.value = new Array();
                this.options.right.value = new Array();
            }
        },

        init : function(options){
            //merge user's options
            $.extend(this.options, options);

            //clear existing slider
            this.clearSlider(); 

            var left = this.options.left;
            var right = this.options.right;

            //get slider values from select box
            this.getOptionVal(left);
            this.getOptionVal(right);

            //create slider view
            this.attachView(left);
            this.attachView(right);

            //add touch event to slider pointer
            this.pointerBind(left);
            this.pointerBind(right);

            //adjust color line when the pointer is moved
            this.colorLineTransit(); 
        }
    }

})(this.jQuery);
