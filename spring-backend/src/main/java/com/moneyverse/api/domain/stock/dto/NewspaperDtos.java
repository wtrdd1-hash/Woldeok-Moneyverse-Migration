package com.moneyverse.api.domain.stock.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class NewspaperDtos {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class NewspaperPulseData {
        @JsonProperty("sentimentScore")
        private int sentimentScore;

        @JsonProperty("sentimentLabel")
        private String sentimentLabel;

        @JsonProperty("activeEventsCount")
        private int activeEventsCount;

        @JsonProperty("leadHeadline")
        private String leadHeadline;

        @JsonProperty("leadSummary")
        private String leadSummary;

        @JsonProperty("updatedAt")
        private String updatedAt;

        public NewspaperPulseData() {}

        public NewspaperPulseData(int sentimentScore, String sentimentLabel, int activeEventsCount,
                                  String leadHeadline, String leadSummary, String updatedAt) {
            this.sentimentScore = sentimentScore;
            this.sentimentLabel = sentimentLabel;
            this.activeEventsCount = activeEventsCount;
            this.leadHeadline = leadHeadline;
            this.leadSummary = leadSummary;
            this.updatedAt = updatedAt;
        }

        public int getSentimentScore() { return sentimentScore; }
        public void setSentimentScore(int sentimentScore) { this.sentimentScore = sentimentScore; }
        public String getSentimentLabel() { return sentimentLabel; }
        public void setSentimentLabel(String sentimentLabel) { this.sentimentLabel = sentimentLabel; }
        public int getActiveEventsCount() { return activeEventsCount; }
        public void setActiveEventsCount(int activeEventsCount) { this.activeEventsCount = activeEventsCount; }
        public String getLeadHeadline() { return leadHeadline; }
        public void setLeadHeadline(String leadHeadline) { this.leadHeadline = leadHeadline; }
        public String getLeadSummary() { return leadSummary; }
        public void setLeadSummary(String leadSummary) { this.leadSummary = leadSummary; }
        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class NewspaperPulseResponse {
        @JsonProperty("success")
        private boolean success;

        @JsonProperty("data")
        private NewspaperPulseData data;

        public NewspaperPulseResponse() {}
        public NewspaperPulseResponse(boolean success, NewspaperPulseData data) {
            this.success = success;
            this.data = data;
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public NewspaperPulseData getData() { return data; }
        public void setData(NewspaperPulseData data) { this.data = data; }
    }

    public static class PollOption {
        @JsonProperty("id")
        private String id;

        @JsonProperty("label")
        private String label;

        @JsonProperty("votes")
        private int votes;

        @JsonProperty("percentage")
        private int percentage;

        public PollOption() {}
        public PollOption(String id, String label, int votes, int percentage) {
            this.id = id;
            this.label = label;
            this.votes = votes;
            this.percentage = percentage;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public int getVotes() { return votes; }
        public void setVotes(int votes) { this.votes = votes; }
        public int getPercentage() { return percentage; }
        public void setPercentage(int percentage) { this.percentage = percentage; }
    }

    public static class NewspaperPollData {
        @JsonProperty("id")
        private String id;

        @JsonProperty("question")
        private String question;

        @JsonProperty("options")
        private List<PollOption> options;

        @JsonProperty("totalVotes")
        private int totalVotes;

        public NewspaperPollData() {}
        public NewspaperPollData(String id, String question, List<PollOption> options, int totalVotes) {
            this.id = id;
            this.question = question;
            this.options = options;
            this.totalVotes = totalVotes;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public List<PollOption> getOptions() { return options; }
        public void setOptions(List<PollOption> options) { this.options = options; }
        public int getTotalVotes() { return totalVotes; }
        public void setTotalVotes(int totalVotes) { this.totalVotes = totalVotes; }
    }

    public static class PollVoteRequest {
        @JsonProperty("optionId")
        private String optionId;

        public PollVoteRequest() {}
        public PollVoteRequest(String optionId) { this.optionId = optionId; }
        public String getOptionId() { return optionId; }
        public void setOptionId(String optionId) { this.optionId = optionId; }
    }

    public static class FinancialLoreItem {
        @JsonProperty("id")
        private String id;

        @JsonProperty("category")
        private String category;

        @JsonProperty("title")
        private String title;

        @JsonProperty("summary")
        private String summary;

        @JsonProperty("readTimeMinutes")
        private int readTimeMinutes;

        public FinancialLoreItem() {}
        public FinancialLoreItem(String id, String category, String title, String summary, int readTimeMinutes) {
            this.id = id;
            this.category = category;
            this.title = title;
            this.summary = summary;
            this.readTimeMinutes = readTimeMinutes;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
        public int getReadTimeMinutes() { return readTimeMinutes; }
        public void setReadTimeMinutes(int readTimeMinutes) { this.readTimeMinutes = readTimeMinutes; }
    }
}
