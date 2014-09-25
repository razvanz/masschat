(function () {

  'use strict';

  describe('Age Validator', function () {
    var validator = require('../../../server/utils/validators');

    it('should return true for a 0 <= age <= 120', function () {
      var age = 0;
      expect(validator.isValidAge(age)).toEqual(true);
    });

    it('should return false for a age < 0 OR age > 120', function () {
      var age = -1;
      expect(validator.isValidAge(age)).toEqual(false);
    });

  });

})();
