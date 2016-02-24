(function() {

    var app = Sammy.apps.body;

    app.get('#/', function(context) {

        context.render('view/main.template', {}, function(view) {

            // empty wrapper and append new view
            $('#wrapper').empty();
            $('#wrapper').append(view);

            // transition the section
            setTimeout( function(){$('#intro').removeClass('inactive');}, 250 );

            // set menu style
            $('#sidebar').find('a').removeClass('active');

        });

    });

    app.get('#/newrepo', function(context) {

        context.render('view/new_repo.template', {}, function(view) {
            $('#wrapper').empty();
            $('#wrapper').append(view);

            // transition the section
            setTimeout( function(){$('#newrepo_section').removeClass('inactive');}, 250 );

            // Fix: Placeholder polyfill.
            $('form').placeholder();

            // setup id generation
            $('#name').on('keyup', function(event){

                // update new repo id
                var new_id = $('#name').val().toLowerCase().replace(/[\s<>!@#\$%\^\&*\)\(+=._-]/g, '_');
                $('#id').val(new_id);
                $('#repoId').text(new_id);

            });

            // set menu style
            $('#sidebar').find('a').removeClass('active');
            $('#newrepo').find('a').addClass('active').addClass('active-locked');

            var checkSubmit = function(){
                if( $('#url').val() != "" &
                    $('#name').val() != "" &
                    $('#id').val() != "" &
                    $('#token').val() != ""){
                    // enable submit buttons initially
                    $('.submit').each(function(button){

                        $(this).removeClass('disabled');

                    });
                }else{
                    // disable submit buttons initially
                    $('.submit').each(function(button){

                        $(this).addClass('disabled');

                    });
                }
            };
            checkSubmit();

            // set debounced url focusout function for other
            var effUrlCheck = debounce(function(){
                if($('#url').val() != '') $('#url').focusout();
            }, 500);

            // setup url display
            $('#token').on('keyup', function(event){

                // update url
                var new_token = $('#token').val();
                $('#repoToken').text(new_token);

                // enable submit?
                checkSubmit();

                // check URL but not all the time...
                effUrlCheck();

            });

            // setup url display
            $('#url').on('keyup', function(event){

                // update url
                var new_url = $('#url').val();
                $('#repoUrl').text(new_url);
                $('#repoUrl').attr('href', new_url);

                // enable submit?
                checkSubmit();

            });

            // setup url display
            $('#url').on('focusout', function(event){

                // validate url
                var new_url = $('#url').val();

                // ensure the url is present and not just a missclick
                if(new_url == '') return;

                var url_parts = new_url.split('/');
                var url_prot = url_parts[0];
                var url_site = url_parts[2];
                var url_uorg = url_parts[3];
                var url_repo = url_parts[4];

                // does the url point to public github? If not assume enterprise
                var is_enterprise = ! (url_site.match(/github\.com/));

                // if the url appears to be enterprise but no token has been set...
                if(is_enterprise & $('#token').val() == ''){
                    // no token has been supplied yet so just return to avoid unecessary calls
                    $('#url_test').text(' (non-public address; add token)');
                    return;
                }

                // set the correct api path if url is not for public github (assume enterprise)
                var api_path = (is_enterprise) ? url_site + '/api/v3/' : 'api.' + url_site + '/';

                // add the user/organization and repo information to the path
                api_path = url_prot + '//' + api_path + 'repos/' + url_uorg + '/' + url_repo;

                // add the token if the path is for enterprise
                api_path = (is_enterprise) ? api_path + '?access_token=' + $('#token').val() : api_path;

                $('#url_test').text('');
                $('#url_test').removeClass('fa-square-o');
                $('#url_test').removeClass('fa-exclamation-triangle');
                $('#url_test').addClass('fa-spinner');
                $('#url_test').addClass('fa-spin');

                $.ajax({
                    method: 'GET',
                    url: api_path,
                    dataType: 'json',
                    success: function(data) {

                        $('#url_test').removeClass('fa-spinner');
                        $('#url_test').removeClass('fa-spin');
                        $('#url_test').addClass('fa-check-square-o');

                        console.log(data);

                        if(!data.private & data.has_wiki){

                            // disable token
                            $('#token_input').hide();
                            $('#repoToken').parent().hide();
                            $('#token').val('public_repo_no_token');
                            $('#url_test').text('');
                            $('#url_test').removeClass('bad');
                            $('#url_test').addClass('good');
                            $('#url').val(data.html_url);

                        }else if(!data.public & !data.has_wiki){

                            // repo doesn't have a wiki!
                            $('#token_input').show();
                            $('#repoToken').parent().show();
                            $('#token').val('');
                            $('#url_test').removeClass('fa-check-square-o');
                            $('#url_test').addClass('fa-exclamation-triangle');
                            $('#url_test').removeClass('good');
                            $('#url_test').addClass('bad');
                            $('#url_test').text(' (repo doesn\' have wiki!)');
                            $('#url').val(data.html_url);

                        }else if(data.private & is_enterprise & data.has_wiki){

                            // token provides access but repo is private so we're good
                            $('#url_test').text('');
                            $('#url_test').removeClass('bad');
                            $('#url_test').addClass('good');
                            $('#url').val(data.html_url);

                        }else if(data.private & is_enterprise & !data.has_wiki){

                            // repo doesn't have a wiki!
                            $('#token_input').show();
                            $('#repoToken').parent().show();
                            $('#token').val('');
                            $('#url_test').removeClass('fa-check-square-o');
                            $('#url_test').addClass('fa-exclamation-triangle');
                            $('#url_test').removeClass('good');
                            $('#url_test').addClass('bad');
                            $('#url_test').text(' (repo doesn\' have wiki!)');
                            $('#url').val(data.html_url);

                        }else{

                            // require token
                            $('#token_input').show();
                            $('#repoToken').parent().show();
                            $('#token').val('');
                            $('#url_test').text('');
                            $('#url_test').removeClass('bad');
                            $('#url_test').addClass('good');

                        }

                    },
                    error: function(err) {

                        $('#url_test').removeClass('fa-spinner');
                        $('#url_test').removeClass('fa-spin');
                        $('#url_test').addClass('fa-exclamation-triangle');
                        $('#url_test').removeClass('good');
                        $('#url_test').addClass('bad');
                        $('#token_input').show();
                        $('#repoToken').parent().show();
                        if($('#token').val() == 'public_repo_no_token')
                            $('#token').val('');
                        $('#url_test').text(' (Can\'t find repo; check URL)');
                    },
                    complete: function() {

                        app.log('Did URL verification.')

                        // enable submit?
                        checkSubmit();

                    }
                });

            });

            // Hack: Activate non-input submits.
            $('form').on('click', '.submit', function(event) {

                // Stop propagation, default.
                event.stopPropagation();
                event.preventDefault();

                var new_repo = {
                    id:    encodeURIComponent($('#id').val()),
                    name:  encodeURIComponent($('#name').val()),
                    url:   encodeURIComponent($('#url').val()),
                    token: encodeURIComponent($('#token').val())
                }

                $.ajax({
                    method: 'PUT',
                    url: '/v1/repos/' + new_repo.id + "?name=" + new_repo.name + "&url=" + new_repo.url + "&token=" + new_repo.token,
                    dataType: 'json',
                    success: function(data) {

                        // update menu
                        var li = $("<li><a></a></li>");
                        li.attr('id', data[new_repo.id].id);
                        $('a', li)
                            .attr('href', '#/repos/' + data[new_repo.id].id)
                            .text(data[new_repo.id].name)
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

                        // redirect to new repo
                        app.setLocation('#/repos/' + data[new_repo.id].id);

                    },
                    error: function(err) {

                        app.error(JSON.stringify(err));

                        // alert error
                        context.render('view/alert.template', {
                            title:   'An Error Occured!',
                            message: err.responseJSON.status,
                            cancel:  false
                        }, function(view) {

                            $('#alertLanding').empty();
                            $('#alertLanding').append(view);

                            $('#alertOk').on('click', function(event){

                                // Stop propagation, default.
                                event.stopPropagation();
                                event.preventDefault();

                                $('#alertLanding').empty();

                            });

                        });

                    },
                    complete: function() {

                      app.log('Routed: GET #/newrepo');

                    }
                });

            });
        });

        app.log('Routed: GET #/newrepo');

    });

    app.get('#/repos/:repo', function(context) {

        var repo = context.params['repo'];

        $.ajax({
            method: 'GET',
            url: '/v1/repos/' + repo,
            dataType: 'json',
            success: function(data) {

                context.render('view/repo.template', {
                    'repoName':    data.name,
                    'repoID':      data.id,
                    'url':         data.url,
                    'last_commit': data.last_commit
                }, function(view) {
                    $('#wrapper').empty();
                    $('#wrapper').append(view);

                    // transition the section
                    setTimeout( function(){$('#' + repo + '_section').removeClass('inactive');}, 250 );

                    var checkSubmit = function(){
                        if( $('#terms').val() != ""){
                            // enable submit buttons initially
                            $('#search').removeClass('disabled');
                        }else{
                            // disable submit buttons initially
                            $('#search').addClass('disabled');
                        }
                    };
                    checkSubmit();

                    $('#terms').on('keyup', checkSubmit);

                    // Fix: Placeholder polyfill.
                    $('form').placeholder();

                    // Hack: Activate non-input submits.
                    $('form').on('click', '.submit', function(event) {

                        // Stop propagation, default.
                        event.stopPropagation();
                        event.preventDefault();

                        // Set form action from button
                        $(this).parents('form').attr('action', $(this)[0].hash);

                        // Submit form.
                        $(this).parents('form').submit();

                    });

                    // set menu style
                    $('#sidebar').find('a').removeClass('active');
                    $('#' + repo).find('a').addClass('active').addClass('active-locked');
                });

            },
            error: function(err) {

                app.error(err);

                context.render('view/no_repo.template', {
                    'repoID':      repo
                }, function(view) {
                    $('#wrapper').empty();
                    $('#wrapper').append(view);
                });

            },
            complete: function() {

              app.log('Routed: GET #/repos/:repo');

            }
        });

    });


    app.get('#/repos/:repo/search', function(context) {

        var repo   = context.params['repo'];
        var update = context.params['alwaysupdate'];
        var terms  = context.params['terms'];

        var path = (update == 'on') ? 'updateAndSearch' : 'search';

        $.ajax({
            method: 'POST',
            url: '/v1/repos/' + repo + '/' + path + '?terms=' + terms,
            dataType: 'json',
            success: function(data) {

                context.render('view/search.template', {
                    'repoName':    data.name,
                    'repoID':      data.id,
                    'repoUrl':     data.url,
                    'terms':       data.terms,
                    'results':     data.results
                }, function(view) {

                    $('#wrapper').empty();
                    $('#wrapper').append(view);

                    // transition the section
                    setTimeout( function(){$('#' + repo + '_search').removeClass('inactive');}, 250 );

                    // transition the features
                    setTimeout( function(){$('.features').removeClass('inactive');}, 500 );

                });

            },
            error: function(err) {

                app.error(JSON.stringify(err));

                // alert error
                context.render('view/alert.template', {
                    title:   'An Error Occured!',
                    message: err.responseJSON.status,
                    cancel:  false
                }, function(view) {

                    $('#alertLanding').empty();
                    $('#alertLanding').append(view);

                    $('#alertOk').on('click', function(event){

                        // Stop propagation, default.
                        event.stopPropagation();
                        event.preventDefault();

                        $('#alertLanding').empty();

                    });

                    app.setLocation('#/repos/' + repo);

                });

            },
            complete: function() {

              app.log('Routed: GET #/repos/:repo/search');

            }
        });

    });

    app.get('#/repos/:repo/update', function(context) {

        var repo = context.params['repo'];

        $.ajax({
            method: 'POST',
            url: '/v1/repos/' + repo + '/update',
            dataType: 'json',
            success: function(data) {

                context.render('view/alert.template', {
                    title:   'Repo update',
                    message: 'The repo has been successfully updated.',
                    cancel:  false
                }, function(view) {

                    $('#' + repo).remove();

                    $('#alertLanding').empty();
                    $('#alertLanding').append(view);

                    $('#alertOk').on('click', function(event){

                        // Stop propagation, default.
                        event.stopPropagation();
                        event.preventDefault();

                        $('#alertLanding').empty();

                        app.setLocation('#/repos/' + repo);

                    });

                });

            },
            error: function(err) {

                app.error(JSON.stringify(err));

                // alert error
                context.render('view/alert.template', {
                    title:   'An Error Occured!',
                    message: err.responseJSON.status,
                    cancel:  false
                }, function(view) {

                    $('#alertLanding').empty();
                    $('#alertLanding').append(view);

                    $('#alertOk').on('click', function(event){

                        // Stop propagation, default.
                        event.stopPropagation();
                        event.preventDefault();

                        $('#alertLanding').empty();

                        app.setLocation('#/repos/' + repo);

                    });

                });

            },
            complete: function() {

              app.log('Routed: GET #/repos/:repo/update');

            }
        });

    });

    app.get('#/repos/:repo/delete', function(context) {

        var repo = context.params['repo'];

        // really delete?
        context.render('view/alert.template', {
            title:   'Really Delete?',
            message: 'Are you sure you want to delete the repo: ' + repo,
            cancel:  true
        }, function(view) {

            $('#alertLanding').empty();
            $('#alertLanding').append(view);

            $('#alertCancel').on('click', function(event){

                // Stop propagation, default.
                event.stopPropagation();
                event.preventDefault();

                $('#alertLanding').empty();

                app.setLocation('#/repos/' + repo);

            });

            $('#alertOk').on('click', function(event){

                $('#alertLanding').empty();

                $.ajax({
                    method: 'DELETE',
                    url: '/v1/repos/' + repo,
                    dataType: 'json',
                    success: function(data) {

                        context.render('view/alert.template', {
                            title:   'Repo deleted',
                            message: 'The repo has been successfully delete.',
                            cancel:  false
                        }, function(view) {

                            $('#' + repo).remove();

                            $('#alertLanding').empty();
                            $('#alertLanding').append(view);

                            $('#alertOk').on('click', function(event){

                                // Stop propagation, default.
                                event.stopPropagation();
                                event.preventDefault();

                                $('#alertLanding').empty();

                                app.setLocation('#/');

                            });

                        });

                    },
                    error: function(err) {

                        app.error(JSON.stringify(err));

                        // alert error
                        context.render('view/alert.template', {
                            title:   'An Error Occured!',
                            message: err.responseJSON.status,
                            cancel:  false
                        }, function(view) {

                            $('#alertLanding').empty();
                            $('#alertLanding').append(view);

                            $('#alertOk').on('click', function(event){

                                // Stop propagation, default.
                                event.stopPropagation();
                                event.preventDefault();

                                $('#alertLanding').empty();

                            });

                        });

                    },
                    complete: function() {

                      app.log('Routed: GET #/repos/:repo/delete');

                    }
                });

            });

        });

    });

})();