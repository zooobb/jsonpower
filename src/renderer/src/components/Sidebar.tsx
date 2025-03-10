import React from 'react'

interface SidebarProps {
  className?: string
  isCollapsed: boolean
  onToggle: () => void
}

const styles = {
  container: {
    position: 'relative' as const,
    height: '100%',
    display: 'flex'
  },
  sidebar: {
    width: '240px',
    height: '100%',
    backgroundColor: '#1e1e1e',
    borderRight: '1px solid #3d3d3d',
    display: 'flex',
    flexDirection: 'column' as const,
    color: '#ffffff',
    transition: 'all 0.3s ease'
  },
  collapsedSidebar: {
    width: '0px',
    overflow: 'hidden',
    borderRight: 'none'
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid #3d3d3d'
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    margin: 0
  },
  content: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto' as const
  },
  toggleButton: {
    position: 'absolute' as const,
    right: '-12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '24px',
    height: '24px',
    backgroundColor: '#1e1e1e',
    border: '1px solid #3d3d3d',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#ffffff',
    zIndex: 10,
    transition: 'transform 0.3s ease',
    '&:hover': {
      backgroundColor: '#2d2d2d'
    }
  }
}

export const Sidebar: React.FC<SidebarProps> = ({ className, isCollapsed, onToggle }) => {
  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.sidebar,
          ...(isCollapsed ? styles.collapsedSidebar : {}),
          ...(className ? { className } : {})
        }}
      >
        <div style={styles.header}>
          <h2 style={styles.title}>JSON Power</h2>
        </div>
        <div style={styles.content}>{/* 这里可以添加侧边栏的内容 */}</div>
      </div>
      <div
        style={styles.toggleButton}
        onClick={onToggle}
        title={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
      >
        <span
          style={{
            transform: `rotate(${isCollapsed ? 0 : 180}deg)`,
            display: 'inline-block',
            transition: 'transform 0.3s ease'
          }}
        >
          ›
        </span>
      </div>
    </div>
  )
}
