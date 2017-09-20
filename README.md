# Cascader
一个级联选择插件
## 介绍
这是一个三级级联选择插件，为自己项目需求所开发，可能对大家有所帮助；
## 数据结构
cascader可以自己自己传入数据源，但是最多只能三级；内部解析适用于json数组，请传入如下结构的数据：
```
var data = [{
  id: 0,
  label: '北京市',
  children: [{
    id: 01,
    label: '北京市'，
    children: [{
      id: 011,
      label: '东城区'
    }
    ...
    ]
  }
  ...
  ]
}
...
]
```
## 调用方法
html结构：
```
<div id=cascader>
  <select></select>
  <select></select>
  <select></select>
</div>
```
js调用：
```
$(function () {
  $('#cascader').cascader();
});
```

##插件参数
1、传入默认值：
```
$(function () {
  $('#cascader').cascader({
    resource: datas,     
    level_first: '浙江省',
    level_second: '杭州市',
    level_third: '西湖区' 
  });
});
```
resource: 传入的数据源，如果不传入默认显示area.js的数据;
level_first: 默认显示的第一级;
level_second: 默认显示第二级;
level_third: 默认显示第三级;
