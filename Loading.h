#pragma once

#include "Music.h"
#include <graphics.h> 
#include <iomanip>
#include <vector>  
#include <string>  
#include <sstream>  
#include <thread>
#include <windows.h>  

static int BG_w = 700;
static int BG_h = 890;

std::vector<IMAGE> f1(150);
std::vector<IMAGE> f2(150);
IMAGE img_ending;

void InitFirst() {
    const int TOTAL_FRAMES = 150;

    for (int i = 0; i < TOTAL_FRAMES; ++i) {
        std::ostringstream oss;
        oss << "./res/images/Yodeeshi/logo/" << "frame_" << std::setw(3) << std::setfill('0') << i << "_delay-0.03s"  << ".png";
        loadimage(&f1[i], oss.str().c_str(), BG_w, BG_h);
    }

}

void InitSecond() {
    const int TOTAL_FRAMES = 150;

    for (int i = 0; i < TOTAL_FRAMES; ++i) {
        std::ostringstream oss;
        if (i % 3 == 1) {
            oss << "./res/images/Yodeeshi/100y/" << "frame_" << std::setw(3) << std::setfill('0') << i << "_delay-0.04s" << ".png";
        }
        else {
            oss << "./res/images/Yodeeshi/100y/" << "frame_" << std::setw(3) << std::setfill('0') << i << "_delay-0.03s" << ".png";
        }
        loadimage(&f2[i], oss.str().c_str(), BG_w, BG_h);
    }

}

void logo() {
    const int TOTAL_FRAMES = 150;
    int currentFrame = 0;
    int frameCount = 0;
    const int DELAY = 40;

    std::thread V1(InitSecond);
    V1.detach();

    while (frameCount < TOTAL_FRAMES) {

        BeginBatchDraw();
        putimage(0, 0, &f1[currentFrame]); // 绘制当前帧  
        EndBatchDraw();

        // 更新当前帧和已播放的帧数  
        currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
        frameCount++;

        Sleep(DELAY); // 延迟一段时间  
    }

}

void celebration() {
    const int TOTAL_FRAMES = 150;
    int currentFrame = 0;
    int frameCount = 0;
    const int DELAY1 = 30;
    const int DELAY2 = 40;

    while (frameCount < TOTAL_FRAMES) {

        BeginBatchDraw();
        cleardevice();
        putimage(0, 0, &f2[currentFrame]); // 绘制当前帧  
        EndBatchDraw();

        // 更新当前帧和已播放的帧数  
        currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
        frameCount++;

        if (frameCount % 3 == 1) {
            Sleep(DELAY2);
        }
        else {
            Sleep(DELAY1);
        } 
    }
}

void Releaser() {
    f1.clear();
    f2.clear();
    f1.shrink_to_fit();
    f2.shrink_to_fit();
}

void loading() {
    const int TOTAL_FRAMES = 35; // 总帧数  
    const int REPEATS_PER_FRAME = 3; // 每个帧重复的次数  
    const int DELAY = 30; // 延迟时间，单位毫秒（0.03秒）  

    std::vector<IMAGE> frames(TOTAL_FRAMES);

    // 加载所有帧  
    for (int i = 0; i < TOTAL_FRAMES; ++i) {
        std::ostringstream oss;
        oss << "./res/images/loading/" << "loading_"  << std::setw(2) << std::setfill('0') << i << ".png";
        loadimage(&frames[i], oss.str().c_str(), BG_w, BG_h);
    }

    int currentFrame = 0;
    int frameCount = 0; // 用于跟踪已播放的总帧数  

    // 播放动画  
    while (frameCount < TOTAL_FRAMES * REPEATS_PER_FRAME) {

        BeginBatchDraw();
        cleardevice();
        putimage(0, 0, &frames[currentFrame]); // 绘制当前帧  
        EndBatchDraw();

        // 更新当前帧和已播放的帧数  
        currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
        frameCount++;

        Sleep(DELAY); // 延迟一段时间  
    }

}

void attention() {
    const int TOTAL_FRAMES = 42; // 总帧数  
    const int REPEATS_PER_FRAME = 2; // 每个帧重复的次数 
    const int DELAY = 30; // 延迟时间，单位毫秒（0.03秒）  

    std::vector<IMAGE> frames(TOTAL_FRAMES);

    // 加载所有帧  
    for (int i = 0; i < TOTAL_FRAMES; ++i) {
        std::ostringstream oss;
        oss << "./res/images/attention/" << "frame_" << std::setw(2) << std::setfill('0') << i << "_delay-0.03s" << ".png";
        loadimage(&frames[i], oss.str().c_str());
    }

    int currentFrame = 0;
    int frameCount = 0; // 用于跟踪已播放的总帧数  

    cleardevice();

    // 播放动画  
    while (frameCount < TOTAL_FRAMES * REPEATS_PER_FRAME) {

        BeginBatchDraw();
        putimage(200, 100, &frames[currentFrame]); // 绘制当前帧  
        EndBatchDraw();

        // 更新当前帧和已播放的帧数  
        currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
        frameCount++;

        Sleep(DELAY); // 延迟一段时间  
    }
}


void ending() {
    int h = 0;
    loadimage(&img_ending, "./res/images/Yodeeshi/ending.png", BG_w, 2 * BG_w);
    while (1) {
        cleardevice();
        putimage(0, 0, BG_w, BG_h, &img_ending, 0, h);
        ++h;
        if (h == 2 * BG_w - BG_h + 10) {
            break;
        }
        Sleep(50);
    }
}