import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "隐私政策 | 个人博客",
  description: "了解我们如何收集、使用和保护您的个人信息",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {" "}
      <h1 className="text-3xl font-bold mb-8">隐私政策</h1>{" "}
      <div className="prose prose-lg max-w-none">
        {" "}
        <p className="text-gray-600 mb-6">
          {" "}
          最后更新日期：{new Date().toLocaleDateString("zh-CN")}{" "}
        </p>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">1. 信息收集</h2>{" "}
          <p>我们收集的信息类型包括：</p>{" "}
          <ul>
            {" "}
            <li>
              <strong>基本信息</strong>
              ：当您订阅博客或发表评论时，我们可能收集您的电子邮件地址和用户名。
            </li>{" "}
            <li>
              <strong>使用数据</strong>
              ：我们收集有关您如何与网站互动的信息，包括访问的页面、点击的链接和阅读时长。
            </li>{" "}
            <li>
              <strong>技术信息</strong>
              ：包括您的IP地址、浏览器类型、操作系统和设备信息。
            </li>{" "}
          </ul>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">2. 信息使用</h2>{" "}
          <p>我们使用收集的信息用于：</p>{" "}
          <ul>
            {" "}
            <li>提供和改进博客服务</li> <li>发送订阅更新和通知</li>{" "}
            <li>分析网站使用情况以优化用户体验</li>{" "}
            <li>防止垃圾邮件和滥用行为</li> <li>遵守法律义务</li>{" "}
          </ul>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">3. 信息共享</h2>{" "}
          <p>我们不会出售、交易或以其他方式向第三方转让您的个人信息，除非：</p>{" "}
          <ul>
            {" "}
            <li>获得您的明确同意</li>{" "}
            <li>为了提供您请求的服务（如评论系统）</li>{" "}
            <li>遵守法律要求或响应法律程序</li>{" "}
            <li>保护我们或他人的权利、财产或安全</li>{" "}
          </ul>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">4. 数据安全</h2>{" "}
          <p>
            {" "}
            我们采取合理的技术和组织措施来保护您的个人信息免受未经授权的访问、使用或披露。
            这包括使用加密技术、安全的服务器和定期的安全审查。{" "}
          </p>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">5. Cookie使用</h2>{" "}
          <p> 我们使用Cookie和类似技术来： </p>{" "}
          <ul>
            {" "}
            <li>记住您的偏好设置（如主题选择）</li>{" "}
            <li>分析网站流量和使用模式</li> <li>改善网站功能和性能</li>{" "}
          </ul>{" "}
          <p>
            {" "}
            您可以通过浏览器设置控制Cookie的使用，但这可能会影响某些功能的正常使用。{" "}
          </p>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">6. 第三方服务</h2>{" "}
          <p>我们的网站可能使用以下第三方服务：</p>{" "}
          <ul>
            {" "}
            <li>
              <strong>Google Analytics</strong>：用于网站分析
            </li>{" "}
            <li>
              <strong>Giscus</strong>：用于评论系统
            </li>{" "}
            <li>
              <strong>Notion API</strong>：用于内容管理
            </li>{" "}
          </ul>{" "}
          <p>
            {" "}
            这些服务可能收集和处理数据，请参阅各自的隐私政策了解详情。{" "}
          </p>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">7. 您的权利</h2>{" "}
          <p>您有权：</p>{" "}
          <ul>
            {" "}
            <li>访问我们持有的关于您的个人信息</li>{" "}
            <li>要求更正不准确的信息</li> <li>要求删除您的个人信息</li>{" "}
            <li>反对或限制某些处理活动</li>{" "}
            <li>数据可携带性（在技术可行的情况下）</li>{" "}
          </ul>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">8. 儿童隐私</h2>{" "}
          <p>
            {" "}
            我们的网站不针对13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。
            如果您认为我们可能收集了儿童的信息，请联系我们。{" "}
          </p>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">9. 政策更新</h2>{" "}
          <p>
            {" "}
            我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，
            并在页面顶部标明"最后更新日期"。建议您定期查看本政策以了解任何变更。{" "}
          </p>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">10. 联系我们</h2>{" "}
          <p> 如果您对本隐私政策有任何疑问或担忧，请通过以下方式联系我们： </p>{" "}
          <ul>
            {" "}
            <li>电子邮件：[您的邮箱地址]</li>{" "}
            <li>
              GitHub：
              <Link
                href="https://github.com/[您的GitHub用户名]"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                [您的GitHub用户名]
              </Link>
            </li>{" "}
          </ul>{" "}
        </section>{" "}
        <div className="mt-12 pt-8 border-t border-gray-200">
          {" "}
          <p className="text-center text-gray-600">
            {" "}
            <Link href="/" className="text-blue-600 hover:underline">
              返回首页
            </Link>{" "}
            {" | "}{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              服务条款
            </Link>{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
