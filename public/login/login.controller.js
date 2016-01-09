angular.module('app.explore')
    .controller('LoginController', LoginController);

LoginController.$inject = ['userService', 'issuerService', '$cookies'];

function LoginController(userService, issuerService, $cookies) {
    var vm = this;
    vm.isIn = userService.inSession();
    vm.badAuth = false;
    vm.canAdmin = false;
    vm.issuerList = [];
    
    setShowAdmin();
    
    vm.authLogin = function(user, pass) {
        userService.loginUser(user, pass).then(function(response) {
            vm.badAuth = angular.isUndefined(response.data.auth);
            vm.isIn = userService.inSession();
            console.log(vm.isIn);
            setShowAdmin();
        });
    };
    
    issuerService.getIssuers().success(function(data) {
        vm.issuerList = data;
    });
    
    vm.currentUser = function() {
        return $cookies.user;
    };
    
    vm.logout = function() {
        vm.pass = undefined;
        vm.user = undefined;
        vm.isIn = userService.logout();
        setShowAdmin();
    };
    
    vm.addIssuer = function(i) {
        issuerService.addIssuer(i);
        vm.issuerList.push({name: i});
    };
    
    function setShowAdmin() {
        userService.isLoggedIn('admin').success(function(response) {
            vm.canAdmin = response.auth;
        });
    }
}