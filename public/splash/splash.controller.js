angular.module('app.explore')
    .controller('SplashController', SplashController);

SplashController.$inject = ['mailService', 'badgeService', 'pathwayService', '$state'];

function SplashController(mailService, badgeService, pathwayService, $state) {
    var vm = this;
    
    vm.successMessage = '';
    
    vm.mail = function(name, address) {
        vm.successMessage = 'Sending...';
        mailService.mailInfo(name, address).success(function(response) {
            console.log(response);
            vm.successMessage = 'Thanks for joining! We are glad to inform you of any future updates.'
        });
    };
    
    vm.isDef = function(member) {
        if(angular.isDefined(member) && member != null && member != '') {
            return true;
        } else {
            return false;
        }
    };
    
    if($state.is('splash')) {
        loadPathways();
    }
    
    function loadPathways() {
        pathwayService.getFeaturedPathways().success(function(response) {
            vm.pathways = response;
        
            angular.forEach(vm.pathways, function(pathway) {
                setBadgeImage(pathway);
            });
        });
    };
    
    function setBadgeImage(pathway) {
        if(angular.isDefined(pathway.badge) && !vm.isDef(pathway.badgeImg)) {
            badgeService.getBadge(pathway.badge).success(function(response) {
                console.log('getting badge image from remote: ' + response.data.image_url);
                pathway.badgeImg = response.data.image_url;
                pathwayService.savePathway(pathway._id, pathway).success(function(response) {
                    //console.log(response);
                });
            });
        }
    };
}