$.getScript('/js/_textareaResize.js');

(function() {
    $(document).ready(function() {
        /* External links */
        var host = window.location.host;

        $('a:not(.no-parse)').each(function() {
            var elem = this;

            if ($(elem).hasClass('internal-link') || // Internal, already treated
                $(elem).hasClass('external-link')) // External, already treated
                return ;

            if (/^\/([^\/]|$)/.test($(elem).attr('href')) ||
                (new RegExp('(http:)?\/\/' + host)).test($(elem).attr('href'))) { // Internal
                $(elem).addClass('internal-link');
                return ;
            }

            $(elem).addClass('external-link').attr('target', '_blank').append(' <span class="external-icon"><span class="icon icon-newtab"></span></span>');
        });
        /* !External links */

        /* Konami code to access BO */
        new Konami('/back-office');
        /* !Konami code to access BO */
    });
})();
