import MonacoEditor from 'react-monaco-editor'
import { useRef } from 'react'
import * as monaco from 'monaco-editor'

interface EditorProps {}

export const Editor: React.FC<EditorProps> = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const editorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const options: monaco.editor.IStandaloneEditorConstructionOptions = {
    selectOnLineNumbers: false,
    roundedSelection: false,
    readOnly: false,
    minimap: { enabled: false },
    fontSize: 14,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on',
    tabSize: 2,
    formatOnPaste: true,
    formatOnType: true,
    renderWhitespace: 'none',
    lineNumbers: 'off',
    glyphMargin: false,
    folding: false,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8
    }
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MonacoEditor
        width="100%"
        height="100%"
        language="json"
        theme="vs"
        defaultValue="// 输入json"
        // value={value}
        options={options}
        // onChange={onChange}
        editorDidMount={editorDidMount}
      />
    </div>
  )
}
