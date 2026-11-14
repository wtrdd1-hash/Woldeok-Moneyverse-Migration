package com.moneyverse.api.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success = true;
    private Boolean ok = true;
    private T data;
    private Object result;
    private String error;
    private String message;
    private String timestamp = Instant.now().toString();

    public ApiResponse() {
    }

    public ApiResponse(boolean success, T data, String error, String message, String timestamp) {
        this.success = success;
        this.ok = success;
        this.data = data;
        this.error = error;
        this.message = message;
        this.timestamp = timestamp != null ? timestamp : Instant.now().toString();
    }

    public static <T> ApiResponse<T> ok(T data) {
        ApiResponse<T> resp = new ApiResponse<>();
        resp.setSuccess(true);
        resp.setOk(true);
        resp.setData(data);
        return resp;
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        ApiResponse<T> resp = new ApiResponse<>();
        resp.setSuccess(true);
        resp.setOk(true);
        resp.setData(data);
        resp.setMessage(message);
        return resp;
    }

    public static <T> ApiResponse<T> okWithResult(T data, Object result, String message) {
        ApiResponse<T> resp = new ApiResponse<>();
        resp.setSuccess(true);
        resp.setOk(true);
        resp.setData(data);
        resp.setResult(result);
        resp.setMessage(message);
        return resp;
    }

    public static <T> ApiResponse<T> fail(String error, String message) {
        ApiResponse<T> resp = new ApiResponse<>();
        resp.setSuccess(false);
        resp.setOk(false);
        resp.setError(error);
        resp.setMessage(message);
        return resp;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
        this.ok = success;
    }

    public Boolean getOk() {
        return ok != null ? ok : success;
    }

    public void setOk(Boolean ok) {
        this.ok = ok;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public Object getResult() {
        return result;
    }

    public void setResult(Object result) {
        this.result = result;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
