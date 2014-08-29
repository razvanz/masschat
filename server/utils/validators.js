exports.isPositiveNumber = function(val){
  return val > 0;
};

exports.isInteger = function(val){
  return (val * 10) % 10 === 0;
};
