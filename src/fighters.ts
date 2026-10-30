import { FighterSpec } from './types';

export const FIGHTERS: Record<number, FighterSpec> = {
  0: {
    id: 0,
    name: "F0-B SKYLINE",
    code: "F0-B",
    role: "常规初教机",
    sprite: "assets/sprites/common/fighter0_hd.png",
    width: 90,
    height: 93,
    speed: 5.5,
    maxHp: 100,
    fireCooldown: 28, // ~2.1 shots/sec
    rollCooldown: 300, // 5.0s
    damage: 10,
    bulletType: 0,
    price: 0,
    isGuts: false,
    desc: "配备单路高初速航空机炮，机动平稳的初阶教练战机。"
  },
  1: {
    id: 1,
    name: "F1-J FALCON",
    code: "F1-J",
    role: "急速突击拦截机",
    sprite: "assets/sprites/common/fighter1_hd.png",
    width: 85,
    height: 90,
    speed: 7.0,
    maxHp: 100,
    fireCooldown: 24, // ~2.5 shots/sec
    rollCooldown: 240, // 4.0s
    damage: 12,
    bulletType: 1,
    price: 100,
    isGuts: false,
    desc: "配备双联装机载速射炮，高速俯冲截击利器。"
  },
  2: {
    id: 2,
    name: "F2-S STRIKER",
    code: "F2-S",
    role: "重装穿甲强击机",
    sprite: "assets/sprites/common/fighter2_hd.png",
    width: 115,
    height: 88,
    speed: 8.5,
    maxHp: 170, // Heavy armor HP compensation (150 -> 170)
    fireCooldown: 24,
    rollCooldown: 360, // 6.0s (Heavy armor barrel roll cooldown)
    damage: 22,
    bulletType: 2,
    price: 200,
    isGuts: false,
    desc: "加装防弹钛合金复合装甲与大口径穿甲高爆航炮。"
  },
  3: {
    id: 3,
    name: "F3-V VIPER",
    code: "F3-V",
    role: "高机动脉冲截击机",
    sprite: "assets/sprites/common/fighter3_hd.png",
    width: 110,
    height: 85,
    speed: 10.5,
    maxHp: 120,
    fireCooldown: 20,
    rollCooldown: 210, // 3.5s (Agile interceptor roll cooldown)
    damage: 18,
    bulletType: 3,
    price: 300,
    isGuts: false,
    desc: "采用三角翼布局与高频离子脉冲激光发射器。"
  },
  4: {
    id: 4,
    name: "GUTS WING 01",
    code: "GW-01",
    role: "胜利飞燕1号 (GUTS主力机)",
    sprite: "assets/sprites/common/GW_01_hd.png",
    width: 110,
    height: 90,
    speed: 10.0,
    maxHp: 120,
    fireCooldown: 22,
    rollCooldown: 180, // 3.0s
    damage: 18,
    bulletType: 6,
    price: 0, // Unlocked via Easter Egg
    isGuts: true,
    desc: "《迪迦奥特曼》TPC胜利队双座主力多用途战机。原为民间救援机，因超古代怪兽苏醒由坚村博士紧急武装改装。极速马赫5.5，搭载机翼高频光束炮与针状导弹，机动敏捷。"
  },
  5: {
    id: 5,
    name: "GUTS WING 02",
    code: "GW-02",
    role: "胜利飞燕2号 (重装强击机)",
    sprite: "assets/sprites/common/GW_02_hd.png",
    width: 140,
    height: 115,
    speed: 8.0,
    maxHp: 190, // Heavy artillery armor compensation (160 -> 190)
    fireCooldown: 28,
    rollCooldown: 300, // 5.0s
    damage: 38,
    bulletType: 7,
    price: 0, // Unlocked via Easter Egg
    isGuts: true,
    desc: "《迪迦奥特曼》TPC胜利队四人座重型战斗机。巡航速度马赫4，装甲厚重。机首具备可展开结构，内部搭载专为歼灭大型怪兽研发的超大功率“德克萨斯光束炮”（Texas Beam）。"
  },
  6: {
    id: 6,
    name: "GUTS WING 01A",
    code: "GW-01A",
    role: "胜利飞燕1号 特装强化型",
    sprite: "assets/sprites/common/GW_01A_hd.png",
    width: 110,
    height: 90,
    speed: 11.5,
    maxHp: 130,
    fireCooldown: 20,
    rollCooldown: 150, // 2.5s (High-speed penetration)
    damage: 22,
    bulletType: 6,
    price: 350,
    isGuts: true,
    desc: "《迪迦奥特曼》后期TPC科研局激进改进型。换装麦格斯动力系统原型高推力引擎，极大突破马赫5.5航速极限，搭载高穿透聚能热线，为后代超级胜利队战机提供了关键先导技术。"
  },
  7: {
    id: 7,
    name: "GW-EX-J-α",
    code: "EX-J-α",
    role: "胜利飞燕EX-J α号 (高速突击单元)",
    sprite: "assets/sprites/common/GW-EX-J_alpha_hd.png",
    width: 120,
    height: 90,
    speed: 11.0,
    maxHp: 130,
    fireCooldown: 18,
    rollCooldown: 120, // 2.0s (Elite agility limit)
    damage: 25,
    bulletType: 10,
    price: 450,
    isGuts: true,
    desc: "《迪迦奥特曼》第41话登场，大型母机EX-J的前部独立分离单元。乘员1-2人，高空缠斗极度敏捷，核心武装为具备分子级破坏力的“超熔解光线”（Hyper Melt Gun）与追踪热线。"
  },
  8: {
    id: 8,
    name: "GUTS SHADOW (GS)",
    code: "GS",
    role: "胜利飞燕黑影机 (黑色风暴队专用机)",
    sprite: "assets/sprites/common/GS_hd.png",
    width: 115,
    height: 90,
    speed: 12.5,
    maxHp: 120,
    fireCooldown: 16,
    rollCooldown: 72, // 1.2s (Rapid phantom maneuver cooldown)
    damage: 28,
    bulletType: 8,
    price: 700,
    isGuts: true,
    desc: "【戴拿奥特曼】第49话登场！TPC警务局权藤喜八参谋直属绝密特务部队“黑色风暴队”（Black Buster）专用隐形战机。全黑反侦察涂装，极速超越神鹰号，专为推行“F计划”（人造奥特曼）与特殊拘束任务而生的黑色王牌！"
  },
  9: {
    id: 9,
    name: "GUTS WING 02A",
    code: "GW-02A",
    role: "胜利飞燕2号 (德克萨斯全开攻坚型)",
    sprite: "assets/sprites/common/GW_02A_hd.png",
    width: 140,
    height: 115,
    speed: 8.5,
    maxHp: 220, // Heavy assault armor boost (180 -> 220)
    fireCooldown: 26,
    rollCooldown: 270, // 4.5s
    damage: 48,
    bulletType: 7,
    price: 350,
    isGuts: true,
    desc: "《迪迦奥特曼》胜利飞燕2号机首完全展开的终极炮击形态。液压结构锁定全开，全机动力满额注入德克萨斯发生器，能贯穿战场全部敌弹幕，施加摧毁大型怪兽的毁灭性穿甲爆破！"
  },
  10: {
    id: 10,
    name: "GW-EX-J-β",
    code: "EX-J-β",
    role: "胜利飞燕EX-J β号 (重装母机单元)",
    sprite: "assets/sprites/common/GW-EX-J_beta_hd.png",
    width: 150,
    height: 145,
    speed: 7.5,
    maxHp: 250, // Heavy mothership core armor (200 -> 250)
    fireCooldown: 22,
    rollCooldown: 300, // 5.0s
    damage: 32,
    bulletType: 10,
    price: 500,
    isGuts: true,
    desc: "《迪迦奥特曼》第41话登场，EX-J后部重装核心机体。乘员1-2人，装甲防御极度厚重。装备可瞬间冻结怪兽分子的“超冷冻光线”（Hyper Cold Gun）与重型多管火炮，兼具战术控制与重装掩护。"
  },
  11: {
    id: 11,
    name: "GW-EX-J COMBINED",
    code: "GW-EX-J",
    role: "胜利飞燕EX-J (完全合体终极型)",
    sprite: "assets/sprites/common/GW-EX-J_hd.png",
    width: 155,
    height: 195,
    speed: 9.0,
    maxHp: 280, // Ultimate combined armor boost (240 -> 280)
    fireCooldown: 18, // Adjusted fire rate cadence (16 -> 18)
    rollCooldown: 180, // 3.0s
    damage: 40,
    bulletType: 11,
    price: 600,
    isGuts: true,
    desc: "《迪迦奥特曼》TPC胜利队科技巅峰！α号与β号空中精准对接合体。兼备最强重装防御与全弹齐射；充能满额后可激发毁天灭地的金色“麦克斯炮”（MAX Cannon），展现人类捍卫地球的最高科技结晶！"
  },
  12: {
    id: 12,
    name: "GUTS EAGLE COMBINED",
    code: "GUTS-EAGLE",
    role: "胜利神鹰号 (超级胜利队三机终极合体)",
    sprite: "assets/sprites/common/GUTS_Eagle_hd.png",
    width: 160,
    height: 205,
    speed: 10.5,
    maxHp: 320,
    fireCooldown: 16,
    rollCooldown: 330, // 5.5s (Heavy combined craft balance)
    damage: 50,
    bulletType: 12,
    price: 1000,
    isGuts: true,
    desc: "【戴拿奥特曼】超级胜利队（SUPER GUTS）旗舰核心合体战机！由α号（红色高速截击机）、β号（蓝色强击母机）、γ号（黄色回旋轰炸机）三机在空中精准对接。搭载超越时代的麦格斯动力引擎与毁灭级聚能主炮“新麦格斯·龙卷加农”（Tornado Thunder），象征人类迈向宇宙新领域时代的不朽守护神！"
  }
};
