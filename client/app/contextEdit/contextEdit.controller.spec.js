'use strict';

describe('Controller: ContextEditCtrl', function () {

  // load the controller's module
  beforeEach(module('ummWordRiverTeam1Iteration1App'));

  var ContextEditCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ContextEditCtrl = $controller('ContextEditCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
