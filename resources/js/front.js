$.getScript('/js/_textareaResize.js');

(function() {
    $(document).ready(function() {
        /* Fixed top menu */
        var minHeight = $('#pmp-nav-desktop')[0].getBoundingClientRect().top +
            $(this).scrollTop();
        var nav = $('#pmp-nav-fixed');

        $(window).scroll(function() {
            if ($(this).scrollTop() > minHeight) {
                nav.removeClass('hidden-desktop');
            } else {
                nav.addClass   ('hidden-desktop');
            }
        });
        /* !Fixed top menu */

        /* Konami code to access BO */
        new Konami('/back-office');
        /* !Konami code to access BO */
    });
})();
