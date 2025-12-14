package com.portlogistics.model;

import java.time.LocalDateTime;

public class TransportTask {
    private int taskId;
    private String taskNumber;
    private Integer cargoId;
    private String truckLicense;
    private String driverName;
    private String driverPhone;
    private String pickupLocation;
    private String deliveryLocation;
    private LocalDateTime plannedPickup;
    private LocalDateTime actualPickup;
    private LocalDateTime plannedDelivery;
    private LocalDateTime actualDelivery;
    private String status;
    private LocalDateTime createdAt;

    public TransportTask() {}

    public TransportTask(int taskId, String taskNumber, Integer cargoId, String truckLicense,
                         String driverName, String driverPhone, String pickupLocation,
                         String deliveryLocation, LocalDateTime plannedPickup, LocalDateTime actualPickup,
                         LocalDateTime plannedDelivery, LocalDateTime actualDelivery, String status,
                         LocalDateTime createdAt) {
        this.taskId = taskId;
        this.taskNumber = taskNumber;
        this.cargoId = cargoId;
        this.truckLicense = truckLicense;
        this.driverName = driverName;
        this.driverPhone = driverPhone;
        this.pickupLocation = pickupLocation;
        this.deliveryLocation = deliveryLocation;
        this.plannedPickup = plannedPickup;
        this.actualPickup = actualPickup;
        this.plannedDelivery = plannedDelivery;
        this.actualDelivery = actualDelivery;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public int getTaskId() { return taskId; }
    public void setTaskId(int taskId) { this.taskId = taskId; }

    public String getTaskNumber() { return taskNumber; }
    public void setTaskNumber(String taskNumber) { this.taskNumber = taskNumber; }

    public Integer getCargoId() { return cargoId; }
    public void setCargoId(Integer cargoId) { this.cargoId = cargoId; }

    public String getTruckLicense() { return truckLicense; }
    public void setTruckLicense(String truckLicense) { this.truckLicense = truckLicense; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public String getDeliveryLocation() { return deliveryLocation; }
    public void setDeliveryLocation(String deliveryLocation) { this.deliveryLocation = deliveryLocation; }

    public LocalDateTime getPlannedPickup() { return plannedPickup; }
    public void setPlannedPickup(LocalDateTime plannedPickup) { this.plannedPickup = plannedPickup; }

    public LocalDateTime getActualPickup() { return actualPickup; }
    public void setActualPickup(LocalDateTime actualPickup) { this.actualPickup = actualPickup; }

    public LocalDateTime getPlannedDelivery() { return plannedDelivery; }
    public void setPlannedDelivery(LocalDateTime plannedDelivery) { this.plannedDelivery = plannedDelivery; }

    public LocalDateTime getActualDelivery() { return actualDelivery; }
    public void setActualDelivery(LocalDateTime actualDelivery) { this.actualDelivery = actualDelivery; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public String toString() {
        return "TransportTask{" +
                "taskId=" + taskId +
                ", taskNumber='" + taskNumber + '\'' +
                ", cargoId=" + cargoId +
                ", truckLicense='" + truckLicense + '\'' +
                ", driverName='" + driverName + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}
