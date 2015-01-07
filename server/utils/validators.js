'use strict';

var passwdStrenght = /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{6,128})$/;


exports.validateLocalStrategyProperty = function(property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};
exports.validateLocalStrategyPassword = function(password) {
  return (this.provider !== 'local' ||
    (password && password.length > 6 && passwdStrenght.test(password)));
};

exports.isValidAge = function(age) {
  return (age >= 0 && age <= 120);
};
