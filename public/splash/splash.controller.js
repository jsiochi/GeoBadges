angular.module('app.explore')
    .controller('SplashController', SplashController);

SplashController.$inject = ['mailService'];

function SplashController(mailService) {
    var vm = this;
    
    vm.mail = function(address) {
        mailService.mailInfo('Jeremiah', address).success(function(response) {
            console.log(response);
        });
    };
}