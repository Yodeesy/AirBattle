
#ifndef GAME_H
#define GAME_H

#define NOMINMAX

#include "Bullet.h"
#include "Enemy.h"
#include "Loading.h"
#include "Music.h"
#include "Player.h"
#include "resource.h"
#include "Story.h"
#include "User.h"
#include <algorithm>
#include <chrono>  
#include <ctime> 
#include <easyx.h> 
#include <graphics.h>
#include <string>
#include <thread>
#include <vector>
#include <windows.h>  

//canvas
#define BG_width 700
#define BG_height 890

//player
#define f0_width 90
#define f0_height 93

#define f1_width 80
#define f1_height 90

#define f2_width 120
#define f2_height 88

#define f3_width 120
#define f3_height 85

#define GW_01_width 120
#define GW_01_height 90

#define GW_02_width 150
#define GW_02_height 120

#define GW_EX_J_beta_width 150
#define GW_EX_J_beta_height 145

#define GW_EX_J_width 150
#define GW_EX_J_height 200

//enemy
#define Enemy_1_width 57
#define Enemy_1_height 51

#define Enemy_2_width 90
#define Enemy_2_height 65

#define Enemy_3_width 100
#define Enemy_3_height 80

#define Boss1_width 222
#define Boss1_height 282

#define Zoiger_width 160
#define Zoiger_height 80

#define Enemy_4_width 60
#define Enemy_4_height 52

#define Enemy_5_width 100
#define Enemy_5_height 88

#define Boss2_width 250
#define Boss2_height 196

#define frame1Width 64          //for spriteSheet1
#define frame1Height 64        //for spriteSheet1

#define frame2Width 36          //for spriteSheet2
#define frame2Height 36        //for spriteSheet2

//resource
IMAGE img_cover;
IMAGE img_menu_bg;            //background
IMAGE img_muyu_bg;
IMAGE img_pause_bg;
IMAGE img_shop_bg1;
IMAGE img_shop_bg2;
IMAGE img_upgrade_bg1;
IMAGE img_upgrade_bg2;

IMAGE img_M1;                //map showed
IMAGE img_M2;
IMAGE img_M3;
IMAGE img_M4;
IMAGE img_M5;
IMAGE img_M6;
IMAGE img_M7;
IMAGE img_M8;

IMAGE img_L1;               //Level background 
IMAGE img_L2;
IMAGE img_L3;
IMAGE img_L4;
IMAGE img_L5_1;
IMAGE img_L5_2;
IMAGE img_L6;
IMAGE img_L7;
IMAGE img_L8;
IMAGE img_L8_2;

IMAGE img_f0;                //player's fighter
IMAGE img_f0_mask;
IMAGE img_f1;
IMAGE img_f1_mask;
IMAGE img_f2;
IMAGE img_f2_mask;
IMAGE img_f3; 
IMAGE img_f3_mask;
IMAGE img_GW_01;
IMAGE img_GW_01_mask;
IMAGE img_GW_02;
IMAGE img_GW_02_mask;
IMAGE img_GW_02_Q;
IMAGE img_GW_02_Q_mask;
IMAGE img_GS;
IMAGE img_GS_mask;
IMAGE img_GW_EX_J;
IMAGE img_GW_EX_J_mask;
IMAGE img_GW_EX_J_��;
IMAGE img_GW_EX_J_��_mask;
IMAGE img_GW_EX_J_��;
IMAGE img_GW_EX_J_��_mask;

IMAGE img_bullet_0;         //bullet
IMAGE img_bullet_0_mask;
IMAGE img_bullet_1;
IMAGE img_bullet_1_mask;
IMAGE img_bullet_2;
IMAGE img_bullet_2_mask;
IMAGE img_bullet_3;
IMAGE img_bullet_3_mask;
IMAGE img_bullet_6;
IMAGE img_bullet_6_mask;
IMAGE img_bullet_7;
IMAGE img_bullet_7_mask;
IMAGE img_bullet_8;
IMAGE img_bullet_9;
IMAGE img_b1;
IMAGE img_MAX;
IMAGE img_Ebullet_1;
IMAGE img_Ebullet_2;
IMAGE img_Ebullet_3;
IMAGE img_Ebullet_3_mask;
IMAGE img_Elight;
IMAGE img_Elight_mask;
IMAGE img_Ebullet_4;
IMAGE img_Efire;
IMAGE img_Efire_mask;
IMAGE img_Ebullet_5;
IMAGE img_Ebullet_5_mask;
IMAGE img_e1_bullet;
IMAGE img_e1_bullet_mask;
IMAGE img_e2_bullet;
IMAGE img_e2_bullet_mask;

IMAGE img_enemy_1;         //enemies' fighters
IMAGE img_enemy_1_mask;
IMAGE img_enemy_2;
IMAGE img_enemy_2_mask;
IMAGE img_enemy_3;
IMAGE img_enemy_3_mask;
IMAGE img_Boss1;
IMAGE img_Boss1_mask;
IMAGE img_Zoiger1;
IMAGE img_Zoiger1_mask;
IMAGE img_Zoiger2;
IMAGE img_Zoiger2_mask;
IMAGE img_enemy_4;
IMAGE img_enemy_4_mask;
IMAGE img_enemy_5;
IMAGE img_enemy_5_mask;
IMAGE img_meteorite;
IMAGE img_meteorite_mask;
IMAGE img_Boss2;
IMAGE img_Boss2_mask;
IMAGE img_e1;
IMAGE img_e1_mask;
IMAGE img_e2;
IMAGE img_e2_mask;
IMAGE img_e3;
IMAGE img_e3_mask;

IMAGE img_boom1;          //explosion
IMAGE img_boom1_mask;
IMAGE img_boom2;
IMAGE img_boom2_mask;
IMAGE img_boom3;
IMAGE img_boom3_mask;
IMAGE img_boom4;
IMAGE spriteSheet1;
IMAGE spriteSheet1_mask;
IMAGE spriteSheet2;
IMAGE spriteSheet2_mask;

IMAGE img_instructions;      //function
IMAGE img_pause;         
IMAGE img_play;
IMAGE img_exit;
IMAGE img_shop;
IMAGE img_dazuo;
IMAGE img_HP;
IMAGE img_score;
IMAGE img_point;
IMAGE img_point_mask;
IMAGE img_fullBar;
IMAGE img_emptyBar;
IMAGE img_upgrade;
IMAGE img_muyu;
IMAGE img_gongde;

static int score = 0;
int Level = 0;
int PointState = 1;
bool first_loading = true;
bool first_Boss = true;
bool BossTime = false;
bool is_Pause = false;
bool is_Win = false;
bool loading_flag = false;
static int F9form = 0;

enum GameState {
    MENU,
    MUYU,
    MAP,
    SHOP,
    UPGRADE,
    PLAY
}; // use GameState to avoid superposition

//price
const int money_f1 = 99;
const int money_f2 = 299;
const int money_f3 = 299;

const int money_u1 = 350;
const int money_u2 = 500;
const int money_u3 = 700;
const int money_u4 = 300;

GameState currentState = MENU;

User user;
std::string username;
Player player;
Enemy* Boss = nullptr;
std::vector<Enemy> enemies;     // ATTENTION! Not include Boss!
std::vector<IMAGE> L4(134);        //L4
std::vector<IMAGE> frames(16);       //explosion frames of Zoiger
std::vector<IMAGE> Bframes(29);     //explosion frames of Boss
std::vector<IMAGE> backgroundImages(10);

bool isMouseOverPlayButton(int x, int y) {
    return (x >= 400 && x <= 580 && y >= 280 && y <= 340);
}

bool isMouseOverExitButton(int x, int y) {
    return (x >= 400 && x <= 580 && y >= 350 && y <= 410);
}

bool isMouseOverPause(int x, int y) {
    return (x >= 450 && x <= 510 && y >= 300 && y <= 345);
}

bool isMouseOverShopButton(int x, int y) {
    return (x >= 550 && x <= 640 && y >= 10 && y <= 100);
}

