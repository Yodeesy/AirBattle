#pragma once
#include <easyx.h>
#include "Music.h"
#include <windows.h>
#include <graphics.h>


//canvas
static int BG_width = 700;
static int BG_height = 900;

IMAGE img_S1_1;
IMAGE img_S1_2;
IMAGE img_S1_3;
IMAGE img_S1_4;
IMAGE img_S1_5;

IMAGE img_S2_1;
IMAGE img_S2_2;

IMAGE img_P1;
IMAGE img_P2;
IMAGE img_P3;
IMAGE img_P4;
IMAGE img_P5;
IMAGE img_P6;
IMAGE img_P7;
IMAGE img_P8;
IMAGE img_P9;
IMAGE img_P10;

IMAGE img_failure;

const int TOTAL_FRAMES1 = 233; // 总帧数  
const int DELAY1 = 40; // 延迟时间，单位毫秒（0.04秒）  

std::vector<IMAGE> frames1(TOTAL_FRAMES1);

const int TOTAL_FRAMES2 = 125; // 总帧数  
const int DELAY2 = 40; // 延迟时间，单位毫秒（0.04秒）  

std::vector<IMAGE> frames2(TOTAL_FRAMES2);

void story1() {
    loadimage(&img_S1_1, "./story/S1_1.jpg", BG_width, BG_height);
    loadimage(&img_S1_2, "./story/S1_2.jpg", BG_width, BG_height);
    loadimage(&img_S1_3, "./story/S1_3.jpg", BG_width, BG_height);
    loadimage(&img_S1_4, "./story/S1_4.jpg", BG_width, BG_height);
    loadimage(&img_S1_5, "./story/S1_5.jpg", BG_width, BG_height);

    int currentStory = 1;   
    while (currentStory <= 5) { 
        BeginBatchDraw();
        switch (currentStory) {
        case 1: putimage(0, 0, &img_S1_1); break;
        case 2: putimage(0, 0, &img_S1_2); break;
        case 3: putimage(0, 0, &img_S1_3); break;
        case 4: putimage(0, 0, &img_S1_4); break;
        case 5: putimage(0, 0, &img_S1_5); break;
        }
        EndBatchDraw();

        if (MouseHit()) {
            MOUSEMSG msg = GetMouseMsg();
            if (msg.uMsg == WM_LBUTTONDOWN) {
                currentStory++; // move to the next scene after a click
                if (currentStory > 5) {
                    break; //over
                }
            }
        }
    }
}

void story2() {
    loadimage(&img_S2_1, "./story/S2_1.jpg", BG_width, BG_height);
    loadimage(&img_S2_2, "./story/S2_2.jpg", BG_width, BG_height);

    int currentStory = 1;
    while (currentStory <= 2) {
        BeginBatchDraw();
        switch (currentStory) {
        case 1: putimage(0, 0, &img_S2_1); break;
        case 2: putimage(0, 0, &img_S2_2); break;
        }
        EndBatchDraw();

        if (MouseHit()) {
            MOUSEMSG msg = GetMouseMsg();
            if (msg.uMsg == WM_LBUTTONDOWN) {
                currentStory++; // move to the next scene after a click
                if (currentStory > 2) {
                    break; //over
                }
            }
        }
    }
}

void failure() {
    loadimage(&img_failure, "./story/failure.png", BG_width, BG_height);
    while (1) {
        BeginBatchDraw();
        putimage(0, 0, &img_failure);
        EndBatchDraw();

        if (MouseHit()) {
            MOUSEMSG msg = GetMouseMsg();
            if (msg.uMsg == WM_LBUTTONDOWN) {
                break; //over
            }
        }
    }
}


void Vinit1() {
    // 加载所有帧  
    for (int i = 0; i < TOTAL_FRAMES1; ++i) {
        std::ostringstream oss;
        oss << "./Tiga1/" << "frame_" << std::setw(3) << std::setfill('0') << i << "_delay-0.04s" << ".png";
        loadimage(&frames1[i], oss.str().c_str(), BG_width, BG_height);
    }
}

