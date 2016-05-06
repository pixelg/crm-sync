'use strict';

module.exports = function(){
    return {
         amp: function(str){
            return str.replace(/&/g, '');
        }
    }
}
 