void init() {
    loadimage(&img_menu_bg, "./res/images/common/menu_bg.png", BG_width, BG_height);                            //bg
    loadimage(&img_muyu_bg, "./res/images/common/muyu_bg.png", BG_width, BG_height);
    loadimage(&img_pause_bg, "./res/images/common/pause_bg.png", BG_width, BG_height);
    loadimage(&img_shop_bg1, "./res/images/common/shop_bg1.png", BG_width, BG_height); 
    loadimage(&img_shop_bg2, "./res/images/common/shop_bg2.png", BG_width, BG_height);
    loadimage(&img_upgrade_bg1, "./res/images/common/upgrade_bg1.png", BG_width, BG_height);
    loadimage(&img_upgrade_bg2, "./res/images/common/upgrade_bg2.png", BG_width, BG_height);

    loadimage(&img_L1, "./res/images/common/L1.jpg", BG_width, BG_height);                   //Level
    loadimage(&img_L2, "./res/images/common/L2.jpg", BG_width, BG_height);
    loadimage(&img_L3, "./res/images/common/L3.jpg", BG_width, BG_height);
    loadimage(&img_L4, "./res/images/common/L4.jpg", BG_width, BG_height);
    loadimage(&img_L5_1, "./res/images/common/L5_1.jpg", BG_width, BG_height);
    loadimage(&img_L5_2, "./res/images/common/L5_2.jpg", BG_width, BG_height);
    loadimage(&img_L6, "./res/images/common/L6.jpg", BG_width, BG_height);
    loadimage(&img_L7, "./res/images/common/L7.jpg", BG_width, BG_height);
    loadimage(&img_L8, "./res/images/common/L8.jpg", BG_width, BG_height);
    loadimage(&img_L8_2, "./res/images/common/L8_2.jpg", BG_width, BG_height);
    backgroundImages = { img_L1, img_L2, img_L3, img_L4, img_L5_1, img_L5_2, img_L6, img_L7, img_L8, img_L8_2 };

    loadimage(&img_f0, "./res/images/common/fighter0.png", f0_width, f0_height);
    loadimage(&img_f0_mask, "./res/images/common/fighter0_mask.png", f0_width, f0_height);
    loadimage(&img_f1, "./res/images/common/fighter1.png", f1_width, f1_height);
    loadimage(&img_f1_mask, "./res/images/common/fighter1_mask.png", f1_width, f1_height);
    loadimage(&img_f2, "./res/images/common/fighter2.png", f2_width, f2_height);                        
    loadimage(&img_f2_mask, "./res/images/common/fighter2_mask.png", f2_width, f2_height);
    loadimage(&img_f3, "./res/images/common/fighter3.png", f3_width, f3_height);
    loadimage(&img_f3_mask, "./res/images/common/fighter3_mask.png", f3_width, f3_height);
    loadimage(&img_GW_01, "./res/images/common/GW_01.png", GW_01_width, GW_01_height);
    loadimage(&img_GW_01_mask, "./res/images/common/GW_01_mask.png", GW_01_width, GW_01_height);
    loadimage(&img_GW_02, "./res/images/common/GW_02.png", GW_02_width, GW_02_height);
    loadimage(&img_GW_02_mask, "./res/images/common/GW_02_mask.png", GW_02_width, GW_02_height);
    loadimage(&img_GW_02_Q, "./res/images/common/GW_02_Q.png", GW_02_width, GW_02_height);
    loadimage(&img_GW_02_Q_mask, "./res/images/common/GW_02_Q_mask.png", GW_02_width, GW_02_height);
    loadimage(&img_GS, "./res/images/common/GS.png", GW_01_width, GW_01_height);
    loadimage(&img_GS_mask, "./res/images/common/GS_mask.png", GW_01_width, GW_01_height);
    loadimage(&img_GW_EX_J, "./res/images/common/GW-EX-J.png", GW_EX_J_width, GW_EX_J_height);
    loadimage(&img_GW_EX_J_mask, "./res/images/common/GW-EX-J_mask.png", GW_EX_J_width, GW_EX_J_height);
    loadimage(&img_GW_EX_J_��, "./res/images/common/GW-EX-J-��.png", GW_EX_J_��_width, GW_EX_J_��_height);
    loadimage(&img_GW_EX_J_��_mask, "./res/images/common/GW-EX-J-��_mask.png", GW_EX_J_��_width, GW_EX_J_��_height);
    loadimage(&img_GW_EX_J_��, "./res/images/common/GW-EX-J-��.png", GW_01_width, GW_01_height);
    loadimage(&img_GW_EX_J_��_mask, "./res/images/common/GW-EX-J-��_mask.png", GW_01_width, GW_01_height);

    loadimage(&img_bullet_0, "./res/images/common/bullet_0.png");
    loadimage(&img_bullet_0_mask, "./res/images/common/bullet_0_mask.png");                                             //bullet
    loadimage(&img_bullet_1, "./res/images/common/bullet_1.png");
    loadimage(&img_bullet_1_mask, "./res/images/common/bullet_1_mask.png");
    loadimage(&img_bullet_2, "./res/images/common/bullet_2.png");
    loadimage(&img_bullet_2_mask, "./res/images/common/bullet_2_mask.png");                                             
    loadimage(&img_bullet_3, "./res/images/common/bullet_3.png");
    loadimage(&img_bullet_3_mask, "./res/images/common/bullet_3_mask.png");
    loadimage(&img_bullet_6, "./res/images/common/bullet_6.png", 20, 60);
    loadimage(&img_bullet_6_mask, "./res/images/common/bullet_6_mask.png", 20, 60);
    loadimage(&img_bullet_7, "./res/images/common/bullet_7.png");
    loadimage(&img_bullet_7_mask, "./res/images/common/bullet_7_mask.png");
    loadimage(&img_bullet_8, "./res/images/common/bullet_8.png");
    loadimage(&img_bullet_9, "./res/images/common/bullet_9.png");
    loadimage(&img_b1, "./res/images/common/b1.png", 9, 25);
    loadimage(&img_MAX, "./res/images/common/MAX.png");
    loadimage(&img_Ebullet_1, "./res/images/common/Ebullet_1.png");
    loadimage(&img_Ebullet_2, "./res/images/common/Ebullet_2.png");
    loadimage(&img_Ebullet_3, "./res/images/common/Ebullet_3.png", 50, 50);
    loadimage(&img_Ebullet_3_mask, "./res/images/common/Ebullet_3_mask.png", 50, 50);
    loadimage(&img_Elight, "./res/images/common/Elight.png", 25, 650);
    loadimage(&img_Elight_mask, "./res/images/common/Elight_mask.png", 25, 650);
    loadimage(&img_Ebullet_4, "./res/images/common/Ebullet_4.png", 15, 30);
    loadimage(&img_Efire, "./res/images/common/Efire.png", 200, 750);
    loadimage(&img_Efire_mask, "./res/images/common/Efire_mask.png", 200, 750);
    loadimage(&img_Ebullet_5, "./res/images/common/Ebullet_5.png", 66, 63);
    loadimage(&img_Ebullet_5_mask, "./res/images/common/Ebullet_5_mask.png", 66, 63);
    loadimage(&img_e1_bullet, "./res/images/common/e1_bullet.png");
    loadimage(&img_e1_bullet_mask, "./res/images/common/e1_bullet_mask.png");
    loadimage(&img_e2_bullet, "./res/images/common/e2_bullet.png");
    loadimage(&img_e2_bullet_mask, "./res/images/common/e2_bullet_mask.png");

    loadimage(&img_enemy_1, "./res/images/common/enemy_1.png", Enemy_1_width, Enemy_1_height);             //enemies
    loadimage(&img_enemy_1_mask, "./res/images/common/enemy_1_mask.png", Enemy_1_width, Enemy_1_height);             
    loadimage(&img_enemy_2, "./res/images/common/enemy_2.png", Enemy_2_width, Enemy_2_height);
    loadimage(&img_enemy_2_mask, "./res/images/common/enemy_2_mask.png", Enemy_2_width, Enemy_2_height);
    loadimage(&img_enemy_3, "./res/images/common/enemy_3.png", Enemy_3_width, Enemy_3_height);
    loadimage(&img_enemy_3_mask, "./res/images/common/enemy_3_mask.png", Enemy_3_width, Enemy_3_height);
    loadimage(&img_Boss1, "./res/images/common/Boss1.png", Boss1_width, Boss1_height);
    loadimage(&img_Boss1_mask, "./res/images/common/Boss1_mask.png", Boss1_width, Boss1_height);
    loadimage(&img_Zoiger1, "./res/images/common/Zoiger1.png", Zoiger_width, Zoiger_height);
    loadimage(&img_Zoiger1_mask, "./res/images/common/Zoiger1_mask.png", Zoiger_width, Zoiger_height);
    loadimage(&img_Zoiger2, "./res/images/common/Zoiger2.png", Zoiger_width, Zoiger_height);
    loadimage(&img_Zoiger2_mask, "./res/images/common/Zoiger2_mask.png", Zoiger_width, Zoiger_height);
    loadimage(&img_enemy_4, "./res/images/common/enemy_4.png", 2 * Enemy_4_width, Enemy_4_height);
    loadimage(&img_enemy_4_mask, "./res/images/common/enemy_4_mask.png", 2 * Enemy_4_width, Enemy_4_height);
    loadimage(&img_enemy_5, "./res/images/common/enemy_5.png", 2 * Enemy_5_width, Enemy_5_height);
    loadimage(&img_enemy_5_mask, "./res/images/common/enemy_5_mask.png", 2 * Enemy_5_width, Enemy_5_height);
    loadimage(&img_meteorite, "./res/images/common/meteorite.png");
    loadimage(&img_meteorite_mask, "./res/images/common/meteorite_mask.png");
    loadimage(&img_Boss2, "./res/images/common/Boss2.png", Boss2_width, Boss2_height);
    loadimage(&img_Boss2_mask, "./res/images/common/Boss2_mask.png", Boss2_width, Boss2_height);
    loadimage(&img_e1, "./res/images/common/e1.png", f2_width, f2_height);
    loadimage(&img_e1_mask, "./res/images/common/e1_mask.png", f2_width, f2_height);
    loadimage(&img_e2, "./res/images/common/e2.png", f3_width, f3_height);
    loadimage(&img_e2_mask, "./res/images/common/e2_mask.png", f3_width, f3_height);
    loadimage(&img_e3, "./res/images/common/e3.png", GW_01_width, GW_01_height);
    loadimage(&img_e3_mask, "./res/images/common/e3_mask.png", GW_01_width, GW_01_height);

    loadimage(&img_instructions, "./res/images/common/instructions.png", 500, 350);                //function
    loadimage(&img_pause, "./res/images/common/pause.png");                                     
    loadimage(&img_play, "./res/images/common/play.png", 180, 60);
    loadimage(&img_exit, "./res/images/common/exit.png", 180, 60);
    loadimage(&img_shop, "./res/images/common/shop.png", 90, 90);
    loadimage(&img_dazuo, "./res/images/common/dazuo.jpg", 50, 50);
    loadimage(&img_HP, "./res/images/common/HP.png", 8, 10);
    loadimage(&img_score, "./res/images/common/score.png", 12, 12);
    loadimage(&img_point, "./res/images/common/point.png", 10, 10);
    loadimage(&img_point_mask, "./res/images/common/point_mask.png", 10, 10);
    loadimage(&img_fullBar, "./res/images/common/fullBar.png", 512, 25);
    loadimage(&img_emptyBar, "./res/images/common/emptyBar.png", 512, 25);
    loadimage(&img_upgrade, "./res/images/common/upgrade.png", 30, 30);
    loadimage(&img_muyu, "./res/images/common/muyu.png", 160, 145);
    loadimage(&img_gongde, "./res/images/common/gongde.png");

    loadimage(&img_boom1, "./res/images/boom/boom1/boom1.png");                              //explosion1
    loadimage(&img_boom1_mask, "./res/images/boom/boom1/boom1_mask.png");
    loadimage(&img_boom2, "./res/images/boom/boom1/boom2.png");
    loadimage(&img_boom2_mask, "./res/images/boom/boom1/boom2_mask.png");
    loadimage(&img_boom3, "./res/images/boom/boom1/boom3.png");
    loadimage(&img_boom3_mask, "./res/images/boom/boom1/boom3_mask.png");
    loadimage(&img_boom4, "./res/images/boom/boom1/boom4.png");
    loadimage(&spriteSheet1, "./res/images/boom/boom3/spriteSheet1.png");
    loadimage(&spriteSheet1_mask, "./res/images/boom/boom3/spriteSheet1_mask.png");
    loadimage(&spriteSheet2, "./res/images/boom/boom3/spriteSheet2.png");
    loadimage(&spriteSheet2_mask, "./res/images/boom/boom3/spriteSheet2_mask.png");

    for (int i = 0; i < 134; ++i) {
        std::ostringstream off;

        off << "./res/images/common/L4/" << "frame_" << std::setw(3) << std::setfill('0') << i << "_delay-0.03s" << ".png";
        loadimage(&L4[i], off.str().c_str(), BG_width, BG_height);
    }

    for (int i = 0; i < 8; ++i) {  
        std::ostringstream oss;
      
        oss << "./res/images/boom/boom2/" << "frame_" << (2 * i) << "_delay-0.1s" << ".png";
        loadimage(&frames[2 * i], oss.str().c_str(), 99, 100);

        // reset oss 
        oss.str("");  
        oss.clear();  
        oss << "./res/images/boom/boom2/" << "frame_" << (2 * i) << "_delay-0.1s_mask" << ".png";
        loadimage(&frames[2 * i + 1], oss.str().c_str(), 99, 100);
    }

    for (int i = 0; i < 29; ++i) {
        std::ostringstream ofs;

        ofs << "./res/images/boom/boom4/" << "frame_" << std::setw(2) << std::setfill('0') << i << "_delay-0.04s" << ".png";
        loadimage(&Bframes[i], ofs.str().c_str());
    }
}

bool isMouseOver_f0(int x, int y) {
    return (x >= 50 && x <= 140 && y >= 200 && y <= 290);
}

bool isMouseOver_f1(int x, int y) {
    return (x >= 150 && x <= 240 && y >= 200 && y <= 290);
}

bool isMouseOver_f2(int x, int y) {
    return (x >= 250 && x <= 370 && y >= 200 && y <= 290);
}

bool isMouseOver_f3(int x, int y) {
    return (x >= 380 && x <= 500 && y >= 200 && y <= 290);
}

bool isMouseOver_GW_01(int x, int y) {
    return (x >= 50 && x <= 170 && y >= 330 && y <= 420);
}

bool isMouseOver_GW_02(int x, int y) {
    return (x >= 180 && x <= 305 && y >= 330 && y <= 430);
}

