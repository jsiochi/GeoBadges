angular.module('app')
    .directive('clickValue', function() {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function($scope, element, attrs, ngModel) {
                $scope.$on(attrs.ngModel, function(event, args) {
                    event.stopPropagation();
                    console.log(attrs.ngModel);
                    ngModel.$setViewValue(args[0], event);
                });
            }
        }
    })
    .directive('clickSet', function() {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                element.on('mousedown', function(event) {
                    $scope.$emit(attrs.param,[element.text()]);
                    console.log('emitted ' + attrs.param + ' with value ' + element.text());
                });
            }
        }
    })
    .directive('clickValueMulti', function() {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function($scope, element, attrs, ngModel) {
                ngModel.$formatters.push(function(val){
                    return arrayToString(val);
                });
                
                ngModel.$parsers.push(function(val) {
                    return stringToArray(val);
                });
                
                $scope.$on(attrs.ngModel, function(event, args) {
                    event.stopPropagation();
                    var valueToSet = arrayToString(updateArray(args[0].trim(), ngModel.$modelValue));
                    ngModel.$setViewValue(valueToSet, event);
                });
            }
        }
    })
    .directive('clickSetMulti', function() {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                element.on('mousedown', function(event) {
                    $scope.$emit(attrs.param,[element.text()]);
                    console.log('emitted ' + attrs.param + ' with value ' + element.text());
                });
            }
        }
    });

function arrayToString(arr) {
    if(angular.isUndefined(arr) || arr.length == 0) {
        return '';
    }
    var result = arr[0];
    for(var i=1; i<arr.length; i++) {
        console.log(i);
        result = result + ', ' + arr[i];
    };
    
    return result;
}

function updateArray(val, arr) {
    if(angular.isUndefined(arr)) {
        arr = [];
    }
    var pos = arr.indexOf(val);
    if(pos < 0) {
        arr.push(val);
        return arr;
    } else {
        arr.splice(pos, 1);
        return arr;
    }
}

function stringToArray(str) {
    if(str == '') {
        return [];
    } else {
        var a = str.split(', ');
        return a;
    }
}