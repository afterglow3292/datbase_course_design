package com.portlogistics.controller;

import com.portlogistics.model.User;
import com.portlogistics.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");

            User user = authService.login(username, password);
            if (user != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "登录成功");
                response.put("user", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "role", user.getRole()
                ));
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "用户名或密码错误"
                ));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (SQLException e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "服务器错误：" + e.getMessage()
            ));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> credentials) {
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");

            User user = authService.register(username, password);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "注册成功",
                "user", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "role", user.getRole()
                )
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (SQLException e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "服务器错误：" + e.getMessage()
            ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "已退出登录"
        ));
    }
}