bool isMouseOverMUYU(int x, int y) {
    return (x >= 200 && x <= 450 && y >= 300 && y <= 620);
}

void muyu() {
    open_muyu();
    play_lian();
    settextcolor(WHITE); // set color 
    bool showGongde = false; // control whether to paint gongde  
    time_t startTime = 0; // begining

    while (currentState == MUYU) {
        BeginBatchDraw();
        putimage(0, 0, &img_muyu_bg);
        putimage(400, 350, &img_exit);
        putimage(200, 300, &img_muyu);
        putimage(4, 20, &img_score);
        std::string message = "Amount:" + std::to_string(user.get_amount());
        outtextxy(15, 15, message.c_str());

        if (MouseHit()) {
            MOUSEMSG msg = GetMouseMsg();
            if (msg.uMsg == WM_LBUTTONDOWN) {
                if (isMouseOverExitButton(msg.x, msg.y)) {
                    currentState = MENU;
                    close_muyu();
                    close_lian();
                    menu();
                }
                else if (isMouseOverMUYU(msg.x, msg.y)) {
                    play_muyu();
                    user.update_amount(1);

                    // begin to record time 
                    showGongde = true;
                    startTime = time(0); 
                }
            }
        }

        if (showGongde) {
            putimage(200, 200, &img_gongde); 
            if (time(0) - startTime >= 0.5) { // after 0.5s 
                showGongde = false; 
            }
        }

        EndBatchDraw();
    }
}

void show1(int type) {
    // use std::to_string to transform an int to a string
    std::string M1 = std::to_string(money_f1);
    std::string M2 = std::to_string(money_f2);
    std::string M3 = std::to_string(money_f3);

    switch (type) {
    case 0:
        // to print the text
        settextcolor(WHITE); // set the color of the text
        outtextxy(79, 298, "Owned");
        break;

    case 1:
        // to print the text
        settextcolor(WHITE); // set the color of the text
        if (user.fighters_owned[1]) {
            outtextxy(180, 296, "Owned");
        }
        else {
            outtextxy(189, 296, M1.c_str());
        }
        break;

    case 2:
        // to print the text
        settextcolor(WHITE); // set the color of the text
        if (user.fighters_owned[2]) {
            outtextxy(289, 290, "Owned");
        }
        else {
            outtextxy(295, 290, M2.c_str());
        }
        break;

    case 3:
        // to print the text
        settextcolor(WHITE); // set the color of the text
        if (user.fighters_owned[3]) {
            outtextxy(414, 290, "Owned");
        }
        else {
            outtextxy(425, 290, M3.c_str());
        }
        break;

    case 4:
        if (user.levels_passed[4]) {
            settextcolor(WHITE);
            outtextxy(85, 425, "Owned");
        }
        break;

    case 5:
        if (user.levels_passed[4]) {
            settextcolor(WHITE);
            outtextxy(219, 440, "Owned");
        }
        break;
    
    }
} // print fighters with its price in the shop

struct Point {
    int x, y;
    int speedX, speedY;
};

Point p0 = { 50, 190, 1, 1 };
Point p1 = { 145, 195, 1, 1 };
Point p2 = { 250, 185, 1, 1 };
Point p3 = { 380, 190, 1, 1 };
Point p4 = { 50, 330, 1, 1 };
Point p5 = { 180, 330, 1, 1 };
Point p6 = { 30, 425, 1, 1 };
Point p7 = { 275, 425, 1, 1 };
Point p8 = { 30, 250, 1, 1 };
Point p9 = { 30, 425, 1, 1 };
Point p10 = { 275, 425, 1, 1 };
Point p11 = { 450, 200, 1, 1 };
Point p12 = { 50, 330, 1, 1 };

void updatePoint(Point& p, int& index) {
    switch (PointState) {
    case 1:
        if (index == 15) {
            p.x += p.speedX;
            index = 0;
        }
        else {
            ++index;
        }
        break;
    case 2:
        if (index == 15) {
            p.y += p.speedY;
            index = 0;
        }
        else {
            ++index;
        }
        break;
    case 3:
        if (index == 15) {
            p.x -= p.speedX;
            index = 0;
        }
        else {
            ++index;
        }
        break;
    case 4:
        if (index == 15) {
            p.y -= p.speedY;
            index = 0;
        }
        else {
            ++index;
        }
        break;
    }
}

void createRectanglePath(int x, int y, int width, int height, Point& p, int& index) {
    updatePoint(p, index);
    putimage(p.x, p.y, &img_point_mask, NOTSRCERASE);
    putimage(p.x, p.y, &img_point, SRCINVERT);

    switch (PointState) {
    case 1:
        if ((p.x + p.speedX) >= (x + width)) {
            PointState = 2;
        }
        break;
    case 2:
        if ((p.y + p.speedY) >= (y + height)) {
            PointState = 3;
        }
        break;
    case 3:
        if ((p.x - p.speedX) <= x) {
            PointState = 4;
        }
        break;
    case 4:
        if ((p.y - p.speedY) <= y) {
            PointState = 1;
        }
        break;
    }
}

void ParticleEffect(int n, int& index) {
    switch (n) {
    case 0:
        createRectanglePath(50, 190, 90, 100, p0, index);
        break;
    case 1:
        createRectanglePath(145, 195, 90, 90, p1, index);
        break;
    case 2:
        createRectanglePath(250, 185, 120, 90, p2, index);
        break;
    case 3:
        createRectanglePath(380, 190, 120, 90, p3, index);
        break;
    case 4:
        createRectanglePath(50, 330, 120, 90, p4, index);
        break;
    case 5:
        createRectanglePath(180, 330, 125, 100, p5, index);
        break;
    case 6:
        createRectanglePath(30, 425, 25, 25, p6, index);
        break;
    case 7:
        createRectanglePath(275, 425, 25, 25, p7, index);
        break;
    case 8:
        createRectanglePath(30, 250, 25, 25, p8, index);
        break;
    case 9:
        createRectanglePath(30, 425, 25, 25, p9, index);
        break;
    case 10:
        createRectanglePath(275, 425, 25, 25, p10, index);
        break;
    case 11:
        createRectanglePath(450, 200, 25, 25, p11, index);
        break;
    case 12:
        createRectanglePath(50, 330, 245, 100, p12, index);
        break;
    }
}

void shop() {
    int index = 0;

    while (currentState == SHOP) {
        BeginBatchDraw();

        cleardevice();

        if (user.levels_passed[4] == true) {
            putimage(0, 0, &img_shop_bg2);
        }
        else {
            putimage(0, 0, &img_shop_bg1);
        }

        show1(0);
        show1(1);
        show1(2);
        show1(3);
        show1(4);
        show1(5);

        if (player.get_type() == 6 || player.get_type() == 7 || player.get_type() == 8) {
            ParticleEffect(4, index);
        }
        else if (player.get_type() == 9 || player.get_type() == 10) {
            ParticleEffect(5, index);
        }
        else if (player.get_type() == 11) {
            ParticleEffect(12, index);
        }
        else {
            ParticleEffect(player.get_type(), index);
        }

        std::string message = "Amount:" + std::to_string(user.get_amount());
        std::string type = "Now you are piloting Fighter" + std::to_string(player.get_type());
        int text_width = textwidth(message.c_str());
        int text_height = textheight(message.c_str());
        int x_position = BG_width - text_width - 10;
        int y_position = 15;
        settextcolor(WHITE); // set the color of the text
        outtextxy(x_position, y_position, message.c_str());
        putimage(x_position - 11, y_position + 5, &img_score);
        outtextxy(10, 15, type.c_str());

        EndBatchDraw();

        if (MouseHit()) {
            MOUSEMSG msg = GetMouseMsg();
            if (msg.uMsg == WM_LBUTTONDOWN) {

                if (isMouseOverExitButton(msg.x, msg.y)) {
                    currentState = MENU;
                    menu();
                }

                else if (isMouseOver_f0(msg.x, msg.y) && user.fighters_owned[0]) {
                    player.set_type(0);
                    MessageBox(NULL, "You choose to pilot F0-B!", "", MB_OK);
                }

                else if (isMouseOver_f1(msg.x, msg.y) && !user.fighters_owned[1] && user.get_amount() >= money_f1) {
                    user.update_amount(-money_f1);
                    user.fighters_owned[1] = true;
                    user.SaveOrUpdateToFile(user);
                    MessageBox(NULL, "Congratulations!", "", MB_OK);
                }

                else if (isMouseOver_f1(msg.x, msg.y) && !user.fighters_owned[1] && user.get_amount() < money_f1) {
                    MessageBox(NULL, "Not enough score!", "Faliure!", MB_OK);
                }

                else if (isMouseOver_f1(msg.x, msg.y) && user.fighters_owned[1]) {
                    player.set_type(1);
                    MessageBox(NULL, "You choose to pilot F1-J!", "", MB_OK);
                }

                else if (isMouseOver_f2(msg.x, msg.y) && !user.fighters_owned[2] && user.get_amount() >= money_f2) {
                    user.update_amount(-money_f2);
                    user.fighters_owned[2] = true;
                    user.SaveOrUpdateToFile(user);
                    MessageBox(NULL, "Congratulations!", "", MB_OK);
                }

                else if (isMouseOver_f2(msg.x, msg.y) && !user.fighters_owned[2] && user.get_amount() < money_f2) {
                    MessageBox(NULL, "Not enough score!", "Faliure!", MB_OK);
                }

                else if (isMouseOver_f2(msg.x, msg.y) && user.fighters_owned[2]) {
                    player.set_type(2);
                    MessageBox(NULL, "You choose to pilot F2-S!", "", MB_OK);
                }

                else if (isMouseOver_f3(msg.x, msg.y) && !user.fighters_owned[3] && user.get_amount() >= money_f3) {
                    user.update_amount(-money_f3);
                    user.fighters_owned[3] = true;
                    user.SaveOrUpdateToFile(user);
                    MessageBox(NULL, "Congratulations!", "", MB_OK);
                }

                else if (isMouseOver_f3(msg.x, msg.y) && !user.fighters_owned[3] && user.get_amount() < money_f3) {
                    MessageBox(NULL, "Not enough score!", "Faliure!", MB_OK);
                }

                else if (isMouseOver_f3(msg.x, msg.y) && user.fighters_owned[3]) {
                    player.set_type(3);
                    MessageBox(NULL, "You choose to pilot F3-V!", "", MB_OK);
                }

                else if (isMouseOver_GW_01(msg.x, msg.y) && user.fighters_owned[4]) {
                    player.set_type(4);
                    MessageBox(NULL, "You choose to pilot GUTS WING-01!", "", MB_OK);
                }

                else if (isMouseOver_GW_02(msg.x, msg.y) && user.fighters_owned[5]) {
                    player.set_type(5);
                    MessageBox(NULL, "You choose to pilot GUTS WING-02!", "", MB_OK);
                }

            }
            else if (msg.uMsg == WM_RBUTTONDOWN) {
                if (isMouseOver_GW_01(msg.x, msg.y) && user.fighters_owned[4]) {
                    // GUTS WING-01  
                    currentState = UPGRADE;
                    upgrade(4);
                }
                else if (isMouseOver_GW_02(msg.x, msg.y) && user.fighters_owned[5]) {
                    //GUTS WING-02
                    currentState = UPGRADE;
                    upgrade(5);
                }
            }
        }
    }
}

