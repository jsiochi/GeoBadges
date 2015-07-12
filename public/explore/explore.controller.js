angular.module('app.explore')
    .controller('ExploreController', ExploreController);

ExploreController.$inject = ['pathwayService', 'badgeService', '$stateParams', '$state', 'userService'];

function ExploreController(pathwayService, badgeService, $stateParams, $state, userService) {
    var vm = this;
    
    vm.unselectText = 'No Filter';
    
    vm.pathways = [];
    
    vm.canEdit = false;
    vm.canAdmin = false;
    
    userService.isLoggedIn().success(function(response) {
        if(response.auth == true) {
            vm.canEdit = true;
        }
    });
    
    userService.isLoggedIn('admin').success(function(response) {
        console.log(response.auth);
        vm.canAdmin = response.auth;
    });
    
    vm.gradeList = [{index: 0, desc: vm.unselectText},
                    {index: 1, desc: 'Grade 3-5'},
                    {index: 2, desc: 'Grade 6-8'},
                    {index: 3, desc: 'Grade 9-12'},
                    {index: 4, desc: 'Higher Ed'},
                    {index: 5, desc: 'Pro'}];
    
    vm.subjectList = [vm.unselectText, 'History', 'Social Studies', 'Earth Science', 'English/Language Arts', 'Economics'];
    
    vm.learningEnvList = [vm.unselectText, 'Inside', 'Outside', 'Individual', 'Small Group', 'Whole Class'];
    
    vm.submitDisabled = function () {
        return angular.isUndefined($scope.myFile);
    };
    
    vm.isDef = function(member) {
        if(angular.isDefined(member) && member != null && member != '') {
            return true;
        } else {
            return false;
        }
    };
    
    vm.buildQuery = function() {
        var q = {};
        
        if(vm.isDef(vm.targetAges) && vm.targetAges !== vm.unselectText) {
            q.targetAges = vm.targetAges;
        }
        if(vm.isDef(vm.subjectAreas) && vm.subjectAreas !== vm.unselectText) {
            q.subjectAreas = vm.subjectAreas;
        }
        if(vm.isDef(vm.environments) && vm.environments !== vm.unselectText) {
            q.environments = vm.environments;
        }
        
        pathwayService.queryPathways(q).success(function(response) {
            vm.pathways = response;
        });
    };
    
    vm.delete = function(title, pathwayId) {
        if(!confirm('Are you sure you want to delete the badge \'' + title + '\'?')) {
            return;
        }
    };
    
    pathwayService.getAllPathways().success(function(response) {
        vm.pathways = response;
        
        angular.forEach(vm.pathways, function(pathway) {
            setBadgeImage(pathway);
        });
    });
    
    function setBadgeImage(pathway) {
        if(angular.isDefined(pathway.badge) && !vm.isDef(pathway.badgeImg)) {
            badgeService.getBadge(pathway.badge).success(function(response) {
                //console.log('getting badge image from remote: ' + response.data.image_url);
                pathway.badgeImg = response.data.image_url;
                pathwayService.savePathway(pathway._id, pathway).success(function(response) {
                    //console.log(response);
                });
            });
        }
    };
}