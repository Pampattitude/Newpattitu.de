var frontApp = angular.module('frontApp', []);

frontApp.controller('generalController', ['$scope', '$rootScope', function($scope, $rootScope) {
    // Big hack here:
    // globals are defined by EJS. When it renders the page, it prints "var global = ..."
    // with '...' being the full res.locals object
    $rootScope.globals = $scope.globals = globals;
    $scope.refresh = function() {
        if (!$scope.$$phase)
            $scope.$apply();
    };

    $scope.range = function(nb) {
        return new Array(nb);
    };

    /* Alerts */
    $scope.alertList = [];
    $scope.alertIdx_ = 0;

    $scope.addAlert = function(state, message) {
        var alert = {
            idx_: ($scope.alertIdx_)++,
            state: state,
            message: message,
            disappear: false
        };
        $scope.alertList.push(alert);
        $scope.refresh();

        if ('error' == state)
            return ; // Do not set automatic close on error

        return setTimeout(function() {
            for (var i = 0 ; $scope.alertList.length > i ; ++i) {
                if ($scope.alertList[i].idx_ == alert.idx_)
                    break ;
            }
            if ($scope.alertList.length == i)
                return $scope.removeAlert(alert);

            $($('.pmp-alert')[i]).slideUp(200 /*ms*/, function() {
                $scope.removeAlert(alert);
            });
        }, 5000 /*ms*/);
    };

    $scope.removeAlert = function(alert) {
        $scope.alertList = $scope.alertList.filter(function(elem) {
            return elem.idx_ != alert.idx_;
        });
        $scope.refresh();
    };

    // Take the globals alertList (i.e., alerts filled by the server) and
    // insert them in actual alert list
    if ($scope.globals.alertList) {
        for (var i = 0 ; $scope.globals.alertList.length > i ; ++i) {
            var alert = $scope.globals.alertList[i];
            $scope.addAlert(alert.state, alert.message);
        }
    }
    /* !Alerts */
}]);

/* Filter for trusted HTML. Usage: ng-bind-html="var | trust" */
frontApp.filter('trust', ['$sce', function($sce) {
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);

/* Twitter */
frontApp.directive('pollTwitter', function() {
    return {
        restrict: 'A',
        link: function($scope, $elem) {
            var linkify = function(inputText) { // By cloud8421 on StackOverflow
                var replacedText, replacePattern1, replacePattern2, replacePattern3;

                //URLs starting with http://, https://, or ftp://
                replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
                replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

                //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
                replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
                replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

                //Change email addresses to mailto:: links.
                replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
                replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

                return replacedText;
            };

            var pollTwitter = function(doneCallback) {
                var url = '/ajax/twitter/getLatest';
                return $.ajax(url).done(function(data) {
                    if (data) {
                        $scope.twitterPosts = data.map(function(elem) {
                            elem.text = linkify(
                                elem.text
                                    .replace(/(@[A-Za-z0-9\-_]+)/g, '<span class="user">$1</span>')  // Users
                                    .replace(/(#[A-Za-z0-9\-_]+)/g, '<span class="hashtag">$1</span>')
                            ); // Hashtags
                            return elem;
                        });
                        $scope.refresh();
                    }

                    return doneCallback(null, data);
                }).error(function(data) {
                    return doneCallback(err);
                });
            };

            var loop = function() {
                return pollTwitter(function(err, data) {
                    return setTimeout(loop, 10000 /* ms, so 10s */);
                });
            };

            return loop();
        },
    };
});
/* !Twitter */

/* Article controller */
frontApp.controller('articleController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
    $scope.incShare = function(network) {
        var addShareUrl = '/ajax/article/' + $rootScope.globals.article.technicalName + '/' + network + '/incShare';
        $http.post(addShareUrl, {}).then(function(response) {
            ++$rootScope.globals.article.shares[network];
        }, function(response) {
            // No error
            $scope.addAlert('debug', 'Could not increment share count because: "' + JSON.stringify(response.data) + '"');
        });
    };
}]).directive('unityPlayer', function() {
/* Unity3D Web Player */
    return {
        restrict: 'A',
        link: function($scope, $elem, $attrs) {
            $(document).ready(function() {
                $($elem[0]).css('display', 'table');
                $($elem[0]).css('margin', 'auto');

                $($elem[0]).append('<div class="missing"><a href="http://unity3d.com/webplayer/" title="Unity Web Player. Install now!"><img alt="Unity Web Player. Install now!" src="http://webplayer.unity3d.com/installation/getunity.png" width="193" height="63" /></a></div><div class="broken"><a href="http://unity3d.com/webplayer/" title="Unity Web Player. Install now! Restart your browser after install."><img alt="Unity Web Player. Install now! Restart your browser after install." src="http://webplayer.unity3d.com/installation/getunityrestart.png" width="193" height="63" /></a></div>');

                // Add Unity player object only if script not yet included
                $.getScript('//webplayer.unity3d.com/download_webplayer-3.x/3.0/uo/UnityObject2.js').done(function() {
                    var width = $($elem[0]).parent().width() * 9 / 10; // Max 9/10th of the parent block
                    if (960 < width)
                        width = 960; // px
                    else if (0 == width)
                        width: 960; // px

                    var config = {
                        width: width,
                        height: width * 9 / 16, // 16/9 visual configuration
                        params: { enableDebugging:"0" }
                    };

                    var u = new UnityObject2(config);

                    $(function() {
                        var $missingScreen = $($elem[0]).find(".missing");
                        var $brokenScreen = $($elem[0]).find(".broken");
                        $missingScreen.hide();
                        $brokenScreen.hide();

                        u.observeProgress(function (progress) {
                            switch(progress.pluginStatus) {
                            case "broken":
                                $brokenScreen.find("a").click(function (e) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    u.installPlugin();
                                    return false;
                                });
                                $brokenScreen.show();
                                break;
                            case "missing":
                                $missingScreen.find("a").click(function (e) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    u.installPlugin();
                                    return false;
                                });
                                $missingScreen.show();
                                break;
                            case "installed":
                                $missingScreen.remove();
                                break;
                            case "first":
                                break;
                            }
                        });

                        u.initPlugin($($elem[0])[0], $attrs.unity3dPlayer);
                    });
                }).fail(function(err) {
                    $scope.addAlert('error', 'Could not get Unity3D Web Player');
                });
            });
        },
    };
}).directive('compile', ['$compile', function ($compile) {
    return function($scope, $elem, $attrs) {
        $scope.$watch(
            function($scope) {
                // watch the 'compile' expression for changes
                return $scope.$eval($attrs.compile);
            },
            function(value) {
                // when the 'compile' expression changes
                // assign it into the current DOM
                $elem.html(value);

                // compile the new DOM and link it to the current
                // $scope.
                // NOTE: we only compile .childNodes so that
                // we don't get into infinite loop compiling ourselves
                $compile($elem.contents())($scope);
            }
        );
    };
}]);
/* !Unity3D Web Player */