void play_video1() {

    int currentFrame1 = 0;
    int frameCount1 = 0; // 用于跟踪已播放的总帧数  
    cleardevice();

    // 播放动画  
    while (frameCount1 < TOTAL_FRAMES1) {

        BeginBatchDraw();
        putimage(0, 0, &frames1[currentFrame1]); // 绘制当前帧  
        EndBatchDraw();

        // 更新当前帧和已播放的帧数  
        currentFrame1 = (currentFrame1 + 1) % TOTAL_FRAMES1;
        frameCount1++;

        Sleep(DELAY1); // 延迟一段时间  
    }

    return;
}

void story_Tiga_1() {
    play_Tiga1();

    loadimage(&img_P1, "./story/P1.jpg", BG_width, BG_height);
    loadimage(&img_P2, "./story/P2.jpg", BG_width, BG_height);
    loadimage(&img_P3, "./story/P3.jpg", BG_width, BG_height);
    loadimage(&img_P4, "./story/P4.jpg", BG_width, BG_height);

    bool vedioplaying1 = false;

    int currentStory1 = 1;
    while (currentStory1 <= 5) {
        BeginBatchDraw();
        switch (currentStory1) {
        case 1: putimage(0, 0, &img_P1); break;
        case 2: putimage(0, 0, &img_P2); break;
        case 3: 
            if (!vedioplaying1) {
                vedioplaying1 = true;
                play_video1();
                currentStory1++;
            }
            break;

        case 4: putimage(0, 0, &img_P3); break;
        case 5: putimage(0, 0, &img_P4); break;
        }
        EndBatchDraw();

        if (MouseHit() && currentStory1 != 3) {
            MOUSEMSG msg = GetMouseMsg();
            if (msg.uMsg == WM_LBUTTONDOWN) {
                currentStory1++; // move to the next scene after a click
                if (currentStory1 > 5) {
                    break; //over
                }
            }
        }
    }

}


void Vinit2() {
    // 加载所有帧  
    for (int i = 0; i < TOTAL_FRAMES2; ++i) {
        std::ostringstream oss;
        oss << "./Tiga2/" << "frame_" << std::setw(3) << std::setfill('0') << i << "_delay-0.04s" << ".png";
        loadimage(&frames2[i], oss.str().c_str(), BG_width, BG_height);
    }
}

void play_video2() {
    close_Tiga1();
    close_Tiga2();

    int currentFrame2 = 0;
    int frameCount2 = 0; // 用于跟踪已播放的总帧数  

    cleardevice();

    play_words();

    // 播放动画  
    while (frameCount2 < TOTAL_FRAMES2) {

        BeginBatchDraw();
        putimage(0, 0, &frames2[currentFrame2]); // 绘制当前帧  
        EndBatchDraw();

        // 更新当前帧和已播放的帧数  
        currentFrame2 = (currentFrame2 + 1) % TOTAL_FRAMES2;
        frameCount2++;

        Sleep(DELAY2); // 延迟一段时间  
    }

    close_words();
    return;
}

void story_Tiga_2() {
    loadimage(&img_P5, "./story/P5.jpg", BG_width, BG_height);
    loadimage(&img_P6, "./story/P6.jpg", BG_width, BG_height);
    loadimage(&img_P7, "./story/P7.jpg", BG_width, BG_height);
    loadimage(&img_P8, "./story/P8.jpg", BG_width, BG_height);
    loadimage(&img_P9, "./story/P9.jpg", BG_width, BG_height);
    loadimage(&img_P10, "./story/P10.jpg", BG_width, BG_height);

    int currentStory2 = 5;
    while (currentStory2 <= 11) {
        BeginBatchDraw();
        switch (currentStory2) {
        case 5: putimage(0, 0, &img_P5); break;
        case 6: putimage(0, 0, &img_P6); break;
        case 7: putimage(0, 0, &img_P7); break;
        case 8: putimage(0, 0, &img_P8); break;
        case 9: putimage(0, 0, &img_P9); break;
        case 10: putimage(0, 0, &img_P10); break;
        case 11: 
               play_video2();
               currentStory2++;
               break;
        }
        EndBatchDraw();

        if (MouseHit() && currentStory2 != 11) {
            MOUSEMSG msg = GetMouseMsg();
            if (msg.uMsg == WM_LBUTTONDOWN) {
                currentStory2++; // move to the next scene after a click
                if (currentStory2 > 11) {
                    break; //over
                }
            }
        }
    }

}