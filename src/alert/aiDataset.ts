
import { defineDataSet } from "ai-dataset";

const typesMap = {
  '默认': 'info',
  '成功': 'success',
  '错误': 'error',
  '警告': 'warning'
}
export default defineDataSet((utils) => {
  const result = {}
  const message = utils.lorem.word({ length: { min: 0, max: 10 } });
  result['标题'] = [{
    "Q": `将标题设置为“${message}”`,
    "A": {
      "data": {
        "message": message,
      }
    }
  }]

  result['类型'] = []
  for (let key in typesMap) {
    result['类型'].push({
      "Q": `将类型设置为${key}`,
      "A": {
        "data": {
          "type": typesMap[key],
        }
      }
    })
  }

  result['关闭按钮'] = [true, false].map(item => ({
    "Q": `将关闭按钮设置为${item ? '开启' : '关闭'}`,
    "A": {
      "data": {
        "closable": item
      }
    }
  }))
  result['顶部公告'] = [true, false].map(item => ({
    "Q": `将顶部公告设置为${item ? '开启' : '关闭'}`,
    "A": {
      "data": {
        "banner": item
      }
    }
  }))
  result['辅助图标'] = [true, false].map(item => ({
    "Q": `将辅助图标设置为${item ? '开启' : '关闭'}`,
    "A": {
      "data": {
        "showIcon": item
      }
    }
  }))
  result['辅助介绍'] = [true, false].map(item => ({
    "Q": `将辅助介绍设置为${item ? '开启' : '关闭'}`,
    "A": {
      "data": {
        "showInfo": item
      }
    }
  }))
  const content = utils.lorem.word({ length: { min: 0, max: 10 } });
  result['辅助介绍文案'] = [{
    "Q": `将警告提示的辅助介绍文案设置为“${content}”`,
    "A": {
      "data": {
        "content": `${content}`,
      }
    }
  }]
  result['图标自定义'] = [true, false].map(item => ({
    "Q": `将警告提示的图标自定义设置为${item ? '开启' : '关闭'}`,
    "A": {
      "data": {
        "isChoose": item
      }
    }
  }))
  /**   临时注释icon */
  // const icon = utils.string.alpha(10)
  // result['选择图标'] = {
  //   "Q": `将警告提示的图标设置为${icon}`,
  //   "A": {
  //     "icon": `${icon}`,
  //     "isChoose": true,
  //     "showIcon": true
  //   }
  // }

  result['固定宽度'] = [true, false].map(item => ({
    "Q": `将警告提示的固定宽度设置为${item ? '开启' : '关闭'}`,
    "A": {
      "data": {
        "openWidth": item,
      }
    }
  }))

  const width = utils.number.int({ min: 10 })
  result['固定宽度'].push({
    "Q": `将警告提示的固定宽度设置为${width}`,
    "A": {
      data: {
        "openWidth": true,
        "width": width,
      }
    }
  })

  const percentWidth = utils.number.int({ min: 10, max: 100 })
  result['百分比宽度'] = [{
    "Q": `将警告提示的百分比宽度设置为${percentWidth}`,
    "A": {
      "data": {
        "openWidth": false,
        "percentWidth": percentWidth
      }
    }
  }]
  return result
})
