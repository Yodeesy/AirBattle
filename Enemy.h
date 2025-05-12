#pragma once
#ifndef ENEMY_H
#define ENEMY_H

#define NOMINMAX

#include "Bullet.h"
#include <algorithm>
#include <cmath>
#include <vector>
#include <Windows.h>


//canvas
static int BG3_width = 700;
static int BG3_height = 890;


//enemy
static int Enemy_1_width = 57;
static int Enemy_1_height = 51;

static int Enemy_2_width = 90;
static int Enemy_2_height = 65;

static int Enemy_3_width = 100;
static int Enemy_3_height = 80;

static int Boss1_width = 222;
static int Boss1_height = 282;

static int Boss2_width = 250;
static int Boss2_height = 196;

static int Zoiger_width = 160;
static int Zoiger_height = 80;

static int Enemy_4_width = 60;
static int Enemy_4_height = 52;

static int Enemy_5_width = 100;
static int Enemy_5_height = 88;

static int meteorite_width = 30;
static int meteorite_height = 30;

class Enemy {
public:
    std::vector<Bullet> bullets;
    int explosionFrameDisplayCount = 0;
    int frameDisplayCount = 10;  //Times per frame
    int explosionFrames;

    Enemy() = default;

    Enemy(int type) : type(type), cooldown1(0), cooldown2(0) {

        switch (type) {

        case 1: //enemy1
            x = rand() % (BG3_width - Enemy_1_width);
            y = 0;
            width = Enemy_1_width;
            height = Enemy_1_height;
            speed = 7;
            HP = 5;
            isAlive = true;
            explosionFrames = 4;
            break;

        case 2: //enemy2
            x = rand() % (BG3_width - Enemy_2_width);
            y = 0;
            width = Enemy_2_width;
            height = Enemy_2_height;
            speed = 5;
            HP = 15;
            isAlive = true;
            explosionFrames = 7;
            break;

        case 3: //enemy3
            x = rand() % (BG3_width - Enemy_3_width);
            y = 0;
            width = Enemy_3_width;
            height = Enemy_3_height;
            speed = 9;
            HP = 20;
            isAlive = true;
            explosionFrames = 7;
            break;

        case 4: //Boss1
            x = 200;
            y = 5;
            width = Boss1_width;
            height = Boss1_height;
            speed = 5;
            HP = 1500;
            isAlive = true;
            explosionFrames = 29;
            break;

        case 5: //Zoiger1
            x = rand() % (BG3_width - Zoiger_width);
            y = 0;
            width = Zoiger_width;
            height = Zoiger_height;
            speed = 10;
            HP = 60;
            isAlive = true;
            explosionFrames = 8;
            break;

        case 6: //Zoiger2
            x = rand() % (BG3_width - Zoiger_width);
            y = 0;
            width = Zoiger_width;
            height = Zoiger_height;
            speed = 10;
            HP = 60;
            isAlive = true;
            explosionFrames = 8;
            break;

        case 7: //enemy4
            x = rand() % (BG3_width - Enemy_4_width);
            y = 0;
            width = Enemy_4_width;
            height = Enemy_4_height;
            speed = 9;
            HP = 25;
            isAlive = true;
            explosionFrames = 4;
            break;

        case 8: //enemy5
            x = rand() % (BG3_width - Enemy_5_width);
            y = 0;
            width = Enemy_5_width;
            height = Enemy_5_height;
            speed = 11;
            HP = 50;
            isAlive = true;
            explosionFrames = 7;
            break;

        case 9: //meteorite
            x = rand() % (BG3_width - meteorite_width);
            y = 0;
            width = meteorite_width;
            height = meteorite_height;
            speed = 7;
            HP = 20;
            isAlive = true;
            explosionFrames = 4;
            break;

        case 10: //Boss2
            x = 200;
            y = 5;
            width = Boss2_width;
            height = Boss2_height;
            speed = 5;
            HP = 2000;
            isAlive = true;
            explosionFrames = 29;
            break;

        case 11: //e1
            x = rand() % (BG3_width - 120);
            y = 0;
            width = 120;
            height = 88;
            speed = 10;
            HP = 75;
            isAlive = true;
            explosionFrames = 7;
            break;
        
        case 12: //e2
            x = rand() % (BG3_width - 120);
            y = 0;
            width = 120;
            height = 85;
            speed = 16;
            HP = 50;
            isAlive = true;
            explosionFrames = 7;
            break;

        case 13: //e3
            x = rand() % (BG3_width - 120);
            y = 0;
            width = 120;
            height = 90;
            speed = 15;
            HP = 45;
            isAlive = true;
            explosionFrames = 7;
            break;

        default:
            break;
        }

    }

    Enemy(Enemy&& other) noexcept :
        x(other.x), y(other.y), width(other.width), height(other.height), speed(other.speed),
        type(other.type), cooldown1(other.cooldown1), cooldown2(other.cooldown2), HP(other.HP), isAlive(other.isAlive),
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
            cooldown1 = other.cooldown1;
            cooldown2 = other.cooldown2;
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

    void freezed() {
        speed -= 1;
    }

