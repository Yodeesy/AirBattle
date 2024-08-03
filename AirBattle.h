
#ifndef AIRBATTLE_H
#define AIRBATTLE_H

#include "Bullet.h"
#include "Enemy.h"
#include "Loading.h"
#include "Music.h"
#include "Player.h"
#include "resource.h"
#include "Story.h"
#include "User.h"
#include <easyx.h> 
#include <graphics.h>
#include <string>
#include <vector>
#include <windows.h>  

//canvas
#define BG_width 700
#define BG_height 900

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

//enemy
#define Enemy_1_width 57
#define Enemy_1_height 51

#define Enemy_2_width 90
#define Enemy_2_height 65

#define Enemy_3_width 100
#define Enemy_3_height 80

#define Boss_width 222
#define Boss_height 282

#define Zoiger_width 160
#define Zoiger_height 80

//resource
IMAGE img_cover;
IMAGE img_menu_bg;            //background
IMAGE img_pause_bg;
IMAGE img_shop_bg;

IMAGE img_M1;                //map showed
IMAGE img_M2;
IMAGE img_M3;
IMAGE img_M4;
IMAGE img_M5;

IMAGE img_L1;               //Level background 
IMAGE img_L2;
IMAGE img_L3;
IMAGE img_L4;
IMAGE img_L5_1;
IMAGE img_L5_2;

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

IMAGE img_1;   //fighters displayed
IMAGE img_2;

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
IMAGE img_Ebullet_1;
IMAGE img_Ebullet_2;
IMAGE img_Ebullet_3;
IMAGE img_Ebullet_3_mask;

IMAGE img_enemy_1;         //enemies' fighters
IMAGE img_enemy_1_mask;
IMAGE img_enemy_2;
IMAGE img_enemy_2_mask;
IMAGE img_enemy_3;
IMAGE img_enemy_3_mask;
IMAGE img_Boss;
IMAGE img_Boss_mask;
IMAGE img_Zoiger1;
IMAGE img_Zoiger1_mask;
IMAGE img_Zoiger2;
IMAGE img_Zoiger2_mask;

IMAGE img_boom1;          //explosion
IMAGE img_boom1_mask;
IMAGE img_boom2;
IMAGE img_boom2_mask;
IMAGE img_boom3;
IMAGE img_boom3_mask;
IMAGE img_boom4;

IMAGE img_pause;          //function
IMAGE img_play;
IMAGE img_exit;
IMAGE img_shop;
IMAGE img_HP;
IMAGE img_score;

static int score = 0;
int Level = 0;
bool if_new_Boss = false;
bool BossTime = false;
bool is_Pause = false;
bool is_Win = false;
bool loading_flag = false;

enum GameState {
    MENU,
    MAP,
    SHOP,
    PLAY
}; // use GameState to avoid superposition

//price
const int money_f1 = 99;
const int money_f2 = 299;
const int money_f3 = 299;

GameState currentState = MENU;

User user;
std::string username;
Player player;
Enemy* Boss = nullptr;
std::vector<Enemy> enemies;     // ATTENTION! Not include Boss!

