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
    });