/* !Article controller */

frontApp.controller('articleCommentsController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
    $scope.postComment = function() {
        if (!$scope.newComment)
            return $scope.addAlert('error', 'An error occured with the comment form, please <a href="/report">report it</a>');

        if (!$scope.newComment.author ||
            2 >= $scope.newComment.author.length)
            return $scope.addAlert('error', 'Name too short, refusing to send such a useless comment!');

        if (!$scope.newComment.text ||
            10 >= $scope.newComment.text.length)
            return $scope.addAlert('error', 'Comment content too short, refusing to send such a useless comment!');

        var postCommentUrl = '/ajax/article/' + $scope.globals.article.technicalName + '/comment';
        return $http.post(postCommentUrl, {
            author: $scope.newComment.author,
            text: $scope.newComment.text,
        }).then(function(response) { // Success
            $scope.addAlert('success', 'Comment successfully posted, thank you for the feedback!');
            delete $scope.newComment;
            $scope.newCommentPosted = true;

            var getCommentsUrl = '/ajax/article/' + $scope.globals.article.technicalName + '/getComments';
            return $http.get(getCommentsUrl, {}).then(function(response) { // Success
                $scope.globals.commentList = response.data.commentList;
                $scope.refresh();
            }, function(response) { // Error
                return $scope.addAlert('error', 'An error occured while retrieving comment list, please <a href="/report">report it</a>. Error data: "' + JSON.stringify(response.data) + '"');
            });
        }, function(response) { // Error
            $scope.addAlert('error', 'Could not save comment because: "' + JSON.stringify(response.data) + '"');
        });
    };
}]);

frontApp.controller('reportController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
    $scope.sendReport = function() {
        var sendReportUrl = '/report/send';

        return $http.post(sendReportUrl, $scope.report).then(function(response) {
            $($scope).find('.control').attr('disabled', 'disabled');
            $scope.addAlert('success', 'Thanks for the report!<br />Redirecting you to the homepage...');
            return setTimeout(function() {
                window.location = '/';
            }, 2000);
        }, function(response) {
            $scope.addAlert('error', 'Could not save report because: "' + JSON.stringify(response.data) + '"');
        });
    };
}]);
