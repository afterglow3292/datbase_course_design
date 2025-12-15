-- =====================================================
-- 港口物流管理系统 - 完整数据库结构
-- 按照正确的外键关系创建表
-- =====================================================

-- 设置字符集为UTF-8（支持中文）
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 修改数据库字符集（如果数据库已存在）
ALTER DATABASE port_logistics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 禁用外键检查（解决删除表时的外键约束问题）
SET FOREIGN_KEY_CHECKS = 0;

-- 删除现有表（包括旧表名）
DROP TABLE IF EXISTS transport_task;
DROP TABLE IF EXISTS cargo;
DROP TABLE IF EXISTS voyage_plan;
DROP TABLE IF EXISTS warehouse;
DROP TABLE IF EXISTS berth;
DROP TABLE IF EXISTS berth_schedule;  -- 旧表名
DROP TABLE IF EXISTS ship;
DROP TABLE IF EXISTS port;
DROP TABLE IF EXISTS user;

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. 用户表 (Users) - 基础表，无外键
-- =====================================================
CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    role VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT '角色：ADMIN/USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '用户表';

-- =====================================================
-- 2. 港口表 (Ports) - 基础表，无外键
-- =====================================================
CREATE TABLE port (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '港口表';

CREATE INDEX idx_port_code ON port(port_code);
CREATE INDEX idx_port_country ON port(country);

-- =====================================================
-- 3. 船舶表 (Ships) - 基础表，无外键
-- =====================================================
CREATE TABLE ship (
    ship_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '船舶名称',
    imo VARCHAR(20) NOT NULL UNIQUE COMMENT 'IMO编号',
    capacity_teu INT NOT NULL COMMENT '容量(TEU)',
    status VARCHAR(30) NOT NULL COMMENT '状态：ARRIVED/AT_SEA/SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '船舶表';

CREATE INDEX idx_ship_imo ON ship(imo);
CREATE INDEX idx_ship_status ON ship(status);


-- =====================================================
-- 4. 泊位表 (Berths) - 外键：port_id, current_vessel_id
-- =====================================================
CREATE TABLE berth (
    berth_id INT AUTO_INCREMENT PRIMARY KEY,
    berth_number VARCHAR(20) NOT NULL COMMENT '泊位编号',
    port_id INT NOT NULL COMMENT '所属港口ID',
    current_vessel_id INT NULL COMMENT '当前停靠船舶ID',
    berth_type VARCHAR(30) NULL COMMENT '泊位类型',
    max_length DECIMAL(10, 2) NULL COMMENT '最大可停靠长度(米)',
    max_draft DECIMAL(10, 2) NULL COMMENT '最大吃水深度(米)',
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE' COMMENT '状态：AVAILABLE/OCCUPIED/MAINTENANCE',
    arrival_time DATETIME NULL COMMENT '到港时间',
    departure_time DATETIME NULL COMMENT '离港时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_berth_port FOREIGN KEY (port_id) REFERENCES port(port_id) ON DELETE CASCADE,
    CONSTRAINT fk_berth_vessel FOREIGN KEY (current_vessel_id) REFERENCES ship(ship_id) ON DELETE SET NULL,
    UNIQUE KEY uk_port_berth (port_id, berth_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '泊位表';

CREATE INDEX idx_berth_port ON berth(port_id);
CREATE INDEX idx_berth_status ON berth(status);
CREATE INDEX idx_berth_vessel ON berth(current_vessel_id);

-- =====================================================
-- 5. 仓库表 (Warehouses) - 外键：port_id
-- =====================================================
CREATE TABLE warehouse (
    warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL COMMENT '仓库名称',
    port_id INT NOT NULL COMMENT '所属港口ID',
    warehouse_type VARCHAR(50) NOT NULL COMMENT '仓库类型：GENERAL/COLD/DANGEROUS/CONTAINER',
    total_capacity DECIMAL(12, 2) NOT NULL COMMENT '总容量（立方米）',
    used_capacity DECIMAL(12, 2) NOT NULL DEFAULT 0 COMMENT '已用容量（立方米）',
    location VARCHAR(200) NULL COMMENT '仓库位置',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_warehouse_port FOREIGN KEY (port_id) REFERENCES port(port_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '仓库表';

CREATE INDEX idx_warehouse_port ON warehouse(port_id);
CREATE INDEX idx_warehouse_type ON warehouse(warehouse_type);

-- =====================================================
-- 6. 航次计划表 (Voyage_Plans) - 外键：ship_id, departure_port_id, arrival_port_id, assigned_berth_id, created_by
-- =====================================================
CREATE TABLE voyage_plan (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    voyage_number VARCHAR(50) NOT NULL UNIQUE COMMENT '航次编号',
    ship_id INT NOT NULL COMMENT '船舶ID',
    departure_port_id INT NOT NULL COMMENT '出发港口ID',
    arrival_port_id INT NOT NULL COMMENT '到达港口ID',
    assigned_berth_id INT NULL COMMENT '分配的泊位ID',
    planned_departure DATETIME NOT NULL COMMENT '计划出发时间',
    planned_arrival DATETIME NOT NULL COMMENT '计划到达时间',
    actual_departure DATETIME NULL COMMENT '实际出发时间',
    actual_arrival DATETIME NULL COMMENT '实际到达时间',
    voyage_status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED' COMMENT '航次状态：SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED',
    created_by INT NULL COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_voyage_ship FOREIGN KEY (ship_id) REFERENCES ship(ship_id) ON DELETE CASCADE,
    CONSTRAINT fk_voyage_departure_port FOREIGN KEY (departure_port_id) REFERENCES port(port_id),
    CONSTRAINT fk_voyage_arrival_port FOREIGN KEY (arrival_port_id) REFERENCES port(port_id),
    CONSTRAINT fk_voyage_berth FOREIGN KEY (assigned_berth_id) REFERENCES berth(berth_id) ON DELETE SET NULL,
    CONSTRAINT fk_voyage_user FOREIGN KEY (created_by) REFERENCES user(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '航次计划表';

CREATE INDEX idx_voyage_number ON voyage_plan(voyage_number);
CREATE INDEX idx_voyage_ship ON voyage_plan(ship_id);
CREATE INDEX idx_voyage_departure_port ON voyage_plan(departure_port_id);
CREATE INDEX idx_voyage_arrival_port ON voyage_plan(arrival_port_id);
CREATE INDEX idx_voyage_status ON voyage_plan(voyage_status);


-- =====================================================
-- 7. 货物表 (Cargos) - 外键：voyage_plan_id, warehouse_id
-- =====================================================
CREATE TABLE cargo (
    cargo_id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL COMMENT '货物描述',
    weight DECIMAL(10, 2) NOT NULL COMMENT '重量(吨)',
    destination VARCHAR(100) NOT NULL COMMENT '目的地',
    voyage_plan_id INT NULL COMMENT '所属航次计划ID',
    warehouse_id INT NULL COMMENT '存储仓库ID',
    cargo_type VARCHAR(50) NULL COMMENT '货物类型',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' COMMENT '状态：PENDING/IN_TRANSIT/DELIVERED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cargo_voyage FOREIGN KEY (voyage_plan_id) REFERENCES voyage_plan(plan_id) ON DELETE SET NULL,
    CONSTRAINT fk_cargo_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '货物表';

CREATE INDEX idx_cargo_voyage ON cargo(voyage_plan_id);
CREATE INDEX idx_cargo_warehouse ON cargo(warehouse_id);
CREATE INDEX idx_cargo_destination ON cargo(destination);
CREATE INDEX idx_cargo_status ON cargo(status);

-- =====================================================
-- 8. 运输任务表 (Transport_Tasks) - 外键：cargo_id
-- =====================================================
CREATE TABLE transport_task (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    task_number VARCHAR(50) NOT NULL UNIQUE COMMENT '任务编号',
    cargo_id INT NOT NULL COMMENT '关联货物ID',
    truck_license VARCHAR(20) NOT NULL COMMENT '车牌号',
    driver_name VARCHAR(50) NOT NULL COMMENT '司机姓名',
    driver_phone VARCHAR(20) NULL COMMENT '司机电话',
    pickup_location VARCHAR(200) NOT NULL COMMENT '取货地点',
    delivery_location VARCHAR(200) NOT NULL COMMENT '交付地点',
    planned_pickup DATETIME NULL COMMENT '计划取货时间',
    actual_pickup DATETIME NULL COMMENT '实际取货时间',
    planned_delivery DATETIME NULL COMMENT '计划交付时间',
    actual_delivery DATETIME NULL COMMENT '实际交付时间',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' COMMENT '任务状态：PENDING/IN_TRANSIT/DELIVERED/CANCELLED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_cargo FOREIGN KEY (cargo_id) REFERENCES cargo(cargo_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '运输任务表';

CREATE INDEX idx_task_number ON transport_task(task_number);
CREATE INDEX idx_task_cargo ON transport_task(cargo_id);
CREATE INDEX idx_task_status ON transport_task(status);

-- =====================================================
-- 插入示例数据
-- =====================================================

-- 用户数据
INSERT INTO user (username, password, role) VALUES 
('admin', 'admin123', 'ADMIN'),
('user', 'user123', 'USER'),
('operator', 'operator123', 'USER');

-- 港口数据
INSERT INTO port (port_code, port_name, country, city, latitude, longitude, total_berths, max_vessel_size) VALUES
('CNSHA', '上海港', '中国', '上海', 31.2304, 121.4737, 125, 400.00),
('CNNBO', '宁波舟山港', '中国', '宁波', 29.8683, 121.5440, 98, 380.00),
('CNSZX', '深圳港', '中国', '深圳', 22.5431, 114.0579, 65, 350.00),
('CNQIN', '青岛港', '中国', '青岛', 36.0671, 120.3826, 72, 360.00),
('HKHKG', '香港港', '中国香港', '香港', 22.2855, 114.1577, 45, 320.00),
('SGSIN', '新加坡港', '新加坡', '新加坡', 1.2644, 103.8200, 67, 400.00);

-- 船舶数据
INSERT INTO ship (name, imo, capacity_teu, status) VALUES
('东方之星', 'IMO9876543', 8000, 'ARRIVED'),
('海洋巨人', 'IMO9876544', 12000, 'AT_SEA'),
('远洋先锋', 'IMO9876545', 6500, 'SCHEDULED'),
('长江号', 'IMO9876546', 4500, 'ARRIVED');


-- 泊位数据（关联港口和船舶）
INSERT INTO berth (berth_number, port_id, current_vessel_id, berth_type, max_length, max_draft, status, arrival_time, departure_time) VALUES
('A-01', 1, 1, 'CONTAINER', 350.00, 15.00, 'OCCUPIED', '2025-06-10 08:00:00', NULL),
('A-02', 1, NULL, 'CONTAINER', 320.00, 14.00, 'AVAILABLE', NULL, NULL),
('A-03', 1, 4, 'GENERAL', 280.00, 12.00, 'OCCUPIED', '2025-06-12 10:00:00', NULL),
('B-01', 2, NULL, 'CONTAINER', 380.00, 16.00, 'AVAILABLE', NULL, NULL),
('B-02', 2, NULL, 'BULK', 300.00, 13.00, 'MAINTENANCE', NULL, NULL),
('C-01', 3, NULL, 'CONTAINER', 340.00, 14.50, 'AVAILABLE', NULL, NULL);

-- 仓库数据（关联港口）
INSERT INTO warehouse (warehouse_name, port_id, warehouse_type, total_capacity, used_capacity, location) VALUES
('上海港A区综合仓库', 1, 'GENERAL', 10000.00, 3500.00, '上海港东区A-01'),
('上海港B区冷藏仓库', 1, 'COLD', 5000.00, 2000.00, '上海港东区B-02'),
('上海港C区危险品仓库', 1, 'DANGEROUS', 3000.00, 800.00, '上海港西区C-01'),
('宁波港集装箱堆场', 2, 'CONTAINER', 20000.00, 12000.00, '宁波港南区D-01'),
('深圳港综合仓库', 3, 'GENERAL', 8000.00, 4000.00, '深圳港A区');

-- 航次计划数据（关联船舶、港口、泊位、用户）
INSERT INTO voyage_plan (voyage_number, ship_id, departure_port_id, arrival_port_id, assigned_berth_id, planned_departure, planned_arrival, voyage_status, created_by) VALUES
('VY2025001', 1, 1, 2, 1, '2025-06-15 08:00:00', '2025-06-15 18:00:00', 'SCHEDULED', 1),
('VY2025002', 2, 3, 5, NULL, '2025-06-16 10:00:00', '2025-06-16 14:00:00', 'IN_PROGRESS', 1),
('VY2025003', 3, 2, 1, NULL, '2025-06-18 06:00:00', '2025-06-18 16:00:00', 'SCHEDULED', 2),
('VY2025004', 4, 1, 3, 3, '2025-06-20 09:00:00', '2025-06-21 08:00:00', 'SCHEDULED', 1);

-- 货物数据（关联航次计划、仓库）
INSERT INTO cargo (description, weight, destination, voyage_plan_id, warehouse_id, cargo_type, status) VALUES
('电子产品', 150.50, '宁波', 1, 1, 'GENERAL', 'PENDING'),
('冷冻海鲜', 80.00, '香港', 2, 2, 'COLD', 'IN_TRANSIT'),
('化工原料', 200.00, '上海', 3, 3, 'DANGEROUS', 'PENDING'),
('服装纺织品', 120.00, '深圳', 4, 1, 'GENERAL', 'PENDING'),
('机械设备', 500.00, '青岛', 1, 4, 'GENERAL', 'PENDING');

-- 运输任务数据（关联货物）
INSERT INTO transport_task (task_number, cargo_id, truck_license, driver_name, driver_phone, pickup_location, delivery_location, planned_pickup, planned_delivery, status) VALUES
('TT2025001', 1, '沪A12345', '张三', '13800138001', '上海港A区仓库', '宁波工业园区', '2025-06-15 09:00:00', '2025-06-15 14:00:00', 'PENDING'),
('TT2025002', 2, '粤B67890', '李四', '13800138002', '深圳港B区仓库', '香港九龙', '2025-06-16 08:00:00', '2025-06-16 12:00:00', 'IN_TRANSIT'),
('TT2025003', 4, '沪C11111', '王五', '13800138003', '上海港A区仓库', '深圳南山区', '2025-06-20 10:00:00', '2025-06-21 18:00:00', 'PENDING');
