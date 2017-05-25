package com.github.justlive1.common.map.domain;

import lombok.Data;

/**
 * 返回结果
 * 
 * @author wubo
 *
 * @param <T>
 */
@Data
public class Response<T> {

	public static final String SUCCESS_CODE = "0";

	private String code;
	private String msg;
	private T content;

	public static <T> Response<T> success(T t) {
		Response<T> resp = new Response<>();
		resp.setCode(SUCCESS_CODE);
		resp.setContent(t);
		return resp;
	}

	public static <T> Response<T> fail(String code, String msg) {
		Response<T> resp = new Response<>();
		resp.setCode(code);
		resp.setMsg(msg);
		return resp;
	}
}
