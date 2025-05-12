#pragma once
#ifndef BULLET_H
#define BULLET_H

//canvas
static int BG1_width = 700;
static int BG1_height = 890;

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
        case 4: //e2 or Boss
            speed = 7;
            attack = 10;
            break;
        case 5: //e3 or Boss
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
        case 9: //Elight(Boss)
            speed = 0;
            attack = 5;
            break;
        case 10: //e5
            speed = 15;
            attack = 20;
            break;
        case 11: ////GW-EX-J-¦Á
            speed = 15;
            attack = 20;
            break;
        case 12: //MAX
            speed = 15;
            attack = 200;
            break;
        case 13: //GS
            speed = 17;
            attack = 25;
            break;
        case 14: //b1
            speed = 5;
            attack = 1;
            break;
        case 15: //boss2
            speed = 15;
            attack = 20;
            break;
        case 16://e1
            speed = 13;
            attack = 30;
            break;
        case 17://e2
            speed = 17;
            attack = 20;
            break;
        case 18://e3
            speed = 5;
            attack = 1;
            break;
        }
    }

    void update() {
        if (type <=3 || type == 6 || type == 7 || (type >= 11 && type <= 14)) {
            y -= speed;
            if (y < 0) isActive = false; // bullets out of the screen are inactive
        }
        else if (type == 4 || type == 5 || type == 8 || type == 10 || type >= 15) {
            y += speed;
            if (y > BG1_height) isActive = false; // bullets out of the screen are inactive
        }
    } //Attention!Update of Elight is in the class of Enemy


    void be_hit() {
        isActive = false;
    }

    void set_x(int n) {
        x = n;
    }

    void set_y(int n) {
        y = n;
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
