$.getScript('/js/_textareaResize.js');

(function() {
    $(document).ready(function() {
        var minHeight = $('#pmp-nav-desktop').offset().top;
        var nav = $('#pmp-nav-fixed');

        $(window).scroll(function() {
            if ($(this).scrollTop() > minHeight) {
                nav.removeClass('hidden-desktop');
            } else {
                nav.addClass   ('hidden-desktop');
            }
        });
    });
})();
