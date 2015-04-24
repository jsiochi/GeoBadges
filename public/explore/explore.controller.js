angular.module('app.explore')
    .controller('ExploreController', ExploreController);

ExploreController.$inject = ['pathwayService', 'badgeService', '$stateParams', '$state'];

function ExploreController(pathwayService, badgeService, $stateParams, $state) {
    var vm = this;
    
    vm.pathways = [];
    
    console.log('awesome');
    
    pathwayService.getAllPathways().success(function(response) {
        vm.pathways = response;
        console.log(response);
        
        angular.forEach(vm.pathways, function(pathway) {
            if(angular.isDefined(pathway.badge)) {
                badgeService.getBadge(pathway.badge).success(function(response) {
                    console.log(response);
                    pathway.badgeImg = response.data.image_url;
                });
            }
        });
    });
    
    vm.getBadgeImage = function(badgeId) {
        
    };
}