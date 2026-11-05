#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Otto 活字印刷语音包离线/预热下载脚本 (download_pack.py)

功能说明：
  - 自动从 GitHub / 加速镜像下载指定的活字印刷语音包（如 otto.zip），并自动解压至目标目录。
  - 零外部依赖：纯 Python 3 标准库（urllib.request, zipfile, argparse, pathlib 等）实现。
  - 代理支持：默认不传 --proxy 参数则直接直连网络（不走代理）；
    若网络受限，可传入代理参数（如 --proxy http://127.0.0.1:7890）。

常用命令示例：
  # 1. 默认直连下载 otto 语音包（不走代理）
  python3 scripts/download_pack.py

  # 2. 通过本地代理下载（默认/常用代理为 http://127.0.0.1:7890）
  python3 scripts/download_pack.py --proxy http://127.0.0.1:7890

  # 3. 指定输出解压目录与强制覆盖
  python3 scripts/download_pack.py --proxy http://127.0.0.1:7890 --output ../../data/otto-hzys/packs/ --force
"""

import argparse
import os
import shutil
import sys
import time
import urllib.request
import zipfile
from pathlib import Path

# 默认候选镜像源列表（按优先级依次尝试）
DEFAULT_MIRRORS = [
    "https://gh-proxy.com/https://github.com/VincentZyuApps/koishi-plugin-otto-hzys/releases/download/v0.1.0",
    "https://ghproxy.net/https://github.com/VincentZyuApps/koishi-plugin-otto-hzys/releases/download/v0.1.0",
    "https://github.com/VincentZyuApps/koishi-plugin-otto-hzys/releases/download/v0.1.0",
    "https://gitee.com/vincent-zyu/koishi-plugin-otto-hzys/releases/download/v0.1.0",
]


def resolve_default_packs_dir() -> Path:
    """
    智能解析语音包存放目录：
    1. 优先定位上一级/上两级 Koishi 实例的 data/otto-hzys/packs
    2. 否则放置在插件自身目录下的 packs/
    """
    current_file = Path(__file__).resolve()
    plugin_root = current_file.parent.parent  # external/otto-hzys

    # 尝试寻找上一级工作区的 data 目录 (如 koishi-dev-8/data)
    workspace_root = plugin_root.parent.parent
    if (workspace_root / "data").exists() or (workspace_root / "package.json").exists():
        target = workspace_root / "data" / "otto-hzys" / "packs"
        target.mkdir(parents=True, exist_ok=True)
        return target

    target = plugin_root / "packs"
    target.mkdir(parents=True, exist_ok=True)
    return target


def create_progress_hook(filename: str):
    start_time = time.time()

    def hook(block_num: int, block_size: int, total_size: int):
        downloaded = block_num * block_size
        elapsed = time.time() - start_time
        speed = downloaded / elapsed if elapsed > 0 else 0
        speed_mb = speed / (1024 * 1024)

        if total_size > 0:
            percent = min(100.0, downloaded * 100.0 / total_size)
            downloaded_mb = downloaded / (1024 * 1024)
            total_mb = total_size / (1024 * 1024)
            bar_len = 30
            filled_len = int(bar_len * percent // 100)
            bar = "=" * filled_len + ("-" * (bar_len - filled_len))
            sys.stdout.write(
                f"\r📦 [{filename}] [{bar}] {percent:5.1f}% | {downloaded_mb:.1f}MB/{total_mb:.1f}MB | {speed_mb:.2f} MB/s"
            )
        else:
            downloaded_mb = downloaded / (1024 * 1024)
            sys.stdout.write(f"\r📦 [{filename}] 已下载: {downloaded_mb:.1f}MB | {speed_mb:.2f} MB/s")
        sys.stdout.flush()

    return hook


def download_file(url: str, dest_path: Path, proxy: str | None = None) -> bool:
    """
    从指定 URL 下载文件到 dest_path，可指定代理（如 http://127.0.0.1:7890）
    若 proxy 为空或 None，则直连（不走代理）。
    """
    handlers = []
    if proxy and proxy.strip():
        proxy_url = proxy.strip()
        print(f"🔌 使用代理: {proxy_url}")
        handlers.append(urllib.request.ProxyHandler({"http": proxy_url, "https": proxy_url}))
    else:
        # 不使用代理（显式传空 ProxyHandler 避免受环境残存变量影响）
        handlers.append(urllib.request.ProxyHandler({}))

    opener = urllib.request.build_opener(*handlers)
    opener.addheaders = [("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) koishi-plugin-otto-hzys")]

    temp_path = dest_path.with_suffix(".tmp")
    try:
        hook = create_progress_hook(dest_path.name)
        with opener.open(url, timeout=60) as response, open(temp_path, "wb") as out_file:
            total_size = int(response.headers.get("Content-Length", "0"))
            block_size = 1024 * 64
            block_num = 0
            while True:
                chunk = response.read(block_size)
                if not chunk:
                    break
                out_file.write(chunk)
                block_num += 1
                hook(block_num, block_size, total_size)

        sys.stdout.write("\n")
        sys.stdout.flush()

        if temp_path.exists():
            if dest_path.exists():
                dest_path.unlink()
            temp_path.rename(dest_path)
            return True
        return False
    except Exception as exc:
        sys.stdout.write("\n")
        sys.stdout.flush()
        print(f"⚠️ 下载失败: {exc}")
        if temp_path.exists():
            try:
                temp_path.unlink()
            except OSError:
                pass
        return False


def extract_pack(zip_path: Path, target_dir: Path, pack_name: str) -> bool:
    """
    解压语音包并展平多余嵌套目录
    """
    print(f"📂 正在解压语音包到: {target_dir} ...")
    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(target_dir)

        # 检查是否嵌套了一层与 pack_name 同名的目录
        nested_dir = target_dir / pack_name
        has_tokens = (target_dir / "sources").exists() or (target_dir / "tokens").exists()
        if nested_dir.exists() and not has_tokens:
            print("🔄 检测到嵌套目录，正在自动展平...")
            for item in nested_dir.iterdir():
                dest = target_dir / item.name
                if dest.exists():
                    if dest.is_dir():
                        shutil.rmtree(dest)
                    else:
                        dest.unlink()
                shutil.move(str(item), str(target_dir))
            try:
                nested_dir.rmdir()
            except OSError:
                pass

        # 校验解压完整性
        has_tokens_final = (target_dir / "sources").exists() or (target_dir / "tokens").exists()
        if not has_tokens_final:
            print("❌ 解压后未发现 sources/tokens 目录，资源包可能损坏！")
            return False

        print(f"✅ 语音包 [{pack_name}] 成功就绪！")
        return True
    except Exception as exc:
        print(f"❌ 解压失败: {exc}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="📻 Otto 活字印刷语音包离线下载工具 (纯标准库，支持代理)"
    )
    parser.add_argument(
        "--pack",
        type=str,
        default="otto",
        help="要下载的语音包名称（默认: otto）",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="",
        help="语音包输出存放目录（默认自动推导至 data/otto-hzys/packs）",
    )
    parser.add_argument(
        "--proxy",
        type=str,
        default="",
        help="HTTP/HTTPS 代理服务器地址（例如: http://127.0.0.1:7890，不传此参数则直连不走代理）",
    )
    parser.add_argument(
        "--mirror",
        type=str,
        default="",
        help="自定义下载镜像基础 URL（若指定则优先使用该镜像）",
    )
    parser.add_argument(
        "--force",
        "-f",
        action="store_true",
        help="若目标语音包目录已存在，是否强制重新下载并覆盖",
    )

    args = parser.parse_args()

    pack_name = args.pack.strip() or "otto"
    proxy = args.proxy.strip() if args.proxy else None

    # 计算目标目录
    if args.output.strip():
        packs_root = Path(args.output.strip()).resolve()
    else:
        packs_root = resolve_default_packs_dir()

    pack_target_dir = packs_root / pack_name
    zip_filename = f"{pack_name}.zip"
    temp_zip_path = packs_root / f".tmp_{zip_filename}"

    # 检查是否已存在
    is_ready = (pack_target_dir / "sources").exists() or (pack_target_dir / "tokens").exists()
    if is_ready and not args.force:
        print(f"✨ 语音包 [{pack_name}] 已经完整存在于: {pack_target_dir}")
        print("💡 如需强制重新下载，请添加 --force 参数。")
        return

    # 确定镜像源顺序
    mirrors = []
    if args.mirror.strip():
        mirrors.append(args.mirror.strip().rstrip("/"))
    mirrors.extend(DEFAULT_MIRRORS)

    print(f"🎯 准备下载语音包: [{pack_name}]")
    print(f"📁 目标目录: {pack_target_dir}")
    if proxy:
        print(f"🌐 代理设置: {proxy}")
    else:
        print("🌐 网络模式: 直连（未启用代理，若国内下载受阻可添加 --proxy http://127.0.0.1:7890）")

    success = False
    for idx, mirror in enumerate(mirrors, start=1):
        url = f"{mirror}/{zip_filename}"
        print(f"\n🚀 正在尝试镜像 ({idx}/{len(mirrors)}): {url}")
        if download_file(url, temp_zip_path, proxy=proxy):
            print(f"📦 下载成功，开始解压校验...")
            if pack_target_dir.exists():
                shutil.rmtree(pack_target_dir)
            pack_target_dir.mkdir(parents=True, exist_ok=True)

            if extract_pack(temp_zip_path, pack_target_dir, pack_name):
                success = True
                try:
                    temp_zip_path.unlink()
                except OSError:
                    pass
                break
            else:
                try:
                    temp_zip_path.unlink()
                except OSError:
                    pass

    if success:
        print(f"\n🎉 恭喜！语音包 [{pack_name}] 下载并安装完成！")
        sys.exit(0)
    else:
        print(f"\n❌ 所有镜像源均尝试失败！请检查网络，或配置 --proxy http://127.0.0.1:7890 后重试。")
        sys.exit(1)


if __name__ == "__main__":
    main()
