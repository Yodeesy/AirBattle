#pragma once  
#ifndef MUSIC_H
#define MUSIC_H
#include <tchar.h> // for _T macro
#include <windows.h>
#pragma comment(lib, "winmm.lib")  

void play_music() {
    mciSendString(_T("open \"thoughts.mp3\" alias Q"), NULL, 0, NULL);
    mciSendString(_T("play Q repeat"), NULL, 0, NULL);
}

void close_music() {
    mciSendString(_T("close Q"), NULL, 0, NULL);
}

void play_BGM() {
    mciSendString(_T("open \"theDogs.mp3\" alias BGM"), NULL, 0, NULL);
    mciSendString(_T("play BGM repeat"), NULL, 0, NULL);
}

void pause_BGM() {
    mciSendString(_T("pause BGM"), NULL, 0, NULL);
}

void resume_BGM() {
    mciSendString(_T("resume BGM"), NULL, 0, NULL);
}

void close_BGM() {
    mciSendString(_T("close BGM"), NULL, 0, NULL);
}

void play_Tiga1() {
    mciSendString(_T("open \"Love Theme From Tiga.mp3\" alias A"), NULL, 0, NULL);
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
    mciSendString(_T("open \"You are always my hero.mp3\" alias B"), NULL, 0, NULL);
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
    mciSendString(_T("open \"words.mp3\" alias W"), NULL, 0, NULL);
    mciSendString(_T("play W"), NULL, 0, NULL);
}

void close_words() {
    mciSendString(_T("close W"), NULL, 0, NULL);
}

#endif
