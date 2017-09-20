/*!
 * Cascade v1.0.0
 * Created by linsywu on 2017/9/19.
 * Copyright (c) 2014-2016 linsywu
 */
;(function ($, window, document, areaData, undefined) {

  'use strict';

  if (typeof areaData === 'undefined') {
    throw new Error('The data source must exist  and it is must be a JSON structure');
  }
  var NAMESPACE = 'cascade';
  var EVENT_CHANGE = 'change.' + NAMESPACE;
  var LEVEL_FIRST = 'level_first';
  var LEVEL_SECOND = 'level_second';
  var LEVEL_THIRD = 'level_third';

  var Cascade = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Cascade.DEFAULTS, $.isPlainObject(options) && options);
    this.placeholders = $.extend({}, Cascade.DEFAULTS);
    this.init();
  };

  // 往原型链上添加方法
  Cascade.prototype = {
    constructor: Cascade,

    // 初始化数据
    init: function () {
      var options = this.options;
      var $select = this.$element.find('select');
      var length = $select.length;
      this.active = false;
      var data = {};

      $select.each(function () {
        $.extend(data, $(this).data());
      });

      var level = [LEVEL_FIRST, LEVEL_SECOND, LEVEL_THIRD];
      $.each(level, $.proxy(function (i, type) {
        if (data[type]) {
          options[type] = data[type];
          this['$' + type] = $select.filter('[data-' + type + ']');
        } else {
          this['$' + type] = length > i ? $select.eq(i) : null;
        }
      }, this));
      console.info('this内容：', this);

      this.bind();
      this.reset();
      this.active = true;
    },

    // 绑定事件
    bind: function () {
      var levelF  = this.$level_first;
      var levelS  = this.$level_second;
      if (levelF) {
        levelF.on(EVENT_CHANGE, (this._changeLevelFirst = $.proxy(function () {
          this.output(LEVEL_SECOND);
          this.output(LEVEL_THIRD);
        }, this)));
      }

      if (levelS) {
        levelS.on(EVENT_CHANGE, (this._changeLevelSecond = $.proxy(function () {
          this.output(LEVEL_THIRD);
        }, this)));
      }
    },
    unbind: function () {
      var levelF  = this.$level_first;
      var levelS  = this.$level_second;
      if (levelF) {
        levelF.off(EVENT_CHANGE, this._changeLevelFirst);
      }

      if (levelS) {
        levelS.off(EVENT_CHANGE, this._changeLevelSecond);
      }
    },
    // 输出显示
    output: function (type) {
      var options = this.options;
      var placeholders = this.placeholders;
      var $select = this['$' + type];
      var data = {};
      var value;
      var name;
      var matched;

      if (!$select || !$select.length) {
        return;
      }
      name = (
          type === LEVEL_FIRST ? '' :
          type === LEVEL_SECOND ? this.$level_first && this.$level_first.find(':selected').html():
          type === LEVEL_THIRD ? this.$level_second && this.$level_second.find(':selected').html() : name
      );
      if (type === LEVEL_FIRST) {
        // 第一级别
        data = this.options.resource;
      } else {
        // 第二级别和第三级别
        data = this.getChild(name);
      }
      // 如果存在初始值，给初始值添加selected
      value = options[type];
      $.each(data, function (i, item) {
        var selected = item.label === value;
        item['selected'] = selected;
        if (selected) {
          matched = true;
        }
      });

      if (!matched) {
        if (data.length && (options.autoSelect || options.autoselect)) {
          data[0].selected = true;
        }

        // Save the unmatched value as a placeholder at the first output
        if (!this.active && value) {
          placeholders[type] = value;
        }
      }

      data.unshift({
        id: '',
        label: placeholders[type],
        selected: false
      });
      // 将内容插入select
      $select.html(this.getList(data));
    },
    // 获取列表dom
    getList: function (data) {
      var list = [];

      $.each(data, function (i, n) {
        list.push(
            '<option' +
            ' value="' + (n.id && n.id ? n.label : '') + '"' +
            ' data-code="' + (n.id || '') + '"' +
            (n.selected ? ' selected' : '') +
            '>' +
            (n.label || '') +
            '</option>'
        );
      });
      return list.join('');
    },
    //重置
    reset: function (deep) {
      if (!deep) {
        this.output(LEVEL_FIRST);
        this.output(LEVEL_SECOND);
        this.output(LEVEL_THIRD);
      } else if (this.$level_first) {
        this.$level_first.find(':first').prop('selected', true).trigger(EVENT_CHANGE);
      }
    },

    // 获取子节点
    getChild: function (name) {
      var arr = this.options.resource;
      var temp = '';
      for (var i = 0; i<arr.length; i++) {
        var item = arr[i];
        if (item.label === name) {
          temp = item.children;
          break;
        }
        if (item.children) {
          (function () {
            var list = arguments[0], text = arguments[1];
            for (var j = 0; j<list.length; j++) {
              var item = list[j];
              if (item.label === text) {
                temp = item.children;
                break;
              }
            }
          })(item.children, name)
        }
      }
      return temp;
    }

  };

  // 默认参数
  Cascade.DEFAULTS = {
    resource: areaData,
    autoSelect: true,
    placeholder: true,
    level_first: '—— 请选择 ——',
    level_second: '—— 请选择 ——',
    level_third: '—— 请选择 ——'
  };
  // 设置全局参数方法
  Cascade.setDefaults = function (options) {
    $.extend(Cascade.DEFAULTS, options);
  };

  // 暴露初始化方法
  $.fn.cascade = function (option) {
    var args = Array.prototype.slice.call(arguments, 1);
    // 此处的this指代调用cascade的jquery对象
    return this.each(function () {
      // 此处的this指代遍历的每一个dom对象
      var $this = $(this);
      var data = $this.data(NAMESPACE);
      var options;
      var fn;

      if (!data) {
        if (/destroy/.test(option)) {
          return;
        }

        options = $.extend({}, $(this).data(), $.isPlainObject(option) && option);
        data = new Cascade(this, options);
        $this.data(NAMESPACE, data);
      }

      if (typeof option === 'string' && $.isFunction(fn = data[option])) {
        fn.apply(data, args);
      }
    });
  };
  // 暴露全局参数设置方法
  $.fn.cascade.setDefaults = Cascade.setDefaults;
})(jQuery, window, document, areaData);
