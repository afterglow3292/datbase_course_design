package com.portlogistics.model;

import java.time.LocalDateTime;

public class VoyagePlan {
    private int planId;
    private String voyageNumber;
    private int shipId;
    private String departurePort;
    private String arrivalPort;
    private Integer assignedBerthId;
    private LocalDateTime plannedDeparture;
    private LocalDateTime plannedArrival;
    private LocalDateTime actualDeparture;
    private LocalDateTime actualArrival;
    private String voyageStatus;
    private Integer createdBy;
    private LocalDateTime createdAt;

    public VoyagePlan() {}

    public VoyagePlan(int planId, String voyageNumber, int shipId, String departurePort, String arrivalPort,
                      Integer assignedBerthId, LocalDateTime plannedDeparture, LocalDateTime plannedArrival,
                      LocalDateTime actualDeparture, LocalDateTime actualArrival, String voyageStatus,
                      Integer createdBy, LocalDateTime createdAt) {
        this.planId = planId;
        this.voyageNumber = voyageNumber;
        this.shipId = shipId;
        this.departurePort = departurePort;
        this.arrivalPort = arrivalPort;
        this.assignedBerthId = assignedBerthId;
        this.plannedDeparture = plannedDeparture;
        this.plannedArrival = plannedArrival;
        this.actualDeparture = actualDeparture;
        this.actualArrival = actualArrival;
        this.voyageStatus = voyageStatus;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public int getPlanId() { return planId; }
    public void setPlanId(int planId) { this.planId = planId; }

    public String getVoyageNumber() { return voyageNumber; }
    public void setVoyageNumber(String voyageNumber) { this.voyageNumber = voyageNumber; }

    public int getShipId() { return shipId; }
    public void setShipId(int shipId) { this.shipId = shipId; }

    public String getDeparturePort() { return departurePort; }
    public void setDeparturePort(String departurePort) { this.departurePort = departurePort; }

    public String getArrivalPort() { return arrivalPort; }
    public void setArrivalPort(String arrivalPort) { this.arrivalPort = arrivalPort; }

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

    @Override
    public String toString() {
        return "VoyagePlan{" +
                "planId=" + planId +
                ", voyageNumber='" + voyageNumber + '\'' +
                ", shipId=" + shipId +
                ", departurePort='" + departurePort + '\'' +
                ", arrivalPort='" + arrivalPort + '\'' +
                ", voyageStatus='" + voyageStatus + '\'' +
                '}';
    }
}
