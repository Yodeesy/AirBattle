#pragma once
#include <graphics.h> 
#include <iomanip>
#include <vector>  
#include <string>  
#include <sstream>  
#include <windows.h>  

static int BG_w = 700;
static int BG_h = 900;

void loading() {
    const int TOTAL_FRAMES = 35; // 总帧数  
    const int REPEATS_PER_FRAME = 3; // 每个帧重复的次数  
    const int DELAY = 30; // 延迟时间，单位毫秒（0.03秒）  

    std::vector<IMAGE> frames(TOTAL_FRAMES);

    // 加载所有帧  
    for (int i = 0; i < TOTAL_FRAMES; ++i) {
        std::ostringstream oss;
        oss << "./loading/" << "loading_"  << std::setw(2) << std::setfill('0') << i << ".png";
        loadimage(&frames[i], oss.str().c_str(), BG_w, BG_h);
    }

    int currentFrame = 0;
    int frameCount = 0; // 用于跟踪已播放的总帧数  

    cleardevice();

    // 播放动画  
    while (frameCount < TOTAL_FRAMES * REPEATS_PER_FRAME) {

        BeginBatchDraw();
        putimage(0, 0, &frames[currentFrame]); // 绘制当前帧  
        EndBatchDraw();

        // 更新当前帧和已播放的帧数  
        currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
        frameCount++;

        Sleep(DELAY); // 延迟一段时间  
    }

}
