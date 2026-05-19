#!/usr/bin/env python3
"""Seed Halo blog with 15 demo posts using the console API."""
import json
import urllib.request
import base64
import time

BASE = "http://localhost:8090/apis/api.console.halo.run/v1alpha1"
CONTENT_BASE = "http://localhost:8090/apis/content.halo.run/v1alpha1"
AUTH_USER = "8874496"
AUTH_PASS = "cto12580."

def api(method, url, data=None):
    """Make an authenticated API request."""
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

def delete_drafts():
    """Delete all draft posts."""
    result = api("GET", f"{CONTENT_BASE}/posts")
    if not result:
        return
    for post in result.get("items", []):
        phase = post.get("status", {}).get("phase", "")
        if phase == "DRAFT":
            name = post["metadata"]["name"]
            title = post["spec"]["title"]
            # Mark as deleted first
            api("DELETE", f"{CONTENT_BASE}/posts/{name}")
            print(f"  Deleted draft: {title}")

posts = [
    {
        "title": "Chasing Light Through Kyoto's Alleyways",
        "slug": "chasing-light-kyoto",
        "category": "cat-travel",
        "tags": ["tag-street", "tag-35mm"],
        "cover": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80",
        "content": "<p>A weeklong walk through narrow streets, looking for the soft glow that only afternoons in early autumn can offer. The light in Kyoto is different — it filters through bamboo and paper screens, creating a warmth that feels almost tangible.</p><p>Every corner reveals a new composition: a bicycle leaning against a wooden fence, a cat sleeping in a patch of sunlight, steam rising from a noodle shop at dusk. The city rewards patience and the willingness to wander without a map.</p><p>I shot exclusively on my Leica Q3 for this trip, keeping things simple. One camera, one focal length, no decisions to make except when to press the shutter. The constraint was liberating.</p>"
    },
    {
        "title": "The Quiet Joy of Carrying One Camera",
        "slug": "quiet-joy-one-camera",
        "category": "cat-photography",
        "tags": ["tag-minimalism", "tag-35mm"],
        "cover": "https://images.unsplash.com/photo-1519183071298-a2962be96f83?w=1200&q=80",
        "content": "<p>Why I sold most of my kit and embraced the constraint of a single 35mm prime for an entire year. It started as an experiment — a reaction to the paralysis of choice — and became the most creative period I've had behind a lens.</p><p>When you can't zoom, you move. When you can't switch lenses, you see differently. The limitations became a language, and eventually, a style.</p><p>This isn't a manifesto against gear. It's just a quiet observation: sometimes less really is more, and the best camera is the one that stays out of your way.</p>"
    },
    {
        "title": "Notes on a Slow Web",
        "slug": "notes-on-slow-web",
        "category": "cat-tech",
        "tags": ["tag-minimalism", "tag-vue"],
        "cover": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
        "content": "<p>Building personal sites that load instantly and feel handmade — opinions, tools, and small tricks. The web doesn't have to be fast in the way Silicon Valley defines fast. It can be slow like a letter, deliberate like a home-cooked meal.</p><p>I've been experimenting with static sites, minimal JavaScript, and hand-written HTML. The result is something that loads in under 100ms and weighs less than a single compressed image on most modern websites.</p><p>The tools I'm using: Astro for generation, Tailwind for styling, and a healthy disregard for analytics. The goal isn't to reach everyone — it's to reach the right people.</p>"
    },
    {
        "title": "A Field Guide to Reading Outdoors",
        "slug": "reading-outdoors-guide",
        "category": "cat-life",
        "tags": ["tag-reading", "tag-coffee"],
        "cover": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80",
        "content": "<p>From light blankets to glare-resistant covers, the small rituals that turn parks into libraries. There's an art to reading outside that nobody teaches you — finding the right patch of shade, the angle that keeps the sun off your pages, the bag that doesn't crease your spines.</p><p>My setup is simple: a Kindle Oasis for sunny days (no glare), a paperback for overcast ones, and a thermos of coffee that stays warm for exactly as long as a chapter should take.</p><p>The best reading spots, I've found, are the ones with ambient noise but no conversation — fountains, playground edges, café patios at 3 PM.</p>"
    },
    {
        "title": "Why I Switched My Editor (Again)",
        "slug": "switched-editor-again",
        "category": "cat-tech",
        "tags": ["tag-rust", "tag-minimalism"],
        "cover": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
        "content": "<p>Comparing daily ergonomics across three editors after six months of disciplined dogfooding. I've used VS Code, Neovim, and Zed — each for at least two months of full-time work — and I have opinions.</p><p>VS Code remains the most complete experience. Neovim is the fastest once you invest the time. But Zed surprised me: it's the editor I didn't know I wanted, with a simplicity that feels refreshing in 2026.</p><p>The real lesson? Your editor doesn't matter as much as you think. What matters is muscle memory, and that takes months regardless of the tool.</p>"
    },
    {
        "title": "Black and White, Reconsidered",
        "slug": "black-and-white-reconsidered",
        "category": "cat-film",
        "tags": ["tag-black-and-white", "tag-35mm"],
        "cover": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80",
        "content": "<p>Pushing Tri-X 400 in a city that never quite stops moving — observations on grain, contrast and patience. Black and white isn't just desaturation. It's a different way of seeing, where texture and light become the entire story.</p><p>I've been shooting B&W film exclusively for three months now. The discipline of imagining the world without color has changed how I compose, how I wait, and how I decide what's worth a frame.</p><p>Some scenes only make sense in monochrome. The trick is learning to recognize them before you raise the camera.</p>"
    },
    {
        "title": "Morning Rituals and the First Cup",
        "slug": "morning-rituals-first-cup",
        "category": "cat-life",
        "tags": ["tag-coffee"],
        "cover": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
        "content": "<p>The ceremony of making coffee has become the anchor of my morning. It's not about the caffeine — it's about the ten minutes where nothing else exists except water, heat, and timing.</p><p>I use a simple pour-over setup: a ceramic dripper, a gooseneck kettle, and beans from a local roaster who knows more about fermentation than most winemakers. The ritual is always the same, but every cup is different.</p><p>Some mornings I sit by the window and watch the fog lift. Others I'm at my desk before the water boils. But the coffee always comes first. Everything else can wait.</p>"
    },
    {
        "title": "Landscape Photography at Golden Hour",
        "slug": "landscape-golden-hour",
        "category": "cat-photography",
        "tags": ["tag-landscape", "tag-digital"],
        "cover": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80",
        "content": "<p>The golden hour is a photographer's best friend and worst enemy — beautiful light that lasts exactly long enough to make you rush and miss the shot. After years of landscape work, I've learned that preparation matters more than luck.</p><p>I scout locations the day before, arrive 30 minutes early, and set up my composition before the light arrives. Then I wait. The best frames come in the last five minutes, when everyone else has already packed up.</p><p>My gear for landscapes: a sturdy tripod, a 24-70mm zoom, and patience. Lots of patience.</p>"
    },
    {
        "title": "Building a Static Site with Rust",
        "slug": "static-site-rust",
        "category": "cat-tech",
        "tags": ["tag-rust", "tag-minimalism"],
        "cover": "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&q=80",
        "content": "<p>I rewrote my blog generator in Rust. It feels excessive and I love it. The original was a 200-line Python script that worked fine for years. The new version is 2,000 lines of Rust that compiles in 3 seconds and generates a full site in under 50ms.</p><p>Was it necessary? Absolutely not. Was it educational? Incredibly. I learned more about string handling, error propagation, and the borrow checker than any tutorial could teach.</p><p>The real benefit turned out to be confidence: when the compiler is happy, the code works. No surprises at runtime, no midnight debugging sessions.</p>"
    },
    {
        "title": "Street Photography Ethics",
        "slug": "street-photography-ethics",
        "category": "cat-photography",
        "tags": ["tag-street", "tag-portrait"],
        "cover": "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=1200&q=80",
        "content": "<p>The invisible contract between a photographer and the streets they document. Street photography exists in a gray area — legal in most places, but not always kind. I've developed my own rules over the years.</p><p>First rule: photograph people as you'd want to be photographed. Second rule: if someone notices and seems uncomfortable, smile and move on. Third rule: never photograph someone in a vulnerable moment without their consent.</p><p>The best street photographs are the ones where the subject never knew you were there — not because you hid, but because you became part of the rhythm of the street.</p>"
    },
    {
        "title": "Weekend Walks and Mental Clarity",
        "slug": "weekend-walks-clarity",
        "category": "cat-life",
        "tags": ["tag-walking", "tag-minimalism"],
        "cover": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80",
        "content": "<p>Every Saturday morning, I leave my phone at home and walk for two hours. No destination, no music, no podcast. Just the sound of my footsteps and whatever the neighborhood offers.</p><p>It started as a digital detox experiment and became the most important part of my week. I've solved bugs on these walks, drafted blog posts, and once figured out a particularly nasty refactoring while watching a street sweeper do its work.</p><p>The Japanese have a word for this — shinrin-yoku, forest bathing. But you don't need a forest. You just need to be present, which turns out to be the hardest part.</p>"
    },
    {
        "title": "Shooting Film in 2026",
        "slug": "shooting-film-2026",
        "category": "cat-film",
        "tags": ["tag-35mm", "tag-black-and-white"],
        "cover": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80",
        "content": "<p>Film is supposed to be dead. Someone forgot to tell the community that keeps it alive — the labs, the camera repair shops, the Reddit threads where someone's grandfather's Pentax gets more engagement than the latest mirrorless flagship.</p><p>I shoot film because it forces me to slow down. 36 frames per roll means 36 decisions, not 3,000. Each click of the shutter costs something — not much, but enough to make you think before you shoot.</p><p>The best part is the waiting. Days between shooting and scanning. In a world of instant everything, delayed gratification feels rebellious.</p>"
    },
    {
        "title": "Alpine Lakes and Mirror Reflections",
        "slug": "alpine-lakes-mirror",
        "category": "cat-travel",
        "tags": ["tag-landscape", "tag-digital"],
        "cover": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80",
        "content": "<p>There's a lake at 2,400 meters that I visit every summer. It's a three-hour hike from the nearest road, and the trail is unmarked. But the reward is a body of water so still that the mountains reflect perfectly — a mirror made of glacier melt.</p><p>I've shot this lake in every season, every light condition, and I keep coming back. The challenge isn't the photograph — it's the hike with camera gear that makes you question your life choices around kilometer six.</p><p>Last year I brought my Leica instead of the DSLR. The images were softer, yes. But they felt more like the experience. Sometimes accuracy isn't the goal.</p>"
    },
    {
        "title": "The Art of Doing Nothing",
        "slug": "art-of-doing-nothing",
        "category": "cat-life",
        "tags": ["tag-reading", "tag-coffee"],
        "cover": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
        "content": "<p>In a culture that celebrates productivity, doing nothing is a radical act. I'm not talking about scrolling social media or binge-watching — I mean actual nothing. Sitting on a bench. Watching clouds. Letting thoughts arrive and leave without judgment.</p><p>I schedule 30 minutes of nothing every day. No input, no output. Just being. It's harder than it sounds — the mind rebels, reaches for the phone, invents urgencies.</p><p>But when the silence settles, something interesting happens. Ideas surface. Tensions dissolve. It turns out that doing nothing is how you make room for something.</p>"
    },
    {
        "title": "Portrait Photography with Natural Light",
        "slug": "portrait-natural-light",
        "category": "cat-photography",
        "tags": ["tag-portrait", "tag-street"],
        "cover": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&q=80",
        "content": "<p>Studio lighting is a craft I respect but rarely practice. My preference has always been natural light — window light, open shade, the golden glow of late afternoon. It's less controllable, but more honest.</p><p>The key is understanding that natural light isn't random. A north-facing window gives consistent, soft illumination. An overcast sky acts as the world's largest softbox. Open shade eliminates harsh shadows while maintaining direction.</p><p>For portraits, I look for the light first, then place the subject. Not the other way around. The best portrait I ever took happened because the light was perfect in an alley behind a restaurant.</p>"
    },
]

