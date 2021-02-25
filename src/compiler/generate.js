// 匹配 {{aaaa}}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

/**
 * @description 编译属性 [{name:'xxx',value:'xxx'},{name:'xxx',value:'xxx'}]
 * @description 期望 { xxx: 'xxx' }
 * @description style的值要变成对象
 */
function genProps(attrs) {
  let str = '';
  for (let i = 0; i < attrs.length; i++) {
      let attr = attrs[i];
      if (attr.name === 'style') {
          let styleObj = {};
          attr.value.replace(/([^;:]+)\:([^;:]+)/g, function() {
              styleObj[arguments[1]] = arguments[2]
          })
          attr.value = styleObj
      }
      str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0,-1)}}`
}

/**
 * @description 递归生成 与 检索文本
 */
function gen(el) {
  if (el.type == 1) {
      return generate(el);
  } else {
      let text = el.text;
      if (!defaultTagRE.test(text)) {
          return `_v('${text}')`;
      } else {
          let tokens = [];
          let match;
          // 正则的g与exec发生冲突 将其置0 不然之检索一次
          let lastIndex = defaultTagRE.lastIndex = 0;
          while (match = defaultTagRE.exec(text)) {
              let index = match.index
              if (index > lastIndex) {
                  tokens.push(JSON.stringify(text.slice(lastIndex, index)))
              }
              tokens.push(`_s(${match[1].trim()})`)
              lastIndex = index + match[0].length
          }

          if (lastIndex < text.length) {
              tokens.push(JSON.stringify(text.slice(lastIndex)))
          }

          return `_v(${tokens.join('+')})`
      }
  }
}

function genChildren(el) {
  let children = el.children
  if (children) {
      return children.map(c => gen(c)).join(',')
  }
  return false
}

/**
 * @description 将ast树结构 转换成 render函数字符串
 * @description _c('div',{id:'app',a:1},_c('span',{},'world'),_v())
 */
export function generate(el) {
  let children = genChildren(el)
  let code = `_c('${el.tag}',${ el.attrs.length? genProps(el.attrs): 'undefined'}${children? `,${children}`:''})`
  return code
}