bool isMouseOverUpgrade1(int x, int y) {
    return (x >= 30 && x <= 55 && y >= 425 && y <= 450);
}

bool isMouseOverUpgrade2(int x, int y) {
    return (x >= 275 && x <= 300 && y >= 425 && y <= 450);
}

bool isMouseOverUpgrade3(int x, int y) {
    return (x >= 30 && x <= 55 && y >= 250 && y <= 275);
}

bool isMouseOverUpgrade4(int x, int y) {
    return (x >= 450 && x <= 475 && y >= 200 && y <= 225);
}

void upgrade(int type) {
    int index = 0;
    settextcolor(WHITE); // set the color of the text

    if (type == 4) {
        while (currentState == UPGRADE) {
            BeginBatchDraw();
            cleardevice();
            putimage(0, 0, &img_upgrade_bg1);
            putimage(550, 10, &img_shop);
            putimage(30, 425, &img_upgrade);
            putimage(275, 425, &img_upgrade);
            putimage(30, 250, &img_upgrade);
            putimage(450, 200, &img_upgrade);
            putimage(4, 20, &img_score);
            std::string message = "Amount:" + std::to_string(user.get_amount());
            outtextxy(15, 15, message.c_str());
            if(player.get_type() > 5)   ParticleEffect(player.get_type(), index);
            EndBatchDraw();

            if (MouseHit()) {
                MOUSEMSG msg = GetMouseMsg();
                if (msg.uMsg == WM_LBUTTONDOWN) {
                    if (isMouseOverShopButton(msg.x, msg.y)) {
                         currentState = SHOP;
                         shop();
                    }

                    else if (isMouseOverUpgrade1(msg.x, msg.y)) {
                        if (!user.fighters_owned[6]) {
                            if (user.get_amount() >= money_u1) {
                                user.update_amount(-money_u1);
                                user.fighters_owned[6] = true;
                                user.SaveOrUpdateToFile(user);
                                MessageBox(NULL, "Congratulations!", "", MB_OK);
                            }
                            else {
                                MessageBox(NULL, "Not enough score!", "Failure!", MB_OK);
                            }
                        }
                        else {
                            player.set_type(6);
                            MessageBox(NULL, "You choose to pilot GUTS WING-01A!", "", MB_OK);
                        }
                    }

                    else if (isMouseOverUpgrade4(msg.x, msg.y)) {
                        if (!user.fighters_owned[11]) {
                            if (!user.fighters_owned[7] || !user.fighters_owned[10]) {
                                MessageBox(NULL, "You have to own both GUTS WING EX-J-�� and GUTS WING EX-J-��!", "Failure!", MB_OK);
                            }
                            else if (user.get_amount() < money_u4) {
                                MessageBox(NULL, "Not enough score!", "Failure!", MB_OK);
                            }
                            else {
                                user.update_amount(-money_u4);
                                user.fighters_owned[11] = true;
                                user.SaveOrUpdateToFile(user);
                                MessageBox(NULL, "Congratulations!", "", MB_OK);
                            }
                        }
                        else {
                            player.set_type(11);
                            MessageBox(NULL, "You choose to pilot GUTS WING EXTRA JET!", "", MB_OK);
                        }
                    }

                    else if (isMouseOverUpgrade2(msg.x, msg.y)) {
                        if (!user.fighters_owned[7]) {
                            if (user.get_amount() >= money_u2) {
                                user.update_amount(-money_u2);
                                user.fighters_owned[7] = true;
                                user.SaveOrUpdateToFile(user);
                                MessageBox(NULL, "Congratulations!", "", MB_OK);
                            }
                            else {
                                MessageBox(NULL, "Not enough score!", "Failure!", MB_OK);
                            }
                        }
                        else {
                            player.set_type(7);
                            MessageBox(NULL, "You choose to pilot GUTS WING EX-J-��!", "", MB_OK);
                        }
                    }

                    else if (isMouseOverUpgrade3(msg.x, msg.y)) {
                        if (!user.fighters_owned[8]) {
                            if (user.get_amount() < money_u3) {
                                MessageBox(NULL, "Not enough score!", "Failure!", MB_OK);
                            }
                            else if (!user.fighters_owned[6]) {
                                MessageBox(NULL, "Please own GUT WING - 01A first!", "Failure!", MB_OK);
                            }
                            else {
                                user.update_amount(-money_u3);
                                user.fighters_owned[8] = true;
                                user.SaveOrUpdateToFile(user);
                                MessageBox(NULL, "Congratulations!", "", MB_OK);
                            }
                        }
                        else {
                            player.set_type(8);
                            MessageBox(NULL, "You choose to pilot GUTS SHADOW!", "", MB_OK);
                        }
                    }

                }
            }
        }
    }
    else if (type == 5) {
        while (currentState == UPGRADE) {
            BeginBatchDraw();
            cleardevice();
            putimage(0, 0, &img_upgrade_bg2);
            putimage(550, 10, &img_shop);
            putimage(30, 425, &img_upgrade);
            putimage(275, 425, &img_upgrade);
            putimage(450, 200, &img_upgrade);
            std::string message = "Amount:" + std::to_string(user.get_amount());
            outtextxy(15, 15, message.c_str());
            if (player.get_type() > 5 && player.get_type() != 8)   ParticleEffect(player.get_type(), index);
            EndBatchDraw();

            if (MouseHit()) {
                MOUSEMSG msg = GetMouseMsg();
                if (msg.uMsg == WM_LBUTTONDOWN) {
                    if (isMouseOverShopButton(msg.x, msg.y)) {
                        currentState = SHOP;
                        shop();
                    }

                    else if (isMouseOverUpgrade1(msg.x, msg.y)) {
                        if (!user.fighters_owned[9]) {
                            if (user.get_amount() >= money_u1) {
                                user.update_amount(-money_u1);
                                user.fighters_owned[9] = true;
                                user.SaveOrUpdateToFile(user);
                                MessageBox(NULL, "Congratulations!", "", MB_OK);
                            }
                            else {
                                MessageBox(NULL, "Not enough score!", "Failure!", MB_OK);
                            }
                        }
                        else {
                            player.set_type(9);
                            MessageBox(NULL, "You choose to pilot GUTS WING-02A!", "", MB_OK);
                        }
                    }

                    else if (isMouseOverUpgrade2(msg.x, msg.y)) {
                        if (!user.fighters_owned[10]) {
                            if (user.get_amount() >= money_u2) {
                                user.update_amount(-money_u2);
                                user.fighters_owned[10] = true;
                                user.SaveOrUpdateToFile(user);
                                MessageBox(NULL, "Congratulations!", "", MB_OK);
                            }
                            else {
                                MessageBox(NULL, "Not enough score!", "Failure!", MB_OK);
                            }
                        }
                        else {
                            player.set_type(10);
                            MessageBox(NULL, "You choose to pilot GUTS WING EX-J-��!", "", MB_OK);
                        }
                    }

                    else if (isMouseOverUpgrade4(msg.x, msg.y)) {
                        if (!user.fighters_owned[11]) {
                            if (!user.fighters_owned[7] || !user.fighters_owned[10]) {
                                MessageBox(NULL, "You have to own both GUTS WING EX-J-�� and GUTS WING EX-J-��!", "Failure!", MB_OK);
                            }
                            else if (user.get_amount() < money_u4) {
                                MessageBox(NULL, "Not enough score!", "Failure!", MB_OK);
                            }
                            else {
                                user.update_amount(-money_u4);
                                user.fighters_owned[11] = true;
                                user.SaveOrUpdateToFile(user);
                                MessageBox(NULL, "Congratulations!", "", MB_OK);
                            }
                        }
                        else {
                            player.set_type(11);
                            MessageBox(NULL, "You choose to pilot GUTS WING EXTRA JET!", "", MB_OK);
                        }
                    }

                }
            }
        }
    }
}

bool isMouseOver_M1(int x, int y) {
    return (x >= 50 && x <= 130 && y >= 100 && y <= 260);
}

bool isMouseOver_M2(int x, int y) {
    return (x >= 150 && x <= 230 && y >= 100 && y <= 260);
}

bool isMouseOver_M3(int x, int y) {
    return (x >= 250 && x <= 330 && y >= 100 && y <= 260);
}

bool isMouseOver_M4(int x, int y) {
    return (x >= 350 && x <= 430 && y >= 100 && y <= 260);
}

bool isMouseOver_M5(int x, int y) {
    return (x >= 450 && x <= 530 && y >= 100 && y <= 260);
}

bool isMouseOver_M6(int x, int y) {
    return (x >= 50 && x <= 130 && y >= 290 && y <= 450);
}

bool isMouseOver_M7(int x, int y) {
    return (x >= 150 && x <= 230 && y >= 290 && y <= 450);
}

bool isMouseOver_M8(int x, int y) {
    return (x >= 250 && x <= 330 && y >= 290 && y <= 450);
}

void show2(int L) {
    switch (L) {
    case 1:
        putimage(50, 100, &img_M1);
        settextcolor(WHITE); // set the color of the text
        if (user.levels_passed[0]) {
            outtextxy(68, 265, "Passed");
        }
        else {
            outtextxy(78, 265, "New");
        }
        break;

    case 2:
        putimage(150, 100, &img_M2);
        settextcolor(WHITE);
        if (user.levels_passed[1]) {
            outtextxy(168, 265, "Passed");
        }
        else if (user.levels_passed[0] && !user.levels_passed[1]) {
            outtextxy(178, 265, "New");
        }
        else if (!user.levels_passed[0]) {
            outtextxy(168, 265, "Locked");
        }
        break;

    case 3:
        putimage(250, 100, &img_M3);
        settextcolor(WHITE);
        if (user.levels_passed[2]) {
            outtextxy(268, 265, "Passed");
        }
        else if (user.levels_passed[1] && !user.levels_passed[2]) {
            outtextxy(278, 265, "New");
        }
        else if (!user.levels_passed[1]) {
            outtextxy(268, 265, "Locked");
        }
        break;

    case 4:
        putimage(350, 100, &img_M4);
        settextcolor(WHITE);
        if (user.levels_passed[3]) {
            outtextxy(368, 265, "Passed");
        }
        else if (user.levels_passed[2] && !user.levels_passed[3]) {
            outtextxy(378, 265, "New");
        }
        else if (!user.levels_passed[2]) {
            outtextxy(368, 265, "Locked");
        }
        break;

    case 5:
        if (user.levels_passed[2]) {
            settextcolor(WHITE);
            putimage(450, 100, &img_M5);
            if (user.levels_passed[4]) {
                outtextxy(468, 265, "Passed");
            }
            else {
                outtextxy(478, 265, "?");
            }
        }
        break;

    case 6:
        putimage(50, 290, &img_M6);
        settextcolor(WHITE);
        if (user.levels_passed[5]) {
            outtextxy(68, 455, "Passed");
        }
        else if (user.levels_passed[3] && !user.levels_passed[5]) {
            outtextxy(78, 455, "New");
        }
        else if (!user.levels_passed[3]) {
            outtextxy(68, 455, "Locked");
        }
        break;

    case 7:
        putimage(150, 290, &img_M7);
        settextcolor(WHITE);
        if (user.levels_passed[6]) {
            outtextxy(168, 455, "Passed");
        }
        else if (user.levels_passed[5] && !user.levels_passed[6]) {
            outtextxy(178, 455, "New");
        }
        else if (!user.levels_passed[5]) {
            outtextxy(168, 455, "Locked");
        }
        break;

    case 8:
        putimage(250, 290, &img_M8);
        settextcolor(WHITE);
        if (user.levels_passed[7]) {
            outtextxy(268, 455, "Passed");
        }
        else if (user.levels_passed[5] && !user.levels_passed[6]) {
            outtextxy(278, 455, "New");
        }
        else if (!user.levels_passed[5]) {
            outtextxy(268, 455, "Locked");
        }
        break;

    }
}   // print levels and maps

