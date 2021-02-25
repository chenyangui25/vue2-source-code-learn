export function patch(oldVnode, vnode) {
  // 组件没有oldVnode 如组件
  if (!oldVnode) {
    return createElm(vnode)
  }

  if (oldVnode.nodeType == 1) {
    const parentElm = oldVnode.parentNode
    let elm = createElm(vnode)

    parentElm.insertBefore(elm, oldVnode.nextSibling)
    parentElm.removeChild(oldVnode)

    return elm
  } else {
    // 如果标签名称不一样 直接删掉老的 换成新的
    if (oldVnode.tag !== vnode.tag) {
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
    }

    let el = vnode.el = oldVnode.el

    // 如果是文本不一样 替换老文本
    if (vnode.tag == undefined) {
      if (oldVnode.text !== vnode.text) {
        el.textContent = vnode.text
      }
      return
    }

    // 如果标签一样 比较属性
    patchProps(vnode, oldVnode.data)

    // 如果有儿子 比较
    let oldChildren = oldVnode.children || [];
    let newChildren = vnode.children || [];

    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 双方都有儿子
      // vue用了双指针的方式 来比对
      patchChildren(el, oldChildren, newChildren)

    } else if (newChildren.length > 0) {
      // 老的没儿子 但是新的有儿子
      for (let i = 0; i < newChildren.length; i++) {
        let child = createElm(newChildren[i])
        el.appendChild(child)
      }

    } else if (oldChildren.length > 0) {
      // 老的有儿子 新的没儿子 直接删除老节点
      el.innerHTML = ``
    }

    return el
  }

}

/** vnode diff 比较方法 */
/**
 * @description 判断标签是否一致
 */
function isSameVnode(oldVnode, newVnode) {
  return (oldVnode.tag == newVnode.tag) && (oldVnode.key == newVnode.key);
}

/**
 * @description 双方都有儿子 比较children
 */
function patchChildren(el, oldChildren, newChildren) {
  // 双指针定义
  let oldStartIndex = 0
  let oldStartVnode = oldChildren[0]
  let oldEndIndex = oldChildren.length - 1
  let oldEndVnode = oldChildren[oldEndIndex]
  let newStartIndex = 0
  let newStartVnode = newChildren[0]
  let newEndIndex = newChildren.length - 1
  let newEndVnode = newChildren[newEndIndex]

  const makeIndexByKey = (children)=>{
      return children.reduce((memo,current,index)=>{
          if(current.key){
              memo[current.key] = index;
          }
          return memo;
      },{})
  }
  const keysMap = makeIndexByKey(oldChildren)

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      if(!oldStartVnode){ // 已经被移动走了
          oldStartVnode = oldChildren[++oldStartIndex];
      }else if(!oldEndVnode){
          oldEndVnode = oldChildren[--oldEndIndex];
      }

      if (isSameVnode(oldStartVnode, newStartVnode)) {
          // 头头比较 发现标签一致
          patch(oldStartVnode, newStartVnode)
          oldStartVnode = oldChildren[++oldStartIndex]
          newStartVnode = newChildren[++newStartIndex]

      }else if (isSameVnode(oldEndVnode, newEndVnode)) {
          // 尾尾比较 发现标签一致
          patch(oldEndVnode,newEndVnode)
          oldEndVnode = oldChildren[--oldEndIndex]
          newEndVnode = newChildren[--newEndIndex]

      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
          // 头尾比较 reverse
          // 移动老的元素 老的元素就被移动走了 不用删除
          patch(oldStartVnode, newEndVnode)
          el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
          oldStartVnode = oldChildren[++oldStartIndex]
          newEndVnode = newChildren[--newEndIndex]
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
          // 尾头比较
          patch(oldEndVnode, newStartVnode)
          el.insertBefore(oldEndVnode.el, oldStartVnode.el)
          oldEndVnode = oldChildren[--oldEndIndex]
          newStartVnode = newChildren[++newStartIndex]
      } else {
          // 乱序比对   核心diff
          // 1.需要根据key和 对应的索引将老的内容生成程映射表
          let moveIndex = keysMap[newStartVnode.key]; // 用新的去老的中查找
          if(moveIndex == undefined){ // 如果不能复用直接创建新的插入到老的节点开头处
              el.insertBefore(createElm(newStartVnode),oldStartVnode.el);
          }else{
              let moveNode = oldChildren[moveIndex];
              oldChildren[moveIndex] = null; // 此节点已经被移动走了
              el.insertBefore(moveNode.el,oldStartVnode.el);
              patch(moveNode,newStartVnode); // 比较两个节点的属性
          }
          newStartVnode = newChildren[++newStartIndex]
      }
  }

  // 没有比对完的 新的新增 老的删除
  if (newStartIndex <= newEndIndex) {
      for (let i = newStartIndex; i <= newEndIndex; i++) {
          //  看一下为指针的下一个元素是否存在
          let anchor = newChildren[newEndIndex + 1] == null ? null :newChildren[newEndIndex + 1].el
          el.insertBefore(createElm(newChildren[i]), anchor)
      }
  }
  if(oldStartIndex <= oldEndIndex){
      for (let i = oldStartIndex; i <= oldEndIndex; i++) {
          if(oldChildren[i] !== null) el.removeChild(oldChildren[i].el)
      }
  }

}

/**
 * @description 标签属性的比较与生成
 * @description 初次渲染时可以调用此方法，后续更新也可以调用此方法
 */
function patchProps(vnode, oldProps = {}) {
  let newProps = vnode.data || {}
  let el = vnode.el

  let newStyle = newProps.style || {}
  let oldStyle = oldProps.style || {}

  // 老的vnode.data有 而新的没有 dom上进行删除样式 和 移除属性
  for (let key in oldStyle) {
      if (!newStyle[key]) {
          el.style[key] = ''
      }
  }
  for (let key in oldProps) {
      if (!newProps[key]) {
          el.removeAttribute(key)
      }
  }

  // 第一次渲染 直接将新的生产到元素上
  // 比对完之后 直接用新的生成到元素上 覆盖之前的老的
  for (let key in newProps) {
      if (key === 'style') {
          for (let styleName in newProps.style) {
              el.style[styleName] = newProps.style[styleName]
          }
      } else {
          el && el.setAttribute(key, newProps[key])
      }
  }
}

/** 核心方法 */
/**
 * @description 创建组件的真实节点
 */
function createComponent(vnode) {
  let i = vnode.data
  if ((i = i.hook) && (i = i.init)) {
      i(vnode)
  }

  if (vnode.componentInstance) {
      return true
  }
}

/**
 * @description 创建真实的节点元素 并赋值与vnode上el
 */
export function createElm(vnode) {
  let { tag, data, children, text, vm } = vnode
  if (typeof tag === 'string') {

      // 是不是组件
      if (createComponent(vnode)) {
        console.log("🚀 ~ file: patch.js ~ line 217 ~ createElm ~ vnode.componentInstance", vnode.componentInstance)
          return vnode.componentInstance.$el
      }

      vnode.el = document.createElement(tag)
      // 元素属性
      patchProps(vnode)
      children.forEach(child => {
          vnode.el.appendChild(createElm(child))
      })
  } else {
      vnode.el = document.createTextNode(text)
  }
  return vnode.el
}