angular.module('app.service').
    factory('userService', userService);

userService.$inject = ['$http', '$cookies'];

function userService($http, $cookies) {
    return {
        loginUser: loginUser,
        isLoggedIn: isLoggedIn,
        inSession: inSession,
        logout: logout
    }
    
    function loginUser(username, password) {
        return $http.post('/loginUser', {
            username: username,
            password: password
        }).then(function(response) {
            console.log(response);
            if(response.data.auth == true) {
                $cookies.token = response.data.token;
                $cookies.user = username;
                return response;
            }
        },
        function(response) {
            return response;
        });
    };
    
    function isLoggedIn(role) {
        return $http.post('/isAuthorized', {
            username: $cookies.user,
            token: $cookies.token,
            role: role
        });
    };
    
    function logout() {
        delete $cookies['user'];
        delete $cookies['token'];
        return false;
    }
    
    function inSession() {
        return angular.isDefined($cookies.user) && angular.isDefined($cookies.token)
    }
}