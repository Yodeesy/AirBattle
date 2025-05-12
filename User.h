#pragma once
#ifndef USER_H
#define UER_H

#include <algorithm> 
#include <string>
#include <fstream>  
#include <iostream>
#include <sstream>

class User {
public:
    std::vector<bool> fighters_owned;
    std::vector<bool> levels_passed;

    User() = default;

    User(const std::string& username) : username(username), amount(0) {
        fighters_owned.resize(12, false); //fighters owned
        fighters_owned[0] = true; //default
        levels_passed.resize(8, false); //levels passed
    }

    std::string get_username() const {
        return username;
    }

    int get_amount() const {
        return amount;
    }

    void update_amount(int score) {
        amount += score;
    }

    void set_amount(int n) {
        if (n >= 0) {
            amount = n;
        }
    }

    static void SaveOrUpdateToFile(const User& user) {
        std::ifstream ifs("user_data.txt");
        std::ofstream ofs("temp_user_data.txt");
        std::string line, name;
        bool found = false;

        while (std::getline(ifs, line)) {
            std::istringstream iss(line);
            if (!(iss >> name) || name.empty()) continue; // �������л���û���¼  

            if (name == user.get_username()) {
                found = true;

                //username and amount  
                ofs << user.get_username() << '\n' << user.get_amount() << '\n';

                // fighters owned
                for (bool owned : user.fighters_owned) {
                    ofs << (owned ? '1' : '0') << ' ';
                }
                ofs << '\n';

                // levels passed  
                for (bool passed : user.levels_passed) {
                    ofs << (passed ? '1' : '0') << ' ';
                }
                ofs << '\n';

                // ������ǰ�û���ʣ���У�����еĻ���  
                std::string dummy;
                while (std::getline(ifs, dummy) && !dummy.empty()) {}
            }
            else {
                // �������Ŀ���û�����ֱ��д����ʱ�ļ�  
                ofs << line << '\n';
            }
        }

        // ���δ�ҵ�Ŀ���û��������ļ�ĩβ����¼�¼  
        if (!found) {
            ofs << user.get_username() << '\n' << user.get_amount() << '\n';
            for (bool owned : user.fighters_owned) {
                ofs << (owned ? '1' : '0') << ' ';
            }
            ofs << '\n';
            for (bool passed : user.levels_passed) {
                ofs << (passed ? '1' : '0') << ' ';
            }
            ofs << '\n';
        }

        // �ر��ļ����滻ԭ�ļ�  
        ifs.close();
        ofs.close();
        remove("user_data.txt");
        rename("temp_user_data.txt", "user_data.txt");
    }

    static User loadFromFile(const std::string& username) {
        std::ifstream ifs("user_data.txt");
        std::string name;
        int score;
        int I;

        // check if the file has been opened sucessfully
        if (!ifs) {
            std::cerr << "Cannot open user_data.txt" << std::endl;
            return User(username); // return a new user  
        }

        while (std::getline(ifs, name)) {
            if (name == username) {
                ifs >> score;
                User user(username);
                user.set_amount(score);
                for (int i = 0; i < 12; ++i) {
                    ifs >> I;
                    user.fighters_owned[i] = (I == 1? true : false);
                }
                for (int i = 0; i < 8; ++i) {
                    ifs >> I;
                    user.levels_passed[i] = (I == 1 ? true : false);
                }
                ifs.close();
                return user;
            }
        }
        ifs.close();
        return User(username); // establish a new account  
    }

private:
    std::string username;
    int amount;
};

void menu();
void muyu();
void shop();
void upgrade(int type);
void map();
void gameLoop();

#endif // USER_H

