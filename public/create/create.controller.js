angular.module('app.create').
    controller('CreateController', CreateController);

CreateController.$inject = ['pathwayService', '$stateParams', '$state'];

function CreateController(pathwayService, $stateParams, $state) {
    var vm = this;
    
    console.log($stateParams);
    
    vm.pathway = {};
    
    function indexWaypoints(points) {
        var j = 0;
        for(j = 0; j < points.length; j++) {
            points[j].index = j;
        }
    }
    
    if(angular.isDefined($stateParams.pathway_id) && $stateParams.pathway_id !== null) {
        pathwayService.getPathway($stateParams.pathway_id).success(function(response) {
            console.log(response);
            vm.pathway = response;
            vm.waypoints = vm.pathway.waypoints;
            vm.waypoints.unshift({text: 'Overview', text: 'Metadata'});
            indexWaypoints(vm.waypoints);
        });
    } else {
        vm.waypoints = [{text: 'Overview', text: 'Metadata', index: 0}];
    }
    
    vm.addWaypoint = function () {
        var number = vm.waypoints.length;
        vm.waypoints.push({text: 'Waypoint ' + number, content: 'NEW WAYPOINT ' + number + ' filler text', index: number});
        if(number === 1 && $state.is('create')) {
            pathwayService.makePathway(vm.pathway).success(function(response) {
                console.log(response);
                $state.go('create.detail', {pathway_id: response._id});
            });
        } else {
            pathwayService.savePathway($stateParams.pathway_id, vm.pathway).success(function(response) {
                console.log(response);
            });
        }
    };

    vm.currentWaypoint = 0;
    
    vm.gradeList = [{index: 0, desc: 'Grade 3-5'},
                    {index: 1, desc: 'Grade 6-8'},
                    {index: 2, desc: 'Grade 9-12'},
                    {index: 3, desc: 'Higher Ed'},
                    {index: 4, desc: 'Pro'}];
    
    vm.subjectList = ['History', 'Social Studies', 'Earth Science', 'English/Language Arts', 'Economics'];
    
    vm.learningEnvList = ['Inside', 'Outside', 'Individual', 'Small Group', 'Whole Class'];
    
    vm.standardList = ['1', '2', '3', '4', '5'];
} 