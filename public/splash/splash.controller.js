angular.module('app.explore')
    .controller('SplashController', SplashController);

SplashController.$inject = ['mailService'];

function SplashController(mailService) {
    var vm = this;
    
    vm.successMessage = '';
    
    vm.mail = function(name, address) {
        vm.successMessage = 'Sending...';
        mailService.mailInfo(name, address).success(function(response) {
            console.log(response);
            vm.successMessage = 'Thanks for joining! We are glad to inform you of any future updates.'
        });
    };
}