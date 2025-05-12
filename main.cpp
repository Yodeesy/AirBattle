#include "game.h"
#include <iostream>
#include <Windows.h>

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    srand(static_cast<unsigned int>(time(nullptr))); // Initialize random seed
    start(hInstance);
    return 0;

}