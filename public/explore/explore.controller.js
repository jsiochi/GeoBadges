angular.module('app.explore')
    .controller('ExploreController', ExploreController);

ExploreController.$inject = ['pathwayService', 'badgeService', '$stateParams', '$state', 'userService', '$scope'];

function ExploreController(pathwayService, badgeService, $stateParams, $state, userService, $scope) {
    var vm = this;
    vm.isDeleting = false;
    vm.loading = true;
    
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
    
    vm.toolList = [vm.unselectText, 'MapStory', 'OpenStreetMap'];
    
    vm.natGeoStandardList = [
        vm.unselectText,
        'How to use maps and other geographic representations, geospatial technologies, and spatial thinking to understand and communicate information',
        'How to use mental maps to organize information about people, places, and environments in a spatial context',
        'How to analyze the spatial organization of people, places, and environments on Earth\'s surface',
        'The physical and human characteristics of places',
        'That people create regions to interpret Earth\'s complexity',
        'How culture and experience influence people\'s perceptions of places and regions',
        'The physical processes that shape the patterns of Earth\'s surface',
        'The characteristics and spatial distribution of ecosystems and biomes on Earth\'s surface',
        'The characteristics, distribution, and migration of human populations on Earth\'s surface',
        'The characteristics, distribution, and complexity of Earth\'s cultural mosaics',
        'The patterns and networks of economic interdependence on Earth\'s surface',
        'The processes, patterns, and functions of human settlement',
        'How the forces of cooperation and conflict among people influence the division and control of Earth\'s surface',
        'How human actions modify the physical environment',
        'How physical systems affect human systems',
        'The changes that occur in the meaning, use, distribution, and importance of resources',
        'How to apply geography to interpret the past',
        'How to apply geography to interpret the present and plan for the future'
    ];
    
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
        vm.pathways = [];
        vm.loading = true;
        
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
        if(vm.isDef(vm.natGeoStandards) && vm.natGeoStandards !== vm.unselectText) {
            q.natGeoStandards = vm.natGeoStandards;
        }
        if(vm.isDef(vm.tools) && vm.tools !== vm.unselectText) {
            q['tools.text'] = vm.tools;
        }
        if(vm.isDef($scope.searchTag)) {
            q['tags.text'] = {$regex: $scope.searchTag, $options: "i"};
        };
        
        console.log(q);
        
        pathwayService.queryPathways(q).success(function(response) {
            vm.pathways = response;
            vm.loading = false;
        });
    };
    
    vm.delete = function(title, pathwayId) {
        vm.isDeleting = true;
        if(!confirm('Are you sure you want to delete the badge \'' + title + '\'?')) {
            vm.isDeleting = false;
            vm.deleteCanceled = true;
            return;
        }
        pathwayService.deletePathway(pathwayId).success(function(response) {
            console.log(response);
            loadPathways();
            vm.isDeleting = false;
        });
    };
    
    vm.goToPathway = function(pathId) {
        if(!vm.isDeleting && !vm.deleteCanceled) {
            $state.go('create.detail', { pathway_id: pathId});
        }
        vm.deleteCanceled = false;
    };
    
    $scope.$watch('searchTag', function(newValue) {
        if(newValue === '') {
            vm.buildQuery();
        }
    });
    
    loadPathways();
    
    function loadPathways() {
        vm.loading = true;
        
        pathwayService.getAllPathways().success(function(response) {
            vm.pathways = response;
            vm.loading = false;
        
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