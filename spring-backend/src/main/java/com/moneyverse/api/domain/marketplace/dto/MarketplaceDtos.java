package com.moneyverse.api.domain.marketplace.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public class MarketplaceDtos {

    public static class ListingItem {
        private String id;
        private String sellerUserId;
        private String itemType;
        private String itemName;
        private String priceWld;
        private Integer quantity;
        private String status;
        private Instant createdAt;

        public ListingItem() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getSellerUserId() { return sellerUserId; }
        public void setSellerUserId(String sellerUserId) { this.sellerUserId = sellerUserId; }
        public String getItemType() { return itemType; }
        public void setItemType(String itemType) { this.itemType = itemType; }
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public String getPriceWld() { return priceWld; }
        public void setPriceWld(String priceWld) { this.priceWld = priceWld; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public static class CreateListingRequest {
        @NotBlank(message = "itemName is required")
        private String itemName;

        @NotBlank(message = "itemType is required")
        private String itemType;

        @NotNull(message = "priceWld is required")
        @Min(value = 1, message = "priceWld must be at least 1")
        @JsonAlias({"priceWld", "price_wld", "price"})
        private Long priceWld;

        @NotNull(message = "quantity is required")
        @Min(value = 1, message = "quantity must be at least 1")
        private Integer quantity;

        public CreateListingRequest() {}

        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public String getItemType() { return itemType; }
        public void setItemType(String itemType) { this.itemType = itemType; }
        public Long getPriceWld() { return priceWld; }
        public void setPriceWld(Long priceWld) { this.priceWld = priceWld; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
