-- 航次计划表
CREATE TABLE IF NOT EXISTS voyage_plan (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    voyage_number VARCHAR(50) NOT NULL UNIQUE COMMENT '航次编号',
    ship_id INT NOT NULL COMMENT '船舶ID',
    departure_port VARCHAR(100) NOT NULL COMMENT '出发港口',
    arrival_port VARCHAR(100) NOT NULL COMMENT '到达港口',
    assigned_berth_id INT NULL COMMENT '分配的泊位ID',
    planned_departure DATETIME NOT NULL COMMENT '计划出发时间',
    planned_arrival DATETIME NOT NULL COMMENT '计划到达时间',
    actual_departure DATETIME NULL COMMENT '实际出发时间',
    actual_arrival DATETIME NULL COMMENT '实际到达时间',
    voyage_status VARCHAR(30) NOT NULL DEFAULT 'PLANNED' COMMENT '航次状态：PLANNED/IN_PROGRESS/COMPLETED/CANCELLED',
    created_by INT NULL COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_voyage_ship FOREIGN KEY (ship_id) REFERENCES ship(ship_id),
    CONSTRAINT fk_voyage_berth FOREIGN KEY (assigned_berth_id) REFERENCES berth_schedule(berth_id),
    CONSTRAINT fk_voyage_user FOREIGN KEY (created_by) REFERENCES user(user_id)
);

CREATE INDEX idx_voyage_number ON voyage_plan(voyage_number);
CREATE INDEX idx_voyage_ship ON voyage_plan(ship_id);
CREATE INDEX idx_voyage_status ON voyage_plan(voyage_status);
CREATE INDEX idx_voyage_planned_departure ON voyage_plan(planned_departure);

-- 插入示例数据
INSERT INTO voyage_plan (voyage_number, ship_id, departure_port, arrival_port, planned_departure, planned_arrival, voyage_status) VALUES
('VY2025001', 1, '上海港', '宁波港', '2025-06-15 08:00:00', '2025-06-15 18:00:00', 'PLANNED'),
('VY2025002', 2, '深圳港', '香港港', '2025-06-16 10:00:00', '2025-06-16 14:00:00', 'PLANNED')
ON DUPLICATE KEY UPDATE voyage_number = voyage_number;
