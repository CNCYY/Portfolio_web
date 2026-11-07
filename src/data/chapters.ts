export type ChapterGroup = 'tools' | 'interaction';

export interface ChapterSection {
  id: string;
  index: string;
  title: string;
  /** 一句话概括，按钮行右侧小字 */
  lead?: string;
  /** 核心功能 / 底层逻辑 / 操作流程 等分点 */
  points?: { label: string; text: string }[];
  /** 小标签，解释设计意图 */
  notes?: string[];
  /** 配图，缺省则渲染占位卡 */
  media?: string;
  mediaCaption?: string;
  /** 前后对比图；两者都配置时内容面板右侧渲染对比滑块 */
  beforeImage?: string;
  afterImage?: string;
  /** 流程胶囊 */
  flow?: string[];
  /** 流程胶囊小标签 */
  flowLabel?: string;
  /** 第二组流程胶囊（渲染在 flow 下方） */
  flow2?: string[];
  flow2Label?: string;
  /** GitHub 仓库链接，渲染在内容面板左上角 */
  github?: string;
  /** 子项演示视频，配置后右侧视频随选中子项切换 */
  video?: string;
  /** 视频宽度类（不配置默认 w-full） */
  videoWidth?: string;
  /** 视频缩放类，用于竖屏视频裁掉画面边缘黑线（不配置默认不缩放） */
  videoScale?: string;
  /** 图片廊（横向滚动），配置后该子项右侧展示 Gallery */
  gallery?: string[];
  /** gallery 渲染为真机竖向手风琴（GiftAccordion，含氛围光效） */
  deviceGallery?: boolean;
  /** showcase 布局：选中该子项时左下角展示的图片轮播素材 */
  images?: string[];
  /** showcase 布局：选中该子项时左下角展示的错落小票 */
  board?: { items: string[] };
  /** 关联既有项目，用于「展开完整档案」 */
  projectId?: string;
}

export interface Chapter {
  id: string;
  roman: string;
  number: string;
  title: string;
  tabLabel: string;
  tabActive: string;
  group: ChapterGroup;
  /** 右侧演示视频；配置后大页布局变为：左上介绍 + 左下子项列表 + 右侧视频 */
  demoVideo?: string;
  /** 视频面板样式：unified = 16:9 满宽统一面板（默认，切换子项尺寸恒定）；
      original = 保持视频原始尺寸（videoWidth 决定宽度），适合内容较少的页面 */
  videoPanel?: 'unified' | 'original';
  /** 子项列表内嵌左列（介绍下方）、内容在列表项下方向下展开；默认选中首个子项 */
  inlineList?: boolean;
  /** 画廊式三列布局：左列介绍+图片轮播、中列视频、右列列表导航 */
  showcase?: boolean;
  coreValue: string;
  /** 介绍区背景段落（未配置则不渲染该段落） */
  background?: string;
  /** 标题旁备注（仅个别大页配置） */
  titleNote?: string;
  meta: { label: string; value: string }[];
  sections: ChapterSection[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'svga-tools',
    roman: 'I',
    number: '01',
    title: '定制物料工具',
    tabLabel: '物料工具',
    tabActive: 'SVGA TOOL',
    group: 'tools',
    demoVideo: '/assets/aistudio/svga_demo_x264.mp4',
    coreValue:
      '将原本需要借助专业设计软件完成的物料修改操作，封装为更直接、低门槛的可视化操作流程，减少对设计排期的依赖。',
    background:
      'SVGA 文件的改动（适配用户名、头像等）需经设计排期，供不应求下小需求常需等待 3+ 工作日，修改后还常出现卡顿或像素变差等问题。因此独立构思并开发出工具，让运营活动组掌握主动权，实现自行修改、导出与上机测试闭环。',
    titleNote: 'Vibe Coding 产物',
    meta: [
      { label: '项目类型', value: '内部效率工具' },
      { label: '服务对象', value: '活动运营人员' },
      { label: '个人负责', value: '需求分析、方案设计、功能定义、开发与交付' },
    ],
    sections: [
      {
        id: 'key-injector',
        index: '01',
        title: 'SVGA Key Injector',
        lead: '为缺少适配图层的素材新增图层，使其具备适配用户名或头像的能力',
        projectId: 'svga-automation-tools',
        beforeImage: '/assets/aistudio/svga_ki_before.webp',
        afterImage: '/assets/aistudio/svga_ki_after.webp',
        github: 'https://github.com/CNCYY/svga-tool.git',
        points: [
          {
            label: '底层逻辑',
            text: '指定命名的图层作为接口，使得客户端能够定位并渲染用户名/图片到对应位置',
          },
        ],
        flow: [
          '导入 SVGA',
          '解析图层并预览',
          '框选位置 / 调整尺寸',
          '设置图层名称与内容',
          '导出新文件',
        ],
      },
      {
        id: 'layer-master',
        index: '02',
        title: 'SVGA Layer Master',
        lead: '对已有物料的图层名称或内容进行调整：重命名、删除、替换。',
        projectId: 'svga-automation-tools',
        beforeImage: '/assets/aistudio/svga_lm_before.webp',
        afterImage: '/assets/aistudio/svga_lm_after.webp',
        github: 'https://github.com/CNCYY/svga-layertool.git',
        points: [
          {
            label: '底层逻辑',
            text: '在不改变文件结构的情况下，将原有 SVGA 素材图层进行删减替换，再通过打包封装为有效文件。',
          },
        ],
        flow: ['导入并解析图层', '删除 / 替换 / 重命名', '重新打包导出'],
      },
      {
        id: 'metrics',
        index: '03',
        title: '数据与使用跟踪',
        lead: '提需量 -65% · 近月 1 万次请求',
        points: [
          {
            label: '使用结果',
            text: '支持部分素材修改需求由运营自主处理，降低对设计排期的依赖，为素材的修改与复用提供新的处理方式。',
          },
          {
            label: '效率数据',
            text: '提需量环比推广前缩减 65%，单一需求节省 1-2 天工时，在斋月大活动高峰期能承接海量定制物料需求。',
          },
          {
            label: '请求量',
            text: '两款工具近一个月累计约 1 万次请求，日均约 300 次请求。',
          },
        ],
        notes: [
          '一次文件加载会计为一次请求',
          '该指标不等同于独立用户数、完成任务数或实际节省工时',
          '数据来源：Cloudflare',
        ],
      },
    ],
  },

