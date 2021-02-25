// 标签名
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
// 用来获取的标签名的 match后的索引为1
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
// 匹配开始标签
const startTagOpen = new RegExp(`^<${qnameCapture}`)
// 匹配闭合标签
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

// 匹配标签属性attribute 如 a=b a='b' a="b"
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// 匹配开始标签的关闭字符 如 > />
const startTagClose = /^\s*(\/?)>/

/**
 * @description 组装ast结构树
 */
function createAstElement(tagName, attrs) {
  return {
    tag: tagName,
    type: 1,
    children: [],
    parent: null,
    attrs
  }
}

export function parseHTML(html) {
  let root = null
  // 用于查找父元素
  let stack = []

  /**
   * @desc 开始标签时
   */
  function start(tagName, attributes) {
    let parent = stack[stack.length - 1]
    let element = createAstElement(tagName, attributes)

    if (!root) { root = element }

    if (parent) {
      element.parent = parent
      parent.children.push(element)
    }

    stack.push(element)
  }

  /**
   * @desc 文本时
   */
  function chars(text) {
    text = text.replace(/\s/g, '')
    let parent = stack[stack.length - 1]
    if (text) {
      parent.children.push({
        type: 3,
        text
      })
    }
  }

  /**
   * @desc 结束标签时
   */
  function end(tagName) {
    let last = stack.pop()
    if (last.tag !== tagName) { throw new Error('标签有误') }
  }

  /**
   * @desc 截取掉已经编译过的字符串
   */
  function advance(len) {
    html = html.substring(len)
  }
  
  /**
   * @desc 解析开始标签
   */
  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      }

      advance(start[0].length)

      let end;
      let attr;

      // 解析属性
      while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })
        advance(attr[0].length)
      }

      if (end) { advance(end[0].length) }

      return match
    }

    return false
  }

  /** 核心 开始解析html */
  while(html) {
    let textEnd = html.indexOf('<')

    if (textEnd == 0) {
      const startTagMatch = parseStartTag()
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue;
      }

      const endTagMatch = html.match(endTag)
      if (endTagMatch) {
        end(endTagMatch[1]);
        advance(endTagMatch[0].length)
        continue
      }
    }

    // 标签中间
    let text;
    if (textEnd > 0) {
      text = html.substring(0, textEnd)
    }
    if (text) {
      chars(text)
      advance(text.length)
    }

  }

  return root

}