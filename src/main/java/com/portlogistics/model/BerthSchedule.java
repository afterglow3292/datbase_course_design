package com.portlogistics.model;

import java.time.LocalDateTime;

public final class BerthSchedule {
    private final int berth_id;
    private final int shipId;
    private final String berthNumber;
    private final LocalDateTime arrivalTime;
    private final LocalDateTime departureTime;
    private final String status;

    public BerthSchedule(int berth_id, int shipId, String berthNumber, LocalDateTime arrivalTime,
                         LocalDateTime departureTime, String status) {
        this.berth_id = berth_id;
        this.shipId = shipId;
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

    @Override
    public String toString() {
        return "BerthSchedule{" +
                "id=" + berth_id +
                ", shipId=" + shipId +
                ", berthNumber='" + berthNumber + '\'' +
                ", arrivalTime=" + arrivalTime +
                ", departureTime=" + departureTime +
                ", status='" + status + '\'' +
                '}';
    }
}
