import { useState, useEffect } from 'react'
import { Editor } from './components/Editor'
import { Sidebar } from './components/Sidebar'
import jsonIcon from './assets/jsonIcon.png'

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%'
  },
  title: {
    margin: 0,
    color: '#ffffff',
    fontSize: '1.5rem'
  },
  main: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
  },
  editorContainer: {
    flex: 1,
    position: 'relative' as const,
    height: '100%'
  },
  resultContainer: {
    flex: 1,
    position: 'relative' as const,
    height: '100%',
    borderLeft: '1px solid #3d3d3d'
  },
  editorWrapper: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  toolbar: {
    height: '40px',
    borderTop: '1px solid #E6E6E6',
    display: 'flex',
    alignItems: 'center',
    padding: '0',
    gap: '12px',
    backgroundColor: '#F6F7F8'
  },
  toolButton: {
    padding: '4px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    '&:hover': {
      backgroundColor: '#ECEDEE'
    }
  },
  buttonIcon: {
    width: '16px',
    height: '16px',
    objectFit: 'contain' as const
  },
  input: {
    flex: 1,
    border: 'none',
    borderRadius: '4px',
    padding: '0 8px',
    fontSize: '12px',
    outline: 'none',
    backgroundColor: '#ffffff',
    height: '100%',
    maxWidth: '400px'
  },
  thisBar: {
    color: '#666666',
    backgroundColor: '#F6F7F8',
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: '4px',
    borderBottomRightRadius: '4px',
    height: '100%',
    width: '35px',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '40px'
  }
}

function App(): JSX.Element {
  const [expression, setExpression] = useState('')
  const [editorContent, setEditorContent] = useState('')
  const [originalJson, setOriginalJson] = useState<any>(null)
  const [resultContent, setResultContent] = useState('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    console.log('Setting up IPC listener in main window')
    // 监听来自搜索窗口的JSON格式化请求
    window.electron.ipcRenderer.on('format-json-in-editor', (jsonText: string) => {
      console.log('Received format-json-in-editor event with data:', jsonText)
      try {
        // 解析JSON并格式化
        const formattedJson = JSON.stringify(JSON.parse(jsonText), null, 2)
        console.log('Formatted JSON:', formattedJson)
        // 更新编辑器内容
        setEditorContent(formattedJson)
        // 更新原始JSON数据
        setOriginalJson(JSON.parse(jsonText))
        console.log('Editor content updated')
      } catch (error) {
        console.error('Invalid JSON:', error)
      }
    })

    // 测试 IPC 是否正常工作
    console.log('Testing IPC connection...')
    window.electron.ipcRenderer.send('ping')
  }, [])

  const handleEditorChange = (content: string) => {
    setEditorContent(content)
    try {
      const jsonData = JSON.parse(content)
      setOriginalJson(jsonData)
    } catch (error) {
      // 如果解析失败，不更新 originalJson
      console.debug('JSON解析失败:', error)
    }
  }

  const handleExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newExpression = e.target.value
    setExpression(newExpression)
    if (!newExpression.trim()) {
      setResultContent('')
    }
  }

  const handleFormat = () => {
    try {
      // 尝试解析JSON
      const jsonData = JSON.parse(editorContent)
      // 保存原始JSON数据
      setOriginalJson(jsonData)
      // 格式化JSON
      const formatted = JSON.stringify(jsonData, null, 2)
      setEditorContent(formatted)
    } catch (error) {
      console.error('JSON格式化失败:', error)
    }
  }

  const handleExpressionExecute = () => {
    try {
      if (!expression.trim() || originalJson === null) {
        setResultContent('')
        return
      }

      let result

      // 如果是数组索引访问
      if (/^\[\d+\]$/.test(expression)) {
        const index = parseInt(expression.slice(1, -1))
        result = Array.isArray(originalJson) ? originalJson[index] : undefined
      } else if (expression.startsWith('.')) {
        // 处理简化的方法调用语法（如 .map()）
        const expressionWithThis = `this${expression}`
        result = new Function('return ' + expressionWithThis).call(originalJson)
      } else {
        // 处理完整表达式（如 data.filter()）
        result = new Function('data', 'return ' + expression)(originalJson)
      }

      if (result !== undefined) {
        setResultContent(JSON.stringify(result, null, 2))
      } else {
        setResultContent('')
      }
    } catch (error) {
      console.error('表达式执行失败:', error)
      setResultContent('')
    }
  }

  return (
    <div style={styles.container}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div style={styles.mainContent}>
        <main style={styles.main}>
          <div
            style={{
              ...styles.editorContainer,
              flex: resultContent ? '0 0 50%' : 1
            }}
          >
            <div style={styles.editorWrapper}>
              <Editor value={editorContent} onChange={handleEditorChange} />
            </div>
          </div>
          {resultContent && (
            <div style={styles.resultContainer}>
              <div style={styles.editorWrapper}>
                <Editor value={resultContent} onChange={() => {}} />
              </div>
            </div>
          )}
        </main>
        <div style={styles.toolbar}>
          <div style={styles.thisBar}>
            <span>this</span>
          </div>
          <input
            style={styles.input}
            placeholder="输入js表达式(如 .map(i => i.name))或过滤(如 .filter(x => x > 1))"
            value={expression}
            onChange={handleExpressionChange}
            onKeyDown={(e) => e.key === 'Enter' && handleExpressionExecute()}
          />
          <button style={styles.toolButton} onClick={handleFormat}>
            <img src={jsonIcon} style={styles.buttonIcon} alt="格式化" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
