export type Language = 'zh' | 'en';

let currentLang: Language = 'zh';

export function getLanguage(): Language {
  return currentLang;
}

export function setLanguage(lang: Language) {
  currentLang = lang;
}

export const I18N = {
  zh: {
    // 1. Pilot Authentication & Sortie Login
    login: {
      badge: '空战指挥终端 · 飞行员身份核验系统',
      title: '王牌飞行员身份核验与战备登入',
      subtitle: '前线雷达侦测到不明敌对信号，请确认呼号代号并选择系统语言后升空出击：',
      langLabel: '语言选择 / LANGUAGE：',
      zhBtn: '🇨🇳 简体中文',
      enBtn: '🇬🇧 English',
      callsignLabel: '飞行员呼号 (档案索引)：',
      statsHeader: '当前档案战绩概览：',
      statsOverview: (funds: number, high: number, owned: number) =>
        `储备战备军费: ${funds} G   历史最高得分: ${high} 分   已列装战机: ${owned} / 12 架`,
      confirmSortie: '🚀 确认登入',
      guestAccess: '⚡ 快速试飞'
    },
    // 2. Main Menu
    menu: {
      pilotBadge: (callsign: string, funds: number) => `呼号: ${callsign}   军费: ${funds} G`,
      switchPilot: '切换 👤',
      sortie: '出击',
      hangar: '整备',
      stages: '部署',
      meditation: '禅定',
      prologue: '序章 📖',
      replayStartup: '片头 🎬',
      medals: '荣誉 🎖️',
      settings: '设置 ⚙️',
      exitGame: '退出',
      exitPrompt: '确定要退出 AirBattle 吗？'
    },
    // 2.5 Combat Medals & Citations Showcase
    medals: {
      title: '战历成就 · 荣誉收藏墙',
      subtitle: 'HALL OF VALOR & COMBAT ACHIEVEMENTS',
      toastTitle: '🎖️ 战历荣誉勋章解锁！',
      victoryBestow: '🎖️ 战场立功授勋：',
      overview: (unlocked: number, total: number) => `收集进度: ${unlocked} / ${total} 枚`,
      buffDesc: (unlocked: number) => `Buff：机体耐久 +${(unlocked * 1.5).toFixed(1)}% | 翻滚冷却 -${(unlocked * 0.025).toFixed(2)}s | 战备军费 +${(unlocked * 2)}%${unlocked >= 12 ? ' | 高能流光' : ''}`,
      pageText: (cur: number, total: number) => `第 ${cur} / ${total} 页`,
      prevPage: '◀ 上一页',
      nextPage: '下一页 ▶',
      returnMenu: '◀ 返回主菜单',
      lockedName: '【待授荣誉】',
      lockedDesc: '达成指定战术成就后授予。',
      items: [
        { name: '🥇 飞燕出击', desc: '突破第 1 关截击防线。' },
        { name: '🥉 胜利精锐', desc: '突破前 4 关封锁，击破浮岛航母。' },
        { name: '🏆 地球守护者', desc: '通关全部 8 关，在浩瀚晨星下终结战役。' },
        { name: '⚡ 绝地桶滚', desc: '精通战术规避机动，累计完成 20 次翻滚。' },
        { name: '🛡️ 绝对防壁', desc: '展现神级规避意识，满血通关任意战役。' },
        { name: '💥 终极对波', desc: '直面敌旗舰主炮，对波连按顶爆敌方主炮！' },
        { name: '✨ 光之指引', desc: '驾驶迪迦系列战机穿过黑雾终结邪神。' },
        { name: '🛸 终极兵器', desc: '完成总部研发，成功实装 11 号合体战机。' },
        { name: '🎯 鹰眼截击', desc: '精准索敌，全歼 3 支侧翼斜切突击编队。' },
        { name: '🧘 功德无量', desc: '在禅定室敲击木鱼累计达 108 次，心如止水。' },
        { name: '💰 战略储备', desc: '后勤充沛，个人战备金库突破 10,000 G。' },
        { name: '👑 天空之王', desc: '集齐全部军功，加冕天空之王。' }
      ]
    },
    // 3. Operational Theatre Deployment (Map)
    map: {
      title: '战术空域部署',
      subtitle: '请选择出击作战空域以执行战术截击任务',
      passed: '已肃清',
      unlocked: '可出击',
      locked: '未解锁',
      returnMenu: '◀ 返回主菜单'
    },
    // 4. Hangar & TPC Technology Tree
    hangar: {
      fleetTitle: 'FLEET HANGAR // 常规战备机库\nGlobal Defense Force Tactical Aircraft Requisition Depot',
      tpcTitle: 'TPC F.A.R.-EAST // 地球和平联合组织 · 绝密科技树档案\nTerrestrial Peaceable Consortium · Far East Headquarters R&D Division',
      funds: (funds: number) => `战备军费: ${funds} G`,
      inService: '★ 当前执飞',
      equip: '换装出击',
      reqPrice: (price: number) => `解锁 [${price} G]`,
      reqTpc: (price: number) => `⚡ 研发列装 [${price} G]`,
      lockedPrereq: '🔒 需前置机型',
      needPrereqAlert: '前置机型尚未列装研发，无法跨级解锁！请先完成前置科技机型研发。',
      insufficientFundsAlert: (price: number, cur: number) =>
        `军费不足！需要 ${price} G，当前仅有 ${cur} G。\n可通过通关关卡或在静心殿敲木鱼积攒功德资金！`,
      switchToTpc: '切换: TPC科技树 🛸',
      switchToFleet: '切换: 常规机库 ✈️',
      returnMenu: '◀ 返回主菜单',
      page1Tab: '【胜利队 GUTS】迪迦时期',
      page2Tab: '【超级胜利队 SUPER GUTS】戴拿时期',
      page1Title: '✦ 胜利队（GUTS）科技档案 · 迪迦时期 (原著主力战机)',
      page2Title: '✦ 超级胜利队（SUPER GUTS）科技档案 · 戴拿新领域时代',
      page1Note: '第一代地球和平联合组织（TPC）核心防卫力量，全系列麦格斯动力先驱机型。',
      page2Note: '新领域计划（Neo Frontier）尖端旗舰序列，承载人类探索深空的终极武装。',
      eagleUnlockCond: '🔓 神鹰号解锁条件：TPC战机全解锁 + 1000 G军费 或 集齐所有荣誉勋章 (满足其一即可)',
      eagleReqNotMet: '胜利神鹰号研发许可未开启！\n需满足以下任一条件：\n1. TPC胜利队战机全部解锁 且 军费达 1000 G；\n2. 获得荣誉收藏室内全部 12 枚勋章与奖牌。',
      branch1: '⚡ 高机动·截击进化线',
      branch2: '💥 重装·德克萨斯火力线',
      branch3: '🧬 模块化·究极合体战机线',
      branchDyna1: '🖤 警务局绝密突务部队 · 黑色风暴队',
      branchDyna2: '🦅 超级胜利队旗舰 · 三机一体终极合体神鹰'
    },
    // 5. Zen Muyu Sanctuary
    muyu: {
      title: '禅定清修 · 功德堂\n心若冰清 · 天塌不惊 · 敲击木鱼积攒功德与出击整备资金',
      funds: (funds: number) => `功德资金: ${funds} G`,
      tip: '点击桌案木鱼敲击积攒功德 (+1 G / 击)',
      gongdePlus: '功德 +1',
      returnMenu: '◀ 返回主菜单'
    },
    // 6. In-Combat HUD & Combat Tactical Warnings
    battle: {
      rollReady: '战术翻滚: 就绪 [A/D 双击]',
      rollCooldown: (sec: string) => `战术翻滚: 充能中 (${sec}s)`,
      rollInvincible: '战术翻滚: 无敌回避中 ⚡',
      scoreText: (cur: number, target: number) => `积分: ${cur} / ${target}\n目标达成即获胜`,
      bossCarrier: '敌军超重型母舰',
      bossFlagship: '敌军要塞旗舰',
      bossGatanothor: '邪神加坦杰厄',
      pauseTitle: '战术作战暂停',
      resume: '继续作战',
      settings: '音效配置 ⚙️',
      retire: '放弃任务'
    },
    // 6.5 Sound & Audio Settings
    settings: {
      title: '战术控制台 · 系统偏好设置',
      langLabel: '界面语言 / LANGUAGE：',
      zhBtn: '🇨🇳 简体中文',
      enBtn: '🇬🇧 English',
      bgmLabel: '作战背景音乐 (BGM)：',
      sfxLabel: '战术动作音效 (SFX)：',
      testSfx: '🔊 试听音效',
      saveAndClose: '✔ 保存配置并返回'
    },
    credits: {
      title: '【终幕致谢】Yodeeshi 制作团队致意',
      skipPrompt: '点击任意处或按空格/ESC退出致谢 ▶'
    },
    // 7. Mission Debriefing & Results
    victory: {
      title: '作战大捷',
      scoreEarned: (score: number) => `本关战役斩获积分: ${score.toLocaleString()}`,
      fundsAwarded: (funds: number) => `缴获折算战备军费: +${funds} G`,
      unlockedNotice: '新空域航线与机库进阶科技已解锁！',
      continueSortie: '🚀 继续出击',
      returnMenu: '◀ 返回主菜单'
    },
    defeat: {
      title: '战机迫降损毁 · 任务失败',
      desc: '装甲完整度归零，截击任务失败。',
      finalScore: (score: number) => `最终战役得分: ${score.toLocaleString()}`,
      retrySortie: '重新出击',
      returnMenu: '◀ 返回主菜单'
    },
    // 8. Fighter Specifications & Lore
    fighters: {
      0: { name: 'F0-B 天际线', role: '常规初教机', desc: '配备单路高初速航空机炮，机动平稳的初阶教练战机。' },
      1: { name: 'F1-J 猎鹰', role: '极速突击拦截机', desc: '配备双联装机载速射炮，高速俯冲截击利器。' },
      2: { name: 'F2-S 强击者', role: '重装穿甲强击机', desc: '加装防弹钛合金复合装甲与大口径穿甲高爆航炮。' },
      3: { name: 'F3-V 蝰蛇', role: '高机动脉冲截击机', desc: '采用三角翼布局与高频离子脉冲激光发射器。' },
      4: { name: '胜利飞燕1号', role: '胜利飞燕1号 (GUTS主力机)', desc: '《迪迦奥特曼》TPC胜利队双座主力多用途战机。原为民间救援机，因超古代怪兽苏醒由坚村博士紧急武装改装。极速马赫5.5，搭载机翼高频光束炮与针状导弹，机动敏捷。' },
      5: { name: '胜利飞燕2号', role: '胜利飞燕2号 (重装强击机)', desc: '《迪迦奥特曼》TPC胜利队四人座重型战斗机。巡航速度马赫4，装甲厚重。机首具备可展开结构，内部搭载专为歼灭大型怪兽研发的超大功率“德克萨斯光束炮”（Texas Beam）。' },
      6: { name: '胜利飞燕1号A', role: '胜利飞燕1号 特装强化型', desc: '《迪迦奥特曼》后期TPC科研局激进改进型。换装麦格斯动力系统原型高推力引擎，极大突破马赫5.5航速极限，搭载高穿透聚能热线，为后代超级胜利队战机提供了关键先导技术。' },
      7: { name: '胜利飞燕EX-J α', role: '胜利飞燕EX-J α号 (高速突击单元)', desc: '《迪迦奥特曼》第41话登场，大型母机EX-J的前部独立分离单元。乘员1-2人，高空缠斗极度敏捷，核心武装为具备分子级破坏力的“超熔解光线”（Hyper Melt Gun）与追踪热线。' },
      8: { name: '胜利飞燕黑影机', role: '胜利飞燕黑影机 (黑色风暴队专用机)', desc: '【戴拿奥特曼】第49话登场！TPC警务局权藤喜八参谋直属绝密特务部队“黑色风暴队”（Black Buster）专用隐形战机。全黑反侦察涂装，极速超越神鹰号，专为推行“F计划”（人造奥特曼）与特殊拘束任务而生的黑色王牌！' },
      9: { name: '胜利飞燕2号A', role: '胜利飞燕2号 (德克萨斯全开攻坚型)', desc: '《迪迦奥特曼》胜利飞燕2号机首完全展开的终极炮击形态。液压结构锁定全开，全机动力满额注入德克萨斯发生器，能贯穿战场全部敌弹幕，施加摧毁大型怪兽的毁灭性穿甲爆破！' },
      10: { name: '胜利飞燕EX-J β', role: '胜利飞燕EX-J β号 (重装母机单元)', desc: '《迪迦奥特曼》第41话登场，EX-J后部重装核心机体。乘员1-2人，装甲防御极度厚重。装备可瞬间冻结怪兽分子的“超冷冻光线”（Hyper Cold Gun）与重型多管火炮，兼具战术控制与重装掩护。' },
      11: { name: '胜利飞燕EX-J 合体型', role: '胜利飞燕EX-J (完全合体终极型)', desc: '《迪迦奥特曼》TPC胜利队科技巅峰！α号与β号空中精准对接合体。兼备最强重装防御与全弹齐射；充能满额后可激发毁天灭地的金色“麦克斯炮”（MAX Cannon），展现人类捍卫地球的最高科技结晶！' },
      12: { name: '胜利神鹰号', role: '胜利神鹰号 (超级胜利队三机终极合体)', desc: '【戴拿奥特曼】超级胜利队（SUPER GUTS）旗舰核心合体战机！由α号（红色高速截击机）、β号（蓝色强击母机）、γ号（黄色回旋轰炸机）三机空中精准对接。搭载超越时代的麦格斯动力引擎与毁灭级聚能主炮“新麦格斯·龙卷加农”（Tornado Thunder），象征人类迈向宇宙新领域时代的不朽守护神！' }
    },
    // 9. Comic Narrative & Story Cutscenes
    story: {
      skip: '跳过剧情 ⏭',
      next: '点击任意处或按空格继续 ▶',
      end: '点击任意处或按空格结束 ▶',
      p1Title: '【序章漫画】烽火降临 · 全面反击',
      p1Slides: [
        '第 1 幕：战火突降，宁静繁华的城市瞬间沦为焦土。滚滚浓烟遮蔽天日，残破街道上警报凄厉，地面防线艰难穿行于残垣断壁之间……',
        '第 2 幕：跨江大桥断裂坍塌，剧烈的连环爆鸣在空旷广场肆虐。被遗弃的重型装甲车静默横陈，夕阳余晖洒在满目疮痍的钢铁废墟之上……',
        '第 3 幕：古老残破的庙宇门阶前，孤独的孩童在残石上无声抽泣；残破石柱旁，褪色的泰迪熊被弃于荒芜——战火无情碾碎了平静与纯真……',
        '第 4 幕：“NOW！”刺耳的红色一级警报撕裂长空，拦截导弹呼啸升空！战备跑道上引擎狂啸，地勤人员紧急指挥，王牌战鹰全面紧急升空！',
        '第 5 幕：“IT\'S TIME FOR A COUNTERATTACK！”王牌飞行员扣紧头盔，嘴角扬起坚毅无畏的战意。战机迎着血染夕阳呼啸滑跃，誓死夺回人类的苍穹！'
      ],
      m1Title: '【战备简报 01】首次巡逻拦截作战',
      m1Sub: '【战备简报 · 热带雨林空域】雷达侦测到先遣侦察机群（Enemy 1）正企图渗透我方雨林雷达网。击坠敌机积分达到 50 即可达成截击目标！',
      s2Title: '【战后战况】平流层母舰击坠 · 疑云初生',
      s2_1: '第 1 幕：敌军超重型母舰在漫天烈焰中解体坠落！震耳欲聋的殉爆照亮了整片平流层，浓烟与金属残骸在重力井中四散崩解……',
      s2_2: '第 2 幕：操纵台解析了残骸黑匣子——“人类军方绝密频段？！这不可能……被击毁的母舰核心，居然印着己方最高司令部的生产序列号？！”',
      tiga1Title: '【特别行动】光之继承者 · 露露耶前瞻',
      tiga2Title: '【暗黑退散】光芒的纽带',
      tiga2Slides: [
        '第 1 幕：在绝望的焦土之上，胜利队的激光穿透了黑雾，佐加悲鸣着坠落于深渊。',
        '第 2 幕：然而，地平线尽头的海洋深处，更古老的巨大黑暗阴影正在破水而出……',
        '第 3 幕：“即使人类如此渺小……我们也绝不会放弃心中的光芒！”',
        '第 4 幕：那是属于所有人的勇气，是化作光芒战至最后一刻的信念。',
        '第 5 幕：胜利队科技核心解锁！极密整备机库已向王牌飞行员全面开放升级许可！',
        '第 6 幕：胜利飞燕1号与胜利飞燕2号正式列装！整备班随时待命，准备迎接深空决战！'
      ],
      m6Title: '【战备简报 06】小行星带强袭',
      m6Sub: '【深空远征 · 小行星带强袭】突破大气层后，舰队遭遇了潜伏在密集陨石带中的敌方重型护卫群！规避陨石，歼灭先遣机群！目标积分：100。',
      truthTitle: '【觉醒】真相与背叛 · 重返地球',
      truth1: '第 1 幕：战机悬停在敌方要塞残骸前。擦去焦黑的装甲蒙皮，眼前赫然印着地球防空联军的绝密编号——根本没有外星侵略！军方高层制造了这场战争来奴役世界！“我们作为侵略者而来，作为侵略者而胜……”',
      truth2: '第 2 幕：在巨大的痛苦与撕裂中，飞行员毅然做出了抉择——关闭与指挥部的链接，推满油门调转机头，撕开大气层俯冲直扑地球军方大本营！“哪怕背负叛徒之名……我也要守护真正的人类！” (战机充能急救 +50 HP！)',
      finalTitle: '【终局战役】破晓晨星',
      finalSub: (pilot: string) =>
        `侵略要塞的硝烟在黎明中渐渐散去。晨曦的微光洒在伤痕累累的战机机翼上。飞行员脱下头盔，仰望破晓天空中唯一明亮坚定的启明星——\n“Bright star, would I were steadfast as thou art---”\n\n再见，${pilot || '王牌飞行员'}。你选择了最艰难的道路，也守护了真正的黎明。`
    }
  },

  en: {
    // 1. Login
    login: {
      badge: 'AIR COMBAT COMMAND · PILOT AUTHENTICATION SYSTEM',
      title: 'PILOT AUTHENTICATION & SORTIE VERIFICATION',
      subtitle: 'Radar detected unidentified hostile signatures. Verify pilot callsign and language before sortie:',
      langLabel: 'INTERFACE LANGUAGE / 语言选择：',
      zhBtn: '🇨🇳 简体中文',
      enBtn: '🇬🇧 English',
      callsignLabel: 'PILOT CALLSIGN (ARCHIVE INDEX):',
      statsHeader: 'CURRENT PROFILE SERVICE RECORD:',
      statsOverview: (funds: number, high: number, owned: number) =>
        `Defense Funds: ${funds} G   High Score: ${high} PTS   Aircraft in Service: ${owned} / 12`,
      confirmSortie: '🚀 CONFIRM SORTIE',
      guestAccess: '⚡ GUEST FLIGHT'
    },
    // 2. Main Menu
    menu: {
      pilotBadge: (callsign: string, funds: number) => `CALLSIGN: ${callsign}   FUNDS: ${funds} G`,
      switchPilot: 'SWITCH PILOT 👤',
      sortie: 'SORTIE',
      hangar: 'HANGAR',
      stages: 'THEATRE',
      meditation: 'MEDITATION',
      prologue: 'PROLOGUE 📖',
      replayStartup: 'OPENING 🎬',
      medals: 'MEDAL ROOM 🎖️',
      settings: 'SETTINGS ⚙️',
      exitGame: 'EXIT GAME',
      exitPrompt: 'Are you sure you want to quit AirBattle?'
    },
    // 2.5 Medal Room
    medals: {
      title: 'HALL OF VALOR & COMBAT ACHIEVEMENTS',
      subtitle: 'COMBAT RECORDS & CITATIONS',
      toastTitle: '🎖️ CITATION UNLOCKED!',
      victoryBestow: '🎖️ COMBAT CITATION CONFERRED:',
      overview: (unlocked: number, total: number) => `Collection Progress: ${unlocked} / ${total}`,
      buffDesc: (unlocked: number) => `Buff: Armor +${(unlocked * 1.5).toFixed(1)}% | Roll CD -${(unlocked * 0.025).toFixed(2)}s | Funds +${(unlocked * 2)}%${unlocked >= 12 ? ' | Plasma Trail' : ''}`,
      pageText: (cur: number, total: number) => `PAGE ${cur} / ${total}`,
      prevPage: '◀ PREV PAGE',
      nextPage: 'NEXT PAGE ▶',
      returnMenu: '◀ RETURN TO MENU',
      lockedName: '【CLASSIFIED CITATION】',
      lockedDesc: 'Conferred upon fulfilling designated combat tactical objectives.',
      items: [
        { name: '🥇 Sortie Ace', desc: 'Piloted fighter through frontline in Stage 1.' },
        { name: '🥉 GUTS Veteran', desc: 'Pierced frontline defense and sank Floating Carrier.' },
        { name: '🏆 Savior of Earth', desc: 'Cleared all 8 operations, sealing global peace.' },
        { name: '⚡ Barrel Roll Ace', desc: 'Mastered tactical evasions, performed 20 barrel rolls.' },
        { name: '🛡️ Ironclad Pilot', desc: 'Flawless pilot: cleared any mission undamaged.' },
        { name: '💥 Beam Clash', desc: 'Clashed with flagship beam: mashed and shattered laser!' },
        { name: '✨ Tiga\'s Blessing', desc: 'Piloted Tiga-series fighter in Stage 5 to banish dark.' },
        { name: '🛸 EX-J Master', desc: 'Requisitioned ultimate Fighter 11 EX-J Combined.' },
        { name: '🎯 Flank Annihilator', desc: 'Sharpshooter: fully eliminated 3 flank squadrons.' },
        { name: '🧘 Zen Mind', desc: 'Struck wooden fish at Zen Temple over 108 times.' },
        { name: '💰 War Treasury', desc: 'Strategic reserve: personal funds exceeded 10,000 G.' },
        { name: '👑 Lord of the Sky', desc: 'Attained all combat citations, crowned Lord of Sky.' }
      ]
    },
    // 3. Map Select
    map: {
      title: 'TACTICAL AIRSPACE DEPLOYMENT',
      subtitle: 'Select operational theatre to initiate tactical interception',
      passed: 'SECURED',
      unlocked: 'READY',
      locked: 'LOCKED',
      returnMenu: '◀ RETURN TO MENU'
    },
    // 4. Hangar
    hangar: {
      fleetTitle: 'FLEET HANGAR // TACTICAL AIR DEPOT\nGlobal Defense Force Advanced Aircraft Requisition',
      tpcTitle: 'TPC F.A.R.-EAST // TPC RESEARCH ARCHIVES\nTerrestrial Peaceable Consortium · Far East Headquarters R&D Division',
      funds: (funds: number) => `FUNDS: ${funds} G`,
      inService: '★ IN SERVICE',
      equip: 'EQUIP',
      reqPrice: (price: number) => `UNLOCK [${price} G]`,
      reqTpc: (price: number) => `⚡ RESEARCH [${price} G]`,
      lockedPrereq: '🔒 LOCKED',
      needPrereqAlert: 'Prerequisite fighter not yet requisitioned! Please research prerequisite tech first.',
      insufficientFundsAlert: (price: number, cur: number) =>
        `Insufficient defense funds! Requires ${price} G, current balance: ${cur} G.\nEarn funds by clearing stages or meditating at the temple!`,
      switchToTpc: 'SWITCH: TPC TECH TREE 🛸',
      switchToFleet: 'SWITCH: FLEET HANGAR ✈️',
      returnMenu: '◀ RETURN TO MENU',
      page1Tab: '[GUTS] TIGA ERA',
      page2Tab: '[SUPER GUTS] DYNA ERA',
      page1Title: '✦ GUTS ARCHIVES · ULTRAMAN TIGA ERA (PRIMARY FLEET)',
      page2Title: '✦ SUPER GUTS ARCHIVES · NEO FRONTIER DYNA ERA',
      page1Note: 'First-generation TPC defense force, pioneering the Maxima Overdrive engines.',
      page2Note: 'Neo Frontier flagship development line, humanity\'s spearhead into deep space.',
      eagleUnlockCond: '🔓 Eagle Unlock: Unlock all TPC fighters + 1000 G OR Collect all Medals & Citations',
      eagleReqNotMet: 'GUTS Eagle requisition authorization denied!\nMeet either requirement:\n1. Unlock all Tiga-era GUTS fighters and have 1000 G;\n2. Collect all 12 combat medals and citations in the Hall of Fame.',
      branch1: '⚡ HIGH-SPEED INTERCEPTOR LINE',
      branch2: '💥 TEXAS CANNON SIEGE LINE',
      branch3: '🧬 MODULAR SYNTHESIS COMBINED LINE',
      branchDyna1: '🖤 POLICE BUREAU SPECIAL OPS · BLACK BUSTER',
      branchDyna2: '🦅 SUPER GUTS FLAGSHIP · TRI-DOCKING GUTS EAGLE'
    },
    // 5. Zen Meditation
    muyu: {
      title: 'ZEN MEDITATION · MERIT TEMPLE\nInner calm and clarity. Strike the wooden fish to gather merit and sortie funds.',
      funds: (funds: number) => `MERIT: ${funds} G`,
      tip: 'Click wooden fish or press Space to gather merit (+1 G / strike)',
      gongdePlus: 'MERIT +1',
      returnMenu: '◀ RETURN TO MENU'
    },
    // 6. Combat HUD & Alarms
    battle: {
      rollReady: 'ROLL DODGE: READY [Double tap A/D]',
      rollCooldown: (sec: string) => `ROLL DODGE: RECHARGING (${sec}s)`,
      rollInvincible: 'ROLL DODGE: INVINCIBLE ⚡',
      scoreText: (cur: number, target: number) => `SCORE: ${cur} / ${target}\nReach target score to win`,
      bossCarrier: 'TARGET BOSS: CARRIER MOTHERSHIP',
      bossFlagship: 'TARGET BOSS: FORTRESS FLAGSHIP',
      bossGatanothor: 'TARGET BOSS: GATANOTHOR',
      pauseTitle: 'TACTICAL MISSION PAUSED',
      resume: 'RESUME MISSION',
      settings: 'SETTINGS ⚙️',
      retire: 'ABORT MISSION'
    },
    // 6.5 Audio Settings
    settings: {
      title: 'TACTICAL CONSOLE: SYSTEM PREFERENCES',
      langLabel: 'INTERFACE LANGUAGE / 语言选择:',
      zhBtn: '🇨🇳 简体中文',
      enBtn: '🇬🇧 English',
      bgmLabel: 'COMBAT BGM VOLUME:',
      sfxLabel: 'ACTION SFX VOLUME:',
      testSfx: '🔊 TEST SFX',
      saveAndClose: '✔ SAVE & RETURN'
    },
    credits: {
      title: 'SPECIAL THANKS · YODEESHI PRODUCTION TEAM',
      skipPrompt: 'CLICK OR PRESS SPACE / ESC TO EXIT ▶'
    },
    // 7. Victory & Defeat
    victory: {
      title: 'MISSION ACCOMPLISHED',
      scoreEarned: (score: number) => `Combat Score Acquired: ${score.toLocaleString()}`,
      fundsAwarded: (funds: number) => `Defense Funds Granted: +${funds} G`,
      unlockedNotice: 'New tactical airspaces and advanced fighter tech unlocked!',
      continueSortie: '🚀 NEXT SORTIE',
      returnMenu: '◀ RETURN TO MENU'
    },
    defeat: {
      title: 'SIGNAL LOST · MISSION FAILED',
      desc: 'Hull armor compromised. Aircraft forced to withdraw.',
      finalScore: (score: number) => `Final Mission Score: ${score.toLocaleString()}`,
      retrySortie: 'RETRY SORTIE',
      returnMenu: '◀ RETURN TO MENU'
    },
    // 8. Fighters
    fighters: {
      0: { name: 'F0-B SKYLINE', role: 'Basic Trainer Fighter', desc: 'Single-barrel high-velocity cannon. Smooth and balanced trainer.' },
      1: { name: 'F1-J FALCON', role: 'Fast Interceptor', desc: 'Twin autocannons. Designed for high-speed dive and interception.' },
      2: { name: 'F2-S STRIKER', role: 'Heavy Armored Gunship', desc: 'Reinforced titanium armor with heavy armor-piercing autocannons.' },
      3: { name: 'F3-V VIPER', role: 'Agile Pulse Interceptor', desc: 'Delta-wing layout with high-frequency ion pulse beam emitters.' },
      4: { name: 'GUTS WING 01', role: 'GUTS Wing 1 (Standard Multirole)', desc: '[Ultraman Tiga] TPC GUTS flagship two-seater multirole fighter. Originally an unarmed civilian rescue craft, hastily weaponized by Dr. Kashimura after ancient monsters awoke. Top speed Mach 5.5, armed with wingtip laser cannons and needle missiles.' },
      5: { name: 'GUTS WING 02', role: 'GUTS Wing 2 (Heavy Assault)', desc: '[Ultraman Tiga] TPC GUTS four-seater heavy combat craft. Cruising at Mach 4 with reinforced hull armor. Features a split-nose mechanism revealing the devastating monster-annihilating Texas Beam cannon.' },
      6: { name: 'GUTS WING 01A', role: 'GUTS Wing 1A (Custom Advanced)', desc: '[Ultraman Tiga] Late-era TPC R&D custom upgrade. Fitted with high-thrust Maxima prototype engines, shattering the Mach 5.5 barrier. Paved the technological path for Super GUTS\'s next-gen GUTS Eagle.' },
      7: { name: 'GW-EX-J-α', role: 'GUTS Wing EX-J Alpha (Vanguard Unit)', desc: '[Ultraman Tiga, Ep. 41] Separable forward cockpit section of the massive GUTS Wing EX-J. Ultra-agile dogfighter armed with the molecule-disintegrating Hyper Melt Gun and homing heat-ray missiles.' },
      8: { name: 'GUTS SHADOW', role: 'GUTS Shadow (Black Buster Unit)', desc: '[Ultraman Dyna, Ep. 49] Top-secret stealth craft of the Black Buster special forces, led by TPC Police Bureau Director Kihachi Gondo. Black radar-absorbent hull, speeds outmatching GUTS Eagle. Built to enforce the radical "Project F" artificial Ultraman initiative.' },
      9: { name: 'GUTS WING 02A', role: 'GUTS Wing 2A (Full Texas Siege Mode)', desc: '[Ultraman Tiga] Full siege deployment state of GUTS Wing 2. With nose wings completely locked open and core output diverted to the central emitter, its continuous Texas Beam pierces all enemy barrages.' },
      10: { name: 'GW-EX-J-β', role: 'GUTS Wing EX-J Beta (Heavy Mothership Unit)', desc: '[Ultraman Tiga, Ep. 41] Massive rear section and primary power core of GUTS Wing EX-J. Heavily armored, Mach 3 cruiser equipped with the absolute-zero Hyper Cold Gun and broadside artillery to freeze monstrosities.' },
      11: { name: 'GW-EX-J COMBINED', role: 'GUTS Wing EX-J (Ultimate Combined Form)', desc: '[Ultraman Tiga] Apex of TPC human engineering. Alpha and Beta units seamlessly docked in midair. Boasts unmatched armor and full salvo fire; sustained combat charges the catastrophic golden MAX Cannon.' },
      12: { name: 'GUTS EAGLE', role: 'GUTS Eagle Combined (Super GUTS Flagship)', desc: '[Ultraman Dyna] Flagship ultimate tri-docking craft of SUPER GUTS! Composed of Alpha (red speed interceptor), Beta (blue heavy cruiser), and Gamma (yellow bomber). Armed with Neo-Maxima overdrive engines and the devastating Tornado Thunder cannon.' }
    },
    // 9. Story
    story: {
      skip: 'SKIP ⏭',
      next: 'CLICK OR PRESS SPACE TO ADVANCE ▶',
      end: 'CLICK OR PRESS SPACE TO FINISH ▶',
      p1Title: 'PROLOGUE: BAPTISM OF FIRE & COUNTERATTACK',
      p1Slides: [
        'Act 1: Without warning, war tore through the peaceful metropolis, reducing towers to smoking ruins. Camouflage squads patrol cautiously through the shattered streets...',
        'Act 2: River bridges collapsed into waters, massive firestorms ripped through urban squares. Abandoned tanks stood silent as dusk fell over a battered concrete horizon...',
        'Act 3: Before ancient stone ruins, a lonely child weeps in the wreckage. Abandoned teddy bears lie forgotten by crumbling pillars—war has spared neither home nor innocence...',
        'Act 4: "NOW!" Red alert sirens pierce the airfield as missile batteries roar skyward! Jet afterburners ignite in blazing fury as ground crews scramble the combat wings!',
        'Act 5: "IT\'S TIME FOR A COUNTERATTACK!" The ace pilot locks in with an undaunted smile. Engines screaming toward the blood-red sunset, humanity takes back the skies!'
      ],
      m1Title: 'MISSION BRIEFING 01: FIRST PATROL',
      m1Sub: '【MISSION BRIEFING · RAINFOREST SECTOR】Radar detected hostile scout squadrons attempting to breach our radar grid. Reach 50 points to secure airspace!',
      s2Title: 'TACTICAL DEBRIEF: CRACKS IN THE TRUTH',
      s2_1: 'Act 1: The hostile carrier explodes in colossal firestorms! Shockwaves light up the stratosphere as metal debris falls into the gravity well...',
      s2_2: 'Act 2: Cockpit monitors decrypt the black box—"Earth Joint Command encryption frequency?! Impossible... The downed mothership core bears our own supreme command\'s serial numbers?!"',
      tiga1Title: 'SPECIAL OPERATION: INHERITOR OF LIGHT',
      tiga2Title: 'VICTORY OVER DARKNESS: BONDS OF LIGHT',
      tiga2Slides: [
        'Act 1: Above the scorched earth, GUTS laser beams pierced the dark fog, and the Zoiger shrieked as it plummeted into the abyss.',
        'Act 2: Yet, deep beneath the oceans on the horizon, an ancient colossal shadow was rising from the abyss...',
        'Act 3: "Even if humanity is fragile... we will never give up the light within our hearts!"',
        'Act 4: It is the courage belonging to all humanity—the belief to become the light and fight to the very end.',
        'Act 5: GUTS technological core unlocked! The classified hangar is now fully open for upgrade authorization!',
        'Act 6: GUTS WING 01 and GUTS WING 02 officially enter service! The maintenance crew stands by for the final battle!'
      ],
      m6Title: 'MISSION BRIEFING 06: ASTEROID BELT',
      m6Sub: '【ASTEROID RAID】Breaching orbital space, our fleet is ambushed by heavy escort squadrons hidden among asteroids! Evade rocks, destroy hostiles! Goal: 100 PTS.',
      truthTitle: 'THE AWAKENING: RETURN TO EARTH',
      truth1: 'Act 1: Hovering before the destroyed alien fortress, the pilot wipes ash off the wreckage. Beneath it lies Earth Command\'s top-secret crest—there never was an alien invasion! The military fabricated this war to rule humanity! "We came as aggressors. We won as aggressors..."',
      truth2: 'Act 2: In deep anguish, the pilot makes an irrevocable choice—severing communications with command and turning the aircraft around, diving at full throttle straight back to Earth to strike military headquarters! "Even if branded a traitor... I will fight for true humanity!" (Aircraft field repairs +50 HP!)',
      finalTitle: 'EPILOGUE: THE BRIGHT STAR',
      finalSub: (pilot: string) =>
        `Smoke fades into dawn. Golden morning light reflects across scarred wings. Taking off the helmet, the pilot gazes into the solitary steadfast star above the horizon—\n"Bright star, would I were steadfast as thou art---"\n\nFarewell, ${pilot || 'Ace Pilot'}. You walked the hardest path, and guarded humanity's true dawn.`
    }
  }
};
