package com.github.justlive1.common.map.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.github.justlive1.common.map.domain.Place;
import com.github.justlive1.common.map.domain.Response;
import com.github.justlive1.common.map.service.MapFullService;

/**
 * 地图全文搜索
 * 
 * @author wubo
 *
 */
@RestController
@RequestMapping("/mapFull")
public class MapFullController {

	@Autowired
	private MapFullService mapFullService;

	@RequestMapping(value = "/search", produces = "application/json; charset=UTF-8")
	public Response<?> search(String keyword) {

		if (StringUtils.isEmpty(keyword)) {
			return Response.fail("-1", "参数为空！");
		}

		try {

			List<Place> list = mapFullService.search(keyword);

			return Response.success(list);

		} catch (Exception e) {

			return Response.fail("-2", "查询失败！");
		}

	}
}
