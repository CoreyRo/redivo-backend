
$(document).ready(function($){
    console.log('loaded')
    console.log($('#text').data('text'))
    let text = $('#current_text').val()
    $('#text').html(text)
    $('.admin-btn-remove-up').on('click', function(e){
        e.preventDefault()
    })


    $("#imageURL").change(function() {
        imgView(this);
    });
    function imgView(input) {
        if (input.files && input.files[0]) {
            $('.preview-image').html(input.files[0].name)
            let reader = new FileReader();
            reader.onload = function(e) {
            $('.previewimg').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    $.fn.extend({
        animateCss: function(animationName, callback) {
          var animationEnd = (function(el) {
            var animations = {
              animation: 'animationend',
              OAnimation: 'oAnimationEnd',
              MozAnimation: 'mozAnimationEnd',
              WebkitAnimation: 'webkitAnimationEnd',
            };
      
            for (var t in animations) {
              if (el.style[t] !== undefined) {
                return animations[t];
              }
            }
          })(document.createElement('div'));
      
          this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
      
            if (typeof callback === 'function') callback();
          });
      
          return this;
        },
      });
})


