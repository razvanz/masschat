exports.validateLocalStrategyProperty = function (property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};
exports.validateLocalStrategyPassword = function (password) {
  return (this.provider !== 'local' || (password && password.length > 4));
};

exports.isValidAge = function(age){
  return (age >= 0 && age <=120);
};
