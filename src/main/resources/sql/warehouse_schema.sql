-- 仓库表
CREATE TABLE IF NOT EXISTS warehouse (
    warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL COMMENT '仓库名称',
    port_id INT NULL COMMENT '所属港口ID（预留）',
    warehouse_type VARCHAR(50) NOT NULL COMMENT '仓库类型：GENERAL/COLD/DANGEROUS/CONTAINER',
    total_capacity DECIMAL(12,2) NOT NULL COMMENT '总容量（立方米）',
    used_capacity DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '已用容量（立方米）',
    location VARCHAR(200) NULL COMMENT '仓库位置',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warehouse_name ON warehouse(warehouse_name);
CREATE INDEX idx_warehouse_type ON warehouse(warehouse_type);

-- 插入示例数据
INSERT INTO warehouse (warehouse_name, warehouse_type, total_capacity, used_capacity, location) VALUES
('A区综合仓库', 'GENERAL', 10000.00, 3500.00, '港口东区A-01'),
('B区冷藏仓库', 'COLD', 5000.00, 2000.00, '港口东区B-02'),
('C区危险品仓库', 'DANGEROUS', 3000.00, 800.00, '港口西区C-01'),
('D区集装箱堆场', 'CONTAINER', 20000.00, 12000.00, '港口南区D-01')
ON DUPLICATE KEY UPDATE warehouse_name = warehouse_name;
