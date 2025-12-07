-- 用户表
CREATE TABLE IF NOT EXISTS user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认管理员账户（密码：admin123）
INSERT INTO user (username, password, role) VALUES ('admin', 'admin123', 'ADMIN')
ON DUPLICATE KEY UPDATE username = username;

-- 插入测试用户（密码：user123）
INSERT INTO user (username, password, role) VALUES ('user', 'user123', 'USER')
ON DUPLICATE KEY UPDATE username = username;
