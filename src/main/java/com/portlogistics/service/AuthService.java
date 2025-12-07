package com.portlogistics.service;

import com.portlogistics.model.User;
import com.portlogistics.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.sql.SQLException;

@Service
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User login(String username, String password) throws SQLException {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("用户名不能为空");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("密码不能为空");
        }

        User user = userRepository.findByUsername(username.trim());
        if (user == null) {
            return null; // 用户不存在
        }
        
        // 简单密码比对（生产环境应使用加密）
        if (user.getPassword().equals(password)) {
            return user;
        }
        return null; // 密码错误
    }

    public User register(String username, String password) throws SQLException {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("用户名不能为空");
        }
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("密码长度至少6位");
        }

        // 检查用户名是否已存在
        if (userRepository.findByUsername(username.trim()) != null) {
            throw new IllegalArgumentException("用户名已存在");
        }

        User user = new User();
        user.setUsername(username.trim());
        user.setPassword(password); // 生产环境应加密
        user.setRole("USER");
        userRepository.save(user);
        return user;
    }
}
