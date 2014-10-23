var backOfficeApp = angular.module('backOfficeApp', []);

backOfficeApp.controller('generalController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
    // Big hack here:
    // globals are defined by EJS. When it renders the page, it prints "var global = ..."
    // with '...' being the full res.locals object
    $rootScope.globals = $scope.globals = globals;

    $rootScope.refresh = $scope.refresh = function() {
        if (!$scope.$$phase)
            $scope.$apply();
    };

    /* Confirm box */
    /* Confirm box options:
         - title: String
         - text: HTML string
         - refuseText: String, defaults to "Refuse"
         - refuseCallback: Function(), defaults to $scope.closeConfirmBox
         - acceptText: String, defaults to "Accept"
         - acceptCallback: Function(), defaults to $scope.closeConfirmBox */
    $rootScope.openConfirmBox = $scope.openConfirmBox = function(confirmBox) {
        $('#page-hider').addClass('active');

        if (!confirmBox.refuseText)
            confirmBox.refuseText = 'Refuse';
        if (!confirmBox.refuseCallback)
            confirmBox.refuseCallback = $scope.closeConfirmBox;
        if (!confirmBox.acceptText)
            confirmBox.acceptText = 'Accept';
        if (!confirmBox.acceptCallback)
            confirmBox.acceptCallback = $scope.closeConfirmBox;

        $scope.confirmBox = confirmBox;
        $scope.confirmBoxOpened = true;
        $scope.refresh();
    };

    $rootScope.closeConfirmBox = $scope.closeConfirmBox = function(confirmBox) {
        $('#page-hider').removeClass('active');
        if ($scope.confirmBox)
            delete $scope.confirmBox;

        $scope.confirmBoxOpened = false;
    };
    /* !Confirm box */

    /* Alerts */
    $scope.alertList = [];
    $scope.alertIdx_ = 0;

    $rootScope.addAlert = $scope.addAlert = function(state, message) {
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

    $rootScope.removeAlert = $scope.removeAlert = function(alert) {
        $scope.alertList = $scope.alertList.filter(function(elem) {
            return elem.idx_ != alert.idx_;
        });
        $scope.refresh();
    };

    if ($scope.globals.alertList) {
        for (var i = 0 ; $scope.globals.alertList.length > i ; ++i) {
            var alert = $scope.globals.alertList[i];
            $scope.addAlert(alert.state, alert.message);
        }
    }
    /* !Alerts */

    /* Login */
    $scope.login = function() {
        if (!$scope.loginData.username ||
            2 >= $scope.loginData.username.length) {
            $scope.addAlert('error', 'Username too short, not logging you in!');
            return ;
        }

        if (!$scope.loginData.password ||
            2 >= $scope.loginData.password.length) {
            $scope.addAlert('error', 'Password too short, not logging you in!');
            return ;
        }

        var url = '/back-office/login';
        return $http.post(url, {
            username: $scope.loginData.username,
            password: $scope.loginData.password,
        }).then(function(response) {
            window.location = '/back-office'; // Redirect to home page
        }, function(response) {
            $scope.addAlert('error', response.data.message + '! Could not log you in.');
        });
    };

    $scope.logout = function() {
        if (!$scope.globals.logged)
            return ;

        var url = '/back-office/logout';
        return $http.post(url, {}).then(function(response) {
            window.location = '/back-office'; // Redirect to front
        }, function(response) {
            $scope.addAlert('error', response.data.message + '! Could not log you out.');
        });
    };
    /* !Login */

    /* Articles */
    $scope.changeArticleStatus_ = function(article, activate) {
        var url = null;

        if (activate)
            url = '/back-office/article/' + article._id + '/activate';
        else
            url = '/back-office/article/' + article._id + '/deactivate';

        return $http.post(url, {}).then(function(response) {
            article.activated = activate;
            if (article.activated)
                $scope.addAlert('success', 'Article "' + article.title + '" is now public!');
            else
                $scope.addAlert('success', 'Article "' + article.title + '" is now private.');
        }, function(response) {
            $scope.addAlert('error', 'Could not change article availability because: ' + response.data.message);
        });
    };

    $scope.activateArticle = function(article) {
        var confirmBox = {
            title: 'Activate article?',
            text: 'Do you really want to make the article "' + article.title + '" visible to anyone?',
            acceptCallback: function() {
                $scope.closeConfirmBox();
                return $scope.changeArticleStatus_(article, true);
            },
        };

        return $rootScope.openConfirmBox(confirmBox);
    };
    $scope.deactivateArticle = function(article) {
        var confirmBox = {
            title: 'Deactivate article?',
            text: 'Do you really want to make the article "' + article.title + '" invisible?',
            acceptCallback: function() {
                $scope.closeConfirmBox();
                return $scope.changeArticleStatus_(article, false);
            },
        };

        return $rootScope.openConfirmBox(confirmBox);
    };
    /* !Articles */
    $scope.addAlert('error', 'Article saved!');
}]);

