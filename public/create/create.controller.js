angular.module('app.create')
    .controller('CreateController', CreateController);

CreateController.$inject = ['pathwayService', 'badgeService', '$stateParams', '$state', '$modal', '$sce', 'userService'];

function CreateController(pathwayService, badgeService, $stateParams, $state, $modal, $sce, userService) {
    var vm = this;
    vm.canEdit = false;
    vm.canAdmin = false;
    
    userService.isLoggedIn().success(function(response) {
        if(response.auth == false && !$state.is('pathway')) {
            $state.go('explore');
            return;
        } else if(response.auth == true) {
            vm.canEdit = true;
        }
        
        if(!$state.is('pathway')) {
            firstTimeModal();
        }
    });
    
    userService.isLoggedIn('admin').success(function(response) {
        console.log(response.auth);
        vm.canAdmin = response.auth;
    });
    
    vm.guidePart = 'define'; //can be 'define', 'badge', or 'waypoint'
    
    vm.pathway = {};
    
    vm.isDef = function(member) {
        if(angular.isDefined(member) && member != null && member != '') {
            return true;
        } else {
            return false;
        }
    };
    
    vm.submitDisabled = function () {
        return angular.isUndefined(vm.myFile);
    };
    
    vm.changePart = function(part, waypoint) {
        if(part === 'waypoint') {
            vm.guidePart = 'waypoint';
            vm.currentWaypoint = waypoint;
        } else {
            vm.guidePart = part;
        }
    };
    
    
    //test - ok
    vm.step = 0;
    var maxStep = 2;
    vm.moveStep = function(dir) {
        if((vm.step + dir) >= 0 && (vm.step + dir) <= maxStep) {
            vm.step = vm.step + dir;
            if(dir > 0) {
                vm.savePathway();
            }
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
            console.log(JSON.stringify(response));
            vm.pathway = response;
            if(vm.pathway.visible == false && !vm.canEdit) {
                $state.go('explore');
                return;
            }
            vm.waypoints = vm.pathway.waypoints;
            //should move indexing out - already taken care of by creation
            indexWaypoints(vm.waypoints);
            
            setBadgeImage();
        });
    } else {
        vm.waypoints = [];
    }
    
    vm.addWaypoint = function () {
        if(!vm.isDef(vm.waypoints)) {
            vm.waypoints = [];
        }
        var number = vm.waypoints.length;
        vm.waypoints.push({text: 'Untitled Step', content: '', index: number});
        vm.currentWaypoint = number;
        vm.pathway.waypoints = vm.waypoints;
        vm.savePathway();
    };
    
    vm.deleteWaypoint = function (waypointIndex, event) {
        event.stopPropagation();
        if(!confirm('Are you sure you want to delete step ' + (waypointIndex + 1) + '?')) {
            return;
        }
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
        if(angular.isDefined(vm.pathway.longDescription)) {
            formData.append('description', vm.pathway.longDescription.substring(0,499));
        }
        formData.append('categories', vm.tagsToList(vm.pathway.tags));
        if(angular.isDefined(vm.pathway.evidenceDescription)) {
            formData.append('require_claim_evidence_description', vm.pathway.evidenceDescription.substring(0,499));
        } else {
            alert('Please enter the evidence description!');
            return;
        }
        
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
                vm.pathway.badgeImg = '';
                vm.pathway.visible = true;
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
            console.log(vm.pathway.badgeImg);
            pathwayService.savePathway($stateParams.pathway_id, vm.pathway).success(function(response) {
                console.log(response);
            });
        }
    };
    
    vm.goToPreview = function () {
        if(confirm('Are you ready to submit this badge for review? Click OK to preview and submit.')) {
            $state.go('pathway', {pathway_id: $stateParams.pathway_id});
        }
    };
    
    vm.submitForReview = function () {
        vm.pathway.reviewable = true;
        vm.savePathway();
    };
    
    vm.badgeButtonText = function () {
        if(angular.isDefined(vm.pathway.badge)) {
            return "Change Badge Image";
        } else {
            return "Create Badge";
        }
    };
    
    vm.claim = function() {
        var myForm = {badge_id: vm.pathway.badge, evidence: vm.evidence, username: vm.user, password: vm.pass};
        
        badgeService.claimBadge(myForm).success(function(response) {
            console.log(response);
        });
    }
 
    vm.tagsToList = function(tags) {
        var tagList = '';
        
        angular.forEach(tags, function(tag) {
            tagList = tagList + tag.text + ', ';
        });
        
        return tagList.substring(0, tagList.length - 2);
    }
    
    vm.editBadge = function () {
        var badgeModal = $modal.open({
            animation: true,
            templateUrl: '../badge/badge.html',
            controller: 'BadgeController',
            size: 'lg',
            resolve: {
                badgeData: function () {
                    return vm.pathway;
                }
            }
        });
        
        badgeModal.result.then(function (badgeUpdate) {
            console.log(badgeUpdate);
        }, function () {
            console.log('Modal dismissed');
        });
    };
    
    vm.addElement = function(waypoint, type) {
        var toAdd = '';
        var msg = 'Enter link to add for ' + type + ':';
        
        if(type == 'video') {
            msg = 'Enter embed link for video: ';
        }
        
        var source = prompt(msg);
        
        switch(type) {
            case 'URL':
                toAdd = '<a href="' + source + '">' + source + '</a>';
                break;
            case 'image':
                toAdd = '<img src="' + source + '"/>';
                break;
            case 'video':
                toAdd = source;
                break;
            default:
                //do nothing
        }
        
        if(source != null) {
            vm.waypoints[waypoint].content = vm.waypoints[waypoint].content + toAdd + ' ';
        }
    };
    
    vm.trustContent = function(content) {
        return $sce.trustAsHtml(content);
    };
    
    function setBadgeImage() {
        if(angular.isDefined(vm.pathway.badge)) {
            if(!vm.isDef(vm.pathway.badgeImg)) {
                badgeService.getBadge(vm.pathway.badge).success(function(response) {
                    console.log('getting badge image from remote: ' + response.data.image_url);
                    vm.pathway.badgeImg = response.data.image_url;
                    vm.badgeImage = vm.pathway.badgeImg;
                    vm.savePathway();
                });
            } else {
                vm.badgeImage = vm.pathway.badgeImg;
            }
        }
    };
    
    function firstTimeModal() {
        $modal.open({
            animation: true,
            controller: 'BadgeController',
            template: '<div class="row" style="margin-top: 40px"><div class="col-md-8 col-md-offset-2 text-center">' +
                'Welcome to the GeoBadges Creator. Creating a GeoBadge works in three steps. ' + 
                'First, you\'ll give all the background description for your badge. Second, you\'ll create a Lesson ' + 
                'for how learners can earn your badge. Finally, you\'ll submit for review. If its accepted, the ' + 
                'Review Team will assign an icon to it, and add it to the commons for anyone to start working on!<br>' +
                '<button type="button" class="btn btn-default" style="margin-bottom: 40px;" ng-click="close()">Close</button></div></div>',
            size: 'md'
        });
    }
}