    void update() {
        if (isAlive) {
            fire(bullets);
            if (type == 4) {
                // if Boss hasn't arrived at a certain position  
                if (y < 0.25 * Boss1_height) {
                    y += speed;
                }
                if (y >= 0.25 * Boss1_height) {
                    // Move left and right  
                    if (x <= 0 || x + Boss1_width >= BG3_width) {
                        // If Boss tends to touch the edge, turn around  
                        speed = -speed;
                    }
                    x += speed;
                }
            }
            else if (type == 10) {
                // if Boss hasn't arrived at a certain position  
                if (y < 0.25 * Boss2_height) {
                    y += speed;
                }
                if (y >= 0.25 * Boss2_height) {
                    // Move left and right  
                    if (x <= 0 || x + Boss2_width >= BG3_width) {
                        // If Boss tends to touch the edge, turn around  
                        speed = -speed;
                    }
                    x += speed;
                }
            }
            else {
                y += speed;

                // Handle sine wave movement
                if (type == 7 || type == 8 || type >= 11) {
                    double sineWaveOffset = std::sin(y * 0.01) * 15; // control frequency and amplitude 
                    x += sineWaveOffset;

                    // Optionally clamp x within screen bounds (BG width)  
                    x = std::max(0.0, static_cast<double>(std::min(x, BG3_width - Enemy_5_width)));
                }

                if (y > BG3_height) {
                    isAlive = false;
                    explosionFrame = explosionFrames;
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

    void Elight_update(Enemy* Boss) { //especially for Elight
        if (Boss != nullptr) {
            for (Bullet& bullet : Boss -> bullets) {
                if (bullet.get_type() == 9 && bullet.get_isActive()) { //Elight
                    if (Boss->get_type() == 4) {
                        bullet.set_x(Boss->get_x() + Boss->get_width() / 2 - 10);
                    }
                    else if (Boss->get_type() == 10) {
                        bullet.set_x(Boss->get_x() + Boss->get_width() / 2 - 90);
                        bullet.set_y(Boss->get_y() + Boss->get_height() - 5);
                    }
                    if (cooldown2 == maxcooldown / 2) {
                        bullet.be_hit();
                    }
                }
            }
        }
    }

    // Add a method to check if the enemy is currently exploding  
    bool isExploding() const {
        return !isAlive && explosionFrame > 0;
    }

    // Add a method to check if the enemy has finished exploding  
    bool isExplodingOver() const {
        return !isAlive && explosionFrame == explosionFrames;
    }

    void be_hit(int a) {
        HP -= a;
        if (HP <= 0) {
            isAlive = false;
            bullets.clear();
            bullets.shrink_to_fit();
            explosionFrame = 1;
        }
    }

    void fire(std::vector<Bullet>& bullets) {
        if (type == 2 || type == 3) {
            if (cooldown1 == 0) { // ensure only can enemy fire when the cooldown is 0
                bullets.emplace_back(x + width / 2 - 15, y + height, type + 2);
                bullets.emplace_back(x + width / 2 + 5, y + height, type + 2);
                cooldown1 = maxcooldown; // reset  
            }
            else {
                cooldown1 -= 3;
            }
        }
        else if (type == 4) {
            if (cooldown1 == 0) { // ensure only can Boss fire when the cooldown is 0
                bullets.emplace_back(x + width / 2 - 35, y + height, rand() % 2 + type); //random bullet
                bullets.emplace_back(x + width / 2 + 25, y + height, rand() % 2 + type);
                cooldown1 = maxcooldown; // reset  
            }
            else {
                cooldown1 -= 3;
            }
            if (HP <= 1000 && cooldown2 == 0) {
                bullets.emplace_back(x + width / 2 - 15, y + height / 2 + 15, 9); //Elight
                cooldown2 = maxcooldown;
            }
            else if (HP <= 1000 && cooldown2 > 0) {
                cooldown2 -= 1;
            }
        } //Boss1
        else if (type == 5 || type == 6) {
            if (cooldown1 == 0) { // ensure only can Boss fire when the cooldown is 0
                bullets.emplace_back(x + width / 2 - 35, y + height, 8); 
                cooldown1 = maxcooldown; // reset  
            }
            else {
                cooldown1 --;
            }
        } //Zoiger
        else if (type == 8) {
            if (cooldown1 == 0) { // ensure only can enemy fire when the cooldown is 0
                bullets.emplace_back(x + width / 2 - 5, y + height, 10);
                cooldown1 = maxcooldown; // reset  
            }
            else {
                cooldown1 -= 2;
            }
        } //enemy5
        else if (type == 10) {
            if (cooldown1 == 0) { // ensure only can Boss fire when the cooldown is 0
                bullets.emplace_back(x + width / 2 - 35, y + height, 10); //random bullet
                bullets.emplace_back(x + width / 2 + 25, y + height, 15);
                cooldown1 = maxcooldown; // reset  
            }
            else {
                cooldown1 -= 3;
            }
            if (HP <= 1500 && cooldown2 == 0) {
                bullets.emplace_back(x + width / 2 - 15, y + height / 2 + 15, 9); //Elight
                cooldown2 = maxcooldown;
            }
            else if (HP <= 1500 && cooldown2 > 0) {
                cooldown2 -= 1;
            }
        }//Boss2
        else if (type == 11 || type == 12) {
            if (cooldown1 <= 0) { // ensure only can Boss fire when the cooldown is 0
                bullets.emplace_back(x + width / 2 - 15, y + height, type + 5);
                cooldown1 = maxcooldown; // reset  
            }
            else {
                cooldown1 -= 3;
            }
        } //e1 and e2
        else if (type == 13) {
            if (cooldown1 <= 0) {
                bullets.emplace_back(x + width / 2 - 35, y + height / 2, 17);
                bullets.emplace_back(x + width / 2 + 10, y + height / 2, 17);
                cooldown1 = maxcooldown;
            }
            else {
                cooldown1 -= 3;
            }
            if (cooldown2 <= 0) {
                bullets.emplace_back(x + width / 2 - 5, y + height / 2, 18);
                cooldown2 = maxcooldown;
            }
            else {
                cooldown2 -= 6;
            }
        }//e3
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

    int get_HP() const {
        return HP;
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
    int cooldown1;
    int cooldown2;
    const int maxcooldown = 60;
    int HP;
    bool isAlive;
    int explosionFrame = 0;
};

#endif // ENEMY_H

