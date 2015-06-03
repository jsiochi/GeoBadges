angular.module('app.create')
    .controller('BadgeController', BadgeController);

BadgeController.$inject = ['$modalInstance', 'badgeService', 'badgeData', '$scope', '$sce'];

function BadgeController($modalInstance, badgeService, badgeData, $scope, $sce) {
    console.log(badgeData);
    
    if(angular.isDefined(badgeData.badge)) {
            badgeService.getBadge(badgeData.badge).success(function(response) {
            console.log(response);
            $scope.badgeImage = response.data.image_url;
        });
    }
    
    $scope.ok = function () {
        $modalInstance.close(badgeData.badge);
    };
    
    $scope.submitDisabled = function () {
        return angular.isUndefined($scope.myFile);
    };
    
    $scope.createBadge = function () {
        var formData = new FormData();
        formData.append('file', $scope.myFile);
        formData.append('title', badgeData.title);
        formData.append('short_description', badgeData.description);
        formData.append('description', badgeData.longDescription);
        formData.append('categories', tagsToList(badgeData.tags));
        
        var reader = new FileReader();
        
        reader.onload = function (e) {
            $scope.badgeImage = e.target.result;
            console.log($scope.badgeImage);
        };
        
        reader.readAsDataURL($scope.myFile);
        
        if(angular.isDefined(badgeData.badge)) {
            badgeService.updateBadge(badgeData.badge, formData).error(function(message) {
                console.log(message);
            }).success(function(response) {
                console.log('got response: ');
                console.log(response);
                //$scope.pathway.badge = JSON.parse(response).data;
                console.log(badgeData.badge);
                //$scope.savePathway();
            });
        } else {
            badgeService.createBadge(formData).error(function(message) {
                console.log(message);
            }).success(function(response) {
                console.log('got response: ');
                console.log(response);
                badgeData.badge = JSON.parse(response).data;
                console.log(badgeData.badge);
                //$scope.savePathway();
            });
        }
    };
    
    $scope.badgeButtonText = function () {
        if(angular.isDefined(badgeData.badge)) {
            return "Change Badge Image";
        } else {
            return "Create Badge";
        }
    };
    
    function tagsToList(tags) {
        var tagList = '';
        
        angular.forEach(tags, function(tag) {
            tagList = tagList + tag.text + ', ';
        });
        
        return tagList;
    }
    
    badgeService.getBadgeBuilder().success(function(response) {
        console.log(response.badgeBuilderRef);
        $scope.builderUrl = $sce.trustAsResourceUrl(response.badgeBuilderRef);
    });
    
    $scope.hit = function() {
        console.log($scope.myData);
    };
    
    window.addEventListener("message", function (e) {
        if (e.origin === "https://credly.com" && typeof ($scope.myData = e.data) === "object") {
            var myBadge = document.getElementById("my-badge");
            
            //$scope.myData = {};

            //myBadge.imageUrl = $scope.myData.image;
            //myBadge.iconInfo = $scope.myData.iconMetadata;
            //myBadge.extraParameters = $scope.myData.packagedData;

            // Remove the badge builder
            //document.getElementById("badge-builder").remove();
        }
    });
}