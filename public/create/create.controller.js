angular.module('app.create')
    .controller('CreateController', CreateController);

CreateController.$inject = ['pathwayService', 'badgeService', '$stateParams', '$state'];

function CreateController(pathwayService, badgeService, $stateParams, $state) {
    var vm = this;
    
    console.log($stateParams);
    
    vm.pathway = {};
    
    vm.onMetadata = 1;
    
    vm.tmpImage = undefined;
    
    //test - ok
    vm.step = 0;
    var maxStep = 2;
    vm.moveStep = function(dir) {
        if((vm.step + dir) >= 0 && (vm.step + dir) <= maxStep) {
            vm.step = vm.step + dir;
        }
    };
    
    function indexWaypoints(points) {
        var j = 0;
        for(j = 0; j < points.length; j++) {
            points[j].index = j;
        }
    }
    
    if(angular.isDefined($stateParams.pathway_id) && $stateParams.pathway_id !== null && $stateParams.pathway_id !== "") {
        pathwayService.getPathway($stateParams.pathway_id).success(function(response) {
            console.log(response);
            vm.pathway = response;
            vm.waypoints = vm.pathway.waypoints;
            //should move indexing out - already taken care of by creation
            indexWaypoints(vm.waypoints);
            
            if(angular.isDefined(vm.pathway.badge)) {
                badgeService.getBadge(vm.pathway.badge).success(function(response) {
                    console.log(response);
                    vm.badgeImage = response.data.image_url;
                });
            }
        });
    } else {
        vm.waypoints = [];
    }
    
    vm.addWaypoint = function () {
        var number = vm.waypoints.length;
        console.log(number);
        vm.waypoints.push({text: 'Waypoint ' + (number + 1), content: '', index: number});
        vm.currentWaypoint = number;
        vm.onMetadata = false;
        vm.savePathway();
    };
    
    vm.deleteWaypoint = function (waypointIndex) {
        vm.waypoints.splice(waypointIndex, 1);
        indexWaypoints(vm.waypoints);
        if(vm.currentWaypoint >= vm.waypoints.length && vm.waypoints.length > 0) {
            vm.currentWaypoint = vm.currentWaypoint - 1;
        }
        if(vm.waypoints.length === 0) {
            vm.onMetadata = true;
        }
        vm.savePathway();
    };
    
    vm.createBadge = function () {
        var formData = new FormData();
        formData.append('file', vm.myFile);
        formData.append('title', vm.pathway.title);
        formData.append('short_description', vm.pathway.description);
        formData.append('description', vm.pathway.longDescription);
        formData.append('categories', tagsToList(vm.pathway.tags));
        
        var reader = new FileReader();
        
        reader.onload = function (e) {
            vm.badgeImage = e.target.result;
            console.log(vm.badgeImage);
        };
        
        reader.readAsDataURL(vm.myFile);
        
        if(angular.isDefined(vm.pathway.badge)) {
            badgeService.updateBadge(vm.pathway.badge, formData).error(function(message) {
                console.log(message);
            }).success(function(response) {
                console.log('got response: ');
                console.log(response);
                //vm.pathway.badge = JSON.parse(response).data;
                console.log(vm.pathway.badge);
                vm.savePathway();
            });
        } else {
            badgeService.createBadge(formData).error(function(message) {
                console.log(message);
            }).success(function(response) {
                console.log('got response: ');
                console.log(response);
                vm.pathway.badge = JSON.parse(response).data;
                console.log(vm.pathway.badge);
                vm.savePathway();
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
    
    vm.savePathway = function () {
        if(vm.currentWaypoint === 0 && $state.is('create')) {
            pathwayService.makePathway(vm.pathway).success(function(response) {
                console.log(response);
                $state.go('create.detail', {pathway_id: response._id});
            });
        } else {
            vm.pathway.waypoints = vm.waypoints;
            pathwayService.savePathway($stateParams.pathway_id, vm.pathway).success(function(response) {
                console.log(response);
            });
        }
    };
    
    vm.badgeButtonText = function () {
        if(angular.isDefined(vm.pathway.badge)) {
            return "Change Badge Image";
        } else {
            return "Create Badge";
        }
    };
    
    vm.submitDisabled = function () {
        return angular.isUndefined(vm.myFile);
    };
    
    function tagsToList(tags) {
        var tagList = '';
        
        angular.forEach(tags, function(tag) {
            tagList = tagList + tag.text + ', ';
        });
        
        return tagList;
    }
}