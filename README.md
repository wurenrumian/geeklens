# geeklens

给一段**聚焦的真实源码**做一份能直接顺读的**注解阅读版**：把打断顺读的调试/埋点/死代码清掉、只留核心逻辑，把"这段在做什么、为什么这样写、和谁同步"讲清楚。

geekLens 产出的是**副本**，不是源码，也不是项目文档：

- 真实源码保持原样——阅读版会随时间与源码漂移，记清来源与快照日期即可。
- 阅读版面向"想读透这段实现"的人；项目 `docs/` 面向"想用这个结论"的人。

## 何时用

- 用户说：给这段代码**加注解 / 出阅读版 / 逐行讲解 / 精读**某条路径 / **改前改后对照** / 整理这套**数据结构** / 讲清这个函数。
- 有一个明确的**焦点**：一个功能、一次改动、一条数据流或调用链。不是"把整个仓库注解一遍"。

## 核心原则

1. **源码只读。** 所有"变干净"的动作只发生在阅读副本上。
2. **一个焦点一份产物**，用焦点而不是文件来组织。
3. **文件数最小化，相似项合并。** 默认只产出一份文件；每多一个文件都要能回答"为什么不能并进上一份"，答不出就合并。
4. 阅读版是**顺读版，不是 diff**——读者能从头读到尾而不被 diff 噪声打断。
5. **只留核心逻辑**：调试打印、日志、埋点/profile 分支、诊断字段、注释掉的死代码、无关分支清掉；**删的位置留占位**。参与核心逻辑的（锁与内存序、原子操作、环形回绕、并发握手、错误回滚）一律保留。
6. **记来源与日期**：每个阅读版顶部写清原文件路径 + commit 与快照日期。
7. **先骨架后逐段**：先给阅读顺序与文件表，再逐段注解。
8. **语言跟随用户**，术语保留原文英文。
9. **解释与摘录分层**，证据标签全篇统一三档：**源码事实** / **推断** / **待验证**。
10. **结构图该画就画**：复杂结构用图讲；md 里直接内嵌 mermaid，导出图片/SVG 时用 [Pele](https://pele.run)。

## 工作流概要

界定焦点 → 读源码建两张清单（改动清单、结构清单）→ 定最小文件集 + 入口文件（默认一份文件）→ 合并产出阅读版 → 数据手册与路径讲解默认内联，够用就不拆 → 交叉链接与校验 → 记 project-memory → 迭代答疑。

## 产物放在哪

默认 `./tmp/annotated/`，由 **project-memory** 管理该目录；阅读版是副本，不入版本库。

**默认单文件**（大多数焦点）：

```
./tmp/annotated/
└── <focus-slug>.md            # tags front-matter + 焦点、来源、阅读顺序、注解正文、数据表、路径讲解、自测题
```

文件名就是焦点 slug，它同时是入口。

**触发拆分后**（单份超过约 400 行、内容各自独立顺读、before/after 需并排逐行对照、同一套结构被 2 份以上阅读版引用、链路要跨多份阅读版）：

```
./tmp/annotated/<focus-slug>/
├── README.md                  # 入口：焦点一句话、来源、文件表、阅读顺序
├── <topic-a>/
│   ├── README.md              # 可选：本目录有多份文件时才写
│   ├── before/<file>.annotated.h
│   └── after/<file>.annotated.h
├── data-structures.md         # 仅当被 ≥2 份阅读版引用
└── <path>.md                  # 仅当链路要跨多份阅读版
```

不为图写说明文件，不留 `index.md` / `notes.md` / `summary.md` 这类纯导航文档——导航由入口文件的文件表承担。

**降级路径**：目标项目没有 project-memory 时，放 `./annotated/`，遵守同样的 `tags` 与链接约定，并用 `./annotated/CHANGELOG.md` 记账。

**与 project-memory 的接口**（细节以它的 `SKILL.md` 为准）：`tags` 写在 front-matter（第一个是主 tag，`find-memory.py --tag` 靠它检索）；完成一轮记当天 `journal/` 一行；收尾把入口挂进 `STATE.md` 的「关键链接」；退役移 `archive/annotated/` 并在 `archive/INDEX.md` 追加一行。

## 与 calm-explain 的关系

geekLens 被触发时**必须**把 `calm-explain` 作为本次阅读版的讲解协议。职责分明：

- **解释风格类 → calm-explain（唯一来源）**：讲解语气、术语处理、回答/追问骨架、证据标签、相近概念区分。
- **产物形态类 → 本 skill（唯一来源）**：阅读版结构与注解约定、before/after 对照、数据结构手册、路径文档、占位符、源码只读、目录布局与生命周期。

## 安装

把本目录复制或软链到你的 skills 目录，目录名须与 frontmatter 的 `name:`（`geeklens`）一致：

```powershell
# OpenCode
Copy-Item -Recurse . "$env:USERPROFILE\.config\opencode\skills\geeklens"

# Claude
Copy-Item -Recurse . "$env:USERPROFILE\.claude\skills\geeklens"
```

## 目录内容

- `SKILL.md` — skill 本体。
- `scripts/export-diagram.mjs` — 把 md 里的 mermaid 图用 Pele 导出成 SVG。
- `.gitattributes` — 强制 LF 行尾。

## 相关

- `calm-explain` — 讲解协议（本 skill 引用它，不重复其规则）。
- `project-memory` — 管理 `./tmp/` 的存放与生命周期。
