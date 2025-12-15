package com.portlogistics.model;

import java.time.LocalDateTime;

public final class BerthSchedule {
    private final int berth_id;
    private final int shipId;
    private final int portId;
    private final String berthNumber;
    private final LocalDateTime arrivalTime;
    private final LocalDateTime departureTime;
    private final String status;
    private String portName; // 港口名称（用于显示）
    private String shipName; // 船舶名称（用于显示）

    public BerthSchedule(int berth_id, int shipId, int portId, String berthNumber, LocalDateTime arrivalTime,
                         LocalDateTime departureTime, String status) {
        this.berth_id = berth_id;
        this.shipId = shipId;
        this.portId = portId;
        this.berthNumber = berthNumber;
        this.arrivalTime = arrivalTime;
        this.departureTime = departureTime;
        this.status = status;
    }

    public int getId() {
        return berth_id;
    }

    public int getShipId() {
        return shipId;
    }

    public int getPortId() {
        return portId;
    }

    public String getBerthNumber() {
        return berthNumber;
    }

    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }

    public LocalDateTime getDepartureTime() {
        return departureTime;
    }

    public String getStatus() {
        return status;
    }

    public String getPortName() {
        return portName;
    }

    public void setPortName(String portName) {
        this.portName = portName;
    }

    public String getShipName() {
        return shipName;
    }

    public void setShipName(String shipName) {
        this.shipName = shipName;
    }

    @Override
    public String toString() {
        return "BerthSchedule{" +
                "id=" + berth_id +
                ", shipId=" + shipId +
                ", portId=" + portId +
                ", berthNumber='" + berthNumber + '\'' +
                ", arrivalTime=" + arrivalTime +
                ", departureTime=" + departureTime +
                ", status='" + status + '\'' +
                '}';
    }
}
