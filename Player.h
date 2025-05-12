#pragma once
#ifndef PLAYER_H
#define PLAYER_H

#include "Bullet.h"
#include <windows.h>
#include <easyx.h>
#include <vector>

//canvas
static int BG2_width = 700;
static int BG2_height = 890;

class Player {
public:
    std::vector<Bullet> bullets;

    Player() : x(250), y(750), width(90), height(93), speed(5), cooldown1(0), cooldown2(0), cooldown3(0), HP(100), original_HP(100), type(0), isAlive(true) { }

    void set_type(int n) {
        type = n;
        switch (type) {
        case 0: //F0-B
            width = 90;
            height = 93;
            speed = 5;
            HP = 100;
            original_HP = 100;
            break;

        case 1:  //F1-J
            width = 80;
            height = 90;
            speed = 7;
            HP = 100;
            original_HP = 100;
            break;

        case 2:  //F2-S
            width = 120;
            height = 88;
            speed = 10;
            HP = 150;
            original_HP = 150;
            break;

        case 3: //F3-V
            width = 120;
            height = 85;
            speed = 16;
            HP = 120;
            original_HP = 120;
            break;

        case 4: //GW-01
            width = 120;
            height = 90;
            speed = 15;
            HP = 100;
            original_HP = 100;
            break;

        case 5: //GW-02
            width = 150;
            height = 120;
            speed = 11;
            HP = 125;
            original_HP = 125;
            break;

        case 6: //GW-01A
            width = 120;
            height = 90;
            speed = 15;
            HP = 105;
            original_HP = 105;
            break;

        case 7: //GW-EX-J-alpha
            width = 120;
            height = 90;
            speed = 15;
            HP = 105;
            original_HP = 105;
            break;

        case 8: //GS
            width = 120;
            height = 90;
            speed = 18;
            HP = 100;
            original_HP = 100;
            break;

        case 9: //GW-02A
            width = 150;
            height = 120;
            speed = 12;
            HP = 130;
            original_HP = 130;
            break;

        case 10: //GW-EX-J-beta
            width = 150;
            height = 145;
            speed = 10;
            HP = 150;
            original_HP = 150;
            break;

        case 11: //GW-EX-J
            width = 150;
            height = 200;
            speed = 11;
            HP = 200;
            original_HP = 200;
            break;

        }
    }

    void reset() {
        x = 250;
        y = 750;
        cooldown1 = 0;
        cooldown2 = 0;
        cooldown3 = 0;
        HP = original_HP;
        isAlive = true;
        bullets.clear();

    }

    int get_x() const {
        return x;
    }

    int get_y() const {
        return y;
    }

    int get_width() const {
        return width;
    }

    int get_height() const {
        return height;
    }

    int get_speed() const {
        return speed;
    }

    int get_HP() const {
        return HP;
    }

    int get_type() const {
        return type;
    }

    bool get_isAlive() const {
        return isAlive;
    }

    void be_hit(int a) {
        HP -= a;
        if (HP <= 0) {
            HP = 0;
            isAlive = false;
            bullets.clear();
        }
    }

    void move(int dx, int dy) {
        x += dx;
        y += dy;

        // ensure that player's fighter isn't out of the screen
        if (x < 0) x = 0;
        if (x > BG2_width - width) x = BG2_width - width;
        if (y < 0) y = 0;
        if (y > BG2_height - height) y = BG2_height - height;
    }

