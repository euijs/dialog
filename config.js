var _ = require('lodash');

var config = {
    // 运行环境
    "env" : "production",
    "debug" : false
};

if(process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development'){
    //使用local.js中的配置覆盖config.js中的配置
    config = _.assignIn(config,{
        "env" : "development",
        "debug" : true
    });
}

module.exports = config;