import base64

def make_req(method, url, data=None):
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
        body = e.read().decode()[:300]
        print(f"  ERROR {e.code}: {body}")
        return None

# Step 1: Delete all draft posts
print("=== Cleaning up draft posts ===")
result = make_req("GET", f"{CONTENT_BASE}/posts")
if result:
    for post in result.get("items", []):
        phase = post.get("status", {}).get("phase", "")
        if phase != "PUBLISHED":
            name = post["metadata"]["name"]
            title = post["spec"]["title"]
            make_req("DELETE", f"{CONTENT_BASE}/posts/{name}")
            print(f"  Deleted: {title}")

# Step 2: Create and publish posts
print("\n=== Creating 15 demo posts ===")
for i, p in enumerate(posts):
    print(f"  [{i+1}/15] {p['title']}")
    result = make_req("POST", f"{BASE}/posts", {
        "post": {
            "spec": {
                "title": p["title"],
                "slug": p["slug"],
                "cover": p["cover"],
                "categories": [p["category"]],
                "tags": p["tags"],
                "allowComment": True,
                "pinned": False,
                "priority": 0,
                "visible": "PUBLIC",
                "publish": True,
                "deleted": False,
                "excerpt": {"autoGenerate": True}
            },
            "apiVersion": "content.halo.run/v1alpha1",
            "kind": "Post",
            "metadata": {"generateName": "post-"}
        },
        "content": {
            "raw": p["content"],
            "content": p["content"],
            "rawType": "HTML"
        }
    })
    if result:
        name = result["metadata"]["name"]
        phase = result.get("status", {}).get("phase", "?")
        print(f"    -> {phase} ({name})")
        # Publish if still draft
        if phase != "PUBLISHED":
            pub = make_req("PUT", f"{BASE}/posts/{name}/publish")
            if pub:
                print(f"    -> PUBLISHED")
    time.sleep(0.2)

print("\n=== Done! ===")