/* Filter for trusted HTML. Usage: ng-bind-html="var | trust" */
backOfficeApp.filter('trust', ['$sce', function($sce) {
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);

backOfficeApp.controller('editArticleController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
    $rootScope.article = $scope.article = globals.article || {
        title: '',
        technicalName: '',
        caption: '',
        text: '',
        tags: [],
        type: null,
    };
    $scope.articleExists = undefined != globals.article;

    $scope.saveArticle_ = function(callback) {
        var url = '/back-office/article/' + $scope.article._id + '/save';
        $http.post(url, $scope.article).then(function(response) {
            $scope.addAlert('success', 'Article saved!');
            if (callback)
                return callback();
        }, function(response) {
            $scope.addAlert('error', 'Could not save article because: ' + response.data.message);
            if (callback)
                return callback(response.data);
        });
    };

    /* Article */
    $scope.deleteArticle = function() {
        var confirmBox = {
            title: 'Delete article?',
            text: 'Do you really want to delete the article "' + $scope.article.title + '"? This operation is not reversible.',
            acceptCallback: function() {
                $scope.closeConfirmBox();
                var url = '/back-office/article/' + $scope.article._id + '/delete';
                $http.post(url, {}).then(function(response) {
                    window.location = '/back-office/articles';
                }, function(response) {
                    $scope.addAlert('error', 'Could not delete article because: ' + response.data.message);
                });
            },
        };

        return $rootScope.openConfirmBox(confirmBox);
    };

    $scope.previewArticle = function() {
        var confirmBox = {
            title: 'Save article?',
            text: 'Do you really want to save the article "' + $scope.article.title + '"? The article must be saved in order to preview it.',
            acceptCallback: function() {
                $scope.closeConfirmBox();
                var url = '/back-office/article/' + $scope.article._id + '/save';
                $http.post(url, $scope.article).then(function(response) {
                    $scope.addAlert('success', 'Article saved!');

                    var previewUrl = '/article/preview/' + $scope.article.technicalName;
                    window.open(previewUrl, '_blank').focus();
                }, function(response) {
                    $scope.addAlert('error', 'Could not save article because: ' + response.data.message);
                });
            },
        };

        return $rootScope.openConfirmBox(confirmBox);
    };

    $scope.saveArticle = function() {
        var confirmBox = {
            title: 'Save article?',
            text: 'Do you really want to save the article "' + $scope.article.title + '"?',
            acceptCallback: function() {
                $scope.closeConfirmBox();
                $scope.saveArticle_();
            },
        };

        return $rootScope.openConfirmBox(confirmBox);
    };

    $scope.autoSave = function() {
        if ($scope.article &&
            $scope.article.title && $scope.article.title.length &&
            $scope.article.technicalName && $scope.article.technicalName.length &&
            $scope.article.caption && $scope.article.caption.length &&
            $scope.article.text && $scope.article.text.length &&
            $scope.article.tags && $scope.article.tags.length) {
            return $scope.saveArticle_(function(err) {
                if (err) return ;
                return setTimeout($scope.autoSave, 60000);
            });
        }
        else {
            $scope.addAlert('debug', 'Skipping autosave because not all fields are set');
            return setTimeout($scope.autoSave, 30000);
        }
    };

    setTimeout($scope.autoSave, 30000);
    /* !Article */
}]).directive('controlTags', function() {
    return {
        restrict: 'A',
        link: function($scope, $elem) {
            $($elem).on('keyup', function(e) {
                var newTag = $scope.newTag.trim();

                if (13 == e.which && newTag.length) { // Enter
                    if (-1 == $scope.article.tags.indexOf(newTag))
                    $scope.article.tags.push(newTag);
                    $scope.newTag = '';
                    $scope.refresh();
                }
                else if (8 == e.which && !$scope.newTag.length) {
                    $scope.newTag = $scope.article.tags.pop();
                    $scope.refresh();
                }
            });
        },
    };
}).directive('updateTechnicalName', ['$http', function($http) {
    return {
        restrict: 'A',
        link: function($scope, $elem) {
            $elem.on('change', function() {
                if (!$scope.article.title.length)
                    return ;

                var generateTechnicalNameUrl = '/back-office/article/generateTechnicalName?title=' + $scope.article.title;
                return $http.get(generateTechnicalNameUrl, {}).then(function(response) {
                    $scope.article.technicalName = response.data;
                }, function(response) {
                    $scope.addAlert('error', 'Could not generate a technical name because: ' + response.data.message);
                });
            });
        },
    };
}]);
