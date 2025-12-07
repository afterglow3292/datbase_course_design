package com.portlogistics.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Warehouse {
    private int warehouseId;
    private String warehouseName;
    private Integer portId;
    private String warehouseType;
    private BigDecimal totalCapacity;
    private BigDecimal usedCapacity;
    private String location;
    private LocalDateTime createdAt;

    public Warehouse() {}

    public Warehouse(int warehouseId, String warehouseName, Integer portId, String warehouseType,
                     BigDecimal totalCapacity, BigDecimal usedCapacity, String location, LocalDateTime createdAt) {
        this.warehouseId = warehouseId;
        this.warehouseName = warehouseName;
        this.portId = portId;
        this.warehouseType = warehouseType;
        this.totalCapacity = totalCapacity;
        this.usedCapacity = usedCapacity;
        this.location = location;
        this.createdAt = createdAt;
    }

    public int getWarehouseId() { return warehouseId; }
    public void setWarehouseId(int warehouseId) { this.warehouseId = warehouseId; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

    public Integer getPortId() { return portId; }
    public void setPortId(Integer portId) { this.portId = portId; }

    public String getWarehouseType() { return warehouseType; }
    public void setWarehouseType(String warehouseType) { this.warehouseType = warehouseType; }

    public BigDecimal getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(BigDecimal totalCapacity) { this.totalCapacity = totalCapacity; }

    public BigDecimal getUsedCapacity() { return usedCapacity; }
    public void setUsedCapacity(BigDecimal usedCapacity) { this.usedCapacity = usedCapacity; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // 计算剩余容量
    public BigDecimal getAvailableCapacity() {
        if (totalCapacity == null || usedCapacity == null) return BigDecimal.ZERO;
        return totalCapacity.subtract(usedCapacity);
    }

    // 计算使用率
    public double getUsageRate() {
        if (totalCapacity == null || totalCapacity.compareTo(BigDecimal.ZERO) == 0) return 0;
        return usedCapacity.divide(totalCapacity, 4, java.math.RoundingMode.HALF_UP).doubleValue() * 100;
    }

    @Override
    public String toString() {
        return "Warehouse{" +
                "warehouseId=" + warehouseId +
                ", warehouseName='" + warehouseName + '\'' +
                ", warehouseType='" + warehouseType + '\'' +
                ", totalCapacity=" + totalCapacity +
                ", usedCapacity=" + usedCapacity +
                '}';
    }
}