    void fire(std::vector<Bullet>& bullets) {
        if (type == 6) {
            if (cooldown1 <= 0) {
                bullets.emplace_back(x + width / 2 - 35, y + height / 2, 6);
                bullets.emplace_back(x + width / 2 + 10, y + height / 2, 6);
                cooldown1 = maxcooldown;
            }
            else {
                cooldown1 -= 5;
            }
            if (cooldown2 <= 0) {
                bullets.emplace_back(x + width / 2 - 5, y + height / 2, 1);
                cooldown2 = maxcooldown;
            }
            else {
                cooldown2 -= 3;
            }
        }
        else if (type == 7) {
            if (cooldown1 <= 0) {
                bullets.emplace_back(x + width / 2 - 35, y + height / 2, 3);
                bullets.emplace_back(x + width / 2 + 10, y + height / 2, 3);
                cooldown1 = maxcooldown;
            }
            else {
                cooldown1 -= 5;
            }
            if (cooldown2 <= 0) {
                bullets.emplace_back(x + width / 2 - 5, y + height / 2, 14);
                cooldown2 = maxcooldown;
            }
            else {
                cooldown2 -= 10;
            }
        }
        else if (type == 8) {
            if (cooldown1 <= 0) {
                bullets.emplace_back(x + width / 2 - 40, y + height / 2, 13);
                bullets.emplace_back(x + width / 2 + 25, y + height / 2, 13);
                cooldown1 = maxcooldown;
            }
            else {
                cooldown1 -= 4;
            }
            if (cooldown3 <= 0) {
                bullets.emplace_back(x + width / 2 - 25, y - 5, 12);
                cooldown3 = 2 * maxcooldown;
            }
            else {
                --cooldown3;
            }
        }
        else if (type == 11) {
            if (cooldown1 <= 0) {
                bullets.emplace_back(x, y + height - 15, 11);
                bullets.emplace_back(x + width - 10, y + height - 15, 11);
                cooldown1 = maxcooldown;
            }
            else {
                cooldown1 -= 3;
            }
            if (cooldown2 <= 0) {
                bullets.emplace_back(x + width / 2 - 15, y + 15, 6);
                bullets.emplace_back(x + width / 2, y + 15, 6);
                cooldown2 = maxcooldown;
            }
            else {
                cooldown2 -= 5;
            }
            if (cooldown3 <= 0) {
                bullets.emplace_back(x + width / 2 - 25, y - 5, 12);
                cooldown3 = 2 * maxcooldown;
            }
            else {
                --cooldown3;
            }
        }
        else {
            if (cooldown1 <= 0) { // ensure only can player fire when the cooldown is 0
                if (type == 4) {
                    bullets.emplace_back(x + width / 2 - 35, y + height / 2, 6);
                    bullets.emplace_back(x + width / 2 + 10, y + height / 2, 6);
                }
                else if (type == 5) {
                    bullets.emplace_back(x + width / 2 - 20, y + height, 7);
                }
                else if (type == 10) {
                    bullets.emplace_back(x, y + height - 10, 11);
                    bullets.emplace_back(x + width - 5, y + height - 15, 11);
                    bullets.emplace_back(x + width / 2 - 15, y - 5, 7);
                }
                else {
                    bullets.emplace_back(x + width / 2 - 20, y + height, type);
                }

                cooldown1 = maxcooldown; // reset  
            }
            else {
                if (type == 0 || type == 5 || type == 10) {
                    cooldown1 -= 3;
                }
                else if (type == 1 || type == 2) {
                    cooldown1 -= 4;
                }
                else if (type == 3 || type == 4) {
                    cooldown1 -= 5;
                }
            }
        }
    }

    void fireB(std::vector<Bullet>& bullets, int index) {
        if (type == 9) {
            if (index == 0) {
                if (cooldown1 <= 0) {
                    bullets.emplace_back(x + width / 2 - 35, y + height / 2, 6);
                    bullets.emplace_back(x + width / 2 + 15, y + height / 2, 6);
                    cooldown1 = maxcooldown; // reset 
                }
                else {
                    cooldown1 -= 4;
                }
            }
            else if (index == 1) {
                if (cooldown1 <= 0) {
                    bullets.emplace_back(x + width / 2 - 25, y + 5, 7);
                    cooldown1 = maxcooldown; // reset 
                }
                else {
                    cooldown1 -= 3;
                }
            }
        }
    } //especially for GW-02A

private:
    int x, y;
    int width, height;
    int speed;
    int cooldown1, cooldown2, cooldown3;
    const int maxcooldown = 60;
    int HP;
    int original_HP;
    int type;
    bool isAlive;
};

#endif // PLAYER_H

