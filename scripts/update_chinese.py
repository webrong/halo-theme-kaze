#!/usr/bin/env python3
"""Update all 15 demo posts to Chinese content."""
import json
import urllib.request
import base64
import time

CONTENT_BASE = "http://localhost:8090/apis/content.halo.run/v1alpha1"
CONSOLE_BASE = "http://localhost:8090/apis/api.console.halo.run/v1alpha1"
AUTH_USER = "8874496"
AUTH_PASS = "cto12580."

def api(method, url, data=None):
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    creds = base64.b64encode(f"{AUTH_USER}:{AUTH_PASS}".encode()).decode()
    req.add_header("Authorization", f"Basic {creds}")
    if data:
        req.data = json.dumps(data).encode()
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  ERROR {e.code}: {e.read().decode()[:200]}")
        return None

# Mapping: slug -> Chinese title + content
updates = {
    "chasing-light-kyoto": {
        "title": "追逐京都小巷里的光",
        "content": "<p>在狭窄的街巷中走了一周，寻找只有初秋午后才有的柔和光线。京都的光是不同的——它穿过竹林和纸屏风，营造出一种几乎可以触摸的温暖。</p><p>每一个转角都是一幅新的构图：靠在木栅栏上的自行车、在阳光中打盹的猫、黄昏时分从面馆升起的蒸汽。这座城市奖赏耐心和漫无目的的漫游。</p><p>这次旅行我只带了徕卡 Q3，保持简单。一台相机，一个焦段，唯一需要决定的就是何时按下快门。这种限制反而让我获得了自由。</p>"
    },
    "quiet-joy-one-camera": {
        "title": "只带一台相机的安静快乐",
        "content": "<p>为什么我卖掉了大部分器材，一整年只用一颗 35mm 定焦镜头。这起初是一个实验——对选择瘫痪的反应——后来却成了我在镜头后最具创造力的时期。</p><p>当你不能变焦，你就移动。当你不能换镜头，你就用不同的方式观看。这些限制最终变成了一种语言，一种风格。</p><p>这不是反器材宣言。只是一个安静的观察：有时候少即是多，最好的相机就是那个不会碍事的。</p>"
    },
    "notes-on-slow-web": {
        "title": "关于慢网络的一些笔记",
        "content": "<p>打造加载飞快、有手工质感的个人网站——观点、工具和小技巧。网络不必像硅谷定义的那样「快」。它可以像一封信那样慢，像一顿家常菜那样从容。</p><p>我一直在尝试静态网站、极简 JavaScript 和手写 HTML。结果是页面在 100 毫秒内加载完成，比大多数「现代」网站上的一张压缩图片还轻。</p><p>我用的工具：Astro 生成、Tailwind 样式，以及对分析数据的健康漠视。目标不是触达所有人——而是触达对的人。</p>"
    },
    "reading-outdoors-guide": {
        "title": "户外阅读实战指南",
        "content": "<p>从轻薄毯子到防眩光书套，那些把公园变成图书馆的小仪式。户外阅读是一门没人教你的技艺——找到合适的那片阴凉、不让阳光直射书页的角度、不会折皱书脊的包。</p><p>我的配置很简单：晴天用 Kindle Oasis（不反光），阴天用纸质书，外加一保温杯刚好够读完一章还热着的咖啡。</p><p>我发现最好的阅读地点是那种有环境噪音但没有对话的地方——喷泉旁、游乐场边缘、下午三点的咖啡馆露台。</p>"
    },
    "switched-editor-again": {
        "title": "为什么我又换了编辑器",
        "content": "<p>在半年严格轮换使用三款编辑器后，对比它们的日常体验。我分别用 VS Code、Neovim 和 Zed 各进行了至少两个月全职工作，以下是我的看法。</p><p>VS Code 仍然是最完整的体验。Neovim 一旦投入时间就是最快的。但 Zed 让我惊喜：它是我不知道自己想要的编辑器，在 2026 年显得格外清新。</p><p>真正的教训是？你的编辑器没有你想的那么重要。重要的是肌肉记忆，而不论用什么工具，这都需要数月时间。</p>"
    },
    "black-and-white-reconsidered": {
        "title": "重新认识黑白",
        "content": "<p>在一座永不停歇的城市里使用 Tri-X 400 胶片——关于颗粒、对比和耐心的观察。黑白不只是去色。它是一种不同的观看方式，纹理和光线构成了全部故事。</p><p>我已经连续三个月只拍黑白胶片了。想象一个没有颜色的世界的训练，改变了我构图的方式、等待的方式，以及决定什么值得按一次快门的方式。</p><p>有些场景只在单色中有意义。诀窍在于学会在举起相机之前就认出它们。</p>"
    },
    "morning-rituals-first-cup": {
        "title": "晨间仪式与第一杯咖啡",
        "content": "<p>冲咖啡的仪式已经成为我早晨的锚点。不是为了咖啡因——而是那十分钟里除了水、温度和时间，什么都不存在。</p><p>我用简单的手冲器具：一个陶瓷滤杯、一个鹅颈壶，还有本地烘焙师比大多数酿酒师更懂发酵的豆子。仪式总是一样的，但每一杯都不同。</p><p>有些早晨我坐在窗边看雾散去。有些我还没烧水就坐在了书桌前。但咖啡永远是第一件事。其他一切都可以等。</p>"
    },
    "landscape-golden-hour": {
        "title": "黄金时刻的风光摄影",
        "content": "<p>黄金时刻是摄影师最好的朋友也是最坏的敌人——美丽的光线持续时间刚好让你急躁到错过最佳画面。经过多年的风光拍摄，我学到的是准备比运气更重要。</p><p>我会在前一天踩点，提前 30 分钟到达，在光线到来之前就搭好构图。然后等待。最好的画面总是出现在最后五分钟，那时其他人已经收拾好离开了。</p><p>我的风光装备：一副稳固的三脚架、一支 24-70mm 变焦镜头，还有耐心。大量的耐心。</p>"
    },
    "static-site-rust": {
        "title": "用 Rust 构建静态网站",
        "content": "<p>我用 Rust 重写了博客生成器。感觉有点过分，但我乐在其中。原来那个 200 行 Python 脚本运行了好多年。新版本是 2000 行 Rust，3 秒编译，50 毫秒内生成完整站点。</p><p>有必要吗？完全没有。有收获吗？非常大。我学到的字符串处理、错误传播和借用检查器的知识，远超任何教程。</p><p>真正的好处是信心：编译器满意了，代码就能跑。运行时没有意外，没有午夜调试。只有一个类型系统在背后默默守护你的安静满足感。</p>"
    },
    "street-photography-ethics": {
        "title": "街头摄影的伦理",
        "content": "<p>摄影师与他们记录的街道之间那份看不见的契约。街头摄影存在于灰色地带——在大多数地方合法，但不总是友善。多年来我形成了自己的规则，与法律关系不大，更多关于共情。</p><p>第一条规则：像你希望被拍摄的那样去拍摄他人。第二条规则：如果有人注意到了你并且看起来不太舒服，微笑着走开就好。第三条规则：永远不要在没有同意的情况下拍摄处于脆弱时刻的人。</p><p>最好的街拍是主体从来不知道你在那里的那些——不是因为你躲藏了，而是因为你融入了街道的节奏。</p>"
    },
    "weekend-walks-clarity": {
        "title": "周末散步与心灵澄明",
        "content": "<p>每个周六早上，我把手机留在家里，走上两个小时。没有目的地、没有音乐、没有播客。只有脚步声和街区提供的一切。</p><p>它开始于一次数字排毒实验，后来变成我一周中最重要的部分。我在这些散步中解决过 bug，起草过博客文章，有一次甚至是在看街道清扫车工作时想通了一个棘手的重构方案。</p><p>日本人有一个词叫「森林浴」。但你不需要森林。你只需要活在当下——这恰恰是最难的部分。</p>"
    },
    "shooting-film-2026": {
        "title": "2026 年还在拍胶片",
        "content": "<p>胶片应该已经死了。但似乎没人告诉那个维持它运转的社区——暗房、相机维修店、Reddit 上爷爷那台 Pentax 比最新无反旗舰获得更多关注的帖子。</p><p>我拍胶片是因为它逼我慢下来。一卷 36 张意味着 36 个决定，不是 3000 个。每一次按快门都有成本——不多，但足以让你在拍摄前想一想。</p><p>最好的部分是等待。拍摄和扫描之间相隔数天。在一个一切即时的世界里，延迟满足感觉像是一种反叛。</p>"
    },
    "alpine-lakes-mirror": {
        "title": "高山湖泊与镜面倒影",
        "content": "<p>在海拔 2400 米的地方有一个湖，我每年夏天都会去。从最近的公路出发要徒步三个小时，而且没有路标。但回报是一面如此平静的水体，山峰完美地倒映其中——一面由冰川融水制成的镜子。</p><p>我在每个季节、每种光线条件下都拍过这个湖，但我一直回来。挑战不在于照片——而在于带着摄影装备的那段让你在第六公里左右开始质疑人生选择的徒步。</p><p>去年我带了徕卡而不是单反。画面确实柔了一些。但它们更像是那段经历的真实感受。有时候准确并不是目标。</p>"
    },
    "art-of-doing-nothing": {
        "title": "无所事事的艺术",
        "content": "<p>在一个推崇生产力的文化中，什么都不做是一种激进行为。我不是说刷社交媒体或刷剧——我是说真正的什么都不做。坐在长椅上、看云、让念头自行来去不加评判。</p><p>我每天安排 30 分钟的「空」。没有输入、没有输出，只是存在。这听起来简单，实际上很难——大脑会反抗，会去够手机，会制造各种紧急事务。</p><p>但当沉默真正降临，有趣的事情就会发生。想法浮出水面，紧张感消散。原来无所事事是为某些事情腾出空间的方式。</p>"
    },
    "portrait-natural-light": {
        "title": "自然光人像摄影",
        "content": "<p>影棚布光是一门我尊重但很少实践的技艺。我一直偏爱自然光——窗口光、开阔阴影、午后金色的光芒。它更难控制，但更真实。</p><p>关键在于理解自然光并非随机。朝北的窗户提供稳定柔和的照明。阴天就像世界上最大的柔光箱。开阔阴影消除硬阴影的同时保持光线方向感。</p><p>拍人像时，我先找光，再安排人物。不是反过来。我拍过的最好的人像发生在一家餐馆后面的小巷里，仅仅因为那里的光线完美。</p>"
    },
}