void map() {
    loadimage(&img_M1, "./res/images/common/M1.png", 80, 160);                              //map
    loadimage(&img_M2, "./res/images/common/M2.png", 80, 160);
    loadimage(&img_M3, "./res/images/common/M3.png", 80, 160);
    loadimage(&img_M4, "./res/images/common/M4.png", 80, 160);
    loadimage(&img_M5, "./res/images/common/M5.png", 80, 160);
    loadimage(&img_M6, "./res/images/common/M6.png", 80, 160);
    loadimage(&img_M7, "./res/images/common/M7.png", 80, 160);
    loadimage(&img_M8, "./res/images/common/M8.png", 80, 160);

    while (currentState == MAP) {
        BeginBatchDraw();

        cleardevice();

        putimage(0, 0, &img_pause_bg);
        putimage(400, 350, &img_exit);

        for (int i = 1; i <= 8; ++i) {
            show2(i);
        }

        EndBatchDraw();

        if (MouseHit()) {
            MOUSEMSG msg = GetMouseMsg();
            if (msg.uMsg == WM_LBUTTONDOWN) {

                if (isMouseOverExitButton(msg.x, msg.y)) {
                    currentState = MENU;
                    menu();
                }

                else if (isMouseOver_M1(msg.x, msg.y)) {
                    Level = 1;
                    close_music();
                    currentState = PLAY;
                    for (int i = 0; i < 3; ++i) {
                        enemies.emplace_back(1);
                    }
                    loading();
                    play_BGM();
                    gameLoop();
                }

                else if (isMouseOver_M2(msg.x, msg.y) && user.levels_passed[0]) {
                    Level = 2;
                    close_music();
                    currentState = PLAY;
                    for (int i = 0; i < 3; ++i) {
                        enemies.emplace_back(2);
                    }
                    loading();
                    play_BGM();
                    gameLoop();
                }

                else if (isMouseOver_M3(msg.x, msg.y) && user.levels_passed[1]) {
                    Level = 3;
                    close_music();
                    currentState = PLAY;
                    for (int i = 0; i < 3; ++i) {
                        enemies.emplace_back(3);
                    }
                    loading();
                    play_BGM();
                    gameLoop();
                }

                else if (isMouseOver_M4(msg.x, msg.y) && user.levels_passed[2]) {
                    Level = 4;
                    close_music();
                    currentState = PLAY;
                    enemies.emplace_back(1);
                    enemies.emplace_back(2);
                    enemies.emplace_back(3);
                    loading();
                    story0(1);
                    play_BGM();
                    gameLoop();
                }

                else if (isMouseOver_M5(msg.x, msg.y) && user.levels_passed[2]) {
                    Level = 5;
                    close_music();
                    currentState = PLAY;
                    enemies.emplace_back(5);
                    std::thread V1Thread(Vinit1);   
                    loading();
                    V1Thread.join();
                    story_Tiga_1();

                    gameLoop();
                }


                else if (isMouseOver_M6(msg.x, msg.y) && user.levels_passed[3]) {
                    Level = 6;
                    close_music();
                    currentState = PLAY;
                    for (int i = 0; i < 3; ++i) {
                        enemies.emplace_back(7);
                    }
                    loading();
                    story0(2);
                    play_BGM3();
                    gameLoop();
                }

                else if (isMouseOver_M7(msg.x, msg.y) && user.levels_passed[5]) {
                    Level = 7;
                    close_music();
                    currentState = PLAY;
                    for (int i = 0; i < 3; ++i) {
                        enemies.emplace_back(8);
                    }
                    loading();
                    play_BGM3();
                    gameLoop();
                }

                else if (isMouseOver_M8(msg.x, msg.y) && user.levels_passed[6]) {
                    Level = 8;
                    close_music();
                    currentState = PLAY;
                    for (int i = 0; i < 3; ++i) {
                        enemies.emplace_back(8);
                    }
                    loading();
                    play_BGM3();
                    gameLoop();
                }

            }
        }
    }
}

bool isMouseOverCloseButton(int x, int y) {
    return (x >= 460 && x <= 560 && y >= 550 && y <= 650);
}

bool isMouseOverDazuo(int x, int y) {
    return (x >= 50 && x <= 100 && y >= 50 && y <= 100);
}

void menu() {
    is_Pause = false;  //ensure that when the state is menu it must be not pause
    score = 0; //reset
    Level = 0;  //reset
    is_Win = false;  //reset
    BossTime = false;
    loading_flag = false; //reset
    player.reset();
    play_music();
    while (currentState == MENU) {
        BeginBatchDraw();
        cleardevice();
        putimage(0, 0, &img_menu_bg);
        putimage(550, 10, &img_shop);
        putimage(400, 350, &img_exit);
        putimage(400, 280, &img_play);
        putimage(50, 50, &img_dazuo);

        if(first_loading == true) {
            putimage(60, 550, &img_instructions);
            if (MouseHit()) {
                MOUSEMSG msg = GetMouseMsg();
                if (msg.uMsg == WM_LBUTTONDOWN) {
                    if (isMouseOverCloseButton(msg.x, msg.y)) {
                        first_loading = false;
                    }
                }
            }
        }

        EndBatchDraw();

        if (!first_loading && MouseHit()) {
            MOUSEMSG msg = GetMouseMsg();
            if (msg.uMsg == WM_LBUTTONDOWN) {
                if (isMouseOverExitButton(msg.x, msg.y)) {
                    if (MessageBox(NULL, "Are you sure to exit��", "ATTENTION", MB_YESNO) == IDYES) {
                        delete Boss;
                        enemies.shrink_to_fit();
                        close_music();
                        closegraph();
                        MessageBox(NULL, "Thanks for playing. \n Made by Yodeeshi", "END", MB_OK);
                        exit(0);
                    }
                }
                else if (isMouseOverPlayButton(msg.x, msg.y)) {
                    currentState = MAP;
                    map();
                }
                else if (isMouseOverShopButton(msg.x, msg.y)) {
                    currentState = SHOP;
                    shop();
                }
                else if (isMouseOverDazuo(msg.x, msg.y)) {
                    close_music();
                    currentState = MUYU;
                    muyu();
                }
            }
        }
    }
}

void drawPlayer() {
    switch (player.get_type()) {
    case 0:
        putimage(player.get_x(), player.get_y(), &img_f0_mask, NOTSRCERASE);
        putimage(player.get_x(), player.get_y(), &img_f0, SRCINVERT);
        break;
    case 1:
        putimage(player.get_x(), player.get_y(), &img_f1_mask, NOTSRCERASE);
        putimage(player.get_x(), player.get_y(), &img_f1, SRCINVERT);
        break;
    case 2:
        putimage(player.get_x(), player.get_y(), &img_f2_mask, NOTSRCERASE);
        putimage(player.get_x(), player.get_y(), &img_f2, SRCINVERT);
        break;
    case 3:
        putimage(player.get_x(), player.get_y(), &img_f3_mask, NOTSRCERASE);
        putimage(player.get_x(), player.get_y(), &img_f3, SRCINVERT);
        break;
    case 4:
        putimage(player.get_x(), player.get_y(), &img_GW_01_mask, NOTSRCERASE);
        putimage(player.get_x(), player.get_y(), &img_GW_01, SRCINVERT);
        break;
    case 5:
        putimage(player.get_x(), player.get_y(), &img_GW_02_mask, NOTSRCERASE);
        putimage(player.get_x(), player.get_y(), &img_GW_02, SRCINVERT);
        break;
    case 6:
        putimage(player.get_x(), player.get_y(), &img_GW_01_mask, NOTSRCERASE);
        putimage(player.get_x(), player.get_y(), &img_GW_01, SRCINVERT);
        break;
    case 7:
        putimage(player.get_x(), player.get_y(), &img_GW_EX_J_��_mask, NOTSRCERASE);
        putimage(player.get_x(), player.get_y(), &img_GW_EX_J_��, SRCINVERT);
        break;
    case 8:
        putimage(player.get_x(), player.get_y(), &img_GS_mask, NOTSRCERASE);
        putimage(player.get_x(), player.get_y(), &img_GS, SRCINVERT);
        break;
    case 9:
        if (F9form == 1) {
            putimage(player.get_x(), player.get_y(), &img_GW_02_Q_mask, NOTSRCERASE);
            putimage(player.get_x(), player.get_y(), &img_GW_02_Q, SRCINVERT);
        }
        else if (F9form == 0) {
            putimage(player.get_x(), player.get_y(), &img_GW_02_mask, NOTSRCERASE);
            putimage(player.get_x(), player.get_y(), &img_GW_02, SRCINVERT);
        }
        break;
    case 10:
        putimage(player.get_x(), player.get_y(), &img_GW_EX_J_��_mask, NOTSRCERASE);
        putimage(player.get_x(), player.get_y(), &img_GW_EX_J_��, SRCINVERT);
        break;
    case 11:
        putimage(player.get_x(), player.get_y(), &img_GW_EX_J_mask, NOTSRCERASE);
        putimage(player.get_x(), player.get_y(), &img_GW_EX_J, SRCINVERT);
        break;
    }
}

