#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
01_probe_mirrors.py

连通性探测脚本：测试所有候选镜像源的 HTTP 状态码、重定向终点及下载延迟
"""

import sys
import time
import urllib.request

MIRRORS = [
    ("Gitee Releases", "https://gitee.com/vincent-zyu/koishi-plugin-otto-hzys/releases/download/v0.1.0/otto.zip"),
    ("gh-proxy 加速", "https://gh-proxy.com/https://github.com/VincentZyuApps/koishi-plugin-otto-hzys/releases/download/v0.1.0/otto.zip"),
    ("ghproxy.net 加速", "https://ghproxy.net/https://github.com/VincentZyuApps/koishi-plugin-otto-hzys/releases/download/v0.1.0/otto.zip"),
    ("GitHub Releases (官方)", "https://github.com/VincentZyuApps/koishi-plugin-otto-hzys/releases/download/v0.1.0/otto.zip"),
]


def probe_url(name: str, url: str):
    print(f"\n🔍 正在探测: {name}")
    print(f"🔗 URL: {url}")
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    opener.addheaders = [("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) probe/1.0")]

    start_time = time.time()
    try:
        req = urllib.request.Request(url, method="HEAD")
        with opener.open(req, timeout=10) as resp:
            elapsed = time.time() - start_time
            print(f"✅ 状态码: {resp.status} | 耗时: {elapsed:.2f}s | 最终地址: {resp.geturl()[:80]}...")
            length = resp.headers.get("Content-Length")
            if length:
                print(f"📦 文件大小: {int(length) / 1024 / 1024:.2f} MB")
    except urllib.error.HTTPError as err:
        elapsed = time.time() - start_time
        print(f"⚠️ HTTP 错误: {err.code} {err.reason} | 耗时: {elapsed:.2f}s")
    except Exception as err:
        elapsed = time.time() - start_time
        print(f"❌ 连接异常: {err} | 耗时: {elapsed:.2f}s")


def main():
    print("=" * 60)
    print("🚀 开始探测活字印刷语音包候选镜像连通性")
    print("=" * 60)
    for name, url in MIRRORS:
        probe_url(name, url)
    print("\n🏁 探测完毕！")


if __name__ == "__main__":
    main()
