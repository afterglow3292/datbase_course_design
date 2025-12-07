package com.portlogistics.service;

import com.portlogistics.model.Warehouse;
import com.portlogistics.repository.WarehouseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;

@Service
public class WarehouseService {
    private final WarehouseRepository warehouseRepository;

    public WarehouseService(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    public List<Warehouse> getAllWarehouses() throws SQLException {
        return warehouseRepository.findAll();
    }

    public Warehouse getWarehouseById(int warehouseId) throws SQLException {
        return warehouseRepository.findById(warehouseId);
    }

    public List<Warehouse> searchWarehouses(String keyword) throws SQLException {
        if (keyword == null || keyword.trim().isEmpty()) {
            return warehouseRepository.findAll();
        }
        return warehouseRepository.search(keyword.trim());
    }

    public void createWarehouse(Warehouse warehouse) throws SQLException {
        validateWarehouse(warehouse);
        if (warehouse.getUsedCapacity() == null) {
            warehouse.setUsedCapacity(BigDecimal.ZERO);
        }
        warehouseRepository.save(warehouse);
    }

    public void updateWarehouse(Warehouse warehouse) throws SQLException {
        validateWarehouse(warehouse);
        warehouseRepository.update(warehouse);
    }

    public void deleteWarehouse(int warehouseId) throws SQLException {
        warehouseRepository.deleteById(warehouseId);
    }

    private void validateWarehouse(Warehouse warehouse) {
        if (warehouse.getWarehouseName() == null || warehouse.getWarehouseName().trim().isEmpty()) {
            throw new IllegalArgumentException("仓库名称不能为空");
        }
        if (warehouse.getWarehouseType() == null || warehouse.getWarehouseType().trim().isEmpty()) {
            throw new IllegalArgumentException("仓库类型不能为空");
        }
        if (warehouse.getTotalCapacity() == null || warehouse.getTotalCapacity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("总容量必须大于0");
        }
        if (warehouse.getUsedCapacity() != null && warehouse.getUsedCapacity().compareTo(warehouse.getTotalCapacity()) > 0) {
            throw new IllegalArgumentException("已用容量不能超过总容量");
        }
        if (warehouse.getUsedCapacity() != null && warehouse.getUsedCapacity().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("已用容量不能为负数");
        }
    }
}