void drawBullets() {
    for (const Bullet& bullet : player.bullets) {
        if (player.get_isAlive() && bullet.get_isActive()) {
            switch (bullet.get_type()) {
            case 0:
                putimage(bullet.get_x(), bullet.get_y(), &img_bullet_0_mask, NOTSRCERASE);
                putimage(bullet.get_x(), bullet.get_y(), &img_bullet_0, SRCINVERT);
                break;
            case 1:
                putimage(bullet.get_x(), bullet.get_y(), &img_bullet_1_mask, NOTSRCERASE);
                putimage(bullet.get_x(), bullet.get_y(), &img_bullet_1, SRCINVERT);
                break;
            case 2:
                putimage(bullet.get_x(), bullet.get_y(), &img_bullet_2_mask, NOTSRCERASE);
                putimage(bullet.get_x(), bullet.get_y(), &img_bullet_2, SRCINVERT);
                break;
            case 3:
                putimage(bullet.get_x(), bullet.get_y(), &img_bullet_3_mask, NOTSRCERASE);
                putimage(bullet.get_x(), bullet.get_y(), &img_bullet_3, SRCINVERT);
                break;
            case 6:
                putimage(bullet.get_x(), bullet.get_y(), &img_bullet_6_mask, NOTSRCERASE);
                putimage(bullet.get_x(), bullet.get_y(), &img_bullet_6, SRCINVERT);
                break;
            case 7:
                putimage(bullet.get_x(), bullet.get_y(), &img_bullet_7_mask, NOTSRCERASE);
                putimage(bullet.get_x(), bullet.get_y(), &img_bullet_7, SRCINVERT);
                break;
            case 11:
                putimage(bullet.get_x(), bullet.get_y(), &img_bullet_8);
                break;
            case 12:
                putimage(bullet.get_x(), bullet.get_y(), &img_bullet_7_mask, NOTSRCERASE);
                putimage(bullet.get_x(), bullet.get_y(), &img_MAX, SRCINVERT);
                break;
            case 13:
                putimage(bullet.get_x(), bullet.get_y(), &img_bullet_9);
                break;
            case 14:
                putimage(bullet.get_x(), bullet.get_y(), &img_b1);
                break;
            }
        }
    }

    for (const Enemy& enemy : enemies) {
        for (const Bullet& bullet : enemy.bullets) {
            if (enemy.get_isAlive() && bullet.get_isActive()) {
                switch (bullet.get_type()) {
                case 16:
                    putimage(bullet.get_x(), bullet.get_y(), &img_e1_bullet_mask, NOTSRCERASE);
                    putimage(bullet.get_x(), bullet.get_y(), &img_e1_bullet, SRCINVERT);
                    break;
                case 17:
                    putimage(bullet.get_x(), bullet.get_y(), &img_e2_bullet_mask, NOTSRCERASE);
                    putimage(bullet.get_x(), bullet.get_y(), &img_e2_bullet, SRCINVERT);
                    break;
                case 4:
                    putimage(bullet.get_x(), bullet.get_y(), &img_Ebullet_1);
                    break;
                case 5:
                    putimage(bullet.get_x(), bullet.get_y(), &img_Ebullet_2);
                    break;
                case 8:
                    putimage(bullet.get_x(), bullet.get_y(), &img_Ebullet_3_mask, NOTSRCERASE);
                    putimage(bullet.get_x(), bullet.get_y(), &img_Ebullet_3, SRCINVERT);
                    break;
                case 10:
                    putimage(bullet.get_x(), bullet.get_y(), &img_Ebullet_4);
                    break;
                case 18:
                    putimage(bullet.get_x(), bullet.get_y(), &img_b1);
                    break;
                }
            }
        }
    }

    if (Boss != nullptr && BossTime && Boss->get_isAlive()) {
        for (const Bullet& bullet : Boss->bullets) {
            if (bullet.get_isActive()) {
                switch (bullet.get_type()) {
                case 4:
                    putimage(bullet.get_x(), bullet.get_y(), &img_Ebullet_1);
                    break;
                case 5:
                    putimage(bullet.get_x(), bullet.get_y(), &img_Ebullet_2);
                    break;
                case 9:
                    if (Boss->get_type() == 4) {
                        putimage(bullet.get_x(), bullet.get_y(), &img_Elight_mask, NOTSRCERASE);
                        putimage(bullet.get_x(), bullet.get_y(), &img_Elight, SRCINVERT);
                    }
                    else if (Boss->get_type() == 10) {
                        putimage(bullet.get_x(), bullet.get_y(), &img_Efire_mask, NOTSRCERASE);
                        putimage(bullet.get_x(), bullet.get_y(), &img_Efire, SRCINVERT);
                    }
                    break;
                case 10:
                    putimage(bullet.get_x(), bullet.get_y(), &img_Ebullet_4);
                    break;
                case 15:
                    putimage(bullet.get_x(), bullet.get_y(), &img_Ebullet_5_mask, NOTSRCERASE);
                    putimage(bullet.get_x(), bullet.get_y(), &img_Ebullet_5, SRCINVERT);
                    break;
                }
            }
        }
    }
}

void drawFrame(int frameIndex, int Width, int Height, int destX, int destY, int type) {
    // column of the current frame
    int column = frameIndex;

    // ���������Ͻ�����  
    int x = (column - 1) * Width;
    int y = 0;

    // cut and paint
    switch (type) {
    case 1:
        putimage(destX, destY, Width, Height, &spriteSheet1_mask, x, y, NOTSRCERASE);
        putimage(destX, destY, Width, Height, &spriteSheet1, x, y, SRCINVERT);
        break;
    case 2:
        putimage(destX, destY, Width, Height, &spriteSheet2_mask, x, y, NOTSRCERASE);
        putimage(destX, destY, Width, Height, &spriteSheet2, x, y, SRCINVERT);
        break;
    }
}

static int number = 1; //especially for drawing enemy4 and enemy5

void drawEnemies() {
    for (Enemy& enemy : enemies) {
        int x = enemy.get_x(), y = enemy.get_y();

        if (enemy.isExploding()) {
            if (enemy.get_type() == 5 || enemy.get_type() == 6) {

                int frameIndex = enemy.get_explosionFrame() - 1;

                if (frameIndex >= 0 && frameIndex < enemy.explosionFrames) {
                    IMAGE mask = frames[frameIndex * 2];
                    IMAGE image = frames[frameIndex * 2 + 1];
                    putimage(x, y, &mask, NOTSRCERASE);
                    putimage(x, y, &image, SRCINVERT);
                }

            }
            else if (enemy.get_type() == 1) {
                switch (enemy.get_explosionFrame()) {
                case 1:
                    putimage(x, y, &img_boom1_mask, NOTSRCERASE);
                    putimage(x, y, &img_boom1, SRCINVERT);
                    break;
                case 2:
                    putimage(x, y, &img_boom2_mask, NOTSRCERASE);
                    putimage(x, y, &img_boom2, SRCINVERT);
                    break;
                case 3:
                    putimage(x, y, &img_boom3_mask, NOTSRCERASE);
                    putimage(x, y, &img_boom3, SRCINVERT);
                    break;
                case 4: putimage(x, y, &img_boom4); break;
                }
            }
            else if (enemy.get_type() == 2 || enemy.get_type() == 3 || enemy.get_type() == 8 || enemy.get_type() >= 11) {
                drawFrame(enemy.get_explosionFrame(), frame1Width, frame1Height, x, y, 1);
            }
            else if (enemy.get_type() == 7 || enemy.get_type() == 9) {
                drawFrame(enemy.get_explosionFrame(), frame2Width, frame2Height, x, y, 2);
            }
        }
        else if (enemy.get_isAlive()) {
            switch (enemy.get_type()) {
            case 1:
                putimage(x, y, &img_enemy_1_mask, NOTSRCERASE);
                putimage(x, y, &img_enemy_1, SRCINVERT);
                break;
            case 2:
                putimage(x, y, &img_enemy_2_mask, NOTSRCERASE);
                putimage(x, y, &img_enemy_2, SRCINVERT);
                break;
            case 3:
                putimage(x, y, &img_enemy_3_mask, NOTSRCERASE);
                putimage(x, y, &img_enemy_3, SRCINVERT);
                break;
            case 5:
                putimage(x, y, &img_Zoiger1_mask, NOTSRCERASE);
                putimage(x, y, &img_Zoiger1, SRCINVERT);
                break;
            case 6:
                putimage(x, y, &img_Zoiger2_mask, NOTSRCERASE);
                putimage(x, y, &img_Zoiger2, SRCINVERT);
                break;
            case 7:
                if (number < 10) {
                    putimage(x, y, Enemy_4_width, Enemy_4_height, &img_enemy_4_mask, 0, 0, NOTSRCERASE);
                    putimage(x, y, Enemy_4_width, Enemy_4_height, &img_enemy_4, 0, 0, SRCINVERT);
                }
                else if (number > 10 && number < 20) {
                    putimage(x, y, Enemy_4_width, Enemy_4_height, &img_enemy_4_mask, Enemy_4_width, 0, NOTSRCERASE);
                    putimage(x, y, Enemy_4_width, Enemy_4_height, &img_enemy_4, Enemy_4_width, 0, SRCINVERT);
                }
                break;
            case 8:
                if (number < 10) {
                    putimage(x, y, Enemy_5_width, Enemy_5_height, &img_enemy_5_mask, 0, 0, NOTSRCERASE);
                    putimage(x, y, Enemy_5_width, Enemy_5_height, &img_enemy_5, 0, 0, SRCINVERT);
                }
                else if (number > 10 && number < 20) {
                    putimage(x, y, Enemy_5_width, Enemy_5_height, &img_enemy_5_mask, Enemy_5_width, 0, NOTSRCERASE);
                    putimage(x, y, Enemy_5_width, Enemy_5_height, &img_enemy_5, Enemy_5_width, 0, SRCINVERT);
                }
                break;
            case 9:
                putimage(x, y, &img_meteorite_mask, NOTSRCERASE);
                putimage(x, y, &img_meteorite, SRCINVERT);
                break;
            case 11:
                putimage(x, y, &img_e1_mask, NOTSRCERASE);
                putimage(x, y, &img_e1, SRCINVERT);
                break;
            case 12:
                putimage(x, y, &img_e2_mask, NOTSRCERASE);
                putimage(x, y, &img_e2, SRCINVERT);
                break;
            case 13:
                putimage(x, y, &img_e3_mask, NOTSRCERASE);
                putimage(x, y, &img_e3, SRCINVERT);
                break;
            default:
                break;
            }
        }
        // No need to draw dead enemies that are not exploding  
    }
}

void drawBoss(Enemy* Boss) {
    if (Boss != nullptr) {
        if (Boss->isExploding()) {
            putimage(100, Boss->get_y(), &Bframes[Boss->get_explosionFrame() - 1]);
        }
        else if (Boss->get_isAlive()) {
            if (Boss->get_type() == 4) {
                putimage(Boss->get_x(), Boss->get_y(), &img_Boss1_mask, NOTSRCERASE);
                putimage(Boss->get_x(), Boss->get_y(), &img_Boss1, SRCINVERT);
            }
            else if (Boss->get_isAlive()) {
                putimage(Boss->get_x(), Boss->get_y(), &img_Boss2_mask, NOTSRCERASE);
                putimage(Boss->get_x(), Boss->get_y(), &img_Boss2, SRCINVERT);
            }
        }
    }
}

// Init for gameLoop 
float overlapHeight = 10.0f; // Overlap height to hide seams
float mapOffset1 = 0.0f; //current 
float mapOffset2 = overlapHeight - BG_height; // next 
float mapSpeed = 1.0f; // the default speed
bool isMovingForward = false;

constexpr std::chrono::milliseconds switchDelay(500);
std::chrono::steady_clock::time_point lastSwitchTime;

void updatePlayer() {
    // for Player to control his fighter
    if (GetAsyncKeyState(65) & 0x8000 || GetAsyncKeyState(VK_LEFT) & 0x8000) {
        player.move(-player.get_speed(), 0);
    }

    if (GetAsyncKeyState(68) & 0x8000 || GetAsyncKeyState(VK_RIGHT) & 0x8000) {
        player.move(player.get_speed(), 0);
    }

    // Handle Up/Forward Movement
    if (GetAsyncKeyState(87) & 0x8000 || GetAsyncKeyState(VK_UP) & 0x8000) {
        isMovingForward = true;
        player.move(0, -player.get_speed());
        mapSpeed = 2.0f; // Increase speed when moving up
    }
    else {
        if (isMovingForward) { // Only reset speed if it was previously pressed
            isMovingForward = false;
            mapSpeed = 1.0f; // Reset to default speed
        }
    }

    if (GetAsyncKeyState(83) & 0x8000 || GetAsyncKeyState(VK_DOWN) & 0x8000) {
        player.move(0, player.get_speed());
    }

    if (GetAsyncKeyState(VK_SPACE) & 0x8000) {
        if (player.get_type() == 9) {
            player.fireB(player.bullets, F9form);
        }
        else {
            player.fire(player.bullets);
        }
    }

    if (Level < 5 && GetAsyncKeyState(187) & 0x8000) {
        change_BGM();    //next song
    }

    if (player.get_type() == 9 && GetAsyncKeyState(81) & 0x8000) {
        auto currentTime = std::chrono::steady_clock::now();

        auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(currentTime - lastSwitchTime).count();

        // if not trigerring many times in a short time, allow F9 to transform
        if (elapsed >= switchDelay.count()) {
            F9form = F9form == 0 ? 1 : 0; // switch
            lastSwitchTime = currentTime; // update last switch_time
        }
    }
}

