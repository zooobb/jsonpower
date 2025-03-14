import React, { useEffect, useRef } from 'react'
import './Search.css'

const Search: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // 组件挂载时自动聚焦输入框
    inputRef.current?.focus()
    console.log('Component mounted')

    // 测试 IPC 是否正常工作
    window.electron.ipcRenderer.send('ping')
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('Key pressed:', event.key)
    if (event.key === 'Enter') {
      const jsonText = event.currentTarget.value.trim()
      console.log('Sending JSON text:', jsonText)
      // 发送JSON文本到主进程
      window.electron.ipcRenderer.send('format-json', jsonText)
      // 关闭当前窗口
      window.electron.ipcRenderer.send('close-search-window')
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input value changed:', event.target.value)
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('Key press event:', event.key)
  }

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('Key up event:', event.key)
  }

  return (
    <div className="search-container" onClick={() => console.log('Container clicked')}>
      <input
        ref={inputRef}
        className="search-input"
        type="text"
        placeholder="请输入JSON内容..."
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        onKeyUp={handleKeyUp}
        onClick={() => console.log('Input clicked')}
      />
    </div>
  )
}

export default Search