  {
    id: 'ai-gift',
    roman: 'II',
    number: '02',
    title: 'AI 生成礼物',
    tabLabel: 'AI 礼物',
    tabActive: 'AI GIFT',
    group: 'tools',
    coreValue:
      '围绕斋月主题运营场景，探索将 AI 图像生成能力与平台消费场景结合。用户可以通过关键词生成礼物候选图，选择喜欢的结果并付费上架，供平台其他用户赠送。',
    background:
      '斋月持续时间较长，需要通过连续的新活动维持用户参与，但研发资源有限，无法承接多个传统短期活动的开发。AI 图像生成则提供了另一种内容供给方式：让用户参与生成内容，并将结果与平台现有的虚拟礼物体系结合。',
    meta: [
      { label: '项目类型', value: 'AI 应用探索 / 社交互动玩法' },
      { label: '业务场景', value: '斋月主题活动' },
      { label: '个人角色', value: '方案提出、玩法构思、交互原型、工作流设计与落地推进' },
    ],
    sections: [
      {
        id: 'user-side',
        index: '01',
        title: '用户侧',
        lead: '选择或自行输入关键词，生成礼物图片，选择图片上架为可被送出的虚拟礼物',
        projectId: 'ai-gift-generator',
        video: '/assets/aistudio/gift_user_demo_x264.mp4',
        videoWidth: 'w-2/5',
        // 面板统一 16:9（高约 280px），放大 2.5% ≈ 上下各裁 ~3.5px 黑线
        videoScale: 'scale-[1.025]',
        notes: [
          '预设关键词降低输入门槛',
          '主题关键词增强生成结果与斋月场景的关联',
          '多图候选让用户有选择空间',
        ],
      },
      {
        id: 'workflow',
        index: '02',
        title: 'AI实现及后端上架',
        lead: '工作流逻辑',
        projectId: 'ai-gift-generator',
        video: '/assets/aistudio/gift_flow_demo_x264.mp4',
        flow: ['用户输入', '提示词优化', '图像生成', '背景去除', '礼物图片输出'],
        flowLabel: 'AI 工作流',
        flow2: ['生成工作流', 'API 封装', '返回礼物名称与图片字段', '后端数据入库', '完成礼物上架'],
        flow2Label: '后端上架',
        notes: [
          '对用户输入进行结构化处理，约束生成主题、纯黑背景与主体呈现方式，并设置敏感词处理规则',
          '对生成结果进行背景去除，获得适用于礼物素材展示的图像',
          '输出图片及相关信息，为后续的礼物上架流程提供字段',
        ],
      },
      {
        id: 'outcome',
        index: '03',
        title: '数据与使用跟踪',
        lead: '建立礼物上架的业务流程',
        gallery: [
          '/assets/aistudio/gift-gallery/g1.webp',
          '/assets/aistudio/gift-gallery/g2.webp',
          '/assets/aistudio/gift-gallery/g3.webp',
          '/assets/aistudio/gift-gallery/g4.webp',
          '/assets/aistudio/gift-gallery/g5.webp',
          '/assets/aistudio/gift-gallery/g6.webp',
          '/assets/aistudio/gift-gallery/g7.webp',
          '/assets/aistudio/gift-gallery/g8.webp',
          '/assets/aistudio/gift-gallery/g9.webp',
        ],
        deviceGallery: true,
        points: [
          {
            label: '结果与沉淀',
            text: '虽然业务数据未能证明该玩法取得显著增长效果，但实现了 AI 图像生成在语音社交产品中的实际应用，建立礼物上架的业务流程，为后续定制礼物自动化流程提供实践基础。',
          },
        ],
      },
    ],
  },

