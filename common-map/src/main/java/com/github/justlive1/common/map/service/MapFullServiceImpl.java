package com.github.justlive1.common.map.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.github.justlive1.common.map.domain.Place;

/**
 * 地图全文搜索<br>
 * 调用百度地图接口
 * 
 * @author wubo
 *
 */
@Service("baiduMapFullService")
public class MapFullServiceImpl implements MapFullService {

	@Value("${map.full.url:http://map.baidu.com/?qt=s&wd={wd}#&ie=utf-8&t={t}}")
	private String fullUrl;

	@Autowired
	private RestTemplate template;

	@Override
	public List<Place> search(String keyword) {

		Map<String, Object> params = new HashMap<>();
		params.put("wd", keyword);
		params.put("t", System.currentTimeMillis());

		String response = template.getForObject(fullUrl, String.class, params);

		JSONObject json = new JSONObject(response);

		List<Place> list = new ArrayList<>();

		if (json.has("content")) {

			JSONArray content = json.getJSONArray("content");

			for (int i = 0, len = content.length(); i < len; i++) {

				JSONObject obj = content.getJSONObject(i);

				Place place = new Place();

				place.setAddr(obj.optString("addr"));
				place.setAreaName(obj.optString("area_name"));
				place.setDiPointX(obj.optString("diPointX"));
				place.setDiPointY(obj.optString("diPointY"));

				list.add(place);
			}
		}

		return list;
	}
}
