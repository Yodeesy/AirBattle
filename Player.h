#pragma once
#ifndef PLAYER_H
#define PLAYER_H

#include "Bullet.h"
#include <windows.h>
#include <easyx.h>
#include <vector>

//canvas
static int BG2_width = 700;
static int BG2_height = 900;

class Player {
public:
    std::vector<Bullet> bullets;

    Player() : x(250), y(750), width(90), height(93), speed(5), cooldown(0), HP(100), original_HP(100), type(0), isAlive(true) { }

    void set_type(int n) {
        type = n;
        switch (type) {
        case 0:
            width = 90;
            height = 93;
            speed = 5;
            HP = 100;
            original_HP = 100;
            break;

        case 1:
            width = 80;
            height = 90;
            speed = 7;
            HP = 100;
            original_HP = 100;
            break;

        case 2:
            width = 120;
            height = 88;
            speed = 10;
            HP = 150;
            original_HP = 150;
            break;

        case 3:
            width = 120;
            height = 85;
            speed = 15;
            HP = 120;
            original_HP = 120;
            break;

        case 4:
            width = 120;
            height = 90;
            speed = 15;
            HP = 100;
            original_HP = 100;
            break;

        case 5:
            width = 150;
            height = 120;
            speed = 11;
            HP = 125;
            original_HP = 125;
            break;

        }
    }

    void reset() {
        x = 250;
        y = 750;
        cooldown = 0;
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
        if (cooldown == 0) { // ensure only can player fire when the cooldown is 0
            if (type == 4) {
                bullets.emplace_back(x + width / 2 - 35, y + height / 2, 6);
                bullets.emplace_back(x + width / 2 + 10, y + height / 2, 6);
            }
            else if (type == 5) {
                bullets.emplace_back(x + width / 2 - 20, y + height, 7);
            }
            else {
                bullets.emplace_back(x + width / 2 - 20, y + height, type);
            }
            cooldown = maxcooldown; // reset  
        }
        else {
            if(type == 0) {
                cooldown -= 3;
            }
            else if (type == 1 || type == 2 || type == 5) {
                cooldown -= 4;
            }
            else if (type == 3) {
                cooldown -= 5;
            }
            else if (type == 4) {
                cooldown -= 6;
            }
        }
    }

private:
    int x, y;
    int width, height;
    int speed;
    int cooldown;
    const int maxcooldown = 60;
    int HP;
    int original_HP;
    int type;
    bool isAlive;
};

#endif // PLAYER_H

