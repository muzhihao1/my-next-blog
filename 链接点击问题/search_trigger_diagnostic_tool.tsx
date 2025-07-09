// components/debug/SearchTriggerAnalyzer.tsx
'use client';

import { useEffect, useState } from 'react';

interface ListenerInfo {
  target: string;
  type: string;
  listenerCount: number;
  functions: string[];
}

interface ListenerDiff {
  type: 'added' | 'removed' | 'modified';
  target: string;
  details: string;
}

export default function SearchTriggerAnalyzer() {
  const [initialState, setInitialState] = useState<ListenerInfo[]>([]);
  const [currentState, setCurrentState] = useState<ListenerInfo[]>([]);
  const [searchInputDetected, setSearchInputDetected] = useState(false);
  const [linkStatus, setLinkStatus] = useState<'unknown' | 'working' | 'broken'>('unknown');

  const captureGlobalListeners = (): ListenerInfo[] => {
    const targets = [
      { name: 'window', element: window },
      { name: 'document', element: document },
      { name: 'body', element: document.body }
    ];

    const listeners: ListenerInfo[] = [];

    targets.forEach(({ name, element }) => {
      try {
        const elementListeners = (window as any).getEventListeners?.(element);
        if (elementListeners) {
          Object.keys(elementListeners).forEach(eventType => {
            const eventListeners = elementListeners[eventType];
            if (eventListeners && eventListeners.length > 0) {
              listeners.push({
                target: name,
                type: eventType,
                listenerCount: eventListeners.length,
                functions: eventListeners.map((l: any) => l.listener.toString().substring(0, 100))
              });
            }
          });
        }
      } catch (error) {
        console.warn(`无法获取 ${name} 的监听器:`, error);
      }
    });

    return listeners;
  };

  const compareListeners = (before: ListenerInfo[], after: ListenerInfo[]): ListenerDiff[] => {
    const diffs: ListenerDiff[] = [];

    // 检查新增的监听器
    after.forEach(afterListener => {
      const beforeListener = before.find(b => 
        b.target === afterListener.target && b.type === afterListener.type
      );
      
      if (!beforeListener) {
        diffs.push({
          type: 'added',
          target: afterListener.target,
          details: `新增 ${afterListener.type} 监听器 (${afterListener.listenerCount}个)`
        });
      } else if (beforeListener.listenerCount !== afterListener.listenerCount) {
        diffs.push({
          type: 'modified',
          target: afterListener.target,
          details: `${afterListener.type} 监听器数量变化: ${beforeListener.listenerCount} -> ${afterListener.listenerCount}`
        });
      }
    });

    // 检查移除的监听器
    before.forEach(beforeListener => {
      const afterListener = after.find(a => 
        a.target === beforeListener.target && a.type === beforeListener.type
      );
      
      if (!afterListener) {
        diffs.push({
          type: 'removed',
          target: beforeListener.target,
          details: `移除 ${beforeListener.type} 监听器 (${beforeListener.listenerCount}个)`
        });
      }
    });

    return diffs;
  };

  const testLinkFunctionality = (): boolean => {
    const testLinks = document.querySelectorAll('a[href^="/"]');
    if (testLinks.length === 0) return false;

    let workingLinks = 0;

    testLinks.forEach(link => {
      const mockEvent = new MouseEvent('click', { 
        bubbles: true, 
        cancelable: true 
      });

      const originalHref = (link as HTMLAnchorElement).href;
      (link as HTMLAnchorElement).href = 'javascript:void(0)';

      link.dispatchEvent(mockEvent);

      if (!mockEvent.defaultPrevented) {
        workingLinks++;
      }

      (link as HTMLAnchorElement).href = originalHref;
    });

    return workingLinks / testLinks.length > 0.8;
  };

  const analyzeSearchComponents = () => {
    const searchElements = [
      ...document.querySelectorAll('input[type="search"]'),
      ...document.querySelectorAll('input[placeholder*="搜索"]'),
      ...document.querySelectorAll('input[placeholder*="search"]'),
      ...document.querySelectorAll('[data-component*="search"]'),
      ...document.querySelectorAll('[class*="search"]')
    ];

    console.log('🔍 发现的搜索元素:', searchElements.length);
    searchElements.forEach((el, index) => {
      console.log(`搜索元素 ${index}:`, {
        tagName: el.tagName,
        className: el.className,
        placeholder: (el as HTMLInputElement).placeholder,
        id: el.id
      });
    });

    return searchElements;
  };

  useEffect(() => {
    console.log('🎯 搜索触发分析器启动...');

    // 记录初始状态
    const initial = captureGlobalListeners();
    setInitialState(initial);
    console.log('📊 初始全局监听器状态:', initial);

    // 测试初始链接功能
    const initialLinkStatus = testLinkFunctionality();
    setLinkStatus(initialLinkStatus ? 'working' : 'broken');
    console.log('🔗 初始链接功能状态:', initialLinkStatus ? '正常' : '异常');

    // 分析搜索组件
    const searchElements = analyzeSearchComponents();

    // 监控所有可能的搜索输入
    const handleSearchInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      console.log('🔤 搜索输入检测:', {
        value: target.value,
        element: target.tagName,
        className: target.className,
        placeholder: target.placeholder
      });

      setSearchInputDetected(true);

      // 延迟检查变化
      setTimeout(() => {
        const afterInput = captureGlobalListeners();
        setCurrentState(afterInput);
        
        const diffs = compareListeners(initial, afterInput);
        if (diffs.length > 0) {
          console.log('🎯 搜索输入后监听器变化:', diffs);
          diffs.forEach(diff => {
            console.log(`  ${diff.type}: ${diff.target} - ${diff.details}`);
          });
        } else {
          console.log('📊 搜索输入后无监听器变化');
        }

        // 重新测试链接功能
        const newLinkStatus = testLinkFunctionality();
        setLinkStatus(newLinkStatus ? 'working' : 'broken');
        console.log('🔗 搜索后链接功能状态:', newLinkStatus ? '正常' : '异常');

        if (!initialLinkStatus && newLinkStatus) {
          console.log('🎉 搜索输入修复了链接功能！');
        }
      }, 100);
    };

    // 添加输入监听器到所有搜索元素
    searchElements.forEach(element => {
      element.addEventListener('input', handleSearchInput);
      element.addEventListener('focus', () => {
        console.log('🎯 搜索框获得焦点');
      });
      element.addEventListener('blur', () => {
        console.log('🎯 搜索框失去焦点');
      });
    });

    // 监控DOM变化，捕获动态添加的搜索元素
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.matches('input[type="search"], input[placeholder*="搜索"], input[placeholder*="search"]')) {
              console.log('🔍 检测到新的搜索元素:', element);
              element.addEventListener('input', handleSearchInput);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 监控React组件的渲染
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('search') || message.includes('Search')) {
        console.log('🔍 搜索相关日志:', ...args);
      }
      originalConsoleLog.apply(console, args);
    };

    return () => {
      // 清理监听器
      searchElements.forEach(element => {
        element.removeEventListener('input', handleSearchInput);
      });
      observer.disconnect();
      console.log = originalConsoleLog;
      console.log('🎯 搜索触发分析器已停止');
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid #ff6b6b',
      padding: '15px',
      borderRadius: '8px',
      zIndex: 10000,
      fontSize: '12px',
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#ff6b6b' }}>搜索触发分析器</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>链接状态:</strong>
        <span style={{ 
          color: linkStatus === 'working' ? '#51cf66' : linkStatus === 'broken' ? '#ff6b6b' : '#868e96',
          marginLeft: '5px'
        }}>
          {linkStatus === 'working' ? '✅ 正常' : linkStatus === 'broken' ? '❌ 异常' : '❓ 未知'}
        </span>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>搜索输入:</strong>
        <span style={{ 
          color: searchInputDetected ? '#51cf66' : '#868e96',
          marginLeft: '5px'
        }}>
          {searchInputDetected ? '✅ 已检测' : '⏳ 等待中'}
        </span>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>初始监听器:</strong> {initialState.length}个
      </div>

      {searchInputDetected && (
        <div style={{ marginBottom: '10px' }}>
          <strong>当前监听器:</strong> {currentState.length}个
          {currentState.length !== initialState.length && (
            <span style={{ color: '#ff6b6b', marginLeft: '5px' }}>
              (变化: {currentState.length - initialState.length > 0 ? '+' : ''}{currentState.length - initialState.length})
            </span>
          )}
        </div>
      )}

      <button
        onClick={() => {
          const current = captureGlobalListeners();
          setCurrentState(current);
          const status = testLinkFunctionality();
          setLinkStatus(status ? 'working' : 'broken');
          console.log('🔄 手动刷新状态');
        }}
        style={{
          background: '#339af0',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          fontSize: '11px'
        }}
      >
        刷新状态
      </button>
    </div>
  );
}

