-- 运输任务表
CREATE TABLE IF NOT EXISTS transport_task (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    task_number VARCHAR(50) NOT NULL UNIQUE COMMENT '任务编号',
    cargo_id INT NULL COMMENT '关联货物ID',
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
    CONSTRAINT fk_task_cargo FOREIGN KEY (cargo_id) REFERENCES cargo(cargo_id)
);

CREATE INDEX idx_task_number ON transport_task(task_number);
CREATE INDEX idx_task_cargo ON transport_task(cargo_id);
CREATE INDEX idx_task_status ON transport_task(status);
CREATE INDEX idx_task_planned_pickup ON transport_task(planned_pickup);

-- 插入示例数据
INSERT INTO transport_task (task_number, cargo_id, truck_license, driver_name, driver_phone, pickup_location, delivery_location, planned_pickup, planned_delivery, status) VALUES
('TT2025001', 1, '沪A12345', '张三', '13800138001', '上海港A区仓库', '苏州工业园区', '2025-06-15 09:00:00', '2025-06-15 14:00:00', 'PENDING'),
('TT2025002', 2, '沪B67890', '李四', '13800138002', '上海港B区仓库', '杭州萧山区', '2025-06-16 08:00:00', '2025-06-16 12:00:00', 'PENDING')
ON DUPLICATE KEY UPDATE task_number = task_number;
