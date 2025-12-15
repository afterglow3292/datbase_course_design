package com.portlogistics.model;

import java.time.LocalDateTime;
import java.util.Objects;

public class Cargo {
    private int cargoId;
    private String description;
    private double weight;
    private String destination;
    private Integer voyagePlanId;  // 外键：关联航次计划
    private Integer warehouseId;   // 外键：关联仓库
    private String cargoType;
    private String status;
    private LocalDateTime createdAt;
    
    // 用于显示的船舶名称（非数据库字段，通过JOIN查询获取）
    private String shipName;

    public Cargo() {}

    // Getters and Setters
    public int getCargoId() { return cargoId; }
    public void setCargoId(int cargoId) { this.cargoId = cargoId; }
    
    // 兼容旧代码
    public int getId() { return cargoId; }
    public void setId(int id) { this.cargoId = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public Integer getVoyagePlanId() { return voyagePlanId; }
    public void setVoyagePlanId(Integer voyagePlanId) { this.voyagePlanId = voyagePlanId; }

    public Integer getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Integer warehouseId) { this.warehouseId = warehouseId; }

    public String getCargoType() { return cargoType; }
    public void setCargoType(String cargoType) { this.cargoType = cargoType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // 兼容旧代码 - shipId 映射到 voyagePlanId
    public Integer getShipId() { return voyagePlanId; }
    public void setShipId(Integer shipId) { this.voyagePlanId = shipId; }
    
    // 船舶名称（通过JOIN查询获取）
    public String getShipName() { return shipName; }
    public void setShipName(String shipName) { this.shipName = shipName; }

    public boolean isAssigned() { return voyagePlanId != null; }

    @Override
    public String toString() {
        return "Cargo{cargoId=" + cargoId + ", description='" + description + "', weight=" + weight + 
               ", destination='" + destination + "', status='" + status + "'}";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Cargo cargo)) return false;
        return cargoId == cargo.cargoId;
    }

    @Override
    public int hashCode() { return Objects.hash(cargoId); }
}
