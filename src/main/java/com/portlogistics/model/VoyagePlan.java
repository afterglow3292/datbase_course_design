package com.portlogistics.model;

import java.time.LocalDateTime;

public class VoyagePlan {
    private int planId;
    private String voyageNumber;
    private int shipId;
    private int departurePortId;  // 改为外键ID
    private int arrivalPortId;    // 改为外键ID
    private Integer assignedBerthId;
    private LocalDateTime plannedDeparture;
    private LocalDateTime plannedArrival;
    private LocalDateTime actualDeparture;
    private LocalDateTime actualArrival;
    private String voyageStatus;
    private Integer createdBy;
    private LocalDateTime createdAt;
    
    // 用于显示的港口名称（非数据库字段）
    private String departurePortName;
    private String arrivalPortName;
    // 用于显示的船舶名称（非数据库字段）
    private String shipName;

    public VoyagePlan() {}

    // Getters and Setters
    public int getPlanId() { return planId; }
    public void setPlanId(int planId) { this.planId = planId; }

    public String getVoyageNumber() { return voyageNumber; }
    public void setVoyageNumber(String voyageNumber) { this.voyageNumber = voyageNumber; }

    public int getShipId() { return shipId; }
    public void setShipId(int shipId) { this.shipId = shipId; }

    public int getDeparturePortId() { return departurePortId; }
    public void setDeparturePortId(int departurePortId) { this.departurePortId = departurePortId; }

    public int getArrivalPortId() { return arrivalPortId; }
    public void setArrivalPortId(int arrivalPortId) { this.arrivalPortId = arrivalPortId; }

    public Integer getAssignedBerthId() { return assignedBerthId; }
    public void setAssignedBerthId(Integer assignedBerthId) { this.assignedBerthId = assignedBerthId; }

    public LocalDateTime getPlannedDeparture() { return plannedDeparture; }
    public void setPlannedDeparture(LocalDateTime plannedDeparture) { this.plannedDeparture = plannedDeparture; }

    public LocalDateTime getPlannedArrival() { return plannedArrival; }
    public void setPlannedArrival(LocalDateTime plannedArrival) { this.plannedArrival = plannedArrival; }

    public LocalDateTime getActualDeparture() { return actualDeparture; }
    public void setActualDeparture(LocalDateTime actualDeparture) { this.actualDeparture = actualDeparture; }

    public LocalDateTime getActualArrival() { return actualArrival; }
    public void setActualArrival(LocalDateTime actualArrival) { this.actualArrival = actualArrival; }

    public String getVoyageStatus() { return voyageStatus; }
    public void setVoyageStatus(String voyageStatus) { this.voyageStatus = voyageStatus; }

    public Integer getCreatedBy() { return createdBy; }
    public void setCreatedBy(Integer createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getDeparturePortName() { return departurePortName; }
    public void setDeparturePortName(String departurePortName) { this.departurePortName = departurePortName; }

    public String getArrivalPortName() { return arrivalPortName; }
    public void setArrivalPortName(String arrivalPortName) { this.arrivalPortName = arrivalPortName; }

    public String getShipName() { return shipName; }
    public void setShipName(String shipName) { this.shipName = shipName; }

    @Override
    public String toString() {
        return "VoyagePlan{planId=" + planId + ", voyageNumber='" + voyageNumber + "', shipId=" + shipId + 
               ", departurePortId=" + departurePortId + ", arrivalPortId=" + arrivalPortId + 
               ", voyageStatus='" + voyageStatus + "'}";
    }
}
