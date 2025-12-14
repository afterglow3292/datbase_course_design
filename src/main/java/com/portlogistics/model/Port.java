package com.portlogistics.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Port {
    private int portId;
    private String portCode;
    private String portName;
    private String country;
    private String city;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private int totalBerths;
    private BigDecimal maxVesselSize;
    private LocalDateTime createdAt;

    public Port() {}

    public Port(int portId, String portCode, String portName, String country, String city,
                BigDecimal latitude, BigDecimal longitude, int totalBerths, BigDecimal maxVesselSize,
                LocalDateTime createdAt) {
        this.portId = portId;
        this.portCode = portCode;
        this.portName = portName;
        this.country = country;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.totalBerths = totalBerths;
        this.maxVesselSize = maxVesselSize;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public int getPortId() { return portId; }
    public void setPortId(int portId) { this.portId = portId; }

    public String getPortCode() { return portCode; }
    public void setPortCode(String portCode) { this.portCode = portCode; }

    public String getPortName() { return portName; }
    public void setPortName(String portName) { this.portName = portName; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public int getTotalBerths() { return totalBerths; }
    public void setTotalBerths(int totalBerths) { this.totalBerths = totalBerths; }

    public BigDecimal getMaxVesselSize() { return maxVesselSize; }
    public void setMaxVesselSize(BigDecimal maxVesselSize) { this.maxVesselSize = maxVesselSize; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public String toString() {
        return "Port{" +
                "portId=" + portId +
                ", portCode='" + portCode + '\'' +
                ", portName='" + portName + '\'' +
                ", country='" + country + '\'' +
                ", city='" + city + '\'' +
                ", totalBerths=" + totalBerths +
                '}';
    }
}
