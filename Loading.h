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
        putimage(0, 0, &f1[currentFrame]); // ���Ƶ�ǰ֡  
        EndBatchDraw();

        // ���µ�ǰ֡���Ѳ��ŵ�֡��  
        currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
        frameCount++;

        Sleep(DELAY); // �ӳ�һ��ʱ��  
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
        putimage(0, 0, &f2[currentFrame]); // ���Ƶ�ǰ֡  
        EndBatchDraw();

        // ���µ�ǰ֡���Ѳ��ŵ�֡��  
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
    const int TOTAL_FRAMES = 35; // ��֡��  
    const int REPEATS_PER_FRAME = 3; // ÿ��֡�ظ��Ĵ���  
    const int DELAY = 30; // �ӳ�ʱ�䣬��λ���루0.03�룩  

    std::vector<IMAGE> frames(TOTAL_FRAMES);

    // ��������֡  
    for (int i = 0; i < TOTAL_FRAMES; ++i) {
        std::ostringstream oss;
        oss << "./res/images/loading/" << "loading_"  << std::setw(2) << std::setfill('0') << i << ".png";
        loadimage(&frames[i], oss.str().c_str(), BG_w, BG_h);
    }

    int currentFrame = 0;
    int frameCount = 0; // ���ڸ����Ѳ��ŵ���֡��  

    // ���Ŷ���  
    while (frameCount < TOTAL_FRAMES * REPEATS_PER_FRAME) {

        BeginBatchDraw();
        cleardevice();
        putimage(0, 0, &frames[currentFrame]); // ���Ƶ�ǰ֡  
        EndBatchDraw();

        // ���µ�ǰ֡���Ѳ��ŵ�֡��  
        currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
        frameCount++;

        Sleep(DELAY); // �ӳ�һ��ʱ��  
    }

}

void attention() {
    const int TOTAL_FRAMES = 42; // ��֡��  
    const int REPEATS_PER_FRAME = 2; // ÿ��֡�ظ��Ĵ��� 
    const int DELAY = 30; // �ӳ�ʱ�䣬��λ���루0.03�룩  

    std::vector<IMAGE> frames(TOTAL_FRAMES);

    // ��������֡  
    for (int i = 0; i < TOTAL_FRAMES; ++i) {
        std::ostringstream oss;
        oss << "./res/images/attention/" << "frame_" << std::setw(2) << std::setfill('0') << i << "_delay-0.03s" << ".png";
        loadimage(&frames[i], oss.str().c_str());
    }

    int currentFrame = 0;
    int frameCount = 0; // ���ڸ����Ѳ��ŵ���֡��  

    cleardevice();

    // ���Ŷ���  
    while (frameCount < TOTAL_FRAMES * REPEATS_PER_FRAME) {

        BeginBatchDraw();
        putimage(200, 100, &frames[currentFrame]); // ���Ƶ�ǰ֡  
        EndBatchDraw();

        // ���µ�ǰ֡���Ѳ��ŵ�֡��  
        currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
        frameCount++;

        Sleep(DELAY); // �ӳ�һ��ʱ��  
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