package com.portlogistics.model;

import java.time.LocalDateTime;

public class Berth {
    private int berthId;
    private String berthNumber;
    private int portId;
    private Integer currentVesselId;
    private String berthType;
    private Double maxLength;
    private Double maxDraft;
    private String status;
    private LocalDateTime arrivalTime;
    private LocalDateTime departureTime;
    private LocalDateTime createdAt;
    
    // 用于显示的关联名称（非数据库字段）
    private String portName;
    private String vesselName;

    public Berth() {}

    // Getters and Setters
    public int getBerthId() { return berthId; }
    public void setBerthId(int berthId) { this.berthId = berthId; }

    public String getBerthNumber() { return berthNumber; }
    public void setBerthNumber(String berthNumber) { this.berthNumber = berthNumber; }

    public int getPortId() { return portId; }
    public void setPortId(int portId) { this.portId = portId; }

    public Integer getCurrentVesselId() { return currentVesselId; }
    public void setCurrentVesselId(Integer currentVesselId) { this.currentVesselId = currentVesselId; }

    public String getBerthType() { return berthType; }
    public void setBerthType(String berthType) { this.berthType = berthType; }

    public Double getMaxLength() { return maxLength; }
    public void setMaxLength(Double maxLength) { this.maxLength = maxLength; }

    public Double getMaxDraft() { return maxDraft; }
    public void setMaxDraft(Double maxDraft) { this.maxDraft = maxDraft; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }


    public LocalDateTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalDateTime arrivalTime) { this.arrivalTime = arrivalTime; }

    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getPortName() { return portName; }
    public void setPortName(String portName) { this.portName = portName; }

    public String getVesselName() { return vesselName; }
    public void setVesselName(String vesselName) { this.vesselName = vesselName; }

    @Override
    public String toString() {
        return "Berth{berthId=" + berthId + ", berthNumber='" + berthNumber + "', portId=" + portId + 
               ", status='" + status + "'}";
    }
}
