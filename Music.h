#pragma once  
#ifndef MUSIC_H  
#define MUSIC_H  
#include <atomic>   
#include <tchar.h> // for _T macro  
#include <windows.h>  
#pragma comment(lib, "winmm.lib")  


void playSYSU() {
    mciSendString(_T("open \"res\\music\\sysu.mp3\" alias sysu"), NULL, 0, NULL);
    mciSendString(_T("play sysu"), NULL, 0, NULL);
}

void closeSYSU() {
    mciSendString(_T("close sysu"), NULL, 0, NULL);
}

std::atomic<int> state(0);

void changeState() {
    state.fetch_xor(1, std::memory_order_relaxed);
}

void play_music() {
    mciSendString(_T("open \"res\\music\\thoughts.mp3\" alias Q"), NULL, 0, NULL);
    mciSendString(_T("play Q repeat"), NULL, 0, NULL);
}

void close_music() {
    mciSendString(_T("close Q"), NULL, 0, NULL);
}

void play_BGM() {
    mciSendString(_T("open \"res\\music\\Night Crusing.mp3\" alias BGM1"), NULL, 0, NULL);
    mciSendString(_T("open \"res\\music\\theDogs.mp3\" alias BGM2"), NULL, 0, NULL);
    if (state == 0) {
        mciSendString(_T("play BGM1 repeat"), NULL, 0, NULL);
    }
    else {
        mciSendString(_T("play BGM2 repeat"), NULL, 0, NULL);
    }
}

void pause_BGM() {
    if (state == 0) {
        mciSendString(_T("pause BGM1"), NULL, 0, NULL);
    }
    else {
        mciSendString(_T("pause BGM2"), NULL, 0, NULL);
    }
}

void resume_BGM() {
    if (state == 0) {
        mciSendString(_T("resume BGM1"), NULL, 0, NULL);
    }
    else {
        mciSendString(_T("resume BGM2"), NULL, 0, NULL);
    }
}

void close_BGM() {
    if (state == 0) {
        mciSendString(_T("close BGM1"), NULL, 0, NULL);
    }
    else {
        mciSendString(_T("close BGM2"), NULL, 0, NULL);
    }
}

void change_BGM() {
    close_BGM();
    changeState();
    if (state == 0) {
        mciSendString(_T("open \"res\\music\\Night Crusing.mp3\" alias BGM1"), NULL, 0, NULL);
        mciSendString(_T("play BGM1 repeat"), NULL, 0, NULL);
    }
    else {
        mciSendString(_T("open \"res\\music\\theDogs.mp3\" alias BGM2"), NULL, 0, NULL);
        mciSendString(_T("play BGM2 repeat"), NULL, 0, NULL);
    }
}

void play_Tiga1() {
    mciSendString(_T("open \"res\\music\\Love Theme From Tiga.mp3\" alias A"), NULL, 0, NULL);
    mciSendString(_T("play A"), NULL, 0, NULL);
}

void pause_Tiga1() {
    mciSendString(_T("pause A"), NULL, 0, NULL);
}

void resume_Tiga1() {
    mciSendString(_T("resume A"), NULL, 0, NULL);
}

void close_Tiga1() {
    mciSendString(_T("close A"), NULL, 0, NULL);
}

void play_Tiga2() {
    mciSendString(_T("open \"res\\music\\You are always my hero.mp3\" alias B"), NULL, 0, NULL);
    mciSendString(_T("play B"), NULL, 0, NULL);
}

void pause_Tiga2() {
    mciSendString(_T("pause B"), NULL, 0, NULL);
}

void resume_Tiga2() {
    mciSendString(_T("resume B"), NULL, 0, NULL);
}

void close_Tiga2() {
    mciSendString(_T("close B"), NULL, 0, NULL);
}

void play_words() {
    mciSendString(_T("open \"res\\music\\words.mp3\" alias W"), NULL, 0, NULL);
    mciSendString(_T("play W"), NULL, 0, NULL);
}

void close_words() {
    mciSendString(_T("close W"), NULL, 0, NULL);
}

void play_BGM3() {
    mciSendString(_T("open \"res\\music\\Valse di Fantastica.mp3\" alias BGM3"), NULL, 0, NULL);
    mciSendString(_T("play BGM3 repeat"), NULL, 0, NULL);
}

void pause_BGM3() {
    mciSendString(_T("pause BGM3"), NULL, 0, NULL);
}

void resume_BGM3() {
    mciSendString(_T("resume BGM3"), NULL, 0, NULL);
}

void close_BGM3() {
    mciSendString(_T("close BGM3"), NULL, 0, NULL);
}

void open_muyu() {
    mciSendString(_T("open \"res\\music\\muyu.mp3\" alias muyu"), NULL, 0, NULL);
}

void play_muyu() {
    mciSendString(_T("play muyu from 0"), NULL, 0, NULL);
}

void close_muyu() {
    mciSendString(_T("close muyu"), NULL, 0, NULL);
}

void play_lian() {
    mciSendString(_T("open \"res\\music\\Á«.mp3\" alias m"), NULL, 0, NULL);
    mciSendString(_T("play m repeat"), NULL, 0, NULL);
}

void close_lian() {
    mciSendString(_T("close m"), NULL, 0, NULL);
}

#endif