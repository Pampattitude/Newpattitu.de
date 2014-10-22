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
            url = '/back-office/article/' + article.technicalName + '/activate';
        else
            url = '/back-office/article/' + article.technicalName + '/deactivate';

        return $http.post(url, {}).then(function(response) {
            article.activated = activate;
        }, function(response) {
            $scope.addAlert('error', 'Could not change article availability because: ' + response.data.message);
        });
    };

    $scope.activateArticle = function(article) {
        return $scope.changeArticleStatus_(article, true);
    };
    $scope.deactivateArticle = function(article) {
        return $scope.changeArticleStatus_(article, false);
    };
    /* !Articles */
}]);

/* Filter for trusted HTML. Usage: ng-bind-html="var | trust" */
backOfficeApp.filter('trust', ['$sce', function($sce) {
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);

backOfficeApp.controller('editArticleController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
    $scope.article = globals.article;
    $scope.articleExists = undefined != globals.article;

    /* Article */
    $scope.deleteArticle = function() {
        var confirmBox = {
            title: 'Delete article "' + $scope.article.title + '"?',
            text: 'Do you really want to delete the article "' + $scope.article.title + '" ("' + $scope.article.technicalName + '")? This operation is not reversible',
            acceptCallback: function() {
                var url = '/back-office/article/' + $scope.article.technicalName + '/delete';
                $http.post(url, {}).then(function(response) {
                    $scope.closeConfirmBox();
                    window.location = '/back-office/articles';
                }, function(response) {
                    $scope.addAlert('error', 'Could not delete article because: ' + response.data.message);
                });
            },
        };

        $rootScope.openConfirmBox(confirmBox);

    };
    /* !Article */
}]);