std::vector<IMAGE> frames(9);

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
    loadimage(&img_cover, "./res/cover.jpg", BG_width, BG_height);
    loadimage(&img_menu_bg, "./res/menu_bg.png", BG_width, BG_height);                            //bg
    loadimage(&img_pause_bg, "./res/pause_bg.png", BG_width, BG_height);
    loadimage(&img_shop_bg, "./res/shop_bg.png", BG_width, BG_height); 

    loadimage(&img_f0, "./res/fighter0.png", f0_width, f0_height);
    loadimage(&img_f0_mask, "./res/fighter1_mask.png", f0_width, f0_height);
    loadimage(&img_f1, "./res/fighter1.png", f1_width, f1_height);
    loadimage(&img_f1_mask, "./res/fighter1_mask.png", f1_width, f1_height);
    loadimage(&img_f2, "./res/fighter2.png", f2_width, f2_height);                        
    loadimage(&img_f2_mask, "./res/fighter2_mask.png", f2_width, f2_height);
    loadimage(&img_f3, "./res/fighter3.png", f3_width, f3_height);
    loadimage(&img_f3_mask, "./res/fighter3_mask.png", f3_width, f3_height);
    loadimage(&img_GW_01, "./res/GW_01.png", GW_01_width, GW_01_height);
    loadimage(&img_GW_01_mask, "./res/GW_01_mask.png", GW_01_width, GW_01_height);
    loadimage(&img_GW_02, "./res/GW_02.png", GW_02_width, GW_02_height);
    loadimage(&img_GW_02_mask, "./res/GW_02_mask.png", GW_02_width, GW_02_height);

    loadimage(&img_bullet_0, "./res/bullet_0.png");
    loadimage(&img_bullet_0_mask, "./res/bullet_0_mask.png");                                             //bullet
    loadimage(&img_bullet_1, "./res/bullet_1.png");
    loadimage(&img_bullet_1_mask, "./res/bullet_1_mask.png");
    loadimage(&img_bullet_2, "./res/bullet_2.png");
    loadimage(&img_bullet_2_mask, "./res/bullet_2_mask.png");                                             
    loadimage(&img_bullet_3, "./res/bullet_3.png");
    loadimage(&img_bullet_3_mask, "./res/bullet_3_mask.png");
    loadimage(&img_bullet_6, "./res/bullet_6.png", 20, 60);
    loadimage(&img_bullet_6_mask, "./res/bullet_6_mask.png", 20, 60);
    loadimage(&img_bullet_7, "./res/bullet_7.png");
    loadimage(&img_bullet_7_mask, "./res/bullet_7_mask.png");
    loadimage(&img_Ebullet_1, "./res/Ebullet_1.png");
    loadimage(&img_Ebullet_2, "./res/Ebullet_2.png");
    loadimage(&img_Ebullet_3, "./res/Ebullet_3.png", 50, 50);
    loadimage(&img_Ebullet_3_mask, "./res/Ebullet_3_mask.png", 50, 50);

    loadimage(&img_enemy_1, "./res/enemy_1.png", Enemy_1_width, Enemy_1_height);             //enemies
    loadimage(&img_enemy_1_mask, "./res/enemy_1_mask.png", Enemy_1_width, Enemy_1_height);             
    loadimage(&img_enemy_2, "./res/enemy_2.png", Enemy_2_width, Enemy_2_height);
    loadimage(&img_enemy_2_mask, "./res/enemy_2_mask.png", Enemy_2_width, Enemy_2_height);
    loadimage(&img_enemy_3, "./res/enemy_3.png", Enemy_3_width, Enemy_3_height);
    loadimage(&img_enemy_3_mask, "./res/enemy_3_mask.png", Enemy_3_width, Enemy_3_height);
    loadimage(&img_Boss, "./res/Boss.png", Boss_width, Boss_height);
    loadimage(&img_Boss_mask, "./res/Boss_mask.png", Boss_width, Boss_height);
    loadimage(&img_Zoiger1, "./res/Zoiger1.png", Zoiger_width, Zoiger_height);
    loadimage(&img_Zoiger1_mask, "./res/Zoiger1_mask.png", Zoiger_width, Zoiger_height);
    loadimage(&img_Zoiger2, "./res/Zoiger2.png", Zoiger_width, Zoiger_height);
    loadimage(&img_Zoiger2_mask, "./res/Zoiger2_mask.png", Zoiger_width, Zoiger_height);

    loadimage(&img_pause, "./res/pause.png");                                     //function
    loadimage(&img_play, "./res/play.png", 180, 60);
    loadimage(&img_exit, "./res/exit.png", 180, 60);
    loadimage(&img_shop, "./res/shop.png", 90, 90);
    loadimage(&img_HP, "./res/HP.png", 8, 10);
    loadimage(&img_score, "./res/score.png", 12, 12);

    loadimage(&img_boom1, "./boom/boom1/boom1.png");                              //explosion1
    loadimage(&img_boom1_mask, "./boom/boom1/boom1_mask.png");
    loadimage(&img_boom2, "./boom/boom1/boom2.png");
    loadimage(&img_boom2_mask, "./boom/boom1/boom2_mask.png");
    loadimage(&img_boom3, "./boom/boom1/boom3.png");
    loadimage(&img_boom3_mask, "./boom/boom1/boom3_mask.png");
    loadimage(&img_boom4, "./boom/boom1/boom4.png");

    for (int i = 0; i < 9; ++i) {
        std::ostringstream oss;
        oss << "./boom/boom2/" << "frame_" << i << "_delay-0.1s" << ".png";
        loadimage(&frames[i], oss.str().c_str(), 100, 100);
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


void show1(int type) {
    // use std::to_string to transform an int to a string
    std::string M1 = std::to_string(money_f1);
    std::string M2 = std::to_string(money_f2);
    std::string M3 = std::to_string(money_f3);

    switch (type) {
    case 0:
        // to print the text
        settextcolor(WHITE); // set the color of the text
        outtextxy(79, 190, "F0_b");
        outtextxy(79, 300, "Owned");
        break;

    case 1:
        // to print the text
        settextcolor(WHITE); // set the color of the text
        outtextxy(184, 190, "F1_j");
        if (user.fighters_owned[1]) {
            outtextxy(180, 300, "Owned");
        }
        else {
            outtextxy(189, 300, M1.c_str());
        }
        break;

    case 2:
        // to print the text
        settextcolor(WHITE); // set the color of the text
        outtextxy(289, 190, "F2_s");
        if (user.fighters_owned[2]) {
            outtextxy(289, 300, "Owned");
        }
        else {
            outtextxy(289, 300, M2.c_str());
        }
        break;

    case 3:
        // to print the text
        settextcolor(WHITE); // set the color of the text
        outtextxy(414, 190, "F3_v");
        if (user.fighters_owned[3]) {
            outtextxy(414, 300, "Owned");
        }
        else {
            outtextxy(389, 300, M3.c_str());
        }
        break;

    case 4:
        if (user.levels_passed[4]) {
            loadimage(&img_1, "./res/1.png", 120, 90);
            putimage(50, 330, &img_1);
            settextcolor(WHITE);
            outtextxy(79, 320, "GW_01");
            outtextxy(79, 430, "Owned");
        }
        break;

    case 5:
        if (user.levels_passed[4]) {
            loadimage(&img_2, "./res/2.png", 125, 100);
            putimage(180, 330, &img_2);
            settextcolor(WHITE);
            outtextxy(219, 320, "GW_02");
            outtextxy(219, 440, "Owned");
        }
        break;
    
    }
} // print fighters with its price in the shop

void shop() {
 
    while (currentState == SHOP) {
        BeginBatchDraw();

        putimage(0, 0, &img_shop_bg);
        putimage(400, 350, &img_exit);

        show1(0);
        show1(1);
        show1(2);
        show1(3);
        show1(4);
        show1(5);

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
                    MessageBox(NULL, "You choose to pilot F0_b!", "", MB_OK);
                }
                else if (isMouseOver_f1(msg.x, msg.y) && !user.fighters_owned[1] && user.get_amount() >= money_f1) {
                    user.update_amount(-money_f1);
                    user.fighters_owned[1] = true;
                    user.SaveOrUpdateToFile(user);
                    MessageBox(NULL, "Congratulations!", "", MB_OK);
                }
                else if (isMouseOver_f1(msg.x, msg.y) && user.fighters_owned[1]) {
                    player.set_type(1);
                    MessageBox(NULL, "You choose to pilot F1_j!", "", MB_OK);
                }
                else if (isMouseOver_f2(msg.x, msg.y) && !user.fighters_owned[2] && user.get_amount() >= money_f2) {
                    user.update_amount(-money_f2);
                    user.fighters_owned[2] = true;
                    user.SaveOrUpdateToFile(user);
                    MessageBox(NULL, "Congratulations!", "", MB_OK);
                }
                else if (isMouseOver_f2(msg.x, msg.y) && user.fighters_owned[2]) {
                    player.set_type(2);
                    MessageBox(NULL, "You choose to pilot F2_s!", "", MB_OK);
                }
                else if (isMouseOver_f3(msg.x, msg.y) && !user.fighters_owned[3] && user.get_amount() >= money_f3) {
                    user.update_amount(-money_f3);
                    user.fighters_owned[3] = true;
                    user.SaveOrUpdateToFile(user);
                    MessageBox(NULL, "Congratulations!", "", MB_OK);
                }
                else if (isMouseOver_f3(msg.x, msg.y) && user.fighters_owned[3]) {
                    player.set_type(3);
                    MessageBox(NULL, "You choose to pilot F3_v!", "", MB_OK);
                }
                else if (isMouseOver_GW_01(msg.x, msg.y) && user.fighters_owned[4]) {
                    player.set_type(4);
                    MessageBox(NULL, "You choose to pilot GW_01!", "", MB_OK);
                }
                else if (isMouseOver_GW_02(msg.x, msg.y) && user.fighters_owned[5]) {
                    player.set_type(5);
                    MessageBox(NULL, "You choose to pilot GW_02!", "", MB_OK);
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
        if (user.levels_passed[3]) {
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

    }
}   // print levels and maps

void map() {
    cleardevice();
    loadimage(&img_M1, "./res/M1.png", 80, 160);                              //map
    loadimage(&img_M2, "./res/M2.png", 80, 160);
    loadimage(&img_M3, "./res/M3.png", 80, 160);
    loadimage(&img_M4, "./res/M4.png", 80, 160);
    loadimage(&img_M5, "./res/M5.png", 80, 160);

    while (currentState == MAP) {
        BeginBatchDraw();

        putimage(0, 0, &img_pause_bg);
        putimage(400, 350, &img_exit);
        show2(1);
        show2(2);
        show2(3);
        show2(4);
        show2(5);

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
                    play_BGM();
                    gameLoop();
                }

                else if (isMouseOver_M5(msg.x, msg.y) && user.levels_passed[3]) {
                    Level = 5;
                    close_music();
                    currentState = PLAY;
                    for (int i = 0; i < 2; ++i) {
                        enemies.emplace_back(5);
                    }
                    loading();
                    Vinit1();
                    story_Tiga_1();
                    gameLoop();
                }

            }
        }
    }
}

