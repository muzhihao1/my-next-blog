/** * Media Query Hook * 响应式设计辅助工具 */
import { useState, useEffect }
from 'react' export function useMediaQuery(query: string): boolean { const [matches, setMatches] = useState(false) useEffect(() => { const media = window.matchMedia(query) if (media.matches !== matches) { setMatches(media.matches) }
const listener = (e: MediaQueryListEvent) => setMatches(e.matches) // 现代浏览器使用 addEventListener if (media.addEventListener) { media.addEventListener('change', listener) }
else { // 旧版浏览器兼容 media.addListener(listener) }
return () => { if (media.removeEventListener) { media.removeEventListener('change', listener) }
else { media.removeListener(listener) }
} }, [query, matches]) return matches }