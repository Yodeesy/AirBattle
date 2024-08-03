#pragma once
#ifndef ENEMY_H
#define ENEMY_H

#include "Bullet.h"
#include <vector>
#include <Windows.h>


//canvas
static int BG3_width = 700;
static int BG3_height = 900;


//enemy
static int Enemy_1_width = 57;
static int Enemy_1_height = 51;

static int Enemy_2_width = 90;
static int Enemy_2_height = 65;

static int Enemy_3_width = 100;
static int Enemy_3_height = 80;

static int Boss_width = 222;
static int Boss_height = 282;

static int Enemy_5_width = 160;
static int Enemy_5_height = 80;

class Enemy {
public:
    std::vector<Bullet> bullets;
    int explosionFrameDisplayCount = 0;
    int frameDisplayCount = 10;  //Times per frame
    int explosionFrames;

    Enemy() = default;

    Enemy(int type) : type(type), cooldown(0) {

        switch (type) {
        case 1:
            x = rand() % (BG3_width - Enemy_1_width);
            y = 0;
            width = Enemy_1_width;
            height = Enemy_1_height;
            speed = 7;
            HP = 5;
            isAlive = true;
            explosionFrames = 4;
            break;
        case 2:
            x = rand() % (BG3_width - Enemy_2_width);
            y = 0;
            width = Enemy_2_width;
            height = Enemy_2_height;
            speed = 5;
            HP = 15;
            isAlive = true;
            explosionFrames = 4;
            break;
        case 3:
            x = rand() % (BG3_width - Enemy_3_width);
            y = 0;
            width = Enemy_3_width;
            height = Enemy_3_height;
            speed = 9;
            HP = 20;
            isAlive = true;
            explosionFrames = 4;
            break;
        case 4: //Boss
            x = 200;
            y = 5;
            width = Boss_width;
            height = Boss_height;
            speed = 5;
            HP = 1000;
            isAlive = true;
            explosionFrames = 9;
            break;
        case 5: //Zoiger1
            x = rand() % (BG3_width - Enemy_5_width);
            y = 0;
            width = Enemy_5_width;
            height = Enemy_5_height;
            speed = 10;
            HP = 60;
            isAlive = true;
            explosionFrames = 9;
            break;
        case 6: //Zoiger2
            x = rand() % (BG3_width - Enemy_5_width);
            y = 0;
            width = Enemy_5_width;
            height = Enemy_5_height;
            speed = 10;
            HP = 60;
            isAlive = true;
            explosionFrames = 9;
            break;
        default:
            break;
        }

    }

    Enemy(Enemy&& other) noexcept :
        x(other.x), y(other.y), width(other.width), height(other.height), speed(other.speed),
        type(other.type), cooldown(other.cooldown), HP(other.HP), isAlive(other.isAlive),
        explosionFrameDisplayCount(other.explosionFrameDisplayCount), frameDisplayCount(other.frameDisplayCount),
        explosionFrame(other.explosionFrame), bullets(std::move(other.bullets)), explosionFrames(other.explosionFrames) { }

    Enemy& operator=(Enemy&& other) noexcept {
        if (this != &other) {
            x = other.x;
            y = other.y;
            width = other.width;
            height = other.height;
            speed = other.speed;
            type = other.type;
            cooldown = other.cooldown;
            HP = other.HP;
            isAlive = other.isAlive;
            explosionFrameDisplayCount = other.explosionFrameDisplayCount;
            frameDisplayCount = other.frameDisplayCount;
            explosionFrame = other.explosionFrame;
            bullets = std::move(other.bullets);
            explosionFrames = other.explosionFrames;
        }
        return *this;
    }

    void reset(Enemy* Boss) {
        if (type == 4 && Boss != nullptr) {
            x = 200;
            y = 0;
            speed = 5;
            HP = 1000;
            isAlive = true;
            explosionFrame = 0;
        }
    }  // ATTENTION!Especially for Boss!

    void update() {
        if (isAlive) {
            fire(bullets);
            if (type != 4) {
                 y += speed;
                 if (y > BG3_height) { isAlive = false; }
            }
            else {
                // if Boss hasn't arrived at a certain position
                if (y < 0.25 * Boss_height) {
                    y += speed;
                }
                if (y >= 0.25 * Boss_height) {
                    // move left and right 
                    if (x <= 0 || x + Boss_width >= BG3_width) {
                        // if Boss tends to touch the edge, turn around  
                        speed = -speed;
                    }
                    x += speed;
                }
            }
        }
        else {
            // Handle explosion animation  
            if (explosionFrameDisplayCount < frameDisplayCount) {
                explosionFrameDisplayCount++;
            }
            else {
                explosionFrame++;
                explosionFrameDisplayCount = 0;
            }
        }
    }

    // Add a method to check if the enemy is currently exploding  
    bool isExploding() const {
        return !isAlive && explosionFrame > 0;
    }

    void be_hit(int a) {
        HP -= a;
        if (HP <= 0) {
            isAlive = false;
            explosionFrame = 1;
        }
    }

    void fire(std::vector<Bullet>& bullets) {
        if (type == 2 || type == 3) {
            if (cooldown == 0) { // ensure only can enemy fire when the cooldown is 0
                bullets.emplace_back(x + width / 2 - 15, y + height, type + 2);
                bullets.emplace_back(x + width / 2 + 5, y + height, type + 2);
                cooldown = maxcooldown; // reset  
            }
            else {
                cooldown -= 3;
            }
        }
        else if (type == 4) {
            if (cooldown == 0) { // ensure only can Boss fire when the cooldown is 0
                bullets.emplace_back(x + width / 2 - 35, y + height, rand() % 2 + type); //random bullet
                bullets.emplace_back(x + width / 2 + 25, y + height, rand() % 2 + type);
                cooldown = maxcooldown; // reset  
            }
            else {
                cooldown -= 4;
            }
        } //Boss
        else if (type == 5 || type == 6) {
            if (cooldown == 0) { // ensure only can Boss fire when the cooldown is 0
                bullets.emplace_back(x + width / 2 - 35, y + height, 8); 
                cooldown = maxcooldown; // reset  
            }
            else {
                cooldown --;
            }
        } //Zoiger
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

    int get_type() const {
        return type;
    }

    bool get_isAlive() const {
        return isAlive;
    }

    int get_explosionFrame() const {
        return explosionFrame;
    }

private:
    int x, y, width, height, speed;
    int type;
    int cooldown;
    const int maxcooldown = 60;
    int HP;
    bool isAlive;
    int explosionFrame = 0;
};

#endif // ENEMY_H

