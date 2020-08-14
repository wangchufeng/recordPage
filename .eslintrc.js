module.exports = {
    'env': {
        'browser': true,
        'commonjs': true,
        'es2020': true,
        'node': true
    },
    'parserOptions': {
        'ecmaVersion': 11
    },
    'rules': {
        'semi': [2, 'always'], //语句强制分号结尾
        'space-after-keywords': [0, 'always'], //关键字后面是否要空一格
        'space-before-function-paren': 0,
        'space-infix-ops': [2, {
            'int32Hint': true
        }], //操作符周围的空格
        'keyword-spacing': 2, //关键字前后的空格
        'no-extra-semi': 2,
        'space-unary-ops': [2, {
            'words': true,
            'nonwords': false
        }], //一元运算符前后不要加空格
        'key-spacing': [2, { // 对象字面量中冒号的前后空格
            'beforeColon': false,
            'afterColon': true
        }],
        'semi-spacing': [2, {
            'before': false,
            'after': true
        }],
        'quotes': [1, 'single', 'avoid-escape'],
        'no-redeclare': 2, //不允许变量重复声明
        'no-fallthrough': 2, //不允许switch按顺序全部执行所有case
        'curly': ['error', 'all'], //强制使用花括号的风格        
        'comma-dangle': ['error', 'never'], //是否允许对象中出现结尾逗号
        'no-cond-assign': 2,
        'no-dupe-keys': 2, //对象中不允许出现重复的键        
        'no-regex-spaces': 2,
        'no-div-regex': 2,
        'no-undef': 2,
        'no-undef-init': 2, //不允许初始化变量时给变量赋值undefined
        'no-undefined': 2, //不允许把undefined当做标识符使用
        'brace-style': [2, '1tbs', {
            'allowSingleLine': false
        }], //大括号风格
        'camelcase': [2, {
            'properties': 'never'
        }], //强制驼峰命名规则
        'comma-style': [2, 'last'], //逗号风格
        'space-before-blocks': [2, 'always'], //块前的空格
        'no-irregular-whitespace': 2,  //不能有不规则的空格
        'no-multiple-empty-lines': [1, {'max': 3}],  //空行最多不能超过2行
        'arrow-parens': 0,  //箭头函数用小括号括起来
        'arrow-spacing': 0,  //=>的前/后括号
        'object-shorthand': 0//强制对象字面量缩写语法
    }
};