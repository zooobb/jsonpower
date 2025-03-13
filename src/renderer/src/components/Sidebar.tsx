import React from 'react'
import { useState } from 'react'

interface SidebarProps {
  className?: string
  isCollapsed: boolean
  onToggle: () => void
}

interface RecentItem {
  id: string
  title: string
  timestamp: string
  preview: string
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
    backgroundColor: '#F6F7F8',
    borderRight: '1px solid #E6E6E6',
    display: 'flex',
    flexDirection: 'column' as const,
    color: '#666666',
    transition: 'all 0.3s ease'
  },
  collapsedSidebar: {
    width: '0px',
    overflow: 'hidden',
    borderRight: 'none',
    padding: 0,
    visibility: 'hidden' as const
  },
  header: {
    padding: '5px',
    borderBottom: '1px solid #E6E6E6'
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
  listContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  listItem: {
    padding: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: '1px solid #E6E6E6',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#ECEDEE',
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#333333',
    marginBottom: '4px'
  },
  itemPreview: {
    fontSize: '12px',
    color: '#666666',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const
  },
  itemTime: {
    fontSize: '11px',
    color: '#999999',
    marginTop: '4px'
  },
  emptyState: {
    textAlign: 'center' as const,
    color: '#999999',
    fontSize: '14px',
    padding: '20px 0'
  },
  toggleButton: {
    position: 'absolute' as const,
    right: '-12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '24px',
    height: '24px',
    backgroundColor: '#F6F7F8',
    border: '1px solid #E6E6E6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#666666',
    zIndex: 10,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#ECEDEE'
    }
  }
}

export const Sidebar: React.FC<SidebarProps> = ({ className, isCollapsed, onToggle }) => {
  // 这里使用模拟数据，实际使用时需要通过props传入或从存储中获取
  const [recentItems] = useState<RecentItem[]>([
    {
      id: '1',
      title: '用户配置',
      preview: '{ "name": "John", "age": 30 }',
      timestamp: '10分钟前'
    },
    {
      id: '2',
      title: '系统设置',
      preview: '{ "theme": "light", "language": "zh" }',
      timestamp: '30分钟前'
    }
  ])

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.sidebar,
          ...(isCollapsed ? styles.collapsedSidebar : {}),
          ...(className ? { className } : {})
        }}
      >
        {!isCollapsed && (
          <>
            {/* <div style={styles.header}>
              <h3 style={styles.title}>最近json</h3>
            </div> */}
            <div style={styles.content}>
              <div style={styles.listContainer}>
                {recentItems.length > 0 ? (
                  recentItems.map((item) => (
                    <div key={item.id} style={styles.listItem}>
                      <div style={styles.itemTitle}>{item.title}</div>
                      <div style={styles.itemPreview}>{item.preview}</div>
                      <div style={styles.itemTime}>{item.timestamp}</div>
                    </div>
                  ))
                ) : (
                  <div style={styles.emptyState}>暂无最近记录</div>
                )}
              </div>
            </div>
          </>
        )}
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
