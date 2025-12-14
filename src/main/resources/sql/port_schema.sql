-- 港口表
CREATE TABLE IF NOT EXISTS port (
    port_id INT AUTO_INCREMENT PRIMARY KEY,
    port_code VARCHAR(20) NOT NULL UNIQUE COMMENT '港口代码',
    port_name VARCHAR(100) NOT NULL COMMENT '港口名称',
    country VARCHAR(50) NOT NULL COMMENT '国家',
    city VARCHAR(50) NULL COMMENT '城市',
    latitude DECIMAL(10, 7) NULL COMMENT '纬度',
    longitude DECIMAL(10, 7) NULL COMMENT '经度',
    total_berths INT NOT NULL DEFAULT 0 COMMENT '泊位总数',
    max_vessel_size DECIMAL(10, 2) NULL COMMENT '最大可停靠船舶尺寸(米)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_port_code ON port(port_code);
CREATE INDEX idx_port_country ON port(country);
CREATE INDEX idx_port_name ON port(port_name);

-- 插入示例数据
INSERT INTO port (port_code, port_name, country, city, latitude, longitude, total_berths, max_vessel_size) VALUES
('CNSHA', '上海港', '中国', '上海', 31.2304, 121.4737, 125, 400.00),
('CNNBO', '宁波舟山港', '中国', '宁波', 29.8683, 121.5440, 98, 380.00),
('CNSZX', '深圳港', '中国', '深圳', 22.5431, 114.0579, 65, 350.00),
('CNQIN', '青岛港', '中国', '青岛', 36.0671, 120.3826, 72, 360.00),
('CNTXG', '天津港', '中国', '天津', 38.9860, 117.7278, 85, 340.00),
('HKHKG', '香港港', '中国香港', '香港', 22.2855, 114.1577, 45, 320.00),
('SGSIN', '新加坡港', '新加坡', '新加坡', 1.2644, 103.8200, 67, 400.00),
('KRPUS', '釜山港', '韩国', '釜山', 35.1028, 129.0403, 55, 380.00)
ON DUPLICATE KEY UPDATE port_code = port_code;