  {
    id: 'vibe-h5',
    roman: 'III',
    number: '03',
    title: 'vibe coding H5 页面',
    tabLabel: 'H5 活动',
    videoPanel: 'original',
    tabActive: 'VIBE H5',
    group: 'tools',
    inlineList: true,
    coreValue: '资源受限情况下，利用 vibe coding 将活动创意设计快速落地。',
    background:
      '年前紧急上线新项目推广活动，设计资源已排满，需要尽可能减少研发资源投入。希望通过轻量 H5 活动实现用户参与和内容传播。',
    meta: [
      { label: '项目类型', value: 'AI 应用探索 / 社交互动玩法' },
      { label: '业务场景', value: '斋月主题活动' },
      { label: '个人角色', value: '玩法构思、原型交互、视觉素材与页面设计' },
    ],
    sections: [
      {
        id: 'h5-flow',
        index: '01',
        title: '玩法流程',
        flow: [
          '文案输入与预设选项',
          '用户照片上传',
          '模板随机抽取',
          '图片与文字填充',
          '生成卡片并保存图片',
        ],
        video: '/assets/aistudio/h5_flow_demo_x264.mp4',
        videoWidth: 'w-2/5',
        // 视频高约 470px（原始尺寸面板），放大 4.5% ≈ 上下各裁掉 10px
        videoScale: 'scale-[1.045]',
      },
    ],
  },

  {
    id: 'creative-collection',
    roman: 'IV',
    number: '04',
    title: '个人创意集锦',
    tabLabel: '创意集锦',
    tabActive: 'CREATIVE LABS',
    group: 'interaction',
    showcase: true,
    coreValue: '结合日常视觉元素的图片展示工具创意',
    meta: [
      { label: '项目类型', value: '个人创意实验' },
      { label: '形态', value: '可视化小工具 / 交互原型' },
      { label: '个人角色', value: '构思、视觉与交互、前端实现' },
    ],
    sections: [
      {
        id: 'fold-card',
        index: '01',
        title: '仿喜茶折叠小卡周边照片展示工具',
        lead: '小红书1w+浏览；小工具200+使用；200+分享',
        projectId: 'heytea-foldable-card',
        video: '/assets/aistudio/tool-collection/01_x264.mp4',
      },
      {
        id: 'receipt-photo',
        index: '02',
        title: '票据与照片组合工具',
        lead: '探索票据版式与个人照片的组合呈现',
        projectId: 'thermal-receipt-printer',
        video: '/assets/aistudio/tool-collection/02.mp4',
        board: {
          items: [
            '/assets/aistudio/tool-collection/receipt-1.webp',
            '/assets/aistudio/tool-collection/receipt-2.webp',
            '/assets/aistudio/tool-collection/receipt-3.webp',
            '/assets/aistudio/tool-collection/receipt-4.webp',
            '/assets/aistudio/tool-collection/receipt-5.webp',
            '/assets/aistudio/tool-collection/receipt-6.webp',
          ],
        },
      },
      {
        id: 'player-photo',
        index: '03',
        title: '播放器与照片组合工具',
        lead: '图片cd+live图/视频展示',
        video: '/assets/aistudio/tool-collection/03_x264.mp4',
      },
      {
        id: 'heritage-pattern',
        index: '04',
        title: '古画纹样美化工具',
        lead: '探索传统纹样的视觉处理与效果表达',
        projectId: 'chinese-heritage-pattern',
        video: '/assets/aistudio/tool-collection/04_x264.mp4',
        images: [
          '/assets/aistudio/tool-collection/heritage-1.webp',
          '/assets/aistudio/tool-collection/heritage-2.webp',
          '/assets/aistudio/tool-collection/heritage-3.webp',
          '/assets/aistudio/tool-collection/heritage-4.webp',
        ],
      },
      {
        id: 'pool-theme',
        index: '05',
        title: '泳池主题图片工具',
        lead: '探索场景化的图片呈现形式',
        video: '/assets/aistudio/tool-collection/05_x264.mp4',
      },
    ],
  },
];

/** 既有作品 → 所属大页，用于 Hero 散落照片跳转 */
export const PROJECT_TO_CHAPTER: Record<string, string> = {
  'svga-automation-tools': 'svga-tools',
  'ai-gift-generator': 'ai-gift',
  'heytea-foldable-card': 'creative-collection',
  'thermal-receipt-printer': 'creative-collection',
  'chinese-heritage-pattern': 'creative-collection',
  'creative-micro-labs': 'creative-collection',
};
