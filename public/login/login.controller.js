angular.module('app.explore')
    .controller('LoginController', LoginController);

LoginController.$inject = ['userService', '$cookies'];

function LoginController(userService, $cookies) {
    var vm = this;
    vm.isIn = userService.inSession();
    vm.badAuth = false;
    
    vm.authLogin = function(user, pass) {
        userService.loginUser(user, pass).then(function(response) {
            vm.badAuth = angular.isUndefined(response.data.auth);
            vm.isIn = userService.inSession();
            console.log(vm.isIn);
        });
    };
    
    vm.currentUser = function() {
        return $cookies.user;
    };
    
    vm.logout = function() {
        vm.pass = undefined;
        vm.user = undefined;
        vm.isIn = userService.logout();
    }
}