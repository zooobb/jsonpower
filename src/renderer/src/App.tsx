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
  }
}

function App(): JSX.Element {
  // const [code, setCode] = useState<string>('{\n  "hello": "world"\n}')

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <Editor />
      </main>
    </div>
  )
}

export default App
