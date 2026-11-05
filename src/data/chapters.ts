export type ChapterGroup = 'tools' | 'interaction';

export interface ChapterSection {
  id: string;
  index: string;
  title: string;
  /** 一句话概括，按钮行右侧小字 */
  lead?: string;
  /** 核心功能 / 底层逻辑 / 操作流程 等分点 */
  points?: { label: string; text: string }[];
  /** 流程链，用箭头串联 */
  flow?: string[];
  /** 小标签，解释设计意图 */
  notes?: string[];
  /** 配图，缺省则渲染占位卡 */
  media?: string;
  mediaCaption?: string;
  /** 关联既有项目，用于「展开完整档案」 */
  projectId?: string;
  /** 当前子项演示视频（页面级 demoVideo 未配置时生效） */
  video?: string;
  /** 视频容器宽度类名（如 w-[62%]），缺省 w-full */
  videoWidth?: string;
  /** 视频缩放类名（微放大裁边用，如 scale-[1.03]） */
  videoScale?: string;
  /** 无视频时展示的图片廊 */
  gallery?: string[];
  /** 内容面板左上角 GitHub 仓库链接 */
  github?: string;
  /** 第二条流程链（可选） */
  flow2?: string[];
  flowLabel?: string;
  flow2Label?: string;
  /** 前后对比图（ImageCompare 滑块） */
  beforeImage?: string;
  afterImage?: string;
}