# Get all posts
print("=== Updating posts to Chinese ===")
result = api("GET", f"{CONTENT_BASE}/posts")
if not result:
    exit(1)

for post in result.get("items", []):
    slug = post["spec"]["slug"]
    if slug not in updates:
        continue

    name = post["metadata"]["name"]
    old_title = post["spec"]["title"]
    new_data = updates[slug]

    print(f"  {old_title} -> {new_data['title']}")

    # Use console API to update post with new content
    api("PUT", f"{CONSOLE_BASE}/posts/{name}/content", {
        "raw": new_data["content"],
        "content": new_data["content"],
        "rawType": "HTML"
    })
    time.sleep(0.3)

    # Re-fetch the post to get the latest version (content update changes the resource version)
    fresh = api("GET", f"{CONTENT_BASE}/posts/{name}")
    if fresh:
        fresh["spec"]["title"] = new_data["title"]
        api("PUT", f"{CONTENT_BASE}/posts/{name}", fresh)
        print(f"    Done")
    else:
        print(f"    Failed to fetch fresh post for title update")
    time.sleep(0.2)

# Update categories and tags to Chinese
print("\n=== Updating categories to Chinese ===")
cat_map = {
    "cat-photography": "摄影",
    "cat-travel": "旅行",
    "cat-tech": "技术",
    "cat-life": "生活",
    "cat-film": "胶片",
    "76514a40-6ef1-4ed9-b58a-e26945bde3ca": "默认分类"
}
for cat_name, display_name in cat_map.items():
    result = api("GET", f"{CONTENT_BASE}/categories/{cat_name}")
    if result:
        result["spec"]["displayName"] = display_name
        api("PUT", f"{CONTENT_BASE}/categories/{cat_name}", result)
        print(f"  Category: {display_name}")

print("\n=== Updating tags to Chinese ===")
tag_map = {
    "tag-street": "街拍",
    "tag-landscape": "风光",
    "tag-portrait": "人像",
    "tag-black-and-white": "黑白",
    "tag-35mm": "35mm",
    "tag-digital": "数码",
    "tag-rust": "Rust",
    "tag-vue": "Vue",
    "tag-minimalism": "极简",
    "tag-coffee": "咖啡",
    "tag-reading": "阅读",
    "tag-walking": "散步",
}
for tag_name, display_name in tag_map.items():
    result = api("GET", f"{CONTENT_BASE}/tags/{tag_name}")
    if result:
        result["spec"]["displayName"] = display_name
        api("PUT", f"{CONTENT_BASE}/tags/{tag_name}", result)
        print(f"  Tag: {display_name}")

print("\n=== Done! ===")
