import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '小杨 · 跨境电商技术交付作品集',
  description:
    '跨境电商领域的技术交付记录：财务自动化、关税数据、GEO 内容系统、RPA 与 AI 客服。真实项目、真实代码、真实边界。',
  lang: 'zh-CN',
  base: '/personal-project-wiki/',
  srcDir: '.',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', { name: 'theme-color', content: '#2b59d1' }],
    ['meta', { name: 'author', content: '小杨' }]
  ],

  markdown: {
    lineNumbers: false,
    container: {
      tipLabel: '提示',
      warningLabel: '注意',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '展开'
    }
  },

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '交付项目', link: '/projects/', activeMatch: '/projects/' },
      { text: '技术专题', link: '/engineering/', activeMatch: '/engineering/' },
      { text: '计划书', link: '/guide/roadmap', activeMatch: '/guide/roadmap' },
      { text: '部署', link: '/deploy', activeMatch: '/deploy' },
      { text: '关于', link: '/about' }
    ],

    sidebar: {
      '/': [
        {
          text: '开始',
          collapsed: false,
          items: [
            { text: '项目全景', link: '/guide/overview' },
            { text: '技术栈总览', link: '/guide/stack' },
            { text: '交付时间线', link: '/guide/timeline' },
            { text: '交付计划书', link: '/guide/roadmap' },
            { text: '部署与上线', link: '/deploy' }
          ]
        },
        {
          text: '交付项目',
          collapsed: false,
          items: [
            { text: '项目总览', link: '/projects/' },
            { text: '美鸥做账工具', link: '/projects/pdf-to-excel' },
            { text: '美鸥天眼 · 关税查询', link: '/projects/hscode' },
            { text: '跨境 SOP 视频平台', link: '/projects/sop-video' },
            { text: 'GEO 内容生产系统', link: '/projects/geo-article' },
            { text: 'GEO 网页矩阵', link: '/projects/geo-web' },
            { text: 'RPA 自动化工具链', link: '/projects/rpa' },
            { text: 'AI 智能客服', link: '/projects/ai-cs' },
            { text: '财税合规官网', link: '/projects/compliance-site' },
            { text: '物流审计系统', link: '/projects/logistics-audit' },
            { text: '热点内容创作流水线', link: '/projects/wechat-news-pipeline' },
            { text: '项目知识库与本站', link: '/projects/wiki' }
          ]
        },
        {
          text: '量化投资',
          collapsed: false,
          items: [
            { text: '多策略实盘执行矩阵', link: '/projects/finance-trader' },
            { text: '波段执行器', link: '/projects/swing-executor' },
            { text: '核心-卫星量化框架', link: '/projects/aquant' }
          ]
        },
        {
          text: '技术专题',
          collapsed: false,
          items: [
            { text: '专题导航', link: '/engineering/' },
            { text: 'PDF 逆向解析', link: '/engineering/pdf-parsing' },
            { text: '内容质量门禁', link: '/engineering/content-quality-gate' },
            { text: '发布可靠性工程', link: '/engineering/publishing-reliability' },
            { text: '知识工程与 RAG', link: '/engineering/knowledge-rag' },
            { text: '自动化安全边界', link: '/engineering/automation-safety' }
          ]
        }
      ]
    },

    outline: {
      level: [2, 3],
      label: '本页目录'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '没有找到结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },

    editLink: null,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/s1166921-png' }
    ],

    footer: {
      message:
        '所有内容均来自可验证的代码与运行日志。未实现的部分会明确标注，不夸大、不虚构。',
      copyright: 'Copyright © 2026 小杨'
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    skipToContentLabel: '跳到主要内容'
  }
})
