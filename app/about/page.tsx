import SkillsSection from "@/components/features/SkillsSection";
import Timeline from "@/components/features/Timeline";
import ContactInfo from "@/components/features/ContactInfo";
import { SEO, generatePersonStructuredData } from "@/components/seo/SEO";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于我",
  description:
    "了解更多关于我的背景、技能和经历。全栈开发者，技术作家，终身学习者。",
  openGraph: {
    title: "关于我 - Zhihao Mu",
    description:
      "了解更多关于我的背景、技能和经历。全栈开发者，技术作家，终身学习者。",
    type: "profile",
  },
};

export default function About() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
  const personStructuredData = generatePersonStructuredData({
    name: "Zhihao Mu",
    url: `${baseUrl}/about`,
    image: `${baseUrl}/avatar.jpg`,
    jobTitle: "全栈开发者",
    description:
      "热爱技术，享受创造。专注于构建优雅的解决方案，分享知识与经验。",
    email: "hello@yourdomain.com",
    location: "中国",
    socialLinks: [
      "https://github.com/yourusername",
      "https://twitter.com/yourusername",
      "https://linkedin.com/in/yourusername",
    ],
  });

  return (
    <div className="container max-w-4xl py-12">
      {" "}
      <SEO structuredData={personStructuredData} /> {/* Hero Section */}{" "}
      <section className="mb-16">
        {" "}
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {" "}
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            {" "}
            <span className="text-6xl">👨‍💻</span>{" "}
          </div>{" "}
          <div className="flex-1 text-center md:text-left">
            {" "}
            <h1 className="text-4xl font-bold mb-4">
              你好，我是 Zhihao Mu
            </h1>{" "}
            <p className="text-xl text-muted-foreground mb-4">
              {" "}
              全栈开发者 / 技术作家 / 终身学习者{" "}
            </p>{" "}
            <p className="text-lg">
              {" "}
              热爱技术，享受创造。专注于构建优雅的解决方案，分享知识与经验。{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* About Me */}{" "}
      <section className="mb-16">
        {" "}
        <h2 className="text-3xl font-bold mb-6">我的故事</h2>{" "}
        <div className="prose prose-gray max-w-none">
          {" "}
          <p className="text-lg leading-relaxed mb-4">
            {" "}
            从第一次接触编程开始，我就被代码世界的逻辑之美深深吸引。那时候的我，
            对着黑白的终端窗口，敲下第一个 &ldquo;Hello
            World&rdquo;，感受到了创造的魅力。{" "}
          </p>{" "}
          <p className="text-lg leading-relaxed mb-4">
            {" "}
            这些年来，我在前端开发、后端架构、产品设计等领域都有所涉猎。从初创公司到大型企业，
            从独立开发者到技术负责人，每一段经历都让我对技术有了更深的理解。{" "}
          </p>{" "}
          <p className="text-lg leading-relaxed">
            {" "}
            除了技术，我还热爱阅读、写作和思考。我相信持续学习和分享是个人成长的最佳途径。
            通过这个博客，我希望能够记录自己的成长轨迹，同时也希望我的经验能够帮助到他人。{" "}
          </p>{" "}
        </div>{" "}
      </section>{" "}
      {/* Skills Section */}{" "}
      <section className="mb-16">
        {" "}
        <h2 className="text-3xl font-bold mb-6">技术栈</h2>{" "}
        <SkillsSection />{" "}
      </section>{" "}
      {/* Timeline */}{" "}
      <section className="mb-16">
        {" "}
        <h2 className="text-3xl font-bold mb-6">职业经历</h2> <Timeline />{" "}
      </section>{" "}
      {/* Values */}{" "}
      <section className="mb-16">
        {" "}
        <h2 className="text-3xl font-bold mb-6">我的价值观</h2>{" "}
        <div className="grid md:grid-cols-2 gap-6">
          {" "}
          <div className="p-6 bg-card rounded-lg border">
            {" "}
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              {" "}
              <span className="text-2xl">🎯</span> 专注品质{" "}
            </h3>{" "}
            <p className="text-muted-foreground">
              {" "}
              追求卓越，关注细节。相信好的产品来自于对品质的执着追求。{" "}
            </p>{" "}
          </div>{" "}
          <div className="p-6 bg-card rounded-lg border">
            {" "}
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              {" "}
              <span className="text-2xl">🌱</span> 持续成长{" "}
            </h3>{" "}
            <p className="text-muted-foreground">
              {" "}
              保持好奇心，拥抱变化。技术日新月异，学习永无止境。{" "}
            </p>{" "}
          </div>{" "}
          <div className="p-6 bg-card rounded-lg border">
            {" "}
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              {" "}
              <span className="text-2xl">🤝</span> 开放协作{" "}
            </h3>{" "}
            <p className="text-muted-foreground">
              {" "}
              相信团队的力量，乐于分享知识。开源精神，共同进步。{" "}
            </p>{" "}
          </div>{" "}
          <div className="p-6 bg-card rounded-lg border">
            {" "}
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              {" "}
              <span className="text-2xl">💡</span> 创新思维{" "}
            </h3>{" "}
            <p className="text-muted-foreground">
              {" "}
              不满足于现状，勇于尝试新事物。用技术解决实际问题。{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Contact */}{" "}
      <section className="mb-16">
        {" "}
        <h2 className="text-3xl font-bold mb-6">联系我</h2> <ContactInfo />{" "}
      </section>{" "}
      {/* Newsletter */}{" "}
      <section className="p-8 bg-muted rounded-lg">
        {" "}
        <h3 className="text-2xl font-bold mb-4">订阅博客</h3>{" "}
        <p className="text-muted-foreground mb-6">
          {" "}
          获取最新文章更新和独家内容，每周不超过一封邮件{" "}
        </p>{" "}
        <form className="flex flex-col sm:flex-row gap-4 max-w-md">
          {" "}
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />{" "}
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {" "}
            订阅{" "}
          </button>{" "}
        </form>{" "}
      </section>{" "}
    </div>
  );
}
