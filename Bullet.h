#pragma once
#ifndef BULLET_H
#define BULLET_H

//canvas
static int BG1_width = 700;
static int BG1_height = 900;

class Bullet {
public:
    Bullet() = default;
    Bullet(int x, int y, int type) : x(x), y(y), type(type), isActive(true) {
        switch (type) {
        case 0: //f0
            speed = 7;
            attack = 5;
            break;
        case 1: //f1
            speed = 10;
            attack = 10;
            break;
        case 2: //f2
            speed = 13;
            attack = 30;
            break;
        case 3: //f3
            speed = 17;
            attack = 20;
            break;
        case 4: //e2 / Boss
            speed = 7;
            attack = 10;
            break;
        case 5: //e3 / Boss
            speed = 11;
            attack = 15;
            break;
        case 6: //GW_01
            speed = 16;
            attack = 15;
            break;
        case 7: //GW_02
            speed = 15;
            attack = 35;
            break;
        case 8: //Zoiger
            speed = 15;
            attack = 50;
            break;
        }
    }

    void update() {
        if (type == 0 || type == 1 || type == 2 || type == 3 || type == 6 || type == 7) {
            y -= speed;
            if (y < 0) isActive = false; // bullets out of the screen are inactive
        }
        else if (type == 4 || type == 5 || type == 8) {
            y += speed;
            if (y > BG1_height) isActive = false; // bullets out of the screen are inactive
        }

    }

    void be_hit() {
        isActive = false;
    }

    int get_x() const { return x; }
    int get_y() const { return y; }
    int get_type() const { return type; }
    int get_attack() const { return attack; }
    bool get_isActive() const { return isActive; }

private:
    int x, y;
    int type;
    int speed;
    int attack;
    bool isActive;
};

#endif // BULLET_H