void updateAndRemoveInactiveBullets(std::vector<Bullet>& bullets) {
    //update bullets 
    for (Bullet& bullet : bullets) {
        bullet.update();
    }

    // delete inactive bullets
    bullets.erase(std::remove_if(bullets.begin(), bullets.end(),
        [](const Bullet& b) { return !b.get_isActive(); }),
        bullets.end());
}

void updateBullets() {
    updateAndRemoveInactiveBullets(player.bullets);

    for (Enemy& enemy : enemies) {
        updateAndRemoveInactiveBullets(enemy.bullets);
    }

    if (Boss != nullptr) {
        updateAndRemoveInactiveBullets(Boss->bullets);
    }
}

void updateEnemies() {
    // Update existing enemies  
    for (Enemy& enemy : enemies) {
        enemy.update();
    }

    //draw enemy4 and enemy5
    if (Level >= 6) {
        ++number;
        if (number == 20) {
            number = 0;
        }
    }

    // delete destroyed enemies
    enemies.erase(std::remove_if(enemies.begin(), enemies.end(),
        [](const Enemy& e) { return !e.get_isAlive() && e.isExplodingOver(); }),
        enemies.end());

    // Randomly generate an enemy   
    static int frameCount = 0;
    int enemyType = 0;
    if (Level <= 5 && ++frameCount % 30 == 0 && enemies.size() < 5) {  // Every 30 frames attempt to generate an enemy  

        if (Level <= 3) {
            enemyType = Level;  // For Levels 1-3, the enemy type corresponds to the level  
            if (score > 50) {
                is_Win = true;
            }
        }
        else if (Level == 4 && score < 50) {
            enemyType = rand() % 3 + 1;  // Random enemy type between 1-3  
        }
        else if (Level == 5) {
            enemyType = rand() % 2 + 5;  // Random enemy type between 5-6  
            if (score > 70) {
                is_Win = true;
            }
        }
    }

    else if (Level >= 6 && ++frameCount % 20 == 0 && enemies.size() < 7) {// Every 30 frames attempt to generate an enemy  
        if (Level == 6) {
            rand() % 2 == 0 ? enemyType = 7 : enemyType = 9;
            if (score > 99) {
                is_Win = true;
            }
        }

        else if (Level == 7) {
            enemyType = 8;
            if (score > 99) {
                is_Win = true;
            }
        }

        else if (Level == 8 && score <= 200 && !loading_flag) {
            rand() % 2 == 0 ? enemyType = 7 : enemyType = 8;
        }

        else if (Level == 8 && loading_flag) {
            enemyType = rand() % 3 + 11;
            if (score > 450) {
                is_Win = true;
            }
        }

    }

    if (enemyType > 0) {  // Only add an enemy if a valid type was determined  
        enemies.emplace_back(enemyType);
    }

} //Update enemies and decide whether player wins.

void updateBoss(Enemy* Boss) {
    if (Boss != nullptr) {
        Boss -> update();
        Boss->Elight_update(Boss);
    }
}

// Function to check for collisions using Axis-Aligned Bounding Box (AABB)  
bool isColliding(int x1, int y1, int width1, int height1, int x2, int y2, int width2, int height2) {
    return (x1 < x2 + width2 && x1 + width1 > x2 &&
        y1 < y2 + height2 && y1 + height1 > y2);
}

void checkCollisions() {
    // Module 1: Player Bullets Colliding with Enemies or Boss  
    auto checkPlayerBulletsVsEnemiesOrBoss = [&]() {
        for (auto& bullet : player.bullets) {
            if (!bullet.get_isActive()) continue;

            // Check against enemies  
            for (auto& enemy : enemies) {
                if (!enemy.get_isAlive()) continue;
                if (isColliding(bullet.get_x(), bullet.get_y(), 30, 70, // Assuming player bullet size  
                    enemy.get_x(), enemy.get_y(), enemy.get_width(), enemy.get_height())) {
                    if (bullet.get_type() == 12) {
                        enemy.be_hit(bullet.get_attack());
                    } //MAX can pierce enemies
                    else {
                        bullet.be_hit();
                        enemy.be_hit(bullet.get_attack());
                    }
                    if (bullet.get_type() == 11) {
                        enemy.freezed();    //slow enemy
                    }
                    if (enemy.get_HP() <= 0 && enemy.get_type() != 9) {
                        if (Level >= 6) {
                            score += 2;
                        }
                        else {
                            ++score;
                        }
                    }
                }
            }

            // Check against Boss  
            if (Boss != nullptr && Boss->get_isAlive()) {
                if (isColliding(bullet.get_x(), bullet.get_y(), 30, 70, // Assuming player bullet size  
                    Boss->get_x(), Boss->get_y(), Boss->get_width(), Boss->get_height())) {
                    bullet.be_hit();
                    Boss->be_hit(bullet.get_attack());
                }
            }
        }
        };

    // Module 2: Player Colliding with Enemies or Boss  
    auto checkPlayerVsEnemiesOrBoss = [&]() {
        for (auto& enemy : enemies) {
            if (enemy.get_isAlive() && isColliding(player.get_x(), player.get_y(), player.get_width(), player.get_height(),
                enemy.get_x(), enemy.get_y(), enemy.get_width(), enemy.get_height())) {
                player.be_hit(10);
                enemy.be_hit(30);
                if (enemy.get_HP() <= 0 && enemy.get_type() != 9) {
                    if (Level >= 6) {
                        score += 2;
                    }
                    else {
                        ++score;
                    }
                }
                break; // Assuming player can only collide with one enemy at a time  
            }
        }

        if (Boss != nullptr && Boss->get_isAlive()) {
            if (isColliding(player.get_x(), player.get_y(), player.get_width(), player.get_height(),
                Boss->get_x(), Boss->get_y(), Boss->get_width(), Boss->get_height())) {
                player.be_hit(10);
                Boss->be_hit(30);
            }
        }
        };

    // Module 3: Player Colliding with Enemy or Boss Bullets  
    auto checkPlayerVsEnemyOrBossBullets = [&]() {
        for (auto& enemy : enemies) {
            for (auto& enemyBullet : enemy.bullets) {
                if (!enemyBullet.get_isActive()) continue;
                if (enemy.get_type() == 5) {
                    if (isColliding(player.get_x(), player.get_y(), player.get_width(), player.get_height(),
                        enemyBullet.get_x(), enemyBullet.get_y(), 50, 50)) { // Assuming enemy bullet size  
                        player.be_hit(enemyBullet.get_attack());
                        enemyBullet.be_hit();
                    }
                }
                else {
                    if (isColliding(player.get_x(), player.get_y(), player.get_width(), player.get_height(),
                        enemyBullet.get_x(), enemyBullet.get_y(), 5, 11)) { // Assuming enemy bullet size  
                        player.be_hit(enemyBullet.get_attack());
                        enemyBullet.be_hit();
                    }
                }
            }
        }

        if (Boss != nullptr) {
            for (auto& bossBullet : Boss->bullets) {
                if (!bossBullet.get_isActive()) continue;
                if (bossBullet.get_type() != 9 && isColliding(player.get_x(), player.get_y(), player.get_width(), player.get_height(),
                    bossBullet.get_x(), bossBullet.get_y(), 5, 11)) { // Assuming Boss bullet size is same                        
                        player.be_hit(bossBullet.get_attack());
                        bossBullet.be_hit();               
                }
                else if (bossBullet.get_type() == 9 && Boss -> get_type() == 4 && isColliding(player.get_x(), player.get_y(), player.get_width(), player.get_height(),
                    bossBullet.get_x(), bossBullet.get_y(), 25, 650)) { //Elight                        
                    player.be_hit(bossBullet.get_attack());
                    bossBullet.be_hit();
                }
                else if (bossBullet.get_type() == 9 && Boss -> get_type() == 10 && isColliding(player.get_x(), player.get_y(), player.get_width(), player.get_height(),
                    bossBullet.get_x(), bossBullet.get_y(), 200, 750)) { // Efire                       
                    player.be_hit(bossBullet.get_attack());
                    bossBullet.be_hit();
                }
            }
        }
        };

    // Module 4: Player Bullets Colliding with Enemy or Boss Bullets  
    auto checkPlayerBulletsVsEnemyOrBossBullets = [&]() {
        for (auto& playerBullet : player.bullets) {
            if (!playerBullet.get_isActive()) continue;

            for (auto& enemy : enemies) {
                for (auto& enemyBullet : enemy.bullets) {
                    if (!enemyBullet.get_isActive()) continue;
                    if (enemy.get_type() == 5) {
                        if (isColliding(playerBullet.get_x(), playerBullet.get_y(), playerBullet.get_type() == 7 ? 60 : 30, playerBullet.get_type() == 7 ? 128 : 70, // Assuming player bullet size  
                            enemyBullet.get_x(), enemyBullet.get_y(), 50, 50)) { // Assuming enemy bullet size  
                            if (playerBullet.get_type() == 7 || playerBullet.get_type() == 12) {
                                enemyBullet.be_hit();  //Bullets of GW_02 will pierce all of enemies' bullets or Boss's.
                            }
                            else {
                                playerBullet.be_hit();
                                enemyBullet.be_hit();
                            }
                        }
                    }
                    else {
                        if (isColliding(playerBullet.get_x(), playerBullet.get_y(), playerBullet.get_type() == 7 ? 60 : 30, playerBullet.get_type() == 7 ? 128 : 70, // Assuming player bullet size  
                            enemyBullet.get_x(), enemyBullet.get_y(), 5, 11)) { // Assuming enemy bullet size  
                            if (playerBullet.get_type() == 7 || playerBullet.get_type() == 12) {
                                enemyBullet.be_hit();  //Bullets of GW_02 will pierce all of enemies' bullets or Boss's.
                            }
                            else {
                                playerBullet.be_hit();
                                enemyBullet.be_hit();
                            }
                        }
                    }
                }
            }

            if (Boss != nullptr) {
                for (auto& bossBullet : Boss->bullets) {
                    if (!bossBullet.get_isActive()) continue;
                    if (bossBullet.get_type() != 9) {
                        if (isColliding(playerBullet.get_x(), playerBullet.get_y(), 30, 70, // Assuming player bullet size  
                            bossBullet.get_x(), bossBullet.get_y(), 5, 11)) { // Assuming Boss bullet size is same  

                            if (playerBullet.get_type() == 7 || playerBullet.get_type() == 12) {
                                bossBullet.be_hit();  //Bullets of GW_02 and MAX will pierce all of boss's bullets.
                            }
                            else {
                                playerBullet.be_hit();
                                bossBullet.be_hit();
                            }
                        }
                    }
                }
            }
        }
        };

    // Perform all checks  
    checkPlayerBulletsVsEnemiesOrBoss();
    checkPlayerVsEnemiesOrBoss();
    checkPlayerVsEnemyOrBossBullets();
    checkPlayerBulletsVsEnemyOrBossBullets();
}

