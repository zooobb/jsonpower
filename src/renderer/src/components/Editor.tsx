import MonacoEditor from 'react-monaco-editor'
import { useRef, useEffect } from 'react'
import * as monaco from 'monaco-editor'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const isFormatting = useRef(false)

  useEffect(() => {
    if (editorRef.current) {
      console.log('Editor value changed:', value)
      const currentValue = editorRef.current.getValue()
      if (value !== currentValue) {
        console.log('Updating editor value')
        isFormatting.current = true
        editorRef.current.setValue(value)
        isFormatting.current = false
      }
    }
  }, [value])

  const formatDocument = async (editor: monaco.editor.IStandaloneCodeEditor) => {
    const model = editor.getModel()
    if (!model || isFormatting.current) return

    const content = model.getValue().trim()
    if (!content) return

    try {
      isFormatting.current = true
      // 手动调用格式化
      const text = JSON.stringify(JSON.parse(content), null, 2)
      if (text !== content) {
        onChange(text)
      }
    } catch (e) {
      console.error('Format error:', e)
    } finally {
      isFormatting.current = false
    }
  }

  const editorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    console.log('Editor mounted')
    editorRef.current = editor

    // 配置严格的 JSON 语言特性
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      trailingCommas: 'error',
      comments: 'error',
      schemaValidation: 'warning'
    })

    // 监听粘贴事件
    editor.onDidPaste(() => {
      formatDocument(editor)
    })

    // 配置编辑器以检查 JSON 语法错误
    editor.onDidChangeModelContent(() => {
      if (isFormatting.current) return

      const model = editor.getModel()
      if (model) {
        const content = model.getValue().trim()
        console.log('Content changed:', content)
        // 如果内容为空，清除所有错误标记
        if (!content) {
          monaco.editor.setModelMarkers(model, 'json', [])
          onChange(content)
          return
        }
        try {
          JSON.parse(content)
          // 如果解析成功，清除所有错误标记
          monaco.editor.setModelMarkers(model, 'json', [])
          onChange(content)
        } catch (e) {
          // 如果解析失败，在编辑器中显示错误
          monaco.editor.setModelMarkers(model, 'json', [
            {
              message: '无效的 JSON 格式: ' + (e as Error).message,
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: model.getLineCount(),
              endColumn: model.getLineMaxColumn(model.getLineCount())
            }
          ])
        }
      }
    })

    // 初始化时设置默认值
    console.log('Initial editor value:', value)
    if (!value) {
      editor.setValue('{\n}')
    } else {
      editor.setValue(value)
    }
  }

  const options: monaco.editor.IStandaloneEditorConstructionOptions = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    minimap: { enabled: false },
    fontSize: 14,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on',
    tabSize: 2,
    formatOnPaste: true,
    formatOnType: false,
    renderWhitespace: 'none',
    lineNumbers: 'on',
    glyphMargin: false,
    folding: true,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8
    },
    contextmenu: false,
    placeholder: '// 输入json进行格式化'
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MonacoEditor
        width="100%"
        height="100%"
        language="json"
        options={options}
        value={value}
        onChange={onChange}
        editorDidMount={editorDidMount}
      />
    </div>
  )
}
