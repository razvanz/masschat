(function() {
  'use strict';

  var uiTabsetCtrl = function($rootScope, $scope, $state) {
      var ctrl = this,
        selectedTab = 0,
        tabIdxToChange = null;

      ctrl.tabs = $scope.tabs = $scope.tabs || [];

      // add the current view

      $rootScope.$on('$stateChangeStart', function(event, toState, toParam) {
        if (!event.defaultPrevented && !ctrl.excludeState(toState, toParam)) {
          var tabIdx = ctrl.getTabIdx(toState.name, toParam);
          tabIdxToChange = tabIdx;
          if (tabIdx === undefined) {
            ctrl.addTab({
              title: toState.title,
              stateName: toState.name,
              stateParams: toParam,
              active: false
            });
            tabIdxToChange = ctrl.tabs.length - 1;
          }
        }
      });

      $rootScope.$on('$stateChangeSuccess', function(event, toState, toParam) {
        if (!ctrl.excludeState(toState, toParam) && tabIdxToChange !== null) {
          ctrl.updateActive(tabIdxToChange);
        }
      });

      $rootScope.$on('$stateChangeError', function() {

        // remove added tab?

        ctrl.displayErrorState(arguments[arguments.length - 1]);
      });

      ctrl.excludeState = function(state, stateParams) {
        return state.notAsTab || state.name.lastIndexOf($scope.prefix, 0) !== 0;
      };

      ctrl.updateActive = function(tabIdx) {
        ctrl.markInactive(selectedTab);
        selectedTab = tabIdx;
        ctrl.tabs[tabIdx].active = true;
      };

      ctrl.markInactive = function(tabIdx) {
        if (tabIdx !== null && ctrl.tabs[tabIdx]) {
          ctrl.tabs[tabIdx].active = false;
        } else {
          angular.forEach(ctrl.tabs, function(tab) {
            if (tab.active) {
              tab.active = false;
            }
          });
        }
      };

      ctrl.select = function(tabIdx) {
        $state.go(ctrl.tabs[tabIdx].stateName, ctrl.tabs[tabIdx].stateParams);
      };

      ctrl.addTab = function(tab) {
        if (ctrl.tabs.length === 1) {
          tab.active = true;
        }
        ctrl.tabs.push(tab);
      };

      ctrl.removeTab = function(tab, $event) {
        if ($event) {
          $event.preventDefault();
          $event.stopPropagation();
        }

        // always there should be a tab
        if (ctrl.tabs.length > 1) {

          var newActiveIndex = 0,
            tabIdx = ctrl.getTabIdx(tab.stateName, tab.stateParams);

          if (tabIdx === selectedTab && !destroyed) {
            newActiveIndex = (tabIdx === ctrl.tabs.length - 1 ?
              tabIdx - 1 : tabIdx);
          }
          ctrl.tabs.splice(tabIdx, 1);
          ctrl.select(newActiveIndex);
        }
      };

      ctrl.displayErrorState = function(error) {
        if ($scope.errorStateName)
          $state.go($scope.errorStateName, $scope.errorStateParams || {
            error: error
          });
      };

      ctrl.transformParams = function(stateParams) {
        var obj = {};
        for (var key in stateParams) {
          obj[key] = stateParams[key];
        }
        return obj;
      };

      ctrl.getTabIdx = function(stateName, stateParams) {
        for (var i = ctrl.tabs.length - 1; i > -1; i--) {
          if (ctrl.tabs[i].stateName === stateName &&
            angular.equals(ctrl.tabs[i].stateParams, stateParams)) {
            return i;
          }
        }
      };

      // add the current state
      ctrl.addTab({
        title: $state.$current.title,
        stateName: $state.$current.name,
        stateParams: ctrl.transformParams($state.params),
        active: true
      });

      var destroyed;
      $scope.$on('$destroy', function() {
        destroyed = true;
      });
    },
    uiTabset = function() {
      return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {
          type: '@',
          tabs: '=',
          prefix: '@',
          errorStateName: '=',
          errorStateParams: '='
        },
        controller: 'uiTabsetCtrl as uiTabset',
        templateUrl: 'app/views/templates/tabset.html',
        link: function(scope, element, attrs) {
          scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent
            .$eval(attrs.vertical) : false;
          scope.justified = angular.isDefined(attrs.justified) ? scope.$parent
            .$eval(attrs.justified) : false;
        }
      };
    },
    uiTabHeaderTransclude = function() {
      return {
        restrict: 'A',
        replace: false,
        link: function(scope, elem, attrs, ctrls, transclude) {
          transclude(scope, function(cElem) {
            elem.html('');
            elem.append(cElem);
          });
        }
      };
    };

  uiTabsetCtrl.$inject = ['$rootScope', '$scope', '$state'];
  uiTabset.$inject = [];
  uiTabHeaderTransclude.$inject = [];

  angular.module('app')
    .controller('uiTabsetCtrl', uiTabsetCtrl)
    .directive('uiTabset', uiTabset)
    .directive('uiTabHeaderTransclude', uiTabHeaderTransclude);

})();