export interface Chapter {
  id: string;
  roman: string;
  number: string;
  title: string;
  /** h2 标题旁的备注小字 */
  titleNote?: string;
  tabLabel: string;
  tabActive: string;
  group: ChapterGroup;
  /** 页面级固定演示视频（优先于子项 video） */
  demoVideo?: string;
  coreValue: string;
  background: string;
  meta: { label: string; value: string }[];
  sections: ChapterSection[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'svga-tools',
    roman: 'I',
    number: '01',
    title: '定制物料工具',
    titleNote: 'VIBE CODING 产物',
    tabLabel: '物料工具',
    tabActive: 'SVGA TOOL',
    group: 'tools',
    demoVideo: '/assets/aistudio/svga_demo_x264.mp4',
    coreValue:
      '将原本需要借助专业设计软件完成的物料修改操作，封装为更直接、低门槛的可视化操作流程，减少对设计排期的依赖。',
    background:
      '等待成本 · 重复性工作 · 测试与返工成本。一般来说，SVGA 文件的改动（适配用户名、头像等）需经设计排期，供不应求下小需求常需等待 3+ 工作日，修改后还常出现卡顿或像素变差等问题。因此独立构思并开发出工具，让运营活动组掌握主动权，实现自行修改、导出与上机测试闭环。',
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
        lead: '素材缺少适配图层 → 新增图层',
        projectId: 'svga-automation-tools',
        github: 'https://github.com/CNCYY/svga-tool',
        beforeImage: '/assets/aistudio/svga_ki_before.png',
        afterImage: '/assets/aistudio/svga_ki_after.png',
        points: [
          { label: '核心功能', text: '为缺少适配图层的素材新增图层，使其具备适配用户名或头像的能力。' },
          {
            label: '底层逻辑',
            text: '指定名称的空白图层，可以使文件具备适配用户名或头像的能力，从而满足业务上定制的需求；同一套处理思路也可延伸至文字、图片等场景。',
          },
          {
            label: '操作流程',
            text: '导入 SVGA 文件 → 解析图层并预览原始动画 → 在画布中框选目标位置、调整图层尺寸 → 设置指定的图层名称/内容 → 导出包含新增图层的 SVGA 文件。',
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
        lead: '图层名称或内容需要调整 → 重命名、删除、替换',
        projectId: 'svga-automation-tools',
        github: 'https://github.com/CNCYY/svga-layertool',
        beforeImage: '/assets/aistudio/svga_lm_before.png',
        afterImage: '/assets/aistudio/svga_lm_after.png',
        points: [
          { label: '核心功能', text: '对已有素材的图层名称或内容进行调整：重命名、删除、替换。' },
          {
            label: '底层逻辑',
            text: '在不改变文件结构的情况下，将原有 SVGA 素材图层进行删减替换，再通过打包封装为有效文件。',
          },
          {
            label: '操作流程',
            text: '导入 SVGA 文件并解析图层 → 根据需求删除、替换图层图片或修改图层名称 → 导出重新打包的 SVGA 文件。',
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
      '开发资源紧缺 · 长活动需要持久性刺激。斋月持续时间较长，需要通过连续的活动与消费场景维持用户参与，但研发资源有限，无法承接多个传统短期活动的开发。AI 图像生成则提供了另一种内容供给方式：让用户参与生成内容，并将结果与平台现有的虚拟礼物体系结合。',
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
        lead: '偏好的礼物 → 付费上架成为平台可被送出的虚拟礼物',
        projectId: 'ai-gift-generator',
        video: '/assets/aistudio/gift_user_demo_x264.mp4',
        notes: [
          '预设关键词降低输入门槛',
          '主题关键词增强生成结果与斋月场景的关联',
          '多图候选让用户有选择空间',
        ],
      },
      {
        id: 'workflow',
        index: '02',
        title: '与业务结合 · 工作流',
        lead: '从用户输入到礼物图片输出',
        projectId: 'ai-gift-generator',
        video: '/assets/aistudio/gift_flow_demo_x264.mp4',
        flow: ['用户输入', '提示词优化', '图像生成', '背景去除', '礼物图片输出'],
        notes: [
          '对用户输入进行结构化处理，约束生成主题、纯黑背景与主体呈现方式，并设置敏感词处理规则',
          '对生成结果进行背景去除，获得适用于礼物素材展示的图像',
          '输出图片及相关信息，为后续的礼物上架流程提供字段',
        ],
      },
      {
        id: 'business-layer',
        index: '03',
        title: 'AI 生成结果进入实际业务层',
        lead: '工作流 → API 封装 → 入库 → 上架',
        gallery: [
          '/assets/aistudio/gift-gallery/g1.jpg',
          '/assets/aistudio/gift-gallery/g2.png',
          '/assets/aistudio/gift-gallery/g3.jpg',
          '/assets/aistudio/gift-gallery/g4.jpg',
          '/assets/aistudio/gift-gallery/g5.jpg',
          '/assets/aistudio/gift-gallery/g6.jpg',
          '/assets/aistudio/gift-gallery/g7.jpg',
          '/assets/aistudio/gift-gallery/g8.jpg',
          '/assets/aistudio/gift-gallery/g9.jpg',
        ],
        flow: ['生成工作流', 'API 封装', '返回礼物名称与图片字段', '后端数据入库', '完成礼物上架'],
      },
      {
        id: 'outcome',
        index: '04',
        title: '数据与使用跟踪',
        lead: '建立礼物上架的业务流程',
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
    tabActive: 'VIBE H5',
    group: 'tools',
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
        lead: '文案输入 → 模板抽取 → 图文填充 → 生成卡片',
        video: '/assets/aistudio/h5_flow_demo_x264.mp4',
        flow: [
          '文案输入与预设选项',
          '用户照片上传',
          '模板随机抽取',
          '图片与文字填充',
          '生成卡片并保存图片',
        ],
      },
      {
        id: 'h5-visual',
        index: '02',
        title: '页面与素材',
        lead: '视觉素材与页面设计',
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
    coreValue:
      '一组自发的拟物与微交互实验：把纸质物件、票据、纹样、播放器等日常视觉元素，改造成可操作的图片工具。',
    background:
      '在工作项目之外持续做的小体量原型实验，用于验证交互想法与视觉处理方式，多数可直接复用为活动物料的呈现形式。',
    meta: [
      { label: '项目类型', value: '个人创意实验' },
      { label: '形态', value: '可视化小工具 / 交互原型' },
      { label: '个人角色', value: '构思、视觉与交互、前端实现' },
    ],
    sections: [
      {
        id: 'fold-card',
        index: '01',
        title: '折叠式照片展示器',
        lead: '参考折叠式卡片的视觉形式，探索图片展开与浏览交互',
        projectId: 'heytea-foldable-card',
        video: '/assets/aistudio/tool-collection/01_x264.mp4',
        videoWidth: 'w-[260px] sm:w-[300px]',
        videoScale: 'scale-[1.03]',
      },
      {
        id: 'receipt-photo',
        index: '02',
        title: '票据与照片组合工具',
        lead: '探索票据版式与个人照片的组合呈现',
        projectId: 'thermal-receipt-printer',
        video: '/assets/aistudio/tool-collection/02.mp4',
        videoWidth: 'w-[260px] sm:w-[300px]',
        videoScale: 'scale-[1.03]',
      },
      {
        id: 'player-photo',
        index: '03',
        title: '播放器与照片组合工具',
        lead: '将音乐播放元素与图片展示结合',
        video: '/assets/aistudio/tool-collection/03_x264.mp4',
        videoWidth: 'w-[260px] sm:w-[300px]',
        videoScale: 'scale-[1.03]',
      },
      {
        id: 'heritage-pattern',
        index: '04',
        title: '古画纹样美化工具',
        lead: '探索传统纹样的视觉处理与效果表达',
        projectId: 'chinese-heritage-pattern',
        video: '/assets/aistudio/tool-collection/04_x264.mp4',
        videoWidth: 'w-[260px] sm:w-[300px]',
        videoScale: 'scale-[1.03]',
        gallery: [
          '/assets/aistudio/tool-collection/heritage-1.jpg',
          '/assets/aistudio/tool-collection/heritage-2.jpg',
          '/assets/aistudio/tool-collection/heritage-3.jpg',
          '/assets/aistudio/tool-collection/heritage-4.jpg',
        ],
      },
      {
        id: 'pool-theme',
        index: '05',
        title: '泳池主题图片工具',
        lead: '探索场景化的图片呈现形式',
        video: '/assets/aistudio/tool-collection/05_x264.mp4',
        videoWidth: 'w-[260px] sm:w-[300px]',
        videoScale: 'scale-[1.03]',
      },
      {
        id: 'avatar-wrapper',
        index: '06',
        title: '头像包装纸编辑器',
        lead: '探索头像与装饰图案的组合编辑',
      },
      {
        id: 'resume-editor',
        index: '07',
        title: '可视化简历编辑器',
        lead: '探索简历内容编辑与可视化呈现方式',
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