void if_pause() {
    is_Pause = !is_Pause;
    if (is_Pause) {
        if (Level == 5) {
            pause_Tiga1();
            pause_Tiga2();
        }
        else if (Level < 5) {
            pause_BGM();
        }
        else if (Level > 5) {
            pause_BGM3();
        }
    }
    else {
        if (Level == 5) {
            resume_Tiga1();
            resume_Tiga2();
        }
        else if (Level < 5) {
            resume_BGM();
        }
        else if (Level > 5) {
            resume_BGM3();
        }
    }
}

void display_HP() {
    // use std::to_string to transform an int to a string
    std::string message = "HP:" + std::to_string(player.get_HP());

    // to get the values of the text
    int text_width = textwidth(message.c_str());
    int text_height = textheight(message.c_str());

    // to print the text
    int x_position = BG_width - text_width - 10;
    int y_position = 25;

    settextcolor(WHITE); // set the color of the text
    outtextxy(x_position, y_position, message.c_str()); 
    putimage(x_position - 10, y_position + 5, &img_HP);

    // display Boss1's HP  
    if (Level == 4 && Boss != nullptr && BossTime && !is_Pause) {

        putimage(50, 20, &img_emptyBar);

        float healthPercentage = std::max(Boss->get_HP(), 0) / 1500.0;  // Boss's original HP is 1500  
        int currentBarWidth = static_cast<int>(516 * healthPercentage); // barWidth is 516  

        putimage(50, 20, currentBarWidth, 25, &img_fullBar, 0, 0, SRCCOPY);
    }

    // display Boss2's HP  
    if (Level == 8 && Boss != nullptr && BossTime && !is_Pause && !loading_flag) {

        putimage(50, 20, &img_emptyBar);

        float healthPercentage = std::max(Boss->get_HP(), 0) / 2000.0;  // Boss's original HP is 2000  
        int currentBarWidth = static_cast<int>(516 * healthPercentage); // barWidth is 516  

        putimage(50, 20, currentBarWidth, 25, &img_fullBar, 0, 0, SRCCOPY);
    }
}

void display_score() {
    // use std::to_string to transform an int to a string
    std::string message = "Score:" + std::to_string(score);

    // to get the values of the text
    int text_width = textwidth(message.c_str());
    int text_height = textheight(message.c_str());

    // to print the text
    int x_position = BG_width - text_width - 10;
    int y_position = 10;

    settextcolor(WHITE); // set the color of the text
    outtextxy(x_position, y_position, message.c_str());
    putimage(x_position - 11, y_position + 5, &img_score);
}

static int index = 0; //especially for L4

void drawBackground(int Level, int mapOffset1, int mapOffset2) {
    if (Level < 4) {
        putimage(0, (int)mapOffset1, &backgroundImages[Level - 1]);
        putimage(0, (int)mapOffset2, &backgroundImages[Level - 1]);
    }
    else if (Level == 4) {
        if (!BossTime) {
            putimage(0, 0, &backgroundImages[3]);
        }
        else {
            putimage(0, 0, &L4[index]);
        }
        ++index;
        if (index == 134) index = 0;
    }
    else if (Level == 5) {
        if (score < 50) {
            putimage(0, 0, &backgroundImages[4]);
        }
        else if (score == 50 && !loading_flag) {
            std::thread V2Thread(Vinit2);
            V2Thread.detach();
            loading();
            loading_flag = true;
            if (player.get_type() == 4 || player.get_type() == 5) {
                close_Tiga1();
                play_Tiga2();
            }
        }
        else if (score >= 50) {
            putimage(0, (int)mapOffset1, &backgroundImages[5]);
            putimage(0, (int)mapOffset2, &backgroundImages[5]);
        }
    }
    else if (Level > 5 && Level < 8) {
        putimage(0, (int)mapOffset1, &backgroundImages[Level]);
        putimage(0, (int)mapOffset2, &backgroundImages[Level]);
    }
    else if (Level == 8) {
        if (!loading_flag || (Boss != nullptr && !Boss->isExplodingOver())) {
            putimage(0, (int)mapOffset1, &backgroundImages[8]);
            putimage(0, (int)mapOffset2, &backgroundImages[8]);
        }
        else if (loading_flag){
            putimage(0, (int)mapOffset1, &backgroundImages[9]);
            putimage(0, (int)mapOffset2, &backgroundImages[9]);
        }
    }
}

void gameLoop() {
    while (player.get_isAlive() && !is_Win && currentState == PLAY) {

        if (GetAsyncKeyState(VK_ESCAPE) & 0x8000) {
            if_pause();  //change the state
            Sleep(150); //avoid triggering for too many times
        }

        if (is_Pause && MouseHit()) {
            MOUSEMSG msg = GetMouseMsg();
            if (msg.uMsg == WM_LBUTTONDOWN) {
                if (isMouseOverExitButton(msg.x, msg.y)) {
                    enemies.clear();
                    if (Level < 5) {
                        close_BGM();
                    }
                    else if (Level == 5) {
                        close_Tiga1();
                        close_Tiga2();
                    }
                    else if (Level > 5) {
                        close_BGM3();
                    }
                    currentState = MENU;
                    loading();
                    menu();
                }
                if (isMouseOverPause(msg.x, msg.y)) {
                    if_pause();
                }
            }
        }

        if (!is_Pause) {

            BeginBatchDraw();

            cleardevice();

            // Update map position in the game loop
            mapOffset1 += mapSpeed; // Move the current map down
            mapOffset2 += mapSpeed; // Move the next map down

            // If the current map has completely left the screen, reset its position
            if (mapOffset1 >= BG_height) {
                mapOffset1 = mapOffset2 - BG_height + overlapHeight;
            }

            // If the next map has completely left the screen, reset its position
            if (mapOffset2 >= BG_height) {
                mapOffset2 = mapOffset1 - BG_height + overlapHeight;
            }

            drawBackground(Level, mapOffset1, mapOffset2);

            if (Level == 4 && enemies.empty() && score >= 50 && !BossTime) {
                BossTime = true; 
                attention();
                if (Boss != nullptr) { //ensure Boss is a nullptr
                    delete Boss; // If there has been a Boss, delete it.
                }
                // If Boss is a nullptr or it need to be reset(if_new_Boss is true), create a new Boss.
                 Boss = new Enemy(4);            
            }

            if (Level == 8 && enemies.empty() && score >= 200 && !BossTime) {
                BossTime = true;
                attention();
                if (Boss != nullptr) { //ensure Boss is a nullptr
                    delete Boss; // If there has been a Boss, delete it.
                }
                // If Boss is a nullptr or it need to be reset(if_new_Boss is true), create a new Boss.
                Boss = new Enemy(10);
            }

            // If it is BossTime, draw and update Boss.
            if (Level == 4 && BossTime && Boss != nullptr) {
                if (!Boss->get_isAlive() && Boss -> isExplodingOver()) {
                    score += first_Boss ? 25 : 15; // Less score if it's a new Boss.
                    is_Win = true;
                    first_Boss = false;
                }
                else {
                    drawBoss(Boss);
                    updateBoss(Boss);
                }
            }

            if (Level == 8 && BossTime && Boss != nullptr && !loading_flag) {
                if (!Boss->get_isAlive() && Boss->isExplodingOver()) {
                    score += first_Boss ? 100 : 80; // Less score if it's a new Boss.
                    first_Boss = false;
                    loading_flag = true;
                    close_BGM3();
                    story0(3);
                    loading();
                    player.be_hit(-50);
                    play_BGM3();
                }
                else {
                    drawBoss(Boss);
                    updateBoss(Boss);
                }
            }

            drawPlayer();
            drawBullets();
            drawEnemies();
            updatePlayer();
            updateBullets();
            updateEnemies();
            checkCollisions();
            display_HP();
            display_score();

            EndBatchDraw();
        }
        else {
            // when paused
            BeginBatchDraw();
            cleardevice();
            putimage(0, 0, &img_pause_bg);
            putimage(450, 300, &img_pause);
            putimage(400, 350, &img_exit);
            display_HP();
            display_score();
            EndBatchDraw();
        }

        const int targetFPS = 30;
        const int frameDelay = 1000 / targetFPS;
        Sleep(frameDelay);
    }

    if (player.get_isAlive()) {
        user.levels_passed[Level - 1] = true;
        user.update_amount(score);
        // save the user's information  
        user.SaveOrUpdateToFile(user);
        MessageBox(NULL, "You win!", "", MB_OK);                     //win
        enemies.clear();
        if (Level == 5) {
            story_Tiga_2();
            user.fighters_owned[4] = true;
            user.fighters_owned[5] = true;
        }
        else if (Level < 5) {
            if (Level == 4)  story2();
            close_BGM();
        }
        else if (Level > 5) {
            if (Level == 8) {
                story0(4);
                std::string mes = "Farewell, " + user.get_username();
                MessageBox(NULL, mes.c_str(), "END", MB_OK);
                ending();
            }
            close_BGM3();
        }
        currentState = MENU;
        loading();
        menu();
    }
    else {
        MessageBox(NULL, "Please try again.", "Game Over", MB_OK);           //lose
        enemies.clear();
        if (Level == 5) {
            close_Tiga1();
            close_Tiga2();
        }
        else if (Level < 5 ) {
            close_BGM();
        }
        else if (Level > 5) {
            close_BGM3();
        }
        if (Level == 4 || Level == 5 || Level == 8) {
            failure();
        }
        currentState = MENU;
        loading();
        menu();
    }
}

// dialog 
INT_PTR CALLBACK DialogProc(HWND hDlg, UINT message, WPARAM wParam, LPARAM lParam) {
    loadimage(&img_cover, "./res/images/common/cover.jpg", BG_width, BG_height);
    while (1) {
        BeginBatchDraw();
        putimage(0, 0, &img_cover);
        EndBatchDraw();

        switch (message) {
        case WM_INITDIALOG:
            return (INT_PTR)TRUE;
        case WM_COMMAND:
            if (LOWORD(wParam) == IDOK) {
                // get the username 
                char name[20];
                GetDlgItemText(hDlg, IDC_EDIT_NAME, name, 20);
                MessageBox(NULL, name, "Your name is", MB_OK);
                username = std::string(name);
                EndDialog(hDlg, 0);
                return (INT_PTR)TRUE;
            }
            else if (LOWORD(wParam) == IDCANCEL) {
                EndDialog(hDlg, 0);
                closegraph();
                exit(0);
                return (INT_PTR)TRUE;
            }
            break;
        }
        return (INT_PTR)FALSE;
    }
}

void start(HINSTANCE hInstance) {

    initgraph(BG_width, BG_height, EX_NOCLOSE);
    playSYSU();
    InitFirst();
    logo();
    celebration();
    std::thread S(closeSYSU);
    S.detach();

    //generate a dialog and get the username
    DialogBox(hInstance, MAKEINTRESOURCE(IDD_DIALOG1), NULL, DialogProc);

    std::thread R(Releaser);
    R.detach();

    std::thread InitThread(init);
    InitThread.detach();

    story1();

    loading();

    // Load the user's information  
    user = User::loadFromFile(username);
    std::string A = "Welcome back, " + user.get_username();
    std::string B = "Your amount is " + std::to_string(user.get_amount());
    MessageBox(NULL, A.c_str(), B.c_str(), MB_OK);
    
    menu();

    closegraph();

    exit(0);
}

#endif