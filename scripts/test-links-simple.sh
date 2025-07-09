#!/bin/bash

echo "🧪 简单链接测试脚本"
echo "===================="
echo ""
echo "请在浏览器中手动测试以下内容："
echo ""
echo "1️⃣  访问首页: http://localhost:3001"
echo "    - 测试导航栏链接是否可以点击"
echo "    - 测试文章列表链接是否可以点击"
echo ""
echo "2️⃣  访问测试页面: http://localhost:3001/test-links"
echo "    - 测试各种类型的链接"
echo "    - 查看点击日志"
echo ""
echo "3️⃣  检查事项："
echo "    ✓ 链接是否立即可点击（无需与搜索框交互）"
echo "    ✓ Next.js Link 组件是否正常工作"
echo "    ✓ 普通 <a> 标签是否正常"
echo "    ✓ 编程式导航是否正常"
echo "    ✓ 控制台是否有错误信息"
echo ""
echo "4️⃣  测试步骤："
echo "    1. 打开首页"
echo "    2. 直接点击导航栏的任意链接"
echo "    3. 如果可以跳转 = ✅ 问题已修复"
echo "    4. 如果无法跳转 = ❌ 问题仍存在"
echo ""
echo "服务器运行在: http://localhost:3001"
echo ""

# 检查页面是否可访问
echo "检查服务器状态..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
    echo "✅ 服务器正常运行"
else
    echo "❌ 服务器未响应，请确保已运行 npm run dev"
fi