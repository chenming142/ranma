var homunculus = require('homunculus');
var Token = homunculus.getClass('token');
var JsNode = homunculus.getClass('node', 'js');

var exist = require('./exist');

var isCommonJS;
var isAMD;
var isCMD;

function analyse(context) {
  if(!isCommonJS) {
    if(context.hasVid('require') && !exist.isExist('require', context) && !exist.inDefine(context)) {
      isCommonJS = true;
    }
    if(context.hasVid('module') && !exist.isExist('module', context) && !exist.inDefine(context)) {
      isCommonJS = true;
    }
    if(context.hasVid('exports') && !exist.isExist('exports', context) && !exist.inDefine(context)) {
      isCommonJS = true;
    }
  }
  if(context.hasVid('define') && !exist.isExist('define', context)) {
    var define = context.getVid('define');
    for(var i = 0; i < define.length; i++) {
      var par = define[i].parent();
      if(par
        && par.next()
        && par.next().name() == JsNode.TOKEN
        && par.next().token().content() == '.'
        && par.next().next()
        && par.next().next().name() == JsNode.TOKEN
        && par.next().next().token().content() == 'amd') {
        isCMD = false;
        isAMD = true;
      }
      else if(!isAMD
        && par
        && par.next()
        && par.next().name() == JsNode.ARGS
        && par.next().leaves().length == 3) {
        //检查factory的参数是否是require,exports,module的CMD写法；
        var arglist = par.next().leaves()[1];
        var factory = arglist.leaves().slice(-1)[0];
        if(factory.name() == JsNode.FNEXPR) {
          var fnparams = factory.leaves()[2];
          if(fnparams.name() == JsNode.TOKEN && fnparams.token().content() == '(') {
            fnparams = fnparams.next();
          }
          if(fnparams.name() == JsNode.FNPARAMS) {
            var params = [];
            fnparams.leaves().forEach(function(leaf, i) {
              if(i % 2 == 0) {
                var name = leaf.token().content();
                params.push(name);
              }
            });
            if(params.join(',') != 'require,exports,module') {
              isAMD = true;
            }
          }
          //factory无参数是AMD
          else {
            isAMD = true;
          }
        }
        if(!isAMD) {
          isCMD = true;
        }
      }
    }
  }
  context.getChildren().forEach(function(child) {
    analyse(child);
  });
}

exports.analyse = function(code) {
  isCommonJS = false;
  isAMD = false;
  isCMD = false;

  var context = homunculus.getContext('js');
  context.parse(code);
  //分析上下文
  analyse(context);

  return {
    'isCommonJS': isCommonJS,
    'isAMD': isAMD,
    'isCMD': isCMD,
    'context': context,
    'ast': context.parser.ast()
  };
};

exports.isCommonJS = function(code) {
  if(code) {
    exports.analyse(code);
  }
  return isCommonJS;
};

exports.isAMD = function(code) {
  if(code) {
    exports.analyse(code);
  }
  return isAMD;
};

exports.isCMD = function(code) {
  if(code) {
    exports.analyse(code);
  }
  return isCMD;
};