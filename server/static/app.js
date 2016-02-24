// some functions that may be helpful throughout
var debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

(function() {

    // Hack: Enable IE flexbox workarounds.
    if (skel.vars.IEVersion < 12)
        $('body').addClass('is-ie');

    // Disable animations/transitions until the page has loaded.
    if (skel.canUse('transition'))
        $('body').addClass('is-loading');

    $(window).on('load', function() {
        window.setTimeout(function() {
            $('body').removeClass('is-loading');
        }, 100);
    });

    var app = Sammy('body');
    app.use(Sammy.Template);

    app.log("Sammy initialized...");

    var load_main = function($) {

        skel.breakpoints({
            xlarge: '(max-width: 1680px)',
            large:  '(max-width: 1280px)',
            medium: '(max-width: 980px)',
            small:  '(max-width: 736px)',
            xsmall: '(max-width: 480px)'
        });

        $(function() {

            var $window = $(window),
                $body = $('body'),
                $sidebar = $('#sidebar');

            // Prioritize "important" elements on medium.
                skel.on('+medium -medium', function() {
                    $.prioritize(
                        '.important\\28 medium\\29',
                        skel.breakpoint('medium').active
                    );
                });

        });

    };

    $(document).ready(function() {

        $.ajax({
            method: 'GET',
            url: '/v1/repos',
            dataType: 'json',
            success: function(data) {

                data.forEach(function(repo){
                    var li = $('<li><a></a></li>');
                    li.attr('id', repo.id);
                    $('a', li)
                        .attr('href', '#/repos/' + repo.id)
                        .text(repo.name)
                        .append(' <i class="icon fa-github"></i>')
                        .on('click', function() {

                            var $this = $(this);

                            // Deactivate all links.
                            $('#sidebar').find('a').removeClass('active');

                            // Activate link *and* lock it (so Scrollex doesn't try to activate other links as we're scrolling to this one's section).
                            $this
                                .addClass('active')
                                .addClass('active-locked');

                        });
                    $('#menu').prepend(li);
                });

                // load transformation stuff
                load_main(jQuery);

                // run Sammy app
                app.run('#/');

            },
            error: function(err) {
              app.error(err);
            },
            complete: function() {
              app.log('Sammy app started...');
            }
        });

    });

})();