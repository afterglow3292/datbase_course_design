-- =====================================================
-- 插入示例数据（需要先设置字符集）
-- =====================================================

SET NAMES utf8mb4;

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
