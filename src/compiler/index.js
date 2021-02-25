import { parseHTML } from './parser'
import { generate } from './generate'

export function compileToFunction(template) {
  /** ast树结构 */
  let root = parseHTML(template)

  /** render字符串 */
  let code = generate(root)

  /** render函数 */
  let render = new Function(`with(this){return ${code}}`)

  return render
}