import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "服务条款 | 个人博客",
  description: "使用本博客网站的条款和条件",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {" "}
      <h1 className="text-3xl font-bold mb-8">服务条款</h1>{" "}
      <div className="prose prose-lg max-w-none">
        {" "}
        <p className="text-gray-600 mb-6">
          {" "}
          最后更新日期：{new Date().toLocaleDateString("zh-CN")}{" "}
        </p>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">1. 接受条款</h2>{" "}
          <p>
            {" "}
            欢迎访问本个人博客网站。通过访问或使用本网站，您同意受这些服务条款的约束。
            如果您不同意这些条款的任何部分，请不要使用本网站。{" "}
          </p>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">2. 使用许可</h2>{" "}
          <p>在遵守这些条款的前提下，我们授予您：</p>{" "}
          <ul>
            {" "}
            <li>访问和浏览本网站内容的个人、非商业性使用权</li>{" "}
            <li>下载或打印网站内容供个人参考的权利</li>{" "}
            <li>通过社交媒体分享网站链接的权利</li>{" "}
          </ul>{" "}
          <p className="mt-4">以下行为是被禁止的：</p>{" "}
          <ul>
            {" "}
            <li>未经授权复制、修改或分发网站内容用于商业目的</li>{" "}
            <li>使用自动化工具（如爬虫、机器人）过度访问网站</li>{" "}
            <li>试图破坏或干扰网站的正常运行</li>{" "}
            <li>上传或传播恶意软件或有害内容</li>{" "}
          </ul>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">3. 知识产权</h2>{" "}
          <p>
            {" "}
            本网站上的所有内容，包括但不限于文章、图片、代码示例、设计和布局，
            均受版权法和其他知识产权法的保护。{" "}
          </p>{" "}
          <p className="mt-4">
            {" "}
            除非另有说明，本网站的内容采用{" "}
            <Link
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              知识共享署名-非商业性使用-相同方式共享 4.0 国际许可协议{" "}
            </Link>{" "}
            进行许可。{" "}
          </p>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">4. 用户生成内容</h2>{" "}
          <p>当您在本网站发表评论或其他内容时：</p>{" "}
          <ul>
            {" "}
            <li>您保证内容不侵犯他人的知识产权或其他权利</li>{" "}
            <li>您授予我们使用、修改和展示该内容的非独占许可</li>{" "}
            <li>您同意对您发布的内容负责</li>{" "}
            <li>我们保留删除不当内容的权利</li>{" "}
          </ul>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">5. 隐私保护</h2>{" "}
          <p>
            {" "}
            您对本网站的使用也受我们的{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              隐私政策
            </Link>{" "}
            约束。请查阅隐私政策以了解我们如何收集和使用您的信息。{" "}
          </p>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">6. 免责声明</h2>{" "}
          <p>
            {" "}
            本网站提供的内容仅供参考和教育目的。我们努力确保信息的准确性，
            但不对内容的完整性、准确性或时效性做出任何保证。{" "}
          </p>{" "}
          <p className="mt-4">
            {" "}
            本网站"按原样"提供，不提供任何明示或暗示的保证，包括但不限于：{" "}
          </p>{" "}
          <ul>
            {" "}
            <li>适销性或特定用途适用性的保证</li>{" "}
            <li>内容不会侵犯第三方权利的保证</li>{" "}
            <li>网站将不间断或无错误运行的保证</li>{" "}
          </ul>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">7. 责任限制</h2>{" "}
          <p>
            {" "}
            在法律允许的最大范围内，我们不对因使用或无法使用本网站而产生的任何直接、
            间接、偶然、特殊或后果性损害承担责任，包括但不限于：{" "}
          </p>{" "}
          <ul>
            {" "}
            <li>利润损失</li> <li>数据丢失</li> <li>业务中断</li>{" "}
            <li>其他经济损失</li>{" "}
          </ul>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">8. 第三方链接</h2>{" "}
          <p>
            {" "}
            本网站可能包含指向第三方网站的链接。这些链接仅为方便用户而提供。
            我们不对第三方网站的内容或隐私做法负责。访问第三方网站的风险由您自行承担。{" "}
          </p>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">9. 修改和终止</h2>{" "}
          <p>我们保留以下权利：</p>{" "}
          <ul>
            {" "}
            <li>随时修改或中断网站的任何部分</li> <li>更改这些服务条款</li>{" "}
            <li>限制或终止任何用户的访问权限</li>{" "}
          </ul>{" "}
          <p className="mt-4">
            {" "}
            服务条款的任何更改将在本页面发布。继续使用网站即表示您接受修改后的条款。{" "}
          </p>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">10. 适用法律</h2>{" "}
          <p>
            {" "}
            这些服务条款受中华人民共和国法律管辖并据其解释。
            任何因这些条款引起的争议应通过友好协商解决。{" "}
          </p>{" "}
        </section>{" "}
        <section className="mb-8">
          {" "}
          <h2 className="text-2xl font-semibold mb-4">11. 联系方式</h2>{" "}
          <p> 如果您对这些服务条款有任何疑问，请通过以下方式联系我们： </p>{" "}
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
            <Link href="/privacy" className="text-blue-600 hover:underline">
              隐私政策
            </Link>{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
