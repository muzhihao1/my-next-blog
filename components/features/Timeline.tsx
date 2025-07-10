/** * Timeline component for displaying career history */
interface TimelineItem { id: string date: string title: string company?: string description: string tags?: string[]
type: 'work' | 'education' | 'achievement' }
const timelineData: TimelineItem[] = [ { id: '1', date: '2022 - 至今', title: '技术负责人', company: '创新科技有限公司', description: '负责技术团队管理和架构设计，推动产品从0到1的开发。主导了微服务架构转型，提升系统性能50%。', tags: ['架构设计', '团队管理', '微服务'], type: 'work' }, { id: '2', date: '2020 - 2022', title: '高级前端工程师', company: '互联网巨头', description: '参与核心产品开发，负责前端架构优化和性能提升。建立了前端工程化体系，显著提高开发效率。', tags: ['React', 'Node.js', '性能优化'], type: 'work' }, { id: '3', date: '2021', title: '开源贡献者', description: '成为多个知名开源项目的核心贡献者，累计获得超过1000个stars。', tags: ['开源', 'GitHub', '社区'], type: 'achievement' }, { id: '4', date: '2018 - 2020', title: '全栈开发工程师', company: '初创公司', description: '作为初创团队核心成员，参与产品从构想到上线的全过程。独立负责多个核心模块的开发。', tags: ['全栈开发', 'Vue.js', 'Python'], type: 'work' }, { id: '5', date: '2014 - 2018', title: '计算机科学学士', company: '某知名大学', description: '系统学习计算机科学基础知识，获得优秀毕业生称号。期间参与多个实践项目，培养了扎实的编程能力。', tags: ['计算机科学', '算法', '数据结构'], type: 'education' }
]
const typeIcons = { work: '💼', education: '🎓', achievement: '🏆' }
const typeColors = { work: 'bg-blue-500', education: 'bg-green-500', achievement: 'bg-yellow-500' }
/** * Timeline component */
export default function Timeline() { return ( <div className="relative"> {/* Timeline line */}
<div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" /> {/* Timeline items */}
<div className="space-y-8"> {timelineData.map((item, index) => ( <div key={item.id}
className="relative flex gap-6"> {/* Icon */}
<div className="relative z-10 flex items-center justify-center">
<div className={`w-16 h-16 rounded-full ${typeColors[item.type]
}
bg-opacity-10 flex items-center justify-center`}>
<span className="text-2xl">{typeIcons[item.type]
}</span> </div> {/* Connector dot */}
<div className={`absolute w-4 h-4 rounded-full ${typeColors[item.type]
}
ring-4 ring-background`}
/> </div> {/* Content */}
<div className="flex-1 pb-8">
<div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
<div className="flex items-start justify-between mb-2">
<div>
<h3 className="text-xl font-semibold">{item.title}</h3> {item.company && ( <p className="text-muted-foreground">{item.company}</p> )} </div>
<span className="text-sm text-muted-foreground whitespace-nowrap ml-4"> {item.date} </span> </div>
<p className="text-muted-foreground mb-4"> {item.description} </p> {item.tags && item.tags.length > 0 && ( <div className="flex flex-wrap gap-2"> {item.tags.map((tag, tagIndex) => ( <span key={tagIndex}
className="text-xs px-2 py-1 bg-muted rounded-full" > {tag} </span> ))} </div> )} </div> </div> </div> ))} </div> {/* End marker */}
<div className="relative flex gap-6">
<div className="relative z-10 flex items-center justify-center">
<div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
<span className="text-2xl">🚀</span> </div>
<div className="absolute w-4 h-4 rounded-full bg-primary ring-4 ring-background" /> </div>
<div className="flex-1 pb-8">
<div className="pt-4">
<p className="text-lg font-semibold text-primary">继续前行...</p>
<p className="text-muted-foreground"> 永远保持学习的热情，探索技术的无限可能 </p> </div> </div> </div> </div> ) }