void menu() {
    is_Pause = false;  //ensure that when the state is menu it must be not pause
    score = 0; //reset
    Level = 0;  //reset
    is_Win = false;  //reset
    loading_flag = false; //reset
    player.reset();
    cleardevice();
    play_music();
    while (currentState == MENU) {
        BeginBatchDraw();
        putimage(0, 0, &img_menu_bg);
        putimage(550, 10, &img_shop);
        putimage(400, 350, &img_exit);
        putimage(400, 280, &img_play);
        EndBatchDraw();

        if (MouseHit()) {
            MOUSEMSG msg = GetMouseMsg();
            if (msg.uMsg == WM_LBUTTONDOWN) {
                if (isMouseOverExitButton(msg.x, msg.y)) {
                    if (MessageBox(NULL, "Are you sure to exit£¿", "ATTENTION", MB_YESNO) == IDYES) {
                        delete Boss;
                        close_music();
                        closegraph();
                        MessageBox(NULL, "Thanks for playing. \n made by Yodeeshi", "END", MB_OK);
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
    }
}

void drawBullets() {
    for (const Bullet& bullet : player.bullets) {
        if (bullet.get_isActive()) {
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
            }
        }
    }

    for (const Enemy& enemy : enemies) {
        for (const Bullet& bullet : enemy.bullets) {
            if (bullet.get_isActive()) {
                switch (bullet.get_type()) {
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
                }
            }
        }
    }

    if (Boss != nullptr) {
        for (const Bullet& bullet : Boss->bullets) {
            if (bullet.get_isActive()) {
                switch (bullet.get_type()) {
                case 4:
                    putimage(bullet.get_x(), bullet.get_y(), &img_Ebullet_1);
                    break;
                case 5:
                    putimage(bullet.get_x(), bullet.get_y(), &img_Ebullet_2);
                    break;
                }
            }
        }
    }
}

void drawEnemies() {
    for (Enemy& enemy : enemies) {
        if (enemy.isExploding()) {
            if (enemy.get_type() == 5 || enemy.get_type() == 6) {
                switch (enemy.get_explosionFrame()) {
                case 1: putimage(enemy.get_x(), enemy.get_y(), &frames[0]); break;
                case 2: putimage(enemy.get_x(), enemy.get_y(), &frames[1]); break;
                case 3: putimage(enemy.get_x(), enemy.get_y(), &frames[2]); break;
                case 4: putimage(enemy.get_x(), enemy.get_y(), &frames[3]); break;
                case 5: putimage(enemy.get_x(), enemy.get_y(), &frames[4]); break;
                case 6: putimage(enemy.get_x(), enemy.get_y(), &frames[5]); break;
                case 7: putimage(enemy.get_x(), enemy.get_y(), &frames[6]); break;
                case 8: putimage(enemy.get_x(), enemy.get_y(), &frames[7]); break;
                case 9: putimage(enemy.get_x(), enemy.get_y(), &frames[8]); break;
                }
            }
            else {
                switch (enemy.get_explosionFrame()) {
                case 1:
                    putimage(enemy.get_x(), enemy.get_y(), &img_boom1_mask, NOTSRCERASE);
                    putimage(enemy.get_x(), enemy.get_y(), &img_boom1, SRCINVERT);
                    break;
                case 2:
                    putimage(enemy.get_x(), enemy.get_y(), &img_boom2_mask, NOTSRCERASE);
                    putimage(enemy.get_x(), enemy.get_y(), &img_boom2, SRCINVERT);
                    break;
                case 3:
                    putimage(enemy.get_x(), enemy.get_y(), &img_boom3_mask, NOTSRCERASE);
                    putimage(enemy.get_x(), enemy.get_y(), &img_boom3, SRCINVERT);
                    break;
                case 4: putimage(enemy.get_x(), enemy.get_y(), &img_boom4); break;
                }
            }
        }
        else if (enemy.get_isAlive()) {
            switch (enemy.get_type()) {
            case 1:
                putimage(enemy.get_x(), enemy.get_y(), &img_enemy_1_mask, NOTSRCERASE);
                putimage(enemy.get_x(), enemy.get_y(), &img_enemy_1, SRCINVERT);
                break;
            case 2:
                putimage(enemy.get_x(), enemy.get_y(), &img_enemy_2_mask, NOTSRCERASE);
                putimage(enemy.get_x(), enemy.get_y(), &img_enemy_2, SRCINVERT);
                break;
            case 3:
                putimage(enemy.get_x(), enemy.get_y(), &img_enemy_3_mask, NOTSRCERASE);
                putimage(enemy.get_x(), enemy.get_y(), &img_enemy_3, SRCINVERT);
                break;
            case 5:
                putimage(enemy.get_x(), enemy.get_y(), &img_Zoiger1_mask, NOTSRCERASE);
                putimage(enemy.get_x(), enemy.get_y(), &img_Zoiger1, SRCINVERT);
                break;
            case 6:
                putimage(enemy.get_x(), enemy.get_y(), &img_Zoiger2_mask, NOTSRCERASE);
                putimage(enemy.get_x(), enemy.get_y(), &img_Zoiger2, SRCINVERT);
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
            switch (Boss -> get_explosionFrame()) {
            case 1: putimage(Boss -> get_x(), Boss -> get_y(), &frames[0]); break;
            case 2: putimage(Boss -> get_x(), Boss -> get_y(), &frames[1]); break;
            case 3: putimage(Boss -> get_x(), Boss -> get_y(), &frames[2]); break;
            case 4: putimage(Boss -> get_x(), Boss -> get_y(), &frames[3]); break;
            case 5: putimage(Boss -> get_x(), Boss -> get_y(), &frames[4]); break;
            case 6: putimage(Boss -> get_x(), Boss -> get_y(), &frames[5]); break;
            case 7: putimage(Boss -> get_x(), Boss -> get_y(), &frames[6]); break;
            case 8: putimage(Boss -> get_x(), Boss -> get_y(), &frames[7]); break;
            case 9: putimage(Boss -> get_x(), Boss -> get_y(), &frames[8]); break;
            }
        }
        else if (Boss->get_isAlive()) {
            putimage(Boss->get_x(), Boss->get_y(), &img_Boss_mask, NOTSRCERASE);
            putimage(Boss->get_x(), Boss->get_y(), &img_Boss, SRCINVERT);
        }
    }
}

void updatePlayer() {
    // for Player to control his fighter
    if (GetAsyncKeyState(VK_LEFT) & 0x8000) {
        player.move(-player.get_speed(), 0);
    }
    if (GetAsyncKeyState(VK_RIGHT) & 0x8000) {
        player.move(player.get_speed(), 0);
    }
    if (GetAsyncKeyState(VK_UP) & 0x8000) {
        player.move(0, -player.get_speed());
    }
    if (GetAsyncKeyState(VK_DOWN) & 0x8000) {
        player.move(0, player.get_speed());
    }
    if (GetAsyncKeyState(VK_SPACE) & 0x8000) {
        player.fire(player.bullets);
    }
}

void updateAndRemoveInactiveBullets(std::vector<Bullet>& bullets) {
    for (size_t i = 0; i < bullets.size(); ) { 
        bullets[i].update();
        if (!bullets[i].get_isActive()) {
            bullets.erase(bullets.begin() + i);
        }
        else {
            ++i; // Increase the index only when the bullet is active  
        }
    }
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
    auto it = enemies.begin();
    while (it != enemies.end()) {
        it->update();
        if (!it->get_isAlive() && it->get_explosionFrame() == it->explosionFrames) {
            score++;
            // remove enemy if it's dead
            it = enemies.erase(it);
        }
        else {
            ++it; // move to next enemy only when the current one survive  
        }
    }

    // Randomly generate an enemy   
    static int frameCount = 0;
    if (++frameCount % 30 == 0 && enemies.size() < 5) {  // Every 30 frames attempt to generate an enemy  
        if (Level == 1) {
            enemies.emplace_back(1);
            if (score > 50) {
                is_Win = true;
            }
        }
        else if (Level == 2) {
            enemies.emplace_back(2);
            if (score > 50) {
                is_Win = true;
            }
        }
        else if (Level == 3) {
            enemies.emplace_back(3);
            if (score > 50) {
                is_Win = true;
            }
        }
        else if (Level == 4) {
            if (score < 50) {
                enemies.emplace_back(rand() % 3 + 1);
            }
        }
        else if (Level == 5) {
            enemies.emplace_back(rand() % 2 + 5);
            if (score > 70) {
                is_Win = true;
            }
        }
    }
} //Update enemies and decide whether player wins.

void updateBoss(Enemy* Boss) {
    if (Boss != nullptr) {
        Boss -> update();
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
                    bullet.be_hit();
                    enemy.be_hit(bullet.get_attack());
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
                if (isColliding(player.get_x(), player.get_y(), player.get_width(), player.get_height(),
                    bossBullet.get_x(), bossBullet.get_y(), 5, 11)) { // Assuming Boss bullet size is same  
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
                            if (playerBullet.get_type() == 7) {
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
                            if (playerBullet.get_type() == 7) {
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
                    if (isColliding(playerBullet.get_x(), playerBullet.get_y(), 30, 70, // Assuming player bullet size  
                        bossBullet.get_x(), bossBullet.get_y(), 5, 11)) { // Assuming Boss bullet size is same  
                        playerBullet.be_hit();
                        bossBullet.be_hit();
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

void if_pause() {
    is_Pause = !is_Pause;
    if (is_Pause) {
        if (Level == 5) {
            pause_Tiga1();
            pause_Tiga2();
        }
        else {
            pause_BGM();
        }
    }
    else {
        if (Level == 5) {
            resume_Tiga1();
            resume_Tiga2();
        }
        else {
            resume_BGM();
        }
    }
}

void gameLoop() {
    while (player.get_isAlive() && !is_Win && currentState == PLAY) {

        if (GetAsyncKeyState(VK_ESCAPE) & 0x8000) {
            if_pause();  //change the state
            Sleep(150); //avoid triggering for too much times
        }

        if (!is_Pause) {

            BeginBatchDraw();

            switch (Level) {
            case 1:
                loadimage(&img_L1, "./res/L1.jpg", BG_width, BG_height);                              
                putimage(0, 0, &img_L1);
                break;
            case 2:
                loadimage(&img_L2, "./res/L2.jpg", BG_width, BG_height);
                putimage(0, 0, &img_L2);
                break;
            case 3:
                loadimage(&img_L3, "./res/L3.jpg", BG_width, BG_height);
                putimage(0, 0, &img_L3);
                break;
            case 4:
                loadimage(&img_L4, "./res/L4.jpg", BG_width, BG_height);
                putimage(0, 0, &img_L4);
                break;
            case 5:
                if (score < 50) {
                    loadimage(&img_L5_1, "./res/L5_1.jpg", BG_width, BG_height);
                    putimage(0, 0, &img_L5_1);
                }
                else if (score == 50 && !loading_flag) {
                    loading();
                    Vinit2();
                    loading_flag = true;
                    if (player.get_type() == 4 || player.get_type() == 5) {
                        close_Tiga1();
                        play_Tiga2();
                    }
                }
                else if (score >= 50){
                    loadimage(&img_L5_2, "./res/L5_2.jpg", BG_width, BG_height);
                    putimage(0, 0, &img_L5_2);
                }
                break;
            }

            if (Level == 4 && enemies.empty() && score >= 50 && !BossTime) {
                BossTime = true; 
                if (Boss == nullptr || if_new_Boss) {
                    // If Boss is a nullptr or it need to be reset(if_new_Boss is true), create or reset Boss.
                    if (Boss != nullptr) {
                        delete Boss; // If there has been a Boss, delete it.
                    }
                    Boss = new Enemy(4);
                    if_new_Boss = false; // reset if_new_Boss, because we have created a new one
                }
            }

            // If it is BossTime, draw and update Boss.
            if (BossTime && Boss != nullptr) {
                if (!Boss->get_isAlive() && Boss -> get_explosionFrame() == 9) {
                    score += if_new_Boss ? 15 : 25; // Less score if it's a new Boss.
                    is_Win = true;
                    BossTime = false; 
                    delete Boss;     
                    Boss = nullptr;  
                    if_new_Boss = true; 
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
            putimage(0, 0, &img_pause_bg);
            putimage(450, 300, &img_pause);
            putimage(400, 350, &img_exit);
            display_HP();
            display_score();

            if (MouseHit()) {
                MOUSEMSG msg = GetMouseMsg();
                if (msg.uMsg == WM_LBUTTONDOWN) {
                    if (isMouseOverExitButton(msg.x, msg.y)) {
                        enemies.clear();
                        close_BGM();
                        currentState = MENU;
                        loading();
                        menu();
                    }
                    if (isMouseOverPause(msg.x, msg.y)) {
                        if_pause();
                        Sleep(300);
                    }
                }
            }

            EndBatchDraw();
        }

        const int targetFPS = 60;
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
        if (Level == 4) {
            story2();
        }
        if (Level == 5) {
            story_Tiga_2();
            user.fighters_owned[4] = true;
            user.fighters_owned[5] = true;
        }
        close_BGM();
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
        else {
            close_BGM();
        }
        if (Level == 4 || Level == 5) {
            failure();
        }
        currentState = MENU;
        loading();
        menu();
    }
}

// dialog 
INT_PTR CALLBACK DialogProc(HWND hDlg, UINT message, WPARAM wParam, LPARAM lParam) {
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
    initgraph(BG_width, BG_height);
    init();
    Sleep(500);

    //generate a dialog and get the username
    DialogBox(hInstance, MAKEINTRESOURCE(IDD_DIALOG1), NULL, DialogProc);

    story1();

    loading();

    // Load the user's information  
    user = User::loadFromFile(username);
    std::string A = "Welcome back, " + user.get_username();
    std::string B = "Your amount is " + std::to_string(user.get_amount());
    MessageBox(NULL, A.c_str(), B.c_str(), MB_OK);
    
    menu();

}

#endif