import { useState } from 'react'
import { Editor } from './components/Editor'

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#1e1e1e'
  },
  title: {
    margin: 0,
    color: '#ffffff',
    fontSize: '1.5rem'
  },
  main: {
    flex: 1,
    overflow: 'hidden'
  },
  toolbar: {
    height: '40px',
    backgroundColor: '#2d2d2d',
    borderTop: '1px solid #3d3d3d',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: '12px'
  },
  toolButton: {
    padding: '4px 8px',
    backgroundColor: '#3d3d3d',
    border: 'none',
    borderRadius: '4px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '12px',
    '&:hover': {
      backgroundColor: '#4d4d4d'
    }
  },
  input: {
    flex: 1,
    backgroundColor: '#3d3d3d',
    border: 'none',
    borderRadius: '4px',
    color: '#ffffff',
    padding: '4px 8px',
    fontSize: '12px',
    outline: 'none'
  }
}

function App(): JSX.Element {
  const [expression, setExpression] = useState('')
  const [editorContent, setEditorContent] = useState('')

  const handleFormat = () => {
    try {
      // 尝试解析JSON
      const jsonData = JSON.parse(editorContent)
      // 格式化JSON
      const formatted = JSON.stringify(jsonData, null, 2)
      setEditorContent(formatted)
    } catch (error) {
      console.error('JSON格式化失败:', error)
    }
  }

  const handleExpressionExecute = () => {
    try {
      if (!expression.trim()) return

      const jsonData = JSON.parse(editorContent)
      let result

      // 如果json是数组格式
      if (jsonData.startsWith('[')) {
      }

      if (expression.startsWith('.')) {
        // 处理简化的方法调用语法
        const expressionWithThis = `this${expression}`
        const fn = new Function('this', `return ${expressionWithThis}`)
        result = fn.call(jsonData)
      } else {
        // 保持原有的完整表达式执行方式
        const fn = new Function('data', `return ${expression}`)
        result = fn(jsonData)
      }

      // 将结果转换回JSON字符串
      setEditorContent(JSON.stringify(result, null, 2))
    } catch (error) {
      console.error('表达式执行失败:', error)
    }
  }

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <Editor value={editorContent} onChange={setEditorContent} />
      </main>
      <div style={styles.toolbar}>
        <button style={styles.toolButton} onClick={handleFormat}>
          格式化
        </button>
        <input
          style={styles.input}
          placeholder="输入js表达式(如 .map(i => i.name))或过滤(如 .filter(x => x > 1))"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleExpressionExecute()}
        />
      </div>
    </div>
  )
}

export default App
